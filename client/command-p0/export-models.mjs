import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createShipModel,disposeShip} from '../../opendesign/mockups/galactic-command/ship-models.js';
import {createDefenseModel} from '../../scripts/three-flight/defense-models.js';

// Snapshot the existing fleet and ground-defense factories into the UI asset directory.
export async function exportModels(dir,ships){
 const oldReader=globalThis.FileReader;
 globalThis.FileReader=class{
  readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.();}).catch(error=>{this.error=error;this.onerror?.(error);});}
 };
 const sources=[];
 try{
  for(const ship of ships){
   const defense=ship.type==='defense',model=defense?createDefenseModel(ship.id):createShipModel(ship.id);
   try{
    assert.equal(defense?model.name:model.userData.modelId,ship.id,`Model identity mismatch: ${ship.id}`);
    model.userData={...model.userData,modelId:ship.id,apkId:ship.apkId,previewShipId:ship.id};
    // The battle renderer interprets this authored emission metadata itself.
    // GLTF viewers need it expressed as standard emissive material properties.
    if(defense)model.traverse(node=>{for(const material of node.material?(Array.isArray(node.material)?node.material:[node.material]):[]){if(material.userData.emission>0){material.emissive.copy(material.color);material.emissiveIntensity=material.userData.emission;}}});
    const bytes=Buffer.from(await new GLTFExporter().parseAsync(model,{binary:true,trs:true}));
    assert.equal(bytes.toString('ascii',0,4),'glTF');
    const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
    assert.ok(json.nodes.some(n=>n.extras?.previewShipId===ship.id));
    await fs.writeFile(path.join(dir,'assets/models',ship.id+'.glb'),bytes);
    sources.push({id:ship.id,apkId:ship.apkId,kind:defense?'Existing ground-defense model snapshot':'Current corrected fleet model snapshot; reconstructed geometry, not an APK 3D model',source:defense?'scripts/three-flight/defense-models.js#createDefenseModel':'opendesign/mockups/galactic-command/ship-models.js#createShipModel',target:`assets/p0/models/${ship.id}.glb`,revision:model.userData.revision||(defense?'existing foundry and shield geometry':'preserved approved geometry with corrected identity'),sha256:createHash('sha256').update(bytes).digest('hex')});
    console.log(`Model ${ship.id}: ${json.meshes.length} meshes, ${json.materials.length} materials`);
   }finally{disposeShip(model);}
  }
 }finally{
  if(oldReader===undefined)delete globalThis.FileReader;else globalThis.FileReader=oldReader;
 }
 return sources;
}
