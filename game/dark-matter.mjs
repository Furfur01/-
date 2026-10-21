// Shared quotes; only the engine may debit balances or complete paid work.
export const darkMatterRules={secondsPerUnit:1800,resourcePerUnit:10000};
export const accelerationKinds={build:'建筑施工',research:'科学研究',ship:'舰船生产',defense:'防务生产',flagship:'旗舰生产'};
export const accelerationQueueKey={ship:'shipQueue',defense:'defenseQueue',flagship:'flagshipQueue'};
export function accelerationQueue(planet,player,kind){
  if(kind==='build')return planet.buildQueue;
  if(kind==='research')return player.researchQueue?.planet===planet.id?player.researchQueue:null;
  return accelerationQueueKey[kind]?planet[accelerationQueueKey[kind]]?.[0]:null;
}
export function accelerationQuote(planet,player,kind,now){
  const q=accelerationQueue(planet,player,kind);
  if(!q)return null;
  const production=!!accelerationQueueKey[kind],end=q.end+(production?(q.remaining-1)*q.each*1000:0);
  const seconds=Math.max(0,(end-now)/1000),cost=Math.ceil(seconds/darkMatterRules.secondsPerUnit);
  return {kind,planet:planet.id,id:q.id,queue:q.queueId||JSON.stringify([kind,q.id,q.start,q.level??q.count]),level:q.level,mode:q.mode,count:production?q.remaining:1,end,seconds,cost};
}
