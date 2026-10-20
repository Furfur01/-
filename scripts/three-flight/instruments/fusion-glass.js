// 座舱玻璃投影 HUD（2D 叠加层，所有标记都由 3D 位置投影得到，随环视移动）
import * as THREE from 'three';
import {pctColor} from './fusion-screens.js';

const CY='#6fe8ff',RED='#ff4a3a',AMB='#ffb35c',GRN='#64f0a8';
const FONT='"Bahnschrift","Microsoft YaHei",sans-serif',MONO='Consolas,"Microsoft YaHei",monospace';
const v=new THREE.Vector3();

export class Hud{
  constructor(canvas){this.c=canvas;this.g=canvas.getContext('2d');this.resize()}
  resize(){const d=Math.min(devicePixelRatio,2);this.d=d;this.c.width=innerWidth*d;this.c.height=innerHeight*d;this.w=innerWidth;this.h=innerHeight}
  project(p,cam){v.copy(p).project(cam);return {x:(v.x*.5+.5)*this.w,y:(-v.y*.5+.5)*this.h,front:v.z<1&&v.z>-1,ndc:v.clone()}}

  draw(cam,s,t,mode){
    const g=this.g;g.setTransform(this.d,0,0,this.d,0,0);g.clearRect(0,0,this.w,this.h);
    g.lineCap='round';g.textBaseline='middle';
    // 受击屏幕边缘
    if(s.hullFlash>.01)this.vignette('255,40,20',s.hullFlash*.55);
    if(s.shieldFlash>.01)this.vignette('80,200,255',s.shieldFlash*.22);
    if(s.alert)this.vignette('255,30,10',.12+.08*Math.sin(t*6));

    // 友舰
    for(const a of s.allies){const p=this.project(a.pos,cam);if(!p.front)continue;g.strokeStyle='rgba(111,232,255,.7)';g.lineWidth=1.5;g.beginPath();g.moveTo(p.x-7,p.y+5);g.lineTo(p.x,p.y-4);g.lineTo(p.x+7,p.y+5);g.stroke();g.font=`10px ${FONT}`;g.fillStyle='rgba(111,232,255,.7)';g.fillText(a.name,p.x+10,p.y)}
    // 敌舰标记
    for(const e of s.enemies){
      if(!e.alive||e===s.target)continue;const p=this.project(e.pos,cam);if(!p.front)continue;
      g.strokeStyle='rgba(255,90,70,.85)';g.lineWidth=1.5;const r=e.type==='cruiser'?9:6;
      g.beginPath();g.moveTo(p.x,p.y-r);g.lineTo(p.x+r,p.y);g.lineTo(p.x,p.y+r);g.lineTo(p.x-r,p.y);g.closePath();g.stroke();
      g.font=`10px ${MONO}`;g.fillStyle='rgba(255,120,100,.75)';g.fillText((e.dist/1000).toFixed(1)+'k',p.x+r+4,p.y);
    }

    // 准星 = 同轴炮汇聚点
    const bp=this.project(s.boresight,cam);
    if(bp.front)this.reticle(bp.x,bp.y,s,t);

    // 锁定目标
    if(s.target&&s.target.alive){
      const tp=this.project(s.target.pos,cam);
      const ep=this.project(v.copy(s.target.pos).addScaledVector(cam.up,s.target.radius),cam);
      const size=Math.max(26,Math.min(160,Math.abs(ep.y-tp.y)*1.3));
      const onScreen=tp.front&&tp.x>0&&tp.x<this.w&&tp.y>0&&tp.y<this.h;
      if(onScreen)this.brackets(tp.x,tp.y,size,s,t);
      else this.offscreen(tp,s);
      if(onScreen&&bp.front&&s.locked){g.strokeStyle='rgba(255,74,58,.35)';g.setLineDash([4,6]);g.lineWidth=1;g.beginPath();g.moveTo(bp.x,bp.y);g.lineTo(tp.x,tp.y);g.stroke();g.setLineDash([])}
    }

    this.comms(s.comms,t);
  }

  vignette(rgb,a){
    const g=this.g,grd=g.createRadialGradient(this.w/2,this.h/2,Math.min(this.w,this.h)*.35,this.w/2,this.h/2,Math.max(this.w,this.h)*.75);
    grd.addColorStop(0,`rgba(${rgb},0)`);grd.addColorStop(1,`rgba(${rgb},${a})`);g.fillStyle=grd;g.fillRect(0,0,this.w,this.h);
  }

  reticle(x,y,s,t){
    const g=this.g,wp=s.weapon;
    g.strokeStyle='rgba(111,232,255,.9)';g.lineWidth=1.5;
    g.beginPath();g.arc(x,y,22,0,7);g.stroke();
    g.beginPath();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){g.moveTo(x+dx*14,y+dy*14);g.lineTo(x+dx*30,y+dy*30)}g.stroke();
    g.fillStyle=CY;g.beginPath();g.arc(x,y,1.8,0,7);g.fill();
    // 双炮汇聚 V 形
    for(const sx of [-1,1]){g.beginPath();g.moveTo(x+sx*58,y+16);g.lineTo(x+sx*40,y+4);g.lineTo(x+sx*58,y-8);g.stroke()}
    // 护盾四象限环
    const R=42,q=[-Math.PI/2,0,Math.PI/2,Math.PI];
    for(let i=0;i<4;i++){
      const val=s.shields[i],hit=s.shieldHit[i];
      g.strokeStyle=val<=0?`rgba(255,74,58,${.4+.4*Math.sin(t*12)})`:pctColor(val);g.globalAlpha=.85;
      g.lineWidth=2+val/100*3;g.setLineDash(val<=0?[3,4]:[]);
      g.beginPath();g.arc(x,y,R,q[i]-.6,q[i]+.6);g.stroke();
      if(hit>0){g.strokeStyle=`rgba(255,255,255,${hit})`;g.lineWidth=5;g.beginPath();g.arc(x,y,R+5,q[i]-.6,q[i]+.6);g.stroke()}
    }
    g.setLineDash([]);g.globalAlpha=1;
    // 充能环
    if(wp.state==='charging'||wp.state==='firing'){
      g.strokeStyle=wp.state==='firing'?'#ffffff':AMB;g.lineWidth=3;g.beginPath();g.arc(x,y,30,-Math.PI/2,-Math.PI/2+Math.PI*2*(wp.state==='firing'?1:wp.charge));g.stroke();
    }
    // 舰体
    const hw=96;g.fillStyle='rgba(111,232,255,.12)';g.fillRect(x-hw/2,y+56,hw,4);
    g.fillStyle=pctColor(s.hull);g.fillRect(x-hw/2,y+56,hw*s.hull/100,4);
    g.font=`11px ${MONO}`;g.textAlign='center';g.fillStyle=pctColor(s.hull);g.fillText(`舰体 ${Math.round(s.hull)}%`,x,y+72);
    g.fillStyle=wp.state==='ready'?GRN:wp.state==='cooldown'?'#3fa9cc':AMB;
    g.fillText({unavailable:'近防自卫',ready:'主炮就绪',charging:'充能',firing:'开火',cooldown:'冷却'}[wp.state],x,y-58);
    g.textAlign='left';
  }

  brackets(x,y,size,s,t){
    const g=this.g,locked=s.locked,col=locked?RED:AMB,h=size/2,k=Math.max(8,size*.28);
    g.save();g.translate(x,y);
    if(!locked)g.rotate((1-s.lockProgress)*Math.PI*.5+t*.6*(1-s.lockProgress));
    const sc=locked?1:1.6-.6*s.lockProgress;g.scale(sc,sc);
    g.strokeStyle=col;g.lineWidth=2/sc;
    for(const [sx,sy] of [[-1,-1],[1,-1],[1,1],[-1,1]]){g.beginPath();g.moveTo(sx*h,sy*(h-k));g.lineTo(sx*h,sy*h);g.lineTo(sx*(h-k),sy*h);g.stroke()}
    g.restore();
    if(!locked){g.strokeStyle='rgba(255,179,92,.5)';g.lineWidth=2;g.beginPath();g.arc(x,y,h+12,-Math.PI/2,-Math.PI/2+Math.PI*2*s.lockProgress);g.stroke()}
    else{g.fillStyle=`rgba(255,74,58,${.6+.4*Math.sin(t*10)})`;g.beginPath();g.arc(x,y,2.5,0,7);g.fill()}
    const tg=s.target,lx=x+h+16,ly=y-h+6;
    g.font=`600 13px ${FONT}`;g.fillStyle=col;g.fillText(locked?'LOCK  '+tg.name:'锁定中 '+Math.round(s.lockProgress*100)+'%',lx,ly);
    g.font=`11px ${MONO}`;g.fillStyle='rgba(255,200,190,.85)';g.fillText(`${(s.targetDist/1000).toFixed(2)} km   偏差 ${s.alignErr.toFixed(1)}°`,lx,ly+17);
    g.fillStyle='rgba(255,255,255,.12)';g.fillRect(lx,ly+30,90,3);g.fillRect(lx,ly+36,90,3);
    g.fillStyle='#7fb6ff';g.fillRect(lx,ly+30,90*tg.sh/tg.maxSh,3);
    g.fillStyle=col;g.fillRect(lx,ly+36,90*tg.hp/tg.maxHp,3);
  }

  offscreen(p,s){
    const g=this.g,cx=this.w/2,cy=this.h/2;let dx=p.ndc.x,dy=-p.ndc.y;if(!p.front){dx=-dx;dy=-dy}
    const a=Math.atan2(dy,dx),r=Math.min(this.w,this.h)*.36,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
    g.save();g.translate(x,y);g.rotate(a);g.fillStyle=s.locked?RED:AMB;g.beginPath();g.moveTo(16,0);g.lineTo(-6,-10);g.lineTo(-2,0);g.lineTo(-6,10);g.closePath();g.fill();g.restore();
    g.font=`11px ${MONO}`;g.fillStyle=s.locked?RED:AMB;g.textAlign='center';g.fillText((s.targetDist/1000).toFixed(1)+' km',x,y+22);g.textAlign='left';
  }

  comms(list,t){
    const g=this.g,x=this.w-380,y0=this.h-30;
    g.font=`13px ${FONT}`;g.textAlign='left';
    list.slice(-5).reverse().forEach((m,i)=>{
      const age=t-m.t,a=Math.max(0,Math.min(1,(9-age)/2))*(i===0?1:.75);if(a<=0)return;
      const y=y0-i*24;g.fillStyle=`rgba(4,14,20,${.55*a})`;g.fillRect(x-10,y-11,370,22);
      g.fillStyle=m.col?m.col.replace(')',`,${a})`).replace('rgb','rgba'):`rgba(255,200,120,${a})`;g.fillText(m.who,x,y);
      g.fillStyle=`rgba(210,238,248,${a})`;g.fillText(m.text,x+g.measureText(m.who).width+10,y);
    });
  }
}
