import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createSpatialBattle,addSpatialFleet,stepSpatialBattle,battleMount} from '../game/spatial-battle.mjs';
import {trialUnits} from '../game/battle-trial.mjs';

function fixture(type){
 const b=createSpatialBattle({id:'salvos',attacker:'a',defender:'d',start:0,seed:42});
 addSpatialFleet(b,{fleet:{[type]:1},owner:'a',side:'attacker'},trialUnits);
 addSpatialFleet(b,{fleet:{Death_Star:1},owner:'d',side:'defender'},trialUnits);
 for(const s of b.ships){s.x=s.id*500;s.y=s.z=s.speed=0;s.profile={...s.profile,speed:0,turn:0};s.yaw=Math.PI/2;s.target=1-s.id;s.cooldown=0;}
 b.ships[1].attack=0;b.ships[1].profile.pointDefense=false;return b;
}
test('cruiser fires two missiles per 16 seconds, rotates tubes and survives checkpoint restoration',()=>{
 const b=fixture('Cruiser'),s=b.ships[0];stepSpatialBattle(b);
 const q=b.projectiles.find(q=>q.missile),e=b.events.find(e=>e.projectileId===q.id);
 assert.deepEqual(e.from,battleMount(s,s.profile.hardpoints.tubes[0]));
 assert.equal(e.from[1]>s.y,true,'vertical launcher is above the hull');
 assert.equal(b.salvos.length,1);assert.equal(q.vy,38);assert.equal(q.vx,0);
 const copy=structuredClone(b);for(let i=0;i<50;i++){stepSpatialBattle(b);stepSpatialBattle(copy);}
 assert.deepEqual(b,copy);const shots=b.events.filter(e=>e.type==='fire'&&e.kind==='missile');
 assert.equal(shots.length,2);assert.equal(new Set(shots.map(e=>e.projectileId)).size,2);assert.equal(new Set(shots.map(e=>e.tick)).size,2);
 assert.ok(b.projectiles.some(q=>q.missile&&q.vx>100),'ignited missiles bend toward target');
 assert.deepEqual(shots.map(e=>e.barrel),[0,6]);
 assert.equal(s.profile.missileCooldown,16);assert.equal(s.profile.missileSalvo,2);
 while(b.tick<310)stepSpatialBattle(b);assert.equal(b.events.filter(e=>e.type==='fire'&&e.shipId===0&&e.kind==='missile').length,2);
 while(b.tick<330)stepSpatialBattle(b);assert.deepEqual(b.events.filter(e=>e.type==='fire'&&e.shipId===0&&e.kind==='missile').map(e=>e.barrel),[0,6,1,7]);
 assert.ok(b.events.some(e=>e.type==='hit'&&e.kind==='missile')||b.projectiles.some(q=>q.missile));
});
test('dead source cancels unlaunched rounds; completed salvo damage is divided across ports',()=>{
 const b=fixture('Bomber');stepSpatialBattle(b);const q=b.projectiles.find(q=>q.missile);
 assert.equal(b.salvos.filter(o=>o.missile).length,7);const total=q.damage+b.salvos.filter(o=>o.missile).reduce((n,o)=>n+o.damage,0);assert.ok(Math.abs(total-b.ships[0].attack*.88*5/6)<1e-8);
 b.ships[0].hp=0;stepSpatialBattle(b);assert.equal(b.salvos.length,0);assert.equal(b.events.filter(e=>e.kind==='missile'&&e.type==='fire').length,1);
});
test('all playable military types have low meshes, main barrels and auxiliary loadouts match practice',()=>{
 const assets=JSON.parse(fs.readFileSync(new URL('../opendesign/mockups/galactic-command/battle-fleet.json',import.meta.url)));
 for(const type of ['Interceptor','Devourer_Interceptor','Titanenergetic_Frigate','Reaper','Annihilator','Death_Star','Iron_Behemoth'])assert.ok(assets.ships.find(s=>s.id===type)?.low.floatCount>0,type+' must never disappear at LOD switch');
 for(const type of ['Destroyer','Battleship','Devourer_Interceptor']){
  const b=fixture(type);for(let i=0;i<10;i++)stepSpatialBattle(b);
  const primary=b.events.filter(e=>e.type==='fire'&&!e.secondary);
  assert.equal(primary.length,b.ships[0].profile.hardpoints.main.length);
  assert.equal(new Set(primary.map(e=>JSON.stringify(e.from))).size,primary.length);
 }
 assert.ok(fixture('Devourer_Interceptor').ships[0].profile.secondaryMissile,'practice missile equipment must also work in battles');
});
