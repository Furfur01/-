// Geometry extracted verbatim from the user-provided starfighter_model.html.
export function reaperReferenceGeometry(){
function rgb(hex){hex=hex.replace('#','');return [parseInt(hex.slice(0,2),16)/255,parseInt(hex.slice(2,4),16)/255,parseInt(hex.slice(4,6),16)/255]}
const colors={gun:rgb('17202d'),deep:rgb('101722'),carbon:rgb('232d3b'),armor:rgb('667b91'),armor2:rgb('8295a9'),armor3:rgb('a7bacb'),steel:rgb('4e6579'),silver:rgb('bbcad7'),shadow:rgb('111822'),red:rgb('972c37'),scarlet:rgb('d64e50'),redDark:rgb('5b1c28'),glass:rgb('0b202d'),glass2:rgb('132b36'),glassTop:rgb('263b46'),gold:rgb('9c7853'),blue:rgb('1281b7'),cyan:rgb('71dbfa'),white:rgb('d4f6ff'),exhaust:rgb('20b1d4'),black:rgb('080d17'),rust:rgb('bd5055')};
const EM0=[0,0,0], EMRED=[.66,.016,.008], EMCYAN=[.12,1.0,1.65], EMPALE=[.45,1.32,1.55], EMGOLD=[.25,.16,.04];
const meshes={solid:[],glow:[],engine:[]};
function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]}function add(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]}function mul(a,k){return [a[0]*k,a[1]*k,a[2]*k]}function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}function len(a){return Math.hypot(...a)}function unit(a){let s=len(a)||1;return a.map(x=>x/s)}
function vout(bucket,p,n,col,emit,alpha){bucket.push(p[0],p[1],p[2],n[0],n[1],n[2],col[0],col[1],col[2],emit[0],emit[1],emit[2],alpha)}
function tri(a,b,c,col,emit=EM0,alpha=1,bucket='solid'){let n=unit(cross(sub(b,a),sub(c,a)));let out=meshes[bucket];vout(out,a,n,col,emit,alpha);vout(out,b,n,col,emit,alpha);vout(out,c,n,col,emit,alpha)}
function quad(a,b,c,d,col,emit=EM0,alpha=1,bucket='solid'){tri(a,b,c,col,emit,alpha,bucket);tri(a,c,d,col,emit,alpha,bucket)}
function face(points,col,emit=EM0,alpha=1,bucket='solid'){for(let i=1;i<points.length-1;i++)tri(points[0],points[i],points[i+1],col,emit,alpha,bucket)}
function prism(points,offset,col,edgeCol){let top=points.map(p=>add(p,offset));face(top,col);face([...points].reverse(),edgeCol||col);for(let i=0;i<points.length;i++){let j=(i+1)%points.length;quad(points[i],points[j],top[j],top[i],edgeCol||col)}}
function loft(sections,col){let rings=sections.map(q=>{let [z,w,yt,yb]=q,h=yt-yb;return [[-w*.81,yb+h*.18,z],[-w,yb+h*.43,z],[-w*.83,yt-h*.15,z],[-w*.38,yt,z],[w*.38,yt,z],[w*.83,yt-h*.15,z],[w,yb+h*.43,z],[w*.81,yb+h*.18,z]]});face([...rings[0]].reverse(),col);face(rings[rings.length-1],col);for(let s=0;s<rings.length-1;s++)for(let i=0;i<8;i++){let j=(i+1)%8;quad(rings[s][i],rings[s][j],rings[s+1][j],rings[s+1][i],col)}}
function tube(a,b,r,col,emit=EM0,bucket='solid',alpha=1,sides=7){let d=sub(b,a),axis=unit(d),up=Math.abs(axis[1])>.85?[1,0,0]:[0,1,0],u=unit(cross(axis,up)),v=unit(cross(axis,u));let p0=[],p1=[];for(let i=0;i<sides;i++){let ang=i/sides*Math.PI*2,rv=add(mul(u,Math.cos(ang)*r),mul(v,Math.sin(ang)*r));p0.push(add(a,rv));p1.push(add(b,rv))}for(let i=0;i<sides;i++){let j=(i+1)%sides;quad(p0[i],p0[j],p1[j],p1[i],col,emit,alpha,bucket)}face([...p0].reverse(),col,emit,alpha,bucket);face(p1,col,emit,alpha,bucket)}
function path(pts,r,col,emit=EM0,bucket='solid',alpha=1){for(let i=0;i<pts.length-1;i++)tube(pts[i],pts[i+1],r,col,emit,bucket,alpha)}
function outline(pts,r=0.035,color=colors.blue,emit=EMCYAN,closed=false){path(closed?[...pts,pts[0]]:pts,r,color,emit);path(closed?[...pts,pts[0]]:pts,r*2.6,colors.cyan,emit,'glow',.065)}
function block(min,max,col){let [x0,y0,z0]=min,[x1,y1,z1]=max;prism([[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],[0,y1-y0,0],col)}
function plate(points,col,thick=.055,offsetY=0){prism(points.map(p=>[p[0],p[1]+offsetY,p[2]]),[0,thick,0],col)}
function loftCustom(sections,col){ // sections: [z, points[[x,y]..]]
 let rings=sections.map(([z,pts])=>pts.map(p=>[p[0],p[1],z]));for(let k=0;k<rings.length-1;k++)for(let i=0;i<rings[k].length;i++){let j=(i+1)%rings[k].length;quad(rings[k][i],rings[k][j],rings[k+1][j],rings[k+1][i],col)}face([...rings[0]].reverse(),col);face(rings[rings.length-1],col);
}
function wingRing(sign){let out=[[1.48,-.9],[2.12,-1.40],[3.31,-1.67],[4.43,-.68],[4.62,1.98],[4.17,3.92],[2.86,4.80],[1.50,3.55]];
let inn=[[1.94,-.33],[2.30,-.85],[3.12,-1.00],[3.73,-.34],[3.90,1.76],[3.54,3.33],[2.77,4.03],[2.02,3.08]];
let f=(p,yShift=0)=>[sign*p[0],-.80-.125*(p[0]-1.5)+yShift,p[1]];
let topOut=out.map(p=>f(p,.18)),topIn=inn.map(p=>f(p,.18)),bottomOut=out.map(p=>f(p,-.16)),bottomIn=inn.map(p=>f(p,-.16));
for(let i=0;i<out.length;i++){let j=(i+1)%out.length;quad(topOut[i],topOut[j],topIn[j],topIn[i],i%3===0?colors.armor:colors.steel);quad(bottomOut[j],bottomOut[i],bottomIn[i],bottomIn[j],colors.carbon);quad(topOut[j],topOut[i],bottomOut[i],bottomOut[j],colors.armor2);quad(topIn[i],topIn[j],bottomIn[j],bottomIn[i],colors.deep)}
outline(topOut.map(p=>[p[0],p[1]+.04,p[2]]),.048,colors.blue,EMCYAN,true);path(topIn.slice(2,7).map(p=>[p[0],p[1]+.03,p[2]]),.025,colors.armor2);
// wing interior floating micro-engine
const x=sign*3.04,y=-.82,z=1.63;
loftCustom([[-.64,[[x-.17,y-.04],[x+.17,y-.04],[x+.06,y+.14],[x-.06,y+.14]]],[.22,[[x-.4,y-.1],[x+.4,y-.1],[x+.33,y+.33],[x-.33,y+.33]]],[2.02,[[x-.48,y-.18],[x+.48,y-.18],[x+.42,y+.32],[x-.42,y+.32]]],[3.05,[[x-.29,y-.13],[x+.29,y-.13],[x+.17,y+.17],[x-.17,y+.17]]] ],colors.carbon);
plate([[x-.33,y+.34,.26],[x+.32,y+.34,.26],[x+.4,y+.34,1.99],[x-.40,y+.34,1.99]],colors.armor);
for(let i=0;i<4;i++){let zi=.52+i*.42;plate([[x-.39,y+.36,zi],[x+.4,y+.36,zi],[x+.39,y+.36,zi+.11],[x-.39,y+.36,zi+.11]],i%2?colors.shadow:colors.steel,.02)}
// thin red indicator and cyan windows
path([[x-sign*.20,y+.39,2.1],[x-sign*.20,y+.38,2.75]],.032,colors.red,EMRED);
for(let k=0;k<3;k++){let zz=2.0+k*.24;path([[x-sign*.19,y+.36,zz],[x+sign*.05,y+.36,zz+.06]],.035,colors.cyan,EMCYAN)}
// rear nacelle thruster and outer tips
let xt=sign*3.04;block([xt-.26,-.85,3.08],[xt+.26,-.42,3.52],colors.deep);
tube([xt,-.65,3.43],[xt,-.65,3.72],.23,colors.silver);tube([xt,-.65,3.74],[xt,-.65,3.91],.15,colors.cyan,EMPALE,'engine');
// spars connected from fuselage to the framed wings
path([[sign*1.37,-.62,.14],[sign*2.23,-.78,.64],[sign*2.72,-.75,1.16]],.21,colors.deep);
path([[sign*1.39,-.35,2.75],[sign*2.35,-.85,3.32],[sign*2.98,-1.02,3.76]],.20,colors.steel);
path([[sign*1.61,-.22,3.31],[sign*2.3,-.82,3.58],[sign*2.9,-.97,3.83]],.055,colors.armor3);
// hinged armor over spars
plate([[sign*1.34,-.20,1.06],[sign*2.1,-.47,1.42],[sign*2.53,-.62,2.01],[sign*1.63,-.1,1.94]],colors.carbon,.09);
}
// ---------- sculpted ship hull ----------
loft([[-7.9,.13,-.10,-1.04],[-7.26,.55,.53,-1.23],[-6.1,.99,.80,-1.27],[-4.67,1.37,.97,-1.23],[-2.75,1.56,1.03,-1.17],[-.50,1.84,1.24,-1.25],[1.88,1.87,1.34,-1.25],[3.79,1.60,1.05,-1.17],[5.48,1.12,.74,-.94],[6.15,.65,.28,-.58]],colors.gun);
// long keel underside
loft([[-8.12,.13,-.47,-1.12],[-7.76,.48,-.43,-1.68],[-6.91,.73,-.57,-1.73],[-5.28,1.04,-.69,-1.61],[-3.80,1.30,-.76,-1.48],[-1.60,1.40,-.83,-1.20]],colors.redDark);
loft([[-8.15,.10,-.54,-1.18],[-7.76,.39,-.52,-1.65],[-6.98,.62,-.62,-1.67],[-5.4,.91,-.73,-1.55],[-3.88,1.14,-.82,-1.35]],colors.red);
// red angular segmented armor cheeks + inset diagonal black seams
for(let s of [-1,1]){
 let pp=[[-7.90,.25,-1.34],[-7.04,.65,-1.38],[-6.20,.96,-1.34],[-5.19,1.12,-1.24],[-4.02,1.39,-1.11],[-2.65,1.45,-1.02]];
 for(let i=0;i<pp.length-1;i++){let a=pp[i],b=pp[i+1];let p=[[s*a[1],a[2],a[0]],[s*b[1],b[2],b[0]],[s*(b[1]*.90),b[2]+.43,b[0]+.13],[s*(a[1]*.88),a[2]+.44,a[0]-.05]];plate(p,i%2?colors.red:colors.scarlet,.035);if(i>0)path([[s*a[1],a[2]-.05,a[0]],[s*(a[1]*.83),a[2]+.46,a[0]+.30]],.037,colors.black)}
 // steel-gray flanks around nose: segmented mandibles and fins
 let zvals=[-7.44,-6.67,-5.96,-5.22,-4.44,-3.58,-2.7,-1.8];
 for(let i=0;i<zvals.length-1;i++){let z=zvals[i],zn=zvals[i+1],wx=z<-6.8?.65:z<-5.6?.95:z<-4.5?1.13:1.42,wx2=zn<-6.8?.72:zn<-5.6?1.04:zn<-4.5?1.2:1.42;
 plate([[s*wx,.08,z],[s*wx2,.18,zn-.09],[s*(wx2*.93),.53,zn+.13],[s*(wx*.84),.49,z+.17]],i%3===0?colors.armor2:colors.armor,.09);
 path([[s*wx,.035,z],[s*wx2,.15,zn-.02]],.029,colors.shadow)}
 // rear armor cheek contour
 plate([[s*1.46,.64,-2.9],[s*1.80,.75,-1.09],[s*1.70,.88,.96],[s*1.36,.84,2.11],[s*1.21,.75,1.22],[s*1.37,.70,-1.3]],colors.steel,.10);
 // underside jaw stripe
 path([[s*.45,-1.56,-7.55],[s*.90,-1.48,-5.4],[s*1.24,-1.18,-3.4]],.044,colors.rust);
}
// canopy: tapered dark window nested over forward sloped hull
loft([[-7.82,.12,.50,.22],[-7.40,.41,.79,.36],[-6.71,.66,1.03,.50],[-5.23,.77,1.29,.70],[-4.36,.68,1.37,.86],[-3.62,.36,1.33,1.01],[-3.20,.17,1.24,1.10]],colors.glass);
// glass top plate glints and titanium windshield border
plate([[-.22,.86,-7.16],[.22,.86,-7.16],[.54,1.16,-5.75],[.46,1.31,-4.61],[-.46,1.31,-4.61],[-.54,1.16,-5.75]],colors.glassTop,.015);
for(let s of [-1,1]){
path([[s*.12,.53,-7.81],[s*.43,.84,-7.27],[s*.68,1.08,-6.5],[s*.78,1.31,-5.15],[s*.64,1.42,-4.28],[s*.24,1.39,-3.52]],.070,colors.armor2);
path([[s*.14,.66,-7.67],[s*.42,.92,-7.05],[s*.59,1.12,-6.18]],.018,colors.gold,EMGOLD);
path([[s*.54,1.30,-4.64],[s*.44,1.40,-4.00]],.04,colors.deep);
}
// central black reflective inset and visor rim
plate([[-.15,.955,-7.00],[.15,.955,-7.00],[.37,1.20,-5.75],[.21,1.30,-5.13],[-.21,1.30,-5.13],[-.37,1.20,-5.75]],colors.glass,.014);
path([[-.35,1.42,-5.75],[0,1.47,-5.35],[.35,1.42,-5.75]],.055,colors.scarlet);
// armored dorsal spinal plating
loft([[-3.43,.40,1.34,.90],[-2.90,.87,1.51,.91],[-1.37,1.03,1.68,.98],[.46,.95,1.61,1.09],[1.90,.75,1.39,1.04],[2.84,.65,1.25,.95]],colors.armor);
for(let i=0;i<6;i++){
 let z=-3.0+i*.90, w=i<3?.91: .88-(i-3)*.10;
 plate([[-w*.72,1.49-(i>3?.12:0),z],[w*.72,1.49-(i>3?.12:0),z],[w*.76,1.46-(i>3?.12:0),z+.39],[-w*.76,1.46-(i>3?.12:0),z+.39]],i%2?colors.armor2:colors.armor3,.025);
 for(let s of [-1,1])path([[s*.84,1.40-(i>3?.10:0),z],[s*.89,1.40-(i>3?.10:0),z+.33]],.024,colors.shadow);
}
// layered, sharply faceted twin dorsal stabilizers
for(let s of [-1,1]){
function fp(z,y,side=.13){return [s*(.86+Math.max(0,y-1.3)*.21+side),y,z]}
let outer=[[.20,1.23],[1.30,2.55],[2.75,3.84],[5.70,4.35],[5.45,3.80],[3.98,2.77],[4.30,2.22],[2.93,1.50],[1.50,1.20]];
prism(outer.map(p=>fp(p[0],p[1],-.16)),[s*.37,0,0],colors.deep,colors.shadow);
// large silver swept outer panel
prism([[1.16,2.37],[2.91,3.77],[5.49,4.19],[4.66,3.34],[3.23,2.76],[2.14,2.04]].map(p=>fp(p[0],p[1],.23)),[s*.06,0,0],colors.armor,colors.steel);
prism([[2.81,3.36],[4.87,4.01],[5.35,4.14],[4.57,3.45],[3.54,2.99]].map(p=>fp(p[0],p[1],.31)),[s*.055,0,0],colors.armor3);
// inset dark triangular engine brace
prism([[1.48,1.62],[2.52,2.59],[3.69,2.91],[3.0,1.71]].map(p=>fp(p[0],p[1],.25)),[s*.055,0,0],colors.shadow);
// long red inlaid stripe and cyan rim on blade silhouette
path([[1.56,2.31],[2.97,3.48],[5.31,4.19]].map(p=>fp(p[0],p[1],.345)),.069,colors.red,EMRED);
outline([[.33,1.35],[1.30,2.58],[2.78,3.84],[5.71,4.35],[5.48,3.78]].map(p=>fp(p[0],p[1],.215)),.037,colors.blue,EMCYAN);
// bolted lower fin strakes
for(let k=0;k<5;k++){let z=2+k*.43;path([fp(z,1.51,.30),fp(z+.17,1.80,.35)],.041,colors.steel)}
}
// recessed power-channel machinery along both sides
for(let s of [-1,1]){
 block([s<0?-1.87:1.47,-.42,-3.18],[s<0?-1.47:1.87,.45,3.73],colors.deep);
 path([[s*1.61,.54,-3.5],[s*1.73,.55,-2.9],[s*1.77,.64,-.30],[s*1.69,.55,2.3],[s*1.58,.33,4.25]],.21,colors.carbon);
 path([[s*1.82,.15,-2.35],[s*1.86,.20,-.5],[s*1.8,.24,1.7]],.067,colors.armor3);
 for(let j=0;j<8;j++){
 let z=-2.55+j*.62;
 plate([[s*1.76,.55,z],[s*1.86,.51,z+.05],[s*1.87,.51,z+.24],[s*1.73,.59,z+.21]],j%2?colors.armor2:colors.steel,.035);
 if(j%2===0)path([[s*1.87,-.03,z+.29],[s*1.9,.19,z+.35]],.047,colors.red,EMRED)
 }
 // side silver pipes and their forward split armor
 path([[s*1.34,.37,-4.33],[s*1.70,.29,-3.72],[s*2.13,.30,-2.14],[s*2.37,.30,-.8],[s*1.84,.55,.73]],.084,colors.armor2);
 path([[s*1.42,.05,-4.26],[s*1.54,-.01,-3.11],[s*1.68,.04,-1.8]],.094,colors.deep);
 // small glowing vents along central rear panel
 for(let i=0;i<3;i++){let z=1.06+i*.36;path([[s*1.92,-.09,z],[s*2.06,-.11,z+.11]],.049,colors.cyan,EMCYAN,'engine')}
}
// rear fuselage reactors and architectural tail
loft([[4.42,1.43,.72,-.89],[5.85,1.31,.52,-.68],[6.54,1.04,.25,-.56]],colors.carbon);
for(let s of [-1,1]){
// rear wing-spars and forked tail spikes
prism([[s*1.1,.35,4.43],[s*1.52,.32,4.26],[s*2.57,.24,5.25],[s*2.65,.18,7.50],[s*1.95,.17,7.04],[s*1.07,.40,5.67]],[0,.22,0],colors.armor,colors.gun);
plate([[s*1.62,.60,5.37],[s*2.32,.48,5.45],[s*2.44,.40,7.08],[s*1.94,.49,6.67]],colors.armor2,.05);
path([[s*1.91,.65,5.48],[s*2.39,.51,6.94]],.043,colors.red,EMRED);
path([[s*2.61,.35,6.17],[s*2.68,.35,7.53]],.037,colors.blue,EMCYAN);
// tail engine cylinder
let x=s*.79;
tube([x,-.19,6.03],[x,-.19,6.53],.49,colors.shadow);
tube([x,-.19,6.40],[x,-.19,6.57],.36,colors.armor2);
tube([x,-.19,6.59],[x,-.19,6.65],.28,colors.cyan,EMPALE,'engine');
for(let k=0;k<8;k++){let a=k*Math.PI/4;path([[x+Math.cos(a)*.39,-.19+Math.sin(a)*.39,6.50],[x+Math.cos(a)*.38,-.19+Math.sin(a)*.38,6.72]],.035,colors.armor3)}
}
// rear centered thruster core
 tube([0,-.42,6.35],[0,-.42,6.72],.30,colors.deep);
 tube([0,-.42,6.73],[0,-.42,6.78],.21,colors.cyan,EMCYAN,'engine');
// both characteristic detached open-loop wings
wingRing(-1);wingRing(1);
// forward weapon hardpoints and white nose-side illuminators
for(let s of [-1,1]){
let x=s*1.84;
block([x-.22,-.46,-.62],[x+.22,-.05,.45],colors.carbon);
loftCustom([[-.74,[[x-.14,-.44],[x+.14,-.44],[x+.08,-.15],[x-.08,-.15]]],[.42,[[x-.36,-.40],[x+.36,-.40],[x+.35,.01],[x-.35,.01]]],[.99,[[x-.28,-.30],[x+.28,-.30],[x+.28,-.08],[x-.28,-.08]]]],colors.steel);
path([[x,-.33,-1.32],[x,-.33,.44]],.115,colors.gun);
tube([x,-.21,-.87],[x,-.21,-.46],.14,colors.armor2);
// cyan 3-slot indicator light beneath cannon
for(let i=0;i<3;i++)path([[x+s*.08*i,-.11,1.19],[x+s*(.09*i+.04),-.05,1.44]],.044,colors.cyan,EMCYAN,'engine');
}
// rear spine conduits, antennae, bolt points
path([[0,1.17,2.40],[0,1.10,4.65],[0,.80,5.62]],.09,colors.red,EMRED);
for(let z=2.2;z<=4.8;z+=.52){path([[-.58,1.20,z],[.58,1.20,z]],.036,colors.shadow)}
// subtle cyan perimeter on main bow edge, just at corners
for(let s of [-1,1]){
path([[s*.25,-.65,-7.92],[s*.56,-.50,-7.48],[s*.89,-.36,-6.32],[s*1.28,-.35,-4.53]],.025,colors.blue,EMCYAN);
}

return meshes;
}
