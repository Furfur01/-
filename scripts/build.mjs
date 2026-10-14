import {build} from 'esbuild';
await build({entryPoints:['client/main.jsx'],bundle:true,format:'esm',minify:true,sourcemap:false,outfile:'opendesign/mockups/galaxy-empire/app.js',loader:{'.jsx':'jsx'},define:{'process.env.NODE_ENV':'"production"'}});
