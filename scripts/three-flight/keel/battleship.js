import {createFamilyInterior} from './family-common.js';

// Imported user-supplied KEEL_Battleship_Interior.html; modelling only.
export const createBattleshipInterior=options=>createFamilyInterior(buildModel,options);
function buildModel({T,interior,M,group,mesh,box,shape2,polygon,deckPoly,beam,cylinder,ring,tube,bolt,slotBank,frameShape,chamferRect}){
const CRAFT={
  id:'BATTLESHIP',title:'KEEL / BASTION 战斗舰桥',
  dimensions:{width:19.6,length:18.4,height:6.5},
  eye:[0,2.12,-4.55],fov:70,pitch:0,exposure:1.06,moveSpeed:1.4,
  bounds:{min:[-8.55,.48,-8.1],max:[8.55,5.8,8.35]},
  views:[
    {name:'Aft overview',position:[0,4.0,7.6],target:[0,1.8,-4.0]},
    {name:'Captain island',position:[-3.4,2.7,-2.85],target:[0,1.20,-5.32]},
    {name:'Crew and service bay',position:[-2.4,2.35,4.6],target:[-6.2,1.4,.2]},
    {name:'Aft pressure door',position:[0,2.1,3.9],target:[0,2.05,9.0]}
  ]
};

function buildCraft(){
  bsDecks();bsPressureShell();bsObservation();bsLoadFrames();
  bsCaptainIsland();bsBattleStations();bsAftSystems();bsPracticalFixtures();
}

// Modular deck, with an elevated command spine and uninterrupted outside aisles.
function bsDecks(){
  const g=group(interior,'BATTLESHIP_01_PRESSURE_DECK_AND_CIRCULATION');
  const outline=[[-6.79,-9.17],[6.79,-9.17],[9.65,-5.75],[9.65,9.18],[-9.65,9.18],[-9.65,-5.75]];
  deckPoly(g,'continuous_pressure_deck',outline,.30,0,M.structure);
  deckPoly(g,'forward_recessed_maintenance_apron',[[-6.62,-8.92],[6.62,-8.92],[9.38,-5.73],[9.38,-3.0],[-9.38,-3.0],[-9.38,-5.73]],.075,.065,M.floor);
  for(const s of [-1,1]){
    box(g,'lower_battle_bay_deck',5.42,.10,10.78,s*5.12,.065,1.49,M.structure,.015);
    for(let ix=0;ix<4;ix++)for(let iz=0;iz<8;iz++)
      box(g,'replaceable_side_bay_floor_plate',1.29,.035,1.30,s*(3.04+ix*1.33),.133,-3.14+iz*1.34,M.floor,.010);
    box(g,'outboard_service_aisle_backing',1.42,.12,14.0,s*8.37,.105,1.45,M.structure,.015);
    for(let iz=0;iz<11;iz++){
      const z=-4.99+iz*1.29;
      box(g,'wide_outboard_aisle_plate',1.37,.038,1.25,s*8.37,.188,z,M.floor,.010);
      box(g,'wall_service_drain_recess',.23,.025,1.22,s*9.13,.175,z,M.black,.007);
      for(let j=0;j<5;j++)box(g,'drain_grille_crossbar',.22,.025,.033,s*9.13,.199,z-.44+j*.22,M.secondary,.005);
    }
  }
  const spine=[[-1.50,-7.58],[1.50,-7.58],[2.20,-6.78],[2.20,4.55],[1.80,5.05],[-1.80,5.05],[-2.20,4.55],[-2.20,-6.78]];
  deckPoly(g,'command_spine_isolation_bed',spine,.15,.17,M.rubber);
  deckPoly(g,'command_spine_fabricated_box',spine,.52,.64,M.structure);
  deckPoly(g,'command_spine_top_edge',spine.map(p=>[p[0]*.981,p[1]*.994]),.037,.661,M.titanium);
  deckPoly(g,'command_spine_non_slip_surface',spine.map(p=>[p[0]*.961,p[1]*.988]),.025,.683,M.floor);
  // Expansion joints and service hatches describe a walkable deck, not decoration.
  for(let z=-6.65;z<4.7;z+=1.26){
    box(g,'spine_expansion_joint',3.96,.009,.015,0,.700,z,M.rubber,.002);
    for(const s of [-1,1])box(g,'spine_panel_outer_seam',.012,.009,1.21,s*1.07,.700,z+.62,M.rubber,.002);
  }
  for(const s of [-1,1])for(const z of [-5.82,-1.58,2.90]){
    const side=group(g,'spine_underfloor_service_access',s*2.205,.33,z);side.rotation.y=s*Math.PI/2;
    frameShape(side,'structural_access_opening',chamferRect(1.64,.38,.06),chamferRect(1.42,.22,.04),.040,M.secondary);
    polygon(side,'gasketed_access_cover',chamferRect(1.39,.195,.038),.025,M.black,0,0,-.016,.009);
    box(side,'recessed_latch',.18,.052,.026,0,0,.009,M.titanium,.008);
    for(const x of [-.75,.75])bolt(side,x,0,.031,'z',.017);
  }
  // A 1.6 m clear flight of steps connects the central spine and rear cross aisle.
  for(let k=0;k<4;k++){
    const h=.17*(4-k),z=5.01+k*.32;
    box(g,'aft_command_stair_riser',3.57,h,.325,0,h*.5,z,M.structure,.015);
    box(g,'aft_command_stair_tread',3.48,.020,.276,0,h+.011,z,M.floor,.006);
    box(g,'aft_command_stair_nosing',3.50,.024,.035,0,h+.018,z+.137,M.titanium,.005);
    for(const s of [-1,1])box(g,'stair_low_luminance_marker',.17,.024,.016,s*1.50,h-.055,z+.166,M.whiteLight,.005);
  }
  box(g,'aft_full_width_cross_aisle',18.57,.14,2.48,0,.025,7.72,M.structure,.012);
  for(let x=-8.54;x<=8.55;x+=1.31)for(const z of [7.08,8.36])
    box(g,'aft_cross_aisle_floor_panel',1.275,.035,1.23,x,.115,z,M.floor,.009);
  // Two protected transitions on either side of the spine remain clear of seats.
  for(const s of [-1,1])for(const z of [-2.1,2.16]){
    for(const zz of [z-.43,z+.43]){
      box(g,'spine_guardrail_deck_socket',.26,.085,.26,s*2.10,.729,zz,M.structure,.016);
      cylinder(g,'spine_guardrail_post',.038,.91,s*2.10,1.20,zz,M.secondary,12);
      bolt(g,s*2.10,.783,zz,'y',.026);
    }
    tube(g,'spine_guardrail_capped_handhold',[[s*2.10,1.64,z-.49],[s*2.10,1.72,z-.39],[s*2.10,1.72,z+.39],[s*2.10,1.64,z+.49]],.035,M.titanium);
    box(g,'low_impact_guard_panel',.065,.34,.82,s*2.10,1.27,z,M.secondary,.028);
  }
  for(const s of [-1,1]){
    // Deck-side ramps give a direct route from the captain to either battle bay.
    for(let k=0;k<3;k++){
      const h=.68-(k+1)*.178;
      box(g,'side_command_access_step',.33,h,1.18,s*(2.35+k*.33),h*.5,-.05,M.structure,.012);
      box(g,'side_step_tread',.297,.022,1.10,s*(2.35+k*.33),h+.012,-.05,M.floor,.005);
      box(g,'side_step_edge',.032,.025,1.12,s*(2.48+k*.33),h+.016,-.05,M.titanium,.006);
    }
  }
}

function bsPressureShell(){
  const g=group(interior,'BATTLESHIP_02_ARMOURED_PRESSURE_SHELL');
  for(const s of [-1,1]){
    box(g,'deep_side_armour_pressure_wall',.48,4.60,14.88,s*9.65,2.23,1.69,M.structure,.040);
    for(let j=0;j<5;j++){
      const z=-4.34+j*2.86;
      box(g,'lower_wall_impact_armour',.21,.71,2.80,s*9.30,.57,z,M.secondary,.045);
      box(g,'upper_wall_liner_panel',.16,1.20,2.77,s*9.33,3.63,z,M.cladding,.045);
      box(g,'wall_upper_gasket_joint',.024,.044,2.65,s*9.236,4.13,z,M.rubber,.006);
      for(const dz of [-1.17,1.17])bolt(g,s*9.231,3.10,z+dz,'x',.024);
      const roof=box(g,'sloping_armour_shoulder_liner',3.16,.19,2.80,s*8.14,5.36,z,M.cladding,.040);
      roof.rotation.z=-s*.622;
      box(g,'shoulder_liner_lower_return',.24,.17,2.77,s*9.36,4.38,z,M.secondary,.020);
    }
    beam(g,'shoulder_pressure_backing',[s*9.61,4.43,1.54],[s*6.88,6.43,1.54],.36,15.24,M.structure,.035);
    box(g,'continuous_wall_distribution_plenum',.34,.35,14.69,s*9.15,2.77,1.58,M.black,.036);
    for(const yy of [2.68,2.84])tube(g,'paired_longitudinal_utility_line',[[s*8.955,yy,-5.35],[s*8.955,yy,8.74]],.035,M.secondary);
    for(let z=-4.96;z<8.8;z+=1.41)box(g,'wall_utility_saddle',.12,.34,.062,s*8.93,2.75,z,M.titanium,.009);
  }
  box(g,'crown_pressure_backing',13.90,.32,18.12,0,6.54,.01,M.structure,.018);
  for(let x=-5.90;x<6.8;x+=1.98)for(let z=-7.89;z<8.7;z+=2.01){
    box(g,'ceiling_damped_liner',1.937,.13,1.966,x,6.317,z,M.cladding,.025);
    box(g,'ceiling_panel_acoustic_recess',1.42,.038,1.31,x,6.231,z,M.secondary,.024);
    for(const dx of [-.68,.68])box(g,'ceiling_quick_release_slot',.085,.018,.019,x+dx,6.206,z+.61,M.black,.004);
  }
  // A sealed rear bulkhead follows the shoulder profile, including above the door.
  polygon(g,'aft_pressure_bulkhead',[[-9.62,0],[9.62,0],[9.62,4.46],[6.88,6.47],[-6.88,6.47],[-9.62,4.46]],.46,M.structure,0,0,9.17,.03);
}

function bsWindowUnit(parent,name,width,height,x,y,z,yaw,depth=.63){
  const u=group(parent,name,x,y,z);u.rotation.y=yaw;
  const out=chamferRect(width,height,.29),inn=chamferRect(width-.39,height-.40,.22);
  frameShape(u,'armoured_pressure_reveal',out,inn,depth,M.structure,0,0,0,.038);
  frameShape(u,'laminate_rebate',chamferRect(width-.19,height-.18,.25),chamferRect(width-.405,height-.417,.205),.10,M.secondary,0,0,depth*.5+.028,.018);
  frameShape(u,'machined_glazing_clamp',chamferRect(width-.32,height-.32,.235),chamferRect(width-.47,height-.465,.194),.051,M.titanium,0,0,depth*.5+.082,.009);
  frameShape(u,'replaceable_continuous_pressure_seal',chamferRect(width-.46,height-.46,.20),chamferRect(width-.535,height-.535,.18),.028,M.rubber,0,0,depth*.5+.109,.005);
  const glass=mesh(u,'laminated_observation_glass',new T.ShapeGeometry(shape2(chamferRect(width-.50,height-.50,.19))),M.glass,0,0,.18);glass.castShadow=false;
  for(const s of [-1,1]){
    for(const yy of [-height*.33,0,height*.33])bolt(u,s*(width*.5-.11),yy,depth*.5+.138,'z',.024);
    const count=Math.max(2,Math.round(width/1.8));
    for(let j=0;j<count;j++)bolt(u,(-.5+(j+.5)/count)*(width-.9),s*(height*.5-.115),depth*.5+.139,'z',.025);
  }
  box(u,'recessed_lower_laminate_heater',width-.71,.067,.11,0,-height*.5+.254,depth*.5+.149,M.secondary,.013);
  return u;
}

function bsObservation(){
  const g=group(interior,'BATTLESHIP_03_PANORAMIC_OBSERVATION_ASSEMBLY');
  // One central pane, not a row of narrow window modules. Side joints lie at ±56°.
  bsWindowUnit(g,'single_full_width_forward_pressure_window',13.57,6.09,0,3.19,-9.00,0,.67);
  for(const s of [-1,1]){
    bsWindowUnit(g,s<0?'port_angled_observation_return':'starboard_angled_observation_return',4.235,6.09,s*8.105,3.19,-7.37,-s*.885,.63);
    const sill=group(g,'angled_apron_sill',s*8.105,.10,-7.37);sill.rotation.y=-s*.885;
    box(sill,'pressure_sill_lower_armour',4.23,.46,.73,0,0,0,M.structure,.033);
    box(sill,'replaceable_sill_impact_cap',3.87,.094,.76,0,.272,.09,M.secondary,.034);
    box(g,'outer_observation_wall_return',.69,4.43,.70,s*9.39,2.255,-5.53,M.structure,.04);
  }
  box(g,'full_width_forward_sill_pressure_box',13.64,.46,.85,0,.085,-9.0,M.structure,.037);
  box(g,'forward_sill_replaceable_cap',12.96,.099,.72,0,.36,-8.91,M.secondary,.027);
  for(let x=-5.8;x<=5.9;x+=1.66){
    box(g,'sill_temperature_service_cover',1.51,.20,.038,x,.095,-8.55,M.cladding,.020);
    slotBank(g,x,.095,-8.524,3,1.11,.045,'z');
  }
  // The wide clear span is carried by a deep brow, loaded into outboard pillars.
  box(g,'forward_armour_brow_box_girder',13.66,.46,.98,0,6.32,-8.98,M.structure,.055);
  box(g,'forward_brow_inside_lower_flange',13.02,.088,.54,0,6.055,-8.74,M.titanium,.016);
  box(g,'brow_heater_maintenance_rail',12.80,.11,.10,0,6.045,-8.45,M.black,.020);
  for(const s of [-1,1]){
    beam(g,'outboard_brow_diagonal_load_return',[s*6.81,6.29,-8.96],[s*9.27,5.17,-5.79],.42,.63,M.structure,.045);
    beam(g,'window_side_sill_service_route',[s*6.70,.33,-8.62],[s*9.04,.33,-5.74],.10,.15,M.secondary,.014);
  }
  bsInnerObservationReveal(g);
}

function bsInnerObservationReveal(parent){
  // A deep, fabricated internal armour collar connects directly to the original
  // glazing pressure frame. Its top edge appears at +30.7 degrees from the eye;
  // the side aperture appears at ±49 degrees. The central sightline remains open.
  const g=group(parent,'integral_inner_armoured_observation_reveal',0,0,-8.76);
  const mouth=[[-4.50,.46],[4.50,.46],[4.66,.64],[4.66,3.55],[4.28,4.51],[3.58,4.75],[-3.58,4.75],[-4.28,4.51],[-4.66,3.55],[-4.66,.64]];
  frameShape(g,'continuous_fabricated_inner_armour_collar',chamferRect(13.48,6.03,.28,0,3.19),mouth,.34,M.structure,0,0,0,.032);
  const flange=mouth.map(p=>[p[0]*1.031,2.48+(p[1]-2.48)*1.035]);
  frameShape(g,'replaceable_aperture_wear_flange',flange,mouth,.067,M.secondary,0,0,.205,.012);
  // Full-depth webs return the narrower inner aperture into the outer box frame.
  for(const s of [-1,1]){
    polygon(g,'side_reveal_welded_load_doubler',[[s*4.84,.74],[s*5.29,.51],[s*6.48,.51],[s*6.48,3.82],[s*5.15,3.82],[s*4.84,3.28]],.061,M.secondary,0,0,.225,.018);
    polygon(g,'upper_reveal_service_cover',[[s*3.72,4.95],[s*4.44,4.72],[s*4.98,3.91],[s*6.42,3.91],[s*6.42,5.71],[s*4.17,5.71]],.054,M.cladding,0,0,.218,.018);
    // The face plates, collar and glazing-clamp fasteners form one assembly.
    for(const p of [[4.98,1.02],[4.98,2.35],[5.17,3.49],[6.26,1.04],[6.26,3.45],[4.25,4.86],[5.85,5.50]])
      bolt(g,s*p[0],p[1],.274,'z',.026);
    box(g,'inner_reveal_sill_load_spreader',1.61,.135,.68,s*5.58,.391,.006,M.titanium,.023);
    for(const x of [4.98,6.12])bolt(g,s*x,.475,.05,'y',.029);
    box(g,'reveal_upper_inspection_latch_well',.179,.10,.028,s*5.66,4.61,.262,M.black,.013);
    box(g,'reveal_upper_inspection_latch',.112,.037,.036,s*5.66,4.61,.288,M.titanium,.007);
  }
  box(g,'inner_brow_machined_aperture_edge',7.13,.057,.083,0,4.794,.253,M.titanium,.012);
  box(g,'inner_brow_expansion_rebate',7.81,.021,.019,0,4.977,.192,M.rubber,.005);
  // A closed, removable upper service channel is carried by the brow itself.
  box(g,'inner_brow_pressure_equalisation_cover',6.81,.249,.079,0,5.212,.202,M.secondary,.023);
  for(const x of [-3.12,-1.55,1.55,3.12])bolt(g,x,5.212,.258,'z',.023);
}

function bsLoadFrames(){
  const g=group(interior,'BATTLESHIP_04_DEEP_TRANSVERSE_LOAD_FRAMES');
  const profile=[[-9.10,.17],[-9.10,4.08],[-8.76,4.56],[-6.56,6.00],[6.56,6.00],[8.76,4.56],[9.10,4.08],[9.10,.17]];
  for(const z of [-4.73,.94,6.79]){
    const rib=group(g,'fabricated_transverse_armour_frame',0,0,z);
    for(let j=0;j<profile.length-1;j++){
      const a=profile[j],b=profile[j+1];
      beam(rib,'deep_box_section_load_member',[a[0],a[1],0],[b[0],b[1],0],.45,.70,M.structure,.032);
      beam(rib,'forward_load_member_flange',[a[0],a[1],-.382],[b[0],b[1],-.382],.56,.080,M.secondary,.012);
      beam(rib,'aft_load_member_flange',[a[0],a[1],.382],[b[0],b[1],.382],.56,.080,M.secondary,.012);
    }
    for(const s of [-1,1]){
      box(rib,'frame_deck_spreader_shoe',.96,.22,1.17,s*9.04,.26,0,M.structure,.032);
      box(rib,'frame_socket_machined_upper_flange',.82,.10,.94,s*9.04,.43,0,M.titanium,.020);
      for(const zz of [-.34,.34])for(const xx of [-.27,.27])bolt(rib,s*9.04+xx,.495,zz,'y',.034);
      polygon(rib,'shoulder_load_doubler',[[s*9.02,3.84],[s*9.18,4.22],[s*8.76,4.90],[s*7.77,5.29],[s*7.72,4.91],[s*8.54,4.42]],.115,M.titanium,0,0,.456,.025);
      for(const p of [[8.88,4.22],[8.61,4.61],[8.21,4.90],[7.96,5.00]])bolt(rib,s*p[0],p[1],.527,'z',.029);
      box(rib,'column_replaceable_impact_pad',.26,1.59,.81,s*8.817,1.56,0,M.rubber,.050);
      box(rib,'column_service_coupling_cover',.31,.40,.25,s*8.85,3.27,.08,M.secondary,.023);
    }
  }
  for(const s of [-1,1]){
    box(g,'longitudinal_ceiling_keel_box',.39,.41,17.2,s*2.79,5.93,-.09,M.structure,.026);
    box(g,'longitudinal_keel_lower_flange',.52,.072,17.21,s*2.79,5.684,-.09,M.titanium,.012);
    for(const z of [-7.11,-4.73,.94,6.79])box(g,'ceiling_keel_load_collar',.57,.51,.16,s*2.79,5.90,z,M.secondary,.020);
  }
}

// Human-scale crashworthy seats, common with the same industrial parts vocabulary.
function bsSeat(parent,name,x,y,z,yaw=0,detailed=false){
  const g=group(parent,name,x,y,z);g.rotation.y=yaw;
  for(const s of [-1,1]){
    box(g,'seat_floor_anchor_shoe',.13,.050,.80,s*.23,.025,-.015,M.structure,.011);
    box(g,'seat_slide_rail',.037,.048,.73,s*.23,.076,-.015,M.titanium,.006);
    box(g,'captured_slide_carriage',.076,.070,.39,s*.23,.13,.023,M.secondary,.009);
    beam(g,'shock_suspension_forward_rocker',[s*.23,.16,-.25],[s*.23,.37,.20],.044,.041,M.titanium,.007);
    beam(g,'shock_suspension_rear_rocker',[s*.23,.16,.20],[s*.23,.37,-.25],.046,.045,M.structure,.007);
    cylinder(g,'rocker_cross_pin',.036,.050,s*.245,.26,-.02,M.titanium,12,.036,[0,0,Math.PI/2]);
    cylinder(g,'seat_damper',.033,.21,s*.14,.235,.04,M.black,12);
    cylinder(g,'damper_piston',.015,.20,s*.14,.33,.04,M.titanium,12);
    for(const zz of [-.34,.29])bolt(g,s*.23,.060,zz,'y',.019);
  }
  box(g,'seat_pan_load_bridge',.58,.068,.49,0,.39,-.025,M.structure,.021);
  polygon(g,'formed_armoured_seat_pan',chamferRect(.69,.64,.11),.075,M.cladding,0,.447,-.074,.017,[-Math.PI/2,0,0]);
  box(g,'seat_upholstery_isolation',.59,.020,.55,0,.493,-.066,M.black,.018);
  box(g,'seat_center_cushion',.390,.113,.542,0,.553,-.062,M.leather,.045);
  for(const s of [-1,1]){
    box(g,'seat_hip_bolster',.091,.122,.531,s*.246,.557,-.062,M.leather,.031);
    box(g,'restraint_retractor',.052,.095,.115,s*.32,.57,.107,M.black,.013);
    box(g,'stowed_restraint_tongue',.040,.052,.024,s*.32,.641,.064,M.titanium,.006);
    beam(g,'hinged_armrest_support',[s*.315,.451,.128],[s*.398,.813,.072],.059,.083,M.structure,.009);
    box(g,'armrest_shell',.151,.083,.55,s*.388,.804,-.119,M.secondary,.032);
    box(g,'forearm_removable_pad',.127,.039,.272,s*.388,.865,.012,M.leather,.018);
    cylinder(g,'armrest_release_pivot',.035,.031,s*.479,.797,.080,M.titanium,12,.035,[0,0,Math.PI/2]);
    cylinder(g,'controller_base_recess',.047,.012,s*.388,.852,-.286,M.black,16);
    cylinder(g,'controller_dust_boot',.030,.062,s*.388,.888,-.286,M.rubber,12);
    box(g,'physical_controller_grip',.055,.097,.075,s*.388,.950,-.275,M.black,.021,[.16,0,0]);
    box(g,'controller_thumb_cap',.060,.023,.061,s*.388,1.006,-.265,M.secondary,.009);
    box(g,'mechanical_trigger',.021,.033,.017,s*.388,.961,-.316,M.copper,.005);
  }
  const back=group(g,'reclining_crash_shell',0,.563,.212);back.rotation.x=.14;
  const outline=[[-.23,0],[-.33,.15],[-.34,.47],[-.27,.67],[-.20,.74],[.20,.74],[.27,.67],[.34,.47],[.33,.15],[.23,0]];
  polygon(back,'seat_back_formed_pressure_shell',outline,.075,M.cladding,0,0,.023,.018);
  polygon(back,'back_cushion_shadow_rebate',outline.map(p=>[p[0]*.87,p[1]*.91+.035]),.030,M.rubber,0,0,-.034,.015);
  box(back,'lower_lumbar_pad',.39,.23,.087,0,.176,-.081,M.leather,.035);
  box(back,'upper_torso_pad',.405,.305,.08,0,.46,-.079,M.leather,.037);
  for(const s of [-1,1]){
    box(back,'lateral_crash_cushion',.082,.486,.10,s*.25,.323,-.049,M.leather,.028,[0,s*.12,s*.016]);
    cylinder(back,'recline_hinge',.043,.037,s*.342,.091,.033,M.titanium,16,.043,[0,0,Math.PI/2]);
    cylinder(back,'headrest_adjustment_post',.013,.20,s*.11,.761,.028,M.titanium,12);
    box(back,'split_headrest_back',.206,.205,.068,s*.11,.85,.012,M.structure,.025);
    box(back,'split_headrest_pad',.182,.177,.083,s*.11,.85,-.047,M.leather,.030);
    box(back,'rear_backbone_wear_strap',.044,.58,.034,s*.17,.351,.094,M.titanium,.008);
  }
  polygon(back,'rear_spine_access_cover',chamferRect(.254,.48,.055,0,.37),.036,M.structure,0,0,.10,.010);
  slotBank(back,0,.24,.126,4,.16,.027,'z');
  tube(back,'rear_seat_egress_handle',[[-.16,.59,.116],[-.15,.72,.15],[.15,.72,.15],[.16,.59,.116]],.015,M.black);
  const foot=group(g,'adjustable_foot_support',0,0,-.76);
  box(foot,'pedal_floor_mount',.51,.043,.50,0,.047,0,M.black,.021);
  for(const s of [-1,1]){
    box(foot,'pedal_adjustment_rail',.039,.032,.45,s*.151,.084,0,M.titanium,.006);
    beam(foot,'pedal_pivot_link',[s*.151,.10,.11],[s*.151,.20,-.10],.065,.052,M.structure,.008);
    cylinder(foot,'pedal_cross_pin',.025,.175,s*.151,.18,-.10,M.titanium,12,.025,[0,0,Math.PI/2]);
    const p=group(foot,'tilted_pedal',s*.151,.229,-.12);p.rotation.x=.53;
    box(p,'forged_pedal_plate',.18,.035,.25,0,0,0,M.secondary,.013);
    box(p,'pedal_traction_insert',.153,.012,.193,0,.027,-.008,M.rubber,.011);
    box(p,'pedal_heel_stop',.176,.04,.025,0,.026,.112,M.structure,.007);
    for(let j=0;j<3;j++)box(p,'pedal_tread_ridge',.141,.007,.008,0,.035,-.066+j*.050,M.titanium,.002);
  }
  tube(g,'protected_seat_power_loom',[[.13,.12,.27],[.24,.18,.36],[.20,.41,.39],[.13,.63,.31]],.018,M.rubber);
  if(detailed){
    for(const s of [-1,1]){
      box(g,'seat_cushion_stitched_seam',.0027,.003,.44,s*.165,.611,-.068,M.stitch,.001);
      box(back,'back_cushion_stitched_seam',.0027,.242,.003,s*.16,.46,-.12,M.stitch,.001);
      box(g,'armrest_manual_release',.017,.028,.065,s*.476,.82,-.115,M.copper,.007);
    }
  }
  g.userData={role:'shock_isolated_operator_seat',floor:[x,y,z],forward:'-Z',cushionHeight:.61};
  return g;
}

function bsCaptainIsland(){
  const g=group(interior,'BATTLESHIP_05_CAPTAIN_OBSERVATION_ISLAND');
  bsSeat(g,'captain_crashworthy_observation_seat',0,.702,-4.37,0,true);
  for(const s of [-1,1]){
    const pod=group(g,s<0?'port_captain_reachable_console':'starboard_captain_reachable_console',s*1.16,.705,-5.39);pod.rotation.y=-s*.10;
    for(const z of [-.57,.53]){
      polygon(pod,'triangulated_console_support_web',[[-.27,0],[.27,0],[.35,.45],[.25,.60],[-.18,.57],[-.29,.34]],.09,M.structure,0,0,z,.021);
      box(pod,'console_deck_foot',.74,.071,.25,0,.028,z,M.secondary,.019);
      for(const x of [-.26,.26])bolt(pod,x,.074,z,'y',.022);
    }
    box(pod,'contained_console_electronics_box',.66,.27,1.27,0,.37,-.02,M.black,.045);
    for(const s2 of [-1,1]){
      const side=group(pod,'removable_console_side_cheek',s2*.392,0,0);side.rotation.y=Math.PI/2;
      frameShape(side,'cast_tapered_console_cheek',[[-.76,.27],[-.68,.59],[.52,.60],[.77,.39],[.64,.16],[-.57,.16]],chamferRect(.78,.223,.041,-.02,.369),.065,M.secondary,0,0,0,.017);
      polygon(side,'recessed_console_service_cover',chamferRect(.745,.195,.039,-.02,.369),.030,M.structure,0,0,s2*.018,.007);
      box(side,'flush_service_handle_recess',.16,.041,.016,-.02,.369,s2*.040,M.black,.006);
      box(side,'flush_service_handle',.12,.015,.020,-.02,.369,s2*.054,M.titanium,.004);
      for(const x of [-.34,.30])bolt(side,x,.369,s2*.053,'z',.014);
    }
    box(pod,'console_top_armour_casting',.81,.125,1.48,0,.578,-.01,M.cladding,.059,[.033,0,0]);
    box(pod,'operator_surface_gasket',.685,.025,1.29,0,.654,-.017,M.rubber,.029,[.033,0,0]);
    for(let j=0;j<2;j++){
      box(pod,'unlabelled_physical_control_tile',.573,.026,.38,0,.679+j*.013,.255-j*.43,M.secondary,.025,[.033,0,0]);
      cylinder(pod,'physical_selector_socket',.048,.015,s*.17,.704+j*.013,.255-j*.43,M.black,16);
      cylinder(pod,'physical_selector_knob',.033,.040,s*.17,.729+j*.013,.255-j*.43,j?M.titanium:M.copper,16);
    }
    box(pod,'wrist_impact_roll',.621,.069,.125,0,.665,.66,M.rubber,.031);
    tube(pod,'restrained_console_umbilical',[[s*.20,.30,-.57],[s*.26,.24,-.70],[s*.28,.07,-.61],[s*.21,.04,-.45]],.027,M.rubber);
    // A low bearing and emitter bar preserve room for the future transparent panel.
    const em=group(pod,'low_articulated_side_display_emitter',0,.692,-.53);
    cylinder(em,'azimuth_bearing_casting',.146,.069,0,0,0,M.structure,24);
    ring(em,'azimuth_bearing_machined_race',.13,.014,0,.037,0,M.titanium);
    for(const x of [-.16,.16]){
      box(em,'low_tilt_trunnion_cheek',.061,.143,.17,x,.099,0,M.secondary,.026);
      cylinder(em,'trunnion_pivot',.048,.027,x*1.26,.126,0,M.titanium,12,.048,[0,0,Math.PI/2]);
    }
    box(em,'replaceable_emitter_bar',.84,.087,.173,0,.175,-.01,M.structure,.031);
    box(em,'dark_optical_emitter_recess',.689,.017,.103,0,.226,-.01,M.black,.014);
    box(em,'inert_emitter_optical_strip',.611,.009,.042,0,.241,-.031,M.lens,.009);
    for(const xx of [-.355,.355])bolt(em,xx,.230,-.006,'y',.016);
    const a=group(em,s<0?'EMPTY_PORT_HOLOGRAPHIC_PANEL':'EMPTY_STARBOARD_HOLOGRAPHIC_PANEL',0,.565,-.024);a.userData={role:'future_transparent_side_panel',dimensions:[.87,.56,.02],empty:true};
  }
  bsCaptainDisc(g);
  bsUpperTacticalMount();
}

function bsCaptainDisc(parent){
  const g=group(parent,'low_central_tactical_projector_base',0,.702,-6.85);
  const profile=[[0,.03],[.36,.03],[.43,.06],[.44,.13],[.34,.18],[.33,.22],[.47,.30],[.65,.35],[.70,.40],[.71,.446],[.67,.475],[0,.475]];
  mesh(g,'spun_armoured_projector_housing',new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),56),M.structure);
  cylinder(g,'projector_isolation_drum',.33,.16,0,.16,0,M.rubber,32);
  ring(g,'projector_lower_housing_seal',.421,.011,0,.13,0,M.black);
  ring(g,'projector_cover_seam',.700,.009,0,.432,0,M.black);
  ring(g,'projector_machined_outer_retainer',.657,.016,0,.482,0,M.titanium);
  cylinder(g,'recessed_optical_carrier_plate',.632,.016,0,.479,0,M.black,64);
  cylinder(g,'unpowered_optical_disc',.524,.012,0,.491,0,M.lens,64);
  ring(g,'inner_optical_disc_clamp',.522,.008,0,.5,0,M.titanium);
  cylinder(g,'central_ceramic_service_cap',.186,.009,0,.498,0,M.black,40);
  for(let k=0;k<12;k++){
    const a=k*Math.PI/6,c=Math.cos(a),s=Math.sin(a),p=group(g,'replaceable_radial_optical_cartridge',c*.59,.490,s*.59);p.rotation.y=-a;
    box(p,'optical_cartridge_cast_cover',.088,.027,.116,0,0,0,M.secondary,.011);
    box(p,'recessed_cartridge_lens',.030,.012,.075,0,.022,0,M.lens,.005);
    bolt(g,c*.678,.484,s*.678,'y',.014);
    if(k%3===0)box(p,'mechanical_index_tab',.023,.013,.018,-.03,.019,.054,M.copper,.004);
  }
  for(let k=0;k<4;k++){
    const a=Math.PI*.25+k*Math.PI*.5,c=Math.cos(a),s=Math.sin(a);
    beam(g,'projector_deck_attachment_arm',[c*.27,.09,s*.27],[c*.51,.068,s*.51],.109,.12,M.secondary,.017);
    box(g,'projector_floor_spreader',.20,.048,.20,c*.51,.052,s*.51,M.titanium,.014,[0,-a,0]);
    bolt(g,c*.51,.083,s*.51,'y',.023);
  }
  for(let k=0;k<18;k++){
    const a=k*Math.PI*2/18;
    box(g,'undercut_cooling_fin',.128,.040,.023,Math.cos(a)*.542,.325,Math.sin(a)*.542,M.titanium,.004,[0,-a,0]);
  }
  const a=group(g,'EMPTY_CENTRAL_TACTICAL_VOLUME',0,.53,0);a.userData={role:'future_low_circular_hologram',dimensions:[1.06,.65,1.06],empty:true};
}

function bsUpperTacticalMount(){
  const g=group(interior,'BATTLESHIP_06_HIGH_TACTICAL_SCREEN_HOUSING');
  // Bottom edge is 49 degrees above the captain's forward gaze, clear of combat view.
  for(const s of [-1,1]){
    beam(g,'roof_suspension_cross_tie',[s*2.79,5.79,-6.85],[s*1.34,5.79,-6.85],.15,.25,M.structure,.021);
    beam(g,'tactical_screen_suspension',[s*1.34,5.80,-6.85],[s*1.34,5.34,-6.85],.135,.175,M.secondary,.018);
    box(g,'roof_suspension_foot',.42,.14,.46,s*2.79,5.75,-6.85,M.secondary,.019);
    cylinder(g,'screen_pitch_lock',.092,.15,s*1.51,5.13,-6.85,M.titanium,20,.092,[0,0,Math.PI/2]);
    tube(g,'shielded_overhead_screen_cable',[[s*1.28,5.79,-6.85],[s*1.20,5.58,-7.03],[s*1.22,5.19,-7.00],[s*1.31,5.03,-6.89]],.027,M.rubber);
  }
  const sc=group(g,'blank_tactical_enclosure',0,4.97,-6.85);sc.rotation.x=.13;
  frameShape(sc,'tactical_screen_deep_cast_shell',chamferRect(3.06,.90,.145),chamferRect(2.73,.622,.090),.24,M.structure,0,0,0,.026);
  frameShape(sc,'screen_inner_machined_bezel',chamferRect(2.84,.72,.105),chamferRect(2.713,.60,.083),.056,M.titanium,0,0,.144,.010);
  frameShape(sc,'screen_elastomer_seal',chamferRect(2.72,.607,.089),chamferRect(2.66,.55,.074),.018,M.rubber,0,0,.177,.004);
  polygon(sc,'unpowered_screen_inner_backplate',chamferRect(2.76,.65,.090),.04,M.black,0,0,-.078,.011);
  for(const x of [-1.39,1.39])for(const y of [-.276,.276])bolt(sc,x,y,.192,'z',.024);
  for(let j=0;j<6;j++)box(sc,'rear_screen_heat_sink',2.44,.026,.066,0,-.225+j*.09,-.162,M.secondary,.007);
  for(const x of [-1.20,1.20])box(sc,'screen_release_latch',.09,.069,.066,x,-.452,.011,M.copper,.010);
  const a=group(sc,'EMPTY_OVERHEAD_TACTICAL_SCREEN',0,0,.162);a.userData={role:'future_overhead_tactical_screen',dimensions:[2.66,.55,.02],empty:true};
}

function bsCrewConsole(parent,name,x,z,yaw=0){
  const g=group(parent,name,x,.15,z);g.rotation.y=yaw;
  for(const s of [-1,1]){
    polygon(g,'load_bearing_console_side_casting',[[-.66,.08],[.40,.08],[.66,.64],[.45,.98],[-.62,.98],[-.77,.74]],.103,M.structure,s*.77,0,0,.028,[0,Math.PI/2,0]);
    box(g,'console_floor_attachment',.25,.084,1.32,s*.77,.06,-.01,M.secondary,.021);
    for(const zz of [-.47,.48])bolt(g,s*.77,.114,zz,'y',.025);
  }
  box(g,'rear_electronics_enclosure',1.49,.56,.44,0,.531,-.49,M.structure,.034);
  box(g,'rear_removable_vent_cover',1.27,.338,.041,0,.547,-.735,M.secondary,.025);
  slotBank(g,0,.547,-.761,5,.98,.052,'z');
  box(g,'operator_desk_casting',1.70,.148,1.17,0,.92,-.028,M.cladding,.057,[-.13,0,0]);
  box(g,'desk_equipment_gasket',1.44,.030,.88,0,1.016,-.09,M.rubber,.027,[-.13,0,0]);
  box(g,'unpowered_low_display_cover',1.27,.027,.64,0,1.035,-.115,M.black,.021,[-.13,0,0]);
  box(g,'inert_display_laminate',1.16,.010,.533,0,1.055,-.123,M.lens,.019,[-.13,0,0]);
  for(const s of [-1,1])box(g,'desk_protective_wrist_pad',.156,.058,.48,s*.72,1.024,.17,M.rubber,.024,[-.13,0,0]);
  for(let j=0;j<4;j++){
    cylinder(g,'control_selector_socket',.047,.013,-.44+j*.29,1.012,.43,M.black,12);
    cylinder(g,'physical_rotary_selector',.034,.034,-.44+j*.29,1.037,.43,j===3?M.copper:M.titanium,12);
  }
  for(const s of [-1,1]){
    const b=group(g,'display_mast_trunnion',s*.65,1.02,-.475);
    cylinder(b,'tilt_axis_boss',.048,.058,0,.11,0,M.titanium,12,.048,[0,0,Math.PI/2]);
    beam(b,'blank_auxiliary_screen_support',[0,.015,0],[0,.37,-.11],.073,.098,M.secondary,.011);
  }
  const screen=group(g,'blank_operator_screen_housing',0,1.46,-.595);screen.rotation.x=-.15;
  frameShape(screen,'operator_screen_frame',chamferRect(1.47,.54,.085),chamferRect(1.27,.35,.05),.13,M.structure,0,0,0,.018);
  frameShape(screen,'screen_inner_gasket',chamferRect(1.30,.38,.06),chamferRect(1.24,.32,.042),.024,M.rubber,0,0,.081,.004);
  polygon(screen,'blank_screen_backplate',chamferRect(1.28,.36,.055),.027,M.black,0,0,-.050,.010);
  const a=group(screen,'EMPTY_'+name.toUpperCase()+'_DISPLAY',0,0,.069);a.userData={role:'future_battle_operator_display',dimensions:[1.24,.32,.02],empty:true};
  tube(g,'console_power_and_cooling_loom',[[.59,.69,-.64],[.82,.50,-.73],[.73,.17,-.57],[.53,.09,-.52]],.033,M.rubber);
  return g;
}

function bsBattleStations(){
  const g=group(interior,'BATTLESHIP_07_LOWER_BATTLE_CONTROL_BAYS');
  for(const s of [-1,1]){
    const names=s<0?['port_gunnery','port_damage_control']:['starboard_navigation','starboard_defence'];
    for(let j=0;j<2;j++){
      const z=-1.70+j*4.33,x=s*4.98,yaw=-s*.075;
      bsCrewConsole(g,names[j],x,z,yaw);
      bsSeat(g,names[j]+'_seat',x,.155,z+1.13,yaw,j===0);
      // A low coaming carries work lights and shields adjacent chair lanes.
      const coam=group(g,names[j]+'_protective_coaming',x,0,z-.96);
      box(coam,'lower_bay_armoured_splash_coaming',2.56,.72,.26,0,.505,0,M.structure,.045);
      box(coam,'coaming_upper_impact_cap',2.63,.097,.34,0,.913,0,M.secondary,.032);
      for(const xx of [-1.11,1.11])box(coam,'coaming_load_shoe',.30,.16,.58,xx,.22,.06,M.titanium,.017);
      box(coam,'coaming_service_access',1.91,.31,.030,0,.528,.15,M.secondary,.021);
      for(const xx of [-.81,.81])bolt(coam,xx,.53,.175,'z',.021);
    }
    for(const z of [-4.05,.80,5.96]){
      const rack=group(g,'side_wall_mission_service_rack',s*8.88,.20,z);rack.rotation.y=-s*Math.PI/2;
      box(rack,'rack_pressure_wall_attachment',2.12,2.05,.17,0,1.19,-.175,M.structure,.028);
      for(const xx of [-.98,.98]){
        box(rack,'rack_machined_vertical_mounting_rail',.070,2.12,.40,xx,1.20,.024,M.titanium,.011);
        box(rack,'rack_deck_mounting_shoe',.30,.14,.67,xx,.10,.035,M.secondary,.016);
      }
      for(let j=0;j<3;j++){
        const y=.48+j*.60;
        box(rack,'service_cartridge_isolation_seal',1.88,.553,.31,0,y,.075,M.black,.024);
        box(rack,'swappable_system_cartridge',1.76,.504,.37,0,y,.14,j===1?M.cladding:M.secondary,.034);
        box(rack,'front_thermal_service_inset',1.38,.325,.024,-.05,y,.338,M.black,.018);
        slotBank(rack,-.20,y,.363,5,.91,.046,'z');
        for(const xx of [-.80,.80])bolt(rack,xx,y,.346,'z',.022);
        box(rack,'quarter_turn_cartridge_release',.071,.154,.042,.71,y,.361,M.copper,.008);
      }
      box(rack,'rack_task_light_casing',1.60,.109,.30,0,2.38,.12,M.structure,.022);
      box(rack,'rack_task_light_frosted_lens',1.39,.020,.19,0,2.315,.14,M.whiteLight,.011);
      const a=group(rack,'EMPTY_'+(s<0?'PORT':'STARBOARD')+'_SERVICE_'+Math.round((z+5)*10)+'_DISPLAY',0,2.11,.37);a.userData={role:'future_maintenance_display',dimensions:[.25,.09,.02],empty:true};
    }
  }
  // Aft of the captain a restrained planning surface serves standing officers.
  const table=group(g,'aft_standing_damage_coordination_table',0,.699,2.55);
  for(const z of [-.63,.63]){
    polygon(table,'table_pedestal_gusset',[[-.50,.06],[.50,.06],[.38,.49],[.76,.63],[-.76,.63],[-.38,.49]],.19,M.structure,0,0,z,.028);
    box(table,'table_floor_spreader',1.14,.10,.43,0,.05,z,M.secondary,.029);
    for(const x of [-.40,.40])bolt(table,x,.113,z,'y',.024);
  }
  box(table,'standing_table_equipment_tray',1.75,.22,1.75,0,.65,0,M.structure,.085);
  box(table,'table_wear_edge',1.87,.12,1.85,0,.805,0,M.cladding,.076);
  box(table,'table_blank_insert_seal',1.61,.035,1.55,0,.885,0,M.rubber,.041);
  box(table,'table_unpowered_physical_surface',1.47,.019,1.39,0,.911,0,M.black,.030);
  for(const s of [-1,1])tube(table,'table_protective_handgrip',[[s*.82,.90,-.63],[s*.90,1.00,-.53],[s*.90,1.00,.53],[s*.82,.90,.63]],.025,M.titanium);
  const a=group(table,'EMPTY_AFT_DAMAGE_COORDINATION_SURFACE',0,.93,0);a.userData={role:'future_standing_coordination_display',dimensions:[1.45,.01,1.37],empty:true};
}

function bsAftSystems(){
  const g=group(interior,'BATTLESHIP_08_AFT_BLAST_DOOR_AND_SERVICE_CORE');
  // The door is a full pressure assembly, not a decal on the wall.
  const d=group(g,'central_twin_leaf_blast_door',0,0,8.835);d.rotation.y=Math.PI;
  frameShape(d,'deep_pressure_door_socket',chamferRect(3.46,3.99,.31,0,2.12),chamferRect(2.65,3.40,.23,0,1.99),.38,M.secondary,0,0,0,.040);
  frameShape(d,'door_machined_compression_frame',chamferRect(2.90,3.62,.26,0,2.0),chamferRect(2.64,3.40,.215,0,1.99),.102,M.titanium,0,0,.245,.016);
  frameShape(d,'door_continuous_elastomer_seal',chamferRect(2.66,3.415,.218,0,1.99),chamferRect(2.565,3.32,.193,0,1.99),.041,M.rubber,0,0,.285,.008);
  for(const s of [-1,1]){
    const pts=s<0?[[-1.275,.50],[-1.04,.325],[-.016,.325],[-.016,3.650],[-1.04,3.65],[-1.275,3.43]]:[[.016,.325],[1.04,.325],[1.275,.50],[1.275,3.43],[1.04,3.65],[.016,3.65]];
    polygon(d,'closed_armoured_door_leaf',pts,.175,M.cladding,0,0,.153,.029);
    polygon(d,'door_leaf_recessed_inner_armour',chamferRect(.963,2.87,.16,s*.647,1.99),.073,M.secondary,0,0,.273,.016);
    box(d,'door_central_locking_edge',.148,3.04,.115,s*.134,1.99,.323,M.structure,.025);
    for(const y of [1.01,1.99,2.97]){
      box(d,'door_shear_lock_recess',.20,.18,.021,s*.92,y,.321,M.black,.019);
      cylinder(d,'door_lock_cam',.061,.042,s*.92,y,.354,M.titanium,12,.061,[Math.PI/2,0,0]);
      box(d,'door_cam_keeper',.026,.094,.032,s*.92,y,.385,M.structure,.005);
    }
    box(d,'jamb_actuator_recess',.239,1.19,.041,s*1.48,2.07,.273,M.black,.030);
    box(d,'jamb_actuator_upper_casing',.18,.32,.14,s*1.48,2.46,.328,M.structure,.023);
    box(d,'jamb_actuator_lower_casing',.18,.28,.14,s*1.48,1.68,.328,M.secondary,.023);
    cylinder(d,'exposed_compression_lock_piston',.043,.47,s*1.48,2.08,.354,M.titanium,14);
    cylinder(d,'lock_actuator_safety_collar',.061,.082,s*1.48,1.86,.354,M.copper,14);
    for(const y of [.67,3.49])bolt(d,s*1.47,y,.306,'z',.030);
    box(d,'recessed_emergency_unlock_socket',.23,.31,.069,s*1.48,.98,.295,M.black,.026);
    cylinder(d,'emergency_unlock_connector',.069,.046,s*1.48,1.015,.349,M.titanium,12,.069,[Math.PI/2,0,0]);
    box(d,'emergency_unlock_socket_grip',.019,.069,.030,s*1.48,1.015,.384,M.secondary,.005);
  }
  box(d,'closed_door_central_seal',.021,3.27,.044,0,1.99,.233,M.rubber,.005);
  box(d,'overhead_door_drive_cassette',2.70,.27,.33,0,3.91,.133,M.structure,.033);
  box(d,'drive_cassette_access_panel',2.29,.13,.038,0,3.91,.324,M.secondary,.016);
  for(const x of [-1.06,1.06])bolt(d,x,3.91,.351,'z',.024);
  box(d,'door_threshold_machined_plate',2.59,.087,.69,0,.222,.045,M.titanium,.019);
  for(const s of [-1,1]){
    const x=s*4.82,r=group(g,'aft_power_and_environmental_service_bank',x,.125,8.62);r.rotation.y=Math.PI;
    box(r,'service_bank_cradle',4.71,.30,.67,0,.21,.014,M.structure,.030);
    for(const xx of [-1.16,1.16]){
      box(r,'cabinet_isolation_gasket',2.11,2.81,.29,xx,1.83,-.033,M.black,.036);
      box(r,'cabinet_pressure_case',2.00,2.73,.41,xx,1.83,.049,M.secondary,.041);
      polygon(r,'large_removable_service_door',chamferRect(1.80,2.47,.13),.079,M.cladding,xx,1.84,.298,.024);
      box(r,'cabinet_upper_inset_panel',1.44,.69,.049,xx,2.63,.361,M.secondary,.024);
      box(r,'cabinet_lower_heat_exchanger_recess',1.45,.49,.027,xx,.95,.359,M.black,.018);
      slotBank(r,xx,.95,.389,6,1.23,.062,'z');
      box(r,'manual_disconnect_pocket',.25,.43,.052,xx-.57,1.79,.378,M.black,.030);
      cylinder(r,'manual_disconnect_pivot',.065,.041,xx-.57,1.79,.415,M.titanium,12,.065,[Math.PI/2,0,0]);
      box(r,'manual_disconnect_lever',.045,.224,.047,xx-.57,1.79,.451,M.copper,.012,[0,0,.29]);
      for(const yy of [1.21,2.61]){
        box(r,'retained_service_door_hinge',.10,.184,.12,xx+.86,yy,.376,M.structure,.015);
        cylinder(r,'service_hinge_axis',.020,.204,xx+.86,yy,.386,M.titanium,10);
      }
      box(r,'cabinet_flush_handle_well',.091,.29,.043,xx+.67,1.80,.365,M.black,.013);
      box(r,'cabinet_flush_pull',.023,.204,.039,xx+.67,1.80,.397,M.titanium,.007);
      for(const dx of [-.61,.61])for(const yy of [2.38,2.88])bolt(r,xx+dx,yy,.400,'z',.018);
    }
    // A genuine fluid connection chase is placed between the pair of cabinets.
    for(const xx of [-.055,.055]){
      cylinder(r,'vertical_thermal_control_pipe',.028,2.58,xx,1.89,.08,M.titanium,10);
      for(const y of [.81,2.89])cylinder(r,'pipe_union',.042,.096,xx,y,.08,M.secondary,10);
    }
    for(const y of [1.17,2.52])box(r,'paired_pipe_support_clamp',.24,.075,.071,0,y,.129,M.secondary,.009);
    box(r,'service_bank_tasklight_hood',4.49,.169,.38,0,3.45,.16,M.structure,.029);
    box(r,'service_bank_tasklight_lens',4.14,.026,.247,0,3.344,.192,M.whiteLight,.012);
  }
  box(g,'aft_crown_distribution_backing',14.4,.47,.41,0,5.24,8.85,M.black,.036);
  box(g,'aft_crown_distribution_pressure_cover',14.07,.36,.48,0,5.24,8.735,M.secondary,.032);
  for(const x of [-6.40,-3.2,0,3.2,6.40])box(g,'distribution_cover_section_clamp',.112,.43,.56,x,5.24,8.72,M.structure,.015);
  for(const s of [-1,1]){
    tube(g,'aft_cooled_equipment_return_pipe',[[s*7.50,.64,8.47],[s*7.76,1.00,8.42],[s*7.76,4.62,8.42],[s*7.20,5.18,8.54]],.065,M.secondary);
    for(const y of [1.58,3.63])box(g,'return_pipe_wall_saddle',.27,.11,.23,s*7.76,y,8.44,M.titanium,.016);
    const hh=group(g,'aft_aisle_emergency_handhold',s*8.38,1.48,8.72);
    box(hh,'handhold_upper_wall_shoe',.25,.14,.16,0,.50,0,M.secondary,.012);
    box(hh,'handhold_lower_wall_shoe',.25,.14,.16,0,-.50,0,M.secondary,.012);
    tube(hh,'egress_assist_handle',[[0,-.50,0],[0,-.40,-.32],[0,.40,-.32],[0,.50,0]],.035,M.titanium);
  }
}

function bsPracticalFixtures(){
  const g=group(interior,'BATTLESHIP_09_PRACTICAL_LUMINAIRES');
  for(const s of [-1,1])for(const z of [-5.71,-.13,5.22]){
    const f=group(g,'recessed_baffled_overhead_worklight',s*5.70,6.08,z);
    box(f,'deep_luminaire_recess',.86,.21,2.12,0,0,0,M.black,.042);
    box(f,'luminaire_serviceable_outer_bezel',.73,.11,1.97,0,-.087,0,M.titanium,.027);
    box(f,'practical_frosted_diffuser',.60,.028,1.78,0,-.16,0,M.whiteLight,.019);
    for(const zz of [-.55,0,.55])box(f,'luminaire_glare_control_baffle',.67,.076,.038,0,-.196,zz,M.structure,.006);
  }
  for(const s of [-1,1]){
    // Dedicated task fixtures illuminate the captain's controls without neon edges.
    const f=group(g,'captain_shielded_task_fixture',s*2.05,3.65,-4.35);
    beam(f,'task_light_cantilever',[0,-2.83,.22],[0,-.02,.195],.059,.075,M.structure,.010);
    box(g,'task_light_deck_mount',.19,.105,.28,s*2.05,.775,-4.13,M.secondary,.016);
    box(f,'task_light_head',.30,.096,.47,0,0,0,M.structure,.024);
    box(f,'task_light_inset_diffuser',.212,.018,.34,0,-.063,0,M.whiteLight,.014);
    box(g,'door_emergency_lamp_cage',.23,.39,.21,s*1.96,3.45,8.62,M.structure,.024);
    box(g,'door_emergency_lamp_red_lens',.113,.266,.037,s*1.96,3.45,8.493,M.redLight,.017);
    for(const y of [3.37,3.53])box(g,'door_lamp_impact_guard',.21,.025,.032,s*1.96,y,8.467,M.titanium,.006);
    for(const z of [-3.0,1.55,5.37]){
      box(g,'low_service_aisle_light_well',.093,.17,.44,s*9.22,.63,z,M.black,.014);
      box(g,'low_service_aisle_light_diffuser',.025,.054,.29,s*9.159,.63,z,M.whiteLight,.008);
    }
    box(g,'brow_indirect_luminaire_hood',3.45,.20,.26,s*4.41,5.98,-8.46,M.structure,.025);
    box(g,'brow_indirect_luminaire_diffuser',3.19,.027,.15,s*4.41,5.855,-8.435,M.whiteLight,.012);
  }
}

function buildCraftLights(lights){
  const hemi=new T.HemisphereLight(0xd0dce0,0x555247,.92);hemi.name='BASTION_soft_reflected_worklight';lights.add(hemi);
  const base=new T.AmbientLight(0x97a8ad,.10);base.name='BASTION_shadow_detail_fill';lights.add(base);
  function spot(name,color,power,position,target,shadow=false,angle=.98){
    const l=new T.SpotLight(color,power,24,angle,.80,1.55);l.name=name;l.position.fromArray(position);l.target.position.fromArray(target);lights.add(l,l.target);
    if(shadow){l.castShadow=true;l.shadow.mapSize.set(1536,1536);l.shadow.camera.near=.3;l.shadow.camera.far=23;l.shadow.bias=-.00014;l.shadow.normalBias=.025;l.shadow.radius=3;}
    return l;
  }
  for(const s of [-1,1]){
    spot('forward_practical_overhead_light_'+s,0xe2e9df,123,[s*5.70,5.85,-5.71],[s*3.5,.4,-5.20],s<0);
    spot('mid_practical_overhead_light_'+s,s<0?0xdde7e5:0xcbdde2,142,[s*5.70,5.85,-.13],[s*4.1,.6,.4],s>0);
    spot('aft_practical_overhead_light_'+s,0xe1e5db,117,[s*5.70,5.85,5.22],[s*3.9,1.0,5.32]);
    spot('captain_task_light_'+s,0xdce8e4,12,[s*2.05,3.48,-4.35],[s*.94,1.14,-5.54],false,.78);
    spot('aft_service_bank_practical_'+s,0xe1e7df,24,[s*4.82,3.45,8.26],[s*4.82,1.32,7.10],false,1.10);
    const marker=new T.PointLight(0xd14124,.60,2.1,2);marker.name='door_emergency_marker_'+s;marker.position.set(s*1.96,3.45,8.38);lights.add(marker);
  }
  const f=new T.PointLight(0xb1cbd3,10.5,13,1.5);f.name='forward_brow_indirect_bounce';f.position.set(0,5.65,-8.12);lights.add(f);
  const c=new T.PointLight(0xd6e0de,16,12,1.6);c.name='central_ceiling_indirect_bounce';c.position.set(0,5.28,.1);lights.add(c);
}



return {craft:CRAFT,build:buildCraft,light:buildCraftLights};
}
