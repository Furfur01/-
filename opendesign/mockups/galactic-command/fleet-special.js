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
    section('Armored_antimatter_torpedo',()=>{
      // Closed armored body: the antimatter cell is internal, never an exposed wand.
      loft([[-6.3,.025,-.025,.025],[-5.2,.34,-.3,.3],[-3.9,.72,-.57,.57],[-2.8,.86,-.68,.68],[1.9,.86,-.68,.68],[3.5,.59,-.48,.48],[4.4,.46,-.39,.39]],'side');
      for(const sign of[-1,1]){
        plate([[sign*.035,-6.12],[sign*.34,-5.1],[sign*.69,-3.9],[sign*.8,-2.8],[sign*.36,-3.12]],.17,.2,'armor',.035);
        // Broad shoulder armor and recessed small coolant indicators.
        loft([[-3.25,.15,-.38,.4],[-2.8,.24,-.51,.51],[1.8,.24,-.51,.51],[2.7,.13,-.37,.36]],'armor',sign*.67);
        for(const z of[-1.9,-1.4,-.9]){block(.027,.14,.28,sign*.922,.02,z,'black',.004);block(.03,.055,.16,sign*.94,.02,z,'glass',.003);}
        block(.035,.52,.24,sign*.92,0,.9,'red',.008);
      }
      plate([[-.53,-2.7],[.53,-2.7],[.69,-2.3],[.68,.4],[.39,.8],[-.5,.6],[-.68,-1.9]],.67,.07,'light',.02);
      plate([[-.47,.81],[.4,.93],[.62,1.7],[.38,2.9],[-.38,2.9],[-.62,1.7]],.6,.08,'armor',.02);
      block(.46,.025,.22,0,.765,-1.8,'red',.004);
      block(.31,.026,.035,0,.766,-1.45,'steel',.004);
      for(let i=0;i<4;i++){
        const vane=section('Cruciform_tail_fin_'+i,()=>{
          plate([[.47,1.9],[.78,2.25],[1.48,4.2],[.91,4.06],[.47,3.2]],-.07,.14,'armor',.025);
          plate([[.67,2.5],[.8,2.74],[1.24,3.87],[.94,3.71]],.077,.025,'steel',.008);
        });vane.rotation.z=i*Math.PI/2;
      }
      engine(0,0,4.48,.41,true);
    });
  }

  const model=k.finish();
  for(const e of model.userData.engineNozzles)e.position[2]-=.0025;
  model.traverse(o=>{if(o.isMesh&&o.material.name==='armor'){
    const old=o.material;o.material=new THREE.MeshPhysicalMaterial({color:old.color,metalness:reaper?.38:.45,roughness:reaper?.56:.31,clearcoat:reaper?.25:1,clearcoatRoughness:.4,iridescence:reaper?.15:.45,iridescenceIOR:1.35,envMapIntensity:reaper?.12:1});o.material.name='ceramic_iridescent';
  }});
  model.userData={...model.userData,modelId:id,revision:'armored-antimatter-02',specialDesign:true,weaponLayout:shipWeaponLayouts[id],design:reaper?'黑曜镰翼 / 相位收割舰':'湮灭之星 / 反物质自行导弹',designSource:'User-authorized original design; trial loadout, not recovered APK balance'};
  return model;
}
