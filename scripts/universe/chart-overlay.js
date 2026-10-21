import {chartRoute,routePoint} from './chart-routes.js';
import {fleetColors} from '../../client/command-ui/fleet-map.mjs';

const NS='http://www.w3.org/2000/svg';
function svg(name,attributes={}){const element=document.createElementNS(NS,name);for(const [key,value]of Object.entries(attributes))element.setAttribute(key,value);return element;}

export function createChartOverlay(world){
  const overlay=svg('svg',{'class':'universe-chart-overlay','aria-hidden':'true'}),routes=svg('g'),homeMarker=svg('g');
  const pulses=[svg('circle'),svg('circle')],square=svg('rect',{x:-11,y:-11,width:22,height:22}),core=svg('circle',{r:4});
  homeMarker.classList.add('universe-home-marker');homeMarker.append(...pulses,square,core);overlay.append(routes,homeMarker);world.host.insertBefore(overlay,world.labels);
  const tip=document.createElement('div');tip.id='universe-home-tip';tip.className='universe-home-tip';tip.setAttribute('role','tooltip');tip.hidden=true;
  const title=document.createElement('b'),meta=document.createElement('small'),tag=document.createElement('span');tag.className='home-tip-tag';tip.append(title,meta,tag);world.host.append(tip);
  const pool=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const plan=svg('g',{'class':'chart-fleet-plan'}),glow=svg('path',{'class':'chart-plan-glow'}),line=svg('path',{'class':'chart-plan-line'});
  const markers=['出发','到达'].map(name=>{
    const group=svg('g'),halo=svg('circle',{'class':'chart-plan-halo'}),ring=svg('circle',{'class':'chart-plan-ring'}),label=svg('text',{'text-anchor':'middle'});
    label.textContent=name;group.append(halo,ring,label);return {group,halo,ring,label,name};
  });
  plan.append(glow,line,...markers.map(m=>m.group));overlay.append(plan);
  function updatePlan(n,time){
    const draft=world.fleetPlan;plan.style.display=draft?'':'none';if(!draft)return;
    plan.style.color=fleetColors[draft.task];
    const from=world.body(draft.from),to=draft.destinationSet?(draft.task==='explore'?{position:[0,0,0],name:'银心'}:world.body(draft.target||draft.position.join(':'))):null;
    const strategic=n.level==='galaxy';
    const project=body=>{
      if(!body)return null;
      const star=strategic&&body.coordinates?n.systems.find(s=>s.id===body.coordinates[1]):null;
      return world.project(star?.position||body.position,strategic?0:body.radius||0);
    };
    const points=[project(from),project(to)];
    markers.forEach((marker,i)=>{
      const p=points[i];marker.group.style.display=p&&p.depth>0?'':'none';if(!p||p.depth<=0)return;
      const radius=Math.max(15,Math.min(80,(p.radius||0)+9));
      marker.group.setAttribute('transform',`translate(${p.x} ${p.y})`);
      marker.ring.setAttribute('r',radius);marker.halo.setAttribute('r',radius+5);
      marker.label.setAttribute('y',-radius-12);marker.label.textContent=marker.name;
      marker.group.classList.toggle('is-picking',draft.pick===(i?'to':'from'));
    });
    const [a,b]=points,visible=a&&b&&a.depth>0&&b.depth>0&&Math.hypot(b.x-a.x,b.y-a.y)>10;
    for(const path of [glow,line])path.style.display=visible?'':'none';
    if(visible){
      const bend=.12,c={x:(a.x+b.x)/2-(b.y-a.y)*bend,y:(a.y+b.y)/2+(b.x-a.x)*bend};
      const d=`M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`;
      glow.setAttribute('d',d);line.setAttribute('d',d);line.style.strokeDashoffset=String(-time*9);
    }else if(a&&b&&a.depth>0&&b.depth>0){markers[0].label.textContent='出发 / 到达';markers[1].group.style.display='none';}
  }
  function updateRoutes(n,time){
    const used=new Set();
    if(!n.missionFollow&&!n.combatCamera&&!world.previewId){
      for(const mission of n.missions){
        const route=chartRoute(n,mission,Date.now()+world.nowOffset);if(!route)continue;
        const a=world.project(route.from),b=world.project(route.to);
        if(a.depth<=0||b.depth<=0||Math.hypot(b.x-a.x,b.y-a.y)<8)continue;
        const c={x:(a.x+b.x)/2-(b.y-a.y)*route.bend,y:(a.y+b.y)/2+(b.x-a.x)*route.bend};
        const end=routePoint(a,b,c,route.limit),control={x:a.x+(c.x-a.x)*route.limit,y:a.y+(c.y-a.y)*route.limit};
        let item=pool.get(route.id);
        if(!item){const group=svg('g'),base=svg('path',{'class':'chart-route-base'}),dash=svg('path',{'class':'chart-route-dash'}),arrow=svg('path',{'class':'chart-route-arrow',d:'M 7 0 L -5 -3.5 L -2 0 L -5 3.5 Z'});group.append(base,dash,arrow);routes.append(group);item={group,base,dash,arrow};pool.set(route.id,item);}
        used.add(route.id);item.group.style.color=route.color;
        const path=`M ${a.x} ${a.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;
        item.base.setAttribute('d',path);item.dash.setAttribute('d',path);item.dash.style.strokeDashoffset=String(time*9*(route.returning?1:-1));
        // Close-up views retain the real fleet marker instead of a schematic arrow.
        item.arrow.style.display=n.level==='galaxy'?'':'none';
        if(n.level!=='galaxy')continue;
        const t=route.progress,p=routePoint(a,b,c,t),angle=Math.atan2((1-t)*(c.y-a.y)+t*(b.y-c.y),(1-t)*(c.x-a.x)+t*(b.x-c.x))*180/Math.PI+(route.returning?180:0);
        item.arrow.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${angle})`);
        const active=[n.hover,n.labelHover,document.activeElement?.target].some(hit=>hit?.type==='mission'&&hit.id===route.id);item.group.classList.toggle('is-active',active);
        // The strategic label follows the route glyph; close-up ship/camera positions are untouched.
        const existing=n.screen.find(hit=>hit.type==='mission'&&hit.id===route.id);
        n.screen=n.screen.filter(hit=>!(hit.type==='mission'&&hit.id===route.id));
        if(p.x>=0&&p.x<=world.width&&p.y>=0&&p.y<=world.height)n.screen.push({...existing,id:route.id,type:'mission',chartRoute:true,name:route.name,x:p.x,y:p.y,depth:a.depth+(b.depth-a.depth)*t,radius:13,position:existing?.position||route.from});
      }
    }
    for(const [id,item]of pool)if(!used.has(id)){item.group.remove();pool.delete(id);}
  }
  function updateHome(n,time){
    const marker=n.screen.find(p=>p.home),home=world.body(n.homePlanetId);
    const visible=!!marker&&!n.missionFollow&&!n.combatCamera&&!world.previewId;
    homeMarker.style.display=visible?'':'none';
    if(!visible){tip.hidden=true;return;}
    homeMarker.setAttribute('transform',`translate(${marker.x} ${marker.y})`);
    pulses.forEach((circle,k)=>{const phase=(time*.5+k*.5)%1;circle.setAttribute('r',8+phase*22);circle.style.opacity=String((1-phase)*.7);});
    square.setAttribute('transform',`rotate(${45+time*.4*180/Math.PI})`);
    const focus=document.activeElement,over=n.labelHover||n.hover;
    const focused=focus?.target?.home&&!focus.hidden;
    const hovered=over?.type===marker.type&&over.id===marker.id;
    tip.hidden=!(focused||hovered);
    if(tip.hidden)return;
    title.textContent='◆ '+home.name;
    meta.textContent=home.coordinates.join(':')+' · '+(n.level==='galaxy'?'母星所在':({terrestrial:'类地行星',mercury:'金属岩星',mars:'火星岩星',gas:'气态巨星'}[home.biome]||'母星'));
    tag.textContent=home.ownerName;
    const label=world.labelPool.find(element=>element.target?.home&&!element.hidden),rect=label?.getBoundingClientRect(),host=world.host.getBoundingClientRect();
    const anchor=rect?{left:rect.left-host.left,top:rect.top-host.top,bottom:rect.bottom-host.top}:{left:marker.x+24,top:marker.y,bottom:marker.y+16};
    const x=Math.max(10,Math.min(anchor.left,world.width-tip.offsetWidth-10));
    const below=anchor.bottom+8,y=Math.max(10,below+tip.offsetHeight<=world.height-10?below:anchor.top-tip.offsetHeight-8);
    tip.style.left=x+'px';tip.style.top=y+'px';
  }
  return {update(){const n=world.navigation,time=reduced?0:n.time;overlay.setAttribute('viewBox',`0 0 ${world.width} ${world.height}`);updateRoutes(n,time);updateHome(n,time);updatePlan(n,time);},dispose(){overlay.remove();tip.remove();pool.clear();}};
}
