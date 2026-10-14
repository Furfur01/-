import * as terrain from '../../game/death-star-terrain.mjs';
export * from '../../game/death-star-terrain.mjs';
const {add,sub,mul,dot,norm,cross,length,surfacePoint,dishPoint,DISH_DIRECTION,DISH_RIM}=terrain;
function perspective(fov,aspect,near,far){const f=1/Math.tan(fov/2);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);}
function view(forward,up){const z=mul(norm(forward),-1),x=norm(cross(up,z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,0,0,0,1]);}
function multiply(a,b){const out=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)out[c*4+r]+=a[k*4+r]*b[c*4+k];return out;}
const vs=`precision highp float;
attribute vec3 aPosition,aNormal; attribute vec4 aX,aY,aZ; attribute vec3 aColor;
uniform mat4 uVP;uniform vec3 uOrigin,uEye;uniform float uInstances;
varying vec3 vWorld,vNormal,vRelative,vColor;
void main(){vec3 p=aPosition,n=aNormal;vColor=vec3(.42,.45,.48);
if(uInstances>0.5){p=vec3(dot(aX.xyz,p),dot(aY.xyz,p),dot(aZ.xyz,p))+vec3(aX.w,aY.w,aZ.w);vec3 x=vec3(aX.x,aY.x,aZ.x),y=vec3(aX.y,aY.y,aZ.y),z=vec3(aX.z,aY.z,aZ.z);n=normalize(x*n.x/dot(x,x)+y*n.y/dot(y,y)+z*n.z/dot(z,z));vColor=aColor;}
vRelative=p+uOrigin;vWorld=vRelative+uEye;vNormal=n;gl_Position=uVP*vec4(vRelative,1.);}`;
const fs=`precision highp float;
varying vec3 vWorld,vNormal,vRelative,vColor;
uniform vec3 uDish;uniform float uRim,uMode,uPass;
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){float distance=length(vRelative);if(uPass<.5&&distance<2500.)discard;if(uPass>.5&&distance>=2500.)discard;
if(uMode<.5&&dot(vWorld,uDish)>uRim)discard;
vec3 n=normalize(vNormal);if(uMode>.5&&uMode<2.5&&!gl_FrontFacing)n=-n;
vec3 color=vColor;float lights=0.;
if(uMode<2.5){
 vec3 an=abs(n);vec2 uv=an.z>an.x&&an.z>an.y?vWorld.xy:an.y>an.x?vWorld.xz:vWorld.yz;
 if(uMode<.5)uv=vec2(atan(vWorld.x,vWorld.y)*10000.,asin(clamp(vWorld.z/length(vWorld),-1.,1.))*10000.);
 if(uMode>.5&&uMode<1.5){vec3 east=normalize(cross(vec3(0.,0.,1.),uDish)),north=cross(uDish,east);uv=vec2(dot(vWorld,east),dot(vWorld,north));}
 if(uMode>1.5)uv=vec2(atan(vWorld.x,vWorld.y)*9900.,abs(n.z)>.5?length(vWorld.xy)-9900.:vWorld.z);
 vec2 cell=floor(uv/vec2(18.,12.)),q=fract(uv/vec2(18.,12.));float rnd=hash(cell);
 float seam=step(.025,q.x)*step(.025,q.y);float bevel=step(.035,q.y)-step(.06,q.y);
 color*=.64+rnd*.52;color*=.38+.62*seam;color+=bevel*.12;
 vec2 tiny=fract(uv/vec2(2.,3.));float vent=step(.65,rnd)*step(.25,q.x)*step(q.x,.7)*step(.2,q.y)*step(q.y,.65);color*=1.-vent*(.25+.25*step(.6,tiny.y));
 lights=step(.94,rnd)*step(.72,q.x)*step(q.x,.81)*step(.78,q.y)*step(q.y,.83);
 float fade=smoothstep(180.,1400.,distance);vec2 big=uv/vec2(160.,75.);vec2 bc=floor(big);vec2 bq=fract(big);float macro=hash(bc);float line=step(.035,bq.y)*step(.012,bq.x);color=mix(color,vColor*(.65+.42*macro)*(.55+.45*line),fade);
 lights*=1.-fade;
 if(uMode>.5&&uMode<1.5){float radius=length(vWorld-uDish*dot(vWorld,uDish));color*=.6+.4*smoothstep(.025,.055,fract(radius/270.));color*=.35+.65*smoothstep(80.,170.,radius);}
}
float lighting=.30+.70*max(0.,dot(n,normalize(vec3(-.35,.8,.5))));
if(uMode>3.5){color=vec3(.15,.7,.38);lighting=1.;}
gl_FragColor=vec4(color*lighting+vec3(.8,.7,.43)*lights,1.);}`;
function compile(gl,type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
function triangles(point,nu,nv){const out=[];for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=point(i/nu,j/nv),b=point((i+1)/nu,j/nv),c=point((i+1)/nu,(j+1)/nv),d=point(i/nu,(j+1)/nv);for(const tri of [[a,b,c],[a,c,d]]){const n=norm(cross(sub(tri[1],tri[0]),sub(tri[2],tri[0])));for(const v of tri)out.push(...v,...n);}}return new Float32Array(out);}
function cube(){
 const out=[],bevel=.82,tri=(a,b,c,n)=>{for(const p of[a,b,c])out.push(...p,...n);},quad=(a,b,c,d,n)=>{tri(a,b,c,n);tri(a,c,d,n);};
 for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){const other=[0,1,2].filter(i=>i!==axis),p=(a,b)=>{const x=[0,0,0];x[axis]=sign;x[other[0]]=a;x[other[1]]=b;return x;},n=[0,0,0];n[axis]=sign;quad(p(-bevel,-bevel),p(bevel,-bevel),p(bevel,bevel),p(-bevel,bevel),n);}
 for(let along=0;along<3;along++)for(const sa of[-1,1])for(const sb of[-1,1]){const [a,b]=[0,1,2].filter(i=>i!==along),p=(t,outer)=>{const v=[0,0,0];v[along]=t;v[a]=sa*(outer?1:bevel);v[b]=sb*(outer?bevel:1);return v;},n=[0,0,0];n[a]=sa/Math.sqrt(2);n[b]=sb/Math.sqrt(2);quad(p(-bevel,true),p(bevel,true),p(bevel,false),p(-bevel,false),n);}
 for(const x of[-1,1])for(const y of[-1,1])for(const z of[-1,1])tri([x,y*bevel,z*bevel],[x*bevel,y,z*bevel],[x*bevel,y*bevel,z],norm([x,y,z]));
 return new Float32Array(out);
}
export class TerrainRenderer{
 constructor(gl){
  this.gl=gl;this.ext=gl.getExtension('ANGLE_instanced_arrays');this.buffers=new Set();this.cache=new Map();this.pending=new Map();this.disposed=false;this.frame=0;this.boxes=[];this.drawCalls=0;this.triangles=0;this.patchList=terrain.shellPatches();
  const v=compile(gl,gl.VERTEX_SHADER,vs),f=compile(gl,gl.FRAGMENT_SHADER,fs);this.program=gl.createProgram();gl.attachShader(this.program,v);gl.attachShader(this.program,f);gl.linkProgram(this.program);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));
  this.a=Object.fromEntries(['aPosition','aNormal','aX','aY','aZ','aColor'].map(n=>[n,gl.getAttribLocation(this.program,n)]));this.u=Object.fromEntries(['uVP','uOrigin','uEye','uInstances','uDish','uRim','uMode','uPass'].map(n=>[n,gl.getUniformLocation(this.program,n)]));
  const shell=[];for(const p of this.patchList){const g=terrain.patchGeometry(p,4);for(let i=0;i<g.data.length;i+=6)shell.push(...add(Array.from(g.data.subarray(i,i+3)),g.origin),...g.data.subarray(i+3,i+6));}this.shell=this.upload(new Float32Array(shell));
  this.trench=this.upload(triangles((u,v)=>terrain.trenchPoint(u*Math.PI*2,(v-.5)*120),2048,1));
  this.walls=[-1,1].map(side=>this.upload(triangles((u,v)=>terrain.trenchPoint(u*Math.PI*2,side*60,9900+v*(Math.sqrt(10000**2-60**2)-9900)),2048,1)));
  this.bowl=this.upload(triangles((u,v)=>dishPoint(v*3100,u*Math.PI*2),256,64));
  this.rim=this.upload(triangles((u,v)=>{const a=u*Math.PI*2,r=3100+v*16,z=Math.sqrt(10000**2-r*r)+4;return add(mul(DISH_DIRECTION,z),add(mul(terrain.DISH_EAST,r*Math.cos(a)),mul(terrain.DISH_NORTH,r*Math.sin(a))));},256,1));
  this.cube=this.upload(cube());this.instanceBuffer=gl.createBuffer();this.buffers.add(this.instanceBuffer);this.fallback=null;this.instanceCount=0;this.lastDetailKey='';
 }
 upload(data){const gl=this.gl,buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);this.buffers.add(buffer);return {buffer,count:data.length/6};}
 release(mesh){if(!mesh)return;this.gl.deleteBuffer(mesh.buffer);this.buffers.delete(mesh.buffer);}
 request(p,n){const key=p.id+':'+n;if(this.cache.has(key)||this.pending.has(key)||this.pending.size>=2)return;const timer=setTimeout(()=>{this.pending.delete(key);if(this.disposed)return;const data=terrain.patchGeometry(p,n);this.cache.set(key,{...this.upload(data.data),origin:data.origin,n,last:this.frame});while(this.cache.size>40){const [old,item]=[...this.cache].sort((a,b)=>a[1].last-b[1].last)[0];this.release(item);this.cache.delete(old);}},0);this.pending.set(key,timer);}
 setInstances(boxes,origin){
  const gl=this.gl;this.instanceOrigin=origin;this.instanceCount=boxes.length;
  if(this.ext){const data=[];for(const b of boxes){const t=sub(b.center,origin);for(let row=0;row<3;row++)data.push(...b.axes.map((axis,i)=>axis[row]*b.half[i]),t[row]);data.push(...b.color);}gl.bindBuffer(gl.ARRAY_BUFFER,this.instanceBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);}
  else {const base=cube(),data=[];for(const b of boxes)for(let i=0;i<base.length;i+=6){let p=sub(b.center,origin),n=[0,0,0];for(let j=0;j<3;j++){p=add(p,mul(b.axes[j],base[i+j]*b.half[j]));n=add(n,mul(b.axes[j],base[i+3+j]));}data.push(...p,...n);}this.release(this.fallback);this.fallback=this.upload(new Float32Array(data));}
 }
 mesh(mesh,origin,mode){const gl=this.gl;gl.uniform3fv(this.u.uOrigin,sub(origin,this.eye));gl.uniform1f(this.u.uMode,mode);gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);for(const [name,offset]of [['aPosition',0],['aNormal',12]]){const at=this.a[name];gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,3,gl.FLOAT,false,24,offset);}gl.drawArrays(gl.TRIANGLES,0,mesh.count);this.drawCalls++;this.triangles+=mesh.count/3;}
 instances(){const gl=this.gl;if(!this.instanceCount)return;if(!this.ext){this.mesh(this.fallback,this.instanceOrigin,3);return;}gl.uniform1f(this.u.uInstances,1);gl.uniform1f(this.u.uMode,3);gl.uniform3fv(this.u.uOrigin,sub(this.instanceOrigin,this.eye));gl.bindBuffer(gl.ARRAY_BUFFER,this.cube.buffer);for(const [name,offset]of [['aPosition',0],['aNormal',12]]){gl.enableVertexAttribArray(this.a[name]);gl.vertexAttribPointer(this.a[name],3,gl.FLOAT,false,24,offset);}gl.bindBuffer(gl.ARRAY_BUFFER,this.instanceBuffer);for(const [name,offset,size]of [['aX',0,4],['aY',16,4],['aZ',32,4],['aColor',48,3]]){const at=this.a[name];gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,size,gl.FLOAT,false,60,offset);this.ext.vertexAttribDivisorANGLE(at,1);}this.ext.drawArraysInstancedANGLE(gl.TRIANGLES,0,this.cube.count,this.instanceCount);this.drawCalls++;this.triangles+=this.cube.count/3*this.instanceCount;for(const name of ['aX','aY','aZ','aColor']){this.ext.vertexAttribDivisorANGLE(this.a[name],0);gl.disableVertexAttribArray(this.a[name]);}gl.uniform1f(this.u.uInstances,0);}
 draw(renderer,targets,time){
  if(this.disposed)return;this.frame++;this.drawCalls=0;this.triangles=0;this.eye=renderer.eye;const gl=this.gl,eye=this.eye,forward=renderer.cameraForward,up=renderer.cameraUp;
  const detailKey=eye.map(v=>Math.floor(v/24)).join(':')+targets.map(t=>t.hp>0?1:0).join('');
  if(detailKey!==this.lastDetailKey){this.lastDetailKey=detailKey;this.boxes=terrain.localMachinery(eye);const boxes=[...this.boxes];
   for(const t of targets){const radial=norm([t.pos[0],t.pos[1],0]),tangent=[radial[1],-radial[0],0];boxes.push({center:t.pos,axes:[tangent,radial,[0,0,1]],half:t.hp>0?[4,4,4]:[4,1,4],color:t.hp>0?[.48,.36,.23]:[.12,.13,.14]});if(t.hp>0)boxes.push({center:add(t.pos,mul(radial,5)),axes:[tangent,radial,[0,0,1]],half:[1,3,1],color:[.65,.55,.35]});}
   // Small ridged housings on the shared bevelled prototype, not expanded meshes.
   for(const b of this.boxes)if(b.id.startsWith('shell:')){boxes.push({...b,center:add(b.center,mul(b.axes[1],b.half[1]+.4)),half:[b.half[0]*.72,.4,b.half[2]*.8],color:[.45,.47,.48]});for(const side of[-1,1])boxes.push({...b,center:add(b.center,add(mul(b.axes[0],side*b.half[0]*.55),mul(b.axes[1],b.half[1]+1))),half:[.35,.6,b.half[2]*.7],color:[.18,.2,.22]});}
   // Eight physical emitter housings and their lenses on the concave superlaser.
   for(let i=0;i<8;i++){const a=(i+.5)*Math.PI/4,axes=[terrain.DISH_EAST,terrain.DISH_NORTH,DISH_DIRECTION];boxes.push({center:add(dishPoint(2300,a),mul(DISH_DIRECTION,12)),axes,half:[65,65,12],color:[.15,.22,.19]});boxes.push({center:add(dishPoint(2300,a),mul(DISH_DIRECTION,26)),axes,half:[32,32,3],color:[.2,.65,.35]});}
   this.setInstances(boxes,eye.slice());
  }
  const visible=[];if(length(eye)<13000){for(const p of this.patchList){const center=surfacePoint((p.a0+p.a1)/2,(p.b0+p.b1)/2),delta=sub(center,eye),d=length(delta);if(d>3300||dot(delta,forward)<-1200)continue;const existing=[...this.cache.values()];const n=terrain.detailLevel(p,eye,renderer.height,renderer.fov,this.cache.get(p.id+':32')?32:16);this.request(p,n);const key=p.id+':'+n,item=this.cache.get(key)||this.cache.get(p.id+':16')||this.cache.get(p.id+':32');if(item){item.last=this.frame;visible.push(item);}}}
  gl.useProgram(this.program);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.uniform3fv(this.u.uEye,eye);gl.uniform3fv(this.u.uDish,DISH_DIRECTION);gl.uniform1f(this.u.uRim,DISH_RIM);gl.uniform1f(this.u.uInstances,0);for(const name of ['aX','aY','aZ','aColor'])gl.disableVertexAttribArray(this.a[name]);
  for(let pass=0;pass<2;pass++){
   gl.depthRange(pass===0?.5:0,pass===0?1:.5);gl.uniform1f(this.u.uPass,pass);
   const projection=perspective(renderer.fov,renderer.width/renderer.height,pass===0?2:.035,pass===0?100000:22000);projection[9]=renderer.projectionOffset||0;gl.uniformMatrix4fv(this.u.uVP,false,multiply(projection,view(forward,up)));
   this.mesh(this.shell,[0,0,0],0);for(const item of visible)this.mesh(item,item.origin,0);
   this.mesh(this.trench,[0,0,0],2);for(const w of this.walls)this.mesh(w,[0,0,0],2);this.mesh(this.bowl,[0,0,0],1);this.mesh(this.rim,[0,0,0],3);this.instances();
  }
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthRange(0,.5);
  this.stats={buffers:this.buffers.size,patches:this.cache.size,pending:this.pending.size,instances:this.instanceCount,drawCalls:this.drawCalls,triangles:this.triangles};
 }
 dispose(){if(this.disposed)return;this.disposed=true;for(const timer of this.pending.values())clearTimeout(timer);this.pending.clear();for(const b of this.buffers)this.gl.deleteBuffer(b);this.buffers.clear();this.cache.clear();this.gl.deleteProgram(this.program);this.stats={buffers:0,patches:0,pending:0,instances:0,drawCalls:0,triangles:0};}
}
