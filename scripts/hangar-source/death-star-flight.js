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
