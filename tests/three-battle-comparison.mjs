import fs from 'node:fs';
import path from 'node:path';
import {createFixture,persistFixture,output,views,playwright,startServer,mountReplay,configureProbe,frameMetrics,summarizeComparison,median,sourceFingerprint} from './three-battle-harness.mjs';

const args=new Set(process.argv.slice(2)),quick=args.has('--quick'),stressOnly=args.has('--stress-only'),headed=args.has('--headed');
const runDirectory=path.join(output,quick?'smoke':'full');fs.mkdirSync(runDirectory,{recursive:true});
const warmMs=quick?1000:10000,sampleMs=quick?2500:30000,rounds=quick?1:3;
const selectedViews=process.env.THREE_BATTLE_VIEWS?.split(',')??views;
for(const view of selectedViews)if(!views.includes(view))throw Error(`Unknown view: ${view}`);
const fixtureNames=stressOnly?['stress']:args.has('--with-stress')?['normal','stress']:['normal'];
const fixtures=fixtureNames.map(name=>createFixture({stress:name==='stress'}));
// A short normal clip with no continued visual firing is reported explicitly;
// the separate stress sample is added automatically, without replacing it.
const hasSustainedFire=f=>{
  const a=f.manifest.combatStart+warmMs/1000,b=a+sampleMs/1000;
  const events=f.replay.record.events.filter(e=>e.tick*.05>=a&&e.tick*.05<=b&&!['reinforcement','destroy','finish'].includes(e.type));
  return [0,1,2].every(i=>events.some(e=>e.tick*.05>=a+i*(b-a)/3&&e.tick*.05<a+(i+1)*(b-a)/3));
};
if(fixtures.some(f=>f.manifest.name==='normal'&&!hasSustainedFire(f))&&!fixtures.some(f=>f.manifest.name==='stress'))fixtures.push(createFixture({stress:true}));
for(const fixture of fixtures){fixture.manifest.sustainedFireDuringSample=hasSustainedFire(fixture);persistFixture(fixture);}
const server=await startServer({directory:path.join(runDirectory,'server')});
const {chromium}=playwright(),browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:!headed,args:['--use-angle=d3d11','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const report={mode:quick?'smoke — not an acceptance run':'full',createdAt:new Date().toISOString(),browser:browser.version(),conditions:{width:1920,height:1080,dpr:1,warmMs,sampleMs,rounds,viewOrder:selectedViews,rendererOrder:'legacy→three / three→legacy / legacy→three',fixedQuality:1,visualRandomSeed:42,playback:'Shared offline replay, 200 ms snapshots, real elapsed time; event-specific random seed; common camera path. Simulation does not run during rendering measurement.'},fixtures:fixtures.map(f=>f.manifest),results:[],summaries:{},errors:[]};
report.sourceStart=sourceFingerprint();
function persist(){
  for(const fixture of fixtures)report.summaries[fixture.manifest.name]=summarizeComparison(report.results.filter(r=>r.fixture===fixture.manifest.name),{full:!quick&&selectedViews.length===4});
  if(report.sourceUnchanged===false)for(const summary of Object.values(report.summaries).flat())summary.status='uncertified';
  fs.writeFileSync(path.join(runDirectory,'results.json'),JSON.stringify(report,null,2));
  const rows=Object.entries(report.summaries).flatMap(([fixture,s])=>s.map(x=>`| ${fixture} | ${x.view} | ${x.legacy.averageFPS?.toFixed(2)??'—'} | ${x.three.averageFPS?.toFixed(2)??'—'} | ${x.fpsRatio?.toFixed(3)??'—'} | ${x.p95Ratio?.toFixed(3)??'—'} | ${x.three.minOneSecondFPS?.toFixed(2)??'—'} | ${x.status} |`));
  const text=`# Three.js 千舰对照测试\n\n模式：${report.mode}。浏览器：${report.browser}。${warmMs/1000} 秒预热，${sampleMs/1000} 秒采样，${rounds} 轮，1920×1080，DPR 1。\n\n双方使用相同离线记录、相同事件种子、相同时间段和镜头轨迹；固定画质轮次禁用自动画质。渲染期间没有后台实时战斗模拟。原始逐帧数据、GL 提交计数、三角形数量、舰数与细节分布、特效数量、堆内存和截图均在本目录。模拟耗时单列于 fixture manifest，不计入渲染提升。\n\n| 样本 | 视角 | 原版 FPS | Three.js FPS | FPS 比值 | P95 比值 | 最低一秒 FPS | 结论 |\n|---|---|---:|---:|---:|---:|---:|---|\n${rows.join('\n')}\n\n通过条件：完整三轮；平均 FPS 三轮中位值 ≥ 原版 95%；P95 帧时 ≤ 原版 110%；最低一秒 FPS 三轮中位值 ≥ 30；无浏览器/GL 错误、quality=1、所有存活舰船保留显示身份。smoke 与未完成视角一律为 incomplete，不能作为性能通过结论。\n\n正常样本和缩短距离/八倍耐久压力样本分别报告。自动画质只作为体验附加记录，不参与固定画质通过判定。截图为相同回放时刻，粒子积分可能因实际帧率有细小差异；逐事件随机种子一致。\n\n复跑：\n\n\`\`\`powershell\nnode tests/three-battle-comparison.mjs\nnode tests/three-battle-comparison.mjs --quick\nnode tests/three-battle-comparison.mjs --with-stress --headed\nnode tests/three-battle-regression.mjs\nnode scripts/launch-three-battle-trial.mjs\n\`\`\`\n\n${report.errors.length?'运行错误：\n\n'+report.errors.map(e=>'- '+e).join('\n'):'最终性能结论须结合画面对照及回归结果；低于门槛不会改变正式默认入口。'}\n`;
  fs.writeFileSync(path.join(runDirectory,'report.md'),text);
}
async function run(fixture,engine,view,round,adaptive=false){
  const name=`${fixture.manifest.name}-${engine}-${view}-${adaptive?'adaptive':`r${round+1}`}`;
  const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const result={fixture:fixture.manifest.name,fixtureSha256:fixture.manifest.sha256,engine,view,round:round+1,adaptive,errors};
  try{
    const mounted=await mountReplay(page,server,fixture,engine);result.loadMs=mounted.loadMs;
    result.environment=await page.evaluate(configureProbe,{view,startTime:fixture.manifest.combatStart,adaptive});
    await page.evaluate(warm=>window.__battleProbe.start(warm),warmMs);
    await page.waitForTimeout(warmMs+sampleMs);
    const endTime=fixture.manifest.combatStart+(warmMs+sampleMs)/1000;
    result.end=await page.evaluate(t=>window.__battleProbe.finish(t),endTime);
    const samples=await page.evaluate(()=>window.__battleProbe.samples);
    result.metrics=frameMetrics(samples);result.renderMetrics={medianCalls:median(samples.map(s=>s.calls)),medianTriangles:median(samples.map(s=>s.triangles)),medianCpuRenderMs:median(samples.map(s=>s.cpuRenderMs)),medianQuality:median(samples.map(s=>s.quality))};
    result.postRequests=mounted.requests;result.screenshot=`${name}.png`;result.rawFrames=`${name}-frames.json`;
    fs.writeFileSync(path.join(runDirectory,result.rawFrames),JSON.stringify(samples));
    await page.screenshot({path:path.join(runDirectory,result.screenshot)});
    if(mounted.requests.length)errors.push('Read-only replay sent POST: '+mounted.requests.join(', '));
    console.log(JSON.stringify({sample:name,fps:result.metrics.averageFPS,p95:result.metrics.p95Ms,render:result.end.render,errors}));
  }catch(error){result.error=error.stack;report.errors.push(name+': '+error.message);console.error(name+': '+error.message);await page.screenshot({path:path.join(runDirectory,name+'-error.png')}).catch(()=>{});}
  finally{report.results.push(result);await page.close();persist();}
}
try{
  for(const fixture of fixtures){
    for(let round=0;round<rounds;round++)for(const view of selectedViews)for(const engine of round%2?['three','legacy']:['legacy','three'])await run(fixture,engine,view,round);
    if(!args.has('--no-adaptive'))for(const engine of ['legacy','three'])await run(fixture,engine,'cinema',0,true);
  }
}finally{await browser.close();await server.stop();if(server.stderr)report.errors.push(server.stderr);report.sourceEnd=sourceFingerprint();report.sourceUnchanged=report.sourceStart.sha256===report.sourceEnd.sha256;if(!report.sourceUnchanged)report.errors.push('Sources or renderer assets changed during the run; this result cannot certify the final build.');persist();}
if(report.errors.length||(!quick&&Object.values(report.summaries).flat().some(x=>x.status!=='pass')))process.exitCode=1;
console.log('Report: '+path.join(runDirectory,'report.md'));
