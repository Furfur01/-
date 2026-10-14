import test from 'node:test';
import assert from 'node:assert/strict';
import {projectileContact} from '../game/projectile-contact.mjs';
import {createSpatialBattle,addSpatialFleet,stepSpatialBattle} from '../game/spatial-battle.mjs';
import {units} from '../game/catalog.mjs';

test('swept contact resolves entry, grazing misses and crossing moving fighters',()=>{
  assert.equal(projectileContact([0,0,0],[100,0,0],[50,0,0],2),.48);
  assert.equal(projectileContact([0,3,0],[100,3,0],[50,0,0],2),null);
  assert.equal(projectileContact([50,0,0],[100,0,0],[50,0,0],2),0);
  const moving=projectileContact([0,0,0],[100,0,0],[50,20,0],1,[50,-20,0]);
  assert.ok(moving>.48&&moving<.5,'moving fighter crossing the ray is struck inside the step');
});

test('a fast shell strikes the first intervening enemy exactly once, not its locked target',()=>{
  const b=createSpatialBattle({id:'contact',attacker:'a',defender:'d',start:0});
  addSpatialFleet(b,{fleet:{Light_Fighter:2},side:'attacker',owner:'a'},units);
  addSpatialFleet(b,{fleet:{Light_Fighter:2},side:'defender',owner:'d'},units);
  for(const s of b.ships){s.x=[0,10,70,30][s.id];s.y=s.z=0;s.speed=s.attack=0;s.profile={...s.profile,speed:0,pointDefense:false};}
  b.projectiles.push({id:7,source:0,target:2,side:'attacker',kind:'shell',damage:7,x:0,y:0,z:0,dx:100,dy:0,dz:0,speed:2000,ttl:2});
  const before=b.ships.map(s=>s.hp+s.shield);stepSpatialBattle(b);
  assert.equal(b.projectiles.length,0);
  assert.deepEqual(b.ships.map((s,i)=>before[i]-s.hp-s.shield),[0,0,0,7]);
  const hits=b.events.filter(e=>e.projectileId===7);assert.equal(hits.length,1);assert.equal(hits[0].shipId,3);
  assert.ok(Math.abs(hits[0].x-(30-b.ships[3].profile.radius-.4))<1e-8,'event lies on front surface');
  stepSpatialBattle(b);assert.equal(b.events.filter(e=>e.projectileId===7).length,1);
});
