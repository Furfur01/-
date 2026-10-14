import test from 'node:test';
import assert from 'node:assert/strict';
import {frameMetrics,median,percentile,createFixture,hash,summarizeComparison,views} from './three-battle-harness.mjs';

test('frame metrics use complete one-second buckets and report long stalls',()=>{
  const frames=[...Array(120).fill(1000/60),1000,...Array(90).fill(1000/60)];
  const m=frameMetrics(frames);assert.ok(m.averageFPS<60);assert.ok(m.minOneSecondFPS<40);assert.ok(m.p95Ms<17);assert.equal(percentile([1,2,3,4],.95),4);assert.equal(median([1,4,2,3]),2.5);
});
test('fixture replay is deterministic, has 1000 ships and never changes production rules',()=>{
  const a=createFixture({seconds:1}),b=createFixture({seconds:1});
  assert.equal(a.manifest.ships,1000);assert.equal(a.replay.record.metadata.length,1000);assert.equal(a.manifest.sha256,b.manifest.sha256);assert.equal(hash(a.replay),a.manifest.sha256);
  assert.equal(a.replay.record.frames[1].tick,4);assert.equal(a.replay.report.technology.attacker.Strength_Tech,50);
  assert.ok(a.replay.record.events.every((e,i,events)=>i===0||e.seq>events[i-1].seq));
  const stress=createFixture({seconds:1,stress:true});assert.equal(stress.replay.record.metadata[0].maxHp,a.replay.record.metadata[0].maxHp*8);assert.notEqual(a.manifest.sha256,stress.manifest.sha256);
});
test('performance gate requires all three rounds and rejects omitted ships or auto quality',()=>{
  const results=views.flatMap(view=>['legacy','three'].flatMap(engine=>[1,2,3].map(round=>({view,engine,round,errors:[],end:{glError:0,quality:1,render:{instances:1000,alive:1000}},metrics:{averageFPS:60,p95Ms:18,minOneSecondFPS:54}}))));
  assert.ok(summarizeComparison(results).every(r=>r.status==='pass'));
  assert.ok(summarizeComparison(results,{full:false}).every(r=>r.status==='incomplete'));
  results.find(r=>r.engine==='three').end.render.instances=900;assert.equal(summarizeComparison(results)[0].status,'fail');
  assert.equal(summarizeComparison(results.slice(1))[0].status,'incomplete');
});
