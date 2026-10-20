import {THREE,builder,chamfer,robotArm,roofVent} from './primitives.js';
import {footprint} from './plans.js';
import {loft,armorHull,blockHull,arcBand,arcPolygon,rib,roofPanels,conduit,robotUnit,conveyor,hexPortal,hexShell} from './forms.js';
import {createSpaceBuilding} from './space-models.js';

const PI=Math.PI;
function entrance(g,b){
  let x=0,z=b.d/2,rot=0;
  if(b.door==='n'){z=-b.d/2;rot=PI;}else if(b.door==='w'){x=-b.w/2;z=0;rot=-PI/2;}else if(b.door==='e'){x=b.w/2;z=0;rot=PI/2;}
  if(b.shape==='l'&&['s','e'].includes(b.door||'s')){x=-b.w*.09;z=b.d*.2;rot=PI/2;g.box([0,.06,z],[b.w*.18,.12,1.1],'walk');if(b.door==='e'){g.box([b.w*.25,.06,0],[b.w*.5,.12,1.1],'walk');g.box([0,.06,b.d*.1],[1.1,.12,b.d*.2],'walk');}else g.box([0,.06,b.d*.35],[1.1,.12,b.d*.3],'walk');}
  const dh=Math.min(1.7,b.h*.7),canopy=dh+.2;
  g.box([x,dh/2+.2,z],[1.55,dh,.1],'glass',[0,rot,0]);g.box([x,canopy,z],[2.3,.16,.9],'white',[0,rot,0]);
  g.box([x,canopy+.09,z],[1.2,.04,.35],'energy',[0,rot,0]);
}
function pressurePod(g,x,z,r,h){
  g.cylinder([x,.16,z],r*1.09,.3,'roof');g.cylinder([x,h*.43,z],r*.85,h*.55,'ivory');g.dome([x,h*.70,z],[r*.87,h*.27,r*.87],'white');
  g.ring([x,h*.36,z],r*.88,.07,'gold');g.cylinder([x,h*.59,z],r*.87,h*.10,'glass');g.cylinder([x,h*.94,z],r*.34,.1,'steel');
  conduit(g,[[x+r*.8,.3,z],[x+r*.8,h*.6,z],[x+r*.3,h*.87,z]],.08,'gold');
}
function chamber(g,x,z,r,h){
  g.cylinder([x,.12,z],r,.24,'roof');g.cylinder([x,h*.45,z],r*.83,h*.60,'clearGlass');g.cylinder([x,h*.43,z],r*.36,h*.62,'energy');
  for(const a of[0,PI/2,PI,PI*1.5]){const dx=Math.cos(a)*r*.8,dz=Math.sin(a)*r*.8;g.beam([x+dx,.2,z+dz],[x+dx*.8,h*.84,z+dz*.8],r*.09,'white');}
  g.cylinder([x,h*.88,z],r*.82,h*.13,'ivory');g.ring([x,h*.91,z],r*.6,.07,'gold');
}
function receiverDish(g,x,z,y,r){
  g.cylinder([x,y+.2,z],r*.23,.4,'roof');g.dome([x,y+.35,z],[r,.3,r],'white');g.ring([x,y+.38,z],r*.85,.07,'teal');g.beam([x,y+.38,z],[x,y+.9,z],.05,'gold');
}
function office(g,b,kind='office'){
  const poly=footprint({...b,x:0,y:0});armorHull(g,poly,b.h*.91);entrance(g,b);
  if(kind==='data'){for(let i=-1;i<=1;i++){const x=i*b.w*.24;g.extrude(chamfer(x,-b.d*.05,b.w*.17,b.d*.45,.3),.22,b.h*.84,'roof',.03);g.box([x,b.h*.96,-b.d*.05],[b.w*.10,.04,b.d*.28],'energy');}}
  else if(kind==='sensor')receiverDish(g,0,-b.d*.1,b.h*.62,Math.min(1.5,b.w*.16));
  else{for(const x of[-b.w*.25,b.w*.25])roofVent(g,x,-b.d*.18,b.h*.85,Math.min(1.3,b.w*.13));}
}
function serviceHangar(g,b,{open=false,roof='roof'}={}){
  const {w,d,h}=b;g.extrude(chamfer(0,0,w,d,.7),.2,0,'concrete');
  const bays=Math.max(2,Math.round(w/7)),bw=(w-.8)/bays;
  for(let i=0;i<=bays;i++)rib(g,-w/2+.4+i*bw,.55,d,h,'ivory');
  for(let i=0;i<bays;i++){
    const x=-w/2+.4+(i+.5)*bw;roofPanels(g,x,bw,d,h*.96,{glass:i%2===0});
    g.box([x,h*.35,-d/2+.12],[bw-.5,h*.7,.24],'roof');
    if(!open||i%3===2){g.box([x,h*.29,d/2-.4],[bw-1,h*.57,.16],roof);for(let k=1;k<5;k++)g.box([x,h*.11*k,d/2-.3],[bw-1.2,.04,.04],'steel');}
    else{g.box([x,.32,d*.17],[bw-1,.4,d*.5],'dark');robotUnit(g,x,d*.24,.5,.7);}
    g.box([x,h*.66,d/2-.2],[bw*.55,.09,.12],'teal');g.box([x,.14,d/2-.15],[bw-.8,.24,.6],'dark');
    for(const xx of[-.33,.33])g.box([x+bw*xx,.42,d/2-.3],[.18,.8,.18],'gold');
  }
}
function institute(g,b){
  // Four chamfered wings plus a real glazed instrument atrium, preserving the open court.
  blockHull(g,-11.2,2,7.6,16,3.03);blockHull(g,11.2,2,7.6,16,3.03);
  blockHull(g,-9.6,-6.8,10.8,6.4,3.12);blockHull(g,9.6,-6.8,10.8,6.4,3.12);
  const vault=chamfer(0,-5.7,8.2,8.5,1.7);g.extrude(vault,.22,0,'roof');
  chamber(g,0,-5.7,1.15,2.5);g.extrude(vault,.05,.24,'steel');
  for(let i=0;i<vault.length;i++){const a=vault[i],bb=vault[(i+1)%vault.length],mid=[(a[0]+bb[0])/2,(a[1]+bb[1])/2],len=Math.hypot(bb[0]-a[0],bb[1]-a[1]),angle=-Math.atan2(bb[1]-a[1],bb[0]-a[0]);g.box([mid[0],1.45,mid[1]],[len,2.4,.08],'clearGlass',[0,angle,0]);g.beam([a[0],.2,a[1]],[a[0]*.8,2.95,-5.7+(a[1]+5.7)*.8],.17,'ivory');}
  loft(g,[[2.65,vault],[3.50,vault.map(([x,z])=>[x*.68,-5.7+(z+5.7)*.68])]],'clearGlass','glass');
  for(const x of[-11.2,11.2]){g.extrude(chamfer(x,1,2.3,10,.65),.12,2.92,'glass',.02);for(const z of[-1.8,3.8])g.box([x,3.06,z],[2,.04,.13],'energy');conduit(g,[[x+2.2,.6,7],[x+2.2,2.3,7],[x+2.2,2.9,-3]],.09);}
  g.box([0,2.05,-1.15],[5,.24,1.4],'white');g.box([0,2.2,-1.15],[2.4,.06,.35],'energy');g.box([-1,1.1,-10],[1.8,1.8,.1],'glass');
}
function researchRing(g,b){
  const rx=b.w/2-.2,rz=b.d/2-.2,inner=.59;
  for(let q=0;q<4;q++){
    const start=q*PI/2+.085,end=(q+1)*PI/2-.085;
    const arc=(scale,inside=inner)=>{const p=[];for(let i=0;i<=10;i++){const a=start+(end-start)*i/10;p.push([Math.cos(a)*rx*scale,Math.sin(a)*rz*scale]);}for(let i=10;i>=0;i--){const a=start+(end-start)*i/10;p.push([Math.cos(a)*rx*inside*scale,Math.sin(a)*rz*inside*scale]);}return p;};
    loft(g,[[.08,arc(.98)],[.35,arc(1)],[.8,arc(.99)],[2.42,arc(.97)],[3.21,arc(.89)],[3.5,arc(.86)]],['dark','ivory','glass','ivory','roof'],'roof');
    arcBand(g,rx*.88,rz*.88,.78,3.48,.06,start+.025,end-.025,'steel',10);
    const mid=(start+end)/2;arcBand(g,rx*.90,rz*.90,inner/.90,3.21,.29,mid-.055,mid+.055,'white',2);
    for(let i=1;i<8;i++){const a=start+(end-start)*i/8;g.beam([Math.cos(a)*rx*.98,.75,Math.sin(a)*rz*.98],[Math.cos(a)*rx*.95,2.40,Math.sin(a)*rz*.95],.075,'white');}
  }
  // Four physical couplers across the breaks; the central metrology device is below roof height.
  for(let q=0;q<4;q++){const a=q*PI/2,c=Math.cos(a),s=Math.sin(a),x=c*rx*.77,z=s*rz*.77;g.box([x,1.4,z],[q%2?2.2:4,2.4,q%2?3:2.2],'ivory');g.box([x,2.65,z],[q%2?1.7:3.3,.14,q%2?2.7:1.7],'gold');conduit(g,[[x-c*.7,.5,z-s*.7],[x-c*.7,2.8,z-s*.7],[x+c*.7,2.8,z+s*.7],[x+c*.7,.5,z+s*.7]],.11);}
  g.cylinder([0,.15,0],3.7,.3,'roof');g.ring([0,.38,0],3.3,.12,'gold');g.cylinder([0,.35,0],2.8,.18,'glass');chamber(g,0,0,1.4,2.9);
  for(const a of[0,PI/2,PI,PI*1.5]){g.box([Math.cos(a)*2.6,.55,Math.sin(a)*2.6],[.8,.55,.8],'white');g.beam([Math.cos(a)*1.4,.62,Math.sin(a)*1.4],[Math.cos(a)*2.5,.62,Math.sin(a)*2.5],.06,'energy');}
  g.box([0,.1,rz*.55],[1.6,.2,rz*.9],'walk');
}
function research(g,b){
  if(b.id==='main')return institute(g,b);
  if(b.id==='shared')return researchRing(g,b);
  if(b.id==='energy2'){
    g.extrude(chamfer(0,0,7.9,7.9,2),.22,0,'roof');chamber(g,0,0,1.65,2.15);
    for(let q=0;q<4;q++){const a=q*PI/2,petal=s=>arcPolygon(3.8*s,3.8*s,.64,a-.52,a+.52,4);loft(g,[[.25,petal(.95)],[1.2,petal(1)],[2.32,petal(.83)],[2.4,petal(.8)]],['roof','ivory','white'],'ivory');arcBand(g,3.0,3.0,.86,2.39,.05,a-.34,a+.34,'energy',4);const c=Math.cos(a),s=Math.sin(a);g.beam([c*3.2,.35,s*3.2],[c*2.4,1.9,s*2.4],.13,'gold');}return;
  }
  if(b.id==='testRig'){
    g.cylinder([0,.14,0],4.7,.28,'concrete');g.ring([0,.3,0],4,.07,'gold');g.cylinder([0,.4,0],1.6,.5,'roof');g.ring([0,.76,0],2.3,.12,'teal');g.cylinder([0,.7,0],.6,.6,'energy');for(let i=0;i<4;i++){const a=i*PI/2;g.box([Math.cos(a)*3.2,.55,Math.sin(a)*3.2],[.65,.9,.65],'ivory');}return;
  }
  if(b.id==='store'||b.id==='service')return serviceHangar(g,b,{open:b.id==='service'});
  if(b.shape==='l'){
    armorHull(g,footprint({...b,x:0,y:0}),b.id==='sys1'?1.92:1.85);entrance(g,b);
    if(b.id==='mat1'){for(const x of[2.4,4.8])pressurePod(g,x,2.5,.95,2.3);conduit(g,[[2.4,.3,1.4],[2.4,1.6,.6],[-1,1.6,.6]],.1);for(const x of[-3.5,0,3.5]){g.dome([x,1.8,-3.7],[1.2,.55,1.5],'white');g.ring([x,2.0,-3.7],.65,.08,'gold');}}
    if(b.id==='energy1'){for(const x of[1.8,6.2])chamber(g,x,2.2,1.45,2.3);for(const x of[-7,-3,1,5]){g.dome([x,1.85,-3.8],[1.5,.5,1.2],'glass');g.beam([x-1.4,1.9,-3.8],[x+1.4,1.9,-3.8],.11,'ivory');}}
    if(b.id==='sys1'){receiverDish(g,3.5,1.8,0,1.35);receiverDish(g,7,1.8,0,1.0);for(const x of[-6,-1,4]){g.box([x,2.06,-2.6],[3,.16,1.8],'roof',[0,0,-.10]);g.box([x,2.17,-2.6],[2.3,.05,1.2],'glass',[0,0,-.10]);}}
    return;
  }
  office(g,b,b.id==='sys2'?'data':b.id==='testControl'?'sensor':'office');
}
function cutter(g,b,drill=false){
  const large=!drill,s=large?1.4:.9;
  for(const z of[-2.1,2.1]){g.extrude(chamfer(0,z*s,6.5*s,1.3*s,.45),.7*s,.05,'dark');for(let x=-2.6;x<=2.6;x+=1.04)g.cylinder([x*s,.43*s,(z+.67)*s],.34*s,.12*s,'steel',[PI/2,0,0]);}
  g.cylinder([.1,1.0*s,0],1.7*s,.4*s,'gold');blockHull(g,.9,0,4.8*s,3.5*s,2.0*s);
  if(large){
    g.box([1.2,2.05,-2.4],[2.6,1.05,.13],'glass');
    for(const z of[-1.2,1.2]){g.beam([-1,1.5,z],[-4.6,2.3,z],.27,'gold');g.beam([-4.6,2.3,z],[-6.6,1.55,z],.24,'gold');g.beam([-1.1,1.1,z+.3],[-4.4,1.9,z+.3],.10,'steel');}
    // Supported, toothed wheel plane faces the rock to the west.
    g.cylinder([-6.8,1.6,0],1.30,.65,'roof',[0,0,PI/2]);g.ring([-7.17,1.6,0],1.18,.24,'ivory',[0,PI/2,0]);
    g.cylinder([-7.25,1.6,0],.34,.2,'gold',[0,0,PI/2]);g.ring([-6.43,1.6,0],1.18,.2,'ivory',[0,PI/2,0]);g.cylinder([-6.36,1.6,0],.4,.2,'gold',[0,0,PI/2]);for(let i=0;i<6;i++){const a=i*PI/3;g.beam([-6.4,1.6+Math.sin(a)*.4,Math.cos(a)*.4],[-6.4,1.6+Math.sin(a)*1.07,Math.cos(a)*1.07],.09,'teal');}conveyor(g,[1.5,0],[7.7,0],1.15,.75);
  }else{
    g.beam([-1,1.2,0],[-3.1,1.75,0],.23,'gold');g.cylinder([-3.4,1.2,0],.55,1.5,'steel');g.cone([-3.4,.4,0],.7,.65,'roof');g.ring([-3.4,1.6,0],.6,.09,'energy');
  }
}
function jawCrusher(g,b){
  g.extrude(chamfer(0,0,21.7,19.7,1.4),.28,0,'concrete');
  // Two thick jaw housings frame real exposed drums and intake slots.
  for(const x of[-6.7,6.7]){
    const profile=[[-9.7,.2],[-9.7,1.05],[-7.1,1.05],[-4.3,2.8],[-1.7,3.55],[4.2,3.55],[7.3,2.15],[9.7,.9],[9.7,.2]],shape=new THREE.Shape();profile.forEach(([z,y],i)=>i?shape.lineTo(-z,y):shape.moveTo(-z,y));shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:6.8,bevelEnabled:false,steps:1,curveSegments:1});geo.rotateY(PI/2);g.add(geo,'ivory',[x-3.4,0,0]);geo.dispose();
    g.box([x,3.57,1.2],[5.2,.04,4.8],'roof');g.box([x,3.61,1.2],[.8,.04,3.3],'energy');
    for(const z of[-3.1,5.5]){g.cylinder([x,2.1,z],.68,6.9,'roof',[0,0,PI/2]);g.cylinder([x+Math.sign(x)*3.5,2.1,z],.43,.15,'gold',[0,0,PI/2]);}conduit(g,[[x,1.2,-7.7],[x,2.45,-4.3],[x,2.9,-1.8]],.19,'gold');
  }
  for(const z of[-5,-2,1,4]){
    g.cylinder([0,1.35,z],1.05,6.2,'gold',[0,0,PI/2]);
    for(const x of[-2.7,-1.8,-.9,0,.9,1.8,2.7])g.ring([x,1.35,z],1.06,.08,'steel',[0,PI/2,0]);
  }
  const outer=chamfer(0,-7.5,6.7,4,.3),inside=chamfer(0,-7.5,5.3,3.1,.2);loft(g,[[1.9,inside],[3.1,outer]],'ivory',null);g.extrude(inside,.15,1.9,'ore');
  conveyor(g,[0,4.5],[0,9.6],4.8,.65);for(const x of[-4.3,4.3])conduit(g,[[x,.3,-8],[x,2.8,-8],[x,2.8,8],[x,.3,8]],.14,'gold');
}
function refining(g,b){
  const {w,d,h}=b;g.extrude(chamfer(0,0,w,d,.9),.22,0,'concrete');
  for(const x of[-17.3,-6,6,17.3])rib(g,x,1.1,d,h,'ivory');
  for(const x of[-11.65,0,11.65]){
    roofPanels(g,x,10.0,d,h-.12,{glass:true,open:true});
    // Transparent roof glazing exposes the refining vessels, with a low shell over the rear duct.
    for(const z of[-3.7,3.7]){g.cylinder([x,.25,z],2.05,.4,'roof');g.cylinder([x,1.18,z],1.7,1.5,'gold');g.cylinder([x,1.7,z],1.35,.4,'energy');g.ring([x,2.0,z],1.75,.1,'steel');}
    g.box([x,1.3,-d/2+.1],[9.1,2.5,.18],'glass');
    conduit(g,[[x-3.6,.3,-5.8],[x-3.6,2.2,-5.8],[x-3.6,2.2,5.8],[x-3.6,.3,5.8]],.11);
    g.box([x,.40,d/2-.1],[8.9,.6,.08],'clearGlass');
  }
  conveyor(g,[-17.8,0],[17.8,0],1.4,.65);
}
function stockpile(g,b){
  g.extrude(chamfer(0,0,b.w,b.d,.4),.22,0,'concrete');
  for(const x of[-b.w/2+.25,b.w/2-.25])g.box([x,.65,0],[.45,1.3,b.d],'ivory');g.box([0,.65,-b.d/2+.2],[b.w,1.3,.4],'ivory');
  const colors=b.id==='stock1'?['ore','orange']:['rock','steel'];for(let i=0;i<3;i++)g.dome([-b.w*.25+i*b.w*.25,.2,-.3],[b.w*.22,1.4,b.d*.39],colors[i%2]);
  for(const x of[-b.w*.3,0,b.w*.3])g.box([x,.75,-b.d/2-.05],[.4,.9,.12],'roof');
}
function loading(g,b){
  g.extrude(chamfer(0,0,b.w,b.d,.8),.22,0,'concrete');
  for(const x of[-15,15]){g.box([x,1.1,-3.6],[.6,2.2,.65],'ivory');g.box([x,1.1,3.6],[.6,2.2,.65],'ivory');}
  for(const z of[-3.6,3.6])g.box([0,2.2,z],[31,.3,.45],'gold');
  for(const x of[-9,2,11]){g.box([x,1,-.1],[5.2,1.65,4.6],'roof');g.box([x,1.9,-.1],[5.4,.18,4.8],'ivory');g.box([x,1.1,2.25],[4,.6,.08],'glass');}
  g.box([-5,2.35,0],[1.6,.3,8],'ivory');g.box([-5,1.9,0],[.7,.7,1],'dark');
}
function mine(g,b){
  if(b.id.startsWith('exc'))return cutter(g,b,b.id==='exc2');
  if(b.id==='crusher')return jawCrusher(g,b);
  if(b.id==='process')return refining(g,b);
  if(b.id.startsWith('stock'))return stockpile(g,b);
  if(b.id==='load')return loading(g,b);
  if(b.id==='repair'||b.id==='parts')return serviceHangar(g,b,{open:b.id==='repair'});
  office(g,b,b.id==='control'?'sensor':'office');
}
function machining(g,b){
  const {w,d,h}=b;g.extrude(chamfer(0,0,w,d,.9),.22,0,'concrete');
  // Hexagonal portals face the production apron. Each cell has a solid faceted shell,
  // a glazed roof slot and an open machine face, distinct from the warehouse arches.
  for(const [i,x]of[-11.6,0,11.6].entries()){
    const depth=d-(i===1?0:1.3),height=h-(i===1?0:.18);hexPortal(g,x,depth/2-1.1,11.2,height,1.1);hexPortal(g,x,-depth/2,11.2,height,1.1);hexShell(g,x,11.15,depth-1.3,height-.06);
    g.box([x,1.12,-depth/2+.12],[9.5,2.2,.2],'roof');
    for(const xx of[-2.3,2.3]){blockHull(g,x+xx,1.7,3.2,3.6,2.15);g.box([x+xx,1.3,3.51],[2.2,1.2,.08],'clearGlass');robotArm(g,x+Math.sign(xx)*3.9,4.4,.25,1.4,xx<0?1:-1);}
    conveyor(g,[x-4.4,6.0],[x+4.4,6.0],1.4,.65);g.box([x,height-.14,depth/2-.7],[3.3,.12,.5],'energy');
  }
}
function assembly(g,b){
  const {w,d,h}=b;g.extrude(chamfer(0,0,w,d,1.2),.24,0,'concrete');
  for(const x of[-16.6,-8.3,0,8.3,16.6])rib(g,x,Math.abs(x)>16?2.5:1.8,d,h,'ivory');
  g.box([0,h-.38,6.8],[31,.6,1.3],'ivory');g.box([0,h-.38,-6.8],[31,.6,1.3],'roof');
  for(const [i,x]of[-13.05,-4.35,4.35,13.05].entries()){
    roofPanels(g,x,7.65,d,h-.08,{open:i===1||i===2,glass:i%2===0});
    g.box([x,1.2,-d/2+.14],[7.5,2.2,.22],'glass');
    // These are open roof and front bays, not transparent decals over a solid hall.
    robotArm(g,x-2.1,-1.4,.28,1.8,1);
    robotUnit(g,x+1.4,5.5,.85,1.5);robotUnit(g,x+1.4,-1.4,.75,1.3);
    g.box([x,2.7,7.5],[5.6,.16,.5],'ivory');g.box([x,2.82,7.5],[2.4,.06,.28],'energy');
  }
  conveyor(g,[-17.5,5.5],[17.5,5.5],2.0,.66);conveyor(g,[-17.5,-1.5],[17.5,-1.5],1.6,.55);
  for(const x of[-16.8,16.8])conduit(g,[[x,.3,-8],[x,2.1,-8],[x,2.1,6.8],[x,.3,6.8]],.12,'gold');
}
function testField(g,b){
  g.box([0,.12,0],[18,.24,12],'concrete');for(const z of[-4.7,4.7])g.box([0,.26,z],[16,.03,.16],'white');for(const x of[-7.8,7.8])g.box([x,.26,0],[.16,.03,9.4],'white');
  for(let z=-3;z<3;z+=1.3)g.box([-4,.39,z],[2.5,.27,.5],'roof');g.roof(3.5,4,.27,[[-.5,0],[0,.65],[.5,0]],'roof',3,0);
  robotUnit(g,0,2.7,.3,.9);robotArm(g,-.5,-2,.3,.68);for(const x of[-7,7]){g.box([x,.8,0],[.2,1.2,.2],'white');g.box([x,.8,2],[.2,1.2,.2],'white');g.box([x,1.42,1],[.28,.16,2.4],'teal');}
}
function robot(g,b){
  if(b.id==='machine')return machining(g,b);if(b.id==='assembly')return assembly(g,b);if(b.id==='testrig')return testField(g,b);
  if(['raw','finished','repair'].includes(b.id))return serviceHangar(g,b,{open:b.id!=='raw',roof:b.id==='finished'?'glass':'roof'});
  office(g,b,b.id==='testcontrol'?'sensor':b.id==='precision'?'data':'office');
}
export function createBuilding(b,p,mats){
  if(p.space)return createSpaceBuilding(b,p,mats);
  const group=new THREE.Group();group.name=b.id;const g=builder(group,mats);
  const orientable=(p.id==='Research_Lab'?['store','service']:p.id==='Metal_Mine'?['repair','parts']:['raw','repair','finished']).includes(b.id),sideways=orientable&&['e','w'].includes(b.door),model=sideways?{...b,w:b.d,d:b.w}:b;
  if(p.id==='Research_Lab')research(g,model);else if(p.id==='Metal_Mine')mine(g,model);else robot(g,model);
  if(orientable)group.rotation.y={s:0,n:PI,e:PI/2,w:-PI/2}[b.door||'s'];g.finish();
  const forms={main:'sculpted-institute-wings',shared:'segmented-research-ring',exc1:'rock-face-cutter',crusher:'armored-jaw-crusher',process:'glazed-refinery',machine:'hexagonal-machining-hall',assembly:'open-exoskeleton-assembly'};
  group.userData={building:b,form:forms[b.id]||`${p.id}-${b.id}`,conceptVersion:'approved-scifi-20261018',motion:[]};
  function mechanism(position,kind,draw,phase=0){const m=new THREE.Group(),mg=builder(m,mats);draw(mg);mg.finish();m.position.fromArray(position);group.add(m);group.userData.motion.push({object:m,kind,phase});}
  if(p.id==='Research_Lab'&&b.id==='shared')mechanism([0,.5,0],'scan',g=>{for(let i=0;i<3;i++){const a=i*PI*2/3;g.beam([Math.cos(a)*1.5,.2,Math.sin(a)*1.5],[Math.cos(a)*2.5,.2,Math.sin(a)*2.5],.08,'gold');g.box([Math.cos(a)*2.5,.3,Math.sin(a)*2.5],[.45,.35,.45],'energy');}});
  if(p.id==='Metal_Mine'&&b.id==='exc1')mechanism([-7.37,1.6,0],'cut',g=>{for(let i=0;i<12;i++){const a=i*PI/6;g.box([0,Math.sin(a)*1.22,Math.cos(a)*1.22],[.42,.28,.38],i%2?'steel':'energy',[a,0,0]);}});
  if(p.id==='Robotics_Facility'&&b.id==='assembly')for(const [i,x]of[-13.05,-4.35,4.35,13.05].entries())mechanism([x-1.9,.28,5.6],'assemble',g=>robotArm(g,0,0,0,1.8,1),i*1.4);
  return group;
}
