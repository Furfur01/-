import test from 'node:test';
import assert from 'node:assert/strict';
import {act,advance,createPlayer,createWorld,economy,migrateWorld,snapshot} from '../game/engine.mjs';
import {publicCatalog,rules} from '../game/catalog.mjs';
import {planetType,planetTypes} from '../game/planet-types.mjs';

const T=1800000000000;
const mines=['Metal_Mine','Crystal_Mine','Gas_Mine'];
function fixture(){
  const world=createWorld(T),player=createPlayer(world,'行星测试',T,()=>.5),p=world.planets[player.home];
  Object.assign(p,{temperature:22,fields:400,resources:[3000,2000,1000],buildings:{Command_Center:1,Metal_Mine:3,Crystal_Mine:3,Gas_Mine:3,Solar_Plant:20,Metal_Storage:4,Crystal_Storage:4,Gas_Storage:4}});
  return {world,player,p};
}
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);

test('specialized planets produce exactly three times their native gross output only',()=>{
  const {p}=fixture(),earth=economy(p);
  assert.equal(earth.ratio,1);
  for(const [biome,index]of [['mercury',0],['mars',1],['gas',2]]){
    p.biome=biome;const specialized=economy(p);
    assert.equal(specialized.ratio,1);
    specialized.rate.forEach((rate,i)=>close(rate,i===index?earth.rate[i]*3:0));
    assert.deepEqual(specialized.capacity,earth.capacity);
  }
  p.buildings={};p.biome='mercury';assert.deepEqual(economy(p).rate,[60*rules.economySpeed,0,0]);
  p.biome='mars';assert.deepEqual(economy(p).rate,[0,30*rules.economySpeed,0]);
  p.biome='gas';assert.deepEqual(economy(p).rate,[0,0,0]);
});

test('non-native mines consume no energy and native mines still respect energy shortages',()=>{
  const {p}=fixture();p.buildings.Solar_Plant=1;
  for(const [biome,index]of [['mercury',0],['mars',1],['gas',2]]){
    p.biome=biome;const all=economy(p),native={...p,buildings:{...p.buildings}};
    for(const [i,id]of mines.entries())if(i!==index)delete native.buildings[id];
    assert.deepEqual(all,economy(native));
    assert.equal(all.demand,Math.ceil((index===2?20:10)*3*1.1**3));
    assert.ok(all.ratio>0&&all.ratio<1);
    native.buildings.Solar_Plant=20;assert.ok(all.rate[index]<economy(native).rate[index]);
  }
});

test('fusion fuel remains unmultiplied even on planets without native gas',()=>{
  const {p}=fixture();p.buildings.Fusion_Reactor=3;
  const fuel=10*3*1.1**3*rules.economySpeed,earth=economy(p);
  p.biome='gas';close(economy(p).rate[2],(earth.rate[2]+fuel)*3-fuel);
  for(const biome of ['mercury','mars']){p.biome=biome;close(economy(p).rate[2],-fuel);}
  p.resources[2]=0;assert.equal(economy(p).rate[2],0);
  p.moon=true;assert.deepEqual(economy(p).rate,[0,0,0]);assert.equal(economy(p).demand,0);
});

test('saved specialized planets preserve resources, buildings and legacy queues through migration',()=>{
  const {world,player,p}=fixture();p.biome='mercury';
  const rate=economy(p).rate,balance=[...p.resources],buildings=structuredClone(p.buildings);
  p.buildQueue={id:'Gas_Mine',level:4,start:T,end:T+10800000,planet:p.id,cost:[100,100,0]};
  p.shipQueue=[{id:'Probe',remaining:1,count:1,each:1,start:T,end:T+10801000}];
  const buildQueue=structuredClone(p.buildQueue),shipQueue=structuredClone(p.shipQueue);
  advance(world,T+3600000);
  assert.equal(p.biome,'mercury');p.resources.forEach((value,i)=>close(value,balance[i]+rate[i]));
  assert.deepEqual(p.buildings,buildings);assert.deepEqual(p.buildQueue,buildQueue);assert.deepEqual(p.shipQueue,shipQueue);
  const restored=migrateWorld(JSON.parse(JSON.stringify(world))),saved=restored.planets[p.id],converted=[...saved.resources],next=economy(saved).rate;
  advance(restored,T+7200000);saved.resources.forEach((value,i)=>close(value,converted[i]+next[i]));
  assert.equal(saved.biome,'mercury');assert.deepEqual(saved.buildQueue,buildQueue);
  const state=snapshot(restored,restored.players[player.id]);
  assert.equal(state.planets.find(x=>x.id===p.id).biome,'mercury');assert.equal(state.map.find(x=>x.id===p.id).biome,'mercury');
  advance(restored,buildQueue.end);assert.equal(saved.buildings.Gas_Mine,4);assert.equal(economy(saved).rate[2],0);
});

test('legacy planets default to terrestrial while migration keeps specialized planets and moons',()=>{
  const {world,player,p}=fixture();delete p.biome;delete world.biomeSeed;
  const original=structuredClone(p),moon={...structuredClone(p),id:'legacy-moon',moon:true,parent:p.id};world.planets[moon.id]=moon;
  const moonBefore=structuredClone(moon),earthRate=economy(p).rate;
  const state=snapshot(world,player);assert.equal(state.planets.find(x=>x.id===p.id).biome,'terrestrial');assert.equal(state.map.find(x=>x.id===p.id).biome,'terrestrial');
  migrateWorld(world);assert.deepEqual(p,{...original,biome:'terrestrial'});assert.deepEqual(moon,moonBefore);assert.deepEqual(economy(p).rate,earthRate);
  const savedSeed=world.biomeSeed;assert.ok(Number.isInteger(savedSeed));migrateWorld(world);assert.equal(world.biomeSeed,savedSeed);
  p.biome='mars';migrateWorld(world);assert.equal(p.biome,'mars');
  for(const biome of [undefined,'invalid','constructor','__proto__'])assert.equal(planetType({biome}),planetTypes.terrestrial);
  assert.equal(publicCatalog.planetTypes,planetTypes);
});

test('planet types cannot be changed by a client action',()=>{
  const {world,player,p}=fixture(),before=structuredClone(p);
  for(const biome of Object.keys(planetTypes))assert.throws(()=>act(world,player,{type:'planetType',planet:p.id,biome},T),/操作不存在/);
  assert.deepEqual(p,before);
});

test('all resource complexes can be upgraded while standalone planetary warehouses are retired',()=>{
  const {world,player,p}=fixture();p.resources=[1e8,1e8,1e8];
  for(const [biome,index]of [['mercury',0],['mars',1],['gas',2]]){
    p.biome=biome;
    for(const id of mines){act(world,player,{type:'build',planet:p.id,id},T);assert.equal(p.buildQueue.id,id);act(world,player,{type:'cancel',planet:p.id,kind:'build'},T);}
    for(const id of ['Metal_Storage','Crystal_Storage','Gas_Storage'])assert.throws(()=>act(world,player,{type:'build',planet:p.id,id},T),/并入/);
  }
});

const localMap=(state,g,s)=>state.map.filter(p=>!p.moon&&p.position[0]===g&&p.position[1]===s).sort((a,b)=>a.position[2]-b.position[2]);

test('visited systems expose fifteen stable random planet types without creating occupied bases',()=>{
  const {world,player}=fixture();world.biomeSeed=42;
  const first=localMap(snapshot(world,player,[1,498]),1,498),count=Object.keys(world.planets).length;
  assert.deepEqual(first.map(p=>p.position[2]),Array.from({length:15},(_,i)=>i+1));
  assert.equal(first.filter(p=>p.npc).length,4);
  assert.equal(first.filter(p=>p.unoccupied).length,11);
  for(const p of first){
    assert.ok(Object.hasOwn(planetTypes,p.biome));
    if(p.unoccupied){assert.equal(p.id,null);assert.equal(p.owner,null);assert.equal(p.npc,false);assert.ok(p.name.includes(planetTypes[p.biome].name));assert.ok(!Object.values(world.planets).some(q=>q.position.join(':')===p.position.join(':')));}
    if(p.npc)assert.equal(p.biome,'terrestrial');
  }
  assert.equal(new Set(first.filter(p=>p.unoccupied).map(p=>p.biome)).size,4);
  assert.deepEqual(localMap(snapshot(world,player,[1,498]),1,498),first);
  assert.equal(Object.keys(world.planets).length,count);
  const second=localMap(snapshot(world,player,[1,497]),1,497);
  assert.notDeepEqual(first.map(p=>p.biome),second.map(p=>p.biome));
  const restored=migrateWorld(JSON.parse(JSON.stringify(world)));
  assert.equal(restored.biomeSeed,42);
  assert.deepEqual(localMap(snapshot(restored,restored.players[player.id],[1,498]),1,498),first);
  assert.deepEqual(localMap(snapshot(restored,restored.players[player.id],[1,497]),1,497),second);
});

test('new colonies inherit their surveyed coordinate type and new player homes remain terrestrial',()=>{
  const {world,player,p}=fixture();world.biomeSeed=42;player.tech.Astrophysics_Tech=8;p.ships.Colony_Ship=4;p.resources=[1e8,1e8,1e8];
  const surveyed=localMap(snapshot(world,player,[1,498]),1,498),restored=migrateWorld(JSON.parse(JSON.stringify(world))),owner=restored.players[player.id];
  for(const biome of Object.keys(planetTypes)){
    const target=surveyed.find(x=>x.unoccupied&&x.biome===biome);assert.ok(target);
    act(restored,owner,{type:'dispatch',planet:p.id,target:target.id,position:target.position,task:'colonize',ships:{Colony_Ship:1},cargo:[100,200,300]},restored.at);
    assert.equal(restored.missions[0].target,null);
    advance(restored,restored.missions[0].end);
    const colony=Object.values(restored.planets).find(x=>x.position.join(':')===target.position.join(':'));
    assert.equal(colony.biome,biome);assert.deepEqual(colony.resources,[600,700,300]);
    const onMap=localMap(snapshot(restored,owner,[1,498]),1,498).find(x=>x.position[2]===target.position[2]);
    assert.equal(onMap.id,colony.id);assert.equal(onMap.biome,biome);assert.equal(onMap.owner,player.id);assert.ok(!onMap.unoccupied);
  }
  assert.equal(restored.missions.length,0);
  for(const rng of [0,.5,.99999]){const added=createPlayer(restored,'母星',restored.at,()=>rng);assert.equal(restored.planets[added.home].biome,'terrestrial');}
});
