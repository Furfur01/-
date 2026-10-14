export function missileTargetValid(q,flight){
  const t=q.target;if(!t||t.intercepted)return false;
  if(q.hostile)return t===flight&&flight.hull>0;
  if(t===flight)return false;
  if(t.missile)return !!q.defensive&&!!t.hostile&&t.age<t.life&&flight.projectiles.includes(t);
  return t.hp>0&&flight.targets.includes(t);
}

export function missileGuidance(q,dt){
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

export function segmentEllipsoidHit(start,end,center,half){
  const p=start.map((v,i)=>(v-center[i])/half[i]),d=end.map((v,i)=>(v-start[i])/half[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  const a=dot(d,d),u=a?Math.max(0,Math.min(1,-dot(p,d)/a)):0;
  return dot(p.map((v,i)=>v+d[i]*u),p.map((v,i)=>v+d[i]*u))<=1;
}

export function orbitDrag(yaw,pitch,dx,dy){return {yaw:yaw-dx*.006,pitch:Math.max(-.26,Math.min(.75,pitch-dy*.004))};}
