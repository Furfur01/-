import fs from 'node:fs';
import {createHash} from 'node:crypto';
const input=process.argv[2];if(!input)throw Error('Usage: node scripts/import-defense-foundry.mjs <Imperial_Defense_Foundry.html>');
const html=fs.readFileSync(input,'utf8'),scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const source=scripts.find(s=>s.includes('global.DefenseModels='));if(!source)throw Error('Foundry geometry module missing');
// Import only the standalone geometry factory, never its UI, embedded previews or network loader.
fs.writeFileSync(new URL('./three-flight/foundry-models.js',import.meta.url),'// Imported model geometry from user-supplied Imperial_Defense_Foundry.html.\n'+source.replace("(function(global){'use strict';",'').replace('global.DefenseModels=','export const DefenseModels=').replace('})(globalThis);',''));
const {defenseIds,foundryMeasurements}=await import('./three-flight/foundry-adapter.js');
const ports={};for(const id of Object.values(defenseIds)){const m=foundryMeasurements(id);ports[id]={pivot:m.pivot,main:m.muzzles,tubes:m.muzzles,directions:m.muzzles.map(()=>[-1,0,0]),secondary:[]};}
fs.writeFileSync(new URL('../game/defense-hardpoints.json',import.meta.url),JSON.stringify(ports,null,2)+'\n');
console.log(JSON.stringify({source:input,sha256:createHash('sha256').update(html).digest('hex'),models:Object.values(defenseIds)}));
