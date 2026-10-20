import * as THREE from 'three';

// GPU back-face culling already rejects opaque cabin pixels. Also omit those
// triangles from the colour draw, avoiding their vertex work. Keep a complete
// index permutation for shadows and raycasts; authored vertices never change.
export function createCabinFaceCulling(root){
 const entries=[],eye=new THREE.Vector3(),inverse=new THREE.Matrix4();
 const margin=.12,refreshDistance=.08;
 const culling={enabled:true,stats:{triangles:0,submitted:0,culled:0,meshes:0,rebuilds:0},update,restore,dispose};
 root.traverse(mesh=>{
  const material=mesh.material,g=mesh.geometry;
  if(!mesh.isMesh||mesh.isSkinnedMesh||mesh.isInstancedMesh||Array.isArray(material)||material.transparent||material.side!==THREE.FrontSide||!g?.attributes.position||g.groups.length||g.drawRange.start!==0||g.drawRange.count!==Infinity)return;
  const position=g.attributes.position,count=g.index?.count??position.count,source=Uint32Array.from({length:count},(_,i)=>g.index?g.index.getX(i):i),index=new THREE.BufferAttribute(source.slice(),1).setUsage(THREE.DynamicDrawUsage);
  const planes=new Float32Array(count/3*4),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  for(let i=0,j=0;i<count;i+=3,j+=4){
   a.fromBufferAttribute(position,source[i]);b.fromBufferAttribute(position,source[i+1]).sub(a);c.fromBufferAttribute(position,source[i+2]).sub(a);
   b.cross(c).normalize();planes[j]=b.x;planes[j+1]=b.y;planes[j+2]=b.z;planes[j+3]=-b.dot(a);
  }
  // Clone only the geometry container, sharing its immutable vertex attributes.
  // The source remains available for disposal and diagnostics, without copying
  // all positions/normals/UVs or changing collision coordinates.
  const geometry=new THREE.BufferGeometry();
  for(const [key,attribute]of Object.entries(g.attributes))geometry.setAttribute(key,attribute);
  geometry.setIndex(index);geometry.boundingBox=g.boundingBox?.clone()??null;geometry.boundingSphere=g.boundingSphere?.clone()??null;
  const entry={mesh,sourceGeometry:g,geometry,source,index,planes,count,visible:count,eye:new THREE.Vector3(Infinity,Infinity,Infinity),before:mesh.onBeforeRender,after:mesh.onAfterRender,beforeShadow:mesh.onBeforeShadow};
  mesh.geometry=geometry;
  mesh.onBeforeRender=function(...args){entry.before.apply(this,args);geometry.setDrawRange(0,culling.enabled&&material.side===THREE.FrontSide?entry.visible:count);};
  mesh.onAfterRender=function(...args){geometry.setDrawRange(0,Infinity);entry.after.apply(this,args);};
  mesh.onBeforeShadow=function(...args){geometry.setDrawRange(0,Infinity);entry.beforeShadow.apply(this,args);};
  entries.push(entry);culling.stats.triangles+=count/3;
 });
 culling.stats.meshes=entries.length;

 function update(camera){
  root.updateWorldMatrix(true,true);camera.updateWorldMatrix(true,false);
  let submitted=0;
  for(const e of entries){
   if(culling.enabled){
    inverse.copy(e.mesh.matrixWorld).invert();eye.setFromMatrixPosition(camera.matrixWorld).applyMatrix4(inverse);
    // Pure head rotation needs no rebuild. The conservative margin also keeps
    // faces visible during small hit-feedback eye displacements between updates.
    if(eye.distanceToSquared(e.eye)>refreshDistance*refreshDistance){
     const {source,index,planes}=e,indices=index.array;let front=0,back=e.count;
     for(let i=0,j=0;i<e.count;i+=3,j+=4){
      const visible=planes[j]*eye.x+planes[j+1]*eye.y+planes[j+2]*eye.z+planes[j+3]>=-margin;
      const offset=visible?front:(back-=3);if(visible)front+=3;
      indices[offset]=source[i];indices[offset+1]=source[i+1];indices[offset+2]=source[i+2];
     }
     e.visible=front;e.eye.copy(eye);index.needsUpdate=true;culling.stats.rebuilds++;
    }
    submitted+=e.visible/3;
   }else submitted+=e.count/3;
   // Restore even if an earlier draw threw before onAfterRender ran.
   e.geometry.setDrawRange(0,Infinity);
  }
  Object.assign(culling.stats,{submitted,culled:culling.stats.triangles-submitted});
  return culling.stats;
 }
 function restore(){for(const e of entries)e.geometry.setDrawRange(0,Infinity);}
 function dispose(){
  for(const e of entries){e.mesh.geometry=e.sourceGeometry;e.mesh.onBeforeRender=e.before;e.mesh.onAfterRender=e.after;e.mesh.onBeforeShadow=e.beforeShadow;e.geometry.dispose();}
  entries.length=0;
 }
 return culling;
}
