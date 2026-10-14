import test from 'node:test';
import assert from 'node:assert/strict';
import {battle} from '../game/combat.mjs';
import {applyPacket,simulateBattle} from '../game/node-combat.mjs';
import {units,rules} from '../game/catalog.mjs';

test('merged impacts retain shields, partial hull damage and projectile overkill',()=>{
  const ship={count:10,maxHp:100,maxShield:20,hp:100,shield:20};
  applyPacket(ship,15,2);assert.equal(ship.shield,0);assert.equal(ship.hp,90);assert.equal(ship.count,10);
  applyPacket(ship,200,2);assert.equal(ship.count,8);assert.equal(ship.hp,100);assert.equal(ship.shield,20);
  applyPacket(ship,30,7);assert.equal(ship.count,7);assert.equal(ship.hp,30);assert.equal(ship.shield,0);
  applyPacket(ship,1e9,1);assert.equal(ship.count,6);
});

test('simultaneous lethal volleys allow mutual destruction',()=>{
  const result=simulateBattle({seed:3,initial:{attacker:{Light_Fighter:1},defender:{Light_Fighter:1}},technology:{attacker:{},defender:{}},unitStats:{Light_Fighter:{strength:100,shield:20,attack:200}}});
  assert.equal(result.winner,'draw');assert.deepEqual(result.survivors,{attacker:{},defender:{}});assert.equal(result.duration,1);
});

test('shield regeneration prevents cumulative damage below shield capacity',()=>{
  const result=simulateBattle({seed:3,initial:{attacker:{Light_Fighter:1},defender:{Light_Fighter:1}},technology:{attacker:{},defender:{}},unitStats:{Light_Fighter:{strength:100,shield:20,attack:15}}});
  assert.equal(result.duration,600);assert.equal(result.rounds.length,100);assert.deepEqual(result.survivors,{attacker:{Light_Fighter:1},defender:{Light_Fighter:1}});
});

test('weapon technology and catalog rapid fire affect real ship losses',()=>{
  const request={seed:3,initial:{attacker:{Light_Fighter:1},defender:{Light_Fighter:1}},technology:{attacker:{Weapons_Tech:100},defender:{}},unitStats:{Light_Fighter:{strength:100,shield:20,attack:15}}};
  assert.equal(simulateBattle(request).winner,'attacker');
  const rapid=battle({Death_Star:1},{Solar_Satellite:1000},{},{},42);
  assert.ok(rapid.simulation.shotCount>100);assert.ok(rapid.losses.defender.Solar_Satellite>100);assert.equal(rapid.winner,'attacker');
});

test('million-ship fleets have bounded cohorts and conserve every ship',()=>{
  const result=battle({Light_Fighter:1000000,Cruiser:10000},{Light_Fighter:1000000,Battleship:2000},{},{},83);
  assert.equal(result.simulation.grouped,true);assert.ok(result.simulation.cohorts.every(n=>n<=2048));assert.ok(result.rounds.length<=100);
  for(const[side,fleet]of Object.entries(result.initial))for(const[id,count]of Object.entries(fleet))assert.equal((result.survivors[side][id]||0)+(result.losses[side][id]||0),count);
  assert.deepEqual(result.rounds.at(-1).after,result.survivors);assert.ok(result.losses.attacker.Light_Fighter>0);assert.ok(result.losses.defender.Light_Fighter>0);
});

test('derived overflow and unsafe combined counts fail before settlement',()=>{
  assert.throws(()=>battle({Light_Fighter:1},{},{Strength_Tech:1e308}),/无效/);
  assert.throws(()=>battle({Light_Fighter:Number.MAX_SAFE_INTEGER,Cruiser:1},{}),/安全整数/);
  assert.throws(()=>simulateBattle({seed:1,initial:{attacker:{Light_Fighter:1},defender:{}},technology:{attacker:{},defender:{}},unitStats:{Light_Fighter:{strength:1e308,shield:1e308,attack:1}}}),/无效/);
});

test('merged packets match individual shots without sharing one shield across the fleet',()=>{
  for(let n=1;n<=100;n++){
    const merged={count:37,maxHp:80+n,maxShield:10+n,hp:80+n,shield:10+n},individual=structuredClone(merged);
    for(const[damage,shots]of [[3+n%9,11+n],[18+n%7,17],[2,8],[700,2]]){
      applyPacket(merged,damage,shots);
      for(let i=0;i<shots&&individual.count;i++){
        const absorbed=Math.min(individual.shield,damage);individual.shield-=absorbed;individual.hp-=damage-absorbed;
        if(individual.hp<=0){individual.count--;individual.hp=individual.count?individual.maxHp:0;individual.shield=individual.count?individual.maxShield:0;}
      }
      assert.deepEqual(merged,individual);
    }
  }
});

test('20k catalog fleets incur gradual casualties and debris equals their real losses',()=>{
  const result=battle({Light_Fighter:10000},{Light_Fighter:10000},{},{},20000);
  const remaining=Object.values(result.rounds[0].after).flatMap(f=>Object.values(f)).reduce((a,b)=>a+b,0);
  assert.ok(remaining>18000,'the first volley cannot erase the fleet through pooled damage');
  assert.ok(result.rounds.length>1);assert.ok(result.losses.attacker.Light_Fighter>0&&result.losses.defender.Light_Fighter>0);
  const expected=[0,0,0];for(const side of ['attacker','defender'])for(const[id,n]of Object.entries(result.losses[side]))for(let i=0;i<2;i++)expected[i]+=Math.floor(units[id].cost[i]*n*rules.debrisRate);
  assert.deepEqual(result.debris,expected);
  assert.equal(result.debris[2],0);assert.deepEqual(result.rounds.at(-1).after,result.survivors);
});

test('20k zero-attack catalog units keep every ship and never produce shots or debris',()=>{
  const result=battle({Solar_Satellite:10000},{Solar_Satellite:10000},{},{},22);
  assert.equal(result.duration,600);assert.equal(result.simulation.shotCount,0);
  assert.deepEqual(result.survivors,result.initial);assert.deepEqual(result.losses,{attacker:{},defender:{}});assert.deepEqual(result.debris,[0,0,0]);
});
