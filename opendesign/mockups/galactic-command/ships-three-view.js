import * as THREE from 'three';
import {createShipKit} from './ship-sculpted-kit.js';

// New geometry traced against normalized orthographic views of the recovered Tripo originals.
export function createThreeViewShip(id){
  if(!['Destroyer','Iron_Behemoth'].includes(id))throw Error('Unknown three-view hull');
  const k=createShipKit(id),{root,section,add,loft,plate,block,cyl,ring,pipe,mirror,finish}=k;
  root.userData={modelId:id,revision:'three-view-rebuild-01',rebuiltFromScratch:true,reference:'Recovered Tripo front / side / top views, length normalized to 14',silhouetteVerified:false};
  function vent(x,y,z,w,l,n=7){block(w,.045,l,x,y,z,'black',.008);for(let i=0;i<n;i++)block(w*.9,.03,l/(n*2),x,y+.04,z-l*.43+i*l*.86/(n-1),'steel',.005);}
  function window(x,y,z,w){block(w,.13,.045,x,y,z,'black',.005);for(let i=0;i<5;i++)block(w*.12,.045,.018,x+(i-2)*w*.18,y,z-.029,'glass',.003);}
  function fan(x,y,z,r){
    cyl(r,.08,x,y,z,'edge','y',r,48);cyl(r*.88,.026,x,y+.047,z,'black','y',r*.88,48);ring(r*.91,r*.055,x,y+.07,z,'steel','y');
    for(let i=0;i<12;i++){const a=i*Math.PI/6,c=Math.cos(a),s=Math.sin(a);plate([[.23,0],[.82,-.09],[.78,.09],[.35,.13]].map(([u,v])=>[x+r*(u*c-v*s),z+r*(u*s+v*c)]),y+.055,.02,i%2?'steel':'side',.003);}
    cyl(r*.23,.1,x,y+.1,z,'armor','y');ring(r*.23,.012,x,y+.155,z,'edge','y');
  }
  function fin(points,x,t,mat){const sh=new THREE.Shape();points.forEach(([z,y],i)=>i?sh.lineTo(-z,y):sh.moveTo(-z,y));sh.closePath();const g=new THREE.ExtrudeGeometry(sh,{depth:t,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:1});g.rotateY(Math.PI/2);return add(g,mat,[x-t/2,0,0]);}
  function roof(rows,mat='side'){
    const p=[],idx=[];
    for(const[z,w,b,e,h,c]of rows)p.push(-w,b,z,w,b,z,w,e,z,c,h,z,-c,h,z,-w,e,z);
    for(let j=0;j<rows.length-1;j++)for(let i=0;i<6;i++){const a=j*6+i,b=j*6+(i+1)%6;idx.push(a,b,a+6,b,b+6,a+6);}
    for(let i=1;i<5;i++){idx.push(0,i+1,i);const a=(rows.length-1)*6;idx.push(a,a+i,a+i+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);const flat=g.toNonIndexed();flat.computeVertexNormals();g.dispose();return add(flat,mat);
  }
  function slopePanel(rows,points,s,mat='armor',offset=.04){
    const m=plate(points.map(([f,z])=>[s*f,z]),0,.035,mat,.006),p=m.geometry.attributes.position;
    for(let i=0;i<p.count;i++){
      const f=Math.abs(p.getX(i)),z=p.getZ(i),a=rows.findLast(r=>r[0]<=z)||rows[0],b=rows.find(r=>r[0]>z)||a,t=a===b?0:(z-a[0])/(b[0]-a[0]);
      const v=n=>a[n]+(b[n]-a[n])*t,w=v(1),e=v(3),h=v(4),c=v(5);
      p.setXYZ(i,s*(c+(w-c)*f),h+(e-h)*f+p.getY(i)+offset,z);
    }
    m.geometry.computeVertexNormals();return m;
  }
  if(id==='Destroyer'){
    section('D01_Narrow_chamfered_pressure_hull',()=>{
      loft([[-7,1.02,-1.04,.33],[-6.55,1.46,-1.36,.57],[-5.65,1.53,-1.49,.64],[-.6,1.5,-1.56,.83],[.65,1.95,-1.88,1.09],[3.3,1.9,-1.86,1.19],[4.5,1.44,-1.58,.99],[6.3,.69,-.52,1.03]],'side');
      loft([[-6.65,1.26,-1.35,-1.08],[-.9,1.33,-1.65,-1.25],[.4,1.67,-1.99,-1.6],[3.3,1.6,-1.99,-1.57]],'dark');
      for(const s of[-1,1]){
        loft([[-6.57,.56,.35,.58],[-5.32,.65,.45,.77],[-3.7,.64,.54,.84],[-1.1,.62,.56,.9],[.38,.64,.63,1.02]],'armor',s*.78);
        loft([[-6.13,.51,.6,.82],[-5.3,.52,.62,.89],[-4.26,.44,.64,.94]],'light',s*.79);
        loft([[-3.9,.45,.82,.93],[-2.9,.52,.83,1.03],[-1.58,.39,.87,.99]],'light',s*.81);
        loft([[-1.25,.51,.9,1.05],[.32,.56,.92,1.14]],'light',s*.81);
        block(.13,.14,6.8,s*.13,.82,-2.93,'edge',.015);
        for(let j=0;j<13;j++)block(.15,.055,.105,s*.18,.92,-5.85+j*.46,'steel',.003);
        block(.35,1.13,.8,s*1.54,-.35,-5.76,'armor',.07);
        block(.35,.82,.31,s*1.48,-.25,-6.22,'light',.04);
        for(const z of[-4.6,-3.7,-2.8,-1.9,-1]){block(.07,.32,.53,s*1.515,-.18,z,'black',.006);block(.09,.15,.45,s*1.56,-.14,z,'steel',.01);}
        pipe([s*1.5,-.85,-5.1],[s*1.5,-.85,.5],.047,'edge');
      }
      block(1.8,.65,.12,0,-.33,-7.035,'edge',.04);block(1.4,.36,.13,0,-.33,-7.12,'black',.035);
    });
    for(const s of[-1,1])section('D02_Lateral_pods_'+s,()=>{
      loft([[-3.9,.32,-1.68,-.68],[-3.66,.61,-1.78,-.32],[-1.72,.62,-1.8,-.33],[-1.35,.43,-1.57,-.62]],'side',s*2.17);
      plate(mirror([[1.58,-3.78],[2.66,-3.64],[2.79,-3.12],[2.73,-1.62],[1.6,-1.47]],s),-.35,.16,'armor',.04);
      fan(s*2.05,-.15,-3.0,.34);vent(s*2.15,-.13,-2.03,.48,.5,5);
      loft([[-.85,.64,-1.91,-.68],[.3,.76,-2.03,-.53],[2.62,.73,-2.03,-.52],[3.26,.58,-1.73,-.66]],'dark',s*2.03);
      loft([[.2,.59,-1.26,-.22],[.58,.93,-1.48,.08],[2.49,.93,-1.39,.21],[2.95,.64,-1.13,.06]],'armor',s*3.18);
      plate(mirror([[2.4,.53],[3.73,.69],[3.92,1.23],[3.88,2.18],[3.47,2.64],[2.47,2.55]],s),.17,.12,'light',.025);
      cyl(.34,.09,s*3.24,.38,1.58,'edge','y',.34,6);vent(s*3.24,.46,1.58,.42,.39,5);
      for(const z of[.42,2.88])block(.18,.69,.4,s*4.02,-.03,z,'edge',.035);
      for(let i=0;i<5;i++)block(.53,.25,.23,s*1.9,.86,.35+i*.55,'armor',.035);
    });
    section('D03_Integrated_stern_command_spine',()=>{
      const spine=[[.02,1.68,-.6,1.04,1.37,.72],[.7,1.77,-.5,1.12,1.93,.65],[3.8,1.63,-.38,1.04,1.96,.6],[4.35,1.25,-.27,1.0,2.08,.6],[5.26,1.04,.43,.9,2.08,.6],[6.91,.43,.82,1.31,1.77,.26]];
      roof(spine,'side');
      loft([[.82,.58,1.84,2.02],[3.83,.56,1.84,2.05],[4.43,.52,1.97,2.12],[5.15,.5,1.97,2.12],[6.3,.29,1.81,1.96]],'light');
      window(0,1.89,.76,.96);
      for(const s of[-1,1]){
        slopePanel(spine,[[.06,.72],[.57,.72],[.91,1.12],[.9,2.75],[.64,3.16],[.12,3.1],[.06,2.59]],s,'armor');
        slopePanel(spine,[[.04,3.3],[.5,3.25],[.83,3.84],[.86,4.12],[.58,4.49],[.08,4.42]],s,'light');
        slopePanel(spine,[[.08,4.64],[.75,4.63],[.92,5.21],[.83,5.93],[.35,6.36],[.1,6.13]],s,'armor');
        slopePanel(spine,[[.25,4.91],[.61,4.91],[.74,5.19],[.7,5.72],[.29,5.48]],s,'black',.086);
        for(let i=0;i<6;i++)slopePanel(spine,[[.3,5.02+i*.073],[.64,5.05+i*.09],[.64,5.078+i*.09],[.3,5.05+i*.073]],s,'steel',.13);
        slopePanel(spine,[[.27,1.25],[.65,1.25],[.75,1.47],[.68,2.58],[.25,2.58]],s,'dark',.086);
        for(let i=0;i<5;i++)slopePanel(spine,[[.31,1.38+i*.22],[.64,1.38+i*.22],[.64,1.5+i*.22],[.31,1.5+i*.22]],s,'edge',.13);
        for(let i=0;i<4;i++)block(.37,.4,.47,s*.95,1.4,1.19+i*.67,'edge',.05);
        fin([[3.63,.82],[3.72,2.15],[4.04,2.22],[4.2,.84]],s*1.47,.12,'light');
        block(.07,.1,1.37,s*.57,2.055,2.16,'red',.009);
      }
      vent(0,2.08,2.93,.71,.82,8);
    });
    for(const s of[-1,1]){
      const wing=section('D04_Straight_downturned_tail_'+s,()=>{
        loft([[3.65,1.99,-.99,.42],[3.93,2.08,-1.42,.46],[5.98,2.08,-1.43,.48],[6.29,1.91,-1.18,.34]],'side',s*3.31);
        plate(mirror([[1.31,3.8],[5.24,3.8],[5.38,4.04],[5.35,5.98],[5.09,6.18],[1.35,6.18]],s),.47,.15,'armor',.04);
        plate(mirror([[1.4,3.91],[2.49,3.91],[2.75,4.34],[2.71,5.86],[1.4,6.04]],s),.65,.11,'light',.025);
        for(const x of[2.9,4.25])fan(s*x,.64,4.98,.54);
        for(const x of[1.48,5.27])fin([[3.81,-.6],[3.87,.82],[4.14,.92],[5.91,.86],[6.14,.32],[6.12,-.76]],s*x,.15,'edge');
        for(const z of[4.13,5.83])block(2.55,.07,.1,s*3.78,.67,z,'edge',.01);
        vent(s*4.92,.65,4.95,.26,1.27,10);
        for(const z of[3.67,6.29])block(2.8,.21,.08,s*3.75,-.61,z,'steel',.015);
        for(const x of [2.9,4.25])k.engine(s*x,-.45,6.32,.48,true);
      });wing.rotation.z=-s*.16;
    }
    section('D05_Embedded_stern_drive',()=>k.engine(0,1.27,6.75,.32,true));
  }else{
    const rows=[[-6.19,2.48,-.32,.5,3.05,.69],[-5.15,2.49,-.35,.39,2.98,.64],[-3.1,2.44,-.37,.32,2.45,.67],[-.65,2.37,-.35,.22,2.09,.53],[1.58,2.2,-.3,.6,2.12,.56],[3.83,1.3,.3,.8,1.61,.43],[5.73,1.04,.48,1.01,1.98,.48]];
    section('B01_Triangular_cross_section_hull',()=>{
      const hull=roof(rows,'side'),hp=hull.geometry.attributes.position;
      for(let i=0;i<hp.count;i++)if(Math.abs(hp.getZ(i)+6.19)<.001)hp.setZ(i,-6.88+(3.05-hp.getY(i))*.5);
      hull.geometry.computeVertexNormals();
      for(let j=0;j<rows.length-1;j++)for(const s of[-1,1]){
        const a=rows[j][0]+(j===0?.8:.06),b=rows[j+1][0]-.06,d=b-a;
        if(d<.15)continue;
        const contour=j===2?[[.06,a],[.4,a],[.4,a+d*.23],[.9,a+d*.1],[.93,b],[.59,b],[.45,b-d*.24],[.06,b-d*.24]]:j===3?[[.09,a],[.92,a],[.92,a+d*.34],[.77,a+d*.45],[.77,b],[.46,b],[.3,b-d*.18],[.09,b-d*.18]]:[[.06,a],[.51,a],[.61,a+d*.2],[.9,a+d*.2],[.9,b-d*.19],[.65,b],[.07,b],[.07,b-d*.2],[.21,b-d*.33],[.21,a+d*.28]];
        slopePanel(rows,contour,s,j===2?'light':'armor');
        if(j===1||j===4){
          slopePanel(rows,[[.31,a+d*.32],[.61,a+d*.32],[.73,a+d*.48],[.71,b-d*.2],[.3,b-d*.2]],s,'dark',.089);
          for(let i=0;i<6;i++){const z=a+d*(.4+i*.057);slopePanel(rows,[[.35,z],[.65,z],[.65,z+.045],[.35,z+.045]],s,'steel',.13);}
          slopePanel(rows,[[.8,a],[.98,a],[.98,b-d*.36],[.82,b-d*.25]],s,'edge',.08);
        }
        if(j===2){
          slopePanel(rows,[[.56,a+d*.28],[.75,a+d*.19],[.77,b-d*.19],[.57,b-d*.26]],s,'side',.085);
          slopePanel(rows,[[.59,a+d*.31],[.65,a+d*.29],[.67,b-d*.25],[.61,b-d*.28]],s,'red',.13);
          slopePanel(rows,[[.1,a+d*.06],[.29,a+d*.06],[.29,a+d*.44],[.1,a+d*.44]],s,'edge',.1);
        }
        if(j===3){
          slopePanel(rows,[[.18,a+d*.2],[.6,a+d*.2],[.68,a+d*.31],[.59,a+d*.41],[.18,a+d*.41]],s,'dark',.086);
          for(let i=0;i<3;i++)slopePanel(rows,[[.25+i*.13,a+d*.24],[.29+i*.13,a+d*.24],[.29+i*.13,a+d*.36],[.25+i*.13,a+d*.36]],s,'steel',.13);
          slopePanel(rows,[[.28,a+d*.67],[.5,a+d*.6],[.64,b-d*.13],[.44,b-d*.07]],s,'edge',.08);
        }
      }
      function frontPanel(points,mat,offset=.04){
        const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
        const g=new THREE.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:true,bevelSize:.016,bevelThickness:.016,bevelSegments:1});
        const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,p.getZ(i)-6.88+(3.05-p.getY(i))*.5-offset);g.computeVertexNormals();add(g,mat);
      }
      for(const s of[-1,1]){
        frontPanel([[.15,.16],[2.16,.16],[2.18,.49],[1.84,.91],[.87,.91],[.68,1.15],[.15,1.15]].map(([x,y])=>[s*x,y]),'armor');
        frontPanel([[.26,1.36],[1.59,1.35],[1.03,2.12],[.67,2.62],[.31,2.62],[.31,2.23],[.7,2.23],[1.1,1.69],[.26,1.69]].map(([x,y])=>[s*x,y]),'light');
        frontPanel([[.43,.49],[1.7,.49],[1.49,.74],[.43,.74]].map(([x,y])=>[s*x,y]),'dark',.095);
        for(let i=0;i<5;i++){const x=s*(.54+i*.19);frontPanel([[x-.035,.51],[x+.035,.51],[x+.035,.68],[x-.035,.68]],'steel',.145);}
      }
      frontPanel([[-.59,1.86],[.59,1.86],[.42,2.08],[-.42,2.08]],'black',.08);
      for(const x of[-.3,0,.3])frontPanel([[x-.095,1.91],[x+.095,1.91],[x+.095,2.0],[x-.095,2.0]],'glass',.13);
      const hood=section('Forward_sloped_sensor_hood',()=>{
      loft([[-6.94,.76,2.29,3.18],[-5.77,.86,2.17,3.24],[-4.05,.67,1.89,3.24],[-3.52,.59,1.79,2.9],[-2.72,.54,1.73,2.63],[-1.5,.5,1.74,2.6],[-.6,.46,1.74,2.28],[1.6,.45,1.93,2.28]],'armor');
      loft([[-6.88,.66,3.16,3.29],[-4.07,.6,3.17,3.27],[-3.56,.5,2.81,2.94]],'light');
      block(1.26,.74,.06,0,2.66,-6.99,'edge',.035);block(.94,.47,.07,0,2.65,-7.03,'dark',.023);
      window(0,2.53,-7.08,.73);
      });hood.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)if(p.getZ(i)+o.position.z<-6.6)p.setZ(i,p.getZ(i)+Math.max(0,3.18-p.getY(i)-o.position.y)*.44);o.geometry.computeVertexNormals();});
      vent(0,2.34,-.39,.6,1.01,8);vent(0,2.88,-4.5,.55,.54,5);
      loft([[1.64,.31,1.96,2.27],[1.76,.4,2.0,2.68],[2.21,.39,1.92,2.68],[2.4,.29,1.88,2.22]],'armor');
      window(0,2.43,1.73,.51);
      for(const s of[-1,1]){
        const antenna=plate(mirror([[.79,-6.02],[2.49,-6.09],[2.56,-5.84],[.86,-5.72]],s),2.53,.17,'armor',.025),ap=antenna.geometry.attributes.position;
        for(let i=0;i<ap.count;i++)ap.setY(i,ap.getY(i)+(Math.abs(ap.getX(i))-.8)*.13);antenna.geometry.computeVertexNormals();
        pipe([s*2.4,.1,-5.85],[s*2.28,-.04,.65],.07,'edge');
        loft([[-5.95,.19,-.55,.06],[-4.89,.25,-.71,-.05],[-1.7,.22,-.82,-.2],[1.1,.24,-.56,-.03]],'armor',s*2.36);
        for(const z of[-5.15,-3.7,-2.2,-.7]){block(.09,.36,.66,s*2.46,-.16,z,'dark',.012);block(.1,.12,.39,s*2.52,-.13,z,'steel',.012);}
      }
    });
    for(const s of[-1,1]){
      const leg=section('B02_Deep_cranked_forward_leg_'+s,()=>{
      loft([[-6.08,.37,-3.3,-2.95],[-4.63,.37,-3.3,-2.78],[-4.5,.36,-3.29,-1.5],[-3.48,.41,-3.25,-.81],[-3.25,.42,-2.0,-.69],[-2.5,.49,-1.73,-.38],[-1.8,.49,-1.28,-.34],[-.22,.49,-1.18,-.34],[1.3,.3,-.55,.49]],'side',s*2.16);
      loft([[-2.7,.48,-1.19,-.51],[-2.3,.69,-1.29,-.36],[-.43,.69,-1.19,-.28],[.05,.51,-.91,-.18]],'armor',s*1.81);
      loft([[-1.64,.25,-1.26,-.92],[-1.42,.36,-1.34,-.92],[-.56,.36,-1.34,-.9],[-.3,.23,-1.19,-.83]],'edge',s*1.78);
      loft([[-6.05,.24,-3.1,-2.91],[-4.77,.24,-3.06,-2.73],[-4.48,.22,-2.84,-1.43],[-3.48,.27,-1.58,-.76],[-2.58,.31,-.81,-.32]],'light',s*2.16);
      pipe([s*2.53,-.7,-2.7],[s*2.53,-.7,.34],.075,'steel');
      for(const z of[-1.9,-1.16,-.42])block(.27,.4,.38,s*2.6,-.63,z,'armor',.04);
      block(.38,.13,.035,s*2.16,-3.13,-6.11,'black',.012);
      fin([[-4.62,-1.83],[-3.82,-1.7],[-3.51,-1.22],[-2.96,-.98],[-2.96,-1.37],[-3.84,-1.97]],s*2.32,.16,'armor');
      loft([[-4.64,.17,-2.94,-1.73],[-4.44,.17,-2.72,-1.64]],'edge',s*2.16);
      for(const x of[-.12,.12])pipe([s*2.16+x,-2.88,-4.675],[s*2.16+x,-1.78,-4.47],.035,'steel');
      for(let i=0;i<4;i++)block(.52,.085,.16,s*2.16,-1.38,-2.65+i*.27,'edge',.012);
    });
      leg.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setX(i,p.getX(i)-s*.8*Math.max(0,Math.min(1,(-(p.getY(i)+o.position.y)-1)/2.34)));o.geometry.computeVertexNormals();});
    }
    section('B03_Narrow_neck_and_transverse_flag_bridge',()=>{
      roof([[1.35,1.93,.13,.77,2.03,.5],[3.2,1.44,.38,.79,1.58,.4],[4.91,1.21,.51,1.01,1.88,.45],[6.49,.98,.52,1.33,2.02,.49]],'armor');
      loft([[4.7,.61,1.73,2.27],[5.19,.87,1.77,2.65],[6.12,.83,1.87,2.74],[6.46,.56,1.83,2.05]],'side');
      loft([[5.16,.7,2.55,2.76],[6.26,.65,2.64,2.9]],'light');window(0,2.03,4.665,.95);
      loft([[3.78,.29,2.29,2.41],[4.03,.59,2.37,2.52],[5.23,.64,2.41,2.56]],'light');
      for(const s of[-1,1])block(.15,.72,.25,s*.39,2.03,4.04,'edge',.025);
      block(.64,.59,.35,0,1.94,5.06,'side',.045);window(0,2.17,3.76,.44);
      vent(0,2.84,5.57,.62,.47,5);
      for(const s of[-1,1]){
        fin([[5.28,1.88],[5.4,2.33],[5.71,2.47],[6.27,2.47],[6.55,2.21],[6.34,1.91]],s*.84,.04,'armor');
        block(.035,.095,.55,s*.889,2.28,5.98,'black',.006);
        for(let j=0;j<4;j++)block(.017,.045,.068,s*.911,2.28,5.78+j*.12,'glass',.003);
        const outrigger=section('Low_transverse_outrigger_'+s,()=>{
        plate(mirror([[.66,4.9],[3.04,4.7],[3.61,4.84],[3.98,5.45],[4.1,5.87],[3.75,6.79],[3.2,6.88],[2.64,6.3],[.58,6.37]],s),.67,.43,'side',.06);
        plate(mirror([[.74,5.07],[2.83,4.99],[3.45,5.15],[3.72,5.73],[3.43,6.28],[2.72,6.16],[.77,6.22]],s),1.15,.22,'armor',.04);
        loft([[4.91,.29,.34,.74],[5.13,.44,.31,1.15],[6.39,.43,.32,1.28],[6.61,.27,.39,.81]],'edge',s*2.8);
        plate(mirror([[3.11,4.69],[3.5,4.36],[3.97,4.96],[4.14,5.72],[3.9,6.5],[3.52,6.91],[3.19,6.53],[3.48,5.73]],s),1.27,.13,'light',.035);
        block(.88,.13,.44,s*2.22,1.53,5.66,'light',.03);vent(s*2.23,1.61,5.67,.59,.3,5);
        });outrigger.scale.y=.45;outrigger.position.y=.02;
        for(let i=0;i<5;i++){const z=2.06+i*.42,x=1.63-i*.12,y=1.17-i*.04;block(.34,.09,.13,s*x,y,z,'edge',.012);}
        loft([[.32,.27,-.48,.98],[.66,.4,-.31,1.38],[1.47,.4,-.21,1.33],[1.81,.24,-.06,.86]],'armor',s*2.24);
        plate(mirror([[1.9,.56],[2.51,.63],[2.53,1.22],[2.31,1.55],[1.87,1.38]],s),1.32,.075,'light',.022);
      }
      cyl(.63,.25,0,1.14,6.77,'dark','z');ring(.49,.04,0,1.14,6.94,'steel');
    });
  }
  return finish();
}
