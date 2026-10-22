// Presentation seconds are separate from authoritative flight/impact timestamps.
export const arsenalTimings={
 laser:{release:14,arrival:26,end:44,rawRelease:6.9,rawImpact:8},
 accelerator:{release:16,arrival:29,end:46,rawRelease:7,rawImpact:9},
 missile:{release:15,arrival:32,end:53.2,rawRelease:6,rawImpact:12.8},
};
export function arsenalShotTime(kind,time,t=arsenalTimings[kind]){
 if(time<=t.release)return time*t.rawRelease/t.release;
 if(time<=t.arrival)return t.rawRelease+(time-t.release)*(t.rawImpact-t.rawRelease)/(t.arrival-t.release);
 return t.rawImpact+time-t.arrival;
}

// One continuous, accelerating trajectory: no smoothstep braking at the muzzle
// and no new zero-velocity curve when the projectile leaves the launcher.
const missileExitSpeed=2*290/2.3;
export const missileFlightTime=distance=>Math.min(6.8,distance/(missileExitSpeed*1.5));
export function missileFlight(time,distance){
 const trackTime=2.3,flightTime=missileFlightTime(distance),exitSpeed=missileExitSpeed;
 const track=Math.max(0,Math.min(1,(time-3.7)/trackTime));
 const elapsed=Math.max(0,Math.min(flightTime,time-6));
 const acceleration=2*(distance-exitSpeed*flightTime)/(flightTime*flightTime);
 const travelled=exitSpeed*elapsed+acceleration*elapsed*elapsed/2;
 return {trackX:-77+290*track*track,distance:travelled,progress:travelled/distance,
  speed:time<6?exitSpeed*track:exitSpeed+acceleration*elapsed,
  acceleration:time<6?exitSpeed/trackTime:acceleration};
}

export function electronThroughFlight(time,radius,routeSpeed){
 const speed=Math.max(radius*25,routeSpeed);
 return {head:Math.max(0,time)*speed,tail:Math.max(0,time-7)*speed};
}
