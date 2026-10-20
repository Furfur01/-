// Original fusion shield wave, shared by the live battlefield and preview.
export const shieldRippleGLSL=`
float shieldHex(vec3 p){
 vec2 uv=vec2(atan(p.x,-p.z)/6.2832*150.,acos(clamp(p.y,-1.,1.))/3.1416*70.);
 vec2 r=vec2(1.,1.732),h=r*.5,a=mod(uv,r)-h,b=mod(uv-h,r)-h;
 vec2 g=abs(dot(a,a)<dot(b,b)?a:b);
 return smoothstep(.40,.49,max(dot(g,normalize(vec2(1.,1.732))),g.x));
}
float shieldRipple(vec3 p,vec3 hit,float age,float strength){
 if(age<0.||age>=1.4)return 0.;
 float d=acos(clamp(dot(p,hit),-1.,1.));
 float ring=exp(-pow((d-age*.5)*22.,2.))*(1.-age/1.4);
 float core=exp(-d*d*900.)*max(0.,1.-age*2.5);
 return (ring*(.15+.8*shieldHex(p))*.8+core*1.6)*strength;
}`;
