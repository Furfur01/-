// Retained AURORA building vocabulary. Pure geometry only; no renderer or DOM.
const PI=Math.PI, TAU=PI*2, R=16, PAD=.36, SITE=2.05, GOLDEN=PI*(3-Math.sqrt(5));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)), mix=(a,b,t)=>a+(b-a)*t, smooth=(a,b,t)=>{t=clamp((t-a)/(b-a),0,1);return t*t*(3-2*t)}, add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]], sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]], mul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s], dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2], cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]], len=a=>Math.hypot(...a), norm=a=>mul(a,1/(len(a)||1)), vlerp=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
const hex=s=>{s=s.replace('#','');return [parseInt(s.slice(0,2),16)/255,parseInt(s.slice(2,4),16)/255,parseInt(s.slice(4,6),16)/255]};
const C={ivory:hex('e1e4d7'),roof:hex('466277'),dark:hex('22374d'),base:hex('4b5963'),black:hex('172535'),teal:hex('58ebd3'),glass:hex('216789'),metal:hex('d17929'),gold:hex('ffbd53'),white:hex('edf2dc'),purple:hex('e1a6ff'),crystal:hex('a14ce0'),gas:hex('49c9b2'),red:hex('c7693c'),road:hex('465263'),line:hex('f0ce86'),tree:hex('2e784e'),trunk:hex('716043')};
function ident(){return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}
function mm(a,b){const o=new Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o}
function trs(t=[0,0,0],r=[0,0,0],s=[1,1,1]){const [x,y,z]=r,cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);let mx=[1,0,0,0,0,cx,sx,0,0,-sx,cx,0,0,0,0,1],my=[cy,0,-sy,0,0,1,0,0,sy,0,cy,0,0,0,0,1],mz=[cz,sz,0,0,-sz,cz,0,0,0,0,1,0,0,0,0,1],m=mm(mm(my,mx),mz);for(let j=0;j<3;j++)for(let i=0;i<3;i++)m[j*4+i]*=s[j];m[12]=t[0];m[13]=t[1];m[14]=t[2];return m}
function pt(m,p){return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]]}
function normal3(m){const a=[m[0],m[1],m[2]],b=[m[4],m[5],m[6]],c=[m[8],m[9],m[10]],bc=cross(b,c),ca=cross(c,a),ab=cross(a,b),det=dot(a,bc)||1;return [...mul(bc,1/det),...mul(ca,1/det),...mul(ab,1/det)]}
function nt(m,p){return norm([m[0]*p[0]+m[3]*p[1]+m[6]*p[2],m[1]*p[0]+m[4]*p[1]+m[7]*p[2],m[2]*p[0]+m[5]*p[1]+m[8]*p[2]])}
function frame(up,pos){const x=norm(cross(Math.abs(up[1])>.98?[0,0,1]:[0,1,0],up)),z=norm(cross(x,up));return [x[0],x[1],x[2],0,up[0],up[1],up[2],0,z[0],z[1],z[2],0,...pos,1]}
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
function sphere(a,p,s,c,e=0,half=false){append(a,spheregeo(10,5,half),trs(p,[0,0,0],s),c,e)}
function ring(a,p,rad,tube,c,r=[0,0,0],e=0,seg=16){append(a,torusgeo(rad,tube,seg,5),trs(p,r),c,e)}
function beam(a,p,q,rad,c,n=6,e=0){const d=sub(q,p),mid=mul(add(p,q),.5),m=frame(norm(d),mid);append(a,cylgeo(rad,rad,len(d),n),m,c,e)}
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
export function auroraBuildingVertices(type){if(type==='truck'){const v=truckModel();append(v,truckBed(),trs([0,.18,.03]));return v;}const a=[];platform(a,type==='shipyard'?1.16:type.includes('store')?.88:1.03,type);
if(type==='services'){
 block(a,[0,.28,0],[1.35,.46,.9]);block(a,[.45,.7,-.15],[.38,.42,.54]);
 for(const x of[-.43,0,.43]){box(a,[x,.3,.458],[.32,.28,.026],C.dark);box(a,[x,.45,.48],[.34,.035,.035],C.gold,[0,0,0],.4);}
 for(const x of[-.48,-.20]){box(a,[x,.535,-.19],[.2,.05,.28],C.roof);for(let k=0;k<4;k++)box(a,[x,.565,-.29+k*.055],[.15,.02,.015],C.ivory);}
 antenna(a,.45,.94,-.15,.36);box(a,[-.56,.10,.70],[.6,.035,.30],C.roof);return a;
}
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
if(type==='radar')append(a,dish(),trs([0,.94,0],[.5,0,0]));
return a}
function dish(){const a=[];const seg=24,rings=5;for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){const f=(r,t)=>[r*.68*Math.cos(t),r*r*.25,r*.68*Math.sin(t)],r0=j/rings,r1=(j+1)/rings,t0=i/seg*TAU,t1=(i+1)/seg*TAU;quad(a,f(r0,t0),f(r0,t1),f(r1,t1),f(r1,t0),C.ivory)}ring(a,[0,.25,0],.68,.022,C.roof);for(let i=0;i<3;i++){let t=i*TAU/3;beam(a,[.55*Math.cos(t),.17,.55*Math.sin(t)],[0,.63,0],.017,C.dark)}sphere(a,[0,.64,0],[.06,.055,.06],C.gold);return a}
function crystal(a,p,h=.65,r=.16,c=C.crystal,rot=[0,0,0]){const s=[];append(s,cylgeo(r*.82,r,h*.73,5),trs([0,h*.365,0]),c);append(s,cylgeo(0,r*.82,h*.27,5),trs([0,h*.865,0]),c.map(v=>Math.min(1,v*1.3)),.12);append(a,s,trs(p,rot));}
function truckModel(){const a=[];box(a,[0,.13,.02],[.28,.10,.53],C.dark);block(a,[0,.25,-.18],[.29,.24,.23],C.metal);box(a,[0,.32,-.304],[.24,.084,.014],C.glass);box(a,[0,.37,-.18],[.33,.035,.25],C.gold);for(let x of [-.15,.15])for(let z of [-.20,.16]){cyl(a,[x,.10,z],.093,.055,C.black,10,[0,0,PI/2]);cyl(a,[x*1.19,.1,z],.047,.007,C.roof,8,[0,0,PI/2])}for(let x of [-.1,.1])box(a,[x,.20,-.315],[.052,.026,.016],C.white,[0,0,0],1.2);return a}
function truckBed(){const a=[];box(a,[0,0,.05],[.3,.033,.35],C.gold);for(let x of [-.153,.153])box(a,[x,.08,.05],[.025,.16,.35],C.metal);box(a,[0,.08,.214],[.32,.16,.025],C.metal);box(a,[0,.08,-.115],[.32,.16,.025],C.gold);return a}
