import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer,ensureSystemNpcs,snapshot,act,advance} from '../game/engine.mjs';
import {starMap} from '../game/star-map.mjs';
const T=1800000000000;
test('NPC stocks remain private until scouted; historical reconnaissance is explicitly dated',()=>{
 const w=createWorld(T),p=createPlayer(w,'Scanner',T),other=createPlayer(w,'Other',T);ensureSystemNpcs(w,1,20);const target=Object.values(w.planets).find(p=>p.npcType==='cargo'&&p.position[1]===20);
 const intel=player=>snapshot(w,player).map.find(p=>p.id===target.id).intel;
 assert.equal(intel(p),null);assert.equal(intel(other),null);
 p.reports.unshift({type:'spy',at:T-1000,position:target.position,resources:[10,20,30]});
 assert.deepEqual(intel(p).resources,[10,20,30]);assert.equal(intel(p).resourceAt,T-1000);assert.equal(intel(p).resourceSource,'spy');assert.equal(intel(other),null);
 assert(!('intel' in starMap(w).planets.find(p=>p.id===target.id)));
});
test('cargo victory exposes remaining stock, tracks automatic return and deposits loot exactly once',()=>{
 const w=createWorld(T),p=createPlayer(w,'Raider',T),home=w.planets[p.home];ensureSystemNpcs(w,1,20);const target=Object.values(w.planets).find(p=>p.npcType==='cargo'&&p.position[1]===20);
 home.resources=[1e8,1e8,1e8];home.ships={Dreadnought:30,Large_Cargo_Ship:5};
 act(w,p,{type:'dispatch',planet:home.id,target:target.id,position:target.position,task:'attack',ships:{...home.ships}},T);
 const m=w.missions[0];advance(w,m.end);for(let i=0;i<70&&m.phase==='engaged';i++)advance(w,w.at+10000);
 const report=p.reports.find(r=>r.type==='battle');assert.equal(report.winner,'attacker');assert.equal(m.phase,'return');assert.deepEqual(report.loot,m.cargo);
 const intel=()=>snapshot(w,p).map.find(p=>p.id===target.id).intel;
 assert.equal(intel().battle.delivery,'returning');assert.deepEqual(intel().resources,target.resources.map(Math.floor));assert(report.remainingResources.every((v,i)=>v<=target.resources[i]));assert.equal(intel().battle.returnAt,m.end);
 const before=[...home.resources];advance(w,m.end);assert.deepEqual(home.resources,before.map((v,i)=>v+report.loot[i]));assert.equal(intel().battle.delivery,'delivered');assert.equal(report.deliveries[0].status,'delivered');
 const delivered=[...home.resources];advance(w,w.at);assert.deepEqual(home.resources,delivered);
 assert(p.reports.some(r=>r.type==='fleet'&&r.battleId===report.battleId));
});
