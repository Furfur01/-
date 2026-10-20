// Ray integration and surface functions retained from the approved stellar and Gargantua sources.
// Display conversion is exclusively performed by Three.js tone/color chunks.
export const stellarFunctions=` #define uRotation uTime
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

`;
export const blackHoleFunctions=` float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
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
`;
