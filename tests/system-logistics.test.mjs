import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer,act,advance,snapshot,migrateWorld,economy,costAt,fleetQuote} from '../game/engine.mjs';
import {buildings,tech,units} from '../game/catalog.mjs';
import {logisticsBuilding,logisticsKey,availableResources,availableCapacity,storageMembers,storageEconomy,integrateStorage,spendResources,depositResources} from '../game/system-logistics.mjs';
const T=1800000000000;
function fixture(){
 const world=createWorld(T),player=createPlayer(world,'物流验收',T,()=>.5),home=world.planets[player.home];
 home.position=[1,250,4];home.fields=1000;home.resources=[20000,20000,20000];
 const clone=(id,extra={})=>({...structuredClone(home),id,name:id,...extra});
 const colony=clone('colony',{position:[1,250,5],resources:[30000,40000,50000]}),moon=clone('moon',{moon:true,parent:home.id,resources:[10,20,30],buildings:{Moon_Base:1},fields:10}),other=clone('other',{position:[1,251,5]}),enemy=clone('enemy',{owner:'enemy'}),galaxy=clone('galaxy',{position:[2,250,5]});
 world.planets=Object.fromEntries([home,colony,moon,other,enemy,galaxy].map(p=>[p.id,p]));world.players={[player.id]:player};world.missions=[];world.battles={};
 return {world,player,home,colony,moon,other,enemy,galaxy};
}
const run=(f,payload,p=f.home)=>act(f.world,f.player,{planet:p.id,...payload},f.world.at);
const total=f=>[f.home,f.colony,f.moon].reduce((a,p)=>a.map((v,i)=>v+p.resources[i]),[0,0,0]);
function enabled(){const f=fixture();f.world.logisticsCenters={[logisticsKey(f.home)]:{owner:f.player.id,position:[1,250],level:1,queue:null}};return f;}
const minus=(a,b)=>a.map((v,i)=>v-b[i]);
const approx=(actual,expected)=>actual.forEach((v,i)=>assert.ok(Math.abs(v-expected[i])<1e-6,`${v} != ${expected[i]}`));

test('logistics construction charges only its host, stays isolated until completion, and cancellation refunds exactly once',()=>{
 const f=fixture(),before=[...f.home.resources],colony=[...f.colony.resources];
 run(f,{type:'logistics',mode:'build'});assert.deepEqual(f.home.resources,minus(before,logisticsBuilding.cost));assert.deepEqual(f.colony.resources,colony);
 assert.equal(storageMembers(f.world,f.home).length,1);assert.equal(f.world.logisticsCenters[logisticsKey(f.home)].queue.end,T+60000);
 run(f,{type:'logistics',mode:'cancel'},f.colony);assert.deepEqual(f.home.resources,before);assert.deepEqual(f.colony.resources,colony);assert.equal(f.world.logisticsCenters[logisticsKey(f.home)],undefined);
 assert.throws(()=>run(f,{type:'logistics',mode:'cancel'}),/没有/);assert.deepEqual(f.home.resources,before);
 run(f,{type:'logistics',mode:'build'});advance(f.world,T+59999);assert.equal(storageMembers(f.world,f.home).length,1);advance(f.world,T+60000);assert.equal(storageMembers(f.world,f.home).length,3);assert.equal(f.world.logisticsCenters[logisticsKey(f.home)].queue,null);
});
test('completed storage includes only same owner and same galaxy/system, including moons',()=>{
 const f=enabled();assert.deepEqual(new Set(storageMembers(f.world,f.home).map(p=>p.id)),new Set([f.home.id,f.colony.id,f.moon.id]));
 assert.deepEqual(availableResources(f.world,f.home),total(f));assert.deepEqual(availableResources(f.world,f.moon),total(f));
 for(const p of [f.other,f.enemy,f.galaxy])assert.deepEqual(availableResources(f.world,p),p.resources);
 const before=[...f.other.resources];spendResources(f.world,f.home,[25000,25000,25000]);assert.deepEqual(f.home.resources,[0,0,0]);assert.deepEqual(f.other.resources,before);
});
test('shared construction and research debit the pool and refund without duplication',()=>{
 const f=enabled();f.home.resources=[0,0,0];let before=total(f);
 run(f,{type:'build',id:'Metal_Mine'});assert.deepEqual(total(f),minus(before,costAt(buildings.Metal_Mine,1)));
 run(f,{type:'cancel',kind:'build'});assert.deepEqual(total(f),before);
 f.home.buildings.Research_Lab=1;before=total(f);run(f,{type:'research',id:'Energy_Tech'});assert.deepEqual(total(f),minus(before,costAt(tech.Energy_Tech,1)));run(f,{type:'cancel',kind:'research'});assert.deepEqual(total(f),before);
});
test('ship construction, transport cargo and fleet fuel use resources held by other members',()=>{
 const f=enabled();f.home.resources=[0,0,0];f.home.buildings.Shipyard=2;f.player.tech.Combustion_Drive=2;let before=total(f);
 run(f,{type:'ship',id:'Cargo_Ship',count:2});assert.deepEqual(total(f),minus(before,units.Cargo_Ship.cost.map(n=>n*2)));
 f.home.ships.Cargo_Ship=1;const cargo=[100,200,300],quote=fleetQuote(f.player,f.home,{Cargo_Ship:1},f.other.position,100);before=total(f);
 run(f,{type:'dispatch',task:'transport',ships:{Cargo_Ship:1},position:f.other.position,target:f.other.id,cargo});assert.deepEqual(total(f),minus(before,cargo.map((n,i)=>n+(i===2?quote.fuel:0))));assert.equal(f.home.ships.Cargo_Ship,0);assert.equal(f.world.missions.length,1);
});
test('shared production integrates each physical store once and uses combined capacity',()=>{
 const f=enabled();f.home.buildings={Command_Center:1,Metal_Mine:1,Solar_Plant:2};f.colony.buildings={Command_Center:1,Crystal_Mine:1,Solar_Plant:2};
 for(const p of [f.home,f.colony,f.moon])p.resources=[0,0,0];const expected=storageEconomy(f.world,f.home,economy),cap=availableCapacity(f.world,f.home);
 integrateStorage(f.world,T+3600000,economy);approx(total(f),expected.rate);assert.deepEqual(availableCapacity(f.world,f.home),cap);
 integrateStorage(f.world,T+1000*3600000,economy);assert.deepEqual(total(f),[cap[0],cap[1],0]);
 const stable=total(f);integrateStorage(f.world,f.world.at,economy);assert.deepEqual(total(f),stable);
});
test('production can fill another member even when its producing planet is locally full; overflow refund is preserved',()=>{
 const f=enabled();f.home.resources=availableCapacity({planets:{[f.home.id]:f.home}},f.home);f.colony.resources=[0,0,0];f.moon.resources=[0,0,0];const before=total(f),rate=storageEconomy(f.world,f.home,economy).rate;
 integrateStorage(f.world,T+3600000,economy);approx(total(f),before.map((v,i)=>v+rate[i]));
 const delta=[1e8,2e8,3e8],balance=total(f);depositResources(f.world,f.moon,delta);assert.deepEqual(total(f),balance.map((v,i)=>v+delta[i]));
});
test('failed shared payments do not deduct partial funds or enqueue construction',()=>{
 const f=enabled();for(const p of [f.home,f.colony,f.moon])p.resources=[0,0,0];f.colony.resources=[100000,0,0];const before=[...total(f)];
 assert.throws(()=>run(f,{type:'build',id:'Metal_Mine'}),/资源不足/);assert.deepEqual(total(f),before);assert.equal(f.home.buildQueue,null);
 assert.throws(()=>spendResources(f.world,f.home,[1,1,0]),/资源不足/);assert.deepEqual(total(f),before);
 const g=fixture();g.home.resources=[0,0,0];const local=[...g.home.resources];assert.throws(()=>run(g,{type:'logistics',mode:'build'}),/资源不足/);assert.deepEqual(g.home.resources,local);assert.equal(g.world.logisticsCenters,undefined);
});
test('newly colonized planet joins an existing pool immediately',()=>{
 const f=enabled();f.player.tech.Astrophysics_Tech=20;f.home.ships.Colony_Ship=1;const position=[1,250,10];
 run(f,{type:'dispatch',task:'colonize',position,ships:{Colony_Ship:1},cargo:[100,200,300]});const arrival=f.world.missions[0].end;advance(f.world,arrival);
 const fresh=Object.values(f.world.planets).find(p=>p.owner===f.player.id&&p.position.join(':')===position.join(':'));assert.ok(fresh);assert.equal(storageMembers(f.world,f.home).length,4);assert.deepEqual(availableResources(f.world,fresh),availableResources(f.world,f.home));assert.ok(availableCapacity(f.world,f.home).every((n,i)=>n>availableCapacity({planets:{[f.home.id]:f.home}},f.home)[i]));
});
test('reload preserves completed and in-progress centers and snapshot exposes separate local/shared balances',()=>{
 const f=enabled(),before=total(f);const world=migrateWorld(JSON.parse(JSON.stringify(f.world))),home=world.planets[f.home.id];assert.deepEqual(availableResources(world,home),before);
 const s=snapshot(world,world.players[f.player.id]),p=s.planets.find(p=>p.id===home.id);assert.deepEqual(p.resources,f.home.resources);assert.deepEqual(p.availableResources,before);assert.equal(p.storage.shared,true);assert.equal(s.logistics.find(x=>x.position[1]===250).members.length,3);
 const g=fixture();run(g,{type:'logistics',mode:'build'});const loaded=migrateWorld(JSON.parse(JSON.stringify(g.world)));advance(loaded,T+60000);assert.equal(storageMembers(loaded,loaded.planets[g.home.id]).length,3);
});
test('fusion consumes fuel from the shared pool and stops safely at exhaustion',()=>{
 const f=enabled();f.home.buildings={Command_Center:1,Metal_Mine:2,Fusion_Reactor:1};f.home.resources=[0,0,0];f.colony.resources=[0,0,1];f.moon.resources=[0,0,0];assert.ok(economy(f.home,f.world).supply>0);
 advance(f.world,T+3600000);assert.equal(availableResources(f.world,f.home)[2],0);assert.equal(economy(f.home,f.world).supply,0);assert.ok(total(f).every(Number.isFinite));
});
