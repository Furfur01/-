// Procedural materials share the persistent renderer; no texture downloads or extra contexts.
const auroraCelestialNoise=`
float hash3(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float clouds(vec3 p){return noise3(p)*.57+noise3(p*2.03)*.28+noise3(p*4.07)*.15;}
`;
const auroraCelestialSurface=`precision highp float;
varying vec3 vN,vP,vC;uniform vec3 uColor,uLight,uEye;uniform float uKind,uAlpha,uTime,uBiome;
${auroraCelestialNoise}
void main(){
 vec3 n=normalize(vN),view=normalize(uEye-vP),c=uColor;float emission=0.;
 if(uKind<-.5){float a=1.;if(uKind< -1.5){float d=length(gl_PointCoord-.5)*2.;a=pow(max(0.,1.-d),1.6);c=vN;}gl_FragColor=vec4(c,uAlpha*a);return;}
 float grain=clouds(n*48.),continent=clouds(n*4.8),rim=pow(1.-max(dot(n,view),0.),3.);

 if(uKind>5.5){c=vC*(.88+grain*.24);if(uBiome>.5&&uBiome<1.5)emission=smoothstep(.3,.7,c.r)* (1.-smoothstep(.22,.42,c.b));}
 else if(uKind<.5){float land=smoothstep(.49,.54,continent);c=mix(vec3(.018,.12,.22),mix(vec3(.12,.28,.15),vec3(.36,.43,.25),grain),land);c=mix(c,vec3(.83,.90,.93),smoothstep(.80,.95,abs(n.y)+continent*.1));}
 else if(uKind<1.5){float channels=1.-smoothstep(.035,.09,abs(continent-.5));c=mix(vec3(.10,.105,.12)*(grain+.6),vec3(1.,.27,.018),channels);emission=channels;}
 else if(uKind<2.5){float canyon=1.-smoothstep(.018,.065,abs(continent-.5));c=mix(mix(vec3(.36,.13,.07),vec3(.76,.35,.17),grain),vec3(.09,.42,.57),canyon);}
 else if(uKind<3.5){float band=sin(n.y*42.+clouds(n*9.)*5.);c=mix(vec3(.40,.20,.14),vec3(.92,.79,.57),band*.5+.5)*(grain*.24+.88);}
 else c=mix(vec3(.24,.25,.28),vec3(.57,.57,.55),grain);
 float day=max(dot(n,uLight),0.);c*=.16+.84*day;
 if(uBiome<.5){float cloud=smoothstep(.57,.73,clouds(n*12.));c=mix(c,vec3(.86,.94,.98)*(.24+.76*day),cloud*.68);c+=vec3(.025,.11,.20)*rim*(.25+day);}
 else if(uBiome<1.5){c+=vec3(1.,.23,.012)*emission*(.82+.16*sin(uTime*.9+grain*12.));c+=vec3(.20,.038,.007)*rim;}
 else if(uBiome<3.5)c+=vec3(.10,.09,.07)*rim;
 gl_FragColor=vec4(c,uAlpha);
}`;
function createCelestialEffects(){
 const vertex=`attribute vec2 aPosition;varying vec2 vUV;uniform vec2 uCenter,uExtent;void main(){vUV=aPosition;gl_Position=vec4(uCenter+aPosition*uExtent,0.,1.);}`;
 const fragment=`precision highp float;varying vec2 vUV;uniform float uMode,uTime,uAspect,uFov;uniform vec3 uColor,uRight,uUp,uForward;${auroraCelestialNoise}
 void main(){if(uMode<.5){
 vec3 ray=normalize(uForward+vUV.x*uAspect*uFov*uRight+vUV.y*uFov*uUp);
 float neb=clouds(ray*4.2+vec3(12,4,8));float band=exp(-pow((ray.y+ray.x*.33+.55)*3.,2.));
 float dust=smoothstep(.30,.72,neb)*band;vec3 c=vec3(.006,.008,.020)+mix(vec3(.19,.06,.32),vec3(.035,.18,.22),clouds(ray*6.))*dust;
 c*=1.-smoothstep(.53,.76,clouds(ray*14.))*band*.75;
 vec3 field=ray*720.,cell=floor(field);float star=step(.996,hash3(cell))*exp(-dot(fract(field)-.5,fract(field)-.5)*16.);c+=mix(vec3(.56,.72,1.),vec3(1.,.79,.55),hash3(cell+9.))*star*.8;
 gl_FragColor=vec4(c,1.);return;}
 gl_FragColor=vec4(0.);}`;
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const a=gl.getAttribLocation(program,'aPosition'),u={};for(const k of ['uCenter','uExtent','uMode','uTime','uAspect','uFov','uColor','uRight','uUp','uForward'])u[k]=gl.getUniformLocation(program,k);
 function draw(mode,center,extent,color,time,right,up,forward){gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);gl.uniform2fv(u.uCenter,center);gl.uniform2fv(u.uExtent,extent);gl.uniform1f(u.uMode,mode);gl.uniform1f(u.uTime,time);gl.uniform1f(u.uAspect,W/H);gl.uniform1f(u.uFov,Math.tan(FOV/2));gl.uniform3fv(u.uColor,color);gl.uniform3fv(u.uRight,right);gl.uniform3fv(u.uUp,up);gl.uniform3fv(u.uForward,forward);gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,mode?gl.ONE:gl.ONE_MINUS_SRC_ALPHA);gl.drawArrays(gl.TRIANGLES,0,6);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);}
 return {draw,dispose(){gl.deleteBuffer(b);gl.deleteProgram(program);}};
}
function auroraStarType(id){return [0,1,2,3,0][id%5];}
function auroraStarColor(id){return [[1.,.62,.24],[.60,.73,1.],[1.,.39,.16],[.79,.85,1.]][auroraStarType(id)];}
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
 #define PI 3.141592653589793
float hash13(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);vec2 uv=i.xy+vec2(37.,17.)*i.z+f.xy;vec2 rg=texture2D(uNoise,(uv+.5)/256.).rg;return mix(rg.r,rg.g,f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*noise3(p);p=p*2.04+vec3(1.4,3.7,2.5);a*=.5;}return s;}
mat3 rotY(float a){float s=sin(a),c=cos(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rotX(float a){float s=sin(a),c=cos(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
float radius(int i){return 1.;}
vec3 tint(int i){if(i==0)return vec3(1.,.39,.065);if(i==1)return vec3(.12,.47,1.);if(i==2)return vec3(1.,.105,.018);return vec3(.49,.69,1.);}
vec2 hitSphere(vec3 ro,vec3 rd,float r){float b=dot(ro,rd),c=dot(ro,ro)-r*r,h=b*b-c;if(h<0.)return vec2(-1.);h=sqrt(h);return vec2(-b-h,-b+h);}
vec3 surface(vec3 n,vec3 rd,int id){
 float tm=uTime*(id==2?.065:.12);vec3 p=rotY(uRotation*(id==1?.11:id==2?.038:.065))*rotX(.18)*n;
 float broad=fbm(p*(id==2?3.5:5.6)+vec3(0.,tm*.23,tm*.12));
 vec3 warp=vec3(noise3(p*5.+tm*.08),noise3(p*5.+17.-tm*.07),noise3(p*5.-5.+tm*.06));
 float flow=fbm(p*(id==2?10.:16.)+warp*2.+vec3(tm*.35,0.,-tm*.12));
 float fil=1.-abs(2.*noise3(p*(id==2?29.:52.)+warp*4.+tm*.19)-1.);
 float fine=noise3(p*(id==2?62.:145.)+warp*6.+tm*.55);
 float fine2=noise3(p*(id==2?125.:290.)-tm*.65);
 float conv=smoothstep(.23,.77,flow*.72+broad*.28);
 float grains=smoothstep(.27,.82,fine);
 float heat=clamp(conv*.60+fil*.16+grains*.19+fine2*.05,0.,1.);
 float spot=1.-smoothstep(.31,.41,broad+.12*flow);
 float limb=pow(max(.006,dot(n,-rd)),.43);
 vec3 c;
 if(id==0){
  c=mix(vec3(.27,.017,.001),vec3(3.4,1.5,.20),pow(heat,1.5));
  c+=vec3(1.7,.5,.045)*pow(fil,12.)*.28;
  c*=1.-spot*.91;
 }else if(id==1){
  c=mix(vec3(.018,.075,.23),vec3(1.38,2.65,4.5),pow(heat,1.35));
  c+=vec3(.08,.40,1.1)*pow(fil,10.);
  c*=1.-spot*.45;
 }else if(id==2){
  float cells=smoothstep(.18,.76,flow);
  c=mix(vec3(.14,.004,.0004),vec3(3.5,.53,.065),pow(heat*.75+cells*.25,1.75));
  c*=1.-spot*.75;
 }else{
  float wd=fbm(p*25.+vec3(tm*.06));
  c=mix(vec3(.24,.48,.94),vec3(1.5,2.1,3.5),.30+wd*.49+fine*.12);
  limb=pow(max(.002,dot(n,-rd)),.70);
 }
 c*=.12+.88*limb;
 float rim=pow(1.-max(0.,dot(n,-rd)),6.0);
 c+=tint(id)*rim*(id==3?.018:.23);
 if(id==0&&uBurstAge>=0.){
  vec3 bn=normalize(vec3(.62,.45,.78));float flash=exp(-uBurstAge*1.8);
  c+=vec3(6.,2.3,.3)*exp(-70.*(1.-dot(n,bn)))*flash;
 }
 return c;
}
// Volumetric, turbulent radial outflow. Its phase travels away from the surface.
vec3 corona(vec3 ro,vec3 rd,int id,float stop){
 float r=radius(id),outer=r*(id==3?2.25:2.6);
 vec2 hit=hitSphere(ro,rd,outer);if(hit.y<0.)return vec3(0.);
 float from=max(hit.x,0.),to=min(hit.y,stop);if(to<=from)return vec3(0.);
 int steps=uDetail>1.1?22:14;
 float dt=(to-from)/float(steps);vec3 sum=vec3(0.);
 float phase=uTime*(id==1?.70:id==2?.17:.40);
 for(int j=0;j<22;j++){
  if(j>=steps)break;
  float t=from+(float(j)+.5)*dt;vec3 q=ro+rd*t;float d=length(q)/r;float h=d-1.;
  if(h<0.)continue;
  vec3 n=q/(r*d);vec3 p=rotY(uRotation*.024)*n;
  if(id==3){sum+=tint(id)*exp(-h*8.)*.40*uCorona*dt/r;continue;}
  float fold=noise3(p*8.+vec3(phase*.05));
  float wisps=noise3(p*38.+fold*3.+vec3(h*2.-phase*.11));
  float flow=noise3(p*77.+vec3(h*11.-phase*2.));
  float clump=smoothstep(.48,.77,noise3(p*22.+fold*2.));
  float dense=exp(-h*17.)*(.40+.90*wisps+.35*flow)*uCorona;
  float spicules=pow(wisps,5.)*exp(-h*6.5)*6.*uCorona;
  float stream=clump*pow(flow,4.)*exp(-h*3.3)*.30*uWind;
  float pulse=.35+.65*pow(.5+.5*sin(h*48.-phase*12.+fold*30.),8.);
  float threads=pow(noise3(p*132.+fold*6.),15.)*exp(-h*2.1)*pulse*1.45*uWind;
  float density=dense+spicules+stream+threads;
  sum+=tint(id)*density*dt/r*(id==1?1.45:id==2?1.05:1.35);
 }
 return sum;
}
// Thin glowing loops lie in real 3-D planes, attached to the stellar surface.
// Surface intersection depth provides correct occultation from every angle.
vec3 prominences(vec3 ro,vec3 rd,int id,float stop){
 if(id==3||uLoops<.01)return vec3(0.);
 float r=radius(id);vec3 col=vec3(0.);
 mat3 rotation=rotY(uRotation*(id==2?.038:id==1?.11:.065));
 for(int k=0;k<8;k++){
  if(id==1&&k>2)break;
  if(id==0&&k>5)break;
  if(id==2&&k>3)break;
  float fk=float(k),a=fk*2.39996+.9;
  vec3 n=normalize(vec3(cos(a),sin(a),sin(fk*2.14+.3)*.40));
  n=rotation*n;
  vec3 u=normalize(cross(n,vec3(.10,.23,1.)));
  vec3 v=normalize(cross(n,u));
  float denom=dot(rd,v);if(abs(denom)<.007)continue;
  float scale=.23+.12*sin(fk*3.6+1.);
  if(id==1)scale*=.67;if(id==2)scale*=1.15;
  float bigR=r*scale;
  vec3 center=n*r*.984;
  float t=dot(center-ro,v)/denom;
  if(t<0.||t>stop)continue;
  vec3 q=ro+rd*t,rel=q-center;
  if(length(q)<r*.998)continue;
  float x=dot(rel,u),y=dot(rel,n),rr=length(vec2(x,y));
  float ang=atan(y,x);
  float wiggle=(sin(ang*13.+fk*4.+uTime*.47)+sin(ang*21.-uTime*.32))*.004*r;
  float dist=abs(rr-bigR-wiggle);
  float thickness=r*(.006+.003*max(0.,sin(ang)));
  float core=exp(-dist*dist/(thickness*thickness));
  float halo=exp(-dist/(r*.018))*.19;
  float braid=.30+.70*pow(.5+.5*sin(ang*35.-uTime*3.+fk*8.),2.);
  float travel=.30+.7*pow(.5+.5*sin(ang*4.-uTime*1.7+fk),4.);
  float foreshorten=smoothstep(.015,.15,abs(denom));
  col+=(tint(id)*2.1+vec3(.1,.06,.03))*(core*braid+halo)*(.65+travel)*foreshorten;
  // Parallel filament around the arch.
  float dist2=abs(rr-bigR-r*.022-wiggle);
  col+=tint(id)*exp(-dist2/(r*.005))*.47*travel*foreshorten;
 }
 return col*uLoops;
}
vec3 eruption(vec3 ro,vec3 rd,float stop){
 if(uBurstAge<0.||uBurstAge>11.)return vec3(0.);
 float r=radius(0);vec3 n=normalize(vec3(.62,.45,.78));
 float age=uBurstAge;
 vec3 center=n*r*(1.+age*.37);
 float size=r*(.13+age*.13);vec2 hi=hitSphere(ro-center,rd,size*2.);
 if(hi.y<0.)return vec3(0.);float start=max(0.,hi.x),end=min(hi.y,stop);
 if(end<=start)return vec3(0.);float stepSize=(end-start)/12.;vec3 outc=vec3(0.);
 for(int j=0;j<12;j++){
  vec3 pos=ro+rd*(start+(float(j)+.5)*stepSize);
  vec3 q=(pos-center)/size;
  float shell=exp(-pow((length(q)-1.0)*7.,2.));
  float clump=fbm(q*4.+vec3(age*.25));
  float den=shell*smoothstep(.25,.66,clump)*exp(-age*.22);
  outc+=vec3(3.3,.8,.08)*den*stepSize/size*1.4;
 }
 return outc;
}

vec3 film(vec3 col){
 col=max(col,0.)*uExposure;
 // A compact filmic curve preserves dark cells in emissive stellar surfaces.
 col=(col*(2.51*col+.03))/(col*(2.43*col+.59)+.14);
 return pow(clamp(col,0.,1.),vec3(1./2.2));
}

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
