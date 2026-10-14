import {Raycaster,Vector3,Matrix3} from 'three';
import {createShipKit} from './ship-sculpted-kit.js';

export const detailedFleetIds=['Bomber','Cargo_Ship','Large_Cargo_Ship','Colony_Ship','Recycler','Solar_Satellite','Interceptor','Devourer_Interceptor','Titanenergetic_Frigate'];

export function detailRemainingShip(root,id){
  if(!detailedFleetIds.includes(id))return root;
  root.updateMatrixWorld(true);
  const k=createShipKit(id+'_detail',{panel:0x21466d,gold:0x9c8462});
  const {section,plate,block,cyl,ring,pipe}=k;
  let seats=0;
  // Each assembly is seated against the actual hull triangle, not its bounding box.
  function seat(origin,direction,name,build){
    const hit=new Raycaster(new Vector3(...origin),new Vector3(...direction)).intersectObject(root,true)[0];
    if(!hit)throw Error(id+': missing hull beneath '+name+' at '+origin);
    const normal=hit.face.normal.clone().applyMatrix3(new Matrix3().getNormalMatrix(hit.object.matrixWorld)).normalize();
    const g=section(name,build);g.position.copy(hit.point).addScaledVector(normal,-.04);g.quaternion.setFromUnitVectors(new Vector3(0,1,0),normal);seats++;
  }
  function cover(w,l,kind='armor'){
    plate([[-w*.5,-l*.35],[-w*.28,-l*.5],[w*.33,-l*.5],[w*.5,-l*.22],[w*.44,l*.5],[-w*.38,l*.5],[-w*.5,l*.16]],0,.1,'dark',.012);
    plate([[-w*.43,-l*.28],[-w*.22,-l*.44],[w*.28,-l*.44],[w*.43,-l*.19],[w*.35,l*.39],[-w*.31,l*.44],[-w*.43,l*.11]],.075,.065,kind,.014);
  }
  function radiator(w,l){
    cover(w,l,'side');
    block(w*.66,.025,l*.72,0,.155,0,'black',.006);
    for(let j=0;j<9;j++)block(w*.58,.062,l*.027,0,.185,(j-4)*l*.079,'steel',.004);
    for(const s of[-1,1]){pipe([s*w*.4,.14,-l*.33],[s*w*.4,.14,l*.33],.035,'edge');block(w*.14,.028,l*.14,s*w*.3,.167,-l*.34,'red',.003);}
  }
  function hatch(w,l){
    cover(w,l,'light');
    plate([[-w*.28,-l*.33],[w*.14,-l*.33],[w*.3,-l*.08],[w*.23,l*.34],[-w*.18,l*.34],[-w*.29,l*.17]],.13,.045,'armor',.009);
    for(const z of[-l*.25,l*.25]){block(w*.29,.07,.11,-w*.32,.155,z,'steel',.012);block(w*.07,.029,.065,-w*.32,.206,z,'dark',.003);}
    block(w*.2,.028,.16,w*.21,.186,l*.17,'dark',.005);block(w*.11,.012,.04,w*.21,.206,l*.17,'glass',.002);
  }
  function actuator(w,l){
    cover(w,l,'side');
    for(const s of[-1,1]){
      const x=s*w*.25;
      for(const z of[-l*.33,l*.33])block(w*.36,.18,l*.13,x,.15,z,'armor',.015);
      cyl(w*.13,l*.55,x,.21,-l*.08,'dark','z');cyl(w*.08,l*.55,x,.21,l*.13,'steel','z');
      for(const z of[-l*.26,0])ring(w*.14,.025,x,.21,z,'edge');
      pipe([x,.16,-l*.39],[x,.16,l*.39],.035,'gold');
    }
  }
  function socket(r){
    cyl(r,.09,0,.02,0,'side');cyl(r*.86,.055,0,.088,0,'black');ring(r*.71,.035,0,.12,0,'steel','y');
    cyl(r*.51,.07,0,.114,0,'armor');block(r*.68,.02,r*.17,0,.157,0,'dark',.003);
    for(let i=0;i<6;i++){const a=i*Math.PI/3;cyl(.025,.023,Math.cos(a)*r*.71,.152,Math.sin(a)*r*.71,'gold','y',.025,8);}
  }
  const top=(x,z,name,fn,y=8)=>seat([x,y,z],[0,-1,0],name,fn);
  const side=(s,y,z,name,fn)=>seat([s*12,y,z],[-s,0,0],name,fn);
  section('04_Integrated_service_and_mechanical_detail',()=>{
    if(id==='Bomber'){
      for(const s of[-1,1]){
        side(s,-.59,-2.8,'Forward_avionics',()=>hatch(.64,1.52));
        side(s,.01,3.32,'Reactor_heat_exchange',()=>radiator(.87,1.72));
        side(s,-.55,4.43,'Engine_access',()=>socket(.25));
        top(s*.94,-.65,'Missile_feed_cassette',()=>{cover(.37,1.44,'edge');for(let i=0;i<4;i++){block(.26,.05,.21,0,.16,(i-1.5)*.3,'armor',.012);block(.12,.015,.035,0,.192,(i-1.5)*.3,'red',.002);}});
        top(s*2.48,.46,'Bomb_wing_actuator',()=>actuator(.42,.79));
        top(s*.96,5.8,'Exhaust_cooling_fins',()=>radiator(.28,.72));
      }
      top(0,-2.1,'Navigation_optics',()=>{cover(.46,.51);cyl(.14,.11,0,.16,0,'steel');cyl(.098,.025,0,.225,0,'glass');});
    }else if(id==='Cargo_Ship'){
      for(const s of[-1,1]){
        side(s,-.21,-4.58,'Fore_cargo_pressure_door',()=>hatch(1.74,1.92));
        side(s,-.21,-1.02,'Aft_cargo_pressure_door',()=>hatch(1.68,2.04));
        side(s,-.04,2.05,'Cargo_thermal_grid',()=>radiator(1.1,.88));
        side(s,-.34,4.77,'Engine_service_socket',()=>socket(.38));
        top(s*2.72,-3.14,'Docking_grapple_drive',()=>actuator(.46,1.14));
        top(s*2.71,.24,'Deck_maintenance_lid',()=>hatch(.64,1.11));
        seat([s*.3,-.9,-3.1],[0,-1,0],'Bay_floor_recess',()=>radiator(.38,2.8));
        seat([0,-.31,-1.7],[s,0,0],'Inner_loading_rail',()=>actuator(.56,2.28));
      }
      top(0,3.64,'Control_deck_cooling',()=>radiator(1.14,.54));
    }else if(id==='Large_Cargo_Ship'){
      for(const s of[-1,1]){
        side(s,.12,-4.39,'Long_bay_pressure_hatch',()=>hatch(1.1,2.22));
        side(s,.1,.74,'Freight_thermal_exchange',()=>radiator(1.23,.92));
        side(s,-.6,4.79,'Aft_engine_access',()=>hatch(1.14,1.29));
        top(s*1.76,-4.74,'Loading_lock_drive',()=>actuator(.51,1.3));
        top(s*1.76,-1.48,'Cargo_lock_drive',()=>hatch(.63,1.01));
        top(s*4.75,3.31,'Outboard_docking_collar',()=>socket(.37));
        top(s*2.83,5.63,'Reactor_jacket',()=>radiator(.85,.75));
        seat([0,.1,-3.8],[s,0,0],'Inner_fork_cable_route',()=>actuator(.6,1.8));
      }
    }else if(id==='Colony_Ship'){
      for(const s of[-1,1]){
        side(s,-.64,-4.16,'Habitat_service_lid',()=>hatch(.68,1.65));
        side(s,-.59,.54,'Colony_payload_radiator',()=>radiator(.94,1.32));
        side(s,.8,5.18,'Bridge_pressure_lock',()=>hatch(.81,1.09));
        top(s*1.85,-4.42,'Forebay_utility_trunk',()=>actuator(.55,1.48));
        top(s*1.85,1.66,'Habitat_access',()=>hatch(.74,.77));
        top(s*4.22,4.65,'Outboard_landing_drive',()=>actuator(.62,.74));
        top(s*3.62,1.71,'Habitat_docking_collar',()=>socket(.27));
        top(s*.52,.2,'Center_service_deck',()=>radiator(.46,1.8));
      }
    }else if(id==='Recycler'){
      for(const s of[-1,1]){
        side(s,-.42,-1.38,'Salvage_winch_housing',()=>{cover(1.42,1.67,'edge');socket(.46);for(const z of[-.58,.58])block(.79,.11,.12,0,.17,z,'steel',.01);});
        side(s,-.71,4.72,'Collector_heat_exchange',()=>radiator(1.55,1.08));
        top(s*.82,-5.16,'Fork_hydraulic_drive',()=>actuator(.43,.9));
        top(s*1.24,1.58,'Salvage_control_hatch',()=>hatch(.72,1.07));
        top(s*3.5,4.21,'Collector_intake_armor',()=>hatch(.67,.88));
        side(s,-1.15,1.43,'Belly_pressure_access',()=>hatch(.69,.82));
      }
      top(0,5.44,'Main_reactor_exchanger',()=>radiator(.97,.68));
    }else if(id==='Interceptor'){
      for(const s of[-1,1]){
        side(s,.7,-3.5,'Blade_reactor_radiator',()=>radiator(.62,1.7));
        side(s,.68,.51,'Upper_pressure_hatch',()=>hatch(.89,1.11));
        side(s,.6,3.6,'Reactor_side_access',()=>socket(.39));
        side(s,-1.2,2.28,'Keel_structural_pistons',()=>actuator(1.29,.61));
        side(s,-2.78,.21,'Lower_keel_exchanger',()=>radiator(.35,1.88));
        top(s*.86,4.96,'Engine_cowl_radiator',()=>radiator(.31,.87));
        top(s*.74,-1.94,'Upper_avionics',()=>hatch(.26,.75));
      }
      top(0,3.96,'Keel_reactor_access',()=>hatch(.76,.87),-1.3);
    }else if(id==='Devourer_Interceptor'){
      for(const s of[-1,1]){
        side(s,-.94,-4.35,'Gun_hull_capacitor',()=>radiator(.56,1.92));
        side(s,-.95,-1.54,'Gun_hull_pressure_hatch',()=>hatch(.63,1.58));
        top(s*1.67,-3.23,'Main_gun_feed_drive',()=>actuator(.55,.75));
        top(s*.5,-1.04,'Center_power_trunk',()=>radiator(.47,1.03));
        side(s,-.52,4.66,'Aft_engine_pressure_access',()=>hatch(.62,.89));
        top(s*1.65,5.39,'Aft_cooling_jacket',()=>radiator(.43,.64));
        seat([0,-.87,-4.62],[s,0,0],'Inner_gun_recoil_rail',()=>actuator(.47,1.63));
      }
    }else if(id==='Titanenergetic_Frigate'){
      for(const s of[-1,1]){
        side(s,-1.08,-4.75,'Forward_pressure_hatch',()=>hatch(.89,1.38));
        top(s*.34,-4.25,'Precision_cannon_power_trunk',()=>radiator(.26,1.45));
        side(s,-.63,.66,'Lateral_capacitor_access',()=>socket(.39));
        top(s*1.65,.45,'Crosswing_hydraulic_drive',()=>actuator(.48,.66));
        side(s,-.59,4.57,'Tail_cooling_jacket',()=>radiator(.36,1.08));
        top(s*3.13,4.81,'Tail_drive_hatch',()=>hatch(.3,.67));
        top(s*1.19,3.4,'Auxiliary_engine_cover',()=>radiator(.35,.72));
      }
    }else if(id==='Solar_Satellite'){
      for(const s of[-1,1])for(let col=0;col<3;col++)for(const row of[-1,0,1]){
        const x=s*(1.91+col*2.02),y=row*1.79;
        seat([x,y,4],[0,0,-1],'Solar_rear_bus_'+s+'_'+col+'_'+row,()=>{
          cover(.31,.51,'edge');block(.16,.065,.26,0,.16,0,'dark',.008);block(.065,.022,.11,0,.203,0,'gold',.002);
          for(const a of[-1,1])pipe([a*.09,.12,-.22],[a*.09,.12,.22],.025,'steel');
        });
      }
      for(const y of[-1.32,1.3])seat([0,y,4],[0,0,-1],'Power_bus_radiator',()=>radiator(.65,.82));
      for(const s of[-1,1])seat([s*.97,.26,0],[-s,0,0],'Array_rotation_bearing',()=>socket(.28));
    }
  });
  const details=k.finish();while(details.children.length)root.add(details.children[0]);
  root.userData.detailPass='integrated-detail-02';root.userData.detailAssemblies=seats;
  return root;
}
