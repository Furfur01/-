import {stellarType} from './stellar-types.mjs';
import {arsenalFacilities} from './arsenal-rules.mjs';

export const MEGASTRUCTURES_VERSION=1;
const entry=(id,name,cost,hours,maxLevel=3)=>({id,name,cost,seconds:hours*3600,maxLevel});
export const megastructureCatalog={
 gate:entry('gate','星门',[30000000,20000000,10000000],6,1),
 dyson:entry('dyson','戴森云 / 戴森球',[100000000,80000000,30000000],12,5),
 extractor:entry('extractor','恒星资源提取器',[80000000,60000000,40000000],12),
 shipyard:entry('shipyard','巨构船坞',[120000000,100000000,50000000],18),
 listener:entry('listener','深空监听阵列',[40000000,80000000,40000000],8),
 industry:entry('industry','小行星工业带',[120000000,80000000,20000000],12),
 habitat:entry('habitat','环轨居住带',[20000000,15000000,5000000],4),
 ...arsenalFacilities
};
export const megaKey=p=>`${p.owner}:${p.position[0]}:${p.position[1]}`;
export const megaSystem=(world,p)=>p.owner?world?.megastructures?.systems?.[megaKey(p)]:null;
export const megaLevel=(world,p,id)=>megaSystem(world,p)?.structures?.[id]?.level||0;
export const habitatLevel=p=>p.orbitalHabitat?.level||0;
export const dysonSupply=(world,p)=>[0,50000,150000,400000,1000000,2500000][megaLevel(world,p,'dyson')];
export const habitatFields=p=>[0,80,200,400][habitatLevel(p)];
export const habitatDemand=p=>[0,20000,60000,150000][habitatLevel(p)];
export const industrialPower=level=>[0,20000,50000,100000][level];
export const isMegaShip=item=>item?.productionFacility==='Megastructure_Shipyard';
export const megaShipSeconds=(item,level=1)=>Math.max(2,Math.ceil((item.cost[0]+item.cost[1])*1.44/(900*2**Math.max(0,level-1))));
export function megaQuote(id,level){
 const item=megastructureCatalog[id],next=level+1;
 if(id==='dyson'&&next>=4)return {cost:next===4?[8e8,6e8,3e8]:[20e8,16e8,8e8],seconds:(next===4?48:72)*3600,level:next};
 return {cost:item.cost.map(n=>n*2**level),seconds:item.seconds*[1,1.5,2][level],level:next};
}
export function megaEffects(id,level,star='main'){
 if(!level)return {};
 if(id==='gate')return {instantTransfer:true,sharedResources:true};
 if(id==='dyson')return {supply:[0,50000,150000,400000,1000000,2500000][level]};
 if(arsenalFacilities[id])return {arsenal:true,dyson:arsenalFacilities[id].dyson};
 if(id==='extractor'){
  const gas={main:[0,4e6,10e6,20e6],red:[0,8e6,20e6,40e6],blue:[0,6e6,15e6,30e6]};
  return {power:industrialPower(level),gas:gas[star]?.[level]||0,whiteDwarf:star==='white'?[0,10,25,50][level]:0,magnetar:star==='magnetar'?[0,2,5,10][level]:0};
 }
 if(id==='shipyard')return {power:industrialPower(level),speed:2**(level-1),batches:8};
 if(id==='listener')return {radius:level===3?null:[0,5000,12000][level],galaxyWide:level===3,refreshSeconds:5};
 if(id==='industry')return {metal:[0,5e6,12.5e6,25e6][level],crystal:[0,3e6,7.5e6,15e6][level]};
 return {fields:[0,80,200,400][level],demand:[0,20000,60000,150000][level]};
}
export function systemMegaRate(world,p){
 const system=megaSystem(world,p);if(!system||system.inheritedNativeIndustry)return [0,0,0];
 const industry=megaEffects('industry',system.structures.industry?.level||0),extractor=megaEffects('extractor',system.structures.extractor?.level||0,stellarType(p.position[1]).id);
 return [industry.metal||0,industry.crystal||0,extractor.gas||0];
}
const fmt=n=>n>=10000?`${n/10000}万`:String(n);
export function effectText(id,e){
 if(!Object.keys(e).length)return '尚未建成';
 if(e.arsenal)return id==='antimatterPlant'?'24小时合成24单位反物质燃料；需投入前驱晶和基础资源':'全银河不可拦截打击；命中留下永久不可殖民的死寂行星';
 if(id==='gate')return '本方星门自动联网；资源共享，舰队即时免费转移';
 if(id==='dyson')return `本恒星系每颗本方行星供电 +${fmt(e.supply)}`;
 if(id==='extractor')return `${e.gas?`气体 ${fmt(e.gas)}/小时`:e.whiteDwarf?`白矮星物质 ${e.whiteDwarf}/小时`:`磁星物质 ${e.magnetar}/小时`}；船坞供能 ${fmt(e.power)}`;
 if(id==='shipyard')return `高级舰制造速度 ×${e.speed}；工作供能 ${fmt(e.power)}；最多 ${e.batches} 批`;
 if(id==='listener')return `${e.galaxyWide?'整个银河系':`半径 ${e.radius}`}；${e.radius===5000?'位置、所属文明、航向':'舰型、数量、起终点、抵达时间'}；每 5 秒更新`;
 if(id==='industry')return `金属 ${fmt(e.metal)}/小时，晶体 ${fmt(e.crystal)}/小时`;
 return `建造空间 +${e.fields} 方圆；持续用电 ${fmt(e.demand)}`;
}
