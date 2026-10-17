import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer,migrateWorld,ensureCommanders,snapshot,act,advance} from '../game/engine.mjs';
import {commanders,factions} from '../game/factions.mjs';
import {units} from '../game/catalog.mjs';

const T=1800000000000;
test('three federations have distinct garrisons, subordinate knights and neutral lords',()=>{
  const world=createWorld(T),player=createPlayer(world,'测试',T,()=>.001),state=snapshot(world,player);
  const roster=state.map.filter(p=>p.commander&&!p.moon&&world.players[p.owner].home===p.id);
  assert.equal(roster.length,18);
  assert.equal(roster.filter(p=>p.commander.title==='大将军').length,3);
  assert.equal(roster.filter(p=>p.commander.superiorName).length,9);
  assert.equal(roster.filter(p=>p.commander.factionId===null).length,6);
  assert.equal(new Set(Object.values(world.planets).map(p=>p.position.join(':'))).size,Object.keys(world.planets).length);
  for(const npc of commanders)for(const [id,count]of Object.entries(npc.ships)){assert.ok(units[id]);assert.ok(Number.isSafeInteger(count)&&count>0);}
  for(const faction of factions){
    const members=roster.filter(p=>p.commander.factionId===faction.id),general=members.find(p=>p.commander.title==='大将军');
    assert.equal(members.length,4);
    for(const knight of members.filter(p=>p!==general)){assert.equal(knight.commander.superiorName,general.ownerName);assert.ok(knight.commander.power<general.commander.power);}
  }
  assert.ok(roster.every(p=>Number.isFinite(p.commander.power)&&p.commander.power>0&&!('ships'in p)&&!('resources'in p)));
  const weak=roster[0],before=weak.commander.power;
  world.planets[weak.id].ships={};world.planets[weak.id].defense={};
  assert.ok(snapshot(world,player).map.find(p=>p.id===weak.id).commander.power<before);
});

test('legacy migration adds commanders without occupying colonies or incoming colony destinations',()=>{
  const world=createWorld(T),player=createPlayer(world,'原有玩家',T,()=>.001);
  for(const owner of Object.values(world.players).filter(p=>p.commander)){delete world.planets[owner.home];delete world.players[owner.id];}
  const home=world.planets[player.home];home.position=[...commanders[0].position];
  world.missions.push({id:'colony-flight',task:'colonize',phase:'outbound',position:[...commanders[1].position],end:T+10000});
  const oldPlanets=structuredClone(world.planets),oldPlayer=structuredClone(player),oldMissions=structuredClone(world.missions);
  migrateWorld(world);
  for(const [id,planet]of Object.entries(oldPlanets))assert.deepEqual(world.planets[id],planet);
  assert.deepEqual(world.players[player.id],oldPlayer);assert.deepEqual(world.missions,oldMissions);
  assert.ok(!Object.values(world.planets).some(p=>p.position.join(':')===commanders[1].position.join(':')));
  const npc=Object.values(world.players).find(p=>p.commander),base=world.planets[npc.home];
  base.ships={};base.resources=[1,2,3];
  const saved=JSON.stringify(world);migrateWorld(world);ensureCommanders(world);assert.equal(JSON.stringify(world),saved);
  const loaded=JSON.parse(saved);migrateWorld(loaded);assert.equal(JSON.stringify(loaded),saved);
});

test('named commanders use normal reconnaissance, combat reports, losses and return flight',()=>{
  const world=createWorld(T),player=createPlayer(world,'远征者',T,()=>.001),home=world.planets[player.home];
  const target=world.planets['commander:frontier:grey-harbor:home'];
  home.resources=[1e8,1e8,1e8];home.ships={Probe:1,Dreadnought:100};player.tech.Computer_Tech=2;
  act(world,player,{type:'dispatch',planet:home.id,position:target.position,target:target.id,task:'spy',ships:{Probe:1}},world.at);
  advance(world,world.missions[0].end);
  assert.deepEqual(player.reports[0].technology,world.players[target.owner].tech);
  advance(world,world.missions[0].end);
  act(world,player,{type:'dispatch',planet:home.id,position:target.position,target:target.id,task:'attack',ships:{Dreadnought:100}},world.at);
  advance(world,world.missions[0].end);
  finishCombat(world);const report=player.reports.find(r=>r.type==='battle');
  assert.equal(report.defenderName,'洛恩');assert.equal(report.winner,'attacker');assert.equal(report.engine,'spatial-v2');
  assert.deepEqual(target.ships,{});
  const survivorState=structuredClone(target);migrateWorld(world);assert.deepEqual(target,survivorState);
  advance(world,world.missions[0].end);
  assert.equal(world.missions.length,0);assert.equal(player.reports.filter(r=>r.type==='battle').length,1);
});

function finishCombat(world){let guard=0;while(Object.values(world.battles||{}).some(b=>b.status==='active')&&guard++<601)advance(world,world.at+1000);}
