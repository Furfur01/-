import * as THREE from 'three';
import {sr07GLB} from './recycler-sr07-data.js';

// Restrained industrial livery: neutral ceramic, graphite and muted safety orange.
// Array order follows the source GLB's named materials, including its two lamp types.
export const sr07Palette=[0xbfc7c9,0xdce0df,0x596d78,0x303d46,0x1b252d,0x10171d,
  0xc78649,0xdea465,0x9eafb8,0x214452,0x8fd5de,0xf3dfb8,0x28343c];
let decoded;
function source(){
  if(decoded)return decoded;
  const raw=atob(sr07GLB),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
  const view=new DataView(bytes.buffer),jsonLength=view.getUint32(12,true);
  const doc=JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+jsonLength)));
  const binaryOffset=28+jsonLength;
  function accessor(index){
    const a=doc.accessors[index],v=doc.bufferViews[a.bufferView];
    const Type={5126:Float32Array,5125:Uint32Array,5123:Uint16Array}[a.componentType];
    return new Type(bytes.buffer,binaryOffset+(v.byteOffset||0)+(a.byteOffset||0),a.count*(a.type==='SCALAR'?1:3));
  }
  decoded={doc,accessor};return decoded;
}

export function createSR07Recycler(){
  const {doc,accessor}=source();
  const materials=doc.materials.map((m,index)=>{
    const p=m.pbrMetallicRoughness;
    const material=new THREE.MeshStandardMaterial({name:m.name,color:sr07Palette[index],
      metalness:p.metallicFactor,roughness:p.roughnessFactor,
      emissive:m.emissiveFactor?new THREE.Color(...m.emissiveFactor):new THREE.Color(0)});
    material.userData.emission=index===10?.65:index===11?.35:0;
    return material;
  });
  const nodes=doc.nodes.map(n=>{
    const group=new THREE.Group();group.name=n.name;
    if(n.translation)group.position.fromArray(n.translation);
    if(n.rotation)group.quaternion.fromArray(n.rotation);
    if(n.scale)group.scale.fromArray(n.scale);
    if(n.mesh!==undefined)for(const p of doc.meshes[n.mesh].primitives){
      const geometry=new THREE.BufferGeometry();
      // Each model owns its buffers: cache leases and exporters can dispose independently.
      geometry.setAttribute('position',new THREE.BufferAttribute(accessor(p.attributes.POSITION).slice(),3));
      geometry.setAttribute('normal',new THREE.BufferAttribute(accessor(p.attributes.NORMAL).slice(),3));
      geometry.setIndex(new THREE.BufferAttribute(accessor(p.indices).slice(),1));
      const mesh=new THREE.Mesh(geometry,materials[p.material]);
      mesh.name=n.name+' / '+doc.materials[p.material].name;
      mesh.castShadow=true;mesh.receiveShadow=true;
      // Authored shells retain hull, engines and both complete lifting-arm silhouettes
      // in the distant fleet, instead of selecting scattered fittings.
      mesh.userData.fleetLOD=(n.mesh===0&&p.material===0)||(n.mesh===2&&p.material===3)
        ||([3,4,5,7,8,9].includes(n.mesh)&&p.material===6)
        ||([6,10].includes(n.mesh)&&p.material===2);
      // Original graphite triangles: keel (0–63), deck (64–107), port beam
      // (108–151) and starboard beam (536–579). Keep the continuous chassis
      // without all the tiny fittings sharing this material (196 triangles).
      if(n.mesh===0&&p.material===3)mesh.userData.fleetLODRanges=[[0,152],[536,44]];
      group.add(mesh);
    }
    return group;
  });
  doc.nodes.forEach((n,i)=>(n.children||[]).forEach(j=>nodes[i].add(nodes[j])));
  const root=new THREE.Group();root.name='Recycler';
  const hull=nodes[0];root.add(hull);
  // Measured aft faces of the source's paired upper/lower pods and central drive.
  // Coordinates remain in the original hull space, so all consumers share the transform.
  hull.userData.engineNozzles=[
    [44.599998474121094,1.6,-12,1.8],[44.599998474121094,1.6,12,1.8],
    [43,-3,-12,1.7],[43,-3,12,1.7],[41.34000015258789,7.1,0,.65]
  ].map(([x,y,z,radius])=>({position:[x,y,z],direction:[1,0,0],radius}));
  // Source: -X forward / +Y up. Shared fleet: -Z forward / +Y up.
  hull.rotation.y=-Math.PI/2;
  const bounds=new THREE.Box3().setFromObject(hull),center=bounds.getCenter(new THREE.Vector3());
  hull.position.sub(center);
  // Keep the previous Recycler's longitudinal display size; these are not metres.
  root.scale.setScalar(14.107000350952148/(bounds.max.z-bounds.min.z));
  root.userData={modelId:'Recycler',revision:'sr07-salvage-01',referenceGeometry:true,
    designSource:'User SR07_salvage_threejs.html embedded GLB; original geometry with neutral/orange livery',
    sourceTriangles:doc.extras.triangles,sourcePrimitives:doc.extras.meshPrimitives,
    sourceFile:'models/reference/sr07-salvage/SR07-original.glb',units:'display units'};
  root.updateMatrixWorld(true);
  return root;
}
