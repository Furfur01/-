// Colors are art direction; drive identities come from requirements or APK descriptions.
const styles={
  Reaper_Concept:{name:'相位潮汐推进（试装）',color:[.12,1,.63],core:[.8,1,.88],pulse:3},
  Antimatter_Concept:{name:'反物质脉冲推进（试装）',color:[.83,.28,1],core:[1,.85,1],pulse:12},
  Combustion_Drive:{name:'燃烧引擎',color:[1,.34,.055],core:[1,.89,.57],pulse:17},
  Impulse_Drive:{name:'脉冲引擎',color:[.08,.62,1],core:[.65,.94,1],pulse:9},
  Hyperspace_Drive:{name:'超空间引擎',color:[.42,.2,1],core:[.84,.76,1],pulse:4},
  Particle_Collapse:{name:'聚能波粒推进',color:[.58,.16,1],core:[.94,.8,1],pulse:3},
  Jump_Drive:{name:'跃迁引擎',color:[.08,.87,.78],core:[.74,1,.95],pulse:2},
  Titan_Concept:{name:'钛能推进（暂定）',color:[1,.66,.18],core:[1,.96,.77],pulse:6},
  Devourer_Concept:{name:'噬能推进（暂定）',color:[.22,.35,1],core:[.75,.85,1],pulse:5}
};
export function shipPropulsion(ship){
  const special={Interceptor:'Particle_Collapse',Iron_Behemoth:'Jump_Drive',Titanenergetic_Frigate:'Titan_Concept',Devourer_Interceptor:'Devourer_Concept'};
  const drive=({Reaper:'Reaper_Concept',Annihilator:'Antimatter_Concept'})[ship.id]||special[ship.id]||ship.requirements?.find(([id])=>styles[id])?.[0];
  if(!styles[drive])throw Error('Missing propulsion evidence: '+ship.id);
  return {drive,...styles[drive],source:drive.endsWith('_Concept')?'concept':special[ship.id]?'APK description':'ship requirements'};
}

// Model-space nozzle centers/radii; exporter snaps each center onto the actual aft surface.
const pair=(x,y,z,r)=>[[-x,y,z,r],[x,y,z,r]];
export const enginePorts={
  Light_Fighter:[...pair(2.1,-.97,6.6,.21),...pair(3.8,-.22,6.7,.4)],
  Heavy_Fighter:pair(.755,.44375,2.07,.28),
  Cruiser:[...pair(1.9,-.3,5.94,.28),[0,-.28,6.05,.28]],
  Battleship:[...pair(1.09,.08,7.21,.31),[0,-.22,6.87,.18]],
  Bomber:[...pair(1.18,.07,6.01,.27),...pair(.45,-.2,6.07,.19)],
  Dreadnought:[...pair(1.525,.375,4.265,.46),[0,.05,4.065,.4]],
  Destroyer:[...[-1,1].map(s=>[s*3.31*Math.cos(.16)-s*.5*Math.sin(.16),-3.31*Math.sin(.16)-.5*Math.cos(.16),6.34,.3]),[0,1.27,6.91,.23]],
  Interceptor:[...pair(.81,.44,6.64,.34),...pair(.53,-2.03,6.34,.22)],
  Devourer_Interceptor:[...pair(2.85,-.38,6.13,.3),[0,-.14,7.04,.29]],
  Titanenergetic_Frigate:pair(1.2,-.63,4.9,.18),
  Iron_Behemoth:[[0,1.14,6.94,.43]]
};

export function plumeEnvelope(throttle,boost,time,pulse,index=0){
  const power=Math.max(0,Math.min(1,throttle/100));
  const flicker=1+Math.sin(time*pulse+index*1.7)*.045+Math.sin(time*37+index)*.018;
  return {length:(.28+power*18+(boost?12:0))*flicker,width:.8+power*.2+(boost?.12:0),alpha:.24+power*.56+(boost?.18:0)};
}

export function plumeMeshData(){
  const data=[],planes=3,rings=16;
  const vertex=(i,j,side)=>{
    const x=i/rings,a=j/planes*Math.PI,r=Math.pow(1-x,.8);
    return [x,side*r*Math.cos(a),side*r*Math.sin(a),0,-Math.sin(a),Math.cos(a),.3,.7,1,1,0,0,side];
  };
  // Intersecting soft ribbons have continuous opacity, without cone faces or end caps.
  for(let i=0;i<rings;i++)for(let j=0;j<planes;j++){
    const a=vertex(i,j,-1),b=vertex(i,j,1),c=vertex(i+1,j,1),d=vertex(i+1,j,-1);
    data.push(...a,...b,...c,...a,...c,...d);
  }
  return data;
}
