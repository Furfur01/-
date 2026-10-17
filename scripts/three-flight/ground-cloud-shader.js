// One continuous density volume, rather than intersecting opaque smoke balls.
// Local box coordinates are converted to cloud-radius units for the cap/column.
export const groundCloudShader=`
float cloudHash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float cloudNoise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(cloudHash(i),cloudHash(i+vec3(1,0,0)),f.x),mix(cloudHash(i+vec3(0,1,0)),cloudHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(cloudHash(i+vec3(0,0,1)),cloudHash(i+vec3(1,0,1)),f.x),mix(cloudHash(i+vec3(0,1,1)),cloudHash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float cloudDensity(vec3 p,float age,float height,float seed){
 // Curl around the cap's rim: material rises inside, rolls out, then down.
 float radial=length(p.xz),dy=p.y-height,theta=atan(dy,radial-.57);
 float roll=age*.75,ringDistance=length(vec2(radial-.57,dy));
 vec3 flow=vec3(p.x,p.y-age*.16,p.z);
 flow.y=height+sin(theta+roll)*ringDistance;
 flow.xz*=max(.1,.57+cos(theta+roll)*ringDistance)/max(radial,.01);
 flow+=vec3(seed*.71,seed*.29,-seed*.43);
 float noise=cloudNoise(flow*4.)*.58+cloudNoise(flow*8.3+3.7)*.28+cloudNoise(flow*17.1)*.14;
 float disruption=(noise-.5)*.78;
 float mature=smoothstep(.3,2.2,age),diffusion=smoothstep(6.,18.,age);
 float cap=length(vec3(p.x,(p.y-height)/mix(.85,.47,mature),p.z));
 cap=1.-smoothstep(.66,1.12+diffusion*.2,cap+disruption);
 float f=clamp(p.y/max(height,.1),0.,1.);
 vec2 bend=vec2(sin(p.y*3.+seed+age*.3),cos(p.y*2.-seed))*.06*f;
 float width=.17+.12*f+.04*sin(f*8.-age*.8);
 float column=(1.-smoothstep(width*.5,width+.11, length(p.xz-bend)+disruption*.22))*smoothstep(-.05,.15,p.y)*(1.-smoothstep(height*.8,height*1.06,p.y));
 column*=mature*(1.-diffusion*.8);
 float density=max(cap,column)*smoothstep(.2+diffusion*.14,.68,noise);
 return density*smoothstep(0.,.09,p.y);
}
vec4 groundCloud(vec3 entry,vec3 eye,float age,float height,float seed){
 vec3 ray=normalize(entry-eye),safe=ray+mix(vec3(-.00001),vec3(.00001),step(vec3(0.),ray));
 vec3 t0=(-vec3(1.)-eye)/safe,t1=(vec3(1.)-eye)/safe;
 vec3 lo=min(t0,t1),hi=max(t0,t1);
 float near=max(0.,max(lo.x,max(lo.y,lo.z))),far=min(hi.x,min(hi.y,hi.z));
 if(far<=near)return vec4(0.);
 float stepSize=(far-near)/48.,jitter=.25+.5*cloudHash(vec3(gl_FragCoord.xy,seed));
 vec3 sum=vec3(0.);float alpha=0.;
 for(int i=0;i<48;i++){
  vec3 q=eye+ray*(near+(float(i)+jitter)*stepSize);
  vec3 p=vec3(q.x*1.6,(q.y+1.)*.5*(height+.95),q.z*1.6);
  float density=cloudDensity(p,age,height,seed);
  if(density>.008){
   float lightDensity=cloudDensity(p+vec3(-.13,.23,.09),age,height,seed);
   float lighting=clamp(.52+(density-lightDensity)*3.2,.12,1.);
   vec3 smoke=mix(vec3(.11,.12,.13),vec3(.64,.62,.59),lighting);
   float heat=exp(-max(0.,age-.18)*1.5)*(.6+density*.9);
   vec3 fire=mix(vec3(1.5,.17,.015),vec3(4.,2.6,.65),clamp(density*2.,0.,1.));
   vec3 color=mix(smoke,fire,clamp(heat,0.,1.));
   float a=1.-exp(-density*stepSize*9.*uOpacity);
   sum+=(1.-alpha)*a*color;alpha+=(1.-alpha)*a;
   if(alpha>.98)break;
  }
 }
 return vec4(sum/max(alpha,.001),alpha);
}
`;
