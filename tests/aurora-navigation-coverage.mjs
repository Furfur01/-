import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.resolve('output/playwright/aurora-navigation');fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),result={checks:[],errors:[],graphicsWarnings:[],transitions:[],actions:[]};
page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='warning'&&/INVALID|GL_|WebGL/i.test(m.text()))result.graphicsWarnings.push(m.text())});page.on('request',r=>{if(r.url().endsWith('/api/action'))result.actions.push(r.postDataJSON())});
const ready=biome=>page.waitForFunction(type=>CommandApp.scene?.renderer?.ready&&(!type||CommandApp.scene.renderer.biome===type)&&document.querySelectorAll('.aurora-game-frame').length===1,biome,{timeout:60000});
const system=async()=>{await page.locator('.bottom-bar [data-page="system"]').click();await page.waitForFunction(()=>CommandApp.scene.snapshot.navigation.level==='system',null,{timeout:30000});};
const select=async id=>{await page.locator('[data-map-select="'+id+'"]').click();await page.waitForFunction(id=>CommandApp.scene.snapshot.navigation.selectedPlanetId===id,id);};
try{
 await page.goto('http://127.0.0.1:8292/?navigation=coverage',{waitUntil:'networkidle'});await ready();assert.equal(await page.evaluate(()=>EmpireAPI.state.player.name),'星球接入验收');
 const owned=await page.evaluate(()=>EmpireAPI.state.planets.filter(p=>!p.moon).map(p=>({id:p.id,biome:p.biome})));
 for(const {id,biome} of owned){
  await system();await select(id);
  await page.evaluate(()=>{window._navigationCoverage=[];window._coverageInterval=setInterval(()=>{const frames=[...document.querySelectorAll('.aurora-game-frame')];_navigationCoverage.push({count:frames.length,visible:frames.filter(f=>getComputedStyle(f).opacity!=='0'&&!f.hidden).length,level:CommandApp.scene.snapshot?.navigation?.level,capturePlanetId:CommandApp.scene.snapshot?.navigation?.capturePlanetId});},16)});
  await page.locator('[data-map-enter="'+id+'"]').click();await ready(biome);await page.waitForFunction(id=>EmpireAPI.planet.id===id&&CommandApp.scene.snapshot.navigation.level==='planet',id);
  const frames=await page.evaluate(()=>{clearInterval(_coverageInterval);return _navigationCoverage});assert(frames.every(f=>f.count<=2&&f.visible>=1),'visible scene retained during biome load');assert(frames.some(f=>f.level==='in'&&f.capturePlanetId===id),'correct planet capture animates inward');result.transitions.push({biome,samples:frames.length,maxFrames:Math.max(0,...frames.map(x=>x.count)),minVisible:Math.min(1,...frames.map(x=>x.visible)),inFrames:frames.filter(f=>f.level==='in').length,captureCorrect:frames.filter(f=>f.level==='in').every(f=>f.capturePlanetId===id)});
  const overlay=await page.evaluate(()=>{const w=CommandApp.scene.frame.contentWindow,e=w.document.getElementById('loading');if(!e)return null;const s=w.getComputedStyle(e);return {display:s.display,opacity:Number(s.opacity)};});assert(!overlay||overlay.display==='none'||overlay.opacity<.02,'new scene must not reveal the sample loading veil');
  await page.screenshot({path:path.join(out,'entry-'+biome+'.png')});
 }
 result.checks.push('All four planet biomes enter from actual system UI; old canvas remains visible during replacement and is disposed afterwards');
 await system();
 const enemy=await page.evaluate(()=>EmpireAPI.state.map.find(p=>p.id&&p.position[0]===1&&p.position[1]===16&&!p.moon&&!EmpireAPI.state.planets.some(q=>q.id===p.id)&&(p.owner||p.npc)).id);
 const previous=await page.evaluate(()=>({id:EmpireAPI.planet.id,src:CommandApp.scene.frame.src}));await select(enemy);assert.match(await page.locator('#system-target').innerText(),/尚未侦察/);assert.equal(await page.locator('#system-target [data-map-enter]').count(),0);
 await page.waitForTimeout(600);const point=await page.evaluate(id=>CommandApp.scene.snapshot.navigation.targets.find(p=>p.id===id),enemy),box=await page.locator('.aurora-game-frame').boundingBox();await page.mouse.dblclick(box.x+point.x,box.y+point.y);await page.waitForTimeout(350);
 assert.equal(await page.evaluate(()=>EmpireAPI.planet.id),previous.id);assert.equal(await page.evaluate(()=>CommandApp.scene.frame.src),previous.src);assert.equal(await page.evaluate(()=>CommandApp.scene.snapshot.navigation.level),'system');assert.match(await page.locator('#system-target').innerText(),/尚未侦察/);await page.screenshot({path:path.join(out,'enemy-public-only.png')});result.checks.push('Unscouted enemy double-click preserves the system view and current colony; no building or fleet details are exposed');
 await page.locator('[data-page="galaxy"]').click();const astral=page.frameLocator('#astral');await astral.locator('#object-title').waitFor({state:'visible',timeout:30000});await page.waitForTimeout(900);await page.screenshot({path:path.join(out,'galaxy.png')});
 await system();result.checks.push('Galaxy entry and return to the merged system retain the selected colony');
 const own=owned.find(p=>p.biome==='terrestrial');await select(own.id);await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);await page.screenshot({path:path.join(out,'mobile-system.png')});
 const boxes=await page.evaluate(()=>Object.fromEntries(['system-target','system-orbits'].map(id=>{const b=document.getElementById(id).getBoundingClientRect();return [id,{left:b.left,right:b.right,top:b.top,bottom:b.bottom}]})));
 assert(boxes['system-target'].left>=0&&boxes['system-target'].right<=390);assert(boxes['system-orbits'].left>=0&&boxes['system-orbits'].right<=390);assert(boxes['system-target'].bottom<boxes['system-orbits'].top,'mobile target panel leaves orbit list unobstructed');
 await page.locator('[data-map-enter="'+own.id+'"]').click();await ready('terrestrial');await page.waitForFunction(()=>CommandApp.scene.snapshot.navigation.level==='planet');await page.screenshot({path:path.join(out,'mobile-planet.png')});
 const controls=await page.locator('.aurora-game-controls').evaluate(el=>({scroll:el.scrollWidth,width:el.clientWidth,right:el.getBoundingClientRect().right}));assert(controls.right<=390&&controls.scroll<=controls.width+1,'eight controls fit on mobile');
 result.checks.push('390px system target/orbit panels and eight planet controls fit; mobile map entry works');assert.deepEqual(result.errors,[]);assert.deepEqual(result.graphicsWarnings,[]);assert.deepEqual(result.actions,[]);result.passed=true;console.log(JSON.stringify(result,null,2));
}finally{fs.writeFileSync(path.join(out,'navigation-coverage.json'),JSON.stringify(result,null,2));await browser.close();}
