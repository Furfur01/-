async (page) => {
  const results=[];
  for(const [width,height] of [[1440,900],[1280,720],[390,844]]){
    await page.setViewportSize({width,height});
    for(const [name,slug] of [['殖民地建设','construction'],['行星防务','defense'],['舰队行动','fleet'],['帝国王庭','court']]){
      await page.getByRole('button',{name,exact:true}).click();
      await page.waitForTimeout(800);
      await page.evaluate(()=>window.scrollTo(0,0));
      await page.screenshot({path:`opendesign/mockups/p1-command-preview/evidence/${slug}-${width}.png`,fullPage:true});
      results.push(await page.evaluate(({name,width,height})=>({name,width,height,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,scrollHeight:document.documentElement.scrollHeight,brokenImages:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src),canvases:[...document.querySelectorAll('canvas')].map(c=>({width:c.width,height:c.height})),text:document.querySelector('main')?.innerText.slice(0,250)}),{name,width,height}));
    }
  }
  console.log(JSON.stringify(results,null,2));
}
