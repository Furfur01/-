import fs from 'node:fs';
import path from 'node:path';
import {build,transform} from 'esbuild';
import vm from 'node:vm';
import {writeBuildFile} from './write-build-file.mjs';
const root=path.resolve(import.meta.dirname,'..'),dir=path.join(root,'opendesign/mockups/planet-construction-review');
let source=fs.readFileSync(path.join(dir,'aurora-runtime.js'),'utf8');
for(const part of ['moon','biomes','volcanoes','bridges','terrain','elevator','geology','game-bridge','celestial','decorations','territory','strategy','gargantua','npcs','battles','logistics','galaxy','navigation','lod']){
  const marker=`/*__AURORA_${part.toUpperCase()}__*/`;
  if(!source.includes(marker))throw new Error(`Missing source marker: ${marker}`);
  source=source.replace(marker,()=>fs.readFileSync(path.join(dir,`aurora-${part}.js`),'utf8'));
}
source=source.replace('/*__AURORA_DETAIL_CLIENT__*/',()=>fs.readFileSync(path.join(dir,'aurora-detail-client.js'),'utf8'));
source=source.replace('/*__AURORA_GALAXY_LAYOUT__*/',()=>fs.readFileSync(path.join(dir,'galaxy-layout.json'),'utf8'));
new vm.Script(source,{filename:'aurora-assembled.js'});
const result=await transform(source,{minify:true,target:'es2020',legalComments:'none'});
writeBuildFile(path.join(dir,'review.bundle.js'),result.code);
writeBuildFile(path.join(dir,'index.html'),fs.readFileSync(path.join(dir,'aurora-shell.html')));
const sections=['mockups','design-systems'].map(id=>{
  const base=path.join(root,'opendesign',id),groups=[];
  if(fs.existsSync(base))for(const sub of fs.readdirSync(base,{withFileTypes:true}).filter(d=>d.isDirectory())){
    const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(p,d.name)):[path.join(p,d.name)]);
    const files=walk(path.join(base,sub.name)).filter(p=>id!=='mockups'||p.endsWith('.html')).map(p=>({label:path.basename(p),path:path.relative(path.join(root,'opendesign'),p).replaceAll('\\','/')}));
    if(files.length)groups.push({slug:sub.name,files});
  }
  return {id,label:id==='mockups'?'Mockups':'Design Systems',groups};
});
writeBuildFile(path.join(root,'opendesign/manifest.json'),JSON.stringify({generated:new Date().toISOString(),sections},null,2));
const fleetBuild=await build({entryPoints:[path.join(root,'scripts/three-flight/map-renderer.js')],bundle:true,format:'esm',minify:true,target:'es2022',write:false,outfile:path.join(dir,'map-fleet.bundle.js')});
for(const file of fleetBuild.outputFiles)writeBuildFile(file.path,file.contents);
console.log('Shared AURORA renderer built: independent review and production views.');
