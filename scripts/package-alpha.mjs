import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

// Package built runtime files, never the working directory or a user's save.
const root=path.resolve(import.meta.dirname,'..');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
assert.match(pkg.version,/^\d+\.\d+\.\d+-alpha\.\d+$/);
const name=`galaxy-empire-${pkg.version}-windows`;
const destination=path.join(root,'output/releases',`v${pkg.version}`,new Date().toISOString().replaceAll(':','-'));
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'empire-release-build-'));
const stage=path.join(temporary,name),files=[];
function copy(source,relative=source){
  const from=path.join(root,source),to=path.join(stage,relative),stat=fs.lstatSync(from);
  assert(!stat.isSymbolicLink(),`Release does not follow links: ${source}`);
  if(stat.isDirectory()){
    for(const entry of fs.readdirSync(from).sort())copy(path.join(source,entry),path.join(relative,entry));
    return;
  }
  // Source maps and local inspection output are not needed by players.
  if(/\.(map|log|bak|tmp|md|mjs)$/i.test(relative)&&relative.startsWith('opendesign'))return;
  if(/(^|[\\/])(aurora-evidence|evidence)([\\/]|$)|(^|[\\/])[^\\/]*(?:selfcheck|review|atlas)[^\\/]*\.html$/i.test(relative))return;
  assert(!/(^|[\\/])(data|output|node_modules|\.git|\.env)([\\/]|$)/i.test(relative),relative);
  const fd=fs.openSync(from,'r'),head=Buffer.alloc(180);
  try{fs.readSync(fd,head,0,head.length,0);}finally{fs.closeSync(fd);}
  assert(!head.toString().startsWith('version https://git-lfs.github.com/spec/v1'),`Run git lfs pull before packaging: ${source}`);
  fs.mkdirSync(path.dirname(to),{recursive:true});
  fs.copyFileSync(from,to);
  files.push({path:relative.replaceAll('\\','/'),bytes:stat.size});
}
function write(relative,content){
  const file=path.join(stage,relative);fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,content);
  files.push({path:relative,bytes:Buffer.byteLength(content)});
}
try{
  for(const file of ['server.mjs','银河帝国.cmd','启动HTML版.cmd','启动游戏.ps1','scripts/launch-html.mjs',
    'research/galaxy-empire-data.v1.json','research/legacy-rapid-fire.json',
    'models/reference/original-atlas-v1/name-map.json'])copy(file);
  for(const file of fs.readdirSync(path.join(root,'game')).filter(f=>/\.(mjs|json)$/.test(f)).sort())copy('game/'+file);
  copy('opendesign/mockups/galactic-command');
  copy('opendesign/mockups/galaxy-empire');
  copy('opendesign/mockups/planet-construction-review/assets');
  copy('opendesign/shared');
  copy('opendesign/shared/assets/SPACE-SKY-CREDITS.md','licenses/SPACE-SKY-CREDITS.md');
  copy('docs/releases/PLAYER-README.md','开始游戏.md');
  copy(`docs/releases/v${pkg.version}.md`,'RELEASE-NOTES.md');
  copy('docs/releases/ASSET-NOTICES.md','ASSET-NOTICES.md');
  for(const dependency of ['react','react-dom','scheduler','three','lucide-react'])copy(`node_modules/${dependency}/LICENSE`,`licenses/${dependency}.txt`);
  copy('scripts/universe/continuous-planets/LICENSE','licenses/continuous-planets.txt');
  write('package.json',JSON.stringify({name:pkg.name,version:pkg.version,private:true,type:'module',
    scripts:{start:'node server.mjs'},engines:{node:'>=24.0.0'}},null,2)+'\n');
  write('VERSION',pkg.version+'\n');
  const manifest={version:pkg.version,createdAt:new Date().toISOString(),sourceState:'local working-tree candidate; not tagged',
    runtime:process.version,files:files.sort((a,b)=>a.path.localeCompare(b.path))};
  fs.writeFileSync(path.join(stage,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  fs.mkdirSync(destination,{recursive:true});
  const zip=path.join(destination,name+'.zip');
  execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',
    "Add-Type -AssemblyName System.IO.Compression.FileSystem; [IO.Compression.ZipFile]::CreateFromDirectory($env:EMPIRE_PACKAGE_STAGE, $env:EMPIRE_PACKAGE_ZIP, [IO.Compression.CompressionLevel]::Optimal, $true)"],
    {windowsHide:true,stdio:'inherit',env:{...process.env,EMPIRE_PACKAGE_STAGE:stage,EMPIRE_PACKAGE_ZIP:zip}});
  fs.writeFileSync(path.join(destination,'inventory.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({zip,files:files.length+1,archiveBytes:fs.statSync(zip).size,
    unpackedBytes:files.reduce((sum,file)=>sum+file.bytes,0)},null,2));
}finally{
  assert(path.resolve(temporary).startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(temporary).startsWith('empire-release-build-'));
  fs.rmSync(temporary,{recursive:true,force:true});
}
