import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {build} from 'esbuild';
import {createShipModel,disposeShip} from '../galactic-command/ship-models.js';

const dir=path.dirname(fileURLToPath(import.meta.url));
const source=process.argv[2]||'C:/Users/Administrator/Downloads/VALIANT_TALON_Dual_GUI.html';
await fs.mkdir(path.join(dir,'assets'),{recursive:true});
let html=await fs.readFile(source,'utf8');
const hash=createHash('sha256').update(html).digest('hex');
let scriptIndex=0,styleIndex=0;
const scripts=['reference-renderer.js','reference-simulation.js','reference-hud.js'];
const writes=[];
html=html.replace(/<style>([\s\S]*?)<\/style>/g,(_,css)=>{
 const name=`reference-${++styleIndex}.css`;writes.push(fs.writeFile(path.join(dir,'assets',name),css));
 return `<link rel="stylesheet" href="assets/${name}">`;
});
html=html.replace(/<script>([\s\S]*?)<\/script>/g,(_,code)=>{
 const name=scripts[scriptIndex++];if(!name)throw Error('Unexpected reference script');
 // Keep the fighter formation identical, with a distinct screen formation added.
 code=code.replace("if(s.shipIndex===3){return hud.formation==='line'?", "if(s.shipIndex===3){if(hud.formation==='screen')return [[-65,4,60],[70,5,65],[-145,12,155],[155,12,160]];return hud.formation==='line'?");
 // In this preview, return drones keep their actual location while joining the carrier.
 code=code.replace('for(let i=0;i<hud.friends.length;i++){const f=hud.friends[i];let goal;', 'for(let i=0;i<hud.friends.length;i++){const f=hud.friends[i];if(f.drone)continue;let goal;');
 code=code.replace('if(hud.hangar&&s.shipIndex===4&&', 'if(!window.PreviewHUD&&hud.hangar&&s.shipIndex===4&&');
 if(name==='reference-simulation.js')code=code.replace('function fireMain(){', "function fireMain(){if(window.PreviewHUD?.mode==='flagship')return;if(window.PreviewHUD?.mode==='battleship'){fireTurrets();return;}");
 code=code.replace('M.compose(f.pos,[.035,-p.yaw-Math.PI/2,-Math.sin(p.elapsed*.6)*.035]', 'M.compose(f.pos,[.035,f.drone?f.heading:-p.yaw-Math.PI/2,-Math.sin(p.elapsed*.6)*.035]');
 code=code.replace('projection[9]=-.06;', "projection[9]=window.PreviewHUD?.mode==='flagship'&&p.external?-.38:-.06;");
 code=code.replace('this.projectionOffset=-.06;', 'this.projectionOffset=projection[9];');
 writes.push(fs.writeFile(path.join(dir,'assets',name),code));
 return `<script src="assets/${name}"></script>`;
});
if(scriptIndex!==3)throw Error('Reference script count changed');
html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>银河帝国 · 三舰桥 HUD 预览</title>');
html=html.replace('</head>','<link rel="stylesheet" href="preview.css"></head>');
html=html.replace('</body>','<div id="hud-preview"></div><script type="module" src="preview.js"></script></body>');
// Separate markup lines while preserving embedded SVGs and images from the reference.
html=html.replace(/><(?=\/?(?:div|section|aside|header|footer|main|nav|button|p|h[1-6])\b)/g,'>\n<');
writes.push(fs.writeFile(path.join(dir,'index.html'),html));
await Promise.all(writes);

const model=createShipModel('Iron_Behemoth');
try{
 model.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(model),center=bounds.getCenter(new THREE.Vector3());
 const factor=32/(bounds.max.z-bounds.min.z),vertices=[];
 model.traverse(mesh=>{
  if(!mesh.isMesh)return;
  const g=mesh.geometry,nm=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld),p=new THREE.Vector3(),n=new THREE.Vector3();
  const material=Array.isArray(mesh.material)?mesh.material[0]:mesh.material;
  const color=material.color?.clone().convertLinearToSRGB().toArray()||[.6,.7,.8];
  for(let i=0;i<(g.index?.count||g.attributes.position.count);i++){
   const j=g.index?g.index.getX(i):i;p.fromBufferAttribute(g.attributes.position,j).applyMatrix4(mesh.matrixWorld).sub(center).multiplyScalar(factor);
   n.fromBufferAttribute(g.attributes.normal,j).applyNormalMatrix(nm);
   const c=g.attributes.color?[g.attributes.color.getX(j),g.attributes.color.getY(j),g.attributes.color.getZ(j)]:color;
   vertices.push(p.z,p.y,-p.x,n.z,n.y,-n.x,...c,Math.min(.8,material.emissiveIntensity&&material.emissive?.getHex()?material.emissiveIntensity:0),0,0,0);
  }
 });
 await fs.writeFile(path.join(dir,'assets/flagship.bin'),Buffer.from(new Float32Array(vertices).buffer));
 console.log(`Flagship snapshot: ${vertices.length/39} triangles`);
}finally{disposeShip(model);}
await fs.writeFile(path.join(dir,'asset-sources.json'),JSON.stringify({reference:{source,sha256:hash},flagship:{source:'opendesign/mockups/galactic-command/ship-models.js#createShipModel',id:'Iron_Behemoth'},mode:'isolated browser-only preview; no game API or save access'},null,2));
await build({entryPoints:[path.join(dir,'src/app.jsx')],bundle:true,format:'esm',outfile:path.join(dir,'preview.js'),minify:true,jsx:'automatic'});
console.log('Three HUD preview built');
