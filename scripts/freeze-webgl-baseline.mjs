import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const source=path.join(root,'opendesign/mockups/galactic-command');
export const baselineDirectory=path.join(source,'legacy-webgl');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const files=['battlefield.html','hangar.html','flight-loader.js','ship-renderer.js','flight-runtime.js','battlefield-controller.js','battle-display.js','flight-fleet.json','flight-fleet.bin','battle-fleet.json','battle-fleet.bin'];

// Immutable comparison fixture. A normal build verifies it; it never refreshes it.
export function freezeWebGLBaseline(){
  const manifestPath=path.join(baselineDirectory,'manifest.json');
  if(fs.existsSync(manifestPath)){
    const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
    for(const [name,info] of Object.entries(manifest.files)){
      if(hash(fs.readFileSync(path.join(baselineDirectory,name)))!==info.sha256)throw Error('Legacy baseline changed: '+name);
    }
    return manifest;
  }
  fs.mkdirSync(path.join(baselineDirectory,'sky'),{recursive:true});
  const manifest={version:'webgl-before-three-20261015',createdAt:new Date().toISOString(),description:'Frozen native WebGL baseline; only asset/navigation paths relocated.',files:{}};
  for(const name of files){
    const original=fs.readFileSync(path.join(source,name));let data=original;
    if(name==='ship-renderer.js')data=Buffer.from(original.toString().replace("const base='/opendesign/shared/assets/'","const base='/opendesign/mockups/galactic-command/legacy-webgl/sky/'"));
    if(name==='flight-runtime.js')data=Buffer.from(original.toString().replaceAll("location.assign('ships.html?ship='","location.assign('../ships.html?ship='"));
    fs.writeFileSync(path.join(baselineDirectory,name),data);
    manifest.files[name]={bytes:data.length,sha256:hash(data),sourceSha256:hash(original)};
  }
  for(const name of ['multi-nebulae-2-rgbm.png','multi-nebulae-2.webp']){
    const bytes=fs.readFileSync(path.join(root,'opendesign/shared/assets',name));
    fs.writeFileSync(path.join(baselineDirectory,'sky',name),bytes);
    manifest.files['sky/'+name]={bytes:bytes.length,sha256:hash(bytes)};
  }
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
  return manifest;
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename)){
  console.log(JSON.stringify({directory:baselineDirectory,version:freezeWebGLBaseline().version}));
}
