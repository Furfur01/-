// Real-time Schwarzschild null-ray approximation, in Schwarzschild-radius units.
// Film-inspired art direction; this is not the film's Kerr/DNGR solver.
const auroraBlackHole={id:'gargantua',position:[0,0,0],radius:6.5,scale:2.5};
function auroraNavigationSelectBlackHole(){
 const n=auroraNavigation;if(!n.enabled)return false;
 n.zoomTarget={type:'blackHole',id:'gargantua'};n.surfaceFollow=null;
 n.goal.center=[0,0,0];n.flight=true;
 auroraNavigationEmit('blackHole');return true;
}
function auroraNavigationToBlackHole(){
 if(!auroraNavigationSelectBlackHole())return false;
 auroraNavigation.goal.dist=auroraNavigationFitDistance();return true;
}
function createGargantua(){
 const vertex=`attribute vec2 aPosition;uniform vec4 uBounds;varying vec2 uv;
 void main(){uv=mix(uBounds.xy,uBounds.zw,aPosition*.5+.5);gl_Position=vec4(uv*2.-1.,0.,1.);}`;
 const fragment=`precision highp float;
 varying vec2 uv;uniform sampler2D uBackground;uniform vec3 uEye,uRight,uUp,uForward;
 uniform float uAspect,uTan,uTime;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 vec3 disk(vec3 p){
  float r=length(p.xz),a=atan(p.z,p.x),rotation=uTime*.22/pow(r/3.,1.5);
  vec2 swirl=vec2(cos(a-rotation),sin(a-rotation));
  float turbulence=noise(vec2(r*4.2,0.)+swirl*2.4)*.55+noise(vec2(r*12.,2.)+swirl*6.)*.3+noise(vec2(r*36.,7.)+swirl*11.)*.15;
  float rings=.73+.12*sin(r*19.+turbulence*7.)+.07*sin(r*47.+turbulence*9.);
  float wisps=.65+.55*turbulence;
  float edge=smoothstep(2.95,3.3,r)*(1.-smoothstep(8.,12.,r));
  float heat=pow(3./max(r,3.),1.8),bright=edge*(.35+heat*3.6)*rings*wisps;
  float doppler=1.+.20*dot(normalize(vec3(-p.z,0.,p.x)),normalize(uEye-p));
  vec3 temperature=mix(vec3(1.,.32,.075),vec3(1.,.88,.65),pow(heat,.38));
  return temperature*bright*doppler;
 }
 vec3 bend(vec3 p,float h2){float r2=dot(p,p);return -1.5*h2*p/(r2*r2*sqrt(r2));}
 void main(){
  vec2 screen=uv*2.-1.;vec3 dir=normalize(uForward+uRight*screen.x*uAspect*uTan+uUp*screen.y*uTan);
  vec3 pos=uEye;float b=dot(pos,dir),disc=b*b-dot(pos,pos)+324.;
  if(disc<0.||b>0.)discard;
  float entry=max(0.,-b-sqrt(disc));pos+=dir*entry;
  vec3 crossRay=cross(pos,dir);float h2=dot(crossRay,crossRay),transmission=1.;vec3 emission=vec3(0.);bool captured=false;
  // Velocity Verlet preserves the orbital plane and resolves multiple disk images.
  for(int i=0;i<220;i++){
   float r=length(pos);if(r<1.015){captured=true;break;}if(r>19.)break;
   float stepSize=clamp(r*.065,.045,.85);vec3 previous=pos,acc=bend(pos,h2);
   pos+=dir*stepSize+.5*acc*stepSize*stepSize;dir+=.5*(acc+bend(pos,h2))*stepSize;
   if(previous.y*pos.y<0.){
    vec3 hit=mix(previous,pos,previous.y/(previous.y-pos.y));float radius=length(hit.xz);
    if(radius>2.95&&radius<12.){vec3 light=disk(hit);emission+=transmission*light;transmission*=1.-.96*smoothstep(2.95,3.3,radius)*(1.-smoothstep(8.,12.,radius));}
   }
   if(transmission<.015)break;
  }
  vec3 background=texture2D(uBackground,uv).rgb;
  // Sample the existing star field along the deflected exit direction.
  float facing=dot(normalize(dir),uForward);
  vec2 escaped=vec2(dot(normalize(dir),uRight)/(uAspect*uTan),dot(normalize(dir),uUp)/uTan)/max(.12,facing)*.5+.5;
  vec3 lensed=texture2D(uBackground,clamp(escaped,vec2(.001),vec2(.999))).rgb;
  if(facing<0.)lensed*=.12;
  float impact=sqrt(h2),ring=exp(-pow((impact-2.598)/.025,2.));
  emission+=vec3(1.,.80,.49)*ring*.32;
  vec3 color=emission+(captured?vec3(0.):lensed)*transmission;
  float edge=1.-smoothstep(13.,17.8,impact);
  color=mix(background,color,edge);
  gl_FragColor=vec4(color/6.,edge);
 }`;
 const composite=`precision highp float;varying vec2 uv;uniform sampler2D uImage;uniform vec2 uPixel;uniform float uOpacity;
 vec3 bright(vec2 p){vec3 c=texture2D(uImage,p).rgb*6.;return max(c-vec3(.30),vec3(0.));}
 void main(){vec4 center=texture2D(uImage,uv);vec3 bloom=vec3(0.);
  for(int i=0;i<12;i++){float a=float(i)*.5235988;vec2 v=vec2(cos(a),sin(a))*uPixel;
   bloom+=bright(uv+v*3.)*.028+bright(uv+v*9.)*.018+bright(uv+v*22.)*.008;
  }
  vec3 c=center.rgb*6.+bloom*.65;
  c=vec3(1.)-exp(-c*1.35);c=pow(c,vec3(.90));
  gl_FragColor=vec4(c,center.a*uOpacity);
 }`;
 function program(fragment){const p=gl.createProgram(),v=shader(gl.VERTEX_SHADER,vertex),f=shader(gl.FRAGMENT_SHADER,fragment);gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
 const ray=program(fragment),combine=program(composite),quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 function texture(){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
 const background=texture(),target=texture(),framebuffer=gl.createFramebuffer();let width=0,height=0,bw=0,bh=0,drawInfo={visible:false};
 const uniform=(p,name)=>gl.getUniformLocation(p,name);
 const ru=Object.fromEntries(['uBounds','uBackground','uEye','uRight','uUp','uForward','uAspect','uTan','uTime'].map(k=>[k,uniform(ray,k)])),cu=Object.fromEntries(['uBounds','uImage','uPixel','uOpacity'].map(k=>[k,uniform(combine,k)]));
 function use(p){gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,quad);const a=gl.getAttribLocation(p,'aPosition');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);}
 return {get info(){return drawInfo;},draw({q,eye,right,up,forward,time}){
  drawInfo={visible:false};if(q.depth<=0||q.radius<1.5)return;
  const extent=q.radius*7.6,x=q.x/W,y=1.-q.y/H,ex=extent/W,ey=extent/H;
  if(x+ex<0||x-ex>1||y+ey<0||y-ey>1)return;
  const bounds=[Math.max(0,x-ex),Math.max(0,y-ey),Math.min(1,x+ex),Math.min(1,y+ey)];
  const scale=Math.min(1,800/canvas.height),w=Math.max(1,Math.round(canvas.width*scale)),h=Math.max(1,Math.round(canvas.height*scale));
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,background);
  if(bw!==canvas.width||bh!==canvas.height){bw=canvas.width;bh=canvas.height;gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,bw,bh,0,gl.RGBA,gl.UNSIGNED_BYTE,null);}
  gl.copyTexSubImage2D(gl.TEXTURE_2D,0,0,0,0,0,bw,bh);
  if(width!==w||height!==h){width=w;height=h;gl.bindTexture(gl.TEXTURE_2D,target);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,target,0);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Gargantua framebuffer incomplete');}
  gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.viewport(0,0,w,h);gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.disable(gl.BLEND);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  use(ray);gl.bindTexture(gl.TEXTURE_2D,background);gl.uniform1i(ru.uBackground,0);gl.uniform4fv(ru.uBounds,bounds);gl.uniform3fv(ru.uEye,mul(eye,1/auroraBlackHole.scale));gl.uniform3fv(ru.uRight,right);gl.uniform3fv(ru.uUp,up);gl.uniform3fv(ru.uForward,forward);gl.uniform1f(ru.uAspect,W/H);gl.uniform1f(ru.uTan,Math.tan(FOV/2));gl.uniform1f(ru.uTime,time);gl.drawArrays(gl.TRIANGLES,0,6);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,canvas.width,canvas.height);use(combine);gl.bindTexture(gl.TEXTURE_2D,target);gl.uniform1i(cu.uImage,0);gl.uniform4fv(cu.uBounds,bounds);gl.uniform2f(cu.uPixel,1/w,1/h);gl.uniform1f(cu.uOpacity,smooth(1.5,6,q.radius));gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.drawArrays(gl.TRIANGLES,0,6);gl.depthMask(true);gl.enable(gl.DEPTH_TEST);
  drawInfo={visible:true,width:w,height:h,radius:q.radius,steps:220};
 },dispose(){gl.deleteProgram(ray);gl.deleteProgram(combine);gl.deleteBuffer(quad);gl.deleteTexture(background);gl.deleteTexture(target);gl.deleteFramebuffer(framebuffer);}};
}
