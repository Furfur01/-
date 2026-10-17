import test from 'node:test';
import assert from 'node:assert/strict';
import {act,advance,createPlayer,createWorld,economy,getCapacity,migrateWorld,snapshot} from '../game/engine.mjs';
import {buildings,capacities,publicCatalog} from '../game/catalog.mjs';
import {RESOURCE_COMPLEXES,usedBuildingFields} from '../game/resource-complexes.mjs';
import {SURFACE_LAYOUT_VERSION,SURFACE_SLOTS} from '../game/surface-layout.mjs';

const T=1800000000000;
function fixture(){
  const world=createWorld(T),player=createPlayer(world,'综合体迁移',T,()=>.51),p=world.planets[player.home];
  p.resources=[1e8,1e8,1e8];p.fields=400;p.ships={};
  p.buildings={Command_Center:1,Metal_Mine:3,Crystal_Mine:2,Gas_Mine:1,Metal_Storage:6,Crystal_Storage:4,Gas_Storage:2,Solar_Plant:20,Shipyard:4};
  return {world,player,p};
}
test('resource merge preserves each legacy level, balance and paid queue; migration is idempotent',()=>{
  const {world,player,p}=fixture();delete p.resourceComplexVersion;delete p.surfaceLayoutVersion;
  p.layout={Metal_Mine:[320,400],Research_Lab:[700,650]};
  p.buildQueue={id:'Metal_Storage',level:7,start:T,end:T+10000,cost:[1000,400,0],planet:p.id};
  const old=structuredClone(p),rate=economy(p).rate;
  migrateWorld(world);
  assert.equal(world.version,3);assert.equal(p.resourceComplexVersion,1);assert.equal(p.surfaceLayoutVersion,SURFACE_LAYOUT_VERSION);
  for(const key of ['buildings','resources','ships','buildQueue','shipQueue'])assert.deepEqual(p[key],old[key]);
  assert.deepEqual(p.previousSurfaceLayout,old.layout);assert.deepEqual(economy(p).rate,rate);
  const saved=JSON.stringify(world);migrateWorld(world);assert.equal(JSON.stringify(world),saved);
  advance(world,T+10000);assert.equal(p.buildings.Metal_Storage,7);assert.equal(p.buildings.Metal_Mine,3);assert.equal(p.buildQueue,null);assert.equal(getCapacity(p)[0],capacities[7]);
  const state=snapshot(world,player).planets.find(q=>q.id===p.id);
  assert.equal(state.resourceComplexes.Metal_Mine.level,3);assert.equal(state.resourceComplexes.Metal_Mine.legacyStorageLevel,7);assert.equal(state.buildOptions.Metal_Storage.disabled,true);
});
test('canceling a migrated warehouse queue refunds its exact original paid cost',()=>{
  const {world,player,p}=fixture(),before=[...p.resources];
  p.buildQueue={id:'Crystal_Storage',level:5,start:T,end:T+10000,cost:[715,99,7],planet:p.id};
  migrateWorld(world);act(world,player,{type:'cancel',kind:'build',planet:p.id},T);
  assert.deepEqual(p.resources,before.map((v,i)=>v+[715,99,7][i]));assert.equal(p.buildings.Crystal_Storage,4);assert.equal(p.buildQueue,null);
});
test('one canonical upgrade changes production and storage together without charging twice',()=>{
  const {world,player,p}=fixture();p.buildings.Metal_Storage=0;
  const state=snapshot(world,player).planets.find(q=>q.id===p.id),quote=state.buildOptions.Metal_Mine,before=[...p.resources],rate=economy(p).rate[0];
  assert.equal(quote.capacity,capacities[3]);assert.equal(quote.nextCapacity,capacities[4]);
  act(world,player,{type:'build',planet:p.id,id:'Metal_Mine',slotId:'D07'},T);
  assert.equal(p.buildQueue.slotId,'D07');assert.deepEqual(p.resources,before.map((v,i)=>v-quote.cost[i]));assert.equal(getCapacity(p)[0],capacities[3]);assert.equal(economy(p).rate[0],rate);
  advance(world,p.buildQueue.end);assert.equal(p.buildings.Metal_Mine,4);assert.equal(getCapacity(p)[0],capacities[4]);assert.ok(economy(p).rate[0]>rate);assert.equal(p.buildings.Metal_Storage,0);
});
test('every specialized resource complex upgrade increases production and storage',()=>{
  for(const [biome,native]of [['mercury',0],['mars',1],['gas',2]]){
    const {world,player,p}=fixture();p.biome=biome;p.buildings={Command_Center:1,Solar_Plant:20};
    for(const {id,storageId,resource}of RESOURCE_COMPLEXES){
      const rate=economy(p).rate,demand=economy(p).demand;
      act(world,player,{type:'build',planet:p.id,id},world.at);advance(world,p.buildQueue.end);
      assert.equal(getCapacity(p)[resource],capacities[1]);assert.equal(p.buildings[id],1);
      assert.ok(economy(p).rate[resource]>rate[resource]);assert.ok(economy(p).demand>demand);
      const option=snapshot(world,player).planets.find(q=>q.id===p.id).buildOptions[id];assert.equal(option.native,resource===native);
      assert.throws(()=>act(world,player,{type:'build',planet:p.id,id:storageId},world.at),/并入/);
    }
  }
});
test('demolishing extraction preserves legacy storage floors, investments and occupied fields',()=>{
  const {world,player,p}=fixture(),before=usedBuildingFields(p),capacity=getCapacity(p);
  assert.equal(before,Object.values(p.buildings).reduce((a,b)=>a+b,0)-6);
  act(world,player,{type:'downgrade',planet:p.id,id:'Metal_Mine'},T);advance(world,p.buildQueue.end);
  assert.equal(p.buildings.Metal_Mine,2);assert.deepEqual(getCapacity(p),capacity);assert.equal(usedBuildingFields(p),before);
  assert.throws(()=>act(world,player,{type:'downgrade',planet:p.id,id:'Metal_Storage'},world.at),/并入/);
});
test('moon warehouses stay separate and no surface migration is applied',()=>{
  const {world,player,p}=fixture();p.moon=true;p.buildings={Moon_Base:6};delete p.resourceComplexVersion;delete p.surfaceLayoutVersion;
  const before=structuredClone(p);migrateWorld(world);assert.deepEqual(p,before);
  for(const {storageId}of RESOURCE_COMPLEXES){act(world,player,{type:'build',planet:p.id,id:storageId},world.at);advance(world,p.buildQueue.end);}
  assert.deepEqual(getCapacity(p),[capacities[1],capacities[1],capacities[1]]);
  const state=snapshot(world,player).planets.find(q=>q.id===p.id);assert.equal(state.surfaceLayout,null);assert.deepEqual(state.resourceComplexes,{});assert.equal(state.buildOptions.Metal_Storage.disabled,undefined);
});
test('fourteen canonical slots cover the sphere and server refuses forged placement',()=>{
  const {world,player,p}=fixture(),values=Object.values(SURFACE_SLOTS),before=structuredClone(p);
  assert.equal(values.length,14);assert.equal(new Set(values.map(q=>q.slotId)).size,14);
  assert.deepEqual(publicCatalog.surfaceLayout.slots,SURFACE_SLOTS);
  const ordinary=Object.values(buildings).filter(b=>!b.moon&&!b.mergedInto).map(b=>b.id).sort();assert.deepEqual(Object.keys(SURFACE_SLOTS).sort(),ordinary);
  for(const slot of values){assert.ok(Math.abs(Math.hypot(...slot.direction)-1)<1e-10);assert.equal(slot.heading,0);}
  for(let i=0;i<3;i++){assert.ok(values.some(q=>q.direction[i]>.8));assert.ok(values.some(q=>q.direction[i]<-.8));}
  assert.throws(()=>act(world,player,{type:'build',planet:p.id,id:'Metal_Mine',slotId:'D09'},T),/固定球面/);
  assert.throws(()=>act(world,player,{type:'place',planet:p.id,id:'Research_Lab',x:800,y:650},T),/固定球面/);assert.deepEqual(p,before);
  assert.equal(SURFACE_SLOTS.Missile_Silo.type,'support');assert.equal(buildings.Missile_Silo.name,'行星保障中心');assert.equal(buildings.Shipyard.name,'太空电梯');
});
test('server snapshots disclose surface buildings only to their owner',()=>{
  const {world,player,p}=fixture(),enemy=createPlayer(world,'其他玩家',T,()=>.6),state=snapshot(world,enemy);
  assert.ok(!state.planets.some(q=>q.id===p.id));const map=state.map.find(q=>q.id===p.id);
  for(const key of ['buildings','buildQueue','resourceComplexes','surfaceLayout','resources'])assert.equal(map[key],undefined);
  assert.ok(snapshot(world,player).planets.find(q=>q.id===p.id).surfaceLayout);
});
