
/*
 * Minimal, dependency-free WebGL renderer for this interface prototype.
 * All geometry, surface maps, instrument displays and star fields are generated locally.
 * The UI and demo logic live in app.js. No network requests, fonts or model files are used.
 */
'use strict';
window.GalaxyRender = (() => {
  // Keep renderer-side helpers in renderer scope. The app logic has a separate IIFE.
  const isFighter=index=>index===3;
  const isAntimatter=index=>index===5;
  const TAU = Math.PI * 2;
  const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
  const mix = (a,b,t) => a+(b-a)*t;
  const V = {
    add:(a,b)=>a.map((v,i)=>v+b[i]), sub:(a,b)=>a.map((v,i)=>v-b[i]),
    scale:(a,s)=>a.map(v=>v*s), dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
    cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
    length:a=>Math.hypot(...a),
    norm:a=>{let l=Math.hypot(...a)||1;return a.map(v=>v/l)}
  };
  const M = {
    identity:()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),
    mul:(a,b)=>{const c=new Float32Array(16);for(let j=0;j<4;j++)for(let i=0;i<4;i++)c[j*4+i]=a[i]*b[j*4]+a[4+i]*b[j*4+1]+a[8+i]*b[j*4+2]+a[12+i]*b[j*4+3];return c},
    translate:(x,y,z)=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1]),
    scale:(x,y=x,z=x)=>new Float32Array([x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1]),
    rx:a=>{let c=Math.cos(a),s=Math.sin(a);return new Float32Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1])},
    ry:a=>{let c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1])},
    rz:a=>{let c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1])},
    compose:(pos=[0,0,0],rot=[0,0,0],scale=[1,1,1])=>M.mul(M.translate(...pos),M.mul(M.ry(rot[1]),M.mul(M.rx(rot[0]),M.mul(M.rz(rot[2]),M.scale(...scale))))),
    transform:(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]],
    perspective:(fov,aspect,near,far,offset=0)=>{let f=1/Math.tan(fov/2),nf=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,offset,0,(far+near)*nf,-1,0,0,2*far*near*nf,0])},
    lookAt:(eye,target,up=[0,1,0])=>{let z=V.norm(V.sub(eye,target)),x=V.norm(V.cross(up,z)),y=V.cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-V.dot(x,eye),-V.dot(y,eye),-V.dot(z,eye),1])},
    camera:(pos,forward,up)=>{let z=V.scale(forward,-1),x=V.norm(V.cross(up,z)),y=V.cross(z,x);return new Float32Array([...x,0,...y,0,...z,0,...pos,1])}
  };
  function seeded(seed=123){return()=>{seed=(Math.imul(1664525,seed)+1013904223)|0;return(seed>>>0)/4294967296}}
  function rgb(hex){return[(hex>>16&255)/255,(hex>>8&255)/255,(hex&255)/255]}
  const C={hull:rgb(0xb5b4ab),light:rgb(0xd1d0c5),shade:rgb(0x828a8b),dark:rgb(0x26333a),inner:rgb(0x111d23),steel:rgb(0x5e6b6e),red:rgb(0x73423b),window:rgb(0xe2dbc1),blue:rgb(0x87cddf)};

  class Geometry {
    constructor(){this.data=[]}
    vertex(p,n,c,e,tag,uv){this.data.push(...p,...n,...c,e,tag,...uv)}
    tri(a,b,c,color=C.hull,emission=0,tag=0,normals=null,uvs=null){
      const n=V.norm(V.cross(V.sub(b,a),V.sub(c,a)));
      [a,b,c].forEach((p,i)=>this.vertex(p,normals?normals[i]:n,color,emission,tag,uvs?uvs[i]:[0,0]));return this;
    }
    quad(a,b,c,d,color,emission=0,tag=0){this.tri(a,b,c,color,emission,tag,null,[[0,0],[1,0],[1,1]]);this.tri(a,c,d,color,emission,tag,null,[[0,0],[1,1],[0,1]]);return this}
    box(size,pos,color=C.hull,tag=0,rotation=[0,0,0],emission=0){
      const [x,y,z]=size.map(n=>n/2),mat=M.compose(pos,rotation);
      const p=[[-x,-y,-z],[x,-y,-z],[x,y,-z],[-x,y,-z],[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]].map(p=>M.transform(mat,p));
      [[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[0,1,5,4],[3,7,6,2]].forEach(f=>this.quad(...f.map(i=>p[i]),color,emission,tag));return this;
    }
    hull(sections,pos=[0,0,0],color=C.hull,tag=0){
      const rings=sections.map(([x,w,h])=>{const c=Math.min(w,h)*.20;return [[h/2,-w/2+c],[h/2,w/2-c],[h/2-c,w/2],[-h/2+c,w/2],[-h/2,w/2-c],[-h/2,-w/2+c],[-h/2+c,-w/2],[h/2-c,-w/2]].map(([y,z])=>[x+pos[0],y+pos[1],z+pos[2]])});
      for(let i=0;i<rings.length-1;i++)for(let j=0;j<8;j++){let k=(j+1)%8;this.quad(rings[i][j],rings[i][k],rings[i+1][k],rings[i+1][j],color,0,tag)}
      for(let i=1;i<7;i++){this.tri(rings[0][0],rings[0][i+1],rings[0][i],color,0,tag);let r=rings.at(-1);this.tri(r[0],r[i],r[i+1],color,0,tag)}return this;
    }
    chamfer(size,pos,color=C.hull,tag=0){let[x,y,z]=size,b=Math.min(x,y,z)*.18;return this.hull([[-x/2,z-b*2,y-b*2],[-x/2+b,z,y],[x/2-b,z,y],[x/2,z-b*2,y-b*2]],pos,color,tag)}
    cylinder(r,len,pos,color=C.steel,segments=14,tag=0,emission=0,r2=r){
      let [x,y,z]=pos;
      for(let i=0;i<segments;i++){let a=TAU*i/segments,b=TAU*(i+1)/segments;const p=[x-len/2,y+Math.sin(a)*r,z+Math.cos(a)*r],q=[x-len/2,y+Math.sin(b)*r,z+Math.cos(b)*r],s=[x+len/2,y+Math.sin(b)*r2,z+Math.cos(b)*r2],t=[x+len/2,y+Math.sin(a)*r2,z+Math.cos(a)*r2];this.quad(p,q,s,t,color,emission,tag);this.tri([x-len/2,y,z],q,p,color,emission,tag);this.tri([x+len/2,y,z],t,s,color,emission,tag)}return this;
    }
    beam(a,b,width,depth,color=C.dark){
      const dir=V.sub(b,a),len=V.length(dir),unit=V.norm(dir),ref=Math.abs(unit[1])>.95?[1,0,0]:[0,1,0],right=V.norm(V.cross(unit,ref)),up=V.cross(right,unit);
      const p=[];[a,b].forEach(p0=>[[-1,-1],[-1,1],[1,1],[1,-1]].forEach(([u,v])=>p.push(V.add(p0,V.add(V.scale(right,u*width/2),V.scale(up,v*depth/2))))));
      [[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]].forEach(f=>this.quad(...f.map(i=>p[i]),color));return this;
    }
    sphere(radius=1,cols=56,rows=28){
      const point=(i,j)=>{let a=i/cols*TAU,b=j/rows*Math.PI;return[Math.sin(b)*Math.cos(a),Math.cos(b),Math.sin(b)*Math.sin(a)]};
      for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){let n=[point(i,j),point(i+1,j),point(i+1,j+1),point(i,j+1)],p=n.map(v=>V.scale(v,radius));this.tri(p[0],p[1],p[2],C.hull,0,0,[n[0],n[1],n[2]]);this.tri(p[0],p[2],p[3],C.hull,0,0,[n[0],n[2],n[3]])}return this;
    }
    upload(gl){let data=new Float32Array(this.data),buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);let lines=[];for(let t=0;t<data.length;t+=39){for(let [a,b]of[[0,1],[1,2],[2,0]]){lines.push(...data.slice(t+a*13,t+a*13+13));lines.push(...data.slice(t+b*13,t+b*13+13))}}let lineBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,lineBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(lines),gl.STATIC_DRAW);return{buffer,count:data.length/13,lineBuffer,lineCount:lines.length/13};}
  }

  function buildShip(kind){
    const g=new Geometry(),rnd=seeded(416+kind*173),long=kind===1?1.22:kind===2?.76:1,width=kind===1?1.12:kind===2?.73:1;
    const p=(x,y,z)=>[x*long,y,z*width];
    // Continuous octagonal pressure hull, with smaller separately readable armor plates.
    g.hull([[-9.1*long,.95*width,.95],[-7.7*long,3.15*width,2.0],[-4.8*long,4.05*width,2.7],[3.7*long,3.8*width,2.7],[5.9*long,3.15*width,2.15]], [0,0,0],C.hull);
    g.hull([[-8*long,1.9*width,.3],[-6*long,3.5*width,.55],[4.8*long,3.2*width,.45]],p(0,-1.45,0),C.dark);
    for(let side of[-1,1]){
      g.hull([[-5.2*long,.66,.6],[-3.7*long,1.05,1.05],[4.5*long,1.05,1.05],[5.8*long,.64,.68]],p(0,-.45,side*2.18),C.dark);
      for(let i=0;i<8;i++){
        const x=-5.9+i*1.36;
        g.chamfer([1.25*long,1.55,.24],p(x,.08,side*1.99),i===2||i===6?C.red:C.light);
        g.box([.045,.95,.018],p(x-.5,.04,side*2.124),C.dark);
        g.box([.35,.09,.031],p(x+.2,-.33,side*2.135),C.steel);
        g.box([.24,.063,.03],p(x+.12,.52,side*2.14),C.window,0,[0,0,0],.78);
      }
      for(let i=0;i<7;i++){g.box([.14,.8,.38],p(-3.6+i*1.24,-.4,side*2.3),C.steel);g.box([.3,.085,.025],p(-7.25+i*.42,.03,side*(1.12+i*.093)),C.window,0,[0,0,0],.7)}
      g.chamfer([4.7*long,.66,1.02],p(2.55,1.4,side*1.9),C.hull);
      for(let i=0;i<7;i++)g.box([.18,.14,.78],p(.7+i*.58,1.77,side*1.9),C.dark);
      g.box([4.4*long,.12,.1],p(1.8,1.9,side*1.64),C.red);
    }
    for(let i=0;i<9;i++){
      const x=-6.5+i*1.34;
      for(let side of[-1,1]){
        const z=side*.8;g.chamfer([1.23*long,.2,1.33*width],p(x,1.46,z),i===3||i===7?C.red:(i%3===0?C.hull:C.light));
        g.box([.64*long,.026,.035],p(x,1.575,z),C.dark);
        if(i%2===0)for(let k=0;k<4;k++)g.box([.11,.04,.25],p(x-.27+k*.16,1.6,z),C.steel);
      }
    }
    // Recessed bow seams and navigation lights.
    g.chamfer([1.8*long,.44,1.55],p(-7.75,.83,0),C.light);
    g.box([.046,.4,.47],p(-9.115,.07,0),C.inner);
    for(let s of[-1,1]){g.box([.06,.25,.065],p(-9.135,.06,s*.23),C.window,0,[0,0,0],1);g.box([1.8*long,.07,.08],p(-6.7,-.48,s*1.31),C.red)}
    // Command island, armored bridge and aerials.
    g.chamfer([3.35*long,.75,1.68*width],p(1.65,1.84,0),C.dark);
    g.chamfer([2.35*long,.62,1.35*width],p(1.1,2.42,0),C.light);
    g.chamfer([1.08*long,.78,.71],p(2.24,2.8,0),C.hull);
    for(let s of[-1,1]){g.box([1.4*long,.09,.025],p(.73,2.49,s*.682),C.window,0,[0,0,0],.85);g.box([.3,.04,.035],p(2.4,3.15,s*.37),C.blue,0,[0,0,0],.75)}
    g.box([.11,2.1,.1],p(2.3,4.05,0),C.steel);g.box([.07,1.23,.08],p(1.63,3.7,.15),C.shade);g.box([.08,.08,.88],p(2.3,4.28,0),C.dark);g.box([.08,.06,.5],p(2.3,4.6,0),C.steel);
    // Visible weapon housings. Tags are used by the archive's weapon hover state.
    function turret(x,y,z,tag,big=false){g.cylinder(.56,.21,p(x,y,z),C.dark,12,tag);g.chamfer([big?1.4:1.05,.46,.78],p(x,y+.24,z),C.shade,tag);for(let s of[-1,1]){g.cylinder(big?.11:.073,big?2.1:1.3,p(x-(big?1.28:.94),y+.22,z+s*.19),C.steel,8,tag);g.cylinder(.115,.16,p(x-(big?2.3:1.58),y+.22,z+s*.19),C.inner,8,tag)}}
    if(kind===2){turret(-4.95,1.72,0,1,true);turret(-1.9,1.74,0,2);turret(4.1,1.78,0,3,true);}
    for(let s of[-1,1]){g.chamfer([1.4,.4,.72],p(-1,-.72,s*2.61),C.hull,2);g.cylinder(.075,1.66,p(-2.17,-.72,s*2.65),C.steel,8,2)}
    // Four independent engine bells, armor rings and pale blue emissive throats.
    const engines=kind===2?[-1,1]:[-1,1];
    for(let sy of(kind===2?[0]:[-1,1]))for(let sz of engines){
      let y=sy*1.05,z=sz*1.82*width;
      g.box([2.7*long,.4,.48],[5.1*long,y,z*.78],C.steel,4);
      g.cylinder(.91,2.7,[6.35*long,y,z],C.hull,16,4);
      g.cylinder(.925,.51,[6.25*long,y,z],C.red,16,4);
      g.cylinder(.99,.25,[5.16*long,y,z],C.steel,16,4);
      g.cylinder(.95,.19,[7.74*long,y,z],C.steel,16,4);
      g.cylinder(.78,.035,[7.85*long,y,z],C.inner,24,4);
      g.cylinder(.47,.041,[7.88*long,y,z],rgb(0x68bbd5),24,4,.9);
      g.cylinder(.23,.047,[7.91*long,y,z],rgb(0xc7e6df),20,4,1);
      for(let a=0;a<8;a++){let angle=a/8*TAU;g.box([1.95*long,.12,.13],[6.38*long,y+Math.sin(angle)*.9,z+Math.cos(angle)*.9],C.steel,4,[angle,0,0])}
    }
    // Small service modules add scale without relying on imported textures.
    for(let i=0;i<24;i++){let x=-4+rnd()*8,z=(rnd()-.5)*2.8;g.box([.18+rnd()*.48,.08+rnd()*.17,.16+rnd()*.23],p(x,1.67,z),rnd()>.4?C.steel:C.dark)}
    if(kind===1){for(let s of[-1,1])g.chamfer([6,.9,1.1],p(1.3,-.4,s*2.95),C.shade)}
    return g;
  }


  // Native ship geometry points along -X. Flight-local geometry points along -Z.
  // Mounts, muzzle locations and bridge eyes are shared with the simulation.
  const LAYOUTS = [
    {scale:1.55, bridge:[0,3.22,.1], chase:[11,18,55], focus:[0,0,-100],
     main:[[-9.35,.05,-.36],[-9.35,.05,.36]],
     tubes:[[-1,1.91,-1.45],[-.2,1.91,1.45],[.65,1.91,-1.45],[1.5,1.91,1.45]],
     mounts:[[-5,1.76,-1.05],[-5,1.76,1.05],[2.6,1.7,-2.53],[2.6,1.7,2.53]], engines:[[7.95,-1.05,-1.82],[7.95,-1.05,1.82],[7.95,1.05,-1.82],[7.95,1.05,1.82]], turretScale:.85},
    {scale:1.9, bridge:[0,3.22,.1], chase:[21,22,58], focus:[0,2,-175],
     main:[[-11.35,.05,-.4],[-11.35,.05,.4]], tubes:[[-1,1.92,-1.5],[-1,1.92,1.5],[0,1.92,-1.5],[0,1.92,1.5],[1,1.92,-1.5],[1,1.92,1.5]],
     mounts:[[-6.15,1.76,-1.1],[-6.15,1.76,1.1],[-2,1.8,0],[3.3,1.8,-2.7],[3.3,1.8,2.7],[5,1.8,0]], engines:[[9.5,-1.05,-2.04],[9.5,-1.05,2.04],[9.5,1.05,-2.04],[9.5,1.05,2.04]],turretScale:.9},
    {scale:.72,bridge:[0,3.15,.1],chase:[5,9,26],focus:[0,0,-17],main:[[-7.0,.1,-.4],[-7,.1,.4]],tubes:[[-1,1.9,-.9],[-1,1.9,.9]],mounts:[],engines:[[6.1,0,-1.33],[6.1,0,1.33]],turretScale:.65},
    {scale:.55,bridge:[0,1.88,.05],chase:[3.8,3.6,9.2],focus:[0,.4,-4.5],main:[[-4.67,.89,-2.19]],tubes:[[-.99,-.63,-1.13],[-.99,-.63,1.13]],mounts:[],engines:[[4.14,.8875,-1.51],[4.14,.8875,1.51]],turretScale:.6},
    {scale:2.65,bridge:[0,4.6,3.2],chase:[22,26,95],focus:[0,0,-170],
     main:[[-12.9,.15,-.52],[-12.9,.15,.52]],
     tubes:[[-3,2.35,-2],[-3,2.35,2],[-2.3,2.35,-2],[-2.3,2.35,2],[-1.6,2.35,-2],[-1.6,2.35,2],[-.9,2.35,-2],[-.9,2.35,2]],
     mounts:[[-7.4,2.22,-1.6],[-7.4,2.22,1.6],[-.4,2.4,-2.75],[-.4,2.4,2.75],[4.0,1.85,-4.1],[4.0,1.85,4.1],[7.8,2.05,-3.15],[7.8,2.05,3.15]],
     engines:[[10.75,-.8,-2.7],[10.75,-.8,2.7],[10.75,1.15,-2.7],[10.75,1.15,2.7],[10.9,.1,0]],turretScale:1.1},
    {scale:1.35,bridge:[.6,.48,0],chase:[4.2,2.1,18.5],focus:[0,0,-26],
     main:[[-6.9,.03,0]],tubes:[[0,0,0]],mounts:[],
     engines:[[7.1,0,-.76],[7.1,0,.76],[7.58,0,0]],turretScale:.5}
  ];
  // HF-01: a connected forked airframe. Local axes: nose -X, up +Y, port -Z.
  // Loft sections are [x, width, bottom, top]. Structural parts intersect at their roots.
  // No visual 'exploded view' offsets: archive and combat use this exact same mesh.
  function buildFighter(){
    const g=new Geometry();
    const P={armor:rgb(0x495a6b),top:rgb(0x576b7d),edge:rgb(0x82929e),side:rgb(0x35424e),
      dark:rgb(0x263340),joint:rgb(0x141f29),black:rgb(0x0b141d),steel:rgb(0x425465),
      glass:rgb(0x142b3a),blue:rgb(0x42d7f4),core:rgb(0xa6f3ff),red:rgb(0x923c45),redLight:rgb(0xf05251)};
    const tint=(c,s)=>c.map(v=>v*s);
    const parts=[];
    function part(name,fn){const start=g.data.length;fn();const end=g.data.length;
      let min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
      for(let i=start;i<end;i+=13)for(let k=0;k<3;k++){min[k]=Math.min(min[k],g.data[i+k]);max[k]=Math.max(max[k],g.data[i+k]);}
      parts.push({name,start,count:(end-start)/13,min,max});
    }
    function loft(sections,z,color=P.armor,tag=0,b=.13,emission=0){
      const rings=sections.map(([x,w,y0,y1])=>{const by=Math.min(b,(y1-y0)*.3),bz=Math.min(b,w*.22);
        return [[x,y1,z-w/2+bz],[x,y1,z+w/2-bz],[x,y1-by,z+w/2],[x,y0+by,z+w/2],
          [x,y0,z+w/2-bz],[x,y0,z-w/2+bz],[x,y0+by,z-w/2],[x,y1-by,z-w/2]];});
      const faceTint=[1.04,1.13,.8,.77,.66,.73,.88,1.13];
      for(let i=0;i<rings.length-1;i++)for(let j=0;j<8;j++){let k=(j+1)%8;
        g.quad(rings[i][j],rings[i][k],rings[i+1][k],rings[i+1][j],tint(color,faceTint[j]),emission,tag);}
      for(let j=1;j<7;j++){g.tri(rings[0][0],rings[0][j+1],rings[0][j],tint(color,.7),emission,tag);
        const last=rings.at(-1);g.tri(last[0],last[j],last[j+1],tint(color,.85),emission,tag);}
    }
    function block(x0,x1,y0,y1,z,w,c=P.armor,tag=0,b=.055,em=0){
      let e=Math.min(b,(x1-x0)*.23,(y1-y0)*.23,w*.23);
      loft([[x0,w-2*e,y0+e,y1-e],[x0+e,w,y0,y1],[x1-e,w,y0,y1],[x1,w-2*e,y0+e,y1-e]],z,c,tag,e,em);
    }
    function quad(points,c,em=0,tag=0){g.quad(...points,c,em,tag)}
    function ring(x,z,y,w,h,innerW,innerH,c,tag=4){
      function oct(W,H){const a=W/2,b=H/2,k=Math.min(W,H)*.19;return [[x,y+b,z-a+k],[x,y+b,z+a-k],[x,y+b-k,z+a],[x,y-b+k,z+a],[x,y-b,z+a-k],[x,y-b,z-a+k],[x,y-b+k,z-a],[x,y+b-k,z-a]];}
      const out=oct(w,h),inn=oct(innerW,innerH);
      for(let j=0;j<8;j++){const k=(j+1)%8;g.quad(out[j],inn[j],inn[k],out[k],c,0,tag);}
    }
    // A continuous pressure hull connects the two forward booms, engine cradles and weapon bed.
    part('keel',()=>loft([[-3.12,.76,-.56,-.08],[-2.1,1.55,-.65,.19],[-.55,2.65,-.67,.76],[1.8,2.85,-.63,.88],[3.46,2.25,-.52,.6]],0,P.dark));
    part('center deck',()=>loft([[-2.46,.9,-.23,.34],[-1.45,1.43,-.24,.75],[-.22,1.65,-.3,1.21],[1.6,1.7,-.28,1.35],[3.35,1.7,-.2,.95]],0,P.armor));
    part('cross-member',()=>block(-.18,1.75,-.55,.28,0,5.05,P.dark,0,.1));
    part('rear cross-member',()=>block(2.1,3.48,-.36,.48,0,5.05,P.side,0,.08));
    for(let s of[-1,1]){
      const z=s*1.64,tag=s<0?'port':'starboard';
      // Long tapered forks: one closed connected volume each; top plates lie on the volume.
      part(tag+' fork',()=>loft([[-6.18,.5,-.49,.05],[-5.6,.66,-.52,.16],[-3.72,1.07,-.55,.46],[-1.63,1.38,-.58,.73],[.35,1.58,-.53,1.03],[.91,1.62,-.47,1.1]],z,P.armor));
      const spans=[[-6.12,-3.79,.513,1.055,.073,.461],[-3.7,-1.7,1.073,1.369,.486,.74],[-1.61,.4,1.382,1.584,.756,1.054]];
      spans.forEach(([a,b,wa,wb,ya,yb],i)=>part(tag+' fork panel '+i,()=>{
        quad([[a,ya,z-wa/2+.105],[b,yb,z-wb/2+.115],[b,yb,z+wb/2-.115],[a,ya,z+wa/2-.105]],i===0?P.top:(i===1?tint(P.top,.95):tint(P.top,.9)));
        // Panel seam is on the top surface, with no floating strips.
        quad([[b-.022,yb-.0005,z-wb/2+.12],[b+.015,yb+.003,z-wb/2+.12],[b+.015,yb+.003,z+wb/2-.12],[b-.022,yb-.0005,z+wb/2-.12]],P.joint);
      }));
      part(tag+' tip recess',()=>{block(-6.2,-6.164,-.405,-.025,z,.365,P.black,0,.012);
        block(-6.222,-6.193,-.365,-.318,z,.275,P.blue,0,.009,1);});
      // Three lights fitted to the inner vertical wall of each fork.
      for(let i=0;i<3;i++)part(tag+' inset '+i,()=>{
        const x=-4.7+i*.34,w=.66+(x+5.6)/1.88*(1.07-.66),zz=z-s*(w/2+.016),top=.16+(x+5.6)/1.88*.30;
        quad([[x-.06,top-.105,zz],[x+.06,top-.087,zz],[x+.06,top-.33,zz],[x-.06,top-.345,zz]],P.blue,1);
      });
      // Lower rails attach at a wide saddle under the fork, then terminate in visible recessed tips.
      part(tag+' rail saddle',()=>block(-1.72,.9,-.91,-.33,s*2.03,.58,P.side,0,.08));
      part(tag+' rail',()=>loft([[-5.86,.15,-.8,-.61],[-2.08,.23,-.8,-.6],[-1.56,.37,-.82,-.45],[.74,.39,-.78,-.36]],s*2.21,P.steel,0,.045));
      part(tag+' rail tip',()=>{block(-5.91,-5.84,-.792,-.612,s*2.21,.166,P.joint,0,.014);
        block(-5.927,-5.897,-.747,-.654,s*2.21,.092,P.blue,0,.008,1);});
      // Broad swept shoulder covers the fork root and intersects the engine nacelle.
      part(tag+' shoulder',()=>loft([[-.53,1.62,-.53,1.03],[.14,1.75,-.55,1.34],[1.14,1.76,-.52,1.5],[2.12,1.57,-.42,1.18]],z,P.armor,0,.2));
      part(tag+' shoulder collar',()=>loft([[-.57,1.65,-.55,1.06],[-.43,1.69,-.56,1.13],[.15,1.79,-.56,1.39],[.3,1.78,-.55,1.4]],z,P.side,0,.16));
      // Octagonal, boxy engine pods with a large sloped front and a recessed exhaust.
      part(tag+' engine',()=>loft([[.44,1.47,-.21,1.61],[1.14,1.85,-.3,2.22],[2.5,1.88,-.25,2.14],[3.45,1.65,-.17,1.93],[3.94,1.42,-.08,1.77]],s*1.51,P.side,4,.31));
      part(tag+' engine front armor',()=>loft([[.56,1.39,1.702,1.757],[1.18,1.62,2.207,2.262],[1.92,1.62,2.166,2.221]],s*1.51,P.top,4,.018));
      part(tag+' engine crown',()=>loft([[1.98,1.78,1.98,2.179],[2.46,1.8,1.935,2.151],[3.27,1.53,1.765,1.986]],s*1.51,P.armor,4,.055));
      part(tag+' exhaust armor',()=>loft([[3.57,1.65,-.08,1.87],[3.84,1.7,-.08,1.87],[4.08,1.43,.045,1.73]],s*1.51,P.dark,4,.25));
      part(tag+' exhaust opening',()=>{
        ring(4.087,s*1.51,.8875,1.43,1.685,1.09,1.32,P.steel);
        loft([[4.075,.99,.245,1.49],[4.096,.99,.245,1.49]],s*1.51,P.black,4,.175);
        loft([[4.096,.84,.32,1.435],[4.111,.84,.32,1.435]],s*1.51,P.blue,4,.175,1);
        loft([[4.112,.52,.46,1.30],[4.121,.52,.46,1.30]],s*1.51,P.core,4,.135,1);
      });
      // Outer outrigger: swept brace with a solid root, not an isolated beam.
      part(tag+' outrigger root',()=>loft([[.24,1.16,-.42,.22],[.88,1.27,-.5,.44],[3.36,.99,-.31,.48]],s*2.47,P.dark,0,.12));
      part(tag+' outrigger guard',()=>loft([[-.37,.26,-.39,-.04],[1.01,.55,-.24,.57],[3.43,.73,-.12,.55]],s*2.89,P.armor,0,.06));
      part(tag+' outer arm',()=>loft([[-.99,.17,-.56,-.36],[.55,.27,-.54,-.31],[1.28,.62,-.46,-.12],[2.92,.59,-.33,.08]],s*3.18,P.steel,0,.045));
      part(tag+' outer arm tip',()=>{block(-1.02,-.97,-.552,-.361,s*3.18,.16,P.black,0,.014);
        block(-1.04,-1.013,-.515,-.392,s*3.18,.088,P.blue,0,.008,1);});
      // Discrete launcher under the shoulder, with the simulation muzzle at its open forward end.
      part(tag+' missile housing',()=>block(-.94,1.15,-.86,-.38,s*1.13,.48,P.dark,2,.065));
      part(tag+' missile port',()=>{block(-.962,-.925,-.8,-.45,s*1.13,.355,P.joint,2,.018);
        block(-.975,-.958,-.73,-.65,s*1.13,.215,P.blue,2,.01,.8);});
      // A few service seams follow physical panel surfaces.
      part(tag+' flank seam',()=>{
        g.box([.022,.53,.017],[.88,.67,s*2.402],P.joint);
        g.box([.16,.055,.018],[.98,.3,s*2.406],P.steel);
        g.box([.62,.038,.02],[2.03,.7,s*2.459],P.joint);
      });
    }
    // Red reactor shroud is bolted onto the center deck between the forks.
    part('reactor bed',()=>block(-3.13,-.65,-.11,.39,0,.88,P.joint,0,.08));
    part('reactor shroud',()=>loft([[-3.07,.51,.2,.55],[-2.75,.68,.2,.79],[-1.35,.75,.28,.9],[-.8,.86,.28,1.03]],0,P.dark,0,.09));
    for(let s of[-1,1])for(let i=0;i<3;i++)part('reactor red '+s+' '+i,()=>{
      block(-2.84+i*.47,-2.49+i*.47,.38,.7,s*(.342+i*.012),.035,P.red,0,.009);
      block(-2.78+i*.47,-2.55+i*.47,.48,.56,s*(.366+i*.012),.013,P.redLight,0,.004,.9);
    });
    part('reactor face',()=>{block(-3.092,-3.057,.29,.47,0,.33,P.red,0,.018);block(-3.103,-3.088,.325,.411,0,.25,P.redLight,0,.005,1);});
    part('reactor top stripe',()=>quad([[-2.69,.799,-.05],[-1.34,.915,-.05],[-1.34,.915,.05],[-2.69,.799,.05]],P.red));
    // Low faceted cockpit. Three forward blue slats sit inside a dark fascia.
    part('cockpit base',()=>loft([[-1.24,1.32,.66,1.1],[-.71,1.49,.61,1.61],[.49,1.52,.52,1.67],[2.88,1.17,.48,1.48]],0,P.side,0,.13));
    part('cockpit canopy',()=>loft([[-.5,1.25,1.3,1.56],[.61,1.12,1.32,2.05],[1.73,1.08,1.38,2.09],[2.57,.91,1.2,1.92]],0,P.glass,0,.09));
    part('cockpit roof',()=>loft([[.58,1.22,1.99,2.09],[1.81,1.2,2.02,2.17],[2.65,1.03,1.88,2.03]],0,P.armor,0,.055));
    part('canopy visor frame',()=>loft([[-.55,1.34,1.37,1.55],[-.21,1.34,1.55,1.72],[.0,1.3,1.62,1.76]],0,P.top,0,.045));
    part('forward fascia',()=>block(-1.4,-1.03,.66,1.42,0,1.065,P.joint,0,.045));
    for(let i=0;i<3;i++)part('fascia light '+i,()=>{
      block(-1.415,-1.387,.902+i*.184,.992+i*.184,0,.75,P.blue,0,.018,1);
      block(-1.42,-1.409,.921+i*.184,.944+i*.184,0,.68,P.core,0,.004,.9);
    });
    // Asymmetric port cannon. The receiver overlaps a wide mounting shoe on the port shoulder.
    part('cannon mounting shoe',()=>block(-1.13,.55,.49,.88,-1.92,1.03,P.dark,1,.07));
    part('cannon receiver',()=>loft([[-2.82,.44,.64,1.06],[-2.36,.59,.61,1.23],[.31,.59,.64,1.24],[.76,.48,.67,1.14]],-2.19,P.side,1,.08));
    part('cannon top plate',()=>block(-2.27,.51,1.201,1.3,-2.19,.41,P.armor,1,.027));
    part('cannon barrel',()=>block(-4.48,-2.43,.77,1.01,-2.19,.265,P.steel,1,.04));
    for(let i=0;i<4;i++)part('barrel collar '+i,()=>block(-2.75-i*.22,-2.87-i*.22+.22,.71,1.1,-2.19,.365,P.dark,1,.025));
    part('cannon muzzle',()=>{block(-4.61,-4.34,.725,1.055,-2.19,.335,P.side,1,.032);
      block(-4.631,-4.597,.772,1.007,-2.19,.227,P.black,1,.015);
      block(-4.65,-4.627,.815,.965,-2.19,.135,P.blue,1,.014,1);});
    // Underside closure and structural ribs make the back and bottom usable views too.
    part('belly plate',()=>loft([[-2.53,.82,-.69,-.57],[-.7,1.96,-.76,-.59],[2.52,2.08,-.7,-.55],[3.25,1.53,-.54,-.45]],0,P.side,0,.045));
    for(let x of[-1.03,.38,1.8])part('belly rib '+x,()=>block(x-.07,x+.07,-.79,-.52,0,2.42,P.steel,0,.024));
    part('aft center cap',()=>block(2.9,3.57,.14,.81,0,1.22,P.dark,0,.06));
    for(let i=0;i<3;i++)part('aft vent '+i,()=>block(3.565,3.594,.23+i*.16,.29+i*.16,0,.7,P.blue,4,.012,.8));
    g.parts=parts;
    return g;
  }
  function buildBattleship(){
    const g=new Geometry(),rnd=seeded(88372);
    g.hull([[-12.7,1.2,1.15],[-10.2,3.2,2.5],[-7.9,5.1,3.4],[5.5,5.7,3.6],[9.6,4.7,2.8]],[0,0,0],C.hull);
    g.hull([[-11.9,.65,.4],[-8.8,2.9,.6],[8.7,3.5,.55]],[0,-1.85,0],C.dark);
    for(let side of[-1,1]){
      g.hull([[-6.2,.65,.7],[-3,1.35,1.5],[8.1,1.55,1.8],[9.8,.9,.9]],[0,-.2,side*3.5],C.shade);
      g.chamfer([8.7,.64,1.75],[2.1,1.4,side*3.6],C.light);
      g.hull([[-10.3,.28,.4],[-7,1.3,1.2],[-.4,1.4,1.4],[1.1,.95,.8]],[0,.12,side*2.65],C.dark);
      for(let i=0;i<10;i++){
        const x=-8.15+i*1.73;
        g.chamfer([1.53,2.1,.27],[x,-.05,side*2.7],i===2||i===7?C.red:C.light);
        g.box([.06,1.3,.03],[x-.57,-.05,side*2.85],C.dark);
        g.box([.26,.07,.04],[x+.32,.63,side*2.88],C.window,0,[0,0,0],.8);
        g.chamfer([1.58,.23,1.62],[x,1.87,side*1.5],i===3||i===8?C.red:C.light);
        g.box([.75,.04,.045],[x,2.005,side*1.5],C.steel);
      }
      for(let i=0;i<7;i++){
        g.chamfer([.55,.42,1.35],[-2.4+i*1.45,.28,side*3.9],C.dark);
        g.box([.22,.68,.07],[-2.4+i*1.45,.3,side*4.6],C.steel);
      }
      g.box([6,.1,.18],[4.9,1.82,side*3.8],C.red);
      g.cylinder(.23,7.1,[-9.1,.15,side*.52],C.dark,12,1);
      g.cylinder(.37,.6,[-12.75,.15,side*.52],C.steel,12,1);
      g.cylinder(.2,.03,[-13.065,.15,side*.52],C.blue,12,1,.85);
    }
    // Aft command island: a clear forward bridge eye above the foredeck.
    g.chamfer([6.2,.68,2.9],[3.9,2.16,0],C.dark);
    g.chamfer([3.9,.75,2.35],[4.3,2.82,0],C.hull);
    g.chamfer([2.8,.8,2.65],[4.9,3.54,0],C.light);
    g.box([.09,.2,2.21],[3.44,3.61,0],C.blue,0,[0,0,0],.75);
    g.chamfer([1.3,.86,1.1],[6.1,4.12,0],C.shade);
    g.box([.14,2.1,.12],[6.25,5.52,0],C.steel);
    g.box([.13,.14,2.2],[6.25,6.2,0],C.steel);
    g.box([.12,.1,1.5],[6.25,6.65,0],C.dark);
    for(let side of[-1,1]){
      g.box([1.85,.16,.045],[4.7,3.64,side*1.34],C.blue,0,[0,0,0],.7);
      for(let i=0;i<10;i++)g.box([.2,.08,.3],[2.25+i*.65,2.6,side*1.07],C.steel);
    }
    for(let [x,y,z] of LAYOUTS[4].engines){
      const r=z===0?1.23:1.1;
      g.cylinder(r,3.5,[x-1.65,y,z],C.hull,18,4);
      g.cylinder(r*1.02,.65,[x-1.9,y,z],C.red,18,4);
      g.cylinder(r*1.1,.23,[x-.03,y,z],C.steel,18,4);
      g.cylinder(r*.84,.07,[x+.13,y,z],C.inner,18,4);
      g.cylinder(r*.53,.09,[x+.17,y,z],C.blue,18,4,1);
      g.cylinder(r*.26,.12,[x+.21,y,z],C.window,18,4,1);
    }
    for(let i=0;i<30;i++){let x=-6+rnd()*10,z=(rnd()-.5)*2;g.chamfer([.25+rnd()*.4,.16,.28],[x,2.05,z],C.steel)}
    return g;
  }

  function buildAntimatterMissile(){
    const g=new Geometry();
    const P={shell:rgb(0xc2c3bf),trim:rgb(0x5e707f),dark:rgb(0x16232e),glow:rgb(0x77eaff),core:rgb(0xc3f9ff),red:rgb(0xa14a5f)};
    g.hull([[-7.1,.18,.18],[-5.9,1.05,1.05],[-1.8,1.38,1.38],[2.5,1.45,1.45],[5.2,1.12,1.12],[7.8,.22,.22]],[0,0,0],P.shell);
    g.hull([[-5.4,.32,.32],[-2.2,.86,.86],[2.2,.92,.92],[4.5,.66,.66]],[0,-.68,0],P.dark);
    g.chamfer([3.8,.3,1.75],[-5.1,.08,0],P.trim,1);
    g.cylinder(.18,.34,[-7.28,0,0],P.dark,14,1);
    g.cylinder(.13,.05,[-7.47,0,0],P.glow,14,1,.95);
    for(let side of[-1,1]){
      g.chamfer([2.1,.12,2.9],[-.55,.12,side*1.28],P.trim,2,[0,0,side*.25]);
      g.chamfer([1.5,.1,2.15],[2.15,-.12,side*1.12],P.red,2,[0,0,side*.35]);
      g.chamfer([1.15,1.2,.2],[3.1,.32,side*1.92],P.trim,2,[0,0,side*.2]);
      g.box([.06,.92,.96],[1.65,.22,side*1.55],P.dark,2);
    }
    for(let side of[-1,1]){
      g.chamfer([1.7,1.55,.16],[4.75,side*.58,0],P.trim,3,[0,0,side*Math.PI/4]);
      g.chamfer([1.1,.12,2.2],[5.05,0,side*1.15],P.red,3,[0,0,side*.3]);
    }
    g.cylinder(.82,.22,[.5,0,0],P.trim,18,3);
    g.cylinder(.58,.16,[.5,0,0],P.glow,18,3,.96);
    g.cylinder(.3,.14,[.5,0,0],P.core,18,3,1);
    for(let x of [-2.6,-1.4,-.2,1.0,2.2])g.box([.14,.08,1.72],[x,.78,0],P.trim,0);
    for(let i=0;i<6;i++){let z=(i-2.5)*.44;g.box([.18,.06,.18],[.9,-.88,z],P.glow,0,[0,0,0],.6)}
    for(let side of[-1,1]){
      g.cylinder(.52,1.55,[6.15,0,side*.76],P.trim,16,4,.38);
      g.cylinder(.56,.19,[5.5,0,side*.76],P.red,16,4);
      g.cylinder(.44,.08,[6.92,0,side*.76],P.dark,16,4);
      g.cylinder(.3,.1,[7.03,0,side*.76],P.glow,16,4,1);
      g.cylinder(.15,.13,[7.11,0,side*.76],P.core,16,4,1);
    }
    g.cylinder(.35,1.9,[6.6,0,0],P.trim,16,4,.18);
    g.cylinder(.38,.18,[5.82,0,0],P.red,16,4);
    g.cylinder(.28,.09,[7.52,0,0],P.glow,16,4,1);
    g.cylinder(.14,.12,[7.6,0,0],P.core,16,4,1);
    return g;
  }
  function cylinderY(g,r,h,pos,color=C.dark,tag=0){
    let [x,y,z]=pos;
    for(let i=0;i<20;i++){
      let a=i/20*TAU,b=(i+1)/20*TAU;
      let p=[x+Math.cos(a)*r,y,z+Math.sin(a)*r],q=[x+Math.cos(b)*r,y,z+Math.sin(b)*r],u=[p[0],y+h,p[2]],v=[q[0],y+h,q[2]];
      g.quad(p,q,v,u,color,0,tag);g.tri([x,y+h,z],u,v,color,0,tag);
    }
    return g;
  }
  function buildTurret(part){
    let g=new Geometry();
    if(part==='base'){
      cylinderY(g,.62,.2,[0,0,0],C.dark,3);
      cylinderY(g,.51,.08,[0,.21,0],C.steel,3);
    } else if(part==='body') {
      g.chamfer([1.27,.51,1.0],[.1,.49,0],C.light,3);
      g.box([.5,.08,.045],[.08,.76,0],C.red,3);
      for(let s of[-1,1])g.box([.39,.25,.08],[-.09,.52,s*.51],C.dark,3);
      g.box([.08,.11,.25],[-.58,.58,0],C.blue,3,[0,0,0],.5);
    } else {
      for(let s of[-1,1]){
        g.cylinder(.1,1.8,[-1.35,0,s*.25],C.steel,10,3);
        g.cylinder(.15,.34,[-.55,0,s*.25],C.dark,10,3);
        g.cylinder(.145,.24,[-2.3,0,s*.25],C.dark,10,3);
        g.cylinder(.07,.012,[-2.425,0,s*.25],C.inner,10,3);
      }
    }
    return g;
  }
  function buildLaunchers(layout){
    let g=new Geometry();
    for(let [x,y,z] of layout.tubes){
      g.chamfer([.59,.2,.5],[x,y,z],C.dark,2);
      g.box([.46,.035,.36],[x,y+.12,z],C.steel,2);
      g.box([.32,.043,.022],[x,y+.145,z],C.dark,2);
      g.box([.035,.042,.085],[x+.2,y+.146,z+.11],C.window,2,[0,0,0],.75);
    }
    return g;
  }
  function axes(p){
    const forward=[Math.sin(p.yaw)*Math.cos(p.pitch),Math.sin(p.pitch),-Math.cos(p.yaw)*Math.cos(p.pitch)];
    const right0=V.norm(V.cross(forward,[0,1,0])),u=V.cross(right0,forward);
    const up=V.add(V.scale(u,Math.cos(p.roll)),V.scale(right0,Math.sin(p.roll)));
    return {forward,up,right:V.norm(V.cross(forward,up))};
  }
  function shipMatrix(p,index){let a=axes(p);return M.mul(M.camera(p.pos,a.forward,a.up),M.mul(M.ry(-Math.PI/2),M.scale(LAYOUTS[index].scale)))}
  function turretTransforms(model,turret,index){
    const scale=LAYOUTS[index].turretScale;
    const base=M.mul(model,M.mul(M.translate(...turret.mount),M.scale(scale)));
    const yaw=M.mul(base,M.ry(turret.yaw));
    const barrels=M.mul(yaw,M.mul(M.translate(0,.5,0),M.mul(M.rz(-turret.pitch),M.translate(turret.recoil||0,0,0))));
    return {base,yaw,barrels};
  }

  const vertexSource=`
    attribute vec3 aPosition; attribute vec3 aNormal; attribute vec3 aColor;
    attribute float aEmission; attribute float aTag; attribute vec2 aUV;
    uniform mat4 uModel; uniform mat4 uVP;
    varying vec3 vWorld; varying vec3 vNormal; varying vec3 vColor; varying vec3 vLocal;
    varying float vEmission; varying float vTag; varying vec2 vUV;
    void main(){vec4 world=uModel*vec4(aPosition,1.);vWorld=world.xyz;vNormal=mat3(uModel)*aNormal;vColor=aColor;vEmission=aEmission;vTag=aTag;vLocal=aPosition;vUV=aUV;gl_Position=uVP*world;}
  `;
  const fragmentSource=`
    precision highp float;
    varying vec3 vWorld; varying vec3 vNormal; varying vec3 vColor; varying vec3 vLocal;
    varying float vEmission; varying float vTag; varying vec2 vUV;
    uniform vec3 uEye; uniform vec3 uLight; uniform float uOpacity; uniform float uSelected;
    uniform float uMode; uniform float uWire; uniform float uTime; uniform float uExposure; uniform sampler2D uTexture; uniform vec3 uTint; uniform float uFighter;
    void main(){
      vec3 N=normalize(vNormal);if(!gl_FrontFacing)N=-N;
      vec3 L=normalize(uLight),V=normalize(uEye-vWorld);float diffuse=max(dot(N,L),0.);
      float hemi=dot(N,vec3(0.,1.,0.))*.5+.5;
      vec3 base=vColor;
      if(uMode>.5&&uMode<1.5){vec3 n=normalize(vLocal);vec2 uv=vec2(atan(n.z,n.x)/6.2831853+.5,asin(n.y)/3.14159265+.5);base=texture2D(uTexture,uv).rgb;}
      float spec=pow(max(dot(reflect(-L,N),V),0.),40.)*.17;
      vec3 lighting=vec3(.13,.17,.2)+vec3(.18,.20,.215)*hemi+vec3(.94,.9,.78)*diffuse;
      if(uMode>.5&&uMode<1.5)lighting=vec3(.028,.039,.055)+vec3(.89,.86,.76)*diffuse;
      vec3 color=base*lighting+spec;
      if(uFighter>.5){
        vec3 key=normalize(vec3(-.65,1.,.45)),fill=normalize(vec3(.55,.18,-.9));
        float kd=max(dot(N,key),0.),fd=max(dot(N,fill),0.);
        float edge=pow(1.-max(dot(N,V),0.),3.);
        float highlight=pow(max(dot(N,normalize(key+V)),0.),56.);
        color=base*(vec3(.24,.265,.29)+vec3(.94,.95,.96)*kd+vec3(.16,.20,.24)*fd)
          +vec3(.075,.09,.11)*highlight+vec3(.02,.034,.046)*edge;
      }
      color=mix(color,base*1.2,clamp(vEmission,0.,1.));
      if(abs(vTag-uSelected)<.1)color+=vec3(.12,.33,.39)*(.7+sin(uTime*2.5)*.12);
      if(uMode>1.5&&uMode<2.5)color=texture2D(uTexture,vUV).rgb*.76;
      if(uMode>2.5)color=uTint;
      if(uWire>.5)color=vec3(.35,.64,.72);
      color=pow(max(color,vec3(0.)),vec3(.94));
      float alpha=uOpacity;
      if(uMode>3.5){float rim=pow(1.-max(dot(N,V),0.),3.2);color=uTint*(.7+rim*.6);alpha*=rim;}
      gl_FragColor=vec4(color*uExposure,alpha);
    }
  `;
  const flatVertex=`attribute vec3 aPosition;attribute vec3 aColor;attribute float aSize;uniform mat4 uMatrix;uniform float uDpr;varying vec3 vColor;void main(){vColor=aColor;gl_Position=uMatrix*vec4(aPosition,1.);gl_PointSize=aSize*uDpr;}`;
  const flatFragment=`precision mediump float;varying vec3 vColor;uniform float uAlpha;uniform float uPointMode;void main(){float a=uAlpha;if(uPointMode>.5){float d=length(gl_PointCoord-vec2(.5));a*=1.-smoothstep(.14,.5,d);}gl_FragColor=vec4(vColor,a);}`;

  function shader(gl,type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s}
  function program(gl,vs,fs){const p=gl.createProgram(),v=shader(gl,gl.VERTEX_SHADER,vs),f=shader(gl,gl.FRAGMENT_SHADER,fs);gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p}
  function locations(gl,p,names,attribute=false){return Object.fromEntries(names.map(n=>[n,attribute?gl.getAttribLocation(p,n):gl.getUniformLocation(p,n)]))}

  function makeMoonTexture(){
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const ctx=canvas.getContext('2d'),rand=seeded(32191),w=512,h=256;
    const field=new Float32Array(128*64);for(let i=0;i<field.length;i++)field[i]=rand();
    const noise=(x,y)=>{let ix=Math.floor(x),iy=Math.floor(y),u=x-ix,v=y-iy;u=u*u*(3-2*u);v=v*v*(3-2*v);const at=(a,b)=>field[((b%64+64)%64)*128+((a%128+128)%128)];return mix(mix(at(ix,iy),at(ix+1,iy),u),mix(at(ix,iy+1),at(ix+1,iy+1),u),v)};
    const small=document.createElement('canvas');small.width=w;small.height=h;let s=small.getContext('2d'),img=s.createImageData(w,h);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){let n=noise(x/60,y/60)*.47+noise(x/23,y/23)*.25+noise(x/8,y/8)*.15+noise(x/2.9,y/2.9)*.09+rand()*.12;let c=83+n*109;let i=(y*w+x)*4;img.data[i]=c*1.04;img.data[i+1]=c;img.data[i+2]=c*.89;img.data[i+3]=255}s.putImageData(img,0,0);ctx.drawImage(small,0,0,1024,512);
    for(let i=0;i<2800;i++){let x=rand()*1024,y=rand()*512,r=.7+Math.pow(rand(),3)*(i<130?18:6.5);ctx.save();ctx.translate(x,y);ctx.scale(1,Math.max(.3,Math.sin(y/512*Math.PI)));let grad=ctx.createRadialGradient(-r*.22,-r*.2,r*.12,0,0,r);grad.addColorStop(0,'rgba(24,26,27,.35)');grad.addColorStop(.64,'rgba(64,65,61,.29)');grad.addColorStop(.82,'rgba(219,215,193,.45)');grad.addColorStop(.91,'rgba(219,217,198,.16)');grad.addColorStop(1,'rgba(190,190,168,0)');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.restore()}
    return canvas;
  }

  function instrumentCanvas(index,time=0,speed=128){
    const canvas=document.createElement('canvas');canvas.width=384;canvas.height=256;const ctx=canvas.getContext('2d');
    function draw(t,speed){const w=384,h=256;ctx.fillStyle='#06121b';ctx.fillRect(0,0,w,h);ctx.lineWidth=1;ctx.strokeStyle='#244452';ctx.strokeRect(6,6,w-12,h-12);ctx.fillStyle='#50879a';ctx.font='7px monospace';ctx.fillText(['NAV / PROXIMITY ARRAY','FLIGHT CONTROL / TELEMETRY','SYSTEMS / DISTRIBUTION'][index],15,19);ctx.fillText('LINK  0'+(index+1)+'  //  ONLINE',248,19);ctx.beginPath();ctx.moveTo(10,26);ctx.lineTo(374,26);ctx.stroke();
      if(index!==1){let cx=190,cy=134;ctx.strokeStyle='#376378';for(let r of[24,49,73,92]){ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke()}ctx.strokeStyle='#24434d';for(let a=0;a<8;a++){ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a/8*TAU)*94,cy+Math.sin(a/8*TAU)*94);ctx.stroke()}ctx.strokeStyle='#669cac';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(t*.47)*90,cy+Math.sin(t*.47)*90);ctx.stroke();ctx.fillStyle='#b1cbbc';[[20,-17],[-37,24],[50,52]].forEach(([x,y])=>ctx.fillRect(cx+x,cy+y,3,3));ctx.fillStyle='#5d94a6';ctx.fillText(index===0?'RANGE  08.0 KM':'SHIELD DISTRIBUTION',16,238);ctx.fillText('O2  100%',298,238);
      }else{ctx.strokeStyle='#244451';for(let x=35;x<370;x+=31){ctx.beginPath();ctx.moveTo(x,42);ctx.lineTo(x,210);ctx.stroke()}for(let y=45;y<214;y+=27){ctx.beginPath();ctx.moveTo(15,y);ctx.lineTo(370,y);ctx.stroke()}ctx.strokeStyle='#699db0';ctx.beginPath();for(let i=0;i<170;i++){let x=20+i*2,y=147+Math.sin(i*.082+t)*12+Math.sin(i*.213+t*2)*4;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();ctx.fillStyle='#a0c1c9';ctx.font='23px monospace';ctx.fillText(String(Math.round(speed)).padStart(3,'0'),24,82);ctx.font='7px monospace';ctx.fillText('VELOCITY  M/S',24,96);ctx.fillText('FLIGHT STABILITY  0.998',18,237);ctx.fillText('ENG  NOMINAL',282,237)}
      ctx.fillStyle='#75a0ad';ctx.font='6px monospace';for(let i=0;i<11;i++){let y=48+i*13;ctx.fillText((.02+i*.007).toFixed(3),14,y);ctx.fillText((99.2-i*.019).toFixed(2),348,y)}
    }
    draw(time,speed);return{canvas,draw};
  }

/* Scene extension: original model builders remain untouched. */
function buildOrbitalStation(){
 const g=new Geometry(),r=seeded(771),steel=rgb(0x35434c),edge=rgb(0x8e9ba5),dark=rgb(0x151f29),cyan=rgb(0x6fcce9);
 const P=(a,rad,z)=>[Math.cos(a)*rad,Math.sin(a)*rad,z];
 for(let i=0;i<56;i++){
  let a=i/56*TAU,b=(i+1)/56*TAU;
  g.beam(P(a,165,0),P(b,165,0),10,19,steel);
  g.beam(P(a,173,0),P(b,173,0),2,22,edge);
  g.beam(P(a,157,0),P(b,157,0),1.2,23,cyan);
  if(i%4===0){let q=P(a,165,0);g.box([15,20,32],q,dark,0,[0,0,a]);g.box([9,10,35],q,edge,0,[0,0,a]);g.box([1.5,7,36],q,cyan,0,[0,0,a],.9);}
  if(i%14===0)g.beam([0,0,0],P(a,165,0),7,9,steel);
 }
 g.chamfer([360,15,18],[0,0,0],steel);g.chamfer([57,39,58],[0,0,0],dark);g.chamfer([43,26,68],[0,0,0],edge);
 for(let side of[-1,1]){
  g.chamfer([58,25,55],[side*208,0,0],steel);g.box([60,5,57],[side*208,0,0],edge);
  for(let i=0;i<8;i++){g.box([2,1,59],[side*208-24+i*7,7,0],cyan,0,[0,0,0],.8);g.box([13,28,20],[side*(194+i%3*13),-23-Math.floor(i/3)*20,0],dark);}
 }
 return g;
}
function makeOceanTexture(){
 const c=document.createElement('canvas');c.width=1024;c.height=512;let x=c.getContext('2d'),d=x.createImageData(c.width,c.height),r=seeded(19191),f=new Float32Array(128*64);for(let i=0;i<f.length;i++)f[i]=r();
 const noise=(a,b)=>{let i=Math.floor(a),j=Math.floor(b),u=a-i,v=b-j;u=u*u*(3-2*u);v=v*v*(3-2*v);const at=(i,j)=>f[((j%64+64)%64)*128+((i%128+128)%128)];return mix(mix(at(i,j),at(i+1,j),u),mix(at(i,j+1),at(i+1,j+1),u),v);};
 for(let y=0;y<512;y++)for(let k=0;k<1024;k++){
  const nx=k/1024,ny=y/512,warp=4*Math.sin(ny*10+nx*8),n=noise(nx*13+warp,ny*7)*.57+noise(nx*29,ny*15)*.26+noise(nx*81,ny*43)*.17;
  const cloud=clamp((noise(nx*97+Math.sin(ny*26)*3,ny*57)*.5+noise(nx*183,ny*117)*.3+noise(nx*377,ny*251)*.2-.56)*5,0,.86),land=clamp((n-.51)*13,0,1),ice=clamp((Math.abs(ny-.5)-.385)*12,0,1);
  let color=[mix(5,51,land),mix(28,77,land),mix(56,85,land)];color=color.map(v=>mix(mix(v,207,ice),231,cloud));let i=(y*1024+k)*4;d.data[i]=color[0];d.data[i+1]=color[1];d.data[i+2]=color[2];d.data[i+3]=255;
 }
 x.putImageData(d,0,0);return c;
}

  class Renderer {
    constructor(canvas){
      this.canvas=canvas;this.gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'high-performance'});
      if(!this.gl)throw new Error('WebGL context is unavailable.');
      const gl=this.gl;this.program=program(gl,vertexSource,fragmentSource);this.attr=locations(gl,this.program,['aPosition','aNormal','aColor','aEmission','aTag','aUV'],true);this.uni=locations(gl,this.program,['uModel','uVP','uEye','uLight','uOpacity','uSelected','uMode','uWire','uTime','uTexture','uExposure','uTint','uFighter']);
      this.flat=program(gl,flatVertex,flatFragment);this.fa=locations(gl,this.flat,['aPosition','aColor','aSize'],true);this.fu=locations(gl,this.flat,['uMatrix','uDpr','uAlpha','uPointMode']);
      this.fighterGeometry=buildFighter();this.antimatterGeometry=buildAntimatterMissile();this.shipGeometries=[buildShip(0),buildShip(1),buildShip(2),this.fighterGeometry,buildBattleship(),this.antimatterGeometry];this.shipMeshes=this.shipGeometries.map(g=>g.upload(gl));
      this.turretMeshes=['base','body','barrels'].map(k=>buildTurret(k).upload(gl));this.launchers=LAYOUTS.map(l=>buildLaunchers(l).upload(gl));
      this.bridgeMesh=this.makeBridge().upload(gl);
      let beam=new Geometry();beam.cylinder(1,1,[.5,0,0],C.blue,10,0,1);this.beamMesh=beam.upload(gl);let plume=new Geometry();plume.cylinder(1,1,[.5,0,0],C.blue,14,0,1,0);this.plumeMesh=plume.upload(gl);
      let missile=new Geometry();missile.cylinder(.11,.95,[0,0,0],C.light,8);missile.cylinder(.11,.32,[.63,0,0],C.light,8,0,0,0);this.missileMesh=missile.upload(gl);this.moonMesh=new Geometry().sphere(1,64,36).upload(gl);this.moonTexture=this.texture(makeMoonTexture());
      this.grid=this.makeGrid();this.stars=this.makeStars();this.dynamic=gl.createBuffer();this.cockpit=this.makeCockpit().upload(gl);this.screens=[];this.instruments=[];
      for(let i=0;i<3;i++){let x=(i-1)*1.1,y=i===1?-1.22:-1.15,z=-2.00;let g=new Geometry();g.quad([x-.44,y-.27,z],[x+.44,y-.27,z],[x+.44,y+.27,z],[x-.44,y+.27,z],C.blue);this.screens.push(g.upload(gl));let inst=instrumentCanvas(i);inst.texture=this.texture(inst.canvas);this.instruments.push(inst)}
      this.stationMesh=buildOrbitalStation().upload(gl);this.planetTexture=this.texture(makeOceanTexture());
      const rock=new Geometry().sphere(1,9,6);for(let i=0;i<rock.data.length;i+=13){const x=rock.data[i],y=rock.data[i+1],z=rock.data[i+2],r=1+.13*Math.sin(x*6+y*9+z*5)+.11*Math.cos(x*11-z*7);rock.data[i]*=r;rock.data[i+1]*=r*.8;rock.data[i+2]*=r*1.1;rock.data[i+6]=.26;rock.data[i+7]=.3;rock.data[i+8]=.33;}this.rockMesh=rock.upload(gl);const rr=seeded(33191);this.rocks=Array.from({length:42},(_,i)=>({pos:[(rr()-.5)*1900,(rr()-.4)*800,-120-rr()*1800],rot:[rr()*3,rr()*5,rr()*6],scale:5+Math.pow(rr(),2)*29}));
      this.staticFleetMeshes=this.shipGeometries.map((base,index)=>{if(!LAYOUTS[index].mounts.length)return this.shipMeshes[index];let batch=new Geometry();batch.data=base.data.slice();batch.data.push(...buildLaunchers(LAYOUTS[index]).data);for(const mount of LAYOUTS[index].mounts){let t={mount,yaw:0,pitch:.12,recoil:0},tf=turretTransforms(M.identity(),t,index);for(const [part,m]of[['base',tf.base],['body',tf.yaw],['barrels',tf.barrels]]){const d=buildTurret(part).data;for(let i=0;i<d.length;i+=13){const pos=M.transform(m,d.slice(i,i+3)),n=d.slice(i+3,i+6),normal=V.norm([m[0]*n[0]+m[4]*n[1]+m[8]*n[2],m[1]*n[0]+m[5]*n[1]+m[9]*n[2],m[2]*n[0]+m[6]*n[1]+m[10]*n[2]]);batch.data.push(...pos,...normal,...d.slice(i+6,i+13));}}}return batch.upload(gl);});
      this.lastInstrument=0;this.vp=M.identity();this.eye=[0,0,0];this.width=0;this.height=0;this.resize();
      gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.disable(gl.CULL_FACE);
      canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();document.getElementById('no-webgl').hidden=false;document.getElementById('webgl-error').textContent='图形上下文已丢失。请刷新页面重新初始化。';});
    }
    resize(){this.width=innerWidth;this.height=innerHeight;this.dpr=Math.min(devicePixelRatio||1,1.6);let w=Math.round(this.width*this.dpr),h=Math.round(this.height*this.dpr);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h}this.gl.viewport(0,0,w,h)}
    texture(canvas){const gl=this.gl,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,canvas);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t}
    flatBuffer(data){const gl=this.gl,b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);return{buffer:b,count:data.length/7}}
    makeGrid(){let data=[];const add=(p,c)=>data.push(...p,...c,1);for(let x=-25;x<=26;x+=2.3)for(let z=-20;z<=25;z+=2.3){let fade=Math.max(0,1-Math.hypot(x*.7,z*.8)/27),c=[.22*fade,.38*fade,.45*fade];add([x-.08,-2.8,z],c);add([x+.08,-2.8,z],c);add([x,-2.8,z-.08],c);add([x,-2.8,z+.08],c)}return this.flatBuffer(data)}
    makeStars(){let data=[],r=seeded(5352);for(let i=0;i<2300;i++){let y=r()*2-1,a=r()*TAU,k=Math.sqrt(1-y*y),b=.2+Math.pow(r(),2)*.65;data.push(Math.cos(a)*k*6000,y*6000,Math.sin(a)*k*6000,b*.87,b*.93,b,.65+r()*1.45)}return this.flatBuffer(data)}
    makeCockpit(){const g=new Geometry(),frame=rgb(0x344046),trim=rgb(0x7b7e75),inner=rgb(0x101a20);
      // Load-bearing canopy members and small fasteners, all actual 3D geometry.
      g.beam([-2.25,1.48,-2.75],[2.25,1.48,-2.75],.17,.15,frame);g.beam([-2.24,1.38,-2.77],[2.24,1.38,-2.77],.025,.03,trim);
      for(let s of[-1,1]){let a=[s*2.15,1.6,-2.75],b=[s*2.35,-1.42,-2.35];g.beam(a,b,.15,.21,frame);g.beam([s*2.06,1.6,-2.78],[s*2.26,-1.42,-2.38],.026,.05,trim);g.beam([s*2.87,1.9,-2.6],[s*2.05,-1.57,-1.95],.2,.23,frame);g.beam([s*2.8,1.9,-2.57],[s*1.99,-1.57,-1.92],.035,.03,trim);for(let i=0;i<5;i++)g.box([.065,.055,.04],[s*(2.16+i*.044),1.25-i*.5,-2.59+i*.055],inner)}
      g.box([5.8,.6,.7],[0,-1.74,-1.87],inner);g.beam([-2.6,-1.24,-2.14],[2.6,-1.24,-2.14],.24,.15,frame);
      for(let i=0;i<3;i++){let x=(i-1)*1.1,y=i===1?-1.22:-1.15;g.chamfer([1.035,.79,.20],[x,y,-2.16],frame);g.box([.94,.60,.06],[x,y,-2.06],inner);for(let sy of[-1,1])for(let sx of[-1,1])g.box([.031,.03,.018],[x+sx*.46,y+sy*.315,-2.027],trim);for(let j=0;j<3;j++){g.box([.055,.04,.038],[x+.49,y+.1-j*.1,-2.009],j===0?rgb(0xa67c46):trim)}}
      for(let s of[-1,1]){g.chamfer([.42,.84,.45],[s*1.95,-1.42,-1.83],inner);g.box([.21,.13,.035],[s*1.94,-1.11,-1.58],frame)}return g;
    }

    makeBridge(){
      const g=new Geometry(),frame=rgb(0x28363c),trim=rgb(0x72786f),inner=rgb(0x0e181d);
      // A broad command deck; the foredeck remains visible through the lower glazing.
      for(let side of[-1,1]){
        g.beam([side*3.97,2.22,-3.9],[side*3.8,-1.72,-3.35],.18,.24,frame);
        g.beam([side*3.89,2.21,-3.93],[side*3.72,-1.68,-3.38],.03,.04,trim);
        g.beam([side*6.6,3,-5.7],[side*3.75,-2.15,-2.55],.24,.3,frame);
        g.chamfer([1.65,.38,1.5],[side*2.82,-1.74,-3.1],frame);
        g.box([1.3,.023,.83],[side*2.82,-1.54,-3.1],inner);
        for(let j=0;j<6;j++)g.box([.055,.028,.45],[side*2.82-.45+j*.18,-1.519,-3.1],C.blue,0,[0,0,0],.65);
        g.beam([side*6,-1.42,-4.4],[side*3.15,-1.16,-2.54],.075,.08,trim);
        for(let i=0;i<5;i++)g.box([.055,.12,.045],[side*4.43,1.6-i*.56,-3.7+i*.065],inner);
      }
      g.beam([-5.6,2.38,-4.2],[5.6,2.38,-4.2],.21,.34,frame);
      g.beam([-5.6,2.27,-4.24],[5.6,2.27,-4.24],.045,.04,trim);
      g.beam([-5,-1.62,-3.7],[5,-1.62,-3.7],.1,.15,frame);
      g.box([12,.46,4.7],[0,-2.15,-2.65],inner);
      // Three independent instrument screens in a low central console.
      for(let i=0;i<3;i++){
        let x=(i-1)*1.1,y=i===1?-1.22:-1.15;
        g.chamfer([1.035,.79,.2],[x,y,-2.16],frame);
        g.box([.94,.6,.055],[x,y,-2.06],inner);
        g.box([.73,.032,.033],[x,y+.31,-2.025],trim);
      }
      return g;
    }
    drawVessel(index,model,opts={},turrets=null){
      if(!turrets&&this.staticFleetMeshes?.[index]){this.drawMesh(this.staticFleetMeshes[index],model,{...opts,fighter:index===3});return;}
      this.drawMesh(this.shipMeshes[index],model,{...opts,fighter:index===3});
      if(LAYOUTS[index].mounts.length){
        this.drawMesh(this.launchers[index],model,opts);
        const entries=turrets||LAYOUTS[index].mounts.map((mount,i)=>({mount,yaw:Math.sin(this.time*.18+i)*.16,pitch:.12,recoil:0}));
        for(let t of entries){let a=turretTransforms(model,t,index);this.drawMesh(this.turretMeshes[0],a.base,opts);this.drawMesh(this.turretMeshes[1],a.yaw,opts);this.drawMesh(this.turretMeshes[2],a.barrels,opts);}
      }
    }
    segmentModel(a,b,radius=1){
      const x=V.norm(V.sub(b,a)),ref=Math.abs(x[1])>.97?[0,0,1]:[0,1,0],z=V.norm(V.cross(x,ref)),y=V.cross(z,x),len=V.length(V.sub(b,a));
      return new Float32Array([x[0]*len,x[1]*len,x[2]*len,0,y[0]*radius,y[1]*radius,y[2]*radius,0,z[0]*radius,z[1]*radius,z[2]*radius,0,...a,1]);
    }
    drawBeam(a,b,width,color,opacity=1){
      const gl=this.gl;gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      this.drawMesh(this.beamMesh,this.segmentModel(a,b,width*3),{mode:3,tint:color,opacity:opacity*.1});
      this.drawMesh(this.beamMesh,this.segmentModel(a,b,width),{mode:3,tint:color,opacity:opacity*.65});
      this.drawMesh(this.beamMesh,this.segmentModel(a,b,width*.32),{mode:3,tint:[.92,.98,1],opacity});
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
    }

    bindMain(mesh,wire){const gl=this.gl;gl.useProgram(this.program);gl.bindBuffer(gl.ARRAY_BUFFER,wire?mesh.lineBuffer:mesh.buffer);for(let[i,n]of['aPosition','aNormal','aColor','aEmission','aTag','aUV'].entries()){let a=this.attr[n],sizes=[3,3,3,1,1,2],offset=[0,3,6,9,10,11];if(a>=0){gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,sizes[i],gl.FLOAT,false,52,offset[i]*4)}}}
    drawMesh(mesh,model,opts={}){let gl=this.gl,u=this.uni;this.bindMain(mesh,opts.wire);gl.uniformMatrix4fv(u.uModel,false,model);gl.uniformMatrix4fv(u.uVP,false,this.vp);gl.uniform3fv(u.uEye,this.eye);gl.uniform3fv(u.uLight,opts.light||[-.65,.9,.65]);gl.uniform1f(u.uOpacity,opts.opacity??1);gl.uniform1f(u.uSelected,opts.selected??-10);gl.uniform1f(u.uMode,opts.mode||0);gl.uniform1f(u.uWire,opts.wire?1:0);gl.uniform1f(u.uTime,this.time||0);gl.uniform1f(u.uExposure,opts.exposure??1);gl.uniform3fv(u.uTint,opts.tint||[1,1,1]);gl.uniform1f(u.uFighter,opts.fighter?1:0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,opts.texture||this.moonTexture);gl.uniform1i(u.uTexture,0);gl.drawArrays(opts.wire?gl.LINES:gl.TRIANGLES,0,opts.wire?mesh.lineCount:mesh.count)}
    drawFlat(batch,matrix,points=false,alpha=1){let gl=this.gl;for(let i=0;i<6;i++)gl.disableVertexAttribArray(i);gl.useProgram(this.flat);gl.bindBuffer(gl.ARRAY_BUFFER,batch.buffer);for(let[n,size,offset]of[['aPosition',3,0],['aColor',3,12],['aSize',1,24]]){let a=this.fa[n];gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,28,offset)}gl.uniformMatrix4fv(this.fu.uMatrix,false,matrix);gl.uniform1f(this.fu.uDpr,this.dpr);gl.uniform1f(this.fu.uAlpha,alpha);gl.uniform1f(this.fu.uPointMode,points?1:0);gl.drawArrays(points?gl.POINTS:gl.LINES,0,batch.count)}
    dynamicFlat(data,points=false,alpha=1){let gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,this.dynamic);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);this.drawFlat({buffer:this.dynamic,count:data.length/7},this.vp,points,alpha)}
    begin(time){this.time=time;const gl=this.gl;gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthMask(true)}
    archive(s,time){this.begin(time);let a=s.orbit,transition=s.transition,zoom=1,centerY=0,offset=-.26;
      if(transition){let q=transition.progress;if(transition.to==='flight'){zoom=1-Math.pow(clamp(q*2,0,1),2)*.87;centerY=clamp(q*2,0,1)*1.35}else{zoom=.13+(1-Math.pow(1-clamp((q-.4)/.6,0,1),3))*.87;centerY=(1-zoom)*1.5}}
      let dist=a.distance*zoom*Math.max(1,(16/9)/(this.width/this.height)),eye=[-Math.sin(a.yaw)*Math.cos(a.pitch)*dist,Math.sin(a.pitch)*dist+centerY,Math.cos(a.yaw)*Math.cos(a.pitch)*dist];this.eye=eye;
      const proj=M.perspective(35*Math.PI/180,this.width/this.height,.07,9000,offset);if(isFighter(s.shipIndex)||isAntimatter(s.shipIndex))proj[9]=-.13;this.vp=M.mul(proj,M.lookAt(eye,[0,centerY,0]));this.drawFlat(this.grid,this.vp,false,.7*zoom);
      let rot=[0,0,0],y=Math.sin(time*.27)*.04,opacity=1;
      if(s.shipSwitch){let p=s.shipSwitch.progress;opacity=Math.abs(p-.5)*2;let side=p<.5?-1:1;rot=[0,side*(1-opacity)*.32,0];y+=(1-opacity)*side*.8}
      const model=M.compose([0,y,0],rot);this.archiveModel=model;
      this.drawVessel(s.shipIndex,model,{opacity,wire:s.wireframe,selected:s.highlight});
    }

    flight(s,time){
      this.begin(time);
      const p=s.flight,layout=LAYOUTS[s.shipIndex],a=axes(p),{forward,right,up}=a,gl=this.gl;
      const shipFrame=M.camera(p.pos,forward,up),own=shipMatrix(p,s.shipIndex);
      this.flightCameraMatrix=shipFrame;this.ownModel=own;
      const blend=p.cameraBlend??(p.external?1:0);
      const bridge=V.scale(layout.bridge,layout.scale),zoom=p.cameraZoom||1,orbit=p.orbitYaw||0;
      const c=layout.chase,co=Math.cos(orbit),si=Math.sin(orbit);
      const chase=[(c[0]*co+c[2]*si)*zoom,(c[1]+(p.orbitPitch||0)*c[2])*zoom,(-c[0]*si+c[2]*co)*zoom];
      const arc=Math.sin(blend*Math.PI)*layout.scale*3;
      const eyeLocal=bridge.map((v,i)=>mix(v,chase[i],blend));eyeLocal[0]+=arc;eyeLocal[1]+=arc*.8;
      const focus=V.scale(layout.focus,Math.max(0,1-Math.abs(orbit)*1.4));
      const extDir=V.norm(V.sub(focus,chase)),dirLocal=V.norm([extDir[0]*blend,extDir[1]*blend,mix(-1,extDir[2],blend)]);
      const localShake=p.shake||0;eyeLocal[0]+=Math.sin(time*53)*localShake*.18;eyeLocal[1]+=Math.cos(time*63)*localShake*.12;
      const eye=M.transform(shipFrame,eyeLocal),dir=V.add(V.scale(right,dirLocal[0]),V.add(V.scale(up,dirLocal[1]),V.scale(forward,-dirLocal[2])));
      this.eye=eye;this.cameraForward=V.norm(dir);this.cameraUp=up;
      const fov=mix(isFighter(s.shipIndex)?65:(isAntimatter(s.shipIndex)?72:62),isFighter(s.shipIndex)?61:(isAntimatter(s.shipIndex)?67:55),blend)+(p.boostActive?3:0);
      this.fov=fov*Math.PI/180;
      const projection=M.perspective(this.fov,this.width/this.height,.035,22000);projection[9]=window.PreviewHUD?.mode==='flagship'&&p.external?-.38:-.06;
      this.projectionOffset=projection[9];
      this.vp=M.mul(projection,M.lookAt(eye,V.add(eye,dir),up));
      gl.depthMask(false);this.drawFlat(this.stars,M.mul(this.vp,M.translate(...eye)),true,.9);gl.depthMask(true);
      this.drawMesh(this.moonMesh,M.compose([-2900,-1250,-3100],[0,.42,0],[1850,1850,1850]),{mode:1,texture:this.planetTexture,light:[.5,.3,1]});
      gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);this.drawMesh(this.moonMesh,M.compose([-2900,-1250,-3100],[0,.42,0],[1865,1865,1865]),{mode:4,tint:[.18,.48,.8],opacity:.42});gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
      this.drawMesh(this.moonMesh,M.compose([1360,385,-3450],[0,1.2,0],[72,72,72]),{mode:1,texture:this.moonTexture,light:[-.4,.7,1]});
      this.drawMesh(this.stationMesh,M.compose([700,105,-1390],[.11,-.48,-.24],[1.7,1.7,1.7]),{exposure:.98,light:[-.3,.7,.8]});
      for(const r of this.rocks)this.drawMesh(this.rockMesh,M.compose(r.pos,[r.rot[0]+time*.007,r.rot[1],r.rot[2]],[r.scale,r.scale,r.scale]),{exposure:.95,light:[-.2,.6,.9]});
      window.CommandHUD?.drawWorld(this,s,time);
      for(let t of p.targets){if(t.hp>0)this.drawVessel(t.kind,M.compose(t.pos,[.035,t.heading||.2,-.045],[t.scale,t.scale,t.scale]),{light:[-.3,.65,1],exposure:.85})}
      // The camera moves above the real hull toward the bridge. No cut, reset, or dark frame.
      const ownOpacity=(isFighter(s.shipIndex)?clamp((blend-.035)/.18,0,1):1)*(p.hidden?0:1);
      if(ownOpacity>.001)this.drawVessel(s.shipIndex,own,{light:[-.5,.9,.75],opacity:ownOpacity,exposure:1.05},p.turrets);
      // Engine plumes scale with throttle and are placed at the actual engine bells.
      if(ownOpacity>.05&&blend>.04){
        for(let e of layout.engines){
          let start=M.transform(own,e),end=V.add(start,V.scale(forward,-layout.scale*(1.2+p.throttle/100*2.1+(p.boostActive?4:0))));
          gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);this.drawMesh(this.plumeMesh,this.segmentModel(start,end,layout.scale*(isAntimatter(s.shipIndex)?.82:.54)),{mode:3,tint:isAntimatter(s.shipIndex)?[.25,.92,1]:[.21,.51,.85],opacity:ownOpacity*(isFighter(s.shipIndex)?.08:(isAntimatter(s.shipIndex)?.75:.36))});this.drawMesh(this.plumeMesh,this.segmentModel(start,end,layout.scale*(isAntimatter(s.shipIndex)?.38:.26)),{mode:3,tint:isAntimatter(s.shipIndex)?[.82,1,1]:[.6,.85,1],opacity:ownOpacity*(isFighter(s.shipIndex)?.18:(isAntimatter(s.shipIndex)?.95:.6))});gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
        }
      }
      for(let b of p.beams||[]){this.drawBeam(b.start,b.end,b.width,b.color,Math.max(0,1-b.age/b.life));}
      if(p.charging){
        const glows=[];for(let m of layout.main){let x=M.transform(own,m);glows.push(...x,.38,.82,1,7+p.charge*16)}
        gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);this.dynamicFlat(glows,true,.7);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
      }
      const trails=[],heads=[];
      for(let q of p.projectiles){
        if(q.missile){
          if(q.trail)for(let i=1;i<q.trail.length;i++){
            let life=i/q.trail.length,c=[.6*life,.71*life,.73*life];trails.push(...q.trail[i-1],...c,1,...q.trail[i],...c,1);
          }
          const unit=V.norm(q.velocity),tail=V.add(q.pos,V.scale(unit,-2.8));
          trails.push(...tail,1,.56,.2,1,...q.pos,1,.88,.64,1);heads.push(...q.pos,1,.77,.42,4.5);
          const mx=this.segmentModel(V.add(q.pos,V.scale(unit,-.9)),q.pos,1.15);
          this.drawMesh(this.missileMesh,mx,{light:[-.3,.7,1]});
        }else{
          const back=V.add(q.pos,V.scale(V.norm(q.velocity),-(q.hostile?11:8))),c=q.hostile?[.94,.3,.2]:[.6,.86,1];
          trails.push(...back,...c,1,...q.pos,...c,1);heads.push(...q.pos,...c,q.hostile?2:3);
        }
      }
      if(trails.length)this.dynamicFlat(trails,false,.9);
      const particles=[];
      for(let q of p.particles){let f=1-q.age/q.life,c=q.color||[1,.7,.36];particles.push(...q.pos,c[0]*f,c[1]*f,c[2]*f,q.size);}
      const shockwaveLines=[];
      for(let w of p.shockwaves||[]){
        let f=w.age/w.life,r=mix(w.startRadius,w.endRadius,f),alpha=Math.max(0,1-f),segments=44;
        const pushRing=(a,b)=>{
          for(let i=0;i<segments;i++){
            let t0=i/segments*TAU,t1=(i+1)/segments*TAU;
            let p0=[w.pos[0]+Math.cos(t0)*a[0]*r+Math.sin(t0)*b[0]*r,w.pos[1]+Math.cos(t0)*a[1]*r+Math.sin(t0)*b[1]*r,w.pos[2]+Math.cos(t0)*a[2]*r+Math.sin(t0)*b[2]*r];
            let p1=[w.pos[0]+Math.cos(t1)*a[0]*r+Math.sin(t1)*b[0]*r,w.pos[1]+Math.cos(t1)*a[1]*r+Math.sin(t1)*b[1]*r,w.pos[2]+Math.cos(t1)*a[2]*r+Math.sin(t1)*b[2]*r];
            shockwaveLines.push(...p0,w.color[0]*alpha,w.color[1]*alpha,w.color[2]*alpha,1,...p1,w.color[0]*alpha,w.color[1]*alpha,w.color[2]*alpha,1);
          }
        };
        pushRing([1,0,0],[0,1,0]);pushRing([1,0,0],[0,0,1]);pushRing([0,1,0],[0,0,1]);
      }
      gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      if(shockwaveLines.length)this.dynamicFlat(shockwaveLines,false,.95);
      if(heads.length)this.dynamicFlat(heads,true,1);if(particles.length)this.dynamicFlat(particles,true,1);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
      // The interior is fixed to the bridge, never parented to the moving external camera.
      const interiorAlpha=(isAntimatter(s.shipIndex)||isFighter(s.shipIndex))?0:clamp(1-blend/.17,0,1);
      if(interiorAlpha>0){
        const cockpitModel=M.mul(shipFrame,M.translate(...bridge));
        // Clip-free overlay close to the eye; fade only the interior during the physical pullback.
        if(blend<.02)gl.clear(gl.DEPTH_BUFFER_BIT);
        this.drawMesh(isFighter(s.shipIndex)||s.shipIndex===2||isAntimatter(s.shipIndex)?this.cockpit:this.bridgeMesh,cockpitModel,{opacity:interiorAlpha,light:[-.35,.7,.6],exposure:.7});
        if(time-this.lastInstrument>.2){this.lastInstrument=time;this.instruments.forEach(inst=>{inst.draw(time,p.speed);gl.bindTexture(gl.TEXTURE_2D,inst.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,inst.canvas)})}
        for(let i=0;i<3;i++)this.drawMesh(this.screens[i],cockpitModel,{mode:2,texture:this.instruments[i].texture,opacity:interiorAlpha});
      }
    }
    ray(x,y){
      const right=V.norm(V.cross(this.cameraForward,this.cameraUp)),up=V.cross(right,this.cameraForward),tan=Math.tan(this.fov/2);
      const nx=x/this.width*2-1,ny=1-y/this.height*2;
      const direction=V.norm(V.add(this.cameraForward,V.add(V.scale(right,nx*tan*this.width/this.height),V.scale(up,(ny+(this.projectionOffset||0))*tan))));
      return {origin:[...this.eye],direction};
    }
    project(p){const m=this.vp,x=m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],y=m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],z=m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14],w=m[3]*p[0]+m[7]*p[1]+m[11]*p[2]+m[15];return{x:(x/w*.5+.5)*this.width,y:(-y/w*.5+.5)*this.height,z:z/w,visible:w>0,w}}
  }
  return {Renderer,V,M,clamp,mix,seeded,LAYOUTS,axes,shipMatrix,turretTransforms,Geometry};
})();

