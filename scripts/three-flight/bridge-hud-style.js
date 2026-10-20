export const bridgeHUDStyles=`
#bridge-flight-hud [hidden],#bridge-flight-hud[hidden]{display:none!important}
#bridge-flight-hud{position:fixed;inset:0;z-index:27;pointer-events:none;color:#bde4ed;font:12px 'Bahnschrift','Microsoft YaHei',sans-serif}
#bridge-flight-hud header{position:absolute;top:90px;left:28px;text-shadow:0 2px 6px #000}
#bridge-flight-hud header small{font:10px Consolas;letter-spacing:2px;color:#88b9cc}
#bridge-flight-hud h2{font-size:22px;letter-spacing:2px;margin:9px 0}
#bridge-flight-hud header span{font-size:11px;color:#9dc2ce}
#bridge-flight-hud[data-cabin=horizon][data-external=false] header,#bridge-flight-hud[data-cabin=horizon][data-external=false] .b-threat{display:none}
#bridge-flight-hud footer{position:absolute;bottom:16px;left:28px;right:28px;display:flex;align-items:center;gap:24px;color:#8ab1c1;font-size:11px}
#bridge-flight-hud footer>span{margin-right:auto}
#bridge-flight-hud button{pointer-events:auto;color:#bde4ed;border:0;background:#081923b3;padding:8px 10px;font:inherit;cursor:pointer}
#bridge-flight-hud button:hover{background:#254550;color:#fff}
#bridge-flight-hud button:disabled{opacity:.4;cursor:default}
.b-glass-target{position:absolute;width:100px;height:70px;transform:translate(-50%,-50%);color:#ffc393;filter:drop-shadow(0 0 4px #ed8d5835)}
.b-glass-target>i{position:absolute;width:19px;height:15px;border-color:currentColor;border-style:solid;border-width:0}
.b-glass-target>i:nth-child(1){left:0;top:0;border-left-width:1px;border-top-width:1px}.b-glass-target>i:nth-child(2){right:0;top:0;border-right-width:1px;border-top-width:1px}.b-glass-target>i:nth-child(3){left:0;bottom:0;border-left-width:1px;border-bottom-width:1px}.b-glass-target>i:nth-child(4){right:0;bottom:0;border-right-width:1px;border-bottom-width:1px}
.b-glass-target.aligned{color:#ff8e7c}.b-target-caption{position:absolute;left:112px;top:-7px;min-width:170px;text-shadow:0 1px 4px #000}
.b-glass-target.caption-left .b-target-caption{left:auto;right:112px;text-align:right}.b-glass-target.caption-left .b-target-health{margin-left:auto}
.b-target-caption small{display:block;font:9px Consolas,'Microsoft YaHei';letter-spacing:1.5px}.b-target-caption strong{display:block;font-size:13px;letter-spacing:1px;margin:7px 0}.b-target-caption span{font:11px Consolas,'Microsoft YaHei';color:#b8cdd1}
.b-target-health{width:115px;height:2px;background:#e2a78825;margin-top:9px}.b-target-health b{display:block;height:100%;background:currentColor}
.b-offscreen{position:absolute;top:23%;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:10px;font-size:12px;color:#ffd0a2;text-shadow:0 1px 5px #000}.b-offscreen>span:first-child{font-size:26px}
.b-threat{position:absolute;top:106px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:14px;min-width:300px;padding:12px 18px;color:#ffba81;border-block:1px solid #ffb27766;background:linear-gradient(90deg,transparent,#241b14e8 20%,#241b14e8 80%,transparent)}
.b-threat small{font:9px Consolas,'Microsoft YaHei';letter-spacing:2px}.b-threat strong{display:block;font-size:16px;letter-spacing:2px;margin:5px 0}.b-threat span{font-size:10px;color:#cfa794}.b-threat>b{margin-left:auto;font:24px Consolas;white-space:nowrap}.b-threat-symbol{font:25px Consolas;border:1px solid currentColor;width:32px;height:32px;text-align:center;clip-path:polygon(20% 0,80% 0,100% 20%,100% 80%,80% 100%,20% 100%,0 80%,0 20%)}
.b-threat.critical{color:#ff8275;border-color:#ff8275;animation:bridge-warning 1.2s ease-in-out infinite}
.b-threat-bearing{position:absolute;left:50%;top:46%;width:290px;height:290px;border-radius:50%;border:1px solid transparent;border-top-color:#ff8e71a0}.b-threat-bearing i{position:absolute;left:calc(50% - 5px);top:-4px;border-bottom:8px solid #ff9f80;border-left:5px solid transparent;border-right:5px solid transparent}
@keyframes bridge-warning{50%{filter:brightness(1.25)}}
body.bridge-hud-active #map-pilot-hud,body.bridge-hud-active>.topbar,body.bridge-hud-active>.bottom-bar,body.bridge-hud-active #formation-labels{display:none!important}
body.bridge-hud-active #map-combat-bar{top:12px;bottom:auto;z-index:30}
body.bridge-hud-active #flight>*:not(#flight-notice):not(.scene-controls):not(#death-controls){visibility:hidden!important}
body.bridge-hud-active #flight-notice{top:19%;bottom:auto;z-index:32}body.bridge-hud-active .scene-controls{top:12px}
@media(max-width:1300px){#bridge-flight-hud header{top:80px}#bridge-flight-hud h2{font-size:18px}#bridge-flight-hud footer{gap:10px;font-size:10px;left:20px;right:20px}.b-threat{top:83px;min-width:260px;padding:9px 12px}.b-target-caption{left:105px;min-width:140px;font-size:10px}}
@media(prefers-reduced-motion:reduce){.b-threat.critical{animation:none}}
`;
