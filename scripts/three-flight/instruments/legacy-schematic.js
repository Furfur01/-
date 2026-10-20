// Purpose-drawn twin-spinal dreadnought schematic. Same sections as the damage simulation.
const outline=[[0,-.67],[.16,-.6],[.19,-.38],[.29,-.28],[.32,.06],[.43,.2],[.43,.63],[.3,.75],[.22,.89],[-.22,.89],[-.3,.75],[-.43,.63],[-.43,.2],[-.32,.06],[-.29,-.28],[-.19,-.38],[-.16,-.6]];
const color=v=>v>60?'#67cae4':v>30?'#edb46e':'#f56d59';
export function drawDefenseSchematic(g,cx,cy,s,state,t){
  g.save();g.translate(cx,cy);g.scale(s,s);g.lineWidth=1.4/s;
  const poly=(points,col,fill=.1)=>{g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.globalAlpha=fill;g.fillStyle=col;g.fill();g.globalAlpha=1;g.strokeStyle=col;g.stroke();};
  g.strokeStyle='#225568';g.setLineDash([3/s,5/s]);g.beginPath();g.moveTo(-.8,0);g.lineTo(.8,0);g.moveTo(0,-1.15);g.lineTo(0,1.1);g.stroke();g.setLineDash([]);
  const sections=state.sections;
  poly(outline,'#5596ad',.08);
  for(const side of [-1,1]){
    const gun=[[.2,-1.02],[.3,-1.02],[.32,-.49],[.29,-.28],[.19,-.38]];poly(gun.map(([x,y])=>[x*side,y]),color(sections[side<0?'laserL':'laserR']),.17);
    for(let j=0;j<5;j++){g.strokeStyle='#498899';g.beginPath();g.moveTo(side*.215,-.92+j*.09);g.lineTo(side*.291,-.92+j*.09);g.stroke();}
    poly([[.2,-.27],[.29,-.16],[.33,.27],[.22,.37]].map(([x,y])=>[x*side,y]),color(sections.bow),.13);
    poly([[.22,.31],[.38,.25],[.38,.59],[.25,.68]].map(([x,y])=>[x*side,y]),color(sections.engines),.15);
    for(const y of [.12,.4,.59]){g.strokeStyle='#9bb8c1';g.beginPath();g.arc(side*.235,y,.025,0,Math.PI*2);g.stroke();}
  }
  poly([[-.14,-.43],[.14,-.43],[.16,.03],[.09,.23],[-.09,.23],[-.16,.03]],color(sections.bridge),.2);
  poly([[-.17,.38],[.17,.38],[.2,.72],[-.2,.72]],color(sections.engines),.14);
  for(const x of [-.16,0,.16]){g.strokeStyle=color(sections.engines);g.lineWidth=3/s;g.beginPath();g.moveTo(x-.045,.84);g.lineTo(x+.045,.84);g.stroke();g.globalAlpha=.3+.15*Math.sin(t*5+x*5);g.fillStyle='#60d9ef';g.fillRect(x-.025,.87,.05,.1);g.globalAlpha=1;}
  if(state.shieldMode!=='bubble'){
    g.save();g.scale(1.12,1.06);g.beginPath();outline.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.strokeStyle='#75d7ef';g.lineWidth=2.7/s;g.globalAlpha=.25+state.shields.reduce((a,b)=>a+b)/400*.6;g.stroke();g.restore();
  }
  g.restore();
}
