// Checked against the linked works on 2026-10-18. Translations are local, not purported published translations.
const q=(text,author,work,url,original=null)=>({text,author,work,url,...(original?{original,translation:'节译'}:{})});
const sunzi='https://zh.wikisource.org/zh-hant/孫子';
const laozi='https://zh.wikisource.org/zh-hans/道德經_(王弼本)';
const xunzi='https://zh.wikisource.org/wiki/劝学';
export const technologyQuotes={
 Automation_Control:q('君子生非异也，善假于物也。','荀子','《荀子·劝学》','https://zh.wikisource.org/wiki/荀子/勸學篇'),
 Ecological_Engineering:q('万物并作，吾以观复。','老子','《道德经》·第十六章',laozi),
 Energy_Tech:q('有一个量，我们称它为能量；自然界历经种种变化，它却保持不变。','理查德·费曼','《费曼物理学讲义》第一卷·第四章','https://www.feynmanlectures.caltech.edu/I_04.html','a certain quantity, which we call energy, that does not change in the manifold changes which nature undergoes.'),
 Laser_Tech:q('物体与光，难道不能相互转化吗？','艾萨克·牛顿','《光学》·疑问30','https://inters.org/newton-opticks-queries','Are not gross Bodies and Light convertible into one another'),
 Ion_Tech:q('只要符合自然规律，再奇妙的事也可能是真的。','迈克尔·法拉第','实验日记，1849年3月19日','https://calteches.library.caltech.edu/619/2/Thomas.pdf','Nothing is too wonderful to be true, if it be consistent with the laws of nature.'),
 Hyperspace_Tech:q('乘天地之正，而御六气之辩，以游无穷。','庄子','《庄子·逍遥游》','https://zh.wikisource.org/zh-hans/莊子/逍遙遊'),
 Plasma_Tech:q('永恒的活火，依一定尺度燃起，依一定尺度熄灭。','赫拉克利特','《残篇》B30','https://en.wikisource.org/wiki/Fragments_of_Heraclitus','an ever-living Fire, with measures of it kindling, and measures going out.'),
 Espionage_Tech:q('知彼知己，百战不殆。','孙子','《孙子兵法·谋攻》',sunzi),
 Computer_Tech:q('分析机编织代数图样，正如雅卡尔织机编织花与叶。','阿达·洛夫莱斯','《分析机概论》译者注A','https://www.fourmilab.ch/babbage/sketch.html','the Analytical Engine weaves algebraical patterns just as the Jacquard-loom weaves flowers and leaves.'),
 Astrophysics_Tech:q('头顶的星空，心中的道德律。','伊曼努尔·康德','《实践理性批判》·结论','https://www.gutenberg.org/cache/epub/5683/pg5683-images.html','the starry heavens above and the moral law within.'),
 Combustion_Drive:q('千里之行，始于足下。','老子','《道德经》·第六十四章',laozi),
 Impulse_Drive:q('每一个作用，总有一个相等而相反的反作用。','艾萨克·牛顿','《自然哲学的数学原理》·运动第三定律','https://www.gutenberg.org/cache/epub/76404/pg76404-images.html','To every action there is always opposed an equal reaction'),
 Hyperspace_Drive:q('俱怀逸兴壮思飞，欲上青天览明月。','李白','《宣州谢朓楼饯别校书叔云》','https://zh.wikisource.org/zh-hant/宣州謝朓樓餞別校書叔雲'),
 Weapons_Tech:q('战争无非是政治通过另一种手段的继续。','卡尔·冯·克劳塞维茨','《战争论》·第一篇第一章','https://www.gutenberg.org/files/1946/1946-h/1946-h.htm','War is a mere continuation of policy by other means.'),
 Shielding_Tech:q('先为不可胜，以待敌之可胜。','孙子','《孙子兵法·军形》',sunzi),
 Strength_Tech:q('锲而不舍，金石可镂。','荀子','《荀子·劝学》',xunzi),
 Intergalactic_Network:q('三人行，必有我师焉。','孔子','《论语·述而》','https://zh.wikisource.org/zh-hans/論語/述而第七'),
 Graviton_Tech:q('它是用数学的语言写成的。','伽利略·伽利莱','《试金者》·论宇宙之书','https://web.stanford.edu/~jsabol/certainty/readings/Galileo-Assayer.pdf','It is written in the language of mathematics'),
 Advanced_Ship_Engineering:q('力学是数学的乐园，因为在这里我们获得数学的果实。','列奥纳多·达·芬奇','《艺术与人生随想》','https://www.gutenberg.org/cache/epub/29904/pg29904-images.html','Mechanics are the paradise of scientific mathematics, because with them we arrive at the fruits of mathematics.'),
 Quantum_Command:q('治众如治寡，分数是也。','孙子','《孙子兵法·兵势》',sunzi),
 Metamaterial_Tech:q('青，取之于蓝，而青于蓝。','荀子','《荀子·劝学》',xunzi),
 Phase_Energy:q('有无相生，难易相成。','老子','《道德经》·第二章',laozi),
 Antimatter_Containment:q('这些恒星会主要由正电子和负质子构成。','保罗·狄拉克','1933年诺贝尔演讲·反物质恒星的设想','https://www.nobelprize.org/uploads/2018/06/dirac-lecture.pdf','these stars being built up mainly of positrons and negative protons.')
};
