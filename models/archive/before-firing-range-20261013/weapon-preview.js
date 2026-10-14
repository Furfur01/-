import * as THREE from 'three';

// Visual timings only: damage, unlock requirements and saved battles are unchanged.
export const weaponEffects={
  light_laser:{color:0xff4937,beam:true,life:.10,pulses:3,gap:.14},
  heavy_laser:{color:0xff8a45,beam:true,life:.16,pulses:2,gap:.2},
  ion:{color:0x50eaff,life:.58,pulses:4,gap:.17},
  shell:{color:0xffce89,life:.38,pulses:1,gap:0},
  laser:{color:0xa3edff,beam:true,life:.58,charge:.45,pulses:1,gap:0},
  plasma:{color:0xb77aff,life:1.15,charge:.4,pulses:1,gap:0},
  nuclear:{color:0xffecbd,life:1.3,charge:.85,pulses:1,gap:0},
  heavy:{color:0xd19aff,life:.62,charge:.45,pulses:1,gap:0},
  advanced:{color:0xffe6a0,life:.45,charge:.3,pulses:2,gap:.18},
  missile:{color:0xbb8bff,life:1.75,pulses:1,gap:0},
};
export function createWeaponPreview(scene){
  const group=new THREE.Group();group.name='Weapon_visual_demo';
  let model=null,layout=null,started=null,lastThreat=-1,lastMain=-1,objects=[],queue=[];
  const glow=(color,opacity=1)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false});
  const dispose=o=>{o.traverse(n=>{n.geometry?.dispose();for(const m of n.material?(Array.isArray(n.material)?n.material:[n.material]):[])m.dispose();});o.removeFromParent();};
  const point=p=>model.localToWorld(new THREE.Vector3(...p));
  const scale=()=>model.getWorldScale(new THREE.Vector3()).x;
  // A flagship has small defensive calibres; hull size must not inflate its bullets.
  const caliberScale=()=>Math.min(scale(),Math.sqrt(scale()));
  function add(o,kind,time,life,data={}){group.add(o);objects.push({o,kind,birth:time,life,...data});return o;}
  function segment(a,b,r,color){
    const d=b.clone().sub(a),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,Math.max(d.length(),.00001),6),glow(color));
    o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.lengthSq()?d.normalize():new THREE.Vector3(0,1,0));return o;
  }
  function orb(at,r,color,time,life,name,kind='flash'){
    const o=new THREE.Mesh(new THREE.SphereGeometry(r,12,8),glow(color,.8));o.position.copy(at);o.name=name;return add(o,kind,time,life);
  }
  function ring(at,r,color,time,life,name){
    const o=new THREE.Mesh(new THREE.TorusGeometry(r,r*.025,4,40),glow(color));o.position.copy(at);o.name=name;add(o,'ring',time,life);
  }
  function impact(at,r,color,time,kind){
    orb(at,r*.22,0xfff5dd,time,.16,'Impact_flash');
    const vertices=[];
    for(let i=0;i<18;i++){
      const a=i*2.399,dir=new THREE.Vector3(Math.cos(a),(i%7-3)*.24,Math.sin(a)).normalize();
      const mid=dir.clone().multiplyScalar(r*.45);if(kind==='ion')mid.y+=r*.3;
      vertices.push(0,0,0,...mid.toArray(),...mid.toArray(),...dir.multiplyScalar(r).toArray());
    }
    const o=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(vertices,3)),new THREE.LineBasicMaterial({color,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
    o.position.copy(at);o.name=kind==='ion'?'Ion_impact_arcs':'Impact_fragments';add(o,'burst',time,.5);
    if(['nuclear','heavy','missile','plasma'].includes(kind)){
      ring(at,r*.5,color,time,.7,kind==='heavy'?'Shield_puncture':'Shock_ring');
      orb(at,r*.4,color,time,.55,kind==='nuclear'?'Collapse_bloom':'Plasma_bloom',kind==='nuclear'?'collapse':'burst');
    }
  }
  function projectile(from,to,time,kind,r,life,threat=null,direction=null){
    const color=kind==='pd'?0xffcc72:weaponEffects[kind].color,o=new THREE.Group();o.name=kind==='pd'?'Point_defense_bullet':kind==='missile'?'Guided_missile':'Primary_'+kind+'_projectile';
    const body=new THREE.Mesh(kind==='plasma'||kind==='nuclear'?new THREE.SphereGeometry(r,12,8):new THREE.ConeGeometry(r,kind==='heavy'?r*14:r*6,8),glow(0xfff7de));
    const halo=new THREE.Mesh(new THREE.SphereGeometry(r*1.7,10,6),glow(color,.32));
    if(!['plasma','nuclear'].includes(kind))halo.scale.set(1,3,1);
    o.add(body,halo);o.position.copy(from);
    const trail=segment(from,from,r*.35,kind==='missile'?0xffa95c:color);trail.name=kind==='missile'?'Missile_exhaust':'Projectile_trail';
    const curve=kind==='missile'?new THREE.CubicBezierCurve3(from,from.clone().add(direction.clone().multiplyScalar(scale()*1.5)),to.clone().add(new THREE.Vector3(scale()*(from.x>to.x?1:-1),scale(),scale()*2)),to):null;
    add(trail,'trail',time,life);add(o,'projectile',time,life,{from,to,threat,weaponKind:kind,r,curve,trail});
  }
  function fire(muzzle,time,kind){
    const fx=weaponEffects[kind],from=point(muzzle),to=point([muzzle[0],muzzle[1],Math.min(muzzle[2]-4,-10)]),r=layout.caliber*caliberScale();
    orb(from,r*1.4,fx.color,time,.15,'Muzzle_flash');
    if(fx.beam){
      const o=segment(from,to,r*.5,fx.color);o.name='Primary_'+kind+'_beam';add(o,'flash',time,fx.life);
      const core=segment(from,to,r*.17,0xffffff);core.name='Beam_core';add(core,'flash',time,fx.life);
      impact(to,r*5,fx.color,time,kind);
    }else projectile(from,to,time,kind,r*(kind==='plasma'||kind==='nuclear'?1.2:.65),fx.life);
  }
  function schedule(time){
    const fx=weaponEffects[layout.kind];
    layout.muzzles.forEach((m,i)=>{
      const delay=layout.kind==='shell'?Math.floor(i/2)*.14:0;
      if(fx?.charge)queue.push({time:time+delay,run:t=>orb(point(m),layout.caliber*caliberScale()*1.7,fx.color,t,fx.charge,'Primary_charge',layout.kind==='nuclear'?'collapse':'charge')});
      for(let n=0;n<(fx?.pulses||0);n++)queue.push({time:time+delay+(fx.charge||0)+n*fx.gap,run:t=>fire(m,t,layout.kind)});
    });
    const ports=layout.missiles||[],half=ports.length/2;
    for(let n=0;n<ports.length;n++){
      const index=n%2?half+Math.floor(n/2):Math.floor(n/2),m=ports[index];
      queue.push({time:time+.7+n*.1,run:t=>{
        const from=point(m),to=point([(n%2?1:-1)*1.3,-.3,-10.3]);
        const direction=new THREE.Vector3(...layout.launchDirection).transformDirection(model.matrixWorld);
        orb(from,.09*caliberScale(),0xffbf72,t,.12,'Missile_port_flash');
        projectile(from,to,t,'missile',.075*caliberScale(),1.75,null,direction);
      }});
    }
    queue.sort((a,b)=>a.time-b.time);
  }
  function stop(){objects.forEach(item=>dispose(item.o));objects=[];queue=[];group.removeFromParent();model=layout=null;started=null;lastThreat=lastMain=-1;}
  function start(ship){stop();if(!ship?.userData.weaponLayout)return false;model=ship;layout=ship.userData.weaponLayout;scene.add(group);return true;}
  function update(time){
    if(!model)return;if(started===null)started=time;const elapsed=time-started;model.updateWorldMatrix(true,true);const s=scale();
    const wave=Math.floor(elapsed/2.4);
    if(layout.pointDefense.length&&wave!==lastThreat){
      lastThreat=wave;const fighter=wave%2===1,sign=wave%4<2?1:-1,from=point([sign*6,3.5,2]),to=point([sign*2.9,1.7,-2]);
      const o=new THREE.Group();o.name=fighter?'Incoming_fighter':'Incoming_missile';
      const body=new THREE.Mesh(new THREE.ConeGeometry((fighter?.12:.06)*s,.45*s,6),glow(0xff987c));body.rotation.x=-Math.PI/2;o.add(body);
      if(fighter)o.add(new THREE.Mesh(new THREE.BoxGeometry(.65*s,.035*s,.15*s),glow(0xef866b)));
      o.position.copy(from);o.lookAt(to);add(o,'threat',time,1.8,{from,to,nextShot:time+.22,hits:0});
    }
    const mainWave=Math.floor(elapsed/5.2);if(mainWave!==lastMain){lastMain=mainWave;schedule(time);}
    while(queue.length&&queue[0].time<=time){const job=queue.shift();job.run(job.time);}
    for(const item of [...objects]){
      const age=time-item.birth,p=Math.min(age/item.life,1);
      if(item.kind==='threat'){
        item.o.position.lerpVectors(item.from,item.to,p);
        if(age>.22&&age<1.5&&time>=item.nextShot){
          const ts=layout.pdScale||(model.name==='Iron_Behemoth'?.29:.34);
          const mounts=layout.pointDefense.map(([x,y,z])=>point([x+.22*ts,y+.096*ts,z-.905*ts]));mounts.sort((a,b)=>a.distanceToSquared(item.o.position)-b.distanceToSquared(item.o.position));
          item.nextShot=Math.max(item.nextShot,time-.135);
          while(item.nextShot<=time){
            const aim=item.from.clone().lerp(item.to,Math.min((item.nextShot-item.birth+.82)/1.8,1));
            for(const mount of mounts.slice(0,3))projectile(mount,aim,item.nextShot,'pd',.022*caliberScale(),.82,item);
            item.nextShot+=.045;
          }
        }
        if(item.hits>=12){impact(item.o.position,.6*caliberScale(),0xffd29a,time,'pd');item.life=0;}
      }else if(item.kind==='projectile'){
        const position=item.curve?item.curve.getPoint(p):item.from.clone().lerp(item.to,p);
        const previous=item.curve?item.curve.getPoint(Math.max(0,p-.06)):item.from.clone().lerp(item.to,Math.max(0,p-.02));
        item.o.position.copy(position);const d=position.clone().sub(previous);if(d.lengthSq())item.o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());
        item.trail.position.copy(position).add(previous).multiplyScalar(.5);item.trail.scale.y=Math.max(d.length(),.00001)/.00001;
        if(d.lengthSq())item.trail.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
        if(p===1){if(item.threat){if(item.threat.o.parent)item.threat.hits++;}else impact(item.to,item.r*(item.weaponKind==='nuclear'?13:7),weaponEffects[item.weaponKind].color,time,item.weaponKind);}
      }else if(item.kind!=='trail'){
        item.o.material.opacity=item.kind==='charge'?p:1-p;
        if(['burst','ring'].includes(item.kind))item.o.scale.setScalar(.4+p*2.7);
        if(item.kind==='charge')item.o.scale.setScalar(.3+p);
        if(item.kind==='collapse')item.o.scale.setScalar(p<.5?.6+p*2:2.6-p*2.4);
      }
      if(age>=item.life){dispose(item.o);objects.splice(objects.indexOf(item),1);}
    }
  }
  return {start,stop,update,get active(){return !!model;}};
}
