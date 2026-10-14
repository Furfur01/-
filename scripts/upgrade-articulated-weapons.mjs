import assert from 'node:assert/strict';
import {jointTransforms,slewJoint,hullBlocks} from '../game/ship-turrets.mjs';
import {upgradeFlightControls} from './upgrade-flight-controls.mjs';

export function upgradeArticulatedWeapons(html){
  const replace=(a,b)=>{assert(html.includes(a),a.slice(0,100));html=html.replace(a,()=>b);};
  const block=(a,b,s)=>{const x=html.indexOf(a),y=html.indexOf(b,x);assert(x>=0&&y>x,a);html=html.slice(0,x)+s+'\n'+html.slice(y);};
  replace('  function turretTransforms(',jointTransforms.toString()+'\n  function turretTransforms(');
  replace('this.shipMeshes=window.FlightFleet.ships.map',`this.jointMeshes=window.FlightFleet.parts.map(s=>{const g=new Geometry();g.data=window.FlightFleet.vertices.subarray(s.offset,s.offset+s.floatCount);return g.upload(gl);});this.shipMeshes=window.FlightFleet.ships.map`);
  block('      if(false){ // Approved models','    segmentModel(',`      for(const t of turrets||LAYOUTS[index].joints){const a=jointTransforms(M,model,t);this.drawMesh(this.jointMeshes[t.parts[0]],a.yaw,opts);this.drawMesh(this.jointMeshes[t.parts[1]],a.barrels,opts);}
    }
`);
  replace('p.turrets);','p.joints);');
  replace('const ready=p.turrets.filter(t=>t.aligned).length,total=p.turrets.length;',"const ready=p.joints.filter(t=>t.role!=='main'&&t.aligned).length,total=p.joints.filter(t=>t.role!=='main').length;");
  replace('axes,shipMatrix,turretTransforms};','axes,shipMatrix,turretTransforms,jointTransforms};');
  replace('axes,shipMatrix,turretTransforms}=GalaxyRender;','axes,shipMatrix,turretTransforms,jointTransforms}=GalaxyRender;');
  const start='    p.turrets=l.mounts.map',end='    if(reset){';
  block(start,end,`    p.joints=l.joints.map(t=>({...t,yaw:0,pitch:0,cooldown:.4,aligned:false,inArc:false}));
    p.turrets=p.joints.filter(t=>t.role==='pd');p.turrets.forEach((t,i)=>t.index=i);`);
  replace('  const PD_RANGE=',slewJoint.toString()+'\n'+hullBlocks.toString()+'\n  const PD_RANGE=');
  block('  function updateTurrets(dt){','  function shootTurret(t){',`  function defenseTarget(origin,range){
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
    if(c.defenseOnly&&p.turretMode==='auto'&&p.missileCooldown<=0&&p.missileStock>0&&defenseTarget(p.pos,160))fireMissile();
  }
  function shootSecondary(t){
    const p=state.flight,c=p.profile.secondary;if(!t.aligned||t.cooldown>0||p.turretMode==='hold')return false;
    t.cooldown=c.cooldown;p.turretShots++;
    for(let side=0;side<2;side++){
      const {start,dir}=weaponRay(t,side),color=c.color;
      if(c.kind==='laser'){
        let end=V.add(start,V.scale(dir,c.range)),best=1,hit=null;
        for(const target of p.targets){if(p.profile.defenseOnly&&!pdFighter(target))continue;const k=hitSegment(start,end,target);if(k!==null&&k<best){best=k;hit=target;}}
        if(hit){end=start.map((v,i)=>mix(v,end[i],best));damageTarget(hit,c.damage);}
        p.beams.push({start,end,age:0,life:.15,width:t.scale*.07,color});
      }else p.projectiles.push({pos:start,previous:[...start],velocity:V.scale(dir,c.speed),age:0,life:c.range/c.speed,missile:false,damage:c.damage,color,kind:'secondary',defensive:p.profile.defenseOnly,width:t.scale*.09});
      burst(start,3,color,.14,3);
    }return true;
  }`);
  replace('const local=LAYOUTS[state.shipIndex].pdMuzzles[t.index],start=M.transform(shipMatrix(p,state.shipIndex),local);','const {start,dir}=weaponRay(t);');
  replace('    const dir=V.norm(V.sub(pdAim(start,target),start));','');
  replace('for(let t of p.turrets)if(t.aligned)shootTurret(t);',"for(const t of p.joints)if(t.aligned&&clearWeapon(t)){if(t.role==='pd')shootTurret(t);else if(t.role==='secondary')shootSecondary(t);}");
  replace('    for(const m of layout.main){\n      const start=M.transform(model,m);',`    const main=p.joints.filter(t=>t.role==='main');
    const rays=main.length?main.filter(t=>t.aligned&&clearWeapon(t)).flatMap(t=>[weaponRay(t,0),weaponRay(t,1)]):layout.main.map(m=>({start:M.transform(model,m),dir:f}));
    if(!rays.length){p.gunCooldown=0;p.mainShots--;notice('主炮正在转向，或舰体遮挡射界');return;}
    for(const {start,dir:f} of rays){`);
  replace("const target=selectedTarget();if(!target||target.hp<=0){notice('当前目标已失能 · 按 T 切换目标');return;}","const target=c.defenseOnly?defenseTarget(p.pos,160):selectedTarget();if(!target||(!pdMissile(target)&&target.hp<=0)){notice(c.defenseOnly?'1600 m 内无导弹或战机目标':'当前目标已失能 · 按 T 切换目标');return;}");
  replace('const eject=V.scale(a.forward,42);',`const local=l.tubeDirections[order.tube],direction=V.norm(V.sub(M.transform(model,local),M.transform(model,[0,0,0]))),eject=V.scale(direction,42);`);
  replace('missile:true,damage:p.profile.missileDamage,target:order.target',"missile:true,defensive:p.profile.defenseOnly,damage:p.profile.missileDamage,target:order.target");
  replace("(q.hostile?p.hull>0:q.target?.hp>0)","(q.hostile?p.hull>0:q.defensive?(pdMissile(q.target)||pdFighter(q.target)):q.target?.hp>0)");
  replace("      if(q.kind==='pd'){",`      if(q.defensive){
        for(const missile of p.projectiles){if(!pdMissile(missile))continue;const d=V.sub(q.pos,q.previous),u=clamp(V.dot(V.sub(missile.pos,q.previous),d)/(V.dot(d,d)||1),0,1);
          if(V.length(V.sub(missile.pos,V.add(q.previous,V.scale(d,u))))<1.5){missile.intercepted=true;burst(missile.pos,18,[.6,.9,1],.35,10);return false;}}
      }
      if(q.kind==='pd'){`);
  replace("if(q.kind==='pd'&&!pdFighter(t))continue;","if((q.kind==='pd'||q.defensive)&&!pdFighter(t))continue;");
  replace("+' 座近防炮（800 m", "+' 座近防炮 · '+LAYOUTS[state.shipIndex].joints.filter(t=>t.role==='secondary').length+' 座旋转副炮（近防 800 m");
  html=html.replaceAll('近防机炮','副炮 / 近防').replaceAll('该旗舰仅配置近防自卫武器','该旗舰仅配置自卫副炮与拦截导弹');
  return upgradeFlightControls(html);
}
