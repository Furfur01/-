import fs from 'node:fs';

// Keep the supplied shader as the source of the plasma, corona and prominence model.
const source=fs.readFileSync('output/stellar-import/stellar_threejs.html','utf8');
const fragment=source.match(/<script id="fragmentSource"[^>]*>([\s\S]*?)<\/script>/)[1];
let plasma=fragment.slice(fragment.indexOf('#define PI'),fragment.indexOf('vec3 background'));
plasma=plasma.replace(/float radius\(int i\)\{[^}]+\}/,'float radius(int i){return 1.;}').replaceAll('texture(uNoise','texture2D(uNoise');
const film=fragment.slice(fragment.indexOf('vec3 film('),fragment.indexOf('void main()'));
const file='opendesign/mockups/planet-construction-review/aurora-celestial.js';
let celestial=fs.readFileSync(file,'utf8').split('// Adapted from the user-supplied stellar_threejs.html.')[0].trimEnd();
celestial=celestial.replace(/ if\(uKind>4\.5&&uKind<5\.5\)\{[\s\S]*?\n \}/,'');
// The backdrop stays in the existing renderer; remove the superseded 2-D corona.
const oldStart=celestial.indexOf(' float r=length(vUV)*4.5;');
const oldEnd=celestial.indexOf('}`;',oldStart);
if(oldStart>=0)celestial=celestial.slice(0,oldStart)+' gl_FragColor=vec4(0.);'+celestial.slice(oldEnd);
celestial=celestial.replace(/(?:function auroraStarType\(id\)\{[^\n]+\r?\n)?function auroraStarColor\(id\)\{[^\n]+/,`function auroraStarType(id){return [0,1,2,3,0][id%5];}
function auroraStarColor(id){return [[1.,.62,.24],[.60,.73,1.],[1.,.39,.16],[.79,.85,1.]][auroraStarType(id)];}`);
const adapter=fs.readFileSync('scripts/stellar-adapter.js','utf8');
celestial+='\n'+adapter.replace('/*__STELLAR_PLASMA__*/',()=>plasma+'\n'+film);
fs.writeFileSync(file,celestial);
