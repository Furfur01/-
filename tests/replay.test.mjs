import test from 'node:test';
import assert from 'node:assert/strict';
import {battle} from '../game/combat.mjs';
import {buildReplay} from '../game/replay.mjs';
import {units} from '../game/catalog.mjs';

test('sandbox reports preserve fleets, technology and all defense types',()=>{
  const attacker={Battleship:2,Light_Fighter:12,Cargo_Ship:1},defender=Object.fromEntries(Object.values(units).filter(u=>u.type==='defense'&&!u.missile).map(u=>[u.id,1]));
  const tech={Weapons_Tech:4,Shielding_Tech:2,Strength_Tech:3};
  const report=battle(attacker,defender,tech,{},8329),before=JSON.stringify(report);
  assert.equal(report.engine,'sandbox-v1');
  assert.ok(report.duration>0&&report.duration<=600);
  for(const [side,fleet]of Object.entries(report.initial))for(const[id,count]of Object.entries(fleet))assert.equal((report.losses[side][id]||0)+(report.survivors[side][id]||0),count);
  const replay=buildReplay(report);
  assert.equal(replay.version,3);
  replay.report.winner='forged';replay.report.survivors.attacker={};replay.report.technology.attacker.Weapons_Tech=999;
  assert.equal(JSON.stringify(report),before);
  tech.Weapons_Tech=99;attacker.Battleship=99;
  assert.equal(report.technology.attacker.Weapons_Tech,4);assert.equal(report.initial.attacker.Battleship,2);
});
test('legacy reports retain their saved winner and losses without resimulation',()=>{
  const legacy={seed:42,winner:'defender',initial:{attacker:{Light_Fighter:1},defender:{}},survivors:{attacker:{},defender:{}},losses:{attacker:{Light_Fighter:1},defender:{}},loot:[0,0,0],rounds:[]};
  const before=JSON.stringify(legacy),replay=buildReplay(legacy);
  assert.deepEqual(replay.report,legacy);assert.equal(JSON.stringify(legacy),before);
});
test('empty and unarmed battles finish deterministically without false victory',()=>{
  assert.equal(battle({Cargo_Ship:1},{},{},{},4).winner,'attacker');
  assert.equal(battle({},{},{},{},4).winner,'draw');
  const r=battle({Probe:2},{Small_Shield_Dome:1},{},{},4);
  assert.equal(r.winner,'draw');assert.deepEqual(r.survivors,r.initial);assert.equal(r.duration,600);
});
test('invalid combat input is rejected and Node settlement needs no Godot executable',()=>{
  for(const fleet of [{NoSuchShip:1},{Light_Fighter:-1},{Light_Fighter:1.5},{Interplanetary_Missile:1}])assert.throws(()=>battle(fleet,{}));
  const previous=process.env.GODOT_BIN;
  try{process.env.GODOT_BIN='missing-sandbox-engine';const result=battle({Light_Fighter:1},{});assert.equal(result.winner,'attacker');assert.equal(result.simulation.implementation,'node-v1');}
  finally{if(previous===undefined)delete process.env.GODOT_BIN;else process.env.GODOT_BIN=previous;}
});
