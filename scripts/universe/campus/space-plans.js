const road=(points,kind='freight')=>({kind,points});
const rect=(x,y,w,d)=>[[x,y],[x+w,y],[x+w,y+d],[x,y+d]];
function positions(nodes,map){for(const [id,v]of Object.entries(map)){const b=nodes.find(b=>b.id===id);if(!b)throw Error(`Missing campus role ${id}`);[b.x,b.y]=v;if(v[2])b.h=v[2];}}

// Each institution has its own composition, service side and process connections.
// Repeated equipment is deliberate (arrays, tanks); buildings are never scatter-filled.
export function refineSpacePlan(p){
  const id=p.id;if(!SPACE_IDS.includes(id))return;
  p.space=true;p.environment=id==='Gas_Mine'?'atmosphere':id==='Crystal_Mine'?'crystal':id==='Terraformer'?'ecology':'regolith';
  for(const b of p.buildings)b.h=b.role==='support'?3.4:b.role==='equipment'?4.2:4.8;
  for(const f of p.flows)for(const c of f.connections||[])delete c.via;
  p.landscape=[];
  if(id==='Command_Center'){
    positions(p.buildings,{main:[80,66,10],admin1:[46,63,4.6],admin2:[47,85,4.2],admin3:[113,63,4.6],meeting:[111,85,5.2],data:[61,38,5.4],archive:[84,38,4.2],antenna:[102,38,12],supply:[117,38],repair:[129,38],gate:[105,104,3.4]});
    p.roads=[road([[137,48],[35,48],[35,98],[137,98],[137,48]]),road([[80,114],[80,80]],'walk'),road([[80,94],[61,94],[61,67],[55,67]],'walk'),road([[80,94],[100,94],[100,67],[106,67]],'walk')];positions(p.entries,{public:[80,114],supplyGate:[137,48]});
    p.landscape=[{kind:'yard',points:rect(64,80,32,15)}];p.terraces=[['main','admin1','admin2','admin3','meeting']];
  }else if(id==='Crystal_Mine'){
    positions(p.buildings,{extract1:[32,30,6],extract2:[39,48,6],extract3:[46,65,5.5],sort:[66,60,6.2],purify:[98,65,9],lab:[98,36,5.2],sample:[119,36],storage:[96,100,5.5],dispatch:[124,100],repair:[47,99,4.8],supply:[68,99]});
    p.roads=[road([[24,116],[24,82],[79,82],[79,24],[134,24],[134,116],[76,116],[76,82]]),road([[79,82],[134,82]])];positions(p.entries,{raw:[24,116],clean:[134,116]});p.terraces=[['sort','purify','lab','sample'],['repair','supply','storage','dispatch']];
    p.landscape=[{kind:'valley',points:[[23,19],[34,19],[52,67],[43,74],[27,46]]}];
  }else if(id==='Gas_Mine'){
    positions(p.buildings,{collector1:[31,34,7],collector2:[31,51,7],collector3:[31,68,7],separator:[64,49,9],compressor1:[90,40,5],compressor2:[90,57,5],tankA1:[111,39,7],tankA2:[126,39,7],tankB1:[111,61,6],tankB2:[126,61,6],load:[109,90,5.5],meter:[132,90],control:[50,94,5.5],repair:[70,94],parts:[82,94]});
    p.roads=[road([[139,109],[139,76],[20,76],[20,22],[139,22],[139,76]]),road([[101,76],[101,22]]),road([[50,109],[50,102]],'walk')];positions(p.entries,{goods:[139,109],people:[50,109]});
    p.flows.push({kind:'pipe',label:'多点采集汇入净化',ids:['collector1','separator'],connections:[]},{kind:'pipe',label:'南侧采集汇入净化',ids:['collector3','separator'],connections:[]},{kind:'pipe',label:'独立储气支路',ids:['separator','compressor2','tankB1','tankB2','load'],connections:[]},{kind:'pipe',label:'北组罐连接',ids:['tankA1','tankA2'],connections:[]});
  }else if(id==='Solar_Plant'){
    for(const [row,y,shift]of[['A',30,0],['B',51,5],['C',72,-3]])for(let i=1;i<=7;i++)positions(p.buildings,{[`solar${row}${i}`]:[24+(i-1)*15+shift,y,4]});
    positions(p.buildings,{battery:[96,100,7.2],switch:[126,100,5],control:[34,100,4.8],repair:[53,100],parts:[66,100],combiner1:[133,30,3],combiner2:[133,51,3],combiner3:[133,72,3]});
    p.buildings.find(b=>b.id==='combiner2').zone='arrayB';p.buildings.find(b=>b.id==='combiner3').zone='arrayC';
    p.roads=[road([[13,114],[13,40],[138,40],[138,61],[13,61],[13,83],[138,83],[138,114],[13,114]])];positions(p.entries,{gate:[13,114]});
    p.flows.filter(f=>f.kind==='power').forEach((f,i)=>{const y=[30,51,72][i],x=[69,74,66][i];f.connections=[{from:f.ids[0],to:f.ids[1],fromSide:'s',toSide:'s',via:[[x,y+8],[133,y+8]]},{from:f.ids[1],to:'battery',fromSide:'e',toSide:'n',via:[[141,y],[141,87],[96,87]]}];});
    p.terraces=[['battery','switch','control','repair','parts']];
  }else if(id==='Fusion_Reactor'){
    positions(p.buildings,{reactor1:[63,43,10.5],reactor2:[63,76,10.5],cool1:[35,34,6],cool2:[35,53,6],cool3:[35,72,6],convert:[102,48,7],grid1:[102,75,5],grid2:[121,75,5],control:[69,103,5.2],repair:[96,103,4],store:[113,103,4]});
    p.roads=[road([[21,119],[21,22],[134,22],[134,119],[21,119]]),road([[83,22],[83,92],[21,92]])];positions(p.entries,{gate:[21,119]});p.terraces=[['reactor1','reactor2','cool1','cool2','cool3','convert','grid1','grid2']];
    p.flows.push({kind:'power',label:'备用配电支路',ids:['convert','grid2'],connections:[]});
  }else if(id==='Nanite_Factory'){
    positions(p.buildings,{clean:[77,61,8.2],prep:[40,59,5.6],raw:[40,38,4.2],pack:[115,54,5.2],inspect:[115,75,5.5],store:[113,100,5.4],water:[65,30,4.5],gas:[84,30,5],repair:[99,30],change:[63,100,4.4],office:[37,100]});
    p.roads=[road([[22,22],[136,22],[136,118],[88,118],[88,84],[22,84],[22,22]]),road([[63,118],[63,109]],'walk'),road([[63,111],[27,111],[27,89],[77,89],[77,77]],'walk')];positions(p.entries,{material:[22,22],staff:[63,118],out:[136,118]});p.terraces=[['clean','prep','pack','inspect','store','change']];
  }else if(id==='Radar_Facility'){
    positions(p.buildings,{dish:[80,44,16],array1:[44,41,8.5],array2:[116,41,8.5],array3:[109,70,8.5],data:[80,101,6.8],calibration:[124,103,3],control:[128,117],repair:[40,104,4.8],parts:[55,104]});
    p.roads=[road([[24,126],[24,84],[139,84],[139,126]]),road([[57,84],[57,66],[31,66]]),road([[57,66],[80,66],[80,61]]),road([[99,84],[99,58],[130,58]])];positions(p.entries,{gate:[24,126]});p.landscape=[{kind:'test',points:rect(116,93,17,19)}];p.terraces=[['data','repair','parts']];
    const eastData=p.flows.find(f=>f.ids[0]==='array2'&&f.ids.includes('data'));eastData.connections=[{from:'array2',to:'data',fromSide:'e',toSide:'e',via:[[132,41],[132,84],[100,84]]}];
  }else if(id==='Alliance_Depot'){
    positions(p.buildings,{warehouse1:[43,42,7.2],warehouse2:[74,42,5.5],cold:[102,42,6.2],precision:[127,42,5],loading:[112,82,6],control:[43,110,5.5],repair:[77,110,4.8],parts:[98,110],gate:[116,110,4]});
    for(const [row,y]of[['A',77],['B',88]])for(let i=1;i<=4;i++)positions(p.buildings,{[`container${row}${i}`]:[31+(i-1)*13,y,3.6]});
    p.roads=[road([[17,62],[142,62],[142,98],[17,98],[17,62]]),road([[83,62],[83,98]]),road([[17,98],[17,124],[142,124],[142,98]])];positions(p.entries,{in:[17,62],out:[142,98]});p.landscape=[{kind:'yard',points:rect(24,70,54,24)}];p.terraces=[p.buildings.map(b=>b.id)];
  }else if(id==='Shipyard'){
    positions(p.buildings,{base:[80,64,40],cargo:[48,102,6.5],assembly:[117,40,7.2],hangar:[118,91,8],control:[46,35,5.5],parts:[39,58,4],repair:[54,58,4],supply:[41,122,4],cargoControl:[57,122,4]});
    p.roads=[road([[23,134],[23,76],[61,76],[61,20],[143,20],[143,69],[99,69],[99,134],[23,134]]),road([[68,86],[99,86]])];positions(p.entries,{goods:[23,134],partsGate:[143,20]});p.terraces=[['base','cargo','assembly','hangar']];p.landscape=[{kind:'yard',points:rect(102,54,34,20)}];
  }else if(id==='Missile_Silo'){
    positions(p.buildings,{main:[78,64,7.6],vehicle:[42,65,5],test:[42,82,2.8],parts:[45,36,5],tools:[74,36,4.5],dispatch:[73,107,5.8],reserve1:[109,31,3.2],reserve2:[125,31,3.2],reserveControl:[119,49],wash:[116,89,4.8],recycle:[123,107]});
    p.roads=[road([[21,120],[21,50],[98,50],[98,79],[138,79],[138,120],[21,120]]),road([[21,94],[98,94],[98,19],[138,19],[138,79]])];positions(p.entries,{gate:[21,120],secure:[138,19]});p.landscape=[{kind:'buffer',points:rect(101,56,35,17)},{kind:'yard',points:rect(29,76,26,14)}];p.terraces=[['main','vehicle','test','wash','parts','tools']];
  }else if(id==='Terraformer'){
    positions(p.buildings,{control:[81,103,8.5],water1:[37,35,3.2],water2:[43,55,3.2],pump:[37,72,4],climate1:[76,34,10.5],climate2:[76,55,8],climate3:[76,76,6],plot1:[116,32,8],plot2:[115,55,7],plot3:[117,77,6],works:[39,104,5.5],store:[32,121],lab:[47,121]});
    p.roads=[road([[20,133],[20,87],[58,87],[58,20],[138,20],[138,88],[143,88],[143,133],[20,133]]),road([[81,133],[81,118]],'walk')];positions(p.entries,{worksGate:[20,133],public:[81,133]});p.terraces=[['water1','water2','pump'],['control','works','store','lab']];
  }
  // Aprons unite related buildings into readable functional compounds, not isolated plots.
  for(const zone of p.zones){const bs=p.buildings.filter(b=>b.zone===zone.id);if(!bs.length)continue;const x=Math.min(...bs.map(b=>b.x-b.w/2))-1.6,y=Math.min(...bs.map(b=>b.y-b.d/2))-1.6,right=Math.max(...bs.map(b=>b.x+b.w/2))+1.6,bottom=Math.max(...bs.map(b=>b.y+b.d/2))+1.6;p.courts.push([x,y,right-x,bottom-y]);}
}
export const SPACE_IDS=['Command_Center','Crystal_Mine','Gas_Mine','Solar_Plant','Fusion_Reactor','Nanite_Factory','Radar_Facility','Alliance_Depot','Shipyard','Missile_Silo','Terraformer'];
