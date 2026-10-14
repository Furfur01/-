import assert from 'node:assert/strict';
import {missileTargetValid,missileGuidance,segmentEllipsoidHit,orbitDrag} from '../game/ship-missiles.mjs';
import {upgradeFlightScenes} from './upgrade-flight-scenes.mjs';

export function upgradeFlightControls(html){
  const replace=(a,b)=>{assert(html.includes(a),'Flight controls anchor: '+a.slice(0,80));html=html.replace(a,()=>b);};
  const block=(a,b,s)=>{const x=html.indexOf(a),y=html.indexOf(b,x);assert(x>=0&&y>x,a);html=html.slice(0,x)+s+'\n'+html.slice(y);};
  replace('<dl id="ship-stats" class="stats-list"></dl>', '<dl id="ship-stats" class="stats-list"></dl><p id="stats-source" style="font-size:11px;color:#91a6af"></p>');
  replace("$('#ship-stats').innerHTML=", "$('#stats-source').textContent=ship.statsSource?.startsWith('https:')?'基础参数：社区 Wiki · 版本待核对':ship.statsSource?.startsWith('research/')?'基础参数：用户截图':'基础参数：待取得';\n    $('#ship-stats').innerHTML=");
  replace('  function selectedTarget()', [missileTargetValid,missileGuidance,segmentEllipsoidHit,orbitDrag].map(f=>f.toString()).join('\n')+'\n  function selectedTarget()');
  replace('state.flight.orbitYaw+=dx*.006;state.flight.orbitPitch=clamp(state.flight.orbitPitch+dy*.004,-.26,.75)', 'const orbit=orbitDrag(state.flight.orbitYaw,state.flight.orbitPitch,dx,dy);state.flight.orbitYaw=orbit.yaw;state.flight.orbitPitch=orbit.pitch');
  replace('state.orbit.targetYaw+=dx*.006;state.orbit.targetPitch=clamp(state.orbit.targetPitch+dy*.0045,-.46,1.3)', 'const direction=activePointer.button===1?-1:1;state.orbit.targetYaw+=dx*.006*direction;state.orbit.targetPitch=clamp(state.orbit.targetPitch+dy*.0045*direction,-.46,1.3)');
  replace('salvoQueue:[],beams:[]', 'missileLock:null,missileLockTime:0,salvoQueue:[],beams:[]');
  replace('let p=state.flight;p.targetIndex=index;', 'let p=state.flight;p.targetIndex=index;p.missileLock=p.targets[index];p.missileLockTime=0;');
  replace('  function fireMissile(){',`  function updateMissileLock(dt){
    const p=state.flight,c=p.profile;
    const target=c.defenseOnly?(p.turretMode==='auto'?defenseTarget(p.pos,160):null):p.ai?selectedTarget():p.missileLock;
    if(target!==p.missileLock){p.missileLock=target;p.missileLockTime=0;}
    if(!missileTargetValid({target,defensive:c.defenseOnly},p)||V.length(V.sub(target.pos,p.pos))>(c.defenseOnly?160:2200)){p.missileLock=null;p.missileLockTime=0;return;}
    p.missileLockTime=Math.min(.4,p.missileLockTime+dt);
  }
  function fireMissile(){`);
  replace("const target=c.defenseOnly?defenseTarget(p.pos,160):selectedTarget();if(!target||(!pdMissile(target)&&target.hp<=0)){notice(c.defenseOnly?'1600 m 内无导弹或战机目标':'当前目标已失能 · 按 T 切换目标');return;}","const target=p.missileLock;if(p.missileLockTime<.4||!missileTargetValid({target,defensive:c.defenseOnly},p)){notice('导弹未锁定 · 点击目标或按 T 锁定');return;}");
  replace('    const start=M.transform(model,l.tubes[order.tube]);',`    if(p.missileLock!==order.target||p.missileLockTime<.4||!missileTargetValid({target:order.target,defensive:p.profile.defenseOnly},p)){p.missileStock=Math.min(p.profile.missileCapacity,p.missileStock+1);return;}
    const start=M.transform(model,l.tubes[order.tube]);`);
  replace('velocity:eject,age:0,life:13,missile:true', 'velocity:eject,ejectDirection:direction,age:0,life:p.profile.defenseOnly?5:13,missile:true');
  replace('    if(c.defenseOnly&&p.turretMode', '    updateMissileLock(dt);\n    if(c.defenseOnly&&p.missileLockTime>=.4&&p.turretMode');
  block('        if(q.age>.35&&','        q.trailClock+=dt;',`        if(!missileTargetValid(q,p)){burst(q.pos,8,q.color||[1,.65,.3],.24,6);return false;}
        if(q.age>.18&&!missileGuidance(q,dt)){burst(q.pos,8,q.color||[1,.65,.3],.24,6);return false;}`);
  replace('      if(q.intercepted)return false;', '      if(q.intercepted)return false;if(q.missile&&q.age+dt>=q.life){burst(q.pos,8,q.color||[1,.65,.3],.24,6);return false;}');
  block('        const radius=COMBAT[state.shipIndex].capital?', '          p.shield=Math.max',`        const model=shipMatrix(p,state.shipIndex),local=point=>{const d=V.sub(point,p.pos);return [0,1,2].map(i=>V.dot(d,[model[i*4],model[i*4+1],model[i*4+2]]));},bounds=LAYOUTS[state.shipIndex].bounds;
        if(segmentEllipsoidHit(local(q.previous),local(q.pos),bounds.center,bounds.half)){
          burst(q.pos,16,[1,.55,.2],.35,10);`);
  replace("const missile=p.missileCooldown>0?", "const missile=!c.salvo?'未配置':!p.missileLock?'未锁定':p.missileLockTime<.4?'锁定中':p.missileCooldown>0?");
  // Use relative swept segments so fast incoming missiles cannot pass between frames.
  replace('const d=V.sub(q.pos,q.previous),u=clamp(V.dot(V.sub(missile.pos,q.previous),d)/(V.dot(d,d)||1),0,1);\n          if(V.length(V.sub(missile.pos,V.add(q.previous,V.scale(d,u))))<1.5)', 'const from=V.sub(q.previous,missile.pdPrevious),to=V.sub(q.pos,missile.pdNext);\n          if(segmentEllipsoidHit(from,to,[0,0,0],[1.5,1.5,1.5]))');
  return upgradeFlightScenes(html);
}
