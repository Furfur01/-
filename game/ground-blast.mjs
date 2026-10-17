// Visual timing only: combat damage is resolved by the authoritative projectiles.
export const GROUND_BLAST_LIFETIME=18;
export function groundBlastPhase(age){
 const t=Math.max(0,age),rise=Math.max(0,t-.45),spread=Math.max(0,t-6);
 const fade=Math.max(0,Math.min(1,(GROUND_BLAST_LIFETIME-t)/8));
 return {radius:12+43*(1-Math.exp(-t*.8))+spread*3,
  height:9+119*(1-Math.exp(-rise*.4))+spread*1.4,
  heat:Math.exp(-Math.max(0,t-.2)*1.5),flash:Math.exp(-t*7),
  shockRadius:8+150*(1-Math.exp(-t*1.1)),shockOpacity:Math.max(0,1-t/3.2)**2,
  opacity:Math.min(1,t*12)*fade*fade,spread};
}
