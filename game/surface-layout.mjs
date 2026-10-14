export const SURFACE_LAYOUT_VERSION=1;
const ids=['Radar_Facility','Crystal_Mine','Alliance_Depot','Command_Center','Fusion_Reactor','Research_Lab','Metal_Mine','Robotics_Facility','Gas_Mine','Solar_Plant','Nanite_Factory','Shipyard','Missile_Silo','Terraformer'];
const types=['radar','crystal','shipyard','capital','fusion','research','metal','robotics','gas','solar','nano','spaceport','support','shield'];
const golden=Math.PI*(3-Math.sqrt(5));
export const SURFACE_SLOTS=Object.fromEntries(ids.map((buildingId,index)=>{
  const y=1-2*(index+.5)/ids.length,r=Math.sqrt(1-y*y),angle=index*golden+.3;
  const resource=['Metal_Mine','Crystal_Mine','Gas_Mine'].includes(buildingId);
  return [buildingId,{slotId:`D${String(index+1).padStart(2,'0')}`,buildingId,type:types[index],direction:[Math.cos(angle)*r,y,Math.sin(angle)*r],heading:0,footprint:resource?[13.94,13.94]:[6.2,6.2],routeSet:resource?types[index]:null,attachments:buildingId==='Shipyard'?['orbital-station']:resource?['integrated-storage']:[]}];
}));
export const surfaceLayout={version:SURFACE_LAYOUT_VERSION,algorithm:'fibonacci-14-aurora',radius:16,slots:SURFACE_SLOTS};
export function migrateSurfaceLayout(planet){
  if(planet.moon)return;
  if(planet.surfaceLayoutVersion!==SURFACE_LAYOUT_VERSION&&planet.layout&&Object.keys(planet.layout).length&&!planet.previousSurfaceLayout)planet.previousSurfaceLayout=structuredClone(planet.layout);
  planet.surfaceLayoutVersion=SURFACE_LAYOUT_VERSION;
}
export function validateSurfaceSlot(planet,buildingId,slotId){
  if(planet.moon)return '';
  const slot=SURFACE_SLOTS[buildingId];
  if(!slot)return '此设施已并入综合体，不能单独占用球面槽位';
  return slotId!==undefined&&slotId!==slot.slotId?'建筑必须使用预设的固定球面槽位':'';
}
