// Checked against the linked works on 2026-10-19. Chinese translations are local.
// Same record shape as technologyQuotes; literary lines are credited to their author and work.
const q=(text,author,work,url,original=null)=>({text,author,work,url,...(original?{original,translation:'节译'}:{})});
const sunzi='https://zh.wikisource.org/zh-hant/孫子';
const henry='https://www.folger.edu/explore/shakespeares-works/henry-v/';
export const shipQuotes={
 Light_Fighter:q('我们虽少，却是幸运的少数，是情同手足的兄弟。','威廉·莎士比亚','《亨利五世》·第四幕第三场',henry,'We few, we happy few, we band of brothers'),
 Heavy_Fighter:q('杀不死我的，只会使我更强大。','弗里德里希·尼采','《偶像的黄昏》·格言与箭，第八则','https://www.gutenberg.org/cache/epub/52263/pg52263-images.html','That which does not kill me, makes me stronger.'),
 Cruiser:q('长风破浪会有时，直挂云帆济沧海。','李白','《行路难·其一》','https://zh.wikisource.org/wiki/行路難_(李白)'),
 Battleship:q('轻声说话，手持大棒。','西奥多·罗斯福','明尼苏达州演说，1901年（引谚语）','https://www.theodorerooseveltcenter.org/quote/speak-softly-and-carry-a-big-stick-you-will-go-far-if-a-man-continually-blusters-if-he-lacks-civility-a-big-stick-will-not-save-him-from-trouble-and-neither-will-speaking-softly-avail-i/','Speak softly and carry a big stick'),
 Dreadnought:q('足够先进的技术，与魔法无异。','阿瑟·克拉克','克拉克第三定律','https://science.nasa.gov/solar-system/10-things-dec-18-space-technology-magic-and-arthur-c-clarke/','Any sufficiently advanced technology is indistinguishable from magic.'),
 Bomber:q('轰炸机总能突破防线。','斯坦利·鲍德温','英国下议院演说，1932年','https://api.parliament.uk/historic-hansard/commons/1932/nov/10/international-affairs','the bomber will always get through'),
 Destroyer:q('再向缺口冲一次，亲爱的朋友们，再冲一次！','威廉·莎士比亚','《亨利五世》·第三幕第一场',henry,'Once more unto the breach, dear friends, once more'),
 Cargo_Ship:q('不知道驶向哪个港口的人，任何风都不是顺风。','塞涅卡','《致卢基利乌斯书信》·第七十一封','https://en.wikisource.org/wiki/Moral_letters_to_Lucilius/Letter_71','When a man does not know what harbour he is making for, no wind is the right wind.'),
 Large_Cargo_Ship:q('把工具交给我们，剩下的活由我们完成。','温斯顿·丘吉尔','广播演说，1941年2月9日','https://winstonchurchill.org/resources/speeches/1941-1945-war-leader/give-us-the-tools/','Give us the tools, and we will finish the job.'),
 Colony_Ship:q('我们选择登月，不是因为它容易，而是因为它艰难。','约翰·肯尼迪','莱斯大学演讲，1962年','https://www.jfklibrary.org/learn/about-jfk/historic-speeches/address-at-rice-university-on-the-nations-space-effort','We choose to go to the Moon in this decade and do the other things, not because they are easy, but because they are hard.'),
 Recycler:q('实验前后，物质的总量保持相等。','安托万·拉瓦锡','《化学基础论》·第一篇第十三章','https://www.gutenberg.org/cache/epub/30775/pg30775-images.html','an equal quantity of matter exists both before and after the experiment'),
 Probe:q('还没拿到数据就下结论，是个大错。','阿瑟·柯南·道尔','《波希米亚丑闻》·福尔摩斯语','https://www.gutenberg.org/files/1661/1661-h/1661-h.htm','It is a capital mistake to theorise before one has data.'),
 Solar_Satellite:q('太阳是驱动一切的动力源。','尼古拉·特斯拉','《增加人类能量的问题》，1900年','https://www.pbs.org/tesla/res/res_art09.html','The sun is the spring that drives all.'),
 Interceptor:q('凭我们现有的手段和知识，想利用原子能，不过是痴人说梦。','欧内斯特·卢瑟福','1933年演说，《纽约时报》所记','https://quoteinvestigator.com/2018/11/26/moonshine/','…with the means at present at our disposal and with our present knowledge we can utilize atomic energy is talking moonshine.'),
 Iron_Behemoth:q('计划一文不值，但制定计划不可或缺。','德怀特·艾森豪威尔','国防后备行政人员会议演说，1957年','https://www.eisenhowerlibrary.gov/eisenhowers/quotes','Plans are worthless, but planning is everything.'),
 Devourer_Interceptor:q('兵之胜，避实而击虚。','孙子','《孙子兵法·虚实》',sunzi),
 Titanenergetic_Frigate:q('如蝴蝶般飞舞，像蜜蜂般蜇刺。','穆罕默德·阿里','谈自己的拳击风格','https://npg.si.edu/blog/portrait-muhammad-ali-henry-casselli','Float like a butterfly, sting like a bee.'),
 Annihilator:q('如今，我成了死神，世界的毁灭者。','罗伯特·奥本海默','1965年访谈，引用《薄伽梵歌》','https://www.nps.gov/articles/000/the-life-of-j-robert-oppenheimer-the-manhattan-project-years-1941-to-1946.htm','Now I am become Death, destroyer of worlds...'),
 Reaper:q('别问丧钟为谁而鸣，它为你而鸣。','约翰·邓恩','《紧急时刻的祈祷》·第十七篇默想','https://www.gutenberg.org/cache/epub/23772/pg23772-images.html','never send to know for whom the bells tolls; it tolls for thee.'),
 Death_Star:q('不战而屈人之兵，善之善者也。','孙子','《孙子兵法·谋攻》',sunzi),
 Guardian:q('人生自古谁无死？留取丹心照汗青。','文天祥','《过零丁洋》','https://zh.wikisource.org/wiki/過零丁洋')
};
