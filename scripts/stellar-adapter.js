// Adapted from the user-supplied stellar_threejs.html. Same ray-traced model,
// native WebGL 1 syntax, existing camera/context and game-space stellar radius.
function createStellarRenderer(){
 const vertex=`attribute vec2 aPosition;varying vec2 vScreen;uniform vec2 uCenter,uExtent;
 void main(){vScreen=uCenter+aPosition*uExtent;gl_Position=vec4(vScreen,0.,1.);}`;
 const fragment=`precision highp float;precision highp int;
 varying vec2 vScreen;uniform sampler2D uNoise;uniform vec3 uEye,uRight,uUp,uForward;
 uniform float uTime,uAspect,uFov,uAlpha;uniform int uType;
 #define uRotation uTime
 const float uWind=1.,uCorona=1.,uLoops=1.,uExposure=1.,uDetail=1.,uBurstAge=-1.;
 /*__STELLAR_PLASMA__*/
 void main(){
  vec3 rd=normalize(uForward+vScreen.x*uAspect*uFov*uRight+vScreen.y*uFov*uUp);
  vec2 outer=hitSphere(uEye,rd,2.6);if(outer.y<=0.)discard;
  vec2 hit=hitSphere(uEye,rd,1.);bool solid=hit.x>0.;float stop=solid?hit.x:1e6;
  vec3 col=solid?surface(normalize(uEye+rd*stop),rd,uType):vec3(0.);
  col+=corona(uEye,rd,uType,stop)+prominences(uEye,rd,uType,stop);
  float along=-dot(uEye,rd),impact=length(uEye+rd*along);
  if(along>0.&&impact>1.)col+=tint(uType)*exp(-(impact-1.)*3.6)*.033;
  // Premultiplied emission: opaque photosphere, additive transparent corona.
  gl_FragColor=vec4(film(col)*uAlpha,solid?uAlpha:0.);
 }`;
 const program=gl.createProgram(),vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);
 gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 gl.deleteShader(vs);gl.deleteShader(fs);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 let seed=827341;const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
 const vals=new Uint8Array(256*256),noise=new Uint8Array(256*256*4);
 for(let i=0;i<vals.length;i++)vals[i]=Math.floor(rnd()*256);
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){const j=(y*256+x)*4;noise[j]=vals[y*256+x];noise[j+1]=vals[((y+17)&255)*256+((x+37)&255)];noise[j+2]=128;noise[j+3]=255;}
 const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,256,256,0,gl.RGBA,gl.UNSIGNED_BYTE,noise);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
 const a=gl.getAttribLocation(program,'aPosition'),u={};for(const key of ['uCenter','uExtent','uEye','uRight','uUp','uForward','uNoise','uTime','uAspect','uFov','uAlpha','uType'])u[key]=gl.getUniformLocation(program,key);
 return {draw({q,id,eye,right,up,forward,time,alpha}){
  // Conservative perspective bounds, including close flybys inside the corona.
  const bound=5.33,denom=q.depth-bound,full=denom<=0;
  const center=full?[0,0]:[q.x/W*2-1,1-q.y/H*2];
  const extent=full?[1,1]:[bound*(1+Math.abs(center[0])*W/H*Math.tan(FOV/2))/denom/Math.tan(FOV/2)/(W/H),bound*(1+Math.abs(center[1])*Math.tan(FOV/2))/denom/Math.tan(FOV/2)];
  gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  for(let i=0;i<gl.getParameter(gl.MAX_VERTEX_ATTRIBS);i++)gl.disableVertexAttribArray(i);
  gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(u.uNoise,0);
  gl.uniform2fv(u.uCenter,center);gl.uniform2fv(u.uExtent,extent);gl.uniform3fv(u.uEye,eye);
  gl.uniform3fv(u.uRight,right);gl.uniform3fv(u.uUp,up);gl.uniform3fv(u.uForward,forward);
  gl.uniform1f(u.uTime,time+id);gl.uniform1f(u.uAspect,W/H);gl.uniform1f(u.uFov,Math.tan(FOV/2));gl.uniform1f(u.uAlpha,alpha);gl.uniform1i(u.uType,auroraStarType(id));
  gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.drawArrays(gl.TRIANGLES,0,6);
  gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 },dispose(){gl.deleteBuffer(buffer);gl.deleteTexture(texture);gl.deleteProgram(program);}};
}
