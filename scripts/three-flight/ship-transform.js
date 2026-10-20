// Same camera-frame * model-axis rotation * scale as the authored ship models,
// composed directly instead of allocating/multiplying several matrices per ship.
export function composeShipMatrix({pos,yaw,pitch,roll},scale,out=new Float64Array(16)){
 const cp=Math.cos(pitch),sp=Math.sin(pitch),cy=Math.cos(yaw),sy=Math.sin(yaw),cr=Math.cos(roll),sr=Math.sin(roll),s=cp<0?-scale:scale;
 // The camera axes are already orthonormal. The sign preserves the original
 // world-up convention when a vessel pitches beyond vertical.
 out[0]=-sy*cp*scale;out[1]=-sp*scale;out[2]=cy*cp*scale;out[3]=0;
 out[4]=(cy*sr-sy*sp*cr)*s;out[5]=cp*cr*s;out[6]=(sy*sr+cy*sp*cr)*s;out[7]=0;
 out[8]=-(cy*cr+sy*sp*sr)*s;out[9]=cp*sr*s;out[10]=-(sy*cr-cy*sp*sr)*s;out[11]=0;
 out[12]=pos[0];out[13]=pos[1];out[14]=pos[2];out[15]=1;return out;
}
