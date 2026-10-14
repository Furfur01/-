// Native, texture-free ship meshes. Nose -X, up +Y; 1 = cruiser, 2 = frigate.
// shortcut: the references show one view; underside armor follows the visible construction.
function buildNewReferenceShip(index) {
  if (index !== 1 && index !== 2) throw new RangeError('Reference ship index must be 1 or 2');
  const P = {
    armor: rgb(0x495a70), top: rgb(0x586a81), edge: rgb(0x8594a5),
    side: rgb(0x354457), dark: rgb(0x202c3b), joint: rgb(0x111a24),
    black: rgb(0x080f17), steel: rgb(0x65778b), blue: rgb(0x18d5f8),
    core: rgb(0x9ff7ff), amber: rgb(0xffd69a), glass: rgb(0x26323c)
  };
  const {g, parts, part, loft, block, quad, ring} = armoredGeometry(P);
  const box = (size, pos, color=P.armor, tag=0, emission=0) => g.box(size, pos, color, tag, [0,0,0], emission);
  const glow = (size, pos, color=P.blue, tag=0) => box(size, pos, color, tag, 1);

  function exhaust(x, y, z, width, height) {
    ring(x, z, y, width, height, width*.78, height*.76, P.edge, 4);
    block(x+.006, x+.035, y-height*.38, y+height*.38, z, width*.78, P.black, 4, .035);
    block(x+.038, x+.064, y-height*.30, y+height*.30, z, width*.61, P.blue, 4, .045, 1);
    glow([.019, height*.54, width*.12], [x+.078, y, z], P.core, 4);
    for (const side of [-1,1]) box([.05,height*.77,.06],[x+.091,y,z+side*width*.34],P.joint,4);
  }

  function sideStrip(x0, x1, y, z, height=.13) {
    const side = Math.sign(z);
    block(x0-.13,x1+.13,y-height*.8,y+height*.8,z,.065,P.joint,0,.014);
    glow([x1-x0,height,.025],[(x0+x1)/2,y,z+side*.047]);
  }

  function topSeam(x, y, width, z=0) {
    box([.027,.014,width],[x,y,z],P.joint);
    box([.017,.015,width*.96],[x+.031,y+.004,z],P.steel);
  }

  if (index === 1) {
    part('cruiser connected pressure hull', () => {
      loft([[-8.5,2.95,-.88,.17],[-6.4,4.25,-1.04,.58],[-2.8,4.55,-1.03,1.06],[4.2,4.42,-.94,1.31],[7.55,3.35,-.61,1.4]],0,P.dark,0,.20);
      loft([[-7.8,2.42,-1.08,-.65],[-3.1,3.72,-1.2,-.67],[4.5,3.61,-1.1,-.63],[7.3,2.93,-.81,-.48]],0,P.side,0,.12);
      block(-6.6,6.62,-.57,.09,0,5.68,P.joint,0,.10);
    });

    part('cruiser center bow armor', () => {
      loft([[-10.15,.76,-.64,-.05],[-8.13,1.40,-.57,.54],[-6.0,1.46,-.49,.87],[-4.6,1.52,-.35,.98]],0,P.top,0,.11);
      loft([[-10.15,.78,-.76,-.55],[-8.13,1.43,-.68,-.42],[-5.1,1.66,-.69,-.3]],0,P.dark,0,.06);
      topSeam(-8.13,.546,1.20);
      topSeam(-6.01,.877,1.23);
      loft([[-7.7,1.04,.42,.55],[-6.57,1.14,.56,1.31],[-5.68,1.14,.68,1.5],[-4.92,1.16,.64,1.46]],0,P.armor,0,.1);
      quad([[-6.64,1.254,-.40],[-6.64,1.254,.40],[-7.07,.978,.40],[-7.07,.978,-.40]],P.black);
      quad([[-6.68,1.242,-.33],[-6.68,1.242,.33],[-7.00,1.037,.33],[-7.00,1.037,-.33]],P.glass);
      block(-7.80,-7.39,.49,.78,0,.75,P.side,0,.06);
      block(-7.81,-7.79,.56,.72,0,.49,P.black,0,.015);
      block(-5.65,-4.2,.56,1.21,0,1.89,P.armor,0,.15);
    });

    for (const side of [-1,1]) part((side<0?'port':'starboard')+' cruiser bow beams', () => {
      const z=side*1.33;
      loft([[-9.78,.67,-.73,-.14],[-7.80,1.0,-.56,.58],[-5.8,1.08,-.57,.88],[-3.55,1.12,-.41,.93]],z,P.armor,0,.12);
      topSeam(-7.80,.585,.73,z);
      topSeam(-5.80,.885,.81,z);
      loft([[-9.65,.70,-.72,-.11],[-7.45,1.21,-.74,.69],[-5.13,1.3,-.63,.9]],side*2.35,P.armor,1,.13);
      loft([[-9.7,.72,-.87,-.47],[-7.42,1.25,-.94,-.43],[-5.04,1.28,-.78,-.23]],side*2.35,P.dark,1,.08);
      block(-9.747,-9.699,-.70,-.19,side*2.35,.62,P.edge,1,.028);
      block(-9.772,-9.749,-.63,-.26,side*2.35,.52,P.black,1,.016);
      glow([.023,.17,.45],[-9.789,-.37,side*2.35],P.amber,1);
      box([.028,.045,.48],[-9.805,-.47,side*2.35],P.steel,1);
      topSeam(-7.45,.696,.92,side*2.35);
      sideStrip(-6.0,-5.47,-.33,side*3.018,.47);
      block(-5.26,-3.61,-.87,.45,side*2.68,.83,P.side,0,.16);
      loft([[-5.28,.70,-.08,.37],[-4.77,.98,-.14,.58],[-3.58,.89,-.15,.6]],side*2.68,P.top,0,.09);
      sideStrip(-4.31,-4.15,-.12,side*3.16,.65);
    });

    part('cruiser raised segmented spine', () => {
      loft([[-4.77,2.16,.07,1.47],[-3.73,2.34,.04,1.76],[1.67,2.4,.06,1.91],[4.22,2.58,.17,1.9],[6.83,2.44,.11,1.75]],0,P.joint,0,.20);
      loft([[-4.8,2.13,.30,1.50],[-3.66,2.34,.23,1.81],[-1.15,2.38,.29,1.88]],0,P.armor,0,.20);
      loft([[-1.11,2.38,.30,1.88],[1.48,2.45,.35,1.96],[3.03,2.53,.42,1.94]],0,P.armor,0,.20);
      loft([[3.07,2.53,.42,1.94],[5.1,2.54,.44,1.89],[6.87,2.36,.38,1.78]],0,P.armor,0,.19);
      block(-4.92,-4.78,.90,1.46,0,2.03,P.side,0,.048);
      for (const side of [-1,1]) {
        block(-4.95,-4.921,1.17,1.37,side*.61,.47,P.black,0,.015);
        glow([.025,.087,.25],[-4.967,1.28,side*.61],P.amber);
      }
      block(-3.94,-3.04,1.60,2.00,0,.88,P.top,0,.10);
      block(-3.95,-3.938,1.66,1.87,0,.62,P.dark,0,.02);
      block(-2.93,-1.62,1.68,2.13,0,1.04,P.armor,0,.09);
      block(-1.53,.38,1.75,2.25,0,1.40,P.armor,0,.15);
      topSeam(-.12,2.259,1.07);
    });

    for (const side of [-1,1]) part((side<0?'port':'starboard')+' cruiser shoulder armor and service pods', () => {
      const z=side*1.63;
      loft([[-3.29,1.15,-.47,.92],[-2.29,1.33,-.50,1.31],[.10,1.37,-.49,1.55]],z,P.armor,0,.15);
      loft([[.14,1.37,-.49,1.55],[2.63,1.33,-.44,1.62],[4.89,1.25,-.4,1.63]],z,P.armor,0,.15);
      sideStrip(-2.0,-.69,-.04,side*2.319,.13);
      sideStrip(1.38,2.39,.33,side*2.309,.14);
      block(-2.94,-2.48,-.12,.41,side*2.39,.38,P.dark,0,.055);
      block(-2.81,-2.57,.34,.8,side*2.32,.20,P.side,0,.028);
      block(-1.9,2.50,-.46,.32,side*2.48,1.2,P.dark,0,.12);
      loft([[-1.67,1.31,-.19,.75],[-1.11,1.52,-.26,1.06],[1.11,1.49,-.25,1.11],[1.95,1.3,-.17,.95]],side*2.97,P.armor,0,.16);
      block(-1.70,-1.665,-.12,.69,side*2.97,1.15,P.steel,0,.055);
      block(-1.73,-1.703,-.03,.59,side*2.97,.89,P.black,0,.045);
      block(-1.758,-1.730,.03,.51,side*2.97,.60,P.dark,0,.05);
      block(-.39,.62,-1.17,.78,side*3.29,.86,P.armor,0,.14);
      block(-.415,-.39,-.95,.39,side*3.29,.63,P.dark,0,.06);
      block(-.44,-.416,-.31,.26,side*3.29,.46,P.black,0,.025);
      topSeam(.22,1.112,1.17,side*2.97);
      block(2.03,4.33,-.91,.48,side*2.70,1.37,P.armor,0,.17);
      block(2.00,2.037,-.55,.20,side*2.70,1.01,P.edge,0,.06);
      block(1.979,2.001,-.46,.11,side*2.70,.78,P.joint,0,.025);
      block(1.955,1.98,-.37,.02,side*2.70,.57,P.dark,0,.045);
      sideStrip(3.04,3.67,-.47,side*3.398,.16);
    });

    part('cruiser aft engine connection', () => {
      block(3.75,7.32,.22,1.60,0,5.21,P.dark,4,.18);
      block(4.14,6.93,1.29,1.74,0,1.03,P.side,4,.10);
      block(4.71,6.87,1.76,1.81,0,.94,P.blue,4,.015,1);
      box([.22,.12,1.0],[5.64,1.80,0],P.steel,4);
    });
    for (const side of [-1,1]) part((side<0?'port':'starboard')+' cruiser engine towers', () => {
      const z=side*1.34;
      loft([[2.19,1.34,.72,1.99],[3.03,1.54,.69,2.91],[4.14,1.61,.73,3.26],[7.42,1.6,.73,3.18],[7.89,1.34,.96,2.9]],z,P.armor,4,.18);
      loft([[2.34,1.06,1.87,2.02],[3.10,1.22,2.68,2.95],[4.11,1.29,3.12,3.27]],z,P.top,4,.06);
      topSeam(4.13,3.269,1.27,z);
      topSeam(6.07,3.218,1.25,z);
      block(3.36,4.33,.98,1.61,z,.88,P.dark,4,.09);
      exhaust(7.915,1.95,z,1.30,1.78);
      loft([[4.15,1.37,-.50,.90],[4.70,1.56,-.57,1.12],[6.18,1.56,-.54,1.14]],side*2.81,P.armor,4,.17);
      loft([[6.22,1.56,-.54,1.14],[7.67,1.54,-.52,1.12],[8.04,1.27,-.34,.92]],side*2.81,P.armor,4,.16);
      exhaust(8.052,.30,side*2.81,1.22,1.13);
      sideStrip(7.3,7.63,.3,side*3.59,.69);
      block(6.86,7.17,-.5,1.11,side*2.81,1.57,P.side,4,.07);
    });

    part('cruiser concealed missile hatches and belly ribs', () => {
      for (const side of [-1,1]) {
        block(.32,2.70,1.58,1.68,side*1.75,.42,P.dark,2,.025);
        for (const x of [.65,1.45,2.25]) {
          block(x-.24,x+.24,1.68,1.704,side*1.75,.32,P.side,2,.018);
          box([.31,.012,.019],[x,1.713,side*1.75],P.steel,2);
        }
      }
      for (const x of [-4.5,-1.1,2.4,5.9]) block(x-.12,x+.12,-1.24,-.83,0,3.46,P.dark,0,.038);
    });
  } else {
    part('frigate continuous spear hull', () => {
      loft([[-10.32,.37,-.81,-.47],[-8.2,1.43,-.85,-.20],[-5.85,2.55,-.88,.27],[-2.47,3.20,-.85,.63],[1.25,3.58,-.75,1.08],[5.4,3.62,-.62,1.13],[7.50,3.04,-.38,1.10]],0,P.dark,0,.13);
      loft([[-10.38,.39,-.94,-.70],[-8.18,1.50,-1.00,-.65],[-5.83,2.68,-1.08,-.67],[-1.4,3.37,-1.01,-.57],[5.1,3.4,-.81,-.4],[7.38,2.89,-.60,-.30]],0,P.side,0,.09);
      loft([[-10.32,.39,-.63,-.43],[-8.24,1.45,-.41,-.03],[-5.85,2.54,-.02,.38],[-2.58,3.09,.15,.75]],0,P.armor,0,.11);
      loft([[-9.83,.34,-.35,-.21],[-7.92,1.35,-.05,.22],[-5.62,2.26,.29,.69],[-2.56,2.58,.43,.91]],0,P.top,0,.09);
      for(const [x,y,w] of [[-8.24,-.025,1.12],[-5.85,.386,2.21],[-7.92,.226,1.11]]) topSeam(x,y,w);
      for(const side of [-1,1]) sideStrip(-5.67,-4.44,-.49,side*1.365,.15);
    });

    part('frigate long bridge and warm canopy', () => {
      loft([[-7.41,.78,.19,.42],[-5.99,1.13,.41,.97],[-3.58,1.30,.62,1.22],[-1.47,1.38,.72,1.52]],0,P.joint,0,.10);
      loft([[-7.36,.72,.38,.49],[-6.65,.91,.60,.81],[-5.8,1.07,.87,1.06]],0,P.amber,0,.075,.65);
      loft([[-7.17,.64,.47,.62],[-6.20,.96,.85,1.16],[-4.37,1.15,1.06,1.36]],0,P.armor,0,.10);
      loft([[-4.33,1.15,1.06,1.36],[-2.72,1.25,1.11,1.45],[-1.39,1.30,1.12,1.47]],0,P.armor,0,.09);
      block(-6.69,-6.61,.66,.90,0,1.015,P.steel,0,.026);
      loft([[-1.68,1.54,.72,1.47],[-.95,1.63,.76,2.15],[.05,1.65,.77,2.25],[.46,1.47,.78,1.87]],0,P.armor,0,.13);
      quad([[-1.53,1.571,-.55],[-1.53,1.571,.55],[-1.10,1.970,.55],[-1.10,1.970,-.55]],P.black);
      quad([[-1.44,1.645,-.45],[-1.44,1.645,.45],[-1.16,1.907,.45],[-1.16,1.907,-.45]],P.glass);
      topSeam(-.46,2.213,1.32);
    });

    for(const side of [-1,1]) part((side<0?'port':'starboard')+' frigate forward armor rails', () => {
      loft([[-5.49,.45,.08,.48],[-4.48,.65,.31,.95],[-2.49,.79,.34,1.16],[-.36,.82,.35,1.25]],side*1.21,P.armor,0,.10);
      loft([[-4.49,.65,.93,1.05],[-2.51,.79,1.12,1.24],[-.37,.83,1.21,1.33]],side*1.21,P.top,0,.04);
      block(-3.14,-2.36,-.38,.72,side*1.62,.58,P.side,0,.09);
      topSeam(-2.49,1.245,.53,side*1.21);
    });

    // Each wing is a closed chamfered loft across its span, intersecting the pressure hull.
    function wing(side) {
      const sections=[[1.16,-3.35,-1.05,-.07,.40],[2.95,-3.28,-.79,-.07,.38],[4.90,-1.67,.70,-.24,.18],[5.38,-1.08,1.12,-.28,.12]];
      const rings=sections.map(([z,front,back,bottom,top])=>{
        const b=.075, center=(front+back)/2, half=(back-front)/2;
        return [[top,-half+b],[top,half-b],[top-b,half],[bottom+b,half],[bottom,half-b],[bottom,-half+b],[bottom+b,-half],[top-b,-half]].map(([y,x])=>[center-side*x,y,side*z]);
      });
      const colors=[P.top,P.edge,P.side,P.side,P.dark,P.side,P.armor,P.edge];
      for(let i=0;i<rings.length-1;i++) for(let j=0;j<8;j++) {
        const k=(j+1)%8; g.quad(rings[i][j],rings[i][k],rings[i+1][k],rings[i+1][j],colors[j]);
      }
      for(let j=1;j<7;j++) {
        g.tri(rings[0][0],rings[0][j+1],rings[0][j],P.side);
        const r=rings[rings.length-1]; g.tri(r[0],r[j],r[j+1],P.side);
      }
      for(const [z,front,back,y] of [[2.95,-3.18,-.89,.384],[4.9,-1.57,.60,.184]]) {
        box([back-front,.015,.029],[(front+back)/2,y,side*z],P.joint);
        box([back-front-.07,.016,.016],[(front+back)/2,y+.005,side*(z+.039)],P.steel);
      }
      block(-1.45,1.49,-.34,.31,side*5.37,.38,P.armor,0,.075);
      block(-1.485,-1.45,-.22,.23,side*5.37,.29,P.steel,0,.03);
      block(-1.506,-1.485,-.16,.17,side*5.37,.22,P.black,0,.02);
      glow([.02,.25,.13],[-1.523,.01,side*5.37]);
    }
    for(const side of [-1,1]) part((side<0?'port':'starboard')+' frigate swept wing',()=>wing(side));

    part('frigate stepped aft citadel', () => {
      loft([[-.37,2.66,-.05,1.48],[.49,3.00,-.01,2.44],[2.60,3.14,.09,2.78],[4.05,2.88,.15,2.73],[6.8,2.63,.18,2.33]],0,P.joint,0,.18);
      loft([[-.48,1.82,1.10,1.57],[.52,1.93,1.14,2.29],[1.39,2.00,1.18,2.33],[1.83,2.09,1.2,2.54]],0,P.armor,0,.13);
      loft([[1.87,2.10,1.21,2.55],[3.20,2.36,1.3,2.92],[4.12,2.45,1.31,3.00]],0,P.armor,0,.15);
      loft([[4.16,2.45,1.31,3.00],[5.5,2.41,1.35,2.98],[7.03,2.23,1.43,2.77]],0,P.armor,0,.14);
      loft([[1.19,.52,2.16,2.34],[3.22,.70,2.83,3.00],[7.06,.68,2.79,2.99]],0,P.top,0,.075);
      topSeam(5.51,2.997,2.11);
      block(.00,.64,1.31,1.55,0,1.07,P.joint,0,.04);
      block(.11,.60,1.39,1.57,0,.80,P.dark,0,.035);
    });

    for(const side of [-1,1]) part((side<0?'port':'starboard')+' frigate shoulder and stacked engines', () => {
      loft([[-.41,1.21,-.30,1.04],[.31,1.38,-.28,1.68],[2.15,1.42,-.2,1.9]],side*1.70,P.armor,0,.16);
      loft([[2.19,1.42,-.20,1.90],[3.59,1.45,-.1,2.07],[4.76,1.31,-.05,1.83]],side*1.70,P.armor,0,.16);
      block(.27,1.26,-.31,.72,side*2.265,.26,P.side,0,.055);
      sideStrip(1.40,2.79,.01,side*2.438,.15);
      block(1.17,3.65,-.61,-.02,side*1.67,1.31,P.dark,0,.10);
      loft([[3.5,1.35,-.52,1.00],[4.28,1.60,-.50,1.17],[6.03,1.6,-.40,1.17]],side*2.10,P.armor,4,.16);
      loft([[6.07,1.60,-.40,1.17],[7.53,1.54,-.35,1.12],[7.96,1.28,-.17,.91]],side*2.10,P.armor,4,.16);
      exhaust(7.974,.36,side*2.10,1.23,1.10);
      sideStrip(7.17,7.48,.32,side*2.884,.63);
      loft([[3.11,1.34,1.24,2.27],[3.78,1.49,1.19,2.87],[5.31,1.51,1.20,3.14]],side*1.72,P.armor,4,.17);
      loft([[5.35,1.51,1.20,3.14],[7.26,1.49,1.27,3.06],[7.83,1.27,1.48,2.80]],side*1.72,P.armor,4,.17);
      block(3.04,3.11,1.45,2.1,side*1.72,1.10,P.dark,4,.045);
      block(3.00,3.045,1.57,1.94,side*1.72,.85,P.black,4,.03);
      block(2.975,3.00,1.62,1.72,side*1.72,.65,P.side,4,.02);
      exhaust(7.847,2.14,side*1.72,1.24,1.35);
      sideStrip(7.09,7.41,2.13,side*2.482,.62);
      for (const x of [4.72,5.2]) block(x-.045,x+.045,1.55,1.87,side*2.484,.032,P.joint,4,.012);
    });

    part('frigate integrated weapons and underside', () => {
      for(const side of [-1,1]) {
        block(-10.405,-10.375,-.867,-.739,side*.10,.115,P.dark,1,.015);
        block(-10.421,-10.405,-.839,-.769,side*.10,.084,P.black,1,.009);
        glow([.012,.035,.051],[-10.429,-.804,side*.10],P.blue,1);
        block(.74,1.79,1.62,1.99,side*1.69,.54,P.dark,2,.025);
        for(const x of [1.0,1.53]) block(x-.19,x+.19,1.99,2.015,side*1.69,.40,P.side,2,.016);
      }
      for(const x of [-2.1,1.3,4.7]) block(x-.10,x+.10,-1.035,-.64,0,2.96,P.dark,0,.035);
      block(5.72,7.31,-.53,.44,0,.75,P.side,4,.07);
      block(7.31,7.35,-.27,.14,0,.5,P.joint,4,.035);
    });
  }
  g.parts = parts;
  return g;
}
