import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {createWorld,createPlayer} from '../game/engine.mjs';

const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(import.meta.dirname,'..'),output=path.join(root,'output/playwright/ship-preview-depth');
fs.mkdirSync(output,{recursive:true});
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'ship-preview-depth-'));
const report={errors:[],fixture:[],atlas:[],shipyard:[]};
let server,browser,serverLog='';
const bundle=async(entry,baseline=false)=>(await build({entryPoints:[path.join(root,entry)],bundle:true,write:false,format:'iife',platform:'browser',define:{'process.env.NODE_ENV':'"production"'},plugins:baseline?[{name:'before-depth-fix',setup(b){
  b.onLoad({filter:/ship-preview-materials\.js$/},()=>({contents:'export const prepareShipPreviewMaterials=root=>root;',loader:'js'}));
  b.onLoad({filter:/Stage\.jsx$/},({path:file})=>({contents:fs.readFileSync(file,'utf8').replace('state.camera.near=grounded?.1:.5;','state.camera.near=.1;'),loader:'jsx'}));
}}]:[]})).outputFiles[0].text;

// Only subpixel camera motion: count large color changes, not ordinary edge motion.
function sampleFlicker({atlas=false,diagnostic=false}={}){
  const entry=atlas?{renderer:ShipAtlas.renderer,scene:ShipAtlas.scene,camera:ShipAtlas.camera}:window.previewRenderers.find(e=>e.renderer.domElement.closest('.stage-canvas'));
  const {renderer,scene,camera}=entry,gl=renderer.getContext(),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight;
  const capture=()=>{renderer.render(scene,camera);const data=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,data);return data;};
  const original=camera.position.clone(),frames=[];
  for(const delta of [0,.000001,-.000001]){camera.position.copy(original);camera.position.x+=delta;camera.updateMatrixWorld();frames.push(capture());}
  camera.position.copy(original);camera.updateMatrixWorld();renderer.render(scene,camera);
  let changed=0;const mask=diagnostic?new Uint8ClampedArray(frames[0]):null;
  for(let i=0;i<frames[0].length;i+=4){if(Math.max(...[1,2].map(n=>Math.abs(frames[n][i]-frames[0][i])+Math.abs(frames[n][i+1]-frames[0][i+1])+Math.abs(frames[n][i+2]-frames[0][i+2])))>60){changed++;if(mask)mask.set([255,0,0,255],i);}}
  let prepared=0,opaque=0;
  scene.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.isMeshStandardMaterial&&!m.transparent&&m.depthWrite){opaque++;if(m.customProgramCacheKey().includes('ship-preview-depth-v1'))prepared++;}});
  let image;
  if(mask){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d'),data=ctx.createImageData(w,h);for(let y=0;y<h;y++)data.data.set(mask.subarray(y*w*4,(y+1)*w*4),(h-y-1)*w*4);ctx.putImageData(data,0,0);image=canvas.toDataURL();}
  return {changed,prepared,opaque,pixels:w*h,...(image?{image}:{})};
}

try{
  const world=createWorld(),player=createPlayer(world,'舰船闪烁隔离测试',world.at,()=>.431);
  const saveFile=path.join(directory,'universe.json'),sessionFile=path.join(directory,'session.json');
  fs.writeFileSync(saveFile,JSON.stringify(world));fs.writeFileSync(sessionFile,JSON.stringify({cookie:`empire=${player.id}`}));
  const probe=net.createServer();probe.listen(0,'127.0.0.1');await once(probe,'listening');const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
  assert(![8289,8390].includes(port));report.port=port;
  server=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:saveFile,EMPIRE_SESSION_FILE:sessionFile,GODOT_BIN:'missing-preview-test'},windowsHide:true,stdio:['ignore','pipe','pipe']});
  server.stdout.on('data',data=>serverLog+=data);server.stderr.on('data',data=>serverLog+=data);
  await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw Error(serverLog);}),new Promise((_,reject)=>{const t=setTimeout(()=>reject(Error('Server startup timeout')),15000);t.unref();})]);
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
  const page=await browser.newPage({viewport:{width:1440,height:900}}),origin=`http://127.0.0.1:${port}`;
  page.setDefaultTimeout(20000);page.on('pageerror',e=>report.errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  await page.addInitScript(()=>{
    window.previewRenderers=[];window.__THREE_DEVTOOLS__=new EventTarget();
    window.__THREE_DEVTOOLS__.addEventListener('observe',e=>{if(!e.detail.isWebGLRenderer)return;const renderer=e.detail,render=renderer.render,entry={renderer};window.previewRenderers.push(entry);renderer.render=function(scene,camera){entry.scene=scene;entry.camera=camera;return render.call(this,scene,camera);};});
  });
  const fixture=await bundle('tests/ship-preview-depth-fixture.js');
  await page.route('**/__depth_fixture',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Isolated ship depth test</title><script src="/__depth_fixture.js"></script>'}));
  await page.route('**/__depth_fixture.js',route=>route.fulfill({contentType:'text/javascript',body:fixture}));
  await page.goto(origin+'/__depth_fixture');
  report.fixture=await page.evaluate(()=>verifyPreviewDepth());
  assert(report.fixture.every(r=>r.passed),JSON.stringify(report.fixture));
  console.log('PASS GPU: coplanar layers, vertex colors, draw order, perspective/orthographic, real occlusion');

  const baselineAtlas=await bundle('opendesign/mockups/galactic-command/ships-viewer.js',true);
  const baselineStage=await bundle('client/command-p0/entry.jsx',true);
  let baseline=true;
  await page.route('**/ships.bundle.js*',route=>baseline?route.fulfill({contentType:'text/javascript',body:baselineAtlas}):route.continue());
  await page.route('**/operations.bundle.js*',route=>baseline?route.fulfill({contentType:'text/javascript',body:baselineStage}):route.continue());
  for(const before of [true,false]){
    baseline=before;
    await page.goto(origin+'/opendesign/mockups/galactic-command/ships.html');
    await page.waitForFunction(()=>window.ShipAtlas?.current);
    const ids=await page.evaluate(()=>ShipAtlas.ships.map(s=>s.id));
    for(const id of ids){
      assert(await page.evaluate(id=>ShipAtlas.select(id),id));
      const result=await page.evaluate(sampleFlicker,{atlas:true});report.atlas.push({before,id,...result});
      if(!before)assert.equal(result.prepared,result.opaque,id+' atlas material coverage');
      if(['Dreadnought','Battleship','Cruiser'].includes(id))await page.screenshot({path:path.join(output,`atlas-${id}-${before?'before':'after'}.png`)});
    }
    console.log(`PASS ${before?'baseline':'fixed'} atlas: ${ids.length} ships`);
    await page.goto(origin+'/');
    await page.waitForFunction(()=>window.EmpireAPI?.state?.player.name==='舰船闪烁隔离测试');
    await page.getByRole('navigation',{name:'主导航'}).getByRole('button',{name:'建设',exact:true}).click();
    await page.getByRole('navigation',{name:'主导航'}).getByRole('button',{name:'造舰',exact:true}).click();
    const operation=page.locator('.p0-operation-root');
    for(const category of ['战斗舰船','民用舰船']){
      await operation.getByRole('button',{name:category,exact:true}).click();
      const cards=operation.locator('.fleet-card'),count=await cards.count();
      for(let i=0;i<count;i++){
        await cards.nth(i).click();await operation.locator('.stage-loading').waitFor({state:'hidden'});
        assert.equal(await operation.locator('.stage-fallback').count(),0);
        const name=await operation.locator('.ship-heading h1').innerText();
        const result=await page.evaluate(sampleFlicker,{diagnostic:['行星轰炸机','殖民舰'].includes(name)});
        if(result.image){fs.writeFileSync(path.join(output,`depth-changes-${name}-${before?'before':'after'}.png`),Buffer.from(result.image.split(',')[1],'base64'));delete result.image;}
        report.shipyard.push({before,name,...result});
        if(!before)assert.equal(result.prepared,result.opaque,name+' GLTF material coverage');
        if(['无畏舰','战列舰','巡洋舰'].includes(name))await page.screenshot({path:path.join(output,`shipyard-${name}-${before?'before':'after'}.png`)});
      }
    }
    if(!before){
      await operation.getByRole('button',{name:'自动旋转',exact:true}).click();await page.waitForTimeout(400);await operation.getByRole('button',{name:'自动旋转',exact:true}).click();
      const canvas=operation.locator('.stage-canvas canvas');await canvas.hover();await page.mouse.wheel(0,-500);await page.waitForTimeout(300);
      const bounds=await canvas.boundingBox();await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width*.75,bounds.y+bounds.height*.65,{steps:12});await page.mouse.up();
      await operation.getByRole('button',{name:'复位舰船视角',exact:true}).click();
      await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(output,'shipyard-mobile.png')});
      assert.equal(await operation.locator('.stage-canvas canvas').count(),1);
    }
    console.log(`PASS ${before?'baseline':'fixed'} shipyard: combat and civilian fleet, GLTF loading`);
  }
  for(const key of ['atlas','shipyard']){
    const before=report[key].filter(r=>r.before).reduce((n,r)=>n+r.changed,0),after=report[key].filter(r=>!r.before).reduce((n,r)=>n+r.changed,0);
    report[key+'Comparison']={before,after,reduction:before?1-after/before:0};
    assert(after<before*.5,`${key}: subpixel flicker did not improve enough (${before} -> ${after})`);
  }
  assert.deepEqual(report.errors,[]);report.passed=true;
}catch(error){report.failure=error.stack;process.exitCode=1;console.error(error.stack);}
finally{
  try{await browser?.close();}finally{
    try{if(server&&server.exitCode===null){const exited=once(server,'exit');server.kill();await exited;}}
    finally{const absolute=path.resolve(directory),tmp=path.resolve(os.tmpdir());assert(absolute.startsWith(tmp+path.sep)&&path.basename(absolute).startsWith('ship-preview-depth-'));fs.rmSync(absolute,{recursive:true,force:true});report.cleanedUp=!fs.existsSync(absolute);}
  }
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({passed:report.passed,atlas:report.atlasComparison,shipyard:report.shipyardComparison,cleanedUp:report.cleanedUp,output}));
}
