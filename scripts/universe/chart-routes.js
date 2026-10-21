import {missionVisual} from '../../game/mission-visual.mjs';
import {fleetColors} from '../../client/command-ui/fleet-map.mjs';

const taskNames={attack:'攻击',destroyMoon:'毁月',transport:'运输',deploy:'驻扎',colonize:'殖民',explore:'探险',mine:'采矿',recycle:'回收',spy:'侦察'};

// Chart overlay only. The mission clock and the physical fleet path stay authoritative.
export function chartRoute(n,mission,now){
  if(!['outbound','return','holding','waiting'].includes(mission.phase))return null;
  // Incoming returns no longer threaten this colony; their recall origin is private.
  if(mission.inbound&&mission.phase==='return')return null;
  const body=(id,coordinates)=>n.bodies.get(id)||n.bodies.get(coordinates?.join(':'));
  const home=body(mission.from,mission.fromPosition),destination=body(mission.target,mission.position);
  if(!home||(!destination&&mission.task!=='explore'))return null;
  const anchor=p=>n.level==='galaxy'?n.systems.find(s=>s.id===p.coordinates[1])?.position:p.position;
  const from=anchor(home),to=mission.task==='explore'?[0,0,0]:anchor(destination);
  if(!from||!to)return null;
  const returning=mission.phase==='return',pose=missionVisual(mission,now);
  const limit=returning&&mission.recalledElapsed!=null?missionVisual({phase:'outbound',start:0,end:mission.travel},mission.recalledElapsed).travel:1;
  const progress=returning?limit*(1-pose.travel):pose.travel;
  const hostile=mission.inbound&&['attack','destroyMoon','spy'].includes(mission.task);
  return {id:mission.id,from,to,progress,limit,returning,
    color:hostile?'#db8c8c':fleetColors[mission.task],bend:.12,
    name:`${taskNames[mission.task]}舰队${returning?' · 返航':mission.phase==='holding'?' · 作业中':hostile?' · 来袭':''}`};
}

export function routePoint(a,b,c,t){
  return {x:(1-t)**2*a.x+2*(1-t)*t*c.x+t*t*b.x,y:(1-t)**2*a.y+2*(1-t)*t*c.y+t*t*b.y};
}
