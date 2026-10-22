import {expeditionZones,expeditionRounds,expeditionSeconds,miningHourSeconds} from './expedition-rules.mjs';
import fs from 'node:fs';
import {planetTypes} from './planet-types.mjs';
import {shipArchive} from './ship-archive.mjs';
import {surfaceLayout} from './surface-layout.mjs';
import {advancedTechnologies,advancedShips,flagshipCenter} from './advanced-fleet.mjs';
import {arsenalTechnologies} from './arsenal-rules.mjs';
import {megastructureTechnologies,retiredMegastructureTechnologies} from './megastructure-technologies.mjs';
import technologyLore from './technology-lore.json' with {type:'json'};
import {technologyQuotes} from './technology-quotes.mjs';
import {defenseQuotes} from './defense-quotes.mjs';
import {areaWeaponRules,criticalChances} from './damage-amplification.mjs';

const source = JSON.parse(fs.readFileSync(new URL('../research/galaxy-empire-data.v1.json', import.meta.url), 'utf8'));
const buildingIds = ['Metal_Mine','Crystal_Mine','Gas_Mine','Solar_Plant','Metal_Storage','Crystal_Storage','Gas_Storage','Robotics_Facility','Shipyard','Research_Lab','Radar_Facility','Fusion_Reactor','Nanite_Factory','Alliance_Depot','Moon_Base','Wormhole_Generator'];
const descriptions = ['开采金属。','开采晶体。低温星球产量较高。','提取气体，供舰队和反应堆使用。','为殖民地提供能源。','提高金属储量上限。','提高晶体储量上限。','提高气体储量上限。','缩短建筑建造时间。','建造舰船及防御设施。','研究科技，提升帝国实力。','侦测向本星球飞来的舰队。','消耗气体，提供大量能源。','大幅缩短建造时间。','建立或加入联盟。','扩展月球建筑空间。','在拥有虫洞的月球之间传送舰队。'];
export const buildings = Object.fromEntries(buildingIds.map((id,i) => {
  const b = source.buildings.find(b => b.id === id);
  return [id,{id,name:b.name_zh_working,cost:b.base_cost_mcg?.map(x=>x??0)||[0,0,0],factor:b.cost_growth_candidate||2,req:b.prerequisites,atlas:i,description:descriptions[i],moon:['Moon_Base','Wormhole_Generator'].includes(id),one:b.maximum_level===1}];
}));
buildings.Crystal_Mine.description = '开采晶体，用于研究与舰船制造。';
buildings.Command_Center={id:'Command_Center',name:'主基地',cost:[1000,500,500],factor:2,req:[],atlas:16,description:'管理殖民地。'};
buildings.Shipyard.name='太空电梯';
buildings.Shipyard.description='地面电梯向轨道船坞运送物资，在空间站建造舰船。';
for(const [id,storageId,name]of [['Metal_Mine','Metal_Storage','金属开采综合体'],['Crystal_Mine','Crystal_Storage','晶体开采综合体'],['Gas_Mine','Gas_Storage','气体开采综合体']]){
  buildings[id].name=name;
  buildings[id].integratedStorage=storageId;
  buildings[id].costGrowthAfterLevel=10;
  buildings[id].costGrowthAfterFactor=1.25;
  buildings[id].description+=' 采集与仓储统一升级；专产星的优势矿产产量×3，辅助矿产产量×0.1；三类综合体都能开采和仓储。';
  buildings[storageId].mergedInto=id;
}
buildings.The_EU_X_Radar = {id:'The_EU_X_Radar',name:'月球雷达',cost:[20000,40000,20000],factor:2,req:[['Moon_Base',2]],atlas:10,moon:true,description:'扫描目标星球的舰队动向。'};
export const tech = Object.fromEntries(source.technologies.filter(t=>!t.version_group).map(t=>[t.id,{id:t.id,name:t.name_zh_working,cost:t.base_cost_mcg,factor:2,req:t.prerequisites,description:t.effect.split('；')[0],atlas:{Energy_Tech:3,Laser_Tech:11,Ion_Tech:11,Hyperspace_Tech:15,Plasma_Tech:11,Espionage_Tech:10,Computer_Tech:7,Astrophysics_Tech:14,Combustion_Drive:2,Impulse_Drive:8,Hyperspace_Drive:15,Weapons_Tech:8,Shielding_Tech:9,Strength_Tech:7}[t.id]}]));
buildings.Terraformer={id:'Terraformer',name:'地形改造器',cost:[0,50000,100000],factor:2,req:[['Nanite_Factory',1],['Energy_Tech',12]],atlas:7,description:'每级增加5方圆，自身占用1方圆。',energy:1000};
buildings.Missile_Silo={id:'Missile_Silo',name:'行星保障中心',cost:[20000,20000,1000],factor:2,req:[['Shipyard',1]],atlas:13,description:'生产炮塔、护盾与导弹，使用独立防务队列；升级提高生产速度，每级提供10个导弹储位，星际导弹占2位。'};
for(const b of Object.values(buildings))b.factor=({Metal_Mine:1.5,Solar_Plant:1.5,Crystal_Mine:1.6,Fusion_Reactor:1.8})[b.id]||2;
tech.Computer_Tech.description='每级增加1个舰队派遣名额。';
tech.Astrophysics_Tech.description='每级增加10个殖民名额，总上限为1+10×等级（含母星，不含月球）；首次成功殖民取得整个恒星系归属。探索舰队上限为等级的平方根，向下取整。';
tech.Intergalactic_Network={id:'Intergalactic_Network',name:'星际研究网络',cost:[240000,400000,160000],factor:2,req:[['Research_Lab',10],['Computer_Tech',8],['Hyperspace_Tech',8]],atlas:10,description:'每级连接另一颗行星上满足该项科技要求的研究实验室。'};
tech.Graviton_Tech={id:'Graviton_Tech',name:'引力子科技',cost:[0,0,0],factor:3,energy:300000,req:[['Research_Lab',12]],atlas:15,description:'研究需要300000能源，解锁死星。'};
buildings.Flagship_Center=flagshipCenter;
for(const [id,t]of Object.entries(advancedTechnologies))tech[id]={id,...t,factor:2,atlas:15,icon:`technology-generated/${id}.png`};
for(const [id,t]of Object.entries({...retiredMegastructureTechnologies,...megastructureTechnologies}))tech[id]={id,...t,factor:2};
for(const [id,t]of Object.entries(arsenalTechnologies))tech[id]={id,...t,factor:2,icon:'technology-generated/'+({Stellar_Energy_Mastery:'Phase_Energy',Stellar_Antimatter_Synthesis:'Antimatter_Containment',Stellar_Coherent_Optics:'Quantum_Command',Relativistic_Ballistics:'Advanced_Ship_Engineering',Extreme_Beam_Containment:'Metamaterial_Tech'}[id])+'.png'};
tech.Energy_Tech.description='作为能源装备、引擎和高级研究的前置技术；支持戴森云、恒星提取、工业、居住和船坞设施，12级支持星门。';
tech.Hyperspace_Tech.description='研究空间通道，支持超空间引擎及高级舰科研；6级支持二级监听阵列，10级支持星门和三级监听阵列。';
tech.Computer_Tech.description+=' 6级开放自动化控制研究；8/10/12级支持一至三级监听阵列，10级支持星门。';
tech.Astrophysics_Tech.description+=' 4级开放生态工程；6/8/10级支持白矮星提取，8/10/12级支持磁星提取。';
for(const [id,text]of Object.entries({
 Laser_Tech:'10/12/14级支持一至三级小行星工业带。',
 Strength_Tech:'8/10/12级支持一至三级小行星工业带。',
 Shielding_Tech:'支持居住带与恒星提取防护；磁星提取需要12/14/16级。',
 Plasma_Tech:'6/8/10级支持一至三级恒星资源提取器。',
 Espionage_Tech:'8/10/12级支持一至三级深空监听阵列。',
 Advanced_Ship_Engineering:'1/3/5级支持一至三级巨构船坞；单舰仍需满足自己的研究条件。',
 Metamaterial_Tech:'同时支撑戴森云、居住带、船坞以及白矮星和磁星提取设施。',
 Quantum_Command:'1级支持二级深空监听阵列，3级支持全银河监听。'
}))tech[id].description+=' '+text;
tech.Graviton_Tech.description='研究需要300000能源；关联月球改造与死星计划，当前尚未开放死星制造。';
for(const t of Object.values(tech)){t.lore=technologyLore[t.id]?.text||t.description;t.loreSource=technologyLore[t.id]?.source;t.quote=technologyQuotes[t.id];}
const unitOrder=['Light_Fighter','Heavy_Fighter','Cruiser','Battleship','Dreadnought','Bomber','Destroyer','Cargo_Ship','Large_Cargo_Ship','Colony_Ship','Recycler','Probe','Solar_Satellite','Rocket_Launcher','Light_Laser','Plasma_Cannon'];
const reqs={Cargo_Ship:[['Shipyard',2],['Combustion_Drive',2]],Colony_Ship:[['Shipyard',4],['Impulse_Drive',3]],Solar_Satellite:[['Shipyard',1]],Bomber:[['Shipyard',8],['Impulse_Drive',6],['Plasma_Tech',5]],Rocket_Launcher:[['Shipyard',1]],Light_Laser:[['Shipyard',2],['Energy_Tech',1],['Laser_Tech',3]],Heavy_Laser:[['Shipyard',4],['Energy_Tech',3],['Laser_Tech',6]],MK2_Cannon:[['Shipyard',6],['Energy_Tech',6],['Weapons_Tech',3],['Shielding_Tech',1]],Ion_Cannon:[['Shipyard',4],['Ion_Tech',4]],Plasma_Cannon:[['Shipyard',8],['Plasma_Tech',7]],Small_Shield_Dome:[['Shipyard',1],['Shielding_Tech',2]],Large_Shield_Dome:[['Shipyard',6],['Shielding_Tech',6]]};
export const units=Object.fromEntries(source.units.filter(u=>['civilian','combat','defense'].includes(u.type)&&!u.version_group).map(u=>[u.id,{id:u.id,name:u.name_zh_working,type:u.type,cost:u.cost_mcg,...u.base_stats,req:u.prerequisites||reqs[u.id]||[],splashMultipliers:{...u.partial_rapid_fire},atlas:unitOrder.includes(u.id)?unitOrder.indexOf(u.id):u.type==='defense'?15:0}]));
const screenshotNames={Cargo_Ship:'轻型运输舰',Large_Cargo_Ship:'重型运输舰',Colony_Ship:'殖民舰',Recycler:'回收舰',Light_Fighter:'轻型战机',Heavy_Fighter:'重型战机',Bomber:'行星轰炸机',Destroyer:'驱逐舰',MK2_Cannon:'磁轨炮',Ion_Cannon:'中子炮',Plasma_Cannon:'等离子炮塔',Small_Shield_Dome:'小型防护盾',Large_Shield_Dome:'大型防护盾'};
for(const[id,name]of Object.entries(screenshotNames))units[id].name=name;
Object.assign(units,advancedShips);
units.Cargo_Ship.fuel=10;units.Recycler.speed=2000;units.Battleship.fuel=250;units.Solar_Satellite.attack=0;units.Solar_Satellite.shield=0;
units.Dreadnought.splashMultipliers={Battleship:10,Cruiser:4,Heavy_Fighter:4,Large_Cargo_Ship:3,Cargo_Ship:3};
units.Destroyer.splashMultipliers={Dreadnought:2,Light_Laser:10};
units.Death_Star={id:'Death_Star',name:'死星',type:'combat',cost:[5000000,4000000,1000000],strength:900000,shield:50000,attack:200000,speed:200,cargo:1000000,fuel:1000,req:[['Shipyard',12],['Hyperspace_Drive',7],['Hyperspace_Tech',6]],splashMultipliers:{Dreadnought:15,Large_Cargo_Ship:250,Colony_Ship:250,Solar_Satellite:1250,Light_Fighter:200,Rocket_Launcher:20,Cargo_Ship:250,Cruiser:33},atlas:17};
units.Guardian={id:'Guardian',name:'守护者',type:'combat',cost:[1500000,1500000,500000],strength:250000,shield:100000,attack:5000,speed:1000,cargo:10000,fuel:1000,req:[['Shipyard',12],['Shielding_Tech',10],['Hyperspace_Tech',7]],splashMultipliers:{Dreadnought:2,Destroyer:2,Death_Star:10},atlas:18,parts:5};
units.Death_Star.req.push(['Graviton_Tech',1]);
// Temporarily outside the playable fleet; retain definitions for existing saves and replays.
for(const id of ['Death_Star','Guardian'])units[id].fleetAvailable=false;
// Screenshot conflicts were re-read on 2026-10-21; retain this project's screenshot baseline.
const screenshotDifferences={
 Cargo_Ship:'燃耗采用截图 10；Wiki 为 20。',
 Recycler:'战略基础航速采用截图 2,000；Wiki 为 7,500。',
 Solar_Satellite:'攻击 / 护盾采用截图 0 / 0；Wiki 为 1 / 1。',
 Battleship:'燃耗采用截图 250；Wiki 为 500。'
};
for(const u of Object.values(units))if(u.type!=='defense'&&!advancedShips[u.id]){
 u.statsSource='research/截图参数校准.md';u.statsLabel='基础六维：用户截图';
 u.economyLabel='制造成本与前置：当前单机目录';
 if(screenshotDifferences[u.id])u.statsNote=screenshotDifferences[u.id];
}
units.Interceptor_Missile={id:'Interceptor_Missile',name:'拦截导弹',type:'defense',missile:true,cost:[8000,0,2000],strength:1,shield:0,attack:0,speed:0,cargo:0,fuel:0,req:[['Missile_Silo',2]],atlas:13};
units.Interplanetary_Missile={id:'Interplanetary_Missile',name:'星际导弹',type:'defense',missile:true,cost:[12500,2500,10000],strength:1,shield:0,attack:12000,speed:0,cargo:0,fuel:0,req:[['Missile_Silo',4],['Impulse_Drive',1]],atlas:13};
for(const u of Object.values(units))if(u.type==='defense'){
 u.quote=defenseQuotes[u.id];
 u.productionFacility='Missile_Silo';
 u.req=u.req.map(([id,level])=>[id==='Shipyard'?'Missile_Silo':id,level]);
}
for(const u of Object.values(units)){u.splashMultipliers??={};if(['civilian','combat'].includes(u.type)&&!['Probe','Solar_Satellite'].includes(u.id)){u.splashMultipliers.Probe=5;u.splashMultipliers.Solar_Satellite=u.id==='Death_Star'?1250:5;}}
units.Heavy_Fighter.splashMultipliers.Cargo_Ship=3;
units.Death_Star.splashMultipliers.Destroyer=5;
delete units.Guardian.splashMultipliers.Probe;
delete units.Guardian.splashMultipliers.Solar_Satellite;
for(const [id,atlas]of Object.entries({Heavy_Laser:19,MK2_Cannon:20,Ion_Cannon:21,Small_Shield_Dome:22,Large_Shield_Dome:23}))units[id].atlas=atlas;
const weapon=(kind,name,technology)=>({kind,name,technology});
const armaments={
  Cargo_Ship:[weapon('shell','自卫机炮','Weapons_Tech')],
  Large_Cargo_Ship:[weapon('shell','自卫机炮','Weapons_Tech')],
  Colony_Ship:[weapon('shell','自卫炮','Weapons_Tech')],
  Recycler:[weapon('shell','自卫机炮','Weapons_Tech')],
  Light_Fighter:[weapon('laser','轻型激光炮','Laser_Tech')],
  Heavy_Fighter:[weapon('laser','重型激光炮','Laser_Tech')],
  Cruiser:[weapon('ion','离子炮','Ion_Tech')],
  Battleship:[weapon('shell','重型舰炮','Weapons_Tech')],
  Dreadnought:[weapon('laser','前置双激光炮','Laser_Tech')],
  Bomber:[weapon('plasma_bomb','等离子炸弹','Plasma_Tech')],
  Destroyer:[weapon('plasma','双等离子大炮','Plasma_Tech')],
  Death_Star:[weapon('beam','引力射线','Graviton_Tech')],
  Guardian:[weapon('beam','超空间能量束','Hyperspace_Tech')],
  Rocket_Launcher:[weapon('missile','火箭弹','Weapons_Tech')],
  Light_Laser:[weapon('laser','轻型激光炮','Laser_Tech')],
  Heavy_Laser:[weapon('laser','重型激光炮','Laser_Tech')],
  MK2_Cannon:[weapon('rail','磁轨炮','Weapons_Tech')],
  Ion_Cannon:[weapon('ion','中子炮','Ion_Tech')],
  Plasma_Cannon:[weapon('plasma','等离子炮','Plasma_Tech')],
  Interplanetary_Missile:[weapon('missile','星际导弹','Weapons_Tech')]
};
Object.assign(armaments,{
 Interceptor:[weapon('nuclear','核子大炮','Weapons_Tech')],
 Titanenergetic_Frigate:[weapon('advanced','中央主炮','Energy_Tech'),weapon('missile','舰载导弹','Weapons_Tech')],
 Devourer_Interceptor:[weapon('heavy','双重型主炮','Phase_Energy')],
 Iron_Behemoth:[weapon('swarm','蜂群与近防武器','Quantum_Command')],
 Reaper:[weapon('reaper','双束相位收割','Weapons_Tech')],
 Annihilator:[weapon('antimatter','反物质湮灭装置','Antimatter_Containment')]
});
for(const unit of Object.values(units)){unit.weapons=armaments[unit.id]||[weapon('none','无',null)];Object.assign(unit,areaWeaponRules(unit),{criticalChances:criticalChances(unit)});}
export const missionNames={attack:'攻击',spy:'侦察',recycle:'回收',transport:'运输',deploy:'驻扎',colonize:'殖民',explore:'银心黑洞探险',mine:'小行星采矿',destroyMoon:'摧毁月球'};
export const capacities=[10000,20000,40000,75000,140000,255000,470000,865000,1590000,2920000,5350000,9810000,18000000,33000000,60500000];
export const rules={economySpeed:30,fusionFuelSpeed:6,baseProduction:[20,10,0],moonStep:100000,moonCap:0.2,debrisRate:0.3,explorationHourSeconds:miningHourSeconds,explorationSeconds:expeditionSeconds,explorationSlot:16,recharge:false,researchSpeed:60,constructionSpeed:90};
export const publicCatalog={buildings,tech,units,missionNames,rules,expeditionZones,expeditionRounds,planetTypes,surfaceLayout,shipArchive:shipArchive(units)};
