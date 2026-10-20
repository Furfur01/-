// Versioned, serializable appearance data. No account, clock, renderer or save access.
export const PLANET_PROFILE_VERSION = 1;
export const PLANET_STYLES = Object.freeze({
  terrestrial:['超级大陆','群岛海洋','高原峡湾','冰冠山地'],
  mercury:['熔岩海','火山群','破碎高原','撞击盆地'],
  mars:['晶体裂谷','风蚀台地','赤沙盆地','晶簇山原'],
  gas:['木星式宽云带','巨眼风暴','极地涡旋群','深蓝湍流云海']
});
export const PLANET_QUALITY = Object.freeze({
  low:Object.freeze({segments:64,rings:40,patchSegments:32,cloudLayers:1,crystals:0,volumes:0}),
  standard:Object.freeze({segments:128,rings:80,patchSegments:48,cloudLayers:3,crystals:32,volumes:0}),
  high:Object.freeze({segments:192,rings:120,patchSegments:64,cloudLayers:3,crystals:64,volumes:2})
});
export const qualityName = value => Object.hasOwn(PLANET_QUALITY,value)?value:'standard';
export const clamp01 = x => Math.max(0,Math.min(1,x));
export const smooth01 = x => {x=clamp01(x);return x*x*(3-2*x);};
export const unit = v => {const r=Math.hypot(...v)||1;return v.map(x=>x/r);};
export const dot3 = (a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
function hash(text){let h=2166136261;for(const c of String(text))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
export function profileRandom(key,stream){let a=hash(`${key}/${stream}`);return()=>{a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
const direction = r => {const y=r()*2-1,a=r()*Math.PI*2,s=Math.sqrt(1-y*y);return [Math.cos(a)*s,y,Math.sin(a)*s];};
const PALETTES={
  terrestrial:[[.018,.085,.12],[.11,.23,.14],[.46,.37,.23],[.78,.88,.9],[.16,.46,.85]],
  mercury:[[.055,.037,.048],[.16,.105,.105],[.39,.31,.29],[.63,.5,.36],[.9,.2,.045]],
  mars:[[.14,.038,.026],[.38,.12,.055],[.67,.32,.13],[.13,.72,.73],[.74,.27,.12]],
  gas:[[.12,.055,.07],[.55,.24,.12],[.87,.63,.36],[.94,.84,.64],[.26,.49,.8]]
};
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
export function createPlanetProfile({key='planet',biome='terrestrial',version=PLANET_PROFILE_VERSION}={}){
  if(version!==PLANET_PROFILE_VERSION)throw new RangeError(`Unsupported planet appearance version: ${version}`);
  if(!Object.hasOwn(PLANET_STYLES,biome))throw new RangeError(`Unsupported planet biome: ${biome}`);
  key=String(key);const identity=`planet-v${version}/${biome}/${key}`,r=profileRandom(identity,'structure'),style=Math.floor(r()*4);
  const fieldRandom=profileRandom(identity,'fields'),fields=Array.from({length:5},()=>({offset:[fieldRandom()*53,fieldRandom()*53,fieldRandom()*53],frequency:1.3+fieldRandom()*1.6}));
  const regionRandom=profileRandom(identity,'regions'),regions=Array.from({length:9},(_,i)=>({center:direction(regionRandom),kind:i%3,scale:.7+regionRandom()*.5}));
  const featureRandom=profileRandom(identity,'landmarks'),landmarks=Array.from({length:2},(_,i)=>({center:direction(featureRandom),axis:direction(featureRandom),radius:.24+featureRandom()*.25,strength:.7+featureRandom()*.6,kind:i===0?style:(style+1+Math.floor(featureRandom()*2))%4}));
  const colorRandom=profileRandom(identity,'palette'),tint=[.8+colorRandom()*.4,.8+colorRandom()*.4,.8+colorRandom()*.4];
  let palette=PALETTES[biome].map(c=>c.map((x,i)=>Math.min(.98,x*tint[i])));
  if(biome==='gas'&&style===3)palette=[[.035,.065,.15],[.075,.24,.43],[.18,.51,.69],[.62,.83,.91],[.22,.48,.9]];
  const weatherRandom=profileRandom(identity,'weather'),stormRandom=profileRandom(identity,'storms');
  const storms=Array.from({length:3+Math.floor(stormRandom()*4)},(_,i)=>{
    let center=direction(stormRandom);if(i===0){const y=style===2?.88:stormRandom()*.7-.4,a=stormRandom()*Math.PI*2;center=[Math.sqrt(1-y*y)*Math.cos(a),y,Math.sqrt(1-y*y)*Math.sin(a)];}else if(i===1&&style===2)center=unit([.2,-1,.1]);
    return {center,radius:i===0?(style===1?.34:.23)+stormRandom()*.08:.065+stormRandom()*.09,spin:(stormRandom()<.5?-1:1)*(.12+stormRandom()*.15),drift:(stormRandom()-.5)*.0015,strength:i===0?1:.5+stormRandom()*.4};
  });
  return freeze({version,key,biome,identity,style,styleName:PLANET_STYLES[biome][style],fields,regions,landmarks,palette,
    relief:.8+r()*.45,seaLevel:biome==='terrestrial'?-.004:biome==='mercury'?-.009:null,
    landforms:biome==='gas'?['纬向云带','风暴眼墙','极地涡旋','高层卷云']:biome==='terrestrial'?['海洋','平原','山系','峡湾','冰冠']:biome==='mercury'?['玄武岩台地','熔岩裂谷','火山口','撞击盆地']:['赤沙盆地','台地','裂谷','晶脊'],
    weather:{bands:8+Math.floor(weatherRandom()*11),warp:.08+weatherRandom()*.16,speed:.006+weatherRandom()*.008,phase:weatherRandom()*6.28,cloudCover:.38+weatherRandom()*.25,storms}
  });
}

// Trilinear value noise on 3-D coordinates: no UV seams or polar singularities.
const fract=x=>x-Math.floor(x);
function lattice(x,y,z){let a=fract(x*.3183099+.1)*17,b=fract(y*.3183099+.1)*17,c=fract(z*.3183099+.1)*17;return fract(a*b*c*(a+b+c));}
export function noise3(x,y,z){const a=Math.floor(x),b=Math.floor(y),c=Math.floor(z),u=smooth01(x-a),v=smooth01(y-b),w=smooth01(z-c),mix=(a,b,t)=>a+(b-a)*t;return mix(mix(mix(lattice(a,b,c),lattice(a+1,b,c),u),mix(lattice(a,b+1,c),lattice(a+1,b+1,c),u),v),mix(mix(lattice(a,b,c+1),lattice(a+1,b,c+1),u),mix(lattice(a,b+1,c+1),lattice(a+1,b+1,c+1),u),v),w);}
function field(n,f,scale=1){return noise3(n[0]*f.frequency*scale+f.offset[0],n[1]*f.frequency*scale+f.offset[1],n[2]*f.frequency*scale+f.offset[2]);}
export function regionWeights(n,profile){const w=[0,0,0];for(const r of profile.regions){const d=Math.max(.02,1-dot3(n,r.center));w[r.kind]+=r.scale/(d*d);}const sum=w[0]+w[1]+w[2];return w.map(v=>v/sum);}
// Height is in units of planet radius; the geometry adapter applies display scale.
export function sampleSurface(direction,profile){
  const n=unit(direction),p=profile,f=p.fields;
  if(p.biome==='gas')return {height:0,weights:regionWeights(n,p),moisture:0,heat:0,crystal:0,ice:0};
  const a=field(n,f[0]),b=field(n,f[1],2.2),c=field(n,f[2],4.8),fine=field(n,f[3],12),weights=regionWeights(n,p);
  const ridge=Math.pow(1-Math.abs(b*2-1),3),rift=Math.exp(-Math.pow((b-.5+(a-.5)*.38)*15,2));
  let height=0,heat=0,crystal=0,ice=0,moisture=field(n,f[4],1.5);
  if(p.biome==='terrestrial'){
    const coast=[.49,.56,.48,.5][p.style],continent=(a-coast)*.13;
    height=continent+ridge*weights[1]*.037+(c-.5)*.009-(rift*weights[2])*.014;
    if(p.style===1)height+=(b-.5)*.027;if(p.style===2)height+=weights[1]*.012;
    ice=smooth01((Math.abs(n[1])-(p.style===3?.47:.74))/.19)+smooth01((height-.043)/.024);
  }else if(p.biome==='mercury'){
    const cracks=Math.pow(rift,.6),terraces=(a-.3)*.65+Math.floor((a-.3)*8)/8*.35;
    height=terraces*(p.style===2?.065:.045)+ridge*weights[0]*.022-cracks*(p.style===0?.045:.026)+(c-.5)*.011;
    heat=clamp01(cracks*.9+smooth01((-.006-height)/.012));
    if(p.style===1||p.style===3)for(const region of p.regions.slice(0,4)){const d=Math.sqrt(Math.max(0,2-2*dot3(n,region.center)))/(.19*region.scale),rim=Math.exp(-Math.pow((d-.65)*6,2));height+=rim*.025-Math.exp(-d*d*16)*.025;heat=Math.max(heat,Math.exp(-d*d*16)*(p.style===1?1:.2));}
  }else{
    const terraces=a*.55+(Math.floor(a*7)+smooth01((fract(a*7)-.15)/.7))/7*.45;
    crystal=Math.pow(rift,.6)*weights[2];
    height=(terraces-.5)*(p.style===1?.078:.058)-rift*weights[0]*(p.style===0?.047:.031)+ridge*weights[2]*(p.style===3?.05:.027);
    const dune=Math.sin(dot3(n,unit(f[4].offset))*80+(c-.5)*7);
    height+=dune*.0005*weights[1]+(fine-.5)*.002;
    if(p.style===2)height-=weights[1]*.017;
  }
  for(const m of p.landmarks){
    const d=Math.sqrt(Math.max(0,2-2*dot3(n,m.center)))/m.radius,mask=Math.exp(-d*d*1.5),ring=Math.exp(-Math.pow((d-.72)*7,2));
    if(p.biome==='terrestrial'){
      if(m.kind%2===0){const band=Math.exp(-Math.pow(dot3(n,m.axis)*9,2));height+=mask*(.03*ridge+.022*band)*m.strength;}
      else height+=(ring*.022-mask*.014)*m.strength;
    }else if(p.biome==='mercury'){
      height+=(ring*.038-Math.exp(-d*d*9)*.047+(m.kind===3?Math.exp(-d*d*100)*.021:0))*m.strength;
      heat=Math.max(heat,Math.exp(-d*d*11)*m.strength);
    }else{
      const fault=Math.exp(-Math.pow(dot3(n,m.axis)*14,2))*mask;
      height+=mask*ridge*.028-fault*.03;crystal=Math.max(crystal,fault*.95);
    }
  }
  const combat=smooth01((.992-n[1])/.012);
  return {height:Math.max(-.06,Math.min(.065,height*p.relief))*combat,weights,moisture,heat:heat*combat,crystal:crystal*combat,ice:clamp01(ice)};
}

// CPU weather signature for catalogue auditing; time is explicit, never random.
export function sampleAtmosphere(direction,p,time=0){const n=unit(direction),w=p.weather,base=field(n,p.fields[0],3),belt=.5+.5*Math.sin((n[1]+(base-.5)*w.warp)*w.bands*Math.PI+w.phase);let storm=0;for(const s of w.storms){const a=time*s.drift,c=Math.cos(a),v=Math.sin(a),center=[s.center[0]*c+s.center[2]*v,s.center[1],s.center[2]*c-s.center[0]*v],d=(1-dot3(n,center))/(s.radius*s.radius);storm+=Math.exp(-d*3)*s.strength;}return [belt,storm,base];}
