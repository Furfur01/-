import fs from 'node:fs/promises';
import {build} from 'esbuild';
import {publicCatalog} from '../game/catalog.mjs';
import {writeBuildFile} from './write-build-file.mjs';

const dir='opendesign/mockups/galactic-command';
const {shipArchive:ships,units,tech}=publicCatalog;
writeBuildFile(`${dir}/ships-data.json`,JSON.stringify({ships,units,tech}));
const result=await build({entryPoints:[`${dir}/ships-viewer.js`],bundle:true,minify:true,write:false,outfile:`${dir}/ships.bundle.js`,format:'iife',target:'es2022'});
for(const file of result.outputFiles)writeBuildFile(file.path,file.contents);
// These retained standalone pages share the same current catalog as the game.
for(const name of ['ships.html','ships-review.html']){
 const path=`${dir}/${name}`,html=await fs.readFile(path,'utf8');
 writeBuildFile(path,html.replace(/ships\.bundle\.js\?v=[^"\s]+/g,'ships.bundle.js?v=wiki-p0-20261021'));
}
