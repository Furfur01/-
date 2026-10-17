// Load the unminified geometry helpers independently from the UI bundle.
// No renderer, canvas, WebGL context, or game mutations are created here.
importScripts('aurora-territory.js');
let territoryRegions=[],territoryGeneration=0;
onmessage=e=>{
 const message=e.data;
 if(message.type==='set'){
  territoryRegions=auroraTerritoryRegions(message.cells);
  territoryGeneration=message.generation;
  return;
 }
 if(message.type!=='mesh')return;
 const region=territoryRegions.find(r=>r.key===message.key);
 if(!region)return;
 const vertices=auroraTerritoryMesh(region);
 postMessage({key:message.key,generation:territoryGeneration,vertices},[vertices.buffer]);
};
