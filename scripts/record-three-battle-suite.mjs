// Sequential capture only: no competing browser, encoder or GPU benchmark jobs.
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),take=name=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
const out=path.resolve(take('--out')||path.join(root,'output/playwright/three-battle-video'));
const after=take('--after');
const only=take('--only');
const ffmpeg=path.resolve(take('--ffmpeg')||path.join(root,'output/playwright/three-battle-video-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'));
const normal=path.join(root,'output/playwright/three-battle-comparison/fixture-normal.json');
const special=path.join(root,'output/playwright/three-battle-video/fixture-special.json');
const plan=[
  {name:'views',view:'all',start:26,duration:20,warm:5},
  {name:'shells',view:'follow',ship:11,start:21,duration:10,warm:2},
  {name:'reaper',view:'follow',ship:493,start:20,duration:10,warm:2},
  {name:'missiles',view:'follow',ship:135,start:11,duration:10,warm:2},
  {name:'annihilator',view:'overview',fixture:special,start:1.5,duration:9.5,warm:1.5},
  {name:'special-reaper',view:'overview',fixture:special,start:11.5,duration:4,warm:2},
];
if(only&&!plan.some(clip=>clip.name===only))throw Error('Unknown capture name: '+only);
async function run(command){
  await new Promise((resolve,reject)=>{const child=spawn(process.execPath,command,{cwd:root,stdio:'inherit',windowsHide:true});child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error('Capture command exited '+code)));});
}
if(after){
  console.log('Waiting for the existing complete-battle capture: '+after);
  const began=Date.now();
  for(;;){
    let report=null;try{report=JSON.parse(fs.readFileSync(after,'utf8'));}catch{}
    if(report?.finishedAt){if(!report.passed)throw Error('Earlier complete-battle capture did not pass');break;}
    if(Date.now()-began>20*60*1000)throw Error('Timed out waiting for complete-battle capture');
    await new Promise(resolve=>setTimeout(resolve,2000));
  }
}
fs.mkdirSync(out,{recursive:true});
const summary={startedAt:new Date().toISOString(),sequential:true,plan,completed:[]};
for(const clip of plan.filter(clip=>!only||clip.name===only)){
  const directory=path.join(out,clip.name),manifest=path.join(directory,'recording-manifest.json');
  if(fs.existsSync(manifest))throw Error('Capture already exists; select a fresh --out directory: '+directory);
  const command=['scripts/record-three-battle.mjs','--engine','both','--view',clip.view,'--fixture',clip.fixture||normal,'--start',String(clip.start),'--duration',String(clip.duration),'--warm',String(clip.warm),'--ffmpeg',ffmpeg,'--out',directory];
  if(clip.ship!==undefined)command.push('--ship-id',String(clip.ship));
  await run(command);
  const report=JSON.parse(fs.readFileSync(manifest,'utf8'));
  if(!report.passed||report.segments.some(s=>!s.alignment?.exact))throw Error('Capture or frame synchronization failed: '+clip.name);
  summary.completed.push({name:clip.name,manifest});
  fs.writeFileSync(path.join(out,'capture-suite.json'),JSON.stringify(summary,null,2));
}
summary.finishedAt=new Date().toISOString();
fs.writeFileSync(path.join(out,'capture-suite.json'),JSON.stringify(summary,null,2));
console.log('Sequential comparison captures completed.');
