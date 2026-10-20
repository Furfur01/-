import {shipOutlines} from './ship-outlines.js';
import {drawDefenseSchematic as legacy} from './legacy-schematic.js';
export function drawDefenseSchematic(g,cx,cy,size,state,time){
 const type={cruiser:'Cruiser',fighter:'Light_Fighter'}[state.shipType]||state.shipType,layers=shipOutlines[type];if(!layers){legacy(g,cx,cy,size,state,time);return;}
 const hull=state.hull??100,color=hull>60?'#67cae4':hull>30?'#edb46e':'#f56d59';
 g.save();g.translate(cx,cy);g.scale(size,size);g.lineWidth=1.7/size;g.lineJoin='round';
 const path=points=>{g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();};
 for(const [layer,loops]of layers.entries())for(const points of loops){path(points);g.strokeStyle=color;g.globalAlpha=layer?.55:.9;g.stroke();if(!layer){g.fillStyle=color;g.globalAlpha=.10;g.fill();}}
 if(state.shieldMode!=='bubble'){g.scale(1.055,1.055);g.strokeStyle='#75d7ef';g.lineWidth=2.4/size;g.globalAlpha=Math.max(0,(state.shields?.[0]??state.shield??0)/100)*.55;for(const points of layers[0]){path(points);g.stroke();}}
 g.restore();
}
