import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer,act,advance,explore,migrateWorld} from '../game/engine.mjs';
import {units} from '../game/catalog.mjs';

const T=1800000000000,fleet={Large_Cargo_Ship:2,Light_Fighter:8};
function fixture(){const world=createWorld(T),player=createPlayer(world,'探险测试',T,()=>.5),home=world.planets[player.home];home.resources=[1e8,1e8,1e8];home.buildings={};home.ships={...fleet};player.tech={Astrophysics_Tech:4,Computer_Tech:4};return {world,player,home};}
function dispatch(f,event){act(f.world,f.player,{type:'dispatch',planet:f.home.id,ships:fleet,position:[1,20,16],task:'explore',holdHours:-10},T);const m=f.world.missions[0];m.seed=Array.from({length:1000},(_,i)=>i).find(seed=>explore(fleet,seed).event===event);assert.ok(Number.isInteger(m.seed));return m;}

test('resources stay aboard until return and survive save/load without duplication',()=>{
  const f=fixture(),m=dispatch(f,'resources');advance(f.world,m.end);const end=m.end;advance(f.world,end);
  assert.equal(m.phase,'return');const cargo=[...m.cargo],before=[...f.home.resources];
  assert.equal(cargo.reduce((a,b)=>a+b,0),Math.min(explore(fleet,m.seed).discovered.amount,Object.entries(fleet).reduce((sum,[id,n])=>sum+n*units[id].cargo,0)));
  const restored=JSON.parse(JSON.stringify(f.world));migrateWorld(restored);advance(restored,m.end);
  const home=restored.planets[f.home.id];assert.deepEqual(home.resources,before.map((n,i)=>n+cargo[i]));assert.deepEqual(home.ships,fleet);
  advance(restored,m.end+1);assert.deepEqual(home.resources,before.map((n,i)=>n+cargo[i]));assert.equal(restored.players[f.player.id].reports.filter(r=>r.type==='explore').length,1);
});
test('lost expeditions consume ships permanently, free the slot and never return',()=>{
  const f=fixture(),m=dispatch(f,'lost');advance(f.world,m.end);const end=m.end;advance(f.world,end);
  assert.equal(f.world.missions.length,0);assert.ok(Object.values(f.home.ships).every(n=>n===0));assert.equal(f.player.darkMatter,0);
  assert.equal(f.player.reports[0].event,'lost');assert.match(f.player.reports[0].body,/无法返航/);
  assert.throws(()=>act(f.world,f.player,{type:'recall',id:m.id},end),/无法召回/);
  advance(f.world,end+3600000);assert.equal(f.player.reports.length,1);assert.ok(Object.values(f.home.ships).every(n=>n===0));
});
test('pirates generate a battle report and only surviving ships return',()=>{
  const f=fixture(),m=dispatch(f,'pirates'),expected=explore(fleet,m.seed,1,f.player.tech);
  advance(f.world,m.end);advance(f.world,m.end);
  assert.ok(f.player.reports.some(r=>r.type==='battle'));assert.deepEqual(m.ships,expected.combat.survivors.attacker);
  advance(f.world,m.end);for(const id of Object.keys(fleet))assert.equal(f.home.ships[id]||0,expected.ships[id]||0);
});
test('offline advancement settles one full round once and exploration needs technology',()=>{
  const f=fixture();f.player.tech.Astrophysics_Tech=0;
  assert.throws(()=>dispatch(f,'darkMatter'),/天体物理/);f.player.tech.Astrophysics_Tech=1;
  const m=dispatch(f,'darkMatter'),expected=explore(fleet,m.seed).darkMatter;
  advance(f.world,T+2*m.travel+1800000+1);assert.equal(f.world.missions.length,0);assert.equal(f.player.darkMatter,expected);
  advance(f.world,f.world.at+3600000);assert.equal(f.player.darkMatter,expected);
});
