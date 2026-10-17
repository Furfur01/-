// Approved meshes share the navigation WebGL context. Five cached buffers only;
// no extra canvases/contexts, Three.js renderer or per-frame geometry uploads.
const auroraNpcFallback={outpost:{level:2,color:'#d4c8b1',symbol:'裂',patrols:3},garrison:{level:3,color:'#f36350',symbol:'堡',patrols:4},charon:{level:4,color:'#c18aff',symbol:'芒',patrols:5},cargo:{level:1,color:'#aabed5',symbol:'仓',patrols:2},fracture:{level:5,color:'#45c9ff',symbol:'环',patrols:7}};
function auroraNpcIdentity(p){return p?.npc&&!p.moon&&Object.hasOwn(auroraNpcFallback,p.npcType)?auroraNpcFallback[p.npcType]:null;}
function auroraNpcPatrolPose(p,time,index){
 const type=auroraNpcIdentity(p),count=type?.patrols||0,angle=time*(.12+(index%3)*.025)+index*TAU/Math.max(1,count)+p.coordinates[1]*.37;
 const radius=p.radius*(1.95+(index%2)*.32),tilt=(index%2?.42:-.28),position=[Math.cos(angle)*radius,Math.sin(angle)*Math.sin(tilt)*radius,Math.sin(angle)*Math.cos(tilt)*radius];
 return {position:add(p.position,position),yaw:-angle,pitch:-Math.atan2(Math.cos(angle)*Math.sin(tilt),Math.hypot(Math.sin(angle),Math.cos(angle)*Math.cos(tilt))),count};
}
function createAuroraNpcs(){
 const vertex=`attribute vec3 aPosition,aNormal,aColor,aEmission;uniform mat4 uVP,uModel;varying vec3 p,n,c,e;void main(){p=aPosition;n=aNormal;c=aColor;e=aEmission;gl_Position=uVP*uModel*vec4(aPosition,1.);}`;
 const fragment=`precision highp float;varying vec3 p,n,c,e;uniform vec3 uLight,uEye;vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}void main(){vec3 N=normalize(n),V=normalize(uEye-p),L=normalize(uLight);float sun=max(0.,dot(N,L)),fill=max(0.,dot(N,normalize(vec3(-.5,.6,1.))));float hemi=.5+.5*N.y;float spec=pow(max(0.,dot(N,normalize(L+V))),35.);vec3 lit=c*(.38+.24*hemi+sun*1.9+fill*.6)+vec3(.18,.23,.29)*spec+e;gl_FragColor=vec4(pow(aces(lit),vec3(1./2.2)),1.);}`;
 const program=gl.createProgram(),vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const attrs=['aPosition','aNormal','aColor','aEmission'].map(name=>gl.getAttribLocation(program,name)),u={};for(const name of ['uVP','uModel','uLight','uEye'])u[name]=gl.getUniformLocation(program,name);
 const cache=new Map(),pending=new Map(),failed=new Set();let disposed=false,visible=[],patrols=[];
 const overlay=document.createElement('canvas'),ctx=overlay.getContext('2d');overlay.className='npc-label-overlay';overlay.setAttribute('aria-hidden','true');Object.assign(overlay.style,{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:7});document.body.append(overlay);
 function load(id){if(cache.has(id)||pending.has(id)||failed.has(id))return;const controller=new AbortController();pending.set(id,controller);
  fetch('../galactic-command/assets/npc-planets/'+id+'.bin?v=1',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('NPC mesh '+r.status);return r.arrayBuffer();}).then(data=>{if(disposed)return;const a=new Float32Array(data);if(!a.length||a.length%36||!a.every(Number.isFinite))throw Error('Invalid NPC mesh');const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,a,gl.STATIC_DRAW);cache.set(id,{b,count:a.length/12});}).catch(e=>{if(e.name!=='AbortError'){failed.add(id);console.error('野怪模型加载失败',id,e);}}).finally(()=>pending.delete(id));
 }
 function begin(){visible=[];patrols=[];const ratio=Math.min(devicePixelRatio||1,2);if(overlay.width!==Math.round(W*ratio)||overlay.height!==Math.round(H*ratio)){overlay.width=Math.round(W*ratio);overlay.height=Math.round(H*ratio);}ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,W,H);}
 function draw(p,q,vp,origin,eye,light,rotation){
  const type=auroraNpcIdentity(p);if(!type||q.radius<2)return false;load(p.npcType);const geo=cache.get(p.npcType),visualScale=q.radius>=2?Math.max(1,9/q.radius):1;
  visible.push({key:p.key,type:p.npcType,level:type.level,loaded:!!geo,radius:q.radius,visualScale});
  if(!geo)return false;
  gl.useProgram(program);gl.uniformMatrix4fv(u.uVP,false,vp);gl.uniformMatrix4fv(u.uModel,false,trs(sub(p.position,origin),[0,rotation,0],[p.radius*visualScale,p.radius*visualScale,p.radius*visualScale]));
  gl.uniform3fv(u.uLight,auroraNavigationRotate(light,-rotation));gl.uniform3fv(u.uEye,auroraNavigationRotate(mul(sub(eye,p.position),1/(p.radius*visualScale)),-rotation));
  gl.bindBuffer(gl.ARRAY_BUFFER,geo.b);attrs.forEach((a,i)=>{gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,48,i*12);});gl.depthMask(true);gl.drawArrays(gl.TRIANGLES,0,geo.count);return true;
 }
 function label(p,q){
  const t=auroraNpcIdentity(p);if(!t||q.radius<2||q.x<10||q.x>W-10||q.y<105||q.y>H-100)return;
  const gap=Math.max(14,q.radius*(p.npcType==='fracture'?1.45:1.12)),x=q.x+gap+5,y=q.y,full=q.radius>4;
  ctx.font='600 11px "Microsoft YaHei",sans-serif';const title=full?p.name+' · Lv '+t.level:t.symbol+' '+t.level,width=ctx.measureText(title).width+16;
  if(x+width>W-8)return;ctx.fillStyle='#07101ee8';ctx.fillRect(x,y-11,width,23);ctx.strokeStyle=t.color;ctx.lineWidth=2;ctx.beginPath();
  // Five genuinely different monochrome silhouettes in addition to color.
  const cx=q.x,cy=q.y-gap-4;
  if(p.npcType==='outpost'){ctx.moveTo(cx-5,cy-6);ctx.lineTo(cx+2,cy-1);ctx.lineTo(cx-2,cy+2);ctx.lineTo(cx+5,cy+7);}
  else if(p.npcType==='garrison'){ctx.rect(cx-5,cy-5,10,10);ctx.moveTo(cx-3,cy-5);ctx.lineTo(cx-3,cy-9);ctx.moveTo(cx+3,cy-5);ctx.lineTo(cx+3,cy-9);}
  else if(p.npcType==='charon'){for(let i=0;i<8;i++){const a=i*TAU/8;ctx.moveTo(cx+Math.cos(a)*3,cy+Math.sin(a)*3);ctx.lineTo(cx+Math.cos(a)*8,cy+Math.sin(a)*8);}}
  else if(p.npcType==='cargo'){ctx.rect(cx-7,cy-5,14,10);ctx.moveTo(cx,cy-5);ctx.lineTo(cx,cy+5);}
  else{ctx.ellipse(cx,cy,9,3,0,0,TAU);ctx.moveTo(cx-5,cy-5);ctx.lineTo(cx+5,cy-5);ctx.moveTo(cx-5,cy+5);ctx.lineTo(cx+5,cy+5);}
  ctx.stroke();ctx.fillStyle=t.color;ctx.fillText(title,x+8,y+5);
 }
 return {begin,draw,label,recordPatrol:p=>patrols.push(p),get stats(){return {loaded:[...cache.keys()],pending:[...pending.keys()],failed:[...failed],visible,patrols,bufferCount:cache.size};},dispose(){disposed=true;for(const c of pending.values())c.abort();for(const g of cache.values())gl.deleteBuffer(g.b);cache.clear();gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);overlay.remove();}};
}
