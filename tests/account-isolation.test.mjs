import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {once} from 'node:events';

const root=path.resolve(import.meta.dirname,'..');
test('isolated saves own their sessions; anonymous polling and lost sessions never duplicate accounts',async()=>{
  const personalFile=path.join(root,'data/session.json');
  const personalBefore=fs.existsSync(personalFile)?fs.readFileSync(personalFile):null;
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'empire-accounts-')),file=path.join(dir,'universe.json');
  const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');
  const port=listener.address().port;await new Promise(resolve=>listener.close(resolve));
  const env={...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file};
  delete env.EMPIRE_SESSION_FILE;delete env.EMPIRE_MANAGED_STDIN;delete env.EMPIRE_SERVER_LOG;
  const child=spawn(process.execPath,['server.mjs'],{cwd:root,env,windowsHide:true,stdio:['ignore','pipe','pipe']});
  let errors='';child.stderr.on('data',data=>{errors+=data;});
  const base=`http://127.0.0.1:${port}`,headers={Origin:base,'X-Empire-Client':'galactic-command'};
  try{
    await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error(errors);})]);
    assert.equal((await(await fetch(base+'/api/health')).json()).isolated,true);
    for(let i=0;i<4;i++)for(const route of ['/api/state','/api/unknown']){
      const response=await fetch(base+route);
      assert.equal(response.status,401);assert.equal(response.headers.get('set-cookie'),null);
    }
    assert.equal((await(await fetch(base+'/api/launcher/status',{headers})).json()).accounts.length,0);
    for(let i=0;i<3;i++){
      const response=await fetch(base+'/api/session/local',{method:'POST',headers});
      assert.equal(response.status,200);assert.deepEqual(await response.json(),{source:i?'local':'new',name:'测试指挥官'});
    }
    const session=fs.readFileSync(file+'.session','utf8');
    const first=await(await fetch(base+'/api/state',{headers})).json();
    for(const content of [null,'{broken json','{}']){
      if(content===null)fs.unlinkSync(file+'.session');else fs.writeFileSync(file+'.session',content);
      assert.equal((await fetch(base+'/api/state',{headers})).status,401);
      assert.deepEqual(await(await fetch(base+'/api/session/local',{method:'POST',headers})).json(),{source:'local',name:'测试指挥官'});
      assert.equal(fs.readFileSync(file+'.session','utf8'),session);
      assert.equal((await(await fetch(base+'/api/state',{headers})).json()).player.id,first.player.id);
    }
    const exited=once(child,'exit');
    assert.equal((await fetch(base+'/api/launcher/stop',{method:'POST',headers})).status,200);
    await exited;
    assert.equal(Object.values(JSON.parse(fs.readFileSync(file)).players).filter(p=>!p.bot).length,1);
    assert.equal(errors,'');
    if(personalBefore)assert.deepEqual(fs.readFileSync(personalFile),personalBefore);
    else assert.equal(fs.existsSync(personalFile),false);
  }finally{
    if(child.exitCode===null){child.kill();await once(child,'exit');}
    assert.ok(path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(dir,{recursive:true,force:true});
  }
  assert.equal(fs.existsSync(dir),false,'Test accounts and sessions must be removed with their fixture');
});

test('an isolated server rejects the personal session path before opening a save',async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'empire-session-guard-')),file=path.join(dir,'universe.json');
  const child=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,EMPIRE_SAVE_FILE:file,EMPIRE_SESSION_FILE:path.join(root,'data/session.json')},windowsHide:true,stdio:['ignore','pipe','pipe']});
  let error='';child.stderr.on('data',data=>{error+=data;});child.stdout.resume();
  try{
    const [code]=await once(child,'exit');assert.notEqual(code,0);assert.match(error,/测试存档不能共用个人账号会话/);assert.equal(fs.existsSync(file),false);
  }finally{
    assert.ok(path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(dir,{recursive:true,force:true});
  }
});
