import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer,ensureSystemNpcs,snapshot,act,advance,migrateWorld} from '../game/engine.mjs';
import {starMap} from '../game/star-map.mjs';
import {systemBiomes,systemTypes} from '../game/system-biomes.mjs';
import {restoreSystemCamps} from '../game/npc-types.mjs';

const T=1800000000000,types=['gas','mars','mercury','terrestrial'];
const local=(w,s)=>Object.values(w.planets).filter(p=>!p.moon&&p.position[0]===1&&p.position[1]===s);

test('all 499 systems project five tiers and all four ordinary planet types, before and after initialization',()=>{
  for(const seed of [0,42,4294967295]){
    const w=createWorld(T);w.biomeSeed=seed;createPlayer(w,'测试四类星球',T,()=>0);
    const before=JSON.stringify(w),map=starMap(w);assert.equal(JSON.stringify(w),before);
    for(let s=1;s<=499;s++){
      const records=map.planets.filter(p=>p.position[1]===s&&!p.moon&&p.kind!=='belt');
      assert.deepEqual(records.filter(p=>p.npc).map(p=>p.npcLevel).sort(),[1,2,3,4,5]);
      assert.deepEqual([...new Set(records.filter(p=>!p.npc).map(p=>p.biome))].sort(),types,`seed ${seed}, system ${s}`);
    }
    for(let s=1;s<=499;s++)ensureSystemNpcs(w,1,s);
    const initialized=starMap(w);
    assert.deepEqual(initialized.planets.map(p=>[p.key,p.biome,p.npcLevel]),map.planets.map(p=>[p.key,p.biome,p.npcLevel]));
    assert.equal(new Set(Object.values(w.planets).map(p=>p.position.join(':'))).size,Object.keys(w.planets).length);
  }
});

test('balancing keeps existing worlds intact and preview, mission and colony types agree',()=>{
  const w=createWorld(T),player=createPlayer(w,'测试殖民类型',T,()=>0),home=w.planets[player.home];w.biomeSeed=42;
  player.tech={Astrophysics_Tech:3,Computer_Tech:20};home.resources=[1e8,1e8,1e8];home.ships={Colony_Ship:20};
  // Find a system where NPCs consume every orbit of at least one seeded type.
  const directory=starMap(w),s=directory.planets.find(p=>!p.npc&&!p.owner&&!p.moon&&p.kind!=='belt'&&!p.systemOwner&&p.biome!==systemTypes(42,p.position[1])[p.position[2]-1])?.position[1];assert(s);
  const saved=structuredClone(home),preview=directory.planets.filter(p=>p.position[1]===s&&!p.npc&&p.kind!=='belt');
  const mapBefore=systemBiomes(w,1,s);ensureSystemNpcs(w,1,s);assert.deepEqual(systemBiomes(w,1,s),mapBefore);assert.deepEqual(home,saved);
  for(const p of preview){
    act(w,player,{type:'dispatch',planet:home.id,position:p.position,task:'colonize',ships:{Colony_Ship:1}},w.at);
    assert.equal(w.missions.at(-1).colonyBiome,p.biome);
    assert.equal(snapshot(w,player,[1,s]).map.find(q=>q.position.join(':')===p.position.join(':')).biome,p.biome);
  }
  // Arrive in reverse orbit order to expose reassignment of reserved types.
  for(const [i,m]of [...w.missions].reverse().entries())m.end=T+(i+1)*1000;
  advance(w,T+11000);
  for(const p of preview)assert.equal(local(w,s).find(q=>q.position[2]===p.position[2]).biome,p.biome);
  assert.deepEqual([...new Set(local(w,s).filter(p=>!p.npc).map(p=>p.biome))].sort(),types);
  assert.deepEqual(systemBiomes(migrateWorld(structuredClone(w)),1,s),systemBiomes(w,1,s));
});

test('correction returns original camps by ID, preserving losses, reservations and identity',()=>{
  const w=createWorld(T);for(const s of [20,21])ensureSystemNpcs(w,1,s);
  const camps=Object.values(w.planets).filter(p=>p.npc),before=new Map();
  for(const [i,p]of camps.entries()){p.position=[1,499,i+1];p.resources=[i,2,1];p.ships={};p.defense={};p.debris=[999,22,0];before.set(p.id,structuredClone(p));}
  const player=createPlayer(w,'测试恢复据点',T,()=>0),home=w.planets[player.home];home.position=[1,16,1];
  w.missions.push({id:'test-reserved',task:'colonize',phase:'outbound',position:[1,16,2]});
  const personal=structuredClone({player,home,missions:w.missions,sovereignty:w.sovereignty});delete w.npcDistributionVersion;
  restoreSystemCamps(w);
  for(const p of camps){assert.equal(p.position.slice(0,2).join(':'),p.id.split(':').slice(1,3).join(':'));assert.deepEqual({...p,position:before.get(p.id).position},before.get(p.id));}
  assert.deepEqual({player,home,missions:w.missions,sovereignty:w.sovereignty},personal);
  assert(camps.filter(p=>p.position[1]===16).every(p=>p.position[2]>2));
  for(const s of [16,20,21])assert.equal(local(w,s).filter(p=>p.npc).length,5);
  const once=JSON.stringify(w);restoreSystemCamps(w);assert.equal(JSON.stringify(w),once);
  // Absence recorded in an initialized system stays absent, never regenerated.
  delete w.planets[camps[0].id];ensureSystemNpcs(w,1,16);assert(!w.planets[camps[0].id]);
});

test('full legacy systems retain their existing types when no empty orbit can supply a missing type',()=>{
  const w={biomeSeed:42,planets:{},missions:[],npcSystems:{'1:16':2}};
  for(let slot=1;slot<=15;slot++)w.planets['test-'+slot]={id:'test-'+slot,owner:'test',position:[1,16,slot],biome:'terrestrial'};
  const before=JSON.stringify(w);assert.deepEqual(systemBiomes(w,1,16),Array(15).fill('terrestrial'));assert.equal(JSON.stringify(w),before);
});

test('legacy UUID camps are restored only with their verified backup positions, not by matching names',()=>{
  const w=createWorld(T),camp=Object.values(w.planets).find(p=>p.npc);
  delete w.planets[camp.id];camp.id='test-original-uuid';camp.position=[1,498,7];camp.ships={};camp.resources=[0,1,2];w.planets[camp.id]=camp;
  const unrelated={...structuredClone(camp),id:'test-unrelated-uuid',position:[1,497,7]};w.planets[unrelated.id]=unrelated;
  const before=structuredClone({camp,unrelated});delete w.npcDistributionVersion;restoreSystemCamps(w,{[camp.id]:[1,16,1]});
  assert.deepEqual(camp,{...before.camp,position:[1,16,1]});assert.deepEqual(unrelated,before.unrelated);
});
