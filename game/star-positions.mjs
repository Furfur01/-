// Preserve ASTRAL's 499 positions, including the original local home anchor.
export function systemCoordinates(){
  let seed=2816;const random=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  const gauss=()=>Math.sqrt(-2*Math.log(random()+1e-7))*Math.cos(Math.PI*2*random());
  return Array.from({length:499},(_,i)=>{const radius=2300+Math.pow(random(),.70)*14300,a=i%4*Math.PI/2+radius/17500*4.25+gauss()*.115;const position=[Math.cos(a)*radius+gauss()*260,gauss()*115,Math.sin(a)*radius+gauss()*260];return {id:i+1,position:i===15?[-6750,40,9260]:position};});
}
