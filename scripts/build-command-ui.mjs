import fs from 'node:fs/promises';
import path from 'node:path';
import {build} from 'esbuild';
import {buildings} from '../game/catalog.mjs';
import {writeBuildFile} from './write-build-file.mjs';

const root=path.resolve(import.meta.dirname,'..'),source=path.join(root,'client/command-ui'),output=path.join(root,'opendesign/mockups/galactic-command');
const legacy=path.join(root,'opendesign/mockups/galaxy-empire/assets'),art=JSON.parse(await fs.readFile(path.join(root,'game/original-assets.json'),'utf8'));
const images=path.join(output,'assets/p1/buildings');await fs.mkdir(images,{recursive:true});
for(const item of Object.values(buildings)){
 const candidates=[path.join(legacy,'buildings-v2',item.id+'.png'),art.buildings[item.id]&&path.join(legacy,art.buildings[item.id])].filter(Boolean);
 let found=false;
 for(const candidate of candidates){try{const bytes=await fs.readFile(candidate);writeBuildFile(path.join(images,item.id+'.png'),bytes);found=true;break;}catch(error){if(error.code!=='ENOENT')throw error;}}
 if(!found)throw new Error('Missing building reference: '+item.id);
}
const sheets=['styles.css','p1.css','defense.css','court.css','court-systems.css','secondary.css','civics.css','audio.css'];
writeBuildFile(path.join(output,'command-ui.css'),(await Promise.all(sheets.map(file=>fs.readFile(path.join(source,file),'utf8')))).join('\n'));
const result=await build({entryPoints:[path.join(source,'entry.jsx')],bundle:true,minify:true,write:false,outfile:path.join(output,'command-ui.bundle.js'),platform:'browser',target:'es2022',define:{'process.env.NODE_ENV':'"production"'},logLevel:'info'});
for(const file of result.outputFiles)writeBuildFile(file.path,file.contents);
console.log('Live command workspaces built. Uses existing API and persistent world; no save access.');
