import {planetCapacities} from './resource-complexes.mjs';
import {megaLevel,systemMegaRate} from './megastructure-rules.mjs';
import {polity} from './sovereignty.mjs';

export const logisticsBuilding={name:'恒星系物流中心',cost:[5000,3000,1000],seconds:60};
export const logisticsKey=p=>`${p.owner}:${p.position[0]}:${p.position[1]}`;
export const logisticsCenter=(world,p)=>p.owner?world?.logisticsCenters?.[logisticsKey(p)]:null;
export function systemMembers(world,p){
  if(!p.owner)return [p];
  return Object.values(world.planets).filter(x=>x.owner===p.owner&&x.position[0]===p.position[0]&&x.position[1]===p.position[1]).sort((a,b)=>a.id.localeCompare(b.id));
}
export function storageMembers(world,p){
  if(megaLevel(world,p,'gate')===1)return Object.values(world.planets).filter(x=>x.owner===p.owner&&megaLevel(world,x,'gate')===1).sort((a,b)=>a.id.localeCompare(b.id));
  return logisticsCenter(world,p)?.level===1?systemMembers(world,p):[p];
}
const sum=(members,read)=>members.reduce((a,p)=>read(p).map((n,i)=>a[i]+n),[0,0,0]);
export const availableResources=(world,p)=>sum(storageMembers(world,p),p=>p.resources);
export const availableCapacity=(world,p)=>sum(storageMembers(world,p),planetCapacities);
const localFirst=(world,p)=>[p,...storageMembers(world,p).filter(x=>x.id!==p.id)];
// Each unit exists in exactly one physical store. The shared warehouse exposes
// their sum; it never copies balances into every planet or into the station.
export function spendResources(world,p,cost){
  if(!Array.isArray(cost)||cost.length!==3||!cost.every(n=>Number.isFinite(n)&&n>=0))throw Error('资源费用无效');
  const available=availableResources(world,p);
  if(!cost.every((n,i)=>available[i]>=n))throw Error('资源不足');
  const members=localFirst(world,p);
  cost.forEach((amount,i)=>{let left=amount;for(const member of members){const take=Math.min(left,member.resources[i]);member.resources[i]-=take;left-=take;if(left<=0)break;}});
}
export function depositResources(world,p,values){
  const members=localFirst(world,p);
  values.forEach((amount,i)=>{
    let left=amount||0;
    for(const member of members){const put=Math.min(left,Math.max(0,planetCapacities(member)[i]-member.resources[i]));member.resources[i]+=put;left-=put;if(left<=0)break;}
    // Preserve cargo, refunds and pre-existing over-capacity inventories.
    if(left>0)p.resources[i]+=left;
  });
}
export function storageEconomy(world,p,economy){
  const members=storageMembers(world,p);
  const rate=sum(members,p=>economy(p,world).rate),systems=new Set();
  for(const member of members){const key=logisticsKey(member);if(systems.has(key))continue;systems.add(key);systemMegaRate(world,member).forEach((n,i)=>rate[i]+=n);}
  return {resources:sum(members,p=>p.resources),capacity:sum(members,planetCapacities),rate,shared:logisticsCenter(world,p)?.level===1||megaLevel(world,p,'gate')===1,networked:megaLevel(world,p,'gate')===1};
}
export function integrateStorage(world,to,economy){
  const hours=(to-world.at)/3600000;if(hours<=0)return;
  const seen=new Set();
  for(const p of Object.values(world.planets)){
    if(p.npc||p.devastation||seen.has(p.id))continue;
    const members=storageMembers(world,p);members.forEach(x=>seen.add(x.id));
    const e=storageEconomy(world,p,economy);
    const delta=e.rate.map((rate,i)=>rate>0?Math.max(0,Math.min(e.capacity[i]-e.resources[i],rate*hours)):-Math.min(e.resources[i],-rate*hours));
    spendResources(world,p,delta.map(n=>Math.max(0,-n)));
    depositResources(world,p,delta.map(n=>Math.max(0,n)));
  }
  world.at=to;
}
export function logisticsAction(world,player,p,action,now){
  if(!p||p.owner!==player.id||p.moon||p.position[0]!==1)throw Error('请选择第 1 银河的本方行星建设物流中心');
  const key=logisticsKey(p),center=world.logisticsCenters?.[key];
  if(action.mode==='build'){
    if(center?.level||center?.queue)throw Error('本恒星系已有物流中心或正在建设');
    spendResources(world,p,logisticsBuilding.cost);
    world.logisticsCenters??={};
    world.logisticsCenters[key]={owner:player.id,position:p.position.slice(0,2),level:0,queue:{planet:p.id,start:now,end:now+logisticsBuilding.seconds*1000,cost:[...logisticsBuilding.cost]}};
  }else if(action.mode==='cancel'){
    if(!center?.queue)throw Error('没有进行中的物流中心建设');
    const source=world.planets[center.queue.planet];
    depositResources(world,source?.owner===player.id?source:p,center.queue.cost);
    delete world.logisticsCenters[key];
  }else throw Error('物流中心操作无效');
}
export function logisticsSnapshot(world,player,economy){
  const systems=new Map();
  for(const p of Object.values(world.planets))if(p.owner===player.id&&!p.moon&&p.position[0]===1&&!systems.has(logisticsKey(p)))systems.set(logisticsKey(p),p);
  return [...systems].map(([key,p])=>{
    const center=logisticsCenter(world,p),members=systemMembers(world,p),planets=members.filter(x=>!x.moon);
    const host=planets.find(x=>x.id===player.home)||planets.reduce((best,x)=>Math.min(...x.resources.map((n,i)=>n/logisticsBuilding.cost[i]))>Math.min(...best.resources.map((n,i)=>n/logisticsBuilding.cost[i]))?x:best,planets[0]);
    return {key,position:p.position.slice(0,2),level:center?.level||0,queue:center?.queue||null,host:host.id,members:members.map(x=>x.id),resources:sum(members,x=>x.resources),capacity:sum(members,planetCapacities),rate:sum(members,x=>economy(x,world).rate),cost:[...logisticsBuilding.cost],seconds:logisticsBuilding.seconds};
  });
}

// Sightseeing only: membership may name only bodies already present in this
// public star-map response. Private balances and construction jobs stay in the
// owner's logisticsSnapshot, never in this projection.
export function publicLogistics(world,publicPlanets){
  const visible=new Set(publicPlanets.filter(p=>p.id).map(p=>p.id)),groups=new Map();
  for(const p of Object.values(world.planets))if(p.owner&&visible.has(p.id)){
    const key=logisticsKey(p);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p);
  }
  const centers=[];
  for(const [key,center]of Object.entries(world.logisticsCenters||{})){
    if(!center.level||center.position[0]!==1)continue;
    const members=(groups.get(key)||[]).sort((a,b)=>a.id.localeCompare(b.id)),planets=members.filter(p=>!p.moon);
    if(!planets.length)continue;
    const host=planets.find(p=>p.id===center.host)||planets.find(p=>p.id===world.megastructures?.systems[key]?.host)||planets.find(p=>p.id===world.players[center.owner].home)||planets[0];
    centers.push({key,owner:center.owner,ownerName:polity(world,center.owner).name,position:[...center.position],host:host.id,level:center.level,members:members.map(p=>p.id)});
  }
  return centers;
}
