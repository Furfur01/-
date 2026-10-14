export function createBattlePresentation({state,M,V,LAYOUTS,shipMatrix}) {
  // Cosmetic geometry only. Every discharge/impact originates from a server event.
  class BattlePresentation {
    constructor(){this.impacts=[];this.flashes=[];}
    event(e,battle){
      if(e.type==='fire')this.flashes.push({pos:e.from,color:this.color(e.kind),age:0,life:.22});
      if(e.type==='hit'||e.type==='destroy'||e.type==='intercept'){
        this.impacts.push({id:e.shipId,pos:[e.x,e.y,e.z],shield:e.type==='hit'&&e.shield,dead:e.type==='destroy',age:0,life:e.type==='destroy'?2.4:.7,radius:Math.max(2,battle.metadata[e.shipId]?.profile.length*.65||3)});
      }
    }
    color(kind){return /laser|ion/.test(kind)?[1,.45,.09]:/plasma/.test(kind)?[.35,.5,1]:/beam/.test(kind)?[.12,.65,1]:[1,.8,.45];}
    update(dt){this.impacts=this.impacts.filter(e=>(e.age+=dt)<e.life).slice(-160);this.flashes=this.flashes.filter(e=>(e.age+=dt)<e.life).slice(-240);}
    clear(){this.impacts=[];this.flashes=[];}
    environment(r,time){
      r.drawSpaceSky(.8);
      const planet=M.compose([3200,-2500,-5200],[.1,.42,.18],[900,900,900]);
      r.drawMesh(r.moonMesh,planet,{mode:7,light:[-.5,.7,1],exposure:1.1});
      r.setBlend(true,false);
      r.drawMesh(r.moonMesh,M.compose([3200,-2500,-5200],[.1,.42,.18],[915,915,915]),{mode:8});
      r.setBlend(false,true);
    }
    draw(r,battle,allWeapons){
      const data=[],glows=[],focal=r.height/(2*Math.tan(r.fov/2)),eye=r.eye;
      const pixelSize=p=>Math.max(.015,V.length(V.sub(p,eye))/focal);
      const ribbon=(a,b,color,width,alpha=1)=>{
        const direction=V.sub(b,a),mid=V.scale(V.add(a,b),.5),side=V.norm(V.cross(direction,V.sub(eye,mid)));
        if(!Number.isFinite(side[0]))return;
        const w=Math.max(width,pixelSize(mid)*8),offset=V.scale(side,w);
        const points=[V.sub(a,offset),V.add(a,offset),V.sub(b,offset),V.add(b,offset)];
        for(const i of [0,1,2,2,1,3])data.push(...V.sub(points[i],eye),...color,i<2?0:1,i%2?1:-1,alpha);
      };
      const glow=(p,c,size,alpha=1)=>glows.push(...p,...c.map(v=>v*alpha),size);
      if(allWeapons){
        for(const beam of state.flight.beams.slice(-240)){
          const alpha=Math.max(0,1-beam.age/beam.life);ribbon(beam.start,beam.end,beam.color,beam.width*2,alpha);
          glow(beam.start,beam.color,12,alpha);glow(beam.end,beam.color,16,alpha*.65);
        }
        for(const q of state.flight.projectiles){
          const speed=V.length(q.velocity),tail=V.sub(q.pos,V.scale(V.norm(q.velocity),Math.min(q.missile?40:28,speed*.08)));
          const color=q.missile?[1,.55,.16]:q.color||[.6,.8,1];ribbon(tail,q.pos,color,q.missile?.32:.45,.9);glow(q.pos,color,q.missile?9:7);
        }
      }
      // Engines are anchored to the same original nozzle positions as the piloted hull.
      for(const id of battle.engineIds||[]){
        const row=battle.row(id),index=battle.indices.get(battle.metadata[id]?.type),layout=LAYOUTS[index];if(!row||!layout||row[9]<.1)continue;
        const model=shipMatrix({pos:row.slice(1,4),yaw:Math.PI-row[4],pitch:row[5],roll:0},index);
        if(V.length(V.sub(row.slice(1,4),eye))>1800)continue;
        for(const nozzle of layout.engines.slice(0,6)){
          const at=M.transform(model,nozzle.position),dir=V.norm(V.sub(M.transform(model,nozzle.direction),M.transform(model,[0,0,0])));
          const length=nozzle.radius*(5+Math.min(1,row[9]/battle.metadata[id].profile.speed)*9);
          ribbon(at,V.add(at,V.scale(dir,length)),[.12,.5,1],nozzle.radius*.8,.65);glow(at,[.3,.7,1],Math.min(16,Math.max(3,nozzle.radius/pixelSize(at)*2)),.7);
        }
      }
      for(const flash of allWeapons?this.flashes:[])glow(flash.pos,flash.color,22,1-flash.age/flash.life);
      const right=V.norm(V.cross(r.cameraForward,r.cameraUp)),up=V.norm(V.cross(right,r.cameraForward));
      for(const e of allWeapons?this.impacts.slice(-Math.floor(40*battle.quality)):[]){
        const phase=e.age/e.life,alpha=1-phase,row=battle.row(e.id);
        const at=e.shield&&row?.[6]>0?row.slice(1,4):e.pos;
        const radius=e.dead?e.radius*(.5+phase*5):e.radius*(1+phase*.15),color=e.shield?[.12,.6,1]:[1,.4,.07];
        const size=Math.min(180,Math.max(12,radius/pixelSize(at)*2));
        glow(at,color,size,alpha*(e.shield?.3:.9));glow(at,[1,.9,.65],size*.22,alpha*(e.shield?.2:1));
        if(e.shield||e.dead){
          let previous;
          for(let i=0;i<=24;i++){
            const angle=i/24*Math.PI*2,p=V.add(at,V.add(V.scale(right,Math.cos(angle)*radius),V.scale(up,Math.sin(angle)*radius*(e.dead?.45:1))));
            if(previous)ribbon(previous,p,color,pixelSize(at)*1.2,alpha*(e.shield?.7:.4));previous=p;
          }
        }
        if(e.dead)for(let i=0;i<12;i++){
          const angle=i*2.39996,dir=V.add(V.scale(right,Math.cos(angle)),V.scale(up,Math.sin(angle))),tip=V.add(at,V.scale(dir,radius*(.7+(i%4)*.15)));
          ribbon(V.sub(tip,V.scale(dir,e.radius*.3)),tip,[1,.65,.25],.15,alpha);
        }
      }
      r.setBlend(true,false);
      if(data.length)r.drawRibbons(new Float32Array(data));
      if(glows.length)r.dynamicFlat(glows,true,1);
      r.setBlend(false,true);
    }
  }

return new BattlePresentation();
}
