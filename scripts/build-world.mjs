import path from 'node:path';
import {build} from 'esbuild';
import {writeBuildFile} from './write-build-file.mjs';
const root=path.resolve(import.meta.dirname,'..'),dir=path.join(root,'opendesign/mockups/galactic-command');
// The formal entry owns exactly one renderer. Preview tools have separate build entries.
export async function buildWorld(){
 for(const [entry,out,format,globalName]of [
  [path.join(dir,'planet.js'),'planet.bundle.js','iife'],
  [path.join(dir,'live-battle.js'),'live-battle.bundle.js','iife'],
  [path.join(root,'scripts/universe/terrain-worker.js'),'terrain-worker.js','esm'],
  [path.join(root,'scripts/universe/ship-catalog.js'),'ship-catalog.bundle.js','iife','UniverseShipCatalog']
 ]){
  const result=await build({entryPoints:[entry],bundle:true,format,globalName,minify:true,target:'es2022',write:false,outfile:path.join(dir,out)});
  for(const file of result.outputFiles)writeBuildFile(file.path,file.contents);
 }
}
await buildWorld();
