import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createShipModel,disposeShip} from '../galactic-command/ship-models.js';

// Snapshot the same corrected model factory used by the current fleet viewer.
// Only this independent preview's asset directory is written.
export async function exportModels(dir,ships){
 const oldReader=globalThis.FileReader;
 globalThis.FileReader=class{
  readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.();}).catch(error=>{this.error=error;this.onerror?.(error);});}
 };
 const sources=[];
 try{
  for(const ship of ships){
   const model=createShipModel(ship.id);
   try{
    assert.equal(model.userData.modelId,ship.id,`Model identity mismatch: ${ship.id}`);
    model.userData={...model.userData,apkId:ship.apkId,previewShipId:ship.id};
    const bytes=Buffer.from(await new GLTFExporter().parseAsync(model,{binary:true,trs:true}));
    assert.equal(bytes.toString('ascii',0,4),'glTF');
    const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
    assert.ok(json.nodes.some(n=>n.extras?.previewShipId===ship.id));
    await fs.writeFile(path.join(dir,'assets/models',ship.id+'.glb'),bytes);
    sources.push({id:ship.id,apkId:ship.apkId,kind:'Current corrected fleet model snapshot; reconstructed geometry, not an APK 3D model',source:'opendesign/mockups/galactic-command/ship-models.js#createShipModel',target:`assets/models/${ship.id}.glb`,revision:model.userData.revision||'preserved approved geometry with corrected identity',sha256:createHash('sha256').update(bytes).digest('hex')});
    console.log(`Model ${ship.id}: ${json.meshes.length} meshes, ${json.materials.length} materials`);
   }finally{disposeShip(model);}
  }
 }finally{
  if(oldReader===undefined)delete globalThis.FileReader;else globalThis.FileReader=oldReader;
 }
 return sources;
}
