import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createWorld,createPlayer} from '../game/engine.mjs';
import {startTrial,trialPresets,trialTechnology} from '../game/battle-trial.mjs';
import {units} from '../game/catalog.mjs';
import {packedShips,spatialMetadata,stepSpatialBattle,recordFrame,addSpatialFleet} from '../game/spatial-battle.mjs';

export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const output=path.join(root,'output/playwright/three-battle-comparison');
export const routes={legacy:'/opendesign/mockups/galactic-command/legacy-webgl/battlefield.html',three:'/opendesign/mockups/galactic-command/battlefield-three.html'};
export const fixtureOwner='00000000-0000-4000-8000-000000000042';
export const views=['cinema','overview','follow','bridge'];
export const hash=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
export function percentile(sorted,p){return sorted[Math.min(sorted.length-1,Math.max(0,Math.ceil(sorted.length*p)-1))]??null;}
export function median(values){const a=values.filter(Number.isFinite).sort((a,b)=>a-b);return a.length?a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2:null;}
export function frameMetrics(samples){
  const durations=samples.map(s=>s.ms??s).filter(x=>Number.isFinite(x)&&x>0),sorted=[...durations].sort((a,b)=>a-b);
  let bucket=0,count=0,min=null;for(const ms of durations){bucket+=ms;count++;if(bucket>=1000){min=Math.min(min??Infinity,count*1000/bucket);bucket=0;count=0;}}
  return {frames:durations.length,elapsedMs:durations.reduce((a,b)=>a+b,0),averageFPS:durations.length*1000/durations.reduce((a,b)=>a+b,0),minOneSecondFPS:min,p50Ms:percentile(sorted,.5),p95Ms:percentile(sorted,.95),p99Ms:percentile(sorted,.99)};
}
export function summarizeComparison(results,{full=true}={}){
  return views.map(view=>{
    const select=engine=>results.filter(r=>r.view===view&&r.engine===engine&&!r.adaptive&&!r.error);
    const a=select('legacy'),b=select('three');
    const stats=rows=>({rounds:rows.length,averageFPS:median(rows.map(r=>r.metrics.averageFPS)),p95Ms:median(rows.map(r=>r.metrics.p95Ms)),minOneSecondFPS:median(rows.map(r=>r.metrics.minOneSecondFPS))});
    const legacy=stats(a),three=stats(b),fpsRatio=legacy.averageFPS?three.averageFPS/legacy.averageFPS:null,p95Ratio=legacy.p95Ms?three.p95Ms/legacy.p95Ms:null;
    const integrity=[...a,...b].every(r=>r.errors.length===0&&r.end.glError===0&&r.end.quality===1&&r.end.render.instances===r.end.render.alive);
    const complete=full&&a.length===3&&b.length===3;
    return {view,legacy,three,fpsRatio,p95Ratio,integrity,status:!complete?'incomplete':integrity&&fpsRatio>=.95&&p95Ratio<=1.1&&three.minOneSecondFPS>=30?'pass':'fail'};
  });
}

// The simulation runs once offline. Both renderers receive these exact bytes; no
// live server simulation, network timing, or per-renderer resimulation is measured.
export function createFixture({stress=false,seconds=80,fleet=trialPresets[7].fleet}={}){
  const now=1767225600000,world=createWorld(now),player=createPlayer(world,'Three.js 对照样本',now);
  const battle=startTrial(world,player,{attacker:fleet,defender:fleet,seed:42},now);
  battle.id='00000000-0000-4000-8000-000000000100';battle.attacker=fixtureOwner;battle.defender='00000000-0000-4000-8000-000000000043';
  for(const s of battle.ships){s.owner=s.side==='attacker'?battle.attacker:battle.defender;if(stress){s.x*=.3;s.z*=.4;s.hp=s.maxHp*=8;s.shield=s.maxShield*=8;}}
  const frames=[{tick:0,ships:packedShips(battle)}],times=[];
  while(battle.tick<seconds*20&&battle.status==='active'){
    const before=performance.now();stepSpatialBattle(battle);times.push(performance.now()-before);
    if(battle.tick%4===0)frames.push({tick:battle.tick,ships:packedShips(battle)});
  }
  if(frames.at(-1).tick!==battle.tick)frames.push({tick:battle.tick,ships:packedShips(battle)});
  const events=battle.events.filter(e=>e.type!=='input'),firstFire=events.find(e=>['shot','beam','projectile','launch','fire'].includes(e.type))??events.find(e=>e.type!=='reinforcement');
  const combatStart=Math.min(Math.max(0,(firstFire?.tick??0)*.05-2),Math.max(0,battle.tick*.05-42));
  const record={metadata:spatialMetadata(battle),frames,events,boundary:battle.boundary};
  const replay={version:4,record,report:{id:battle.id,battleId:battle.id,type:'battle',engine:`spatial-v${battle.version}`,trial:true,duration:battle.tick*.05,seed:42,initial:battle.initial,technology:{attacker:trialTechnology,defender:trialTechnology}}};
  const sorted=times.sort((a,b)=>a-b);
  return {replay,manifest:{name:stress?'stress':'normal',preset:fleet===trialPresets[7].fleet?trialPresets[7].name:'regression',ships:battle.ships.length,seed:42,technology:trialTechnology,stress:stress?{xScale:.3,zScale:.4,durability:8}:null,duration:battle.tick*.05,combatStart,snapshotIntervalMs:200,events:events.length,eventTypes:Object.fromEntries([...new Set(events.map(e=>e.type))].map(t=>[t,events.filter(e=>e.type===t).length])),sha256:hash(replay),simulationMs:{mean:times.reduce((a,b)=>a+b,0)/times.length,p95:percentile(sorted,.95),p99:percentile(sorted,.99)}}};
}
export function persistFixture(fixture,directory=output){fs.mkdirSync(directory,{recursive:true});const file=path.join(directory,`fixture-${fixture.manifest.name}.json`);fs.writeFileSync(file,JSON.stringify(fixture.replay));fs.writeFileSync(path.join(directory,`fixture-${fixture.manifest.name}-manifest.json`),JSON.stringify(fixture.manifest,null,2));return file;}
export function playwright(){
  const require=createRequire(import.meta.url),candidates=[process.env.PLAYWRIGHT_MODULE,'playwright','C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'].filter(Boolean);
  for(const name of candidates){try{return require(name);}catch{}}
  throw Error('Playwright is unavailable. Install playwright or set PLAYWRIGHT_MODULE to its module directory.');
}
export async function freePort(){const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(resolve=>socket.close(resolve));return port;}
export async function startServer({directory=output,live=false,port=0,fleet=trialPresets[7].fleet,extraFleet=null}={}){
  fs.mkdirSync(directory,{recursive:true});const now=Date.now(),world=createWorld(now),player=createPlayer(world,'Three.js 隔离试玩',now);
  const battle=live?startTrial(world,player,{attacker:fleet,defender:fleet,seed:42},now):null;
  if(battle&&extraFleet)for(const side of ['attacker','defender'])addSpatialFleet(battle,{fleet:extraFleet,side,owner:side==='attacker'?player.id:battle.defender,technology:trialTechnology},units);
  if(battle)recordFrame(battle);
  const save=path.join(directory,'universe.json'),session=path.join(directory,'session.json');fs.writeFileSync(save,JSON.stringify(world));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${player.id}`}));
  port=port||await freePort();const base=`http://127.0.0.1:${port}`;
  const child=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:save,EMPIRE_SESSION_FILE:session,EMPIRE_BATTLE_TRIAL:'1'},windowsHide:true,stdio:['ignore','pipe','pipe']});
  let stderr='';child.stderr.on('data',b=>stderr+=b);child.stdout.resume();
  try{let ready=false;for(let attempt=0;attempt<100;attempt++){if(child.exitCode!==null)throw Error(`Isolated server exited: ${stderr}`);try{const r=await fetch(base+'/api/catalog');if(r.ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,100));}if(!ready)throw Error('Isolated server did not become ready.');}
  catch(error){child.kill();throw error;}
  const stop=async()=>{if(child.exitCode===null){const exit=once(child,'exit');child.kill();await exit;}};
  return {base,battle,player,child,save,stop,get stderr(){return stderr;}};
}

export function installBrowserProbe(){
  let random=42;
  window.__benchSeed=seed=>{random=seed>>>0;};
  Math.random=()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random/4294967296;};
  const original=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(...args){const gl=original.apply(this,args);if(!gl||!/^webgl|^experimental-webgl/.test(args[0])||gl.__benchCounts)return gl;
    const count=gl.__benchCounts={calls:0,triangles:0,lines:0,points:0};
    const add=(mode,n,instances=1)=>{count.calls++;if(mode===gl.TRIANGLES)count.triangles+=n*instances/3;else if(mode===gl.TRIANGLE_STRIP||mode===gl.TRIANGLE_FAN)count.triangles+=Math.max(0,n-2)*instances;else if(mode===gl.POINTS)count.points+=n*instances;else count.lines+=n*instances/(mode===gl.LINES?2:1);};
    for(const name of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced'])if(gl[name]){const fn=gl[name];gl[name]=function(...a){add(a[0],name.startsWith('drawArrays')?a[2]:a[1],name.endsWith('Instanced')?a.at(-1):1);return fn.apply(this,a);};}
    const extension=gl.getExtension;gl.getExtension=function(name){const ext=extension.call(this,name);if(name==='ANGLE_instanced_arrays'&&ext&&!ext.__benchWrapped){ext.__benchWrapped=true;for(const key of ['drawArraysInstancedANGLE','drawElementsInstancedANGLE']){const fn=ext[key];ext[key]=function(...a){add(a[0],key.startsWith('drawArrays')?a[2]:a[1],a.at(-1));return fn.apply(this,a);};}}return ext;};return gl;
  };
}

export async function mountReplay(page,server,fixture,engine){
  const requests=[];page.on('request',request=>{if(request.method()==='POST')requests.push(request.url());});
  await page.addInitScript(installBrowserProbe);
  await page.route('**/api/state*',route=>route.fulfill({json:{player:{id:fixtureOwner}}}));
  await page.route('**/api/replay/**',route=>route.fulfill({json:fixture.replay}));
  const started=performance.now();await page.goto(server.base+routes[engine]+'?replay='+fixture.replay.report.id);
  await page.waitForFunction(count=>window.GalacticDemo?.renderer&&window.flightController?.replay&&flightController.rows.length===count,fixture.replay.record.metadata.length,{timeout:60000});
  await page.evaluate(()=>{flightController.paused=true;});
  return {loadMs:performance.now()-started,requests};
}

export function sourceFingerprint(){
  const names=['scripts/three-flight','scripts/build-three-flight.mjs','tests/three-battle-harness.mjs','tests/three-battle-comparison.mjs','opendesign/mockups/galactic-command/three-flight.bundle.js','opendesign/mockups/galactic-command/battlefield-three.html','opendesign/mockups/galactic-command/hangar-three.html','opendesign/mockups/galactic-command/three-flight-assets','opendesign/mockups/galactic-command/legacy-webgl'];
  const files={};function visit(relative){const absolute=path.join(root,relative);if(!fs.existsSync(absolute))return;const info=fs.statSync(absolute);if(info.isDirectory()){for(const name of fs.readdirSync(absolute).sort())visit(relative+'/'+name);}else files[relative]=createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');}
  for(const name of names)visit(name);return {sha256:hash(files),files};
}

// This changes only the loaded benchmark page, never the frozen baseline files.
export function configureProbe({view,startTime,adaptive}){
  const c=window.flightController,d=window.GalacticDemo,r=d.renderer;
  const select=c.metadata.find(m=>m.owner===c.owner&&m.type==='Dreadnought'&&c.rows[m.id]?.[6]>0)??c.metadata.find(m=>m.owner===c.owner&&m.profile.piloted);
  c.select(select.id);c.paused=true;c.playTime=startTime;c.replayCursor=0;c.quality=1;c.elapsedFrames=[];c.cinematicAnchor=null;
  if(!adaptive)Object.defineProperty(c,'quality',{configurable:true,get:()=>1,set:()=>{}});
  const update=c.update.bind(c),effect=c.effect.bind(c),flight=r.flight.bind(r),originalBegin=r.begin.bind(r),endFrame=r.endFrame?.bind(r);
  const probe=window.__battleProbe={samples:[],running:false,frozen:true,startTime,simTime:startTime,sampleStart:Infinity,lastFrame:0,errors:[]};
  c.effect=function(e){window.__benchSeed(42+(e.seq??e.tick)*101);return effect(e);};
  function camera(){const p=d.state.flight,phase=(probe.simTime-startTime)*.015;
    c.cinematicAnchor=null;
    if(view==='overview'){c.frameBattle(true);c.overviewYaw=-.7+phase;c.overviewPitch=.55;}
    else if(view==='cinema'){const focus=c.cinemaFocus(select.id,c.row(select.id));c.overview=true;c.cinemaComposition=true;c.center=focus.center;c.distance=Math.max(520,select.profile.length*3.2);c.overviewYaw=focus.yaw+phase;c.overviewPitch=.18;}
    else{c.overview=false;p.external=view==='follow';p.cameraBlend=p.external?1:0;p.cameraVelocity=0;p.orbitYaw=0;p.orbitPitch=0;p.cameraZoom=1;}
  }
  c.update=function(dt){if(probe.frozen){c.paused=true;return;}const seconds=(performance.now()-probe.started)/1000;probe.simTime=startTime+seconds;c.paused=false;c.playTime=probe.simTime-dt;window.__benchSeed(42+Math.floor(probe.simTime*20));update(dt);d.state.flight.elapsed=probe.simTime;camera();};
  r.begin=function(){return originalBegin(probe.simTime);};
  const finishFrame=()=>{const begin=probe.frameBegin,now=performance.now();if(probe.running&&begin>=probe.sampleStart&&probe.lastFrame){const p=d.state.flight;probe.samples.push({ms:begin-probe.lastFrame,cpuRenderMs:now-begin,...r.gl.__benchCounts,quality:c.quality,render:{...c.renderStats},effects:{particles:p.particles?.length??0,beams:p.beams?.length??0,projectiles:p.projectiles?.length??0,impacts:p.weaponImpacts?.length??0},memory:r.three?.info?.memory??r.info?.memory??null});}probe.lastFrame=begin;};
  r.flight=function(...args){const counts=r.gl.__benchCounts;for(const key in counts)counts[key]=0;probe.frameBegin=performance.now();const result=flight(args[0],probe.simTime);if(!endFrame)finishFrame();return result;};
  if(endFrame)r.endFrame=function(...args){const result=endFrame(...args);finishFrame();return result;};
  const clear=()=>{c.presentation.clear();c.projectileVisuals.clear();c.vesselVisuals.clear();for(const key of ['shieldHits','beams','particles','projectiles','weaponImpacts','specialBlasts'])d.state.flight[key]=[];};
  probe.start=function(warmMs){clear();c.replayCursor=0;c.playTime=startTime;probe.started=performance.now();probe.sampleStart=probe.started+warmMs;probe.running=true;probe.frozen=false;probe.samples=[];};
  probe.finish=function(endTime){probe.running=false;probe.frozen=true;c.playTime=endTime;c.paused=true;update(0);probe.simTime=endTime;d.state.flight.elapsed=endTime;camera();return {render:{...c.renderStats},quality:c.quality,heapMB:performance.memory?.usedJSHeapSize/1048576??null,glError:r.gl.getError(),threeMemory:r.three?.info?.memory??r.info?.memory??null,eye:r.eye,selected:c.selected,replayTime:c.playTime};};
  update(0);camera();
  const debug=r.gl.getExtension('WEBGL_debug_renderer_info');
  return {selected:select.id,shipType:select.type,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},gpu:debug?r.gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):r.gl.getParameter(r.gl.RENDERER),version:r.gl.getParameter(r.gl.VERSION)};
}
