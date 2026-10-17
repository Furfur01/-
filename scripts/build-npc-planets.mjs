import fs from 'node:fs/promises';
import path from 'node:path';
import {createPlanet,inspectModel,entries} from '../models/generated/npc-planets-apk-v1/models.js';
import {npcTypes} from '../game/npc-types.mjs';
const destination=path.resolve('opendesign/mockups/galactic-command/assets/npc-planets');
await fs.mkdir(destination,{recursive:true});
const manifest={version:1,stride:12,source:'Approved npc-planets-apk-v1 exact geometry, linear base color and emissive attributes',models:{}};
for(const entry of entries){
  const root=createPlanet(entry.id),arrays=[];root.updateMatrixWorld(true);
  root.traverse(mesh=>{if(!mesh.isMesh)return;const g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry,p=g.attributes.position,n=g.attributes.normal,c=g.attributes.color,m=mesh.material,data=new Float32Array(p.count*12);
    for(let i=0;i<p.count;i++){const k=i*12;data.set([p.getX(i),p.getY(i),p.getZ(i),n.getX(i),n.getY(i),n.getZ(i),m.color.r*(c?c.getX(i):1),m.color.g*(c?c.getY(i):1),m.color.b*(c?c.getZ(i):1),m.emissive.r*m.emissiveIntensity,m.emissive.g*m.emissiveIntensity,m.emissive.b*m.emissiveIntensity],k);}arrays.push(data);
  });
  const packed=new Float32Array(arrays.reduce((s,a)=>s+a.length,0));let offset=0;for(const a of arrays){packed.set(a,offset);offset+=a.length;}
  if(!packed.every(Number.isFinite))throw Error('Invalid NPC buffer');
  await fs.writeFile(path.join(destination,entry.id+'.bin'),Buffer.from(packed.buffer));
  const type=npcTypes.find(t=>t.id===entry.id);manifest.models[entry.id]={name:type.name,level:type.level,skin:type.skin,file:entry.id+'.bin',vertices:packed.length/12,bytes:packed.byteLength,...inspectModel(root)};
}
await fs.writeFile(path.join(destination,'manifest.json'),JSON.stringify(manifest,null,2));console.log('Five approved NPC meshes exported:',Object.values(manifest.models).map(m=>`${m.name} ${m.triangles} triangles`).join(', '));
