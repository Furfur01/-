// The five displays are physical surfaces in the fighter's local cockpit frame.
// Geometry, texture painting and pointer hit testing share these dimensions.
export const fighterDisplays=[
 {id:'contacts',pos:[-1.38,-.73,-2.08],size:[.52,.48],rotation:[-.17,.32,0]},
 {id:'weapons',pos:[-.72,-.77,-2.18],size:[.60,.48],rotation:[-.17,.14,0]},
 {id:'radar',pos:[0,-.76,-2.28],size:[.66,.64],rotation:[-.17,0,0]},
 {id:'flight',pos:[.72,-.77,-2.18],size:[.60,.48],rotation:[-.17,-.14,0]},
 {id:'systems',pos:[1.38,-.73,-2.08],size:[.52,.48],rotation:[-.17,-.32,0]}
];
export function consolePoint(panel,[x,y,z=0]){
 const [pitch,yaw]=panel.rotation,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),yy=y*cp-z*sp,zz=y*sp+z*cp;
 return [panel.pos[0]+x*cy+zz*sy,panel.pos[1]+yy,panel.pos[2]-x*sy+zz*cy];
}
const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0),sub=(a,b)=>a.map((v,i)=>v-b[i]);
export function consoleIntersection(origin,direction,panels=fighterDisplays){
 let nearest=null;
 for(const [index,p]of panels.entries()){
  const center=consolePoint(p,[0,0,.003]),right=sub(consolePoint(p,[1,0,.003]),center),up=sub(consolePoint(p,[0,1,.003]),center),normal=sub(consolePoint(p,[0,0,1.003]),center),den=dot(direction,normal);
  if(den>=-1e-6)continue;const distance=dot(sub(center,origin),normal)/den;if(distance<0)continue;
  const delta=sub(origin.map((v,i)=>v+direction[i]*distance),center),u=dot(delta,right)/p.size[0]+.5,v=.5-dot(delta,up)/p.size[1];
  if(u<0||u>1||v<0||v>1||nearest&&distance>nearest.distance)continue;nearest={index,surface:p.id,u,v,distance};
 }
 return nearest;
}

const C={background:'#03111c',line:'#315b70',muted:'#7aa7ba',text:'#cfedf4',cyan:'#82d9f3',gold:'#edc78c',red:'#ff8b7f'};
const number=v=>Math.round(v||0),percent=v=>Math.max(0,Math.min(100,number(v))),angle=v=>(Number(v||0)*180/Math.PI).toFixed(1)+'°';
const weaponLabel=s=>s?.reason==='unavailable'?'未装备':s?.reason==='cooldown'?s.cooldown.toFixed(1)+' s':s?.ready?'就绪':'待命';
export class FighterConsole {
 constructor(texture,panels=fighterDisplays){
  this.displays=panels.map(p=>{const canvas=document.createElement('canvas');canvas.width=640;canvas.height=p.height||(p.id==='radar'?640:480);return {...p,canvas,texture:texture(canvas),hits:[]};});
 }
 update(state,time=0){
  if(this.lastTime!=null&&time>=this.lastTime&&time-this.lastTime<1/30&&state?.name===this.state?.name)return;
  this.lastTime=time;this.state=state;
  for(const d of this.displays){d.hits=[];const c=d.canvas.getContext('2d'),h=d.canvas.height;
   c.fillStyle=C.background;c.fillRect(0,0,640,h);c.strokeStyle=C.line;c.lineWidth=2;c.strokeRect(10,10,620,h-20);
   const title=d.title||{contacts:'CONTACTS / 索敌',weapons:'WEAPON SYSTEMS / 武器',radar:'TACTICAL SCAN / 雷达',flight:'FLIGHT VECTOR / 飞行',systems:'SYSTEM STATUS / 系统'}[d.id];
   this.text(c,title,28,49,28,C.cyan);this.line(c,26,70,614,70);
   if(!state){this.text(c,'等待战场链路',28,128,32);d.texture.needsUpdate=true;continue;}
   this[d.id](c,d,state,time);d.texture.needsUpdate=true;
  }
 }
 text(c,text,x,y,size=28,color=C.text,align='left',maxWidth){c.fillStyle=color;c.font=`${size}px "Bahnschrift","Microsoft YaHei",sans-serif`;c.textAlign=align;c.fillText(String(text),x,y,maxWidth);c.textAlign='left';}
 line(c,x,y,x2,y2){c.strokeStyle=C.line;c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();}
 bar(c,value,x,y,w,color=C.cyan){c.fillStyle='#173443';c.fillRect(x,y,w,12);c.fillStyle=color;c.fillRect(x,y,w*percent(value)/100,12);}
 button(c,d,text,x,y,w,action,value,enabled=true){c.fillStyle=enabled?'#123141':'#0b1b25';c.fillRect(x,y,w,54);c.strokeStyle=enabled?'#5a8a9e':'#25404e';c.strokeRect(x,y,w,54);this.text(c,text,x+w/2,y+36,28,enabled?C.text:'#526e7c','center');if(enabled)d.hits.push({x,y,w,h:54,action,value});}
 contacts(c,d,s){
  const enemies=s.contacts.filter(v=>v.enemy),selected=enemies.find(v=>v.id===s.target),ordered=[...(selected?[selected]:[]),...enemies.filter(v=>v!==selected)].slice(0,3);
  if(!ordered.length)this.text(c,'无敌方接触',30,140,30,C.muted);
  ordered.forEach((v,i)=>{const y=90+i*67;c.fillStyle=v===selected?'#35242b':'#0a2130';c.fillRect(24,y,592,59);this.text(c,'◇ '+v.name,38,y+37,32,v===selected?C.gold:C.text,'left',394);this.text(c,number(v.distance)+' m',602,y+37,28,C.muted,'right');if(!s.replay)d.hits.push({x:24,y,w:592,h:59,action:'select',value:String(v.id)});});
  this.button(c,d,'下一目标 · T',25,301,275,'target',null,!s.replay&&enemies.length>0);this.button(c,d,s.locked?'解除锁定 · X':'锁定对准 · X',315,301,300,'lock',null,s.manual&&enemies.length>0);
  this.text(c,s.command||s.solution||'选择目标',30,399,28,C.gold,'left',580);this.text(c,s.replay?'REPLAY / 只读记录':s.manual?'MANUAL / 飞行控制':'AUTO / AI 驾驶',30,445,26,C.muted);
 }
 weapons(c,d,s){
  this.text(c,s.weaponName||'主武器',28,118,31,C.text,'left',440);this.text(c,weaponLabel(s.weapon),608,118,28,C.cyan,'right');
  this.text(c,`射程 ${number(s.weapon?.range)} m`,28,163,28,C.muted);this.button(c,d,'主武器开火 · SPACE',26,187,588,'fire',null,s.manual&&s.weapon?.reason!=='unavailable');
  this.line(c,26,264,614,264);this.text(c,'导弹',28,307,29);this.text(c,weaponLabel(s.missile),608,307,26,s.missile?.reason==='unavailable'?C.muted:C.gold,'right');
  this.button(c,d,'导弹发射 · R',26,335,588,'missile',null,s.manual&&s.missile?.reason!=='unavailable');this.text(c,s.solution||'',28,441,26,C.muted,'left',580);
 }
 radar(c,d,s,time){
  const cx=320,cy=337,r=223;c.strokeStyle=C.line;c.lineWidth=1.5;
  for(const radius of [r/3,r*2/3,r]){c.beginPath();c.arc(cx,cy,radius,0,Math.PI*2);c.stroke();}
  this.line(c,cx-r,cy,cx+r,cy);this.line(c,cx,cy-r,cx,cy+r);const a=time*.8;c.strokeStyle='#62bfd848';c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.sin(a)*r,cy-Math.cos(a)*r);c.stroke();
  for(const contact of s.contacts){const dx=contact.pos[0]-s.pos[0],dz=contact.pos[2]-s.pos[2],right=-dx*Math.cos(s.heading)+dz*Math.sin(s.heading),front=dx*Math.sin(s.heading)+dz*Math.cos(s.heading),range=Math.max(s.scanRange,Math.hypot(right,front)),x=cx+right/range*r,y=cy-front/range*r;{c.fillStyle=contact.enemy?C.red:C.cyan;c.beginPath();c.moveTo(x,y-7);c.lineTo(x+6,y+6);c.lineTo(x-6,y+6);c.closePath();c.fill();}
   if(contact.id===s.target){c.strokeStyle=C.gold;c.strokeRect(x-14,y-14,28,28);}if(contact.enemy&&!s.replay)d.hits.push({x:x-15,y:y-15,w:30,h:30,action:'select',value:String(contact.id)});
  }
  c.fillStyle=C.text;c.beginPath();c.moveTo(cx,cy-12);c.lineTo(cx+8,cy+9);c.lineTo(cx,cy+4);c.lineTo(cx-8,cy+9);c.closePath();c.fill();
  this.text(c,'FRONT',cx,100,20,C.muted,'center');this.text(c,number(s.scanRange)+' m',608,601,28,C.cyan,'right');this.text(c,'蓝 / 友方　红 / 敌方',28,601,28,C.muted);
 }
 flight(c,d,s){
  const rows=[['俯仰',angle(s.pitch)],['滚转',angle(s.roll)],['相对高度',number(s.altitude)+' m'],['垂直速度',(Math.sin(s.pitch)*s.speed).toFixed(1)+' m/s']];
  rows.forEach(([name,value],i)=>{const y=131+i*71;this.text(c,name,30,y,28,C.muted);this.text(c,value,608,y,34,C.text,'right');this.line(c,28,y+20,612,y+20);});
  this.text(c,'Q / E  俯仰　 A / D  滚转',30,446,26,C.cyan);
 }
 systems(c,d,s){
  [['ENG / 油门',s.throttle*100,C.cyan],['SHD / 护盾',s.shield,C.cyan],['HULL / 装甲',s.hull,C.gold]].forEach(([name,value,color],i)=>{const y=123+i*87;this.text(c,name,30,y,30,C.muted);this.text(c,percent(value)+'%',606,y,32,color,'right');this.bar(c,value,30,y+20,576,color);});
  this.button(c,d,'− 油门',26,360,280,'slower',null,s.manual);this.button(c,d,'+ 油门',322,360,292,'faster',null,s.manual);this.text(c,'W / S   ENGINE THROTTLE',30,452,26,C.muted);
 }
 pick(origin,direction){const hit=consoleIntersection(origin,direction,this.displays);if(!hit)return null;const d=this.displays[hit.index],x=hit.u*d.canvas.width,y=hit.v*d.canvas.height,control=d.hits.find(h=>x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h);return {...hit,...(control?{action:control.action,value:control.value}:{})};}
 layout(project){
  return this.displays.map(d=>({id:d.id,
   corners:[[-.5,.5],[.5,.5],[.5,-.5],[-.5,-.5]].map(([x,y])=>project(consolePoint(d,[x*d.size[0],y*d.size[1],.003]))),
   controls:d.hits.map(h=>({...h,point:project(consolePoint(d,[(h.x+h.w/2)/d.canvas.width*d.size[0]-d.size[0]/2,d.size[1]/2-(h.y+h.h/2)/d.canvas.height*d.size[1],.003]))}))
  }));
 }
}
