import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {transform} from 'esbuild';
const root=path.resolve(import.meta.dirname,'..');
const source=fs.readFileSync(path.join(root,'opendesign/demos/continuum-capital/original.html'));
const sha256=crypto.createHash('sha256').update(source).digest('hex');
if(sha256!=='194e180b93b64f0c906fba3d80bc65fd0a18cab04d1fcb9402aa7f2722cf2f4d')throw Error('Original CONTINUUM source changed; review before extracting');
const code=(await transform(source.toString().match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1],{loader:'js',minify:false})).code;
const dir=path.join(root,'scripts/universe/continuum-assets');fs.mkdirSync(dir,{recursive:true});
const chunks=[['capital-original.js','function Xg(','function Zg(','export {Xg as createModelToolkit, Yg as createOriginalCapital};'],['industry-original.js','function Ug(','var CM =','export {Og as createOriginalIndustry, zg as createOriginalSpaceport};']];
for(const [name,start,end,exports] of chunks){const a=code.indexOf(start),b=code.indexOf(end,a);if(a<0||b<a)throw Error(name);fs.writeFileSync(path.join(dir,name),`// Verbatim factory bodies extracted from the user-supplied CONTINUUM-离线预览 (3).html.\n// SHA-256 ${sha256}\n// Regenerate with node scripts/extract-continuum-assets.mjs. Extend through adapters, not here.\n${code.slice(a,b)}\n${exports}\n`);}
console.log('Extracted original capital, industrial cities and spaceport without the viewer or bundled Three.js.');
