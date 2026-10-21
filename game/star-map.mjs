import {systemTerritory,polity} from './sovereignty.mjs';
import {systemCoordinates} from './star-positions.mjs';
import {systemBiomes,planetsBySystem} from './system-biomes.mjs';
export {systemTypes} from './system-biomes.mjs';
import {plannedNpcs,npcPublic} from './npc-types.mjs';

export const STAR_MAP_VERSION=3;
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
export const systemPositions=()=>systemCoordinates().map(s=>({...s,name:systemName(s.id)}));
export function starMap(world){
  const existing=new Map();for(const p of Object.values(world.planets||{}))if(p.position[0]===1&&!p.moon)existing.set(p.position.join(':'),p);
  const planets=[],systems=planetsBySystem(world);
  for(let system=1;system<=SYSTEM_COUNT;system++){
    const local=systems.get(`1:${system}`)||[],types=systemBiomes(world,1,system,local),planned=new Map();
    // Public projection uses the same planner as initialization, without mutation.
    for(const {type,slot,id}of plannedNpcs(world,1,system,local))planned.set(slot,{npc:true,npcType:type.id,name:type.name,biome:'terrestrial'});
    for(let slot=1;slot<=15;slot++){
      const position=[1,system,slot],key=position.join(':'),p=existing.get(key)||planned.get(slot),biome=p?.biome||types[slot-1],catalogName=planetName(system,slot,biome);
      planets.push({key,id:p?.id??null,position,biome,catalogName,name:p?.name||catalogName,owner:p?.owner??null,ownerName:world.players?.[p?.owner]?.name||'',npc:!!p?.npc,npcSkin:p?.npcSkin??null,...npcPublic(p),moon:false,known:true});
    }
    planets.push({key:`1:${system}:16`,id:null,position:[1,system,16],name:systemName(system)+'小行星带',kind:'belt',owner:null});
  }
  for(const p of Object.values(world.planets||{}))if(p.position[0]===1&&p.moon)planets.push({key:bodyKey(p),id:p.id,position:[...p.position],name:p.name,catalogName:planetName(p.position[1],p.position[2],existing.get(p.position.join(':'))?.biome)+'卫星',biome:'moon',moon:true,parent:p.parent,owner:p.owner,ownerName:world.players?.[p.owner]?.name||''});
  for(const p of planets){Object.assign(p,systemTerritory(world,p.position));if(p.owner)p.polity=polity(world,p.owner);}
  return {version:STAR_MAP_VERSION,galaxy:1,systems:systemPositions().map(s=>({...s,...systemTerritory(world,[1,s.id]),expansionZone:world.sovereignty?.safeSystems.includes(s.id)||false})),planets};
}
