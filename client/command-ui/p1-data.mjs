import {navigationQuote} from '../../game/fleet-navigation.mjs';
import {missileStorage} from '../../game/production.mjs';
import {expeditionZones,expeditionRounds} from '../../game/expedition-rules.mjs';
// Read-only UI projections. Actions and settlement remain in the game engine.
export const mineIds=['Metal_Mine','Crystal_Mine','Gas_Mine'];
export const moonBuildings=['Moon_Base','Wormhole_Generator','The_EU_X_Radar','Robotics_Facility','Shipyard','Flagship_Center','Missile_Silo','Metal_Storage','Crystal_Storage','Gas_Storage'];
export const sum=values=>Object.values(values||{}).reduce((n,v)=>n+(Number(v)||0),0);
export const available=p=>p.availableResources||p.resources||[0,0,0];
export function buildingItems(api,p){return Object.values(api.catalog.buildings).filter(b=>p.moon?moonBuildings.includes(b.id):!b.moon&&!b.mergedInto&&!!(p.surfaceLayout||api.catalog.surfaceLayout)?.slots[b.id]);}
export function requirements(api,item,p=api.planet){return (item.req||[]).map(([id,level])=>({id,name:api.catalog.buildings[id]?.name||api.catalog.tech[id]?.name||id,level,current:api.catalog.tech[id]?(api.state.player.tech[id]||0):(p.buildings[id]||0)}));}
export function buildingReason(api,item,p=api.planet){
 const option=p.buildOptions?.[item.id],level=p.buildings[item.id]||0;
 if(api.busy)return '提交中';if(!option||!buildingItems(api,p).some(b=>b.id===item.id))return '此处无法建设';if(option.disabled)return option.reason||'此设施已停止新建';
 if(p.buildQueue)return '当前施工尚未完成';if(item.one&&level)return '已达到最高等级';
 if(requirements(api,item,p).some(r=>r.current<r.level))return '前置条件未满足';
 const fieldChange=!p.moon&&item.integratedStorage&&level<(p.buildings[item.integratedStorage]||0)?0:1;
 if(p.usedFields+fieldChange>p.fields)return '建筑空间不足';if(option.energy>p.economy.supply)return '能源不足';
 if(option.cost.some((n,i)=>!Number.isSafeInteger(n)||n>available(p)[i]))return '资源不足';return '';
}
export function downgradeReason(api,item,p=api.planet){
 const option=p.buildOptions?.[item.id],level=p.buildings[item.id]||0;
 if(api.busy)return '提交中';if(!level||!option?.downgradeCost)return '建筑尚未建成';if(p.buildQueue)return '当前施工尚未完成';
 if(item.id==='Research_Lab'&&api.state.player.researchQueue)return '研究进行中';if(item.id==='Shipyard'&&p.shipQueue?.length)return '船坞仍在生产';if(item.id==='Flagship_Center'&&p.flagshipQueue?.length)return '旗舰中心仍在生产';
 const lost=item.id==='Moon_Base'?3:item.id==='Terraformer'?5:0;
 if(p.usedFields-1>p.fields-lost)return '请先拆除占用空间的其他建筑';
 if(item.id==='Missile_Silo'){
  if(p.defenseQueue?.length)return '保障中心仍在生产';
  const used=missileStorage(p);
  if(used>(level-1)*10)return '导弹储位不足';
 }
 if(option.downgradeCost.some((n,i)=>n>available(p)[i]))return '降级资源不足';return '';
}
export function projectedEconomy(api,p,id){
 if(p.moon)return p.economy;
 const b={...p.buildings,[id]:(p.buildings[id]||0)+1},L=id=>b[id]||0,m=api.catalog.planetTypes[p.biome]?.multipliers||[1,1,1];
 const solar=Math.floor(20*L('Solar_Plant')*1.1**L('Solar_Plant')),fusion=L('Fusion_Reactor')>0&&available(p)[2]>0?Math.floor(30*L('Fusion_Reactor')*1.15**L('Fusion_Reactor')):0;
 const supply=solar+fusion+(p.ships.Solar_Satellite||0)*Math.max(1,Math.floor((p.temperature+160)/6))+(p.economy.megastructureSupply||0);
 const demand=Math.ceil(mineIds.reduce((n,id,i)=>n+Math.min(1,m[i])*(i===2?20:10)*L(id)*1.1**L(id),0)+(L('Radar_Facility')>1?2*1.52**L('Radar_Facility'):0))+(p.economy.megastructureDemand||0);
 const ratio=demand?Math.min(1,supply/demand):1,speed=api.catalog.rules.economySpeed;
 return {supply,demand,ratio,rate:[(20+30*L('Metal_Mine')*1.1**L('Metal_Mine')*ratio)*m[0]*speed,(10+20*L('Crystal_Mine')*1.1**L('Crystal_Mine')*ratio)*m[1]*speed,10*L('Gas_Mine')*1.1**L('Gas_Mine')*Math.max(.1,1.44-.004*p.temperature)*ratio*m[2]*speed-(fusion?10*L('Fusion_Reactor')*1.1**L('Fusion_Reactor')*api.catalog.rules.fusionFuelSpeed:0)]};
}
export function quoteFleet(api,p,draft){
 const entries=Object.entries(draft.ships||{}).filter(([id,n])=>n>0&&api.catalog.units[id]);
 if(!entries.length)return {seconds:0,fuel:0,capacity:0,count:0};
 return {...navigationQuote(api.catalog.units,api.state.player.tech,p.position,draft.ships,draft.position,draft.speed,draft.task),count:entries.reduce((n,[,v])=>n+v,0)};
}
export function dispatchTarget(api,draft){return draft.target?api.state.map.find(p=>p.id===draft.target):api.state.map.find(p=>!p.moon&&p.position.join(':')===draft.position.join(':'));}
export function fleetIssues(api,p,draft,quote=quoteFleet(api,p,draft)){
 const issues=[],player=api.state.player,target=dispatchTarget(api,draft),task=draft.task,ships=draft.ships||{},own=(api.state.missions||[]).filter(m=>!m.inbound),pos=draft.position;
 if(own.length>=1+(player.tech.Computer_Tech||0))issues.push('舰队派遣名额已满');
 if(!Array.isArray(pos)||pos.length!==3||pos.some((n,i)=>!Number.isInteger(n)||n<1||n>[1,499,16][i]))issues.push('坐标无效：银河 1，恒星系 1–499，轨道 1–16');
 if(!api.catalog.missionNames[task])issues.push('任务无效');
 if(target?.id===p.id)issues.push('不能向当前星球派遣');
 if(target?.attackBlocked&&['attack','destroyMoon'].includes(task))issues.push(target.attackBlocked);
 if(target&&['attack','spy','destroyMoon'].includes(task)&&target.owner===player.id)issues.push('不能攻击自己的星球');
 if(['attack','spy','recycle','transport','deploy','destroyMoon'].includes(task)&&target?.unoccupied)issues.push('目标轨道没有可执行任务的星球');
 if(task==='deploy'&&target&&target.owner!==player.id)issues.push('只能驻扎自己的星球');
 if(task==='transport'&&target?.npc)issues.push('野怪据点不接收运输物资');
 if(task==='colonize'){
  if(target?.id||pos[2]>15)issues.push('殖民需要空闲行星轨道');
  if(target?.canColonize===false&&!target?.id||api.state.colonizationSystems&&!api.state.colonizationSystems.includes(pos[1]))issues.push('此恒星系不符合边境殖民规定');
  if((player.colonyCount||0)+(player.colonyReserved||0)>=player.colonyLimit)issues.push('殖民名额已满');
 }
 if(['mine','explore'].includes(task)?pos[2]!==api.catalog.rules.explorationSlot:pos[2]>15)issues.push(['mine','explore'].includes(task)?'探索与采矿需要轨道 16':'轨道 16 仅支持探索与采矿');
 if(task==='explore'){
  const zone=expeditionZones[draft.zone||'outer'],level=player.tech.Astrophysics_Tech||0;
  if(!zone)issues.push('探险区域无效');else if(level<zone.level)issues.push(`需要天体物理科技 ${zone.level} 级`);
  if(level>0&&own.filter(m=>m.task==='explore').length>=Math.floor(Math.sqrt(level)))issues.push('探索舰队名额已满');
  if(!expeditionRounds.includes(draft.rounds??1))issues.push('连跑轮数无效');
 }
 if(task==='mine'&&(!Number.isInteger(draft.holdHours)||draft.holdHours<1||draft.holdHours>4))issues.push('采矿作业时长为 30、60、90 或 120 分钟');
 if(![10,25,50,75,100].includes(draft.speed))issues.push('航速无效');
 if(quote.count<1||quote.count>20000)issues.push('请选择 1–20,000 艘舰船');
 if(Object.entries(ships).some(([id,n])=>!api.catalog.units[id]||api.catalog.units[id].type==='defense'||id==='Solar_Satellite'||!Number.isInteger(n)||n<0||n>(p.ships[id]||0)||(n>0&&api.catalog.units[id].fleetAvailable===false)))issues.push('派遣数量超出驻港舰队或包含不可派遣舰型');
 const required={spy:['Probe','探测器'],recycle:['Recycler','回收舰'],colonize:['Colony_Ship','殖民舰'],mine:['Recycler','回收舰'],destroyMoon:['Death_Star','死星']}[task];
 if(required&&!(ships[required[0]]>0))issues.push(`此任务需要${required[1]}`);
 if(task==='destroyMoon'&&target&&!target.moon)issues.push('摧毁月球必须选择月球目标');
 const cargo=['transport','deploy','colonize'].includes(task)?draft.cargo:[0,0,0];
 if(cargo.length!==3||cargo.some(n=>!Number.isInteger(n)||n<0)||sum(cargo)>quote.capacity)issues.push('装载数量超过货舱容量或格式无效');
 if(cargo.some((n,i)=>n+(i===2?quote.fuel:0)>available(p)[i]))issues.push('可用资源不足，气体需同时支付燃料与装载');
 return [...new Set(issues)];
}
