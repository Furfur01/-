import * as THREE from 'three';

// A local visual demonstration; it does not resolve battles or change saved units.
export function createWeaponPreview(scene){
  const group=new THREE.Group();group.name='Weapon_visual_demo';
  let model=null,layout=null,started=null,lastThreat=-1,lastMain=-1,objects=[];
  const dispose=o=>{o.traverse(n=>{n.geometry?.dispose();if(n.material){for(const m of Array.isArray(n.material)?n.material:[n.material])m.dispose();}});o.removeFromParent();};
  const glow=(color,opacity=1)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false});
  function point(p){return model.localToWorld(new THREE.Vector3(...p));}
  function line(a,b,color,width,life,time,name){
    const d=b.clone().sub(a),o=new THREE.Mesh(new THREE.CylinderGeometry(width,width,d.length(),6),glow(color));o.name=name;
    o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());group.add(o);objects.push({o,kind:'flash',birth:time,life});
  }
  function bullet(from,to,time,threat){
    const scale=layout.scale,o=new THREE.Group();o.name='Point_defense_bullet';
    const core=new THREE.Mesh(new THREE.CylinderGeometry(.022*scale,.022*scale,.13*scale,5),glow(0xffefbc));
    const halo=new THREE.Mesh(new THREE.CylinderGeometry(.043*scale,.026*scale,.21*scale,5),glow(0xffb345,.3));
    o.add(core,halo);o.position.copy(from);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),to.clone().sub(from).normalize());
    group.add(o);objects.push({o,kind:'bullet',birth:time,life:.82,from,to,threat});
  }
  function burst(at,size,time){
    const positions=[];for(let i=0;i<22;i++){const a=i*2.399,b=(i%7-3)*.19,v=new THREE.Vector3(Math.cos(a),b,Math.sin(a)).normalize().multiplyScalar(size);positions.push(0,0,0,...v.toArray());}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    const o=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0xffd29a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));o.position.copy(at);group.add(o);objects.push({o,kind:'burst',birth:time,life:.65});
    const ring=new THREE.Mesh(new THREE.TorusGeometry(size*.35,size*.015,4,40),glow(0x81eaff));ring.position.copy(at);ring.rotation.x=Math.PI/2;group.add(ring);objects.push({o:ring,kind:'burst',birth:time,life:.6});
  }
  function stop(){for(const item of objects)dispose(item.o);objects=[];group.removeFromParent();model=layout=null;started=null;lastThreat=lastMain=-1;}
  function start(ship){stop();if(!ship.userData.weaponLayout)return false;model=ship;layout=ship.userData.weaponLayout;scene.add(group);return true;}
  function update(time){
    if(!model)return;if(started===null)started=time;const elapsed=time-started,scale=layout.scale;
    model.updateMatrixWorld(true);
    const wave=Math.floor(elapsed/2.4);
    if(wave!==lastThreat){
      lastThreat=wave;const fighter=wave%2===1,sign=wave%4<2?1:-1;
      const from=point([sign*6,3.5,2]),to=point([sign*2.9,1.7,-2]);
      const o=new THREE.Group();o.name=fighter?'Incoming_fighter':'Incoming_missile';
      const body=new THREE.Mesh(new THREE.ConeGeometry((fighter?.12:.06)*scale,.45*scale,6),glow(fighter?0xff9579:0xffca84));body.rotation.x=-Math.PI/2;o.add(body);
      if(fighter){const wing=new THREE.Mesh(new THREE.BoxGeometry(.65*scale,.035*scale,.15*scale),glow(0xef866b));o.add(wing);}
      o.position.copy(from);o.lookAt(to);group.add(o);objects.push({o,kind:'threat',birth:time,life:1.8,from,to,nextShot:time+.22,hits:0});
    }
    const mainWave=Math.floor(elapsed/5.2);
    if(mainWave!==lastMain){
      lastMain=mainWave;
      const color={laser:0x71ddff,plasma:0xc691ff,nuclear:0xa1ff80,heavy:0xffb974,advanced:0x76cfff}[layout.kind];
      for(const m of layout.muzzles){const from=point(m),to=point([m[0],m[1],m[2]-4]);line(from,to,color,layout.caliber*.19*scale,.27,time,'Primary_flash');}
    }
    for(const item of [...objects]){
      const age=time-item.birth;
      if(item.kind==='threat'){
        item.o.position.lerpVectors(item.from,item.to,Math.min(age/1.8,1));
        if(age>.22&&age<1.5&&time>=item.nextShot){
          const mounts=layout.pointDefense.map(p=>point(p));mounts.sort((a,b)=>a.distanceToSquared(item.o.position)-b.distanceToSquared(item.o.position));
          // Three mounts fire 22 rounds/s each; keep .82 s flight visible and lead the moving target.
          item.nextShot=Math.max(item.nextShot,time-.135);
          while(item.nextShot<=time){
            const aim=item.from.clone().lerp(item.to,Math.min((item.nextShot-item.birth+.82)/1.8,1));
            for(const mount of mounts.slice(0,3))bullet(mount.clone().add(new THREE.Vector3(0,.07*scale,-.25*scale)),aim,item.nextShot,item);
            item.nextShot+=.045;
          }
        }
        if(item.hits>=12||age>=1.8){burst(item.o.position,.75*scale,time);item.life=0;}
      }else if(item.kind==='bullet'){
        item.o.position.lerpVectors(item.from,item.to,Math.min(age/item.life,1));
        if(age>=item.life&&item.threat.o.parent)item.threat.hits++;
      }else{const progress=Math.min(age/item.life,1);item.o.material.opacity=1-progress;if(item.kind==='burst')item.o.scale.setScalar(.5+progress*2.4);}
      if(age>=item.life){dispose(item.o);objects.splice(objects.indexOf(item),1);}
    }
  }
  return {start,stop,update,get active(){return !!model;}};
}
