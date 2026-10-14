import fs from 'node:fs';
import path from 'node:path';
import {transform} from 'esbuild';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'..'),dir=path.join(root,'opendesign/mockups/planet-construction-review');
let source=fs.readFileSync(path.join(dir,'aurora-runtime.js'),'utf8');
for(const part of ['moon','biomes','volcanoes','bridges','terrain','elevator','geology','game-bridge','celestial','navigation','lod']){
  const marker=`/*__AURORA_${part.toUpperCase()}__*/`;
  if(!source.includes(marker))throw new Error(`Missing source marker: ${marker}`);
  source=source.replace(marker,()=>fs.readFileSync(path.join(dir,`aurora-${part}.js`),'utf8'));
}
source=source.replace('/*__AURORA_DETAIL_CLIENT__*/',()=>fs.readFileSync(path.join(dir,'aurora-detail-client.js'),'utf8'));
new vm.Script(source,{filename:'aurora-assembled.js'});
const result=await transform(source,{minify:true,target:'es2020',legalComments:'none'});
fs.writeFileSync(path.join(dir,'review.bundle.js'),result.code);
fs.copyFileSync(path.join(dir,'aurora-shell.html'),path.join(dir,'index.html'));
const sections=['mockups','design-systems'].map(id=>{
  const base=path.join(root,'opendesign',id),groups=[];
  if(fs.existsSync(base))for(const sub of fs.readdirSync(base,{withFileTypes:true}).filter(d=>d.isDirectory())){
    const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(p,d.name)):[path.join(p,d.name)]);
    const files=walk(path.join(base,sub.name)).filter(p=>id!=='mockups'||p.endsWith('.html')).map(p=>({label:path.basename(p),path:path.relative(path.join(root,'opendesign'),p).replaceAll('\\','/')}));
    if(files.length)groups.push({slug:sub.name,files});
  }
  return {id,label:id==='mockups'?'Mockups':'Design Systems',groups};
});
fs.writeFileSync(path.join(root,'opendesign/manifest.json'),JSON.stringify({generated:new Date().toISOString(),sections},null,2));
console.log('Shared AURORA renderer built: independent review and production views.');
