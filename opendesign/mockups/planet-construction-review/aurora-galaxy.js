// The selected B image is sampled offline. This same catalogue locates real systems.
const auroraGalaxyLayout=/*__AURORA_GALAXY_LAYOUT__*/;
// Normalize the portrait fit so the same framing has the same visual hierarchy.
function auroraGalaxyPresentation(distance,aspect=1){
 const d=distance/Math.max(1,1/aspect),ease=(a,b)=>{const t=Math.max(0,Math.min(1,(d-a)/(b-a)));return t*t*(3-2*t);};
 const near=ease(1600,6000),far=ease(38000,75000);
 return {background:.06+.22*ease(4000,30000)+.44*ease(30000,110000),rings:ease(2500,8000)*(1-far),points:near*(1-.2*far),links:near*(1-.55*far)};
}
function createAuroraGalaxy(){
 const vertex=`attribute vec3 aPosition;attribute vec2 aStar;uniform mat4 uVP;uniform vec3 uOrigin,uEye;uniform float uDPR,uZoom;varying float vBrightness,vFade;void main(){vec3 p=aPosition-uOrigin;gl_Position=uVP*vec4(p,1.);float distanceToEye=length(aPosition-uEye);vFade=smoothstep(250.,1500.,distanceToEye);vBrightness=aStar.y;gl_PointSize=max(1.,aStar.x*uDPR*uZoom);}`;
 const fragment=`precision mediump float;varying float vBrightness,vFade;uniform float uAlpha;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float halo=exp(-r*r*5.);float core=1.-smoothstep(.12,.55,r);gl_FragColor=vec4(vec3(1.),vBrightness*(core*.6+halo*.4)*vFade*uAlpha);}`;
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const u={};for(const name of ['uVP','uOrigin','uEye','uDPR','uZoom','uAlpha'])u[name]=gl.getUniformLocation(program,name);
 const a=gl.getAttribLocation(program,'aPosition'),star=gl.getAttribLocation(program,'aStar'),buffer=gl.createBuffer();let count=0,disposed=false,error=null;const controller=new AbortController();
 const info={version:auroraGalaxyLayout.version,loaded:false,pointCount:0,sizeRange:[.65,4.6],source:auroraGalaxyLayout.source};
 fetch(auroraGalaxyLayout.points,{signal:controller.signal}).then(response=>{if(!response.ok)throw Error('棒旋星图加载失败');return response.arrayBuffer();}).then(data=>{
  if(disposed)return;if(data.byteLength!==auroraGalaxyLayout.pointCount*20)throw Error('棒旋星图数据长度不符');
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);count=auroraGalaxyLayout.pointCount;info.loaded=true;info.pointCount=count;
 }).catch(e=>{if(!disposed){error=e.message;info.error=error;console.error(e);}});
 return {info,draw(vp,origin,eye,alpha,dist){
  info.opacity=alpha;
  if(!count||disposed||alpha<=0)return;
  gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,20,0);gl.enableVertexAttribArray(star);gl.vertexAttribPointer(star,2,gl.FLOAT,false,20,12);
  gl.uniformMatrix4fv(u.uVP,false,vp);gl.uniform3fv(u.uOrigin,origin);gl.uniform3fv(u.uEye,eye);gl.uniform1f(u.uDPR,DPR);gl.uniform1f(u.uAlpha,alpha);gl.uniform1f(u.uZoom,clamp(Math.sqrt(100000/Math.max(dist,1000)),.7,1.6));
  gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.drawArrays(gl.POINTS,0,count);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
 },dispose(){disposed=true;controller.abort();gl.deleteBuffer(buffer);gl.deleteProgram(program);}};
}
