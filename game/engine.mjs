import {randomUUID} from 'node:crypto';
import {finishTrial} from './battle-trial.mjs';
import {planetName} from './star-map.mjs';
import {buildings,tech,units,rules,missionNames} from './catalog.mjs';
import {battle,seeded} from './combat.mjs';
import {createSpatialBattle,addSpatialFleet,advanceSpatialBattle,spatialSurvivors,strikeBattleDefenses,battleSummary,battleVisible} from './spatial-battle.mjs';
import {getLayout,validatePlacement,findPlacement,migrateLayout,LAYOUT_VERSION} from './layout.mjs';
import {factions,commanders,commanderInfo} from './factions.mjs';
import {planetTypes,planetType} from './planet-types.mjs';
import {RESOURCE_COMPLEX_VERSION,isLegacyStorage,migrateResourceComplexes,planetCapacities,resourceComplexes,usedBuildingFields} from './resource-complexes.mjs';
import {SURFACE_LAYOUT_VERSION,surfaceLayout,migrateSurfaceLayout,validateSurfaceSlot} from './surface-layout.mjs';

export const uid=()=>randomUUID();
const zeros=()=>[0,0,0];
const total=f=>Object.values(f||{}).reduce((a,b)=>a+b,0);
const mineIds=['Metal_Mine','Crystal_Mine','Gas_Mine'];
const ensureBiomeSeed=world=>world.biomeSeed??=Math.floor(Math.random()*4294967296);
function systemBiomes(world,galaxy,system){
  const ids=Object.keys(planetTypes),types=Array.from({length:15},(_,i)=>ids[i%ids.length]);
  const rng=seeded(ensureBiomeSeed(world)^Math.imul(galaxy,73856093)^Math.imul(system,19349663));
  for(let i=types.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[types[i],types[j]]=[types[j],types[i]];}
  return types;
}
const biomeAt=(world,position)=>systemBiomes(world,position[0],position[1])[position[2]-1];
const npcSkinValue=value=>{const n=typeof value==='string'&&/^\d+$/.test(value)?Number(value):value;return Number.isInteger(n)&&n>=17&&n<=34?n:null;};
function ensureNpcSkins(world,planets){
  const systems=new Map();
  for(const p of planets)if(p.npc&&!p.moon){const key=p.position.slice(0,2).join(':');if(!systems.has(key))systems.set(key,[]);systems.get(key).push(p);}
  for(const [key,local]of systems){
    const [galaxy,system]=key.split(':').map(Number),pool=[17,18,19,20,21];
    const rng=seeded(ensureBiomeSeed(world)^Math.imul(galaxy,73856093)^0x4E5043);
    for(let i=pool.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
    local.sort((a,b)=>a.position[2]-b.position[2]||a.id.localeCompare(b.id));
    const used=new Set();for(const p of local){const saved=npcSkinValue(p.npcSkin)??npcSkinValue(p.planet_icon);if(saved!==null){p.npcSkin=saved;used.add(saved);}}
    // This project's seeded allocation uses the APK's regular 17–21 assets; it is not the original server algorithm.
    for(const [index,p]of local.entries())if(npcSkinValue(p.npcSkin)===null){
      const template=Number(/^npc:\d+:\d+:([1-4])$/.exec(p.id)?.[1])-1,offset=((system-1)*4+(Number.isInteger(template)?template:index))%pool.length;
      const candidates=pool.map((_,i)=>pool[(offset+i)%pool.length]);p.npcSkin=candidates.find(skin=>!used.has(skin))??candidates[0];used.add(p.npcSkin);
    }
  }
}
const requireThat=(ok,message)=>{if(!ok)throw new Error(message);};
export const costAt=(item,level)=>item.cost.map(n=>Math.floor(n*(item.factor||2)**(level-1)+1e-7));
export const getCapacity=planetCapacities;
export function economy(p){
  if(p.moon)return {supply:0,demand:0,ratio:1,rate:zeros(),capacity:getCapacity(p)};
  const b=p.buildings,L=id=>b[id]||0,multipliers=planetType(p).multipliers;
  const solar=Math.floor(20*L('Solar_Plant')*1.1**L('Solar_Plant'));
  const fusion=p.resources[2]>0?Math.floor(30*L('Fusion_Reactor')*1.15**L('Fusion_Reactor')):0;
  const supply=solar+fusion+(p.ships.Solar_Satellite||0)*Math.max(1,Math.floor((p.temperature+160)/6));
  const demand=Math.ceil(mineIds.reduce((sum,id,i)=>sum+(multipliers[i]?(i===2?20:10)*L(id)*1.1**L(id):0),0)+((L('Radar_Facility')>1)?2*1.52**L('Radar_Facility'):0));
  const ratio=demand?Math.min(1,supply/demand):1;
  const rate=[(20+30*L('Metal_Mine')*1.1**L('Metal_Mine')*ratio)*multipliers[0]*rules.economySpeed,(10+20*L('Crystal_Mine')*1.1**L('Crystal_Mine')*ratio)*multipliers[1]*rules.economySpeed,(10*L('Gas_Mine')*1.1**L('Gas_Mine')*Math.max(.1,1.44-.004*p.temperature)*ratio*multipliers[2]-(fusion?10*L('Fusion_Reactor')*1.1**L('Fusion_Reactor'):0))*rules.economySpeed];
  return {supply,demand,ratio,rate,capacity:getCapacity(p)};
}
export function prerequisites(item,p,player){return item.req.map(([id,level])=>({id,name:(buildings[id]||tech[id])?.name||id,level,current:tech[id]?(player.tech[id]||0):(p.buildings[id]||0)}));}
export function duration(item,kind,p,level=1,world=null,player=null){
  const cost=kind==='ship'?item.cost:costAt(item,level),material=cost[0]+cost[1];
  if(kind==='ship')return Math.max(2,Math.ceil(material*1.44/(((p.buildings.Shipyard||0)+1)*2**(p.buildings.Nanite_Factory||0)*rules.constructionSpeed)));
  if(kind==='tech'){
    let labs=p.buildings.Research_Lab||0;
    if(world&&player){const needed=item.req.find(([id])=>id==='Research_Lab')?.[1]||1;labs+=Object.values(world.planets).filter(x=>x.owner===player.id&&!x.moon&&x.id!==p.id&&(x.buildings.Research_Lab||0)>=needed).map(x=>x.buildings.Research_Lab).sort((a,b)=>b-a).slice(0,player.tech.Intergalactic_Network||0).reduce((a,b)=>a+b,0);}
    return Math.max(20,Math.ceil((cost[0]+cost[1])*3.6/((labs+1)*rules.researchSpeed)));
  }
  return Math.max(12,Math.ceil(material*1.44/(((p.buildings.Robotics_Facility||0)+1)*2**(p.buildings.Nanite_Factory||0)*rules.constructionSpeed)));
}
export const fieldsAvailable=p=>p.moon?1+3*(p.buildings.Moon_Base||0):p.fields+5*(p.buildings.Terraformer||0);
const colonyLimit=player=>1+Math.ceil((player.tech.Astrophysics_Tech||0)/2);
export function planetEnvironment(slot,rng=Math.random){
  const temperature=Math.round(130-(slot-1)*16+rng()*30);
  const ranges=slot<=3?[55,140]:slot<=6?[170,280]:slot<=9?[140,230]:slot<=12?[100,190]:[60,160];
  const fields=ranges[0]+Math.floor(rng()*(ranges[1]-ranges[0]+1));
  return {temperature,fields,diameter:Math.floor(Math.sqrt(fields)*1000)};
}
const makePlanet=(owner,name,position,extra={})=>({id:uid(),owner,name,position,temperature:22,fields:178,moon:false,biome:'terrestrial',layoutVersion:LAYOUT_VERSION,...(!extra.moon?{surfaceLayoutVersion:SURFACE_LAYOUT_VERSION,resourceComplexVersion:RESOURCE_COMPLEX_VERSION}:{}),resources:[48000,30000,15000],buildings:{Metal_Mine:10,Crystal_Mine:8,Gas_Mine:6,Solar_Plant:12,Metal_Storage:6,Crystal_Storage:6,Gas_Storage:6,Robotics_Facility:6,Shipyard:8,Research_Lab:8,Radar_Facility:4},ships:{Light_Fighter:16,Heavy_Fighter:6,Cruiser:4,Battleship:2,Cargo_Ship:3,Large_Cargo_Ship:1,Recycler:2,Probe:5,Colony_Ship:1},defense:{Rocket_Launcher:8,Light_Laser:4},buildQueue:null,shipQueue:[],debris:zeros(),...extra});
export function ensureSystemNpcs(world,galaxy,system){
  requireThat(Number.isInteger(galaxy)&&galaxy>=1&&galaxy<=9&&Number.isInteger(system)&&system>=1&&system<=499,'星系坐标无效');
  const key=`${galaxy}:${system}`;world.npcSystems??={};
  const local=Object.values(world.planets).filter(p=>p.position[0]===galaxy&&p.position[1]===system);
  ensureNpcSkins(world,local);if(world.npcSystems[key])return;
  // Existing camps retain their damage and loot, including legacy saves without an initialization marker.
  if(!local.some(p=>p.npc&&!p.moon)){
    const occupied=new Set(local.map(p=>p.position[2]));
    for(const m of world.missions)if(m.task==='colonize'&&m.phase==='outbound'&&m.position[0]===galaxy&&m.position[1]===system)occupied.add(m.position[2]);
    const targets=[['废弃前哨',1,{Light_Fighter:14,Heavy_Fighter:3},{Rocket_Launcher:3}],['赤铁守备站',2,{Light_Fighter:30,Heavy_Fighter:8,Cruiser:3},{Rocket_Launcher:10,Light_Laser:6}],['卡戎舰队',4,{Light_Fighter:80,Heavy_Fighter:25,Cruiser:12,Battleship:5},{Rocket_Launcher:25,Heavy_Laser:10}],['遗落货仓',6,{Light_Fighter:4,Cargo_Ship:5},{}]];
    for(const[index,[name,preferred,ships,defense]]of targets.entries()){
      const slot=[preferred,...Array.from({length:15},(_,i)=>i+1)].find(n=>!occupied.has(n));
      // ponytail: full legacy systems keep their occupied slots; separate encounter slots are needed to add camps there.
      if(slot===undefined)break;
      const id=`npc:${key}:${index+1}`;if(world.planets[id])continue;
      world.planets[id]=makePlanet(null,name,[galaxy,system,slot],{id,npc:true,ships,defense,resources:[90000,45000,18000],temperature:50-(16+index)*5});occupied.add(slot);
    }
    ensureNpcSkins(world,Object.values(world.planets).filter(p=>p.position[0]===galaxy&&p.position[1]===system));
  }
  world.npcSystems[key]=true;
}
export function ensureCommanders(world){
  const occupied=new Set(Object.values(world.planets).map(p=>p.position.join(':')));
  for(const m of world.missions)if(m.task==='colonize'&&m.phase==='outbound')occupied.add(m.position.join(':'));
  for(const npc of commanders){
    const id=`commander:${npc.region}:${npc.id}`,home=`${id}:home`;
    if(world.players[id]||world.planets[home])continue;
    let position;
    for(let offset=0;offset<499*15;offset++){
      const candidate=[npc.position[0],1+(npc.position[1]-1+Math.floor(offset/15))%499,1+(npc.position[2]-1+offset%15)%15];
      if(!occupied.has(candidate.join(':'))){position=candidate;break;}
    }
    if(!position)continue;
    const {ships,level,...profile}=npc;
    const p=makePlanet(id,npc.home,position,{id:home,biome:biomeAt(world,position),ships:{...ships},defense:{Rocket_Launcher:level*3,Light_Laser:level},resources:[30000*level,18000*level,9000*level]});
    world.players[id]={id,name:npc.name,bot:true,commander:profile,home,tech:{Weapons_Tech:level,Shielding_Tech:level,Strength_Tech:level},researchQueue:null,reports:[],alliance:null};
    world.planets[home]=p;occupied.add(position.join(':'));
  }
}
export function createWorld(now=Date.now()){
  const world={version:3,at:now,biomeSeed:Math.floor(Math.random()*4294967296),players:{},planets:{},missions:[],alliances:[],chat:[]};
  ensureSystemNpcs(world,1,16);
  for(const [name,slot,ships] of [['边境自由港',3,{Light_Fighter:18,Heavy_Fighter:4,Cruiser:1}],['猎户要塞',5,{Light_Fighter:65,Heavy_Fighter:16,Cruiser:8,Battleship:3}],['天鹅座',12,{Light_Fighter:900,Heavy_Fighter:200,Cruiser:90,Battleship:40}]]){
    const id=uid(),p=makePlanet(id,name,[1,16,slot],{biome:biomeAt(world,[1,16,slot]),ships,defense:{Rocket_Launcher:6},resources:[120000,75000,35000]});world.planets[p.id]=p;world.players[id]={id,name,bot:true,home:p.id,tech:{Weapons_Tech:2,Shielding_Tech:2,Strength_Tech:2},researchQueue:null,reports:[],alliance:null};
  }
  ensureCommanders(world);
  return world;
}
function sendReport(player,report){player.reports.unshift({id:uid(),at:Date.now(),read:false,...report});player.reports=player.reports.slice(0,100);}
export function createPlayer(world,name='指挥官',now=Date.now(),rng=Math.random){
  const id=uid(),occupied=new Set(Object.values(world.planets).filter(p=>!p.moon).map(p=>p.position.join(':')));
  const size=499*9;let index=Math.floor(rng()*size);let position;
  for(let tries=0;tries<size;tries++,index=(index+1)%size){position=[1,1+Math.floor(index/9)%499,4+index%9];if(!occupied.has(position.join(':')))break;if(tries===size-1)throw new Error('宇宙没有空闲母星');}
  const player={id,name,tech:{},researchQueue:null,reports:[],alliance:null,darkMatter:0,parts:0};
  const home=makePlanet(id,'母星',position,{...planetEnvironment(position[2],rng),biome:'terrestrial',fields:163,diameter:12767,resources:[500,500,0],buildings:{Command_Center:1},ships:{},defense:{}});
  world.planets[home.id]=home;player.home=home.id;world.players[id]=player;return player;
}
function makeMoon(world,parent,seed=1){const existing=Object.values(world.planets).find(p=>p.parent===parent.id);if(existing)return existing;const moon=makePlanet(parent.owner,'静海',parent.position,{moon:true,parent:parent.id,fields:1,diameter:4000+Math.floor(seeded(seed)()*4999),temperature:-60,resources:zeros(),buildings:{},ships:{},defense:{}});world.planets[moon.id]=moon;return moon;}
function pay(p,cost){requireThat(cost.every((v,i)=>p.resources[i]>=v),'资源不足');p.resources=p.resources.map((v,i)=>v-cost[i]);}
function add(p,values){p.resources=p.resources.map((v,i)=>v+(values[i]||0));}
function merge(target,source){for(const[id,n]of Object.entries(source))target[id]=(target[id]||0)+n;}
const missileStorage=p=>(p.defense.Interceptor_Missile||0)+2*(p.defense.Interplanetary_Missile||0)+p.shipQueue.reduce((sum,q)=>sum+(units[q.id]?.missile?q.remaining*(q.id==='Interplanetary_Missile'?2:1):0),0);
export function migrateWorld(world){
  world.battles??={};
  ensureBiomeSeed(world);
  for(const p of Object.values(world.planets)){migrateSurfaceLayout(p);migrateResourceComplexes(p);migrateLayout(p);if(!p.moon)p.biome=planetType(p).id;}
  for(const p of Object.values(world.planets))if(p.npc&&p.position[2]>15){
    const old=[...p.position];let position=[old[0],old[1],1];
    while(Object.values(world.planets).some(other=>other.id!==p.id&&!other.moon&&other.position.join(':')===position.join(':'))){position[2]++;if(position[2]>15){position[2]=1;position[1]=position[1]%499+1;}}
    p.position=position;for(const m of world.missions)if(m.target===p.id)m.position=[...position];
  }
  for(const m of world.missions)if(m.task==='explore'&&m.position[2]===21)m.position[2]=16;
  ensureNpcSkins(world,Object.values(world.planets));
  ensureCommanders(world);
  world.version=3;return world;
}
function integrate(world,to){const hours=(to-world.at)/3600000;if(hours<=0)return;for(const p of Object.values(world.planets)){const e=economy(p);p.resources=p.resources.map((v,i)=>e.rate[i]>0?Math.max(v,Math.min(e.capacity[i],v+e.rate[i]*hours)):Math.max(0,v+e.rate[i]*hours));}world.at=to;}
export function advance(world,to=Date.now()){
  world.battles??={};
  let guard=0;
  while(guard++<100000){
    const events=[];
    for(const p of Object.values(world.planets)){if(p.buildQueue)events.push({at:p.buildQueue.end,kind:'build',p});if(p.shipQueue.length)events.push({at:p.shipQueue[0].end,kind:'ship',p});}
    for(const player of Object.values(world.players))if(player.researchQueue)events.push({at:player.researchQueue.end,kind:'research',player});
    for(const m of world.missions)if(!['engaged','waiting'].includes(m.phase))events.push({at:m.end,kind:'mission',m});
    for(const b of Object.values(world.battles))if(b.status==='active')events.push({at:b.start+(b.tick+1)*50,kind:'battle',b});
    events.sort((a,b)=>a.at-b.at);const e=events[0];if(!e||e.at>to)break;
    if(e.kind==='battle'){
      const nextOther=events.find(x=>x!==e);
      const limit=Math.min(to,e.at+950,nextOther?nextOther.at-(nextOther.kind==='battle'?0:1):Infinity);
      advanceSpatialBattle(e.b,limit);
      if(e.b.status==='finished'){integrate(world,e.b.finishedAt);finishEngagement(world,e.b);}
      continue;
    }
    integrate(world,e.at);
    if(e.kind==='build'){const q=e.p.buildQueue;e.p.buildings[q.id]=q.level;e.p.buildQueue=null;}
    if(e.kind==='ship'){const q=e.p.shipQueue[0],target=units[q.id].type==='defense'?e.p.defense:e.p.ships;target[q.id]=(target[q.id]||0)+1;q.remaining--;if(q.remaining>0)q.end+=q.each*1000;else e.p.shipQueue.shift();joinDefenders(world,e.p);}
    if(e.kind==='research'){const q=e.player.researchQueue;e.player.tech[q.id]=q.level;e.player.researchQueue=null;}
    if(e.kind==='mission')resolveMission(world,e.m,e.at);
  }
  integrate(world,to);
}
function targetBattle(world,target){return Object.values(world.battles||{}).find(b=>b.status==='active'&&b.target===target.id);}
function joinDefenders(world,target,mission=null){
  const b=targetBattle(world,target);if(!b)return;
  const fleet={...target.ships};for(const[id,n]of Object.entries(target.defense))if(!units[id]?.missile)fleet[id]=(fleet[id]||0)+n;
  if(!total(fleet))return;
  addSpatialFleet(b,{fleet,owner:target.owner,mission,side:'defender',technology:world.players[target.owner]?.tech||{}},units);
  target.ships={};for(const id of Object.keys(target.defense))if(!units[id]?.missile)delete target.defense[id];
}
function beginEngagement(world,m,target,now){
  let b=targetBattle(world,target);
  if(b&&b.attacker!==m.owner){m.phase='waiting';m.start=now;m.end=b.start+600000;m.battleId=b.id;return;}
  if(!b){b=createSpatialBattle({id:uid(),target:target.id,attacker:m.owner,defender:target.owner,start:now,seed:m.seed,name:target.name});world.battles[b.id]=b;joinDefenders(world,target);}
  addSpatialFleet(b,{fleet:m.ships,technology:world.players[m.owner].tech,owner:m.owner,mission:m.id,side:'attacker'},units);
  m.phase='engaged';m.start=now;m.end=b.start+600000;m.battleId=b.id;
}
function finishEngagement(world,b){
  if(b.settled)return;
  if(b.trial){finishTrial(world,b);return;}
  const target=world.planets[b.target];if(!target)throw Error('交战目标丢失');
  const now=b.finishedAt,attacker=world.players[b.attacker],defender=world.players[b.defender],survivors=spatialSurvivors(b),losses={attacker:{},defender:{}},debris=zeros(),repair={};
  for(const side of ['attacker','defender'])for(const[id,count]of Object.entries(b.initial[side])){
    const n=count-(survivors[side][id]||0);if(n)losses[side][id]=n;
    if(units[id].type!=='defense')for(let i=0;i<2;i++)debris[i]+=Math.floor(units[id].cost[i]*n*rules.debrisRate);
  }
  for(const[id,n]of Object.entries(survivors.defender))merge(units[id].type==='defense'?target.defense:target.ships,{[id]:n});
  const rng=seeded(b.seed^0xDEB);
  for(const[id,n]of Object.entries(losses.defender))if(units[id].type==='defense'){let repaired=0;const repairable=n-b.ships.filter(s=>s.side==='defender'&&s.type===id&&s.unrepairable).length;for(let i=0;i<repairable;i++)if(rng()<.7)repaired++;repair[id]=repaired;merge(target.defense,{[id]:repaired});}
  const missions=world.missions.filter(m=>m.phase==='engaged'&&m.battleId===b.id),loot=zeros();
  for(const m of missions){
    m.ships={};for(const batch of b.batches.filter(batch=>batch.mission===m.id&&batch.side==='attacker'))merge(m.ships,spatialSurvivors(b,batch.id).attacker);
  }
  const capacities=missions.map(m=>Object.entries(m.ships).reduce((n,[id,count])=>n+units[id].cargo*count,0)),capacity=capacities.reduce((a,c)=>a+c,0);let free=capacity;
  if(b.winner==='attacker')for(let i=0;i<3;i++){loot[i]=Math.floor(Math.min(target.resources[i]/2,free/(3-i)));target.resources[i]-=loot[i];free-=loot[i];}
  const remaining=[...loot];
  for(let j=0;j<missions.length;j++){
    const m=missions[j];let space=capacities[j];
    for(let i=0;i<3;i++){const amount=Math.min(space,remaining[i]);m.cargo[i]+=amount;remaining[i]-=amount;space-=amount;}
    if(!total(m.ships)){world.missions=world.missions.filter(x=>x.id!==m.id);continue;}
    m.phase='return';m.start=now;m.end=now+m.travel;m.originPosition=m.position;
  }
  const debrisPlanet=target.moon?world.planets[target.parent]||target:target;addDebris(debrisPlanet,debris);
  const moonChance=Math.min(rules.moonCap,Math.floor((debris[0]+debris[1])/rules.moonStep)*.01),moonCreated=!target.moon&&!Object.values(world.planets).some(p=>p.parent===target.id)&&seeded(b.seed)()<moonChance;
  if(moonCreated)makeMoon(world,target,b.seed);
  const report={type:'battle',engine:`spatial-v${b.version||1}`,battleId:b.id,replayRef:b.id,at:now,title:`战斗报告 [${target.position.join(':')}]`,targetName:target.name,position:target.position,attackerName:attacker.name,defenderName:defender?.name||target.name,seed:b.seed,initial:structuredClone(b.initial),survivors,losses,debris,loot,repair,moonChance,moonCreated,winner:b.winner,duration:b.tick*.05,rounds:[],technology:{attacker:b.batches.find(x=>x.side==='attacker')?.technology||{},defender:b.batches.find(x=>x.side==='defender')?.technology||{}},simulation:{implementation:`spatial-v${b.version||1}`,spatial:true,grouped:false},stateHash:spatialHash(b)};
  sendReport(attacker,report);if(defender)sendReport(defender,{...structuredClone(report),defending:true});
  b.settled=true;b.reportId=attacker.reports[0].id;
  // A surviving destroy-moon expedition operates once, after the shared battle has settled.
  const demolition=missions.find(m=>m.task==='destroyMoon'&&m.phase==='return'&&(m.ships.Death_Star||0)>0);
  if(demolition&&target.moon&&b.winner==='attacker'){
    const diameter=target.diameter||8000,r=seeded(demolition.seed^0xA11CE),chance=Math.min(1,Math.max(0,(100-Math.sqrt(diameter))*Math.sqrt(demolition.ships.Death_Star)/100)),fleetLossChance=Math.min(1,Math.sqrt(diameter)/200),destroyed=r()<chance,lost=r()<fleetLossChance;
    const notice={type:'fleet',at:now,title:destroyed?'月球已摧毁':'月球摧毁失败',body:lost?'引力反噬摧毁了执行任务的全部舰队。':'舰队已完成引力武器作业。',moonDestroyed:destroyed,fleetLost:lost,chance,fleetLossChance,position:target.position};sendReport(attacker,notice);if(defender)sendReport(defender,{...notice});
    if(destroyed){for(const m of world.missions){if(m.target===target.id)m.target=target.parent;if(m.from===target.id)m.from=target.parent;}delete world.planets[target.id];}
    if(lost)world.missions=world.missions.filter(m=>m.id!==demolition.id);
  }
  for(const m of world.missions)if(m.phase==='waiting'&&m.battleId===b.id){m.phase='outbound';m.end=now;delete m.battleId;}
}
function addDebris(p,values){p.debris=p.debris.map((n,i)=>n+values[i]);}
function spatialHash(b){let h=2166136261;for(const s of b.ships)for(const n of [s.id,s.hp,s.shield,s.x,s.y,s.z]){h^=Math.round(n*1000);h=Math.imul(h,16777619);}return h>>>0;}
function resolveMission(world,m,now){
  const player=world.players[m.owner],home=world.planets[m.from],target=world.planets[m.target];
  const remove=()=>{world.missions=world.missions.filter(x=>x.id!==m.id);};
  if(m.phase==='return'){merge(home.ships,m.ships);joinDefenders(world,home,m.id);add(home,m.cargo);remove();sendReport(player,{type:'fleet',at:now,title:'舰队已返回',body:`舰队已抵达 ${home.name} [${home.position.join(':')}]。`,cargo:m.cargo});return;}
  if(['explore','mine'].includes(m.task)&&m.phase==='outbound'){m.phase='holding';m.start=now;m.end=now+(m.holdHours||1)*rules.explorationHourSeconds*1000;return;}
  let stay=false;
  if(['attack','destroyMoon'].includes(m.task)&&target&&target.owner!==m.owner&&(m.task!=='destroyMoon'||target.moon)){beginEngagement(world,m,target,now);return;}
  if(m.task==='spy'&&target){
    const enemy=world.players[target.owner];sendReport(player,{type:'spy',at:now,title:`侦察报告 [${target.position.join(':')}]`,targetName:target.name,position:target.position,resources:target.resources.map(Math.floor),ships:{...target.ships},defense:{...target.defense},buildings:{...target.buildings},technology:enemy?.tech||{}});
  }
  if(m.task==='recycle'&&target){let free=(m.ships.Recycler||0)*units.Recycler.cargo;const collected=zeros();for(let i=0;i<2;i++){collected[i]=Math.floor(Math.min(target.debris[i],free));target.debris[i]-=collected[i];free-=collected[i];}m.cargo=collected;sendReport(player,{type:'fleet',at:now,title:'残骸回收完毕',body:`回收舰队已完成 [${target.position.join(':')}] 的作业。`,cargo:collected});}
  if((m.task==='transport'||m.task==='deploy')&&target){add(target,m.cargo);m.cargo=zeros();if(m.task==='deploy'){merge(target.ships,m.ships);joinDefenders(world,target,m.id);stay=true;}sendReport(player,{type:'fleet',at:now,title:missionNames[m.task]+'完成',body:`舰队已抵达 ${target.name}。`});}
  if(m.task==='colonize'){
    const occupied=Object.values(world.planets).some(p=>!p.moon&&p.position.join(':')===m.position.join(':'));
    const colonies=Object.values(world.planets).filter(p=>p.owner===player.id&&!p.moon).length;
    if(!occupied&&colonies<colonyLimit(player)){
      const p=makePlanet(player.id,planetName(m.position[1],m.position[2],biomeAt(world,m.position)),m.position,{...planetEnvironment(m.position[2],seeded(m.seed)),biome:biomeAt(world,m.position),resources:[500+m.cargo[0],500+m.cargo[1],m.cargo[2]],buildings:{},ships:{},defense:{}});
      m.ships.Colony_Ship--;if(!m.ships.Colony_Ship)delete m.ships.Colony_Ship;merge(p.ships,m.ships);world.planets[p.id]=p;stay=true;sendReport(player,{type:'fleet',at:now,title:'殖民成功',body:`新的殖民地已建立 [${m.position.join(':')}]。`});
    }else sendReport(player,{type:'fleet',at:now,title:'殖民失败',body:occupied?'目标星球已被占领。':'殖民地数量已达上限。'});
  }
  if(m.task==='mine'){
    const capacity=(m.ships.Recycler||0)*units.Recycler.cargo;
    const amount=Math.floor(capacity*Math.min(1,(m.holdHours||1)*.25));
    m.cargo=[Math.floor(amount*.7),amount-Math.floor(amount*.7),0];
    sendReport(player,{type:'fleet',at:now,title:'小行星采矿完成',body:`采矿舰队已离开 [${m.position[0]}:${m.position[1]}] 小行星带。`,cargo:m.cargo});
  }
  if(m.task==='explore'){
    const outcome=explore(m.ships,m.seed,m.holdHours||1,player.tech);
    m.ships=outcome.ships;m.cargo=outcome.cargo;m.returnFactor=outcome.returnFactor;
    player.darkMatter=(player.darkMatter||0)+outcome.darkMatter;player.parts=(player.parts||0)+outcome.parts;
    if(outcome.combat)sendReport(player,{type:'battle',at:now,title:'星云遭遇战',targetName:outcome.event==='pirates'?'海盗舰队':'外星舰队',position:m.position,attackerName:player.name,defenderName:outcome.event==='pirates'?'海盗舰队':'外星舰队',...outcome.combat,loot:zeros(),debris:zeros(),moonChance:0,moonCreated:false});
    sendReport(player,{type:'explore',at:now,title:'探索报告',body:outcome.body,event:outcome.event,cargo:m.cargo,darkMatter:outcome.darkMatter,parts:outcome.parts,foundShips:outcome.foundShips,holdHours:m.holdHours||1});
    if(!total(m.ships)){remove();return;}
  }
  if(stay){remove();return;}m.phase='return';m.start=now;m.end=now+Math.ceil(m.travel*(m.returnFactor||1));m.originPosition=m.position;
}
export function explore(fleet,seed,holdHours=1,technology={}){
  const rng=seeded(seed),roll=rng(),capacity=Math.min(rules.explorationCargoCap,Object.entries(fleet).reduce((n,[id,count])=>n+units[id].cargo*count,0)),strength=Math.min(rules.explorationStrengthCap,Object.entries(fleet).reduce((n,[id,count])=>n+units[id].strength*10*count,0));
  const result={event:'nothing',body:'舰队完成了星云测绘，没有发现可回收物资。',ships:{...fleet},cargo:zeros(),darkMatter:0,parts:0,foundShips:{},returnFactor:1};
  const reach=Math.min(1,strength/500000),holdBonus=Math.min(2,1+Math.log2(Math.max(1,holdHours))*.2);
  if(roll<.30){result.event='resources';const amount=Math.floor(Math.min(capacity,Math.max(500,capacity*(.15+rng()*.5)*holdBonus*reach))),resource=Math.floor(rng()*3);result.cargo[resource]=amount;result.body=`舰队回收了漂流的资源舱，获得${['金属','晶体','重氢'][resource]} ${amount}。`;}
  else if(roll<.45){result.event='darkMatter';result.darkMatter=Math.max(1,Math.floor((3+rng()*22)*holdBonus*(.2+.8*reach)));result.body=`探测器收集了 ${result.darkMatter} 单位暗物质。`;}
  else if(roll<.58){result.event='ships';const id=['Light_Fighter','Cargo_Ship','Heavy_Fighter','Large_Cargo_Ship','Cruiser'][Math.floor(rng()*5)],count=Math.max(1,Math.floor(Math.min(rules.explorationShipRewardCap,strength*(.02+rng()*.08)*holdBonus)/(units[id].strength*10)));if(count*units[id].strength*10<=rules.explorationShipRewardCap){result.foundShips[id]=count;result.ships[id]=(result.ships[id]||0)+count;}result.body=`舰队修复了无人漂流的${units[id].name}，${count} 艘舰船加入编队。`;}
  else if(roll<.65){result.event='parts';result.parts=1+(rng()<.15?1:0);result.body=`发现外星遗迹，获得 ${result.parts} 件外星部件。`;}
  else if(roll<.77){}
  else if(roll<.91){result.event=roll<.86?'pirates':'aliens';const factor=result.event==='pirates'?.35:.7,enemy={};for(const[id,count]of Object.entries(fleet))if(units[id].type==='combat')enemy[id]=Math.max(1,Math.floor(count*factor));if(!total(enemy))enemy.Light_Fighter=Math.max(1,Math.min(30,Math.ceil(strength/40000)));const enemyTech=Object.fromEntries(Object.entries(technology).map(([id,n])=>[id,Math.max(0,n+(result.event==='aliens'?2:-2))]));result.combat=battle(fleet,enemy,technology,enemyTech,seed^0xEAA);result.ships=result.combat.survivors.attacker;result.body=result.event==='pirates'?'舰队遭遇海盗伏击，战斗记录已传回。':'舰队遭遇外星舰队，战斗记录已传回。';}
  else if(roll<.98){result.event='navigation';result.returnFactor=rng()<.75?1.5+rng()*1.5:.5;result.body=result.returnFactor<1?'舰队发现了稳定捷径，返航时间缩短。':'星云干扰了导航，舰队返航时间延长。';}
  else{result.event='lost';result.ships={};result.body='舰队进入了异常引力区，全部信号消失。';}
  return result;
}
export function fleetQuote(player,p,ships,position,speed=100){
  const distance=position[0]!==p.position[0]?100:position[1]!==p.position[1]?Math.min(80,Math.abs(position[1]-p.position[1])*.3+12):Math.abs(position[2]-p.position[2]);
  const slowest=Math.min(...Object.keys(ships).map(id=>{const hyper=['Battleship','Dreadnought','Destroyer','Death_Star','Guardian'].includes(id)||(id==='Bomber'&&(player.tech.Hyperspace_Drive||0)>=8),impulse=['Heavy_Fighter','Cruiser','Colony_Ship','Bomber'].includes(id),drive=hyper?'Hyperspace_Drive':impulse?'Impulse_Drive':'Combustion_Drive';return units[id].speed*(1+(player.tech[drive]||0)*(hyper?.3:impulse?.2:.1));}));
  const seconds=Math.max(20,Math.ceil((22+distance*2.5)*Math.sqrt(10000/Math.max(100,slowest))*100/speed));
  const fuel=Math.max(1,Math.ceil(Object.entries(ships).reduce((n,[id,count])=>n+units[id].fuel*count,0)*.08*(1+distance/30)*(speed/100)**2));
  const capacity=Object.entries(ships).reduce((n,[id,count])=>n+units[id].cargo*count,0);
  return {seconds,fuel,capacity};
}
export function act(world,player,action,now=Date.now()){
  if(action.type==='dispatch')requireThat(action.position?.[0]===1,'仅开放第 1 银河');
  if(['jump','missile','scan'].includes(action.type)&&action.target)requireThat(world.planets[action.target]?.position[0]===1,'仅开放第 1 银河');
  advance(world,now);const p=world.planets[action.planet];if(p)migrateLayout(p);
  requireThat(['build','downgrade','research','ship','dispatch','renamePlanet','cancel','scan','jump','recall','read','readAll','rename','alliance','chat','purchase','missile','place'].includes(action.type),'操作不存在');
  if(['build','downgrade','research','ship','dispatch','renamePlanet','cancel','scan','jump','purchase','missile','place'].includes(action.type))requireThat(p?.owner===player.id,'无法操作此星球');
  if(action.type==='purchase'){
    const resource=Number(action.resource),size=Number(action.size),quantity=Number(action.quantity);
    requireThat(Number.isInteger(resource)&&resource>=0&&resource<=2&&[1,10,100].includes(size)&&Number.isInteger(quantity)&&quantity>=1&&quantity<=100,'商品无效');
    requireThat((player.darkMatter||0)>=size*quantity,'暗物质不足');player.darkMatter-=size*quantity;p.resources[resource]+=size*quantity*10000;
  }
  if(action.type==='build'||action.type==='research'){
    const isTech=action.type==='research',item=(isTech?tech:buildings)[action.id];requireThat(item,'目标不存在');
    requireThat(!isTech||!p.moon,'月球上不能研究科技');requireThat(isTech||!item.moon||p.moon,'只能在月球建造');
    requireThat(isTech||!p.moon||['Moon_Base','Wormhole_Generator','The_EU_X_Radar','Robotics_Facility','Shipyard','Metal_Storage','Crystal_Storage','Gas_Storage'].includes(item.id),'无法在月球建造');
    requireThat(isTech||p.moon||!isLegacyStorage(item.id),'仓库已并入对应开采综合体，请升级综合体');
    if(!isTech){const error=validateSurfaceSlot(p,item.id,action.slotId);requireThat(!error,error);}
    requireThat(!isTech?!p.buildQueue:!player.researchQueue,isTech?'已有研究进行中':'已有建筑正在建造');
    requireThat(prerequisites(item,p,player).every(r=>r.current>=r.level),'尚未满足前置条件');
    const current=isTech?(player.tech[item.id]||0):(p.buildings[item.id]||0);requireThat(!item.one||current===0,'建筑已经完成');
    if(!isTech){const next={...p,buildings:{...p.buildings,[item.id]:current+1}};requireThat(usedBuildingFields(next)<=fieldsAvailable(p),'建筑空间不足');}
    if(item.energy)requireThat(economy(p).supply>=item.energy*(item.factor||2)**current,'能源不足');
    let location=null;if(!isTech){const at=getLayout(p)[item.id];location=at&&!validatePlacement(p,item.id,...at)?at:findPlacement(p,item.id);requireThat(location,'没有空闲建筑位置');}
    const cost=costAt(item,current+1);requireThat(cost.every(Number.isSafeInteger),'等级超出范围');pay(p,cost);if(location){p.layout??={};p.layout[item.id]=location;}
    const q={id:item.id,level:current+1,start:now,end:now+duration(item,isTech?'tech':'build',p,current+1,world,player)*1000,planet:p.id,cost};if(!isTech&&!p.moon)q.slotId=surfaceLayout.slots[item.id].slotId;if(isTech)player.researchQueue=q;else p.buildQueue=q;
  }
  if(action.type==='downgrade'){
    const item=buildings[action.id],level=p.buildings[action.id]||0;requireThat(item&&level>0,'建筑不存在');requireThat(!p.buildQueue,'已有建筑正在建造');
    requireThat(p.moon||!isLegacyStorage(item.id),'仓库已并入对应开采综合体，不能单独拆除');
    requireThat(item.id!=='Research_Lab'||!player.researchQueue,'研究期间不能拆除实验室');requireThat(item.id!=='Shipyard'||!p.shipQueue.length,'造船期间不能拆除太空电梯');
    const next={...p,buildings:{...p.buildings,[item.id]:level-1}},lostFields=item.id==='Moon_Base'?3:item.id==='Terraformer'?5:0;
    requireThat(usedBuildingFields(next)<=fieldsAvailable(p)-lostFields,'请先拆除占用方圆的其他建筑');
    if(item.id==='Missile_Silo')requireThat(missileStorage(p)<=(level-1)*10,'导弹储位不足');
    const cost=costAt(item,level);pay(p,cost);p.buildQueue={id:item.id,level:level-1,mode:'downgrade',start:now,end:now+duration(item,'build',p,level)*1000,planet:p.id,cost};
  }
  if(action.type==='cancel'){
    requireThat(['build','research'].includes(action.kind),'舰船和防御建造不能取消');
    const q=action.kind==='research'?player.researchQueue:p.buildQueue;requireThat(q,'没有进行中的任务');requireThat(q.planet===p.id,'请在任务所在星球取消');add(p,q.cost);if(action.kind==='research')player.researchQueue=null;else p.buildQueue=null;
  }
  if(action.type==='ship'){
    const item=units[action.id],count=Number(action.count);requireThat(item&&Number.isInteger(count)&&count>0&&count<=10000,'数量无效');
    requireThat(prerequisites(item,p,player).every(r=>r.current>=r.level),'尚未满足前置条件');requireThat(p.shipQueue.length<8,'建造队列已满');
    if(item.id.endsWith('Shield_Dome'))requireThat(count===1&&!p.defense[item.id]&&!Object.values(world.battles||{}).some(b=>b.status==='active'&&b.target===p.id&&b.ships.some(s=>s.type===item.id&&s.hp>0))&&!p.shipQueue.some(q=>q.id===item.id),'每种护盾罩只能建造一个');
    if(item.missile)requireThat(missileStorage(p)+count*(item.id==='Interplanetary_Missile'?2:1)<=(p.buildings.Missile_Silo||0)*10,'导弹储位不足');
    if(item.parts)requireThat((player.parts||0)>=item.parts*count,'外星部件不足');
    pay(p,item.cost.map(v=>v*count));if(item.parts)player.parts-=item.parts*count;const each=duration(item,'ship',p),last=p.shipQueue.at(-1);const start=last?last.end+(last.remaining-1)*last.each*1000:now;p.shipQueue.push({id:item.id,count,remaining:count,each,start,end:start+each*1000});
  }
  if(action.type==='dispatch'){
    requireThat(world.missions.filter(m=>m.owner===player.id).length<1+(player.tech.Computer_Tech||0),'舰队派遣名额已满');
    const ships={};for(const[id,n]of Object.entries(action.ships||{})){requireThat(units[id]&&units[id].type!=='defense'&&id!=='Solar_Satellite'&&Number.isInteger(n)&&n>=0&&n<=(p.ships[id]||0),'舰船数量无效');if(n)ships[id]=n;}
    requireThat(total(ships)>0&&total(ships)<=20000,'请选择舰船');
    const position=action.position?.map(Number);requireThat(position?.length===3&&position.every(Number.isInteger)&&position[0]>=1&&position[0]<=9&&position[1]>=1&&position[1]<=499&&position[2]>=1&&position[2]<=16,'坐标无效');
    ensureSystemNpcs(world,position[0],position[1]);
    const target=action.target?world.planets[action.target]:Object.values(world.planets).find(t=>!t.moon&&t.position.join(':')===position.join(':'));
    requireThat(!target||target.position.join(':')===position.join(':'),'目标坐标不一致');requireThat(target?.id!==p.id,'不能向当前星球派遣');
    const task=action.task;requireThat(missionNames[task],'任务无效');
    requireThat(!['attack','spy','recycle','transport','deploy','destroyMoon'].includes(task)||!!target,'目标不存在');
    requireThat(!['attack','spy','destroyMoon'].includes(task)||target.owner!==player.id,'不能攻击自己的星球');
    requireThat(task!=='deploy'||target.owner===player.id,'只能驻扎自己的星球');
    requireThat(task!=='spy'||ships.Probe>0,'需要探测器');requireThat(task!=='recycle'||ships.Recycler>0,'需要回收船');
    if(task==='colonize'){requireThat(!target&&position[2]<=15&&ships.Colony_Ship>0,'需要殖民船和空闲星球');const reserved=world.missions.filter(m=>m.owner===player.id&&m.task==='colonize'&&m.phase==='outbound').length;requireThat(Object.values(world.planets).filter(t=>t.owner===player.id&&!t.moon).length+reserved<colonyLimit(player),'殖民名额已满');}
    requireThat(!['explore','mine'].includes(task)||position[2]===rules.explorationSlot,'请选择银河系中心或小行星带');
    requireThat(['explore','mine'].includes(task)||position[2]<=15,'此区域只能探索或采矿');
    requireThat(task!=='mine'||ships.Recycler>0,'小行星采矿需要回收舰');
    let holdHours=0;
    if(task==='explore'){const level=player.tech.Astrophysics_Tech||0;requireThat(world.missions.filter(m=>m.owner===player.id&&m.task==='explore').length<Math.floor(Math.sqrt(level)),'探索舰队名额已满');holdHours=Number(action.holdHours??1);requireThat(Number.isInteger(holdHours)&&holdHours>=1&&holdHours<=level,'探索停留时间超过科技等级');}
    if(task==='mine'){holdHours=Number(action.holdHours??1);requireThat(Number.isInteger(holdHours)&&holdHours>=1&&holdHours<=4,'采矿停留时间为1至4小时');}
    requireThat(task!=='destroyMoon'||(target.moon&&(ships.Death_Star||0)>0),'摧毁月球需要死星');
    const speed=Number(action.speed||100);requireThat([10,25,50,75,100].includes(speed),'速度无效');const quote=fleetQuote(player,p,ships,position,speed);
    const cargo=(action.cargo||zeros()).map(Number);requireThat(cargo.length===3&&cargo.every(n=>Number.isInteger(n)&&n>=0)&&cargo.reduce((a,b)=>a+b,0)<=quote.capacity,'货舱不足');
    requireThat(['transport','deploy','colonize'].includes(task)||cargo.every(n=>n===0),'此任务不能装载资源');
    pay(p,cargo.map((n,i)=>n+(i===2?quote.fuel:0)));for(const[id,n]of Object.entries(ships))p.ships[id]-=n;p.flightsUsed=(p.flightsUsed||0)+1;
    world.missions.push({id:uid(),owner:player.id,from:p.id,target:target?.id||null,position,task,ships,cargo,holdHours,phase:'outbound',start:now,end:now+quote.seconds*1000,travel:quote.seconds*1000,seed:Math.floor(Math.random()*4294967295)});
  }
  if(action.type==='recall'){const m=world.missions.find(m=>m.id===action.id&&m.owner===player.id);requireThat(m&&['outbound','holding','waiting'].includes(m.phase),'舰队无法召回');m.end=now+(['holding','waiting'].includes(m.phase)?m.travel:now-m.start);m.phase='return';m.start=now;}
  if(action.type==='read'){const r=player.reports.find(r=>r.id===action.id);if(r)r.read=true;}
  if(action.type==='readAll')for(const r of player.reports)r.read=true;
  if(action.type==='place'){requireThat(buildings[action.id],'建筑不存在');const error=validatePlacement(p,action.id,action.x,action.y);requireThat(!error,error);p.layout??={};p.layout[action.id]=[action.x,action.y];}
  if(action.type==='missile'){
    const target=world.planets[action.target],count=Number(action.count),range=5*(player.tech.Impulse_Drive||0)-1;
    requireThat(target&&!target.moon&&target.owner!==player.id,'目标无效');requireThat(target.position[0]===p.position[0]&&Math.abs(target.position[1]-p.position[1])<=range,'目标超出导弹射程');
    requireThat(Number.isInteger(count)&&count>0&&count<=(p.defense.Interplanetary_Missile||0),'导弹数量无效');
    const activeBattle=targetBattle(world,target),reserved=activeBattle?activeBattle.ships.filter(s=>s.side==='defender'&&s.hp>0&&units[s.type].type==='defense').map(s=>s.type):[];
    const targetIds=[...new Set([...Object.keys(target.defense).filter(id=>units[id]&&!units[id].missile),...reserved])],priority=action.priority;
    requireThat(!priority||targetIds.includes(priority),'优先目标无效');if(priority)targetIds.sort((a,b)=>a===priority?-1:b===priority?1:0);
    p.defense.Interplanetary_Missile-=count;const intercepted=Math.min(count,target.defense.Interceptor_Missile||0);target.defense.Interceptor_Missile=(target.defense.Interceptor_Missile||0)-intercepted;
    let damage=(count-intercepted)*12000*(1+(player.tech.Weapons_Tech||0)*.1);const armor=1+(world.players[target.owner]?.tech.Strength_Tech||0)*.1,losses={};
    if(activeBattle){const strike=strikeBattleDefenses(activeBattle,damage,targetIds);Object.assign(losses,strike.losses);damage=strike.remaining;}
    for(const id of targetIds){const lost=Math.min(target.defense[id]||0,Math.floor(damage/(units[id].strength*armor)));if(lost){losses[id]=lost;target.defense[id]-=lost;damage-=lost*units[id].strength*armor;}}
    const report={type:'missile',at:now,title:'星际导弹战报',body:`发射 ${count} 枚，拦截 ${intercepted} 枚。被摧毁的防御无法修复。`,position:target.position,launched:count,intercepted,losses};sendReport(player,report);if(world.players[target.owner])sendReport(world.players[target.owner],{...report,defending:true});
  }
  if(action.type==='rename'){requireThat(typeof action.name==='string'&&action.name.trim().length>=1&&action.name.trim().length<=16,'名称需为1–16个字符');player.name=action.name.trim();}
  if(action.type==='renamePlanet'){requireThat(typeof action.name==='string'&&action.name.trim().length>=1&&action.name.trim().length<=12,'名称需为1–12个字符');p.name=action.name.trim();}
  if(action.type==='alliance'){
    if(action.mode==='leave'){player.alliance=null;}
    else if(action.mode==='join'){requireThat(world.alliances.some(a=>a.id===action.id),'联盟不存在');player.alliance=action.id;}
    else{const name=String(action.name||'').trim();requireThat(name.length>=2&&name.length<=16,'联盟名称需为2–16个字符');requireThat(!world.alliances.some(a=>a.name===name),'联盟名称已存在');const alliance={id:uid(),name,founder:player.id};world.alliances.push(alliance);player.alliance=alliance.id;}
  }
  if(action.type==='chat'){const text=String(action.text||'').trim();requireThat(text.length>0&&text.length<=160,'消息需为1–160个字符');requireThat(action.channel!=='alliance'||player.alliance,'尚未加入联盟');world.chat.push({id:uid(),at:now,name:player.name,owner:player.id,text,alliance:action.channel==='alliance'?player.alliance:null});world.chat=world.chat.slice(-120);}
  if(action.type==='scan'){requireThat(p.moon&&(p.buildings.The_EU_X_Radar||0)>=3,'需要月球雷达3级');const target=world.planets[action.target];requireThat(target&&!target.moon,'目标无效');const range=(p.buildings.The_EU_X_Radar||0)**2-1;requireThat(target.position[0]===p.position[0]&&Math.abs(target.position[1]-p.position[1])<=range,'目标超出扫描范围');pay(p,[0,0,50000]);sendReport(player,{type:'scan',at:now,title:'月球雷达扫描',body:`[${target.position.join(':')}]`,fleets:world.missions.filter(m=>m.target===target.id&&m.phase==='outbound').map(m=>({task:m.task,ships:m.ships,end:m.end}))});}
  if(action.type==='jump'){const target=world.planets[action.target];requireThat(p.moon&&p.buildings.Wormhole_Generator&&target?.owner===player.id&&target.moon&&target.buildings.Wormhole_Generator,'两端月球需要虫洞发生器');requireThat(target.id!==p.id&&(p.jumpReady||0)<=now&&(target.jumpReady||0)<=now,'虫洞尚未冷却');requireThat(!action.cargo||action.cargo.every(n=>n===0),'空间跳跃不能携带资源');const ships=action.ships||{};requireThat(total(ships)>0,'请选择舰船');for(const[id,n]of Object.entries(ships))requireThat(units[id]&&units[id].type!=='defense'&&id!=='Solar_Satellite'&&Number.isInteger(n)&&n>=0&&n<=(p.ships[id]||0),'舰船数量无效');for(const[id,n]of Object.entries(ships)){p.ships[id]-=n;target.ships[id]=(target.ships[id]||0)+n;}joinDefenders(world,target);p.jumpReady=now+3600000;target.jumpReady=now+3600000;}
  return true;
}
export function snapshot(world,player,system=null){
  if(system)requireThat(system[0]===1,'仅开放第 1 银河');
  if(system)ensureSystemNpcs(world,...system);
  for(const p of Object.values(world.planets))if(p.owner===player.id)ensureSystemNpcs(world,p.position[0],p.position[1]);
  const mine=Object.values(world.planets).filter(p=>p.owner===player.id).map(p=>{
    const complexes=resourceComplexes(p);
    return {...p,biome:p.moon?null:planetType(p).id,layout:getLayout(p),layoutVersion:LAYOUT_VERSION,surfaceLayout:p.moon?null:surfaceLayout,surfaceLayoutVersion:p.moon?null:SURFACE_LAYOUT_VERSION,resourceComplexVersion:p.moon?null:RESOURCE_COMPLEX_VERSION,resourceComplexes:complexes,economy:economy(p),fields:fieldsAvailable(p),usedFields:usedBuildingFields(p),
      buildOptions:Object.fromEntries(Object.values(buildings).map(item=>{
        const level=p.buildings[item.id]||0,complex=complexes[item.id];
        return [item.id,{cost:costAt(item,level+1),seconds:duration(item,'build',p,level+1),downgradeCost:level?costAt(item,level):null,downgradeSeconds:level?duration(item,'build',p,level):0,energy:item.energy?item.energy*item.factor**level:0,...(complex?{native:complex.native,capacity:complex.capacity,nextCapacity:complex.nextCapacity}:{}),...(!p.moon&&isLegacyStorage(item.id)?{mergedInto:item.mergedInto,disabled:true}:{})}];
      })),
      researchOptions:Object.fromEntries(Object.values(tech).map(item=>{const level=player.tech[item.id]||0;return[item.id,{cost:costAt(item,level+1),seconds:duration(item,'tech',p,level+1,world,player),energy:item.energy?item.energy*item.factor**level:0}];}))};
  });
  const map=Object.values(world.planets).map(p=>({id:p.id,name:p.name,position:p.position,biome:p.moon?null:planetType(p).id,owner:p.owner,ownerName:world.players[p.owner]?.name||'守备舰队',moon:p.moon,parent:p.parent,npc:!!p.npc,npcSkin:p.npc&&!p.moon?p.npcSkin:null,commander:commanderInfo(world,p),debris:p.debris}));
  const occupied=new Set(map.filter(p=>!p.moon).map(p=>p.position.join(':')));
  for(const key of Object.keys(world.npcSystems||{})){
    const [galaxy,system]=key.split(':').map(Number),types=systemBiomes(world,galaxy,system);
    for(let slot=1;slot<=15;slot++){
      const position=[galaxy,system,slot];if(occupied.has(position.join(':')))continue;
      const biome=types[slot-1];map.push({id:null,name:`${planetTypes[biome].name} ${slot}`,position,biome,owner:null,ownerName:'无人',moon:false,npc:false,unoccupied:true,debris:zeros()});
    }
  }
  const inbound=world.missions.filter(m=>m.owner!==player.id&&world.planets[m.target]?.owner===player.id).map(m=>({id:m.id,task:m.task,phase:m.phase,position:m.position,end:m.end,start:m.start,battleId:m.battleId,fromPosition:world.planets[m.from]?.position,inbound:true}));
  const alliances=world.alliances.map(a=>({...a,members:Object.values(world.players).filter(p=>p.alliance===a.id).map(p=>p.name)}));
  const rankings=Object.values(world.players).map(p=>{
    const planets=Object.values(world.planets).filter(x=>x.owner===p.id);
    const points=Object.values(p.tech).reduce((a,b)=>a+b*100,0)+planets.reduce((n,x)=>n+Object.values(x.buildings).reduce((a,b)=>a+b*25,0)+Object.values(x.ships).reduce((a,b)=>a+b*5,0),0);
    return {name:p.name,planets:planets.filter(x=>!x.moon).length,points,alliance:world.alliances.find(a=>a.id===p.alliance)?.name};
  }).sort((a,b)=>b.points-a.points);
  return {now:world.at,battles:Object.values(world.battles||{}).filter(b=>b.status==='active'&&battleVisible(b,player.id)).map(battleSummary),factions,player:{id:player.id,name:player.name,home:player.home,tech:player.tech,researchQueue:player.researchQueue,alliance:player.alliance,darkMatter:player.darkMatter||0,parts:player.parts||0},planets:mine,map,missions:[...world.missions.filter(m=>m.owner===player.id),...inbound],reports:player.reports,alliances,chat:world.chat.filter(c=>!c.alliance||c.alliance===player.alliance),rankings};
}
