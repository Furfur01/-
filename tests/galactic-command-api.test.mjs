import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import vm from 'node:vm';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer} from '../game/engine.mjs';

test('local bridge resumes Local progress without returning its cookie and retains legacy APIs',async()=>{
  const world=createWorld(),local=createPlayer(world,'Local progress'),browser=createPlayer(world,'Browser progress');
  world.planets[local.home].buildings.Command_Center=3;
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'empire-bridge-'));
  const file=path.join(directory,'universe.json'),session=path.join(directory,'session.json');
  fs.writeFileSync(file,JSON.stringify(world));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${local.id}`}));
  const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');
  const port=listener.address().port;await new Promise(resolve=>listener.close(resolve));
  const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file,EMPIRE_SESSION_FILE:session},windowsHide:true,stdio:['ignore','pipe','pipe']});
  const base=`http://127.0.0.1:${port}`;
  let errors='';child.stderr.on('data',chunk=>{errors+=chunk;});
  try{
    await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw new Error(errors);}),new Promise((_,reject)=>{const timer=setTimeout(()=>reject(new Error('server startup timeout')),10000);timer.unref();})]);
    const headers={Origin:base,'X-Empire-Client':'galactic-command','Content-Type':'application/json',Cookie:`empire=${browser.id}`};
    const beforeProbe=fs.readFileSync(file,'utf8');
    const probe=await fetch(base+'/api/health');
    assert.equal(probe.status,200);assert.equal(probe.headers.get('set-cookie'),null);
    assert.equal(probe.headers.get('cache-control'),'no-store');
    const health=await probe.json();
    assert.equal(health.service,'galaxy-empire');assert.equal(health.status,'running');
    assert.equal(health.pid,child.pid);assert.equal(health.port,port);
    assert.ok(health.uptime>=0);
    assert.equal((await fetch(base+'/api/health',{method:'POST'})).status,405);
    assert.equal(fs.readFileSync(file,'utf8'),beforeProbe);
    for(const route of ['/api/session/local','/api/session/godot'])for(const options of [{},{method:'POST'},{method:'POST',headers:{...headers,Origin:'http://foreign.invalid'}},{method:'POST',headers:{...headers,'X-Empire-Client':'foreign'}},{method:'POST',headers:{...headers,'Sec-Fetch-Site':'cross-site'}}]){
      assert.equal((await fetch(base+route,options)).status,403);
    }
    const result=await fetch(base+'/api/session/local',{method:'POST',headers,body:'{}'});
    assert.equal(result.status,200);
    assert.deepEqual(await result.json(),{source:'local',name:local.name});
    const alias=await fetch(base+'/api/session/godot',{method:'POST',headers});
    assert.equal(alias.status,200);assert.deepEqual(await alias.json(),{source:'local',name:local.name});
    assert.equal(alias.headers.get('set-cookie'),result.headers.get('set-cookie'));
    assert.match(result.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
    const cookie=result.headers.get('set-cookie').split(';')[0];
    const state=await(await fetch(base+'/api/state',{headers:{Cookie:cookie}})).json();
    assert.equal(state.player.name,local.name);assert.equal(state.planets[0].buildings.Command_Center,3);
    assert.equal((await fetch(base+'/api/action',{method:'POST',headers:{...headers,Cookie:cookie},body:JSON.stringify({type:'readAll'})})).status,200);
    assert.equal(Object.keys(JSON.parse(fs.readFileSync(file)).players).length,Object.keys(world.players).length);
    // Simulate the embedded browser dropping cookies on every refresh.
    for(let i=0;i<5;i++){const response=await fetch(base+'/api/state',{headers:{'X-Empire-Client':'galactic-command','Sec-Fetch-Site':'same-origin'}});const stable=await response.json();assert.equal(stable.player.id,local.id);assert.equal(stable.player.home,local.home);}
    const stale=await(await fetch(base+'/api/state',{headers})).json();assert.equal(stale.player.id,local.id,'tagged UI keeps disk session even with an obsolete browser cookie');
    const rejected=await fetch(base+'/api/state',{headers:{Origin:'http://foreign.invalid','X-Empire-Client':'galactic-command'}});assert.equal(rejected.status,403);
    await fetch(base+'/api/action',{method:'POST',headers:{...headers,Cookie:undefined},body:JSON.stringify({type:'readAll'})});
    assert.equal(Object.keys(JSON.parse(fs.readFileSync(file)).players).length,Object.keys(world.players).length,'cookie loss must not create new commanders');
    for(const route of ['/api/state','/api/missing','/api/battle-trial','/api/battles/00000000-0000-4000-8000-000000000099','/api/battles/00000000-0000-4000-8000-000000000099/events','/api/replay/missing']){
      const unauthenticated=await fetch(base+route);assert.equal(unauthenticated.status,401);assert.equal(unauthenticated.headers.get('set-cookie'),null);
    }
    await fetch(base+'/api/action',{method:'POST',headers,body:JSON.stringify({type:'readAll'})});
    assert.equal(Object.keys(JSON.parse(fs.readFileSync(file)).players).length,Object.keys(world.players).length,'old battle tabs must not register players on reconnect');
    fs.writeFileSync(session,'{}');
    assert.deepEqual(await(await fetch(base+'/api/session/local',{method:'POST',headers})).json(),{source:'browser',name:browser.name});
    assert.equal(JSON.parse(fs.readFileSync(session)).cookie,`empire=${browser.id}`,'browser recovery must persist the session');
    const resumed=await fetch(base+'/api/session/local',{method:'POST',headers:{Origin:base,'X-Empire-Client':'galactic-command'}});
    assert.deepEqual(await resumed.json(),{source:'local',name:browser.name});
    fs.writeFileSync(session,'{}');
    const ambiguous=await fetch(base+'/api/session/local',{method:'POST',headers:{Origin:base,'X-Empire-Client':'galactic-command'}});
    assert.equal(ambiguous.status,409,'a lost session with multiple accounts requires selecting one, never another account');
    assert.equal(Object.keys(JSON.parse(fs.readFileSync(file)).players).length,Object.keys(world.players).length);
    assert.equal((await fetch(base+'/opendesign/index.html')).status,200);
    for(const name of ['/data/session.json','/data/universe.json','/godot/data/session.json'])assert.equal((await fetch(base+name)).status,404);
  }finally{
    child.kill();await once(child,'exit');
    assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(directory,{recursive:true,force:true});
  }
});

function client(fetch){
  const window={},storage=new Map(),intervals=[];
  vm.runInNewContext(fs.readFileSync(new URL('../opendesign/mockups/galactic-command/api.js',import.meta.url),'utf8'),{
    window,fetch,console,AbortController,setTimeout,clearTimeout,setInterval:fn=>{intervals.push(fn);return intervals.length;},
    document:{hidden:false,addEventListener(){}},localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)}
  });
  return {api:window.EmpireAPI,intervals};
}
const snapshot=(now=1)=>({now,player:{home:'home'},planets:[{id:'home',name:'新地球'},{id:'colony',name:'霜原'}]});
const response=(data,ok=true)=>({ok,json:async()=>data});

test('browser adapter ignores stale polls, blocks duplicate actions and exposes failures without rejected promises',async()=>{
  let poll,act,mode='init';const calls=[];
  const {api}=client(async(url,options)=>{
    calls.push({url,options});
    if(url==='/api/session/local')return response({source:'local'});
    if(url==='/api/catalog')return response({buildings:{},units:{}});
    if(url==='/api/action')return new Promise(resolve=>{act=resolve;});
    if(mode==='init')return response(snapshot());
    if(mode==='offline')throw new Error('offline');
    return new Promise(resolve=>{poll=resolve;});
  });
  const changes=[];const stop=api.subscribe(value=>changes.push(value.busy));
  await api.init();assert.equal(api.sessionSource,'local');assert.equal(api.planet.name,'新地球');
  assert.equal(api.setPlanet('colony'),true);assert.equal(api.setPlanet('missing'),false);
  mode='pending';const pending=api.refresh();
  const action=api.action({type:'build',id:'Metal_Mine'});
  assert.equal(api.busy,true);assert.equal(await api.action({type:'build'}),null);
  assert.equal(JSON.parse(calls.find(call=>call.url==='/api/action').options.body).planet,'colony');
  act(response(snapshot(3)));await action;
  poll(response(snapshot(2)));await pending;
  assert.equal(api.state.now,3);assert.equal(api.busy,false);
  const failed=api.action({type:'build'});act(response({error:'资源不足'},false));
  assert.equal(await failed,null);assert.equal(api.error,'资源不足');
  assert.equal(await api.refresh([0,500]),null);assert.equal(api.error,'星系坐标无效');
  mode='offline';assert.equal(await api.refresh(),null);assert.equal(api.connected,false);
  assert.ok(changes.includes(true));stop();
});

test('initial connection failures remain retryable by polling',async()=>{
  let online=false;
  const {api,intervals}=client(async url=>{
    if(!online)throw new Error('offline');
    return response(url==='/api/session/local'?{source:'local'}:url==='/api/catalog'?{units:{}}:snapshot());
  });
  assert.equal(await api.init(),null);assert.equal(api.loading,false);assert.equal(api.error,'offline');
  online=true;intervals[0]();await api.init();assert.equal(api.state.planets.length,2);assert.equal(api.error,'');
});
