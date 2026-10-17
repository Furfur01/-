import fs from 'node:fs/promises';
import path from 'node:path';
import {build} from 'esbuild';
import {tech,units,buildings} from '../../../game/catalog.mjs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {exportModels} from './export-models.mjs';

const dir=import.meta.dirname,root=path.resolve(dir,'../../..');
const ids={Energy_Tech:1,Laser_Tech:2,Ion_Tech:3,Hyperspace_Tech:4,Plasma_Tech:5,Combustion_Drive:6,Impulse_Drive:7,Hyperspace_Drive:8,Espionage_Tech:9,Computer_Tech:10,Astrophysics_Tech:11,Weapons_Tech:14,Shielding_Tech:15,Strength_Tech:16};
const shipIds=['Light_Fighter','Heavy_Fighter','Cruiser','Battleship','Dreadnought','Bomber','Destroyer','Cargo_Ship','Large_Cargo_Ship','Colony_Ship','Recycler','Probe','Solar_Satellite'];
for(const folder of ['tech','ships','models','ui','concepts'])await fs.mkdir(path.join(dir,'assets',folder),{recursive:true});
const sources=[];
for(const t of Object.values(tech)){
 const original=ids[t.id];
 const source=original?`output/apk-icons/technology/technology_${String(original).padStart(2,'0')}.png`:`opendesign/mockups/galaxy-empire/assets/technologies-v2/${t.id}.png`;
 await fs.copyFile(path.join(root,source),path.join(dir,'assets/tech',t.id+'.png'));
 sources.push({id:t.id,source,kind:original?'Original APK ResearchLad.tfs icon, matched with GameResearchDefine enum':'Existing project supplementary artwork; not an original APK icon'});
}
const archive=JSON.parse(await fs.readFile(path.join(root,'opendesign/mockups/galactic-command/ships-data.json'),'utf8')).ships;
const selectedShips=shipIds.map(id=>archive.find(s=>s.id===id));
for(const ship of selectedShips){
 const source=`output/apk-icons/fleet/fleet_${String(ship.apkId).padStart(2,'0')}.png`;
 const bytes=await fs.readFile(path.join(root,source)),sha256=createHash('sha256').update(bytes).digest('hex');
 assert.equal(sha256,ship.referenceHash,`APK sprite identity mismatch: ${ship.id}`);
 await fs.writeFile(path.join(dir,'assets/ships',ship.id+'.png'),bytes);
 sources.push({id:ship.id,apkId:ship.apkId,source,target:`assets/ships/${ship.id}.png`,kind:'Original APK Fleets.tfs sprite; identity and hash checked against ship archive',sha256});
}
sources.push(...await exportModels(dir,selectedShips));
for(const id of ['metal','crystal','gas','research','ship','energy'])await fs.copyFile(path.join(root,'opendesign/mockups/galaxy-empire/assets/ui-modern',id+'.svg'),path.join(dir,'assets/ui',id+'.svg'));
await fs.writeFile(path.join(dir,'asset-sources.json'),JSON.stringify(sources,null,2));
await fs.writeFile(path.join(dir,'catalog.json'),JSON.stringify({tech,ships:shipIds.map(id=>units[id]),buildingNames:Object.fromEntries(Object.values(buildings).map(b=>[b.id,b.name]))},null,2));
await build({entryPoints:[path.join(dir,'src/app.jsx')],bundle:true,minify:true,outfile:path.join(dir,'preview.js'),platform:'browser',target:'es2022',define:{'process.env.NODE_ENV':'"production"'},logLevel:'info'});
console.log('Independent preview built; production files untouched.');
