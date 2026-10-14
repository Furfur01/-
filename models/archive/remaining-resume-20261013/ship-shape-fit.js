import * as THREE from 'three';
import fits from './ship-shape-fits.json' with {type:'json'};

// Preserve depth and topology while fitting the visible contour. This does not
// reconstruct the unknown back side, nor certify arbitrary 3D viewpoints.
export function fitShipShape(group,id){
  const f=fits[id];if(!f)return;
  const w=new THREE.Vector3(-1,.8,-1.2).normalize(),u=new THREE.Vector3(0,1,0).cross(w).normalize(),v=w.clone().cross(u),span=f.sourceMax-f.sourceMin;
  const c=Math.cos(f.sourceAngle),s=Math.sin(f.sourceAngle),ct=Math.cos(f.targetAngle),st=Math.sin(f.targetAngle);
  const sample=(a,t)=>{const x=Math.max(0,Math.min(255,t*255)),i=Math.min(254,Math.floor(x));return a[i]+(a[i+1]-a[i])*(x-i);};
  function warp(p){const x=p.dot(u),y=p.dot(v),z=p.dot(w),a=x*c+y*s,b=-x*s+y*c,t=(a-f.sourceMin)/span,lo=sample(f.sourceLower,t),hi=sample(f.sourceUpper,t),tl=sample(f.targetLower,t),th=sample(f.targetUpper,t),q=(b-lo)/Math.max(span*.002,hi-lo),na=(t-.5)*span,nb=(tl+q*(th-tl))*span;return u.clone().multiplyScalar(na*ct-nb*st).addScaledVector(v,na*st+nb*ct).addScaledVector(w,z);}
  group.updateMatrixWorld(true);
  group.traverse(mesh=>{
    if(!mesh.isMesh)return;const source=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry,attr=source.attributes.position,inverse=mesh.matrixWorld.clone().invert(),positions=[];
    function emit(a,b,c,depth=0){const pairs=[[a,b,c],[b,c,a],[c,a,b]].sort((x,y)=>y[0].distanceToSquared(y[1])-x[0].distanceToSquared(x[1]));const[p,q,r]=pairs[0];if(depth<9&&p.distanceTo(q)>span/28){const mid=p.clone().add(q).multiplyScalar(.5);emit(p,mid,r,depth+1);emit(mid,q,r,depth+1);}else for(const p of[a,b,c])positions.push(...warp(p).applyMatrix4(inverse).toArray());}
    for(let i=0;i<attr.count;i+=3)emit(...[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(attr,i+j).applyMatrix4(mesh.matrixWorld)));
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();mesh.geometry.dispose();mesh.geometry=geometry;if(source!==mesh.geometry)source.dispose();
  });
  group.userData.shapeFit='APK silhouette cage deformation in the reference camera plane; inferred depth preserved';
}
