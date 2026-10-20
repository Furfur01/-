import {THREE,chamfer,robotArm} from './primitives.js';
import {loft,blockHull,hexPortal,hexShell,conduit,robotUnit} from './forms.js';
export const PI=Math.PI;
export function deck(g,b){g.extrude(chamfer(0,0,b.w,b.d,Math.min(b.w,b.d)*.12),.3,.04,'roof',.03);g.extrude(chamfer(0,0,b.w*.96,b.d*.96,.5),.10,.34,'concrete',.02);}
export function airlock(g,x,z,h=2.6,w=2.4,rotation=0){
  g.box([x,h*.48,z],[w,h*.96,.65],'ivory',[0,rotation,0]);g.box([x,h*.48,z],[w*.72,h*.76,.72],'dark',[0,rotation,0]);g.box([x,h*.5,z],[w*.53,h*.57,.76],'glass',[0,rotation,0]);g.box([x,h*.88,z],[w*.58,.12,.82],'energy',[0,rotation,0]);
}
export function solarWing(g,x,z,w,d,y,tilt=0){
  g.box([x,y,z],[w,.22,d],'white',[tilt,0,0]);g.box([x,y+.14,z],[w-.35,.08,d-.3],'glass',[tilt,0,0]);
  for(let i=1;i<5;i++)g.box([x-w/2+i*w/5,y+.21,z],[.075,.04,d-.3],'teal',[tilt,0,0]);
  for(const dz of[-d*.25,0,d*.25])g.box([x,y+.23,z+dz],[w-.3,.04,.075],'steel',[tilt,0,0]);
}
export function capsule(g,x,z,w,d,h,{color='ivory',glass=true}={}){
  const poly=chamfer(0,0,w,d,Math.min(w,d)*.24),outline=s=>poly.map(([a,b])=>[x+a*s,z+b*s]);
  loft(g,[[.35,outline(1)],[h*.25,outline(1)],[h*.70,outline(.94)],[h*.94,outline(.72)],[h,outline(.66)]],['roof',glass?'glass':color,color,'roof'],'roof');
  for(const xx of[-.36,.36]){g.beam([x+w*xx,.4,z+d*.43],[x+w*xx*.75,h*.83,z+d*.32],.16,color);g.box([x+w*xx*.75,h*.87,z],[.25,.16,d*.48],'white');}
  g.box([x,h+.04,z],[w*.36,.08,d*.16],'energy');
}
export function servicePod(g,b,kind='habitat'){
  deck(g,b);capsule(g,0,0,b.w*.94,b.d*.94,b.h-.12);const side=b.door||'s',x=side==='w'?-b.w*.45:side==='e'?b.w*.45:0,z=side==='n'?-b.d*.45:side==='s'?b.d*.45:0;airlock(g,x,z,Math.min(2.4,b.h*.62),Math.min(2.4,b.w*.3),side==='w'||side==='e'?PI/2:0);
  if(kind==='data')for(const x of[-.26,0,.26]){g.box([b.w*x,b.h*.90,-b.d*.08],[b.w*.12,.3,b.d*.32],'roof');g.box([b.w*x,b.h*.94,-b.d*.08],[b.w*.07,.1,b.d*.26],'teal');}
  else if(kind==='utility'){for(const x of[-b.w*.27,b.w*.27]){g.cylinder([x,b.h*.87,0],Math.min(1,b.w*.1),.35,'steel');g.ring([x,b.h*.99,0],Math.min(.7,b.w*.07),.06,'gold');}}
}
export function hangar(g,b,{cargo=false,rover=false}={}){
  deck(g,b);const h=b.h,w=b.w,d=b.d;hexPortal(g,0,d/2-1.2,w*.96,h-.12,1.1);hexPortal(g,0,-d/2+.25,w*.96,h-.12,.8);hexShell(g,0,w*.95,d-1.3,h-.22);g.box([0,h*.35,-d/2+.5],[w*.84,h*.63,.5],'roof');
  const n=Math.max(2,Math.round(w/8));for(let i=0;i<n;i++){const x=(i-(n-1)/2)*w/n;g.box([x,.56,d*.2],[w/n-.8,.22,d*.5],'dark');g.box([x,.72,d*.4],[w/n-1.6,.09,1.2],'gold');if(cargo){capsule(g,x,d*.04,w/n-1.8,d*.35,Math.min(2.7,h*.5),{glass:false});}else{robotUnit(g,x,d*.22,.72,Math.min(1.9,h*.35));if(rover)robotArm(g,x-w/n*.32,d*.05,.6,Math.min(2.3,h*.36));}}
  for(const x of[-w*.36,w*.36])g.box([x,h*.58,d/2-.7],[.25,.9,.25],'teal');
}
export function vessel(g,x,z,r,h,{color='ivory',bands=2}={}){
  g.cylinder([x,.55,z],r*1.04,.4,'roof');g.cylinder([x,h*.44,z],r*.87,h*.61,color);g.dome([x,h*.745,z],[r*.87,h*.20,r*.87],'white');
  for(let i=1;i<=bands;i++)g.ring([x,h*(.2+i*.18),z],r*.90,.1,'steel');g.cylinder([x,h*.96,z],r*.26,.16,'gold');
  for(const a of[0,PI*.5,PI,PI*1.5])g.beam([x+Math.cos(a)*r,.35,z+Math.sin(a)*r],[x+Math.cos(a)*r*.82,h*.72,z+Math.sin(a)*r*.82],.10,'roof');
}
export function crystal(g,x,z,r,h,y=.35){const geo=new THREE.OctahedronGeometry(1,0);g.add(geo,'glass',[x,y+h/2,z],[r,h/2,r]);geo.dispose();g.beam([x-r*.35,y+h*.3,z+r*.3],[x-r*.12,y+h*.85,z+r*.1],.08,'energy');}
export function paraboloid(g,r,h,y=0){
  const pos=[];for(let j=0;j<5;j++)for(let i=0;i<24;i++){const a=i*PI/12,b=(i+1)*PI/12,r0=r*j/5,r1=r*(j+1)/5,P=(rr,t)=>[Math.cos(t)*rr,y+h*(rr/r)**2,Math.sin(t)*rr];const p=P(r0,a),q=P(r1,a),s=P(r0,b),t=P(r1,b);pos.push(...p,...s,...q,...q,...s,...t);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.computeVertexNormals();g.add(geo,'ivory');geo.dispose();g.ring([0,y+h,0],r,.15,'roof');
}
export function dish(g,b){
  deck(g,b);const r=Math.min(b.w,b.d)*.43,h=b.h;g.cylinder([0,h*.17,0],r*.20,h*.31,'roof');g.cylinder([0,h*.31,0],r*.31,h*.12,'gold');paraboloid(g,r,h*.24,h*.36);
  for(let i=0;i<3;i++){const a=i*PI*2/3;g.beam([Math.cos(a)*r*.90,h*.56,Math.sin(a)*r*.90],[0,h*.91,0],.18,'steel');g.beam([Math.cos(a)*r*.62,.5,Math.sin(a)*r*.62],[0,h*.34,0],.35,'ivory');}
  g.cylinder([0,h*.92,0],r*.11,h*.09,'teal');g.ring([0,h*.4,0],r*.42,.13,'glass');
}
export function rover(g,x,z,s=1){
  g.box([x,.7*s,z],[3.8*s,1.0*s,6.2*s],'roof');capsule(g,x,z-.5,3.5*s,4*s,2.6*s);for(const dx of[-2,2])for(const dz of[-1.8,0,1.8])g.cylinder([x+dx*s,.65*s,z+dz*s],.66*s,.48*s,'dark',[0,0,PI/2]);g.box([x,1.65*s,z-2.5*s],[2.6*s,.8*s,.12*s],'glass');
}
export function dockingCollar(g,x,z,r,y){g.ring([x,y,z],r,.4,'ivory');g.ring([x,y+.15,z],r*.83,.13,'energy');for(let i=0;i<6;i++){const a=i*PI/3;g.box([x+Math.cos(a)*r,y,z+Math.sin(a)*r],[.7,.65,.7],'roof');}}
export function radiator(g,x,z,w,d,h){
  g.box([x,.65,z],[w,1.0,d],'roof');for(let i=0;i<5;i++){const xx=x-w*.38+i*w*.19;g.box([xx,h*.55,z],[w*.11,h*.75,d*.85],'ivory',[0,0,.08]);g.box([xx+.1,h*.55,z+d*.44],[w*.035,h*.58,.08],'teal');}conduit(g,[[x-w*.45,.4,z+d*.4],[x+w*.45,.4,z+d*.4]],.15,'gold');
}
