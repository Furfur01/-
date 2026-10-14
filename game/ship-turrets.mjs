export function jointTransforms(M,model,t){
  const base=M.mul(model,M.translate(...t.mount)),yaw=M.mul(base,M.ry(t.yaw||0));
  const barrels=M.mul(yaw,M.mul(M.translate(...t.pivot),M.mul(M.rz(-(t.pitch||0)),M.translate(...t.pivot.map(v=>-v)))));
  return {base,yaw,barrels};
}

export function slewJoint(t,d,dt){
  const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a)),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const yaw=Math.atan2(d[2],-d[0]),pitch=Math.atan2(d[1],Math.hypot(d[0],d[2]));
  const center=t.role==='main'?0:Math.sign(t.mount[2])*Math.PI/2,half=t.role==='main'?1.22:1.4;
  const angle=wrap(yaw-center),goal=center+clamp(angle,-half,half);
  t.inArc=Math.abs(angle)<=half&&pitch>=0&&pitch<=.7;
  t.yaw+=clamp(wrap(goal-t.yaw),-dt*.8,dt*.8);
  t.pitch+=clamp(clamp(pitch,0,.7)-t.pitch,-dt*.6,dt*.6);
  t.aligned=t.inArc&&Math.abs(wrap(yaw-t.yaw))<.018&&Math.abs(pitch-t.pitch)<.015;
}

// Test the rendered hull, not its enclosing box: tall bridges must block low gunfire.
export function hullBlocks(vertices,ship,origin,dir,maxDistance){
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
