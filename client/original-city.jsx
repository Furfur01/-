import React,{useEffect,useRef} from 'react';

let scenePromise;
export function loadCity(){
  return scenePromise??=(async()=>{
    const response=await fetch('./assets/original/scenes/city.json?v=20260928');
    if(!response.ok)throw new Error('主星场景读取失败');
    const scene=await response.json(),images={};
    await Promise.all(scene.atlases.map(name=>new Promise((resolve,reject)=>{
      const image=new Image();image.onload=()=>{images[name]=image;resolve();};image.onerror=reject;
      image.src=`./assets/original/scenes/atlases/${name}?v=20260928`;
    })));
    return {scene,images};
  })().catch(error=>{scenePromise=null;throw error;});
}

export function drawCity(ctx,scene,images,tick,foreground=false){
  ctx.clearRect(0,0,1600,1120);
  function draw(id,age){
    const shape=scene.shapes[id];
    if(shape){
      const [x,y,r,b]=shape.box;
      ctx.drawImage(images[shape.atlas],x,y,r-x,b-y,...shape.rect);
      return;
    }
    const frames=scene.sprites[id];if(!frames)return;
    const frame=Math.max(0,age)%frames.length;
    for(const item of frames[frame]){
      if(item.alpha<=0)continue;
      ctx.save();ctx.transform(...item.m);ctx.globalAlpha*=item.alpha;
      if(item.blend===8)ctx.globalCompositeOperation='lighter';
      else if(item.blend===3)ctx.globalCompositeOperation='multiply';
      else if(item.blend===4)ctx.globalCompositeOperation='screen';
      // A child keeps playing when its parent's display list has one static frame.
      draw(item.id,frames.length===1?age:Math.max(0,frame-item.start));ctx.restore();
    }
  }
  ctx.save();ctx.transform(...scene.transform);
  for(const item of foreground?scene.foreground:scene.roots){
    ctx.save();ctx.transform(...item.m);ctx.globalAlpha=item.alpha;
    draw(item.id,tick);ctx.restore();
  }
  ctx.restore();
}

export function OriginalCity({foreground=false}){
  const canvas=useRef(null);
  useEffect(()=>{
    let disposed=false,handle=0,last=-1;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    loadCity().then(({scene,images})=>{
      if(disposed)return;
      const context=canvas.current.getContext('2d'),start=performance.now();
      const render=now=>{
        if(disposed)return;
        const tick=reduced.matches?0:Math.floor((now-start)*scene.fps/1000);
        if(!document.hidden&&tick!==last){drawCity(context,scene,images,tick,foreground);last=tick;canvas.current.dataset.frame=String(tick);}
        handle=requestAnimationFrame(render);
      };
      render(start);
    }).catch(()=>{if(canvas.current)canvas.current.dataset.failed='true';});
    return()=>{disposed=true;cancelAnimationFrame(handle);};
  },[foreground]);
  return <canvas ref={canvas} width="1600" height="1120" className={`original-city ${foreground?'city-foreground':'city-ground'}`} aria-hidden="true"/>;
}
