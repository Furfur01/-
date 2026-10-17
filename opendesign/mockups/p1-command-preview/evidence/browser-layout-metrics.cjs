async (page) => {
  const results=[];
  for(const [width,height] of [[1440,900],[1280,720],[390,844]]){
    await page.setViewportSize({width,height});
    for(const name of ['殖民地建设','行星防务','舰队行动','帝国王庭']){
      await page.getByRole('button',{name,exact:true}).click();
      results.push(await page.evaluate(({name,width,height})=>({name,width,height,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,scrollHeight:document.documentElement.scrollHeight,brokenImages:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src),scrollAreas:[...document.querySelectorAll('*')].filter(e=>['auto','scroll'].includes(getComputedStyle(e).overflowY)&&e.scrollHeight>e.clientHeight+2).map(e=>({class:e.className,height:e.clientHeight,scroll:e.scrollHeight})),smallTargets:width===390?[...document.querySelectorAll('button,select,input,a')].filter(e=>e.getBoundingClientRect().width>0).map(e=>({name:e.getAttribute('aria-label')||e.textContent.trim().slice(0,28),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})).filter(e=>e.width<44||e.height<44):[]}),{name,width,height}));
    }
  }
  return results;
}
