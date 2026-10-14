import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const url='http://127.0.0.1:8289/';
async function ready(){
  try{const response=await fetch(url+'api/catalog',{signal:AbortSignal.timeout(1000)});return response.ok&&(await response.json()).units?.Light_Fighter?.name==='轻型战机';}catch{return false;}
}
if(!await ready()){
  const dir=path.join(root,'output','galactic-command');fs.mkdirSync(dir,{recursive:true});
  const log=fs.openSync(path.join(dir,'server.log'),'a');
  const server=spawn(process.execPath,[path.join(root,'server.mjs')],{cwd:root,detached:true,windowsHide:true,stdio:['ignore',log,log]});
  server.on('error',error=>console.error(error.message));server.unref();fs.closeSync(log);
  for(let i=0;i<30&&!await ready();i++)await new Promise(resolve=>setTimeout(resolve,200));
  if(!await ready())throw new Error('本地宇宙未能启动，请查看 output/galactic-command/server.log。');
}
const response=await fetch(url,{signal:AbortSignal.timeout(3000)});
if(!response.ok||!(await response.text()).includes('galactic-command'))throw new Error('8289 端口仍在运行旧版服务，请关闭旧服务后重新启动。');
const mapResponse=await fetch(url+'api/star-map',{signal:AbortSignal.timeout(3000)});
if(!mapResponse.ok||(await mapResponse.json()).systems?.length!==499)throw new Error('8289 端口的服务尚未更新连续星图接口，请关闭旧服务后重新启动。');
if(!process.argv.includes('--check')){
  const browser=spawn('cmd.exe',['/c','start','',url],{windowsHide:true,stdio:'ignore'});
  browser.on('error',error=>{console.error(error.message);process.exitCode=1;});
}
console.log('银河帝国 HTML 版：'+url);
