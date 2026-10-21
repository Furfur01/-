const pages={galaxy:'Orbit',buildings:'Building2',defense:'Shield',shipyard:'Wrench',research:'Atom',fleet:'Navigation',hangar:'Box',battle:'Crosshair',reports:'FileText',empire:'Landmark',logistics:'Route',moon:'Moon',missiles:'Rocket',rankings:'ChartNoAxesColumnIncreasing',alliance:'Handshake',chat:'MessagesSquare',shop:'Gem',settings:'SlidersHorizontal'};
const panels={colonies:'Building2',orbits:'Orbit',view:'ScanEye'};
const NS='http://www.w3.org/2000/svg';

// Local Lucide glyphs. Existing button labels, actions, order and hit areas stay in place.
export function installChartControls(){
  for(const button of document.querySelectorAll('.bottom-bar nav>button,#chart-tools>button')){
    if(button.querySelector('.chart-button-icon'))continue;
    const name=pages[button.dataset.page]||panels[button.dataset.chartPanel]||(button.dataset.chart==='back'?'ArrowLeft':null);
    if(!name)continue;
    const icon=document.createElementNS(NS,'svg'),use=document.createElementNS(NS,'use');
    icon.classList.add('chart-button-icon');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');icon.setAttribute('focusable','false');
    use.setAttribute('href','/opendesign/mockups/galactic-command/assets/chart-icons.svg#'+name);icon.append(use);
    if(button.dataset.chart==='back')for(const node of button.childNodes)if(node.nodeType===Node.TEXT_NODE&&node.textContent.trim()==='↶')node.textContent='';
    button.prepend(icon);
  }
}
