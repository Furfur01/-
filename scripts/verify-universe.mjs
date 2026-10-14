import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
import net from 'node:net';
import path from 'node:path';
const dir=path.resolve('output/universe-validation-fixture');
const fixture=spawnSync(process.execPath,['scripts/create-aurora-fixture.mjs'],{env:{...process.env,EMPIRE_FIXTURE_DIR:dir},stdio:'inherit',windowsHide:true});if(fixture.status)process.exit(fixture.status);
const listener=net.createServer().listen(0,'127.0.0.1');await once(listener,'listening');const port=listener.address().port;await new Promise(r=>listener.close(r));
const server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:path.join(dir,'universe.json'),EMPIRE_SESSION_FILE:path.join(dir,'session.json')},windowsHide:true,stdio:['ignore','pipe','inherit']});
try{await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw Error('隔离服务启动失败');})]);const browser=spawn(process.execPath,['tests/universe-browser.mjs'],{env:{...process.env,UNIVERSE_TEST_URL:`http://127.0.0.1:${port}`},windowsHide:true,stdio:'inherit'});const [code]=await once(browser,'exit');process.exitCode=code||0;}finally{server.kill();await once(server,'exit');}
