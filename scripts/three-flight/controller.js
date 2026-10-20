import {battleMount} from '../../game/spatial-battle.mjs';
import {surfaceHeight,battleViewEnvironment} from '../../game/battle-terrain.mjs';
import {GROUND_BLAST_LIFETIME} from '../../game/ground-blast.mjs';
import {cockpitClass,pilotKeys,pilotHandling,cabinPose} from '../../game/pilot-controls.mjs';
import {shipCabinClass,resetShipCabin} from '../../game/ship-cabins.mjs';
import {SessionStream} from './session-stream.js';
import {projectileContact} from '../../game/projectile-contact.mjs';
import {predictPilot} from '../../game/pilot-motion.mjs';
import * as BattleDisplay from '../../game/battle-display.mjs';
import {createBattlePresentation} from './presentation.js';
import {createLifetime} from './lifecycle.js';
import {consumeBattleEvents,replayEventCursor} from './timeline.js';
import {BattleViewCulling} from './view-culling.js';
import {ProjectileVisualContacts,predictedProjectilePosition,displayedProjectilePosition} from './projectile-visuals.js';
import {FortressPresentation} from './fortress-presentation.js';
import {createCombatSoundSession} from '../../client/combat-audio.mjs';
export const createFlightController=({state,renderer,SHIPS,COMBAT,LAYOUTS,keys,$,M,V,clamp,mix,shortAngle,notice,configureFlight,setView,selectedTarget,renderContacts,shipMatrix,tone,burst,updateCamera,forward,getMouseDown,combatAudio=null})=>{

  const lifetime=createLifetime(), {listen,later}=lifetime;
  // Independent battlefield controller; shared runtime supplies cameras, controls and rendering.
  class NativeFleetBattle {
    constructor(){this.audio=combatAudio;this.audioSession=combatAudio?createCombatSoundSession(combatAudio):null;this.params=new URLSearchParams(location.search);this.id=this.params.get('battle');this.replayId=this.params.get('replay');this.metadata=[];this.rows=[];this.previous=[];this.selected=-1;this.controlled=null;this.seq=0;this.eventSeq=0;this.fireUntil=0;this.missileUntil=0;this.overview=true;this.presentation=createBattlePresentation({state,M,V,LAYOUTS,shipMatrix});this.distance=650;this.center=[0,0,0];this.quality=1;this.lodLevels=new Map();this.overviewYaw=.45;this.overviewPitch=.24;this.playTime=0;this.playSpeed=1;this.elapsedFrames=[];this.contacts=new Map();this.vesselVisuals=new Map();this.projectileVisuals=new Map();this.meshGroups=new Map();this.detailIds=new Set();}
    sound(data){if(!this.audioSession)return;this.audioSession.consume({...data,id:this.id||this.replayId,metadata:this.metadata,ships:this.rows},{active:!window.commandSceneActive&&!this.paused&&state.mode==='flight',owner:this.owner,focus:this.selected,listener:renderer.eye||state.flight.pos});}
    name(type){return type==='Swarm_Fighter'?'蜂群战斗机':SHIPS[this.indices?.get(type)]?.name||type;}
    async orderCarrier(order){const m=this.metadata[this.selected],id=this.selected;if(this.carrierPending||this.replay||this.snapshot?.status!=='active'||!m?.profile.carrier||m.owner!==this.owner||!(this.rows[id]?.[6]>0))return;
      this.carrierPending=true;this.carrierMessage='正在发送僚机指令';try{await this.request('/api/battles/'+this.id+'/control',{type:'carrier-order',shipId:id,...order});this.receive(await this.request('/api/battles/'+this.id));this.carrierMessage='僚机指令已下达';}catch(e){this.carrierMessage=e.message;notice(e.message);}finally{this.carrierPending=false;}
    }
    async request(url,body){if(body&&this.replayId)throw Error('回放只读');const r=await fetch(url,{signal:lifetime.signal,credentials:'same-origin',cache:'no-store',headers:{'X-Empire-Client':'galactic-command','Content-Type':'application/json'},...(body?{method:'POST',body:JSON.stringify(body)}:{})});const data=await r.json();if(!r.ok){const error=Error(data.error||'无法连接战场');error.battleConnection=true;throw error;}return data;}
    fail(e){if(lifetime.disposed)return;notice(e.message);$('#native-status').textContent=e.message;console.error(e);}
    async start(){
      document.body.classList.add('real-battle');$('.flight-header>div').innerHTML='银河帝国<span>/</span>真实战场';$('.flight-header>p').textContent='正式交战 · 自动接敌 / 亲自驾驶';$('#flight').setAttribute('aria-label','真实战场驾驶');$('#flight-nav-label').textContent='真实战场';$('.help-note').textContent='这是正式战斗。移动与射击影响真实损失；退出驾驶交还 AI。全景中拖动旋转、滚轮缩放，Shift 拖动平移。';const bar=document.createElement('div');bar.id='native-battle-bar';bar.innerHTML='<strong id="native-status">连接真实战场…</strong><select id="native-formation" aria-label="己方编队"></select><select id="native-vessel" aria-label="编队内舰船"></select><button id="native-claim">亲自驾驶</button><button id="native-release">交还 AI</button><button id="native-cinema">交火视角</button><button id="native-ground">地面阵地</button><button id="native-overview">舰队全景</button><button id="native-follow">跟随 / 舰桥</button><button id="native-leave">返回舰队</button><button id="native-pause" hidden>暂停</button><select id="native-speed" hidden><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select><input id="native-seek" type="range" min="0" max="600" step=".1" value="0" hidden>';document.body.append(bar);this.labels=document.createElement('div');this.labels.id='formation-labels';document.body.append(this.labels);this.labels.onclick=e=>{const button=e.target.closest('[data-group]');if(!button)return;const group=this.displayGroups.find(g=>g.key===button.dataset.group);if(group)this.chooseGroup(group.key);};
      listen(window,'message',e=>{if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='battle-visibility')return;window.commandSceneActive=!e.data.active;if(!e.data.active){this.audio?.stop();keys.clear();void this.setAI(true);}});
      $('#native-formation').onchange=e=>this.chooseGroup(e.target.value);$('#native-vessel').onchange=e=>this.select(Number(e.target.value));$('#native-claim').onclick=()=>this.setAI(false);$('#native-release').onclick=()=>this.setAI(true);$('#native-cinema').onclick=()=>this.frameBattle();$('#native-ground').onclick=()=>this.frameGround();$('#native-overview').onclick=()=>this.frameBattle(true);$('#native-follow').onclick=()=>{this.overview=false;setView();};$('#native-leave').onclick=()=>this.leave();$('#native-pause').onclick=()=>this.togglePlayback();$('#native-speed').onchange=e=>this.playSpeed=Number(e.target.value);$('#native-seek').oninput=e=>this.seek(Number(e.target.value));
      const canvas=$('#scene');listen(canvas,'wheel',e=>{if(this.overview){e.preventDefault();this.distance=clamp(this.distance*Math.exp(e.deltaY*.001),80,12000);}},{passive:false});listen(canvas,'pointermove',e=>{if(this.overview&&e.buttons){this.cinematicAnchor=null;if(e.shiftKey){this.cinematicAnchor=null;const right=[Math.cos(this.overviewYaw),0,-Math.sin(this.overviewYaw)];for(let i=0;i<3;i++)this.center[i]-=right[i]*e.movementX*this.distance*.001;this.center[1]+=e.movementY*this.distance*.001;}else{this.overviewYaw-=e.movementX*.004;this.overviewPitch=clamp(this.overviewPitch+e.movementY*.003,-1.3,1.3);}}});
      listen(document,'visibilitychange',()=>{if(document.hidden){keys.clear();void this.setAI(true);}});listen(window,'pagehide',()=>this.dispose());
      const account=await this.request('/api/state');if(lifetime.disposed)return;this.owner=account.player.id;
      if(this.replayId){await this.loadReplay(this.replayId);return;}
      this.receive(await this.request('/api/battles/'+this.id));if(lifetime.disposed)return;
      this.stream=new SessionStream('/api/battles/'+this.id+'/events');this.stream.onmessage=e=>{if(lifetime.disposed)return;try{this.receive(JSON.parse(e.data));}catch(error){this.fail(error);}};this.stream.onerror=()=>{if(!lifetime.disposed)notice('正在重新连接，超时后由 AI 接管');};listen(this.stream,'finished',async()=>{this.stream.close();clearInterval(this.inputTimer);try{this.receive(await this.request('/api/battles/'+this.id));this.controlled=null;notice('战斗结束 · 返回舰队可查看战报和回放');}catch(error){this.fail(error);}});
      this.inputTimer=setInterval(()=>this.sendInput(),100);this.syncHeader();
    }
    async loadReplay(id){
      this.clearVisuals();const data=await this.request('/api/replay/'+encodeURIComponent(id));
      if(!data.record?.frames?.length||!data.record.metadata?.length)throw Error('这份战报没有可播放的空间录像');
      this.replay={...data.record,events:data.record.events||[],environment:battleViewEnvironment(data.record.environment)};
      this.deathTicks=new Map(this.replay.events.filter(e=>e.type==='destroy').map(e=>[e.shipId,e.tick]));
      this.report={...data.report,duration:Number((Number.isFinite(data.report.duration)?data.report.duration:this.replay.frames.at(-1).tick*.05).toFixed(2))};
      this.metadata=this.replay.metadata;this.rows=this.replay.frames[0].ships;this.previous=this.rows;this.replayAlpha=1;this.playTime=0;this.replayCursor=0;this.paused=false;this.controlled=null;clearInterval(this.inputTimer);
      this.prepare();this.update(0);this.frameBattle(true);
      document.body.classList.add('replay-mode');
      document.title='历史回放 · '+(this.report.title||'舰队战斗');
      $('.flight-header>div').textContent='银河帝国 / 历史回放';
      $('.flight-header>p').textContent=this.report.title||'已保存的战斗记录';
      $('.help-note').textContent='观看已保存的舰队轨迹与交火。拖动进度条、调整倍速；可切换舰队全景或跟随参战舰船。';
      $('#flight-nav-label').textContent='历史回放';$('#flight').setAttribute('aria-label','历史战斗回放');
      for(const name of ['claim','release'])$('#native-'+name).hidden=true;
      $('#native-leave').textContent='退出回放';
      for(const name of ['pause','speed','seek'])$('#native-'+name).hidden=false;
      $('#native-seek').step='.05';$('#native-seek').max=this.report.duration;this.syncHeader();
      notice('历史回放 · '+(this.report.targetName||this.report.title||'舰队战斗'));
    }
    togglePlayback(){
      if(!this.replay)return;
      if(this.playTime>=this.report.duration){this.seek(0);this.frameBattle(true);this.paused=false;}
      else this.paused=!this.paused;
      if(this.paused)this.audio?.stop();this.syncHeader();
    }
    clearVisuals(){
      this.audioSession?.reset();
      this.feedbackEpoch=(this.feedbackEpoch||0)+1;
      this.presentation.clear();this.projectileVisuals.clear();this.vesselVisuals.clear();
      this.visualContacts?.clear();this.visualContactsReady=false;
      this.fortressPresentation?.clear();
      for(const key of ['shieldHits','beams','particles','projectiles','weaponImpacts','specialBlasts','mushroomClouds'])state.flight[key]=[];
    }
    seek(seconds){
      if(!this.replay)return;
      this.playTime=clamp(seconds,0,this.report.duration);this.replayCursor=replayEventCursor(this.replay.events,this.playTime*20);
      this.clearVisuals();for(const e of this.replay.events)if(e.tick<=seconds*20&&e.tick>seconds*20-GROUND_BLAST_LIFETIME*20)this.groundBlast(e,(seconds*20-e.tick)*.05);this.predicted=null;this.collisionRows=null;this.update(0);
      this.syncHeader();
    }
    receive(data){
      data={...data,environment:battleViewEnvironment(data.environment)};
      if(this.snapshot&&data.tick<this.snapshot.tick)return;
      if(data.trial){$('.flight-header>p').textContent='舰队演练';$('.help-note').textContent='主力保持三维战列，轻舰近距离缠斗；返回舰队可修改双方配比。';}
      this.previous=this.rows;this.rows=data.ships;this.received=performance.now();this.snapshot=data;this.projectiles=data.projectiles||[];state.flight.specialBlasts=(data.specialBlasts||[]).filter(e=>!e.harmless).map(e=>({...e,pos:[e.x,e.y,e.z],age:Math.max(0,(data.tick-e.tick)*.05)}));
      if(data.metadata){this.metadata=data.metadata;this.prepare();}
      const control=data.controls?.[this.owner],owned=this.controlRequested&&control?.clientId===this.clientId;
      if(data.tick>(this.controlTick??-1)||owned){this.controlled=this.releasing||!owned?null:control.shipId;}
      if(owned)this.seq=Math.max(this.seq,control.seq??0);
      if(this.controlled!==null&&this.selected!==this.controlled)this.select(this.controlled,false);
      this.sound(data);
      this.eventSeq=consumeBattleEvents(data.events||[],this.eventSeq,event=>this.effect(event));
      this.eventSeq=Math.max(this.eventSeq,data.eventSeq||0);if(data.status==='finished'&&!this.replay){this.controlled=null;this.overview=true;}this.syncHeader();
    }
    prepare(){
      this.fullDetail=this.metadata.length<=128;this.indices=new Map(SHIPS.map((s,i)=>[s.id,i]));for(const m of this.metadata)if(m.profile.renderType&&this.indices.has(m.profile.renderType))this.indices.set(m.type,this.indices.get(m.profile.renderType));this.types=new Map();
      for(const m of this.metadata)if(m.owner===this.owner&&m.profile.piloted){if(!this.types.has(m.type))this.types.set(m.type,[]);this.types.get(m.type).push(m.id);}
      this.displayGroups=BattleDisplay.groupBattleShips(this.metadata);this.refreshGroups();
      if(this.selected<0||!this.metadata[this.selected]){const id=this.metadata.find(m=>m.owner===this.owner&&m.profile.piloted&&this.rows[m.id]?.[6]>0)?.id??this.metadata.find(m=>this.indices.has(m.type))?.id;if(id!==undefined)this.select(id,false);}
      this.buildGroups();if(!this.framed){this.frameBattle();if(this.params.get('view')==='ground')this.frameGround();this.framed=true;}
    }
    async select(id,release=true){if(!this.metadata[id]||!this.indices.has(this.metadata[id].type))return;if(release&&this.controlled!==null)await this.setAI(true);this.selected=id;this.predicted=null;const m=this.metadata[id],index=this.indices.get(m.type);const blasts=state.flight.specialBlasts,clouds=state.flight.mushroomClouds;configureFlight(index,true);state.flight.specialBlasts=blasts||[];state.flight.mushroomClouds=clouds||[];state.flight.targets=[];state.flight.ai=true;this.contacts.clear();const ids=this.displayGroups.find(g=>g.key===m.formation)?.ids||[id];$('#native-formation').value=m.formation;$('#native-vessel').innerHTML=ids.filter(id=>this.rows[id]?.[6]>0).map(id=>'<option value="'+id+'">'+this.name(m.type)+' #'+(id+1)+'</option>').join('');$('#native-vessel').value=id;this.applyOwn(true);this.refreshContacts();}
    refreshGroups(){const select=$('#native-formation'),value=select.value;select.innerHTML=this.displayGroups.map(g=>{const n=g.ids.filter(id=>this.rows[id]?.[6]>0).length;return '<option value="'+g.key+'" '+(!n?'disabled':'')+'>'+(g.owner===this.owner?'己方':'敌方')+' · '+this.name(g.type)+' · '+g.key.split(':').at(-1)+'队 · '+n+' 艘</option>';}).join('');if(this.displayGroups.some(g=>g.key===value))select.value=value;}
    chooseGroup(key){const group=this.displayGroups.find(g=>g.key===key),id=group?.ids.find(id=>this.rows[id]?.[6]>0);if(id!==undefined){this.select(id);const row=this.rows[id];this.cinematicAnchor=null;this.cinemaComposition=false;this.center=row.slice(1,4);this.distance=Math.max(100,this.metadata[id].profile.length*(this.metadata[id].type==='Iron_Behemoth'?3.2:12));this.overview=true;}}
    chooseType(type){const id=this.types.get(type)?.find(id=>this.rows[id]?.[6]>0);if(id!==undefined)return this.select(id);notice('该编队已经没有存活舰船');}
    frameGround(){
      const ground=this.metadata.filter(m=>m.profile.ground&&this.rows[m.id]?.[6]>0);if(!ground.length)return this.frameBattle(true);
      this.overview=true;this.cinematicAnchor=null;this.cinemaComposition=false;
      this.center=[1,2,3].map(i=>ground.reduce((sum,m)=>sum+this.rows[m.id][i],0)/ground.length);this.center[1]+=60;
      this.distance=Math.max(850,...ground.map(m=>Math.hypot(this.rows[m.id][1]-this.center[0],this.rows[m.id][3]-this.center[2])*2.5));
      const modules=(this.snapshot?.environment||this.replay?.environment)?.fortress?.modules;
      if(modules?.length){
        this.center=['x','y','z'].map(k=>modules.reduce((sum,m)=>sum+m[k],0)/modules.length);this.center[1]+=35;
        const radius=Math.max(...modules.map(m=>Math.hypot(m.x-this.center[0],m.z-this.center[2])))+120;
        this.distance=Math.max(650,radius*2.6)*Math.max(1,renderer.height/renderer.width);
      }
      this.overviewPitch=.65;this.overviewYaw=-1.15;
    }
    frameBattle(all=false){
      this.overview=true;this.cinematicAnchor=null;this.cinemaComposition=!all;
      const live=this.metadata.filter(m=>this.rows[m.id]?.[6]>0);if(!live.length)return;
      if(all){const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const m of live)for(let i=0;i<3;i++){lo[i]=Math.min(lo[i],this.rows[m.id][i+1]);hi[i]=Math.max(hi[i],this.rows[m.id][i+1]);}this.center=lo.map((v,i)=>(v+hi[i])/2);this.distance=Math.max(500,Math.hypot(...lo.map((v,i)=>hi[i]-v))*.85);this.overviewPitch=.55;this.overviewYaw=-.7;return;}
      const own=live.filter(m=>m.owner===this.owner),anchor=own.find(m=>m.type==='Iron_Behemoth')||own.find(m=>m.type==='Dreadnought')||own.find(m=>m.type==='Battleship')||own.find(m=>m.profile.role==='line')||own[0]||live[0],row=this.rows[anchor.id],sign=anchor.side==='attacker'?1:-1;
      this.cinematicAnchor=anchor.id;const focus=this.cinemaFocus(anchor.id,row);this.center=focus.center;this.distance=Math.max(this.fullDetail?420:520,anchor.profile.length*3.2);this.overviewYaw=focus.yaw;this.overviewPitch=.18;
    }
    cinemaFocus(id,row){const enemy=this.rows[row[8]],sign=this.metadata[id].side==='attacker'?1:-1,dir=enemy?.[6]>0?V.norm(V.sub(enemy.slice(1,4),row.slice(1,4))):[sign,0,0];return {center:[row[1]+dir[0]*(this.fullDetail?150:180),row[2]+dir[1]*(this.fullDetail?150:180)+15,row[3]+dir[2]*(this.fullDetail?150:180)],yaw:Math.atan2(-dir[0],-dir[2])+.65};}
    async setAI(enabled){
      if(this.replayId||this.replay||lifetime.disposed)return;
      try{
        if(enabled){
          this.controlRequested=false;
          if(this.releasePending)return await this.releasePending;
          const shipId=this.controlled;
          this.controlled=null;this.predicted=null;state.flight.ai=true;keys.clear();
          this.controlGeneration=(this.controlGeneration||0)+1;
          if(shipId!==null){
            // Stop new input immediately, then finish the already-sent input before
            // releasing authority. Otherwise its response can race the release.
            this.releasing=true;this.syncHeader();
            this.releasePending=(async()=>{
              if(this.inputPending)await this.inputPending.catch(()=>{});
              if(!lifetime.disposed)await this.request('/api/battles/'+this.id+'/control',{type:'release',clientId:this.clientId});
            })();
            try{await this.releasePending;}finally{this.releasing=false;this.releasePending=null;}
          }
        }else{
          if(this.releasePending)await this.releasePending;
          if(lifetime.disposed||this.claiming)return;
          this.clientId??=crypto.randomUUID();this.controlRequested=true;
          const generation=this.controlGeneration=(this.controlGeneration||0)+1;
          this.claiming=true;this.syncHeader();
          let data;
          try{data=await this.request('/api/battles/'+this.id+'/control',{type:'claim',shipId:this.selected,clientId:this.clientId});}finally{this.claiming=false;}
          if(lifetime.disposed||generation!==this.controlGeneration||!this.controlRequested){await this.request('/api/battles/'+this.id+'/control',{type:'release',clientId:this.clientId});return;}
          this.controlTick=data.tick;this.controlled=data.control.shipId;this.seq=Math.max(this.seq,data.control.seq);this.predicted=null;state.flight.ai=false;
          if(state.flight.external)setView();this.overview=false;state.flight.yawTarget=state.flight.yaw;state.flight.pitchTarget=state.flight.pitch;
          notice('已接管参战舰船 · 射击与损失计入真实战果');
        }
        if(!lifetime.disposed){const kind=state.flight.cabinKind;state.flight.cabinWalk=enabled&&kind==='bastion';state.flight.cabinPose=kind?cabinPose(kind):null;this.syncHeader();}
      }catch(e){if(!lifetime.disposed){notice(e.message);this.syncHeader();}}
    }
    fire(kind){if(kind==='missile'&&!this.metadata[this.selected]?.profile.missile&&!this.metadata[this.selected]?.profile.secondaryMissile){notice('该舰未装备导弹');return false;}if(this.replay||this.controlled===null){notice('点击亲自驾驶，接管己方参战舰船');return false;}if(kind==='missile')this.missileUntil=performance.now()+180;else this.fireUntil=performance.now()+180;return true;}
    pilotIntent(){
      const p=state.flight,target=selectedTarget();
      if(p.align&&target?.hp>0){const d=V.sub(target.pos,p.pos);p.yawTarget=Math.atan2(d[0],-d[2]);p.pitchTarget=clamp(Math.atan2(d[1],Math.hypot(d[0],d[2])),-1.2,1.2);}
      const input={throttle:p.throttle/100,yaw:0,pitch:0,roll:pilotKeys(keys,this.metadata[this.selected]?.profile).roll,heading:shortAngle(Math.PI-p.yawTarget),elevation:clamp(p.pitchTarget,-1.2,1.2),fire:keys.has('Space')||(!p.profile.capital&&getMouseDown())||performance.now()<this.fireUntil,missile:keys.has('KeyR')||performance.now()<this.missileUntil,lock:p.align,boost:keys.has('ShiftLeft')||keys.has('ShiftRight')||p.boost};
      if(target?.hp>0)input.target=target.shipId;return input;
    }
    async sendInput(){
      if(lifetime.disposed||this.busy||this.releasing||this.claiming||this.replayId||this.replay||this.controlled===null||document.hidden)return;
      const shipId=this.controlled,generation=this.controlGeneration||0,input=this.pilotIntent(),sent=performance.now();this.busy=true;
      const pending=this.request('/api/battles/'+this.id+'/control',{type:'input',shipId,clientId:this.clientId,seq:++this.seq,input});this.inputPending=pending;
      try{await pending;if(generation===(this.controlGeneration||0))this.inputLatency=Math.min(.15,(performance.now()-sent)/2000);}
      catch(e){if(!lifetime.disposed&&generation===(this.controlGeneration||0)&&this.controlled===shipId){
        if(e.message==='控制序号已过期'){try{this.receive(await this.request('/api/battles/'+this.id));}catch{} }
        else{this.controlRequested=false;this.controlled=null;this.predicted=null;state.flight.ai=true;notice(e.message);}
      }}
      finally{if(this.inputPending===pending){this.inputPending=null;this.busy=false;}}
    }
    syncHUD(){const p=state.flight,m=this.metadata[this.selected];if(!m)return;$('#fire-spinal').hidden=!!m.profile.defenseOnly;if(m.profile.defenseOnly)$('#special-readout').textContent='指挥母舰 · 全军攻击 +15%（不叠加）· 自动补充蜂群 / 集火指令';if(m.profile.special==='antimatter')$('#special-readout').textContent='无人自动突击 · 接近引爆 · 一次性消耗 · 穿盾冲击 / 收割者免疫';else if(m.profile.special==='reaper')$('#special-readout').textContent='双束相位武器 · 有限护盾回收 · 免疫湮灭之星';const missiles=m.profile.missile||m.profile.secondaryMissile;$('#weapon-primary-name').textContent=m.profile.primaryName||p.profile.primaryName;$('#fire-spinal > span:nth-child(2)').innerHTML=(m.profile.primaryName||p.profile.primaryName)+'<small>'+(m.profile.fixed?'沿舰艏射界':'自动火控 / 手动指定目标')+'</small>';$('#system-turret').hidden=!m.profile.pointDefense&&!m.profile.secondary;$('.turret-readiness').hidden=!m.profile.pointDefense&&!m.profile.secondary;$('#fire-salvo').hidden=!missiles;$('#system-missile').hidden=!missiles;$('#missile-stock').textContent=p.missileCooldown>0?p.missileCooldown.toFixed(1)+'s':'就绪';$('#missile-capacity').parentElement.hidden=true;$('#system-missile-state').textContent=p.missileCooldown>0?'装填中':'已就绪';$('.contacts h2 small').textContent=String(p.targets.length).padStart(2,'0');if(this.replay){$('.flight-header>div').innerHTML='银河帝国<span>/</span>历史回放';$('#toggle-ai').disabled=true;}}
    syncHeader(){if(!this.snapshot&&!this.report)return;const counts=[0,0];for(let i=0;i<this.rows.length;i++)if(this.rows[i]?.[6]>0)counts[this.metadata[i]?.side==='attacker'?0:1]++;$('#native-status').textContent=(this.replay?'历史回放 · '+(this.report.targetName||this.report.title||'舰队战斗'):this.snapshot?.trial?'编队测试':'真实战场')+' · '+counts.join(' : ')+' 艘 · '+Math.floor(this.replay?this.playTime:(this.snapshot?.elapsed||0))+' / '+(this.replay?this.report.duration:600)+' 秒'+(this.replay&&this.playTime>=this.report.duration?' · 播放完毕':'');if(this.replay){$('#native-pause').textContent=this.playTime>=this.report.duration?'重新播放':this.paused?'继续':'暂停';}$('#native-claim').textContent=this.controlled===this.selected?'驾驶中':'亲自驾驶';$('#native-claim').disabled=!!this.releasing||!!this.claiming||this.controlled===this.selected||!!this.replay||this.rows[this.selected]?.[6]<=0||this.metadata[this.selected]?.owner!==this.owner||!this.metadata[this.selected]?.profile.piloted;$('#native-release').disabled=this.controlled===null;$('#ai-label').textContent=this.controlled===null?'亲自驾驶':'交还 AI';$('#ai-indicator').classList.toggle('visible',this.controlled===null);$('#flight-input-copy').textContent=this.controlled===null?'观战中 · 选择己方编队后亲自驾驶':(cockpitClass(this.metadata[this.selected]?.profile)==='fighter'?'W/S 油门 · A/D 滚转 · Q/E 俯仰 · 右键瞄准':'W/S 油门 · A/D 转向 · T 选敌 · X 对准')+' · G AUTO';$('#loadout-caption').textContent=this.replay?'历史战斗录像 · 查看双方舰队与交火':'真实参战舰船 · 退出驾驶交还 AI · 战斗不能撤退';if(this.replay)$('#flight-input-copy').textContent='历史回放 · 观战模式';}
    row(id){if(this.presentationRow?.[0]===id)return this.presentationRow;const n=this.rows[id],o=this.previous[id]||n;if(!n)return null;const f=this.replay?this.replayAlpha:clamp(((this.sampleTime??performance.now())-this.received)/200,0,1);
      // Map rendering uses one sample time for the entire frame. Reuse its
      // interpolation for hulls, weapons, contacts and presentation snapshots.
      const cached=this.sampleTime!=null;
      if(cached){if(this.rowCacheSource!==this.rows||this.rowCachePrevious!==this.previous||this.rowCacheAlpha!==f){this.rowCacheSource=this.rows;this.rowCachePrevious=this.previous;this.rowCacheAlpha=f;this.rowCache=[];}if(this.rowCache[id])return this.rowCache[id];}
      const result=[id,mix(o[1],n[1],f),mix(o[2],n[2],f),mix(o[3],n[3],f),o[4]+shortAngle(n[4]-o[4])*f,mix(o[5],n[5],f),n[6],n[7],n[8],n[9],n[10]||0,n[11]||0,(o[12]||0)+shortAngle((n[12]||0)-(o[12]||0))*f,(o[13]??o[4])+shortAngle((n[13]??n[4])-(o[13]??o[4]))*f,mix(o[14]||0,n[14]||0,f)];if(cached)this.rowCache[id]=result;return result;}
    applyOwn(reset=false){const r=this.controlled===this.selected?this.rows[this.selected]:this.row(this.selected),m=this.metadata[this.selected],p=state.flight;if(!r||!m)return;
      p.pos=r.slice(1,4);p.roll=r[12]||0;p.cabinKind=shipCabinClass(m.type,m.profile);if(reset)resetShipCabin(p,m.type,m.profile);p.yaw=Math.PI-r[4];p.pitch=r[5];p.speed=r[9]*8;p.velocity=[Math.sin(r[4])*Math.cos(r[5])*r[9],Math.sin(r[5])*r[9],Math.cos(r[4])*Math.cos(r[5])*r[9]];p.hull=r[6]/m.maxHp*100;p.shield=m.maxShield?r[7]/m.maxShield*100:0;p.gunCooldown=r[10];p.missileCooldown=r[11];p.profile={...COMBAT[state.shipIndex],maxSpeed:m.profile.speed*8,turnRate:pilotHandling(m.profile).turn,mainCooldown:m.profile.cooldown};p.ai=this.controlled===null;p.missileStock=m.profile.missile||m.profile.secondaryMissile?p.profile.missileCapacity:0;p.missileCooldown=m.profile.missile?r[10]:r[11];
      if(reset||p.ai){p.yawTarget=p.yaw;p.pitchTarget=p.pitch;}
      else{
        const now=performance.now(),age=Math.min(.4,(now-this.received)/1000+(this.inputLatency||0)+.025),input=this.pilotIntent(),authority=predictPilot(r,m.profile,input,age),old=this.predicted;
        if(!old||V.length(V.sub(old.pos,[authority.x,authority.y,authority.z]))>100)this.predicted={pos:[authority.x,authority.y,authority.z],yaw:Math.PI-authority.yaw,pitch:authority.pitch,roll:authority.roll,speed:authority.speed,at:now};
        else{
          const dt=clamp((now-old.at)/1000,0,.05),row=[0,...old.pos,Math.PI-old.yaw,old.pitch,0,0,-1,old.speed??r[9],0,0,old.roll||0],next=predictPilot(row,m.profile,input,dt);
          // Compare poses at the same extrapolated time, rather than pulling back to a stale 5 Hz snapshot.
          const angleBlend=1-Math.exp(-dt*3),positionBlend=1-Math.exp(-dt*7);
          old.yaw=Math.PI-next.yaw+shortAngle(next.yaw-authority.yaw)*angleBlend;old.pitch=mix(next.pitch,authority.pitch,angleBlend);
          old.roll=next.roll+shortAngle(authority.roll-next.roll)*angleBlend;
          old.pos=[next.x,next.y,next.z].map((v,i)=>mix(v,[authority.x,authority.y,authority.z][i],positionBlend));old.speed=next.speed;old.at=now;
        }
        const predicted=this.predicted;p.pos=[...predicted.pos];p.yaw=predicted.yaw;p.pitch=predicted.pitch;p.roll=predicted.roll||0;p.speed=predicted.speed*8;p.velocity=[Math.sin(p.yaw)*Math.cos(p.pitch)*predicted.speed,Math.sin(p.pitch)*predicted.speed,-Math.cos(p.yaw)*Math.cos(p.pitch)*predicted.speed];
      }
      if(r[6]<=0){this.controlled=null;this.overview=true;p.ai=true;}
    }
    refreshContacts(requestedTarget){const p=state.flight,own=this.metadata[this.selected];if(!own)return;const locked=requestedTarget??p.targets[p.targetIndex]?.shipId;
      const candidates=this.metadata.filter(m=>m.side!==own.side&&this.rows[m.id]?.[6]>0&&this.indices.has(m.type)).sort((a,b)=>V.length(V.sub(this.rows[a.id].slice(1,4),p.pos))-V.length(V.sub(this.rows[b.id].slice(1,4),p.pos))).slice(0,5);
      if(locked!==undefined&&this.rows[locked]?.[6]>0&&!candidates.some(m=>m.id===locked))candidates.unshift(this.metadata[locked]);
      p.targets=candidates.map(m=>{let t=this.contacts.get(m.id);if(!t){t={shipId:m.id,name:this.name(m.type)+' #'+(m.id+1),code:'真实参战舰',kind:this.indices.get(m.type),scale:1,shieldHits:[],maxShield:100,seed:m.id,respawn:Infinity};this.contacts.set(m.id,t);}return t;});p.targetIndex=Math.max(0,p.targets.findIndex(t=>t.shipId===locked));this.updateContacts();renderContacts();
    }
    updateContacts(){for(const t of state.flight.targets){const row=this.row(t.shipId),m=this.metadata[t.shipId];if(!row)continue;t.pos=row.slice(1,4);t.hp=row[6]/m.maxHp*100;t.shield=m.maxShield?row[7]/m.maxShield*100:0;t.heading=Math.PI-row[4];t.velocity=[Math.sin(row[4])*Math.cos(row[5])*row[9],Math.sin(row[5])*row[9],Math.cos(row[4])*Math.cos(row[5])*row[9]];}}
    weaponStyle(index,kind,secondary=false){
      const profile=COMBAT[index]||{},visual=profile.visual||{},small=(LAYOUTS[index]?.length||20)<=5;
      if(kind==='missile'){const auxiliary=small||LAYOUTS[index]?.id==='Cruiser';return {color:[1,.64,.22],visual:{capital:!small,compact:auxiliary,radius:auxiliary?.16:.4,trail:auxiliary?18:55,glow:auxiliary?6:20,blastRadius:auxiliary?2:9,impact:auxiliary?5:32}};}
      if(small)return {color:profile.weaponColor||[1,.75,.35],visual:{...visual,compact:true,radius:Math.min(.035,visual.radius||.025),beamLife:.075,blastRadius:.35,impact:2}};
      if(secondary)return {color:kind==='laser'?[1,.5,.14]:kind==='plasma'?[.48,.65,1]:[1,.78,.38],visual:{capital:true,radius:.18,trail:9,glow:8,blastRadius:2.5,impact:12}};
      return {color:profile.weaponColor||[.5,.8,1],visual};
    }
    fleetBurst(point,count,color,life,speed){const left=Math.max(0,800-state.flight.particles.length);if(left&&count)burst(point,Math.min(count,left),color,life,speed);}
    muzzle(id,mount=0,secondary=false){const row=this.row(id),index=this.indices.get(this.metadata[id]?.type),layout=LAYOUTS[index];if(!row||!layout)return null;if(this.metadata[id]?.profile.ground)return battleMount({x:row[1],y:row[2],z:row[3],yaw:row[4],pitch:0,turretYaw:row[13],turretPitch:row[14],profile:this.metadata[id].profile},this.metadata[id].profile.hardpoints?.main?.[0]);return M.transform(shipMatrix({pos:row.slice(1,4),yaw:Math.PI-row[4],pitch:row[5],roll:row[12]||0},index),(secondary?layout.joints.filter(j=>j.role==='secondary').map(j=>j.mount):layout.main)[mount]||[0,0,0]);}
    beamEnd(from,id,fallback){const row=this.row(id);if(!row)return fallback;const center=row.slice(1,4),radius=this.metadata[id].profile.radius||1,k=projectileContact(from,center,center,radius)??1;return from.map((v,i)=>mix(v,center[i],k));}
    groundBlast(e,age=0){
      const m=this.metadata[e.shipId],source=this.metadata[e.source];
      if(!m?.profile.ground||source?.type!=='Bomber'||!['hit','destroy'].includes(e.type)||(e.shield&&e.type!=='destroy'))return;
      const p=state.flight,clouds=p.mushroomClouds??=[];
      if(clouds.some(c=>c.shipId===e.shipId&&Math.abs(c.tick-e.tick)<30))return;
      const env=this.snapshot?.environment||this.replay?.environment;if(!env)return;
      clouds.push({shipId:e.shipId,tick:e.tick,pos:[e.x,Math.max(surfaceHeight(env,e.x,e.z)+2,e.y-4),e.z],age,seed:e.shipId*1.73+e.tick*.01});
      if(clouds.length>16)clouds.shift();
    }
    effect(e){
      // The consumed warhead has one dedicated effect; victim ships still explode normally.
      if(e.type==='destroy'&&e.kind==='antimatter'&&e.shipId===e.source)return;
      this.presentation.event(e,this);this.groundBlast(e);const p=state.flight;
      if(e.projectileId!==undefined&&e.type!=='fire'){this.projectiles=(this.projectiles||[]).filter(q=>q.id!==e.projectileId);p.projectiles=(p.projectiles||[]).filter(q=>q.id!==e.projectileId);this.projectileVisuals.delete(e.projectileId);}
      if(e.type==='fire'){
        const index=this.indices?.get(this.metadata[e.shipId]?.type),profile=COMBAT[index]||p.profile,{visual,color}=this.weaponStyle(index,e.kind,e.secondary);
        const mounts=/laser|ion|beam|reaper/.test(e.kind)?Math.max(1,e.secondary?LAYOUTS[index]?.joints.filter(j=>j.role==='secondary').length||0:LAYOUTS[index]?.main.length||0):1;
        for(let mount=0;mount<mounts;mount++){
          const from=/laser|ion|beam|reaper/.test(e.kind)?this.muzzle(e.shipId,mount,e.secondary)||e.from:e.from;
          if(/laser|ion|beam|reaper/.test(e.kind))p.beams.push({source:e.shipId,target:e.target,mount,secondary:e.secondary,start:from,end:this.beamEnd(from,e.target,e.to),age:0,life:visual.beamLife||.35,width:visual.radius||profile.beamWidth||.12,color,compact:visual.compact});
          else if(this.replay){const delta=V.sub(e.to,from),speed=e.speed||(e.kind==='missile'?210:540);p.projectiles.push({id:e.projectileId,source:e.shipId,side:this.metadata[e.shipId]?.side,target:e.target,pos:[...from],previous:[...from],velocity:e.velocity||V.scale(V.norm(delta),speed),speed,age:0,life:V.length(delta)/speed+.2,missile:e.kind==='missile',trail:[[...from]],color,visual,kind:e.kind});}
          const near=V.length(V.sub(from,renderer.eye||p.pos))<350||e.shipId===this.controlled;
          if(!visual.compact||near)renderer.weaponImpact(p,from,{visual,color,muzzle:true});
          if(!visual.compact&&V.length(V.sub(from,renderer.eye||p.pos))<1800)this.fleetBurst(from,visual.capital?18:5,color,.25,visual.elite?24:10);
        }
        if(e.shipId===this.selected){p.mainShots++;p.shake=Math.min(.35,LAYOUTS[state.shipIndex].length*.005);}
      }else if(e.type==='antimatter'){
        if(e.harmless){notice('湮灭之星失去目标 · 安全解除弹头');return;}
        if(!(p.specialBlasts||[]).some(b=>b.source===e.source&&b.tick===e.tick))(p.specialBlasts??=[]).push({...e,pos:[e.x,e.y,e.z],age:0});
        if(!e.harmless){notice('湮灭之星起爆 · 反物质冲击扩散');}
      }else if(e.type==='antimatter-launch'){notice('湮灭之星 · 自行突击');
      }else if(e.type==='blast'){
        renderer.weaponImpact(p,[e.x,e.y,e.z],{areaRadius:e.radius,critical:!!e.critical,color:e.kind==='heavy'?[.3,.65,1]:[1,.42,.08]});
      }else if(e.type==='destroy'||e.type==='hit'||e.type==='intercept'){
        const point=[e.x,e.y,e.z],m=this.metadata[e.shipId],source=this.metadata[e.source],profile=COMBAT[this.indices.get(source?.type||m?.type)]||{},dead=e.type==='destroy';
        const small=(m?.profile.length||20)<=5,near=V.length(V.sub(point,renderer.eye||p.pos))<350||e.shipId===this.controlled;
        const visual=dead?{blastRadius:small?Math.max(.6,(m?.profile.length||1)*.3):(m?.profile.length||5)*.6,elite:(m?.profile.length||0)>=50,compact:small}:this.weaponStyle(this.indices.get(source?.type),e.kind).visual;
        if(e.type==='intercept'&&e.from)p.beams.push({start:e.from,end:point,age:0,life:.14,width:.08,color:[1,.8,.36]});
        if(!visual.compact||near||dead)renderer.weaponImpact(p,point,{visual,shield:e.shield&&!dead,destroy:dead,critical:!!e.critical,color:[1,.38,.06]});
        if(V.length(V.sub(point,renderer.eye||p.pos))<2200)this.fleetBurst(point,visual.compact?(dead?(near?12:4):near?2:0):dead?100:e.shield?14:35,e.shield&&!dead?[.35,.7,1]:[1,.55,.12],visual.compact?.35:dead?2.7:.8,visual.compact?6:dead?55:visual.impact||16);
        if(e.type==='hit'&&e.shield&&(!small||near)){const row=this.rows[e.shipId],index=this.indices.get(m?.type);if(row&&index!==undefined){const vessel=this.visualVessel(e.shipId),model=shipMatrix({pos:row.slice(1,4),yaw:Math.PI-row[4],pitch:row[5],roll:row[12]||0},index),charge=Math.max(.1,(this.previous[e.shipId]?.[7]||row[7])/Math.max(1,m.maxShield)*100);renderer.shieldImpact(vessel,index,model,point,2,charge);}}
        if(e.shipId===this.selected&&e.type==='hit'){p.shake=.14;$('#damage-wash').classList.add('show');later(()=>$('#damage-wash').classList.remove('show'),150);}
      }else if(e.type==='reinforcement'&&e.tick>0)notice('增援抵达 · '+e.count+' 艘');
    }
    projectilePosition(q,seconds,visual){
      const to=visual?displayedProjectilePosition(q,visual,seconds/.2):predictedProjectilePosition(q,seconds),from=visual?.pos||visual?.packetStart||[q.x,q.y,q.z];
      this.visualContacts??=new ProjectileVisualContacts();
      if(!this.visualContactsReady)this.visualContacts.update(this.metadata,id=>this.row(id));
      const contact=this.visualContacts.contact(from,to,q.side,!!visual?.pos);
      if(visual&&contact)visual.contact=contact;
      return contact?.pos||to;
    }
    update(dt){
      this.presentation.update(dt);const now=performance.now();if(this.frameTime)this.elapsedFrames.push(now-this.frameTime);this.frameTime=now;if(this.elapsedFrames.length>600)this.elapsedFrames.shift();if(window.battleBenchmark?.fixedQuality!==undefined){this.quality=clamp(Number(window.battleBenchmark.fixedQuality)||1,.4,1);}else if(this.elapsedFrames.length%60===0){const mean=this.elapsedFrames.slice(-60).reduce((a,b)=>a+b,0)/60;this.quality=clamp(this.quality+(mean>29?-.12:mean<20?.03:0),.4,1);}if(!this.rows.length)return;
      const p=state.flight;if(this.replay){if(!this.paused)this.playTime=Math.min(this.report.duration,this.playTime+dt*this.playSpeed);if(this.playTime>=this.report.duration&&!this.paused){this.paused=true;this.audio?.stop();this.syncHeader();}const tick=this.playTime*20,frames=this.replay.frames;let lo=0,hi=frames.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(frames[mid].tick<=tick)lo=mid;else hi=mid-1;}const a=frames[lo],b=frames[Math.min(lo+1,frames.length-1)];this.replayCarriers=a.carriers||[];this.previous=a.ships;this.rows=a.ships.map((row,id)=>{const next=b.ships[id]||row;const result=[...next.slice(0,6),...row.slice(6,12),...next.slice(12)];if((this.deathTicks.get(id)??Infinity)<=tick)result[6]=0;return result;});this.replayAlpha=a.tick===b.tick?1:clamp((tick-a.tick)/(b.tick-a.tick),0,1);$('#native-seek').value=this.playTime;const soundEvents=[];while(this.replayCursor<this.replay.events.length&&this.replay.events[this.replayCursor].tick<=tick){const e=this.replay.events[this.replayCursor++];if(e.tick>=tick-(e.type==='antimatter'?106:3)){this.effect(e);soundEvents.push(e);}}if(soundEvents.length)this.sound({events:soundEvents,tick});}
      const blastTime=this.replay?this.playTime:(this.snapshot?.elapsed||0)+Math.min(.2,(now-this.received)/1000);p.specialBlasts=(p.specialBlasts||[]).filter(e=>{e.age=Math.max(0,blastTime-e.tick*.05);return e.age<5.3;});
      if(this.controlled!==null){const input=pilotKeys(keys,this.metadata[this.selected].profile);p.throttle=clamp(p.throttle+dt*27*input.throttle,0,100);if(input.yaw||input.pitch)p.align=false;p.yawTarget+=input.yaw*p.profile.turnRate*dt;p.pitchTarget=clamp(p.pitchTarget+input.pitch*p.profile.turnRate*dt,-1.2,1.2);}
      if(this.overview&&this.cinematicAnchor!=null){const anchor=this.row(this.cinematicAnchor);if(anchor?.[6]>0){const focus=this.cinemaFocus(this.cinematicAnchor,anchor);this.center=this.center.map((v,i)=>mix(v,focus.center[i],1-Math.exp(-dt)));this.overviewYaw+=shortAngle(focus.yaw-this.overviewYaw)*(1-Math.exp(-dt*.35));}else this.frameBattle();}
      this.applyOwn();p.elapsed+=dt;p.boostActive=keys.has('ShiftLeft')||keys.has('ShiftRight')||p.boost;updateCamera(dt);p.shake*=Math.exp(-dt*5);
      if(!this.contactsAt||now-this.contactsAt>700){this.contactsAt=now;this.refreshContacts();this.refreshGroups();this.syncHeader();}else this.updateContacts();
      const target=selectedTarget();if(target){const dir=V.norm(V.sub(target.pos,p.pos));p.boresightError=Math.acos(clamp(V.dot(dir,forward()),-1,1))*180/Math.PI;p.missileLock=target;p.missileLockTime=.4;}
      // Articulation aims at actual contacts. Firing and damage stay server-authoritative.
      for(const joint of p.joints){joint.cooldown=Math.max(0,joint.cooldown-dt);if(target){const delta=V.sub(target.pos,p.pos);joint.yaw=clamp(Math.atan2(delta[0],-delta[2])-p.yaw,-Math.PI,Math.PI);joint.aligned=true;}}
      this.updateVisuals(dt,now);
      document.body.classList.toggle('battle-overview',this.overview);
    }
    // Shared by the standalone battlefield and the map; no UI or simulation side effects.
    updateVisuals(dt,now=performance.now()){
      const p=state.flight;
      this.visualContacts??=new ProjectileVisualContacts();this.visualContacts.update(this.metadata,id=>this.row(id));this.visualContactsReady=true;
      p.mushroomClouds=(p.mushroomClouds||[]).filter(c=>{c.age+=this.replay?(this.paused?0:dt*this.playSpeed):dt;return c.age<GROUND_BLAST_LIFETIME;});
      p.beams=p.beams.filter(b=>{b.age+=dt;if(b.source!==undefined){b.start=this.muzzle(b.source,b.mount,b.secondary)||b.start;b.end=this.beamEnd(b.start,b.target,b.end);}return b.age<b.life;});p.particles=p.particles.filter(q=>{q.age+=dt;q.pos=V.add(q.pos,V.scale(q.velocity,dt));return q.age<q.life;});
      if(!this.replay){
        const liveIds=new Set(),sortCenter=this.overview?this.center:p.pos;p.projectiles=(this.projectiles||[]).map(q=>{
          liveIds.add(q.id);const dir=V.norm([q.dx-q.x,q.dy-q.y,q.dz-q.z]),age=clamp(((this.sampleTime??now)-this.received)/1000,0,.2);
          let visual=this.projectileVisuals.get(q.id);if(!visual){visual={trail:[],born:now,trailAt:0};this.projectileVisuals.set(q.id,visual);}
          if(visual.contact)return null;
          const pos=this.projectilePosition(q,age,visual);visual.pos=pos;
          if(visual.contact){visual.trail.length=0;return null;}
          if(now-visual.trailAt>=30){visual.trail.push(pos);if(visual.trail.length>50)visual.trail.shift();visual.trailAt=now;}
          const distance=(pos[0]-sortCenter[0])**2+(pos[1]-sortCenter[1])**2+(pos[2]-sortCenter[2])**2;return {id:q.id,pos,distance,previous:visual.trail.at(-2)||pos,velocity:q.vx===undefined?V.scale(dir,q.speed):[q.vx,q.vy,q.vz],age:(q.age||0)+age,life:10,missile:q.missile,trail:visual.trail,...this.weaponStyle(this.indices.get(this.metadata[q.source]?.type),q.kind,q.secondary),kind:q.kind,hostile:q.side!==this.metadata[this.selected]?.side};
        }).filter(Boolean).sort((a,b)=>a.distance-b.distance).slice(0,600);
        for(const id of this.projectileVisuals.keys())if(!liveIds.has(id))this.projectileVisuals.delete(id);
      }else p.projectiles=p.projectiles.filter(q=>{if(this.paused)return true;const step=dt*this.playSpeed;q.age+=step;const target=this.row(q.target);if(q.missile&&target&&q.age>.2){const speed=Math.min(q.speed||210,38+(q.age-.2)*180),goal=V.scale(V.norm(V.sub(target.slice(1,4),q.pos)),speed);q.velocity=q.velocity.map((v,i)=>mix(v,goal[i],1-Math.exp(-step*4)));}q.previous=q.pos;q.pos=V.add(q.pos,V.scale(q.velocity,step));if(this.visualContacts.contact(q.previous,q.pos,q.side||this.metadata[q.source]?.side))return false;if(q.missile){q.trail.push([...q.pos]);if(q.trail.length>50)q.trail.shift();}return q.age<q.life;});
    }
    buildGroups(){
      this.meshGroups.clear();this.displayGroups=BattleDisplay.groupBattleShips(this.metadata);
      for(const m of this.metadata){if(!this.indices.has(m.type))continue;const key=m.side+':'+m.type;
        if(!this.meshGroups.has(key))this.meshGroups.set(key,{ids:[]});this.meshGroups.get(key).ids.push(m.id);
      }
      for(const group of this.meshGroups.values())group.matrices=new Float32Array(group.ids.length*16);
    }
    visualVessel(id){if(id===this.selected)return state.flight;let v=this.vesselVisuals.get(id);if(!v){const index=this.indices.get(this.metadata[id].type);v={shieldHits:[],joints:LAYOUTS[index].joints.map(j=>({...j}))};this.vesselVisuals.set(id,v);}return v;}
    drawNativeShip(r,id){
      const row=this.row(id),m=this.metadata[id],index=this.indices.get(m.type),model=shipMatrix({pos:row.slice(1,4),yaw:Math.PI-row[4],pitch:row[5],roll:row[12]||0},index),v=this.visualVessel(id),target=this.row(row[8]);
      if(m.profile.modelScale)for(let j=0;j<12;j++)model[j]*=m.profile.modelScale;
      if(target){const delta=V.sub(target.slice(1,4),row.slice(1,4));for(const joint of v.joints||[]){joint.yaw=shortAngle(Math.atan2(delta[0],-delta[2])-(Math.PI-row[4]));joint.pitch=Math.atan2(delta[1],Math.hypot(delta[0],delta[2]));}}
      const friendly=m.owner===this.owner,teamColor=friendly?[.086,.545,.922]:[.906,.294,.314];
      if(m.profile.ground)r.drawDefense(index,model,row[13]-row[4],row[14],teamColor);else r.drawVessel(index,model,{light:[-.5,.9,.7],exposure:1,tint:friendly?[.87,.97,1]:[1,.88,.76],teamColor},v.joints);r.drawShield(v,index,model);
      if(row[9]>0)r.drawExhaust(index,model,clamp(row[9]/Math.max(1,m.profile.speed)*100,0,100),false,r.time);
    }
    drawFleet(r){if(!this.rows.length)return;const p=state.flight;
      const view=(this.viewCulling??=new BattleViewCulling()).update(r.vp),inView=id=>{const row=this.row(id),profile=this.metadata[id].profile;return row&&view.visible(row[1],row[2],row[3],Math.max(profile.length*2,profile.radius||0,Math.hypot(row[1]-r.eye[0],row[2]-r.eye[1],row[3]-r.eye[2])*12/focal));};
      const focal=r.height/(2*Math.tan(r.fov/2));
      const environment=this.snapshot?.environment||this.replay?.environment;
      const showGround=this.snapshot?.status!=='finished'||!!this.replay||!!environment?.fortress;
      if(environment?.fortress){
       this.fortressPresentation??=new FortressPresentation();
       const time=this.replay?.frames?this.playTime:(this.snapshot?.tick||0)*.05+(this.replay?0:Math.max(0,((this.sampleTime??performance.now())-this.received)/1000));
       r.drawFortress(environment,this.renderNamespace||'',this.metadata,this.rows,this.fortressPresentation,time,this.snapshot?.platformDeaths||this.replay?.events||this.snapshot?.effects||this.snapshot?.events||[]);
      }
      const candidates=this.metadata.filter(m=>(showGround||!m.profile.ground)&&this.rows[m.id]?.[6]>0&&this.indices.has(m.type)).map(m=>{const d=Math.max(1,V.length(V.sub(this.rows[m.id].slice(1,4),r.eye)));return {id:m.id,d,pixels:m.profile.length*focal/d};}).sort((a,b)=>b.pixels-a.pixels);
      if(this.fullDetail&&candidates.every(c=>c.pixels>=8)){
        const ids=candidates.map(c=>c.id);this.renderedIds=new Set(ids);this.engineIds=[];this.detailIds=new Set(ids);this.highIds=new Set(ids);this.drawLabels(r,[]);
        this.renderStats={mode:'three',alive:ids.length,instances:ids.length,groups:0,detail:ids.length,high:ids.length,quality:1};
        for(const id of ids)if(id!==this.hiddenVessel&&(this.overview||id!==this.selected)&&inView(id))this.drawNativeShip(r,id);if(showGround&&environment?.fortress)r.drawDefenseField(environment,this.metadata,this.rows,this.owner);return;
      }
      const near=candidates.filter(v=>(this.metadata[v.id].profile.ground||v.pixels>(this.fullDetail?8:65))&&(this.overview||v.id!==this.selected)&&v.id!==this.hiddenVessel).slice(0,this.fullDetail?128:Math.floor(12*this.quality)).map(v=>v.id);this.detailIds=new Set(near);
      this.highIds=new Set();let triangles=0;for(const c of candidates){const mesh=r.shipMeshes[this.indices.get(this.metadata[c.id].type)];if(c.pixels<8||triangles+mesh.count/3>1800000*this.quality)continue;this.highIds.add(c.id);triangles+=mesh.count/3;}
      const display=BattleDisplay.visibleBattleShips(this.displayGroups.filter(g=>showGround||!this.metadata[g.ids[0]].profile.ground),this.rows,{eye:r.eye,height:r.height,fov:r.fov,quality:this.quality,pinned:[this.selected,...near,...this.highIds,...state.flight.targets.slice(0,1).map(t=>t.shipId)],previous:this.lodLevels});this.lodLevels=display.levels;this.renderedIds=display.visible;this.engineIds=candidates.filter(c=>c.pixels>3&&display.visible.has(c.id)&&r.project(this.rows[c.id].slice(1,4)).visible).slice(0,Math.floor(120*this.quality)).map(c=>c.id);this.renderStats={alive:display.alive,instances:display.visible.size,groups:display.labels.length,detail:near.length,high:this.highIds.size,low:candidates.filter(c=>!this.highIds.has(c.id)&&!this.detailIds.has(c.id)).length,quality:this.quality};this.drawLabels(r,display.labels);
      for(const[key,g]of this.meshGroups)for(const high of [false,true]){let count=0;const slotIds=[];for(const id of g.ids){const row=this.row(id);if(!row||id===this.hiddenVessel||row[6]<=0||!display.visible.has(id)||this.detailIds.has(id)||this.highIds.has(id)!==high||(!this.overview&&id===this.selected)||!inView(id))continue;const index=this.indices.get(this.metadata[id].type);if(index===undefined)continue;const matrix=shipMatrix({pos:row.slice(1,4),yaw:Math.PI-row[4],pitch:row[5],roll:row[12]||0},index);if(this.metadata[id].profile.modelScale)for(let j=0;j<12;j++)matrix[j]*=this.metadata[id].profile.modelScale;if(!high&&!this.snapshot?.environment&&!this.replay?.environment){const pixels=this.metadata[id].profile.length*focal/Math.max(1,V.length(V.sub(row.slice(1,4),r.eye))),scale=Math.max(1,6/Math.max(.001,pixels));for(let j=0;j<12;j++)matrix[j]*=scale;}for(let j=0;j<3;j++)matrix[12+j]-=r.eye[j];g.matrices.set(matrix,count++*16);slotIds.push(id);}
        if(!count)continue;
        const meta=this.metadata[g.ids[0]],friendly=meta.owner===this.owner;
        r.drawFleetInstances((this.renderNamespace||'')+key,this.indices.get(meta.type),g.matrices,slotIds,{high,type:meta.profile.renderType||meta.type,tint:meta.profile.ground?[1,1,1]:friendly?[.87,.97,1]:[1,.88,.76],teamColor:friendly?[.086,.545,.922]:[.906,.294,.314]});
      }
      for(const id of near)if(inView(id))this.drawNativeShip(r,id);
      if(showGround&&environment?.fortress)r.drawDefenseField(environment,this.metadata,this.rows,this.owner);
    }
    drawLabels(r,groups){if(performance.now()-(this.labelsAt||0)<150)return;this.labelsAt=performance.now();const occupied=[];this.labels.innerHTML=groups.sort((a,b)=>a.distance-b.distance).flatMap(g=>{const q=r.project(g.center),key=Math.floor(q.x/160)+':'+Math.floor(q.y/42);if(!q.visible||q.x<30||q.x>r.width-160||q.y<110||q.y>r.height-60||occupied.some(p=>Math.abs(p.x-q.x)<155&&Math.abs(p.y-q.y)<32))return [];occupied.push(q);return ['<button data-group="'+g.key+'" style="left:'+q.x+'px;top:'+q.y+'px;color:'+(g.owner===this.owner?'#8edce9':'#ffa88b')+'">'+(g.owner===this.owner?'◆ ':'◇ ')+this.name(g.type)+' × '+g.count+'</button>'];}).slice(0,40).join('');}
    drawOverview(r,s,time){r.begin(time);const d=this.distance,yaw=this.overviewYaw,pitch=this.overviewPitch;r.eye=[Math.sin(yaw)*Math.cos(pitch)*d,Math.sin(pitch)*d,Math.cos(yaw)*Math.cos(pitch)*d].map((v,i)=>v+this.center[i]);r.fov=55*Math.PI/180;const projection=M.perspective(r.fov,r.width/r.height,1,Math.max(22000,this.distance+(this.snapshot?.boundary||4000)*3));if(this.cinemaComposition){projection[8]=.12;projection[9]=-.22;}r.vp=M.mul(projection,M.lookAt(r.eye,this.center));r.cameraForward=V.norm(V.sub(this.center,r.eye));r.cameraUp=[0,1,0];r.projectionShiftX=projection[8];r.projectionOffset=projection[9];this.presentation.environment(r,time,this.snapshot?.environment||this.replay?.environment);this.drawFleet(r);r.drawCombatEffects(state.flight,time,shipMatrix(state.flight,state.shipIndex));if(!this.fullDetail)this.presentation.draw(r,this,false);}

    dispose(){
      if(lifetime.disposed)return;
      this.audio?.stop();
      if(!this.replayId&&!this.replay&&(this.controlled!==null||this.releasing||this.claiming)){
        void fetch('/api/battles/'+this.id+'/control',{method:'POST',credentials:'same-origin',keepalive:true,headers:{'X-Empire-Client':'galactic-command','Content-Type':'application/json'},body:JSON.stringify({type:'release',clientId:this.clientId})}).catch(()=>{});
      }
      this.controlled=null;this.stream?.close();clearInterval(this.inputTimer);lifetime.dispose();this.presentation.clear();
      this.contacts.clear();this.vesselVisuals.clear();this.projectileVisuals.clear();this.meshGroups.clear();this.labels?.remove();$('#native-battle-bar')?.remove();
    }
    leave(){if(window.GalacticDemo?.dispose)window.GalacticDemo.dispose();else this.dispose();if(parent!==window)parent.postMessage({type:'battle-exit'},location.origin);else location.assign(this.replayId?'/#reports':'/');}
  }

return new NativeFleetBattle();
};
