import {buildTerrainPatch,buildGlobalTerrain,createContinuousTerrainField} from './terrain.js';
import {buildTile} from './continuous-planets/tile-builder.js';
const fields=new Map();
export function buildContinuousTile(config,job){
  let field=fields.get(config.requestKey);
  if(!field){field=createContinuousTerrainField(config);fields.set(config.requestKey,field);if(fields.size>16)fields.delete(fields.keys().next().value);}
  const iterator=buildTile(field,job);let result;do{result=iterator.next();}while(!result.done);return result.value;
}
// The worker owns only CPU arrays; GPU lifetime always belongs to the shared world.
if(typeof self!=='undefined')self.onmessage=({data})=>{try{const geometry=data.kind==='continuous-tile'?buildContinuousTile(data.config,data.job):data.kind==='global'?buildGlobalTerrain(data.config,data.options?.segments,data.options?.rings):buildTerrainPatch(data.config,data.direction,data.options);self.postMessage({id:data.id,kind:data.kind,generation:data.generation,requestKey:data.requestKey,geometry},Object.values(geometry).filter(value=>ArrayBuffer.isView(value)).map(value=>value.buffer));}catch(error){self.postMessage({id:data.id,generation:data.generation,requestKey:data.requestKey,error:String(error?.message||error)});}};
