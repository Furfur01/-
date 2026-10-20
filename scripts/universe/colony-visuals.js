// Shared visual dimensions. These never enter economy, queues or collision data.
export const COLONY_ELEVATOR_HEIGHT_RATIO=.65;
export const ORBITAL_VIEW_RADIUS=82;
export const SHIPYARD_VIEW={center:[63,3,1],radius:57};
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};

export function colonyNightStrength(normal,sun){
  const cosine=normal[0]*sun[0]+normal[1]*sun[1]+normal[2]*sun[2];
  return 1-smooth((cosine+.16)/.25);
}

// The orbital terminal can still be sunlit after the city has entered night.
export function orbitalNightStrength(point,sun,radius){
  const along=point[0]*sun[0]+point[1]*sun[1]+point[2]*sun[2];
  if(along>=0)return 0;
  const distance=Math.sqrt(Math.max(0,point[0]**2+point[1]**2+point[2]**2-along**2));
  return 1-smooth((distance-radius*.99)/(radius*.035));
}

export function planetOccludesPoint(eye,point,radius){
  const delta=point.map((v,k)=>v-eye[k]),lengthSq=delta.reduce((s,v)=>s+v*v,0);
  if(lengthSq<1e-12)return false;
  const t=-eye.reduce((s,v,k)=>s+v*delta[k],0)/lengthSq;
  if(t<=0||t>=1)return false;
  return eye.reduce((s,v,k)=>s+(v+delta[k]*t)**2,0)<radius*radius;
}
