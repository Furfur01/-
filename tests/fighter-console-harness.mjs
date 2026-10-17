import assert from 'node:assert/strict';

export async function consoleLayout(page){
 return page.evaluate(()=>{
  const scene=window.CommandApp?.scene,rect=scene?.frame.getBoundingClientRect();
  const panels=scene?scene.renderer.getMapFighterConsole():window.GalacticDemo?.renderer.fighterConsoleLayout();
  return (panels||[]).map(p=>({...p,corners:p.corners.map(q=>({...q,x:q.x+(rect?.left||0),y:q.y+(rect?.top||0)})),controls:p.controls.map(h=>({...h,point:{...h.point,x:h.point.x+(rect?.left||0),y:h.point.y+(rect?.top||0)}}))}));
 });
}
export async function clickConsole(page,action,value,surface){
 await page.waitForFunction(()=>window.CommandApp?.scene?.renderer?.getMapFighterConsole?.()?.length===5||window.GalacticDemo?.renderer?.fighterConsoleLayout?.()?.length===5);
 // Wait for the next texture update after a target/authority change.
 await page.waitForTimeout(80);
 const panels=await consoleLayout(page),hit=panels.filter(p=>!surface||p.id===surface).flatMap(p=>p.controls).find(h=>h.action===action&&(value===undefined||h.value===String(value)));
 assert(hit,`Physical console control ${action} ${value??''} must be available`);
 assert(hit.point.visible!==false,'Console control must be in front of the camera');
 await page.mouse.click(hit.point.x,hit.point.y);
}
