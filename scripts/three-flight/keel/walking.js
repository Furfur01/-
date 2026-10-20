import * as THREE from 'three';

// The old capital bridge's floor/desk rectangles no longer match these models.
// Walk on the imported deck and steps, with body clearance against real furniture.
export function createKeelWalker(keel){
 keel.root.updateMatrixWorld(true);
 const floors=[],solids=[];
 keel.interior.traverse(o=>{
  if(!o.isMesh||o.material.transparent)return;solids.push(o);
  let part=o;while(part&&part!==keel.interior){if(/deck|floor|circulation/i.test(part.name)){floors.push(o);break;}part=part.parent;}
 });
 const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0),offset=keel.root.position;
 function ground(x,y,z){ray.set(new THREE.Vector3(x,y,z),down);ray.near=0;ray.far=3;return ray.intersectObjects(floors,false).find(h=>h.face.normal.clone().transformDirection(h.object.matrixWorld).y>.55)?.point.y;}
 function advance(pose,dx,dz){
  const [x,y,z]=pose.eye,nx=x+dx,nz=z+dz,b=keel.config.bounds;
  if(nx-offset.x<b.min[0]+.3||nx-offset.x>b.max[0]-.3||nz-offset.z<b.min[2]+.3||nz-offset.z>b.max[2]-.3)return;
  const feet=ground(x,y-.65,z),next=ground(nx,(feet??y-1.7)+.38,nz);if(next==null||feet!=null&&Math.abs(next-feet)>.35)return;
  const direction=new THREE.Vector3(dx,0,dz).normalize();ray.near=.015;ray.far=Math.hypot(dx,dz)+.22;
  for(const h of [.25,.62,1.3]){ray.set(new THREE.Vector3(x,Math.max(feet??y-1.7,next)+h,z),direction);if(ray.intersectObjects(solids,false).length)return;}
  pose.eye[0]=nx;pose.eye[2]=nz;pose.eye[1]+=(next+1.7-pose.eye[1])*.2;
 }
 return (pose,keys,dt)=>{
  const f=Number(keys.has('KeyW'))-Number(keys.has('KeyS')),r=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));
  if(!f&&!r)return pose;
  const distance=(keys.has('ShiftLeft')?3.3:1.8)*Math.min(dt,.1)/Math.max(1,Math.hypot(f,r));
  advance(pose,(Math.sin(pose.yaw)*f+Math.cos(pose.yaw)*r)*distance,(-Math.cos(pose.yaw)*f+Math.sin(pose.yaw)*r)*distance);return pose;
 };
}
