import {randomUUID} from 'node:crypto';
import {systemCoordinates} from './star-positions.mjs';
import {polity,claimSystem,systemTerritory} from './sovereignty.mjs';
import {availableResources,spendResources,depositResources} from './system-logistics.mjs';
import {strategicResources,strategicKeys,strategicRules} from './strategic-resources.mjs';
import {plannedNpcs} from './npc-types.mjs';
import {marketKeys,marketNames,marketValues} from './market-rules.mjs';

export const DIPLOMACY_VERSION=1;
const HOUR=3600000,stars=systemCoordinates(),byId=new Map(stars.map(s=>[s.id,s]));
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const check=(ok,message)=>{if(!ok)throw Error(message);};
export const tradeKeys=marketKeys;
export const tradeNames=marketNames;
export const isTradePartner=p=>!!p?.bot&&!p.defeatedAt&&(!p.commander?.factionId||p.commander.title==='大将军');
const emptyStock=()=>Object.fromEntries(strategicKeys.map(k=>[k,0]));
const planetsOf=(w,id)=>Object.values(w.planets).filter(p=>p.owner===id&&!p.moon&&!p.npc&&p.position[0]===1);
const freeSlot=(w,s)=>{
 const occupied=new Set([...Object.values(w.planets).filter(p=>!p.moon&&p.position[0]===1&&p.position[1]===s).map(p=>p.position[2]),...plannedNpcs(w,1,s).map(p=>p.slot),...w.missions.filter(m=>m.task==='colonize'&&m.phase==='outbound'&&m.position[0]===1&&m.position[1]===s).map(m=>m.position[2])]);
 return Array.from({length:15},(_,i)=>i+1).find(slot=>!occupied.has(slot));
};

// Additive migration: no existing colony, mission, queue, balance or identity is moved/reset.
export function migrateDiplomacy(w,createColony,activateAt=w.at){
 if(w.strategic?.version>=DIPLOMACY_VERSION)return;
 const safe=new Set(w.sovereignty.safeSystems),reserved=new Set(w.missions.filter(m=>m.task==='colonize'&&m.phase==='outbound').map(m=>m.position[1]));
 for(const player of Object.values(w.players)){
  if(!player.bot){check(w.planets[player.home]?.owner===player.id,'账号母星归属异常，停止战略资源迁移');for(const p of planetsOf(w,player.id))safe.add(p.position[1]);}
 }
 for(const region of ['iron','dawn']){
  const leader=Object.values(w.players).find(p=>p.bot&&p.commander?.factionId===region&&p.commander.title==='大将军');
  if(!leader)continue;
  const owner=polity(w,leader.id).id,holdings=Object.entries(w.sovereignty.claims).filter(([key,c])=>key.startsWith('1:')&&c.owner===owner).map(([key])=>Number(key.split(':')[1]));
  while(holdings.length<20){
   const candidates=stars.filter(s=>!safe.has(s.id)&&!reserved.has(s.id)&&!w.sovereignty.claims[`1:${s.id}`]&&!Object.values(w.planets).some(p=>p.owner&&p.position[0]===1&&p.position[1]===s.id));
   candidates.sort((a,b)=>Math.min(...holdings.map(id=>distance(a.position,byId.get(id).position)))-Math.min(...holdings.map(id=>distance(b.position,byId.get(id).position)))||a.id-b.id);
   const s=candidates.find(s=>freeSlot(w,s.id));check(s,'没有空闲星系可扩展势力，请保留原存档');
   const position=[1,s.id,freeSlot(w,s.id)],id=`diplomacy:${region}:${s.id}`;
   w.planets[id]=createColony(leader.id,`${region==='iron'?'赤铁':'曙光'}领地 ${holdings.length+1}`,position,{id,ships:{Cruiser:20,Battleship:10},defense:{Rocket_Launcher:20,Light_Laser:10},resources:[120000,75000,35000]});
   claimSystem(w,leader,position);holdings.push(s.id);
  }
 }
 for(const player of Object.values(w.players)){
  player.strategicResources??=emptyStock();
  if(player.bot&&player.commander&&!player.commander.factionId)player.cityState={name:w.planets[player.home].name};
 }
 const anchors=[],used=new Set(),addAnchor=(system,resource,name,host=null)=>{
  if(used.has(system))return;used.add(system);anchors.push({id:`constellation:${system}`,system,resource,name,host,systems:[]});
 };
 // Six independent lords each anchor one native resource. Geography is persisted once.
 const cityAssignments={stargazer:'resonance',freeport:'phase',furnace:'galaxium',haven:'nullphase',outpost:'titanium',drifter:'antimatter'};
 for(const player of Object.values(w.players).filter(p=>p.cityState)){
  const p=w.planets[player.home],resource=cityAssignments[player.commander.id];
  addAnchor(p.position[1],resource,`${p.name}星座`,p.id);
 }
 const human=Object.values(w.players).find(p=>!p.bot),home=human&&w.planets[human.home];
 const safeSystem=home?.position[1]||w.sovereignty.safeSystems.find(s=>freeSlot(w,s));
 if(safeSystem)addAnchor(safeSystem,'resonance','晨光星座',home?.id);
 for(const [i,resource]of strategicKeys.entries()){
  const origin=anchors.find(a=>a.resource===resource),point=byId.get(origin?.system||safeSystem||16).position;
  const s=stars.filter(s=>!used.has(s.id)&&!safe.has(s.id)&&!reserved.has(s.id)&&!w.sovereignty.claims[`1:${s.id}`]&&freeSlot(w,s.id)).sort((a,b)=>distance(b.position,point)-distance(a.position,point)||a.id-b.id)[0];
  check(s,'没有空闲星系安置独立资源产区');addAnchor(s.id,resource,['回声','钛辉','迷雾','古星','寂光','灼环'][i]+'星座');
 }
 for(const region of ['iron','dawn']){
  const leader=Object.values(w.players).find(p=>p.bot&&p.commander?.factionId===region&&p.commander.title==='大将军');
  if(leader){const p=w.planets[leader.home];addAnchor(p.position[1],region==='iron'?'titanium':'antimatter',region==='iron'?'赤铁星座':'曙光星座',p.id);}
 }
 for(const s of stars){const nearest=[...anchors].sort((a,b)=>distance(s.position,byId.get(a.system).position)-distance(s.position,byId.get(b.system).position)||a.system-b.system)[0];nearest.systems.push(s.id);}
 const deposits=[];
 for(const a of anchors){
  const p=a.host&&w.planets[a.host],slot=p?.position[2]||freeSlot(w,a.system);check(slot,'资源产区没有可用轨道');
  deposits.push({id:`deposit:${a.system}:${slot}`,position:[1,a.system,slot],resource:a.resource,constellation:a.id});
  const second=a.systems.filter(id=>id!==a.system&&!w.sovereignty.claims[`1:${id}`]&&!reserved.has(id)).sort((x,y)=>distance(byId.get(x).position,byId.get(a.system).position)-distance(byId.get(y).position,byId.get(a.system).position)).find(id=>freeSlot(w,id));
  if(second)deposits.push({id:`deposit:${second}:${freeSlot(w,second)}`,position:[1,second,freeSlot(w,second)],resource:a.resource,constellation:a.id});
 }
 w.strategic={version:DIPLOMACY_VERSION,createdAt:activateAt,nextIndustry:activateAt+strategicRules.industryHours*HOUR,constellations:anchors.map(({host,...a})=>a),deposits,mines:{}};
 for(const d of deposits){const p=Object.values(w.planets).find(p=>!p.moon&&p.position.join(':')===d.position.join(':'));if(w.players[p?.owner]?.bot)w.strategic.mines[d.id]={planet:p.id,owner:p.owner};}
}

export function resourceLocation(w,position){
 if(!w.strategic||position[0]!==1)return {};
 const a=w.strategic.constellations.find(a=>a.systems.includes(position[1])),d=w.strategic.deposits.find(d=>d.position.join(':')===position.join(':'));
 return {constellation:a?{id:a.id,name:a.name,resource:a.resource}:null,strategicDeposit:d?{...d,active:!!w.strategic.mines[d.id]}:null};
}
export function integrateStrategic(w,to){
 if(!w.strategic)return;
 for(const d of w.strategic.deposits){const m=w.strategic.mines[d.id],p=m&&w.planets[m.planet],owner=p&&w.players[p.owner];if(!owner||p.owner!==m.owner)continue;
  const hours=(to-Math.max(w.at,w.strategic.createdAt,m.createdAt||0))/HOUR;if(hours<=0)continue;
  owner.strategicResources??=emptyStock();const n=owner.strategicResources[d.resource]||0;
  owner.strategicResources[d.resource]=Math.max(n,Math.min(strategicRules.capacity,n+hours*strategicRules.rate));
 }
}
export function buildStrategicMine(w,player,p){
 const d=resourceLocation(w,p.position).strategicDeposit;
 check(!p.moon&&p.owner===player.id&&d,'请在拥有战略矿藏的本方行星建设');
 check(!w.strategic.mines[d.id],'该矿点已在开采');spendResources(w,p,strategicRules.mineCost);
 w.strategic.mines[d.id]={planet:p.id,owner:player.id};
}
export function npcIndustry(w,units,queueKey,seconds,megaProduction=null){
 for(const partner of Object.values(w.players).filter(isTradePartner)){
  const p=w.planets[partner.home];if(!p||Object.values(w.battles||{}).some(b=>b.target===p.id&&b.status==='active'))continue;
  const d=w.strategic.deposits.find(d=>w.strategic.mines[d.id]?.planet===p.id);if(!d)continue;
  const r=strategicResources[d.resource],item=units[r.ship],key=queueKey(item),mega=item.productionFacility==='Megastructure_Shipyard'?megaProduction?.state(w,p,units):null;
  if(item.productionFacility==='Megastructure_Shipyard'&&!mega?.powered)continue;
  const q=mega?mega.queue:p[key]||[];
  if((p.ships[item.id]||0)+q.filter(q=>q.id===item.id).reduce((sum,q)=>sum+q.remaining,0)>=strategicRules.defenderLimit||q.length>=8)continue;
  if((partner.strategicResources[d.resource]||0)<r.amount*3||item.cost.some((n,i)=>availableResources(w,p)[i]<n))continue;
  // Newly placed advanced orders obey the same system shipyard contract.
  if(mega){megaProduction.queue(w,partner,p,item,1,w.at);continue;}
  spendResources(w,p,item.cost);partner.strategicResources[d.resource]-=r.amount;
  const each=seconds(item,p),last=q.at(-1),start=last?last.end+(last.remaining-1)*last.each*1000:w.at;
  (p[key]??=[]).push({queueId:randomUUID(),id:item.id,count:1,remaining:1,each,start,end:start+each*1000,strategicCost:{[d.resource]:r.amount}});
 }
 w.strategic.nextIndustry+=strategicRules.industryHours*HOUR;
}

const allStock=(w,p)=>[...availableResources(w,p),...strategicKeys.map(k=>w.players[p.owner].strategicResources?.[k]||0)];
const reserve=(partner,k)=>strategicResources[k].amount*2;
const saleStock=(w,p)=>allStock(w,p).map((n,i)=>Math.max(0,Math.floor(n-(i<3?10000:reserve(w.players[p.owner],strategicKeys[i-3])))));
const embargo=(player,id,now)=>(player.tradeRelations?.[id]?.embargoUntil||0)>now;
export function recordHostility(w,player,target,now){
 const owner=polity(w,target?.owner)?.id;if(!owner)return;
 const partner=Object.values(w.players).find(p=>isTradePartner(p)&&polity(w,p.id)?.id===owner);if(!partner)return;
 player.tradeRelations??={};player.tradeRelations[partner.id]={trust:0,embargoUntil:now+24*HOUR};delete player.tradeOffer;
}
const bundle=v=>{check(Array.isArray(v)&&v.length===tradeKeys.length&&v.every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1e9),'交易数量无效');return [...v];};
function counterpart(w,player,id){const partner=w.players[id],p=partner&&w.planets[partner.home];check(isTradePartner(partner)&&p&&p.owner===partner.id&&p.position[0]===1&&id!==player.id,'交易对象无效');check(!embargo(player,id,w.at),'近期交战，对方暂时停止贸易');check(!Object.values(w.battles||{}).some(b=>b.target===p.id&&b.status==='active'),'对方正在交战，暂不接洽');return {partner,p};}
function valueWeights(w,partner,p,player){
 const stock=allStock(w,p),base=marketValues,trust=player.tradeRelations?.[partner.id]?.trust||0;
 return base.map((v,i)=>{const demand=i<3?(stock[i]<50000?1.6:.8):1+Math.max(0,1-stock[i]/120);return {ask:v*(1.2-Math.min(10,trust)*.01)*demand,bid:v*(i<3?demand:stock[i]<reserve(partner,strategicKeys[i-3])?1.25:.65)};});
}
function transfer(w,from,to,values){
 spendResources(w,from,values.slice(0,3));depositResources(w,to,values.slice(0,3));
 w.players[from.owner].strategicResources??=emptyStock();w.players[to.owner].strategicResources??=emptyStock();
 for(const [i,k]of strategicKeys.entries()){w.players[from.owner].strategicResources[k]-=values[i+3];w.players[to.owner].strategicResources[k]+=values[i+3];}
}
export function tradeAction(w,player,p,a){
 if(a.mode==='cancel'){delete player.tradeOffer;return;}
 if(a.mode==='propose'){
  const {partner,p:other}=counterpart(w,player,a.partner),give=bundle(a.give),take=bundle(a.take);
  check(give.some(n=>n)&&take.some(n=>n)&&!give.some((n,i)=>n&&take[i]),'双方各选至少一种不同资源');
  check(give.every((n,i)=>n<=allStock(w,p)[i]),'我方库存不足');check(take.every((n,i)=>n<=saleStock(w,other)[i]),'对方可售库存不足');
  const weights=valueWeights(w,partner,other,player),bid=give.reduce((s,n,i)=>s+n*weights[i].bid,0),ask=take.reduce((s,n,i)=>s+n*weights[i].ask,0),counter=bid<ask;
  if(counter){const i=give.findIndex(n=>n>0);give[i]+=Math.ceil((ask-bid)/weights[i].bid);check(give[i]<=1e9,'提案规模过大，请减少请求数量');}
  player.tradeOffer={id:randomUUID(),partner:partner.id,planet:p.id,give,take,counter,expires:w.at+5*60000,message:counter?'可以交换，但这批物资需要更多补偿。请看我的还价。':'这个提案可以接受。确认后我们立即交割。'};return;
 }
 check(a.mode==='accept','交易操作无效');const offer=player.tradeOffer;
 check(offer&&offer.id===a.offer&&offer.planet===p.id&&offer.expires>w.at,'提案已失效，请重新商谈');
 const {partner,p:other}=counterpart(w,player,offer.partner);
 check(offer.give.every((n,i)=>n<=allStock(w,p)[i]),'我方库存不足');check(offer.take.every((n,i)=>n<=saleStock(w,other)[i]),'对方库存已变化，请重新商谈');
 transfer(w,p,other,offer.give);transfer(w,other,p,offer.take);
 player.tradeRelations??={};const relation=player.tradeRelations[partner.id]??={trust:0};relation.trust=Math.min(10,(relation.trust||0)+1);
 const describe=v=>v.map((n,i)=>n?`${tradeNames[i]} ${n.toLocaleString('zh-CN')}`:'').filter(Boolean).join('、');
 player.reports.unshift({id:randomUUID(),at:w.at,type:'system',read:false,title:`与${partner.cityState?.name||polity(w,partner.id).name}完成交易`,body:`提供：${describe(offer.give)}。获得：${describe(offer.take)}。基础物资已交割至${p.name}；战略资源进入帝国库存。`});player.reports=player.reports.slice(0,100);delete player.tradeOffer;
}
export function diplomacySnapshot(w,player){
 if(!w.strategic)return null;
 return {inventory:player.strategicResources||emptyStock(),offer:player.tradeOffer||null,rules:strategicRules,resources:strategicResources,keys:tradeKeys,names:tradeNames,
  partners:Object.values(w.players).filter(isTradePartner).map(partner=>{const p=w.planets[partner.home],stock=allStock(w,p),needs=tradeNames.slice(0,3).filter((n,i)=>stock[i]<50000);return {id:partner.id,name:partner.cityState?.name||polity(w,partner.id).name,leader:partner.name,kind:partner.cityState?'城邦':'文明',bio:partner.commander?.bio||'独立文明，开放现货交换。',position:p.position,home:p.id,territory:new Set(Object.values(w.planets).filter(q=>q.owner&&!q.moon&&polity(w,q.owner).id===polity(w,partner.id).id).map(q=>q.position.slice(0,2).join(':'))).size,stock:stock.map(Math.floor),sale:saleStock(w,p),needs,trust:player.tradeRelations?.[partner.id]?.trust||0,embargoUntil:player.tradeRelations?.[partner.id]?.embargoUntil||0,specialties:w.strategic.deposits.filter(d=>w.strategic.mines[d.id]?.owner===partner.id).map(d=>d.resource)};}),
  deposits:w.strategic.deposits.map(d=>{const p=Object.values(w.planets).find(p=>!p.moon&&p.position.join(':')===d.position.join(':')),a=w.strategic.constellations.find(a=>a.id===d.constellation),claim=w.sovereignty.claims[d.position.slice(0,2).join(':')];return {...d,constellationName:a.name,planet:p?.id||null,owner:p?.owner||null,ownerName:p?.owner?polity(w,p.owner)?.name:'',territoryName:systemTerritory(w,d.position).systemOwnerName||'无主星域',active:!!w.strategic.mines[d.id]};})};
}
