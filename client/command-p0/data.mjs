import {createTechLayout} from './tech-layout.mjs';
import {shipRoles} from './ship-roles.mjs';
import {shipBuildSeconds,productionQueue,defenseQueue,missileStorage} from '../../game/production.mjs';
import {megaRequiredTech} from '../../game/megastructure-technologies.mjs';
import {megastructureCatalog} from '../../game/megastructure-rules.mjs';

// The research tree and construction validation consume the same thresholds.
export const megastructureUnlocks=Object.values(megastructureCatalog).flatMap(item=>
 (item.id==='extractor'?[['main','普通恒星'],['white','白矮星'],['magnetar','磁星']]:[['main','']]).map(([star,label])=>({
  id:item.id,key:`${item.id}:${star}`,name:item.name+(label?` · ${label}`:''),
  levels:Array.from({length:item.maxLevel},(_,i)=>({level:i+1,requirements:megaRequiredTech(item.id,i+1,star)}))
 })));

export function megastructureApplications(technology){
 const rows=megastructureUnlocks.filter(m=>m.levels.some(l=>l.requirements.some(([id])=>id===technology)));
 const extractors=rows.filter(m=>m.id==='extractor');
 const thresholds=m=>m.levels.map(l=>l.requirements.find(([id])=>id===technology)?.[1]||0);
 if(extractors.length===3&&extractors.every(m=>thresholds(m).every((n,i)=>n===thresholds(extractors[0])[i])))
  return rows.filter(m=>m.id!=='extractor'||m===extractors[0]).map(m=>m===extractors[0]?{...m,name:'恒星资源提取器'}:m);
 return rows;
}

export const number=n=>Math.floor(n||0).toLocaleString('en-US');
export const clock=n=>{const s=Math.max(0,Math.ceil(n));return [Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(v=>String(v).padStart(2,'0')).join(':');};
export const assetRoot='/opendesign/mockups/galactic-command/assets/p0';
export const asset=(kind,id)=>`${assetRoot}/${kind}/${id}.${kind==='models'?'glb':'png'}`;

export function createData(catalog,planet,player){
 const technologies=Object.values(catalog.tech).filter(t=>!t.retired),techById=catalog.tech;
 const ships=Object.values(catalog.units).filter(u=>u.fleetAvailable!==false);
 const treeLayout=createTechLayout(technologies),positions=treeLayout.positions;
 const requirements=(item,levels=player.tech)=>[...(item.productionFacility==='Megastructure_Shipyard'?[{id:'Megastructure_Shipyard',name:'巨构船坞',level:1,current:planet.megaShipyard?.level||0}]:[]),...(item.req||[]).map(([id,level])=>({id,level,name:id==='Shipyard'?'太空电梯':id==='Missile_Silo'?'行星保障中心':catalog.tech[id]?.name||catalog.buildings[id]?.name||id,current:catalog.tech[id]?(levels[id]||0):(planet.buildings[id]||0)}))];
 const techCost=id=>planet.researchOptions[id].cost;
 const buildSeconds=item=>item.productionFacility==='Megastructure_Shipyard'?planet.megaShipyard.secondsByShip[item.id]:shipBuildSeconds(item,planet,catalog.rules.constructionSpeed);
 const roles=Object.fromEntries(ships.map(s=>[s.id,shipRoles[s.id]||[{combat:'战斗舰船',civilian:'民用舰船',defense:'行星防御'}[s.type],s.id.replaceAll('_',' ').toUpperCase(),s.description||'部署于当前星球，为殖民地提供防御与战备保障。']]));
 return {catalog,planet,player,technologies,techById,ships,treeLayout,positions,requirements,techCost,buildSeconds,roles};
}

export function shipCapacity(item,data){
 const {planet:p,player,catalog}=data,stock=p.availableResources||p.resources;
 let max=Math.min(10000,...item.cost.map((n,i)=>n?Math.floor(stock[i]/n):10000));
 if(item.parts)max=Math.min(max,Math.floor((player.parts||0)/item.parts));
 if(item.strategic)max=Math.min(max,Math.floor((player.strategicResources?.[item.strategic.id]||0)/item.strategic.amount));
 if(item.id.endsWith('Shield_Dome'))max=Math.min(max,p.defense[item.id]||defenseQueue(p).some(q=>q.id===item.id)?0:1);
 if(item.missile){const used=missileStorage(p);max=Math.min(max,Math.floor(((p.buildings.Missile_Silo||0)*10-used)/(item.id==='Interplanetary_Missile'?2:1)));}
 return Math.max(0,max);
}

export function shipBlockReason(item,count,data,busy){
 const {planet:p,player}=data,stock=p.availableResources||p.resources;
 if(busy)return '正在提交';
 if(!Number.isInteger(count)||count<1||count>10000)return '请输入有效数量';
 if(item.productionFacility==='Megastructure_Shipyard'&&!p.megaShipyard?.level)return '请先建设同系巨构船坞';
 if(item.productionFacility==='Megastructure_Shipyard'&&!p.megaShipyard.powered)return '恒星提取器供能不足';
 if(item.moonOnly&&!p.moon)return '需要月球旗舰中心';
 if(data.requirements(item).some(r=>r.current<r.level))return '前置条件未满足';
 if(productionQueue(p,item).length>=8)return '生产队列已满';
 if(item.cost.some((n,i)=>n*count>stock[i]))return '资源不足';
 if(item.parts*count>(player.parts||0))return '外星部件不足';
 if(item.strategic&&item.strategic.amount*count>(player.strategicResources?.[item.strategic.id]||0))return item.strategic.name+'不足';
 if(item.id.endsWith('Shield_Dome')&&shipCapacity(item,data)<count)return '每种护盾罩限建一个';
 if(item.missile&&shipCapacity(item,data)<count)return '导弹储位不足';
 return '';
}

export function createView(api,selection){
 const p=api.planet,q=api.state.player.researchQueue,now=api.now;
 return {...selection,now,busy:api.busy,levels:api.state.player.tech,resources:p.availableResources||p.resources,owned:{...p.ships,...p.defense},
  queue:p.shipQueue.map((item,i)=>({...item,key:`${item.id}-${item.start}-${i}`,elapsed:Math.max(0,Math.min(item.each,(now-(item.end-item.each*1000))/1000))})),
  megaQueue:(p.megaShipyard?.queue||[]).map((item,i)=>({...item,key:`${item.id}-${item.start}-${i}`,elapsed:Math.max(0,Math.min(item.each,((p.megaShipyard.pausedAt??now)-(item.end-item.each*1000))/1000))})),
  flagshipQueue:(p.flagshipQueue||[]).map((item,i)=>({...item,key:`${item.id}-${item.start}-${i}`,elapsed:Math.max(0,Math.min(item.each,(now-(item.end-item.each*1000))/1000))})),
  research:q?{...q,duration:(q.end-q.start)/1000,elapsed:Math.max(0,Math.min(q.end-q.start,now-q.start)/1000)}:null};
}
