export const LAYOUT_VERSION = 'sphere-review-1';
export const PLANET_RADIUS = 36;
export const DISTRICT_RADIUS = 36.7;
export const BUILDINGS = [
  ['Metal_Mine','金属矿场'],['Metal_Storage','金属仓库'],
  ['Crystal_Mine','晶体矿场'],['Crystal_Storage','晶体仓库'],
  ['Gas_Mine','气体提取站'],['Gas_Storage','储气站'],
  ['Command_Center','主基地'],['Solar_Plant','太阳能电站'],
  ['Fusion_Reactor','聚变反应堆'],['Robotics_Facility','机器人工厂'],
  ['Shipyard','飞船基地'],['Research_Lab','研究实验室'],
  ['Radar_Facility','雷达站'],['Alliance_Depot','联盟设施'],
  ['Nanite_Factory','纳米工厂'],['Terraformer','地形改造器'],['Missile_Silo','导弹发射井']
];
const names=Object.fromEntries(BUILDINGS);
const definitions=[
  ['metal','赤铜矿区',['Metal_Mine','Metal_Storage']],
  ['crystal','蓝晶矿区',['Crystal_Mine','Crystal_Storage']],
  ['gas','气体开采区',['Gas_Mine','Gas_Storage']],
  ...BUILDINGS.slice(6).map(([id,name])=>[id,name,[id]])
];
export const districts=definitions.map(([id,name,ids],i)=>{
  // Equal-area Fibonacci sampling fixes all sites before terrain is generated.
  const y=1-2*(i+.5)/definitions.length,a=i*Math.PI*(3-Math.sqrt(5)),r=Math.sqrt(1-y*y);
  return {id,name,index:i,direction:[Math.cos(a)*r,y,Math.sin(a)*r],buildings:ids.map((building,j)=>({id:building,name:names[building],x:ids.length===2?(j?1.8:-1.8):0,z:0,heading:0,footprint:building==='Shipyard'?[5.5,3.8]:[1.9,1.9]}))};
});
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export function ground(x,z){return Math.sqrt(DISTRICT_RADIUS**2-x*x-z*z)-DISTRICT_RADIUS;}
export function sampleSurface(n){
  const [x,y,z]=n;
  const noise=Math.sin(x*7+z*3)*Math.cos(y*9-z*4)*.48+Math.sin(z*13+x*4)*Math.cos(y*11)*.20+Math.sin(x*24+y*15+z*8)*.07;
  let dot=-1;for(const d of districts)dot=Math.max(dot,x*d.direction[0]+y*d.direction[1]+z*d.direction[2]);
  const distance=Math.acos(Math.min(1,dot))*DISTRICT_RADIUS;
  const pad=1-smooth((distance-6.1)/3.2);
  const land=noise+.08;
  const base=PLANET_RADIUS+land*2.3+Math.max(0,noise-.15)*1.5;
  const radius=base*(1-pad)+DISTRICT_RADIUS*pad;
  return {radius,land:radius-PLANET_RADIUS,pad,noise};
}
export function buildingDistrict(id){return districts.find(d=>d.buildings.some(b=>b.id===id));}
