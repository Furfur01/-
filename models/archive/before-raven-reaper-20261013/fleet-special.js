import * as THREE from 'three';
import {createShipKit} from './ship-sculpted-kit.js';
import {shipWeaponLayouts} from '../../../game/ship-weapon-mounts.mjs';

// Two deliberately new silhouettes. All cages, vanes and emitters have structural roots.
export function createSpecialShip(id){
  const reaper=id==='Reaper';
  const k=createShipKit(id,reaper?{armor:0x17252a,light:0x3b514d,edge:0xb59b63,side:0x273239,dark:0x182024,black:0x0a1116,steel:0x75664b,glass:0x42bc97,core:0xc2fff0}:{armor:0xb9c9cb,light:0xe0e4dc,edge:0x81789f,side:0x424955,dark:0x242535,black:0x101021,steel:0x79788d,glass:0xd075fc,core:0xeec9ff});
  const {root,section,plate,loft,block,cyl,ring,pipe,engine,turret}=k;
  if(reaper){
    section('Obsidian_keel',()=>{
      loft([[-8.5,.12,-.12,.18],[-5.6,.7,-.55,.52],[-2,1.26,-.77,.72],[1.2,1.5,-.83,.84],[4.9,.85,-.55,.45]],'dark');
      loft([[-7.8,.08,.1,.26],[-4.3,.46,.38,.79],[-1.8,.7,.51,1.05],[1.4,.8,.67,1.12],[4.3,.54,.4,.82]],'armor');
      plate([[-.2,-6.8],[.2,-6.8],[.52,-3.6],[.35,-2.2],[-.35,-2.2],[-.52,-3.6]],.61,.09,'edge');
      // Recessed slit, no tall terrestrial bridge.
      loft([[1.3,.45,.85,1.12],[2.6,.64,.7,1.3],[3.5,.38,.62,.88]],'light');
      block(.68,.045,.045,0,1.09,1.38,'core',.005);
      for(const s of[-1,1])for(let j=0;j<8;j++)block(.045,.035,.2,s*.66,.92,-.8+j*.38,'glass',.005);
    });
    for(const s of[-1,1]){
      const shape=p=>p.map(([x,z])=>[s*x,z]);
      section('Scythe_arm_'+s,()=>{
        plate(shape([[.7,-2.2],[1.9,-2.6],[3.9,-1.6],[5.5,-3.5],[5.9,-6.9],[5.4,-8.1],[6.6,-6.8],[7.5,-3.1],[7.1,.7],[5.4,3.4],[2.5,4.1],[.7,2.6]]),-.42,.65,'side',.08);
        plate(shape([[1,-1.9],[1.9,-2.1],[4.1,-1.2],[5.9,-3.2],[6.2,-6.6],[7.03,-3.0],[6.65,.4],[5.1,2.9],[2.5,3.6],[1,2.4]]),.18,.24,'armor',.055);
        plate(shape([[1.1,1.2],[3.4,.6],[5.7,-1],[6.5,-2.7],[6.1,.6],[4.9,2.4],[2.6,3.1],[1.1,2.2]]),.45,.16,'light',.03);
        plate(shape([[5.6,-3.4],[5.88,-6.7],[5.4,-8.1],[6.35,-6.45],[6.8,-3.0],[6.48,-1.3]]),.09,.17,'edge',.025);
        // Flush energy seam follows the hooked inner edge.
        const vein=[[1.0,.48,-1.5],[3.8,.48,-.8],[5.3,.48,-2.5],[5.93,.38,-5.5]];
        for(let i=1;i<vein.length;i++)pipe([s*vein[i-1][0],vein[i-1][1],vein[i-1][2]],[s*vein[i][0],vein[i][1],vein[i][2]],.055,'glass');
        for(let j=0;j<6;j++){
          const x=2.1+j*.49,z=2.4-j*.24;
          plate(shape([[x-.18,z-.75],[x+.16,z-1.05],[x+.31,z+.42],[x-.12,z+.58]]),.65,.075,j%2?'armor':'steel',.018);
          block(.12,.022,.18,s*x,.74,z+.13,'glass',.004);
        }
        // Forward collimators are seated in the keel shoulders, joined to the wings.
        loft([[-5.1,.17,-.2,.14],[-4.6,.39,-.36,.37],[-1.8,.58,-.4,.5],[.1,.64,-.38,.51]],'armor',s*1.15);
        cyl(.27,.12,s*1.15,0,-5.05,'black','z');ring(.23,.046,s*1.15,0,-5.13,'edge');cyl(.15,.018,s*1.15,0,-5.15,'core','z');
        for(let j=0;j<5;j++){block(.62,.09,.17,s*1.15,.4,-4+j*.44,'edge');block(.3,.026,.12,s*1.15,.46,-3.94+j*.44,'glass',.008);}
        // Engine housings intersect the aft wing, never float behind it.
        loft([[2.2,.67,-.4,.62],[3.6,.67,-.49,.54],[4.4,.51,-.48,.38]],'armor',s*2.6);
        engine(s*2.6,-.02,4.35,.5,true);
        for(const z of[-.1,1.5])turret(s*3.1,.62,z,.34);
        for(const z of[1.8,2.2]){block(.3,.13,.3,s*1.85,.45,z,'side',.015);cyl(.13,.045,s*1.85,.49,z,'black');ring(.12,.02,s*1.85,.52,z,'edge','y');}
      });
    }
    section('Bound_singularity_core',()=>{
      cyl(.63,3.4,0,.0,-.6,'black','z');
      for(let j=0;j<7;j++){ring(.66,.10,0,0,-2.1+j*.48,'edge');ring(.55,.027,0,0,-2.02+j*.48,'glass');}
      for(const a of[0,Math.PI/2,Math.PI,Math.PI*1.5])pipe([Math.cos(a)*.65,Math.sin(a)*.65,-2.2],[Math.cos(a)*.65,Math.sin(a)*.65,1.2],.09,'side');
      engine(0,-.12,4.88,.57,true);
    });
  }else{
    section('Uncrewed_antimatter_warhead',()=>{
      loft([[-6.3,.018,-.018,.018],[-4.5,.44,-.32,.32],[-2.8,.65,-.48,.48],[-1.5,.57,-.42,.42],[2.8,.46,-.37,.37],[4.3,.32,-.28,.28]],'side');
      for(const s of[-1,1]){
        plate([[s*.03,-6.12],[s*.47,-4.1],[s*.62,-2.8],[s*.26,-1.4],[s*.02,-1.8]],.16,.2,'light',.035);
        plate([[s*.22,.7],[s*1.2,1.8],[s*1.95,4.1],[s*1.08,3.7],[s*.35,2.5]],-.18,.23,'armor',.045);
        plate([[s*.55,1.5],[s*1.16,2.2],[s*1.68,3.67],[s*1.12,3.28]],.065,.06,'edge',.01);
        pipe([s*.42,.21,1.2],[s*1.48,.12,3.35],.035,'glass');
      }
      // Four connected containment rails around a solid core, not free-floating hoops.
      cyl(.34,3.4,0,0,0,'core','z');
      for(let j=0;j<6;j++){ring(.62,.075,0,0,-1.3+j*.51,'steel');ring(.52,.025,0,0,-1.25+j*.51,'glass');}
      for(let i=0;i<4;i++){
        const a=i*Math.PI/2+Math.PI/4,x=Math.cos(a)*.48,y=Math.sin(a)*.48;
        pipe([x,y,-2.1],[x,y,2.4],.12,'armor');
        pipe([x*1.15,y*1.15,-1.2],[x*1.15,y*1.15,1.65],.025,'glass');
      }
      cyl(.65,.32,0,0,-1.65,'armor','z');cyl(.61,.24,0,0,1.8,'armor','z');
      for(const z of[-1.8,1.93])ring(.59,.04,0,0,z,'edge');
      engine(0,0,4.25,.36,true);
      for(const s of[-1,1])engine(s*.4,-.07,3.4,.14);
    });
  }
  const model=k.finish();
  for(const e of model.userData.engineNozzles)e.position[2]-=.0025;
  model.traverse(o=>{if(o.isMesh&&o.material.name==='armor'){
    const old=o.material;o.material=new THREE.MeshPhysicalMaterial({color:old.color,metalness:reaper?.38:.45,roughness:reaper?.56:.31,clearcoat:reaper?.25:1,clearcoatRoughness:.4,iridescence:reaper?.15:.45,iridescenceIOR:1.35,envMapIntensity:reaper?.12:1});o.material.name='ceramic_iridescent';
  }});
  model.userData={...model.userData,modelId:id,revision:'special-reborn-01',specialDesign:true,weaponLayout:shipWeaponLayouts[id],design:reaper?'黑曜镰翼 / 相位收割舰':'湮灭之星 / 反物质自行导弹',designSource:'User-authorized original design; trial loadout, not recovered APK balance'};
  return model;
}
