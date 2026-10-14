import assert from 'node:assert/strict';
import {antimatterDamage,specialRingData,specialBlastPhase} from '../game/special-combat.mjs';

export function upgradeSpecialShips(html){
  const replace=(a,b)=>{assert(html.includes(a),'Special ship anchor: '+a.slice(0,80));html=html.replace(a,()=>b);};
  replace('  class Renderer {',specialRingData.toString()+'\n'+specialBlastPhase.toString()+'\n  class Renderer {');
  replace('      this.grid=this.makeGrid();','      const ring=new Geometry();ring.data=specialRingData();this.specialRing=ring.upload(gl);\n      this.grid=this.makeGrid();');
  replace('      gl_FragColor=vec4(color*uExposure,alpha);',`
      if(uMode>8.5&&uMode<9.5){
        vec3 q=normalize(vLocal);float n=sceneFbm(q*6.+vec3(uImpact.w*-.7,uImpact.w*.4,0));
        float rim=pow(1.-abs(dot(N,V)),1.5);
        float filaments=pow(1.-abs(n-.5)*1.8,6.);
        color=mix(uTint,vec3(1.,.96,1.),filaments*.65);
        alpha=(rim*.55+filaments*.33)*uOpacity;
      }
      if(uMode>9.5&&uMode<10.5){
        float edge=pow(max(0.,sin(vUV.y*3.141593)),2.);
        float arcs=.65+.35*sin(vUV.x*100.+uTime*9.);
        color=mix(uTint,vec3(1.),pow(edge,6.)*.65);alpha=edge*arcs*uOpacity;
      }
      gl_FragColor=vec4(color*uExposure,alpha);`);
  replace('    drawBeam(a,b,width,color,opacity=1){',`    drawSpecial(p,time){
      const gl=this.gl;gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      if(p.profile.special==='reaper'&&(p.charging||p.reaperCut)){
        const model=this.ownModel,layout=LAYOUTS[window.GalacticDemo.state.shipIndex],energy=p.charging?p.charge:1;
        for(const muzzle of layout.main){
          const at=M.transform(model,muzzle);
          for(let i=0;i<3;i++){const r=layout.length*.019*(1+i*.35),offset=M.transform(model,[muzzle[0]-i*r*.8,muzzle[1],muzzle[2]]);this.drawMesh(this.specialRing,M.compose(offset,[time+i,.5+i,time*.2],[r,r,r]),{mode:10,tint:[.12,1,.65],opacity:energy*.7});}
          if(p.reaperCut){
            const end=p.reaperCut.target.pos,axis=V.norm(V.sub(end,at)),right=V.norm(V.cross(axis,[0,1,0])),up=V.cross(right,axis),lines=[];
            let previous=null;
            for(let j=0;j<=64;j++){const f=j/64,a=f*40-time*18,r=Math.sin(f*Math.PI)*layout.length*.035,point=at.map((v,k)=>mix(v,end[k],f)+(right[k]*Math.cos(a)+up[k]*Math.sin(a))*r);if(previous)lines.push(...previous,.14,.65,.46,1,...point,.45,1,.72,1);previous=point;}
            this.dynamicFlat(lines,false,.65);
          }
        }
      }
      for(const e of p.specialBlasts||[]){
        const {collapse,wave,fade}=specialBlastPhase(e.age),at=e.pos,r=e.radius;
        if(collapse>0){
          const s=8+65*collapse;this.drawMesh(this.moonMesh,M.compose(at,[0,time,0],[s,s,s]),{mode:9,tint:[.63,.16,1],opacity:collapse,impact:[0,0,0,e.age]});
          for(let i=0;i<3;i++){const s=20+collapse*150;this.drawMesh(this.specialRing,M.compose(at,[i*.8,time*.2,i*.65],[s,s,s]),{mode:10,tint:[.45,.5,1],opacity:collapse*.8});}
        }
        if(wave>0){
          const bloom=(16+110*Math.sin(Math.min(1,wave*1.4)*Math.PI*.7))*(.4+.6*fade);
          this.drawMesh(this.moonMesh,M.compose(at,[e.age*.2,0,0],[bloom,bloom,bloom]),{mode:9,tint:[.62,.22,1],opacity:fade*.75,impact:[0,0,0,e.age]});
          for(let i=0;i<3;i++){
            const s=r*wave*(1-i*.12);this.drawMesh(this.specialRing,M.compose(at,[.18+i*.63,.3+i*.45,i*.24],[s,s,s]),{mode:10,tint:i===1?[.1,.7,1]:[.8,.38,1],opacity:fade*(i===0?.9:.5)});
          }
          // Stable, seeded ejecta streamers, rather than a cloud of random orange points.
          const lines=[],heads=[];
          for(let i=0;i<110;i++){
            const a=i*2.399963,b=1-2*(i+.5)/110,z=Math.sqrt(1-b*b),dir=[Math.cos(a)*z,b,Math.sin(a)*z];
            const distance=r*wave*(.4+.55*Math.abs(Math.sin(i*43.1))),tip=at.map((v,j)=>v+dir[j]*distance),tail=at.map((v,j)=>v+dir[j]*distance*(.88-.1*fade));
            lines.push(...tail,.08*fade,.22*fade,.5*fade,1,...tip,.7*fade,.65*fade,fade,1);heads.push(...tip,.6*fade,.8*fade,fade,3*fade);
          }
          this.dynamicFlat(lines,false,fade);this.dynamicFlat(heads,true,fade);
          const flash=Math.exp(-Math.max(0,e.age-.3)*8),s=12+flash*60;
          this.drawMesh(this.moonMesh,M.compose(at,[0,0,0],[s,s,s]),{mode:3,tint:[1,.94,1],opacity:flash});
        }
      }
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
    }
    drawBeam(a,b,width,color,opacity=1){`);
  replace('      const eye=M.transform(shipFrame,eyeLocal),dir=', '      let eye=M.transform(shipFrame,eyeLocal),dir=');
  replace('      this.eye=eye;this.cameraForward=V.norm(dir);',`      if(p.detonated){const e=p.detonated,q=Math.min(1,e.age/.3),dest=V.add(e.pos,[e.radius*.72,e.radius*.4,e.radius*1.35]);eye=eye.map((v,i)=>mix(v,dest[i],q));dir=V.norm(V.sub(e.pos,eye));}
      this.eye=eye;this.cameraForward=V.norm(dir);`);
  replace('      const ownOpacity=!p.profile.capital?', '      const ownOpacity=p.detonated?0:!p.profile.capital?');
  replace('      // The interior is fixed', '      this.drawSpecial(p,time);\n      // The interior is fixed');
  replace('      const interiorAlpha=clamp(1-blend/.17,0,1);','      const interiorAlpha=p.detonated?0:clamp(1-blend/.17,0,1);');
  replace('      shieldHits:[],shieldRegenDelay:0,','      specialBlasts:[],assault:null,detonated:null,reaperCut:null,blastHits:0,shieldHits:[],shieldRegenDelay:0,');
  replace('    p.throttle=clamp(p.throttle,0,100);',`    if(c.special==='reaper'&&reset)p.shield=c.trialShield;
    if(c.special==='antimatter'){p.shield=0;p.external=true;p.cameraBlend=1;}
    p.throttle=clamp(p.throttle,0,100);`);
  replace('  function fireMain(){',`  function fireMain(){
    if(state.flight.profile.special)return fireSpecial();`);
  replace('  function dischargeMain(){',`  function dischargeMain(){
    if(state.flight.profile.special){dischargeSpecial();return;}`);
  replace('  function updateFlight(dt){',specialRuntime+'\n  function updateFlight(dt){');
  replace('    const p=state.flight,c=p.profile;p.elapsed+=dt;',`    const p=state.flight,c=p.profile;
    updateSpecial(dt);
    if(p.detonated){updateCamera(dt);updateProjectiles(dt);return;}
    p.elapsed+=dt;`);
  // Autonomous missile guidance runs after ordinary input, with a swept collision test.
  replace('    if(t?.hp>0){let d=V.norm', '    guideSpecial(dt);\n    if(t?.hp>0){let d=V.norm');
  replace('    renderContacts();\n  }', '    renderContacts();\n  }');
  replace('    $(\'#speed-value\').textContent=',`    $('#special-readout').hidden=!c.special;
    if(c.special)$('#special-readout').textContent=c.special==='antimatter'?(p.detonated?'湮灭完成 · 波及 '+p.blastHits+' 艘 · 5 秒后补充演练弹':p.assault?'自行突击 · 接近引信已开启':p.charging?'约束场解锁中':'反物质自行导弹 · 点击目标锁定，Space 发射 · 伤害半径 6.8 km'):(p.reaperCut?'相位收割 · 切割与护盾回收中':'RAVEN 收割者 · 双束相位收割 / 低矮副炮 / 导弹 · 原创试装');
    $('#speed-value').textContent=`);
  replace('    $$(\'[data-combat-ship]\').forEach',`    if(c.special){
      $('#loadout-caption').textContent=c.special==='antimatter'?'无人一次性弹体 · 无炮塔 · 无驾驶舱 · 范围伤害忽略护盾 / 收割者免疫':'原创演练配置 · 双束相位切割 · 护盾回收 · 2 座副炮 / 2 座近防 / 4 个导弹口';
      $('#fire-spinal > span:nth-child(2)').innerHTML=c.special==='antimatter'?'自行突击<small>先锁定目标 · 弹体接近引爆</small>':'相位收割<small>蓄能 1.1 秒 · 持续切割</small>';
      $('#change-view').hidden=c.special==='antimatter';
    }else $('#change-view').hidden=false;
    $$('[data-combat-ship]').forEach`);
  replace('  function setView(){',"  function setView(){if(state.flight.profile.special==='antimatter')return;");
  replace('<div class="scene-controls">','<div id="special-readout" hidden role="status"></div><div class="scene-controls">');
  replace('</style>',`\n#special-readout{position:absolute;bottom:21vh;left:50%;transform:translateX(-50%);max-width:48vw;text-align:center;color:#b9ffe4;font-size:12px;letter-spacing:.08em;background:#041417b8;padding:9px 16px;border-top:1px solid #5dd9b566;pointer-events:none}.combat-selector{max-width:75vw}\n</style>`);
  return html;
}

const specialRuntime=antimatterDamage.toString()+`
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
`;
