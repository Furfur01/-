import test from 'node:test';
import assert from 'node:assert/strict';
import {missionVisual} from '../game/mission-visual.mjs';
import {createWorld,createPlayer,act,snapshot} from '../game/engine.mjs';
import {trialCatalog,validateTrial} from '../game/battle-trial.mjs';

test('outbound and return expose models at both ends, a single cruise icon, and retain arrival times',()=>{
 for(const phase of ['outbound','return'])for(const duration of [500,20000,600000]){
  const m={phase,start:1000,end:1000+duration},before=structuredClone(m),edge=Math.min(8000,duration*.30);
  assert.equal(missionVisual(m,1000).stage,'departing');assert.equal(missionVisual(m,1000).model,1);
  assert.equal(missionVisual(m,1000+edge*.7).stage,'warp-in');
  const cruise=missionVisual(m,1000+duration/2);assert.equal(cruise.stage,'cruise');assert.equal(cruise.model,0);assert.equal(cruise.travel,.5);
  const arrival=missionVisual(m,m.end-edge*.5);assert.equal(arrival.stage,'warp-out');assert.equal(arrival.model,1);
  assert.equal(missionVisual(m,m.end).progress,1);assert.deepEqual(m,before);
 }
 assert.equal(missionVisual({phase:'holding',start:0,end:60000},1000).stage,'holding');
});

test('temporarily removed hulls cannot be built, dispatched or selected for trials; saves remain intact',()=>{
 const time=1800000000000,w=createWorld(time),p=createPlayer(w,'舰队名单',time,()=>.5),home=w.planets[p.home];
 home.ships={Death_Star:2,Guardian:3,Cruiser:4};home.resources=[1e8,1e8,1e8];
 const target=Object.values(w.planets).find(t=>t.npc);
 for(const id of ['Death_Star','Guardian']){
  assert.throws(()=>act(w,p,{type:'ship',planet:home.id,id,count:1},time),/暂时移出/);
  assert.throws(()=>act(w,p,{type:'dispatch',planet:home.id,target:target.id,position:target.position,task:'attack',ships:{[id]:1}},time),/暂时移出/);
  assert.throws(()=>validateTrial({attacker:{[id]:1},defender:{Cruiser:1}}),/无效/);
  assert(!trialCatalog().ships.some(s=>s.id===id));assert(trialCatalog().presets.every(p=>!p.fleet[id]));
 }
 assert.deepEqual(snapshot(w,p).planets.find(x=>x.id===home.id).ships,home.ships);
 assert.equal(w.missions.length,0);
});

test('recalling a mission records its actual turning point without changing return duration',()=>{
 const time=1800000000000,w=createWorld(time),p=createPlayer(w,'返航',time,()=>.5),home=w.planets[p.home];
 home.ships={Cruiser:4};home.resources=[1e8,1e8,1e8];const target=Object.values(w.planets).find(t=>t.npc);
 act(w,p,{type:'dispatch',planet:home.id,target:target.id,position:target.position,task:'attack',ships:{Cruiser:2}},time);
 const m=w.missions[0],elapsed=Math.floor(m.travel*.4);act(w,p,{type:'recall',id:m.id},time+elapsed);
 assert.equal(m.phase,'return');assert.equal(m.recalledElapsed,elapsed);assert.equal(m.end-m.start,elapsed);
});
