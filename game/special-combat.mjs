// Local trial damage falloff, shared by the practice range and isolated spatial superweapon.
// Spatial combat scales the normalized 180 damage to its frozen trial attack; these are not recovered APK stats.
export function antimatterDamage(distance,radius=680,id=''){
  if(id==='Reaper'||!Number.isFinite(distance)||distance<0||distance>=radius)return 0;
  return 180*Math.pow(1-distance/radius,.65);
}
export function specialRingData(){
  const out=[],n=128;
  const v=(i,r)=>{const a=i/n*Math.PI*2;return [Math.cos(a)*r,0,Math.sin(a)*r,0,1,0,1,1,1,1,0,i/n,(r-.83)/.17];};
  for(let i=0;i<n;i++)out.push(...v(i,.83),...v(i,1),...v(i+1,1),...v(i,.83),...v(i+1,1),...v(i+1,.83));
  return out;
}
export function specialBlastPhase(age){
  return {collapse:Math.max(0,1-age/.38),wave:Math.max(0,Math.min(1,(age-.28)/1.1)),fade:Math.max(0,1-Math.max(0,age-1)/4.2)};
}
