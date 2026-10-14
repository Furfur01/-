import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
const args=process.argv.slice(2),value=flag=>args[args.indexOf(flag)+1];
if(!args.includes('--assembly')||!args.includes('--out'))throw Error('Use --assembly PATH --out DIRECTORY');
const assembly=path.resolve(value('--assembly')),directory=path.resolve(value('--out'));
const report=JSON.parse(fs.readFileSync(assembly));if(!report.passed)throw Error('Assembly must pass before extracting review frames');
const command=args.includes('--ffmpeg')?value('--ffmpeg'):'output/playwright/three-battle-video-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe';
fs.mkdirSync(directory,{recursive:true});
const samples={views:[8],shells:[2.8,3.8],reaper:[2.1],missiles:[2.4,7.8],annihilator:[3.6,4.5],'special-reaper':[1.7],practice:[1.6,2.7]};
const result={assembly,checks:[],note:'Frames decoded from delivered MP4 files; timestamps are relative to the trimmed video, not server time. No visual conclusion is inferred by this script.'};
for(const output of report.outputs){
  const source=report.sources.find(s=>s.id===output.sourceIds[0]);
  const category=path.basename(path.dirname(source.manifest));
  const times=output.kind==='single'&&source.fixtureName==='complete'?[.08,30,300,599.96]:(samples[category]??[Math.min(2,output.durationSeconds/2)]);
  for(const at of times){
    const file=path.join(directory,category+'-'+source.view+'-'+at.toFixed(2).replace('.','p')+'.png');
    const commandArgs=['-hide_banner','-loglevel','error','-nostdin','-n','-threads','1','-ss',String(at),'-i',output.file,'-frames:v','1','-threads','1','-update','1',file];
    await new Promise((resolve,reject)=>{const child=spawn(command,commandArgs,{windowsHide:true,stdio:['ignore','ignore','pipe']});let error='';child.stderr.on('data',b=>error+=b);child.on('error',reject);child.on('close',code=>code===0?resolve():reject(Error(error)));});
    if(!fs.existsSync(file)||fs.statSync(file).size===0)throw Error('Decoded review frame is empty');
    result.checks.push({category,view:source.view,atSeconds:at,file,sourceVideo:output.file,sourceVideoSHA256:output.sha256,sha256:createHash('sha256').update(fs.readFileSync(file)).digest('hex')});
  }
}
fs.writeFileSync(path.join(directory,'frames.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({frames:result.checks.length,out:directory}));
