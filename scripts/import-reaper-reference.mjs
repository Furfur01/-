import fs from 'node:fs';
import assert from 'node:assert/strict';
// Import only the reviewed geometry builders. Never execute the supplied HTML/UI.
const file=new URL('../models/reference/reaper-user-20261013/starfighter_model.html',import.meta.url);
const html=fs.readFileSync(file,'utf8').replaceAll('\r','');
const start=html.indexOf('function rgb(hex)'),end=html.indexOf('// ---------- upload all 3D meshes ----------');
assert(start>=0&&end>start);
const body=html.slice(start,end);
assert(!/\b(?:document|window|fetch|eval|Function|XMLHttpRequest|localStorage)\b/.test(body.replace(/\/\/[^\n]*/g,'')));
fs.writeFileSync(new URL('../opendesign/mockups/galactic-command/reaper-reference-geometry.js',import.meta.url),`// Geometry extracted verbatim from the user-provided starfighter_model.html.\nexport function reaperReferenceGeometry(){\n${body}\nreturn meshes;\n}\n`);
console.log('Imported original geometry builders, '+body.length+' source characters');
