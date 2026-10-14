import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source=fs.readFileSync('opendesign/mockups/planet-construction-review/aurora-lod.js','utf8');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:8289');await page.waitForFunction(()=>window.CommandApp?.scene?.snapshot?.navigation?.enabled);
 const result=await page.evaluate(source=>{
  const canvas=CommandApp.scene.frame.contentWindow.document.querySelector('#world'),gl=canvas.getContext('webgl');
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  const lod=new Function('gl','canvas','shader',source+';return createWorldLOD();')(gl,canvas,shader),values=[];
  for(const high of [[0,0,1,1],[0,0,0,0]]){
   lod.beginLow();gl.clearColor(1,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
   lod.begin();gl.clearColor(...high);gl.clear(gl.COLOR_BUFFER_BIT);
   gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
   lod.end(.5);const pixel=new Uint8Array(4);gl.readPixels(canvas.width/2|0,canvas.height/2|0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);values.push([...pixel]);
  }
  lod.dispose();return {mixed:values[0],fadingSilhouette:values[1],error:gl.getError()};
 },source);
 assert(Math.abs(result.mixed[0]-128)<=2&&Math.abs(result.mixed[2]-128)<=2);
 assert(Math.abs(result.fadingSilhouette[0]-128)<=2&&result.fadingSilhouette[2]===0);assert.equal(result.error,0);
 fs.writeFileSync('output/playwright/navigation-motion/composite-pixels.json',JSON.stringify(result,null,2));console.log(result);
}finally{await browser.close();}
