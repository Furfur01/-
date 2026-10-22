import {polity} from './sovereignty.mjs';
import {fleetPower} from './grand-powers.mjs';
import {marketBlank} from './market-rules.mjs';

export const EQUITY_VERSION=1;
export const equityWeights={industry:.4,science:.3,military:.3};
export function migrateEquity(w){
 if(w.galacticEconomy?.version>=EQUITY_VERSION)return;
 // Historic fees already belong to the operator; only future fees are shared.
 w.galacticEconomy={version:EQUITY_VERSION,since:w.at,fees:marketBlank(),pool:marketBlank(),accounts:{}};
}
export function equityMembers(w){
 const members=Object.values(w.players).filter(p=>w.planets[p.home]?.owner===p.id).map(p=>{
  const colonies=Object.values(w.planets).filter(q=>q.owner===p.id);
  const industry=colonies.reduce((s,q)=>s+Object.entries(q.buildings).reduce((n,[id,l])=>n+l*l*(/Mine|Plant|Reactor|Factory|Shipyard/.test(id)?10:1),0),0);
  const science=Object.values(p.tech).reduce((s,l)=>s+l*l,0);
  let military=colonies.reduce((s,q)=>s+fleetPower({...q.ships,...q.defense},p.tech),0);
  military+=w.missions.filter(m=>m.owner===p.id&&m.phase!=='engaged').reduce((s,m)=>s+fleetPower(m.ships||{},p.tech),0);
  for(const b of Object.values(w.battles||{}))if(b.status==='active')military+=(b.ships||[]).filter(s=>s.owner===p.id&&s.hp>0&&!s.temporary).reduce((sum,s)=>sum+s.hp+s.shield+s.attack,0);
  for(const b of w.factionWars?.battles||[])if(b.status==='active'){
   const side=b.attacker===p.id?'attacker':b.defender===p.id?'defender':null;
   if(side){const current=b.result.rounds.filter(r=>b.start+r.time*1000<=w.at).at(-1)?.after||b.result.initial;military+=fleetPower(current[side],p.tech);}
  }
  const ally=w.alliances.find(a=>a.id===p.alliance),country=ally?{id:'alliance:'+ally.id,name:ally.name}:polity(w,p.id);
  return {id:p.id,name:p.name,group:country.id,groupName:country.name,industry,science,military};
 });
 const eligible=members.filter(p=>p.id!==w.market.operator),totals=Object.fromEntries(Object.keys(equityWeights).map(k=>[k,eligible.reduce((s,p)=>s+p[k],0)]));
 const activeWeight=Object.entries(equityWeights).reduce((s,[k,v])=>s+(totals[k]?v:0),0);
 for(const p of members){
  p.score=activeWeight?Object.entries(equityWeights).reduce((s,[k,v])=>s+(totals[k]?p[k]/totals[k]*v/activeWeight:0),0):0;
  p.share=p.id===w.market.operator?(activeWeight ? .01 : 1):p.score*.99;
 }
 return members;
}
export function distributeFees(w,fee,credit){
 migrateEquity(w);
 const e=w.galacticEconomy,weights=equityMembers(w);
 fee.forEach((n,i)=>{e.fees[i]+=n;e.pool[i]+=n;});
 for(const m of weights){
  const account=e.accounts[m.id]??={paid:marketBlank(),pending:marketBlank()};
  const payment=fee.map((n,i)=>{account.pending[i]+=n*m.share;return Math.floor(account.pending[i]);});
  const home=w.planets[w.players[m.id].home];credit(w,home,payment);
  payment.forEach((n,i)=>{account.pending[i]-=n;account.paid[i]+=n;e.pool[i]-=n;});
 }
}
export function equitySnapshot(w,player){
 const members=equityMembers(w),groups=new Map();
 for(const m of members){const row=groups.get(m.group)||{id:m.group,name:m.groupName,share:0,industry:0,science:0,military:0};for(const k of ['share','industry','science','military'])row[k]+=m[k];groups.set(m.group,row);}
 const me=members.find(p=>p.id===player.id),ledger=w.galacticEconomy?.accounts[player.id];
 return {weights:equityWeights,rows:[...groups.values()].sort((a,b)=>b.share-a.share),share:me?.share||0,group:me?.group,paid:ledger?.paid||marketBlank(),pending:ledger?.pending||marketBlank(),fees:w.galacticEconomy?.fees||marketBlank(),pool:w.galacticEconomy?.pool||marketBlank()};
}
