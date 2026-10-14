import fs from 'node:fs';
import path from 'node:path';
import {gzipSync,gunzipSync} from 'node:zlib';

// Immutable battle checkpoints are committed before the universe manifest is renamed.
// Keeping one previous generation makes an interrupted write recoverable.
export function battleStorage(saveFile){
  const directory=saveFile+'.battles';
  const valid=name=>typeof name==='string'&&/^[a-f0-9-]+-\d+-\d+\.json\.gz$/.test(name);
  function read(name){if(!valid(name))throw Error('无效战斗记录引用');return JSON.parse(gunzipSync(fs.readFileSync(path.join(directory,name))).toString('utf8'));}
  function restore(world){for(const[id,b]of Object.entries(world.battles||{}))if(b.storage&&b.status==='active')world.battles[id]=read(b.storage);return world;}
  function checkpoint(world){
    const battles={};fs.mkdirSync(directory,{recursive:true});
    for(const[id,b]of Object.entries(world.battles||{})){
      if(b.storage){battles[id]=b;continue;}
      const name=`${id}-${b.tick}-${b.eventSeq}.json.gz`,file=path.join(directory,name);
      if(!fs.existsSync(file)){fs.writeFileSync(file+'.tmp',gzipSync(JSON.stringify(b),{level:1}));fs.renameSync(file+'.tmp',file);}
      battles[id]={id,status:b.status,storage:name,attacker:b.attacker,defender:b.defender,start:b.start,target:b.target,settled:b.settled};
    }
    return {...world,battles};
  }
  function compact(world,manifest){for(const[id,b]of Object.entries(world.battles||{}))if(b.status==='finished'&&b.settled)world.battles[id]=manifest.battles[id];}
  function prune(manifest){
    const keep=new Set(Object.values(manifest.battles||{}).map(b=>b.storage));
    // Only files in this save's dedicated directory, never user/model assets.
    const groups=new Map();for(const name of fs.readdirSync(directory)){if(!valid(name))continue;const id=name.slice(0,36);if(!groups.has(id))groups.set(id,[]);groups.get(id).push(name);}
    for(const names of groups.values()){names.sort((a,b)=>Number(b.split('-').at(-2))-Number(a.split('-').at(-2)));for(const name of names.slice(2))if(!keep.has(name))fs.unlinkSync(path.join(directory,name));}
  }
  return {read,restore,checkpoint,compact,prune};
}
