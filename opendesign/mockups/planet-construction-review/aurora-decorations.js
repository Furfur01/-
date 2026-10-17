// Shared, deterministic scenery. No game entities, pick targets or per-frame uploads.
function auroraCometPosition(systemId,time,index=0){
 const a=110+index*35,e=.68,phase=time*(.012-index*.003)+systemId*.73+index*2.8;
 // Solve Kepler's equation: the star is at the focus and motion slows at aphelion.
 let E=phase;for(let i=0;i<6;i++)E-=(E-e*Math.sin(E)-phase)/(1-e*Math.cos(E));
 const x=a*(Math.cos(E)-e),z=a*Math.sqrt(1-e*e)*Math.sin(E),tilt=.24+index*.19;
 return auroraNavigationRotate([x,Math.sin(tilt)*z,Math.cos(tilt)*z],systemId*.47+index);
}
function auroraAsteroidGeometry(){
 const vertices=[];let seed=7183;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<2200;i++){
  const outer=i<1650,angle=random()*TAU,radius=(outer?162:82)+(random()+random()-1)*(outer?4.5:2.0),size=.04+Math.pow(random(),2)*.13;
  const center=[Math.cos(angle)*radius,(random()-.5)*(outer?.55:.23),Math.sin(angle)*radius];
  const tips=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].map(v=>mul(v,size*(.65+random()*.7)));
  for(const face of [[0,2,4],[4,2,1],[1,2,5],[5,2,0],[0,4,3],[4,1,3],[1,5,3],[5,0,3]]){
   const [a,b,c]=face.map(j=>tips[j]),normal=norm(cross(sub(b,a),sub(c,a))),light=.42+.58*Math.max(0,dot(normal,norm(mul(center,-1)))),tone=.72+random()*.25;
   for(const v of [a,b,c])vertices.push(...add(center,v),tone*light*.72,tone*light*.65,tone*light*.53,1);
  }
 }
 return new Float32Array(vertices);
}
function createAuroraDecorations(){
 const vertex=`attribute vec3 aPosition,aColor;attribute float aFade;
 uniform mat4 uVP;uniform vec3 uCenter,uHead;uniform float uRotation,uMode,uDPR;
 varying vec3 color;varying float fade;
 void main(){vec3 p=aPosition;color=aColor;fade=aFade;
 if(uMode>.5){float t=aPosition.x;vec3 outward=normalize(uHead),side=normalize(cross(outward,vec3(0.,1.,0.)));
 float dust=step(1.5,uMode);p=uHead+outward*t*(7.-dust*1.8)+side*(aPosition.y*(.05+t*.55)+dust*t*t*1.8)+vec3(0.,aPosition.z*(.04+t*.25),0.);
 gl_PointSize=uDPR*(t<.001?9.:mix(3.2,1.2,t));
 }else{float c=cos(uRotation),s=sin(uRotation);p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);gl_PointSize=1.;}
 gl_Position=uVP*vec4(p+uCenter,1.);}`;
 const fragment=`precision highp float;varying vec3 color;varying float fade;uniform float uAlpha,uMode;
 void main(){float a=fade*uAlpha;if(uMode>.5){float d=length(gl_PointCoord*2.-1.);if(d>1.)discard;a*=exp(-d*d*3.5)*(1.-smoothstep(.6,1.,d));}gl_FragColor=vec4(color,a);}`;
 const program=gl.createProgram(),vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);
 gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const a={};for(const name of ['aPosition','aColor','aFade'])a[name]=gl.getAttribLocation(program,name);
 const u={};for(const name of ['uVP','uCenter','uHead','uRotation','uMode','uDPR','uAlpha'])u[name]=gl.getUniformLocation(program,name);
 const make=data=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);return {b,count:data.length/7};};
 const belt=make(auroraAsteroidGeometry()),tail=[];
 tail.push(0,0,0,.8,.94,1,1);
 for(let i=1;i<=420;i++){const t=i/420;tail.push(t,Math.sin(i*2.39996)*Math.sqrt((i%17)/17),Math.cos(i*2.39996)*.6,.40,.72,1,Math.pow(1-t,1.8)*.56);}
 const ion=make(new Float32Array(tail)),dust=make(new Float32Array(tail.map((v,i)=>i%7===3?.82:i%7===4?.69:i%7===5?.46:i%7===6?v*.42:v)));
 function mesh(geo,mode){gl.bindBuffer(gl.ARRAY_BUFFER,geo.b);for(const [name,size,offset]of [['aPosition',3,0],['aColor',3,12],['aFade',1,24]]){gl.enableVertexAttribArray(a[name]);gl.vertexAttribPointer(a[name],size,gl.FLOAT,false,28,offset);}gl.uniform1f(u.uMode,mode);gl.drawArrays(mode?gl.POINTS:gl.TRIANGLES,0,geo.count);}
 return {draw(systems,origin,eye,vp,time,opacity=1){
  if(opacity<=0)return;
  gl.useProgram(program);gl.uniformMatrix4fv(u.uVP,false,vp);gl.uniform1f(u.uDPR,DPR);gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);
  for(const s of systems){const distance=len(sub(eye,s.position)),alpha=(1-smooth(170,480,distance))*opacity;if(alpha<=0)continue;
   gl.uniform3fv(u.uCenter,sub(s.position,origin));gl.uniform1f(u.uRotation,s.id*.71+time*.0012);gl.uniform1f(u.uAlpha,alpha);gl.depthMask(true);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);mesh(belt,0);
   gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
   for(let i=0;i<2;i++){gl.uniform3fv(u.uHead,auroraCometPosition(s.id,time,i));mesh(dust,2);mesh(ion,1);}
  }
  gl.depthMask(true);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 },dispose(){for(const geo of [belt,ion,dust])gl.deleteBuffer(geo.b);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);}};
}
