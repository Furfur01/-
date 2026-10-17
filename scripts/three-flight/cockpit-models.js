// Extracted from the user-supplied cockpit documents. Rebuild with scripts/build-cockpit-models.mjs.
// Only geometry and material shaders are included; demo battles, input handlers and network loaders are excluded.
export const buildBastion=(()=>{
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


  class InteriorBuilder {
    constructor(spec){this.spec=spec;this.groups={};for(const k of ['floor','walls','roof','furniture','trim','crew','glass','screens','labels','holo'])this.groups[k]=new Geometry();this.group='furniture';this.obstacles=[];this.P={floor:rgb(0x28343d),panel:rgb(0x73818a),pale:rgb(0xb7c0c1),dark:rgb(0x17232e),black:rgb(0x080f16),metal:rgb(0x465866),seat:rgb(0x293d49),edge:rgb(0x90a0a6),accent:rgb(spec.accent),white:rgb(0xe2e6df),amber:rgb(0xdda867)};}
    use(k){this.group=k;return this;}
    get g(){return this.groups[this.group];}
    solid(size,pos,c=this.P.panel,rot=[0,0,0],bevel=.055,em=0){
      let [w,h,d]=size,b=Math.min(bevel,w*.24,h*.24,d*.24);if(Math.min(w,h,d)<=0)return;
      const mat=M.compose(pos,rot),g=this.g;
      const ring=(y,W,D)=>{const k=Math.min(b,W*.2,D*.2);return [[-W/2+k,y,-D/2],[W/2-k,y,-D/2],[W/2,y,-D/2+k],[W/2,y,D/2-k],[W/2-k,y,D/2],[-W/2+k,y,D/2],[-W/2,y,D/2-k],[-W/2,y,-D/2+k]].map(v=>M.transform(mat,v));};
      const rings=[ring(-h/2,w-2*b,d-2*b),ring(-h/2+b,w,d),ring(h/2-b,w,d),ring(h/2,w-2*b,d-2*b)];
      for(let k=0;k<3;k++)for(let i=0;i<8;i++)g.quad(rings[k][i],rings[k][(i+1)%8],rings[k+1][(i+1)%8],rings[k+1][i],c,em);
      for(let i=1;i<7;i++){g.tri(rings[0][0],rings[0][i+1],rings[0][i],c,em);g.tri(rings[3][0],rings[3][i],rings[3][i+1],c,em);}
      return this;
    }
    box(size,pos,c=this.P.panel,em=0,rot=[0,0,0]){this.g.box(size,pos,c,0,rot,em);return this;}
    beam(a,b,w,c=this.P.metal,em=0,depth=w){let start=this.g.data.length;this.g.beam(a,b,w,depth,c);if(em)for(let i=start+9;i<this.g.data.length;i+=13)this.g.data[i]=em;return this;}
    cylinder(r,h,pos,c=this.P.metal,n=24,em=0,rTop=r){let [x,y,z]=pos,g=this.g;for(let i=0;i<n;i++){let a=i/n*TAU,b=(i+1)/n*TAU,p=[x+Math.cos(a)*r,y,z+Math.sin(a)*r],q=[x+Math.cos(b)*r,y,z+Math.sin(b)*r],u=[x+Math.cos(a)*rTop,y+h,z+Math.sin(a)*rTop],v=[x+Math.cos(b)*rTop,y+h,z+Math.sin(b)*rTop];g.quad(p,u,v,q,c,em);g.tri([x,y+h,z],v,u,c,em);g.tri([x,y,z],p,q,c,em);}return this;}
    ring(r0,r1,y,h,x=0,z=0,c=this.P.accent,em=0,a0=0,a1=TAU,n=72){for(let i=0;i<n;i++){let a=a0+(a1-a0)*i/n,b=a0+(a1-a0)*(i+1)/n,p=(r,Y,A)=>[x+Math.cos(A)*r,Y,z+Math.sin(A)*r],g=this.g;g.quad(p(r0,y,a),p(r0,y,b),p(r1,y,b),p(r1,y,a),c,em);g.quad(p(r0,y+h,a),p(r1,y+h,a),p(r1,y+h,b),p(r0,y+h,b),c,em);g.quad(p(r1,y,a),p(r1,y,b),p(r1,y+h,b),p(r1,y+h,a),c,em);g.quad(p(r0,y,b),p(r0,y,a),p(r0,y+h,a),p(r0,y+h,b),c,em);}return this;}
    sphere(pos,r,c=this.P.accent,em=0){let g=this.g;const at=(a,b)=>[pos[0]+r*Math.sin(b)*Math.cos(a),pos[1]+r*Math.cos(b),pos[2]+r*Math.sin(b)*Math.sin(a)];for(let j=0;j<10;j++)for(let i=0;i<16;i++)g.quad(at(i/16*TAU,j/10*Math.PI),at((i+1)/16*TAU,j/10*Math.PI),at((i+1)/16*TAU,(j+1)/10*Math.PI),at(i/16*TAU,(j+1)/10*Math.PI),c,em);return this;}
    plane(pos,w,h,rot,c,em=0){let m=M.compose(pos,rot),ps=[[-w/2,-h/2,0],[w/2,-h/2,0],[w/2,h/2,0],[-w/2,h/2,0]].map(p=>M.transform(m,p));this.g.quad(...ps,c,em);return this;}
    panel(pos,w,h,rot=[-.30,0,0],tile=0){let old=this.group,P=this.P,m=M.compose(pos,rot),at=p=>M.transform(m,p);this.use('furniture').solid([w+.16,h+.16,.12],pos,P.dark,rot,.05);this.box([w+.06,h+.06,.026],at([0,0,.069]),P.black,0,rot);
      this.use('screens');let ps=[[-w/2,-h/2,.088],[w/2,-h/2,.088],[w/2,h/2,.088],[-w/2,h/2,.088]].map(at);let u0=(tile%4)/4+.004,u1=(tile%4+1)/4-.004,v0=1-(Math.floor(tile/4)+1)/2+.009,v1=1-Math.floor(tile/4)/2-.009;
      this.g.tri(ps[0],ps[1],ps[2],P.accent,1,0,null,[[u0,v0],[u1,v0],[u1,v1]]);this.g.tri(ps[0],ps[2],ps[3],P.accent,1,0,null,[[u0,v0],[u1,v1],[u0,v1]]);
      this.use('trim');for(let s of [-1,1])this.box([.025,.025,.025],at([s*(w/2+.05),h/2+.055,.072]),P.edge,.1,rot);this.box([w*.2,.014,.018],at([-w*.32,-h/2-.055,.07]),P.accent,.8,rot);this.use(old);return this;
    }
    label(pos,w,h,rot,tile=0){let old=this.group;this.use('labels');let m=M.compose(pos,rot),ps=[[-w/2,-h/2,0],[w/2,-h/2,0],[w/2,h/2,0],[-w/2,h/2,0]].map(p=>M.transform(m,p)),u0=tile%4/4+.004,u1=(tile%4+1)/4-.004,v0=1-(Math.floor(tile/4)+1)/4+.006,v1=1-Math.floor(tile/4)/4-.006;this.g.tri(ps[0],ps[1],ps[2],this.P.white,1,0,null,[[u0,v0],[u1,v0],[u1,v1]]);this.g.tri(ps[0],ps[2],ps[3],this.P.white,1,0,null,[[u0,v0],[u1,v1],[u0,v1]]);this.use(old);return this;}
    chair(x,y,z,yaw=0,scale=1,command=false){let old=this.group,P=this.P,m=M.compose([x,y,z],[0,yaw,0],[scale,scale,scale]),s=(sz,p,c,rx=0)=>this.solid(sz.map(v=>v*scale),M.transform(m,p),c,[rx,yaw,0],.05*scale);this.use('furniture');s([.54,.12,.57],[0,.51,0],P.dark);s([.46,.12,.49],[0,.59,-.02],P.seat);s([.53,.82,.17],[0,.99,.23],P.dark,-.09);s([.42,.67,.085],[0,1.03,.125],P.seat,-.09);s([.4,.22,.16],[0,1.53,.24],P.dark);s([.32,.16,.07],[0,1.55,.145],P.seat);s([.16,.45,.16],[0,.25,.04],P.metal);
      for(let sgn of [-1,1]){s([.095,.25,.11],[sgn*.35,.66,.08],P.metal);s([.13,.11,.54],[sgn*.35,.81,-.04],P.dark);s([.018,.025,.22],[sgn*.35,.877,-.12],P.accent);s([.055,.025,.05],[sgn*.35,.88,-.28],P.amber);}
      for(let a=0;a<5;a++){let q=a/5*TAU;this.beam(M.transform(m,[0,.09,.04]),M.transform(m,[Math.sin(q)*.42,.09,Math.cos(q)*.42]),.065*scale,P.metal);}
      if(command){s([.64,1.18,.12],[0,1.09,.39],P.metal);s([.54,.045,.022],[0,1.58,.466],P.accent);}
      this.use(old);return this;
    }
    person(x,y,z,yaw=0,seated=true){let old=this.group;this.use('crew');let P=this.P,m=M.compose([x,y,z],[0,yaw,0]),at=p=>M.transform(m,p),uniform=rgb(0x41505a),boots=rgb(0x16232b),head=rgb(0x909186);this.solid([.39,.5,.25],at([0,seated?1.05:1.21,0]),uniform,[.04,yaw,0],.075);this.sphere(at([0,seated?1.49:1.66,-.015]),.135,head);this.solid([.41,.075,.26],at([0,seated?1.28:1.45,0]),P.dark,[0,yaw,0],.025);
      for(let s of [-1,1]){let shoulder=[s*.22,seated?1.2:1.4,0],elbow=[s*.25,seated?.91:1.12,-.1],hand=[s*.25,seated?.89:.92,seated?-.36:-.07];this.beam(at(shoulder),at(elbow),.12,uniform);this.beam(at(elbow),at(hand),.10,uniform);this.sphere(at(hand),.055,head);if(seated){this.beam(at([s*.13,.78,0]),at([s*.14,.61,-.4]),.16,uniform);this.beam(at([s*.14,.61,-.4]),at([s*.14,.15,-.45]),.12,uniform);this.solid([.17,.13,.3],at([s*.14,.09,-.51]),boots,[0,yaw,0]);}else{this.beam(at([s*.11,.96,0]),at([s*.15,.17,-.02]),.15,uniform);this.solid([.17,.14,.31],at([s*.15,.08,-.10]),boots,[0,yaw,0]);}}
      this.box([.08,.043,.013],at([.095,seated?1.18:1.34,-.133]),P.accent,.6,[0,yaw,0]);this.use(old);return this;
    }
    station(x,y,z,yaw=0,tile=0,crew=false,w=2.2){let P=this.P,m=M.compose([x,y,z],[0,yaw,0]),at=p=>M.transform(m,p),old=this.group;this.use('furniture');this.solid([w,.19,1.05],at([0,.91,0]),P.panel,[0,yaw,0],.10);for(let s of [-1,1])this.solid([.21,.87,.72],at([s*(w/2-.2),.43,.06]),P.dark,[0,yaw,0],.06);this.solid([w*.91,.08,.68],at([0,1.055,.09]),P.black,[-.07,yaw,0],.03);this.panel(at([0,1.34,-.33]),w*.7,.51,[-.38,yaw,0],tile);
      for(let i=0;i<10;i++)this.box([.09,.015,.045],at([-.51+i*.115,1.105,.31]),i<3?P.accent:P.edge,i<3?.7:0,[0,yaw,0]);for(let s of [-1,1]){this.box([.085,.018,.065],at([s*(w/2-.23),1.106,.2]),P.amber,.65,[0,yaw,0]);this.box([.055,.075,.055],at([s*(w/2-.23),1.14,.35]),P.dark,0,[0,yaw,0]);}
      let cp=at([0,0,1.05]);this.chair(...cp,yaw);if(crew)this.person(...cp,yaw,true);this.obstacles.push({x,z,rx:w/2,rz:.6});this.use(old);return this;
    }
    rail(a,b,y,color=this.P.metal,glass=false){let old=this.group;this.use('trim');let len=V.length(V.sub(b,a)),n=Math.ceil(len/2.4);for(let i=0;i<=n;i++){let p=a.map((v,k)=>mix(v,b[k],i/n));this.beam([p[0],y,p[2]],[p[0],y+1.05,p[2]],.047,color);}
      this.beam([a[0],y+1.04,a[2]],[b[0],y+1.04,b[2]],.07,color);this.beam([a[0],y+.17,a[2]],[b[0],y+.17,b[2]],.037,color);
      if(glass){this.use('glass');this.g.quad([a[0],y+.2,a[2]],[b[0],y+.2,b[2]],[b[0],y+.97,b[2]],[a[0],y+.97,a[2]],this.P.accent,.1);}this.use(old);return this;
    }
    stairs(x,z,w,count,rise,run,y0=0){let old=this.group;this.use('floor');for(let i=0;i<count;i++){this.solid([w,(i+1)*rise,run+.012],[x,y0+(i+1)*rise/2,z+i*run],this.P.floor,[0,0,0],.02);this.box([w-.14,.021,.04],[x,y0+(i+1)*rise+.012,z+i*run-run*.36],this.P.accent,.7);}this.use(old);return this;}
    tiles(w,z0,z1,y=0,step=1.8){let old=this.group;this.use('floor');this.box([w,.24,z1-z0],[0,y-.12,(z0+z1)/2],this.P.dark);for(let x=-w/2+step/2;x<w/2;x+=step)for(let z=z0+step/2;z<z1;z+=step){this.box([Math.min(step-.045,w/2-x+step/2-.05),.022,Math.min(step-.045,z1-z+step/2-.05)],[x,y+.011,z],this.P.floor);if((Math.round((x+w/2)/step)+Math.round((z-z0)/step))%3===0){this.box([.07,.006,.18],[x-step*.34,y+.026,z-step*.33],this.P.metal);}}
      this.use(old);return this;
    }
    door(x,y,z,w,h,yaw=0){let old=this.group,P=this.P,m=M.compose([x,y,z],[0,yaw,0]),at=p=>M.transform(m,p);this.use('walls');this.solid([w+.75,h+.48,.32],at([0,h/2,0]),P.dark,[0,yaw,0],.10);for(let s of [-1,1]){this.solid([w/2-.035,h-.15,.11],at([s*w/4,h/2,.21]),P.metal,[0,yaw,0],.065);this.solid([w*.27,h*.61,.042],at([s*w*.26,h*.5,.286]),P.panel,[0,yaw,0],.045);this.box([.024,h*.84,.032],at([s*(w/2+.13),h/2,.21]),P.accent,.95,[0,yaw,0]);}this.label(at([0,h+.12,.22]),w,.28,[0,yaw,0],3);this.label(at([0,h*.65,.312]),w*.56,.31,[0,yaw,0],8);this.use(old);return this;}
    cabinet(x,y,z,yaw=0){let old=this.group,P=this.P,m=M.compose([x,y,z],[0,yaw,0]),at=p=>M.transform(m,p);this.use('furniture');this.solid([1.25,2.25,.65],at([0,1.125,0]),P.dark,[0,yaw,0],.075);this.solid([1.10,2.09,.05],at([0,1.14,.34]),P.panel,[0,yaw,0],.035);for(let i=0;i<8;i++)this.box([.8,.045,.025],at([0,.48+i*.083,.381]),P.black,0,[0,yaw,0]);this.panel(at([0,1.66,.41]),.72,.31,[0,yaw,0],2);this.box([.045,.45,.048],at([.44,1.28,.40]),P.metal,0,[0,yaw,0]);this.use(old);return this;}
    window(a,b,bottom,top){let old=this.group,P=this.P;this.use('walls');this.beam([a[0],bottom-.1,a[1]],[b[0],bottom-.1,b[1]],.34,P.metal,0,.38);this.beam([a[0],top+.10,a[1]],[b[0],top+.10,b[1]],.4,P.panel,0,.4);this.beam([a[0],bottom,a[1]],[a[0],top,a[1]],.19,P.dark,0,.30);this.beam([a[0],bottom,a[1]],[a[0],top,a[1]],.047,P.edge,0,.33);this.use('glass');this.g.quad([a[0],bottom,a[1]],[b[0],bottom,b[1]],[b[0],top,b[1]],[a[0],top,a[1]],P.accent,0);this.use(old);return this;}
    holo(x,y,z,r=1){let old=this.group,P=this.P;this.use('holo');for(let j=1;j<6;j++){let a=j/6*Math.PI,rr=Math.sin(a)*r,yy=y+Math.cos(a)*r;this.ring(rr-.012,rr+.012,yy,.012,x,z,P.accent,1,0,TAU,64);}for(let k=0;k<6;k++){let a=k/6*Math.PI;for(let i=0;i<60;i++){let p=i/60*TAU,q=(i+1)/60*TAU;this.beam([x+Math.cos(a)*Math.cos(p)*r,y+Math.sin(p)*r,z+Math.sin(a)*Math.cos(p)*r],[x+Math.cos(a)*Math.cos(q)*r,y+Math.sin(q)*r,z+Math.sin(a)*Math.cos(q)*r],.012,P.accent,1);}}
      this.ring(r*1.15,r*1.15+.025,y-r*.45,.016,x,z,P.accent,1);const rnd=seeded(870);for(let i=0;i<23;i++){let a=rnd()*TAU,b=rnd()*Math.PI,rr=r*(.65+rnd()*.45);this.sphere([x+Math.cos(a)*Math.sin(b)*rr,y+Math.cos(b)*rr,z+Math.sin(a)*Math.sin(b)*rr],r*.028,i%4===0?P.amber:P.white,.9);}this.use(old);return this;}
    table(x,y,z,r=1.5,globe=true){let old=this.group,P=this.P;this.use('furniture');this.cylinder(r*.72,.55,[x,y,z],P.dark,8);this.cylinder(r,.22,[x,y+.55,z],P.metal,8);this.cylinder(r*.91,.035,[x,y+.786,z],P.black,48);this.ring(r*.78,r*.8,y+.83,.014,x,z,P.accent,.7);this.ring(r*.96,r*.98,y+.76,.025,x,z,P.accent,.9);for(let i=0;i<8;i++){let a=i/8*TAU;this.panel([x+Math.sin(a)*r*.85,y+.90,z+Math.cos(a)*r*.85],r*.44,r*.22,[-1.08,a,0],i%8);}if(globe)this.holo(x,y+1.5,z,r*.43);this.use(old);return this;}
  }


function buildRoom(){
 const b=new InteriorBuilder({accent:0x8bb2bd});const P=b.P;
 Object.assign(P,{floor:rgb(0x39454e),panel:rgb(0x415360),pale:rgb(0x81939c),dark:rgb(0x15242f),black:rgb(0x070f17),metal:rgb(0x627480),seat:rgb(0x202e3a),edge:rgb(0x899ca4),accent:rgb(0x82b9c7),white:rgb(0xe3dfd0),amber:rgb(0xd6b386)});
 b.tiles(32,-8.5,34,0,2);b.use('floor').solid([10,1.7,6],[0,.85,5.2],P.floor,[0,0,0],.12);
 for(let s of[-1,1]){b.solid([2.95,1.0,5.8],[s*3.5,.50,.35],P.floor,[0,0,0],.10);b.solid([9.1,1.15,11.6],[s*10.15,.575,-2.4],P.dark,[0,0,0],.08);}
 b.stairs(0,-4.8,3.6,8,1.7/8,.60);b.stairs(0,8.4,5.1,6,.20,.54,.5);
 // Tall panoramic aperture. One continuous forward pane, with no central pillar.
 b.window([-14,-8.55],[14,-8.55],1.14,7.75);
 b.use('walls').solid([30,1.52,.64],[0,8.65,-8.55],P.dark,[0,0,0],.1);
 b.use('trim').beam([-13.8,7.74,-8.15],[13.8,7.74,-8.15],.036,P.white,.78);
 for(let s of[-1,1]){
  b.window([s*14,-8.55],[s*16,-3.5],1.14,7.75);
  b.use('walls').solid([.65,9.45,37.5],[s*16,4.7,15.3],P.dark,[0,0,0],.1);
  b.solid([2.2,3.9,.42],[s*10.6,3.07,-7.9],P.panel,[0,-s*.27,0],.14);
  b.solid([1.83,3.54,.08],[s*10.54,3.1,-7.59],P.dark,[0,-s*.27,0],.04);
  b.label([s*10.5,3.1,-7.48],1.4,.8,[0,-s*.27,0],s<0?0:9);
  b.beam([s*10.2,1.0,-8.50],[s*13.2,7.75,-8.50],.28,P.metal,0,.45);
  b.beam([s*10.2,1.0,-8.37],[s*13.2,7.75,-8.37],.055,P.edge,0,.10);
  b.use('walls').solid([15.0,1.07,.58],[s*7.5,.55,-8.4],P.panel,[0,0,0],.08);
  b.use('trim').beam([s*1.92,.055,-7.9],[s*1.92,.055,-4.6],.032,P.white,.68);
  // Operators sit on a shallow lower deck, outside the centre sightline.
  for(let j=0;j<3;j++)b.station(s*(5.2+j*3),1.15,-7.10,-s*.045,j%2===0?2:3,true,2.7);
  for(let j=0;j<4;j++)b.station(s*(j%2===0?10.4:7.4),.1,3.7+j*5.35,-s*.25,(j+4)%8,j!==2,3.25);
  b.use('floor').solid([4.3,2.05,17.7],[s*12.9,1.025,24.8],P.floor,[0,0,0],.08);
  for(let z of[19,24.5,30])b.station(s*13,2.05,z,-s*Math.PI/2,4,true,2.6);
  b.rail([s*10.66,0,16.1],[s*10.66,0,33],2.05,P.metal,true);
  b.stairs(s*12.8,11.4,3.6,8,2.05/8,.54);
  for(let j=0;j<6;j++){
   const z=1.0+j*5.5;
   b.use('walls').solid([.22,6.4,5.14],[s*15.61,4.54,z],P.panel,[0,0,0],.10);
   b.solid([.32,1.8,4.96],[s*15.45,1.0,z],P.dark,[0,0,0],.04);
   b.beam([s*15.46,.05,z-2.68],[s*15.46,7.4,z-2.68],.27,P.metal);
   b.beam([s*15.46,7.4,z-2.68],[s*12.4,9.18,z-2.68],.30,P.metal);
   b.use('trim').beam([s*15.29,7.3,z-2.60],[s*12.35,9.10,z-2.60],.035,P.white,.78);
   if(j%2===0)b.panel([s*15.36,4.5,z],3.9,1.60,[0,-s*Math.PI/2,0],j+2);
   b.use('trim').beam([s*15.31,2.3,z-2.1],[s*15.31,2.3,z+2.1],.028,P.accent,.45);
  }
 }
 // Front edge of the ceiling frames the panorama at the top of the image.
 b.use('roof').solid([32,.55,43.1],[0,9.38,12.75],P.dark,[0,0,0],.10);
 for(let z of[-7.8,-1.0,7,15,23,31]){
  b.solid([30.7,.35,.58],[0,8.88,z],P.panel,[0,0,0],.07);
  for(let s of[-1,1]){b.box([11.7,.045,.09],[s*7.65,8.675,z+.2],P.white,.78);b.solid([.28,.22,3.3],[s*8.1,8.99,z+1.9],P.metal,[0,0,0],.03);b.box([.035,.025,2.8],[s*8.06,8.86,z+1.9],P.amber,.74);}
 }
 b.use('roof').solid([5.8,.28,42],[0,9.01,12.3],P.panel,[0,0,0],.08);
 for(let z of[-4,4,12,20,28]){b.solid([4.8,.05,6.2],[0,8.835,z],P.dark,[0,0,0],.08);for(let s of[-1,1])b.box([.022,.012,4.3],[s*2.15,8.80,z],P.metal,.0);}
 b.chair(0,1.7,3.25,0,1.26,true);
 // The larger hall continues behind the operational seat.
 b.use('floor').solid([6.8,.5,22],[0,.25,21.8],P.floor,[0,0,0],.08);
 for(let s of[-1,1]){b.use('trim').beam([s*3.30,.523,11.2],[s*3.30,.523,32.3],.025,P.white,.65);b.person(s*4.75,0,18.5,s*.6,false);b.cabinet(s*8,0,31,Math.PI);}
 b.label([0,.525,26],3.9,1,[-Math.PI/2,0,0],6);
 b.use('walls').solid([32,9.6,.65],[0,4.75,34],P.dark,[0,0,0],.10);
 b.door(0,.5,33.56,3.6,5.6,Math.PI);
 for(let s of[-1,1]){b.use('walls').solid([9.4,6.7,.22],[s*9.3,4.6,33.55],P.panel,[0,0,0],.11);b.panel([s*9.3,4.3,33.37],7.5,2.9,[0,Math.PI,0],s<0?4:3);b.label([s*9.3,7.5,33.35],5.1,.55,[0,Math.PI,0],s<0?10:14);}
 b.label([0,7.5,33.52],4.7,.57,[0,Math.PI,0],2);
 return {groups:b.groups,obstacles:b.obstacles};
}

return buildRoom;})();
export const buildHorizon=(()=>{
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


  const INTERIOR_SPECS = [
    {id:0,name:'游隼 · 单座驾驶舱',short:'单座战机',en:'PEREGRINE / FLIGHT DECK',code:'HF–01',dim:'3.6 × 5.8 × 3.0 m',desc:'包覆式座舱 · 双侧操纵台 · 装甲舱盖',w:3.6,d:5.8,h:3,front:-3.8,back:2,eye:[0,1.48,.6],target:[0,1.45,-4],scale:1,accent:0x71cee2,ship:3,views:[['驾驶席',[0,1.48,.6],[0,1.45,-4]],['侧控台',[.65,1.6,.85],[-.85,.65,-1.15]],['舱后回望',[0,1.85,-2.05],[0,1.15,1.5]],['舱盖结构',[0,.95,.2],[.3,2.6,-.85]]]},
    {id:1,name:'玄武 · 重型战舰舰桥',short:'重型战舰',en:'BASTION / CAPITAL BRIDGE',code:'BB–01',dim:'24 × 28 × 7.5 m',desc:'分层指挥甲板 · 双舷操作席 · 前向全景舷窗',w:24,d:28,h:7.5,front:-18,back:10,eye:[0,3.1,7.25],target:[0,2.65,-16],scale:1,accent:0x6bc6db,ship:4,views:[['指挥席',[0,3.1,7.25],[0,2.65,-16]],['左舷全景',[-8.5,3.7,5.6],[1,1.7,-8]],['战术桌',[2.6,2.45,.1],[0,1.4,-3]],['后舱回望',[0,2.05,-12.8],[0,2.2,8.6]]]},
    {id:2,name:'天穹 · 宇宙堡垒旗舰',short:'宇宙堡垒',en:'EMPYREAN / FORTRESS COMMAND',code:'FC–01',dim:'64 × 70 × 22 m',desc:'中央指挥长廊 · 下沉式作战区 · 双层侧廊',w:64,d:70,h:22,front:-45,back:25,eye:[0,6.4,19.1],target:[0,5.7,-36],scale:1,accent:0xd8b67a,ship:4,views:[['旗舰指挥席',[0,6.4,19.1],[0,5.7,-36]],['上层侧廊',[-23,10,10],[0,3.4,-11]],['中央星图',[7,5.5,-5],[0,4.1,-13]],['大厅回望',[0,4,-33],[0,6.5,21]]]},
    {id:3,name:'深潜 · 装甲战术舱',short:'自由设计 A',en:'ABYSS / ARMOURED CITADEL',code:'CONCEPT–A',dim:'18 × 23 × 6 m',desc:'封闭式装甲舱 · 八角作战桌 · 嵌入式态势墙',w:18,d:23,h:6,front:-14,back:9,eye:[0,2.9,6.7],target:[0,2.2,-10],scale:1,accent:0xda9470,ship:4,views:[['战术指挥席',[0,2.9,6.7],[0,2.2,-10]],['侧向观察',[-6.6,2.8,3.6],[1,1.3,-3]],['作战桌',[2.6,2.5,.3],[0,1.6,-3.3]],['舱后回望',[0,2.25,-9],[0,2.2,7.8]]]},
    {id:4,name:'远眺 · 环景探索舰桥',short:'自由设计 B',en:'HORIZON / PANORAMIC BRIDGE',code:'CONCEPT–B',dim:'直径 28 m · 高 9 m',desc:'环形全景舷窗 · 弧面导航席 · 中央观测平台',w:28,d:28,h:9,front:-14,back:14,eye:[0,2.9,8],target:[0,2.3,-12],scale:1,accent:0x77baca,ship:4,views:[['观测指挥席',[0,2.9,8],[0,2.3,-12]],['弧形导航席',[-7.6,2.4,1.5],[0,1.5,-6]],['中央星图',[2.9,2.3,0],[0,1.1,-2]],['全景回望',[0,2.5,-10],[0,2.5,9]]]}
  ];
  class InteriorBuilder {
    constructor(spec){this.spec=spec;this.groups={};for(const k of ['floor','walls','roof','furniture','trim','crew','glass','screens','labels','holo'])this.groups[k]=new Geometry();this.group='furniture';this.obstacles=[];this.P={floor:rgb(0x28343d),panel:rgb(0x73818a),pale:rgb(0xb7c0c1),dark:rgb(0x17232e),black:rgb(0x080f16),metal:rgb(0x465866),seat:rgb(0x293d49),edge:rgb(0x90a0a6),accent:rgb(spec.accent),white:rgb(0xe2e6df),amber:rgb(0xdda867)};}
    use(k){this.group=k;return this;}
    get g(){return this.groups[this.group];}
    solid(size,pos,c=this.P.panel,rot=[0,0,0],bevel=.055,em=0){
      let [w,h,d]=size,b=Math.min(bevel,w*.24,h*.24,d*.24);if(Math.min(w,h,d)<=0)return;
      const mat=M.compose(pos,rot),g=this.g;
      const ring=(y,W,D)=>{const k=Math.min(b,W*.2,D*.2);return [[-W/2+k,y,-D/2],[W/2-k,y,-D/2],[W/2,y,-D/2+k],[W/2,y,D/2-k],[W/2-k,y,D/2],[-W/2+k,y,D/2],[-W/2,y,D/2-k],[-W/2,y,-D/2+k]].map(v=>M.transform(mat,v));};
      const rings=[ring(-h/2,w-2*b,d-2*b),ring(-h/2+b,w,d),ring(h/2-b,w,d),ring(h/2,w-2*b,d-2*b)];
      for(let k=0;k<3;k++)for(let i=0;i<8;i++)g.quad(rings[k][i],rings[k][(i+1)%8],rings[k+1][(i+1)%8],rings[k+1][i],c,em);
      for(let i=1;i<7;i++){g.tri(rings[0][0],rings[0][i+1],rings[0][i],c,em);g.tri(rings[3][0],rings[3][i],rings[3][i+1],c,em);}
      return this;
    }
    box(size,pos,c=this.P.panel,em=0,rot=[0,0,0]){this.g.box(size,pos,c,0,rot,em);return this;}
    beam(a,b,w,c=this.P.metal,em=0,depth=w){let start=this.g.data.length;this.g.beam(a,b,w,depth,c);if(em)for(let i=start+9;i<this.g.data.length;i+=13)this.g.data[i]=em;return this;}
    cylinder(r,h,pos,c=this.P.metal,n=24,em=0,rTop=r){let [x,y,z]=pos,g=this.g;for(let i=0;i<n;i++){let a=i/n*TAU,b=(i+1)/n*TAU,p=[x+Math.cos(a)*r,y,z+Math.sin(a)*r],q=[x+Math.cos(b)*r,y,z+Math.sin(b)*r],u=[x+Math.cos(a)*rTop,y+h,z+Math.sin(a)*rTop],v=[x+Math.cos(b)*rTop,y+h,z+Math.sin(b)*rTop];g.quad(p,u,v,q,c,em);g.tri([x,y+h,z],v,u,c,em);g.tri([x,y,z],p,q,c,em);}return this;}
    ring(r0,r1,y,h,x=0,z=0,c=this.P.accent,em=0,a0=0,a1=TAU,n=72){for(let i=0;i<n;i++){let a=a0+(a1-a0)*i/n,b=a0+(a1-a0)*(i+1)/n,p=(r,Y,A)=>[x+Math.cos(A)*r,Y,z+Math.sin(A)*r],g=this.g;g.quad(p(r0,y,a),p(r0,y,b),p(r1,y,b),p(r1,y,a),c,em);g.quad(p(r0,y+h,a),p(r1,y+h,a),p(r1,y+h,b),p(r0,y+h,b),c,em);g.quad(p(r1,y,a),p(r1,y,b),p(r1,y+h,b),p(r1,y+h,a),c,em);g.quad(p(r0,y,b),p(r0,y,a),p(r0,y+h,a),p(r0,y+h,b),c,em);}return this;}
    sphere(pos,r,c=this.P.accent,em=0){let g=this.g;const at=(a,b)=>[pos[0]+r*Math.sin(b)*Math.cos(a),pos[1]+r*Math.cos(b),pos[2]+r*Math.sin(b)*Math.sin(a)];for(let j=0;j<10;j++)for(let i=0;i<16;i++)g.quad(at(i/16*TAU,j/10*Math.PI),at((i+1)/16*TAU,j/10*Math.PI),at((i+1)/16*TAU,(j+1)/10*Math.PI),at(i/16*TAU,(j+1)/10*Math.PI),c,em);return this;}
    plane(pos,w,h,rot,c,em=0){let m=M.compose(pos,rot),ps=[[-w/2,-h/2,0],[w/2,-h/2,0],[w/2,h/2,0],[-w/2,h/2,0]].map(p=>M.transform(m,p));this.g.quad(...ps,c,em);return this;}
    panel(pos,w,h,rot=[-.30,0,0],tile=0){let old=this.group,P=this.P,m=M.compose(pos,rot),at=p=>M.transform(m,p);this.use('furniture').solid([w+.16,h+.16,.12],pos,P.dark,rot,.05);this.box([w+.06,h+.06,.026],at([0,0,.069]),P.black,0,rot);
      this.use('screens');let ps=[[-w/2,-h/2,.088],[w/2,-h/2,.088],[w/2,h/2,.088],[-w/2,h/2,.088]].map(at);let u0=(tile%4)/4+.004,u1=(tile%4+1)/4-.004,v0=1-(Math.floor(tile/4)+1)/2+.009,v1=1-Math.floor(tile/4)/2-.009;
      this.g.tri(ps[0],ps[1],ps[2],P.accent,1,0,null,[[u0,v0],[u1,v0],[u1,v1]]);this.g.tri(ps[0],ps[2],ps[3],P.accent,1,0,null,[[u0,v0],[u1,v1],[u0,v1]]);
      this.use('trim');for(let s of [-1,1])this.box([.025,.025,.025],at([s*(w/2+.05),h/2+.055,.072]),P.edge,.1,rot);this.box([w*.2,.014,.018],at([-w*.32,-h/2-.055,.07]),P.accent,.8,rot);this.use(old);return this;
    }
    label(pos,w,h,rot,tile=0){let old=this.group;this.use('labels');let m=M.compose(pos,rot),ps=[[-w/2,-h/2,0],[w/2,-h/2,0],[w/2,h/2,0],[-w/2,h/2,0]].map(p=>M.transform(m,p)),u0=tile%4/4+.004,u1=(tile%4+1)/4-.004,v0=1-(Math.floor(tile/4)+1)/4+.006,v1=1-Math.floor(tile/4)/4-.006;this.g.tri(ps[0],ps[1],ps[2],this.P.white,1,0,null,[[u0,v0],[u1,v0],[u1,v1]]);this.g.tri(ps[0],ps[2],ps[3],this.P.white,1,0,null,[[u0,v0],[u1,v1],[u0,v1]]);this.use(old);return this;}
    chair(x,y,z,yaw=0,scale=1,command=false){let old=this.group,P=this.P,m=M.compose([x,y,z],[0,yaw,0],[scale,scale,scale]),s=(sz,p,c,rx=0)=>this.solid(sz.map(v=>v*scale),M.transform(m,p),c,[rx,yaw,0],.05*scale);this.use('furniture');s([.54,.12,.57],[0,.51,0],P.dark);s([.46,.12,.49],[0,.59,-.02],P.seat);s([.53,.82,.17],[0,.99,.23],P.dark,-.09);s([.42,.67,.085],[0,1.03,.125],P.seat,-.09);s([.4,.22,.16],[0,1.53,.24],P.dark);s([.32,.16,.07],[0,1.55,.145],P.seat);s([.16,.45,.16],[0,.25,.04],P.metal);
      for(let sgn of [-1,1]){s([.095,.25,.11],[sgn*.35,.66,.08],P.metal);s([.13,.11,.54],[sgn*.35,.81,-.04],P.dark);s([.018,.025,.22],[sgn*.35,.877,-.12],P.accent);s([.055,.025,.05],[sgn*.35,.88,-.28],P.amber);}
      for(let a=0;a<5;a++){let q=a/5*TAU;this.beam(M.transform(m,[0,.09,.04]),M.transform(m,[Math.sin(q)*.42,.09,Math.cos(q)*.42]),.065*scale,P.metal);}
      if(command){s([.64,1.18,.12],[0,1.09,.39],P.metal);s([.54,.045,.022],[0,1.58,.466],P.accent);}
      this.use(old);return this;
    }
    person(x,y,z,yaw=0,seated=true){let old=this.group;this.use('crew');let P=this.P,m=M.compose([x,y,z],[0,yaw,0]),at=p=>M.transform(m,p),uniform=rgb(0x41505a),boots=rgb(0x16232b),head=rgb(0x909186);this.solid([.39,.5,.25],at([0,seated?1.05:1.21,0]),uniform,[.04,yaw,0],.075);this.sphere(at([0,seated?1.49:1.66,-.015]),.135,head);this.solid([.41,.075,.26],at([0,seated?1.28:1.45,0]),P.dark,[0,yaw,0],.025);
      for(let s of [-1,1]){let shoulder=[s*.22,seated?1.2:1.4,0],elbow=[s*.25,seated?.91:1.12,-.1],hand=[s*.25,seated?.89:.92,seated?-.36:-.07];this.beam(at(shoulder),at(elbow),.12,uniform);this.beam(at(elbow),at(hand),.10,uniform);this.sphere(at(hand),.055,head);if(seated){this.beam(at([s*.13,.78,0]),at([s*.14,.61,-.4]),.16,uniform);this.beam(at([s*.14,.61,-.4]),at([s*.14,.15,-.45]),.12,uniform);this.solid([.17,.13,.3],at([s*.14,.09,-.51]),boots,[0,yaw,0]);}else{this.beam(at([s*.11,.96,0]),at([s*.15,.17,-.02]),.15,uniform);this.solid([.17,.14,.31],at([s*.15,.08,-.10]),boots,[0,yaw,0]);}}
      this.box([.08,.043,.013],at([.095,seated?1.18:1.34,-.133]),P.accent,.6,[0,yaw,0]);this.use(old);return this;
    }
    station(x,y,z,yaw=0,tile=0,crew=false,w=2.2){let P=this.P,m=M.compose([x,y,z],[0,yaw,0]),at=p=>M.transform(m,p),old=this.group;this.use('furniture');this.solid([w,.19,1.05],at([0,.91,0]),P.panel,[0,yaw,0],.10);for(let s of [-1,1])this.solid([.21,.87,.72],at([s*(w/2-.2),.43,.06]),P.dark,[0,yaw,0],.06);this.solid([w*.91,.08,.68],at([0,1.055,.09]),P.black,[-.07,yaw,0],.03);this.panel(at([0,1.34,-.33]),w*.7,.51,[-.38,yaw,0],tile);
      for(let i=0;i<10;i++)this.box([.09,.015,.045],at([-.51+i*.115,1.105,.31]),i<3?P.accent:P.edge,i<3?.7:0,[0,yaw,0]);for(let s of [-1,1]){this.box([.085,.018,.065],at([s*(w/2-.23),1.106,.2]),P.amber,.65,[0,yaw,0]);this.box([.055,.075,.055],at([s*(w/2-.23),1.14,.35]),P.dark,0,[0,yaw,0]);}
      let cp=at([0,0,1.05]);this.chair(...cp,yaw);if(crew)this.person(...cp,yaw,true);this.obstacles.push({x,z,rx:w/2,rz:.6});this.use(old);return this;
    }
    rail(a,b,y,color=this.P.metal,glass=false){let old=this.group;this.use('trim');let len=V.length(V.sub(b,a)),n=Math.ceil(len/2.4);for(let i=0;i<=n;i++){let p=a.map((v,k)=>mix(v,b[k],i/n));this.beam([p[0],y,p[2]],[p[0],y+1.05,p[2]],.047,color);}
      this.beam([a[0],y+1.04,a[2]],[b[0],y+1.04,b[2]],.07,color);this.beam([a[0],y+.17,a[2]],[b[0],y+.17,b[2]],.037,color);
      if(glass){this.use('glass');this.g.quad([a[0],y+.2,a[2]],[b[0],y+.2,b[2]],[b[0],y+.97,b[2]],[a[0],y+.97,a[2]],this.P.accent,.1);}this.use(old);return this;
    }
    stairs(x,z,w,count,rise,run,y0=0){let old=this.group;this.use('floor');for(let i=0;i<count;i++){this.solid([w,(i+1)*rise,run+.012],[x,y0+(i+1)*rise/2,z+i*run],this.P.floor,[0,0,0],.02);this.box([w-.14,.021,.04],[x,y0+(i+1)*rise+.012,z+i*run-run*.36],this.P.accent,.7);}this.use(old);return this;}
    tiles(w,z0,z1,y=0,step=1.8){let old=this.group;this.use('floor');this.box([w,.24,z1-z0],[0,y-.12,(z0+z1)/2],this.P.dark);for(let x=-w/2+step/2;x<w/2;x+=step)for(let z=z0+step/2;z<z1;z+=step){this.box([Math.min(step-.045,w/2-x+step/2-.05),.022,Math.min(step-.045,z1-z+step/2-.05)],[x,y+.011,z],this.P.floor);if((Math.round((x+w/2)/step)+Math.round((z-z0)/step))%3===0){this.box([.07,.006,.18],[x-step*.34,y+.026,z-step*.33],this.P.metal);}}
      this.use(old);return this;
    }
    door(x,y,z,w,h,yaw=0){let old=this.group,P=this.P,m=M.compose([x,y,z],[0,yaw,0]),at=p=>M.transform(m,p);this.use('walls');this.solid([w+.75,h+.48,.32],at([0,h/2,0]),P.dark,[0,yaw,0],.10);for(let s of [-1,1]){this.solid([w/2-.035,h-.15,.11],at([s*w/4,h/2,.21]),P.metal,[0,yaw,0],.065);this.solid([w*.27,h*.61,.042],at([s*w*.26,h*.5,.286]),P.panel,[0,yaw,0],.045);this.box([.024,h*.84,.032],at([s*(w/2+.13),h/2,.21]),P.accent,.95,[0,yaw,0]);}this.label(at([0,h+.12,.22]),w,.28,[0,yaw,0],3);this.label(at([0,h*.65,.312]),w*.56,.31,[0,yaw,0],8);this.use(old);return this;}
    cabinet(x,y,z,yaw=0){let old=this.group,P=this.P,m=M.compose([x,y,z],[0,yaw,0]),at=p=>M.transform(m,p);this.use('furniture');this.solid([1.25,2.25,.65],at([0,1.125,0]),P.dark,[0,yaw,0],.075);this.solid([1.10,2.09,.05],at([0,1.14,.34]),P.panel,[0,yaw,0],.035);for(let i=0;i<8;i++)this.box([.8,.045,.025],at([0,.48+i*.083,.381]),P.black,0,[0,yaw,0]);this.panel(at([0,1.66,.41]),.72,.31,[0,yaw,0],2);this.box([.045,.45,.048],at([.44,1.28,.40]),P.metal,0,[0,yaw,0]);this.use(old);return this;}
    window(a,b,bottom,top){let old=this.group,P=this.P;this.use('walls');this.beam([a[0],bottom-.1,a[1]],[b[0],bottom-.1,b[1]],.34,P.metal,0,.38);this.beam([a[0],top+.10,a[1]],[b[0],top+.10,b[1]],.4,P.panel,0,.4);this.beam([a[0],bottom,a[1]],[a[0],top,a[1]],.19,P.dark,0,.30);this.beam([a[0],bottom,a[1]],[a[0],top,a[1]],.047,P.edge,0,.33);this.use('glass');this.g.quad([a[0],bottom,a[1]],[b[0],bottom,b[1]],[b[0],top,b[1]],[a[0],top,a[1]],P.accent,0);this.use(old);return this;}
    holo(x,y,z,r=1){let old=this.group,P=this.P;this.use('holo');for(let j=1;j<6;j++){let a=j/6*Math.PI,rr=Math.sin(a)*r,yy=y+Math.cos(a)*r;this.ring(rr-.012,rr+.012,yy,.012,x,z,P.accent,1,0,TAU,64);}for(let k=0;k<6;k++){let a=k/6*Math.PI;for(let i=0;i<60;i++){let p=i/60*TAU,q=(i+1)/60*TAU;this.beam([x+Math.cos(a)*Math.cos(p)*r,y+Math.sin(p)*r,z+Math.sin(a)*Math.cos(p)*r],[x+Math.cos(a)*Math.cos(q)*r,y+Math.sin(q)*r,z+Math.sin(a)*Math.cos(q)*r],.012,P.accent,1);}}
      this.ring(r*1.15,r*1.15+.025,y-r*.45,.016,x,z,P.accent,1);const rnd=seeded(870);for(let i=0;i<23;i++){let a=rnd()*TAU,b=rnd()*Math.PI,rr=r*(.65+rnd()*.45);this.sphere([x+Math.cos(a)*Math.sin(b)*rr,y+Math.cos(b)*rr,z+Math.sin(a)*Math.sin(b)*rr],r*.028,i%4===0?P.amber:P.white,.9);}this.use(old);return this;}
    table(x,y,z,r=1.5,globe=true){let old=this.group,P=this.P;this.use('furniture');this.cylinder(r*.72,.55,[x,y,z],P.dark,8);this.cylinder(r,.22,[x,y+.55,z],P.metal,8);this.cylinder(r*.91,.035,[x,y+.786,z],P.black,48);this.ring(r*.78,r*.8,y+.83,.014,x,z,P.accent,.7);this.ring(r*.96,r*.98,y+.76,.025,x,z,P.accent,.9);for(let i=0;i<8;i++){let a=i/8*TAU;this.panel([x+Math.sin(a)*r*.85,y+.90,z+Math.cos(a)*r*.85],r*.44,r*.22,[-1.08,a,0],i%8);}if(globe)this.holo(x,y+1.5,z,r*.43);this.use(old);return this;}
  }

  function buildInterior(id){const s=INTERIOR_SPECS[id],b=new InteriorBuilder(s),P=b.P;
    if(id===0){
      b.tiles(3.6,-3.8,2,0,.6);b.use('walls').solid([3.6,1.08,.22],[0,.54,-3.66],P.dark);b.solid([3.6,3,.22],[0,1.5,1.93],P.panel);for(let side of [-1,1]){b.solid([.2,1.3,5.6],[side*1.74,.65,-.9],P.dark);b.solid([.2,2.1,1.1],[side*1.72,1.8,1.28],P.panel);b.window([side*1.66,-3.3],[side*1.74,-.6],1.19,2.6);b.window([side*1.74,-.6],[side*1.7,1.02],1.18,2.58);b.use('roof').beam([side*1.72,.95,-2.7],[side*.78,2.7,-1.9],.1,P.metal);b.beam([side*.78,2.7,-1.9],[side*.88,2.7,1.15],.08,P.metal);b.use('trim').beam([side*1.58,.35,-3.25],[side*1.58,.35,1.6],.024,P.accent,.8);}
      b.window([-1.66,-3.3],[0,-3.75],1.13,2.6);b.window([0,-3.75],[1.66,-3.3],1.13,2.6);b.use('roof').solid([1.95,.16,3.6],[0,2.85,-.35],P.dark);for(let x of [-.75,.75])b.box([.03,.02,2],[x,2.756,-.25],P.white,.9);b.use('furniture').solid([3.24,.38,.65],[0,.78,-2.52],P.dark);for(let i=0;i<3;i++)b.panel([(i-1)*.83,1.02,-2.29],.72,.45,[-.35,0,0],i);for(let side of [-1,1]){b.solid([.62,.64,2.2],[side*1.12,.52,-.71],P.metal);b.solid([.52,.09,2.05],[side*1.12,.90,-.72],P.black);b.panel([side*1.12,.99,-1.48],.38,.62,[-1.2,0,0],side<0?3:2);for(let i=0;i<7;i++)b.box([.045,.026,.07],[side*1.12+((i%2)-.5)*.14,.957,-.6+Math.floor(i/2)*.19],i%3===0?P.amber:P.accent,.6);b.cylinder(.045,.16,[side*.94,1.00,-.32],P.dark,12);b.solid([.08,.17,.1],[side*.94,1.18,-.30],P.dark,[.18,0,side*.15]);}
      b.use('glass');for(let side of [-1,1]){b.g.quad([side*1.74,2.6,-1.9],[side*.9,2.77,-1.9],[side*.9,2.77,1.15],[side*1.74,2.6,1.15],P.accent);b.g.quad([side*1.66,2.6,-3.3],[0,2.6,-3.75],[side*.9,2.77,-1.9],[side*1.74,2.6,-1.9],P.accent);}
      b.chair(0,0,.78,0,1.12,true);b.door(0,0,1.76,1.12,2.3,Math.PI);b.label([0,2.59,-2.7],1.2,.16,[0,0,0],0);b.use('furniture').box([.62,.1,.43],[0,.14,-.86],P.dark);for(let side of [-1,1])b.solid([.21,.07,.34],[side*.19,.29,-.83],P.metal,[-.4,0,0]);
    }
    if(id===1){
      b.tiles(24,-18,10,0,1.8);b.use('floor').solid([10,1.1,4.8],[0,.55,7.6],P.floor,[0,0,0],.13);b.stairs(0,3.28,4.6,5,.22,.4);for(let side of [-1,1]){b.rail([side*2.65,0,5.4],[side*2.65,0,9.8],1.1,P.metal,true);b.rail([side*2.7,0,5.23],[side*4.85,0,5.23],1.1,P.metal,true);b.use('trim').box([.034,.02,17],[side*2.4,.039,-4.85],P.accent,.9);b.box([.055,.02,4.2],[side*4.55,1.117,7.55],P.accent,.8);
        b.use('walls').solid([.45,7.5,24],[side*12,3.65,-2],P.dark);for(let z of [-10.6,-4.6,1.4,7.4]){b.solid([.20,4.7,5.45],[side*11.7,3.15,z],P.panel);b.solid([.24,.75,5.1],[side*11.55,1.05,z],P.metal);b.beam([side*11.55,.2,z-2.75],[side*11.55,6.9,z-2.75],.24,P.dark);b.use('trim').beam([side*11.36,5.63,z-2.25],[side*11.36,5.63,z+2.2],.035,P.white,.9);b.use('walls');}
        b.window([side*10,-18],[side*12,-13],1.5,6.5);for(let j=0;j<3;j++){let z=-8.2+j*5.15;b.station(side*6.1,0,z,side*-.15,j*2+(side>0?1:0),j!==1,2.6);}b.station(side*3.6,0,-13.4,side*-.12,0,true,2.45);b.cabinet(side*10.85,0,5.2,side===1?-Math.PI/2:Math.PI/2);b.cabinet(side*10.85,0,7.3,side===1?-Math.PI/2:Math.PI/2);b.person(side*9.15,0,1.2,side===1?-Math.PI/2:Math.PI/2,false);}
      for(let i=0;i<5;i++)b.window([-10+i*4,-18],[-6+i*4,-18],1.5,6.5);b.use('walls').solid([24,1.3,.48],[0,.62,-18],P.metal);b.solid([24,7.5,.5],[0,3.65,10],P.panel);b.door(0,1.1,9.64,3.0,4.2,Math.PI);for(let x of [-7.2,7.2]){b.panel([x,3.9,9.7],4.2,1.95,[0,Math.PI,0],5);b.label([x,6.1,9.65],4,.45,[0,Math.PI,0],x<0?4:5);}
      b.use('roof').solid([24,.45,28],[0,7.45,-4],P.dark);for(let z of [-13,-6,1,8]){b.solid([23,.34,.48],[0,6.95,z],P.metal);for(let side of [-1,1]){b.beam([side*11.6,5.6,z],[side*9,7.07,z],.28,P.metal);b.box([7.6,.04,.10],[side*5.1,6.745,z],P.white,.94);b.solid([2.6,.32,1.2],[side*6.8,7.02,z+2.5],P.panel);}}
      b.use('roof').box([2.8,.16,23],[0,7.05,-4],P.metal);for(let z=-14;z<6;z+=2)b.box([.9,.024,.65],[0,6.957,z],P.dark);b.table(0,.02,-3.1,1.55,true);b.chair(0,1.1,8.42,0,1.18,true);b.station(-3.65,1.1,7.05,0,4,false,1.5);b.station(3.65,1.1,7.05,0,2,true,1.5);b.label([0,6.7,-17.68],4.2,.48,[0,0,0],1);b.label([0,.048,1.25],3.6,1.0,[-Math.PI/2,0,0],6);for(let side of [-1,1])b.label([side*10.1,3.65,-15],1.65,.6,[0,-side*.55,0],side<0?4:5);
    }
    if(id===2){
      P.panel=rgb(0x888a87);P.pale=rgb(0xc4c2b6);P.floor=rgb(0x30383e);P.metal=rgb(0x545e64);b.tiles(64,-45,25,0,3.2);
      b.use('floor').solid([8,2.15,44],[0,1.075,-10],P.floor,[0,0,0],.16);b.solid([16,4.55,14],[0,2.275,18],P.floor,[0,0,0],.22);b.stairs(0,8.0,8.0,8,.30,.5,2.15);b.stairs(0,-35.8,8,7,2.15/7,.47,0);
      for(let side of [-1,1]){
        b.use('trim').beam([side*3.84,2.21,-31],[side*3.84,2.21,9],.048,P.accent,.95);b.rail([side*4.25,0,-30],[side*4.25,0,7.5],2.15,P.metal,true);b.rail([side*7.8,0,11.5],[side*7.8,0,24],4.55,P.metal,true);
        b.use('floor').solid([9.5,.62,51],[side*27.25,7.12,-1],P.metal,[0,0,0],.15);b.rail([side*22.55,0,-26.2],[side*22.55,0,24],7.44,P.pale,true);b.use('trim').beam([side*22.51,7.30,-26],[side*22.51,7.30,24],.09,P.accent,.95);b.use('walls').solid([.7,22,61],[side*32,10.85,-5.5],P.dark);
        for(let z of [-24,-10,4,18]){b.use('walls').solid([.25,5.9,12.6],[side*31.47,3.18,z],P.panel);b.solid([.38,10.5,12.4],[side*31.5,14.3,z],P.panel);b.beam([side*31,.1,z-6.6],[side*31,18.2,z-6.6],.65,P.metal);b.beam([side*31,18.2,z-6.6],[side*24,21.2,z-6.6],.6,P.metal);b.use('trim').beam([side*30.95,18.25,z-6.65],[side*24,21.2,z-6.65],.06,P.accent,.9);b.panel([side*31.03,12.4,z],8.8,3.2,[0,side===1?-Math.PI/2:Math.PI/2,0],5);}
        b.window([side*26,-45],[side*32,-34],3.4,18.2);
        for(let row=0;row<4;row++){let z=-24+row*9.3;for(let col=0;col<2;col++){let x=side*(9.5+col*8);b.station(x,0,z,side*-.10,(row*2+col)%8,row%2===0||col===1,3.1);}b.station(side*27.4,7.44,z+3,side===1?-.4:.4,(row+4)%8,row%2===0,2.65);}
        for(let z of [-23,-5,13]){b.use('walls').solid([.9,6.6,1.0],[side*25,3.3,z],P.metal);b.use('trim').box([.94,.08,1.04],[side*25,6.35,z],P.accent,.8);}
        b.stairs(side*18.6,12.8,4.0,15,7.44/15,.73,0);b.rail([side*20.65,0,12.6],[side*20.65,0,23.4],0,P.metal,false);b.cabinet(side*30,7.44,20,Math.PI);b.person(side*22.9,7.44,3,side===1?-Math.PI/2:Math.PI/2,false);
      }
      for(let i=0;i<5;i++)b.window([-26+i*52/5,-45],[-26+(i+1)*52/5,-45],3.4,18.2);
      b.use('walls').solid([64,3.2,.65],[0,1.5,-45],P.metal);b.solid([64,22,.75],[0,10.85,25],P.dark);for(let side of [-1,1]){b.solid([19,17,.2],[side*19.6,11.3,24.52],P.panel);b.panel([side*19.6,13.7,24.33],13,5.2,[0,Math.PI,0],5);b.label([side*19.5,18.8,24.3],13,1.2,[0,Math.PI,0],side<0?10:11);}b.door(0,4.55,24.42,6.5,8.1,Math.PI);b.label([0,19.5,24.4],13,1.3,[0,Math.PI,0],2);
      b.use('roof').solid([64,.8,70],[0,21.9,-10],P.dark);for(let z of [-32,-16,0,16]){b.solid([49,.75,.85],[0,20.75,z],P.metal);for(let side of [-1,1]){b.beam([side*30,17.8,z],[side*24,20.75,z],.7,P.metal);b.box([17,.08,.2],[side*13.5,20.31,z],P.white,.95);b.box([2,.08,.2],[side*3,20.31,z],P.accent,1);}}
      b.use('roof').box([5,.5,61],[0,21.13,-10],P.metal);for(let z=-32;z<15;z+=5)b.box([3.8,.05,1.5],[0,20.845,z],P.panel);b.ring(5.7,6.1,17.9,.5,0,-13,P.metal,0);b.ring(5.77,5.85,17.82,.07,0,-13,P.accent,1);for(let side of [-1,1])b.beam([side*4,18.1,-13],[side*5.5,21,-13],.22,P.metal);
      b.table(0,2.15,-13,3.65,true);b.table(-14.5,0,-32.5,2.3,false);b.table(14.5,0,-32.5,2.3,false);b.chair(0,4.55,21.7,0,1.5,true);for(let side of [-1,1]){b.station(side*5.3,4.55,17.8,side*-.1,side<0?4:1,true,2.4);b.person(side*7,4.55,23.0,0,false);}b.label([0,19.45,-44.5],15,1.45,[0,0,0],2);b.label([0,2.19,-3.8],6,1.5,[-Math.PI/2,0,0],6);b.label([0,4.59,15.4],7,1.5,[-Math.PI/2,0,0],12);
    }
    if(id===3){
      P.panel=rgb(0x42515a);P.floor=rgb(0x29343b);P.accent=rgb(0xd59469);b.tiles(18,-14,9,0,1.7);b.use('floor').solid([8,.9,4],[0,.45,7],P.floor,[0,0,0],.12);b.stairs(0,3.5,4,5,.18,.32);b.use('walls').solid([18,6,.6],[0,3,-14],P.dark);b.solid([18,6,.6],[0,3,9],P.panel);b.door(0,.9,8.61,2.7,3.7,Math.PI);
      for(let side of [-1,1]){b.use('walls').solid([.5,6,23],[side*9,3,-2.5],P.dark);for(let z=-11;z<8;z+=4.5){b.solid([.16,4.6,3.96],[side*8.68,2.8,z],P.panel);b.beam([side*8.4,.2,z-2],[side*8.4,4.5,z-2],.35,P.metal);b.beam([side*8.4,4.5,z-2],[side*6.7,5.6,z-2],.34,P.metal);b.use('trim').beam([side*8.31,1.1,z-1.7],[side*8.31,1.1,z+1.7],.035,P.accent,.9);b.use('walls');}b.cabinet(side*7.85,0,6.8,Math.PI);for(let i=0;i<3;i++)b.station(side*5.35,0,-8+i*4.3,side*-.35,(i+2)%8,i!==1,2.25);b.rail([side*3.85,0,5],[side*3.85,0,8.65],.9,P.metal,true);b.use('trim').box([.04,.021,15],[side*2.7,.03,-3.6],P.accent,.8);}
      b.panel([0,3.7,-13.52],8.5,3.0,[0,0,0],5);b.panel([-6.3,3.5,-13.52],3.45,2.6,[0,.08,0],2);b.panel([6.3,3.5,-13.52],3.45,2.6,[0,-.08,0],6);b.label([0,5.5,-13.49],6,.46,[0,0,0],9);b.table(0,0,-2.9,2.1,true);b.chair(0,.9,7.6,0,1.16,true);b.use('roof').solid([18,.5,23],[0,6.1,-2.5],P.dark);for(let z of [-10,-5,0,5]){b.solid([14.8,.32,.45],[0,5.65,z],P.metal);for(let side of [-1,1])b.box([5,.04,.095],[side*4.1,5.464,z],P.white,.85);}b.use('roof').ring(2.45,2.8,4.75,.28,0,-2.9,P.metal);b.ring(2.52,2.59,4.68,.025,0,-2.9,P.accent,1);for(let side of [-1,1])b.beam([side*2.6,4.94,-2.9],[side*3.2,6,-2.9],.15,P.metal);b.label([0,.04,1.4],4.5,.9,[-Math.PI/2,0,0],13);
    }
    if(id===4){
      P.panel=rgb(0xbdc6c4);P.pale=rgb(0xd4d9d2);P.dark=rgb(0x30414b);P.floor=rgb(0x52636b);P.metal=rgb(0x87989e);b.use('floor').cylinder(14,.3,[0,-.3,0],P.dark,96);b.cylinder(13.7,.025,[0,0,0],P.floor,96);b.ring(10.65,10.70,.039,.014,0,0,P.accent,.9);b.ring(5.4,5.44,.04,.016,0,0,P.pale,.1);b.ring(2.9,2.93,.051,.02,0,-2,P.accent,.9);for(let i=0;i<24;i++){let a=i/24*TAU;b.beam([Math.cos(a)*5.5,.036,Math.sin(a)*5.5],[Math.cos(a)*13.6,.036,Math.sin(a)*13.6],.028,P.metal);}
      for(let i=0;i<20;i++){let a=Math.PI*.12+i/20*Math.PI*1.76,c=Math.PI*.12+(i+1)/20*Math.PI*1.76;let p=[Math.sin(a)*13.72,Math.cos(a)*13.72],q=[Math.sin(c)*13.72,Math.cos(c)*13.72];b.window(p,q,.94,6.1);b.use('walls').beam([p[0],.4,p[1]],[q[0],.4,q[1]],.9,P.panel,0,.8);if(i%4===0){b.use('roof').beam([p[0],6.07,p[1]],[Math.sin(a)*5,8.45,Math.cos(a)*5],.16,P.metal);b.use('trim').beam([Math.sin(a)*13.5,6.2,Math.cos(a)*13.5],[Math.sin(a)*5,8.36,Math.cos(a)*5],.026,P.white,.95);}}
      b.use('glass');for(let i=0;i<64;i++){let a=i/64*TAU,c=(i+1)/64*TAU;b.g.quad([Math.cos(a)*13.72,6.12,Math.sin(a)*13.72],[Math.cos(c)*13.72,6.12,Math.sin(c)*13.72],[Math.cos(c)*4.75,8.5,Math.sin(c)*4.75],[Math.cos(a)*4.75,8.5,Math.sin(a)*4.75],P.accent);}
      b.use('roof').ring(4.7,5.25,8.27,.28,0,0,P.panel);b.ring(4.85,4.9,8.23,.025,0,0,P.accent,1);b.use('glass');for(let i=0;i<64;i++){let a=i/64*TAU,c=(i+1)/64*TAU;b.g.tri([0,8.82,0],[Math.cos(a)*4.75,8.5,Math.sin(a)*4.75],[Math.cos(c)*4.75,8.5,Math.sin(c)*4.75],P.accent);}
      b.use('walls').solid([9.8,6.8,.4],[0,3.4,12.83],P.panel);b.door(0,0,12.55,2.4,3.8,Math.PI);for(let side of [-1,1]){b.panel([side*3.45,2.95,12.51],2.2,1.45,[0,Math.PI,0],side<0?2:6);b.cabinet(side*5.3,0,10.3,side>0?-.5:.5);}
      b.use('furniture').ring(8.4,9.6,.62,.48,0,0,P.panel,0,Math.PI*1.13,Math.PI*1.87,44);b.ring(8.55,9.42,1.12,.06,0,0,P.black,0,Math.PI*1.13,Math.PI*1.87,44);for(let i=0;i<7;i++){if(i===3)continue;let a=Math.PI*1.2+i/6*Math.PI*.6,x=Math.cos(a)*9,z=Math.sin(a)*9,yaw=Math.atan2(-x,-z);b.panel([x,1.58,z],1.4,.65,[-.36,yaw,0],i%8);let cx=Math.cos(a)*7.7,cz=Math.sin(a)*7.7;b.chair(cx,0,cz,yaw);if(i%2===0)b.person(cx,0,cz,yaw,true);}
      for(let side of [-1,1]){b.station(side*8.3,0,2.8,side*-.9,3,true,2.6);b.use('furniture').solid([1.8,.8,2],[side*6.25,.4,7.9],P.panel,[0,side*.25,0],.17);b.panel([side*6.25,1.02,7.7],1.4,.85,[-1,side*.25,0],2);}
      b.use('floor').cylinder(2.55,.83,[0,0,8],P.panel,64);b.cylinder(2.42,.026,[0,.83,8],P.floor,64);b.ring(2.47,2.50,.66,.045,0,8,P.accent,1);b.stairs(0,4.66,2.5,4,.83/4,.3);b.chair(0,.85,8.7,0,1.20,true);b.label([0,6.3,12.53],5,.57,[0,Math.PI,0],14);b.label([0,.053,2],3.6,.8,[-Math.PI/2,0,0],15);
    }

    // Close-range controls retain a readable pilot position in the large rooms.
    if(id===1||id===2){
      const flag=id===2,base=flag?4.23:.9,z=flag?15.65:4.70,cw=flag?1.9:1.45,cx=flag?2.4:1.7;
      for(let side of [-1,1]){let rot=[0,side*-.13,0];b.use('furniture').solid([cw,.87,.87],[side*cx,base+.435,z+.12],P.dark,rot,.11);b.solid([cw+.13,.15,1.02],[side*cx,base+.95,z],P.metal,rot,.085);b.solid([cw-.09,.04,.89],[side*cx,base+1.045,z],P.black,rot,.02);b.panel([side*cx,base+1.38,z-.27],cw-.20,.56,[-.40,side*-.13,0],side<0?0:6);for(let i=0;i<8;i++)b.box([.065,.022,.075],[side*cx-.60+i*.165,base+1.082,z+.30],i%3===0?P.amber:P.accent,i%3===0?.8:.5);b.box([cw*.52,.034,.031],[side*cx,base+.65,z+.568],P.accent,.8);b.use('trim').beam([side*(cx+cw*.46),base+.1,z+.49],[side*(cx+cw*.46),base+.83,z+.49],.028,P.edge);}
      for(let side of [-1,1]){let yy=side>0?-Math.PI/2:Math.PI/2;
        if(!flag){for(let z of [-10.6,-4.6,1.4]){b.panel([side*11.37,3.2,z+.3],3.4,1.3,[0,yy,0],z<0?6:2);b.use('walls').solid([.14,.45,4.5],[side*11.33,1.82,z],P.dark);for(let k=0;k<14;k++)b.box([.045,.26,.05],[side*11.23,1.84,z-1.9+k*.28],P.metal);b.beam([side*11.27,.3,z-2.3],[side*11.27,5.3,z-2.3],.12,P.edge);b.label([side*11.24,4.36,z+.3],2.7,.3,[0,yy,0],side<0?4:5);}}
        else{for(let z of [-24,-10,4,18]){b.use('walls').solid([.25,2.7,11.3],[side*31.10,3.3,z],P.dark);b.panel([side*30.92,3.45,z],8.8,2.0,[0,yy,0],z<0?4:2);for(let k=0;k<9;k++)b.box([.13,.065,.65],[side*30.8,1.4,z-4.3+k*1.04],P.edge);b.beam([side*30.7,18.8,z-5.9],[side*22.4,7.8,z-5.9],.28,P.metal);b.use('trim').beam([side*30.62,18.8,z-5.95],[side*22.32,7.8,z-5.95],.028,P.accent,.62);}}
      }
      if(flag){for(let side of [-1,1])for(let j=0;j<3;j++)b.station(side*(8+j*5),0,-39.5,0,(j+2)%8,j===1,3.0);}
    }
    return {spec:s,groups:b.groups,obstacles:b.obstacles};
  }


return ()=>buildInterior(4);})();
export const cabinVertex=`precision highp float;
attribute vec3 aPosition; attribute vec3 aNormal; attribute vec3 aColor;
attribute float aEmission; attribute float aTag; attribute vec2 aUV;
uniform mat4 uModel,uVP;
varying vec3 vWorld,vNormal,vColor,vLocal;varying float vEmission;varying vec2 vUV;
void main(){vec4 world=uModel*vec4(aPosition,1.);vWorld=world.xyz;vNormal=mat3(uModel)*aNormal;vColor=aColor;vEmission=aEmission;vLocal=aPosition;vUV=aUV;gl_Position=uVP*world;}`;
export const cabinFragment=`precision highp float;
varying vec3 vWorld,vNormal,vColor,vLocal;varying float vEmission;varying vec2 vUV;
uniform vec3 uEye,uLight;uniform float uOpacity,uMode,uRoom,uTime,uLighting;
uniform sampler2D uTexture,uCity;
vec3 film(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void main(){
 vec3 N=normalize(vNormal);if(!gl_FrontFacing)N=-N;vec3 V=normalize(uEye-vWorld),L=normalize(uLight);float ndl=max(dot(N,L),0.);float alpha=uOpacity;vec3 color;
 if(uMode>1.5&&uMode<3.5){vec4 tex=texture2D(uTexture,vUV);color=tex.rgb*(uMode<2.5?.96:.8);alpha*=tex.a;if(alpha<.005)discard;gl_FragColor=vec4(color,alpha);return;}
 if(uMode>3.5&&uMode<4.5){float rim=pow(1.-abs(dot(N,V)),3.5);float day=max(.18,dot(N,L)*.6+.5);color=vec3(.16,.47,.85)*day;alpha*=rim*.47;gl_FragColor=vec4(color,alpha);return;}
 vec3 base=pow(max(vColor,vec3(0.)),vec3(2.2));
 if(uMode>.5&&uMode<1.5){vec3 n=normalize(vLocal);vec2 uv=vec2(atan(n.z,n.x)/6.2831853+.5,asin(n.y)/3.14159265+.5);vec3 tex=texture2D(uTexture,uv).rgb;base=pow(tex,vec3(2.2));float edge=pow(1.-max(dot(N,V),0.),4.);vec3 night=texture2D(uCity,uv).rgb;float nightMask=1.-smoothstep(-.08,.21,dot(N,L));color=base*(vec3(.025,.047,.085)+vec3(1.25,1.23,1.17)*ndl)+night*nightMask*.9;float water=smoothstep(.035,.12,tex.b-tex.r);color+=vec3(.27,.43,.57)*pow(max(dot(reflect(-L,N),V),0.),80.)*water*.21;color+=vec3(.05,.22,.47)*edge*(.4+ndl*.5);}
 else{
 float hemi=N.y*.5+.5;float spec=pow(max(dot(N,normalize(L+V)),0.),58.);float fresnel=pow(1.-max(dot(N,V),0.),4.);
 if(uRoom>.5){
 float windowFill=max(0.,dot(N,normalize(vec3(-.3,.4,-1.))));
 float ambientOcclusion=.60+.40*smoothstep(-.2,2.5,vWorld.y);
 color=base*(vec3(.26,.34,.43)*(.60+.5*hemi)*ambientOcclusion+vec3(.79,.86,.94)*ndl*.92+vec3(.20,.29,.35)*windowFill)*uLighting;
 vec3 overhead=normalize(vec3(0.,8.,5.)-vWorld);color+=base*vec3(.3,.245,.19)*max(0.,dot(N,overhead))*uLighting;
 color+=vec3(.17,.20,.22)*spec*.48+vec3(.014,.032,.042)*fresnel;
 float glow=exp(-length((vWorld-vec3(-3.,2.5,-1.3))*vec3(.55,1.,.65))*1.25)+exp(-length((vWorld-vec3(3.,2.5,-1.3))*vec3(.55,1.,.65))*1.25);
 color+=base*vec3(.10,.25,.30)*glow;
 }else{color=base*(vec3(.10,.135,.18)+vec3(1.08,1.04,.91)*ndl)+vec3(.25,.29,.32)*spec*.6;}
 color=mix(color,base*(1.5+vEmission*.7),clamp(vEmission,0.,1.));
 }
 color=pow(film(color),vec3(1./2.2));gl_FragColor=vec4(color,alpha);
}`;

