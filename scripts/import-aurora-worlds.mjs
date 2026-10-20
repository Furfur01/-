import fs from 'node:fs';
import path from 'node:path';
import {transform} from 'esbuild';
const root=process.cwd();
const input=process.argv[2]||'C:/Users/Administrator/Downloads/AURORA_Worlds (1).html';
const archive=path.join(root,'opendesign/tools/aurora-world-import');
fs.mkdirSync(archive,{recursive:true});
if(!fs.existsSync(path.join(archive,'reference.html')))fs.copyFileSync(input,path.join(archive,'reference.html'));
const html=fs.readFileSync(input,'utf8'),js=html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1];
const formatted=(await transform(js,{minify:false,legalComments:'none'})).code;
const slice=(a,b)=>{const start=formatted.indexOf(a),end=formatted.indexOf(b,start);if(start<0||end<0)throw Error('Missing import boundary '+a);return formatted.slice(start,end).replace(/^  /gm,'');};
const field=slice('  function Jc(', '  async function fy(');
let source=slice('  var tr =','  function Jc(')+slice('  async function fy(', '  var ll =')+slice('  var yy =','  var Ot =')+slice('  function Rf(', '  var Oh =');
// Integration seams: caller-owned layout, real lunar storage IDs, and cancellation.
source=source.replace('function Rh(i, { stage: t = 3, buildings: e = null } = {}) {','function Rh(i, { stage: t = 3, buildings: e = null, placements = null } = {}) {').replace('let h = Hy(i, r);','let h = placements || Hy(i, r);');
// Retain the exact pure field/array generators, but let the host cancel obsolete jobs.
source=source.slice(0,source.indexOf('async function fy('))+`async function fy(field,quality,useWorker,signal) {
 signal?.throwIfAborted();
 if(!useWorker||typeof Worker==='undefined'||typeof Blob==='undefined')return {arrays:$c(field,quality),usedWorker:false};
 const code='const createWorldField='+Jc.toString()+';const makeTerrainArrays='+$c.toString()+';onmessage=event=>{try{const {type,seed,quality}=event.data;const a=makeTerrainArrays(createWorldField(type,seed),quality);postMessage(a,[a.positions.buffer,a.colors.buffer,a.materialIndices.buffer,a.waterPositions.buffer,a.waterColors.buffer]);}catch(e){postMessage({error:String(e.stack||e)});}}';
 const url=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));let worker,abort;
 try{return {arrays:await new Promise((resolve,reject)=>{
  worker=new Worker(url);abort=()=>reject(signal.reason||new DOMException('Cancelled','AbortError'));signal?.addEventListener('abort',abort,{once:true});
  worker.onmessage=e=>e.data.error?reject(new Error(e.data.error)):resolve(e.data);worker.onerror=e=>reject(new Error(e.message));worker.postMessage({type:field.type,seed:field.seed,quality});
 }),usedWorker:true};}catch(error){signal?.throwIfAborted();return {arrays:$c(field,quality),usedWorker:false};}
 finally{signal?.removeEventListener('abort',abort);worker?.terminate();URL.revokeObjectURL(url);}
}
`+source.slice(source.indexOf('function py('));
source=source.replace('worker: e = false, exclusions: n = []','worker: e = false, exclusions: n = [], signal').replace('await fy(i, t, e)','await fy(i, t, e, signal)');
// Preserve the supplied gas art, but yield between texture strips/cloud decks.
// The old synchronous gas path could block a navigation frame for hundreds of ms.
source=source.replace('function ay(i, t) {','async function ay(i, t, {yieldWork=false, signal}={}) {\n  signal?.throwIfAborted();');
source=source.replace('for (let l = 0; l < n; l++) {\n    let c = (1 - (l + 0.5) / n)', 'for (let l = 0; l < n; l++) {\n    if(yieldWork&&l%8===0){await new Promise(resolve=>setTimeout(resolve,0));signal?.throwIfAborted();}\n    let c = (1 - (l + 0.5) / n)');
source=source.replace('function tf(i, { quality: t = "high" } = {}) {','async function tf(i, { quality: t = "high", yieldWork=false, signal } = {}) {');
source=source.replace('a = ay(o, t)', 'a = await ay(o, t, {yieldWork,signal})');
// Once GPU resources exist, finish this small assembly so the surface owner can
// dispose an obsolete generation through its normal completion path.
source=source.replace('for (let w = 0; w < 3; w++) {\n    let b = new lt();','for (let w = 0; w < 3; w++) {\n    if(yieldWork)await new Promise(resolve=>setTimeout(resolve,0));\n    let b = new lt();');
source=source.replace('return tf(i, { quality: t });', 'return tf(i, { quality: t, yieldWork: e, signal });');
const storage=`
// Lunar stores reuse the supplied mine storage modules, with their own game IDs.
for (const [id, owner] of Object.entries({Metal_Storage:'Metal_Mine',Crystal_Storage:'Crystal_Mine',Gas_Storage:'Gas_Mine'})) {
  Eh[id] = stage => {
    const full=wh(owner,stage),part=full.getObjectByName(id);
    part.removeFromParent();part.position.set(0,0,0);part.updateMatrixWorld(true);
    const box=new rn().setFromObject(part),center=box.getCenter(new P());
    part.position.set(-center.x,-box.min.y,-center.z);
    const root=new Ne();root.add(part);root.userData={groundReferenceY:0,stage};
    const shared=new Set(th.values()),unused=new Set();full.traverse(o=>{if(o.geometry&&!shared.has(o.geometry))unused.add(o.geometry)});unused.forEach(g=>g.dispose());
    return root;
  };
  gl.push({id,name:id,number:gl.length+1,signature:'original-storage-module'});
}
`;
source=source.replace('var pi = 1.4,',storage+'\nvar pi = 1.4,');
// The original footprint probe model is CPU-only and must not retain geometry.
source=source.replace('return Th.set(i, o), o;', 'const shared=new Set(th.values()),discarded=new Set();t.traverse(n=>{if(n.geometry&&!shared.has(n.geometry))discarded.add(n.geometry)});discarded.forEach(g=>g.dispose());return Th.set(i, o), o;');
source+='\nexport const sharedModelGeometries=()=>new Set(th.values());\n';
source+='\nexport {Qd as GAS_PALETTES,oy as createGasSampler,dy as createGasRings};\n';

const imports={Ke:'MathUtils',P:'Vector3',lt:'Vector2',hn:'Quaternion',me:'Matrix4',rn:'Box3',En:'Euler',Ne:'Group',He:'Object3D',Xt:'Mesh',_s:'InstancedMesh',ue:'BufferGeometry',ze:'BufferAttribute',Jt:'Float32BufferAttribute',ie:'Color',sn:'MeshStandardMaterial',Hi:'MeshBasicMaterial',gn:'ShaderMaterial',Rr:'DataTexture',$e:'SphereGeometry',$n:'BoxGeometry',Es:'DodecahedronGeometry',Fr:'ExtrudeGeometry',Fs:'RingGeometry',Ms:'CircleGeometry',Ss:'ConeGeometry',Tn:'LatheGeometry',Us:'TorusGeometry',Vi:'Shape',Wi:'IcosahedronGeometry',un:'CylinderGeometry',Ws:'AdditiveBlending',Je:'BackSide',on:'DoubleSide',Ln:'FrontSide',ai:'NormalBlending',Ze:'SRGBColorSpace',Hn:'NoColorSpace',_n:'RGBAFormat',Rn:'UnsignedByteType',Mr:'RepeatWrapping',On:'ClampToEdgeWrapping',Kn:'LinearMipmapLinearFilter',bn:'LinearFilter'};
const header='// Extracted from the user-supplied AURORA_Worlds (1).html.\n// Keep the supplied art and dimensions; integration belongs in aurora-world-surface.js.\n';
const out=path.join(root,'scripts/universe/aurora-worlds');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'field.js'),header+field+'\nexport {Jc as createWorldField, $c as makeTerrainArrays};\n');
fs.writeFileSync(path.join(out,'source.js'),header+'import {'+Object.entries(imports).map(([alias,name])=>name+' as '+alias).join(',')+"} from 'three';\nimport {ConvexGeometry as to} from 'three/addons/geometries/ConvexGeometry.js';\nimport {mergeGeometries as jd} from 'three/addons/utils/BufferGeometryUtils.js';\nimport {createWorldField as Jc,makeTerrainArrays as $c} from './field.js';\n"+source+'\nexport {Kc as createWorldTerrain,Rh as createWorldFacilities,Hy as createWorldLayout,yl as buildingFootprint,yf as localTerrainSampler,gl as FACILITIES,tr as GAS_VARIANTS,pi as MODEL_SCALE,wh as createFacilityModel,Rf as mergeStationary,df as collectMotions,ff as animateMotions,_l as stableHash};\n');
console.log('Extracted field + art source; original archived at '+archive);

