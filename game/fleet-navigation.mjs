// One strategic-flight calculation for the engine, current UI and retained HTML UI.
export function strategicSpeed(unit,technology={}){
 const hyper=unit.drive==='Hyperspace_Drive'||['Battleship','Dreadnought','Destroyer','Death_Star','Guardian'].includes(unit.id)||(unit.id==='Bomber'&&(technology.Hyperspace_Drive||0)>=8);
 const impulse=['Heavy_Fighter','Cruiser','Colony_Ship','Bomber'].includes(unit.id),drive=hyper?'Hyperspace_Drive':impulse?'Impulse_Drive':'Combustion_Drive';
 return unit.speed*(1+(technology[drive]||0)*(hyper?.3:impulse?.2:.1));
}
export function navigationQuote(units,technology,origin,ships,position,speed=100,task=''){
 const entries=Object.entries(ships).filter(([,n])=>n>0);
 if(!entries.length)return {seconds:0,fuel:0,capacity:0};
 const distance=position[0]!==origin[0]?100:position[1]!==origin[1]?Math.min(80,Math.abs(position[1]-origin[1])*.3+12):Math.abs(position[2]-origin[2]);
 const slowest=Math.min(...entries.map(([id])=>strategicSpeed(units[id],technology)));
 const multiplier=task!=='explore'&&(position[0]!==origin[0]||position[1]!==origin[1])?100:1;
 return {
  seconds:Math.max(20,Math.ceil((22+distance*2.5)*Math.sqrt(10000/Math.max(100,slowest))*100/speed))*multiplier,
  fuel:Math.max(1,Math.ceil(entries.reduce((n,[id,count])=>n+units[id].fuel*count,0)*.08*(1+distance/30)*(speed/100)**2))*multiplier,
  capacity:entries.reduce((n,[id,count])=>n+units[id].cargo*count,0)
 };
}
