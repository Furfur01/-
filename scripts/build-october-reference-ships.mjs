import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {exportModels} from '../client/command-p0/export-models.mjs';
import {publicCatalog} from '../game/catalog.mjs';
import {buildFlightFleet} from './build-flight-fleet.mjs';
import {writeBuildFile} from './write-build-file.mjs';
const dir=path.resolve('opendesign/mockups/galactic-command'),stage=path.resolve('output/model-import-20261019/export');
const ids=['Devourer_Interceptor','Bomber','Colony_Ship'];
fs.mkdirSync(path.join(stage,'assets/models'),{recursive:true});
const entries=await exportModels(stage,publicCatalog.shipArchive.filter(s=>ids.includes(s.id)));
for(const id of ids)writeBuildFile(path.join(dir,'assets/p0/models',id+'.glb'),fs.readFileSync(path.join(stage,'assets/models',id+'.glb')));
const manifest=path.join(dir,'assets/p0/sources.json'),sources=JSON.parse(fs.readFileSync(manifest));
for(const entry of entries){const i=sources.findIndex(s=>s.id===entry.id&&s.target===entry.target);if(i<0)throw Error('Missing GLB manifest entry: '+entry.id);sources[i]=entry;}
writeBuildFile(manifest,JSON.stringify(sources,null,2)+'\n');
buildFlightFleet(dir);
// Load combat profiles in a fresh process after writing their authoritative mounts.
execFileSync(process.execPath,['--input-type=module','-e',"import {buildNativeBattleAssets} from './scripts/build-native-battle-assets.mjs';import {buildThreeFlight} from './scripts/build-three-flight.mjs';buildNativeBattleAssets('opendesign/mockups/galactic-command');await buildThreeFlight();"],{cwd:path.resolve(import.meta.dirname,'..'),stdio:'inherit',windowsHide:true});
await import('./build-world.mjs');await import('./build-ship-catalog.mjs');
