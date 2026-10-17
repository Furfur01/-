import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import * as THREE from 'three';
import {playwright} from './three-battle-harness.mjs';

// Review the production fleet renderer at a fixed close camera, without changing a save.
const root=path.resolve('.'),out=path.join(root,'output/playwright/warp');await fs.mkdir(out,{recursive:true});
const html=`<!doctype html><html><link rel="icon" href="data:,"><style>body{margin:0;background:radial-gradient(ellipse at 50% 50%,#091827,#02050b);overflow:hidden}canvas{display:block;width:100vw;height:100vh}</style><canvas></canvas><script type="module">
import {createMapFleetRenderer,missionVisual} from './map-fleet.bundle.js';
window.fleet=await createMapFleetRenderer(document.querySelector('canvas'));window.missionVisual=missionVisual;
</script></html>`;
const server=http.createServer(async(req,res)=>{
  if(req.url.endsWith('/warp-review.html')){res.setHeader('Content-Type','text/html');res.end(html);return;}
  const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{const data=await fs.readFile(file);res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.json')?'application/json':'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}
});server.listen(0,'127.0.0.1');await once(server,'listening');let browser;
try{
  browser=await playwright().chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(`http://127.0.0.1:${server.address().port}/opendesign/mockups/planet-construction-review/warp-review.html`);
  await page.waitForFunction(()=>window.fleet);
  const camera=new THREE.PerspectiveCamera(48,1440/900,.1,5000);camera.position.set(130,70,-60);camera.lookAt(0,0,-210);camera.updateMatrixWorld();
  const vp=new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).toArray(),forward=camera.getWorldDirection(new THREE.Vector3()).toArray();
  const frame={vp,eye:camera.position.toArray(),center:[0,0,0],forward,up:[0,1,0],fov:48*Math.PI/180,width:1440,height:900,dpr:1,dt:1/60,time:3,occluders:[]};
  const results=[];
  for(const [name,elapsed,phase,docking]of [['entry',5200,'outbound',false],['flash',5580,'outbound',false],['exit',15000,'outbound',false],['return',15000,'return',true]]){
    const result=await page.evaluate(({frame,elapsed,phase,docking})=>{
      const mission={phase,start:0,end:20000,ships:{Cruiser:3}},pose={...missionVisual(mission,elapsed),launch:!docking,departureDirection:[0,0,-1],dockNormal:[0,0,-1],docking};
      fleet.begin(frame);const stats=fleet.travel(mission,pose,[0,0,0],1,[0,0,-1]);fleet.end();
      const g=document.querySelector('canvas').getContext('webgl2'),pixels=new Uint8Array(frame.width*frame.height*4);g.readPixels(0,0,frame.width,frame.height,g.RGBA,g.UNSIGNED_BYTE,pixels);
      let bluePixels=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i+2]>70&&pixels[i+2]>pixels[i]*1.2)bluePixels++;
      return {...stats,bluePixels,error:g.getError()};
    },{frame,elapsed,phase,docking});
    assert(result.warpVertices>3000);assert(result.bluePixels>300,'Warp must paint visible blue energy');assert.equal(result.error,0);
    await page.screenshot({path:path.join(out,name+'.png')});results.push({name,...result});
  }
  await page.setViewportSize({width:390,height:844});camera.aspect=390/844;camera.position.multiplyScalar(1.6);camera.updateProjectionMatrix();camera.updateMatrixWorld();
  const mobile=await page.evaluate(frame=>{const m={phase:'outbound',start:0,end:20000,ships:{Cruiser:3}},p={...missionVisual(m,5200),launch:true,departureDirection:[0,0,-1]};fleet.begin(frame);const s=fleet.travel(m,p,[0,0,0],1,[0,0,-1]);fleet.end();return s;},{...frame,width:390,height:844,eye:camera.position.toArray(),vp:new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).toArray()});
  assert(mobile.warpVertices>3000);await page.screenshot({path:path.join(out,'mobile.png')});
  assert.deepEqual(errors,[]);await fs.writeFile(path.join(out,'results.json'),JSON.stringify({results,mobile,errors},null,2));
  console.log('Close-camera entry, flash, exit, return and mobile warp render verified.');
}finally{await browser?.close();server.close();await once(server,'close');}
