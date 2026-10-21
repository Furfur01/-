import manifest from '../opendesign/mockups/galactic-command/assets/audio/combat/manifest.json' with {type:'json'};
import {weaponCues} from '../game/weapon-timing.mjs';

export const combatClips=Object.freeze(manifest.clips);
export const combatAudioSettingsKey='galaxy.combat-audio';
// Secondary weapons use short, already-selected sounds rather than replaying a
// capital ship's main beam at every turret/barrel event.
const defenses={Swarm_Fighter:'Light_Fighter',Rocket_Launcher:'Bomber',
  Light_Laser:'Light_Fighter',Heavy_Laser:'Heavy_Fighter',Ion_Cannon:'Cruiser',
  MK2_Cannon:'Battleship',Plasma_Cannon:'Destroyer'};
export function firingClip(type,{kind,secondary}={}){
  if(['Probe','Solar_Satellite','Small_Shield_Dome','Large_Shield_Dome'].includes(type))return null;
  if(kind==='missile')return 'Bomber'; // selected plasma flyby accompanies missile flight
  // The carrier has no main gun: its selected burst belongs to its defensive battery.
  if(type==='Iron_Behemoth')return 'Iron_Behemoth';
  if(secondary)return /laser|ion|beam/.test(kind)?'Light_Fighter':'Cargo_Ship';
  return combatClips[type]?type:defenses[type]||null;
}
const small=new Set(['Light_Fighter','Heavy_Fighter','Titanenergetic_Frigate','Swarm_Fighter','Probe','Solar_Satellite']);
const large=new Set(['Battleship','Dreadnought','Destroyer','Interceptor','Devourer_Interceptor','Iron_Behemoth','Reaper','Annihilator','Death_Star','Guardian']);
export function hullClip(type,severe=false){
  if(small.has(type))return severe||['Heavy_Fighter','Titanenergetic_Frigate'].includes(type)?'stress_light_twist':'stress_light_shudder';
  if(large.has(type))return severe?(['Reaper','Iron_Behemoth','Annihilator','Death_Star','Guardian'].includes(type)?'stress_large_twist':'hull_stress'):'stress_medium_tear';
  return severe?'stress_medium_tear':'stress_medium_pressure';
}

export function createCombatAudio(env=window){
  const doc=env.document,buffers=new Map(),voices=new Set(),pending=new Set(),cooldowns=new Map(),listeners=new Set(),wanted=new Set(),emitterEpoch=new Map();
  let context,master,limiter,unlocked=false,disposed=false,epoch=0,warned=false,paused=false;
  let settings={enabled:true,volume:.35};
  const stats={played:0,dropped:0,failed:0,last:[],peakVoices:0};
  try{const saved=JSON.parse(env.localStorage.getItem(combatAudioSettingsKey));if(typeof saved?.enabled==='boolean')settings.enabled=saved.enabled;if(Number.isFinite(saved?.volume))settings.volume=Math.max(0,Math.min(1,saved.volume));}catch{}
  const now=()=>env.performance.now();
  const audible=()=>!disposed&&!paused&&unlocked&&settings.enabled&&settings.volume>0&&!doc.hidden;
  const warn=error=>{stats.failed++;if(!warned){warned=true;env.console.warn('战斗音效暂不可用：',error);}};
  function stop(){
    epoch++;pending.clear();cooldowns.clear();emitterEpoch.clear();paused=false;
    for(const voice of voices){voice.source.stop();voice.source.disconnect();voice.gain.disconnect();voice.pan?.disconnect();}
    voices.clear();
  }
  function stopEmitter(emitter){
    emitterEpoch.set(emitter,(emitterEpoch.get(emitter)||0)+1);
    for(const channel of cooldowns.keys())if(channel.startsWith(emitter+':'))cooldowns.delete(channel);
    for(const voice of voices)if(voice.emitter===emitter){voice.gain.gain.setTargetAtTime(0,context.currentTime,.015);voice.source.stop(context.currentTime+.06);}
  }
  function load(key){
    if(!buffers.has(key)){
      const task=env.fetch(combatClips[key].url).then(r=>{if(!r.ok)throw Error(`音频 ${key}: ${r.status}`);return r.arrayBuffer();})
        .then(b=>context.decodeAudioData(b)).catch(error=>{buffers.delete(key);throw error;});
      buffers.set(key,task);
    }
    return buffers.get(key);
  }
  function unlock(){
    if(disposed)return;
    unlocked=true;
    if(paused||!settings.enabled||settings.volume===0)return;
    try{
      if(!context){
        context=new (env.AudioContext||env.webkitAudioContext)();
        master=context.createGain();master.gain.value=settings.volume;
        limiter=context.createDynamicsCompressor();
        Object.assign(limiter.threshold,{value:-12});Object.assign(limiter.knee,{value:12});
        limiter.ratio.value=6;limiter.attack.value=.003;limiter.release.value=.18;
        master.connect(limiter);limiter.connect(context.destination);
      }
      if(context.state==='suspended')void context.resume().catch(warn);
      for(const key of wanted)void load(key).catch(warn);
    }catch(error){warn(error);}
  }
  function prepare(keys){
    for(const key of keys)if(combatClips[key]){wanted.add(key);if(audible()&&context)void load(key).catch(warn);}
  }
  async function play(key,{emitter='preview',gain=.6,pan=0,priority=1,cooldown=.18,delay=0,offset=0,duration,age=0}={}){
    if(!combatClips[key]||!audible()||!context)return false;
    const at=now(),channel=emitter+':'+key;
    if((cooldowns.get(channel)??-Infinity)>at||pending.has(channel)){stats.dropped++;return false;}
    // Reserve before asynchronous decoding; a burst cannot queue dozens of starts.
    cooldowns.set(channel,at+cooldown*1000);pending.add(channel);
    const ticket=epoch,emitterTicket=emitterEpoch.get(emitter);
    try{
      const buffer=await load(key);
      if(context.state==='suspended'&&!paused)await context.resume();
      if(ticket!==epoch||emitterTicket!==emitterEpoch.get(emitter)||!audible()||context.state!=='running'||now()-at>350){stats.dropped++;return false;}
      const same=[...voices].filter(v=>v.key===key);
      if(same.length>=3||voices.size>=12){
        const victim=[...(same.length>=3?same:voices)].sort((a,b)=>a.priority-b.priority||a.at-b.at)[0];
        if(victim.priority>=priority){stats.dropped++;return false;}
        victim.source.stop();voices.delete(victim);
      }
      const source=context.createBufferSource(),level=context.createGain(),panner=context.createStereoPanner?.();
      source.buffer=buffer;level.gain.value=Math.max(0,Math.min(1,gain));
      source.connect(level);if(panner){panner.pan.value=Math.max(-.8,Math.min(.8,pan));level.connect(panner);panner.connect(master);}else level.connect(master);
      const elapsed=age+(now()-at)/1000,start=context.currentTime+Math.max(0,delay-elapsed),skip=offset+Math.max(0,elapsed-delay);
      const length=Math.min(buffer.duration-skip,(duration??buffer.duration)-Math.max(0,elapsed-delay));
      if(length<=0){source.disconnect();level.disconnect();panner?.disconnect();return false;}
      const fade=Math.min(.06,length*.25),amplitude=level.gain.value;
      level.gain.setValueAtTime(0,start);
      level.gain.linearRampToValueAtTime(amplitude,start+Math.min(.004,length*.1));
      level.gain.setValueAtTime(amplitude,start+length-fade);
      level.gain.linearRampToValueAtTime(0,start+length);
      const voice={source,gain:level,pan:panner,key,priority,at,emitter};voices.add(voice);
      source.onended=()=>{voices.delete(voice);source.disconnect();level.disconnect();panner?.disconnect();};
      source.start(start,skip,length);stats.played++;stats.peakVoices=Math.max(stats.peakVoices,voices.size);
      stats.last.push(key);if(stats.last.length>20)stats.last.shift();
      if(cooldowns.size>512)for(const [k,until]of cooldowns)if(until<at)cooldowns.delete(k);
      return true;
    }catch(error){warn(error);return false;}
    finally{if(ticket===epoch)pending.delete(channel);}
  }
  function configure(patch,persist=true){
    if(typeof patch.enabled==='boolean')settings.enabled=patch.enabled;
    if(Number.isFinite(patch.volume))settings.volume=Math.max(0,Math.min(1,patch.volume));
    if(master)master.gain.value=settings.volume;
    if(!settings.enabled||settings.volume===0)stop();else if(unlocked)unlock();
    if(persist)try{env.localStorage.setItem(combatAudioSettingsKey,JSON.stringify(settings));}catch{}
    for(const fn of listeners)fn({...settings});
  }
  const activate=e=>{if(e.isTrusted)unlock();};
  const hidden=()=>{if(doc.hidden)stop();};
  const storage=e=>{if(e.key===combatAudioSettingsKey)try{const value=JSON.parse(e.newValue);if(value)configure(value,false);}catch{}};
  doc.addEventListener('pointerdown',activate,true);doc.addEventListener('keydown',activate,true);
  doc.addEventListener('visibilitychange',hidden);env.addEventListener('storage',storage);env.addEventListener('pagehide',stop);
  return {play,prepare,unlock,stop,stopEmitter,configure,
    pause(){paused=true;if(context?.state==='running')void context.suspend();},
    resume(){paused=false;if(unlocked)unlock();},
    isPlaying:emitter=>[...voices].some(v=>v.emitter===emitter)||[...pending].some(c=>c.startsWith(emitter+':')),
    get settings(){return {...settings};},
    get diagnostics(){return {...stats,last:[...stats.last],active:voices.size,cached:buffers.size,unlocked};},
    subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},
    dispose(){if(disposed)return;stop();disposed=true;doc.removeEventListener('pointerdown',activate,true);doc.removeEventListener('keydown',activate,true);doc.removeEventListener('visibilitychange',hidden);env.removeEventListener('storage',storage);env.removeEventListener('pagehide',stop);listeners.clear();void context?.close();}
  };
}
export function getCombatAudio(env=window){return env.EmpireCombatAudio??=createCombatAudio(env);}

export function mountCombatAudioControls(container,audio){
  if(!container)return ()=>{};
  const group=document.createElement('span');group.dataset.uiSound='off';
  group.style.cssText='display:inline-flex;align-items:center;gap:8px';
  const button=document.createElement('button'),volume=document.createElement('input');
  button.type='button';button.setAttribute('aria-label','战斗音效');
  volume.type='range';volume.min='0';volume.max='100';volume.step='5';
  volume.setAttribute('aria-label','战斗音效音量');volume.style.cssText='width:70px;min-width:0;accent-color:#a7c9b7';
  button.onclick=()=>{audio.configure({enabled:!audio.settings.enabled});audio.unlock();};
  volume.oninput=()=>{audio.configure({volume:Number(volume.value)/100});audio.unlock();};
  const update=s=>{button.textContent='战斗音效 '+(s.enabled?'开':'关');button.setAttribute('aria-pressed',String(s.enabled));volume.value=Math.round(s.volume*100);volume.disabled=!s.enabled;volume.title=`战斗音效 ${volume.value}%`;};
  update(audio.settings);const unsubscribe=audio.subscribe(update);
  group.append(button,volume);container.append(group);
  return ()=>{unsubscribe();group.remove();};
}

// One session per battle/replay: seq de-duplication and damage transitions never
// depend on the number of render frames, barrels or visual particles.
export function createCombatSoundSession(audio){
  let seq=0,previous=new Map(),alerted=new Set(),broken=new Set(),prepared='',beams=new Map();
  function reset(){seq=0;previous.clear();alerted.clear();broken.clear();beams.clear();audio.stop();}
  function consume(data,{active=true,owner,focus,listener=[0,0,0],namespace=data.id||'battle',speed=1}={}){
    const metadata=new Map((data.metadata||[]).map(m=>[m.id,m])),rows=new Map((data.ships||[]).map(r=>[r[0],r]));
    if(active){
      const types=[...new Set([...metadata.values()].map(m=>m.type))].sort(),signature=types.join(',');
      if(signature!==prepared){prepared=signature;audio.prepare([...types.map(t=>firingClip(t)),...types.flatMap(t=>[hullClip(t),hullClip(t,true)]),'shield_hit','shield_break','hull_destroyed','critical_alarm','charge','Bomber','Cargo_Ship','Light_Fighter']);}
    }
    const weaponEmitter=m=>`${namespace}:${m.id}:weapon`;
    const play=(key,e,m,{gain=1,priority=1,cooldown=.3,...timing}={})=>{
      if(!key)return;
      const position=e.from||[e.x,e.y,e.z],local=m?.id===focus;
      const distance=position.every(Number.isFinite)?Math.hypot(...position.map((v,i)=>v-listener[i])):0;
      if(!local&&distance>3500)return;
      const level=local?.65:.38/(1+distance/500);
      void audio.play(key,{emitter:`${namespace}:${m?.id??e.source}`,gain:level*gain,
        pan:local?0:Math.max(-.8,Math.min(.8,(position[0]-listener[0])/800))||0,
        priority:priority+(local?2:0),cooldown,age:Math.max(0,(data.tick-e.tick)*.05/speed),...timing});
    };
    for(const e of data.events||[]){
      if(!e.resume&&e.seq<=seq)continue;seq=Math.max(seq,e.seq);
      if(!active||!e.resume&&data.tick-e.tick>12)continue;
      const m=metadata.get(e.shipId??e.source),row=rows.get(m?.id),before=previous.get(m?.id);
      if(!m)continue;
      if(e.type==='weapon-charge'){
        // Fast replay keeps the original timbre: use the discharge cue at fire,
        // then gate its body to the shorter on-screen beam instead of pitch-shifting.
        if(speed!==1)continue;
        if(e.resume&&audio.isPlaying(weaponEmitter(m)))continue;
        const key=firingClip(m.type,e),cue=weaponCues[key];
        play(key,e,m,{emitter:weaponEmitter(m),delay:e.windup-(cue?.attack||0),priority:3,cooldown:e.windup,gain:1});
      }else if(e.type==='weapon-stop'){audio.stopEmitter(weaponEmitter(m));beams.delete(m.id);}
      else if(e.type==='fire'){
        if(e.manual&&/laser|ion|beam|reaper/.test(e.kind))beams.set(m.id,e.target);
        if(e.sound===false||e.manual&&audio.isPlaying(weaponEmitter(m)))continue;
        const key=firingClip(m.type,e),cue=weaponCues[key],beam=/laser|ion|beam|reaper/.test(e.kind);
        play(key,e,m,{emitter:e.manual?weaponEmitter(m):`${namespace}:${m.id}`,
          offset:cue?.attack||0,duration:beam&&(!e.manual||speed!==1)?(e.beamDuration||(key==='Reaper'?.95:small.has(m.type)?.075:.35))/speed:undefined,
          cooldown:e.manual?(cue?.body||.16):e.secondary?.16:Math.min(.8,cue?.body||.16),gain:e.secondary?.55:1,priority:e.manual?3:1});
      }else if(e.type==='antimatter'&&!e.harmless)play('Annihilator',e,m,{priority:3,cooldown:3,offset:.12});
      else if(e.type==='antimatter-charge'&&m.id===focus)play('charge',e,m,{gain:.45,cooldown:3});
      else if(e.type==='destroy'){
        for(const [source,target] of beams)if(source===m.id||target===m.id){audio.stopEmitter(weaponEmitter({id:source}));beams.delete(source);}
        audio.stopEmitter(weaponEmitter(m));
        if(e.kind==='swarm-expire'||e.kind==='antimatter'&&e.source===e.shipId)continue;
        play('hull_destroyed',e,m,{priority:3,gain:small.has(m.type)?.45:1,cooldown:2,offset:.06});
      }else if(e.type==='hit'){
        const hp=e.hp??row?.[6],shield=e.shieldAfter??row?.[7],oldShield=e.shieldBefore??before?.[7];
        if(shield>0)broken.delete(m.id);
        const broke=oldShield>0&&shield===0&&!broken.has(m.id)&&hp>0;
        if(broke){broken.add(m.id);play('shield_break',e,m,{priority:3,cooldown:1,offset:.05});}
        else if(e.shield)play('shield_hit',e,m,{gain:.65,cooldown:.4,offset:.06});
        if(!e.shield||(e.hullDamage??((before?.[6]??hp)-hp))>0){
          const severe=!!e.critical||hp<=m.maxHp*.35;
          play(hullClip(m.type,severe),e,m,{cooldown:severe?1.8:.65,priority:severe?2:1});
        }
        if(hp>m.maxHp*.4)alerted.delete(m.id);
        if(m.owner===owner&&m.id===focus&&hp>0&&hp<=m.maxHp*.3&&!alerted.has(m.id)){
          alerted.add(m.id);void audio.play('critical_alarm',{emitter:'own-warning',gain:.7,priority:5,cooldown:10});
        }
      }
    }
    seq=Math.max(seq,data.eventSeq||0);
    previous=rows;
  }
  return {consume,reset,get eventSeq(){return seq;}};
}
