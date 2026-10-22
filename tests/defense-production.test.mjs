import {equityMembers,distributeFees} from '../game/exchange-equity.mjs';
import {startFactionWar,finishFactionWar,WAR_INTERVAL} from '../game/faction-wars.mjs';
import {factionWarReplay} from '../game/faction-war-replay.mjs';
import {fleetPower,majorIds} from '../game/grand-powers.mjs';
import {migrateMinorNations,starbayId} from '../game/minor-nations.mjs';

test('Starbay concession preserves every old entity and inbound colony, opens trade and never replenishes on reload',()=>{
 const world=createWorld(),player=createPlayer(world,'测试_星湾边界保护');
 // Return this modern fixture to the pre-concession state.
 const allocated=[...world.minorNations.systems];
 for(const [id,p]of Object.entries(world.planets))if(p.owner===starbayId){delete world.sovereignty.claims['1:'+p.position[1]];delete world.planets[id];}
 for(const [id,m]of Object.entries(world.strategic.mines))if(m.owner===starbayId)delete world.strategic.mines[id];
 delete world.players[starbayId];delete world.minorNations;
 world.grandPowers.reserve.push(...allocated);world.sovereignty.safeSystems.push(...allocated);
 const home=world.planets[player.home],oldSystem=home.position[1];delete world.sovereignty.claims['1:'+oldSystem];home.position=[1,allocated[0],7];claimSystem(world,player,home.position);
 world.missions.push({id:'test-protected-colony',owner:player.id,task:'colonize',phase:'outbound',position:[1,allocated[1],7],ships:{Colony_Ship:1}});
 const before=structuredClone({players:world.players,planets:world.planets,missions:world.missions,claims:world.sovereignty.claims,reserve:world.grandPowers.reserve});
 const factory=(owner,name,position,extra)=>({...structuredClone(home),owner,name,position,...extra});
 migrateMinorNations(world,factory);
 for(const [id,p]of Object.entries(before.players))assert.deepEqual(world.players[id],p);
 for(const [id,p]of Object.entries(before.planets))assert.deepEqual(world.planets[id],p);
 for(const [key,c]of Object.entries(before.claims))assert.deepEqual(world.sovereignty.claims[key],c);
 assert.deepEqual(world.missions,before.missions);
 const republic=world.players[starbayId],systems=world.minorNations.systems;
 assert(systems.length>0);assert(!systems.includes(allocated[0]));assert(!systems.includes(allocated[1]));
 assert.deepEqual(world.grandPowers.reserve,before.reserve.filter(s=>!systems.includes(s)));
 for(const s of systems){assert(territoryPlan.starbay.systems.includes(s));assert.equal(world.sovereignty.safeSystems.includes(s),false);assert.equal(systemTerritory(world,[1,s,8]).systemOwner,'realm:starbay');}
 const colonies=Object.values(world.planets).filter(p=>p.owner===starbayId);assert.equal(colonies.length,systems.length);assert(colonies.length<=colonyLimit(republic));
 for(const p of colonies){assert(!plannedNpcs(world,1,p.position[1]).some(n=>n.slot===p.position[2]));for(const key of [...Object.keys(p.ships),...Object.keys(p.defense)])assert(units[key],key);}
 assert(diplomacySnapshot(world,player).partners.some(p=>p.id===starbayId&&p.territory===systems.length));assert(equityMembers(world).some(p=>p.id===starbayId&&p.share>0));
 assert.equal(canColonizeSystem(world,republic,[1,allocated[1],8]),false);
 const keep=structuredClone(world);migrateMinorNations(world,factory);assert.deepEqual(world,keep);
 home.resources=[1e8,1e8,1e8];const metal=home.resources[0],crystal=home.resources[1];
 act(world,player,{type:'trade',planet:home.id,mode:'propose',partner:starbayId,give:[1000,0,0,0,0,0,0,0,0],take:[0,100,0,0,0,0,0,0,0]},world.at);
 const offer=player.tradeOffer;act(world,player,{type:'trade',planet:home.id,mode:'accept',offer:offer.id},world.at);assert.equal(home.resources[0],metal-offer.give[0]);assert.equal(home.resources[1],crystal+100);
});
import territoryPlan from '../game/galactic-territory-plan.json' with {type:'json'};
import {usedBuildingFields} from '../game/resource-complexes.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer,act,advance,migrateWorld,duration,explore,ensureSystemNpcs,snapshot,fieldsAvailable} from '../game/engine.mjs';
import {units,tech,publicCatalog} from '../game/catalog.mjs';
import {productionQueue,productionQueueKey,missileStorage,migrateDefenseProduction} from '../game/production.mjs';
import {createData,shipCapacity,shipBlockReason,megastructureUnlocks} from '../client/command-p0/data.mjs';
import {accelerationQuote,darkMatterRules} from '../game/dark-matter.mjs';
import {availableResources,logisticsKey} from '../game/system-logistics.mjs';
import {createSpatialBattle,addSpatialFleet} from '../game/spatial-battle.mjs';
import {fleetQuote,economy} from '../game/engine.mjs';
import {quoteFleet} from '../client/command-ui/p1-data.mjs';
import {communityShipStats} from '../game/ship-community-stats.mjs';
import {surfaceLayout} from '../game/surface-layout.mjs';
import {plannedNpcs} from '../game/npc-types.mjs';
import {strategicResources,strategicKeys,strategicRules} from '../game/strategic-resources.mjs';
import {migrateDiplomacy,diplomacySnapshot,resourceLocation,recordHostility} from '../game/diplomacy.mjs';
import {polity,nearestSystems,colonyLimit,canColonizeSystem,systemTerritory,attackRestriction,claimSystem} from '../game/sovereignty.mjs';
import {migrateMarket,marketSnapshot,settleWarOrders} from '../game/market.mjs';
import {marketValues,marketFee,marketBlank} from '../game/market-rules.mjs';
import {megaKey,megastructureCatalog,megaQuote,megaEffects,systemMegaRate} from '../game/megastructure-rules.mjs';
import {megaProductionState,listenerSnapshot,migrateMegastructures} from '../game/megastructures.mjs';
import {navigationQuote} from '../game/fleet-navigation.mjs';
import {stellarType} from '../game/stellar-types.mjs';
import {storageEconomy,availableCapacity} from '../game/system-logistics.mjs';
import {migrateGrandPowerMegastructures,GRAND_POWER_MEGASTRUCTURES_VERSION} from '../game/grand-power-megastructures.mjs';
import {publicMegastructures} from '../game/megastructures.mjs';
import {starMap} from '../game/star-map.mjs';
import {megastructureTechnologies,retiredMegastructureTechnologies,megaRequiredTech} from '../game/megastructure-technologies.mjs';
import {arsenalFacilities,arsenalTechnologies,arsenalRecipes} from '../game/arsenal-rules.mjs';
import {strategicTargetReason,strikeSeconds} from '../game/arsenal.mjs';
import {devastateWorld} from '../game/desolation.mjs';

function arsenalFixture(){
 const f=fixture(),{world,player,p}=f;p.resources=[1e11,1e11,1e11];p.buildings.Research_Lab=16;
 player.tech=Object.fromEntries(Object.entries(tech).filter(([,t])=>!t.retired).map(([id,t])=>[id,t.maxLevel||40]));
 player.stellarMaterials={whiteDwarf:10000,magnetar:3000};player.strategicResources={antimatter:100};
 world.factionWars.next=Number.MAX_SAFE_INTEGER;world.strategic.nextIndustry=Number.MAX_SAFE_INTEGER;
 const system=enableMegastructures(world,p,{dyson:5,listener:3,shipyard:3,extractor:3});
 return {...f,system,action:a=>act(world,player,{type:'arsenal',planet:p.id,...a},world.at)};
}

test('stellar arsenal construction and research enforce player permission, exact materials and calibration',()=>{
 const {world,player,p,system}=arsenalFixture(),initial=[...p.resources],materials={...player.stellarMaterials};
 for(const [id,t]of Object.entries(arsenalTechnologies)){assert.equal(tech[id].factor,2);assert.deepEqual(tech[id].cost,t.cost);assert.equal(tech[id].maxLevel,id==='Stellar_Energy_Mastery'?3:1);assert(tech[id].playerOnly);}
 assert.deepEqual(megaQuote('dyson',3),{cost:[8e8,6e8,3e8],seconds:48*3600,level:4});assert.deepEqual(megaQuote('dyson',4),{cost:[20e8,16e8,8e8],seconds:72*3600,level:5});
 assert.equal(megaEffects('dyson',4).supply,1e6);assert.equal(economy(p,world).megastructureSupply,25e5);
 const build={type:'megastructure',mode:'build',planet:p.id,id:'laser'};
 system.structures.dyson.level=4;assert.throws(()=>act(world,player,build,world.at),/5 级戴森球/);assert.deepEqual(p.resources,initial);system.structures.dyson.level=5;
 player.bot=true;assert.throws(()=>act(world,player,build,world.at),/玩家/);player.bot=false;
 p.buildings.Research_Lab=15;assert.throws(()=>act(world,player,build,world.at),/16 级/);p.buildings.Research_Lab=16;
 act(world,player,build,world.at);const paid=structuredClone(system.structures.laser.queue);
 assert.deepEqual(p.resources,initial.map((n,i)=>n-arsenalFacilities.laser.cost[i]));assert.equal(player.stellarMaterials.whiteDwarf,materials.whiteDwarf-2000);
 assert.equal(paid.end-paid.start,72*3600000);assert.throws(()=>act(world,player,build,world.at),/已有巨构工程/);
 assert.throws(()=>act(world,player,{...build,mode:'cancel',queueId:'wrong'},world.at),/订单已变化/);
 act(world,player,{...build,mode:'cancel',queueId:paid.queueId},world.at);assert.deepEqual(p.resources,initial);assert.deepEqual(player.stellarMaterials,materials);
 assert.throws(()=>act(world,player,{...build,mode:'cancel',queueId:paid.queueId},world.at),/没有进行/);
 act(world,player,build,world.at);const end=system.structures.laser.queue.end;player.tech={};advance(world,end);
 assert.equal(system.structures.laser.level,1);assert.equal(system.structures.laser.calibration.end,end+12*3600000);
 assert.throws(()=>act(world,player,{type:'arsenal',mode:'charge',id:'laser',planet:p.id},world.at),/校准/);
 advance(world,end+12*3600000);assert.equal(system.structures.laser.calibration,undefined);
 const white=testMegaColony(world,p,'test-stellar-white',3);enableMegastructures(world,white,{dyson:3});white.resources=[1e11,1e11,1e11];
 assert.throws(()=>act(world,player,{...build,planet:white.id,id:'dyson'},world.at),/主序星/);assert.equal(economy(white,world).megastructureSupply,4e5);
});

test('stellar fuel and ammunition debit separately, refund once, finish offline and share one charge channel',()=>{
 const {world,player,p,system,action}=arsenalFixture();for(const id of Object.keys(arsenalFacilities))system.structures[id]={level:1};
 const cost=[...p.resources];action({mode:'produce',id:'fuel'});const q=system.arsenal.production.fuel;
 assert.equal(player.strategicResources.antimatter,76);assert.deepEqual(p.resources,cost.map((n,i)=>n-arsenalRecipes.fuel.cost[i]));
 assert.throws(()=>action({mode:'produce',id:'fuel'}),/已有订单/);assert.throws(()=>action({mode:'cancelProduction',id:'fuel',queueId:'wrong'}),/订单已变化/);
 action({mode:'cancelProduction',id:'fuel',queueId:q.id});assert.equal(player.strategicResources.antimatter,100);assert.deepEqual(p.resources,cost);
 action({mode:'produce',id:'fuel'});advance(world,world.at+24*3600000);assert.equal(system.arsenal.fuel,24);assert.equal(player.strategicResources.antimatter,76);
 action({mode:'produce',id:'missile'});assert.equal(system.arsenal.fuel,12);const missileEnd=system.arsenal.production.missile.end;
 action({mode:'charge',id:'laser'});action({mode:'charge',id:'accelerator'});assert.equal(system.arsenal.chargeQueue[1].start,system.arsenal.chargeQueue[0].end);
 assert.throws(()=>action({mode:'charge',id:'laser'}),/正在排队/);assert.equal(economy(p,world).megastructureSupply,25e5);
 advance(world,missileEnd);assert.equal(system.arsenal.missiles,1);assert(system.arsenal.ready.laser);assert(!system.arsenal.ready.accelerator);
 const reload=migrateWorld(structuredClone(world));advance(reload,system.arsenal.chargeQueue[0].end);const ready=reload.megastructures.systems[megaKey(p)].arsenal;
 assert(ready.ready.accelerator);assert.equal(ready.missiles,1);assert.equal(ready.fuel,12);assert.equal(ready.chargeQueue.length,0);
});

test('all stellar weapons strike distant NPC capitals once, ignore defenses and preserve personal homeworlds',()=>{
 const {world,player,p,system,action}=arsenalFixture();for(const id of ['laser','missile','accelerator'])system.structures[id]={level:1};
 system.arsenal={fuel:0,missiles:1,ready:{laser:true,accelerator:true},chargeQueue:[],production:{}};
 const other=createPlayer(world,'测试_受保护的个人账号',world.at,()=>.5),protectedHome=world.planets[other.home],stock=structuredClone(system.arsenal);
 assert.throws(()=>action({mode:'fire',id:'laser',target:protectedHome.id,requestId:'test-protected'}),/个人账号母星/);assert.deepEqual(system.arsenal,stock);
 assert.throws(()=>act(world,other,{type:'arsenal',planet:p.id,mode:'fire',id:'laser',target:p.id,requestId:'test-unauthorized'},world.at),/无法操作/);
 const targets=Object.values(world.players).filter(x=>x.bot&&majorIds.includes(x.commander?.factionId)&&Object.values(world.planets).filter(p=>p.owner===x.id&&!p.moon).length>1).slice(0,3).map(x=>world.planets[x.home]);assert.equal(targets.length,3);
 const original=targets.map(x=>({id:x.id,position:[...x.position],owner:x.owner}));
 for(const [i,id]of ['laser','missile','accelerator'].entries()){
  targets[i].ships={Reaper:1000};targets[i].defense={Interceptor_Missile:100000,Large_Shield_Dome:1};assert.equal(strategicTargetReason(world,player,targets[i]),'');
  const a={mode:'fire',id,target:targets[i].id,requestId:'test-strike-'+id};action(a);action(a);assert.throws(()=>action({...a,target:targets[(i+1)%3].id}),/其他目标/);
 }
 assert.equal(world.arsenal.strikes.length,3);assert.equal(world.missions.filter(m=>m.owner===player.id).length,0);assert.equal(system.arsenal.missiles,0);
 for(const shot of world.arsenal.strikes){const t=(shot.end-shot.start)/1000;assert(t>=(shot.kind==='missile'?600:300)&&t<=(shot.kind==='missile'?1800:900));}
 system.structures.dyson.level=0;advance(world,Math.max(...world.arsenal.strikes.map(x=>x.end)));
 for(const [i,target]of targets.entries()){assert.equal(world.planets[target.id],target);assert.deepEqual(target.position,original[i].position);assert.equal(target.owner,null);assert.deepEqual(target.ships,{});assert.deepEqual(target.resources,[0,0,0]);assert(target.devastation);assert.notEqual(world.players[original[i].owner].home,target.id);}
 assert(world.arsenal.strikes.every(x=>x.status==='hit'));assert.equal(protectedHome.owner,other.id);
 const after=migrateWorld(structuredClone(world));advance(after,after.at+2*86400000);for(const target of targets){assert.deepEqual(after.planets[target.id].resources,[0,0,0]);assert.equal(after.planets[target.id].owner,null);}
 assert.equal(after.arsenal.strikes.length,3);assert.equal(player.reports.filter(r=>r.title==='恒星武库 · 命中确认').length,3);
});

test('interrupted arsenal work resumes its paid remaining duration and preserves the shared channel order',()=>{
 const {world,system,action}=arsenalFixture();for(const id of Object.keys(arsenalFacilities))system.structures[id]={level:1};
 action({mode:'produce',id:'fuel'});action({mode:'charge',id:'laser'});action({mode:'charge',id:'accelerator'});
 advance(world,T+3600000);system.structures.dyson.level=3;
 advance(world,T+13*3600000);
 assert.equal(system.arsenal.fuel,0);assert(!system.arsenal.ready.laser);assert(!system.arsenal.ready.accelerator);
 assert.equal(system.arsenal.production.fuel.pausedAt,T+3600000);assert.equal(system.arsenal.chargeQueue[0].pausedAt,T+3600000);
 system.structures.dyson.level=5;advance(world,world.at);
 assert.equal(system.arsenal.chargeQueue[0].end,T+16*3600000);assert.equal(system.arsenal.chargeQueue[1].start,T+16*3600000);assert.equal(system.arsenal.chargeQueue[1].end,T+22*3600000);
 assert.equal(system.arsenal.production.fuel.end,T+36*3600000);
 advance(world,T+36*3600000);assert.equal(system.arsenal.fuel,24);assert(system.arsenal.ready.laser);assert(system.arsenal.ready.accelerator);
});

test('a stellar hit terminates active combat and NPC camps never respawn or accept an already inbound colony',()=>{
 const {world,player,p}=arsenalFixture(),target=Object.values(world.planets).find(q=>q.npc&&!q.moon),position=[...target.position];
 const b=createSpatialBattle({id:'test-stellar-battle',target:target.id,attacker:player.id,defender:null,start:world.at});
 addSpatialFleet(b,{fleet:{Light_Fighter:2},owner:player.id,mission:'test-stellar-engaged',side:'attacker'},units);
 addSpatialFleet(b,{fleet:{Reaper:1},owner:null,side:'defender'},units);world.battles??={};world.battles[b.id]=b;
 const generation=b.eventSeq;
 world.missions.push({id:'test-stellar-engaged',owner:player.id,from:p.id,target:target.id,position,phase:'engaged',task:'attack',ships:{Light_Fighter:2},cargo:[0,0,0],battleId:b.id});
 world.missions.push({id:'test-inbound-colony',owner:player.id,from:p.id,target:null,position,phase:'outbound',task:'colonize',ships:{Colony_Ship:1},cargo:[10,20,30],start:T,end:T+1000,travel:1000});
 devastateWorld(world,target,{id:'test-camp-hit',kind:'laser',owner:player.id,end:T});
 assert.equal(b.status,'finished');assert.equal(b.settled,true);assert.equal(b.eventSeq,generation+1);assert(b.ships.every(s=>s.hp===0&&s.shield===0));assert.equal(b.events.at(-1).reason,'stellar-strike');
 assert(!world.missions.some(m=>m.id==='test-stellar-engaged'));
 advance(world,T+1000);const colony=world.missions.find(m=>m.id==='test-inbound-colony');assert.equal(colony.phase,'return');assert.deepEqual(colony.cargo,[10,20,30]);assert.equal(colony.ships.Colony_Ship,1);
 const reload=migrateWorld(structuredClone(world));advance(reload,T+2*86400000);ensureSystemNpcs(reload,...position.slice(0,2));
 const dead=reload.planets[target.id];assert(dead.devastation);assert.equal(dead.npc,false);assert.equal(dead.owner,null);assert.deepEqual(dead.ships,{});assert.deepEqual(dead.defense,{});assert.deepEqual(dead.resources,[0,0,0]);assert.deepEqual(dead.position,position);
 const marker=starMap(reload).planets.find(q=>q.id===target.id);assert.equal(marker.devastation.kind,'laser');assert.equal(marker.npc,false);
});

test('permanent devastation preserves unrelated network stock, moons and identities; active fleets die and later arrivals reroute',()=>{
 const {world,player,p,system}=arsenalFixture(),victim=Object.values(world.players).find(x=>x.bot&&x.commander?.id==='stargazer'),target=world.planets[victim.home];
 target.resources=[1e9,2e9,3e9];const next=testMegaColony(world,target,'test-surviving-base',target.position[1]);next.position[2]=14;next.resources=[4e9,5e9,6e9];
 const moon={...structuredClone(target),id:'test-doomed-moon',moon:true,parent:target.id,resources:[4,5,6]};world.planets[moon.id]=moon;
 const mega=enableMegastructures(world,target,{gate:1,shipyard:3,extractor:3});mega.shipQueue=[{queueId:'paid',planet:target.id,id:'Interceptor',count:1,remaining:1,start:world.at,end:world.at+1000,each:1}];
 const allStock=availableResources(world,target),keep=[...next.resources];
 const mission=(id,overrides)=>({id,owner:victim.id,from:target.id,target:p.id,position:[...p.position],task:'transport',ships:{Small_Cargo:1},cargo:[11,22,33],phase:'outbound',start:world.at,end:world.at+1000,travel:1000,...overrides});
 world.missions.push(mission('test-left',{}),mission('test-inbound',{owner:player.id,from:p.id,target:target.id,position:[...target.position]}),mission('test-present',{owner:player.id,from:p.id,target:target.id,phase:'waiting',end:world.at+5000}));
 const strike={id:'test-devastation',kind:'accelerator',end:world.at,owner:player.id};devastateWorld(world,target,strike);
 assert.deepEqual(next.resources,keep);assert.deepEqual(availableResources(world,next),keep);assert.deepEqual(allStock.map((n,i)=>n-keep[i]),[1e9+4,2e9+5,3e9+6]);
 assert(moon.devastation);assert.equal(moon.parent,target.id);assert.equal(victim.home,next.id);assert.equal(mega.host,next.id);assert.equal(mega.shipQueue[0].planet,next.id);
 assert(!world.missions.some(m=>m.id==='test-present'));assert(world.missions.some(m=>m.id==='test-left'));
 advance(world,world.at+1000);assert.equal(world.missions.find(m=>m.id==='test-inbound').phase,'return');assert.equal(next.ships.Interceptor,1);
 advance(world,world.at+1000);assert.equal(world.missions.find(m=>m.id==='test-left').from,next.id);advance(world,world.at+1000);assert(!world.missions.some(m=>m.id==='test-left'));
 assert.equal(next.ships.Small_Cargo,1);p.ships.Colony_Ship=1;
 assert.throws(()=>act(world,player,{type:'dispatch',planet:p.id,task:'colonize',ships:{Colony_Ship:1},position:target.position,target:target.id},world.at),/死寂行星/);
 const before=structuredClone(target);ensureSystemNpcs(world,...target.position.slice(0,2));assert.deepEqual(target,before);
 devastateWorld(world,next,{...strike,id:'test-extinction',end:world.at});assert.equal(victim.defeatedAt,world.at);assert(world.players[victim.id]);assert.equal(mega.structures.gate.level,1);
 const remnant=publicMegastructures(world).systems.find(s=>s.key===megaKey({...target,owner:victim.id}));assert(remnant.dormant);assert.equal(remnant.structures.shipyard.level,3);assert.equal(remnant.shipyard.powered,false);
});

function enableMegastructures(world,p,levels={}){
 migrateMegastructures(world);world.logisticsCenters??={};world.logisticsCenters[logisticsKey(p)]={owner:p.owner,position:p.position.slice(0,2),level:1,queue:null};
 return world.megastructures.systems[megaKey(p)]={owner:p.owner,position:p.position.slice(0,2),host:p.id,structures:Object.fromEntries(Object.entries(levels).map(([id,level])=>[id,{level,queue:null}])),shipQueue:[]};
}
function testMegaColony(world,p,id,system){const q={...structuredClone(p),id,name:'测试_巨构殖民地',position:[1,system,7],resources:[0,0,0],ships:{},shipQueue:[],flagshipQueue:[],defenseQueue:[]};world.planets[id]=q;return q;}


// Construct the actual pre-grand-power schema, rather than deleting one marker
// from a fully populated modern galaxy.
function beforeGrandPowers(world){
 for(const [id,p]of Object.entries(world.planets))if(id.startsWith('nation:starbay:')||id.startsWith('grand:')||/^commander:(zenith|obsidian):/.test(id)){
  if(!id.startsWith('grand:frontier:'))delete world.sovereignty.claims[p.position.slice(0,2).join(':')];delete world.planets[id];
 }
 for(const id of Object.keys(world.players))if(id==='nation:starbay'||/^commander:(zenith|obsidian):/.test(id))delete world.players[id];
 if(world.strategic)for(const [id,m]of Object.entries(world.strategic.mines))if(!world.planets[m.planet])delete world.strategic.mines[id];
 delete world.grandPowers;delete world.galacticEconomy;delete world.factionWars;delete world.minorNations;
 world.sovereignty.safeSystems=nearestSystems(world.sovereignty.anchor);
}

// Ordinary combat fixtures now use a non-capital colony in an actual shared frontier.
function testBorderColony(world,owner){
 const system=world.planets[world.factionWars.outposts[0]].position[1];ensureSystemNpcs(world,1,system);
 const slot=Array.from({length:15},(_,i)=>i+1).find(n=>!Object.values(world.planets).some(p=>!p.moon&&p.position.join(':')===`1:${system}:${n}`));
 const p={...structuredClone(world.planets[owner.home]),id:'test-border:'+owner.id,name:'测试_边境目标',position:[1,system,slot]};world.planets[p.id]=p;return p;
}

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
 assert.equal(productionQueueKey(units.Rocket_Launcher),'defenseQueue');assert.equal(productionQueueKey(units.Iron_Behemoth),'megaShipQueue');assert.equal(productionQueue(p,units.Rocket_Launcher),p.defenseQueue);
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
 const enemy=createPlayer(world,'测试_P0目标',world.at,()=>.47),target=testBorderColony(world,enemy);target.ships={};target.defense={};target.resources=[1000,1000,1000];target.debris=[600,400,0];
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


test('strategic migration only adds territory and resource metadata; original accounts, worlds, queues and flights survive',()=>{
 const {world,player,p}=fixture();beforeGrandPowers(world);
 for(const [id,planet]of Object.entries(world.planets))if(id.startsWith('diplomacy:')){delete world.sovereignty.claims[planet.position.slice(0,2).join(':')];delete world.planets[id];}
 delete world.strategic;for(const person of Object.values(world.players)){delete person.strategicResources;delete person.cityState;}
 p.ships={Interceptor:7,Destroyer:11};p.shipQueue=[{queueId:'legacy-paid',id:'Interceptor',count:2,remaining:2,start:T,end:T+60000,each:60}];
 player.reports=[{id:'kept-report',type:'system',body:'测试历史'}];
 world.missions=[{id:'preserved-flight',owner:player.id,from:p.id,position:[1,world.sovereignty.safeSystems[0],15],task:'colonize',phase:'outbound',end:T+600000,ships:{Colony_Ship:1},cargo:[33,22,11]}];
 const worlds=structuredClone(world.planets),people=structuredClone(world.players),flights=structuredClone(world.missions),claims=structuredClone(world.sovereignty.claims);
 const factory=(owner,name,position,extra)=>({...structuredClone(p),owner,name,position,...extra,shipQueue:[],defenseQueue:[]});
 migrateDiplomacy(world,factory);
 for(const [id,planet]of Object.entries(worlds))assert.deepEqual(world.planets[id],planet);
 for(const [id,person]of Object.entries(people)){const {strategicResources,cityState,...after}=world.players[id];assert.deepEqual(after,person);}
 assert.deepEqual(world.missions,flights);for(const [id,claim]of Object.entries(claims))assert.deepEqual(world.sovereignty.claims[id],claim);
 for(const region of ['iron','dawn'])assert.equal(Object.values(world.sovereignty.claims).filter(c=>c.owner==='faction:'+region).length,20);
 for(const [id,planet]of Object.entries(world.planets))if(id.startsWith('diplomacy:'))assert(!world.sovereignty.safeSystems.includes(planet.position[1]));
 const once=structuredClone(world);migrateDiplomacy(world,factory);assert.deepEqual(world,once);
 advance(world,T+120000);assert.equal(p.ships.Interceptor,9);assert.equal(player.strategicResources.resonance,0,'Paid legacy orders do not acquire a new material debt');
 const older=createWorld(Date.now()-86400000);createPlayer(older,'测试_离线旧档');beforeGrandPowers(older);delete older.strategic;
 migrateWorld(older);advance(older,older.strategic.createdAt);
 assert(Object.values(older.players).every(p=>Object.values(p.strategicResources).every(n=>n===0)),'New strategic mines do not accrue production before their migration date');
});

test('six advanced recipes debit once, refuse short materials without base-resource loss, and leave Destroyer unchanged',()=>{
 assert.equal(units.Destroyer.strategic,undefined);assert.equal(Object.values(units).filter(u=>u.strategic).length,6);
 for(const [key,r]of Object.entries(strategicResources)){
  const {world,player,p,build}=fixture(),item=units[r.ship];enableMegastructures(world,p,{shipyard:1,extractor:1});
  const before=[...p.resources];assert.throws(()=>build(r.ship),new RegExp(r.name));assert.deepEqual(p.resources,before);
  player.strategicResources[key]=r.amount*2;const data=createData(publicCatalog,{...p,megaShipyard:megaProductionState(world,p,units)},player);assert.equal(shipCapacity(item,data),2);assert.equal(shipBlockReason(item,3,data,false),r.name+'不足');
  build(r.ship,2);assert.equal(player.strategicResources[key],0);assert.deepEqual(p.resources,before.map((n,i)=>n-item.cost[i]*2));
  const q=world.megastructures.systems[megaKey(p)].shipQueue[0];advance(world,q.end+q.each*1000);assert.equal(p.ships[r.ship],2);assert.equal(player.strategicResources[key],0);
 }
 const {p,build}=fixture();build('Destroyer');assert.equal(p.shipQueue[0].id,'Destroyer');
});

test('fixed constellation mines charge their owner, accumulate offline once, and do not generate outside deposits',()=>{
 const {world,player,p}=fixture(),d=world.strategic.deposits.find(d=>!world.sovereignty.claims[d.position.slice(0,2).join(':')]);
 const colony=structuredClone(p);colony.id='test-strategic-colony';colony.position=[...d.position];world.planets[colony.id]=colony;
 const before=[...colony.resources];act(world,player,{type:'strategicMine',planet:colony.id},T);
 assert.deepEqual(colony.resources,before.map((n,i)=>n-strategicRules.mineCost[i]));
 assert.throws(()=>act(world,player,{type:'strategicMine',planet:colony.id},T),/已在开采/);
 const foreign=Object.values(world.planets).find(q=>q.owner&&q.owner!==player.id);assert.throws(()=>act(world,player,{type:'strategicMine',planet:foreign.id},T),/无法操作/);
 assert.throws(()=>act(world,player,{type:'strategicMine',planet:p.id},T),/战略矿藏/);
 advance(world,T+2*3600000);assert.equal(player.strategicResources[d.resource],12);
 const restored=JSON.parse(JSON.stringify(world));migrateWorld(restored);advance(restored,restored.at);assert.equal(restored.players[player.id].strategicResources[d.resource],12);
 assert.deepEqual(restored.strategic.deposits,world.strategic.deposits);
 for(const key of strategicKeys)assert(new Set(world.strategic.deposits.filter(d=>d.resource===key).map(d=>d.constellation)).size>=2);
 for(const dep of world.strategic.deposits)assert.equal(resourceLocation(world,dep.position).constellation.resource,dep.resource);
 for(const dep of world.strategic.deposits){ensureSystemNpcs(world,...dep.position.slice(0,2));assert(!Object.values(world.planets).some(p=>p.npc&&p.position.join(':')===dep.position.join(':')),'A future NPC spawn cannot occupy a strategic mine');}
 player.strategicResources[d.resource]=300;advance(world,T+3*3600000);assert.equal(player.strategicResources[d.resource],300,'Over-cap trade stock is not deleted by production');
});

test('bilateral talks counteroffer, settle conserved inventories once and reject stale, foreign, or invalid requests',()=>{
 const {world,player,p}=fixture();advance(world,T+4*3600000);const now=world.at;
 const partner=Object.values(world.players).find(x=>x.commander?.id==='stargazer'),other=world.planets[partner.home],index=3;
 const give=Array(9).fill(0),take=Array(9).fill(0);give[0]=1;take[index]=2;
 const proposal={type:'trade',mode:'propose',planet:p.id,partner:partner.id,give,take};
 const before=[...p.resources];act(world,player,proposal,now);assert(player.tradeOffer.counter);assert.deepEqual(p.resources,before);
 const quote=structuredClone(player.tradeOffer),metal=p.resources[0]+other.resources[0],material=player.strategicResources.resonance+partner.strategicResources.resonance;
 const confirm={type:'trade',mode:'accept',planet:p.id,offer:quote.id};
 assert.throws(()=>act(world,player,{...confirm,planet:other.id},now),/无法操作/);
 act(world,player,confirm,now);assert.equal(p.resources[0]+other.resources[0],metal);assert.equal(player.strategicResources.resonance+partner.strategicResources.resonance,material);assert.equal(player.strategicResources.resonance,2);
 assert.equal(p.resources[0],before[0]-quote.give[0]);assert.equal(player.tradeRelations[partner.id].trust,1);assert.match(player.reports[0].title,/完成交易/);
 assert.throws(()=>act(world,player,confirm,now),/失效/);
 assert.throws(()=>act(world,player,{...proposal,give:[-1,...give.slice(1)]},now),/数量/);
 assert.throws(()=>act(world,player,{...proposal,give:[1.5,...give.slice(1)]},now),/数量/);
 assert.throws(()=>act(world,player,{...proposal,take:give},now),/不同资源/);
 act(world,player,proposal,now);const stale=player.tradeOffer.id;partner.strategicResources.resonance=0;const funds=[...p.resources];
 assert.throws(()=>act(world,player,{...confirm,offer:stale},now),/库存已变化/);assert.deepEqual(p.resources,funds);
 partner.strategicResources.resonance=24;act(world,player,proposal,now);const expired=player.tradeOffer.id;assert.throws(()=>act(world,player,{...confirm,offer:expired},now+300001),/失效/);
 recordHostility(world,player,other,world.at);assert.throws(()=>act(world,player,proposal,world.at),/停止贸易/);
 const state=diplomacySnapshot(world,player),eileen=state.partners.find(x=>x.id===partner.id);assert.equal(eileen.kind,'城邦');assert.equal(eileen.name,'观星庭');assert.equal(polity(world,partner.id).id,partner.id);
});

test('NPC native workshops spend real materials on local defenders without any automatic offensive missions',()=>{
 const {world}=fixture(),partner=Object.values(world.players).find(x=>x.commander?.id==='stargazer'),home=world.planets[partner.home];
 home.resources=[1e8,1e8,1e8];const before=home.ships.Interceptor||0;
 const system=world.megastructures.systems[megaKey(home)];assert.equal(system.inheritedNativeIndustry.source,'strategic-native-workshop');assert.deepEqual(systemMegaRate(world,home),[0,0,0]);
 const oldSeconds=Math.max(2,Math.ceil((units.Interceptor.cost[0]+units.Interceptor.cost[1])*1.44/(((home.buildings.Shipyard||0)+1)*2**(home.buildings.Nanite_Factory||0)*90)));
 advance(world,T+6*3600000);assert.equal(partner.strategicResources.resonance,36-4);assert.equal(system.shipQueue[0].id,'Interceptor');assert.equal(system.shipQueue[0].each,oldSeconds);
 const q=system.shipQueue[0];advance(world,q.end);assert.equal(home.ships.Interceptor,before+1);
 advance(world,T+24*3600000);assert.equal(world.missions.filter(m=>world.players[m.owner]?.bot).length,0);
});

const marketOrder=(w,owner)=>w.market.orders.filter(o=>o.owner===owner).at(-1);
const marketRequest=(p,kind='trade')=>({type:'market',planet:p.id,mode:'publish',kind,give:[3000,0,0,0,0,0,0,0,0],take:[0,2000,0,0,0,0,0,0,0],feeIndex:0});

test('market escrow conserves property, charges only completed fees and blocks foreign, invalid and duplicate operations',()=>{
 const {world,player,p}=fixture(),buyer=createPlayer(world,'测试_商城买家',T,()=>.43),other=world.planets[buyer.home];other.resources=[100000,100000,100000];
 advance(world,T);const before=[...p.resources],bank=world.planets[world.players[world.market.operator].home],bankBefore=[...bank.resources],fees=[...world.market.fees];
 const request=marketRequest(p);act(world,player,request,T);const o=marketOrder(world,player.id);
 assert.deepEqual(p.resources,[before[0]-3090,before[1],before[2]]);assert.deepEqual(o.escrow,[3090,0,0,0,0,0,0,0,0]);assert.deepEqual(bank.resources,bankBefore);
 assert.throws(()=>act(world,buyer,{type:'market',planet:other.id,mode:'cancel',order:o.id},T),/自己/);
 assert.throws(()=>act(world,buyer,{type:'market',planet:p.id,mode:'fill',order:o.id},T),/无法操作/);
 assert.throws(()=>act(world,player,{type:'market',planet:p.id,mode:'fill',order:o.id},T),/自己/);
 const restored=JSON.parse(JSON.stringify(world));migrateWorld(restored);assert.deepEqual(restored.market.orders.find(x=>x.id===o.id).escrow,o.escrow);
 const conserved=()=>Object.values(world.planets).reduce((s,p)=>s+p.resources[0],0)+world.market.orders.reduce((s,o)=>s+o.escrow[0],0)+world.galacticEconomy.pool[0],metalBefore=conserved();
 const fill={type:'market',planet:other.id,mode:'fill',order:o.id};act(world,buyer,fill,T);
 assert.deepEqual(p.resources,[before[0]-3090,before[1]+2000,before[2]]);assert.deepEqual(other.resources,[103000,98000,100000]);
 assert.equal(bank.resources[0],bankBefore[0]);assert.equal(conserved(),metalBefore);assert.equal(world.market.fees[0],fees[0]+90);assert.equal(world.galacticEconomy.accounts[bank.owner].pending[0],.9);assert(Math.abs(Object.values(world.galacticEconomy.accounts).reduce((s,a)=>s+a.paid[0]+a.pending[0],0)-90)<1e-9);assert(o.escrow.every(n=>n===0));assert.equal(o.status,'completed');
 assert.throws(()=>act(world,buyer,fill,T),/结束/);assert.equal(bank.resources[0],bankBefore[0]);assert.equal(conserved(),metalBefore);
 const stable=[...p.resources];
 for(const changes of [{give:[-1,0,0,0,0,0,0,0,0]},{take:[0,1,0,0,0,0,0,0,0]},{take:request.give},{feeIndex:9},{give:[3000.5,0,0,0,0,0,0,0,0]}])assert.throws(()=>act(world,player,{...request,...changes},T));
 assert.deepEqual(p.resources,stable);
 p.resources=[3000,0,0];assert.throws(()=>act(world,player,request,T),/手续费/);assert.deepEqual(p.resources,[3000,0,0]);
});

test('market strategic escrow, cancellation, expiry and one-time migration preserve stocks and existing player progress',()=>{
 const {world,player,p}=fixture();advance(world,T);player.strategicResources.resonance=10;
 const request={...marketRequest(p),give:[0,0,0,4,0,0,0,0,0],take:[48000,0,0,0,0,0,0,0,0],feeIndex:3};
 assert.equal(marketFee(request.give,3),1);act(world,player,request,T);let o=marketOrder(world,player.id);assert.equal(player.strategicResources.resonance,5);
 act(world,player,{type:'market',planet:p.id,mode:'cancel',order:o.id},T);assert.equal(player.strategicResources.resonance,10);
 act(world,player,request,T);o=marketOrder(world,player.id);const expire=o.expires;
 advance(world,expire);assert.equal(o.status,'expired');assert.equal(player.strategicResources.resonance,10);
 const stable=structuredClone({player,planet:p}),guard=structuredClone(world.planets[world.players[world.market.operator].home]);
 delete world.market;migrateMarket(world);assert.deepEqual({player,planet:p},stable);assert.equal(world.planets[guard.id].ships.Battleship,guard.ships.Battleship+240);const migratedGuard=structuredClone(world.planets[guard.id]);migrateMarket(world);assert.deepEqual(world.planets[guard.id],migratedGuard);
 const saved=JSON.parse(JSON.stringify(world));migrateWorld(saved);advance(saved,expire);assert.equal(saved.players[player.id].strategicResources.resonance,10);
 assert.equal(world.missions.filter(m=>world.players[m.owner]?.bot).length,0);
});

test('supply contracts reserve the reward, protect accepted work, deliver once and expire with a full refund',()=>{
 const {world,player,p}=fixture(),worker=createPlayer(world,'测试_物资承包人',T,()=>.41),q=world.planets[worker.home],outsider=createPlayer(world,'测试_无关承包人',T,()=>.63);q.resources=[0,2000,0];
 const request=marketRequest(p,'supply');act(world,player,request,T);const o=marketOrder(world,player.id),accept={type:'market',planet:q.id,mode:'accept',order:o.id};
 act(world,worker,accept,T);assert.equal(o.status,'accepted');assert.equal(o.deadline,T+24*3600000);
 assert.throws(()=>act(world,outsider,{...accept,planet:outsider.home},T),/接取/);
 assert.throws(()=>act(world,player,{type:'market',planet:p.id,mode:'cancel',order:o.id},T),/尚未/);
 assert.throws(()=>act(world,outsider,{...accept,planet:outsider.home,mode:'deliver'},T),/先接取/);
 act(world,worker,{...accept,mode:'release'},T);assert.equal(o.status,'open');act(world,worker,accept,T);
 act(world,worker,{...accept,mode:'deliver'},T);assert.equal(o.status,'completed');assert.deepEqual(q.resources,[3000,0,0]);
 const before=[...p.resources];act(world,player,request,T);const later=marketOrder(world,player.id);act(world,worker,{...accept,order:later.id},T);
 advance(world,later.deadline);assert.equal(later.status,'expired');assert.deepEqual(p.resources,before);assert(later.escrow.every(n=>n===0));
});

test('war commissions use new real victories with enough defender losses; old, trial, friendly and duplicate battles do not pay',()=>{
 const {world,player,p}=fixture(),worker=createPlayer(world,'测试_战争承包人',T,()=>.44),q=world.planets[worker.home],enemy=createPlayer(world,'测试_战争目标',T,()=>.69),target=testBorderColony(world,enemy);
 target.ships={Light_Fighter:2};target.defense={};q.resources=[1e8,1e8,1e8];q.ships={Battleship:8};worker.tech={Computer_Tech:10,Combustion_Drive:10,Hyperspace_Drive:10,Weapons_Tech:10,Shielding_Tech:10,Strength_Tech:10};
 const request={type:'market',planet:p.id,mode:'publish',kind:'war',give:[1000,0,0,0,0,0,0,0,0],target:target.id};
 act(world,player,request,T);const o=marketOrder(world,player.id);assert.equal(o.minDamage,2250);
 assert.throws(()=>act(world,enemy,{type:'market',planet:target.id,mode:'accept',order:o.id},T),/本方/);
 act(world,worker,{type:'market',planet:q.id,mode:'accept',order:o.id},T);
 const synthetic={id:'not-a-real-submission',target:target.id,attacker:worker.id,start:T-1,winner:'attacker'},losses={defender:{Light_Fighter:2}};
 settleWarOrders(world,synthetic,losses,T);assert.equal(o.status,'accepted');
 settleWarOrders(world,{...synthetic,start:T,trial:true},losses,T);assert.equal(o.status,'accepted');
 settleWarOrders(world,{...synthetic,start:T,winner:'defender'},losses,T);assert.equal(o.status,'accepted');
 settleWarOrders(world,{...synthetic,start:T},{defender:{}},T);assert.equal(o.status,'accepted');
 act(world,worker,{type:'dispatch',planet:q.id,task:'attack',target:target.id,position:target.position,ships:{Battleship:8},cargo:[0,0,0]},T);
 const mission=world.missions.find(m=>m.owner===worker.id),arrival=mission.end,metalAfterFuel=q.resources[0];advance(world,arrival+600000);
 assert.equal(o.status,'completed');assert(o.battleId);const combat=worker.reports.find(r=>r.type==='battle'&&r.battleId===o.battleId),returnedLoot=combat.deliveries.filter(d=>d.status==='delivered').reduce((n,d)=>n+d.cargo[0],0);assert.equal(q.resources[0],metalAfterFuel+1000+returnedLoot);assert(worker.reports.some(r=>r.title==='战争委托赏金已交割'));
 const balance=q.resources[0];settleWarOrders(world,world.battles[o.battleId],losses,world.at);assert.equal(q.resources[0],balance);
 assert.equal(world.missions.filter(m=>world.players[m.owner]?.bot).length,0);
});

test('NPC market stock is funded by escrow and fair player listings have a solvent buyer without spawning resources or attack missions',()=>{
 const {world,player,p}=fixture();advance(world,T);const m=marketSnapshot(world,player);
 assert(m.orders.some(o=>o.kind==='trade'));assert(m.orders.some(o=>o.kind==='supply'));assert(m.orders.some(o=>o.kind==='war'));
 assert(m.orders.filter(o=>o.status==='open').every(o=>o.escrow.some(n=>n>0)));
 const before=p.resources[0];act(world,player,{...marketRequest(p),give:[10000,0,0,0,0,0,0,0,0],take:[0,5000,0,0,0,0,0,0,0]},T);
 const o=marketOrder(world,player.id);assert.equal(o.status,'open');advance(world,world.market.nextRefresh);assert.equal(o.status,'completed');assert.equal(p.resources[0],before-10300);
 assert(world.players[o.taker].bot);assert.equal(world.missions.filter(m=>world.players[m.owner]?.bot).length,0);
 assert.deepEqual(m.values,marketValues);
});

test('four major powers fill the non-reserved galaxy once, preserve human and small-polity progress, and have legal overwhelming industry and technology',()=>{
 const {world,player,p}=fixture();beforeGrandPowers(world);p.ships={Dreadnought:2000};
 const outside=Object.values(territoryPlan.regions).flat().find(s=>!world.sovereignty.claims['1:'+s]);
 world.missions.push({id:'preserved-colonizer',owner:player.id,from:p.id,task:'colonize',phase:'outbound',position:[1,outside,15],ships:{Colony_Ship:1},cargo:[12,34,56],start:T,end:T+100000});
 const protectedIds=Object.values(world.players).filter(x=>!majorIds.includes(x.commander?.factionId)).map(x=>x.id);
 const people=structuredClone(Object.fromEntries(protectedIds.map(id=>[id,world.players[id]]))),planets=structuredClone(Object.fromEntries(Object.entries(world.planets).filter(([,p])=>protectedIds.includes(p.owner)))),missions=structuredClone(world.missions);
 migrateWorld(world);
 for(const [id,value]of Object.entries(people))assert.deepEqual(world.players[id],value);
 for(const [id,value]of Object.entries(planets))assert.deepEqual(world.planets[id],value);
 assert.deepEqual(world.missions,missions);assert(world.grandPowers.reserve.includes(outside));assert(!world.sovereignty.claims['1:'+outside]);
 for(let s=1;s<=499;s++)if(!world.grandPowers.reserve.includes(s))assert(world.sovereignty.claims['1:'+s]);
 assert.equal(world.grandPowers.regions.length,4);
 for(const person of Object.values(world.players).filter(x=>majorIds.includes(x.commander?.factionId))){
  const colonies=Object.values(world.planets).filter(p=>p.owner===person.id&&!p.moon);assert(colonies.length<=colonyLimit(person));assert(person.tech.Astrophysics_Tech>=60);
  for(const [id,t]of Object.entries(tech))if(t.playerOnly)assert.equal(person.tech[id]||0,0);else if(t.maxLevel)assert.equal(person.tech[id],t.maxLevel);
  for(const colony of colonies){assert(fleetPower(colony.ships,person.tech)>=world.grandPowers.baselinePower*(colony.id===person.home&&person.commander.title==='大将军'?1000:100));assert(usedBuildingFields(colony)<=colony.fields+5*(colony.buildings.Terraformer||0));assert(!plannedNpcs(world,...colony.position.slice(0,2)).some(n=>n.slot===colony.position[2]));}
 }
 const once=structuredClone(world);migrateWorld(world);assert.deepEqual(world,once);
});

test('equity reserves exactly one percent, conserves every fee material and fractional rights, and rewards peaceful growth without stock or alliance double counting',()=>{
 const {world,player,p}=fixture(),guild=world.market.operator;
 const share=()=>equityMembers(world).find(x=>x.id===player.id).share,initial=share();
 p.resources=[1e12,1e12,1e12];assert.equal(share(),initial);
 p.buildings.Metal_Mine+=100;assert(share()>initial);const built=share();player.tech.Energy_Tech+=100;assert(share()>built);
 const ally=createPlayer(world,'测试_分红盟友',T,()=>.7);world.alliances.push({id:'test-equity-alliance',name:'测试建设联盟'});player.alliance=ally.alliance='test-equity-alliance';
 const rows=equityMembers(world);assert.equal(rows.find(x=>x.id===guild).share,.01);assert(Math.abs(rows.reduce((s,x)=>s+x.share,0)-1)<1e-12);
 const holdings=()=>Object.values(world.planets).reduce((s,q)=>s+q.resources[0],0),before=holdings(),credited={};
 const credit=(w,q,v)=>{q.resources[0]+=v[0];credited[q.owner]??=Array(9).fill(0);v.forEach((n,i)=>credited[q.owner][i]+=n);};
 const fee=[101,3,11,1,2,3,4,5,6];distributeFees(world,fee,credit);distributeFees(world,fee,credit);
 for(let i=0;i<9;i++){
  const paid=Object.values(credited).reduce((s,v)=>s+v[i],0),pending=Object.values(world.galacticEconomy.accounts).reduce((s,a)=>s+a.pending[i],0);
  assert.equal(paid+world.galacticEconomy.pool[i],fee[i]*2);assert(Math.abs(pending-world.galacticEconomy.pool[i])<1e-9);
  const bank=world.galacticEconomy.accounts[guild];assert(Math.abs(bank.paid[i]+bank.pending[i]-fee[i]*.02)<1e-9);
 }
 assert.equal(holdings()-before+world.galacticEconomy.pool[0],202);
 const stable=JSON.parse(JSON.stringify(world));migrateWorld(stable);assert.deepEqual(stable.galacticEconomy,world.galacticEconomy);
});

test('faction wars spend real fleets and fuel only in shared border systems, never transfer ownership, and leave salvage without replaying settlement',()=>{
 const {world,player,p}=fixture();
 for(const q of Object.values(world.planets))if(['dawn','zenith','obsidian'].includes(world.players[q.owner]?.commander?.factionId)){q.ships={Light_Fighter:1};q.defense={};}
 const humans=structuredClone({player,p}),small=structuredClone(Object.fromEntries(Object.entries(world.planets).filter(([,q])=>q.owner&&!majorIds.includes(world.players[q.owner]?.commander?.factionId))));
 const before=structuredClone(world),war=startFactionWar(world,T);assert(war);assert.equal(war.status,'active');assert.equal(war.result.winner,'attacker');
 assert(!world.grandPowers.reserve.includes(war.position[1]));assert.notEqual(war.defender,player.id);assert(!Object.values(world.players).some(p=>p.home===war.target));
 const source=world.planets[war.from],target=world.planets[war.target];assert.equal(source.resources[2],before.planets[source.id].resources[2]-war.fuel);
 for(const [id,n]of Object.entries(war.result.initial.attacker))assert.equal(source.ships[id],before.planets[source.id].ships[id]-n);
 assert(!war.frames&&!war.ships&&!war.projectiles);assert.equal(world.missions.length,0);
 const full=structuredClone(world);world.at=war.end;finishFactionWar(world,war);assert.equal(target.owner,war.defender);assert.equal(source.position[1],target.position[1]);assert(systemTerritory(world,target.position).warZone);assert.equal(war.conquered,false);assert.deepEqual(world.sovereignty,before.sovereignty);assert.deepEqual(world.strategic.mines,before.strategic.mines);assert.deepEqual(target.resources,before.planets[target.id].resources);assert.deepEqual(target.buildings,before.planets[target.id].buildings);
 assert.deepEqual(target.debris,before.planets[target.id].debris.map((n,i)=>n+war.result.debris[i]));assert(target.debris.some(n=>n>0));
 assert.deepEqual({player,p},humans);for(const [id,q]of Object.entries(small))assert.deepEqual(world.planets[id],q);
 const settled=structuredClone(world),replay=factionWarReplay(world,war);assert(replay.record.frames.length>0);assert(replay.record.metadata.length<=24*Object.keys(units).length);assert.deepEqual(replay.report.survivors,war.result.survivors);assert.deepEqual(world,settled);
 finishFactionWar(world,war);assert.deepEqual(world,settled);
 const restored=JSON.parse(JSON.stringify(full));migrateWorld(restored);advance(restored,war.end);assert.equal(restored.planets[target.id].owner,war.defender);assert.deepEqual(restored.planets[target.id].debris,target.debris);const debris=[...restored.planets[target.id].debris];advance(restored,war.end);assert.deepEqual(restored.planets[target.id].debris,debris);
 // Reuse the normal paid recycling mission; collected material leaves the
 // debris field and repeating the arrival tick cannot pay it twice.
 p.resources=[1e8,1e8,1e8];p.ships={Recycler:20};player.tech.Computer_Tech=10;
 act(world,player,{type:'dispatch',planet:p.id,task:'recycle',target:target.id,position:target.position,ships:{Recycler:10},cargo:[0,0,0]},war.end);
 const m=world.missions.find(m=>m.owner===player.id);advance(world,m.end);const collected=m.cargo.reduce((s,n)=>s+n,0);assert(collected>0);assert.equal(target.debris.reduce((s,n)=>s+n,0)+collected,debris.reduce((s,n)=>s+n,0));
 const arrival=m.end,balance=[...p.resources];advance(world,arrival);assert.equal(world.missions.filter(x=>x.id===m.id).length,0);assert.equal(p.resources[0],balance[0]+m.cargo[0]);const once=[...p.resources];advance(world,arrival);assert.deepEqual(p.resources,once);
});


test('border colonies share a system without changing original claims, exclude capitals and reserve, and reject protected attacks before spending',()=>{
 const {world,player,p}=fixture(),zones=world.factionWars.outposts.map(id=>world.planets[id]);assert(zones.length>0);
 const claims=structuredClone(world.sovereignty.claims);
 for(const outpost of zones){
  assert(!world.grandPowers.reserve.includes(outpost.position[1]));
  const local=Object.values(world.planets).filter(q=>!q.moon&&q.owner&&q.position[1]===outpost.position[1]);
  assert(local.length>=2);assert(!local.some(q=>world.players[q.owner].home===q.id));
  const t=systemTerritory(world,outpost.position);assert(t.warZone);assert.equal(t.systemOwner,null);assert(t.systemPolities.length>=2);
  assert.equal(attackRestriction(world,outpost),'');assert(canColonizeSystem(world,world.players[outpost.owner],outpost.position));
 }
 const outpost=zones[0],bot=world.players[outpost.owner],interior=Object.values(world.planets).find(q=>q.owner&&majorIds.includes(world.players[q.owner]?.commander?.factionId)&&q.owner!==bot.id&&q.id!==world.players[q.owner].home&&!world.grandPowers.reserve.includes(q.position[1])&&!systemTerritory(world,q.position).warZone&&!canColonizeSystem(world,bot,q.position));assert(interior);
 assert.equal(canColonizeSystem(world,bot,world.planets[player.home].position),false);
 const reserve=world.grandPowers.reserve.find(s=>!world.sovereignty.claims['1:'+s]);assert.equal(canColonizeSystem(world,bot,[1,reserve,15]),false);
 // Even an old AI claim inside the reserve grants no right to a new colony.
 world.sovereignty.claims['1:'+reserve]={owner:polity(world,bot.id).id,founder:bot.id,at:T};assert.equal(canColonizeSystem(world,bot,[1,reserve,15]),false);delete world.sovereignty.claims['1:'+reserve];
 ensureSystemNpcs(world,1,outpost.position[1]);const slot=Array.from({length:15},(_,i)=>i+1).find(n=>!Object.values(world.planets).some(q=>!q.moon&&q.position.join(':')===`1:${outpost.position[1]}:${n}`));
 const source=world.planets[bot.home];source.ships.Colony_Ship=1;source.resources=[1e8,1e8,1e8];
 act(world,bot,{type:'dispatch',planet:source.id,task:'colonize',position:[1,outpost.position[1],slot],ships:{Colony_Ship:1},cargo:[0,0,0]},T);
 const m=world.missions.find(m=>m.owner===bot.id);advance(world,m.end);assert.equal(Object.values(world.planets).find(q=>q.position.join(':')===m.position.join(':')).owner,bot.id);assert.deepEqual(world.sovereignty.claims,claims);
 p.resources=[1e8,1e8,1e8];p.ships={Battleship:1};p.defense.Interplanetary_Missile=3;player.tech.Computer_Tech=10;player.tech.Impulse_Drive=100;
 const capital=world.planets[bot.home],moon={...structuredClone(capital),id:'test-protected-moon',moon:true,parent:capital.id};world.planets[moon.id]=moon;
 for(const target of [capital,moon,interior]){
  const before=structuredClone({ships:p.ships,resources:p.resources,defense:p.defense,missions:world.missions});
  assert.throws(()=>act(world,player,{type:'dispatch',planet:p.id,task:'attack',target:target.id,position:target.position,ships:{Battleship:1}},world.at),/母星|交战区/);
  if(!target.moon){assert.throws(()=>act(world,player,{type:'missile',planet:p.id,target:target.id,count:1},world.at),/母星|交战区/);assert.throws(()=>act(world,player,{type:'market',planet:p.id,mode:'publish',kind:'war',target:target.id,give:[1000,0,0,0,0,0,0,0,0]},world.at),/母星|交战区/);}
  assert.deepEqual({ships:p.ships,resources:p.resources,defense:p.defense,missions:world.missions},before);
 }
 const npc=Object.values(world.planets).find(q=>q.npc);assert.equal(attackRestriction(world,npc),'');
 const stable=structuredClone(world);migrateWorld(world);assert.deepEqual(world,stable);
});

test('old unfinished conquest orders withdraw once and protected war bounties refund their whole escrow',()=>{
 const {world,player,p}=fixture();
 for(const id of world.factionWars.outposts){for(const [key,mine]of Object.entries(world.strategic.mines))if(mine.planet===id)delete world.strategic.mines[key];delete world.planets[id];}
 const source=Object.values(world.planets).find(q=>q.id.startsWith('grand:iron:')),target=Object.values(world.planets).find(q=>q.id.startsWith('grand:dawn:'));
 const before=structuredClone({source,target,claims:world.sovereignty.claims});
 source.ships.Battleship-=2;source.resources[2]-=100;target.ships.Battleship-=1;
 world.factionWars={version:1,next:T+1000,turn:0,battles:[{id:'old-invasion',status:'active',from:source.id,target:target.id,fuel:100,result:{initial:{attacker:{Battleship:2},defender:{Battleship:1}}}}]};
 migrateWorld(world);assert.deepEqual(world.planets[source.id],before.source);assert.deepEqual(world.planets[target.id],before.target);assert.deepEqual(world.sovereignty.claims,before.claims);assert.equal(world.factionWars.battles[0].status,'cancelled');
 const once=structuredClone(world);migrateWorld(world);assert.deepEqual(world,once);
 const amount=[1030,0,0,0,0,0,0,0,0],stock=p.resources[0];p.resources[0]-=1030;
 world.market.orders.push({id:'old-capital-bounty',owner:player.id,planet:p.id,kind:'war',target:world.players[target.owner].home,status:'accepted',taker:source.owner,expires:world.at+10000,deadline:world.at+10000,escrow:amount});
 advance(world,world.at);assert.equal(p.resources[0],stock);assert.equal(world.market.orders.find(o=>o.id==='old-capital-bounty').status,'cancelled');advance(world,world.at);assert.equal(p.resources[0],stock);
});

test('megastructure construction charges once, reserves one engineering line, refunds exactly and protects ownership',()=>{
 const {world,player,p}=fixture();p.resources=[1e10,1e10,1e10];
 for(const [id,level]of megaRequiredTech('dyson',2))player.tech[id]=level;
 const build=id=>act(world,player,{type:'megastructure',planet:p.id,id,mode:'build'},world.at);
 const stock=[...p.resources];assert.throws(()=>build('dyson'),/物流中心/);assert.deepEqual(p.resources,stock);
 enableMegastructures(world,p);build('dyson');
 const system=world.megastructures.systems[megaKey(p)],q=system.structures.dyson.queue;
 assert.deepEqual(p.resources,stock.map((n,i)=>n-megastructureCatalog.dyson.cost[i]));assert.equal(q.end-q.start,12*3600000);
 const paid=[...p.resources];assert.throws(()=>build('industry'),/正在建设/);assert.deepEqual(p.resources,paid);
 const other=createPlayer(world,'测试_巨构权限',T,()=>.7);
 assert.throws(()=>act(world,other,{type:'megastructure',planet:p.id,id:'dyson',mode:'cancel'},T),/无法操作/);
 act(world,player,{type:'megastructure',planet:p.id,id:'dyson',mode:'cancel'},T);assert.deepEqual(p.resources,stock);
 assert.throws(()=>act(world,player,{type:'megastructure',planet:p.id,id:'dyson',mode:'cancel'},T),/没有进行/);assert.deepEqual(p.resources,stock);
 build('dyson');advance(world,system.structures.dyson.queue.end);assert.equal(system.structures.dyson.level,1);
 const levelOne=economy(p,world).supply;build('dyson');assert.equal(system.structures.dyson.level,1);assert.equal(economy(p,world).supply,levelOne);
 assert.deepEqual(system.structures.dyson.queue.cost,megastructureCatalog.dyson.cost.map(n=>n*2));assert.equal(system.structures.dyson.queue.end-world.at,18*3600000);
 assert.deepEqual(megaQuote('dyson',2).cost,megastructureCatalog.dyson.cost.map(n=>n*4));assert.equal(megaQuote('dyson',2).seconds,24*3600);
 const colony=testMegaColony(world,p,'test-listener-second',(p.position[1]%499)+1);colony.resources=[1e9,1e9,1e9];enableMegastructures(world,colony);
 act(world,player,{type:'megastructure',planet:colony.id,id:'listener',mode:'build'},world.at);
 act(world,player,{type:'megastructure',planet:p.id,id:'dyson',mode:'cancel'},world.at);
 assert.throws(()=>build('listener'),/每个文明/);
});

test('stargates conserve shared storage and transfer only owned available fleets without fuel or cooldown',()=>{
 const {world,player,p}=fixture(),q=testMegaColony(world,p,'test-gate-other',(p.position[1]%499)+1);
 enableMegastructures(world,p,{gate:1});enableMegastructures(world,q,{gate:1});p.resources=[200,300,400];q.resources=[1000,2000,3000];
 assert.deepEqual(availableResources(world,p),[1200,2300,3400]);assert.deepEqual(availableResources(world,q),[1200,2300,3400]);
 p.ships={Cruiser:10};const move={type:'stargate',planet:p.id,target:q.id,ships:{Cruiser:3}},stock=availableResources(world,p);
 act(world,player,move,T);assert.equal(p.ships.Cruiser,7);assert.equal(q.ships.Cruiser,3);assert.deepEqual(availableResources(world,p),stock);assert.equal(world.missions.length,0);
 act(world,player,move,T);assert.equal(p.ships.Cruiser,4);assert.equal(q.ships.Cruiser,6);
 assert.throws(()=>act(world,player,{...move,ships:{Cruiser:5}},T),/数量/);assert.equal(q.ships.Cruiser,6);
 const other=createPlayer(world,'测试_星门权限',T,()=>.7),foreign=world.planets[other.home];enableMegastructures(world,foreign,{gate:1});foreign.resources=[7,8,9];
 assert.throws(()=>act(world,player,{...move,target:foreign.id},T),/本方/);assert.deepEqual(availableResources(world,p),stock);assert.deepEqual(availableResources(world,foreign),[7,8,9]);
 delete world.megastructures.systems[megaKey(q)].structures.gate;assert.deepEqual(availableResources(world,p),p.resources);assert.deepEqual(availableResources(world,q),q.resources);
});

test('ordinary interstellar flight scales exactly 100x while in-system and every core-exploration leg keep their speed and fuel',()=>{
 const {world,player,p}=fixture();p.ships={Cruiser:100,Large_Cargo_Ship:100,Recycler:10,Battleship:20};
 const position=[1,p.position[1]%499+1,16],ships={Large_Cargo_Ship:100,Recycler:10,Battleship:20};
 const original=navigationQuote(units,player.tech,p.position,ships,position,100,'explore'),normal=fleetQuote(player,p,ships,position,100,'mine');
 assert.equal(normal.seconds,original.seconds*100);assert.equal(normal.fuel,original.fuel*100);assert.equal(normal.capacity,original.capacity);
 const local=[1,p.position[1],16];assert.deepEqual(fleetQuote(player,p,ships,local,100,'mine'),fleetQuote(player,p,ships,local,100,'explore'));
 const fast=fleetQuote(player,p,{Cruiser:1},position,100),slow=fleetQuote(player,p,{Cruiser:1},position,50);assert(slow.seconds>fast.seconds);assert(slow.fuel<fast.fuel);
 const gas=p.resources[2];act(world,player,{type:'dispatch',planet:p.id,position,ships,task:'explore',zone:'outer',rounds:1,speed:100},T);
 const mission=world.missions[0];assert.equal(mission.travel,original.seconds*1000);assert.equal(p.resources[2],gas-original.fuel);
 const saved=structuredClone(mission);migrateWorld(world);assert.deepEqual(world.missions[0],saved);
});

test('megastructure output is applied once per linked system, respects capacity, and habitat power never removes occupied fields',()=>{
 const {world,player,p}=fixture();p.position=[1,15,7];p.resources=[0,0,0];p.buildings={Metal_Mine:20,Crystal_Mine:20,Gas_Mine:20};
 enableMegastructures(world,p,{gate:1,dyson:1,extractor:1,industry:1});
 const q=testMegaColony(world,p,'test-mega-shared',15);q.buildings={Metal_Mine:20,Crystal_Mine:20,Gas_Mine:20};
 const e=economy(p,world),storage=storageEconomy(world,p,economy),extra=systemMegaRate(world,p);
 assert.equal(e.megastructureSupply,50000);assert.deepEqual(extra,[5e6,3e6,4e6]);
 assert.deepEqual(storage.rate,e.rate.map((n,i)=>n+economy(q,world).rate[i]+extra[i]));
 const stock=availableResources(world,p),capacity=availableCapacity(world,p);advance(world,T+3600000);
 assert.deepEqual(availableResources(world,p),storage.rate.map((n,i)=>Math.min(capacity[i],stock[i]+n)));
 const fields=fieldsAvailable(p);p.orbitalHabitat={level:3,queue:null};assert.equal(fieldsAvailable(p),fields+400);assert.equal(economy(p,world).megastructureDemand,150000);
 delete world.megastructures.systems[megaKey(p)].structures.dyson;assert.equal(fieldsAvailable(p),fields+400);assert.equal(economy(p,world).ratio,0);
 const once=availableResources(world,p);advance(world,world.at);assert.deepEqual(availableResources(world,p),once);
});

test('all advanced orders use one powered system queue, preserve old paid fleets and pause without losing paid progress',()=>{
 const {world,player,p,build}=fixture(),item=units.Interceptor;p.resources=[1e10,1e10,1e10];player.strategicResources.resonance=1000;
 const old={id:'Iron_Behemoth',count:1,remaining:1,each:10,start:T,end:T+10000};p.flagshipQueue=[structuredClone(old)];p.buildings.Flagship_Center=2;
 const stock=[...p.resources];assert.throws(()=>build('Interceptor'),/巨构船坞/);assert.deepEqual(p.resources,stock);
 const system=enableMegastructures(world,p,{extractor:1,shipyard:1});build('Interceptor');
 assert.equal(system.shipQueue[0].each,672);assert.equal(p.shipQueue.length,0);assert.deepEqual(p.flagshipQueue,[old]);
 const paid=structuredClone(system.shipQueue),material=player.strategicResources.resonance;delete system.structures.extractor;advance(world,T+100000);
 assert.equal(p.ships.Interceptor,undefined);assert.equal(p.ships.Iron_Behemoth,1);assert.equal(p.buildings.Flagship_Center,2);assert.equal(system.pausedAt,T);assert.deepEqual(system.shipQueue,paid);
 assert.throws(()=>build('Interceptor'),/供能不足/);assert.equal(player.strategicResources.resonance,material);
 system.structures.extractor={level:1};advance(world,world.at);assert.equal(system.shipQueue[0].end,paid[0].end+100000);
 advance(world,system.shipQueue[0].end);assert.equal(p.ships.Interceptor,1);assert.equal(system.shipQueue.length,0);
 const q=testMegaColony(world,p,'test-mega-queue-shared',p.position[1]);for(let n=0;n<8;n++)act(world,player,{type:'ship',planet:n%2?q.id:p.id,id:'Interceptor',count:1},world.at);
 assert.equal(system.shipQueue.length,8);assert.throws(()=>build('Interceptor'),/队列已满/);
 const s=snapshot(world,player);assert.equal(s.planets.find(x=>x.id===q.id).megaShipyard.queue.length,8);
 const stable=structuredClone(world);migrateWorld(world);assert.deepEqual(world,stable);
});

test('white dwarf and magnetar materials accrue once and listener tiers expose only actual flying contacts',()=>{
 const {world,player,p}=fixture();p.position=[1,3,7];p.resources=[0,0,0];const white=enableMegastructures(world,p,{extractor:3,listener:3});
 const q=testMegaColony(world,p,'test-magnetar',37);enableMegastructures(world,q,{extractor:3});
 assert.equal(stellarType(3).id,'white');assert.equal(stellarType(37).id,'magnetar');
 advance(world,T+3600000);assert.deepEqual(player.stellarMaterials,{whiteDwarf:50,magnetar:10});
 const saved=JSON.parse(JSON.stringify(world));migrateWorld(saved);advance(saved,saved.at);assert.deepEqual(saved.players[player.id].stellarMaterials,{whiteDwarf:50,magnetar:10});
 const now=world.at;world.missions.push({id:'test-listener-flight',owner:player.id,from:p.id,target:q.id,position:q.position,ships:{Cruiser:2},task:'deploy',phase:'outbound',start:now,end:now+100000,travel:100000},{id:'test-listener-holding',owner:player.id,from:p.id,position:q.position,ships:{Cruiser:3},task:'explore',phase:'holding',start:now,end:now+100000});
 let listener=listenerSnapshot(world,player);assert.equal(listener.contacts.length,1);assert.deepEqual(listener.contacts[0].ships,{Cruiser:2});assert(listener.radius>=Math.hypot(listener.contacts[0].position[0]-listener.center[0],listener.contacts[0].position[2]-listener.center[2]));
 white.structures.listener.level=1;listener=listenerSnapshot(world,player);assert.equal(listener.radius,5000);assert.equal(listener.contacts.length,1);assert.equal(listener.contacts[0].ships,undefined);assert.equal(listener.contacts[0].targetPosition,undefined);
 white.structures.listener.level=2;assert.equal(listenerSnapshot(world,player).radius,12000);
});

test('great-power v2 infrastructure spreads across existing territory while preserving humans, paid work and v1 facilities',()=>{
 const {world,player,p}=fixture();
 world.grandPowerMegastructures={version:1,createdAt:T-10000,regions:[]};
 const leaders=world.grandPowers.regions.map(r=>world.players[r.leader]),leaderIds=new Set(leaders.map(p=>p.id));
 for(const [key,system]of Object.entries(world.megastructures.systems))if(leaderIds.has(system.owner))delete world.megastructures.systems[key];
 for(const q of Object.values(world.planets))if(leaderIds.has(q.owner))delete q.orbitalHabitat;
 for(const leader of leaders)for(const id of Object.keys(megastructureTechnologies))delete leader.tech[id];
 const leader=leaders[0],capital=world.planets[leader.home],remote=Object.values(world.planets).find(q=>q.owner===leader.id&&!q.moon&&q.position[1]!==capital.position[1]);
 leader.researchQueue={id:'Megastructure_Engineering',planet:capital.id,level:2,cost:[800000,600000,200000],start:T,end:T+60000};
 const construction={queueId:'test-paid-mega-upgrade',planet:capital.id,start:T,end:T+60000,cost:[200e6,160e6,60e6],level:2};
 const manufacturing={queueId:'test-paid-capital-hull',id:'Interceptor',planet:capital.id,count:2,remaining:2,each:1234,start:T,end:T+1234000};
 const system=enableMegastructures(world,capital,{dyson:1,extractor:1,shipyard:1});system.structures.dyson.queue=structuredClone(construction);system.shipQueue.push(structuredClone(manufacturing));
 const originalListener=enableMegastructures(world,remote,{listener:2,industry:3});
 capital.orbitalHabitat={level:1,queue:{...structuredClone(construction),queueId:'test-paid-habitat-upgrade',cost:[40e6,30e6,10e6]}};
 const humanBefore=structuredClone({player,planet:p}),planetsBefore=structuredClone(world.planets),playersBefore=structuredClone(world.players),missionsBefore=structuredClone(world.missions),keys=Object.keys(world.planets).sort();
 const habitatQueue=structuredClone(capital.orbitalHabitat.queue);
 migrateGrandPowerMegastructures(world,T);
 assert.equal(world.grandPowerMegastructures.version,GRAND_POWER_MEGASTRUCTURES_VERSION);assert.equal(world.grandPowerMegastructures.regions.length,4);
 assert.equal(world.grandPowerMegastructures.createdAt,T-10000);
 assert.deepEqual(Object.keys(world.planets).sort(),keys);assert.deepEqual({player,planet:p},humanBefore);assert.deepEqual(world.missions,missionsBefore);
 for(const [id,old]of Object.entries(playersBefore)){
  const current=structuredClone(world.players[id]),expected=structuredClone(old);
  if(leaderIds.has(id)){for(const key of Object.keys(megastructureTechnologies)){assert((current.tech[key]||0)>=(old.tech[key]||0));delete current.tech[key];delete expected.tech[key];}}
  assert.deepEqual(current,expected);
 }
 for(const [id,old]of Object.entries(planetsBefore)){
  const current=structuredClone(world.planets[id]),expected=structuredClone(old);
  if(leaderIds.has(old.owner)){delete current.orbitalHabitat;delete expected.orbitalHabitat;}
  assert.deepEqual(current,expected);
 }
 assert.deepEqual(system.structures.dyson.queue,construction);assert.deepEqual(system.shipQueue,[manufacturing]);assert.deepEqual(capital.orbitalHabitat.queue,habitatQueue);
 assert.equal(system.structures.dyson.level,3);assert.equal(capital.orbitalHabitat.level,3);assert.equal(system.structures.listener,undefined);assert.equal(originalListener.structures.listener.level,3);
 assert.equal(originalListener.structures.industry.level,3);
 assert.equal(Object.values(world.megastructures.systems).filter(s=>s.owner===leader.id&&s.structures.listener?.level).length,1);
 for(const record of world.grandPowerMegastructures.regions){
  const owner=world.players[record.leader],home=world.planets[record.capital],base=world.megastructures.systems[megaKey(home)];
  const owned=new Set(Object.values(world.planets).filter(q=>q.owner===owner.id&&!q.moon&&q.position[0]===1).map(q=>q.position[1]));
  assert.equal(owner.home,home.id);assert.equal(record.ownedSystems,owned.size);assert.equal(record.systems.length,Math.ceil(owned.size*.8));assert.equal(record.shipyardSystems.length,Math.ceil(record.systems.length*.12));
  for(const id of ['gate','dyson','extractor','shipyard','industry'])assert.equal(base.structures[id].level,id==='gate'?1:3);
  assert.equal(home.orbitalHabitat.level,3);assert.equal(world.logisticsCenters[megaKey(home)].level,1);
  const tiers=new Set();
  for(const number of record.systems){
   assert(owned.has(number));const key=`${owner.id}:1:${number}`,s=world.megastructures.systems[key];
   assert.equal(s.structures.gate.level,1);assert.equal(world.logisticsCenters[key].level,1);assert(s.structures.dyson.level>0);assert(s.structures.industry.level>0);tiers.add(s.structures.dyson.level);
   if(['white','magnetar'].includes(stellarType(number).id))assert(s.structures.extractor.level>=2);
  }
  assert.deepEqual([...tiers].sort(),[1,2,3]);
  for(const s of Object.values(world.megastructures.systems).filter(s=>s.owner===owner.id))for(const [id,item]of Object.entries(s.structures))if(item.level)for(const [key,required]of megaRequiredTech(id,item.level,stellarType(s.position[1]).id))assert(owner.tech[key]>=required);
 }
 const stable=structuredClone(world);migrateGrandPowerMegastructures(world,T+999);assert.deepEqual(world,stable);
 advance(world,T+60000);assert.equal(system.structures.dyson.level,3);assert.equal(capital.orbitalHabitat.level,3);assert.deepEqual(system.shipQueue,[manufacturing]);assert.equal(leader.tech.Megastructure_Engineering,8);assert.equal(leader.researchQueue,null);
});

test('megastructure research gates new spending, exposes target-level requirements and leaves paid construction valid',()=>{
 const {world,player,p}=fixture();p.resources=[1e10,1e10,1e10];p.buildings.Research_Lab=12;
 const system=enableMegastructures(world,p);player.tech={};
 const initial=snapshot(world,player),views=[...Object.values(initial.megastructures.systems.find(s=>s.key===megaKey(p)).structures),initial.megastructures.habitats.find(h=>h.planet===p.id).structure];
 for(const view of views){
  assert.deepEqual(view.requirements.map(r=>[r.id,r.required]),megaRequiredTech(view.id,1,stellarType(p.position[1]).id));
  assert(view.requirements.every(r=>r.name&&r.current===(r.id==='Research_Lab'?12:0)&&!r.met&&r.required>0));
 }
 const action={type:'megastructure',planet:p.id,id:'dyson',mode:'build'},before=[...p.resources];
 assert.throws(()=>act(world,player,action,T),/能源科技 10/);assert.deepEqual(p.resources,before);assert.equal(system.structures.dyson,undefined);
 for(const [id,level]of megaRequiredTech('dyson',1))player.tech[id]=level;
 act(world,player,action,T);const paid=structuredClone(system.structures.dyson.queue);player.tech={};
 advance(world,paid.end);assert.equal(system.structures.dyson.level,1);assert.equal(system.structures.dyson.queue,null);
 const upgrade=snapshot(world,player).megastructures.systems.find(s=>s.key===megaKey(p)).structures.dyson;
 assert.equal(upgrade.requirements.find(r=>r.id==='Automation_Control').required,6);assert.equal(upgrade.requirements.find(r=>r.id==='Energy_Tech').required,12);
 const stock=[...p.resources];assert.throws(()=>act(world,player,action,world.at),/能源科技 12/);assert.deepEqual(p.resources,stock);assert.equal(economy(p,world).megastructureSupply,50000);
 for(const [id,level]of megaRequiredTech('dyson',2))player.tech[id]=level;
 act(world,player,action,world.at);player.tech={};act(world,player,{...action,mode:'cancel'},world.at);assert.deepEqual(p.resources,stock);
 // Ordinary research retains charging, cancellation, completion and level caps.
 const data=createData(publicCatalog,snapshot(world,player).planets.find(q=>q.id===p.id),player);
 for(const [id,item]of Object.entries(megastructureTechnologies)){
  assert(data.technologies.some(t=>t.id===id));assert.equal(tech[id].factor,2);assert.equal(tech[id].maxLevel,id==='Automation_Control'?8:6);player.tech[id]=0;
  for(const [key,level]of item.req)if(key!=='Research_Lab')player.tech[key]=Math.max(player.tech[key]||0,level);
  const balance=[...p.resources];act(world,player,{type:'research',planet:p.id,id},world.at);
  assert.deepEqual(player.researchQueue.cost,item.cost);assert.deepEqual(p.resources,balance.map((n,i)=>n-item.cost[i]));
  act(world,player,{type:'cancel',kind:'research',planet:p.id},world.at);assert.deepEqual(p.resources,balance);
  act(world,player,{type:'research',planet:p.id,id},world.at);advance(world,player.researchQueue.end);assert.equal(player.tech[id],1);
  player.tech[id]=item.maxLevel;const capped=[...p.resources];assert.throws(()=>act(world,player,{type:'research',planet:p.id,id},world.at),/全部研究/);assert.deepEqual(p.resources,capped);
 }
 assert(data.treeLayout.edges.some(e=>e.from==='Computer_Tech'&&e.to==='Automation_Control'&&e.level===6));
 assert(data.treeLayout.edges.some(e=>e.from==='Astrophysics_Tech'&&e.to==='Ecological_Engineering'&&e.level===4));
 for(const id of Object.keys(retiredMegastructureTechnologies)){
  assert(!data.technologies.some(t=>t.id===id));assert.equal(data.positions[id],undefined);
  const stock=[...p.resources];assert.throws(()=>act(world,player,{type:'research',planet:p.id,id},world.at),/停止新增研究/);assert.deepEqual(p.resources,stock);
 }
});

test('accepted research thresholds cover every facility level and stellar exception without changing the economy',()=>{
 const spec={
  gate:{Hyperspace_Tech:[10],Energy_Tech:[12],Computer_Tech:[10]},
  dyson:{Energy_Tech:[10,12,14],Automation_Control:[4,6,8],Metamaterial_Tech:[1,2,3]},
  extractor:{Plasma_Tech:[6,8,10],Energy_Tech:[10,12,14],Shielding_Tech:[8,10,12],Automation_Control:[3,5,7]},
  shipyard:{Advanced_Ship_Engineering:[1,3,5],Metamaterial_Tech:[2,3,4],Automation_Control:[4,6,8],Energy_Tech:[10,12,14]},
  listener:{Espionage_Tech:[8,10,12],Computer_Tech:[8,10,12],Quantum_Command:[0,1,3],Hyperspace_Tech:[0,6,10]},
  industry:{Automation_Control:[3,5,7],Laser_Tech:[10,12,14],Strength_Tech:[8,10,12],Energy_Tech:[8,10,12]},
  habitat:{Ecological_Engineering:[2,4,6],Metamaterial_Tech:[1,2,3],Shielding_Tech:[6,8,10],Energy_Tech:[8,10,12]}
 };
 for(const [id,table]of Object.entries(spec))for(let level=1;level<=(id==='gate'?1:3);level++){
  const expected=Object.fromEntries(Object.entries(table).map(([key,values])=>[key,values[level-1]]).filter(([,n])=>n));
  assert.deepEqual(Object.fromEntries(megaRequiredTech(id,level)),expected);
  for(const [key,n]of Object.entries(expected)){assert(!tech[key].retired);assert(n<=(tech[key].maxLevel||Infinity));}
  assert.deepEqual(megastructureUnlocks.find(m=>m.key===id+':main').levels[level-1].requirements,megaRequiredTech(id,level));
 }
 for(let level=1;level<=3;level++){
  const base=Object.fromEntries(megaRequiredTech('extractor',level));
  assert.deepEqual(Object.fromEntries(megaRequiredTech('extractor',level,'white')),{...base,Astrophysics_Tech:[6,8,10][level-1],Metamaterial_Tech:[2,3,4][level-1]});
  assert.deepEqual(Object.fromEntries(megaRequiredTech('extractor',level,'magnetar')),{...base,Shielding_Tech:[12,14,16][level-1],Astrophysics_Tech:[8,10,12][level-1],Metamaterial_Tech:[3,4,4][level-1]});
  for(const star of ['main','red','blue'])assert.deepEqual(Object.fromEntries(megaRequiredTech('extractor',level,star)),base);
 }
 const economics={gate:[[30e6,20e6,10e6],6],dyson:[[100e6,80e6,30e6],12],extractor:[[80e6,60e6,40e6],12],shipyard:[[120e6,100e6,50e6],18],listener:[[40e6,80e6,40e6],8],industry:[[120e6,80e6,20e6],12],habitat:[[20e6,15e6,5e6],4]};
 for(const [id,[cost,hours]]of Object.entries(economics)){
  assert.deepEqual(megastructureCatalog[id].cost,cost);assert.equal(megastructureCatalog[id].seconds,hours*3600);assert.equal(megastructureCatalog[id].maxLevel,id==='gate'?1:id==='dyson'?5:3);
 }
});

test('stellar research restrictions reject spending on the right star and preserve inherited output and all paid queues',()=>{
 const {world,player,p}=fixture();p.resources=[1e10,1e10,1e10];
 for(const [number,star]of [[3,'white'],[37,'magnetar']]){
  const q=testMegaColony(world,p,'test-research-'+star,number);q.resources=[1e10,1e10,1e10];
  const system=enableMegastructures(world,q);player.tech=Object.fromEntries(megaRequiredTech('extractor',1));
  const action={type:'megastructure',planet:q.id,id:'extractor',mode:'build'},stock=[...q.resources];
  assert.throws(()=>act(world,player,action,T),/需要/);assert.deepEqual(q.resources,stock);assert.equal(system.structures.extractor,undefined);
  const view=snapshot(world,player).megastructures.systems.find(s=>s.key===megaKey(q)).structures.extractor;
  assert.deepEqual(view.requirements.map(r=>[r.id,r.required]),megaRequiredTech('extractor',1,star));
  player.tech=Object.fromEntries(megaRequiredTech('extractor',1,star));act(world,player,action,T);
  assert.deepEqual(q.resources,stock.map((v,i)=>v-megastructureCatalog.extractor.cost[i]));
  act(world,player,{...action,mode:'cancel'},T);assert.deepEqual(q.resources,stock);
 }
 const system=enableMegastructures(world,p,{dyson:1,extractor:1,shipyard:1,industry:1,gate:1,listener:1});
 p.orbitalHabitat={level:1,queue:{planet:p.id,level:2,start:T,end:T+60000,cost:[40e6,30e6,10e6]}};
 system.structures.dyson.queue={planet:p.id,level:2,start:T,end:T+60000,cost:[200e6,160e6,60e6]};
 system.shipQueue=[{id:'Interceptor',planet:p.id,count:1,remaining:1,each:60,start:T,end:T+60000}];
 player.tech={Megastructure_Engineering:5};player.researchQueue={id:'Megastructure_Engineering',planet:p.id,level:6,start:T,end:T+60000,cost:[128e5,96e5,32e5]};
 const saved=JSON.parse(JSON.stringify(world));migrateWorld(saved);
 const owner=saved.players[player.id],home=saved.planets[p.id],old=saved.megastructures.systems[megaKey(p)];
 assert.deepEqual(old,system);assert.deepEqual(owner.researchQueue,player.researchQueue);assert.deepEqual(home.orbitalHabitat,p.orbitalHabitat);
 assert.equal(economy(home,saved).megastructureSupply,50000);
 advance(saved,T+60000);assert.equal(old.structures.dyson.level,2);assert.equal(home.orbitalHabitat.level,2);assert.equal(home.ships.Interceptor,1);assert.equal(owner.tech.Megastructure_Engineering,6);assert.equal(owner.researchQueue,null);
 owner.researchQueue={id:'Macro_Materials',planet:home.id,level:3,start:saved.at,end:saved.at+60000,cost:[1200000,1600000,600000]};
 const stock=[...home.resources];act(saved,owner,{type:'cancel',kind:'research',planet:home.id},saved.at);assert.deepEqual(home.resources,stock.map((n,i)=>n+[1200000,1600000,600000][i]));
});

test('public star-map megastructures show built facilities for every civilization without private stocks or orders',()=>{
 const {world,player,p}=fixture(),system=enableMegastructures(world,p,{dyson:1,shipyard:1,extractor:1});
 system.structures.industry={level:0,queue:{queueId:'private-construction',planet:p.id,start:T,end:T+100000,cost:[1,2,3],level:1}};
 system.shipQueue.push({queueId:'private-hull',id:'Iron_Behemoth',count:100,remaining:100,start:T,end:T+100000,each:100,planet:p.id});
 p.orbitalHabitat={level:2,queue:{queueId:'private-habitat',planet:p.id,start:T,end:T+100000,cost:[4,5,6],level:3}};
 const result=publicMegastructures(world),map=starMap(world);assert.deepEqual(map.megastructures,result);
 assert(result.systems.some(s=>s.owner===player.id));for(const region of world.grandPowers.regions)assert(result.systems.some(s=>s.owner===region.leader));
 const own=result.systems.find(s=>s.key===megaKey(p));assert.equal(own.structures.industry,undefined);assert.equal(own.shipyard.active,true);assert.equal(own.shipyard.powered,true);
 assert.deepEqual(Object.keys(own).sort(),['host','key','owner','ownerName','position','shipyard','structures']);
 assert.deepEqual(Object.keys(own.structures.dyson).sort(),['id','level','maxLevel','name']);
 const habitat=result.habitats.find(h=>h.planet===p.id);assert.equal(habitat.structure.level,2);assert.deepEqual(Object.keys(habitat).sort(),['name','owner','ownerName','planet','position','structure']);
 const text=JSON.stringify(result);for(const secret of ['private-construction','private-hull','private-habitat','"resources":','"queue":','"contacts":','"ships":','"cost":'])assert.equal(text.includes(secret),false,secret);
 system.pausedAt=T;assert.equal(publicMegastructures(world).systems.find(s=>s.key===megaKey(p)).shipyard.active,false);
});
