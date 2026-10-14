import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer} from '../game/engine.mjs';
test('isolated test API validates fleets, denies wrong origins, allows elite control and preserves restart replay',async()=>{
 const w=createWorld(),p=createPlayer(w,'Trial'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'fleet-trial-')),file=path.join(dir,'universe.json');fs.writeFileSync(file,JSON.stringify(w));
 const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));const base=`http://127.0.0.1:${port}`,headers={Cookie:`empire=${p.id}`,Origin:base,'Content-Type':'application/json'};
 let child,errors='';const start=async()=>{child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file,EMPIRE_BATTLE_TRIAL:'1'},windowsHide:true,stdio:['ignore','pipe','pipe']});child.stderr.on('data',b=>errors+=b);await once(child.stdout,'data');};
 const get=async url=>{const r=await fetch(base+url,{headers});assert.equal(r.status,200);return r.json();},post=(url,body,h=headers)=>fetch(base+url,{method:'POST',headers:h,body:JSON.stringify(body)}),fleets={attacker:{Interceptor:2,Dreadnought:4},defender:{Devourer_Interceptor:2,Dreadnought:5},seed:42};
 try{await start();assert.equal((await get('/api/battle-trial')).enabled,true);assert.equal((await post('/api/battle-trial',fleets,{...headers,Origin:'http://example.com'})).status,403);assert.equal((await post('/api/battle-trial',{...fleets,attacker:{Guardian:1}})).status,400);
  const response=await post('/api/battle-trial',fleets);assert.equal(response.status,200);const {id}=await response.json(),b=await get('/api/battles/'+id);assert.equal(b.metadata.length,13);assert.ok(b.trial);
  const elite=b.metadata.find(s=>s.type==='Interceptor');assert.equal((await post(`/api/battles/${id}/control`,{type:'claim',shipId:elite.id})).status,200);assert.equal((await post(`/api/battles/${id}/control`,{type:'input',shipId:elite.id,seq:1,input:{throttle:0,yaw:0,pitch:0,fire:true}})).status,200);
  await post('/api/action',{type:'readAll'});child.kill();await once(child,'exit');child=null;await start();assert.equal((await get('/api/battles/'+id)).metadata.length,13);
  assert.equal((await post('/api/battle-trial',fleets)).status,200);const state=await get('/api/state'),report=state.reports.find(r=>r.battleId===id);assert.ok(report.trial);const replay=await get('/api/replay/'+report.id);assert.equal(replay.record.metadata.length,13);assert.equal(replay.version,4);assert.equal(state.battles.length,1);assert.deepEqual(state.missions,[]);assert.equal(errors,'');
 }finally{if(child){child.kill();await once(child,'exit');}fs.rmSync(dir,{recursive:true,force:true});}
});
