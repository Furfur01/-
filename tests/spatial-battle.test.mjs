import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createSpatialBattle,addSpatialFleet,advanceSpatialBattle,stepSpatialBattle,controlBattle,spatialSurvivors,packedShips} from '../game/spatial-battle.mjs';
import {createWorld,createPlayer,advance,act,snapshot,migrateWorld} from '../game/engine.mjs';
import {units} from '../game/catalog.mjs';
import {battleStorage} from '../game/battle-storage.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const T=1700000000000;
function battle(a={Light_Fighter:12,Cruiser:2},d={Heavy_Fighter:10,Cruiser:2}){const b=createSpatialBattle({id:randomUUID(),target:'p',attacker:'a',defender:'d',start:T,seed:42});addSpatialFleet(b,{fleet:a,owner:'a',side:'attacker'},units);addSpatialFleet(b,{fleet:d,owner:'d',side:'defender'},units);return b;}
function world(){const w=createWorld(T),a=createPlayer(w,'A',T,()=>.1),d=createPlayer(w,'D',T,()=>.2),h=w.planets[a.home],p=w.planets[d.home];h.ships={Cruiser:6,Battleship:4};h.resources=[1e8,1e8,1e8];p.ships={Cruiser:6,Battleship:4};p.defense={};a.tech.Computer_Tech=9;return {w,a,d,h,p};}
function dispatch(f,ships={Cruiser:3,Battleship:2},owner=f.a,from=f.h){act(f.w,owner,{type:'dispatch',planet:from.id,target:f.p.id,position:f.p.position,task:'attack',ships},T);const m=f.w.missions.at(-1);m.end=T+100;m.travel=1000;m.seed=42;return m;}

test('spatial rules: range, fixed firing arc, delayed missiles, cooldown and damage',()=>{
 const b=battle({Light_Fighter:1},{Heavy_Fighter:1}),s=b.ships[0],t=b.ships[1];
 controlBattle(b,'a',{type:'claim',shipId:0});controlBattle(b,'a',{type:'input',shipId:0,seq:1,input:{throttle:0,yaw:0,pitch:0,fire:true}});
 s.x=0;s.z=0;s.y=0;t.x=1000;t.z=0;t.y=0;t.speed=0;t.profile.speed=0;s.target=1;s.cooldown=0;
 stepSpatialBattle(b);assert.equal(t.hp,t.maxHp);assert.equal(t.shield,t.maxShield);
 t.x=100;s.yaw=-Math.PI/2;stepSpatialBattle(b);assert.equal(t.shield,t.maxShield,'fixed gun cannot shoot backwards');
 s.yaw=Math.PI/2;stepSpatialBattle(b);assert.ok(t.shield<t.maxShield);const shield=t.shield;stepSpatialBattle(b);assert.equal(t.shield,shield,'cooldown is authoritative');
 const missile=battle({Bomber:1},{Battleship:1}),ms=missile.ships[0],mt=missile.ships[1];ms.x=0;ms.y=0;ms.z=0;mt.x=400;mt.z=0;mt.y=0;ms.cooldown=0;ms.target=1;ms.secondaryCooldown=99;mt.profile.pointDefense=false;mt.profile.speed=0;mt.attack=0;
 stepSpatialBattle(missile);assert.ok(missile.projectiles.length);assert.equal(mt.shield,mt.maxShield);advanceSpatialBattle(missile,T+3000);assert.ok(mt.shield<mt.maxShield||mt.hp<mt.maxHp);
});
test('deterministic inputs, snapshots and restart reproduce identical positions and survivors',()=>{
 const b=battle();advanceSpatialBattle(b,T+16000);controlBattle(b,'a',{type:'claim',shipId:0});controlBattle(b,'a',{type:'input',shipId:0,seq:1,input:{throttle:.6,yaw:.7,pitch:0,fire:true}});
 const copy=JSON.parse(JSON.stringify(b));advanceSpatialBattle(b,T+55000);for(let t=16050;t<=55000;t+=50)advanceSpatialBattle(copy,T+t);
 assert.deepEqual(packedShips(b),packedShips(copy));assert.deepEqual(spatialSurvivors(b),spatialSurvivors(copy));assert.equal(b.rng,copy.rng);assert.deepEqual(b.events,copy.events);
});
test('pilot ownership, sequences, input validation, timeout and state-preserving transfer',()=>{
 const b=battle();assert.throws(()=>controlBattle(b,'d',{type:'claim',shipId:0}));assert.throws(()=>controlBattle(b,'stranger',{type:'claim',shipId:0}));
 const s=b.ships[0];s.hp-=10;s.cooldown=4;controlBattle(b,'a',{type:'claim',shipId:0});assert.equal(s.hp,s.maxHp-10);assert.equal(s.cooldown,4);
 const input={throttle:1,yaw:0,pitch:0};controlBattle(b,'a',{type:'input',shipId:0,seq:1,input});assert.throws(()=>controlBattle(b,'a',{type:'input',shipId:0,seq:1,input}));assert.throws(()=>controlBattle(b,'a',{type:'input',shipId:0,seq:2,input:{...input,yaw:Infinity}}));
 controlBattle(b,'a',{type:'claim',shipId:1});assert.equal(Object.keys(b.controls).length,1);assert.equal(b.controls.a.shipId,1);advanceSpatialBattle(b,T+2100);assert.equal(b.controls.a,undefined);
});
test('manual input changes genuine combat position and damage',()=>{
 const b=battle({Light_Fighter:1},{Heavy_Fighter:1}),s=b.ships[0],t=b.ships[1];s.x=0;s.z=0;s.y=0;s.yaw=Math.PI/2;s.target=1;s.cooldown=0;t.x=100;t.y=0;t.z=0;t.profile.speed=0;t.attack=0;
 const silent=structuredClone(b);for(const x of [b,silent])controlBattle(x,'a',{type:'claim',shipId:0});
 for(let i=1;i<=10;i++){for(const[x,fire]of[[b,true],[silent,false]]){controlBattle(x,'a',{type:'input',shipId:0,seq:i,input:{throttle:.2,yaw:0,pitch:0,fire}});advanceSpatialBattle(x,T+i*100);}}
 assert.ok(b.ships[1].hp+b.ships[1].shield<silent.ships[1].hp+silent.ships[1].shield);assert.ok(s.x>0);
 assert.ok(b.events.every((event,i)=>!i||event.seq>b.events[i-1].seq),'global event order must not be overwritten by per-player input sequences');
 assert.equal(b.events.filter(e=>e.type==='input').at(-1).inputSeq,10);
});
test('arrival reserves ships; friendly reinforcements join; third party waits; settlement happens once',()=>{
 const f=world(),m=dispatch(f),m2=dispatch(f);m2.end=T+2000;const other=createPlayer(f.w,'Third',T,()=>.3),oh=f.w.planets[other.home];oh.ships={Cruiser:1};oh.resources=[1e8,1e8,1e8];const m3=dispatch(f,{Cruiser:1},other,oh);m3.end=T+3000;
 advance(f.w,T+100);assert.equal(m.phase,'engaged');assert.deepEqual(f.p.ships,{});assert.equal(f.a.reports.filter(r=>r.type==='battle').length,0);assert.throws(()=>act(f.w,f.a,{type:'recall',id:m.id},T+100),/无法召回/);
 advance(f.w,T+3100);assert.equal(m2.battleId,m.battleId);assert.equal(m2.phase,'engaged');assert.equal(m3.phase,'waiting');assert.equal(snapshot(f.w,f.a).battles.length,1);
 const b=f.w.battles[m.battleId];assert.equal(b.initial.attacker.Cruiser,6);assert.equal(b.start,T+100);
 advance(f.w,T+1300000);const reports=f.a.reports.filter(r=>r.type==='battle');assert.equal(reports.length,1);assert.equal(reports[0].engine,'spatial-v2');
 for(const side of ['attacker','defender'])for(const[id,n]of Object.entries(reports[0].initial[side]))assert.equal((reports[0].survivors[side][id]||0)+(reports[0].losses[side][id]||0),n);
 const before=JSON.stringify(f.a.reports);advance(f.w,T+1300000);assert.equal(JSON.stringify(f.a.reports),before);assert.equal(m3.phase==='waiting',false);
});
test('defender construction joins and empty migration does not modify old reports',()=>{
 const f=world();const m=dispatch(f);f.p.shipQueue=[{id:'Light_Fighter',remaining:1,end:T+1200,each:1}];advance(f.w,T+1500);const b=f.w.battles[m.battleId];assert.equal(b.initial.defender.Light_Fighter,1);assert.deepEqual(f.p.ships,{});
 const old={id:'legacy',type:'battle',winner:'defender'};f.a.reports.push(old);const copy=structuredClone(f.w);delete copy.battles;migrateWorld(copy);assert.deepEqual(copy.battles,{});assert.deepEqual(copy.players[f.a.id].reports.at(-1),old);
});
test('checkpoint manifest round-trip preserves active battle and retains full finished replay',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'spatial-save-'));try{const storage=battleStorage(path.join(dir,'universe.json')),b=battle(),w={battles:{[b.id]:b}};advanceSpatialBattle(b,T+5000);const manifest=storage.checkpoint(w);assert.ok(manifest.battles[b.id].storage);const restored=storage.restore(structuredClone(manifest));assert.deepEqual(restored.battles[b.id],b);advanceSpatialBattle(b,T+600000);b.settled=true;const finished=storage.checkpoint(w);storage.compact(w,finished);assert.ok(w.battles[b.id].storage);assert.ok(storage.read(w.battles[b.id].storage).frames.length);storage.prune(finished);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('twenty thousand ships remain individually represented',()=>{
 const b=battle({Light_Fighter:10000},{Light_Fighter:10000});assert.equal(b.ships.length,20000);stepSpatialBattle(b);assert.equal(Object.values(spatialSurvivors(b).attacker).reduce((a,c)=>a+c,0),10000);assert.equal(new Set(b.ships.map(s=>s.id)).size,20000);
});

test('auxiliary missiles use equipped ports, retain cooldown across transfers, and turrets stay automatic',()=>{
 const b=battle({Cruiser:1,Light_Fighter:1},{Battleship:1}),s=b.ships.find(s=>s.type==='Cruiser'),t=b.ships.find(s=>s.side==='defender');
 s.x=0;s.z=0;s.y=0;t.x=250;t.z=0;t.y=0;t.profile.speed=0;t.attack=0;t.profile.pointDefense=false;s.target=t.id;s.cooldown=0;
 controlBattle(b,'a',{type:'claim',shipId:s.id});controlBattle(b,'a',{type:'input',shipId:s.id,seq:1,input:{throttle:0,yaw:0,pitch:0,fire:false,missile:true}});
 stepSpatialBattle(b);assert.ok(b.projectiles.some(q=>q.source===s.id&&q.missile));assert.ok(s.missileCooldown>0);assert.ok(s.cooldown>0,'automatic primary turrets continue without fire input');
 const cooldown=s.missileCooldown;controlBattle(b,'a',{type:'release'});controlBattle(b,'a',{type:'claim',shipId:s.id});assert.equal(s.missileCooldown,cooldown);
 const fighter=b.ships.find(s=>s.type==='Light_Fighter');assert.equal(fighter.profile.secondaryMissile,false);
});

test('offline event ordering matches incremental advancement through reinforcement and research boundaries',()=>{
 const f=world(),m=dispatch(f);f.p.shipQueue=[{id:'Light_Fighter',remaining:2,end:T+150,each:.05}];f.d.researchQueue={id:'Weapons_Tech',level:4,end:T+200};
 const resumed=structuredClone(f.w);advance(f.w,T+12000);for(let t=50;t<=12000;t+=50)advance(resumed,T+t);
 assert.deepEqual(packedShips(f.w.battles[m.battleId]),packedShips(Object.values(resumed.battles)[0]));
 assert.deepEqual(f.w.battles[m.battleId].batches,Object.values(resumed.battles)[0].batches);
 assert.deepEqual(f.w.players[f.a.id].reports,resumed.players[f.a.id].reports);
});

test('ten minute draw, immutable entrant technology and no reinforcement time reset',()=>{
 const b=battle({Guardian:1},{Guardian:1}),tech={Weapons_Tech:1};for(const s of b.ships)s.attack=0;
 advanceSpatialBattle(b,T+590000);addSpatialFleet(b,{fleet:{Guardian:1},technology:tech,owner:'a',side:'attacker'},units);const reinforcement=b.ships.at(-1);reinforcement.attack=0;tech.Weapons_Tech=99;
 advanceSpatialBattle(b,T+600000);assert.equal(b.winner,'draw');assert.equal(b.finishedAt,T+600000);assert.equal(b.batches.at(-1).technology.Weapons_Tech,1);
 assert.equal(spatialSurvivors(b).attacker.Guardian,2);
});

test('returning defenders enter the existing battle instead of becoming dispatchable inventory',()=>{
 const f=world(),m=dispatch(f);advance(f.w,T+100);const b=f.w.battles[m.battleId],count=b.initial.defender.Cruiser;
 f.w.missions.push({id:'returning',owner:f.d.id,from:f.p.id,phase:'return',task:'transport',end:T+200,ships:{Cruiser:2},cargo:[0,0,0]});
 advance(f.w,T+200);assert.equal(b.initial.defender.Cruiser,count+2);assert.deepEqual(f.p.ships,{});assert.ok(b.batches.some(batch=>batch.mission==='returning'));assert.ok(!f.w.missions.some(m=>m.id==='returning'));
});

test('strategic missiles hit reserved defenses once and those losses cannot be repaired',()=>{
 const f=world();f.p.defense={Rocket_Launcher:10};f.h.defense={Interplanetary_Missile:10};f.a.tech.Impulse_Drive=1000;
 const m=dispatch(f);advance(f.w,T+100);act(f.w,f.a,{type:'missile',planet:f.h.id,target:f.p.id,count:10,priority:'Rocket_Launcher'},T+100);
 const b=f.w.battles[m.battleId];assert.equal(b.ships.filter(s=>s.type==='Rocket_Launcher'&&s.unrepairable).length,10);assert.equal(f.h.defense.Interplanetary_Missile,0);
 advance(f.w,T+600100);const report=f.a.reports.find(r=>r.type==='battle');assert.equal(report.losses.defender.Rocket_Launcher,10);assert.equal(report.repair.Rocket_Launcher,0);assert.equal(f.p.defense.Rocket_Launcher||0,0);
});
