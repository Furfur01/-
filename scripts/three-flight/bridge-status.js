// Presentation helpers shared by the isolated HUD preview and the game.
export const percent=value=>Math.max(0,Math.min(100,Number(value)||0));
export function hullColor(hull){
 const damage=1-percent(hull)/100;
 return `rgb(${Math.round(100+155*damage)},${Math.round(224-161*damage)},${Math.round(235-159*damage)})`;
}
// Top-down schematic, not a claim about damage to individual compartments.
export const hullOutline=[[0,-1],[.18,-.82],[.22,-.48],[.42,-.36],[.42,.18],[.65,.38],[.65,.76],[.32,.68],[.28,1],[-.28,1],[-.32,.68],[-.65,.76],[-.65,.38],[-.42,.18],[-.42,-.36],[-.22,-.48],[-.18,-.82]];
export function paintCondition(c,s,x=28,y=570,w=584,h=290){
 const color=hullColor(s.hull),shield=percent(s.shield),hull=percent(s.hull);
 c.save();c.translate(x,y);c.strokeStyle='#315b70';c.beginPath();c.moveTo(0,0);c.lineTo(w,0);c.stroke();
 c.font='24px "Bahnschrift","Microsoft YaHei"';c.fillStyle='#88bacb';c.fillText('DAMAGE CONTROL / 舰体状态',0,34);
 const cx=112,cy=h*.56,scale=h*.33;
 c.strokeStyle=shield>0?'#65dfff':'#31434b';c.lineWidth=3;
 for(let i=0;i<24;i++){c.globalAlpha=i<Math.ceil(shield/100*24)?.9:.16;c.beginPath();c.ellipse(cx,cy,scale*.89,scale*1.18,0,-Math.PI/2+i*Math.PI/12,-Math.PI/2+(i+.72)*Math.PI/12);c.stroke();}c.globalAlpha=1;
 c.beginPath();hullOutline.forEach(([a,b],i)=>c[i?'lineTo':'moveTo'](cx+a*scale,cy+b*scale));c.closePath();c.fillStyle=color;c.globalAlpha=.2;c.fill();c.globalAlpha=1;c.strokeStyle=color;c.lineWidth=2.5;c.stroke();
 for(const [xx,yy,ww,hh]of [[-.13,-.65,.26,.55],[-.23,.02,.46,.45],[-.48,.42,.15,.24],[.33,.42,.15,.24]])c.strokeRect(cx+xx*scale,cy+yy*scale,ww*scale,hh*scale);
 c.beginPath();c.moveTo(cx,cy-scale*.8);c.lineTo(cx,cy+scale*.85);c.stroke();
 const left=252,bar=w-left;
 for(const [i,[name,value,ink]]of [['SHIELD / 护盾',shield,'#78dfff'],['HULL / 舰体',hull,color]].entries()){
  const yy=80+i*88;c.font='24px "Bahnschrift","Microsoft YaHei"';c.fillStyle='#8eb9c8';c.fillText(name,left,yy);c.textAlign='right';c.fillStyle=ink;c.font='32px Bahnschrift';c.fillText(Math.round(value)+'%',w,yy);c.textAlign='left';
  for(let j=0;j<20;j++){c.fillStyle=j<Math.ceil(value/5)?ink:'#173443';c.fillRect(left+j*bar/20,yy+17,bar/20-4,9);}
 }
 c.fillStyle=color;c.font='23px "Microsoft YaHei"';c.fillText(hull<=25?'舰体危急':hull<60?'舰体受损':'舰体完整',left,h-18);c.restore();
}
// Use real projectile trajectories. Receding shots and shots at other vessels
// are excluded; ETA is an estimate, not a promise of impact.
export function bridgeThreats(projectiles,{id,pos,velocity=[0,0,0],heading=0,radius=20,side}={}){
 const threats=[];
 if(!pos?.every(Number.isFinite)||!velocity?.every(Number.isFinite))return threats;
 radius=Number.isFinite(radius)?Math.max(0,radius):20;
 for(const q of projectiles||[]){
  if(q.intercepted||q.age>=q.life||q.source===id&&id!=null)continue;
  const targeted=id!=null&&q.target===id,hostile=q.hostile===true||(side!=null&&q.side!=null&&q.side!==side);
  if(!targeted&&!hostile)continue;
  if(!q.missile&&q.target!=null&&id!=null&&q.target!==id)continue;
  const p=q.pos||[q.x,q.y,q.z],v=q.velocity||(q.vx!=null?[q.vx,q.vy,q.vz]:[q.dx-q.x,q.dy-q.y,q.dz-q.z].map(n=>n/(Math.hypot(q.dx-q.x,q.dy-q.y,q.dz-q.z)||1)*(q.speed||0)));
  if(!p.every(Number.isFinite)||!v.every(Number.isFinite))continue;
  const delta=p.map((n,i)=>n-pos[i]),relative=v.map((n,i)=>n-velocity[i]),distance=Math.hypot(...delta),closing=-delta.reduce((sum,n,i)=>sum+n*relative[i],0)/Math.max(distance,.01);
  if(closing<=0)continue;
  const eta=Math.max(0,(distance-radius)/closing),t=-delta.reduce((sum,n,i)=>sum+n*relative[i],0)/Math.max(.01,relative.reduce((sum,n)=>sum+n*n,0)),miss=Math.hypot(...delta.map((n,i)=>n+relative[i]*t));
  if(eta>12||(!(q.missile&&targeted)&&miss>radius*1.6))continue;
  const right=-delta[0]*Math.cos(heading)+delta[2]*Math.sin(heading),front=delta[0]*Math.sin(heading)+delta[2]*Math.cos(heading);
  threats.push({id:q.id,eta,distance,pos:p,bearing:Math.atan2(right,front),direction:Math.abs(right)>Math.abs(front)?right>0?'右舷':'左舷':front>0?'舰艏':'舰艉',kind:q.missile?'导弹':'炮弹'});
 }
 return threats.sort((a,b)=>a.eta-b.eta);
}
