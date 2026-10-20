import {PLANS,footprint,polygonArea} from './plans.js';
import {prepare} from './geometry.js';
import {refineSpacePlan} from './space-plans.js';

const rectangle=([x,y,w,d])=>[[x,y],[x+w,y],[x+w,y+d],[x,y+d]];
function bounds(buildings){const pts=buildings.flatMap(footprint),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys);return [x,y,Math.max(...xs)-x,Math.max(...ys)-y];}
function place(p,positions){for(const [id,[x,y]]of Object.entries(positions))Object.assign(p.buildings.find(b=>b.id===id),{x,y});}
const road=(kind,points)=>({kind,points});

// The approved compact composition, shared by preview and production rendering.
export function previewPlan(id){
  const source=PLANS.find(p=>p.id===id);if(!source)throw Error(`Unknown campus ${id}`);
  const p=structuredClone(source),before=bounds(p.buildings);p.previewWalkways=[];p.courts=[];
  if(id==='Research_Lab'){
    Object.assign(p.buildings.find(b=>b.id==='shared'),{w:32,d:22,h:3.6,role:'primary',name:'环形共享科研核心'});
    Object.assign(p.zones.find(z=>z.id==='shared'),{name:'环形科研核心',note:'四段环形实验舱围绕共享仪器内庭，短连廊接主楼，东西两侧接专业实验组团。'});
    place(p,{main:[79,95],shared:[79,64],energy1:[79,36],energy2:[101,38],mat1:[47,56],mat2:[48,73],sys1:[111,57],sys2:[114,74],testControl:[125,96],testRig:[108,98],store:[47,35],service:[60,35],entry:[100,114]});
    p.roads=[road('freight',[[34,24],[135,24],[135,122],[117,122]]),road('freight',[[34,24],[34,82],[58,82],[58,45],[34,45]]),road('walk',[[79,122],[79,106]]),road('walk',[[79,108],[99,108],[99,81],[58,81],[58,46],[99,46],[99,81]])];
    place({buildings:p.entries},{public:[79,122],delivery:[34,24]});
    p.previewWalkways=[[[79,73],[79,85]],[[45.74,58.4],[47,58.4],[47,58],[58,58],[58,64],[66,64]],[[92,64],[99,64],[111,64],[111,59],[109.2,59]],[[79,55],[79,46],[78.2,46],[78.2,38.4],[77.02,38.4]]];
    p.landscape=p.landscape.filter(l=>l.kind==='ridge');p.landscape.push({kind:'test',points:rectangle([99,88,34,19])},{kind:'green',points:rectangle([61,77,36,6])});
    p.courts=[[39,48,17,31],[99,49,24,33],[66,27,42,18],[40,28,25,15],[62,83,34,24]];
    p.terraces=[['main','shared','mat1','mat2','sys1','sys2'],['energy1','energy2']];
  }else if(id==='Metal_Mine'){
    Object.assign(p.buildings.find(b=>b.id==='exc1'),{w:16,d:12,h:3.2,name:'矿壁切削采掘站'});
    place(p,{exc1:[21,31],exc2:[43,63],crusher:[70,40],process:[89,67],stock1:[119,59],stock2:[119,76],load:[108,99],weigh:[128,111],repair:[52,101],parts:[73,103],control:[83,114]});
    p.roads=[road('freight',[[134,122],[89,122],[89,85],[59,85],[59,54],[110,54],[110,85],[134,85],[134,122]]),road('freight',[[35,85],[89,85]])];
    place({buildings:p.entries},{out:[134,122],staff:[35,85]});
    p.courts=[[57,28,26,24],[69,56,40,23],[111,51,16,33],[90,92,43,24],[38,92,42,18]];
  }else if(id==='Robotics_Facility'){
    place(p,{raw:[43,40],machine:[79,40],assembly:[79,70],precision:[105,35],tool:[105,49],testcontrol:[125,61],testrig:[116,78],finished:[114,104],repair:[44,101],spares:[65,101],office:[81,104]});
    p.roads=[road('freight',[[25,120],[25,22],[137,22],[137,120],[25,120]]),road('freight',[[25,57],[114,57],[114,22]]),road('freight',[[25,88],[137,88]])];
    place({buildings:p.entries},{rawGate:[25,22],out:[137,120],staff:[46,120]});
    p.landscape=[{kind:'test',points:rectangle([103,55,30,31])},{kind:'green',points:rectangle([60,81,35,4])}];
    p.courts=[[29,29,70,23],[99,28,13,28],[59,59,40,22],[95,94,38,20],[30,92,59,20]];
    p.terraces=[['raw','machine','assembly','precision','tool'],['testcontrol','testrig','finished']];
  }
  refineSpacePlan(p);
  for(const z of p.zones){const bs=p.buildings.filter(b=>b.zone===z.id);if(bs.length){const [x,y,w,d]=bounds(bs);z.bounds=[x-2,y-2,w+4,d+4];}}
  p.previewBounds=bounds(p.buildings);const [x,y,w,d]=p.previewBounds;
  p.composition={previousArea:before[2]*before[3],area:w*d,coverage:p.buildings.reduce((a,b)=>a+polygonArea(footprint(b)),0)/(w*d),center:[x+w/2,y+d/2],reduction:1-w*d/(before[2]*before[3])};
  return prepare(p);
}
