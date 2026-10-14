import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

// Inspect Git's stored blobs (LFS pointers), not the expanded runtime assets.
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:32*1024*1024,windowsHide:true});
const limit=100*1024*1024,objects=new Map();
for(const row of git('ls-files','--stage','-z').split('\0').filter(Boolean)){
  const [header,file]=row.split('\t'),[,oid]=header.split(' ');
  if(!objects.has(oid))objects.set(oid,file);
}
if(process.argv.includes('--history')){
  // Only the publication branch's reachable history is pushed. Local recovery
  // checkpoints and bundles intentionally retain the old unfiltered objects.
  for(const row of git('rev-list','--objects','HEAD').trim().split('\n')){
    const at=row.indexOf(' '),oid=at<0?row:row.slice(0,at);
    if(!objects.has(oid))objects.set(oid,at<0?oid:row.slice(at+1));
  }
}
const rows=execFileSync('git',['cat-file','--batch-check=%(objectname) %(objecttype) %(objectsize)'],{input:[...objects.keys()].join('\n')+'\n',encoding:'utf8',maxBuffer:32*1024*1024,windowsHide:true});
const oversize=[],largest=[];
for(const row of rows.trim().split('\n')){
  const [oid,type,value]=row.split(' '),bytes=Number(value);if(type!=='blob')continue;
  const item={path:objects.get(oid),MiB:Number((bytes/1024/1024).toFixed(2))};
  largest.push(item);if(bytes>limit)oversize.push(item);
}
const untracked=[];
for(const file of git('ls-files','--others','--exclude-standard','-z').split('\0').filter(Boolean)){
  if(fs.statSync(file).size>limit)untracked.push(file);
}
console.log(JSON.stringify({passed:!oversize.length&&!untracked.length,limitMiB:100,history:process.argv.includes('--history'),oversize,untrackedOversize:untracked,largestOrdinaryBlobs:largest.sort((a,b)=>b.MiB-a.MiB).slice(0,5)},null,2));
if(oversize.length||untracked.length)process.exitCode=1;
