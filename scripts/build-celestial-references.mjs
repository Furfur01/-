import fs from 'node:fs';
const out='output/celestial-references';fs.mkdirSync(out,{recursive:true});
const scope='https://www.solarsystemscope.com/textures/';
const references=[
 {group:'恒星与日冕',title:'群星 · 蓝色恒星与橙色伴星',image:'https://cdn.mos.cms.futurecdn.net/SYV5gg3n5smrGyh9EBt99U.jpg',source:'https://www.windowscentral.com/stellaris-review-paradox-has-crafted-exquisite-strategic-experience-space',note:'参考蓝白等离子表面、日冕厚度及不同光谱配色。'},
 {group:'恒星与日冕',title:'群星 · 红巨星',image:'https://forumcontent.paradoxplaza.com/public/1404241/20251118_024302.jpg',source:'https://forum.paradoxplaza.com/forum/developer-diary/stellaris-dev-diary-404-red-giant-and-galactic-hyperthermia.1872508/page-8',note:'参考红橙色光球与庞大体量。'},
 {group:'恒星与日冕',title:'群星 · 恒星、星云与轨道',image:'https://images.steamusercontent.com/ugc/16532697058364522807/DBCB74FEF979A1E596FD2DF5A64C00E5D680D3EF/?ima=fit&imw=1024',source:'https://steamcommunity.com/app/281990/screenshots/',note:'参考恒星光晕与深空背景的明暗关系。'},
 {group:'恒星与日冕',title:'群星 · Caravaneers 开发日志',image:'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/clans/9703436/a9e8166aaa750a164736b8bce12c9e2aa87e11d3.png',source:'https://steamcommunity.com/ogg/281990/announcements/detail/1726462797162611729',note:'官方系统视图：红色恒星、气态巨星、星带。'},
 {group:'戴森球 · 星球形态',title:'官方行星生物群系概念图 · 九种形态',image:'https://clan.akamai.steamstatic.com/images/38718364/1ea87aba25e52c067c230fb822bc1b6248c99a5e.jpg',source:'https://steamcommunity.com/games/1366540/announcements/detail/3085505759861267119',note:'一次对照冻土、条带、岩石及不同地表覆盖方式。'},
 {group:'戴森球 · 星球形态',title:'熔岩世界 · 轨道视角',image:'https://cdn.alza.cz/Foto/ImgGalery/Image/dyson-sphere-program-dojmy-z-hrani-vesmir.jpg',source:'https://www.alza.cz/gaming/dyson-sphere-program-recenze',note:'采用宽熔岩水系、黑色玄武岩板块、暖色气辉。'},
 {group:'戴森球 · 星球形态',title:'海洋丛林',image:'https://patchwiki.biligame.com/images/dsp/d/d0/im1ormfofl5yqtgnld68e88qiwr64yk.png',source:'https://wiki.biligame.com/dsp/海洋丛林',note:'参考海洋占比、群岛边缘及绿色陆地。'},
 {group:'戴森球 · 星球形态',title:'地中海行星 · 海岸',image:'https://clan.fastly.steamstatic.com/images/38718364/75ca2103572eb0f824d221709bf58bf5f9ae69bd.jpg',source:'https://steamdb.info/patchnotes/8910867/',note:'参考浅海、沙岸、植被之间的层次。'},
 {group:'星空与可复用贴图',title:'银河星空 · 等距柱状投影',image:scope+'previews/preview_stars_milky_way.jpg',source:scope,note:'Solar System Scope / INOVE，CC BY 4.0；可作球面背景贴图。'},
 {group:'星空与可复用贴图',title:'太阳表面',image:scope+'previews/preview_sun.jpg',source:scope,note:'Solar System Scope / INOVE，CC BY 4.0；观察颗粒及黑子尺度。'},
 {group:'星空与可复用贴图',title:'木星云带',image:scope+'previews/preview_jupiter.jpg',source:scope,note:'Solar System Scope / INOVE，CC BY 4.0；观察涡旋、细条纹与云带配色。'},
];
for(const [id,title] of [[281990,'群星 · 官方商店图库'],[1366540,'戴森球 · 官方商店图库']]){
 const images=JSON.parse(fs.readFileSync(`${out}/steam-${id}.json`,'utf8'));
 for(const s of images)references.push({group:title,title:`${title} ${s.id+1}`,image:s.path_thumbnail,full:s.path_full,source:`https://store.steampowered.com/app/${id}/`,note:'官方公开截图；点击图片查看原图。'});
}
const models=[
 {title:'NASA · 带云层的地球 glTF',url:'https://science.nasa.gov/resource/earth-with-clouds-3d-model/',note:'真实地球球面和独立云层，可检查分层方式。'},
 {title:'NASA · 交互式地球模型',url:'https://science.nasa.gov/learn/heat/resource/earth-3d-model/',note:'官方 glTF 模型入口。'},
 {title:'Sketchfab · Lava planet / FPSunreal',url:'https://sketchfab.com/3d-models/lava-planet-9792612f76184ee3b48530c7515ce747',note:'搜索结果标为可下载；尚未下载，需在模型页核对具体许可。'},
 {title:'Sketchfab · Earth / SebastianSosnowski',url:'https://sketchfab.com/3d-models/earth-4de1bcbd22a444abb4f089b9b78ec96a',note:'搜索目录标为 CC Attribution；详情抓取返回 403，未导入。'},
 {title:'ESA/Hubble · 星空与星云背景图库',url:'https://esahubble.org/images/archive/wallpapers/',note:'高分辨率天文背景图入口，各图附署名信息。'},
];
fs.writeFileSync(out+'/sources.json',JSON.stringify({date:'2026-10-14',references,models},null,2));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const groups=[...new Set(references.map(r=>r.group))];
fs.writeFileSync(out+'/index.html',`<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>恒星与行星 · 美术参考图集</title><style>body{margin:0;background:#090e1c;color:#dce7ee;font:15px/1.7 system-ui}main{max-width:1400px;margin:auto;padding:40px}h1{font-size:34px}h2{margin-top:46px;color:#bba3f1}p{color:#9aaebe}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:20px}article{background:#101b2b;border:1px solid #26374e;border-radius:9px;overflow:hidden}img{width:100%;height:220px;object-fit:contain;background:#03070e}article div{padding:16px}h3{margin:0}a{color:#86c9e1}small{color:#99aabc}.links{display:grid;gap:12px}button{padding:8px 16px;background:#18283e;color:#dce7ee;border:1px solid #354760;border-radius:6px;margin:4px;cursor:pointer}</style><main><h1>恒星与行星 · 美术参考图集</h1><p>${references.length} 张参考图 · 5 个模型与图库入口 · 2026-10-14</p><p>游戏截图用于美术参考；目前游戏内使用原创程序材质与现有地形网格。Solar System Scope 贴图标注 CC BY 4.0。低模继续沿用高模地形，避免替换外部球体后海岸、熔岩和建筑位置不一致。</p><nav>${groups.map((g,i)=>`<button onclick="document.getElementById('g${i}').scrollIntoView({behavior:'smooth'})">${esc(g)}</button>`).join('')}</nav>${groups.map((g,i)=>`<h2 id="g${i}">${esc(g)}</h2><section class="grid">${references.filter(r=>r.group===g).map(r=>`<article><a href="${esc(r.full||r.image)}" target="_blank" rel="noreferrer"><img loading="lazy" src="${esc(r.image)}" alt="${esc(r.title)}"></a><div><h3>${esc(r.title)}</h3><p>${esc(r.note)}</p><a href="${esc(r.source)}" target="_blank" rel="noreferrer">来源页面 ↗</a></div></article>`).join('')}</section>`).join('')}<h2>模型与背景素材入口</h2><section class="links">${models.map(m=>`<article><div><a href="${esc(m.url)}" target="_blank" rel="noreferrer">${esc(m.title)} ↗</a><p>${esc(m.note)}</p></div></article>`).join('')}</section></main></html>`);
fs.mkdirSync('opendesign/references/celestial',{recursive:true});
fs.copyFileSync(out+'/index.html','opendesign/references/celestial/index.html');
console.log(`Reference board: ${references.length} images, ${models.length} resource links`);
