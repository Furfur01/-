import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {freezeWebGLBaseline} from './freeze-webgl-baseline.mjs';
import {writeBuildFile} from './write-build-file.mjs';
import {units} from '../game/catalog.mjs';
import {combatProfile} from '../game/spatial-profiles.mjs';
import {buildCabinAssets} from './build-cabin-assets.mjs';

const root=path.resolve(import.meta.dirname,'..');
export async function buildThreeFlight(){
  freezeWebGLBaseline();
  const source=path.join(root,'scripts/three-flight'),out=path.join(root,'opendesign/mockups/galactic-command');
  const assets=path.join(out,'three-flight-assets');fs.mkdirSync(assets,{recursive:true});
  buildCabinAssets(assets);
  const hash=createHash('sha256');
  for(const name of ['flight-fleet.json','flight-fleet.bin','battle-fleet.json','battle-fleet.bin']){
    let bytes=fs.readFileSync(path.join(out,name));
    if(name.endsWith('.json')){
      const data=JSON.parse(bytes);
      for(const ship of data.ships){const u=units[ship.id];if(!u)continue;ship.stats=['strength','shield','attack','speed','cargo','fuel'].map(k=>u[k]);for(const k of ['statsSource','statsLabel','statsNote','economyLabel'])ship[k]=u[k];ship.combatRules={splashMultipliers:u.splashMultipliers,splashRadius:u.splashRadius,criticalChances:u.criticalChances,criticalMultiplier:u.criticalMultiplier};if(ship.profile)ship.profile=combatProfile(u);}
      // Reclassify the retained range metadata without rebuilding model geometry.
      const titan=data.ships.findIndex(s=>s.id==='Titanenergetic_Frigate');
      if(data.profiles&&titan>=0)Object.assign(data.profiles[titan],{capital:true,maxSpeed:120,turnRate:.3,turnResponse:2.8,accel:.4,mainCooldown:3.4,mainDamage:32});
      bytes=Buffer.from(JSON.stringify(data));
    }
    writeBuildFile(path.join(assets,name),bytes);hash.update(bytes);
  }
  const result=await build({entryPoints:[path.join(source,'entry.js')],bundle:true,format:'esm',target:'es2022',sourcemap:true,write:false,outfile:path.join(out,'three-flight.bundle.js')});
  for(const file of result.outputFiles){writeBuildFile(file.path,file.contents);hash.update(file.contents);}
  const version=hash.digest('hex').slice(0,12),template=fs.readFileSync(path.join(source,'page.html'),'utf8');
  for(const [name,mode,title] of [['battlefield-three.html','battlefield','舰队战场 · 银河帝国'],['hangar-three.html','practice','舰船靶场 · 银河帝国']]){
    writeBuildFile(path.join(out,name),template.replaceAll('{{MODE}}',mode).replaceAll('{{TITLE}}',title).replaceAll('{{VERSION}}',version));
  }
  // Keep bookmarks and external links working after retiring the native pages.
  // Death Star terrain remains an explicit archived scene, outside this migration.
  for(const name of ['battlefield','hangar']){
    writeBuildFile(path.join(out,name+'.html'),`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>银河帝国 · 正在进入战场</title></head><body><p>正在进入战场…</p><a id="continue" href="${name}-three.html">进入战场</a> · <a id="archive" href="legacy-webgl/${name}.html">原版归档</a><script>
const query=new URLSearchParams(location.search);
const archived=query.get('map')==='death-star';
const target=(archived?'legacy-webgl/${name}.html':'${name}-three.html')+location.search+location.hash;
document.getElementById('continue').href=target;
document.getElementById('archive').href='legacy-webgl/${name}.html'+location.search+location.hash;
location.replace(target);
</script></body></html>\n`);
  }
  writeBuildFile(path.join(assets,'manifest.json'),JSON.stringify({version,renderer:'three-webgl2',baseline:'legacy-webgl/manifest.json'},null,2)+'\n');
  console.log('Three.js flight built: /opendesign/mockups/galactic-command/battlefield-three.html');
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename))await buildThreeFlight();
