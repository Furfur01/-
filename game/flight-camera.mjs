// Speed-driven lens expansion in degrees. Normal cruise adds 9°, maximum boost
// adds 17°. Using measured speed avoids a FOV jump when boost is just pressed.
export function speedFovOffset(speed,maxSpeed,capital){
  const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
  const ratio=Math.max(0,speed)/Math.max(1,maxSpeed);
  return 9*smooth(ratio)+8*smooth((ratio-1)/(capital?.65:1.2));
}
export function smoothSpeedFov(current,target,dt){
  return current+(target-current)*(1-Math.exp(-Math.max(0,dt)*3.5));
}
