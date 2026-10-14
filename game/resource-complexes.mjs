import {capacities} from './catalog.mjs';
import {planetType} from './planet-types.mjs';

export const RESOURCE_COMPLEX_VERSION = 1;
export const RESOURCE_COMPLEXES = Object.freeze([
  {id:'Metal_Mine',storageId:'Metal_Storage',resource:0},
  {id:'Crystal_Mine',storageId:'Crystal_Storage',resource:1},
  {id:'Gas_Mine',storageId:'Gas_Storage',resource:2}
]);
const storageIds = new Set(RESOURCE_COMPLEXES.map(item=>item.storageId));
export const isLegacyStorage=id=>storageIds.has(id);
export const capacityAtLevel=level=>capacities[level]??Math.floor(60500000*1.83**(level-14));
export function resourceComplexes(planet){
  if(planet.moon)return {};
  return Object.fromEntries(RESOURCE_COMPLEXES.map(({id,storageId,resource})=>{
    const level=planet.buildings[id]||0,legacyStorageLevel=planet.buildings[storageId]||0;
    const storageLevel=Math.max(level,legacyStorageLevel);
    return [id,{id,storageId,resource,level,legacyStorageLevel,storageLevel,native:planetType(planet).multipliers[resource]>0,capacity:capacityAtLevel(storageLevel),nextCapacity:capacityAtLevel(Math.max(level+1,legacyStorageLevel))}];
  }));
}
// Legacy warehouse levels remain in the save as a capacity floor. Existing paid
// warehouse queues keep their original ID, finish time and cancellation refund.
export function migrateResourceComplexes(planet){
  if(!planet.moon)planet.resourceComplexVersion=RESOURCE_COMPLEX_VERSION;
}
export function planetCapacities(planet){
  return RESOURCE_COMPLEXES.map(({id,storageId})=>capacityAtLevel(planet.moon?(planet.buildings[storageId]||0):Math.max(planet.buildings[id]||0,planet.buildings[storageId]||0)));
}
export function usedBuildingFields(planet){
  if(planet.moon)return Object.values(planet.buildings).reduce((sum,level)=>sum+level,0);
  // A preserved warehouse occupies the same complex as its extraction facility.
  const ordinary=Object.entries(planet.buildings).filter(([id])=>!isLegacyStorage(id)&&!RESOURCE_COMPLEXES.some(item=>item.id===id)).reduce((sum,[,level])=>sum+level,0);
  return ordinary+RESOURCE_COMPLEXES.reduce((sum,{id,storageId})=>sum+Math.max(planet.buildings[id]||0,planet.buildings[storageId]||0),0);
}
