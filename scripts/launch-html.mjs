import {spawn} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const url='http://127.0.0.1:8289/';
async function status(){
  try{
    const response=await fetch(url+'api/health',{signal:AbortSignal.timeout(1500)});
    if(!response.ok)return {status:'conflict',url};
    const health=await response.json();
    return health.service==='galaxy-empire'?{...health,url}:{status:'conflict',url};
  }catch(error){return {status:error.cause?.code==='ECONNREFUSED'?'stopped':'unavailable',url};}
}
try{
  if(process.argv.includes('--status'))console.log(JSON.stringify(await status()));
  else if(process.argv.includes('--check')){
    if((await status()).status!=='running')throw new Error('后台未就绪，请打开银河帝国启动器。');
    const response=await fetch(url,{signal:AbortSignal.timeout(3000)});
    if(!response.ok||!(await response.text()).includes('galactic-command'))throw new Error('游戏页面不可用，请查看后台日志。');
    const map=await fetch(url+'api/star-map',{signal:AbortSignal.timeout(3000)});
    if(!map.ok||(await map.json()).systems?.length!==499)throw new Error('星图接口未就绪。');
    console.log('银河帝国 HTML 版：'+url);
  }else{
    const launcher=spawn('powershell.exe',['-NoProfile','-STA','-ExecutionPolicy','Bypass','-File',path.join(root,'启动游戏.ps1')],{cwd:root,windowsHide:true,stdio:'inherit'});
    launcher.on('error',error=>{console.error(error.message);process.exitCode=1;});
    launcher.on('exit',code=>{process.exitCode=code??1;});
  }
}catch(error){console.error(error.message);process.exitCode=1;}
