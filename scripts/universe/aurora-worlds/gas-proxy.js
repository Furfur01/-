import * as THREE from 'three';
import {GAS_PALETTES,createGasSampler,createGasRings} from './source.js';

// A coarse view of the same cloud field, not a second, Jupiter-only generator.
export function createGasProxy(field){
 const variant=GAS_PALETTES[field.gasVariant]?field.gasVariant:'jupiter',palette=GAS_PALETTES[variant];
 const root=new THREE.Group();root.name='global-terrain';root.userData={gasVariant:variant};
 root.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(...(palette.tilt||field.features.axis)).normalize());
 const sample=createGasSampler(field,variant,root.quaternion),geometry=new THREE.SphereGeometry(100,32,24),position=geometry.attributes.position;
 const colors=new Float32Array(position.count*3),normal=new THREE.Vector3(),color=new THREE.Color();
 for(let i=0;i<position.count;i++){
  normal.fromBufferAttribute(position,i).normalize();const cloud=sample(normal.x,normal.y,normal.z);
  color.setRGB(...cloud.colors[0].map(v=>THREE.MathUtils.clamp(v/255,0,1)),THREE.SRGBColorSpace);
  for(let layer=1;layer<3;layer++)color.lerp(new THREE.Color().setRGB(...cloud.colors[layer].map(v=>THREE.MathUtils.clamp(v/255,0,1)),THREE.SRGBColorSpace),cloud.density[layer]*(layer===1?242:235)/255);
  color.toArray(colors,i*3);
 }
 geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
 const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1});
 const cloud=new THREE.Mesh(geometry,material);cloud.name='coarse-cloud-deck';cloud.userData.terrainSurface=true;root.add(cloud);
 const light=new THREE.Vector3(1,1,1).normalize(),rings=createGasRings(root,variant,palette,light,'low');
 root.setLight=value=>light.copy(value).normalize();
 root.dispose=()=>{const geometries=new Set(),materials=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());rings.map?.dispose();root.clear();};
 return root;
}
