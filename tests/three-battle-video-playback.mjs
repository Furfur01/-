import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {playwright,root} from './three-battle-harness.mjs';

export function parsePlaybackOptions(args){
  const options={url:'http://127.0.0.1:8291/',out:path.join(root,'output/playwright/three-battle-video/playback'),help:false};
  for(let i=0;i<args.length;i++){
    const [flag,inline]=args[i].split(/=(.*)/s),name=flag.replace(/^--/,'');
    if(flag==='--help'){options.help=true;continue;}
    if(!['--url','--out'].includes(flag))throw Error('Unknown option: '+flag);
    const value=inline??args[++i];if(value===undefined||!value||value.startsWith('--'))throw Error('Missing value for '+flag);options[name]=value;
  }
  const url=new URL(options.url);if(!['http:','https:'].includes(url.protocol))throw Error('--url must be HTTP(S)');options.url=url.href;options.out=path.resolve(options.out);return options;
}

function watchMediaErrors(){
  window.__videoPlaybackErrors=[];
  document.addEventListener('error',event=>{const video=event.target;if(video instanceof HTMLMediaElement)window.__videoPlaybackErrors.push({src:video.currentSrc||video.src,code:video.error?.code??null,message:video.error?.message??'media error'});},true);
}

async function seekVideo(page,index,target){
  await page.evaluate(({index,target})=>new Promise((resolve,reject)=>{
    const video=document.querySelectorAll('video')[index];
    if(!video)throw Error('Video disappeared');
    const timer=setTimeout(()=>finish(Error('seeked event timed out at '+target+' s')),15000);
    const completed=()=>finish(),failed=()=>finish(Error(video.error?.message||'Video seek error'));
    function finish(error){clearTimeout(timer);video.removeEventListener('seeked',completed);video.removeEventListener('error',failed);error?reject(error):resolve();}
    video.addEventListener('seeked',completed,{once:true});video.addEventListener('error',failed,{once:true});
    video.currentTime=target;
  }),{index,target});
  await page.waitForFunction(({index,target})=>{const video=document.querySelectorAll('video')[index];return video&&!video.seeking&&video.readyState>=2&&Math.abs(video.currentTime-target)<.15;},{index,target},{timeout:15000});
  return page.evaluate(index=>{const video=document.querySelectorAll('video')[index];return {currentTime:video.currentTime,paused:video.paused,seeking:video.seeking,readyState:video.readyState,decodedFrames:video.webkitDecodedFrameCount??null,error:video.error?{code:video.error.code,message:video.error.message}:null};},index);
}

async function verifyRange(context,url,header){
  const response=await context.request.get(url,{headers:{Range:header},timeout:30000});
  try{
    const headers=response.headers(),body=await response.body(),match=/^bytes (\d+)-(\d+)\/(\d+)$/.exec(headers['content-range']??'');
    assert.equal(response.status(),206,'video range response');assert.equal(headers['accept-ranges'],'bytes');assert.ok(match,'valid Content-Range');
    const [start,end,total]=match.slice(1).map(Number);assert.equal(body.length,end-start+1);assert.equal(Number(headers['content-length']),body.length);assert.equal(body.length,1024,'requested 1 KiB only');
    if(header==='bytes=0-1023')assert.equal(start,0);else assert.equal(end,total-1,'suffix range reaches the final byte');
    return {request:header,status:response.status(),contentRange:headers['content-range'],acceptRanges:headers['accept-ranges'],contentType:headers['content-type'],bytes:body.length,totalBytes:total};
  }finally{await response.dispose();}
}

export async function verifyVideoPlayback(options){
  fs.mkdirSync(options.out,{recursive:true});const resultPath=path.join(options.out,'results.json');
  const report={kind:'browser-video-playback-verification',createdAt:new Date().toISOString(),url:options.url,conditions:{width:1920,height:1080,dpr:1,expectedVideos:11,firstDimensions:[1920,1080],comparisonDimensions:[3840,1080],muted:true,performanceBenchmark:false},videos:[],pageErrors:[],consoleErrors:[],httpErrors:[],mediaResponses:[],errors:[]};
  const save=()=>fs.writeFileSync(resultPath,JSON.stringify(report,null,2));save();let browser=null,context=null,page=null;
  try{
    const {chromium}=playwright();browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true,args:['--use-angle=d3d11','--autoplay-policy=no-user-gesture-required']});report.browser=browser.version();
    context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});page=await context.newPage();
    page.on('pageerror',error=>report.pageErrors.push(error.message));page.on('console',message=>{if(message.type()==='error')report.consoleErrors.push({text:message.text(),url:message.location().url});});
    page.on('response',response=>{if(response.status()>=400)report.httpErrors.push({status:response.status(),url:response.url()});if(/\.(mp4|webm)(?:\?|$)/i.test(response.url()))report.mediaResponses.push({url:response.url(),status:response.status(),requestRange:response.request().headers().range??null,contentRange:response.headers()['content-range']??null});});
    await page.addInitScript(watchMediaErrors);await page.goto(options.url,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>document.querySelectorAll('video').length===11,null,{timeout:30000});
    report.title=await page.title();report.videoCount=await page.locator('video').count();assert.equal(report.videoCount,11);
    for(let index=0;index<11;index++){
      const entry={index,status:'checking',seeks:[],range:[],errors:[]};report.videos.push(entry);
      try{
        await page.evaluate(index=>{const video=document.querySelectorAll('video')[index];video.muted=true;video.pause();video.preload='metadata';if(video.readyState===0)video.load();},index);
        await page.waitForFunction(index=>{const video=document.querySelectorAll('video')[index];return video?.readyState>=1&&Number.isFinite(video.duration)&&video.duration>0;},index,{timeout:60000});
        entry.metadata=await page.evaluate(index=>{const video=document.querySelectorAll('video')[index];return {src:video.currentSrc||video.src,width:video.videoWidth,height:video.videoHeight,duration:video.duration,readyState:video.readyState,error:video.error?{code:video.error.code,message:video.error.message}:null};},index);
        assert.equal(entry.metadata.width,index===0?1920:3840,'encoded width');assert.equal(entry.metadata.height,1080,'encoded height');assert.equal(entry.metadata.error,null);if(index===0)assert.ok(Math.abs(entry.metadata.duration-600)<.2,'full battle keeps 600 seconds at original speed');
        for(const range of ['bytes=0-1023','bytes=-1024'])entry.range.push(await verifyRange(context,entry.metadata.src,range));
        const before=await page.evaluate(async index=>{const video=document.querySelectorAll('video')[index];video.currentTime=0;const value={time:video.currentTime,decodedFrames:video.webkitDecodedFrameCount??null};await video.play();return value;},index);
        await page.waitForFunction(({index,time})=>{const video=document.querySelectorAll('video')[index];return video&&!video.paused&&video.currentTime>time+.15;},{index,time:before.time},{timeout:15000});
        entry.play=await page.evaluate(index=>{const video=document.querySelectorAll('video')[index];const value={currentTime:video.currentTime,wasPlaying:!video.paused,decodedFrames:video.webkitDecodedFrameCount??null,error:video.error?{code:video.error.code,message:video.error.message}:null};video.pause();return {...value,paused:video.paused};},index);
        assert.equal(entry.play.wasPlaying,true);assert.equal(entry.play.paused,true);assert.ok(entry.play.currentTime>before.time+.15);assert.equal(entry.play.error,null);if(entry.play.decodedFrames!==null)assert.ok(entry.play.decodedFrames>0,'decoded frames during actual playback');
        const targets=index===0?[300,599]:[entry.metadata.duration/2];
        for(const target of targets){assert.ok(target<entry.metadata.duration);const state=await seekVideo(page,index,target);assert.equal(state.error,null);assert.equal(state.paused,true);entry.seeks.push({requestedTime:target,...state});}
        entry.status='passed';console.log(JSON.stringify({video:index+1,width:entry.metadata.width,duration:entry.metadata.duration,play:true,seek:entry.seeks.map(seek=>seek.currentTime),ranges:entry.range.map(range=>range.status)}));
      }catch(error){entry.status='failed';entry.errors.push(error.stack??String(error));report.errors.push('video '+(index+1)+': '+error.message);}
      finally{await page.evaluate(index=>document.querySelectorAll('video')[index]?.pause(),index).catch(()=>{});save();}
    }
    // Restore the first frame for a useful screenshot of the report's opening.
    if(report.videos[0]?.status==='passed')await seekVideo(page,0,0);
    await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(150);report.screenshot=path.join(options.out,'report-homepage.png');await page.screenshot({path:report.screenshot,fullPage:false});
    report.mediaErrors=await page.evaluate(()=>window.__videoPlaybackErrors);
    assert.deepEqual(report.pageErrors,[],'pageerror count');assert.deepEqual(report.consoleErrors,[],'consoleerror count');assert.deepEqual(report.httpErrors,[],'HTTP error count');assert.deepEqual(report.mediaErrors,[],'video element errors');
    assert.equal(report.videos.filter(video=>video.status==='passed').length,11,'all videos pass');
  }catch(error){report.errors.push(error.stack??String(error));if(page&&!report.screenshot){report.screenshot=path.join(options.out,'playback-error.png');await page.screenshot({path:report.screenshot}).catch(()=>{});}}
  finally{if(context)await context.close();if(browser)await browser.close();report.browserClosed=true;report.serviceStopped=false;report.finishedAt=new Date().toISOString();report.passed=report.errors.length===0&&report.videos.length===11&&report.videos.every(video=>video.status==='passed');save();}
  console.log(JSON.stringify({passed:report.passed,videos:report.videos.length,result:resultPath,errors:report.errors}));return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{const options=parsePlaybackOptions(process.argv.slice(2));if(options.help)console.log('Usage: node tests/three-battle-video-playback.mjs [--url http://127.0.0.1:8291/] [--out DIRECTORY]\nChecks 11 videos, dimensions, play/pause, middle and final seeking, HTTP 206 ranges, and browser/media errors. Closes its browser and leaves the preview server running.');else if(!(await verifyVideoPlayback(options)).passed)process.exitCode=1;}
  catch(error){console.error(error.stack??String(error));process.exitCode=1;}
}
