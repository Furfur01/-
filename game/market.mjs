import {distributeFees,equitySnapshot} from './exchange-equity.mjs';
import {randomUUID} from 'node:crypto';
import {marketKeys,marketNames,marketValues,marketRules,marketValue,marketFee,marketBlank} from './market-rules.mjs';
import {availableResources,spendResources,depositResources} from './system-logistics.mjs';
import {polity,attackRestriction} from './sovereignty.mjs';
import {units} from './catalog.mjs';

export const MARKET_VERSION=1;
const HOUR=3600000,active=o=>o.status==='open'||o.status==='accepted';
const check=(ok,message)=>{if(!ok)throw Error(message);};
const bundle=v=>{check(Array.isArray(v)&&v.length===9&&v.every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1e9),'挂单物资数量无效');return [...v];};
const sum=(a,b)=>a.map((n,i)=>n+b[i]);
const one=(i,n)=>marketBlank().map((_,j)=>i===j?n:0);
const stock=(w,p)=>[...availableResources(w,p),...marketKeys.slice(3).map(k=>w.players[p.owner].strategicResources?.[k]||0)];
const canPay=(w,p,v)=>v.every((n,i)=>stock(w,p)[i]>=n);
function debit(w,p,v){
 check(canPay(w,p,v),'库存不足，需同时备齐货物与手续费');spendResources(w,p,v.slice(0,3));
 for(let i=3;i<9;i++)if(v[i])w.players[p.owner].strategicResources[marketKeys[i]]-=v[i];
}
function credit(w,p,v){
 depositResources(w,p,v.slice(0,3));const player=w.players[p.owner];player.strategicResources??={};
 for(let i=3;i<9;i++)if(v[i])player.strategicResources[marketKeys[i]]=(player.strategicResources[marketKeys[i]]||0)+v[i];
}
const describe=v=>v.map((n,i)=>n?`${marketNames[i]} ${n.toLocaleString('zh-CN')}`:'').filter(Boolean).join('、');
function report(w,id,title,body){const p=w.players[id];if(!p||p.bot)return;p.reports.unshift({id:randomUUID(),type:'system',at:w.at,read:false,title,body});p.reports=p.reports.slice(0,100);}
function receiver(w,owner,preferred){const p=w.planets[preferred];return p?.owner===owner?p:w.planets[w.players[owner]?.home];}
const unitValue=id=>{const u=units[id];return u?marketValue([...u.cost,0,0,0,0,0,0])+(u.strategic?u.strategic.amount*marketValues[marketKeys.indexOf(u.strategic.id)]:0):0;};
const strength=p=>Object.entries({...p.ships,...p.defense}).reduce((s,[id,n])=>s+n*unitValue(id),0);
const damageFor=p=>Math.min(strength(p),Math.max(1000,Math.ceil(strength(p)*.25)));
const sameSide=(w,a,b)=>!!a&&!!b&&(polity(w,a)?.id===polity(w,b)?.id||!!w.players[a]?.alliance&&w.players[a].alliance===w.players[b]?.alliance);

export function migrateMarket(w,at=w.at){
 if(w.market?.version>=MARKET_VERSION)return;
 const guild=Object.values(w.players).find(p=>p.bot&&p.realm?.name==='自由港商盟');
 check(guild&&w.planets[guild.home]?.owner===guild.id,'自由港商盟资料缺失，停止商城迁移');
 // A one-time, local exchange guard. No human account or old fleet is replaced.
 const home=w.planets[guild.home];
 for(const [id,n]of Object.entries({Battleship:240,Destroyer:80}))home.ships[id]=(home.ships[id]||0)+n;
 for(const [id,n]of Object.entries({Plasma_Cannon:40,MK2_Cannon:80}))home.defense[id]=(home.defense[id]||0)+n;
 for(const key of ['Weapons_Tech','Shielding_Tech','Strength_Tech'])guild.tech[key]=Math.max(guild.tech[key]||0,12);
 w.market={version:MARKET_VERSION,operator:guild.id,createdAt:at,nextRefresh:at,orders:[],fees:marketBlank(),completed:0};
}
function publish(w,player,p,a,now){
 const kind=a.kind;check(['trade','supply','war'].includes(kind),'订单类型无效');
 check(w.market.orders.filter(o=>o.owner===player.id&&active(o)).length<marketRules.maxOrders,'最多同时保留 12 笔挂单或委托');
 const give=bundle(a.give),take=kind==='war'?marketBlank():bundle(a.take),feeIndex=a.feeIndex??0;
 check(Number.isInteger(feeIndex)&&feeIndex>=0&&feeIndex<9,'手续费物资无效');check(give.some(Boolean),'请提供货物或赏金');
 let target=null,minDamage=0,targetOwner=null;
 if(kind==='war'){
  const t=w.planets[a.target];check(t&&!t.moon&&t.position[0]===1&&(t.npc||t.owner)&&!sameSide(w,player.id,t.owner),'请选择非本方、非盟友的有效行星目标');
  check(!attackRestriction(w,t),attackRestriction(w,t));minDamage=damageFor(t);check(minDamage>=1000,'该目标守军太少，不能发布战争单');
  check(marketValue(give)>=minDamage*.1&&marketValue(give)<=minDamage*2,'战争赏金须为最低战损基准的 10%–200%');
  target=t.id;targetOwner=t.owner||null;
 }else{
  check(take.some(Boolean)&&!give.some((n,i)=>n&&take[i]),'双方各选至少一种不同物资');
  const ratio=marketValue(take)/marketValue(give);check(ratio>=marketRules.minRatio&&ratio<=marketRules.maxRatio,'交换价值须在基准的 50%–200% 之间');
 }
 const fee=one(feeIndex,marketFee(give,feeIndex)),escrow=sum(give,fee);debit(w,p,escrow);
 const o={id:randomUUID(),owner:player.id,planet:p.id,kind,give,take,fee,escrow,status:'open',createdAt:now,expires:now+marketRules.listingHours*HOUR,target,targetOwner,minDamage};
 w.market.orders.push(o);return o;
}
function refund(w,o,status){
 const p=receiver(w,o.owner,o.planet);check(p?.owner===o.owner,'原发布者收款基地不存在，无法退还托管');
 credit(w,p,o.escrow);o.escrow=marketBlank();o.status=status;o.closedAt=w.at;
 report(w,o.owner,status==='expired'?'商城订单到期退还':'商城订单已撤回',`货物及手续费已退还至${p.name}。`);
 if(o.taker)report(w,o.taker,status==='expired'?'委托已到期':'委托已撤销',`订单 ${o.id.slice(0,8)} 已结束，不再交付或计入战绩。`);
}
function settle(w,o,taker,p){
 const seller=receiver(w,o.owner,o.planet),guild=w.players[w.market.operator],bank=w.planets[guild.home];
 check(seller?.owner===o.owner&&bank?.owner===guild.id,'交易方收款基地不可用');
 check(canPay(w,p,o.take),'交付物资不足');
 debit(w,p,o.take);credit(w,seller,o.take);credit(w,p,o.give);distributeFees(w,o.fee,credit);
 w.market.fees=sum(w.market.fees,o.fee);w.market.completed++;o.escrow=marketBlank();o.status='completed';o.closedAt=w.at;o.taker=taker.id;o.delivery=p.id;
 report(w,taker.id,o.kind==='war'?'战争委托赏金已交割':'银河商城交割完成',`获得：${describe(o.give)}。${o.kind==='war'?'战绩已由商盟核验。':`交付：${describe(o.take)}。`}收货基地：${p.name}。`);
 report(w,o.owner,'银河商城订单完成',`${taker.name}已${o.kind==='war'?'完成战争目标':'交付 '+describe(o.take)}。商盟收取：${describe(o.fee)}。`);
}
function eligible(w,o,player){
 check(o.owner!==player.id,'不能接取自己的订单');
 if(o.kind==='war')check(!sameSide(w,player.id,o.targetOwner),'不能接取攻击本方或盟友的战争单');
}
export function marketAction(w,player,p,a){
 check(w.market,'商城尚未载入');check(!w.players[w.market.operator]?.defeatedAt,'商盟已失去所有基地，商城停止交割');
 if(a.mode==='publish')return publish(w,player,p,a,w.at);
 const o=w.market.orders.find(o=>o.id===a.order);check(o&&active(o)&&o.expires>w.at,'订单已结束或不存在');
 if(a.mode==='cancel'){check(o.owner===player.id&&o.status==='open','只能撤回自己尚未被接取的订单');refund(w,o,'cancelled');return;}
 if(a.mode==='release'){check(o.taker===player.id&&o.status==='accepted','不是你接取的委托');o.status='open';delete o.taker;delete o.acceptedAt;delete o.deadline;delete o.delivery;return;}
 eligible(w,o,player);
 if(a.mode==='fill'){check(o.kind==='trade'&&o.status==='open','该挂单不可成交');settle(w,o,player,p);return;}
 if(a.mode==='accept'){
  check(o.kind!=='trade'&&o.status==='open','委托已被接取或不能接取');
  if(o.kind==='war'){const t=w.planets[o.target];check(t&&(t.owner||null)===o.targetOwner&&!sameSide(w,o.owner,t.owner)&&!sameSide(w,player.id,t.owner),'目标归属或外交关系已变化');check(!attackRestriction(w,t),attackRestriction(w,t));check(!Object.values(w.battles||{}).some(b=>b.target===o.target&&b.status==='active'),'目标正在交战，请在新战斗前接取');}
  o.status='accepted';o.taker=player.id;o.delivery=p.id;o.acceptedAt=w.at;o.deadline=Math.min(o.expires,w.at+marketRules.contractHours*HOUR);return;
 }
 if(a.mode==='deliver'){check(o.kind==='supply'&&o.status==='accepted'&&o.taker===player.id&&o.deadline>w.at,'请先接取有效物资委托');settle(w,o,player,p);return;}
 throw Error('商城操作无效');
}
export function settleWarOrders(w,b,losses,at){
 if(!w.market||b.trial||b.winner!=='attacker'||w.market.orders.some(o=>o.battleId===b.id))return;
 const target=w.planets[b.target],loss=Object.entries(losses.defender).reduce((s,[id,n])=>s+n*unitValue(id),0);
 // A battle pays only one accepted bounty; replays and old victories cannot be submitted.
 const o=w.market.orders.find(o=>o.kind==='war'&&o.status==='accepted'&&o.taker===b.attacker&&o.target===b.target&&o.acceptedAt<=b.start&&o.deadline>at&&o.expires>at&&o.targetOwner===(target?.owner||null)&&!sameSide(w,o.owner,target?.owner)&&!sameSide(w,b.attacker,target?.owner)&&loss>=o.minDamage);
 if(!o)return;
 const p=receiver(w,o.taker,o.delivery);check(p?.owner===o.taker,'战争赏金收货基地不存在');settle(w,o,w.players[o.taker],p);o.battleId=b.id;
}
function makeNpcOrders(w,now){
 const guild=w.players[w.market.operator];
 for(const merchant of Object.values(w.players).filter(p=>p.bot&&!p.defeatedAt&&(p.cityState||p.id===guild.id))){
  const p=w.planets[merchant.home];if(!p||p.owner!==merchant.id||Object.values(w.battles||{}).some(b=>b.status==='active'&&b.target===p.id))continue;
  const list=(kind,give,take,extra={})=>{
   if(w.market.orders.some(o=>o.owner===merchant.id&&o.kind===kind&&active(o)))return;
   const fee=one(0,marketFee(give));if(!canPay(w,p,sum(give,fee)))return;
   publish(w,merchant,p,{kind,give,take,feeIndex:0,...extra},now);
  };
  const s=stock(w,p),material=s.findIndex((n,i)=>i>=3&&n>=120);
  if(material>=3)list('trade',one(material,6),one(0,Math.ceil(6*marketValues[material]*1.15)));
  else if(merchant.id===guild.id&&s[1]>=30000)list('trade',one(1,10000),one(0,17250));
  if(s[0]>=50000)list('supply',one(0,22000),one(2,10000));
 }
 const home=w.planets[guild.home];
 const target=Object.values(w.planets).filter(p=>p.npc&&!p.owner&&!p.moon&&p.position[0]===1&&damageFor(p)>=1000).sort((a,b)=>Math.abs(a.position[1]-home.position[1])-Math.abs(b.position[1]-home.position[1]))[0];
 if(target&&!w.market.orders.some(o=>o.owner===guild.id&&o.kind==='war'&&active(o))){
  const give=one(0,Math.ceil(damageFor(target)*.5));if(canPay(w,home,sum(give,one(0,marketFee(give)))))publish(w,guild,home,{kind:'war',give,target:target.id},now);
 }
 // NPCs buy only fairly priced player spot offers, using real surplus inventories.
 for(const o of w.market.orders.filter(o=>o.kind==='trade'&&o.status==='open'&&!w.players[o.owner].bot)){
  if(marketValue(o.give)<marketValue(o.take)*1.1)continue;
  const buyer=Object.values(w.players).find(p=>p.bot&&!p.defeatedAt&&(p.cityState||p.id===guild.id)&&!sameSide(w,p.id,o.owner)&&o.take.every((n,i)=>n<=Math.max(0,stock(w,w.planets[p.home])[i]-(i<3?10000:72))));
  if(buyer)settle(w,o,buyer,w.planets[buyer.home]);
 }
}
export function advanceMarket(w,to){
 if(!w.market)return;
 for(const o of w.market.orders)if(active(o)&&o.kind==='war'&&attackRestriction(w,w.planets[o.target]))refund(w,o,'cancelled');
 for(const o of w.market.orders)if(active(o)&&(o.expires<=to||o.status==='accepted'&&o.deadline<=to))refund(w,o,'expired');
 if(!w.players[w.market.operator]?.defeatedAt&&w.market.nextRefresh<=to){makeNpcOrders(w,to);w.market.nextRefresh=to+marketRules.refreshHours*HOUR;}
 // Escrow and active contracts are never pruned; closed history is bounded.
 const closed=w.market.orders.filter(o=>!active(o)&&o.status!=='suspended').sort((a,b)=>b.closedAt-a.closedAt).slice(0,100);
 w.market.orders=w.market.orders.filter(o=>active(o)||o.status==='suspended').concat(closed);
}
export function marketSnapshot(w,player){
 if(!w.market)return null;
 const guild=w.players[w.market.operator],home=w.planets[guild.home];
 return {suspended:!!guild.defeatedAt,equity:equitySnapshot(w,player),rules:marketRules,keys:marketKeys,names:marketNames,values:marketValues,nextRefresh:w.market.nextRefresh,operator:{id:guild.id,name:polity(w,guild.id).name,home:home.id,position:home.position,fees:w.market.fees,completed:w.market.completed,ships:home.ships},
  orders:w.market.orders.filter(o=>active(o)||o.owner===player.id||o.taker===player.id).map(o=>({...o,ownerName:polity(w,o.owner)?.name||w.players[o.owner].name,targetName:w.planets[o.target]?.name,targetPosition:w.planets[o.target]?.position,canTake:o.owner!==player.id&&(o.kind!=='war'||!sameSide(w,player.id,o.targetOwner))})),
  targets:Object.values(w.planets).filter(p=>!p.moon&&p.position[0]===1&&(p.npc||p.owner)&&!attackRestriction(w,p)&&!sameSide(w,player.id,p.owner)&&damageFor(p)>=1000).map(p=>({id:p.id,name:p.name,position:p.position,ownerName:polity(w,p.owner)?.name||'中立据点',minDamage:damageFor(p)}))};
}
