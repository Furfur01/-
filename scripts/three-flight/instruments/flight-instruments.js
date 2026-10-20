const ink='#91d8c6',dim='#37685d',amber='#d6bb73';
const line=(c,x,y,a,b)=>{c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();};
const text=(c,t,x,y,size=22,color=ink,align='left')=>{c.font=`${size}px Bahnschrift,Consolas`;c.fillStyle=color;c.textAlign=align;c.fillText(t,x,y);};
// Compact flight instruments, following the supplied Demo's ADI and MFD vocabulary.
// These panels report telemetry and stay free of menu buttons or paragraphs.
export function paintFlightInstrument(c,d,s,time){
 const w=d.canvas.width,h=d.canvas.height;c.fillStyle='#020908';c.fillRect(0,0,w,h);c.strokeStyle=dim;c.lineWidth=2;
 if(d.id==='radar'){
  const cx=w/2,cy=h*.48,r=h*.37;c.save();c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.clip();c.translate(cx,cy);c.rotate(-(s.roll||0));c.translate(0,(s.pitch||0)*r*1.5);
  c.fillStyle='#173e44';c.fillRect(-r*3,-r*5,r*6,r*5);c.fillStyle='#362d20';c.fillRect(-r*3,0,r*6,r*5);c.strokeStyle='#afd5bd';c.lineWidth=3;line(c,-r*3,0,r*3,0);
  c.lineWidth=1.5;for(let a=-60;a<=60;a+=10)if(a){const y=-a*Math.PI/180*r*1.5,len=Math.abs(a)%20?32:57;line(c,-len,y,-12,y);line(c,12,y,len,y);text(c,Math.abs(a),len+8,y+7,19);}
  c.restore();c.strokeStyle=ink;c.lineWidth=2;c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.stroke();
  c.strokeStyle=amber;c.lineWidth=4;line(c,cx-r*.68,cy,cx-r*.22,cy);line(c,cx-r*.22,cy,cx,cy+11);line(c,cx,cy+11,cx+r*.22,cy);line(c,cx+r*.22,cy,cx+r*.68,cy);
  for(let a=-60;a<=60;a+=15){const ang=(a-90)*Math.PI/180;line(c,cx+Math.cos(ang)*(r+7),cy+Math.sin(ang)*(r+7),cx+Math.cos(ang)*(r+18),cy+Math.sin(ang)*(r+18));}
  const bank=-(s.roll||0)-Math.PI/2;c.fillStyle=amber;c.beginPath();c.moveTo(cx+Math.cos(bank)*(r-6),cy+Math.sin(bank)*(r-6));c.lineTo(cx+Math.cos(bank-.055)*(r-20),cy+Math.sin(bank-.055)*(r-20));c.lineTo(cx+Math.cos(bank+.055)*(r-20),cy+Math.sin(bank+.055)*(r-20));c.fill();
  text(c,'SPD',28,42,21,dim);text(c,Math.round(s.speed||0),28,h*.49,45);text(c,'m/s',28,h*.62,18,dim);text(c,'ALT',w-28,42,21,dim,'right');text(c,Math.round(s.altitude??s.pos?.[1]??0),w-28,h*.49,40,ink,'right');text(c,'m',w-28,h*.62,18,dim,'right');
  text(c,'HDG '+String(Math.round((s.heading*180/Math.PI+360)%360)).padStart(3,'0'),cx,h-18,25,ink,'center');
 }else if(d.id==='weapons'){
  const cx=w*.48,cy=h*.53,r=h*.38;for(const k of [.33,.66,1]){c.beginPath();c.arc(cx,cy,r*k,0,Math.PI*2);c.stroke();}line(c,cx-r,cy,cx+r,cy);line(c,cx,cy-r,cx,cy+r);
  for(const q of s.contacts||[]){const dx=q.pos[0]-s.pos[0],dz=q.pos[2]-s.pos[2],range=Math.max(s.scanRange||1000,Math.hypot(dx,dz)),x=cx+(-dx*Math.cos(s.heading)+dz*Math.sin(s.heading))/range*r,y=cy-(dx*Math.sin(s.heading)+dz*Math.cos(s.heading))/range*r;c.fillStyle=q.enemy?amber:ink;c.fillRect(x-3,y-3,6,6);}
  c.strokeStyle='#91d8c633';line(c,cx,cy,cx+Math.sin(time)*r,cy-Math.cos(time)*r);text(c,'SCAN',20,32,20);text(c,(s.scanRange/1000).toFixed(1)+' K',w-18,h-18,19,dim,'right');
 }else{
  for(const [i,[name,value,color]]of [['ENG',s.throttle*100,ink],['SHD',s.shield,ink],['HULL',s.hull,amber]].entries()){
   const x=w*(.19+i*.31),y=h*.44,r=h*.23;c.strokeStyle=dim;c.lineWidth=8;c.beginPath();c.arc(x,y,r,Math.PI*.75,Math.PI*2.25);c.stroke();c.strokeStyle=value<25?'#e87958':color;c.beginPath();c.arc(x,y,r,Math.PI*.75,Math.PI*.75+Math.PI*1.5*Math.max(0,Math.min(100,value))/100);c.stroke();text(c,Math.round(value),x,y+12,31,color,'center');text(c,name,x,h*.85,21,dim,'center');
  }
 }
 d.texture.needsUpdate=true;
}
