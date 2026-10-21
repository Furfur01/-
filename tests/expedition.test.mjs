import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer,act,advance,migrateWorld,fleetQuote} from '../game/engine.mjs';
import {units,tech,rules} from '../game/catalog.mjs';
import {seeded} from '../game/combat.mjs';
import {explore,escortAssessment,rewardShipPool} from '../game/expedition.mjs';
import {expeditionZones,resourceBase,miningCargo} from '../game/expedition-rules.mjs';

const T=1800000000000;
const formation={Large_Cargo_Ship:100,Recycler:10,Battleship:20};
function fixture(){
  const world=createWorld(T),player=createPlayer(world,'银心隔离测试',T,()=>.2),p=world.planets[player.home];
  p.resources=[1e8,1e8,1e8];p.buildings={Shipyard:12};p.ships={...formation};
  player.tech=Object.fromEntries(Object.keys(tech).map(id=>[id,10]));
  const action={type:'dispatch',planet:p.id,task:'explore',position:[1,p.position[1],16],ships:{...formation},zone:'outer',rounds:3,speed:100};
  return {world,player,p,action};
}
function seedFor(min,max,encounter=false){
  for(let seed=0;seed<10000;seed++){const rng=seeded(seed),roll=rng(),pirates=rng()<.2;if(roll>=min&&roll<max&&pirates===encounter)return seed;}
  throw Error('No fixture seed');
}
function finishRound(world,m){
  advance(world,m.end);assert.equal(m.phase,'holding');
  advance(world,m.end);assert.equal(m.phase,'return');
  advance(world,m.end);
}

test('expedition gates and preset ownership reject before debiting; civilian manual trips remain usable',()=>{
  const {world,player,p,action}=fixture(),before=structuredClone({resources:p.resources,ships:p.ships});
  for(const patch of [{zone:'missing'},{rounds:100},{zone:'deep',rounds:2},{ships:{Recycler:10},rounds:3}]){
    assert.throws(()=>act(world,player,{...action,...patch},T));
    assert.deepEqual({resources:p.resources,ships:p.ships},before);assert.equal(world.missions.length,0);
  }
  player.tech.Astrophysics_Tech=1;assert.throws(()=>act(world,player,{...action,zone:'inner'},T),/4 级/);
  const other=createPlayer(world,'银心权限测试',T,()=>.4);
  assert.throws(()=>act(world,other,{...action,type:'saveExpeditionPreset'},T),/无法操作/);
  act(world,player,{...action,type:'saveExpeditionPreset'},T);
  assert.deepEqual(p.expeditionPreset.ships,formation);assert.deepEqual(p.resources,before.resources);
  act(world,player,{...action,ships:{Recycler:10},rounds:1},T);
  assert.equal(world.missions.length,1);
  assert.equal(p.resources[2],before.resources[2]-fleetQuote(player,p,{Recycler:10},action.position).fuel);
  assert.deepEqual(world.missions[0].repeat.template,{Recycler:10});
});

test('fixed pirates, cargo limits and ordinary rewards share the published settlement rules',()=>{
  const {player,p}=fixture();
  for(const zone of Object.values(expeditionZones)){
    const assessment=escortAssessment(formation,player.tech,zone.id);
    assert.deepEqual(assessment.combat.initial.defender,zone.pirates);
    assert.deepEqual(assessment.combat.technology.defender,{Weapons_Tech:zone.tech,Shielding_Tech:zone.tech,Strength_Tech:zone.tech});
  }
  const civil={Recycler:1},retreat=explore(civil,seedFor(0,.6,true),1,{}, {zone:'deep',rewardPool:['Recycler']});
  assert.equal(retreat.retreated,true);assert.deepEqual(retreat.ships,civil);assert.deepEqual(retreat.cargo,[0,0,0]);assert.equal(retreat.darkMatter,0);
  const seed=seedFor(0,.6),rng=seeded(seed);rng();rng();
  const index=Math.floor(rng()*3),amount=Math.floor(resourceBase(formation,units,'outer')*(.5+rng()*.5)*[1,.6,.8][index]);
  const result=explore(formation,seed,999,player.tech,{zone:'outer'});
  assert.deepEqual(result.discovered,{resource:index,amount});assert.equal(result.cargo[index],amount);
  const shipSeed=seedFor(.6,.8),pool=rewardShipPool(formation,player,p);
  assert.ok(pool.includes('Large_Cargo_Ship'));
  const found=explore(formation,shipSeed,1,player.tech,{rewardPool:['Large_Cargo_Ship','Iron_Behemoth']});
  assert.equal(found.event,'ships');assert.ok(found.foundShips.Large_Cargo_Ship>=2&&found.foundShips.Large_Cargo_Ship<=5);assert.equal(found.foundShips.Iron_Behemoth,undefined);
  const fractional=explore({Recycler:1},shipSeed,1,player.tech,{rewardPool:['Recycler']});
  assert.deepEqual(fractional.foundShips,{});assert.ok(fractional.cargo[0]>0);assert.ok(fractional.cargo.reduce((a,b)=>a+b,0)<=units.Recycler.cargo);
  const win=explore(formation,seedFor(.95,1,true),1,player.tech,{zone:'outer'});
  assert.equal(win.retreated,false);assert.ok(win.salvage[0]>0);assert.deepEqual(win.combat.initial.attacker,{Battleship:20});
  assert.equal(win.ships.Recycler,10);assert.equal(win.ships.Large_Cargo_Ship,100);
  assert.ok(win.cargo.reduce((a,b)=>a+b,0)+win.darkMatter<=win.capacity);
  assert.ok(win.salvage.reduce((a,b)=>a+b,0)<=10*units.Recycler.cargo);
});

test('core depth sets the server-owned work duration; reload and legacy flights keep their dispatched time',()=>{
  for(const [zone,seconds]of [['outer',900],['inner',1800],['deep',3600]]){
    let {world,player,action}=fixture();
    act(world,player,{...action,zone,rounds:1,holdHours:1,workSeconds:1},T);
    assert.equal(world.missions[0].workSeconds,seconds);
    world=migrateWorld(JSON.parse(JSON.stringify(world)));player=world.players[player.id];
    const m=world.missions[0];m.seed=seedFor(.95,1);
    advance(world,m.end);assert.equal(m.end-m.start,seconds*1000);
    advance(world,m.end-1);assert.equal(m.phase,'holding');
    advance(world,m.end);assert.equal(m.phase,'return');
    assert.equal(player.reports.find(r=>r.type==='explore').explorationSeconds,seconds);
  }
  const {world,player,action}=fixture();
  act(world,player,{...action,zone:'deep',rounds:1},T);
  const legacy=world.missions[0];delete legacy.workSeconds;legacy.seed=seedFor(.95,1);
  advance(world,legacy.end);assert.equal(legacy.end-legacy.start,900000);
  advance(world,legacy.end);
  assert.equal(player.reports.find(r=>r.type==='explore').explorationSeconds,900);
});

test('saved repeat state survives reload, credits once and never expands the departure formation',()=>{
  let {world,player,p,action}=fixture();
  act(world,player,action,T);
  let m=world.missions[0];m.seed=seedFor(.6,.8);m.rewardPool=['Large_Cargo_Ship'];
  advance(world,m.end);assert.equal(m.end-m.start,900000);
  advance(world,m.end);const found=m.foundShips.Large_Cargo_Ship,returnAt=m.end;
  assert.ok(found>=2);assert.equal(p.ships.Large_Cargo_Ship,0);
  const gas=p.resources[2],fuel=fleetQuote(player,p,formation,action.position).fuel;
  world=migrateWorld(JSON.parse(JSON.stringify(world)));player=world.players[player.id];p=world.planets[p.id];
  advance(world,returnAt);
  assert.equal(world.missions.length,1);m=world.missions[0];
  assert.equal(m.repeat.round,2);assert.deepEqual(m.ships,formation);assert.equal(p.ships.Large_Cargo_Ship,found);
  assert.equal(p.resources[2],gas-fuel);
  advance(world,returnAt);assert.equal(p.ships.Large_Cargo_Ship,found);assert.equal(p.resources[2],gas-fuel);
  // One offline advance completes exactly the remaining two fixed rounds.
  advance(world,returnAt+12*3600000);
  assert.equal(world.missions.length,0);assert.equal(p.flightsUsed,3);
  assert.equal(player.reports.filter(r=>r.type==='explore').length,3);
  assert.equal(player.reports.filter(r=>r.title==='舰队已返回').length,3);
  assert.ok(p.ships.Large_Cargo_Ship>=100+found);
});

test('recall and stop-after-round cancel repeat without losing returned ships; failed refuelling stops safely',()=>{
  for(const type of ['recall','stopExpedition']){
    const {world,player,p,action}=fixture();act(world,player,action,T);const m=world.missions[0];
    m.seed=seedFor(.95,1);const other=createPlayer(world,'连跑权限测试',T,()=>.4);
    assert.throws(()=>act(world,other,{type,id:m.id},T));
    act(world,player,{type,id:m.id},T);
    advance(world,T+86400000);
    assert.equal(world.missions.length,0);assert.deepEqual(p.ships,formation);assert.equal(p.flightsUsed,1);
    assert.match(player.reports.find(r=>r.title==='舰队已返回').body,/停止/);
  }
  const {world,player,p,action}=fixture();act(world,player,action,T);const m=world.missions[0];
  m.seed=seedFor(.95,1);p.resources[2]=0;finishRound(world,m);
  assert.equal(world.missions.length,0);assert.deepEqual(p.ships,formation);assert.equal(p.resources[2],0);
  assert.match(player.reports.find(r=>r.title==='舰队已返回').body,/停止.*资源不足/);
});

test('retreat stops repeat on return; mining is a bounded, slower metal/crystal supplement',()=>{
  const {world,player,p,action}=fixture();
  act(world,player,{...action,ships:{Recycler:10},rounds:1},T);
  const m=world.missions[0];m.seed=seedFor(.8,.95,true);
  // A saved repeating mission whose escorts no longer qualify must not restart.
  m.repeat.total=3;finishRound(world,m);
  assert.equal(world.missions.length,0);assert.equal(p.ships.Recycler,10);assert.equal(player.darkMatter,0);
  assert.match(player.reports.find(r=>r.title==='舰队已返回').body,/本轮撤退/);
  const now=world.at;act(world,player,{...action,task:'mine',ships:{Recycler:10},holdHours:4},now);
  const mine=world.missions[0];advance(world,mine.end);
  assert.equal(mine.end-mine.start,2*3600000);advance(world,mine.end);
  assert.deepEqual(mine.cargo,miningCargo(10,4,units));assert.deepEqual(mine.cargo,[28000,12000,0]);
  assert.equal(rules.explorationSeconds,900);assert.equal(mine.darkMatter,undefined);
  advance(world,mine.end);
  act(world,player,{...action,task:'mine',ships:{Recycler:10},holdHours:4},world.at);
  const legacy=world.missions[0];delete legacy.workSeconds;
  advance(world,legacy.end);assert.equal(legacy.end-legacy.start,240000);
  advance(world,legacy.end);assert.deepEqual(legacy.cargo,[140000,60000,0]);
});

test('a small real escort loss ends the repeat even when spare ships and fuel are available',()=>{
  const {world,player,p,action}=fixture(),ships={Battleship:10,Light_Fighter:10,Recycler:10};
  Object.assign(player.tech,{Weapons_Tech:0,Shielding_Tech:0,Strength_Tech:0});
  p.ships=Object.fromEntries(Object.entries(ships).map(([id,n])=>[id,n*2]));
  const assessment=escortAssessment(ships,player.tech,'inner');
  assert.equal(assessment.safe,true,JSON.stringify(assessment.losses));
  assert.ok(Object.keys(assessment.losses).length>0,'Fixture must sustain an actual small escort loss');
  act(world,player,{...action,ships,zone:'inner'},T);const m=world.missions[0];m.seed=seedFor(.95,1,true);
  finishRound(world,m);
  assert.equal(world.missions.length,0);assert.equal(p.flightsUsed,1);assert.equal(p.ships.Recycler,20);
  for(const[id,n]of Object.entries(ships))assert.equal(p.ships[id],n*2-(assessment.losses[id]||0));
  assert.match(player.reports.find(r=>r.title==='舰队已返回').body,/护航舰出现损失/);
});
