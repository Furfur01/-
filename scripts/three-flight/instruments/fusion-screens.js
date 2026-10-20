import {drawDefenseSchematic} from './ship-schematic.js';
// 舰桥实体屏幕的 Canvas 绘制
const CY='#5fe3ff',CY2='#2a9fc4',AMB='#ffb35c',RED='#ff4a3a',GRN='#64f0a8',TXT='#cfefff',DIM='#5d8798';
const FONT='"Bahnschrift","Microsoft YaHei",sans-serif',MONO='Consolas,"Microsoft YaHei",monospace';

export const pctColor=p=>p>60?CY:p>30?AMB:RED;
const SECTION_NAMES={bow:'舰艏装甲',laserL:'左炮管',laserR:'右炮管',bridge:'舰桥',engines:'主引擎'};

export function frame(g,w,h,title,right,t){
  const grd=g.createLinearGradient(0,0,0,h);grd.addColorStop(0,'#06202b');grd.addColorStop(1,'#020a10');
  g.fillStyle=grd;g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(95,227,255,.06)';g.lineWidth=1;
  for(let x=0;x<w;x+=32){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke()}
  for(let y=0;y<h;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}
  g.fillStyle='rgba(95,227,255,.12)';g.fillRect(0,0,w,58);
  g.fillStyle=CY;g.fillRect(0,56,w,2);
  g.font=`600 30px ${FONT}`;g.fillStyle=TXT;g.textBaseline='middle';g.textAlign='left';g.fillText(title,26,30);
  g.font=`22px ${FONT}`;g.fillStyle=DIM;g.textAlign='right';g.fillText(right,w-26,30);g.textAlign='left';
  // 扫描线
  const sy=(t*120)%h;g.fillStyle='rgba(95,227,255,.05)';g.fillRect(0,sy,w,26);
  g.strokeStyle='rgba(95,227,255,.4)';g.lineWidth=3;g.strokeRect(1.5,1.5,w-3,h-3);
}
export function bar(g,x,y,w,h,p,col,label,val){
  g.fillStyle='rgba(95,227,255,.08)';g.fillRect(x,y,w,h);
  g.fillStyle=col;g.fillRect(x,y,w*Math.max(0,Math.min(1,p)),h);
  for(let i=1;i<10;i++){g.fillStyle='rgba(2,10,16,.7)';g.fillRect(x+w*i/10-1,y,2,h)}
  if(label){g.font=`22px ${FONT}`;g.fillStyle=DIM;g.fillText(label,x,y-16)}
  if(val){g.font=`600 22px ${MONO}`;g.fillStyle=col;g.textAlign='right';g.fillText(val,x+w,y-16);g.textAlign='left'}
}

export function drawDefense(sc,state,t){
  const g=sc.ctx,w=sc.canvas.width,h=sc.canvas.height;
  frame(g,w,h,'防御系统 · DEFENSE',state.aggregateShield?'全向护盾 · 共用容量':state.focus?'护盾聚焦：前方':'护盾分配：均衡',t);
  const cx=270,cy=350,rx=190,ry=240;
  // 护盾四象限
  const q=[[-Math.PI/2,0],[0,1],[Math.PI/2,2],[Math.PI,3]];
  for(const [a,i] of q){
    const v=state.shields[i],hit=state.shieldHit[i];
    const col=v<=0?`rgba(255,74,58,${.4+.4*Math.sin(t*12)})`:pctColor(v);
    g.save();g.translate(cx,cy);g.scale(1,ry/rx);
    g.lineWidth=6+v/100*12;g.strokeStyle=col;g.setLineDash(v<=0?[8,10]:[]);
    g.beginPath();g.arc(0,0,rx,a-.62,a+.62);g.stroke();
    if(hit>0){g.strokeStyle=`rgba(255,255,255,${hit})`;g.lineWidth=24*hit;g.beginPath();g.arc(0,0,rx+10,a-.62,a+.62);g.stroke()}
    g.restore();g.setLineDash([]);
  }
  drawDefenseSchematic(g,cx,cy,200,state,t);
  // 右侧数据
  const x0=560,labels=['前','右','后','左'];
  g.font=`600 24px ${FONT}`;g.fillStyle=TXT;g.fillText(state.aggregateShield?'护盾容量':'护盾象限',x0,100);
  for(let i=0;i<(state.aggregateShield?1:4);i++){const v=state.shields[i];bar(g,x0+(i%2)*220,170+Math.floor(i/2)*80,state.aggregateShield?410:190,18,v/100,v<=0?RED:pctColor(v),state.aggregateShield?'全向覆盖':labels[i]+'盾',v<=0?'失效':Math.round(v)+'%')}
  g.font=`600 24px ${FONT}`;g.fillStyle=TXT;g.fillText('舰体结构',x0,350);
  g.font=`700 64px ${MONO}`;g.fillStyle=pctColor(state.hull);g.textAlign='right';g.fillText(Math.round(state.hull)+'%',w-30,358);g.textAlign='left';
  bar(g,x0,392,w-x0-30,14,state.hull/100,pctColor(state.hull));
  let y=440;g.font=`20px ${FONT}`;
  for(const [k,name] of Object.entries(state.aggregateShield?{}:SECTION_NAMES)){
    const v=state.sections[k],col=pctColor(v),i=Object.keys(SECTION_NAMES).indexOf(k),px=x0+(i%2)*220,py=y+Math.floor(i/2)*44;
    g.fillStyle=col;g.fillRect(px,py-9,10,18);g.fillStyle=TXT;g.fillText(name,px+20,py);
    g.fillStyle=col;g.textAlign='right';g.fillText(v>60?'完好':v>30?'受损':'严重',px+190,py);g.textAlign='left';
  }
  if(state.aggregateShield){g.font=`22px ${FONT}`;g.fillStyle=DIM;g.fillText('舰体轮廓 · 实舰俯视',x0,458);g.fillText('整体遥测 / HULL INTEGRITY',x0,504);}
  const msg=state.statusLine||'护盾稳定 · 结构完整';
  g.fillStyle=state.alert?`rgba(255,74,58,${.6+.4*Math.sin(t*8)})`:GRN;g.font=`600 22px ${FONT}`;g.fillText('● '+msg,26,h-28);
  sc.tex.needsUpdate=true;
}

function silhouette(g,cx,cy,s,type,t,col){
  const pts=type==='cruiser'
    ?[[0,-1],[.18,-.5],[.22,.5],[.12,.95],[-.12,.95],[-.22,.5],[-.18,-.5]]
    :[[0,-1],[.25,.2],[.9,.55],[.85,.75],[.2,.6],[0,.9],[-.2,.6],[-.85,.75],[-.9,.55],[-.25,.2]];
  const a=t*.8,ca=Math.cos(a),sa=Math.sin(a);
  for(const [lvl,dz] of [[0,-.12],[1,.12]]){
    g.beginPath();
    pts.forEach(([x,z],i)=>{const X=x*ca,Y=z*.55+dz+x*sa*.5;const px=cx+X*s,py=cy+Y*s;i?g.lineTo(px,py):g.moveTo(px,py)});
    g.closePath();g.strokeStyle=lvl?col:'rgba(255,74,58,.45)';g.lineWidth=2;g.stroke();
  }
  pts.forEach(([x,z])=>{const X=x*ca;g.beginPath();g.moveTo(cx+X*s,cy+(z*.55-.12+x*sa*.5)*s);g.lineTo(cx+X*s,cy+(z*.55+.12+x*sa*.5)*s);g.strokeStyle='rgba(255,74,58,.35)';g.stroke()});
}

export function drawFire(sc,state,t){
  const g=sc.ctx,w=sc.canvas.width,h=sc.canvas.height,tg=state.target,wp=state.weapon;
  frame(g,w,h,'火控 · FIRE CONTROL',state.weaponName||'同轴激光炮 ×2',t);
  // 目标框
  g.strokeStyle='rgba(95,227,255,.35)';g.lineWidth=2;g.strokeRect(24,78,470,300);
  if(tg){
    const col=state.locked?RED:AMB;
    drawDefenseSchematic(g,150,220,98,{...state,shipType:tg.shipType||tg.type,hull:tg.hp/tg.maxHp*100,shieldMode:'bubble',shields:[0,0,0,0]},t);
    g.font=`600 28px ${FONT}`;g.fillStyle=col;g.fillText(tg.name,280,112);
    g.font=`20px ${FONT}`;g.fillStyle=DIM;g.fillText(tg.classLabel||'目标遥测 / TRACK',280,146);
    g.font=`600 30px ${MONO}`;g.fillStyle=TXT;g.fillText((state.targetDist/1000).toFixed(2)+' km',280,192);
    bar(g,280,250,190,14,tg.sh/tg.maxSh,'#7fb6ff','护盾',Math.round(tg.sh/tg.maxSh*100)+'%');
    bar(g,280,310,190,14,tg.hp/tg.maxHp,pctColor(tg.hp/tg.maxHp*100),'结构',Math.round(tg.hp/tg.maxHp*100)+'%');
    g.font=`600 24px ${FONT}`;g.fillStyle=col;
    g.fillText(state.aimed===undefined?(state.locked?'■ 已锁定 LOCKED':`□ 锁定中 ${Math.round(state.lockProgress*100)}%`):state.aimed?'■ 炮线已对准':state.aligning?'□ 炮线对准中':'□ 已选中目标',40,356);
  }else{
    g.font=`26px ${FONT}`;g.fillStyle=DIM;g.fillText('无目标 · 按 T 或点选敌舰',60,230);
  }
  // 瞄准偏差镜
  const sx=760,sy=230,R=140;
  g.strokeStyle='rgba(95,227,255,.4)';g.lineWidth=2;
  for(const r of [R,R*.5]){g.beginPath();g.arc(sx,sy,r,0,7);g.stroke()}
  g.beginPath();g.moveTo(sx-R-10,sy);g.lineTo(sx+R+10,sy);g.moveTo(sx,sy-R-10);g.lineTo(sx,sy+R+10);g.stroke();
  g.strokeStyle=GRN;g.setLineDash([6,6]);g.beginPath();g.arc(sx,sy,R*state.gimbal/12,0,7);g.stroke();g.setLineDash([]);
  g.font=`18px ${FONT}`;g.fillStyle=DIM;g.fillText('舰艏轴线偏差 ±12°',sx-R,sy+R+34);
  if(tg&&state.offset){
    const ox=Math.max(-1.1,Math.min(1.1,state.offset.x/12)),oy=Math.max(-1.1,Math.min(1.1,state.offset.y/12));
    const px=sx+ox*R,py=sy-oy*R,ok=state.aimed??(state.alignErr<state.gimbal);
    g.strokeStyle=ok?GRN:RED;g.lineWidth=3;g.beginPath();g.moveTo(sx,sy);g.lineTo(px,py);g.stroke();
    g.fillStyle=ok?GRN:RED;g.beginPath();g.moveTo(px,py-10);g.lineTo(px+10,py);g.lineTo(px,py+10);g.lineTo(px-10,py);g.closePath();g.fill();
    g.font=`600 24px ${MONO}`;g.fillText(`${state.alignErr.toFixed(1)}° ${ok?'可命中':'需对准'}`,sx+20,sy-R+6);
  }
  if(state.aligning){g.font=`600 22px ${FONT}`;g.fillStyle=AMB;g.fillText('舵手：舰艏对准中…',sx-R,96)}
  // 炮管状态
  const st={unavailable:['未装配 —',DIM],ready:['就绪 READY',GRN],aim:['需对准 AIM',AMB],target:['选择目标 TARGET',AMB],range:['超出射程 RANGE',AMB],terrain:['遮挡 BLOCKED',AMB],charging:['充能 CHARGING',AMB],firing:['开火 FIRING','#ffffff'],cooldown:['冷却 COOLING',CY2]}[wp.state];
  bar(g,40,450,200,22,wp.state==='firing'?1:wp.charge,CY,'左炮管 L',wp.state==='cooldown'?'—':Math.round(wp.charge*100)+'%');
  bar(g,290,450,200,22,wp.state==='firing'?1:wp.charge,CY,'右炮管 R',wp.state==='cooldown'?'—':Math.round(wp.charge*100)+'%');
  if(state.live)bar(g,40,530,450,14,state.fireReady?1:0,CY,'火控',state.fireReady?'READY':'STANDBY');else bar(g,40,530,450,14,wp.heat,wp.heat>.75?RED:wp.heat>.5?AMB:CY,'热量',Math.round(wp.heat*100)+'%');
  g.font=`700 40px ${FONT}`;g.fillStyle=st[1];g.fillText(st[0],560,470);
  g.font=`22px ${FONT}`;g.fillStyle=DIM;g.fillText(state.live?'射程  '+((state.weaponRange||0)/1000).toFixed(2)+' km':'汇聚距离  2.20 km    射程  4.50 km',560,520);
  g.fillText(state.live?'T 切换目标  ·  X 对准':`已击毁  ${state.kills}`,560,560);
  sc.tex.needsUpdate=true;
}

export function drawPipLabel(sc,t,view){
  const g=sc.ctx,w=sc.canvas.width,h=sc.canvas.height;
  g.clearRect(0,0,w,h);g.fillStyle='rgba(2,12,18,.85)';g.fillRect(0,0,w,h);
  g.font=`600 28px ${FONT}`;g.textBaseline='middle';g.fillStyle=CY;g.fillText('外部战术视角 · CAM-03 舰尾',12,h/2);
  g.fillStyle=Math.sin(t*5)>0?RED:'#5a1a14';g.textAlign='right';g.fillText('● LIVE',w-12,h/2);g.textAlign='left';
  sc.tex.needsUpdate=true;
}

export function drawWarning(sc,state,t){
  const g=sc.ctx,w=sc.canvas.width,h=sc.canvas.height;g.clearRect(0,0,w,h);g.fillStyle=state.alert?'#230d0c':'#06131d';g.fillRect(0,0,w,h);
  const color=state.alert?'#ffb18d':'#88c9dd',pulse=state.alert?.7+.3*Math.sin(t*5):.8;g.globalAlpha=pulse;g.fillStyle=color;g.fillRect(0,0,7,h);g.fillRect(w-7,0,7,h);g.globalAlpha=1;
  g.textAlign='left';g.textBaseline='middle';g.font='28px Consolas';g.fillText(state.alert?'DAMAGE CONTROL':'FLIGHT SYSTEMS',26,h/2);
  g.textAlign='center';g.font='600 48px "Microsoft YaHei"';g.fillText(state.banner||'护盾稳定 · 航行正常',w*.54,h/2,800);
  g.textAlign='right';g.font='26px Consolas';g.fillText(Math.round(state.speed)+' m/s  ·  '+Math.round(state.throttle*100)+'%',w-25,h/2);g.globalAlpha=1;g.textAlign='left';sc.tex.needsUpdate=true;
}
