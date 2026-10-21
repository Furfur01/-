// Shared by the engine and the dispatch UI; all times are real seconds.
export const expeditionZones={
  outer:{id:'outer',name:'外围',level:1,seconds:900,cap:100000,pirates:{Light_Fighter:8,Heavy_Fighter:2},tech:0,darkMatter:[3,10],seed:1701},
  inner:{id:'inner',name:'内层',level:4,seconds:1800,cap:1000000,pirates:{Light_Fighter:40,Cruiser:6},tech:3,darkMatter:[10,30],seed:1702},
  deep:{id:'deep',name:'深层',level:9,seconds:3600,cap:10000000,pirates:{Cruiser:30,Battleship:10},tech:6,darkMatter:[25,50],seed:1703}
};
export const expeditionRounds=[1,3,6,12];
// Retained for outbound missions dispatched before per-zone durations.
export const expeditionSeconds=900;
export const miningHourSeconds=1800;
export const ordinaryRewardShips=['Cargo_Ship','Large_Cargo_Ship','Recycler','Probe','Colony_Ship','Light_Fighter','Heavy_Fighter','Cruiser','Battleship','Dreadnought','Bomber','Destroyer'];
export const fleetValue=(fleet,units)=>Object.entries(fleet).reduce((sum,[id,n])=>sum+units[id].cost.reduce((a,b)=>a+b,0)*n,0);
export const fleetCapacity=(fleet,units)=>Object.entries(fleet).reduce((sum,[id,n])=>sum+units[id].cargo*n,0);
export const resourceBase=(fleet,units,zone)=>Math.min(fleetValue(fleet,units)*.5,expeditionZones[zone].cap);
export function miningCargo(recyclers,hours,units){
  const amount=Math.floor(recyclers*units.Recycler.cargo*.05*hours);
  return [Math.floor(amount*.7),amount-Math.floor(amount*.7),0];
}
