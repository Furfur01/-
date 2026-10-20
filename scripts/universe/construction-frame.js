import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Sample the intact shell only to size a temporary central erection jig.
// Seven rib frames and continuous longerons replace the surface-edge wireframe.
export function createErectionFrame(shells,dimensions){
 const stations=Array.from({length:7},(_,i)=>({z:dimensions.z*(-.43+i*.86/6),all:new THREE.Box2(),core:new THREE.Box2()}));
 const points=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()],sample=new THREE.Vector2(),limit=dimensions.x*.29;
 for(const geometry of shells){
  const pos=geometry.attributes.position,index=geometry.index,count=index?.count??pos.count;
  for(let v=0;v<count;v+=3){
   for(let k=0;k<3;k++)points[k].fromBufferAttribute(pos,index?index.getX(v+k):v+k);
   const low=Math.min(...points.map(p=>p.z)),high=Math.max(...points.map(p=>p.z));
   for(const station of stations){
    if(station.z<low||station.z>high)continue;
    for(let k=0;k<3;k++){
     const a=points[k],b=points[(k+1)%3],dz=b.z-a.z;if(Math.abs(dz)<1e-7)continue;
     const t=(station.z-a.z)/dz;if(t<0||t>1)continue;
     sample.set(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t);station.all.expandByPoint(sample);
     if(Math.abs(sample.x)<=limit)station.core.expandByPoint(sample);
    }
   }
  }
 }
 const profiles=stations.filter(s=>!s.all.isEmpty()).map(s=>{
  const b=s.core.isEmpty()?s.all:s.core;
  const cx=THREE.MathUtils.clamp((b.min.x+b.max.x)/2,-limit*.5,limit*.5),cy=(b.min.y+b.max.y)/2;
  const rx=Math.max(dimensions.x*.025,Math.min(limit,(b.max.x-b.min.x)*.44));
  const ry=Math.max(dimensions.y*.025,(b.max.y-b.min.y)*.42);
  return [[-.72,1],[.72,1],[1,.65],[1,-.65],[.72,-1],[-.72,-1],[-1,-.65],[-1,.65]].map(([x,y])=>new THREE.Vector3(cx+x*rx,cy+y*ry,s.z));
 });
 const cube=new THREE.BoxGeometry(1,1,1),members=[],matrix=new THREE.Matrix4(),quaternion=new THREE.Quaternion(),up=new THREE.Vector3(0,1,0),delta=new THREE.Vector3(),center=new THREE.Vector3(),scale=new THREE.Vector3();
 const width=THREE.MathUtils.clamp(Math.min(dimensions.x,dimensions.y)*.025,.024,.055);
 const beam=(a,b)=>{
  delta.subVectors(b,a);const length=delta.length();if(length<.001)return;
  quaternion.setFromUnitVectors(up,delta.normalize());center.addVectors(a,b).multiplyScalar(.5);scale.set(width,length,width);
  matrix.compose(center,quaternion,scale);members.push(cube.clone().applyMatrix4(matrix));
 };
 profiles.forEach((rib,i)=>{
  for(let j=0;j<8;j++){beam(rib[j],rib[(j+1)%8]);if(i)beam(profiles[i-1][j],rib[j]);}
  // Alternating lower-side diagonal bracing, with the upper work area left open.
  if(i&&i%2)for(const [a,b]of [[2,3],[7,6]])beam(profiles[i-1][a],rib[b]);
 });
 const geometry=members.length?mergeGeometries(members,false):new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute([],3));
 const memberCount=members.length;members.forEach(g=>g.dispose());cube.dispose();
 return {geometry,memberCount};
}
