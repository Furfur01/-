import {stellarType} from '../../game/stellar-types.mjs';
export const WORLD_SCALE=100;
export const add=(a,b)=>a.map((v,i)=>v+b[i]);
export const sub=(a,b)=>a.map((v,i)=>v-b[i]);
export const mul=(a,n)=>a.map(v=>v*n);
export const length=a=>Math.hypot(...a);
export const norm=a=>mul(a,1/(length(a)||1));
export const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const mix=(a,b,t)=>a+(b-a)*t;
export const lerp=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
export const copyCamera=c=>({...c,center:c.center.slice()});
export function bodyRadius(p){return WORLD_SCALE*(p.moon?.28:p.npc?1.25:({gas:2.24,mercury:1.4,mars:1.54,terrestrial:1.75})[p.biome]||1.54);}
export const starRadius=id=>WORLD_SCALE*({main:7,blue:10,red:12,white:1.4,magnetar:.7})[stellarType(id).id];
export function orbitSlot(slot,system=[1,1],moon=false,parentRadius=175){
  const orbit=WORLD_SCALE*(18+slot*8.5),phase=slot*2.399963229728653+system[0]*.117+system[1]*.043;
  const position=[Math.cos(phase)*orbit,Math.sin(slot*1.73)*7,Math.sin(phase)*orbit];
  if(moon){const distance=Math.max(550,parentRadius*3.5),offset=mul(norm([1.4,.4,.7]),distance);return {position:add(position,offset),orbit};}
  return {position,orbit};
}
export function rotate(v,a){const c=Math.cos(a),s=Math.sin(a);return [v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c];}
export const spin=(p,time)=>time*(p.moon?.012:p.biome==='gas'?.045:.027);
export function bodyRecords(records,systems){
  const stars=new Map(systems.map(s=>[s.id,s])),parents=new Map(records.filter(p=>!p.moon).flatMap(p=>[[p.id,p],[p.position?.join(':'),p]]));
  return records.filter(p=>p.position?.[0]===1&&stars.has(p.position[1])).map(p=>{
    const local=orbitSlot(p.position[2],p.position.slice(0,2),p.moon,bodyRadius(parents.get(p.parent)||parents.get(p.position.join(':'))||{biome:'terrestrial'}));
    return {...p,key:p.key||(p.moon?`moon:${p.id}`:p.position.join(':')),coordinates:p.position.slice(),position:add(stars.get(p.position[1]).position,local.position),radius:bodyRadius(p),orbit:local.orbit,biome:p.moon?'moon':p.biome||'terrestrial'};
  });
}
// One transform for authoritative collision sphere, ships, projectiles and cameras.
export const battleScale=(p,b)=>p.radius/(b?.environment?.radius||12000);
export const battleAnchor=(p,b)=>sub(p.position,mul(b?.environment?.center||[700,-12400,0],battleScale(p,b)));
export function battleRow(b,id,time=performance.now()){
  if(b?.pilotRow?.[0]===id)return b.pilotRow;
  const row=b?.ships?.find(r=>r[0]===id);if(!row)return null;
  const old=b.previous?.find(r=>r[0]===id)||row,t=b.replay?1:clamp((time-b.received)/200,0,1),out=row.slice();
  for(let i=1;i<=3;i++)out[i]=mix(old[i],row[i],t);out[5]=mix(old[5],row[5],t);
  for(const i of [4,12])out[i]=(old[i]||0)+Math.atan2(Math.sin((row[i]||0)-(old[i]||0)),Math.cos((row[i]||0)-(old[i]||0)))*t;
  return out;
}
