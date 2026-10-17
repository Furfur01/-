// Private per-player intelligence. Public star-map responses never include stocks.
export function planetIntel(world,player,planet){
 if(!planet.npc||planet.moon)return null;
 const reports=player.reports.filter(r=>!r.defending&&r.position?.join(':')===planet.position.join(':')&&(!r.targetId||r.targetId===planet.id));
 const battle=reports.find(r=>r.type==='battle'),spy=reports.find(r=>r.type==='spy');
 const fresh=reports.filter(r=>Number.isInteger(r.npcRefreshDay)?r.npcRefreshDay===planet.npcRefreshDay:r.at>=(planet.npcRefreshedAt||0));
 const victory=fresh.find(r=>r.type==='battle'&&r.winner==='attacker'),freshSpy=fresh.find(r=>r.type==='spy'),freshBattle=fresh.find(r=>r.type==='battle');
 if(!battle&&!spy)return null;
 const returning=battle?world.missions.filter(m=>m.owner===player.id&&m.battleId===battle.battleId&&m.phase==='return'):[];
 const fighting=Object.values(world.battles||{}).filter(b=>b.target===planet.id&&b.status==='active');
 return {
  resources:victory?planet.resources.map(Math.floor):freshSpy?.resources||freshBattle?.remainingResources||null,
  resourceAt:victory?world.at:freshSpy?.at||freshBattle?.at,
  resourceSource:victory?'post-battle-live':freshSpy?'spy':'battle',
  refreshExpired:!freshSpy&&!freshBattle,
  defenders:victory?Object.values(planet.ships).reduce((a,b)=>a+b,0)+Object.values(planet.defense).reduce((a,b)=>a+b,0)+fighting.reduce((n,b)=>n+(b.ships||[]).filter(s=>s.side==='defender'&&s.hp>0).length,0):null,
  battle:battle?{id:battle.id,battleId:battle.battleId,at:battle.at,winner:battle.winner,loot:battle.loot,losses:battle.losses,capacity:battle.lootCapacity,remainingAtBattle:battle.remainingResources,
   delivery:returning.length?'returning':battle.deliveries?.length&&battle.deliveries.every(d=>d.status==='delivered')?'delivered':'settled',
   returningCargo:returning.reduce((a,m)=>a.map((n,i)=>n+(m.cargo[i]||0)),[0,0,0]),returnAt:returning.length?Math.max(...returning.map(m=>m.end)):null,
   destinations:(battle.deliveries||[]).map(d=>({name:world.planets[d.from]?.name||'出发星球',status:d.status}))}:null
 };
}
