// Authoritative, deterministic flight paths. Distances/speeds are game units;
// historical inspiration and the adaptation limits are in combat-maneuvers.md.
import {STEP_MS} from './spatial-profiles.mjs';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const direction=s=>({x:Math.sin(s.yaw)*Math.cos(s.pitch),y:Math.sin(s.pitch),z:Math.cos(s.yaw)*Math.cos(s.pitch)});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const point=(s,d,length)=>({x:s.x+d.x*length,y:s.y+d.y*length,z:s.z+d.z*length});

function attackPass(b,s,t,fighter){
  const p=s.profile,d=distance(s,t),forward=direction(s);
  const toward={x:(t.x-s.x)/(d||1),y:(t.y-s.y)/(d||1),z:(t.z-s.z)/(d||1)};
  const alignment=forward.x*toward.x+forward.y*toward.y+forward.z*toward.z;
  let run=s.maneuver;
  if(!run||run.target!==t.id||run.kind!==(fighter?'fighter':'spinal')){
    run=s.maneuver={kind:fighter?'fighter':'spinal',target:t.id,phase:'attack',since:b.tick,side:s.id%2?1:-1};
  }
  // Start the break before collision; keep flying through the pass instead of
  // instantly reversing toward the target now behind the cockpit.
  const clearance=p.radius+t.profile.radius+Math.max(12,p.speed*.45);
  const breakRange=Math.max(clearance,p.range*(fighter?.22:.34));
  if(run.phase==='attack'&&(d<breakRange||d<p.range*.9&&alignment<-.15)){
    run.phase='extend';run.since=b.tick;
    run.exit={x:forward.x+Math.cos(s.yaw)*run.side*.65,y:forward.y+(fighter?.25:.06)*(s.station.y>=0?1:-1),z:forward.z-Math.sin(s.yaw)*run.side*.65};
    const length=Math.hypot(run.exit.x,run.exit.y,run.exit.z);
    for(const axis of ['x','y','z'])run.exit[axis]/=length;
  }
  const elapsed=(b.tick-run.since)*STEP_MS/1000;
  if(run.phase==='extend'&&((elapsed>(fighter?2:6)&&d>breakRange*1.7)||elapsed>(fighter?6:18))){
    run.phase='rejoin';run.since=b.tick;
  }
  if(run.phase==='rejoin'&&alignment>.92&&d>breakRange*1.25){run.phase='attack';run.since=b.tick;}
  if(run.phase==='extend')return {...point(s,run.exit,Math.max(p.range,p.speed*3)),speed:p.speed*(fighter?1:.85),bank:fighter};

  // A modest intercept lead closes on moving opponents; inside gun range the
  // nose follows the actual sight line so fixed beams retain a firing window.
  const lead=clamp((d-p.range*.75)/Math.max(p.speed,1),0,fighter?1.2:2),tf=direction(t);
  // Coaxial ships can alter course during reload, but recover the sight line
  // before the next shot. This is a small oblique leg, not a broadside orbit.
  const reload=fighter||run.phase!=='attack'||d>p.range?0:clamp((s.cooldown-1.2)*.24,0,.24)*run.side;
  return {x:t.x+tf.x*t.speed*lead+toward.z*d*reload,y:t.y+tf.y*t.speed*lead,z:t.z+tf.z*t.speed*lead-toward.x*d*reload,
    speed:p.speed*(fighter?(run.phase==='rejoin'?.78:.94):(run.phase==='rejoin'?.7:.48)),bank:fighter};
}

function navalCourse(b,s,t,goal){
  const p=s.profile,dx=t.x-s.x,dz=t.z-s.z,d=Math.hypot(dx,dz)||1;
  let run=s.maneuver;
  if(!run||run.kind!=='naval')run=s.maneuver={kind:'naval',phase:'close',tack:1};
  // Ships in the same line initially steam in the same world direction. Their
  // permanent lateral stations bound the sweep, so a long duel cannot drift
  // forever to the arena wall. Turning still obeys each hull's rudder rate.
  const sweep=Math.max(p.range*.65,s.station.spacing*1.5);
  if(s.z>s.station.z+sweep)run.tack=-1;
  else if(s.z<s.station.z-sweep)run.tack=1;
  const side=(s.side==='attacker'?1:-1)*run.tack;
  const hurt=s.hp/s.maxHp<.3,range=p.range*(hurt?.82:.7);
  const radial=clamp((d-range)/(p.range*.22),-1.2,1.6);
  run.phase=d>p.range*.92?'close':d<range*.75||hurt?'open':'broadside';
  const nx=dx/d,nz=dz/d,look=Math.max(100,p.speed*5);
  return {x:s.x+(nx*radial-nz*side)*look,y:goal.y,z:s.z+(nz*radial+nx*side)*look,
    speed:p.speed*(run.phase==='close'?.95:run.phase==='open'?.85:.72),bank:false};
}

function maneuverGoal(b,s,t,goal){
  const p=s.profile;
  if(!t||s.temporary||p.ground||p.speed<=0||!['fighter','screen','line'].includes(p.role))return null;
  if(p.role==='fighter'){
    if(goal.assembling){
      s.maneuver=null;
      // Circle the moving assembly station instead of parking in space.
      const dx=goal.x-s.x,dz=goal.z-s.z,d=Math.hypot(dx,dz)||1;
      const radius=Math.max(p.speed/Math.max(.1,p.turn)*1.4,s.station.spacing),radial=clamp((d-radius)/radius,-1,2),side=s.id%2?1:-1;
      return {x:s.x+(dx/d*radial-dz/d*side)*radius,y:goal.y,z:s.z+(dz/d*radial+dx/d*side)*radius,speed:p.speed*.72,bank:true};
    }
    return attackPass(b,s,t,true);
  }
  if(p.fixed)return attackPass(b,s,t,false);
  return navalCourse(b,s,t,goal);
}

export function combatManeuver(b,s,t,goal){
  const course=maneuverGoal(b,s,t,goal);
  if(!course)return null;
  const margin=Math.max(150,s.profile.speed/Math.max(.1,s.profile.turn)*3+s.profile.length);
  if(Math.abs(s.x)>b.boundary-margin||Math.abs(s.z)>b.boundary-margin){
    course.x=clamp(s.x,-b.boundary+margin*2,b.boundary-margin*2);
    course.z=clamp(s.z,-b.boundary+margin*2,b.boundary-margin*2);
  }
  return course;
}

// A committed pass does not oscillate between targets every acquisition tick.
// A dead target is always replaced by the caller; distant pursuit can retarget.
export function committedPass(s,t){
  return ['fighter','spinal'].includes(s.maneuver?.kind)&&s.maneuver.target===t?.id&&distance(s,t)<s.profile.range*2.5;
}
