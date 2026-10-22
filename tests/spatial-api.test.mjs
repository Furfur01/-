import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {randomUUID} from 'node:crypto';
import {createSpatialBattle,addSpatialFleet,controlBattle,stepSpatialBattle} from '../game/spatial-battle.mjs';
import {manualWeaponTiming,activeManualCues} from '../game/weapon-timing.mjs';
import {units} from '../game/catalog.mjs';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer,act,ensureSystemNpcs} from '../game/engine.mjs';
import {createSaveWriter} from '../game/save-writer.mjs';
import {battleStorage} from '../game/battle-storage.mjs';
import {battleStats} from '../game/battle-stats.mjs';
import {shipCabinClass} from '../game/ship-cabins.mjs';
import {devastateWorld} from '../game/desolation.mjs';
import {Vector3,Raycaster} from 'three';
import {createArsenalModel} from '../scripts/universe/arsenal-models.js';
import {createReferenceImpact} from '../scripts/universe/arsenal-original.js';
import {createLaunchVessel} from '../scripts/universe/arsenal-v3.js';
import {arsenalTimings,arsenalShotTime,missileFlight,missileFlightTime,electronThroughFlight} from '../scripts/universe/arsenal-motion.js';

test('arsenal replay keeps muzzle velocity, shows transit and continues the electron beam past impact',()=>{
 const distance=100000,eps=1e-5,exit=missileFlight(6,distance);
 assert(Math.abs(exit.trackX-213)<1e-8);assert.equal(exit.distance,0);
 const before=(exit.trackX-missileFlight(6-eps,distance).trackX)/eps;
 const after=missileFlight(6+eps,distance).distance/eps;
 assert(Math.abs(before-exit.speed)<.01);assert(Math.abs(after-exit.speed)<.1);
 let speed=0;for(let t=3.7;t<=12.8;t+=.025){const sample=missileFlight(t,distance);assert(sample.speed>=speed);speed=sample.speed;}
 assert(Math.abs(missileFlight(12.8,distance).distance-distance)<1e-7);
 // A same-system shot must not overshoot and fly backwards to fill the replay.
 const near=1000,nearArrival=6+missileFlightTime(near);let nearSpeed=0;
 for(let t=3.7;t<=nearArrival;t+=.025){const sample=missileFlight(t,near);assert(sample.speed>=nearSpeed);assert(sample.distance<=near);nearSpeed=sample.speed;}
 assert(Math.abs(missileFlight(nearArrival,near).distance-near)<1e-7);
 const vessel=createLaunchVessel({target:new Vector3(1e6,400,8e5)});
 try{for(const t of [0,3.7,5.99,6,6.01,7,10,12.8]){vessel.update({shotTime:t,time:t});vessel.group.updateMatrixWorld(true);const actual=vessel.group.getObjectByName('Tiny segmented penetrator').getWorldPosition(new Vector3());assert(actual.distanceTo(vessel.getProjectileSample(t).position)<1e-6);}}finally{vessel.dispose();}
 for(const [kind,t]of Object.entries(arsenalTimings)){
  assert(t.release>=14);assert(t.arrival-t.release>=12);assert.equal(arsenalShotTime(kind,t.release),t.rawRelease);assert.equal(arsenalShotTime(kind,t.arrival),t.rawImpact);
 }
 const early=electronThroughFlight(.5,100,10000),late=electronThroughFlight(9,100,10000);
 assert.equal(early.head,5000);assert.equal(late.head,90000);assert(late.tail>early.tail);assert(late.head>late.tail);
});

test('electron extraction clears the circulating ring and emits along the extended magnetic bore',()=>{
 const target=new Vector3(6000,40,1800),model=createArsenalModel('accelerator',{target});
 try{
  model.updateShot(6,6);model.group.updateMatrixWorld(true);
  const {extraction,muzzle}=model.raw,barrel=model.group.getObjectByName('superconducting-magnetic-confinement');
  assert(barrel);assert(barrel.localToWorld(new Vector3(0,0,79)).distanceTo(muzzle)<1e-8);
  assert(extraction.axis.dot(target.clone().sub(muzzle).normalize())>1-1e-10);
  const junction=extraction.group.position,radial=new Vector3(junction.x,0,junction.z).normalize();
  assert(Math.abs(radial.dot(extraction.axis))<1e-10,'Extraction must be tangent, not radial');
  assert(muzzle.clone().sub(junction).normalize().dot(extraction.axis)>1-1e-10,'The whole extraction path must stay straight');
  const bore=new Raycaster(junction,extraction.axis,.01,junction.distanceTo(muzzle));
  assert.deepEqual(bore.intersectObject(model.group,true).filter(hit=>hit.object.material?.isMeshStandardMaterial),[],'The shared septum and barrel must leave the tangent bore open');
  assert(Math.hypot(muzzle.x,muzzle.z)>220,'The outlet must clear the ring and its service hardware');
  const beam=new Raycaster(muzzle,extraction.axis,.01,muzzle.distanceTo(target));
  assert.deepEqual(beam.intersectObject(model.group,true).filter(hit=>hit.object.material?.isMeshStandardMaterial),[],'No solid machinery may cross the outgoing beam');
  const fields=[];barrel.traverse(object=>{if(object.name==='magnetic-return-field')fields.push(object);});
  assert.equal(fields.length,10);assert(fields.every(field=>field.material.opacity>.3));
 }finally{model.dispose();}
});

test('missile radiation expands as three complete spherical shells',()=>{
 const impact=createReferenceImpact({center:new Vector3(),radius:17});
 try{
  impact.update({kind:'missile',time:2,direction:new Vector3(0,1,0),quality:'balanced'});
  assert.equal(impact.radiationShells.length,3);
  for(const shell of impact.radiationShells){assert.equal(shell.geometry.parameters.thetaLength,Math.PI);assert.equal(shell.scale.x,shell.scale.y);assert.equal(shell.scale.y,shell.scale.z);assert(shell.material.uniforms.alpha.value>0);}
  const sizes=impact.radiationShells.map(shell=>shell.scale.x);assert(sizes[0]>sizes[1]&&sizes[1]>sizes[2]);
 }finally{impact.dispose();}
});

test('new ships use catalog and technology while saved battle hulls keep their entry-time values',()=>{
 const b=createSpatialBattle({id:'wiki-test',attacker:'test',defender:'enemy',start:0});
 const old={...units,Titanenergetic_Frigate:{...units.Titanenergetic_Frigate,strength:13500,shield:600,attack:4800}};
 const technology={Strength_Tech:2,Shielding_Tech:3,Weapons_Tech:4};
 addSpatialFleet(b,{fleet:{Titanenergetic_Frigate:1},technology,owner:'test',side:'attacker'},old);
 const restored=JSON.parse(JSON.stringify(b)),saved=structuredClone(restored.ships[0]);
 addSpatialFleet(restored,{fleet:{Titanenergetic_Frigate:1,Interceptor:1,Annihilator:1},technology,owner:'test',side:'attacker'},units);
 assert.deepEqual(restored.ships[0],saved);
 for(const s of restored.ships.slice(1)){
  const expected=battleStats(units[s.type],technology);
  assert.equal(s.maxHp,expected.hull);assert.equal(s.maxShield,expected.shield);assert.equal(s.attack,expected.attack);assert.equal(s.profile.speed,expected.speed);
 }
 const updated=restored.ships.find(s=>s.type==='Titanenergetic_Frigate'&&s.id!==0);
 assert.equal(updated.profile.role,'line');assert.equal(shipCabinClass(updated.type,updated.profile),'horizon');
 assert.equal(shipCabinClass(updated.type,{role:'fighter',length:5}),'fighter');
});

test('background saves retain immutable generations, rollback on disk failure and compact only acknowledged battles',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'empire-save-worker-')),file=path.join(dir,'universe.json'),writer=createSaveWriter(file),store=battleStorage(file);
 try{
  const world=createWorld(),player=createPlayer(world,'测试_后台存档'),b=createSpatialBattle({id:randomUUID(),attacker:player.id,defender:'enemy',start:world.at});
  addSpatialFleet(b,{fleet:{Battleship:1},side:'attacker',owner:player.id},units);world.battles={[b.id]:b};
  const writing=writer.write(world),tick=b.tick;b.tick++;b.eventSeq++;b.status='finished';b.settled=true;player.tech.Weapons_Tech=7;
  const first=await writing;store.compact(world,first);
  assert.equal(world.battles[b.id],b,'An active checkpoint must not replace the newer finished battle');
  const disk=JSON.parse(fs.readFileSync(file,'utf8'));
  assert.notEqual(disk.players[player.id].tech.Weapons_Tech,7,'The worker owns a snapshot, not the mutable live world');
  assert.equal(store.read(disk.battles[b.id].storage).tick,tick);
  // A real filesystem failure before manifest rename preserves the last commit.
  fs.mkdirSync(file+'.tmp');await assert.rejects(writer.write(world));
  assert.deepEqual(JSON.parse(fs.readFileSync(file,'utf8')),disk);
  fs.rmdirSync(file+'.tmp');
  const second=await writer.write(world);store.compact(world,second);
  assert.equal(world.battles[b.id].status,'finished');assert(world.battles[b.id].storage);
  assert.equal(store.read(world.battles[b.id].storage).tick,b.tick);
  assert.equal(JSON.parse(fs.readFileSync(file,'utf8')).players[player.id].tech.Weapons_Tech,7);
 }finally{await writer.close();assert(path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(dir,{recursive:true,force:true});}
});

test('stellar destruction writes a new finished battle checkpoint even at the same combat tick',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'empire-stellar-checkpoint-')),store=battleStorage(path.join(dir,'universe.json'));
 try{
  const world=createWorld(),player=createPlayer(world,'测试_恒星毁伤检查点'),target=Object.values(world.planets).find(p=>p.npc&&!p.moon);
  const b=createSpatialBattle({id:randomUUID(),target:target.id,attacker:player.id,defender:null,start:world.at});
  addSpatialFleet(b,{fleet:{Battleship:1},owner:player.id,side:'attacker'},units);world.battles={[b.id]:b};
  const before=store.checkpoint(world),tick=b.tick;
  devastateWorld(world,target,{id:'test-checkpoint-hit',kind:'missile',owner:player.id,end:world.at});
  const after=store.checkpoint(world);assert.equal(b.tick,tick);assert.notEqual(before.battles[b.id].storage,after.battles[b.id].storage);
  const saved=store.read(after.battles[b.id].storage);assert.equal(saved.status,'finished');assert.equal(saved.termination,'stellar-strike');assert.equal(saved.ships[0].hp,0);
  assert.equal(store.read(before.battles[b.id].storage).status,'active');store.compact(world,after);assert.equal(world.battles[b.id].storage,after.battles[b.id].storage);
 }finally{assert(path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(dir,{recursive:true,force:true});}
});

test('manual fire waits for its sound cue, compensates its cycle, and cancels charging on release',()=>{
 const battle=(type='Destroyer')=>{const b=createSpatialBattle({id:'cue',attacker:'pilot',defender:'enemy',start:0});
  addSpatialFleet(b,{fleet:{[type]:1},side:'attacker',owner:'pilot'},units);
  addSpatialFleet(b,{fleet:{Battleship:1},side:'defender',owner:'enemy'},units);
  const [s,t]=b.ships;Object.assign(s,{x:-100,y:0,z:0,yaw:Math.PI/2,pitch:0,cooldown:0});
  Object.assign(t,{x:100,y:0,z:0,hp:1e8,attack:0});t.profile.speed=0;return b;};
 const auto=battle();stepSpatialBattle(auto);
 const automatic=auto.events.find(e=>e.type==='fire'&&!e.secondary);assert(automatic);assert.equal(automatic.manual,false);
 const b=battle(),s=b.ships[0],timing=manualWeaponTiming(s.type,s.profile.cooldown);
 controlBattle(b,'pilot',{type:'claim',shipId:0});
 controlBattle(b,'pilot',{type:'input',shipId:0,seq:1,input:{throttle:0,yaw:0,pitch:0,fire:true,target:1}});
 stepSpatialBattle(b);const charge=b.events.find(e=>e.type==='weapon-charge');assert.equal(charge.windup,timing.windup);
 while(b.tick<charge.tick+Math.ceil(timing.windup*20))stepSpatialBattle(b);
 const shot=b.events.find(e=>e.type==='fire'&&e.manual);assert(shot);
 assert.equal((shot.tick-charge.tick)*.05,timing.windup);
 assert.equal(b.events.filter(e=>e.type==='fire'&&!e.secondary&&e.tick<shot.tick).length,0);
 assert(Math.abs(timing.damageScale/(timing.windup+timing.reload)-1.25/s.profile.cooldown)<1e-10);
 const cancel=battle();controlBattle(cancel,'pilot',{type:'claim',shipId:0});
 controlBattle(cancel,'pilot',{type:'input',shipId:0,seq:1,input:{throttle:0,yaw:0,pitch:0,fire:true,target:1}});
 stepSpatialBattle(cancel);controlBattle(cancel,'pilot',{type:'release'});stepSpatialBattle(cancel);
 assert.equal(cancel.ships[0].weaponCharge,null);assert(cancel.events.some(e=>e.type==='weapon-stop'));
 assert.equal(cancel.events.some(e=>e.type==='fire'&&e.manual),false);
 const beam=battle('Reaper');controlBattle(beam,'pilot',{type:'claim',shipId:0});
 controlBattle(beam,'pilot',{type:'input',shipId:0,seq:1,input:{throttle:0,yaw:0,pitch:0,fire:true,target:1}});
 while(!beam.ships[0].weaponBeam){beam.controls.pilot.lastTick=beam.tick;stepSpatialBattle(beam);}
 beam.controls.pilot.input.fire=false;
 const release=beam.events.find(e=>e.type==='fire'&&e.manual),hp=beam.ships[1].hp;
 assert.equal(release.beamDuration,8.65);assert.equal((release.tick-beam.events.find(e=>e.type==='weapon-charge').tick)*.05,2);
 for(let i=0;i<80;i++){beam.controls.pilot.lastTick=beam.tick;stepSpatialBattle(beam);}
 assert(beam.ships[0].weaponBeam);assert(beam.ships[1].hp<hp);
 assert.equal(activeManualCues(beam.events,beam.tick)[0].type,'fire');
 controlBattle(beam,'pilot',{type:'release'});stepSpatialBattle(beam);
 assert.equal(beam.ships[0].weaponBeam,null);assert.deepEqual(activeManualCues(beam.events,beam.tick),[]);
});

test('live API enforces ownership, streams authoritative state, releases timed-out control and reloads checkpoints',async()=>{
 const now=Date.now(),world=createWorld(now),a=createPlayer(world,'Test A',now,()=>.1),d=createPlayer(world,'Test D',now,()=>.2),x=createPlayer(world,'Test X',now,()=>.3),home=world.planets[a.home],target=structuredClone(world.planets[d.home]);const system=world.planets[world.factionWars.outposts[0]].position[1];ensureSystemNpcs(world,1,system);target.id='test-border-target';target.position=[1,system,Array.from({length:15},(_,i)=>i+1).find(slot=>!Object.values(world.planets).some(p=>!p.moon&&p.position.join(':')===`1:${system}:${slot}`))];world.planets[target.id]=target;home.ships={Battleship:4};home.resources=[1e8,1e8,1e8];target.ships={Battleship:4};target.defense={};act(world,a,{type:'dispatch',planet:home.id,target:target.id,position:target.position,task:'attack',ships:home.ships},now);world.missions[0].end=now;
 const second=createSpatialBattle({id:randomUUID(),target:x.home,attacker:a.id,defender:x.id,start:now});for(const side of ['attacker','defender'])addSpatialFleet(second,{fleet:{Battleship:1},owner:side==='attacker'?a.id:x.id,side},units);world.battles[second.id]=second;
 home.buildings.Missile_Silo=Math.max(1,home.buildings.Missile_Silo||0);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'spatial-api-')),file=path.join(dir,'universe.json');fs.writeFileSync(file,JSON.stringify(world));
 const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));const base=`http://127.0.0.1:${port}`;
 let child,errors='';const start=async()=>{child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file},windowsHide:true,stdio:['ignore','pipe','pipe']});child.stderr.on('data',x=>errors+=x);await once(child.stdout,'data');};
 const headers=p=>({Cookie:`empire=${p.id}`,Origin:base,'Content-Type':'application/json'}),get=async(p,url)=>fetch(base+url,{headers:headers(p)}),post=async(p,url,body)=>fetch(base+url,{method:'POST',headers:headers(p),body:JSON.stringify(body)});
 try{
  await start();const state=await(await get(a,'/api/state')).json();assert.equal(state.battles.length,2);const id=state.battles.find(b=>b.id!==second.id).id,url='/api/battles/'+id;
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
  const before=restoredState.planets.find(p=>p.id===home.id),order={type:'ship',planet:home.id,id:'Rocket_Launcher',count:50};
  // Two concurrent resource-changing requests must each roll back when the
  // worker cannot commit; a later successful request must still use live state.
  fs.mkdirSync(file+'.tmp');
  try{
   const rejected=await Promise.all([post(a,'/api/action',order),post(a,'/api/action',order)]);
   for(const response of rejected){assert.equal(response.status,400);assert.match((await response.json()).error,/EISDIR|directory/i);}
   const after=(await(await get(a,'/api/state')).json()).planets.find(p=>p.id===home.id);
   assert.deepEqual(after.defenseQueue,before.defenseQueue);
   after.resources.forEach((value,i)=>assert(value>=before.resources[i],'A failed save must not consume resources'));
  }finally{fs.rmdirSync(file+'.tmp');}
  const accepted=await post(a,'/api/action',order);assert.equal(accepted.status,200);
  const committed=(await accepted.json()).planets.find(p=>p.id===home.id);assert.equal(committed.defenseQueue.at(-1).count,50);
 }finally{if(child){child.kill();await once(child,'exit');}assert(path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(dir,{recursive:true,force:true});}
});
