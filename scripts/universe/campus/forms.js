import {THREE,chamfer} from './primitives.js';

// Closed sculpted hulls and real open structural arches. No model is normalized into a box.
export function loft(g,levels,colors='ivory',cap='roof'){
  const triangle=(out,a,b,c)=>out.push(...a,...b,...c);
  for(let j=1;j<levels.length;j++){
    const [y0,p0]=levels[j-1],[y1,p1]=levels[j],v=[];
    for(let i=0;i<p0.length;i++){const k=(i+1)%p0.length,a=[p0[i][0],y0,p0[i][1]],b=[p0[k][0],y0,p0[k][1]],c=[p1[k][0],y1,p1[k][1]],d=[p1[i][0],y1,p1[i][1]];triangle(v,a,d,b);triangle(v,b,d,c);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.computeVertexNormals();g.add(geo,Array.isArray(colors)?colors[j-1]||colors.at(-1):colors);geo.dispose();
  }
  if(cap){const [y,poly]=levels.at(-1),v=[],pts=poly.map(p=>new THREE.Vector2(...p)),faces=THREE.ShapeUtils.triangulateShape(pts,[]);
    for(const [a,b,c]of faces)v.push(poly[a][0],y,poly[a][1],poly[c][0],y,poly[c][1],poly[b][0],y,poly[b][1]);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.computeVertexNormals();g.add(geo,cap);geo.dispose();}
}
const scaled=(p,s)=>p.map(([x,z])=>[x*s,z*s]);
export function armorHull(g,poly,h,{glazing=true,cap='roof'}={}){
  loft(g,[[.04,scaled(poly,.99)],[.23,poly],[h*.28,scaled(poly,.98)],[h*.70,scaled(poly,.95)],[h*.87,scaled(poly,.84)],[h,scaled(poly,.81)]],['dark','ivory',glazing?'glass':'ivory','ivory','roof'],cap);
  // Vertical mullions and broad chamfered corner covers give the glazing a load-bearing frame.
  for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<1)continue;for(let t=0;t<len;t+=3.2){const u=t/len,x=(a[0]+(b[0]-a[0])*u)*.97,z=(a[1]+(b[1]-a[1])*u)*.97;g.beam([x,h*.25,z],[x*.98,h*.72,z*.98],.09,'white');}}
}
export function blockHull(g,x,z,w,d,h,variant='roof'){
  const poly=chamfer(0,0,w,d,Math.min(w,d)*.16).map(([px,pz])=>[px+x,pz+z]);
  // Scaling around the block's own center, instead of dragging offset wings toward the origin.
  const outline=s=>poly.map(([px,pz])=>[x+(px-x)*s,z+(pz-z)*s]);
  loft(g,[[.08,outline(.98)],[h*.22,outline(1)],[h*.68,outline(.96)],[h*.92,outline(.84)],[h,outline(.80)]],['dark','glass','ivory','roof'],variant);
  for(const dx of[-.37,.37])g.beam([x+w*dx,h*.15,z+d*.47],[x+w*dx*.88,h*.78,z+d*.4],.13,'white');
}
export function arcPolygon(rx,rz,inner,start,end,steps=12){
  const p=[];for(let i=0;i<=steps;i++){const a=start+(end-start)*i/steps;p.push([Math.cos(a)*rx,Math.sin(a)*rz]);}for(let i=steps;i>=0;i--){const a=start+(end-start)*i/steps;p.push([Math.cos(a)*rx*inner,Math.sin(a)*rz*inner]);}return p;
}
export function arcBand(g,rx,rz,inner,y,h,start,end,mat='ivory',steps=12){g.extrude(arcPolygon(rx,rz,inner,start,end,steps),h,y,mat,.025);}
export function rib(g,x,width,depth,h,mat='ivory',z=0){
  const t=Math.min(.55,h*.18),outer=[[-depth/2,0],[-depth/2,h*.42],[-depth*.40,h*.83],[-depth*.27,h],[depth*.27,h],[depth*.40,h*.83],[depth/2,h*.42],[depth/2,0]],inner=[[depth/2-t,0],[depth/2-t,h*.38],[depth*.36,h*.72],[depth*.23,h-t],[-depth*.23,h-t],[-depth*.36,h*.72],[-depth/2+t,h*.38],[-depth/2+t,0]],poly=[...outer,...inner];
  const shape=new THREE.Shape();poly.forEach(([pz,py],i)=>i?shape.lineTo(-pz,py):shape.moveTo(-pz,py));shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:false,steps:1,curveSegments:1});geo.rotateY(Math.PI/2);g.add(geo,mat,[x-width/2,0,z]);geo.dispose();
}
export function roofPanels(g,x,width,depth,h,{open=false,glass=true}={}){
  const profile=[[-.5,h*.42],[-.4,h*.83],[-.27,h],[.27,h],[.4,h*.83],[.5,h*.42]];
  // Separate roof patches leave genuine holes above the assembly line.
  for(let i=1;i<profile.length;i++){
    if(open&&(i===3||i===4||i===5))continue;
    const a=profile[i-1],b=profile[i],w=width-.25;
    const v=[x-w/2,a[1],a[0]*depth,x+w/2,b[1],b[0]*depth,x+w/2,a[1],a[0]*depth,x-w/2,a[1],a[0]*depth,x-w/2,b[1],b[0]*depth,x+w/2,b[1],b[0]*depth],geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.computeVertexNormals();g.add(geo,glass&&i===3?'clearGlass':'roof');geo.dispose();
  }
}
export function conduit(g,points,r=.11,mat='gold'){
  for(let i=1;i<points.length;i++)g.beam(points[i-1],points[i],r,mat);
  for(const p of points)g.sphere(p,[r*1.4,r*1.4,r*1.4],'steel');
}
export function hexPortal(g,x,z,w,h,depth=.7,mat='ivory'){
  const t=Math.min(.65,h*.2),outline=[[-w/2,.16],[-w/2,h*.52],[-w*.32,h],[w*.32,h],[w/2,h*.52],[w/2,.16],[w/2-t,.16],[w/2-t,h*.45],[w*.29,h-t],[-w*.29,h-t],[-w/2+t,h*.45],[-w/2+t,.16]];
  const shape=new THREE.Shape();outline.forEach(([px,py],i)=>i?shape.lineTo(px,py):shape.moveTo(px,py));shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,steps:1,curveSegments:1});g.add(geo,mat,[x,0,z]);geo.dispose();
}
export function hexShell(g,x,w,d,h){
  const profile=[[-w/2,h*.52],[-w*.32,h],[w*.32,h],[w/2,h*.52]];
  for(let i=1;i<profile.length;i++){
    const a=profile[i-1],b=profile[i];
    for(const [z0,z1,mat]of[[-d/2,-d*.2,'roof'],[-d*.2,d*.16,i===2?'clearGlass':'roof'],[d*.16,d/2,'ivory']]){
      if(i===2&&z0>0)continue; // Real front inspection opening above the machining cell.
      const p=[x+a[0],a[1],z0],q=[x+a[0],a[1],z1],r=[x+b[0],b[1],z1],s=[x+b[0],b[1],z0],geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([...p,...q,...r,...p,...r,...s],3));geo.computeVertexNormals();g.add(geo,mat);geo.dispose();
    }
  }
}
export function robotUnit(g,x,z,y=0,s=1){
  g.box([x,y+.27*s,z],[1.25*s,.36*s,1.5*s],'dark');
  for(const dx of[-.65,.65])for(const dz of[-.5,.5])g.cylinder([x+dx*s,y+.23*s,z+dz*s],.23*s,.15*s,'roof',[0,0,Math.PI/2]);
  g.extrude(chamfer(x,z,.94*s,1.15*s,.18*s),.55*s,y+.38*s,'white',.02);g.box([x,y+.79*s,z-.59*s],[.65*s,.19*s,.08*s],'glass');g.box([x,y+.96*s,z],[.5*s,.12*s,.65*s],'teal');
}
export function conveyor(g,a,b,width=.9,y=.6){
  const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),angle=-Math.atan2(dz,dx),nx=-dz/len,nz=dx/len;
  g.box([(a[0]+b[0])/2,y,(a[1]+b[1])/2],[len,.16,width],'dark',[0,angle,0]);
  for(const side of[-1,1])g.beam([a[0]+nx*width*.56*side,y+.18,a[1]+nz*width*.56*side],[b[0]+nx*width*.56*side,y+.18,b[1]+nz*width*.56*side],.07,'gold');
  for(let d=.4;d<len;d+=1.1){const x=a[0]+dx*d/len,z=a[1]+dz*d/len;g.box([x,y+.10,z],[.16,.06,width*.9],'steel',[0,angle,0]);}
}
