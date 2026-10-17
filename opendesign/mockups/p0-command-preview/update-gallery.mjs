import fs from 'node:fs/promises';
import path from 'node:path';
const base=path.resolve(import.meta.dirname,'../..');
async function scan(dir){let files=[];for(const item of await fs.readdir(dir,{withFileTypes:true})){if(item.isDirectory())files.push(...await scan(path.join(dir,item.name)));else if(item.isFile())files.push(path.join(dir,item.name));}return files;}
const sections=[];
for(const [id,label,htmlOnly]of [['mockups','Mockups',true],['design-systems','Design Systems',false]]){
 const groups=[],folder=path.join(base,id);
 let entries;try{entries=await fs.readdir(folder,{withFileTypes:true});}catch{entries=[];}
 for(const entry of entries){if(!entry.isDirectory())continue;const files=(await scan(path.join(folder,entry.name))).filter(p=>!htmlOnly||p.endsWith('.html')).sort().map(p=>({label:path.basename(p),path:path.relative(base,p).replaceAll('\\','/')}));if(files.length)groups.push({slug:entry.name,files});}
 sections.push({id,label,groups});
}
await fs.writeFile(path.join(base,'manifest.json'),JSON.stringify({generated:new Date().toISOString(),sections},null,2)+'\n');
console.log('OpenDesign gallery rebuilt from the full artifact scan.');
