import test from 'node:test';
import assert from 'node:assert/strict';
import {createSpatialBattle,addSpatialFleet,stepSpatialBattle,packedShips,spatialMetadata} from '../game/spatial-battle.mjs';
import {planetBattleEnvironment} from '../game/battle-terrain.mjs';
import {absorbDefenseShield,fortressState,isShieldGenerator} from '../game/planet-defense.mjs';
import {units} from '../game/catalog.mjs';

function fixture(shields={Small_Shield_Dome:1,Large_Shield_Dome:1}){
 const b=createSpatialBattle({id:'shield',attacker:'a',defender:'d',start:0,environment:planetBattleEnvironment()});
 addSpatialFleet(b,{fleet:{Cruiser:1},side:'attacker',owner:'a'},units);
 addSpatialFleet(b,{fleet:{Rocket_Launcher:13,Plasma_Cannon:3,Light_Fighter:1,...shields},side:'defender',owner:'d'},units);
 for(const s of b.ships)s.cooldown=s.secondaryCooldown=s.missileCooldown=1e6;
 return b;
}
function hit(b,target,damage){
 b.projectiles.push({id:b.nextProjectile++,source:0,side:'attacker',target:target.id,kind:'plasma',damage,x:target.x,y:target.y,z:target.z,dx:target.x,dy:target.y,dz:target.z,speed:1,ttl:1});
 stepSpatialBattle(b);
}
test('each shield size protects every ground module and spends a shared capacity exactly once',()=>{
 for(const type of ['Small_Shield_Dome','Large_Shield_Dome']){
  const b=fixture({[type]:1}),generator=b.ships.find(s=>s.type===type),targets=b.ships.filter(s=>s.type==='Rocket_Launcher');
  const initial=generator.shield,damage=initial/10;
  for(const target of [targets[0],targets[6],targets[12]]){
   hit(b,target,damage);assert.equal(target.hp,target.maxHp);assert.equal(target.shield,target.maxShield);
  }
  assert(Math.abs(generator.shield-initial+damage*3)<1e-7);
  const event=b.events.filter(e=>e.defenseShield).at(-1);assert.deepEqual(event.shieldGenerators,[generator.id]);
 }
});
test('combined shield overflow reaches personal shield and hull; destroyed generators cannot protect',()=>{
 const b=fixture(),target=b.ships.find(s=>s.type==='Rocket_Launcher'),generators=b.ships.filter(s=>isShieldGenerator(s.type));
 const capacity=generators.reduce((n,s)=>n+s.shield,0),damage=capacity+target.shield+37;
 hit(b,target,damage);assert.equal(target.hp,target.maxHp-37);assert.equal(target.shield,0);assert(generators.every(s=>s.shield===0));
 const c=fixture(),victim=c.ships.find(s=>s.type==='Rocket_Launcher');
 for(const g of c.ships.filter(s=>isShieldGenerator(s.type)))g.hp=0;
 hit(c,victim,victim.shield+11);assert.equal(victim.hp,victim.maxHp-11);
});
test('generator hits do not double spend, fleets and enemy units do not borrow the field',()=>{
 const b=fixture({Small_Shield_Dome:1}),g=b.ships.find(s=>isShieldGenerator(s.type));
 hit(b,g,g.shield+23);assert.equal(g.hp,g.maxHp-23);assert.equal(g.shield,0);
 const c=fixture(),capacity=c.ships.filter(s=>isShieldGenerator(s.type)).map(s=>s.shield);
 for(const target of [c.ships[0],c.ships.find(s=>s.type==='Light_Fighter')])assert.equal(absorbDefenseShield(c,target,100).absorbed,0);
 const hostile={profile:{ground:true},side:'attacker'};assert.equal(absorbDefenseShield(c,hostile,100).absorbed,0);
 assert.deepEqual(c.ships.filter(s=>isShieldGenerator(s.type)).map(s=>s.shield),capacity);
});
test('one surviving facility keeps its hex intact; replay seek restores geometry and fields',()=>{
 const b=fixture(),metadata=spatialMetadata(b),initial=packedShips(b),dead=structuredClone(initial),module=0;
 const residents=metadata.filter(m=>m.fortressSlot?.module===module);
 assert(residents.length>1);for(const m of residents.slice(1))dead[m.id][6]=0;
 assert(!fortressState(b.environment,metadata,dead).destroyed.has(module));
 dead[residents[0].id][6]=0;
 assert.deepEqual([...fortressState(b.environment,metadata,dead).destroyed],[module]);
 assert.equal(fortressState(b.environment,metadata,initial).destroyed.size,0);
 assert(fortressState(b.environment,metadata,initial).fields[0].charge>0);
 for(const m of metadata.filter(m=>isShieldGenerator(m.type)))dead[m.id][7]=0;
 assert.equal(fortressState(b.environment,metadata,dead).fields.length,0);
 const legacy=metadata.map(({fortressSlot,...m})=>m);
 assert.deepEqual(fortressState(b.environment,legacy,dead),fortressState(b.environment,metadata,dead));
});
test('shared shield depletion and damage resume deterministically',()=>{
 const b=fixture(),copy=structuredClone(b);
 for(const battle of [b,copy])for(let i=0;i<10;i++)hit(battle,battle.ships.find(s=>s.type==='Rocket_Launcher'),700);
 assert.deepEqual(packedShips(b),packedShips(copy));assert.deepEqual(b.events,copy.events);
});

test('a destroyed small hex becomes a ruin without destroying its parent or adjacent sockets',()=>{
 const b=fixture(),metadata=spatialMetadata(b),initial=packedShips(b),dead=structuredClone(initial);
 const slot=metadata.find(m=>m.fortressSlot?.kind==='small').fortressSlot;
 for(const m of metadata.filter(m=>m.fortressSlot?.module===slot.module&&m.fortressSlot?.socket===slot.socket))dead[m.id][6]=0;
 const state=fortressState(b.environment,metadata,dead);
 assert.deepEqual([...state.destroyedSockets],[`${slot.module}:${slot.socket}`]);assert(!state.destroyed.has(slot.module));
 assert.equal(fortressState(b.environment,metadata,initial).destroyedSockets.size,0);
});
