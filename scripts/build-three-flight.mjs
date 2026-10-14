import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {freezeWebGLBaseline} from './freeze-webgl-baseline.mjs';

const root=path.resolve(import.meta.dirname,'..');
export async function buildThreeFlight(){
  freezeWebGLBaseline();
  const source=path.join(root,'scripts/three-flight'),out=path.join(root,'opendesign/mockups/galactic-command');
  const assets=path.join(out,'three-flight-assets');fs.mkdirSync(assets,{recursive:true});
  const hash=createHash('sha256');
  for(const name of ['flight-fleet.json','flight-fleet.bin','battle-fleet.json','battle-fleet.bin']){
    const bytes=fs.readFileSync(path.join(out,name));fs.writeFileSync(path.join(assets,name),bytes);hash.update(bytes);
  }
  const result=await build({entryPoints:[path.join(source,'entry.js')],bundle:true,format:'esm',target:'es2022',sourcemap:true,write:false,outfile:path.join(out,'three-flight.bundle.js')});
  for(const file of result.outputFiles){fs.writeFileSync(file.path,file.contents);hash.update(file.contents);}
  const version=hash.digest('hex').slice(0,12),template=fs.readFileSync(path.join(source,'page.html'),'utf8');
  for(const [name,mode,title] of [['battlefield-three.html','battlefield','Three.js · 真实舰队战场'],['hangar-three.html','practice','Three.js · 独立靶场']]){
    fs.writeFileSync(path.join(out,name),template.replaceAll('{{MODE}}',mode).replaceAll('{{TITLE}}',title).replaceAll('{{VERSION}}',version));
  }
  // Keep bookmarks and external links working after retiring the native pages.
  // Death Star terrain remains an explicit archived scene, outside this migration.
  for(const name of ['battlefield','hangar']){
    fs.writeFileSync(path.join(out,name+'.html'),`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>银河帝国 · 正在进入 Three.js</title></head><body><p>正在进入战场…</p><a id="continue" href="${name}-three.html">进入 Three.js</a> · <a id="archive" href="legacy-webgl/${name}.html">原版归档</a><script>
const query=new URLSearchParams(location.search);
const archived=query.get('map')==='death-star';
const target=(archived?'legacy-webgl/${name}.html':'${name}-three.html')+location.search+location.hash;
document.getElementById('continue').href=target;
document.getElementById('archive').href='legacy-webgl/${name}.html'+location.search+location.hash;
location.replace(target);
</script></body></html>\n`);
  }
  fs.writeFileSync(path.join(assets,'manifest.json'),JSON.stringify({version,renderer:'three-webgl2',baseline:'legacy-webgl/manifest.json'},null,2)+'\n');
  console.log('Three.js flight built: /opendesign/mockups/galactic-command/battlefield-three.html');
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename))await buildThreeFlight();
