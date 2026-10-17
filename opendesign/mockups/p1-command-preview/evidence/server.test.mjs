import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createPreviewServer} from '../serve.mjs';
test('isolated preview serves its assets and rejects APIs, saves and mutations',async()=>{
 const server=createPreviewServer();try{
  server.listen(0,'127.0.0.1');await once(server,'listening');const base='http://127.0.0.1:'+server.address().port;
  for(const pathname of ['/opendesign/mockups/p1-command-preview/index.html','/opendesign/mockups/p1-command-preview/preview.js','/opendesign/mockups/p1-command-preview/assets/buildings/Metal_Mine.png','/opendesign/mockups/p0-command-preview/index.html','/opendesign/mockups/three-hud-preview/index.html','/opendesign/mockups/three-hud-preview/assets/reference-hud.js'])assert.equal((await fetch(base+pathname)).status,200,pathname);
  for(const pathname of ['/api/state','/api/action','/data/universe.json','/data/session.json','/opendesign/mockups/p1-command-preview/src/model.mjs'])assert.equal((await fetch(base+pathname)).status,404,pathname);
  assert.equal((await fetch(base+'/api/action',{method:'POST',body:'{}'})).status,405);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
