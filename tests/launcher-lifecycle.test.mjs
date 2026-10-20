import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {once} from 'node:events';

const root=path.resolve(import.meta.dirname,'..');
async function fixture(){
  const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');
  const port=listener.address().port;await new Promise(resolve=>listener.close(resolve));
  assert.ok(![8289,8390].includes(port),'Tests must not use game or preview ports');
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'empire-lifecycle-'));
  return {port,dir,file:path.join(dir,'universe.json'),base:`http://127.0.0.1:${port}`};
}
async function until(fn){
  for(let i=0;i<100;i++){if(await fn())return;await new Promise(resolve=>setTimeout(resolve,100));}
  throw Error('Lifecycle timeout');
}
for(const mode of ['close pipe','launcher crash'])test(`managed server saves and exits on ${mode}`,async()=>{
  const f=await fixture();
  const {createWorld,createPlayer}=await import('../game/engine.mjs');
  const world=createWorld();createPlayer(world,'启动器管道隔离测试');
  fs.writeFileSync(f.file,JSON.stringify(world));
  const env={...process.env,PORT:String(f.port),EMPIRE_SAVE_FILE:f.file,EMPIRE_SESSION_FILE:f.file+'.session',EMPIRE_MANAGED_STDIN:'1'};
  delete env.EMPIRE_SERVER_LOG;
  const parent=mode==='launcher crash';
  const script="const {spawn}=require('node:child_process');spawn(process.execPath,['server.mjs'],{stdio:['pipe','inherit','inherit'],windowsHide:true,detached:true});";
  const proc=spawn(process.execPath,parent?['-e',script]:['server.mjs'],{cwd:root,env,windowsHide:true,stdio:['pipe','pipe','pipe']});
  let errors='';proc.stdout.resume();proc.stderr.on('data',d=>{errors+=d;});
  let serverPid;
  try{
    await until(async()=>{try{const h=await(await fetch(f.base+'/api/health')).json();serverPid=h.pid;return h.managed;}catch{return false;}});
    for(let i=0;i<4;i++){const unauth=await fetch(f.base+'/api/state');assert.equal(unauth.status,401);assert.equal(unauth.headers.get('set-cookie'),null);}
    const headers={Origin:f.base,'X-Empire-Client':'galactic-command'};
    assert.equal((await fetch(f.base+'/api/session/local',{method:'POST',headers})).status,200);
    const state=await(await fetch(f.base+'/api/state',{headers})).json();
    // Bootstrap resumes the fixture player; no-cookie polling must never create more.
    assert.ok(state.player.id);
    if(parent)proc.kill();else proc.stdin.end();
    await until(async()=>{try{await fetch(f.base+'/api/health');return false;}catch{return true;}});
    assert.ok(fs.existsSync(f.file),errors||'Missing shutdown save');
    const saved=JSON.parse(fs.readFileSync(f.file,'utf8'));
    assert.equal(saved.players[state.player.id].name,state.player.name);assert.equal(Object.values(saved.players).filter(p=>!p.bot).length,1);
    await until(()=>{try{process.kill(serverPid,0);return false;}catch{return true;}});
  }finally{
    if(proc.exitCode===null)proc.kill();
    if(serverPid)try{process.kill(serverPid);}catch{}
    assert.ok(f.dir.startsWith(os.tmpdir()+path.sep));fs.rmSync(f.dir,{recursive:true,force:true});
  }
});


const headersFor=f=>({Origin:f.base,'X-Empire-Client':'galactic-command','Content-Type':'application/json'});
async function stop(f){
  const response=await fetch(f.base+'/api/launcher/stop',{method:'POST',headers:headersFor(f)});
  assert.equal(response.status,200);assert.equal((await response.json()).ok,true);
  await until(async()=>{try{await fetch(f.base+'/api/health');return false;}catch{return true;}});
}
function monitor(f,autoClose=true,extra=[],env=process.env){
  const powershell=path.join(process.env.SystemRoot,'System32','WindowsPowerShell','v1.0','powershell.exe');
  return spawn(powershell,['-NoProfile','-STA','-ExecutionPolicy','Bypass','-File',path.join(root,'启动游戏.ps1'),...(autoClose?['-LifecycleTest']:[]),'-TestPort',String(f.port),'-TestSaveFile',f.file,...extra],{cwd:root,env,windowsHide:true,stdio:['ignore','pipe','pipe']});
}
test('Windows monitor can close and reopen without stopping or duplicating the server',{skip:process.platform!=='win32',timeout:60000},async()=>{
  const f=await fixture();let serverPid;
  try{
    for(let i=0;i<2;i++){
      const proc=monitor(f);let output='';proc.stdout.on('data',d=>{output+=d;});proc.stderr.on('data',d=>{output+=d;});
      try{const [code]=await once(proc,'exit');assert.equal(code,0,output);assert.match(output,/Lifecycle OK/);}
      finally{if(proc.exitCode===null)proc.kill();}
      const health=await(await fetch(f.base+'/api/health')).json();
      assert.equal(health.managed,false);if(serverPid)assert.equal(health.pid,serverPid);serverPid=health.pid;
    }
    // A forcibly terminated monitor is also independent of the existing service.
    const proc=monitor(f,false);proc.stdout.resume();proc.stderr.resume();
    await new Promise(resolve=>setTimeout(resolve,1500));proc.kill();await once(proc,'exit');
    assert.equal((await(await fetch(f.base+'/api/health')).json()).pid,serverPid);
    await stop(f);assert.ok(fs.existsSync(f.file));
  }finally{
    if(serverPid)try{process.kill(serverPid);}catch{}
    assert.ok(f.dir.startsWith(os.tmpdir()+path.sep));fs.rmSync(f.dir,{recursive:true,force:true});
  }
});

test('monitor observes external server, switches persisted accounts and saves on explicit stop',async()=>{
  const {createWorld,createPlayer}=await import('../game/engine.mjs');
  const f=await fixture(),world=createWorld(),first=createPlayer(world,'Launcher Test First'),second=createPlayer(world,'Launcher Test Second');
  fs.writeFileSync(f.file,JSON.stringify(world));fs.writeFileSync(f.file+'.session',JSON.stringify({cookie:'empire='+first.id}));
  const env={...process.env,PORT:String(f.port),EMPIRE_SAVE_FILE:f.file,EMPIRE_SESSION_FILE:f.file+'.session'};
  delete env.EMPIRE_MANAGED_STDIN;delete env.EMPIRE_SERVER_LOG;
  const proc=spawn(process.execPath,['server.mjs'],{cwd:root,env,windowsHide:true,stdio:['ignore','pipe','pipe']});proc.stdout.resume();proc.stderr.resume();
  try{
    await until(async()=>{try{return (await fetch(f.base+'/api/health')).ok;}catch{return false;}});
    const headers=headersFor(f),route=f.base+'/api/launcher/';
    for(const endpoint of ['status','account','stop']){
      const method=endpoint==='status'?'GET':'POST';
      for(const badHeaders of [{},{...headers,Origin:'https://foreign.invalid'},{...headers,'Sec-Fetch-Site':'cross-site'},{...headers,'X-Empire-Client':'foreign'}]){
        assert.equal((await fetch(route+endpoint,{method,headers:badHeaders})).status,403);
      }
    }
    const before=fs.readFileSync(f.file,'utf8');
    const statusResponse=await fetch(route+'status',{headers}),status=await statusResponse.json();
    assert.equal(statusResponse.headers.get('set-cookie'),null);assert.equal(status.accounts.length,2);assert.equal(status.pid,proc.pid);
    assert.equal(status.saveFile,f.file);assert.equal(status.managed,false);assert.match(status.log,/http/);
    assert.equal(JSON.stringify(status).includes(first.id),false,'status must not expose bearer credentials');
    assert.equal(fs.readFileSync(f.file,'utf8'),before,'monitor polling must not save or advance world');
    const secondKey=status.accounts.find(a=>a.name==='Launcher Test Second').key;
    assert.equal((await fetch(route+'account',{method:'POST',headers,body:'{'})).status,400);
    assert.equal((await fetch(route+'account',{method:'POST',headers,body:JSON.stringify({key:'missing'})})).status,404);
    assert.equal((await fetch(route+'account',{method:'POST',headers,body:JSON.stringify({key:secondKey})})).status,200);
    assert.equal(JSON.parse(fs.readFileSync(f.file+'.session','utf8')).cookie,'empire='+second.id);
    const state=await(await fetch(f.base+'/api/state',{headers:{...headers,Cookie:'empire='+first.id}})).json();
    assert.equal(state.player.id,second.id,'open game tabs follow the selected disk session despite stale cookies');
    const updated=await(await fetch(route+'status',{headers})).json();assert.equal(updated.currentAccount,secondKey);assert.match(updated.log,/Second/);
    await stop(f);
    assert.equal(Object.values(JSON.parse(fs.readFileSync(f.file,'utf8')).players).filter(p=>!p.bot).length,2);
  }finally{
    if(proc.exitCode===null){proc.kill();await once(proc,'exit');}
    assert.ok(f.dir.startsWith(os.tmpdir()+path.sep));fs.rmSync(f.dir,{recursive:true,force:true});
  }
});

test('restart button saves, replaces the process and preserves the selected account and progress',{skip:process.platform!=='win32',timeout:60000},async()=>{
  const {createWorld,createPlayer}=await import('../game/engine.mjs');
  const f=await fixture(),world=createWorld(),first=createPlayer(world,'重启隔离测试一'),selected=createPlayer(world,'重启隔离测试二');
  selected.tech.Weapons_Tech=7;
  world.planets[selected.home].ships={Recycler:9,Battleship:3};
  fs.writeFileSync(f.file,JSON.stringify(world));
  const session=JSON.stringify({cookie:'empire='+selected.id});fs.writeFileSync(f.file+'.session',session);
  const env={...process.env,PORT:String(f.port),EMPIRE_SAVE_FILE:f.file,EMPIRE_SESSION_FILE:f.file+'.session',EMPIRE_SERVER_LOG:f.file+'.log',EMPIRE_MANAGED_STDIN:'0'};
  const server=spawn(process.execPath,['server.mjs'],{cwd:root,env,windowsHide:true,stdio:'ignore'});
  let launcher,replacementPid;
  try{
    await until(async()=>{try{return (await fetch(f.base+'/api/health')).ok;}catch{return false;}});
    const before=await(await fetch(f.base+'/api/launcher/status',{headers:headersFor(f)})).json();
    const screenshots=path.join(root,'output','launcher');fs.mkdirSync(screenshots,{recursive:true});
    launcher=monitor(f,true,['-RestartTest','-TestScreenshot',path.join(screenshots,'restart.png')]);
    let output='';launcher.stdout.on('data',d=>{output+=d;});launcher.stderr.on('data',d=>{output+=d;});
    const [code]=await once(launcher,'exit');assert.equal(code,0,output);assert.match(output,/Restart OK/);
    const after=await(await fetch(f.base+'/api/launcher/status',{headers:headersFor(f)})).json();replacementPid=after.pid;
    assert.notEqual(after.pid,before.pid);assert.equal(after.managed,false);assert.equal(after.saveFile,f.file);
    await until(()=>server.exitCode!==null);assert.equal(server.exitCode,0,'Old process must exit normally');
    assert.equal(after.currentAccount,before.currentAccount);assert.deepEqual(after.accounts,before.accounts);
    assert.equal(fs.readFileSync(f.file+'.session','utf8'),session);
    const saved=JSON.parse(fs.readFileSync(f.file,'utf8'));
    assert.deepEqual(saved.players[selected.id].tech,selected.tech);
    assert.deepEqual(saved.planets[selected.home].ships,world.planets[selected.home].ships);
    assert.equal(saved.players[first.id].name,first.name);
    assert.equal(Object.values(saved.players).filter(p=>!p.bot).length,2);
    assert.equal((after.log.match(/启动器请求关闭后台，进度已保存/g)||[]).length,1,'Repeated click must not issue a second stop');
    await stop(f);
    await until(()=>{try{process.kill(replacementPid,0);return false;}catch{return true;}});
  }finally{
    if(launcher?.exitCode===null){launcher.kill();await once(launcher,'exit');}
    // Recover the replacement identity even when an assertion failed before it was read.
    try{const h=await(await fetch(f.base+'/api/health',{signal:AbortSignal.timeout(1000)})).json();if(h.isolated)replacementPid=h.pid;}catch{}
    if(server.exitCode===null){server.kill();await once(server,'exit');}
    if(replacementPid){try{process.kill(replacementPid);}catch{}await until(()=>{try{process.kill(replacementPid,0);return false;}catch{return true;}});}
    assert.ok(f.dir.startsWith(os.tmpdir()+path.sep));fs.rmSync(f.dir,{recursive:true,force:true});
  }
});

for(const failure of ['save rejected','process stays alive'])test(`restart does not launch a replacement when ${failure}`,{skip:process.platform!=='win32',timeout:45000},async()=>{
  const f=await fixture();let stops=0,launcher;
  const server=http.createServer((req,res)=>{
    res.setHeader('Content-Type','application/json');
    if(req.url==='/api/launcher/stop'){
      stops++;
      if(failure==='save rejected'){res.statusCode=500;res.end(JSON.stringify({error:'隔离测试：保存失败'}));}
      else res.end(JSON.stringify({ok:true}));
      return;
    }
    res.end(JSON.stringify({service:'galaxy-empire',status:'running',monitorVersion:1,pid:process.pid,uptime:1,managed:false,saveFile:f.file,logFile:f.file+'.log',accounts:[],currentAccount:null,log:'隔离重启失败测试'}));
  });
  try{
    server.listen(f.port,'127.0.0.1');await once(server,'listening');
    launcher=monitor(f,true,['-RestartTest']);let output='';launcher.stdout.on('data',d=>{output+=d;});launcher.stderr.on('data',d=>{output+=d;});
    const [code]=await once(launcher,'exit');assert.notEqual(code,0,output);assert.match(output,/重启测试未完成/);
    assert.match(output,failure==='save rejected'?/未启动新后台/:/未强制终止进程/);
    assert.equal(stops,1);assert.equal(fs.existsSync(f.file),false,'A failed stop must not start a server or create a save');
    assert.equal(fs.existsSync(f.file+'.log'),false,'A failed stop must not launch even a conflicting replacement');
    assert.equal((await fetch(f.base+'/api/health')).ok,true,'Original service remains available');
  }finally{
    if(launcher?.exitCode===null){launcher.kill();await once(launcher,'exit');}
    server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
    assert.ok(f.dir.startsWith(os.tmpdir()+path.sep));fs.rmSync(f.dir,{recursive:true,force:true});
  }
});

test('restart reports a startup failure without losing the saved account',{skip:process.platform!=='win32',timeout:30000},async()=>{
  const {createWorld,createPlayer}=await import('../game/engine.mjs');
  const f=await fixture(),world=createWorld(),player=createPlayer(world,'重启启动失败隔离测试');
  const session=JSON.stringify({cookie:'empire='+player.id});
  fs.writeFileSync(f.file,JSON.stringify(world));fs.writeFileSync(f.file+'.session',session);
  const env={...process.env,PORT:String(f.port),EMPIRE_SAVE_FILE:f.file,EMPIRE_SESSION_FILE:f.file+'.session',EMPIRE_SERVER_LOG:f.file+'.log',EMPIRE_MANAGED_STDIN:'0'};
  const server=spawn(process.execPath,['server.mjs'],{cwd:root,env,windowsHide:true,stdio:'ignore'});let launcher;
  try{
    await until(async()=>{try{return (await fetch(f.base+'/api/health')).ok;}catch{return false;}});
    // The existing server is healthy, but the launcher's Node lookup will fail.
    const missingNodeEnv=Object.fromEntries(Object.entries(process.env).filter(([key])=>key.toUpperCase()!=='PATH'));
    missingNodeEnv.PATH=f.dir;
    launcher=monitor(f,true,['-RestartTest'],missingNodeEnv);let output='';
    launcher.stdout.on('data',d=>{output+=d;});launcher.stderr.on('data',d=>{output+=d;});
    const [code]=await once(launcher,'exit');assert.notEqual(code,0,output);assert.match(output,/重启后启动失败/);
    await until(()=>server.exitCode!==null);assert.equal(server.exitCode,0);
    assert.equal(JSON.parse(fs.readFileSync(f.file,'utf8')).players[player.id].name,player.name);
    assert.equal(fs.readFileSync(f.file+'.session','utf8'),session);
    await assert.rejects(fetch(f.base+'/api/health'));
  }finally{
    if(launcher?.exitCode===null){launcher.kill();await once(launcher,'exit');}
    if(server.exitCode===null){server.kill();await once(server,'exit');}
    assert.ok(f.dir.startsWith(os.tmpdir()+path.sep));fs.rmSync(f.dir,{recursive:true,force:true});
  }
});
