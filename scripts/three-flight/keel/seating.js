// Imported from the user-provided KEEL interior; editable geometry preserved.
export function buildSeating({ THREE, RoundedBoxGeometry, M }) {
  const root = new THREE.Group();
  root.name = 'SEATING__command_and_two_watch_stations';
  const cache = new Map();
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  function group(parent, name) {
    const g = new THREE.Group();
    g.name = name;
    parent.add(g);
    return g;
  }

  function shared(key, make) {
    if (!cache.has(key)) {
      const geo = make();
      geo.name = key;
      cache.set(key, geo);
    }
    return cache.get(key);
  }

  function mesh(parent, geo, mat, position, name, rotation) {
    const m = new THREE.Mesh(geo, mat);
    m.name = name;
    if (position) m.position.set(...position);
    if (rotation) m.rotation.set(...rotation);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function rb(parent, dimensions, position, mat, name, radius = 0.012, rotation, detail = 1) {
    const r = Math.min(radius, ...dimensions.map(v => v * 0.45));
    const key = 'seat_rounded_' + dimensions.join('_') + '_' + r + '_' + detail;
    return mesh(parent, shared(key, () => new RoundedBoxGeometry(...dimensions, detail, r)), mat, position, name, rotation);
  }

  function cyl(parent, r1, r2, length, position, mat, name, rotation, segments = 12) {
    return mesh(parent, shared('seat_cylinder_' + [r1, r2, length, segments].join('_'),
      () => new THREE.CylinderGeometry(r1, r2, length, segments, 1)), mat, position, name, rotation);
  }

  function link(parent, a, b, width, depth, mat, name, radius = 0.008) {
    const av = V(...a), bv = V(...b);
    const m = rb(parent, [width, av.distanceTo(bv), depth], av.clone().add(bv).multiplyScalar(0.5).toArray(), mat, name, radius);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), bv.sub(av).normalize());
    return m;
  }

  function rod(parent, a, b, radius, mat, name, segments = 12) {
    const av = V(...a), bv = V(...b);
    const m = cyl(parent, radius, radius, av.distanceTo(bv), av.clone().add(bv).multiplyScalar(0.5).toArray(), mat, name, undefined, segments);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), bv.sub(av).normalize());
    return m;
  }

  function profile(parent, coords, depth, bevel, position, mat, name) {
    const key = 'seat_profile_' + JSON.stringify([coords, depth, bevel]);
    const geo = shared(key, () => {
      const shape = new THREE.Shape();
      shape.moveTo(...coords[0]);
      for (let i = 1; i < coords.length; ++i) shape.lineTo(...coords[i]);
      shape.closePath();
      const g = new THREE.ExtrudeGeometry(shape, {
        depth, bevelEnabled: bevel > 0, bevelSegments: 2,
        steps: 1, bevelSize: bevel, bevelThickness: bevel, curveSegments: 1
      });
      g.translate(0, 0, -depth * 0.5);
      return g;
    });
    return mesh(parent, geo, mat, position, name);
  }

  function hose(parent, points, radius, mat, name) {
    const key = 'seat_tube_' + JSON.stringify([points, radius]);
    const geo = shared(key, () => new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points.map(p => V(...p))), 20, radius, 6, false));
    return mesh(parent, geo, mat, [0, 0, 0], name);
  }

  // A recessed washer plus a dark centre reads as an actual fixing, even in shadow.
  function fixing(parent, x, y, z, name, side = false) {
    cyl(parent, 0.014, 0.014, 0.006, [x, y, z], M.titanium, name + '_washer', side ? [0, 0, Math.PI / 2] : undefined, 12);
    cyl(parent, 0.006, 0.006, 0.0075, [x, y + (side ? 0 : 0.002), z], M.black, name + '_recess', side ? [0, 0, Math.PI / 2] : undefined, 6);
  }

  function makeSeat(name, detailed) {
    const seat = new THREE.Group();
    seat.name = name;
    seat.userData = { category: 'seating', units: 'metres', cushionHeight: 0.52, forwardAxis: '-Z' };

    const anchoring = group(seat, '01__deck_shoes_and_fore_aft_slide');
    for (const s of [-1, 1]) {
      rb(anchoring, [0.086, 0.038, 0.72], [s * 0.225, 0.023, -0.055], M.black, 'deck_shoe_' + s, 0.008);
      rb(anchoring, [0.034, 0.049, 0.62], [s * 0.225, 0.061, -0.055], M.titanium, 'exposed_slide_rail_' + s, 0.005);
      rb(anchoring, [0.071, 0.053, 0.39], [s * 0.225, 0.091, -0.013], M.structure, 'captured_slide_carriage_' + s, 0.008);
      for (const z of [-0.327, 0.225]) {
        rb(anchoring, [0.12, 0.028, 0.088], [s * 0.225, 0.018, z], M.structure, 'deck_anchor_' + s + '_' + z, 0.006);
        if (detailed) fixing(anchoring, s * 0.225, 0.038, z, 'anchor_fastener_' + s + '_' + z);
      }
      rb(anchoring, [0.062, 0.024, 0.042], [s * 0.225, 0.079, -0.338], M.copper, 'slide_end_stop_' + s, 0.004);
    }
    rb(anchoring, [0.44, 0.065, 0.25], [0, 0.116, 0.052], M.structure, 'transverse_slide_bridge', 0.009);
    rb(anchoring, [0.19, 0.084, 0.19], [0, 0.119, -0.057], M.black, 'height_adjuster_motor_housing', 0.012);
    rb(anchoring, [0.17, 0.018, 0.15], [0, 0.168, -0.06], M.secondary, 'actuator_service_cap', 0.005);

    const suspension = group(seat, '02__anti_shock_suspension_and_pan_frame');
    for (const s of [-1, 1]) {
      // Two rockers constrain the moving seat pan; the central damper absorbs travel.
      link(suspension, [s * 0.23, 0.131, -0.225], [s * 0.23, 0.318, 0.14], 0.04, 0.038, M.titanium, 'forward_rocker_' + s);
      link(suspension, [s * 0.23, 0.131, 0.178], [s * 0.23, 0.318, -0.215], 0.043, 0.041, M.structure, 'rear_rocker_' + s);
      cyl(suspension, 0.034, 0.034, 0.029, [s * 0.245, 0.221, -0.026], M.titanium, 'rocker_pivot_' + s, [0, 0, Math.PI / 2], 16);
      cyl(suspension, 0.015, 0.015, 0.036, [s * 0.248, 0.221, -0.026], M.black, 'rocker_axle_end_' + s, [0, 0, Math.PI / 2], 8);
      rod(suspension, [s * 0.145, 0.15, 0.065], [s * 0.145, 0.266, -0.035], 0.030, M.black, 'damper_body_' + s);
      rod(suspension, [s * 0.145, 0.224, 0.001], [s * 0.145, 0.343, -0.099], 0.012, M.titanium, 'damper_piston_' + s);
      if (detailed) {
        rod(suspension, [s * 0.145, 0.18, 0.04], [s * 0.145, 0.227, 0.0], 0.034, M.rubber, 'damper_dust_boot_' + s);
        fixing(suspension, s * 0.268, 0.316, -0.213, 'upper_rocker_pin_' + s, true);
      }
    }
    cyl(suspension, 0.019, 0.019, 0.49, [0, 0.221, -0.026], M.black, 'anti_roll_cross_shaft', [0, 0, Math.PI / 2]);
    rb(suspension, [0.59, 0.055, 0.46], [0, 0.345, -0.036], M.structure, 'suspended_pan_subframe', 0.012);
    rb(suspension, [0.66, 0.097, 0.584], [0, 0.391, -0.071], M.cladding, 'armoured_seat_pan', 0.025, undefined, 2);
    rb(suspension, [0.606, 0.023, 0.543], [0, 0.443, -0.087], M.black, 'upholstery_isolation_gasket', 0.013);
    rb(suspension, [0.40, 0.032, 0.041], [0, 0.389, -0.378], M.structure, 'front_pan_edge_reinforcement', 0.009);

    const cushions = group(seat, '03__removable_cushions_and_stitched_seams');
    rb(cushions, [0.378, 0.104, 0.54], [0, 0.468, -0.084], M.leather, 'central_seat_cushion', 0.028, undefined, 2);
    for (const s of [-1, 1]) {
      rb(cushions, [0.096, 0.108, 0.554], [s * 0.24, 0.466, -0.085], M.leather, 'lateral_cushion_bolster_' + s, 0.026, undefined, 2);
      if (detailed) {
        rb(cushions, [0.0025, 0.0025, 0.418], [s * 0.168, 0.5207, -0.079], M.stitch, 'longitudinal_cushion_stitch_' + s, 0.001);
      }
    }
    rb(cushions, [0.538, 0.067, 0.102], [0, 0.480, -0.326], M.leather, 'rounded_thigh_support', 0.025, undefined, 2);
    if (detailed) rb(cushions, [0.464, 0.0025, 0.0025], [0, 0.5148, -0.315], M.stitch, 'thigh_support_double_seam', 0.001);

    const back = group(seat, '04__reclined_back_shell_and_split_headrest');
    back.position.set(0, 0.49, 0.173);
    back.rotation.x = 0.18;
    const backOutline = [
      [-0.262, 0.015], [-0.310, 0.095], [-0.316, 0.390],
      [-0.28, 0.565], [-0.220, 0.690], [0.220, 0.690],
      [0.28, 0.565], [0.316, 0.390], [0.310, 0.095], [0.262, 0.015]
    ];
    profile(back, backOutline, 0.063, 0.014, [0, 0, 0.033], M.cladding, 'contoured_crash_shell');
    profile(back, [
      [-0.222, 0.047], [-0.263, 0.12], [-0.258, 0.40], [-0.216, 0.604],
      [-0.19, 0.64], [0.19, 0.64], [0.216, 0.604], [0.258, 0.40], [0.263, 0.12], [0.222, 0.047]
    ], 0.022, 0.012, [0, 0, -0.024], M.black, 'back_cushion_carrier');
    rb(back, [0.37, 0.184, 0.091], [0, 0.153, -0.067], M.leather, 'lumbar_cushion', 0.028, undefined, 2);
    rb(back, [0.376, 0.317, 0.075], [0, 0.413, -0.063], M.leather, 'upper_back_cushion', 0.031, undefined, 2);
    rb(back, [0.326, 0.07, 0.062], [0, 0.602, -0.044], M.leather, 'shoulder_cushion', 0.022, undefined, 2);
    for (const s of [-1, 1]) {
      rb(back, [0.082, 0.48, 0.092], [s * 0.229, 0.306, -0.043], M.leather, 'back_side_bolster_' + s, 0.023, [0, s * 0.10, s * 0.025], 2);
      rb(back, [0.049, 0.144, 0.101], [s * 0.283, 0.073, 0.024], M.structure, 'back_recline_hinge_cheek_' + s, 0.012);
      cyl(back, 0.04, 0.04, 0.018, [s * 0.318, 0.076, 0.021], M.titanium, 'recline_hinge_' + s, [0, 0, Math.PI / 2], 16);
      cyl(back, 0.02, 0.02, 0.022, [s * 0.322, 0.076, 0.021], M.black, 'hinge_retainer_' + s, [0, 0, Math.PI / 2], 8);
      rod(back, [s * 0.104, 0.639, 0.028], [s * 0.104, 0.799, 0.028], 0.011, M.titanium, 'headrest_adjustment_stalk_' + s);
      rb(back, [0.19, 0.19, 0.058], [s * 0.103, 0.789, 0.022], M.structure, 'split_headrest_shell_' + s, 0.022, undefined, 2);
      rb(back, [0.169, 0.162, 0.075], [s * 0.103, 0.789, -0.028], M.leather, 'split_headrest_pad_' + s, 0.024, undefined, 2);
      if (detailed) {
        rb(back, [0.0025, 0.254, 0.0025], [s * 0.155, 0.41, -0.101], M.stitch, 'back_cushion_seam_' + s, 0.001);
        rb(back, [0.028, 0.47, 0.026], [s * 0.166, 0.332, 0.096], M.titanium, 'rear_shell_mounting_rib_' + s, 0.005);
      }
    }
    profile(back, [
      [-0.115, 0.092], [-0.138, 0.132], [-0.12, 0.512], [-0.068, 0.602],
      [0.068, 0.602], [0.12, 0.512], [0.138, 0.132], [0.115, 0.092]
    ], 0.033, 0.009, [0, 0, 0.083], M.structure, 'rear_spine_service_panel');
    rb(back, [0.11, 0.064, 0.012], [0, 0.158, 0.116], M.black, 'rear_connector_pocket', 0.007);
    hose(back, [[-0.153, 0.562, 0.106], [-0.14, 0.634, 0.132], [0, 0.652, 0.14], [0.14, 0.634, 0.132], [0.153, 0.562, 0.106]], 0.012, M.black, 'rear_egress_grab_handle');
    if (detailed) {
      for (let i = 0; i < 4; ++i) rb(back, [0.108, 0.006, 0.008], [0, 0.296 + i * 0.025, 0.113], M.black, 'rear_motor_vent_' + i, 0.002);
      hose(suspension, [[0.12, 0.14, 0.155], [0.20, 0.18, 0.237], [0.18, 0.35, 0.266], [0.12, 0.51, 0.221]], 0.011, M.rubber, 'protected_seat_power_loom');
      rb(suspension, [0.09, 0.035, 0.046], [0.12, 0.144, 0.183], M.secondary, 'loom_deck_connector', 0.006);
    }

    const arms = group(seat, '05__hinged_armrests_and_physical_flight_controls');
    for (const s of [-1, 1]) {
      link(arms, [s * 0.302, 0.408, 0.12], [s * 0.363, 0.646, 0.082], 0.043, 0.091, M.structure, 'armrest_inclined_mount_' + s, 0.01);
      link(arms, [s * 0.302, 0.422, -0.214], [s * 0.365, 0.625, -0.225], 0.032, 0.065, M.titanium, 'armrest_front_brace_' + s, 0.007);
      cyl(arms, 0.03, 0.03, 0.036, [s * 0.375, 0.64, 0.079], M.titanium, 'armrest_hinge_pin_' + s, [0, 0, Math.PI / 2]);
      rb(arms, [0.139, 0.068, 0.512], [s * 0.369, 0.672, -0.088], M.structure, 'armrest_load_bearing_shell_' + s, 0.024, undefined, 2);
      rb(arms, [0.121, 0.011, 0.455], [s * 0.369, 0.712, -0.082], M.black, 'armrest_inset_seal_' + s, 0.012);
      rb(arms, [0.113, 0.029, 0.229], [s * 0.369, 0.729, 0.041], M.leather, 'forearm_pad_' + s, 0.014, undefined, 2);
      rb(arms, [0.089, 0.035, 0.132], [s * 0.369, 0.733, -0.23], M.secondary, 'control_gimbal_base_' + s, 0.012);
      if (detailed) {
        rb(arms, [0.009, 0.025, 0.056], [s * 0.443, 0.673, -0.118], M.copper, 'armrest_manual_release_' + s, 0.004);
        cyl(arms, 0.0065, 0.0065, 0.005, [s * 0.398, 0.757, -0.302], M.cyanLight, 'single_power_indicator_' + s, undefined, 8);
      }
    }

    const right = group(arms, 'right__side_stick');
    cyl(right, 0.033, 0.04, 0.027, [0.369, 0.762, -0.231], M.rubber, 'joystick_bellows', undefined, 16);
    rod(right, [0.369, 0.773, -0.231], [0.369, 0.837, -0.215], 0.012, M.titanium, 'joystick_shaft');
    rb(right, [0.045, 0.074, 0.06], [0.369, 0.833, -0.216], M.rubber, 'ergonomic_joystick_grip', 0.016, [0.20, 0, 0], 2);
    rb(right, [0.055, 0.024, 0.055], [0.369, 0.873, -0.21], M.structure, 'joystick_thumb_plate', 0.009, [0.20, 0, 0]);
    rb(right, [0.018, 0.025, 0.013], [0.369, 0.847, -0.251], M.copper, 'mechanical_trigger', 0.005);
    cyl(right, 0.009, 0.009, 0.008, [0.38, 0.891, -0.206], M.black, 'thumb_hat_switch', [0.20, 0, 0], 8);

    const left = group(arms, 'left__split_throttle');
    for (const s of [-1, 1]) {
      link(left, [-0.369 + s * 0.022, 0.761, -0.227], [-0.369 + s * 0.022, 0.806, -0.239], 0.013, 0.028, M.titanium, 'throttle_lever_' + s, 0.004);
      rb(left, [0.039, 0.034, 0.061], [-0.369 + s * 0.022, 0.808, -0.24], M.rubber, 'split_throttle_grip_' + s, 0.012, [0.17, 0, 0]);
    }
    if (detailed) {
      rb(left, [0.036, 0.013, 0.025], [-0.369, 0.827, -0.209], M.copper, 'throttle_lock_bridge', 0.004);
      const harness = group(seat, '06__stowed_restraint_hardware');
      // Restraints sit at the hip; no straps cross the empty seat or camera.
      for (const s of [-1, 1]) {
        rb(harness, [0.032, 0.059, 0.07], [s * 0.294, 0.486, 0.044], M.black, 'hip_restraint_retractor_' + s, 0.008);
        rb(harness, [0.027, 0.038, 0.043], [s * 0.296, 0.52, 0.02], M.titanium, 'stowed_belt_tongue_' + s, 0.005);
        rb(harness, [0.018, 0.019, 0.024], [s * 0.30, 0.529, -0.002], M.copper, 'belt_release_tab_' + s, 0.004);
      }
    }

    const foot = group(seat, '07__adjustable_rudder_pedals');
    rb(foot, [0.476, 0.024, 0.355], [0, 0.021, -0.723], M.black, 'pedal_deck_mount', 0.016);
    for (const s of [-1, 1]) {
      rb(foot, [0.032, 0.019, 0.36], [s * 0.144, 0.039, -0.653], M.titanium, 'pedal_adjustment_rail_' + s, 0.004);
      link(foot, [s * 0.144, 0.060, -0.712], [s * 0.144, 0.123, -0.677], 0.075, 0.033, M.structure, 'pedal_pivot_bracket_' + s, 0.007);
      cyl(foot, 0.026, 0.026, 0.182, [s * 0.144, 0.121, -0.677], M.titanium, 'pedal_cross_pin_' + s, [0, 0, Math.PI / 2]);
      const pedal = group(foot, 'pedal_' + (s < 0 ? 'port' : 'starboard'));
      pedal.position.set(s * 0.144, 0.16, -0.733);
      pedal.rotation.x = 0.54;
      rb(pedal, [0.166, 0.022, 0.217], [0, 0, 0], M.secondary, 'forged_pedal_plate', 0.012);
      rb(pedal, [0.136, 0.009, 0.167], [0, 0.015, -0.008], M.rubber, 'non_slip_pedal_insert', 0.009);
      rb(pedal, [0.168, 0.032, 0.024], [0, 0.023, 0.097], M.structure, 'heel_stop', 0.006);
      const treadCount = detailed ? 4 : 2;
      for (let k = 0; k < treadCount; ++k) {
        rb(pedal, [0.125, 0.005, 0.007], [0, 0.022, -0.059 + k * (detailed ? 0.033 : 0.088)], M.titanium, 'traction_ridge_' + k, 0.002);
      }
      if (detailed) {
        rod(foot, [s * 0.144, 0.066, -0.355], [s * 0.144, 0.115, -0.659], 0.008, M.black, 'rudder_pushrod_' + s);
      }
    }
    return seat;
  }

  const pilot = makeSeat('PILOT__full_detail_seat', true);
  pilot.position.set(0, 0, 1.05);
  root.add(pilot);
  for (const s of [-1, 1]) {
    const watch = makeSeat((s < 0 ? 'PORT' : 'STARBOARD') + '__watch_station_seat', false);
    watch.position.set(s * 3.7, 0.28, 0.0);
    root.add(watch);
  }

  let meshes = 0, triangles = 0;
  root.traverse(o => {
    if (!o.isMesh) return;
    meshes++;
    triangles += o.geometry.index ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 3;
  });
  root.userData = { category: 'seating', meshCount: meshes, triangleCount: triangles, sharedGeometries: cache.size };
  return root;
}
