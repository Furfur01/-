import * as THREE from 'three';
import {createShipKit} from './ship-sculpted-kit.js';
export const sculptedIds=['Destroyer', 'Interceptor', 'Iron_Behemoth', 'Devourer_Interceptor', 'Titanenergetic_Frigate'];
export function createSculptedShip(id){
  const dark=['Destroyer','Interceptor','Iron_Behemoth'].includes(id);
  const {root,section,add,plate,block,loft,cyl,ring,pipe,mirror,turret,engine,finish}=createShipKit(id,{panel:0x164879,gold:0x957c4c,...(dark?{armor:0x4d6071,light:0x788c9c,side:0x303f4d}:{})});
  root.userData={modelId:id,revision:'fleet-sculpted-02',qualityReference:'Battleship sculpted-03: shaped armor and low mounts',silhouetteVerified:false,reference:['Death_Star','Guardian'].includes(id)?'legacy concept; no APK sprite':'APK sprite and imagegen concept'};
  function profile(rows,z){let i=0;while(i<rows.length-2&&rows[i+1][0]<z)i++;const a=rows[i],b=rows[i+1],f=(z-a[0])/(b[0]-a[0]);return {w:a[1]+(b[1]-a[1])*f,b:a[2]+(b[2]-a[2])*f,t:a[3]+(b[3]-a[3])*f};}
  function armored(rows,cx=0,mat='armor'){
    loft(rows,'dark',cx);
    loft(rows.map(([z,w,b,t])=>[z,w*.96,Math.max(b,t-.24),t+.035]),mat,cx);
    const start=rows[0][0],length=rows.at(-1)[0]-start;
    const cuts=length>7?[0,.43,.76,1]:length>2.8?[0,.61,1]:[0,1];
    for(let i=0;i<cuts.length-1;i++)for(const s of[-1,1]){
      const a=start+length*cuts[i]+.025,b=start+length*cuts[i+1]-.025,d=b-a;
      const stations=[...new Set([a,a+d*.18,b-d*.23,b,...rows.map(r=>r[0]).filter(z=>z>a&&z<b)])].sort((a,b)=>a-b);
      loft(stations.map(z=>{const q=profile(rows,z),f=(z-a)/d,spread=Math.min(1,f/.18,(1-f)/.23);return [z,q.w*(.12+.24*spread),q.t+.035,q.t+.15,s*q.w*(.45+.07*spread)];}),i%2===0?'light':mat,cx);
      const z=a+d*.58,q=profile(rows,z);
      if(q.w>.36&&d>1.2){block(.05,.1,Math.min(d*.26,.6),cx+s*q.w,q.t-.22,z,'black',.008);block(.017,.032,Math.min(d*.18,.34),cx+s*(q.w+.035),q.t-.21,z,'glass',.002);}
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

  if(id==='Destroyer'){
    section('01_Heavy_rectangular_bow',()=>{
      armored([[-7,1.58,-.88,.56],[-6.34,1.76,-.94,.8],[2.61,1.65,-.78,.9],[4.8,1.31,-.67,.72],[6.26,.92,-.39,.54]],0,'armor',12);
      for(const s of[-1,1]){armored([[-7.08,.57,-.56,.48],[-6.45,.64,-.44,.93],[1.76,.57,-.39,.98]],s*.83,'armor',10);nosePort(s*.84,-.02,-7.16,1.03,.72);service(s*1.81,-.05,-5.5,12,.72);pipe([s*1.52,-.5,-5.9],[s*1.58,-.5,2.75],.055,'steel');}
      armored([[-5.3,.22,.82,.97],[-3.1,.38,.86,1.26],[2.98,.5,.78,1.49]],0,'side',8);block(.16,.045,2.72,0,1.04,-3.4,'red',.01);
    });
    for(const s of[-1,1]){
      const wing=section('02_Thick_drooped_tail_'+s,()=>{
        plate(mirror([[1.25,2.62],[4.92,2.62],[5.15,2.88],[5.15,5.8],[4.88,6.03],[1.25,6.03]],s),-.62,1.02,'dark',.08);
        plate(mirror([[1.4,2.72],[4.85,2.72],[5.02,2.98],[5.02,5.63],[4.78,5.87],[1.4,5.87]],s),.4,.18,'armor',.055);
        plate(mirror([[1.42,2.81],[2.35,2.81],[2.68,3.26],[2.56,5.64],[1.42,5.72]],s),.6,.12,'light',.03);
        for(const z of[3.55,5.05]){
          const x=s*3.85;
          cyl(.76,.12,x,.63,z,'edge','y',.79,48);cyl(.66,.045,x,.71,z,'black','y',.66,48);
          ring(.7,.055,x,.755,z,'steel','y');ring(.55,.016,x,.765,z,'edge','y');
          for(let i=0;i<12;i++){
            const a=i*Math.PI/6,c=Math.cos(a),d=Math.sin(a);
            plate([[.2,0],[.61,-.08],[.59,.075],[.31,.11]].map(([u,v])=>[x+u*c-v*d,z+u*d+v*c]),.74,.032,i%2?'steel':'side',.006);
          }
          cyl(.2,.11,x,.79,z,'steel','y');cyl(.105,.025,x,.86,z,'armor','y');
        }
        block(.09,.36,2.45,s*5.13,-.13,4.33,'edge',.018);
        vent(s*2.04,.77,4.1,.48,1.25,8);
      });wing.rotation.z=-s*.13;
      section('02_Aft_engine_'+s,()=>{armored([[2.6,.49,-.61,.58],[3.5,.58,-.66,.85],[6.28,.44,-.42,.62]],s*1.61,'armor');engine(s*1.55,-.01,6.8,.5);});
    }
    section('03_Command_and_armaments',()=>{bridge(0,1.36,2.11,1.11);for(const s of[-1,1]){missiles(s*.83,1.07,-.52,.59,1.49);vent(s*.91,1.03,-4.91,.5,1,8);vent(s*1.6,.97,4.38,.65,1.32,10);}});
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
    section('04_Heavy_turrets_and_missiles',()=>{for(const s of[-1,1]){missiles(s*1.07,2.02,.61,.54,1.33);vent(s*.98,1.98,4.86,.55,.85,8);}});
  }else if(id==='Iron_Behemoth'){
    section('01_Broad_triangular_core',()=>{
      armored([[-6.06,3.55,-.54,.75],[-5.65,3.69,-.65,1.13],[-.71,2.03,-.58,1.43],[3.96,.62,-.45,1.54],[5.65,.38,-.29,.83]],0,'armor');
      armored([[-5.92,1.03,.72,1.23],[-4.48,1.13,.82,1.6],[-1.53,.87,1.13,1.74],[2.94,.44,1.41,1.91]],0,'side');
      nosePort(0,.91,-6.14,1.77,.46);for(const s of[-1,1]){vent(s*1.77,1.41,-3.53,.85,1.5,10);vent(s*1.36,1.56,-.47,.62,.95,8);}
    });
    section('02_Downturned_front_prongs',()=>{for(const s of[-1,1]){
      armored([[-8.01,.16,-1.39,-1.15],[-6.42,.23,-1.35,-1.03],[-5.33,.51,-1.19,.42],[-3.59,.39,-.67,.79],[-2.65,.18,-.4,1.08]],s*2.9,'armor');
      nosePort(s*2.9,-1.21,-8.05,.24,.18);
      pipe([s*2.83,-.82,-6.04],[s*2.59,-.11,-4.72],.09,'steel');
      for(let i=0;i<7;i++)block(.16,.25,.38,s*(3.32-i*.29),.27,-4.4+i*.83,'edge',.03);
    }});
    section('03_Flagship_command_and_defense',()=>{
      bridge(0,1.85,2.78,.92);
      for(const s of[-1,1]){
        
        plate(mirror([[.68,2.6],[2.26,3.15],[2.74,4.16],[2.49,4.7],[1.96,4.21],[.63,3.64]],s),-.11,.24,'side',.045);
        engine(s*.74,.46,5.93,.56);engine(s*1.66,.11,4.46,.33);
        service(s*.71,.33,2.44,2,.64);
      }
    });
  }else if(id==='Devourer_Interceptor'){
    section('01_Long_open_twin_prongs',()=>{for(const s of[-1,1]){
      armored([[-8.47,.87,-.61,.49],[-7.56,1.04,-.71,.83],[3.17,1.04,-.66,1.07],[4.63,.72,-.41,.71]],s*1.99,'armor',14);
      nosePort(s*1.99,-.03,-8.51,1.59,.84);nosePort(s*1.99,.15,-8.63,1.44,.37);
      for(let i=0;i<9;i++){vent(s*1.99,1.01,-5.78+i*.91,.85,.49,5);block(.11,.33,.39,s*.92,-.03,-5.79+i*.94,'edge',.025);}
      service(s*3.07,.04,-6.72,12,.83);pipe([s*1.13,-.41,-7.39],[s*1.13,-.41,2.99],.05,'steel');
      
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
      for(const x of[-.27,0,.27])for(const y of[-.17,.17]){cyl(.098,.035,s*2.73+x,.23+y,-2.17,'black','z');ring(.107,.023,s*2.73+x,.23+y,-2.2,'steel');}
      engine(s*2.73,.2,4.96,.5);engine(s*.49,.08,6.16,.34);
      missiles(s*2.75,.97,2.56,.6,1.1);service(s*3.46,.13,-.76,6,.65);
      pipe([s*.79,.18,-.97],[s*2.12,.19,-.63],.16,'edge');pipe([s*.77,.13,2.85],[s*2.14,.16,2.68],.16,'edge');
    }});
  }
  return finish();
}
