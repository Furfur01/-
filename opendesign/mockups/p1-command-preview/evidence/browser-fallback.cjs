async (page) => {
  const context=await page.context().browser().newContext({viewport:{width:1280,height:720}});
  const p=await context.newPage(),errors=[];
  p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:original.call(this,type,...args);};});
  try{
    await p.goto('http://127.0.0.1:8390/opendesign/mockups/p1-command-preview/index.html');
    await p.getByLabel('演示速度').selectOption('0');
    await p.getByAltText('设施预览',{exact:true}).waitFor();
    await p.waitForTimeout(500);await p.screenshot({path:'opendesign/mockups/p1-command-preview/evidence/construction-fallback.png'});
    const building=await p.locator('.model-fallback').evaluate(i=>({src:i.src,width:i.naturalWidth,visible:i.getBoundingClientRect().width}));
    await p.getByRole('button',{name:'行星防务',exact:true}).click();
    await p.getByAltText('设施预览',{exact:true}).waitFor();
    await p.waitForTimeout(500);await p.screenshot({path:'opendesign/mockups/p1-command-preview/evidence/defense-fallback.png'});
    const defense=await p.locator('.model-fallback').evaluate(i=>({src:i.src,width:i.naturalWidth,visible:i.getBoundingClientRect().width}));
    return {building,defense,errors};
  }finally{await context.close();}
}
