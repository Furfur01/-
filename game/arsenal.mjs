import {randomUUID} from 'node:crypto';
import galaxyLayout from '../opendesign/mockups/planet-construction-review/galaxy-layout.json' with {type:'json'};
import {ARSENAL_VERSION,arsenalFacilities,arsenalWeapons,arsenalRecipes,chargeSeconds,deadWorldNames} from './arsenal-rules.mjs';
import {megaSystem} from './megastructure-rules.mjs';
import {spendResources,depositResources} from './system-logistics.mjs';
import {polity} from './sovereignty.mjs';
import {devastateWorld} from './desolation.mjs';

const check=(v,message)=>{if(!v)throw Error(message);};
const stars=new Map(galaxyLayout.systems.map(s=>[s.id,s.position]));
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const diameter=Math.max(...galaxyLayout.systems.map(a=>Math.max(...galaxyLayout.systems.map(b=>distance(a.position,b.position)))));
const host=(w,s)=>Object.values(w.planets).find(p=>!p.moon&&!p.devastation&&p.owner===s.owner&&p.position[0]===s.position[0]&&p.position[1]===s.position[1]);
const operational=(w,s,id)=>!!host(w,s)&&(s.structures.dyson?.level||0)>=arsenalFacilities[id].dyson&&s.structures[id]?.level===1&&!s.structures[id].calibration;
const listenerReady=(w,owner)=>Object.values(w.megastructures?.systems||{}).some(s=>s.owner===owner&&s.structures.listener?.level===3&&host(w,s));
const inventory=s=>s.arsenal??={fuel:0,missiles:0,ready:{},chargeQueue:[],production:{}};
export function strategicTargetReason(w,player,p){
 if(player.bot)return '恒星武库仅向玩家开放';
 if(!p||p.moon||p.position[0]!==1)return '请选择主银河的行星';
 if(p.devastation)return '目标已是永久不可殖民的死寂行星';
 if(!p.owner&&!p.npc)return '请选择敌方殖民地或据点';
 const owner=w.players[p.owner];
 if(p.owner===player.id||p.owner&&polity(w,p.owner).id===polity(w,player.id).id)return '不能打击本方行星';
 if(owner&&!owner.bot&&owner.home===p.id)return '个人账号母星受保护';
 if(owner?.alliance&&owner.alliance===player.alliance)return '不能打击盟友行星';
 return '';
}
export function strikeSeconds(kind,from,to){
 const fraction=Math.min(1,distance(stars.get(from[1]),stars.get(to[1]))/diameter);
 return Math.round((kind==='missile'?600:300)+(kind==='missile'?1200:600)*fraction);
}
function report(w,owner,value){const p=w.players[owner];if(!p)return;p.reports.unshift({id:randomUUID(),read:false,...value});p.reports=p.reports.slice(0,100);}
export function arsenalAction(w,player,p,a,now){
 check(!player.bot,'恒星武库仅向玩家开放');
 check(p?.owner===player.id&&!p.moon&&!p.devastation&&p.position[0]===1,'请选择主银河的本方行星');
 const s=megaSystem(w,p);check(s,'本恒星系尚无巨构');
 if(a.mode==='fire'){
  check(typeof a.requestId==='string'&&/^[a-zA-Z0-9_-]{8,80}$/.test(a.requestId),'缺少有效发射指令编号');
  const previous=w.arsenal?.strikes.find(x=>x.owner===player.id&&x.requestId===a.requestId);
  if(previous){check(previous.kind===a.id&&previous.target===a.target&&previous.system===`${s.owner}:${s.position.join(':')}`,'发射指令编号已用于其他目标');return;}
 }
 const st=inventory(s);
 if(a.mode==='produce'){
  const recipe=arsenalRecipes[a.id];check(recipe,'生产项目无效');
  check(operational(w,s,recipe.facility),'需要对应设施完成带载校准及戴森球供能');
  check(!st.production[a.id],'该生产线已有订单');
  check((player.strategicResources?.antimatter||0)>=recipe.precursor,'反物质前驱晶不足');
  check(st.fuel>=recipe.fuel,'反物质燃料不足');
  spendResources(w,p,recipe.cost);
  if(recipe.precursor)player.strategicResources.antimatter-=recipe.precursor;
  st.fuel-=recipe.fuel;
  st.production[a.id]={id:randomUUID(),kind:a.id,planet:p.id,start:now,end:now+recipe.seconds*1000,cost:[...recipe.cost],precursor:recipe.precursor,fuel:recipe.fuel,amount:recipe.amount};
 }else if(a.mode==='cancelProduction'){
  const q=st.production[a.id];check(q&&q.id===a.queueId,'生产订单已变化');
  depositResources(w,p,q.cost);player.strategicResources??={};player.strategicResources.antimatter=(player.strategicResources.antimatter||0)+q.precursor;st.fuel+=q.fuel;delete st.production[a.id];
 }else if(a.mode==='charge'){
  check(chargeSeconds[a.id],'该武器无需充能');check(operational(w,s,a.id),'武器尚未完成校准或戴森球供能不足');
  check(!st.ready[a.id]&&!st.chargeQueue.some(q=>q.kind===a.id),'该武器已经充能或正在排队');
  const start=Math.max(now,st.chargeQueue.at(-1)?.end||now);
  st.chargeQueue.push({id:randomUUID(),kind:a.id,start,end:start+chargeSeconds[a.id]*1000});
 }else if(a.mode==='fire'){
  check(arsenalWeapons.includes(a.id),'武器类型无效');check(operational(w,s,a.id),'武器尚未完成校准或戴森球供能不足');
  check(listenerReady(w,player.id),'需要运行中的三级深空监听阵列');
  const target=w.planets[a.target],reason=strategicTargetReason(w,player,target);check(!reason,reason);
  check(a.id==='missile'?st.missiles>0:st.ready[a.id],'武器尚未完成战备');
  if(a.id==='missile')st.missiles--;else st.ready[a.id]=false;
  w.arsenal??={version:ARSENAL_VERSION,strikes:[]};
  const strike={id:randomUUID(),requestId:a.requestId,owner:player.id,system:`${s.owner}:${s.position.join(':')}`,kind:a.id,from:p.id,fromPosition:[...p.position],target:target.id,targetName:target.name,targetOwner:target.owner,position:[...target.position],biome:target.biome,start:now,end:now+strikeSeconds(a.id,p.position,target.position)*1000,status:'flying'};
  w.arsenal.strikes.push(strike);
  report(w,player.id,{type:'arsenal',at:now,title:'战略打击已发射',body:`${arsenalFacilities[a.id].name}已向 ${target.name} 发射。攻击不可拦截或撤销。`,strikeId:strike.id,strike:{...strike},position:[...target.position]});
  if(target.owner)report(w,target.owner,{type:'arsenal',at:now,title:'战略打击预警',body:`${target.name}正在遭受不可拦截的恒星武器攻击。`,strikeId:strike.id,strike:{...strike},position:[...target.position]});
 }else throw Error('恒星武库操作无效');
}
// Pause only real interrupted work. Queue times are preserved and shifted on recovery.
function pause(q,powered,now){
 if(!powered&&q.pausedAt==null)q.pausedAt=now;
 if(powered&&q.pausedAt!=null){const delay=now-q.pausedAt;q.start+=delay;q.end+=delay;delete q.pausedAt;}
 return powered;
}
export function arsenalEvents(w){
 const events=[];
 for(const s of Object.values(w.megastructures?.systems||{})){
  const hasHost=!!host(w,s),dyson=s.structures.dyson?.level||0;
  for(const [id,f]of Object.entries(s.structures))if(f.calibration&&pause(f.calibration,hasHost&&dyson>=arsenalFacilities[id].dyson,w.at))events.push({at:f.calibration.end,kind:'arsenalCalibration',facility:f});
  const st=s.arsenal;if(!st)continue;
  for(const q of Object.values(st.production))if(pause(q,operational(w,s,arsenalRecipes[q.kind].facility),w.at))events.push({at:q.end,kind:'arsenalProduction',system:s,job:q});
  const first=st.chargeQueue[0];if(first){
   const powered=operational(w,s,first.kind),pausedAt=first.pausedAt;
   if(pause(first,powered,w.at)){if(pausedAt!=null)for(const q of st.chargeQueue.slice(1)){q.start+=w.at-pausedAt;q.end+=w.at-pausedAt;}
    events.push({at:first.end,kind:'arsenalCharge',system:s,job:first});}
  }
 }
 for(const strike of w.arsenal?.strikes||[])if(strike.status==='flying')events.push({at:strike.end,kind:'arsenalStrike',strike});
 return events;
}
export function finishArsenalEvent(w,e){
 if(e.kind==='arsenalCalibration'){delete e.facility.calibration;return;}
 if(e.kind==='arsenalProduction'){const st=e.system.arsenal;if(e.job.kind==='fuel')st.fuel+=e.job.amount;else st.missiles+=e.job.amount;delete st.production[e.job.kind];return;}
 if(e.kind==='arsenalCharge'){e.system.arsenal.ready[e.job.kind]=true;e.system.arsenal.chargeQueue.shift();return;}
 const strike=e.strike,target=w.planets[strike.target],reason=strategicTargetReason(w,w.players[strike.owner],target);
 if(reason){strike.status='void';strike.result=reason;}
 else{const result=devastateWorld(w,target,strike);strike.status='hit';strike.result=deadWorldNames[strike.kind];strike.losses=result;}
 strike.resolvedAt=e.at;
 const value={type:'arsenal',at:e.at,title:strike.status==='hit'?'恒星武库 · 命中确认':'恒星武库 · 打击结束',body:strike.status==='hit'?`${strike.targetName}已成为${strike.result}，永久不可殖民。`:strike.result,strikeId:strike.id,strike:{...strike},position:[...strike.position]};
 report(w,strike.owner,value);if(strike.targetOwner&&strike.targetOwner!==strike.owner)report(w,strike.targetOwner,value);
}
export function arsenalSnapshot(w,player){
 return {rangeDiameter:diameter,listenerReady:listenerReady(w,player.id),weapons:arsenalWeapons,recipes:arsenalRecipes,
  systems:Object.values(w.megastructures?.systems||{}).filter(s=>s.owner===player.id&&host(w,s)).map(s=>({key:`${s.owner}:${s.position.join(':')}`,position:[...s.position],galaxyPosition:stars.get(s.position[1]),fuel:s.arsenal?.fuel||0,missiles:s.arsenal?.missiles||0,ready:{...s.arsenal?.ready},chargeQueue:s.arsenal?.chargeQueue||[],production:s.arsenal?.production||{},operational:Object.fromEntries(Object.keys(arsenalFacilities).map(id=>[id,operational(w,s,id)]))})),
  strikes:(w.arsenal?.strikes||[]).filter(x=>x.owner===player.id||x.targetOwner===player.id).map(x=>({...x})),
  targets:Object.values(w.planets).filter(p=>!strategicTargetReason(w,player,p)).map(p=>({id:p.id,name:p.name,ownerName:w.players[p.owner]?.name||'中立据点',position:[...p.position],galaxyPosition:stars.get(p.position[1])}))};
}
