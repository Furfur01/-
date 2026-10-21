import * as THREE from 'three';
// Original fusion disk, sweep, diamonds and altitude stems. No sphere or cone.
export class FusionRadar {
 constructor(config){
  this.group=new THREE.Group();this.group.position.fromArray(config.pos);this.group.scale.setScalar(config.scale);this.resources=[];this.markers=new Map();this.batches=new Map();this.ray=new THREE.Ray();this.inverse=new THREE.Matrix4();this.sphere=new THREE.Sphere();this.point=new THREE.Vector3();this.transform=new THREE.Object3D();this.color=new THREE.Color();const g=this.group,R=.62;
  const keep=r=>(this.resources.push(r),r);this.keep=keep;
  this.hm=(color,opacity)=>keep(new THREE.MeshBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));
  this.lm=(color,opacity)=>keep(new THREE.LineBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
  for(const r of [R*.33,R*.66,R]){const p=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;p.push(new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r));}g.add(new THREE.Line(keep(new THREE.BufferGeometry().setFromPoints(p)),this.lm(0x5fe6ff,r===R?.9:.45)));}
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;g.add(new THREE.Line(keep(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(a)*R*.1,0,Math.sin(a)*R*.1),new THREE.Vector3(Math.cos(a)*R,0,Math.sin(a)*R)])),this.lm(0x5fe6ff,.18)));}
  this.disk=new THREE.Mesh(keep(new THREE.CircleGeometry(R,64).rotateX(-Math.PI/2)),this.hm(0x1a6f88,.16));g.add(this.disk);
  this.sweep=new THREE.Mesh(keep(new THREE.CircleGeometry(R,32,0,.7).rotateX(-Math.PI/2)),this.hm(0x5fe6ff,.22));g.add(this.sweep);
  const me=new THREE.Mesh(keep(new THREE.ConeGeometry(.03,.09,3).rotateX(-Math.PI/2)),this.hm(0xffc46b,.9));me.position.y=.006;g.add(me);
  g.add(new THREE.Mesh(keep(new THREE.CircleGeometry(R,24,Math.PI/2-Math.PI/30,Math.PI/15).rotateX(-Math.PI/2)),this.hm(0x64f0a8,.14)));
  this.lockRing=new THREE.Mesh(keep(new THREE.TorusGeometry(.045,.003,6,32)),this.hm(0xffb35c,.95));g.add(this.lockRing);
 }
 batch(ally,count){
  let b=this.batches.get(ally);if(b&&b.capacity>=count)return b;
  // Growing contact buffers must not dispose the already-warmed programs.
  // The marker shapes and materials remain identical at every capacity.
  if(b){for(const o of [b.mesh,b.dot,b.stem]){o.removeFromParent();o.dispose?.();}b.stem.geometry.dispose();}
  const capacity=2**Math.ceil(Math.log2(Math.max(1,count))),material=opacity=>new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
  const mesh=new THREE.InstancedMesh(b?.mesh.geometry||new THREE.OctahedronGeometry(.022),b?.mesh.material||material(ally?.55:1),capacity),dot=new THREE.InstancedMesh(b?.dot.geometry||new THREE.RingGeometry(.008,.014,12).rotateX(-Math.PI/2),b?.dot.material||material(ally?.25:.6),capacity);
  // Solid contact symbols retain their faction colour when they overlap;
  // the floor dots, stems and sweep keep the original additive glow.
  mesh.material.blending=THREE.NormalBlending;
  const geometry=new THREE.BufferGeometry();for(const name of ['position','color'])geometry.setAttribute(name,new THREE.BufferAttribute(new Float32Array(capacity*6),3).setUsage(THREE.DynamicDrawUsage));
  const stem=new THREE.LineSegments(geometry,b?.stem.material||new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:ally?.2:.5,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
  for(const o of [mesh,dot]){o.instanceMatrix.setUsage(THREE.DynamicDrawUsage);o.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1);}
  geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(),1);this.group.add(mesh,dot,stem);
  b={mesh,dot,stem,capacity,count:0};this.batches.set(ally,b);return b;
 }
 update(s,time,camera){
  this.sweep.rotation.y=-time*1.8;this.disk.material.opacity=.13+.03*Math.sin(time*7);this.lockRing.visible=false;
  const key=(s?.vesselId??s?.name)+':'+s?.target+':'+s?.locked;
  if(this.lastTime!=null&&time>=this.lastTime&&time-this.lastTime<.05&&key===this.lastKey){this.lockRing.visible=this.markers.has(s?.target);if(camera)this.lockRing.quaternion.copy(camera.quaternion);return;}
  this.lastTime=time;this.lastKey=key;
  const contacts=s?.contacts||[],counts=[0,0];for(const c of contacts)counts[+!c.enemy]++;
  for(const ally of [false,true]){const count=counts[+ally],b=count?this.batch(ally,count):this.batches.get(ally);if(b){b.count=0;for(const o of [b.mesh,b.dot,b.stem])o.visible=count>0;}}
  // Keep every contact available for selection, but draw one marker per small
  // radar-space cell and side. Dense fleets must not add up to a white blob.
  const seen=new Set(),cells=new Map();for(const c of contacts){seen.add(c.id);let m=this.markers.get(c.id);
   if(!m){m={position:new THREE.Vector3()};this.markers.set(c.id,m);}
   const dx=c.pos[0]-s.pos[0],dz=c.pos[2]-s.pos[2],right=-dx*Math.cos(s.heading)+dz*Math.sin(s.heading),front=dx*Math.sin(s.heading)+dz*Math.cos(s.heading),range=Math.max(s.scanRange||1000,Math.hypot(right,front)),x=right/range*.60,z=-front/range*.60,y=Math.max(.014,Math.min(.24,(c.pos[1]-s.pos[1])/range+.06)),color=c.enemy?0xff4a3a:c.drone?0xffc46b:0x5fe6ff;
   const selected=c.id===s.target,ally=!c.enemy;
   m.position.set(x,y,z);m.scale=selected?1.5:ally?.65:1;m.action=c.enemy&&!s.replay?{action:'select',value:String(c.id)}:null;
   const b=this.batches.get(ally),cell=+ally+':'+Math.round(x/.05)+':'+Math.round(y/.05)+':'+Math.round(z/.05),existing=cells.get(cell);
   if(existing!=null&&!selected)continue;
   const slot=existing??b.count++;cells.set(cell,slot);const transform=this.transform;this.color.setHex(color);
   transform.position.copy(m.position);transform.rotation.set(0,time*2,0);transform.scale.setScalar(m.scale);transform.updateMatrix();b.mesh.setMatrixAt(slot,transform.matrix);b.mesh.setColorAt(slot,this.color);
   transform.position.set(x,.002,z);transform.rotation.set(0,0,0);transform.scale.setScalar(ally?.65:1);transform.updateMatrix();b.dot.setMatrixAt(slot,transform.matrix);b.dot.setColorAt(slot,this.color);
   const a=b.stem.geometry.attributes;a.position.setXYZ(slot*2,x,0,z);a.position.setXYZ(slot*2+1,x,y,z);for(const i of [slot*2,slot*2+1])a.color.setXYZ(i,this.color.r,this.color.g,this.color.b);
   if(c.id===s.target){this.lockRing.visible=true;this.lockRing.position.set(x,y,z);if(camera)this.lockRing.quaternion.copy(camera.quaternion);this.lockRing.material.color.setHex(s.locked?0xff4a3a:0xffb35c);this.lockRing.scale.setScalar(1+.10*Math.sin(time*10));}
  }
  for(const id of this.markers.keys())if(!seen.has(id))this.markers.delete(id);
  for(const b of this.batches.values()){
   for(const o of [b.mesh,b.dot]){o.count=b.count;if(b.count){for(const a of [o.instanceMatrix,o.instanceColor]){a.clearUpdateRanges();a.addUpdateRange(0,b.count*a.itemSize);a.needsUpdate=true;}}}
   b.stem.geometry.setDrawRange(0,b.count*2);for(const a of Object.values(b.stem.geometry.attributes)){a.clearUpdateRanges();a.addUpdateRange(0,b.count*6);a.needsUpdate=true;}
  }
  this.group.updateMatrixWorld(true);
 }
 pick(origin,direction){
  this.group.updateWorldMatrix(true,false);this.inverse.copy(this.group.matrixWorld).invert();this.ray.set(origin,direction).applyMatrix4(this.inverse);let hit=null;
  for(const m of this.markers.values()){if(!m.action)continue;this.sphere.set(m.position,.055*m.scale);if(!this.ray.intersectSphere(this.sphere,this.point))continue;const distance=origin.distanceTo(this.point.applyMatrix4(this.group.matrixWorld));if(!hit||distance<hit.distance)hit={surface:'hologram',distance,...m.action};}return hit;
 }
 layout(project){return {id:'hologram',corners:[],controls:[...this.markers.values()].filter(m=>m.action).map(m=>({...m.action,point:project(this.group.localToWorld(m.position.clone()).toArray())}))};}
 dispose(){for(const b of this.batches.values())for(const o of [b.mesh,b.dot,b.stem]){o.dispose?.();o.geometry.dispose();o.material.dispose();}this.batches.clear();for(const r of this.resources)r.dispose();this.resources=[];this.markers.clear();this.group.clear();}
}
