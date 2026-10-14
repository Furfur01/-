import {seeded} from './combat.mjs';

export const STAR_MAP_VERSION=1;
export const GALAXY=1, SYSTEM_COUNT=499;
const prefixes=Array.from('苍玄青白赤紫金银北南东霜暮晨幽远天星夜晓寒暖静明深长高初碧朱素灵');
const cores=Array.from('岑岚衡枢渊汐川原岳穹辰羽棠岫澜镜珀瑶岐岚峰影源庭弦遥落微和宁安曜'.replace('岐岚','岐嶂'));
const endings={terrestrial:['海','林','洲','湾','野','溪','湖','屿'],mercury:['铁','铬','钢','铂','钛','铜','熔','铱'],mars:['晶','棱','珪','璨','辉','璇','璧','琉'],gas:['云','霭','雾','涡','霓','霞','霰','飓']};
export function planetName(system,slot,biome){
  const index=(system-1)*15+slot-1;
  if(!Number.isInteger(index)||system<1||system>SYSTEM_COUNT||slot<1||slot>15)throw Error('行星编号无效');
  const k=(index*4051+137)%8192;
  return prefixes[k%32]+cores[Math.floor(k/32)%32]+(endings[biome]||endings.terrestrial)[Math.floor(k/1024)];
}
export const systemName=id=>prefixes[(id-1)%32]+cores[Math.floor((id-1)/32)]+'座';
export const bodyKey=p=>p.moon?`moon:${p.id}`:`1:${p.position[1]}:${p.position[2]}`;
export function systemTypes(seed,system){
  const ids=['terrestrial','mercury','mars','gas'],types=Array.from({length:15},(_,i)=>ids[i%4]);
  const random=seeded(seed^Math.imul(1,73856093)^Math.imul(system,19349663));
  for(let i=14;i>0;i--){const j=Math.floor(random()*(i+1));[types[i],types[j]]=[types[j],types[i]];}
  return types;
}
// Preserve ASTRAL's 499 positions, including the original local home anchor.
export function systemPositions(){
  let seed=2816;const random=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const gauss=()=>Math.sqrt(-2*Math.log(random()+1e-7))*Math.cos(Math.PI*2*random());
  return Array.from({length:SYSTEM_COUNT},(_,i)=>{const radius=2300+Math.pow(random(),.70)*14300,a=i%4*Math.PI/2+radius/17500*4.25+gauss()*.115;const position=[Math.cos(a)*radius+gauss()*260,gauss()*115,Math.sin(a)*radius+gauss()*260];return {id:i+1,name:systemName(i+1),position:i===15?[-6750,40,9260]:position};});
}
export function starMap(world){
  const existing=new Map();for(const p of Object.values(world.planets||{}))if(p.position[0]===1&&!p.moon)existing.set(p.position.join(':'),p);
  const planets=[];
  for(let system=1;system<=SYSTEM_COUNT;system++){
    const types=systemTypes(world.biomeSeed??0,system),planned=new Map();
    // Mirror public locations of unopened camps without initializing or saving them.
    if(!world.npcSystems?.[`1:${system}`]&&![...existing.values()].some(p=>p.npc&&p.position[1]===system)){
      const occupied=new Set([...existing.values()].filter(p=>p.position[1]===system).map(p=>p.position[2]));
      for(const m of world.missions||[])if(m.task==='colonize'&&m.phase==='outbound'&&m.position[0]===1&&m.position[1]===system)occupied.add(m.position[2]);
      for(const [preferred,name]of [[1,'废弃前哨'],[2,'赤铁守备站'],[4,'卡戎舰队'],[6,'遗落货仓']]){const slot=[preferred,...Array.from({length:15},(_,i)=>i+1)].find(slot=>!occupied.has(slot));if(slot){occupied.add(slot);planned.set(slot,{npc:true,name,biome:'terrestrial'});}}
    }
    for(let slot=1;slot<=15;slot++){
      const position=[1,system,slot],key=position.join(':'),p=existing.get(key)||planned.get(slot),biome=p?.biome||types[slot-1],catalogName=planetName(system,slot,biome);
      planets.push({key,id:p?.id??null,position,biome,catalogName,name:p?.name||catalogName,owner:p?.owner??null,ownerName:world.players?.[p?.owner]?.name||'',npc:!!p?.npc,npcSkin:p?.npcSkin??null,moon:false,known:true});
    }
    planets.push({key:`1:${system}:16`,id:null,position:[1,system,16],name:systemName(system)+'小行星带',kind:'belt',owner:null});
  }
  for(const p of Object.values(world.planets||{}))if(p.position[0]===1&&p.moon)planets.push({key:bodyKey(p),id:p.id,position:[...p.position],name:p.name,catalogName:planetName(p.position[1],p.position[2],existing.get(p.position.join(':'))?.biome)+'卫星',biome:'moon',moon:true,parent:p.parent,owner:p.owner,ownerName:world.players?.[p.owner]?.name||''});
  return {version:STAR_MAP_VERSION,galaxy:1,systems:systemPositions(),planets};
}
