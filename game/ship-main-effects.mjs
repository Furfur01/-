// Visual dimensions only; ballistics and damage remain in the combat profile.
export function mainGunVisual(kind,length,caliber){
  const capital=length>=10,heavy=kind==='heavy'||kind==='nuclear',elite=length>=50;
  const radius=capital?Math.max(caliber*1.8,length*({heavy:.048,nuclear:.06,plasma:.045,laser:.055,shell:.022,ion:.025,missile:.018}[kind]||.025)):caliber;
  return {capital,elite,radius,beamPixels:elite?7:capital?3:0,beamLife:elite?.95:capital?.8:.3,
    blastRadius:elite?length*.38:capital?length*.22:1.3,
    trail:capital?Math.max(radius*14,length*(heavy?.9:.65)):3,
    glow:capital?(elite?36:kind==='missile'?16:24):3,muzzle:capital?(elite?140:80):22,
    impact:capital?Math.max(45,radius*42):18};
}

export function mainGunGlow(visual,distance,height,fov){
  if(!visual?.capital)return 3;
  const projected=visual.radius*height/(Math.max(1,distance)*Math.tan(fov*.5));
  return Math.max(visual.glow*Math.max(.12,Math.min(1,1400/Math.max(1,distance))),Math.min(110,projected*3.5));
}
