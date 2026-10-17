import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {planetBattleEnvironment,battleViewEnvironment,arrivingBattlePosition,surfaceHeight} from '../game/battle-terrain.mjs';
import {createSpatialBattle,addSpatialFleet,packedShips,spatialSnapshot} from '../game/spatial-battle.mjs';
import {fleetStations} from '../game/fleet-formation.mjs';
import {combatProfile} from '../game/spatial-profiles.mjs';
import {units} from '../game/catalog.mjs';
import {localBattleTarget,openLocalBattle} from '../scripts/three-flight/local-battle.js';

test('historical playback never redirects into the live star map, even with a battle parameter',async()=>{
 for(const query of ['replay=report','replay=report&battle=live']){
  assert.equal(await openLocalBattle(new URLSearchParams(query)),false);
 }
});

test('warp exit ends at the authoritative attacking stations, including surface clearance',()=>{
 const fleet={Bomber:40,Battleship:20,Light_Fighter:120},environment=planetBattleEnvironment({id:'local',biome:'mars'});
 const b=createSpatialBattle({id:'arrival',start:0,environment});
 addSpatialFleet(b,{fleet,side:'attacker',owner:'a'},units);
 const entries=Object.entries(fleet).sort(([a],[b])=>a.localeCompare(b));
 const stations=fleetStations(entries,id=>combatProfile(units[id]));
 for(const [type,slots]of stations){
  const ships=b.ships.filter(s=>s.type===type);
  slots.forEach((station,i)=>{
   const pos=arrivingBattlePosition(station,ships[i].profile,environment,0);
   assert.deepEqual(pos,[ships[i].x,ships[i].y,ships[i].z]);
   assert(pos[1]>=surfaceHeight(environment,pos[0],pos[2]));
  });
 }
});

test('legacy presentation keeps coordinates and outcome intact while placing the local surface nearby',()=>{
 const b=createSpatialBattle({id:'old',start:0});
 addSpatialFleet(b,{fleet:{Cruiser:3},side:'attacker',owner:'a'},units);
 const before=structuredClone(b),rows=packedShips(b),view=spatialSnapshot(b);
 assert.equal(view.environment.kind,'planet');assert.deepEqual(view.ships,rows);assert.deepEqual(b,before);
 assert(surfaceHeight(view.environment,700,0)<-700);
 const env=planetBattleEnvironment({id:'moon',moon:true});assert.equal(battleViewEnvironment(env),env);
});

test('map placement never switches to the old enlarged deep-space coordinates',()=>{
 const source=fs.readFileSync(new URL('../opendesign/mockups/planet-construction-review/aurora-battles.js',import.meta.url),'utf8');
 const api=vm.runInNewContext(source+';({scale:auroraBattleScale,anchor:auroraBattleAnchor})',{
  sub:(a,b)=>a.map((v,i)=>v-b[i]),mul:(a,k)=>a.map(v=>v*k)
 });
 const p={radius:16,position:[100,200,300]},env=planetBattleEnvironment();
 assert.equal(api.scale(p,{}),16*1.3/12000);
 const anchor=api.anchor(p,{environment:env});
 assert.deepEqual(Array.from(anchor,(v,i)=>v+env.center[i]*api.scale(p)),p.position);
 const entry=api.anchor(p),replay=api.anchor(p,{environment:env});assert.deepEqual(entry,replay);
});

test('replay and standalone links resolve the exact local body, including moons at shared coordinates',()=>{
 const planets=[{id:'home',position:[1,16,3]},{id:'moon',position:[1,16,3],moon:true}];
 assert.equal(localBattleTarget({report:{targetId:'moon',position:[1,16,3]},record:{}},planets),planets[1]);
 assert.equal(localBattleTarget({target:'home'},planets),planets[0]);
 assert.equal(localBattleTarget({report:{position:[1,16,3]},record:{}},planets),planets[0]);
 assert.equal(localBattleTarget({report:{trial:true},record:{environment:{planetId:'home'}}},planets),planets[0]);
 assert.equal(localBattleTarget({target:'external-fixture'},planets),null);
});
