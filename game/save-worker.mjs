import fs from 'node:fs';
import {parentPort,workerData} from 'node:worker_threads';
import {battleStorage} from './battle-storage.mjs';

const file=workerData.saveFile,store=battleStorage(file);
parentPort.on('message',world=>{
 let manifest;
 try{
  manifest=store.checkpoint(world);
  fs.writeFileSync(file+'.tmp',JSON.stringify(manifest));
  fs.renameSync(file+'.tmp',file);
 }catch(error){parentPort.postMessage({error:error.message});return;}
 // Cleanup cannot turn a committed transaction into a reported save failure.
 let warning;try{store.prune(manifest);}catch(error){warning=error.message;}
 parentPort.postMessage({battles:manifest.battles,savedAt:new Date().toISOString(),warning});
});
