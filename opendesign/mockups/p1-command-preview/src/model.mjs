import catalog from '../catalog.json' with {type:'json'};
import {costAt} from '../../../../game/economy-costs.mjs';
export const {buildings,units,tech,rules,capacities,planetTypes,surfaceLayout,modelBuildings}=catalog;
export const mines=['Metal_Mine','Crystal_Mine','Gas_Mine'];
export const groups={resource:['Metal_Mine','Crystal_Mine','Gas_Mine','Solar_Plant','Fusion_Reactor'],industry:['Robotics_Facility','Nanite_Factory','Shipyard','Research_Lab'],support:['Command_Center','Alliance_Depot','Radar_Facility','Missile_Silo','Terraformer']};
export const groupNames={resource:'资源与能源',industry:'工业与科研',support:'行政与保障'};
export const names=['金属','晶体','气体'];
export const number=n=>Math.floor(n||0).toLocaleString('en-US');
export const compact=n=>Math.abs(n)>=1e6?(n/1e6).toFixed(2)+' M':Math.abs(n)>=1e3?(n/1e3).toFixed(1)+' K':number(n);
export const clock=n=>{const s=Math.max(0,Math.ceil(n));return s>=3600?`${Math.floor(s/3600)}时 ${Math.floor(s%3600/60)}分`:s>=60?`${Math.floor(s/60)}分 ${s%60}秒`:`${s}秒`;};
export const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);
const cap=lv=>capacities[lv]??Math.floor(60500000*1.83**(lv-14));
export const label=id=>buildings[id]?.name||units[id]?.name||tech[id]?.name||id;
export const initialTech={Energy_Tech:8,Laser_Tech:10,Ion_Tech:5,Hyperspace_Tech:5,Plasma_Tech:7,Espionage_Tech:4,Computer_Tech:4,Astrophysics_Tech:4,Combustion_Drive:6,Impulse_Drive:6,Hyperspace_Drive:5,Weapons_Tech:6,Shielding_Tech:6,Strength_Tech:6};
function colony(id,name,biome,system,slot,levels,resources){return {id,name,biome,position:[1,system,slot],temperature:biome==='gas'?-80:22,fields:190,buildings:{Command_Center:1,Metal_Mine:10,Crystal_Mine:8,Gas_Mine:6,Solar_Plant:16,Robotics_Facility:6,Shipyard:9,Research_Lab:8,Radar_Facility:2,Missile_Silo:4,...levels},resources,ships:{Light_Fighter:48,Heavy_Fighter:16,Cruiser:8,Battleship:3,Cargo_Ship:12,Large_Cargo_Ship:6,Recycler:4,Probe:10,Colony_Ship:1},defense:{Rocket_Launcher:48,Light_Laser:24,Heavy_Laser:8,MK2_Cannon:4,Small_Shield_Dome:1},build:null,defenseQueue:[],plan:[],paused:true,template:'resource'};}
export function fresh(){
  const planets=[colony('demo-home','曙光','terrestrial',16,7,{},[1230000,850000,420000]),colony('demo-forge','赤炉','mercury',16,3,{Metal_Mine:13,Solar_Plant:9},[420000,180000,90000]),colony('demo-crystal','霜庭','mars',32,10,{Crystal_Mine:14,Solar_Plant:9},[2000,340000,12000]),colony('demo-gas','远望','gas',84,13,{Gas_Mine:11,Shipyard:4,Robotics_Facility:3},[220000,160000,540000])];
  planets[0].plan=[{id:'Solar_Plant',level:17},{id:'Metal_Mine',level:12},{id:'Research_Lab',level:9}];
  planets[1].build={id:'Metal_Mine',level:14,elapsed:58,duration:240,cost:costAt(buildings.Metal_Mine,14)};
  planets[2].plan=[{id:'Solar_Plant',level:13},{id:'Crystal_Mine',level:15}];
  return {version:1,screen:'construction',selected:'demo-home',speed:1,tech:{...initialTech},planets,missions:[{id:'mission-1',from:'demo-home',target:'远望',position:[1,84,13],task:'transport',phase:'outbound',elapsed:110,duration:420,ships:{Large_Cargo_Ship:4},cargo:[12000,6000,0],incoming:false},{id:'mission-2',from:'demo-crystal',target:'霜庭',position:[1,32,10],task:'attack',phase:'outbound',elapsed:170,duration:360,ships:{Cruiser:6,Light_Fighter:20},cargo:[0,0,0],incoming:true}],notice:''};
}
export function economy(p){
  const b=p.buildings,L=id=>b[id]||0,m=planetTypes[p.biome].multipliers;
  const supply=Math.floor(20*L('Solar_Plant')*1.1**L('Solar_Plant'))+(p.resources[2]>0?Math.floor(30*L('Fusion_Reactor')*1.15**L('Fusion_Reactor')):0);
  const demand=Math.ceil(mines.reduce((s,id,i)=>s+Math.min(1,m[i])*(i===2?20:10)*L(id)*1.1**L(id),0)+(L('Radar_Facility')>1?2*1.52**L('Radar_Facility'):0));
  const ratio=demand?Math.min(1,supply/demand):1;
  const rate=[(20+30*L(mines[0])*1.1**L(mines[0])*ratio)*m[0]*rules.economySpeed,(10+20*L(mines[1])*1.1**L(mines[1])*ratio)*m[1]*rules.economySpeed,10*L(mines[2])*1.1**L(mines[2])*Math.max(.1,1.44-.004*p.temperature)*ratio*m[2]*rules.economySpeed-(L('Fusion_Reactor')?10*L('Fusion_Reactor')*1.1**L('Fusion_Reactor')*rules.fusionFuelSpeed:0)];
  return {supply,demand,ratio,rate,capacity:mines.map(id=>cap(L(id))),fields:sum(b),fieldLimit:p.fields+5*L('Terraformer')};
}
export const stock=(s,p)=>s.planets.filter(x=>p.position[1]===16?x.position[1]===16:x.id===p.id).reduce((a,x)=>a.map((n,i)=>n+x.resources[i]),[0,0,0]);
function spend(s,p,cost){const members=s.planets.filter(x=>p.position[1]===16?x.position[1]===16:x.id===p.id);cost.forEach((amount,i)=>{for(const x of members){const n=Math.min(x.resources[i],amount);x.resources[i]-=n;amount-=n;}});}
export const requirements=(item,s,p)=>(item.req||[]).map(([id,level])=>({id,name:label(id),level,current:(tech[id]?s.tech:p.buildings)[id]||0}));
export function buildQuote(s,p,id){
 const item=buildings[id],level=(p.buildings[id]||0)+1,cost=costAt(item,level),req=requirements(item,s,p),eco=economy(p);
 const duration=Math.max(12,Math.ceil((cost[0]+cost[1])*1.44/(((p.buildings.Robotics_Facility||0)+1)*2**(p.buildings.Nanite_Factory||0)*rules.constructionSpeed)));
 const reason=item.one&&level>1?'已达到最高等级':req.some(x=>x.current<x.level)?'前置条件未满足':eco.fields>=eco.fieldLimit?'建设方圆不足':cost.some((n,i)=>n>stock(s,p)[i])?'资源不足':(item.energy||0)*level>eco.supply?'能源需求未满足':p.build?'本星建设队列忙碌':'';
 return {level,cost,duration,req,reason,next:economy({...p,buildings:{...p.buildings,[id]:level}})};
}
export function issues(s,p){const e=economy(p),out=[];if(e.ratio<1)out.push({type:'energy',text:'能源不足',detail:`供电效率 ${Math.round(e.ratio*100)}%`});if(s.missions.some(m=>m.incoming&&m.position.join(':')===p.position.join(':')&&m.phase==='outbound'))out.push({type:'threat',text:'舰队来袭',detail:'查看航行任务'});if(p.plan.length&&!p.build&&buildQuote(s,p,p.plan[0].id).reason==='资源不足')out.push({type:'resource',text:'资源不足',detail:'后续建设等待物资'});return out;}
export const taskNames={transport:'运输物资',attack:'攻击目标',spy:'侦察',recycle:'回收残骸',colonize:'殖民',explore:'银心探险',mine:'小行星采矿',deploy:'驻扎'};
export function targets(s,p,task){if(task==='explore')return [{id:'blackhole',name:'银心黑洞',position:[1,p.position[1],16],biome:'outpost'}];if(task==='mine'||task==='recycle')return [{id:'belt',name:task==='mine'?'小行星带':'轨道残骸',position:[1,p.position[1],16],biome:'outpost'}];if(task==='colonize')return [{id:'empty',name:'未殖民行星',position:[1,16,11],biome:'mars'}];return task==='attack'||task==='spy'?[{id:'npc',name:'废弃前哨',position:[1,16,9],biome:'outpost'}]:s.planets.filter(x=>x.id!==p.id);}
export function fleetQuote(s,p,draft){
 const entries=Object.entries(draft.ships).filter(([id,n])=>units[id]&&n>0),target=targets(s,p,draft.task).find(t=>t.id===draft.target),count=entries.reduce((n,[,v])=>n+v,0);
 const capacity=entries.reduce((n,[id,v])=>n+units[id].cargo*v,0),distance=target?target.position[1]!==p.position[1]?Math.min(80,Math.abs(target.position[1]-p.position[1])*.3+12):Math.abs(target.position[2]-p.position[2]):0;
 const slow=entries.length?Math.min(...entries.map(([id])=>{const u=units[id],hyper=['Battleship','Dreadnought','Destroyer'].includes(id)||(id==='Bomber'&&s.tech.Hyperspace_Drive>=8),impulse=['Heavy_Fighter','Cruiser','Colony_Ship','Bomber'].includes(id),drive=hyper?'Hyperspace_Drive':impulse?'Impulse_Drive':'Combustion_Drive';return u.speed*(1+(s.tech[drive]||0)*(hyper?.3:impulse?.2:.1));})):0;
 const seconds=Math.max(20,Math.ceil((22+distance*2.5)*Math.sqrt(10000/Math.max(100,slow))*100/draft.speed));
 const fuel=count?Math.max(1,Math.ceil(entries.reduce((n,[id,v])=>n+units[id].fuel*v,0)*.08*(1+distance/30)*(draft.speed/100)**2)):0;
 const cargo=['transport','deploy','colonize'].includes(draft.task)?draft.cargo:[0,0,0];
 const invalid=Object.entries(draft.ships).some(([id,n])=>!units[id]||units[id].type==='defense'||units[id].fleetAvailable===false||id==='Solar_Satellite'||!Number.isInteger(n)||n<0||n>(p.ships[id]||0))||cargo.some(n=>!Number.isFinite(n)||!Number.isInteger(n)||n<0)||![100,75,50,25,10].includes(draft.speed);
 const reason=!target?'选择目的地':invalid?'数量无效':!count?'选择出发舰船':s.missions.filter(m=>!m.incoming&&!['completed','arrived'].includes(m.phase)).length>=1+s.tech.Computer_Tech?'派遣名额已满':draft.task==='colonize'&&!draft.ships.Colony_Ship?'殖民需要殖民舰':draft.task==='recycle'&&!draft.ships.Recycler?'回收需要回收舰':sum(cargo)>capacity?'装载超过货舱容量':cargo.some((n,i)=>n+(i===2?fuel:0)>stock(s,p)[i])?'库存不足以支付货物与燃料':'';
 return {target,count,capacity,seconds,fuel,cargo,reason};
}
export function makeTemplate(p,type,growth='fixed',mode='append'){
 const b={...p.buildings};if(p.build)b[p.build.id]=p.build.level;if(mode==='append')p.plan.forEach(x=>b[x.id]=Math.max(b[x.id]||0,x.level));
 const native=planetTypes[p.biome].specialty,goals=type==='industry'?{Robotics_Facility:6,Shipyard:8}:type==='research'?{Robotics_Facility:4,Research_Lab:8}:type==='frontier'?{Robotics_Facility:2,Shipyard:4,Radar_Facility:3,Missile_Silo:2}:{Robotics_Facility:4};
 mines.forEach((id,i)=>goals[id]=type==='industry'?6:native===null||native===i?(type==='resource'?12:6):2);
 if(growth==='incremental')for(const id in goals){const main=type==='resource'?mines.includes(id)&&(native===null||mines[native]===id):type==='industry'?id==='Shipyard':type==='research'?id==='Research_Lab':['Shipyard','Radar_Facility'].includes(id);goals[id]=Math.min(50,Math.max(goals[id],(b[id]||0)+(main?5:2)));}
 const items=[];const ensure=(id,lv)=>{if((b[id]||0)>=lv)return;for(const [dep,n]of buildings[id].req)if(buildings[dep])ensure(dep,n);b[id]=lv;items.push({id,level:lv});};
 const order=[...mines.filter((_,i)=>native===null||native===i),...mines.filter((_,i)=>native!==null&&native!==i),...Object.keys(goals).filter(id=>!mines.includes(id))];
 for(let lv=1;lv<=Math.max(...Object.values(goals));lv++)for(const id of order){if(lv>goals[id]||(b[id]||0)>=lv)continue;const copy={...p,buildings:{...b,[id]:lv}};while(economy(copy).supply<economy(copy).demand&&(b.Solar_Plant||0)<50){ensure('Solar_Plant',(b.Solar_Plant||0)+1);copy.buildings.Solar_Plant=b.Solar_Plant;}ensure(id,lv);}
 return items;
}
export function planEstimate(p,items){const b={...p.buildings},cost=[0,0,0];if(p.build)b[p.build.id]=p.build.level;let upgrades=0;for(const x of items){for(let lv=(b[x.id]||0)+1;lv<=x.level;lv++){costAt(buildings[x.id],lv).forEach((n,i)=>cost[i]+=n);upgrades++;}b[x.id]=Math.max(b[x.id]||0,x.level);}return {cost,upgrades};}
function begin(s,p,id){const q=buildQuote(s,p,id);if(q.reason)throw Error(q.reason);spend(s,p,q.cost);p.build={id,level:q.level,cost:q.cost,elapsed:0,duration:q.duration};}
export function action(current,a){
 const s=structuredClone(current),p=s.planets.find(p=>p.id===(a.planet||s.selected));s.notice='';
 try{
 if(a.type==='select'){s.selected=a.id;return s;}
 if(a.type==='build'){begin(s,p,a.id);s.notice=label(a.id)+'已开始升级';}
 if(a.type==='cancelBuild'&&p.build){p.resources=p.resources.map((n,i)=>n+p.build.cost[i]);p.build=null;p.paused=true;s.notice='施工已取消，资源已返还；后续计划已暂停';}
 if(a.type==='planAdd'){if(!buildings[a.id]||!Number.isInteger(a.level)||a.level<1||a.level>50)throw Error('目标等级须为 1–50');p.plan.push({id:a.id,level:a.level});s.notice='目标已加入建设计划';}
 if(a.type==='planRemove')p.plan.splice(a.index,1);
 if(a.type==='planMove'){if(a.to>=0&&a.to<p.plan.length){const [item]=p.plan.splice(a.index,1);p.plan.splice(a.to,0,item);}}
 if(a.type==='planPause'){p.paused=!p.paused;s.notice=p.paused?'后续计划已暂停，当前施工继续':'建设计划已启用';}
 if(a.type==='template'){for(const id of a.ids){const x=s.planets.find(x=>x.id===id),items=makeTemplate(x,a.template,a.growth,a.mode);x.plan=a.mode==='replace'?items:[...x.plan,...items];x.template=a.template;}s.notice=`已更新 ${a.ids.length} 颗星球的建设计划，开工时扣费`;}
 if(a.type==='defense'){const u=units[a.id],n=a.count;if(!u||u.type!=='defense'||!Number.isInteger(n)||n<1||n>10000)throw Error('建造数量无效');if(p.defenseQueue.length>=8)throw Error('生产队列已满');if(requirements(u,s,p).some(x=>x.current<x.level))throw Error('前置条件未满足');if(u.id.endsWith('Shield_Dome')&&(n!==1||p.defense[u.id]||p.defenseQueue.some(q=>q.id===u.id)))throw Error('每种防护盾只能拥有一座');const cost=u.cost.map(v=>v*n);if(cost.some((v,i)=>v>stock(s,p)[i]))throw Error('资源不足');spend(s,p,cost);p.defenseQueue.push({key:crypto.randomUUID(),id:a.id,remaining:n,elapsed:0,each:Math.max(2,Math.ceil((u.cost[0]+u.cost[1])*1.44/(((p.buildings.Shipyard||0)+1)*rules.constructionSpeed)))});s.notice='已加入防务生产队列';}
 if(a.type==='dispatch'){const q=fleetQuote(s,p,a.draft);if(q.reason)throw Error(q.reason);spend(s,p,q.cargo.map((n,i)=>n+(i===2?q.fuel:0)));for(const [id,n]of Object.entries(a.draft.ships))p.ships[id]-=n;s.missions.push({id:crypto.randomUUID(),from:p.id,target:q.target.name,position:q.target.position,task:a.draft.task,phase:'outbound',elapsed:0,duration:q.seconds,ships:{...a.draft.ships},cargo:q.cargo,incoming:false});s.notice='舰队已出发';}
 if(a.type==='recall'){const m=s.missions.find(m=>m.id===a.id);if(m&&!m.incoming&&m.phase==='outbound'){m.duration=Math.max(20,m.elapsed);m.elapsed=0;m.phase='return';s.notice='舰队正在返航';}}
 }catch(e){return {...current,notice:e.message};}return s;
}
export function advance(current){if(!current.speed)return current;const s=structuredClone(current),dt=s.speed;
 for(const p of s.planets){const e=economy(p);p.resources=p.resources.map((n,i)=>Math.max(0,Math.min(e.capacity[i],n+e.rate[i]*dt/3600)));
 if(p.build){p.build.elapsed+=dt;if(p.build.elapsed>=p.build.duration){p.buildings[p.build.id]=p.build.level;p.build=null;}}
 while(p.plan.length&&(p.buildings[p.plan[0].id]||0)>=p.plan[0].level)p.plan.shift();
 if(!p.paused&&!p.build&&p.plan.length&&!buildQuote(s,p,p.plan[0].id).reason)begin(s,p,p.plan[0].id);
 let remaining=dt;while(remaining>0&&p.defenseQueue.length){const q=p.defenseQueue[0],step=Math.min(remaining,q.each-q.elapsed);q.elapsed+=step;remaining-=step;if(q.elapsed>=q.each){q.elapsed=0;q.remaining--;p.defense[q.id]=(p.defense[q.id]||0)+1;if(!q.remaining)p.defenseQueue.shift();}}
 }
 for(const m of s.missions){if(['arrived','completed'].includes(m.phase))continue;m.elapsed+=dt;if(m.elapsed<m.duration)continue;if(m.incoming){m.phase='arrived';continue;}if(m.phase==='return'){const p=s.planets.find(p=>p.id===m.from);for(const [id,n]of Object.entries(m.ships))p.ships[id]=(p.ships[id]||0)+n;p.resources=p.resources.map((n,i)=>n+m.cargo[i]);m.phase='completed';}else if(m.task==='transport'||m.task==='deploy'){const target=s.planets.find(p=>p.position.join(':')===m.position.join(':'));if(target){target.resources=target.resources.map((n,i)=>n+m.cargo[i]);m.cargo=[0,0,0];if(m.task==='deploy'){for(const [id,n]of Object.entries(m.ships))target.ships[id]=(target.ships[id]||0)+n;m.phase='completed';}else{m.phase='return';m.elapsed=0;}}else m.phase='arrived';}else{m.phase='arrived';}}
 return s;
}
