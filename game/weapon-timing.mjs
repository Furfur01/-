// Seconds in the approved WAVs: onset of discharge and audible weapon body.
// These are authored cues, not silence trimming or playback-rate changes.
export const weaponCues=Object.freeze({
 Light_Fighter:{attack:.15,body:.23,windup:.15},
 Heavy_Fighter:{attack:.17,body:.48,windup:.22},
 Cruiser:{attack:.18,body:1.45,windup:.5},
 Battleship:{attack:.34,body:1.1,windup:.9},
 Dreadnought:{attack:.17,body:.9,windup:1.1},
 Bomber:{attack:.95,body:1.1,windup:.95},
 Destroyer:{attack:.33,body:1,windup:1.1},
 Interceptor:{attack:.62,body:1.35,windup:1.6},
 Titanenergetic_Frigate:{attack:.16,body:.4,windup:.2},
 Devourer_Interceptor:{attack:.16,body:1.65,windup:1.1},
 Iron_Behemoth:{attack:.3,body:1.8,windup:0},
 Reaper:{attack:.7,body:8.65,windup:2},
 Annihilator:{attack:.4,body:1.5,windup:0},
 Cargo_Ship:{attack:.22,body:.22,windup:.25},
 Large_Cargo_Ship:{attack:.24,body:.22,windup:.3},
 Colony_Ship:{attack:.22,body:.22,windup:.3},
 Recycler:{attack:.22,body:.2,windup:.25},
 Death_Star:{attack:.28,body:7.7,windup:2},
 Guardian:{attack:.6,body:4.9,windup:1.6}
});
export function manualWeaponTiming(type,cooldown){
 const cue=weaponCues[type],windup=cue?.windup||0,reload=Math.max(cooldown,cue?.body||0);
 // A slower, fully voiced manual cycle earns 25% more sustained firepower.
 return {windup,reload,beam:cue?.body||.35,damageScale:1.25*(windup+reload)/cooldown};
}

// Reconstruct only still-active manual cues when seeking a recording.
export function activeManualCues(events,tick){
 const active=new Map();
 for(const e of events){
  if(e.tick>tick)break;
  if(e.type==='weapon-charge')active.set(e.shipId,e);
  if(e.type==='fire'&&!e.secondary){
   if(e.manual&&e.beamDuration)active.set(e.shipId,e);else active.delete(e.shipId);
  }
  if(e.type==='weapon-stop')active.delete(e.shipId);
  if(e.type==='destroy')for(const [id,cue]of active)if(id===e.shipId||cue.target===e.shipId)active.delete(id);
 }
 return [...active.values()].filter(e=>e.tick+(e.windup||e.beamDuration)*20>tick).sort((a,b)=>a.seq-b.seq).map(e=>({...e,resume:true}));
}
