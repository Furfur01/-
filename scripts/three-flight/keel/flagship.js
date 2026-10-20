import {createFamilyInterior} from './family-common.js';

// Imported user-supplied KEEL_Flagship_Interior.html; modelling only.
export const createFlagshipInterior=options=>createFamilyInterior(buildModel,options);
function buildModel({T,interior,M,group,box,polygon,deckPoly,beam,cylinder,ring,tube,bolt,slotBank,frameShape,chamferRect}){
const CRAFT={
  id:'FLAGSHIP',title:'KEEL · 舰队旗舰指挥舰桥',
  dimensions:{width:26,length:25,height:8},
  eye:[0,3.08,-4.8],fov:70,pitch:0,exposure:1.06,moveSpeed:1.7,
  bounds:{min:[-12.65,.20,-11.65],max:[12.65,7.50,12.60]},
  views:[
    {name:'后部全景',position:[7.8,5.7,10.4],target:[0,1.9,-4.5]},
    {name:'前部回看',position:[-7.4,3.6,-10.5],target:[0,2.5,4]},
    {name:'指挥设备近景',position:[2.45,2.90,-6.1],target:[.1,2.2,-4.45]},
    {name:'协同指挥工作区',position:[-10.1,3.3,5.7],target:[-4.4,2.05,1.3]}
  ]
};

function buildCraft(){
  const architecture=group(interior,'01_FLAGSHIP_PRESSURE_HULL_AND_PANORAMA');
  const floor=group(interior,'02_FLAGSHIP_THREE_LEVEL_DECK_AND_CIRCULATION');
  const roof=group(interior,'03_FLAGSHIP_LOAD_ARCHES_AND_OVERHEAD_SERVICES');
  const command=group(interior,'04_FLAGSHIP_FORWARD_COMMAND_PROMONTORY');
  const navigation=group(interior,'05_FLAGSHIP_LOWER_NAVIGATION_AND_HELM');
  const collaboration=group(interior,'06_FLAGSHIP_COORDINATION_WORKSTATIONS');
  const liaison=group(interior,'07_FLAGSHIP_AFT_LIAISON_AND_CROSSING');
  const aft=group(interior,'08_FLAGSHIP_AFT_BULKHEAD_AND_ACCESS_LOCKS');
  const fixtures=group(interior,'09_FLAGSHIP_PRACTICAL_LIGHT_FIXTURES');

  // Local builders use the shared KEEL geometrical tools and material palette.
  function anchor(parent,name,p,size,role,rotation=[0,0,0]){
    const a=group(parent,'EMPTY_'+name,...p);a.rotation.set(...rotation);
    a.userData={role,dimensions:size,units:'m',forward:'-Z',empty:true};return a;
  }
  function horizontalPanel(parent,name,w,d,x,y,z,mat=M.floor){
    box(parent,name+'_gasket',w+.035,.033,d+.035,x,y-.022,z,M.black,.022);
    const b=box(parent,name,w,.045,d,x,y,z,mat,.025);
    return b;
  }
  function handrail(parent,name,a,b,height=1.03){
    const span=new T.Vector3(...a).distanceTo(new T.Vector3(...b));
    const count=Math.max(1,Math.ceil(span/2.35));
    for(let i=0;i<=count;i++){
      const t=i/count,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,z=a[2]+(b[2]-a[2])*t;
      box(parent,name+'_anchored_foot',.17,.055,.20,x,y+.03,z,M.black,.013);
      beam(parent,name+'_post',[x,y+.07,z],[x,y+height-.05,z],.055,.07,M.secondary,.011);
      bolt(parent,x+.053,y+.064,z+.04);bolt(parent,x-.053,y+.064,z-.04);
    }
    beam(parent,name+'_titanium_handgrip',[a[0],a[1]+height,a[2]],[b[0],b[1]+height,b[2]],.07,.082,M.titanium,.027);
    beam(parent,name+'_mid_guard',[a[0],a[1]+.43,a[2]],[b[0],b[1]+.43,b[2]],.033,.043,M.secondary,.009);
  }
  function accessPanel(parent,name,w,h,x,y,z,ry=0){
    const g=group(parent,name,x,y,z);g.rotation.y=ry;
    polygon(g,'flush_composite_seal',chamferRect(w,h,.09),.021,M.black,0,0,0,.009);
    polygon(g,'replaceable_armour_access_cover',chamferRect(w-.045,h-.045,.08),.028,M.cladding,0,0,.022,.014);
    box(g,'recessed_latch_socket',.17,.048,.012,0,h*.34,.045,M.black,.008);
    box(g,'folded_captive_pull',.103,.017,.012,0,h*.34,.056,M.titanium,.004);
    for(const s of [-1,1])for(const t of [-1,1])bolt(g,s*(w*.5-.10),t*(h*.5-.105),.044,'z',.016);
    return g;
  }
  function blankDisplay(parent,name,w,h,p,rotation=[0,0,0]){
    const g=group(parent,name,...p);g.rotation.set(...rotation);
    const shape=chamferRect(w,h,.10),inside=chamferRect(w-.13,h-.13,.065);
    frameShape(g,'machined_display_cassette',shape,inside,.095,M.structure,0,0,0,.015);
    frameShape(g,'replaceable_inner_seal',chamferRect(w-.10,h-.10,.072),chamferRect(w-.15,h-.15,.055),.029,M.rubber,0,0,.052,.006);
    // The aperture is actually empty; content can be attached at the named node.
    anchor(g,name+'_SURFACE',[0,0,.054],[w-.17,h-.17,0],'blank display aperture');
    for(const s of [-1,1])for(const t of [-1,1])bolt(g,s*(w*.5-.049),t*(h*.5-.05),.058,'z',.011);
    box(g,'bottom_connector_housing',w*.43,.07,.13,0,-h*.5-.008,-.012,M.secondary,.015);
    return g;
  }
  function chair(parent,name,x,y,z,ry=0,detail=true){
    const g=group(parent,name,x,y,z);g.rotation.y=ry;
    g.userData={role:'crashworthy seated workstation',seatHeight:.53,eyeHeight:1.58};
    for(const s of [-1,1]){
      box(g,'anchoring_shoe',.095,.045,.79,s*.24,.025,0,M.black,.012);
      box(g,'captured_slide_rail',.036,.038,.68,s*.24,.067,0,M.titanium,.007);
      box(g,'slide_carriage',.070,.057,.41,s*.24,.11,.04,M.structure,.009);
      for(const zz of [-.31,.31])bolt(g,s*.24,.052,zz,'y',.018);
      beam(g,'suspension_forward_rocker',[s*.24,.125,-.23],[s*.24,.33,.20],.040,.045,M.titanium,.008);
      beam(g,'suspension_aft_rocker',[s*.24,.125,.21],[s*.24,.33,-.22],.05,.042,M.structure,.007);
      cylinder(g,'scissor_pivot',.033,.040,s*.269,.23,-.015,M.titanium,12,.033,[0,0,Math.PI/2]);
      beam(g,'shock_absorber',[s*.15,.14,.12],[s*.15,.32,-.075],.055,.055,M.black,.013);
    }
    box(g,'suspended_seat_pan',.67,.115,.65,0,.388,-.038,M.cladding,.044);
    box(g,'cushion_isolating_gasket',.61,.025,.60,0,.452,-.042,M.black,.025);
    box(g,'central_seat_cushion',.39,.103,.565,0,.510,-.058,M.leather,.038);
    for(const s of [-1,1])box(g,'raised_thigh_bolster',.10,.13,.545,s*.249,.510,-.035,M.leather,.034);
    const back=group(g,'RECLINING_BACK_ASSEMBLY',0,.49,.218);back.rotation.x=.14;
    polygon(back,'contoured_crash_shell',[[-.27,0],[-.33,.15],[-.315,.47],[-.24,.76],[.24,.76],[.315,.47],[.33,.15],[.27,0]],.078,M.cladding,0,0,.016,.027);
    box(back,'lumbar_pad',.44,.22,.105,0,.18,-.049,M.leather,.046);
    box(back,'scapular_pad',.40,.33,.094,0,.48,-.048,M.leather,.043);
    for(const s of [-1,1]){
      box(back,'lateral_back_pad',.085,.49,.103,s*.257,.33,-.046,M.leather,.025);
      cylinder(back,'backrest_recline_pivot',.047,.030,s*.33,.07,.017,M.titanium,16,.047,[0,0,Math.PI/2]);
      beam(back,'headrest_stalk',[s*.12,.66,.029],[s*.12,.86,.029],.022,.023,M.titanium,.005);
      box(back,'split_headrest_shell',.19,.21,.091,s*.103,.85,.027,M.structure,.029);
      box(back,'split_headrest_pad',.172,.178,.066,s*.103,.85,-.035,M.leather,.033);
      box(back,'stowed_shoulder_webbing',.042,.38,.014,s*.19,.43,-.112,M.rubber,.008,[0,0,s*.15]);
      box(g,'hip_restraint_retractor',.052,.075,.09,s*.30,.50,.13,M.black,.014);
      box(g,'stowed_restraint_tongue',.038,.043,.018,s*.302,.526,.076,M.titanium,.004);
      beam(g,'armrest_rear_link',[s*.29,.40,.15],[s*.395,.77,.09],.062,.096,M.structure,.014);
      beam(g,'armrest_front_link',[s*.30,.43,-.26],[s*.395,.74,-.26],.035,.050,M.titanium,.010);
      cylinder(g,'folding_armrest_pin',.033,.035,s*.421,.745,.08,M.titanium,12,.033,[0,0,Math.PI/2]);
      box(g,'armrest_cast_shell',.15,.075,.60,s*.398,.785,-.12,M.structure,.024);
      box(g,'forearm_cushion',.13,.040,.32,s*.398,.841,-.020,M.leather,.020);
      box(g,'physical_controller_pedestal',.117,.05,.16,s*.398,.827,-.31,M.secondary,.017);
      cylinder(g,'controller_bellows',.034,.055,s*.398,.88,-.31,M.rubber,12,.041);
      box(g,'controller_grip',.044,.083,.070,s*.398,.93,-.307,M.rubber,.016,[.12,0,0]);
      if(detail){
        box(back,'cushion_edge_stitch',.003,.245,.003,s*.164,.45,-.098,M.stitch,.001);
        box(g,'seat_seam',.003,.003,.40,s*.175,.563,-.04,M.stitch,.001);
      }
    }
    polygon(back,'rear_spinal_service_cover',chamferRect(.27,.55,.06),.042,M.structure,0,.34,.083,.013);
    slotBank(back,0,.33,.111,4,.135,.029);
    tube(back,'rear_egress_handle',[[-.17,.68,.09],[-.16,.76,.13],[.16,.76,.13],[.17,.68,.09]],.017,M.black);
    box(g,'feet_non_slip_mat',.64,.026,.54,0,.025,-.77,M.rubber,.025);
    for(const s of [-1,1]){
      beam(g,'pedal_adjustment_rail',[s*.17,.055,-.56],[s*.17,.055,-.94],.029,.031,M.titanium,.005);
      box(g,'pivoted_footplate',.21,.035,.28,s*.17,.13,-.86,M.secondary,.015,[.40,0,0]);
      for(let k=0;k<3;k++)box(g,'pedal_traction_rib',.16,.007,.013,s*.17,.17+k*.025,-.94+k*.045,M.rubber,.003,[.40,0,0]);
    }
    return g;
  }
  function workDesk(parent,name,x,y,z,ry=0,double=false){
    const g=group(parent,name,x,y,z);g.rotation.y=ry;const w=double?2.7:1.62;
    for(const s of [-1,1]){
      box(g,'equipment_mounting_foot',.39,.085,.66,s*(w*.5-.28),.045,0,M.black,.031);
      polygon(g,'inclined_load_web',[[-.25,0],[.25,0],[.36,.80],[.17,.99],[-.17,.99],[-.24,.77]],.16,M.structure,s*(w*.5-.26),.08,0,.025,[0,Math.PI/2,0]);
      beam(g,'forward_secondary_brace',[s*(w*.5-.26),.17,.20],[s*(w*.5-.26),.78,-.37],.075,.055,M.titanium,.013);
    }
    box(g,'equipment_cassette',w,.20,.83,0,.885,-.085,M.structure,.069);
    polygon(g,'wraparound_console_crown',chamferRect(w-.05,.84,.18),.075,M.cladding,0,1.008,-.07,.025,[-Math.PI/2,0,0]);
    box(g,'operator_forearm_edge',w-.22,.041,.095,0,1.057,.322,M.leather,.020);
    box(g,'front_gasket',w-.23,.094,.017,0,.897,.338,M.black,.017);
    accessPanel(g,'CONSOLE_REPLACEABLE_IO_COVER',w-.39,.16,0,.893,.351);
    slotBank(g,0,.83,-.515,3,w-.39,.029);
    const n=double?2:1;
    for(let i=0;i<n;i++){
      const xx=double?(i-.5)*1.24:0;
      box(g,'display_support_socket',.23,.09,.19,xx,1.035,-.33,M.black,.018);
      cylinder(g,'tilt_axis',.074,.31,xx,1.15,-.34,M.titanium,20,.074,[0,0,Math.PI/2]);
      beam(g,'display_support_arm',[xx,1.13,-.35],[xx,1.37,-.48],.078,.10,M.structure,.015);
      blankDisplay(g,name+'_DISPLAY_'+i,double?1.05:1.16,.64,[xx,1.54,-.49],[-.20,0,0]);
      cylinder(g,'physical_selection_dial',.042,.023,xx-.28,1.07,.13,M.titanium,24);
      box(g,'guarded_control_well',.18,.045,.14,xx+.29,1.069,.14,M.black,.015);
      box(g,'stowed_red_interlock_cover',.06,.032,.08,xx+.32,1.104,.14,M.copper,.009);
      cylinder(g,'single_health_indicator',.010,.007,xx+.46,1.069,.14,M.cyanLight,10);
    }
    return g;
  }
  function emitter(parent,name,x,y,z,r){
    const g=group(parent,name,x,y,z);
    cylinder(g,'recessed_circular_equipment_well',r+.13,.115,0,.025,0,M.black,64);
    cylinder(g,'machined_outer_cassette',r+.055,.132,0,.09,0,M.secondary,64);
    cylinder(g,'upper_titanium_service_ring',r,.026,0,.17,0,M.titanium,64);
    cylinder(g,'matte_optical_bed',r-.14,.035,0,.191,0,M.lens,64);
    ring(g,'flush_inner_seal',r-.13,.017,0,.211,0,M.rubber);
    ring(g,'circumferential_retainer',r-.026,.014,0,.192,0,M.structure);
    const n=12;for(let i=0;i<n;i++){
      const a=i/n*Math.PI*2,xx=Math.sin(a)*(r-.045),zz=Math.cos(a)*(r-.045);
      const m=group(g,'INDEXED_OPTICAL_CARTRIDGE_'+String(i).padStart(2,'0'),xx,.19,zz);m.rotation.y=a;
      box(m,'replaceable_cartridge',.127,.064,.094,0,0,0,M.structure,.012);
      box(m,'protective_window',.076,.015,.039,0,.039,-.019,M.lens,.006);
      bolt(m,0,.042,.027,'y',.009);
    }
    anchor(g,name+'_PROJECTION_VOLUME',[0,.225,0],[r*1.7,1.20,r*1.7],'empty volume above low physical optical base');
    return g;
  }
  function cassetteLight(parent,name,x,y,z,w,d=1.12){
    const g=group(parent,name,x,y,z);
    box(g,'recessed_fixture_pan',w,.12,d,0,0,0,M.black,.052);
    box(g,'brushed_fixture_surround',w-.10,.07,d-.12,0,-.071,0,M.secondary,.035);
    box(g,'prismatic_diffuser',w-.22,.030,d-.25,0,-.12,0,M.whiteLight,.025);
    for(const s of [-1,1])box(g,'diffuser_retainer',.045,.032,d-.30,s*(w*.5-.123),-.137,0,M.structure,.005);
  }

  // Pressure shell: one uninterrupted broad forward pane and two oblique panes.
  const outline=[[-10.95,-12],[10.95,-12],[13,-4.05],[13,13],[-13,13],[-13,-4.05]];
  deckPoly(floor,'continuous_pressure_deck',outline,.29,.02,M.structure);
  const winOuter=chamferRect(22.18,7.38,.64,0,3.95),winInner=chamferRect(21.18,6.46,.46,0,3.91);
  frameShape(architecture,'front_single_span_armoured_window_frame',winOuter,winInner,.53,M.structure,0,0,-11.88,.055);
  frameShape(architecture,'front_laminated_seal_carrier',chamferRect(21.42,6.72,.51,0,3.91),chamferRect(21.18,6.46,.46,0,3.91),.11,M.titanium,0,0,-11.59,.019);
  frameShape(architecture,'front_continuous_compression_gasket',chamferRect(21.18,6.46,.46,0,3.91),chamferRect(21.10,6.38,.43,0,3.91),.045,M.rubber,0,0,-11.524,.009);
  polygon(architecture,'unbroken_forward_laminated_observation_glass',chamferRect(21.11,6.39,.43,0,3.91),.035,M.glass,0,0,-11.55,.006);
  box(architecture,'forward_subsill_armour',21.7,.43,.82,0,.22,-11.67,M.cladding,.064);
  for(const s of [-1,1]){
    const g=group(architecture,(s<0?'PORT':'STARBOARD')+'_OBLIQUE_PANORAMA',s*11.79,0,-7.93);g.rotation.y=-s*1.324;
    frameShape(g,'swept_pane_load_frame',chamferRect(8.21,7.21,.49,0,3.91),chamferRect(7.43,6.39,.36,0,3.92),.44,M.structure,0,0,0,.042);
    frameShape(g,'swept_pane_replaceable_seal',chamferRect(7.55,6.51,.39,0,3.92),chamferRect(7.42,6.38,.35,0,3.92),.066,M.rubber,0,0,.251,.012);
    polygon(g,'swept_pane_laminated_glass',chamferRect(7.45,6.40,.36,0,3.92),.025,M.glass,0,0,.20,.005);
    box(g,'low_window_sill_rail',7.94,.24,.52,0,.57,.13,M.cladding,.044);
    for(const u of [-1,1])for(let k=0;k<4;k++)bolt(g,u*3.90,1.25+k*1.50,.263,'z',.023);
    // Aft side structure opens into the observation bays ahead of the working bays.
    box(architecture,'aft_side_pressure_wall',.33,5.56,16.94,s*12.96,2.87,4.48,M.structure,.085);
    box(architecture,'side_lower_ballistic_utility_spine',.74,.83,16.66,s*12.64,.56,4.53,M.secondary,.075);
    for(const zz of [-2.4,.65,3.70,6.75,9.80]){
      const bay=group(architecture,'INBOARD_SERVICE_BAY_'+s+'_'+zz,s*12.73,0,zz);bay.rotation.y=-s*Math.PI/2;
      polygon(bay,'deep_bay_shadow_rebate',chamferRect(2.72,3.85,.16),.08,M.black,0,2.87,0,.025);
      accessPanel(bay,'UPPER_ACCESS_HATCH',2.42,.86,0,4.22,.08);
      accessPanel(bay,'LARGE_SERVICE_HATCH',2.42,1.70,0,2.71,.08);
      box(bay,'vent_cassette_frame',2.32,.43,.15,0,1.50,.12,M.secondary,.039);
      slotBank(bay,0,1.50,.207,6,2.08,.052);
      box(bay,'service_bay_foot_plinth',2.53,.16,.45,0,.90,.19,M.cladding,.035);
      for(const u of [-1,1])tube(bay,'restrained_service_conduit',[[u*1.25,1.00,.17],[u*1.28,1.13,.21],[u*1.28,3.65,.19],[u*1.21,3.78,.17]],.033,M.black);
    }
  }

  // Close-seamed segmented decking; different levels express work relationships.
  for(const s of [-1,1]){
    for(let z=-9.8;z<11.0;z+=1.78)for(let x=3.9;x<11.9;x+=1.78){
      if(z<-4.5&&x>11.2)continue;
      horizontalPanel(floor,'lower_removable_deck_panel',1.73,1.73,s*x,.061,z,M.floor);
    }
  }
  deckPoly(floor,'raised_command_spine',[[-2.72,-8.57],[2.72,-8.57],[2.91,-7.99],[2.91,10.64],[-2.91,10.64],[-2.91,-7.99]],1.44,1.50,M.structure);
  for(let z=-7.8;z<10.55;z+=1.33){
    horizontalPanel(floor,'command_spine_centre_panels',2.03,1.285,0,1.523,z,M.floor);
    for(const s of [-1,1])horizontalPanel(floor,'command_spine_side_panels',1.73,1.285,s*1.94,1.523,z,M.floor);
  }
  for(const s of [-1,1]){
    box(floor,'command_dais_service_edge',.15,.19,18.70,s*2.88,1.40,1.08,M.deckEdge,.039);
    for(const zz of [-6.7,-3.7,2.65,5.65,8.65])accessPanel(floor,'DAIS_SIDE_INSPECTION',2.04,.77,s*2.945,.85,zz,-s*Math.PI/2);
    // Raised collaborative deck faces the command spine across open circulation.
    box(floor,'coordination_mezzanine',6.58,.66,12.32,s*8.99,.39,3.67,M.structure,.08);
    for(let zz=-1.72;zz<9.0;zz+=1.64)for(let xx=6.72;xx<11.89;xx+=1.65)horizontalPanel(floor,'coordination_deck_tile',1.60,1.59,s*xx,.744,zz,M.floor);
    box(floor,'mezzanine_forward_fascia',6.43,.21,.18,s*8.99,.65,-2.47,M.cladding,.033);
    // Four wide lateral access treads connect command and coordination levels.
    for(let i=0;i<4;i++){
      const yy=.72+(4-i)*.195,xx=s*(3.10+i*.49);
      box(floor,'command_lateral_transition_step',.53,yy,.0+3.14,xx,yy*.5,.1,M.structure,.020);
      box(floor,'transition_step_nosing',.055,.035,3.06,xx+s*.237,yy+.02,.1,M.deckEdge,.007);
    }
    box(floor,'lateral_transition_final_landing',.95,.66,3.14,s*5.30,.39,.10,M.structure,.022);
    horizontalPanel(floor,'lateral_transition_landing_tread',.90,3.06,s*5.30,.744,.10,M.floor);
    // Lower navigation work level has two access stair flights along the sides.
    for(let i=0;i<4;i++){
      const h=.06+(i+1)*.165,zz=-3.90+i*.40;
      box(floor,'coordination_forward_access_tread',2.40,h,.43,s*8.00,h*.5,zz,M.structure,.023);
      box(floor,'coordination_step_nose',2.32,.025,.05,s*8.0,h+.017,zz-.17,M.deckEdge,.006);
    }
    handrail(floor,'command_rear_guard_'+s,[s*2.80,1.54,2.20],[s*2.80,1.54,9.15]);
    handrail(floor,'command_forward_side_guard_'+s,[s*2.80,1.54,-7.89],[s*2.80,1.54,-2.12]);
    handrail(floor,'coordination_inboard_guard_'+s,[s*5.71,.77,2.15],[s*5.71,.77,8.73]);
    handrail(floor,'coordination_outboard_stair_guard_'+s,[s*9.27,.23,-4.00],[s*9.27,.77,-2.60]);
  }
  // Broad forward stairs keep the optical axis free of a crosswise parapet.
  for(let i=0;i<8;i++){
    const top=1.50-(i+1)*.18,zz=-8.77-i*.36;
    box(floor,'forward_command_access_step',5.43,top-.02,.38,0,(top+.02)*.5,zz,M.structure,.021);
    box(floor,'forward_step_non_slip_tread',5.32,.026,.30,0,top+.013,zz,M.floor,.009);
    box(floor,'forward_step_titanium_nose',5.28,.020,.033,0,top+.022,zz-.147,M.deckEdge,.005);
  }
  // Aft transverse circulation joins both access locks without passing through chairs.
  box(floor,'aft_crossing_load_deck',25.34,1.44,3.04,0,.78,11.29,M.structure,.070);
  for(let x=-11.7;x<12;x+=1.8)horizontalPanel(floor,'aft_crossing_deck_panel',1.74,2.68,x,1.526,11.29,M.floor);
  for(const s of [-1,1]){
    for(let i=0;i<4;i++){
      const y=.72+(i+1)*.195,z=8.36+i*.40;
      box(floor,'aft_crossing_access_step',2.7,y,.43,s*10.0,y*.5,z,M.structure,.019);
      box(floor,'aft_step_front_edge',2.62,.025,.045,s*10,y+.019,z-.178,M.deckEdge,.006);
    }
    handrail(floor,'aft_crossing_guard_'+s,[s*3.12,1.55,9.89],[s*8.49,1.55,9.89]);
  }

  // Continuous load frames are far outside the forward aiming cone.
  const stations=[-7.05,-.77,5.48,11.67];
  for(let i=0;i<stations.length;i++){
    const zz=stations[i],g=group(roof,'CONTINUOUS_LOAD_ARCH_'+i,0,0,zz);
    for(const s of [-1,1]){
      const leg=[[s*12.63,.14,0],[s*12.44,5.52,0],[s*10.05,7.58,0]];
      beam(g,'primary_column',leg[0],leg[1],.39,.59,M.structure,.05);
      beam(g,'shouldered_arch_haunch',leg[1],leg[2],.49,.59,M.structure,.055);
      beam(g,'replaceable_leg_cover',[s*12.34,.79,.32],[s*12.20,5.35,.32],.18,.08,M.cladding,.025);
      beam(g,'haunch_inboard_cover',[s*12.05,5.52,.32],[s*9.94,7.33,.32],.23,.083,M.cladding,.026);
      box(g,'arch_column_floor_socket',.92,.40,1.10,s*12.57,.29,0,M.secondary,.063);
      for(const zoff of [-.34,.34])bolt(g,s*12.31,.506,zoff,'y',.027);
      // Gussets follow real joints and carry accessible bolted flange plates.
      polygon(g,'arch_joint_gusset',[[-.48,-.34],[.36,-.34],[.52,.28],[-.26,.38]],.048,M.titanium,s*11.66,6.00,.34,.014,[0,0,s*.61]);
      for(const t of [-1,1])bolt(g,s*11.66+t*.19,6.00,.38,'z',.029);
    }
    beam(g,'uninterrupted_crown_crossmember',[-10.05,7.58,0],[10.05,7.58,0],.41,.59,M.structure,.060);
    box(g,'crown_underside_service_cap',19.57,.11,.42,0,7.32,0,M.secondary,.034);
  }
  box(roof,'armoured_crown_pressure_skin',21.95,.35,24.37,0,7.87,.50,M.structure,.080);
  for(const s of [-1,1]){
    const slope=group(roof,'CROWN_SLOPING_PRESSURE_SKIN_'+s,s*11.77,6.68,.6);slope.rotation.z=-s*.716;
    box(slope,'sloping_pressure_closure',3.19,.24,24.4,0,0,0,M.structure,.057);
    for(let z=-9.0;z<12;z+=3.4)box(roof,'longitudinal_crown_panel',4.84,.12,3.24,s*6.64,7.60,z,M.cladding,.043);
    box(roof,'continuous_crown_utility_duct',.61,.39,22.76,s*3.30,7.44,.49,M.secondary,.054);
    for(let z=-9.80;z<11.7;z+=1.45){
      box(roof,'duct_removable_lower_lid',.54,.07,1.37,s*3.30,7.20,z,M.cladding,.015);
      bolt(roof,s*3.30-.19,7.155,z-.49,'y',.016);bolt(roof,s*3.30+.19,7.155,z+.49,'y',.016);
    }
    tube(roof,'restrained_longitudinal_data_trunk',[[s*9.72,7.19,-10.6],[s*9.72,7.19,-4],[s*9.72,7.19,5.4],[s*9.72,7.19,11.8]],.071,M.black);
    for(const z of [-9.0,-4.2,.8,5.8,10.8])box(roof,'data_trunk_saddle',.20,.22,.13,s*9.72,7.25,z,M.titanium,.018);
  }
  for(let z=-9.3;z<12;z+=3.0)box(roof,'central_crown_flush_panel',5.68,.09,2.82,0,7.63,z,M.secondary,.030);

  // Main command position: compact chair hardware at human scale on a large span.
  chair(command,'ADMIRAL_COMMAND_CHAIR',0,1.55,-4.65,0,true);
  for(const s of [-1,1]){
    const g=group(command,(s<0?'PORT':'STARBOARD')+'_COMMAND_HAND_CONTROL',s*.96,1.54,-4.98);g.rotation.y=s*.11;
    polygon(g,'cast_console_load_cheek',[[-.27,0],[.29,0],[.39,.58],[.31,.69],[-.27,.69]],.75,M.structure,0,.03,-.055,.031);
    polygon(g,'sculpted_console_top',chamferRect(.69,1.15,.16),.08,M.cladding,0,.748,-.18,.027,[-Math.PI/2,0,0]);
    box(g,'arm_contact_pad',.58,.035,.21,0,.81,.234,M.leather,.018);
    box(g,'equipment_cutout_rebate',.37,.025,.33,0,.802,-.22,M.black,.015);
    anchor(g,(s<0?'PORT':'STARBOARD')+'_COMMAND_TOUCH_SURFACE',[0,.819,-.22],[.34,0,.30],'low empty input-device socket');
    cylinder(g,'mechanical_trackball_ring',.067,.019,-s*.15,.829,.046,M.titanium,24);
    cylinder(g,'mechanical_trackball',.045,.028,-s*.15,.852,.046,M.black,20);
    box(g,'recessed_manual_selector',.12,.035,.10,s*.18,.829,.05,M.secondary,.011);
    accessPanel(g,'FRONT_CONSOLE_ACCESS_COVER',.50,.36,0,.39,.366);
    // Forward articulated carriers remain outside the central ±30 degree cone.
    // Hand controls stay reachable; their low outrigger arms carry the remote frames.
    // Resulting display centres are [±1.68, 2.62, -6.50] in world metres.
    const mountX=.72*Math.cos(.11)+1.52*Math.sin(.11)-.007*Math.sin(.50);
    const mountZ=.72*Math.sin(.11)-1.52*Math.cos(.11)+.007*Math.cos(.50);
    cylinder(g,'outboard_panel_azimuth_bearing',.14,.07,s*.38,.44,.29,M.structure,28);
    beam(g,'long_outboard_carrier_channel',[s*.38,.48,.29],[s*.64,.53,-.73],.12,.13,M.secondary,.021);
    beam(g,'carrier_console_outrigger',[s*.30,.48,-.51],[s*.64,.53,-.73],.085,.10,M.structure,.016);
    cylinder(g,'carrier_intermediate_pivot',.068,.17,s*.64,.53,-.73,M.titanium,20,.068,[0,0,Math.PI/2]);
    beam(g,'forward_telescopic_carrier',[s*.64,.53,-.73],[s*mountX,.63,mountZ],.099,.108,M.structure,.018);
    beam(g,'exposed_carrier_slide',[s*.695,.591,-.91],[s*mountX,.687,mountZ+.027],.042,.04,M.titanium,.007);
    cylinder(g,'panel_elevation_hinge',.073,.20,s*mountX,.64,mountZ,M.titanium,20,.073,[0,0,Math.PI/2]);
    tube(g,'protected_articulating_display_loom',[[s*.40,.39,.23],[s*.49,.42,-.25],[s*.69,.47,-.80],[s*mountX,.57,mountZ]],.020,M.black);
    const mount=group(g,(s<0?'PORT':'STARBOARD')+'_SIDE_DISPLAY_CARRIER',s*mountX,.67,mountZ);mount.rotation.y=-s*.50;
    box(mount,'mounting_crosshead',.59,.078,.12,0,0,0,M.secondary,.013);
    for(const u of [-1,1])box(mount,'display_quick_release_ear',.070,.15,.09,u*.27,.08,0,M.titanium,.012);
    frameShape(mount,'open_display_perimeter_cassette',chamferRect(1.15,.81,.08),chamferRect(1.04,.70,.055),.075,M.structure,0,.41,-.007,.013);
    frameShape(mount,'display_aperture_compression_seal',chamferRect(1.068,.728,.062),chamferRect(1.036,.696,.05),.025,M.rubber,0,.41,.041,.006);
    for(const u of [-1,1])for(const v of [-1,1])bolt(mount,u*.529,.41+v*.359,.047,'z',.010);
    anchor(mount,(s<0?'PORT':'STARBOARD')+'_COMMAND_SIDE_DISPLAY',[0,.41,-.007],[1.04,.70,.03],'empty forward-side main command display');
    cylinder(g,'one_status_lamp',.012,.008,s*.20,.821,.23,M.cyanLight,10);
  }
  // The optical bowl is shallow and entirely below the clear observation zone.
  const coordination=group(command,'LOW_FORWARD_FLEET_COORDINATION_BASE',0,1.55,-7.07);
  cylinder(coordination,'integrated_table_service_drum',1.19,.076,0,.001,0,M.black,64);
  emitter(coordination,'FLEET_COORDINATION_DISC',0,.020,0,1.12);
  for(const s of [-1,1]){
    box(coordination,'removable_service_segment',.42,.085,.25,s*.99,.07,0,M.cladding,.025);
    cylinder(coordination,'manual_optics_unlock',.031,.015,s*.99,.122,0,M.titanium,12);
  }
  // Upper integration point is above and slightly behind the eye, with no front drop.
  const upper=group(command,'RETRACTED_OVERHEAD_COMMAND_EQUIPMENT',0,5.52,-3.90);
  for(const s of [-1,1])beam(upper,'roof_hanger',[s*.92,2.0,0],[s*.92,.16,0],.09,.16,M.structure,.015);
  box(upper,'retracted_carrier',2.28,.15,.58,0,.15,0,M.secondary,.04);
  box(upper,'folded_carrier_gasket',1.96,.027,.43,0,.056,0,M.black,.011);
  anchor(upper,'FLAGSHIP_UPPER_TACTICAL_CARRIER',[0,0,-.19],[1.9,.76,.08],'retracted overhead blank tactical carrier');

  // Forward navigation pair has an independent, low unobstructed horizon.
  for(const s of [-1,1]){
    const yaw=-s*.13,desk=workDesk(navigation,(s<0?'PORT_ASTROGATION':'STARBOARD_HELM')+'_CONSOLE',s*6.0,.09,-8.66,yaw,false);
    chair(navigation,(s<0?'ASTROGATION':'HELM')+'_SEAT',s*6.0,.09,-7.47,yaw,false);
    box(navigation,'navigation_deck_equipment_island',2.58,.07,2.73,s*6,.08,-8.06,M.black,.080);
    const wing=group(navigation,'FORE_OBSERVATION_UTILITY_'+s,s*9.0,.13,-7.36);wing.rotation.y=-s*.50;
    box(wing,'forward_low_storage_pod',.92,.79,1.92,0,.38,0,M.structure,.077);
    box(wing,'pod_upper_replaceable_cover',.87,.06,1.79,0,.805,0,M.cladding,.035);
    accessPanel(wing,'STORAGE_SERVICE_COVER',.75,.46,0,.41,1.01);
    tube(wing,'fixed_egress_handle',[[-.33,.79,.39],[-.33,1.02,.39],[.33,1.02,.39],[.33,.79,.39]],.033,M.titanium);
  }

  // Four two-seat collaboration cells face inward across the command circulation.
  for(const s of [-1,1])for(let i=0;i<2;i++){
    const z=.20+i*4.08,ry=-s*.51;
    const cell=group(collaboration,(s<0?'PORT':'STARBOARD')+'_COLLABORATION_CELL_'+i,s*8.55,.78,z);cell.rotation.y=ry;
    workDesk(cell,cell.name+'_PLANNING_DESK',0,0,-.28,0,true);
    chair(cell,'INBOARD_PLANNING_SEAT',-.65,0,1.10,0,false);
    chair(cell,'OUTBOARD_PLANNING_SEAT',.65,0,1.10,0,false);
    const bay=group(cell,'DEDICATED_COMPUTE_AND_COOLING_PEDESTAL',1.69,0,-.22);
    box(bay,'compute_pedestal',.50,.84,.94,0,.42,0,M.structure,.045);
    box(bay,'compute_cover',.43,.08,.86,0,.87,0,M.cladding,.02);
    accessPanel(bay,'HOT_SWAPPABLE_DRAWER',.39,.37,0,.58,.495);
    slotBank(bay,0,.21,.477,5,.36,.038);
    tube(cell,'protected_desk_data_conduit',[[1.70,.13,-.15],[1.45,.16,-.61],[.70,.18,-.64],[.46,.43,-.52]],.029,M.black);
    box(cell,'operator_document_bin',.45,.30,.48,-1.67,.25,-.18,M.secondary,.038);
  }

  // Rear fleet liaison: standing map fitting plus two communication seats.
  const rearCore=group(liaison,'AFT_FLEET_LIAISON_COLLABORATION_TABLE',0,1.55,6.62);
  for(const s of [-1,1]){
    box(rearCore,'isolation_foot',.57,.08,1.05,s*.93,.05,0,M.black,.042);
    box(rearCore,'equipment_support_cabinet',.50,.76,.79,s*.93,.42,0,M.structure,.051);
    accessPanel(rearCore,'TABLE_BASE_ACCESS',.34,.47,s*.93,.42,.435);
  }
  polygon(rearCore,'low_chamfered_coordination_table',chamferRect(3.19,1.89,.28),.22,M.cladding,0,.95,0,.055,[-Math.PI/2,0,0]);
  polygon(rearCore,'table_optical_well',chamferRect(2.84,1.54,.23),.046,M.black,0,1.082,0,.025,[-Math.PI/2,0,0]);
  frameShape(rearCore,'table_physical_mounting_bezel',chamferRect(2.74,1.43,.20),chamferRect(2.52,1.21,.15),.035,M.titanium,0,1.110,0,.012,[-Math.PI/2,0,0]);
  anchor(rearCore,'AFT_FLEET_PLANNING_VOLUME',[0,1.14,0],[2.52,1.3,1.21],'empty planning surface and volume');
  for(const s of [-1,1]){
    const g=group(liaison,'REAR_FLEET_COMMUNICATION_STATION_'+s,s*6.59,.79,7.43);g.rotation.y=s*.22;
    workDesk(g,g.name+'_WORKSTATION',0,0,-.36,0,false);
    chair(g,'LIAISON_OPERATOR_SEAT',0,0,.84,0,false);
  }

  // Full aft bulkhead, paired tall pressure doors, and recessed shared services.
  box(aft,'aft_pressure_closure',25.76,7.69,.35,0,3.96,13.03,M.structure,.067);
  for(const s of [-1,1]){
    const g=group(aft,(s<0?'PORT':'STARBOARD')+'_AFT_PRESSURE_LOCK',s*8.5,1.53,12.71);
    frameShape(g,'armoured_door_reveal',chamferRect(3.46,4.68,.35,0,2.26),chamferRect(2.86,4.05,.22,0,2.24),.57,M.secondary,0,0,0,.062);
    frameShape(g,'door_compression_gasket',chamferRect(2.92,4.12,.24,0,2.24),chamferRect(2.79,3.98,.20,0,2.24),.060,M.rubber,0,0,-.318,.012);
    for(const u of [-1,1]){
      polygon(g,'interlocking_pressure_door_leaf',[[-.63,.28],[.65,.28],[.67,3.97],[.49,4.15],[-.49,4.15],[-.65,3.97]],.155,M.cladding,u*.683,0,-.185,.032);
      box(g,'vertical_latch_drive_cover',.17,2.97,.11,u*1.03,2.19,-.300,M.structure,.033);
      for(const yy of [.85,2.21,3.58]){
        cylinder(g,'rotary_lock_spindle',.091,.05,u*1.355,yy,-.378,M.titanium,20,.091,[Math.PI/2,0,0]);
        box(g,'pressure_door_lock_dog',.33,.12,.12,u*1.32,yy,-.380,M.structure,.028,[0,0,u*.12]);
      }
      tube(g,'manual_assist_grip',[[u*.58,1.70,-.32],[u*.58,1.76,-.45],[u*.58,2.16,-.45],[u*.58,2.22,-.32]],.025,M.black);
    }
    box(g,'meeting_edge_dark_labyrinth',.032,3.76,.045,0,2.21,-.298,M.black,.007);
    box(g,'floor_door_threshold',3.05,.063,.62,0,.03,-.20,M.titanium,.018);
    box(g,'pressure_equalisation_vent',1.46,.25,.14,0,4.54,-.341,M.structure,.025);
    slotBank(g,0,4.54,-.426,4,1.25,.048);
    box(g,'emergency_beacon_guard',.19,.24,.15,-s*1.60,3.83,-.40,M.black,.020);
    box(g,'emergency_beacon_lens',.095,.11,.051,-s*1.60,3.83,-.495,M.redLight,.025);
    const recess=group(aft,'AFT_SIDE_SAFETY_EQUIPMENT_'+s,s*11.51,3.02,12.70);
    accessPanel(recess,'SERVICE_EQUIPMENT_HATCH',1.36,2.30,0,0,-.04,Math.PI);
    box(recess,'recessed_equipment_frame',1.60,2.56,.23,0,0,0,M.secondary,.045);
    accessPanel(recess,'VISIBLE_SERVICE_PANEL',1.32,2.27,0,0,-.14,Math.PI);
  }
  const rearWall=group(aft,'CENTRAL_AFT_SYSTEMS_SPINE',0,0,12.69);
  for(const s of [-1,1]){
    box(rearWall,'central_liaison_equipment_bank',1.66,3.86,.62,s*3.84,3.49,-.18,M.secondary,.07);
    accessPanel(rearWall,'UPPER_EQUIPMENT_SERVICE_PANEL',1.40,1.39,s*3.84,4.46,-.533,Math.PI);
    accessPanel(rearWall,'LOWER_EQUIPMENT_SERVICE_PANEL',1.40,1.57,s*3.84,2.66,-.533,Math.PI);
    box(rearWall,'vent_housing',1.44,.30,.12,s*3.84,3.54,-.557,M.structure,.025);
    slotBank(rearWall,s*3.84,3.54,-.626,5,1.26,.043);
    beam(rearWall,'rear_vertical_load_column',[s*5.49,.05,-.06],[s*5.49,7.52,-.06],.45,.53,M.structure,.055);
    box(rearWall,'aft_low_storage_bench',2.10,.66,.89,s*1.49,1.89,-.36,M.cladding,.066);
    box(rearWall,'bench_removable_cushion',1.96,.077,.72,s*1.49,2.264,-.40,M.leather,.03);
  }
  const rearDisplay=blankDisplay(rearWall,'REAR_LIAISON_LARGE_DISPLAY_FRAME',4.63,1.80,[0,4.85,-.60]);rearDisplay.rotation.y=Math.PI;
  for(const s of [-1,1])beam(rearWall,'rear_display_wall_standoff',[s*1.62,4.75,-.22],[s*1.62,4.75,-.48],.12,.12,M.titanium,.018);

  // Practical cassettes and restrained low-level emergency/step lamps.
  for(const s of [-1,1])for(const z of [-5.6,2.4,9.0])cassetteLight(fixtures,'CEILING_WORKLIGHT_'+s+'_'+z,s*5.08,7.43,z,2.22,1.10);
  cassetteLight(fixtures,'COMMAND_OVERHEAD_DIFFUSER',0,6.02,-2.47,2.05,.72);
  for(const s of [-1,1]){
    beam(fixtures,'command_fixture_support',[s*.86,7.56,-2.47],[s*.86,6.10,-2.47],.054,.079,M.titanium,.010);
    for(const z of [-6.20,-2.22,3.85,8.00]){
      const g=group(fixtures,'DAIS_STEP_LIGHT_'+s+'_'+z,s*2.974,1.08,z);g.rotation.y=-s*Math.PI/2;
      box(g,'hooded_low_level_light',.35,.12,.065,0,0,0,M.black,.018);
      box(g,'recessed_frosted_diffuser',.25,.028,.018,0,-.021,.036,M.whiteLight,.007);
    }
    for(const z of [-3.00,2.00,7.00]){
      box(fixtures,'sidewall_practical_light_pan',.20,.42,1.38,s*12.26,4.92,z,M.structure,.039);
      box(fixtures,'sidewall_practical_diffuser',.051,.19,1.10,s*12.12,4.92,z,M.whiteLight,.022);
    }
    box(fixtures,'fore_window_sill_safety_light_guard',1.30,.18,.20,s*8.62,.73,-11.24,M.structure,.025);
    box(fixtures,'fore_window_sill_soft_diffuser',1.10,.035,.08,s*8.62,.839,-11.20,M.whiteLight,.013);
  }

  interior.userData={design:'KEEL family / fleet command facility',units:'metres',up:'+Y',forward:'-Z',defaultEye:CRAFT.eye,
    levels:{navigation:.06,coordination:.72,command:1.50},
    forwardOpening:{width:21.18,sill:.68,head:7.14,z:-11.88},
    notes:'Physical interior only. Empty named sockets are retained through batching. Central panorama has no mullion.'};
}

function buildCraftLights(lights){
  const hemi=new T.HemisphereLight(0xc2d0d2,0x45433f,.96);hemi.name='FLAGSHIP_CABIN_DIFFUSE_BOUNCE';lights.add(hemi);
  const ambient=new T.AmbientLight(0x97a6a6,.10);ambient.name='FLAGSHIP_MINIMUM_SHADOW_DETAIL';lights.add(ambient);
  function spot(name,x,y,z,tx,ty,tz,power,color,shadow=false){
    const l=new T.SpotLight(color,power,28,.98,.80,1.65);l.name=name;l.position.set(x,y,z);l.target.position.set(tx,ty,tz);lights.add(l,l.target);
    if(shadow){l.castShadow=true;l.shadow.mapSize.set(1536,1536);l.shadow.camera.near=.35;l.shadow.camera.far=28;l.shadow.bias=-.00014;l.shadow.normalBias=.025;l.shadow.radius=3;}
  }
  spot('PORT_FORE_PRACTICAL',-5.08,7.25,-5.6,-2.0,1.4,-5.45,143,0xe6ebe3,true);
  spot('STARBOARD_MID_PRACTICAL',5.08,7.25,2.4,2.1,1.0,2.1,144,0xd2e0e4,true);
  spot('STARBOARD_FORE_PRACTICAL',5.08,7.25,-5.6,5.50,.8,-8.10,116,0xdce7e5);
  spot('PORT_MID_PRACTICAL',-5.08,7.25,2.4,-7.8,.80,2.1,126,0xe6e8df);
  for(const s of [-1,1])spot('AFT_PRACTICAL_'+s,s*5.08,7.25,9.0,s*6.5,2.1,10.8,138,0xdce4df);
  spot('COMMAND_SUSPENDED_WORKLIGHT',0,5.86,-2.47,0,1.80,-5.6,46,0xe7e9df);
  const reflected=new T.PointLight(0xafc4cd,4.5,16,1.65);reflected.name='FORWARD_SILL_REFLECTED_FILL';reflected.position.set(0,.80,-10.25);lights.add(reflected);
  const midFill=new T.PointLight(0xe0e5dd,13,13,1.65);midFill.name='CEILING_INDIRECT_MID_FILL';midFill.position.set(0,6.20,4.0);lights.add(midFill);
  for(const s of [-1,1]){
    const emergency=new T.PointLight(0xb92a19,.64,2.7,2);emergency.name='AFT_LOCK_EMERGENCY_PRACTICAL_'+s;emergency.position.set(s*6.90,5.36,12.10);lights.add(emergency);
    const sideFill=new T.PointLight(0xd6e0df,7.0,10,1.7);sideFill.name='SIDE_WALL_PRACTICAL_BOUNCE_'+s;sideFill.position.set(s*11.5,4.80,2.0);lights.add(sideFill);
  }
}



return {craft:CRAFT,build:buildCraft,light:buildCraftLights};
}
