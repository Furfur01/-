import * as T from 'three';
import {profileRandom,PLANET_QUALITY,sampleSurface} from './planet-profile.js';
import {tangentFrame,normalize,terrainHeight} from './terrain.js';
// One bounded instanced batch; geology chooses the deposits, not screen-space RNG.
export function createCrystalDetails(config,uniforms){
 const mesh=new T.InstancedMesh(new T.ConeGeometry(1,1,5),new T.MeshStandardMaterial({color:uniforms.accentColor.value,emissive:uniforms.accentColor.value,emissiveIntensity:.25,metalness:.35,roughness:.26}),64);mesh.name='crystal-outcrops';mesh.count=0;mesh.visible=false;let lastKey='';const object=new T.Object3D(),up=new T.Vector3(0,1,0);
 return {mesh,update(eye,quality){mesh.visible=eye.length()<config.radius*1.15&&PLANET_QUALITY[quality].crystals>0;if(!mesh.visible)return;const d=eye.clone().normalize(),cell=`${Math.round(d.x*32)}/${Math.round(d.y*32)}/${Math.round(d.z*32)}`,key=`${cell}/${quality}`;if(key===lastKey)return;lastKey=key;const r=profileRandom(config.profile.identity,`crystals/${cell}`),frame=tangentFrame(normalize([Math.round(d.x*32),Math.round(d.y*32),Math.round(d.z*32)]));let count=0;
  for(let i=0;i<256&&count<PLANET_QUALITY[quality].crystals;i++){const n=normalize(frame.normal.map((v,k)=>v+(frame.right[k]*(r()-.5)+frame.forward[k]*(r()-.5))*.065)),sample=sampleSurface(n,config.profile);if(sample.crystal<.12||(config.sites||[]).some(s=>n.reduce((sum,v,k)=>sum+v*s.normal[k],0)>Math.cos(s.footprint*2/config.radius)))continue;const height=config.radius*(.0007+r()*.0025),h=terrainHeight(n,config);object.position.fromArray(n).multiplyScalar(config.radius+h+height*.42);object.quaternion.setFromUnitVectors(up,new T.Vector3(...n));object.rotateY(r()*6.28);object.scale.set(height*.2,height,height*.23);object.updateMatrix();mesh.setMatrixAt(count++,object.matrix);}
  mesh.count=count;mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();
 },dispose(){mesh.dispose();mesh.geometry.dispose();mesh.material.dispose();}};
}
