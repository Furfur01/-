import {randomUUID} from 'node:crypto';
import galaxyLayout from '../opendesign/mockups/planet-construction-review/galaxy-layout.json' with {type:'json'};
import {stellarType} from './stellar-types.mjs';
import {MEGASTRUCTURES_VERSION,megastructureCatalog,megaKey,megaSystem,megaLevel,megaQuote,megaEffects,effectText,industrialPower,isMegaShip,megaShipSeconds} from './megastructure-rules.mjs';
import {logisticsCenter,systemMembers,availableResources,availableCapacity,spendResources,depositResources,storageEconomy} from './system-logistics.mjs';
import {isTradePartner} from './diplomacy.mjs';
import {polity} from './sovereignty.mjs';
import {tech,buildings} from './catalog.mjs';
import {arsenalFacilities,calibrationSeconds} from './arsenal-rules.mjs';
import {megaRequiredTech} from './megastructure-technologies.mjs';

const check=(value,message)=>{if(!value)throw Error(message);};
const systemIds=Object.keys(megastructureCatalog).filter(id=>id!=='habitat');
export function migrateMegastructures(world,units={}){
 // No old fleet, facility, paid queue, account or planet is rewritten.
 if(world.megastructures)return;
 world.megastructures={version:MEGASTRUCTURES_VERSION,systems:{}};
 // Existing operational NPC specialty workshops keep their established
 // industrial capability. Their inherited extractors supply only the workshop;
 // they do not introduce new gas/material income or free player facilities.
 for(const player of Object.values(world.players).filter(isTradePartner)){
  const p=world.planets[player.home],deposit=world.strategic?.deposits.find(d=>world.strategic.mines[d.id]?.planet===p?.id);
  if(!p||!deposit)continue;
  const secondsByShip=Object.fromEntries(Object.values(units).filter(isMegaShip).map(item=>{
   const speed=item.id==='Iron_Behemoth'?10*(1+.25*Math.max(0,(p.buildings.Flagship_Center||1)-1)):((p.buildings.Shipyard||0)+1)*2**(p.buildings.Nanite_Factory||0);
   return [item.id,Math.max(2,Math.ceil((item.cost[0]+item.cost[1])*1.44/(speed*90)))];
  }));
  world.megastructures.systems[megaKey(p)]={owner:player.id,position:p.position.slice(0,2),host:p.id,structures:{shipyard:{level:1,queue:null},extractor:{level:1,queue:null}},shipQueue:[],inheritedNativeIndustry:{source:'strategic-native-workshop',planet:p.id,resource:deposit.resource,secondsByShip}};
  world.logisticsCenters??={};world.logisticsCenters[megaKey(p)]??={owner:player.id,position:p.position.slice(0,2),level:1,queue:null};
 }
}
const ownedHost=(world,system)=>{
 const p=world.planets[system.host];
 return p?.owner===system.owner?p:Object.values(world.planets).find(p=>p.owner===system.owner&&!p.moon&&p.position[0]===system.position[0]&&p.position[1]===system.position[1]);
};
const researchRequirements=(player,id,targetLevel,p)=>megaRequiredTech(id,targetLevel,stellarType(p.position[1]).id).map(([key,required])=>{const current=(tech[key]?player.tech:p.buildings)[key]||0;return {id:key,name:(tech[key]||buildings[key]).name,required,current,met:current>=required};});
export function megaBuildReason(world,player,p,id){
 const item=megastructureCatalog[id];if(!item)return '巨构类型无效';
 if(!p||p.owner!==player.id||p.moon||p.position[0]!==1)return '请选择第 1 银河的本方行星';
 const system=megaSystem(world,p),structure=id==='habitat'?p.orbitalHabitat:system?.structures[id],level=structure?.level||0;
 if(level>=item.maxLevel)return '已达最高等级';
 if(p.devastation)return '死寂行星不能建设';
 if((item.arsenal||id==='dyson'&&level>=3)&&player.bot)return '恒星武库仅向玩家开放';
 if(id==='dyson'&&level>=3&&!['main','red','blue'].includes(stellarType(p.position[1]).id))return '高阶戴森球需要主序星、红巨星或蓝巨星';
 if(item.arsenal){
  if(megaLevel(world,p,'dyson')<item.dyson)return `需要本恒星系 ${item.dyson} 级戴森球`;
  if(id==='missile'&&megaLevel(world,p,'shipyard')<3)return '需要本恒星系三级巨构船坞';
  if(id!=='antimatterPlant'&&!Object.values(world.megastructures?.systems||{}).some(s=>s.owner===player.id&&s.structures.listener?.level===3&&ownedHost(world,s)))return '需要运行中的三级深空监听阵列';
  if((player.stellarMaterials?.whiteDwarf||0)<item.materials[0]||(player.stellarMaterials?.magnetar||0)<item.materials[1])return '白矮星物质或磁星物质不足';
 }
 if(id==='habitat'?structure?.queue:Object.values(system?.structures||{}).some(s=>s.queue))return '已有巨构工程正在建设';
 if(id!=='habitat'&&logisticsCenter(world,p)?.level!==1)return '需要本恒星系物流中心';
 if(id==='listener'&&Object.values(world.megastructures?.systems||{}).some(s=>s.owner===player.id&&s!==system&&(s.structures.listener?.level||s.structures.listener?.queue)))return '每个文明只能拥有一座深空监听阵列';
 if(id==='shipyard'&&megaLevel(world,p,'extractor')<level+1)return `需要本恒星系 ${level+1} 级恒星资源提取器`;
 const missing=researchRequirements(player,id,level+1,p).find(r=>!r.met);if(missing)return `需要${missing.name} ${missing.required} 级（当前 ${missing.current} 级）`;
 const q=megaQuote(id,level);if(q.cost.some((n,i)=>availableResources(world,p)[i]<n))return '资源不足';
 return '';
}
export function megastructureAction(world,player,p,action,now){
 const id=action.id;check(Object.hasOwn(megastructureCatalog,id),'巨构类型无效');
 check(p?.owner===player.id&&!p.moon&&p.position[0]===1,'请选择第 1 银河的本方行星');
 if(action.mode==='build'){
  const reason=megaBuildReason(world,player,p,id);check(!reason,reason);
  const old=id==='habitat'?p.orbitalHabitat:megaSystem(world,p)?.structures[id],quote=megaQuote(id,old?.level||0);
  spendResources(world,p,quote.cost);migrateMegastructures(world);
  const materials=megastructureCatalog[id].materials;
  if(materials){player.stellarMaterials.whiteDwarf-=materials[0];player.stellarMaterials.magnetar-=materials[1];}
  const system=world.megastructures.systems[megaKey(p)]??={owner:player.id,position:p.position.slice(0,2),host:p.id,structures:{},shipQueue:[]};
  const structure=id==='habitat'?(p.orbitalHabitat??={level:0}):(system.structures[id]??={level:0});
  structure.queue={queueId:randomUUID(),planet:p.id,start:now,end:now+quote.seconds*1000,cost:quote.cost,level:quote.level,...(materials?{materials:[...materials],arsenal:true}:{})};
 }else if(action.mode==='cancel'){
  const structure=id==='habitat'?p.orbitalHabitat:megaSystem(world,p)?.structures[id],q=structure?.queue;
  check(q,'没有进行中的巨构工程');
  if(q.arsenal)check(action.queueId===q.queueId,'建设订单已变化');
  const source=world.planets[q.planet];check(source?.owner===player.id,'建设来源星球已不属于本方');
  depositResources(world,source,q.cost);structure.queue=null;
  if(q.materials){player.stellarMaterials.whiteDwarf+=q.materials[0];player.stellarMaterials.magnetar+=q.materials[1];}
 }else throw Error('巨构操作无效');
}
export function megaProductionState(world,p,units){
 const system=megaSystem(world,p),level=system?.structures.shipyard?.level||0;
 const power=industrialPower(system?.structures.extractor?.level||0),demand=industrialPower(level);
 return {level,host:system?.host||p.id,queue:system?.shipQueue||[],power,demand,powered:!!level&&power>=demand,paused:system?.pausedAt!=null,pausedAt:system?.pausedAt??null,secondsByShip:Object.fromEntries(Object.values(units).filter(isMegaShip).map(item=>[item.id,megaShipSeconds(item,level||1)]))};
}
export function queueMegaShip(world,player,p,item,count,now){
 const system=megaSystem(world,p),level=system?.structures.shipyard?.level||0;
 check(level,'需要本恒星系巨构船坞');
 check(industrialPower(system?.structures.extractor?.level||0)>=industrialPower(level),'恒星资源提取器供能不足');
 const host=ownedHost(world,system);check(host,'船坞交付星球不可用');
 const queue=system.shipQueue??=[];check(queue.length<8,'建造队列已满');
 const each=system.inheritedNativeIndustry?.secondsByShip[item.id]??megaShipSeconds(item,level),last=queue.at(-1),start=last?last.end+(last.remaining-1)*last.each*1000:now;
 // Caller has validated technology and special materials; debit before enqueue.
 spendResources(world,p,item.cost.map(n=>n*count));
 if(item.strategic)player.strategicResources[item.strategic.id]-=item.strategic.amount*count;
 queue.push({queueId:randomUUID(),id:item.id,count,remaining:count,each,start,end:start+each*1000,planet:host.id});
}
export function megastructureEvents(world){
 const events=[];
 for(const system of Object.values(world.megastructures?.systems||{})){
  for(const structure of Object.values(system.structures))if(structure.queue)events.push({at:structure.queue.end,kind:'megastructure',structure});
  const level=system.structures.shipyard?.level||0,powered=!!ownedHost(world,system)&&level&&industrialPower(system.structures.extractor?.level||0)>=industrialPower(level);
  if(system.shipQueue?.length){
   if(!powered&&system.pausedAt==null)system.pausedAt=world.at;
   if(powered&&system.pausedAt!=null){const delay=world.at-system.pausedAt;for(const q of system.shipQueue){q.start+=delay;q.end+=delay;}delete system.pausedAt;}
   if(powered)events.push({at:system.shipQueue[0].end,kind:'megaShip',system});
  }else delete system.pausedAt;
 }
 for(const p of Object.values(world.planets))if(p.orbitalHabitat?.queue)events.push({at:p.orbitalHabitat.queue.end,kind:'megastructure',structure:p.orbitalHabitat});
 return events;
}
export function finishMegaShip(world,system){
 const q=system.shipQueue[0],p=world.planets[q.planet];
 check(p?.owner===system.owner,'船坞交付星球已不属于本方');
 p.ships[q.id]=(p.ships[q.id]||0)+1;q.remaining--;
 if(q.remaining)q.end+=q.each*1000;else system.shipQueue.shift();
 return p;
}
export function finishMegastructure(structure,at){
 const q=structure.queue;structure.level=Math.max(structure.level,q.level);structure.queue=null;
 if(q.arsenal)structure.calibration={start:at,end:at+calibrationSeconds*1000};
}
export function integrateMegamaterials(world,to){
 const hours=(to-world.at)/3600000;if(hours<=0)return;
 for(const system of Object.values(world.megastructures?.systems||{})){
  if(system.inheritedNativeIndustry)continue;
  const p=ownedHost(world,system),owner=world.players[system.owner];if(!p||!owner)continue;
  const e=megaEffects('extractor',system.structures.extractor?.level||0,stellarType(system.position[1]).id);
  if(!e.whiteDwarf&&!e.magnetar)continue;
  owner.stellarMaterials??={whiteDwarf:0,magnetar:0};
  for(const id of ['whiteDwarf','magnetar'])owner.stellarMaterials[id]=(owner.stellarMaterials[id]||0)+(e[id]||0)*hours;
 }
}
export function stargateAction(world,player,p,action,units){
 const target=world.planets[action.target];
 check(p?.owner===player.id&&target?.owner===player.id&&p.id!==target.id,'请选择另一颗本方星球');
 check(p.position[0]===1&&target.position[0]===1,'仅开放第 1 银河');
 check(megaLevel(world,p,'gate')===1&&megaLevel(world,target,'gate')===1,'两端恒星系需要已建成的星门');
 const ships=action.ships||{};
 for(const [id,n]of Object.entries(ships))check(Object.hasOwn(units,id)&&units[id].type!=='defense'&&id!=='Solar_Satellite'&&units[id].fleetAvailable!==false&&Number.isSafeInteger(n)&&n>=0&&n<=(p.ships[id]||0),'舰船数量无效');
 const count=Object.values(ships).reduce((a,n)=>a+n,0);check(count>0&&count<=20000,'请选择 1–20,000 艘舰船');
 check(!action.cargo||action.cargo.every(n=>n===0),'联网资源已经共享，无需装载资源');
 for(const [id,n]of Object.entries(ships)){p.ships[id]-=n;target.ships[id]=(target.ships[id]||0)+n;}
 return target;
}
const visualStars=new Map(galaxyLayout.systems.map(s=>[s.id,s.position]));
const visualPoint=coords=>visualStars.get(coords?.[1]);
export function listenerSnapshot(world,player){
 const system=Object.values(world.megastructures?.systems||{}).find(s=>s.owner===player.id&&s.structures.listener?.level&&ownedHost(world,s));
 if(!system)return null;
 const level=system.structures.listener.level,center=visualStars.get(system.position[1]);
 const radius=level===3?Math.ceil(Math.max(...galaxyLayout.systems.map(s=>Math.hypot(s.position[0]-center[0],s.position[2]-center[2]))))+1:[0,5000,12000][level];
 const contacts=[];
 for(const m of world.missions){
  if(!['outbound','return'].includes(m.phase)||m.end<=world.at)continue;
  const home=world.planets[m.from],fromPosition=m.fromPosition||home?.position;
  if(fromPosition?.[0]!==system.position[0]||m.position?.[0]!==system.position[0])continue;
  const a=visualPoint(fromPosition),b=m.task==='explore'?[0,0,0]:visualPoint(m.position);if(!a||!b)continue;
  let t=Math.max(0,Math.min(1,(world.at-m.start)/(m.end-m.start)));
  if(m.phase==='return')t=m.recalledElapsed!=null?(m.recalledElapsed/Math.max(1,m.travel))*(1-t):1-t;
  const position=a.map((n,i)=>n+(b[i]-n)*t);
  if(level<3&&Math.hypot(position[0]-center[0],position[2]-center[2])>radius)continue;
  const distance=Math.hypot(...a.map((n,i)=>b[i]-n))||1,direction=a.map((n,i)=>(b[i]-n)/distance*(m.phase==='return'?-1:1));
  contacts.push({id:m.id,owner:m.owner,ownerName:world.players[m.owner]?.name||'未知文明',position,direction,...(level>=2?{ships:{...m.ships},fromPosition:[...fromPosition],targetPosition:[...m.position],start:m.start,end:m.end,phase:m.phase,task:m.task}:{})});
 }
 return {system:[...system.position],level,radius,center:[...center],contacts};
}
export function megastructureSnapshot(world,player,economy,units){
 const roots=new Map();for(const p of Object.values(world.planets))if(p.owner===player.id&&!p.moon&&p.position[0]===1&&!roots.has(megaKey(p)))roots.set(megaKey(p),p);
 const describe=(p,id)=>{
  const item=megastructureCatalog[id],s=id==='habitat'?p.orbitalHabitat:megaSystem(world,p)?.structures[id],level=s?.level||0,star=stellarType(p.position[1]).id;
  const effects=megaEffects(id,level,star),nextEffects=megaEffects(id,Math.min(item.maxLevel,level+1),star),quote=level<item.maxLevel?megaQuote(id,level):{cost:null,seconds:0};
  const reason=megaBuildReason(world,player,p,id);
  return {id,name:item.name,level,maxLevel:item.maxLevel,queue:s?.queue||null,calibration:s?.calibration||null,materials:item.materials||null,cost:quote.cost,seconds:quote.seconds,canBuild:!reason,reason,requirements:researchRequirements(player,id,Math.min(item.maxLevel,level+1),p),effects,nextEffects,effect:effectText(id,effects),nextEffect:effectText(id,nextEffects)};
 };
 const systems=[...roots].map(([key,p])=>{
  const system=megaSystem(world,p),host=system?ownedHost(world,system):p,storage=storageEconomy(world,p,economy);
  return {key,position:p.position.slice(0,2),host:host.id,name:`${p.position[1]} 号恒星系`,starType:stellarType(p.position[1]),resources:availableResources(world,p),capacity:availableCapacity(world,p),rate:storage.rate,members:systemMembers(world,p).map(p=>p.id),networked:megaLevel(world,p,'gate')===1,structures:Object.fromEntries(systemIds.map(id=>[id,describe(host,id)])),shipyard:megaProductionState(world,p,units)};
 });
 return {systems,habitats:Object.values(world.planets).filter(p=>p.owner===player.id&&!p.moon&&p.position[0]===1).map(p=>({planet:p.id,name:p.name,position:[...p.position],structure:describe(p,'habitat')})),materials:{whiteDwarf:player.stellarMaterials?.whiteDwarf||0,magnetar:player.stellarMaterials?.magnetar||0},listener:listenerSnapshot(world,player)};
}

// Public sightseeing data is deliberately projected field-by-field: no saved
// queue, account stock, fleet composition or listener contact reaches starMap.
export function publicMegastructures(world){
 const describe=(id,record)=>({id,name:megastructureCatalog[id].name,level:record.level,maxLevel:megastructureCatalog[id].maxLevel});
 const systems=[];
 for(const [key,system]of Object.entries(world.megastructures?.systems||{})){
  const activeHost=ownedHost(world,system),host=activeHost||world.planets[system.host];if(!host||system.position[0]!==1)continue;
  const structures=Object.fromEntries(systemIds.filter(id=>system.structures[id]?.level>0).map(id=>[id,describe(id,system.structures[id])]));
  if(!Object.keys(structures).length)continue;
  const level=system.structures.shipyard?.level||0,powered=!!activeHost&&!!level&&industrialPower(system.structures.extractor?.level||0)>=industrialPower(level);
  systems.push({key,owner:system.owner,ownerName:polity(world,system.owner).name,position:[...system.position],host:host.id,...(!activeHost?{dormant:true}:{}),structures,shipyard:{level,powered,active:powered&&system.pausedAt==null&&!!system.shipQueue?.length}});
 }
 const habitats=Object.values(world.planets).filter(p=>p.owner&&!p.moon&&p.position[0]===1&&p.orbitalHabitat?.level>0).map(p=>({planet:p.id,name:p.name,owner:p.owner,ownerName:polity(world,p.owner).name,position:[...p.position],structure:describe('habitat',p.orbitalHabitat)}));
 return {systems,habitats};
}
