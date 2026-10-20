import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const source=path.join(root,'output/cyber-weapons-audition');
const manifest=JSON.parse(fs.readFileSync(path.join(source,'manifest.json'),'utf8'));
if(manifest.revision<6)throw Error('需要已确认的开火与 Metal Stress 选型');
const destination=path.join(root,'opendesign/mockups/galactic-command/assets/audio/combat');
fs.mkdirSync(destination,{recursive:true});
const clips={};
for(const item of manifest.items.filter(i=>i.audio&&!i.pending)){
  const filename=item.id+'.wav';
  fs.copyFileSync(path.join(source,item.audio),path.join(destination,filename));
  clips[item.id]={url:'/opendesign/mockups/galactic-command/assets/audio/combat/'+filename,duration:item.duration,
    title:item.title,source:item.originalFilename,audition:item.audio};
}
fs.writeFileSync(path.join(destination,'manifest.json'),JSON.stringify({
  revision:manifest.revision,accepted:'2026-10-20',clips
},null,2)+'\n');
console.log(`Imported ${Object.keys(clips).length} approved combat clips.`);
