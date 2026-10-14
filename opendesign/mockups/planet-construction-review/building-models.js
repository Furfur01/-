import * as THREE from 'three';

// Review-only models. One shared, matte palette belongs to the colony and its terrain.
// Coordinates are local Y-up; doors and service connections face +Z by default.
const PALETTE = {
  shell: 0xe2d9c5, stone: 0xa49d8b, frame: 0x62645b, dark: 0x303a37,
  orange: 0xd99043, metal: 0xb77b58, crystal: 0x81b8bd, gas: 0x8fa67c,
  panel: 0x3b4b50,
};
const geometries = new Map();
const materials = new Map();
const IDS = new Set([
  'Metal_Mine', 'Metal_Storage', 'Crystal_Mine', 'Crystal_Storage', 'Gas_Mine',
  'Gas_Storage', 'Command_Center', 'Solar_Plant', 'Fusion_Reactor', 'Robotics_Facility',
  'Shipyard', 'Research_Lab', 'Radar_Facility', 'Alliance_Depot', 'Nanite_Factory',
  'Terraformer', 'Missile_Silo',
]);

function geometry(key) {
  if (!geometries.has(key)) {
    let value;
    switch (key) {
      case 'box': value = new THREE.BoxGeometry(1, 1, 1); break;
      case 'cylinder': value = new THREE.CylinderGeometry(1, 1, 1, 8); break;
      case 'taper': value = new THREE.CylinderGeometry(.65, 1, 1, 8); break;
      case 'dome': value = new THREE.SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2); break;
      case 'dish': value = new THREE.LatheGeometry([
        new THREE.Vector2(.03, 0), new THREE.Vector2(.2, .015),
        new THREE.Vector2(.55, .12), new THREE.Vector2(1, .42),
      ], 12); break;
      case 'ring': value = new THREE.TorusGeometry(1, .075, 4, 16); break;
      case 'shard': value = new THREE.OctahedronGeometry(1); break;
      default: throw new Error(`Unknown review geometry: ${key}`);
    }
    value.userData.sharedReviewBuilding = true;
    geometries.set(key, value);
  }
  return geometries.get(key);
}

function material(key) {
  if (!materials.has(key)) {
    const value = new THREE.MeshStandardMaterial({
      color: PALETTE[key], roughness: key === 'panel' ? .62 : .86,
      metalness: key === 'frame' ? .22 : .08, flatShading: true,
      side: THREE.DoubleSide,
    });
    value.name = `review-colony-${key}`;
    value.userData.sharedReviewBuilding = true;
    materials.set(key, value);
  }
  return materials.get(key);
}

/** Create a fresh pickable model while reusing GPU geometry/material resources. */
export function createReviewBuilding(id) {
  if (!IDS.has(id)) throw new Error(`Unknown review building: ${id}`);
  const group = new THREE.Group();
  group.name = id;
  group.userData = { building: id, buildingModel: true, style: 'warm-terrain-colony', serviceDirection: [0, 0, 1] };
  const animations = [], batches = new Map();
  const position = new THREE.Vector3(), scale = new THREE.Vector3();
  const rotation = new THREE.Euler(), quaternion = new THREE.Quaternion(), matrix = new THREE.Matrix4();

  function record(key, color, parent) {
    if (!batches.has(parent)) batches.set(parent, new Map());
    const bins = batches.get(parent), name = `${key}:${color}`;
    if (!bins.has(name)) bins.set(name, { key, color, transforms: [] });
    bins.get(name).transforms.push(matrix.clone());
  }
  function add(key, color, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0, parent = group) {
    position.set(x, y, z); scale.set(sx, sy, sz);
    quaternion.setFromEuler(rotation.set(rx, ry, rz));
    matrix.compose(position, quaternion, scale); record(key, color, parent);
  }
  const box = (w, h, d, x, y, z, color = 'shell', rx = 0, ry = 0, rz = 0, parent = group) =>
    add('box', color, x, y, z, w, h, d, rx, ry, rz, parent);
  const cylinder = (r, h, x, y, z, color = 'shell', parent = group) =>
    add('cylinder', color, x, y, z, r, h, r, 0, 0, 0, parent);
  function beam(a, b, width, color = 'frame', parent = group, round = false) {
    const first = new THREE.Vector3(...a), last = new THREE.Vector3(...b);
    const delta = last.clone().sub(first), length = delta.length();
    position.copy(first).add(last).multiplyScalar(.5);
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    scale.set(width, length, width); matrix.compose(position, quaternion, scale);
    record(round ? 'cylinder' : 'box', color, parent);
  }
  function pipe(points, color = 'frame', width = .045) {
    for (let i = 1; i < points.length; i++) beam(points[i - 1], points[i], width, color, group, true);
  }
  function rotary(name, x, y, z, axis = 'y', speed = .4) {
    const mesh = new THREE.Group(); mesh.name = name; mesh.position.set(x, y, z);
    group.add(mesh); animations.push({ mesh, axis, speed, kind: 'rotate' }); return mesh;
  }
  function feet(w, d, y = .04) {
    for (const x of [-w / 2, w / 2]) for (const z of [-d / 2, d / 2]) box(.18, .08, .18, x, y, z, 'stone');
  }
  function vent(x, y, z, w = .34, d = .32) {
    box(w, .035, d, x, y, z, 'dark');
    for (let k = 0; k < 4; k++) box(w * .82, .025, .025, x, y + .025, z - d * .32 + k * d * .21, 'frame');
  }
  function door(x, y, z, w, h, color = 'orange') {
    box(w, h, .025, x, y, z, 'dark');
    for (let k = 0; k < 4; k++) box(w * .9, .025, .03, x, y - h * .32 + h * k * .21, z + .02, 'frame');
    box(w + .07, .045, .05, x, y + h * .5 + .035, z, color);
    box(w * 1.12, .05, .18, x, .025, z + .08, 'stone');
  }
  function tank(x, z, r = .22, h = .85, color = 'gas') {
    cylinder(r * 1.08, .10, x, .05, z, 'stone');
    cylinder(r, h, x, .1 + h / 2, z, 'shell');
    add('dome', 'shell', x, .1 + h, z, r, r * .5, r);
    cylinder(r * 1.015, .075, x, h * .67 + .1, z, color);
    cylinder(r * .18, .1, x, h + r * .5 + .13, z, 'frame');
  }
  function crate(x, y, z, w = .3, h = .24, d = .32, color = 'stone') {
    box(w, h, d, x, y, z, color);
    for (const side of [-1, 1]) box(.025, h, d + .012, x + side * w * .32, y, z, 'frame');
  }
  function beacon(x, z, y = 1.1) {
    cylinder(.027, .3, x, y, z, 'frame');
    box(.08, .055, .05, x, y + .17, z, 'orange');
  }

  if (id === 'Metal_Mine') {
    feet(1.24, .94);
    box(1.3, .38, .82, 0, .25, -.08, 'stone');
    box(.64, .28, .45, 0, .49, -.23);
    door(0, .24, .34, .62, .3, 'metal');
    for (const x of [-.56, .56]) {
      box(.18, .84, .28, x, .5, -.1);
      box(.2, .11, .3, x, .83, -.1, 'metal');
      beam([x, .24, .38], [x, .8, -.16], .065);
    }
    box(1.25, .16, .32, 0, .99, -.1);
    box(.65, .11, .42, 0, 1.1, -.12, 'stone');
    const winch = rotary('ore-hoist', 0, .82, -.07, 'x', .6);
    add('cylinder', 'frame', 0, 0, 0, .13, .38, .13, 0, 0, Math.PI / 2, winch);
    box(.04, .31, .04, .14, 0, 0, 'orange', 0, 0, 0, winch);
    vent(-.43, .48, -.43, .26, .23); vent(.43, .48, -.43, .26, .23);
    for (let k = 0; k < 3; k++) crate(-.34 + k * .34, .1, .64, .24, .2, .24, 'metal');
    group.userData.features = ['ore-hoist', 'sorting-hall', 'loading-bay'];
  } else if (id === 'Metal_Storage') {
    feet(1.3, 1.05);
    box(1.4, .74, 1.02, 0, .43, -.08, 'stone');
    box(1.48, .1, 1.1, 0, .85, -.08);
    box(.52, .16, .9, 0, .96, -.08);
    for (const x of [-.6, -.3, 0, .3, .6]) box(.04, .72, 1.05, x, .43, -.08, 'shell');
    door(0, .34, .45, .72, .51, 'metal');
    for (const x of [-.57, .57]) crate(x, .13, .69, .3, .26, .32, 'metal');
    vent(.46, .92, -.35, .24, .3);
    group.userData.features = ['corrugated-storehouse', 'loading-bay', 'ore-crates'];
  } else if (id === 'Crystal_Mine') {
    feet(1.15, .96);
    box(1.15, .3, .95, 0, .22, -.03, 'stone');
    box(.64, .47, .73, -.2, .58, -.12);
    box(.66, .1, .76, -.2, .86, -.12, 'stone');
    box(.15, .54, .38, .46, .5, -.26);
    box(.15, .07, .41, .46, .76, -.26, 'crystal');
    door(-.18, .34, .5, .62, .42, 'crystal');
    for (const z of [-.35, -.07, .21]) {
      box(.26, .08, .15, .56, .47, z, 'frame');
      add('shard', 'crystal', .56, .64, z, .055, .11, .055);
    }
    vent(-.2, .93, -.15, .37, .43);
    for (const x of [-.67, .67]) box(.1, .57, .08, x, .32, .59, 'shell');
    box(1.44, .08, .12, 0, .64, .59, 'shell');
    box(.24, .09, .15, 0, .74, .59, 'crystal');
    pipe([[-.55, .1, -.6], [-.55, .58, -.6], [.44, .58, -.6], [.44, .4, -.4]]);
    group.userData.features = ['robot-service-bay', 'crystal-sorter', 'sample-rack'];
  } else if (id === 'Crystal_Storage') {
    feet(1.25, 1.04);
    box(.78, .72, 1.04, -.24, .42, -.02);
    box(.8, .07, 1.1, -.24, .82, -.02, 'stone');
    cylinder(.28, .94, .49, .54, -.22, 'shell');
    add('taper', 'shell', .49, 1.09, -.22, .28, .16, .28);
    cylinder(.285, .06, .49, .89, -.22, 'crystal');
    cylinder(.3, .09, .49, .095, -.22, 'stone');
    door(-.24, .36, .53, .52, .51, 'crystal');
    for (const z of [-.4, -.15, .1, .35]) box(.035, .58, .035, -.64, .45, z, 'frame');
    crate(.49, .15, .51, .34, .3, .34);
    box(.19, .06, .02, .49, .21, .689, 'crystal');
    vent(-.24, .88, -.18, .42, .47);
    group.userData.features = ['sealed-crystal-vault', 'sorting-dock', 'storage-drum'];
  } else if (id === 'Gas_Mine') {
    feet(1.15, 1.03);
    box(.64, .57, .72, -.28, .34, .12);
    vent(-.28, .66, .12, .45, .5);
    tank(.46, -.33, .24, .86);
    box(.58, .15, .65, -.28, .14, -.48, 'stone');
    for (let k = 0; k < 3; k++) add('cylinder', 'frame', -.46 + k * .18, .34, -.49, .065, .3, .065, Math.PI / 2);
    pipe([[.46, .83, -.33], [.73, .83, -.33], [.73, .25, .52], [-.28, .25, .52]], 'gas', .055);
    for (const z of [-.15, .35]) box(.18, .17, .12, .73, .085, z, 'stone');
    cylinder(.1, .1, -.28, .75, .1, 'frame');
    const fan = rotary('compressor-fan', -.28, .83, .1, 'y', 1.8);
    box(.33, .025, .05, 0, 0, 0, 'frame', 0, 0, 0, fan);
    box(.05, .025, .33, 0, 0, 0, 'frame', 0, 0, 0, fan);
    door(-.28, .31, .495, .3, .3, 'gas');
    group.userData.features = ['compressor', 'pressure-vessel', 'gas-pipes'];
  } else if (id === 'Gas_Storage') {
    for (const [x, z] of [[-.44, -.29], [.44, -.29], [0, .4]]) tank(x, z, .27, x === 0 ? .77 : 1.02);
    pipe([[-.44, .24, -.29], [-.73, .24, -.29], [-.73, .24, .75], [.73, .24, .75], [.73, .24, -.29], [.44, .24, -.29]], 'gas', .05);
    pipe([[0, .24, .4], [0, .24, .75]], 'gas', .05);
    for (const x of [-.73, .73]) for (const z of [-.3, .66]) box(.15, .19, .15, x, .095, z, 'stone');
    box(.21, .3, .21, .62, .15, .43, 'frame');
    box(.14, .08, .025, .62, .21, .547, 'orange');
    group.userData.features = ['three-pressure-tanks', 'pipe-manifold', 'valve-station'];
  } else if (id === 'Command_Center') {
    cylinder(.74, .13, 0, .065, 0, 'stone');
    cylinder(.7, .43, 0, .345, 0, 'shell');
    cylinder(.71, .055, 0, .59, 0, 'frame');
    cylinder(.51, .43, -.08, .83, -.09, 'shell');
    cylinder(.53, .09, -.08, 1.09, -.09, 'stone');
    box(.59, .1, .07, -.08, .98, .37, 'dark');
    for (const x of [-.26, .08]) box(.035, .1, .073, x, .98, .37, 'shell');
    door(0, .34, .66, .43, .39);
    box(.18, .43, .18, .29, 1.34, -.18);
    beacon(.29, -.18, 1.62);
    for (const side of [-1, 1]) {
      box(.25, .23, .58, side * .59, .24, -.15, 'stone');
      box(.11, .035, .62, side * .59, .38, -.15, 'orange');
    }
    vent(-.24, 1.16, -.13, .27, .32);
    group.userData.features = ['tiered-command-hall', 'communications-mast', 'operations-windows'];
  } else if (id === 'Solar_Plant') {
    for (const x of [-.52, 0, .52]) for (const z of [-.43, .37]) {
      cylinder(.055, .32, x, .16, z, 'frame');
      box(.46, .065, .63, x, .42, z, 'stone', -.31);
      box(.415, .016, .575, x, .465, z - .014, 'panel', -.31);
      for (const dx of [-.13, 0, .13]) box(.01, .016, .575, x + dx, .478, z - .018, 'shell', -.31);
      box(.415, .016, .012, x, .481, z - .025, 'shell', -.31);
      box(.2, .06, .17, x, .03, z, 'stone');
    }
    box(.41, .56, .22, .38, .28, .8);
    box(.43, .055, .24, .38, .59, .8, 'orange');
    box(.15, .075, .025, .38, .44, .919, 'dark');
    pipe([[-.6, .05, -.65], [-.6, .05, .72], [.38, .05, .72]], 'frame', .026);
    group.userData.features = ['six-tilted-solar-arrays', 'inverter', 'buried-cable-feed'];
  } else if (id === 'Fusion_Reactor') {
    cylinder(.46, .12, -.11, .06, 0, 'stone');
    cylinder(.41, .84, -.11, .54, 0, 'shell');
    cylinder(.43, .06, -.11, .91, 0, 'orange');
    add('taper', 'shell', -.11, 1.04, 0, .41, .22, .41);
    cylinder(.19, .16, -.11, 1.2, 0, 'frame');
    for (const x of [-.62, .62]) {
      box(.22, .65, .78, x, .375, 0, 'stone');
      for (let k = 0; k < 5; k++) box(.25, .035, .78, x, .15 + k * .11, 0, 'frame');
      pipe([[x, .7, -.28], [x, .94, -.28], [-.11, .94, -.28]]);
    }
    box(.39, .22, .2, -.11, .11, .57);
    box(.25, .075, .025, -.11, .14, .681, 'dark');
    group.userData.features = ['shielded-reactor-core', 'cooling-radiators', 'service-console'];
  } else if (id === 'Robotics_Facility') {
    feet(1.35, 1.1);
    box(1.44, .72, 1.08, 0, .42, -.04);
    box(1.5, .075, 1.13, 0, .83, -.04, 'stone');
    for (const x of [-.37, .37]) { door(x, .35, .51, .53, .5); vent(x, .9, -.16, .34, .54); }
    box(.13, .67, .05, 0, .4, .54, 'stone');
    for (const x of [-.62, .62]) {
      box(.12, .22, .15, x, .98, -.3, 'frame');
      box(.16, .04, .2, x, 1.11, -.3, 'shell');
    }
    for (const x of [-.48, .48]) crate(x, .1, .76, .26, .2, .22);
    box(.41, .08, .03, 0, .74, .54, 'orange');
    group.userData.features = ['twin-service-bays', 'extractor-vents', 'parts-delivery'];
  } else if (id === 'Shipyard') {
    // This one broad pad is functional runway paving, not a foundation around the colony.
    box(5.4, .08, 3.6, 0, .04, 0, 'stone');
    box(5.23, .025, 1.05, 0, .094, .89, 'dark');
    for (const x of [-2.28, -1.52, -.76, 0, .76, 1.52, 2.28]) box(.38, .012, .035, x, .116, .89, 'shell');
    for (const z of [.36, 1.43]) box(5.2, .012, .025, 0, .118, z, 'shell');
    for (const x of [-2.32, 2.32]) for (let k = 0; k < 5; k++) box(.24, .012, .035, x, .116, .56 + k * .16, 'shell');
    for (const x of [-1.55, -.12]) {
      box(1.23, .79, 1.05, x, .48, -1.01);
      box(1.3, .11, 1.1, x, .92, -1.01, 'stone');
      door(x, .43, -.472, .95, .6);
      vent(x, 1.0, -1.08, .65, .53);
    }
    box(.49, 1.08, .53, 1.84, .62, -.99, 'stone');
    box(.8, .33, .74, 1.84, 1.3, -.99);
    box(.82, .11, .035, 1.84, 1.34, -.609, 'dark');
    box(.87, .075, .8, 1.84, 1.5, -.99, 'stone');
    beacon(1.84, -.99, 1.64);
    const parking = [[-1.55, .175, -.16], [-.12, .175, -.16], [1.23, .175, -.16]];
    for (const [x, y, z] of parking) {
      box(.19, .16, .57, x, y + .09, z, 'shell');
      box(.54, .06, .23, x, y + .07, z + .06, 'shell');
      box(.29, .06, .15, x, y + .12, z - .24, 'stone');
      box(.115, .055, .15, x, y + .185, z + .08, 'dark');
      for (const side of [-1, 1]) {
        box(.1, .12, .22, x + side * .19, y + .08, z - .12, 'frame');
        box(.08, .05, .03, x + side * .2, y + .095, z - .244, 'orange');
        box(.055, .1, .06, x + side * .17, y - .045, z + .12, 'frame');
      }
      box(.055, .1, .06, x, y - .045, z - .19, 'frame');
    }
    group.userData.features = ['paved-runway', 'two-hangars', 'control-tower', 'three-parked-shuttles'];
    group.userData.runway = { axis: 'x', length: 5.23, width: 1.05, center: [0, .094, .89] };
    group.userData.fighterParking = parking;
  } else if (id === 'Research_Lab') {
    for (const [x, z, r] of [[-.4, -.23, .36], [.42, -.2, .33], [0, .43, .34]]) {
      cylinder(r * 1.08, .12, x, .06, z, 'stone');
      cylinder(r, .4, x, .32, z, 'shell');
      cylinder(r * 1.005, .065, x, .5, z, 'dark');
      add('dome', 'shell', x, .54, z, r, .32, r);
      for (const dx of [-.17, .17]) box(.032, .1, .028, x + dx, .5, z + r * .85, 'shell');
    }
    box(.86, .3, .27, 0, .22, -.22, 'stone');
    box(.23, .3, .61, 0, .22, .05, 'stone');
    door(0, .26, .77, .23, .28);
    beacon(-.4, -.23, .96);
    group.userData.features = ['three-laboratory-modules', 'enclosed-corridors', 'instrument-mast'];
  } else if (id === 'Radar_Facility') {
    feet(1.2, .94);
    box(.82, .42, .78, -.12, .27, .07);
    door(-.12, .25, .472, .4, .32);
    box(.9, .06, .86, -.12, .51, .07, 'stone');
    cylinder(.12, .55, -.12, .805, -.08, 'frame');
    for (const x of [-.45, .21]) beam([x, .53, -.08], [-.12, 1.02, -.08], .05);
    const turntable = rotary('radar-sweep', -.12, 1.14, -.08, 'y', .28);
    const tilt = new THREE.Group(); tilt.name = 'inclined-dish'; tilt.rotation.x = -.65; turntable.add(tilt);
    add('dish', 'shell', 0, 0, 0, .51, .43, .51, 0, 0, 0, tilt);
    cylinder(.04, .36, 0, .21, 0, 'frame', tilt);
    box(.1, .07, .1, 0, .41, 0, 'orange', 0, 0, 0, tilt);
    for (const x of [-.3, .3]) beam([x, .07, 0], [0, .36, 0], .018, 'frame', tilt);
    vent(-.12, .56, .29, .48, .22);
    box(.25, .51, .32, .58, .255, -.23, 'stone');
    beacon(.58, -.23, .68);
    group.userData.features = ['rotating-radar-dish', 'receiver', 'control-hut'];
  } else if (id === 'Alliance_Depot') {
    feet(1.4, 1.15);
    box(1.25, .62, .8, 0, .37, -.25);
    box(1.35, .075, .9, 0, .72, -.25, 'stone');
    door(0, .31, .163, .61, .43);
    for (const x of [-.53, .53]) {
      crate(x, .16, .54, .4, .32, .58);
      crate(x, .46, .54, .37, .27, .51, 'shell');
    }
    box(.73, .075, .44, 0, .72, .28);
    for (const x of [-.35, .35]) box(.045, .66, .045, x, .35, .48, 'frame');
    box(.08, .49, .08, -.48, .995, -.38, 'frame');
    box(.27, .16, .035, -.37, 1.16, -.38, 'orange');
    vent(.32, .79, -.3, .26, .31);
    group.userData.features = ['supply-hall', 'stacked-containers', 'covered-delivery-dock'];
  } else if (id === 'Nanite_Factory') {
    feet(1.28, 1.14);
    box(1.27, .51, 1.04, 0, .315, 0, 'stone');
    for (const x of [-.32, .32]) {
      cylinder(.24, .59, x, .845, -.19);
      cylinder(.25, .065, x, 1.13, -.19, 'orange');
      add('taper', 'shell', x, 1.23, -.19, .24, .15, .24);
      cylinder(.11, .1, x, 1.34, -.19, 'frame');
    }
    door(0, .31, .533, .55, .35);
    for (const x of [-.52, .52]) for (const y of [.18, .36]) box(.14, .05, .02, x, y, .538, 'frame');
    pipe([[-.32, 1.28, -.19], [-.32, 1.48, -.19], [.32, 1.48, -.19], [.32, 1.28, -.19]]);
    vent(0, .61, .3, .56, .24);
    group.userData.features = ['two-process-columns', 'sealed-assembly-hall', 'material-feed'];
  } else if (id === 'Terraformer') {
    cylinder(.38, .17, 0, .085, 0, 'stone');
    cylinder(.25, .76, 0, .55, 0, 'shell');
    cylinder(.27, .07, 0, .85, 0, 'orange');
    cylinder(.1, .61, 0, 1.15, 0, 'frame');
    for (let k = 0; k < 3; k++) {
      const a = k * Math.PI * 2 / 3, x = Math.cos(a) * .55, z = Math.sin(a) * .55;
      cylinder(.15, 1.1, x, .55, z, 'shell');
      cylinder(.16, .07, x, 1.08, z, 'stone');
      beam([x, 1.1, z], [0, 1.42, 0], .05);
      cylinder(.22, .1, x, .05, z, 'stone');
      pipe([[x, .23, z], [0, .23, 0]], 'gas', .035);
    }
    const arm = rotary('atmosphere-sampler', 0, 1.51, 0, 'y', .22);
    box(1.32, .055, .095, 0, 0, 0, 'frame', 0, 0, 0, arm);
    for (const x of [-.6, .6]) { box(.16, .11, .26, x, .065, 0, 'shell', 0, 0, 0, arm); box(.17, .035, .27, x, .145, 0, 'orange', 0, 0, 0, arm); }
    box(.27, .3, .25, 0, .15, .68, 'stone');
    box(.14, .06, .02, 0, .22, .814, 'gas');
    group.userData.features = ['air-processing-columns', 'rotating-atmosphere-sampler', 'soil-service-console'];
  } else if (id === 'Missile_Silo') {
    for (const [x, z] of [[-.42, -.24], [.42, -.24], [0, .48]]) {
      cylinder(.34, .15, x, .075, z, 'stone');
      cylinder(.29, .15, x, .225, z, 'shell');
      cylinder(.285, .035, x, .32, z, 'frame');
      box(.055, .035, .46, x, .35, z, 'orange');
      for (const side of [-1, 1]) box(.08, .12, .15, x + side * .27, .26, z, 'stone');
    }
    box(.43, .51, .23, 0, .255, -.67);
    box(.23, .11, .026, 0, .36, -.546, 'dark');
    box(.46, .065, .27, 0, .54, -.67, 'stone');
    beacon(0, -.67, .7);
    group.userData.features = ['three-armored-silo-hatches', 'launch-control-bunker', 'warning-beacon'];
  }

  for (const [parent, bins] of batches) for (const { key, color, transforms } of bins.values()) {
    const mesh = new THREE.InstancedMesh(geometry(key), material(color), transforms.length);
    mesh.name = `${id}/${key}/${color}`;
    mesh.userData = { building: id, reviewBuilding: true };
    transforms.forEach((transform, i) => mesh.setMatrixAt(i, transform));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.computeBoundingBox(); mesh.computeBoundingSphere(); parent.add(mesh);
  }
  group.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(group), dimensions = bounds.getSize(new THREE.Vector3());
  const height = bounds.max.y;
  const footprint = [dimensions.x, dimensions.z];
  group.userData.footprint = footprint;
  group.userData.height = height;
  return { group, height, animations, footprint };
}
