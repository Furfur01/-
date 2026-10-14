
/*
 * GALACTIC IMPERIUM — capital-ship combat interface prototype
 * Edit SHIPS for displayed values, CONFIG for animation and movement settings.
 * All game data is deliberately local to this tab. No accounts, services or storage.
 */
'use strict';
(() => {
  const {Renderer,V,M,clamp,mix,seeded,LAYOUTS,axes,shipMatrix,turretTransforms,jointTransforms}=GalaxyRender;
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const CONFIG={transitionMs:1550,shipSwitchMs:560,maxSpeed:214,mainCooldown:.34,missileCooldown:4,constructionSeconds:5,researchSeconds:4};
  const SHIPS=[
    {name:'驱逐舰',en:'DESTROYER',code:'D-06',serial:'06',count:6,stats:[11000,500,2000,5000,2000,1000],levels:[6,4,8]},
    {name:'巡洋舰',en:'CRUISER',code:'C-03',serial:'03',count:3,stats:[24000,1400,4200,3600,4500,1800],levels:[8,6,9]},
    {name:'护卫舰',en:'FRIGATE',code:'F-12',serial:'12',count:12,stats:[4500,300,950,8200,800,450],levels:[4,3,6]},
    {name:'重装战机',en:'HEAVY FIGHTER',code:'HF-01',serial:'01',count:24,stats:[900,220,760,15000,24,96],levels:[6,4,2]},
    {name:'重型战列舰',en:'BATTLESHIP',code:'BB-01',serial:'01',count:1,stats:[68000,9600,18500,2200,14000,4800],levels:[10,9,10]}
  ];
  [{"name":"驱逐舰","count":0,"stats":[11000,500,2000,5000,2000,1000],"levels":[0],"weapons":[["双等离子大炮","等离子科技","PLASMA",0]]},{"name":"巡洋舰","count":0,"stats":[2700,50,400,15000,800,300],"levels":[0],"weapons":[["离子炮","离子科技","ION",0]]},{"name":"战列舰","count":0,"stats":[6000,200,1000,10000,1500,250],"levels":[0],"weapons":[["重型舰炮","武器科技","SHELL",0]]},{"name":"重型战机","count":0,"stats":[1000,25,150,10000,100,75],"levels":[0],"weapons":[["重型激光炮","激光科技","LASER",0]]},{"name":"无畏舰","count":0,"stats":[7000,400,700,10000,750,250],"levels":[0],"weapons":[["前置双激光炮","激光科技","LASER",0]]}].forEach((data,i)=>Object.assign(SHIPS[i],data));
  SHIPS.splice(0,SHIPS.length,...window.FlightFleet.ships);
  const STAT_LABELS=['护甲','护盾','攻击','基础速度','货舱容量','燃料消耗'];
  const WEAPONS=[['主炮试射','主炮演练','SPINAL DEMO'],['导弹试射','导弹演练','MISSILE DEMO'],['炮塔试射','炮塔演练','TURRET DEMO']];
  const LOCATIONS=[{name:'母星',coords:'1:16:3',orbit:'母星近地轨道',en:'HOMEWORLD',description:'舰队主港。为当前舰船提供维护、补给和虚拟战报演练。'},{name:'前哨',coords:'1:16:4',orbit:'前哨近地轨道',en:'OUTPOST',description:'外层轨道前哨。可设为当前演练区域，进行舰船系统测试。'}];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state={mode:'archive',shipIndex:1,transition:null,shipSwitch:null,wireframe:false,autoRotate:false,highlight:-10,activeTab:'fleet',location:0,helpOpen:false,sound:false,logs:[],job:null,research:null,frames:0,
    orbit:{yaw:.82,pitch:.5,distance:35,targetYaw:.82,targetPitch:.5,targetDistance:35},
    flight:{pos:[0,0,0],yaw:0,pitch:0,roll:0,throttle:60,speed:128,boost:false,ai:false,external:false,shield:82,hull:96,gunCooldown:0,missileCooldown:0,targetIndex:0,targets:[],projectiles:[],particles:[],elapsed:0,enemyAttack:7,kills:0}
  };
  let renderer=null,lastTime=0,hudAccumulator=0,toastTimer,noticeTimer,hitTimer,damageTimer,audio=null,lastFocused=null,activePointer=null,mouseDown=false;
  const keys=new Set(),rnd=seeded(4982);
  const fmt=n=>n==null?'待取得':Math.round(n).toLocaleString('en-US');
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const forward=()=>{let p=state.flight;return[Math.sin(p.yaw)*Math.cos(p.pitch),Math.sin(p.pitch),-Math.cos(p.yaw)*Math.cos(p.pitch)]};


  const COMBAT = [
    {role:'驱逐舰',className:'苍隼级 / DD-06',length:'224 m',maxSpeed:135,turnRate:.3,turnResponse:3.1,accel:.48,chargeTime:.8,mainCooldown:3.8,mainDamage:52,beamWidth:.24,salvo:4,missileCooldown:6,missileCapacity:24,missileDamage:9,turretDamage:.42,turretCooldown:1.0,capital:true},
    {role:'巡洋舰',className:'远征级 / CA-03',length:'320 m',maxSpeed:98,turnRate:.22,turnResponse:2.6,accel:.35,chargeTime:.95,mainCooldown:4.6,mainDamage:65,beamWidth:.34,salvo:6,missileCooldown:7,missileCapacity:36,missileDamage:9,turretDamage:.34,turretCooldown:1.1,capital:true},
    {role:'护卫舰',className:'游隼级 / FF-12',length:'96 m',maxSpeed:215,turnRate:.64,turnResponse:4,accel:.85,chargeTime:0,mainCooldown:.22,mainDamage:5,beamWidth:.1,salvo:2,missileCooldown:4,missileCapacity:12,missileDamage:16,turretDamage:0,turretCooldown:1,capital:false},
    {role:'重装战机',className:'HF-01 / HEAVY FIGHTER',length:'38 m',maxSpeed:345,turnRate:1.18,turnResponse:7.2,accel:1.45,chargeTime:0,mainCooldown:.15,mainDamage:4.2,beamWidth:.085,salvo:2,missileCooldown:3.6,missileCapacity:8,missileDamage:19,turretDamage:0,turretCooldown:1,capital:false},
    {role:'重型战列舰',className:'玄武级 / BB-01',length:'560 m',maxSpeed:72,turnRate:.145,turnResponse:1.8,accel:.23,chargeTime:1.15,mainCooldown:5.4,mainDamage:82,beamWidth:.58,salvo:8,missileCooldown:8,missileCapacity:48,missileDamage:7,turretDamage:.3,turretCooldown:1.25,capital:true}
  ];
  COMBAT.forEach((c,i)=>{c.spinal=[true,false,false,false,false][i];c.fixedPrimary=[true,false,false,true,true][i];c.primaryName=["双等离子大炮","双联离子炮","低矮舰炮分组齐射","固定重型激光炮","前置双激光炮"][i];c.role=["驱逐舰","巡洋舰","战列舰","重型战机","无畏舰"][i];});
  COMBAT[2].capital=true;COMBAT[2].turretDamage=.42;
  COMBAT.splice(0,COMBAT.length,...window.FlightFleet.profiles);
  const shortAngle = a=>Math.atan2(Math.sin(a),Math.cos(a));
  const mixExp = (a,b,rate,dt)=>mix(a,b,1-Math.exp(-rate*dt));
  let mouseAim={x:innerWidth*.5,y:innerHeight*.47};
function missileTargetValid(q,flight){
  const t=q.target;if(!t||t.intercepted)return false;
  if(q.hostile)return t===flight&&flight.hull>0;
  if(t===flight)return false;
  if(t.missile)return !!q.defensive&&!!t.hostile&&t.age<t.life&&flight.projectiles.includes(t);
  return t.hp>0&&flight.targets.includes(t);
}
function missileGuidance(q,dt){
  const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),norm=a=>{const n=Math.hypot(...a)||1;return a.map(v=>v/n);};
  const r=sub(q.target.pos,q.pos),velocity=q.target.velocity||[0,0,0],distance=Math.hypot(...r),speed=q.hostile?230:460;
  const a=dot(velocity,velocity)-speed*speed,b=2*dot(r,velocity),c=dot(r,r),disc=b*b-4*a*c;
  const roots=Math.abs(a)<1e-8?(b<0?[-c/b]:[]):disc>=0?[(-b-Math.sqrt(disc))/(2*a),(-b+Math.sqrt(disc))/(2*a)]:[];
  const times=roots.filter(t=>t>0),lead=times.length?Math.min(2,Math.min(...times)):0;
  const desired=norm(r.map((v,i)=>v+velocity[i]*lead)),current=norm(q.velocity),cos=Math.max(-1,Math.min(1,dot(current,desired))),angle=Math.acos(cos),turn=Math.min(angle,dt*5);
  let direction;
  if(angle<1e-6)direction=desired;
  else if(Math.PI-angle<1e-4){const axis=norm(Math.abs(current[1])<.9?[current[2],0,-current[0]]:[0,-current[2],current[1]]);direction=current.map((v,i)=>v*Math.cos(turn)+axis[i]*Math.sin(turn));}
  else {const u=turn/angle;direction=norm(current.map((v,i)=>(v*Math.sin((1-u)*angle)+desired[i]*Math.sin(u*angle))/Math.sin(angle)));}
  const acceleration=Math.min(speed,70+q.age*300),approach=Math.min(acceleration,Math.max(65,Math.hypot(...velocity)+distance*4)),thrust=approach*Math.max(.35,Math.cos(angle));
  q.velocity=direction.map(v=>v*thrust);
  q.diverging=distance<35&&q.lastDistance!==undefined&&distance>q.lastDistance+.02?(q.diverging||0)+dt:0;q.lastDistance=distance;
  return q.diverging<.6;
}
function segmentEllipsoidHit(start,end,center,half){
  const p=start.map((v,i)=>(v-center[i])/half[i]),d=end.map((v,i)=>(v-start[i])/half[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  const a=dot(d,d),u=a?Math.max(0,Math.min(1,-dot(p,d)/a)):0;
  return dot(p.map((v,i)=>v+d[i]*u),p.map((v,i)=>v+d[i]*u))<=1;
}
function orbitDrag(yaw,pitch,dx,dy){return {yaw:yaw-dx*.006,pitch:Math.max(-.26,Math.min(.75,pitch-dy*.004))};}
  function selectedTarget(){return state.flight.targets[state.flight.targetIndex]}
  function deathActive(){return !window.createFlightController&&state.sceneIndex===4;}
  const deathDetailCache=new Map();
  let deathWasActive=false;
  function deathBoxes(a,b=a){const map=new Map(),steps=Math.max(1,Math.min(24,Math.ceil(V.length(V.sub(b,a))/200)));for(let i=0;i<=steps;i++){const eye=a.map((v,k)=>v+(b[k]-v)*i/steps),key=eye.map(v=>Math.floor(v/8)).join(':');let boxes=deathDetailCache.get(key);if(!boxes){boxes=DeathStarTerrain.localMachinery(eye);deathDetailCache.set(key,boxes);if(deathDetailCache.size>64)deathDetailCache.delete(deathDetailCache.keys().next().value);}for(const box of boxes)map.set(box.id,box);}return [...map.values()];}
  function deathLocate(name='trench',reset=false){
    if(!deathActive()||!renderer)return;
    if(state.flight.deathFailed&&!reset&&name!=='overview'){notice('请先重置演练');return;}
    const p=state.flight,place=DeathStarTerrain.landmark(name),dir=V.norm(V.sub(place.look,place.pos));
    if(reset||!p.targets.some(t=>t.terrainTurret)){p.targets=DeathStarTerrain.createTurrets();p.targetIndex=0;p.kills=0;p.shield=100;p.hull=100;}
    Object.assign(p,{pos:place.pos,yaw:Math.atan2(dir[0],-dir[2]),pitch:Math.asin(dir[1]),roll:0,velocity:[0,0,0],throttle:0,speed:0,yawVelocity:0,pitchVelocity:0,ai:false,align:false,charging:false,boost:false,boostActive:false,projectiles:[],beams:[],particles:[],salvoQueue:[],missileLock:null,missileLockTime:0,weaponImpacts:[],external:true,cameraBlend:1,cameraZoom:1,orbitYaw:0,orbitPitch:0});
    p.yawTarget=p.yaw;p.pitchTarget=p.pitch;p.deathFailed=false;p.deathOverview=!!place.overview;p.deathLocation=name;p.enemyAttack=Infinity;
    p.terrainProjectile=deathProjectile;
    keys.clear();mouseDown=false;document.body.classList.toggle('death-overview',p.deathOverview);
    $('#death-status').textContent=p.deathOverview?'全景观察 · 拖动旋转 · 滚轮缩放 · 选择定位入口开始驾驶':'W / S 油门 · 右键转向 · Space 开火 · V 切换视角';
    renderContacts();updateHUD();
  }
  function deathSelection(id){
    const active=id==='death-star'&&!window.createFlightController;$('#death-controls').hidden=!active;
    document.body.classList.toggle('death-scene',active);
    if(!renderer)return;
    if(active){deathWasActive=true;configureFlight(SHIPS.findIndex(s=>s.id==='Light_Fighter'),true);deathLocate('trench',true);}
    else if(deathWasActive){deathWasActive=false;renderer.deathTerrain?.dispose();renderer.deathTerrain=null;renderer.deathRelativeVP=null;renderer.gl.depthRange(0,1);deathDetailCache.clear();document.body.classList.remove('death-overview');delete state.flight.deathOverview;delete state.flight.deathFailed;delete state.flight.terrainProjectile;configureFlight(state.shipIndex,true);}
  }
  function deathFail(){const p=state.flight;if(p.deathFailed)return;p.deathFailed=true;p.speed=p.throttle=0;p.velocity=[0,0,0];p.charging=false;p.projectiles=[];p.beams=[];p.salvoQueue=[];$('#death-status').textContent='演练失败 · 点击「重置演练」返回入口';notice('撞击死星实体 · 演练结束');}
  function deathTick(dt){
    const p=state.flight;
    if(p.deathOverview||p.deathFailed){updateCamera(dt);return false;}
    p.deathPrevious=p.pos.slice();p.enemyAttack=Infinity;
    for(const t of p.targets){t.cooldown-=dt;if(t.cooldown<=0&&DeathStarTerrain.turretCanFire(t,p.pos,deathBoxes(t.pos,p.pos))){t.cooldown=2;const aim=V.add(p.pos,V.scale(p.velocity,V.length(V.sub(t.pos,p.pos))/210));p.projectiles.push({pos:t.pos.slice(),previous:t.pos.slice(),velocity:V.scale(V.norm(V.sub(aim,t.pos)),210),age:0,life:4,hostile:true,damage:5,color:[1,.32,.08],kind:'shell'});renderer.weaponImpact(p,t.pos,{muzzle:true,color:[1,.3,.08]});}}
    return true;
  }
  function deathAfterMove(){
    const p=state.flight,hit=DeathStarTerrain.segmentHit(p.deathPrevious,p.pos,Math.max(.5,LAYOUTS[state.shipIndex].length*.5),[...deathBoxes(p.deathPrevious,p.pos),...p.targets.map(DeathStarTerrain.turretObstacle)]);
    if(hit!==null){p.pos=p.deathPrevious.map((v,i)=>v+(p.pos[i]-v)*Math.max(0,hit-.001));deathFail();return false;}return true;
  }
  function deathProjectile(q){
    const p=state.flight,boxes=deathBoxes(q.previous,q.pos);
    const frame=axes(p),local=point=>{const delta=V.sub(point,p.pos);return [-V.dot(delta,frame.forward),V.dot(delta,frame.up),-V.dot(delta,frame.right)];};
    const targetHit=(a,b,t)=>t===p?DeathStarTerrain.ellipsoidContact(local(a),local(b),LAYOUTS[state.shipIndex].bounds.center,LAYOUTS[state.shipIndex].bounds.half):hitSegment(a,b,t);
    const hit=DeathStarTerrain.nearestContact(q.previous,q.pos,q.hostile?[p]:p.targets,targetHit,boxes);
    if(!hit)return false;
    q.pos=hit.point;renderer.weaponImpact(p,q.pos,{color:q.color||[1,.5,.15],visual:q.visual});burst(q.pos,12,q.color||[1,.5,.15],.4,10);
    if(hit.target===p){let damage=q.damage||5,absorbed=Math.min(p.shield,damage);p.shield-=absorbed;p.hull=Math.max(0,p.hull-damage+absorbed);p.shieldRegenDelay=4;p.shake=.16;if(p.hull<=0)deathFail();}
    else if(hit.target)damageTarget(hit.target,q.damage,q.pos);
    return true;
  }
  function deathBeam(start,end,damage,color,width){
    const p=state.flight,hit=DeathStarTerrain.nearestContact(start,end,p.targets,hitSegment,deathBoxes(start,end));
    if(hit){end=hit.point;if(hit.target)damageTarget(hit.target,damage,end);renderer.weaponImpact(p,end,{color});burst(end,12,color,.4,10);}
    p.beams.push({start,end,age:0,life:.15,width,color});
  }

  function configureFlight(index,reset=false){
    const p=state.flight,c=COMBAT[index],l=LAYOUTS[index];state.shipIndex=index;
    const keepView=reset?(c.capital):(p.external);
    Object.assign(p,{profile:c,external:keepView,cameraBlend:keepView?1:0,cameraVelocity:0,cameraZoom:1,orbitYaw:0,orbitPitch:0,
      yawTarget:p.yaw,pitchTarget:p.pitch,yawVelocity:0,pitchVelocity:0,velocity:[0,0,0],align:false,
      charging:false,charge:0,gunCooldown:0,missileCooldown:0,missileStock:c.missileCapacity,restock:0,
      specialBlasts:[],assault:null,detonated:null,reaperCut:null,blastHits:0,shieldHits:[],shieldRegenDelay:0,missileLock:null,missileLockTime:0,salvoQueue:[],beams:[],projectiles:[],particles:[],shake:0,boresightError:0,turretMode:'auto',turretHeat:0,
      turretShots:0,mainShots:0,missilesFired:0,boost:false,boostActive:false});
    p.joints=l.joints.map(t=>({...t,yaw:0,pitch:0,cooldown:.4,aligned:false,inArc:false}));
    p.turrets=p.joints.filter(t=>t.role==='pd');p.turrets.forEach((t,i)=>t.index=i);
    if(reset){p.pos=[0,0,0];p.yaw=p.pitch=p.roll=p.yawTarget=p.pitchTarget=0;p.throttle=c.capital?26:40;p.speed=p.throttle*c.maxSpeed/100;p.shield=SHIPS[index].stats[1]>0?100:0;p.hull=100;p.elapsed=0;p.enemyAttack=8;p.kills=0;p.ai=false;createTargets();}
    if(c.special==='reaper'&&reset)p.shield=c.trialShield;
    if(c.special==='antimatter'){p.shield=0;p.external=true;p.cameraBlend=1;}
    p.throttle=clamp(p.throttle,0,100);p.speed=Math.min(p.speed,c.maxSpeed);p.velocity=V.scale(forward(),p.speed*.125);
    renderShipData();syncCombatUI();updateHUD();if(deathActive()&&reset)deathLocate("trench",true);
  }
  function syncCombatUI(){
    const p=state.flight,c=p.profile;if(!c)return;
    document.body.classList.toggle('is-capital',c.capital);document.body.classList.toggle('is-fighter',!c.capital);
    document.body.classList.toggle('is-external',p.external);
    $('#combat-ship-name').textContent=c.role;$('#combat-ship-code').textContent=c.className;
    $('#combat-length').textContent=c.length;$('#weapon-primary-name').textContent=c.capital?c.primaryName:(state.shipIndex===3?'固定机炮':'双联机炮');
    $('#weapon-missile-name').textContent=c.capital?'导弹阵列':'追踪导弹';$('#fire-spinal > span:nth-child(2)').innerHTML=c.fixedPrimary?c.primaryName+'<small>前置固定炮口</small>':'炮塔齐射<small>依照各炮座射界</small>';
    $('#loadout-caption').textContent=LAYOUTS[state.shipIndex].main.length+' 个主炮口 · '+LAYOUTS[state.shipIndex].tubes.length+' 个导弹口 · '+LAYOUTS[state.shipIndex].mounts.length+' 座近防炮 · '+LAYOUTS[state.shipIndex].joints.filter(t=>t.role==='secondary').length+' 座旋转副炮（近防 800 m / 仅战机与导弹 / 拦截 0.1%）';
    $('#weapon-primary-name').textContent=c.primaryName;
    $('#system-engine > span:nth-child(2)').textContent=LAYOUTS[state.shipIndex].propulsion.name;
    $('#fire-salvo').disabled=!c.salvo;$('#fire-spinal').disabled=c.primaryKind==='none';
    $('#flight-input-copy').textContent='右键转向 · W/S 油门 · Space 主炮 · R 导弹 · V 舰桥/追踪 · X 对准目标';
    $('#system-turret').hidden=!c.capital;$('#turret-controls').hidden=!c.capital;$('#director').hidden=!c.capital;
    $('#view-label').textContent=p.external?(c.capital?'进入舰桥':'进入驾驶舱'):'外部追踪';
    $('#camera-mode').textContent=p.external?'外部追踪':(c.capital?'舰桥视角':'驾驶舱');
    $('#flight-input-copy').textContent=c.capital?'右键拖动转向　W / S 油门　Space '+c.primaryName+'　R 导弹齐射':'右键拖动转向　W / S 油门　左键 / Space 机炮　R 导弹';
    if(c.special){
      $('#loadout-caption').textContent=c.special==='antimatter'?'无人一次性弹体 · 无炮塔 · 无驾驶舱 · 范围伤害忽略护盾 / 收割者免疫':'原创演练配置 · 双束相位切割 · 护盾回收 · 2 座副炮 / 2 座近防 / 4 个导弹口';
      $('#fire-spinal > span:nth-child(2)').innerHTML=c.special==='antimatter'?'自行突击<small>先锁定目标 · 弹体接近引爆</small>':'相位收割<small>蓄能 1.1 秒 · 持续切割</small>';
      $('#change-view').hidden=c.special==='antimatter';
    }else $('#change-view').hidden=false;
    $$('[data-combat-ship]').forEach(b=>{let active=+b.dataset.combatShip===state.shipIndex;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    $$('[data-turret-mode]').forEach(b=>{let active=b.dataset.turretMode===p.turretMode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    $('#toggle-ai').setAttribute('aria-pressed',String(p.ai));$('#ai-label').textContent=p.ai?'取回控制':'自动驾驶';$('#ai-indicator').classList.toggle('visible',p.ai);
    $('#align-target').classList.toggle('active',p.align);$('#align-label').textContent=p.align?'正在对准':'舰艏对准';
    renderContacts();
  }
  function renderContacts(){$('.contacts h2 small').textContent=String(state.flight.targets.length).padStart(2,'0');
    $('#contact-list').innerHTML=state.flight.targets.map((t,i)=>`<button class="contact-row ${i===state.flight.targetIndex?'active':''}" data-contact="${i}"><span class="contact-diamond">◇</span><span><strong>${t.name}</strong><small>${t.code}</small></span><span class="contact-distance" id="contact-dist-${i}">—</span><i class="contact-health" id="contact-hp-${i}"></i></button>`).join('');
    $$('[data-contact]').forEach(b=>b.addEventListener('click',()=>selectTarget(+b.dataset.contact)));
  }
  function selectTarget(index){
    let p=state.flight;p.targetIndex=index;p.missileLock=p.targets[index];p.missileLockTime=0;$$('[data-contact]').forEach(b=>b.classList.toggle('active',+b.dataset.contact===index));
    notice('锁定 '+selectedTarget().name+' · X 舰艏对准');tone();
  }
  function switchCombatHull(index){
    if(globalThis.flightController){void globalThis.flightController.chooseType(SHIPS[index]?.id);return;}
    if(state.transition||state.helpOpen||state.mode!=='flight'||state.shipIndex===index)return;
    state.transition={to:'flight',start:performance.now(),progress:0,swapped:false,combatIndex:index,duration:1000};
    $('#flight').classList.add('leaving');$('#transition-text').textContent='接管'+COMBAT[index].role;$('#transition-sub').textContent=SHIPS[index].en+' / CONTROL TRANSFER';
    $('#transition-curtain').classList.add('active');$('#transition-curtain').style.pointerEvents='auto';keys.clear();mouseDown=false;tone('enter');
  }
  function setTurretMode(mode){if(globalThis.flightController){notice('正式战场的自动炮塔与近防持续工作');return;}
    const p=state.flight;if(!p.profile.capital)return;p.turretMode=mode;syncCombatUI();
    notice(mode==='auto'?'炮塔自动追踪当前目标':mode==='manual'?'移动鼠标瞄准 · 按住左键开炮':'炮塔已停火');tone();
  }
  function cycleTurretMode(){const modes=['auto','manual','hold'];setTurretMode(modes[(modes.indexOf(state.flight.turretMode)+1)%3]);}
  function alignTarget(){const p=state.flight;p.align=!p.align;if(p.align)p.ai=false;syncCombatUI();notice(p.align?'调整舰艏航向 · 仍可切换视角与操作武器':'取消舰艏对准');}

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
    let ship=SHIPS[state.shipIndex];const displayWeapons=ship.weapons||[];$('#ship-name').textContent=ship.name;$('#ship-code').textContent=`${ship.en} / ${ship.serial}`;$('#model-class').textContent=`DEEP SPACE / ${ship.code}`;
    $('#stats-source').textContent=ship.statsSource?.startsWith('https:')?'基础参数：社区 Wiki · 版本待核对':ship.statsSource?.startsWith('research/')?'基础参数：用户截图':'基础参数：待取得';
    $('#ship-stats').innerHTML=STAT_LABELS.map((label,i)=>`<div><dt>${label}</dt><dd>${fmt(ship.stats[i])}</dd></div>`).join('');
    $('#weapon-list').innerHTML=displayWeapons.map(([name,tech,en,level],i)=>`<button class="weapon-row" data-weapon="${i+1}" title="查看${name}安装位置"><span>${name}</span><span class="weapon-tech">${tech}${level===null?'':'<b>Lv.'+level+'</b>'}</span></button>`).join('');
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
  function resetCamera(){$$('[data-inspect]').forEach(b=>b.classList.toggle('active',b.dataset.inspect==='hero'));Object.assign(state.orbit,{targetYaw:.82,targetPitch:.5,targetDistance:LAYOUTS[state.shipIndex].archiveDistance});state.autoRotate=false;$('#autorotate').setAttribute('aria-pressed','false');tone()}
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


function targetShieldCapacity(stats){
  const shield=Math.max(0,stats?.[1]||0),armour=Math.max(0,stats?.[0]||0);
  return shield>0?100*shield/(armour+shield):0;
}
  function createTargets(){
    const p=state.flight;
    p.targets=[
      {name:'叛军巡洋舰',code:'HOSTILE / C-19',kind:1,pos:[92,19,-570],scale:2.9,hp:100,respawn:0,heading:.23,velocity:[0,0,0],seed:0},
      {name:'导弹驱逐舰',code:'HOSTILE / D-04',kind:0,pos:[-195,55,-710],scale:2.5,hp:100,respawn:0,heading:-.48,velocity:[0,0,0],seed:1},
      {name:'侧翼护航舰',code:'HOSTILE / F-08',kind:2,pos:[330,64,-350],scale:2.2,hp:100,respawn:0,heading:.58,velocity:[0,0,0],seed:2}
    ];for(const t of p.targets){t.maxShield=targetShieldCapacity(SHIPS[t.kind].stats);t.shield=t.maxShield;t.shieldHits=[];}p.targetIndex=0;
  }
  function screenVisible(mode){
    state.mode=mode;document.body.className='mode-'+mode;if(mode==='flight')syncCombatUI();
    for(let name of['archive','flight']){let el=$('#'+name),show=name===mode;if(!show&&el.contains(document.activeElement))document.activeElement.blur();el.classList.toggle('visible',show);el.setAttribute('aria-hidden',String(!show));el.inert=!show;el.classList.remove('leaving');if(show){el.classList.add('entering');setTimeout(()=>el.classList.remove('entering'),1000)}}
    if(mode==='flight'){$('#nav-sheet').classList.remove('open');$('#nav-sheet').setAttribute('aria-hidden','true');$('#nav-sheet').inert=true;$('#ship-annotation').classList.remove('visible')}
  }
  function transitionTo(to){
    if(to==='archive'&&globalThis.flightController){globalThis.flightController.leave();return;}
    if(to==='archive'){location.assign('ships.html?ship='+encodeURIComponent(SHIPS[state.shipIndex].id));return;}
    if(state.transition||state.shipSwitch||state.helpOpen||state.mode===to||!renderer)return;
    if(to==='flight'){setTab('fleet');configureFlight(state.shipIndex,true);$('#transition-text').textContent='舰桥连接';$('#transition-sub').textContent='ESTABLISHING BRIDGE LINK';addLog('已接管'+SHIPS[state.shipIndex].name+'，开始虚拟战报演练');}
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
  function setAI(enabled){if(deathActive()){notice("死星演练使用手动驾驶");return;}if(globalThis.flightController){void globalThis.flightController.setAI(enabled);return;}state.flight.ai=enabled;$('#toggle-ai').setAttribute('aria-pressed',String(enabled));$('#ai-label').textContent=enabled?'取回控制':'自动驾驶';$('#ai-indicator').classList.toggle('visible',enabled);notice(enabled?'AI 已接管航向与武器':'已恢复手动驾驶');tone();addLog(enabled?'飞行控制已交还 AI':'已恢复手动驾驶')}

  function setView(){if(state.flight.profile.special==='antimatter')return;
    const p=state.flight;p.external=!p.external;
    // Changing the destination never resets the camera spring, flight, projectiles or charge.
    syncCombatUI();tone();
  }
  function cycleTarget(){const p=state.flight;selectTarget((p.targetIndex+1)%p.targets.length);}
  function canFire(){return !(deathActive()&&(state.flight.deathOverview||state.flight.deathFailed))&&state.mode==='flight'&&!state.transition&&!state.helpOpen;}
  function fireMain(){
    if(globalThis.flightController)return globalThis.flightController.fire('primary');
    if(state.flight.profile.special)return fireSpecial();
    const p=state.flight,c=p.profile;if(!canFire()||p.gunCooldown>0||p.charging)return false;
    if(!c.primaryKind){if(c.capital&&!c.fixedPrimary){fireTurrets();return true;}dischargeMain();return true;}
    if(c.primaryKind==='none'){notice('该旗舰仅配置自卫副炮与拦截导弹');return false;}
    if(c.primaryKind==='missile'){fireMissile();return true;}
    if(c.chargeTime>0){p.charging=true;p.charge=0;tone('charge');}else dischargeMain();return true;
  }
  // A segment / oriented ellipsoid intersection. Fast deterministic hit testing for the prototype.
  function hitSegment(a,b,t){
    if(t.hp<=0)return null;
    if(t.terrainTurret)return DeathStarTerrain.ellipsoidContact(a,b,t.pos,[5,5,5]);
    const transform=q=>{const v=V.sub(q,t.pos),co=Math.cos(t.heading||0),si=Math.sin(t.heading||0),b=LAYOUTS[t.kind].bounds;return[(co*v[0]-si*v[2]-b.center[0]*t.scale)/(t.scale*b.half[0]),(v[1]-b.center[1]*t.scale)/(t.scale*b.half[1]),(si*v[0]+co*v[2]-b.center[2]*t.scale)/(t.scale*b.half[2])];};
    const x=transform(a),d=V.sub(transform(b),x),A=V.dot(d,d),B=2*V.dot(x,d),C=V.dot(x,x)-1;
    if(C<=0)return 0;if(A<1e-12)return null;let discr=B*B-4*A*C;if(discr<0)return null;
    let f=(-B-Math.sqrt(discr))/(2*A);return f>=0&&f<=1?f:null;
  }
  function dischargeMain(){
    if(state.flight.profile.special){dischargeSpecial();return;}
    const p=state.flight,c=p.profile,layout=LAYOUTS[state.shipIndex],model=shipMatrix(p,state.shipIndex),f=forward();
    p.charging=false;p.charge=0;p.gunCooldown=c.mainCooldown;p.mainShots++;p.shake=Math.min(.35,c.relativeLength*.005);
    const main=p.joints.filter(t=>t.role==='main');
    const rays=main.length?main.filter(t=>t.aligned&&clearWeapon(t)).flatMap(t=>[weaponRay(t,0),weaponRay(t,1)]):layout.main.map(m=>({start:M.transform(model,m),dir:f}));
    if(!rays.length){p.gunCooldown=0;p.mainShots--;notice('主炮正在转向，或舰体遮挡射界');return;}
    for(const {start,dir:f} of rays){renderer.weaponImpact(p,start,{visual:c.visual,color:c.weaponColor,muzzle:true});burst(start,c.visual.capital?22:8,c.weaponColor,.18,c.visual.capital?10:4);
      if(c.visual.capital)p.beams.push({start,end:V.add(start,V.scale(f,c.visual.radius*5)),age:0,life:.18,width:c.visual.radius*1.6,color:c.weaponColor});
      if(c.beam&&deathActive()){deathBeam(start,V.add(start,V.scale(f,1800)),c.mainDamage/layout.main.length,c.weaponColor,c.beamWidth);continue;}
      if(c.beam){
        let end=V.add(start,V.scale(f,1800)),best=1,target=null;
        for(const t of p.targets){const k=hitSegment(start,end,t);if(k!==null&&k<best){best=k;target=t;}}
        if(target){end=start.map((v,i)=>mix(v,end[i],best));damageTarget(target,c.mainDamage/layout.main.length,end);burst(end,14,c.weaponColor,.5,18);}
        p.beams.push({start,end,age:0,life:c.primaryKind==='laser'?.65:.12,width:c.visual.capital?c.visual.radius:c.beamWidth,color:c.weaponColor});
      }else p.projectiles.push({pos:start,previous:[...start],velocity:V.scale(f,c.projectileSpeed),age:0,life:12,missile:false,damage:c.mainDamage/layout.main.length,color:c.weaponColor,kind:c.primaryKind,width:c.beamWidth,visual:c.visual});
    }
    tone('fire');notice(c.primaryName+' 已开火');
  }
  function updateMissileLock(dt){
    const p=state.flight,c=p.profile;
    const target=c.defenseOnly?(p.turretMode==='auto'?defenseTarget(p.pos,160):null):p.ai?selectedTarget():p.missileLock;
    if(target!==p.missileLock){p.missileLock=target;p.missileLockTime=0;}
    if(!missileTargetValid({target,defensive:c.defenseOnly},p)||V.length(V.sub(target.pos,p.pos))>(c.defenseOnly?160:2200)){p.missileLock=null;p.missileLockTime=0;return;}
    p.missileLockTime=Math.min(.4,p.missileLockTime+dt);
  }
  function fireMissile(){
    if(globalThis.flightController)return globalThis.flightController.fire('missile');
    const p=state.flight,c=p.profile;if(!canFire())return;if(!LAYOUTS[state.shipIndex].tubes.length){notice('此舰未配置导弹');return;}
    if(p.missileCooldown>0){notice(`导弹装填中 · ${p.missileCooldown.toFixed(1)} s`);return;}
    const target=p.missileLock;if(p.missileLockTime<.4||!missileTargetValid({target,defensive:c.defenseOnly},p)){notice('导弹未锁定 · 点击目标或按 T 锁定');return;}
    if(V.length(V.sub(target.pos,p.pos))>2200){notice('目标超出导弹射程');return;}
    if(p.missileStock<=0){notice('弹舱补给中');return;}
    let count=Math.min(c.salvo,p.missileStock);p.missileStock-=count;p.missileCooldown=c.missileCooldown;
    for(let i=0;i<count;i++)p.salvoQueue.push({delay:i*.16,tube:i%LAYOUTS[state.shipIndex].tubes.length,target});
    notice(`${count} 枚导弹顺序发射`);updateHUD();
  }
  function launchMissile(order){
    const p=state.flight,l=LAYOUTS[state.shipIndex],model=shipMatrix(p,state.shipIndex),a=axes(p);
    if(p.missileLock!==order.target||p.missileLockTime<.4||!missileTargetValid({target:order.target,defensive:p.profile.defenseOnly},p)){p.missileStock=Math.min(p.profile.missileCapacity,p.missileStock+1);return;}
    const start=M.transform(model,l.tubes[order.tube]);
    const local=l.tubeDirections[order.tube],direction=V.norm(V.sub(M.transform(model,local),M.transform(model,[0,0,0]))),eject=V.scale(direction,42);
    p.projectiles.push({pos:start,previous:[...start],velocity:eject,ejectDirection:direction,age:0,life:p.profile.defenseOnly?5:13,missile:true,defensive:p.profile.defenseOnly,damage:p.profile.missileDamage,target:order.target,visual:p.profile.visual,color:p.profile.weaponColor,trail:[[...start]],trailClock:0,seed:order.tube});
    p.missilesFired++;burst(start,12,[.55,.66,.69],1.2,7);tone('missile');
  }
  function burst(pos,count,color=[1,.7,.36],life=.8,speed=22){
    const p=state.flight;for(let i=0;i<count;i++)p.particles.push({pos:[...pos],velocity:[(rnd()-.5)*speed,(rnd()-.5)*speed,(rnd()-.5)*speed],age:0,life:life*(.6+rnd()*.8),size:2+rnd()*6,color});
    if(p.particles.length>700)p.particles.splice(0,p.particles.length-700);
  }
  function damageTarget(target,amount,point){
    if(globalThis.flightController)return;
    if(!target||target.hp<=0||amount<=0)return;
    if(renderer&&point&&target.shield>0)renderer.shieldImpact(target,target.kind,M.compose(target.pos,[.035,target.heading||.2,-.045],[target.scale,target.scale,target.scale]),point,amount,100*target.shield/target.maxShield);
    target.shield=Math.max(0,(target.shield||0)-amount);
    if(target.hp>0&&amount>0)renderer.weaponImpact(state.flight,point||target.pos,{visual:state.flight.profile.visual,color:[1,.4,.06],shield:target.shield>0});
    target.hp=Math.max(0,target.hp-amount);
    if(amount>1||state.flight.turretMode==='manual'){$('#hit-marker').classList.add('show');clearTimeout(hitTimer);hitTimer=setTimeout(()=>$('#hit-marker').classList.remove('show'),110);}
    if(amount>5){tone('hit');burst(target.pos,Math.min(80,Math.round(amount)),[1,.68,.33],1.1,40);}
    if(target.hp<=0){renderer.weaponImpact(state.flight,target.pos,{visual:{blastRadius:LAYOUTS[target.kind].length*.4,elite:LAYOUTS[target.kind].length>=50},destroy:true});target.respawn=9;state.flight.kills++;burst(target.pos,110,[1,.54,.21],2.7,55);notice('目标失能 · '+target.name);addLog('演练目标'+target.name+'已失能');}
  }
function slewJoint(t,d,dt){
  const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a)),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const yaw=Math.atan2(d[2],-d[0]),pitch=Math.atan2(d[1],Math.hypot(d[0],d[2]));
  const center=t.role==='main'?0:Math.sign(t.mount[2])*Math.PI/2,half=t.role==='main'?1.22:1.4;
  const angle=wrap(yaw-center),goal=center+clamp(angle,-half,half);
  t.inArc=Math.abs(angle)<=half&&pitch>=0&&pitch<=.7;
  t.yaw+=clamp(wrap(goal-t.yaw),-dt*.8,dt*.8);
  t.pitch+=clamp(clamp(pitch,0,.7)-t.pitch,-dt*.6,dt*.6);
  t.aligned=t.inArc&&Math.abs(wrap(yaw-t.yaw))<.018&&Math.abs(pitch-t.pitch)<.015;
}
function hullBlocks(vertices,ship,origin,dir,maxDistance){
  for(let i=ship.offset;i<ship.offset+ship.floatCount;i+=39){
    const ax=vertices[i],ay=vertices[i+1],az=vertices[i+2],
      ex=vertices[i+13]-ax,ey=vertices[i+14]-ay,ez=vertices[i+15]-az,
      fx=vertices[i+26]-ax,fy=vertices[i+27]-ay,fz=vertices[i+28]-az,
      px=dir[1]*fz-dir[2]*fy,py=dir[2]*fx-dir[0]*fz,pz=dir[0]*fy-dir[1]*fx,det=ex*px+ey*py+ez*pz;
    if(Math.abs(det)<1e-10)continue;
    const tx=origin[0]-ax,ty=origin[1]-ay,tz=origin[2]-az,u=(tx*px+ty*py+tz*pz)/det;if(u<0||u>1)continue;
    const qx=ty*ez-tz*ey,qy=tz*ex-tx*ez,qz=tx*ey-ty*ex,v=(dir[0]*qx+dir[1]*qy+dir[2]*qz)/det;if(v<0||u+v>1)continue;
    const distance=(fx*qx+fy*qy+fz*qz)/det;if(distance>.0001&&distance<maxDistance)return true;
  }
  return false;
}
  const PD_RANGE=80,PD_SPEED=145;
  function pdFighter(target){return target?.hp>0&&['Light_Fighter','Heavy_Fighter','Titanenergetic_Frigate'].includes(SHIPS[target.kind]?.id);}
  function pdMissile(q){return q.hostile&&q.missile&&!q.intercepted&&q.age<q.life;}
  function pdTarget(origin){
    const p=state.flight;
    for(const candidates of [p.projectiles.filter(pdMissile),p.targets.filter(pdFighter)]){
      let best=null,distance=PD_RANGE;
      for(const candidate of candidates){const d=V.length(V.sub(candidate.pos,origin));if(d<=distance){best=candidate;distance=d;}}
      if(best)return best;
    }
    return null;
  }
  function pdIntercept(q){
    if(!pdMissile(q))return false;
    if(Math.random()>=.001)return false;
    q.intercepted=true;burst(q.pos,12,[1,.76,.35],.35,10);return true;
  }
  function pdAim(origin,target){
    const r=V.sub(target.pos,origin),v=target.velocity||[0,0,0],a=V.dot(v,v)-PD_SPEED*PD_SPEED,b=2*V.dot(r,v),c=V.dot(r,r),disc=b*b-4*a*c;
    const roots=Math.abs(a)<.00001?(Math.abs(b)>.00001?[-c/b]:[]):disc>=0?[(-b-Math.sqrt(disc))/(2*a),(-b+Math.sqrt(disc))/(2*a)]:[];
    const times=roots.filter(t=>t>=0&&t<=PD_RANGE/PD_SPEED),time=times.length?Math.min(...times):0;
    return V.add(target.pos,V.scale(v,time));
  }
  function defenseTarget(origin,range){
    const p=state.flight;
    return [...p.projectiles.filter(pdMissile),...p.targets.filter(pdFighter)].find(t=>V.length(V.sub(t.pos,origin))<=range)||null;
  }
  function weaponRay(t,side=0){
    const matrix=jointTransforms(M,shipMatrix(state.flight,state.shipIndex),t).barrels,start=M.transform(matrix,t.muzzles[side]);
    return {start,dir:V.norm(V.sub(M.transform(matrix,t.muzzles[side].map((v,i)=>v-(i===0?1:0))),start))};
  }
  function clearWeapon(t){
    const matrix=jointTransforms(M,M.identity(),t).barrels;
    for(const muzzle of t.muzzles){const start=M.transform(matrix,muzzle),dir=V.norm(V.sub(M.transform(matrix,muzzle.map((v,i)=>v-(i===0?1:0))),start));
      const hinge=V.sub(start,V.scale(dir,t.scale*.71));
      if(hullBlocks(window.FlightFleet.vertices,SHIPS[state.shipIndex],hinge,dir,LAYOUTS[state.shipIndex].length*2))return false;
    }return true;
  }
  function updateTurrets(dt){
    const p=state.flight,c=p.profile,a=axes(p),model=shipMatrix(p,state.shipIndex);
    for(const t of p.joints){
      t.cooldown=Math.max(0,t.cooldown-dt);t.aligned=false;t.inArc=false;
      const origin=M.transform(model,t.mount),range=t.role==='pd'?PD_RANGE:t.role==='main'?1800:c.secondary.range;
      const target=t.role==='pd'?pdTarget(origin):c.defenseOnly?defenseTarget(origin,range):selectedTarget();t.pdTarget=target;
      if(!target||V.length(V.sub(target.pos,origin))>range)continue;
      const speed=t.role==='pd'?PD_SPEED:t.role==='main'?c.projectileSpeed:c.secondary.speed;
      const goal=t.role==='pd'?pdAim(origin,target):V.add(target.pos,V.scale(target.velocity||[0,0,0],V.length(V.sub(target.pos,origin))/speed));
      const d=V.sub(goal,origin);slewJoint(t,[-V.dot(d,a.forward),V.dot(d,a.up),-V.dot(d,a.right)],dt);
      t.transform=jointTransforms(M,model,t);
      if(t.role!=='main'&&t.aligned&&t.cooldown<=0&&p.turretMode!=='hold'&&(p.turretMode==='auto'||mouseDown)){
        if(!clearWeapon(t)){t.cooldown=.2;continue;}
        if(t.role==='pd')shootTurret(t);else shootSecondary(t);
      }
    }
    updateMissileLock(dt);
    if(c.defenseOnly&&p.missileLockTime>=.4&&p.turretMode==='auto'&&p.missileCooldown<=0&&p.missileStock>0&&defenseTarget(p.pos,160))fireMissile();
  }
  function shootSecondary(t){
    const p=state.flight,c=p.profile.secondary;if(!t.aligned||t.cooldown>0||p.turretMode==='hold')return false;
    t.cooldown=c.cooldown;p.turretShots++;
    for(let side=0;side<2;side++){
      const {start,dir}=weaponRay(t,side),color=c.color;
      if(c.kind==='laser'&&deathActive()){deathBeam(start,V.add(start,V.scale(dir,c.range)),c.damage,color,t.scale*.07);continue;}
      if(c.kind==='laser'){
        let end=V.add(start,V.scale(dir,c.range)),best=1,hit=null;
        for(const target of p.targets){if(p.profile.defenseOnly&&!pdFighter(target))continue;const k=hitSegment(start,end,target);if(k!==null&&k<best){best=k;hit=target;}}
        if(hit){end=start.map((v,i)=>mix(v,end[i],best));damageTarget(hit,c.damage,end);}
        p.beams.push({start,end,age:0,life:.15,width:t.scale*.07,color});
      }else p.projectiles.push({pos:start,previous:[...start],velocity:V.scale(dir,c.speed),age:0,life:c.range/c.speed,missile:false,damage:c.damage,color,kind:'secondary',defensive:p.profile.defenseOnly,width:t.scale*.09});
      burst(start,3,color,.14,3);
    }return true;
  }
  function shootTurret(t){
    const p=state.flight,c=p.profile;if(!t.transform||t.cooldown>0||!t.inArc||p.turretMode==='hold')return false;
    const {start,dir}=weaponRay(t);
    const target=t.pdTarget;if(!target||(!pdMissile(target)&&!pdFighter(target))||V.length(V.sub(target.pos,start))>PD_RANGE)return false;
    t.cooldown=.045;t.recoil=.03;p.turretShots++;

    p.projectiles.push({pos:start,previous:[...start],velocity:V.scale(dir,PD_SPEED),age:0,life:PD_RANGE/PD_SPEED,missile:false,damage:c.turretDamage,color:[1,.76,.35],kind:'pd',width:.018});
    return true;
  }
  function fireTurrets(){
    if(globalThis.flightController)return globalThis.flightController.fire('primary');
    const p=state.flight;if(!canFire())return;
    if(!p.profile.capital){fireMain();return;}
    if(p.turretMode==='hold'){notice('炮塔停火中 · L 切换火控模式');return;}
    for(const t of p.joints)if(t.aligned&&clearWeapon(t)){if(t.role==='pd')shootTurret(t);else if(t.role==='secondary')shootSecondary(t);}
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
    for(const q of p.projectiles)if(pdMissile(q)){q.pdPrevious=[...q.pos];q.pdNext=V.add(q.pos,V.scale(q.velocity,dt));}
    p.projectiles=p.projectiles.filter(q=>{
      if(q.intercepted)return false;if(q.missile&&q.age+dt>=q.life){burst(q.pos,8,q.color||[1,.65,.3],.24,6);return false;}
      const step=q.kind==='pd'?Math.min(dt,Math.max(0,q.life-q.age)):dt;
      q.age+=dt;q.previous=[...q.pos];
      if(q.missile){
        if(!missileTargetValid(q,p)){burst(q.pos,8,q.color||[1,.65,.3],.24,6);return false;}
        if(q.age>.18&&!missileGuidance(q,dt)){burst(q.pos,8,q.color||[1,.65,.3],.24,6);return false;}
        q.trailClock+=dt;if(q.trailClock>.037){q.trailClock=0;q.trail.push([...q.pos]);if(q.trail.length>50)q.trail.shift();}
      }
      q.pos=V.add(q.pos,V.scale(q.velocity,step));
      if(q.defensive){
        for(const missile of p.projectiles){if(!pdMissile(missile))continue;const from=V.sub(q.previous,missile.pdPrevious),to=V.sub(q.pos,missile.pdNext);
          if(segmentEllipsoidHit(from,to,[0,0,0],[1.5,1.5,1.5])){missile.intercepted=true;burst(missile.pos,18,[.6,.9,1],.35,10);return false;}}
      }
      if(q.kind==='pd'){
        for(const missile of p.projectiles){
          if(!pdMissile(missile))continue;
          const from=V.sub(q.previous,missile.pdPrevious),to=V.sub(q.pos,missile.pdNext),d=V.sub(to,from),u=clamp(-V.dot(from,d)/(V.dot(d,d)||1),0,1);
          if(V.length(V.add(from,V.scale(d,u)))<1.5){pdIntercept(missile);return false;}
        }
      }
      if(p.terrainProjectile){if(p.terrainProjectile(q))return false;return q.age<q.life;}
      if(q.hostile){
        const model=shipMatrix(p,state.shipIndex),local=point=>{const d=V.sub(point,p.pos);return [0,1,2].map(i=>V.dot(d,[model[i*4],model[i*4+1],model[i*4+2]]));},bounds=LAYOUTS[state.shipIndex].bounds;
        if(segmentEllipsoidHit(local(q.previous),local(q.pos),bounds.center,bounds.half)){
          burst(q.pos,16,[1,.55,.2],.35,10);
          if(p.shieldHits)renderer?.shieldImpact(p,state.shipIndex,model,q.pos,2.5,p.shield);
          p.shieldRegenDelay=4;p.shield=Math.max(0,p.shield-2.5);if(p.shield<=0)p.hull=Math.max(1,p.hull-1);p.shake=.16;
          $('#damage-wash').classList.add('show');clearTimeout(damageTimer);damageTimer=setTimeout(()=>$('#damage-wash').classList.remove('show'),190);return false;
        }
      }else{
        for(let t of p.targets){if((q.kind==='pd'||q.defensive)&&!pdFighter(t))continue;const k=hitSegment(q.previous,q.pos,t);if(k!==null){q.pos=q.previous.map((v,i)=>v+(q.pos[i]-v)*k);damageTarget(t,q.damage,q.pos);if(q.missile)burst(q.pos,35,q.color||[.72,.47,1],1.3,q.visual?.impact||28);else if(q.kind&&q.kind!=='pd')burst(q.pos,q.kind==='nuclear'?90:q.visual?.capital?55:24,q.color,q.visual?.capital?1.2:.8,q.visual?.impact||18);return false;}}
      }
      return q.age<q.life;
    });
    p.projectiles=p.projectiles.filter(q=>!q.intercepted);
    p.beams=p.beams.filter(b=>(b.age+=dt)<b.life);
    p.particles=p.particles.filter(q=>{q.age+=dt;q.pos=V.add(q.pos,V.scale(q.velocity,dt));q.velocity=V.scale(q.velocity,Math.exp(-dt*.4));return q.age<q.life;});
  }
function antimatterDamage(distance,radius=680,id=''){
  if(id==='Reaper'||!Number.isFinite(distance)||distance<0||distance>=radius)return 0;
  return 180*Math.pow(1-distance/radius,.65);
}
  function fireSpecial(){
    const p=state.flight;if(!canFire()||p.gunCooldown>0||p.charging||p.assault||p.detonated||p.reaperCut)return false;
    const t=p.profile.special==='antimatter'?p.missileLock:selectedTarget();
    if(!t||t.hp<=0||!p.targets.includes(t)){notice('先点击接触目标锁定');return false;}
    if(p.profile.special==='antimatter'&&p.missileLockTime<.4){notice('锁定中');return false;}
    if(V.length(V.sub(t.pos,p.pos))>2200){notice('目标超出射程');return false;}
    p.specialTarget=t;p.charging=true;p.charge=0;tone('charge');return true;
  }
  function dischargeSpecial(){
    const p=state.flight,t=p.specialTarget;p.charging=false;p.charge=0;
    if(!t||t.hp<=0||!p.targets.includes(t)){notice('目标失效 · 取消发射');return;}
    p.gunCooldown=p.profile.mainCooldown;p.mainShots++;
    if(p.profile.special==='antimatter'){
      p.assault={target:t,age:0};p.align=true;p.targetIndex=p.targets.indexOf(t);p.throttle=100;p.external=true;p.cameraBlend=1;
      notice('反物质自行导弹 · 自主接近');
    }else {p.reaperCut={target:t,age:0};notice('相位收割 · 双束汇聚');}tone('fire');
  }
  function detonateSpecial(harmless=false){
    const p=state.flight;if(p.detonated)return;
    const blast={pos:[...p.pos],age:0,radius:harmless?85:680,hit:new Set(),harmless};
    p.specialBlasts.push(blast);p.detonated=blast;p.assault=null;p.throttle=0;p.speed=0;p.velocity=[0,0,0];p.shieldHits=[];p.hull=0;p.blastHits=0;
    p.specialBlasts=p.specialBlasts.slice(-4);tone('hit');notice(harmless?'锁定目标丢失 · 安全自毁':'反物质约束失效 · 湮灭冲击扩散');
  }
  function guideSpecial(dt){
    const p=state.flight,q=p.assault;if(!q)return;
    if(!q.target||q.target.hp<=0||!p.targets.includes(q.target)){detonateSpecial(true);return;}
    q.age+=dt;const from=[...p.pos],d=V.sub(q.target.pos,from),distance=V.length(d),step=Math.min(distance,250*dt),dir=V.norm(d);
    p.yaw=p.yawTarget=Math.atan2(dir[0],-dir[2]);p.pitch=p.pitchTarget=Math.atan2(dir[1],Math.hypot(dir[0],dir[2]));
    p.pos=V.add(from,V.scale(dir,step));p.speed=2000;p.velocity=[0,0,0];
    if(hitSegment(from,p.pos,q.target)!==null||distance<20)detonateSpecial();else if(q.age>15)detonateSpecial(true);
  }
  function updateSpecial(dt){
    const p=state.flight;
    for(const b of p.specialBlasts||[]){
      b.age+=dt;
      if(!b.harmless)for(const t of p.targets){
        if(t.hp<=0||b.hit.has(t))continue;
        const distance=V.length(V.sub(t.pos,b.pos)),amount=antimatterDamage(distance,b.radius,SHIPS[t.kind].id);
        if(amount>0&&b.age>=.28+distance/b.radius*1.1){
          b.hit.add(t);p.blastHits++;const shield=t.shield;damageTarget(t,amount);t.shield=shield;
        }
      }
    }
    p.specialBlasts=(p.specialBlasts||[]).filter(b=>b.age<5.3);
    if(p.detonated?.age>5.2){const kills=p.kills;configureFlight(state.shipIndex,true);p.kills=kills;notice('新演练弹已补充');return;}
    const cut=p.reaperCut;if(!cut)return;
    cut.age+=dt;const t=cut.target;
    if(cut.age>1.25||t.hp<=0||!p.targets.includes(t)||V.length(V.sub(t.pos,p.pos))>2200){p.reaperCut=null;return;}
    const direction=V.norm(V.sub(t.pos,p.pos));if(V.dot(direction,forward())<.65){p.reaperCut=null;notice('目标离开前向收割射界');return;}
    const model=shipMatrix(p,state.shipIndex),end=V.add(t.pos,[Math.sin(cut.age*8)*8,Math.cos(cut.age*8)*4,0]);
    for(const m of LAYOUTS[state.shipIndex].main){const start=M.transform(model,m);p.beams.push({start,end,age:0,life:dt*1.4+.015,width:p.profile.visual.radius*(.65+.08*Math.sin(cut.age*40)),color:[.18,1,.68]});}
    damageTarget(t,p.profile.mainDamage/1.25*dt,end);p.shield=Math.min(100,p.shield+dt*8);
    if(Math.random()<dt*25)burst(end,4,[.3,1,.78],.6,25);
  }

  function updateFlight(dt){
    if(globalThis.flightController)return globalThis.flightController.update(dt);if(deathActive()&&!deathTick(dt))return;
    const p=state.flight,c=p.profile;
    updateSpecial(dt);
    if(p.detonated){updateCamera(dt);updateProjectiles(dt);return;}
    p.elapsed+=dt;updateCamera(dt);p.shake=mixExp(p.shake,0,5,dt);
    p.gunCooldown=Math.max(0,p.gunCooldown-dt);p.missileCooldown=Math.max(0,p.missileCooldown-dt);
    if(p.charging){p.charge+=dt/c.chargeTime;if(p.charge>=1)dischargeMain();}
    if(p.missileStock===0&&p.salvoQueue.length===0){p.restock+=dt;if(p.restock>=15){p.missileStock=c.missileCapacity;p.restock=0;notice('演练弹舱已补给');}}
    for(let t of p.targets){
      if(t.terrainTurret)continue;
      if(t.hp<=0){t.respawn-=dt;if(t.respawn<=0){let a=axes(p);t.pos=V.add(p.pos,V.add(V.scale(a.forward,500+t.seed*120),V.add(V.scale(a.right,(t.seed-1)*160),V.scale(a.up,18+t.seed*20))));t.hp=100;t.shield=t.maxShield;t.shieldHits=[];}}
      else{t.velocity=[Math.sin(p.elapsed*.12+t.seed*2)*2.8,Math.cos(p.elapsed*.14+t.seed)*.3,Math.sin(p.elapsed*.08+t.seed)*.4];t.pos=V.add(t.pos,V.scale(t.velocity,dt));}
    }
    let t=selectedTarget();
    if(p.ai&&t?.hp<=0){const i=p.targets.findIndex(t=>t.hp>0);if(i>=0){p.targetIndex=i;t=p.targets[i];renderContacts();}}
    if((p.ai||p.align)&&t?.hp>0){let d=V.sub(t.pos,p.pos);p.yawTarget=Math.atan2(d[0],-d[2]);p.pitchTarget=Math.atan2(d[1],Math.hypot(d[0],d[2]));}
    if(!p.ai){
      if(keys.has('KeyW'))p.throttle+=dt*27;if(keys.has('KeyS'))p.throttle-=dt*27;p.throttle=clamp(p.throttle,0,100);
      let turn=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),pitch=(keys.has('ArrowUp')?1:0)-(keys.has('ArrowDown')?1:0);
      if(turn||pitch){p.align=false;p.yawTarget+=turn*c.turnRate*dt;p.pitchTarget=clamp(p.pitchTarget+pitch*c.turnRate*.65*dt,-1.25,1.25);}
    }else p.throttle=mixExp(p.throttle,c.capital?22:38,.5,dt);
    const yd=shortAngle(p.yawTarget-p.yaw),pd=p.pitchTarget-p.pitch;
    p.yawVelocity=mixExp(p.yawVelocity,clamp(yd*c.turnResponse,-c.turnRate,c.turnRate),c.turnResponse,dt);
    p.pitchVelocity=mixExp(p.pitchVelocity,clamp(pd*c.turnResponse,-c.turnRate*.65,c.turnRate*.65),c.turnResponse,dt);
    p.yaw+=p.yawVelocity*dt;p.pitch=clamp(p.pitch+p.pitchVelocity*dt,-1.3,1.3);
    const roll=(keys.has('KeyQ')?1:0)-(keys.has('KeyE')?1:0);
    if(roll)p.roll+=roll*dt*(c.capital?.14:.9);else p.roll=mixExp(p.roll,-p.yawVelocity*(c.capital?.13:.22),2.4,dt);
    p.boostActive=keys.has('ShiftLeft')||keys.has('ShiftRight')||p.boost;
    const desiredSpeed=p.throttle/100*c.maxSpeed*(p.boostActive?(c.capital?1.65:2.2):1);
    p.speed=mixExp(p.speed,desiredSpeed,c.accel,dt);
    p.velocity=p.velocity.map((v,i)=>mixExp(v,forward()[i]*p.speed*.125,c.accel*2,dt));p.pos=V.add(p.pos,V.scale(p.velocity,dt));if(deathActive()&&!deathAfterMove())return;
    guideSpecial(dt);
    if(t?.hp>0){let d=V.norm(V.sub(t.pos,p.pos));p.boresightError=Math.acos(clamp(V.dot(d,forward()),-1,1))*180/Math.PI;}else p.boresightError=180;
    if(p.ai&&t?.hp>0){if(p.boresightError<(c.capital?.6:1.8))fireMain();if(p.elapsed>3&&p.missileCooldown<=0&&t.hp>35)fireMissile();}
    if(!p.ai&&(keys.has('Space')||(!c.capital&&mouseDown)))fireMain();
    updateTurrets(dt);updateProjectiles(dt);
    p.enemyAttack-=dt;if(p.enemyAttack<=0){
      p.enemyAttack=4.8;const enemy=p.targets.find(t=>t.hp>0);
      if(enemy){let predicted=V.add(p.pos,V.scale(p.velocity,V.length(V.sub(enemy.pos,p.pos))/210));p.projectiles.push({pos:[...enemy.pos],previous:[...enemy.pos],velocity:V.scale(V.norm(V.sub(predicted,enemy.pos)),210),age:0,life:10,hostile:true,missile:true,target:p,trail:[[...enemy.pos]],trailClock:0,seed:0,damage:0});}
    }
    p.shieldRegenDelay=Math.max(0,(p.shieldRegenDelay||0)-dt);if(p.enemyAttack>2&&p.shieldRegenDelay===0&&SHIPS[state.shipIndex].stats[1]>0)p.shield=Math.min(100,p.shield+dt*.14);
  }
  function updateHUD(){
    const p=state.flight,c=p.profile;if(!c||!p.targets.length)return;
    $('#special-readout').hidden=!c.special;
    if(c.special)$('#special-readout').textContent=c.special==='antimatter'?(p.detonated?'湮灭完成 · 波及 '+p.blastHits+' 艘 · 5 秒后补充演练弹':p.assault?'自行突击 · 接近引信已开启':p.charging?'约束场解锁中':'反物质自行导弹 · 点击目标锁定，Space 发射 · 伤害半径 6.8 km'):(p.reaperCut?'相位收割 · 切割与护盾回收中':'RAVEN 收割者 · 双束相位收割 / 低矮副炮 / 导弹 · 原创试装');
    $('#speed-value').textContent=deathActive()?Math.round(p.speed*.125):Math.round(p.speed);$('.speed-readout>span').textContent=deathActive()?'单位/s':'m/s';$('#throttle-value').textContent=Math.round(p.throttle)+'%';$('#heading-value').textContent=String(Math.round(((p.yaw*180/Math.PI)%360+360)%360)).padStart(3,'0');
    const gun=p.charging?`蓄能 ${Math.round(p.charge*100)}%`:p.gunCooldown>0?`${p.gunCooldown.toFixed(1)} s`:'就绪';
    $('#main-gun-state').textContent=gun;$('#system-gun-state').textContent=gun;
    const missile=!c.salvo?'未配置':!p.missileLock?'未锁定':p.missileLockTime<.4?'锁定中':p.missileCooldown>0?`${p.missileCooldown.toFixed(1)} s`:p.missileStock<=0?'补给中':'可齐射';
    $('#missile-state').textContent=missile;$('#system-missile-state').textContent=missile;
    $('#charge-arc').style.opacity=p.gunCooldown>0?.3:1;
    $('#system-engine-state').textContent=p.boostActive?'加速':p.throttle<1?'怠速':'巡航';$('#system-engine').classList.toggle('selected',p.boostActive);
    setBarTicks('gun-bars',p.charging?p.charge:1-p.gunCooldown/c.mainCooldown);setBarTicks('missile-bars',1-p.missileCooldown/c.missileCooldown);setBarTicks('engine-bars',p.boostActive?1:p.throttle/100);
    $$('#speed-ticks path').forEach((x,i)=>x.style.opacity=i/22<clamp(p.speed/c.maxSpeed,0,1)?'.95':'.18');$$('#throttle-ticks path').forEach((x,i)=>x.style.opacity=i/22<p.throttle/100?'.95':'.18');
    $('#shield-value').textContent=(p.shield>0&&p.shield<1?'<1':Math.round(p.shield))+'%';$('#hull-value').textContent=Math.round(p.hull)+'%';$('#shield-bar').style.width=p.shield+'%';$('#hull-bar').style.width=p.hull+'%';
    const ready=p.joints.filter(t=>t.role!=='main'&&t.aligned).length,total=p.joints.filter(t=>t.role!=='main').length;
    $('#system-turret-state').textContent=p.turretMode==='hold'?'停火':`${ready} / ${total}`;setBarTicks('turret-bars',total?ready/total:0);
    $('#turret-count').textContent=String(total).padStart(2,'0');$('#turrets-bearing').textContent=`${ready} / ${total} 就位`;
    $('#missile-stock').textContent=String(p.missileStock).padStart(2,'0');$('#missile-capacity').textContent=String(c.missileCapacity).padStart(2,'0');
    $('#director-primary').textContent=gun;$('#charge-fill').style.transform=`scaleX(${p.charging?p.charge:1-p.gunCooldown/c.mainCooldown})`;
    $('#bore-error').textContent=p.boresightError<90?p.boresightError.toFixed(1)+'°':'—';
    $('#bore-caption').textContent=p.charging?'主炮蓄能':p.boresightError<.8?'舰艏已对准':'舰艏轴线';
    $('#bore-sight').classList.toggle('aligned',p.boresightError<.8);$('#bore-sight').classList.toggle('charging',p.charging);
    $('#director').classList.toggle('charging',p.charging);$('#kill-count').textContent=String(p.kills).padStart(2,'0');
    $('#aim-cursor').classList.toggle('visible',c.capital&&p.turretMode==='manual'&&!state.helpOpen);
    p.targets.forEach((t,i)=>{let dist=$('#contact-dist-'+i),hp=$('#contact-hp-'+i);if(dist)dist.textContent=t.hp>0?(deathActive()?Math.round(V.length(V.sub(t.pos,p.pos)))+' 单位':(V.length(V.sub(t.pos,p.pos))*.008).toFixed(1)+' km'):'失能';if(hp)hp.style.transform=`scaleX(${t.hp/100})`;});
    $$('.mount-dot').forEach((dot,i)=>{const t=p.turrets[i];dot.classList.toggle('ready',!!t?.aligned);dot.classList.toggle('firing',!!t&&t.cooldown>c.turretCooldown-.2);dot.style.display=t?'':'none';});
    $('#align-target').classList.toggle('active',p.align);$('#align-label').textContent=p.align?'正在对准':'舰艏对准';
  }
  function positionHUD(){if(deathActive()&&state.flight.deathOverview)return;
    if(globalThis.flightController?.overview)return;
    if(!renderer)return;
    if(state.mode==='archive'){
      const show=state.highlight>0&&!state.transition&&!state.shipSwitch&&!state.helpOpen;$('#ship-annotation').classList.toggle('visible',show);
      if(show){const positions=state.shipIndex===3?{1:[-2.8,1,-2.19],2:[-.99,-.63,1.13]}:{1:LAYOUTS[state.shipIndex].main[0],2:LAYOUTS[state.shipIndex].tubes[0],3:LAYOUTS[state.shipIndex].mounts[0]};let point=renderer.project(M.transform(renderer.archiveModel||M.identity(),positions[state.highlight]||[0,2,0]));$('#ship-annotation').style.left=clamp(point.x-155,350,innerWidth-290)+'px';$('#ship-annotation').style.top=point.y-49+'px';}
    }else{
      let p=state.flight,t=p.targets[p.targetIndex];if(!t)return;
      const model=renderer.ownModel||shipMatrix(p,state.shipIndex),muzzle=M.transform(model,(LAYOUTS[state.shipIndex].main[0]||[0,0,0])),bore=renderer.project(V.add(muzzle,V.scale(forward(),Math.max(300,V.length(V.sub(t.pos,p.pos))))));
      $('#bore-sight').style.left=bore.x+'px';$('#bore-sight').style.top=bore.y+'px';$('#bore-sight').style.opacity=bore.visible?'1':'0';
      $('#aim-cursor').style.left=mouseAim.x+'px';$('#aim-cursor').style.top=mouseAim.y+'px';
      const markerNodes=$$('#secondary-markers .secondary-contact');markerNodes.forEach((el,i)=>{const target=p.targets[i],pr=renderer.project(target.pos),show=i!==p.targetIndex&&target.hp>0&&pr.visible&&pr.x>240&&pr.x<innerWidth-250&&pr.y>120&&pr.y<innerHeight-110;el.style.display=show?'block':'none';el.style.left=pr.x+'px';el.style.top=pr.y+'px';});
      let point=renderer.project(t.pos),marker=$('#target-marker'),off=$('#offscreen-target'),distance=V.length(V.sub(t.pos,p.pos));
      let on=point.visible&&point.x>35&&point.x<innerWidth-65&&point.y>85&&point.y<innerHeight-150;
      marker.style.opacity=on?'1':'0';marker.style.pointerEvents=on?'auto':'none';off.style.display=on?'none':'block';
      if(on){let w=clamp(12500*t.scale/distance,58,260),h=clamp(w*.47,35,115);marker.style.width=w+'px';marker.style.height=h+'px';marker.style.left=point.x-w/2+'px';marker.style.top=point.y-h/2+'px';let label=marker.querySelector('.target-label');label.style.left=point.x+w/2+150>innerWidth-270?'auto':'calc(100% + 8px)';label.style.right=point.x+w/2+150>innerWidth-270?'calc(100% + 8px)':'auto';}
      else{let x=point.visible?point.x:innerWidth-point.x,y=point.visible?point.y:innerHeight-point.y;off.style.left=clamp(x,35,innerWidth-65)+'px';off.style.top=clamp(y,110,innerHeight-190)+'px';off.style.transform=`rotate(${Math.atan2(y-innerHeight*.47,x-innerWidth*.5)*180/Math.PI}deg)`}
      marker.classList.toggle('destroyed',t.hp<=0);$('#target-name').textContent=t.hp>0?t.name:'目标失能';$('#target-distance').textContent=(deathActive()?Math.round(distance)+' 单位':(distance*.008).toFixed(1)+' km');$('#target-health-fill').style.width=t.hp+'%';
    }
  }

  const FLIGHT_SCENES=[{"id":"gargantua","name":"多彩星云","subtitle":"深空练习区","kind":0},{"id":"planet","name":"蔚蓝行星","subtitle":"晨昏线轨道","kind":1},{"id":"nebula","name":"创生星云","subtitle":"电离云海","kind":2},{"id":"belt","name":"碎星带","subtitle":"小行星航道","kind":3},{"id":"death-star","name":"死星","subtitle":"巨型机械天体 · 壕沟演练","kind":4}];
  function selectScene(id){
    const index=FLIGHT_SCENES.findIndex(s=>s.id===id);state.sceneIndex=index<0?0:index;
    const scene=FLIGHT_SCENES[state.sceneIndex];$('#scene-select').value=scene.id;$('#flight-nav-label').textContent=scene.subtitle;
    const url=new URL(location.href);url.searchParams.set('map',scene.id);history.replaceState(null,'',url);notice('已进入 '+scene.name);deathSelection(scene.id);
  }
  function testShield(){
    if(state.mode!=='flight'||state.transition)return;
    const p=state.flight,a=axes(p),length=LAYOUTS[state.shipIndex].length,start=V.add(p.pos,V.add(V.scale(a.right,length*1.6+15),V.scale(a.up,length*.12)));
    p.projectiles.push({pos:start,previous:[...start],velocity:V.scale(V.norm(V.sub(p.pos,start)),230),age:0,life:8,hostile:true,missile:true,target:p,trail:[[...start]],trailClock:0,damage:0});notice('护盾试射 · 右舷来袭');
  }
  function bindEvents(){
    $('#death-controls').addEventListener('click',e=>{const name=e.target.closest('[data-death]')?.dataset.death;if(name)deathLocate(name==='reset'?'trench':name,name==='reset');});
    selectScene(new URLSearchParams(location.search).get('map'));
    $('#scene-select').addEventListener('change',e=>selectScene(e.target.value));$('#shield-test').addEventListener('click',testShield);
    $$('[data-inspect]').forEach(button=>button.addEventListener('click',()=>{
      const views={hero:[.82,.5],top:[.0001,1.565],side:[0,0],rear:[-Math.PI/2,.06],bottom:[.82,-.64]};
      const v=views[button.dataset.inspect];if(!v||state.mode!=='archive'||state.transition)return;
      state.autoRotate=false;$('#autorotate').setAttribute('aria-pressed','false');
      Object.assign(state.orbit,{targetYaw:v[0],targetPitch:v[1],targetDistance:LAYOUTS[state.shipIndex].archiveDistance});
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
    $('#system-engine').addEventListener('click',()=>{state.flight.boost=!state.flight.boost;notice(state.flight.boost?'持续加速已开启':'已恢复巡航推力');tone()});
    $('#throttle-plus').addEventListener('click',()=>{state.flight.throttle=clamp(state.flight.throttle+10,0,100);tone()});$('#throttle-minus').addEventListener('click',()=>{state.flight.throttle=clamp(state.flight.throttle-10,0,100);tone()});
    $('#toggle-ai').addEventListener('click',()=>setAI(!state.flight.ai));$('#change-view').addEventListener('click',setView);$('#target-marker').addEventListener('click',cycleTarget);
    $('#location-button').addEventListener('click',()=>setTab(state.activeTab==='planet'?'fleet':'planet'));
    $$('#main-nav button').forEach(b=>b.addEventListener('click',()=>setTab(state.activeTab===b.dataset.tab?'fleet':b.dataset.tab)));$('#close-sheet').addEventListener('click',()=>setTab('fleet'));
    $$('[data-help]').forEach(b=>b.addEventListener('click',()=>setHelp(true)));$('#close-help').addEventListener('click',()=>setHelp(false));$('#help-modal').addEventListener('click',e=>{if(e.target===$('#help-modal'))setHelp(false)});
    $$('.sound-toggle').forEach(b=>b.addEventListener('click',toggleSound));
    const canvas=$('#scene');canvas.addEventListener('pointerdown',e=>{if(state.helpOpen||state.transition)return;if(state.activeTab!=='fleet')setTab('fleet');activePointer={id:e.pointerId,x:e.clientX,y:e.clientY,button:e.button,moved:0};canvas.setPointerCapture(e.pointerId);if(state.mode==='flight'&&e.button===0){mouseDown=true;fireTurrets()}if(state.mode==='archive')state.autoRotate=false;$('#autorotate').setAttribute('aria-pressed',String(state.autoRotate));});
    canvas.addEventListener('pointermove',e=>{mouseAim={x:e.clientX,y:e.clientY};if(!activePointer||state.helpOpen||state.transition)return;let dx=e.clientX-activePointer.x,dy=e.clientY-activePointer.y;activePointer.x=e.clientX;activePointer.y=e.clientY;activePointer.moved+=Math.abs(dx)+Math.abs(dy);if(state.mode==='archive'){const direction=activePointer.button===1?-1:1;state.orbit.targetYaw+=dx*.006*direction;state.orbit.targetPitch=clamp(state.orbit.targetPitch+dy*.0045*direction,-.46,1.3)}else if(deathActive()&&state.flight.deathOverview){state.flight.orbitYaw+=dx*.005;state.flight.orbitPitch=clamp(state.flight.orbitPitch+dy*.004,-2.5,2.5);}else if(activePointer.button===2){const p=state.flight;p.ai=false;p.align=false;p.yawTarget+=dx*.0032;p.pitchTarget=clamp(p.pitchTarget-dy*.0032,-1.2,1.2);$('#ai-indicator').classList.remove('visible');$('#toggle-ai').setAttribute('aria-pressed','false');$('#ai-label').textContent='自动驾驶'}else if(activePointer.button===1&&state.flight.external){const orbit=orbitDrag(state.flight.orbitYaw,state.flight.orbitPitch,dx,dy);state.flight.orbitYaw=orbit.yaw;state.flight.orbitPitch=orbit.pitch}});
    const release=()=>{activePointer=null;mouseDown=false};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
    canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('wheel',e=>{e.preventDefault();if(state.helpOpen||state.transition)return;if(deathActive()&&state.flight.deathOverview)state.flight.cameraZoom=clamp(state.flight.cameraZoom+e.deltaY*.001,.5,2.5);else if(state.mode==='archive')state.orbit.targetDistance=clamp(state.orbit.targetDistance+e.deltaY*.001*LAYOUTS[state.shipIndex].length,LAYOUTS[state.shipIndex].length*1.4,LAYOUTS[state.shipIndex].length*5);else if(e.ctrlKey&&state.flight.external)state.flight.cameraZoom=clamp(state.flight.cameraZoom+e.deltaY*.001,.7,1.6);else state.flight.throttle=clamp(state.flight.throttle-e.deltaY*.025,0,100)},{passive:false});
    window.addEventListener('keydown',e=>{if(e.target instanceof HTMLSelectElement||e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
      if(e.ctrlKey||e.metaKey||e.altKey)return;
      if(state.helpOpen){if(e.code==='Escape'||e.code==='KeyH'){e.preventDefault();setHelp(false)}if(e.code==='Tab'){e.preventDefault();$('#close-help').focus()}return}
      if(e.code==='KeyH'&&!e.repeat){e.preventDefault();setHelp(true);return}if(e.code==='KeyM'&&!e.repeat){toggleSound();return}if(state.transition)return;
      if(e.code==='Escape'){e.preventDefault();if(state.activeTab!=='fleet'){setTab('fleet');return}if(state.mode==='flight')transitionTo('archive');else resetCamera();return}
      if(state.mode==='archive'){if(e.repeat)return;if(e.code==='ArrowRight'){e.preventDefault();selectShip(state.shipIndex+1)}else if(e.code==='ArrowLeft'){e.preventDefault();selectShip(state.shipIndex-1)}else if(e.code==='KeyF'){e.preventDefault();transitionTo('flight')}}
      else{
        const handled=['KeyW','KeyS','KeyA','KeyD','KeyQ','KeyE','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','ShiftLeft','ShiftRight','Space'];if(handled.includes(e.code)){e.preventDefault();keys.add(e.code);if(e.code==='Space'&&!e.repeat)fireMain()}
        if(!e.repeat){if(e.code==='KeyR')fireMissile();if(e.code==='KeyT')cycleTarget();if(e.code==='KeyV')setView();if(e.code==='KeyG')setAI(!state.flight.ai);if(e.code==='KeyX')alignTarget();if(e.code==='KeyL')cycleTurretMode();if(e.code==='Digit1')switchCombatHull(3);if(e.code==='Digit2')switchCombatHull(0);if(e.code==='Digit3')switchCombatHull(4);if(e.code==='KeyC'){state.flight.orbitYaw=0;state.flight.orbitPitch=0;state.flight.cameraZoom=1;}}
      }
    });
    window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();mouseDown=false;activePointer=null});document.addEventListener('visibilitychange',()=>{keys.clear();mouseDown=false;lastTime=0});window.addEventListener('resize',()=>{renderer?.resize();moveNavIndicator()});
  }
  function frame(now){
    if(window.commandSceneActive){lastTime=now;requestAnimationFrame(frame);return;}
    const rawDt=lastTime?(now-lastTime)/1000:.016,dt=Math.min(rawDt,.05);lastTime=now;state.frames++;
    updateTransition(now);updateJobs(document.hidden?0:Math.min(rawDt,1));
    if(state.shipSwitch){let t=state.shipSwitch;t.progress=clamp((now-t.start)/(reduced?200:CONFIG.shipSwitchMs),0,1);if(t.progress>=.5&&!t.swapped){state.shipIndex=t.to;t.swapped=true;state.orbit.targetDistance=LAYOUTS[state.shipIndex].archiveDistance;renderShipData();if(state.activeTab!=='fleet')renderSheet();$$('.ship-title h1,.ship-code,.ship-sidebar').forEach(el=>{el.classList.remove('data-switching');el.classList.add('data-entering')})}if(t.progress>=1)state.shipSwitch=null;}
    let o=state.orbit;if(state.autoRotate&&!state.helpOpen&&!activePointer)o.targetYaw+=dt*.11;let smooth=1-Math.exp(-dt*9);o.yaw=mix(o.yaw,o.targetYaw,smooth);o.pitch=mix(o.pitch,o.targetPitch,smooth);o.distance=mix(o.distance,o.targetDistance,smooth);
    if(state.mode==='flight'&&!state.transition&&!state.helpOpen&&!document.hidden)updateFlight(dt);
    if(renderer){state.mode==='archive'?renderer.archive(state,now/1000):renderer.flight(state,now/1000);positionHUD()}
    hudAccumulator+=dt;if(hudAccumulator>.065){hudAccumulator=0;if(state.mode==='flight'){updateHUD();globalThis.flightController?.syncHUD();}}
    requestAnimationFrame(frame);
  }

  renderShipData();setupInstruments();bindEvents();addLog('舰船档案已载入 · 虚拟演练不影响实际战果');$('#message-dot').classList.remove('visible');requestAnimationFrame(moveNavIndicator);
  try{renderer=new Renderer($('#scene'));const initial=deathActive()?SHIPS.findIndex(s=>s.id==='Light_Fighter'):Math.max(0,SHIPS.findIndex(s=>s.id===new URLSearchParams(location.search).get('ship')));configureFlight(initial,true);screenVisible('flight');if(deathActive()){deathSelection('death-star');}document.documentElement.dataset.ready='true';requestAnimationFrame(frame)}catch(error){console.error(error);$('#no-webgl').hidden=false;$('#webgl-error').textContent=String(error.message||error)}
  // Read-only-by-convention debug surface; useful for integration and automated UI tests.
  window.GalacticDemo={state,renderer,renderShipData,ships:SHIPS,config:CONFIG,enterFlight:()=>transitionTo('flight'),returnArchive:()=>transitionTo('archive'),selectShip,fireMain,fireMissile,setAI,setHelp,setTab,setView,switchCombatHull,setTurretMode,alignTarget,profiles:COMBAT,selectScene,deathLocate,deathFail,deathActive};
  if(window.createFlightController){const live=window.createFlightController({state,renderer,SHIPS,COMBAT,LAYOUTS,keys,$,M,V,clamp,mix,shortAngle,notice,configureFlight,setView,selectedTarget,renderContacts,shipMatrix,tone,burst,updateCamera,forward,getMouseDown:()=>mouseDown});globalThis.flightController=live;live.start().catch(e=>live.fail(e));}
})();



(() => {
  const ids=['Destroyer','Cruiser','Battleship','Heavy_Fighter','Dreadnought'];
  const labels=['DESTROYER','CRUISER','BATTLESHIP','HEAVY FIGHTER','DREADNOUGHT'];
  window.addEventListener('message',e=>{
    if(e.origin!==location.origin||e.source!==parent)return;
    const d=e.data,g=window.GalacticDemo;if(!g)return;
    if(d.type==='empire-visibility')window.commandSceneActive=!d.active;
    if(d.type==='empire-select'&&Number.isInteger(d.index)&&d.index>=0&&d.index<5)g.selectShip(d.index);
    if(d.type!=='empire-state'||!d.planet||!d.catalog)return;
    ids.forEach((id,i)=>{const u=d.catalog.units[id];if(!u)return;const weapons=(u.weapons||[]).map(w=>[w.name,d.catalog.tech[w.technology]?.name||w.technology||'无科技要求',String(w.kind).toUpperCase(),w.technology?(d.player.tech[w.technology]||0):null]);Object.assign(g.ships[i],{name:u.name,en:labels[i],count:d.planet.ships[id]||0,stats:[u.strength,u.shield,u.attack,u.speed,u.cargo,u.fuel],weapons,levels:weapons.map(w=>w[3]||0)});g.profiles[i].role=u.name;g.profiles[i].className=labels[i]+' / '+g.ships[i].code;});
    g.renderShipData();document.getElementById('station-location').textContent=d.planet.name+' ['+d.planet.position.join(':')+']';
  });
  document.getElementById('main-nav').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;e.stopImmediatePropagation();parent.postMessage({type:'empire-navigate',page:b.dataset.tab},location.origin);},true);
  parent.postMessage({type:'empire-hangar-ready'},location.origin);
})();