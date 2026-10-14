import test from 'node:test';
import assert from 'node:assert/strict';
import {trialUnits,trialCatalog,trialPresets} from '../game/battle-trial.mjs';
import {units} from '../game/catalog.mjs';
import {createSpatialBattle,addSpatialFleet,stepSpatialBattle,controlBattle} from '../game/spatial-battle.mjs';

test('large flagship is selectable, controllable and uses only its real self-defense mounts',()=>{
 const info=trialCatalog().ships.find(s=>s.id==='Iron_Behemoth');
 assert.ok(info.experimental);assert.equal(units.Iron_Behemoth,undefined);
 assert.equal(info.stats.length,200);assert.equal(info.stats.primary,null);assert.equal(info.stats.secondary.count,4);
 assert.equal(info.stats.missiles.count,4);assert.ok(info.stats.pointDefense);
 const b=createSpatialBattle({id:'flagship',attacker:'a',defender:'d',start:0});
 addSpatialFleet(b,{fleet:{Iron_Behemoth:1},side:'attacker',owner:'a'},trialUnits);
 addSpatialFleet(b,{fleet:{Battleship:1},side:'defender',owner:'d'},trialUnits);
 for(const s of b.ships){s.x=s.id*220;s.y=s.z=0;s.profile={...s.profile,speed:0,turn:0};s.target=1-s.id;}
 controlBattle(b,'a',{type:'claim',shipId:0});
 controlBattle(b,'a',{type:'input',shipId:0,seq:0,input:{throttle:0,yaw:0,pitch:0,fire:true,missile:true}});
 for(let i=0;i<35;i++)stepSpatialBattle(b);
 const fires=b.events.filter(e=>e.type==='fire'&&e.shipId===0);
 assert.ok(fires.some(e=>e.kind==='missile'));assert.ok(fires.some(e=>e.kind==='shell'));
 assert.ok(fires.every(e=>e.secondary),'no phantom bow cannon');
 assert.ok(b.ships[1].hp+b.ships[1].shield<b.ships[1].maxHp+b.ships[1].maxShield);
 controlBattle(b,'a',{type:'release'});assert.ok(!b.controls.a);
});

test('normal 311 and 500 ship presets retain the supplied proportions without replacing ships',()=>{
 for(const n of [311,500]){
  const p=trialPresets.find(p=>p.name.includes(String(n)));
  assert.equal(Object.values(p.fleet).reduce((a,b)=>a+b,0),n);
 }
 assert.equal(trialPresets.find(p=>p.name.includes('311')).fleet.Cruiser,50);
 assert.ok(trialPresets.some(p=>p.fleet.Iron_Behemoth===1));
});
