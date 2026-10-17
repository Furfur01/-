import test from 'node:test';
import assert from 'node:assert/strict';
import {act,advance,costAt,createPlayer,createWorld,economy,migrateWorld,snapshot} from '../game/engine.mjs';
import {buildings,tech} from '../game/catalog.mjs';

const T=1800000000000;
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-7,`${actual} != ${expected}`);
function fixture(){
  const world=createWorld(T),player=createPlayer(world,'经济兼容测试',T,()=>.5),planet=world.planets[player.home];
  Object.assign(planet,{fields:400,temperature:22,resources:[1000000,1000000,1000000],ships:{Recycler:4,Light_Fighter:12},
    buildings:{Command_Center:1,Metal_Mine:10,Crystal_Mine:10,Gas_Mine:10,Solar_Plant:30,Robotics_Facility:6}});
  return {world,player,planet};
}

test('mine costs keep level 10 anchors and use 25% growth from level 11',()=>{
  const expected={
    Metal_Mine:[[2306,576,0],[2882,720,0],[3603,900,0]],
    Crystal_Mine:[[3298,1649,0],[4122,2061,0],[5153,2576,0]],
    Gas_Mine:[[115200,38400,0],[144000,48000,0],[180000,60000,0]]
  };
  for(const [id,values]of Object.entries(expected)){
    values.forEach((cost,i)=>assert.deepEqual(costAt(buildings[id],10+i),cost));
    for(let level=1;level<=10;level++)assert.deepEqual(costAt(buildings[id],level),costAt({...buildings[id],costGrowthAfterLevel:undefined},level));
  }
  // Level 12 must be anchored to level 10, not repeatedly rounded from level 11.
  assert.equal(costAt(buildings.Metal_Mine,12)[0],3603);
  for(const item of [...Object.values(buildings).filter(b=>!Object.hasOwn(expected,b.id)),...Object.values(tech)]){
    assert.equal(item.costGrowthAfterLevel,undefined);
    for(const level of [1,10,11,20])assert.deepEqual(costAt(item,level),item.cost.map(v=>Math.floor(v*(item.factor||2)**(level-1)+1e-7)));
  }
});

test('one hour accrues five times the previous gross production without altering energy or storage',()=>{
  const {world,planet}=fixture(),before=structuredClone(planet);
  const previous=[4788.736428180005,3172.4909521200025,2104.0438836331214];
  const e=economy(planet);
  assert.equal(e.ratio,1);
  assert.deepEqual(e.capacity,[5350000,5350000,5350000]);
  assert.equal(e.demand,1038);
  e.rate.forEach((value,i)=>close(value,previous[i]*5));
  advance(world,T+3600000);
  planet.resources.forEach((value,i)=>close(value,before.resources[i]+previous[i]*5));
  assert.deepEqual(planet.buildings,before.buildings);assert.deepEqual(planet.ships,before.ships);
});

test('production boost does not multiply fusion fuel consumption',()=>{
  const {planet}=fixture();planet.buildings.Fusion_Reactor=3;
  const fuel=239.58000000000007;
  planet.biome='mercury';const auxiliaryWithFusion=economy(planet).rate[2];
  planet.buildings.Fusion_Reactor=0;close(economy(planet).rate[2]-auxiliaryWithFusion,fuel);
  planet.buildings.Fusion_Reactor=3;
  planet.biome='terrestrial';const withFusion=economy(planet).rate[2];
  planet.buildings.Fusion_Reactor=0;close(economy(planet).rate[2]-withFusion,fuel);
  planet.moon=true;assert.deepEqual(economy(planet).rate,[0,0,0]);
});

test('old serialized progress and paid queues survive; cancellation refunds the original amount',()=>{
  const {world,player,planet}=fixture();
  planet.buildQueue={id:'Metal_Mine',level:11,start:T-10000,end:T+60000,planet:planet.id,cost:[3459,864,0]};
  planet.shipQueue=[{id:'Light_Fighter',remaining:2,count:2,each:30,start:T,end:T+120000}];
  player.researchQueue={id:'Weapons_Tech',level:1,start:T,end:T+90000,planet:planet.id,cost:[800,200,0]};
  const restored=migrateWorld(JSON.parse(JSON.stringify(world))),saved=restored.planets[planet.id],owner=restored.players[player.id];
  assert.deepEqual(saved,planet);assert.deepEqual(owner,player);
  const state=snapshot(restored,owner).planets.find(p=>p.id===planet.id);
  assert.deepEqual(state.buildOptions.Metal_Mine.cost,[2882,720,0]);
  assert.deepEqual(state.buildQueue,planet.buildQueue);
  act(restored,owner,{type:'cancel',planet:saved.id,kind:'build'},T);
  assert.deepEqual(saved.resources,[1003459,1000864,1000000]);
  assert.deepEqual(saved.shipQueue,planet.shipQueue);assert.deepEqual(owner.researchQueue,player.researchQueue);
  assert.deepEqual(saved.ships,planet.ships);
  act(restored,owner,{type:'build',planet:saved.id,id:'Metal_Mine'},T);
  assert.deepEqual(saved.buildQueue.cost,[2882,720,0]);
});

test('old queue completes at its saved time without repricing or extra deductions',()=>{
  const {world,player,planet}=fixture();
  planet.buildQueue={id:'Metal_Mine',level:11,start:T-10000,end:T+60000,planet:planet.id,cost:[3459,864,0]};
  const restored=migrateWorld(JSON.parse(JSON.stringify(world))),saved=restored.planets[planet.id],before=[...saved.resources],rate=economy(saved).rate;
  advance(restored,T+59999);assert.equal(saved.buildings.Metal_Mine,10);assert.equal(saved.buildQueue.end,T+60000);
  advance(restored,T+60000);assert.equal(saved.buildings.Metal_Mine,11);assert.equal(saved.buildQueue,null);
  saved.resources.forEach((value,i)=>close(value,before[i]+rate[i]/60));
  assert.deepEqual(restored.players[player.id].tech,player.tech);
});
