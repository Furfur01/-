const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');

(async()=>{
  const out=path.resolve('output/playwright/death-star');fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try{
    const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error'&&!m.location().url.endsWith('/favicon.ico'))errors.push(m.text()+' '+m.location().url);});
    await page.goto('http://127.0.0.1:8289/opendesign/mockups/galactic-command/ships.html?ship=Death_Star');
    await page.waitForFunction(()=>window.ShipAtlas?.selected==='Death_Star');
    const initial=await page.evaluate(()=>{
      const a=ShipAtlas,m=a.current;let count=0; m.traverse(o=>{if(o.isInstancedMesh)count+=o.count;});
      return {revision:m.userData.revision,instances:count,textures:a.renderer.info.memory.textures,
        hullTexture:m.getObjectByName('Death_Star_open_armor').material.map.image.width,
        triangles:a.renderer.info.render.triangles};
    });
    assert.equal(initial.revision,'death-star-user-01');assert.equal(initial.hullTexture,4096);assert.ok(initial.instances>25000);
    await page.screenshot({path:path.join(out,'death-star.png')});
    await page.locator('[data-view="front"]').click();
    await page.screenshot({path:path.join(out,'death-star-front.png')});
    await page.locator('#wireframe').click();assert.equal(await page.locator('#wireframe').getAttribute('aria-pressed'),'true');
    await page.locator('#wireframe').click();
    const encoded=await page.evaluate(async()=>{
      const bytes=await ShipAtlas.exportModel('Death_Star');
      return await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.onerror=reject;r.readAsDataURL(new Blob([bytes]));});
    });
    const glb=Buffer.from(encoded,'base64');assert.equal(glb.toString('ascii',0,4),'glTF');assert.equal(glb.readUInt32LE(8),glb.length);
    const json=JSON.parse(glb.toString('utf8',20,20+glb.readUInt32LE(12)));
    assert.ok(json.extensionsUsed.includes('EXT_mesh_gpu_instancing'));
    // glTF stores the hull color/emission and bowl color; bump maps are a
    // Three.js-only channel, while all geometric relief remains in the export.
    assert.ok(json.images.length>=3);assert.ok(json.nodes.some(n=>n.name==='Death_Star_parabolic_bowl'));
    const deliver=path.resolve('models/generated/death-star-user-01');fs.mkdirSync(deliver,{recursive:true});
    fs.writeFileSync(path.join(deliver,'Death_Star.glb'),glb);
    // Repeated switching exercises disposal of bump/emissive maps and instances.
    for(let i=0;i<3;i++){await page.evaluate(()=>ShipAtlas.select('Guardian'));await page.evaluate(()=>ShipAtlas.select('Death_Star'));}
    const after=await page.evaluate(()=>ShipAtlas.renderer.info.memory);
    assert.ok(after.textures<=initial.textures+1,JSON.stringify({initial,after}));
    assert.match(await page.locator('#model-note').innerText(),/你提供的/);
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:path.join(out,'death-star-mobile.png'),fullPage:true});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert.deepEqual(errors,[]);
    const report={initial,after,exportBytes:glb.length,images:json.images.length,meshes:json.meshes.length,errors};
    fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
