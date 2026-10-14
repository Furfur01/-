import assert from 'node:assert/strict';
import {plumeEnvelope,plumeMeshData} from '../game/ship-propulsion.mjs';
import {mainGunGlow} from '../game/ship-main-effects.mjs';
import {upgradeArticulatedWeapons} from './upgrade-articulated-weapons.mjs';
import {speedFovOffset,smoothSpeedFov} from '../game/flight-camera.mjs';

export function upgradePilotRange(html,fleet){
  const replace=(a,b)=>{assert(html.includes(a),'Pilot range anchor missing: '+a.slice(0,65));html=html.replace(a,()=>b);};
  const block=(start,end,body)=>{const a=html.indexOf(start),b=html.indexOf(end,a);assert(a>=0&&b>a,start);html=html.slice(0,a)+body+'\n'+html.slice(b);};
  replace('  class Renderer {',speedFovOffset.toString()+'\n'+smoothSpeedFov.toString()+'\n  class Renderer {');
  replace('      const fov=mix(s.shipIndex===3?65:62,s.shipIndex===3?61:55,blend)+(p.boostActive?3:0);',`      const targetFov=speedFovOffset(p.speed,p.profile.maxSpeed,p.profile.capital);
      const fovDt=this.speedFovTime==null?0:Math.min(.1,Math.max(0,time-this.speedFovTime));
      if(this.speedFovShip!==s.shipIndex){this.speedFov=0;this.speedFovShip=s.shipIndex;}
      this.speedFov=smoothSpeedFov(this.speedFov||0,targetFov,fovDt);this.speedFovTime=time;
      const fov=mix(s.shipIndex===3?65:62,s.shipIndex===3?61:55,blend)+this.speedFov;`);
  // Keep large flight coordinates in CPU doubles; upload only camera-relative floats.
  const mathStart=html.indexOf('  const M ='),mathEnd=html.indexOf('  function seeded',mathStart);
  assert(mathStart>=0&&mathEnd>mathStart);
  html=html.slice(0,mathStart)+html.slice(mathStart,mathEnd).replaceAll('Float32Array','Float64Array')+html.slice(mathEnd);
  replace('return new Float32Array([x[0]*len','return new Float64Array([x[0]*len');
  replace('gl.uniformMatrix4fv(u.uModel,false,model);gl.uniformMatrix4fv(u.uVP,false,this.vp);gl.uniform3fv(u.uEye,this.eye);',`const relative=new Float32Array(model);for(let i=0;i<3;i++)relative[12+i]=model[12+i]-this.eye[i];
      gl.uniformMatrix4fv(u.uModel,false,relative);gl.uniformMatrix4fv(u.uVP,false,new Float32Array(M.mul(this.vp,M.translate(...this.eye))));gl.uniform3fv(u.uEye,[0,0,0]);`);
  replace('gl.uniformMatrix4fv(this.fu.uMatrix,false,matrix);','gl.uniformMatrix4fv(this.fu.uMatrix,false,new Float32Array(matrix));');
  replace('dynamicFlat(data,points=false,alpha=1){let gl=this.gl;',`dynamicFlat(data,points=false,alpha=1){data=data.slice();for(let i=0;i<data.length;i+=7)for(let j=0;j<3;j++)data[i+j]-=this.eye[j];let gl=this.gl;`);
  replace('this.drawFlat({buffer:this.dynamic,count:data.length/7},this.vp,points,alpha)','this.drawFlat({buffer:this.dynamic,count:data.length/7},M.mul(this.vp,M.translate(...this.eye)),points,alpha)');
  replace('const projection=M.perspective(this.fov,this.width/this.height,.035,22000);','const projection=M.perspective(this.fov,this.width/this.height,mix(.035,Math.max(.035,layout.length*.04),blend),22000);');
  replace('gl_Position=uVP*world;}',`gl_Position=uVP*world;
      // Negative UV.x marks solid ship material layers; leave real textures/effects untouched.
      gl_Position.z-=max(0.,-aUV.x)*(2./16777216.)*gl_Position.w;
    }`);
  replace('  class Geometry {',plumeEnvelope.toString()+'\n'+plumeMeshData.toString()+'\n'+mainGunGlow.toString()+'\n  class Geometry {');
  replace('plume.cylinder(1,1,[.5,0,0],C.blue,14,0,1,0);','plume.data=plumeMeshData();');
  replace('vNormal=mat3(uModel)*aNormal;', 'vNormal=mat3(cross(uModel[1].xyz,uModel[2].xyz),cross(uModel[2].xyz,uModel[0].xyz),cross(uModel[0].xyz,uModel[1].xyz))*aNormal;');
  replace('uniform float uFighter;', 'uniform float uNearFade; uniform float uFighter;');
  replace("'uTint','uFighter']", "'uNearFade','uTint','uFighter']");
  replace('gl.uniform1f(u.uFighter,opts.fighter?1:0);', 'gl.uniform1f(u.uNearFade,opts.nearFade||0);gl.uniform1f(u.uFighter,opts.fighter?1:0);');
  replace('gl_FragColor=vec4(color*uExposure,uOpacity);',`float alpha=uOpacity;
      if(uMode>3.5){
        float x=clamp(vLocal.x,0.,1.);
        float softEdge=(1.-smoothstep(.05,1.,abs(vUV.y)))*smoothstep(0.,.3,abs(dot(N,V)))*.65;
        float cells=.83+.17*cos(x*38.-uTime*7.);
        alpha*=pow(1.-x,1.15)*softEdge*cells;
        if(uNearFade>0.)alpha*=smoothstep(uNearFade*.5,uNearFade*2.,length(vWorld));
        color=mix(uTint,vec3(1.),.24*pow(1.-x,5.));
      }
      gl_FragColor=vec4(color*uExposure,alpha);`);
  block('      // Engine plumes scale','      for(let b of p.beams',`      // All exhaust starts inside the measured nozzle surface and follows the ship frame.
      if(ownOpacity>.05&&blend>.04){
        gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
        const drive=layout.propulsion;
        for(const [i,e] of layout.engines.entries()){
          const envelope=plumeEnvelope(p.throttle,p.boostActive,time,drive.pulse,i),start=M.transform(own,e.position);
          const direction=V.norm(V.sub(M.transform(own,e.direction),M.transform(own,[0,0,0]))),length=e.radius*envelope.length,end=V.add(start,V.scale(direction,length));
          this.drawMesh(this.plumeMesh,this.segmentModel(start,end,e.radius*envelope.width),{mode:4,tint:drive.color,opacity:ownOpacity*envelope.alpha,nearFade:layout.length*.08});
          this.drawMesh(this.plumeMesh,this.segmentModel(start,end,e.radius*.42),{mode:4,tint:drive.core,opacity:ownOpacity*envelope.alpha*.75,nearFade:layout.length*.08});
        }
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
      }`);
  replace('  // HF-01:', '  LAYOUTS.splice(0,LAYOUTS.length,...window.FlightFleet.layouts);\n  // HF-01:');
  html=html.replace(/this\.fighterGeometry=buildFighter\(\);this\.shipMeshes=.*?;/,`this.shipMeshes=window.FlightFleet.ships.map(s=>{const g=new Geometry();g.data=window.FlightFleet.vertices.subarray(s.offset,s.offset+s.floatCount);return g.upload(gl);});`);
  replace('    drawVessel(index,model,opts={},turrets=null){','    drawVessel(index,model,opts={},turrets=null){');
  replace('      if(LAYOUTS[index].mounts.length){','      if(false){ // Approved models already contain their low-profile weapons.');
  replace('  const STAT_LABELS=', '  SHIPS.splice(0,SHIPS.length,...window.FlightFleet.ships);\n  const STAT_LABELS=');
  replace('  const shortAngle =','  COMBAT.splice(0,COMBAT.length,...window.FlightFleet.profiles);\n  const shortAngle =');
  html=html.replaceAll('[37,35,33,23,39][state.shipIndex]','LAYOUTS[state.shipIndex].archiveDistance');
  html=html.replaceAll('targetDistance+e.deltaY*.016,14,38','targetDistance+e.deltaY*.001*LAYOUTS[state.shipIndex].length,LAYOUTS[state.shipIndex].length*1.4,LAYOUTS[state.shipIndex].length*5');
  replace('const fmt=n=>Math.round(n).toLocaleString(\'en-US\');',"const fmt=n=>n==null?'待取得':Math.round(n).toLocaleString('en-US');");
  // The range opens directly in flight; ship browsing lives in ships.html.
  replace('configureFlight(1,true);screenVisible(\'archive\');',`const initial=Math.max(0,SHIPS.findIndex(s=>s.id===new URLSearchParams(location.search).get('ship')));configureFlight(initial,true);screenVisible('flight');`);
  replace('  function transitionTo(to){',`  function transitionTo(to){
    if(to==='archive'){location.assign('ships.html?ship='+encodeURIComponent(SHIPS[state.shipIndex].id));return;}`);
  // Retain the shared data bindings, but never expose the obsolete intermediate screen.
  replace('</style>','\n#archive{display:none!important}\n</style>');
  html=html.replace(/(<nav class="combat-selector[^>]+>)[\s\S]*?(<\/nav>)/,(_,a,b)=>a+fleet.ships.map((s,i)=>`<button data-combat-ship="${i}" aria-pressed="false">${s.name}</button>`).join('')+b);
  replace('</style>',`\n.combat-selector{max-width:calc(100vw - 64px);flex-wrap:wrap;gap:4px}.combat-selector button{padding:7px 10px;font-size:11px}.combat-identity h1{font-size:26px}.ship-title h1{font-size:clamp(28px,3vw,50px)}\n</style>`);
  replace("    $('#loadout-caption').textContent=", "    $('#loadout-caption').textContent=");
  html=html.replace(/    \$\('#loadout-caption'\)\.textContent=.*?;/,`    $('#loadout-caption').textContent=LAYOUTS[state.shipIndex].main.length+' 个主炮口 · '+LAYOUTS[state.shipIndex].tubes.length+' 个导弹口 · '+LAYOUTS[state.shipIndex].mounts.length+' 座近防炮';
    $('#weapon-primary-name').textContent=c.primaryName;
    $('#system-engine > span:nth-child(2)').textContent=LAYOUTS[state.shipIndex].propulsion.name;
    $('#fire-salvo').disabled=!c.salvo;$('#fire-spinal').disabled=c.primaryKind==='none';
    $('#flight-input-copy').textContent='右键转向 · W/S 油门 · Space 主炮 · R 导弹 · V 舰桥/追踪 · X 对准目标';`);
  // Cockpit/bridge selection follows the ship class, rather than the old five-slot order.
  html=html.replaceAll('s.shipIndex===3||s.shipIndex===2?this.cockpit:this.bridgeMesh','!p.profile.capital?this.cockpit:this.bridgeMesh');
  html=html.replaceAll('s.shipIndex===3?clamp((blend-.035)/.18,0,1):1','!p.profile.capital?clamp((blend-.035)/.18,0,1):1');
  replace('Math.sin(blend*Math.PI)*layout.scale*3','Math.sin(blend*Math.PI)*layout.length*.15');
  // The old renderer's main-gun overlay must tolerate a self-defense-only flagship.
  html=html.replaceAll('LAYOUTS[state.shipIndex].main[0])','(LAYOUTS[state.shipIndex].main[0]||[0,0,0]))');
  block('  function fireMain(){','  // A segment / oriented ellipsoid',`  function fireMain(){
    const p=state.flight,c=p.profile;if(!canFire()||p.gunCooldown>0||p.charging)return false;
    if(!c.primaryKind){if(c.capital&&!c.fixedPrimary){fireTurrets();return true;}dischargeMain();return true;}
    if(c.primaryKind==='none'){notice('该旗舰仅配置近防自卫武器');return false;}
    if(c.primaryKind==='missile'){fireMissile();return true;}
    if(c.chargeTime>0){p.charging=true;p.charge=0;tone('charge');}else dischargeMain();return true;
  }`);
  block('  function dischargeMain(){','  function fireMissile(){',`  function dischargeMain(){
    const p=state.flight,c=p.profile,layout=LAYOUTS[state.shipIndex],model=shipMatrix(p,state.shipIndex),f=forward();
    p.charging=false;p.charge=0;p.gunCooldown=c.mainCooldown;p.mainShots++;p.shake=Math.min(.35,c.relativeLength*.005);
    for(const m of layout.main){
      const start=M.transform(model,m);burst(start,c.visual.capital?22:8,c.weaponColor,.18,c.visual.capital?10:4);
      if(c.visual.capital)p.beams.push({start,end:V.add(start,V.scale(f,c.visual.radius*5)),age:0,life:.18,width:c.visual.radius*1.6,color:c.weaponColor});
      if(c.beam){
        let end=V.add(start,V.scale(f,1800)),best=1,target=null;
        for(const t of p.targets){const k=hitSegment(start,end,t);if(k!==null&&k<best){best=k;target=t;}}
        if(target){end=start.map((v,i)=>mix(v,end[i],best));damageTarget(target,c.mainDamage/layout.main.length);burst(end,14,c.weaponColor,.5,18);}
        p.beams.push({start,end,age:0,life:c.primaryKind==='laser'?.65:.12,width:c.visual.capital?c.visual.radius:c.beamWidth,color:c.weaponColor});
      }else p.projectiles.push({pos:start,previous:[...start],velocity:V.scale(f,c.projectileSpeed),age:0,life:12,missile:false,damage:c.mainDamage/layout.main.length,color:c.weaponColor,kind:c.primaryKind,width:c.beamWidth,visual:c.visual});
    }
    tone('fire');notice(c.primaryName+' 已开火');
  }`);
  replace('if(!canFire())return;\n    if(p.missileCooldown>0)',"if(!canFire())return;if(!LAYOUTS[state.shipIndex].tubes.length){notice('此舰未配置导弹');return;}\n    if(p.missileCooldown>0)");
  replace('const eject=p.profile.capital?V.add(V.scale(a.up,28),V.scale(a.forward,9)):V.scale(a.forward,42);','const eject=V.scale(a.forward,42);');
  replace('const transform=q=>{let v=V.sub(q,t.pos),co=Math.cos(t.heading||0),si=Math.sin(t.heading||0),sx=t.kind===1?11.2:8.6,sz=t.kind===1?3.5:2.8;return[(co*v[0]-si*v[2])/(t.scale*sx),v[1]/(t.scale*2.05),(si*v[0]+co*v[2])/(t.scale*sz)]};',`const transform=q=>{const v=V.sub(q,t.pos),co=Math.cos(t.heading||0),si=Math.sin(t.heading||0),b=LAYOUTS[t.kind].bounds;return[(co*v[0]-si*v[2]-b.center[0]*t.scale)/(t.scale*b.half[0]),(v[1]-b.center[1]*t.scale)/(t.scale*b.half[1]),(si*v[0]+co*v[2]-b.center[2]*t.scale)/(t.scale*b.half[2])];};`);
  replace('  function updateTurrets(dt){',`  const PD_RANGE=80,PD_SPEED=145;
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
  function updateTurrets(dt){`);
  replace('const a=axes(p),model=shipMatrix(p,state.shipIndex),target=selectedTarget();','const a=axes(p),model=shipMatrix(p,state.shipIndex);');
  block('    let manual=null;','    for(let t of p.turrets){','');
  replace('      let goal=manual;','      const target=pdTarget(origin);t.pdTarget=target;t.aligned=false;t.inArc=false;\n      let goal=null;');
  replace('if(!goal&&target){let tof=V.length(V.sub(target.pos,origin))/430;goal=V.add(target.pos,V.scale(target.velocity||[0,0,0],tof));}','if(target)goal=pdAim(origin,target);');
  replace("p.elapsed>2&&target?.hp>0&&t.aligned","p.elapsed>2&&target&&t.aligned");
  block('  function shootTurret(t){','  function fireTurrets(){',`  function shootTurret(t){
    const p=state.flight,c=p.profile;if(!t.transform||t.cooldown>0||!t.inArc||p.turretMode==='hold')return false;
    const local=LAYOUTS[state.shipIndex].pdMuzzles[t.index],start=M.transform(shipMatrix(p,state.shipIndex),local);
    const target=t.pdTarget;if(!target||(!pdMissile(target)&&!pdFighter(target))||V.length(V.sub(target.pos,start))>PD_RANGE)return false;
    t.cooldown=.045;t.recoil=.03;p.turretShots++;
    const dir=V.norm(V.sub(pdAim(start,target),start));
    p.projectiles.push({pos:start,previous:[...start],velocity:V.scale(dir,PD_SPEED),age:0,life:PD_RANGE/PD_SPEED,missile:false,damage:c.turretDamage,color:[1,.76,.35],kind:'pd',width:.018});
    return true;
  }`);
  replace('    p.projectiles=p.projectiles.filter(q=>{','    for(const q of p.projectiles)if(pdMissile(q)){q.pdPrevious=[...q.pos];q.pdNext=V.add(q.pos,V.scale(q.velocity,dt));}\n    p.projectiles=p.projectiles.filter(q=>{');
  replace('      q.age+=dt;q.previous=[...q.pos];','      if(q.intercepted)return false;\n      const step=q.kind===\'pd\'?Math.min(dt,Math.max(0,q.life-q.age)):dt;\n      q.age+=dt;q.previous=[...q.pos];');
  replace('      q.pos=V.add(q.pos,V.scale(q.velocity,dt));','      q.pos=V.add(q.pos,V.scale(q.velocity,step));');
  replace('      if(q.hostile){',`      if(q.kind==='pd'){
        for(const missile of p.projectiles){
          if(!pdMissile(missile))continue;
          const from=V.sub(q.previous,missile.pdPrevious),to=V.sub(q.pos,missile.pdNext),d=V.sub(to,from),u=clamp(-V.dot(from,d)/(V.dot(d,d)||1),0,1);
          if(V.length(V.add(from,V.scale(d,u)))<1.5){pdIntercept(missile);return false;}
        }
      }
      if(q.hostile){`);
  replace('for(let t of p.targets){const k=hitSegment(q.previous,q.pos,t);',"for(let t of p.targets){if(q.kind==='pd'&&!pdFighter(t))continue;const k=hitSegment(q.previous,q.pos,t);");
  replace('    p.beams=p.beams.filter', '    p.projectiles=p.projectiles.filter(q=>!q.intercepted);\n    p.beams=p.beams.filter');
  // Enemy missiles use the existing homing/trail path, so interceptions occur in flight.
  replace('if(q.age>.35&&q.target?.hp>0)', 'if(q.age>.35&&(q.hostile?p.hull>0:q.target?.hp>0))');
  replace('age:0,life:10,hostile:true,damage:0','age:0,life:10,hostile:true,missile:true,target:p,trail:[[...enemy.pos]],trailClock:0,seed:0,damage:0');
  html=html.replaceAll('旋转炮塔','近防机炮');
  replace("+' 座近防炮';","+' 座近防炮（800 m / 仅战机与导弹 / 拦截 0.1%）';");
  replace('target:order.target,trail:', 'target:order.target,visual:p.profile.visual,color:p.profile.weaponColor,trail:');
  replace('glows.push(...x,.38,.82,1,7+p.charge*16)', 'glows.push(...x,...p.profile.weaponColor,(p.profile.visual?.muzzle||22)*(.35+p.charge*.85))');
  replace("const back=V.add(q.pos,V.scale(V.norm(q.velocity),-(q.hostile?11:8))),c=q.hostile?[.94,.3,.2]:[.6,.86,1];",`const back=V.add(q.pos,V.scale(V.norm(q.velocity),-(q.visual?.capital?Math.min(q.visual.trail,q.age*V.length(q.velocity)):q.kind==='pd'?1.3:q.hostile?11:3))),c=q.color||(q.hostile?[.94,.3,.2]:[.6,.86,1]);
          if(q.visual?.capital){
            gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
            this.drawMesh(this.plumeMesh,this.segmentModel(q.pos,back,q.visual.radius*2.4),{mode:4,tint:c,opacity:.6});
            this.drawMesh(this.plumeMesh,this.segmentModel(q.pos,back,q.visual.radius*.55),{mode:4,tint:[1,.96,.9],opacity:.95});
            gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
            const glow=mainGunGlow(q.visual,V.length(V.sub(q.pos,this.eye)),this.height,this.fov);
            heads.push(...q.pos,c[0]*.48,c[1]*.48,c[2]*.48,glow,...q.pos,1,.96,.9,glow*.32);
          }`);
  replace('heads.push(...q.pos,1,.77,.42,4.5);',`heads.push(...q.pos,...(q.color||[1,.77,.42]),q.visual?.capital?mainGunGlow(q.visual,V.length(V.sub(q.pos,this.eye)),this.height,this.fov):4.5);`);
  replace('if(q.missile)burst(q.pos,35,[1,.68,.27],1.3,28);',"if(q.missile)burst(q.pos,35,q.color||[.72,.47,1],1.3,q.visual?.impact||28);else if(q.kind&&q.kind!=='pd')burst(q.pos,q.kind==='nuclear'?90:q.visual?.capital?55:24,q.color,q.visual?.capital?1.2:.8,q.visual?.impact||18);");
  return upgradeArticulatedWeapons(html);
}
