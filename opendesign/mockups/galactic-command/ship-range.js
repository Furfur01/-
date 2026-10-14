import * as THREE from 'three';
import {disposeShip} from './ship-models.js';

export function createFiringRange(scene,preview){
  const controls=document.createElement('div');controls.id='range-controls';
  controls.innerHTML='<div class="range-actions"><button id="range-primary">主炮 <kbd>Space</kbd></button><button id="range-missiles">导弹齐射 <kbd>R</kbd></button><button id="range-defense" aria-pressed="false">近防拦截 <kbd>C</kbd></button></div><p id="range-status" role="status" aria-live="polite">选择舰船，开始试射</p><small>固定靶试射 · 拖动观察 · 命中计数为演练记录</small>';
  document.querySelector('#stage').append(controls);document.querySelector('#stage').tabIndex=0;
  const primary=controls.querySelector('#range-primary'),missiles=controls.querySelector('#range-missiles'),defense=controls.querySelector('#range-defense'),status=controls.querySelector('#range-status');
  let target=null,hits=0,interception=false;
  function fire(kind){
    const ok=kind==='primary'?preview.firePrimary():preview.fireMissiles();
    status.textContent=ok?(kind==='primary'?'主炮开火':'导弹依次出舱')+' · 命中 '+hits:'武器冷却中';
  }
  primary.onclick=()=>fire('primary');missiles.onclick=()=>fire('missiles');
  defense.onclick=()=>{interception=!interception;preview.setDefense(interception);defense.setAttribute('aria-pressed',String(interception));status.textContent=interception?'近防演练启动：导弹与战机交替来袭':'近防演练停止 · 命中 '+hits;};
  document.addEventListener('keydown',e=>{
    if(e.repeat||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,select,textarea,[contenteditable="true"]')||(e.code==='Space'&&e.target.closest('button,a'))||document.querySelector('dialog[open]'))return;
    const button=e.code==='Space'?primary:e.code==='KeyR'?missiles:e.code==='KeyC'?defense:null;
    if(button&&!button.disabled){e.preventDefault();button.click();}
  });
  function select(model){
    if(target){target.removeFromParent();disposeShip(target);target=null;}
    hits=0;interception=false;defense.setAttribute('aria-pressed','false');
    const layout=model.userData.weaponLayout;
    primary.disabled=!layout?.muzzles.length;missiles.disabled=!layout?.missiles?.length;defense.disabled=!layout?.pointDefense.length;
    if(!layout){preview.stop();status.textContent='此舰未配置试射武器';return;}
    target=new THREE.Group();target.name='Practice_target';target.position.copy(model.localToWorld(new THREE.Vector3(0,0,-12)));target.scale.copy(model.getWorldScale(new THREE.Vector3()));
    const plate=new THREE.Mesh(new THREE.PlaneGeometry(9,7),new THREE.MeshBasicMaterial({color:0x164755,transparent:true,opacity:.27,side:THREE.DoubleSide,depthWrite:false}));target.add(plate);
    const grid=[];for(let x=-4;x<=4;x++)grid.push(x,-3.5,0,x,3.5,0);for(let y=-3;y<=3;y++)grid.push(-4.5,y,0,4.5,y,0);
    target.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(grid,3)),new THREE.LineBasicMaterial({color:0x65aabb,transparent:true,opacity:.45})));
    for(const radius of [.45,1.3,2.6])target.add(new THREE.Mesh(new THREE.TorusGeometry(radius,.018,4,64),new THREE.MeshBasicMaterial({color:0x9adce2})));
    scene.add(target);
    preview.start(model,{automatic:false,defense:false,targetZ:-12,onHit:()=>{hits++;status.textContent='命中 '+hits+' · '+(interception?'近防演练中':'靶标就绪');}});
    status.textContent=primary.disabled&&missiles.disabled?'自卫旗舰：点击近防拦截，启动来袭演练':'靶标就绪 · 主炮 / 导弹可分别试射';
  }
  return {select,get target(){return target;}};
}
