// Reproduce the fixed-age antimatter check used to distinguish renderer parity
// from independently sampled real-time recordings. Never modifies game sources.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {root,playwright,startServer,mountReplay} from '../tests/three-battle-harness.mjs';

const ages=[.08,.16,.9,1.1,4.9];
const help=`Compare legacy/Three.js antimatter rendering at identical explicit ages.

node scripts/verify-three-special-fixed-age.mjs [--out DIR] [--fixture PATH] [--python PATH]

Uses the saved 10-ship special fixture, a sequential Chrome/D3D11 capture, and
Python with Pillow/NumPy for pixel comparison. No simulation or recording runs.
Default output is a fresh qa/special-fixed-age-rerun-<timestamp> directory.
The existing qa/special-fixed-age evidence is never overwritten.
`;

export function parseOptions(argv){
  const options={out:path.join(root,'output/playwright/three-battle-video/qa','special-fixed-age-rerun-'+Date.now()),
    fixture:path.join(root,'output/playwright/three-battle-video/fixture-special.json'),python:process.env.PYTHON_BIN||'python',help:false};
  for(let i=0;i<argv.length;i++){
    const flag=argv[i];if(flag==='--help'){options.help=true;continue;}
    if(!['--out','--fixture','--python'].includes(flag))throw Error('Unknown option: '+flag);
    const value=argv[++i];if(!value||value.startsWith('--'))throw Error('Missing value for '+flag);
    options[flag.slice(2)]=flag==='--python'?value:path.resolve(value);
  }
  return options;
}

const pixelScript=String.raw`
import json,sys
from pathlib import Path
import numpy as np
from PIL import Image
p=Path(sys.argv[1])
r=json.loads((p/'results.json').read_text(encoding='utf-8'))
checks=[]
for age in [.08,.16,.9,1.1,4.9]:
    k=f'{age:.2f}'.replace('.','p')
    a=np.array(Image.open(p/f'legacy-age-{k}.png').convert('RGBA')).astype(np.int16)
    b=np.array(Image.open(p/f'three-age-{k}.png').convert('RGBA')).astype(np.int16)
    d=np.abs(a-b)
    ca=next(x for x in r['frames'] if x['engine']=='legacy' and x['age']==age)
    cb=next(x for x in r['frames'] if x['engine']=='three' and x['age']==age)
    checks.append({'age':age,'rgbMAE255':float(d[:,:,:3].mean()),'rgbMax255':int(d[:,:,:3].max()),
      'rgbPixelsOver2Pct':float(np.any(d[:,:,:3]>2,axis=2).mean()*100),'alphaMAE255':float(d[:,:,3].mean()),
      'drawCommandsEqual':ca['calls']==cb['calls'],'cameraEqual':ca['eye']==cb['eye']})
result={'comparison':'identical explicit age, camera, effect inputs and shader time; isolated special effect over shared environment',
  'checks':checks,'limitation':'Does not prove independently recorded videos contain the same render frame. No fleet or other transient effects included.'}
(p/'pixel-comparison.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False))
`;

function comparePixels(python,directory){
  return new Promise((resolve,reject)=>{
    const child=spawn(python,['-c',pixelScript,directory],{windowsHide:true,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';
    child.stdout.on('data',bytes=>stdout+=bytes);child.stderr.on('data',bytes=>stderr+=bytes);
    child.on('error',reject);child.on('close',code=>code===0?resolve(JSON.parse(stdout)):reject(Error('Pixel comparison requires Python, Pillow and NumPy: '+stderr)));
  });
}

export async function verify(options){
  const output=path.resolve(options.out),resultsFile=path.join(output,'results.json');
  if(fs.existsSync(resultsFile))throw Error('Output already contains results; choose a fresh --out directory');
  const replay=JSON.parse(fs.readFileSync(options.fixture,'utf8'));
  const blast=replay.record.events.find(event=>event.type==='antimatter'&&!event.harmless&&event.source===0);
  assert.ok(blast,'the fixture must contain the actual source-0 antimatter event');
  assert.equal(blast.tick,99);assert.equal(blast.radius,680);
  const effect={source:blast.source,tick:blast.tick,pos:[blast.x,blast.y,blast.z],radius:blast.radius};
  const result={kind:'paused-fixed-age-special-render-check',capture:'synchronous canvas.toDataURL after renderer draw/endFrame; no compositor recording',
    fixture:path.resolve(options.fixture),effect,
    conditions:{width:1920,height:1080,dpr:1,seed:42,center:[0,0,0],distance:1700,yaw:.65,pitch:.25},frames:[],errors:[]};
  fs.mkdirSync(output,{recursive:true});let server,browser;
  try{
    server=await startServer({directory:path.join(output,'server')});
    browser=await playwright().chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true,args:['--use-angle=d3d11']});
    for(const engine of ['legacy','three']){
      const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
      try{
        const page=await context.newPage();page.on('pageerror',error=>result.errors.push({engine,error:String(error)}));
        page.on('console',message=>{if(message.type()==='error')result.errors.push({engine,error:message.text()});});
        await mountReplay(page,server,{replay},engine);
        await page.waitForFunction(()=>{const r=GalacticDemo.renderer;return r.sky?.ready===true||window.SpaceSky?.inspect(r.gl)?.ready===true;});
        await page.evaluate(()=>{
          window.commandSceneActive=true;const c=flightController,d=GalacticDemo;c.paused=true;c.overview=true;c.cinemaComposition=false;
          c.center=[0,0,0];c.distance=1700;c.overviewYaw=.65;c.overviewPitch=.25;
          // Isolate this renderer effect in the loaded page only. The saved
          // source, fixture, authoritative battle and legacy baseline stay intact.
          c.drawFleet=()=>{};c.presentation.draw=()=>{};
          for(const key of ['beams','particles','projectiles','weaponImpacts','shieldHits'])d.state.flight[key]=[];
          d.state.flight.charging=false;d.state.flight.reaperCut=null;
        });
        for(const age of ages){
          const frame=await page.evaluate(({age,effect})=>{
            const d=GalacticDemo,r=d.renderer,p=d.state.flight,time=effect.tick*.05+age;
            __benchSeed(42);p.elapsed=time;p.specialBlasts=[{...effect,age}];
            const calls=[],draw=r.drawMesh;
            r.drawMesh=function(mesh,model,opts){
              if([9,10].includes(opts?.mode))calls.push({mode:opts.mode,
                scale:[Math.hypot(...model.slice(0,3)),Math.hypot(...model.slice(4,7)),Math.hypot(...model.slice(8,11))],opacity:opts.opacity});
              return draw.apply(this,arguments);
            };
            try{r.flight(d.state,time);r.endFrame?.();}finally{r.drawMesh=draw;}
            const png=r.canvas.toDataURL('image/png'),debug=r.gl.getExtension('WEBGL_debug_renderer_info');
            return {age,time,png,calls,eye:r.eye,glError:r.gl.getError(),gpu:debug?r.gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):null,shaderErrors:r.shaderErrors??[]};
          },{age,effect});
          const file=path.join(output,engine+'-age-'+age.toFixed(2).replace('.','p')+'.png');
          fs.writeFileSync(file,Buffer.from(frame.png.split(',')[1],'base64'));delete frame.png;
          result.frames.push({engine,file,...frame});
        }
      }finally{await context.close();}
    }
  }catch(error){result.errors.push({error:error.stack??String(error)});throw error;}
  finally{await browser?.close();await server?.stop();fs.writeFileSync(resultsFile,JSON.stringify(result,null,2));}
  assert.equal(result.frames.length,10);assert.equal(result.errors.length,0);
  assert.ok(result.frames.every(frame=>frame.glError===0&&frame.shaderErrors.length===0));
  const pixels=await comparePixels(options.python,output);
  assert.ok(pixels.checks.every(check=>check.drawCommandsEqual&&check.cameraEqual),'fixed input draw commands and cameras must agree');
  console.log(JSON.stringify({directory:output,frames:result.frames.length,errors:result.errors,checks:pixels.checks},null,2));
  return {result,pixels};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{const options=parseOptions(process.argv.slice(2));if(options.help)console.log(help);else await verify(options);}
  catch(error){console.error(error.stack??String(error));process.exitCode=1;}
}
