import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createPlanet,entries,inspectModel} from './models.js';
const dir=path.dirname(fileURLToPath(import.meta.url));
// The texture-free exporter needs only Blob -> ArrayBuffer in Node.
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(r=>{this.result=r;this.onloadend?.();});}readAsDataURL(blob){blob.arrayBuffer().then(r=>{this.result='data:application/octet-stream;base64,'+Buffer.from(r).toString('base64');this.onloadend?.();});}};
const manifest={version:1,created:'2026-10-15',status:'review-only',coordinateSystem:'Y up, radius approximately 1',source:'Local APK icons 18,20,19,28,34; original geometry authored in models.js',models:[]};
await fs.mkdir(path.join(dir,'references'),{recursive:true});
for(const e of entries){
  const model=createPlanet(e.id),before=inspectModel(model);if(!before.finite)throw Error('Non-finite geometry '+e.id);
  const binary=await new GLTFExporter().parseAsync(model,{binary:true,onlyVisible:true});
  await fs.writeFile(path.join(dir,e.id+'.glb'),Buffer.from(binary));
  const restored=await new GLTFLoader().parseAsync(binary,''),after=inspectModel(restored.scene);
  if(before.triangles!==after.triangles||before.meshes!==after.meshes||!after.finite)throw Error('GLB roundtrip mismatch '+e.id);
  await fs.copyFile(path.resolve(dir,'../../../opendesign/mockups/galaxy-empire/assets/original/scenes',`npc-planet-${e.ref}.png`),path.join(dir,'references',`apk-${e.ref}.png`));
  manifest.models.push({...e,file:e.id+'.glb',bytes:binary.byteLength,...before,roundtripVerified:true});
}
await fs.writeFile(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2));
await build({entryPoints:[path.join(dir,'preview.js')],outfile:path.join(dir,'preview.bundle.js'),bundle:true,format:'esm',minify:true});
console.log(JSON.stringify(manifest,null,2));
