import {units} from './catalog.mjs';
import {createSpatialBattle,addSpatialFleet,recordFrame,spatialMetadata} from './spatial-battle.mjs';
import {planetBattleEnvironment,battleViewEnvironment} from './battle-terrain.mjs';

// Invoked only by an explicit spectator/replay request. The already-settled
// numerical rounds drive a bounded tactical reconstruction, never a new battle.
export function factionWarReplay(w,war){
 const r=war.result,elapsed=Math.max(0,Math.min(r.duration,(w.at-war.start)/1000)),target=w.planets[war.target];
 const b=createSpatialBattle({id:war.id,target:war.target,attacker:war.attacker,defender:war.defender,start:war.start,seed:r.seed,environment:planetBattleEnvironment(target)});
 const samples={};
 for(const side of ['attacker','defender']){
  samples[side]=Object.fromEntries(Object.entries(r.initial[side]).filter(([,n])=>n>0).map(([id,n])=>[id,Math.min(12,n)]));
  addSpatialFleet(b,{fleet:samples[side],technology:r.technology[side],owner:war[side],side},units);
 }
 const ordinals=new Map();for(const s of b.ships){const key=s.side+':'+s.type;const n=ordinals.get(key)||0;s.sampleOrdinal=n;ordinals.set(key,n+1);}
 b.frames=[];b.events=[];b.tick=0;recordFrame(b);
 const counts=fleet=>['attacker','defender'].map(side=>Object.values(fleet[side]).reduce((s,n)=>s+n,0));
 b.frames[0].actualCounts=counts(r.initial);
 const rounds=r.rounds.filter(round=>round.time<=elapsed);
 for(const round of rounds){
  for(const s of b.ships.filter(s=>s.hp>0&&s.attack>0)){
   const enemies=b.ships.filter(e=>e.side!==s.side&&e.hp>0),enemy=enemies[(s.id+round.number)%enemies.length];
   if(enemy)b.events.push({seq:b.events.length+1,tick:Math.max(0,Math.round((round.time-.75)*20)),type:'fire',shipId:s.id,target:enemy.id,kind:s.profile.kind,from:[s.x,s.y,s.z],to:[enemy.x,enemy.y,enemy.z],speed:s.profile.projectileSpeed,projectileId:`${round.number}:${s.id}`});
  }
  b.tick=Math.round(round.time*20);
  for(const s of b.ships){
   const alive=Math.ceil((round.after[s.side][s.type]||0)/r.initial[s.side][s.type]*samples[s.side][s.type]);
   if(s.hp>0&&s.sampleOrdinal>=alive){s.hp=0;s.shield=0;b.events.push({seq:b.events.length+1,tick:b.tick,type:'destroy',shipId:s.id,x:s.x,y:s.y,z:s.z});}
  }
  recordFrame(b);b.frames.at(-1).actualCounts=counts(round.after);
 }
 if(elapsed*20>b.tick){b.tick=Math.round(elapsed*20);recordFrame(b);b.frames.at(-1).actualCounts=counts(rounds.at(-1)?.after||r.initial);}
 const live=war.status==='active',current=rounds.at(-1)?.after||r.initial;
 return {version:4,live,report:{id:war.id,type:'battle',targetId:war.target,targetName:'战术缩略 · '+war.targetName,position:war.position,attackerName:war.attackerName,defenderName:war.defenderName,initial:r.initial,technology:r.technology,survivors:current,winner:live?null:r.winner,duration:Math.max(.05,elapsed),at:war.end,simulation:r.simulation},record:{tactical:true,metadata:spatialMetadata(b),frames:b.frames,events:b.events,boundary:b.boundary,environment:battleViewEnvironment(b.environment,target)}};
}
