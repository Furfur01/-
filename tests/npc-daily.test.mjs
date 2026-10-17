import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer,ensureSystemNpcs,advance,act,migrateWorld,snapshot,economy} from '../game/engine.mjs';
import {npcTypes,npcType} from '../game/npc-types.mjs';
import {NPC_DAY_MS,npcDay,nextNpcRefresh,migrateNpcDaily,refreshNpcCamp} from '../game/npc-daily.mjs';
const midnight=Date.parse('2026-10-16T16:00:00Z'),T=midnight-60000;
function fixture(at=T){const w=createWorld(at),player=createPlayer(w,'测试每日野怪',at,()=>0),home=w.planets[player.home];ensureSystemNpcs(w,1,20);home.resources=[1e8,1e8,1e8];home.ships={Dreadnought:30,Large_Cargo_Ship:5};player.tech={Computer_Tech:10};return {w,player,home,camps:Object.values(w.planets).filter(p=>p.npc&&p.position[1]===20)};}

test('each tier has five times the previous daily stock and ordinary production never changes it',()=>{
  const types=[...npcTypes].sort((a,b)=>a.level-b.level);for(let i=1;i<types.length;i++)assert.deepEqual(types[i].resources,types[i-1].resources.map(n=>n*5));
  const {w,home,camps}=fixture(midnight-4*3600000);home.buildings={Metal_Mine:1,Solar_Plant:4};home.resources=[0,0,0];
  camps[0].buildings.Fusion_Reactor=10;const saved=structuredClone(camps);
  for(const p of camps)assert.deepEqual(economy(p,w).rate,[0,0,0]);
  advance(w,midnight-1);assert.deepEqual(camps,saved);assert(home.resources[0]>0);assert(camps.at(-1).resources[0]>1e6);
});

test('Beijing midnight resets exactly once, preserves debris and never accumulates missed days',()=>{
  const {w,camps}=fixture(),target=camps[0],type=npcType(target);target.resources=[1,2,3];target.ships={};target.defense={};target.debris=[123,456,0];
  assert.equal(nextNpcRefresh(T),midnight);advance(w,midnight-1);assert.deepEqual(target.resources,[1,2,3]);assert.deepEqual(target.ships,{});
  advance(w,midnight);assert.deepEqual(target.resources,type.resources);assert.deepEqual(target.ships,type.ships);assert.deepEqual(target.defense,type.defense);assert.deepEqual(target.debris,[123,456,0]);
  target.resources=[3,2,1];target.ships={Light_Fighter:1};const depleted=structuredClone(target);advance(w,midnight+60000);assert.deepEqual(target,depleted);
  const restored=migrateWorld(structuredClone(w));assert.deepEqual(restored.planets[target.id],depleted);advance(restored,midnight+3*NPC_DAY_MS+60000);
  const refreshed=restored.planets[target.id];assert.deepEqual(refreshed.resources,type.resources);assert.deepEqual(refreshed.ships,type.ships);assert.equal(refreshed.npcRefreshDay,npcDay(midnight)+3);
  assert.notEqual(refreshed.resources,type.resources);assert.notEqual(refreshed.ships,type.ships);
});

test('an attack arriving at midnight fights the new daily fleet',()=>{
  const {w,player,home,camps}=fixture(),target=camps.find(p=>p.npcType==='cargo'),type=npcType(target);target.resources=[0,0,0];target.ships={};
  act(w,player,{type:'dispatch',planet:home.id,target:target.id,position:target.position,task:'attack',ships:{Dreadnought:1}},T);w.missions[0].end=midnight;
  advance(w,midnight);const b=Object.values(w.battles).find(b=>b.target===target.id);assert(b);assert.deepEqual(b.initial.defender,type.ships);assert.deepEqual(target.resources,type.resources);
});

test('midnight during battle defers refresh until settlement, then restores one fleet and invalidates old intelligence',()=>{
  const {w,player,home,camps}=fixture(),target=camps.find(p=>p.npcType==='garrison'),type=npcType(target);target.resources=[12,18,6];
  act(w,player,{type:'dispatch',planet:home.id,target:target.id,position:target.position,task:'attack',ships:{Dreadnought:30,Large_Cargo_Ship:5}},T);w.missions[0].end=midnight-100;
  advance(w,midnight-100);const b=Object.values(w.battles).find(b=>b.target===target.id),initial=structuredClone(b.initial);advance(w,midnight);
  assert.equal(b.status,'active');assert.deepEqual(b.initial,initial);assert.deepEqual(target.resources,[12,18,6]);assert.equal(target.npcRefreshDay,npcDay(T));assert.deepEqual(target.ships,{});
  for(let i=0;i<120&&b.status==='active';i++)advance(w,w.at+5000);assert.equal(b.status,'finished');
  assert.deepEqual(target.resources,type.resources);assert.deepEqual(target.ships,type.ships);assert.deepEqual(target.defense,type.defense);
  const report=player.reports.find(r=>r.battleId===b.id&&r.type==='battle');assert(report.loot.every((n,i)=>n<=[6,9,3][i]));
  const intel=snapshot(w,player).map.find(p=>p.id===target.id).intel;assert.equal(intel.refreshExpired,true);assert.equal(intel.resources,null);assert.equal(intel.defenders,null);assert(intel.battle);
  target.resources=[1,2,3];const after=structuredClone(target);advance(w,w.at+1000);assert.deepEqual(target,after);
});

test('legacy migration updates only neutral camps and never repeats on same-day reload',()=>{
  const {w,camps}=fixture(),before=structuredClone(w),target=camps[0];delete w.npcDailyVersion;delete w.npcDailyDay;
  for(const p of Object.values(w.planets).filter(p=>p.npc)){delete p.npcRefreshDay;delete p.npcRefreshedAt;p.resources=[1,2,3];p.ships={};p.defense={};}
  migrateNpcDaily(w);assert.deepEqual(w.players,before.players);for(const p of Object.values(before.planets).filter(p=>!p.npc))assert.deepEqual(w.planets[p.id],p);
  assert.deepEqual(target.resources,npcType(target).resources);target.resources=[2,1,0];const once=JSON.stringify(w);migrateNpcDaily(w);assert.equal(JSON.stringify(w),once);
});

test('transport cannot increase NPC stock; old in-flight deliveries return cargo intact',()=>{
  const {w,player,home,camps}=fixture(),target=camps[0],before=structuredClone({home,target});
  assert.throws(()=>act(w,player,{type:'dispatch',planet:home.id,target:target.id,position:target.position,task:'transport',ships:{Large_Cargo_Ship:1},cargo:[100,200,300]},T),/不接收运输/);
  assert.deepEqual({home,target},before);
  const mission={id:'test-legacy-cargo',owner:player.id,from:home.id,target:target.id,position:target.position,task:'transport',ships:{Large_Cargo_Ship:1},cargo:[100,200,300],phase:'outbound',start:T,end:T+1000,travel:1000};w.missions.push(mission);
  advance(w,T+1000);assert.equal(mission.phase,'return');assert.deepEqual(mission.cargo,[100,200,300]);assert.deepEqual(target,before.target);
});

test('migration defers active legacy battles without altering their fleets or stock',()=>{
  const {w,camps}=fixture(),target=camps[0];delete w.npcDailyVersion;delete target.npcRefreshDay;delete target.npcRefreshedAt;
  target.resources=[1,2,3];target.ships={};w.battles??={};w.battles.legacy={target:target.id,status:'active',initial:{defender:{Light_Fighter:1}}};const battle=structuredClone(w.battles.legacy);
  migrateNpcDaily(w);assert.deepEqual(w.battles.legacy,battle);assert.deepEqual(target.resources,[1,2,3]);assert.deepEqual(target.ships,{});assert.equal(target.npcRefreshDay,npcDay(T)-1);
  w.battles.legacy.status='finished';assert(refreshNpcCamp(w,target,T));assert.deepEqual(target.resources,npcType(target).resources);assert.deepEqual(target.ships,npcType(target).ships);
});
