
/*
 * GALACTIC IMPERIUM — capital-ship combat interface prototype
 * Edit SHIPS for displayed values, CONFIG for animation and movement settings.
 * All game data is deliberately local to this tab. No accounts, services or storage.
 */
'use strict';
(() => {
  const {Renderer,V,M,clamp,mix,seeded,LAYOUTS,axes,shipMatrix,turretTransforms}=GalaxyRender;
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const CONFIG={transitionMs:1550,shipSwitchMs:560,maxSpeed:214,mainCooldown:.34,missileCooldown:4,constructionSeconds:5,researchSeconds:4};
  const ARCHIVE_DISTANCES=[23.8,28.3,20.2,23,35,20.5];
  const isFighter=index=>index===3;
  const isAntimatter=index=>index===5;
  const SHIPS=[
    {name:'驱逐舰',en:'DESTROYER',code:'D-06',serial:'06',count:6,stats:[11000,500,2000,5000,2000,1000],levels:[6,4,8]},
    {name:'巡洋舰',en:'CRUISER',code:'C-03',serial:'03',count:3,stats:[24000,1400,4200,3600,4500,1800],levels:[8,6,9]},
    {name:'护卫舰',en:'FRIGATE',code:'F-12',serial:'12',count:12,stats:[4500,300,950,8200,800,450],levels:[4,3,6]},
    {name:'重装战机',en:'HEAVY FIGHTER',code:'HF-01',serial:'01',count:24,stats:[900,220,760,15000,24,96],levels:[6,4,2]},
    {name:'重型战列舰',en:'BATTLESHIP',code:'BB-01',serial:'01',count:1,stats:[68000,9600,18500,2200,14000,4800],levels:[10,9,10]},
    {name:'反物质自行导弹',en:'ANTIMATTER LANCE',code:'AM-01',serial:'01',count:2,stats:[1600,40,120000,26000,1,9999],levels:[10,10,10]}
  ];
  const STAT_LABELS=['护甲','护盾','攻击','基础速度','货舱容量','燃料消耗'];
  const WEAPONS=[['同轴主炮','磁轨科技','SPINAL RAILGUN'],['导弹发射阵列','制导科技','MISSILE ARRAY'],['旋转炮塔','火控科技','TRACKING TURRETS']];
  const LOCATIONS=[{name:'母星',coords:'1:16:3',orbit:'母星近地轨道',en:'HOMEWORLD',description:'舰队主港。为当前舰船提供维护、补给和虚拟战报演练。'},{name:'前哨',coords:'1:16:4',orbit:'前哨近地轨道',en:'OUTPOST',description:'外层轨道前哨。可设为当前演练区域，进行舰船系统测试。'}];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state={mode:'archive',shipIndex:3,transition:null,shipSwitch:null,wireframe:false,autoRotate:false,highlight:-10,activeTab:'fleet',location:0,helpOpen:false,sound:false,logs:[],job:null,research:null,frames:0,
    orbit:{yaw:.82,pitch:.5,distance:23,targetYaw:.82,targetPitch:.5,targetDistance:23},
    flight:{pos:[0,0,0],yaw:0,pitch:0,roll:0,throttle:60,speed:128,boost:false,ai:false,external:false,shield:82,hull:96,gunCooldown:0,missileCooldown:0,targetIndex:0,targets:[],projectiles:[],particles:[],elapsed:0,enemyAttack:7,kills:0}
  };
  let renderer=null,lastTime=0,hudAccumulator=0,toastTimer,noticeTimer,hitTimer,damageTimer,audio=null,lastFocused=null,activePointer=null,mouseDown=false;
  const keys=new Set(),rnd=seeded(4982);
  const fmt=n=>Math.round(n).toLocaleString('en-US');
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const forward=()=>{let p=state.flight;return[Math.sin(p.yaw)*Math.cos(p.pitch),Math.sin(p.pitch),-Math.cos(p.yaw)*Math.cos(p.pitch)]};


  const COMBAT = [
    {role:'驱逐舰',className:'苍隼级 / DD-06',length:'224 m',maxSpeed:135,turnRate:.3,turnResponse:3.1,accel:.48,chargeTime:.8,mainCooldown:3.8,mainDamage:52,beamWidth:.24,salvo:4,missileCooldown:6,missileCapacity:24,missileDamage:9,turretDamage:.42,turretCooldown:1.0,capital:true},
    {role:'巡洋舰',className:'远征级 / CA-03',length:'320 m',maxSpeed:98,turnRate:.22,turnResponse:2.6,accel:.35,chargeTime:.95,mainCooldown:4.6,mainDamage:65,beamWidth:.34,salvo:6,missileCooldown:7,missileCapacity:36,missileDamage:9,turretDamage:.34,turretCooldown:1.1,capital:true},
    {role:'护卫舰',className:'游隼级 / FF-12',length:'96 m',maxSpeed:215,turnRate:.64,turnResponse:4,accel:.85,chargeTime:0,mainCooldown:.22,mainDamage:5,beamWidth:.1,salvo:2,missileCooldown:4,missileCapacity:12,missileDamage:16,turretDamage:0,turretCooldown:1,capital:false},
    {role:'重装战机',className:'HF-01 / HEAVY FIGHTER',length:'38 m',maxSpeed:345,turnRate:1.18,turnResponse:7.2,accel:1.45,chargeTime:0,mainCooldown:.15,mainDamage:4.2,beamWidth:.085,salvo:2,missileCooldown:3.6,missileCapacity:8,missileDamage:19,turretDamage:0,turretCooldown:1,capital:false},
    {role:'重型战列舰',className:'玄武级 / BB-01',length:'560 m',maxSpeed:72,turnRate:.145,turnResponse:1.8,accel:.23,chargeTime:1.15,mainCooldown:5.4,mainDamage:82,beamWidth:.58,salvo:8,missileCooldown:8,missileCapacity:48,missileDamage:7,turretDamage:.3,turretCooldown:1.25,capital:true},
    {role:'反物质自行导弹',className:'AM-01 / ANTIMATTER LANCE',length:'52 m',maxSpeed:460,turnRate:1.6,turnResponse:8.4,accel:2.1,chargeTime:0,mainCooldown:1.6,mainDamage:14,beamWidth:.14,salvo:1,missileCooldown:8.5,missileCapacity:1,missileDamage:999,turretDamage:0,turretCooldown:1,capital:false,antimatter:true}
  ];
  const shortAngle = a=>Math.atan2(Math.sin(a),Math.cos(a));
  const mixExp = (a,b,rate,dt)=>mix(a,b,1-Math.exp(-rate*dt));
  let mouseAim={x:innerWidth*.5,y:innerHeight*.47};
  function selectedTarget(){return state.flight.targets[state.flight.targetIndex]}
  function configureFlight(index,reset=false){
    const p=state.flight,c=COMBAT[index],l=LAYOUTS[index];state.shipIndex=index;
    const keepView=reset?(c.capital||isAntimatter(index)):(p.external);
    Object.assign(p,{profile:c,external:keepView,cameraBlend:keepView?1:0,cameraVelocity:0,cameraZoom:1,orbitYaw:0,orbitPitch:0,
      yawTarget:p.yaw,pitchTarget:p.pitch,yawVelocity:0,pitchVelocity:0,velocity:[0,0,0],align:false,
      charging:false,charge:0,gunCooldown:0,missileCooldown:0,missileStock:c.missileCapacity,restock:0,
      salvoQueue:[],beams:[],projectiles:[],particles:[],shockwaves:[],shake:0,boresightError:0,turretMode:'auto',turretHeat:0,
      turretShots:0,mainShots:0,missilesFired:0,boost:false,boostActive:false,hidden:false,respawnDelay:0});
    p.turrets=l.mounts.map((mount,i)=>({mount:[...mount],yaw:0,pitch:.05,recoil:0,cooldown:.3+i*.15,aligned:false,inArc:false,index:i}));
    if(reset){p.pos=[0,0,0];p.yaw=p.pitch=p.roll=p.yawTarget=p.pitchTarget=0;p.throttle=c.capital?26:(isAntimatter(index)?100:40);p.speed=p.throttle*c.maxSpeed/100;p.shield=100;p.hull=100;p.elapsed=0;p.enemyAttack=8;p.kills=0;p.ai=isAntimatter(index);createTargets();}
    if(isAntimatter(index)){p.external=true;p.cameraBlend=1;p.ai=true;p.align=true;p.boost=true;respawnAntimatterMissile(true);}    
    p.throttle=clamp(p.throttle,0,100);p.speed=Math.min(p.speed,c.maxSpeed);p.velocity=V.scale(forward(),p.speed*.125);
    renderShipData();syncCombatUI();updateHUD();
  }
  function syncCombatUI(){
    const p=state.flight,c=p.profile;if(!c)return;
    const antimatter=isAntimatter(state.shipIndex);
    document.body.classList.toggle('is-capital',c.capital);document.body.classList.toggle('is-fighter',!c.capital);
    document.body.classList.toggle('is-external',p.external);
    document.body.classList.toggle('is-antimatter',antimatter);
    $('#combat-ship-name').textContent=c.role;$('#combat-ship-code').textContent=c.className;
    $('.combat-identity .eyebrow').textContent=antimatter?'弹载控制链路':'舰船控制';
    $('#ai-indicator').innerHTML=antimatter?'<span class="status-dot"></span>自动制导中<span>无人驾驶 · 自动追猎</span>':'<span class="status-dot"></span>AI 驾驶中<span>G 取回控制</span>';
    $('#combat-length').textContent=c.length;$('#weapon-primary-name').textContent=c.capital?'同轴主炮':(antimatter?'湮灭脉冲':(isFighter(state.shipIndex)?'固定机炮':'双联机炮'));
    $('#weapon-missile-name').textContent=c.capital?'导弹阵列':(antimatter?'反物质弹头':'追踪导弹');
    $('#loadout-caption').textContent=c.capital?`${LAYOUTS[state.shipIndex].mounts.length} 座双联炮塔 · ${c.salvo} 联装垂发`:(antimatter?'自导阵列 · 奇点约束环 · 单发终结载荷':(isFighter(state.shipIndex)?'左舷固定机炮 · 双联追踪导弹':'双联机炮 · 双联追踪导弹'));
    $('#system-turret').hidden=!c.capital;$('#turret-controls').hidden=!c.capital;$('#director').hidden=!c.capital;
    $('#view-label').textContent=antimatter?'仅外部追踪':(p.external?(c.capital?'进入舰桥':'进入驾驶舱'):'外部追踪');
    $('#camera-mode').textContent=antimatter?'远程追踪':(p.external?'外部追踪':(c.capital?'舰桥视角':'驾驶舱'));
    $('#flight-input-copy').textContent=c.capital?'右键拖动转向　W / S 油门　Space 同轴主炮　R 导弹齐射':(antimatter?'全自动突防 · Space 释放湮灭脉冲　R 手动引爆反物质弹头':'右键拖动转向　W / S 油门　左键 / Space 机炮　R 导弹');
    $$('[data-combat-ship]').forEach(b=>{let active=+b.dataset.combatShip===state.shipIndex;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    $$('[data-turret-mode]').forEach(b=>{let active=b.dataset.turretMode===p.turretMode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    $('#toggle-ai').setAttribute('aria-pressed',String(p.ai));$('#ai-label').textContent=antimatter?'自动制导':(p.ai?'取回控制':'自动驾驶');$('#ai-indicator').classList.toggle('visible',p.ai);
    $('#align-target').classList.toggle('active',p.align);$('#align-label').textContent=antimatter?'自动追猎':(p.align?'正在对准':'舰艏对准');
    renderContacts();
  }
  function renderContacts(){
    $('#contact-list').innerHTML=state.flight.targets.map((t,i)=>`<button class="contact-row ${i===state.flight.targetIndex?'active':''}" data-contact="${i}"><span class="contact-diamond">◇</span><span><strong>${t.name}</strong><small>${t.code}</small></span><span class="contact-distance" id="contact-dist-${i}">—</span><i class="contact-health" id="contact-hp-${i}"></i></button>`).join('');
    $$('[data-contact]').forEach(b=>b.addEventListener('click',()=>selectTarget(+b.dataset.contact)));
  }
  function selectTarget(index){
    let p=state.flight;p.targetIndex=index;$$('[data-contact]').forEach(b=>b.classList.toggle('active',+b.dataset.contact===index));
    notice('锁定 '+selectedTarget().name+' · X 舰艏对准');tone();
  }
  function switchCombatHull(index){
    if(state.transition||state.helpOpen||state.mode!=='flight'||state.shipIndex===index)return;
    state.transition={to:'flight',start:performance.now(),progress:0,swapped:false,combatIndex:index,duration:1000};
    $('#flight').classList.add('leaving');$('#transition-text').textContent='接管'+COMBAT[index].role;$('#transition-sub').textContent=SHIPS[index].en+' / CONTROL TRANSFER';
    $('#transition-curtain').classList.add('active');$('#transition-curtain').style.pointerEvents='auto';keys.clear();mouseDown=false;tone('enter');
  }
  function setTurretMode(mode){
    const p=state.flight;if(!p.profile.capital)return;p.turretMode=mode;syncCombatUI();
    notice(mode==='auto'?'炮塔自动追踪当前目标':mode==='manual'?'移动鼠标瞄准 · 按住左键开炮':'炮塔已停火');tone();
  }
  function cycleTurretMode(){const modes=['auto','manual','hold'];setTurretMode(modes[(modes.indexOf(state.flight.turretMode)+1)%3]);}
  function alignTarget(){const p=state.flight;if(isAntimatter(state.shipIndex)){notice('反物质导弹自动追踪已锁定目标');return;}p.align=!p.align;if(p.align)p.ai=false;syncCombatUI();notice(p.align?'调整舰艏航向 · 仍可切换视角与操作武器':'取消舰艏对准');}

  function tone(type='tick'){
    if(!state.sound)return;
    try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.connect(gain);gain.connect(audio.destination);let now=audio.currentTime;let f=type==='spinal'?52:type==='charge'?110:type==='fire'?145:type==='missile'?240:type==='enter'?390:type==='hit'?95:780;let duration=type==='spinal'?.52:type==='charge'?.6:type==='enter'?.26:type==='missile'?.18:.065;osc.type=type==='fire'?'triangle':'sine';osc.frequency.setValueAtTime(f,now);osc.frequency.exponentialRampToValueAtTime(type==='enter'?780:Math.max(50,f*.58),now+duration);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(type==='fire'?.035:.024,now+.007);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.start(now);osc.stop(now+duration+.01)}catch(e){state.sound=false;updateSoundButtons()}
  }
  function toast(message){$('#toast-text').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2300)}
  function notice(message){$('#flight-notice').textContent=message;$('#flight-notice').classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#flight-notice').classList.remove('show'),2100)}
  function addLog(message){state.logs.unshift({time:new Date().toLocaleTimeString('zh-CN',{hour12:false}),message});state.logs=state.logs.slice(0,30);$('#message-dot').classList.toggle('visible',state.activeTab!=='messages');if(state.activeTab==='messages')renderSheet()}
  function updateSoundButtons(){$$('.sound-toggle').forEach(b=>{b.textContent='音效 '+(state.sound?'开':'关');b.setAttribute('aria-label',state.sound?'关闭音效':'开启音效')})}
  function toggleSound(){state.sound=!state.sound;updateSoundButtons();tone();toast(state.sound?'界面音效已开启':'界面音效已关闭')}

  function renderShipData(){
    let ship=SHIPS[state.shipIndex];
    const displayWeapons=isAntimatter(state.shipIndex)?[['反物质弹头','湮灭科技','ANTIMATTER WARHEAD'],['自导阵列','制导科技','AUTONOMOUS SEEKER'],['奇点约束环','约束科技','SINGULARITY CONTAINMENT']]:isFighter(state.shipIndex)?[['固定机炮','机炮科技','FIXED AUTOCANNON'],['追踪导弹','制导科技','HOMING MISSILES']]:WEAPONS;
    $('#ship-name').textContent=ship.name;$('#ship-code').textContent=`${ship.en} / ${ship.serial}`;$('#model-class').textContent=`DEEP SPACE / ${ship.code}`;
    $('#deploy span').textContent=isAntimatter(state.shipIndex)?'接入控制链路':'进入驾驶舱';
    $('#ship-stats').innerHTML=STAT_LABELS.map((label,i)=>`<div><dt>${label}</dt><dd>${fmt(ship.stats[i])}</dd></div>`).join('');
    $('#weapon-list').innerHTML=displayWeapons.map(([name,tech,en],i)=>`<button class="weapon-row" data-weapon="${i+1}" title="查看${name}安装位置"><span>${name}</span><span class="weapon-tech">${tech}<b>Lv.${ship.levels[Math.min(i,ship.levels.length-1)]}</b></span></button>`).join('');
    $$('.weapon-row').forEach(b=>{let tag=Number(b.dataset.weapon);b.addEventListener('pointerenter',()=>{if(!state.transition){state.highlight=tag;$('#annotation-name').textContent=displayWeapons[tag-1][0]+' / '+displayWeapons[tag-1][2]}});b.addEventListener('pointerleave',()=>{if(!b.classList.contains('active'))state.highlight=Number($('.weapon-row.active')?.dataset.weapon||-10)});b.addEventListener('click',()=>{let was=b.classList.contains('active');$$('.weapon-row').forEach(x=>x.classList.remove('active'));b.classList.toggle('active',!was);state.highlight=was?-10:tag;$('#annotation-name').textContent=displayWeapons[tag-1][0]+' / '+displayWeapons[tag-1][2];tone()})});
    $('#station-number').textContent=String(ship.count).padStart(2,'0');
    $('#model-pagination').innerHTML=SHIPS.map((s,i)=>`<button class="${i===state.shipIndex?'active':''}" aria-label="查看${s.name}" aria-pressed="${i===state.shipIndex}" data-ship="${i}"></button>`).join('');
    $$('[data-ship]').forEach(b=>b.addEventListener('click',()=>selectShip(Number(b.dataset.ship))));
  }
  function selectShip(index){
    if(state.transition||state.shipSwitch||state.helpOpen)return;index=(index+SHIPS.length)%SHIPS.length;if(index===state.shipIndex)return;
    state.shipSwitch={start:performance.now(),progress:0,to:index,swapped:false};state.highlight=-10;$('#ship-annotation').classList.remove('visible');
    $$('.ship-title h1,.ship-code,.ship-sidebar').forEach(el=>{el.classList.remove('data-entering');el.classList.add('data-switching')});tone();
  }
  function resetCamera(){Object.assign(state.orbit,{targetYaw:isFighter(state.shipIndex)?.82:(isAntimatter(state.shipIndex)?.9:.55),targetPitch:isFighter(state.shipIndex)?.5:(isAntimatter(state.shipIndex)?.12:.31),targetDistance:ARCHIVE_DISTANCES[state.shipIndex]});state.autoRotate=false;$('#autorotate').setAttribute('aria-pressed','false');tone()}
  function setupInstruments(){
    for(let[id,left]of[['speed-ticks',true],['throttle-ticks',false]]){let markup='';for(let i=0;i<22;i++){let a=(left?149+i*1.16:6+i*1.16)*Math.PI/180;let r=294,cx=300+r*Math.cos(a),cy=300+r*Math.sin(a),len=left?11:11;let x2=300+(r-len)*Math.cos(a),y2=300+(r-len)*Math.sin(a);markup+=`<path d="M${cx.toFixed(2)} ${cy.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)}" stroke-width="3.3" opacity=".85"/>`}$('#'+id).innerHTML=markup}
    for(let id of['gun-bars','missile-bars','engine-bars','turret-bars'])$('#'+id).innerHTML='<i></i>'.repeat(10);
  }
  function setBarTicks(id,fraction){$$('#'+id+' i').forEach((bar,i)=>bar.style.opacity=i/10<fraction?'1':'.17')}
  function setLocation(index){state.location=index;let l=LOCATIONS[index];$('#station-location').textContent=`${l.name} [${l.coords}]`;$('#flight-nav-label').textContent=l.orbit;toast(`演练区域已设为${l.name}`);addLog(`演练区域切换至${l.name} [${l.coords}]`);renderSheet();tone()}

  function moveNavIndicator(){let nav=$('#main-nav'),button=$(`#main-nav button[data-tab="${state.activeTab}"]`);if(!button)return;const rect=button.getBoundingClientRect(),base=nav.getBoundingClientRect();let width=Math.min(45,rect.width*.53);$('#nav-indicator').style.width=width+'px';$('#nav-indicator').style.transform=`translateX(${rect.left-base.left+(rect.width-width)/2+(state.activeTab==='planet'?-7:0)}px)`;}
  function setTab(tab){
    if(state.mode!=='archive'||state.transition)return;
    state.activeTab=tab;$$('#main-nav button').forEach(b=>{let active=b.dataset.tab===tab;b.classList.toggle('active',active);active?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current')});moveNavIndicator();
    const sheet=$('#nav-sheet');let open=tab!=='fleet';if(!open&&sheet.contains(document.activeElement))document.activeElement.blur();sheet.classList.toggle('open',open);sheet.setAttribute('aria-hidden',String(!open));sheet.inert=!open;if(open)renderSheet();if(tab==='messages')$('#message-dot').classList.remove('visible');tone();
  }
  function renderSheet(){
    let tab=state.activeTab;if(tab==='fleet')return;const titles={planet:['星球','PLANETARY PORT'],map:['星图','LOCAL SECTOR / 1:16'],build:['造船','ORBITAL SHIPYARD'],research:['研究','WEAPON DEVELOPMENT'],messages:['消息','FLEET ACTIVITY LOG']};let [title,en]=titles[tab];$('#sheet-title').textContent=title;$('#sheet-eyebrow').textContent=en;let s=SHIPS[state.shipIndex],l=LOCATIONS[state.location],content='';
    if(tab==='planet')content=`<div class="sheet-grid"><div class="sheet-copy"><strong>${l.name} / ${l.en}</strong><p>${l.description}</p><div class="sheet-detail"><span>坐标 [${l.coords}]</span><span>停泊 ${SHIPS.reduce((n,s)=>n+s.count,0)} 艘</span></div></div><div>${LOCATIONS.map((v,i)=>`<button class="line-action ${i===state.location?'active':''}" data-location="${i}"><span>${v.name} <small>[${v.coords}]</small></span><small>${i===state.location?'当前演练区域':'设为演练区域 ↗'}</small></button>`).join('')}</div></div>`;
    if(tab==='map')content=`<div class="sheet-grid"><div class="sheet-copy"><strong>第 16 星系 · 本地演练区域</strong><p>点击轨道节点，选择进入驾驶舱后的演练区域。</p><div class="sheet-detail"><span>SECTOR 01 / SYSTEM 16</span></div></div><div class="mini-map">${LOCATIONS.map((v,i)=>`<button class="map-node ${i===state.location?'active':''}" data-location="${i}"><span>${v.name}</span><small>${v.coords}</small></button>`).join('')}</div></div>`;
    if(tab==='build')content=`<div class="sheet-grid"><div class="sheet-copy"><strong>${s.name} / ${s.en}</strong><p>为当前舰型建立一条本地建造队列。完成后，停泊数量增加一艘。</p><div class="sheet-detail"><span>现有 ${s.count} 艘</span><span>演示用时 ${CONFIG.constructionSeconds} 秒</span></div></div><div><button id="build-order" class="text-action" ${state.job?'disabled':''}><span>${state.job?'建造中 · '+SHIPS[state.job.ship].name:'建造一艘'+s.name}</span><span>${state.job?'…':'＋'}</span></button><div class="job-progress"><i id="build-progress"></i></div><div class="sheet-detail" id="build-status">${state.job?'建造队列正在运行':'队列空闲 · 本次演示不消耗资源'}</div></div></div>`;
    if(tab==='research')content=`<div class="research-list">${WEAPONS.map(([name,tech],i)=>`<div><h3>${tech}</h3><p>Lv.${s.levels[i]} / ${name}</p><button class="text-action" data-research="${i}" ${(state.research||s.levels[i]>=10)?'disabled':''}><span>${state.research?.index===i?'研究中…':s.levels[i]>=10?'已达上限':'升级至 Lv.'+(s.levels[i]+1)}</span><span>↗</span></button></div>`).join('')}</div><div class="job-progress"><i id="research-progress"></i></div><div class="sheet-detail" id="research-status">${state.research?'研发队列正在运行':'完成一项研究，当前舰型攻击提高 7%。本地演示，不消耗资源。'}</div>`;
    if(tab==='messages')content=`<div class="sheet-log">${state.logs.map(item=>`<div><time>${item.time}</time><span>${item.message}</span></div>`).join('')||'<div>暂无舰队消息</div>'}</div>`;
    $('#sheet-content').innerHTML=content;
    $$('[data-location]').forEach(b=>b.addEventListener('click',()=>setLocation(Number(b.dataset.location))));
    $('#build-order')?.addEventListener('click',()=>{if(state.job)return;state.job={ship:state.shipIndex,elapsed:0};addLog('已开始建造一艘'+s.name);renderSheet();tone()});
    $$('[data-research]').forEach(b=>b.addEventListener('click',()=>{if(state.research)return;let index=Number(b.dataset.research);state.research={ship:state.shipIndex,index,elapsed:0};addLog('已启动'+WEAPONS[index][1]+'研究');renderSheet();tone()}));
  }
  function updateJobs(dt){
    if(state.job){state.job.elapsed+=dt;let frac=clamp(state.job.elapsed/CONFIG.constructionSeconds,0,1);if($('#build-progress'))$('#build-progress').style.width=frac*100+'%';if($('#build-status'))$('#build-status').textContent=`${Math.round(frac*100)}% · 剩余 ${Math.max(0,CONFIG.constructionSeconds-state.job.elapsed).toFixed(1)} 秒`;if(frac>=1){let ship=SHIPS[state.job.ship];ship.count++;state.job=null;renderShipData();renderSheet();toast(ship.name+'建造完成 · 停泊数量 '+ship.count);addLog(ship.name+'建造完成，已加入停泊舰队');tone('enter')}}
    if(state.research){state.research.elapsed+=dt;let frac=clamp(state.research.elapsed/CONFIG.researchSeconds,0,1);if($('#research-progress'))$('#research-progress').style.width=frac*100+'%';if($('#research-status'))$('#research-status').textContent=`研究进度 ${Math.round(frac*100)}%`;if(frac>=1){let r=state.research,s=SHIPS[r.ship];s.levels[r.index]=Math.min(10,s.levels[r.index]+1);s.stats[2]=Math.round(s.stats[2]*1.07);state.research=null;renderShipData();renderSheet();toast(WEAPONS[r.index][1]+'研究完成');addLog(`${s.name}的${WEAPONS[r.index][1]}提升至 Lv.${s.levels[r.index]}`);tone('enter')}}
  }


  function createTargets(){
    const p=state.flight;
    p.targets=[
      {name:'敌方重型战列舰',hudName:'KSR DREADNAUGHT',code:'RAVAGER / CAPITAL',kind:4,pos:[24,28,-505],scale:4.4,hp:100,respawn:0,heading:.36,velocity:[0,0,0],seed:0},
      {name:'侧翼驱逐舰',hudName:'DESTROYER',code:'HOSTILE / DD-04',kind:0,pos:[-230,64,-620],scale:2.7,hp:100,respawn:0,heading:-.6,velocity:[0,0,0],seed:1},
      {name:'敌方巡洋舰',hudName:'CRUISER',code:'HOSTILE / CA-03',kind:1,pos:[280,60,-600],scale:2.8,hp:100,respawn:0,heading:.65,velocity:[0,0,0],seed:2},
      {name:'先锋拦截机',hudName:'RAVEN S-3',code:'HOSTILE / INTERCEPTOR',kind:3,pos:[15,12,-180],scale:1.8,hp:100,respawn:0,heading:Math.PI/2,velocity:[0,0,0],seed:3},
      {name:'右翼拦截机',hudName:'RAVEN S-5',code:'HOSTILE / INTERCEPTOR',kind:3,pos:[110,-8,-295],scale:1.6,hp:100,respawn:0,heading:Math.PI/2+.2,velocity:[0,0,0],seed:4},
      {name:'左翼拦截机',hudName:'RAVEN S-7',code:'HOSTILE / INTERCEPTOR',kind:3,pos:[-130,-16,-320],scale:1.5,hp:100,respawn:0,heading:Math.PI/2-.2,velocity:[0,0,0],seed:5}
    ];p.targetIndex=state.shipIndex===3?3:0;
  }
  function screenVisible(mode){
    state.mode=mode;document.body.className='mode-'+mode;if(mode==='flight')syncCombatUI();
    for(let name of['archive','flight']){let el=$('#'+name),show=name===mode;if(!show&&el.contains(document.activeElement))document.activeElement.blur();el.classList.toggle('visible',show);el.setAttribute('aria-hidden',String(!show));el.inert=!show;el.classList.remove('leaving');if(show){el.classList.add('entering');setTimeout(()=>el.classList.remove('entering'),1000)}}
    if(mode==='flight'){$('#nav-sheet').classList.remove('open');$('#nav-sheet').setAttribute('aria-hidden','true');$('#nav-sheet').inert=true;$('#ship-annotation').classList.remove('visible')}
  }
  function transitionTo(to){
    if(state.transition||state.shipSwitch||state.helpOpen||state.mode===to||!renderer)return;
    if(to==='flight'){setTab('fleet');configureFlight(state.shipIndex,true);$('#transition-text').textContent=isAntimatter(state.shipIndex)?'弹载链路连接':'舰桥连接';$('#transition-sub').textContent=isAntimatter(state.shipIndex)?'ESTABLISHING TERMINAL GUIDANCE':'ESTABLISHING BRIDGE LINK';addLog('已接管'+SHIPS[state.shipIndex].name+'，开始虚拟战报演练');}
    else{$('#transition-text').textContent='返回舰队';$('#transition-sub').textContent='RESTORING FLEET INTERFACE';addLog('已结束虚拟接管，返回舰船档案');resetCamera()}
    state.transition={to,start:performance.now(),progress:0,swapped:false};$('#'+state.mode).classList.add('leaving');$('#transition-curtain').classList.add('active');$('#transition-curtain').style.pointerEvents='auto';tone('enter');keys.clear();mouseDown=false;
  }
  function updateTransition(now){
    const t=state.transition;if(!t)return;const duration=reduced?300:(t.duration||CONFIG.transitionMs);t.progress=clamp((now-t.start)/duration,0,1);let p=t.progress;
    // View swaps occur under a dark frame; the cameras keep moving through the handoff.
    let opacity=p<.48?Math.pow(clamp(p/.48,0,1),1.3):Math.pow(clamp((1-p)/.48,0,1),1.35);if(p>.4&&p<.6)opacity=1;
    $('#transition-curtain').style.opacity=opacity;$('#transition-progress').style.width=p*100+'%';$('#transition-counter').textContent=String(Math.floor(p*100)).padStart(2,'0');
    if(p>=.5&&!t.swapped){t.swapped=true;if(t.combatIndex!==undefined)configureFlight(t.combatIndex,false);screenVisible(t.to);}
    if(p>=1){$('#transition-curtain').classList.remove('active');$('#transition-curtain').style.opacity=0;$('#transition-curtain').style.pointerEvents='none';state.transition=null;if(state.mode==='flight'){notice('V 切换舰桥 / 追踪视角 · X 舰艏对准目标');updateHUD()}else moveNavIndicator();}
  }
  function setHelp(open){
    state.helpOpen=open;keys.clear();mouseDown=false;const modal=$('#help-modal');modal.classList.toggle('open',open);modal.setAttribute('aria-hidden',String(!open));modal.inert=!open;
    if(open){lastFocused=document.activeElement;$('#close-help').focus()}else if(lastFocused&&document.contains(lastFocused)){lastFocused.focus({preventScroll:true})}tone();
  }
  function setAI(enabled){if(isAntimatter(state.shipIndex)&&!enabled){notice('反物质导弹仅支持自动制导');tone();return;}state.flight.ai=enabled;$('#toggle-ai').setAttribute('aria-pressed',String(enabled));$('#ai-label').textContent=enabled?'取回控制':'自动驾驶';$('#ai-indicator').classList.toggle('visible',enabled);notice(enabled?'AI 已接管航向与武器':'已恢复手动驾驶');tone();addLog(enabled?'飞行控制已交还 AI':'已恢复手动驾驶')}

  function setView(){
    const p=state.flight;if(isAntimatter(state.shipIndex)){p.external=true;syncCombatUI();notice('反物质导弹仅支持外部追踪');tone();return;}p.external=!p.external;
    // Changing the destination never resets the camera spring, flight, projectiles or charge.
    syncCombatUI();tone();
  }
  function cycleTarget(){const p=state.flight;selectTarget((p.targetIndex+1)%p.targets.length);}
  function canFire(){return state.mode==='flight'&&!state.transition&&!state.helpOpen&&!state.hudPaused;}
  function fireMain(){if(window.PreviewHUD?.mode==='flagship')return;if(window.PreviewHUD?.mode==='battleship'){fireTurrets();return;}
    if(window.CommandHUD?.isOverheated())return false;
    const p=state.flight;if(!canFire()||p.gunCooldown>0||p.charging)return false;
    if(isAntimatter(state.shipIndex))return antimatterPulse();
    if(p.profile.capital){p.charging=true;p.charge=0;tone('charge');}
    else dischargeMain();
    return true;
  }
  // A segment / oriented ellipsoid intersection. Fast deterministic hit testing for the prototype.
  function hitSegment(a,b,t){
    if(t.hp<=0)return null;
    const transform=q=>{let v=V.sub(q,t.pos),co=Math.cos(t.heading||0),si=Math.sin(t.heading||0),sx=t.kind===4?13.4:t.kind===3?6.8:t.kind===1?11.2:8.6,sz=t.kind===4?5.3:t.kind===3?3.3:t.kind===1?3.5:2.8;return[(co*v[0]-si*v[2])/(t.scale*sx),v[1]/(t.scale*2.05),(si*v[0]+co*v[2])/(t.scale*sz)]};
    const x=transform(a),d=V.sub(transform(b),x),A=V.dot(d,d),B=2*V.dot(x,d),C=V.dot(x,x)-1;
    if(C<=0)return 0;if(A<1e-12)return null;let discr=B*B-4*A*C;if(discr<0)return null;
    let f=(-B-Math.sqrt(discr))/(2*A);return f>=0&&f<=1?f:null;
  }
  function dischargeMain(){
    const p=state.flight,c=p.profile,layout=LAYOUTS[state.shipIndex],model=shipMatrix(p,state.shipIndex),f=forward();
    p.charging=false;p.charge=0;p.gunCooldown=c.mainCooldown;p.mainShots++;
    if(c.capital){
      p.shake=c===COMBAT[4]?1.2:.6;
      const hit=new Map();
      for(let m of layout.main){
        let start=M.transform(model,m),end=V.add(start,V.scale(f,1800)),best=1,target=null;
        for(let t of p.targets){let k=hitSegment(start,end,t);if(k!==null&&k<best){best=k;target=t;}}
        if(target){end=start.map((v,i)=>mix(v,end[i],best));hit.set(target,true);}
        p.beams.push({start,end,age:0,life:.45,width:c.beamWidth,color:[.33,.7,1]});
        burst(start,10,[.4,.8,1],.8,6);
      }
      for(let t of hit.keys())damageTarget(t,c.mainDamage);
      tone('spinal');notice(hit.size?'同轴主炮命中':'同轴主炮已发射 · 沿舰艏轴线');
    }else{
      const target=selectedTarget();let dir=f;
      if(target?.hp>0){const to=V.norm(V.sub(target.pos,p.pos));if(V.dot(to,f)>.998)dir=to;}
      for(let m of layout.main){let start=M.transform(model,m);p.projectiles.push({pos:start,previous:start,velocity:V.scale(dir,640),age:0,life:3.2,missile:false,damage:c.mainDamage/layout.main.length});}
      tone('fire');
    }
  }

  function addShockwave(pos,color,startRadius,endRadius,life){
    state.flight.shockwaves.push({pos:[...pos],color,startRadius,endRadius,life,age:0});
  }
  function antimatterPulse(){
    const p=state.flight;if(p.hidden)return false;const layout=LAYOUTS[state.shipIndex],model=shipMatrix(p,state.shipIndex),nose=M.transform(model,layout.main[0]||[-6.9,0,0]),f=forward();
    p.gunCooldown=p.profile.mainCooldown;p.mainShots++;p.shake=.32;
    for(let i=0;i<4;i++){
      let spread=(i-1.5)*.015,dir=V.norm([f[0]+spread,f[1],f[2]]),end=V.add(nose,V.scale(dir,460+i*55));
      p.beams.push({start:nose,end,age:0,life:.24,width:.12+i*.02,color:[.55,.95,1]});
    }
    const end=V.add(nose,V.scale(f,520));for(let t of p.targets){if(hitSegment(nose,end,t)!==null)damageTarget(t,p.profile.mainDamage);}
    burst(nose,26,[.42,.95,1],.65,18);addShockwave(nose,[.55,.96,1],6,45,.45);notice('湮灭脉冲释放');tone('fire');return true;
  }
  function detonateAntimatter(pos,reason='manual'){
    const p=state.flight;const radius=720;
    addShockwave(pos,[.5,.95,1],15,350,1.05);addShockwave(pos,[.92,.98,1],10,780,2.2);addShockwave(pos,[1,.62,.25],0,290,.95);addShockwave(pos,[.62,.22,.98],22,550,1.65);
    for(let i=0;i<44;i++){
      let theta=rnd()*Math.PI*2,phi=Math.acos(clamp(rnd()*2-1,-1,1)),dir=[Math.sin(phi)*Math.cos(theta),Math.cos(phi),Math.sin(phi)*Math.sin(theta)];
      p.beams.push({start:[...pos],end:V.add(pos,V.scale(dir,110+rnd()*radius)),age:0,life:.6+rnd()*.65,width:.12+rnd()*.55,color:i%3===0?[1,.62,.28]:i%2?[.55,.95,1]:[.82,1,1]});
    }
    burst(pos,400,[.45,.96,1],3.2,330);burst(pos,320,[1,.66,.24],2.3,260);burst(pos,260,[.92,.98,1],3.8,160);burst(pos,180,[.74,.32,1],2.8,380);
    for(let i=0;i<35;i++)p.particles.push({pos:V.add(pos,[(rnd()-.5)*30,(rnd()-.5)*30,(rnd()-.5)*30]),velocity:[(rnd()-.5)*28,(rnd()-.5)*28,(rnd()-.5)*28],age:0,life:1.3+rnd()*.8,size:35+rnd()*90,color:i%4===0?[1,.73,.4]:[.65,.95,1]});
    for(let t of p.targets){if(t.hp<=0)continue;let d=V.length(V.sub(t.pos,pos));if(d<radius)damageTarget(t,Math.max(22,420*(1-d/radius)));}
    p.shake=2.2;p.hidden=true;p.respawnDelay=2.5;p.speed=0;p.velocity=[0,0,0];p.missileStock=0;p.missileCooldown=p.profile.missileCooldown;
    notice(reason==='proximity'?'反物质近炸命中':'反物质弹头引爆');addLog('反物质自行导弹完成一次终结打击');tone('spinal');
  }
  function respawnAntimatterMissile(initial=false){
    const p=state.flight;if(!isAntimatter(state.shipIndex))return;let live=p.targets.filter(t=>t.hp>0);if(!live.length){createTargets();live=p.targets.filter(t=>t.hp>0);}const target=(p.targets[p.targetIndex]?.hp>0?p.targets[p.targetIndex]:live[0]);if(!target)return;
    const offset=[-180+(rnd()-.5)*80,60+(rnd()-.5)*40,420+(rnd()-.5)*120];
    p.pos=V.add(target.pos,offset);let d=V.sub(target.pos,p.pos);p.yaw=p.yawTarget=Math.atan2(d[0],-d[2]);p.pitch=p.pitchTarget=Math.atan2(d[1],Math.hypot(d[0],d[2]));p.roll=0;p.hidden=false;p.respawnDelay=0;p.speed=0;p.throttle=100;p.shield=100;p.hull=100;p.missileStock=1;p.missileCooldown=initial?0:Math.min(p.missileCooldown,1.2);p.external=true;p.ai=true;p.align=true;p.boost=true;updateHUD();
    if(!initial)notice('新一枚反物质导弹接入控制链路');
  }
  function fireMissile(){
    const p=state.flight,c=p.profile;if(!canFire())return;
    if(isAntimatter(state.shipIndex)){if(p.hidden){notice('导弹重构中');return;}if(p.missileCooldown>0){notice(`反物质约束重整 · ${p.missileCooldown.toFixed(1)} s`);return;}detonateAntimatter(V.add(p.pos,V.scale(forward(),8)),'manual');updateHUD();return;}
    if(p.missileCooldown>0){notice(`导弹装填中 · ${p.missileCooldown.toFixed(1)} s`);return;}
    const target=selectedTarget();if(!target||target.hp<=0){notice('当前目标已失能 · 按 T 切换目标');return;}
    if(V.length(V.sub(target.pos,p.pos))>2200){notice('目标超出导弹射程');return;}
    if(p.missileStock<=0){notice('弹舱补给中');return;}
    let count=Math.min(c.salvo,p.missileStock);p.missileStock-=count;p.missileCooldown=c.missileCooldown;
    for(let i=0;i<count;i++)p.salvoQueue.push({delay:i*.16,tube:i%LAYOUTS[state.shipIndex].tubes.length,target});
    notice(`${count} 枚导弹顺序发射`);updateHUD();
  }
  function launchMissile(order){
    const p=state.flight,l=LAYOUTS[state.shipIndex],model=shipMatrix(p,state.shipIndex),a=axes(p);
    const start=M.transform(model,l.tubes[order.tube]);
    const eject=p.profile.capital?V.add(V.scale(a.up,28),V.scale(a.forward,9)):V.scale(a.forward,42);
    p.projectiles.push({pos:start,previous:[...start],velocity:eject,age:0,life:13,missile:true,damage:p.profile.missileDamage,target:order.target,trail:[[...start]],trailClock:0,seed:order.tube});
    p.missilesFired++;burst(start,12,[.55,.66,.69],1.2,7);tone('missile');
  }
  function burst(pos,count,color=[1,.7,.36],life=.8,speed=22){
    const p=state.flight;for(let i=0;i<count;i++)p.particles.push({pos:[...pos],velocity:[(rnd()-.5)*speed,(rnd()-.5)*speed,(rnd()-.5)*speed],age:0,life:life*(.6+rnd()*.8),size:2+rnd()*6,color});
    if(p.particles.length>2200)p.particles.splice(0,p.particles.length-2200);
  }
  function damageTarget(target,amount){
    if(!target||target.hp<=0||amount<=0)return;
    target.hp=Math.max(0,target.hp-amount);
    if(amount>1||state.flight.turretMode==='manual'){$('#hit-marker').classList.add('show');clearTimeout(hitTimer);hitTimer=setTimeout(()=>$('#hit-marker').classList.remove('show'),110);}
    if(amount>5){tone('hit');burst(target.pos,Math.min(80,Math.round(amount)),[1,.68,.33],1.1,40);}
    if(target.hp<=0){target.respawn=9;state.flight.kills++;burst(target.pos,110,[1,.54,.21],2.7,55);notice('目标失能 · '+target.name);addLog('演练目标'+target.name+'已失能');}
  }
  function updateTurrets(dt){
    const p=state.flight,c=p.profile;if(!p.turrets.length)return;
    const a=axes(p),model=shipMatrix(p,state.shipIndex),target=selectedTarget();
    let manual=null;
    if(p.turretMode==='manual'&&renderer?.cameraForward){const ray=renderer.ray(mouseAim.x,mouseAim.y),distance=target?V.length(V.sub(target.pos,ray.origin)):600;manual=V.add(ray.origin,V.scale(ray.direction,clamp(distance,100,1500)));}
    for(let t of p.turrets){
      t.cooldown=Math.max(0,t.cooldown-dt);t.recoil=mixExp(t.recoil,0,13,dt);
      const origin=M.transform(model,t.mount);
      let goal=manual;
      if(!goal&&target){let tof=V.length(V.sub(target.pos,origin))/430;goal=V.add(target.pos,V.scale(target.velocity||[0,0,0],tof));}
      if(!goal)continue;
      const d=V.sub(goal,origin),native=[-V.dot(d,a.forward),V.dot(d,a.up),-V.dot(d,a.right)],desiredYaw=Math.atan2(native[2],-native[0]);
      let desiredPitch=Math.atan2(native[1],Math.hypot(native[0],native[2]));
      const side=Math.sign(t.mount[2]),front=t.mount[0]<0,center=front?0:side*Math.PI/2,half=front?2.4:1.88;
      const arcError=shortAngle(desiredYaw-center);
      t.inArc=Math.abs(arcError)<half&&desiredPitch>-.045&&desiredPitch<1.2;
      const targetYaw=center+clamp(arcError,-half,half);desiredPitch=clamp(desiredPitch,-.035,1.2);
      t.yaw+=clamp(shortAngle(targetYaw-t.yaw)*5,-1.2,1.2)*dt;
      t.pitch+=clamp((desiredPitch-t.pitch)*5,-.8,.8)*dt;
      t.aligned=t.inArc&&Math.abs(shortAngle(desiredYaw-t.yaw))<.025&&Math.abs(desiredPitch-t.pitch)<.018;
      t.transform=turretTransforms(model,t,state.shipIndex);
      if(p.turretMode==='auto'&&p.elapsed>2&&target?.hp>0&&t.aligned&&t.cooldown<=0)shootTurret(t);
      if(p.turretMode==='manual'&&mouseDown&&t.aligned&&t.cooldown<=0)shootTurret(t);
    }
  }
  function shootTurret(t){
    const p=state.flight,c=p.profile;if(!t.transform||t.cooldown>0||!t.inArc)return false;
    t.cooldown=c.turretCooldown+(t.index%3)*.09;t.recoil=.23;p.turretShots++;
    for(let side of[-1,1]){
      const start=M.transform(t.transform.barrels,[-2.45,0,side*.25]);
      const dir=V.norm(V.sub(start,M.transform(t.transform.barrels,[-1.45,0,side*.25])));
      p.projectiles.push({pos:start,previous:[...start],velocity:V.scale(dir,430),age:0,life:5.0,missile:false,damage:c.turretDamage});
      burst(start,2,[.74,.9,1],.12,6);
    }
    return true;
  }
  function fireTurrets(){
    const p=state.flight;if(!canFire())return;
    if(!p.profile.capital){fireMain();return;}
    if(p.turretMode==='hold'){notice('炮塔停火中 · L 切换火控模式');return;}
    for(let t of p.turrets)if(t.aligned)shootTurret(t);
  }
  function updateCamera(dt){
    const p=state.flight,target=p.external?1:0;
    if(reduced){p.cameraBlend=target;p.cameraVelocity=0;return;}
    // Exact critically damped spring. Reversing mid-transition preserves position and velocity.
    const omega=6.8,x=p.cameraBlend-target,v=p.cameraVelocity,exp=Math.exp(-omega*dt),c=v+omega*x;
    p.cameraBlend=target+(x+c*dt)*exp;p.cameraVelocity=(v-omega*c*dt)*exp;
    if(Math.abs(p.cameraBlend-target)<.00008&&Math.abs(p.cameraVelocity)<.0008){p.cameraBlend=target;p.cameraVelocity=0;}
    p.cameraBlend=clamp(p.cameraBlend,0,1);
    document.documentElement.style.setProperty('--view-blend',p.cameraBlend.toFixed(4));
    $('#camera-travel').style.transform=`scaleX(${p.cameraBlend})`;
  }
  function updateProjectiles(dt){
    const p=state.flight;
    for(let q of p.salvoQueue)q.delay-=dt;
    const ready=p.salvoQueue.filter(q=>q.delay<=0);p.salvoQueue=p.salvoQueue.filter(q=>q.delay>0);ready.forEach(launchMissile);
    p.projectiles=p.projectiles.filter(q=>{
      q.age+=dt;q.previous=[...q.pos];
      if(q.missile){
        if(q.age>.35&&q.target?.hp>0){
          const desired=V.norm(V.sub(V.add(q.target.pos,V.scale(q.target.velocity||[0,0,0],.14)),q.pos));
          const dir=V.norm(V.add(V.scale(V.norm(q.velocity),Math.exp(-dt*3.1)),V.scale(desired,1-Math.exp(-dt*3.1))));
          q.velocity=V.scale(dir,Math.min(290,40+(q.age-.35)*195));
        }
        q.trailClock+=dt;if(q.trailClock>.037){q.trailClock=0;q.trail.push([...q.pos]);if(q.trail.length>50)q.trail.shift();}
      }
      q.pos=V.add(q.pos,V.scale(q.velocity,dt));
      if(q.hostile){
        const radius=COMBAT[state.shipIndex].capital?LAYOUTS[state.shipIndex].scale*3:1.9;
        // Crossing the player's bounding sphere produces one shield hit.
        const d=V.sub(q.pos,q.previous),to=V.sub(p.pos,q.previous),u=clamp(V.dot(to,d)/(V.dot(d,d)||1),0,1),nearest=V.add(q.previous,V.scale(d,u));
        if(V.length(V.sub(nearest,p.pos))<radius){
          if(window.CommandHUD)window.CommandHUD.onDamage(q);else{p.shield=Math.max(0,p.shield-2.5);if(p.shield<=0)p.hull=Math.max(1,p.hull-1);}p.shake=.16;
          $('#damage-wash').classList.add('show');clearTimeout(damageTimer);damageTimer=setTimeout(()=>$('#damage-wash').classList.remove('show'),190);return false;
        }
      }else{
        for(let t of p.targets){const k=hitSegment(q.previous,q.pos,t);if(k!==null){damageTarget(t,q.damage);if(q.missile)burst(q.pos,35,[1,.68,.27],1.3,28);return false;}}
      }
      return q.age<q.life;
    });
    p.beams=p.beams.filter(b=>(b.age+=dt)<b.life);
    p.particles=p.particles.filter(q=>{q.age+=dt;q.pos=V.add(q.pos,V.scale(q.velocity,dt));q.velocity=V.scale(q.velocity,Math.exp(-dt*.4));return q.age<q.life;});
    p.shockwaves=p.shockwaves.filter(w=>(w.age+=dt)<w.life);
  }
  function updateFlight(dt){
    const p=state.flight,c=p.profile;p.elapsed+=dt;updateCamera(dt);p.shake=mixExp(p.shake,0,5,dt);
    p.gunCooldown=Math.max(0,p.gunCooldown-dt);p.missileCooldown=Math.max(0,p.missileCooldown-dt);
    if(p.charging){p.charge+=dt/c.chargeTime;if(p.charge>=1)dischargeMain();}
    if(p.missileStock===0&&p.salvoQueue.length===0&&!isAntimatter(state.shipIndex)){p.restock+=dt;if(p.restock>=15){p.missileStock=c.missileCapacity;p.restock=0;notice('演练弹舱已补给');}}
    for(let t of p.targets){
      if(t.hp<=0){t.respawn-=dt;if(t.respawn<=0){let a=axes(p);t.pos=V.add(p.pos,V.add(V.scale(a.forward,500+t.seed*120),V.add(V.scale(a.right,(t.seed-1)*160),V.scale(a.up,18+t.seed*20))));t.hp=100;}}
      else{t.velocity=[Math.sin(p.elapsed*.12+t.seed*2)*2.8,Math.cos(p.elapsed*.14+t.seed)*.3,Math.sin(p.elapsed*.08+t.seed)*.4];t.pos=V.add(t.pos,V.scale(t.velocity,dt));}
    }
    let t=selectedTarget();
    if((p.ai||isAntimatter(state.shipIndex))&&t?.hp<=0){const i=p.targets.findIndex(t=>t.hp>0);if(i>=0){p.targetIndex=i;t=p.targets[i];renderContacts();}}
    if(isAntimatter(state.shipIndex)){
      p.ai=true;p.align=true;p.external=true;p.boost=true;
      if(p.hidden){p.respawnDelay-=dt;updateProjectiles(dt);if(p.respawnDelay<=0)respawnAntimatterMissile();return;}
    }
    if((p.ai||p.align)&&t?.hp>0){let d=V.sub(t.pos,p.pos);p.yawTarget=Math.atan2(d[0],-d[2]);p.pitchTarget=Math.atan2(d[1],Math.hypot(d[0],d[2]));}
    if(!p.ai){
      if(keys.has('KeyW'))p.throttle+=dt*27;if(keys.has('KeyS'))p.throttle-=dt*27;p.throttle=clamp(p.throttle,0,100);
      let turn=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),pitch=(keys.has('ArrowUp')?1:0)-(keys.has('ArrowDown')?1:0);
      if(turn||pitch){p.align=false;p.yawTarget+=turn*c.turnRate*dt;p.pitchTarget=clamp(p.pitchTarget+pitch*c.turnRate*.65*dt,-1.25,1.25);}
    }else p.throttle=mixExp(p.throttle,isAntimatter(state.shipIndex)?100:(c.capital?22:38),.8,dt);
    const yd=shortAngle(p.yawTarget-p.yaw),pd=p.pitchTarget-p.pitch;
    p.yawVelocity=mixExp(p.yawVelocity,clamp(yd*c.turnResponse,-c.turnRate,c.turnRate),c.turnResponse,dt);
    p.pitchVelocity=mixExp(p.pitchVelocity,clamp(pd*c.turnResponse,-c.turnRate*.65,c.turnRate*.65),c.turnResponse,dt);
    p.yaw+=p.yawVelocity*dt;p.pitch=clamp(p.pitch+p.pitchVelocity*dt,-1.3,1.3);
    const roll=(keys.has('KeyQ')?1:0)-(keys.has('KeyE')?1:0);
    if(roll&&!isAntimatter(state.shipIndex))p.roll+=roll*dt*(c.capital?.14:.9);else p.roll=mixExp(p.roll,isAntimatter(state.shipIndex)?-.15:-p.yawVelocity*(c.capital?.13:.22),isAntimatter(state.shipIndex)?4.5:2.4,dt);
    p.boostActive=isAntimatter(state.shipIndex)?true:((keys.has('ShiftLeft')||keys.has('ShiftRight')||p.boost)&&(window.CommandHUD?.boostAllowed()??true));
    const desiredSpeed=p.throttle/100*c.maxSpeed*(p.boostActive?(c.capital?1.65:2.2):1);
    p.speed=mixExp(p.speed,desiredSpeed,c.accel,dt);
    p.velocity=p.velocity.map((v,i)=>mixExp(v,forward()[i]*p.speed*.125,c.accel*2,dt));p.pos=V.add(p.pos,V.scale(p.velocity,dt));
    if(t?.hp>0){let d=V.norm(V.sub(t.pos,p.pos));p.boresightError=Math.acos(clamp(V.dot(d,forward()),-1,1))*180/Math.PI;}else p.boresightError=180;
    if(isAntimatter(state.shipIndex)&&t?.hp>0&&V.length(V.sub(t.pos,p.pos))<120&&p.missileCooldown<=0)detonateAntimatter(V.add(p.pos,V.scale(forward(),8)),'proximity');
    if(p.ai&&t?.hp>0&&!isAntimatter(state.shipIndex)){if(p.boresightError<(c.capital?.6:1.8))fireMain();if(p.elapsed>3&&p.missileCooldown<=0&&t.hp>35)fireMissile();}
    if(!p.ai&&(keys.has('Space')||(mouseDown&&(!c.capital||p.turretMode!=='manual'))))fireMain();
    updateTurrets(dt);updateProjectiles(dt);
    p.enemyAttack-=dt;if(p.enemyAttack<=0){
      p.enemyAttack=isAntimatter(state.shipIndex)?3.2:4.8;const enemy=p.targets.find(t=>t.hp>0);
      if(enemy&&!p.hidden){let predicted=V.add(p.pos,V.scale(p.velocity,V.length(V.sub(enemy.pos,p.pos))/210));p.projectiles.push({pos:[...enemy.pos],previous:[...enemy.pos],velocity:V.scale(V.norm(V.sub(predicted,enemy.pos)),210),age:0,life:10,hostile:true,damage:0});}
    }
    if(p.enemyAttack>2&&!window.CommandHUD)p.shield=Math.min(100,p.shield+dt*.14);
  }
  function updateHUD(){
    const p=state.flight,c=p.profile;if(!c||!p.targets.length)return;
    $('#speed-value').textContent=Math.round(p.speed);$('#throttle-value').textContent=Math.round(p.throttle)+'%';$('#heading-value').textContent=String(Math.round(((p.yaw*180/Math.PI)%360+360)%360)).padStart(3,'0');
    const gun=isAntimatter(state.shipIndex)?(p.hidden?'重构中':p.gunCooldown>0?`${p.gunCooldown.toFixed(1)} s`:'脉冲就绪'):(p.charging?`蓄能 ${Math.round(p.charge*100)}%`:p.gunCooldown>0?`${p.gunCooldown.toFixed(1)} s`:'就绪');
    $('#main-gun-state').textContent=gun;$('#system-gun-state').textContent=gun;
    const missile=isAntimatter(state.shipIndex)?(p.hidden?'弹体重构':p.missileCooldown>0?`${p.missileCooldown.toFixed(1)} s`:'待引爆'):(p.missileCooldown>0?`${p.missileCooldown.toFixed(1)} s`:p.missileStock<=0?'补给中':'可齐射');
    $('#missile-state').textContent=missile;$('#system-missile-state').textContent=missile;
    $('#charge-arc').style.opacity=p.gunCooldown>0?.3:1;
    $('#system-engine-state').textContent=isAntimatter(state.shipIndex)?(p.hidden?'重构':'突防'):p.boostActive?'加速':p.throttle<1?'怠速':'巡航';$('#system-engine').classList.toggle('selected',p.boostActive);
    setBarTicks('gun-bars',p.charging?p.charge:1-p.gunCooldown/c.mainCooldown);setBarTicks('missile-bars',1-p.missileCooldown/c.missileCooldown);setBarTicks('engine-bars',p.boostActive?1:p.throttle/100);
    $$('#speed-ticks path').forEach((x,i)=>x.style.opacity=i/22<clamp(p.speed/c.maxSpeed,0,1)?'.95':'.18');$$('#throttle-ticks path').forEach((x,i)=>x.style.opacity=i/22<p.throttle/100?'.95':'.18');
    $('#shield-value').textContent=Math.round(p.shield)+'%';$('#hull-value').textContent=Math.round(p.hull)+'%';$('#shield-bar').style.width=p.shield+'%';$('#hull-bar').style.width=p.hull+'%';
    const ready=p.turrets.filter(t=>t.aligned).length,total=p.turrets.length;
    $('#system-turret-state').textContent=p.turretMode==='hold'?'停火':`${ready} / ${total}`;setBarTicks('turret-bars',total?ready/total:0);
    $('#turret-count').textContent=String(total).padStart(2,'0');$('#turrets-bearing').textContent=`${ready} / ${total} 就位`;
    $('#missile-stock').textContent=String(p.missileStock).padStart(2,'0');$('#missile-capacity').textContent=String(c.missileCapacity).padStart(2,'0');
    $('#director-primary').textContent=gun;$('#charge-fill').style.transform=`scaleX(${p.charging?p.charge:1-p.gunCooldown/c.mainCooldown})`;
    $('#bore-error').textContent=p.boresightError<90?p.boresightError.toFixed(1)+'°':'—';
    $('#bore-caption').textContent=p.charging?'主炮蓄能':p.boresightError<.8?'舰艏已对准':'舰艏轴线';
    $('#bore-sight').classList.toggle('aligned',p.boresightError<.8);$('#bore-sight').classList.toggle('charging',p.charging);
    $('#director').classList.toggle('charging',p.charging);$('#kill-count').textContent=String(p.kills).padStart(2,'0');
    $('#aim-cursor').classList.toggle('visible',c.capital&&p.turretMode==='manual'&&!state.helpOpen);
    p.targets.forEach((t,i)=>{let dist=$('#contact-dist-'+i),hp=$('#contact-hp-'+i);if(dist)dist.textContent=t.hp>0?(V.length(V.sub(t.pos,p.pos))*.008).toFixed(1)+' km':'失能';if(hp)hp.style.transform=`scaleX(${t.hp/100})`;});
    $$('.mount-dot').forEach((dot,i)=>{const t=p.turrets[i];dot.classList.toggle('ready',!!t?.aligned);dot.classList.toggle('firing',!!t&&t.cooldown>c.turretCooldown-.2);dot.style.display=t?'':'none';});
    $('#align-target').classList.toggle('active',p.align);$('#align-label').textContent=isAntimatter(state.shipIndex)?'自动追猎':(p.align?'正在对准':'舰艏对准');
  }
  function positionHUD(){
    if(!renderer)return;
    if(state.mode==='archive'){
      const show=state.highlight>0&&!state.transition&&!state.shipSwitch&&!state.helpOpen;$('#ship-annotation').classList.toggle('visible',show);
      if(show){const positions=isAntimatter(state.shipIndex)?{1:[-6.2,.1,0],2:[.45,.15,0],3:[6.05,0,.8]}:isFighter(state.shipIndex)?{1:[-2.8,1,-2.19],2:[-.99,-.63,1.13]}:{1:[-5,2.2,0],2:[-2,2.2,0],3:[4,2.2,0]};let point=renderer.project(M.transform(renderer.archiveModel||M.identity(),positions[state.highlight]||[0,2,0]));$('#ship-annotation').style.left=clamp(point.x-155,350,innerWidth-290)+'px';$('#ship-annotation').style.top=point.y-49+'px';}
    }else{
      let p=state.flight,t=p.targets[p.targetIndex];if(!t)return;
      const model=renderer.ownModel||shipMatrix(p,state.shipIndex),muzzle=M.transform(model,LAYOUTS[state.shipIndex].main[0]),bore=renderer.project(V.add(muzzle,V.scale(forward(),Math.max(300,V.length(V.sub(t.pos,p.pos))))));
      $('#bore-sight').style.left=bore.x+'px';$('#bore-sight').style.top=bore.y+'px';$('#bore-sight').style.opacity=bore.visible?'1':'0';
      $('#aim-cursor').style.left=mouseAim.x+'px';$('#aim-cursor').style.top=mouseAim.y+'px';
      const markerNodes=$$('#secondary-markers .secondary-contact');markerNodes.forEach((el,i)=>{const target=p.targets[i],pr=renderer.project(target.pos),show=i!==p.targetIndex&&target.hp>0&&pr.visible&&pr.x>240&&pr.x<innerWidth-250&&pr.y>120&&pr.y<innerHeight-110;el.style.display=show?'block':'none';el.style.left=pr.x+'px';el.style.top=pr.y+'px';});
      let point=renderer.project(t.pos),marker=$('#target-marker'),off=$('#offscreen-target'),distance=V.length(V.sub(t.pos,p.pos));
      let on=point.visible&&point.x>35&&point.x<innerWidth-65&&point.y>85&&point.y<innerHeight-150;
      marker.style.opacity=on?'1':'0';marker.style.pointerEvents=on?'auto':'none';off.style.display=on?'none':'block';
      if(on){let w=clamp(12500*t.scale/distance,58,260),h=clamp(w*.47,35,115);marker.style.width=w+'px';marker.style.height=h+'px';marker.style.left=point.x-w/2+'px';marker.style.top=point.y-h/2+'px';let label=marker.querySelector('.target-label');label.style.left=point.x+w/2+150>innerWidth-270?'auto':'calc(100% + 8px)';label.style.right=point.x+w/2+150>innerWidth-270?'calc(100% + 8px)':'auto';}
      else{let x=point.visible?point.x:innerWidth-point.x,y=point.visible?point.y:innerHeight-point.y;off.style.left=clamp(x,35,innerWidth-65)+'px';off.style.top=clamp(y,110,innerHeight-190)+'px';off.style.transform=`rotate(${Math.atan2(y-innerHeight*.47,x-innerWidth*.5)*180/Math.PI}deg)`}
      marker.classList.toggle('destroyed',t.hp<=0);$('#target-name').textContent=t.hp>0?t.name:'目标失能';$('#target-distance').textContent=(distance*.008).toFixed(1)+' km';$('#target-health-fill').style.width=t.hp+'%';
    }
  }

  function bindEvents(){
    $$('[data-inspect]').forEach(button=>button.addEventListener('click',()=>{
      const views={hero:[.82,.5],top:[.0001,1.565],side:[0,0],rear:[-Math.PI/2,.06],bottom:[.82,-.64]};
      const v=views[button.dataset.inspect];if(!v||state.mode!=='archive'||state.transition)return;
      state.autoRotate=false;$('#autorotate').setAttribute('aria-pressed','false');
      Object.assign(state.orbit,{targetYaw:v[0],targetPitch:v[1],targetDistance:ARCHIVE_DISTANCES[state.shipIndex]});
      $$('[data-inspect]').forEach(b=>b.classList.toggle('active',b===button));
    }));
    $$('[data-combat-ship]').forEach(b=>b.addEventListener('click',()=>switchCombatHull(+b.dataset.combatShip)));
    $$('[data-turret-mode]').forEach(b=>b.addEventListener('click',()=>setTurretMode(b.dataset.turretMode)));
    $('#system-turret').addEventListener('click',cycleTurretMode);$('#align-target').addEventListener('click',alignTarget);
    $('#fire-salvo').addEventListener('click',fireMissile);$('#fire-spinal').addEventListener('click',fireMain);
    $('#reset-observer').addEventListener('click',()=>{state.flight.orbitYaw=0;state.flight.orbitPitch=0;state.flight.cameraZoom=1;});
    $('#prev-ship').addEventListener('click',()=>selectShip(state.shipIndex-1));$('#next-ship').addEventListener('click',()=>selectShip(state.shipIndex+1));
    $('#autorotate').addEventListener('click',()=>{state.autoRotate=!state.autoRotate;$('#autorotate').setAttribute('aria-pressed',String(state.autoRotate));tone()});
    $('#wireframe').addEventListener('click',()=>{state.wireframe=!state.wireframe;$('#wireframe').setAttribute('aria-pressed',String(state.wireframe));tone()});$('#reset-camera').addEventListener('click',resetCamera);
    $('#deploy').addEventListener('click',()=>transitionTo('flight'));$('#exit-flight').addEventListener('click',()=>transitionTo('archive'));
    $('#main-gun-label').addEventListener('click',fireMain);$('#system-gun').addEventListener('click',fireMain);$('#missile-label').addEventListener('click',fireMissile);$('#system-missile').addEventListener('click',fireMissile);
    $('#system-engine').addEventListener('click',()=>{if(isAntimatter(state.shipIndex)){notice('突防推进已自动接管');return;}state.flight.boost=!state.flight.boost;notice(state.flight.boost?'持续加速已开启':'已恢复巡航推力');tone()});
    $('#throttle-plus').addEventListener('click',()=>{if(isAntimatter(state.shipIndex))return;state.flight.throttle=clamp(state.flight.throttle+10,0,100);tone()});$('#throttle-minus').addEventListener('click',()=>{if(isAntimatter(state.shipIndex))return;state.flight.throttle=clamp(state.flight.throttle-10,0,100);tone()});
    $('#toggle-ai').addEventListener('click',()=>setAI(!state.flight.ai));$('#change-view').addEventListener('click',setView);$('#target-marker').addEventListener('click',cycleTarget);
    $('#location-button').addEventListener('click',()=>setTab(state.activeTab==='planet'?'fleet':'planet'));
    $$('#main-nav button').forEach(b=>b.addEventListener('click',()=>setTab(state.activeTab===b.dataset.tab?'fleet':b.dataset.tab)));$('#close-sheet').addEventListener('click',()=>setTab('fleet'));
    $$('[data-help]').forEach(b=>b.addEventListener('click',()=>setHelp(true)));$('#close-help').addEventListener('click',()=>setHelp(false));$('#help-modal').addEventListener('click',e=>{if(e.target===$('#help-modal'))setHelp(false)});
    $$('.sound-toggle').forEach(b=>b.addEventListener('click',toggleSound));
    const canvas=$('#scene');canvas.addEventListener('pointerdown',e=>{if(state.helpOpen||state.transition)return;if(state.activeTab!=='fleet')setTab('fleet');activePointer={id:e.pointerId,x:e.clientX,y:e.clientY,button:e.button,moved:0};canvas.setPointerCapture(e.pointerId);if(state.mode==='flight'&&e.button===0){mouseDown=true;if(state.flight.profile.capital&&state.flight.turretMode==='manual')fireTurrets();else fireMain()}if(state.mode==='archive')state.autoRotate=false;$('#autorotate').setAttribute('aria-pressed',String(state.autoRotate));});
    canvas.addEventListener('pointermove',e=>{mouseAim={x:e.clientX,y:e.clientY};if(!activePointer||state.helpOpen||state.transition)return;let dx=e.clientX-activePointer.x,dy=e.clientY-activePointer.y;activePointer.x=e.clientX;activePointer.y=e.clientY;activePointer.moved+=Math.abs(dx)+Math.abs(dy);if(state.mode==='archive'){state.orbit.targetYaw+=dx*.006;state.orbit.targetPitch=clamp(state.orbit.targetPitch+dy*.0045,-.46,1.3)}else if(activePointer.button===2&&!isAntimatter(state.shipIndex)){const p=state.flight;p.ai=false;p.align=false;p.yawTarget+=dx*.0032;p.pitchTarget=clamp(p.pitchTarget-dy*.0032,-1.2,1.2);$('#ai-indicator').classList.remove('visible');$('#toggle-ai').setAttribute('aria-pressed','false');$('#ai-label').textContent='自动驾驶'}else if(activePointer.button===1&&state.flight.external){state.flight.orbitYaw+=dx*.006;state.flight.orbitPitch=clamp(state.flight.orbitPitch+dy*.004,-.26,.75)}});
    const release=()=>{activePointer=null;mouseDown=false};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
    canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('wheel',e=>{e.preventDefault();if(state.helpOpen||state.transition)return;if(state.mode==='archive')state.orbit.targetDistance=clamp(state.orbit.targetDistance+e.deltaY*.016,14,38);else if(e.ctrlKey&&state.flight.external)state.flight.cameraZoom=clamp(state.flight.cameraZoom+e.deltaY*.001,.7,1.6);else if(!isAntimatter(state.shipIndex))state.flight.throttle=clamp(state.flight.throttle-e.deltaY*.025,0,100)},{passive:false});
    window.addEventListener('keydown',e=>{
      if(e.ctrlKey||e.metaKey||e.altKey)return;
      if(state.helpOpen){if(e.code==='Escape'||e.code==='KeyH'){e.preventDefault();setHelp(false)}if(e.code==='Tab'){e.preventDefault();$('#close-help').focus()}return}
      if(e.code==='KeyH'&&!e.repeat){e.preventDefault();setHelp(true);return}if(e.code==='KeyM'&&!e.repeat){toggleSound();return}if(state.transition)return;
      if(e.code==='Escape'){e.preventDefault();if(state.activeTab!=='fleet'){setTab('fleet');return}if(state.mode==='flight')transitionTo('archive');else resetCamera();return}
      if(state.mode==='archive'){if(e.repeat)return;if(e.code==='ArrowRight'){e.preventDefault();selectShip(state.shipIndex+1)}else if(e.code==='ArrowLeft'){e.preventDefault();selectShip(state.shipIndex-1)}else if(e.code==='KeyF'){e.preventDefault();transitionTo('flight')}}
      else{
        const handled=['KeyW','KeyS','KeyA','KeyD','KeyQ','KeyE','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','ShiftLeft','ShiftRight','Space'];if(handled.includes(e.code)){e.preventDefault();keys.add(e.code);if(e.code==='Space'&&!e.repeat)fireMain()}
        if(!e.repeat){if(e.code==='KeyR')fireMissile();if(e.code==='KeyT')cycleTarget();if(e.code==='KeyV')setView();if(e.code==='KeyG')setAI(!state.flight.ai);if(e.code==='KeyX')alignTarget();if(e.code==='KeyL')cycleTurretMode();if(e.code==='Digit1')switchCombatHull(3);if(e.code==='Digit2')switchCombatHull(0);if(e.code==='Digit3')switchCombatHull(4);if(e.code==='Digit4')switchCombatHull(5);if(e.code==='KeyC'){state.flight.orbitYaw=0;state.flight.orbitPitch=0;state.flight.cameraZoom=1;}}
      }
    });
    window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();mouseDown=false;activePointer=null});document.addEventListener('visibilitychange',()=>{keys.clear();mouseDown=false;lastTime=0});window.addEventListener('resize',()=>{renderer?.resize();moveNavIndicator()});
  }
  function frame(now){
    const rawDt=lastTime?(now-lastTime)/1000:.016,dt=Math.min(rawDt,.05);lastTime=now;state.frames++;
    updateTransition(now);updateJobs(document.hidden?0:Math.min(rawDt,1));
    if(state.shipSwitch){let t=state.shipSwitch;t.progress=clamp((now-t.start)/(reduced?200:CONFIG.shipSwitchMs),0,1);if(t.progress>=.5&&!t.swapped){state.shipIndex=t.to;t.swapped=true;state.orbit.targetDistance=ARCHIVE_DISTANCES[state.shipIndex];renderShipData();if(state.activeTab!=='fleet')renderSheet();$$('.ship-title h1,.ship-code,.ship-sidebar').forEach(el=>{el.classList.remove('data-switching');el.classList.add('data-entering')})}if(t.progress>=1)state.shipSwitch=null;}
    let o=state.orbit;if(state.autoRotate&&!state.helpOpen&&!activePointer)o.targetYaw+=dt*.11;let smooth=1-Math.exp(-dt*9);o.yaw=mix(o.yaw,o.targetYaw,smooth);o.pitch=mix(o.pitch,o.targetPitch,smooth);o.distance=mix(o.distance,o.targetDistance,smooth);
    if(state.mode==='flight'&&!state.transition&&!state.helpOpen&&!state.hudPaused&&!document.hidden)updateFlight(dt);
    window.CommandHUD?.beforeFrame(dt);
    if(renderer){state.mode==='archive'?renderer.archive(state,now/1000):renderer.flight(state,now/1000);positionHUD()}
    window.CommandHUD?.afterFrame(now);
    hudAccumulator+=dt;if(hudAccumulator>.065){hudAccumulator=0;if(state.mode==='flight')updateHUD()}
    requestAnimationFrame(frame);
  }

  renderShipData();setupInstruments();bindEvents();addLog('舰船档案已载入 · 虚拟演练不影响实际战果');$('#message-dot').classList.remove('visible');requestAnimationFrame(moveNavIndicator);
  try{renderer=new Renderer($('#scene'));configureFlight(3,true);screenVisible('archive');document.documentElement.dataset.ready='true';requestAnimationFrame(frame)}catch(error){console.error(error);$('#no-webgl').hidden=false;$('#webgl-error').textContent=String(error.message||error)}
  // Read-only-by-convention debug surface; useful for integration and automated UI tests.
  window.GalacticDemo={stepSimulation:dt=>updateFlight(dt),configureFlight,screenVisible,selectTarget,cycleTarget,fireTurrets,damageTarget,clearControls:()=>{keys.clear();mouseDown=false;activePointer=null;},state,renderer,ships:SHIPS,config:CONFIG,enterFlight:()=>transitionTo('flight'),returnArchive:()=>transitionTo('archive'),selectShip,fireMain,fireMissile,setAI,setHelp,setTab,setView,switchCombatHull,setTurretMode,alignTarget,profiles:COMBAT};
})();

