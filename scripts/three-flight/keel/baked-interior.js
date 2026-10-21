import * as THREE from 'three';

// The build writes final vertex buffers and face planes; the browser only binds
// them to the original materials. Anchors and transforms retain their meaning.
export function mountBakedInterior(root,materials,{tree,geometries,buffer}){
 const decoded=geometries.map(data=>{
  const g=new THREE.BufferGeometry();
  for(const [name,a]of Object.entries(data.attributes))g.setAttribute(name,new THREE.BufferAttribute(new Float32Array(buffer,a.offset,a.length),a.size));
  if(data.index)g.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer,data.index.offset,data.index.length),1));
  if(data.planes)g.userData.cabinPlanes=new Float32Array(buffer,data.planes.offset,data.planes.length);
  g.groups=data.groups;g.boundingSphere=new THREE.Sphere(new THREE.Vector3(...data.sphere.center),data.sphere.radius);
  return g;
 });
 const node=data=>{
  const o=data.geometry==null?new THREE.Group():new THREE.Mesh(decoded[data.geometry],Array.isArray(data.material)?data.material.map(k=>materials[k]):materials[data.material]);
  o.name=data.name;o.position.fromArray(data.position);o.quaternion.fromArray(data.quaternion);o.scale.fromArray(data.scale);o.userData=data.userData;
  o.castShadow=data.castShadow;o.receiveShadow=data.receiveShadow;
  for(const child of data.children)o.add(node(child));return o;
 };
 for(const child of tree.children)root.add(node(child));
}

export async function loadBakedCabins(base,signal){
 const read=async name=>{const r=await fetch(base+name,{signal});if(!r.ok)throw Error('驾驶舱资源加载失败：'+name);return name.endsWith('.json')?r.json():r.arrayBuffer();};
 const [data,buffer]=await Promise.all([read('cabins.json'),read('cabins.bin')]);
 return Object.fromEntries(Object.entries(data).map(([kind,room])=>[kind,{...room,buffer}]));
}
