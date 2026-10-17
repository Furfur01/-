import fs from 'node:fs/promises';
import path from 'node:path';
import {build} from 'esbuild';
import {buildings,units,tech,rules,capacities} from '../../../game/catalog.mjs';
import {planetTypes} from '../../../game/planet-types.mjs';
import {surfaceLayout} from '../../../game/surface-layout.mjs';

const dir=import.meta.dirname,root=path.resolve(dir,'../../..');
const buildingIds=Object.keys(surfaceLayout.slots);
const sources=[];
async function copy(source,target){
  const to=path.join(dir,target);await fs.mkdir(path.dirname(to),{recursive:true});
  await fs.copyFile(path.join(root,source),to);sources.push({source,target});
}
const modelBuildings=['Metal_Mine','Crystal_Mine','Gas_Mine','Solar_Plant','Robotics_Facility','Shipyard','Research_Lab','Radar_Facility','Fusion_Reactor'];
for(const id of buildingIds){
  await copy(`opendesign/mockups/galaxy-empire/assets/buildings-v2/${id}.png`,`assets/buildings/${id}.png`);
  if(modelBuildings.includes(id))await copy(`models/generated/apk-buildings-v1/${id}.glb`,`assets/models/${id}.glb`);
}
for(const u of Object.values(units).filter(u=>u.fleetAvailable!==false)){
  await copy(`opendesign/mockups/galactic-command/assets/p0/ships/${u.id}.png`,`assets/units/${u.id}.png`);
  try{await copy(`opendesign/mockups/galactic-command/assets/p0/models/${u.id}.glb`,`assets/models/${u.id}.glb`);}catch(e){if(e.code!=='ENOENT')throw e;}
}
for(const id of ['terrestrial','mercury','mars','gas','outpost'])await copy(`opendesign/mockups/galactic-command/assets/planet-thumbs/${id}.png`,`assets/planets/${id}.png`);
await fs.writeFile(path.join(dir,'catalog.json'),JSON.stringify({buildings,units,tech,rules,capacities,planetTypes,surfaceLayout,modelBuildings},null,2));
await fs.writeFile(path.join(dir,'asset-sources.json'),JSON.stringify(sources,null,2));
await build({entryPoints:[path.join(dir,'src/app.jsx')],bundle:true,minify:true,outfile:path.join(dir,'preview.js'),platform:'browser',target:'es2022',define:{'process.env.NODE_ENV':'"production"'},logLevel:'info'});
console.log('P1 standalone preview built. No game API or save access.');
