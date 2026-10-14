import {Raycaster,Vector3,Matrix3} from 'three';
import {createShipKit} from './ship-sculpted-kit.js';

export const detailedFleetIds=['Bomber','Cargo_Ship','Large_Cargo_Ship','Colony_Ship','Recycler','Solar_Satellite','Interceptor','Devourer_Interceptor','Titanenergetic_Frigate'];

export function detailRemainingShip(root,id){
  if(!detailedFleetIds.includes(id))return root;
  root.updateMatrixWorld(true);
  const k=createShipKit(id+'_detail',{panel:0x21466d,gold:0x9c8462});
  const {section,plate,block,cyl,ring,pipe}=k;
  let seats=0;const referenceFeatures=[];
  // Each assembly is seated against the actual hull triangle, not its bounding box.
  function seat(origin,direction,name,build){
    const hit=new Raycaster(new Vector3(...origin),new Vector3(...direction)).intersectObject(root,true)[0];
    if(!hit)throw Error(id+': missing hull beneath '+name+' at '+origin);
    const normal=hit.face.normal.clone().applyMatrix3(new Matrix3().getNormalMatrix(hit.object.matrixWorld)).normalize();
    const g=section(name,build);g.position.copy(hit.point).addScaledVector(normal,-.04);g.quaternion.setFromUnitVectors(new Vector3(0,1,0),normal);seats++;referenceFeatures.push(name);
  }
  function contourPanel(name,points,depth=.15){
    const cx=points.reduce((v,p)=>v+p[0],0)/points.length,cz=points.reduce((v,p)=>v+p[1],0)/points.length;
    for(const [scale,y,h,material]of[[1,-.035,.075,'dark'],[.94,.032,depth,'light'],[.75,.032+depth-.008,.055,'armor']]){
      const mesh=plate(points.map(([x,z])=>[cx+(x-cx)*scale,cz+(z-cz)*scale]),0,h,material,.012),p=mesh.geometry.attributes.position;
      for(let i=0;i<p.count;i++){
        const hit=new Raycaster(new Vector3(p.getX(i),8,p.getZ(i)),new Vector3(0,-1,0)).intersectObject(root,true)[0];
        if(!hit)throw Error(id+': contour panel outside reference hull: '+name);
        p.setY(i,p.getY(i)+hit.point.y+y);
      }
      mesh.geometry.computeVertexNormals();
    }
    referenceFeatures.push(name);
  }
  function frame(points,w=1,l=1,depth=.12){
    const shape=points.map(([x,z])=>[x*w,z*l]);
    plate(shape,0,depth,'light',.013);
    plate(shape.map(([x,z])=>[x*.85,z*.86]),depth-.009,.02,'black',.004);
    return depth;
  }
  const cut=[[-.5,-.31],[-.31,-.5],[.35,-.5],[.5,-.28],[.5,.31],[.29,.5],[-.35,.5],[-.5,.29]];
  function grille(w,l,n=8){
    const y=frame(cut,w,l,.105);
    for(let j=0;j<n;j++)block(w*.64,.038,l*.028,0,y+.017,(j-(n-1)/2)*l*.72/(n-1),'steel',.004);
    block(w*.12,.033,l*.75,-w*.28,y+.016,0,'edge',.004);
  }
  function stepped(points,w,l){
    frame(points,w,l,.105);
    plate(points.map(([x,z])=>[x*w*.71,z*l*.76]),.106,.065,'armor',.014);
    plate(points.map(([x,z])=>[x*w*.45,z*l*.51]),.162,.055,'light',.011);
  }
  function windowBand(w,l,n){
    block(w,.05,l,0,.005,0,'dark',.006);
    for(const x of[-w*.52,w*.52])block(w*.11,.065,l,x,.025,0,'light',.006);
    for(let j=0;j<n;j++){const z=(j-(n-1)/2)*l*.85/n;block(w*.55,.016,l*.48/n,0,.04,z,'glass',.002);}
  }
  function cylinderBank(w,l){
    block(w,.08,l,0,.015,0,'dark',.013);
    for(const s of[-1,1]){
      cyl(w*.18,l*.76,s*w*.24,.12,0,'edge','z');
      for(const z of[-l*.32,0,l*.32])ring(w*.19,.024,s*w*.24,.12,z,'steel');
      block(w*.87,.17,l*.1,0,.07,s*l*.41,'armor',.012);
    }
  }
  function steppedDeck(w,l){
    stepped([[-.5,-.28],[-.17,-.5],[.43,-.5],[.5,-.25],[.37,.48],[-.38,.5]],w,l);
  }
  const top=(x,z,name,fn,y=8)=>seat([x,y,z],[0,-1,0],name,fn);
  const side=(s,y,z,name,fn)=>seat([s*12,y,z],[-s,0,0],name,fn);
  section('04_Reference_matched_secondary_structures',()=>{
    // Large secondary armor follows the actual hull surface; the dark seam separates its overlapping tiers.
    const reflect=(points,s)=>points.map(([x,z])=>[s*x,z]);
    if(id==='Bomber')for(const s of[-1,1]){
      contourPanel('B00_Stepped_fore_cheek',reflect([[.57,-4.69],[.82,-4.26],[.96,-3.68],[.95,-2.44],[.59,-2.64]],s),.13);
      contourPanel('B00_Aft_engine_roof',reflect([[.98,2.68],[1.8,2.91],[1.94,3.65],[1.93,4.64],[1.42,4.95],[1.04,4.39]],s),.16);
    }
    if(id==='Cargo_Ship')for(const s of[-1,1]){
      contourPanel('C00_Foreward_canted_combing',reflect([[2.3,-5.49],[2.75,-5.59],[3.29,-4.66],[3.28,-3.12],[2.88,-2.47],[2.31,-2.71]],s),.14);
      contourPanel('C00_Rear_loading_shoulder',reflect([[2.22,.52],[2.78,.18],[3.28,.92],[3.21,2.04],[2.56,2.65],[2.23,2.05]],s),.15);
    }
    if(id==='Large_Cargo_Ship')for(const s of[-1,1]){
      contourPanel('L00_Long_angular_bow_plate',reflect([[1.27,-5.9],[1.86,-5.98],[2.29,-5.36],[2.27,-3.86],[1.82,-3.5],[1.27,-4.18]],s),.13);
      contourPanel('L00_Aft_reactor_lobe',reflect([[1.94,3.8],[2.94,3.51],[3.71,4.01],[3.68,5.17],[2.98,5.8],[1.99,5.45]],s),.17);
    }
    if(id==='Colony_Ship')for(const s of[-1,1]){
      contourPanel('K00_Habitat_side_shoulders',reflect([[3.13,-.88],[3.66,-1.12],[4.17,-.63],[4.16,1.83],[3.7,2.26],[3.15,1.92]],s),.14);
      contourPanel('K00_Aft_command_shoulder',reflect([[.84,4.49],[1.46,4.45],[1.5,5.36],[1.17,6.22],[.83,5.98]],s),.16);
    }
    if(id==='Recycler')for(const s of[-1,1]){
      contourPanel('R00_Prow_pressure_shoulder',reflect([[.53,-3.35],[1.32,-3.16],[1.89,-1.54],[1.84,-.67],[1.15,-.76],[.5,-1.97]],s),.17);
      contourPanel('R00_Raised_aft_cargo_cowl',reflect([[.94,2.65],[1.74,2.91],[1.64,4.67],[1.31,5.39],[.92,4.88]],s),.17);
    }
    if(id==='Interceptor')for(const s of[-1,1]){
      contourPanel('I00_Faceted_upper_blade_panels',reflect([[.12,-5.53],[.59,-5.07],[.9,-3.72],[.87,-2.74],[.56,-2.02],[.16,-2.6]],s),.14);
      contourPanel('I00_Dorsal_notched_edge',reflect([[.16,-1.53],[.54,-1.67],[.63,-.85],[.58,1.15],[.19,1.42]],s),.12);
      contourPanel('I00_Wide_aft_blade_cheek',reflect([[.83,2.95],[1.13,3.22],[1.16,4.95],[.88,5.74],[.77,4.77]],s),.16);
    }
    if(id==='Devourer_Interceptor')for(const s of[-1,1]){
      contourPanel('D00_Forked_fore_armour_tiers',reflect([[1.17,-5.04],[1.82,-5.23],[2.3,-4.56],[2.23,-3.33],[1.72,-2.9],[1.18,-3.42]],s),.13);
      contourPanel('D00_Central_aft_shoulder',reflect([[.22,-2.4],[.66,-2.56],[1.09,-1.88],[.94,-.04],[.33,.33],[.19,-.53]],s),.13);
    }
    if(id==='Titanenergetic_Frigate')for(const s of[-1,1]){
      contourPanel('T00_Forward_pressure_box_tiers',reflect([[.12,-5.82],[.44,-5.83],[.63,-5.34],[.6,-3.63],[.37,-3.13],[.1,-3.59]],s),.14);
      contourPanel('T00_Aft_raised_spine',reflect([[.12,.62],[.49,.46],[.6,1.11],[.48,2.3],[.19,2.56]],s),.12);
    }
    if(id==='Bomber'){
      // Tripo: terraced prow, raised dorsal track, framed side engine and straight bomb wing.
      top(0,-4.58,'B01_Terraced_prow_armour',()=>{
        steppedDeck(.79,1.23);block(.6,.05,.07,0,.218,-.15,'edge',.007);
      });
      top(0,-2.93,'B02_Cockpit_surround',()=>{
        frame([[-.4,-.5],[.4,-.5],[.5,-.1],[.34,.5],[-.34,.5],[-.5,-.1]],.74,1.11);
        plate([[-.21,-.37],[.21,-.37],[.26,.13],[-.26,.13]],.124,.022,'glass',.004);
      });
      top(0,-.47,'B03_Raised_longitudinal_dorsal_track',()=>{
        frame(cut,1.13,2.63);for(const x of[-.45,.45])block(.12,.16,2.27,x,.15,0,'edge',.012);
        for(const z of[-.77,0,.77]){block(.6,.13,.59,0,.15,z,'armor',.021);block(.42,.02,.31,0,.222,z,'side',.006);}
      });
      for(const s of[-1,1]){
        side(s,-.9,-5.22,'B04_Layered_bow_sill',()=>steppedDeck(.48,1.75));
        side(s,-.36,-1.48,'B05_Interrupted_midship_girder',()=>{
          frame([[-.5,-.5],[.5,-.5],[.5,-.25],[.13,-.25],[.13,.21],[.5,.21],[.5,.5],[-.5,.5]],.69,2.1);
          grille(.28,1.36,8);
        });
        side(s,.03,3.31,'B06_Angular_engine_cheek',()=>{
          stepped([[-.5,-.25],[-.15,-.5],[.47,-.5],[.5,.27],[.27,.5],[-.5,.5]],1.0,1.38);
          block(.3,.035,.66,0,.234,0,'side',.006);
        });
        top(s*2.32,.69,'B07_Wing_longitudinal_ribs',()=>{
          frame(cut,.79,1.54,.075);for(const x of[-.24,0,.24])block(.07,.09,1.21,x,.105,0,'armor',.008);
          block(.66,.025,.23,0,.16,.32,'edge',.003);
        });
        top(s*.98,5.78,'B08_Split_tail_vent',()=>grille(.32,.91,7));
        side(s,.66,4.52,'B09_Aft_observation_recess',()=>windowBand(.12,1.07,5));
      }
    }else if(id==='Cargo_Ship'){
      // Tripo: six suspended cargo bins per flank, prow ribs and stacked aft engine decks.
      for(const s of[-1,1]){
        side(s,.82,-4.9,'C01_Three_fore_locking_ribs',()=>{
          frame(cut,.85,1.7,.07);for(const z of[-.52,0,.52]){
            plate([[-.37,z-.1],[.27,z-.1],[.39,z+.07],[.13,z+.14],[-.37,z+.11]],.067,.15,'light',.013);
          }
        });
        for(let j=0;j<6;j++)side(s,-.7,-2.99+j*.86,'C02_Suspended_cargo_bin_'+j,()=>{
          frame([[-.5,-.46],[.41,-.46],[.5,-.23],[.5,.44],[-.5,.44]],1.48,.78,.13);
          plate([[-.38,-.3],[.28,-.3],[.4,-.06],[.33,.31],[-.38,.31]],.132,.08,j%3===0?'edge':'armor',.013);
          for(const x of[-.56,.56])block(.19,.18,.55,x,.09,0,'steel',.018);
        });
        side(s,.91,-.74,'C03_Loading_spine_above_bins',()=>{
          steppedDeck(.39,4.5);windowBand(.1,3.89,12);
        });
        side(s,-.9,4.37,'C04_Rectangular_aft_heat_sink',()=>grille(.67,1.45,16));
        top(s*2.71,-4.51,'C05_Fore_raised_margin',()=>steppedDeck(.53,1.34));
        top(s*2.71,-.38,'C06_Inner_cargo_combing',()=>{
          frame(cut,.66,3.4,.075);for(const z of[-1.17,-.26,.76]){block(.31,.11,.58,0,.1,z,'armor',.012);block(.26,.025,.18,0,.17,z,'gold',.003);}
        });
        top(s*2.86,3.95,'C07_Aft_split_engine_shoulder',()=>steppedDeck(.78,1.14));
        seat([0,-.43,-.71],[s,0,0],'C08_Inner_loading_bulkhead',()=>{
          frame(cut,1.17,2.83,.06);for(const z of[-.94,0,.94])block(.91,.14,.12,0,.12,z,'steel',.01);
        });
      }
      top(0,3.58,'C09_Recessed_loading_control',()=>windowBand(.14,1.17,5));
    }else if(id==='Large_Cargo_Ship'){
      // Tripo: three hexagonal housings, vertical clamp legs and long split tail runners.
      for(const s of[-1,1]){
        side(s,.03,-4.91,'L01_Notched_forward_armour',()=>{
          stepped([[-.5,-.5],[.34,-.5],[.5,-.19],[.2,.02],[.2,.5],[-.5,.5]],1.45,2.39);
          for(const z of[-.49,-.18,.13,.44]){const b=block(.48,.04,.06,0,.234,z,'dark',.004);b.rotation.y=.19;}
        });
        for(let j=0;j<3;j++)side(s,-.11,-2.82+j*1.16,'L02_Hexagonal_clamp_housing_'+j,()=>{
          stepped(cut,.88,.92);
          block(.99,.1,.14,0,.245,.13,'edge',.007);
          block(.1,.105,.7,-.39,.16,0,'steel',.008);
        });
        side(s,-.98,-1.21,'L03_Underhung_transport_rail',()=>steppedDeck(.3,3.07));
        top(s*1.76,-3.78,'L04_Twin_forebeam_inset',()=>{
          frame([[-.5,-.48],[.17,-.48],[.5,-.26],[.5,.5],[-.29,.5],[-.5,.23]],.69,3.04,.085);
          plate([[-.2,-1.24],[.21,-1.24],[.24,-.4],[-.03,-.03],[.24,.32],[.24,1.26],[-.21,1.26]],.087,.037,'armor',.007);
        });
        top(s*2.86,4.38,'L05_Heavy_aft_casing',()=>steppedDeck(1.37,1.59));
        side(s,-.64,4.14,'L06_Layered_tail_runner',()=>{
          frame(cut,.56,2.48,.09);for(const x of[-.18,.18])block(.07,.13,2.09,x,.11,0,'armor',.01);
          block(.24,.1,.86,0,.1,.42,'edge',.018);
        });
        top(s*4.73,3.35,'L07_Outboard_recess',()=>grille(.53,.78,7));
      }
      top(0,4.23,'L08_Aft_bridge_steps',()=>steppedDeck(.93,1.02));
    }else if(id==='Colony_Ship'){
      // Tripo: twin inset forebays, long central service channel, framed habitat pods and stepped bridge.
      for(const s of[-1,1]){
        top(s*1.85,-4.26,'K01_Fore_long_rectangular_recess',()=>{
          frame(cut,.98,2.71,.065);grille(.67,1.79,16);
          for(const x of[-.38,.38])block(.06,.11,2.17,x,.1,0,'edge',.007);
        });
        top(s*1.85,.28,'K02_Aft_forebay_recess',()=>{
          frame([[-.5,-.5],[.31,-.5],[.5,-.27],[.5,.5],[-.33,.5],[-.5,.28]],.98,2.29,.07);
          block(.59,.05,1.49,0,.103,-.08,'side',.008);for(let j=0;j<8;j++)block(.42,.021,.06,0,.142,-.56+j*.14,'steel',.003);
        });
        side(s,-.56,-4.41,'K03_Fore_service_slot',()=>grille(.23,.81,9));
        side(s,-.42,.44,'K04_Faceted_habitat_casing',()=>{
          stepped([[-.5,-.31],[-.25,-.5],[.5,-.5],[.5,.38],[.27,.5],[-.5,.5]],.86,2.19);
          for(const x of[-.22,.22])block(.035,.055,1.43,x,.237,0,'edge',.006);
          block(.37,.034,1.15,0,.241,0,'dark',.005);block(.21,.028,.81,0,.27,0,'steel',.004);
        });
        top(s*3.61,.44,'K05_Encased_habitat_roof',()=>{
          frame(cut,1.08,2.11,.105);grille(.69,1.25,12);
        });
        top(s*4.23,5.09,'K06_Rear_outboard_habitat',()=>{
          steppedDeck(1.19,1.37);windowBand(.13,.96,6);
        });
        side(s,1.12,5.31,'K07_Bridge_horizontal_double_ledge',()=>{
          frame(cut,.84,1.34,.075);for(const x of[-.27,.27])block(.17,.19,1.09,x,.14,0,'light',.015);
          windowBand(.11,.89,5);
        });
        top(s*.5,.79,'K08_Deep_central_service_track',()=>{
          frame(cut,.48,2.69,.085);for(const z of[-.9,-.21,.48,.99])block(.25,.08,.33,0,.13,z,'edge',.012);
        });
      }
      top(0,4.5,'K09_Stepped_command_roof',()=>grille(.84,.61,7));
    }else if(id==='Recycler'){
      // Tripo: circular winch on middle flank, lower fork mechanisms and three slanted rear braces.
      for(const s of[-1,1]){
        side(s,-.22,-1.14,'R01_Central_salvage_winch',()=>{
          frame([[-.5,-.44],[.29,-.44],[.5,-.14],[.5,.49],[-.28,.49],[-.5,.19]],1.71,1.46,.11);
          cyl(.48,.14,0,.17,0,'side');ring(.4,.06,0,.26,0,'light','y');cyl(.29,.11,0,.25,0,'steel');cyl(.16,.07,0,.33,0,'edge');
          block(.35,.22,.36,.46,.13,.35,'armor',.024);
        });
        side(s,-1.74,-.88,'R02_Lower_winch_guard',()=>steppedDeck(.45,1.35));
        side(s,-1.29,-4.38,'R03_Fore_salvage_drive',()=>cylinderBank(.37,1.5));
        top(s*.8,-5.04,'R04_Salvage_fork_caps',()=>steppedDeck(.44,1.17));
        for(const z of[3.92,4.8,5.68])side(s,.02,z,'R05_Three_slanted_aft_braces_'+z,()=>{
          frame([[-.5,-.48],[.5,.13],[.5,.49],[-.5,-.09]],1.41,.73,.09);
          plate([[-.49,-.34],[.49,.19],[.49,.34],[-.49,-.19]],.1,.12,'armor',.012);
        });
        top(s*3.49,4.58,'R06_Collector_forked_cowl',()=>{
          frame(cut,1.14,1.48,.09);for(const x of[-.36,.36])block(.16,.24,1.12,x,.19,0,'light',.016);
          grille(.39,.82,7);
        });
        top(s*.56,.87,'R07_Upper_pressure_deck',()=>steppedDeck(.63,1.01));
      }
      top(0,3.48,'R08_Antenna_base_grid',()=>grille(.76,.59,8));
    }else if(id==='Interceptor'){
      // Tripo: machinery fills upper belly and lower deck; the gap remains open around the aft connecting neck.
      for(const s of[-1,1]){
        side(s,1.23,-3.7,'I01_Faceted_blade_edge',()=>{
          stepped([[-.5,-.5],[.16,-.5],[.5,-.17],[.31,.17],[.5,.5],[-.5,.5]],.45,2.66);
        });
        side(s,-.25,-3.8,'I02_Forward_underblade_mechanism',()=>cylinderBank(.49,1.69));
        side(s,.15,.36,'I03_Upper_belly_reactor_chain',()=>{
          frame(cut,.63,2.8,.08);for(const z of[-.91,-.15,.72]){block(.54,.17,.46,0,.16,z,'armor',.023);block(.24,.05,.19,0,.27,z,'dark',.006);}
          for(const x of[-.24,.24])pipe([x,.15,-1.17],[x,.15,1.17],.055,'steel');
        });
        side(s,.13,3.74,'I04_Aft_underblade_reactor',()=>cylinderBank(.56,1.97));
        side(s,-1.24,2.24,'I05_Articulated_keel_neck',()=>{
          frame(cut,1.56,.61,.09);for(const x of[-.52,0,.52]){cyl(.15,.15,x,.16,0,'steel');ring(.13,.025,x,.25,0,'edge','y');}
          block(1.38,.09,.14,0,.16,0,'side',.01);
        });
        top(s*.25,.11,'I06_Lower_deck_equipment',()=>{
          frame(cut,.37,2.61,.08);for(const z of[-.86,-.09,.69]){block(.32,.29,.44,0,.2,z,'edge',.018);block(.2,.025,.21,0,.357,z,'light',.006);}
        },-1.3);
        side(s,-2.65,2.77,'I07_Lower_reactor_casing',()=>{
          steppedDeck(.4,1.77);windowBand(.08,1.41,8);
        });
        top(s*.81,4.95,'I08_Aft_reactor_upper_braces',()=>grille(.32,.88,9));
      }
      top(0,-1.88,'I09_Low_dorsal_mount',()=>steppedDeck(.49,.77));
    }else if(id==='Devourer_Interceptor'){
      // Corrected source 2: three framed flank grilles, segmented square muzzle, low rails and tiered aft bridge.
      for(const s of[-1,1]){
        for(let j=0;j<3;j++)side(s,-.93,-3.99+j*1.77,'D01_Three_forward_flank_grilles_'+j,()=>{
          frame(cut,.61,1.52,.09);for(const x of[-.14,.14])for(let n=0;n<6;n++)block(.11,.055,.1,x,.115,(n-2.5)*.21,'steel',.004);
          block(.044,.055,1.28,0,.115,0,'light',.005);
        });
        top(s*1.68,-5.67,'D02_Three_step_square_gun_collar',()=>{
          steppedDeck(.94,.97);block(.71,.055,.09,0,.241,-.11,'side',.008);
        });
        top(s*1.67,-2.22,'D03_Foregun_longitudinal_rails',()=>{
          frame(cut,.73,2.57,.065);for(const x of[-.25,.25])block(.09,.08,2.29,x,.105,0,'edge',.007);
          block(.32,.07,1.53,0,.1,0,'armor',.015);
        });
        seat([0,-.91,-4.53],[s,0,0],'D04_Inner_gun_body_rail',()=>{
          frame(cut,.29,2.12,.06);block(.13,.075,1.88,0,.105,0,'steel',.005);
        });
        side(s,-.1,4.34,'D05_Tiered_rear_bridge_flank',()=>{
          stepped([[-.5,-.5],[.07,-.5],[.5,-.14],[.5,.5],[-.33,.5],[-.5,.21]],.69,1.2);
          windowBand(.11,.84,5);
        });
        top(s*1.14,4.88,'D06_Aft_bridge_stepped_roof',()=>steppedDeck(.56,1.23));
        side(s,-.89,1.38,'D07_Low_side_sponson',()=>steppedDeck(.39,.96));
      }
      top(0,1.09,'D08_Central_girder',()=>{steppedDeck(.76,1.37);windowBand(.1,.87,5);});
    }else if(id==='Titanenergetic_Frigate'){
      // Tripo: square bow housing, six port side pods, underbody runners and notched upper tail spars.
      for(const s of[-1,1]){
        side(s,-1.09,-4.83,'T01_Fore_pressure_box',()=>{
          stepped([[-.5,-.5],[.2,-.5],[.5,-.23],[.5,.5],[-.5,.5]],1.12,1.08);
          windowBand(.13,.72,4);
        });
        side(s,-1.08,-2.62,'T02_Squared_midship_service_bay',()=>{
          frame(cut,.85,1.21,.08);cylinderBank(.53,.82);
        });
        side(s,-.5,.59,'T03_Lateral_pod_double_louver',()=>{
          frame(cut,1.09,1.69,.09);for(const x of[-.27,.27]){block(.26,.04,1.2,x,.12,0,'dark',.007);for(let j=0;j<9;j++)block(.22,.04,.047,x,.15,(j-4)*.12,'steel',.003);}
        });
        top(s*3.34,.64,'T04_Pod_angled_cheek_recess',()=>{
          steppedDeck(1.1,1.13);grille(.53,.61,7);
        });
        side(s,-1.83,-.65,'T05_Underbody_runner',()=>{
          frame([[-.5,-.5],[.5,-.5],[.5,-.31],[.13,-.14],[.13,.14],[.5,.31],[.5,.5],[-.5,.5]],.3,2.3,.075);
          block(.1,.085,1.69,-.06,.11,0,'steel',.006);
        });
        side(s,2.18,4.57,'T06_Notched_high_tail_inlay',()=>{
          stepped([[-.5,-.5],[.5,-.5],[.5,-.11],[0,-.11],[0,.16],[.5,.16],[.5,.5],[-.5,.5]],.18,1.24);
        });
        top(s*1.18,3.45,'T07_Rear_engine_jacket',()=>grille(.42,.82,8));
      }
      top(0,-.38,'T08_Central_longitudinal_spine',()=>{frame(cut,.53,1.41,.065);block(.24,.105,1.07,0,.125,0,'light',.01);});
    }else if(id==='Solar_Satellite'){
      // No recovered 3D source: retain the APK 3-by-3 panel layout; only refine its visible frame and bus.
      for(const s of[-1,1])for(const y of[-1.79,0,1.79])seat([s*3.93,y,4],[0,0,-1],'S01_Array_rear_bus_'+s+'_'+y,()=>{
        frame(cut,.19,1.22,.05);block(.08,.045,1.02,0,.075,0,'gold',.003);
      });
      for(const y of[-1.39,1.39]){
        seat([0,y,4],[0,0,-1],'S02_Central_power_bus_recess',()=>grille(.58,.7,8));
        seat([0,y,-4],[0,0,1],'S03_Front_bus_inset',()=>steppedDeck(.51,.72));
      }
      for(const s of[-1,1])seat([s*.97,.26,0],[-s,0,0],'S04_Array_root_hinge',()=>{
        cyl(.29,.12,0,.03,0,'side');ring(.21,.04,0,.11,0,'steel','y');cyl(.12,.1,0,.105,0,'gold');
      });
    }
  });
  const details=k.finish();while(details.children.length)root.add(details.children[0]);
  root.userData.detailPass='reference-structure-02';root.userData.detailAssemblies=seats;root.userData.referenceFeatures=referenceFeatures;
  return root;
}
