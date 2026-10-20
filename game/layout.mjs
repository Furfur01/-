import original from './original-layout.json' with {type:'json'};
export const LAYOUT_VERSION = 2;
export const MAP_SIZE = [1600,1120];
export const FREE_AREA = [355,260,1360,810];
export const BUILD_POLYGON = [[355,365],[520,260],[675,270],[745,335],[1090,260],[1300,330],[1360,450],[1330,625],[1080,755],[920,810],[650,725],[460,810],[355,665],[465,570],[355,460]];
export const DEFAULT_LAYOUT = original.defaults;
export const BUILDING_WIDTHS = original.widths;
// Retain legacy 2D coordinates for old clients; the planet surface now has fixed slots.
export const FIXED_PLOTS = {...DEFAULT_LAYOUT};
export const MOON_LAYOUT = {
  Moon_Base:[800,430],Robotics_Facility:[580,620],Shipyard:[1130,710],
  Metal_Storage:[400,300],Crystal_Storage:[1170,300],Gas_Storage:[390,850],
  The_EU_X_Radar:[920,850],Wormhole_Generator:[650,880],Flagship_Center:[1150,510],Missile_Silo:[800,650]
};
export function getLayout(planet){
  const defaults=planet.moon?MOON_LAYOUT:DEFAULT_LAYOUT,result={};
  for(const[id,position]of Object.entries(defaults)){
    result[id]=(!planet.moon&&FIXED_PLOTS[id])||((planet.moon||planet.layoutVersion===LAYOUT_VERSION)&&planet.layout?.[id])||position;
  }
  return result;
}
export function migrateLayout(planet){
  if(planet.moon||planet.layoutVersion===LAYOUT_VERSION)return;
  if(planet.layout&&Object.keys(planet.layout).length)planet.previousLayout=planet.layout;
  planet.layout={};planet.layoutVersion=LAYOUT_VERSION;
}
export function onPlatform(x,y){
  let inside=false;
  for(let i=0,j=BUILD_POLYGON.length-1;i<BUILD_POLYGON.length;j=i++){
    const[a,b]=BUILD_POLYGON[i],[c,d]=BUILD_POLYGON[j];
    if(((b>y)!==(d>y))&&x<(c-a)*(y-b)/(d-b)+a)inside=!inside;
  }
  return inside;
}
export function validatePlacement(planet,id,x,y){
  const defaults=planet.moon?MOON_LAYOUT:DEFAULT_LAYOUT;
  if(!defaults[id])return '此星球不能建造该建筑';
  if(!planet.moon&&FIXED_PLOTS[id])return '行星建筑使用固定球面槽位，不能移动';
  if(!Number.isFinite(x)||!Number.isFinite(y))return '位置无效';
  const bounds=planet.moon?[220,180,1360,980]:FREE_AREA;
  if(x<bounds[0]||x>bounds[2]||y<bounds[1]||y>bounds[3])return planet.moon?'请放在月面建设区域内':'请放在中央建设区域内';
  if(!planet.moon&&!onPlatform(x,y))return '请放在基地平台内';
  for(const[other,pos]of Object.entries(getLayout(planet))){
    if(other===id||(!(planet.buildings?.[other]>0)&&planet.buildQueue?.id!==other))continue;
    if(Math.abs(pos[0]-x)<(planet.moon?135:90)&&Math.abs(pos[1]-y)<(planet.moon?100:65))return '建筑底座不能重叠';
  }
  return '';
}
export function findPlacement(planet,id){
  if(!planet.moon&&FIXED_PLOTS[id])return FIXED_PLOTS[id];
  const preferred=getLayout(planet)[id];
  if(preferred&&!validatePlacement(planet,id,...preferred))return preferred;
  const bounds=planet.moon?[220,180,1360,980]:FREE_AREA;
  for(let y=bounds[1]+50;y<=bounds[3];y+=110)for(let x=bounds[0]+40;x<=bounds[2];x+=150){
    if(!validatePlacement(planet,id,x,y))return[x,y];
  }
  return null;
}
