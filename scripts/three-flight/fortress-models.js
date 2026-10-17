// Shared detailed architecture; turrets remain separate, authoritative units.
export function createFortressGeometry(Geometry,scale=1,largeSockets=false){
 const g=new Geometry(),stone=[.44,.48,.5],armor=[.62,.65,.65],edge=[.75,.75,.69],dark=[.16,.22,.25],steel=[.29,.36,.39],cyan=[.3,.78,.91],yellow=[.86,.64,.23];
 const hex=(cx,cz,bottom,top,rb,rt,color)=>{
  for(let k=0;k<6;k++){const a=k*Math.PI/3,b=(k+1)*Math.PI/3,p=(r,y,t)=>[cx+Math.cos(t)*r,y,cz+Math.sin(t)*r];
   g.quad(p(rb,bottom,a),p(rt,top,a),p(rt,top,b),p(rb,bottom,b),color);
   g.tri([cx,top,cz],p(rt,top,b),p(rt,top,a),color);
  }
 };
 const part=(rad,tan,y,size,a,color=armor,emission=0)=>g.box(size,[Math.cos(a)*rad-Math.sin(a)*tan,y,Math.sin(a)*rad+Math.cos(a)*tan],color,0,[0,-a,0],emission);
 // Deep foundations, sloped armor belt, recessed roof and stepped cornice.
 hex(0,0,-20,5,113,113,stone);hex(0,0,5,31,113,102,armor);
 hex(0,0,31,35,104,104,dark);hex(0,0,35,38,105,103,edge);
 hex(0,0,38,39,99,99,steel);
 // Raised central heavy-gun citadel and six vertex platforms.
 hex(0,0,39,53,35,30,armor);hex(0,0,53,57,32,32,dark);hex(0,0,57,60,33,33,edge);
 for(let k=0;k<6;k++){
  const a=k*Math.PI/3,side=a+Math.PI/6;
  hex(Math.cos(a)*82,Math.sin(a)*82,37,43,23,20,armor);
  hex(Math.cos(a)*82,Math.sin(a)*82,43,46,21,21,edge);
  // Each facade has framed armored doors, layered ribs and a roof parapet.
  part(93,0,18,[3,23,21],side,dark);part(95,0,17,[2,19,15],side,steel);
  part(96,0,17,[1,17,.6],side,dark);
  for(const t of [-12,12]){part(94,t,18,[8,29,4],side,stone);part(98,t,19,[1,19,1.2],side,cyan,1);}
  part(96,0,32,[5,4,30],side,edge);part(98,0,29,[1,1,10],side,yellow);
  for(const t of [-37,-24,24,37]){
   part(93,t,17,[10,29,4],side,stone);part(96,t,26,[6,7,5],side,edge);
   for(const y of [9,15,21])part(98,t,y,[.7,1.1,3],side,dark);
  }
  for(const t of [-31,31])for(const y of [12,23]){
   part(94,t,y,[2,8,8],side,steel);part(95.2,t,y,[.7,6.5,6.5],side,armor);
   for(const bolt of [-2,2])part(95.7,t+bolt,y+2,[.6,.7,.7],side,dark);
  }
  for(const t of [-27,27]){
   part(89,t,41,[5,7,26],side,armor);part(89,t,45,[6,1.5,27],side,edge);
   part(92,t,41,[1,1.2,15],side,cyan,1);
   // Roof utilities and cooling louvers create a readable inhabited base.
   part(64,t,41,[13,5,13],side,stone);
   for(let j=-4;j<=4;j+=2)part(64+j,t,44,[1,1,11],side,dark);
  }
  // Walkway from central keep to the fortified connection portal.
  part(57,0,39.5,[43,1,14],side,dark);
  for(const t of [-8,8])part(57,t,40,[42,.8,.7],side,edge);
  for(let j=0;j<5;j++)part(36+j*4,13,60.2,[2,.4,3],a,yellow);
  // Tiny raised lights / corner armor, no decorative sky-scraper towers.
  part(94,0,48,[4,5,4],a,steel);part(94,0,51,[3,1,3],a,cyan,1);
 }
 const bridge=new Geometry();
 // Keep the original armored architecture, with closed, lit undersides for orbit.
 hex(0,0,-31,-20,74,113,steel);
 for(let k=0;k<6;k++){
  const a=k*Math.PI/3,b=(k+1)*Math.PI/3;
  g.tri([0,-31,0],[Math.cos(a)*74,-31,Math.sin(a)*74],[Math.cos(b)*74,-31,Math.sin(b)*74],dark);
  part(48,0,-31,[15,1,5],a,cyan,1);
  if(largeSockets)hex(Math.cos(a)*82,Math.sin(a)*82,43,46,24/scale,24/scale,edge);
 }
 // Unit-length corridor stretched only along its longitudinal axis.
 bridge.box([1,17,23],[.5,22,0],stone);bridge.box([1,3,25],[.5,32,0],edge);
 bridge.box([1,1,16],[.5,34,0],dark);
 for(const z of [-11,11]){bridge.box([1,6,2],[.5,36,z],armor);bridge.box([1,.6,.5],[.5,39.3,z],cyan,0,[0,0,0],1);}
 // A separate wreck mesh changes the silhouette: collapsed keep, exposed deck,
 // broken wall segments and scattered armor. Deterministic, shared by all views.
 const wreck=new Geometry(),ash=[.19,.19,.18],burnt=[.28,.27,.24],fracture=[.39,.38,.33],metal=[.12,.15,.16];
 for(let k=0;k<6;k++){
  const a=k*Math.PI/3,b=(k+1)*Math.PI/3,p=(r,y,t)=>[Math.cos(t)*r,y,Math.sin(t)*r];
  wreck.quad(p(113,-20,a),p(106,10,a),p(106,10,b),p(113,-20,b),burnt);
  wreck.tri([0,8,0],p(106,10,b),p(106,10,a),ash);
  for(let j=0;j<3;j++){
   const t=a+(j+.5)*Math.PI/9,r=91,h=10+((k*13+j*7)%17);
   if((k+j)%3===0)continue;
   wreck.box([7,h,21],[Math.cos(t)*r,10+h/2,Math.sin(t)*r],fracture,0,[.12,-t,.12]);
   wreck.box([1,h+7,1],[Math.cos(t)*88,10+h/2,Math.sin(t)*88],metal,0,[.15,-t,.22]);
  }
 }
 for(let i=0;i<64;i++){
  const a=i*2.399963,r=16+Math.sqrt((i*37)%101)*8.3,size=5+(i*11)%14;
  wreck.box([size,3+i%7,size*.7],[Math.cos(a)*r,12+(i%3)*2,Math.sin(a)*r],i%3?burnt:fracture,0,[i*.23,a,.15+(i%4)*.17]);
 }
 wreck.box([40,7,34],[-6,20,3],fracture,0,[.3,.4,-.2]);
 wreck.box([24,10,22],[13,15,-10],metal,0,[.1,.8,.4]);
 // Torn approach corridors have no working lamps or intact parapets.
 const brokenBridge=new Geometry();
 brokenBridge.box([1,10,23],[.5,17,0],burnt);
 for(let i=0;i<5;i++)brokenBridge.box([.13,3,18],[.1+i*.2,23,((i%2)*2-1)*3],fracture,0,[.12,0,(i%2?1:-1)*.15]);
 for(const mesh of [g,wreck])for(let i=0;i<mesh.data.length;i+=13)for(let axis=0;axis<3;axis++)mesh.data[i+axis]*=scale;
 for(const mesh of [bridge,brokenBridge])for(let i=0;i<mesh.data.length;i+=13){mesh.data[i+1]*=scale;mesh.data[i+2]*=scale;}
 return {module:g.upload(),bridge:bridge.upload(),wreck:wreck.upload(),brokenBridge:brokenBridge.upload()};
}
