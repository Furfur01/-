import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer} from '../game/engine.mjs';
import {startTrial,trialPresets} from '../game/battle-trial.mjs';
import {advanceSpatialBattle,battleMount,controlBattle,stepSpatialBattle} from '../game/spatial-battle.mjs';

test('opposed fleets approach in three dimensions and main hulls hold their lateral stations',()=>{
 const w=createWorld(0),p=createPlayer(w,'Pitch',0),fleet=trialPresets.at(-1).fleet,b=startTrial(w,p,{attacker:fleet,defender:fleet},0);
 const stations=b.ships.map(s=>({...s.station}));advanceSpatialBattle(b,45000);
 for(const side of ['attacker','defender']){
  const ships=b.ships.filter(s=>s.side===side&&s.hp>0);
  assert.ok(ships.some(s=>s.pitch>.04));assert.ok(ships.some(s=>s.pitch<-.04));
  assert.ok(ships.some(s=>Math.abs(s.y-s.station.y)>10),'altitude changes are simulated, not cosmetic tilt');
  assert.ok(ships.filter(s=>s.profile.role==='line').every(s=>Math.abs(s.z-s.station.z)<s.station.spacing*.2));
 }
 assert.deepEqual(b.ships.map(s=>s.station),stations);
});
test('manual pitch changes altitude, hardpoint axes and remains authoritative after release',()=>{
 const w=createWorld(0),p=createPlayer(w,'Pilot',0),b=startTrial(w,p,{attacker:{Destroyer:1},defender:{Destroyer:1}},0),s=b.ships[0],start=s.y;
 controlBattle(b,p.id,{type:'claim',shipId:s.id});
 for(let i=1;i<=20;i++){controlBattle(b,p.id,{type:'input',shipId:s.id,seq:i,input:{pitch:1,yaw:0,throttle:1,fire:false}});stepSpatialBattle(b);}
 assert.ok(s.pitch>.4);assert.ok(s.y>start);const forward=battleMount(s,[-1,0,0],true);assert.ok(Math.abs(forward[1]-Math.sin(s.pitch))<1e-10);
 const pitch=s.pitch;controlBattle(b,p.id,{type:'release'});assert.equal(s.pitch,pitch,'releasing cannot reset attitude');
});
