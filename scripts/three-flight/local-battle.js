// Live battles belong to the persistent map. Historical records stay in their
// read-only player, even when the target still exists in today's universe.
export function localBattleTarget(data,planets){
 const report=data.report,record=data.record||data;
 const id=report?.targetId||record.environment?.planetId||data.target;
 return planets.find(p=>p.id===id)||(!report?.trial&&report?.position
  ?planets.find(p=>!p.moon&&p.position?.join(':')===report.position.join(':')):null);
}
export async function openLocalBattle(params,signal){
 const replay=params.get('replay'),battle=params.get('battle');
 if(replay)return false;
 if(!replay&&!battle)return false;
 const get=async url=>{const r=await fetch(url,{signal,credentials:'same-origin',cache:'no-store',headers:{'X-Empire-Client':'galactic-command'}});if(!r.ok)throw Error('无法读取当地战场');return r.json();};
 const [data,map]=await Promise.all([get('/api/'+(replay?'replay/'+encodeURIComponent(replay):'battles/'+encodeURIComponent(battle))),get('/api/star-map')]);
 if(!localBattleTarget(data,map.planets))return false;
 const query=new URLSearchParams({[replay?'replay':'battle']:replay||battle});
 location.replace('/opendesign/mockups/galactic-command/index.html?'+query);
 return true;
}
