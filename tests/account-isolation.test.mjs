import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer} from '../game/engine.mjs';

import {nearestSystems} from '../game/sovereignty.mjs';

// Construct the actual pre-grand-power schema, rather than deleting one marker
// from a fully populated modern galaxy.
function beforeGrandPowers(world){
 for(const [id,p]of Object.entries(world.planets))if(id.startsWith('nation:starbay:')||id.startsWith('grand:')||/^commander:(zenith|obsidian):/.test(id)){
  if(!id.startsWith('grand:frontier:'))delete world.sovereignty.claims[p.position.slice(0,2).join(':')];delete world.planets[id];
 }
 for(const id of Object.keys(world.players))if(id==='nation:starbay'||/^commander:(zenith|obsidian):/.test(id))delete world.players[id];
 if(world.strategic)for(const [id,m]of Object.entries(world.strategic.mines))if(!world.planets[m.planet])delete world.strategic.mines[id];
 delete world.grandPowers;delete world.galacticEconomy;delete world.factionWars;delete world.minorNations;
 world.sovereignty.safeSystems=nearestSystems(world.sovereignty.anchor);
}

const root=path.resolve(import.meta.dirname,'..');
test('legacy strategic upgrade backs up the original account/session and atomic trade survives save failure and duplicate confirmation',async()=>{
 const world=createWorld(),player=createPlayer(world,'测试_旧账号外交迁移'),home=world.planets[player.home];
 home.resources=[1e8,1e8,1e8];home.ships={Destroyer:7,Interceptor:3};player.tech.Weapons_Tech=12;
 beforeGrandPowers(world);delete world.market;delete world.strategic;for(const p of Object.values(world.players)){delete p.strategicResources;delete p.cityState;}
 const original=JSON.stringify(world),dir=fs.mkdtempSync(path.join(os.tmpdir(),'empire-strategic-upgrade-')),file=path.join(dir,'universe.json'),session=file+'.session';
 fs.writeFileSync(file,original);fs.writeFileSync(session,'{}');
 const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');const port=listener.address().port;await new Promise(r=>listener.close(r));
 const base=`http://127.0.0.1:${port}`,env={...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file,EMPIRE_SESSION_FILE:session,EMPIRE_SERVER_LOG:file+'.log'};delete env.EMPIRE_MANAGED_STDIN;
 const child=spawn(process.execPath,['server.mjs'],{cwd:root,env,windowsHide:true,stdio:['ignore','pipe','pipe']});let errors='';child.stderr.on('data',b=>errors+=b);
 const headers={Origin:base,'X-Empire-Client':'galactic-command','Content-Type':'application/json'},post=body=>fetch(base+'/api/action',{method:'POST',headers,body:JSON.stringify(body)}),state=async()=>await(await fetch(base+'/api/state',{headers})).json();
 try{
  await new Promise((resolve,reject)=>{let output='';const timer=setTimeout(()=>reject(Error('startup timeout '+errors)),10000);timer.unref();child.stdout.on('data',b=>{output+=b;if(output.includes(`http://localhost:${port}/`)){clearTimeout(timer);resolve();}});child.once('exit',code=>{clearTimeout(timer);reject(Error('startup exit '+code+' '+errors));});});
  const backup=fs.readdirSync(dir).find(n=>n.includes('.before-strategic-trade-')&&n.endsWith('.bak'));assert(backup);assert.equal(fs.readFileSync(path.join(dir,backup),'utf8'),original);assert.equal(fs.readFileSync(path.join(dir,backup+'.session'),'utf8'),'{}');
  const bootstrap=await fetch(base+'/api/session/local',{method:'POST',headers});assert.equal(bootstrap.status,200);assert.equal((await bootstrap.json()).source,'local');
  const initial=await state();assert.equal(initial.player.id,player.id);assert.equal(initial.player.tech.Weapons_Tech,12);assert.deepEqual(initial.planets.find(p=>p.id===home.id).ships,home.ships);
  const partner=initial.diplomacy.partners.find(p=>p.leader==='艾琳');assert.equal(partner.kind,'城邦');
  assert.equal((await post({type:'trade',mode:'propose',planet:partner.home,partner:partner.id,give:[100000,0,0,0,0,0,0,0,0],take:[0,100,0,0,0,0,0,0,0]})).status,400);
  const proposed=await post({type:'trade',mode:'propose',planet:home.id,partner:partner.id,give:[100000,0,0,0,0,0,0,0,0],take:[0,100,0,0,0,0,0,0,0]});assert.equal(proposed.status,200);const quoted=await proposed.json(),offer=quoted.diplomacy.offer;
  const action={type:'trade',mode:'accept',planet:home.id,offer:offer.id};fs.mkdirSync(file+'.tmp');
  try{const failed=await post(action);assert.equal(failed.status,400);const after=await state();assert.equal(after.diplomacy.offer.id,offer.id);assert.deepEqual(after.planets.find(p=>p.id===home.id).resources,home.resources);}finally{fs.rmdirSync(file+'.tmp');}
  const attempts=await Promise.all([post(action),post(action)]);assert.deepEqual(attempts.map(r=>r.status).sort(),[200,400]);
  const completed=await state();assert.equal(completed.diplomacy.offer,null);assert.deepEqual(completed.planets.find(p=>p.id===home.id).resources,[1e8-100000,1e8+100,1e8]);
  const listing=completed.market.orders.find(o=>o.kind==='trade'&&o.status==='open'),fill={type:'market',planet:home.id,mode:'fill',order:listing.id};assert(listing);
  fs.mkdirSync(file+'.tmp');
  try{
   assert.equal((await post(fill)).status,400);const failed=await state();
   assert.equal(failed.market.orders.find(o=>o.id===listing.id).status,'open');
   assert.deepEqual(failed.market.operator.fees,completed.market.operator.fees);
   for(const key of ["paid","pending","pool"])assert.deepEqual(failed.market.equity[key],completed.market.equity[key]);
   assert.deepEqual(failed.planets.find(p=>p.id===home.id).resources,completed.planets.find(p=>p.id===home.id).resources);
  }finally{fs.rmdirSync(file+'.tmp');}
  const marketAttempts=await Promise.all([post(fill),post(fill)]);assert.deepEqual(marketAttempts.map(r=>r.status).sort(),[200,400]);
  const traded=await state();assert.equal(traded.market.orders.find(o=>o.id===listing.id).status,'completed');
  assert.deepEqual(traded.market.operator.fees,completed.market.operator.fees.map((n,i)=>n+listing.fee[i]));
  assert.deepEqual(traded.planets.find(p=>p.id===home.id).resources,completed.planets.find(p=>p.id===home.id).resources.map((n,i)=>n+listing.give[i]-listing.take[i]));
  const exit=once(child,'exit');assert.equal((await fetch(base+'/api/launcher/stop',{method:'POST',headers})).status,200);await exit;
  const disk=JSON.parse(fs.readFileSync(file,'utf8'));assert.equal(Object.values(disk.players).filter(p=>!p.bot).length,1);assert.equal(disk.players[player.id].name,player.name);assert.equal(disk.strategic.version,1);assert.equal(disk.market.version,1);
  for(let i=0;i<9;i++)assert(Math.abs(Object.values(disk.galacticEconomy.accounts).reduce((s,a)=>s+a.paid[i]+a.pending[i],0)-disk.galacticEconomy.fees[i])<1e-8);
 }finally{if(child.exitCode===null){child.kill();await once(child,'exit');}assert(path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(dir,{recursive:true,force:true});}
});
test('isolated saves own their sessions; anonymous polling and lost sessions never duplicate accounts',async()=>{
  const personalFile=path.join(root,'data/session.json');
  const personalBefore=fs.existsSync(personalFile)?fs.readFileSync(personalFile):null;
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'empire-accounts-')),file=path.join(dir,'universe.json');
  const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');
  const port=listener.address().port;await new Promise(resolve=>listener.close(resolve));
  const env={...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file};
  delete env.EMPIRE_SESSION_FILE;delete env.EMPIRE_MANAGED_STDIN;delete env.EMPIRE_SERVER_LOG;
  const child=spawn(process.execPath,['server.mjs'],{cwd:root,env,windowsHide:true,stdio:['ignore','pipe','pipe']});
  let errors='';child.stderr.on('data',data=>{errors+=data;});
  const base=`http://127.0.0.1:${port}`,headers={Origin:base,'X-Empire-Client':'galactic-command'};
  try{
    await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error(errors);})]);
    assert.equal((await(await fetch(base+'/api/health')).json()).isolated,true);
    for(let i=0;i<4;i++)for(const route of ['/api/state','/api/unknown']){
      const response=await fetch(base+route);
      assert.equal(response.status,401);assert.equal(response.headers.get('set-cookie'),null);
    }
    assert.equal((await(await fetch(base+'/api/launcher/status',{headers})).json()).accounts.length,0);
    for(let i=0;i<3;i++){
      const response=await fetch(base+'/api/session/local',{method:'POST',headers});
      assert.equal(response.status,200);assert.deepEqual(await response.json(),{source:i?'local':'new',name:'测试指挥官'});
    }
    const session=fs.readFileSync(file+'.session','utf8');
    const first=await(await fetch(base+'/api/state',{headers})).json();
    for(const content of [null,'{broken json','{}']){
      if(content===null)fs.unlinkSync(file+'.session');else fs.writeFileSync(file+'.session',content);
      assert.equal((await fetch(base+'/api/state',{headers})).status,401);
      assert.deepEqual(await(await fetch(base+'/api/session/local',{method:'POST',headers})).json(),{source:'local',name:'测试指挥官'});
      assert.equal(fs.readFileSync(file+'.session','utf8'),session);
      assert.equal((await(await fetch(base+'/api/state',{headers})).json()).player.id,first.player.id);
    }
    const exited=once(child,'exit');
    assert.equal((await fetch(base+'/api/launcher/stop',{method:'POST',headers})).status,200);
    await exited;
    assert.equal(Object.values(JSON.parse(fs.readFileSync(file)).players).filter(p=>!p.bot).length,1);
    assert.equal(errors,'');
    if(personalBefore)assert.deepEqual(fs.readFileSync(personalFile),personalBefore);
    else assert.equal(fs.existsSync(personalFile),false);
  }finally{
    if(child.exitCode===null){child.kill();await once(child,'exit');}
    assert.ok(path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(dir,{recursive:true,force:true});
  }
  assert.equal(fs.existsSync(dir),false,'Test accounts and sessions must be removed with their fixture');
});

test('an isolated server rejects the personal session path before opening a save',async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'empire-session-guard-')),file=path.join(dir,'universe.json');
  const child=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,EMPIRE_SAVE_FILE:file,EMPIRE_SESSION_FILE:path.join(root,'data/session.json')},windowsHide:true,stdio:['ignore','pipe','pipe']});
  let error='';child.stderr.on('data',data=>{error+=data;});child.stdout.resume();
  try{
    const [code]=await once(child,'exit');assert.notEqual(code,0);assert.match(error,/测试存档不能共用个人账号会话/);assert.equal(fs.existsSync(file),false);
  }finally{
    assert.ok(path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(dir,{recursive:true,force:true});
  }
});
