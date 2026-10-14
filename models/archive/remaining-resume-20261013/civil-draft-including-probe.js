import * as THREE from 'three';
import {rebuildKit} from './fleet-rebuild-kit.js';

export const remainingCivilIds=['Cargo_Ship','Large_Cargo_Ship','Colony_Ship','Recycler','Probe','Solar_Satellite','Death_Star','Guardian'];
export function createRemainingCivil(id){
  if(!remainingCivilIds.includes(id))throw Error('Unknown remaining civil ship: '+id);
  const k=rebuildKit(id,true),{root,section,add,shell,skin,loft,plate,block,cyl,ring,pipe,mirror,fin,flank,vent,nose,bridge,ports,engine,turret,finish}=k;
  root.userData.revision='remaining-three-view-01';
  if(id==='Cargo_Ship'){
    section('01_Open_loading_bay',()=>{
      plate([[-2.94,-6.91],[2.94,-6.91],[3.12,-5.76],[2.68,4.4],[-2.68,4.4],[-3.12,-5.76]],-2.17,.29,'side',.045);
      plate([[-2.43,-6.51],[2.43,-6.51],[2.43,2.8],[-2.43,2.8]],-1.85,.095,'dark',.022);
      for(const s of[-1,1]){
        shell([[-6.91,.55,-1.88,.61],[-5.88,.89,-1.99,1.56],[-2.27,.88,-2.03,1.44],[2.46,.79,-1.86,1.53],[4.36,.69,-1.48,1.21]],s*2.71,'armor');
        skin(mirror([[2.23,-5.73],[3.08,-5.87],[3.34,-4.88],[3.21,-2.31],[2.42,-1.74],[2.11,-2.71]],s),[[-5.87,1.54],[-2.31,1.49]],'light');
        skin(mirror([[2.14,-1.25],[2.81,-1.51],[3.26,-.61],[3.14,1.71],[2.56,2.11],[2.12,1.44]],s),[[-1.51,1.48],[1.71,1.55]],'armor');
        flank([[-5.85,.81],[-5.18,1.12],[-3.56,.79],[-3.74,-1.51],[-5.62,-1.64]],[[-5.88,3.6],[-2.27,3.59]],s,'light');
        flank([[-3.08,.82],[-1.13,.99],[1.46,.61],[1.29,-1.34],[-.13,-1.69],[-2.89,-1.57]],[[-3.08,3.59],[2.46,3.5]],s,'edge');
        for(const z of[-4.8,-2.6,-.4,1.8]){block(.12,2.6,.16,s*1.9,-.3,z,'red',.025);pipe([s*1.94,-1.77,z],[s*1.94,1.1,z+.2],.07,'steel');}
        pipe([s*1.65,-1.7,-6.4],[s*1.65,-1.7,2.7],.065,'steel');
        nose(s*2.72,-.7,-6.95,.78,1.1,false);
      }
      block(4.38,3.2,1.17,0,-.14,3.01,'side',.12);block(3.55,2.07,.12,0,-.38,2.36,'dark',.03);
      for(const x of[-1.18,0,1.18])block(.38,1.75,.13,x,-.38,2.28,'steel',.03);
    });
    section('02_Splayed_aft_reactor_banks',()=>{for(const s of[-1,1]){
      shell([[2.75,.89,-1.9,.21],[4.04,1.34,-1.83,.88],[5.9,1.33,-1.6,1.24],[6.77,.86,-1.2,.83]],s*2.85,'armor');
      plate(mirror([[2.45,3.41],[3.67,3.21],[4.17,4.1],[4.1,5.88],[3.21,6.28],[2.43,5.5]],s),1.04,.17,'light',.03);
      engine(s*2.84,-.33,6.7,.72);vent(s*2.88,1.11,5.1,.9,1.07,8);
      fin([[3.23,-.7],[3.82,.19],[6.27,.31],[6.55,-1.25],[4.01,-1.79]],s*4.04,.2,'side');
      pipe([s*2.1,1.47,1.84],[s*2.13,1.91,3.55],.1,'edge');
    }});
    section('03_Cargo_control_bridge',()=>{shell([[3.38,1.03,1.1,1.71],[4.77,1.24,1.01,1.94],[5.92,.68,.87,1.59]],0,'side');bridge(0,1.83,4.68,.81);vent(0,1.73,5.81,.65,.54,6);});
  }else if(id==='Large_Cargo_Ship'){
    section('01_Long_open_freight_channel',()=>{
      plate([[-2.45,-6.83],[2.45,-6.83],[2.45,3.43],[-2.45,3.43]],-1.42,.26,'side',.04);
      plate([[-1.18,-6.7],[1.18,-6.7],[1.18,2.36],[-1.18,2.36]],-1.14,.055,'dark',.02);
      for(const s of[-1,1]){
        shell([[-6.98,.58,-1.37,.74],[-6.13,.74,-1.42,1.44],[-1.11,.71,-1.43,1.32],[2.88,.81,-1.54,1.47]],s*1.78,'armor');
        skin(mirror([[1.3,-6.11],[1.87,-6.13],[2.26,-5.56],[2.3,-3.97],[1.94,-3.55],[1.31,-4.08]],s),[[-6.11,1.48],[-3.55,1.42]],'light');
        skin(mirror([[1.31,-3.14],[1.95,-3.45],[2.23,-2.88],[2.25,-.61],[1.8,.04],[1.26,-.43]],s),[[-3.45,1.41],[.04,1.4]],'light');
        for(const z of[-5.1,-3.1,-1.1,1.1])block(.13,2.15,.18,s*1.13,.02,z,'red',.02);
        for(let j=0;j<3;j++){const z=-2.94+j*1.16;
          plate(mirror([[2.26,z-.45],[3.06,z-.59],[3.41,z-.11],[4.12,z+.07],[4.12,z+.29],[3.23,z+.33],[2.48,z+.62]],s),-.42,.23,'edge',.03);
          shell([[z-.41,.43,-1.32,.18],[z+.26,.47,-1.13,.41],[z+.58,.32,-.74,.17]],s*2.73,'armor');
        }
        nose(s*1.78,-.2,-6.99,.85,.73,false);pipe([s*.86,-.99,-6.53],[s*.86,-.99,2.38],.055,'steel');
      }
      block(4.82,2.77,1.5,0,-.02,2.46,'side',.12);
    });
    section('02_Wide_straight_heavy_tail',()=>{for(const s of[-1,1]){
      plate(mirror([[1.59,2.4],[5.87,2.66],[6.65,3.62],[5.11,3.5],[4.39,5.81],[1.52,5.44]],s),-1.42,.36,'side',.05);
      shell([[2.67,1.12,-2.23,-.61],[3.77,1.23,-2.28,.69],[5.61,1.22,-2.15,.54],[6.91,.76,-1.77,-.14]],s*2.84,'armor');
      shell([[2.26,.66,-1.69,-.13],[3.42,.97,-1.67,.11],[4.4,.84,-1.29,-.23]],s*4.71,'light');
      fin([[2.68,-1.41],[2.64,.18],[3.38,.23],[6.36,-.91],[6.71,-1.77]],s*4.37,.26,'armor');
      skin(mirror([[1.84,3.56],[2.94,3.14],[3.91,3.69],[3.84,5.28],[2.91,6.12],[1.87,5.59]],s),[[3.56,.73],[5.28,.61],[6.12,.22]],'light');
      engine(s*2.82,-.85,6.68,.77);vent(s*2.74,.76,4.43,.92,.98,9);
    }});
    section('03_Aft_freight_command',()=>{shell([[2.21,.73,1.15,1.59],[3.09,1.19,.42,1.96],[4.96,1.05,.03,1.67]],0,'side');bridge(0,1.8,3.61,.96);pipe([-.18,2.36,3.71],[-.18,2.75,3.71],.028,'steel');});
  }else if(id==='Colony_Ship'){
    section('01_Parallel_colonisation_bays',()=>{for(const s of[-1,1]){
      shell([[-6.93,.83,-1.27,-.13],[-5.91,.94,-1.39,.12],[-1.41,.96,-1.38,.26],[2.69,.93,-1.31,.34],[4.18,.77,-1.16,.59]],s*1.85,'armor');
      skin(mirror([[1.16,-6.27],[2.23,-6.26],[2.58,-5.58],[2.55,-3.14],[1.68,-2.78],[1.15,-3.29]],s),[[-6.27,.09],[-3.14,.25]],'light');
      skin(mirror([[1.18,-2.2],[1.99,-2.44],[2.58,-1.59],[2.64,1.87],[2.22,2.51],[1.19,1.88]],s),[[-2.44,.27],[1.87,.39]],'armor');
      nose(s*1.85,-.73,-6.93,1.44,.72,false);block(1.06,.49,.06,s*1.85,-.72,-6.99,'red',.025);
      shell([[-1.65,.49,-1.37,.06],[-.72,.75,-1.42,.3],[2.11,.76,-1.37,.3],[2.73,.52,-1.21,.04]],s*3.63,'side');
      for(const z of[-.62,1.43])block(1.64,.39,.56,s*2.94,-.79,z,'steel',.045);
      vent(s*1.8,.39,.54,.73,1.12,9);vent(s*3.64,.35,.49,.87,.98,8);
      const smallWing=plate(mirror([[2.6,-6.39],[4.36,-6.05],[4.62,-5.56],[3.79,-5.17],[2.67,-5.38]],s),-.88,.23,'armor',.03);smallWing.rotation.z=-s*.24;
      flank([[-5.9,-.29],[-4.61,-.16],[-2.87,-.23],[-2.58,-.86],[-4.38,-1.1],[-5.7,-.94]],[[-6,2.79],[-2.6,2.8]],s,'edge');
    }});
    section('02_Open_forebay_and_colony_bridge',()=>{
      shell([[-3.48,.78,-1.21,-.86],[-2.82,.88,-1.21,-.39],[2.61,1.81,-1.27,.36],[3.46,1.78,-.9,1.57],[4.35,1.76,-.85,2.3],[6.63,1.41,-.16,2.19]],0,'side');
      bridge(0,2.18,5.32,.7);skin([[-.81,3.73],[.81,3.73],[1.22,4.51],[.72,6.28],[-.72,6.28],[-1.22,4.51]],[[3.73,1.93],[4.51,2.33],[6.28,2.24]],'light');
      for(const s of[-1,1]){
        plate(mirror([[1.42,4.17],[3.01,4.08],[3.53,4.45],[5.62,4.04],[6.15,4.29],[5.89,5.67],[4.62,6.55],[2.07,6.41]],s),.34,.43,'side',.04);
        shell([[4.18,.94,-1.47,.46],[4.67,1.08,-1.53,.83],[6.2,.98,-.76,.94],[6.88,.51,-.37,.47]],s*4.22,'armor');
        skin(mirror([[3.45,4.65],[4.7,4.58],[5.11,5.22],[4.84,6.11],[3.31,6.14]],s),[[4.65,.86],[6.14,.97]],'light');
        vent(s*4.15,1.02,5.38,.82,.68,7);engine(s*4.14,-.32,6.53,.53);
        fin([[3.71,.48],[4.31,2.58],[4.69,2.57],[4.69,.44]],s*2.59,.19,'light');
      }
    });
  }else if(id==='Recycler'){
    section('01_Salvage_forks_and_pressure_hull',()=>{
      shell([[-4.91,.86,-1.59,-.12],[-3.79,1.64,-1.76,.34],[-1.52,2.13,-2.49,1.16],[1.36,1.97,-2.19,1.04],[5.82,1.64,-1.86,1.14],[6.82,1.24,-1.52,.75]],0,'armor');
      for(const s of[-1,1]){
        shell([[-6.97,.17,-1.69,-1.38],[-6.11,.41,-1.72,-1.11],[-3.83,.45,-1.62,-.98]],s*.8,'edge');
        shell([[-6.73,.23,-.89,-.52],[-5.73,.54,-1.13,-.11],[-3.61,.7,-.96,.32]],s*.83,'light');
        nose(s*.81,-1.5,-6.96,.28,.2,false);
        skin(mirror([[.18,-5.89],[.84,-5.89],[1.21,-4.92],[1.3,-3.72],[.77,-3.27],[.19,-4.03]],s),[[-5.89,-.13],[-3.72,.36]],'light');
        flank([[-2.98,.52],[-1.33,.78],[.42,.54],[.73,-1.64],[-.79,-2.12],[-2.08,-1.93]],[[-3.79,1.64],[-1.52,2.13],[1.36,1.97]],s,'edge');
        for(const z of[2.29,3.79,5.29])pipe([s*1.51,-1.31,z],[s*1.59,-2.73,z-.16],.075,'steel');
      }
      shell([[-2.2,.71,1.01,1.39],[-.63,.96,1.06,1.46],[2.31,.79,.79,1.24]],0,'side');bridge(0,1.4,-.13,.66);
    });
    section('02_Heavy_aft_collection_pods',()=>{for(const s of[-1,1]){
      plate(mirror([[1.22,2.5],[3.49,2.41],[4.37,3.8],[4.53,5.68],[3.92,6.52],[1.33,5.89]],s),-1.58,.64,'side',.07);
      shell([[2.99,.43,-1.87,.19],[3.8,.91,-2.78,.84],[5.38,.93,-2.93,1.07],[6.67,.69,-1.81,.36]],s*3.57,'armor');
      skin(mirror([[2.96,3.73],[3.88,3.61],[4.25,4.79],[4.17,5.63],[3.42,6.12],[2.76,5.5]],s),[[3.73,.78],[5.38,1.11],[6.12,.7]],'light');
      vent(s*3.57,1.11,5.3,.82,.62,6);engine(s*3.52,-.87,6.54,.57);
      for(const z of[4.02,4.86,5.7])block(.15,.56,.23,s*4.36,-.38,z,'steel',.026);
    }});
    section('03_Antenna_and_aft_service_deck',()=>{
      shell([[1.94,.62,.86,1.12],[3.04,.94,.89,1.44],[5.82,1.2,.67,1.21]],0,'light');
      cyl(.41,.23,0,1.39,2.58,'side');pipe([0,1.39,2.58],[0,2.61,2.58],.08,'steel');pipe([.26,1.4,2.72],[.26,2.97,2.72],.03,'steel');
      block(.65,.11,.59,0,2.24,2.58,'armor',.018);vent(0,1.35,4.38,1.04,.96,9);engine(0,-.22,6.42,.61);
    });
  }else if(id==='Probe'){
    root.userData.unarmed=true;root.userData.radialBranches={count:3,spacingDegrees:120,axis:'Z'};
    section('01_Central_sensor_spine',()=>{
      cyl(.63,4.8,0,0,.4,'armor','z',.53,12);cyl(.85,.64,0,0,1.2,'side','z');
      for(const z of[-1.31,.91,1.49,2.63]){ring(.59,.08,0,0,z,'steel');ring(.55,.027,0,0,z+.12,'glass');}
      cyl(.29,3.1,0,0,-3.52,'steel','z',.12,12);cyl(.08,2.4,0,0,-5.86,'glass','z',.016,12);
      cyl(.29,2.12,0,0,3.57,'edge','z',.14,12);cyl(.055,2.15,0,0,5.67,'steel','z',.014,12);engine(0,0,2.88,.48);
    });
    for(let j=0;j<3;j++){
      const g=section('02_Radial_sensor_branch_'+j,()=>{
        plate([[.31,.38],[1.34,.12],[2.84,1.21],[2.95,1.82],[2.54,2.11],[1.11,1.01],[.31,1.08]],-.16,.32,'side',.035);
        plate([[.59,.41],[1.34,.36],[2.64,1.34],[2.57,1.76],[1.16,.81],[.6,.83]],.16,.08,'light',.02);
        cyl(.36,3.9,2.73,0,.3,'armor','z',.24,12);ring(.26,.06,2.73,0,-1.17,'steel');cyl(.18,1.6,2.73,0,-2.23,'steel','z',.08,12);cyl(.052,2.65,2.73,0,-4.28,'glass','z',.01,10);
        cyl(.11,2.73,2.73,0,3.4,'light','z',.025,12);ring(.39,.065,2.73,0,1.71,'edge');engine(2.73,0,2.36,.29);
        block(.44,.38,.65,2.7,0,-.35,'dark',.04);cyl(.19,.19,2.73,.22,-.35,'black');ring(.16,.035,2.73,.33,-.35,'glass','y');
      });g.rotation.z=j*2*Math.PI/3;
    }
  }else if(id==='Solar_Satellite'){
    root.userData.unarmed=true;root.userData.solarPanels={wings:2,rows:3,columns:3};
    section('01_Central_power_bus',()=>{
      cyl(.65,5.9,0,0,0,'armor','y',.57,12);cyl(.83,.85,0,.01,0,'side','y');
      for(const y of[-2.51,-1.79,-.42,.43,1.78,2.5])ring(.61,.07,0,y,0,'steel','y');
      for(let i=0;i<8;i++){const a=i*Math.PI/4;pipe([Math.cos(a)*.64,-2.36,Math.sin(a)*.64],[Math.cos(a)*.64,2.36,Math.sin(a)*.64],.05,i%2?'edge':'steel');}
      cyl(.44,.34,0,3.02,0,'dark');ring(.38,.06,0,3.19,0,'glass','y');
      pipe([0,-2.81,0],[0,-3.53,0],.08,'steel');cyl(.45,.1,0,-3.4,0,'armor');
    });
    for(const s of[-1,1])section((s<0?'02_Left':'03_Right')+'_solar_array',()=>{
      block(6.54,.21,.28,s*3.74,0,0,'steel',.03);
      for(const x of[1,2.92,4.94,6.9])block(.13,5.42,.16,s*x,0,0,'steel',.02);
      for(const y of[-2.67,2.67])block(5.95,.12,.15,s*3.96,y,0,'edge',.02);
      for(let col=0;col<3;col++)for(let row=0;row<3;row++){
        const x=s*(1.91+col*2.02),y=(row-1)*1.79;
        block(1.96,1.71,.12,x,y,0,'edge',.016);block(1.8,1.56,.047,x,y,-.084,'panel',.007);
        for(let j=0;j<5;j++)block(.016,1.49,.016,x+(j-2)*.33,y,-.115,'steel',.002);
        for(const yy of[-.51,0,.51])block(1.77,.012,.012,x,y+yy,-.114,'gold',.001);
        block(.1,.23,.17,x,y+.79,0,'steel',.018);
      }
      for(const y of[-1.7,1.7])pipe([s*.55,y*.3,0],[s*1.03,y,0],.065,'steel');
    });
  }else if(id==='Death_Star'){
    section('01_Spherical_station_and_equatorial_trench',()=>{
      add(new THREE.SphereGeometry(6.92,64,48),'side');
      for(const y of[-.17,.17])ring(Math.sqrt(6.92**2-y*y),.12,0,y,0,'steel','y');
      ring(6.94,.1,0,0,0,'dark','y');
      for(let band=0;band<6;band++)for(let sector=0;sector<8;sector++){
        const theta=.13+band*(Math.PI-.26)/6,span=(Math.PI-.26)/6-.027,phi=sector*Math.PI/4+(band%2)*.22;
        const outer=new THREE.SphereGeometry(6.965,8,5,phi,Math.PI/4-.024,theta,span),p=outer.attributes.position,positions=[...p.array],indices=[...outer.index.array],n=p.count;
        for(let i=0;i<n;i++)positions.push(p.getX(i)*6.86/6.965,p.getY(i)*6.86/6.965,p.getZ(i)*6.86/6.965);
        const outerIndices=[...indices];for(let i=0;i<outerIndices.length;i+=3)indices.push(n+outerIndices[i+2],n+outerIndices[i+1],n+outerIndices[i]);
        const edge=[];for(let c=0;c<8;c++)edge.push([c,c+1],[45+c+1,45+c]);for(let r=0;r<5;r++)edge.push([(r+1)*9,r*9],[r*9+8,(r+1)*9+8]);
        for(const [a,b]of edge)indices.push(a,n+a,b,b,n+a,n+b);
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();outer.dispose();add(g,sector%4===0?'light':sector%3===0?'edge':'armor');
      }
      for(const s of[-1,1]){
        const dish=section('Recessed_emitter_'+s,()=>{cyl(1.49,.25,0,0,0,'dark','z');ring(1.36,.09,0,0,-.14,'steel');cyl(1.13,.1,0,0,-.16,'side','z');ring(.56,.065,0,0,-.23,'edge');cyl(.29,.17,0,0,-.25,'core','z');});
        dish.position.set(s*6.4,1.45,0);dish.rotation.y=-s*Math.PI/2;dish.rotation.z=-s*.22;
      }
    });
    section('02_Recessed_service_sectors',()=>{
      for(let j=0;j<28;j++){
        const theta=.43+(j%4)*.64,phi=j*2.399,normal=new THREE.Vector3(Math.sin(theta)*Math.cos(phi),Math.cos(theta),Math.sin(theta)*Math.sin(phi));
        const g=section('Station_service_'+j,()=>{block(.47,.09,.67,0,0,0,'dark',.02);for(let n=0;n<4;n++)block(.31,.033,.09,0,.048,(n-1.5)*.14,'steel',.006);});g.position.copy(normal.multiplyScalar(6.97));g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),normal.normalize());
      }
    });
  }else if(id==='Guardian'){
    section('01_Legacy_guardian_core',()=>{
      shell([[-6.7,.22,-.59,-.09],[-5.26,1.42,-1.03,.73],[-1.1,1.76,-1.1,1.18],[3.87,1.41,-.77,1.03],[6.26,.72,-.31,.62]],0,'armor');
      for(const s of[-1,1]){
        skin(mirror([[.05,-5.81],[.75,-5.22],[1.12,-3.77],[.9,-2.73],[.14,-3.09]],s),[[-5.81,.45],[-2.73,1.1]],'light');
        skin(mirror([[.28,-1.84],[1.19,-1.37],[1.37,.48],[.98,1.61],[.2,.99]],s),[[-1.84,1.18],[1.61,1.15]],'light');
        shell([[.32,.38,-.54,.07],[3.48,.6,-.64,.57],[6.57,.42,-.41,.29]],s*3.25,'edge');
        pipe([s*1.07,.18,.61],[s*3.27,.03,2.63],.25,'side');engine(s*3.24,-.02,6.56,.46);turret(s*1.12,1.17,.48,.38);
      }bridge(0,1.06,3.43,.93);engine(0,.02,6.8,.57);
    });
    section('02_Protective_angular_halo',()=>{
      ring(3.7,.3,0,0,.51,'gold');ring(3.7,.12,0,0,.27,'glass');
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6,x=Math.cos(a)*3.7,y=Math.sin(a)*3.7;
        const panel=block(.88,.43,.96,x,y,.53,i%3?'armor':'light',.05);panel.rotation.z=a-Math.PI/2;
      }
      for(const s of[-1,1])pipe([0,s*.75,.54],[0,s*3.68,.54],.17,'side');
    });
  }
  return finish();
}

