import {seeded} from './combat.mjs';
import {planetTypes,planetType} from './planet-types.mjs';
import {plannedNpcs} from './npc-types.mjs';

export function systemTypes(seed,system,galaxy=1){
  const ids=Object.keys(planetTypes),types=Array.from({length:15},(_,i)=>ids[i%ids.length]);
  const random=seeded(seed^Math.imul(galaxy,73856093)^Math.imul(system,19349663));
  for(let i=14;i>0;i--){const j=Math.floor(random()*(i+1));[types[i],types[j]]=[types[j],types[i]];}
  return types;
}

// Request-local index: directory/state projections visit hundreds of systems.
// Rebuild once per projection so colonization and NPC changes are never stale.
export function planetsBySystem(world){
  const systems=new Map();
  for(const p of Object.values(world.planets)){
    const key=p.position.slice(0,2).join(':');
    if(!systems.has(key))systems.set(key,[]);
    systems.get(key).push(p);
  }
  return systems;
}

// Shared by the public directory, system snapshots and actual colonization.
// Reserve NPC orbits first, then fill missing ordinary planet types using only
// empty orbits. Existing colonies and in-flight destinations are left alone.
export function systemBiomes(world,galaxy,system,local=Object.values(world.planets).filter(p=>p.position[0]===galaxy&&p.position[1]===system)){
  const types=systemTypes(world.biomeSeed??0,system,galaxy),fixed=new Set(),camps=new Set();
  for(const p of local){
    if(p.moon||p.position[0]!==galaxy||p.position[1]!==system)continue;
    const index=p.position[2]-1;fixed.add(index);types[index]=planetType(p).id;if(p.npc)camps.add(index);
  }
  for(const {slot}of plannedNpcs(world,galaxy,system,local)){camps.add(slot-1);types[slot-1]='terrestrial';}
  for(const m of world.missions||[])if(m.task==='colonize'&&m.phase==='outbound'&&m.position[0]===galaxy&&m.position[1]===system){
    const index=m.position[2]-1;if(fixed.has(index))continue;
    fixed.add(index);if(Object.hasOwn(planetTypes,m.colonyBiome))types[index]=m.colonyBiome;
  }
  const counts=Object.fromEntries(Object.keys(planetTypes).map(id=>[id,0]));
  for(let i=0;i<15;i++)if(!camps.has(i))counts[types[i]]++;
  for(const type of Object.keys(counts))if(!counts[type]){
    const index=types.findIndex((current,i)=>!fixed.has(i)&&!camps.has(i)&&counts[current]>1);
    if(index<0)continue;
    counts[types[index]]--;types[index]=type;counts[type]++;
  }
  return types;
}
