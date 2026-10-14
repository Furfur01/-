import fs from 'node:fs';

// Adapt only the supplied model builders; never execute the HTML or its loader.
const source=fs.readFileSync(new URL('../models/reference/death-star-user-20261014/Death_Star_Threejs.html',import.meta.url),'utf8').replaceAll('\r','');
const between=(a,b)=>{const start=source.indexOf(a),end=source.indexOf(b,start);if(start<0||end<0)throw Error('Missing source anchor');return source.slice(start,end);};
let model=between('  // Large plates','  await progress(\'布置星空');
model=model.replaceAll('Math.min(8,renderer.capabilities.getMaxAnisotropy())','8');
model=model.replace('const maps=makeHullMaps();',"const maps=typeof document==='undefined'?{}:makeHullMaps();");
model=model.replace('map:maps.map,bumpMap:maps.bumpMap,','...maps,').replace('emissiveMap:maps.emissiveMap,','');
const clipStart=model.indexOf('  function clipHull('),clipEnd=model.indexOf('  const hullMat=',clipStart);
model=model.slice(0,clipStart)+model.slice(clipEnd);
model=model.replace('addMat(clipHull(new T.MeshStandardMaterial','addMat(new T.MeshStandardMaterial').replace('metalness:.36})));','metalness:.36}));');
model=model.replace('new T.SphereGeometry(R,CFG.surfaceSegments,CFG.surfaceRings)','createOpenHull(R,CFG.surfaceSegments,CFG.surfaceRings,D,dishRimZ,CFG.trenchHalfHeight)');
model=model.replace(/  hull.customDepthMaterial=.*\n/,'');
model=model.replace(/  await progress\([^\n]+\n/g,'');
model=model.replace("  const dc=document.createElement('canvas');", "  let dishTexture,dishBump;\n  if(typeof document!=='undefined'){\n  const dc=document.createElement('canvas');");
model=model.replace('const dishTexture=new T.CanvasTexture(dc);','dishTexture=new T.CanvasTexture(dc);');
model=model.replace('const dishBump=dishTexture.clone();','dishBump=dishTexture.clone();');
model=model.replace('dishBump.needsUpdate=true;','dishBump.needsUpdate=true;\n  }');
model=model.replace('color:0xc4c6c9,map:dishTexture,bumpMap:dishBump,','color:0xc4c6c9,...(dishTexture?{map:dishTexture,bumpMap:dishBump}:{}),');
const header=`import * as T from 'three';
import {createOpenHull} from './death-star-hull.js';

// Adapted from the user-supplied Death Star observatory (source header: MIT).
// Regenerate with node scripts/import-death-star.mjs. UI, lights and CDN loader
// belong to the original viewer and are deliberately outside this model factory.
export function createDeathStar(){
${between('  const CFG =','  const stage =')}
  const station=new T.Group();station.name='Death_Star';
  let geometricParts=0;
  const addMat=m=>m;
  const metal=(color,rough=.78,metallic=.42)=>addMat(new T.MeshStandardMaterial({color,roughness:rough,metalness:metallic}));
  const charcoal=metal(0x191d23,.9,.3),trim=metal(0x50565d,.65,.55),darkSteel=metal(0x2c323a,.86,.48);
`;
const footer=`
  hull.name='Death_Star_open_armor';dish.name='Death_Star_concave_superlaser';
  bowl.name='Death_Star_parabolic_bowl';greebles.name='Death_Star_surface_machinery';
  trench.name='Death_Star_equatorial_trench';
  // Keep the previous station's display diameter and face the fleet's -Z bow.
  station.scale.setScalar(.0692);station.rotation.y=Math.PI;
  station.userData={modelId:'Death_Star',revision:'death-star-user-01',
    reference:'Death_Star_Threejs (1).html',referenceGeometry:true,silhouetteVerified:false,
    source:'models/reference/death-star-user-20261014/Death_Star_Threejs.html',
    geometricParts,emitterCount:emitters.length,dishRadius:CFG.dishRadius,
    dishDepth:CFG.dishDepth,referenceRadius:R};
  station.updateMatrixWorld(true);
  return station;
}
`;
fs.writeFileSync(new URL('../opendesign/mockups/galactic-command/death-star-reference.js',import.meta.url),header+model+footer);
console.log('Imported Death Star geometry and procedural texture builders');
