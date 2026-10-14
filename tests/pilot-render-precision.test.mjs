import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('../opendesign/mockups/galactic-command/',import.meta.url);
const source=fs.readFileSync(new URL('ship-renderer.js',dir),'utf8');

test('ship GPU coordinates stay stable after very long flights',()=>{
  const matrices={},vectors={};
  const gl=new Proxy({uniformMatrix4fv:(name,transpose,value)=>{assert.ok(value instanceof Float32Array);matrices[name]=Array.from(value);},uniform3fv:(name,value)=>vectors[name]=Array.from(value)},{get:(obj,key)=>obj[key]||(()=>{})});
  const context=vm.createContext({Float32Array,Float64Array,gl});
  const math=source.slice(source.indexOf('  const V ='),source.indexOf('  function seeded'));
  const draw=source.slice(source.indexOf('    drawMesh('),source.indexOf('    drawFlat('));
  vm.runInContext(math+`const renderer={${draw}};renderer.gl=gl;renderer.bindMain=()=>{};renderer.uni={uModel:'model',uVP:'vp',uEye:'eye'};
    function render(shift){
      renderer.eye=[shift+5,shift+3,shift+8];
      renderer.vp=M.mul(M.perspective(1,1,.08,22000),M.lookAt(renderer.eye,[shift,shift,shift]));
      renderer.drawMesh({count:3},M.compose([shift+.1234,shift+.2345,shift+.3456],[.1,.3,0]));
    }`,context);
  vm.runInContext('render(0)',context);const baseline=structuredClone(matrices);
  for(const shift of [10000,1e6,1e8]){
    vm.runInContext(`render(${shift})`,context);
    for(const key of ['model','vp'])for(let i=0;i<16;i++)assert.ok(Math.abs(baseline[key][i]-matrices[key][i])<1e-6,key+' precision');
    assert.deepEqual(vectors.eye,[0,0,0]);
  }
});

test('coplanar armor has bounded deterministic depth priority without modifying hull positions',()=>{
  const buffer=fs.readFileSync(new URL('flight-fleet.bin',dir)),v=new Float32Array(buffer.buffer,buffer.byteOffset,buffer.byteLength/4);
  const levels=new Set();
  for(let i=0;i<v.length;i+=13){assert.ok(v[i+11]<=-1&&v[i+11]>=-16);assert.equal(v[i+12],0);levels.add(v[i+11]);}
  assert.ok(levels.size>4);
  assert.match(source,/max\(0\.,-aUV\.x\)/);
});
