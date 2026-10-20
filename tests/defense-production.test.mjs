import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer,act,advance,migrateWorld,duration} from '../game/engine.mjs';
import {units,tech,publicCatalog} from '../game/catalog.mjs';
import {productionQueue,productionQueueKey,missileStorage,migrateDefenseProduction} from '../game/production.mjs';
import {createData,shipCapacity,shipBlockReason} from '../client/command-p0/data.mjs';

const T=1800000000000;
function fixture(){
 const world=createWorld(T),player=createPlayer(world,'防务独立队列隔离测试',T,()=>.2),p=world.planets[player.home];
 p.resources=[1e8,1e8,1e8];p.buildings={Shipyard:10,Missile_Silo:8,Robotics_Facility:6,Solar_Plant:20};p.defense={};p.ships={};p.shipQueue=[];p.defenseQueue=[];
 player.tech=Object.fromEntries(Object.keys(tech).map(id=>[id,10]));
 return {world,player,p,build:(id,count=1)=>act(world,player,{type:'ship',planet:p.id,id,count},T)};
}
test('support production and shipbuilding start concurrently, debit once and settle into their own inventories',()=>{
 const {world,p,build}=fixture(),stock=[...p.resources];build('Battleship',10);build('Rocket_Launcher',3);
 assert.equal(p.shipQueue.length,1);assert.equal(p.defenseQueue.length,1);assert.equal(p.shipQueue[0].start,T);assert.equal(p.defenseQueue[0].start,T);
 assert.deepEqual(p.resources,stock.map((n,i)=>n-units.Battleship.cost[i]*10-units.Rocket_Launcher.cost[i]*3));
 advance(world,p.defenseQueue[0].end);assert.equal(p.defense.Rocket_Launcher,1);assert.equal(p.defenseQueue[0].remaining,2);assert.equal(p.shipQueue[0].remaining,10);
 const final=Math.max(...[p.shipQueue[0],p.defenseQueue[0]].map(q=>q.end+(q.remaining-1)*q.each*1000));advance(world,final);
 assert.equal(p.ships.Battleship,10);assert.equal(p.defense.Rocket_Launcher,3);assert.equal(p.shipQueue.length+p.defenseQueue.length,0);
});
test('each production line has its own eight-batch limit and support-centre speed',()=>{
 const {p,player,build}=fixture();for(let i=0;i<8;i++)build('Battleship');build('Rocket_Launcher');
 assert.equal(shipBlockReason(units.Rocket_Launcher,1,createData(publicCatalog,p,player),false),'');
 assert.throws(()=>build('Battleship'),/队列已满/);for(let i=1;i<8;i++)build('Rocket_Launcher');assert.throws(()=>build('Rocket_Launcher'),/队列已满/);
 const before=duration(units.Ion_Cannon,'ship',p);p.buildings.Shipyard=20;assert.equal(duration(units.Ion_Cannon,'ship',p),before);p.buildings.Missile_Silo=12;assert.ok(duration(units.Ion_Cannon,'ship',p)<before);
 assert.equal(productionQueueKey(units.Rocket_Launcher),'defenseQueue');assert.equal(productionQueueKey(units.Iron_Behemoth),'flagshipQueue');assert.equal(productionQueue(p,units.Rocket_Launcher),p.defenseQueue);
});
test('support prerequisites, dome uniqueness, missile reservation and downgrade protection use defense orders',()=>{
 const {world,p,player,build}=fixture();p.buildings.Shipyard=0;build('Small_Shield_Dome');assert.throws(()=>build('Small_Shield_Dome'),/只能建造一个/);
 assert.equal(shipCapacity(units.Small_Shield_Dome,createData(publicCatalog,p,player)),0);
 build('Interceptor_Missile',78);assert.equal(missileStorage(p),78);assert.throws(()=>build('Interplanetary_Missile',2),/储位/);
 assert.equal(shipCapacity(units.Interplanetary_Missile,createData(publicCatalog,p,player)),1);
 assert.throws(()=>act(world,player,{type:'downgrade',planet:p.id,id:'Missile_Silo'},T),/防务生产/);
 p.buildings.Missile_Silo=0;const stock=[...p.resources];assert.throws(()=>build('Rocket_Launcher'),/前置/);assert.deepEqual(p.resources,stock);
});
test('legacy mixed batches migrate once with paid work, timing, and quantities intact, including offline completion',()=>{
 const {world,p}=fixture();delete p.defenseQueue;
 p.shipQueue=[{id:'Rocket_Launcher',count:3,remaining:2,each:10,start:T-10000,end:T+10000},{id:'Battleship',count:2,remaining:2,each:60,start:T+20000,end:T+80000},{id:'Light_Laser',count:1,remaining:1,each:15,start:T+140000,end:T+155000}];
 const old=structuredClone(p.shipQueue),stock=[...p.resources];migrateWorld(world);
 assert.deepEqual(p.shipQueue,[old[1]]);assert.deepEqual(p.defenseQueue,[old[0],old[2]]);assert.deepEqual(p.resources,stock);
 migrateDefenseProduction(p,units);assert.equal(p.defenseQueue.length,2);assert.deepEqual(p.defenseQueue,[old[0],old[2]]);
 p.buildings.Missile_Silo=0;advance(world,T+155000);assert.deepEqual(p.ships,{Battleship:2});assert.deepEqual(p.defense,{Rocket_Launcher:2,Light_Laser:1});assert.equal(p.defenseQueue.length,0);
});
