import {pctColor} from './fusion-screens.js';

const CY='#6fe8ff',RED='#ff4a3a',AMB='#ffb35c',GRN='#64f0a8';
const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
const finite=n=>Number.isFinite(n)?n:0;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=(x,y,value,color,size=11,anchor='start')=>`<text x="${x}" y="${y}" fill="${esc(color)}" font-size="${size}" text-anchor="${anchor}" dominant-baseline="middle">${esc(value)}</text>`;
function arc(x,y,r,start,end,color,width,opacity=1,dashed=false){
 if(end-start<.0001)return '';
 if(end-start>=Math.PI*2-.0001)return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${opacity}"/>`;
 const point=a=>[x+Math.cos(a)*r,y+Math.sin(a)*r].join(' ');
 return `<path d="M ${point(start)} A ${r} ${r} 0 ${end-start>Math.PI?1:0} 1 ${point(end)}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${opacity}"${dashed?' stroke-dasharray="3 4"':''}/>`;
}

// Glass projection uses vector elements, so the persistent 3D world remains the
// only displayed canvas. Console CanvasTextures continue to be offscreen.
export class SvgGlass {
 constructor(svg){this.element=svg;this.parts=[];this.contacts=[[],[]];this.resize();}
 resize(width=globalThis.innerWidth||1,height=globalThis.innerHeight||1){this.w=width;this.h=height;this.element.setAttribute('viewBox',`0 0 ${width} ${height}`);}
 clear(){this.parts.length=0;for(const paths of this.contacts)paths.length=0;}
 present(){this.element.innerHTML=this.contacts.map((paths,i)=>paths.length?`<path d="${paths.join(' ')}" fill="none" stroke="${i?'#ff5a46':CY}" stroke-opacity=".75" stroke-width="1.2"/>`:'').join('')+this.parts.join('');}
 contact(x,y,enemy){this.contacts[+!!enemy].push(`M ${x} ${y-6} l 6 6 -6 6 -6 -6 Z`);}
 reticle(x,y,s,t){
  const wp=s.weapon||{},hull=clamp(s.hull/100),parts=[`<g transform="translate(${x} ${y})" font-family="Consolas,Microsoft YaHei,monospace"><circle r="22" fill="none" stroke="${CY}" stroke-opacity=".9" stroke-width="1.5"/><path d="M 14 0 H 30 M -14 0 H -30 M 0 14 V 30 M 0 -14 V -30 M -58 16 L -40 4 -58 -8 M 58 16 L 40 4 58 -8" fill="none" stroke="${CY}" stroke-opacity=".9" stroke-width="1.5"/><circle r="1.8" fill="${CY}"/>`];
  for(let i=0;i<4;i++){const value=finite(s.shields?.[i]),hit=clamp(s.shieldHit?.[i]),start=-Math.PI/2+i*Math.PI/2;parts.push(arc(0,0,42,start-.6,start+.6,value<=0?RED:pctColor(value),2+clamp(value/100)*3,value<=0?clamp(.4+.4*Math.sin(t*12)):.85,value<=0));if(hit)parts.push(arc(0,0,47,start-.6,start+.6,'#fff',5,hit));}
  if(wp.state==='charging'||wp.state==='firing')parts.push(arc(0,0,30,-Math.PI/2,-Math.PI/2+Math.PI*2*(wp.state==='firing'?1:clamp(wp.charge)),wp.state==='firing'?'#fff':AMB,3));
  parts.push(`<rect x="-48" y="56" width="96" height="4" fill="${CY}" opacity=".12"/><rect x="-48" y="56" width="${96*hull}" height="4" fill="${pctColor(hull*100)}"/>`,text(0,72,`舰体 ${Math.round(hull*100)}%`,pctColor(hull*100),11,'middle'),text(0,-58,({unavailable:'近防自卫',ready:'主炮就绪',aim:'炮线未对准',range:'超出射程',target:'选择目标',terrain:'射线被遮挡',charging:'充能',firing:'开火',cooldown:'冷却'})[wp.state]||'',wp.state==='ready'?GRN:wp.state==='cooldown'?'#3fa9cc':AMB,11,'middle'),'</g>');this.parts.push(parts.join(''));
 }
 brackets(x,y,size,s,t){
  const locked=!!s.locked,progress=clamp(s.lockProgress),color=locked?RED:AMB,h=size/2,k=Math.max(8,size*.28),scale=locked?1:1.6-.6*progress,angle=locked?0:((1-progress)*Math.PI*.5+t*.6*(1-progress))*180/Math.PI;
  let path='';for(const [sx,sy]of [[-1,-1],[1,-1],[1,1],[-1,1]])path+=`M ${sx*h} ${sy*(h-k)} L ${sx*h} ${sy*h} ${sx*(h-k)} ${sy*h} `;
  this.parts.push(`<g transform="translate(${x} ${y})"><path d="${path}" transform="rotate(${angle}) scale(${scale})" fill="none" stroke="${color}" stroke-width="${2/scale}"/>${locked?`<circle r="2.5" fill="${RED}" opacity="${clamp(.6+.4*Math.sin(t*10))}"/>`:arc(0,0,h+12,-Math.PI/2,-Math.PI/2+Math.PI*2*progress,AMB,2,.5)}</g>`);
  const target=s.target||{},lx=x+h+16,ly=y-h+6,caption=s.aimed===undefined?(locked?'LOCK  '+(target.name||''):'锁定中 '+Math.round(progress*100)+'%'):(s.aimed?'已对准 ':s.aligning?'对准中 ':'已选中 ')+(target.name||'');this.parts.push(text(lx,ly,caption,color,13),text(lx,ly+17,`${(finite(s.targetDist)/1000).toFixed(2)} km   偏差 ${finite(s.alignErr).toFixed(1)}°`,'#ffc8be'));
  for(const [dy,value,col]of [[30,clamp(target.sh/target.maxSh),'#7fb6ff'],[36,clamp(target.hp/target.maxHp),color]])this.parts.push(`<rect x="${lx}" y="${ly+dy}" width="90" height="3" fill="#fff" opacity=".12"/><rect x="${lx}" y="${ly+dy}" width="${90*value}" height="3" fill="${col}"/>`);
 }
 comms(list,t){
  const x=Math.max(12,this.w-380),y0=this.h-30;
  list.slice(-5).reverse().forEach((m,i)=>{const alpha=clamp((9-(t-m.t))/2)*(i===0?1:.75);if(!alpha)return;const y=y0-i*24;this.parts.push(`<g opacity="${alpha}" font-size="13"><rect x="${x-10}" y="${y-11}" width="370" height="22" fill="#040e14" opacity=".55"/><text x="${x}" y="${y}" dominant-baseline="middle"><tspan fill="${esc(m.col||'#ffc878')}">${esc(m.who)}</tspan><tspan dx="10" fill="#d2eef8">${esc(m.text)}</tspan></text></g>`);});
 }
}
