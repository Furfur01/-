// Extract the user's authored HELIOS machinery, not its renderer or bundled Three.
// Re-run only when replacing the retained source; runtime edits belong in the adapter.
import fs from 'node:fs';
import path from 'node:path';
import {build,transform} from 'esbuild';

const root=path.resolve(import.meta.dirname,'..');
const industry=process.argv[2]==='--industry';
const source=(industry?process.argv[3]:process.argv[2])||path.join(root,industry?'models/reference/helios-asteroid-miner.html':'models/reference/helios-megastructures.html');
const html=fs.readFileSync(source,'utf8');
const bundled=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)][1][1];
if(industry){
 // Import only the replacement miner and its dependencies, leaving other approved facilities intact.
 const section=(start,end)=>{const a=bundled.indexOf(start),b=bundled.indexOf(end,a);if(a<0||b<a)throw Error('Missing HELIOS miner section: '+start);return bundled.slice(a,b);};
 let code=section('var ge=Math.PI*2','var Jh=')+section('var Mi=Math.PI*2','function Nv(')+section('function ru(','function Fv(')+section('function Ov(','var Pt=');
 // Expose orbital layout independently of machinery size; defaults retain the reference.
 code=code.replace('function Wf(){','function Wf({orbitRadius=320,beltInnerRadius=306,beltWidth=57,stationRadius=270}={}){')
  .replace('Math.cos(p)*270,6,Math.sin(p)*270','Math.cos(p)*stationRadius,6,Math.sin(p)*stationRadius')
  .replace('i.extentRadius=402','i.extentRadius=Math.max(orbitRadius+82,beltInnerRadius+beltWidth+39)')
  .replace('orbitRadius:320','orbitRadius:orbitRadius')
  .replace('P=306+t()*57','P=beltInnerRadius+t()*beltWidth');
 const imports=`import {ConeGeometry as mi,MathUtils as Ae,Vector2 as Q,Vector3 as R,MeshStandardMaterial as ze,Group as cn,Mesh as se,BoxGeometry as Pn,CylinderGeometry as Ii,TorusGeometry as ro,MeshBasicMaterial as rn,BufferGeometry as Qt,Line as pi,LineBasicMaterial as fi,Float32BufferAttribute as zt,Color as Ct,ShaderMaterial as oe,SphereGeometry as Xn,Shape as ti,ExtrudeGeometry as gi,CatmullRomCurve3 as on,RingGeometry as is,BufferAttribute as we,IcosahedronGeometry as Dn,Object3D as ve,InstancedMesh as Gn,TubeGeometry as qn,Sphere as je,CubicBezierCurve3 as $s,AdditiveBlending as Se,DoubleSide as Pe,DynamicDrawUsage as yo} from 'three';\nimport {mergeGeometries as nc} from 'three/addons/utils/BufferGeometryUtils.js';\n`;
 const result=await build({stdin:{contents:imports+code+'\nexport {Wf as createAsteroidIndustry};',resolveDir:root,sourcefile:'helios-asteroid-miner'},bundle:true,external:['three','three/*'],format:'esm',treeShaking:true,write:false});
 const destination=path.join(root,'scripts/universe/asteroid-miner.js');
 fs.writeFileSync(destination,'// User-supplied HELIOS mining machinery; regenerate with scripts/import-helios-megastructures.mjs --industry.\n'+result.outputFiles[0].text);
 console.log(path.relative(root,destination));
}else{
const start=bundled.indexOf('var ce=Math.PI*2'),end=bundled.indexOf('var At=i=>document.getElementById(i)');
if(start<0||end<start)throw Error('HELIOS source does not contain the expected machinery factories');
const imports=`import {MeshStandardMaterial as Ye,Group as bn,Mesh as oe,BoxGeometry as Rn,CylinderGeometry as Mi,TorusGeometry as jr,Vector3 as C,MeshBasicMaterial as fn,BufferGeometry as te,Line as ai,LineBasicMaterial as oi,Float32BufferAttribute as zt,Color as Ot,ShaderMaterial as ae,SphereGeometry as li,Points as pn,CanvasTexture as Br,Sprite as Or,SpriteMaterial as Os,QuadraticBezierCurve3 as Zi,LineDashedMaterial as no,Shape as bi,ExtrudeGeometry as Ji,ConeGeometry as Yi,CatmullRomCurve3 as Si,CircleGeometry as Hr,RingGeometry as Kr,BufferAttribute as Ae,PointsMaterial as Cn,IcosahedronGeometry as Ki,Object3D as Se,InstancedMesh as ri,TubeGeometry as Qr,Box3 as En,Sphere as Tn,MathUtils as ke,AdditiveBlending as Ce,DoubleSide as Ne,DynamicDrawUsage as lh,SRGBColorSpace as Xe} from 'three';\nimport {mergeGeometries as of} from 'three/addons/utils/BufferGeometryUtils.js';\n`;
let sourceCode=bundled.slice(start,end);
sourceCode=sourceCode.replace('uf(r,1,!0);','r.name="devourer-berth";');
// Keep the moving central hoist clear of the retained Devourer's upper armour.
sourceCode=sourceCode.replace('11,[v,-6,0]','5.5,[v,-3.25,0]').replace('[0,-11.5,0]','[0,-6,0]').replace('[v,-11,0]','[v,-5.5,0]').replace('u.position.y=-11.5+Math.sin(_*.21)*2.5','u.position.y=-6+Math.sin(_*.21)');
const result=await transform(imports+sourceCode+`\nexport {ff as createLogistics,_f as createDyson,pf as createGate,mf as createShipyard,vf as createHabitat,xf as createExtractor,Sf as createListener,af as mergeStaticMachinery};`,{loader:'js',format:'esm',minify:false});
const destination=path.join(root,'scripts/universe/megastructure-factories.js');
fs.writeFileSync(destination,'// Retained user-authored HELIOS machinery; extracted by scripts/import-helios-megastructures.mjs.\n'+result.code);
console.log(path.relative(root,destination));
}
