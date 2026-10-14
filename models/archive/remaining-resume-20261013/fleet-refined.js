import {createSculptedShip,sculptedIds} from './fleet-sculpted.js';
import {createThreeViewShip} from './ships-three-view.js';
import {createRebuiltCombat,rebuiltCombatIds} from './fleet-rebuild-combat.js';
import * as THREE from 'three';
import {createShipKit} from './ship-detail-kit.js';
import {createBattleshipSample} from './battleship-sample.js';

export const refinedIds=['Light_Fighter','Battleship','Bomber','Destroyer','Cargo_Ship','Large_Cargo_Ship','Colony_Ship','Recycler','Probe','Solar_Satellite','Interceptor','Iron_Behemoth','Devourer_Interceptor','Titanenergetic_Frigate','Annihilator','Reaper','Death_Star','Guardian'];

export function createRefinedShip(id){
  if(rebuiltCombatIds.includes(id))return createRebuiltCombat(id);
  if(['Destroyer','Iron_Behemoth'].includes(id))return createThreeViewShip(id);
  if(sculptedIds.includes(id))return createSculptedShip(id);
  if(!refinedIds.includes(id))throw Error('未知精修舰船: '+id);
  if(id==='Battleship')return createBattleshipSample();
  const dark=['Destroyer','Interceptor','Iron_Behemoth'].includes(id);
  const {root,section,add,plate,block,loft,cyl,ring,pipe,mirror,turret,engine,finish}=createShipKit(id,{panel:0x164879,gold:0x957c4c,...(dark?{armor:0x4d6071,light:0x788c9c,side:0x303f4d}:{})});
  root.userData={modelId:id,revision:'fleet-refinement-01',qualityReference:'Cruiser concept-sample-01',silhouetteVerified:false,reference:['Death_Star','Guardian'].includes(id)?'legacy concept; no APK sprite':'APK sprite and imagegen concept'};
  function profile(rows,z){let i=0;while(i<rows.length-2&&rows[i+1][0]<z)i++;const a=rows[i],b=rows[i+1],f=(z-a[0])/(b[0]-a[0]);return {w:a[1]+(b[1]-a[1])*f,b:a[2]+(b[2]-a[2])*f,t:a[3]+(b[3]-a[3])*f};}
  function armored(rows,cx=0,mat='armor',count=9){
    loft(rows,'dark',cx);const start=rows[0][0],end=rows.at(-1)[0],step=(end-start)/count;
    for(let i=0;i<count;i++){
      const a=start+i*step+.04,b=start+(i+1)*step-.04,pa=profile(rows,a),pb=profile(rows,b);
      for(const s of[-1,1]){
        const tile=plate([[cx+s*.035,a],[cx+s*pa.w*.96,a],[cx+s*pb.w*.96,b],[cx+s*.035,b]],0,.07,i%4===0?'light':mat,.018);
        const p=tile.geometry.attributes.position;for(let v=0;v<p.count;v++)p.setY(v,p.getY(v)+profile(rows,p.getZ(v)).t);tile.geometry.computeVertexNormals();
        const z=(a+b)/2,pz=profile(rows,z),x=cx+s*pz.w;
        if(pz.w>.3){block(.065,.14,Math.min(step*.63,.62),x,(pz.t+pz.b)*.5,z,'side',.016);block(.015,.055,Math.min(step*.38,.3),x+s*.046,pz.t-.18,z,'glass',.002);}
      }
      if(i%2===0){const z=(a+b)/2,p=profile(rows,z);block(p.w*1.22,.065,step*.66,cx,p.b-.04,z,'side',.018);}
    }
  }
  function vent(x,y,z,w=.6,l=1,n=8){block(w,.05,l,x,y,z,'black',.012);for(let i=0;i<n;i++)block(w*.89,.035,l/(n*2),x,y+.044,z-l*.43+i*l*.86/(n-1),'steel',.006);}
  function missiles(x,y,z,w=.55,l=1.1){block(w,.075,l,x,y,z,'black',.022);for(const s of[-1,1])block(.06,.09,l,x+s*w*.51,y+.055,z,'edge',.012);for(let j=0;j<4;j++)for(const s of[-1,1]){block(w*.32,.07,l*.18,x+s*w*.22,y+.05,z-l*.36+j*l*.24,'steel',.015);cyl(w*.065,.025,x+s*w*.22,y+.097,z-l*.36+j*l*.24,'red','y',w*.06,12);}}
  function bridge(x,y,z,s=1){
    const g=section('Bridge',()=>{
      loft([[-.85,.5,0,.12],[-.4,.77,0,.52],[.8,.69,0,.6],[1.05,.48,.1,.43]],'side');
      loft([[-.6,.46,.25,.39],[-.25,.68,.4,.65],[.77,.67,.41,.65]],'light');
      block(1.05,.1,.04,0,.5,-.49,'black',.01);for(let j=-2;j<=2;j++)block(.12,.045,.015,j*.19,.5,-.52,'glass',.003);
      loft([[-.05,.39,.64,.76],[.38,.45,.64,1.03],[.87,.38,.64,.97]],'armor');
      block(.7,.08,.09,0,.91,.18,'black',.01);for(const a of[-1,0,1])block(.12,.042,.016,a*.2,.915,.13,'glass',.003);
      vent(0,1.035,.57,.51,.37,5);cyl(.047,.25,.19,1.13,.72,'steel');cyl(.013,.34,.19,1.4,.72,'edge');
      for(const a of[-1,1]){block(.03,.07,.65,a*.697,.53,.25,'black',.006);for(let i=0;i<4;i++)block(.013,.036,.08,a*.72,.55,i*.15,'glass',.003);}
    });g.position.set(x,y,z);g.scale.setScalar(s);return g;
  }
  function fin(points,x,t=.13,mat='armor'){
    if(id==='Reaper')points=points.map(([z,y])=>[z,y>1?1+(y-1)*.67:y]);
    const shape=new THREE.Shape();points.forEach(([z,y],i)=>i?shape.lineTo(-z,y):shape.moveTo(-z,y));shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth:t,steps:1,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:1});g.rotateY(Math.PI/2);return add(g,mat,[x-t/2,0,0]);
  }
  function service(x,y,z,n=7,step=.6){for(let i=0;i<n;i++){block(.14,.31,.36,x,y,z+i*step,'edge',.025);block(.045,.17,.24,x+Math.sign(x)*.1,y,z+i*step,'black',.012);block(.024,.05,.12,x+Math.sign(x)*.13,y+.05,z+i*step,i%3===0?'red':'steel',.003);}}
  function nosePort(x,y,z,w,h){block(w,h,.07,x,y,z,'edge',.028);block(w*.79,h*.64,.08,x,y,z-.047,'black',.015);block(w*.59,.037,.016,x,y-h*.2,z-.098,'glass',.004);}

  if(id==='Light_Fighter'){
    section('01_Needle_fuselage',()=>{
      armored([[-6.7,.14,-.24,-.07],[-5.8,.34,-.3,.17],[-2.9,.58,-.3,.35],[-1,.77,-.34,.5],[1.7,.82,-.31,.6],[3.2,.47,-.23,.38]],0,'armor',11);
      loft([[-5.8,.07,.17,.24],[-2.1,.14,.4,.49]],'red');
      loft([[-1.9,.3,.37,.47],[-.9,.49,.43,.9],[.5,.47,.48,.98],[1.1,.31,.5,.7]],'black');
      loft([[-1.6,.26,.43,.5],[-.88,.42,.59,.85],[.28,.39,.64,.9]],'edge');
      pipe([-.34,.51,-1.5],[-.42,.91,-.54],.04,'light');pipe([.34,.51,-1.5],[.42,.91,-.54],.04,'light');
      nosePort(0,-.02,-6.72,.25,.19);vent(0,.65,1.7,.65,1.15,10);
    });
    section('02_Swept_wings_and_fins',()=>{for(const s of[-1,1]){
      plate(mirror([[.62,-.4],[1.05,-.28],[2.83,1.48],[3.22,2.78],[1.63,3.31],[.57,2.12]],s),-.16,.2,'side',.04);
      plate(mirror([[.75,.03],[1.09,.12],[2.65,1.61],[2.94,2.57],[1.65,2.93],[.79,1.93]],s),.08,.09,'armor',.03);
      plate(mirror([[1.58,1.64],[2.57,2.14],[2.71,2.54],[1.68,2.83],[1.42,2.35]],s),.205,.06,'edge',.015);
      fin([[1,.17],[1.67,1.79],[2.39,2.08],[2.86,1.91],[2.65,.26]],s*1.86,.14,'dark');
      fin([[1.38,.49],[1.89,1.66],[2.32,1.83],[2.6,1.7],[2.44,.62]],s*1.86,.16,'armor');
      block(.15,.12,.37,s*1.87,.91,2.34,'red',.02);vent(s*2.1,.21,2.24,.39,.64,6);
      pipe([s*.88,-.04,-1.45],[s*2.41,-.08,1.03],.06,'steel');
    }});
    section('03_Weapons_and_engines',()=>{for(const s of[-1,1]){
      armored([[.42,.33,-.36,.31],[1.31,.43,-.46,.56],[3.37,.35,-.42,.39]],s*.98,'armor',5);engine(s*.98,-.01,3.77,.35);
      missiles(s*1.55,.06,.33,.38,.8);cyl(.052,1.41,s*.82,-.11,-2.45,'steel','z');ring(.052,.013,s*.82,-.11,-3.18,'edge');
      cyl(.09,.13,s*.82,-.11,-2.89,'side','z');cyl(.038,.013,s*.82,-.11,-3.17,'black','z');
    }});
  }else if(id==='Battleship'){
    section('01_Broad_three_lane_bow',()=>{
      armored([[-7.5,2.25,-.52,.13],[-6.5,2.47,-.6,.45],[-3.2,2.07,-.66,.53],[-1.8,1.21,-.61,.56],[4.5,1.28,-.56,.65],[6.4,.95,-.32,.49]],0,'side',11);
      for(const s of[-1,0,1]){
        armored([[-7.7,.54,-.38,.12],[-6.87,.7,-.26,.57],[-3.75,.65,-.19,.67],[-2.57,.43,-.18,.43]],s*1.46,'light',5);
        nosePort(s*1.46,-.03,-7.73,1.02,.35);vent(s*1.46,.71,-4.13,.79,.48,5);
      }
    });
    section('02_Spine_and_midbody',()=>{
      armored([[-4.5,.4,.48,.67],[-2.8,.63,.54,1.01],[2.5,.71,.54,1.19],[5.35,.66,.51,1.05]],0,'armor',8);
      for(const s of[-1,1]){
        for(let i=0;i<4;i++)armored([[-1.79+i*1.63,.53,-.4,.3],[-1.38+i*1.63,.71,-.4,.7],[-.33+i*1.63,.58,-.36,.65]],s*1.41,'armor',2);
        service(s*2.04,-.04,-.7,7,.82);vent(s*1.34,.78,2.4,.74,1.05,9);
        plate(mirror([[1.2,3.6],[2.46,4.51],[2.38,5.37],[1.12,5.58]],s),.42,.12,'light',.03);
      }bridge(0,1.16,2.88,.9);
    });
    section('03_Gun_decks',()=>{for(const s of[-1,1]){turret(s*1.3,.81,-2.24,.95);turret(s*1.53,.72,1.4,.63);missiles(s*1.2,.8,-.49,.61,1.1);}});
    section('04_Reactor_and_thrusters',()=>{for(const s of[-1,1]){armored([[3.84,.5,-.49,.62],[5.13,.57,-.43,.89],[6.67,.46,-.29,.65]],s*1.06,'armor',4);engine(s*1.06,.06,7.07,.49);vent(s*1.1,.96,5.33,.58,1.1,9);}engine(0,-.25,6.81,.32);});
  }else if(id==='Bomber'){
    section('01_Layered_spear_bow',()=>{
      armored([[-8.1,.13,-.43,-.19],[-6.8,.7,-.55,.03],[-3.9,1.39,-.6,.27],[-1.2,1.08,-.47,.58],[3.95,1.45,-.42,.9],[6.26,.79,-.26,.65]],0,'side',12);
      armored([[-7.62,.19,-.08,.02],[-5.5,.68,-.03,.47],[-3.7,1.09,.02,.7],[-2.37,.84,.14,.64]],0,'armor',6);
      armored([[-4.97,.35,.39,.57],[-3.41,.72,.4,1.12],[-1.99,.67,.39,1.17],[-1.3,.47,.31,.73]],0,'light',4);
      loft([[-4.36,.24,.7,.78],[-3.36,.49,.83,1.14],[-2.38,.42,.88,1.13]],'edge');
      block(.58,.08,.05,0,.84,-4.03,'glass',.009);
    });
    section('02_Swept_bomb_wings',()=>{for(const s of[-1,1]){
      plate(mirror([[.93,-1.7],[1.48,-1.18],[3.97,2.26],[4.11,3.51],[3.36,3.22],[1.11,.23]],s),-.17,.24,'side',.06);
      plate(mirror([[1.13,-1.39],[1.45,-.94],[3.79,2.35],[3.88,3.08],[3.51,2.91],[1.24,.08]],s),.115,.1,'armor',.025);
      for(let i=0;i<6;i++)pipe([s*(1.52+i*.3),.25,-.17+i*.45],[s*(1.95+i*.3),.25,.35+i*.45],.024,'edge');
      for(let i=0;i<4;i++){const x=s*(1.19+i*.47),z=-.67+i*.65;cyl(.105,.83,x,-.27,z,'side','z');cyl(.08,.2,x,-.27,z-.5,'red','z',.03);ring(.1,.019,x,-.27,z+.33,'steel');}
    }});
    section('03_Aft_machinery',()=>{
      armored([[-1.6,.53,.52,.93],[.6,.83,.56,1.22],[4.6,.72,.47,1.15],[5.46,.55,.49,.92]],0,'armor',7);bridge(0,1.18,1.64,.83);
      for(const s of[-1,1]){armored([[-.2,.45,-.3,.36],[.71,.63,-.42,.78],[5.44,.48,-.33,.83]],s*1.37,'armor',7);engine(s*1.31,.1,6.07,.51);engine(s*.52,-.26,6.45,.3);service(s*1.99,.09,.9,6,.68);vent(s*1.39,.91,3.65,.62,1.29,9);turret(s*1.14,.83,.54,.63);missiles(s*.86,.94,3.41,.43,.82);}
    });
  }else if(id==='Destroyer'){
    section('01_Heavy_rectangular_bow',()=>{
      armored([[-7,1.58,-.88,.56],[-6.34,1.76,-.94,.8],[2.61,1.65,-.78,.9],[4.8,1.31,-.67,.72],[6.26,.92,-.39,.54]],0,'armor',12);
      for(const s of[-1,1]){armored([[-7.08,.57,-.56,.48],[-6.45,.64,-.44,.93],[1.76,.57,-.39,.98]],s*.83,'armor',10);nosePort(s*.84,-.02,-7.16,1.03,.72);service(s*1.81,-.05,-5.5,12,.72);pipe([s*1.52,-.5,-5.9],[s*1.58,-.5,2.75],.055,'steel');}
      armored([[-5.3,.22,.82,.97],[-3.1,.38,.86,1.26],[2.98,.5,.78,1.49]],0,'side',8);block(.16,.045,2.72,0,1.04,-3.4,'red',.01);
    });
    section('02_Armored_aft_crossbar',()=>{for(const s of[-1,1]){
      plate(mirror([[1.25,2.22],[2.77,2.43],[4.59,4.39],[4.53,5.63],[3.96,5.52],[2.55,4.25],[1.18,4.05]],s),-.42,.55,'dark',.07);
      plate(mirror([[1.52,2.6],[2.62,2.77],[4.31,4.51],[4.23,5.13],[3.94,5.08],[2.6,3.84],[1.4,3.69]],s),.2,.18,'armor',.05);
      fin([[4,.28],[4.54,1.21],[5.59,1.32],[5.76,.21]],s*4.36,.2,'edge');vent(s*3.64,.45,4.49,.51,.66,7);
      armored([[2.6,.49,-.61,.58],[3.5,.58,-.66,.85],[6.28,.44,-.42,.62]],s*1.61,'armor',5);engine(s*1.55,-.01,6.8,.5);engine(s*3.98,.02,5.95,.32);
    }});
    section('03_Command_and_armaments',()=>{bridge(0,1.36,2.11,1.11);for(const s of[-1,1]){turret(s*.83,1.08,-2.86,1.04);turret(s*1.23,1.03,.8,.64);missiles(s*.83,1.07,-.52,.59,1.49);vent(s*.91,1.03,-4.91,.5,1,8);vent(s*1.6,.97,4.38,.65,1.32,10);}});
  }else if(id==='Cargo_Ship'||id==='Large_Cargo_Ship'){
    const big=id==='Large_Cargo_Ship',front=big?-6.3:-5.15,back=big?6:4.7,w=big?1.9:1.58,height=big?1.49:1.3,len=back-front;
    section('01_Open_cargo_bay',()=>{
      armored([[front,w+.17,-.84,-.65],[front+1,w+.29,-.91,-.58],[back,w+.11,-.74,-.45]],0,'side',10);
      block(w*1.77,.075,len-.6,0,-.51,(back+front)*.5,'black',.02);
      for(const s of[-1,1]){block(.07,.08,len-.48,s*.65,-.42,(back+front)*.5,'red',.01);block(.15,.15,len-.4,s*w*.8,-.34,(back+front)*.5,'edge',.025);}
      for(let i=0;i<13;i++)block(w*1.6,.07,.075,0,-.44,front+.25+i*len*.073,'steel',.012);
      block(w*1.86,height+1,.25,0,.25,back-.3,'dark',.04);
      for(let i=0;i<5;i++)block(w*1.59,.08,.18,0,-.3+i*.28,back-.48,'red',.018);
    });
    section('02_Cargo_enclosure_and_ribs',()=>{for(const s of[-1,1]){
      armored([[front,.18,-.57,height-.15],[front+1.5,.49,-.61,height+.12],[back-.5,.39,-.47,height],[back,.3,-.37,height-.19]],s*w,'light',10);
      for(let i=0;i<9;i++){const z=front+.54+i*(len-.95)/8;block(.14,height+1,.13,s*(w-.39),.34,z,'red',.025);block(.16,.63,.23,s*(w+.39),-.12,z,'edge',.025);}
      loft([[front,.1,height-.16,height+.02],[front+1.5,.13,height+.07,height+.28],[back-.18,.12,height+.04,height+.25]],'light',s*(w-.35));
      for(let i=0;i<5;i++)vent(s*(w+.065),height+.23,front+1.75+i*(len-2.2)/5,.43,.63,6);
      service(s*(w+.51),.27,front+1.53,7,(len-2.3)/7);
      for(let i=0;i<5;i++){
        const z=front+.43+i*(len-1.12)/5,span=(len-1.35)/5;
        fin([[z,-.45],[z+.3,height-.21],[z+span*.89,height-.16],[z+span,.31],[z+span-.14,-.4]],s*(w+.4),.1,i%2?'armor':'light');
        for(let k=0;k<4;k++)pipe([s*(w+.475),.25,z+.34+k*span*.12],[s*(w+.475),height-.39,z+.43+k*span*.12],.02,'edge');
        block(.1,.24,.38,s*(w+.52),-.14,z+span*.47,'side',.025);
      }
    }});
    section('03_Aft_cargo_modules',()=>{
      block(w*1.89,.22,1.26,0,height+.09,back-1.14,'armor',.06);bridge(0,height+.2,back-1.13,.63);
      for(const s of[-1,1]){
        for(let i=0;i<(big?3:2);i++){const z=(big?-.6:.25)+i*1.55;armored([[z,.52,-.83,-.15],[z+.96,.56,-.8,.18],[z+1.39,.39,-.61,.03]],s*(w+.78),'armor',3);block(.065,.25,.48,s*(w+1.36),-.25,z+.65,'red',.02);}
        plate(mirror([[w-.1,back-2.49],[w+1.79,back-.71],[w+1.6,back+.03],[w+.08,back-1.07]],s),-.45,.16,'side',.04);
        engine(s*w,.25,back+.43,.54);engine(s*.67,-.61,back+.2,.24);
        if(big)plate(mirror([[w+.58,1],[w+2.2,3.46],[w+1.98,3.91],[w+.27,2.48]],s),-.61,.12,'edge',.035);
      }
      turret(0,height+.43,back-2.54,.38);
    });
  }else if(id==='Colony_Ship'){
    section('01_Twin_colonization_hulls',()=>{for(const s of[-1,1]){
      armored([[-6.3,.7,-.71,.67],[-5.74,.76,-.68,.9],[4.27,.77,-.54,.96],[5.55,.52,-.34,.6]],s*1.34,'armor',12);
      nosePort(s*1.34,-.02,-6.36,1.17,1.02);block(.87,.085,.1,s*1.34,-.51,-6.43,'red',.02);
      loft([[-5.7,.055,.94,1.0],[3.8,.055,1.03,1.1]],'red',s*1.35);service(s*2.15,.08,-4.8,10,.85);
      block(.08,.08,9.2,s*.78,.48,-.77,'edge',.018);
      for(let i=0;i<10;i++)block(.22,.17,.1,s*.75,.1,-4.95+i*.8,'steel',.02);
    }});
    section('02_Stern_habitat_and_side_pods',()=>{
      armored([[1.4,1.87,-.53,.6],[2.61,2.21,-.45,1.29],[4.77,1.8,-.31,1.33],[5.35,1.37,-.22,.98]],0,'side',5);
      for(const s of[-1,1]){
        armored([[1.79,.49,.67,1.17],[2.41,.66,.76,1.73],[4.27,.67,.69,1.61]],s*.99,'light',4);vent(s*.99,1.79,2.96,.85,.91,8);
        armored([[-2.41,.43,-.54,.26],[-1.19,.64,-.52,.62],[1.14,.62,-.41,.6]],s*2.69,'armor',5);
        plate(mirror([[1.61,-4.12],[2.12,-3.87],[3.71,-1.9],[3.63,-1.19],[2.89,-1.54],[1.7,-3.12]],s),-.55,.18,'edge',.04);
        plate(mirror([[1.71,3.21],[3.55,4.42],[3.77,5.24],[3.26,5.19],[1.48,4.32]],s),-.2,.15,'armor',.03);
        engine(s*1.3,.14,5.94,.52);engine(s*2.14,.3,4.88,.34);
      }bridge(0,1.19,3.66,.69);
    });
    section('03_Colony_equipment',()=>{for(const s of[-1,1]){for(let i=0;i<4;i++){block(.27,.22,.55,s*2.13,-.61,-2.4+i*1.4,'side',.035);pipe([s*1.62,-.7,-2.6+i*1.4],[s*2.04,-.62,-2.2+i*1.4],.05,'steel');}turret(s*1.34,1.1,.1,.42);}});
  }else if(id==='Recycler'){
    section('01_Heavy_salvage_bow',()=>{
      armored([[-6.14,1.13,-.51,.3],[-5.17,1.46,-.65,.76],[-2.1,1.63,-.58,.95],[.79,1.41,-.52,1.08],[4.13,1.37,-.32,.94]],0,'light',10);
      loft([[-5.35,.68,-.73,-.34],[-3.7,1.35,-.82,-.34],[1.7,1.5,-.65,-.3]],'red');
      block(1.6,.16,.39,0,.45,-5.34,'edge',.045);nosePort(0,.16,-6.21,1.65,.53);
      for(const s of[-1,1]){armored([[-6.76,.13,-.8,-.57],[-5.01,.31,-.68,-.31],[-3.7,.28,-.57,-.25]],s*.86,'steel',4);block(.46,.08,.34,s*.86,-.55,-6.59,'red',.02);service(s*1.7,.2,-3.47,7,.67);}
    });
    section('02_Processing_drums',()=>{for(const s of[-1,1]){
      cyl(.64,3.7,s*1.44,.7,.81,'dark','z');for(let i=0;i<10;i++)ring(.65,.054,s*1.44,.7,-.92+i*.36,'edge');
      for(let i=0;i<5;i++){const a=i*Math.PI*.25;pipe([s*1.44+Math.cos(a)*.58,.7+Math.sin(a)*.58,-.86],[s*1.44+Math.cos(a)*.58,.7+Math.sin(a)*.58,2.43],.045,'steel');}
      block(.45,.39,1.15,s*1.72,.6,-1.47,'red',.06);vent(s*.72,1.25,.33,.66,2.42,15);
    }});
    section('03_Utility_stern',()=>{
      armored([[2.3,1.18,.14,1.27],[3.07,1.35,.08,1.53],[5.4,1.21,-.15,1.42]],0,'armor',5);bridge(0,1.51,3.55,.69);
      for(const s of[-1,1]){
        plate(mirror([[1.1,1.47],[2.71,1.49],[3.2,2.56],[2.74,4.63],[1.4,4.13]],s),-.31,.28,'dark',.06);
        plate(mirror([[1.6,1.88],[2.51,1.91],[2.83,2.77],[2.49,4.15],[1.59,3.88]],s),.02,.13,'armor',.035);
        vent(s*2.14,.21,2.88,.79,1.41,10);engine(s*1.27,.17,5.74,.53);
        cyl(.055,1.68,s*.65,2.1,2.79,'steel');cyl(.02,.78,s*.65,3.15,2.79,'edge');
        pipe([s*1.33,-.5,3.3],[s*2.28,-.41,4.03],.1,'edge');
      }
    });
  }else if(id==='Probe'){
    root.userData.radialBranches={count:3,spacingDegrees:120,axis:'Z'};root.userData.unarmed=true;
    section('01_Central_sensor_spindle',()=>{
      cyl(.59,2.13,0,0,.15,'side','z',.51,32);cyl(.41,2.36,0,0,-1.94,'glass','z',.17,32);
      cyl(.15,2.19,0,0,-3.98,'core','z',.012,20);cyl(.32,1.9,0,0,2.2,'armor','z',.16,24);cyl(.095,1.3,0,0,3.56,'steel','z',.005,16);
      for(const z of[-.75,-.45,0,.6,1.04]){ring(z<0?.6:.55,.053,0,0,z,'steel');ring(.58,.015,0,0,z+.08,'red');}
      for(let i=0;i<12;i++){const a=i*Math.PI/6;pipe([Math.cos(a)*.52,Math.sin(a)*.52,.16],[Math.cos(a)*.43,Math.sin(a)*.43,1.52],.026,'steel');}
      cyl(.23,.29,0,0,1.25,'black','z');ring(.22,.032,0,0,1.41,'edge');
    });
    for(let n=0;n<3;n++){
      const g=section('02_Radial_sensor_branch_'+(n+1),()=>{
        pipe([.4,0,.02],[1.13,0,.53],.11,'side');pipe([1.13,0,.53],[2.1,0,.4],.09,'steel');
        for(const x of[.6,1.13,1.84]){cyl(.16,.13,x,0,x===1.13?.53:.25,'edge','y');ring(.11,.025,x,.09,x===1.13?.53:.25,'steel','y');}
        armored([[-1.41,.14,-.19,.14],[-.64,.33,-.32,.36],[.64,.34,-.3,.39],[1.24,.17,-.17,.2]],2.17,'light',5);
        cyl(.072,5.89,2.17,0,-.24,'steel','z',.037,16);cyl(.02,1.54,2.17,0,-3.37,'glass','z',.009,12);
        cyl(.04,1.2,2.17,0,3.21,'edge','z',.004,12);
        cyl(.18,.105,2.17,.35,.11,'black');ring(.17,.038,2.17,.42,.11,'steel','y');cyl(.105,.018,2.17,.429,.11,'glass');
        loft([[-4.72,.04,-.09,.06],[-2.39,.18,-.16,.21],[-1.11,.16,-.19,.25]],'light',.67);
        pipe([.55,0,-.57],[.74,0,-2.06],.06,'edge');
        loft([[1.12,.11,-.1,.13],[2.37,.07,-.05,.08],[2.96,.01,-.01,.02]],'glass',.5);
        vent(2.17,.415,.64,.33,.47,5);
      });g.rotation.z=n*2*Math.PI/3;g.userData.radialAngleDegrees=n*120;
    }
  }else if(id==='Solar_Satellite'){
    root.userData.unarmed=true;root.userData.solarPanels={wings:2,rows:3,columns:3};
    section('01_Satellite_bus',()=>{
      for(const[y,r,h]of[[-1.33,.58,.62],[-.62,.47,.63],[0,.34,.52],[.67,.42,.65],[1.34,.59,.71]]){
        cyl(r,h,0,y,0,'side');cyl(r*1.03,.08,0,y+h*.48,0,'light');cyl(r*1.03,.06,0,y-h*.46,0,'edge');
        for(let i=0;i<12;i++){const a=i*Math.PI/6;pipe([Math.sin(a)*r,y-h*.36,Math.cos(a)*r],[Math.sin(a)*r,y+h*.36,Math.cos(a)*r],.026,'steel');}
        ring(r*.99,.02,0,y,0,'gold','y');
      }
      for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a)*.6,z=Math.sin(a)*.6;const m=block(.17,.14,.05,x,1.3,z,'black',.014);m.rotation.y=-a+Math.PI/2;}
      cyl(.3,.08,0,1.76,0,'dark');ring(.24,.025,0,1.805,0,'steel','y');cyl(.095,.28,0,1.93,0,'edge');
      for(const s of[-1,1]){cyl(.18,.47,s*.49,0,0,'steel','x');cyl(.09,.18,s*.8,0,0,'gold','x');pipe([s*.48,.23,0],[s*.9,.12,.04],.026,'gold');}
    });
    for(const s of[-1,1])section((s<0?'02_Port':'03_Starboard')+'_solar_array',()=>{
      block(3.65,.095,.12,s*2.51,0,0,'steel',.016);
      for(let c=0;c<3;c++)for(let r=0;r<3;r++){
        const x=s*(1.28+c*1.13),y=(r-1)*1.25;
        block(1.04,1.17,.11,x,y,0,'edge',.022);block(.96,1.09,.024,x,y,-.075,'panel',.007);block(.96,1.09,.021,x,y,.069,'panel',.005);
        for(let i=1;i<6;i++)for(const z of[-.092,.085])block(.009,1.07,.008,x-.48+i*.16,y,z,'steel',.001);
        for(let i=1;i<8;i++)for(const z of[-.092,.085])block(.95,.009,.008,x,y-.535+i*.134,z,'steel',.001);
        for(const dx of[-.52,.52])for(const dy of[-.5,.5])cyl(.03,.032,x+dx,y+dy,-.088,'gold','z',.03,8);
      }
      for(const y of[-.65,.65])pipe([s*.79,y*.22,.09],[s*3.99,y,.09],.023,'gold');
    });
  }else if(id==='Interceptor'){
    section('01_Upper_armored_spear',()=>{
      armored([[-8.4,.28,.95,1.27],[-6.2,1.11,.64,1.71],[-2.8,1.53,.58,1.85],[4.9,1.54,.47,1.99],[6.15,1.05,.69,1.69]],0,'armor',12);
      for(const s of[-1,1]){service(s*1.6,.84,-2.31,10,.74);pipe([s*.74,.58,-5.1],[s*1.25,.61,2.8],.075,'steel');}
      for(let i=0;i<3;i++){vent(0,1.94,-1.57+i*1.41,.97,.67,7);}
    });
    section('02_Lower_open_keel',()=>{
      armored([[-7.1,.36,-2.31,-2.02],[-5.57,.71,-2.25,-1.66],[-.16,.87,-2.34,-1.71],[4.93,1.2,-2.36,-1.26],[6.15,.83,-2.04,-1.39]],0,'side',11);
      for(const s of[-1,1]){
        for(let i=0;i<10;i++){const z=-5.44+i*.89;block(.25,.29,.37,s*.62,-1.57,z,'edge',.032);pipe([s*.63,-1.59,z],[s*.8,-1.99,z+.22],.033,'steel');}
        for(let i=0;i<6;i++)turret(s*.59,-1.66,-4.84+i*1.46,.39);
      }
    });
    section('03_Joined_stern_and_reactors',()=>{
      armored([[2.88,1.24,-2.02,1.72],[4.56,1.57,-2.07,1.88],[6.16,1.12,-1.76,1.61]],0,'armor',5);
      for(const s of[-1,1]){
        for(const y of[-1.57,-.09,1.4]){engine(s*.71,y,6.65,.54);block(.34,.55,.81,s*1.45,y,4.58,'armor',.055);block(.08,.28,.18,s*1.65,y+.06,4.54,'red',.017);}
        for(let i=0;i<6;i++){
          const z=-2.66+i*.96;block(.66,.38,.6,s*1.08,.24,z,'side',.05);cyl(.083,.7,s*1.23,.12,z-.47,'steel','z');ring(.085,.02,s*1.23,.12,z-.83,'edge');
          block(.2,.3,.4,s*1.56,.43,z,'armor',.034);
        }
      }
    });
    section('04_Heavy_turrets_and_missiles',()=>{turret(0,2.1,2.79,1.19);turret(0,1.94,-2.43,.89);for(const s of[-1,1]){missiles(s*1.07,2.02,.61,.54,1.33);vent(s*.98,1.98,4.86,.55,.85,8);}});
  }else if(id==='Iron_Behemoth'){
    section('01_Broad_triangular_core',()=>{
      armored([[-6.06,2.95,-.54,.56],[-4.48,3.29,-.65,1.13],[-.71,2.58,-.58,1.43],[3.96,1.19,-.45,1.54],[5.65,.78,-.29,.83]],0,'armor',12);
      armored([[-5.92,1.03,.52,1.23],[-4.48,1.17,.62,1.77],[-1.53,1.12,.83,1.81],[2.94,.69,.91,1.91]],0,'side',9);
      nosePort(0,.91,-6.14,1.77,.46);for(const s of[-1,1]){vent(s*1.77,1.3,-3.53,1.01,1.91,12);vent(s*1.48,1.54,-.47,.89,1.22,9);}
    });
    section('02_Downturned_front_prongs',()=>{for(const s of[-1,1]){
      armored([[-8.01,.16,-1.39,-1.15],[-6.42,.23,-1.35,-1.03],[-5.33,.51,-1.19,.42],[-3.59,.61,-.67,.79],[.98,.57,-.4,1.08]],s*2.55,'armor',9);
      nosePort(s*2.55,-1.21,-8.05,.24,.18);
      pipe([s*2.48,-.82,-6.04],[s*2.24,-.11,-4.72],.09,'steel');
      for(let i=0;i<7;i++)block(.16,.38,.38,s*(3.1-i*.055),.07,-4.07+i*.7,'edge',.035);
      fin([[-5.1,.37],[-4.03,1.52],[-2.62,1.39],[-2.13,.71]],s*2.93,.12,'side');
    }});
    section('03_Stern_command_and_heavy_battery',()=>{
      bridge(0,1.85,2.78,.92);turret(0,2.76,3.13,1.49);
      for(const s of[-1,1]){
        turret(s*1.96,1.35,-1.96,.86);missiles(s*1.39,1.63,.31,.64,1.49);
        plate(mirror([[.68,2.6],[2.26,3.15],[2.74,4.16],[2.49,4.7],[1.96,4.21],[.63,3.64]],s),-.11,.24,'side',.045);
        engine(s*.74,.46,5.93,.56);engine(s*1.66,.11,4.46,.33);
        service(s*1.13,.33,2.44,4,.64);
      }
    });
  }else if(id==='Devourer_Interceptor'){
    section('01_Long_open_twin_prongs',()=>{for(const s of[-1,1]){
      armored([[-8.47,.87,-.61,.49],[-7.56,1.04,-.71,.83],[3.17,1.04,-.66,1.07],[4.63,.72,-.41,.71]],s*1.99,'armor',14);
      nosePort(s*1.99,-.03,-8.51,1.59,.84);nosePort(s*1.99,.15,-8.63,1.44,.37);
      for(let i=0;i<9;i++){vent(s*1.99,1.01,-5.78+i*.91,.85,.49,5);block(.11,.33,.39,s*.92,-.03,-5.79+i*.94,'edge',.025);}
      service(s*3.07,.04,-6.72,12,.83);pipe([s*1.13,-.41,-7.39],[s*1.13,-.41,2.99],.05,'steel');
      for(const z of[-5.23,-1.91])turret(s*1.97,1.12,z,.71);
      missiles(s*2.48,1.05,.76,.49,1.12);
    }});
    section('02_Compact_aft_crossbody',()=>{
      armored([[1.32,2.44,-.6,.56],[2.97,2.71,-.61,1.27],[5.19,2.36,-.52,1.26],[6.37,1.62,-.29,.78]],0,'side',7);
      armored([[1.72,.61,.79,1.03],[2.97,1.12,.84,1.69],[4.61,1.01,.81,1.76],[5.26,.67,.76,1.35]],0,'light',4);bridge(0,1.7,3.94,.72);
      for(const s of[-1,1]){
        plate(mirror([[2.25,1.39],[3.13,1.61],[4.38,3.73],[4.56,4.69],[3.81,5.06],[2.4,3.55]],s),-.24,.32,'side',.06);
        plate(mirror([[2.73,2.1],[3.1,2.21],[3.89,3.67],[3.91,4.27],[3.56,4.41],[2.71,3.32]],s),.13,.14,'armor',.04);
        armored([[2.68,.53,.34,.79],[3.53,.71,.4,1.37],[5.96,.58,.28,1.31]],s*2.33,'armor',5);nosePort(s*2.33,.79,2.62,1,.44);
        vent(s*2.34,1.45,4.43,.86,1.28,10);fin([[4.37,1.43],[4.99,2.29],[5.53,2.36],[5.81,1.43]],s*1.86,.15,'armor');
        engine(s*2.2,.75,6.35,.51);engine(s*.94,-.12,6.72,.47);
      }
    });
  }else if(id==='Titanenergetic_Frigate'){
    section('01_Central_elongated_body',()=>{
      armored([[-6.49,.64,-.88,.81],[-5.93,.78,-.94,1.11],[-2.51,.81,-.91,1.27],[3.87,.77,-.64,1.17],[5.76,.49,-.3,.69]],0,'armor',12);
      nosePort(0,.27,-6.55,1.15,.61);block(.87,.39,.24,0,-.58,-6.57,'light',.045);
      armored([[-3.18,.41,1.07,1.3],[-1.96,.49,1.14,1.58],[3.01,.48,1.14,1.49]],0,'light',7);
      vent(0,1.67,-.91,.58,1.4,10);bridge(0,1.56,1.89,.59);
    });
    section('02_Open_frame_and_tall_rear_pylons',()=>{for(const s of[-1,1]){
      armored([[-6.69,.12,-.98,-.69],[-4.03,.17,-.92,-.6],[5.2,.21,-.54,-.19]],s*1.86,'edge',10);
      pipe([s*1.86,-.54,-4.92],[s*.78,-.21,-2.76],.08,'steel');pipe([s*1.86,-.23,4.16],[s*.74,.1,3.21],.1,'steel');
      loft([[-3.82,.13,.98,1.17],[4.76,.18,1.19,1.41]],'light',s*1.59);
      block(3.45,.19,.27,0,1.32,4.39,'edge',.04);
      fin([[1.44,1.3],[2.11,1.37],[2.54,3.78],[3.36,4.2],[3.99,4.2],[3.88,1.43]],s*1.69,.26,'side');
      fin([[2.53,2.07],[2.83,3.75],[3.52,4.02],[3.69,3.94],[3.56,2.11]],s*1.69,.3,'armor');
      armored([[.07,.14,3.77,4.0],[.85,.2,3.99,4.24],[5.67,.2,4.07,4.31],[6.37,.1,4.07,4.24]],s*1.69,'light',7);
      nosePort(s*1.69,3.94,.0,.29,.25);block(.06,.65,.19,s*1.87,2.35,2.82,'glass',.01);
      for(let i=0;i<4;i++)block(.35,.17,.4,s*1.69,1.93+i*.51,3.54,'edge',.025);
    }});
    section('03_Side_pods_and_weapon_ports',()=>{for(const s of[-1,1]){
      armored([[-2.04,.54,-.24,.59],[-1.27,.69,-.38,.82],[3.64,.61,-.3,.81],[4.44,.42,-.06,.44]],s*2.73,'armor',8);
      nosePort(s*2.73,.21,-2.11,1.03,.69);
      for(const x of[-.27,0,.27])for(const y of[-.17,.17]){cyl(.098,.035,s*2.73+x,.23+y,-2.17,'glass','z');ring(.107,.023,s*2.73+x,.23+y,-2.2,'steel');}
      engine(s*2.73,.2,4.96,.5);engine(s*.49,.08,6.16,.34);
      turret(s*2.74,.99,.33,.68);missiles(s*2.75,.97,2.56,.6,1.1);service(s*3.46,.13,-.76,6,.65);
      pipe([s*.79,.18,-.97],[s*2.12,.19,-.63],.16,'edge');pipe([s*.77,.13,2.85],[s*2.14,.16,2.68],.16,'edge');
    }});
  }else if(id==='Annihilator'){
    section('01_Layered_torpedo_bow',()=>{
      armored([[-7.96,.21,-.26,-.06],[-6.45,.78,-.54,.34],[-4.58,1.38,-.69,.63],[.51,1.44,-.71,.94],[4.89,1.18,-.41,1.02],[6.06,.73,-.23,.61]],0,'armor',12);
      armored([[-5.27,.39,.45,.61],[-3.17,.61,.62,1.08],[2.84,.63,.71,1.29],[4.69,.47,.73,1.05]],0,'light',9);
      for(const s of[-1,1]){
        for(let i=0;i<4;i++){const z=-7.26+i*.41,x=s*(.32+i*.16);cyl(.078,.035,x,.16+i*.078,z,'black','y');ring(.081,.014,x,.185+i*.078,z,'edge','y');}
        service(s*1.52,-.04,-3.84,9,.83);pipe([s*.79,-.59,-3.67],[s*.98,-.56,2.94],.06,'steel');
      }bridge(0,1.3,.97,.68);
    });
    section('02_Cross_wings_and_red_energy_pods',()=>{for(const s of[-1,1]){
      for(let j=0;j<2;j++){
        const z=.99+j*2.57;
        plate(mirror([[.91,z-.82],[2.25,z-.71],[3.53,z+.11],[3.59,z+1.0],[2.81,z+1.07],[1.08,z+.41]],s),-.09,.23,'dark',.055);
        plate(mirror([[1.25,z-.54],[2.23,z-.46],[3.3,z+.23],[3.37,z+.75],[2.82,z+.8],[1.31,z+.22]],s),.195,.12,'armor',.035);
        cyl(.37,.16,s*2.31,.43,z+.07,'side');ring(.31,.064,s*2.31,.54,z+.07,'red','y');cyl(.235,.022,s*2.31,.537,z+.07,'black');ring(.16,.027,s*2.31,.56,z+.07,'edge','y');
        for(let i=0;i<3;i++)block(.19,.035,.3,s*(2.91+i*.14),.37,z+.49,'edge',.008);
      }
      fin([[3.86,.39],[4.5,1.48],[5.34,1.4],[5.61,.26]],s*3.38,.17,'side');
      fin([[4.44,.65],[4.73,1.23],[5.11,1.17],[5.32,.55]],s*3.38,.21,'light');
      engine(s*.81,.11,6.59,.48);turret(s*.9,1.03,-1.03,.47);
      vent(s*.76,1.19,3.91,.55,1.05,8);
    }});
    section('03_Detonation_core',()=>{cyl(.34,.13,0,1.13,-2.46,'dark');ring(.28,.054,0,1.24,-2.46,'red','y');cyl(.12,.028,0,1.25,-2.46,'edge');for(const s of[-1,1]){missiles(s*.79,.98,2.68,.39,.74);block(.13,.11,.47,s*.73,-.67,.93,'red',.02);}});
  }else if(id==='Reaper'){
    section('01_Rounded_armored_prow',()=>{
      const ellipsoid=(g)=>{g.scale(1.33,1.02,2.73);g.translate(0,.06,-4.23);return g;};
      add(ellipsoid(new THREE.SphereGeometry(1,48,32)),'dark');
      for(let lat=1;lat<9;lat++)for(let lon=0;lon<16;lon++){
        const g=new THREE.SphereGeometry(1.028,4,3,lon*Math.PI/8+.012,Math.PI/8-.024,lat*Math.PI/10+.012,Math.PI/10-.024);
        add(ellipsoid(g),(lon===11||lon===12)&&lat<5?'black':lat>=5?'red':lon%3===0?'light':'armor');
      }
      armored([[-4.63,.79,-.58,.62],[-2.74,1.45,-.81,1.05],[2.81,1.66,-.62,1.08],[5.13,1.21,-.31,.77]],0,'side',11);
      loft([[-6.61,.16,.19,.36],[-5.49,.37,.61,.85],[-3.65,.49,.91,1.3],[-2.36,.4,.89,1.23]],'black');
      for(const s of[-1,1]){
        loft([[-6.05,.09,.38,.48],[-4.34,.15,.84,1.07],[-2.29,.14,.95,1.36]],'light',s*.46);
        cyl(.074,1.09,s*1.08,.34,-4.29,'steel','z');ring(.076,.023,s*1.08,.34,-4.86,'edge');
      }
    });
    section('02_Red_dorsal_spine_and_swept_fins',()=>{
      armored([[-2.79,.46,.9,1.23],[.54,.6,1.01,1.49],[4.81,.54,.68,1.08]],0,'red',9);
      for(const s of[-1,1]){
        fin([[-.56,.97],[.66,1.63],[2.91,3.24],[5.69,3.66],[5.37,2.91],[3.96,1.66],[3.41,.88]],s*.95,.34,'dark');
        fin([[-.08,1.17],[.94,1.81],[3.04,3.13],[5.22,3.48],[4.81,2.91],[3.69,1.89],[3.15,1.15]],s*.95,.39,'light');
        fin([[.64,1.77],[3.02,3.28],[5.57,3.63],[5.4,3.42],[3.08,3.06],[.88,1.66]],s*.95,.42,'red');
        fin([[1.5,1.37],[2.9,2.15],[3.92,2.27],[3.47,1.63],[2.75,1.19]],s*.95,.44,'armor');
        pipe([s*.67,.71,-.57],[s*1.35,.29,3.83],.085,'steel');
      }
    });
    section('03_Layered_side_wings',()=>{for(const s of[-1,1]){
      for(let j=0;j<3;j++){
        const z=-1.19+j*1.89,w=2.14+j*.31;
        plate(mirror([[1.12,z-.4],[w,z-.2],[w+.43,z+.46],[w+.12,z+1.1],[1.42,z+.9]],s),-.12-j*.025,.21,'dark',.035);
        plate(mirror([[1.51,z-.13],[w-.03,z+.04],[w+.15,z+.46],[w-.05,z+.81],[1.66,z+.65]],s),.16-j*.025,.09,'light',.03);
        vent(s*(w-.17),.29-j*.025,z+.43,.39,.51,6);
        if(j<2)turret(s*(w-.52),.34,z+.23,.48);
        missiles(s*(w-.14),.29,z+.42,.29,.46);
      }
    }});
    section('04_Exposed_reactor_and_thrusters',()=>{for(const s of[-1,1]){
      cyl(.41,3.12,s*1.27,.37,3.55,'side','z');for(let i=0;i<9;i++)ring(.43,.028,s*1.27,.37,2.12+i*.34,'steel');
      engine(s*1.25,.17,5.81,.53);engine(s*.47,-.31,5.98,.28);service(s*1.75,-.14,-1.52,8,.64);
      block(.46,.26,.75,s*1.37,.16,-2.66,'red',.055);
    }});
  }else if(id==='Death_Star'){
    root.userData.sourceStatus='No APK sprite found; retained spherical legacy concept refined';
    const R=3.4,dishDirection=new THREE.Vector3(.28,.3,-.91).normalize();
    const dent=g=>{const p=g.attributes.position,v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const n=v.clone().normalize(),a=n.angleTo(dishDirection);if(a<.27)v.addScaledVector(n,-.68*(1-a*a/(.27*.27)));p.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();return g;};
    section('01_Station_pressure_sphere',()=>{add(dent(new THREE.SphereGeometry(R,96,64)),'dark');});
    section('02_Spherical_armor_sectors',()=>{
      for(let lat=0;lat<18;lat++)for(let lon=0;lon<36;lon++){
        if(lat===8||lat===9)continue;
        const g=new THREE.SphereGeometry(R+.035,3,3,lon*Math.PI/18+.005,Math.PI/18-.01,Math.max(.002,lat*Math.PI/18+.007),Math.PI/18-.014);
        add(dent(g),(lat+lon)%7===0?'light':(lat+lon)%3===0?'side':'armor');
      }
      for(const y of[-.53,-.35,0,.35,.53])ring(Math.sqrt(R*R-y*y)+.015,.022,0,y,0,y===0?'edge':'steel','y');
      for(let i=0;i<72;i++){
        const a=i*Math.PI/36,x=Math.cos(a)*(R+.025),z=Math.sin(a)*(R+.025);
        const window=block(.084,.041,.017,x,i%2?.16:-.16,z,'glass',.002);window.rotation.y=Math.PI/2-a;
        if(i%3===0){const rib=block(.048,.73,.06,x,0,z,'steel',.007);rib.rotation.y=Math.PI/2-a;}
      }
    });
    section('03_Emitter_dish',()=>{
      const g=section('Dish_mount',()=>{
        ring(.88,.065,0,0,0,'edge');ring(.77,.028,0,0,-.025,'steel');
        const dish=new THREE.SphereGeometry(.84,40,16,0,Math.PI*2,0,Math.PI/2);dish.rotateX(Math.PI/2);dish.scale(1,1,.48);add(dish,'black',[0,0,-.32]);
        cyl(.2,.04,0,0,-.25,'glass','z');ring(.3,.025,0,0,-.18,'steel');
        for(let i=0;i<12;i++){const a=i*Math.PI/6;pipe([Math.cos(a)*.3,Math.sin(a)*.3,-.18],[Math.cos(a)*.72,Math.sin(a)*.72,-.03],.018,'steel');}
      });g.position.copy(dishDirection.clone().multiplyScalar(R-.16));g.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),dishDirection);
    });
    section('04_Polar_arrays',()=>{for(const y of[-1,1]){cyl(.32,.17,0,y*(R+.05),0,'side');ring(.24,.022,0,y*(R+.16),0,'steel','y');for(let i=0;i<6;i++){const a=i*Math.PI/3;cyl(.018,.21,Math.cos(a)*.23,y*(R+.2),Math.sin(a)*.23,'edge');}}});
  }else if(id==='Guardian'){
    root.userData.sourceStatus='Legacy Guardian; APK identity unconfirmed, not type_26';
    section('01_Retained_guardian_hull',()=>{
      armored([[-5.67,.25,-.38,.06],[-3.61,1.38,-.67,.57],[1.75,1.64,-.54,.86],[4.62,.83,-.21,.61]],0,'light',10);
      armored([[-2.71,.49,.48,.79],[.09,.69,.59,1.39],[2.87,.66,.64,1.37]],0,'armor',6);bridge(0,1.44,1.26,.77);
      for(const s of[-1,1]){service(s*1.7,-.07,-1.31,6,.72);turret(s*.93,.84,-1.97,.83);missiles(s*1.18,.87,.06,.53,1.01);}
    });
    section('02_Existing_guardian_ring',()=>{
      ring(2.78,.19,0,0,.54,'edge');ring(2.78,.063,0,0,.77,'gold');ring(2.78,.025,0,0,.843,'glass');
      for(let i=0;i<24;i++){
        const a=i*Math.PI/12,x=Math.cos(a)*2.78,y=Math.sin(a)*2.78;
        const m=block(.29,.43,.46,x,y,.5,i%3===0?'light':'armor',.055);m.rotation.z=a-Math.PI/2;
        if(i%3===0)pipe([x*.52,y*.52,.41],[x*.93,y*.93,.48],.09,'steel');
      }
    });
    section('03_Outboard_drives',()=>{for(const s of[-1,1]){
      armored([[-1.42,.35,-.32,.25],[.13,.55,-.4,.59],[4.47,.39,-.25,.49]],s*2.63,'armor',8);
      engine(s*2.63,.07,4.97,.49);engine(s*.64,.01,4.98,.35);vent(s*2.63,.64,2.52,.57,1.23,9);
      pipe([s*1.16,-.21,2.92],[s*2.2,-.19,3.46],.13,'edge');turret(s*2.62,.67,.79,.61);
    }});
  }
  if(!root.children.length)throw Error('精修模型尚未实现: '+id);
  return finish();
}
