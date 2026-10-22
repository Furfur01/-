import * as T from 'three';
import {LineSegments2} from 'three/addons/lines/LineSegments2.js';
import {LineSegmentsGeometry} from 'three/addons/lines/LineSegmentsGeometry.js';
import {LineMaterial} from 'three/addons/lines/LineMaterial.js';
import {createLogistics,mergeStaticMachinery} from './megastructure-factories.js';
import {LOGISTICS_SCALE} from './logistics-layout.js';

const clamp=v=>Math.max(0,Math.min(1,v));
const axis=new T.Vector3(0,1,0);

function createDistantHub(){
 const group=new T.Group(),hull=new T.MeshStandardMaterial({color:0x8296a2,metalness:.28,roughness:.55,emissive:0x182630}),dark=new T.MeshStandardMaterial({color:0x334955,metalness:.22,roughness:.62,emissive:0x0d1c25}),light=new T.MeshBasicMaterial({color:0x67ddcb,toneMapped:false});
 const box=(size,position,material=hull)=>{const mesh=new T.Mesh(new T.BoxGeometry(...size),material);mesh.position.fromArray(position);group.add(mesh);};
 box([32,4,44],[0,-3,0]);box([27,12,38],[0,5,0],dark);box([19,2,23],[0,12,0]);box([13.5,1,18.5],[0,18.5,-1]);box([11,7,17],[0,15,-1]);box([10,.7,.4],[0,16.7,7.6],light);
 for(const side of [-1,1]){
  box([40,2,13],[side*31,-2,0]);
  for(const z of [-26,26]){box([25,2,39],[side*37,-2,z],dark);box([6,6,25],[side*44,1,z]);for(const x of [-11,11]){box([1.5,2,38],[side*37+x,0,z]);box([.4,.3,34],[side*37+x,1.2,z],light);}}
 }
 mergeStaticMachinery(group);
 return {group,setProgress(progress){group.scale.y=Math.max(.08,progress);},update(){}};
}

// Factory primitives/materials are shared with other wonders. Each hub owns its
// final render resources, so evicting it cannot dispose another facility's mesh.
function isolateResources(group,reflection){
 const geometries=new Map(),materials=new Map();
 group.traverse(o=>{
  if(o.geometry){if(!geometries.has(o.geometry))geometries.set(o.geometry,o.geometry.clone());o.geometry=geometries.get(o.geometry);}
  if(o.material){const clone=m=>{if(!materials.has(m)){const copy=m.clone();if(copy.isMeshStandardMaterial&&reflection){copy.envMap=reflection;copy.envMapIntensity=.7;}materials.set(m,copy);}return materials.get(m);};o.material=Array.isArray(o.material)?o.material.map(clone):clone(o.material);}
 });
 return ()=>{for(const g of geometries.values())g.dispose();for(const m of materials.values())m.dispose();};
}

export function logisticsMembers(center,planets){
 const members=new Set(center.members||[]);
 return planets.filter(p=>members.has(p.id)&&p.owner===center.owner&&!p.npc&&p.coordinates[0]===center.position[0]&&p.coordinates[1]===center.position[1]);
}

export function logisticsRouteSignature(center,pose,planets){
 return JSON.stringify([pose.position,logisticsMembers(center,planets).map(p=>[p.id,p.parent,!!p.moon,p.position,p.radius])]);
}

export function createLogisticsVisual({detailed,reflection}){
 const item=detailed?createLogistics():createDistantHub();if(detailed)mergeStaticMachinery(item.group);
 const release=isolateResources(item.group,reflection),group=new T.Group(),model=new T.Group();model.scale.setScalar(LOGISTICS_SCALE);model.add(item.group);group.add(model);
 const routeLine=(name,color,linewidth)=>{const line=new LineSegments2(new LineSegmentsGeometry(),new LineMaterial({color,linewidth,dashed:true,dashSize:100,gapSize:90,transparent:true,opacity:0,depthWrite:false,toneMapped:false,worldUnits:false,alphaToCoverage:true}));line.name=name;line.visible=false;group.add(line);return line;};
 const routes=routeLine('logistics-virtual-routes',0x75eacb,1.9),moonRoutes=routeLine('logistics-moon-routes',0x62b0a1,1.2);
 const packetMaterial=new T.PointsMaterial({color:0xd1fff0,size:3.5,sizeAttenuation:false,transparent:true,opacity:.9,depthWrite:false,toneMapped:false});
 const packetGeometry=new T.BufferGeometry();packetGeometry.setAttribute('position',new T.Float32BufferAttribute([],3));
 const packets=new T.Points(packetGeometry,packetMaterial);packets.name='logistics-route-signals';packets.frustumCulled=false;group.add(packets);
 let curves=[],members=[];
 function setConnections(center,pose,planets){
  members=logisticsMembers(center,planets);const byId=new Map(members.map(p=>[p.id,p])),origin=new T.Vector3(...pose.position),mainPositions=[],moonPositions=[];curves=[];
  for(const [i,p]of members.entries()){
   const parent=p.moon?byId.get(p.parent):null;if(p.moon&&!parent)continue;
   const end=new T.Vector3(...p.position),start=parent?new T.Vector3(...parent.position):origin.clone().add(new T.Vector3((i%2?1:-1)*37*LOGISTICS_SCALE,4*LOGISTICS_SCALE,(i%4<2?1:-1)*26*LOGISTICS_SCALE));
   const direction=end.clone().sub(start).normalize();if(parent)start.addScaledVector(direction,parent.radius*1.08);end.addScaledVector(direction,-p.radius*1.12);
   start.sub(origin);end.sub(origin);const length=start.distanceTo(end),mid=start.clone().lerp(end,.5).addScaledVector(axis,Math.min(p.moon?220:1800,length*(p.moon ? .08 : .12)));
   const curve=new T.QuadraticBezierCurve3(start,mid,end);curves.push({curve,moon:!!p.moon});
   const positions=p.moon?moonPositions:mainPositions,points=curve.getPoints(p.moon?12:32);
   for(let k=1;k<points.length;k++)positions.push(...points[k-1].toArray(),...points[k].toArray());
  }
  for(const [line,positions]of [[routes,mainPositions],[moonRoutes,moonPositions]]){line.geometry.dispose();line.geometry=new LineSegmentsGeometry();line.userData.hasRoutes=positions.length>0;if(positions.length){line.geometry.setPositions(positions);line.computeLineDistances();}}
  packets.geometry.dispose();packets.geometry=new T.BufferGeometry();packets.geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(curves.length*3),3).setUsage(T.DynamicDrawUsage));
 }
 const point=new T.Vector3();
 function update({time,dt,pixels,progress,level}){
  item.setProgress(progress);item.update(level?dt:0,time,{progress,level,enabled:level>0,effectLevel:detailed&&pixels>48?1:0});
  if(item.effects)item.effects.visible=detailed&&level>0&&pixels>48;
  const fade=clamp((pixels-6)/13),worldPerPixel=82*LOGISTICS_SCALE/Math.max(1,pixels);
  for(const [line,opacity,dash,gap]of [[routes,.65,7,5],[moonRoutes,.42,5,4]]){line.visible=level>0&&fade>0&&!!line.userData.hasRoutes;line.material.opacity=opacity*fade;line.material.dashSize=dash*worldPerPixel;line.material.gapSize=gap*worldPerPixel;}
  packets.visible=level>0&&fade>.2;packetMaterial.opacity=.9*fade;
  if(packets.visible){const positions=packets.geometry.attributes.position;curves.forEach(({curve},i)=>{curve.getPoint((time*.035+i*.381)%1,point);positions.setXYZ(i,point.x,point.y,point.z);});positions.needsUpdate=true;}
 }
 return {group,detailed,setConnections,update,get members(){return members.map(p=>p.id);},get routeCount(){return curves.length;},dispose(){release();for(const line of [routes,moonRoutes]){line.geometry.dispose();line.material.dispose();}packets.geometry.dispose();packetMaterial.dispose();group.removeFromParent();}};
}
