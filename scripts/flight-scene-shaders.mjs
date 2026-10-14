export const sceneShader=`
float sceneHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float sceneNoise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(sceneHash(i),sceneHash(i+vec3(1,0,0)),f.x),mix(sceneHash(i+vec3(0,1,0)),sceneHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(sceneHash(i+vec3(0,0,1)),sceneHash(i+vec3(1,0,1)),f.x),mix(sceneHash(i+vec3(0,1,1)),sceneHash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float sceneFbm(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*sceneNoise(p);p=p*2.03+vec3(7.1,3.7,1.9);a*=.5;}return v;}
vec4 spaceScene(vec3 d,float kind){
 if(kind>1.5&&kind<2.5){
  vec3 p=d*3.2;float warp=sceneFbm(p+vec3(2,5,1));float n=sceneFbm(p*2.1+warp*3.);
  float cloud=smoothstep(.28,.72,n),dust=smoothstep(.42,.66,sceneFbm(p*3.+vec3(7,1,9)));
  float ridge=pow(max(0.,1.-abs(n-.51)*8.),3.);
  vec3 color=mix(vec3(.035,.17,.21),vec3(.52,.16,.065),smoothstep(-.5,.65,d.x+d.y))*(cloud*.85+ridge*.3);
  color*=1.-dust*.85;
  return vec4(color,clamp(cloud*.75+dust*.6,.12,.91));
 }
 return vec4(.002,.007,.012,.20);
}
`;

export const sceneFragment=`
      if(uMode>4.5&&uMode<5.5){
        float age=uImpact.w*3.,d=length(vLocal-uImpact.xyz)/max(uShield.x,.001);
        float radius=age*.72,band=exp(-pow((d-radius)/.023,2.));
        float echo=exp(-pow((d-radius*.72)/.016,2.))*.27;
        float flash=exp(-d*38.)*exp(-age*12.);
        float fade=1.-smoothstep(.55,1.45,age);
        float rim=pow(1.-abs(dot(N,V)),2.5);
        alpha=clamp((band*.82+echo+flash+rim*.20*exp(-age*4.)*uShield.y)*fade*uOpacity,0.,.85);
        color=mix(uTint,vec3(.85,1.,1.),band*.6+flash*.3);
      }
      if(uMode>5.5&&uMode<6.5){vec4 sky=spaceScene(normalize(vLocal),uSelected);color=sky.rgb;alpha=sky.a;}
      if(uMode>6.5&&uMode<7.5){
        vec3 n=normalize(vLocal);float terrain=sceneFbm(n*4.8),cloud=sceneFbm(n*19.+vec3(uTime*.001));
        float land=smoothstep(.48,.52,terrain),ice=smoothstep(.77,.94,abs(n.y));
        vec3 surface=mix(vec3(.012,.10,.18),mix(vec3(.08,.19,.105),vec3(.28,.24,.13),smoothstep(.52,.68,terrain)),land);
        surface=mix(surface,vec3(.72,.81,.82),ice);surface=mix(surface,vec3(.8,.87,.9),smoothstep(.56,.72,cloud)*.88);
        float day=max(dot(n,normalize(uLight)),0.);color=surface*(.035+day*1.4)+vec3(.01,.05,.1)*pow(1.-abs(dot(N,V)),4.);
      }
      if(uMode>7.5&&uMode<8.5){float edge=pow(1.-abs(dot(N,V)),3.);color=vec3(.15,.52,1.);alpha=edge*.36*uOpacity;}
`;
