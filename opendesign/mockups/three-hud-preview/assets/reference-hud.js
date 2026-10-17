/* VALIANT / HF-01 interactive HUD. Model geometry is owned by GalaxyRender. */
(() => {
 'use strict';
 const G=window.GalacticDemo,R=window.GalaxyRender,root=document.getElementById('command-shell');
 if(!G?.renderer||!R){root.style.display='none';return;}
 const {V,M,axes,clamp,mix,LAYOUTS,seeded}=R,s=G.state,p=s.flight,$=id=>document.getElementById(id),all=sel=>[...root.querySelectorAll(sel)];
 const baseProfiles=G.profiles.map(x=>({...x}));
 const hud={power:[35,30,20,15],shields:[100,100,100,100],priority:0,formation:'wedge',hangar:false,capacitor:100,heat:0,overheated:false,gunShots:0,turretShots:0,missileShots:0,logs:[],friends:[],baseKills:0,capitalKills:0,escortKills:0,seenDeaths:new Set(),lastHull:-1,lastHP:100,hitFlash:0,damageFlash:0,noticeUntil:0,emergencyCooldown:0,tab:'tactical',help:false,helpWasPaused:false,lastPanelUpdate:0,lastNow:0,targetsOnMap:[],radarTargets:new Map(),modeToken:0,debug:{frames:0,mapHits:0,commands:0},lastFireSupport:0};
 const friendlyNames=['ALPHA','BETA','GAMMA','DELTA'];
 for(let i=0;i<4;i++)hud.friends.push({name:friendlyNames[i],pos:[0,0,0],kind:i<2?3:0,scale:i<2?1.2:.85,heading:0,deployed:false});
 const ids={captain:'BCS VALIANT',pilot:'HF-01 · TALON'};
 function text(id,value){const el=$(id);if(el&&el.textContent!==String(value))el.textContent=value;}
 function fill(id,value){const el=$(id);if(el)el.style.width=clamp(value,0,100)+'%';}
 function simTime(){let n=Math.floor(p.elapsed||0);return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');}
 function log(message){hud.logs.push({time:simTime(),message});hud.logs=hud.logs.slice(-4);$('u-log').replaceChildren(...hud.logs.map(e=>{const line=document.createElement('p'),em=document.createElement('em');em.textContent='['+e.time+'] ';line.append(em,document.createTextNode(e.message));return line;}));}
 function notice(message){text('u-status',message);$('u-status').classList.add('show');hud.noticeUntil=performance.now()+3100;log(message);}
 function resize(){root.style.setProperty('--hud-scale',Math.min(innerWidth/1600,innerHeight/900));}
 window.addEventListener('resize',resize);resize();
 const iconTitles={'u-view':'V · 切换第一 / 第三人称','u-reset':'重新开始本场演练','u-pause':'P / Esc · 暂停 / 继续','u-full':'全屏','u-help-btn':'H · 操作说明'};
 for(const [id,title] of Object.entries(iconTitles)){if($(id)){$(id).title=title;$(id).setAttribute('aria-label',title);}}
 function updatePowerUI(){
  all('[data-power]').forEach(el=>{let i=+el.dataset.power;el.value=hud.power[i];text('u-power-'+i,hud.power[i]+'%');});
  text('u-bottom-wep',hud.power[0]+'%');text('u-bottom-sh',hud.power[1]+'%');text('u-bottom-eng',hud.power[2]+'%');
  const b=baseProfiles[s.shipIndex],c=p.profile;
  if(c&&b){c.mainCooldown=b.mainCooldown*Math.pow(35/hud.power[0],.36);c.chargeTime=b.chargeTime*Math.pow(35/hud.power[0],.25);c.maxSpeed=b.maxSpeed*(.65+.35*hud.power[2]/20);c.missileCooldown=b.missileCooldown*Math.pow(35/hud.power[0],.22);}
 }
 function setPower(index,value){
  value=Math.round(clamp(value,5,70));const indices=[0,1,2,3].filter(i=>i!==index),previous=[...hud.power];
  for(const i of indices)hud.power[i]=5;hud.power[index]=value;
  for(let n=100-value-15;n>0;n--){let best=indices.filter(i=>hud.power[i]<70).sort((a,b)=>previous[b]/(hud.power[b]+1)-previous[a]/(hud.power[a]+1))[0];hud.power[best]++;}updatePowerUI();
 }
 function aggregateShield(){p.shield=hud.shields.reduce((a,b)=>a+b,0)/4;}
 function shieldBalance(){const avg=hud.shields.reduce((a,b)=>a+b,0)/4;hud.shields.fill(avg);hud.priority=-1;aggregateShield();notice('护盾储能已均衡到四个分区');}
 function setPaused(on){s.hudPaused=!!on;$('u-pause-label').classList.toggle('show',s.hudPaused&&!hud.help);$('u-pause').classList.toggle('selected',s.hudPaused);G.clearControls();}
 function help(open){if(open===hud.help)return;hud.help=open;$('u-help').classList.toggle('open',open);if(open){hud.helpWasPaused=!!s.hudPaused;setPaused(true);$('u-help').querySelector('button').focus();}else{setPaused(hud.helpWasPaused);$('u-help-btn').focus();}}
 function reset(){
  s.transition=null;G.configureFlight(s.shipIndex===3?3:4,true);G.screenVisible('flight');hud.shields.fill(100);hud.capacitor=100;hud.heat=0;hud.overheated=false;hud.hangar=false;hud.friends=hud.friends.filter(f=>!f.deployed);hud.friends.forEach(f=>f.pos=[0,0,0]);hud.lastHull=-1;hud.capitalKills=0;hud.escortKills=0;hud.seenDeaths.clear();hud.lastFireSupport=0;hud.gunShots=0;hud.turretShots=0;hud.missileShots=0;hud.emergencyCooldown=0;hud.logs=[];s.hudPaused=false;hud.help=false;$('u-help').classList.remove('open');$('u-pause-label').classList.remove('show');$('transition-curtain').classList.remove('active');$('transition-curtain').style.opacity=0;$('transition-curtain').style.pointerEvents='none';notice('演练已重置 · 武器与护盾就绪');
 }
 function switchTo(index){if(s.shipIndex===index||s.transition)return;if(hud.help)help(false);setPaused(false);G.switchCombatHull(index);hud.modeToken++;}
 function hullChanged(){
  const cap=s.shipIndex===4;root.classList.toggle('pilot',!cap);$('u-mode-captain').classList.toggle('selected',cap);$('u-mode-pilot').classList.toggle('selected',!cap);
  $('u-mode-captain').setAttribute('aria-pressed',String(cap));$('u-mode-pilot').setAttribute('aria-pressed',String(!cap));
  text('u-shipname',cap?ids.captain:ids.pilot);text('u-shipclass',cap?'玄武级战列舰　/　BB-01　舰长指挥':'重装战斗机　/　HF-01　ALPHA SQUADRON');
  p.external=cap;p.cameraBlend=cap?1:0;p.cameraVelocity=0;p.orbitYaw=0;p.orbitPitch=0;p.cameraZoom=1;p.throttle=cap?26:40;p.ai=false;p.align=false;hud.heat=0;hud.overheated=false;hud.gunShots=0;hud.turretShots=0;hud.missileShots=0;
  const initialTarget=p.targets.findIndex(t=>cap?t.kind===4:t.kind===3);if(initialTarget>=0)G.selectTarget(initialTarget);
  hud.lastHull=s.shipIndex;hud.shields.fill(p.shield);hud.lastHP=p.hull;updatePowerUI();rebuildContacts();log(cap?'已接管玄武级战列舰，武器链路就绪':'HF-01 已接管，僚机进入护航航线');
 }
 function fireMain(){if(hud.heat>=100||hud.overheated){notice('武器冷却中 · 请稍候');return;}G.fireMain();}
 function launchMissiles(){if(s.hudPaused)return;const stock=p.missileStock,cd=p.missileCooldown;G.fireMissile();if(p.missileStock<stock)notice((s.shipIndex===4?'垂直发射阵列齐射':'追踪导弹发射')+' · '+(stock-p.missileStock)+' 发');else if(cd>0)notice('导弹发射器冷却 · '+cd.toFixed(1)+' s');else if(stock<=0)notice('弹舱自动补给中');}
 function toggleHangar(){if(s.shipIndex!==4)return;hud.hangar=!hud.hangar;if(!hud.hangar)hud.friends=hud.friends.filter(f=>!f.deployed);else{for(let i=0;i<4;i++)hud.friends.push({name:'WING '+(i+1),pos:[...p.pos],kind:3,scale:.8,heading:0,deployed:true});}notice(hud.hangar?'舰载机联队已出动 · 4 架战斗机':'舰载机联队召回');if(hud.tab==='fleet')openDrawer('fleet');}
 function emergency(){if(hud.capacitor<60||hud.emergencyCooldown>0){notice(hud.emergencyCooldown>0?'紧急充能冷却中':'电容储能不足 · 需要 60%');return;}hud.capacitor-=60;hud.emergencyCooldown=18;hud.shields=hud.shields.map(v=>Math.min(100,v+32));aggregateShield();notice('紧急护盾充能 · 四区护盾恢复');}
 function toggleTurrets(){if(s.shipIndex!==4)return;let modes=['auto','hold','manual'],mode=modes[(modes.indexOf(p.turretMode)+1)%3];G.setTurretMode(mode);notice({auto:'炮塔自动追踪当前目标',hold:'全部炮塔停火',manual:'炮塔手动瞄准 · 左键开火'}[mode]);}
 function toggleBoost(){if(hud.capacitor<6&&!p.boost){notice('加力储能正在恢复');return;}p.boost=!p.boost;notice(p.boost?'加力推进已启用':'已恢复巡航推力');}
 function openDrawer(tab){
  hud.tab=tab;const drawer=$('u-drawer');all('.u-top-tabs button').forEach(b=>b.classList.toggle('selected',b.dataset.uAction==='tab-'+tab));
  if(tab==='tactical'){drawer.classList.remove('open');return;}
  const h=document.createElement('h2');h.textContent=tab==='fleet'?'FLEET / 舰队状态':'SYSTEMS / 舰船系统';const close=document.createElement('button');close.textContent='×';close.setAttribute('aria-label','关闭面板');close.onclick=()=>openDrawer('tactical');h.append(close);drawer.replaceChildren(h);
  const rows=tab==='fleet'?hud.friends.map(f=>[f.name,f.kind===3?'HF-01 重装战机':'D-06 护航驱逐舰',f.deployed?'ENGAGING':'IN FORMATION']):[['同轴主炮','冷却 / 蓄能随武器功率变化',p.gunCooldown>0?'COOLING':'ONLINE'],['近防炮塔','追踪锁定目标；支持自动 / 手动 / 停火',p.turretMode.toUpperCase()],['护盾阵列','分区恢复；点击分区改变充能优先级','ONLINE'],['推进系统','引擎功率影响最高航速','ONLINE'],['舰载机联队','机库功率影响舰载机火力支援间隔',hud.hangar?'DEPLOYED':'STANDBY']];
  for(const row of rows){let div=document.createElement('div');div.className='u-drawer-row';for(const part of row){let span=document.createElement('span');span.textContent=part;div.append(span);}drawer.append(div);}drawer.classList.add('open');
 }
 const actions={
  captain:()=>switchTo(4),pilot:()=>switchTo(3),view:()=>G.setView(),reset,pause:()=>setPaused(!s.hudPaused),help:()=>help(!hud.help),'help-close':()=>help(false),
  full:()=>{const op=document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();op?.catch(()=>notice('当前浏览器未允许全屏，请使用 F11'));},
  main:fireMain,missile:launchMissiles,turret:toggleTurrets,hangar:toggleHangar,target:()=>{G.cycleTarget();notice('锁定目标 · '+p.targets[p.targetIndex].name);},align:()=>{G.alignTarget();notice(p.align?'舰艏正在自动对准当前目标':'自动对准已解除');},
  auto:()=>{G.setAI(!p.ai);notice(p.ai?'自动驾驶已接管航向与武器':'手动控制已恢复');},focus:()=>{if(p.turretMode==='hold')G.setTurretMode('auto');if(!p.align)G.alignTarget();fireMain();launchMissiles();notice('集中火力 · '+p.targets[p.targetIndex]?.name);},emergency,boost:toggleBoost,
  'shield-balance':shieldBalance,'power-reset':()=>{hud.power=[35,30,20,15];updatePowerUI();notice('反应堆恢复标准功率分配');},
  'throttle-minus':()=>p.throttle=clamp(p.throttle-10,0,100),'throttle-plus':()=>p.throttle=clamp(p.throttle+10,0,100),
  'tab-tactical':()=>openDrawer('tactical'),'tab-fleet':()=>openDrawer('fleet'),'tab-systems':()=>openDrawer('systems')
 };
 root.addEventListener('click',e=>{
  const action=e.target.closest('[data-u-action]');if(action){const name=action.dataset.uAction;hud.debug.commands++;if(name.startsWith('drive-')){p.throttle=+name.slice(6);p.ai=false;G.setAI(false);p.boost=false;notice('推进指令 · '+p.throttle+'% 油门');}else actions[name]?.();}
  const sec=e.target.closest('[data-shield]');if(sec){hud.priority=+sec.dataset.shield;notice(['舰艏','左舷','右舷','舰艉'][hud.priority]+'护盾优先充能');}
  const form=e.target.closest('[data-form]');if(form){hud.formation=form.dataset.form;all('[data-form]').forEach(b=>b.classList.toggle('selected',b===form));notice('编队切换 · '+form.textContent.trim());}
  const pw=e.target.closest('[data-pilot-weapon]');if(pw){let i=+pw.dataset.pilotWeapon;if(i===0)fireMain();else if(i===1)launchMissiles();else toggleBoost();}
 });
 all('[data-power]').forEach(el=>el.addEventListener('input',()=>setPower(+el.dataset.power,+el.value)));
 // World-space contact labels retain selection, but secondary drags reach the original flight controls.
 root.addEventListener('pointerdown',e=>{
  if((e.button!==1&&e.button!==2)||!e.target.closest('.u-contact, #u-tactical')||s.hudPaused||hud.help)return;
  e.preventDefault();e.stopPropagation();
  $('scene').dispatchEvent(new PointerEvent('pointerdown',{pointerId:e.pointerId,pointerType:e.pointerType,isPrimary:e.isPrimary,clientX:e.clientX,clientY:e.clientY,button:e.button,buttons:e.buttons,bubbles:true,cancelable:true}));
 },true);
 root.addEventListener('contextmenu',e=>{if(e.target.closest('.u-contact, #u-tactical'))e.preventDefault();});

 document.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.target instanceof HTMLInputElement){e.stopImmediatePropagation();return;}
  if(hud.help){e.stopImmediatePropagation();if(e.code==='Escape'||e.code==='KeyH'){e.preventDefault();help(false);}else if(e.code==='Tab'){e.preventDefault();$('u-help').querySelector('button').focus();}return;}
  let action=null;if(e.code==='Digit1')action=()=>switchTo(3);if(e.code==='Digit2')action=()=>switchTo(4);if(e.code==='Digit3'||e.code==='Digit4')action=()=>{};
  if(e.code==='KeyH')action=()=>help(true);if(e.code==='Escape'||e.code==='KeyP')action=()=>setPaused(!s.hudPaused);
  if(e.code==='F1')action=actions.focus;if(e.code==='F4')action=toggleHangar;if(e.code==='F5')action=emergency;
  if(e.code==='Tab')action=actions.target;
  if(e.code==='KeyL')action=toggleTurrets;if(e.code==='KeyR')action=launchMissiles;
  if(action){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)action();return;}
  if(s.hudPaused){e.preventDefault();e.stopImmediatePropagation();}
 },true);
 window.addEventListener('blur',()=>G.clearControls());
 function localProject(world){const a=axes(p),v=V.sub(world,p.pos);return {x:V.dot(v,a.right),y:V.dot(v,a.up),z:V.dot(v,a.forward)};}
 function formationPositions(){
  if(s.shipIndex===3){if(hud.formation==='screen')return [[-65,4,60],[70,5,65],[-145,12,155],[155,12,160]];return hud.formation==='line'?[[-10,3,45],[8,-4,72],[-30,9,145],[40,10,200]]:[[-39,3,60],[43,9,90],[-105,12,215],[155,22,270]];}
  return hud.formation==='line'?[[-16,2,90],[18,6,160],[-20,12,250],[20,18,360]]:hud.formation==='screen'?[[-130,5,110],[150,10,110],[-250,12,155],[270,20,155]]:[[-70,5,86],[95,12,127],[-165,15,198],[210,20,258]];
 }
 function updateFriends(dt){
  const a=axes(p),slots=formationPositions(),target=p.targets[p.targetIndex];
  for(let i=0;i<hud.friends.length;i++){const f=hud.friends[i];if(f.drone)continue;let goal;
   if(f.deployed&&target&&target.hp>0){let angle=p.elapsed*.15+i*1.57;goal=V.add(target.pos,[Math.cos(angle)*75,Math.sin(angle*.7)*25-5,Math.sin(angle)*60]);}
   else{let v=slots[i%4];goal=V.add(p.pos,V.add(V.scale(a.right,v[0]),V.add(V.scale(a.up,v[1]),V.scale(a.forward,v[2]))));}
   if(f.pos.every(v=>v===0))f.pos=[...goal];else f.pos=f.pos.map((v,j)=>mix(v,goal[j],1-Math.exp(-dt*1.6)));
   f.heading=-p.yaw-Math.PI/2;
  }
  if(!window.PreviewHUD&&hud.hangar&&s.shipIndex===4&&p.elapsed-hud.lastFireSupport>4.5*(15/hud.power[3])&&target?.hp>0){hud.lastFireSupport=p.elapsed;for(const f of hud.friends.filter(f=>f.deployed)){p.beams.push({start:[...f.pos],end:[...target.pos],width:.18,color:[.35,.75,1],age:0,life:.18});G.damageTarget(target,1.1);}}
 }
 function beforeFrame(dt){
  if(s.shipIndex!==hud.lastHull)hullChanged();
  if(s.mode!=='flight'||s.transition||s.hudPaused||document.hidden)return;
  hud.capacitor=clamp(hud.capacitor+(p.boostActive?-19:8)*dt,0,100);if(hud.capacitor<=1){p.boost=false;p.boostActive=false;}
  hud.heat=Math.max(0,hud.heat-dt*(s.shipIndex===3?17:13));
  if(p.mainShots>hud.gunShots){hud.heat=clamp(hud.heat+(p.mainShots-hud.gunShots)*(s.shipIndex===3?5.4:24),0,100);hud.hitFlash=.13;}
  hud.gunShots=p.mainShots;hud.turretShots=p.turretShots;hud.missileShots=p.missilesFired;
  if(hud.heat>=100)hud.overheated=true;if(hud.overheated&&hud.heat<40)hud.overheated=false;
  hud.emergencyCooldown=Math.max(0,hud.emergencyCooldown-dt);hud.hitFlash=Math.max(0,hud.hitFlash-dt);hud.damageFlash=Math.max(0,hud.damageFlash-dt);
  const regen=.3*(hud.power[1]/30);for(let i=0;i<4;i++){const mult=hud.priority===-1?1:(hud.priority===i?2.2:.6);hud.shields[i]=Math.min(100,hud.shields[i]+regen*mult*dt);}aggregateShield();
  for(let i=0;i<p.targets.length;i++){let t=p.targets[i];if(t.hp<=0&&!hud.seenDeaths.has(i)){hud.seenDeaths.add(i);if(t.kind===4)hud.capitalKills++;else hud.escortKills++;notice('目标失能 · '+t.name);}if(t.hp>0)hud.seenDeaths.delete(i);}
  updateFriends(dt);
 }
 function onDamage(q){
  const d=localProject(q.previous||q.pos);let idx=Math.abs(d.z)>Math.abs(d.x)?(d.z>=0?0:3):(d.x<0?1:2);hud.shields[idx]=Math.max(0,hud.shields[idx]-10);if(hud.shields[idx]<=0)p.hull=Math.max(1,p.hull-2);aggregateShield();hud.damageFlash=.7;p.shake=.16;
 }
 const enemyNodes=[],friendNodes=[];
 function rebuildContacts(){
  const layer=$('u-contact-layer');layer.replaceChildren();enemyNodes.length=0;friendNodes.length=0;
  p.targets.forEach((t,i)=>{const b=document.createElement('button');b.className='u-contact';b.setAttribute('aria-label','锁定 '+t.name);b.innerHTML='<span class="diamond"></span><span class="u-lock-label">LOCKED</span><span class="u-contact-name"><b></b><small></small></span><span class="u-contact-hp"><i></i></span>';b.querySelector('b').textContent=t.hudName||t.name;b.onclick=()=>{if(!s.hudPaused){G.selectTarget(i);notice('锁定目标 · '+t.name);}};layer.append(b);enemyNodes.push(b);});
  hud.friends.forEach((f,i)=>{const b=document.createElement('div');b.className='u-contact friendly';b.innerHTML='<span class="diamond"></span><span class="u-contact-name"><b></b><small></small></span>';b.querySelector('b').textContent=f.name;layer.append(b);friendNodes.push(b);});
 }
 function stageProjection(pos){const r=G.renderer.project(pos),sc=Math.min(innerWidth/1600,innerHeight/900);return{x:(r.x-(innerWidth-1600*sc)/2)/sc,y:(r.y-(innerHeight-900*sc)/2)/sc,visible:r.visible&&r.z<1&&r.z>-1,w:r.w};}
 function updateContacts(){
  if(enemyNodes.length!==p.targets.length||friendNodes.length!==hud.friends.length)rebuildContacts();
  const pilot=s.shipIndex===3,bounds=pilot?[176,1398,230,612]:[350,1250,146,625];
  p.targets.forEach((t,i)=>{
   const b=enemyNodes[i],a=stageProjection(t.pos),chosen=i===p.targetIndex,inside=a.visible&&a.x>bounds[0]&&a.x<bounds[1]&&a.y>bounds[2]&&a.y<bounds[3];
   b.classList.toggle('target',chosen);b.classList.toggle('offscreen',chosen&&!inside);b.style.display=t.hp>0&&(inside||chosen)?'flex':'none';
   let x=a.x,y=a.y;if(!inside){if(a.w<0){x=1600-x;y=900-y;}x=clamp(x,bounds[0]+10,bounds[1]-25);y=clamp(y,bounds[2]+20,bounds[3]-25);b.style.rotate=(Math.atan2(y-440,x-800)*180/Math.PI)+'deg';}else b.style.rotate='0deg';
   b.style.left=x+'px';b.style.top=y+'px';b.querySelector('small').textContent=(V.length(V.sub(t.pos,p.pos))*.008).toFixed(2)+' km';b.querySelector('.u-contact-hp i').style.width=t.hp+'%';b.querySelector('.u-lock-label').textContent=chosen&&p.boresightError<3?'LOCKED / FIRE':'TRACKING';
  });
  hud.friends.forEach((f,i)=>{const b=friendNodes[i],a=stageProjection(f.pos);b.style.display=a.visible&&a.x>bounds[0]&&a.x<bounds[1]&&a.y>bounds[2]&&a.y<bounds[3]?'flex':'none';b.style.left=a.x+'px';b.style.top=a.y+'px';b.querySelector('small').textContent=(V.length(V.sub(f.pos,p.pos))*.008).toFixed(2)+' km';});
 }
 function drawRadar(canvas,range){
  if(!canvas)return;const c=canvas.getContext('2d'),w=canvas.width/2,h=canvas.height/2,cx=w/2,cy=h/2,r=Math.min(w,h)*.44;
  c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,w,h);
  const gr=c.createRadialGradient(cx,cy,0,cx,cy,r);gr.addColorStop(0,'#0a29493d');gr.addColorStop(1,'#020a1322');c.fillStyle=gr;c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.fill();
  c.strokeStyle='#3e7caa80';c.lineWidth=.6;for(let i=1;i<=4;i++){c.beginPath();c.arc(cx,cy,r*i/4,0,Math.PI*2);c.stroke();}
  c.strokeStyle='#38678c88';for(let a=0;a<Math.PI*2;a+=Math.PI/4){c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);c.stroke();}
  c.strokeStyle='#68b1de77';for(let a=0;a<Math.PI*2;a+=Math.PI/36){c.beginPath();c.moveTo(cx+Math.cos(a)*(r+2),cy+Math.sin(a)*(r+2));c.lineTo(cx+Math.cos(a)*(r+4),cy+Math.sin(a)*(r+4));c.stroke();}
  const scan=p.elapsed*.28;c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,r,scan,scan+.4);c.closePath();c.fillStyle='#36b8ff0c';c.fill();
  c.strokeStyle='#4aabe862';c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(scan+.4)*r,cy+Math.sin(scan+.4)*r);c.stroke();
  c.fillStyle='#77b6d8';c.font='8px Consolas,monospace';c.textAlign='center';c.fillText('N',cx,cy-r-8);
  const screen=pos=>{const v=localProject(pos),d=Math.hypot(v.x,v.z),k=Math.min(r/(d||1),r/range);return{x:cx+v.x*k,y:cy-v.z*k,d};};
  const hits=[];const station=screen([700,105,-1390]);c.strokeStyle='#e9bd73';c.save();c.translate(station.x,station.y);c.rotate(Math.PI/4);c.strokeRect(-3,-3,6,6);c.restore();
  for(let i=0;i<p.targets.length;i++){let t=p.targets[i];if(t.hp<=0)continue;let q=screen(t.pos),selected=i===p.targetIndex;c.save();c.translate(q.x,q.y);c.fillStyle=selected?'#ff8c76':'#ff635c';c.strokeStyle='#ff958477';c.beginPath();c.moveTo(0,5);c.lineTo(-4,-4);c.lineTo(0,-1);c.lineTo(4,-4);c.closePath();c.fill();if(selected){c.strokeRect(-7,-7,14,14);c.shadowColor='#ff6a66';c.shadowBlur=9;c.fillRect(-1,-1,2,2);}c.restore();hits.push({...q,index:i});}
  for(let f of hud.friends){let q=screen(f.pos);c.fillStyle=f.deployed?'#a4e9ff':'#64bffc';c.beginPath();c.moveTo(q.x,q.y-4);c.lineTo(q.x-3,q.y+3);c.lineTo(q.x,q.y+1);c.lineTo(q.x+3,q.y+3);c.closePath();c.fill();}
  c.fillStyle='#caedff';c.shadowBlur=12;c.shadowColor='#53adfa';c.beginPath();c.moveTo(cx,cy-8);c.lineTo(cx-5,cy+5);c.lineTo(cx,cy+2);c.lineTo(cx+5,cy+5);c.closePath();c.fill();c.shadowBlur=0;
  hud.radarTargets.set(canvas.id,hits);
 }
 const mapOwnImg=new Image();mapOwnImg.src=root.querySelector('.u-model-top').src;
 function drawTactical(){
  const canvas=$('u-tactical'),c=canvas.getContext('2d'),w=864,h=284;c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,w,h);const cx=432,cy=205;
  const glow=c.createRadialGradient(cx,cy,20,cx,cy,390);glow.addColorStop(0,'#145ea123');glow.addColorStop(1,'#07427602');c.fillStyle=glow;c.fillRect(0,0,w,h);
  c.strokeStyle='#4a94d04b';c.lineWidth=.6;for(let x=-700;x<=700;x+=75){c.beginPath();c.moveTo(cx+x*.36,25);c.lineTo(cx+x*.85,280);c.stroke();}for(let y=30;y<284;y+=24){c.beginPath();c.moveTo(65-(y/10),y);c.lineTo(799+y/10,y);c.stroke();}
  for(let r=1;r<=4;r++){c.beginPath();c.ellipse(cx,cy,r*105,r*32,0,0,Math.PI*2);c.strokeStyle=r===3?'#75c8fa8a':'#58a4db66';c.stroke();}
  c.strokeStyle='#73c5f777';c.beginPath();c.moveTo(cx,26);c.lineTo(cx,282);c.moveTo(40,cy);c.lineTo(824,cy);c.stroke();
  const toMap=pos=>{let v=localProject(pos);return{x:cx+v.x*.58,y:cy-v.z*.235-v.y*.18};};
  const hits=[];c.font='10px Consolas,monospace';
  for(let i=0;i<p.targets.length;i++){let t=p.targets[i];if(t.hp<=0)continue;const a=toMap(t.pos);if(a.x<35||a.x>w-35||a.y<20||a.y>h-20)continue;let selected=i===p.targetIndex;
   c.save();c.translate(a.x,a.y);c.strokeStyle=selected?'#ff9783':'#e96761';c.fillStyle='#db3f412d';c.lineWidth=1;c.beginPath();c.moveTo(-16,3);c.lineTo(-5,-5);c.lineTo(14,-5);c.lineTo(20,0);c.lineTo(9,7);c.lineTo(-10,7);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(-3,-5);c.lineTo(1,-10);c.lineTo(6,-10);c.lineTo(9,-5);c.stroke();
   if(selected){c.beginPath();c.ellipse(0,2,29,13,0,0,Math.PI*2);c.strokeStyle='#ff746b90';c.stroke();}c.fillStyle='#ff857b';c.textAlign='left';c.fillText(t.hudName||t.name,25,-8);c.fillStyle='#be605c';c.font='8px Consolas,monospace';c.fillText((V.length(V.sub(t.pos,p.pos))*.008).toFixed(1)+' km',25,5);c.restore();hits.push({...a,index:i});
  }
  for(const f of hud.friends){const a=toMap(f.pos);if(a.x<20||a.x>w-20||a.y<20||a.y>h-15)continue;c.strokeStyle='#6ec3fc';c.fillStyle='#3289d22b';c.beginPath();c.moveTo(a.x,a.y-10);c.lineTo(a.x-10,a.y+7);c.lineTo(a.x,a.y+3);c.lineTo(a.x+10,a.y+7);c.closePath();c.fill();c.stroke();c.fillStyle='#8bd1ff';c.font='9px Consolas,monospace';c.textAlign='left';c.fillText(f.name,a.x+14,a.y-1);c.fillStyle='#5087aa';c.fillText((V.length(V.sub(f.pos,p.pos))*.008).toFixed(1)+' km',a.x+14,a.y+10);}
  c.beginPath();c.ellipse(cx,cy+7,43,16,0,0,Math.PI*2);c.strokeStyle='#8dd2ff';c.stroke();if(mapOwnImg.complete)c.drawImage(mapOwnImg,cx-15,cy-31,30,52);
  c.fillStyle='#8cd8ff';c.beginPath();c.moveTo(cx,cy-62);c.lineTo(cx-4,cy-50);c.lineTo(cx+4,cy-50);c.closePath();c.fill();c.strokeStyle='#8dd2ffb0';c.beginPath();c.moveTo(cx,cy-52);c.lineTo(cx,cy-30);c.stroke();c.textAlign='center';c.font='8px Consolas,monospace';c.fillStyle='#84c2e6';c.fillText('VALIANT',cx,cy+41);
  hud.targetsOnMap=hits;
 }
 function canvasPick(e,canvas,hits){const rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*canvas.width/2,y=(e.clientY-rect.top)/rect.height*canvas.height/2;let best=null,dist=22;for(const t of hits||[]){let d=Math.hypot(x-t.x,y-t.y);if(d<dist){dist=d;best=t;}}if(best){G.selectTarget(best.index);hud.debug.mapHits++;notice('战术锁定 · '+p.targets[best.index].name);}}
 for(const id of ['u-cap-radar','u-pilot-radar','u-pilot-mini'])$(id).addEventListener('click',e=>canvasPick(e,$(id),hud.radarTargets.get(id)));
 $('u-tactical').addEventListener('click',e=>canvasPick(e,$('u-tactical'),hud.targetsOnMap));
 function updatePanels(){
  const cap=s.shipIndex===4,c=p.profile,target=p.targets[p.targetIndex];if(!c||!target)return;
  const dist=V.length(V.sub(target.pos,p.pos))*.008,angle=p.boresightError||0;
  root.classList.toggle('external',p.external);text('u-session',simTime());
  text('u-main-state',p.charging?Math.round(p.charge*100)+'%':p.gunCooldown>0?p.gunCooldown.toFixed(1)+'s':'READY');
  fill('u-main-state-bar',p.charging?p.charge*100:(1-p.gunCooldown/c.mainCooldown)*100);
  text('u-missile-state',p.missileCooldown>0?p.missileCooldown.toFixed(1)+'s':p.missileStock+'/'+c.missileCapacity);fill('u-missile-state-bar',p.missileStock/c.missileCapacity*100);
  text('u-pd-state',{auto:'AUTO',manual:'MANUAL',hold:'HOLD'}[p.turretMode]);fill('u-pd-state-bar',p.turretMode==='hold'?0:p.turrets.filter(t=>t.aligned).length/Math.max(1,p.turrets.length)*100);
  text('u-hangar-state',hud.hangar?'4 IN FLIGHT':'STANDBY');fill('u-hangar-state-bar',hud.hangar?100:0);
  all('[data-shield]').forEach(el=>el.classList.toggle('selected',+el.dataset.shield===hud.priority));
  for(let i=0;i<4;i++){text('u-sector-'+i,Math.round(hud.shields[i])+'%');$('u-sharc-'+i).style.opacity=String(.2+hud.shields[i]/100*.8);$('u-sharc-'+i).style.stroke=hud.shields[i]<25?'#f5846e':hud.priority===i?'#c0efff':'#62c8f8';}
  text('u-shield-priority',hud.priority===-1?'四区均衡充能':['舰艏','左舷','右舷','舰艉'][hud.priority]+'优先充能');
  text('u-cap-hull',Math.round(p.hull)+'%');fill('u-cap-hull-bar',p.hull);text('u-hull-status',p.hull>70?'STABLE':'DAMAGED');text('u-critical-sections',p.hull>95?'无受损':'损伤受控');
  text('u-target-name',target.hudName||target.name);text('u-target-code',target.code);text('u-target-range',dist.toFixed(2)+' km');fill('u-target-hp',target.hp);text('u-target-hp-text',Math.round(target.hp)+'%');text('u-target-speed',Math.round(V.length(V.sub(target.velocity||[0,0,0],p.velocity||[0,0,0]))*8)+' m/s');text('u-target-angle',angle.toFixed(1)+'°');
  text('u-obj-kill',Math.min(1,hud.capitalKills)+' / 1');text('u-obj-escorts',Math.min(3,hud.escortKills)+' / 3');text('u-obj-hangar',hud.hangar?'已出动':'待命');text('u-obj-hull',Math.round(p.hull)+'%');
  $('u-obj-0').classList.toggle('done',hud.capitalKills>=1);$('u-obj-1').classList.toggle('done',hud.escortKills>=3);$('u-obj-2').classList.toggle('done',hud.hangar);
  text('u-cap-speed',Math.round(p.speed));text('u-cap-throttle-txt',Math.round(p.throttle)+'%');fill('u-cap-throttle',p.throttle);text('u-cap-engine-mode',p.boostActive?'AFTERBURNER':p.ai?'AUTOPILOT':'MANUAL HELM');text('u-cap-viewlabel',p.external?'EXTERNAL TRACKING':'BRIDGE VIEW');
  all('[data-u-action^="drive-"]').forEach(b=>b.classList.toggle('selected',Math.abs(+b.dataset.uAction.slice(6)-p.throttle)<3));
  text('u-map-coord',p.targets.filter(t=>t.hp>0).length+' CONTACTS · '+hud.friends.length+' ESCORTS');text('u-threat-text',p.shield<35?'CRITICAL':p.targets.filter(t=>t.hp>0).length>=3?'HIGH':'MODERATE');
  text('u-turret-toggle','L / 炮塔'+({auto:'自动',hold:'停火',manual:'手动'}[p.turretMode]||'自动'));
  text('u-speed',Math.round(p.speed));text('u-thr','THR '+Math.round(p.throttle)+'%');$('u-thr-bar').style.height=p.throttle+'%';text('u-heading',String(Math.round(((p.yaw*180/Math.PI)%360+360)%360)).padStart(3,'0'));
  text('u-pilot-shield',Math.round(p.shield)+'%');text('u-pilot-armor',Math.round(p.hull)+'%');fill('u-pilot-shield-bar',p.shield);fill('u-pilot-armor-bar',p.hull);
  text('u-lead-info','LEAD '+angle.toFixed(1)+'° / '+dist.toFixed(2)+' km');text('u-target-lock',target.hp<=0?'TARGET DESTROYED':angle<3?'LOCKED / WEAPONS FREE':'TRACKING / ALIGN TARGET');
  const hot=p.projectiles.some(q=>q.hostile&&V.length(V.sub(q.pos,p.pos))<330);$('u-incoming').classList.toggle('on',hot||hud.overheated);$('u-incoming').querySelector('span').textContent=hud.overheated?'WEAPON OVERHEAT / 武器过热':'INCOMING FIRE / 来袭火力';
  text('u-pilot-missiles',String(p.missileStock).padStart(2,'0'));text('u-pilot-weapon-1',String(p.missileStock).padStart(2,'0'));all('.u-missile-icon').forEach((el,i)=>el.classList.toggle('used',i>=p.missileStock));
  text('u-pilot-weapon-0',hud.overheated?'HOT':p.gunCooldown>0?'FIRING':'∞');text('u-pilot-weapon-2',Math.round(hud.capacitor)+'%');$('u-boost-fill').style.height=hud.capacitor+'%';text('u-boost-text',Math.round(hud.capacitor)+'%');text('u-weapon-mode',hud.overheated?'武器冷却中':p.gunCooldown>0?'主炮击发':'主武器已就绪');
  text('u-pilot-auto',p.ai?'AUTOPILOT / 自动驾驶':'MANUAL / 手动控制');$('u-pilot-auto').classList.toggle('selected',p.ai);text('u-pilot-view',p.external?'CHASE / 外部视角':'COCKPIT / 驾驶舱');
  text('u-pilot-kills',Math.min(3,hud.escortKills)+' / 3');text('u-pilot-capital',Math.min(1,hud.capitalKills)+' / 1');
  const vals=[p.throttle,100-hud.heat,hud.capacitor,100-hud.heat];vals.forEach((v,i)=>{fill('u-sys-'+i,v);text('u-sys-val-'+i,Math.round(v)+'%');});text('u-heat-value',Math.round(hud.heat)+'%');fill('u-heat-bar',hud.heat);
  $('u-flash').classList.toggle('show',hud.damageFlash>0);$('u-hit').classList.toggle('show',hud.hitFlash>0&&p.boresightError<3);
  $('u-emergency').disabled=hud.emergencyCooldown>0||hud.capacitor<60;$('u-emergency').title=hud.emergencyCooldown>0?'冷却 '+hud.emergencyCooldown.toFixed(1)+' s':'消耗 60% 储能，四区护盾恢复';
  if(hot)text('u-wingman-caption','注意来袭火力！\nHostile fire inbound.');else if(p.ai)text('u-wingman-caption','自动驾驶已接管。\nAutopilot online.');else text('u-wingman-caption','僚机已就位。\nCovering your six.');
 }
 function drawWorld(renderer,state,time){
  const gl=renderer.gl;
  for(const f of hud.friends){let model=M.compose(f.pos,[.035,f.drone?f.heading:-p.yaw-Math.PI/2,-Math.sin(p.elapsed*.6)*.035],[f.scale,f.scale,f.scale]);renderer.drawVessel(f.kind,model,{light:[-.3,.7,.8],exposure:1});}
  // Projected weapons exchange is decorative; projectile damage remains in the core simulation.
  const lines=[],glows=[];
  for(let i=0;i<p.targets.length;i++){
   const t=p.targets[i];if(t.hp<=0)continue;const f=hud.friends[i%hud.friends.length];if(!f)continue;
   for(let j=0;j<2;j++){const phase=(p.elapsed*(.14+j*.04)+i*.137+j*.45)%1,reverse=j===1,from=reverse?f.pos:t.pos,to=reverse?t.pos:f.pos,v=V.sub(to,from),unit=V.norm(v),a=V.add(from,V.scale(v,phase)),b=V.add(a,V.scale(unit,reverse?-12:-17)),color=reverse?[.34,.68,.98]:[.98,.26,.16];lines.push(...a,...color,1,...b,...color,1);glows.push(...a,...color,2.6);}
   const model=M.compose(t.pos,[.035,t.heading||.2,-.045],[t.scale,t.scale,t.scale]);const anchors=LAYOUTS[t.kind]?.engines||[];for(const anchor of anchors.slice(0,3)){const pos=M.transform(model,anchor);glows.push(...pos,1,.18,.13,t.kind===3?4:6);}
  }
  gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);if(lines.length)renderer.dynamicFlat(lines,false,.9);if(glows.length)renderer.dynamicFlat(glows,true,.9);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
 }
 function afterFrame(now){
  if(s.mode!=='flight')return;hud.debug.frames++;updateContacts();
  if(now-hud.lastPanelUpdate>90){hud.lastPanelUpdate=now;updatePanels();if(s.shipIndex===4){drawRadar($('u-cap-radar'),750);drawTactical();}else{drawRadar($('u-pilot-mini'),750);drawRadar($('u-pilot-radar'),375);}}
  if(now>hud.noticeUntil)$('u-status').classList.remove('show');
 }
 window.CommandHUD={hud,beforeFrame,afterFrame,drawWorld,onDamage,isOverheated:()=>hud.overheated||hud.heat>=100,boostAllowed:()=>hud.capacitor>1,switchTo,reset,actions,setPower,setPaused,help,selectTarget:i=>G.selectTarget(i)};
 G.configureFlight(4,true);G.screenVisible('flight');hullChanged();updateFriends(100);updatePowerUI();updatePanels();rebuildContacts();drawTactical();drawRadar($('u-cap-radar'),750);document.documentElement.dataset.commandReady='true';
 all('.u-weapon>kbd').forEach((el,i)=>el.textContent=['SPC','R','L','F4'][i]);all('.u-pilot-weapon>kbd').forEach((el,i)=>el.textContent=['LMB','R','⇧'][i]);
 log('编队就位 · THETA STATION 控制区');log('舰长链路接入，所有系统就绪');
})();
