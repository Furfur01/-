export const PLATFORM_FALL_SECONDS=3;

// Presentation only. A platform loses lift when its last resident is destroyed.
// Event timestamps also reconstruct the fall after a replay seek or reconnect.
export class FortressPresentation {
 constructor(){this.clear();}
 clear(){this.deaths=new Map();this.seenAlive=new Set();this.time=-Infinity;}
 update(environment,metadata,rows,destroyed,time,events=[]){
  if(time<this.time)this.clear();this.time=time;
  const poses=new Map(),modules=environment.fortress.modules;
  for(const m of modules){
   if(!destroyed.has(m.index)){this.seenAlive.add(m.index);this.deaths.delete(m.index);poses.set(m.index,{falling:false,drop:0,pitch:0,roll:0});continue;}
   if(!this.deaths.has(m.index)){
    const residents=new Set(metadata.filter(unit=>{
     if(!unit.profile.ground)return false;
     if(unit.fortressSlot)return unit.fortressSlot.module===m.index;
     const row=rows[unit.id];if(!row)return false;
     const nearest=modules.reduce((a,b)=>Math.hypot(a.x-row[1],a.z-row[3])<Math.hypot(b.x-row[1],b.z-row[3])?a:b);
     return nearest.index===m.index;
    }).map(unit=>unit.id));
    let death=-Infinity;for(const e of events)if(e.type==='destroy'&&residents.has(e.shipId)&&e.tick*.05<=time)death=Math.max(death,e.tick*.05);
    this.deaths.set(m.index,Number.isFinite(death)?death:this.seenAlive.has(m.index)?time:time-PLATFORM_FALL_SECONDS);
   }
   const age=Math.max(0,time-this.deaths.get(m.index));if(age>=PLATFORM_FALL_SECONDS)continue;
   const t=age/PLATFORM_FALL_SECONDS;
   poses.set(m.index,{falling:true,drop:340*t*t,pitch:.48*t*t,roll:(m.index%2?-1:1)*.65*t*t});
  }
  return poses;
 }
}
