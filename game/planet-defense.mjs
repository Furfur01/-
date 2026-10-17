import {fortressSocket} from './fortress-layout.mjs';
export const isShieldGenerator=type=>type==='Small_Shield_Dome'||type==='Large_Shield_Dome';
const generatorCache=new WeakMap();

// Each generator contributes its existing shield capacity once, across the whole
// friendly ground force. Overflow continues into the target's personal shield/hull.
export function absorbDefenseShield(b,target,damage){
 if(b.environment?.kind!=='planet'||!target.profile.ground)return {remaining:damage,absorbed:0,generators:[]};
 let pool=generatorCache.get(b);
 if(!pool||pool.ships!==b.ships||pool.count!==b.ships.length){pool={ships:b.ships,count:b.ships.length,units:b.ships.filter(s=>s.profile.ground&&isShieldGenerator(s.type))};generatorCache.set(b,pool);}
 const generators=[];let remaining=damage;
 for(const generator of pool.units){
  if(generator.side!==target.side||generator.hp<=0||generator.shield<=0)continue;
  const absorbed=Math.min(generator.shield,remaining);
  generator.shield-=absorbed;generator.lastHit=b.tick;remaining-=absorbed;generators.push(generator.id);
  if(remaining<=0)break;
 }
 return {remaining,absorbed:damage-remaining,generators};
}

export function fortressState(environment,metadata,rows){
 const modules=environment?.fortress?.modules||[],occupants=new Map(),sockets=new Map(),fields=new Map();
 for(const m of metadata){
  if(!m.profile.ground)continue;
  const row=rows[m.id];if(!row)continue;
  // Old recordings did not carry slot metadata; recover their fixed placement.
  const slot=m.fortressSlot?.module??modules.reduce((best,cell)=>Math.hypot(cell.x-row[1],cell.z-row[3])<best.distance?{index:cell.index,distance:Math.hypot(cell.x-row[1],cell.z-row[3])}:best,{index:-1,distance:Infinity}).index;
  const count=occupants.get(slot)||{total:0,alive:0};count.total++;if(row[6]>0)count.alive++;occupants.set(slot,count);
  if(environment.fortress.version>=2){
   const module=modules[slot],socket=m.fortressSlot?.socket??module?.sockets.reduce((best,s,i)=>{const p=fortressSocket(module,i),distance=Math.hypot(p.x-row[1],p.z-row[3]);return s&&distance<best.distance?{index:i,distance}:best;},{index:-1,distance:Infinity}).index;
   const key=`${slot}:${socket}`,residents=sockets.get(key)||{total:0,alive:0};residents.total++;if(row[6]>0)residents.alive++;sockets.set(key,residents);
  }
  if(isShieldGenerator(m.type)&&row[6]>0&&row[7]>0){
   const field=fields.get(m.side)||{side:m.side,owner:m.owner,charge:0,capacity:0};
   field.charge+=row[7];field.capacity+=m.maxShield;fields.set(m.side,field);
  }
 }
 const destroyed=new Set([...occupants].filter(([,n])=>n.total>0&&!n.alive).map(([index])=>index));
 const destroyedSockets=new Set([...sockets].filter(([,n])=>n.total>0&&!n.alive).map(([key])=>key));
 return {destroyed,destroyedSockets,fields:[...fields.values()]};
}
