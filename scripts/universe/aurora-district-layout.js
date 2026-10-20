import {SURFACE_SLOTS} from '../../game/surface-layout.mjs';
import {previewPlan} from './campus/preview-plan.js';
import {campusHeightField} from './campus/height.js';

export const DISTRICT_VERSION='aurora-planned-space-campuses-4';
export const DISTRICT_PATCH=Object.freeze({radius:150,warp3:12,warp5:8,aspect:1.15});
export function districtPatchBoundary(angle){return DISTRICT_PATCH.radius+DISTRICT_PATCH.warp3*Math.sin(angle*3)+DISTRICT_PATCH.warp5*Math.cos(angle*5);}
export const DISTRICT_IDS=Object.freeze(Object.keys(SURFACE_SLOTS));
export const TREE_HEIGHT_UNITS=Object.freeze([1.5,2.65]);
const plans=new Map(),fields=new Map();
const normalize=v=>{const r=Math.hypot(...v);return v.map(x=>x/r);};
const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function districtPlan(id){if(!plans.has(id))plans.set(id,previewPlan(id));return plans.get(id);}
export function districtHeightField(id,{gas=false}={}){const key=`${id}/${gas}`;if(!fields.has(key))fields.set(key,campusHeightField(districtPlan(id),{gas}));return fields.get(key);}
export function districtKind(id){return ({Metal_Mine:'metal',Crystal_Mine:'crystal',Gas_Mine:'gas',Command_Center:'civic',Research_Lab:'research',Robotics_Facility:'robotics',Nanite_Factory:'nanofab',Solar_Plant:'solar',Fusion_Reactor:'fusion',Radar_Facility:'radar',Alliance_Depot:'logistics',Terraformer:'environment',Missile_Silo:'support',Shipyard:'spaceport'})[id]||'logistics';}
export function districtDimensions(id){const p=districtPlan(id),[x,z,width,depth]=p.previewBounds,radius=Math.max(...[[x,z],[x+width,z],[x,z+depth],[x+width,z+depth]].map(([a,b])=>Math.hypot(a-80,b-70)))+12;return {width,depth,radius,center:[x+width/2-80,z+depth/2-70],maxHeight:Math.max(...p.buildings.map(b=>b.h))};}
export function districtConstructionOrder(id){
  const p=districtPlan(id),rank={primary:0,specialist:1,equipment:1,support:2},remaining=[...p.buildings],out=[];
  // Install the institution's cores first, then its process equipment, then support.
  // Within each phase, respect directed process dependencies when acyclic.
  for(let phase=0;phase<3;phase++){
    const nodes=remaining.filter(b=>rank[b.role]===phase),edges=p.routedFlows.filter(f=>!['walk','freight'].includes(f.kind)).flatMap(f=>f.segments);
    while(nodes.length){let i=nodes.findIndex(b=>!edges.some(s=>s.to===b.id&&nodes.some(n=>n.id===s.from)));if(i<0)i=0;out.push(nodes.splice(i,1)[0].id);}
  }return out;
}
export function districtPlots(id){return districtPlan(id).buildings.map((b,index)=>({...b,nodeId:b.id,index,x:b.x-80,z:b.y-70,width:b.w,depth:b.d,height:b.h,rotation:0}));}
export function districtNeighborhoods(id){return districtPlan(id).zones.filter(z=>districtPlan(id).buildings.some(b=>b.zone===z.id)).map((z,index)=>({id:z.id,index,x:z.bounds[0]+z.bounds[2]/2-80,z:z.bounds[1]+z.bounds[3]/2-70,width:z.bounds[2],depth:z.bounds[3]}));}
export function districtRoads(id){return districtPlan(id).roads.flatMap(r=>r.points.slice(1).map((b,i)=>[r.points[i].map((v,k)=>v-[80,70][k]),b.map((v,k)=>v-[80,70][k])]));}
export function distanceToRoad(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);}
export function districtRelief(id,x,z,{gas=false}={}){return districtHeightField(id,{gas}).surfaceHeight(x+80,z+70);}

// Keep the established global directions, independent of quality, ownership and level.
export function makeDistrictSites(config,baseHeight,unit){return DISTRICT_IDS.map(id=>{
  const normal=[...SURFACE_SLOTS[id].direction],right=normalize(cross([0,1,0],normal)),forward=cross(normal,right),size=districtDimensions(id),mountain=['Metal_Mine','Crystal_Mine'].includes(id);
  const sea=config.biome==='mercury'?-.016*config.radius:0,original=baseHeight(normal),height=config.biome==='gas'?config.radius*.08:Math.max(original,sea+unit*(mountain?20:12));
  return {id,normal,right,forward,heading:0,height,unit,position:normal.map(v=>v*(config.radius+height)),footprint:size.radius*unit,district:true,kind:districtKind(id),size,geology:mountain?'mountain':id==='Gas_Mine'?'basin':'plain'};
});}
export function districtLocal(direction,site,radius){const cosine=dot(direction,site.normal);if(cosine<Math.cos(site.footprint*4/radius))return null;const radial=(radius+site.height)/cosine;return {x:dot(direction,site.right)*radial/site.unit,z:-dot(direction,site.forward)*radial/site.unit,radial};}
export function gradeDistrict(direction,site,radius,base){
  const q=districtLocal(direction,site,radius);if(!q)return null;
  const r=Math.hypot(q.x/1.15,q.z),angle=Math.atan2(q.z,q.x),shore=210+24*Math.sin(angle*3)+18*Math.cos(angle*5),landscape=1-smooth((r-86)/(shore-86));if(landscape<=0)return null;
  const weight=1-smooth((r-108)/(shore-108)),cosine=dot(direction,site.normal);
  let x=q.x,z=q.z,radial=q.radial;
  for(let i=0;i<3;i++){radial=(radius+site.height+districtRelief(site.id,x,z)*site.unit)/cosine;x=dot(direction,site.right)*radial/site.unit;z=-dot(direction,site.forward)*radial/site.unit;}
  const hills=Math.max(0,1-Math.hypot((q.x+100)/60,(q.z+90)/57))*16+Math.max(0,1-Math.hypot((q.x-90)/46,(q.z-90)/55))*12;
  const natural=q.radial-radius+(hills-3)*site.unit,surrounding=base+(natural-base)*landscape,height=radial-radius;
  return {...q,height:surrounding+(height-surrounding)*weight,weight:Math.max(weight,landscape),developed:Math.abs(x)<82&&Math.abs(z)<74,mineral:site.id==='Crystal_Mine'&&x<-25?Math.max(0,1-Math.abs(x+50-z*.4)/12):0};
}
