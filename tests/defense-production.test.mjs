import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer,act,advance,migrateWorld,duration,explore} from '../game/engine.mjs';
import {units,tech,publicCatalog} from '../game/catalog.mjs';
import {productionQueue,productionQueueKey,missileStorage,migrateDefenseProduction} from '../game/production.mjs';
import {createData,shipCapacity,shipBlockReason} from '../client/command-p0/data.mjs';
import {accelerationQuote,darkMatterRules} from '../game/dark-matter.mjs';
import {availableResources,logisticsKey} from '../game/system-logistics.mjs';
import {createSpatialBattle} from '../game/spatial-battle.mjs';
import {fleetQuote,economy} from '../game/engine.mjs';
import {quoteFleet} from '../client/command-ui/p1-data.mjs';
import {communityShipStats} from '../game/ship-community-stats.mjs';
import {surfaceLayout} from '../game/surface-layout.mjs';
import {plannedNpcs} from '../game/npc-types.mjs';

test('ship baselines, archive and navigation share the accepted rules; all playable unlocks are reachable',()=>{
 const fields=['strength','shield','attack','speed','cargo','fuel'];
 for(const [id,expected] of Object.entries(communityShipStats)){
  assert.deepEqual(Object.fromEntries(fields.map(k=>[k,units[id][k]])),expected);
  const row=publicCatalog.shipArchive.find(s=>s.id===id);
  assert.deepEqual(row.stats,expected);assert.match(row.statsLabel,/Wiki/);
 }
 assert.deepEqual([units.Cargo_Ship.fuel,units.Recycler.speed,units.Solar_Satellite.shield,units.Solar_Satellite.attack,units.Battleship.fuel],[10,2000,0,0,250]);
 const nodes={...publicCatalog.buildings,...tech},seen=new Set();
 function visit(id,level=1,path=[]){
  assert(nodes[id],`Missing prerequisite ${id}`);assert(!path.includes(id),`Unlock cycle: ${[...path,id]}`);
  const n=nodes[id];assert(level<=(n.maxLevel??(n.one?1:Infinity)),`${id} exceeds its cap`);
  if(publicCatalog.buildings[id])assert(n.moon||surfaceLayout.slots[id]||['Metal_Storage','Crystal_Storage','Gas_Storage'].includes(id),`${id} has no build location`);
  if(seen.has(id))return;for(const [parent,min] of n.req||[])visit(parent,min,[...path,id]);seen.add(id);
 }
 for(const u of Object.values(units).filter(u=>u.fleetAvailable!==false))for(const [id,min] of u.req)visit(id,min);
 for(const id of ['Death_Star','Guardian'])assert.equal(publicCatalog.shipArchive.find(s=>s.id===id).playable,false);
 const player={tech:{Hyperspace_Drive:7,Combustion_Drive:2}},p={position:[1,16,3]},ships={Interceptor:1,Recycler:2},position=[1,20,6];
 const server=fleetQuote(player,p,ships,position,50),ui=quoteFleet({catalog:publicCatalog,state:{player}},p,{ships,position,speed:50});
 assert.deepEqual(ui,{...server,count:3});
 assert(fleetQuote(player,p,{Interceptor:1},position).seconds<fleetQuote({tech:{}},p,{Interceptor:1},position).seconds);
});

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

function acceleration(p,player,kind,now=T){
 const quote=accelerationQuote(p,player,kind,now);
 return {type:'accelerate',planet:p.id,kind,queue:quote.queue,maxCost:quote.cost};
}
test('dark matter accelerates only the selected paid batch, debits the server price once and preserves later work',()=>{
 const {world,p,player,build}=fixture();player.darkMatter=100;
 build('Battleship',10);build('Battleship',10);build('Rocket_Launcher',3);
 const first=structuredClone(p.shipQueue[0]),next=structuredClone(p.shipQueue[1]),defense=structuredClone(p.defenseQueue),stock=[...p.resources];
 const request=acceleration(p,player,'ship'),cost=Math.ceil((first.end+(first.remaining-1)*first.each*1000-T)/1000/darkMatterRules.secondsPerUnit);
 act(world,player,{...request,cost:0,count:10000},T);
 assert.equal(player.darkMatter,100-cost);assert.equal(p.ships.Battleship,10);assert.equal(p.shipQueue.length,1);
 assert.equal(p.shipQueue[0].queueId,next.queueId);assert.equal(p.shipQueue[0].start,T);assert.equal(p.shipQueue[0].end,T+next.each*1000);
 assert.deepEqual(p.defenseQueue,defense);assert.deepEqual(p.resources,stock);assert.equal(world.at,T);
 assert.throws(()=>act(world,player,request,T),/任务已完成或已变化/);assert.equal(player.darkMatter,100-cost);assert.equal(p.shipQueue[0].remaining,10);
 const saved=JSON.parse(JSON.stringify(world));migrateWorld(saved);advance(saved,T+next.each*10*1000);
 assert.equal(saved.planets[p.id].ships.Battleship,20);assert.equal(saved.players[player.id].darkMatter,100-cost);
});
test('dark matter rejects foreign work, missing balance and underquoted fees without consuming work or currency',()=>{
 const {world,p,player,build}=fixture();build('Battleship',100);
 const request=acceleration(p,player,'ship'),before=structuredClone(p.shipQueue);
 player.darkMatter=0;assert.throws(()=>act(world,player,request,T),/暗物质不足/);
 player.darkMatter=1000;
 for(const maxCost of [0,-1,1.5,request.maxCost-1])assert.throws(()=>act(world,player,{...request,maxCost},T),/费用/);
 const other=createPlayer(world,'暗物质权限隔离测试',T,()=>.4);
 assert.throws(()=>act(world,other,request,T),/无法操作/);
 assert.throws(()=>act(world,player,{...request,kind:'mission'},T),/任务已完成或已变化/);
 assert.deepEqual(p.shipQueue,before);assert.equal(player.darkMatter,1000);
 const end=p.shipQueue[0].end+(p.shipQueue[0].remaining-1)*p.shipQueue[0].each*1000;
 assert.throws(()=>act(world,player,request,end),/任务已完成或已变化/);assert.equal(player.darkMatter,1000);
});
test('construction and research acceleration complete paid levels and construction plans pay normally for the next item',()=>{
 const {world,p,player}=fixture();player.darkMatter=100;p.buildings.Research_Lab=10;
 act(world,player,{type:'build',planet:p.id,id:'Metal_Mine'},T);
 const buildRequest=acceleration(p,player,'build'),paid=[...p.resources];
 p.constructionPlan={items:[{id:'Metal_Mine',level:2}],paused:false,revision:1};
 act(world,player,buildRequest,T);
 assert.equal(p.buildings.Metal_Mine,1);assert.equal(p.buildQueue.level,2);assert.equal(p.buildQueue.start,T);
 assert.deepEqual(p.resources,paid.map((n,i)=>n-p.buildQueue.cost[i]));
 assert.throws(()=>act(world,player,buildRequest,T),/任务已完成或已变化/);
 act(world,player,{type:'research',planet:p.id,id:'Energy_Tech'},T);
 const research=acceleration(p,player,'research'),stock=[...p.resources];
 act(world,player,research,T);assert.equal(player.tech.Energy_Tech,11);assert.equal(player.researchQueue,null);assert.deepEqual(p.resources,stock);
 assert.equal(player.darkMatter,100-buildRequest.maxCost-research.maxCost);
});
test('defense, flagship and legacy queues support acceleration without granting unbuilt or already produced units',()=>{
 const {world,p,player}=fixture();player.darkMatter=100;
 p.defenseQueue=[{id:'Rocket_Launcher',count:3,remaining:2,each:10,start:T-10000,end:T+10000},{id:'Rocket_Launcher',count:2,remaining:2,each:10,start:T+20000,end:T+30000}];p.defense.Rocket_Launcher=1;
 const request=acceleration(p,player,'defense');act(world,player,request,T);
 assert.equal(p.defense.Rocket_Launcher,3);assert.equal(p.defenseQueue[0].start,T);assert.ok(p.defenseQueue[0].queueId);
 assert.throws(()=>act(world,player,request,T),/任务已完成或已变化/);
 p.flagshipQueue=[{id:'Iron_Behemoth',count:2,remaining:2,each:1800,start:T,end:T+1800000}];
 act(world,player,acceleration(p,player,'flagship'),T);assert.equal(p.ships.Iron_Behemoth,2);assert.equal(p.flagshipQueue.length,0);
 assert.equal(player.darkMatter,97);
});
test('resource exchange retains its legacy rate, shared storage and overflow, rejecting invalid or unaffordable purchases',()=>{
 const {world,p,player}=fixture();player.darkMatter=12;
 const colony={...structuredClone(p),id:'dark-matter-test-colony',position:[...p.position.slice(0,2),p.position[2]+1]};
 world.planets[colony.id]=colony;world.logisticsCenters={[logisticsKey(p)]:{owner:player.id,position:p.position.slice(0,2),level:1}};
 const before=availableResources(world,p);
 act(world,player,{type:'purchase',planet:p.id,resource:1,size:10,quantity:1},T);
 assert.equal(player.darkMatter,2);assert.deepEqual(availableResources(world,p),before.map((n,i)=>n+(i===1?100000:0)));
 for(const action of [{resource:0,size:10,quantity:1},{resource:3,size:1,quantity:1},{resource:0,size:1,quantity:-1},{resource:0,size:1,quantity:1.5}]){
  assert.throws(()=>act(world,player,{type:'purchase',planet:p.id,...action},T));assert.equal(player.darkMatter,2);
 }
 assert.equal(player.reports[0].darkMatterSpent,10);
});
test('exploration dark matter stays in cargo until return and is credited exactly once after save restoration',()=>{
 const {world,p,player}=fixture(),ships={Cargo_Ship:10};player.darkMatter=7;
 let seed=1,outcome;
 for(;seed<1000;seed++){outcome=explore(ships,seed);if(outcome.darkMatter>0)break;}
 assert.ok(outcome.darkMatter>0);
 world.missions.push({id:'dark-matter-return-test',owner:player.id,from:p.id,task:'explore',phase:'holding',position:[1,p.position[1],16],start:T,end:T+1000,travel:1000,ships,cargo:[0,0,0],seed});
 advance(world,T+1000);assert.equal(player.darkMatter,7);assert.equal(world.missions[0].darkMatter,outcome.darkMatter);
 const saved=JSON.parse(JSON.stringify(world));migrateWorld(saved);advance(saved,T+2000);
 assert.equal(saved.players[player.id].darkMatter,7+outcome.darkMatter);assert.equal(saved.missions.length,0);
 advance(saved,T+3000);assert.equal(saved.players[player.id].darkMatter,7+outcome.darkMatter);
 assert.equal(saved.players[player.id].reports.filter(r=>r.type==='fleet'&&r.darkMatter>0).length,1);
});
test('a cheaper quote at confirmation charges only the remaining batch and accelerated defenses join an ongoing battle',()=>{
 const {world,p,player}=fixture();player.darkMatter=100;
 p.shipQueue=[{id:'Battleship',count:2,remaining:2,each:1800,start:T,end:T+1800000}];
 const request=acceleration(p,player,'ship');assert.equal(request.maxCost,2);
 act(world,player,request,T+1800000);
 assert.equal(p.ships.Battleship,2);assert.equal(player.darkMatter,99);assert.equal(p.shipQueue.length,0);
 const now=world.at,b=createSpatialBattle({id:'dm-defense-test',target:p.id,attacker:'test-attacker',defender:player.id,start:now});
 world.battles[b.id]=b;p.ships={};p.defense={};
 p.defenseQueue=[{id:'Rocket_Launcher',count:3,remaining:3,each:60,start:now,end:now+60000}];
 act(world,player,acceleration(p,player,'defense',now),now);
 assert.equal(b.initial.defender.Rocket_Launcher,3);assert.equal(p.defense.Rocket_Launcher,undefined);assert.equal(p.defenseQueue.length,0);
 assert.equal(player.darkMatter,98);
});


test('core loop collects, builds, researches and delivers fleets and cargo exactly once across offline restoration',()=>{
 let world=createWorld(T),player=createPlayer(world,'测试_P0核心循环',T,()=>.21),p=world.planets[player.home];
 const original=[...p.resources],rate=economy(p,world).rate;
 advance(world,T+60000);assert(p.resources[0]>original[0]);assert(rate[0]>0);
 // Seed only this in-memory test colony to reach every mission within one core-flow check.
 p.resources=[1e8,1e8,1e8];p.buildings={Command_Center:1,Shipyard:4,Robotics_Facility:2,Research_Lab:3,Solar_Plant:20};
 player.tech={Computer_Tech:4,Espionage_Tech:2,Combustion_Drive:6,Impulse_Drive:3,Shielding_Tech:2,Astrophysics_Tech:1};
 let before=[...p.resources];act(world,player,{type:'build',planet:p.id,id:'Metal_Mine'},world.at);
 assert.deepEqual(p.resources,before.map((v,i)=>v-p.buildQueue.cost[i]));advance(world,p.buildQueue.end);assert.equal(p.buildings.Metal_Mine,1);
 before=[...p.resources];act(world,player,{type:'research',planet:p.id,id:'Energy_Tech'},world.at);
 assert.deepEqual(p.resources,before.map((v,i)=>v-tech.Energy_Tech.cost[i]));advance(world,player.researchQueue.end);assert.equal(player.tech.Energy_Tech,1);
 for(const id of ['Cargo_Ship','Probe','Recycler','Colony_Ship']){
  before=[...p.resources];act(world,player,{type:'ship',planet:p.id,id,count:1},world.at);
  assert.deepEqual(p.resources,before.map((v,i)=>v-units[id].cost[i]));
 }
 const last=p.shipQueue.at(-1);advance(world,last.end);for(const id of ['Cargo_Ship','Probe','Recycler','Colony_Ship'])assert.equal(p.ships[id],1);
 const restore=()=>{world=JSON.parse(JSON.stringify(world));migrateWorld(world);player=world.players[player.id];p=world.planets[p.id];};
 const dispatch=(task,ships,target,cargo=[0,0,0])=>{
  const quote=fleetQuote(player,p,ships,target.position),stock=[...p.resources];
  act(world,player,{type:'dispatch',planet:p.id,task,ships,target:target.id,position:target.position,cargo},world.at);
  assert.deepEqual(p.resources,stock.map((v,i)=>v-cargo[i]-(i===2?quote.fuel:0)));
  for(const id of Object.keys(ships))assert.equal(p.ships[id],0);
  return world.missions.at(-1);
 };
 const enemy=createPlayer(world,'测试_P0目标',world.at,()=>.47),target=world.planets[enemy.home];target.ships={};target.defense={};target.resources=[1000,1000,1000];target.debris=[600,400,0];
 let m=dispatch('spy',{Probe:1},target),end=m.end+ m.travel;restore();advance(world,end);
 assert.equal(p.ships.Probe,1);assert(player.reports.some(r=>r.type==='spy'));assert.equal(world.missions.length,0);
 m=dispatch('attack',{Cargo_Ship:1},world.planets[target.id]);advance(world,m.end+1000);
 const report=player.reports.find(r=>r.type==='battle');assert.equal(report.winner,'attacker');assert(report.loot.some(n=>n>0));assert.equal(report.deliveries[0].status,'returning');
 m=world.missions[0];end=m.end;restore();advance(world,end);assert.equal(p.ships.Cargo_Ship,1);
 assert.equal(player.reports.find(r=>r.type==='battle').deliveries[0].status,'delivered');
 m=dispatch('recycle',{Recycler:1},world.planets[target.id]);advance(world,m.end);assert.deepEqual(m.cargo,[600,400,0]);assert.deepEqual(world.planets[target.id].debris,[0,0,0]);
 end=m.end;restore();before=[...p.resources];
 assert(before.every((n,i)=>n>economy(p,world).capacity[i]),'The seeded inventory is above capacity: production is paused, returned cargo must still be preserved');
 advance(world,end);assert.deepEqual(p.resources,before.map((n,i)=>n+[600,400,0][i]));
 assert.equal(p.ships.Recycler,1);
 const reserved=new Set(plannedNpcs(world,1,p.position[1]).map(x=>x.slot));
 const empty=Array.from({length:15},(_,i)=>[1,p.position[1],i+1]).find(pos=>!reserved.has(pos[2])&&!Object.values(world.planets).some(x=>x.position.join(':')===pos.join(':')));assert(empty);
 m=dispatch('colonize',{Colony_Ship:1},{position:empty},[100,200,300]);end=m.end;restore();advance(world,end);
 const colony=Object.values(world.planets).find(x=>x.position.join(':')===empty.join(':'));assert.equal(colony.owner,player.id);assert.deepEqual(colony.resources,[600,700,300]);assert.equal(p.ships.Colony_Ship,0);assert.equal(world.missions.length,0);
 m=dispatch('transport',{Cargo_Ship:1},colony,[100,100,100]);const arrival=m.end;
 before=[...colony.resources];const colonyRate=economy(colony,world).rate,depart=world.at;advance(world,arrival);
 for(let i=0;i<3;i++)assert(Math.abs(colony.resources[i]-before[i]-colonyRate[i]*(arrival-depart)/3600000-100)<.001);
 assert.deepEqual(m.cargo,[0,0,0]);end=m.end;restore();advance(world,end);
 assert.equal(p.ships.Cargo_Ship,1);assert.equal(world.missions.length,0);
 const stable=structuredClone({ships:p.ships,reports:player.reports,resources:p.resources});advance(world,end);
 assert.deepEqual({ships:p.ships,reports:player.reports,resources:p.resources},stable);
});
