import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer,advance} from '../game/engine.mjs';
import {startTrial,trialUnits,trialPresets,validateTrial} from '../game/battle-trial.mjs';
import {units} from '../game/catalog.mjs';
import {createSpatialBattle,addSpatialFleet,stepSpatialBattle,advanceSpatialBattle,packedShips} from '../game/spatial-battle.mjs';
import {formationGoal,fleetFronts} from '../game/fleet-formation.mjs';
const T=1700000000000;
test('test fleets are validated, isolated from economy, resumable and settle only once',()=>{
 const w=createWorld(T),p=createPlayer(w,'Trial',T,()=>.1),initial=structuredClone(w.planets),fleet=trialPresets[1].fleet;
 const b=startTrial(w,p,{attacker:fleet,defender:fleet,seed:42},T);
 assert.equal(b.ships.length,68);assert.equal(units.Interceptor,undefined);assert.equal(units.Devourer_Interceptor,undefined);
 assert.deepEqual(w.planets,initial);assert.equal(w.missions.length,0);assert.ok(!w.planets[b.target]);
 advance(w,T+20000);const resumed=JSON.parse(JSON.stringify(w));
 advance(w,T+600001);advance(resumed,T+600001);
 assert.deepEqual(packedShips(b),packedShips(resumed.battles[b.id]));assert.deepEqual(b.events,resumed.battles[b.id].events);
 assert.ok(b.settled);assert.equal(p.reports.length,1);const r=p.reports[0];assert.ok(r.trial);assert.deepEqual(r.debris,[0,0,0]);
 for(const side of ['attacker','defender'])for(const[id,n]of Object.entries(fleet))assert.equal((r.losses[side][id]||0)+(r.survivors[side][id]||0),n);
 for(const[id,planet]of Object.entries(initial)){assert.deepEqual(w.planets[id].ships,planet.ships);assert.deepEqual(w.planets[id].defense,planet.defense);assert.deepEqual(w.planets[id].debris,planet.debris);}
 advance(w,T+600001);assert.equal(p.reports.length,1);
 const next=startTrial(w,p,{attacker:{Interceptor:2},defender:{Dreadnought:5}},T+600001);
 assert.throws(()=>startTrial(w,p,{attacker:{Interceptor:1.5},defender:fleet}),/无效/);assert.equal(next.status,'active');
 startTrial(w,p,{attacker:{Dreadnought:3},defender:{Interceptor:1}},T+600002);
 assert.equal(next.status,'finished');assert.ok(next.settled);assert.equal(p.reports.length,2);
 assert.throws(()=>validateTrial({attacker:{Guardian:1},defender:fleet}),/无效/);assert.throws(()=>validateTrial({attacker:{},defender:fleet}),/须有/);
 assert.equal(validateTrial({attacker:{Light_Fighter:10000},defender:{Dreadnought:1}}).attacker.Light_Fighter,10000);
});
test('elite blast respects distance, shields, allies and direct-hit exclusion',()=>{
 const b=createSpatialBattle({id:'blast',attacker:'a',defender:'d',start:T});
 addSpatialFleet(b,{fleet:{Interceptor:1,Light_Fighter:1},owner:'a',side:'attacker'},trialUnits);
 addSpatialFleet(b,{fleet:{Light_Fighter:4},owner:'d',side:'defender'},trialUnits);
 for(const s of b.ships){s.x=s.id<2?0:30;s.y=0;s.z=[0,10,0,10,30,100][s.id];s.attack=s.speed=0;s.profile={...s.profile,speed:0,pointDefense:false};s.hp=s.maxHp=1000;s.shield=s.maxShield=s.id===3?2:100;}
 b.ships[1].x=30;
 b.projectiles.push({id:10,source:0,target:2,side:'attacker',kind:'nuclear',damage:100,splashRadius:70,splashFraction:.3,x:0,y:0,z:0,dx:100,dy:0,dz:0,speed:2000,ttl:2});
 const before=b.ships.map(s=>s.hp+s.shield);stepSpatialBattle(b);
 const loss=b.ships.map((s,i)=>before[i]-s.hp-s.shield);
 assert.equal(loss[0],0);assert.equal(loss[1],0);assert.equal(loss[2],100);assert.ok(loss[3]>loss[4]&&loss[4]>0);assert.equal(loss[5],0);assert.equal(b.ships[3].shield,0);assert.ok(b.ships[3].hp<1000);
 assert.equal(b.events.filter(e=>e.type==='blast').length,1);assert.equal(b.events.filter(e=>e.projectileId===10).length,1);
 const after=packedShips(b);stepSpatialBattle(b);assert.deepEqual(packedShips(b).map(s=>s.slice(6,8)),after.map(s=>s.slice(6,8)));
 assert.equal(b.ships[0].profile.splashRadius,70);assert.equal(b.ships[1].profile.splashRadius,0);
});
test('three-dimensional stations stay separated, heavy ships lead and dogfights require close range',()=>{
 const w=createWorld(T),p=createPlayer(w,'Trial',T,()=>.1),fleet=trialPresets[1].fleet,b=startTrial(w,p,{attacker:fleet,defender:fleet},T);
 const ours=b.ships.filter(s=>s.side==='attacker'),enemy=b.ships.filter(s=>s.side==='defender');
 assert.ok(new Set(ours.map(s=>s.y)).size>1);
 for(let i=0;i<ours.length;i++)for(let j=0;j<i;j++)assert.ok(Math.hypot(ours[i].x-ours[j].x,ours[i].y-ours[j].y,ours[i].z-ours[j].z)>(ours[i].profile.length+ours[j].profile.length)*.8);
 const light=ours.find(s=>s.type==='Light_Fighter'),heavy=ours.find(s=>s.type==='Interceptor');
 assert.ok(light.x<heavy.x);assert.ok(formationGoal(light,enemy[0],fleetFronts([ours,enemy])).assembling);
 const stations=ours.map(s=>structuredClone(s.station));advanceSpatialBattle(b,T+70000);
 assert.deepEqual(ours.map(s=>s.station),stations);assert.ok(ours.filter(s=>s.profile.role==='line').every(s=>!s.attackRun));
 assert.ok(b.events.some(e=>e.type==='fire'),'spread battle lines must actually exchange fire');
 assert.ok(ours.filter(s=>s.profile.role==='line'&&s.hp>0).every(s=>Math.abs(s.z-s.station.z)<s.station.spacing*.2),'main line does not chase targets into a central pile');
});
