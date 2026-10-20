import {createFamilyInterior} from './family-common.js';

// Imported user-supplied KEEL_Fighter_Interior.html; modelling only.
export const createFighterInterior=options=>createFamilyInterior(buildModel,options);
function buildModel({T,interior,M,group,geometry,mesh,box,polygon,deckPoly,beam,cylinder,ring,tube,bolt,slotBank,frameShape,chamferRect}){
const CRAFT = {
  id:'FIGHTER', title:'KEEL / KESTREL 单座战斗机驾驶舱',
  dimensions:{width:2.60,length:4.70,height:2.70},
  eye:[0,1.58,.10], fov:72, pitch:0, exposure:1.06, moveSpeed:.75,
  bounds:{min:[-1.22,.12,-2.84],max:[1.22,2.60,1.55]},
  views:[
    {name:'前方回看座椅与后舱',position:[0,2.08,-2.25],target:[0,1.00,.53]},
    {name:'右上方完整机械结构',position:[1.08,2.23,-.78],target:[-.20,.92,.06]},
    {name:'左侧油门与安装座',position:[-.05,1.56,-.23],target:[-.80,.85,-.36]},
    {name:'脚部空间与踏板',position:[.14,1.34,-.32],target:[0,.27,-1.29]}
  ],
  notes:'Single-person pressure cell. Default eye [0,1.58,0.10] m. Forward opaque structure is kept below the central view cone (yaw ±45°, pitch −16° to +32°). Canopy crown arch is aft of the eye at z=+1.10 m. Empty physical-display mounts are named EMPTY_FIGHTER_*. No display content, exterior hull, characters or space background.'
};

// Cross-section loft with an actual, closed sheet thickness. Each station is
// [z, halfWidth, bottomY, shoulderY]. The interior is a formed U-section tub.
function fighterTub(parent,name,stations,mat,thickness=.045) {
  const profile=[[-1,1],[-.985,.64],[-.87,.28],[-.65,.075],[-.41,0],[.41,0],[.65,.075],[.87,.28],[.985,.64],[1,1]];
  const p=[],idx=[],n=profile.length,rows=stations.length;
  for(let skin=0;skin<2;skin++) for(const st of stations) for(const q of profile) {
    const x=q[0]*(st[1]+skin*thickness),y=st[2]+q[1]*(st[3]-st[2])-skin*thickness;
    p.push(x,y,st[0]);
  }
  const quad=(a,b,c,d,flip=false)=>flip?idx.push(a,c,b,a,d,c):idx.push(a,b,c,a,c,d);
  for(let skin=0;skin<2;skin++) for(let z=0;z<rows-1;z++) for(let j=0;j<n-1;j++) {
    const a=skin*rows*n+z*n+j;quad(a,a+n,a+n+1,a+1,skin===1);
  }
  for(let j=0;j<n-1;j++) {quad(j,j+1,rows*n+j+1,rows*n+j);const a=(rows-1)*n+j;quad(a,rows*n+a,rows*n+a+1,a+1);}
  for(let z=0;z<rows-1;z++) for(const edge of [0,n-1]) {const a=z*n+edge;quad(a,a+rows*n,a+rows*n+n,a+n,edge===0);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();
  return mesh(parent,name,g,mat);
}

// Formed, tapered panel between matching polylines. Used for legwell liners,
// skin joints and canopy rear trim; thickness remains visible at panel edges.
function fighterRibbon(parent,name,points,width,thickness,mat) {
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),count=36;
  const pos=[],indices=[],left=[],right=[];
  for(let i=0;i<=count;i++) {
    const t=i/count,c=curve.getPoint(t),tangent=curve.getTangent(t).normalize();
    let side=new T.Vector3(1,0,0);side.addScaledVector(tangent,-side.dot(tangent)).normalize();
    if(side.lengthSq()<.1)side.set(0,0,1);
    const normal=new T.Vector3().crossVectors(tangent,side).normalize();
    left.push(c.clone().addScaledVector(side,-width*.40).addScaledVector(normal,thickness*.65).toArray());
    right.push(c.clone().addScaledVector(side,width*.40).addScaledVector(normal,thickness*.65).toArray());
    for(const a of [-1,1])for(const b of [-1,1])pos.push(...c.clone().addScaledVector(side,a*width*.5).addScaledVector(normal,b*thickness*.5).toArray());
  }
  const q=(a,b,c,d)=>indices.push(a,b,c,a,c,d);
  for(let i=0;i<count;i++){const a=i*4;q(a,a+4,a+6,a+2);q(a+1,a+3,a+7,a+5);q(a,a+1,a+5,a+4);q(a+2,a+6,a+7,a+3);}
  q(0,2,3,1);const e=count*4;q(e,e+1,e+3,e+2);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(indices);g.computeVertexNormals();
  const o=mesh(parent,name,g,mat);
  if(name.includes('restraint')){tube(parent,name+'_edge_stitch_L',left,.0016,M.stitch);tube(parent,name+'_edge_stitch_R',right,.0016,M.stitch);}
  return o;
}

function fighterLoftGlass(parent) {
  // Bubble surface: smoothly interpolated sections, uninterrupted in front.
  const st=[[-2.96,.025,.64,.025],[-2.74,.28,.67,.42],[-2.31,.66,.77,1.08],[-1.72,.98,.93,1.44],[-.82,1.18,1.08,1.53],[.12,1.24,1.08,1.59],[.87,1.20,1.08,1.51],[1.47,1.06,1.03,1.24]];
  const curves={};for(const [k,col] of [['width',1],['base',2],['rise',3]])curves[k]=new T.CatmullRomCurve3(st.map(s=>new T.Vector3(s[0],s[col],0)),false,'catmullrom',.4);
  const pos=[],ind=[],nr=56,na=64;
  for(let r=0;r<=nr;r++) {
    const a=curves.width.getPoint(r/nr),b=curves.base.getPoint(r/nr),c=curves.rise.getPoint(r/nr);
    for(let k=0;k<=na;k++){const ang=Math.PI*k/na;pos.push(a.y*Math.cos(ang),b.y+c.y*Math.sin(ang),a.x);}
  }
  for(let r=0;r<nr;r++)for(let k=0;k<na;k++){const a=r*(na+1)+k;ind.push(a,a+na+1,a+1,a+1,a+na+1,a+na+2);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(ind);geo.computeVertexNormals();
  const glass=mesh(parent,'CANOPY_laminated_single_bubble',geo,M.glass);glass.castShadow=false;
  for(const sign of [-1,1]) {
    const rail=st.map(s=>[s[1]*sign,s[2]-.023,s[0]]);
    tube(parent,'CANOPY_continuous_pressure_seal_'+sign,rail,.033,M.rubber);
    tube(parent,'CANOPY_lower_machined_rail_'+sign,rail.map(p=>[p[0]*1.015,p[1]-.031,p[2]]),.038,M.titanium);
    tube(parent,'CANOPY_inner_edge_strip_'+sign,rail.map(p=>[p[0]*.985,p[1]-.018,p[2]]),.014,M.secondary);
  }
  // No forward cross-arch: all opaque overhead support is behind the pilot.
  const arch=[];for(let i=0;i<=20;i++){const a=i/20*Math.PI;arch.push([1.18*Math.cos(a),1.085+1.50*Math.sin(a),1.105+.04*Math.sin(a)]);}
  tube(parent,'CANOPY_rear_primary_arch',arch,.059,M.structure);
  tube(parent,'CANOPY_rear_arch_titanium_rebate',arch.map(p=>[p[0]*.974,p[1]-.018,p[2]-.028]),.021,M.titanium);
  tube(parent,'CANOPY_rear_arch_compression_gasket',arch.map(p=>[p[0]*1.021,p[1]+.015,p[2]+.033]),.022,M.rubber);
  for(const s of [-1,1]) {
    const hinge=group(parent,'CANOPY_aft_hinge_and_actuator_'+s,s*1.04,1.11,1.36);
    box(hinge,'hinge_forged_saddle',.15,.25,.25,0,0,0,M.structure,.026);
    cylinder(hinge,'hinge_axis',.069,.20,0,.025,-.013,M.titanium,32,.069,[0,0,Math.PI/2]);
    cylinder(hinge,'hinge_end_cap',.049,.025,s*.116,.025,-.013,M.black,24,.049,[0,0,Math.PI/2]);
    bolt(hinge,s*.134,.025,-.013,'x',.025);
    // Coaxial ram body, gland and shaft terminate in pinned clevises at both ends.
    const ramA=new T.Vector3(s*1.075,.65,.72),ramB=new T.Vector3(s*1.07,1.35,1.36);
    const ramAxis=ramB.clone().sub(ramA).normalize();
    const ramPart=(name,t0,t1,r,mat)=>{
      const a=ramA.clone().lerp(ramB,t0),b=ramA.clone().lerp(ramB,t1),c=a.clone().add(b).multiplyScalar(.5);
      const part=cylinder(parent,name+'_'+s,r,a.distanceTo(b),...c.toArray(),mat,20);
      part.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),ramAxis);return part;
    };
    ramPart('CANOPY_lift_actuator_barrel',.03,.64,.037,M.black);
    ramPart('CANOPY_lift_actuator_gland',.59,.65,.043,M.secondary);
    ramPart('CANOPY_lift_actuator_polished_shaft',.43,1,.014,M.titanium);
    box(parent,'CANOPY_upper_ram_bulkhead_load_plate_'+s,.18,.24,.060,s*1.015,1.35,1.568,M.secondary,.012);
    for(const dx of [-.036,.036])box(parent,'CANOPY_upper_clevis_ear_'+s,.024,.13,.252,s*1.07+dx,1.35,1.447,M.structure,.012);
    cylinder(parent,'CANOPY_upper_pinned_ram_eye_'+s,.034,.038,s*1.07,1.35,1.36,M.secondary,20,.034,[0,0,Math.PI/2]);
    cylinder(parent,'CANOPY_upper_clevis_cross_pin_'+s,.021,.128,s*1.07,1.35,1.36,M.titanium,16,.021,[0,0,Math.PI/2]);
    bolt(parent,s*1.07-s*.074,1.35,1.36,'x',.027);
    for(const dy of [-.083,.083])bolt(parent,s*1.01,1.35+dy,1.531,'z',.014);
    box(parent,'CANOPY_lower_ram_sill_load_shoe_'+s,.178,.105,.215,s*1.145,.65,.72,M.structure,.018);
    cylinder(parent,'CANOPY_lower_ram_cross_pin_'+s,.028,.145,s*1.075,.65,.72,M.titanium,16,.028,[0,0,Math.PI/2]);
    bolt(parent,s*1.075-s*.079,.65,.72,'x',.023);
    for(const z of [-1.63,-.68,.27]){
      const x=z<-1.5?s*.98:s*1.19,y=z<-1.5?.93:1.08;
      const latch=group(parent,'CANOPY_cam_lock_'+s+'_'+z,x,y-.086,z);
      box(latch,'cam_mount_casting',.11,.125,.22,0,0,0,M.secondary,.023);
      cylinder(latch,'cam_pivot',.042,.14,0,0,0,M.titanium,24,.042,[0,0,Math.PI/2]);
      box(latch,'over_center_latch',.056,.052,.15,-s*.06,.018,-.028,M.black,.012,[.22,0,0]);
      box(latch,'latch_grip_insert',.030,.030,.068,-s*.083,.036,-.07,M.copper,.006);
      for(const zz of [-.072,.072])bolt(latch,-s*.063,-.033,zz,'x',.014);
    }
  }
}

function fighterTubAndStructure() {
  const cell=group(interior,'01_PRESSURE_CELL_AND_FORMED_LINERS');
  const stations=[[-2.94,.04,.28,.63],[-2.62,.42,.06,.68],[-2.12,.83,-.08,.80],[-1.55,1.11,-.10,.95],[-.66,1.255,-.10,1.075],[.43,1.265,-.10,1.075],[1.19,1.15,-.02,1.065],[1.71,.91,.08,1.00]];
  fighterTub(cell,'PRESSURE_CELL_welded_monocoque_inner_skin',stations,M.structure,.055);
  // Replaceable shell sections and their sealing joints follow the actual tub.
  for(let b=2;b<stations.length-1;b++) {
    const a=stations[b],c=stations[b+1],mid=(a[0]+c[0])*.5;
    for(const s of [-1,1]){
      const p=group(cell,'PRESSURE_CELL_side_liner_'+s+'_'+b);
      const w=(a[1]+c[1])*.5;
      polygon(p,'formed_lower_side_liner',[[-.26,0],[.29,0],[.35,.27],[.21,.55],[-.28,.49]],.032,M.cladding,s*(w*.82),.38,mid,.016,[0,s*Math.PI/2,0]);
      const pts=[[s*(w*.93),.64,mid-.20],[s*(w*.96),.66,mid],[s*(w*.94),.64,mid+.20]];
      tube(p,'upper_liner_gasket',pts,.008,M.black);
      for(const dz of [-.15,.15])bolt(p,s*(w*.822-.024),.29,mid+dz,'x',.014);
    }
  }
  const floorOutline=[[-.36,-1.93],[.36,-1.93],[.56,-1.41],[.59,.68],[.47,1.33],[-.47,1.33],[-.59,.68],[-.56,-1.41]];
  deckPoly(cell,'PRESSURE_CELL_lower_removable_floor',floorOutline,.07,.078,M.floor);
  for(const s of [-1,1]) {
    beam(cell,'DECK_seat_rail_reinforcement_'+s,[s*.29,.085,-.04],[s*.29,.085,1.12],.060,.074,M.structure,.014);
    box(cell,'DECK_polished_seat_slide_'+s,.037,.020,1.15,s*.29,.13,.54,M.titanium,.006);
    for(const z of [.04,.49,1.02])bolt(cell,s*.29,.145,z,'y',.016);
    for(const z of [-1.72,-1.32,-.91]){
      box(cell,'DECK_footwell_rib_'+s,.33,.018,.044,s*.30,.124,z,M.black,.006);
    }
    // A single service conduit follows each sill and turns down into the aft bay.
    tube(cell,'PRESSURE_CELL_sill_service_conduit_'+s,[[s*1.00,.65,-1.72],[s*1.135,.69,-.84],[s*1.155,.71,.36],[s*1.02,.64,1.19],[s*.85,.28,1.44]],.024,M.black);
    tube(cell,'PRESSURE_CELL_bonding_braid_'+s,[[s*1.02,.61,-1.72],[s*1.12,.63,-.9],[s*1.15,.64,.31],[s*1.005,.57,1.23]],.008,M.copper);
    for(const z of [-1.13,-.14,.72]){
      box(cell,'CONDUIT_two_screw_clamp_'+s,.053,.077,.075,s*1.135,.697,z,M.titanium,.008);
      bolt(cell,s*1.135,.746,z,'y',.012);
    }
  }
  // Forward pressure toe cap is low; the pilot can see past it down to −16°.
  polygon(cell,'FORWARD_toe_pressure_bulkhead',chamferRect(.84,.53,.12),.095,M.structure,0,.39,-2.14,.028);
  polygon(cell,'FORWARD_removable_toe_liner',chamferRect(.67,.35,.065),.038,M.cladding,0,.41,-2.072,.012);
  slotBank(cell,0,.43,-2.046,5,.41,.045,'z');
  for(const x of [-.28,.28])for(const y of [.29,.54])bolt(cell,x,y,-2.034,'z',.014);
  const canopy=group(interior,'02_UNINTERRUPTED_BUBBLE_CANOPY_AND_LOCKS');fighterLoftGlass(canopy);
}

function fighterSeat() {
  const seat=group(interior,'03_FLIGHT_SEAT_AND_RESTRAINT_SYSTEM',0,0,.35);
  for(const s of [-1,1]) {
    box(seat,'SEAT_rail_carriage_'+s,.14,.11,.32,s*.29,.191,.29,M.black,.022);
    cylinder(seat,'SEAT_slide_release_spindle_'+s,.027,.18,s*.29,.22,.31,M.titanium,20,.027,[0,0,Math.PI/2]);
    beam(seat,'SEAT_energy_absorber_body_'+s,[s*.28,.23,.52],[s*.28,.47,.07],.069,.082,M.secondary,.013);
    beam(seat,'SEAT_energy_absorber_piston_'+s,[s*.28,.38,.25],[s*.28,.57,-.07],.030,.041,M.titanium,.008);
    beam(seat,'SEAT_forward_link_'+s,[s*.28,.20,-.11],[s*.28,.52,.18],.052,.061,M.structure,.009);
    for(const [y,z] of [[.23,.52],[.47,.07],[.20,-.11],[.52,.18]])cylinder(seat,'SEAT_articulation_pin_'+s,.035,.082,s*.30,y,z,M.titanium,24,.035,[0,0,Math.PI/2]);
  }
  // Open lower mount gives access to the release and the shock absorber.
  polygon(seat,'SEAT_load_spreading_pan',[[-.32,-.36],[.32,-.36],[.39,-.19],[.34,.35],[-.34,.35],[-.39,-.19]],.10,M.structure,0,.535,0,.025,[-Math.PI/2,0,0]);
  polygon(seat,'SEAT_pan_edge_shell',[[-.34,-.33],[.34,-.33],[.40,-.19],[.36,.39],[-.36,.39],[-.40,-.19]],.055,M.cladding,0,.584,.005,.018,[-Math.PI/2,0,0]);
  box(seat,'SEAT_isolated_cushion',.56,.135,.60,0,.662,-.020,M.leather,.035,[-.04,0,0]);
  box(seat,'SEAT_forward_thigh_cushion',.51,.10,.16,0,.662,-.342,M.leather,.026,[-.14,0,0]);
  for(const s of [-1,1]) {
    polygon(seat,'SEAT_hip_wing_'+s,[[-.39,.00],[.36,.00],[.35,.23],[-.24,.31],[-.42,.16]],.065,M.cladding,s*.352,.57,.03,.020,[0,s*Math.PI/2,0]);
    box(seat,'SEAT_hip_bolster_'+s,.092,.20,.54,s*.293,.756,.05,M.leather,.028,[0,0,-s*.07]);
    tube(seat,'SEAT_cushion_perimeter_seam_'+s,[[s*.254,.723,-.27],[s*.267,.727,.00],[s*.254,.715,.25]],.003,M.stitch);
  }
  const back=group(seat,'SEAT_reclined_back_assembly',0,1.09,.407);back.rotation.x=.165;
  polygon(back,'SEAT_structural_back_shell',[[-.35,-.52],[.35,-.52],[.43,-.15],[.405,.38],[.265,.56],[-.265,.56],[-.405,.38],[-.43,-.15]],.12,M.structure,0,0,0,.033);
  polygon(back,'SEAT_back_outside_cladding',[[-.305,-.45],[.305,-.45],[.35,-.11],[.327,.32],[.23,.48],[-.23,.48],[-.327,.32],[-.35,-.11]],.039,M.cladding,0,0,.086,.015);
  box(back,'SEAT_spine_soft_pad',.44,.58,.103,0,.05,-.09,M.leather,.029);
  box(back,'SEAT_lumbar_soft_pad',.49,.235,.12,0,-.347,-.11,M.leather,.030);
  box(back,'SEAT_shoulder_soft_pad',.57,.17,.098,0,.411,-.09,M.leather,.026);
  for(const s of [-1,1]) {
    box(back,'SEAT_rib_bolster_'+s,.108,.57,.14,s*.278,-.04,-.103,M.leather,.031,[0,s*.17,-s*.065]);
    box(back,'SEAT_restraint_reel_cassette_'+s,.13,.19,.09,s*.246,.45,.086,M.black,.018);
    cylinder(back,'SEAT_reel_axis_cap_'+s,.043,.026,s*.246,.45,.147,M.titanium,24,.043,[Math.PI/2,0,0]);
    for(const y of [-.35,.17])bolt(back,s*.295,y,.117,'z',.017);
    beam(seat,'SEAT_headrest_slide_'+s,[s*.155,1.54,.49],[s*.155,1.76,.55],.031,.040,M.titanium,.005);
  }
  box(seat,'SEAT_headrest_armoured_support',.41,.31,.17,0,1.70,.56,M.structure,.038,[.165,0,0]);
  box(seat,'SEAT_headrest_removable_cushion',.348,.265,.087,0,1.70,.433,M.leather,.032,[.165,0,0]);
  for(const s of [-1,1]) {
    box(seat,'SEAT_head_side_energy_pad_'+s,.095,.245,.22,s*.224,1.68,.405,M.leather,.028,[0,s*.23,0]);
    // Belts lie on the unoccupied seat, with useful slack and an actual buckle.
    fighterRibbon(seat,'restraint_shoulder_webbing_'+s,[[s*.225,1.545,.370],[s*.202,1.41,.24],[s*.167,1.04,.213],[s*.142,.826,.156],[s*.047,.746,-.02]],.066,.008,M.rubber);
    fighterRibbon(seat,'restraint_lap_webbing_'+s,[[s*.345,.758,.106],[s*.269,.778,-.005],[s*.175,.754,-.102],[s*.046,.743,-.064]],.061,.008,M.rubber);
    cylinder(seat,'RESTRAINT_lower_anchor_pin_'+s,.03,.075,s*.36,.74,.10,M.titanium,24,.03,[0,0,Math.PI/2]);
    frameShape(seat,'RESTRAINT_shoulder_adjuster_'+s,chamferRect(.091,.11,.017),chamferRect(.060,.065,.008),.021,M.titanium,s*.17,1.02,.198,.004,[.165,0,0]);
  }
  cylinder(seat,'RESTRAINT_five_point_buckle_body',.065,.033,0,.749,-.07,M.structure,40);
  cylinder(seat,'RESTRAINT_rotary_release',.045,.021,0,.776,-.07,M.titanium,32);
  box(seat,'RESTRAINT_release_handle',.068,.023,.027,0,.796,-.07,M.copper,.005);
  fighterRibbon(seat,'restraint_anti_submarine_webbing',[[0,.609,-.333],[0,.706,-.234],[0,.735,-.085]],.062,.008,M.rubber);
  const rear=group(seat,'SEAT_aft_mechanism_cassette',0,1.16,.59);rear.rotation.x=.165;
  box(rear,'SEAT_rear_service_spine',.20,.57,.10,0,0,0,M.black,.022);
  slotBank(rear,0,.06,.068,7,.136,.049,'z');
  for(const y of [-.19,.23])bolt(rear,0,y,.072,'z',.017);
  tube(seat,'SEAT_restraint_reel_service_line',[[-.23,1.54,.57],[-.29,1.33,.61],[-.22,.91,.53],[-.23,.59,.53],[-.26,.33,.70]],.013,M.black);
}

function fighterDisplayCradle(parent,name,width,height,x,y,z,rx,ry) {
  const g=group(parent,name,x,y,z);g.rotation.set(rx,ry,0);
  polygon(g,'DISPLAY_mount_back_casting',chamferRect(width+.065,height+.063,.052),.058,M.structure,0,0,0,.016);
  frameShape(g,'DISPLAY_machined_outer_bezel',chamferRect(width+.038,height+.035,.042),chamferRect(width-.026,height-.027,.021),.030,M.titanium,0,0,.044,.005);
  frameShape(g,'DISPLAY_replaceable_compression_seal',chamferRect(width-.022,height-.022,.023),chamferRect(width-.049,height-.049,.020),.013,M.rubber,0,0,.061,.003);
  polygon(g,'DISPLAY_blank_physical_face',chamferRect(width-.051,height-.051,.020),.012,M.lens,0,0,.066,.003);
  for(const sx of [-1,1])for(const sy of [-1,1])bolt(g,sx*(width*.5-.017),sy*(height*.5-.012),.066,'z',.010);
  box(g,'DISPLAY_lower_connection_sill',width*.65,.026,.035,0,-height*.5-.007,.043,M.secondary,.005);
  const anchor=group(g,'EMPTY_'+name,0,0,.083);anchor.userData={role:'blank display content attachment; local +Z is outward normal',dimensions:[width-.052,height-.052,0]};
  return g;
}

function fighterRotary(parent,x,y,z,r=.033,mat=M.titanium){
  cylinder(parent,'CONTROL_rotary_socket',r*1.30,.014,x,y,z,M.black,24);
  cylinder(parent,'CONTROL_knurled_rotary',r,.031,x,y+.021,z,mat,16);
  box(parent,'CONTROL_index_groove',.006,.003,r*.55,x,y+.038,z-r*.28,M.black,.001);
}

function fighterSideConsole(sign) {
  const root=group(interior,(sign<0?'04_PORT_THROTTLE_SADDLE':'05_STARBOARD_STICK_SADDLE'));
  const foot=[[-.33,-1.51],[.19,-1.61],[.41,-1.17],[.41,.68],[.30,1.15],[-.15,1.07],[-.20,.14],[-.37,-.53]];
  const points=foot.map(p=>[sign*(.73+p[0]),p[1]]);if(sign<0)points.reverse();
  deckPoly(root,'CONSOLE_saddle_lower_shell',points,.24,.737,M.structure);
  deckPoly(root,'CONSOLE_removable_formed_upper_shell',points.map(p=>[p[0]+sign*.006,p[1]]),.092,.854,M.cladding);
  const working=foot.map(p=>[sign*(.73+p[0]*.90),p[1]*.97-.015]);if(sign<0)working.reverse();
  deckPoly(root,'CONSOLE_upper_dark_replaceable_deck',working,.018,.869,M.secondary);
  // Separate the forward display tray, hand-control plate and aft electrical
  // cover with narrow recessed gasket joints and captive quarter-turn screws.
  tube(root,'CONSOLE_forward_tray_joint',[[sign*.427,.888,-.568],[sign*.681,.888,-.533],[sign*1.098,.888,-.533]],.0035,M.rubber);
  tube(root,'CONSOLE_aft_cover_joint',[[sign*.548,.888,.651],[sign*.763,.888,.651],[sign*1.092,.888,.651]],.0035,M.rubber);
  tube(root,'CONSOLE_removable_outboard_edge_seal',[[sign*1.072,.888,-1.08],[sign*1.094,.888,-.55],[sign*1.094,.888,.55],[sign*.995,.888,.977]],.0035,M.rubber);
  for(const z of [-.497,.608])for(const xx of [.588,1.04]){
    cylinder(root,'CONSOLE_quarter_turn_recess',.020,.008,sign*xx,.893,z,M.black,24);
    cylinder(root,'CONSOLE_quarter_turn_head',.014,.008,sign*xx,.899,z,M.titanium,16);
    box(root,'CONSOLE_quarter_turn_slot',.018,.003,.003,sign*xx,.904,z,M.black,.001);
  }
  for(const z of [-.77,.66]) {
    const bracket=group(root,'CONSOLE_saddle_load_bracket_'+z,sign*.82,.485,z);
    polygon(bracket,'BRACKET_web_forging',[[-.18,-.13],[.16,-.13],[.20,.14],[-.12,.19]],.057,M.structure,0,0,0,.013,[0,0,sign*.12]);
    frameShape(bracket,'BRACKET_lightening_rebate',chamferRect(.22,.20,.045),chamferRect(.136,.116,.025),.018,M.secondary,0,.025,.040,.004);
    for(const x of [-.124,.124])bolt(bracket,x,-.091,.035,'z',.014);
  }
  const edgePts=[[sign*.37,.845,-1.50],[sign*.38,.845,-.55],[sign*.535,.845,.14],[sign*.55,.845,1.04]];
  tube(root,'CONSOLE_inboard_machined_edge',edgePts,.018,M.titanium);
  tube(root,'CONSOLE_inboard_soft_knee_roll',edgePts.map(p=>[p[0]-.035*sign,p[1]-.042,p[2]+.025]),.043,M.rubber);
  const service=group(root,'CONSOLE_inner_service_access',sign*.555,.589,.10);service.rotation.y=sign*Math.PI/2;
  polygon(service,'CONSOLE_access_cover_gasket',chamferRect(.64,.232,.039),.015,M.black,0,0,0,.005);
  polygon(service,'CONSOLE_access_cover',chamferRect(.614,.205,.033),.025,M.cladding,0,0,.018,.007);
  for(const xx of [-.257,.257])for(const yy of [-.07,.07])bolt(service,xx,yy,.039,'z',.012);
  box(service,'CONSOLE_recessed_finger_pull',.11,.021,.006,0,.055,.034,M.black,.005);
  for(const z of [-1.11,.48,.98])bolt(root,sign*.91,.884,z,'y',.014);
  // Front hollow mount is lower than the forward visual cone and angled in.
  const cradle=fighterDisplayCradle(root,'FIGHTER_'+(sign<0?'PORT':'STARBOARD')+'_DISPLAY',.43,.268,sign*.692,1.101,-1.282,-.61,-sign*.245);
  for(const sx of [-1,1]) {
    beam(root,'DISPLAY_cradle_fork', [sign*.692+sx*.163,.88,-1.105],[sign*.692+sx*.163,1.036,-1.255],.047,.042,M.structure,.009);
    cylinder(root,'DISPLAY_tilt_pivot',.034,.040,sign*.692+sx*.252,1.050,-1.276,M.titanium,24,.034,[0,0,Math.PI/2]);
  }
  // Physical projector throat for future holographic output; no generated light.
  const projector=group(root,'PROJECTOR_low_sill_'+sign,sign*.94,.901,-.64);
  box(projector,'PROJECTOR_cartridge_housing',.14,.052,.31,0,0,0,M.structure,.017);
  box(projector,'PROJECTOR_recessed_optical_slot',.089,.011,.225,0,.031,0,M.lens,.006);
  for(const z of [-.135,.135])bolt(projector,0,.034,z,'y',.011);
  const pa=group(projector,'EMPTY_FIGHTER_'+(sign<0?'PORT':'STARBOARD')+'_PROJECTOR',0,.054,0);pa.userData={role:'future projector output; physical optical slot only',dimensions:[.42,.32,0]};
  // Controls are grouped by hand use, with guarded critical controls separated.
  const bank=group(root,'CONTROL_recessed_auxiliary_module_'+sign,sign*.856,.887,.437);
  box(bank,'CONTROL_recessed_gasket',.246,.024,.386,0,0,0,M.rubber,.025);
  box(bank,'CONTROL_removable_control_plate',.226,.025,.364,0,.016,0,M.black,.019);
  for(const x of [-.083,.083])for(const z of [-.139,.139])bolt(bank,x,.035,z,'y',.010);
  for(let i=0;i<3;i++){
    const z=-.103+i*.10;box(bank,'CONTROL_rocker_well',.071,.011,.055,-.045,.034,z,M.secondary,.006);
    box(bank,'CONTROL_concave_rocker',.052,.024,.039,-.045,.047,z,M.cladding,.009,[0,0,.08]);
    cylinder(bank,'CONTROL_small_status_lens',.007,.006,.055,.039,z,M.cyanLight,12);
  }
  fighterRotary(root,sign*.928,.883,.846,.034);
  fighterRotary(root,sign*.730,.883,.846,.027,M.secondary);
  const guard=group(root,'CONTROL_guarded_override_'+sign,sign*.897,.906,-.185);
  box(guard,'CONTROL_guard_base',.10,.027,.14,0,0,0,M.black,.012);
  for(const x of [-.040,.040])beam(guard,'CONTROL_guard_upright',[x,.011,-.032],[x,.053,.033],.013,.012,M.titanium,.003);
  beam(guard,'CONTROL_guard_crossbar',[-.040,.053,.033],[.040,.053,.033],.013,.013,M.titanium,.003);
  cylinder(guard,'CONTROL_override_button',.020,.025,0,.023,-.030,M.copper,24);
  if(sign>0) {
    const stick=group(root,'CONTROL_right_flight_side_stick',.620,.882,-.074);
    polygon(stick,'STICK_base_mount',chamferRect(.196,.248,.045),.046,M.structure,0,.024,0,.016,[-Math.PI/2,0,0]);
    for(const z of [-.083,.083])bolt(stick,0,.054,z,'y',.012);
    cylinder(stick,'STICK_gimbal_seal',.067,.033,0,.069,0,M.rubber,36);
    cylinder(stick,'STICK_gimbal_bearing_ring',.051,.014,0,.092,0,M.titanium,32);
    beam(stick,'STICK_sculpted_neck',[0,.082,0],[-.020,.184,-.048],.043,.048,M.structure,.012);
    box(stick,'STICK_anatomic_grip',.076,.171,.078,-.026,.205,-.048,M.rubber,.022,[.17,0,-.11]);
    box(stick,'STICK_palm_swell',.086,.078,.095,-.021,.174,-.040,M.rubber,.023,[.17,0,-.11]);
    box(stick,'STICK_thumb_rest',.093,.025,.077,-.035,.286,-.055,M.secondary,.010,[.12,0,-.10]);
    cylinder(stick,'STICK_thumb_hat',.018,.013,-.033,.311,-.068,M.black,8);
    box(stick,'STICK_index_trigger',.041,.052,.019,-.026,.249,-.097,M.titanium,.006,[.17,0,0]);
    cylinder(stick,'STICK_guarded_button',.011,.012,-.002,.306,-.043,M.copper,16);
    box(root,'CONTROL_right_forearm_pad',.155,.054,.318,.628,.922,.258,M.leather,.025);
  } else {
    const throttle=group(root,'CONTROL_left_thrust_quadrant',-.655,.895,-.106);
    box(throttle,'THROTTLE_quadrant_gasket',.220,.035,.458,0,0,0,M.rubber,.025);
    box(throttle,'THROTTLE_machined_quadrant',.197,.043,.431,0,.020,0,M.structure,.019);
    for(const x of [-.060,.060]){
      box(throttle,'THROTTLE_longitudinal_slot',.023,.009,.346,x,.047,0,M.black,.008);
      box(throttle,'THROTTLE_polished_slot_guide',.009,.014,.343,x+.016,.051,0,M.titanium,.004);
    }
    box(throttle,'THROTTLE_sliding_carriage',.170,.052,.083,0,.068,-.030,M.titanium,.012);
    for(const x of [-.058,.058])beam(throttle,'THROTTLE_dual_arm',[x,.085,-.03],[x,.164,-.044],.024,.031,M.structure,.005);
    box(throttle,'THROTTLE_hand_grip',.190,.082,.096,0,.177,-.051,M.rubber,.023,[.09,0,0]);
    box(throttle,'THROTTLE_thumb_extension',.037,.051,.076,.099,.177,-.049,M.secondary,.012);
    cylinder(throttle,'THROTTLE_thumb_rotary',.019,.026,.112,.183,-.049,M.titanium,16,.019,[0,0,Math.PI/2]);
    box(throttle,'THROTTLE_finger_release',.115,.020,.025,0,.143,-.110,M.titanium,.005);
    for(const z of [-.186,.186])for(const x of [-.071,.071])bolt(throttle,x,.047,z,'y',.012);
    box(root,'CONTROL_left_forearm_pad',.168,.054,.305,-.615,.922,.283,M.leather,.025);
  }
  // Practical lights sit under an actual shield, lighting hands without glare.
  box(root,'LIGHT_console_shield',.33,.048,.075,sign*.81,.827,-.43,M.black,.013);
  box(root,'LIGHT_console_diffuser',.274,.014,.044,sign*.81,.799,-.43,M.whiteLight,.007);
  const lamp=group(root,'LIGHT_reading_lamp_'+sign,sign*.976,1.045,.697);
  cylinder(lamp,'LIGHT_pivot_bearing',.030,.061,0,0,0,M.titanium,20,.03,[0,0,Math.PI/2]);
  beam(lamp,'LIGHT_stalk',[0,0,0],[-sign*.090,.154,-.020],.022,.024,M.black,.006);
  box(lamp,'LIGHT_shrouded_task_head',.107,.039,.101,-sign*.090,.151,-.020,M.structure,.014,[.14,0,0]);
  box(lamp,'LIGHT_task_diffuser',.077,.012,.070,-sign*.090,.126,-.024,M.whiteLight,.006,[.14,0,0]);
}

function fighterFrontAndPedals() {
  const front=group(interior,'06_FORWARD_COAMING_LEGWELL_AND_PEDALS');
  const nose=[[-.35,-2.18],[.35,-2.18],[.54,-1.72],[.52,-1.43],[.28,-1.30],[-.28,-1.30],[-.52,-1.43],[-.54,-1.72]];
  deckPoly(front,'COAMING_low_formed_forward_cover',nose,.108,.889,M.structure);
  deckPoly(front,'COAMING_nonreflective_upper_pad',nose.map(p=>[p[0]*.974,p[1]+.006]),.022,.914,M.rubber);
  tube(front,'COAMING_forward_service_rebate',[[-.39,.842,-2.10],[0,.842,-2.16],[.39,.842,-2.10]],.012,M.titanium);
  fighterDisplayCradle(front,'FIGHTER_LOWER_MAIN_DISPLAY',.518,.284,0,1.03,-1.668,-.56,0);
  for(const s of [-1,1]) {
    polygon(front,'LEGWELL_side_protection_liner_'+s,[[-.44,-.06],[.26,-.06],[.32,.41],[.17,.59],[-.36,.47]],.042,M.cladding,s*.443,.285,-1.23,.017,[0,s*Math.PI/2,0]);
    tube(front,'LEGWELL_padded_knee_edge_'+s,[[s*.414,.767,-1.63],[s*.419,.725,-1.33],[s*.447,.603,-.934]],.029,M.rubber);
    box(front,'PEDAL_floor_rail_'+s,.085,.045,.566,s*.218,.162,-1.401,M.structure,.011);
    box(front,'PEDAL_slide_surface_'+s,.041,.017,.490,s*.218,.194,-1.401,M.titanium,.004);
    box(front,'PEDAL_carriage_'+s,.125,.084,.133,s*.218,.226,-1.44,M.black,.015);
    cylinder(front,'PEDAL_main_pivot_'+s,.038,.24,s*.218,.292,-1.450,M.titanium,24,.038,[0,0,Math.PI/2]);
    const pedal=group(front,'PEDAL_articulated_footplate_'+s,s*.218,.389,-1.455);pedal.rotation.x=-.36;
    polygon(pedal,'PEDAL_formed_footplate',chamferRect(.196,.282,.036),.027,M.structure,0,0,0,.008);
    frameShape(pedal,'PEDAL_perimeter_edge',chamferRect(.203,.291,.036),chamferRect(.174,.260,.028),.019,M.titanium,0,0,.017,.004);
    box(pedal,'PEDAL_heel_cup',.189,.036,.105,0,-.116,.049,M.black,.012);
    for(const y of [-.045,.013,.071])box(pedal,'PEDAL_grip_tread',.136,.015,.010,0,y,.025,M.rubber,.004);
    for(const x of [-.066,.066])bolt(pedal,x,.108,.035,'z',.010);
    beam(front,'PEDAL_link_rod_'+s,[s*.218,.242,-1.472],[s*.218,.292,-1.793],.019,.024,M.titanium,.004);
    cylinder(front,'PEDAL_adjustment_collar_'+s,.032,.075,s*.218,.197,-1.174,M.secondary,16,.032,[Math.PI/2,0,0]);
  }
  box(front,'LEGWELL_light_shroud',.34,.06,.107,0,.74,-1.791,M.black,.014);
  box(front,'LEGWELL_recessed_diffuser',.284,.012,.070,0,.704,-1.777,M.whiteLight,.007);
  // Compact collimator output slot reserves an unobstructed future HUD origin.
  box(front,'OPTIC_embedded_projector_rim',.226,.025,.116,0,.928,-1.721,M.secondary,.014);
  box(front,'OPTIC_dark_recessed_lens',.187,.012,.083,0,.945,-1.721,M.lens,.009);
  const a=group(front,'EMPTY_FIGHTER_FORWARD_OPTIC',0,1.40,-1.96);a.userData={role:'future fighter HUD plane; mount is the low coaming optic, no visible display geometry',dimensions:[1.00,.63,0]};
  for(const x of [-.231,.231])bolt(front,x,.926,-1.988,'y',.011);
}

function fighterAft() {
  const aft=group(interior,'07_AFT_PRESSURE_BULKHEAD_AND_SERVICE_SYSTEMS');
  const outline=[[-.87,.08],[.87,.08],[1.11,.62],[1.08,1.45],[.82,2.03],[.47,2.29],[-.47,2.29],[-.82,2.03],[-1.08,1.45],[-1.11,.62]];
  polygon(aft,'AFT_pressure_closure',outline,.11,M.structure,0,0,1.648,.033);
  const inner=[[-.74,.22],[.74,.22],[.94,.69],[.91,1.40],[.69,1.89],[.40,2.08],[-.40,2.08],[-.69,1.89],[-.91,1.40],[-.94,.69]];
  frameShape(aft,'AFT_bulkhead_machined_step',outline,inner,.042,M.titanium,0,0,1.579,.013);
  polygon(aft,'AFT_replaceable_service_liner',inner,.032,M.cladding,0,0,1.553,.015);
  for(const s of [-1,1]){
    const service=group(aft,'AFT_service_bay_'+s,s*.704,1.12,1.488);
    polygon(service,'AFT_module_seal',chamferRect(.305,.79,.060),.028,M.black,0,0,0,.008);
    polygon(service,'AFT_module_removable_face',chamferRect(.273,.75,.047),.036,M.secondary,0,0,-.032,.014);
    for(const y of [-.30,.30])for(const x of [-.094,.094])bolt(service,x,y,-.061,'z',.014);
    for(const y of [-.22,.00,.23]){
      cylinder(service,'AFT_service_socket_outer',.052,.028,0,y,-.069,M.titanium,24,.052,[Math.PI/2,0,0]);
      cylinder(service,'AFT_service_socket_dust_cap',.037,.033,0,y,-.087,M.black,20,.037,[Math.PI/2,0,0]);
      box(service,'AFT_socket_release_bar',.049,.011,.013,0,y,-.109,M.secondary,.004);
    }
    tube(aft,'AFT_life_support_hose_'+s,[[s*.699,.897,1.370],[s*.87,.815,1.225],[s*.89,.54,1.08],[s*.718,.342,.753],[s*.48,.304,.785]],.029,M.rubber);
    for(let i=0;i<6;i++)ring(aft,'AFT_hose_strain_relief_'+s,.034,.004,s*.48,.304,.754+i*.011,M.secondary,[0,0,0]);
    box(aft,'AFT_cable_anchor_'+s,.098,.13,.057,s*.87,.652,1.12,M.titanium,.008);
    bolt(aft,s*.87,.681,1.080,'z',.012);
    box(aft,'AFT_shoulder_air_plenum_'+s,.23,.144,.244,s*.717,1.688,1.315,M.structure,.023,[-.13,-s*.18,0]);
    const vent=group(aft,'AFT_adjustable_air_outlet_'+s,s*.71,1.66,1.166);vent.rotation.set(-.13,-s*.18,0);
    frameShape(vent,'VENT_machined_bezel',chamferRect(.166,.08,.018),chamferRect(.142,.057,.012),.023,M.titanium,0,0,0,.003);
    polygon(vent,'VENT_dark_inner_throat',chamferRect(.142,.057,.012),.010,M.black,0,0,-.009,.003);
    for(const x of [-.048,0,.048])box(vent,'VENT_adjustable_vane',.010,.048,.024,x,0,-.019,M.secondary,.003,[0,.28,0]);
    box(aft,'AFT_emergency_lamp_body_'+s,.095,.116,.070,s*.846,.57,1.271,M.black,.016);
    box(aft,'AFT_emergency_diffuser_'+s,.057,.069,.018,s*.846,.57,1.225,M.redLight,.009);
  }
  // Central service spine, detachable cover and canopy hinge overhead service.
  polygon(aft,'AFT_spine_inspection_cover',chamferRect(.477,.946,.071),.046,M.structure,0,1.26,1.495,.015);
  polygon(aft,'AFT_spine_dark_gasket',chamferRect(.369,.327,.043),.012,M.black,0,1.858,1.481,.005);
  polygon(aft,'AFT_spine_upper_filter_cover',chamferRect(.340,.296,.036),.024,M.secondary,0,1.858,1.464,.008);
  slotBank(aft,0,1.858,1.442,5,.236,.048,'z');
  for(const x of [-.182,.182])for(const y of [.904,1.58])bolt(aft,x,y,1.458,'z',.014);
  box(aft,'AFT_spine_recessed_pull',.154,.035,.024,0,1.504,1.46,M.black,.006);
  const serviceDoor=group(aft,'AFT_lower_maintenance_hatch',0,.342,1.484);
  polygon(serviceDoor,'AFT_hatch_seal',chamferRect(.516,.361,.053),.022,M.rubber,0,0,0,.007);
  polygon(serviceDoor,'AFT_hatch_cover',chamferRect(.484,.330,.045),.031,M.secondary,0,0,-.019,.011);
  for(const x of [-.185,.185])for(const y of [-.10,.10])bolt(serviceDoor,x,y,-.044,'z',.013);
  box(serviceDoor,'AFT_hatch_pull_recess',.134,.032,.014,0,.092,-.039,M.black,.006);
  // A physical linear lamp is tucked into the rear arch, clear of pilot's eyes.
  box(aft,'LIGHT_aft_arch_mounted_housing',.608,.065,.154,0,2.159,1.343,M.structure,.019,[.16,0,0]);
  box(aft,'LIGHT_aft_arch_diffuser',.528,.014,.106,0,2.117,1.325,M.whiteLight,.009,[.16,0,0]);
  for(const s of [-1,1]){
    box(aft,'LIGHT_rear_lamp_bracket_'+s,.057,.13,.095,s*.239,2.205,1.402,M.titanium,.011);
    bolt(aft,s*.239,2.218,1.341,'z',.014);
  }
}

function buildCraft() {
  fighterTubAndStructure();fighterSeat();fighterSideConsole(-1);fighterSideConsole(1);fighterFrontAndPedals();fighterAft();
}

function buildCraftLights(lights) {
  const hemi=new T.HemisphereLight(0xdbe3df,0x45515a,.65);hemi.name='FIGHTER_soft_canopy_and_surface_bounce';lights.add(hemi);
  const overhead=new T.RectAreaLight(0xdce4de,4.8,.528,.106);overhead.name='FIGHTER_aft_arch_actual_diffuser';overhead.position.set(0,2.106,1.325);overhead.lookAt(0,.58,-.42);lights.add(overhead);
  for(const s of [-1,1]) {
    const hand=new T.RectAreaLight(0xdce9e4,3.2,.077,.070);hand.name='FIGHTER_shrouded_task_head_'+s;hand.position.set(s*.886,1.164,.673);hand.lookAt(s*.65,.85,.07);lights.add(hand);
    const sill=new T.PointLight(0xc5d8d7,.82,1.40,2);sill.name='FIGHTER_under_console_diffuser_'+s;sill.position.set(s*.81,.78,-.43);lights.add(sill);
    const emergency=new T.PointLight(0xb74d36,.08,.65,2);emergency.name='FIGHTER_rear_emergency_fixture_'+s;emergency.position.set(s*.846,.57,1.16);lights.add(emergency);
  }
  const foot=new T.PointLight(0xdce6df,.88,1.55,2);foot.name='FIGHTER_actual_legwell_diffuser';foot.position.set(0,.676,-1.74);lights.add(foot);
  // Broad soft illumination models the light scattered through the clear canopy;
  // this creates readable material reflections without any external scenery.
  const fill=new T.DirectionalLight(0xc3d0d0,1.04);fill.name='FIGHTER_diffuse_canopy_bounce';fill.position.set(-1.3,3.9,-1.8);fill.target.position.set(0,.70,.14);fill.castShadow=true;fill.shadow.mapSize.set(1024,1024);fill.shadow.camera.left=-2;fill.shadow.camera.right=2;fill.shadow.camera.top=2;fill.shadow.camera.bottom=-2;fill.shadow.camera.near=.1;fill.shadow.camera.far=8;fill.shadow.bias=-.0003;fill.shadow.normalBias=.009;lights.add(fill,fill.target);
}



return {craft:CRAFT,build:buildCraft,light:buildCraftLights};
}
