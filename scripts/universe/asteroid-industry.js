import * as T from 'three';
import {createAsteroidIndustry} from './asteroid-miner.js';
import {OUTER_ASTEROID_BELT} from './asteroid-layout.js';

// Fit the orbit to the real system belt without enlarging the supplied machinery.
export const INDUSTRY_SCALE=18;
const orbitRadius=OUTER_ASTEROID_BELT.radius*100/INDUSTRY_SCALE;
const beltWidth=OUTER_ASTEROID_BELT.halfWidth*200/INDUSTRY_SCALE;
const layout={orbitRadius,beltInnerRadius:orbitRadius-beltWidth/2,beltWidth,stationRadius:orbitRadius-50};
const orbit={orbitRadius,orbitHeight:83,angularSpeed:.012,startAngle:-.65,captureDrop:83};
const angleAt=time=>orbit.startAngle+time*orbit.angularSpeed;
export const INDUSTRY_RADIUS=orbitRadius+200;
export const INDUSTRY_FOCUS_RADIUS=86;
export function industryFocus(time=0){
 const a=angleAt(time);
 return [Math.cos(a)*orbit.orbitRadius-Math.sin(a)*3,orbit.orbitHeight,Math.sin(a)*orbit.orbitRadius+Math.cos(a)*3];
}

export function createIndustry(detailed=true){
 if(detailed){const item=createAsteroidIndustry(layout);Object.assign(item.collectorSettings,orbit);return item;}
 const group=new T.Group(),collector=new T.Group(),stations=new T.Group();group.add(collector,stations);
 group.name='asteroid-industry-distant';collector.name='leviathan-collector';collector.userData.dynamic=true;
 const hull=new T.MeshStandardMaterial({color:0x8394a2,metalness:.25,roughness:.5,emissive:0x263a48});
 const glow=new T.MeshBasicMaterial({color:0x53dfd1,toneMapped:false});
 const stages=[];
 const box=(parent,size,at)=>{const m=new T.Mesh(new T.BoxGeometry(...size),hull);m.position.fromArray(at);parent.add(m);return m;};
 for(const [radius,z,threshold] of [[34,38,.1],[23,15,.28],[14,-6,.42],[6,-21,.56]]){
  const ring=new T.Mesh(new T.TorusGeometry(radius,1.7,5,24),hull);ring.position.z=z;ring.scale.y=.824;collector.add(ring);stages.push({object:ring,threshold});
 }
 for(const x of [-27,27])box(collector,[7,6,14],[x,6,7]);
 box(collector,[8,6,10],[0,0,-38]);
 const core=new T.Mesh(new T.IcosahedronGeometry(3,0),glow);core.position.z=-28;collector.add(core);
 for(const side of [-1,1]){const rail=box(collector,[43,2,3],[side*28,-6,-18]);rail.rotation.y=-side*.22;}
 for(const a of [-.7,.5,2.05,3.75]){
  const station=new T.Group();station.position.set(Math.cos(a)*layout.stationRadius,6,Math.sin(a)*layout.stationRadius);station.rotation.y=-a;stations.add(station);
  box(station,[18,3,18],[0,0,0]);box(station,[9,7,12],[0,4,0]);
  for(const x of [-15,15])box(station,[10,.7,15],[x,0,0]);
 }
 const points=[];for(let i=0;i<144;i++){const a=i/144*Math.PI*2,r=layout.beltInnerRadius+(i%7)/6*beltWidth;points.push(Math.cos(a)*r,(i%5)-2,Math.sin(a)*r);}
 const rocks=new T.Points(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(points,3)),new T.PointsMaterial({color:0x827d70,size:1.5,sizeAttenuation:false}));group.add(rocks);
 const item={group,parts:stages,setProgress(progress){for(const p of stages)p.object.visible=progress>=p.threshold;stations.children.forEach((s,i)=>s.visible=progress>=.16+i*.15);},update(dt,time,state){const a=angleAt(time);collector.position.set(Math.cos(a)*orbit.orbitRadius,orbit.orbitHeight,Math.sin(a)*orbit.orbitRadius);collector.rotation.y=-a;core.visible=state.enabled&&state.progress>=.82;}};
 item.update(0,0,{enabled:false,progress:1});return item;
}
