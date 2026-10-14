import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer,act,advance} from '../game/engine.mjs';
import {units,rules} from '../game/catalog.mjs';
const T=1800000000000;
function fixture(){
  const world=createWorld(T),player=createPlayer(world,'矿工',T),home=world.planets[player.home];
  home.ships={Recycler:2,Large_Cargo_Ship:2};home.resources=[5000,5000,5000];home.moon=true;
  player.tech.Computer_Tech=5;
  const request={type:'dispatch',planet:home.id,position:[home.position[0],home.position[1],16],task:'mine',ships:{Recycler:1},holdHours:2};
  return{world,player,home,request};
}
test('mining holds, uses recycler capacity, and credits cargo exactly once on return',()=>{
  const{world,player,home,request}=fixture();act(world,player,request,T);
  const mission=world.missions[0],balance=[...home.resources];
  advance(world,mission.end);assert.equal(mission.phase,'holding');assert.equal(mission.end-mission.start,2*rules.explorationHourSeconds*1000);
  assert.deepEqual(home.resources,balance);advance(world,mission.end);
  assert.equal(mission.phase,'return');assert.equal(mission.cargo.reduce((a,b)=>a+b),units.Recycler.cargo*.5);
  assert.deepEqual(home.resources,balance);const cargo=[...mission.cargo];
  advance(world,mission.end);assert.equal(world.missions.length,0);assert.equal(home.ships.Recycler,2);
  assert.deepEqual(home.resources,balance.map((v,i)=>v+cargo[i]));
  const settled=[...home.resources];advance(world,world.at+100000);assert.deepEqual(home.resources,settled);
  assert.equal(player.reports.filter(r=>r.title==='小行星采矿完成').length,1);
});
test('mining validates ship, belt coordinates, time and cargo before removing ships',()=>{
  const{world,player,home,request}=fixture();
  for(const invalid of [{ships:{Large_Cargo_Ship:1}},{position:[1,2,15]},{holdHours:0},{holdHours:5},{holdHours:1.5},{holdHours:'bad'},{cargo:[1,0,0]}]){
    assert.throws(()=>act(world,player,{...request,...invalid},T));assert.equal(world.missions.length,0);assert.equal(home.ships.Recycler,2);
  }
});
test('recalling a mining fleet during outbound or holding yields no mining reward',()=>{
  for(const holding of [false,true]){
    const{world,player,home,request}=fixture();act(world,player,request,T);const mission=world.missions[0];
    if(holding)advance(world,mission.end);
    const balance=[...home.resources];act(world,player,{type:'recall',id:mission.id},world.at+1000);
    advance(world,mission.end);assert.deepEqual(home.resources,balance);assert.equal(home.ships.Recycler,2);
    assert.ok(!player.reports.some(r=>r.title==='小行星采矿完成'));
  }
});
test('mining remains bounded by recycler holds even with additional cargo ships',()=>{
  const{world,player,request}=fixture();act(world,player,{...request,ships:{Recycler:1,Large_Cargo_Ship:2},holdHours:4},T);
  const mission=world.missions[0];advance(world,mission.end);advance(world,mission.end);
  assert.equal(mission.cargo.reduce((a,b)=>a+b),units.Recycler.cargo);
});
