import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer,act,advance,migrateWorld,snapshot,ensureSystemNpcs} from '../game/engine.mjs';
import {colonyLimit,polity,systemKey,nearestSystems,migrateSovereignty} from '../game/sovereignty.mjs';
import {starMap,systemPositions} from '../game/star-map.mjs';
const T=1800000000000;
function fixture(){const w=createWorld(T),a=createPlayer(w,'测试殖民甲',T,()=>0),b=createPlayer(w,'测试殖民乙',T,()=>.5);for(const p of[a,b]){p.tech={Astrophysics_Tech:1,Computer_Tech:20};Object.assign(w.planets[p.home],{resources:[1e8,1e8,1e8],ships:{Colony_Ship:20,Cargo_Ship:5}});}return {w,a,b};}
function emptySystem(w){return w.sovereignty.safeSystems.find(s=>!w.sovereignty.claims[`1:${s}`]);}
function launch(w,p,s,slot=7){act(w,p,{type:'dispatch',planet:p.home,position:[1,s,slot],task:'colonize',ships:{Colony_Ship:1,Cargo_Ship:1},cargo:[100,200,300]},w.at);return w.missions.at(-1);}
test('first successful arrival owns the whole system; later fleet returns ships and cargo',()=>{
  const {w,a,b}=fixture(),s=emptySystem(w),first=launch(w,a,s),second=launch(w,b,s,8);
  // Launch order is deliberately opposite arrival order.
  first.end=T+2000;second.end=T+1000;advance(w,T+1000);
  assert.equal(w.sovereignty.claims[`1:${s}`].owner,b.id);assert.equal(w.planets[b.home].ships.Colony_Ship,19);
  advance(w,T+2000);assert.equal(first.phase,'return');assert.deepEqual(first.ships,{Colony_Ship:1,Cargo_Ship:1});assert.deepEqual(first.cargo,[100,200,300]);
  assert.match(a.reports[0].body,/其他势力已先抵达/);assert.throws(()=>launch(w,a,s,9),/其他势力/);
  advance(w,first.end);assert.equal(w.planets[a.home].ships.Colony_Ship,20);assert.equal(w.planets[a.home].ships.Cargo_Ship,5);
  const more=launch(w,b,s,11);advance(w,more.end);assert.equal(Object.values(w.planets).filter(p=>p.owner===b.id&&p.position[1]===s).length,2);
});
test('colonization limits scale by ten; outgoing missions reserve capacity and moons do not consume it',()=>{
  for(const [level,expected]of [[0,1],[1,11],[5,51],[10,101]])assert.equal(colonyLimit({tech:{Astrophysics_Tech:level}}),expected);
  const {w,a}=fixture(),home=w.planets[a.home];w.planets['test-moon']={...structuredClone(home),id:'test-moon',moon:true,parent:home.id};
  home.ships.Cargo_Ship=20;const s=emptySystem(w);for(const slot of [3,5,7,8,10,11,12,13,14,15])launch(w,a,s,slot);
  assert.throws(()=>launch(w,a,s,11),/名额/);const state=snapshot(w,a);assert.equal(state.player.colonyCount,1);assert.equal(state.player.colonyReserved,10);assert.equal(state.player.colonyLimit,11);
  for(const m of [...w.missions])advance(w,Math.max(w.at,m.end));assert.equal(snapshot(w,a).player.colonyCount,11);
});
test('starting neighborhood has five neutral camps per system and no computer realms',()=>{
  const {w,a}=fixture();for(const s of w.sovereignty.safeSystems){ensureSystemNpcs(w,1,s);const local=Object.values(w.planets).filter(p=>p.position[0]===1&&p.position[1]===s);assert(!local.some(p=>w.players[p.owner]?.bot));assert.equal(local.filter(p=>p.npc&&!p.moon).length,5);}
  const map=starMap(w),origin=systemPositions().find(s=>s.id===16).position;
  for(const p of Object.values(w.planets).filter(p=>p.owner&&!p.moon)){assert.equal(p.position[0],1);assert.equal(map.systems.find(s=>s.id===p.position[1]).systemOwner,polity(w,p.owner).id);}
  for(const id of['iron','dawn']){const systems=map.systems.filter(s=>s.systemOwner==='faction:'+id);assert.equal(systems.length,16);assert(systems.every(s=>s.position[0]*origin[0]+s.position[2]*origin[2]<0));}
  const before=JSON.stringify(w);starMap(w);assert.equal(JSON.stringify(w),before);
});
test('sovereignty migration keeps human progress and neutral camps in place',()=>{
  const {w,a}=fixture(),home=w.planets[a.home],bot=Object.values(w.players).find(p=>p.bot&&!p.commander),camp=Object.values(w.planets).find(p=>p.npc);
  w.planets[bot.home].position=[...home.position.slice(0,2),3];camp.position=[...home.position.slice(0,2),2];camp.ships={};camp.resources=[1,2,3];
  a.reports=[{title:'旧战报',position:[1,16,3]}];a.researchQueue={id:'Astrophysics_Tech',end:T+9999};home.buildQueue={id:'Metal_Mine',end:T+9999};
  delete w.sovereignty;for(const p of Object.values(w.planets))if(p.id.startsWith('realm:'))delete w.planets[p.id];
  const before=structuredClone({a,home,camp});migrateSovereignty(w);
  assert.deepEqual(a,before.a);assert.deepEqual(home,before.home);assert.deepEqual(camp,before.camp);
  assert.notEqual(w.planets[bot.home].position[1],home.position[1]);assert.equal(w.sovereignty.claims[systemKey(home.position)].owner,a.id);
  const saved=JSON.stringify(w);migrateSovereignty(w);assert.equal(JSON.stringify(w),saved);
});
test('battle victories never transfer sovereignty',()=>{
  const {w,a}=fixture(),target=Object.values(w.planets).find(p=>w.players[p.owner]?.bot&&!p.moon),owner=w.sovereignty.claims[systemKey(target.position)].owner;
  target.ships={};target.defense={};w.planets[a.home].ships.Light_Fighter=2;
  act(w,a,{type:'dispatch',planet:a.home,position:target.position,target:target.id,task:'attack',ships:{Light_Fighter:2}},T);
  advance(w,w.missions[0].end);advance(w,w.at+1000);assert.equal(w.sovereignty.claims[systemKey(target.position)].owner,owner);
});
