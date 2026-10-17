
'use strict';
// AURORA II / stylized planetary diorama v3.0.0 / continental terrain and orbital shipyard
// Native WebGL renderer with a depth atlas and the shared, locally hosted HDR space sky.
// This visual prototype does not implement or migrate production game rules.
// Production wraps reusable detail resources in a persistent native WebGL world.
// Deterministic Fibonacci districts; the named facilities are illustrative only.
function createAuroraRuntime(options={}) {
const detailOnly=!!options.detailOnly;
if(typeof window!=='undefined')window.__AURORA_CONFIG??={biome:new URLSearchParams(location.search).get('biome')||'terrestrial',production:new URLSearchParams(location.search).get('mode')==='game'};
const productionMode=detailOnly||typeof window!=='undefined'&&!!window.__AURORA_CONFIG?.production;
if(productionMode)document.documentElement.classList.add('game-scene');
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const PI=Math.PI, TAU=PI*2, R=16, PAD=.36, SITE=2.05, GOLDEN=PI*(3-Math.sqrt(5));
function productionRate(b){return productionMode?clamp(b.operationRate??1,0,1):b.state==='lowpower'?.35:b.state==='upgrade'?.7:1;}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)), mix=(a,b,t)=>a+(b-a)*t, smooth=(a,b,t)=>{t=clamp((t-a)/(b-a),0,1);return t*t*(3-2*t)}, add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]], sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]], mul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s], dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2], cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]], len=a=>Math.hypot(...a), norm=a=>mul(a,1/(len(a)||1)), vlerp=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
const hex=s=>{s=s.replace('#','');return [parseInt(s.slice(0,2),16)/255,parseInt(s.slice(2,4),16)/255,parseInt(s.slice(4,6),16)/255]};
const C={ivory:hex('e1e4d7'),roof:hex('466277'),dark:hex('22374d'),base:hex('4b5963'),black:hex('172535'),teal:hex('58ebd3'),glass:hex('216789'),metal:hex('d17929'),gold:hex('ffbd53'),white:hex('edf2dc'),purple:hex('e1a6ff'),crystal:hex('a14ce0'),gas:hex('49c9b2'),red:hex('c7693c'),road:hex('465263'),line:hex('f0ce86'),tree:hex('2e784e'),trunk:hex('716043')};
let seed=241109;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
function hash(x,y,z){let h=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(z,2147483647);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295*2-1}
function noise(x,y,z){let a=Math.floor(x),b=Math.floor(y),c=Math.floor(z);x-=a;y-=b;z-=c;x=x*x*(3-2*x);y=y*y*(3-2*y);z=z*z*(3-2*z);return mix(mix(mix(hash(a,b,c),hash(a+1,b,c),x),mix(hash(a,b+1,c),hash(a+1,b+1,c),x),y),mix(mix(hash(a,b,c+1),hash(a+1,b,c+1),x),mix(hash(a,b+1,c+1),hash(a+1,b+1,c+1),x),y),z)}
function fbm(n,f){return noise(n[0]*f+7.3,n[1]*f-2.4,n[2]*f+1.2)*.67+noise(n[0]*f*2.04-1,n[1]*f*2.04+8,n[2]*f*2.04)*.24+noise(n[0]*f*4.1,n[1]*f*4.1,n[2]*f*4.1)*.09}
function ident(){return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}
function mm(a,b){const o=new Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o}
function trs(t=[0,0,0],r=[0,0,0],s=[1,1,1]){const [x,y,z]=r,cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);let mx=[1,0,0,0,0,cx,sx,0,0,-sx,cx,0,0,0,0,1],my=[cy,0,-sy,0,0,1,0,0,sy,0,cy,0,0,0,0,1],mz=[cz,sz,0,0,-sz,cz,0,0,0,0,1,0,0,0,0,1],m=mm(mm(my,mx),mz);for(let j=0;j<3;j++)for(let i=0;i<3;i++)m[j*4+i]*=s[j];m[12]=t[0];m[13]=t[1];m[14]=t[2];return m}
function pt(m,p){return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]]}
function normal3(m){const a=[m[0],m[1],m[2]],b=[m[4],m[5],m[6]],c=[m[8],m[9],m[10]],bc=cross(b,c),ca=cross(c,a),ab=cross(a,b),det=dot(a,bc)||1;return [...mul(bc,1/det),...mul(ca,1/det),...mul(ab,1/det)]}
function nt(m,p){return norm([m[0]*p[0]+m[3]*p[1]+m[6]*p[2],m[1]*p[0]+m[4]*p[1]+m[7]*p[2],m[2]*p[0]+m[5]*p[1]+m[8]*p[2]])}
function frame(up,pos){const x=norm(cross(Math.abs(up[1])>.98?[0,0,1]:[0,1,0],up)),z=norm(cross(x,up));return [x[0],x[1],x[2],0,up[0],up[1],up[2],0,z[0],z[1],z[2],0,...pos,1]}
function lookAt(eye,target,up){const z=norm(sub(eye,target)),x=norm(cross(up,z)),y=cross(z,x);return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]}
function perspective(fov,aspect,near,far,shift=0){const f=1/Math.tan(fov/2),nf=1/(near-far);return [f/aspect,0,0,0,0,f,0,0,shift,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]}
function proj(m,p){const w=m[3]*p[0]+m[7]*p[1]+m[11]*p[2]+m[15];return [(m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12])/w,(m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13])/w,(m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14])/w,w]}
// Every vertex stores position, normal, RGB, emissive factor, and surface type.
const STRIDE=11;function pushv(a,p,n,c,emit=0,type=0){a.push(...p,...n,...c,emit,type)}
function tri(a,p,q,r,c,emit=0,type=0,ns=null){const n=ns?null:norm(cross(sub(q,p),sub(r,p)));pushv(a,p,ns?ns[0]:n,c,emit,type);pushv(a,q,ns?ns[1]:n,c,emit,type);pushv(a,r,ns?ns[2]:n,c,emit,type)}
function quad(a,p,q,r,s,c,e=0,t=0){tri(a,p,q,r,c,e,t);tri(a,p,r,s,c,e,t)}
const GEO={};function boxgeo(){if(GEO.box)return GEO.box;const a=[],p=[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]];for(const f of [[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[0,1,5,4],[3,7,6,2]])quad(a,...f.map(i=>p[i]),[1,1,1]);return GEO.box=a}
function cylgeo(rt=1,rb=1,h=1,n=12){const key=`c${rt},${rb},${h},${n}`;if(GEO[key])return GEO[key];const a=[];for(let i=0;i<n;i++){const a0=i/n*TAU,a1=(i+1)/n*TAU,p=[Math.cos(a0)*rb,-h/2,Math.sin(a0)*rb],q=[Math.cos(a1)*rb,-h/2,Math.sin(a1)*rb],r=[Math.cos(a1)*rt,h/2,Math.sin(a1)*rt],s=[Math.cos(a0)*rt,h/2,Math.sin(a0)*rt];quad(a,p,s,r,q,[1,1,1]);if(rt>0)tri(a,[0,h/2,0],r,s,[1,1,1]);if(rb>0)tri(a,[0,-h/2,0],p,q,[1,1,1])}return GEO[key]=a}
function spheregeo(seg=12,rings=8,half=false){const key=`s${seg},${rings},${half}`;if(GEO[key])return GEO[key];const a=[];for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){function v(k,l){let ph=k/rings*PI*(half?.5:1),th=l/seg*TAU;return [Math.sin(ph)*Math.cos(th),Math.cos(ph),Math.sin(ph)*Math.sin(th)]}const p=v(j,i),q=v(j+1,i),r=v(j+1,i+1),s=v(j,i+1);tri(a,p,q,r,[1,1,1],0,0,[p,q,r]);tri(a,p,r,s,[1,1,1],0,0,[p,r,s])}return GEO[key]=a}
function torusgeo(rad=1,tube=.06,seg=32,sides=6){const a=[];for(let i=0;i<seg;i++)for(let j=0;j<sides;j++){function v(k,l){let u=k/seg*TAU,v=l/sides*TAU;return [(rad+tube*Math.cos(v))*Math.cos(u),tube*Math.sin(v),(rad+tube*Math.cos(v))*Math.sin(u)]}quad(a,v(i,j),v(i+1,j),v(i+1,j+1),v(i,j+1),[1,1,1])}return a}
function append(dst,src,m,c=null,emit=null,type=null){const nm=normal3(m);for(let i=0;i<src.length;i+=STRIDE){const p=pt(m,src.slice(i,i+3)),n=nt(nm,src.slice(i+3,i+6));pushv(dst,p,n,c||src.slice(i+6,i+9),emit===null?src[i+9]:emit,type===null?src[i+10]:type)}}
function box(a,p,s,c,r=[0,0,0],e=0){append(a,boxgeo(),trs(p,r,s),c,e)}
function cyl(a,p,rad,h,c,n=12,r=[0,0,0],rt=null,e=0){append(a,cylgeo(rt===null?rad:rt,rad,h,n),trs(p,r),c,e)}
function sphere(a,p,s,c,e=0,half=false){append(a,spheregeo(12,8,half),trs(p,[0,0,0],s),c,e)}
function ring(a,p,rad,tube,c,r=[0,0,0],e=0,seg=40){append(a,torusgeo(rad,tube,seg,6),trs(p,r),c,e)}
function beam(a,p,q,rad,c,n=6,e=0){const d=sub(q,p),mid=mul(add(p,q),.5),m=frame(norm(d),mid);append(a,cylgeo(rad,rad,len(d),n),m,c,e)}
/*__AURORA_MOON__*/
/*__AURORA_BIOMES__*/
/*__AURORA_VOLCANOES__*/
/*__AURORA_BRIDGES__*/
const districtSpecs=[['radar','深空雷达','DEEP SPACE RADAR'],['crystal','晶体开采区','CRYSTAL HARVEST'],['shipyard','联盟物流中心','ALLIANCE LOGISTICS'],['capital','行星指挥中心','PLANETARY CAPITAL'],['fusion','聚变电站','FUSION POWER'],['research','行星研究院','PLANETARY RESEARCH'],['metal','金属开采区','ORE EXTRACTION'],['robotics','机器人装配厂','ROBOTICS ASSEMBLY'],['gas','气体开采区','GAS EXTRACTION'],['solar','太阳能阵列','SOLAR ARRAY'],['nano','纳米制造厂','NANOFABRICATION'],['spaceport','太空电梯','ORBITAL ELEVATOR'],['support','行星保障中心','PLANETARY SUPPORT'],['shield','地形改造器','TERRAFORMING CONTROL']];
const districts=districtSpecs.map((sp,i)=>{const y=1-2*(i+.5)/14,rr=Math.sqrt(1-y*y),a=i*GOLDEN+.3,n=[Math.cos(a)*rr,y,Math.sin(a)*rr];return {i,id:`D${String(i+1).padStart(2,'0')}`,type:sp[0],name:sp[1],en:sp[2],n,m:mm(frame(n,mul(n,R+PAD)),trs([0,0,0],[0,0,0],[SITE,SITE,SITE])),resource:['gas','metal','crystal'].includes(sp[0]),buildings:[],actors:[]}});
/*__AURORA_TERRAIN__*/
function ground(n,extra=0){return mul(n,R+terrain(n)+extra)}
function localPoint(d,x,z,h=0){return ground(norm(pt(d.m,[x,0,z])),h*SITE)}
function localHeight(d,x,z){
 // Scenery keeps x/z fixed in the district frame. A radial projection changes
 // those coordinates on slopes, so solve the surface intersection along d.n.
 const lateralSquared=SITE*SITE*(x*x+z*z);let height=0;
 for(let i=0;i<8;i++){
  const n=norm(pt(d.m,[x,height/SITE,z])),radius=R+terrain(n);
  const next=Math.sqrt(Math.max(0,radius*radius-lateralSquared))-(R+PAD);
  if(Math.abs(next-height)<1e-6)return next;
  height=next;
 }
 const residual=h=>{const p=pt(d.m,[x,h/SITE,z]);return len(p)-R-terrain(norm(p));};
 if(Math.abs(residual(height))<.001)return height;
 // A narrow coastline can make the fixed-point iteration oscillate. Keep a
 // bracketed fallback for those rare steep slopes instead of returning a gap.
 let low=-(R+PAD)+.001,high=R;
 for(let i=0;i<18;i++){height=(low+high)/2;const error=residual(height);if(Math.abs(error)<.0001)return height;if(error>0)high=height;else low=height;}
 return (low+high)/2;
}
const canvas=options.canvas||$('#world'), gl=options.gl||canvas.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
if(!gl){$('#loading').remove();$('#error').style.display='block';$('#error').innerHTML='<h2>浏览器未能启动三维渲染</h2><p>请在 Chrome 或 Edge 中启用硬件加速，然后重新打开本文件。此页面无需联网。</p>';return}
const vs=`attribute vec3 aPosition;attribute vec3 aNormal;attribute vec4 aColor;attribute float aType;
uniform mat4 uVP;uniform mat4 uModel;uniform mat4 uLightVP;uniform mat3 uNormal;
varying vec3 vPos;varying vec3 vNormal;varying vec4 vColor;varying float vType;varying float vY;varying vec4 vShadow;
void main(){vec4 p=uModel*vec4(aPosition,1.0);vPos=p.xyz;vNormal=normalize(uNormal*aNormal);vColor=aColor;vType=aType;vY=aPosition.y;vShadow=uLightVP*p;gl_Position=uVP*p;}`;
const fs=`precision highp float;
varying vec3 vPos;varying vec3 vNormal;varying vec4 vColor;varying float vType;varying float vY;varying vec4 vShadow;
uniform vec3 uEye;uniform vec3 uLight;uniform float uTime;uniform float uOpacity;uniform float uState;uniform float uClip;
uniform sampler2D uShadowMap;uniform float uShadowPass;
vec4 packDepth(const in float depth){const vec4 bitShift=vec4(16777216.0,65536.0,256.0,1.0);const vec4 bitMask=vec4(0.0,0.00390625,0.00390625,0.00390625);vec4 res=fract(depth*bitShift);res-=res.xxyz*bitMask;return res;}
float unpackDepth(vec4 rgba){return dot(rgba,vec4(0.000000059604645,0.000015258789,0.00390625,1.0));}
void main(){
 if(vY>uClip)discard;
 if(uShadowPass>.5){gl_FragColor=packDepth(gl_FragCoord.z);return;}
 vec3 n=normalize(vNormal),v=normalize(uEye-vPos);float nd=max(dot(n,uLight),0.0),fill=max(dot(n,normalize(uEye)),0.0);
 vec3 sc=vShadow.xyz/vShadow.w*.5+.5;float sh=1.0;
 if(sc.x>0.0&&sc.x<1.0&&sc.y>0.0&&sc.y<1.0&&sc.z>0.0&&sc.z<1.0&&nd>0.0){float oc=0.0;float bias=.00048+.00072*(1.0-nd);
 for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){float dep=unpackDepth(texture2D(uShadowMap,sc.xy+vec2(float(x),float(y))/1536.0));oc+=step(sc.z-bias,dep);}
 sh=.18+.82*oc/9.0;
 }
 vec3 col=vColor.rgb;float lum=dot(col,vec3(.299,.587,.114));if(uState>.5)col=mix(col,vec3(lum),.57)*.63;
 float sky=.5+.5*dot(n,normalize(vPos));
 vec3 lighting=vec3(.25,.33,.41)+sky*vec3(.12,.12,.10)+nd*sh*vec3(.86,.80,.67)+fill*vec3(.09,.12,.15);
 vec3 finalc=col*lighting;
 float spec=pow(max(dot(n,normalize(uLight+v)),0.0),52.0);
 if(vType>.5&&vType<1.5){float fres=pow(1.0-max(dot(n,v),0.0),3.0);finalc=col*(.63+nd*.37+fill*.13)+vec3(.055,.17,.21)*fres+vec3(.40,.59,.62)*spec*.65;
 float rip=sin(vPos.x*12.0+sin(vPos.z*7.0)+uTime*.16)*sin(vPos.z*11.0+vPos.y*6.0);finalc+=rip*.006;
 }else finalc+=spec*.05*sh;
 finalc+=col*vColor.a*(uState>.5?.05:.66);
 ${auroraBiomeSurfaceShader}
 finalc=pow(max(finalc,vec3(0.0)),vec3(.94));gl_FragColor=vec4(finalc,uOpacity);
}`;

const resourceBuffers=[],resourceShaders=[];
function shader(t,src){const s=gl.createShader(t);resourceShaders.push(s);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
const A={};for(const n of ['aPosition','aNormal','aColor','aType'])A[n]=gl.getAttribLocation(program,n);const U={};for(const n of ['uVP','uModel','uNormal','uEye','uLight','uTime','uOpacity','uState','uClip','uLightVP','uShadowMap','uShadowPass'])U[n]=gl.getUniformLocation(program,n);
let bufferCount=0;function upload(a,mode=gl.TRIANGLES){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(a),gl.STATIC_DRAW);bufferCount++;resourceBuffers.push(b);return {b,count:a.length/STRIDE,mode}}
function draw(geo,m=ident(),opacity=1,state=0,clip=1e5){if(!geo||!geo.count)return;gl.bindBuffer(gl.ARRAY_BUFFER,geo.b);for(const [name,size,off] of [['aPosition',3,0],['aNormal',3,3],['aColor',4,6],['aType',1,10]]){gl.enableVertexAttribArray(A[name]);gl.vertexAttribPointer(A[name],size,gl.FLOAT,false,STRIDE*4,off*4)}gl.uniformMatrix4fv(U.uModel,false,m);gl.uniformMatrix3fv(U.uNormal,false,normal3(m));gl.uniform1f(U.uOpacity,opacity);gl.uniform1f(U.uState,state);gl.uniform1f(U.uClip,clip);gl.drawArrays(geo.mode,0,geo.count)}
gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);

// A color depth atlas gives the miniature real cast shadows without external dependencies.
const SHADOW_SIZE=1536,shadowTexture=gl.createTexture(),shadowFBO=gl.createFramebuffer(),shadowDepth=gl.createRenderbuffer();
gl.bindTexture(gl.TEXTURE_2D,shadowTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,SHADOW_SIZE,SHADOW_SIZE,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
gl.bindRenderbuffer(gl.RENDERBUFFER,shadowDepth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,SHADOW_SIZE,SHADOW_SIZE);
gl.bindFramebuffer(gl.FRAMEBUFFER,shadowFBO);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,shadowTexture,0);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,shadowDepth);
const shadowsReady=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;gl.bindFramebuffer(gl.FRAMEBUFFER,null);
function ortho(size,near,far){return [1/size,0,0,0,0,1/size,0,0,0,0,-2/(far-near),0,0,0,-(far+near)/(far-near),1];}

let terrainGeo,oceanGeo,naturalGeo,decorGeo,cloudGeo,gridGeo,selectionGeo;const buildings=[],rotors=[],actors=[],elevators=[];
function platform(a,rad=1.03,type=''){
 if(['metal','metalstore','crystalstore','gasstore','robotics','nano','shipyard','research','solar','support','gas'].includes(type)){
 const w=type==='gas'?1.15:1.62,dd=type==='gas'?1.08:1.22;
 box(a,[0,-.062,0],[w,.19,dd],C.base);box(a,[0,.040,0],[w*.98,.026,dd*.98],hex('a3b1ad'));
 for(let x of [-w*.43,w*.43]){box(a,[x,-.10,dd*.43],[.18,.29,.18],C.ivory);box(a,[x,-.10,-dd*.43],[.18,.29,.18],C.ivory);}
 for(let i=0;i<3;i++)box(a,[0,-.07-i*.05,dd*.5+.10+i*.08],[.50,.05,.10],C.base);
 return;
 }
 cyl(a,[0,-.07,0],rad*.89,.24,C.base,8);
 cyl(a,[0,.05,0],rad*.86,.035,hex('9caca5'),8);
 for(let k=0;k<8;k++){const t=(k+.5)*TAU/8,x=Math.cos(t)*rad*.79,z=Math.sin(t)*rad*.79;
 box(a,[x,-.05,z],[.13,.28,.20],C.ivory,[0,-t,0]);
 }
}
function windows(a,x,y,z,w,h,d){for(let s of [-1,1]){for(let i=0;i<4;i++)box(a,[x+(i-1.5)*w*.19,y,z+s*d*.505],[w*.12,h,.009],C.gold,[0,0,0],.7);for(let i=0;i<3;i++)box(a,[x+s*w*.505,y,z+(i-1)*d*.23],[.009,h,d*.13],C.teal,[0,0,0],.5)}}
function block(a,p,s,c=C.ivory){box(a,p,s,c);box(a,[p[0],p[1]+s[1]/2+.022,p[2]],[s[0]*1.04,.048,s[2]*1.04],C.roof);windows(a,p[0],p[1]+s[1]*.07,p[2],s[0],Math.min(.065,s[1]*.16),s[2])}
function antenna(a,x,y,z,h=.4){cyl(a,[x,y+h/2,z],.018,h,C.ivory,6);sphere(a,[x,y+h,z],[.032,.032,.032],C.gold,1)}
function tank(a,x,z,r=.23,h=.65,color=C.ivory){cyl(a,[x,h/2+.09,z],r,h,color,14);sphere(a,[x,h+.09,z],[r,.10,r],color,0,true);cyl(a,[x,h*.52,z],r*1.008,.075,C.gas,14);box(a,[x+r+.015,h*.5,z],[.025,h,.05],C.dark)}
function crane(a,p,h=1.3,arm=1.0){const [x,y,z]=p;for(let q of [-1,1]){box(a,[x+q*.13,y+h/2,z],[.05,h,.055],C.gold);for(let t=0;t<4;t++)beam(a,[x-.13,y+.1+t*h/4,z],[x+.13,y+.1+(t+1)*h/4,z],.012,C.gold)}box(a,[x+arm*.3,y+h,z],[arm,.075,.1],C.gold);beam(a,[x+arm*.65,y+h,z],[x+arm*.65,y+h-.5,z],.009,C.dark);box(a,[x+arm*.65,y+h-.51,z],[.06,.05,.045],C.black)}
/*__AURORA_ELEVATOR__*/
function model(type){const a=[];platform(a,type==='shipyard'?1.16:type.includes('store')?.88:1.03,type);
if(type==='support'){
 block(a,[0,.28,0],[1.35,.46,.9]);block(a,[.45,.7,-.15],[.38,.42,.54]);
 for(const x of[-.43,0,.43]){box(a,[x,.3,.458],[.32,.28,.026],C.dark);box(a,[x,.45,.48],[.34,.035,.035],C.gold,[0,0,0],.4);}
 for(const x of[-.48,-.20]){box(a,[x,.535,-.19],[.2,.05,.28],C.roof);for(let k=0;k<4;k++)box(a,[x,.565,-.29+k*.055],[.15,.02,.015],C.ivory);}
 antenna(a,.45,.94,-.15,.36);box(a,[-.56,.10,.70],[.6,.035,.30],C.roof);return a;
}
if(type==='spaceport'){append(a,elevatorTerminalModel(),ident());return a}
if(type==='shipyard'){append(a,shipyardLogisticsModel(),ident());return a}
if(type==='capital'){
 cyl(a,[0,.17,0],.99,.24,C.ivory,12);cyl(a,[0,.34,0],.83,.14,C.dark,16);
 cyl(a,[0,.64,0],.67,.52,C.ivory,20);cyl(a,[0,.69,0],.689,.12,C.glass,20,[0,0,0],null,.3);
 sphere(a,[0,.91,0],[.70,.48,.70],C.ivory,0,true);ring(a,[0,.94,0],.695,.026,C.gold);
 for(let i=0;i<12;i++){let t=i*TAU/12;
 for(let j=0;j<7;j++){let p=j/7*PI/2,q=(j+1)/7*PI/2;beam(a,[Math.cos(t)*.71*Math.cos(p),.91+.48*Math.sin(p),Math.sin(t)*.71*Math.cos(p)],[Math.cos(t)*.71*Math.cos(q),.91+.48*Math.sin(q),Math.sin(t)*.71*Math.cos(q)],.014,C.roof,5);}
 }
 cyl(a,[0,1.47,0],.105,.22,C.gold,10);antenna(a,0,1.58,0,.42);
 for(let i=0;i<8;i++){let t=i*TAU/8+.2,x=Math.cos(t)*.88,z=Math.sin(t)*.88,h=.82+((i%3)/3)*.48;
 block(a,[x,h/2+.16,z],[.20,h,.24]);box(a,[x,h+.21,z],[.10,.22,.12],C.ivory);antenna(a,x,h+.32,z,.20);
 }
 for(let z of [-1,1])block(a,[0,.23,z*.86],[.60,.27,.33]);
}
else if(type==='research'){block(a,[0,.28,0],[1.22,.37,.65]);for(let s of [-1,1]){cyl(a,[s*.62,.32,.25],.34,.35,C.ivory,12);sphere(a,[s*.62,.51,.25],[.34,.31,.34],C.glass,0,true);ring(a,[s*.62,.51,.25],.34,.022,C.ivory)}block(a,[.15,.65,-.25],[.36,.84,.3]);antenna(a,.15,1.07,-.25,.4);box(a,[-.25,.1,.66],[.48,.025,.3],C.glass,[.1,0,0]);}
else if(type==='radar'){block(a,[0,.22,0],[.7,.3,.62]);cyl(a,[0,.64,0],.15,.6,C.ivory,10);for(let s of [-1,1])beam(a,[s*.37,.1,0],[0,.92,0],.045,C.roof);block(a,[.65,.24,.35],[.3,.3,.4]);antenna(a,.68,.4,.35,.38);}
else if(type==='shipyard'){block(a,[0,.24,.08],[1.45,.28,1.02],C.dark);for(const x of [-.73,.73])for(const z of [-.48,.48]){box(a,[x,.84,z],[.13,1.4,.14],C.ivory);box(a,[x,1.49,z],[.2,.10,.19],C.gold)}for(const z of [-.48,.48]){box(a,[0,1.52,z],[1.65,.12,.15],C.roof);for(let k=0;k<6;k++)box(a,[(k-2.5)*.23,1.59,z],[.08,.02,.12],C.gold)}box(a,[0,.58,0],[.42,.22,1.15],C.ivory);append(a,cylgeo(0,.24,.47,4),trs([0,.59,-.71],[-PI/2,0,PI/4]),C.ivory);for(let x of [-.31,.31])cyl(a,[x,.58,.54],.09,.33,C.dark,8,[PI/2,0,0]);}
else if(type==='fusion'){block(a,[0,.27,.42],[1.25,.35,.45]);for(let x of [-.46,.46]){cyl(a,[x,.47,-.23],.29,.77,C.ivory,14,[0,0,0],.21);cyl(a,[x,.86,-.23],.23,.12,C.roof,14);cyl(a,[x,.923,-.23],.176,.02,C.black,14);ring(a,[x,.6,-.23],.248,.024,C.teal,[0,0,0],.65)}cyl(a,[0,.41,-.63],.16,.5,C.gold,10);antenna(a,.77,.1,.36,.57);}
else if(type==='solar'){cyl(a,[0,.3,0],.14,.43,C.ivory,10);block(a,[0,.31,.0],[.29,.37,.4]);for(let i=-1;i<=1;i++)for(let j of [-1,1]){const p=[i*.54,.43,j*.51];box(a,p,[.5,.038,.64],C.glass,[-.32,0,0]);for(let q=-1;q<=1;q++)box(a,[p[0]+q*.147,p[1]+.025,p[2]],[.007,.006,.6],C.gas,[-.32,0,0]);beam(a,[p[0],.1,p[2]],[p[0],.37,p[2]],.027,C.roof)}}
else if(type==='gas'){
 block(a,[0,.22,0],[.80,.32,.64]);for(const x of [-.32,.32])beam(a,[x,.36,0],[0,1.08,0],.067,C.ivory);
 box(a,[0,1.08,0],[.20,.11,.18],C.gold);cyl(a,[0,.30,-.45],.23,.40,C.gas,12);
 block(a,[.61,.32,.04],[.30,.47,.48]);beam(a,[0,1.04,0],[0,.20,.42],.024,C.dark);
 for(let x of [-.68,-.91]){cyl(a,[x,.64,-.41],.12,1.04,C.ivory,10);cyl(a,[x,.91,-.41],.126,.18,C.gas,10);sphere(a,[x,1.17,-.41],[.12,.11,.12],C.ivory,0,true);beam(a,[x,.31,-.41],[x,.31,.23],.045,C.gas);}
}
else if(type==='metal'){
 block(a,[.27,.31,-.08],[.76,.46,.55],C.ivory);box(a,[.27,.40,.207],[.62,.09,.02],C.glass);
 for(let x of [-.45,-.18]){box(a,[x,.17,.12],[.17,.19,.65],C.dark);for(let z of [-.1,.12,.34])cyl(a,[x,.15,z],.10,.19,C.black,10,[0,0,PI/2]);}
 cyl(a,[-.33,.36,.09],.30,.16,C.gold,12);box(a,[-.37,.64,.10],[.33,.43,.34],C.metal);box(a,[-.37,.71,.281],[.26,.15,.015],C.glass);
 beam(a,[-.35,.75,-.02],[-.38,1.42,-.74],.12,C.gold,6);
 beam(a,[-.38,1.42,-.74],[-.35,.92,-1.35],.09,C.metal,6);
 beam(a,[-.35,.79,-.04],[-.38,1.38,-.78],.032,C.ivory,6);
 for(let x of [-.65,-.04])beam(a,[x,.11,-.32],[x,.98,-.94],.047,C.dark);
 box(a,[-.33,.49,-.57],[.7,.07,1.15],C.dark,[-.49,0,0]);
 for(let k=0;k<8;k++)box(a,[-.33,.20+k*.074,-.09-k*.11],[.52,.04,.105],C.gold,[-.5,0,0]);
 crane(a,[.72,.08,-.45],1.38,.96);antenna(a,.45,.57,-.10,.48);
}
else if(type==='crystal'){
 cyl(a,[0,.23,0],.58,.27,C.dark,8);cyl(a,[0,.52,0],.47,.42,C.ivory,8);
 cyl(a,[0,.53,0],.483,.13,C.crystal,8,[0,0,0],null,.55);
 sphere(a,[0,.75,0],[.48,.32,.48],C.roof,0,true);ring(a,[0,.78,0],.48,.028,C.purple,[0,0,0],.35);
 for(let x of [-.73,.73]){cyl(a,[x,.40,0],.19,.64,C.ivory,6);cyl(a,[x,.75,0],.20,.07,C.purple,6,[0,0,0],null,.5);beam(a,[x,.74,0],[x*.45,1.31,0],.075,C.ivory,6);}
 ring(a,[0,1.12,0],.36,.055,C.purple,[PI/2,0,0],.6);crystal(a,[0,.86,0],.44,.16,C.crystal);
 block(a,[0,.26,.62],[.70,.29,.35]);box(a,[0,.37,.80],[.53,.03,.025],C.purple,[0,0,0],1.2);
}
else if(type==='metalstore'){block(a,[0,.35,0],[1.20,.51,.92]);box(a,[0,.54,0],[1.22,.16,.95],C.roof,[0,0,0]);box(a,[0,.26,.471],[.50,.33,.013],C.black);for(let y of [.15,.24,.33,.42])box(a,[0,y,.482],[.45,.013,.01],C.metal);for(let x of [-.68,.68])box(a,[x,.2,.55],[.14,.18,.23],C.metal);box(a,[0,.65,0],[.4,.02,.28],C.metal);}
else if(type==='gasstore'){tank(a,-.4,.14,.24,.78);tank(a,.16,.14,.26,.98);tank(a,.55,-.38,.17,.58);beam(a,[-.4,.3,.48],[.45,.3,.48],.045,C.gas);for(let x of [-.4,.16])beam(a,[x,.3,.14],[x,.3,.48],.035,C.gas)}
else if(type==='crystalstore'){block(a,[0,.3,0],[1.06,.43,.88]);cyl(a,[0,.60,0],.5,.16,C.roof,6);box(a,[0,.25,.448],[.44,.25,.02],C.black);box(a,[0,.48,.467],[.6,.036,.03],C.purple,[0,0,0],1);for(let x of [-.5,.5])box(a,[x,.4,0],[.065,.34,.89],C.purple);}
else if(type==='robotics'){block(a,[0,.34,0],[1.26,.51,.91]);for(let x of [-.42,0,.42])box(a,[x,.29,.467],[.26,.27,.027],C.black);for(let x of [-.44,.44]){box(a,[x,.7,-.17],[.27,.17,.38],C.roof);beam(a,[x,.8,-.12],[x+.11,1.06,.12],.055,C.gold);beam(a,[x+.11,1.06,.12],[x+.18,.82,.43],.048,C.gold)}antenna(a,.55,.64,-.32,.5);}
else if(type==='nano'){block(a,[0,.38,0],[1.15,.61,.91]);for(let x of [-.39,0,.39]){cyl(a,[x,.83,-.08],.14,.3,C.roof,8);sphere(a,[x,1.02,-.08],[.14,.12,.14],C.gas,0,true)}for(let x of [-.6,.6])beam(a,[x,.25,-.5],[x,.25,.5],.047,C.teal);block(a,[0,.25,.67],[.64,.3,.28]);}
else if(type==='spaceport'){cyl(a,[0,.12,0],.87,.08,C.dark,32);ring(a,[0,.17,0],.67,.028,C.gold);for(let t=0;t<4;t++)box(a,[Math.cos(t*PI/2)*.89,.17,Math.sin(t*PI/2)*.89],[.09,.035,.09],C.gold,[0,0,0],1);cyl(a,[.05,.69,0],.15,.95,C.ivory,12);cyl(a,[.05,1.27,0],.15,.23,C.ivory,12,[0,0,0],0);for(let x of [-.2,.2]){cyl(a,[x+.05,.5,.0],.055,.53,C.roof,8);box(a,[x+.05,.31,0],[.16,.2,.08],C.roof)}box(a,[-.58,.69,-.2],[.12,1.06,.16],C.gold);for(let k=0;k<5;k++)beam(a,[-.66,.24+k*.19,-.2],[-.5,.43+k*.19,-.2],.012,C.gold);beam(a,[-.58,1.03,-.2],[.01,1.03,0],.035,C.gold);}
else if(type==='support'){for(const x of [-.4,.4])for(const z of [-.37,.37]){cyl(a,[x,.19,z],.31,.17,C.ivory,10);cyl(a,[x,.29,z],.25,.036,C.dark,12);box(a,[x,.315,z],[.4,.027,.024],C.gold,[0,PI/4,0]);}block(a,[.0,.29,-.8],[.56,.4,.23]);antenna(a,.14,.49,-.8,.43);}
else if(type==='shield'){cyl(a,[0,.27,0],.57,.34,C.ivory,12);cyl(a,[0,.59,0],.23,.5,C.roof,10);sphere(a,[0,.94,0],[.24,.29,.24],C.teal,.4);for(let i=0;i<3;i++){const t=i/3*TAU;beam(a,[Math.cos(t)*.8,.12,Math.sin(t)*.8],[Math.cos(t)*.42,1.24,Math.sin(t)*.42],.075,C.ivory);sphere(a,[Math.cos(t)*.42,1.24,Math.sin(t)*.42],[.06,.06,.06],C.teal,1)}ring(a,[0,.91,0],.43,.04,C.teal,[0,0,0],.5)}
return a}
function wireBox(w,h,d){const a=[],p=[[-w/2,.09,-d/2],[w/2,.09,-d/2],[w/2,h,-d/2],[-w/2,h,-d/2],[-w/2,.09,d/2],[w/2,.09,d/2],[w/2,h,d/2],[-w/2,h,d/2]];for(const [i,j] of [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]])for(const v of [p[i],p[j]])pushv(a,v,[0,1,0],C.teal,.8);for(let y=.35;y<h;y+=.24)for(const [i,j] of [[0,1],[1,5],[5,4],[4,0]])for(const k of [i,j])pushv(a,[p[k][0],y,p[k][2]],[0,1,0],C.teal,.4);return a}
function scaffold(){const a=[];for(let x of [-.95,.95])for(let z of [-.85,.85]){beam(a,[x,.08,z],[x,1.6,z],.025,C.gold);for(let y=.35;y<1.7;y+=.4)beam(a,[x,y,-.85],[x,y,.85],.018,C.gold)}for(let z of [-.85,.85])for(let y=.35;y<1.7;y+=.4){beam(a,[-.95,y,z],[.95,y,z],.018,C.gold);beam(a,[-.95,y,z],[.95,y+.35,z],.014,C.gold)}crane(a,[-1.08,.08,-.55],1.95,1.35);return a}
function dish(){const a=[];const seg=24,rings=5;for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){const f=(r,t)=>[r*.68*Math.cos(t),r*r*.25,r*.68*Math.sin(t)],r0=j/rings,r1=(j+1)/rings,t0=i/seg*TAU,t1=(i+1)/seg*TAU;quad(a,f(r0,t0),f(r0,t1),f(r1,t1),f(r1,t0),C.ivory)}ring(a,[0,.25,0],.68,.022,C.roof);for(let i=0;i<3;i++){let t=i*TAU/3;beam(a,[.55*Math.cos(t),.17,.55*Math.sin(t)],[0,.63,0],.017,C.dark)}sphere(a,[0,.64,0],[.06,.055,.06],C.gold);return a}
function crystal(a,p,h=.65,r=.16,c=C.crystal,rot=[0,0,0]){const s=[];append(s,cylgeo(r*.82,r,h*.73,5),trs([0,h*.365,0]),c);append(s,cylgeo(0,r*.82,h*.27,5),trs([0,h*.865,0]),c.map(v=>Math.min(1,v*1.3)),.12);append(a,s,trs(p,rot));}
function createPlanet(){
 const variant=auroraBiomeCreatePlanet();if(variant!==null)return variant;
 const earth=[],sea=[],shore=[],lat=164,lon=328,rows=[];
 for(let j=0;j<=lat;j++){const row=[];for(let i=0;i<=lon;i++){
  const ph=j/lat*PI,th=i/lon*TAU,n=[Math.sin(ph)*Math.cos(th),Math.cos(ph),Math.sin(ph)*Math.sin(th)],h=terrain(n);row.push({n,h,p:mul(n,R+h)});
 }rows.push(row)}
 const sand=hex('d8c68b'),grass=hex('68a765'),grass2=hex('447f52'),snow=hex('e5ebe4');
 function landColor(n,h){
  // Geological color follows narrow mineral seams, never the district boundary.
  const coast=auroraCoastDistance(n),texture=noise(n[0]*26,n[1]*26,n[2]*26);
  let c=vlerp(grass,grass2,clamp(.30+fbm(n,7)*.7+Math.max(0,h-.85)*.16,0,1));
  c=vlerp(sand,c,smooth(.035,.52,coast));
  c=c.map(v=>v*(.96+texture*.07));
  for(const d of districts){if(!d.resource||dot(n,d.n)<.89)continue;
   const [x,z]=auroraDistrictLocal(n,d);
   let seam,extent,tint;
   if(d.type==='metal'){seam=Math.abs(z+1.45+x*.20+.20*Math.sin(x*2.1));extent=(1-smooth(2.7,3.6,Math.abs(x+1.1)));tint=hex('aa8860');}
   else if(d.type==='crystal'){seam=Math.abs(z+1.8+.22*Math.sin(x*2.4)+x*.12);extent=1-smooth(2.3,3.1,Math.abs(x+1.2));tint=hex('8c8a9b');}
   else{seam=Math.abs(z+1.95+.26*Math.sin(x*1.7));extent=1-smooth(2.1,3.2,Math.abs(x+.15));tint=hex('638f6d');}
   const vein=(1-smooth(.18,.72,seam))*extent;
   const amount=vein*(.24+texture*.15)+auroraWorkMask(d,x,z)*.09;
   if(coast>.2)c=vlerp(c,tint,clamp(amount,0,.40));
  }
  if(Math.abs(n[1])>.89&&h>0)c=vlerp(c,snow,smooth(.89,.97,Math.abs(n[1])));
  return c;
 }
 function landTri(p,q,r){const n=norm(add(add(p.n,q.n),r.n)),h=(p.h+q.h+r.h)/3,c=landColor(n,h);tri(earth,p.p,r.p,q.p,c);
  const pts=[];for(let [u,v] of [[p,q],[q,r],[r,p]])if((u.h>0)!==(v.h>0)){let t=-u.h/(v.h-u.h);pts.push(mul(norm(vlerp(u.n,v.n,t)),R+.032))}
  if(pts.length===2)beam(shore,pts[0],pts[1],.024,hex('a4e6d6'),4,.08);
  if(Math.min(p.h,q.h,r.h)<.06){const col=(v)=>{const shallow=smooth(-1.0,-.01,v.h);return vlerp(hex('075779'),hex('208f9b'),shallow)};
   pushv(sea,mul(p.n,R),p.n,col(p),0,1);pushv(sea,mul(r.n,R),r.n,col(r),0,1);pushv(sea,mul(q.n,R),q.n,col(q),0,1);
  }
 }
 for(let j=0;j<lat;j++)for(let i=0;i<lon;i++){const p=rows[j][i],q=rows[j+1][i],r=rows[j+1][i+1],ss=rows[j][i+1];landTri(p,q,r);landTri(p,r,ss)}
 terrainGeo=upload(earth);oceanGeo=upload(sea);
 const dec=shore,cloud=[];
 function tree(a,n,ht,rr,col){const g=[];
  cyl(g,[0,ht*.28,0],.047,ht*.56,hex('796145'),5);
  cyl(g,[0,ht*.47,0],rr,ht*.72,col,5,[0,0,0],0);
  cyl(g,[0,ht*.75,0],rr*.76,ht*.58,col.map(v=>Math.min(1,v*1.11)),5,[0,0,0],0);
  append(a,g,mm(frame(n,ground(n,-.035)),trs([0,0,0],[0,rand()*TAU,0])));
 }
 for(let k=0;k<7600;k++){
  const y=rand()*2-1,t=rand()*TAU,rr=Math.sqrt(1-y*y),n=[Math.cos(t)*rr,y,Math.sin(t)*rr],h=terrain(n);
  if(h<.12||h>1.6||Math.abs(y)>.92)continue;
  if(districts.some(d=>{if(!d.resource)return dot(n,d.n)>Math.cos(3.65/R);if(dot(n,d.n)<.86)return false;const [x,z]=auroraDistrictLocal(n,d);return auroraWorkMask(d,x,z)>.85||auroraGeologyClearance(d,x,z,.3)}))continue;
  if(noise(n[0]*11+8,n[1]*11,n[2]*11)<-.34)continue;
  const ht=.5+rand()*.72,col=rand()<.17?hex('8fac54'):rand()<.35?hex('3c7859'):hex('286c4c');
  tree(dec,n,ht,.20+rand()*.16,col);
 }
 // Small tree groves inside each cleared development district: front verges only.
 for(let d of districts){if(d.resource)continue;for(let i=0;i<11;i++){
  let t=i*2.39+.5,rr=1.80+rand()*.48,x=Math.cos(t)*rr,z=Math.sin(t)*rr;
  if(z<-.55&&x>0)continue;
  let n=norm(localPoint(d,x,z));if(terrain(n)>.1)tree(dec,n,.63+rand()*.47,.23+rand()*.11,hex('438447'));
 }}
 function peak(d,x,z,h,r,ice=true){
  const p=localPoint(d,x,z),up=norm(p),m=frame(up,p),a=[],N=7,levels=[[-.20,1],[h*.18,.99],[h*.54,.65],[h*.80,.35],[h,0]];
  const rnd=Array.from({length:N},()=>.83+rand()*.3),tw=.13;
  for(let j=0;j<levels.length-1;j++)for(let i=0;i<N;i++){
   function v(j,i){const k=(i+N)%N,t=k/N*TAU;return [Math.cos(t)*r*levels[j][1]*rnd[k]+j*.06,levels[j][0]+(j===0?0:Math.sin(i*3.6)*h*.035),Math.sin(t)*r*levels[j][1]*rnd[k]-j*.02]}
   let col=j===0?hex('7f9783'):j===1?hex('7b8e8b'):j===2&&ice?hex('d4dfd3'):j===3&&ice?hex('f2f1df'):hex('b8c4b1');
   col=col.map(v=>v*(.88+(i%3)*.08));quad(a,v(j,i),v(j+1,i),v(j+1,i+1),v(j,i+1),col);
  }append(dec,a,m);
 }
 for(let d of districts){if(d.type==='metal'||d.type==='crystal'||d.type==='gas')continue;
  peak(d,2.07,-1.19,2.9,1.1);peak(d,2.51,-.47,2.1,.86);peak(d,1.49,-2.05,1.85,.82);
 }
 // Outlying volcanic ridges and coastal boulders have footings below the sampled surface.
 for(let k=0;k<180;k++){const n=norm([rand()*2-1,rand()*2-1,rand()*2-1]),h=terrain(n);if(h<.09||districts.some(d=>dot(n,d.n)>.965))continue;
  const a=[],size=.15+rand()*.27;append(a,spheregeo(5,3),trs([0,.03,0],[.2,rand()*TAU,.3],[size,size*.65,size*.85]),hex('8a9e8c'));append(dec,a,frame(n,ground(n,-.05)));
 }
 for(let i=0;i<22;i++){let n=norm([rand()*2-1,rand()*2-1,rand()*2-1]);if(terrain(n)>.02||districts.some(d=>dot(n,d.n)>.95))continue;
  let a=[];for(let k=0;k<5;k++)append(a,spheregeo(7,5),trs([(k-2)*.47,.07*Math.sin(k),Math.sin(k*1.4)*.20],[0,0,0],[.60,.20+.035*(k%2),.37]),hex('e1eeec'));append(cloud,a,frame(n,mul(n,R+1.00)));
 }
 cloudGeo=upload(cloud);
 // Pedestrian approaches, retaining walls, and local gardens.
 for(const d of districts){if(d.resource||detailOnly)continue;let a=[];
  road(dec,d,[[0,1.14],[0,1.63],[.45,1.93],[1.1,1.81]],.19);
  for(let i=0;i<5;i++){let t=PI*.10+i*.27,x=Math.cos(t)*1.57,z=Math.sin(t)*1.57,y=localHeight(d,x,z)/SITE;
   box(a,[x,y+.04,z],[.28,.08,.15],hex('a5b398'),[0,-t,0]);antenna(a,x,y+.1,z,.30);
  }append(dec,a,d.m);
 }
 return dec;
}

function samplePath(points,t){t=clamp(t,0,1)*(points.length-1);let k=Math.min(points.length-2,Math.floor(t)),u=t-k,p0=points[Math.max(0,k-1)],p1=points[k],p2=points[k+1],p3=points[Math.min(points.length-1,k+2)];return [0,1].map(j=>.5*((2*p1[j])+(-p0[j]+p2[j])*u+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*u*u+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*u*u*u))}
function road(a,d,points,width=.18){const count=64;for(let i=0;i<count;i++){let t=i/count,t2=(i+1)/count,p=samplePath(points,t),q=samplePath(points,t2),dv=[q[0]-p[0],q[1]-p[1]],l=Math.hypot(...dv)||1,side=[-dv[1]/l*width/2,dv[0]/l*width/2];quad(a,localPoint(d,p[0]+side[0],p[1]+side[1],.018),localPoint(d,q[0]+side[0],q[1]+side[1],.018),localPoint(d,q[0]-side[0],q[1]-side[1],.018),localPoint(d,p[0]-side[0],p[1]-side[1],.018),C.road);if(i%6<2){beam(a,localPoint(d,p[0],p[1],.026),localPoint(d,q[0],q[1],.026),.010,C.line,4)}}}
const outTruck=[[1.75,1.13],[1.3,1.5],[.15,1.46],[-1.08,1.36],[-1.55,.70]],backTruck=[[-1.55,.70],[-.9,.76],[.22,.82],[1.15,.85],[1.75,1.13]],robotPaths=[[[1.76,1.06],[1.5,1.52],[.20,1.58],[-1.13,1.35],[-1.55,.70]],[[1.76,1.06],[1.0,.82],[.2,.46],[-.35,-.3]]];
// District scenery shares the same tangent frame and ground surface as the fixed slots.
/*__AURORA_GEOLOGY__*/

function buildDistricts(dec){const scaf=upload(scaffold()),dishGeo=upload(dish());for(const d of districts){let cfg;if(d.resource){let x=d.type==='metal'?-.20:-1.55,z=d.type==='crystal'?-1.10:d.type==='metal'?-.20:-.12;cfg=[[d.type,d.name,d.en,x,z],[d.type+'store',d.type==='metal'?'金属仓库':d.type==='gas'?'储气中心':'晶体仓库','RESOURCE STORAGE',1.65,.10]]}else cfg=[[d.type,d.name,d.en,0,0]];
if(auroraBiome==='moon'&&d.resource)cfg=[[d.type+'store',d.name,d.en,0,0]];
for(const [type,name,en,x,z] of cfg){const pos=localPoint(d,x,z,.045),n=norm(pos),bs=d.resource?SITE:2.7,m=mm(frame(n,pos),trs([0,0,0],[0,0,0],[bs,bs,bs])),a=model(type),b={id:`${d.id}-${d.buildings.length+1}`,type,name,en,d,x,z,n,pos,m,geo:upload(a),source:a,wire:upload(wireBox(type==='shipyard'?1.7:1.3,1.25,1.15),gl.LINES),scaf,state:productionMode?'unbuilt':type==='nano'?'construction':type==='shield'?'unbuilt':type==='support'?'paused':'active',progress:.56,height:type==='capital'?1.9:type==='shipyard'?1.7:1.5,scale:bs,radius:(type==='shipyard'?1.2:1.05)*bs};d.buildings.push(b);buildings.push(b);if(type==='spaceport')elevators.push(createSpaceElevator(b))}
if(d.type==='radar')rotors.push({kind:'dish',b:d.buildings[0],geo:dishGeo,local:trs([0,.95,0],[.57,0,0])});
if(d.type==='metal'){let wheel=[];cyl(wheel,[0,0,0],.25,.14,C.dark,14,[0,0,PI/2]);for(let k=0;k<10;k++){let t=k*TAU/10;box(wheel,[0,Math.cos(t)*.28,Math.sin(t)*.28],[.21,.13,.12],C.gold,[t,0,0]);}rotors.push({kind:'bucket',b:d.buildings[0],geo:upload(wheel)});}let a=auroraBiomeDistrictGeology(d)??districtGeology(d);
if(d.type==='metal'){road(dec,d,outTruck,.40);road(dec,d,backTruck,.40);box(a,[-1.55,.028,.70],[.62,.04,.43],C.dark);box(a,[1.75,.033,1.13],[.56,.04,.35],C.dark);beam(a,[-1.9,.51,-.12],[-1.55,.53,.70],.04,C.gold);for(let z=-.1;z<.65;z+=.18)beam(a,[-1.9,.06,z],[-1.9,.48,z],.025,C.roof);}
if(d.type==='crystal'){road(dec,d,robotPaths[0],.28);road(dec,d,robotPaths[1],.28);crystal(a,[-1.55,.02,.23],.66,.18);crystal(a,[-1.81,.01,.16],.41,.13,C.purple,[.13,0,.26]);crystal(a,[-1.31,.02,.21],.46,.14,C.crystal,[-.2,0,-.24]);crystal(a,[-.35,.02,-.79],.82,.19);crystal(a,[-.58,.02,-.86],.53,.13,C.purple,[.08,0,.27]);crystal(a,[-.17,.02,-.94],.60,.14,C.crystal,[-.15,0,-.2]);for(let k=0;k<4;k++)crystal(a,[-2.35+k*.19,.02,-.1-k*.27],.34+rand()*.24,.10,C.crystal,[0,rand(),.2]);box(a,[1.76,.03,1.06],[.57,.04,.38],C.dark)}
if(d.type==='gas'){const paths=[[[-1.55,-.35],[-1.0,-.8],[.05,-.8],[.05,.48],[1.65,.48]],[[-1.55,.32],[-.72,.32],[-.72,.85],[1.3,.85],[1.3,.48]],[[.05,-.8],[.05,-1.7],[-.25,-1.7]]];d.pipes=paths;for(const p of paths){for(let i=0;i<p.length-1;i++){let p0=p[i],p1=p[i+1];beam(a,[p0[0],.25,p0[1]],[p1[0],.25,p1[1]],.043,C.gas,8);let count=Math.max(1,Math.ceil(Math.hypot(p1[0]-p0[0],p1[1]-p0[1])/.38));for(let k=0;k<=count;k++){let t=k/count,x=mix(p0[0],p1[0],t),z=mix(p0[1],p1[1],t);box(a,[x,.115,z],[.075,.22,.075],C.dark)}sphere(a,[p0[0],.25,p0[1]],[.057,.057,.057],C.roof)}let l=p[p.length-1];sphere(a,[l[0],.25,l[1]],[.057,.057,.057],C.roof)}block(a,[.10,.28,-.9],[.66,.36,.46]);cyl(a,[-.28,.4,-1.68],.13,.6,C.ivory,10);antenna(a,-.28,.7,-1.68,.12);const rocker=[];beam(rocker,[-.54,0,0],[.45,0,0],.057,C.gold,6);box(rocker,[.42,-.04,0],[.20,.22,.095],C.dark);d.rocker=upload(rocker);const pulse=[];sphere(pulse,[0,0,0],[.067,.067,.067],C.teal,1.4);d.pulse=upload(pulse);const rotor=[];cyl(rotor,[0,0,0],.13,.035,C.dark,12,[PI/2,0,0]);for(let k=0;k<4;k++)box(rotor,[0,0,0],[.032,.25,.05],C.ivory,[0,0,k*PI/4]);d.fan=upload(rotor)}
d.previewSource=a.slice();for(let b of d.buildings)append(d.previewSource,b.source,trs([b.x,.045,b.z]));append(dec,a,d.m)}decorGeo=upload(dec)}
function truckModel(){const a=[];box(a,[0,.13,.02],[.28,.10,.53],C.dark);block(a,[0,.25,-.18],[.29,.24,.23],C.metal);box(a,[0,.32,-.304],[.24,.084,.014],C.glass);box(a,[0,.37,-.18],[.33,.035,.25],C.gold);for(let x of [-.15,.15])for(let z of [-.20,.16]){cyl(a,[x,.10,z],.093,.055,C.black,10,[0,0,PI/2]);cyl(a,[x*1.19,.1,z],.047,.007,C.roof,8,[0,0,PI/2])}for(let x of [-.1,.1])box(a,[x,.20,-.315],[.052,.026,.016],C.white,[0,0,0],1.2);return a}
function truckBed(){const a=[];box(a,[0,0,.05],[.3,.033,.35],C.gold);for(let x of [-.153,.153])box(a,[x,.08,.05],[.025,.16,.35],C.metal);box(a,[0,.08,.214],[.32,.16,.025],C.metal);box(a,[0,.08,-.115],[.32,.16,.025],C.gold);return a}
function robotModel(){const a=[];for(let x of [-.13,.13]){box(a,[x,.071,0],[.08,.12,.33],C.dark);for(let z of [-.12,0,.12])cyl(a,[x,.072,z],.052,.082,C.roof,8,[0,0,PI/2])}box(a,[0,.17,0],[.22,.12,.28],C.ivory);box(a,[0,.25,-.075],[.16,.075,.09],C.dark);box(a,[0,.258,-.123],[.11,.033,.015],C.teal,[0,0,0],1.2);box(a,[0,.235,.103],[.19,.022,.14],C.roof);for(let x of [-.105,.105])box(a,[x,.275,.103],[.018,.085,.17],C.purple);antenna(a,.05,.25,.03,.16);return a}
function createActors(){const truckGeo=upload(truckModel()),bedGeo=upload(truckBed()),robotGeo=upload(robotModel());const ores=[],cargo=[];for(let i=0;i<8;i++)append(ores,spheregeo(5,3),trs([((i%3)-1)*.074,.05+Math.floor(i/3)*.023,Math.floor(i/3)*.08-.06],[i*.8,0,i],[.058,.041,.055]),i%2?C.metal:hex('95977e'));for(let i=0;i<3;i++)crystal(cargo,[(i-1)*.045,0,(i%2)*.03],.13+i*.028,.032,C.purple);const oreGeo=upload(ores),cargoGeo=upload(cargo);const drill=[],arm=[];cyl(drill,[0,0,0],.045,.16,C.roof,8,[-PI/2,0,0],0);box(arm,[0,0,0],[.045,.045,.24],C.ivory);let drillGeo=upload(drill),armGeo=upload(arm);
for(let d of districts){if(d.type==='metal')for(let i=0;i<2;i++){let a={kind:'truck',d,i,t:i*.51+.02,geo:truckGeo,bed:bedGeo,cargo:oreGeo,period:24,phase:'',position:[0,0],carrying:0};actors.push(a);d.actors.push(a)}if(d.type==='crystal')for(let i=0;i<2;i++){let a={kind:'robot',d,i,t:i*.45+.08,geo:robotGeo,cargo:cargoGeo,drill:drillGeo,arm:armGeo,period:27,phase:'',position:[0,0],carrying:0};actors.push(a);d.actors.push(a)}}
const sel=[];for(let i=0;i<96;i++){if(i%12>8)continue;let p=i/96*TAU,q=(i+1)/96*TAU;quad(sel,[Math.cos(p)*1.20,.06,Math.sin(p)*1.20],[Math.cos(q)*1.20,.06,Math.sin(q)*1.20],[Math.cos(q)*1.235,.06,Math.sin(q)*1.235],[Math.cos(p)*1.235,.06,Math.sin(p)*1.235],C.teal,1)}selectionGeo=upload(sel);
const grid=[];for(let j=0;j<180;j++){if(j%4===3)continue;let p=j/180*TAU,q=(j+1)/180*TAU;for(const t of [p,q])pushv(grid,[Math.cos(t)*(R+3.4),0,Math.sin(t)*(R+3.4)],[0,1,0],hex('6e9da8'),.4)}gridGeo=upload(grid,gl.LINES)}
// A separate atmosphere pass keeps the surface readable at every longitude.
const avs=`attribute vec3 aPosition;uniform mat4 uVP;uniform mat4 uModel;varying vec3 vP;void main(){vP=(uModel*vec4(aPosition,1.)).xyz;gl_Position=uVP*vec4(vP,1.);}`;
const afs=auroraBiomeAtmosphereShader||`precision highp float;varying vec3 vP;uniform vec3 uEye;void main(){vec3 n=normalize(vP),v=normalize(uEye-vP);float f=pow(1.-abs(dot(n,v)),3.1);gl_FragColor=vec4(.16,.58,.92,f*.44);}`;
const ap=gl.createProgram();gl.attachShader(ap,shader(gl.VERTEX_SHADER,avs));gl.attachShader(ap,shader(gl.FRAGMENT_SHADER,afs));gl.linkProgram(ap);const AU={vp:gl.getUniformLocation(ap,'uVP'),m:gl.getUniformLocation(ap,'uModel'),eye:gl.getUniformLocation(ap,'uEye'),p:gl.getAttribLocation(ap,'aPosition')};let atmosphereGeo;
function drawAtmosphere(){gl.useProgram(ap);gl.bindBuffer(gl.ARRAY_BUFFER,atmosphereGeo.b);gl.enableVertexAttribArray(AU.p);gl.vertexAttribPointer(AU.p,3,gl.FLOAT,false,44,0);gl.uniformMatrix4fv(AU.vp,false,VP);gl.uniformMatrix4fv(AU.m,false,trs([0,0,0],[0,0,0],[R+.49,R+.49,R+.49]));gl.uniform3fv(AU.eye,eye);gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.drawArrays(gl.TRIANGLES,0,atmosphereGeo.count);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);gl.useProgram(program)}
let W=innerWidth,H=innerHeight,DPR=1,FOV=42*PI/180,homeDist=61,VP=ident(),eye=[0,0,58],camRight=[1,0,0],camUp=[0,1,0],camForward=[0,0,-1],viewShift=0;
let camera={yaw:-.12,pitch:.21,dist:61,elevation:0},targetCamera={...camera},selected=null,autoRotate=false,playing=true,showLabels=true,showClouds=true,animTime=0,realTime=0,speed=1,speedIndex=0,zoneListOpen=false,initialized=false,frameNo=0,visibleDistricts=[];
const stateNames={active:'正常生产',unbuilt:'尚未建造',construction:'施工中',upgrade:'升级中',lowpower:'供电不足',full:'仓库已满',paused:'已停产'};
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),2400)}
function drawSpace(){const c=$('#space');c.width=Math.round(W*DPR);c.height=Math.round(H*DPR);const x=c.getContext('2d');x.setTransform(DPR,0,0,DPR,0,0);x.fillStyle='#050b13';x.fillRect(0,0,W,H);let g=x.createRadialGradient(W*.52,H*.45,0,W*.52,H*.45,W*.62);g.addColorStop(0,'#112534');g.addColorStop(.45,'#0c1b28');g.addColorStop(1,'#040912');x.fillStyle=g;x.fillRect(0,0,W,H);let sd=12991;function r(){sd=(Math.imul(sd,1664525)+1013904223)>>>0;return sd/4294967296}for(let i=0;i<1350;i++){const px=r()*W,py=r()*H,sz=r()>.977?1.15:r()*.67+.13,alpha=.10+r()*.54;x.fillStyle=`rgba(174,203,220,${alpha})`;x.beginPath();x.arc(px,py,sz,0,TAU);x.fill();if(sz>1){const gg=x.createRadialGradient(px,py,0,px,py,7);gg.addColorStop(0,'#b5d5dc45');gg.addColorStop(1,'#b5d5dc00');x.fillStyle=gg;x.fillRect(px-7,py-7,14,14)}}}
function resize(){W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,1.7);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);gl.viewport(0,0,canvas.width,canvas.height);homeDist=Math.max(61,R/Math.sin(Math.atan(Math.tan(FOV/2)*W/H*.9))*1.06);if(!initialized){camera.dist=targetCamera.dist=homeDist}targetCamera.dist=clamp(targetCamera.dist,R+3,homeDist*1.8);viewShift=W>760?.105:0;drawSpace();if(W<=760&&!selected)$('#side').classList.add('mobilecollapsed');if(initialized)drawSchematic()}
function updateCamera(dt){
 const shortest=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a)),f=1-Math.exp(-dt*6),dy=shortest(camera.yaw,targetCamera.yaw),dp=targetCamera.pitch-camera.pitch;
 camera.yaw+=dy*f;camera.pitch+=dp*f;
 const safeTarget=(Math.abs(dy)+Math.abs(dp)>.26&&targetCamera.dist<homeDist*.7)?Math.max(camera.dist,homeDist*.82):targetCamera.dist;
 camera.dist=mix(camera.dist,safeTarget,f);camera.elevation=mix(camera.elevation,targetCamera.elevation,f);
 const sy=Math.sin(camera.yaw),cy=Math.cos(camera.yaw),sp=Math.sin(camera.pitch),cp=Math.cos(camera.pitch),n=[sy*cp,sp,cy*cp],east=[cy,0,-sy],north=[-sy*sp,cp,-cy*sp];
 const blend=Math.max(1-smooth(W<=760?42:29,W<=760?65:47,camera.dist),smooth(0,8,camera.elevation)),orbital=smooth(0,2,camera.elevation),lookRadius=(R+PAD)*blend+camera.elevation,lookTarget=mul(n,lookRadius);
 // Keep the eye on the same side of the surface normal at every altitude.
 // Mixing world-up and radial-up made southern sites cross lookAt's pole,
 // instantly reversing both screen axes; changing sides for the dock did too.
 const radialDistance=Math.max(camera.dist,lookRadius+4.5),height=Math.max(0,radialDistance-R);
 eye=add(add(mul(n,radialDistance),mul(north,-height*.85*blend)),mul(east,height*.30*orbital));
 const backward=norm(sub(eye,lookTarget));
 // A longitude-derived east axis remains defined even at either pole. Project
 // it onto the image plane, then derive up without any world-up singularity.
 camRight=norm(sub(east,mul(backward,dot(east,backward))));camUp=norm(cross(backward,camRight));camForward=mul(backward,-1);
 const view=lookAt(eye,lookTarget,camUp);
 document.body.classList.toggle('surface',blend>.25);VP=mm(perspective(FOV,W/H,.1,450,viewShift),view);
}
function focusDistrict(d,close=true){gameNotifySelection(d.buildings[0]);targetCamera.elevation=0;selected=d.buildings[0];targetCamera.yaw=Math.atan2(d.n[0],d.n[2]);targetCamera.pitch=clamp(Math.asin(d.n[1])+(d.type==='crystal'?.18:0),-1.5,1.5);targetCamera.dist=close?(W>760?(d.type==='crystal'?35.5:d.resource?32.5:30):(d.resource?52:43)):homeDist;autoRotate=false;$('#rotate').classList.remove('on');zoneListOpen=false;$('#side').classList.remove('mobilecollapsed');$('#panelbody').style.display='';$('#collapse').textContent='−';if(close&&d.type==='spaceport')setElevatorView('full');updatePanel();updateJumpState()}
function focusBuilding(b,close=true){gameNotifySelection(b);targetCamera.elevation=0;selected=b;const n=b.d.resource?b.d.n:b.n;targetCamera.yaw=Math.atan2(n[0],n[2]);targetCamera.pitch=clamp(Math.asin(n[1])+(b.d.type==='crystal'?.18:0),-1.5,1.5);if(close)targetCamera.dist=W>760?(b.d.type==='crystal'?35.5:b.d.resource?32.5:30):(b.d.resource?52:43);autoRotate=false;$('#rotate').classList.remove('on');zoneListOpen=false;$('#side').classList.remove('mobilecollapsed');$('#panelbody').style.display='';$('#collapse').textContent='−';if(close&&b.type==='spaceport')setElevatorView('full');updatePanel();updateJumpState()}
function setElevatorView(view){targetCamera.elevation=view==='station'?15.12:view==='ground'?0:8;targetCamera.dist=W>760?(view==='station'?41:view==='ground'?30:49):(view==='station'?57:view==='ground'?43:66)}
function focusElevator(view='full'){const b=buildings.find(b=>b.type==='spaceport');if(!b)return;focusBuilding(b);setElevatorView(view)}
function focusEnvironment(){
 const feature=auroraBiome==='mercury'?auroraBiomeEffects.volcanoes[0]?.n:auroraBiomeEffects.focusDirection;
 if(!feature){overview();return;}
 const n=norm(feature);selected=null;targetCamera.yaw=Math.atan2(n[0],n[2]);targetCamera.pitch=clamp(Math.asin(n[1]),-1.5,1.5);targetCamera.elevation=auroraBiome==='mercury'?2.3:0;targetCamera.dist=W>760?(auroraBiome==='mercury'?35.5:32):51;autoRotate=false;updatePanel();updateJumpState();
}
function overviewDirection(){const n=auroraBiome==='mercury'?auroraBiomeEffects.volcanoes[0]?.n:null;return n?{yaw:Math.atan2(n[0],n[2])+.7,pitch:clamp(Math.asin(n[1])-.22,-1.49,1.49)}:{yaw:-.12,pitch:.21};}
function overview(){targetCamera.elevation=0;selected=null;zoneListOpen=false;targetCamera.dist=homeDist;Object.assign(targetCamera,overviewDirection());autoRotate=false;$('#rotate').classList.remove('on');if(W<=760)$('#side').classList.add('mobilecollapsed');updatePanel();updateJumpState()}
function coords(n){const lat=Math.asin(n[1])*180/PI,lon=Math.atan2(n[0],n[2])*180/PI;return `${Math.abs(lat).toFixed(1)}° ${lat>=0?'N':'S'} / ${Math.abs(lon).toFixed(1)}° ${lon>=0?'E':'W'}`}
function updateJumpState(){$$('.jump').forEach(el=>el.classList.toggle('selected',selected?.d.type===el.dataset.jump))}
function setState(b,s){shadowDirty=true;if(b.elevator)updateSpaceElevator(b.elevator,animTime);b.state=s;if(s==='construction')b.progress=.56;if(s==='upgrade')b.progress=.72;updatePanel();toast(`${b.name} · ${stateNames[s]}`)}
function updatePanel(){if(productionMode)return;const p=$('#panelbody');if(zoneListOpen){$('#panelEyebrow').textContent='ALL BUILDING SLOTS';p.innerHTML=`<div class="siteid mono">14 DISTRICTS / 17 FIXED SLOTS</div><h2 class="sitename">全球建设目录</h2><div class="desc">点击任意建筑，镜头会沿球面旋转至所在区域。</div><div class="zoneList">${buildings.map((b,i)=>`<button class="zoneRow" data-building="${i}"><span class="mono">${b.id}</span><span>${b.name}</span><span class="zoneDot" style="background:${b.state==='active'?'#8dceba':'#d4ac75'}" title="${stateNames[b.state]}"></span></button>`).join('')}</div>`;p.querySelectorAll('[data-building]').forEach(btn=>btn.onclick=()=>focusBuilding(buildings[+btn.dataset.building]));return}
if(!selected){$('#panelEyebrow').textContent='PLANET OVERVIEW';p.innerHTML=`<div class="siteid mono">AURORA / SURFACE STUDY</div><h2 class="sitename">全球建设布局</h2><div class="siteen">ONE WORLD. EVERY HEMISPHERE.</div><canvas id="schematic" width="460" height="228"></canvas><div class="fact"><span>球面均匀区位</span><span class="mono">14 / 14</span></div><div class="fact"><span>普通建筑示意</span><span class="mono">17 个固定槽位</span></div><div class="fact"><span>配套采集与仓储</span><span>金属 · 气体 · 晶体</span></div><div class="statuspill"><i></i>所有区位均已生成</div><p class="desc">背面、南半球与高纬地区都有建筑。升级沿用原址，矿场与专属仓库保持邻近。</p><button class="focusbtn" id="allBuildings">查看全部建筑 ↗</button><div class="notebox">独立视觉样板 · 不读写宇宙进度<br>内置模型与地形，可离线运行。</div>`;$('#allBuildings').onclick=()=>{zoneListOpen=true;updatePanel()};drawSchematic();return}
const b=selected,desc={spaceport:'双轨缆索将地面货运基座连接至轨道船坞，两座升降舱错峰运输。飞船在开放式空间站内装配，机械臂沿船体执行焊接作业。',shipyard:'联盟地面设施接收船体分段与物资，经太空电梯送入轨道船坞。飞船的装配工位位于空间站。',shield:'环境控制穹顶调节当地气候，外围阵列用于地表改造。造型沿用样板穹顶结构，固定槽位对应地形改造器。',metal:'两辆矿车沿贴地路线运行：空车驶入开采面，装载矿石，再运回仓库卸货。',gas:'抽气泵往复工作，压缩机持续旋转。脉冲沿架空管道与接头流向储气罐。',crystal:'两台机器人错峰作业，钻头伸至晶簇；晶体放入后部托盘后运回仓库。',metalstore:'与金属矿场成对布置。停用仓库后，下一轮运输改用矿场旁的临时卸料点。',gasstore:'多组储气罐通过有支架的管道连接压缩设施。',crystalstore:'接收机器人运回的晶体。仓满后停止发起新采集循环。'}[b.type]||'沿当地球面法线竖立，基础贴合整地平台。升级和状态切换均保留固定槽位。';
$('#panelEyebrow').textContent='BUILDING INSPECTOR';p.innerHTML=`<div class="siteid mono">${b.d.id} / ${b.type.includes('store')?'PAIRED STORAGE':'FIXED BUILDING SLOT'}</div><h2 class="sitename">${b.name}</h2><div class="siteen">${b.en}</div><canvas id="schematic" width="460" height="228"></canvas><div class="fact"><span>球面位置</span><span class="mono">${coords(b.n)}</span></div><div class="fact"><span>所在建设区</span><span>${b.d.id} · ${b.d.resource?'矿场与仓库配套':'独立设施区'}</span></div><div class="statuspill" style="color:${b.state==='active'?'var(--teal)':'var(--gold)'}"><i></i>${stateNames[b.state]}${b.state==='lowpower'?' · 35% 作业频率':''}</div>${['construction','upgrade'].includes(b.state)?`<div class="progress"><span style="width:${b.progress*100}%"></span></div>`:''}<div class="stategrid">${[['unbuilt','未建'],['construction','施工'],['active','生产'],['upgrade','升级'],['lowpower','缺电'],['full','仓满'],['paused','停产']].map(([s,name])=>`<button data-state="${s}" class="${b.state===s?'active':''}">${name}</button>`).join('')}</div><p class="desc">${desc}</p>${b.d.resource||b.type==='spaceport'?'<div class="phasebox" id="phases">作业动画加载中</div>':''}${b.type==='spaceport'?'<div class="elevatorviews"><button data-elevator-view="ground">地面基座</button><button data-elevator-view="full">完整电梯</button><button data-elevator-view="station">轨道造舰</button></div><div class="iconreference"><img src="reference/flagship-center.png" alt="旗舰中心原始图标"><span>造型参考 · 旗舰中心<br>开放框架 / 中央造舰腔</span></div>':''}<button class="focusbtn" id="focusCurrent">近距离查看 ↗</button><div class="notebox">状态仅控制样板展示，不进行经济结算。<br>空格暂停动画，H 返回全球。</div>`;p.querySelectorAll('[data-state]').forEach(btn=>btn.onclick=()=>setState(b,btn.dataset.state));p.querySelectorAll('[data-elevator-view]').forEach(btn=>btn.onclick=()=>focusElevator(btn.dataset.elevatorView));$('#focusCurrent').onclick=()=>focusBuilding(b);drawSchematic();updatePhases()}
const schematicCache=new Map();
function drawSchematic(){const c=$('#schematic');if(!c)return;const ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);if(selected&&schematicCache.has(selected.id)){ctx.drawImage(schematicCache.get(selected.id),0,0);return}ctx.strokeStyle='#76989d13';ctx.lineWidth=1;for(let i=0;i<w;i+=23){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,h);ctx.stroke()}for(let i=0;i<h;i+=23){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(w,i);ctx.stroke()}if(!selected){ctx.save();ctx.translate(w/2,h/2);ctx.scale(1,.91);ctx.strokeStyle='#9fc5c761';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,94,0,TAU);ctx.stroke();for(let s of [.25,.65]){ctx.beginPath();ctx.ellipse(0,0,94*s,94,-.35,0,TAU);ctx.stroke()}for(let y of [-48,0,48]){ctx.beginPath();ctx.ellipse(0,y,Math.sqrt(94*94-y*y),23,0,0,TAU);ctx.stroke()}for(let d of districts){const px=d.n[0]*91,py=-d.n[1]*91;ctx.fillStyle=d.n[2]>.0?'#c3e7d5':'#487880';ctx.beginPath();ctx.arc(px,py,3,0,TAU);ctx.fill()}ctx.restore();return}
const src=selected.d.resource?selected.d.previewSource:selected.source,tris=[];
 const m=trs([0,0,0],[.68,-.55,0]),nm=normal3(m),scale=selected.d.resource?48:105,center=selected.d.resource?[.48,0,.24]:[0,0,0];
 for(let i=0;i<src.length;i+=33){const aa=pt(m,add(src.slice(i,i+3),center)),bb=pt(m,add(src.slice(i+11,i+14),center)),cc=pt(m,add(src.slice(i+22,i+25),center)),n=nt(nm,src.slice(i+3,i+6));
  tris.push({p:[aa,bb,cc],z:(aa[2]+bb[2]+cc[2])/3,c:src.slice(i+6,i+9),n});}
 tris.sort((a,b)=>a.z-b.z);
 for(let t of tris){ctx.beginPath();t.p.forEach((p,i)=>{const x=w/2+p[0]*scale,y=h*.72-p[1]*scale;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();
 const light=.56+Math.max(0,dot(t.n,norm([-1,2,3])))*.53,color=t.c.map(v=>Math.min(255,Math.round(v*255*light)));
 ctx.fillStyle=`rgb(${color.join(',')})`;ctx.fill();}
 ctx.fillStyle='#a5c4c5';ctx.font='9px monospace';ctx.fillText('DISTRICT '+selected.d.id,12,h-12);ctx.fillText('LOCAL DIORAMA',w-100,h-12);const cached=document.createElement('canvas');cached.width=w;cached.height=h;cached.getContext('2d').drawImage(c,0,0);schematicCache.set(selected.id,cached);
}
const mapBase=document.createElement('canvas');mapBase.width=400;mapBase.height=188;function initMinimap(){const x=mapBase.getContext('2d');x.clearRect(0,0,400,188);x.fillStyle='#6f9b952a';for(let j=0;j<34;j++)for(let i=0;i<72;i++){const lat=(.5-j/33)*PI,lon=(i/71-.5)*TAU,n=[Math.sin(lon)*Math.cos(lat),Math.sin(lat),Math.cos(lon)*Math.cos(lat)];if(terrain(n)>.05)x.fillRect(10+i*5.2,10+j*4.95,4.8,4.5)}x.strokeStyle='#7299a12b';x.lineWidth=1;for(let i=0;i<7;i++){x.beginPath();x.moveTo(10+i*63,8);x.lineTo(10+i*63,179);x.stroke()}for(let j=0;j<5;j++){x.beginPath();x.moveTo(10,8+j*42.5);x.lineTo(389,8+j*42.5);x.stroke()}}
function minimapPos(d){return [10+(Math.atan2(d.n[0],d.n[2])/TAU+.5)*379,8+(.5-Math.asin(d.n[1])/PI)*170]}
function updateMinimap(){const x=$('#minimap').getContext('2d');x.clearRect(0,0,400,188);x.drawImage(mapBase,0,0);for(let d of districts){const p=minimapPos(d),vis=visibleDistricts.includes(d.i),color=d.type==='metal'?'#deb16f':d.type==='gas'?'#8dd0df':d.type==='crystal'?'#c6a4f5':vis?'#aed5c8':'#45636b';x.fillStyle=color;x.beginPath();x.arc(p[0],p[1],selected?.d===d?5:3.2,0,TAU);x.fill();if(selected?.d===d){x.strokeStyle=color;x.beginPath();x.arc(p[0],p[1],9,0,TAU);x.stroke()}}const n=norm(eye),cx=10+(Math.atan2(n[0],n[2])/TAU+.5)*379,cy=8+(.5-Math.asin(n[1])/PI)*170;x.strokeStyle='#d3e9e765';x.lineWidth=1;x.beginPath();x.arc(cx,cy,11,0,TAU);x.moveTo(cx-16,cy);x.lineTo(cx-9,cy);x.moveTo(cx+9,cy);x.lineTo(cx+16,cy);x.moveTo(cx,cy-16);x.lineTo(cx,cy-9);x.moveTo(cx,cy+9);x.lineTo(cx,cy+16);x.stroke();$('#visibleCount').textContent=`${String(visibleDistricts.length).padStart(2,'0')} / 14`;$('#coordinates').textContent=coords(n)}
function makeLabels(){for(let d of districts){const b=document.createElement('button');b.className='label';b.style.setProperty('--accent',d.type==='metal'?'#e2b475':d.type==='gas'?'#8dc5d7':d.type==='crystal'?'#c6a6ea':'#add7ca');b.innerHTML=`<span class="ldot"></span><span>${d.name}</span><span class="lnum">${d.id}</span><span class="lstate"></span>`;b.onclick=()=>focusDistrict(d);$('#labels').appendChild(b);d.label=b}}
function updateLabels(){if(detailOnly)return;visibleDistricts=[];for(let d of districts){const visible=dot(d.n,eye)>R+PAD+.12;if(visible)visibleDistricts.push(d.i);const p=proj(VP,mul(d.n,R+(d.type==='spaceport'&&camera.elevation>1?18:d.resource?1.8:4.0))),x=(p[0]+1)*W/2,y=(1-p[1])*H/2;let ok=showLabels&&visible&&p[3]>0&&x>32&&x<W-32&&y>101&&y<H-100;if(!productionMode&&W>760&&x>W-300&&y<720)ok=false;d.label.style.display=ok?'flex':'none';if(ok){d.label.style.left=x+'px';d.label.style.top=y+'px';d.label.classList.toggle('selected',selected?.d===d);d.label.querySelector('.lstate').textContent=['construction','unbuilt','lowpower','full','paused'].includes(d.buildings[0].state)?{construction:'施工',unbuilt:'未建',lowpower:'缺电',full:'仓满',paused:'停产'}[d.buildings[0].state]:''}}}
function canProduce(d){const b=d.buildings[0],storage=d.buildings[1];return d.enabled!==false&&['active','lowpower','upgrade'].includes(b.state)&&storage?.state!=='full'&&(b.operationRate??1)>0}
function updateRotors(dt){for(const r of rotors){const state=r.b.state;r.active=r.kind==='bucket'?canProduce(r.b.d):['active','lowpower','upgrade'].includes(state);r.clock??=0;r.rate=r.active?productionRate(r.b):0;if(playing)r.clock+=Math.max(0,dt)*speed*r.rate;}}
function actorFrame(d,x,z,yaw){const p=localPoint(d,x,z,.024),up=norm(p),fLocal=[-Math.sin(yaw),0,-Math.cos(yaw)],fw=norm(sub(pt(d.m,fLocal),pt(d.m,[0,0,0]))),zaxis=norm(mul(sub(fw,mul(up,dot(fw,up))),-1)),xaxis=norm(cross(up,zaxis));return [...mul(xaxis,SITE),0,...mul(up,SITE),0,...mul(zaxis,SITE),0,...p,1]}
function updateActorPose(a,pos,headingTarget,dt){if(a.heading===undefined)a.heading=headingTarget;else if(playing)a.heading+=Math.atan2(Math.sin(headingTarget-a.heading),Math.cos(headingTarget-a.heading))*Math.min(1,dt*7*speed);a.position=pos;a.matrix=actorFrame(a.d,...pos,a.heading)}
function updateActors(dt){for(const a of actors){const b=a.d.buildings[0],store=a.d.buildings[1];a.hidden=a.d.enabled===false||['unbuilt','construction'].includes(b.state);if(a.hidden){a.phase='等待矿场建成';continue}const efficiency=productionRate(b),desiredStorage=!['unbuilt','construction'].includes(store.state),unloadStart=a.kind==='truck'?.87:.91;a.storageAvailable??=desiredStorage;
// Finish the existing approach, then drive a continuous connector to the new
// unloading apron. Switching warehouse availability never swaps path origins.
if((a.relocation&&a.relocation.storage!==desiredStorage)||(!a.relocation&&desiredStorage!==a.storageAvailable&&(a.t>=unloadStart||a.t===0))){const to=desiredStorage?(a.kind==='truck'?outTruck[0]:robotPaths[a.i][0]):a.kind==='truck'?[-.05,1.84]:[.22,1.83],from=a.position.slice();a.relocation={from,to,storage:desiredStorage,elapsed:0,duration:Math.max(.6,Math.hypot(to[0]-from[0],to[1]-from[1])*SITE/1.2),carrying:a.carrying||0,unload:a.unload||0,resume:a.t===0?0:unloadStart};}
if(a.relocation){const move=a.relocation;if(playing&&(canProduce(a.d)||a.t>0))move.elapsed+=dt*speed*efficiency;const progress=clamp(move.elapsed/move.duration,0,1),p=move.from.map((x,i)=>mix(x,move.to[i],smooth(0,1,progress))),heading=Math.atan2(move.from[0]-move.to[0],move.from[1]-move.to[1]);a.phase=move.storage?'转运至仓库卸料点':'转运至临时卸料点';a.carrying=move.carrying;a.drilling=0;a.unload=move.unload*(1-smooth(0,.25,progress));a.waitingFull=false;updateActorPose(a,p,heading,dt);if(progress===1){a.storageAvailable=move.storage;a.t=move.resume;a.unloadCargo=move.carrying;a.relocation=null;}continue;}
const blockedFull=b.state==='full'||store?.state==='full';a.waitingFull=blockedFull&&a.t>=(a.kind==='truck'?.895:.935);if(!a.waitingFull&&(canProduce(a.d)||a.t>0)&&playing){a.t+=dt*speed/a.period*efficiency;if(a.t>=1){a.t=canProduce(a.d)?a.t%1:0;a.unloadCargo=1;}}if(a.t<unloadStart)a.unloadCargo=1;const u=a.t;let pos,headingTarget=a.heading||0,carrying=0,drilling=0,unload=0,path,t;
if(a.kind==='truck'){let outgoing=outTruck,returning=backTruck;if(!a.storageAvailable){outgoing=[[-.05,1.84],[.35,1.68],[.15,1.46],[-1.08,1.36],[-1.55,.70]];returning=[[-1.55,.70],[-.9,.76],[-.12,1.0],[.28,1.54],[-.05,1.84]]}if(u<.36){path=outgoing;t=u/.36;a.phase=canProduce(a.d)||u>0?'空车驶向矿山':'停在卸料点';}else if(u<.51){path=outgoing;t=1;carrying=smooth(.36,.49,u);a.phase='矿山装载';}else if(u<.87){path=returning;t=(u-.51)/.36;carrying=1;a.phase='满载运回仓库';}else{path=returning;t=1;unload=smooth(.88,.94,u);carrying=(a.unloadCargo??1)*(1-smooth(.9,.99,u));a.phase=a.waitingFull?'仓满 · 等待卸货':a.storageAvailable?'仓库卸货':'临时卸料点卸货';}}
else{let outgoing=robotPaths[a.i];if(!a.storageAvailable)outgoing=[[.22,1.83],...outgoing.slice(1)];if(u<.27){path=outgoing;t=u/.27;a.phase=canProduce(a.d)||u>0?'驶向晶簇':'停在卸料点';}else if(u<.58){path=outgoing;t=1;drilling=smooth(.27,.31,u);carrying=smooth(.45,.57,u);a.phase='钻头接触晶簇 · 采集';headingTarget=0;}else if(u<.65){path=outgoing;t=1;drilling=1-smooth(.58,.64,u);carrying=1;a.phase='收起钻头 · 装载';headingTarget=0;}else if(u<.91){path=outgoing;t=1-(u-.65)/.26;carrying=1;a.phase='携带晶体返回';}else{path=outgoing;t=0;carrying=(a.unloadCargo??1)*(1-smooth(.93,.995,u));a.phase=a.waitingFull?'仓满 · 等待卸货':a.storageAvailable?'卸下晶体':'临时卸料点卸货';}}
pos=samplePath(path,t);if((a.kind==='truck'&&(u<.36||u>=.51&&u<.87))||(a.kind==='robot'&&(u<.27||u>=.65&&u<.91))){const returning=a.kind==='robot'&&u>=.65,p0=samplePath(path,clamp(t-.008,0,1)),p1=samplePath(path,clamp(t+.008,0,1));let dx=p1[0]-p0[0],dz=p1[1]-p0[1];if(returning){dx=-dx;dz=-dz}headingTarget=Math.atan2(-dx,-dz)}
a.carrying=carrying;a.drilling=drilling;a.unload=unload;updateActorPose(a,pos,headingTarget,dt)}}
function renderActors(){for(let a of actors){if(a.hidden||!a.matrix)continue;draw(a.geo,a.matrix);if(a.kind==='truck'){const bedm=mm(a.matrix,trs([0,.225,.05],[-a.unload*.53,0,0]));draw(a.bed,bedm);if(a.carrying>.015)draw(a.cargo,mm(bedm,trs([0,.065,.02],[0,0,0],[1,a.carrying,1])))}else{draw(a.arm,mm(a.matrix,trs([0,.255,-.13-a.drilling*.035],[a.drilling*.22,0,0])));draw(a.drill,mm(a.matrix,trs([0,.235,-.17-a.drilling*.19],[0,0,a.drilling>0?animTime*21:0])));if(a.carrying>.015)draw(a.cargo,mm(a.matrix,trs([0,.25,.10],[0,0,0],[1,a.carrying,1])))}}}
function updatePhases(){const el=$('#phases');if(!el||!selected)return;const d=selected.d;if(!playing){el.innerHTML='<span class="mono">Ⅱ PAUSED</span><br>采集与运输动画已暂停';return}if(d.type==='spaceport'){const active=['active','upgrade','lowpower'].includes(selected.state);el.innerHTML=`<span class="mono">${active?'SURFACE → ORBIT / SHIP ASSEMBLY':'ELEVATOR STANDBY'}</span><br>${active?(selected.state==='lowpower'?'供电不足 · 升降与焊接降速':'双舱往返运送物资 · 空间站机械臂装配'):'升降舱与造舰工位停止作业'}`;return}if(d.type==='gas'){const b=d.buildings[0],active=canProduce(d);el.innerHTML=`<span class="mono">${active?'FLOW → STORAGE':'FLOW STOPPED'}</span><br>${active?(b.state==='lowpower'?'低频抽气 · 压缩机低速运行':'气井抽取 → 压缩处理 → 储气罐'):'泵体停止 · 管道流向提示关闭'}`;return}el.innerHTML=d.actors.map(a=>`<span class="mono">${a.kind==='truck'?'TRUCK':'ROBOT'} 0${a.i+1}</span> &nbsp;${a.phase}`).join('<br>')}
let shadowDirty=true,lastShadowLight=[0,0,0],cachedLightVP=ident();
let worldDetail=null;
function render(){
 if(!worldDetail&&auroraNavigationRender(realTime))return;
 const sun=worldDetail?.light||norm(add(add(mul(camRight,-1.45),mul(camUp,2.0)),mul(norm(eye),2.4))),lightVP=mm(ortho(36,.1,120),lookAt(mul(sun,58),[0,0,0],[0,1,0]));
 const refreshShadow=shadowsReady&&(shadowDirty||len(sub(sun,lastShadowLight))>.018||frameNo%30===0);if(refreshShadow){cachedLightVP=lightVP;lastShadowLight=sun.slice();shadowDirty=false;}
 for(let pass=refreshShadow?0:1;pass<2;pass++){const shadow=pass===0;
 gl.useProgram(program);gl.bindFramebuffer(gl.FRAMEBUFFER,shadow?shadowFBO:null);gl.viewport(0,0,shadow?SHADOW_SIZE:canvas.width,shadow?SHADOW_SIZE:canvas.height);
 gl.clearColor(shadow?1:0,shadow?1:0,shadow?1:0,shadow?1:0);gl.depthMask(true);if(shadow||!worldDetail)gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 if(!shadow&&!worldDetail)SpaceSky.create(gl).draw({forward:camForward,up:camUp,fov:FOV,aspect:W/H,shift:[viewShift,0],exposure:.9});
 if(shadow)gl.disable(gl.BLEND);else gl.enable(gl.BLEND);
 gl.uniformMatrix4fv(U.uVP,false,shadow?lightVP:VP);gl.uniformMatrix4fv(U.uLightVP,false,cachedLightVP);gl.uniform3fv(U.uEye,eye);gl.uniform3fv(U.uLight,sun);gl.uniform1f(U.uTime,animTime);gl.uniform1f(U.uShadowPass,shadow?1:0);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,shadow?null:shadowTexture);gl.uniform1i(U.uShadowMap,0);
draw(terrainGeo);draw(oceanGeo);if(!worldDetail||worldDetail.buildings)draw(decorGeo);else draw(naturalGeo);auroraBiomeDraw(animTime,shadow);if(!shadow)draw(gridGeo,trs([0,0,0],[.09,.0,-.15]),.10);
if(!worldDetail||worldDetail.buildings){
for(let b of buildings){const s=b.state;if(s==='unbuilt'){continue;}else if(s==='construction'){draw(b.geo,b.m,1,0,b.height*b.progress);draw(b.scaf,b.m,1)}else{draw(b.geo,b.m,1,['paused','full','lowpower'].includes(s)?1:0);if(s==='upgrade')draw(b.scaf,b.m,.67)}}
for(let r of rotors){if(['unbuilt','construction'].includes(r.b.state)||auroraBiome==='moon')continue;const act=r.active,t=r.clock||0;if(r.kind==='bucket')draw(r.geo,mm(r.b.m,trs([-.35,.92,-1.35],[t*.8,0,0])),1,act?0:1);else draw(r.geo,mm(r.b.m,mm(trs([0,.95,0],[0,t*.12,0]),trs([0,0,0],[.57,0,0]))),1,act?0:1);}
for(let d of districts){if(auroraBiome==='moon'||d.type!=='gas'||['unbuilt','construction'].includes(d.buildings[0].state))continue;d.gasClock??=0;const b=d.buildings[0];draw(d.rocker,mm(b.m,trs([0,1.08,0],[0,0,Math.sin(d.gasClock*2.4)*.18])));draw(d.fan,mm(d.m,trs([.10,.38,-.651],[0,0,d.gasClock*6])));if(canProduce(d)){for(let path of d.pipes)for(let i=0;i<3;i++){let k=((d.gasClock*.18+i/3)%1)*(path.length-1),ix=Math.min(path.length-2,Math.floor(k)),t=k-ix,p=vlerp([...path[ix],0],[...path[ix+1],0],t);draw(d.pulse,mm(d.m,trs([p[0],.25,p[1]])))}}}
for(const e of elevators)drawSpaceElevator(e,animTime,shadow);renderActors();if(selected&&!shadow){gl.depthMask(false);draw(selectionGeo,selected.m,.7+.2*Math.sin(realTime*2));gl.depthMask(true)}}if(showClouds&&!shadow&&auroraBiome!=='moon'){gl.depthMask(false);draw(cloudGeo,ident(),.54);gl.depthMask(true)}if(!shadow&&auroraBiome!=='moon')drawAtmosphere();}
gl.bindFramebuffer(gl.FRAMEBUFFER,null);}
let last=0,rafId=0,disposed=false;function loop(now){if(productionMode&&!detailOnly){if(disposed)return;const dt=last?Math.min((now-last)/1000,.05):.016;last=now;if(gameActive&&!document.hidden&&auroraNavigation.enabled){realTime=now/1000;auroraNavigationUpdate(dt);auroraNavigationRender(realTime);}rafId=requestAnimationFrame(loop);return;}if(disposed||window.__AURORA_TEST_FREEZE)return;if(!gameActive||document.hidden){last=0;rafId=requestAnimationFrame(loop);return;}try{updateGameProgress();const dt=last?Math.max(0,Math.min((now-last)/1000,.05)):.016;last=now;realTime=now/1000;if(auroraNavigationUpdate(dt)){$('#labels').style.visibility='hidden';render();frameNo++;rafId=requestAnimationFrame(loop);return;}$('#labels').style.visibility='';if(playing){animTime+=dt*speed;for(let d of districts)if(d.type==='gas'&&canProduce(d))d.gasClock=(d.gasClock||0)+dt*speed*productionRate(d.buildings[0])}if(autoRotate)targetCamera.yaw+=dt*.065;updateCamera(dt);updateRotors(dt);updateActors(dt);render();if(frameNo%2===0)updateLabels();if(frameNo%6===0)updateMinimap();if(frameNo%12===0)updatePhases();frameNo++;rafId=requestAnimationFrame(loop)}catch(e){showError(e)}}
function showError(e){console.error(e);if($('#loading'))$('#loading').style.display='none';const el=$('#error');el.style.display='block';el.innerHTML='<h2>三维场景未能完成绘制</h2><p>请使用启用硬件加速的 Chrome 或 Edge 打开此文件。</p><pre style="white-space:pre-wrap;font-size:12px"></pre>';el.querySelector('pre').textContent=String(e.stack||e)}
function pick(x,y){const nx=x/W*2-1+viewShift,ny=1-y/H*2,tf=Math.tan(FOV/2),dir=norm(add(add(mul(camRight,nx*tf*W/H),mul(camUp,ny*tf)),camForward));let best=null,nearest=Infinity,station=false;
 const od=dot(eye,dir),planetDisc=od*od-(dot(eye,eye)-R*R),planetHit=planetDisc>=0?-od-Math.sqrt(planetDisc):Infinity;
 function hit(b,center,radius,isStation=false){const oc=sub(eye,center),dd=dot(oc,dir),disc=dd*dd-(dot(oc,oc)-radius*radius);if(disc<0)return;const t=-dd-Math.sqrt(disc);if(t>0&&t<nearest&&t<planetHit){nearest=t;best=b;station=isStation}}
 for(const b of buildings){if(dot(b.n,sub(eye,b.pos))>0)hit(b,add(b.pos,mul(b.n,.65*b.scale)),b.radius);if(b.elevator)hit(b,b.elevator.stationCenterWorld,2.2*b.scale,true)}return {building:best,dir,station}}
function zoomBy(delta){if(auroraNavigationWheel(delta))return;targetCamera.dist=clamp(targetCamera.dist*Math.exp(clamp(delta,-180,180)*.0013),R+3,homeDist*1.8);}
function initControls(){if(productionMode&&!detailOnly){auroraNavigationControls();window.addEventListener('resize',resize);return;}const pointers=new Map();let drag=null,pinch=null,moved=false;
canvas.addEventListener('pointerdown',e=>{canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);drag={x:e.clientX,y:e.clientY,startx:e.clientX,starty:e.clientY};moved=false;autoRotate=false;$('#rotate').classList.remove('on');canvas.classList.add('dragging');if(pointers.size===2){const p=Array.from(pointers.values());pinch={len:Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]),dist:targetCamera.dist};moved=true}});
canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2&&pinch){const p=Array.from(pointers.values()),dd=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);zoomBy(Math.log(pinch.len/Math.max(dd,1))/.0013);pinch.len=dd;pinch.dist=targetCamera.dist;moved=true;return}if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y,f=clamp((camera.dist-R)/35,.17,1.0);if(!auroraNavigationDrag(dx,dy)){targetCamera.yaw-=dx/W*TAU*.95*f;targetCamera.pitch=clamp(targetCamera.pitch+dy/H*PI*.86*f,-PI/2+.025,PI/2-.025);}if(Math.hypot(e.clientX-drag.startx,e.clientY-drag.starty)>5)moved=true;drag.x=e.clientX;drag.y=e.clientY});
function end(e){const wasMoved=moved;pointers.delete(e.pointerId);if(!pointers.size){canvas.classList.remove('dragging');if(!wasMoved&&drag&&!auroraNavigationClick(e.clientX,e.clientY)){const hit=pick(e.clientX,e.clientY);if(hit.building){if(hit.station)focusElevator('station');else focusBuilding(hit.building)}}drag=null;pinch=null}else{const p=Array.from(pointers.values())[0];drag={x:p[0],y:p[1],startx:p[0],starty:p[1]};pinch=null;moved=true}}
canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',e=>{moved=true;end(e)});canvas.addEventListener('wheel',e=>{e.preventDefault();zoomBy(e.deltaY)},{passive:false});canvas.addEventListener('dblclick',e=>{if(auroraNavigationClick(e.clientX,e.clientY,true))return;const p=pick(e.clientX,e.clientY);if(p.building){if(p.station)focusElevator('station');else focusBuilding(p.building);return}const od=dot(eye,p.dir),disc=od*od-(dot(eye,eye)-R*R);if(disc<0)return;const n=norm(add(eye,mul(p.dir,-od-Math.sqrt(disc))));targetCamera.yaw=Math.atan2(n[0],n[2]);targetCamera.pitch=Math.asin(n[1]);targetCamera.elevation=0;targetCamera.dist=32.5});
$('#home').onclick=overview;$('#zoomIn').onclick=()=>targetCamera.dist=clamp(targetCamera.dist*.82,R+3,homeDist*1.8);$('#zoomOut').onclick=()=>targetCamera.dist=clamp(targetCamera.dist*1.22,R+3,homeDist*1.8);$('#backside').onclick=()=>{targetCamera.elevation=0;targetCamera.yaw+=PI;targetCamera.pitch=-targetCamera.pitch*.65;targetCamera.dist=homeDist;toast('旋转至另一半球')};$('#south').onclick=()=>{targetCamera.elevation=0;targetCamera.pitch=-1.46;targetCamera.dist=homeDist;toast('南极视角 · 可继续拖动')};$('#labelsToggle').onclick=()=>{showLabels=!showLabels;$('#labelsToggle').classList.toggle('on',showLabels)};$('#rotate').onclick=()=>{autoRotate=!autoRotate;$('#rotate').classList.toggle('on',autoRotate)};$('#clouds').onclick=()=>{showClouds=!showClouds;$('#clouds').classList.toggle('on',showClouds)};$('#play').onclick=()=>{playing=!playing;$('#play').classList.toggle('on',playing);$('#play').innerHTML=playing?'<svg viewBox="0 0 24 24" fill="none"><path d="M8 5v14M16 5v14" stroke="currentColor" stroke-width="3"/></svg>':'<svg viewBox="0 0 24 24" fill="none"><path d="m7 4 13 8-13 8V4Z" stroke="currentColor"/></svg>';updatePhases()};$('#speed').onclick=()=>{const speeds=[1,.35,2];speedIndex=(speedIndex+1)%3;speed=speeds[speedIndex];$('#speed').textContent=speed===.35?'0.35×':speed.toFixed(1)+'×';toast(speed===.35?'慢放 · 0.35 倍速':`${speed} 倍动画速度`)};
$$('.jump').forEach(b=>b.onclick=()=>focusDistrict(districts.find(d=>d.type===b.dataset.jump)));$('#listToggle').onclick=()=>{zoneListOpen=!zoneListOpen;$('#side').classList.remove('mobilecollapsed');$('#panelbody').style.display='';$('#collapse').textContent='−';updatePanel()};$('#collapse').onclick=()=>{if(W<=760){$('#side').classList.toggle('mobilecollapsed');$('#collapse').textContent=$('#side').classList.contains('mobilecollapsed')?'+':'−'}else{const hide=$('#panelbody').style.display!=='none';$('#panelbody').style.display=hide?'none':'';$('#collapse').textContent=hide?'+':'−'}};
$('#minimap').onclick=e=>{const rect=e.currentTarget.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*400,y=(e.clientY-rect.top)/rect.height*188;let best=null,dd=Infinity;for(let d of districts){const p=minimapPos(d),dist=Math.hypot(x-p[0],y-p[1]);if(dist<dd){dd=dist;best=d}}if(best)focusDistrict(best,false)};$('#help').onclick=()=>$('#helpOverlay').classList.add('open');$('#closeHelp').onclick=()=>$('#helpOverlay').classList.remove('open');$('#helpOverlay').onclick=e=>{if(e.target===e.currentTarget)e.currentTarget.classList.remove('open')};
$('#capture').onclick=()=>{render();const c=document.createElement('canvas');c.width=canvas.width;c.height=canvas.height;const x=c.getContext('2d');x.drawImage($('#space'),0,0);x.drawImage(canvas,0,0);x.scale(DPR,DPR);x.fillStyle='#d8ece5';x.font='24px Segoe UI,sans-serif';x.fillText('A U R O R A',32,50);x.font='11px monospace';x.fillStyle='#9eb9ba';x.fillText('14 DISTRICTS / 17 FIXED BUILDINGS',34,76);x.fillText(coords(norm(eye)),34,H-30);const a=document.createElement('a');a.download='AURORA_'+(selected?.d.id||'GLOBAL')+'.png';a.href=c.toDataURL('image/png');a.click();toast('已保存当前星球截图')};
window.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;if(e.code==='Space'){e.preventDefault();$('#play').click()}else if(e.key.toLowerCase()==='h')overview();else if(e.key.toLowerCase()==='l')$('#labelsToggle').click();else if(e.key.toLowerCase()==='r')$('#rotate').click();else if(e.key==='Escape'){$('#helpOverlay').classList.remove('open');overview()}else if(e.key==='ArrowLeft')targetCamera.yaw-=.2;else if(e.key==='ArrowRight')targetCamera.yaw+=.2;else if(e.key==='ArrowUp')targetCamera.pitch=clamp(targetCamera.pitch+.15,-1.53,1.53);else if(e.key==='ArrowDown')targetCamera.pitch=clamp(targetCamera.pitch-.15,-1.53,1.53)});window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{last=0});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();toast('图形上下文暂时丢失，请刷新页面重新加载')})}
/*__AURORA_GAME-BRIDGE__*/
/*__AURORA_CELESTIAL__*/
/*__AURORA_DECORATIONS__*/
/*__AURORA_TERRITORY__*/
/*__AURORA_STRATEGY__*/
/*__AURORA_GARGANTUA__*/
/*__AURORA_NPCS__*/
/*__AURORA_BATTLES__*/
/*__AURORA_LOGISTICS__*/
/*__AURORA_GALAXY__*/
/*__AURORA_NAVIGATION__*/
/*__AURORA_DETAIL_CLIENT__*/
/*__AURORA_LOD__*/
// Small read-only diagnostic surface for acceptance tests. No persistent storage. The underscored helpers are for local acceptance tests.
const runtimeAPI={version:'5.0.0',getWebGLError:()=>gl.getError(),layoutVersion:3,get ready(){return initialized;},biome:auroraBiome,production:productionMode,applyPlanet:(p,c,now)=>{if(productionMode&&!detailOnly){gamePlanet=p;gameCatalog=c;gameNowOffset=now-Date.now();}else applyGamePlanet(p,c,now);},setActive:setGameActive,setViewport:setGameViewport,selectBuilding:id=>productionMode&&!detailOnly?auroraNavigationFocusBuilding(id):selectGameBuilding(id),prepareDetailEntry:()=>auroraNavigationPrepareDetailEntry(()=>{overview();Object.assign(camera,targetCamera);updateCamera(0);updateRotors(0);updateActors(0);render();}),setNavigationState:auroraNavigationSetState,setMapBattle:auroraBattleSet,focusMapBattle:auroraBattleFocus,setMapVessel:auroraMapVessel,get navigationState(){return {combatCamera:auroraNavigation.combatCamera,missionFollow:auroraNavigation.missionFollow};},setMapBridgeInstruments:(id,state)=>{const b=auroraMapBattles.get(id);if(b)b.bridgeInstruments=state;},pickMapBridgeConsole:(x,y)=>auroraNavigation.combatCamera?.mode==='bridge'?auroraNavigation.resources?.battles.pickBridgeConsole(x,y):null,getMapBridgeConsole:()=>auroraNavigation.combatCamera?.mode==='bridge'?auroraNavigation.resources?.battles.bridgeConsoleLayout():[],setMapFighterInstruments:(id,state)=>{const b=auroraMapBattles.get(id);if(b)b.fighterInstruments=state;},pickMapFighterConsole:(x,y)=>auroraNavigation.combatCamera?.mode==='bridge'?auroraNavigation.resources?.battles.pickFighterConsole(x,y):null,getMapFighterConsole:()=>auroraNavigation.combatCamera?.mode==='bridge'?auroraNavigation.resources?.battles.fighterConsoleLayout():[],setMapPilotPose:(id,row)=>{const b=auroraMapBattles.get(id);if(b)b.pilotRow=row;},setMapPilot:value=>auroraNavigation.pilotActive=value,setMapTarget:(target,locked)=>{const view=auroraNavigation.combatCamera;if(view){view.target=target;view.locked=locked;}},setMapCabin:pose=>{if(auroraNavigation.combatCamera)auroraNavigation.combatCamera.pose=pose?JSON.parse(JSON.stringify(pose)):null;},prepareMapFleet:()=>auroraNavigationInit().battles.ready,focusMapMission:auroraMissionFocus,exitMapFleet:auroraFleetExit,zoomNavigation:delta=>auroraNavigationWheel(delta),toggleNavigationPan:()=>auroraNavigation.panMode=!auroraNavigation.panMode,selectNavigationSystem:id=>{const n=auroraNavigation,s=n.systems.find(s=>s.id===Number(id));if(!s)return false;n.system=[1,s.id];n.zoomTarget={type:"system",id:s.id};n.goal.center=s.position.slice();n.flight=true;auroraNavigationEmit("system");return true;},toGalaxy:auroraNavigationToGalaxy,toBlackHole:auroraNavigationToBlackHole,locateColony:auroraNavigationLocate,fitColonies:auroraNavigationFitColonies,toggleTerritories:()=>auroraNavigation.territoriesVisible=auroraNavigation.territoriesVisible===false,focusSystem:auroraNavigationFocusSystem,focusLogistics:auroraNavigationFocusLogistics,toSystem:auroraNavigationToSystem,toPlanet:auroraNavigationToPlanet,selectNavigationPlanet:auroraNavigationSelect,dispose:()=>{auroraNavigationDispose();disposed=true;cancelAnimationFrame(rafId);gl.getExtension('WEBGL_lose_context')?.loseContext();},get snapshot(){return {navigation:auroraNavigationSnapshot(),view:{eye:[...eye],right:[...camRight],up:[...camUp],forward:[...camForward]},biome:auroraBiome,biomeEffects:auroraBiomeEffects.stats,features:{volcanoes:auroraBiomeEffects.volcanoes.map(v=>({direction:v.n,height:v.height,radius:v.radius})),focusDirection:auroraBiomeEffects.focusDirection},districts:districts.map(d=>({id:d.id,type:d.type,gasClock:d.gasClock||0,direction:[...d.n],buildings:d.buildings.map(b=>({id:b.id,gameId:b.gameId,level:b.level,type:b.type,state:b.state,progress:b.progress,operationRate:b.operationRate,position:[...b.pos],normal:[...b.n]}))})),camera:{...camera},targetCamera:{...targetCamera},visible:[...visibleDistricts],selected:selected?.id||null,playing,animTime,frameNo,bufferCount,elevator:elevators[0]?.snapshot()||null,vertices:(terrainGeo?.count||0)+(oceanGeo?.count||0)+(decorGeo?.count||0),actors:actors.map(a=>({id:a.d.id+'-'+a.kind+'-'+a.i,district:a.d.type,kind:a.kind,t:a.t,heading:a.heading,drilling:a.drilling,unload:a.unload,storageAvailable:a.storageAvailable,phase:a.phase,position:[...a.position],carrying:a.carrying,hidden:a.hidden||false}))}},focusElevator:view=>productionMode&&!detailOnly?auroraNavigationFocusBuilding('Shipyard',view):focusElevator(view),focusEnvironment:()=>productionMode&&!detailOnly?auroraNavigationToPlanet():focusEnvironment(),terrainAt:n=>terrain(norm(n)),coastAt:n=>auroraCoastDistance(norm(n)),focus:id=>{const d=districts.find(d=>d.id===id||d.type===id);if(d)focusDistrict(d)},home:()=>productionMode&&!detailOnly?auroraNavigationToPlanet(auroraNavigation.activePlanetId,{orbit:true}):overview(),_settleView:()=>{Object.assign(camera,targetCamera);updateCamera(0);updateRotors(0);updateActors(0);render();updateLabels();updateMinimap()},_advance:(seconds,redraw=true)=>{for(let remaining=Math.max(0,seconds);remaining>1e-9;){const dt=Math.min(.05,remaining);remaining-=dt;if(auroraNavigationUpdate(dt))continue;if(playing){animTime+=dt*speed;for(let d of districts)if(d.type==='gas'&&canProduce(d))d.gasClock=(d.gasClock||0)+dt*speed*productionRate(d.buildings[0]);}updateRotors(dt);updateActors(dt);for(const e of elevators)updateSpaceElevator(e,animTime)}shadowDirty=true;if(redraw)render();updatePhases()},setState:(id,state)=>{const b=buildings.find(b=>b.id===id);if(b&&state in stateNames)setState(b,state)}};

// Detail resources share the world context. They own no canvas, camera controller,
// DOM events or animation loop, and never clear the world's color/depth buffers.
const bodyAnimation=new Map();let initialActors=null,initialRotors=null;
runtimeAPI.drawWorld=(view,planet,catalog)=>{
 if(!initialized)return false;
 W=view.width;H=view.height;VP=view.vp;eye=view.eye;camRight=view.right;camUp=view.up;camForward=view.forward;
 realTime=view.time;animTime=view.time;frameNo++;worldDetail=view;
 if(view.buildings&&planet&&catalog){
  initialActors??=actors.map(a=>({...a}));initialRotors??=rotors.map(r=>({...r}));
  const state=bodyAnimation.get(view.bodyKey);actors.forEach((a,i)=>Object.assign(a,state?.actors[i]||initialActors[i]));rotors.forEach((r,i)=>Object.assign(r,state?.rotors[i]||initialRotors[i]));
  applyGamePlanet(planet,catalog,view.now);updateRotors(view.dt);updateActors(view.dt);}
 try{render();if(view.buildings){bodyAnimation.set(view.bodyKey,{actors:actors.map(a=>({...a})),rotors:rotors.map(r=>({...r}))});while(bodyAnimation.size>16)bodyAnimation.delete(bodyAnimation.keys().next().value);}}finally{worldDetail=null;}
 return true;
};
runtimeAPI.pickBuilding=(x,y)=>pick(x,y);
runtimeAPI.buildingTarget=id=>{const b=buildings.find(b=>gameBuildingIds[b.type]===id&&!b.type.endsWith('store'));return b?{normal:b.n,position:b.pos,station:b.elevator?.stationCenterWorld}:null;};
runtimeAPI.release=()=>{disposed=true;for(const b of resourceBuffers)gl.deleteBuffer(b);for(const s of resourceShaders)gl.deleteShader(s);gl.deleteProgram(program);gl.deleteProgram(ap);gl.deleteTexture(shadowTexture);gl.deleteFramebuffer(shadowFBO);gl.deleteRenderbuffer(shadowDepth);resourceBuffers.length=0;bufferCount=0;};
if(detailOnly){
 if(options.onProxy){const proxy=[],rows=[];for(let j=0;j<=48;j++){const row=[];for(let i=0;i<=96;i++){const ph=j/48*PI,th=i/96*TAU,n=[Math.sin(ph)*Math.cos(th),Math.cos(ph),Math.sin(ph)*Math.sin(th)],h=auroraBiome==='gas'?-1.65:terrain(n);let color=auroraBiome==='moon'?[.42,.43,.45]:auroraBiome==='terrestrial'?(h<0?[.025,.19,.29]:[.27,.48,.28]):auroraBiomeColor(n,h);if(auroraBiome==='mercury'&&h<auroraBiomeLavaLevel)color=[1.,.28,.018];row.push({n,p:mul(n,(R+(auroraBiome==='terrestrial'?Math.max(-.07,h):auroraBiome==='mercury'?Math.max(auroraBiomeLavaLevel,h):h))/R),color});}rows.push(row);}for(let j=0;j<48;j++)for(let i=0;i<96;i++)for(const [a,b,c]of[[rows[j][i],rows[j][i+1],rows[j+1][i+1]],[rows[j][i],rows[j+1][i+1],rows[j+1][i]]])for(const v of[a,b,c])pushv(proxy,v.p,v.n,v.color);options.onProxy(new Float32Array(proxy));}
 const dec=createPlanet();naturalGeo=upload(dec);buildDistricts(dec);createActors();atmosphereGeo=upload(spheregeo(96,48));initialized=gameReady=true;
 return runtimeAPI;
}
window.AURORA=runtimeAPI;
resize();
if(productionMode){
 initControls();initialized=gameReady=true;$('#loading').remove();
 window.dispatchEvent(new CustomEvent('aurora-ready'));rafId=requestAnimationFrame(loop);
}else setTimeout(()=>{try{const dec=createPlanet();Object.assign(camera,overviewDirection());Object.assign(targetCamera,overviewDirection());buildDistricts(dec);createActors();atmosphereGeo=upload(spheregeo(96,48));makeLabels();initMinimap();initControls();initialized=true;gameReady=true;selected=buildings.find(b=>b.type==='metal');updatePanel();updateJumpState();updateCamera(.016);updateRotors(.016);updateActors(.016);updatePhases();render();updateLabels();updateMinimap();$('#loading').style.opacity='0';setTimeout(()=>$('#loading')?.remove(),550);window.dispatchEvent(new CustomEvent('aurora-ready'));rafId=requestAnimationFrame(loop)}catch(e){showError(e)}},70);
return runtimeAPI;
}
window.createAuroraDetail=options=>createAuroraRuntime({...options,detailOnly:true});
if(!window.__AURORA_WORKER)createAuroraRuntime();

