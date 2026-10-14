// Project gameplay: broad three-dimensional battle lines with permanent individual stations.
export function formationRole(profile){return profile.role==='line'&&profile.length>=50?'elite':profile.role;}
export function fleetStations(entries,profileFor,batchLane=0){
  const groups=new Map(),result=new Map();
  for(const [id,count]of entries){const profile=profileFor(id),role=formationRole(profile);if(!groups.has(role))groups.set(role,[]);groups.get(role).push({id,count,profile});}
  const main=groups.get('line')||[],mainLength=Math.max(20,...main.map(e=>e.profile.length));
  const mainSpacing=mainLength*4,mainWidth=mainSpacing*3.5;
  const eliteWidth=(groups.get('elite')||[]).reduce((n,e)=>n+e.count,0),eliteLength=Math.max(0,...(groups.get('elite')||[]).map(e=>e.profile.length));
  const coreGap=eliteWidth?Math.min(8,eliteWidth)*eliteLength*2+mainSpacing:0;
  const lane=batchLane?Math.ceil(batchLane/2)*(mainWidth*2+mainSpacing*4)*(batchLane%2?1:-1):0;
  for(const [role,types]of groups){
    const total=types.reduce((n,e)=>n+e.count,0),length=Math.max(...types.map(e=>e.profile.length));
    const spacing=Math.max(role==='fighter'?28:60,length*4),columns=Math.min(role==='fighter'?12:8,total),layers=Math.min(3,Math.ceil(total/columns));
    let ordinal=0;
    for(const {id,count}of types){const slots=[];
      for(let n=0;n<count;n++,ordinal++){
        const column=ordinal%columns,layer=Math.floor(ordinal/columns)%layers,row=Math.floor(ordinal/(columns*layers));
        let y=(layer-(layers-1)/2)*Math.min(200,spacing*1.3),z=(column-(columns-1)/2)*spacing+lane;
        if(role==='line'&&coreGap)z=lane+(ordinal%2?1:-1)*(coreGap+Math.floor(column/2)*spacing);
        // Escorts occupy side wings and upper/lower planes, leaving the central heavy line clear.
        if(role==='fighter'||role==='screen'){
          const wing=ordinal%2?1:-1;z=lane+wing*(coreGap+mainWidth+Math.floor(column/2)*spacing);
          y+=(role==='fighter'?1:-1)*(140+layer*20);
        }
        if(role==='elite'){z=lane+(column-(columns-1)/2)*spacing;y=(layer-(layers-1)/2)*Math.min(200,spacing);}
        const depth=row*spacing*1.2+(role==='elite'?-60:role==='line'?0:role==='artillery'?320:role==='support'?500:180);
        slots.push({role,spacing,depth,y,z});
      }
      result.set(id,slots);
    }
  }
  return result;
}

export function fleetFronts(alive){
  return alive.map((ships,side)=>{
    const principals=ships.filter(s=>s.profile.role==='line'||s.profile.role==='station');
    const line=principals.length?principals:ships,sign=side===0?-1:1;
    return {x:line.reduce((x,s)=>sign<0?Math.max(x,s.x):Math.min(x,s.x),sign<0?-Infinity:Infinity),heavy:principals.length>0};
  });
}

export function formationGoal(s,target,fronts){
  const side=s.side==='attacker'?0:1,sign=side===0?-1:1,p=s.profile,station=s.station;
  const enemy=fronts[1-side],own=fronts[side],escort=p.role==='fighter'||p.role==='screen';
  const gap=Math.abs(enemy.x-own.x);
  // Let the heavy line engage first. Escorts then make straight harassment approaches on the wings.
  const assembling=escort&&own.heavy&&gap>720;
  const standOff=p.role==='fighter'?p.range*.68:p.role==='screen'?p.range*.72:p.role==='artillery'?850:p.role==='support'?1100:p.range*.72;
  const depth=Math.max(0,station.depth-(escort?180:p.role==='artillery'?320:p.role==='support'?500:0));
  // Approach the opponent's elevation in a bounded vertical lane, then hold the line.
  // Main hulls keep their stations; escorts make larger climbing/diving approaches.
  const verticalLimit=escort?Math.min(160,station.spacing*2):Math.min(60,station.spacing*.3);
  const elevation=assembling?station.y:station.y+Math.max(-verticalLimit,Math.min(verticalLimit,(target.y-station.y)*(escort?.7:.3)));
  const lateral=escort&&!assembling?target.z+Math.max(-p.range*.4,Math.min(p.range*.4,station.z-target.z)):station.z;
  return {x:assembling?own.x+sign*(180+depth):enemy.x+sign*(standOff+depth),y:elevation,z:lateral,assembling};
}
