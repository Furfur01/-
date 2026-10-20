import {build} from 'esbuild';
import {writeBuildFile} from './write-build-file.mjs';
const result=await build({entryPoints:['client/main.jsx'],bundle:true,format:'esm',minify:true,sourcemap:false,write:false,outfile:'opendesign/mockups/galaxy-empire/app.js',loader:{'.jsx':'jsx'},define:{'process.env.NODE_ENV':'"production"'}});
for(const file of result.outputFiles)writeBuildFile(file.path,file.contents);
