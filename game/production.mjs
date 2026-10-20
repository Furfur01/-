// Browser/server shared production semantics. Only the explicit migration mutates.
export const productionQueueKey=item=>item.type==='defense'?'defenseQueue':item.productionFacility==='Flagship_Center'?'flagshipQueue':'shipQueue';
export const productionQueue=(planet,item)=>planet[productionQueueKey(item)]||[];
export const defenseQueue=planet=>planet.defenseQueue||[];
export const missileStorage=planet=>(planet.defense.Interceptor_Missile||0)+2*(planet.defense.Interplanetary_Missile||0)+defenseQueue(planet).reduce((n,q)=>n+(q.id==='Interceptor_Missile'?q.remaining:q.id==='Interplanetary_Missile'?q.remaining*2:0),0);
// Split paid legacy orders without changing quantities, per-unit work or due dates.
// Already accepted work remains valid even if the new facility is not built yet.
export function migrateDefenseProduction(planet,units){
 planet.defenseQueue??=[];
 const moved=(planet.shipQueue||[]).filter(q=>units[q.id]?.type==='defense');
 if(!moved.length)return;
 planet.shipQueue=planet.shipQueue.filter(q=>units[q.id]?.type!=='defense');
 planet.defenseQueue.push(...moved);
 planet.defenseQueue.sort((a,b)=>a.start-b.start);
}
export function shipBuildSeconds(item,planet,constructionSpeed){
 const speed=item.productionFacility==='Flagship_Center'
  ? 10*(1+.25*Math.max(0,(planet.buildings.Flagship_Center||1)-1))
  : ((planet.buildings[item.type==='defense'?'Missile_Silo':'Shipyard']||0)+1)*2**(planet.buildings.Nanite_Factory||0);
 return Math.max(2,Math.ceil((item.cost[0]+item.cost[1])*1.44/(speed*constructionSpeed)));
}
