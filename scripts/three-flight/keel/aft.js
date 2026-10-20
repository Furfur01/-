// Imported from the user-provided KEEL interior; editable geometry preserved.
export function buildAftBulkhead({ THREE, RoundedBoxGeometry, M }) {
  const root = new THREE.Group();
  root.name = 'AFT / pressure bulkhead and service equipment';
  const cache = new Map();
  const group = (name, parent = root) => {
    const g = new THREE.Group(); g.name = name; parent.add(g); return g;
  };
  const structure = group('01 / pressure shell and load paths');
  const door = group('02 / closed double pressure door');
  const service = group('03 / paired service cabinets');
  const overhead = group('04 / overhead distribution trunk');
  const lighting = group('05 / recessed practical fixtures');
  function mesh(parent, name, geometry, material, x, y, z, rx = 0, ry = 0, rz = 0) {
    const o = new THREE.Mesh(geometry, material);
    o.name = name; o.position.set(x, y, z); o.rotation.set(rx, ry, rz);
    o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
  }
  function box(parent, name, p, s, material, radius = 0.014, segments = 1) {
    const r = Math.min(radius, ...s.map(v => v * 0.35));
    const key = ['b', ...s, r, segments].join('/');
    if (!cache.has(key)) cache.set(key, r > 0
      ? new RoundedBoxGeometry(s[0], s[1], s[2], segments, r)
      : new THREE.BoxGeometry(s[0], s[1], s[2]));
    return mesh(parent, name, cache.get(key), material, ...p);
  }
  function cylinder(parent, name, p, radius, length, material, sides = 12, alongZ = true) {
    const key = ['c', radius, length, sides].join('/');
    if (!cache.has(key)) cache.set(key, new THREE.CylinderGeometry(radius, radius, length, sides));
    return mesh(parent, name, cache.get(key), material, ...p, alongZ ? Math.PI / 2 : 0);
  }
  function poly(parent, name, pts, z, depth, material, bevel = 0.01, holes = []) {
    const shape = new THREE.Shape();
    shape.moveTo(...pts[0]); pts.slice(1).forEach(p => shape.lineTo(...p)); shape.closePath();
    holes.forEach(points => {
      const hole = new THREE.Path(); hole.moveTo(...points[0]);
      points.slice(1).forEach(p => hole.lineTo(...p)); hole.closePath(); shape.holes.push(hole);
    });
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth, steps: 1, bevelEnabled: bevel > 0, bevelSegments: 1,
      bevelThickness: bevel, bevelSize: bevel, curveSegments: 1
    });
    return mesh(parent, name, geo, material, 0, 0, z);
  }
  function cutRect(x0, x1, y0, y1, c = 0.07) {
    return [[x0+c,y0],[x1-c,y0],[x1,y0+c],[x1,y1-c],
      [x1-c,y1],[x0+c,y1],[x0,y1-c],[x0,y0+c]];
  }
  function bolt(parent, name, x, y, z, radius = 0.018) {
    cylinder(parent, name + ' / captive socket rim', [x,y,z], radius, 0.009, M.titanium, 8);
    cylinder(parent, name + ' / socket recess', [x,y,z-0.0055], radius*0.47, 0.002, M.black, 6);
  }
  function rail(parent, name, a, b, width, depth, material) {
    const d = new THREE.Vector3().subVectors(new THREE.Vector3(...b),new THREE.Vector3(...a));
    const o = box(parent, name, a.map((n,i) => (n+b[i])*0.5), [width,d.length(),depth],material,0.012);
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()); return o;
  }

  // The continuous pressure shell terminates at the roof's inclined shoulders.
  poly(structure, 'continuous 260 mm pressure bulkhead', [
    [-6.46,.285],[6.46,.285],[6.46,3.43],[4.91,4.845],[-4.91,4.845],[-6.46,3.43]
  ], 6.385, .26, M.structure, 0);
  box(structure,'recessed base load sill',[0,.375,6.315],[12.83,.18,.22],M.black,.024);
  for (const side of [-1,1]) {
    const s = group(side < 0 ? 'port integrated wall field' : 'starboard integrated wall field',structure);
    const points = [
      [1.45,.50],[6.32,.50],[6.32,3.39],[4.85,4.71],[1.45,4.71]
    ].map(([x,y]) => [side*x,y]);
    if(side<0) points.reverse();
    poly(s,'large removable wall lining',points,6.337,.032,M.cladding,.014);
    box(s,'primary portal column',[side*1.51,2.15,6.245],[.27,3.66,.25],M.structure,.032,2);
    box(s,'portal column titanium contact strip',[side*1.51,2.10,6.101],[.065,3.25,.026],M.titanium,.011);
    box(s,'column floor shoe',[side*1.51,.49,6.16],[.40,.36,.37],M.structure,.032,2);
    rail(s,'upper diagonal portal knee',[side*1.51,3.71,6.235],[side*2.18,4.73,6.235],.24,.26,M.structure);
    box(s,'outer cabinet boundary post',[side*5.95,1.92,6.22],[.21,2.9,.25],M.structure,.025);
    poly(s,'outer shoulder inset',[
      [side*4.9,3.50],[side*6.10,3.50],[side*4.80,4.65]
    ],6.275,.045,M.secondary,.014);
    box(s,'upper wall horizontal interface',[side*3.62,3.57,6.20],[3.79,.13,.26],M.structure,.018);
    box(s,'lower removable service sill',[side*3.71,.58,6.16],[4.13,.20,.35],M.secondary,.025);
    // Only structural panel corners carry exposed, captive fasteners.
    for(const x of [1.91,5.59]) {
      bolt(s,'upper lining fastener',side*x,3.83,6.283,.023);
      bolt(s,'sill fastener',side*x,.59,5.979,.022);
    }
  }

  // The frame is a single bevelled extrusion with a real opening and deep reveal.
  const outer = cutRect(-1.32,1.32,.285,3.115,.17);
  const opening = cutRect(-.885,.885,.318,2.805,.095).reverse();
  poly(door,'cast pressure door frame',outer,6.055,.327,M.structure,.021,[opening]);
  poly(door,'continuous metallic seal carrier',cutRect(-.953,.953,.30,2.874,.103),6.041,.043,
    M.titanium,.009,[cutRect(-.883,.883,.323,2.804,.09).reverse()]);
  poly(door,'inner black compression gasket',cutRect(-.886,.886,.323,2.804,.09),6.092,.043,
    M.rubber,.004,[cutRect(-.844,.844,.344,2.769,.074).reverse()]);
  box(door,'backing inside the sealed door',[0,1.548,6.325],[1.79,2.49,.09],M.black,.02);
  box(door,'flush threshold plate',[0,.306,6.065],[1.72,.027,.46],M.titanium,.01);
  for (const x of [-.61,-.40,-.20,0,.20,.40,.61])
    box(door,'threshold traction insert',[x,.321,6.05],[.085,.004,.27],M.rubber,.002);

  for (const side of [-1,1]) {
    const leaf = group(side<0 ? 'port sliding armored leaf' : 'starboard sliding armored leaf',door);
    const cx = side*.43;
    poly(leaf,'bevelled load bearing door leaf',cutRect(cx-.419,cx+.419,.343,2.774,.068),6.128,.17,M.secondary,.017);
    poly(leaf,'upper inset armor plate',cutRect(cx-.357,cx+.357,1.235,2.641,.087),6.090,.044,M.cladding,.014);
    poly(leaf,'lower inset armor plate',cutRect(cx-.357,cx+.357,.455,1.150,.071),6.090,.044,M.cladding,.014);
    box(leaf,'horizontal internal latch cover',[cx,1.190,6.066],[.736,.072,.042],M.titanium,.01);
    box(leaf,'protected central sealing edge',[side*.039,1.56,6.058],[.044,2.365,.074],M.structure,.009);
    box(leaf,'lower boot guard',[cx,.666,6.053],[.59,.28,.024],M.structure,.02);
    for(let i=0;i<3;i++)
      box(leaf,'boot guard relief groove',[cx,.607+i*.059,6.038],[.44,.017,.004],M.black,.002);
    // Recessed release handle, with a broad panel recess and two actual mount ears.
    const hx=side*.586;
    poly(leaf,'release handle pocket',cutRect(hx-.081,hx+.081,1.475,1.915,.04),6.060,.024,M.black,.004);
    box(leaf,'upper handle pivot block',[hx,1.854,6.018],[.09,.053,.068],M.titanium,.01);
    box(leaf,'lower handle pivot block',[hx,1.540,6.018],[.09,.053,.068],M.titanium,.01);
    box(leaf,'vertical recessed release grip',[hx,1.697,5.996],[.045,.30,.043],M.secondary,.018,2);
    box(leaf,'recessed inspection strip',[cx,2.513,6.068],[.49,.064,.012],M.structure,.009);
    for(const y of [.96,2.37]) {
      bolt(leaf,'armor panel fixing',side*.702,y,6.044,.019);
      bolt(leaf,'armor panel fixing',side*.167,y,6.044,.019);
    }
    // The lock cylinder sits within the deep side jamb rather than on the door leaf.
    const jamb = group('jamb lock and service interface',door);
    box(jamb,'lock actuator recess',[side*1.113,1.853,6.027],[.238,.778,.028],M.black,.033);
    box(jamb,'lock actuator upper housing',[side*1.113,2.070,5.995],[.168,.281,.100],M.secondary,.022);
    box(jamb,'lock actuator lower housing',[side*1.113,1.595,5.995],[.168,.205,.100],M.secondary,.022);
    cylinder(jamb,'exposed lock piston',[side*1.113,1.82,5.983],.033,.31,M.titanium,12,false);
    cylinder(jamb,'piston safety collar',[side*1.113,1.722,5.983],.047,.047,M.copper,12,false);
    for(const y of [1.60,2.12]) bolt(jamb,'actuator mount',side*1.114,y,5.937,.021);
    box(jamb,'recessed emergency service socket well',[side*1.11,.932,6.024],[.234,.350,.042],M.black,.028);
    cylinder(jamb,'sealed service connector collar',[side*1.11,.993,5.994],.067,.043,M.titanium,12);
    cylinder(jamb,'service connector cap',[side*1.11,.993,5.968],.049,.016,M.secondary,12);
    box(jamb,'connector quarter turn handle',[side*1.11,.993,5.952],[.015,.066,.016],M.structure,.006);
    cylinder(jamb,'service pressure relief',[side*1.11,.838,5.991],.032,.037,M.copper,10);
    for(const y of [.493,2.68]) bolt(jamb,'frame retained bolt',side*1.149,y,6.006,.026);
  }
  box(door,'central compressible sealing seam',[0,1.557,6.109],[.016,2.393,.033],M.rubber,.005);
  box(door,'door drive removable overhead cassette',[0,2.975,6.011],[1.95,.19,.076],M.secondary,.024);
  box(door,'drive cassette lower service seam',[0,2.893,5.966],[1.47,.019,.009],M.black,.003);
  for(const x of [-.857,.857]) bolt(door,'drive cassette fixing',x,2.978,5.964,.022);
  box(door,'mechanical door lock witness',[0,2.971,5.965],[.171,.051,.018],M.black,.008);
  box(door,'small locked indicator lens',[0,2.971,5.953],[.055,.013,.006],M.cyanLight,.003);

  // Two coherent equipment fields share a plinth, carrier rails and roof connection.
  for (const side of [-1,1]) {
    const g=group(side<0?'port power and environmental service bank':'starboard avionics and distribution service bank',service);
    const inner=side*2.67, outerX=side*4.715;
    box(g,'continuous bank mounting cradle',[side*3.70,.79,6.197],[4.00,.31,.38],M.structure,.02);
    box(g,'inner cabinet recessed shadow surround',[inner,2.095,6.243],[1.80,2.69,.27],M.black,.036);
    box(g,'inner cabinet pressure casing',[inner,2.095,6.193],[1.697,2.605,.33],M.secondary,.044,2);
    box(g,'inner cabinet main service door',[inner,2.139,5.998],[1.548,2.373,.073],M.cladding,.031,2);
    // The lower intake is separate from the main electrical compartment.
    box(g,'inner cabinet lower filtered intake',[inner,1.14,5.951],[1.269,.251,.023],M.black,.022);
    for(let i=0;i<5;i++)
      box(g,'filtered intake protective louvre',[inner,1.048+i*.041,5.930],[1.19,.017,.029],M.secondary,.004);
    box(g,'upper electrical access cover',[inner,2.795,5.948],[1.277,.672,.027],M.secondary,.022);
    box(g,'gasket beneath central access seam',[inner,2.399,5.95],[1.263,.021,.021],M.rubber,.003);
    // A manual isolator is protected by a distinct, deeply recessed pocket.
    box(g,'manual isolation switch pocket',[inner-side*.401,1.810,5.947],[.254,.424,.043],M.black,.032);
    cylinder(g,'manual isolation pivot',[inner-side*.401,1.83,5.921],.070,.037,M.titanium,12);
    const isolator=box(g,'guarded isolation lever',[inner-side*.401,1.825,5.885],[.041,.218,.039],M.copper,.016);
    isolator.rotation.z=side*.34;
    box(g,'lever upper guard',[inner-side*.401,2.037,5.916],[.27,.046,.10],M.structure,.014);
    box(g,'lever lower guard',[inner-side*.401,1.589,5.916],[.27,.046,.10],M.structure,.014);
    const hingeX=inner+side*.713;
    for(const y of [1.465,2.953]) {
      box(g,'captive service door hinge',[hingeX,y,5.933],[.083,.155,.098],M.structure,.016);
      cylinder(g,'hinge axis',[hingeX,y,5.934],.020,.172,M.titanium,8,false);
    }
    for(const x of [-.567,.567]) for(const y of [2.57,3.02])
      bolt(g,'electrical cover fixing',inner+x,y,5.925,.016);
    box(g,'inner cabinet lower cable-entry saddle',[inner,.901,6.08],[.89,.195,.355],M.structure,.025);

    box(g,'outer cabinet recessed shadow surround',[outerX,2.095,6.243],[1.87,2.69,.27],M.black,.035);
    box(g,'outer cabinet main casing',[outerX,2.095,6.188],[1.767,2.605,.34],M.secondary,.045,2);
    box(g,'outer cabinet upper removable door',[outerX,2.703,5.984],[1.594,1.161,.067],M.cladding,.028,2);
    box(g,'outer cabinet lower removable door',[outerX,1.48,5.984],[1.594,1.195,.067],M.cladding,.028,2);
    box(g,'bank horizontal junction rail',[outerX,2.09,5.952],[1.627,.078,.064],M.structure,.012);
    // Broad heat exchangers have consistent fins, side headers and fastener ears.
    box(g,'upper cooling core shadow well',[outerX,2.721,5.943],[1.21,.781,.040],M.black,.022);
    for(let i=0;i<11;i++)
      box(g,'passive cooling core fin',[outerX-.491+i*.098,2.721,5.913],[.028,.640,.036],M.secondary,.006);
    for(const y of [2.36,3.083])
      box(g,'heat exchanger header',[outerX,y,5.923],[1.151,.048,.064],M.titanium,.008);
    box(g,'lower maintenance inset',[outerX,1.587,5.936],[1.177,.714,.035],M.secondary,.022);
    box(g,'lower panel flush pull recess',[outerX-side*.434,1.572,5.912],[.109,.299,.024],M.black,.016);
    box(g,'lower panel flush pull metal',[outerX-side*.434,1.572,5.894],[.021,.203,.028],M.titanium,.009);
    for(const x of [-.514,.514]) for(const y of [1.31,1.87])
      bolt(g,'lower maintenance cover fixing',outerX+x,y,5.913,.016);
    box(g,'outer bank anti-vibration foot',[outerX,.879,6.075],[1.18,.138,.368],M.rubber,.02);

    // The deliberate narrow slot between bays carries four real utility pipes.
    const race=side*3.716;
    box(g,'vertical utility race recessed tray',[race,2.178,6.167],[.185,2.304,.192],M.black,.018);
    for(const offset of [-.038,.038]) {
      cylinder(g,'protected vertical fluid line',[race+offset,2.171,6.042],.024,1.934,M.titanium,10,false);
      for(const y of [1.402,2.931]) cylinder(g,'line coupling sleeve',[race+offset,y,6.042],.034,.078,M.secondary,10,false);
    }
    for(const y of [1.562,2.720])
      box(g,'shared utility pipe clamp',[race,y,6.010],[.179,.065,.046],M.secondary,.010);
    // Equipment status is a single pin light; no screens, decals or inscriptions.
    box(g,'bank status recess',[inner,3.18,5.945],[.226,.043,.015],M.black,.007);
    cylinder(g,'bank live indicator lens',[inner+side*.063,3.18,5.932],.010,.007,M.cyanLight,10);
  }

  box(overhead,'central overhead lintel',[0,3.425,6.195],[3.34,.221,.365],M.structure,.033,2);
  box(overhead,'central overhead service casing',[0,3.865,6.191],[2.749,.53,.299],M.secondary,.055,2);
  box(overhead,'central overhead inset cover',[0,3.865,6.021],[2.438,.353,.055],M.cladding,.025);
  box(overhead,'central cover upper expansion seam',[0,4.068,6.034],[2.091,.019,.016],M.black,.003);
  for(const x of [-1.096,1.096]) bolt(overhead,'overhead cover captive fixing',x,3.862,5.986,.024);
  box(overhead,'roof distribution trunk backing',[0,4.472,6.26],[8.78,.365,.235],M.black,.029);
  box(overhead,'roof distribution trunk outer casing',[0,4.476,6.165],[8.594,.29,.291],M.secondary,.039,2);
  for(const x of [-3.875,-1.937,0,1.937,3.875])
    box(overhead,'roof trunk removable panel clamp',[x,4.48,5.999],[.091,.335,.055],M.structure,.011);
  for(const side of [-1,1]) {
    box(overhead,'cable drop rear tray',[side*5.77,3.014,6.213],[.157,1.217,.191],M.black,.019);
    box(overhead,'cable drop enclosed cover',[side*5.77,3.023,6.105],[.128,1.129,.076],M.secondary,.019);
    rail(overhead,'sloping shoulder distribution casing',[side*4.33,4.47,6.165],[side*5.70,3.38,6.165],.194,.233,M.secondary);
    box(overhead,'shoulder conduit junction housing',[side*5.70,3.385,6.12],[.294,.278,.273],M.structure,.029);
  }

  // Shielded, unlabelled luminaires; the roof lighting supplies the actual room fill.
  for(const side of [-1,1]) {
    const x=side*1.737;
    box(lighting,'door emergency lamp impact housing',[x,2.984,6.075],[.163,.292,.142],M.structure,.031,2);
    box(lighting,'recessed emergency lamp red glass',[x,2.984,5.988],[.073,.196,.030],M.redLight,.022,2);
    for(const y of [2.928,3.044])
      box(lighting,'lamp metal impact guard',[x,y,5.965],[.134,.021,.027],M.titanium,.006);
    box(lighting,'equipment worklight recessed housing',[side*3.718,3.684,6.175],[3.11,.12,.211],M.structure,.021);
    box(lighting,'equipment worklight opal diffuser',[side*3.718,3.636,6.137],[2.847,.019,.122],M.whiteLight,.008);
    box(lighting,'worklight forward glare visor',[side*3.718,3.674,6.048],[3.146,.067,.035],M.structure,.01);
    box(lighting,'low level door approach light well',[side*1.514,.752,6.018],[.235,.104,.051],M.black,.016);
    box(lighting,'low level approach diffuser',[side*1.514,.748,5.989],[.147,.021,.013],M.whiteLight,.004);
  }
  root.userData = { module: 'aft_bulkhead', wallFront: 6.385, wallBack: 6.645,
    clearDoorWidth: 1.688, clearDoorHeight: 2.425, editableGroups: true };
  return root;
}
