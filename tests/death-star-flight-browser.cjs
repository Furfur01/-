const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/playwright/death-star-terrain');fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'application/javascript','.mjs':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.css':'text/css'};
(async()=>{
 const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end();}else{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data);}});});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[],warnings=[];
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(...args){const gl=original.apply(this,args);if(!gl||!String(args[0]).startsWith('webgl')||gl.__tracked)return gl;gl.__tracked=true;gl.__resources={Buffer:new Set(),Program:new Set(),Texture:new Set()};for(const kind of Object.keys(gl.__resources)){const create=gl['create'+kind].bind(gl),remove=gl['delete'+kind].bind(gl);gl['create'+kind]=(...args)=>{const value=create(...args);gl.__resources[kind].add(value);return value;};gl['delete'+kind]=value=>{gl.__resources[kind].delete(value);return remove(value);};}return gl;};});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning'&&warnings.length<12)warnings.push(m.text());});
 try{
  await page.goto(base+'/opendesign/mockups/galactic-command/hangar.html?map=death-star');
  await page.waitForFunction(()=>window.GalacticDemo?.renderer?.deathTerrain,{timeout:30000});await page.waitForTimeout(1500);
  const initial=await page.evaluate(()=>({ship:GalacticDemo.ships[GalacticDemo.state.shipIndex].id,pos:GalacticDemo.state.flight.pos,stats:GalacticDemo.renderer.deathTerrain.stats,glError:GalacticDemo.renderer.gl.getError()}));
  assert.equal(initial.ship,'Light_Fighter');assert.equal(initial.glError,0);assert.equal(await page.locator('#death-controls').isVisible(),true);
  const views={};for(const name of ['trench','overview','surface','dish']){await page.locator(`[data-death="${name}"]`).click();await page.waitForTimeout(1200);await page.screenshot({path:path.join(out,name+'.png')});views[name]=await page.evaluate(()=>({pos:GalacticDemo.state.flight.pos,failed:GalacticDemo.state.flight.deathFailed,stats:GalacticDemo.renderer.deathTerrain.stats,glError:GalacticDemo.renderer.gl.getError()}));assert.equal(views[name].glError,0);assert.equal(views[name].failed,false);}
  const combat=await page.evaluate(()=>{
   const g=GalacticDemo;g.deathLocate('trench',true);const p=g.state.flight,t=p.targets[0];for(const turret of p.targets)turret.cooldown=Infinity;
   p.pos=t.pos.map((v,i)=>v+[0,20,20][i]);const aim=t.pos.map((v,i)=>v-p.pos[i]),len=Math.hypot(...aim);p.yaw=p.yawTarget=Math.atan2(aim[0],-aim[2]);p.pitch=p.pitchTarget=Math.asin(aim[1]/len);
   p.gunCooldown=0;g.fireMain();const afterShot=t.hp;for(let i=0;i<22;i++){p.gunCooldown=0;g.fireMain();}return {afterShot,afterKill:t.hp,kills:p.kills};
  });assert.equal(combat.afterShot,95);assert.equal(combat.afterKill,0);assert.equal(combat.kills,1);
  await page.waitForTimeout(10100);assert.equal(await page.evaluate(()=>GalacticDemo.state.flight.targets[0].hp),0);
  const blocked=await page.evaluate(()=>{const g=GalacticDemo;g.deathLocate('trench',true);const p=g.state.flight,t=p.targets[0];p.pos=[t.pos[0],10050,t.pos[2]-200];const d=t.pos.map((v,i)=>v-p.pos[i]);p.yaw=p.yawTarget=Math.atan2(d[0],-d[2]);p.pitch=p.pitchTarget=Math.asin(d[1]/Math.hypot(...d));p.gunCooldown=0;g.fireMain();const result={hp:t.hp,end:p.beams.at(-1)?.end};g.deathLocate('trench',true);return result;});assert.equal(blocked.hp,100);
  await page.evaluate(()=>{const g=GalacticDemo,p=g.state.flight;g.deathLocate('trench',true);p.pos=[0,9950,59];p.velocity=[0,0,2000];});await page.waitForFunction(()=>GalacticDemo.state.flight.deathFailed);assert.match(await page.locator('#death-status').innerText(),/失败/);
  await page.locator('[data-death="reset"]').click();assert.equal(await page.evaluate(()=>GalacticDemo.state.flight.deathFailed),false);
  const resources=[];for(let i=0;i<10;i++){
   await page.selectOption('#scene-select','planet');await page.waitForTimeout(60);resources.push(await page.evaluate(()=>Object.fromEntries(Object.entries(GalacticDemo.renderer.gl.__resources).map(([k,v])=>[k,v.size]))));assert.equal(await page.evaluate(()=>GalacticDemo.renderer.deathTerrain),null);
   await page.selectOption('#scene-select','death-star');await page.waitForTimeout(180);
  }for(const row of resources)assert.deepEqual(row,resources[0]);
  await page.selectOption('#scene-select','planet');await page.evaluate(()=>{GalacticDemo.state.flight.shield=62;});await page.selectOption('#scene-select','nebula');assert.ok(await page.evaluate(()=>GalacticDemo.state.flight.shield<63));
  await page.selectOption('#scene-select','death-star');
  const hardware=await page.evaluate(()=>{const gl=GalacticDemo.renderer.gl,e=gl.getExtension('WEBGL_debug_renderer_info');return {vendor:e?gl.getParameter(e.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR),renderer:e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),userAgent:navigator.userAgent};});
  const performanceResults={};if(process.argv.includes('--performance'))for(const name of ['overview','surface','trench']){
   await page.locator('[data-death="reset"]').click();await page.locator(`[data-death="${name}"]`).click();await page.waitForTimeout(2000);
   performanceResults[name]=await page.evaluate(async(name)=>{
    const g=GalacticDemo,p=g.state.flight,frames=[],stats=[],start=performance.now();let last=start;
    if(name!=='overview')p.throttle=100;
    await new Promise(resolve=>{const frame=now=>{frames.push(now-last);last=now;if(name!=='overview'){p.pitchTarget=-Math.atan2(p.pos[0],p.pos[1]);p.yawTarget=Math.PI/2;if(name==='trench')g.fireMain();}if(frames.length%60===0)stats.push(g.renderer.deathTerrain.stats);if(now-start>=30000)resolve();else requestAnimationFrame(frame);};requestAnimationFrame(frame);});
    const elapsed=performance.now()-start,sorted=frames.slice(1).sort((a,b)=>a-b);p.throttle=0;return {seconds:elapsed/1000,fps:frames.length*1000/elapsed,p95:sorted[Math.floor(sorted.length*.95)],max:sorted.at(-1),failed:p.deathFailed,shield:p.shield,hull:p.hull,pos:p.pos,stats};
   },name);console.log('PERFORMANCE '+name+' '+JSON.stringify({...performanceResults[name],stats:performanceResults[name].stats.at(-1)}));
  }
  await page.setViewportSize({width:390,height:844});await page.locator('[data-death="reset"]').click();await page.waitForTimeout(500);await page.screenshot({path:path.join(out,'mobile.png')});assert.ok(await page.locator('#death-controls').isVisible());
  assert.deepEqual(warnings,[]);
  await page.goto(base+'/opendesign/mockups/galactic-command/ships.html?ship=Death_Star');await page.waitForFunction(()=>window.ShipAtlas?.selected==='Death_Star');assert.equal(await page.evaluate(()=>ShipAtlas.current.userData.revision),'death-star-user-01');
  const fallbackPage=await browser.newPage({viewport:{width:1280,height:720}});fallbackPage.on('pageerror',e=>errors.push(e.message));await fallbackPage.addInitScript(()=>{const original=WebGLRenderingContext.prototype.getExtension;WebGLRenderingContext.prototype.getExtension=function(name){return name==='ANGLE_instanced_arrays'?null:original.call(this,name);};});await fallbackPage.goto(base+'/opendesign/mockups/galactic-command/hangar.html?map=death-star');await fallbackPage.waitForFunction(()=>window.GalacticDemo?.renderer?.deathTerrain?.stats);const fallback=await fallbackPage.evaluate(()=>({instancing:!!GalacticDemo.renderer.deathTerrain.ext,error:GalacticDemo.renderer.gl.getError(),stats:GalacticDemo.renderer.deathTerrain.stats}));assert.equal(fallback.instancing,false);assert.equal(fallback.error,0);await fallbackPage.close();
  const report={initial,views,combat,blocked,resources,hardware,performanceResults,fallback,errors,existingAtlasWarnings:warnings};fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2));assert.deepEqual(errors,[]);console.log('PASS: views, weapons, obstruction, crash, 10 disposal cycles, ordinary scene state, mobile, instancing fallback and existing atlas. Report: '+path.join(out,'verification.json'));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
