// Pure counterpart of CONTINUUM's metal-city heightAt. Shared by CPU and Worker.
const clamp=v=>Math.max(0,Math.min(1,v)),smooth=v=>(v=clamp(v),v*v*(3-2*v));
const main={x:-15.15,z:-1.1,rx:11.05,rz:12.9,depth:4.75};
const auxiliary={x:-19,z:-17.1,rx:5.9,rz:2.3,depth:1.4};
const ramp=Array.from({length:251},(_,i)=>{const t=i/250,r=1.015+(.22-1.015)*t,a=-.06*Math.PI+t*Math.PI*4.35;return [main.x+Math.cos(a)*main.rx*r,-main.depth*t,main.z+Math.sin(a)*main.rz*r];});
function pit(x,z,p,withRamp){
  const r=Math.hypot((x-p.x)/p.rx,(z-p.z)/p.rz);if(r>=1.025)return 0;
  const levels=withRamp?7:3;let h=-p.depth;
  if(r>.22){const f=(r-.22)/((1.025-.22)/levels),i=Math.floor(f);h+=p.depth/levels*(i+smooth((f-i-.28)/.72));}
  if(withRamp){let distance=Infinity,rampHeight=0;for(let i=1;i<ramp.length;i++){const a=ramp[i-1],b=ramp[i],dx=b[0]-a[0],dz=b[2]-a[2],t=clamp(((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz)),d=(x-a[0]-dx*t)**2+(z-a[2]-dz*t)**2;if(d<distance){distance=d;rampHeight=a[1]+(b[1]-a[1])*t;}}if(distance<.61*.61)h+=(rampHeight-h)*(1-smooth((Math.sqrt(distance)-.41)/.2));}
  return h;
}
export function continuumMineHeight(x,z){return pit(x,z,main,true)+pit(x,z,auxiliary,false);}
