import fs from 'node:fs';
import path from 'node:path';
import {root,output,startServer,routes} from '../tests/three-battle-harness.mjs';
import {trialPresets} from '../game/battle-trial.mjs';

const portArg=process.argv.find(a=>a.startsWith('--port='));
const directory=path.join(output,'trials',String(Date.now()));
const publicDirectory=path.join(root,'opendesign/previews/three-battle',path.basename(directory));
fs.mkdirSync(publicDirectory,{recursive:true});
const server=await startServer({directory,live:true,port:portArg?Number(portArg.split('=')[1]):0});
const direct={three:routes.three+'?battle='+server.battle.id,legacy:routes.legacy+'?battle='+server.battle.id};
// A fresh browser has no trial cookie. Establish the existing local session on
// this isolated server before opening either renderer; no production API changes.
function launchPage(engine){
  const name='open-'+engine+'.html';
  fs.writeFileSync(path.join(publicDirectory,name),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><link rel="icon" href="data:,"><title>千舰对照试玩</title><style>body{background:#0d1720;color:#e0ebed;font:16px/1.7 system-ui;padding:8vh 8vw}a{color:#8cd5ee}</style><h1>千舰对照试玩</h1><p id="status">正在打开${engine==='three'?' Three.js ':'原版 WebGL '}战场…</p><a href="/">返回指挥台</a><script type="module">
try{
  const response=await fetch('/api/session/local',{method:'POST',credentials:'same-origin',headers:{'x-empire-client':'galactic-command'}});
  if(!response.ok)throw Error('无法建立隔离试玩会话');
  async function openTrial(){
    const stateResponse=await fetch('/api/state');if(!stateResponse.ok)throw Error('无法读取隔离试玩');
    const state=await stateResponse.json();let battle=state.battles?.find(b=>b.trial&&b.status==='active');
    if(!battle){
      document.getElementById('status').textContent='上一场已结束，正在创建新的千舰隔离试玩…';
      const created=await fetch('/api/battle-trial',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(${JSON.stringify({attacker:trialPresets[7].fleet,defender:trialPresets[7].fleet,seed:42})})});
      const result=await created.json();if(!created.ok)throw Error(result.error||'无法创建试玩');battle=result;
    }
    return ${JSON.stringify(routes[engine])}+'?battle='+encodeURIComponent(battle.id);
  }
  const target=navigator.locks?await navigator.locks.request('open-thousand-ship-trial',openTrial):await openTrial();
  location.replace(target);
}catch(error){document.getElementById('status').textContent=error.message;}
</script></html>`);
  return server.base+'/'+path.relative(root,path.join(publicDirectory,name)).split(path.sep).map(encodeURIComponent).join('/');
}
const links={command:server.base+'/',three:launchPage('three'),legacy:launchPage('legacy'),practice:server.base+'/opendesign/mockups/galactic-command/hangar-three.html?ship=Dreadnought',threeDirect:server.base+direct.three,legacyDirect:server.base+direct.legacy};
fs.writeFileSync(path.join(directory,'links.json'),JSON.stringify({...links,save:server.save,pid:server.child.pid},null,2));
console.log('1000 艘隔离试玩：双方各 500，种子 42，原有测试科技。');
console.log('three / legacy 链接自动建立隔离会话，复用当前战斗；上一场结束后自动创建新的千舰试玩。');
for(const [key,url]of Object.entries(links))console.log(key+': '+url);
console.log('Save: '+server.save);console.log('按 Ctrl+C 停止。重新执行会创建新存档。');
let stopping=false;async function stop(){if(stopping)return;stopping=true;await server.stop();process.exit();}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
server.child.on('exit',code=>{if(!stopping)process.exitCode=code||0;});
