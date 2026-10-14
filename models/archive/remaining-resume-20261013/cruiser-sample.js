import {createShipKit} from './ship-detail-kit.js';

// Nose -Z, up +Y. Hidden surfaces are interpreted; the APK only supplies one view.
export function createCruiserSample(){
  const {root,section,plate,block,loft,cyl,ring,pipe,mirror,turret,engine,finish}=createShipKit('Cruiser');
  root.userData={modelId:'Cruiser',revision:'concept-sample-01',reference:'fleet_03_Cruiser.png',concept:'03-Cruiser.png',silhouetteVerified:false};
  const hullRows=[[-9.8,.12,-.28,-.03],[-9.0,.67,-.43,.14],[-7,1.36,-.6,.37],[-4,2.13,-.72,.53],[-1,2.43,-.73,.65],[2.6,2.42,-.63,.72],[5.7,1.85,-.5,.62],[7.2,1.4,-.36,.45]];
  function profile(z){let i=0;while(i<hullRows.length-2&&hullRows[i+1][0]<z)i++;const a=hullRows[i],b=hullRows[i+1],f=(z-a[0])/(b[0]-a[0]);return {w:a[1]+(b[1]-a[1])*f,top:a[3]+(b[3]-a[3])*f};}
  section('01_Pressure_hull_and_keel',()=>{
    loft(hullRows,'dark');
    loft(hullRows.map(([z,w,b,t])=>[z+.04,w*.83,b-.14,b+.1]),'side');
    loft([[-8.4,.26,-.45,-.32],[-5,1,-.91,-.56],[2.7,1.35,-.9,-.53],[6.1,.68,-.48,-.3]],'dark');
    for(const s of[-1,1]){
      for(let i=0;i<7;i++){
        const a=-8.9+i*2.03,b=Math.min(a+1.96,5.6),pa=profile(a),pb=profile(b);
        const shell=plate(mirror([[pa.w*.89,a],[pa.w+.01,a],[pb.w+.01,b],[pb.w*.89,b]],s),0,.11,i%3===1?'edge':'armor',.02);
        const pos=shell.geometry.attributes.position;for(let j=0;j<pos.count;j++)pos.setY(j,pos.getY(j)+profile(pos.getZ(j)).top-.18);pos.needsUpdate=true;shell.geometry.computeVertexNormals();
      }
    }
  });
  section('02_Segmented_foredeck',()=>{
    const cuts=[-9.6,-8.5,-7.05,-5.55,-4.05,-2.5,-.9,.8,2.5,4.2,5.7];
    for(let i=0;i<cuts.length-1;i++){
      const a=cuts[i]+.04,b=cuts[i+1]-.04,pa=profile(a),pb=profile(b),mid=(a+b)/2;
      for(const s of[-1,1]){
        const innerA=pa.w*.23,innerB=pb.w*.23,outerA=pa.w*.95,outerB=pb.w*.95;
        const tile=plate(mirror([[innerA,a],[outerA*.94,a],[outerA,a+.1],[outerB,b-.12],[outerB*.95,b],[innerB,b]],s),0,.095,i%4===0?'light':'armor',.022);
        const pos=tile.geometry.attributes.position;for(let j=0;j<pos.count;j++){const z=pos.getZ(j);pos.setY(j,pos.getY(j)+profile(z).top);}pos.needsUpdate=true;tile.geometry.computeVertexNormals();
        if(i>2&&i<8){
          for(const dz of[-.34,.34])block(.1,.032,.22,s*(profile(mid+dz).w*.87),profile(mid+dz).top+.115,mid+dz,'edge',.008);
        }
      }
      if(i<4){const p=plate([[-pa.w*.18,a],[pa.w*.18,a],[pb.w*.18,b],[-pb.w*.18,b]],0,.055,'side',.012);const pos=p.geometry.attributes.position;for(let j=0;j<pos.count;j++)pos.setY(j,pos.getY(j)+profile(pos.getZ(j)).top-.035);p.geometry.computeVertexNormals();}
    }
    for(const s of[-1,1]){
      pipe([s*.16,.2,-8.65],[s*.53,.54,-6.1],.045,'edge');
      block(.09,.025,1.55,s*.43,.415,-7.12,'red',.006);
      for(let i=0;i<15;i++){const z=-7.9+i*.87,p=profile(z);block(.036,.055,.25,s*(p.w+.016),p.top-.3,z,'glass',.002);}
    }
    plate([[-.13,-9.62],[.13,-9.62],[.3,-9.18],[-.3,-9.18]],-.02,.06,'light',.018);
  });
  section('03_Dorsal_spine_and_shoulders',()=>{
    loft([[-3.7,.46,.53,.62],[-2.5,.63,.54,.91],[.1,.7,.61,1.1],[3.6,.83,.65,1.25],[5.6,.71,.5,1.12]],'black');
    for(const[a,b,ta,tb]of[[-3.65,-2.5,.64,.94],[-2.43,-.48,.95,1.05],[-.4,1.32,1.06,1.15],[1.4,3.45,1.15,1.26],[3.53,5.5,1.26,1.13]])loft([[a,.57,.65,ta+.08],[b,.72,.68,tb+.08]],'armor');
    for(const s of[-1,1]){
      loft([[-1.9,.18,.7,.82],[-.2,.35,.65,1.05],[2.7,.41,.68,1.19],[4.25,.3,.63,1.02]],'side',s*1.35);
      for(let i=0;i<4;i++)loft([[-.2+i*.93,.38,.85,1.12],[.64+i*.93,.36,.88,1.15]],i%2?'armor':'light',s*1.36);
      block(.075,.055,2.7,s*.79,.95,.58,'edge',.008);
      for(let i=0;i<8;i++)block(.075,.065,.18,s*.77,.96,-.8+i*.34,'glass',.004);
      block(.5,.08,1.4,s*1.92,.83,.55,'black',.025);
      for(let i=0;i<10;i++)block(.44,.065,.055,s*1.92,.9,-.06+i*.13,'steel',.01);
    }
  });
  section('04_Recessed_missile_batteries',()=>{
    for(const s of[-1,1]){
      const x=s*1.08,z=-4.7,y=profile(z).top+.11;
      block(.65,.09,1.25,x,y,z,'black',.03);
      for(const dx of[-.22,.22])block(.055,.12,1.3,x+dx,y+.035,z,'edge',.015);
      for(let row=0;row<4;row++)for(const dx of[-.115,.115]){
        const zz=z-.44+row*.29;block(.17,.105,.22,x+dx,y+.04,zz,'steel',.022);
        cyl(.052,.028,x+dx,y+.105,zz-.04,'red','y',.045,12);
      }
      block(.54,.06,.11,x,y+.015,z+.65,'light',.015);
    }
  });
  section('05_Turret_batteries',()=>{for(const s of[-1,1]){turret(s*1.12,.73,-2.6,.9);turret(s*2.07,.68,4.15,.48);}});
  section('06_Stepped_command_bridge',()=>{
    loft([[.75,.51,1.01,1.22],[1.7,.86,1.04,1.75],[3.9,.9,.95,1.69],[4.65,.64,.92,1.48]],'side');
    loft([[1.12,.51,1.2,1.29],[1.78,.87,1.34,1.78],[3.96,.9,1.28,1.75],[4.25,.66,1.21,1.57]],'armor');
    for(let i=0;i<3;i++){
      const z=.85+i*.32,y=1.4+i*.18,w=.52+i*.11;
      loft([[z,w,y-.04,y+.065],[z+.33,w+.1,y-.02,y+.115]],'light');
      block(w*1.68,.065,.025,0,y-.015,z-.035,'black',.005);
      for(let j=-2;j<=2;j++)block(.105,.027,.012,j*w*.29,y-.01,z-.052,'glass',.002);
    }
    loft([[1.87,.71,1.78,1.9],[3.57,.75,1.75,1.92]],'black');
    loft([[1.93,.67,1.92,1.99],[3.67,.76,1.92,2.04]],'light');
    for(const s of[-1,1]){
      for(let i=0;i<7;i++)block(.035,.058,.11,s*.72,1.846,2.04+i*.21,'glass',.004);
      for(let i=0;i<3;i++)block(.14,.06,.025,s*(.12+i*.18),1.84,1.864,'glass',.005);
      loft([[2.2,.35,1.35,1.49],[3.2,.46,1.4,1.61]],'light',s*1.2);
      block(.6,.13,.04,s*1.24,1.46,2.17,'black',.01);
      for(let j=0;j<3;j++)block(.11,.045,.018,s*1.24+(j-1)*.17,1.48,2.14,'glass',.003);
      pipe([s*.53,1.3,1.02],[s*.66,1.72,1.75],.045,'edge');
    }
    loft([[2.49,.41,1.96,2.11],[2.91,.44,1.97,2.44],[3.68,.43,1.95,2.46],[3.98,.27,1.95,2.24]],'dark');
    loft([[2.71,.43,2.12,2.27],[2.97,.5,2.38,2.49],[3.77,.49,2.38,2.51]],'armor');
    block(1.08,.11,.73,0,2.5,3.3,'light',.055);
    block(.66,.08,.045,0,2.35,2.787,'black',.008);
    for(let i=-1;i<=1;i++)block(.13,.047,.015,i*.18,2.36,2.76,'glass',.003);
    for(const s of[-1,1]){cyl(.078,.19,s*.25,2.67,3.45,'steel');cyl(.018,.48,s*.25,2.94,3.45,'edge');cyl(.025,.045,s*.25,3.19,3.45,'light');}
    block(.45,.08,.42,0,2.59,3.13,'armor',.025);
  });
  section('07_Aft_wings_and_pylons',()=>{
    for(const s of[-1,1]){
      plate(mirror([[1.75,2.3],[2.6,2.6],[3.2,3.55],[4.53,4.06],[4.58,5.03],[3.42,4.88],[2.6,4.12],[1.67,3.98]],s),.03,.27,'dark',.06);
      plate(mirror([[1.83,2.33],[2.52,2.7],[3.18,3.73],[4.52,4.18],[4.53,4.65],[3.43,4.55],[2.68,3.85],[1.83,3.71]],s),.38,.16,'armor',.035);
      plate(mirror([[2.82,3.39],[3.19,3.78],[3.79,3.98],[3.62,4.36],[3.37,4.35],[2.8,3.79]],s),.555,.065,'light',.018);
      plate(mirror([[3.67,4.02],[4.51,4.23],[4.5,4.63],[3.62,4.49]],s),.57,.055,'armor',.012);
      for(let i=0;i<3;i++){block(.23,.033,.045,s*(3.85+i*.18),.655,4.27+i*.05,'edge',.006);}
      block(.14,.025,.26,s*4.11,.653,4.51,'red',.007);
      loft([[4.17,.14,.42,.6],[4.69,.15,.43,.91],[5.43,.14,.41,.89]],'light',s*4.45);
      block(.11,.08,.27,s*4.46,.72,4.9,'red',.012);
      plate(mirror([[1.95,4.18],[2.53,4.54],[3.41,5.53],[3.55,6.47],[2.78,6.55],[2.28,5.63],[1.64,5.52]],s),-.49,.13,'side',.04);
      plate(mirror([[2.61,5.3],[3.21,5.84],[3.31,6.28],[2.88,6.32],[2.53,5.76]],s),-.32,.08,'armor',.025);
      pipe([s*2.21,-.12,3.89],[s*3.3,-.31,5.63],.08,'steel');
      cyl(.2,.11,s*2.17,.16,3.6,'edge','x');
      for(let i=0;i<6;i++)block(.07,.22,.095,s*(2.8+i*.2),.23,4.07+i*.05,'steel',.013);
    }
  });
  section('08_Engine_nacelles',()=>{
    for(const s of[-1,1]){
      loft([[3.81,.49,.43,.73],[4.75,.6,.13,1.31],[6.76,.56,.13,1.25],[7.24,.39,.2,1.04]],'dark',s*1.57);
      loft([[4.18,.38,.71,.83],[4.82,.54,.74,1.36],[6.18,.53,.72,1.32]],'light',s*1.57);
      loft([[6.25,.52,.67,1.31],[6.93,.43,.61,1.2]],'armor',s*1.57);
      block(.82,.18,.075,s*1.57,.74,4.26,'black',.012);
      for(let i=0;i<5;i++)block(.105,.045,.03,s*1.57+(i-2)*.15,.77,4.21,'glass',.004);
      for(let i=0;i<5;i++){block(.09,.38,.15,s*2.13,.51,5.06+i*.31,'edge',.02);block(.044,.12,.072,s*2.19,.61,5.08+i*.31,'red',.01);}
      engine(s*1.57,.59,7.35,.46);engine(s*.65,-.15,7.38,.32);
      block(.51,.1,.84,s*1.56,1.355,5.57,'side',.025);
      for(let i=0;i<6;i++)block(.45,.035,.045,s*1.56,1.42,5.28+i*.11,'steel',.006);
    }
    loft([[4.8,.55,.6,1.01],[6.45,.56,.48,.88],[7.16,.42,.31,.67]],'armor');
    for(let i=0;i<7;i++)block(.67,.09,.09,0,1.014-i*.025,4.93+i*.24,'edge',.016);
  });
  section('09_Service_walls_and_belly',()=>{
    for(const s of[-1,1]){
      for(let i=0;i<9;i++){
        const z=-3.75+i*.81,p=profile(z),x=s*(p.w+.015);
        block(.12,.24,.47,x,-.12,z,'side',.027);
        block(.045,.11,.29,x+s*.084,-.1,z,'black',.01);
        block(.034,.045,.15,x+s*.11,-.1,z-.04,i%3===0?'red':'steel',.005);
        pipe([x,-.4,z-.29],[x,-.27,z-.29],.027,'steel');
      }
      pipe([s*1.55,-.57,-4.2],[s*2.32,-.56,-.6],.045,'steel');
      for(let i=0;i<6;i++)block(.23,.065,.13,s*.98,-.86,-3.8+i*1.25,'edge',.016);
      plate(mirror([[1.82,-.75],[2.37,-.51],[2.97,1.18],[2.53,1.12],[1.87,.39]],s),-.59,.12,'side',.024);
    }
    for(let i=0;i<5;i++)loft([[-5.2+i*1.85,.64,-.89,-.69],[-3.42+i*1.85,.83,-.91,-.67]],i%2?'edge':'side');
    for(const z of[-2.1,1.2,4.35]){cyl(.29,.045,0,-.945,z,'black');ring(.22,.028,0,-.97,z,'steel','y');block(.18,.035,.11,0,-.973,z,'edge',.007);}
  });
  return finish();
}
