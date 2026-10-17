import {buildings} from './catalog.mjs';
import {planetType} from './planet-types.mjs';
import {surfaceLayout} from './surface-layout.mjs';
import {costAt} from './economy-costs.mjs';
import {storageEconomy} from './system-logistics.mjs';

export const PLAN_LIMIT=200;
export const developmentTemplates=[
  {id:'resource',name:'资源生产',description:'优势矿产至 12 级，机器人至 4 级；先补太阳能，再扩产。'},
  {id:'industry',name:'工业中心',description:'太空电梯至 8 级，机器人至 6 级，三类仓储综合体至少 6 级。'},
  {id:'research',name:'科研中心',description:'实验室至 8 级，机器人至 4 级，优势矿产至 6 级。'},
  {id:'frontier',name:'军事前哨',description:'太空电梯至 4 级，雷达至 3 级，保障中心至 2 级；不自动造舰或建防御。'}
];
const check=(ok,message)=>{if(!ok)throw Error(message);};
export const planOf=p=>p.constructionPlan||{items:[],paused:false,revision:0,template:null};
// Repair only the old generated gas-world bootstrap deadlock. Preserve paid
// jobs, pause state, resources and every later goal; repeated loading is inert.
export function repairLegacyBootstrap(world){
  for(const p of Object.values(world.planets)){
    const plan=p.constructionPlan;
    if(p.moon||p.biome!=='gas'||!plan?.template||plan.bootstrapVersion||p.buildings.Gas_Mine||plan.items[0]?.id!=='Robotics_Facility'||!plan.items.some(x=>x.id==='Gas_Mine'))continue;
    const b={...p.buildings,Gas_Mine:1},type=planetType(p);
    const demand=Math.ceil(['Metal_Mine','Crystal_Mine','Gas_Mine'].reduce((n,id,i)=>n+Math.min(1,type.multipliers[i])*(i===2?20:10)*(b[id]||0)*1.1**(b[id]||0),0)+((b.Radar_Facility||0)>1?2*1.52**b.Radar_Facility:0));
    let solar=b.Solar_Plant||0;while(solar<50&&Math.floor(20*solar*1.1**solar)<demand)solar++;
    const startup=[...(solar>(b.Solar_Plant||0)?[{id:'Solar_Plant',level:solar}]:[]),{id:'Gas_Mine',level:1}];
    const repaired=[...startup,...plan.items.filter(x=>!startup.some(y=>y.id===x.id&&x.level<=y.level))];
    if(repaired.length>PLAN_LIMIT)continue;
    plan.items=repaired;
    plan.bootstrapVersion=1;plan.revision++;plan.repairNote='已修复旧模板：先启动气体开采，再建机器人工厂。';
  }
}
export function validatePlanItems(items){
  check(Array.isArray(items)&&items.length<=PLAN_LIMIT,`计划最多 ${PLAN_LIMIT} 项`);
  return items.map(item=>{
    check(item&&Object.hasOwn(surfaceLayout.slots,item.id),'计划包含无效的行星建筑');
    check(Number.isInteger(item.level)&&item.level>=1&&item.level<=50&&(!buildings[item.id].one||item.level===1),'目标等级须为 1–50 的整数');
    check(costAt(buildings[item.id],item.level).every(Number.isSafeInteger),'等级超出范围');
    return {id:item.id,level:item.level};
  });
}
const projected=p=>{const b={...p.buildings};if(p.buildQueue)b[p.buildQueue.id]=p.buildQueue.level;return b;};
const planningBase=(p,mode)=>{
  const b=projected(p);
  if(mode==='append')for(const goal of planOf(p).items)b[goal.id]=Math.max(b[goal.id]||0,goal.level);
  return b;
};

// Templates become finite, editable plans. They never run a governor or spend
// resources during preview, and do not change a running construction job.
export function templateItems(p,template,mode='append',growth='fixed'){
  check(developmentTemplates.some(t=>t.id===template),'发展模板不存在');
  check(['append','replace'].includes(mode),'应用方式无效');
  check(['fixed','incremental'].includes(growth),'计划类型无效');
  check(!p.moon,'月球暂不支持发展模板');
  const b=planningBase(p,mode),items=[];
  const type=planetType(p),native=type.multipliers.map((_,i)=>type.specialty===null||type.specialty===i),mines=['Metal_Mine','Crystal_Mine','Gas_Mine'];
  const targets=template==='resource'?{Robotics_Facility:4}:template==='industry'?{Robotics_Facility:6,Shipyard:8}:template==='research'?{Robotics_Facility:4,Research_Lab:8}:{Robotics_Facility:2,Shipyard:4,Radar_Facility:3,Missile_Silo:2};
  mines.forEach((id,i)=>{targets[id]=template==='industry'?6:native[i]?(template==='resource'?12:6):2;});
  if(growth==='incremental')for(const id of Object.keys(targets)){
    const main=template==='resource'?mines.includes(id)&&native[mines.indexOf(id)]>0:template==='research'?id==='Research_Lab':template==='industry'?id==='Shipyard':['Shipyard','Radar_Facility'].includes(id);
    // Keep the existing minimum targets for young colonies. Mature colonies
    // receive a new finite tranche instead of repeating already-met targets.
    targets[id]=Math.min(50,Math.max(targets[id],(b[id]||0)+(main?5:2)));
    while(targets[id]>(b[id]||0)&&!costAt(buildings[id],targets[id]).every(Number.isSafeInteger))targets[id]--;
  }
  const ensure=(id,level)=>{
    if((b[id]||0)>=level)return;
    for(const [dep,n]of buildings[id].req)if(Object.hasOwn(buildings,dep))ensure(dep,n);
    b[id]=level;items.push({id,level});
  };
  const energy=()=>Math.ceil(mines.reduce((sum,id,i)=>sum+Math.min(1,type.multipliers[i])*(i===2?20:10)*(b[id]||0)*1.1**(b[id]||0),0)+((b.Radar_Facility||0)>1?2*1.52**b.Radar_Facility:0));
  const solar=()=>20*(b.Solar_Plant||0)*1.1**(b.Solar_Plant||0);
  const order=[...mines.filter((_,i)=>native[i]),...mines.filter((_,i)=>!native[i]),...Object.keys(targets).filter(id=>!mines.includes(id))];
  for(let level=1;level<=Math.max(...Object.values(targets));level++)for(const id of order){
    const target=targets[id];
    if(level>target||(b[id]||0)>=level)continue;
    const old=b[id];b[id]=level;
    const needed=energy();if(old===undefined)delete b[id];else b[id]=old;
    while(solar()<needed){check((b.Solar_Plant||0)<50,'所需太阳能电站超过计划等级上限，请降低升级目标');ensure('Solar_Plant',(b.Solar_Plant||0)+1);}
    ensure(id,level);
  }
  return validatePlanItems(items);
}
export function templatePreview(world,player,action){
  check(Array.isArray(action.planets)&&action.planets.length>0&&action.planets.length<=200,'请选择 1–200 颗星球');
  check(new Set(action.planets).size===action.planets.length,'不能重复选择星球');
  return action.planets.map(id=>{
    const p=world.planets[id];check(p?.owner===player.id&&p.position[0]===1,'无法操作此星球');
    const added=templateItems(p,action.template,action.mode,action.growth),old=planOf(p);
    const items=validatePlanItems(action.mode==='append'?[...old.items,...added]:added);
    const b=projected(p),cost=[0,0,0];let upgrades=0;
    for(const item of items){for(let n=(b[item.id]||0)+1;n<=item.level;n++){costAt(buildings[item.id],n).forEach((v,i)=>cost[i]+=v);upgrades++;}b[item.id]=Math.max(b[item.id]||0,item.level);}
    return {planet:id,name:p.name,revision:old.revision,basis:JSON.stringify(planningBase(p,action.mode)),items,added:added.length,upgrades,cost,paused:old.paused};
  });
}
export function editPlan(p,action){
  check(!p.moon,'月球暂不支持建设计划');
  const old=planOf(p);check(action.revision===old.revision,'计划已更新，请刷新后重试');
  const next={...old,items:old.items.map(x=>({...x})),revision:old.revision+1};
  if(action.mode==='add')next.items=validatePlanItems([...next.items,{id:action.id,level:action.level}]);
  else if(action.mode==='pause'){check(typeof action.paused==='boolean','暂停状态无效');next.paused=action.paused;}
  else if(action.mode==='clear'){next.items=[];next.template=null;}
  else {
    check(Number.isInteger(action.index)&&action.index>=0&&action.index<next.items.length,'计划项目已变化');
    if(action.mode==='remove')next.items.splice(action.index,1);
    else if(action.mode==='move'){
      check([-1,1].includes(action.direction),'移动方向无效');const to=action.index+action.direction;
      check(to>=0&&to<next.items.length,'不能移出计划');
      [next.items[action.index],next.items[to]]=[next.items[to],next.items[action.index]];
    }else if(action.mode==='level')next.items[action.index]=validatePlanItems([{id:next.items[action.index].id,level:action.level}])[0];
    else throw Error('计划操作无效');
  }
  p.constructionPlan=next;
}

export function planStatus(world,p,prepare,economy){
  const plan=planOf(p);
  if(p.moon)return {state:'unsupported',reason:'月球暂不支持建设计划'};
  if(plan.paused)return {state:'paused',reason:'计划已暂停'};
  if(p.buildQueue)return {state:'building',reason:'正在施工'};
  const item=plan.items.find(x=>(p.buildings[x.id]||0)<x.level);
  if(!item)return {state:'idle',reason:'建设闲置'};
  try{prepare(world,world.players[p.owner],p,item.id,world.at,undefined,true);return {state:'ready',reason:'等待开工'};}
  catch(error){
    if(error.message!=='资源不足')return {state:'blocked',reason:error.message};
    const cost=costAt(buildings[item.id],(p.buildings[item.id]||0)+1),e=storageEconomy(world,p,economy),missing=cost.map((n,i)=>Math.max(0,n-e.resources[i]));
    const canProduce=missing.every((n,i)=>!n||(e.rate[i]>0&&e.capacity[i]>=cost[i]));
    const wait=canProduce?Math.max(...missing.map((n,i)=>n?n/e.rate[i]*3600000:0)):Infinity;
    // Re-evaluate when fusion fuel runs out, since production then changes.
    const fuel=e.rate[2]<0&&e.resources[2]>0?e.resources[2]/-e.rate[2]*3600000:Infinity;
    const delay=Math.min(wait,fuel);
    return {state:'waiting',reason:'缺少'+missing.map((n,i)=>n?['金属','晶体','气体'][i]:'').filter(Boolean).join('、')+(canProduce?'，等待生产':'，需要补给或扩容'),wake:Number.isFinite(delay)?world.at+Math.max(1,Math.ceil(delay)):null};
  }
}

export function advancePlans(world,prepare,economy){
  const events=[];
  for(const p of Object.values(world.planets)){
    if(!p.constructionPlan||p.moon||p.position[0]!==1||!world.players[p.owner]||world.players[p.owner].bot)continue;
    const plan=p.constructionPlan;
    if(plan.paused||p.buildQueue)continue;
    while(plan.items.length&&(p.buildings[plan.items[0].id]||0)>=plan.items[0].level){plan.items.shift();plan.revision++;}
    if(!plan.items.length)continue;
    const status=planStatus(world,p,prepare,economy);
    if(status.state==='ready'){prepare(world,world.players[p.owner],p,plan.items[0].id,world.at);p.buildQueue.planned=true;}
    else if(status.wake)events.push({at:status.wake,kind:'plan'});
  }
  return events;
}
