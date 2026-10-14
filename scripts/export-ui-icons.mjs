import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Box,Diamond,Droplet,Zap,CircleDot,Globe,Orbit,Ship,FlaskConical,Users,MessageSquare,Hammer,Move,Ellipsis,Settings,Building2,Minus,Plus,ChevronDown} from 'lucide-react';
import fs from 'node:fs';
const icons={metal:Box,crystal:Diamond,gas:Droplet,energy:Zap,matter:CircleDot,planet:Globe,galaxy:Orbit,ship:Ship,research:FlaskConical,fleet:Users,reports:MessageSquare,build:Hammer,move:Move,more:Ellipsis,settings:Settings,building:Building2,minus:Minus,plus:Plus,down:ChevronDown};
for(const directory of ['opendesign/mockups/galaxy-empire/assets/ui-modern']){
  fs.mkdirSync(directory,{recursive:true});
  for(const [name,icon] of Object.entries(icons))fs.writeFileSync(`${directory}/${name}.svg`,renderToStaticMarkup(React.createElement(icon,{size:32,color:'#e5ecec',strokeWidth:1.4})));
}
