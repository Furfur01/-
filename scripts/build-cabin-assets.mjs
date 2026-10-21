import path from 'node:path';
import {createKeelInterior} from './three-flight/keel/interior.js';
import {createFighterInterior} from './three-flight/keel/fighter.js';
import {createBattleshipInterior} from './three-flight/keel/battleship.js';
import {createFlagshipInterior} from './three-flight/keel/flagship.js';
import {cabinFacePlanes} from './three-flight/keel/face-culling.js';
import {writeBuildFile} from './write-build-file.mjs';

// Same authored factories, built once alongside fleet assets. No browser or GPU
// dependency: shaders are compiled later on the player's actual WebGL context.
export function buildCabinAssets(directory){
 const chunks=[],rooms={};let offset=0;
 const pack=array=>{const bytes=Buffer.from(array.buffer,array.byteOffset,array.byteLength),range={offset,length:array.length};chunks.push(bytes);offset+=bytes.length;return range;};
 for(const [kind,factory]of Object.entries({horizon:createKeelInterior,fighter:createFighterInterior,bastion:createBattleshipInterior,flagship:createFlagshipInterior})){
  const room=factory(),geometries=[],ids=new Map(),materials=new Map(Object.entries(room.materials).map(([key,m])=>[m,key]));
  try{
   const node=o=>{
    const data={name:o.name,position:o.position.toArray(),quaternion:o.quaternion.toArray(),scale:o.scale.toArray(),userData:o.userData,castShadow:o.castShadow,receiveShadow:o.receiveShadow,children:o.children.map(node)};
    if(o.isMesh){
     const g=o.geometry;if(!ids.has(g)){
      const attributes=Object.fromEntries(Object.entries(g.attributes).map(([name,a])=>[name,{...pack(Float32Array.from(a.array)),size:a.itemSize}]));
      g.computeBoundingSphere();const geometry={attributes,groups:g.groups,sphere:{center:g.boundingSphere.center.toArray(),radius:g.boundingSphere.radius}};
      if(g.index)geometry.index=pack(Uint32Array.from(g.index.array));
      if(!g.groups.length)geometry.planes=pack(cabinFacePlanes(g));
      ids.set(g,geometries.length);geometries.push(geometry);
     }
     data.geometry=ids.get(g);data.material=Array.isArray(o.material)?o.material.map(m=>materials.get(m)):materials.get(o.material);
     if(data.material==null)throw Error('Unregistered cabin material: '+o.name);
    }return data;
   };
   rooms[kind]={tree:node(room.interior),geometries,stats:room.stats};
  }finally{room.dispose();}
 }
 writeBuildFile(path.join(directory,'cabins.bin'),Buffer.concat(chunks));
 writeBuildFile(path.join(directory,'cabins.json'),JSON.stringify(rooms));
 console.log(`Cabins baked: ${(offset/1048576).toFixed(1)} MiB, four original interiors`);
}
