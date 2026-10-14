import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {randomUUID} from 'node:crypto';
import {createSpatialBattle,addSpatialFleet} from '../game/spatial-battle.mjs';
import {units} from '../game/catalog.mjs';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer,act} from '../game/engine.mjs';

test('live API enforces ownership, streams authoritative state, releases timed-out control and reloads checkpoints',async()=>{
 const now=Date.now(),world=createWorld(now),a=createPlayer(world,'A',now,()=>.1),d=createPlayer(world,'D',now,()=>.2),x=createPlayer(world,'X',now,()=>.3),home=world.planets[a.home],target=world.planets[d.home];home.ships={Battleship:4};home.resources=[1e8,1e8,1e8];target.ships={Battleship:4};target.defense={};act(world,a,{type:'dispatch',planet:home.id,target:target.id,position:target.position,task:'attack',ships:home.ships},now);world.missions[0].end=now;
 const second=createSpatialBattle({id:randomUUID(),target:x.home,attacker:a.id,defender:x.id,start:now});for(const side of ['attacker','defender'])addSpatialFleet(second,{fleet:{Battleship:1},owner:side==='attacker'?a.id:x.id,side},units);world.battles[second.id]=second;
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'spatial-api-')),file=path.join(dir,'universe.json');fs.writeFileSync(file,JSON.stringify(world));
 const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));const base=`http://127.0.0.1:${port}`;
 let child,errors='';const start=async()=>{child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file},windowsHide:true,stdio:['ignore','pipe','pipe']});child.stderr.on('data',x=>errors+=x);await once(child.stdout,'data');};
 const headers=p=>({Cookie:`empire=${p.id}`,Origin:base,'Content-Type':'application/json'}),get=async(p,url)=>fetch(base+url,{headers:headers(p)}),post=async(p,url,body)=>fetch(base+url,{method:'POST',headers:headers(p),body:JSON.stringify(body)});
 try{
  await start();assert.deepEqual(await(await get(a,'/api/battle-trial')).json(),{enabled:false});assert.equal((await post(a,'/api/battle-trial',{attacker:{Interceptor:1},defender:{Interceptor:1}})).status,403);const state=await(await get(a,'/api/state')).json();assert.equal(state.battles.length,2);const id=state.battles.find(b=>b.id!==second.id).id,url='/api/battles/'+id;
  assert.equal((await get(x,url)).status,404);assert.equal((await post(x,url+'/control',{type:'claim',shipId:4})).status,404);
  const snap=await(await get(a,url)).json(),own=snap.metadata.find(s=>s.owner===a.id),enemy=snap.metadata.find(s=>s.owner===d.id);
  assert.equal((await post(a,url+'/control',{type:'claim',shipId:enemy.id})).status,400);
  assert.equal((await post(a,url+'/control',{type:'claim',shipId:own.id})).status,200);
  assert.equal((await post(a,'/api/battles/'+second.id+'/control',{type:'claim',shipId:0})).status,200);assert.equal((await(await get(a,url)).json()).controls[a.id],undefined);
  assert.equal((await post(a,url+'/control',{type:'claim',shipId:own.id})).status,200);assert.equal((await(await get(a,'/api/battles/'+second.id)).json()).controls[a.id],undefined);
  const command={type:'input',shipId:own.id,seq:1,input:{throttle:1,yaw:.5,pitch:0,fire:true}};assert.equal((await post(a,url+'/control',command)).status,200);assert.equal((await post(a,url+'/control',command)).status,400);
  const abort=new AbortController(),stream=await fetch(base+url+'/events',{headers:headers(a),signal:abort.signal});assert.match(stream.headers.get('content-type'),/text\/event-stream/);const reader=stream.body.getReader();const chunk=await reader.read();assert.match(new TextDecoder().decode(chunk.value),/data: /);abort.abort();
  await new Promise(r=>setTimeout(r,2300));const after=await(await get(a,url)).json();assert.equal(after.controls[a.id],undefined);assert.ok(after.tick>snap.tick);
  await post(a,'/api/action',{type:'readAll'});const disk=JSON.parse(fs.readFileSync(file,'utf8'));assert.ok(disk.battles[id].storage);
  child.kill();await once(child,'exit');child=null;await start();const restored=await(await get(a,url)).json();assert.equal(restored.metadata.length,8);assert.ok(restored.tick>=after.tick);assert.equal(restored.controls[a.id],undefined);
  const restoredState=await(await get(a,'/api/state')).json();assert.equal(restoredState.missions[0].phase,'engaged');assert.equal(restoredState.reports.filter(r=>r.type==='battle').length,0);assert.equal(errors,'');
 }finally{if(child){child.kill();await once(child,'exit');}fs.rmSync(dir,{recursive:true,force:true});}
});
