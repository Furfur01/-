(async()=>{
  try{
    const battlefield=document.currentScript.dataset?.mode==='battlefield';
    const version=new URL(document.currentScript.src).searchParams.get('v')||'pilot03',asset=name=>name+'?v='+encodeURIComponent(version);
    const [data,vertices]=await Promise.all([fetch(asset('flight-fleet.json')).then(r=>{if(!r.ok)throw Error('舰队配置加载失败');return r.json();}),fetch(asset('flight-fleet.bin')).then(r=>{if(!r.ok)throw Error('舰队模型加载失败');return r.arrayBuffer();})]);
    window.FlightFleet={...data,vertices:new Float32Array(vertices)};
    if(battlefield){
      const [extra,raw]=await Promise.all([fetch(asset('battle-fleet.json')).then(r=>{if(!r.ok)throw Error('战斗舰队读取失败');return r.json();}),fetch(asset('battle-fleet.bin')).then(r=>{if(!r.ok)throw Error('战斗模型读取失败');return r.arrayBuffer();})]);
      window.BattleFleetAssets={...extra,vertices:new Float32Array(raw)};
      const missing=extra.ships.filter(s=>!data.ships.some(x=>x.id===s.id)),base=window.FlightFleet.vertices;
      const combined=new Float32Array(base.length+missing.reduce((n,s)=>n+s.full.floatCount,0));combined.set(base);let cursor=base.length;
      for(const s of missing){
        combined.set(window.BattleFleetAssets.vertices.subarray(s.full.offset,s.full.offset+s.full.floatCount),cursor);
        window.FlightFleet.ships.push({id:s.id,name:s.name,en:s.id.toUpperCase(),code:'FLEET',serial:'',count:0,stats:s.stats,statsSource:'实时战斗',levels:[],weapons:[],offset:cursor,floatCount:s.full.floatCount,relativeLength:s.length});cursor+=s.full.floatCount;
        window.FlightFleet.layouts.push(s.layout);
        window.FlightFleet.profiles.push({...data.profiles[2],role:s.name,className:s.id.toUpperCase(),relativeLength:s.length,capital:s.profile.role!=='fighter',maxSpeed:s.profile.speed*8,turnRate:s.profile.turn,primaryName:'舰载主武器',primaryKind:s.profile.kind,beam:s.profile.beam,mainCooldown:s.profile.cooldown,salvo:0,missileCapacity:0,fixedPrimary:s.profile.fixed,defenseOnly:s.stats[2]===0});
      }
      window.FlightFleet.vertices=combined;
    }
    for(const src of ['ship-renderer.js',...(battlefield?['battle-display.js','battlefield-controller.js']:[]),'flight-runtime.js'])await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=asset(src);script.onload=resolve;script.onerror=()=>reject(Error('驾驶系统加载失败'));document.body.append(script);});
  }catch(error){document.querySelector('#no-webgl').hidden=false;document.querySelector('#webgl-error').textContent=error.message;}
})();
