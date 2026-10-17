import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {units,tech,publicCatalog} from '../game/catalog.mjs';
import {exportModels} from '../client/command-p0/export-models.mjs';

const root=path.resolve(import.meta.dirname,'..'),dir=path.join(root,'opendesign/mockups/galactic-command');
const assetDir=path.join(dir,'assets/p0'),legacy=path.join(root,'opendesign/mockups/galaxy-empire/assets');
const art=JSON.parse(await fs.readFile(path.join(root,'game/original-assets.json'),'utf8'));
const archive=publicCatalog.shipArchive;
const sources=[];
for(const folder of ['tech','ships','models'])await fs.mkdir(path.join(assetDir,folder),{recursive:true});
for(const t of Object.values(tech)){
 const source=path.join(legacy,art.technology[t.id]||`technologies-v2/${t.id}.png`);
 await fs.copyFile(source,path.join(assetDir,'tech',t.id+'.png'));
 sources.push({id:t.id,source:path.relative(root,source),kind:art.technology[t.id]?'Original APK technology icon':'Project supplementary technology icon'});
}
const modelShips=[];
for(const item of Object.values(units).filter(u=>u.fleetAvailable!==false)){
 const entry=archive.find(s=>s.id===item.id),source=entry?.referenceHash?path.join(root,'models/reference/original-atlas-v1',entry.reference):path.join(legacy,art.units[item.id]||`civilian/${item.id}.png`);
 const bytes=await fs.readFile(source),sha256=createHash('sha256').update(bytes).digest('hex');
 if(entry?.referenceHash)assert.equal(sha256,entry.referenceHash,item.id);
 await fs.writeFile(path.join(assetDir,'ships',item.id+'.png'),bytes);
 sources.push({id:item.id,source:path.relative(root,source),sha256,kind:entry?.referenceHash||art.units[item.id]?'Original APK unit sprite':'Project supplementary missile icon'});
 if(item.type!=='defense')modelShips.push(entry);
 else if(!item.missile)modelShips.push(item);
}
// The snapshot exporter writes under assets/models; use a contained staging directory.
const staging=path.join(assetDir,'.model-export');
assert.ok(path.resolve(staging).startsWith(path.resolve(assetDir)+path.sep)&&path.resolve(staging)!==path.resolve(assetDir),'Export staging must stay inside the P0 assets directory');
await fs.mkdir(path.join(staging,'assets/models'),{recursive:true});
try{
 const models=await exportModels(staging,modelShips);
 for(const ship of modelShips)await fs.rename(path.join(staging,'assets/models',ship.id+'.glb'),path.join(assetDir,'models',ship.id+'.glb'));
 sources.push(...models);
}finally{await fs.rm(staging,{recursive:true,force:true});}
await fs.writeFile(path.join(assetDir,'sources.json'),JSON.stringify(sources,null,2));
await fs.copyFile(path.join(root,'client/command-p0/styles.css'),path.join(dir,'operations.css'));
await build({entryPoints:[path.join(root,'client/command-p0/entry.jsx')],bundle:true,minify:true,outfile:path.join(dir,'operations.bundle.js'),platform:'browser',target:'es2022',define:{'process.env.NODE_ENV':'"production"'},logLevel:'info'});
console.log('Live research and shipyard UI built.');
