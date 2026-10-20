// Pure approved campus relief, shared by CPU, Worker and rendered roads.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export function campusHeightField(p,{gas}={}){
  const mining=p.id==='Metal_Mine',floating=gas??p.environment==='atmosphere';
  function natural(x,z){
    if(floating)return 6;
    if(p.space){let y=1.5+Math.sin(x*.045)*1.1+Math.cos(z*.04)*.8;if(p.environment==='crystal'){const dist=Math.abs(x-22-z*.4);y+=dist<8?-2.5*(1-dist/8):x<54?3*Math.sin(z*.05)**2:0;}if(p.id==='Radar_Facility')y+=3.5*Math.exp(-((x-80)**2/1600+(z-40)**2/650));return y;}
    let y=1.2+Math.sin(x*.033+z*.012)*1.2+Math.cos(z*.041-x*.016)*.7;
    const outer=Math.max(0,Math.max(-x,x-160,-z,z-140));y+=Math.sin(x*.063)*Math.cos(z*.045)*Math.min(4,outer*.2);
    if(!mining){y+=6*Math.exp(-((x-145)**2/500+(z-12)**2/420))+4*Math.exp(-((x+7)**2/900+(z-40)**2/600));}
    else{const d=Math.hypot((x-29)/24,(z-44)/36);const ridge=17*Math.max(0,1-Math.abs(x-12)/29)*Math.max(0,1-Math.abs(z-44)/65);y+=ridge;if(d<1){const level=d<.22?-5:d<.42?-2.8:d<.62?-.3:d<.82?2.5:5.5;y=1+level;}else if(d<1.18)y=y*smooth((d-1)/.18)+(6.5)*(1-smooth((d-1)/.18));}
    return y;
  }
  const pads=p.buildings.map(b=>({...b,level:natural(b.x,b.y)}));
  // Broad functional terraces preserve the approved campus layout without flattening the whole landscape.
  if(!mining)for(const b of pads)b.level=Math.round(b.level*2)/2;
  for(const b of pads)if(mining&&!['exc1','exc2'].includes(b.id))b.level=Math.round(b.level*.5)*2;
  // Close neighbours share a construction terrace; their foundation blends must not fight.
  const groups=pads.map(b=>[b]);for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++)if(groups[i].some(a=>groups[j].some(b=>Math.max(Math.abs(a.x-b.x)-(a.w+b.w)/2,Math.abs(a.y-b.y)-(a.d+b.d)/2)<4||p.terraces?.some(ids=>ids.includes(a.id)&&ids.includes(b.id))))){groups[i].push(...groups[j]);groups.splice(j,1);i=-1;break;}
  for(const group of groups)if(group.length>1){const level=group.reduce((s,b)=>s+b.level,0)/group.length;for(const b of group)b.level=level;}
  function height(x,z){let nearest=null,distance=Infinity,sum=0,weight=0;for(const b of pads){const d=Math.max(Math.abs(x-b.x)-b.w/2,Math.abs(z-b.y)-b.d/2);if(d<distance){nearest=b;distance=d;}if(!mining&&d>2&&d<12){const w=(1-smooth((d-2)/10))/(d-2)**2;sum+=b.level*w;weight+=w;}}const y=natural(x,z);if(distance<=2)return nearest.level;if(!mining)return (sum+y*.035)/(weight+.035);if(distance>=4)return y;const w=1-smooth((distance-2)/2);return y*(1-w)+nearest.level*w;}
  const samples=new Map();const vertex=(x,z)=>{const key=`${x},${z}`;if(!samples.has(key))samples.set(key,height(x,z));return samples.get(key);};
  function surfaceHeight(x,z){const x0=Math.floor((x+32)/2)*2-32,z0=Math.floor((z+42)/2)*2-42,u=(x-x0)/2,v=(z-z0)/2,a=vertex(x0,z0),b=vertex(x0+2,z0),c=vertex(x0,z0+2),d=vertex(x0+2,z0+2);return u+v<=1?a*(1-u-v)+b*u+c*v:b*(1-v)+c*(1-u)+d*(u+v-1);}
  return {height,surfaceHeight,pads,natural,floating,mining};
}
