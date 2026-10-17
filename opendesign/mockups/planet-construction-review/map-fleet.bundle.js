function He(n={}){return n.role==="fighter"||!n.role&&!(n.length>=10)?"fighter":n.length>=50?"bastion":"horizon"}function Bn(n){let t=He(n);return{kind:t,turn:Math.min(n.turn||.45,t==="fighter"?3:t==="bastion"?.22:.38),acceleration:t==="fighter"?.7:t==="bastion"?.12:.22,braking:t==="fighter"?1:t==="bastion"?.18:.3}}function Co(n,t){let e=(s,r)=>(n.has(s)?1:0)-(n.has(r)?1:0),i=He(t)==="fighter";return{throttle:e("KeyW","KeyS"),yaw:i?e("ArrowRight","ArrowLeft"):e("KeyD","KeyA"),pitch:i?e("KeyQ","KeyE")+e("ArrowUp","ArrowDown"):0,roll:i?e("KeyD","KeyA"):0}}function lr(n){return{eye:n==="bastion"?[0,3.75,2]:n==="horizon"?[0,3.8,-1]:[0,0,0],yaw:0,pitch:0}}var Wc=0,ll=1,Xc=2;var Gs=1,qc=2,hs=3,hi=0,Ve=1,Ee=2,ei=0,Bi=1,In=2,cl=3,hl=4,pa=5;var ui=100,Yc=101,Zc=102,Jc=103,jc=104,Kc=200,ma=201,$c=202,Qc=203,bn=204,Qi=205,th=206,eh=207,ih=208,nh=209,sh=210,rh=211,ah=212,oh=213,lh=214,Ur=0,Or=1,ts=2,Sn=3,Br=4,kr=5,zr=6,Vr=7,ul=0,ch=1,hh=2,je=0,dl=1,fl=2,pl=3,ml=4,gl=5,xl=6,yl=7;var vl=300,hn=301,Pn=302,ga=303,xa=304,Ws=306,es=1e3,_i=1001,Hr=1002,Ie=1003,uh=1004;var Xs=1005;var we=1006,ya=1007;var Ai=1008;var Ke=1009,_l=1010,Ml=1011,us=1012,va=1013,pi=1014,ii=1015,Ci=1016,_a=1017,Ma=1018,ds=1020,bl=35902,Sl=35899,wl=1021,El=1022,ni=1023,Mi=1026,un=1027,ba=1028,Sa=1029,dn=1030,wa=1031;var Ea=1033,qs=33776,Ys=33777,Zs=33778,Js=33779,Ta=35840,Aa=35841,Ca=35842,Ra=35843,Ia=36196,Pa=37492,La=37496,Da=37488,Fa=37489,js=37490,Na=37491,Ua=37808,Oa=37809,Ba=37810,ka=37811,za=37812,Va=37813,Ha=37814,Ga=37815,Wa=37816,Xa=37817,qa=37818,Ya=37819,Za=37820,Ja=37821,ja=36492,Ka=36494,$a=36495,Qa=36283,to=36284,Ks=36285,eo=36286;var Es=2300,Gr=2301,Fr=2302,Qo=2303,tl=2400,el=2401,il=2402;var dh=3200;var Tl=0,fh=1,si="",Ze="srgb",wn="srgb-linear",Ts="linear",re="srgb";var Mn=7680;var nl=519,ph=512,mh=513,gh=514,io=515,xh=516,yh=517,no=518,vh=519,Wr=35044,so=35048;var Al="300 es",ci=2e3,As=2001;function ju(n){for(let t=n.length-1;t>=0;--t)if(n[t]>=65535)return!0;return!1}function Ku(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function is(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function _h(){let n=is("canvas");return n.style.display="block",n}var mc={},ns=null;function Cs(...n){let t="THREE."+n.shift();ns?ns("log",t,...n):console.log(t,...n)}function Mh(n){let t=n[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=n[1];e&&e.isStackTrace?n[0]+=" "+e.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function Ft(...n){n=Mh(n);let t="THREE."+n.shift();if(ns)ns("warn",t,...n);else{let e=n[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...n)}}function Nt(...n){n=Mh(n);let t="THREE."+n.shift();if(ns)ns("error",t,...n);else{let e=n[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...n)}}function Xr(...n){let t=n.join(" ");t in mc||(mc[t]=!0,Ft(...n))}function bh(n,t,e){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(t,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:i()}}setTimeout(r,e)})}var Sh={[Ur]:Or,[ts]:zr,[Br]:Vr,[Sn]:kr,[Or]:Ur,[zr]:ts,[Vr]:Br,[kr]:Sn},bi=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){let i=this._listeners;if(i===void 0)return;let s=i[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let i=e[t.type];if(i!==void 0){t.target=this;let s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},De=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Ro=Math.PI/180,qr=180/Math.PI;function $i(){let n=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(De[n&255]+De[n>>8&255]+De[n>>16&255]+De[n>>24&255]+"-"+De[t&255]+De[t>>8&255]+"-"+De[t>>16&15|64]+De[t>>24&255]+"-"+De[e&63|128]+De[e>>8&255]+"-"+De[e>>16&255]+De[e>>24&255]+De[i&255]+De[i>>8&255]+De[i>>16&255]+De[i>>24&255]).toLowerCase()}function jt(n,t,e){return Math.max(t,Math.min(e,n))}function $u(n,t){return(n%t+t)%t}function Io(n,t,e){return(1-e)*n+e*t}function vi(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function ce(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var ne=class n{static{n.prototype.isVector2=!0}constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,s=t.elements;return this.x=s[0]*e+s[3]*i+s[6],this.y=s[1]*e+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=jt(this.x,t.x,e.x),this.y=jt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=jt(this.x,t,e),this.y=jt(this.y,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(jt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(jt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*i-a*s+t.x,this.y=r*s+a*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Si=class{constructor(t=0,e=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=s}static slerpFlat(t,e,i,s,r,a,u){let m=i[s+0],x=i[s+1],M=i[s+2],y=i[s+3],h=r[a+0],o=r[a+1],l=r[a+2],p=r[a+3];if(y!==p||m!==h||x!==o||M!==l){let c=m*h+x*o+M*l+y*p;c<0&&(h=-h,o=-o,l=-l,p=-p,c=-c);let f=1-u;if(c<.9995){let E=Math.acos(c),_=Math.sin(E);f=Math.sin(f*E)/_,u=Math.sin(u*E)/_,m=m*f+h*u,x=x*f+o*u,M=M*f+l*u,y=y*f+p*u}else{m=m*f+h*u,x=x*f+o*u,M=M*f+l*u,y=y*f+p*u;let E=1/Math.sqrt(m*m+x*x+M*M+y*y);m*=E,x*=E,M*=E,y*=E}}t[e]=m,t[e+1]=x,t[e+2]=M,t[e+3]=y}static multiplyQuaternionsFlat(t,e,i,s,r,a){let u=i[s],m=i[s+1],x=i[s+2],M=i[s+3],y=r[a],h=r[a+1],o=r[a+2],l=r[a+3];return t[e]=u*l+M*y+m*o-x*h,t[e+1]=m*l+M*h+x*y-u*o,t[e+2]=x*l+M*o+u*h-m*y,t[e+3]=M*l-u*y-m*h-x*o,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,s){return this._x=t,this._y=e,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,s=t._y,r=t._z,a=t._order,u=Math.cos,m=Math.sin,x=u(i/2),M=u(s/2),y=u(r/2),h=m(i/2),o=m(s/2),l=m(r/2);switch(a){case"XYZ":this._x=h*M*y+x*o*l,this._y=x*o*y-h*M*l,this._z=x*M*l+h*o*y,this._w=x*M*y-h*o*l;break;case"YXZ":this._x=h*M*y+x*o*l,this._y=x*o*y-h*M*l,this._z=x*M*l-h*o*y,this._w=x*M*y+h*o*l;break;case"ZXY":this._x=h*M*y-x*o*l,this._y=x*o*y+h*M*l,this._z=x*M*l+h*o*y,this._w=x*M*y-h*o*l;break;case"ZYX":this._x=h*M*y-x*o*l,this._y=x*o*y+h*M*l,this._z=x*M*l-h*o*y,this._w=x*M*y+h*o*l;break;case"YZX":this._x=h*M*y+x*o*l,this._y=x*o*y+h*M*l,this._z=x*M*l-h*o*y,this._w=x*M*y-h*o*l;break;case"XZY":this._x=h*M*y-x*o*l,this._y=x*o*y-h*M*l,this._z=x*M*l+h*o*y,this._w=x*M*y+h*o*l;break;default:Ft("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],s=e[4],r=e[8],a=e[1],u=e[5],m=e[9],x=e[2],M=e[6],y=e[10],h=i+u+y;if(h>0){let o=.5/Math.sqrt(h+1);this._w=.25/o,this._x=(M-m)*o,this._y=(r-x)*o,this._z=(a-s)*o}else if(i>u&&i>y){let o=2*Math.sqrt(1+i-u-y);this._w=(M-m)/o,this._x=.25*o,this._y=(s+a)/o,this._z=(r+x)/o}else if(u>y){let o=2*Math.sqrt(1+u-i-y);this._w=(r-x)/o,this._x=(s+a)/o,this._y=.25*o,this._z=(m+M)/o}else{let o=2*Math.sqrt(1+y-i-u);this._w=(a-s)/o,this._x=(r+x)/o,this._y=(m+M)/o,this._z=.25*o}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(jt(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let s=Math.min(1,e/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,s=t._y,r=t._z,a=t._w,u=e._x,m=e._y,x=e._z,M=e._w;return this._x=i*M+a*u+s*x-r*m,this._y=s*M+a*m+r*u-i*x,this._z=r*M+a*x+i*m-s*u,this._w=a*M-i*u-s*m-r*x,this._onChangeCallback(),this}slerp(t,e){let i=t._x,s=t._y,r=t._z,a=t._w,u=this.dot(t);u<0&&(i=-i,s=-s,r=-r,a=-a,u=-u);let m=1-e;if(u<.9995){let x=Math.acos(u),M=Math.sin(x);m=Math.sin(m*x)/M,e=Math.sin(e*x)/M,this._x=this._x*m+i*e,this._y=this._y*m+s*e,this._z=this._z*m+r*e,this._w=this._w*m+a*e,this._onChangeCallback()}else this._x=this._x*m+i*e,this._y=this._y*m+s*e,this._z=this._z*m+r*e,this._w=this._w*m+a*e,this.normalize();return this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},W=class n{static{n.prototype.isVector3=!0}constructor(t=0,e=0,i=0){this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(gc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(gc.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*s,this.y=r[1]*e+r[4]*i+r[7]*s,this.z=r[2]*e+r[5]*i+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,i=this.y,s=this.z,r=t.x,a=t.y,u=t.z,m=t.w,x=2*(a*s-u*i),M=2*(u*e-r*s),y=2*(r*i-a*e);return this.x=e+m*x+a*y-u*M,this.y=i+m*M+u*x-r*y,this.z=s+m*y+r*M-a*x,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*s,this.y=r[1]*e+r[5]*i+r[9]*s,this.z=r[2]*e+r[6]*i+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=jt(this.x,t.x,e.x),this.y=jt(this.y,t.y,e.y),this.z=jt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=jt(this.x,t,e),this.y=jt(this.y,t,e),this.z=jt(this.z,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(jt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,s=t.y,r=t.z,a=e.x,u=e.y,m=e.z;return this.x=s*m-r*u,this.y=r*a-i*m,this.z=i*u-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return Po.copy(this).projectOnVector(t),this.sub(Po)}reflect(t){return this.sub(Po.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(jt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return e*e+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let s=Math.sin(e)*t;return this.x=s*Math.sin(i),this.y=Math.cos(e)*t,this.z=s*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Po=new W,gc=new Si,zt=class n{static{n.prototype.isMatrix3=!0}constructor(t,e,i,s,r,a,u,m,x){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,a,u,m,x)}set(t,e,i,s,r,a,u,m,x){let M=this.elements;return M[0]=t,M[1]=s,M[2]=u,M[3]=e,M[4]=r,M[5]=m,M[6]=i,M[7]=a,M[8]=x,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,r=this.elements,a=i[0],u=i[3],m=i[6],x=i[1],M=i[4],y=i[7],h=i[2],o=i[5],l=i[8],p=s[0],c=s[3],f=s[6],E=s[1],_=s[4],v=s[7],A=s[2],P=s[5],C=s[8];return r[0]=a*p+u*E+m*A,r[3]=a*c+u*_+m*P,r[6]=a*f+u*v+m*C,r[1]=x*p+M*E+y*A,r[4]=x*c+M*_+y*P,r[7]=x*f+M*v+y*C,r[2]=h*p+o*E+l*A,r[5]=h*c+o*_+l*P,r[8]=h*f+o*v+l*C,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],a=t[4],u=t[5],m=t[6],x=t[7],M=t[8];return e*a*M-e*u*x-i*r*M+i*u*m+s*r*x-s*a*m}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],a=t[4],u=t[5],m=t[6],x=t[7],M=t[8],y=M*a-u*x,h=u*m-M*r,o=x*r-a*m,l=e*y+i*h+s*o;if(l===0)return this.set(0,0,0,0,0,0,0,0,0);let p=1/l;return t[0]=y*p,t[1]=(s*x-M*i)*p,t[2]=(u*i-s*a)*p,t[3]=h*p,t[4]=(M*e-s*m)*p,t[5]=(s*r-u*e)*p,t[6]=o*p,t[7]=(i*m-x*e)*p,t[8]=(a*e-i*r)*p,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,s,r,a,u){let m=Math.cos(r),x=Math.sin(r);return this.set(i*m,i*x,-i*(m*a+x*u)+a+t,-s*x,s*m,-s*(-x*a+m*u)+u+e,0,0,1),this}scale(t,e){return this.premultiply(Lo.makeScale(t,e)),this}rotate(t){return this.premultiply(Lo.makeRotation(-t)),this}translate(t,e){return this.premultiply(Lo.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<9;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Lo=new zt,xc=new zt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),yc=new zt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Qu(){let n={enabled:!0,workingColorSpace:wn,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===re&&(s.r=Oi(s.r),s.g=Oi(s.g),s.b=Oi(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===re&&(s.r=Qn(s.r),s.g=Qn(s.g),s.b=Qn(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===si?Ts:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Xr("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Xr("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[wn]:{primaries:t,whitePoint:i,transfer:Ts,toXYZ:xc,fromXYZ:yc,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Ze},outputColorSpaceConfig:{drawingBufferColorSpace:Ze}},[Ze]:{primaries:t,whitePoint:i,transfer:re,toXYZ:xc,fromXYZ:yc,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Ze}}}),n}var Zt=Qu();function Oi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Qn(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var kn,Yr=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{kn===void 0&&(kn=is("canvas")),kn.width=t.width,kn.height=t.height;let s=kn.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),i=kn}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=is("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let s=i.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Oi(r[a]/255)*255;return i.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(Oi(e[i]/255)*255):e[i]=Oi(e[i]);return{data:e,width:t.width,height:t.height}}else return Ft("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},td=0,ss=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:td++}),this.uuid=$i(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,u=s.length;a<u;a++)s[a].isDataTexture?r.push(Do(s[a].image)):r.push(Do(s[a]))}else r=Do(s);i.url=r}return e||(t.images[this.uuid]=i),i}};function Do(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Yr.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Ft("Texture: Unable to serialize Texture."),{})}var ed=0,Fo=new W,Ne=class n extends bi{constructor(t=n.DEFAULT_IMAGE,e=n.DEFAULT_MAPPING,i=_i,s=_i,r=we,a=Ai,u=ni,m=Ke,x=n.DEFAULT_ANISOTROPY,M=si){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ed++}),this.uuid=$i(),this.name="",this.source=new ss(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=x,this.format=u,this.internalFormat=null,this.type=m,this.offset=new ne(0,0),this.repeat=new ne(1,1),this.center=new ne(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new zt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=M,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Fo).x}get height(){return this.source.getSize(Fo).y}get depth(){return this.source.getSize(Fo).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let i=t[e];if(i===void 0){Ft(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Ft(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==vl)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case es:t.x=t.x-Math.floor(t.x);break;case _i:t.x=t.x<0?0:1;break;case Hr:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case es:t.y=t.y-Math.floor(t.y);break;case _i:t.y=t.y<0?0:1;break;case Hr:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Ne.DEFAULT_IMAGE=null;Ne.DEFAULT_MAPPING=vl;Ne.DEFAULT_ANISOTROPY=1;var ye=class n{static{n.prototype.isVector4=!0}constructor(t=0,e=0,i=0,s=1){this.x=t,this.y=e,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,s){return this.x=t,this.y=e,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*i+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,s,r,m=t.elements,x=m[0],M=m[4],y=m[8],h=m[1],o=m[5],l=m[9],p=m[2],c=m[6],f=m[10];if(Math.abs(M-h)<.01&&Math.abs(y-p)<.01&&Math.abs(l-c)<.01){if(Math.abs(M+h)<.1&&Math.abs(y+p)<.1&&Math.abs(l+c)<.1&&Math.abs(x+o+f-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let _=(x+1)/2,v=(o+1)/2,A=(f+1)/2,P=(M+h)/4,C=(y+p)/4,d=(l+c)/4;return _>v&&_>A?_<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(_),s=P/i,r=C/i):v>A?v<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),i=P/s,r=d/s):A<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(A),i=C/r,s=d/r),this.set(i,s,r,e),this}let E=Math.sqrt((c-l)*(c-l)+(y-p)*(y-p)+(h-M)*(h-M));return Math.abs(E)<.001&&(E=1),this.x=(c-l)/E,this.y=(y-p)/E,this.z=(h-M)/E,this.w=Math.acos((x+o+f-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=jt(this.x,t.x,e.x),this.y=jt(this.y,t.y,e.y),this.z=jt(this.z,t.z,e.z),this.w=jt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=jt(this.x,t,e),this.y=jt(this.y,t,e),this.z=jt(this.z,t,e),this.w=jt(this.w,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(jt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Zr=class extends bi{constructor(t=1,e=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:we,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new ye(0,0,t,e),this.scissorTest=!1,this.viewport=new ye(0,0,t,e),this.textures=[];let s={width:t,height:e,depth:i.depth},r=new Ne(s),a=i.count;for(let u=0;u<a;u++)this.textures[u]=r.clone(),this.textures[u].isRenderTargetTexture=!0,this.textures[u].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(t={}){let e={minFilter:we,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new ss(s)}return this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this.multiview=t.multiview,this}dispose(){this.dispatchEvent({type:"dispose"})}},ke=class extends Zr{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}},Rs=class extends Ne{constructor(t=null,e=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=Ie,this.minFilter=Ie,this.wrapR=_i,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Jr=class extends Ne{constructor(t=null,e=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=Ie,this.minFilter=Ie,this.wrapR=_i,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var se=class n{static{n.prototype.isMatrix4=!0}constructor(t,e,i,s,r,a,u,m,x,M,y,h,o,l,p,c){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,a,u,m,x,M,y,h,o,l,p,c)}set(t,e,i,s,r,a,u,m,x,M,y,h,o,l,p,c){let f=this.elements;return f[0]=t,f[4]=e,f[8]=i,f[12]=s,f[1]=r,f[5]=a,f[9]=u,f[13]=m,f[2]=x,f[6]=M,f[10]=y,f[14]=h,f[3]=o,f[7]=l,f[11]=p,f[15]=c,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return this.determinant()===0?(t.set(1,0,0),e.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinant()===0)return this.identity();let e=this.elements,i=t.elements,s=1/zn.setFromMatrixColumn(t,0).length(),r=1/zn.setFromMatrixColumn(t,1).length(),a=1/zn.setFromMatrixColumn(t,2).length();return e[0]=i[0]*s,e[1]=i[1]*s,e[2]=i[2]*s,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*a,e[9]=i[9]*a,e[10]=i[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,s=t.y,r=t.z,a=Math.cos(i),u=Math.sin(i),m=Math.cos(s),x=Math.sin(s),M=Math.cos(r),y=Math.sin(r);if(t.order==="XYZ"){let h=a*M,o=a*y,l=u*M,p=u*y;e[0]=m*M,e[4]=-m*y,e[8]=x,e[1]=o+l*x,e[5]=h-p*x,e[9]=-u*m,e[2]=p-h*x,e[6]=l+o*x,e[10]=a*m}else if(t.order==="YXZ"){let h=m*M,o=m*y,l=x*M,p=x*y;e[0]=h+p*u,e[4]=l*u-o,e[8]=a*x,e[1]=a*y,e[5]=a*M,e[9]=-u,e[2]=o*u-l,e[6]=p+h*u,e[10]=a*m}else if(t.order==="ZXY"){let h=m*M,o=m*y,l=x*M,p=x*y;e[0]=h-p*u,e[4]=-a*y,e[8]=l+o*u,e[1]=o+l*u,e[5]=a*M,e[9]=p-h*u,e[2]=-a*x,e[6]=u,e[10]=a*m}else if(t.order==="ZYX"){let h=a*M,o=a*y,l=u*M,p=u*y;e[0]=m*M,e[4]=l*x-o,e[8]=h*x+p,e[1]=m*y,e[5]=p*x+h,e[9]=o*x-l,e[2]=-x,e[6]=u*m,e[10]=a*m}else if(t.order==="YZX"){let h=a*m,o=a*x,l=u*m,p=u*x;e[0]=m*M,e[4]=p-h*y,e[8]=l*y+o,e[1]=y,e[5]=a*M,e[9]=-u*M,e[2]=-x*M,e[6]=o*y+l,e[10]=h-p*y}else if(t.order==="XZY"){let h=a*m,o=a*x,l=u*m,p=u*x;e[0]=m*M,e[4]=-y,e[8]=x*M,e[1]=h*y+p,e[5]=a*M,e[9]=o*y-l,e[2]=l*y-o,e[6]=u*M,e[10]=p*y+h}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(id,t,nd)}lookAt(t,e,i){let s=this.elements;return qe.subVectors(t,e),qe.lengthSq()===0&&(qe.z=1),qe.normalize(),Xi.crossVectors(i,qe),Xi.lengthSq()===0&&(Math.abs(i.z)===1?qe.x+=1e-4:qe.z+=1e-4,qe.normalize(),Xi.crossVectors(i,qe)),Xi.normalize(),cr.crossVectors(qe,Xi),s[0]=Xi.x,s[4]=cr.x,s[8]=qe.x,s[1]=Xi.y,s[5]=cr.y,s[9]=qe.y,s[2]=Xi.z,s[6]=cr.z,s[10]=qe.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,r=this.elements,a=i[0],u=i[4],m=i[8],x=i[12],M=i[1],y=i[5],h=i[9],o=i[13],l=i[2],p=i[6],c=i[10],f=i[14],E=i[3],_=i[7],v=i[11],A=i[15],P=s[0],C=s[4],d=s[8],b=s[12],R=s[1],L=s[5],g=s[9],w=s[13],T=s[2],S=s[6],I=s[10],D=s[14],U=s[3],B=s[7],z=s[11],k=s[15];return r[0]=a*P+u*R+m*T+x*U,r[4]=a*C+u*L+m*S+x*B,r[8]=a*d+u*g+m*I+x*z,r[12]=a*b+u*w+m*D+x*k,r[1]=M*P+y*R+h*T+o*U,r[5]=M*C+y*L+h*S+o*B,r[9]=M*d+y*g+h*I+o*z,r[13]=M*b+y*w+h*D+o*k,r[2]=l*P+p*R+c*T+f*U,r[6]=l*C+p*L+c*S+f*B,r[10]=l*d+p*g+c*I+f*z,r[14]=l*b+p*w+c*D+f*k,r[3]=E*P+_*R+v*T+A*U,r[7]=E*C+_*L+v*S+A*B,r[11]=E*d+_*g+v*I+A*z,r[15]=E*b+_*w+v*D+A*k,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],s=t[8],r=t[12],a=t[1],u=t[5],m=t[9],x=t[13],M=t[2],y=t[6],h=t[10],o=t[14],l=t[3],p=t[7],c=t[11],f=t[15],E=m*o-x*h,_=u*o-x*y,v=u*h-m*y,A=a*o-x*M,P=a*h-m*M,C=a*y-u*M;return e*(p*E-c*_+f*v)-i*(l*E-c*A+f*P)+s*(l*_-p*A+f*C)-r*(l*v-p*P+c*C)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],a=t[4],u=t[5],m=t[6],x=t[7],M=t[8],y=t[9],h=t[10],o=t[11],l=t[12],p=t[13],c=t[14],f=t[15],E=e*u-i*a,_=e*m-s*a,v=e*x-r*a,A=i*m-s*u,P=i*x-r*u,C=s*x-r*m,d=M*p-y*l,b=M*c-h*l,R=M*f-o*l,L=y*c-h*p,g=y*f-o*p,w=h*f-o*c,T=E*w-_*g+v*L+A*R-P*b+C*d;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let S=1/T;return t[0]=(u*w-m*g+x*L)*S,t[1]=(s*g-i*w-r*L)*S,t[2]=(p*C-c*P+f*A)*S,t[3]=(h*P-y*C-o*A)*S,t[4]=(m*R-a*w-x*b)*S,t[5]=(e*w-s*R+r*b)*S,t[6]=(c*v-l*C-f*_)*S,t[7]=(M*C-h*v+o*_)*S,t[8]=(a*g-u*R+x*d)*S,t[9]=(i*R-e*g-r*d)*S,t[10]=(l*P-p*v+f*E)*S,t[11]=(y*v-M*P-o*E)*S,t[12]=(u*b-a*L-m*d)*S,t[13]=(e*L-i*b+s*d)*S,t[14]=(p*_-l*A-c*E)*S,t[15]=(M*A-y*_+h*E)*S,this}scale(t){let e=this.elements,i=t.x,s=t.y,r=t.z;return e[0]*=i,e[4]*=s,e[8]*=r,e[1]*=i,e[5]*=s,e[9]*=r,e[2]*=i,e[6]*=s,e[10]*=r,e[3]*=i,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,s))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),s=Math.sin(e),r=1-i,a=t.x,u=t.y,m=t.z,x=r*a,M=r*u;return this.set(x*a+i,x*u-s*m,x*m+s*u,0,x*u+s*m,M*u+i,M*m-s*a,0,x*m-s*u,M*m+s*a,r*m*m+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,s,r,a){return this.set(1,i,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,i){let s=this.elements,r=e._x,a=e._y,u=e._z,m=e._w,x=r+r,M=a+a,y=u+u,h=r*x,o=r*M,l=r*y,p=a*M,c=a*y,f=u*y,E=m*x,_=m*M,v=m*y,A=i.x,P=i.y,C=i.z;return s[0]=(1-(p+f))*A,s[1]=(o+v)*A,s[2]=(l-_)*A,s[3]=0,s[4]=(o-v)*P,s[5]=(1-(h+f))*P,s[6]=(c+E)*P,s[7]=0,s[8]=(l+_)*C,s[9]=(c-E)*C,s[10]=(1-(h+p))*C,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,i){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinant();if(r===0)return i.set(1,1,1),e.identity(),this;let a=zn.set(s[0],s[1],s[2]).length(),u=zn.set(s[4],s[5],s[6]).length(),m=zn.set(s[8],s[9],s[10]).length();r<0&&(a=-a),ai.copy(this);let x=1/a,M=1/u,y=1/m;return ai.elements[0]*=x,ai.elements[1]*=x,ai.elements[2]*=x,ai.elements[4]*=M,ai.elements[5]*=M,ai.elements[6]*=M,ai.elements[8]*=y,ai.elements[9]*=y,ai.elements[10]*=y,e.setFromRotationMatrix(ai),i.x=a,i.y=u,i.z=m,this}makePerspective(t,e,i,s,r,a,u=ci,m=!1){let x=this.elements,M=2*r/(e-t),y=2*r/(i-s),h=(e+t)/(e-t),o=(i+s)/(i-s),l,p;if(m)l=r/(a-r),p=a*r/(a-r);else if(u===ci)l=-(a+r)/(a-r),p=-2*a*r/(a-r);else if(u===As)l=-a/(a-r),p=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+u);return x[0]=M,x[4]=0,x[8]=h,x[12]=0,x[1]=0,x[5]=y,x[9]=o,x[13]=0,x[2]=0,x[6]=0,x[10]=l,x[14]=p,x[3]=0,x[7]=0,x[11]=-1,x[15]=0,this}makeOrthographic(t,e,i,s,r,a,u=ci,m=!1){let x=this.elements,M=2/(e-t),y=2/(i-s),h=-(e+t)/(e-t),o=-(i+s)/(i-s),l,p;if(m)l=1/(a-r),p=a/(a-r);else if(u===ci)l=-2/(a-r),p=-(a+r)/(a-r);else if(u===As)l=-1/(a-r),p=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+u);return x[0]=M,x[4]=0,x[8]=0,x[12]=h,x[1]=0,x[5]=y,x[9]=0,x[13]=o,x[2]=0,x[6]=0,x[10]=l,x[14]=p,x[3]=0,x[7]=0,x[11]=0,x[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<16;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}},zn=new W,ai=new se,id=new W(0,0,0),nd=new W(1,1,1),Xi=new W,cr=new W,qe=new W,vc=new se,_c=new Si,tn=class n{constructor(t=0,e=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,s=this._order){return this._x=t,this._y=e,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let s=t.elements,r=s[0],a=s[4],u=s[8],m=s[1],x=s[5],M=s[9],y=s[2],h=s[6],o=s[10];switch(e){case"XYZ":this._y=Math.asin(jt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(-M,o),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,x),this._z=0);break;case"YXZ":this._x=Math.asin(-jt(M,-1,1)),Math.abs(M)<.9999999?(this._y=Math.atan2(u,o),this._z=Math.atan2(m,x)):(this._y=Math.atan2(-y,r),this._z=0);break;case"ZXY":this._x=Math.asin(jt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-y,o),this._z=Math.atan2(-a,x)):(this._y=0,this._z=Math.atan2(m,r));break;case"ZYX":this._y=Math.asin(-jt(y,-1,1)),Math.abs(y)<.9999999?(this._x=Math.atan2(h,o),this._z=Math.atan2(m,r)):(this._x=0,this._z=Math.atan2(-a,x));break;case"YZX":this._z=Math.asin(jt(m,-1,1)),Math.abs(m)<.9999999?(this._x=Math.atan2(-M,x),this._y=Math.atan2(-y,r)):(this._x=0,this._y=Math.atan2(u,o));break;case"XZY":this._z=Math.asin(-jt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,x),this._y=Math.atan2(u,r)):(this._x=Math.atan2(-M,o),this._y=0);break;default:Ft("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return vc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(vc,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return _c.setFromEuler(this),this.setFromQuaternion(_c,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};tn.DEFAULT_ORDER="XYZ";var rs=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},sd=0,Mc=new W,Vn=new Si,Li=new se,hr=new W,ys=new W,rd=new W,ad=new Si,bc=new W(1,0,0),Sc=new W(0,1,0),wc=new W(0,0,1),Ec={type:"added"},od={type:"removed"},Hn={type:"childadded",child:null},No={type:"childremoved",child:null},We=class n extends bi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:sd++}),this.uuid=$i(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let t=new W,e=new tn,i=new Si,s=new W(1,1,1);function r(){i.setFromEuler(e,!1)}function a(){e.setFromQuaternion(i,void 0,!1)}e._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new se},normalMatrix:{value:new zt}}),this.matrix=new se,this.matrixWorld=new se,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new rs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Vn.setFromAxisAngle(t,e),this.quaternion.multiply(Vn),this}rotateOnWorldAxis(t,e){return Vn.setFromAxisAngle(t,e),this.quaternion.premultiply(Vn),this}rotateX(t){return this.rotateOnAxis(bc,t)}rotateY(t){return this.rotateOnAxis(Sc,t)}rotateZ(t){return this.rotateOnAxis(wc,t)}translateOnAxis(t,e){return Mc.copy(t).applyQuaternion(this.quaternion),this.position.add(Mc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(bc,t)}translateY(t){return this.translateOnAxis(Sc,t)}translateZ(t){return this.translateOnAxis(wc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Li.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?hr.copy(t):hr.set(t,e,i);let s=this.parent;this.updateWorldMatrix(!0,!1),ys.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Li.lookAt(ys,hr,this.up):Li.lookAt(hr,ys,this.up),this.quaternion.setFromRotationMatrix(Li),s&&(Li.extractRotation(s.matrixWorld),Vn.setFromRotationMatrix(Li),this.quaternion.premultiply(Vn.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Nt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Ec),Hn.child=t,this.dispatchEvent(Hn),Hn.child=null):Nt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(od),No.child=t,this.dispatchEvent(No),No.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Li.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Li.multiply(t.parent.matrixWorld)),t.applyMatrix4(Li),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Ec),Hn.child=t,this.dispatchEvent(Hn),Hn.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,s=this.children.length;i<s;i++){let a=this.children[i].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ys,t,rd),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ys,ad,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,i=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*i-r[8]*s,r[13]+=i-r[1]*e-r[5]*i-r[9]*s,r[14]+=s-r[2]*e-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e){let i=this.parent;if(t===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){let e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(u=>({...u,boundingBox:u.boundingBox?u.boundingBox.toJSON():void 0,boundingSphere:u.boundingSphere?u.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(u=>({...u})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(u,m){return u[m.uuid]===void 0&&(u[m.uuid]=m.toJSON(t)),m.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let u=this.geometry.parameters;if(u!==void 0&&u.shapes!==void 0){let m=u.shapes;if(Array.isArray(m))for(let x=0,M=m.length;x<M;x++){let y=m[x];r(t.shapes,y)}else r(t.shapes,m)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let u=[];for(let m=0,x=this.material.length;m<x;m++)u.push(r(t.materials,this.material[m]));s.material=u}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let u=0;u<this.children.length;u++)s.children.push(this.children[u].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let u=0;u<this.animations.length;u++){let m=this.animations[u];s.animations.push(r(t.animations,m))}}if(e){let u=a(t.geometries),m=a(t.materials),x=a(t.textures),M=a(t.images),y=a(t.shapes),h=a(t.skeletons),o=a(t.animations),l=a(t.nodes);u.length>0&&(i.geometries=u),m.length>0&&(i.materials=m),x.length>0&&(i.textures=x),M.length>0&&(i.images=M),y.length>0&&(i.shapes=y),h.length>0&&(i.skeletons=h),o.length>0&&(i.animations=o),l.length>0&&(i.nodes=l)}return i.object=s,i;function a(u){let m=[];for(let x in u){let M=u[x];delete M.metadata,m.push(M)}return m}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let s=t.children[i];this.add(s.clone())}return this}};We.DEFAULT_UP=new W(0,1,0);We.DEFAULT_MATRIX_AUTO_UPDATE=!0;We.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ge=class extends We{constructor(){super(),this.isGroup=!0,this.type="Group"}},ld={type:"move"},as=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ge,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ge,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new W,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new W),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ge,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new W,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new W,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let s=null,r=null,a=null,u=this._targetRay,m=this._grip,x=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(x&&t.hand){a=!0;for(let p of t.hand.values()){let c=e.getJointPose(p,i),f=this._getHandJoint(x,p);c!==null&&(f.matrix.fromArray(c.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=c.radius),f.visible=c!==null}let M=x.joints["index-finger-tip"],y=x.joints["thumb-tip"],h=M.position.distanceTo(y.position),o=.02,l=.005;x.inputState.pinching&&h>o+l?(x.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!x.inputState.pinching&&h<=o-l&&(x.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else m!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,i),r!==null&&(m.matrix.fromArray(r.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,r.linearVelocity?(m.hasLinearVelocity=!0,m.linearVelocity.copy(r.linearVelocity)):m.hasLinearVelocity=!1,r.angularVelocity?(m.hasAngularVelocity=!0,m.angularVelocity.copy(r.angularVelocity)):m.hasAngularVelocity=!1,m.eventsEnabled&&m.dispatchEvent({type:"gripUpdated",data:t,target:this})));u!==null&&(s=e.getPose(t.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(u.matrix.fromArray(s.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,s.linearVelocity?(u.hasLinearVelocity=!0,u.linearVelocity.copy(s.linearVelocity)):u.hasLinearVelocity=!1,s.angularVelocity?(u.hasAngularVelocity=!0,u.angularVelocity.copy(s.angularVelocity)):u.hasAngularVelocity=!1,this.dispatchEvent(ld)))}return u!==null&&(u.visible=s!==null),m!==null&&(m.visible=r!==null),x!==null&&(x.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new Ge;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}},wh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},qi={h:0,s:0,l:0},ur={h:0,s:0,l:0};function Uo(n,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?n+(t-n)*6*e:e<1/2?t:e<2/3?n+(t-n)*6*(2/3-e):n}var ee=class{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Ze){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Zt.colorSpaceToWorking(this,e),this}setRGB(t,e,i,s=Zt.workingColorSpace){return this.r=t,this.g=e,this.b=i,Zt.colorSpaceToWorking(this,s),this}setHSL(t,e,i,s=Zt.workingColorSpace){if(t=$u(t,1),e=jt(e,0,1),i=jt(i,0,1),e===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+e):i+e-i*e,a=2*i-r;this.r=Uo(a,r,t+1/3),this.g=Uo(a,r,t),this.b=Uo(a,r,t-1/3)}return Zt.colorSpaceToWorking(this,s),this}setStyle(t,e=Ze){function i(r){r!==void 0&&parseFloat(r)<1&&Ft("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],u=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(u))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(u))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(u))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Ft("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);Ft("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Ze){let i=wh[t.toLowerCase()];return i!==void 0?this.setHex(i,e):Ft("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Oi(t.r),this.g=Oi(t.g),this.b=Oi(t.b),this}copyLinearToSRGB(t){return this.r=Qn(t.r),this.g=Qn(t.g),this.b=Qn(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Ze){return Zt.workingToColorSpace(Fe.copy(this),t),Math.round(jt(Fe.r*255,0,255))*65536+Math.round(jt(Fe.g*255,0,255))*256+Math.round(jt(Fe.b*255,0,255))}getHexString(t=Ze){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Zt.workingColorSpace){Zt.workingToColorSpace(Fe.copy(this),e);let i=Fe.r,s=Fe.g,r=Fe.b,a=Math.max(i,s,r),u=Math.min(i,s,r),m,x,M=(u+a)/2;if(u===a)m=0,x=0;else{let y=a-u;switch(x=M<=.5?y/(a+u):y/(2-a-u),a){case i:m=(s-r)/y+(s<r?6:0);break;case s:m=(r-i)/y+2;break;case r:m=(i-s)/y+4;break}m/=6}return t.h=m,t.s=x,t.l=M,t}getRGB(t,e=Zt.workingColorSpace){return Zt.workingToColorSpace(Fe.copy(this),e),t.r=Fe.r,t.g=Fe.g,t.b=Fe.b,t}getStyle(t=Ze){Zt.workingToColorSpace(Fe.copy(this),t);let e=Fe.r,i=Fe.g,s=Fe.b;return t!==Ze?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(t,e,i){return this.getHSL(qi),this.setHSL(qi.h+t,qi.s+e,qi.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(qi),t.getHSL(ur);let i=Io(qi.h,ur.h,e),s=Io(qi.s,ur.s,e),r=Io(qi.l,ur.l,e);return this.setHSL(i,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*i+r[6]*s,this.g=r[1]*e+r[4]*i+r[7]*s,this.b=r[2]*e+r[5]*i+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Fe=new ee;ee.NAMES=wh;var di=class extends We{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new tn,this.environmentIntensity=1,this.environmentRotation=new tn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}},oi=new W,Di=new W,Oo=new W,Fi=new W,Gn=new W,Wn=new W,Tc=new W,Bo=new W,ko=new W,zo=new W,Vo=new ye,Ho=new ye,Go=new ye,Ki=class n{constructor(t=new W,e=new W,i=new W){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,s){s.subVectors(i,e),oi.subVectors(t,e),s.cross(oi);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,i,s,r){oi.subVectors(s,e),Di.subVectors(i,e),Oo.subVectors(t,e);let a=oi.dot(oi),u=oi.dot(Di),m=oi.dot(Oo),x=Di.dot(Di),M=Di.dot(Oo),y=a*x-u*u;if(y===0)return r.set(0,0,0),null;let h=1/y,o=(x*m-u*M)*h,l=(a*M-u*m)*h;return r.set(1-o-l,l,o)}static containsPoint(t,e,i,s){return this.getBarycoord(t,e,i,s,Fi)===null?!1:Fi.x>=0&&Fi.y>=0&&Fi.x+Fi.y<=1}static getInterpolation(t,e,i,s,r,a,u,m){return this.getBarycoord(t,e,i,s,Fi)===null?(m.x=0,m.y=0,"z"in m&&(m.z=0),"w"in m&&(m.w=0),null):(m.setScalar(0),m.addScaledVector(r,Fi.x),m.addScaledVector(a,Fi.y),m.addScaledVector(u,Fi.z),m)}static getInterpolatedAttribute(t,e,i,s,r,a){return Vo.setScalar(0),Ho.setScalar(0),Go.setScalar(0),Vo.fromBufferAttribute(t,e),Ho.fromBufferAttribute(t,i),Go.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Vo,r.x),a.addScaledVector(Ho,r.y),a.addScaledVector(Go,r.z),a}static isFrontFacing(t,e,i,s){return oi.subVectors(i,e),Di.subVectors(t,e),oi.cross(Di).dot(s)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,s){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,i,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return oi.subVectors(this.c,this.b),Di.subVectors(this.a,this.b),oi.cross(Di).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return n.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return n.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,s,r){return n.getInterpolation(t,this.a,this.b,this.c,e,i,s,r)}containsPoint(t){return n.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return n.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,s=this.b,r=this.c,a,u;Gn.subVectors(s,i),Wn.subVectors(r,i),Bo.subVectors(t,i);let m=Gn.dot(Bo),x=Wn.dot(Bo);if(m<=0&&x<=0)return e.copy(i);ko.subVectors(t,s);let M=Gn.dot(ko),y=Wn.dot(ko);if(M>=0&&y<=M)return e.copy(s);let h=m*y-M*x;if(h<=0&&m>=0&&M<=0)return a=m/(m-M),e.copy(i).addScaledVector(Gn,a);zo.subVectors(t,r);let o=Gn.dot(zo),l=Wn.dot(zo);if(l>=0&&o<=l)return e.copy(r);let p=o*x-m*l;if(p<=0&&x>=0&&l<=0)return u=x/(x-l),e.copy(i).addScaledVector(Wn,u);let c=M*l-o*y;if(c<=0&&y-M>=0&&o-l>=0)return Tc.subVectors(r,s),u=(y-M)/(y-M+(o-l)),e.copy(s).addScaledVector(Tc,u);let f=1/(c+p+h);return a=p*f,u=h*f,e.copy(i).addScaledVector(Gn,a).addScaledVector(Wn,u)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},wi=class{constructor(t=new W(1/0,1/0,1/0),e=new W(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(li.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(li.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=li.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let r=i.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,u=r.count;a<u;a++)t.isMesh===!0?t.getVertexPosition(a,li):li.fromBufferAttribute(r,a),li.applyMatrix4(t.matrixWorld),this.expandByPoint(li);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),dr.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),dr.copy(i.boundingBox)),dr.applyMatrix4(t.matrixWorld),this.union(dr)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,li),li.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(vs),fr.subVectors(this.max,vs),Xn.subVectors(t.a,vs),qn.subVectors(t.b,vs),Yn.subVectors(t.c,vs),Yi.subVectors(qn,Xn),Zi.subVectors(Yn,qn),xn.subVectors(Xn,Yn);let e=[0,-Yi.z,Yi.y,0,-Zi.z,Zi.y,0,-xn.z,xn.y,Yi.z,0,-Yi.x,Zi.z,0,-Zi.x,xn.z,0,-xn.x,-Yi.y,Yi.x,0,-Zi.y,Zi.x,0,-xn.y,xn.x,0];return!Wo(e,Xn,qn,Yn,fr)||(e=[1,0,0,0,1,0,0,0,1],!Wo(e,Xn,qn,Yn,fr))?!1:(pr.crossVectors(Yi,Zi),e=[pr.x,pr.y,pr.z],Wo(e,Xn,qn,Yn,fr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,li).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(li).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Ni[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Ni[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Ni[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Ni[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Ni[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Ni[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Ni[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Ni[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Ni),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Ni=[new W,new W,new W,new W,new W,new W,new W,new W],li=new W,dr=new wi,Xn=new W,qn=new W,Yn=new W,Yi=new W,Zi=new W,xn=new W,vs=new W,fr=new W,pr=new W,yn=new W;function Wo(n,t,e,i,s){for(let r=0,a=n.length-3;r<=a;r+=3){yn.fromArray(n,r);let u=s.x*Math.abs(yn.x)+s.y*Math.abs(yn.y)+s.z*Math.abs(yn.z),m=t.dot(yn),x=e.dot(yn),M=i.dot(yn);if(Math.max(-Math.max(m,x,M),Math.min(m,x,M))>u)return!1}return!0}var be=new W,mr=new ne,cd=0,Be=class extends bi{constructor(t,e,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:cd++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=Wr,this.updateRanges=[],this.gpuType=ii,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[i+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)mr.fromBufferAttribute(this,e),mr.applyMatrix3(t),this.setXY(e,mr.x,mr.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)be.fromBufferAttribute(this,e),be.applyMatrix3(t),this.setXYZ(e,be.x,be.y,be.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)be.fromBufferAttribute(this,e),be.applyMatrix4(t),this.setXYZ(e,be.x,be.y,be.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)be.fromBufferAttribute(this,e),be.applyNormalMatrix(t),this.setXYZ(e,be.x,be.y,be.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)be.fromBufferAttribute(this,e),be.transformDirection(t),this.setXYZ(e,be.x,be.y,be.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=vi(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=ce(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=vi(e,this.array)),e}setX(t,e){return this.normalized&&(e=ce(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=vi(e,this.array)),e}setY(t,e){return this.normalized&&(e=ce(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=vi(e,this.array)),e}setZ(t,e){return this.normalized&&(e=ce(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=vi(e,this.array)),e}setW(t,e){return this.normalized&&(e=ce(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=ce(e,this.array),i=ce(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,s){return t*=this.itemSize,this.normalized&&(e=ce(e,this.array),i=ce(i,this.array),s=ce(s,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this}setXYZW(t,e,i,s,r){return t*=this.itemSize,this.normalized&&(e=ce(e,this.array),i=ce(i,this.array),s=ce(s,this.array),r=ce(r,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Wr&&(t.usage=this.usage),t}dispose(){this.dispatchEvent({type:"dispose"})}};var Is=class extends Be{constructor(t,e,i){super(new Uint16Array(t),e,i)}};var Ps=class extends Be{constructor(t,e,i){super(new Uint32Array(t),e,i)}};var he=class extends Be{constructor(t,e,i){super(new Float32Array(t),e,i)}},hd=new wi,_s=new W,Xo=new W,Ei=class{constructor(t=new W,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;e!==void 0?i.copy(e):hd.setFromPoints(t).getCenter(i);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,i.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;_s.subVectors(t,this.center);let e=_s.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),s=(i-this.radius)*.5;this.center.addScaledVector(_s,s/i),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Xo.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(_s.copy(t.center).add(Xo)),this.expandByPoint(_s.copy(t.center).sub(Xo))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},ud=0,ti=new se,qo=new We,Zn=new W,Ye=new wi,Ms=new wi,Ce=new W,ge=class n extends bi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ud++}),this.uuid=$i(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(ju(t)?Ps:Is)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new zt().getNormalMatrix(t);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return ti.makeRotationFromQuaternion(t),this.applyMatrix4(ti),this}rotateX(t){return ti.makeRotationX(t),this.applyMatrix4(ti),this}rotateY(t){return ti.makeRotationY(t),this.applyMatrix4(ti),this}rotateZ(t){return ti.makeRotationZ(t),this.applyMatrix4(ti),this}translate(t,e,i){return ti.makeTranslation(t,e,i),this.applyMatrix4(ti),this}scale(t,e,i){return ti.makeScale(t,e,i),this.applyMatrix4(ti),this}lookAt(t){return qo.lookAt(t),qo.updateMatrix(),this.applyMatrix4(qo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Zn).negate(),this.translate(Zn.x,Zn.y,Zn.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let i=[];for(let s=0,r=t.length;s<r;s++){let a=t[s];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new he(i,3))}else{let i=Math.min(t.length,e.count);for(let s=0;s<i;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&Ft("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new wi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Nt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new W(-1/0,-1/0,-1/0),new W(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,s=e.length;i<s;i++){let r=e[i];Ye.setFromBufferAttribute(r),this.morphTargetsRelative?(Ce.addVectors(this.boundingBox.min,Ye.min),this.boundingBox.expandByPoint(Ce),Ce.addVectors(this.boundingBox.max,Ye.max),this.boundingBox.expandByPoint(Ce)):(this.boundingBox.expandByPoint(Ye.min),this.boundingBox.expandByPoint(Ye.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Nt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ei);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Nt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new W,1/0);return}if(t){let i=this.boundingSphere.center;if(Ye.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let u=e[r];Ms.setFromBufferAttribute(u),this.morphTargetsRelative?(Ce.addVectors(Ye.min,Ms.min),Ye.expandByPoint(Ce),Ce.addVectors(Ye.max,Ms.max),Ye.expandByPoint(Ce)):(Ye.expandByPoint(Ms.min),Ye.expandByPoint(Ms.max))}Ye.getCenter(i);let s=0;for(let r=0,a=t.count;r<a;r++)Ce.fromBufferAttribute(t,r),s=Math.max(s,i.distanceToSquared(Ce));if(e)for(let r=0,a=e.length;r<a;r++){let u=e[r],m=this.morphTargetsRelative;for(let x=0,M=u.count;x<M;x++)Ce.fromBufferAttribute(u,x),m&&(Zn.fromBufferAttribute(t,x),Ce.add(Zn)),s=Math.max(s,i.distanceToSquared(Ce))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Nt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Nt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Be(new Float32Array(4*i.count),4));let a=this.getAttribute("tangent"),u=[],m=[];for(let d=0;d<i.count;d++)u[d]=new W,m[d]=new W;let x=new W,M=new W,y=new W,h=new ne,o=new ne,l=new ne,p=new W,c=new W;function f(d,b,R){x.fromBufferAttribute(i,d),M.fromBufferAttribute(i,b),y.fromBufferAttribute(i,R),h.fromBufferAttribute(r,d),o.fromBufferAttribute(r,b),l.fromBufferAttribute(r,R),M.sub(x),y.sub(x),o.sub(h),l.sub(h);let L=1/(o.x*l.y-l.x*o.y);isFinite(L)&&(p.copy(M).multiplyScalar(l.y).addScaledVector(y,-o.y).multiplyScalar(L),c.copy(y).multiplyScalar(o.x).addScaledVector(M,-l.x).multiplyScalar(L),u[d].add(p),u[b].add(p),u[R].add(p),m[d].add(c),m[b].add(c),m[R].add(c))}let E=this.groups;E.length===0&&(E=[{start:0,count:t.count}]);for(let d=0,b=E.length;d<b;++d){let R=E[d],L=R.start,g=R.count;for(let w=L,T=L+g;w<T;w+=3)f(t.getX(w+0),t.getX(w+1),t.getX(w+2))}let _=new W,v=new W,A=new W,P=new W;function C(d){A.fromBufferAttribute(s,d),P.copy(A);let b=u[d];_.copy(b),_.sub(A.multiplyScalar(A.dot(b))).normalize(),v.crossVectors(P,b);let L=v.dot(m[d])<0?-1:1;a.setXYZW(d,_.x,_.y,_.z,L)}for(let d=0,b=E.length;d<b;++d){let R=E[d],L=R.start,g=R.count;for(let w=L,T=L+g;w<T;w+=3)C(t.getX(w+0)),C(t.getX(w+1)),C(t.getX(w+2))}}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Be(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let h=0,o=i.count;h<o;h++)i.setXYZ(h,0,0,0);let s=new W,r=new W,a=new W,u=new W,m=new W,x=new W,M=new W,y=new W;if(t)for(let h=0,o=t.count;h<o;h+=3){let l=t.getX(h+0),p=t.getX(h+1),c=t.getX(h+2);s.fromBufferAttribute(e,l),r.fromBufferAttribute(e,p),a.fromBufferAttribute(e,c),M.subVectors(a,r),y.subVectors(s,r),M.cross(y),u.fromBufferAttribute(i,l),m.fromBufferAttribute(i,p),x.fromBufferAttribute(i,c),u.add(M),m.add(M),x.add(M),i.setXYZ(l,u.x,u.y,u.z),i.setXYZ(p,m.x,m.y,m.z),i.setXYZ(c,x.x,x.y,x.z)}else for(let h=0,o=e.count;h<o;h+=3)s.fromBufferAttribute(e,h+0),r.fromBufferAttribute(e,h+1),a.fromBufferAttribute(e,h+2),M.subVectors(a,r),y.subVectors(s,r),M.cross(y),i.setXYZ(h+0,M.x,M.y,M.z),i.setXYZ(h+1,M.x,M.y,M.z),i.setXYZ(h+2,M.x,M.y,M.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)Ce.fromBufferAttribute(t,e),Ce.normalize(),t.setXYZ(e,Ce.x,Ce.y,Ce.z)}toNonIndexed(){function t(u,m){let x=u.array,M=u.itemSize,y=u.normalized,h=new x.constructor(m.length*M),o=0,l=0;for(let p=0,c=m.length;p<c;p++){u.isInterleavedBufferAttribute?o=m[p]*u.data.stride+u.offset:o=m[p]*M;for(let f=0;f<M;f++)h[l++]=x[o++]}return new Be(h,M,y)}if(this.index===null)return Ft("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new n,i=this.index.array,s=this.attributes;for(let u in s){let m=s[u],x=t(m,i);e.setAttribute(u,x)}let r=this.morphAttributes;for(let u in r){let m=[],x=r[u];for(let M=0,y=x.length;M<y;M++){let h=x[M],o=t(h,i);m.push(o)}e.morphAttributes[u]=m}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let u=0,m=a.length;u<m;u++){let x=a[u];e.addGroup(x.start,x.count,x.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){let m=this.parameters;for(let x in m)m[x]!==void 0&&(t[x]=m[x]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let i=this.attributes;for(let m in i){let x=i[m];t.data.attributes[m]=x.toJSON(t.data)}let s={},r=!1;for(let m in this.morphAttributes){let x=this.morphAttributes[m],M=[];for(let y=0,h=x.length;y<h;y++){let o=x[y];M.push(o.toJSON(t.data))}M.length>0&&(s[m]=M,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let u=this.boundingSphere;return u!==null&&(t.data.boundingSphere=u.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let s=t.attributes;for(let x in s){let M=s[x];this.setAttribute(x,M.clone(e))}let r=t.morphAttributes;for(let x in r){let M=[],y=r[x];for(let h=0,o=y.length;h<o;h++)M.push(y[h].clone(e));this.morphAttributes[x]=M}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let x=0,M=a.length;x<M;x++){let y=a[x];this.addGroup(y.start,y.count,y.materialIndex)}let u=t.boundingBox;u!==null&&(this.boundingBox=u.clone());let m=t.boundingSphere;return m!==null&&(this.boundingSphere=m.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},en=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=Wr,this.updateRanges=[],this.version=0,this.uuid=$i()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,i){t*=this.stride,i*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[i+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=$i()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(e,this.stride);return i.setUsage(this.usage),i}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=$i()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Oe=new W,nn=class n{constructor(t,e,i,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=i,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,i=this.data.count;e<i;e++)Oe.fromBufferAttribute(this,e),Oe.applyMatrix4(t),this.setXYZ(e,Oe.x,Oe.y,Oe.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Oe.fromBufferAttribute(this,e),Oe.applyNormalMatrix(t),this.setXYZ(e,Oe.x,Oe.y,Oe.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Oe.fromBufferAttribute(this,e),Oe.transformDirection(t),this.setXYZ(e,Oe.x,Oe.y,Oe.z);return this}getComponent(t,e){let i=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(i=vi(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=ce(i,this.array)),this.data.array[t*this.data.stride+this.offset+e]=i,this}setX(t,e){return this.normalized&&(e=ce(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=ce(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=ce(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=ce(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=vi(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=vi(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=vi(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=vi(e,this.array)),e}setXY(t,e,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=ce(e,this.array),i=ce(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this}setXYZ(t,e,i,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=ce(e,this.array),i=ce(i,this.array),s=ce(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=s,this}setXYZW(t,e,i,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=ce(e,this.array),i=ce(i,this.array),s=ce(s,this.array),r=ce(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){Cs("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new Be(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new n(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){Cs("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},dd=0,ki=class extends bi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:dd++}),this.uuid=$i(),this.name="",this.type="Material",this.blending=Bi,this.side=hi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=bn,this.blendDst=Qi,this.blendEquation=ui,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ee(0,0,0),this.blendAlpha=0,this.depthFunc=Sn,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=nl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Mn,this.stencilZFail=Mn,this.stencilZPass=Mn,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let i=t[e];if(i===void 0){Ft(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Ft(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Bi&&(i.blending=this.blending),this.side!==hi&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==bn&&(i.blendSrc=this.blendSrc),this.blendDst!==Qi&&(i.blendDst=this.blendDst),this.blendEquation!==ui&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Sn&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==nl&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Mn&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Mn&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Mn&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let a=[];for(let u in r){let m=r[u];delete m.metadata,a.push(m)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let s=e.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=e[r].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var Ui=new W,Yo=new W,gr=new W,Ji=new W,Zo=new W,xr=new W,Jo=new W,En=class{constructor(t=new W,e=new W(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Ui)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Ui.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Ui.copy(this.origin).addScaledVector(this.direction,e),Ui.distanceToSquared(t))}distanceSqToSegment(t,e,i,s){Yo.copy(t).add(e).multiplyScalar(.5),gr.copy(e).sub(t).normalize(),Ji.copy(this.origin).sub(Yo);let r=t.distanceTo(e)*.5,a=-this.direction.dot(gr),u=Ji.dot(this.direction),m=-Ji.dot(gr),x=Ji.lengthSq(),M=Math.abs(1-a*a),y,h,o,l;if(M>0)if(y=a*m-u,h=a*u-m,l=r*M,y>=0)if(h>=-l)if(h<=l){let p=1/M;y*=p,h*=p,o=y*(y+a*h+2*u)+h*(a*y+h+2*m)+x}else h=r,y=Math.max(0,-(a*h+u)),o=-y*y+h*(h+2*m)+x;else h=-r,y=Math.max(0,-(a*h+u)),o=-y*y+h*(h+2*m)+x;else h<=-l?(y=Math.max(0,-(-a*r+u)),h=y>0?-r:Math.min(Math.max(-r,-m),r),o=-y*y+h*(h+2*m)+x):h<=l?(y=0,h=Math.min(Math.max(-r,-m),r),o=h*(h+2*m)+x):(y=Math.max(0,-(a*r+u)),h=y>0?r:Math.min(Math.max(-r,-m),r),o=-y*y+h*(h+2*m)+x);else h=a>0?-r:r,y=Math.max(0,-(a*h+u)),o=-y*y+h*(h+2*m)+x;return i&&i.copy(this.origin).addScaledVector(this.direction,y),s&&s.copy(Yo).addScaledVector(gr,h),o}intersectSphere(t,e){Ui.subVectors(t.center,this.origin);let i=Ui.dot(this.direction),s=Ui.dot(Ui)-i*i,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),u=i-a,m=i+a;return m<0?null:u<0?this.at(m,e):this.at(u,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,s,r,a,u,m,x=1/this.direction.x,M=1/this.direction.y,y=1/this.direction.z,h=this.origin;return x>=0?(i=(t.min.x-h.x)*x,s=(t.max.x-h.x)*x):(i=(t.max.x-h.x)*x,s=(t.min.x-h.x)*x),M>=0?(r=(t.min.y-h.y)*M,a=(t.max.y-h.y)*M):(r=(t.max.y-h.y)*M,a=(t.min.y-h.y)*M),i>a||r>s||((r>i||isNaN(i))&&(i=r),(a<s||isNaN(s))&&(s=a),y>=0?(u=(t.min.z-h.z)*y,m=(t.max.z-h.z)*y):(u=(t.max.z-h.z)*y,m=(t.min.z-h.z)*y),i>m||u>s)||((u>i||i!==i)&&(i=u),(m<s||s!==s)&&(s=m),s<0)?null:this.at(i>=0?i:s,e)}intersectsBox(t){return this.intersectBox(t,Ui)!==null}intersectTriangle(t,e,i,s,r){Zo.subVectors(e,t),xr.subVectors(i,t),Jo.crossVectors(Zo,xr);let a=this.direction.dot(Jo),u;if(a>0){if(s)return null;u=1}else if(a<0)u=-1,a=-a;else return null;Ji.subVectors(this.origin,t);let m=u*this.direction.dot(xr.crossVectors(Ji,xr));if(m<0)return null;let x=u*this.direction.dot(Zo.cross(Ji));if(x<0||m+x>a)return null;let M=-u*Ji.dot(Jo);return M<0?null:this.at(M/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Pe=class extends ki{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ee(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new tn,this.combine=ul,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Ac=new se,vn=new En,yr=new Ei,Cc=new W,vr=new W,_r=new W,Mr=new W,jo=new W,br=new W,Rc=new W,Sr=new W,ae=class extends We{constructor(t=new ge,e=new Pe){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let u=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[u]=r}}}}getVertexPosition(t,e){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;e.fromBufferAttribute(s,t);let u=this.morphTargetInfluences;if(r&&u){br.set(0,0,0);for(let m=0,x=r.length;m<x;m++){let M=u[m],y=r[m];M!==0&&(jo.fromBufferAttribute(y,t),a?br.addScaledVector(jo,M):br.addScaledVector(jo.sub(e),M))}e.add(br)}return e}raycast(t,e){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),yr.copy(i.boundingSphere),yr.applyMatrix4(r),vn.copy(t.ray).recast(t.near),!(yr.containsPoint(vn.origin)===!1&&(vn.intersectSphere(yr,Cc)===null||vn.origin.distanceToSquared(Cc)>(t.far-t.near)**2))&&(Ac.copy(r).invert(),vn.copy(t.ray).applyMatrix4(Ac),!(i.boundingBox!==null&&vn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,vn)))}_computeIntersections(t,e,i){let s,r=this.geometry,a=this.material,u=r.index,m=r.attributes.position,x=r.attributes.uv,M=r.attributes.uv1,y=r.attributes.normal,h=r.groups,o=r.drawRange;if(u!==null)if(Array.isArray(a))for(let l=0,p=h.length;l<p;l++){let c=h[l],f=a[c.materialIndex],E=Math.max(c.start,o.start),_=Math.min(u.count,Math.min(c.start+c.count,o.start+o.count));for(let v=E,A=_;v<A;v+=3){let P=u.getX(v),C=u.getX(v+1),d=u.getX(v+2);s=wr(this,f,t,i,x,M,y,P,C,d),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=c.materialIndex,e.push(s))}}else{let l=Math.max(0,o.start),p=Math.min(u.count,o.start+o.count);for(let c=l,f=p;c<f;c+=3){let E=u.getX(c),_=u.getX(c+1),v=u.getX(c+2);s=wr(this,a,t,i,x,M,y,E,_,v),s&&(s.faceIndex=Math.floor(c/3),e.push(s))}}else if(m!==void 0)if(Array.isArray(a))for(let l=0,p=h.length;l<p;l++){let c=h[l],f=a[c.materialIndex],E=Math.max(c.start,o.start),_=Math.min(m.count,Math.min(c.start+c.count,o.start+o.count));for(let v=E,A=_;v<A;v+=3){let P=v,C=v+1,d=v+2;s=wr(this,f,t,i,x,M,y,P,C,d),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=c.materialIndex,e.push(s))}}else{let l=Math.max(0,o.start),p=Math.min(m.count,o.start+o.count);for(let c=l,f=p;c<f;c+=3){let E=c,_=c+1,v=c+2;s=wr(this,a,t,i,x,M,y,E,_,v),s&&(s.faceIndex=Math.floor(c/3),e.push(s))}}}};function fd(n,t,e,i,s,r,a,u){let m;if(t.side===Ve?m=i.intersectTriangle(a,r,s,!0,u):m=i.intersectTriangle(s,r,a,t.side===hi,u),m===null)return null;Sr.copy(u),Sr.applyMatrix4(n.matrixWorld);let x=e.ray.origin.distanceTo(Sr);return x<e.near||x>e.far?null:{distance:x,point:Sr.clone(),object:n}}function wr(n,t,e,i,s,r,a,u,m,x){n.getVertexPosition(u,vr),n.getVertexPosition(m,_r),n.getVertexPosition(x,Mr);let M=fd(n,t,e,i,vr,_r,Mr,Rc);if(M){let y=new W;Ki.getBarycoord(Rc,vr,_r,Mr,y),s&&(M.uv=Ki.getInterpolatedAttribute(s,u,m,x,y,new ne)),r&&(M.uv1=Ki.getInterpolatedAttribute(r,u,m,x,y,new ne)),a&&(M.normal=Ki.getInterpolatedAttribute(a,u,m,x,y,new W),M.normal.dot(i.direction)>0&&M.normal.multiplyScalar(-1));let h={a:u,b:m,c:x,normal:new W,materialIndex:0};Ki.getNormal(vr,_r,Mr,h.normal),M.face=h,M.barycoord=y}return M}var Tn=class extends Ne{constructor(t=null,e=1,i=1,s,r,a,u,m,x=Ie,M=Ie,y,h){super(null,a,u,m,x,M,s,r,y,h),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ls=class extends Be{constructor(t,e,i,s=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Jn=new se,Ic=new se,Er=[],Pc=new wi,pd=new se,bs=new ae,Ss=new Ei,Ds=class extends ae{constructor(t,e,i){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Ls(new Float32Array(i*16),16),this.previousInstanceMatrix=null,this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,pd)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new wi),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Jn),Pc.copy(t.boundingBox).applyMatrix4(Jn),this.boundingBox.union(Pc)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ei),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Jn),Ss.copy(t.boundingSphere).applyMatrix4(Jn),this.boundingSphere.union(Ss)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.previousInstanceMatrix!==null&&(this.previousInstanceMatrix=t.previousInstanceMatrix.clone()),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let i=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,a=t*r+1;for(let u=0;u<i.length;u++)i[u]=s[a+u]}raycast(t,e){let i=this.matrixWorld,s=this.count;if(bs.geometry=this.geometry,bs.material=this.material,bs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ss.copy(this.boundingSphere),Ss.applyMatrix4(i),t.ray.intersectsSphere(Ss)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Jn),Ic.multiplyMatrices(i,Jn),bs.matrixWorld=Ic,bs.raycast(t,Er);for(let a=0,u=Er.length;a<u;a++){let m=Er[a];m.instanceId=r,m.object=this,e.push(m)}Er.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new Ls(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let i=e.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new Tn(new Float32Array(s*this.count),s,this.count,ba,ii));let r=this.morphTexture.source.data.data,a=0;for(let x=0;x<i.length;x++)a+=i[x];let u=this.geometry.morphTargetsRelative?1:1-a,m=s*t;return r[m]=u,r.set(i,m+1),this}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Ko=new W,md=new W,gd=new zt,yi=class{constructor(t=new W(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,s){return this.normal.set(t,e,i),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let s=Ko.subVectors(i,e).cross(md.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,i=!0){let s=t.delta(Ko),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return i===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(s,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||gd.getNormalMatrix(t),s=this.coplanarPoint(Ko).applyMatrix4(t),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},_n=new Ei,xd=new ne(.5,.5),Tr=new W,Fs=class{constructor(t=new yi,e=new yi,i=new yi,s=new yi,r=new yi,a=new yi){this.planes=[t,e,i,s,r,a]}set(t,e,i,s,r,a){let u=this.planes;return u[0].copy(t),u[1].copy(e),u[2].copy(i),u[3].copy(s),u[4].copy(r),u[5].copy(a),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=ci,i=!1){let s=this.planes,r=t.elements,a=r[0],u=r[1],m=r[2],x=r[3],M=r[4],y=r[5],h=r[6],o=r[7],l=r[8],p=r[9],c=r[10],f=r[11],E=r[12],_=r[13],v=r[14],A=r[15];if(s[0].setComponents(x-a,o-M,f-l,A-E).normalize(),s[1].setComponents(x+a,o+M,f+l,A+E).normalize(),s[2].setComponents(x+u,o+y,f+p,A+_).normalize(),s[3].setComponents(x-u,o-y,f-p,A-_).normalize(),i)s[4].setComponents(m,h,c,v).normalize(),s[5].setComponents(x-m,o-h,f-c,A-v).normalize();else if(s[4].setComponents(x-m,o-h,f-c,A-v).normalize(),e===ci)s[5].setComponents(x+m,o+h,f+c,A+v).normalize();else if(e===As)s[5].setComponents(m,h,c,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),_n.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),_n.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(_n)}intersectsSprite(t){_n.center.set(0,0,0);let e=xd.distanceTo(t.center);return _n.radius=.7071067811865476+e,_n.applyMatrix4(t.matrixWorld),this.intersectsSphere(_n)}intersectsSphere(t){let e=this.planes,i=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let s=e[i];if(Tr.x=s.normal.x>0?t.max.x:t.min.x,Tr.y=s.normal.y>0?t.max.y:t.min.y,Tr.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Tr)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var sn=class extends ki{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new ee(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},jr=new W,Kr=new W,Lc=new se,ws=new En,Ar=new Ei,$o=new W,Dc=new W,An=class extends We{constructor(t=new ge,e=new sn){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[0];for(let s=1,r=e.count;s<r;s++)jr.fromBufferAttribute(e,s-1),Kr.fromBufferAttribute(e,s),i[s]=i[s-1],i[s]+=jr.distanceTo(Kr);t.setAttribute("lineDistance",new he(i,1))}else Ft("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){let i=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Ar.copy(i.boundingSphere),Ar.applyMatrix4(s),Ar.radius+=r,t.ray.intersectsSphere(Ar)===!1)return;Lc.copy(s).invert(),ws.copy(t.ray).applyMatrix4(Lc);let u=r/((this.scale.x+this.scale.y+this.scale.z)/3),m=u*u,x=this.isLineSegments?2:1,M=i.index,h=i.attributes.position;if(M!==null){let o=Math.max(0,a.start),l=Math.min(M.count,a.start+a.count);for(let p=o,c=l-1;p<c;p+=x){let f=M.getX(p),E=M.getX(p+1),_=Cr(this,t,ws,m,f,E,p);_&&e.push(_)}if(this.isLineLoop){let p=M.getX(l-1),c=M.getX(o),f=Cr(this,t,ws,m,p,c,l-1);f&&e.push(f)}}else{let o=Math.max(0,a.start),l=Math.min(h.count,a.start+a.count);for(let p=o,c=l-1;p<c;p+=x){let f=Cr(this,t,ws,m,p,p+1,p);f&&e.push(f)}if(this.isLineLoop){let p=Cr(this,t,ws,m,l-1,o,l-1);p&&e.push(p)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let u=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[u]=r}}}}};function Cr(n,t,e,i,s,r,a){let u=n.geometry.attributes.position;if(jr.fromBufferAttribute(u,s),Kr.fromBufferAttribute(u,r),e.distanceSqToSegment(jr,Kr,$o,Dc)>i)return;$o.applyMatrix4(n.matrixWorld);let x=t.ray.origin.distanceTo($o);if(!(x<t.near||x>t.far))return{distance:x,point:Dc.clone().applyMatrix4(n.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:n}}var Fc=new W,Nc=new W,Cn=class extends An{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[];for(let s=0,r=e.count;s<r;s+=2)Fc.fromBufferAttribute(e,s),Nc.fromBufferAttribute(e,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+Fc.distanceTo(Nc);t.setAttribute("lineDistance",new he(i,1))}else Ft("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var $r=class extends ki{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new ee(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Uc=new se,sl=new En,Rr=new Ei,Ir=new W,Ns=class extends We{constructor(t=new ge,e=new $r){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){let i=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Rr.copy(i.boundingSphere),Rr.applyMatrix4(s),Rr.radius+=r,t.ray.intersectsSphere(Rr)===!1)return;Uc.copy(s).invert(),sl.copy(t.ray).applyMatrix4(Uc);let u=r/((this.scale.x+this.scale.y+this.scale.z)/3),m=u*u,x=i.index,y=i.attributes.position;if(x!==null){let h=Math.max(0,a.start),o=Math.min(x.count,a.start+a.count);for(let l=h,p=o;l<p;l++){let c=x.getX(l);Ir.fromBufferAttribute(y,c),Oc(Ir,c,m,s,t,e,this)}}else{let h=Math.max(0,a.start),o=Math.min(y.count,a.start+a.count);for(let l=h,p=o;l<p;l++)Ir.fromBufferAttribute(y,l),Oc(Ir,l,m,s,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let u=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[u]=r}}}}};function Oc(n,t,e,i,s,r,a){let u=sl.distanceSqToPoint(n);if(u<e){let m=new W;sl.closestPointToPoint(n,m),m.applyMatrix4(i);let x=s.ray.origin.distanceTo(m);if(x<s.near||x>s.far)return;r.push({distance:x,distanceToRay:Math.sqrt(u),point:m,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}var Us=class extends Ne{constructor(t=[],e=hn,i,s,r,a,u,m,x,M){super(t,e,i,s,r,a,u,m,x,M),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},fi=class extends Ne{constructor(t,e,i,s,r,a,u,m,x){super(t,e,i,s,r,a,u,m,x),this.isCanvasTexture=!0,this.needsUpdate=!0}};var zi=class extends Ne{constructor(t,e,i=pi,s,r,a,u=Ie,m=Ie,x,M=Mi,y=1){if(M!==Mi&&M!==un)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:t,height:e,depth:y};super(h,s,r,a,u,m,M,i,x),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new ss(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}},Qr=class extends zi{constructor(t,e=pi,i=hn,s,r,a=Ie,u=Ie,m,x=Mi){let M={width:t,height:t,depth:1},y=[M,M,M,M,M,M];super(t,t,e,i,s,r,a,u,m,x),this.image=y,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},Os=class extends Ne{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Ti=class n extends ge{constructor(t=1,e=1,i=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};let u=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let m=[],x=[],M=[],y=[],h=0,o=0;l("z","y","x",-1,-1,i,e,t,a,r,0),l("z","y","x",1,-1,i,e,-t,a,r,1),l("x","z","y",1,1,t,i,e,s,a,2),l("x","z","y",1,-1,t,i,-e,s,a,3),l("x","y","z",1,-1,t,e,i,s,r,4),l("x","y","z",-1,-1,t,e,-i,s,r,5),this.setIndex(m),this.setAttribute("position",new he(x,3)),this.setAttribute("normal",new he(M,3)),this.setAttribute("uv",new he(y,2));function l(p,c,f,E,_,v,A,P,C,d,b){let R=v/C,L=A/d,g=v/2,w=A/2,T=P/2,S=C+1,I=d+1,D=0,U=0,B=new W;for(let z=0;z<I;z++){let k=z*L-w;for(let H=0;H<S;H++){let Y=H*R-g;B[p]=Y*E,B[c]=k*_,B[f]=T,x.push(B.x,B.y,B.z),B[p]=0,B[c]=0,B[f]=P>0?1:-1,M.push(B.x,B.y,B.z),y.push(H/C),y.push(1-z/d),D+=1}}for(let z=0;z<d;z++)for(let k=0;k<C;k++){let H=h+k+S*z,Y=h+k+S*(z+1),ht=h+(k+1)+S*(z+1),rt=h+(k+1)+S*z;m.push(H,Y,rt),m.push(Y,ht,rt),U+=6}u.addGroup(o,U,b),o+=U,h+=D}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var Bs=class n extends ge{constructor(t=1,e=32,i=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:i,thetaLength:s},e=Math.max(3,e);let r=[],a=[],u=[],m=[],x=new W,M=new ne;a.push(0,0,0),u.push(0,0,1),m.push(.5,.5);for(let y=0,h=3;y<=e;y++,h+=3){let o=i+y/e*s;x.x=t*Math.cos(o),x.y=t*Math.sin(o),a.push(x.x,x.y,x.z),u.push(0,0,1),M.x=(a[h]/t+1)/2,M.y=(a[h+1]/t+1)/2,m.push(M.x,M.y)}for(let y=1;y<=e;y++)r.push(y,y+1,0);this.setIndex(r),this.setAttribute("position",new he(a,3)),this.setAttribute("normal",new he(u,3)),this.setAttribute("uv",new he(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radius,t.segments,t.thetaStart,t.thetaLength)}},os=class n extends ge{constructor(t=1,e=1,i=1,s=32,r=1,a=!1,u=0,m=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:u,thetaLength:m};let x=this;s=Math.floor(s),r=Math.floor(r);let M=[],y=[],h=[],o=[],l=0,p=[],c=i/2,f=0;E(),a===!1&&(t>0&&_(!0),e>0&&_(!1)),this.setIndex(M),this.setAttribute("position",new he(y,3)),this.setAttribute("normal",new he(h,3)),this.setAttribute("uv",new he(o,2));function E(){let v=new W,A=new W,P=0,C=(e-t)/i;for(let d=0;d<=r;d++){let b=[],R=d/r,L=R*(e-t)+t;for(let g=0;g<=s;g++){let w=g/s,T=w*m+u,S=Math.sin(T),I=Math.cos(T);A.x=L*S,A.y=-R*i+c,A.z=L*I,y.push(A.x,A.y,A.z),v.set(S,C,I).normalize(),h.push(v.x,v.y,v.z),o.push(w,1-R),b.push(l++)}p.push(b)}for(let d=0;d<s;d++)for(let b=0;b<r;b++){let R=p[b][d],L=p[b+1][d],g=p[b+1][d+1],w=p[b][d+1];(t>0||b!==0)&&(M.push(R,L,w),P+=3),(e>0||b!==r-1)&&(M.push(L,g,w),P+=3)}x.addGroup(f,P,0),f+=P}function _(v){let A=l,P=new ne,C=new W,d=0,b=v===!0?t:e,R=v===!0?1:-1;for(let g=1;g<=s;g++)y.push(0,c*R,0),h.push(0,R,0),o.push(.5,.5),l++;let L=l;for(let g=0;g<=s;g++){let T=g/s*m+u,S=Math.cos(T),I=Math.sin(T);C.x=b*I,C.y=c*R,C.z=b*S,y.push(C.x,C.y,C.z),h.push(0,R,0),P.x=S*.5+.5,P.y=I*.5*R+.5,o.push(P.x,P.y),l++}for(let g=0;g<s;g++){let w=A+g,T=L+g;v===!0?M.push(T,T+1,w):M.push(T+1,T,w),d+=3}x.addGroup(f,d,v===!0?1:2),f+=d}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},ls=class n extends os{constructor(t=1,e=1,i=32,s=1,r=!1,a=0,u=Math.PI*2){super(0,t,e,i,s,r,a,u),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:u}}static fromJSON(t){return new n(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var rn=class n extends ge{constructor(t=1,e=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:s};let r=t/2,a=e/2,u=Math.floor(i),m=Math.floor(s),x=u+1,M=m+1,y=t/u,h=e/m,o=[],l=[],p=[],c=[];for(let f=0;f<M;f++){let E=f*h-a;for(let _=0;_<x;_++){let v=_*y-r;l.push(v,-E,0),p.push(0,0,1),c.push(_/u),c.push(1-f/m)}}for(let f=0;f<m;f++)for(let E=0;E<u;E++){let _=E+x*f,v=E+x*(f+1),A=E+1+x*(f+1),P=E+1+x*f;o.push(_,v,P),o.push(v,A,P)}this.setIndex(o),this.setAttribute("position",new he(l,3)),this.setAttribute("normal",new he(p,3)),this.setAttribute("uv",new he(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.width,t.height,t.widthSegments,t.heightSegments)}};var Rn=class n extends ge{constructor(t=1,e=32,i=16,s=0,r=Math.PI*2,a=0,u=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:s,phiLength:r,thetaStart:a,thetaLength:u},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));let m=Math.min(a+u,Math.PI),x=0,M=[],y=new W,h=new W,o=[],l=[],p=[],c=[];for(let f=0;f<=i;f++){let E=[],_=f/i,v=0;f===0&&a===0?v=.5/e:f===i&&m===Math.PI&&(v=-.5/e);for(let A=0;A<=e;A++){let P=A/e;y.x=-t*Math.cos(s+P*r)*Math.sin(a+_*u),y.y=t*Math.cos(a+_*u),y.z=t*Math.sin(s+P*r)*Math.sin(a+_*u),l.push(y.x,y.y,y.z),h.copy(y).normalize(),p.push(h.x,h.y,h.z),c.push(P+v,1-_),E.push(x++)}M.push(E)}for(let f=0;f<i;f++)for(let E=0;E<e;E++){let _=M[f][E+1],v=M[f][E],A=M[f+1][E],P=M[f+1][E+1];(f!==0||a>0)&&o.push(_,v,P),(f!==i-1||m<Math.PI)&&o.push(v,A,P)}this.setIndex(o),this.setAttribute("position",new he(l,3)),this.setAttribute("normal",new he(p,3)),this.setAttribute("uv",new he(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};function Ln(n){let t={};for(let e in n){t[e]={};for(let i in n[e]){let s=n[e][i];if(Bc(s))s.isRenderTargetTexture?(Ft("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=s.clone();else if(Array.isArray(s))if(Bc(s[0])){let r=[];for(let a=0,u=s.length;a<u;a++)r[a]=s[a].clone();t[e][i]=r}else t[e][i]=s.slice();else t[e][i]=s}}return t}function Ue(n){let t={};for(let e=0;e<n.length;e++){let i=Ln(n[e]);for(let s in i)t[s]=i[s]}return t}function Bc(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function yd(n){let t=[];for(let e=0;e<n.length;e++)t.push(n[e].clone());return t}function Cl(n){let t=n.getRenderTarget();return t===null?n.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Zt.workingColorSpace}var Eh={clone:Ln,merge:Ue},vd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,_d=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ze=class extends ki{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=vd,this.fragmentShader=_d,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Ln(t.uniforms),this.uniformsGroups=yd(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}},an=class extends ze{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}};var ta=class extends ki{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=dh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},ea=class extends ki{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Pr(n,t){return!n||n.constructor===t?n:typeof t.BYTES_PER_ELEMENT=="number"?new t(n):Array.prototype.slice.call(n)}var on=class{constructor(t,e,i,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,s=e[i],r=e[i-1];i:{t:{let a;e:{n:if(!(t<s)){for(let u=i+2;;){if(s===void 0){if(t<r)break n;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===u)break;if(r=s,s=e[++i],t<s)break t}a=e.length;break e}if(!(t>=r)){let u=e[1];t<u&&(i=2,r=u);for(let m=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===m)break;if(s=r,r=e[--i-1],t>=r)break t}a=i,i=0;break e}break i}for(;i<a;){let u=i+a>>>1;t<e[u]?a=u:i=u+1}if(s=e[i],r=e[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=i[r+a];return e}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},ia=class extends on{constructor(t,e,i,s){super(t,e,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:tl,endingEnd:tl}}intervalChanged_(t,e,i){let s=this.parameterPositions,r=t-2,a=t+1,u=s[r],m=s[a];if(u===void 0)switch(this.getSettings_().endingStart){case el:r=t,u=2*e-i;break;case il:r=s.length-2,u=e+s[r]-s[r+1];break;default:r=t,u=i}if(m===void 0)switch(this.getSettings_().endingEnd){case el:a=t,m=2*i-e;break;case il:a=1,m=i+s[1]-s[0];break;default:a=t-1,m=e}let x=(i-e)*.5,M=this.valueSize;this._weightPrev=x/(e-u),this._weightNext=x/(m-i),this._offsetPrev=r*M,this._offsetNext=a*M}interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,u=this.valueSize,m=t*u,x=m-u,M=this._offsetPrev,y=this._offsetNext,h=this._weightPrev,o=this._weightNext,l=(i-e)/(s-e),p=l*l,c=p*l,f=-h*c+2*h*p-h*l,E=(1+h)*c+(-1.5-2*h)*p+(-.5+h)*l+1,_=(-1-o)*c+(1.5+o)*p+.5*l,v=o*c-o*p;for(let A=0;A!==u;++A)r[A]=f*a[M+A]+E*a[x+A]+_*a[m+A]+v*a[y+A];return r}},na=class extends on{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,u=this.valueSize,m=t*u,x=m-u,M=(i-e)/(s-e),y=1-M;for(let h=0;h!==u;++h)r[h]=a[x+h]*y+a[m+h]*M;return r}},sa=class extends on{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t){return this.copySampleValue_(t-1)}},ra=class extends on{interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,u=this.valueSize,m=t*u,x=m-u,M=this.settings||this.DefaultSettings_,y=M.inTangents,h=M.outTangents;if(!y||!h){let p=(i-e)/(s-e),c=1-p;for(let f=0;f!==u;++f)r[f]=a[x+f]*c+a[m+f]*p;return r}let o=u*2,l=t-1;for(let p=0;p!==u;++p){let c=a[x+p],f=a[m+p],E=l*o+p*2,_=h[E],v=h[E+1],A=t*o+p*2,P=y[A],C=y[A+1],d=(i-e)/(s-e),b,R,L,g,w;for(let T=0;T<8;T++){b=d*d,R=b*d,L=1-d,g=L*L,w=g*L;let I=w*e+3*g*d*_+3*L*b*P+R*s-i;if(Math.abs(I)<1e-10)break;let D=3*g*(_-e)+6*L*d*(P-_)+3*b*(s-P);if(Math.abs(D)<1e-10)break;d=d-I/D,d=Math.max(0,Math.min(1,d))}r[p]=w*c+3*g*d*v+3*L*b*C+R*f}return r}},Je=class{constructor(t,e,i,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Pr(e,this.TimeBufferType),this.values=Pr(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:Pr(t.times,Array),values:Pr(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(i.interpolation=s)}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new sa(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new na(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new ia(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new ra(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.settings=this.settings),e}setInterpolation(t){let e;switch(t){case Es:e=this.InterpolantFactoryMethodDiscrete;break;case Gr:e=this.InterpolantFactoryMethodLinear;break;case Fr:e=this.InterpolantFactoryMethodSmooth;break;case Qo:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Ft("KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Es;case this.InterpolantFactoryMethodLinear:return Gr;case this.InterpolantFactoryMethodSmooth:return Fr;case this.InterpolantFactoryMethodBezier:return Qo}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,s=e.length;i!==s;++i)e[i]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,s=e.length;i!==s;++i)e[i]*=t}return this}trim(t,e){let i=this.times,s=i.length,r=0,a=s-1;for(;r!==s&&i[r]<t;)++r;for(;a!==-1&&i[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let u=this.getValueSize();this.times=i.slice(r,a),this.values=this.values.slice(r*u,a*u)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Nt("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,s=this.values,r=i.length;r===0&&(Nt("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let u=0;u!==r;u++){let m=i[u];if(typeof m=="number"&&isNaN(m)){Nt("KeyframeTrack: Time is not a valid number.",this,u,m),t=!1;break}if(a!==null&&a>m){Nt("KeyframeTrack: Out of order keys.",this,u,m,a),t=!1;break}a=m}if(s!==void 0&&Ku(s))for(let u=0,m=s.length;u!==m;++u){let x=s[u];if(isNaN(x)){Nt("KeyframeTrack: Value is not a valid number.",this,u,x),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Fr,r=t.length-1,a=1;for(let u=1;u<r;++u){let m=!1,x=t[u],M=t[u+1];if(x!==M&&(u!==1||x!==t[0]))if(s)m=!0;else{let y=u*i,h=y-i,o=y+i;for(let l=0;l!==i;++l){let p=e[y+l];if(p!==e[h+l]||p!==e[o+l]){m=!0;break}}}if(m){if(u!==a){t[a]=t[u];let y=u*i,h=a*i;for(let o=0;o!==i;++o)e[h+o]=e[y+o]}++a}}if(r>0){t[a]=t[r];for(let u=r*i,m=a*i,x=0;x!==i;++x)e[m+x]=e[u+x];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*i)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),i=this.constructor,s=new i(this.name,t,e);return s.createInterpolant=this.createInterpolant,s}};Je.prototype.ValueTypeName="";Je.prototype.TimeBufferType=Float32Array;Je.prototype.ValueBufferType=Float32Array;Je.prototype.DefaultInterpolation=Gr;var ln=class extends Je{constructor(t,e,i){super(t,e,i)}};ln.prototype.ValueTypeName="bool";ln.prototype.ValueBufferType=Array;ln.prototype.DefaultInterpolation=Es;ln.prototype.InterpolantFactoryMethodLinear=void 0;ln.prototype.InterpolantFactoryMethodSmooth=void 0;var aa=class extends Je{constructor(t,e,i,s){super(t,e,i,s)}};aa.prototype.ValueTypeName="color";var oa=class extends Je{constructor(t,e,i,s){super(t,e,i,s)}};oa.prototype.ValueTypeName="number";var la=class extends on{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,u=this.valueSize,m=(i-e)/(s-e),x=t*u;for(let M=x+u;x!==M;x+=4)Si.slerpFlat(r,0,a,x-u,a,x,m);return r}},ks=class extends Je{constructor(t,e,i,s){super(t,e,i,s)}InterpolantFactoryMethodLinear(t){return new la(this.times,this.values,this.getValueSize(),t)}};ks.prototype.ValueTypeName="quaternion";ks.prototype.InterpolantFactoryMethodSmooth=void 0;var cn=class extends Je{constructor(t,e,i){super(t,e,i)}};cn.prototype.ValueTypeName="string";cn.prototype.ValueBufferType=Array;cn.prototype.DefaultInterpolation=Es;cn.prototype.InterpolantFactoryMethodLinear=void 0;cn.prototype.InterpolantFactoryMethodSmooth=void 0;var ca=class extends Je{constructor(t,e,i,s){super(t,e,i,s)}};ca.prototype.ValueTypeName="vector";var Nr={enabled:!1,files:{},add:function(n,t){this.enabled!==!1&&(kc(n)||(this.files[n]=t))},get:function(n){if(this.enabled!==!1&&!kc(n))return this.files[n]},remove:function(n){delete this.files[n]},clear:function(){this.files={}}};function kc(n){try{let t=n.slice(n.indexOf(":")+1);return new URL(t).protocol==="blob:"}catch{return!1}}var ha=class{constructor(t,e,i){let s=this,r=!1,a=0,u=0,m,x=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this._abortController=null,this.itemStart=function(M){u++,r===!1&&s.onStart!==void 0&&s.onStart(M,a,u),r=!0},this.itemEnd=function(M){a++,s.onProgress!==void 0&&s.onProgress(M,a,u),a===u&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(M){s.onError!==void 0&&s.onError(M)},this.resolveURL=function(M){return m?m(M):M},this.setURLModifier=function(M){return m=M,this},this.addHandler=function(M,y){return x.push(M,y),this},this.removeHandler=function(M){let y=x.indexOf(M);return y!==-1&&x.splice(y,2),this},this.getHandler=function(M){for(let y=0,h=x.length;y<h;y+=2){let o=x[y],l=x[y+1];if(o.global&&(o.lastIndex=0),o.test(M))return l}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Th=new ha,cs=class{constructor(t){this.manager=t!==void 0?t:Th,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let i=this;return new Promise(function(s,r){i.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};cs.DEFAULT_MATERIAL_NAME="__DEFAULT";var jn=new WeakMap,ua=class extends cs{constructor(t){super(t)}load(t,e,i,s){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);let r=this,a=Nr.get(`image:${t}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(t),setTimeout(function(){e&&e(a),r.manager.itemEnd(t)},0);else{let y=jn.get(a);y===void 0&&(y=[],jn.set(a,y)),y.push({onLoad:e,onError:s})}return a}let u=is("img");function m(){M(),e&&e(this);let y=jn.get(this)||[];for(let h=0;h<y.length;h++){let o=y[h];o.onLoad&&o.onLoad(this)}jn.delete(this),r.manager.itemEnd(t)}function x(y){M(),s&&s(y),Nr.remove(`image:${t}`);let h=jn.get(this)||[];for(let o=0;o<h.length;o++){let l=h[o];l.onError&&l.onError(y)}jn.delete(this),r.manager.itemError(t),r.manager.itemEnd(t)}function M(){u.removeEventListener("load",m,!1),u.removeEventListener("error",x,!1)}return u.addEventListener("load",m,!1),u.addEventListener("error",x,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(u.crossOrigin=this.crossOrigin),Nr.add(`image:${t}`,u),r.manager.itemStart(t),u.src=t,u}};var zs=class extends cs{constructor(t){super(t)}load(t,e,i,s){let r=new Ne,a=new ua(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(t,function(u){r.image=u,r.needsUpdate=!0,e!==void 0&&e(r)},i,s),r}};var Lr=new W,Dr=new Si,xi=new W,Vi=class extends We{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new se,this.projectionMatrix=new se,this.projectionMatrixInverse=new se,this.coordinateSystem=ci,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Lr,Dr,xi),xi.x===1&&xi.y===1&&xi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Lr,Dr,xi.set(1,1,1)).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorld.decompose(Lr,Dr,xi),xi.x===1&&xi.y===1&&xi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Lr,Dr,xi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},ji=new W,zc=new ne,Vc=new ne,Re=class extends Vi{constructor(t=50,e=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=qr*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Ro*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return qr*2*Math.atan(Math.tan(Ro*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){ji.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(ji.x,ji.y).multiplyScalar(-t/ji.z),ji.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(ji.x,ji.y).multiplyScalar(-t/ji.z)}getViewSize(t,e){return this.getViewBounds(t,zc,Vc),e.subVectors(Vc,zc)}setViewOffset(t,e,i,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Ro*.5*this.fov)/this.zoom,i=2*e,s=this.aspect*i,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let m=a.fullWidth,x=a.fullHeight;r+=a.offsetX*s/m,e-=a.offsetY*i/x,s*=a.width/m,i*=a.height/x}let u=this.filmOffset;u!==0&&(r+=t*u/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var Vs=class extends Vi{constructor(t=-1,e=1,i=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-t,a=i+t,u=s+e,m=s-e;if(this.view!==null&&this.view.enabled){let x=(this.right-this.left)/this.view.fullWidth/this.zoom,M=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=x*this.view.offsetX,a=r+x*this.view.width,u-=M*this.view.offsetY,m=u-M*this.view.height}this.projectionMatrix.makeOrthographic(r,a,u,m,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}};var Kn=-90,$n=1,da=class extends We{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Re(Kn,$n,t,e);s.layers=this.layers,this.add(s);let r=new Re(Kn,$n,t,e);r.layers=this.layers,this.add(r);let a=new Re(Kn,$n,t,e);a.layers=this.layers,this.add(a);let u=new Re(Kn,$n,t,e);u.layers=this.layers,this.add(u);let m=new Re(Kn,$n,t,e);m.layers=this.layers,this.add(m);let x=new Re(Kn,$n,t,e);x.layers=this.layers,this.add(x)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,s,r,a,u,m]=e;for(let x of e)this.remove(x);if(t===ci)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),u.up.set(0,1,0),u.lookAt(0,0,1),m.up.set(0,1,0),m.lookAt(0,0,-1);else if(t===As)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),u.up.set(0,-1,0),u.lookAt(0,0,1),m.up.set(0,-1,0),m.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let x of e)this.add(x),x.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,u,m,x,M]=this.children,y=t.getRenderTarget(),h=t.getActiveCubeFace(),o=t.getActiveMipmapLevel(),l=t.xr.enabled;t.xr.enabled=!1;let p=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let c=!1;t.isWebGLRenderer===!0?c=t.state.buffers.depth.getReversed():c=t.reversedDepthBuffer,t.setRenderTarget(i,0,s),c&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(i,1,s),c&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(i,2,s),c&&t.autoClear===!1&&t.clearDepth(),t.render(e,u),t.setRenderTarget(i,3,s),c&&t.autoClear===!1&&t.clearDepth(),t.render(e,m),t.setRenderTarget(i,4,s),c&&t.autoClear===!1&&t.clearDepth(),t.render(e,x),i.texture.generateMipmaps=p,t.setRenderTarget(i,5,s),c&&t.autoClear===!1&&t.clearDepth(),t.render(e,M),t.setRenderTarget(y,h,o),t.xr.enabled=l,i.texture.needsPMREMUpdate=!0}},fa=class extends Re{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var Rl="\\[\\]\\.:\\/",Md=new RegExp("["+Rl+"]","g"),Il="[^"+Rl+"]",bd="[^"+Rl.replace("\\.","")+"]",Sd=/((?:WC+[\/:])*)/.source.replace("WC",Il),wd=/(WCOD+)?/.source.replace("WCOD",bd),Ed=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Il),Td=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Il),Ad=new RegExp("^"+Sd+wd+Ed+Td+"$"),Cd=["material","materials","bones","map"],rl=class{constructor(t,e,i){let s=i||me.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}},me=class n{constructor(t,e,i){this.path=e,this.parsedPath=i||n.parseTrackName(e),this.node=n.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){return t&&t.isAnimationObjectGroup?new n.Composite(t,e,i):new n(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Md,"")}static parseTrackName(t){let e=Ad.exec(t);if(e===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);Cd.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(r){for(let a=0;a<r.length;a++){let u=r[a];if(u.name===e||u.uuid===e)return u;let m=i(u.children);if(m)return m}return null},s=i(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)t[e++]=i[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,i=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=n.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Ft("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let x=e.objectIndex;switch(i){case"materials":if(!t.material){Nt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Nt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Nt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let M=0;M<t.length;M++)if(t[M].name===x){x=M;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Nt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Nt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Nt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(x!==void 0){if(t[x]===void 0){Nt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[x]}}let a=t[s];if(a===void 0){let x=e.nodeName;Nt("PropertyBinding: Trying to update property for track: "+x+"."+s+" but it wasn't found.",t);return}let u=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?u=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(u=this.Versioning.MatrixWorldNeedsUpdate);let m=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Nt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Nt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}m=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(m=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(m=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[m],this.setValue=this.SetterByBindingTypeAndVersioning[m][u]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};me.Composite=rl;me.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};me.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};me.prototype.GetterByBindingType=[me.prototype._getValue_direct,me.prototype._getValue_array,me.prototype._getValue_arrayElement,me.prototype._getValue_toArray];me.prototype.SetterByBindingTypeAndVersioning=[[me.prototype._setValue_direct,me.prototype._setValue_direct_setNeedsUpdate,me.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[me.prototype._setValue_array,me.prototype._setValue_array_setNeedsUpdate,me.prototype._setValue_array_setMatrixWorldNeedsUpdate],[me.prototype._setValue_arrayElement,me.prototype._setValue_arrayElement_setNeedsUpdate,me.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[me.prototype._setValue_fromArray,me.prototype._setValue_fromArray_setNeedsUpdate,me.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Bg=new Float32Array(1);var Hc=new se,Hs=class{constructor(t,e,i=0,s=1/0){this.ray=new En(t,e),this.near=i,this.far=s,this.camera=null,this.layers=new rs,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):Nt("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Hc.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Hc),this}intersectObject(t,e=!0,i=[]){return al(t,this,i,e),i.sort(Gc),i}intersectObjects(t,e=!0,i=[]){for(let s=0,r=t.length;s<r;s++)al(t[s],this,i,e);return i.sort(Gc),i}};function Gc(n,t){return n.distance-t.distance}function al(n,t,e,i){let s=!0;if(n.layers.test(t.layers)&&n.raycast(t,e)===!1&&(s=!1),s===!0&&i===!0){let r=n.children;for(let a=0,u=r.length;a<u;a++)al(r[a],t,e,!0)}}var ol=class n{static{n.prototype.isMatrix2=!0}constructor(t,e,i,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let i=0;i<4;i++)this.elements[i]=t[i+e];return this}set(t,e,i,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=i,r[3]=s,this}};function Pl(n,t,e,i){let s=Rd(i);switch(e){case wl:return n*t;case ba:return n*t/s.components*s.byteLength;case Sa:return n*t/s.components*s.byteLength;case dn:return n*t*2/s.components*s.byteLength;case wa:return n*t*2/s.components*s.byteLength;case El:return n*t*3/s.components*s.byteLength;case ni:return n*t*4/s.components*s.byteLength;case Ea:return n*t*4/s.components*s.byteLength;case qs:case Ys:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case Zs:case Js:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case Aa:case Ra:return Math.max(n,16)*Math.max(t,8)/4;case Ta:case Ca:return Math.max(n,8)*Math.max(t,8)/2;case Ia:case Pa:case Da:case Fa:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case La:case js:case Na:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case Ua:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case Oa:return Math.floor((n+4)/5)*Math.floor((t+3)/4)*16;case Ba:return Math.floor((n+4)/5)*Math.floor((t+4)/5)*16;case ka:return Math.floor((n+5)/6)*Math.floor((t+4)/5)*16;case za:return Math.floor((n+5)/6)*Math.floor((t+5)/6)*16;case Va:return Math.floor((n+7)/8)*Math.floor((t+4)/5)*16;case Ha:return Math.floor((n+7)/8)*Math.floor((t+5)/6)*16;case Ga:return Math.floor((n+7)/8)*Math.floor((t+7)/8)*16;case Wa:return Math.floor((n+9)/10)*Math.floor((t+4)/5)*16;case Xa:return Math.floor((n+9)/10)*Math.floor((t+5)/6)*16;case qa:return Math.floor((n+9)/10)*Math.floor((t+7)/8)*16;case Ya:return Math.floor((n+9)/10)*Math.floor((t+9)/10)*16;case Za:return Math.floor((n+11)/12)*Math.floor((t+9)/10)*16;case Ja:return Math.floor((n+11)/12)*Math.floor((t+11)/12)*16;case ja:case Ka:case $a:return Math.ceil(n/4)*Math.ceil(t/4)*16;case Qa:case to:return Math.ceil(n/4)*Math.ceil(t/4)*8;case Ks:case eo:return Math.ceil(n/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Rd(n){switch(n){case Ke:case _l:return{byteLength:1,components:1};case us:case Ml:case Ci:return{byteLength:2,components:1};case _a:case Ma:return{byteLength:2,components:4};case pi:case va:case ii:return{byteLength:4,components:1};case bl:case Sl:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"184"}}));typeof window<"u"&&(window.__THREE__?Ft("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="184");function Jh(){let n=null,t=!1,e=null,i=null;function s(r,a){e(r,a),i=n.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&n!==null&&(i=n.requestAnimationFrame(s),t=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){n=r}}}function Pd(n){let t=new WeakMap;function e(u,m){let x=u.array,M=u.usage,y=x.byteLength,h=n.createBuffer();n.bindBuffer(m,h),n.bufferData(m,x,M),u.onUploadCallback();let o;if(x instanceof Float32Array)o=n.FLOAT;else if(typeof Float16Array<"u"&&x instanceof Float16Array)o=n.HALF_FLOAT;else if(x instanceof Uint16Array)u.isFloat16BufferAttribute?o=n.HALF_FLOAT:o=n.UNSIGNED_SHORT;else if(x instanceof Int16Array)o=n.SHORT;else if(x instanceof Uint32Array)o=n.UNSIGNED_INT;else if(x instanceof Int32Array)o=n.INT;else if(x instanceof Int8Array)o=n.BYTE;else if(x instanceof Uint8Array)o=n.UNSIGNED_BYTE;else if(x instanceof Uint8ClampedArray)o=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+x);return{buffer:h,type:o,bytesPerElement:x.BYTES_PER_ELEMENT,version:u.version,size:y}}function i(u,m,x){let M=m.array,y=m.updateRanges;if(n.bindBuffer(x,u),y.length===0)n.bufferSubData(x,0,M);else{y.sort((o,l)=>o.start-l.start);let h=0;for(let o=1;o<y.length;o++){let l=y[h],p=y[o];p.start<=l.start+l.count+1?l.count=Math.max(l.count,p.start+p.count-l.start):(++h,y[h]=p)}y.length=h+1;for(let o=0,l=y.length;o<l;o++){let p=y[o];n.bufferSubData(x,p.start*M.BYTES_PER_ELEMENT,M,p.start,p.count)}m.clearUpdateRanges()}m.onUploadCallback()}function s(u){return u.isInterleavedBufferAttribute&&(u=u.data),t.get(u)}function r(u){u.isInterleavedBufferAttribute&&(u=u.data);let m=t.get(u);m&&(n.deleteBuffer(m.buffer),t.delete(u))}function a(u,m){if(u.isInterleavedBufferAttribute&&(u=u.data),u.isGLBufferAttribute){let M=t.get(u);(!M||M.version<u.version)&&t.set(u,{buffer:u.buffer,type:u.type,bytesPerElement:u.elementSize,version:u.version});return}let x=t.get(u);if(x===void 0)t.set(u,e(u,m));else if(x.version<u.version){if(x.size!==u.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(x.buffer,u,m),x.version=u.version}}return{get:s,remove:r,update:a}}var Ld=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Dd=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Fd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Nd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ud=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Od=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Bd=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,kd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,zd=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Vd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Hd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Gd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Wd=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Xd=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,qd=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Yd=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Zd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Jd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,jd=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Kd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,$d=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Qd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,tf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,ef=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,nf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,sf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,rf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,af=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,of=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,lf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,cf="gl_FragColor = linearToOutputTexel( gl_FragColor );",hf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,uf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,df=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,ff=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,pf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,mf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,gf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,xf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,yf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,vf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,_f=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Mf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,bf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Sf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,wf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Ef=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Tf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Af=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Cf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Rf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,If=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Pf=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Lf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = inverseTransformDirection( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Df=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Ff=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Nf=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Uf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Of=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Bf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,kf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,zf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Vf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Hf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Gf=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Wf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Xf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,qf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Yf=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Zf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Jf=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,jf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Kf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,$f=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Qf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,tp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ep=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,ip=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,np=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,sp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,rp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ap=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,op=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,lp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,cp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,hp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,up=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,fp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,pp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,mp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,gp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,xp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,yp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,vp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,_p=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Mp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,bp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Sp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,wp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Ep=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Tp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Ap=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Cp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Rp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Ip=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Pp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Lp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Dp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Fp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Np=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Up=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Op=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Bp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,kp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,zp=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Vp=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Hp=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Gp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Wp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Xp=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,qp=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Yp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Zp=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Jp=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,jp=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Kp=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,$p=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Qp=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,tm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,em=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,im=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,nm=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,sm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,rm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,am=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,om=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,lm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,cm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,hm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,um=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,dm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Xt={alphahash_fragment:Ld,alphahash_pars_fragment:Dd,alphamap_fragment:Fd,alphamap_pars_fragment:Nd,alphatest_fragment:Ud,alphatest_pars_fragment:Od,aomap_fragment:Bd,aomap_pars_fragment:kd,batching_pars_vertex:zd,batching_vertex:Vd,begin_vertex:Hd,beginnormal_vertex:Gd,bsdfs:Wd,iridescence_fragment:Xd,bumpmap_pars_fragment:qd,clipping_planes_fragment:Yd,clipping_planes_pars_fragment:Zd,clipping_planes_pars_vertex:Jd,clipping_planes_vertex:jd,color_fragment:Kd,color_pars_fragment:$d,color_pars_vertex:Qd,color_vertex:tf,common:ef,cube_uv_reflection_fragment:nf,defaultnormal_vertex:sf,displacementmap_pars_vertex:rf,displacementmap_vertex:af,emissivemap_fragment:of,emissivemap_pars_fragment:lf,colorspace_fragment:cf,colorspace_pars_fragment:hf,envmap_fragment:uf,envmap_common_pars_fragment:df,envmap_pars_fragment:ff,envmap_pars_vertex:pf,envmap_physical_pars_fragment:Ef,envmap_vertex:mf,fog_vertex:gf,fog_pars_vertex:xf,fog_fragment:yf,fog_pars_fragment:vf,gradientmap_pars_fragment:_f,lightmap_pars_fragment:Mf,lights_lambert_fragment:bf,lights_lambert_pars_fragment:Sf,lights_pars_begin:wf,lights_toon_fragment:Tf,lights_toon_pars_fragment:Af,lights_phong_fragment:Cf,lights_phong_pars_fragment:Rf,lights_physical_fragment:If,lights_physical_pars_fragment:Pf,lights_fragment_begin:Lf,lights_fragment_maps:Df,lights_fragment_end:Ff,lightprobes_pars_fragment:Nf,logdepthbuf_fragment:Uf,logdepthbuf_pars_fragment:Of,logdepthbuf_pars_vertex:Bf,logdepthbuf_vertex:kf,map_fragment:zf,map_pars_fragment:Vf,map_particle_fragment:Hf,map_particle_pars_fragment:Gf,metalnessmap_fragment:Wf,metalnessmap_pars_fragment:Xf,morphinstance_vertex:qf,morphcolor_vertex:Yf,morphnormal_vertex:Zf,morphtarget_pars_vertex:Jf,morphtarget_vertex:jf,normal_fragment_begin:Kf,normal_fragment_maps:$f,normal_pars_fragment:Qf,normal_pars_vertex:tp,normal_vertex:ep,normalmap_pars_fragment:ip,clearcoat_normal_fragment_begin:np,clearcoat_normal_fragment_maps:sp,clearcoat_pars_fragment:rp,iridescence_pars_fragment:ap,opaque_fragment:op,packing:lp,premultiplied_alpha_fragment:cp,project_vertex:hp,dithering_fragment:up,dithering_pars_fragment:dp,roughnessmap_fragment:fp,roughnessmap_pars_fragment:pp,shadowmap_pars_fragment:mp,shadowmap_pars_vertex:gp,shadowmap_vertex:xp,shadowmask_pars_fragment:yp,skinbase_vertex:vp,skinning_pars_vertex:_p,skinning_vertex:Mp,skinnormal_vertex:bp,specularmap_fragment:Sp,specularmap_pars_fragment:wp,tonemapping_fragment:Ep,tonemapping_pars_fragment:Tp,transmission_fragment:Ap,transmission_pars_fragment:Cp,uv_pars_fragment:Rp,uv_pars_vertex:Ip,uv_vertex:Pp,worldpos_vertex:Lp,background_vert:Dp,background_frag:Fp,backgroundCube_vert:Np,backgroundCube_frag:Up,cube_vert:Op,cube_frag:Bp,depth_vert:kp,depth_frag:zp,distance_vert:Vp,distance_frag:Hp,equirect_vert:Gp,equirect_frag:Wp,linedashed_vert:Xp,linedashed_frag:qp,meshbasic_vert:Yp,meshbasic_frag:Zp,meshlambert_vert:Jp,meshlambert_frag:jp,meshmatcap_vert:Kp,meshmatcap_frag:$p,meshnormal_vert:Qp,meshnormal_frag:tm,meshphong_vert:em,meshphong_frag:im,meshphysical_vert:nm,meshphysical_frag:sm,meshtoon_vert:rm,meshtoon_frag:am,points_vert:om,points_frag:lm,shadow_vert:cm,shadow_frag:hm,sprite_vert:um,sprite_frag:dm},vt={common:{diffuse:{value:new ee(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new zt},alphaMap:{value:null},alphaMapTransform:{value:new zt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new zt}},envmap:{envMap:{value:null},envMapRotation:{value:new zt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new zt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new zt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new zt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new zt},normalScale:{value:new ne(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new zt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new zt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new zt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new zt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ee(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new W},probesMax:{value:new W},probesResolution:{value:new W}},points:{diffuse:{value:new ee(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new zt},alphaTest:{value:0},uvTransform:{value:new zt}},sprite:{diffuse:{value:new ee(16777215)},opacity:{value:1},center:{value:new ne(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new zt},alphaMap:{value:null},alphaMapTransform:{value:new zt},alphaTest:{value:0}}},Ii={basic:{uniforms:Ue([vt.common,vt.specularmap,vt.envmap,vt.aomap,vt.lightmap,vt.fog]),vertexShader:Xt.meshbasic_vert,fragmentShader:Xt.meshbasic_frag},lambert:{uniforms:Ue([vt.common,vt.specularmap,vt.envmap,vt.aomap,vt.lightmap,vt.emissivemap,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.fog,vt.lights,{emissive:{value:new ee(0)},envMapIntensity:{value:1}}]),vertexShader:Xt.meshlambert_vert,fragmentShader:Xt.meshlambert_frag},phong:{uniforms:Ue([vt.common,vt.specularmap,vt.envmap,vt.aomap,vt.lightmap,vt.emissivemap,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.fog,vt.lights,{emissive:{value:new ee(0)},specular:{value:new ee(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Xt.meshphong_vert,fragmentShader:Xt.meshphong_frag},standard:{uniforms:Ue([vt.common,vt.envmap,vt.aomap,vt.lightmap,vt.emissivemap,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.roughnessmap,vt.metalnessmap,vt.fog,vt.lights,{emissive:{value:new ee(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Xt.meshphysical_vert,fragmentShader:Xt.meshphysical_frag},toon:{uniforms:Ue([vt.common,vt.aomap,vt.lightmap,vt.emissivemap,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.gradientmap,vt.fog,vt.lights,{emissive:{value:new ee(0)}}]),vertexShader:Xt.meshtoon_vert,fragmentShader:Xt.meshtoon_frag},matcap:{uniforms:Ue([vt.common,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.fog,{matcap:{value:null}}]),vertexShader:Xt.meshmatcap_vert,fragmentShader:Xt.meshmatcap_frag},points:{uniforms:Ue([vt.points,vt.fog]),vertexShader:Xt.points_vert,fragmentShader:Xt.points_frag},dashed:{uniforms:Ue([vt.common,vt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Xt.linedashed_vert,fragmentShader:Xt.linedashed_frag},depth:{uniforms:Ue([vt.common,vt.displacementmap]),vertexShader:Xt.depth_vert,fragmentShader:Xt.depth_frag},normal:{uniforms:Ue([vt.common,vt.bumpmap,vt.normalmap,vt.displacementmap,{opacity:{value:1}}]),vertexShader:Xt.meshnormal_vert,fragmentShader:Xt.meshnormal_frag},sprite:{uniforms:Ue([vt.sprite,vt.fog]),vertexShader:Xt.sprite_vert,fragmentShader:Xt.sprite_frag},background:{uniforms:{uvTransform:{value:new zt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Xt.background_vert,fragmentShader:Xt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new zt}},vertexShader:Xt.backgroundCube_vert,fragmentShader:Xt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Xt.cube_vert,fragmentShader:Xt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Xt.equirect_vert,fragmentShader:Xt.equirect_frag},distance:{uniforms:Ue([vt.common,vt.displacementmap,{referencePosition:{value:new W},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Xt.distance_vert,fragmentShader:Xt.distance_frag},shadow:{uniforms:Ue([vt.lights,vt.fog,{color:{value:new ee(0)},opacity:{value:1}}]),vertexShader:Xt.shadow_vert,fragmentShader:Xt.shadow_frag}};Ii.physical={uniforms:Ue([Ii.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new zt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new zt},clearcoatNormalScale:{value:new ne(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new zt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new zt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new zt},sheen:{value:0},sheenColor:{value:new ee(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new zt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new zt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new zt},transmissionSamplerSize:{value:new ne},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new zt},attenuationDistance:{value:0},attenuationColor:{value:new ee(0)},specularColor:{value:new ee(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new zt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new zt},anisotropyVector:{value:new ne},anisotropyMap:{value:null},anisotropyMapTransform:{value:new zt}}]),vertexShader:Xt.meshphysical_vert,fragmentShader:Xt.meshphysical_frag};var ro={r:0,b:0,g:0},fm=new se,jh=new zt;jh.set(-1,0,0,0,1,0,0,0,1);function pm(n,t,e,i,s,r){let a=new ee(0),u=s===!0?0:1,m,x,M=null,y=0,h=null;function o(E){let _=E.isScene===!0?E.background:null;if(_&&_.isTexture){let v=E.backgroundBlurriness>0;_=t.get(_,v)}return _}function l(E){let _=!1,v=o(E);v===null?c(a,u):v&&v.isColor&&(c(v,1),_=!0);let A=n.xr.getEnvironmentBlendMode();A==="additive"?e.buffers.color.setClear(0,0,0,1,r):A==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(n.autoClear||_)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function p(E,_){let v=o(_);v&&(v.isCubeTexture||v.mapping===Ws)?(x===void 0&&(x=new ae(new Ti(1,1,1),new ze({name:"BackgroundCubeMaterial",uniforms:Ln(Ii.backgroundCube.uniforms),vertexShader:Ii.backgroundCube.vertexShader,fragmentShader:Ii.backgroundCube.fragmentShader,side:Ve,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),x.geometry.deleteAttribute("normal"),x.geometry.deleteAttribute("uv"),x.onBeforeRender=function(A,P,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(x.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(x)),x.material.uniforms.envMap.value=v,x.material.uniforms.backgroundBlurriness.value=_.backgroundBlurriness,x.material.uniforms.backgroundIntensity.value=_.backgroundIntensity,x.material.uniforms.backgroundRotation.value.setFromMatrix4(fm.makeRotationFromEuler(_.backgroundRotation)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&x.material.uniforms.backgroundRotation.value.premultiply(jh),x.material.toneMapped=Zt.getTransfer(v.colorSpace)!==re,(M!==v||y!==v.version||h!==n.toneMapping)&&(x.material.needsUpdate=!0,M=v,y=v.version,h=n.toneMapping),x.layers.enableAll(),E.unshift(x,x.geometry,x.material,0,0,null)):v&&v.isTexture&&(m===void 0&&(m=new ae(new rn(2,2),new ze({name:"BackgroundMaterial",uniforms:Ln(Ii.background.uniforms),vertexShader:Ii.background.vertexShader,fragmentShader:Ii.background.fragmentShader,side:hi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),m.geometry.deleteAttribute("normal"),Object.defineProperty(m.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(m)),m.material.uniforms.t2D.value=v,m.material.uniforms.backgroundIntensity.value=_.backgroundIntensity,m.material.toneMapped=Zt.getTransfer(v.colorSpace)!==re,v.matrixAutoUpdate===!0&&v.updateMatrix(),m.material.uniforms.uvTransform.value.copy(v.matrix),(M!==v||y!==v.version||h!==n.toneMapping)&&(m.material.needsUpdate=!0,M=v,y=v.version,h=n.toneMapping),m.layers.enableAll(),E.unshift(m,m.geometry,m.material,0,0,null))}function c(E,_){E.getRGB(ro,Cl(n)),e.buffers.color.setClear(ro.r,ro.g,ro.b,_,r)}function f(){x!==void 0&&(x.geometry.dispose(),x.material.dispose(),x=void 0),m!==void 0&&(m.geometry.dispose(),m.material.dispose(),m=void 0)}return{getClearColor:function(){return a},setClearColor:function(E,_=1){a.set(E),u=_,c(a,u)},getClearAlpha:function(){return u},setClearAlpha:function(E){u=E,c(a,u)},render:l,addToRenderList:p,dispose:f}}function mm(n,t){let e=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=h(null),r=s,a=!1;function u(L,g,w,T,S){let I=!1,D=y(L,T,w,g);r!==D&&(r=D,x(r.object)),I=o(L,T,w,S),I&&l(L,T,w,S),S!==null&&t.update(S,n.ELEMENT_ARRAY_BUFFER),(I||a)&&(a=!1,v(L,g,w,T),S!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t.get(S).buffer))}function m(){return n.createVertexArray()}function x(L){return n.bindVertexArray(L)}function M(L){return n.deleteVertexArray(L)}function y(L,g,w,T){let S=T.wireframe===!0,I=i[g.id];I===void 0&&(I={},i[g.id]=I);let D=L.isInstancedMesh===!0?L.id:0,U=I[D];U===void 0&&(U={},I[D]=U);let B=U[w.id];B===void 0&&(B={},U[w.id]=B);let z=B[S];return z===void 0&&(z=h(m()),B[S]=z),z}function h(L){let g=[],w=[],T=[];for(let S=0;S<e;S++)g[S]=0,w[S]=0,T[S]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:g,enabledAttributes:w,attributeDivisors:T,object:L,attributes:{},index:null}}function o(L,g,w,T){let S=r.attributes,I=g.attributes,D=0,U=w.getAttributes();for(let B in U)if(U[B].location>=0){let k=S[B],H=I[B];if(H===void 0&&(B==="instanceMatrix"&&L.instanceMatrix&&(H=L.instanceMatrix),B==="instanceColor"&&L.instanceColor&&(H=L.instanceColor)),k===void 0||k.attribute!==H||H&&k.data!==H.data)return!0;D++}return r.attributesNum!==D||r.index!==T}function l(L,g,w,T){let S={},I=g.attributes,D=0,U=w.getAttributes();for(let B in U)if(U[B].location>=0){let k=I[B];k===void 0&&(B==="instanceMatrix"&&L.instanceMatrix&&(k=L.instanceMatrix),B==="instanceColor"&&L.instanceColor&&(k=L.instanceColor));let H={};H.attribute=k,k&&k.data&&(H.data=k.data),S[B]=H,D++}r.attributes=S,r.attributesNum=D,r.index=T}function p(){let L=r.newAttributes;for(let g=0,w=L.length;g<w;g++)L[g]=0}function c(L){f(L,0)}function f(L,g){let w=r.newAttributes,T=r.enabledAttributes,S=r.attributeDivisors;w[L]=1,T[L]===0&&(n.enableVertexAttribArray(L),T[L]=1),S[L]!==g&&(n.vertexAttribDivisor(L,g),S[L]=g)}function E(){let L=r.newAttributes,g=r.enabledAttributes;for(let w=0,T=g.length;w<T;w++)g[w]!==L[w]&&(n.disableVertexAttribArray(w),g[w]=0)}function _(L,g,w,T,S,I,D){D===!0?n.vertexAttribIPointer(L,g,w,S,I):n.vertexAttribPointer(L,g,w,T,S,I)}function v(L,g,w,T){p();let S=T.attributes,I=w.getAttributes(),D=g.defaultAttributeValues;for(let U in I){let B=I[U];if(B.location>=0){let z=S[U];if(z===void 0&&(U==="instanceMatrix"&&L.instanceMatrix&&(z=L.instanceMatrix),U==="instanceColor"&&L.instanceColor&&(z=L.instanceColor)),z!==void 0){let k=z.normalized,H=z.itemSize,Y=t.get(z);if(Y===void 0)continue;let ht=Y.buffer,rt=Y.type,X=Y.bytesPerElement,$=rt===n.INT||rt===n.UNSIGNED_INT||z.gpuType===va;if(z.isInterleavedBufferAttribute){let Q=z.data,at=Q.stride,pt=z.offset;if(Q.isInstancedInterleavedBuffer){for(let tt=0;tt<B.locationSize;tt++)f(B.location+tt,Q.meshPerAttribute);L.isInstancedMesh!==!0&&T._maxInstanceCount===void 0&&(T._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let tt=0;tt<B.locationSize;tt++)c(B.location+tt);n.bindBuffer(n.ARRAY_BUFFER,ht);for(let tt=0;tt<B.locationSize;tt++)_(B.location+tt,H/B.locationSize,rt,k,at*X,(pt+H/B.locationSize*tt)*X,$)}else{if(z.isInstancedBufferAttribute){for(let Q=0;Q<B.locationSize;Q++)f(B.location+Q,z.meshPerAttribute);L.isInstancedMesh!==!0&&T._maxInstanceCount===void 0&&(T._maxInstanceCount=z.meshPerAttribute*z.count)}else for(let Q=0;Q<B.locationSize;Q++)c(B.location+Q);n.bindBuffer(n.ARRAY_BUFFER,ht);for(let Q=0;Q<B.locationSize;Q++)_(B.location+Q,H/B.locationSize,rt,k,H*X,H/B.locationSize*Q*X,$)}}else if(D!==void 0){let k=D[U];if(k!==void 0)switch(k.length){case 2:n.vertexAttrib2fv(B.location,k);break;case 3:n.vertexAttrib3fv(B.location,k);break;case 4:n.vertexAttrib4fv(B.location,k);break;default:n.vertexAttrib1fv(B.location,k)}}}}E()}function A(){b();for(let L in i){let g=i[L];for(let w in g){let T=g[w];for(let S in T){let I=T[S];for(let D in I)M(I[D].object),delete I[D];delete T[S]}}delete i[L]}}function P(L){if(i[L.id]===void 0)return;let g=i[L.id];for(let w in g){let T=g[w];for(let S in T){let I=T[S];for(let D in I)M(I[D].object),delete I[D];delete T[S]}}delete i[L.id]}function C(L){for(let g in i){let w=i[g];for(let T in w){let S=w[T];if(S[L.id]===void 0)continue;let I=S[L.id];for(let D in I)M(I[D].object),delete I[D];delete S[L.id]}}}function d(L){for(let g in i){let w=i[g],T=L.isInstancedMesh===!0?L.id:0,S=w[T];if(S!==void 0){for(let I in S){let D=S[I];for(let U in D)M(D[U].object),delete D[U];delete S[I]}delete w[T],Object.keys(w).length===0&&delete i[g]}}}function b(){R(),a=!0,r!==s&&(r=s,x(r.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:u,reset:b,resetDefaultState:R,dispose:A,releaseStatesOfGeometry:P,releaseStatesOfObject:d,releaseStatesOfProgram:C,initAttributes:p,enableAttribute:c,disableUnusedAttributes:E}}function gm(n,t,e){let i;function s(m){i=m}function r(m,x){n.drawArrays(i,m,x),e.update(x,i,1)}function a(m,x,M){M!==0&&(n.drawArraysInstanced(i,m,x,M),e.update(x,i,M))}function u(m,x,M){if(M===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,m,0,x,0,M);let h=0;for(let o=0;o<M;o++)h+=x[o];e.update(h,i,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=u}function xm(n,t,e,i){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let C=t.get("EXT_texture_filter_anisotropic");s=n.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(C){return!(C!==ni&&i.convert(C)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function u(C){let d=C===Ci&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(C!==Ke&&i.convert(C)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==ii&&!d)}function m(C){if(C==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let x=e.precision!==void 0?e.precision:"highp",M=m(x);M!==x&&(Ft("WebGLRenderer:",x,"not supported, using",M,"instead."),x=M);let y=e.logarithmicDepthBuffer===!0,h=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&h===!1&&Ft("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let o=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),l=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),p=n.getParameter(n.MAX_TEXTURE_SIZE),c=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),f=n.getParameter(n.MAX_VERTEX_ATTRIBS),E=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),_=n.getParameter(n.MAX_VARYING_VECTORS),v=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),A=n.getParameter(n.MAX_SAMPLES),P=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:m,textureFormatReadable:a,textureTypeReadable:u,precision:x,logarithmicDepthBuffer:y,reversedDepthBuffer:h,maxTextures:o,maxVertexTextures:l,maxTextureSize:p,maxCubemapSize:c,maxAttributes:f,maxVertexUniforms:E,maxVaryings:_,maxFragmentUniforms:v,maxSamples:A,samples:P}}function ym(n){let t=this,e=null,i=0,s=!1,r=!1,a=new yi,u=new zt,m={value:null,needsUpdate:!1};this.uniform=m,this.numPlanes=0,this.numIntersection=0,this.init=function(y,h){let o=y.length!==0||h||i!==0||s;return s=h,i=y.length,o},this.beginShadows=function(){r=!0,M(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(y,h){e=M(y,h,0)},this.setState=function(y,h,o){let l=y.clippingPlanes,p=y.clipIntersection,c=y.clipShadows,f=n.get(y);if(!s||l===null||l.length===0||r&&!c)r?M(null):x();else{let E=r?0:i,_=E*4,v=f.clippingState||null;m.value=v,v=M(l,h,_,o);for(let A=0;A!==_;++A)v[A]=e[A];f.clippingState=v,this.numIntersection=p?this.numPlanes:0,this.numPlanes+=E}};function x(){m.value!==e&&(m.value=e,m.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function M(y,h,o,l){let p=y!==null?y.length:0,c=null;if(p!==0){if(c=m.value,l!==!0||c===null){let f=o+p*4,E=h.matrixWorldInverse;u.getNormalMatrix(E),(c===null||c.length<f)&&(c=new Float32Array(f));for(let _=0,v=o;_!==p;++_,v+=4)a.copy(y[_]).applyMatrix4(E,u),a.normal.toArray(c,v),c[v+3]=a.constant}m.value=c,m.needsUpdate=!0}return t.numPlanes=p,t.numIntersection=0,c}}var fn=4,Ah=[.125,.215,.35,.446,.526,.582],Dn=20,vm=256,$s=new Vs,Ch=new ee,Ll=null,Dl=0,Fl=0,Nl=!1,_m=new W,oo=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,i=.1,s=100,r={}){let{size:a=256,position:u=_m}=r;Ll=this._renderer.getRenderTarget(),Dl=this._renderer.getActiveCubeFace(),Fl=this._renderer.getActiveMipmapLevel(),Nl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let m=this._allocateTargets();return m.depthBuffer=!0,this._sceneToCubeUV(t,i,s,m,u),e>0&&this._blur(m,0,0,e),this._applyPMREM(m),this._cleanup(m),m}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ph(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ih(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Ll,Dl,Fl),this._renderer.xr.enabled=Nl,t.scissorTest=!1,fs(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===hn||t.mapping===Pn?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Ll=this._renderer.getRenderTarget(),Dl=this._renderer.getActiveCubeFace(),Fl=this._renderer.getActiveMipmapLevel(),Nl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:we,minFilter:we,generateMipmaps:!1,type:Ci,format:ni,colorSpace:wn,depthBuffer:!1},s=Rh(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Rh(t,e,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Mm(r)),this._blurMaterial=Sm(r,t,e),this._ggxMaterial=bm(r,t,e)}return s}_compileMaterial(t){let e=new ae(new ge,t);this._renderer.compile(e,$s)}_sceneToCubeUV(t,e,i,s,r){let m=new Re(90,1,e,i),x=[1,-1,1,1,1,1],M=[1,1,1,-1,-1,-1],y=this._renderer,h=y.autoClear,o=y.toneMapping;y.getClearColor(Ch),y.toneMapping=je,y.autoClear=!1,y.state.buffers.depth.getReversed()&&(y.setRenderTarget(s),y.clearDepth(),y.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new ae(new Ti,new Pe({name:"PMREM.Background",side:Ve,depthWrite:!1,depthTest:!1})));let p=this._backgroundBox,c=p.material,f=!1,E=t.background;E?E.isColor&&(c.color.copy(E),t.background=null,f=!0):(c.color.copy(Ch),f=!0);for(let _=0;_<6;_++){let v=_%3;v===0?(m.up.set(0,x[_],0),m.position.set(r.x,r.y,r.z),m.lookAt(r.x+M[_],r.y,r.z)):v===1?(m.up.set(0,0,x[_]),m.position.set(r.x,r.y,r.z),m.lookAt(r.x,r.y+M[_],r.z)):(m.up.set(0,x[_],0),m.position.set(r.x,r.y,r.z),m.lookAt(r.x,r.y,r.z+M[_]));let A=this._cubeSize;fs(s,v*A,_>2?A:0,A,A),y.setRenderTarget(s),f&&y.render(p,m),y.render(t,m)}y.toneMapping=o,y.autoClear=h,t.background=E}_textureToCubeUV(t,e){let i=this._renderer,s=t.mapping===hn||t.mapping===Pn;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ph()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ih());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let u=r.uniforms;u.envMap.value=t;let m=this._cubeSize;fs(e,0,0,3*m,2*m),i.setRenderTarget(e),i.render(a,$s)}_applyPMREM(t){let e=this._renderer,i=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=i}_applyGGXFilter(t,e,i){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,u=this._lodMeshes[i];u.material=a;let m=a.uniforms,x=i/(this._lodMeshes.length-1),M=e/(this._lodMeshes.length-1),y=Math.sqrt(x*x-M*M),h=0+x*1.25,o=y*h,{_lodMax:l}=this,p=this._sizeLods[i],c=3*p*(i>l-fn?i-l+fn:0),f=4*(this._cubeSize-p);m.envMap.value=t.texture,m.roughness.value=o,m.mipInt.value=l-e,fs(r,c,f,3*p,2*p),s.setRenderTarget(r),s.render(u,$s),m.envMap.value=r.texture,m.roughness.value=0,m.mipInt.value=l-i,fs(t,c,f,3*p,2*p),s.setRenderTarget(t),s.render(u,$s)}_blur(t,e,i,s,r){let a=this._pingPongRenderTarget;this._halfBlur(t,a,e,i,s,"latitudinal",r),this._halfBlur(a,t,i,i,s,"longitudinal",r)}_halfBlur(t,e,i,s,r,a,u){let m=this._renderer,x=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&Nt("blur direction must be either latitudinal or longitudinal!");let M=3,y=this._lodMeshes[s];y.material=x;let h=x.uniforms,o=this._sizeLods[i]-1,l=isFinite(r)?Math.PI/(2*o):2*Math.PI/(2*Dn-1),p=r/l,c=isFinite(r)?1+Math.floor(M*p):Dn;c>Dn&&Ft(`sigmaRadians, ${r}, is too large and will clip, as it requested ${c} samples when the maximum is set to ${Dn}`);let f=[],E=0;for(let C=0;C<Dn;++C){let d=C/p,b=Math.exp(-d*d/2);f.push(b),C===0?E+=b:C<c&&(E+=2*b)}for(let C=0;C<f.length;C++)f[C]=f[C]/E;h.envMap.value=t.texture,h.samples.value=c,h.weights.value=f,h.latitudinal.value=a==="latitudinal",u&&(h.poleAxis.value=u);let{_lodMax:_}=this;h.dTheta.value=l,h.mipInt.value=_-i;let v=this._sizeLods[s],A=3*v*(s>_-fn?s-_+fn:0),P=4*(this._cubeSize-v);fs(e,A,P,3*v,2*v),m.setRenderTarget(e),m.render(y,$s)}};function Mm(n){let t=[],e=[],i=[],s=n,r=n-fn+1+Ah.length;for(let a=0;a<r;a++){let u=Math.pow(2,s);t.push(u);let m=1/u;a>n-fn?m=Ah[a-n+fn-1]:a===0&&(m=0),e.push(m);let x=1/(u-2),M=-x,y=1+x,h=[M,M,y,M,y,y,M,M,y,y,M,y],o=6,l=6,p=3,c=2,f=1,E=new Float32Array(p*l*o),_=new Float32Array(c*l*o),v=new Float32Array(f*l*o);for(let P=0;P<o;P++){let C=P%3*2/3-1,d=P>2?0:-1,b=[C,d,0,C+2/3,d,0,C+2/3,d+1,0,C,d,0,C+2/3,d+1,0,C,d+1,0];E.set(b,p*l*P),_.set(h,c*l*P);let R=[P,P,P,P,P,P];v.set(R,f*l*P)}let A=new ge;A.setAttribute("position",new Be(E,p)),A.setAttribute("uv",new Be(_,c)),A.setAttribute("faceIndex",new Be(v,f)),i.push(new ae(A,null)),s>fn&&s--}return{lodMeshes:i,sizeLods:t,sigmas:e}}function Rh(n,t,e){let i=new ke(n,t,e);return i.texture.mapping=Ws,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function fs(n,t,e,i,s){n.viewport.set(t,e,i,s),n.scissor.set(t,e,i,s)}function bm(n,t,e){return new ze({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:vm,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:ho(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:ei,depthTest:!1,depthWrite:!1})}function Sm(n,t,e){let i=new Float32Array(Dn),s=new W(0,1,0);return new ze({name:"SphericalGaussianBlur",defines:{n:Dn,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:ho(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:ei,depthTest:!1,depthWrite:!1})}function Ih(){return new ze({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ho(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:ei,depthTest:!1,depthWrite:!1})}function Ph(){return new ze({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ho(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ei,depthTest:!1,depthWrite:!1})}function ho(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}var lo=class extends ke{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},s=[i,i,i,i,i,i];this.texture=new Us(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Ti(5,5,5),r=new ze({name:"CubemapFromEquirect",uniforms:Ln(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Ve,blending:ei});r.uniforms.tEquirect.value=e;let a=new ae(s,r),u=e.minFilter;return e.minFilter===Ai&&(e.minFilter=we),new da(1,10,this).update(t,a),e.minFilter=u,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,i=!0,s=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,i,s);t.setRenderTarget(r)}};function wm(n){let t=new WeakMap,e=new WeakMap,i=null;function s(h,o=!1){return h==null?null:o?a(h):r(h)}function r(h){if(h&&h.isTexture){let o=h.mapping;if(o===ga||o===xa)if(t.has(h)){let l=t.get(h).texture;return u(l,h.mapping)}else{let l=h.image;if(l&&l.height>0){let p=new lo(l.height);return p.fromEquirectangularTexture(n,h),t.set(h,p),h.addEventListener("dispose",x),u(p.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture){let o=h.mapping,l=o===ga||o===xa,p=o===hn||o===Pn;if(l||p){let c=e.get(h),f=c!==void 0?c.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==f)return i===null&&(i=new oo(n)),c=l?i.fromEquirectangular(h,c):i.fromCubemap(h,c),c.texture.pmremVersion=h.pmremVersion,e.set(h,c),c.texture;if(c!==void 0)return c.texture;{let E=h.image;return l&&E&&E.height>0||p&&E&&m(E)?(i===null&&(i=new oo(n)),c=l?i.fromEquirectangular(h):i.fromCubemap(h),c.texture.pmremVersion=h.pmremVersion,e.set(h,c),h.addEventListener("dispose",M),c.texture):null}}}return h}function u(h,o){return o===ga?h.mapping=hn:o===xa&&(h.mapping=Pn),h}function m(h){let o=0,l=6;for(let p=0;p<l;p++)h[p]!==void 0&&o++;return o===l}function x(h){let o=h.target;o.removeEventListener("dispose",x);let l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function M(h){let o=h.target;o.removeEventListener("dispose",M);let l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function y(){t=new WeakMap,e=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:y}}function Em(n){let t={};function e(i){if(t[i]!==void 0)return t[i];let s=n.getExtension(i);return t[i]=s,s}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){let s=e(i);return s===null&&Xr("WebGLRenderer: "+i+" extension not supported."),s}}}function Tm(n,t,e,i){let s={},r=new WeakMap;function a(y){let h=y.target;h.index!==null&&t.remove(h.index);for(let l in h.attributes)t.remove(h.attributes[l]);h.removeEventListener("dispose",a),delete s[h.id];let o=r.get(h);o&&(t.remove(o),r.delete(h)),i.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,e.memory.geometries--}function u(y,h){return s[h.id]===!0||(h.addEventListener("dispose",a),s[h.id]=!0,e.memory.geometries++),h}function m(y){let h=y.attributes;for(let o in h)t.update(h[o],n.ARRAY_BUFFER)}function x(y){let h=[],o=y.index,l=y.attributes.position,p=0;if(l===void 0)return;if(o!==null){let E=o.array;p=o.version;for(let _=0,v=E.length;_<v;_+=3){let A=E[_+0],P=E[_+1],C=E[_+2];h.push(A,P,P,C,C,A)}}else{let E=l.array;p=l.version;for(let _=0,v=E.length/3-1;_<v;_+=3){let A=_+0,P=_+1,C=_+2;h.push(A,P,P,C,C,A)}}let c=new(l.count>=65535?Ps:Is)(h,1);c.version=p;let f=r.get(y);f&&t.remove(f),r.set(y,c)}function M(y){let h=r.get(y);if(h){let o=y.index;o!==null&&h.version<o.version&&x(y)}else x(y);return r.get(y)}return{get:u,update:m,getWireframeAttribute:M}}function Am(n,t,e){let i;function s(y){i=y}let r,a;function u(y){r=y.type,a=y.bytesPerElement}function m(y,h){n.drawElements(i,h,r,y*a),e.update(h,i,1)}function x(y,h,o){o!==0&&(n.drawElementsInstanced(i,h,r,y*a,o),e.update(h,i,o))}function M(y,h,o){if(o===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,h,0,r,y,0,o);let p=0;for(let c=0;c<o;c++)p+=h[c];e.update(p,i,1)}this.setMode=s,this.setIndex=u,this.render=m,this.renderInstances=x,this.renderMultiDraw=M}function Cm(n){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,u){switch(e.calls++,a){case n.TRIANGLES:e.triangles+=u*(r/3);break;case n.LINES:e.lines+=u*(r/2);break;case n.LINE_STRIP:e.lines+=u*(r-1);break;case n.LINE_LOOP:e.lines+=u*r;break;case n.POINTS:e.points+=u*r;break;default:Nt("WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:i}}function Rm(n,t,e){let i=new WeakMap,s=new ye;function r(a,u,m){let x=a.morphTargetInfluences,M=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,y=M!==void 0?M.length:0,h=i.get(u);if(h===void 0||h.count!==y){let b=function(){C.dispose(),i.delete(u),u.removeEventListener("dispose",b)};h!==void 0&&h.texture.dispose();let o=u.morphAttributes.position!==void 0,l=u.morphAttributes.normal!==void 0,p=u.morphAttributes.color!==void 0,c=u.morphAttributes.position||[],f=u.morphAttributes.normal||[],E=u.morphAttributes.color||[],_=0;o===!0&&(_=1),l===!0&&(_=2),p===!0&&(_=3);let v=u.attributes.position.count*_,A=1;v>t.maxTextureSize&&(A=Math.ceil(v/t.maxTextureSize),v=t.maxTextureSize);let P=new Float32Array(v*A*4*y),C=new Rs(P,v,A,y);C.type=ii,C.needsUpdate=!0;let d=_*4;for(let R=0;R<y;R++){let L=c[R],g=f[R],w=E[R],T=v*A*4*R;for(let S=0;S<L.count;S++){let I=S*d;o===!0&&(s.fromBufferAttribute(L,S),P[T+I+0]=s.x,P[T+I+1]=s.y,P[T+I+2]=s.z,P[T+I+3]=0),l===!0&&(s.fromBufferAttribute(g,S),P[T+I+4]=s.x,P[T+I+5]=s.y,P[T+I+6]=s.z,P[T+I+7]=0),p===!0&&(s.fromBufferAttribute(w,S),P[T+I+8]=s.x,P[T+I+9]=s.y,P[T+I+10]=s.z,P[T+I+11]=w.itemSize===4?s.w:1)}}h={count:y,texture:C,size:new ne(v,A)},i.set(u,h),u.addEventListener("dispose",b)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)m.getUniforms().setValue(n,"morphTexture",a.morphTexture,e);else{let o=0;for(let p=0;p<x.length;p++)o+=x[p];let l=u.morphTargetsRelative?1:1-o;m.getUniforms().setValue(n,"morphTargetBaseInfluence",l),m.getUniforms().setValue(n,"morphTargetInfluences",x)}m.getUniforms().setValue(n,"morphTargetsTexture",h.texture,e),m.getUniforms().setValue(n,"morphTargetsTextureSize",h.size)}return{update:r}}function Im(n,t,e,i,s){let r=new WeakMap;function a(x){let M=s.render.frame,y=x.geometry,h=t.get(x,y);if(r.get(h)!==M&&(t.update(h),r.set(h,M)),x.isInstancedMesh&&(x.hasEventListener("dispose",m)===!1&&x.addEventListener("dispose",m),r.get(x)!==M&&(e.update(x.instanceMatrix,n.ARRAY_BUFFER),x.instanceColor!==null&&e.update(x.instanceColor,n.ARRAY_BUFFER),r.set(x,M))),x.isSkinnedMesh){let o=x.skeleton;r.get(o)!==M&&(o.update(),r.set(o,M))}return h}function u(){r=new WeakMap}function m(x){let M=x.target;M.removeEventListener("dispose",m),i.releaseStatesOfObject(M),e.remove(M.instanceMatrix),M.instanceColor!==null&&e.remove(M.instanceColor)}return{update:a,dispose:u}}var Pm={[dl]:"LINEAR_TONE_MAPPING",[fl]:"REINHARD_TONE_MAPPING",[pl]:"CINEON_TONE_MAPPING",[ml]:"ACES_FILMIC_TONE_MAPPING",[xl]:"AGX_TONE_MAPPING",[yl]:"NEUTRAL_TONE_MAPPING",[gl]:"CUSTOM_TONE_MAPPING"};function Lm(n,t,e,i,s){let r=new ke(t,e,{type:n,depthBuffer:i,stencilBuffer:s,depthTexture:i?new zi(t,e):void 0}),a=new ke(t,e,{type:Ci,depthBuffer:!1,stencilBuffer:!1}),u=new ge;u.setAttribute("position",new he([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new he([0,2,0,0,2,0],2));let m=new an({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),x=new ae(u,m),M=new Vs(-1,1,1,-1,0,1),y=null,h=null,o=!1,l,p=null,c=[],f=!1;this.setSize=function(E,_){r.setSize(E,_),a.setSize(E,_);for(let v=0;v<c.length;v++){let A=c[v];A.setSize&&A.setSize(E,_)}},this.setEffects=function(E){c=E,f=c.length>0&&c[0].isRenderPass===!0;let _=r.width,v=r.height;for(let A=0;A<c.length;A++){let P=c[A];P.setSize&&P.setSize(_,v)}},this.begin=function(E,_){if(o||E.toneMapping===je&&c.length===0)return!1;if(p=_,_!==null){let v=_.width,A=_.height;(r.width!==v||r.height!==A)&&this.setSize(v,A)}return f===!1&&E.setRenderTarget(r),l=E.toneMapping,E.toneMapping=je,!0},this.hasRenderPass=function(){return f},this.end=function(E,_){E.toneMapping=l,o=!0;let v=r,A=a;for(let P=0;P<c.length;P++){let C=c[P];if(C.enabled!==!1&&(C.render(E,A,v,_),C.needsSwap!==!1)){let d=v;v=A,A=d}}if(y!==E.outputColorSpace||h!==E.toneMapping){y=E.outputColorSpace,h=E.toneMapping,m.defines={},Zt.getTransfer(y)===re&&(m.defines.SRGB_TRANSFER="");let P=Pm[h];P&&(m.defines[P]=""),m.needsUpdate=!0}m.uniforms.tDiffuse.value=v.texture,E.setRenderTarget(p),E.render(x,M),p=null,o=!1},this.isCompositing=function(){return o},this.dispose=function(){r.depthTexture&&r.depthTexture.dispose(),r.dispose(),a.dispose(),u.dispose(),m.dispose()}}var Kh=new Ne,Bl=new zi(1,1),$h=new Rs,Qh=new Jr,tu=new Us,Lh=[],Dh=[],Fh=new Float32Array(16),Nh=new Float32Array(9),Uh=new Float32Array(4);function ms(n,t,e){let i=n[0];if(i<=0||i>0)return n;let s=t*e,r=Lh[s];if(r===void 0&&(r=new Float32Array(s),Lh[s]=r),t!==0){i.toArray(r,0);for(let a=1,u=0;a!==t;++a)u+=e,n[a].toArray(r,u)}return r}function Te(n,t){if(n.length!==t.length)return!1;for(let e=0,i=n.length;e<i;e++)if(n[e]!==t[e])return!1;return!0}function Ae(n,t){for(let e=0,i=t.length;e<i;e++)n[e]=t[e]}function uo(n,t){let e=Dh[t];e===void 0&&(e=new Int32Array(t),Dh[t]=e);for(let i=0;i!==t;++i)e[i]=n.allocateTextureUnit();return e}function Dm(n,t){let e=this.cache;e[0]!==t&&(n.uniform1f(this.addr,t),e[0]=t)}function Fm(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;n.uniform2fv(this.addr,t),Ae(e,t)}}function Nm(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(n.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Te(e,t))return;n.uniform3fv(this.addr,t),Ae(e,t)}}function Um(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;n.uniform4fv(this.addr,t),Ae(e,t)}}function Om(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(Te(e,t))return;n.uniformMatrix2fv(this.addr,!1,t),Ae(e,t)}else{if(Te(e,i))return;Uh.set(i),n.uniformMatrix2fv(this.addr,!1,Uh),Ae(e,i)}}function Bm(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(Te(e,t))return;n.uniformMatrix3fv(this.addr,!1,t),Ae(e,t)}else{if(Te(e,i))return;Nh.set(i),n.uniformMatrix3fv(this.addr,!1,Nh),Ae(e,i)}}function km(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(Te(e,t))return;n.uniformMatrix4fv(this.addr,!1,t),Ae(e,t)}else{if(Te(e,i))return;Fh.set(i),n.uniformMatrix4fv(this.addr,!1,Fh),Ae(e,i)}}function zm(n,t){let e=this.cache;e[0]!==t&&(n.uniform1i(this.addr,t),e[0]=t)}function Vm(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;n.uniform2iv(this.addr,t),Ae(e,t)}}function Hm(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Te(e,t))return;n.uniform3iv(this.addr,t),Ae(e,t)}}function Gm(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;n.uniform4iv(this.addr,t),Ae(e,t)}}function Wm(n,t){let e=this.cache;e[0]!==t&&(n.uniform1ui(this.addr,t),e[0]=t)}function Xm(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;n.uniform2uiv(this.addr,t),Ae(e,t)}}function qm(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Te(e,t))return;n.uniform3uiv(this.addr,t),Ae(e,t)}}function Ym(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;n.uniform4uiv(this.addr,t),Ae(e,t)}}function Zm(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(Bl.compareFunction=e.isReversedDepthBuffer()?no:io,r=Bl):r=Kh,e.setTexture2D(t||r,s)}function Jm(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTexture3D(t||Qh,s)}function jm(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTextureCube(t||tu,s)}function Km(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTexture2DArray(t||$h,s)}function $m(n){switch(n){case 5126:return Dm;case 35664:return Fm;case 35665:return Nm;case 35666:return Um;case 35674:return Om;case 35675:return Bm;case 35676:return km;case 5124:case 35670:return zm;case 35667:case 35671:return Vm;case 35668:case 35672:return Hm;case 35669:case 35673:return Gm;case 5125:return Wm;case 36294:return Xm;case 36295:return qm;case 36296:return Ym;case 35678:case 36198:case 36298:case 36306:case 35682:return Zm;case 35679:case 36299:case 36307:return Jm;case 35680:case 36300:case 36308:case 36293:return jm;case 36289:case 36303:case 36311:case 36292:return Km}}function Qm(n,t){n.uniform1fv(this.addr,t)}function t0(n,t){let e=ms(t,this.size,2);n.uniform2fv(this.addr,e)}function e0(n,t){let e=ms(t,this.size,3);n.uniform3fv(this.addr,e)}function i0(n,t){let e=ms(t,this.size,4);n.uniform4fv(this.addr,e)}function n0(n,t){let e=ms(t,this.size,4);n.uniformMatrix2fv(this.addr,!1,e)}function s0(n,t){let e=ms(t,this.size,9);n.uniformMatrix3fv(this.addr,!1,e)}function r0(n,t){let e=ms(t,this.size,16);n.uniformMatrix4fv(this.addr,!1,e)}function a0(n,t){n.uniform1iv(this.addr,t)}function o0(n,t){n.uniform2iv(this.addr,t)}function l0(n,t){n.uniform3iv(this.addr,t)}function c0(n,t){n.uniform4iv(this.addr,t)}function h0(n,t){n.uniform1uiv(this.addr,t)}function u0(n,t){n.uniform2uiv(this.addr,t)}function d0(n,t){n.uniform3uiv(this.addr,t)}function f0(n,t){n.uniform4uiv(this.addr,t)}function p0(n,t,e){let i=this.cache,s=t.length,r=uo(e,s);Te(i,r)||(n.uniform1iv(this.addr,r),Ae(i,r));let a;this.type===n.SAMPLER_2D_SHADOW?a=Bl:a=Kh;for(let u=0;u!==s;++u)e.setTexture2D(t[u]||a,r[u])}function m0(n,t,e){let i=this.cache,s=t.length,r=uo(e,s);Te(i,r)||(n.uniform1iv(this.addr,r),Ae(i,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||Qh,r[a])}function g0(n,t,e){let i=this.cache,s=t.length,r=uo(e,s);Te(i,r)||(n.uniform1iv(this.addr,r),Ae(i,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||tu,r[a])}function x0(n,t,e){let i=this.cache,s=t.length,r=uo(e,s);Te(i,r)||(n.uniform1iv(this.addr,r),Ae(i,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||$h,r[a])}function y0(n){switch(n){case 5126:return Qm;case 35664:return t0;case 35665:return e0;case 35666:return i0;case 35674:return n0;case 35675:return s0;case 35676:return r0;case 5124:case 35670:return a0;case 35667:case 35671:return o0;case 35668:case 35672:return l0;case 35669:case 35673:return c0;case 5125:return h0;case 36294:return u0;case 36295:return d0;case 36296:return f0;case 35678:case 36198:case 36298:case 36306:case 35682:return p0;case 35679:case 36299:case 36307:return m0;case 35680:case 36300:case 36308:case 36293:return g0;case 36289:case 36303:case 36311:case 36292:return x0}}var kl=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=$m(e.type)}},zl=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=y0(e.type)}},Vl=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let u=s[r];u.setValue(t,e[u.id],i)}}},Ul=/(\w+)(\])?(\[|\.)?/g;function Oh(n,t){n.seq.push(t),n.map[t.id]=t}function v0(n,t,e){let i=n.name,s=i.length;for(Ul.lastIndex=0;;){let r=Ul.exec(i),a=Ul.lastIndex,u=r[1],m=r[2]==="]",x=r[3];if(m&&(u=u|0),x===void 0||x==="["&&a+2===s){Oh(e,x===void 0?new kl(u,n,t):new zl(u,n,t));break}else{let y=e.map[u];y===void 0&&(y=new Vl(u),Oh(e,y)),e=y}}}var ps=class{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){let u=t.getActiveUniform(e,a),m=t.getUniformLocation(e,u.name);v0(u,m,this)}let s=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,i,s){let r=this.map[e];r!==void 0&&r.setValue(t,i,s)}setOptional(t,e,i){let s=e[i];s!==void 0&&this.setValue(t,i,s)}static upload(t,e,i,s){for(let r=0,a=e.length;r!==a;++r){let u=e[r],m=i[u.id];m.needsUpdate!==!1&&u.setValue(t,m.value,s)}}static seqWithValue(t,e){let i=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&i.push(a)}return i}};function Bh(n,t,e){let i=n.createShader(t);return n.shaderSource(i,e),n.compileShader(i),i}var _0=37297,M0=0;function b0(n,t){let e=n.split(`
`),i=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let u=a+1;i.push(`${u===t?">":" "} ${u}: ${e[a]}`)}return i.join(`
`)}var kh=new zt;function S0(n){Zt._getMatrix(kh,Zt.workingColorSpace,n);let t=`mat3( ${kh.elements.map(e=>e.toFixed(4))} )`;switch(Zt.getTransfer(n)){case Ts:return[t,"LinearTransferOETF"];case re:return[t,"sRGBTransferOETF"];default:return Ft("WebGLProgram: Unsupported color space: ",n),[t,"LinearTransferOETF"]}}function zh(n,t,e){let i=n.getShaderParameter(t,n.COMPILE_STATUS),r=(n.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let u=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+b0(n.getShaderSource(t),u)}else return r}function w0(n,t){let e=S0(t);return[`vec4 ${n}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var E0={[dl]:"Linear",[fl]:"Reinhard",[pl]:"Cineon",[ml]:"ACESFilmic",[xl]:"AgX",[yl]:"Neutral",[gl]:"Custom"};function T0(n,t){let e=E0[t];return e===void 0?(Ft("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var ao=new W;function A0(){Zt.getLuminanceCoefficients(ao);let n=ao.x.toFixed(4),t=ao.y.toFixed(4),e=ao.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function C0(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(tr).join(`
`)}function R0(n){let t=[];for(let e in n){let i=n[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function I0(n,t){let e={},i=n.getProgramParameter(t,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(t,s),a=r.name,u=1;r.type===n.FLOAT_MAT2&&(u=2),r.type===n.FLOAT_MAT3&&(u=3),r.type===n.FLOAT_MAT4&&(u=4),e[a]={type:r.type,location:n.getAttribLocation(t,a),locationSize:u}}return e}function tr(n){return n!==""}function Vh(n,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Hh(n,t){return n.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var P0=/^[ \t]*#include +<([\w\d./]+)>/gm;function Hl(n){return n.replace(P0,D0)}var L0=new Map;function D0(n,t){let e=Xt[t];if(e===void 0){let i=L0.get(t);if(i!==void 0)e=Xt[i],Ft('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("Can not resolve #include <"+t+">")}return Hl(e)}var F0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Gh(n){return n.replace(F0,N0)}function N0(n,t,e,i){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Wh(n){let t=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?t+=`
#define HIGH_PRECISION`:n.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var U0={[Gs]:"SHADOWMAP_TYPE_PCF",[hs]:"SHADOWMAP_TYPE_VSM"};function O0(n){return U0[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var B0={[hn]:"ENVMAP_TYPE_CUBE",[Pn]:"ENVMAP_TYPE_CUBE",[Ws]:"ENVMAP_TYPE_CUBE_UV"};function k0(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":B0[n.envMapMode]||"ENVMAP_TYPE_CUBE"}var z0={[Pn]:"ENVMAP_MODE_REFRACTION"};function V0(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":z0[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}var H0={[ul]:"ENVMAP_BLENDING_MULTIPLY",[ch]:"ENVMAP_BLENDING_MIX",[hh]:"ENVMAP_BLENDING_ADD"};function G0(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":H0[n.combine]||"ENVMAP_BLENDING_NONE"}function W0(n){let t=n.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:i,maxMip:e}}function X0(n,t,e,i){let s=n.getContext(),r=e.defines,a=e.vertexShader,u=e.fragmentShader,m=O0(e),x=k0(e),M=V0(e),y=G0(e),h=W0(e),o=C0(e),l=R0(r),p=s.createProgram(),c,f,E=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(c=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,l].filter(tr).join(`
`),c.length>0&&(c+=`
`),f=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,l].filter(tr).join(`
`),f.length>0&&(f+=`
`)):(c=[Wh(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,l,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+M:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+m:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(tr).join(`
`),f=[Wh(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,l,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+x:"",e.envMap?"#define "+M:"",e.envMap?"#define "+y:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+m:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==je?"#define TONE_MAPPING":"",e.toneMapping!==je?Xt.tonemapping_pars_fragment:"",e.toneMapping!==je?T0("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Xt.colorspace_pars_fragment,w0("linearToOutputTexel",e.outputColorSpace),A0(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(tr).join(`
`)),a=Hl(a),a=Vh(a,e),a=Hh(a,e),u=Hl(u),u=Vh(u,e),u=Hh(u,e),a=Gh(a),u=Gh(u),e.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,c=[o,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+c,f=["#define varying in",e.glslVersion===Al?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Al?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let _=E+c+a,v=E+f+u,A=Bh(s,s.VERTEX_SHADER,_),P=Bh(s,s.FRAGMENT_SHADER,v);s.attachShader(p,A),s.attachShader(p,P),e.index0AttributeName!==void 0?s.bindAttribLocation(p,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(p,0,"position"),s.linkProgram(p);function C(L){if(n.debug.checkShaderErrors){let g=s.getProgramInfoLog(p)||"",w=s.getShaderInfoLog(A)||"",T=s.getShaderInfoLog(P)||"",S=g.trim(),I=w.trim(),D=T.trim(),U=!0,B=!0;if(s.getProgramParameter(p,s.LINK_STATUS)===!1)if(U=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,p,A,P);else{let z=zh(s,A,"vertex"),k=zh(s,P,"fragment");Nt("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(p,s.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+S+`
`+z+`
`+k)}else S!==""?Ft("WebGLProgram: Program Info Log:",S):(I===""||D==="")&&(B=!1);B&&(L.diagnostics={runnable:U,programLog:S,vertexShader:{log:I,prefix:c},fragmentShader:{log:D,prefix:f}})}s.deleteShader(A),s.deleteShader(P),d=new ps(s,p),b=I0(s,p)}let d;this.getUniforms=function(){return d===void 0&&C(this),d};let b;this.getAttributes=function(){return b===void 0&&C(this),b};let R=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=s.getProgramParameter(p,_0)),R},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(p),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=M0++,this.cacheKey=t,this.usedTimes=1,this.program=p,this.vertexShader=A,this.fragmentShader=P,this}var q0=0,Gl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){let e=t.vertexShader,i=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(i),a=this._getShaderCacheForMaterial(t);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);return i===void 0&&(i=new Wl(t),e.set(t,i)),i}},Wl=class{constructor(t){this.id=q0++,this.code=t,this.usedTimes=0}};function Y0(n){return n===dn||n===js||n===Ks}function Z0(n,t,e,i,s,r){let a=new rs,u=new Gl,m=new Set,x=[],M=new Map,y=i.logarithmicDepthBuffer,h=i.precision,o={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function l(d){return m.add(d),d===0?"uv":`uv${d}`}function p(d,b,R,L,g,w){let T=L.fog,S=g.geometry,I=d.isMeshStandardMaterial||d.isMeshLambertMaterial||d.isMeshPhongMaterial?L.environment:null,D=d.isMeshStandardMaterial||d.isMeshLambertMaterial&&!d.envMap||d.isMeshPhongMaterial&&!d.envMap,U=t.get(d.envMap||I,D),B=U&&U.mapping===Ws?U.image.height:null,z=o[d.type];d.precision!==null&&(h=i.getMaxPrecision(d.precision),h!==d.precision&&Ft("WebGLProgram.getParameters:",d.precision,"not supported, using",h,"instead."));let k=S.morphAttributes.position||S.morphAttributes.normal||S.morphAttributes.color,H=k!==void 0?k.length:0,Y=0;S.morphAttributes.position!==void 0&&(Y=1),S.morphAttributes.normal!==void 0&&(Y=2),S.morphAttributes.color!==void 0&&(Y=3);let ht,rt,X,$;if(z){let Ht=Ii[z];ht=Ht.vertexShader,rt=Ht.fragmentShader}else ht=d.vertexShader,rt=d.fragmentShader,u.update(d),X=u.getVertexShaderID(d),$=u.getFragmentShaderID(d);let Q=n.getRenderTarget(),at=n.state.buffers.depth.getReversed(),pt=g.isInstancedMesh===!0,tt=g.isBatchedMesh===!0,yt=!!d.map,Et=!!d.matcap,bt=!!U,Ot=!!d.aoMap,St=!!d.lightMap,Yt=!!d.bumpMap,Ut=!!d.normalMap,$t=!!d.displacementMap,V=!!d.emissiveMap,Vt=!!d.metalnessMap,Bt=!!d.roughnessMap,Jt=d.anisotropy>0,mt=d.clearcoat>0,Qt=d.dispersion>0,O=d.iridescence>0,F=d.sheen>0,Z=d.transmission>0,it=Jt&&!!d.anisotropyMap,ot=mt&&!!d.clearcoatMap,ct=mt&&!!d.clearcoatNormalMap,ut=mt&&!!d.clearcoatRoughnessMap,et=O&&!!d.iridescenceMap,st=O&&!!d.iridescenceThicknessMap,wt=F&&!!d.sheenColorMap,Ct=F&&!!d.sheenRoughnessMap,gt=!!d.specularMap,dt=!!d.specularColorMap,kt=!!d.specularIntensityMap,Wt=Z&&!!d.transmissionMap,ie=Z&&!!d.thicknessMap,G=!!d.gradientMap,ft=!!d.alphaMap,nt=d.alphaTest>0,Tt=!!d.alphaHash,xt=!!d.extensions,lt=je;d.toneMapped&&(Q===null||Q.isXRRenderTarget===!0)&&(lt=n.toneMapping);let Pt={shaderID:z,shaderType:d.type,shaderName:d.name,vertexShader:ht,fragmentShader:rt,defines:d.defines,customVertexShaderID:X,customFragmentShaderID:$,isRawShaderMaterial:d.isRawShaderMaterial===!0,glslVersion:d.glslVersion,precision:h,batching:tt,batchingColor:tt&&g._colorsTexture!==null,instancing:pt,instancingColor:pt&&g.instanceColor!==null,instancingMorph:pt&&g.morphTexture!==null,outputColorSpace:Q===null?n.outputColorSpace:Q.isXRRenderTarget===!0?Q.texture.colorSpace:Zt.workingColorSpace,alphaToCoverage:!!d.alphaToCoverage,map:yt,matcap:Et,envMap:bt,envMapMode:bt&&U.mapping,envMapCubeUVHeight:B,aoMap:Ot,lightMap:St,bumpMap:Yt,normalMap:Ut,displacementMap:$t,emissiveMap:V,normalMapObjectSpace:Ut&&d.normalMapType===fh,normalMapTangentSpace:Ut&&d.normalMapType===Tl,packedNormalMap:Ut&&d.normalMapType===Tl&&Y0(d.normalMap.format),metalnessMap:Vt,roughnessMap:Bt,anisotropy:Jt,anisotropyMap:it,clearcoat:mt,clearcoatMap:ot,clearcoatNormalMap:ct,clearcoatRoughnessMap:ut,dispersion:Qt,iridescence:O,iridescenceMap:et,iridescenceThicknessMap:st,sheen:F,sheenColorMap:wt,sheenRoughnessMap:Ct,specularMap:gt,specularColorMap:dt,specularIntensityMap:kt,transmission:Z,transmissionMap:Wt,thicknessMap:ie,gradientMap:G,opaque:d.transparent===!1&&d.blending===Bi&&d.alphaToCoverage===!1,alphaMap:ft,alphaTest:nt,alphaHash:Tt,combine:d.combine,mapUv:yt&&l(d.map.channel),aoMapUv:Ot&&l(d.aoMap.channel),lightMapUv:St&&l(d.lightMap.channel),bumpMapUv:Yt&&l(d.bumpMap.channel),normalMapUv:Ut&&l(d.normalMap.channel),displacementMapUv:$t&&l(d.displacementMap.channel),emissiveMapUv:V&&l(d.emissiveMap.channel),metalnessMapUv:Vt&&l(d.metalnessMap.channel),roughnessMapUv:Bt&&l(d.roughnessMap.channel),anisotropyMapUv:it&&l(d.anisotropyMap.channel),clearcoatMapUv:ot&&l(d.clearcoatMap.channel),clearcoatNormalMapUv:ct&&l(d.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ut&&l(d.clearcoatRoughnessMap.channel),iridescenceMapUv:et&&l(d.iridescenceMap.channel),iridescenceThicknessMapUv:st&&l(d.iridescenceThicknessMap.channel),sheenColorMapUv:wt&&l(d.sheenColorMap.channel),sheenRoughnessMapUv:Ct&&l(d.sheenRoughnessMap.channel),specularMapUv:gt&&l(d.specularMap.channel),specularColorMapUv:dt&&l(d.specularColorMap.channel),specularIntensityMapUv:kt&&l(d.specularIntensityMap.channel),transmissionMapUv:Wt&&l(d.transmissionMap.channel),thicknessMapUv:ie&&l(d.thicknessMap.channel),alphaMapUv:ft&&l(d.alphaMap.channel),vertexTangents:!!S.attributes.tangent&&(Ut||Jt),vertexNormals:!!S.attributes.normal,vertexColors:d.vertexColors,vertexAlphas:d.vertexColors===!0&&!!S.attributes.color&&S.attributes.color.itemSize===4,pointsUvs:g.isPoints===!0&&!!S.attributes.uv&&(yt||ft),fog:!!T,useFog:d.fog===!0,fogExp2:!!T&&T.isFogExp2,flatShading:d.wireframe===!1&&(d.flatShading===!0||S.attributes.normal===void 0&&Ut===!1&&(d.isMeshLambertMaterial||d.isMeshPhongMaterial||d.isMeshStandardMaterial||d.isMeshPhysicalMaterial)),sizeAttenuation:d.sizeAttenuation===!0,logarithmicDepthBuffer:y,reversedDepthBuffer:at,skinning:g.isSkinnedMesh===!0,morphTargets:S.morphAttributes.position!==void 0,morphNormals:S.morphAttributes.normal!==void 0,morphColors:S.morphAttributes.color!==void 0,morphTargetsCount:H,morphTextureStride:Y,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numLightProbeGrids:w.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:d.dithering,shadowMapEnabled:n.shadowMap.enabled&&R.length>0,shadowMapType:n.shadowMap.type,toneMapping:lt,decodeVideoTexture:yt&&d.map.isVideoTexture===!0&&Zt.getTransfer(d.map.colorSpace)===re,decodeVideoTextureEmissive:V&&d.emissiveMap.isVideoTexture===!0&&Zt.getTransfer(d.emissiveMap.colorSpace)===re,premultipliedAlpha:d.premultipliedAlpha,doubleSided:d.side===Ee,flipSided:d.side===Ve,useDepthPacking:d.depthPacking>=0,depthPacking:d.depthPacking||0,index0AttributeName:d.index0AttributeName,extensionClipCullDistance:xt&&d.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(xt&&d.extensions.multiDraw===!0||tt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:d.customProgramCacheKey()};return Pt.vertexUv1s=m.has(1),Pt.vertexUv2s=m.has(2),Pt.vertexUv3s=m.has(3),m.clear(),Pt}function c(d){let b=[];if(d.shaderID?b.push(d.shaderID):(b.push(d.customVertexShaderID),b.push(d.customFragmentShaderID)),d.defines!==void 0)for(let R in d.defines)b.push(R),b.push(d.defines[R]);return d.isRawShaderMaterial===!1&&(f(b,d),E(b,d),b.push(n.outputColorSpace)),b.push(d.customProgramCacheKey),b.join()}function f(d,b){d.push(b.precision),d.push(b.outputColorSpace),d.push(b.envMapMode),d.push(b.envMapCubeUVHeight),d.push(b.mapUv),d.push(b.alphaMapUv),d.push(b.lightMapUv),d.push(b.aoMapUv),d.push(b.bumpMapUv),d.push(b.normalMapUv),d.push(b.displacementMapUv),d.push(b.emissiveMapUv),d.push(b.metalnessMapUv),d.push(b.roughnessMapUv),d.push(b.anisotropyMapUv),d.push(b.clearcoatMapUv),d.push(b.clearcoatNormalMapUv),d.push(b.clearcoatRoughnessMapUv),d.push(b.iridescenceMapUv),d.push(b.iridescenceThicknessMapUv),d.push(b.sheenColorMapUv),d.push(b.sheenRoughnessMapUv),d.push(b.specularMapUv),d.push(b.specularColorMapUv),d.push(b.specularIntensityMapUv),d.push(b.transmissionMapUv),d.push(b.thicknessMapUv),d.push(b.combine),d.push(b.fogExp2),d.push(b.sizeAttenuation),d.push(b.morphTargetsCount),d.push(b.morphAttributeCount),d.push(b.numDirLights),d.push(b.numPointLights),d.push(b.numSpotLights),d.push(b.numSpotLightMaps),d.push(b.numHemiLights),d.push(b.numRectAreaLights),d.push(b.numDirLightShadows),d.push(b.numPointLightShadows),d.push(b.numSpotLightShadows),d.push(b.numSpotLightShadowsWithMaps),d.push(b.numLightProbes),d.push(b.shadowMapType),d.push(b.toneMapping),d.push(b.numClippingPlanes),d.push(b.numClipIntersection),d.push(b.depthPacking)}function E(d,b){a.disableAll(),b.instancing&&a.enable(0),b.instancingColor&&a.enable(1),b.instancingMorph&&a.enable(2),b.matcap&&a.enable(3),b.envMap&&a.enable(4),b.normalMapObjectSpace&&a.enable(5),b.normalMapTangentSpace&&a.enable(6),b.clearcoat&&a.enable(7),b.iridescence&&a.enable(8),b.alphaTest&&a.enable(9),b.vertexColors&&a.enable(10),b.vertexAlphas&&a.enable(11),b.vertexUv1s&&a.enable(12),b.vertexUv2s&&a.enable(13),b.vertexUv3s&&a.enable(14),b.vertexTangents&&a.enable(15),b.anisotropy&&a.enable(16),b.alphaHash&&a.enable(17),b.batching&&a.enable(18),b.dispersion&&a.enable(19),b.batchingColor&&a.enable(20),b.gradientMap&&a.enable(21),b.packedNormalMap&&a.enable(22),b.vertexNormals&&a.enable(23),d.push(a.mask),a.disableAll(),b.fog&&a.enable(0),b.useFog&&a.enable(1),b.flatShading&&a.enable(2),b.logarithmicDepthBuffer&&a.enable(3),b.reversedDepthBuffer&&a.enable(4),b.skinning&&a.enable(5),b.morphTargets&&a.enable(6),b.morphNormals&&a.enable(7),b.morphColors&&a.enable(8),b.premultipliedAlpha&&a.enable(9),b.shadowMapEnabled&&a.enable(10),b.doubleSided&&a.enable(11),b.flipSided&&a.enable(12),b.useDepthPacking&&a.enable(13),b.dithering&&a.enable(14),b.transmission&&a.enable(15),b.sheen&&a.enable(16),b.opaque&&a.enable(17),b.pointsUvs&&a.enable(18),b.decodeVideoTexture&&a.enable(19),b.decodeVideoTextureEmissive&&a.enable(20),b.alphaToCoverage&&a.enable(21),b.numLightProbeGrids>0&&a.enable(22),d.push(a.mask)}function _(d){let b=o[d.type],R;if(b){let L=Ii[b];R=Eh.clone(L.uniforms)}else R=d.uniforms;return R}function v(d,b){let R=M.get(b);return R!==void 0?++R.usedTimes:(R=new X0(n,b,d,s),x.push(R),M.set(b,R)),R}function A(d){if(--d.usedTimes===0){let b=x.indexOf(d);x[b]=x[x.length-1],x.pop(),M.delete(d.cacheKey),d.destroy()}}function P(d){u.remove(d)}function C(){u.dispose()}return{getParameters:p,getProgramCacheKey:c,getUniforms:_,acquireProgram:v,releaseProgram:A,releaseShaderCache:P,programs:x,dispose:C}}function J0(){let n=new WeakMap;function t(a){return n.has(a)}function e(a){let u=n.get(a);return u===void 0&&(u={},n.set(a,u)),u}function i(a){n.delete(a)}function s(a,u,m){n.get(a)[u]=m}function r(){n=new WeakMap}return{has:t,get:e,remove:i,update:s,dispose:r}}function j0(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.material.id!==t.material.id?n.material.id-t.material.id:n.materialVariant!==t.materialVariant?n.materialVariant-t.materialVariant:n.z!==t.z?n.z-t.z:n.id-t.id}function Xh(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.z!==t.z?t.z-n.z:n.id-t.id}function qh(){let n=[],t=0,e=[],i=[],s=[];function r(){t=0,e.length=0,i.length=0,s.length=0}function a(h){let o=0;return h.isInstancedMesh&&(o+=2),h.isSkinnedMesh&&(o+=1),o}function u(h,o,l,p,c,f){let E=n[t];return E===void 0?(E={id:h.id,object:h,geometry:o,material:l,materialVariant:a(h),groupOrder:p,renderOrder:h.renderOrder,z:c,group:f},n[t]=E):(E.id=h.id,E.object=h,E.geometry=o,E.material=l,E.materialVariant=a(h),E.groupOrder=p,E.renderOrder=h.renderOrder,E.z=c,E.group=f),t++,E}function m(h,o,l,p,c,f){let E=u(h,o,l,p,c,f);l.transmission>0?i.push(E):l.transparent===!0?s.push(E):e.push(E)}function x(h,o,l,p,c,f){let E=u(h,o,l,p,c,f);l.transmission>0?i.unshift(E):l.transparent===!0?s.unshift(E):e.unshift(E)}function M(h,o){e.length>1&&e.sort(h||j0),i.length>1&&i.sort(o||Xh),s.length>1&&s.sort(o||Xh)}function y(){for(let h=t,o=n.length;h<o;h++){let l=n[h];if(l.id===null)break;l.id=null,l.object=null,l.geometry=null,l.material=null,l.group=null}}return{opaque:e,transmissive:i,transparent:s,init:r,push:m,unshift:x,finish:y,sort:M}}function K0(){let n=new WeakMap;function t(i,s){let r=n.get(i),a;return r===void 0?(a=new qh,n.set(i,[a])):s>=r.length?(a=new qh,r.push(a)):a=r[s],a}function e(){n=new WeakMap}return{get:t,dispose:e}}function $0(){let n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new W,color:new ee};break;case"SpotLight":e={position:new W,direction:new W,color:new ee,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new W,color:new ee,distance:0,decay:0};break;case"HemisphereLight":e={direction:new W,skyColor:new ee,groundColor:new ee};break;case"RectAreaLight":e={color:new ee,position:new W,halfWidth:new W,halfHeight:new W};break}return n[t.id]=e,e}}}function Q0(){let n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ne};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ne};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ne,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[t.id]=e,e}}}var tg=0;function eg(n,t){return(t.castShadow?2:0)-(n.castShadow?2:0)+(t.map?1:0)-(n.map?1:0)}function ig(n){let t=new $0,e=Q0(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let x=0;x<9;x++)i.probe.push(new W);let s=new W,r=new se,a=new se;function u(x){let M=0,y=0,h=0;for(let b=0;b<9;b++)i.probe[b].set(0,0,0);let o=0,l=0,p=0,c=0,f=0,E=0,_=0,v=0,A=0,P=0,C=0;x.sort(eg);for(let b=0,R=x.length;b<R;b++){let L=x[b],g=L.color,w=L.intensity,T=L.distance,S=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===dn?S=L.shadow.map.texture:S=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)M+=g.r*w,y+=g.g*w,h+=g.b*w;else if(L.isLightProbe){for(let I=0;I<9;I++)i.probe[I].addScaledVector(L.sh.coefficients[I],w);C++}else if(L.isDirectionalLight){let I=t.get(L);if(I.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let D=L.shadow,U=e.get(L);U.shadowIntensity=D.intensity,U.shadowBias=D.bias,U.shadowNormalBias=D.normalBias,U.shadowRadius=D.radius,U.shadowMapSize=D.mapSize,i.directionalShadow[o]=U,i.directionalShadowMap[o]=S,i.directionalShadowMatrix[o]=L.shadow.matrix,E++}i.directional[o]=I,o++}else if(L.isSpotLight){let I=t.get(L);I.position.setFromMatrixPosition(L.matrixWorld),I.color.copy(g).multiplyScalar(w),I.distance=T,I.coneCos=Math.cos(L.angle),I.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),I.decay=L.decay,i.spot[p]=I;let D=L.shadow;if(L.map&&(i.spotLightMap[A]=L.map,A++,D.updateMatrices(L),L.castShadow&&P++),i.spotLightMatrix[p]=D.matrix,L.castShadow){let U=e.get(L);U.shadowIntensity=D.intensity,U.shadowBias=D.bias,U.shadowNormalBias=D.normalBias,U.shadowRadius=D.radius,U.shadowMapSize=D.mapSize,i.spotShadow[p]=U,i.spotShadowMap[p]=S,v++}p++}else if(L.isRectAreaLight){let I=t.get(L);I.color.copy(g).multiplyScalar(w),I.halfWidth.set(L.width*.5,0,0),I.halfHeight.set(0,L.height*.5,0),i.rectArea[c]=I,c++}else if(L.isPointLight){let I=t.get(L);if(I.color.copy(L.color).multiplyScalar(L.intensity),I.distance=L.distance,I.decay=L.decay,L.castShadow){let D=L.shadow,U=e.get(L);U.shadowIntensity=D.intensity,U.shadowBias=D.bias,U.shadowNormalBias=D.normalBias,U.shadowRadius=D.radius,U.shadowMapSize=D.mapSize,U.shadowCameraNear=D.camera.near,U.shadowCameraFar=D.camera.far,i.pointShadow[l]=U,i.pointShadowMap[l]=S,i.pointShadowMatrix[l]=L.shadow.matrix,_++}i.point[l]=I,l++}else if(L.isHemisphereLight){let I=t.get(L);I.skyColor.copy(L.color).multiplyScalar(w),I.groundColor.copy(L.groundColor).multiplyScalar(w),i.hemi[f]=I,f++}}c>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=vt.LTC_FLOAT_1,i.rectAreaLTC2=vt.LTC_FLOAT_2):(i.rectAreaLTC1=vt.LTC_HALF_1,i.rectAreaLTC2=vt.LTC_HALF_2)),i.ambient[0]=M,i.ambient[1]=y,i.ambient[2]=h;let d=i.hash;(d.directionalLength!==o||d.pointLength!==l||d.spotLength!==p||d.rectAreaLength!==c||d.hemiLength!==f||d.numDirectionalShadows!==E||d.numPointShadows!==_||d.numSpotShadows!==v||d.numSpotMaps!==A||d.numLightProbes!==C)&&(i.directional.length=o,i.spot.length=p,i.rectArea.length=c,i.point.length=l,i.hemi.length=f,i.directionalShadow.length=E,i.directionalShadowMap.length=E,i.pointShadow.length=_,i.pointShadowMap.length=_,i.spotShadow.length=v,i.spotShadowMap.length=v,i.directionalShadowMatrix.length=E,i.pointShadowMatrix.length=_,i.spotLightMatrix.length=v+A-P,i.spotLightMap.length=A,i.numSpotLightShadowsWithMaps=P,i.numLightProbes=C,d.directionalLength=o,d.pointLength=l,d.spotLength=p,d.rectAreaLength=c,d.hemiLength=f,d.numDirectionalShadows=E,d.numPointShadows=_,d.numSpotShadows=v,d.numSpotMaps=A,d.numLightProbes=C,i.version=tg++)}function m(x,M){let y=0,h=0,o=0,l=0,p=0,c=M.matrixWorldInverse;for(let f=0,E=x.length;f<E;f++){let _=x[f];if(_.isDirectionalLight){let v=i.directional[y];v.direction.setFromMatrixPosition(_.matrixWorld),s.setFromMatrixPosition(_.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(c),y++}else if(_.isSpotLight){let v=i.spot[o];v.position.setFromMatrixPosition(_.matrixWorld),v.position.applyMatrix4(c),v.direction.setFromMatrixPosition(_.matrixWorld),s.setFromMatrixPosition(_.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(c),o++}else if(_.isRectAreaLight){let v=i.rectArea[l];v.position.setFromMatrixPosition(_.matrixWorld),v.position.applyMatrix4(c),a.identity(),r.copy(_.matrixWorld),r.premultiply(c),a.extractRotation(r),v.halfWidth.set(_.width*.5,0,0),v.halfHeight.set(0,_.height*.5,0),v.halfWidth.applyMatrix4(a),v.halfHeight.applyMatrix4(a),l++}else if(_.isPointLight){let v=i.point[h];v.position.setFromMatrixPosition(_.matrixWorld),v.position.applyMatrix4(c),h++}else if(_.isHemisphereLight){let v=i.hemi[p];v.direction.setFromMatrixPosition(_.matrixWorld),v.direction.transformDirection(c),p++}}}return{setup:u,setupView:m,state:i}}function Yh(n){let t=new ig(n),e=[],i=[],s=[];function r(h){y.camera=h,e.length=0,i.length=0,s.length=0}function a(h){e.push(h)}function u(h){i.push(h)}function m(h){s.push(h)}function x(){t.setup(e)}function M(h){t.setupView(e,h)}let y={lightsArray:e,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:y,setupLights:x,setupLightsView:M,pushLight:a,pushShadow:u,pushLightProbeGrid:m}}function ng(n){let t=new WeakMap;function e(s,r=0){let a=t.get(s),u;return a===void 0?(u=new Yh(n),t.set(s,[u])):r>=a.length?(u=new Yh(n),a.push(u)):u=a[r],u}function i(){t=new WeakMap}return{get:e,dispose:i}}var sg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,rg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,ag=[new W(1,0,0),new W(-1,0,0),new W(0,1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1)],og=[new W(0,-1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1),new W(0,-1,0),new W(0,-1,0)],Zh=new se,Qs=new W,Ol=new W;function lg(n,t,e){let i=new Fs,s=new ne,r=new ne,a=new ye,u=new ta,m=new ea,x={},M=e.maxTextureSize,y={[hi]:Ve,[Ve]:hi,[Ee]:Ee},h=new ze({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ne},radius:{value:4}},vertexShader:sg,fragmentShader:rg}),o=h.clone();o.defines.HORIZONTAL_PASS=1;let l=new ge;l.setAttribute("position",new Be(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let p=new ae(l,h),c=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Gs;let f=this.type;this.render=function(P,C,d){if(c.enabled===!1||c.autoUpdate===!1&&c.needsUpdate===!1||P.length===0)return;this.type===qc&&(Ft("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Gs);let b=n.getRenderTarget(),R=n.getActiveCubeFace(),L=n.getActiveMipmapLevel(),g=n.state;g.setBlending(ei),g.buffers.depth.getReversed()===!0?g.buffers.color.setClear(0,0,0,0):g.buffers.color.setClear(1,1,1,1),g.buffers.depth.setTest(!0),g.setScissorTest(!1);let w=f!==this.type;w&&C.traverse(function(T){T.material&&(Array.isArray(T.material)?T.material.forEach(S=>S.needsUpdate=!0):T.material.needsUpdate=!0)});for(let T=0,S=P.length;T<S;T++){let I=P[T],D=I.shadow;if(D===void 0){Ft("WebGLShadowMap:",I,"has no shadow.");continue}if(D.autoUpdate===!1&&D.needsUpdate===!1)continue;s.copy(D.mapSize);let U=D.getFrameExtents();s.multiply(U),r.copy(D.mapSize),(s.x>M||s.y>M)&&(s.x>M&&(r.x=Math.floor(M/U.x),s.x=r.x*U.x,D.mapSize.x=r.x),s.y>M&&(r.y=Math.floor(M/U.y),s.y=r.y*U.y,D.mapSize.y=r.y));let B=n.state.buffers.depth.getReversed();if(D.camera._reversedDepth=B,D.map===null||w===!0){if(D.map!==null&&(D.map.depthTexture!==null&&(D.map.depthTexture.dispose(),D.map.depthTexture=null),D.map.dispose()),this.type===hs){if(I.isPointLight){Ft("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}D.map=new ke(s.x,s.y,{format:dn,type:Ci,minFilter:we,magFilter:we,generateMipmaps:!1}),D.map.texture.name=I.name+".shadowMap",D.map.depthTexture=new zi(s.x,s.y,ii),D.map.depthTexture.name=I.name+".shadowMapDepth",D.map.depthTexture.format=Mi,D.map.depthTexture.compareFunction=null,D.map.depthTexture.minFilter=Ie,D.map.depthTexture.magFilter=Ie}else I.isPointLight?(D.map=new lo(s.x),D.map.depthTexture=new Qr(s.x,pi)):(D.map=new ke(s.x,s.y),D.map.depthTexture=new zi(s.x,s.y,pi)),D.map.depthTexture.name=I.name+".shadowMap",D.map.depthTexture.format=Mi,this.type===Gs?(D.map.depthTexture.compareFunction=B?no:io,D.map.depthTexture.minFilter=we,D.map.depthTexture.magFilter=we):(D.map.depthTexture.compareFunction=null,D.map.depthTexture.minFilter=Ie,D.map.depthTexture.magFilter=Ie);D.camera.updateProjectionMatrix()}let z=D.map.isWebGLCubeRenderTarget?6:1;for(let k=0;k<z;k++){if(D.map.isWebGLCubeRenderTarget)n.setRenderTarget(D.map,k),n.clear();else{k===0&&(n.setRenderTarget(D.map),n.clear());let H=D.getViewport(k);a.set(r.x*H.x,r.y*H.y,r.x*H.z,r.y*H.w),g.viewport(a)}if(I.isPointLight){let H=D.camera,Y=D.matrix,ht=I.distance||H.far;ht!==H.far&&(H.far=ht,H.updateProjectionMatrix()),Qs.setFromMatrixPosition(I.matrixWorld),H.position.copy(Qs),Ol.copy(H.position),Ol.add(ag[k]),H.up.copy(og[k]),H.lookAt(Ol),H.updateMatrixWorld(),Y.makeTranslation(-Qs.x,-Qs.y,-Qs.z),Zh.multiplyMatrices(H.projectionMatrix,H.matrixWorldInverse),D._frustum.setFromProjectionMatrix(Zh,H.coordinateSystem,H.reversedDepth)}else D.updateMatrices(I);i=D.getFrustum(),v(C,d,D.camera,I,this.type)}D.isPointLightShadow!==!0&&this.type===hs&&E(D,d),D.needsUpdate=!1}f=this.type,c.needsUpdate=!1,n.setRenderTarget(b,R,L)};function E(P,C){let d=t.update(p);h.defines.VSM_SAMPLES!==P.blurSamples&&(h.defines.VSM_SAMPLES=P.blurSamples,o.defines.VSM_SAMPLES=P.blurSamples,h.needsUpdate=!0,o.needsUpdate=!0),P.mapPass===null&&(P.mapPass=new ke(s.x,s.y,{format:dn,type:Ci})),h.uniforms.shadow_pass.value=P.map.depthTexture,h.uniforms.resolution.value=P.mapSize,h.uniforms.radius.value=P.radius,n.setRenderTarget(P.mapPass),n.clear(),n.renderBufferDirect(C,null,d,h,p,null),o.uniforms.shadow_pass.value=P.mapPass.texture,o.uniforms.resolution.value=P.mapSize,o.uniforms.radius.value=P.radius,n.setRenderTarget(P.map),n.clear(),n.renderBufferDirect(C,null,d,o,p,null)}function _(P,C,d,b){let R=null,L=d.isPointLight===!0?P.customDistanceMaterial:P.customDepthMaterial;if(L!==void 0)R=L;else if(R=d.isPointLight===!0?m:u,n.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){let g=R.uuid,w=C.uuid,T=x[g];T===void 0&&(T={},x[g]=T);let S=T[w];S===void 0&&(S=R.clone(),T[w]=S,C.addEventListener("dispose",A)),R=S}if(R.visible=C.visible,R.wireframe=C.wireframe,b===hs?R.side=C.shadowSide!==null?C.shadowSide:C.side:R.side=C.shadowSide!==null?C.shadowSide:y[C.side],R.alphaMap=C.alphaMap,R.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,R.map=C.map,R.clipShadows=C.clipShadows,R.clippingPlanes=C.clippingPlanes,R.clipIntersection=C.clipIntersection,R.displacementMap=C.displacementMap,R.displacementScale=C.displacementScale,R.displacementBias=C.displacementBias,R.wireframeLinewidth=C.wireframeLinewidth,R.linewidth=C.linewidth,d.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let g=n.properties.get(R);g.light=d}return R}function v(P,C,d,b,R){if(P.visible===!1)return;if(P.layers.test(C.layers)&&(P.isMesh||P.isLine||P.isPoints)&&(P.castShadow||P.receiveShadow&&R===hs)&&(!P.frustumCulled||i.intersectsObject(P))){P.modelViewMatrix.multiplyMatrices(d.matrixWorldInverse,P.matrixWorld);let w=t.update(P),T=P.material;if(Array.isArray(T)){let S=w.groups;for(let I=0,D=S.length;I<D;I++){let U=S[I],B=T[U.materialIndex];if(B&&B.visible){let z=_(P,B,b,R);P.onBeforeShadow(n,P,C,d,w,z,U),n.renderBufferDirect(d,null,w,z,P,U),P.onAfterShadow(n,P,C,d,w,z,U)}}}else if(T.visible){let S=_(P,T,b,R);P.onBeforeShadow(n,P,C,d,w,S,null),n.renderBufferDirect(d,null,w,S,P,null),P.onAfterShadow(n,P,C,d,w,S,null)}}let g=P.children;for(let w=0,T=g.length;w<T;w++)v(g[w],C,d,b,R)}function A(P){P.target.removeEventListener("dispose",A);for(let d in x){let b=x[d],R=P.target.uuid;R in b&&(b[R].dispose(),delete b[R])}}}function cg(n,t){function e(){let G=!1,ft=new ye,nt=null,Tt=new ye(0,0,0,0);return{setMask:function(xt){nt!==xt&&!G&&(n.colorMask(xt,xt,xt,xt),nt=xt)},setLocked:function(xt){G=xt},setClear:function(xt,lt,Pt,Ht,ve){ve===!0&&(xt*=Ht,lt*=Ht,Pt*=Ht),ft.set(xt,lt,Pt,Ht),Tt.equals(ft)===!1&&(n.clearColor(xt,lt,Pt,Ht),Tt.copy(ft))},reset:function(){G=!1,nt=null,Tt.set(-1,0,0,0)}}}function i(){let G=!1,ft=!1,nt=null,Tt=null,xt=null;return{setReversed:function(lt){if(ft!==lt){let Pt=t.get("EXT_clip_control");lt?Pt.clipControlEXT(Pt.LOWER_LEFT_EXT,Pt.ZERO_TO_ONE_EXT):Pt.clipControlEXT(Pt.LOWER_LEFT_EXT,Pt.NEGATIVE_ONE_TO_ONE_EXT),ft=lt;let Ht=xt;xt=null,this.setClear(Ht)}},getReversed:function(){return ft},setTest:function(lt){lt?Q(n.DEPTH_TEST):at(n.DEPTH_TEST)},setMask:function(lt){nt!==lt&&!G&&(n.depthMask(lt),nt=lt)},setFunc:function(lt){if(ft&&(lt=Sh[lt]),Tt!==lt){switch(lt){case Ur:n.depthFunc(n.NEVER);break;case Or:n.depthFunc(n.ALWAYS);break;case ts:n.depthFunc(n.LESS);break;case Sn:n.depthFunc(n.LEQUAL);break;case Br:n.depthFunc(n.EQUAL);break;case kr:n.depthFunc(n.GEQUAL);break;case zr:n.depthFunc(n.GREATER);break;case Vr:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}Tt=lt}},setLocked:function(lt){G=lt},setClear:function(lt){xt!==lt&&(xt=lt,ft&&(lt=1-lt),n.clearDepth(lt))},reset:function(){G=!1,nt=null,Tt=null,xt=null,ft=!1}}}function s(){let G=!1,ft=null,nt=null,Tt=null,xt=null,lt=null,Pt=null,Ht=null,ve=null;return{setTest:function(oe){G||(oe?Q(n.STENCIL_TEST):at(n.STENCIL_TEST))},setMask:function(oe){ft!==oe&&!G&&(n.stencilMask(oe),ft=oe)},setFunc:function(oe,Pi,mi){(nt!==oe||Tt!==Pi||xt!==mi)&&(n.stencilFunc(oe,Pi,mi),nt=oe,Tt=Pi,xt=mi)},setOp:function(oe,Pi,mi){(lt!==oe||Pt!==Pi||Ht!==mi)&&(n.stencilOp(oe,Pi,mi),lt=oe,Pt=Pi,Ht=mi)},setLocked:function(oe){G=oe},setClear:function(oe){ve!==oe&&(n.clearStencil(oe),ve=oe)},reset:function(){G=!1,ft=null,nt=null,Tt=null,xt=null,lt=null,Pt=null,Ht=null,ve=null}}}let r=new e,a=new i,u=new s,m=new WeakMap,x=new WeakMap,M={},y={},h={},o=new WeakMap,l=[],p=null,c=!1,f=null,E=null,_=null,v=null,A=null,P=null,C=null,d=new ee(0,0,0),b=0,R=!1,L=null,g=null,w=null,T=null,S=null,I=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),D=!1,U=0,B=n.getParameter(n.VERSION);B.indexOf("WebGL")!==-1?(U=parseFloat(/^WebGL (\d)/.exec(B)[1]),D=U>=1):B.indexOf("OpenGL ES")!==-1&&(U=parseFloat(/^OpenGL ES (\d)/.exec(B)[1]),D=U>=2);let z=null,k={},H=n.getParameter(n.SCISSOR_BOX),Y=n.getParameter(n.VIEWPORT),ht=new ye().fromArray(H),rt=new ye().fromArray(Y);function X(G,ft,nt,Tt){let xt=new Uint8Array(4),lt=n.createTexture();n.bindTexture(G,lt),n.texParameteri(G,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(G,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Pt=0;Pt<nt;Pt++)G===n.TEXTURE_3D||G===n.TEXTURE_2D_ARRAY?n.texImage3D(ft,0,n.RGBA,1,1,Tt,0,n.RGBA,n.UNSIGNED_BYTE,xt):n.texImage2D(ft+Pt,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,xt);return lt}let $={};$[n.TEXTURE_2D]=X(n.TEXTURE_2D,n.TEXTURE_2D,1),$[n.TEXTURE_CUBE_MAP]=X(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),$[n.TEXTURE_2D_ARRAY]=X(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),$[n.TEXTURE_3D]=X(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),u.setClear(0),Q(n.DEPTH_TEST),a.setFunc(Sn),Yt(!1),Ut(ll),Q(n.CULL_FACE),Ot(ei);function Q(G){M[G]!==!0&&(n.enable(G),M[G]=!0)}function at(G){M[G]!==!1&&(n.disable(G),M[G]=!1)}function pt(G,ft){return h[G]!==ft?(n.bindFramebuffer(G,ft),h[G]=ft,G===n.DRAW_FRAMEBUFFER&&(h[n.FRAMEBUFFER]=ft),G===n.FRAMEBUFFER&&(h[n.DRAW_FRAMEBUFFER]=ft),!0):!1}function tt(G,ft){let nt=l,Tt=!1;if(G){nt=o.get(ft),nt===void 0&&(nt=[],o.set(ft,nt));let xt=G.textures;if(nt.length!==xt.length||nt[0]!==n.COLOR_ATTACHMENT0){for(let lt=0,Pt=xt.length;lt<Pt;lt++)nt[lt]=n.COLOR_ATTACHMENT0+lt;nt.length=xt.length,Tt=!0}}else nt[0]!==n.BACK&&(nt[0]=n.BACK,Tt=!0);Tt&&n.drawBuffers(nt)}function yt(G){return p!==G?(n.useProgram(G),p=G,!0):!1}let Et={[ui]:n.FUNC_ADD,[Yc]:n.FUNC_SUBTRACT,[Zc]:n.FUNC_REVERSE_SUBTRACT};Et[Jc]=n.MIN,Et[jc]=n.MAX;let bt={[Kc]:n.ZERO,[ma]:n.ONE,[$c]:n.SRC_COLOR,[bn]:n.SRC_ALPHA,[sh]:n.SRC_ALPHA_SATURATE,[ih]:n.DST_COLOR,[th]:n.DST_ALPHA,[Qc]:n.ONE_MINUS_SRC_COLOR,[Qi]:n.ONE_MINUS_SRC_ALPHA,[nh]:n.ONE_MINUS_DST_COLOR,[eh]:n.ONE_MINUS_DST_ALPHA,[rh]:n.CONSTANT_COLOR,[ah]:n.ONE_MINUS_CONSTANT_COLOR,[oh]:n.CONSTANT_ALPHA,[lh]:n.ONE_MINUS_CONSTANT_ALPHA};function Ot(G,ft,nt,Tt,xt,lt,Pt,Ht,ve,oe){if(G===ei){c===!0&&(at(n.BLEND),c=!1);return}if(c===!1&&(Q(n.BLEND),c=!0),G!==pa){if(G!==f||oe!==R){if((E!==ui||A!==ui)&&(n.blendEquation(n.FUNC_ADD),E=ui,A=ui),oe)switch(G){case Bi:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case In:n.blendFunc(n.ONE,n.ONE);break;case cl:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case hl:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Nt("WebGLState: Invalid blending: ",G);break}else switch(G){case Bi:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case In:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case cl:Nt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case hl:Nt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Nt("WebGLState: Invalid blending: ",G);break}_=null,v=null,P=null,C=null,d.set(0,0,0),b=0,f=G,R=oe}return}xt=xt||ft,lt=lt||nt,Pt=Pt||Tt,(ft!==E||xt!==A)&&(n.blendEquationSeparate(Et[ft],Et[xt]),E=ft,A=xt),(nt!==_||Tt!==v||lt!==P||Pt!==C)&&(n.blendFuncSeparate(bt[nt],bt[Tt],bt[lt],bt[Pt]),_=nt,v=Tt,P=lt,C=Pt),(Ht.equals(d)===!1||ve!==b)&&(n.blendColor(Ht.r,Ht.g,Ht.b,ve),d.copy(Ht),b=ve),f=G,R=!1}function St(G,ft){G.side===Ee?at(n.CULL_FACE):Q(n.CULL_FACE);let nt=G.side===Ve;ft&&(nt=!nt),Yt(nt),G.blending===Bi&&G.transparent===!1?Ot(ei):Ot(G.blending,G.blendEquation,G.blendSrc,G.blendDst,G.blendEquationAlpha,G.blendSrcAlpha,G.blendDstAlpha,G.blendColor,G.blendAlpha,G.premultipliedAlpha),a.setFunc(G.depthFunc),a.setTest(G.depthTest),a.setMask(G.depthWrite),r.setMask(G.colorWrite);let Tt=G.stencilWrite;u.setTest(Tt),Tt&&(u.setMask(G.stencilWriteMask),u.setFunc(G.stencilFunc,G.stencilRef,G.stencilFuncMask),u.setOp(G.stencilFail,G.stencilZFail,G.stencilZPass)),V(G.polygonOffset,G.polygonOffsetFactor,G.polygonOffsetUnits),G.alphaToCoverage===!0?Q(n.SAMPLE_ALPHA_TO_COVERAGE):at(n.SAMPLE_ALPHA_TO_COVERAGE)}function Yt(G){L!==G&&(G?n.frontFace(n.CW):n.frontFace(n.CCW),L=G)}function Ut(G){G!==Wc?(Q(n.CULL_FACE),G!==g&&(G===ll?n.cullFace(n.BACK):G===Xc?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):at(n.CULL_FACE),g=G}function $t(G){G!==w&&(D&&n.lineWidth(G),w=G)}function V(G,ft,nt){G?(Q(n.POLYGON_OFFSET_FILL),(T!==ft||S!==nt)&&(T=ft,S=nt,a.getReversed()&&(ft=-ft),n.polygonOffset(ft,nt))):at(n.POLYGON_OFFSET_FILL)}function Vt(G){G?Q(n.SCISSOR_TEST):at(n.SCISSOR_TEST)}function Bt(G){G===void 0&&(G=n.TEXTURE0+I-1),z!==G&&(n.activeTexture(G),z=G)}function Jt(G,ft,nt){nt===void 0&&(z===null?nt=n.TEXTURE0+I-1:nt=z);let Tt=k[nt];Tt===void 0&&(Tt={type:void 0,texture:void 0},k[nt]=Tt),(Tt.type!==G||Tt.texture!==ft)&&(z!==nt&&(n.activeTexture(nt),z=nt),n.bindTexture(G,ft||$[G]),Tt.type=G,Tt.texture=ft)}function mt(){let G=k[z];G!==void 0&&G.type!==void 0&&(n.bindTexture(G.type,null),G.type=void 0,G.texture=void 0)}function Qt(){try{n.compressedTexImage2D(...arguments)}catch(G){Nt("WebGLState:",G)}}function O(){try{n.compressedTexImage3D(...arguments)}catch(G){Nt("WebGLState:",G)}}function F(){try{n.texSubImage2D(...arguments)}catch(G){Nt("WebGLState:",G)}}function Z(){try{n.texSubImage3D(...arguments)}catch(G){Nt("WebGLState:",G)}}function it(){try{n.compressedTexSubImage2D(...arguments)}catch(G){Nt("WebGLState:",G)}}function ot(){try{n.compressedTexSubImage3D(...arguments)}catch(G){Nt("WebGLState:",G)}}function ct(){try{n.texStorage2D(...arguments)}catch(G){Nt("WebGLState:",G)}}function ut(){try{n.texStorage3D(...arguments)}catch(G){Nt("WebGLState:",G)}}function et(){try{n.texImage2D(...arguments)}catch(G){Nt("WebGLState:",G)}}function st(){try{n.texImage3D(...arguments)}catch(G){Nt("WebGLState:",G)}}function wt(G){return y[G]!==void 0?y[G]:n.getParameter(G)}function Ct(G,ft){y[G]!==ft&&(n.pixelStorei(G,ft),y[G]=ft)}function gt(G){ht.equals(G)===!1&&(n.scissor(G.x,G.y,G.z,G.w),ht.copy(G))}function dt(G){rt.equals(G)===!1&&(n.viewport(G.x,G.y,G.z,G.w),rt.copy(G))}function kt(G,ft){let nt=x.get(ft);nt===void 0&&(nt=new WeakMap,x.set(ft,nt));let Tt=nt.get(G);Tt===void 0&&(Tt=n.getUniformBlockIndex(ft,G.name),nt.set(G,Tt))}function Wt(G,ft){let Tt=x.get(ft).get(G);m.get(ft)!==Tt&&(n.uniformBlockBinding(ft,Tt,G.__bindingPointIndex),m.set(ft,Tt))}function ie(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),M={},y={},z=null,k={},h={},o=new WeakMap,l=[],p=null,c=!1,f=null,E=null,_=null,v=null,A=null,P=null,C=null,d=new ee(0,0,0),b=0,R=!1,L=null,g=null,w=null,T=null,S=null,ht.set(0,0,n.canvas.width,n.canvas.height),rt.set(0,0,n.canvas.width,n.canvas.height),r.reset(),a.reset(),u.reset()}return{buffers:{color:r,depth:a,stencil:u},enable:Q,disable:at,bindFramebuffer:pt,drawBuffers:tt,useProgram:yt,setBlending:Ot,setMaterial:St,setFlipSided:Yt,setCullFace:Ut,setLineWidth:$t,setPolygonOffset:V,setScissorTest:Vt,activeTexture:Bt,bindTexture:Jt,unbindTexture:mt,compressedTexImage2D:Qt,compressedTexImage3D:O,texImage2D:et,texImage3D:st,pixelStorei:Ct,getParameter:wt,updateUBOMapping:kt,uniformBlockBinding:Wt,texStorage2D:ct,texStorage3D:ut,texSubImage2D:F,texSubImage3D:Z,compressedTexSubImage2D:it,compressedTexSubImage3D:ot,scissor:gt,viewport:dt,reset:ie}}function hg(n,t,e,i,s,r,a){let u=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,m=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),x=new ne,M=new WeakMap,y=new Set,h,o=new WeakMap,l=!1;try{l=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function p(O,F){return l?new OffscreenCanvas(O,F):is("canvas")}function c(O,F,Z){let it=1,ot=Qt(O);if((ot.width>Z||ot.height>Z)&&(it=Z/Math.max(ot.width,ot.height)),it<1)if(typeof HTMLImageElement<"u"&&O instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&O instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&O instanceof ImageBitmap||typeof VideoFrame<"u"&&O instanceof VideoFrame){let ct=Math.floor(it*ot.width),ut=Math.floor(it*ot.height);h===void 0&&(h=p(ct,ut));let et=F?p(ct,ut):h;return et.width=ct,et.height=ut,et.getContext("2d").drawImage(O,0,0,ct,ut),Ft("WebGLRenderer: Texture has been resized from ("+ot.width+"x"+ot.height+") to ("+ct+"x"+ut+")."),et}else return"data"in O&&Ft("WebGLRenderer: Image in DataTexture is too big ("+ot.width+"x"+ot.height+")."),O;return O}function f(O){return O.generateMipmaps}function E(O){n.generateMipmap(O)}function _(O){return O.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:O.isWebGL3DRenderTarget?n.TEXTURE_3D:O.isWebGLArrayRenderTarget||O.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function v(O,F,Z,it,ot,ct=!1){if(O!==null){if(n[O]!==void 0)return n[O];Ft("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+O+"'")}let ut;it&&(ut=t.get("EXT_texture_norm16"),ut||Ft("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let et=F;if(F===n.RED&&(Z===n.FLOAT&&(et=n.R32F),Z===n.HALF_FLOAT&&(et=n.R16F),Z===n.UNSIGNED_BYTE&&(et=n.R8),Z===n.UNSIGNED_SHORT&&ut&&(et=ut.R16_EXT),Z===n.SHORT&&ut&&(et=ut.R16_SNORM_EXT)),F===n.RED_INTEGER&&(Z===n.UNSIGNED_BYTE&&(et=n.R8UI),Z===n.UNSIGNED_SHORT&&(et=n.R16UI),Z===n.UNSIGNED_INT&&(et=n.R32UI),Z===n.BYTE&&(et=n.R8I),Z===n.SHORT&&(et=n.R16I),Z===n.INT&&(et=n.R32I)),F===n.RG&&(Z===n.FLOAT&&(et=n.RG32F),Z===n.HALF_FLOAT&&(et=n.RG16F),Z===n.UNSIGNED_BYTE&&(et=n.RG8),Z===n.UNSIGNED_SHORT&&ut&&(et=ut.RG16_EXT),Z===n.SHORT&&ut&&(et=ut.RG16_SNORM_EXT)),F===n.RG_INTEGER&&(Z===n.UNSIGNED_BYTE&&(et=n.RG8UI),Z===n.UNSIGNED_SHORT&&(et=n.RG16UI),Z===n.UNSIGNED_INT&&(et=n.RG32UI),Z===n.BYTE&&(et=n.RG8I),Z===n.SHORT&&(et=n.RG16I),Z===n.INT&&(et=n.RG32I)),F===n.RGB_INTEGER&&(Z===n.UNSIGNED_BYTE&&(et=n.RGB8UI),Z===n.UNSIGNED_SHORT&&(et=n.RGB16UI),Z===n.UNSIGNED_INT&&(et=n.RGB32UI),Z===n.BYTE&&(et=n.RGB8I),Z===n.SHORT&&(et=n.RGB16I),Z===n.INT&&(et=n.RGB32I)),F===n.RGBA_INTEGER&&(Z===n.UNSIGNED_BYTE&&(et=n.RGBA8UI),Z===n.UNSIGNED_SHORT&&(et=n.RGBA16UI),Z===n.UNSIGNED_INT&&(et=n.RGBA32UI),Z===n.BYTE&&(et=n.RGBA8I),Z===n.SHORT&&(et=n.RGBA16I),Z===n.INT&&(et=n.RGBA32I)),F===n.RGB&&(Z===n.UNSIGNED_SHORT&&ut&&(et=ut.RGB16_EXT),Z===n.SHORT&&ut&&(et=ut.RGB16_SNORM_EXT),Z===n.UNSIGNED_INT_5_9_9_9_REV&&(et=n.RGB9_E5),Z===n.UNSIGNED_INT_10F_11F_11F_REV&&(et=n.R11F_G11F_B10F)),F===n.RGBA){let st=ct?Ts:Zt.getTransfer(ot);Z===n.FLOAT&&(et=n.RGBA32F),Z===n.HALF_FLOAT&&(et=n.RGBA16F),Z===n.UNSIGNED_BYTE&&(et=st===re?n.SRGB8_ALPHA8:n.RGBA8),Z===n.UNSIGNED_SHORT&&ut&&(et=ut.RGBA16_EXT),Z===n.SHORT&&ut&&(et=ut.RGBA16_SNORM_EXT),Z===n.UNSIGNED_SHORT_4_4_4_4&&(et=n.RGBA4),Z===n.UNSIGNED_SHORT_5_5_5_1&&(et=n.RGB5_A1)}return(et===n.R16F||et===n.R32F||et===n.RG16F||et===n.RG32F||et===n.RGBA16F||et===n.RGBA32F)&&t.get("EXT_color_buffer_float"),et}function A(O,F){let Z;return O?F===null||F===pi||F===ds?Z=n.DEPTH24_STENCIL8:F===ii?Z=n.DEPTH32F_STENCIL8:F===us&&(Z=n.DEPTH24_STENCIL8,Ft("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):F===null||F===pi||F===ds?Z=n.DEPTH_COMPONENT24:F===ii?Z=n.DEPTH_COMPONENT32F:F===us&&(Z=n.DEPTH_COMPONENT16),Z}function P(O,F){return f(O)===!0||O.isFramebufferTexture&&O.minFilter!==Ie&&O.minFilter!==we?Math.log2(Math.max(F.width,F.height))+1:O.mipmaps!==void 0&&O.mipmaps.length>0?O.mipmaps.length:O.isCompressedTexture&&Array.isArray(O.image)?F.mipmaps.length:1}function C(O){let F=O.target;F.removeEventListener("dispose",C),b(F),F.isVideoTexture&&M.delete(F),F.isHTMLTexture&&y.delete(F)}function d(O){let F=O.target;F.removeEventListener("dispose",d),L(F)}function b(O){let F=i.get(O);if(F.__webglInit===void 0)return;let Z=O.source,it=o.get(Z);if(it){let ot=it[F.__cacheKey];ot.usedTimes--,ot.usedTimes===0&&R(O),Object.keys(it).length===0&&o.delete(Z)}i.remove(O)}function R(O){let F=i.get(O);n.deleteTexture(F.__webglTexture);let Z=O.source,it=o.get(Z);delete it[F.__cacheKey],a.memory.textures--}function L(O){let F=i.get(O);if(O.depthTexture&&(O.depthTexture.dispose(),i.remove(O.depthTexture)),O.isWebGLCubeRenderTarget)for(let it=0;it<6;it++){if(Array.isArray(F.__webglFramebuffer[it]))for(let ot=0;ot<F.__webglFramebuffer[it].length;ot++)n.deleteFramebuffer(F.__webglFramebuffer[it][ot]);else n.deleteFramebuffer(F.__webglFramebuffer[it]);F.__webglDepthbuffer&&n.deleteRenderbuffer(F.__webglDepthbuffer[it])}else{if(Array.isArray(F.__webglFramebuffer))for(let it=0;it<F.__webglFramebuffer.length;it++)n.deleteFramebuffer(F.__webglFramebuffer[it]);else n.deleteFramebuffer(F.__webglFramebuffer);if(F.__webglDepthbuffer&&n.deleteRenderbuffer(F.__webglDepthbuffer),F.__webglMultisampledFramebuffer&&n.deleteFramebuffer(F.__webglMultisampledFramebuffer),F.__webglColorRenderbuffer)for(let it=0;it<F.__webglColorRenderbuffer.length;it++)F.__webglColorRenderbuffer[it]&&n.deleteRenderbuffer(F.__webglColorRenderbuffer[it]);F.__webglDepthRenderbuffer&&n.deleteRenderbuffer(F.__webglDepthRenderbuffer)}let Z=O.textures;for(let it=0,ot=Z.length;it<ot;it++){let ct=i.get(Z[it]);ct.__webglTexture&&(n.deleteTexture(ct.__webglTexture),a.memory.textures--),i.remove(Z[it])}i.remove(O)}let g=0;function w(){g=0}function T(){return g}function S(O){g=O}function I(){let O=g;return O>=s.maxTextures&&Ft("WebGLTextures: Trying to use "+O+" texture units while this GPU supports only "+s.maxTextures),g+=1,O}function D(O){let F=[];return F.push(O.wrapS),F.push(O.wrapT),F.push(O.wrapR||0),F.push(O.magFilter),F.push(O.minFilter),F.push(O.anisotropy),F.push(O.internalFormat),F.push(O.format),F.push(O.type),F.push(O.generateMipmaps),F.push(O.premultiplyAlpha),F.push(O.flipY),F.push(O.unpackAlignment),F.push(O.colorSpace),F.join()}function U(O,F){let Z=i.get(O);if(O.isVideoTexture&&Jt(O),O.isRenderTargetTexture===!1&&O.isExternalTexture!==!0&&O.version>0&&Z.__version!==O.version){let it=O.image;if(it===null)Ft("WebGLRenderer: Texture marked for update but no image data found.");else if(it.complete===!1)Ft("WebGLRenderer: Texture marked for update but image is incomplete");else{at(Z,O,F);return}}else O.isExternalTexture&&(Z.__webglTexture=O.sourceTexture?O.sourceTexture:null);e.bindTexture(n.TEXTURE_2D,Z.__webglTexture,n.TEXTURE0+F)}function B(O,F){let Z=i.get(O);if(O.isRenderTargetTexture===!1&&O.version>0&&Z.__version!==O.version){at(Z,O,F);return}else O.isExternalTexture&&(Z.__webglTexture=O.sourceTexture?O.sourceTexture:null);e.bindTexture(n.TEXTURE_2D_ARRAY,Z.__webglTexture,n.TEXTURE0+F)}function z(O,F){let Z=i.get(O);if(O.isRenderTargetTexture===!1&&O.version>0&&Z.__version!==O.version){at(Z,O,F);return}e.bindTexture(n.TEXTURE_3D,Z.__webglTexture,n.TEXTURE0+F)}function k(O,F){let Z=i.get(O);if(O.isCubeDepthTexture!==!0&&O.version>0&&Z.__version!==O.version){pt(Z,O,F);return}e.bindTexture(n.TEXTURE_CUBE_MAP,Z.__webglTexture,n.TEXTURE0+F)}let H={[es]:n.REPEAT,[_i]:n.CLAMP_TO_EDGE,[Hr]:n.MIRRORED_REPEAT},Y={[Ie]:n.NEAREST,[uh]:n.NEAREST_MIPMAP_NEAREST,[Xs]:n.NEAREST_MIPMAP_LINEAR,[we]:n.LINEAR,[ya]:n.LINEAR_MIPMAP_NEAREST,[Ai]:n.LINEAR_MIPMAP_LINEAR},ht={[ph]:n.NEVER,[vh]:n.ALWAYS,[mh]:n.LESS,[io]:n.LEQUAL,[gh]:n.EQUAL,[no]:n.GEQUAL,[xh]:n.GREATER,[yh]:n.NOTEQUAL};function rt(O,F){if(F.type===ii&&t.has("OES_texture_float_linear")===!1&&(F.magFilter===we||F.magFilter===ya||F.magFilter===Xs||F.magFilter===Ai||F.minFilter===we||F.minFilter===ya||F.minFilter===Xs||F.minFilter===Ai)&&Ft("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(O,n.TEXTURE_WRAP_S,H[F.wrapS]),n.texParameteri(O,n.TEXTURE_WRAP_T,H[F.wrapT]),(O===n.TEXTURE_3D||O===n.TEXTURE_2D_ARRAY)&&n.texParameteri(O,n.TEXTURE_WRAP_R,H[F.wrapR]),n.texParameteri(O,n.TEXTURE_MAG_FILTER,Y[F.magFilter]),n.texParameteri(O,n.TEXTURE_MIN_FILTER,Y[F.minFilter]),F.compareFunction&&(n.texParameteri(O,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(O,n.TEXTURE_COMPARE_FUNC,ht[F.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(F.magFilter===Ie||F.minFilter!==Xs&&F.minFilter!==Ai||F.type===ii&&t.has("OES_texture_float_linear")===!1)return;if(F.anisotropy>1||i.get(F).__currentAnisotropy){let Z=t.get("EXT_texture_filter_anisotropic");n.texParameterf(O,Z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(F.anisotropy,s.getMaxAnisotropy())),i.get(F).__currentAnisotropy=F.anisotropy}}}function X(O,F){let Z=!1;O.__webglInit===void 0&&(O.__webglInit=!0,F.addEventListener("dispose",C));let it=F.source,ot=o.get(it);ot===void 0&&(ot={},o.set(it,ot));let ct=D(F);if(ct!==O.__cacheKey){ot[ct]===void 0&&(ot[ct]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,Z=!0),ot[ct].usedTimes++;let ut=ot[O.__cacheKey];ut!==void 0&&(ot[O.__cacheKey].usedTimes--,ut.usedTimes===0&&R(F)),O.__cacheKey=ct,O.__webglTexture=ot[ct].texture}return Z}function $(O,F,Z){return Math.floor(Math.floor(O/Z)/F)}function Q(O,F,Z,it){let ct=O.updateRanges;if(ct.length===0)e.texSubImage2D(n.TEXTURE_2D,0,0,0,F.width,F.height,Z,it,F.data);else{ct.sort((Ct,gt)=>Ct.start-gt.start);let ut=0;for(let Ct=1;Ct<ct.length;Ct++){let gt=ct[ut],dt=ct[Ct],kt=gt.start+gt.count,Wt=$(dt.start,F.width,4),ie=$(gt.start,F.width,4);dt.start<=kt+1&&Wt===ie&&$(dt.start+dt.count-1,F.width,4)===Wt?gt.count=Math.max(gt.count,dt.start+dt.count-gt.start):(++ut,ct[ut]=dt)}ct.length=ut+1;let et=e.getParameter(n.UNPACK_ROW_LENGTH),st=e.getParameter(n.UNPACK_SKIP_PIXELS),wt=e.getParameter(n.UNPACK_SKIP_ROWS);e.pixelStorei(n.UNPACK_ROW_LENGTH,F.width);for(let Ct=0,gt=ct.length;Ct<gt;Ct++){let dt=ct[Ct],kt=Math.floor(dt.start/4),Wt=Math.ceil(dt.count/4),ie=kt%F.width,G=Math.floor(kt/F.width),ft=Wt,nt=1;e.pixelStorei(n.UNPACK_SKIP_PIXELS,ie),e.pixelStorei(n.UNPACK_SKIP_ROWS,G),e.texSubImage2D(n.TEXTURE_2D,0,ie,G,ft,nt,Z,it,F.data)}O.clearUpdateRanges(),e.pixelStorei(n.UNPACK_ROW_LENGTH,et),e.pixelStorei(n.UNPACK_SKIP_PIXELS,st),e.pixelStorei(n.UNPACK_SKIP_ROWS,wt)}}function at(O,F,Z){let it=n.TEXTURE_2D;(F.isDataArrayTexture||F.isCompressedArrayTexture)&&(it=n.TEXTURE_2D_ARRAY),F.isData3DTexture&&(it=n.TEXTURE_3D);let ot=X(O,F),ct=F.source;e.bindTexture(it,O.__webglTexture,n.TEXTURE0+Z);let ut=i.get(ct);if(ct.version!==ut.__version||ot===!0){if(e.activeTexture(n.TEXTURE0+Z),(typeof ImageBitmap<"u"&&F.image instanceof ImageBitmap)===!1){let nt=Zt.getPrimaries(Zt.workingColorSpace),Tt=F.colorSpace===si?null:Zt.getPrimaries(F.colorSpace),xt=F.colorSpace===si||nt===Tt?n.NONE:n.BROWSER_DEFAULT_WEBGL;e.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,F.flipY),e.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),e.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,xt)}e.pixelStorei(n.UNPACK_ALIGNMENT,F.unpackAlignment);let st=c(F.image,!1,s.maxTextureSize);st=mt(F,st);let wt=r.convert(F.format,F.colorSpace),Ct=r.convert(F.type),gt=v(F.internalFormat,wt,Ct,F.normalized,F.colorSpace,F.isVideoTexture);rt(it,F);let dt,kt=F.mipmaps,Wt=F.isVideoTexture!==!0,ie=ut.__version===void 0||ot===!0,G=ct.dataReady,ft=P(F,st);if(F.isDepthTexture)gt=A(F.format===un,F.type),ie&&(Wt?e.texStorage2D(n.TEXTURE_2D,1,gt,st.width,st.height):e.texImage2D(n.TEXTURE_2D,0,gt,st.width,st.height,0,wt,Ct,null));else if(F.isDataTexture)if(kt.length>0){Wt&&ie&&e.texStorage2D(n.TEXTURE_2D,ft,gt,kt[0].width,kt[0].height);for(let nt=0,Tt=kt.length;nt<Tt;nt++)dt=kt[nt],Wt?G&&e.texSubImage2D(n.TEXTURE_2D,nt,0,0,dt.width,dt.height,wt,Ct,dt.data):e.texImage2D(n.TEXTURE_2D,nt,gt,dt.width,dt.height,0,wt,Ct,dt.data);F.generateMipmaps=!1}else Wt?(ie&&e.texStorage2D(n.TEXTURE_2D,ft,gt,st.width,st.height),G&&Q(F,st,wt,Ct)):e.texImage2D(n.TEXTURE_2D,0,gt,st.width,st.height,0,wt,Ct,st.data);else if(F.isCompressedTexture)if(F.isCompressedArrayTexture){Wt&&ie&&e.texStorage3D(n.TEXTURE_2D_ARRAY,ft,gt,kt[0].width,kt[0].height,st.depth);for(let nt=0,Tt=kt.length;nt<Tt;nt++)if(dt=kt[nt],F.format!==ni)if(wt!==null)if(Wt){if(G)if(F.layerUpdates.size>0){let xt=Pl(dt.width,dt.height,F.format,F.type);for(let lt of F.layerUpdates){let Pt=dt.data.subarray(lt*xt/dt.data.BYTES_PER_ELEMENT,(lt+1)*xt/dt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,nt,0,0,lt,dt.width,dt.height,1,wt,Pt)}F.clearLayerUpdates()}else e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,nt,0,0,0,dt.width,dt.height,st.depth,wt,dt.data)}else e.compressedTexImage3D(n.TEXTURE_2D_ARRAY,nt,gt,dt.width,dt.height,st.depth,0,dt.data,0,0);else Ft("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Wt?G&&e.texSubImage3D(n.TEXTURE_2D_ARRAY,nt,0,0,0,dt.width,dt.height,st.depth,wt,Ct,dt.data):e.texImage3D(n.TEXTURE_2D_ARRAY,nt,gt,dt.width,dt.height,st.depth,0,wt,Ct,dt.data)}else{Wt&&ie&&e.texStorage2D(n.TEXTURE_2D,ft,gt,kt[0].width,kt[0].height);for(let nt=0,Tt=kt.length;nt<Tt;nt++)dt=kt[nt],F.format!==ni?wt!==null?Wt?G&&e.compressedTexSubImage2D(n.TEXTURE_2D,nt,0,0,dt.width,dt.height,wt,dt.data):e.compressedTexImage2D(n.TEXTURE_2D,nt,gt,dt.width,dt.height,0,dt.data):Ft("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Wt?G&&e.texSubImage2D(n.TEXTURE_2D,nt,0,0,dt.width,dt.height,wt,Ct,dt.data):e.texImage2D(n.TEXTURE_2D,nt,gt,dt.width,dt.height,0,wt,Ct,dt.data)}else if(F.isDataArrayTexture)if(Wt){if(ie&&e.texStorage3D(n.TEXTURE_2D_ARRAY,ft,gt,st.width,st.height,st.depth),G)if(F.layerUpdates.size>0){let nt=Pl(st.width,st.height,F.format,F.type);for(let Tt of F.layerUpdates){let xt=st.data.subarray(Tt*nt/st.data.BYTES_PER_ELEMENT,(Tt+1)*nt/st.data.BYTES_PER_ELEMENT);e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,Tt,st.width,st.height,1,wt,Ct,xt)}F.clearLayerUpdates()}else e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,st.width,st.height,st.depth,wt,Ct,st.data)}else e.texImage3D(n.TEXTURE_2D_ARRAY,0,gt,st.width,st.height,st.depth,0,wt,Ct,st.data);else if(F.isData3DTexture)Wt?(ie&&e.texStorage3D(n.TEXTURE_3D,ft,gt,st.width,st.height,st.depth),G&&e.texSubImage3D(n.TEXTURE_3D,0,0,0,0,st.width,st.height,st.depth,wt,Ct,st.data)):e.texImage3D(n.TEXTURE_3D,0,gt,st.width,st.height,st.depth,0,wt,Ct,st.data);else if(F.isFramebufferTexture){if(ie)if(Wt)e.texStorage2D(n.TEXTURE_2D,ft,gt,st.width,st.height);else{let nt=st.width,Tt=st.height;for(let xt=0;xt<ft;xt++)e.texImage2D(n.TEXTURE_2D,xt,gt,nt,Tt,0,wt,Ct,null),nt>>=1,Tt>>=1}}else if(F.isHTMLTexture){if("texElementImage2D"in n){let nt=n.canvas;if(nt.hasAttribute("layoutsubtree")||nt.setAttribute("layoutsubtree","true"),st.parentNode!==nt){nt.appendChild(st),y.add(F),nt.onpaint=Ht=>{let ve=Ht.changedElements;for(let oe of y)ve.includes(oe.image)&&(oe.needsUpdate=!0)},nt.requestPaint();return}let Tt=0,xt=n.RGBA,lt=n.RGBA,Pt=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,Tt,xt,lt,Pt,st),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(kt.length>0){if(Wt&&ie){let nt=Qt(kt[0]);e.texStorage2D(n.TEXTURE_2D,ft,gt,nt.width,nt.height)}for(let nt=0,Tt=kt.length;nt<Tt;nt++)dt=kt[nt],Wt?G&&e.texSubImage2D(n.TEXTURE_2D,nt,0,0,wt,Ct,dt):e.texImage2D(n.TEXTURE_2D,nt,gt,wt,Ct,dt);F.generateMipmaps=!1}else if(Wt){if(ie){let nt=Qt(st);e.texStorage2D(n.TEXTURE_2D,ft,gt,nt.width,nt.height)}G&&e.texSubImage2D(n.TEXTURE_2D,0,0,0,wt,Ct,st)}else e.texImage2D(n.TEXTURE_2D,0,gt,wt,Ct,st);f(F)&&E(it),ut.__version=ct.version,F.onUpdate&&F.onUpdate(F)}O.__version=F.version}function pt(O,F,Z){if(F.image.length!==6)return;let it=X(O,F),ot=F.source;e.bindTexture(n.TEXTURE_CUBE_MAP,O.__webglTexture,n.TEXTURE0+Z);let ct=i.get(ot);if(ot.version!==ct.__version||it===!0){e.activeTexture(n.TEXTURE0+Z);let ut=Zt.getPrimaries(Zt.workingColorSpace),et=F.colorSpace===si?null:Zt.getPrimaries(F.colorSpace),st=F.colorSpace===si||ut===et?n.NONE:n.BROWSER_DEFAULT_WEBGL;e.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,F.flipY),e.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),e.pixelStorei(n.UNPACK_ALIGNMENT,F.unpackAlignment),e.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,st);let wt=F.isCompressedTexture||F.image[0].isCompressedTexture,Ct=F.image[0]&&F.image[0].isDataTexture,gt=[];for(let lt=0;lt<6;lt++)!wt&&!Ct?gt[lt]=c(F.image[lt],!0,s.maxCubemapSize):gt[lt]=Ct?F.image[lt].image:F.image[lt],gt[lt]=mt(F,gt[lt]);let dt=gt[0],kt=r.convert(F.format,F.colorSpace),Wt=r.convert(F.type),ie=v(F.internalFormat,kt,Wt,F.normalized,F.colorSpace),G=F.isVideoTexture!==!0,ft=ct.__version===void 0||it===!0,nt=ot.dataReady,Tt=P(F,dt);rt(n.TEXTURE_CUBE_MAP,F);let xt;if(wt){G&&ft&&e.texStorage2D(n.TEXTURE_CUBE_MAP,Tt,ie,dt.width,dt.height);for(let lt=0;lt<6;lt++){xt=gt[lt].mipmaps;for(let Pt=0;Pt<xt.length;Pt++){let Ht=xt[Pt];F.format!==ni?kt!==null?G?nt&&e.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,Pt,0,0,Ht.width,Ht.height,kt,Ht.data):e.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,Pt,ie,Ht.width,Ht.height,0,Ht.data):Ft("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):G?nt&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,Pt,0,0,Ht.width,Ht.height,kt,Wt,Ht.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,Pt,ie,Ht.width,Ht.height,0,kt,Wt,Ht.data)}}}else{if(xt=F.mipmaps,G&&ft){xt.length>0&&Tt++;let lt=Qt(gt[0]);e.texStorage2D(n.TEXTURE_CUBE_MAP,Tt,ie,lt.width,lt.height)}for(let lt=0;lt<6;lt++)if(Ct){G?nt&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0,0,0,gt[lt].width,gt[lt].height,kt,Wt,gt[lt].data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0,ie,gt[lt].width,gt[lt].height,0,kt,Wt,gt[lt].data);for(let Pt=0;Pt<xt.length;Pt++){let ve=xt[Pt].image[lt].image;G?nt&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,Pt+1,0,0,ve.width,ve.height,kt,Wt,ve.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,Pt+1,ie,ve.width,ve.height,0,kt,Wt,ve.data)}}else{G?nt&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0,0,0,kt,Wt,gt[lt]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0,ie,kt,Wt,gt[lt]);for(let Pt=0;Pt<xt.length;Pt++){let Ht=xt[Pt];G?nt&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,Pt+1,0,0,kt,Wt,Ht.image[lt]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,Pt+1,ie,kt,Wt,Ht.image[lt])}}}f(F)&&E(n.TEXTURE_CUBE_MAP),ct.__version=ot.version,F.onUpdate&&F.onUpdate(F)}O.__version=F.version}function tt(O,F,Z,it,ot,ct){let ut=r.convert(Z.format,Z.colorSpace),et=r.convert(Z.type),st=v(Z.internalFormat,ut,et,Z.normalized,Z.colorSpace),wt=i.get(F),Ct=i.get(Z);if(Ct.__renderTarget=F,!wt.__hasExternalTextures){let gt=Math.max(1,F.width>>ct),dt=Math.max(1,F.height>>ct);ot===n.TEXTURE_3D||ot===n.TEXTURE_2D_ARRAY?e.texImage3D(ot,ct,st,gt,dt,F.depth,0,ut,et,null):e.texImage2D(ot,ct,st,gt,dt,0,ut,et,null)}e.bindFramebuffer(n.FRAMEBUFFER,O),Bt(F)?u.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,it,ot,Ct.__webglTexture,0,Vt(F)):(ot===n.TEXTURE_2D||ot>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&ot<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,it,ot,Ct.__webglTexture,ct),e.bindFramebuffer(n.FRAMEBUFFER,null)}function yt(O,F,Z){if(n.bindRenderbuffer(n.RENDERBUFFER,O),F.depthBuffer){let it=F.depthTexture,ot=it&&it.isDepthTexture?it.type:null,ct=A(F.stencilBuffer,ot),ut=F.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;Bt(F)?u.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Vt(F),ct,F.width,F.height):Z?n.renderbufferStorageMultisample(n.RENDERBUFFER,Vt(F),ct,F.width,F.height):n.renderbufferStorage(n.RENDERBUFFER,ct,F.width,F.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,ut,n.RENDERBUFFER,O)}else{let it=F.textures;for(let ot=0;ot<it.length;ot++){let ct=it[ot],ut=r.convert(ct.format,ct.colorSpace),et=r.convert(ct.type),st=v(ct.internalFormat,ut,et,ct.normalized,ct.colorSpace);Bt(F)?u.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Vt(F),st,F.width,F.height):Z?n.renderbufferStorageMultisample(n.RENDERBUFFER,Vt(F),st,F.width,F.height):n.renderbufferStorage(n.RENDERBUFFER,st,F.width,F.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Et(O,F,Z){let it=F.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(n.FRAMEBUFFER,O),!(F.depthTexture&&F.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let ot=i.get(F.depthTexture);if(ot.__renderTarget=F,(!ot.__webglTexture||F.depthTexture.image.width!==F.width||F.depthTexture.image.height!==F.height)&&(F.depthTexture.image.width=F.width,F.depthTexture.image.height=F.height,F.depthTexture.needsUpdate=!0),it){if(ot.__webglInit===void 0&&(ot.__webglInit=!0,F.depthTexture.addEventListener("dispose",C)),ot.__webglTexture===void 0){ot.__webglTexture=n.createTexture(),e.bindTexture(n.TEXTURE_CUBE_MAP,ot.__webglTexture),rt(n.TEXTURE_CUBE_MAP,F.depthTexture);let wt=r.convert(F.depthTexture.format),Ct=r.convert(F.depthTexture.type),gt;F.depthTexture.format===Mi?gt=n.DEPTH_COMPONENT24:F.depthTexture.format===un&&(gt=n.DEPTH24_STENCIL8);for(let dt=0;dt<6;dt++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+dt,0,gt,F.width,F.height,0,wt,Ct,null)}}else U(F.depthTexture,0);let ct=ot.__webglTexture,ut=Vt(F),et=it?n.TEXTURE_CUBE_MAP_POSITIVE_X+Z:n.TEXTURE_2D,st=F.depthTexture.format===un?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(F.depthTexture.format===Mi)Bt(F)?u.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,st,et,ct,0,ut):n.framebufferTexture2D(n.FRAMEBUFFER,st,et,ct,0);else if(F.depthTexture.format===un)Bt(F)?u.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,st,et,ct,0,ut):n.framebufferTexture2D(n.FRAMEBUFFER,st,et,ct,0);else throw new Error("Unknown depthTexture format")}function bt(O){let F=i.get(O),Z=O.isWebGLCubeRenderTarget===!0;if(F.__boundDepthTexture!==O.depthTexture){let it=O.depthTexture;if(F.__depthDisposeCallback&&F.__depthDisposeCallback(),it){let ot=()=>{delete F.__boundDepthTexture,delete F.__depthDisposeCallback,it.removeEventListener("dispose",ot)};it.addEventListener("dispose",ot),F.__depthDisposeCallback=ot}F.__boundDepthTexture=it}if(O.depthTexture&&!F.__autoAllocateDepthBuffer)if(Z)for(let it=0;it<6;it++)Et(F.__webglFramebuffer[it],O,it);else{let it=O.texture.mipmaps;it&&it.length>0?Et(F.__webglFramebuffer[0],O,0):Et(F.__webglFramebuffer,O,0)}else if(Z){F.__webglDepthbuffer=[];for(let it=0;it<6;it++)if(e.bindFramebuffer(n.FRAMEBUFFER,F.__webglFramebuffer[it]),F.__webglDepthbuffer[it]===void 0)F.__webglDepthbuffer[it]=n.createRenderbuffer(),yt(F.__webglDepthbuffer[it],O,!1);else{let ot=O.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ct=F.__webglDepthbuffer[it];n.bindRenderbuffer(n.RENDERBUFFER,ct),n.framebufferRenderbuffer(n.FRAMEBUFFER,ot,n.RENDERBUFFER,ct)}}else{let it=O.texture.mipmaps;if(it&&it.length>0?e.bindFramebuffer(n.FRAMEBUFFER,F.__webglFramebuffer[0]):e.bindFramebuffer(n.FRAMEBUFFER,F.__webglFramebuffer),F.__webglDepthbuffer===void 0)F.__webglDepthbuffer=n.createRenderbuffer(),yt(F.__webglDepthbuffer,O,!1);else{let ot=O.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ct=F.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,ct),n.framebufferRenderbuffer(n.FRAMEBUFFER,ot,n.RENDERBUFFER,ct)}}e.bindFramebuffer(n.FRAMEBUFFER,null)}function Ot(O,F,Z){let it=i.get(O);F!==void 0&&tt(it.__webglFramebuffer,O,O.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),Z!==void 0&&bt(O)}function St(O){let F=O.texture,Z=i.get(O),it=i.get(F);O.addEventListener("dispose",d);let ot=O.textures,ct=O.isWebGLCubeRenderTarget===!0,ut=ot.length>1;if(ut||(it.__webglTexture===void 0&&(it.__webglTexture=n.createTexture()),it.__version=F.version,a.memory.textures++),ct){Z.__webglFramebuffer=[];for(let et=0;et<6;et++)if(F.mipmaps&&F.mipmaps.length>0){Z.__webglFramebuffer[et]=[];for(let st=0;st<F.mipmaps.length;st++)Z.__webglFramebuffer[et][st]=n.createFramebuffer()}else Z.__webglFramebuffer[et]=n.createFramebuffer()}else{if(F.mipmaps&&F.mipmaps.length>0){Z.__webglFramebuffer=[];for(let et=0;et<F.mipmaps.length;et++)Z.__webglFramebuffer[et]=n.createFramebuffer()}else Z.__webglFramebuffer=n.createFramebuffer();if(ut)for(let et=0,st=ot.length;et<st;et++){let wt=i.get(ot[et]);wt.__webglTexture===void 0&&(wt.__webglTexture=n.createTexture(),a.memory.textures++)}if(O.samples>0&&Bt(O)===!1){Z.__webglMultisampledFramebuffer=n.createFramebuffer(),Z.__webglColorRenderbuffer=[],e.bindFramebuffer(n.FRAMEBUFFER,Z.__webglMultisampledFramebuffer);for(let et=0;et<ot.length;et++){let st=ot[et];Z.__webglColorRenderbuffer[et]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,Z.__webglColorRenderbuffer[et]);let wt=r.convert(st.format,st.colorSpace),Ct=r.convert(st.type),gt=v(st.internalFormat,wt,Ct,st.normalized,st.colorSpace,O.isXRRenderTarget===!0),dt=Vt(O);n.renderbufferStorageMultisample(n.RENDERBUFFER,dt,gt,O.width,O.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+et,n.RENDERBUFFER,Z.__webglColorRenderbuffer[et])}n.bindRenderbuffer(n.RENDERBUFFER,null),O.depthBuffer&&(Z.__webglDepthRenderbuffer=n.createRenderbuffer(),yt(Z.__webglDepthRenderbuffer,O,!0)),e.bindFramebuffer(n.FRAMEBUFFER,null)}}if(ct){e.bindTexture(n.TEXTURE_CUBE_MAP,it.__webglTexture),rt(n.TEXTURE_CUBE_MAP,F);for(let et=0;et<6;et++)if(F.mipmaps&&F.mipmaps.length>0)for(let st=0;st<F.mipmaps.length;st++)tt(Z.__webglFramebuffer[et][st],O,F,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+et,st);else tt(Z.__webglFramebuffer[et],O,F,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+et,0);f(F)&&E(n.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(ut){for(let et=0,st=ot.length;et<st;et++){let wt=ot[et],Ct=i.get(wt),gt=n.TEXTURE_2D;(O.isWebGL3DRenderTarget||O.isWebGLArrayRenderTarget)&&(gt=O.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),e.bindTexture(gt,Ct.__webglTexture),rt(gt,wt),tt(Z.__webglFramebuffer,O,wt,n.COLOR_ATTACHMENT0+et,gt,0),f(wt)&&E(gt)}e.unbindTexture()}else{let et=n.TEXTURE_2D;if((O.isWebGL3DRenderTarget||O.isWebGLArrayRenderTarget)&&(et=O.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),e.bindTexture(et,it.__webglTexture),rt(et,F),F.mipmaps&&F.mipmaps.length>0)for(let st=0;st<F.mipmaps.length;st++)tt(Z.__webglFramebuffer[st],O,F,n.COLOR_ATTACHMENT0,et,st);else tt(Z.__webglFramebuffer,O,F,n.COLOR_ATTACHMENT0,et,0);f(F)&&E(et),e.unbindTexture()}O.depthBuffer&&bt(O)}function Yt(O){let F=O.textures;for(let Z=0,it=F.length;Z<it;Z++){let ot=F[Z];if(f(ot)){let ct=_(O),ut=i.get(ot).__webglTexture;e.bindTexture(ct,ut),E(ct),e.unbindTexture()}}}let Ut=[],$t=[];function V(O){if(O.samples>0){if(Bt(O)===!1){let F=O.textures,Z=O.width,it=O.height,ot=n.COLOR_BUFFER_BIT,ct=O.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ut=i.get(O),et=F.length>1;if(et)for(let wt=0;wt<F.length;wt++)e.bindFramebuffer(n.FRAMEBUFFER,ut.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+wt,n.RENDERBUFFER,null),e.bindFramebuffer(n.FRAMEBUFFER,ut.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+wt,n.TEXTURE_2D,null,0);e.bindFramebuffer(n.READ_FRAMEBUFFER,ut.__webglMultisampledFramebuffer);let st=O.texture.mipmaps;st&&st.length>0?e.bindFramebuffer(n.DRAW_FRAMEBUFFER,ut.__webglFramebuffer[0]):e.bindFramebuffer(n.DRAW_FRAMEBUFFER,ut.__webglFramebuffer);for(let wt=0;wt<F.length;wt++){if(O.resolveDepthBuffer&&(O.depthBuffer&&(ot|=n.DEPTH_BUFFER_BIT),O.stencilBuffer&&O.resolveStencilBuffer&&(ot|=n.STENCIL_BUFFER_BIT)),et){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,ut.__webglColorRenderbuffer[wt]);let Ct=i.get(F[wt]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Ct,0)}n.blitFramebuffer(0,0,Z,it,0,0,Z,it,ot,n.NEAREST),m===!0&&(Ut.length=0,$t.length=0,Ut.push(n.COLOR_ATTACHMENT0+wt),O.depthBuffer&&O.resolveDepthBuffer===!1&&(Ut.push(ct),$t.push(ct),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,$t)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Ut))}if(e.bindFramebuffer(n.READ_FRAMEBUFFER,null),e.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),et)for(let wt=0;wt<F.length;wt++){e.bindFramebuffer(n.FRAMEBUFFER,ut.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+wt,n.RENDERBUFFER,ut.__webglColorRenderbuffer[wt]);let Ct=i.get(F[wt]).__webglTexture;e.bindFramebuffer(n.FRAMEBUFFER,ut.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+wt,n.TEXTURE_2D,Ct,0)}e.bindFramebuffer(n.DRAW_FRAMEBUFFER,ut.__webglMultisampledFramebuffer)}else if(O.depthBuffer&&O.resolveDepthBuffer===!1&&m){let F=O.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[F])}}}function Vt(O){return Math.min(s.maxSamples,O.samples)}function Bt(O){let F=i.get(O);return O.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&F.__useRenderToTexture!==!1}function Jt(O){let F=a.render.frame;M.get(O)!==F&&(M.set(O,F),O.update())}function mt(O,F){let Z=O.colorSpace,it=O.format,ot=O.type;return O.isCompressedTexture===!0||O.isVideoTexture===!0||Z!==wn&&Z!==si&&(Zt.getTransfer(Z)===re?(it!==ni||ot!==Ke)&&Ft("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Nt("WebGLTextures: Unsupported texture color space:",Z)),F}function Qt(O){return typeof HTMLImageElement<"u"&&O instanceof HTMLImageElement?(x.width=O.naturalWidth||O.width,x.height=O.naturalHeight||O.height):typeof VideoFrame<"u"&&O instanceof VideoFrame?(x.width=O.displayWidth,x.height=O.displayHeight):(x.width=O.width,x.height=O.height),x}this.allocateTextureUnit=I,this.resetTextureUnits=w,this.getTextureUnits=T,this.setTextureUnits=S,this.setTexture2D=U,this.setTexture2DArray=B,this.setTexture3D=z,this.setTextureCube=k,this.rebindTextures=Ot,this.setupRenderTarget=St,this.updateRenderTargetMipmap=Yt,this.updateMultisampleRenderTarget=V,this.setupDepthRenderbuffer=bt,this.setupFrameBufferTexture=tt,this.useMultisampledRTT=Bt,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function ug(n,t){function e(i,s=si){let r,a=Zt.getTransfer(s);if(i===Ke)return n.UNSIGNED_BYTE;if(i===_a)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Ma)return n.UNSIGNED_SHORT_5_5_5_1;if(i===bl)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===Sl)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===_l)return n.BYTE;if(i===Ml)return n.SHORT;if(i===us)return n.UNSIGNED_SHORT;if(i===va)return n.INT;if(i===pi)return n.UNSIGNED_INT;if(i===ii)return n.FLOAT;if(i===Ci)return n.HALF_FLOAT;if(i===wl)return n.ALPHA;if(i===El)return n.RGB;if(i===ni)return n.RGBA;if(i===Mi)return n.DEPTH_COMPONENT;if(i===un)return n.DEPTH_STENCIL;if(i===ba)return n.RED;if(i===Sa)return n.RED_INTEGER;if(i===dn)return n.RG;if(i===wa)return n.RG_INTEGER;if(i===Ea)return n.RGBA_INTEGER;if(i===qs||i===Ys||i===Zs||i===Js)if(a===re)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===qs)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Ys)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Zs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Js)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===qs)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Ys)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Zs)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Js)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Ta||i===Aa||i===Ca||i===Ra)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Ta)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Aa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Ca)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Ra)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ia||i===Pa||i===La||i===Da||i===Fa||i===js||i===Na)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Ia||i===Pa)return a===re?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===La)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Da)return r.COMPRESSED_R11_EAC;if(i===Fa)return r.COMPRESSED_SIGNED_R11_EAC;if(i===js)return r.COMPRESSED_RG11_EAC;if(i===Na)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Ua||i===Oa||i===Ba||i===ka||i===za||i===Va||i===Ha||i===Ga||i===Wa||i===Xa||i===qa||i===Ya||i===Za||i===Ja)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Ua)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Oa)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Ba)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===ka)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===za)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Va)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Ha)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Ga)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Wa)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Xa)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===qa)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Ya)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Za)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Ja)return a===re?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===ja||i===Ka||i===$a)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===ja)return a===re?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Ka)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===$a)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Qa||i===to||i===Ks||i===eo)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===Qa)return r.COMPRESSED_RED_RGTC1_EXT;if(i===to)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Ks)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===eo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ds?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:e}}var dg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,fg=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Xl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let i=new Os(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,i=new ze({vertexShader:dg,fragmentShader:fg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new ae(new rn(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ql=class extends bi{constructor(t,e){super();let i=this,s=null,r=1,a=null,u="local-floor",m=1,x=null,M=null,y=null,h=null,o=null,l=null,p=typeof XRWebGLBinding<"u",c=new Xl,f={},E=e.getContextAttributes(),_=null,v=null,A=[],P=[],C=new ne,d=null,b=new Re;b.viewport=new ye;let R=new Re;R.viewport=new ye;let L=[b,R],g=new fa,w=null,T=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let $=A[X];return $===void 0&&($=new as,A[X]=$),$.getTargetRaySpace()},this.getControllerGrip=function(X){let $=A[X];return $===void 0&&($=new as,A[X]=$),$.getGripSpace()},this.getHand=function(X){let $=A[X];return $===void 0&&($=new as,A[X]=$),$.getHandSpace()};function S(X){let $=P.indexOf(X.inputSource);if($===-1)return;let Q=A[$];Q!==void 0&&(Q.update(X.inputSource,X.frame,x||a),Q.dispatchEvent({type:X.type,data:X.inputSource}))}function I(){s.removeEventListener("select",S),s.removeEventListener("selectstart",S),s.removeEventListener("selectend",S),s.removeEventListener("squeeze",S),s.removeEventListener("squeezestart",S),s.removeEventListener("squeezeend",S),s.removeEventListener("end",I),s.removeEventListener("inputsourceschange",D);for(let X=0;X<A.length;X++){let $=P[X];$!==null&&(P[X]=null,A[X].disconnect($))}w=null,T=null,c.reset();for(let X in f)delete f[X];t.setRenderTarget(_),o=null,h=null,y=null,s=null,v=null,rt.stop(),i.isPresenting=!1,t.setPixelRatio(d),t.setSize(C.width,C.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){r=X,i.isPresenting===!0&&Ft("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){u=X,i.isPresenting===!0&&Ft("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return x||a},this.setReferenceSpace=function(X){x=X},this.getBaseLayer=function(){return h!==null?h:o},this.getBinding=function(){return y===null&&p&&(y=new XRWebGLBinding(s,e)),y},this.getFrame=function(){return l},this.getSession=function(){return s},this.setSession=async function(X){if(s=X,s!==null){if(_=t.getRenderTarget(),s.addEventListener("select",S),s.addEventListener("selectstart",S),s.addEventListener("selectend",S),s.addEventListener("squeeze",S),s.addEventListener("squeezestart",S),s.addEventListener("squeezeend",S),s.addEventListener("end",I),s.addEventListener("inputsourceschange",D),E.xrCompatible!==!0&&await e.makeXRCompatible(),d=t.getPixelRatio(),t.getSize(C),p&&"createProjectionLayer"in XRWebGLBinding.prototype){let Q=null,at=null,pt=null;E.depth&&(pt=E.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,Q=E.stencil?un:Mi,at=E.stencil?ds:pi);let tt={colorFormat:e.RGBA8,depthFormat:pt,scaleFactor:r};y=this.getBinding(),h=y.createProjectionLayer(tt),s.updateRenderState({layers:[h]}),t.setPixelRatio(1),t.setSize(h.textureWidth,h.textureHeight,!1),v=new ke(h.textureWidth,h.textureHeight,{format:ni,type:Ke,depthTexture:new zi(h.textureWidth,h.textureHeight,at,void 0,void 0,void 0,void 0,void 0,void 0,Q),stencilBuffer:E.stencil,colorSpace:t.outputColorSpace,samples:E.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}else{let Q={antialias:E.antialias,alpha:!0,depth:E.depth,stencil:E.stencil,framebufferScaleFactor:r};o=new XRWebGLLayer(s,e,Q),s.updateRenderState({baseLayer:o}),t.setPixelRatio(1),t.setSize(o.framebufferWidth,o.framebufferHeight,!1),v=new ke(o.framebufferWidth,o.framebufferHeight,{format:ni,type:Ke,colorSpace:t.outputColorSpace,stencilBuffer:E.stencil,resolveDepthBuffer:o.ignoreDepthValues===!1,resolveStencilBuffer:o.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(m),x=null,a=await s.requestReferenceSpace(u),rt.setContext(s),rt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return c.getDepthTexture()};function D(X){for(let $=0;$<X.removed.length;$++){let Q=X.removed[$],at=P.indexOf(Q);at>=0&&(P[at]=null,A[at].disconnect(Q))}for(let $=0;$<X.added.length;$++){let Q=X.added[$],at=P.indexOf(Q);if(at===-1){for(let tt=0;tt<A.length;tt++)if(tt>=P.length){P.push(Q),at=tt;break}else if(P[tt]===null){P[tt]=Q,at=tt;break}if(at===-1)break}let pt=A[at];pt&&pt.connect(Q)}}let U=new W,B=new W;function z(X,$,Q){U.setFromMatrixPosition($.matrixWorld),B.setFromMatrixPosition(Q.matrixWorld);let at=U.distanceTo(B),pt=$.projectionMatrix.elements,tt=Q.projectionMatrix.elements,yt=pt[14]/(pt[10]-1),Et=pt[14]/(pt[10]+1),bt=(pt[9]+1)/pt[5],Ot=(pt[9]-1)/pt[5],St=(pt[8]-1)/pt[0],Yt=(tt[8]+1)/tt[0],Ut=yt*St,$t=yt*Yt,V=at/(-St+Yt),Vt=V*-St;if($.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(Vt),X.translateZ(V),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert(),pt[10]===-1)X.projectionMatrix.copy($.projectionMatrix),X.projectionMatrixInverse.copy($.projectionMatrixInverse);else{let Bt=yt+V,Jt=Et+V,mt=Ut-Vt,Qt=$t+(at-Vt),O=bt*Et/Jt*Bt,F=Ot*Et/Jt*Bt;X.projectionMatrix.makePerspective(mt,Qt,O,F,Bt,Jt),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}}function k(X,$){$===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices($.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(s===null)return;let $=X.near,Q=X.far;c.texture!==null&&(c.depthNear>0&&($=c.depthNear),c.depthFar>0&&(Q=c.depthFar)),g.near=R.near=b.near=$,g.far=R.far=b.far=Q,(w!==g.near||T!==g.far)&&(s.updateRenderState({depthNear:g.near,depthFar:g.far}),w=g.near,T=g.far),g.layers.mask=X.layers.mask|6,b.layers.mask=g.layers.mask&-5,R.layers.mask=g.layers.mask&-3;let at=X.parent,pt=g.cameras;k(g,at);for(let tt=0;tt<pt.length;tt++)k(pt[tt],at);pt.length===2?z(g,b,R):g.projectionMatrix.copy(b.projectionMatrix),H(X,g,at)};function H(X,$,Q){Q===null?X.matrix.copy($.matrixWorld):(X.matrix.copy(Q.matrixWorld),X.matrix.invert(),X.matrix.multiply($.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy($.projectionMatrix),X.projectionMatrixInverse.copy($.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=qr*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return g},this.getFoveation=function(){if(!(h===null&&o===null))return m},this.setFoveation=function(X){m=X,h!==null&&(h.fixedFoveation=X),o!==null&&o.fixedFoveation!==void 0&&(o.fixedFoveation=X)},this.hasDepthSensing=function(){return c.texture!==null},this.getDepthSensingMesh=function(){return c.getMesh(g)},this.getCameraTexture=function(X){return f[X]};let Y=null;function ht(X,$){if(M=$.getViewerPose(x||a),l=$,M!==null){let Q=M.views;o!==null&&(t.setRenderTargetFramebuffer(v,o.framebuffer),t.setRenderTarget(v));let at=!1;Q.length!==g.cameras.length&&(g.cameras.length=0,at=!0);for(let Et=0;Et<Q.length;Et++){let bt=Q[Et],Ot=null;if(o!==null)Ot=o.getViewport(bt);else{let Yt=y.getViewSubImage(h,bt);Ot=Yt.viewport,Et===0&&(t.setRenderTargetTextures(v,Yt.colorTexture,Yt.depthStencilTexture),t.setRenderTarget(v))}let St=L[Et];St===void 0&&(St=new Re,St.layers.enable(Et),St.viewport=new ye,L[Et]=St),St.matrix.fromArray(bt.transform.matrix),St.matrix.decompose(St.position,St.quaternion,St.scale),St.projectionMatrix.fromArray(bt.projectionMatrix),St.projectionMatrixInverse.copy(St.projectionMatrix).invert(),St.viewport.set(Ot.x,Ot.y,Ot.width,Ot.height),Et===0&&(g.matrix.copy(St.matrix),g.matrix.decompose(g.position,g.quaternion,g.scale)),at===!0&&g.cameras.push(St)}let pt=s.enabledFeatures;if(pt&&pt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&p){y=i.getBinding();let Et=y.getDepthInformation(Q[0]);Et&&Et.isValid&&Et.texture&&c.init(Et,s.renderState)}if(pt&&pt.includes("camera-access")&&p){t.state.unbindTexture(),y=i.getBinding();for(let Et=0;Et<Q.length;Et++){let bt=Q[Et].camera;if(bt){let Ot=f[bt];Ot||(Ot=new Os,f[bt]=Ot);let St=y.getCameraImage(bt);Ot.sourceTexture=St}}}}for(let Q=0;Q<A.length;Q++){let at=P[Q],pt=A[Q];at!==null&&pt!==void 0&&pt.update(at,$,x||a)}Y&&Y(X,$),$.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:$}),l=null}let rt=new Jh;rt.setAnimationLoop(ht),this.setAnimationLoop=function(X){Y=X},this.dispose=function(){}}},pg=new se,eu=new zt;eu.set(-1,0,0,0,1,0,0,0,1);function mg(n,t){function e(c,f){c.matrixAutoUpdate===!0&&c.updateMatrix(),f.value.copy(c.matrix)}function i(c,f){f.color.getRGB(c.fogColor.value,Cl(n)),f.isFog?(c.fogNear.value=f.near,c.fogFar.value=f.far):f.isFogExp2&&(c.fogDensity.value=f.density)}function s(c,f,E,_,v){f.isNodeMaterial?f.uniformsNeedUpdate=!1:f.isMeshBasicMaterial?r(c,f):f.isMeshLambertMaterial?(r(c,f),f.envMap&&(c.envMapIntensity.value=f.envMapIntensity)):f.isMeshToonMaterial?(r(c,f),y(c,f)):f.isMeshPhongMaterial?(r(c,f),M(c,f),f.envMap&&(c.envMapIntensity.value=f.envMapIntensity)):f.isMeshStandardMaterial?(r(c,f),h(c,f),f.isMeshPhysicalMaterial&&o(c,f,v)):f.isMeshMatcapMaterial?(r(c,f),l(c,f)):f.isMeshDepthMaterial?r(c,f):f.isMeshDistanceMaterial?(r(c,f),p(c,f)):f.isMeshNormalMaterial?r(c,f):f.isLineBasicMaterial?(a(c,f),f.isLineDashedMaterial&&u(c,f)):f.isPointsMaterial?m(c,f,E,_):f.isSpriteMaterial?x(c,f):f.isShadowMaterial?(c.color.value.copy(f.color),c.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(c,f){c.opacity.value=f.opacity,f.color&&c.diffuse.value.copy(f.color),f.emissive&&c.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(c.map.value=f.map,e(f.map,c.mapTransform)),f.alphaMap&&(c.alphaMap.value=f.alphaMap,e(f.alphaMap,c.alphaMapTransform)),f.bumpMap&&(c.bumpMap.value=f.bumpMap,e(f.bumpMap,c.bumpMapTransform),c.bumpScale.value=f.bumpScale,f.side===Ve&&(c.bumpScale.value*=-1)),f.normalMap&&(c.normalMap.value=f.normalMap,e(f.normalMap,c.normalMapTransform),c.normalScale.value.copy(f.normalScale),f.side===Ve&&c.normalScale.value.negate()),f.displacementMap&&(c.displacementMap.value=f.displacementMap,e(f.displacementMap,c.displacementMapTransform),c.displacementScale.value=f.displacementScale,c.displacementBias.value=f.displacementBias),f.emissiveMap&&(c.emissiveMap.value=f.emissiveMap,e(f.emissiveMap,c.emissiveMapTransform)),f.specularMap&&(c.specularMap.value=f.specularMap,e(f.specularMap,c.specularMapTransform)),f.alphaTest>0&&(c.alphaTest.value=f.alphaTest);let E=t.get(f),_=E.envMap,v=E.envMapRotation;_&&(c.envMap.value=_,c.envMapRotation.value.setFromMatrix4(pg.makeRotationFromEuler(v)).transpose(),_.isCubeTexture&&_.isRenderTargetTexture===!1&&c.envMapRotation.value.premultiply(eu),c.reflectivity.value=f.reflectivity,c.ior.value=f.ior,c.refractionRatio.value=f.refractionRatio),f.lightMap&&(c.lightMap.value=f.lightMap,c.lightMapIntensity.value=f.lightMapIntensity,e(f.lightMap,c.lightMapTransform)),f.aoMap&&(c.aoMap.value=f.aoMap,c.aoMapIntensity.value=f.aoMapIntensity,e(f.aoMap,c.aoMapTransform))}function a(c,f){c.diffuse.value.copy(f.color),c.opacity.value=f.opacity,f.map&&(c.map.value=f.map,e(f.map,c.mapTransform))}function u(c,f){c.dashSize.value=f.dashSize,c.totalSize.value=f.dashSize+f.gapSize,c.scale.value=f.scale}function m(c,f,E,_){c.diffuse.value.copy(f.color),c.opacity.value=f.opacity,c.size.value=f.size*E,c.scale.value=_*.5,f.map&&(c.map.value=f.map,e(f.map,c.uvTransform)),f.alphaMap&&(c.alphaMap.value=f.alphaMap,e(f.alphaMap,c.alphaMapTransform)),f.alphaTest>0&&(c.alphaTest.value=f.alphaTest)}function x(c,f){c.diffuse.value.copy(f.color),c.opacity.value=f.opacity,c.rotation.value=f.rotation,f.map&&(c.map.value=f.map,e(f.map,c.mapTransform)),f.alphaMap&&(c.alphaMap.value=f.alphaMap,e(f.alphaMap,c.alphaMapTransform)),f.alphaTest>0&&(c.alphaTest.value=f.alphaTest)}function M(c,f){c.specular.value.copy(f.specular),c.shininess.value=Math.max(f.shininess,1e-4)}function y(c,f){f.gradientMap&&(c.gradientMap.value=f.gradientMap)}function h(c,f){c.metalness.value=f.metalness,f.metalnessMap&&(c.metalnessMap.value=f.metalnessMap,e(f.metalnessMap,c.metalnessMapTransform)),c.roughness.value=f.roughness,f.roughnessMap&&(c.roughnessMap.value=f.roughnessMap,e(f.roughnessMap,c.roughnessMapTransform)),f.envMap&&(c.envMapIntensity.value=f.envMapIntensity)}function o(c,f,E){c.ior.value=f.ior,f.sheen>0&&(c.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),c.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(c.sheenColorMap.value=f.sheenColorMap,e(f.sheenColorMap,c.sheenColorMapTransform)),f.sheenRoughnessMap&&(c.sheenRoughnessMap.value=f.sheenRoughnessMap,e(f.sheenRoughnessMap,c.sheenRoughnessMapTransform))),f.clearcoat>0&&(c.clearcoat.value=f.clearcoat,c.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(c.clearcoatMap.value=f.clearcoatMap,e(f.clearcoatMap,c.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(c.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,e(f.clearcoatRoughnessMap,c.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(c.clearcoatNormalMap.value=f.clearcoatNormalMap,e(f.clearcoatNormalMap,c.clearcoatNormalMapTransform),c.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Ve&&c.clearcoatNormalScale.value.negate())),f.dispersion>0&&(c.dispersion.value=f.dispersion),f.iridescence>0&&(c.iridescence.value=f.iridescence,c.iridescenceIOR.value=f.iridescenceIOR,c.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],c.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(c.iridescenceMap.value=f.iridescenceMap,e(f.iridescenceMap,c.iridescenceMapTransform)),f.iridescenceThicknessMap&&(c.iridescenceThicknessMap.value=f.iridescenceThicknessMap,e(f.iridescenceThicknessMap,c.iridescenceThicknessMapTransform))),f.transmission>0&&(c.transmission.value=f.transmission,c.transmissionSamplerMap.value=E.texture,c.transmissionSamplerSize.value.set(E.width,E.height),f.transmissionMap&&(c.transmissionMap.value=f.transmissionMap,e(f.transmissionMap,c.transmissionMapTransform)),c.thickness.value=f.thickness,f.thicknessMap&&(c.thicknessMap.value=f.thicknessMap,e(f.thicknessMap,c.thicknessMapTransform)),c.attenuationDistance.value=f.attenuationDistance,c.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(c.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(c.anisotropyMap.value=f.anisotropyMap,e(f.anisotropyMap,c.anisotropyMapTransform))),c.specularIntensity.value=f.specularIntensity,c.specularColor.value.copy(f.specularColor),f.specularColorMap&&(c.specularColorMap.value=f.specularColorMap,e(f.specularColorMap,c.specularColorMapTransform)),f.specularIntensityMap&&(c.specularIntensityMap.value=f.specularIntensityMap,e(f.specularIntensityMap,c.specularIntensityMapTransform))}function l(c,f){f.matcap&&(c.matcap.value=f.matcap)}function p(c,f){let E=t.get(f).light;c.referencePosition.value.setFromMatrixPosition(E.matrixWorld),c.nearDistance.value=E.shadow.camera.near,c.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function gg(n,t,e,i){let s={},r={},a=[],u=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function m(E,_){let v=_.program;i.uniformBlockBinding(E,v)}function x(E,_){let v=s[E.id];v===void 0&&(l(E),v=M(E),s[E.id]=v,E.addEventListener("dispose",c));let A=_.program;i.updateUBOMapping(E,A);let P=t.render.frame;r[E.id]!==P&&(h(E),r[E.id]=P)}function M(E){let _=y();E.__bindingPointIndex=_;let v=n.createBuffer(),A=E.__size,P=E.usage;return n.bindBuffer(n.UNIFORM_BUFFER,v),n.bufferData(n.UNIFORM_BUFFER,A,P),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,_,v),v}function y(){for(let E=0;E<u;E++)if(a.indexOf(E)===-1)return a.push(E),E;return Nt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(E){let _=s[E.id],v=E.uniforms,A=E.__cache;n.bindBuffer(n.UNIFORM_BUFFER,_);for(let P=0,C=v.length;P<C;P++){let d=Array.isArray(v[P])?v[P]:[v[P]];for(let b=0,R=d.length;b<R;b++){let L=d[b];if(o(L,P,b,A)===!0){let g=L.__offset,w=Array.isArray(L.value)?L.value:[L.value],T=0;for(let S=0;S<w.length;S++){let I=w[S],D=p(I);typeof I=="number"||typeof I=="boolean"?(L.__data[0]=I,n.bufferSubData(n.UNIFORM_BUFFER,g+T,L.__data)):I.isMatrix3?(L.__data[0]=I.elements[0],L.__data[1]=I.elements[1],L.__data[2]=I.elements[2],L.__data[3]=0,L.__data[4]=I.elements[3],L.__data[5]=I.elements[4],L.__data[6]=I.elements[5],L.__data[7]=0,L.__data[8]=I.elements[6],L.__data[9]=I.elements[7],L.__data[10]=I.elements[8],L.__data[11]=0):ArrayBuffer.isView(I)?L.__data.set(new I.constructor(I.buffer,I.byteOffset,L.__data.length)):(I.toArray(L.__data,T),T+=D.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,g,L.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function o(E,_,v,A){let P=E.value,C=_+"_"+v;if(A[C]===void 0)return typeof P=="number"||typeof P=="boolean"?A[C]=P:ArrayBuffer.isView(P)?A[C]=P.slice():A[C]=P.clone(),!0;{let d=A[C];if(typeof P=="number"||typeof P=="boolean"){if(d!==P)return A[C]=P,!0}else{if(ArrayBuffer.isView(P))return!0;if(d.equals(P)===!1)return d.copy(P),!0}}return!1}function l(E){let _=E.uniforms,v=0,A=16;for(let C=0,d=_.length;C<d;C++){let b=Array.isArray(_[C])?_[C]:[_[C]];for(let R=0,L=b.length;R<L;R++){let g=b[R],w=Array.isArray(g.value)?g.value:[g.value];for(let T=0,S=w.length;T<S;T++){let I=w[T],D=p(I),U=v%A,B=U%D.boundary,z=U+B;v+=B,z!==0&&A-z<D.storage&&(v+=A-z),g.__data=new Float32Array(D.storage/Float32Array.BYTES_PER_ELEMENT),g.__offset=v,v+=D.storage}}}let P=v%A;return P>0&&(v+=A-P),E.__size=v,E.__cache={},this}function p(E){let _={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(_.boundary=4,_.storage=4):E.isVector2?(_.boundary=8,_.storage=8):E.isVector3||E.isColor?(_.boundary=16,_.storage=12):E.isVector4?(_.boundary=16,_.storage=16):E.isMatrix3?(_.boundary=48,_.storage=48):E.isMatrix4?(_.boundary=64,_.storage=64):E.isTexture?Ft("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(E)?(_.boundary=16,_.storage=E.byteLength):Ft("WebGLRenderer: Unsupported uniform value type.",E),_}function c(E){let _=E.target;_.removeEventListener("dispose",c);let v=a.indexOf(_.__bindingPointIndex);a.splice(v,1),n.deleteBuffer(s[_.id]),delete s[_.id],delete r[_.id]}function f(){for(let E in s)n.deleteBuffer(s[E]);a=[],s={},r={}}return{bind:m,update:x,dispose:f}}var xg=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Ri=null;function yg(){return Ri===null&&(Ri=new Tn(xg,16,16,dn,Ci),Ri.name="DFG_LUT",Ri.minFilter=we,Ri.magFilter=we,Ri.wrapS=_i,Ri.wrapT=_i,Ri.generateMipmaps=!1,Ri.needsUpdate=!0),Ri}var co=class{constructor(t={}){let{canvas:e=_h(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:u=!1,premultipliedAlpha:m=!0,preserveDrawingBuffer:x=!1,powerPreference:M="default",failIfMajorPerformanceCaveat:y=!1,reversedDepthBuffer:h=!1,outputBufferType:o=Ke}=t;this.isWebGLRenderer=!0;let l;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");l=i.getContextAttributes().alpha}else l=a;let p=o,c=new Set([Ea,wa,Sa]),f=new Set([Ke,pi,us,ds,_a,Ma]),E=new Uint32Array(4),_=new Int32Array(4),v=new W,A=null,P=null,C=[],d=[],b=null;this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=je,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,L=!1,g=null;this._outputColorSpace=Ze;let w=0,T=0,S=null,I=-1,D=null,U=new ye,B=new ye,z=null,k=new ee(0),H=0,Y=e.width,ht=e.height,rt=1,X=null,$=null,Q=new ye(0,0,Y,ht),at=new ye(0,0,Y,ht),pt=!1,tt=new Fs,yt=!1,Et=!1,bt=new se,Ot=new W,St=new ye,Yt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ut=!1;function $t(){return S===null?rt:1}let V=i;function Vt(N,q){return e.getContext(N,q)}try{let N={alpha:!0,depth:s,stencil:r,antialias:u,premultipliedAlpha:m,preserveDrawingBuffer:x,powerPreference:M,failIfMajorPerformanceCaveat:y};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"184"}`),e.addEventListener("webglcontextlost",lt,!1),e.addEventListener("webglcontextrestored",Pt,!1),e.addEventListener("webglcontextcreationerror",Ht,!1),V===null){let q="webgl2";if(V=Vt(q,N),V===null)throw Vt(q)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(N){throw Nt("WebGLRenderer: "+N.message),N}let Bt,Jt,mt,Qt,O,F,Z,it,ot,ct,ut,et,st,wt,Ct,gt,dt,kt,Wt,ie,G,ft,nt;function Tt(){Bt=new Em(V),Bt.init(),G=new ug(V,Bt),Jt=new xm(V,Bt,t,G),mt=new cg(V,Bt),Jt.reversedDepthBuffer&&h&&mt.buffers.depth.setReversed(!0),Qt=new Cm(V),O=new J0,F=new hg(V,Bt,mt,O,Jt,G,Qt),Z=new wm(R),it=new Pd(V),ft=new mm(V,it),ot=new Tm(V,it,Qt,ft),ct=new Im(V,ot,it,ft,Qt),kt=new Rm(V,Jt,F),Ct=new ym(O),ut=new Z0(R,Z,Bt,Jt,ft,Ct),et=new mg(R,O),st=new K0,wt=new ng(Bt),dt=new pm(R,Z,mt,ct,l,m),gt=new lg(R,ct,Jt),nt=new gg(V,Qt,Jt,mt),Wt=new gm(V,Bt,Qt),ie=new Am(V,Bt,Qt),Qt.programs=ut.programs,R.capabilities=Jt,R.extensions=Bt,R.properties=O,R.renderLists=st,R.shadowMap=gt,R.state=mt,R.info=Qt}Tt(),p!==Ke&&(b=new Lm(p,e.width,e.height,s,r));let xt=new ql(R,V);this.xr=xt,this.getContext=function(){return V},this.getContextAttributes=function(){return V.getContextAttributes()},this.forceContextLoss=function(){let N=Bt.get("WEBGL_lose_context");N&&N.loseContext()},this.forceContextRestore=function(){let N=Bt.get("WEBGL_lose_context");N&&N.restoreContext()},this.getPixelRatio=function(){return rt},this.setPixelRatio=function(N){N!==void 0&&(rt=N,this.setSize(Y,ht,!1))},this.getSize=function(N){return N.set(Y,ht)},this.setSize=function(N,q,K=!0){if(xt.isPresenting){Ft("WebGLRenderer: Can't change size while VR device is presenting.");return}Y=N,ht=q,e.width=Math.floor(N*rt),e.height=Math.floor(q*rt),K===!0&&(e.style.width=N+"px",e.style.height=q+"px"),b!==null&&b.setSize(e.width,e.height),this.setViewport(0,0,N,q)},this.getDrawingBufferSize=function(N){return N.set(Y*rt,ht*rt).floor()},this.setDrawingBufferSize=function(N,q,K){Y=N,ht=q,rt=K,e.width=Math.floor(N*K),e.height=Math.floor(q*K),this.setViewport(0,0,N,q)},this.setEffects=function(N){if(p===Ke){Nt("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(N){for(let q=0;q<N.length;q++)if(N[q].isOutputPass===!0){Ft("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}b.setEffects(N||[])},this.getCurrentViewport=function(N){return N.copy(U)},this.getViewport=function(N){return N.copy(Q)},this.setViewport=function(N,q,K,J){N.isVector4?Q.set(N.x,N.y,N.z,N.w):Q.set(N,q,K,J),mt.viewport(U.copy(Q).multiplyScalar(rt).round())},this.getScissor=function(N){return N.copy(at)},this.setScissor=function(N,q,K,J){N.isVector4?at.set(N.x,N.y,N.z,N.w):at.set(N,q,K,J),mt.scissor(B.copy(at).multiplyScalar(rt).round())},this.getScissorTest=function(){return pt},this.setScissorTest=function(N){mt.setScissorTest(pt=N)},this.setOpaqueSort=function(N){X=N},this.setTransparentSort=function(N){$=N},this.getClearColor=function(N){return N.copy(dt.getClearColor())},this.setClearColor=function(){dt.setClearColor(...arguments)},this.getClearAlpha=function(){return dt.getClearAlpha()},this.setClearAlpha=function(){dt.setClearAlpha(...arguments)},this.clear=function(N=!0,q=!0,K=!0){let J=0;if(N){let j=!1;if(S!==null){let Mt=S.texture.format;j=c.has(Mt)}if(j){let Mt=S.texture.type,Rt=f.has(Mt),_t=dt.getClearColor(),It=dt.getClearAlpha(),Lt=_t.r,Gt=_t.g,qt=_t.b;Rt?(E[0]=Lt,E[1]=Gt,E[2]=qt,E[3]=It,V.clearBufferuiv(V.COLOR,0,E)):(_[0]=Lt,_[1]=Gt,_[2]=qt,_[3]=It,V.clearBufferiv(V.COLOR,0,_))}else J|=V.COLOR_BUFFER_BIT}q&&(J|=V.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),K&&(J|=V.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),J!==0&&V.clear(J)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(N){N.setRenderer(this),g=N},this.dispose=function(){e.removeEventListener("webglcontextlost",lt,!1),e.removeEventListener("webglcontextrestored",Pt,!1),e.removeEventListener("webglcontextcreationerror",Ht,!1),dt.dispose(),st.dispose(),wt.dispose(),O.dispose(),Z.dispose(),ct.dispose(),ft.dispose(),nt.dispose(),ut.dispose(),xt.dispose(),xt.removeEventListener("sessionstart",oc),xt.removeEventListener("sessionend",lc),gn.stop()};function lt(N){N.preventDefault(),Cs("WebGLRenderer: Context Lost."),L=!0}function Pt(){Cs("WebGLRenderer: Context Restored."),L=!1;let N=Qt.autoReset,q=gt.enabled,K=gt.autoUpdate,J=gt.needsUpdate,j=gt.type;Tt(),Qt.autoReset=N,gt.enabled=q,gt.autoUpdate=K,gt.needsUpdate=J,gt.type=j}function Ht(N){Nt("WebGLRenderer: A WebGL context could not be created. Reason: ",N.statusMessage)}function ve(N){let q=N.target;q.removeEventListener("dispose",ve),oe(q)}function oe(N){Pi(N),O.remove(N)}function Pi(N){let q=O.get(N).programs;q!==void 0&&(q.forEach(function(K){ut.releaseProgram(K)}),N.isShaderMaterial&&ut.releaseShaderCache(N))}this.renderBufferDirect=function(N,q,K,J,j,Mt){q===null&&(q=Yt);let Rt=j.isMesh&&j.matrixWorld.determinant()<0,_t=Wu(N,q,K,J,j);mt.setMaterial(J,Rt);let It=K.index,Lt=1;if(J.wireframe===!0){if(It=ot.getWireframeAttribute(K),It===void 0)return;Lt=2}let Gt=K.drawRange,qt=K.attributes.position,Dt=Gt.start*Lt,le=(Gt.start+Gt.count)*Lt;Mt!==null&&(Dt=Math.max(Dt,Mt.start*Lt),le=Math.min(le,(Mt.start+Mt.count)*Lt)),It!==null?(Dt=Math.max(Dt,0),le=Math.min(le,It.count)):qt!=null&&(Dt=Math.max(Dt,0),le=Math.min(le,qt.count));let _e=le-Dt;if(_e<0||_e===1/0)return;ft.setup(j,J,_t,K,It);let xe,ue=Wt;if(It!==null&&(xe=it.get(It),ue=ie,ue.setIndex(xe)),j.isMesh)J.wireframe===!0?(mt.setLineWidth(J.wireframeLinewidth*$t()),ue.setMode(V.LINES)):ue.setMode(V.TRIANGLES);else if(j.isLine){let Le=J.linewidth;Le===void 0&&(Le=1),mt.setLineWidth(Le*$t()),j.isLineSegments?ue.setMode(V.LINES):j.isLineLoop?ue.setMode(V.LINE_LOOP):ue.setMode(V.LINE_STRIP)}else j.isPoints?ue.setMode(V.POINTS):j.isSprite&&ue.setMode(V.TRIANGLES);if(j.isBatchedMesh)if(Bt.get("WEBGL_multi_draw"))ue.renderMultiDraw(j._multiDrawStarts,j._multiDrawCounts,j._multiDrawCount);else{let Le=j._multiDrawStarts,At=j._multiDrawCounts,Xe=j._multiDrawCount,te=It?it.get(It).bytesPerElement:1,Qe=O.get(J).currentProgram.getUniforms();for(let gi=0;gi<Xe;gi++)Qe.setValue(V,"_gl_DrawID",gi),ue.render(Le[gi]/te,At[gi])}else if(j.isInstancedMesh)ue.renderInstances(Dt,_e,j.count);else if(K.isInstancedBufferGeometry){let Le=K._maxInstanceCount!==void 0?K._maxInstanceCount:1/0,At=Math.min(K.instanceCount,Le);ue.renderInstances(Dt,_e,At)}else ue.render(Dt,_e)};function mi(N,q,K){N.transparent===!0&&N.side===Ee&&N.forceSinglePass===!1?(N.side=Ve,N.needsUpdate=!0,or(N,q,K),N.side=hi,N.needsUpdate=!0,or(N,q,K),N.side=Ee):or(N,q,K)}this.compile=function(N,q,K=null){K===null&&(K=N),P=wt.get(K),P.init(q),d.push(P),K.traverseVisible(function(j){j.isLight&&j.layers.test(q.layers)&&(P.pushLight(j),j.castShadow&&P.pushShadow(j))}),N!==K&&N.traverseVisible(function(j){j.isLight&&j.layers.test(q.layers)&&(P.pushLight(j),j.castShadow&&P.pushShadow(j))}),P.setupLights();let J=new Set;return N.traverse(function(j){if(!(j.isMesh||j.isPoints||j.isLine||j.isSprite))return;let Mt=j.material;if(Mt)if(Array.isArray(Mt))for(let Rt=0;Rt<Mt.length;Rt++){let _t=Mt[Rt];mi(_t,K,j),J.add(_t)}else mi(Mt,K,j),J.add(Mt)}),P=d.pop(),J},this.compileAsync=function(N,q,K=null){let J=this.compile(N,q,K);return new Promise(j=>{function Mt(){if(J.forEach(function(Rt){O.get(Rt).currentProgram.isReady()&&J.delete(Rt)}),J.size===0){j(N);return}setTimeout(Mt,10)}Bt.get("KHR_parallel_shader_compile")!==null?Mt():setTimeout(Mt,10)})};let To=null;function Hu(N){To&&To(N)}function oc(){gn.stop()}function lc(){gn.start()}let gn=new Jh;gn.setAnimationLoop(Hu),typeof self<"u"&&gn.setContext(self),this.setAnimationLoop=function(N){To=N,xt.setAnimationLoop(N),N===null?gn.stop():gn.start()},xt.addEventListener("sessionstart",oc),xt.addEventListener("sessionend",lc),this.render=function(N,q){if(q!==void 0&&q.isCamera!==!0){Nt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;g!==null&&g.renderStart(N,q);let K=xt.enabled===!0&&xt.isPresenting===!0,J=b!==null&&(S===null||K)&&b.begin(R,S);if(N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),q.parent===null&&q.matrixWorldAutoUpdate===!0&&q.updateMatrixWorld(),xt.enabled===!0&&xt.isPresenting===!0&&(b===null||b.isCompositing()===!1)&&(xt.cameraAutoUpdate===!0&&xt.updateCamera(q),q=xt.getCamera()),N.isScene===!0&&N.onBeforeRender(R,N,q,S),P=wt.get(N,d.length),P.init(q),P.state.textureUnits=F.getTextureUnits(),d.push(P),bt.multiplyMatrices(q.projectionMatrix,q.matrixWorldInverse),tt.setFromProjectionMatrix(bt,ci,q.reversedDepth),Et=this.localClippingEnabled,yt=Ct.init(this.clippingPlanes,Et),A=st.get(N,C.length),A.init(),C.push(A),xt.enabled===!0&&xt.isPresenting===!0){let Rt=R.xr.getDepthSensingMesh();Rt!==null&&Ao(Rt,q,-1/0,R.sortObjects)}Ao(N,q,0,R.sortObjects),A.finish(),R.sortObjects===!0&&A.sort(X,$),Ut=xt.enabled===!1||xt.isPresenting===!1||xt.hasDepthSensing()===!1,Ut&&dt.addToRenderList(A,N),this.info.render.frame++,yt===!0&&Ct.beginShadows();let j=P.state.shadowsArray;if(gt.render(j,N,q),yt===!0&&Ct.endShadows(),this.info.autoReset===!0&&this.info.reset(),(J&&b.hasRenderPass())===!1){let Rt=A.opaque,_t=A.transmissive;if(P.setupLights(),q.isArrayCamera){let It=q.cameras;if(_t.length>0)for(let Lt=0,Gt=It.length;Lt<Gt;Lt++){let qt=It[Lt];hc(Rt,_t,N,qt)}Ut&&dt.render(N);for(let Lt=0,Gt=It.length;Lt<Gt;Lt++){let qt=It[Lt];cc(A,N,qt,qt.viewport)}}else _t.length>0&&hc(Rt,_t,N,q),Ut&&dt.render(N),cc(A,N,q)}S!==null&&T===0&&(F.updateMultisampleRenderTarget(S),F.updateRenderTargetMipmap(S)),J&&b.end(R),N.isScene===!0&&N.onAfterRender(R,N,q),ft.resetDefaultState(),I=-1,D=null,d.pop(),d.length>0?(P=d[d.length-1],F.setTextureUnits(P.state.textureUnits),yt===!0&&Ct.setGlobalState(R.clippingPlanes,P.state.camera)):P=null,C.pop(),C.length>0?A=C[C.length-1]:A=null,g!==null&&g.renderEnd()};function Ao(N,q,K,J){if(N.visible===!1)return;if(N.layers.test(q.layers)){if(N.isGroup)K=N.renderOrder;else if(N.isLOD)N.autoUpdate===!0&&N.update(q);else if(N.isLightProbeGrid)P.pushLightProbeGrid(N);else if(N.isLight)P.pushLight(N),N.castShadow&&P.pushShadow(N);else if(N.isSprite){if(!N.frustumCulled||tt.intersectsSprite(N)){J&&St.setFromMatrixPosition(N.matrixWorld).applyMatrix4(bt);let Rt=ct.update(N),_t=N.material;_t.visible&&A.push(N,Rt,_t,K,St.z,null)}}else if((N.isMesh||N.isLine||N.isPoints)&&(!N.frustumCulled||tt.intersectsObject(N))){let Rt=ct.update(N),_t=N.material;if(J&&(N.boundingSphere!==void 0?(N.boundingSphere===null&&N.computeBoundingSphere(),St.copy(N.boundingSphere.center)):(Rt.boundingSphere===null&&Rt.computeBoundingSphere(),St.copy(Rt.boundingSphere.center)),St.applyMatrix4(N.matrixWorld).applyMatrix4(bt)),Array.isArray(_t)){let It=Rt.groups;for(let Lt=0,Gt=It.length;Lt<Gt;Lt++){let qt=It[Lt],Dt=_t[qt.materialIndex];Dt&&Dt.visible&&A.push(N,Rt,Dt,K,St.z,qt)}}else _t.visible&&A.push(N,Rt,_t,K,St.z,null)}}let Mt=N.children;for(let Rt=0,_t=Mt.length;Rt<_t;Rt++)Ao(Mt[Rt],q,K,J)}function cc(N,q,K,J){let{opaque:j,transmissive:Mt,transparent:Rt}=N;P.setupLightsView(K),yt===!0&&Ct.setGlobalState(R.clippingPlanes,K),J&&mt.viewport(U.copy(J)),j.length>0&&ar(j,q,K),Mt.length>0&&ar(Mt,q,K),Rt.length>0&&ar(Rt,q,K),mt.buffers.depth.setTest(!0),mt.buffers.depth.setMask(!0),mt.buffers.color.setMask(!0),mt.setPolygonOffset(!1)}function hc(N,q,K,J){if((K.isScene===!0?K.overrideMaterial:null)!==null)return;if(P.state.transmissionRenderTarget[J.id]===void 0){let Dt=Bt.has("EXT_color_buffer_half_float")||Bt.has("EXT_color_buffer_float");P.state.transmissionRenderTarget[J.id]=new ke(1,1,{generateMipmaps:!0,type:Dt?Ci:Ke,minFilter:Ai,samples:Math.max(4,Jt.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Zt.workingColorSpace})}let Mt=P.state.transmissionRenderTarget[J.id],Rt=J.viewport||U;Mt.setSize(Rt.z*R.transmissionResolutionScale,Rt.w*R.transmissionResolutionScale);let _t=R.getRenderTarget(),It=R.getActiveCubeFace(),Lt=R.getActiveMipmapLevel();R.setRenderTarget(Mt),R.getClearColor(k),H=R.getClearAlpha(),H<1&&R.setClearColor(16777215,.5),R.clear(),Ut&&dt.render(K);let Gt=R.toneMapping;R.toneMapping=je;let qt=J.viewport;if(J.viewport!==void 0&&(J.viewport=void 0),P.setupLightsView(J),yt===!0&&Ct.setGlobalState(R.clippingPlanes,J),ar(N,K,J),F.updateMultisampleRenderTarget(Mt),F.updateRenderTargetMipmap(Mt),Bt.has("WEBGL_multisampled_render_to_texture")===!1){let Dt=!1;for(let le=0,_e=q.length;le<_e;le++){let xe=q[le],{object:ue,geometry:Le,material:At,group:Xe}=xe;if(At.side===Ee&&ue.layers.test(J.layers)){let te=At.side;At.side=Ve,At.needsUpdate=!0,uc(ue,K,J,Le,At,Xe),At.side=te,At.needsUpdate=!0,Dt=!0}}Dt===!0&&(F.updateMultisampleRenderTarget(Mt),F.updateRenderTargetMipmap(Mt))}R.setRenderTarget(_t,It,Lt),R.setClearColor(k,H),qt!==void 0&&(J.viewport=qt),R.toneMapping=Gt}function ar(N,q,K){let J=q.isScene===!0?q.overrideMaterial:null;for(let j=0,Mt=N.length;j<Mt;j++){let Rt=N[j],{object:_t,geometry:It,group:Lt}=Rt,Gt=Rt.material;Gt.allowOverride===!0&&J!==null&&(Gt=J),_t.layers.test(K.layers)&&uc(_t,q,K,It,Gt,Lt)}}function uc(N,q,K,J,j,Mt){N.onBeforeRender(R,q,K,J,j,Mt),N.modelViewMatrix.multiplyMatrices(K.matrixWorldInverse,N.matrixWorld),N.normalMatrix.getNormalMatrix(N.modelViewMatrix),j.onBeforeRender(R,q,K,J,N,Mt),j.transparent===!0&&j.side===Ee&&j.forceSinglePass===!1?(j.side=Ve,j.needsUpdate=!0,R.renderBufferDirect(K,q,J,j,N,Mt),j.side=hi,j.needsUpdate=!0,R.renderBufferDirect(K,q,J,j,N,Mt),j.side=Ee):R.renderBufferDirect(K,q,J,j,N,Mt),N.onAfterRender(R,q,K,J,j,Mt)}function or(N,q,K){q.isScene!==!0&&(q=Yt);let J=O.get(N),j=P.state.lights,Mt=P.state.shadowsArray,Rt=j.state.version,_t=ut.getParameters(N,j.state,Mt,q,K,P.state.lightProbeGridArray),It=ut.getProgramCacheKey(_t),Lt=J.programs;J.environment=N.isMeshStandardMaterial||N.isMeshLambertMaterial||N.isMeshPhongMaterial?q.environment:null,J.fog=q.fog;let Gt=N.isMeshStandardMaterial||N.isMeshLambertMaterial&&!N.envMap||N.isMeshPhongMaterial&&!N.envMap;J.envMap=Z.get(N.envMap||J.environment,Gt),J.envMapRotation=J.environment!==null&&N.envMap===null?q.environmentRotation:N.envMapRotation,Lt===void 0&&(N.addEventListener("dispose",ve),Lt=new Map,J.programs=Lt);let qt=Lt.get(It);if(qt!==void 0){if(J.currentProgram===qt&&J.lightsStateVersion===Rt)return fc(N,_t),qt}else _t.uniforms=ut.getUniforms(N),g!==null&&N.isNodeMaterial&&g.build(N,K,_t),N.onBeforeCompile(_t,R),qt=ut.acquireProgram(_t,It),Lt.set(It,qt),J.uniforms=_t.uniforms;let Dt=J.uniforms;return(!N.isShaderMaterial&&!N.isRawShaderMaterial||N.clipping===!0)&&(Dt.clippingPlanes=Ct.uniform),fc(N,_t),J.needsLights=qu(N),J.lightsStateVersion=Rt,J.needsLights&&(Dt.ambientLightColor.value=j.state.ambient,Dt.lightProbe.value=j.state.probe,Dt.directionalLights.value=j.state.directional,Dt.directionalLightShadows.value=j.state.directionalShadow,Dt.spotLights.value=j.state.spot,Dt.spotLightShadows.value=j.state.spotShadow,Dt.rectAreaLights.value=j.state.rectArea,Dt.ltc_1.value=j.state.rectAreaLTC1,Dt.ltc_2.value=j.state.rectAreaLTC2,Dt.pointLights.value=j.state.point,Dt.pointLightShadows.value=j.state.pointShadow,Dt.hemisphereLights.value=j.state.hemi,Dt.directionalShadowMatrix.value=j.state.directionalShadowMatrix,Dt.spotLightMatrix.value=j.state.spotLightMatrix,Dt.spotLightMap.value=j.state.spotLightMap,Dt.pointShadowMatrix.value=j.state.pointShadowMatrix),J.lightProbeGrid=P.state.lightProbeGridArray.length>0,J.currentProgram=qt,J.uniformsList=null,qt}function dc(N){if(N.uniformsList===null){let q=N.currentProgram.getUniforms();N.uniformsList=ps.seqWithValue(q.seq,N.uniforms)}return N.uniformsList}function fc(N,q){let K=O.get(N);K.outputColorSpace=q.outputColorSpace,K.batching=q.batching,K.batchingColor=q.batchingColor,K.instancing=q.instancing,K.instancingColor=q.instancingColor,K.instancingMorph=q.instancingMorph,K.skinning=q.skinning,K.morphTargets=q.morphTargets,K.morphNormals=q.morphNormals,K.morphColors=q.morphColors,K.morphTargetsCount=q.morphTargetsCount,K.numClippingPlanes=q.numClippingPlanes,K.numIntersection=q.numClipIntersection,K.vertexAlphas=q.vertexAlphas,K.vertexTangents=q.vertexTangents,K.toneMapping=q.toneMapping}function Gu(N,q){if(N.length===0)return null;if(N.length===1)return N[0].texture!==null?N[0]:null;v.setFromMatrixPosition(q.matrixWorld);for(let K=0,J=N.length;K<J;K++){let j=N[K];if(j.texture!==null&&j.boundingBox.containsPoint(v))return j}return null}function Wu(N,q,K,J,j){q.isScene!==!0&&(q=Yt),F.resetTextureUnits();let Mt=q.fog,Rt=J.isMeshStandardMaterial||J.isMeshLambertMaterial||J.isMeshPhongMaterial?q.environment:null,_t=S===null?R.outputColorSpace:S.isXRRenderTarget===!0?S.texture.colorSpace:Zt.workingColorSpace,It=J.isMeshStandardMaterial||J.isMeshLambertMaterial&&!J.envMap||J.isMeshPhongMaterial&&!J.envMap,Lt=Z.get(J.envMap||Rt,It),Gt=J.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,qt=!!K.attributes.tangent&&(!!J.normalMap||J.anisotropy>0),Dt=!!K.morphAttributes.position,le=!!K.morphAttributes.normal,_e=!!K.morphAttributes.color,xe=je;J.toneMapped&&(S===null||S.isXRRenderTarget===!0)&&(xe=R.toneMapping);let ue=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,Le=ue!==void 0?ue.length:0,At=O.get(J),Xe=P.state.lights;if(yt===!0&&(Et===!0||N!==D)){let fe=N===D&&J.id===I;Ct.setState(J,N,fe)}let te=!1;J.version===At.__version?(At.needsLights&&At.lightsStateVersion!==Xe.state.version||At.outputColorSpace!==_t||j.isBatchedMesh&&At.batching===!1||!j.isBatchedMesh&&At.batching===!0||j.isBatchedMesh&&At.batchingColor===!0&&j.colorTexture===null||j.isBatchedMesh&&At.batchingColor===!1&&j.colorTexture!==null||j.isInstancedMesh&&At.instancing===!1||!j.isInstancedMesh&&At.instancing===!0||j.isSkinnedMesh&&At.skinning===!1||!j.isSkinnedMesh&&At.skinning===!0||j.isInstancedMesh&&At.instancingColor===!0&&j.instanceColor===null||j.isInstancedMesh&&At.instancingColor===!1&&j.instanceColor!==null||j.isInstancedMesh&&At.instancingMorph===!0&&j.morphTexture===null||j.isInstancedMesh&&At.instancingMorph===!1&&j.morphTexture!==null||At.envMap!==Lt||J.fog===!0&&At.fog!==Mt||At.numClippingPlanes!==void 0&&(At.numClippingPlanes!==Ct.numPlanes||At.numIntersection!==Ct.numIntersection)||At.vertexAlphas!==Gt||At.vertexTangents!==qt||At.morphTargets!==Dt||At.morphNormals!==le||At.morphColors!==_e||At.toneMapping!==xe||At.morphTargetsCount!==Le||!!At.lightProbeGrid!=P.state.lightProbeGridArray.length>0)&&(te=!0):(te=!0,At.__version=J.version);let Qe=At.currentProgram;te===!0&&(Qe=or(J,q,j),g&&J.isNodeMaterial&&g.onUpdateProgram(J,Qe,At));let gi=!1,Hi=!1,Un=!1,de=Qe.getUniforms(),Me=At.uniforms;if(mt.useProgram(Qe.program)&&(gi=!0,Hi=!0,Un=!0),J.id!==I&&(I=J.id,Hi=!0),At.needsLights){let fe=Gu(P.state.lightProbeGridArray,j);At.lightProbeGrid!==fe&&(At.lightProbeGrid=fe,Hi=!0)}if(gi||D!==N){mt.buffers.depth.getReversed()&&N.reversedDepth!==!0&&(N._reversedDepth=!0,N.updateProjectionMatrix()),de.setValue(V,"projectionMatrix",N.projectionMatrix),de.setValue(V,"viewMatrix",N.matrixWorldInverse);let Wi=de.map.cameraPosition;Wi!==void 0&&Wi.setValue(V,Ot.setFromMatrixPosition(N.matrixWorld)),Jt.logarithmicDepthBuffer&&de.setValue(V,"logDepthBufFC",2/(Math.log(N.far+1)/Math.LN2)),(J.isMeshPhongMaterial||J.isMeshToonMaterial||J.isMeshLambertMaterial||J.isMeshBasicMaterial||J.isMeshStandardMaterial||J.isShaderMaterial)&&de.setValue(V,"isOrthographic",N.isOrthographicCamera===!0),D!==N&&(D=N,Hi=!0,Un=!0)}if(At.needsLights&&(Xe.state.directionalShadowMap.length>0&&de.setValue(V,"directionalShadowMap",Xe.state.directionalShadowMap,F),Xe.state.spotShadowMap.length>0&&de.setValue(V,"spotShadowMap",Xe.state.spotShadowMap,F),Xe.state.pointShadowMap.length>0&&de.setValue(V,"pointShadowMap",Xe.state.pointShadowMap,F)),j.isSkinnedMesh){de.setOptional(V,j,"bindMatrix"),de.setOptional(V,j,"bindMatrixInverse");let fe=j.skeleton;fe&&(fe.boneTexture===null&&fe.computeBoneTexture(),de.setValue(V,"boneTexture",fe.boneTexture,F))}j.isBatchedMesh&&(de.setOptional(V,j,"batchingTexture"),de.setValue(V,"batchingTexture",j._matricesTexture,F),de.setOptional(V,j,"batchingIdTexture"),de.setValue(V,"batchingIdTexture",j._indirectTexture,F),de.setOptional(V,j,"batchingColorTexture"),j._colorsTexture!==null&&de.setValue(V,"batchingColorTexture",j._colorsTexture,F));let Gi=K.morphAttributes;if((Gi.position!==void 0||Gi.normal!==void 0||Gi.color!==void 0)&&kt.update(j,K,Qe),(Hi||At.receiveShadow!==j.receiveShadow)&&(At.receiveShadow=j.receiveShadow,de.setValue(V,"receiveShadow",j.receiveShadow)),(J.isMeshStandardMaterial||J.isMeshLambertMaterial||J.isMeshPhongMaterial)&&J.envMap===null&&q.environment!==null&&(Me.envMapIntensity.value=q.environmentIntensity),Me.dfgLUT!==void 0&&(Me.dfgLUT.value=yg()),Hi){if(de.setValue(V,"toneMappingExposure",R.toneMappingExposure),At.needsLights&&Xu(Me,Un),Mt&&J.fog===!0&&et.refreshFogUniforms(Me,Mt),et.refreshMaterialUniforms(Me,J,rt,ht,P.state.transmissionRenderTarget[N.id]),At.needsLights&&At.lightProbeGrid){let fe=At.lightProbeGrid;Me.probesSH.value=fe.texture,Me.probesMin.value.copy(fe.boundingBox.min),Me.probesMax.value.copy(fe.boundingBox.max),Me.probesResolution.value.copy(fe.resolution)}ps.upload(V,dc(At),Me,F)}if(J.isShaderMaterial&&J.uniformsNeedUpdate===!0&&(ps.upload(V,dc(At),Me,F),J.uniformsNeedUpdate=!1),J.isSpriteMaterial&&de.setValue(V,"center",j.center),de.setValue(V,"modelViewMatrix",j.modelViewMatrix),de.setValue(V,"normalMatrix",j.normalMatrix),de.setValue(V,"modelMatrix",j.matrixWorld),J.uniformsGroups!==void 0){let fe=J.uniformsGroups;for(let Wi=0,On=fe.length;Wi<On;Wi++){let pc=fe[Wi];nt.update(pc,Qe),nt.bind(pc,Qe)}}return Qe}function Xu(N,q){N.ambientLightColor.needsUpdate=q,N.lightProbe.needsUpdate=q,N.directionalLights.needsUpdate=q,N.directionalLightShadows.needsUpdate=q,N.pointLights.needsUpdate=q,N.pointLightShadows.needsUpdate=q,N.spotLights.needsUpdate=q,N.spotLightShadows.needsUpdate=q,N.rectAreaLights.needsUpdate=q,N.hemisphereLights.needsUpdate=q}function qu(N){return N.isMeshLambertMaterial||N.isMeshToonMaterial||N.isMeshPhongMaterial||N.isMeshStandardMaterial||N.isShadowMaterial||N.isShaderMaterial&&N.lights===!0}this.getActiveCubeFace=function(){return w},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return S},this.setRenderTargetTextures=function(N,q,K){let J=O.get(N);J.__autoAllocateDepthBuffer=N.resolveDepthBuffer===!1,J.__autoAllocateDepthBuffer===!1&&(J.__useRenderToTexture=!1),O.get(N.texture).__webglTexture=q,O.get(N.depthTexture).__webglTexture=J.__autoAllocateDepthBuffer?void 0:K,J.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(N,q){let K=O.get(N);K.__webglFramebuffer=q,K.__useDefaultFramebuffer=q===void 0};let Yu=V.createFramebuffer();this.setRenderTarget=function(N,q=0,K=0){S=N,w=q,T=K;let J=null,j=!1,Mt=!1;if(N){let _t=O.get(N);if(_t.__useDefaultFramebuffer!==void 0){mt.bindFramebuffer(V.FRAMEBUFFER,_t.__webglFramebuffer),U.copy(N.viewport),B.copy(N.scissor),z=N.scissorTest,mt.viewport(U),mt.scissor(B),mt.setScissorTest(z),I=-1;return}else if(_t.__webglFramebuffer===void 0)F.setupRenderTarget(N);else if(_t.__hasExternalTextures)F.rebindTextures(N,O.get(N.texture).__webglTexture,O.get(N.depthTexture).__webglTexture);else if(N.depthBuffer){let Gt=N.depthTexture;if(_t.__boundDepthTexture!==Gt){if(Gt!==null&&O.has(Gt)&&(N.width!==Gt.image.width||N.height!==Gt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");F.setupDepthRenderbuffer(N)}}let It=N.texture;(It.isData3DTexture||It.isDataArrayTexture||It.isCompressedArrayTexture)&&(Mt=!0);let Lt=O.get(N).__webglFramebuffer;N.isWebGLCubeRenderTarget?(Array.isArray(Lt[q])?J=Lt[q][K]:J=Lt[q],j=!0):N.samples>0&&F.useMultisampledRTT(N)===!1?J=O.get(N).__webglMultisampledFramebuffer:Array.isArray(Lt)?J=Lt[K]:J=Lt,U.copy(N.viewport),B.copy(N.scissor),z=N.scissorTest}else U.copy(Q).multiplyScalar(rt).floor(),B.copy(at).multiplyScalar(rt).floor(),z=pt;if(K!==0&&(J=Yu),mt.bindFramebuffer(V.FRAMEBUFFER,J)&&mt.drawBuffers(N,J),mt.viewport(U),mt.scissor(B),mt.setScissorTest(z),j){let _t=O.get(N.texture);V.framebufferTexture2D(V.FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_CUBE_MAP_POSITIVE_X+q,_t.__webglTexture,K)}else if(Mt){let _t=q;for(let It=0;It<N.textures.length;It++){let Lt=O.get(N.textures[It]);V.framebufferTextureLayer(V.FRAMEBUFFER,V.COLOR_ATTACHMENT0+It,Lt.__webglTexture,K,_t)}}else if(N!==null&&K!==0){let _t=O.get(N.texture);V.framebufferTexture2D(V.FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_2D,_t.__webglTexture,K)}I=-1},this.readRenderTargetPixels=function(N,q,K,J,j,Mt,Rt,_t=0){if(!(N&&N.isWebGLRenderTarget)){Nt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let It=O.get(N).__webglFramebuffer;if(N.isWebGLCubeRenderTarget&&Rt!==void 0&&(It=It[Rt]),It){mt.bindFramebuffer(V.FRAMEBUFFER,It);try{let Lt=N.textures[_t],Gt=Lt.format,qt=Lt.type;if(N.textures.length>1&&V.readBuffer(V.COLOR_ATTACHMENT0+_t),!Jt.textureFormatReadable(Gt)){Nt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Jt.textureTypeReadable(qt)){Nt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}q>=0&&q<=N.width-J&&K>=0&&K<=N.height-j&&V.readPixels(q,K,J,j,G.convert(Gt),G.convert(qt),Mt)}finally{let Lt=S!==null?O.get(S).__webglFramebuffer:null;mt.bindFramebuffer(V.FRAMEBUFFER,Lt)}}},this.readRenderTargetPixelsAsync=async function(N,q,K,J,j,Mt,Rt,_t=0){if(!(N&&N.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let It=O.get(N).__webglFramebuffer;if(N.isWebGLCubeRenderTarget&&Rt!==void 0&&(It=It[Rt]),It)if(q>=0&&q<=N.width-J&&K>=0&&K<=N.height-j){mt.bindFramebuffer(V.FRAMEBUFFER,It);let Lt=N.textures[_t],Gt=Lt.format,qt=Lt.type;if(N.textures.length>1&&V.readBuffer(V.COLOR_ATTACHMENT0+_t),!Jt.textureFormatReadable(Gt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Jt.textureTypeReadable(qt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Dt=V.createBuffer();V.bindBuffer(V.PIXEL_PACK_BUFFER,Dt),V.bufferData(V.PIXEL_PACK_BUFFER,Mt.byteLength,V.STREAM_READ),V.readPixels(q,K,J,j,G.convert(Gt),G.convert(qt),0);let le=S!==null?O.get(S).__webglFramebuffer:null;mt.bindFramebuffer(V.FRAMEBUFFER,le);let _e=V.fenceSync(V.SYNC_GPU_COMMANDS_COMPLETE,0);return V.flush(),await bh(V,_e,4),V.bindBuffer(V.PIXEL_PACK_BUFFER,Dt),V.getBufferSubData(V.PIXEL_PACK_BUFFER,0,Mt),V.deleteBuffer(Dt),V.deleteSync(_e),Mt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(N,q=null,K=0){let J=Math.pow(2,-K),j=Math.floor(N.image.width*J),Mt=Math.floor(N.image.height*J),Rt=q!==null?q.x:0,_t=q!==null?q.y:0;F.setTexture2D(N,0),V.copyTexSubImage2D(V.TEXTURE_2D,K,0,0,Rt,_t,j,Mt),mt.unbindTexture()};let Zu=V.createFramebuffer(),Ju=V.createFramebuffer();this.copyTextureToTexture=function(N,q,K=null,J=null,j=0,Mt=0){let Rt,_t,It,Lt,Gt,qt,Dt,le,_e,xe=N.isCompressedTexture?N.mipmaps[Mt]:N.image;if(K!==null)Rt=K.max.x-K.min.x,_t=K.max.y-K.min.y,It=K.isBox3?K.max.z-K.min.z:1,Lt=K.min.x,Gt=K.min.y,qt=K.isBox3?K.min.z:0;else{let Me=Math.pow(2,-j);Rt=Math.floor(xe.width*Me),_t=Math.floor(xe.height*Me),N.isDataArrayTexture?It=xe.depth:N.isData3DTexture?It=Math.floor(xe.depth*Me):It=1,Lt=0,Gt=0,qt=0}J!==null?(Dt=J.x,le=J.y,_e=J.z):(Dt=0,le=0,_e=0);let ue=G.convert(q.format),Le=G.convert(q.type),At;q.isData3DTexture?(F.setTexture3D(q,0),At=V.TEXTURE_3D):q.isDataArrayTexture||q.isCompressedArrayTexture?(F.setTexture2DArray(q,0),At=V.TEXTURE_2D_ARRAY):(F.setTexture2D(q,0),At=V.TEXTURE_2D),mt.activeTexture(V.TEXTURE0),mt.pixelStorei(V.UNPACK_FLIP_Y_WEBGL,q.flipY),mt.pixelStorei(V.UNPACK_PREMULTIPLY_ALPHA_WEBGL,q.premultiplyAlpha),mt.pixelStorei(V.UNPACK_ALIGNMENT,q.unpackAlignment);let Xe=mt.getParameter(V.UNPACK_ROW_LENGTH),te=mt.getParameter(V.UNPACK_IMAGE_HEIGHT),Qe=mt.getParameter(V.UNPACK_SKIP_PIXELS),gi=mt.getParameter(V.UNPACK_SKIP_ROWS),Hi=mt.getParameter(V.UNPACK_SKIP_IMAGES);mt.pixelStorei(V.UNPACK_ROW_LENGTH,xe.width),mt.pixelStorei(V.UNPACK_IMAGE_HEIGHT,xe.height),mt.pixelStorei(V.UNPACK_SKIP_PIXELS,Lt),mt.pixelStorei(V.UNPACK_SKIP_ROWS,Gt),mt.pixelStorei(V.UNPACK_SKIP_IMAGES,qt);let Un=N.isDataArrayTexture||N.isData3DTexture,de=q.isDataArrayTexture||q.isData3DTexture;if(N.isDepthTexture){let Me=O.get(N),Gi=O.get(q),fe=O.get(Me.__renderTarget),Wi=O.get(Gi.__renderTarget);mt.bindFramebuffer(V.READ_FRAMEBUFFER,fe.__webglFramebuffer),mt.bindFramebuffer(V.DRAW_FRAMEBUFFER,Wi.__webglFramebuffer);for(let On=0;On<It;On++)Un&&(V.framebufferTextureLayer(V.READ_FRAMEBUFFER,V.COLOR_ATTACHMENT0,O.get(N).__webglTexture,j,qt+On),V.framebufferTextureLayer(V.DRAW_FRAMEBUFFER,V.COLOR_ATTACHMENT0,O.get(q).__webglTexture,Mt,_e+On)),V.blitFramebuffer(Lt,Gt,Rt,_t,Dt,le,Rt,_t,V.DEPTH_BUFFER_BIT,V.NEAREST);mt.bindFramebuffer(V.READ_FRAMEBUFFER,null),mt.bindFramebuffer(V.DRAW_FRAMEBUFFER,null)}else if(j!==0||N.isRenderTargetTexture||O.has(N)){let Me=O.get(N),Gi=O.get(q);mt.bindFramebuffer(V.READ_FRAMEBUFFER,Zu),mt.bindFramebuffer(V.DRAW_FRAMEBUFFER,Ju);for(let fe=0;fe<It;fe++)Un?V.framebufferTextureLayer(V.READ_FRAMEBUFFER,V.COLOR_ATTACHMENT0,Me.__webglTexture,j,qt+fe):V.framebufferTexture2D(V.READ_FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_2D,Me.__webglTexture,j),de?V.framebufferTextureLayer(V.DRAW_FRAMEBUFFER,V.COLOR_ATTACHMENT0,Gi.__webglTexture,Mt,_e+fe):V.framebufferTexture2D(V.DRAW_FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_2D,Gi.__webglTexture,Mt),j!==0?V.blitFramebuffer(Lt,Gt,Rt,_t,Dt,le,Rt,_t,V.COLOR_BUFFER_BIT,V.NEAREST):de?V.copyTexSubImage3D(At,Mt,Dt,le,_e+fe,Lt,Gt,Rt,_t):V.copyTexSubImage2D(At,Mt,Dt,le,Lt,Gt,Rt,_t);mt.bindFramebuffer(V.READ_FRAMEBUFFER,null),mt.bindFramebuffer(V.DRAW_FRAMEBUFFER,null)}else de?N.isDataTexture||N.isData3DTexture?V.texSubImage3D(At,Mt,Dt,le,_e,Rt,_t,It,ue,Le,xe.data):q.isCompressedArrayTexture?V.compressedTexSubImage3D(At,Mt,Dt,le,_e,Rt,_t,It,ue,xe.data):V.texSubImage3D(At,Mt,Dt,le,_e,Rt,_t,It,ue,Le,xe):N.isDataTexture?V.texSubImage2D(V.TEXTURE_2D,Mt,Dt,le,Rt,_t,ue,Le,xe.data):N.isCompressedTexture?V.compressedTexSubImage2D(V.TEXTURE_2D,Mt,Dt,le,xe.width,xe.height,ue,xe.data):V.texSubImage2D(V.TEXTURE_2D,Mt,Dt,le,Rt,_t,ue,Le,xe);mt.pixelStorei(V.UNPACK_ROW_LENGTH,Xe),mt.pixelStorei(V.UNPACK_IMAGE_HEIGHT,te),mt.pixelStorei(V.UNPACK_SKIP_PIXELS,Qe),mt.pixelStorei(V.UNPACK_SKIP_ROWS,gi),mt.pixelStorei(V.UNPACK_SKIP_IMAGES,Hi),Mt===0&&q.generateMipmaps&&V.generateMipmap(At),mt.unbindTexture()},this.initRenderTarget=function(N){O.get(N).__webglFramebuffer===void 0&&F.setupRenderTarget(N)},this.initTexture=function(N){N.isCubeTexture?F.setTextureCube(N,0):N.isData3DTexture?F.setTexture3D(N,0):N.isDataArrayTexture||N.isCompressedArrayTexture?F.setTexture2DArray(N,0):F.setTexture2D(N,0),mt.unbindTexture()},this.resetState=function(){w=0,T=0,S=null,mt.reset(),ft.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ci}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=Zt._getDrawingBufferColorSpace(t),e.unpackColorSpace=Zt._getUnpackColorSpace()}};function vg(n,t,e,i){let s={...n,ships:n.ships.map(M=>({...M})),layouts:[...n.layouts],profiles:[...n.profiles],vertices:t},r={...e,vertices:i},a=new Set(n.ships.map(M=>M.id)),u=e.ships.filter(M=>!a.has(M.id)),m=new Float32Array(t.length+u.reduce((M,y)=>M+y.full.floatCount,0));m.set(t);let x=t.length;for(let M of u)m.set(i.subarray(M.full.offset,M.full.offset+M.full.floatCount),x),s.ships.push({id:M.id,name:M.name,en:M.id.toUpperCase(),code:"FLEET",serial:"",count:0,stats:M.stats,statsSource:"\u5B9E\u65F6\u6218\u6597",levels:[],weapons:[],offset:x,floatCount:M.full.floatCount,relativeLength:M.length}),s.layouts.push(M.layout),s.profiles.push({...n.profiles[2],role:M.name,className:M.id.toUpperCase(),relativeLength:M.length,capital:M.profile.role!=="fighter",maxSpeed:M.profile.speed*8,turnRate:M.profile.turn,primaryName:"\u8230\u8F7D\u4E3B\u6B66\u5668",primaryKind:M.profile.kind,beam:M.profile.beam,mainCooldown:M.profile.cooldown,salvo:0,missileCapacity:0,fixedPrimary:M.profile.fixed,defenseOnly:M.stats[2]===0}),x+=M.full.floatCount;return s.vertices=m,{fleet:s,assets:r}}async function iu({base:n="three-flight-assets/",signal:t,includeBattleModels:e=!0}={}){let i=async(m,x=!1)=>{let M=await fetch(n+m,{signal:t});if(!M.ok)throw Error("\u8230\u961F\u8D44\u6E90\u52A0\u8F7D\u5931\u8D25\uFF1A"+m);return x?new Float32Array(await M.arrayBuffer()):M.json()},[s,r,a,u]=await Promise.all([i("flight-fleet.json"),i("flight-fleet.bin",!0),i("battle-fleet.json"),i("battle-fleet.bin",!0)]);return e?vg(s,r,a,u):{fleet:{...s,vertices:r},assets:{...a,vertices:u}}}var nu=`
float cloudHash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float cloudNoise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(cloudHash(i),cloudHash(i+vec3(1,0,0)),f.x),mix(cloudHash(i+vec3(0,1,0)),cloudHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(cloudHash(i+vec3(0,0,1)),cloudHash(i+vec3(1,0,1)),f.x),mix(cloudHash(i+vec3(0,1,1)),cloudHash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float cloudDensity(vec3 p,float age,float height,float seed){
 // Curl around the cap's rim: material rises inside, rolls out, then down.
 float radial=length(p.xz),dy=p.y-height,theta=atan(dy,radial-.57);
 float roll=age*.75,ringDistance=length(vec2(radial-.57,dy));
 vec3 flow=vec3(p.x,p.y-age*.16,p.z);
 flow.y=height+sin(theta+roll)*ringDistance;
 flow.xz*=max(.1,.57+cos(theta+roll)*ringDistance)/max(radial,.01);
 flow+=vec3(seed*.71,seed*.29,-seed*.43);
 float noise=cloudNoise(flow*4.)*.58+cloudNoise(flow*8.3+3.7)*.28+cloudNoise(flow*17.1)*.14;
 float disruption=(noise-.5)*.78;
 float mature=smoothstep(.3,2.2,age),diffusion=smoothstep(6.,18.,age);
 float cap=length(vec3(p.x,(p.y-height)/mix(.85,.47,mature),p.z));
 cap=1.-smoothstep(.66,1.12+diffusion*.2,cap+disruption);
 float f=clamp(p.y/max(height,.1),0.,1.);
 vec2 bend=vec2(sin(p.y*3.+seed+age*.3),cos(p.y*2.-seed))*.06*f;
 float width=.17+.12*f+.04*sin(f*8.-age*.8);
 float column=(1.-smoothstep(width*.5,width+.11, length(p.xz-bend)+disruption*.22))*smoothstep(-.05,.15,p.y)*(1.-smoothstep(height*.8,height*1.06,p.y));
 column*=mature*(1.-diffusion*.8);
 float density=max(cap,column)*smoothstep(.2+diffusion*.14,.68,noise);
 return density*smoothstep(0.,.09,p.y);
}
vec4 groundCloud(vec3 entry,vec3 eye,float age,float height,float seed){
 vec3 ray=normalize(entry-eye),safe=ray+mix(vec3(-.00001),vec3(.00001),step(vec3(0.),ray));
 vec3 t0=(-vec3(1.)-eye)/safe,t1=(vec3(1.)-eye)/safe;
 vec3 lo=min(t0,t1),hi=max(t0,t1);
 float near=max(0.,max(lo.x,max(lo.y,lo.z))),far=min(hi.x,min(hi.y,hi.z));
 if(far<=near)return vec4(0.);
 float stepSize=(far-near)/48.,jitter=.25+.5*cloudHash(vec3(gl_FragCoord.xy,seed));
 vec3 sum=vec3(0.);float alpha=0.;
 for(int i=0;i<48;i++){
  vec3 q=eye+ray*(near+(float(i)+jitter)*stepSize);
  vec3 p=vec3(q.x*1.6,(q.y+1.)*.5*(height+.95),q.z*1.6);
  float density=cloudDensity(p,age,height,seed);
  if(density>.008){
   float lightDensity=cloudDensity(p+vec3(-.13,.23,.09),age,height,seed);
   float lighting=clamp(.52+(density-lightDensity)*3.2,.12,1.);
   vec3 smoke=mix(vec3(.11,.12,.13),vec3(.64,.62,.59),lighting);
   float heat=exp(-max(0.,age-.18)*1.5)*(.6+density*.9);
   vec3 fire=mix(vec3(1.5,.17,.015),vec3(4.,2.6,.65),clamp(density*2.,0.,1.));
   vec3 color=mix(smoke,fire,clamp(heat,0.,1.));
   float a=1.-exp(-density*stepSize*9.*uOpacity);
   sum+=(1.-alpha)*a*color;alpha+=(1.-alpha)*a;
   if(alpha>.98)break;
  }
 }
 return vec4(sum/max(alpha,.001),alpha);
}
`;function su(n){let t=Math.max(0,n),e=Math.max(0,t-.45),i=Math.max(0,t-6),s=Math.max(0,Math.min(1,(18-t)/8));return{radius:12+43*(1-Math.exp(-t*.8))+i*3,height:9+119*(1-Math.exp(-e*.4))+i*1.4,heat:Math.exp(-Math.max(0,t-.2)*1.5),flash:Math.exp(-t*7),shockRadius:8+150*(1-Math.exp(-t*1.1)),shockOpacity:Math.max(0,1-t/3.2)**2,opacity:Math.min(1,t*12)*s*s,spread:i}}var pn={radius:81.36,spacing:108,vertexRadius:59.04,centerHeight:43.2,vertexHeight:33.12,scale:.72,smallScale:.2,smallVertexRadius:16.4,smallCenterHeight:12,smallVertexHeight:9.2,orbitScale:1.3};var _g=[[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]];function fo(n,t){let e=t-1,i=e*Math.PI/3;return{x:n.x+(t?Math.cos(i)*pn.vertexRadius:0),y:n.y+(t?pn.vertexHeight:pn.centerHeight),z:n.z+(t?Math.sin(i)*pn.vertexRadius:0)}}function ru(n){let t=new Map(n.map(i=>[`${i.q}:${i.r}`,i])),e=[];for(let i of n)for(let[s,r]of _g.slice(0,3)){let a=t.get(`${i.q+s}:${i.r+r}`);a&&e.push([i,a])}return e}function Yl(n,t=1,e=!1){let i=new n,s=[.44,.48,.5],r=[.62,.65,.65],a=[.75,.75,.69],u=[.16,.22,.25],m=[.29,.36,.39],x=[.3,.78,.91],M=[.86,.64,.23],y=(v,A,P,C,d,b,R)=>{for(let L=0;L<6;L++){let g=L*Math.PI/3,w=(L+1)*Math.PI/3,T=(S,I,D)=>[v+Math.cos(D)*S,I,A+Math.sin(D)*S];i.quad(T(d,P,g),T(b,C,g),T(b,C,w),T(d,P,w),R),i.tri([v,C,A],T(b,C,w),T(b,C,g),R)}},h=(v,A,P,C,d,b=r,R=0)=>i.box(C,[Math.cos(d)*v-Math.sin(d)*A,P,Math.sin(d)*v+Math.cos(d)*A],b,0,[0,-d,0],R);y(0,0,-20,5,113,113,s),y(0,0,5,31,113,102,r),y(0,0,31,35,104,104,u),y(0,0,35,38,105,103,a),y(0,0,38,39,99,99,m),y(0,0,39,53,35,30,r),y(0,0,53,57,32,32,u),y(0,0,57,60,33,33,a);for(let v=0;v<6;v++){let A=v*Math.PI/3,P=A+Math.PI/6;y(Math.cos(A)*82,Math.sin(A)*82,37,43,23,20,r),y(Math.cos(A)*82,Math.sin(A)*82,43,46,21,21,a),h(93,0,18,[3,23,21],P,u),h(95,0,17,[2,19,15],P,m),h(96,0,17,[1,17,.6],P,u);for(let C of[-12,12])h(94,C,18,[8,29,4],P,s),h(98,C,19,[1,19,1.2],P,x,1);h(96,0,32,[5,4,30],P,a),h(98,0,29,[1,1,10],P,M);for(let C of[-37,-24,24,37]){h(93,C,17,[10,29,4],P,s),h(96,C,26,[6,7,5],P,a);for(let d of[9,15,21])h(98,C,d,[.7,1.1,3],P,u)}for(let C of[-31,31])for(let d of[12,23]){h(94,C,d,[2,8,8],P,m),h(95.2,C,d,[.7,6.5,6.5],P,r);for(let b of[-2,2])h(95.7,C+b,d+2,[.6,.7,.7],P,u)}for(let C of[-27,27]){h(89,C,41,[5,7,26],P,r),h(89,C,45,[6,1.5,27],P,a),h(92,C,41,[1,1.2,15],P,x,1),h(64,C,41,[13,5,13],P,s);for(let d=-4;d<=4;d+=2)h(64+d,C,44,[1,1,11],P,u)}h(57,0,39.5,[43,1,14],P,u);for(let C of[-8,8])h(57,C,40,[42,.8,.7],P,a);for(let C=0;C<5;C++)h(36+C*4,13,60.2,[2,.4,3],A,M);h(94,0,48,[4,5,4],A,m),h(94,0,51,[3,1,3],A,x,1)}let o=new n;y(0,0,-31,-20,74,113,m);for(let v=0;v<6;v++){let A=v*Math.PI/3,P=(v+1)*Math.PI/3;i.tri([0,-31,0],[Math.cos(A)*74,-31,Math.sin(A)*74],[Math.cos(P)*74,-31,Math.sin(P)*74],u),h(48,0,-31,[15,1,5],A,x,1),e&&y(Math.cos(A)*82,Math.sin(A)*82,43,46,24/t,24/t,a)}o.box([1,17,23],[.5,22,0],s),o.box([1,3,25],[.5,32,0],a),o.box([1,1,16],[.5,34,0],u);for(let v of[-11,11])o.box([1,6,2],[.5,36,v],r),o.box([1,.6,.5],[.5,39.3,v],x,0,[0,0,0],1);let l=new n,p=[.19,.19,.18],c=[.28,.27,.24],f=[.39,.38,.33],E=[.12,.15,.16];for(let v=0;v<6;v++){let A=v*Math.PI/3,P=(v+1)*Math.PI/3,C=(d,b,R)=>[Math.cos(R)*d,b,Math.sin(R)*d];l.quad(C(113,-20,A),C(106,10,A),C(106,10,P),C(113,-20,P),c),l.tri([0,8,0],C(106,10,P),C(106,10,A),p);for(let d=0;d<3;d++){let b=A+(d+.5)*Math.PI/9,R=91,L=10+(v*13+d*7)%17;(v+d)%3!==0&&(l.box([7,L,21],[Math.cos(b)*R,10+L/2,Math.sin(b)*R],f,0,[.12,-b,.12]),l.box([1,L+7,1],[Math.cos(b)*88,10+L/2,Math.sin(b)*88],E,0,[.15,-b,.22]))}}for(let v=0;v<64;v++){let A=v*2.399963,P=16+Math.sqrt(v*37%101)*8.3,C=5+v*11%14;l.box([C,3+v%7,C*.7],[Math.cos(A)*P,12+v%3*2,Math.sin(A)*P],v%3?c:f,0,[v*.23,A,.15+v%4*.17])}l.box([40,7,34],[-6,20,3],f,0,[.3,.4,-.2]),l.box([24,10,22],[13,15,-10],E,0,[.1,.8,.4]);let _=new n;_.box([1,10,23],[.5,17,0],c);for(let v=0;v<5;v++)_.box([.13,3,18],[.1+v*.2,23,(v%2*2-1)*3],f,0,[.12,0,(v%2?1:-1)*.15]);for(let v of[i,l])for(let A=0;A<v.data.length;A+=13)for(let P=0;P<3;P++)v.data[A+P]*=t;for(let v of[o,_])for(let A=0;A<v.data.length;A+=13)v.data[A+1]*=t,v.data[A+2]*=t;return{module:i.upload(),bridge:o.upload(),wreck:l.upload(),brokenBridge:_.upload()}}var Mg=n=>n==="Small_Shield_Dome"||n==="Large_Shield_Dome";function Zl(n,t,e){let i=n?.fortress?.modules||[],s=new Map,r=new Map,a=new Map;for(let x of t){if(!x.profile.ground)continue;let M=e[x.id];if(!M)continue;let y=x.fortressSlot?.module??i.reduce((o,l)=>Math.hypot(l.x-M[1],l.z-M[3])<o.distance?{index:l.index,distance:Math.hypot(l.x-M[1],l.z-M[3])}:o,{index:-1,distance:1/0}).index,h=s.get(y)||{total:0,alive:0};if(h.total++,M[6]>0&&h.alive++,s.set(y,h),n.fortress.version>=2){let o=i[y],l=x.fortressSlot?.socket??o?.sockets.reduce((f,E,_)=>{let v=fo(o,_),A=Math.hypot(v.x-M[1],v.z-M[3]);return E&&A<f.distance?{index:_,distance:A}:f},{index:-1,distance:1/0}).index,p=`${y}:${l}`,c=r.get(p)||{total:0,alive:0};c.total++,M[6]>0&&c.alive++,r.set(p,c)}if(Mg(x.type)&&M[6]>0&&M[7]>0){let o=a.get(x.side)||{side:x.side,owner:x.owner,charge:0,capacity:0};o.charge+=M[7],o.capacity+=x.maxShield,a.set(x.side,o)}}let u=new Set([...s].filter(([,x])=>x.total>0&&!x.alive).map(([x])=>x)),m=new Set([...r].filter(([,x])=>x.total>0&&!x.alive).map(([x])=>x));return{destroyed:u,destroyedSockets:m,fields:[...a.values()]}}function po(n){let t=new ge,e=new en(n instanceof Float32Array?n:new Float32Array(n),13);for(let[i,s,r]of[["aPosition",3,0],["aNormal",3,3],["aColor",3,6],["aEmission",1,9],["aTag",1,10],["aUV",2,11]])t.setAttribute(i,new nn(e,s,r));return t.setAttribute("position",t.getAttribute("aPosition")),t.computeBoundingSphere(),t}function au(n,t,e,i={}){let{raw:s=!0,...r}=i,a=s?an:ze;return new a({vertexShader:n,fragmentShader:t,uniforms:e,side:Ee,toneMapped:!1,...r})}var ou=(()=>{let n=Math.PI*2,t=(y,h,o)=>Math.max(h,Math.min(o,y)),e=(y,h,o)=>y+(h-y)*o,i={add:(y,h)=>y.map((o,l)=>o+h[l]),sub:(y,h)=>y.map((o,l)=>o-h[l]),scale:(y,h)=>y.map(o=>o*h),dot:(y,h)=>y[0]*h[0]+y[1]*h[1]+y[2]*h[2],cross:(y,h)=>[y[1]*h[2]-y[2]*h[1],y[2]*h[0]-y[0]*h[2],y[0]*h[1]-y[1]*h[0]],length:y=>Math.hypot(...y),norm:y=>{let h=Math.hypot(...y)||1;return y.map(o=>o/h)}},s={identity:()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),mul:(y,h)=>{let o=new Float32Array(16);for(let l=0;l<4;l++)for(let p=0;p<4;p++)o[l*4+p]=y[p]*h[l*4]+y[4+p]*h[l*4+1]+y[8+p]*h[l*4+2]+y[12+p]*h[l*4+3];return o},translate:(y,h,o)=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,y,h,o,1]),scale:(y,h=y,o=y)=>new Float32Array([y,0,0,0,0,h,0,0,0,0,o,0,0,0,0,1]),rx:y=>{let h=Math.cos(y),o=Math.sin(y);return new Float32Array([1,0,0,0,0,h,o,0,0,-o,h,0,0,0,0,1])},ry:y=>{let h=Math.cos(y),o=Math.sin(y);return new Float32Array([h,0,-o,0,0,1,0,0,o,0,h,0,0,0,0,1])},rz:y=>{let h=Math.cos(y),o=Math.sin(y);return new Float32Array([h,o,0,0,-o,h,0,0,0,0,1,0,0,0,0,1])},compose:(y=[0,0,0],h=[0,0,0],o=[1,1,1])=>s.mul(s.translate(...y),s.mul(s.ry(h[1]),s.mul(s.rx(h[0]),s.mul(s.rz(h[2]),s.scale(...o))))),transform:(y,h)=>[y[0]*h[0]+y[4]*h[1]+y[8]*h[2]+y[12],y[1]*h[0]+y[5]*h[1]+y[9]*h[2]+y[13],y[2]*h[0]+y[6]*h[1]+y[10]*h[2]+y[14]],perspective:(y,h,o,l,p=0)=>{let c=1/Math.tan(y/2),f=1/(o-l);return new Float32Array([c/h,0,0,0,0,c,0,0,p,0,(l+o)*f,-1,0,0,2*l*o*f,0])},lookAt:(y,h,o=[0,1,0])=>{let l=i.norm(i.sub(y,h)),p=i.norm(i.cross(o,l)),c=i.cross(l,p);return new Float32Array([p[0],c[0],l[0],0,p[1],c[1],l[1],0,p[2],c[2],l[2],0,-i.dot(p,y),-i.dot(c,y),-i.dot(l,y),1])},camera:(y,h,o)=>{let l=i.scale(h,-1),p=i.norm(i.cross(o,l)),c=i.cross(l,p);return new Float32Array([...p,0,...c,0,...l,0,...y,1])}};function r(y=123){return()=>(y=Math.imul(1664525,y)+1013904223|0,(y>>>0)/4294967296)}function a(y){return[(y>>16&255)/255,(y>>8&255)/255,(y&255)/255]}let u={hull:a(11908267),light:a(13750469),shade:a(8555147),dark:a(2503482),inner:a(1121571),steel:a(6187886),red:a(7553595),window:a(14867393),blue:a(8900063)};class m{constructor(){this.data=[]}vertex(h,o,l,p,c,f){this.data.push(...h,...o,...l,p,c,...f)}tri(h,o,l,p=u.hull,c=0,f=0,E=null,_=null){let v=i.norm(i.cross(i.sub(o,h),i.sub(l,h)));return[h,o,l].forEach((A,P)=>this.vertex(A,E?E[P]:v,p,c,f,_?_[P]:[0,0])),this}quad(h,o,l,p,c,f=0,E=0){return this.tri(h,o,l,c,f,E,null,[[0,0],[1,0],[1,1]]),this.tri(h,l,p,c,f,E,null,[[0,0],[1,1],[0,1]]),this}box(h,o,l=u.hull,p=0,c=[0,0,0],f=0){let[E,_,v]=h.map(C=>C/2),A=s.compose(o,c),P=[[-E,-_,-v],[E,-_,-v],[E,_,-v],[-E,_,-v],[-E,-_,v],[E,-_,v],[E,_,v],[-E,_,v]].map(C=>s.transform(A,C));return[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[0,1,5,4],[3,7,6,2]].forEach(C=>this.quad(...C.map(d=>P[d]),l,f,p)),this}hull(h,o=[0,0,0],l=u.hull,p=0){let c=h.map(([f,E,_])=>{let v=Math.min(E,_)*.2;return[[_/2,-E/2+v],[_/2,E/2-v],[_/2-v,E/2],[-_/2+v,E/2],[-_/2,E/2-v],[-_/2,-E/2+v],[-_/2+v,-E/2],[_/2-v,-E/2]].map(([A,P])=>[f+o[0],A+o[1],P+o[2]])});for(let f=0;f<c.length-1;f++)for(let E=0;E<8;E++){let _=(E+1)%8;this.quad(c[f][E],c[f][_],c[f+1][_],c[f+1][E],l,0,p)}for(let f=1;f<7;f++){this.tri(c[0][0],c[0][f+1],c[0][f],l,0,p);let E=c.at(-1);this.tri(E[0],E[f],E[f+1],l,0,p)}return this}chamfer(h,o,l=u.hull,p=0){let[c,f,E]=h,_=Math.min(c,f,E)*.18;return this.hull([[-c/2,E-_*2,f-_*2],[-c/2+_,E,f],[c/2-_,E,f],[c/2,E-_*2,f-_*2]],o,l,p)}cylinder(h,o,l,p=u.steel,c=14,f=0,E=0,_=h){let[v,A,P]=l;for(let C=0;C<c;C++){let d=n*C/c,b=n*(C+1)/c,R=[v-o/2,A+Math.sin(d)*h,P+Math.cos(d)*h],L=[v-o/2,A+Math.sin(b)*h,P+Math.cos(b)*h],g=[v+o/2,A+Math.sin(b)*_,P+Math.cos(b)*_],w=[v+o/2,A+Math.sin(d)*_,P+Math.cos(d)*_];this.quad(R,L,g,w,p,E,f),this.tri([v-o/2,A,P],L,R,p,E,f),this.tri([v+o/2,A,P],w,g,p,E,f)}return this}beam(h,o,l,p,c=u.dark){let f=i.sub(o,h),E=i.length(f),_=i.norm(f),v=Math.abs(_[1])>.95?[1,0,0]:[0,1,0],A=i.norm(i.cross(_,v)),P=i.cross(A,_),C=[];return[h,o].forEach(d=>[[-1,-1],[-1,1],[1,1],[1,-1]].forEach(([b,R])=>C.push(i.add(d,i.add(i.scale(A,b*l/2),i.scale(P,R*p/2)))))),[[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]].forEach(d=>this.quad(...d.map(b=>C[b]),c)),this}sphere(h=1,o=56,l=28){let p=(c,f)=>{let E=c/o*n,_=f/l*Math.PI;return[Math.sin(_)*Math.cos(E),Math.cos(_),Math.sin(_)*Math.sin(E)]};for(let c=0;c<l;c++)for(let f=0;f<o;f++){let E=[p(f,c),p(f+1,c),p(f+1,c+1),p(f,c+1)],_=E.map(v=>i.scale(v,h));this.tri(_[0],_[1],_[2],u.hull,0,0,[E[0],E[1],E[2]]),this.tri(_[0],_[2],_[3],u.hull,0,0,[E[0],E[2],E[3]])}return this}upload(h){let o=new Float32Array(this.data),l=h.createBuffer();h.bindBuffer(h.ARRAY_BUFFER,l),h.bufferData(h.ARRAY_BUFFER,o,h.STATIC_DRAW);let p=[];for(let f=0;f<o.length;f+=39)for(let[E,_]of[[0,1],[1,2],[2,0]])p.push(...o.slice(f+E*13,f+E*13+13)),p.push(...o.slice(f+_*13,f+_*13+13));let c=h.createBuffer();return h.bindBuffer(h.ARRAY_BUFFER,c),h.bufferData(h.ARRAY_BUFFER,new Float32Array(p),h.STATIC_DRAW),{buffer:l,count:o.length/13,lineBuffer:c,lineCount:p.length/13}}}class x{constructor(h){this.spec=h,this.groups={};for(let o of["floor","walls","roof","furniture","trim","crew","glass","screens","labels","holo"])this.groups[o]=new m;this.group="furniture",this.obstacles=[],this.P={floor:a(2634813),panel:a(7569802),pale:a(12042433),dark:a(1516334),black:a(528150),metal:a(4610150),seat:a(2702665),edge:a(9478310),accent:a(h.accent),white:a(14870239),amber:a(14526567)}}use(h){return this.group=h,this}get g(){return this.groups[this.group]}solid(h,o,l=this.P.panel,p=[0,0,0],c=.055,f=0){let[E,_,v]=h,A=Math.min(c,E*.24,_*.24,v*.24);if(Math.min(E,_,v)<=0)return;let P=s.compose(o,p),C=this.g,d=(R,L,g)=>{let w=Math.min(A,L*.2,g*.2);return[[-L/2+w,R,-g/2],[L/2-w,R,-g/2],[L/2,R,-g/2+w],[L/2,R,g/2-w],[L/2-w,R,g/2],[-L/2+w,R,g/2],[-L/2,R,g/2-w],[-L/2,R,-g/2+w]].map(T=>s.transform(P,T))},b=[d(-_/2,E-2*A,v-2*A),d(-_/2+A,E,v),d(_/2-A,E,v),d(_/2,E-2*A,v-2*A)];for(let R=0;R<3;R++)for(let L=0;L<8;L++)C.quad(b[R][L],b[R][(L+1)%8],b[R+1][(L+1)%8],b[R+1][L],l,f);for(let R=1;R<7;R++)C.tri(b[0][0],b[0][R+1],b[0][R],l,f),C.tri(b[3][0],b[3][R],b[3][R+1],l,f);return this}box(h,o,l=this.P.panel,p=0,c=[0,0,0]){return this.g.box(h,o,l,0,c,p),this}beam(h,o,l,p=this.P.metal,c=0,f=l){let E=this.g.data.length;if(this.g.beam(h,o,l,f,p),c)for(let _=E+9;_<this.g.data.length;_+=13)this.g.data[_]=c;return this}cylinder(h,o,l,p=this.P.metal,c=24,f=0,E=h){let[_,v,A]=l,P=this.g;for(let C=0;C<c;C++){let d=C/c*n,b=(C+1)/c*n,R=[_+Math.cos(d)*h,v,A+Math.sin(d)*h],L=[_+Math.cos(b)*h,v,A+Math.sin(b)*h],g=[_+Math.cos(d)*E,v+o,A+Math.sin(d)*E],w=[_+Math.cos(b)*E,v+o,A+Math.sin(b)*E];P.quad(R,g,w,L,p,f),P.tri([_,v+o,A],w,g,p,f),P.tri([_,v,A],R,L,p,f)}return this}ring(h,o,l,p,c=0,f=0,E=this.P.accent,_=0,v=0,A=n,P=72){for(let C=0;C<P;C++){let d=v+(A-v)*C/P,b=v+(A-v)*(C+1)/P,R=(g,w,T)=>[c+Math.cos(T)*g,w,f+Math.sin(T)*g],L=this.g;L.quad(R(h,l,d),R(h,l,b),R(o,l,b),R(o,l,d),E,_),L.quad(R(h,l+p,d),R(o,l+p,d),R(o,l+p,b),R(h,l+p,b),E,_),L.quad(R(o,l,d),R(o,l,b),R(o,l+p,b),R(o,l+p,d),E,_),L.quad(R(h,l,b),R(h,l,d),R(h,l+p,d),R(h,l+p,b),E,_)}return this}sphere(h,o,l=this.P.accent,p=0){let c=this.g,f=(E,_)=>[h[0]+o*Math.sin(_)*Math.cos(E),h[1]+o*Math.cos(_),h[2]+o*Math.sin(_)*Math.sin(E)];for(let E=0;E<10;E++)for(let _=0;_<16;_++)c.quad(f(_/16*n,E/10*Math.PI),f((_+1)/16*n,E/10*Math.PI),f((_+1)/16*n,(E+1)/10*Math.PI),f(_/16*n,(E+1)/10*Math.PI),l,p);return this}plane(h,o,l,p,c,f=0){let E=s.compose(h,p),_=[[-o/2,-l/2,0],[o/2,-l/2,0],[o/2,l/2,0],[-o/2,l/2,0]].map(v=>s.transform(E,v));return this.g.quad(..._,c,f),this}panel(h,o,l,p=[-.3,0,0],c=0){let f=this.group,E=this.P,_=s.compose(h,p),v=R=>s.transform(_,R);this.use("furniture").solid([o+.16,l+.16,.12],h,E.dark,p,.05),this.box([o+.06,l+.06,.026],v([0,0,.069]),E.black,0,p),this.use("screens");let A=[[-o/2,-l/2,.088],[o/2,-l/2,.088],[o/2,l/2,.088],[-o/2,l/2,.088]].map(v),P=c%4/4+.004,C=(c%4+1)/4-.004,d=1-(Math.floor(c/4)+1)/2+.009,b=1-Math.floor(c/4)/2-.009;this.g.tri(A[0],A[1],A[2],E.accent,1,0,null,[[P,d],[C,d],[C,b]]),this.g.tri(A[0],A[2],A[3],E.accent,1,0,null,[[P,d],[C,b],[P,b]]),this.use("trim");for(let R of[-1,1])this.box([.025,.025,.025],v([R*(o/2+.05),l/2+.055,.072]),E.edge,.1,p);return this.box([o*.2,.014,.018],v([-o*.32,-l/2-.055,.07]),E.accent,.8,p),this.use(f),this}label(h,o,l,p,c=0){let f=this.group;this.use("labels");let E=s.compose(h,p),_=[[-o/2,-l/2,0],[o/2,-l/2,0],[o/2,l/2,0],[-o/2,l/2,0]].map(d=>s.transform(E,d)),v=c%4/4+.004,A=(c%4+1)/4-.004,P=1-(Math.floor(c/4)+1)/4+.006,C=1-Math.floor(c/4)/4-.006;return this.g.tri(_[0],_[1],_[2],this.P.white,1,0,null,[[v,P],[A,P],[A,C]]),this.g.tri(_[0],_[2],_[3],this.P.white,1,0,null,[[v,P],[A,C],[v,C]]),this.use(f),this}chair(h,o,l,p=0,c=1,f=!1){let E=this.group,_=this.P,v=s.compose([h,o,l],[0,p,0],[c,c,c]),A=(P,C,d,b=0)=>this.solid(P.map(R=>R*c),s.transform(v,C),d,[b,p,0],.05*c);this.use("furniture"),A([.54,.12,.57],[0,.51,0],_.dark),A([.46,.12,.49],[0,.59,-.02],_.seat),A([.53,.82,.17],[0,.99,.23],_.dark,-.09),A([.42,.67,.085],[0,1.03,.125],_.seat,-.09),A([.4,.22,.16],[0,1.53,.24],_.dark),A([.32,.16,.07],[0,1.55,.145],_.seat),A([.16,.45,.16],[0,.25,.04],_.metal);for(let P of[-1,1])A([.095,.25,.11],[P*.35,.66,.08],_.metal),A([.13,.11,.54],[P*.35,.81,-.04],_.dark),A([.018,.025,.22],[P*.35,.877,-.12],_.accent),A([.055,.025,.05],[P*.35,.88,-.28],_.amber);for(let P=0;P<5;P++){let C=P/5*n;this.beam(s.transform(v,[0,.09,.04]),s.transform(v,[Math.sin(C)*.42,.09,Math.cos(C)*.42]),.065*c,_.metal)}return f&&(A([.64,1.18,.12],[0,1.09,.39],_.metal),A([.54,.045,.022],[0,1.58,.466],_.accent)),this.use(E),this}person(h,o,l,p=0,c=!0){let f=this.group;this.use("crew");let E=this.P,_=s.compose([h,o,l],[0,p,0]),v=d=>s.transform(_,d),A=a(4280410),P=a(1450795),C=a(9474438);this.solid([.39,.5,.25],v([0,c?1.05:1.21,0]),A,[.04,p,0],.075),this.sphere(v([0,c?1.49:1.66,-.015]),.135,C),this.solid([.41,.075,.26],v([0,c?1.28:1.45,0]),E.dark,[0,p,0],.025);for(let d of[-1,1]){let b=[d*.22,c?1.2:1.4,0],R=[d*.25,c?.91:1.12,-.1],L=[d*.25,c?.89:.92,c?-.36:-.07];this.beam(v(b),v(R),.12,A),this.beam(v(R),v(L),.1,A),this.sphere(v(L),.055,C),c?(this.beam(v([d*.13,.78,0]),v([d*.14,.61,-.4]),.16,A),this.beam(v([d*.14,.61,-.4]),v([d*.14,.15,-.45]),.12,A),this.solid([.17,.13,.3],v([d*.14,.09,-.51]),P,[0,p,0])):(this.beam(v([d*.11,.96,0]),v([d*.15,.17,-.02]),.15,A),this.solid([.17,.14,.31],v([d*.15,.08,-.1]),P,[0,p,0]))}return this.box([.08,.043,.013],v([.095,c?1.18:1.34,-.133]),E.accent,.6,[0,p,0]),this.use(f),this}station(h,o,l,p=0,c=0,f=!1,E=2.2){let _=this.P,v=s.compose([h,o,l],[0,p,0]),A=d=>s.transform(v,d),P=this.group;this.use("furniture"),this.solid([E,.19,1.05],A([0,.91,0]),_.panel,[0,p,0],.1);for(let d of[-1,1])this.solid([.21,.87,.72],A([d*(E/2-.2),.43,.06]),_.dark,[0,p,0],.06);this.solid([E*.91,.08,.68],A([0,1.055,.09]),_.black,[-.07,p,0],.03),this.panel(A([0,1.34,-.33]),E*.7,.51,[-.38,p,0],c);for(let d=0;d<10;d++)this.box([.09,.015,.045],A([-.51+d*.115,1.105,.31]),d<3?_.accent:_.edge,d<3?.7:0,[0,p,0]);for(let d of[-1,1])this.box([.085,.018,.065],A([d*(E/2-.23),1.106,.2]),_.amber,.65,[0,p,0]),this.box([.055,.075,.055],A([d*(E/2-.23),1.14,.35]),_.dark,0,[0,p,0]);let C=A([0,0,1.05]);return this.chair(...C,p),f&&this.person(...C,p,!0),this.obstacles.push({x:h,z:l,rx:E/2,rz:.6}),this.use(P),this}rail(h,o,l,p=this.P.metal,c=!1){let f=this.group;this.use("trim");let E=i.length(i.sub(o,h)),_=Math.ceil(E/2.4);for(let v=0;v<=_;v++){let A=h.map((P,C)=>e(P,o[C],v/_));this.beam([A[0],l,A[2]],[A[0],l+1.05,A[2]],.047,p)}return this.beam([h[0],l+1.04,h[2]],[o[0],l+1.04,o[2]],.07,p),this.beam([h[0],l+.17,h[2]],[o[0],l+.17,o[2]],.037,p),c&&(this.use("glass"),this.g.quad([h[0],l+.2,h[2]],[o[0],l+.2,o[2]],[o[0],l+.97,o[2]],[h[0],l+.97,h[2]],this.P.accent,.1)),this.use(f),this}stairs(h,o,l,p,c,f,E=0){let _=this.group;this.use("floor");for(let v=0;v<p;v++)this.solid([l,(v+1)*c,f+.012],[h,E+(v+1)*c/2,o+v*f],this.P.floor,[0,0,0],.02),this.box([l-.14,.021,.04],[h,E+(v+1)*c+.012,o+v*f-f*.36],this.P.accent,.7);return this.use(_),this}tiles(h,o,l,p=0,c=1.8){let f=this.group;this.use("floor"),this.box([h,.24,l-o],[0,p-.12,(o+l)/2],this.P.dark);for(let E=-h/2+c/2;E<h/2;E+=c)for(let _=o+c/2;_<l;_+=c)this.box([Math.min(c-.045,h/2-E+c/2-.05),.022,Math.min(c-.045,l-_+c/2-.05)],[E,p+.011,_],this.P.floor),(Math.round((E+h/2)/c)+Math.round((_-o)/c))%3===0&&this.box([.07,.006,.18],[E-c*.34,p+.026,_-c*.33],this.P.metal);return this.use(f),this}door(h,o,l,p,c,f=0){let E=this.group,_=this.P,v=s.compose([h,o,l],[0,f,0]),A=P=>s.transform(v,P);this.use("walls"),this.solid([p+.75,c+.48,.32],A([0,c/2,0]),_.dark,[0,f,0],.1);for(let P of[-1,1])this.solid([p/2-.035,c-.15,.11],A([P*p/4,c/2,.21]),_.metal,[0,f,0],.065),this.solid([p*.27,c*.61,.042],A([P*p*.26,c*.5,.286]),_.panel,[0,f,0],.045),this.box([.024,c*.84,.032],A([P*(p/2+.13),c/2,.21]),_.accent,.95,[0,f,0]);return this.label(A([0,c+.12,.22]),p,.28,[0,f,0],3),this.label(A([0,c*.65,.312]),p*.56,.31,[0,f,0],8),this.use(E),this}cabinet(h,o,l,p=0){let c=this.group,f=this.P,E=s.compose([h,o,l],[0,p,0]),_=v=>s.transform(E,v);this.use("furniture"),this.solid([1.25,2.25,.65],_([0,1.125,0]),f.dark,[0,p,0],.075),this.solid([1.1,2.09,.05],_([0,1.14,.34]),f.panel,[0,p,0],.035);for(let v=0;v<8;v++)this.box([.8,.045,.025],_([0,.48+v*.083,.381]),f.black,0,[0,p,0]);return this.panel(_([0,1.66,.41]),.72,.31,[0,p,0],2),this.box([.045,.45,.048],_([.44,1.28,.4]),f.metal,0,[0,p,0]),this.use(c),this}window(h,o,l,p){let c=this.group,f=this.P;return this.use("walls"),this.beam([h[0],l-.1,h[1]],[o[0],l-.1,o[1]],.34,f.metal,0,.38),this.beam([h[0],p+.1,h[1]],[o[0],p+.1,o[1]],.4,f.panel,0,.4),this.beam([h[0],l,h[1]],[h[0],p,h[1]],.19,f.dark,0,.3),this.beam([h[0],l,h[1]],[h[0],p,h[1]],.047,f.edge,0,.33),this.use("glass"),this.g.quad([h[0],l,h[1]],[o[0],l,o[1]],[o[0],p,o[1]],[h[0],p,h[1]],f.accent,0),this.use(c),this}holo(h,o,l,p=1){let c=this.group,f=this.P;this.use("holo");for(let _=1;_<6;_++){let v=_/6*Math.PI,A=Math.sin(v)*p,P=o+Math.cos(v)*p;this.ring(A-.012,A+.012,P,.012,h,l,f.accent,1,0,n,64)}for(let _=0;_<6;_++){let v=_/6*Math.PI;for(let A=0;A<60;A++){let P=A/60*n,C=(A+1)/60*n;this.beam([h+Math.cos(v)*Math.cos(P)*p,o+Math.sin(P)*p,l+Math.sin(v)*Math.cos(P)*p],[h+Math.cos(v)*Math.cos(C)*p,o+Math.sin(C)*p,l+Math.sin(v)*Math.cos(C)*p],.012,f.accent,1)}}this.ring(p*1.15,p*1.15+.025,o-p*.45,.016,h,l,f.accent,1);let E=r(870);for(let _=0;_<23;_++){let v=E()*n,A=E()*Math.PI,P=p*(.65+E()*.45);this.sphere([h+Math.cos(v)*Math.sin(A)*P,o+Math.cos(A)*P,l+Math.sin(v)*Math.sin(A)*P],p*.028,_%4===0?f.amber:f.white,.9)}return this.use(c),this}table(h,o,l,p=1.5,c=!0){let f=this.group,E=this.P;this.use("furniture"),this.cylinder(p*.72,.55,[h,o,l],E.dark,8),this.cylinder(p,.22,[h,o+.55,l],E.metal,8),this.cylinder(p*.91,.035,[h,o+.786,l],E.black,48),this.ring(p*.78,p*.8,o+.83,.014,h,l,E.accent,.7),this.ring(p*.96,p*.98,o+.76,.025,h,l,E.accent,.9);for(let _=0;_<8;_++){let v=_/8*n;this.panel([h+Math.sin(v)*p*.85,o+.9,l+Math.cos(v)*p*.85],p*.44,p*.22,[-1.08,v,0],_%8)}return c&&this.holo(h,o+1.5,l,p*.43),this.use(f),this}}function M(){let y=new x({accent:9155261}),h=y.P;Object.assign(h,{floor:a(3753294),panel:a(4281184),pale:a(8491932),dark:a(1385519),black:a(462615),metal:a(6452352),seat:a(2108986),edge:a(9018532),accent:a(8567239),white:a(14933968),amber:a(14070662)}),y.tiles(32,-8.5,34,0,2),y.use("floor").solid([10,1.7,6],[0,.85,5.2],h.floor,[0,0,0],.12);for(let o of[-1,1])y.solid([2.95,1,5.8],[o*3.5,.5,.35],h.floor,[0,0,0],.1),y.solid([9.1,1.15,11.6],[o*10.15,.575,-2.4],h.dark,[0,0,0],.08);y.stairs(0,-4.8,3.6,8,.2125,.6),y.stairs(0,8.4,5.1,6,.2,.54,.5),y.window([-14,-8.55],[14,-8.55],1.14,7.75),y.use("walls").solid([30,1.52,.64],[0,8.65,-8.55],h.dark,[0,0,0],.1),y.use("trim").beam([-13.8,7.74,-8.15],[13.8,7.74,-8.15],.036,h.white,.78);for(let o of[-1,1]){y.window([o*14,-8.55],[o*16,-3.5],1.14,7.75),y.use("walls").solid([.65,9.45,37.5],[o*16,4.7,15.3],h.dark,[0,0,0],.1),y.solid([2.2,3.9,.42],[o*10.6,3.07,-7.9],h.panel,[0,-o*.27,0],.14),y.solid([1.83,3.54,.08],[o*10.54,3.1,-7.59],h.dark,[0,-o*.27,0],.04),y.label([o*10.5,3.1,-7.48],1.4,.8,[0,-o*.27,0],o<0?0:9),y.beam([o*10.2,1,-8.5],[o*13.2,7.75,-8.5],.28,h.metal,0,.45),y.beam([o*10.2,1,-8.37],[o*13.2,7.75,-8.37],.055,h.edge,0,.1),y.use("walls").solid([15,1.07,.58],[o*7.5,.55,-8.4],h.panel,[0,0,0],.08),y.use("trim").beam([o*1.92,.055,-7.9],[o*1.92,.055,-4.6],.032,h.white,.68);for(let l=0;l<3;l++)y.station(o*(5.2+l*3),1.15,-7.1,-o*.045,l%2===0?2:3,!0,2.7);for(let l=0;l<4;l++)y.station(o*(l%2===0?10.4:7.4),.1,3.7+l*5.35,-o*.25,(l+4)%8,l!==2,3.25);y.use("floor").solid([4.3,2.05,17.7],[o*12.9,1.025,24.8],h.floor,[0,0,0],.08);for(let l of[19,24.5,30])y.station(o*13,2.05,l,-o*Math.PI/2,4,!0,2.6);y.rail([o*10.66,0,16.1],[o*10.66,0,33],2.05,h.metal,!0),y.stairs(o*12.8,11.4,3.6,8,.25625,.54);for(let l=0;l<6;l++){let p=1+l*5.5;y.use("walls").solid([.22,6.4,5.14],[o*15.61,4.54,p],h.panel,[0,0,0],.1),y.solid([.32,1.8,4.96],[o*15.45,1,p],h.dark,[0,0,0],.04),y.beam([o*15.46,.05,p-2.68],[o*15.46,7.4,p-2.68],.27,h.metal),y.beam([o*15.46,7.4,p-2.68],[o*12.4,9.18,p-2.68],.3,h.metal),y.use("trim").beam([o*15.29,7.3,p-2.6],[o*12.35,9.1,p-2.6],.035,h.white,.78),l%2===0&&y.panel([o*15.36,4.5,p],3.9,1.6,[0,-o*Math.PI/2,0],l+2),y.use("trim").beam([o*15.31,2.3,p-2.1],[o*15.31,2.3,p+2.1],.028,h.accent,.45)}}y.use("roof").solid([32,.55,43.1],[0,9.38,12.75],h.dark,[0,0,0],.1);for(let o of[-7.8,-1,7,15,23,31]){y.solid([30.7,.35,.58],[0,8.88,o],h.panel,[0,0,0],.07);for(let l of[-1,1])y.box([11.7,.045,.09],[l*7.65,8.675,o+.2],h.white,.78),y.solid([.28,.22,3.3],[l*8.1,8.99,o+1.9],h.metal,[0,0,0],.03),y.box([.035,.025,2.8],[l*8.06,8.86,o+1.9],h.amber,.74)}y.use("roof").solid([5.8,.28,42],[0,9.01,12.3],h.panel,[0,0,0],.08);for(let o of[-4,4,12,20,28]){y.solid([4.8,.05,6.2],[0,8.835,o],h.dark,[0,0,0],.08);for(let l of[-1,1])y.box([.022,.012,4.3],[l*2.15,8.8,o],h.metal,0)}y.chair(0,1.7,3.25,0,1.26,!0),y.use("floor").solid([6.8,.5,22],[0,.25,21.8],h.floor,[0,0,0],.08);for(let o of[-1,1])y.use("trim").beam([o*3.3,.523,11.2],[o*3.3,.523,32.3],.025,h.white,.65),y.person(o*4.75,0,18.5,o*.6,!1),y.cabinet(o*8,0,31,Math.PI);y.label([0,.525,26],3.9,1,[-Math.PI/2,0,0],6),y.use("walls").solid([32,9.6,.65],[0,4.75,34],h.dark,[0,0,0],.1),y.door(0,.5,33.56,3.6,5.6,Math.PI);for(let o of[-1,1])y.use("walls").solid([9.4,6.7,.22],[o*9.3,4.6,33.55],h.panel,[0,0,0],.11),y.panel([o*9.3,4.3,33.37],7.5,2.9,[0,Math.PI,0],o<0?4:3),y.label([o*9.3,7.5,33.35],5.1,.55,[0,Math.PI,0],o<0?10:14);return y.label([0,7.5,33.52],4.7,.57,[0,Math.PI,0],2),{groups:y.groups,obstacles:y.obstacles}}return M})(),lu=(()=>{let n=Math.PI*2,t=(h,o,l)=>Math.max(o,Math.min(l,h)),e=(h,o,l)=>h+(o-h)*l,i={add:(h,o)=>h.map((l,p)=>l+o[p]),sub:(h,o)=>h.map((l,p)=>l-o[p]),scale:(h,o)=>h.map(l=>l*o),dot:(h,o)=>h[0]*o[0]+h[1]*o[1]+h[2]*o[2],cross:(h,o)=>[h[1]*o[2]-h[2]*o[1],h[2]*o[0]-h[0]*o[2],h[0]*o[1]-h[1]*o[0]],length:h=>Math.hypot(...h),norm:h=>{let o=Math.hypot(...h)||1;return h.map(l=>l/o)}},s={identity:()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),mul:(h,o)=>{let l=new Float32Array(16);for(let p=0;p<4;p++)for(let c=0;c<4;c++)l[p*4+c]=h[c]*o[p*4]+h[4+c]*o[p*4+1]+h[8+c]*o[p*4+2]+h[12+c]*o[p*4+3];return l},translate:(h,o,l)=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,h,o,l,1]),scale:(h,o=h,l=h)=>new Float32Array([h,0,0,0,0,o,0,0,0,0,l,0,0,0,0,1]),rx:h=>{let o=Math.cos(h),l=Math.sin(h);return new Float32Array([1,0,0,0,0,o,l,0,0,-l,o,0,0,0,0,1])},ry:h=>{let o=Math.cos(h),l=Math.sin(h);return new Float32Array([o,0,-l,0,0,1,0,0,l,0,o,0,0,0,0,1])},rz:h=>{let o=Math.cos(h),l=Math.sin(h);return new Float32Array([o,l,0,0,-l,o,0,0,0,0,1,0,0,0,0,1])},compose:(h=[0,0,0],o=[0,0,0],l=[1,1,1])=>s.mul(s.translate(...h),s.mul(s.ry(o[1]),s.mul(s.rx(o[0]),s.mul(s.rz(o[2]),s.scale(...l))))),transform:(h,o)=>[h[0]*o[0]+h[4]*o[1]+h[8]*o[2]+h[12],h[1]*o[0]+h[5]*o[1]+h[9]*o[2]+h[13],h[2]*o[0]+h[6]*o[1]+h[10]*o[2]+h[14]],perspective:(h,o,l,p,c=0)=>{let f=1/Math.tan(h/2),E=1/(l-p);return new Float32Array([f/o,0,0,0,0,f,0,0,c,0,(p+l)*E,-1,0,0,2*p*l*E,0])},lookAt:(h,o,l=[0,1,0])=>{let p=i.norm(i.sub(h,o)),c=i.norm(i.cross(l,p)),f=i.cross(p,c);return new Float32Array([c[0],f[0],p[0],0,c[1],f[1],p[1],0,c[2],f[2],p[2],0,-i.dot(c,h),-i.dot(f,h),-i.dot(p,h),1])},camera:(h,o,l)=>{let p=i.scale(o,-1),c=i.norm(i.cross(l,p)),f=i.cross(p,c);return new Float32Array([...c,0,...f,0,...p,0,...h,1])}};function r(h=123){return()=>(h=Math.imul(1664525,h)+1013904223|0,(h>>>0)/4294967296)}function a(h){return[(h>>16&255)/255,(h>>8&255)/255,(h&255)/255]}let u={hull:a(11908267),light:a(13750469),shade:a(8555147),dark:a(2503482),inner:a(1121571),steel:a(6187886),red:a(7553595),window:a(14867393),blue:a(8900063)};class m{constructor(){this.data=[]}vertex(o,l,p,c,f,E){this.data.push(...o,...l,...p,c,f,...E)}tri(o,l,p,c=u.hull,f=0,E=0,_=null,v=null){let A=i.norm(i.cross(i.sub(l,o),i.sub(p,o)));return[o,l,p].forEach((P,C)=>this.vertex(P,_?_[C]:A,c,f,E,v?v[C]:[0,0])),this}quad(o,l,p,c,f,E=0,_=0){return this.tri(o,l,p,f,E,_,null,[[0,0],[1,0],[1,1]]),this.tri(o,p,c,f,E,_,null,[[0,0],[1,1],[0,1]]),this}box(o,l,p=u.hull,c=0,f=[0,0,0],E=0){let[_,v,A]=o.map(d=>d/2),P=s.compose(l,f),C=[[-_,-v,-A],[_,-v,-A],[_,v,-A],[-_,v,-A],[-_,-v,A],[_,-v,A],[_,v,A],[-_,v,A]].map(d=>s.transform(P,d));return[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[0,1,5,4],[3,7,6,2]].forEach(d=>this.quad(...d.map(b=>C[b]),p,E,c)),this}hull(o,l=[0,0,0],p=u.hull,c=0){let f=o.map(([E,_,v])=>{let A=Math.min(_,v)*.2;return[[v/2,-_/2+A],[v/2,_/2-A],[v/2-A,_/2],[-v/2+A,_/2],[-v/2,_/2-A],[-v/2,-_/2+A],[-v/2+A,-_/2],[v/2-A,-_/2]].map(([P,C])=>[E+l[0],P+l[1],C+l[2]])});for(let E=0;E<f.length-1;E++)for(let _=0;_<8;_++){let v=(_+1)%8;this.quad(f[E][_],f[E][v],f[E+1][v],f[E+1][_],p,0,c)}for(let E=1;E<7;E++){this.tri(f[0][0],f[0][E+1],f[0][E],p,0,c);let _=f.at(-1);this.tri(_[0],_[E],_[E+1],p,0,c)}return this}chamfer(o,l,p=u.hull,c=0){let[f,E,_]=o,v=Math.min(f,E,_)*.18;return this.hull([[-f/2,_-v*2,E-v*2],[-f/2+v,_,E],[f/2-v,_,E],[f/2,_-v*2,E-v*2]],l,p,c)}cylinder(o,l,p,c=u.steel,f=14,E=0,_=0,v=o){let[A,P,C]=p;for(let d=0;d<f;d++){let b=n*d/f,R=n*(d+1)/f,L=[A-l/2,P+Math.sin(b)*o,C+Math.cos(b)*o],g=[A-l/2,P+Math.sin(R)*o,C+Math.cos(R)*o],w=[A+l/2,P+Math.sin(R)*v,C+Math.cos(R)*v],T=[A+l/2,P+Math.sin(b)*v,C+Math.cos(b)*v];this.quad(L,g,w,T,c,_,E),this.tri([A-l/2,P,C],g,L,c,_,E),this.tri([A+l/2,P,C],T,w,c,_,E)}return this}beam(o,l,p,c,f=u.dark){let E=i.sub(l,o),_=i.length(E),v=i.norm(E),A=Math.abs(v[1])>.95?[1,0,0]:[0,1,0],P=i.norm(i.cross(v,A)),C=i.cross(P,v),d=[];return[o,l].forEach(b=>[[-1,-1],[-1,1],[1,1],[1,-1]].forEach(([R,L])=>d.push(i.add(b,i.add(i.scale(P,R*p/2),i.scale(C,L*c/2)))))),[[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]].forEach(b=>this.quad(...b.map(R=>d[R]),f)),this}sphere(o=1,l=56,p=28){let c=(f,E)=>{let _=f/l*n,v=E/p*Math.PI;return[Math.sin(v)*Math.cos(_),Math.cos(v),Math.sin(v)*Math.sin(_)]};for(let f=0;f<p;f++)for(let E=0;E<l;E++){let _=[c(E,f),c(E+1,f),c(E+1,f+1),c(E,f+1)],v=_.map(A=>i.scale(A,o));this.tri(v[0],v[1],v[2],u.hull,0,0,[_[0],_[1],_[2]]),this.tri(v[0],v[2],v[3],u.hull,0,0,[_[0],_[2],_[3]])}return this}upload(o){let l=new Float32Array(this.data),p=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,p),o.bufferData(o.ARRAY_BUFFER,l,o.STATIC_DRAW);let c=[];for(let E=0;E<l.length;E+=39)for(let[_,v]of[[0,1],[1,2],[2,0]])c.push(...l.slice(E+_*13,E+_*13+13)),c.push(...l.slice(E+v*13,E+v*13+13));let f=o.createBuffer();return o.bindBuffer(o.ARRAY_BUFFER,f),o.bufferData(o.ARRAY_BUFFER,new Float32Array(c),o.STATIC_DRAW),{buffer:p,count:l.length/13,lineBuffer:f,lineCount:c.length/13}}}let x=[{id:0,name:"\u6E38\u96BC \xB7 \u5355\u5EA7\u9A7E\u9A76\u8231",short:"\u5355\u5EA7\u6218\u673A",en:"PEREGRINE / FLIGHT DECK",code:"HF\u201301",dim:"3.6 \xD7 5.8 \xD7 3.0 m",desc:"\u5305\u8986\u5F0F\u5EA7\u8231 \xB7 \u53CC\u4FA7\u64CD\u7EB5\u53F0 \xB7 \u88C5\u7532\u8231\u76D6",w:3.6,d:5.8,h:3,front:-3.8,back:2,eye:[0,1.48,.6],target:[0,1.45,-4],scale:1,accent:7458530,ship:3,views:[["\u9A7E\u9A76\u5E2D",[0,1.48,.6],[0,1.45,-4]],["\u4FA7\u63A7\u53F0",[.65,1.6,.85],[-.85,.65,-1.15]],["\u8231\u540E\u56DE\u671B",[0,1.85,-2.05],[0,1.15,1.5]],["\u8231\u76D6\u7ED3\u6784",[0,.95,.2],[.3,2.6,-.85]]]},{id:1,name:"\u7384\u6B66 \xB7 \u91CD\u578B\u6218\u8230\u8230\u6865",short:"\u91CD\u578B\u6218\u8230",en:"BASTION / CAPITAL BRIDGE",code:"BB\u201301",dim:"24 \xD7 28 \xD7 7.5 m",desc:"\u5206\u5C42\u6307\u6325\u7532\u677F \xB7 \u53CC\u8237\u64CD\u4F5C\u5E2D \xB7 \u524D\u5411\u5168\u666F\u8237\u7A97",w:24,d:28,h:7.5,front:-18,back:10,eye:[0,3.1,7.25],target:[0,2.65,-16],scale:1,accent:7063259,ship:4,views:[["\u6307\u6325\u5E2D",[0,3.1,7.25],[0,2.65,-16]],["\u5DE6\u8237\u5168\u666F",[-8.5,3.7,5.6],[1,1.7,-8]],["\u6218\u672F\u684C",[2.6,2.45,.1],[0,1.4,-3]],["\u540E\u8231\u56DE\u671B",[0,2.05,-12.8],[0,2.2,8.6]]]},{id:2,name:"\u5929\u7A79 \xB7 \u5B87\u5B99\u5821\u5792\u65D7\u8230",short:"\u5B87\u5B99\u5821\u5792",en:"EMPYREAN / FORTRESS COMMAND",code:"FC\u201301",dim:"64 \xD7 70 \xD7 22 m",desc:"\u4E2D\u592E\u6307\u6325\u957F\u5ECA \xB7 \u4E0B\u6C89\u5F0F\u4F5C\u6218\u533A \xB7 \u53CC\u5C42\u4FA7\u5ECA",w:64,d:70,h:22,front:-45,back:25,eye:[0,6.4,19.1],target:[0,5.7,-36],scale:1,accent:14202490,ship:4,views:[["\u65D7\u8230\u6307\u6325\u5E2D",[0,6.4,19.1],[0,5.7,-36]],["\u4E0A\u5C42\u4FA7\u5ECA",[-23,10,10],[0,3.4,-11]],["\u4E2D\u592E\u661F\u56FE",[7,5.5,-5],[0,4.1,-13]],["\u5927\u5385\u56DE\u671B",[0,4,-33],[0,6.5,21]]]},{id:3,name:"\u6DF1\u6F5C \xB7 \u88C5\u7532\u6218\u672F\u8231",short:"\u81EA\u7531\u8BBE\u8BA1 A",en:"ABYSS / ARMOURED CITADEL",code:"CONCEPT\u2013A",dim:"18 \xD7 23 \xD7 6 m",desc:"\u5C01\u95ED\u5F0F\u88C5\u7532\u8231 \xB7 \u516B\u89D2\u4F5C\u6218\u684C \xB7 \u5D4C\u5165\u5F0F\u6001\u52BF\u5899",w:18,d:23,h:6,front:-14,back:9,eye:[0,2.9,6.7],target:[0,2.2,-10],scale:1,accent:14324848,ship:4,views:[["\u6218\u672F\u6307\u6325\u5E2D",[0,2.9,6.7],[0,2.2,-10]],["\u4FA7\u5411\u89C2\u5BDF",[-6.6,2.8,3.6],[1,1.3,-3]],["\u4F5C\u6218\u684C",[2.6,2.5,.3],[0,1.6,-3.3]],["\u8231\u540E\u56DE\u671B",[0,2.25,-9],[0,2.2,7.8]]]},{id:4,name:"\u8FDC\u773A \xB7 \u73AF\u666F\u63A2\u7D22\u8230\u6865",short:"\u81EA\u7531\u8BBE\u8BA1 B",en:"HORIZON / PANORAMIC BRIDGE",code:"CONCEPT\u2013B",dim:"\u76F4\u5F84 28 m \xB7 \u9AD8 9 m",desc:"\u73AF\u5F62\u5168\u666F\u8237\u7A97 \xB7 \u5F27\u9762\u5BFC\u822A\u5E2D \xB7 \u4E2D\u592E\u89C2\u6D4B\u5E73\u53F0",w:28,d:28,h:9,front:-14,back:14,eye:[0,2.9,8],target:[0,2.3,-12],scale:1,accent:7846602,ship:4,views:[["\u89C2\u6D4B\u6307\u6325\u5E2D",[0,2.9,8],[0,2.3,-12]],["\u5F27\u5F62\u5BFC\u822A\u5E2D",[-7.6,2.4,1.5],[0,1.5,-6]],["\u4E2D\u592E\u661F\u56FE",[2.9,2.3,0],[0,1.1,-2]],["\u5168\u666F\u56DE\u671B",[0,2.5,-10],[0,2.5,9]]]}];class M{constructor(o){this.spec=o,this.groups={};for(let l of["floor","walls","roof","furniture","trim","crew","glass","screens","labels","holo"])this.groups[l]=new m;this.group="furniture",this.obstacles=[],this.P={floor:a(2634813),panel:a(7569802),pale:a(12042433),dark:a(1516334),black:a(528150),metal:a(4610150),seat:a(2702665),edge:a(9478310),accent:a(o.accent),white:a(14870239),amber:a(14526567)}}use(o){return this.group=o,this}get g(){return this.groups[this.group]}solid(o,l,p=this.P.panel,c=[0,0,0],f=.055,E=0){let[_,v,A]=o,P=Math.min(f,_*.24,v*.24,A*.24);if(Math.min(_,v,A)<=0)return;let C=s.compose(l,c),d=this.g,b=(L,g,w)=>{let T=Math.min(P,g*.2,w*.2);return[[-g/2+T,L,-w/2],[g/2-T,L,-w/2],[g/2,L,-w/2+T],[g/2,L,w/2-T],[g/2-T,L,w/2],[-g/2+T,L,w/2],[-g/2,L,w/2-T],[-g/2,L,-w/2+T]].map(S=>s.transform(C,S))},R=[b(-v/2,_-2*P,A-2*P),b(-v/2+P,_,A),b(v/2-P,_,A),b(v/2,_-2*P,A-2*P)];for(let L=0;L<3;L++)for(let g=0;g<8;g++)d.quad(R[L][g],R[L][(g+1)%8],R[L+1][(g+1)%8],R[L+1][g],p,E);for(let L=1;L<7;L++)d.tri(R[0][0],R[0][L+1],R[0][L],p,E),d.tri(R[3][0],R[3][L],R[3][L+1],p,E);return this}box(o,l,p=this.P.panel,c=0,f=[0,0,0]){return this.g.box(o,l,p,0,f,c),this}beam(o,l,p,c=this.P.metal,f=0,E=p){let _=this.g.data.length;if(this.g.beam(o,l,p,E,c),f)for(let v=_+9;v<this.g.data.length;v+=13)this.g.data[v]=f;return this}cylinder(o,l,p,c=this.P.metal,f=24,E=0,_=o){let[v,A,P]=p,C=this.g;for(let d=0;d<f;d++){let b=d/f*n,R=(d+1)/f*n,L=[v+Math.cos(b)*o,A,P+Math.sin(b)*o],g=[v+Math.cos(R)*o,A,P+Math.sin(R)*o],w=[v+Math.cos(b)*_,A+l,P+Math.sin(b)*_],T=[v+Math.cos(R)*_,A+l,P+Math.sin(R)*_];C.quad(L,w,T,g,c,E),C.tri([v,A+l,P],T,w,c,E),C.tri([v,A,P],L,g,c,E)}return this}ring(o,l,p,c,f=0,E=0,_=this.P.accent,v=0,A=0,P=n,C=72){for(let d=0;d<C;d++){let b=A+(P-A)*d/C,R=A+(P-A)*(d+1)/C,L=(w,T,S)=>[f+Math.cos(S)*w,T,E+Math.sin(S)*w],g=this.g;g.quad(L(o,p,b),L(o,p,R),L(l,p,R),L(l,p,b),_,v),g.quad(L(o,p+c,b),L(l,p+c,b),L(l,p+c,R),L(o,p+c,R),_,v),g.quad(L(l,p,b),L(l,p,R),L(l,p+c,R),L(l,p+c,b),_,v),g.quad(L(o,p,R),L(o,p,b),L(o,p+c,b),L(o,p+c,R),_,v)}return this}sphere(o,l,p=this.P.accent,c=0){let f=this.g,E=(_,v)=>[o[0]+l*Math.sin(v)*Math.cos(_),o[1]+l*Math.cos(v),o[2]+l*Math.sin(v)*Math.sin(_)];for(let _=0;_<10;_++)for(let v=0;v<16;v++)f.quad(E(v/16*n,_/10*Math.PI),E((v+1)/16*n,_/10*Math.PI),E((v+1)/16*n,(_+1)/10*Math.PI),E(v/16*n,(_+1)/10*Math.PI),p,c);return this}plane(o,l,p,c,f,E=0){let _=s.compose(o,c),v=[[-l/2,-p/2,0],[l/2,-p/2,0],[l/2,p/2,0],[-l/2,p/2,0]].map(A=>s.transform(_,A));return this.g.quad(...v,f,E),this}panel(o,l,p,c=[-.3,0,0],f=0){let E=this.group,_=this.P,v=s.compose(o,c),A=L=>s.transform(v,L);this.use("furniture").solid([l+.16,p+.16,.12],o,_.dark,c,.05),this.box([l+.06,p+.06,.026],A([0,0,.069]),_.black,0,c),this.use("screens");let P=[[-l/2,-p/2,.088],[l/2,-p/2,.088],[l/2,p/2,.088],[-l/2,p/2,.088]].map(A),C=f%4/4+.004,d=(f%4+1)/4-.004,b=1-(Math.floor(f/4)+1)/2+.009,R=1-Math.floor(f/4)/2-.009;this.g.tri(P[0],P[1],P[2],_.accent,1,0,null,[[C,b],[d,b],[d,R]]),this.g.tri(P[0],P[2],P[3],_.accent,1,0,null,[[C,b],[d,R],[C,R]]),this.use("trim");for(let L of[-1,1])this.box([.025,.025,.025],A([L*(l/2+.05),p/2+.055,.072]),_.edge,.1,c);return this.box([l*.2,.014,.018],A([-l*.32,-p/2-.055,.07]),_.accent,.8,c),this.use(E),this}label(o,l,p,c,f=0){let E=this.group;this.use("labels");let _=s.compose(o,c),v=[[-l/2,-p/2,0],[l/2,-p/2,0],[l/2,p/2,0],[-l/2,p/2,0]].map(b=>s.transform(_,b)),A=f%4/4+.004,P=(f%4+1)/4-.004,C=1-(Math.floor(f/4)+1)/4+.006,d=1-Math.floor(f/4)/4-.006;return this.g.tri(v[0],v[1],v[2],this.P.white,1,0,null,[[A,C],[P,C],[P,d]]),this.g.tri(v[0],v[2],v[3],this.P.white,1,0,null,[[A,C],[P,d],[A,d]]),this.use(E),this}chair(o,l,p,c=0,f=1,E=!1){let _=this.group,v=this.P,A=s.compose([o,l,p],[0,c,0],[f,f,f]),P=(C,d,b,R=0)=>this.solid(C.map(L=>L*f),s.transform(A,d),b,[R,c,0],.05*f);this.use("furniture"),P([.54,.12,.57],[0,.51,0],v.dark),P([.46,.12,.49],[0,.59,-.02],v.seat),P([.53,.82,.17],[0,.99,.23],v.dark,-.09),P([.42,.67,.085],[0,1.03,.125],v.seat,-.09),P([.4,.22,.16],[0,1.53,.24],v.dark),P([.32,.16,.07],[0,1.55,.145],v.seat),P([.16,.45,.16],[0,.25,.04],v.metal);for(let C of[-1,1])P([.095,.25,.11],[C*.35,.66,.08],v.metal),P([.13,.11,.54],[C*.35,.81,-.04],v.dark),P([.018,.025,.22],[C*.35,.877,-.12],v.accent),P([.055,.025,.05],[C*.35,.88,-.28],v.amber);for(let C=0;C<5;C++){let d=C/5*n;this.beam(s.transform(A,[0,.09,.04]),s.transform(A,[Math.sin(d)*.42,.09,Math.cos(d)*.42]),.065*f,v.metal)}return E&&(P([.64,1.18,.12],[0,1.09,.39],v.metal),P([.54,.045,.022],[0,1.58,.466],v.accent)),this.use(_),this}person(o,l,p,c=0,f=!0){let E=this.group;this.use("crew");let _=this.P,v=s.compose([o,l,p],[0,c,0]),A=b=>s.transform(v,b),P=a(4280410),C=a(1450795),d=a(9474438);this.solid([.39,.5,.25],A([0,f?1.05:1.21,0]),P,[.04,c,0],.075),this.sphere(A([0,f?1.49:1.66,-.015]),.135,d),this.solid([.41,.075,.26],A([0,f?1.28:1.45,0]),_.dark,[0,c,0],.025);for(let b of[-1,1]){let R=[b*.22,f?1.2:1.4,0],L=[b*.25,f?.91:1.12,-.1],g=[b*.25,f?.89:.92,f?-.36:-.07];this.beam(A(R),A(L),.12,P),this.beam(A(L),A(g),.1,P),this.sphere(A(g),.055,d),f?(this.beam(A([b*.13,.78,0]),A([b*.14,.61,-.4]),.16,P),this.beam(A([b*.14,.61,-.4]),A([b*.14,.15,-.45]),.12,P),this.solid([.17,.13,.3],A([b*.14,.09,-.51]),C,[0,c,0])):(this.beam(A([b*.11,.96,0]),A([b*.15,.17,-.02]),.15,P),this.solid([.17,.14,.31],A([b*.15,.08,-.1]),C,[0,c,0]))}return this.box([.08,.043,.013],A([.095,f?1.18:1.34,-.133]),_.accent,.6,[0,c,0]),this.use(E),this}station(o,l,p,c=0,f=0,E=!1,_=2.2){let v=this.P,A=s.compose([o,l,p],[0,c,0]),P=b=>s.transform(A,b),C=this.group;this.use("furniture"),this.solid([_,.19,1.05],P([0,.91,0]),v.panel,[0,c,0],.1);for(let b of[-1,1])this.solid([.21,.87,.72],P([b*(_/2-.2),.43,.06]),v.dark,[0,c,0],.06);this.solid([_*.91,.08,.68],P([0,1.055,.09]),v.black,[-.07,c,0],.03),this.panel(P([0,1.34,-.33]),_*.7,.51,[-.38,c,0],f);for(let b=0;b<10;b++)this.box([.09,.015,.045],P([-.51+b*.115,1.105,.31]),b<3?v.accent:v.edge,b<3?.7:0,[0,c,0]);for(let b of[-1,1])this.box([.085,.018,.065],P([b*(_/2-.23),1.106,.2]),v.amber,.65,[0,c,0]),this.box([.055,.075,.055],P([b*(_/2-.23),1.14,.35]),v.dark,0,[0,c,0]);let d=P([0,0,1.05]);return this.chair(...d,c),E&&this.person(...d,c,!0),this.obstacles.push({x:o,z:p,rx:_/2,rz:.6}),this.use(C),this}rail(o,l,p,c=this.P.metal,f=!1){let E=this.group;this.use("trim");let _=i.length(i.sub(l,o)),v=Math.ceil(_/2.4);for(let A=0;A<=v;A++){let P=o.map((C,d)=>e(C,l[d],A/v));this.beam([P[0],p,P[2]],[P[0],p+1.05,P[2]],.047,c)}return this.beam([o[0],p+1.04,o[2]],[l[0],p+1.04,l[2]],.07,c),this.beam([o[0],p+.17,o[2]],[l[0],p+.17,l[2]],.037,c),f&&(this.use("glass"),this.g.quad([o[0],p+.2,o[2]],[l[0],p+.2,l[2]],[l[0],p+.97,l[2]],[o[0],p+.97,o[2]],this.P.accent,.1)),this.use(E),this}stairs(o,l,p,c,f,E,_=0){let v=this.group;this.use("floor");for(let A=0;A<c;A++)this.solid([p,(A+1)*f,E+.012],[o,_+(A+1)*f/2,l+A*E],this.P.floor,[0,0,0],.02),this.box([p-.14,.021,.04],[o,_+(A+1)*f+.012,l+A*E-E*.36],this.P.accent,.7);return this.use(v),this}tiles(o,l,p,c=0,f=1.8){let E=this.group;this.use("floor"),this.box([o,.24,p-l],[0,c-.12,(l+p)/2],this.P.dark);for(let _=-o/2+f/2;_<o/2;_+=f)for(let v=l+f/2;v<p;v+=f)this.box([Math.min(f-.045,o/2-_+f/2-.05),.022,Math.min(f-.045,p-v+f/2-.05)],[_,c+.011,v],this.P.floor),(Math.round((_+o/2)/f)+Math.round((v-l)/f))%3===0&&this.box([.07,.006,.18],[_-f*.34,c+.026,v-f*.33],this.P.metal);return this.use(E),this}door(o,l,p,c,f,E=0){let _=this.group,v=this.P,A=s.compose([o,l,p],[0,E,0]),P=C=>s.transform(A,C);this.use("walls"),this.solid([c+.75,f+.48,.32],P([0,f/2,0]),v.dark,[0,E,0],.1);for(let C of[-1,1])this.solid([c/2-.035,f-.15,.11],P([C*c/4,f/2,.21]),v.metal,[0,E,0],.065),this.solid([c*.27,f*.61,.042],P([C*c*.26,f*.5,.286]),v.panel,[0,E,0],.045),this.box([.024,f*.84,.032],P([C*(c/2+.13),f/2,.21]),v.accent,.95,[0,E,0]);return this.label(P([0,f+.12,.22]),c,.28,[0,E,0],3),this.label(P([0,f*.65,.312]),c*.56,.31,[0,E,0],8),this.use(_),this}cabinet(o,l,p,c=0){let f=this.group,E=this.P,_=s.compose([o,l,p],[0,c,0]),v=A=>s.transform(_,A);this.use("furniture"),this.solid([1.25,2.25,.65],v([0,1.125,0]),E.dark,[0,c,0],.075),this.solid([1.1,2.09,.05],v([0,1.14,.34]),E.panel,[0,c,0],.035);for(let A=0;A<8;A++)this.box([.8,.045,.025],v([0,.48+A*.083,.381]),E.black,0,[0,c,0]);return this.panel(v([0,1.66,.41]),.72,.31,[0,c,0],2),this.box([.045,.45,.048],v([.44,1.28,.4]),E.metal,0,[0,c,0]),this.use(f),this}window(o,l,p,c){let f=this.group,E=this.P;return this.use("walls"),this.beam([o[0],p-.1,o[1]],[l[0],p-.1,l[1]],.34,E.metal,0,.38),this.beam([o[0],c+.1,o[1]],[l[0],c+.1,l[1]],.4,E.panel,0,.4),this.beam([o[0],p,o[1]],[o[0],c,o[1]],.19,E.dark,0,.3),this.beam([o[0],p,o[1]],[o[0],c,o[1]],.047,E.edge,0,.33),this.use("glass"),this.g.quad([o[0],p,o[1]],[l[0],p,l[1]],[l[0],c,l[1]],[o[0],c,o[1]],E.accent,0),this.use(f),this}holo(o,l,p,c=1){let f=this.group,E=this.P;this.use("holo");for(let v=1;v<6;v++){let A=v/6*Math.PI,P=Math.sin(A)*c,C=l+Math.cos(A)*c;this.ring(P-.012,P+.012,C,.012,o,p,E.accent,1,0,n,64)}for(let v=0;v<6;v++){let A=v/6*Math.PI;for(let P=0;P<60;P++){let C=P/60*n,d=(P+1)/60*n;this.beam([o+Math.cos(A)*Math.cos(C)*c,l+Math.sin(C)*c,p+Math.sin(A)*Math.cos(C)*c],[o+Math.cos(A)*Math.cos(d)*c,l+Math.sin(d)*c,p+Math.sin(A)*Math.cos(d)*c],.012,E.accent,1)}}this.ring(c*1.15,c*1.15+.025,l-c*.45,.016,o,p,E.accent,1);let _=r(870);for(let v=0;v<23;v++){let A=_()*n,P=_()*Math.PI,C=c*(.65+_()*.45);this.sphere([o+Math.cos(A)*Math.sin(P)*C,l+Math.cos(P)*C,p+Math.sin(A)*Math.sin(P)*C],c*.028,v%4===0?E.amber:E.white,.9)}return this.use(f),this}table(o,l,p,c=1.5,f=!0){let E=this.group,_=this.P;this.use("furniture"),this.cylinder(c*.72,.55,[o,l,p],_.dark,8),this.cylinder(c,.22,[o,l+.55,p],_.metal,8),this.cylinder(c*.91,.035,[o,l+.786,p],_.black,48),this.ring(c*.78,c*.8,l+.83,.014,o,p,_.accent,.7),this.ring(c*.96,c*.98,l+.76,.025,o,p,_.accent,.9);for(let v=0;v<8;v++){let A=v/8*n;this.panel([o+Math.sin(A)*c*.85,l+.9,p+Math.cos(A)*c*.85],c*.44,c*.22,[-1.08,A,0],v%8)}return f&&this.holo(o,l+1.5,p,c*.43),this.use(E),this}}function y(h){let o=x[h],l=new M(o),p=l.P;if(h===0){l.tiles(3.6,-3.8,2,0,.6),l.use("walls").solid([3.6,1.08,.22],[0,.54,-3.66],p.dark),l.solid([3.6,3,.22],[0,1.5,1.93],p.panel);for(let c of[-1,1])l.solid([.2,1.3,5.6],[c*1.74,.65,-.9],p.dark),l.solid([.2,2.1,1.1],[c*1.72,1.8,1.28],p.panel),l.window([c*1.66,-3.3],[c*1.74,-.6],1.19,2.6),l.window([c*1.74,-.6],[c*1.7,1.02],1.18,2.58),l.use("roof").beam([c*1.72,.95,-2.7],[c*.78,2.7,-1.9],.1,p.metal),l.beam([c*.78,2.7,-1.9],[c*.88,2.7,1.15],.08,p.metal),l.use("trim").beam([c*1.58,.35,-3.25],[c*1.58,.35,1.6],.024,p.accent,.8);l.window([-1.66,-3.3],[0,-3.75],1.13,2.6),l.window([0,-3.75],[1.66,-3.3],1.13,2.6),l.use("roof").solid([1.95,.16,3.6],[0,2.85,-.35],p.dark);for(let c of[-.75,.75])l.box([.03,.02,2],[c,2.756,-.25],p.white,.9);l.use("furniture").solid([3.24,.38,.65],[0,.78,-2.52],p.dark);for(let c=0;c<3;c++)l.panel([(c-1)*.83,1.02,-2.29],.72,.45,[-.35,0,0],c);for(let c of[-1,1]){l.solid([.62,.64,2.2],[c*1.12,.52,-.71],p.metal),l.solid([.52,.09,2.05],[c*1.12,.9,-.72],p.black),l.panel([c*1.12,.99,-1.48],.38,.62,[-1.2,0,0],c<0?3:2);for(let f=0;f<7;f++)l.box([.045,.026,.07],[c*1.12+(f%2-.5)*.14,.957,-.6+Math.floor(f/2)*.19],f%3===0?p.amber:p.accent,.6);l.cylinder(.045,.16,[c*.94,1,-.32],p.dark,12),l.solid([.08,.17,.1],[c*.94,1.18,-.3],p.dark,[.18,0,c*.15])}l.use("glass");for(let c of[-1,1])l.g.quad([c*1.74,2.6,-1.9],[c*.9,2.77,-1.9],[c*.9,2.77,1.15],[c*1.74,2.6,1.15],p.accent),l.g.quad([c*1.66,2.6,-3.3],[0,2.6,-3.75],[c*.9,2.77,-1.9],[c*1.74,2.6,-1.9],p.accent);l.chair(0,0,.78,0,1.12,!0),l.door(0,0,1.76,1.12,2.3,Math.PI),l.label([0,2.59,-2.7],1.2,.16,[0,0,0],0),l.use("furniture").box([.62,.1,.43],[0,.14,-.86],p.dark);for(let c of[-1,1])l.solid([.21,.07,.34],[c*.19,.29,-.83],p.metal,[-.4,0,0])}if(h===1){l.tiles(24,-18,10,0,1.8),l.use("floor").solid([10,1.1,4.8],[0,.55,7.6],p.floor,[0,0,0],.13),l.stairs(0,3.28,4.6,5,.22,.4);for(let c of[-1,1]){l.rail([c*2.65,0,5.4],[c*2.65,0,9.8],1.1,p.metal,!0),l.rail([c*2.7,0,5.23],[c*4.85,0,5.23],1.1,p.metal,!0),l.use("trim").box([.034,.02,17],[c*2.4,.039,-4.85],p.accent,.9),l.box([.055,.02,4.2],[c*4.55,1.117,7.55],p.accent,.8),l.use("walls").solid([.45,7.5,24],[c*12,3.65,-2],p.dark);for(let f of[-10.6,-4.6,1.4,7.4])l.solid([.2,4.7,5.45],[c*11.7,3.15,f],p.panel),l.solid([.24,.75,5.1],[c*11.55,1.05,f],p.metal),l.beam([c*11.55,.2,f-2.75],[c*11.55,6.9,f-2.75],.24,p.dark),l.use("trim").beam([c*11.36,5.63,f-2.25],[c*11.36,5.63,f+2.2],.035,p.white,.9),l.use("walls");l.window([c*10,-18],[c*12,-13],1.5,6.5);for(let f=0;f<3;f++){let E=-8.2+f*5.15;l.station(c*6.1,0,E,c*-.15,f*2+(c>0?1:0),f!==1,2.6)}l.station(c*3.6,0,-13.4,c*-.12,0,!0,2.45),l.cabinet(c*10.85,0,5.2,c===1?-Math.PI/2:Math.PI/2),l.cabinet(c*10.85,0,7.3,c===1?-Math.PI/2:Math.PI/2),l.person(c*9.15,0,1.2,c===1?-Math.PI/2:Math.PI/2,!1)}for(let c=0;c<5;c++)l.window([-10+c*4,-18],[-6+c*4,-18],1.5,6.5);l.use("walls").solid([24,1.3,.48],[0,.62,-18],p.metal),l.solid([24,7.5,.5],[0,3.65,10],p.panel),l.door(0,1.1,9.64,3,4.2,Math.PI);for(let c of[-7.2,7.2])l.panel([c,3.9,9.7],4.2,1.95,[0,Math.PI,0],5),l.label([c,6.1,9.65],4,.45,[0,Math.PI,0],c<0?4:5);l.use("roof").solid([24,.45,28],[0,7.45,-4],p.dark);for(let c of[-13,-6,1,8]){l.solid([23,.34,.48],[0,6.95,c],p.metal);for(let f of[-1,1])l.beam([f*11.6,5.6,c],[f*9,7.07,c],.28,p.metal),l.box([7.6,.04,.1],[f*5.1,6.745,c],p.white,.94),l.solid([2.6,.32,1.2],[f*6.8,7.02,c+2.5],p.panel)}l.use("roof").box([2.8,.16,23],[0,7.05,-4],p.metal);for(let c=-14;c<6;c+=2)l.box([.9,.024,.65],[0,6.957,c],p.dark);l.table(0,.02,-3.1,1.55,!0),l.chair(0,1.1,8.42,0,1.18,!0),l.station(-3.65,1.1,7.05,0,4,!1,1.5),l.station(3.65,1.1,7.05,0,2,!0,1.5),l.label([0,6.7,-17.68],4.2,.48,[0,0,0],1),l.label([0,.048,1.25],3.6,1,[-Math.PI/2,0,0],6);for(let c of[-1,1])l.label([c*10.1,3.65,-15],1.65,.6,[0,-c*.55,0],c<0?4:5)}if(h===2){p.panel=a(8948359),p.pale=a(12894902),p.floor=a(3160126),p.metal=a(5529188),l.tiles(64,-45,25,0,3.2),l.use("floor").solid([8,2.15,44],[0,1.075,-10],p.floor,[0,0,0],.16),l.solid([16,4.55,14],[0,2.275,18],p.floor,[0,0,0],.22),l.stairs(0,8,8,8,.3,.5,2.15),l.stairs(0,-35.8,8,7,2.15/7,.47,0);for(let c of[-1,1]){l.use("trim").beam([c*3.84,2.21,-31],[c*3.84,2.21,9],.048,p.accent,.95),l.rail([c*4.25,0,-30],[c*4.25,0,7.5],2.15,p.metal,!0),l.rail([c*7.8,0,11.5],[c*7.8,0,24],4.55,p.metal,!0),l.use("floor").solid([9.5,.62,51],[c*27.25,7.12,-1],p.metal,[0,0,0],.15),l.rail([c*22.55,0,-26.2],[c*22.55,0,24],7.44,p.pale,!0),l.use("trim").beam([c*22.51,7.3,-26],[c*22.51,7.3,24],.09,p.accent,.95),l.use("walls").solid([.7,22,61],[c*32,10.85,-5.5],p.dark);for(let f of[-24,-10,4,18])l.use("walls").solid([.25,5.9,12.6],[c*31.47,3.18,f],p.panel),l.solid([.38,10.5,12.4],[c*31.5,14.3,f],p.panel),l.beam([c*31,.1,f-6.6],[c*31,18.2,f-6.6],.65,p.metal),l.beam([c*31,18.2,f-6.6],[c*24,21.2,f-6.6],.6,p.metal),l.use("trim").beam([c*30.95,18.25,f-6.65],[c*24,21.2,f-6.65],.06,p.accent,.9),l.panel([c*31.03,12.4,f],8.8,3.2,[0,c===1?-Math.PI/2:Math.PI/2,0],5);l.window([c*26,-45],[c*32,-34],3.4,18.2);for(let f=0;f<4;f++){let E=-24+f*9.3;for(let _=0;_<2;_++){let v=c*(9.5+_*8);l.station(v,0,E,c*-.1,(f*2+_)%8,f%2===0||_===1,3.1)}l.station(c*27.4,7.44,E+3,c===1?-.4:.4,(f+4)%8,f%2===0,2.65)}for(let f of[-23,-5,13])l.use("walls").solid([.9,6.6,1],[c*25,3.3,f],p.metal),l.use("trim").box([.94,.08,1.04],[c*25,6.35,f],p.accent,.8);l.stairs(c*18.6,12.8,4,15,7.44/15,.73,0),l.rail([c*20.65,0,12.6],[c*20.65,0,23.4],0,p.metal,!1),l.cabinet(c*30,7.44,20,Math.PI),l.person(c*22.9,7.44,3,c===1?-Math.PI/2:Math.PI/2,!1)}for(let c=0;c<5;c++)l.window([-26+c*52/5,-45],[-26+(c+1)*52/5,-45],3.4,18.2);l.use("walls").solid([64,3.2,.65],[0,1.5,-45],p.metal),l.solid([64,22,.75],[0,10.85,25],p.dark);for(let c of[-1,1])l.solid([19,17,.2],[c*19.6,11.3,24.52],p.panel),l.panel([c*19.6,13.7,24.33],13,5.2,[0,Math.PI,0],5),l.label([c*19.5,18.8,24.3],13,1.2,[0,Math.PI,0],c<0?10:11);l.door(0,4.55,24.42,6.5,8.1,Math.PI),l.label([0,19.5,24.4],13,1.3,[0,Math.PI,0],2),l.use("roof").solid([64,.8,70],[0,21.9,-10],p.dark);for(let c of[-32,-16,0,16]){l.solid([49,.75,.85],[0,20.75,c],p.metal);for(let f of[-1,1])l.beam([f*30,17.8,c],[f*24,20.75,c],.7,p.metal),l.box([17,.08,.2],[f*13.5,20.31,c],p.white,.95),l.box([2,.08,.2],[f*3,20.31,c],p.accent,1)}l.use("roof").box([5,.5,61],[0,21.13,-10],p.metal);for(let c=-32;c<15;c+=5)l.box([3.8,.05,1.5],[0,20.845,c],p.panel);l.ring(5.7,6.1,17.9,.5,0,-13,p.metal,0),l.ring(5.77,5.85,17.82,.07,0,-13,p.accent,1);for(let c of[-1,1])l.beam([c*4,18.1,-13],[c*5.5,21,-13],.22,p.metal);l.table(0,2.15,-13,3.65,!0),l.table(-14.5,0,-32.5,2.3,!1),l.table(14.5,0,-32.5,2.3,!1),l.chair(0,4.55,21.7,0,1.5,!0);for(let c of[-1,1])l.station(c*5.3,4.55,17.8,c*-.1,c<0?4:1,!0,2.4),l.person(c*7,4.55,23,0,!1);l.label([0,19.45,-44.5],15,1.45,[0,0,0],2),l.label([0,2.19,-3.8],6,1.5,[-Math.PI/2,0,0],6),l.label([0,4.59,15.4],7,1.5,[-Math.PI/2,0,0],12)}if(h===3){p.panel=a(4346202),p.floor=a(2700347),p.accent=a(13997161),l.tiles(18,-14,9,0,1.7),l.use("floor").solid([8,.9,4],[0,.45,7],p.floor,[0,0,0],.12),l.stairs(0,3.5,4,5,.18,.32),l.use("walls").solid([18,6,.6],[0,3,-14],p.dark),l.solid([18,6,.6],[0,3,9],p.panel),l.door(0,.9,8.61,2.7,3.7,Math.PI);for(let c of[-1,1]){l.use("walls").solid([.5,6,23],[c*9,3,-2.5],p.dark);for(let f=-11;f<8;f+=4.5)l.solid([.16,4.6,3.96],[c*8.68,2.8,f],p.panel),l.beam([c*8.4,.2,f-2],[c*8.4,4.5,f-2],.35,p.metal),l.beam([c*8.4,4.5,f-2],[c*6.7,5.6,f-2],.34,p.metal),l.use("trim").beam([c*8.31,1.1,f-1.7],[c*8.31,1.1,f+1.7],.035,p.accent,.9),l.use("walls");l.cabinet(c*7.85,0,6.8,Math.PI);for(let f=0;f<3;f++)l.station(c*5.35,0,-8+f*4.3,c*-.35,(f+2)%8,f!==1,2.25);l.rail([c*3.85,0,5],[c*3.85,0,8.65],.9,p.metal,!0),l.use("trim").box([.04,.021,15],[c*2.7,.03,-3.6],p.accent,.8)}l.panel([0,3.7,-13.52],8.5,3,[0,0,0],5),l.panel([-6.3,3.5,-13.52],3.45,2.6,[0,.08,0],2),l.panel([6.3,3.5,-13.52],3.45,2.6,[0,-.08,0],6),l.label([0,5.5,-13.49],6,.46,[0,0,0],9),l.table(0,0,-2.9,2.1,!0),l.chair(0,.9,7.6,0,1.16,!0),l.use("roof").solid([18,.5,23],[0,6.1,-2.5],p.dark);for(let c of[-10,-5,0,5]){l.solid([14.8,.32,.45],[0,5.65,c],p.metal);for(let f of[-1,1])l.box([5,.04,.095],[f*4.1,5.464,c],p.white,.85)}l.use("roof").ring(2.45,2.8,4.75,.28,0,-2.9,p.metal),l.ring(2.52,2.59,4.68,.025,0,-2.9,p.accent,1);for(let c of[-1,1])l.beam([c*2.6,4.94,-2.9],[c*3.2,6,-2.9],.15,p.metal);l.label([0,.04,1.4],4.5,.9,[-Math.PI/2,0,0],13)}if(h===4){p.panel=a(12437188),p.pale=a(13949394),p.dark=a(3162443),p.floor=a(5399403),p.metal=a(8886430),l.use("floor").cylinder(14,.3,[0,-.3,0],p.dark,96),l.cylinder(13.7,.025,[0,0,0],p.floor,96),l.ring(10.65,10.7,.039,.014,0,0,p.accent,.9),l.ring(5.4,5.44,.04,.016,0,0,p.pale,.1),l.ring(2.9,2.93,.051,.02,0,-2,p.accent,.9);for(let c=0;c<24;c++){let f=c/24*n;l.beam([Math.cos(f)*5.5,.036,Math.sin(f)*5.5],[Math.cos(f)*13.6,.036,Math.sin(f)*13.6],.028,p.metal)}for(let c=0;c<20;c++){let f=Math.PI*.12+c/20*Math.PI*1.76,E=Math.PI*.12+(c+1)/20*Math.PI*1.76,_=[Math.sin(f)*13.72,Math.cos(f)*13.72],v=[Math.sin(E)*13.72,Math.cos(E)*13.72];l.window(_,v,.94,6.1),l.use("walls").beam([_[0],.4,_[1]],[v[0],.4,v[1]],.9,p.panel,0,.8),c%4===0&&(l.use("roof").beam([_[0],6.07,_[1]],[Math.sin(f)*5,8.45,Math.cos(f)*5],.16,p.metal),l.use("trim").beam([Math.sin(f)*13.5,6.2,Math.cos(f)*13.5],[Math.sin(f)*5,8.36,Math.cos(f)*5],.026,p.white,.95))}l.use("glass");for(let c=0;c<64;c++){let f=c/64*n,E=(c+1)/64*n;l.g.quad([Math.cos(f)*13.72,6.12,Math.sin(f)*13.72],[Math.cos(E)*13.72,6.12,Math.sin(E)*13.72],[Math.cos(E)*4.75,8.5,Math.sin(E)*4.75],[Math.cos(f)*4.75,8.5,Math.sin(f)*4.75],p.accent)}l.use("roof").ring(4.7,5.25,8.27,.28,0,0,p.panel),l.ring(4.85,4.9,8.23,.025,0,0,p.accent,1),l.use("glass");for(let c=0;c<64;c++){let f=c/64*n,E=(c+1)/64*n;l.g.tri([0,8.82,0],[Math.cos(f)*4.75,8.5,Math.sin(f)*4.75],[Math.cos(E)*4.75,8.5,Math.sin(E)*4.75],p.accent)}l.use("walls").solid([9.8,6.8,.4],[0,3.4,12.83],p.panel),l.door(0,0,12.55,2.4,3.8,Math.PI);for(let c of[-1,1])l.panel([c*3.45,2.95,12.51],2.2,1.45,[0,Math.PI,0],c<0?2:6),l.cabinet(c*5.3,0,10.3,c>0?-.5:.5);l.use("furniture").ring(8.4,9.6,.62,.48,0,0,p.panel,0,Math.PI*1.13,Math.PI*1.87,44),l.ring(8.55,9.42,1.12,.06,0,0,p.black,0,Math.PI*1.13,Math.PI*1.87,44);for(let c=0;c<7;c++){if(c===3)continue;let f=Math.PI*1.2+c/6*Math.PI*.6,E=Math.cos(f)*9,_=Math.sin(f)*9,v=Math.atan2(-E,-_);l.panel([E,1.58,_],1.4,.65,[-.36,v,0],c%8);let A=Math.cos(f)*7.7,P=Math.sin(f)*7.7;l.chair(A,0,P,v),c%2===0&&l.person(A,0,P,v,!0)}for(let c of[-1,1])l.station(c*8.3,0,2.8,c*-.9,3,!0,2.6),l.use("furniture").solid([1.8,.8,2],[c*6.25,.4,7.9],p.panel,[0,c*.25,0],.17),l.panel([c*6.25,1.02,7.7],1.4,.85,[-1,c*.25,0],2);l.use("floor").cylinder(2.55,.83,[0,0,8],p.panel,64),l.cylinder(2.42,.026,[0,.83,8],p.floor,64),l.ring(2.47,2.5,.66,.045,0,8,p.accent,1),l.stairs(0,4.66,2.5,4,.83/4,.3),l.chair(0,.85,8.7,0,1.2,!0),l.label([0,6.3,12.53],5,.57,[0,Math.PI,0],14),l.label([0,.053,2],3.6,.8,[-Math.PI/2,0,0],15)}if(h===1||h===2){let c=h===2,f=c?4.23:.9,E=c?15.65:4.7,_=c?1.9:1.45,v=c?2.4:1.7;for(let A of[-1,1]){let P=[0,A*-.13,0];l.use("furniture").solid([_,.87,.87],[A*v,f+.435,E+.12],p.dark,P,.11),l.solid([_+.13,.15,1.02],[A*v,f+.95,E],p.metal,P,.085),l.solid([_-.09,.04,.89],[A*v,f+1.045,E],p.black,P,.02),l.panel([A*v,f+1.38,E-.27],_-.2,.56,[-.4,A*-.13,0],A<0?0:6);for(let C=0;C<8;C++)l.box([.065,.022,.075],[A*v-.6+C*.165,f+1.082,E+.3],C%3===0?p.amber:p.accent,C%3===0?.8:.5);l.box([_*.52,.034,.031],[A*v,f+.65,E+.568],p.accent,.8),l.use("trim").beam([A*(v+_*.46),f+.1,E+.49],[A*(v+_*.46),f+.83,E+.49],.028,p.edge)}for(let A of[-1,1]){let P=A>0?-Math.PI/2:Math.PI/2;if(c)for(let C of[-24,-10,4,18]){l.use("walls").solid([.25,2.7,11.3],[A*31.1,3.3,C],p.dark),l.panel([A*30.92,3.45,C],8.8,2,[0,P,0],C<0?4:2);for(let d=0;d<9;d++)l.box([.13,.065,.65],[A*30.8,1.4,C-4.3+d*1.04],p.edge);l.beam([A*30.7,18.8,C-5.9],[A*22.4,7.8,C-5.9],.28,p.metal),l.use("trim").beam([A*30.62,18.8,C-5.95],[A*22.32,7.8,C-5.95],.028,p.accent,.62)}else for(let C of[-10.6,-4.6,1.4]){l.panel([A*11.37,3.2,C+.3],3.4,1.3,[0,P,0],C<0?6:2),l.use("walls").solid([.14,.45,4.5],[A*11.33,1.82,C],p.dark);for(let d=0;d<14;d++)l.box([.045,.26,.05],[A*11.23,1.84,C-1.9+d*.28],p.metal);l.beam([A*11.27,.3,C-2.3],[A*11.27,5.3,C-2.3],.12,p.edge),l.label([A*11.24,4.36,C+.3],2.7,.3,[0,P,0],A<0?4:5)}}if(c)for(let A of[-1,1])for(let P=0;P<3;P++)l.station(A*(8+P*5),0,-39.5,0,(P+2)%8,P===1,3)}return{spec:o,groups:l.groups,obstacles:l.obstacles}}return()=>y(4)})(),cu=`precision highp float;
attribute vec3 aPosition; attribute vec3 aNormal; attribute vec3 aColor;
attribute float aEmission; attribute float aTag; attribute vec2 aUV;
uniform mat4 uModel,uVP;
varying vec3 vWorld,vNormal,vColor,vLocal;varying float vEmission;varying vec2 vUV;
void main(){vec4 world=uModel*vec4(aPosition,1.);vWorld=world.xyz;vNormal=mat3(uModel)*aNormal;vColor=aColor;vEmission=aEmission;vLocal=aPosition;vUV=aUV;gl_Position=uVP*world;}`,hu=`precision highp float;
varying vec3 vWorld,vNormal,vColor,vLocal;varying float vEmission;varying vec2 vUV;
uniform vec3 uEye,uLight;uniform float uOpacity,uMode,uRoom,uTime,uLighting;
uniform sampler2D uTexture,uCity;
vec3 film(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void main(){
 vec3 N=normalize(vNormal);if(!gl_FrontFacing)N=-N;vec3 V=normalize(uEye-vWorld),L=normalize(uLight);float ndl=max(dot(N,L),0.);float alpha=uOpacity;vec3 color;
 if(uMode>1.5&&uMode<3.5){vec4 tex=texture2D(uTexture,vUV);color=tex.rgb*(uMode<2.5?.96:.8);alpha*=tex.a;if(alpha<.005)discard;gl_FragColor=vec4(color,alpha);return;}
 if(uMode>3.5&&uMode<4.5){float rim=pow(1.-abs(dot(N,V)),3.5);float day=max(.18,dot(N,L)*.6+.5);color=vec3(.16,.47,.85)*day;alpha*=rim*.47;gl_FragColor=vec4(color,alpha);return;}
 vec3 base=pow(max(vColor,vec3(0.)),vec3(2.2));
 if(uMode>.5&&uMode<1.5){vec3 n=normalize(vLocal);vec2 uv=vec2(atan(n.z,n.x)/6.2831853+.5,asin(n.y)/3.14159265+.5);vec3 tex=texture2D(uTexture,uv).rgb;base=pow(tex,vec3(2.2));float edge=pow(1.-max(dot(N,V),0.),4.);vec3 night=texture2D(uCity,uv).rgb;float nightMask=1.-smoothstep(-.08,.21,dot(N,L));color=base*(vec3(.025,.047,.085)+vec3(1.25,1.23,1.17)*ndl)+night*nightMask*.9;float water=smoothstep(.035,.12,tex.b-tex.r);color+=vec3(.27,.43,.57)*pow(max(dot(reflect(-L,N),V),0.),80.)*water*.21;color+=vec3(.05,.22,.47)*edge*(.4+ndl*.5);}
 else{
 float hemi=N.y*.5+.5;float spec=pow(max(dot(N,normalize(L+V)),0.),58.);float fresnel=pow(1.-max(dot(N,V),0.),4.);
 if(uRoom>.5){
 float windowFill=max(0.,dot(N,normalize(vec3(-.3,.4,-1.))));
 float ambientOcclusion=.60+.40*smoothstep(-.2,2.5,vWorld.y);
 color=base*(vec3(.26,.34,.43)*(.60+.5*hemi)*ambientOcclusion+vec3(.79,.86,.94)*ndl*.92+vec3(.20,.29,.35)*windowFill)*uLighting;
 vec3 overhead=normalize(vec3(0.,8.,5.)-vWorld);color+=base*vec3(.3,.245,.19)*max(0.,dot(N,overhead))*uLighting;
 color+=vec3(.17,.20,.22)*spec*.48+vec3(.014,.032,.042)*fresnel;
 float glow=exp(-length((vWorld-vec3(-3.,2.5,-1.3))*vec3(.55,1.,.65))*1.25)+exp(-length((vWorld-vec3(3.,2.5,-1.3))*vec3(.55,1.,.65))*1.25);
 color+=base*vec3(.10,.25,.30)*glow;
 }else{color=base*(vec3(.10,.135,.18)+vec3(1.08,1.04,.91)*ndl)+vec3(.25,.29,.32)*spec*.6;}
 color=mix(color,base*(1.5+vEmission*.7),clamp(vEmission,0.,1.));
 }
 color=pow(film(color),vec3(1./2.2));gl_FragColor=vec4(color,alpha);
}`;var sr=[{id:"contacts",pos:[-1.38,-.73,-2.08],size:[.52,.48],rotation:[-.17,.32,0]},{id:"weapons",pos:[-.72,-.77,-2.18],size:[.6,.48],rotation:[-.17,.14,0]},{id:"radar",pos:[0,-.76,-2.28],size:[.66,.64],rotation:[-.17,0,0]},{id:"flight",pos:[.72,-.77,-2.18],size:[.6,.48],rotation:[-.17,-.14,0]},{id:"systems",pos:[1.38,-.73,-2.08],size:[.52,.48],rotation:[-.17,-.32,0]}];function $e(n,[t,e,i=0]){let[s,r]=n.rotation,a=Math.cos(r),u=Math.sin(r),m=Math.cos(s),x=Math.sin(s),M=e*m-i*x,y=e*x+i*m;return[n.pos[0]+t*a+y*u,n.pos[1]+M,n.pos[2]-t*u+y*a]}var mo=(n,t)=>n.reduce((e,i,s)=>e+i*t[s],0),ir=(n,t)=>n.map((e,i)=>e-t[i]);function bg(n,t,e=sr){let i=null;for(let[s,r]of e.entries()){let a=$e(r,[0,0,.003]),u=ir($e(r,[1,0,.003]),a),m=ir($e(r,[0,1,.003]),a),x=ir($e(r,[0,0,1.003]),a),M=mo(t,x);if(M>=-1e-6)continue;let y=mo(ir(a,n),x)/M;if(y<0)continue;let h=ir(n.map((p,c)=>p+t[c]*y),a),o=mo(h,u)/r.size[0]+.5,l=.5-mo(h,m)/r.size[1];o<0||o>1||l<0||l>1||i&&y>i.distance||(i={index:s,surface:r.id,u:o,v:l,distance:y})}return i}var Kt={background:"#03111c",line:"#315b70",muted:"#7aa7ba",text:"#cfedf4",cyan:"#82d9f3",gold:"#edc78c",red:"#ff8b7f"},nr=n=>Math.round(n||0),uu=n=>Math.max(0,Math.min(100,nr(n))),du=n=>(Number(n||0)*180/Math.PI).toFixed(1)+"\xB0",fu=n=>n?.reason==="unavailable"?"\u672A\u88C5\u5907":n?.reason==="cooldown"?n.cooldown.toFixed(1)+" s":n?.ready?"\u5C31\u7EEA":"\u5F85\u547D",gs=class{constructor(t,e=sr){this.displays=e.map(i=>{let s=document.createElement("canvas");return s.width=640,s.height=i.height||(i.id==="radar"?640:480),{...i,canvas:s,texture:t(s),hits:[]}})}update(t,e=0){if(!(this.lastTime!=null&&e>=this.lastTime&&e-this.lastTime<1/30&&t?.name===this.state?.name)){this.lastTime=e,this.state=t;for(let i of this.displays){i.hits=[];let s=i.canvas.getContext("2d"),r=i.canvas.height;s.fillStyle=Kt.background,s.fillRect(0,0,640,r),s.strokeStyle=Kt.line,s.lineWidth=2,s.strokeRect(10,10,620,r-20);let a=i.title||{contacts:"CONTACTS / \u7D22\u654C",weapons:"WEAPON SYSTEMS / \u6B66\u5668",radar:"TACTICAL SCAN / \u96F7\u8FBE",flight:"FLIGHT VECTOR / \u98DE\u884C",systems:"SYSTEM STATUS / \u7CFB\u7EDF"}[i.id];if(this.text(s,a,28,49,28,Kt.cyan),this.line(s,26,70,614,70),!t){this.text(s,"\u7B49\u5F85\u6218\u573A\u94FE\u8DEF",28,128,32),i.texture.needsUpdate=!0;continue}this[i.id](s,i,t,e),i.texture.needsUpdate=!0}}}text(t,e,i,s,r=28,a=Kt.text,u="left",m){t.fillStyle=a,t.font=`${r}px "Bahnschrift","Microsoft YaHei",sans-serif`,t.textAlign=u,t.fillText(String(e),i,s,m),t.textAlign="left"}line(t,e,i,s,r){t.strokeStyle=Kt.line,t.lineWidth=1,t.beginPath(),t.moveTo(e,i),t.lineTo(s,r),t.stroke()}bar(t,e,i,s,r,a=Kt.cyan){t.fillStyle="#173443",t.fillRect(i,s,r,12),t.fillStyle=a,t.fillRect(i,s,r*uu(e)/100,12)}button(t,e,i,s,r,a,u,m,x=!0){t.fillStyle=x?"#123141":"#0b1b25",t.fillRect(s,r,a,54),t.strokeStyle=x?"#5a8a9e":"#25404e",t.strokeRect(s,r,a,54),this.text(t,i,s+a/2,r+36,28,x?Kt.text:"#526e7c","center"),x&&e.hits.push({x:s,y:r,w:a,h:54,action:u,value:m})}contacts(t,e,i){let s=i.contacts.filter(u=>u.enemy),r=s.find(u=>u.id===i.target),a=[...r?[r]:[],...s.filter(u=>u!==r)].slice(0,3);a.length||this.text(t,"\u65E0\u654C\u65B9\u63A5\u89E6",30,140,30,Kt.muted),a.forEach((u,m)=>{let x=90+m*67;t.fillStyle=u===r?"#35242b":"#0a2130",t.fillRect(24,x,592,59),this.text(t,"\u25C7 "+u.name,38,x+37,32,u===r?Kt.gold:Kt.text,"left",394),this.text(t,nr(u.distance)+" m",602,x+37,28,Kt.muted,"right"),i.replay||e.hits.push({x:24,y:x,w:592,h:59,action:"select",value:String(u.id)})}),this.button(t,e,"\u4E0B\u4E00\u76EE\u6807 \xB7 T",25,301,275,"target",null,!i.replay&&s.length>0),this.button(t,e,i.locked?"\u89E3\u9664\u9501\u5B9A \xB7 X":"\u9501\u5B9A\u5BF9\u51C6 \xB7 X",315,301,300,"lock",null,i.manual&&s.length>0),this.text(t,i.command||i.solution||"\u9009\u62E9\u76EE\u6807",30,399,28,Kt.gold,"left",580),this.text(t,i.replay?"REPLAY / \u53EA\u8BFB\u8BB0\u5F55":i.manual?"MANUAL / \u98DE\u884C\u63A7\u5236":"AUTO / AI \u9A7E\u9A76",30,445,26,Kt.muted)}weapons(t,e,i){this.text(t,i.weaponName||"\u4E3B\u6B66\u5668",28,118,31,Kt.text,"left",440),this.text(t,fu(i.weapon),608,118,28,Kt.cyan,"right"),this.text(t,`\u5C04\u7A0B ${nr(i.weapon?.range)} m`,28,163,28,Kt.muted),this.button(t,e,"\u4E3B\u6B66\u5668\u5F00\u706B \xB7 SPACE",26,187,588,"fire",null,i.manual&&i.weapon?.reason!=="unavailable"),this.line(t,26,264,614,264),this.text(t,"\u5BFC\u5F39",28,307,29),this.text(t,fu(i.missile),608,307,26,i.missile?.reason==="unavailable"?Kt.muted:Kt.gold,"right"),this.button(t,e,"\u5BFC\u5F39\u53D1\u5C04 \xB7 R",26,335,588,"missile",null,i.manual&&i.missile?.reason!=="unavailable"),this.text(t,i.solution||"",28,441,26,Kt.muted,"left",580)}radar(t,e,i,s){t.strokeStyle=Kt.line,t.lineWidth=1.5;for(let x of[223/3,446/3,223])t.beginPath(),t.arc(320,337,x,0,Math.PI*2),t.stroke();this.line(t,97,337,543,337),this.line(t,320,114,320,560);let m=s*.8;t.strokeStyle="#62bfd848",t.beginPath(),t.moveTo(320,337),t.lineTo(320+Math.sin(m)*223,337-Math.cos(m)*223),t.stroke();for(let x of i.contacts){let M=x.pos[0]-i.pos[0],y=x.pos[2]-i.pos[2],h=-M*Math.cos(i.heading)+y*Math.sin(i.heading),o=M*Math.sin(i.heading)+y*Math.cos(i.heading),l=Math.max(i.scanRange,Math.hypot(h,o)),p=320+h/l*223,c=337-o/l*223;t.fillStyle=x.enemy?Kt.red:Kt.cyan,t.beginPath(),t.moveTo(p,c-7),t.lineTo(p+6,c+6),t.lineTo(p-6,c+6),t.closePath(),t.fill(),x.id===i.target&&(t.strokeStyle=Kt.gold,t.strokeRect(p-14,c-14,28,28)),x.enemy&&!i.replay&&e.hits.push({x:p-15,y:c-15,w:30,h:30,action:"select",value:String(x.id)})}t.fillStyle=Kt.text,t.beginPath(),t.moveTo(320,325),t.lineTo(328,346),t.lineTo(320,341),t.lineTo(312,346),t.closePath(),t.fill(),this.text(t,"FRONT",320,100,20,Kt.muted,"center"),this.text(t,nr(i.scanRange)+" m",608,601,28,Kt.cyan,"right"),this.text(t,"\u84DD / \u53CB\u65B9\u3000\u7EA2 / \u654C\u65B9",28,601,28,Kt.muted)}flight(t,e,i){[["\u4FEF\u4EF0",du(i.pitch)],["\u6EDA\u8F6C",du(i.roll)],["\u76F8\u5BF9\u9AD8\u5EA6",nr(i.altitude)+" m"],["\u5782\u76F4\u901F\u5EA6",(Math.sin(i.pitch)*i.speed).toFixed(1)+" m/s"]].forEach(([r,a],u)=>{let m=131+u*71;this.text(t,r,30,m,28,Kt.muted),this.text(t,a,608,m,34,Kt.text,"right"),this.line(t,28,m+20,612,m+20)}),this.text(t,"Q / E  \u4FEF\u4EF0\u3000 A / D  \u6EDA\u8F6C",30,446,26,Kt.cyan)}systems(t,e,i){[["ENG / \u6CB9\u95E8",i.throttle*100,Kt.cyan],["SHD / \u62A4\u76FE",i.shield,Kt.cyan],["HULL / \u88C5\u7532",i.hull,Kt.gold]].forEach(([s,r,a],u)=>{let m=123+u*87;this.text(t,s,30,m,30,Kt.muted),this.text(t,uu(r)+"%",606,m,32,a,"right"),this.bar(t,r,30,m+20,576,a)}),this.button(t,e,"\u2212 \u6CB9\u95E8",26,360,280,"slower",null,i.manual),this.button(t,e,"+ \u6CB9\u95E8",322,360,292,"faster",null,i.manual),this.text(t,"W / S   ENGINE THROTTLE",30,452,26,Kt.muted)}pick(t,e){let i=bg(t,e,this.displays);if(!i)return null;let s=this.displays[i.index],r=i.u*s.canvas.width,a=i.v*s.canvas.height,u=s.hits.find(m=>r>=m.x&&r<=m.x+m.w&&a>=m.y&&a<=m.y+m.h);return{...i,...u?{action:u.action,value:u.value}:{}}}layout(t){return this.displays.map(e=>({id:e.id,corners:[[-.5,.5],[.5,.5],[.5,-.5],[-.5,-.5]].map(([i,s])=>t($e(e,[i*e.size[0],s*e.size[1],.003]))),controls:e.hits.map(i=>({...i,point:t($e(e,[(i.x+i.w/2)/e.canvas.width*e.size[0]-e.size[0]/2,e.size[1]/2-(i.y+i.h/2)/e.canvas.height*e.size[1],.003]))}))}))}};function Jl(n){let t=n==="bastion"?0:-3;return[{id:"operations",title:"OPERATIONS / \u4F5C\u6218\u63A7\u5236",pos:[-2.7,2.35,-3.25+t],size:[2.8,1.7],rotation:[-.25,.14,0],height:560},{id:"contacts",title:"TARGET LINK / \u76EE\u6807\u94FE\u8DEF",pos:[2.7,2.35,-3.25+t],size:[2.8,1.7],rotation:[-.25,-.14,0],height:560},{id:"helm",title:"HELM / \u822A\u884C\u4E0E\u8230\u4F53",pos:[0,1.95,-3.05+t],size:[2.12,1.32],rotation:[-.35,0,0]}]}function jl(n){return{pos:[0,1.25,n==="bastion"?-6:-9],radius:2.1,baseRadius:2.28}}var xv=[...Jl("bastion").map(n=>({x:n.pos[0],z:n.pos[2],rx:n.size[0]/2+.1,rz:.65})),{x:0,z:jl("bastion").pos[2],rx:2.28,rz:2.28}];var pe={cyan:"#8bd9ee",gold:"#edc78c",muted:"#7aa7ba",text:"#cfedf4",red:"#ff8b7f"},Kl=n=>Math.max(0,Math.min(100,Math.round(n||0))),pu=n=>n?.reason==="unavailable"?"\u672A\u88C5\u5907":n?.reason==="cooldown"?n.cooldown.toFixed(1)+" s":n?.ready?"\u5C31\u7EEA":"\u5F85\u547D",$l=class extends gs{operations(t,e,i){if(i.carrier){let s=i.carrier,r=i.canCommand&&!i.commandPending;this.text(t,"\u65E0\u4EBA\u50DA\u673A\u6307\u6325",28,118,32),this.text(t,`${s.active} / ${s.capacity}`,610,120,38,pe.cyan,"right"),this.text(t,`\u81EA\u52A8\u8865\u5145 \xB7 ${Math.ceil(s.nextWave||0)} s`,28,164,28,pe.muted),this.text(t,`\u5168\u519B\u653B\u51FB +${Math.round((s.aura||0)*100)}%`,610,164,26,pe.gold,"right");for(let[m,[x,M]]of[["assault","\u7A81\u51FB \xB7 \u653B\u51FB\u76EE\u6807"],["guard","\u62A4\u536B \xB7 \u63A9\u62A4\u6BCD\u8230"]].entries())this.choice(t,e,M,26+m*305,190,283,"mode",x,s.mode===x,r);this.text(t,"\u62A4\u822A\u9635\u578B",28,288,28,pe.muted);for(let[m,[x,M]]of[["wedge","\u6954\u5F62"],["screen","\u5C4F\u969C"],["orbit","\u73AF\u7ED5"]].entries())this.choice(t,e,M,26+m*202,308,184,"formation",x,s.formation===x,r);let a=i.contacts.find(m=>m.id===i.target),u=!s.focusAutomatic&&(s.focusCooldown||0)>0;this.text(t,a?"\u76EE\u6807 \xB7 "+a.name:"\u5148\u5728\u53F3\u5C4F\u6216\u5168\u606F\u96F7\u8FBE\u9009\u62E9\u76EE\u6807",28,410,27,pe.text,"left",580),this.button(t,e,u?"\u96C6\u706B\u51B7\u5374 "+s.focusCooldown.toFixed(1)+" s":"\u4E0B\u8FBE\u96C6\u706B\u6307\u4EE4",26,435,588,"focus",null,r&&!!a?.enemy&&!u),this.text(t,i.command||(i.canCommand?"\u9635\u578B\u63A7\u5236\u672C\u8230\u50DA\u673A \xB7 \u96C6\u706B\u8054\u52A8\u9644\u8FD1\u53CB\u8230":"\u53EA\u8BFB \xB7 "+(i.replay?"\u5386\u53F2\u8BB0\u5F55":"\u8FDB\u5165\u6218\u573A\u540E\u542F\u7528\u6307\u6325")),28,531,25,pe.gold,"left",580)}else this.text(t,i.weaponName||"\u4E3B\u6B66\u5668",28,120,32,pe.text,"left",420),this.text(t,pu(i.weapon),610,120,28,pe.cyan,"right"),this.text(t,`\u6709\u6548\u5C04\u7A0B ${Math.round(i.weapon?.range||0)} m`,28,166,28,pe.muted),this.button(t,e,"\u4E3B\u6B66\u5668\u5F00\u706B \xB7 SPACE",26,191,588,"fire",null,i.manual&&i.weapon?.reason!=="unavailable"),this.line(t,26,277,614,277),this.text(t,"\u5BFC\u5F39 / \u8F85\u52A9\u6B66\u5668",28,322,30),this.text(t,pu(i.missile),610,322,28,pe.cyan,"right"),this.button(t,e,"\u5BFC\u5F39\u9F50\u5C04 \xB7 R",26,351,588,"missile",null,i.manual&&i.missile?.reason!=="unavailable"),this.text(t,i.solution||"\u9009\u62E9\u654C\u65B9\u76EE\u6807",28,463,28,pe.gold,"left",580),this.text(t,i.command||"\u70AE\u7EC4\u7531\u8230\u8F7D\u706B\u63A7\u8FFD\u8E2A\u76EE\u6807",28,531,25,pe.muted,"left",580)}choice(t,e,i,s,r,a,u,m,x,M){this.button(t,e,(x?"\u25C6 ":"")+i,s,r,a,u,m,M),x&&(t.fillStyle=pe.cyan,t.fillRect(s,r+52,a,3))}contacts(t,e,i){let s=i.contacts.filter(u=>u.enemy),r=s.find(u=>u.id===i.target),a=[...r?[r]:[],...s.filter(u=>u!==r)].slice(0,4);a.length||this.text(t,"\u65E0\u654C\u65B9\u63A5\u89E6",28,136,30,pe.muted),a.forEach((u,m)=>{let x=90+m*64;t.fillStyle=u===r?"#35242b":"#0a2130",t.fillRect(24,x,592,56),this.text(t,"\u25C7 "+u.name,38,x+36,30,u===r?pe.gold:pe.text,"left",390),this.text(t,Math.round(u.distance)+" m",602,x+36,27,pe.muted,"right"),e.hits.push({x:24,y:x,w:592,h:56,action:"select",value:String(u.id)})}),this.button(t,e,"\u4E0B\u4E00\u76EE\u6807 \xB7 T",26,366,281,"target",null,!!s.length),this.button(t,e,i.locked?"\u89E3\u9664\u5BF9\u51C6 \xB7 X":"\u8230\u824F\u5BF9\u51C6 \xB7 X",327,366,287,"lock",null,i.manual&&!!s.length),this.text(t,r?"\u76EE\u6807\u8230\u4F53  "+Kl(r.hull)+"%":"\u76EE\u6807\u8230\u4F53  \u2014",28,475,28,pe.muted),this.bar(t,r?.hull||0,290,462,324,pe.gold),this.text(t,i.carrier?"\u7EA2 / \u654C\u8230\u3000\u9752 / \u53CB\u8230\u3000\u91D1 / \u672C\u8230\u50DA\u673A":"\u70B9\u51FB\u76EE\u6807\u6216\u4E2D\u592E\u5168\u606F\u6807\u8BB0\u9501\u5B9A",28,531,25,pe.cyan,"left",580)}helm(t,e,i){this.text(t,Math.round(i.speed)+" m/s",28,125,38),this.text(t,"HDG "+String(Math.round((i.heading*180/Math.PI+360)%360)).padStart(3,"0"),610,123,30,pe.cyan,"right");for(let[s,[r,a,u]]of[["\u62A4\u76FE",i.shield,pe.cyan],["\u8230\u4F53",i.hull,pe.gold]].entries()){let m=187+s*67;this.text(t,r,28,m,30,pe.muted),this.bar(t,a,145,m-15,330,u),this.text(t,Kl(a)+"%",610,m,32,u,"right")}this.text(t,"\u6CB9\u95E8 "+Kl(i.throttle*100)+"%",28,321,30,pe.muted),this.button(t,e,"\u2212",333,282,125,"slower",null,i.manual),this.button(t,e,"+",479,282,135,"faster",null,i.manual),this.button(t,e,i.manual?"\u4EA4\u8FD8 AI \xB7 G":"\u63A5\u7BA1\u9A7E\u9A76 \xB7 G",26,367,588,"auto",null,i.canPilot&&!i.replay),this.text(t,i.walking?"\u4E2D\u952E\u73AF\u89C6 \xB7 W/A/S/D \u8230\u6865\u884C\u8D70":"\u4E2D\u952E\u73AF\u89C6 \xB7 C \u56DE\u6B63",28,458,25,pe.muted)}},go=class{constructor(t){this.kind=t,this.group=new Ge,this.resources=[],this.markers=new Map,this.pickables=[],this.raycaster=new Hs,this.displays=new $l(M=>this.keep(new fi(M)),Jl(t));for(let M of this.displays.displays){let y=this.box([M.size[0]+.18,M.size[1]+.18,.19],2439492);y.position.fromArray($e(M,[0,0,-.1])),y.rotation.set(M.rotation[0],M.rotation[1],0,"YXZ");let h=new ae(this.keep(new rn(...M.size)),this.keep(new Pe({map:M.texture,toneMapped:!1})));h.position.fromArray($e(M,[0,0,.003])),h.rotation.copy(y.rotation),this.group.add(h);for(let l of[-1,1]){let p=this.box([.035,M.size[1]-.12,.025],6855594);p.position.fromArray($e(M,[l*(M.size[0]/2+.05),0,.006])),p.rotation.copy(y.rotation)}this.box([.32,1.1,.42],1518391).position.set(M.pos[0],M.pos[1]-M.size[1]/2-.45,M.pos[2]-.2)}let e=jl(t);this.holo=new Ge,this.holo.position.fromArray(e.pos),this.group.add(this.holo),this.radius=e.radius;let i=(M,y,h,o)=>{let l=new ae(this.keep(new os(M,M*.88,y,48)),this.keep(new Pe({color:o})));return l.position.y=h,this.holo.add(l),l};i(1.62,.9,-.42,1518649),i(2.28,.18,.08,4217961),i(2.13,.04,.19,399396),this.grid=new Ge,this.grid.position.y=1.6,this.holo.add(this.grid);for(let M of[.52,1.05,1.57,2.1])this.ring(M,0,5541285,this.grid,.52);this.ring(2.23,.02,9758714,this.grid,.85);let s=[];for(let M=-4;M<=4;M++){let y=M*.5,h=Math.sqrt(Math.max(0,this.radius*this.radius-y*y));s.push(y,0,-h,y,0,h,-h,0,y,h,0,y)}this.lineMesh(s,4423576,this.grid,.3);let r=this.keep(new ge().setFromPoints([new W,new W(2.1,0,0)]));this.sweep=new An(r,this.keep(new sn({color:9037823,transparent:!0,opacity:.7}))),this.grid.add(this.sweep);let a=new ae(this.keep(new ls(.11,.32,3)),this.keep(new Pe({color:12382207,wireframe:!0})));a.rotation.x=-Math.PI/2,a.position.y=2.1,this.holo.add(a),this.ring(.19,1.65,12382207,this.holo,.85);let u=[];for(let M=0;M<8;M++){let y=M/8*Math.PI*2;u.push(Math.sin(y)*.5,.24,Math.cos(y)*.5,Math.sin(y)*2.1,1.6,Math.cos(y)*2.1)}this.lineMesh(u,6075866,this.holo,.14),this.titleCanvas=document.createElement("canvas"),this.titleCanvas.width=1024,this.titleCanvas.height=128;let m=this.keep(new fi(this.titleCanvas));this.title=new ae(this.keep(new rn(3.5,.44)),this.keep(new Pe({map:m,transparent:!0,depthWrite:!1,toneMapped:!1}))),this.title.position.set(0,2.7,0),this.title.rotation.x=-.12,this.holo.add(this.title),this.titleTexture=m;let x=new ae(this.keep(new Bs(2.3,48)),this.keep(new Pe({visible:!1,side:Ee})));x.rotation.x=-Math.PI/2,x.position.y=.21,this.holo.add(x),this.pickables.push(x)}keep(t){return this.resources.push(t),t}box(t,e){let i=new ae(this.keep(new Ti(...t)),this.keep(new Pe({color:e})));return this.group.add(i),i}lineMesh(t,e,i,s=1){let r=this.keep(new ge);r.setAttribute("position",new he(t,3));let a=new Cn(r,this.keep(new sn({color:e,transparent:!0,opacity:s,depthWrite:!1})));return i.add(a),a}ring(t,e,i,s,r){let a=[];for(let u=0;u<96;u++){let m=u/96*Math.PI*2,x=(u+1)/96*Math.PI*2;a.push(Math.sin(m)*t,e,Math.cos(m)*t,Math.sin(x)*t,e,Math.cos(x)*t)}return this.lineMesh(a,i,s,r)}update(t,e){if(this.displays.update(t,e),this.sweep.rotation.y=-e*.45,!t||this.lastPaint!=null&&e-this.lastPaint<.05&&e>=this.lastPaint)return;this.lastPaint=e;let i=new Set;for(let r of t.contacts){i.add(r.id);let a=this.markers.get(r.id);if(!a){let f=new Ge,E=new ls(.085,.24,4),_=new Pe({color:9165294,wireframe:!0,transparent:!0,opacity:.95}),v=new ae(E,_);v.rotation.x=-Math.PI/2,f.add(v);let A=new ge().setFromPoints([new W,new W]),P=new sn({color:5541285,transparent:!0,opacity:.6}),C=new An(A,P);this.holo.add(C,f);let d=new ae(new Rn(.16,8,6),new Pe({visible:!1}));f.add(d),this.pickables.push(d),a={group:f,icon:v,stem:C,hit:d,resources:[E,_,A,P,d.geometry,d.material]},this.markers.set(r.id,a)}let u=r.pos[0]-t.pos[0],m=r.pos[2]-t.pos[2],x=-u*Math.cos(t.heading)+m*Math.sin(t.heading),M=u*Math.sin(t.heading)+m*Math.cos(t.heading),y=Math.max(t.scanRange,Math.hypot(x,M)),h=x/y*1.97,o=-M/y*1.97,l=1.95+Math.max(-.14,Math.min(.8,(r.pos[1]-t.pos[1])/t.scanRange*3));a.group.position.set(h,l,o);let p=r.id===t.target,c=p?16765090:r.enemy?16745080:r.drone?15254667:9165294;a.icon.material.color.setHex(c),a.icon.scale.setScalar(p?1.55:1),a.stem.material.color.setHex(c),a.stem.geometry.attributes.position.setXYZ(0,h,1.61,o),a.stem.geometry.attributes.position.setXYZ(1,h,l,o),a.stem.geometry.attributes.position.needsUpdate=!0,a.hit.userData=r.enemy?{action:"select",value:String(r.id)}:{}}for(let[r,a]of this.markers)i.has(r)||(a.group.removeFromParent(),a.stem.removeFromParent(),a.resources.forEach(u=>u.dispose()),this.pickables.splice(this.pickables.indexOf(a.hit),1),this.markers.delete(r));let s=[t.carrier?"\u65D7\u8230\u6218\u672F\u6001\u52BF":"\u6218\u5217\u8230\u6218\u672F\u6001\u52BF",Math.round(t.scanRange),t.contacts.length].join("|");if(s!==this.titleKey){this.titleKey=s;let r=this.titleCanvas.getContext("2d");r.clearRect(0,0,1024,128),r.fillStyle="#a3e5fa",r.textAlign="center",r.font='32px "Microsoft YaHei"',r.fillText((t.carrier?"FLEET COMMAND / \u65D7\u8230\u6001\u52BF":"TACTICAL DISPLAY / \u6218\u672F\u6001\u52BF")+"  \xB7  "+Math.round(t.scanRange)+" m",512,51),r.fillStyle="#6dacc5",r.font='24px "Microsoft YaHei"',r.fillText("\u5B9E\u65F6\u63A5\u89E6 "+t.contacts.length+"  \xB7  \u70B9\u51FB\u7EA2\u8272\u6807\u8BB0\u9009\u62E9\u76EE\u6807",512,96),this.titleTexture.needsUpdate=!0}this.group.updateMatrixWorld(!0)}pick(t,e){let i=this.displays.pick(t.toArray(),e.toArray());this.raycaster.set(t,e);let s=this.raycaster.intersectObjects(this.pickables,!1).filter(u=>!i||u.distance<i.distance),r=u=>{let m=u.object.getWorldPosition(new W);return this.raycaster.ray.distanceSqToPoint(m)/Math.max(.01,m.distanceToSquared(t))},a=s.filter(u=>u.object.userData.action).sort((u,m)=>r(u)-r(m))[0]||s[0];return a?{surface:"hologram",...a.object.userData}:i}layout(t){return[...this.displays.layout(t),{id:"hologram",corners:[],controls:[...this.markers.values()].filter(e=>e.hit.userData.action).map(e=>({action:e.hit.userData.action,value:e.hit.userData.value,point:t(e.group.getWorldPosition(new W).toArray())}))}]}dispose(){for(let t of this.markers.values())t.resources.forEach(e=>e.dispose());this.resources.forEach(t=>t.dispose()),this.group.clear()}};var xo=class{constructor(t){this.backend=t,this.rooms=new Map,this.camera=new Re,this.vp=new se,this.canvas=document.createElement("canvas"),this.canvas.width=1024,this.canvas.height=512,this.texture=new fi(this.canvas),this.labels=document.createElement("canvas"),this.labels.width=1024,this.labels.height=512,this.labelTexture=new fi(this.labels),this.labelAtlas()}labelAtlas(){let t=this.labels.getContext("2d"),e=["COMMAND","NAVIGATION","TACTICAL","COMMS","PORT","STARBOARD","FLIGHT DECK","ENGINEERING","AUTO HELM","BASTION","CREW","SYSTEMS","OPERATIONS","DECK 01","HORIZON","BRIDGE"];t.clearRect(0,0,1024,512),e.forEach((i,s)=>{t.fillStyle="#b8d5db",t.font="22px sans-serif",t.textAlign="center",t.fillText(i,s%4*256+128,Math.floor(s/4)*128+70)}),this.labelTexture.needsUpdate=!0}room(t){if(this.rooms.has(t))return this.rooms.get(t);let e=t==="bastion"?ou():t==="horizon"?lu():null,i=new di,s=[],r=[],a=e?.groups||{fighter:this.backend.cockpit,...Object.fromEntries(this.backend.screens.map((x,M)=>["screen"+M,x]))};for(let[x,M]of Object.entries(a)){let y=M.data;if(t==="horizon"&&y){let v=[];for(let A=0;A<y.length;A+=39){let P=!0;for(let C=0;C<3;C++){let d=A+C*13;(Math.abs(y[d])>.28||y[d+2]>-13.2||y[d+1]<.8||y[d+1]>6.3)&&(P=!1)}if(!P)for(let C=0;C<39;C++)v.push(y[A+C])}y=v}let h=M.geometry||po(y);M.geometry||s.push(h);let o=x.startsWith("screen"),l=x==="labels",p=x==="glass",c=x==="holo",f=Object.fromEntries(Object.entries({uModel:new se,uVP:this.vp,uEye:new W,uLight:new W(-.35,.8,.6),uOpacity:p?.028:c?.36:1,uMode:o?2:l?3:0,uRoom:t==="fighter"?0:1,uTime:0,uLighting:1,uTexture:l?this.labelTexture:this.texture,uCity:this.texture}).map(([v,A])=>[v,{value:A}])),E=new an({vertexShader:cu,fragmentShader:hu,uniforms:f,side:Ee,transparent:p||c||l,depthWrite:!(p||c||l),blending:c?In:Bi,toneMapped:!1});r.push(E),t==="fighter"&&o&&(f.uTexture.value=this.backend.fighterConsole.displays[Number(x.slice(-1))].texture);let _=new ae(h,E);_.frustumCulled=!1,i.add(_)}let u=t==="fighter"?null:new go(t);u&&i.add(u.group);let m={scene:i,geometries:s,materials:r,console:u,obstacles:e?.obstacles||[]};return this.rooms.set(t,m),m}instruments(t,e){if(t.kind==="fighter"){this.backend.fighterConsole.update(t.console,e);return}if(e-(this.lastUpdate??-1)<.15)return;this.lastUpdate=e;let i=this.canvas.getContext("2d"),s=t.row||[],r=t.meta||{},a=Math.round(100*(s[6]||0)/(r.maxHp||1)),u=Math.round(100*(s[7]||0)/(r.maxShield||1)),m=[["HELM",`${Math.round(s[9]||0)} m/s`,t.auto?"AUTO / AI":"MANUAL"],["DEFENSE",`HULL ${a}%`,`SHIELD ${u}%`],["TACTICAL",`CONTACT ${s[8]>=0?s[8]+1:"\u2014"}`,`${t.counts?.join(" : ")||"LIVE FEED"}`],["PRIMARY",`${(s[10]||0).toFixed(1)} s`,"WEAPON CYCLE"],["ENGINEERING",`${Math.round((t.throttle??0)*100)}%`,"THROTTLE"],["NAVIGATION",`${Math.round((s[4]||0)*180/Math.PI)}\xB0`,"HEADING"],["ORDNANCE",`${(s[11]||0).toFixed(1)} s`,"MISSILE CYCLE"],["FLEET",`${r.type||"VESSEL"}`,`T + ${Math.floor(e)} s`]];i.fillStyle="#07141c",i.fillRect(0,0,1024,512),m.forEach(([x,M,y],h)=>{let o=h%4*256,l=Math.floor(h/4)*256;i.strokeStyle="#28505e",i.strokeRect(o+8,l+8,240,240),i.fillStyle="#7da6ad",i.font="18px sans-serif",i.fillText(x,o+20,l+40),i.fillStyle="#d6f5ed",i.font="24px monospace",i.fillText(M,o+20,l+94,220),i.fillStyle="#72adbd",i.font="15px monospace",i.fillText(y,o+20,l+130,220);for(let p=0;p<8;p++)i.fillStyle=p<Math.round(a/12.5)?"#5fa6a7":"#132d39",i.fillRect(o+20+p*27,l+182,22,32)}),this.texture.needsUpdate=!0}pickFighterConsole(t,e){if(this.last?.kind!=="fighter")return null;let i=this.camera.position,s=new W(t/this.backend.width*2-1,1-e/this.backend.height*2,.5).unproject(this.camera),r=s.sub(i).normalize();return this.backend.fighterConsole.pick(i.toArray(),r.toArray())}fighterConsoleLayout(){return this.last?.kind!=="fighter"?[]:this.backend.fighterConsole.layout(t=>{let e=new W(...t).project(this.camera);return{x:(e.x+1)*this.backend.width/2,y:(1-e.y)*this.backend.height/2,visible:e.z>=-1&&e.z<=1}})}pickBridgeConsole(t,e){let i=this.rooms.get(this.last?.kind)?.console;if(!i)return null;let s=this.camera.position,r=new W(t/this.backend.width*2-1,1-e/this.backend.height*2,.5).unproject(this.camera).sub(s).normalize();return i.pick(s,r)}bridgeConsoleLayout(){let t=this.rooms.get(this.last?.kind)?.console;return t?t.layout(e=>{let i=new W(...e).project(this.camera);return{x:(i.x+1)*this.backend.width/2,y:(1-i.y)*this.backend.height/2,visible:i.z>=-1&&i.z<=1}}):[]}draw(t){let{kind:e,time:i=0,opacity:s=1}=t,r=this.room(e),a=t.pose||lr(e),u=this.camera;this.instruments(t,i),u.fov=(t.fov||Math.PI/3)*180/Math.PI,u.aspect=this.backend.width/this.backend.height,u.near=.035,u.far=180,u.position.fromArray(a.eye),u.up.set(0,1,0),u.lookAt(new W(...a.eye).add(new W(Math.sin(a.yaw)*Math.cos(a.pitch),Math.sin(a.pitch),-Math.cos(a.yaw)*Math.cos(a.pitch)))),u.updateProjectionMatrix(),u.updateMatrixWorld(),this.vp.multiplyMatrices(u.projectionMatrix,u.matrixWorldInverse),r.console?.update(t.console,i);for(let m of r.materials)m.uniforms.uEye.value.copy(u.position),m.uniforms.uTime.value=i,m.uniforms.uOpacity.value=s*(m.transparent?m.blending===In?.36:m.uniforms.uMode.value===3?1:.028:1);this.backend.three.clearDepth(),this.backend.three.render(r.scene,u),this.last={kind:e,eye:[...a.eye],yaw:a.yaw,pitch:a.pitch,triangles:this.backend.three.info.render.triangles}}dispose(){for(let t of this.rooms.values())t.console?.dispose(),t.geometries.forEach(e=>e.dispose()),t.materials.forEach(e=>e.dispose()),t.scene.clear();this.rooms.clear(),this.texture.dispose(),this.labelTexture.dispose()}};var ri=(n,t,e,i)=>[[-n,t,e,i],[n,t,e,i]],Av={Light_Fighter:[...ri(2.1,-.97,6.6,.21),...ri(3.8,-.22,6.7,.4)],Heavy_Fighter:ri(.755,.44375,2.07,.28),Cruiser:[...ri(1.9,-.3,5.94,.28),[0,-.28,6.05,.28]],Battleship:[...ri(1.09,.08,7.21,.31),[0,-.22,6.87,.18]],Bomber:[...ri(1.18,.07,6.01,.27),...ri(.45,-.2,6.07,.19)],Dreadnought:[...ri(1.525,.375,4.265,.46),[0,.05,4.065,.4]],Destroyer:[...[-1,1].map(n=>[n*3.31*Math.cos(.16)-n*.5*Math.sin(.16),-3.31*Math.sin(.16)-.5*Math.cos(.16),6.34,.3]),[0,1.27,6.91,.23]],Interceptor:[...ri(.81,.44,6.64,.34),...ri(.53,-2.03,6.34,.22)],Devourer_Interceptor:[...ri(2.85,-.38,6.13,.3),[0,-.14,7.04,.29]],Titanenergetic_Frigate:ri(1.2,-.63,4.9,.18),Iron_Behemoth:[[0,1.14,6.94,.43]]};function mu(n,t,e,i,s=0){let r=Math.max(0,Math.min(1,n/100)),a=1+Math.sin(e*i+s*1.7)*.045+Math.sin(e*37+s)*.018;return{length:(.28+r*18+(t?12:0))*a,width:.8+r*.2+(t?.12:0),alpha:.24+r*.56+(t?.18:0)}}function gu(){let n=[],i=(s,r,a)=>{let u=s/16,m=r/3*Math.PI,x=Math.pow(1-u,.8);return[u,a*x*Math.cos(m),a*x*Math.sin(m),0,-Math.sin(m),Math.cos(m),.3,.7,1,1,0,0,a]};for(let s=0;s<16;s++)for(let r=0;r<3;r++){let a=i(s,r,-1),u=i(s,r,1),m=i(s+1,r,1),x=i(s+1,r,-1);n.push(...a,...u,...m,...a,...m,...x)}return n}function Ql(n,t,e,i){if(!n?.capital)return 3;let s=n.radius*e/(Math.max(1,t)*Math.tan(i*.5));return Math.max(n.glow*Math.max(.12,Math.min(1,1400/Math.max(1,t))),Math.min(110,s*3.5))}function xu(n,t,e){let i=r=>(r=Math.max(0,Math.min(1,r)),r*r*(3-2*r)),s=Math.max(0,n)/Math.max(1,t);return 9*i(s)+8*i((s-1)/(e?.65:1.2))}function yu(n,t,e){return n+(t-n)*(1-Math.exp(-Math.max(0,e)*3.5))}function vu(n,t,e){let i=1/0,s=[0,0,0];for(let r=t.offset;r<t.offset+t.floatCount;r+=13){let a=(n[r]-e[0])**2+(n[r+1]-e[1])**2+(n[r+2]-e[2])**2;a<i&&(i=a,s=[n[r],n[r+1],n[r+2]])}return s}function _u(n,t,e,i,s){if(!(!(s>0)||!(i>0)))for(n.push({point:[...t],time:e,power:Math.min(1,.35+i/12),weak:s<25});n.length>3;)n.shift()}function Mu(){let n=[],e=(i,s)=>{let r=i/128*Math.PI*2;return[Math.cos(r)*s,0,Math.sin(r)*s,0,1,0,1,1,1,1,0,i/128,(s-.83)/.17]};for(let i=0;i<128;i++)n.push(...e(i,.83),...e(i,1),...e(i+1,1),...e(i,.83),...e(i+1,1),...e(i+1,.83));return n}function bu(n){return{collapse:Math.max(0,1-n/.38),wave:Math.max(0,Math.min(1,(n-.28)/1.1)),fade:Math.max(0,1-Math.max(0,n-1)/4.2)}}function tc(n,t,e){let i=n.mul(t,n.translate(...e.mount)),s=n.mul(i,n.ry(e.yaw||0)),r=n.mul(s,n.mul(n.translate(...e.pivot),n.mul(n.rz(-(e.pitch||0)),n.translate(...e.pivot.map(a=>-a)))));return{base:i,yaw:s,barrels:r}}function vo(n){let t=n instanceof Float32Array?n:new Float32Array(n);return{geometry:po(t),count:t.length/13,lineCount:t.length/13*2}}var mn=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],Sg={uModel:mn,uVP:mn,uEye:[0,0,0],uLight:[-.65,.9,.65],uOpacity:1,uSelected:-10,uMode:0,uWire:0,uTime:0,uExposure:1,uTint:[1,1,1],uNearFade:0,uFighter:0,uShellOffset:0,uImpact:[0,0,0,0],uShield:[1,0],uTexture:null,uTeamColor:[.086,.545,.922]},Su=`attribute vec3 aPosition,aNormal,aColor;attribute float aTag,aEmission;uniform vec3 teamColor;uniform mat4 vp;varying vec3 color;
void main(){vec3 normal=normalize(mat3(instanceMatrix)*aNormal);
float light=.68+.72*max(0.,dot(normal,normalize(vec3(-.5,.9,.7))))+.2*max(0.,dot(normal,normalize(vec3(.8,-.1,-.7))));
vec3 base=abs(aTag-77.)<.1?teamColor:aColor;color=pow(base,vec3(.85))*mix(light,1.2,clamp(aEmission,0.,1.));gl_Position=vp*instanceMatrix*vec4(aPosition,1.);}`,wu="varying vec3 color;uniform vec3 tint;void main(){gl_FragColor=vec4(color*tint,1.);}",wg=`attribute vec3 aPosition,aNormal,aColor;attribute float aEmission;uniform mat4 vp;
varying vec3 color,localPosition,surfaceNormal;varying float emission;
void main(){surfaceNormal=normalize(mat3(instanceMatrix)*aNormal);localPosition=aPosition;color=aColor;emission=aEmission;gl_Position=vp*instanceMatrix*vec4(aPosition,1.);}`,Eg=`varying vec3 color,localPosition,surfaceNormal;varying float emission;uniform vec3 tint;
float grain(vec3 p){return fract(sin(dot(p,vec3(17.13,93.71,41.37)))*43758.5453);}
void main(){vec3 n=normalize(surfaceNormal);float key=max(0.,dot(n,normalize(vec3(-.5,.9,.7))));
float noise=grain(floor(localPosition*3.));float stain=grain(floor(localPosition*vec3(.18,.06,.18)));
float seams=step(.35,mod(localPosition.y+1.,9.));
float weather=(.86+.1*noise+.06*stain)*mix(.78,1.,seams);
vec3 light=vec3(.22,.27,.32)+vec3(.76,.71,.61)*key;
vec3 shaded=color*light*weather;shaded=mix(shaded,color,emission*.75);
gl_FragColor=vec4(shaded*tint,1.);}`,Tg="attribute vec3 p,c;attribute vec2 texcoord;attribute float a;uniform mat4 vp;varying vec3 color;varying vec2 tex;varying float alpha;void main(){color=c;tex=texcoord;alpha=a;gl_Position=vp*vec4(p,1.);}",Ag="varying vec3 color;varying vec2 tex;varying float alpha;void main(){float edge=abs(tex.y);float core=exp(-edge*edge*110.);float halo=exp(-edge*edge*5.)*.7;float cap=smoothstep(0.,.025,tex.x)*smoothstep(0.,.025,1.-tex.x);gl_FragColor=vec4(mix(color,vec3(1.,.96,.87),core*.7),(core+halo)*alpha*cap);}",Cg="attribute vec2 skyPosition;varying vec2 screenUV;void main(){screenUV=skyPosition;gl_Position=vec4(skyPosition,1.,1.);}",Rg=`varying vec2 screenUV;uniform sampler2D image;uniform vec3 forward,right,up;uniform vec2 shift;uniform float aspect,tanHalf,exposure;
void main(){vec3 d=normalize(forward+right*(screenUV.x+shift.x)*aspect*tanHalf+up*(screenUV.y+shift.y)*tanHalf);
vec2 st=vec2(fract(atan(d.z,d.x)/6.28318530718+.5),acos(clamp(d.y,-1.,1.))/3.14159265359);
vec4 tex=texture2D(image,st);vec3 c=tex.rgb*tex.a*16.*exposure;
c=clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.);gl_FragColor=vec4(pow(c,vec3(1./2.2)),1.);}`,Fn=(n,t,e={})=>au(n,t,Object.fromEntries(Object.entries(e).map(([i,s])=>[i,{value:s}])),{raw:!1,transparent:!0,side:Ee,depthTest:!0,depthWrite:!0,depthFunc:ts,blending:pa,blendEquation:ui,blendEquationAlpha:ui,blendSrc:bn,blendSrcAlpha:bn,blendDst:Qi,blendDstAlpha:Qi,toneMapped:!1,premultipliedAlpha:!1,forceSinglePass:!0}),yo=class{constructor(t,e,i){this.canvas=t,this.shaders=e,this.assets=i,this.three=new co({canvas:t,alpha:!0,antialias:!0,premultipliedAlpha:!1,powerPreference:"high-performance"}),this.gl=this.three.getContext(),this.three.autoClear=!1,this.three.outputColorSpace=wn,this.three.toneMapping=je,this.three.info.autoReset=!1,this.scene=new di,this.overlay=new di,this.camera=new Vi,this.camera.matrixAutoUpdate=!1,this.meshPools=new Map,this.dynamicPools=new Map,this.instanceBatches=new Map,this.materials=new Map,this.geometryResources=new Set,this.textures=new Set,this.lowMeshes=new Map,this.shaderErrors=[],this.three.debug.onShaderError=(s,r,a,u)=>{let m=[s.getProgramInfoLog(r),s.getShaderInfoLog(a),s.getShaderInfoLog(u)].filter(Boolean).join(`
`);this.shaderErrors.push(m),console.error("Three.js shader compilation failed",m)},this._onContextLost=s=>{s.preventDefault();let r=document.getElementById("no-webgl"),a=document.getElementById("webgl-error");r&&(r.hidden=!1),a&&(a.textContent="\u56FE\u5F62\u4E0A\u4E0B\u6587\u5DF2\u4E22\u5931\u3002\u8BF7\u5237\u65B0\u9875\u9762\u91CD\u65B0\u521D\u59CB\u5316\u3002")},t.addEventListener("webglcontextlost",this._onContextLost),this.vp=new Float64Array(mn),this.eye=[0,0,0],this._relative=new Float64Array(16),this._blend=!1,this._depthWrite=!0,this._depthTest=!0,this._frontSide=!1,this._layer=0,this._order=0,this.frame=0,this.disposed=!1,this.resize()}resize(t=globalThis.innerWidth,e=globalThis.innerHeight,i){this.width=t||this.canvas.clientWidth||1,this.height=e||this.canvas.clientHeight||1;let s=new URLSearchParams(globalThis.location?.search||"").get("dpr");this.dpr=i??(s?Number(s):Math.min(globalThis.devicePixelRatio||1,1.6)),this.dpr>0||(this.dpr=1),this.three.setPixelRatio(this.dpr),this.three.setSize(this.width,this.height,!1)}texture(t){let e=new fi(t);return e.minFilter=e.magFilter=we,e.generateMipmaps=!1,e.colorSpace=si,this.textures.add(e),e}flatBuffer(t){let e=t instanceof Float32Array?t:new Float32Array(t),i=new ge,s=new en(e,7);for(let[r,a,u]of[["aPosition",3,0],["aColor",3,3],["aSize",1,6]])i.setAttribute(r,new nn(s,a,u));return i.setAttribute("position",i.getAttribute("aPosition")),this.geometryResources.add(i),{geometry:i,count:e.length/7}}relativeVP(){let t=this.vp,e=this.eye,i=this._relative;i.set(t);for(let s=0;s<4;s++)i[12+s]=t[s]*e[0]+t[4+s]*e[1]+t[8+s]*e[2]+t[12+s];return i}setBlend(t,e){this._blend=!!t,e!==void 0&&(this._depthWrite=!!e)}setDepthWrite(t){this._depthWrite=!!t}setDepthTest(t){this._depthTest=!!t}setSide(t){this._frontSide=!!t}beginOverlay(){this._layer=1}_state(t={}){return{blend:t.additive??this._blend,depthWrite:t.depthWrite??this._depthWrite,depthTest:t.depthTest??this._depthTest,front:t.frontOnly??this._frontSide}}_material(t,e,i=!1){let s=[t,+e.blend,+e.depthWrite,+e.depthTest,+e.front,+i].join(":"),r=this.materials.get(s);if(r)return r;if(t==="main")r=Fn(this.shaders.vertexSource,this.shaders.fragmentSource,{...Sg});else if(t==="flat")r=Fn(this.shaders.flatVertex,this.shaders.flatFragment,{uMatrix:mn,uDpr:1,uAlpha:1,uPointMode:0});else if(t==="impact")r=Fn(this.shaders.impactVertex.replace("attribute vec2 uv;","attribute vec2 texcoord;").replace("tex=uv;","tex=texcoord;"),this.shaders.impactFragment,{vp:mn});else if(t==="ribbon")r=Fn(Tg,Ag,{vp:mn});else if(t==="fleet")r=Fn(Su,wu,{vp:mn,tint:[1,1,1]});else throw new Error("Unknown renderer material "+t);return r.blendDst=r.blendDstAlpha=e.blend?ma:Qi,r.depthWrite=e.depthWrite,r.depthTest=e.depthTest,r.side=e.front?hi:Ee,r.wireframe=i,this.materials.set(s,r),r}_queue(t,e,i="mesh",s={}){let r=[t.id,e.id,i,this._layer].join(":"),a=this.meshPools.get(r);a||(a={items:[],cursor:0},this.meshPools.set(r,a));let u=a.items[a.cursor++];return u||(u=i==="points"?new Ns(t,e):i==="lines"?new Cn(t,e):new ae(t,e),u.frustumCulled=!1,u.matrixAutoUpdate=!1,u.onBeforeRender=()=>{for(let[m,x]of Object.entries(u.userData.uniforms))e.uniforms[m].value=x;e.uniformsNeedUpdate=!0},a.items.push(u),(this._layer?this.overlay:this.scene).add(u)),u.userData.uniforms=s,u.visible=!0,u.renderOrder=this._order++,this.geometryResources.add(t),u}drawMesh(t,e,i={}){if(!t||i.opacity===0)return;let s=new Float32Array(e);for(let a=0;a<3;a++)s[12+a]=e[12+a]-this.eye[a];let r={uModel:s,uVP:new Float32Array(this.relativeVP()),uEye:[0,0,0],uLight:i.light||[-.65,.9,.65],uOpacity:i.opacity??1,uSelected:i.selected??-10,uMode:i.mode||0,uWire:i.wire?1:0,uTime:this.time||0,uExposure:i.exposure??1,uTint:i.tint||[1,1,1],uTeamColor:i.teamColor||[.086,.545,.922],uNearFade:i.nearFade||0,uFighter:i.fighter?1:0,uShellOffset:i.shellOffset||0,uImpact:i.impact||[0,0,0,0],uShield:i.shield||[1,0],uTexture:i.texture||this.moonTexture};this._queue(t.geometry,this._material("main",this._state(i),!!i.wire),"mesh",r)}drawFlat(t,e,i=!1,s=1){t?.count&&this._queue(t.geometry,this._material("flat",this._state()),i?"points":"lines",{uMatrix:new Float32Array(e),uDpr:this.dpr,uAlpha:s,uPointMode:i?1:0})}_dynamic(t,e,i,s,r,a="mesh",u=this._state()){if(!e.length)return;let m=this._material(t,u),x=[t,m.id,a,this._layer].join(":"),M=this.dynamicPools.get(x);M||(M={items:[],cursor:0},this.dynamicPools.set(x,M));let y=M.cursor++,h=M.items[y];if(!h||h.buffer.array.length<e.length){if(h){this.geometryResources.delete(h.geometry),h.geometry.dispose();for(let[f,E]of this.meshPools)if(f.startsWith(h.geometry.id+":")){for(let _ of E.items)_.removeFromParent();this.meshPools.delete(f)}}let o=Math.max(i*64,2**Math.ceil(Math.log2(e.length))),l=new Float32Array(Math.ceil(o/i)*i),p=new ge,c=new en(l,i);c.setUsage(so);for(let[f,E,_]of s)p.setAttribute(f,new nn(c,E,_));p.setAttribute("position",p.getAttribute(s[0][0])),h={geometry:p,buffer:c},M.items[y]=h,this.geometryResources.add(p)}h.buffer.array.set(e),h.buffer.clearUpdateRanges(),h.buffer.addUpdateRange(0,e.length),h.buffer.needsUpdate=!0,h.geometry.setDrawRange(0,e.length/i),this._queue(h.geometry,m,a,r)}dynamicFlat(t,e=!1,i=1){let s=Float32Array.from(t);for(let r=0;r<s.length;r+=7)for(let a=0;a<3;a++)s[r+a]=t[r+a]-this.eye[a];this._dynamic("flat",s,7,[["aPosition",3,0],["aColor",3,3],["aSize",1,6]],{uMatrix:new Float32Array(this.relativeVP()),uDpr:this.dpr,uAlpha:i,uPointMode:e?1:0},e?"points":"lines")}points(t,e=1){this.dynamicFlat(t,!0,e)}drawRibbons(t){this._dynamic("ribbon",t,9,[["p",3,0],["c",3,3],["texcoord",2,6],["a",1,8]],{vp:new Float32Array(this.relativeVP())},"mesh",{blend:!0,depthWrite:!1,depthTest:!0,front:!1})}drawImpacts(t){this._dynamic("impact",t,10,[["p",3,0],["c",3,3],["texcoord",2,6],["fx",2,8]],{vp:new Float32Array(this.relativeVP())},"mesh",{blend:!0,depthWrite:!1,depthTest:!0,front:!1})}drawInstances(t,{type:e,index:i,geometry:s,high:r=!1,matrices:a,count:u,ids:m,tint:x=[1,1,1],teamColor:M=[.086,.545,.922]}){if(u??=m.length,!u)return;let y=t+":"+(r?"high":"low"),h=this.instanceBatches.get(y),o=s||this.shipMeshes[i];if(!r&&!s){let l=e||this.assets?.ships?.find(c=>c.id===t.split(":").at(-1))?.id,p=this.assets?.ships?.find(c=>c.id===(l||this.assets.ships[i]?.id));p&&(o=this.lowMeshes.get(p.id),o||(o=vo(this.assets.vertices.subarray(p.low.offset,p.low.offset+p.low.floatCount)),this.lowMeshes.set(p.id,o)))}if(o){if(!h||h.capacity<u||h.mesh.geometry!==o.geometry){h&&(h.mesh.removeFromParent(),h.mesh.dispose(),h.mesh.material.dispose());let l=2**Math.ceil(Math.log2(Math.max(1,u))),p=Fn(s?wg:Su,s?Eg:wu,{vp:mn,tint:x,teamColor:M}),c=new Ds(o.geometry,p,l);c.instanceMatrix.setUsage(so),c.frustumCulled=!1,c.matrixAutoUpdate=!1,h={mesh:c,capacity:l,ids:[],idToSlot:new Map},this.instanceBatches.set(y,h),this.scene.add(c),this.geometryResources.add(o.geometry)}h.mesh.visible=!0,h.mesh.renderOrder=this._order++,h.mesh.count=u,h.mesh.instanceMatrix.array.set(a.subarray?a.subarray(0,u*16):a.slice(0,u*16)),h.mesh.instanceMatrix.clearUpdateRanges(),h.mesh.instanceMatrix.addUpdateRange(0,u*16),h.mesh.instanceMatrix.needsUpdate=!0,h.mesh.material.uniforms.vp.value=new Float32Array(this.relativeVP()),h.mesh.material.uniforms.tint.value=x,h.mesh.material.uniforms.teamColor.value=M,h.ids=Array.from(m).slice(0,u),h.idToSlot.clear(),h.ids.forEach((l,p)=>h.idToSlot.set(l,p))}}drawFleetInstances(t,e,i,s,r={}){this.drawInstances(t,{...r,index:e,matrices:i,ids:s,count:s.length,type:r.type||t.split(":").at(-1)})}resetInstances(){for(let t of this.instanceBatches.values())t.mesh.removeFromParent(),t.mesh.dispose(),t.mesh.material.dispose();this.instanceBatches.clear()}drawSpaceSky(t=1){if(!this.sky){let r=new Tn(new Uint8Array([1,2,4,1]),1,1);r.needsUpdate=!0,this.textures.add(r);let a=Fn(Cg,Rg,{image:r,forward:[0,0,-1],right:[1,0,0],up:[0,1,0],shift:[0,0],aspect:1,tanHalf:1,exposure:1});a.depthWrite=!1,a.depthTest=!1,a.blending=ei;let u=new ge;u.setAttribute("skyPosition",new he([-1,-1,3,-1,-1,3],2)),u.setAttribute("position",new he([-1,-1,0,3,-1,0,-1,3,0],3)),this.sky={geometry:u,material:a,ready:!1,error:null,draws:0,source:"HDR Multi Nebulae 2"};let m=new zs().load("/opendesign/shared/assets/multi-nebulae-2-rgbm.png",()=>{this.disposed||(this.sky.ready=!0)},void 0,x=>{this.disposed||(this.sky.error=String(x))});m.flipY=!1,m.colorSpace=si,m.wrapS=es,m.minFilter=Ai,this.textures.add(m),a.uniforms.image.value=m}let e=new W(...this.cameraForward||[0,0,-1]).normalize(),i=new W().crossVectors(e,new W(...this.cameraUp||[0,1,0])).normalize(),s=new W().crossVectors(i,e);this._queue(this.sky.geometry,this.sky.material,"mesh",{image:this.sky.material.uniforms.image.value,forward:e.toArray(),right:i.toArray(),up:s.toArray(),shift:[this.projectionShiftX||0,this.projectionOffset||0],aspect:this.width/this.height,tanHalf:Math.tan((this.fov||Math.PI/3)/2),exposure:t}),this.sky.draws++}begin(t){this.time=t,this.frame++,this._order=0,this._layer=0,this._blend=!1,this._depthWrite=!0,this._depthTest=!0,this._frontSide=!1;for(let e of this.meshPools.values()){e.cursor=0;for(let i of e.items)i.visible=!1}for(let e of this.dynamicPools.values())e.cursor=0;for(let e of this.instanceBatches.values())e.mesh.visible=!1,e.ids=[],e.idToSlot.clear();this.three.info.reset(),this.three.setClearColor(0,0),this.three.clear(!0,!0,!0)}endFrame(){if(!this.disposed){if(this.three.render(this.scene,this.camera),this._layer&&(this.three.clearDepth(),this.three.render(this.overlay,this.camera)),this.shaderErrors.length)throw new Error(this.shaderErrors.at(-1));return this.lastStats=this.stats(),this.lastStats}}stats(){let t=this.three.info;return{backend:"three",frame:this.frame,calls:t.render.calls,triangles:t.render.triangles,points:t.render.points,lines:t.render.lines,geometries:t.memory.geometries,textures:t.memory.textures,programs:t.programs?.length||0,instances:[...this.instanceBatches.values()].reduce((e,i)=>e+(i.mesh.visible?i.mesh.count:0),0),shaderErrors:[...this.shaderErrors]}}getStats(){return this.stats()}dispose(){if(!this.disposed){this.disposed=!0,this.canvas.removeEventListener("webglcontextlost",this._onContextLost);for(let t of Object.values(this))if(t?.geometry&&this.geometryResources.add(t.geometry),Array.isArray(t))for(let e of t)e?.geometry&&this.geometryResources.add(e.geometry);for(let t of this.lowMeshes.values())this.geometryResources.add(t.geometry);this.resetInstances();for(let t of this.geometryResources)t.dispose();for(let t of this.materials.values())t.dispose();this.sky?.material.dispose();for(let t of this.textures)t.dispose();this.scene.clear(),this.overlay.clear(),this.meshPools.clear(),this.dynamicPools.clear(),this.materials.clear(),this.geometryResources.clear(),this.textures.clear(),this.lowMeshes.clear(),this.three.dispose()}}};function Eu(n,t){if(!n?.vertices||!n?.layouts)throw new Error("Flight fleet assets are required");let e=Math.PI*2,i=(C,d,b)=>Math.max(d,Math.min(b,C)),s=(C,d,b)=>C+(d-C)*b,r={add:(C,d)=>C.map((b,R)=>b+d[R]),sub:(C,d)=>C.map((b,R)=>b-d[R]),scale:(C,d)=>C.map(b=>b*d),dot:(C,d)=>C[0]*d[0]+C[1]*d[1]+C[2]*d[2],cross:(C,d)=>[C[1]*d[2]-C[2]*d[1],C[2]*d[0]-C[0]*d[2],C[0]*d[1]-C[1]*d[0]],length:C=>Math.hypot(...C),norm:C=>{let d=Math.hypot(...C)||1;return C.map(b=>b/d)}},a={identity:()=>new Float64Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),mul:(C,d)=>{let b=new Float64Array(16);for(let R=0;R<4;R++)for(let L=0;L<4;L++)b[R*4+L]=C[L]*d[R*4]+C[4+L]*d[R*4+1]+C[8+L]*d[R*4+2]+C[12+L]*d[R*4+3];return b},translate:(C,d,b)=>new Float64Array([1,0,0,0,0,1,0,0,0,0,1,0,C,d,b,1]),scale:(C,d=C,b=C)=>new Float64Array([C,0,0,0,0,d,0,0,0,0,b,0,0,0,0,1]),rx:C=>{let d=Math.cos(C),b=Math.sin(C);return new Float64Array([1,0,0,0,0,d,b,0,0,-b,d,0,0,0,0,1])},ry:C=>{let d=Math.cos(C),b=Math.sin(C);return new Float64Array([d,0,-b,0,0,1,0,0,b,0,d,0,0,0,0,1])},rz:C=>{let d=Math.cos(C),b=Math.sin(C);return new Float64Array([d,b,0,0,-b,d,0,0,0,0,1,0,0,0,0,1])},compose:(C=[0,0,0],d=[0,0,0],b=[1,1,1])=>a.mul(a.translate(...C),a.mul(a.ry(d[1]),a.mul(a.rx(d[0]),a.mul(a.rz(d[2]),a.scale(...b))))),transform:(C,d)=>[C[0]*d[0]+C[4]*d[1]+C[8]*d[2]+C[12],C[1]*d[0]+C[5]*d[1]+C[9]*d[2]+C[13],C[2]*d[0]+C[6]*d[1]+C[10]*d[2]+C[14]],perspective:(C,d,b,R,L=0)=>{let g=1/Math.tan(C/2),w=1/(b-R);return new Float64Array([g/d,0,0,0,0,g,0,0,L,0,(R+b)*w,-1,0,0,2*R*b*w,0])},lookAt:(C,d,b=[0,1,0])=>{let R=r.norm(r.sub(C,d)),L=r.norm(r.cross(b,R)),g=r.cross(R,L);return new Float64Array([L[0],g[0],R[0],0,L[1],g[1],R[1],0,L[2],g[2],R[2],0,-r.dot(L,C),-r.dot(g,C),-r.dot(R,C),1])},camera:(C,d,b)=>{let R=r.scale(d,-1),L=r.norm(r.cross(b,R)),g=r.cross(R,L);return new Float64Array([...L,0,...g,0,...R,0,...C,1])}};function u(C=123){return()=>(C=Math.imul(1664525,C)+1013904223|0,(C>>>0)/4294967296)}function m(C){return[(C>>16&255)/255,(C>>8&255)/255,(C&255)/255]}let x={hull:m(11908267),light:m(13750469),shade:m(8555147),dark:m(2503482),inner:m(1121571),steel:m(6187886),red:m(7553595),window:m(14867393),blue:m(8900063)};class M{constructor(){this.data=[]}vertex(d,b,R,L,g,w){this.data.push(...d,...b,...R,L,g,...w)}tri(d,b,R,L=x.hull,g=0,w=0,T=null,S=null){let I=r.norm(r.cross(r.sub(b,d),r.sub(R,d)));return[d,b,R].forEach((D,U)=>this.vertex(D,T?T[U]:I,L,g,w,S?S[U]:[0,0])),this}quad(d,b,R,L,g,w=0,T=0){return this.tri(d,b,R,g,w,T,null,[[0,0],[1,0],[1,1]]),this.tri(d,R,L,g,w,T,null,[[0,0],[1,1],[0,1]]),this}box(d,b,R=x.hull,L=0,g=[0,0,0],w=0){let[T,S,I]=d.map(B=>B/2),D=a.compose(b,g),U=[[-T,-S,-I],[T,-S,-I],[T,S,-I],[-T,S,-I],[-T,-S,I],[T,-S,I],[T,S,I],[-T,S,I]].map(B=>a.transform(D,B));return[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[0,1,5,4],[3,7,6,2]].forEach(B=>this.quad(...B.map(z=>U[z]),R,w,L)),this}hull(d,b=[0,0,0],R=x.hull,L=0){let g=d.map(([w,T,S])=>{let I=Math.min(T,S)*.2;return[[S/2,-T/2+I],[S/2,T/2-I],[S/2-I,T/2],[-S/2+I,T/2],[-S/2,T/2-I],[-S/2,-T/2+I],[-S/2+I,-T/2],[S/2-I,-T/2]].map(([D,U])=>[w+b[0],D+b[1],U+b[2]])});for(let w=0;w<g.length-1;w++)for(let T=0;T<8;T++){let S=(T+1)%8;this.quad(g[w][T],g[w][S],g[w+1][S],g[w+1][T],R,0,L)}for(let w=1;w<7;w++){this.tri(g[0][0],g[0][w+1],g[0][w],R,0,L);let T=g.at(-1);this.tri(T[0],T[w],T[w+1],R,0,L)}return this}chamfer(d,b,R=x.hull,L=0){let[g,w,T]=d,S=Math.min(g,w,T)*.18;return this.hull([[-g/2,T-S*2,w-S*2],[-g/2+S,T,w],[g/2-S,T,w],[g/2,T-S*2,w-S*2]],b,R,L)}cylinder(d,b,R,L=x.steel,g=14,w=0,T=0,S=d){let[I,D,U]=R;for(let B=0;B<g;B++){let z=e*B/g,k=e*(B+1)/g,H=[I-b/2,D+Math.sin(z)*d,U+Math.cos(z)*d],Y=[I-b/2,D+Math.sin(k)*d,U+Math.cos(k)*d],ht=[I+b/2,D+Math.sin(k)*S,U+Math.cos(k)*S],rt=[I+b/2,D+Math.sin(z)*S,U+Math.cos(z)*S];this.quad(H,Y,ht,rt,L,T,w),this.tri([I-b/2,D,U],Y,H,L,T,w),this.tri([I+b/2,D,U],rt,ht,L,T,w)}return this}beam(d,b,R,L,g=x.dark){let w=r.sub(b,d),T=r.length(w),S=r.norm(w),I=Math.abs(S[1])>.95?[1,0,0]:[0,1,0],D=r.norm(r.cross(S,I)),U=r.cross(D,S),B=[];return[d,b].forEach(z=>[[-1,-1],[-1,1],[1,1],[1,-1]].forEach(([k,H])=>B.push(r.add(z,r.add(r.scale(D,k*R/2),r.scale(U,H*L/2)))))),[[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]].forEach(z=>this.quad(...z.map(k=>B[k]),g)),this}sphere(d=1,b=56,R=28){let L=(g,w)=>{let T=g/b*e,S=w/R*Math.PI;return[Math.sin(S)*Math.cos(T),Math.cos(S),Math.sin(S)*Math.sin(T)]};for(let g=0;g<R;g++)for(let w=0;w<b;w++){let T=[L(w,g),L(w+1,g),L(w+1,g+1),L(w,g+1)],S=T.map(I=>r.scale(I,d));this.tri(S[0],S[1],S[2],x.hull,0,0,[T[0],T[1],T[2]]),this.tri(S[0],S[2],S[3],x.hull,0,0,[T[0],T[2],T[3]])}return this}upload(){return vo(this.data)}}let y=n.layouts;function h(C){let d=[Math.sin(C.yaw)*Math.cos(C.pitch),Math.sin(C.pitch),-Math.cos(C.yaw)*Math.cos(C.pitch)],b=r.norm(r.cross(d,[0,1,0])),R=r.cross(b,d),L=r.add(r.scale(R,Math.cos(C.roll)),r.scale(b,Math.sin(C.roll)));return{forward:d,up:L,right:r.norm(r.cross(d,L))}}function o(C,d){let b=h(C);return a.mul(a.camera(C.pos,b.forward,b.up),a.mul(a.ry(-Math.PI/2),a.scale(y[d].scale)))}function l(C,d,b){let R=y[b].turretScale,L=a.mul(C,a.mul(a.translate(...d.mount),a.scale(R))),g=a.mul(L,a.ry(d.yaw)),w=a.mul(g,a.mul(a.translate(0,.5,0),a.mul(a.rz(-d.pitch),a.translate(d.recoil||0,0,0))));return{base:L,yaw:g,barrels:w}}let p=`
    attribute vec3 aPosition; attribute vec3 aNormal; attribute vec3 aColor;
    attribute float aEmission; attribute float aTag; attribute vec2 aUV;
    uniform mat4 uModel; uniform mat4 uVP; uniform float uShellOffset;
    varying vec3 vWorld; varying vec3 vNormal; varying vec3 vColor; varying vec3 vLocal;
    varying float vEmission; varying float vTag; varying vec2 vUV;
    void main(){vec4 world=uModel*vec4(aPosition+aNormal*uShellOffset,1.);vWorld=world.xyz;vNormal=mat3(cross(uModel[1].xyz,uModel[2].xyz),cross(uModel[2].xyz,uModel[0].xyz),cross(uModel[0].xyz,uModel[1].xyz))*aNormal;vColor=aColor;vEmission=aEmission;vTag=aTag;vLocal=aPosition;vUV=aUV;gl_Position=uVP*world;
      // Negative UV.x marks solid ship material layers; leave real textures/effects untouched.
      gl_Position.z-=max(0.,-aUV.x)*(2./16777216.)*gl_Position.w;
    }
  `,c=`
    precision highp float;
    varying vec3 vWorld; varying vec3 vNormal; varying vec3 vColor; varying vec3 vLocal;
    varying float vEmission; varying float vTag; varying vec2 vUV;
    uniform vec3 uEye; uniform vec3 uLight; uniform vec3 uTeamColor; uniform float uOpacity; uniform float uSelected;
    uniform float uMode; uniform float uWire; uniform float uTime; uniform float uExposure; uniform sampler2D uTexture; uniform vec3 uTint; uniform float uNearFade; uniform float uFighter; uniform vec4 uImpact; uniform vec2 uShield;

float sceneHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float sceneNoise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(sceneHash(i),sceneHash(i+vec3(1,0,0)),f.x),mix(sceneHash(i+vec3(0,1,0)),sceneHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(sceneHash(i+vec3(0,0,1)),sceneHash(i+vec3(1,0,1)),f.x),mix(sceneHash(i+vec3(0,1,1)),sceneHash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float sceneFbm(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*sceneNoise(p);p=p*2.03+vec3(7.1,3.7,1.9);a*=.5;}return v;}
vec4 spaceScene(vec3 d,float kind){
 if(kind>1.5&&kind<2.5){
  vec3 p=d*3.2;float warp=sceneFbm(p+vec3(2,5,1));float n=sceneFbm(p*2.1+warp*3.);
  float cloud=smoothstep(.28,.72,n),dust=smoothstep(.42,.66,sceneFbm(p*3.+vec3(7,1,9)));
  float ridge=pow(max(0.,1.-abs(n-.51)*8.),3.);
  vec3 color=mix(vec3(.035,.17,.21),vec3(.52,.16,.065),smoothstep(-.5,.65,d.x+d.y))*(cloud*.85+ridge*.3);
  color*=1.-dust*.85;
  return vec4(color,clamp(cloud*.75+dust*.6,.12,.91));
 }
 return vec4(.002,.007,.012,.20);
}

    ${nu}
    void main(){
      if(uMode>11.5&&uMode<12.5){bool inside=all(lessThan(abs(uImpact.xyz),vec3(1.)));if(inside?gl_FrontFacing:!gl_FrontFacing)discard;gl_FragColor=groundCloud(vLocal,uImpact.xyz,uImpact.w,uShield.x,uShield.y);return;}
      if(uMode>12.5&&uMode<13.5){
        float radius=length(vLocal.xz),age=uImpact.w;
        float n=cloudNoise(vec3(vLocal.xz*19.,age*.4));
        float front=exp(-pow((radius-.82)/(.022+age*.018),2.));
        float dust=exp(-pow((radius-.70)/(.10+age*.04),2.))*(.5+n*.5);
        vec3 color=mix(vec3(.48,.40,.30),vec3(2.,1.25,.45),exp(-age*5.));
        gl_FragColor=vec4(color,(front*.8+dust*.25)*uOpacity);return;
      }
      if(uMode>13.5&&uMode<14.5){
        if(vLocal.y<0.)discard;
        vec3 n=normalize(vNormal),view=normalize(uEye-vWorld);
        float rim=pow(1.-abs(dot(n,view)),2.5);
        float latitude=pow(.5+.5*cos(vLocal.y*95.),28.);
        float longitude=pow(.5+.5*cos(atan(vLocal.z,vLocal.x)*48.),32.);
        float grid=max(latitude,longitude)*.045;
        gl_FragColor=vec4(uTint,(.025+rim*.38+grid)*uOpacity);return;
      }
      vec3 N=normalize(vNormal);if(!gl_FrontFacing)N=-N;
      vec3 L=normalize(uLight),V=normalize(uEye-vWorld);float diffuse=max(dot(N,L),0.);
      float hemi=dot(N,vec3(0.,1.,0.))*.5+.5;
      vec3 base=vColor;
      if(abs(vTag-77.)<.1)base=uTeamColor;
      if(uMode>.5&&uMode<1.5){vec3 n=normalize(vLocal);vec2 uv=vec2(atan(n.z,n.x)/6.2831853+.5,asin(n.y)/3.14159265+.5);base=texture2D(uTexture,uv).rgb;}
      float spec=pow(max(dot(reflect(-L,N),V),0.),40.)*.17;
      vec3 lighting=vec3(.13,.17,.2)+vec3(.18,.20,.215)*hemi+vec3(.94,.9,.78)*diffuse;
      if(uMode>.5&&uMode<1.5)lighting=vec3(.028,.039,.055)+vec3(.89,.86,.76)*diffuse;
      vec3 color=base*lighting+spec;
      if(uFighter>.5){
        vec3 key=normalize(vec3(-.65,1.,.45)),fill=normalize(vec3(.55,.18,-.9));
        float kd=max(dot(N,key),0.),fd=max(dot(N,fill),0.);
        float edge=pow(1.-max(dot(N,V),0.),3.);
        float highlight=pow(max(dot(N,normalize(key+V)),0.),56.);
        color=base*(vec3(.24,.265,.29)+vec3(.94,.95,.96)*kd+vec3(.16,.20,.24)*fd)
          +vec3(.075,.09,.11)*highlight+vec3(.02,.034,.046)*edge;
      }
      color=mix(color,base*1.2,clamp(vEmission,0.,1.));
      if(abs(vTag-uSelected)<.1)color+=vec3(.12,.33,.39)*(.7+sin(uTime*2.5)*.12);
      if(uMode>1.5&&uMode<2.5)color=texture2D(uTexture,vUV).rgb*.76;
      if(uMode>2.5)color=uTint;
      if(uWire>.5)color=vec3(.35,.64,.72);
      color=pow(max(color,vec3(0.)),vec3(.94));
      float alpha=uOpacity;
      if(uMode>3.5&&uMode<4.5){
        float x=clamp(vLocal.x,0.,1.);
        float softEdge=(1.-smoothstep(.05,1.,abs(vUV.y)))*smoothstep(0.,.3,abs(dot(N,V)))*.65;
        float cells=.83+.17*cos(x*38.-uTime*7.);
        alpha*=pow(1.-x,1.15)*softEdge*cells;
        if(uNearFade>0.)alpha*=smoothstep(uNearFade*.5,uNearFade*2.,length(vWorld));
        color=mix(uTint,vec3(1.),.24*pow(1.-x,5.));
      }

      if(uMode>4.5&&uMode<5.5){
        float age=uImpact.w*3.,d=length(vLocal-uImpact.xyz)/max(uShield.x,.001);
        float radius=age*.72,band=exp(-pow((d-radius)/.023,2.));
        float echo=exp(-pow((d-radius*.72)/.016,2.))*.27;
        float flash=exp(-d*38.)*exp(-age*12.);
        float fade=1.-smoothstep(.55,1.45,age);
        float rim=pow(1.-abs(dot(N,V)),2.5);
        alpha=clamp((band*.82+echo+flash+rim*.20*exp(-age*4.)*uShield.y)*fade*uOpacity,0.,.85);
        color=mix(uTint,vec3(.85,1.,1.),band*.6+flash*.3);
      }
      if(uMode>5.5&&uMode<6.5){vec4 sky=spaceScene(normalize(vLocal),uSelected);color=sky.rgb;alpha=sky.a;}
      if(uMode>6.5&&uMode<7.5){
        vec3 n=normalize(vLocal);float terrain=sceneFbm(n*4.8),cloud=sceneFbm(n*19.+vec3(uTime*.001));
        float land=smoothstep(.48,.52,terrain),ice=smoothstep(.77,.94,abs(n.y));
        vec3 surface=mix(vec3(.012,.10,.18),mix(vec3(.08,.19,.105),vec3(.28,.24,.13),smoothstep(.52,.68,terrain)),land);
        surface=mix(surface,vec3(.72,.81,.82),ice);surface=mix(surface,vec3(.8,.87,.9),smoothstep(.56,.72,cloud)*.88);
        float day=max(dot(n,normalize(uLight)),0.);color=surface*(.035+day*1.4)+vec3(.01,.05,.1)*pow(1.-abs(dot(N,V)),4.);
      }
      if(uMode>7.5&&uMode<8.5){float edge=pow(1.-abs(dot(N,V)),3.);color=vec3(.15,.52,1.);alpha=edge*.36*uOpacity;}
      if(uMode>10.5&&uMode<11.5){
        vec3 q=normalize(vLocal);float terrain=sceneFbm(q*140.),detail=sceneNoise(q*1900.);
        vec3 ground=mix(vec3(.12,.17,.15),vec3(.34,.31,.24),smoothstep(.32,.7,terrain));
        ground*=.85+detail*.25;
        color=ground*(.3+max(dot(N,normalize(uLight)),0.)*.9);
        float haze=1.-exp(-length(uEye-vWorld)/11000.);
        color=mix(color,vec3(.19,.32,.43),haze*.72);
      }

      if(uMode>8.5&&uMode<9.5){
        vec3 q=normalize(vLocal);float n=sceneFbm(q*6.+vec3(uImpact.w*-.7,uImpact.w*.4,0));
        float rim=pow(1.-abs(dot(N,V)),1.5);
        float filaments=pow(1.-abs(n-.5)*1.8,6.);
        color=mix(uTint,vec3(1.,.96,1.),filaments*.65);
        alpha=(rim*.55+filaments*.33)*uOpacity;
      }
      if(uMode>9.5&&uMode<10.5){
        float edge=pow(max(0.,sin(vUV.y*3.141593)),2.);
        float arcs=.65+.35*sin(vUV.x*100.+uTime*9.);
        color=mix(uTint,vec3(1.),pow(edge,6.)*.65);alpha=edge*arcs*uOpacity;
      }
      gl_FragColor=vec4(color*uExposure,alpha);
    }
  `,f="attribute vec3 aPosition;attribute vec3 aColor;attribute float aSize;uniform mat4 uMatrix;uniform float uDpr;varying vec3 vColor;void main(){vColor=aColor;gl_Position=uMatrix*vec4(aPosition,1.);gl_PointSize=aSize*uDpr;}",E="precision mediump float;varying vec3 vColor;uniform float uAlpha;uniform float uPointMode;void main(){float a=uAlpha;if(uPointMode>.5){float d=length(gl_PointCoord-vec2(.5));a*=1.-smoothstep(.14,.5,d);}gl_FragColor=vec4(vColor,a);}",_="attribute vec3 p,c;attribute vec2 uv;attribute vec2 fx;uniform mat4 vp;varying vec3 color;varying vec2 tex,effect;void main(){color=c;tex=uv;effect=fx;gl_Position=vp*vec4(p,1.);}",v=`precision mediump float;\r
          varying vec3 color;varying vec2 tex,effect;\r
          void main(){float r=length(tex),t=effect.x,kind=effect.y;\r
            if(kind>4.5){if(r>1.)discard;gl_FragColor=vec4(color,exp(-r*r*12.)*(1.-t));return;}\r
            if(kind>3.5){float d=abs(tex.y),core=exp(-d*d*85.),halo=exp(-d*d*5.)*.24;\r
              float cap=smoothstep(0.,.012,tex.x)*smoothstep(0.,.012,1.-tex.x);\r
              gl_FragColor=vec4(mix(color,vec3(1.,.96,.87),core*.55),(core+halo)*t*cap);return;}\r
            if(r>1.)discard;\r
            float angle=atan(tex.y,tex.x);float cloud=.83+.10*sin(angle*7.+t*9.)+.07*sin(angle*13.-t*7.);\r
            float fire=exp(-r*r/(.045+t*.22))*(1.-smoothstep(cloud-.22,cloud,r));\r
            float shock=exp(-pow((r-(.18+t*.72))/.025,2.))*(1.-t);\r
            float core=exp(-r*r/(.012+t*.018))*max(0.,1.-t*2.);\r
            float spikes=pow(abs(cos(angle*4.)),24.)*exp(-r*4.)*(1.-t);\r
            float a=(fire*.85+core+shock*.6+spikes*.3)*pow(1.-t,1.3);\r
            vec3 hue=mix(color,vec3(1.,.84,.48),fire*.4);\r
            if(kind<.5){a=(exp(-r*r*18.)+spikes*.8)*(1.-t);hue=color;}\r
            if(kind>.5&&kind<1.5){a=(shock*.8+core*.3+fire*.2)*(1.-t);hue=color;}\r
            gl_FragColor=vec4(mix(hue,vec3(1.),min(1.,core+fire*.35)),a);\r
          }`;function A(){let C=document.createElement("canvas");C.width=1024,C.height=512;let d=C.getContext("2d"),b=u(32191),R=512,L=256,g=new Float32Array(8192);for(let D=0;D<g.length;D++)g[D]=b();let w=(D,U)=>{let B=Math.floor(D),z=Math.floor(U),k=D-B,H=U-z;k=k*k*(3-2*k),H=H*H*(3-2*H);let Y=(ht,rt)=>g[(rt%64+64)%64*128+(ht%128+128)%128];return s(s(Y(B,z),Y(B+1,z),k),s(Y(B,z+1),Y(B+1,z+1),k),H)},T=document.createElement("canvas");T.width=R,T.height=L;let S=T.getContext("2d"),I=S.createImageData(R,L);for(let D=0;D<L;D++)for(let U=0;U<R;U++){let z=83+(w(U/60,D/60)*.47+w(U/23,D/23)*.25+w(U/8,D/8)*.15+w(U/2.9,D/2.9)*.09+b()*.12)*109,k=(D*R+U)*4;I.data[k]=z*1.04,I.data[k+1]=z,I.data[k+2]=z*.89,I.data[k+3]=255}S.putImageData(I,0,0),d.drawImage(T,0,0,1024,512);for(let D=0;D<2800;D++){let U=b()*1024,B=b()*512,z=.7+Math.pow(b(),3)*(D<130?18:6.5);d.save(),d.translate(U,B),d.scale(1,Math.max(.3,Math.sin(B/512*Math.PI)));let k=d.createRadialGradient(-z*.22,-z*.2,z*.12,0,0,z);k.addColorStop(0,"rgba(24,26,27,.35)"),k.addColorStop(.64,"rgba(64,65,61,.29)"),k.addColorStop(.82,"rgba(219,215,193,.45)"),k.addColorStop(.91,"rgba(219,217,198,.16)"),k.addColorStop(1,"rgba(190,190,168,0)"),d.fillStyle=k,d.beginPath(),d.arc(0,0,z,0,e),d.fill(),d.restore()}return C}class P extends yo{constructor(d){super(d,{vertexSource:p,fragmentSource:c,flatVertex:f,flatFragment:E,impactVertex:_,impactFragment:v},t),this.jointMeshes=n.parts.map(T=>{let S=new M;return S.data=n.vertices.subarray(T.offset,T.offset+T.floatCount),S.upload()}),this.shipMeshes=n.ships.map(T=>{let S=new M;return S.data=n.vertices.subarray(T.offset,T.offset+T.floatCount),S.upload()}),this.defenseMeshes=new Map;for(let[T,S]of n.ships.entries()){let I=t.ships.find(D=>D.id===S.id)?.defenseParts;I?.base&&this.defenseMeshes.set(T,Object.fromEntries(Object.entries(I).map(([D,U])=>{let B=new M;return B.data=t.vertices.subarray(U.offset,U.offset+U.floatCount),[D,U.floatCount?B.upload():null]})))}this.cloudVolume=new M().box([2,2,2],[0,0,0]).upload(),this.groundShock=new M().quad([-1,0,-1],[-1,0,1],[1,0,1],[1,0,-1],x.hull).upload(),this.bridgeMesh=this.makeBridge().upload();let b=new M;b.cylinder(1,1,[.5,0,0],x.blue,10,0,1),this.beamMesh=b.upload();let R=new M;R.data=gu(),this.plumeMesh=R.upload();let L=new M;L.cylinder(.11,.95,[0,0,0],x.light,8),L.cylinder(.11,.32,[.63,0,0],x.light,8,0,0,0),this.missileMesh=L.upload(),this.moonMesh=new M().sphere(1,64,36).upload(),this.moonTexture=this.texture(A()),this.rockMesh=this.makeRock().upload(),this.rocks=[];let g=u(8972);for(let T=0;T<90;T++){let S=g()*Math.PI*2,I=550+g()*3400,D=12+Math.pow(g(),2)*115;this.rocks.push({pos:[Math.cos(S)*I,(g()-.5)*700,Math.sin(S)*I],size:D,rot:[g()*6,g()*6,g()*6]})}let w=new M;w.data=Mu(),this.specialRing=w.upload(),this.grid=this.makeGrid(),this.stars=this.makeStars(),this.cockpit=this.makeCockpit().upload(),this.fighterConsole=new gs(T=>this.texture(T)),this.screens=sr.map(T=>{let S=new M,[I,D]=T.size;return S.quad(...[[-I/2,-D/2],[I/2,-D/2],[I/2,D/2],[-I/2,D/2]].map(([U,B])=>$e(T,[U,B,.003])),x.blue),S.upload()}),this.fighterConsoleFrame=null,this.vp=a.identity(),this.eye=[0,0,0],this.width=0,this.height=0,this.resize()}makeRock(){let d=new M().sphere(1,12,8);for(let b=0;b<d.data.length;b+=13){let R=d.data.slice(b,b+3),L=.83+.13*Math.sin(R[0]*8+R[1]*5)+.12*Math.cos(R[2]*9-R[0]*3);for(let g=0;g<3;g++)d.data[b+g]*=L;d.data[b+6]=.27+L*.08,d.data[b+7]=.25+L*.07,d.data[b+8]=.23+L*.06}for(let b=0;b<d.data.length;b+=39){let R=d.data.slice(b,b+3),L=d.data.slice(b+13,b+16),g=d.data.slice(b+26,b+29),w=r.norm(r.cross(r.sub(L,R),r.sub(g,R)));for(let T=0;T<3;T++)for(let S=0;S<3;S++)d.data[b+T*13+3+S]=w[S]}return d}drawFortress(d,b="",R=[],L=[]){let g=d?.fortress?.modules;if(!g?.length)return;let w=d.fortress.version>=2;this.fortressMeshesByVersion??=new Map;let T=w?2:1;this.fortressMeshesByVersion.has(T)||this.fortressMeshesByVersion.set(T,Yl(M,w?pn.scale:1,w));let S=this.fortressMeshesByVersion.get(T),{destroyed:I,destroyedSockets:D}=Zl(d,R,L);for(let B of[!1,!0]){let z=g.filter(H=>I.has(H.index)===B),k=new Float32Array(z.length*16);z.forEach((H,Y)=>k.set(a.translate(H.x-this.eye[0],H.y-this.eye[1],H.z-this.eye[2]),Y*16)),z.length&&this.drawInstances(b+(B?"fortress-wrecks":"fortress-modules"),{geometry:B?S.wreck:S.module,high:!0,matrices:k,ids:z.map(H=>H.index)})}if(w){this.smallFortressMeshes??=Yl(M,pn.smallScale);let B=g.flatMap(z=>z.sockets.flatMap((k,H)=>k?.kind==="small"?[{module:z,index:H,...fo(z,H)}]:[]));for(let z of[!1,!0]){let k=B.filter(Y=>D.has(`${Y.module.index}:${Y.index}`)===z),H=new Float32Array(k.length*16);k.forEach((Y,ht)=>H.set(a.translate(Y.x-this.eye[0],Y.y+4-this.eye[1],Y.z-this.eye[2]),ht*16)),k.length&&this.drawInstances(b+(z?"fortress-small-wrecks":"fortress-small-modules"),{geometry:z?this.smallFortressMeshes.wreck:this.smallFortressMeshes.module,high:!0,matrices:H,ids:k.map(Y=>Y.module.index*7+Y.index)})}}let U=ru(g);for(let B of[!1,!0]){let z=U.filter(([H,Y])=>(I.has(H.index)||I.has(Y.index))===B),k=new Float32Array(z.length*16);z.forEach(([H,Y],ht)=>{let rt=r.sub([Y.x,Y.y,Y.z],[H.x,H.y,H.z]),X=r.length(rt),$=r.scale(rt,1/X),Q=w?65:90,at=r.add([H.x,H.y,H.z],r.scale($,Q)),pt=r.add([Y.x,Y.y,Y.z],r.scale($,-Q)),tt=this.segmentModel(at,pt);for(let yt=0;yt<3;yt++)tt[12+yt]-=this.eye[yt];k.set(tt,ht*16)}),z.length&&this.drawInstances(b+(B?"fortress-broken-links":"fortress-links"),{geometry:B?S.brokenBridge:S.bridge,high:!0,matrices:k,ids:z.map((H,Y)=>Y)})}}drawDefenseField(d,b,R,L){let g=d?.fortress?.modules;if(!g?.length)return;let{fields:w}=Zl(d,b,R);if(!w.length)return;let T=g.reduce((U,B)=>U+B.x,0)/g.length,S=g.reduce((U,B)=>U+B.z,0)/g.length,I=Math.min(...g.map(U=>U.y))+8,D=Math.max(...g.map(U=>Math.hypot(U.x-T,U.z-S)))+150;this.defenseFieldMesh??=new M().sphere(1,80,40).upload(),this.setBlend(!0,!1);for(let U of w)this.drawMesh(this.defenseFieldMesh,a.compose([T,I,S],[0,0,0],[D,D*.45+120,D]),{mode:14,tint:U.owner===L?[.12,.6,1]:[1,.24,.18],opacity:.55+.45*Math.min(1,U.charge/U.capacity)});this.setBlend(!1,!0)}drawBattlePlanet(d){this.battlePlanetMesh??=new M().sphere(1,256,128).upload();let{center:b}=d,R=d.radius/pn.orbitScale;this.drawMesh(this.battlePlanetMesh,a.compose(b,[0,0,0],[R,R,R]),{mode:11,light:[-.4,.9,.3]}),d.moon||(this.setBlend(!0,!1),this.drawMesh(this.battlePlanetMesh,a.compose(b,[0,0,0],[R+d.atmosphere,R+d.atmosphere,R+d.atmosphere]),{mode:8,opacity:.32}),this.setBlend(!1,!0))}environment(d,b){let R=d.sceneIndex??0;if(this.drawSpaceSky(.85),R===1){let L=[-2e3,-950,-3600],g=[.1,.42,.18];this.drawMesh(this.moonMesh,a.compose(L,g,[2100,2100,2100]),{mode:7,light:[.6,.3,1]}),this.setDepthWrite(!1),this.setBlend(!0),this.drawMesh(this.moonMesh,a.compose(L,g,[2132,2132,2132]),{mode:8}),this.setBlend(!1),this.setDepthWrite(!0),this.drawMesh(this.moonMesh,a.compose([1600,750,-5100],[0,.3,0],[230,230,230]),{mode:1,texture:this.moonTexture,light:[.6,.3,1]})}if(R===3){for(let L of this.rocks){let g=L.pos.map((w,T)=>w+Math.round((d.flight.pos[T]-w)/8e3)*8e3);this.drawMesh(this.rockMesh,a.compose(g,[L.rot[0],L.rot[1]+b*.006,L.rot[2]],[L.size,L.size*.72,L.size*1.2]),{light:[.8,.25,.5]})}this.drawMesh(this.moonMesh,a.compose([3100,-1400,-6300],[0,.8,0],[1050,1050,1050]),{mode:1,texture:this.moonTexture,light:[.8,.25,.5]})}}shieldImpact(d,b,R,L,g,w){if(!(w>0)||!(g>0))return;let T=r.sub(L,[R[12],R[13],R[14]]),S=[0,1,2].map(D=>{let U=[R[D*4],R[D*4+1],R[D*4+2]];return r.dot(T,U)/r.dot(U,U)}),I=vu(n.vertices,n.ships[b],S);d.shieldHits??=[],_u(d.shieldHits,I,this.time,g,w)}drawShield(d,b,R,L=1){if(d.shieldHits=(d.shieldHits||[]).filter(g=>this.time-g.time<.48),!(!d.shieldHits.length||L<.01)){this.setDepthWrite(!1),this.setBlend(!0),this.setSide(!0);for(let g of d.shieldHits)this.drawMesh(this.shipMeshes[b],R,{mode:5,tint:g.weak?[1,.42,.12]:[.08,.62,1],opacity:L,shellOffset:y[b].length*.002,impact:[...g.point,this.time-g.time],shield:[y[b].length,g.power]});this.setSide(!1),this.setBlend(!1),this.setDepthWrite(!0)}}makeGrid(){let d=[],b=(R,L)=>d.push(...R,...L,1);for(let R=-25;R<=26;R+=2.3)for(let L=-20;L<=25;L+=2.3){let g=Math.max(0,1-Math.hypot(R*.7,L*.8)/27),w=[.22*g,.38*g,.45*g];b([R-.08,-2.8,L],w),b([R+.08,-2.8,L],w),b([R,-2.8,L-.08],w),b([R,-2.8,L+.08],w)}return this.flatBuffer(d)}makeStars(){let d=[],b=u(5352);for(let R=0;R<2300;R++){let L=b()*2-1,g=b()*e,w=Math.sqrt(1-L*L),T=.2+Math.pow(b(),2)*.65;d.push(Math.cos(g)*w*6e3,L*6e3,Math.sin(g)*w*6e3,T*.87,T*.93,T,.65+b()*1.45)}return this.flatBuffer(d)}makeCockpit(){let d=new M,b=m(3424326),R=m(8093301),L=m(1055264);d.beam([-2.25,1.48,-2.75],[2.25,1.48,-2.75],.17,.15,b),d.beam([-2.24,1.38,-2.77],[2.24,1.38,-2.77],.025,.03,R);for(let g of[-1,1]){let w=[g*2.15,1.6,-2.75],T=[g*2.35,-1.42,-2.35];d.beam(w,T,.15,.21,b),d.beam([g*2.06,1.6,-2.78],[g*2.26,-1.42,-2.38],.026,.05,R),d.beam([g*2.87,1.9,-2.6],[g*2.05,-1.57,-1.95],.2,.23,b),d.beam([g*2.8,1.9,-2.57],[g*1.99,-1.57,-1.92],.035,.03,R);for(let S=0;S<5;S++)d.box([.065,.055,.04],[g*(2.16+S*.044),1.25-S*.5,-2.59+S*.055],L)}d.box([3.7,.32,.55],[0,-1.24,-2.5],L);for(let g of sr){let[w,T]=g.size,S=I=>$e(g,I);d.beam(S([0,-T/2,-.08]),[g.pos[0],-1.28,-2.4],.12,.12,b),d.box([w+.1,T+.12,.14],S([0,0,-.08]),b,0,g.rotation),d.box([w+.028,T+.028,.025],S([0,0,-.016]),L,0,g.rotation);for(let I of[-1,1])for(let D of[-1,1])d.box([.015,.015,.006],S([I*(w/2+.03),D*(T/2+.034),-.004]),R,0,g.rotation);d.box([w*.7,.006,.008],S([0,T/2+.033,-.004]),m(6460322),0,g.rotation,.3),d.box([.045,.009,.008],S([w/2-.03,-T/2-.038,-.004]),m(9030078),0,g.rotation,.4)}return d}makeBridge(){let d=new M,b=m(2635324),R=m(7501935),L=m(923677);for(let g of[-1,1]){d.beam([g*3.97,2.22,-3.9],[g*3.8,-1.72,-3.35],.18,.24,b),d.beam([g*3.89,2.21,-3.93],[g*3.72,-1.68,-3.38],.03,.04,R),d.beam([g*6.6,3,-5.7],[g*3.75,-2.15,-2.55],.24,.3,b),d.chamfer([1.65,.38,1.5],[g*2.82,-1.74,-3.1],b),d.box([1.3,.023,.83],[g*2.82,-1.54,-3.1],L);for(let w=0;w<6;w++)d.box([.055,.028,.45],[g*2.82-.45+w*.18,-1.519,-3.1],x.blue,0,[0,0,0],.65);d.beam([g*6,-1.42,-4.4],[g*3.15,-1.16,-2.54],.075,.08,R);for(let w=0;w<5;w++)d.box([.055,.12,.045],[g*4.43,1.6-w*.56,-3.7+w*.065],L)}d.beam([-5.6,2.38,-4.2],[5.6,2.38,-4.2],.21,.34,b),d.beam([-5.6,2.27,-4.24],[5.6,2.27,-4.24],.045,.04,R),d.beam([-5,-1.62,-3.7],[5,-1.62,-3.7],.1,.15,b),d.box([12,.46,4.7],[0,-2.15,-2.65],L);for(let g=0;g<3;g++){let w=(g-1)*1.1,T=g===1?-1.22:-1.15;d.chamfer([1.035,.79,.2],[w,T,-2.16],b),d.box([.94,.6,.055],[w,T,-2.06],L),d.box([.73,.032,.033],[w,T+.31,-2.025],R)}return d}drawBow(d,b,R=1){this.bowMeshes??=new Map;let L=this.bowMeshes.get(d);if(!L){let g=this.shipMeshes[d].geometry.getAttribute("aPosition").data.array,w=y[d].bounds,T=y[d].length,S=[];for(let D=0;D<g.length;D+=39)if(!(Math.max(g[D],g[D+13],g[D+26])>w.center[0]+T*.04)){for(let U=0;U<39;U++)S.push(g[D+U]);for(let U=0;U<3;U++){let B=S.length-39+U*13;S[B+1]=(S[B+1]-w.center[1])*.38;let z=Math.hypot(S[B+3],S[B+4]/.38,S[B+5]);S[B+3]/=z,S[B+4]/=.38*z,S[B+5]/=z}}let I=1/0;for(let D=0;D<S.length;D+=13)I=Math.min(I,T*.12-(T*.25-S[D])*.18-S[D+1]);for(let D=0;D<S.length;D+=13)S[D+1]+=I;L=vo(S),this.bowMeshes.set(d,L),this.geometryResources.add(L.geometry)}this.drawMesh(L,b,{light:[-.35,.9,.6],exposure:1.15,opacity:R})}drawVessel(d,b,R={},L=null){this.drawMesh(this.shipMeshes[d],b,{...R,fighter:!0});for(let g of L||y[d].joints){let w=tc(a,b,g);this.drawMesh(this.jointMeshes[g.parts[0]],w.yaw,R),this.drawMesh(this.jointMeshes[g.parts[1]],w.barrels,R)}}drawDefense(d,b,R=0,L=0,g=[.086,.545,.922]){let w=this.defenseMeshes.get(d);if(!w){this.drawVessel(d,b);return}let T=t.ships?.find(U=>U.id===n.ships?.[d]?.id)?.defensePivot??3,S={teamColor:g};this.drawMesh(w.base,b,S);let I=a.mul(b,a.ry(R)),D=a.mul(I,a.mul(a.translate(0,T,0),a.mul(a.rz(-L),a.translate(0,-T,0))));w.turret&&this.drawMesh(w.turret,I,S),w.barrels&&this.drawMesh(w.barrels,D,S)}drawMushroomClouds(d){let b=[...d.mushroomClouds||[]].sort((R,L)=>r.length(r.sub(L.pos,this.eye))-r.length(r.sub(R.pos,this.eye)));this.setBlend(!1),this.setDepthWrite(!1);for(let R of b){let L=su(R.age),{radius:g,height:w,opacity:T}=L,S=R.pos,I=L.spread*1.8,D=[S[0]+I,S[1]+(w+g*.95)*.5,S[2]+I*.35],U=[g*1.6,(w+g*.95)*.5,g*1.6],B=this.eye.map((z,k)=>(z-D[k])/U[k]);this.drawMesh(this.cloudVolume,a.compose(D,[0,0,0],U),{mode:12,opacity:T,impact:[...B,R.age],shield:[w/g,R.seed]}),L.shockOpacity>.001&&this.drawMesh(this.groundShock,a.compose([S[0],S[1]+.8,S[2]],[0,0,0],[L.shockRadius,1,L.shockRadius]),{mode:13,opacity:L.shockOpacity,impact:[0,0,0,R.age]})}this.setDepthWrite(!0),this.setBlend(!1)}segmentModel(d,b,R=1){let L=r.norm(r.sub(b,d)),g=Math.abs(L[1])>.97?[0,0,1]:[0,1,0],w=r.norm(r.cross(L,g)),T=r.cross(w,L),S=r.length(r.sub(b,d));return new Float64Array([L[0]*S,L[1]*S,L[2]*S,0,T[0]*R,T[1]*R,T[2]*R,0,w[0]*R,w[1]*R,w[2]*R,0,...d,1])}drawSpecial(d,b){if(this.setDepthWrite(!1),this.setBlend(!0),d.profile.special==="reaper"&&(d.charging||d.reaperCut)){let R=this.ownModel,L=y[window.GalacticDemo.state.shipIndex],g=d.charging?d.charge:1;for(let w of L.main){let T=a.transform(R,w);for(let S=0;S<3;S++){let I=L.length*.019*(1+S*.35),D=a.transform(R,[w[0]-S*I*.8,w[1],w[2]]);this.drawMesh(this.specialRing,a.compose(D,[b+S,.5+S,b*.2],[I,I,I]),{mode:10,tint:[.12,1,.65],opacity:g*.7})}if(d.reaperCut){let S=d.reaperCut.target.pos,I=r.norm(r.sub(S,T)),D=r.norm(r.cross(I,[0,1,0])),U=r.cross(D,I),B=[],z=null;for(let k=0;k<=64;k++){let H=k/64,Y=H*40-b*18,ht=Math.sin(H*Math.PI)*L.length*.035,rt=T.map((X,$)=>s(X,S[$],H)+(D[$]*Math.cos(Y)+U[$]*Math.sin(Y))*ht);z&&B.push(...z,.14,.65,.46,1,...rt,.45,1,.72,1),z=rt}this.dynamicFlat(B,!1,.65)}}}for(let R of d.specialBlasts||[]){let{collapse:L,wave:g,fade:w}=bu(R.age),T=R.pos,S=R.radius;if(L>0){let I=8+65*L;this.drawMesh(this.moonMesh,a.compose(T,[0,b,0],[I,I,I]),{mode:9,tint:[.63,.16,1],opacity:L,impact:[0,0,0,R.age]});for(let D=0;D<3;D++){let U=20+L*150;this.drawMesh(this.specialRing,a.compose(T,[D*.8,b*.2,D*.65],[U,U,U]),{mode:10,tint:[.45,.5,1],opacity:L*.8})}}if(g>0){let I=(16+110*Math.sin(Math.min(1,g*1.4)*Math.PI*.7))*(.4+.6*w);this.drawMesh(this.moonMesh,a.compose(T,[R.age*.2,0,0],[I,I,I]),{mode:9,tint:[.62,.22,1],opacity:w*.75,impact:[0,0,0,R.age]});for(let k=0;k<3;k++){let H=S*g*(1-k*.12);this.drawMesh(this.specialRing,a.compose(T,[.18+k*.63,.3+k*.45,k*.24],[H,H,H]),{mode:10,tint:k===1?[.1,.7,1]:[.8,.38,1],opacity:w*(k===0?.9:.5)})}let D=[],U=[];for(let k=0;k<110;k++){let H=k*2.399963,Y=1-2*(k+.5)/110,ht=Math.sqrt(1-Y*Y),rt=[Math.cos(H)*ht,Y,Math.sin(H)*ht],X=S*g*(.4+.55*Math.abs(Math.sin(k*43.1))),$=T.map((at,pt)=>at+rt[pt]*X),Q=T.map((at,pt)=>at+rt[pt]*X*(.88-.1*w));D.push(...Q,.08*w,.22*w,.5*w,1,...$,.7*w,.65*w,w,1),U.push(...$,.6*w,.8*w,w,3*w)}this.dynamicFlat(D,!1,w),this.dynamicFlat(U,!0,w);let B=Math.exp(-Math.max(0,R.age-.3)*8),z=12+B*60;this.drawMesh(this.moonMesh,a.compose(T,[0,0,0],[z,z,z]),{mode:3,tint:[1,.94,1],opacity:B})}}this.setBlend(!1),this.setDepthWrite(!0)}drawBeam(d,b,R,L,g=1){if(R>=.4){let w=r.scale(r.add(d,b),.5),T=r.length(r.sub(w,this.eye))*2*Math.tan(this.fov/2)/this.height;R=Math.max(R,T*(R>=2?3.5:1.5))}this.setDepthWrite(!1),this.setBlend(!0),this.drawMesh(this.beamMesh,this.segmentModel(d,b,R*3),{mode:3,tint:L,opacity:g*.1}),this.drawMesh(this.beamMesh,this.segmentModel(d,b,R),{mode:3,tint:L,opacity:g*.65}),this.drawMesh(this.beamMesh,this.segmentModel(d,b,R*.32),{mode:3,tint:[.92,.98,1],opacity:g}),this.setBlend(!1),this.setDepthWrite(!0)}archive(d,b){this.begin(b);let R=d.orbit,L=d.transition,g=1,w=0,T=-.26;if(L){let H=L.progress;L.to==="flight"?(g=1-Math.pow(i(H*2,0,1),2)*.87,w=i(H*2,0,1)*1.35):(g=.13+(1-Math.pow(1-i((H-.4)/.6,0,1),3))*.87,w=(1-g)*1.5)}let S=R.distance*g*Math.max(1,16/9/(this.width/this.height)),I=[-Math.sin(R.yaw)*Math.cos(R.pitch)*S,Math.sin(R.pitch)*S+w,Math.cos(R.yaw)*Math.cos(R.pitch)*S];this.eye=I;let D=a.perspective(35*Math.PI/180,this.width/this.height,.07,9e3,T);D[9]=-.13,this.vp=a.mul(D,a.lookAt(I,[0,w,0])),this.cameraForward=r.norm(r.sub([0,w,0],I)),this.cameraUp=[0,1,0],this.fov=35*Math.PI/180,this.projectionShiftX=T,this.projectionOffset=-.13,this.drawSpaceSky(.6),this.drawFlat(this.grid,this.vp,!1,.7*g);let U=[0,0,0],B=Math.sin(b*.27)*.04,z=1;if(d.shipSwitch){let H=d.shipSwitch.progress;z=Math.abs(H-.5)*2;let Y=H<.5?-1:1;U=[0,Y*(1-z)*.32,0],B+=(1-z)*Y*.8}let k=a.compose([0,B,0],U);this.archiveModel=k,this.drawVessel(d.shipIndex,k,{opacity:z,wire:d.wireframe,selected:d.highlight})}drawExhaust(d,b,R,L,g,w=1){let T=y[d];this.setDepthWrite(!1),this.setBlend(!0);let S=T.propulsion;for(let[I,D]of T.engines.entries()){let U=mu(R,L,g,S.pulse,I),B=a.transform(b,D.position),z=r.norm(r.sub(a.transform(b,D.direction),a.transform(b,[0,0,0]))),k=D.radius*U.length,H=r.add(B,r.scale(z,k));this.drawMesh(this.plumeMesh,this.segmentModel(B,H,D.radius*U.width),{mode:4,tint:S.color,opacity:w*U.alpha,nearFade:T.length*.08}),this.drawMesh(this.plumeMesh,this.segmentModel(B,H,D.radius*.42),{mode:4,tint:S.core,opacity:w*U.alpha*.75,nearFade:T.length*.08})}this.setBlend(!1),this.setDepthWrite(!0)}weaponImpact(d,b,{visual:R={},color:L=[1,.45,.08],shield:g=!1,destroy:w=!1,muzzle:T=!1}={}){let S=!!R.compact,I=S?5:T?0:g?1:w?3:2,D=S?T?.2:(R.blastRadius||.35)*(w?1.8:1):T?Math.max(.7,(R.radius||.15)*5):Math.max(1.3,R.blastRadius||2)*(w?3:1);(d.weaponImpacts??=[]).push({pos:[...b],color:g?[.12,.6,1]:L,type:I,radius:D,compact:S,elite:!!R.elite,born:d.elapsed||0,life:S?w?.55:T?.07:.15:T?R.elite?.45:.24:w?2.6:g?.65:R.elite?1.7:1.05}),d.weaponImpacts.length>180&&d.weaponImpacts.splice(0,d.weaponImpacts.length-180)}drawWeaponImpacts(d){if(d.weaponImpacts=(d.weaponImpacts||[]).filter(T=>(d.elapsed||0)-T.born<T.life),!d.weaponImpacts.length&&!d.beams?.length&&!d.projectiles?.some(T=>T.missile))return;let b=this.eye,R=r.norm(r.cross(this.cameraForward,this.cameraUp)),L=r.norm(r.cross(R,this.cameraForward)),g=[],w=this.height/(2*Math.tan(this.fov/2));for(let T of d.projectiles||[]){if(!T.missile)continue;let S=T.visual?.compact,I=(T.trail||[]).slice(S?-14:-32),D=r.length(r.sub(T.pos,b))>650?3:2;for(let Y=D;Y<I.length;Y+=D){let ht=I[Y-D],rt=I[Y],X=Y/I.length,$=r.scale(r.add(ht,rt),.5),Q=r.sub(rt,ht);if(r.length(Q)<.01)continue;let at=r.norm(r.cross(Q,r.sub(b,$))),pt=r.length(r.sub($,b))/w,tt=Math.max(S?.09:.22,pt*(S?.55:1.05)),yt=[.62,.69,.77];for(let[Et,bt]of[[0,-1],[0,1],[1,-1],[1,-1],[0,1],[1,1]])g.push(...r.add(r.sub(Et?rt:ht,b),r.scale(at,bt*tt)),...yt,Et,bt,X*.24,4)}let U=r.sub(T.pos,r.scale(r.norm(T.velocity),Math.min(S?4:9,Math.max(2,T.age*45)))),B=T.pos,z=r.scale(r.add(U,B),.5),k=r.norm(r.cross(r.sub(B,U),r.sub(b,z))),H=Math.max(S?.12:.28,r.length(r.sub(z,b))/w*(S?.8:2.2));for(let[Y,ht]of[[0,-1],[0,1],[1,-1],[1,-1],[0,1],[1,1]])g.push(...r.add(r.sub(Y?B:U,b),r.scale(k,ht*H)),1,.48,.12,Y,ht,.9,4)}for(let T of d.beams||[]){let S=r.scale(r.add(T.start,T.end),.5),I=r.norm(r.cross(r.sub(T.end,T.start),r.sub(b,S))),D=r.length(r.sub(S,b))/w,U=T.compact?Math.min(D*2,Math.max(T.width,D*.65)):Math.max(T.width*3,D*(T.width>=2?10:T.width>=.4?6:1.5)),B=Math.min(1,(1-T.age/T.life)*4)*.9;for(let[z,k]of[[0,-1],[0,1],[1,-1],[1,-1],[0,1],[1,1]]){let H=r.add(r.sub(z?T.end:T.start,b),r.scale(I,k*U));g.push(...H,...T.color,z,k,B,4)}}for(let T of d.weaponImpacts){let S=Math.max(0,((d.elapsed||0)-T.born)/T.life),I=Math.max(.001,r.length(r.sub(T.pos,b))/w),D=Math.max(I*(T.compact?1:T.elite?18:6),Math.min(I*(T.compact?20:T.elite?260:150),T.radius*(.65+S*(T.compact?.5:1.8))));for(let[U,B]of[[-1,-1],[1,-1],[-1,1],[-1,1],[1,-1],[1,1]]){let z=r.add(r.sub(T.pos,b),r.add(r.scale(R,U*D),r.scale(L,B*D)));g.push(...z,...T.color,U,B,S,T.type)}}this.setDepthWrite(!1),this.setBlend(!0),this.drawImpacts(g),this.setBlend(!1),this.setDepthWrite(!0)}drawCombatEffects(d,b,R=this.ownModel,L=window.GalacticDemo?.state.shipIndex??0){let g=y[L];if(d.charging){let I=[];for(let D of g.main){let U=a.transform(R,D);I.push(...U,...d.profile.weaponColor,(d.profile.visual?.muzzle||22)*(.35+d.charge*.85))}this.setDepthWrite(!1),this.setBlend(!0),this.dynamicFlat(I,!0,.7),this.setBlend(!1),this.setDepthWrite(!0)}let w=[],T=[];for(let I of d.projectiles)if(I.missile){if(I.trail)for(let z=1;z<I.trail.length;z++){let k=z/I.trail.length,H=[.6*k,.71*k,.73*k];w.push(...I.trail[z-1],...H,1,...I.trail[z],...H,1)}let D=r.norm(I.velocity),U=r.add(I.pos,r.scale(D,-2.8));w.push(...U,1,.56,.2,1,...I.pos,1,.88,.64,1),T.push(...I.pos,...I.color||[1,.77,.42],I.visual?.capital?Ql(I.visual,r.length(r.sub(I.pos,this.eye)),this.height,this.fov):4.5);let B=this.segmentModel(r.add(I.pos,r.scale(D,-.9)),I.pos,1.15);this.drawMesh(this.missileMesh,B,{light:[-.3,.7,1]})}else{let D=r.add(I.pos,r.scale(r.norm(I.velocity),-(I.visual?.capital?Math.min(I.visual.trail,I.age*r.length(I.velocity)):I.kind==="pd"?1.3:I.hostile?11:3))),U=I.color||(I.hostile?[.94,.3,.2]:[.6,.86,1]);if(I.visual?.capital){this.setDepthWrite(!1),this.setBlend(!0),this.drawMesh(this.plumeMesh,this.segmentModel(I.pos,D,I.visual.radius*2.4),{mode:4,tint:U,opacity:.6}),this.drawMesh(this.plumeMesh,this.segmentModel(I.pos,D,I.visual.radius*.55),{mode:4,tint:[1,.96,.9],opacity:.95}),this.setBlend(!1),this.setDepthWrite(!0);let B=Ql(I.visual,r.length(r.sub(I.pos,this.eye)),this.height,this.fov);T.push(...I.pos,U[0]*.48,U[1]*.48,U[2]*.48,B,...I.pos,1,.96,.9,B*.32)}w.push(...D,...U,1,...I.pos,...U,1),T.push(...I.pos,...U,I.hostile?2:3)}w.length&&this.dynamicFlat(w,!1,.9);let S=[];for(let I of d.particles){let D=1-I.age/I.life,U=I.color||[1,.7,.36];S.push(...I.pos,U[0]*D,U[1]*D,U[2]*D,I.size)}this.setDepthWrite(!1),this.setBlend(!0),T.length&&this.dynamicFlat(T,!0,1),S.length&&this.dynamicFlat(S,!0,1),this.setBlend(!1),this.setDepthWrite(!0),this.drawSpecial(d,b),this.drawWeaponImpacts(d),this.drawMushroomClouds(d)}endFrame(){let d=super.endFrame();return this.cabinRequest&&(this.cabins??=new xo(this),this.cabins.draw(this.cabinRequest)),d}dispose(){this.cabins?.dispose(),super.dispose()}flight(d,b){if(this.cabinRequest=null,this.fighterConsoleFrame=null,globalThis.flightController?.overview)return globalThis.flightController.drawOverview(this,d,b);this.begin(b),this.cabinRequest=null;let R=d.flight,L=y[d.shipIndex],g=h(R),{forward:w,right:T,up:S}=g,I=a.camera(R.pos,w,S),D=o(R,d.shipIndex);this.flightCameraMatrix=I,this.ownModel=D;let U=R.cameraBlend??(R.external?1:0),B=[0,L.length*.12,L.length*.25],z=R.cameraZoom||1,k=R.orbitYaw||0,H=L.chase,Y=Math.cos(k),ht=Math.sin(k),rt=[(H[0]*Y+H[2]*ht)*z,(H[1]+(R.orbitPitch||0)*H[2])*z,(-H[0]*ht+H[2]*Y)*z],X=Math.sin(U*Math.PI)*L.length*.15,$=B.map((V,Vt)=>s(V,rt[Vt],U));$[0]+=X,$[1]+=X*.8;let Q=r.scale(L.focus,Math.max(0,1-Math.abs(k)*1.4)),at=r.norm(r.sub(Q,rt)),pt=r.norm([at[0]*U,at[1]*U,s(-1,at[2],U)]),tt=R.shake||0;$[0]+=Math.sin(b*53)*tt*.18,$[1]+=Math.cos(b*63)*tt*.12;let yt=a.transform(I,$),Et=r.add(r.scale(T,pt[0]),r.add(r.scale(S,pt[1]),r.scale(w,-pt[2])));if(U<.17){let V=R.cabinPose,Vt=R.profile.capital?(R.cabinKind||He({role:"line",length:L.length}))==="bastion"?[0,3.75,2]:[0,3.8,-1]:[0,0,0];V&&(yt=r.add(yt,r.add(r.scale(T,V.eye[0]-Vt[0]),r.add(r.scale(S,V.eye[1]-Vt[1]),r.scale(w,-V.eye[2]+Vt[2])))),Et=r.add(r.scale(w,Math.cos(V.yaw)*Math.cos(V.pitch)),r.add(r.scale(T,Math.sin(V.yaw)*Math.cos(V.pitch)),r.scale(S,Math.sin(V.pitch)))))}if(R.detonated){let V=R.detonated,Vt=Math.min(1,V.age/.3),Bt=r.add(V.pos,[V.radius*.72,V.radius*.4,V.radius*1.35]);yt=yt.map((Jt,mt)=>s(Jt,Bt[mt],Vt)),Et=r.norm(r.sub(V.pos,yt))}this.eye=yt,this.cameraForward=r.norm(Et),this.cameraUp=S;let bt=xu(R.speed,R.profile.maxSpeed,R.profile.capital),Ot=this.speedFovTime==null?0:Math.min(.1,Math.max(0,b-this.speedFovTime));this.speedFovShip!==d.shipIndex&&(this.speedFov=0,this.speedFovShip=d.shipIndex),this.speedFov=yu(this.speedFov||0,bt,Ot),this.speedFovTime=b;let St=s(d.shipIndex===3?65:62,d.shipIndex===3?61:55,U)+this.speedFov;this.fov=St*Math.PI/180;let Yt=a.perspective(this.fov,this.width/this.height,s(.035,Math.max(.035,L.length*.04),U),22e3);if(Yt[9]=-.06,this.projectionOffset=-.06,this.projectionShiftX=0,this.vp=a.mul(Yt,a.lookAt(yt,r.add(yt,Et),S)),globalThis.flightController?globalThis.flightController.presentation.environment(this,b):this.environment(d,b),globalThis.flightController)globalThis.flightController.drawFleet(this);else for(let V of R.targets)if(V.hp>0&&!V.terrainTurret){let Vt=a.compose(V.pos,[.035,V.heading||.2,-.045],[V.scale,V.scale,V.scale]);this.drawVessel(V.kind,Vt,{light:[-.3,.65,1],exposure:.85}),this.drawShield(V,V.kind,Vt)}let Ut=R.detonated?0:i((U-.035)/.18,0,1);Ut>.001&&this.drawVessel(d.shipIndex,D,{light:[-.5,.9,.75],opacity:Ut,exposure:.83},R.joints),U<.17&&!R.detonated&&this.drawBow(d.shipIndex,D,i(1-U/.17,0,1)),this.drawShield(R,d.shipIndex,D,Ut),Ut>.05&&U>.04&&this.drawExhaust(d.shipIndex,D,R.throttle,R.boostActive,b,Ut),this.drawCombatEffects(R,b,D),globalThis.flightController&&!globalThis.flightController.fullDetail&&globalThis.flightController.presentation.draw(this,globalThis.flightController,!1);let $t=R.detonated?0:i(1-U/.17,0,1);if($t>0&&R.profile.capital&&(this.cabinRequest={kind:R.cabinKind||He({role:"line",length:L.length}),console:this.bridgeInstrumentState,pose:R.cabinPose,time:b,fov:this.fov,opacity:$t,row:[0,...R.pos,Math.PI-R.yaw,R.pitch,R.hull,R.shield,-1,R.speed/8,R.gunCooldown,R.missileCooldown],meta:{type:n.ships[d.shipIndex].id,maxHp:100,maxShield:100},auto:R.ai,throttle:R.throttle/100}),$t>0&&!R.profile.capital){let V=a.mul(I,a.translate(...B));U<.02&&this.beginOverlay(),this.drawMesh(R.profile.capital?this.bridgeMesh:this.cockpit,V,{opacity:$t,light:[-.35,.7,.6],exposure:.7}),this.fighterConsoleFrame=V,this.fighterConsole.update(this.fighterInstrumentState,b);for(let Vt=0;Vt<this.screens.length;Vt++)this.drawMesh(this.screens[Vt],V,{mode:2,texture:this.fighterConsole.displays[Vt].texture,opacity:$t})}}pickFighterConsole(d,b){if(this.cabinRequest)return this.cabins?.pickFighterConsole(d,b)||null;let R=this.fighterConsoleFrame;if(!R)return null;let L=this.ray(d,b),g=L.origin.map((T,S)=>T-R[12+S]),w=T=>[0,4,8].map(S=>T.reduce((I,D,U)=>I+D*R[S+U],0));return this.fighterConsole.pick(w(g),w(L.direction))}pickBridgeConsole(d,b){return this.cabinRequest&&this.cabins?.pickBridgeConsole(d,b)||null}bridgeConsoleLayout(){return this.cabinRequest?this.cabins?.bridgeConsoleLayout()||[]:[]}fighterConsoleLayout(){if(this.cabinRequest)return this.cabins?.fighterConsoleLayout()||[];let d=this.fighterConsoleFrame;return d?this.fighterConsole.layout(b=>this.project(a.transform(d,b))):[]}ray(d,b){let R=r.norm(r.cross(this.cameraForward,this.cameraUp)),L=r.cross(R,this.cameraForward),g=Math.tan(this.fov/2),w=d/this.width*2-1,T=1-b/this.height*2,S=r.norm(r.add(this.cameraForward,r.add(r.scale(R,(w+(this.projectionShiftX||0))*g*this.width/this.height),r.scale(L,(T+(this.projectionOffset||0))*g))));return{origin:[...this.eye],direction:S}}project(d){let b=this.vp,R=b[0]*d[0]+b[4]*d[1]+b[8]*d[2]+b[12],L=b[1]*d[0]+b[5]*d[1]+b[9]*d[2]+b[13],g=b[2]*d[0]+b[6]*d[1]+b[10]*d[2]+b[14],w=b[3]*d[0]+b[7]*d[1]+b[11]*d[2]+b[15];return{x:(R/w*.5+.5)*this.width,y:(-L/w*.5+.5)*this.height,z:g/w,visible:w>0,w}}}return{Renderer:P,V:r,M:a,clamp:i,mix:s,seeded:u,LAYOUTS:y,axes:h,shipMatrix:o,turretTransforms:l,jointTransforms:tc}}function Ig(n){return n.role==="line"&&n.length>=50?"elite":n.role}function ec(n,t,e=0){let i=new Map,s=new Map;for(let[o,l]of n){let p=t(o),c=Ig(p);i.has(c)||i.set(c,[]),i.get(c).push({id:o,count:l,profile:p})}let r=i.get("line")||[],u=Math.max(20,...r.map(o=>o.profile.length))*4,m=u*3.5,x=(i.get("elite")||[]).reduce((o,l)=>o+l.count,0),M=Math.max(0,...(i.get("elite")||[]).map(o=>o.profile.length)),y=x?Math.min(8,x)*M*2+u:0,h=e?Math.ceil(e/2)*(m*2+u*4)*(e%2?1:-1):0;for(let[o,l]of i){let p=l.reduce((A,P)=>A+P.count,0),c=Math.max(...l.map(A=>A.profile.length)),f=Math.max(o==="fighter"?28:60,c*4),E=Math.min(o==="fighter"?12:8,p),_=Math.min(3,Math.ceil(p/E)),v=0;for(let{id:A,count:P}of l){let C=[];for(let d=0;d<P;d++,v++){let b=v%E,R=Math.floor(v/E)%_,L=Math.floor(v/(E*_)),g=(R-(_-1)/2)*Math.min(200,f*1.3),w=(b-(E-1)/2)*f+h;if(o==="line"&&y&&(w=h+(v%2?1:-1)*(y+Math.floor(b/2)*f)),o==="fighter"||o==="screen"){let S=v%2?1:-1;w=h+S*(y+m+Math.floor(b/2)*f),g+=(o==="fighter"?1:-1)*(140+R*20)}o==="elite"&&(w=h+(b-(E-1)/2)*f,g=(R-(_-1)/2)*Math.min(200,f));let T=L*f*1.2+(o==="elite"?-60:o==="line"?0:o==="artillery"?320:o==="support"?500:180);C.push({role:o,spacing:f,depth:T,y:g,z:w})}s.set(A,C)}}return s}function _o(n,t,e,i,s=e){let r=n.map((h,o)=>h-s[o]),a=t.map((h,o)=>h-n[o]-(e[o]-s[o])),u=r.reduce((h,o)=>h+o*o,0)-i*i;if(u<=0)return 0;let m=a.reduce((h,o)=>h+o*o,0),x=2*r.reduce((h,o,l)=>h+o*a[l],0);if(m<1e-12)return null;let M=x*x-4*m*u;if(M<0)return null;let y=(-x-Math.sqrt(M))/(2*m);return y>=0&&y<=1?y:null}function Tu(n,t,e){let i=Bn(n.profile),s=i.turn*e,r=u=>Math.atan2(Math.sin(u),Math.cos(u)),a=(u,m,x)=>Math.max(m,Math.min(x,u));n.yaw=r(n.yaw+(t.heading===void 0?t.yaw*s:a(r(t.heading-n.yaw),-s,s))),(i.kind==="fighter"||t.lock)&&(n.pitch=a(n.pitch+(t.elevation===void 0?t.pitch*s:a(t.elevation-n.pitch,-s,s)),-1.2,1.2)),n.roll=i.kind==="fighter"?r((n.roll||0)+(t.roll||0)*1.65*e):0}function ic(n,t,e,i){let s={x:n[1],y:n[2],z:n[3],yaw:n[4],pitch:n[5],roll:n[12]||0,speed:n[9],profile:t},r=Bn(t),a=(u,m,x)=>Math.max(m,Math.min(x,u));for(let u=Math.max(0,Math.min(.4,i));u>1e-7;){let m=Math.min(.05,u);u-=m,Tu(s,e,m);let x=e.throttle*t.speed*(e.boost?1.5:1);s.speed+=a(x-s.speed,-t.speed*r.braking*m,t.speed*r.acceleration*m),s.x+=Math.sin(s.yaw)*Math.cos(s.pitch)*s.speed*m,s.y+=Math.sin(s.pitch)*s.speed*m,s.z+=Math.cos(s.yaw)*Math.cos(s.pitch)*s.speed*m}return s}var Pg=12e3;function Au(n={}){return{kind:"planet",radius:Pg,center:[700,-12400,0],atmosphere:180,biome:n.biome||"terrestrial",moon:!!n.moon,...n.id?{planetId:n.id}:{}}}function Mo(n,t={}){return n?.kind==="planet"?!n.planetId&&t.id?{...n,planetId:t.id}:n:{...Au(t),center:[700,-12800,0]}}function Cu(n,t,e=Au(),i=0){let s=-1050-n.depth-i*400,r=n.z,a=Math.max(-560,Math.min(560,n.y-Math.min(60,t.length*1.2+12)));return[s,Math.max(a,bo(e,s,r)+Math.max(20,t.radius*1.2)),r]}function bo(n,t,e){if(n?.kind!=="planet")return-1/0;let[i,s,r]=n.center,a=n.radius;return s+Math.sqrt(Math.max(0,a*a-(t-i)**2-(e-r)**2))}var Se=(n,t,e)=>e.flatMap(i=>[[-n,t,i],[n,t,i]]),Ru={Light_Fighter:1,Heavy_Fighter:2,Titanenergetic_Frigate:5,Cruiser:10,Battleship:20,Bomber:20,Dreadnought:20,Destroyer:25,Interceptor:50,Devourer_Interceptor:50,Iron_Behemoth:200},nc=(n,t,e,i)=>[-1,1].map(s=>[n+s*.22*i,t+.096*i,e-.905*i]),Nn={Light_Fighter:{role:"\u8F7B\u578B\u6218\u673A",scale:1,install:!1,primary:"\u56FA\u5B9A\u8F7B\u578B\u6FC0\u5149\u70AE",kind:"light_laser",muzzles:Se(1.79,-1.44,[-2.48]),caliber:.052,pointDefense:[]},Heavy_Fighter:{role:"\u91CD\u578B\u6218\u673A",scale:1,install:!1,primary:"\u56FA\u5B9A\u91CD\u578B\u6FC0\u5149\u70AE",kind:"heavy_laser",muzzles:[[1.095,.445,-2.335]],caliber:.075,pointDefense:[]},Cruiser:{role:"\u79BB\u5B50\u5DE1\u6D0B\u8230",scale:1,install:!1,primary:"\u53CC\u8054\u79BB\u5B50\u70AE",kind:"ion",muzzles:[-1,1].flatMap(n=>nc(n*1.88,1.33,-.59,.38)),caliber:.07,pointDefense:Se(1.88,1.33,[-.59]),pdScale:.38},Battleship:{role:"\u91CD\u578B\u6218\u5217\u8230",scale:1,install:!1,primary:"\u4F4E\u77EE\u8230\u70AE\u5206\u7EC4\u9F50\u5C04",kind:"shell",muzzles:[...[-1,1].flatMap(n=>nc(n*1.26,.94,-1.43,.86)),...nc(0,1.16,-.42,.66)],caliber:.1,pointDefense:Se(1.45,1.11,[2.02]),pdScale:.6},Bomber:{role:"\u5BFC\u5F39\u8230",scale:1,install:!1,primary:"\u6FC0\u5149\u5236\u5BFC\u7B49\u79BB\u5B50\u5BFC\u5F39",kind:"missile",muzzles:[],caliber:.13,pointDefense:Se(.85,.65,[.25]),pdScale:.42,missiles:[-1,1].flatMap(n=>Array.from({length:4},(t,e)=>{let i=n*(1.55+e*.48),s=-.63;return[i*Math.cos(.27)+n*s*Math.sin(.27),-n*i*Math.sin(.27)+s*Math.cos(.27),-.58]})),launchDirection:[0,0,-1]},Dreadnought:{role:"\u5927\u578B\u6218\u8230",scale:1,primary:"\u524D\u7F6E\u53CC\u6FC0\u5149\u70AE",kind:"laser",muzzles:Se(1.48,-.92,[-6.19]),caliber:.11,pointDefense:[...Se(.91,1.035,[-1.7]),...Se(1.25,1.505,[1.3]),...Se(.7,2.315,[2.65])]},Destroyer:{role:"\u91CD\u578B\u6218\u8230",scale:1,primary:"\u53CC\u7B49\u79BB\u5B50\u5927\u70AE",kind:"plasma",muzzles:Se(.62,-.33,[-7.25]),caliber:.23,pointDefense:[...Se(.83,.997,[-3.3]),...Se(2.6,.322,[1.2]),...Se(1.8,.512,[5.7])]},Interceptor:{role:"\u6838\u5B50\u70AE\u8230",scale:1,primary:"\u6838\u5B50\u5927\u70AE",kind:"nuclear",muzzles:[[0,-.36,-5.86]],caliber:.33,pointDefense:[[-.56,1.9483,-3],[.56,1.9483,-3],[-.56,1.8838,-.1],[.56,1.8838,-.1],[-.56,1.802,4.7],[.56,1.802,4.7],[-.48,-2.259,-1.7],[.48,-2.259,-1.7],[-.48,-2.3317,1],[.48,-2.3317,1],[-.48,-2.05,4.9],[.48,-2.05,4.9]]},Iron_Behemoth:{role:"\u8D85\u5DE8\u578B\u6307\u6325\u6BCD\u8230",scale:2.8,primary:"\u65E0\u4E3B\u70AE \xB7 \u8FD1\u9632\u81EA\u536B",kind:null,muzzles:[],caliber:0,pointDefense:[...Se(1.65,1.606,[-4.8]),...Se(1.5,1.271,[-1.2]),...Se(1.3,1.541,[1.1]),...Se(.62,1.673,[3]),...Se(2.2,.662,[5.25]),...Se(3.53,.673,[5.7]),...Se(.5,2.842,[5.75])]},Devourer_Interceptor:{role:"\u53CC\u4E3B\u70AE\u622A\u51FB\u8230",scale:1,primary:"\u53CC\u91CD\u578B\u4E3B\u70AE",kind:"heavy",muzzles:[[-1.67,-1.05,-7.02],[1.67,-1.05,-7.02]],caliber:.3,pointDefense:[[-1.67,.0547,-4.8],[1.67,.0547,-4.8],[-1.67,-.0534,-1.5],[1.67,-.0534,-1.5],[-2.85,.46,4.65],[2.85,.46,4.65]]},Titanenergetic_Frigate:{role:"\u5C0F\u578B\u9AD8\u7EA7\u6218\u673A",scale:.4,primary:"\u4E2D\u592E\u4E3B\u70AE",kind:"advanced",muzzles:[[0,-.4,-7.01]],caliber:.21,pointDefense:[[-3.32,.8055,.1],[3.32,.8055,.1],[-3.32,.628,1.23],[3.32,.628,1.23]]}};Nn.Titanenergetic_Frigate.pointDefense=[];Nn.Titanenergetic_Frigate.primary="\u4E2D\u592E\u805A\u80FD\u4E3B\u70AE + \u4E24\u4FA7\u5341\u4E8C\u8054\u5BFC\u5F39\u53E3";Nn.Titanenergetic_Frigate.missiles=[-1,1].flatMap(n=>[-.3,0,.3].flatMap(t=>[-.9,-.56].map(e=>[n*3.35+t,e,-.87])));Nn.Titanenergetic_Frigate.launchDirection=[0,0,-1];var l_=Object.fromEntries(["Destroyer","Interceptor","Devourer_Interceptor"].map(n=>[n,{name:Nn[n].primary,reason:"\u4E3B\u70AE\u5D4C\u5165\u539F\u6709\u7EB5\u5411\u70AE\u8231\uFF0C\u4F9D\u7167\u7528\u6237\u6307\u5B9A\u7684\u6B66\u5668\u914D\u7F6E\u3002"}]));Object.assign(Ru,{Reaper:90,Annihilator:8});Object.assign(Nn,{Reaper:{role:"RAVEN \u6536\u5272\u8230 \xB7 \u53C2\u8003\u6A21\u578B",install:!1,primary:"\u53CC\u675F\u76F8\u4F4D\u6536\u5272",kind:"reaper",muzzles:Se(2.04,-.33,[-1.35]),caliber:.115,pointDefense:[[-1.3,1.016081,-.6],[1.3,1.016674,-.6],[-.44,1.11925,3.5],[.44,1.11925,3.5]],pdScale:.27,missiles:[[-1.18,1.003596,-1.6],[-1.18,1.051833,-1.2],[1.18,1.010117,-1.6],[1.18,1.055983,-1.2]],launchDirection:[0,1,0]},Annihilator:{role:"\u65E0\u4EBA\u53CD\u7269\u8D28\u81EA\u884C\u5BFC\u5F39",install:!1,primary:"\u9501\u5B9A / \u81EA\u884C\u7A81\u51FB",kind:"antimatter",muzzles:[],caliber:.3,pointDefense:[]}});var Dg=Object.freeze({aura:.15,focusRadius:1e3,lockRange:2400,focusFraction:.35,focusMax:8,focusSeconds:6,focusCooldown:8,initial:8,wave:4,interval:6,capacity:12,lifetime:30,swarmShare:.8,hull:35,cooldown:.5,guardRadius:240});function Iu(n,t=[0,0,0],e=!1){let i=n.profile?.ground?n.turretYaw??n.yaw:n.yaw,s=n.profile?.ground?n.turretPitch??0:n.pitch,r=n.profile?.ground&&!e?n.profile.hardpoints?.pivot??3:0,a=Math.sin(i),u=Math.cos(i),m=Math.sin(s),x=Math.cos(s),[M,y,h]=[t[0],t[1]-r,t[2]],o=n.roll||0,l=y*Math.cos(o)+h*Math.sin(o),p=h*Math.cos(o)-y*Math.sin(o);return[-M*a*x-l*a*m+p*u,-M*m+l*x,-M*u*x-l*u*m-p*a].map((c,f)=>c+(e?0:[n.x,n.y+r,n.z][f]))}var So=class extends EventTarget{constructor(t){super(),this.url=t,this.closed=!1,this.readyState=0,this.connect()}async connect(){if(!this.closed){this.readyState=0,this.abort=new AbortController;try{let t=await fetch(this.url,{credentials:"same-origin",cache:"no-store",headers:{"X-Empire-Client":"galactic-command",Accept:"text/event-stream"},signal:this.abort.signal});if(!t.ok)throw Error("\u6218\u573A\u8FDE\u63A5\u5931\u8D25\uFF1A"+t.status);if(this.closed)return;this.readyState=1;let e=t.body.getReader(),i=new TextDecoder,s="",r="",a=[];for(;!this.closed;){let u=await e.read();if(u.done)break;s+=i.decode(u.value,{stream:!0});let m;for(;(m=s.indexOf(`
`))!==-1;){let x=s.slice(0,m).replace(/\r$/,"");if(s=s.slice(m+1),x===""){if(a.length){let M=new MessageEvent(r||"message",{data:a.join(`
`)});this.dispatchEvent(M),M.type==="message"&&this.onmessage?.(M)}if(r="",a=[],this.closed)break}else x.startsWith("event:")?r=x.slice(6).trim():x.startsWith("data:")&&a.push(x.slice(5).replace(/^ /,""))}}}catch(t){if(this.closed)return;this.readyState=0,this.onerror?.(t)}this.closed||(this.readyState=0,this.retry=setTimeout(()=>this.connect(),1500))}}close(){this.closed=!0,this.readyState=2,clearTimeout(this.retry),this.abort?.abort()}};function sc(n){let t=new Map;for(let e of n){let i=e.formation;t.has(i)||t.set(i,{key:i,side:e.side,owner:e.owner,batch:e.batch,type:e.type,length:e.profile.length,ids:[]}),t.get(i).ids.push(e.id)}return[...t.values()]}function Pu(n,t,{eye:e,height:i=1080,fov:s=1,quality:r=1,pinned:a=[],previous:u=new Map}){let m=new Set,x=[],M=new Map,y=0,h=i/(2*Math.tan(s/2));for(let o of n){let l=o.ids.filter(v=>t[v]?.[6]>0);if(y+=l.length,!l.length)continue;let p=[0,0,0];for(let v of l)for(let A=0;A<3;A++)p[A]+=t[v][A+1]/l.length;let c=Math.max(1,Math.hypot(...p.map((v,A)=>v-e[A]))),f=o.length*h/c,E=Math.max(...l.map(v=>Math.hypot(...p.map((A,P)=>A-t[v][P+1])))),_=l.length>4&&f<(u.get(o.key)==="far"?7:4)/r&&E*h/c<220;M.set(o.key,_?"far":"individual");for(let v of l)m.add(v);_&&x.push({...o,ids:l,center:p,count:l.length,distance:c})}return{visible:m,labels:x,levels:M,alive:y}}function Lu({state:n,M:t,V:e,LAYOUTS:i,shipMatrix:s}){class r{constructor(){this.impacts=[],this.flashes=[]}event(u,m){u.type==="fire"&&this.flashes.push({pos:u.from,color:this.color(u.kind),age:0,life:.22}),(u.type==="hit"||u.type==="destroy"||u.type==="intercept")&&this.impacts.push({id:u.shipId,pos:[u.x,u.y,u.z],shield:u.type==="hit"&&u.shield,dead:u.type==="destroy",age:0,life:u.type==="destroy"?2.4:.7,radius:Math.max(2,m.metadata[u.shipId]?.profile.length*.65||3)})}color(u){return/laser|ion/.test(u)?[1,.45,.09]:/plasma/.test(u)?[.35,.5,1]:/beam/.test(u)?[.12,.65,1]:[1,.8,.45]}update(u){this.impacts=this.impacts.filter(m=>(m.age+=u)<m.life).slice(-160),this.flashes=this.flashes.filter(m=>(m.age+=u)<m.life).slice(-240)}clear(){this.impacts=[],this.flashes=[]}environment(u,m,x=globalThis.flightController?.snapshot?.environment||globalThis.flightController?.replay?.environment){if(u.drawSpaceSky(.8),x?.kind==="planet"){u.drawBattlePlanet(x);return}let M=t.compose([3200,-2500,-5200],[.1,.42,.18],[900,900,900]);u.drawMesh(u.moonMesh,M,{mode:7,light:[-.5,.7,1],exposure:1.1}),u.setBlend(!0,!1),u.drawMesh(u.moonMesh,t.compose([3200,-2500,-5200],[.1,.42,.18],[915,915,915]),{mode:8}),u.setBlend(!1,!0)}draw(u,m,x){let M=[],y=[],h=u.height/(2*Math.tan(u.fov/2)),o=u.eye,l=_=>Math.max(.015,e.length(e.sub(_,o))/h),p=(_,v,A,P,C=1)=>{let d=e.sub(v,_),b=e.scale(e.add(_,v),.5),R=e.norm(e.cross(d,e.sub(o,b)));if(!Number.isFinite(R[0]))return;let L=Math.max(P,l(b)*8),g=e.scale(R,L),w=[e.sub(_,g),e.add(_,g),e.sub(v,g),e.add(v,g)];for(let T of[0,1,2,2,1,3])M.push(...e.sub(w[T],o),...A,T<2?0:1,T%2?1:-1,C)},c=(_,v,A,P=1)=>y.push(..._,...v.map(C=>C*P),A);if(x){for(let _ of n.flight.beams.slice(-240)){let v=Math.max(0,1-_.age/_.life);p(_.start,_.end,_.color,_.width*2,v),c(_.start,_.color,12,v),c(_.end,_.color,16,v*.65)}for(let _ of n.flight.projectiles){let v=e.length(_.velocity),A=e.sub(_.pos,e.scale(e.norm(_.velocity),Math.min(_.missile?40:28,v*.08))),P=_.missile?[1,.55,.16]:_.color||[.6,.8,1];p(A,_.pos,P,_.missile?.32:.45,.9),c(_.pos,P,_.missile?9:7)}}for(let _ of m.engineIds||[]){let v=m.row(_),A=m.indices.get(m.metadata[_]?.type),P=i[A];if(!v||!P||v[9]<.1)continue;let C=s({pos:v.slice(1,4),yaw:Math.PI-v[4],pitch:v[5],roll:0},A);if(!(e.length(e.sub(v.slice(1,4),o))>1800))for(let d of P.engines.slice(0,6)){let b=t.transform(C,d.position),R=e.norm(e.sub(t.transform(C,d.direction),t.transform(C,[0,0,0]))),L=d.radius*(5+Math.min(1,v[9]/m.metadata[_].profile.speed)*9);p(b,e.add(b,e.scale(R,L)),[.12,.5,1],d.radius*.8,.65),c(b,[.3,.7,1],Math.min(16,Math.max(3,d.radius/l(b)*2)),.7)}}for(let _ of x?this.flashes:[])c(_.pos,_.color,22,1-_.age/_.life);let f=e.norm(e.cross(u.cameraForward,u.cameraUp)),E=e.norm(e.cross(f,u.cameraForward));for(let _ of x?this.impacts.slice(-Math.floor(40*m.quality)):[]){let v=_.age/_.life,A=1-v,P=m.row(_.id),C=_.shield&&P?.[6]>0?P.slice(1,4):_.pos,d=_.dead?_.radius*(.5+v*5):_.radius*(1+v*.15),b=_.shield?[.12,.6,1]:[1,.4,.07],R=Math.min(180,Math.max(12,d/l(C)*2));if(c(C,b,R,A*(_.shield?.3:.9)),c(C,[1,.9,.65],R*.22,A*(_.shield?.2:1)),_.shield||_.dead){let L;for(let g=0;g<=24;g++){let w=g/24*Math.PI*2,T=e.add(C,e.add(e.scale(f,Math.cos(w)*d),e.scale(E,Math.sin(w)*d*(_.dead?.45:1))));L&&p(L,T,b,l(C)*1.2,A*(_.shield?.7:.4)),L=T}}if(_.dead)for(let L=0;L<12;L++){let g=L*2.39996,w=e.add(e.scale(f,Math.cos(g)),e.scale(E,Math.sin(g))),T=e.add(C,e.scale(w,d*(.7+L%4*.15)));p(e.sub(T,e.scale(w,_.radius*.3)),T,[1,.65,.25],.15,A)}}u.setBlend(!0,!1),M.length&&u.drawRibbons(new Float32Array(M)),y.length&&u.dynamicFlat(y,!0,1),u.setBlend(!1,!0)}}return new r}function Du(n=globalThis){let t=new AbortController,e=new Set,i=new Set,s=!1;return{get disposed(){return s},signal:t.signal,listen(r,a,u,m={}){!r||s||r.addEventListener(a,u,{...typeof m=="boolean"?{capture:m}:m,signal:t.signal})},later(r,a){if(s)return null;let u=n.setTimeout(()=>{e.delete(u),s||r()},a);return e.add(u),u},scheduleFrame(r){if(s)return null;let a=n.requestAnimationFrame(u=>{i.delete(a),s||r(u)});return i.add(a),a},dispose(){if(!s){s=!0,t.abort();for(let r of e)n.clearTimeout(r);for(let r of i)n.cancelAnimationFrame(r);e.clear(),i.clear()}}}}function Fu(n,t,e){let i=t;for(let s of n)s.seq<=i||!Number.isFinite(s.seq)||(e(s),i=s.seq);return i}function Nu(n,t){let e=0,i=n.length;for(;e<i;){let s=e+i>>>1;n[s].tick<=t?e=s+1:i=s}return e}var Ou=({state:n,renderer:t,SHIPS:e,COMBAT:i,LAYOUTS:s,keys:r,$:a,M:u,V:m,clamp:x,mix:M,shortAngle:y,notice:h,configureFlight:o,setView:l,selectedTarget:p,renderContacts:c,shipMatrix:f,tone:E,burst:_,updateCamera:v,forward:A,getMouseDown:P})=>{let C=Du(),{listen:d,later:b}=C;class R{constructor(){this.params=new URLSearchParams(location.search),this.id=this.params.get("battle"),this.replayId=this.params.get("replay"),this.metadata=[],this.rows=[],this.previous=[],this.selected=-1,this.controlled=null,this.seq=0,this.eventSeq=0,this.fireUntil=0,this.missileUntil=0,this.overview=!0,this.presentation=Lu({state:n,M:u,V:m,LAYOUTS:s,shipMatrix:f}),this.distance=650,this.center=[0,0,0],this.quality=1,this.lodLevels=new Map,this.overviewYaw=.45,this.overviewPitch=.24,this.playTime=0,this.playSpeed=1,this.elapsedFrames=[],this.contacts=new Map,this.vesselVisuals=new Map,this.projectileVisuals=new Map,this.meshGroups=new Map,this.detailIds=new Set}name(g){return g==="Swarm_Fighter"?"\u8702\u7FA4\u6218\u6597\u673A":e[this.indices?.get(g)]?.name||g}async orderCarrier(g){let w=this.metadata[this.selected],T=this.selected;if(!(this.carrierPending||this.replay||this.snapshot?.status!=="active"||!w?.profile.carrier||w.owner!==this.owner||!(this.rows[T]?.[6]>0))){this.carrierPending=!0,this.carrierMessage="\u6B63\u5728\u53D1\u9001\u50DA\u673A\u6307\u4EE4";try{await this.request("/api/battles/"+this.id+"/control",{type:"carrier-order",shipId:T,...g}),this.receive(await this.request("/api/battles/"+this.id)),this.carrierMessage="\u50DA\u673A\u6307\u4EE4\u5DF2\u4E0B\u8FBE"}catch(S){this.carrierMessage=S.message,h(S.message)}finally{this.carrierPending=!1}}}async request(g,w){if(w&&this.replayId)throw Error("\u56DE\u653E\u53EA\u8BFB");let T=await fetch(g,{signal:C.signal,credentials:"same-origin",cache:"no-store",headers:{"X-Empire-Client":"galactic-command","Content-Type":"application/json"},...w?{method:"POST",body:JSON.stringify(w)}:{}}),S=await T.json();if(!T.ok){let I=Error(S.error||"\u65E0\u6CD5\u8FDE\u63A5\u6218\u573A");throw I.battleConnection=!0,I}return S}fail(g){C.disposed||(h(g.message),a("#native-status").textContent=g.message,console.error(g))}async start(){document.body.classList.add("real-battle"),a(".flight-header>div").innerHTML="\u94F6\u6CB3\u5E1D\u56FD<span>/</span>\u771F\u5B9E\u6218\u573A",a(".flight-header>p").textContent="\u6B63\u5F0F\u4EA4\u6218 \xB7 \u81EA\u52A8\u63A5\u654C / \u4EB2\u81EA\u9A7E\u9A76",a("#flight").setAttribute("aria-label","\u771F\u5B9E\u6218\u573A\u9A7E\u9A76"),a("#flight-nav-label").textContent="\u771F\u5B9E\u6218\u573A",a(".help-note").textContent="\u8FD9\u662F\u6B63\u5F0F\u6218\u6597\u3002\u79FB\u52A8\u4E0E\u5C04\u51FB\u5F71\u54CD\u771F\u5B9E\u635F\u5931\uFF1B\u9000\u51FA\u9A7E\u9A76\u4EA4\u8FD8 AI\u3002\u5168\u666F\u4E2D\u62D6\u52A8\u65CB\u8F6C\u3001\u6EDA\u8F6E\u7F29\u653E\uFF0CShift \u62D6\u52A8\u5E73\u79FB\u3002";let g=document.createElement("div");g.id="native-battle-bar",g.innerHTML='<strong id="native-status">\u8FDE\u63A5\u771F\u5B9E\u6218\u573A\u2026</strong><select id="native-formation" aria-label="\u5DF1\u65B9\u7F16\u961F"></select><select id="native-vessel" aria-label="\u7F16\u961F\u5185\u8230\u8239"></select><button id="native-claim">\u4EB2\u81EA\u9A7E\u9A76</button><button id="native-release">\u4EA4\u8FD8 AI</button><button id="native-cinema">\u4EA4\u706B\u89C6\u89D2</button><button id="native-ground">\u5730\u9762\u9635\u5730</button><button id="native-overview">\u8230\u961F\u5168\u666F</button><button id="native-follow">\u8DDF\u968F / \u8230\u6865</button><button id="native-leave">\u8FD4\u56DE\u8230\u961F</button><button id="native-pause" hidden>\u6682\u505C</button><select id="native-speed" hidden><option value="1">1\xD7</option><option value="2">2\xD7</option><option value="4">4\xD7</option></select><input id="native-seek" type="range" min="0" max="600" step=".1" value="0" hidden>',document.body.append(g),this.labels=document.createElement("div"),this.labels.id="formation-labels",document.body.append(this.labels),this.labels.onclick=S=>{let I=S.target.closest("[data-group]");if(!I)return;let D=this.displayGroups.find(U=>U.key===I.dataset.group);D&&this.chooseGroup(D.key)},d(window,"message",S=>{S.origin!==location.origin||S.source!==parent||S.data?.type!=="battle-visibility"||(window.commandSceneActive=!S.data.active,S.data.active||(r.clear(),this.setAI(!0)))}),a("#native-formation").onchange=S=>this.chooseGroup(S.target.value),a("#native-vessel").onchange=S=>this.select(Number(S.target.value)),a("#native-claim").onclick=()=>this.setAI(!1),a("#native-release").onclick=()=>this.setAI(!0),a("#native-cinema").onclick=()=>this.frameBattle(),a("#native-ground").onclick=()=>this.frameGround(),a("#native-overview").onclick=()=>this.frameBattle(!0),a("#native-follow").onclick=()=>{this.overview=!1,l()},a("#native-leave").onclick=()=>this.leave(),a("#native-pause").onclick=()=>this.togglePlayback(),a("#native-speed").onchange=S=>this.playSpeed=Number(S.target.value),a("#native-seek").oninput=S=>this.seek(Number(S.target.value));let w=a("#scene");d(w,"wheel",S=>{this.overview&&(S.preventDefault(),this.distance=x(this.distance*Math.exp(S.deltaY*.001),80,12e3))},{passive:!1}),d(w,"pointermove",S=>{if(this.overview&&S.buttons)if(this.cinematicAnchor=null,S.shiftKey){this.cinematicAnchor=null;let I=[Math.cos(this.overviewYaw),0,-Math.sin(this.overviewYaw)];for(let D=0;D<3;D++)this.center[D]-=I[D]*S.movementX*this.distance*.001;this.center[1]+=S.movementY*this.distance*.001}else this.overviewYaw-=S.movementX*.004,this.overviewPitch=x(this.overviewPitch+S.movementY*.003,-1.3,1.3)}),d(document,"visibilitychange",()=>{document.hidden&&(r.clear(),this.setAI(!0))}),d(window,"pagehide",()=>this.dispose());let T=await this.request("/api/state");if(!C.disposed){if(this.owner=T.player.id,this.replayId){await this.loadReplay(this.replayId);return}this.receive(await this.request("/api/battles/"+this.id)),!C.disposed&&(this.stream=new So("/api/battles/"+this.id+"/events"),this.stream.onmessage=S=>{if(!C.disposed)try{this.receive(JSON.parse(S.data))}catch(I){this.fail(I)}},this.stream.onerror=()=>{C.disposed||h("\u6B63\u5728\u91CD\u65B0\u8FDE\u63A5\uFF0C\u8D85\u65F6\u540E\u7531 AI \u63A5\u7BA1")},d(this.stream,"finished",async()=>{this.stream.close(),clearInterval(this.inputTimer);try{this.receive(await this.request("/api/battles/"+this.id)),this.controlled=null,h("\u6218\u6597\u7ED3\u675F \xB7 \u8FD4\u56DE\u8230\u961F\u53EF\u67E5\u770B\u6218\u62A5\u548C\u56DE\u653E")}catch(S){this.fail(S)}}),this.inputTimer=setInterval(()=>this.sendInput(),100),this.syncHeader())}}async loadReplay(g){this.clearVisuals();let w=await this.request("/api/replay/"+encodeURIComponent(g));if(!w.record?.frames?.length||!w.record.metadata?.length)throw Error("\u8FD9\u4EFD\u6218\u62A5\u6CA1\u6709\u53EF\u64AD\u653E\u7684\u7A7A\u95F4\u5F55\u50CF");this.replay={...w.record,events:w.record.events||[],environment:Mo(w.record.environment)},this.deathTicks=new Map(this.replay.events.filter(T=>T.type==="destroy").map(T=>[T.shipId,T.tick])),this.report={...w.report,duration:Number((Number.isFinite(w.report.duration)?w.report.duration:this.replay.frames.at(-1).tick*.05).toFixed(2))},this.metadata=this.replay.metadata,this.rows=this.replay.frames[0].ships,this.previous=this.rows,this.replayAlpha=1,this.playTime=0,this.replayCursor=0,this.paused=!1,this.controlled=null,clearInterval(this.inputTimer),this.prepare(),this.update(0),this.frameBattle(!0),document.body.classList.add("replay-mode"),document.title="\u5386\u53F2\u56DE\u653E \xB7 "+(this.report.title||"\u8230\u961F\u6218\u6597"),a(".flight-header>div").textContent="\u94F6\u6CB3\u5E1D\u56FD / \u5386\u53F2\u56DE\u653E",a(".flight-header>p").textContent=this.report.title||"\u5DF2\u4FDD\u5B58\u7684\u6218\u6597\u8BB0\u5F55",a(".help-note").textContent="\u89C2\u770B\u5DF2\u4FDD\u5B58\u7684\u8230\u961F\u8F68\u8FF9\u4E0E\u4EA4\u706B\u3002\u62D6\u52A8\u8FDB\u5EA6\u6761\u3001\u8C03\u6574\u500D\u901F\uFF1B\u53EF\u5207\u6362\u8230\u961F\u5168\u666F\u6216\u8DDF\u968F\u53C2\u6218\u8230\u8239\u3002",a("#flight-nav-label").textContent="\u5386\u53F2\u56DE\u653E",a("#flight").setAttribute("aria-label","\u5386\u53F2\u6218\u6597\u56DE\u653E");for(let T of["claim","release"])a("#native-"+T).hidden=!0;a("#native-leave").textContent="\u9000\u51FA\u56DE\u653E";for(let T of["pause","speed","seek"])a("#native-"+T).hidden=!1;a("#native-seek").step=".05",a("#native-seek").max=this.report.duration,this.syncHeader(),h("\u5386\u53F2\u56DE\u653E \xB7 "+(this.report.targetName||this.report.title||"\u8230\u961F\u6218\u6597"))}togglePlayback(){this.replay&&(this.playTime>=this.report.duration?(this.seek(0),this.frameBattle(!0),this.paused=!1):this.paused=!this.paused,this.syncHeader())}clearVisuals(){this.presentation.clear(),this.projectileVisuals.clear(),this.vesselVisuals.clear();for(let g of["shieldHits","beams","particles","projectiles","weaponImpacts","specialBlasts","mushroomClouds"])n.flight[g]=[]}seek(g){if(this.replay){this.playTime=x(g,0,this.report.duration),this.replayCursor=Nu(this.replay.events,this.playTime*20),this.clearVisuals();for(let w of this.replay.events)w.tick<=g*20&&w.tick>g*20-360&&this.groundBlast(w,(g*20-w.tick)*.05);this.predicted=null,this.collisionRows=null,this.update(0),this.syncHeader()}}receive(g){if(g={...g,environment:Mo(g.environment)},this.snapshot&&g.tick<this.snapshot.tick)return;g.trial&&(a(".flight-header>p").textContent="\u8230\u961F\u6F14\u7EC3",a(".help-note").textContent="\u4E3B\u529B\u4FDD\u6301\u4E09\u7EF4\u6218\u5217\uFF0C\u8F7B\u8230\u8FD1\u8DDD\u79BB\u7F20\u6597\uFF1B\u8FD4\u56DE\u8230\u961F\u53EF\u4FEE\u6539\u53CC\u65B9\u914D\u6BD4\u3002"),this.previous=this.rows,this.rows=g.ships,this.received=performance.now(),this.snapshot=g,this.projectiles=g.projectiles||[],n.flight.specialBlasts=(g.specialBlasts||[]).filter(S=>!S.harmless).map(S=>({...S,pos:[S.x,S.y,S.z],age:Math.max(0,(g.tick-S.tick)*.05)})),g.metadata&&(this.metadata=g.metadata,this.prepare());let w=g.controls?.[this.owner],T=this.controlRequested&&w?.clientId===this.clientId;(g.tick>(this.controlTick??-1)||T)&&(this.controlled=this.releasing||!T?null:w.shipId),T&&(this.seq=Math.max(this.seq,w.seq??0)),this.controlled!==null&&this.selected!==this.controlled&&this.select(this.controlled,!1),this.eventSeq=Fu(g.events||[],this.eventSeq,S=>this.effect(S)),this.eventSeq=Math.max(this.eventSeq,g.eventSeq||0),g.status==="finished"&&!this.replay&&(this.controlled=null,this.overview=!0),this.syncHeader()}prepare(){this.fullDetail=this.metadata.length<=128,this.indices=new Map(e.map((g,w)=>[g.id,w]));for(let g of this.metadata)g.profile.renderType&&this.indices.has(g.profile.renderType)&&this.indices.set(g.type,this.indices.get(g.profile.renderType));this.types=new Map;for(let g of this.metadata)g.owner===this.owner&&g.profile.piloted&&(this.types.has(g.type)||this.types.set(g.type,[]),this.types.get(g.type).push(g.id));if(this.displayGroups=sc(this.metadata),this.refreshGroups(),this.selected<0||!this.metadata[this.selected]){let g=this.metadata.find(w=>w.owner===this.owner&&w.profile.piloted&&this.rows[w.id]?.[6]>0)?.id??this.metadata.find(w=>this.indices.has(w.type))?.id;g!==void 0&&this.select(g,!1)}this.buildGroups(),this.framed||(this.frameBattle(),this.params.get("view")==="ground"&&this.frameGround(),this.framed=!0)}async select(g,w=!0){if(!this.metadata[g]||!this.indices.has(this.metadata[g].type))return;w&&this.controlled!==null&&await this.setAI(!0),this.selected=g,this.predicted=null;let T=this.metadata[g],S=this.indices.get(T.type),I=n.flight.specialBlasts,D=n.flight.mushroomClouds;o(S,!0),n.flight.specialBlasts=I||[],n.flight.mushroomClouds=D||[],n.flight.targets=[],n.flight.ai=!0,this.contacts.clear();let U=this.displayGroups.find(B=>B.key===T.formation)?.ids||[g];a("#native-formation").value=T.formation,a("#native-vessel").innerHTML=U.filter(B=>this.rows[B]?.[6]>0).map(B=>'<option value="'+B+'">'+this.name(T.type)+" #"+(B+1)+"</option>").join(""),a("#native-vessel").value=g,this.applyOwn(!0),this.refreshContacts()}refreshGroups(){let g=a("#native-formation"),w=g.value;g.innerHTML=this.displayGroups.map(T=>{let S=T.ids.filter(I=>this.rows[I]?.[6]>0).length;return'<option value="'+T.key+'" '+(S?"":"disabled")+">"+(T.owner===this.owner?"\u5DF1\u65B9":"\u654C\u65B9")+" \xB7 "+this.name(T.type)+" \xB7 "+T.key.split(":").at(-1)+"\u961F \xB7 "+S+" \u8258</option>"}).join(""),this.displayGroups.some(T=>T.key===w)&&(g.value=w)}chooseGroup(g){let w=this.displayGroups.find(S=>S.key===g),T=w?.ids.find(S=>this.rows[S]?.[6]>0);if(T!==void 0){this.select(T);let S=this.rows[T];this.cinematicAnchor=null,this.cinemaComposition=!1,this.center=S.slice(1,4),this.distance=Math.max(100,this.metadata[T].profile.length*(this.metadata[T].type==="Iron_Behemoth"?3.2:12)),this.overview=!0}}chooseType(g){let w=this.types.get(g)?.find(T=>this.rows[T]?.[6]>0);if(w!==void 0)return this.select(w);h("\u8BE5\u7F16\u961F\u5DF2\u7ECF\u6CA1\u6709\u5B58\u6D3B\u8230\u8239")}frameGround(){let g=this.metadata.filter(T=>T.profile.ground&&this.rows[T.id]?.[6]>0);if(!g.length)return this.frameBattle(!0);this.overview=!0,this.cinematicAnchor=null,this.cinemaComposition=!1,this.center=[1,2,3].map(T=>g.reduce((S,I)=>S+this.rows[I.id][T],0)/g.length),this.center[1]+=60,this.distance=Math.max(850,...g.map(T=>Math.hypot(this.rows[T.id][1]-this.center[0],this.rows[T.id][3]-this.center[2])*2.5));let w=(this.snapshot?.environment||this.replay?.environment)?.fortress?.modules;if(w?.length){this.center=["x","y","z"].map(S=>w.reduce((I,D)=>I+D[S],0)/w.length),this.center[1]+=35;let T=Math.max(...w.map(S=>Math.hypot(S.x-this.center[0],S.z-this.center[2])))+120;this.distance=Math.max(650,T*2.6)*Math.max(1,t.height/t.width)}this.overviewPitch=.65,this.overviewYaw=-1.15}frameBattle(g=!1){this.overview=!0,this.cinematicAnchor=null,this.cinemaComposition=!g;let w=this.metadata.filter(B=>this.rows[B.id]?.[6]>0);if(!w.length)return;if(g){let B=[1/0,1/0,1/0],z=[-1/0,-1/0,-1/0];for(let k of w)for(let H=0;H<3;H++)B[H]=Math.min(B[H],this.rows[k.id][H+1]),z[H]=Math.max(z[H],this.rows[k.id][H+1]);this.center=B.map((k,H)=>(k+z[H])/2),this.distance=Math.max(500,Math.hypot(...B.map((k,H)=>z[H]-k))*.85),this.overviewPitch=.55,this.overviewYaw=-.7;return}let T=w.filter(B=>B.owner===this.owner),S=T.find(B=>B.type==="Iron_Behemoth")||T.find(B=>B.type==="Dreadnought")||T.find(B=>B.type==="Battleship")||T.find(B=>B.profile.role==="line")||T[0]||w[0],I=this.rows[S.id],D=S.side==="attacker"?1:-1;this.cinematicAnchor=S.id;let U=this.cinemaFocus(S.id,I);this.center=U.center,this.distance=Math.max(this.fullDetail?420:520,S.profile.length*3.2),this.overviewYaw=U.yaw,this.overviewPitch=.18}cinemaFocus(g,w){let T=this.rows[w[8]],S=this.metadata[g].side==="attacker"?1:-1,I=T?.[6]>0?m.norm(m.sub(T.slice(1,4),w.slice(1,4))):[S,0,0];return{center:[w[1]+I[0]*(this.fullDetail?150:180),w[2]+I[1]*(this.fullDetail?150:180)+15,w[3]+I[2]*(this.fullDetail?150:180)],yaw:Math.atan2(-I[0],-I[2])+.65}}async setAI(g){if(!(this.replayId||this.replay||C.disposed))try{if(g){if(this.controlRequested=!1,this.releasePending)return await this.releasePending;let w=this.controlled;if(this.controlled=null,this.predicted=null,n.flight.ai=!0,r.clear(),this.controlGeneration=(this.controlGeneration||0)+1,w!==null){this.releasing=!0,this.syncHeader(),this.releasePending=(async()=>{this.inputPending&&await this.inputPending.catch(()=>{}),C.disposed||await this.request("/api/battles/"+this.id+"/control",{type:"release",clientId:this.clientId})})();try{await this.releasePending}finally{this.releasing=!1,this.releasePending=null}}}else{if(this.releasePending&&await this.releasePending,C.disposed||this.claiming)return;this.clientId??=crypto.randomUUID(),this.controlRequested=!0;let w=this.controlGeneration=(this.controlGeneration||0)+1;this.claiming=!0,this.syncHeader();let T;try{T=await this.request("/api/battles/"+this.id+"/control",{type:"claim",shipId:this.selected,clientId:this.clientId})}finally{this.claiming=!1}if(C.disposed||w!==this.controlGeneration||!this.controlRequested){await this.request("/api/battles/"+this.id+"/control",{type:"release",clientId:this.clientId});return}this.controlTick=T.tick,this.controlled=T.control.shipId,this.seq=Math.max(this.seq,T.control.seq),this.predicted=null,n.flight.ai=!1,n.flight.external&&l(),this.overview=!1,n.flight.yawTarget=n.flight.yaw,n.flight.pitchTarget=n.flight.pitch,h("\u5DF2\u63A5\u7BA1\u53C2\u6218\u8230\u8239 \xB7 \u5C04\u51FB\u4E0E\u635F\u5931\u8BA1\u5165\u771F\u5B9E\u6218\u679C")}C.disposed||(n.flight.cabinWalk=g&&He(this.metadata[this.selected]?.profile)==="bastion",n.flight.cabinPose=lr(He(this.metadata[this.selected]?.profile)),this.syncHeader())}catch(w){C.disposed||(h(w.message),this.syncHeader())}}fire(g){return g==="missile"&&!this.metadata[this.selected]?.profile.missile&&!this.metadata[this.selected]?.profile.secondaryMissile?(h("\u8BE5\u8230\u672A\u88C5\u5907\u5BFC\u5F39"),!1):this.replay||this.controlled===null?(h("\u70B9\u51FB\u4EB2\u81EA\u9A7E\u9A76\uFF0C\u63A5\u7BA1\u5DF1\u65B9\u53C2\u6218\u8230\u8239"),!1):(g==="missile"?this.missileUntil=performance.now()+180:this.fireUntil=performance.now()+180,!0)}pilotIntent(){let g=n.flight,w=p();if(g.align&&w?.hp>0){let S=m.sub(w.pos,g.pos);g.yawTarget=Math.atan2(S[0],-S[2]),g.pitchTarget=x(Math.atan2(S[1],Math.hypot(S[0],S[2])),-1.2,1.2)}let T={throttle:g.throttle/100,yaw:0,pitch:0,roll:Co(r,this.metadata[this.selected]?.profile).roll,heading:y(Math.PI-g.yawTarget),elevation:x(g.pitchTarget,-1.2,1.2),fire:r.has("Space")||!g.profile.capital&&P()||performance.now()<this.fireUntil,missile:r.has("KeyR")||performance.now()<this.missileUntil,lock:g.align,boost:r.has("ShiftLeft")||r.has("ShiftRight")||g.boost};return w?.hp>0&&(T.target=w.shipId),T}async sendInput(){if(C.disposed||this.busy||this.releasing||this.claiming||this.replayId||this.replay||this.controlled===null||document.hidden)return;let g=this.controlled,w=this.controlGeneration||0,T=this.pilotIntent(),S=performance.now();this.busy=!0;let I=this.request("/api/battles/"+this.id+"/control",{type:"input",shipId:g,clientId:this.clientId,seq:++this.seq,input:T});this.inputPending=I;try{await I,w===(this.controlGeneration||0)&&(this.inputLatency=Math.min(.15,(performance.now()-S)/2e3))}catch(D){if(!C.disposed&&w===(this.controlGeneration||0)&&this.controlled===g)if(D.message==="\u63A7\u5236\u5E8F\u53F7\u5DF2\u8FC7\u671F")try{this.receive(await this.request("/api/battles/"+this.id))}catch{}else this.controlRequested=!1,this.controlled=null,this.predicted=null,n.flight.ai=!0,h(D.message)}finally{this.inputPending===I&&(this.inputPending=null,this.busy=!1)}}syncHUD(){let g=n.flight,w=this.metadata[this.selected];if(!w)return;a("#fire-spinal").hidden=!!w.profile.defenseOnly,w.profile.defenseOnly&&(a("#special-readout").textContent="\u6307\u6325\u6BCD\u8230 \xB7 \u5168\u519B\u653B\u51FB +15%\uFF08\u4E0D\u53E0\u52A0\uFF09\xB7 \u81EA\u52A8\u8865\u5145\u8702\u7FA4 / \u96C6\u706B\u6307\u4EE4"),w.profile.special==="antimatter"?a("#special-readout").textContent="\u65E0\u4EBA\u81EA\u52A8\u7A81\u51FB \xB7 \u63A5\u8FD1\u5F15\u7206 \xB7 \u4E00\u6B21\u6027\u6D88\u8017 \xB7 \u7A7F\u76FE\u51B2\u51FB / \u6536\u5272\u8005\u514D\u75AB":w.profile.special==="reaper"&&(a("#special-readout").textContent="\u53CC\u675F\u76F8\u4F4D\u6B66\u5668 \xB7 \u6709\u9650\u62A4\u76FE\u56DE\u6536 \xB7 \u514D\u75AB\u6E6E\u706D\u4E4B\u661F");let T=w.profile.missile||w.profile.secondaryMissile;a("#weapon-primary-name").textContent=w.profile.primaryName||g.profile.primaryName,a("#fire-spinal > span:nth-child(2)").innerHTML=(w.profile.primaryName||g.profile.primaryName)+"<small>"+(w.profile.fixed?"\u6CBF\u8230\u824F\u5C04\u754C":"\u81EA\u52A8\u706B\u63A7 / \u624B\u52A8\u6307\u5B9A\u76EE\u6807")+"</small>",a("#system-turret").hidden=!w.profile.pointDefense&&!w.profile.secondary,a(".turret-readiness").hidden=!w.profile.pointDefense&&!w.profile.secondary,a("#fire-salvo").hidden=!T,a("#system-missile").hidden=!T,a("#missile-stock").textContent=g.missileCooldown>0?g.missileCooldown.toFixed(1)+"s":"\u5C31\u7EEA",a("#missile-capacity").parentElement.hidden=!0,a("#system-missile-state").textContent=g.missileCooldown>0?"\u88C5\u586B\u4E2D":"\u5DF2\u5C31\u7EEA",a(".contacts h2 small").textContent=String(g.targets.length).padStart(2,"0"),this.replay&&(a(".flight-header>div").innerHTML="\u94F6\u6CB3\u5E1D\u56FD<span>/</span>\u5386\u53F2\u56DE\u653E",a("#toggle-ai").disabled=!0)}syncHeader(){if(!this.snapshot&&!this.report)return;let g=[0,0];for(let w=0;w<this.rows.length;w++)this.rows[w]?.[6]>0&&g[this.metadata[w]?.side==="attacker"?0:1]++;a("#native-status").textContent=(this.replay?"\u5386\u53F2\u56DE\u653E \xB7 "+(this.report.targetName||this.report.title||"\u8230\u961F\u6218\u6597"):this.snapshot?.trial?"\u7F16\u961F\u6D4B\u8BD5":"\u771F\u5B9E\u6218\u573A")+" \xB7 "+g.join(" : ")+" \u8258 \xB7 "+Math.floor(this.replay?this.playTime:this.snapshot?.elapsed||0)+" / "+(this.replay?this.report.duration:600)+" \u79D2"+(this.replay&&this.playTime>=this.report.duration?" \xB7 \u64AD\u653E\u5B8C\u6BD5":""),this.replay&&(a("#native-pause").textContent=this.playTime>=this.report.duration?"\u91CD\u65B0\u64AD\u653E":this.paused?"\u7EE7\u7EED":"\u6682\u505C"),a("#native-claim").textContent=this.controlled===this.selected?"\u9A7E\u9A76\u4E2D":"\u4EB2\u81EA\u9A7E\u9A76",a("#native-claim").disabled=!!this.releasing||!!this.claiming||this.controlled===this.selected||!!this.replay||this.rows[this.selected]?.[6]<=0||this.metadata[this.selected]?.owner!==this.owner||!this.metadata[this.selected]?.profile.piloted,a("#native-release").disabled=this.controlled===null,a("#ai-label").textContent=this.controlled===null?"\u4EB2\u81EA\u9A7E\u9A76":"\u4EA4\u8FD8 AI",a("#ai-indicator").classList.toggle("visible",this.controlled===null),a("#flight-input-copy").textContent=this.controlled===null?"\u89C2\u6218\u4E2D \xB7 \u9009\u62E9\u5DF1\u65B9\u7F16\u961F\u540E\u4EB2\u81EA\u9A7E\u9A76":(He(this.metadata[this.selected]?.profile)==="fighter"?"W/S \u6CB9\u95E8 \xB7 A/D \u6EDA\u8F6C \xB7 Q/E \u4FEF\u4EF0 \xB7 \u53F3\u952E\u7784\u51C6":"W/S \u6CB9\u95E8 \xB7 A/D \u8F6C\u5411 \xB7 T \u9009\u654C \xB7 X \u5BF9\u51C6")+" \xB7 G AUTO",a("#loadout-caption").textContent=this.replay?"\u5386\u53F2\u6218\u6597\u5F55\u50CF \xB7 \u67E5\u770B\u53CC\u65B9\u8230\u961F\u4E0E\u4EA4\u706B":"\u771F\u5B9E\u53C2\u6218\u8230\u8239 \xB7 \u9000\u51FA\u9A7E\u9A76\u4EA4\u8FD8 AI \xB7 \u6218\u6597\u4E0D\u80FD\u64A4\u9000",this.replay&&(a("#flight-input-copy").textContent="\u5386\u53F2\u56DE\u653E \xB7 \u89C2\u6218\u6A21\u5F0F")}row(g){if(this.presentationRow?.[0]===g)return this.presentationRow;let w=this.rows[g],T=this.previous[g]||w;if(!w)return null;let S=this.replay?this.replayAlpha:x(((this.sampleTime??performance.now())-this.received)/200,0,1);return[g,M(T[1],w[1],S),M(T[2],w[2],S),M(T[3],w[3],S),T[4]+y(w[4]-T[4])*S,M(T[5],w[5],S),w[6],w[7],w[8],w[9],w[10]||0,w[11]||0,(T[12]||0)+y((w[12]||0)-(T[12]||0))*S,(T[13]??T[4])+y((w[13]??w[4])-(T[13]??T[4]))*S,M(T[14]||0,w[14]||0,S)]}applyOwn(g=!1){let w=this.controlled===this.selected?this.rows[this.selected]:this.row(this.selected),T=this.metadata[this.selected],S=n.flight;if(!(!w||!T)){if(S.pos=w.slice(1,4),S.roll=w[12]||0,S.cabinKind=He(T.profile),S.yaw=Math.PI-w[4],S.pitch=w[5],S.speed=w[9]*8,S.velocity=[Math.sin(w[4])*Math.cos(w[5])*w[9],Math.sin(w[5])*w[9],Math.cos(w[4])*Math.cos(w[5])*w[9]],S.hull=w[6]/T.maxHp*100,S.shield=T.maxShield?w[7]/T.maxShield*100:0,S.gunCooldown=w[10],S.missileCooldown=w[11],S.profile={...i[n.shipIndex],maxSpeed:T.profile.speed*8,turnRate:Bn(T.profile).turn,mainCooldown:T.profile.cooldown},S.ai=this.controlled===null,S.missileStock=T.profile.missile||T.profile.secondaryMissile?S.profile.missileCapacity:0,S.missileCooldown=T.profile.missile?w[10]:w[11],g||S.ai)S.yawTarget=S.yaw,S.pitchTarget=S.pitch;else{let I=performance.now(),D=Math.min(.4,(I-this.received)/1e3+(this.inputLatency||0)+.025),U=this.pilotIntent(),B=ic(w,T.profile,U,D),z=this.predicted;if(!z||m.length(m.sub(z.pos,[B.x,B.y,B.z]))>100)this.predicted={pos:[B.x,B.y,B.z],yaw:Math.PI-B.yaw,pitch:B.pitch,roll:B.roll,speed:B.speed,at:I};else{let H=x((I-z.at)/1e3,0,.05),Y=[0,...z.pos,Math.PI-z.yaw,z.pitch,0,0,-1,z.speed??w[9],0,0,z.roll||0],ht=ic(Y,T.profile,U,H),rt=1-Math.exp(-H*3),X=1-Math.exp(-H*7);z.yaw=Math.PI-ht.yaw+y(ht.yaw-B.yaw)*rt,z.pitch=M(ht.pitch,B.pitch,rt),z.roll=ht.roll+y(B.roll-ht.roll)*rt,z.pos=[ht.x,ht.y,ht.z].map(($,Q)=>M($,[B.x,B.y,B.z][Q],X)),z.speed=ht.speed,z.at=I}let k=this.predicted;S.pos=[...k.pos],S.yaw=k.yaw,S.pitch=k.pitch,S.roll=k.roll||0,S.speed=k.speed*8,S.velocity=[Math.sin(S.yaw)*Math.cos(S.pitch)*k.speed,Math.sin(S.pitch)*k.speed,-Math.cos(S.yaw)*Math.cos(S.pitch)*k.speed]}w[6]<=0&&(this.controlled=null,this.overview=!0,S.ai=!0)}}refreshContacts(g){let w=n.flight,T=this.metadata[this.selected];if(!T)return;let S=g??w.targets[w.targetIndex]?.shipId,I=this.metadata.filter(D=>D.side!==T.side&&this.rows[D.id]?.[6]>0&&this.indices.has(D.type)).sort((D,U)=>m.length(m.sub(this.rows[D.id].slice(1,4),w.pos))-m.length(m.sub(this.rows[U.id].slice(1,4),w.pos))).slice(0,5);S!==void 0&&this.rows[S]?.[6]>0&&!I.some(D=>D.id===S)&&I.unshift(this.metadata[S]),w.targets=I.map(D=>{let U=this.contacts.get(D.id);return U||(U={shipId:D.id,name:this.name(D.type)+" #"+(D.id+1),code:"\u771F\u5B9E\u53C2\u6218\u8230",kind:this.indices.get(D.type),scale:1,shieldHits:[],maxShield:100,seed:D.id,respawn:1/0},this.contacts.set(D.id,U)),U}),w.targetIndex=Math.max(0,w.targets.findIndex(D=>D.shipId===S)),this.updateContacts(),c()}updateContacts(){for(let g of n.flight.targets){let w=this.row(g.shipId),T=this.metadata[g.shipId];w&&(g.pos=w.slice(1,4),g.hp=w[6]/T.maxHp*100,g.shield=T.maxShield?w[7]/T.maxShield*100:0,g.heading=Math.PI-w[4],g.velocity=[Math.sin(w[4])*Math.cos(w[5])*w[9],Math.sin(w[5])*w[9],Math.cos(w[4])*Math.cos(w[5])*w[9]])}}weaponStyle(g,w,T=!1){let S=i[g]||{},I=S.visual||{},D=(s[g]?.length||20)<=5;if(w==="missile"){let U=D||s[g]?.id==="Cruiser";return{color:[1,.64,.22],visual:{capital:!D,compact:U,radius:U?.16:.4,trail:U?18:55,glow:U?6:20,blastRadius:U?2:9,impact:U?5:32}}}return D?{color:S.weaponColor||[1,.75,.35],visual:{...I,compact:!0,radius:Math.min(.035,I.radius||.025),beamLife:.075,blastRadius:.35,impact:2}}:T?{color:w==="laser"?[1,.5,.14]:w==="plasma"?[.48,.65,1]:[1,.78,.38],visual:{capital:!0,radius:.18,trail:9,glow:8,blastRadius:2.5,impact:12}}:{color:S.weaponColor||[.5,.8,1],visual:I}}fleetBurst(g,w,T,S,I){let D=Math.max(0,800-n.flight.particles.length);D&&w&&_(g,Math.min(w,D),T,S,I)}muzzle(g,w=0,T=!1){let S=this.row(g),I=this.indices.get(this.metadata[g]?.type),D=s[I];return!S||!D?null:this.metadata[g]?.profile.ground?Iu({x:S[1],y:S[2],z:S[3],yaw:S[4],pitch:0,turretYaw:S[13],turretPitch:S[14],profile:this.metadata[g].profile},this.metadata[g].profile.hardpoints?.main?.[0]):u.transform(f({pos:S.slice(1,4),yaw:Math.PI-S[4],pitch:S[5],roll:S[12]||0},I),(T?D.joints.filter(U=>U.role==="secondary").map(U=>U.mount):D.main)[w]||[0,0,0])}beamEnd(g,w,T){let S=this.row(w);if(!S)return T;let I=S.slice(1,4),D=this.metadata[w].profile.radius||1,U=_o(g,I,I,D)??1;return g.map((B,z)=>M(B,I[z],U))}groundBlast(g,w=0){let T=this.metadata[g.shipId],S=this.metadata[g.source];if(!T?.profile.ground||S?.type!=="Bomber"||!["hit","destroy"].includes(g.type)||g.shield&&g.type!=="destroy")return;let I=n.flight,D=I.mushroomClouds??=[];if(D.some(B=>B.shipId===g.shipId&&Math.abs(B.tick-g.tick)<30))return;let U=this.snapshot?.environment||this.replay?.environment;U&&(D.push({shipId:g.shipId,tick:g.tick,pos:[g.x,Math.max(bo(U,g.x,g.z)+2,g.y-4),g.z],age:w,seed:g.shipId*1.73+g.tick*.01}),D.length>16&&D.shift())}effect(g){if(g.type==="destroy"&&g.kind==="antimatter"&&g.shipId===g.source)return;this.presentation.event(g,this),this.groundBlast(g);let w=n.flight;if(g.projectileId!==void 0&&g.type!=="fire"&&(this.projectiles=(this.projectiles||[]).filter(T=>T.id!==g.projectileId),w.projectiles=(w.projectiles||[]).filter(T=>T.id!==g.projectileId),this.projectileVisuals.delete(g.projectileId)),g.type==="fire"){let T=this.indices?.get(this.metadata[g.shipId]?.type),S=i[T]||w.profile,{visual:I,color:D}=this.weaponStyle(T,g.kind,g.secondary),U=/laser|ion|beam|reaper/.test(g.kind)?Math.max(1,g.secondary?s[T]?.joints.filter(B=>B.role==="secondary").length||0:s[T]?.main.length||0):1;for(let B=0;B<U;B++){let z=/laser|ion|beam|reaper/.test(g.kind)&&this.muzzle(g.shipId,B,g.secondary)||g.from;if(/laser|ion|beam|reaper/.test(g.kind))w.beams.push({source:g.shipId,target:g.target,mount:B,secondary:g.secondary,start:z,end:this.beamEnd(z,g.target,g.to),age:0,life:I.beamLife||.35,width:I.radius||S.beamWidth||.12,color:D,compact:I.compact});else if(this.replay){let H=m.sub(g.to,z),Y=g.speed||(g.kind==="missile"?210:540);w.projectiles.push({id:g.projectileId,target:g.target,pos:[...z],previous:[...z],velocity:g.velocity||m.scale(m.norm(H),Y),speed:Y,age:0,life:m.length(H)/Y+.2,missile:g.kind==="missile",trail:[[...z]],color:D,visual:I,kind:g.kind})}let k=m.length(m.sub(z,t.eye||w.pos))<350||g.shipId===this.controlled;(!I.compact||k)&&t.weaponImpact(w,z,{visual:I,color:D,muzzle:!0}),!I.compact&&m.length(m.sub(z,t.eye||w.pos))<1800&&this.fleetBurst(z,I.capital?18:5,D,.25,I.elite?24:10)}g.shipId===this.selected&&(E("fire"),w.mainShots++,w.shake=Math.min(.35,s[n.shipIndex].length*.005))}else if(g.type==="antimatter"){if(g.harmless){h("\u6E6E\u706D\u4E4B\u661F\u5931\u53BB\u76EE\u6807 \xB7 \u5B89\u5168\u89E3\u9664\u5F39\u5934");return}(w.specialBlasts||[]).some(T=>T.source===g.source&&T.tick===g.tick)||(w.specialBlasts??=[]).push({...g,pos:[g.x,g.y,g.z],age:0}),g.harmless||(h("\u6E6E\u706D\u4E4B\u661F\u8D77\u7206 \xB7 \u53CD\u7269\u8D28\u51B2\u51FB\u6269\u6563"),E("hit"))}else if(g.type==="antimatter-launch")h("\u6E6E\u706D\u4E4B\u661F \xB7 \u81EA\u884C\u7A81\u51FB");else if(g.type==="blast")t.weaponImpact(w,[g.x,g.y,g.z],{visual:{blastRadius:g.radius,elite:!0},color:g.kind==="heavy"?[.3,.65,1]:[1,.42,.08]});else if(g.type==="destroy"||g.type==="hit"||g.type==="intercept"){let T=[g.x,g.y,g.z],S=this.metadata[g.shipId],I=this.metadata[g.source],D=i[this.indices.get(I?.type||S?.type)]||{},U=g.type==="destroy",B=(S?.profile.length||20)<=5,z=m.length(m.sub(T,t.eye||w.pos))<350||g.shipId===this.controlled,k=U?{blastRadius:B?Math.max(.6,(S?.profile.length||1)*.3):(S?.profile.length||5)*.6,elite:(S?.profile.length||0)>=50,compact:B}:this.weaponStyle(this.indices.get(I?.type),g.kind).visual;if(g.type==="intercept"&&g.from&&w.beams.push({start:g.from,end:T,age:0,life:.14,width:.08,color:[1,.8,.36]}),(!k.compact||z||U)&&t.weaponImpact(w,T,{visual:k,shield:g.shield&&!U,destroy:U,color:[1,.38,.06]}),m.length(m.sub(T,t.eye||w.pos))<2200&&this.fleetBurst(T,k.compact?U?z?12:4:z?2:0:U?100:g.shield?14:35,g.shield&&!U?[.35,.7,1]:[1,.55,.12],k.compact?.35:U?2.7:.8,k.compact?6:U?55:k.impact||16),g.type==="hit"&&g.shield&&(!B||z)){let H=this.rows[g.shipId],Y=this.indices.get(S?.type);if(H&&Y!==void 0){let ht=this.visualVessel(g.shipId),rt=f({pos:H.slice(1,4),yaw:Math.PI-H[4],pitch:H[5],roll:H[12]||0},Y),X=Math.max(.1,(this.previous[g.shipId]?.[7]||H[7])/Math.max(1,S.maxShield)*100);t.shieldImpact(ht,Y,rt,T,2,X)}}g.shipId===this.selected&&g.type==="hit"&&(w.shake=.14,a("#damage-wash").classList.add("show"),b(()=>a("#damage-wash").classList.remove("show"),150))}else g.type==="reinforcement"&&g.tick>0&&h("\u589E\u63F4\u62B5\u8FBE \xB7 "+g.count+" \u8258")}projectilePosition(g,w){let T=[g.x,g.y,g.z],S=[g.dx,g.dy,g.dz],I=m.sub(S,T),D=m.length(I),U=m.add(T,g.vx===void 0?m.scale(m.norm(I),Math.min(D,g.speed*Math.max(0,w))):m.scale([g.vx,g.vy,g.vz],Math.max(0,w)));if(this.collisionRows!==this.rows){this.collisionRows=this.rows,this.collisionCells=new Map,this.collisionRadius=1;for(let H of this.metadata){let Y=this.rows[H.id];if(!Y||Y[6]<=0)continue;this.collisionRadius=Math.max(this.collisionRadius,(H.profile.radius||1)+.4);let ht=H.side+":"+Math.floor(Y[1]/300)+":"+Math.floor(Y[3]/300);this.collisionCells.has(ht)||this.collisionCells.set(ht,[]),this.collisionCells.get(ht).push(H)}}let B=1,z=this.collisionRadius+25,k=g.side==="attacker"?"defender":"attacker";for(let H=Math.floor((Math.min(T[0],U[0])-z)/300);H<=Math.floor((Math.max(T[0],U[0])+z)/300);H++)for(let Y=Math.floor((Math.min(T[2],U[2])-z)/300);Y<=Math.floor((Math.max(T[2],U[2])+z)/300);Y++)for(let ht of this.collisionCells.get(k+":"+H+":"+Y)||[]){let rt=this.row(ht.id).slice(1,4),X=(ht.profile.radius||1)+.4;if(rt.some((Q,at)=>Q<Math.min(T[at],U[at])-X||Q>Math.max(T[at],U[at])+X))continue;let $=_o(T,U,rt,X);$!==null&&(B=Math.min(B,$))}return T.map((H,Y)=>M(H,U[Y],B))}update(g){this.presentation.update(g);let w=performance.now();if(this.frameTime&&this.elapsedFrames.push(w-this.frameTime),this.frameTime=w,this.elapsedFrames.length>600&&this.elapsedFrames.shift(),window.battleBenchmark?.fixedQuality!==void 0)this.quality=x(Number(window.battleBenchmark.fixedQuality)||1,.4,1);else if(this.elapsedFrames.length%60===0){let D=this.elapsedFrames.slice(-60).reduce((U,B)=>U+B,0)/60;this.quality=x(this.quality+(D>29?-.12:D<20?.03:0),.4,1)}if(!this.rows.length)return;let T=n.flight;if(this.replay){this.paused||(this.playTime=Math.min(this.report.duration,this.playTime+g*this.playSpeed)),this.playTime>=this.report.duration&&!this.paused&&(this.paused=!0,this.syncHeader());let D=this.playTime*20,U=this.replay.frames,B=0,z=U.length-1;for(;B<z;){let Y=Math.ceil((B+z)/2);U[Y].tick<=D?B=Y:z=Y-1}let k=U[B],H=U[Math.min(B+1,U.length-1)];for(this.replayCarriers=k.carriers||[],this.previous=k.ships,this.rows=k.ships.map((Y,ht)=>{let rt=H.ships[ht]||Y,X=[...rt.slice(0,6),...Y.slice(6,12),...rt.slice(12)];return(this.deathTicks.get(ht)??1/0)<=D&&(X[6]=0),X}),this.replayAlpha=k.tick===H.tick?1:x((D-k.tick)/(H.tick-k.tick),0,1),a("#native-seek").value=this.playTime;this.replayCursor<this.replay.events.length&&this.replay.events[this.replayCursor].tick<=D;){let Y=this.replay.events[this.replayCursor++];Y.tick>=D-(Y.type==="antimatter"?106:3)&&this.effect(Y)}}let S=this.replay?this.playTime:(this.snapshot?.elapsed||0)+Math.min(.2,(w-this.received)/1e3);if(T.specialBlasts=(T.specialBlasts||[]).filter(D=>(D.age=Math.max(0,S-D.tick*.05),D.age<5.3)),this.controlled!==null){let D=Co(r,this.metadata[this.selected].profile);T.throttle=x(T.throttle+g*27*D.throttle,0,100),(D.yaw||D.pitch)&&(T.align=!1),T.yawTarget+=D.yaw*T.profile.turnRate*g,T.pitchTarget=x(T.pitchTarget+D.pitch*T.profile.turnRate*g,-1.2,1.2)}if(this.overview&&this.cinematicAnchor!=null){let D=this.row(this.cinematicAnchor);if(D?.[6]>0){let U=this.cinemaFocus(this.cinematicAnchor,D);this.center=this.center.map((B,z)=>M(B,U.center[z],1-Math.exp(-g))),this.overviewYaw+=y(U.yaw-this.overviewYaw)*(1-Math.exp(-g*.35))}else this.frameBattle()}this.applyOwn(),T.elapsed+=g,T.boostActive=r.has("ShiftLeft")||r.has("ShiftRight")||T.boost,v(g),T.shake*=Math.exp(-g*5),!this.contactsAt||w-this.contactsAt>700?(this.contactsAt=w,this.refreshContacts(),this.refreshGroups(),this.syncHeader()):this.updateContacts();let I=p();if(I){let D=m.norm(m.sub(I.pos,T.pos));T.boresightError=Math.acos(x(m.dot(D,A()),-1,1))*180/Math.PI,T.missileLock=I,T.missileLockTime=.4}for(let D of T.joints)if(D.cooldown=Math.max(0,D.cooldown-g),I){let U=m.sub(I.pos,T.pos);D.yaw=x(Math.atan2(U[0],-U[2])-T.yaw,-Math.PI,Math.PI),D.aligned=!0}this.updateVisuals(g,w),document.body.classList.toggle("battle-overview",this.overview)}updateVisuals(g,w=performance.now()){let T=n.flight;if(T.mushroomClouds=(T.mushroomClouds||[]).filter(S=>(S.age+=this.replay?this.paused?0:g*this.playSpeed:g,S.age<18)),T.beams=T.beams.filter(S=>(S.age+=g,S.source!==void 0&&(S.start=this.muzzle(S.source,S.mount,S.secondary)||S.start,S.end=this.beamEnd(S.start,S.target,S.end)),S.age<S.life)),T.particles=T.particles.filter(S=>(S.age+=g,S.pos=m.add(S.pos,m.scale(S.velocity,g)),S.age<S.life)),this.replay)T.projectiles=T.projectiles.filter(S=>{if(this.paused)return!0;let I=g*this.playSpeed;S.age+=I;let D=this.row(S.target);if(S.missile&&D&&S.age>.2){let U=Math.min(S.speed||210,38+(S.age-.2)*180),B=m.scale(m.norm(m.sub(D.slice(1,4),S.pos)),U);S.velocity=S.velocity.map((z,k)=>M(z,B[k],1-Math.exp(-I*4)))}return S.previous=S.pos,S.pos=m.add(S.pos,m.scale(S.velocity,I)),S.missile&&(S.trail.push([...S.pos]),S.trail.length>50&&S.trail.shift()),S.age<S.life});else{let S=new Set;T.projectiles=(this.projectiles||[]).map(I=>{S.add(I.id);let D=i[this.indices.get(this.metadata[I.source]?.type)]||T.profile,U=m.norm([I.dx-I.x,I.dy-I.y,I.dz-I.z]),B=Math.min(.2,(w-this.received)/1e3),z=this.projectilePosition(I,B),k=this.projectileVisuals.get(I.id);return k||(k={trail:[],born:w,trailAt:0},this.projectileVisuals.set(I.id,k)),w-k.trailAt>=30&&(k.trail.push(z),k.trail.length>50&&k.trail.shift(),k.trailAt=w),{id:I.id,pos:z,previous:k.trail.at(-2)||z,velocity:I.vx===void 0?m.scale(U,I.speed):[I.vx,I.vy,I.vz],age:(I.age||0)+B,life:10,missile:I.missile,trail:k.trail,...this.weaponStyle(this.indices.get(this.metadata[I.source]?.type),I.kind,I.secondary),kind:I.kind,hostile:I.side!==this.metadata[this.selected]?.side}}).sort((I,D)=>m.length(m.sub(I.pos,this.overview?this.center:T.pos))-m.length(m.sub(D.pos,this.overview?this.center:T.pos))).slice(0,600);for(let I of this.projectileVisuals.keys())S.has(I)||this.projectileVisuals.delete(I)}}buildGroups(){this.meshGroups.clear(),this.displayGroups=sc(this.metadata);for(let g of this.metadata){if(!this.indices.has(g.type))continue;let w=g.side+":"+g.type;this.meshGroups.has(w)||this.meshGroups.set(w,{ids:[]}),this.meshGroups.get(w).ids.push(g.id)}for(let g of this.meshGroups.values())g.matrices=new Float32Array(g.ids.length*16)}visualVessel(g){if(g===this.selected)return n.flight;let w=this.vesselVisuals.get(g);if(!w){let T=this.indices.get(this.metadata[g].type);w={shieldHits:[],joints:s[T].joints.map(S=>({...S}))},this.vesselVisuals.set(g,w)}return w}drawNativeShip(g,w){let T=this.row(w),S=this.metadata[w],I=this.indices.get(S.type),D=f({pos:T.slice(1,4),yaw:Math.PI-T[4],pitch:T[5],roll:T[12]||0},I),U=this.visualVessel(w),B=this.row(T[8]);if(S.profile.modelScale)for(let z=0;z<12;z++)D[z]*=S.profile.modelScale;if(B){let z=m.sub(B.slice(1,4),T.slice(1,4));for(let k of U.joints||[])k.yaw=y(Math.atan2(z[0],-z[2])-(Math.PI-T[4])),k.pitch=Math.atan2(z[1],Math.hypot(z[0],z[2]))}S.profile.ground?g.drawDefense(I,D,T[13]-T[4],T[14],S.owner===this.owner?[.086,.545,.922]:[.906,.294,.314]):g.drawVessel(I,D,{light:[-.5,.9,.75],exposure:1},U.joints),g.drawShield(U,I,D),T[9]>0&&g.drawExhaust(I,D,x(T[9]/Math.max(1,S.profile.speed)*100,0,100),!1,g.time)}drawFleet(g){if(!this.rows.length)return;let w=n.flight,T=g.height/(2*Math.tan(g.fov/2)),S=this.snapshot?.status!=="finished"||!!this.replay,I=this.snapshot?.environment||this.replay?.environment;S&&I?.fortress&&g.drawFortress(I,this.renderNamespace||"",this.metadata,this.rows);let D=this.metadata.filter(k=>(S||!k.profile.ground)&&this.rows[k.id]?.[6]>0&&this.indices.has(k.type)).map(k=>{let H=Math.max(1,m.length(m.sub(this.rows[k.id].slice(1,4),g.eye)));return{id:k.id,d:H,pixels:k.profile.length*T/H}}).sort((k,H)=>H.pixels-k.pixels);if(this.fullDetail&&D.every(k=>k.pixels>=8)){let k=D.map(H=>H.id);this.renderedIds=new Set(k),this.engineIds=[],this.detailIds=new Set(k),this.highIds=new Set(k),this.drawLabels(g,[]),this.renderStats={mode:"three",alive:k.length,instances:k.length,groups:0,detail:k.length,high:k.length,quality:1};for(let H of k)H!==this.hiddenVessel&&(this.overview||H!==this.selected)&&this.drawNativeShip(g,H);S&&I?.fortress&&g.drawDefenseField(I,this.metadata,this.rows,this.owner);return}let U=D.filter(k=>(this.metadata[k.id].profile.ground||k.pixels>(this.fullDetail?8:65))&&(this.overview||k.id!==this.selected)&&k.id!==this.hiddenVessel).slice(0,this.fullDetail?128:Math.floor(12*this.quality)).map(k=>k.id);this.detailIds=new Set(U),this.highIds=new Set;let B=0;for(let k of D){let H=g.shipMeshes[this.indices.get(this.metadata[k.id].type)];k.pixels<8||B+H.count/3>18e5*this.quality||(this.highIds.add(k.id),B+=H.count/3)}let z=Pu(this.displayGroups.filter(k=>S||!this.metadata[k.ids[0]].profile.ground),this.rows,{eye:g.eye,height:g.height,fov:g.fov,quality:this.quality,pinned:[this.selected,...U,...this.highIds,...n.flight.targets.slice(0,1).map(k=>k.shipId)],previous:this.lodLevels});this.lodLevels=z.levels,this.renderedIds=z.visible,this.engineIds=D.filter(k=>k.pixels>3&&z.visible.has(k.id)&&g.project(this.rows[k.id].slice(1,4)).visible).slice(0,Math.floor(120*this.quality)).map(k=>k.id),this.renderStats={alive:z.alive,instances:z.visible.size,groups:z.labels.length,detail:U.length,high:this.highIds.size,low:D.filter(k=>!this.highIds.has(k.id)&&!this.detailIds.has(k.id)).length,quality:this.quality},this.drawLabels(g,z.labels);for(let[k,H]of this.meshGroups)for(let Y of[!1,!0]){let ht=0,rt=[];for(let Q of H.ids){let at=this.row(Q);if(!at||Q===this.hiddenVessel||at[6]<=0||!z.visible.has(Q)||this.detailIds.has(Q)||this.highIds.has(Q)!==Y||!this.overview&&Q===this.selected)continue;let pt=this.indices.get(this.metadata[Q].type);if(pt===void 0)continue;let tt=f({pos:at.slice(1,4),yaw:Math.PI-at[4],pitch:at[5],roll:at[12]||0},pt);if(this.metadata[Q].profile.modelScale)for(let yt=0;yt<12;yt++)tt[yt]*=this.metadata[Q].profile.modelScale;if(!Y&&!this.snapshot?.environment&&!this.replay?.environment){let yt=this.metadata[Q].profile.length*T/Math.max(1,m.length(m.sub(at.slice(1,4),g.eye))),Et=Math.max(1,6/Math.max(.001,yt));for(let bt=0;bt<12;bt++)tt[bt]*=Et}for(let yt=0;yt<3;yt++)tt[12+yt]-=g.eye[yt];H.matrices.set(tt,ht++*16),rt.push(Q)}if(!ht)continue;let X=this.metadata[H.ids[0]],$=X.owner===this.owner;g.drawFleetInstances((this.renderNamespace||"")+k,this.indices.get(X.type),H.matrices,rt,{high:Y,type:X.profile.renderType||X.type,tint:X.profile.ground?[1,1,1]:$?[.87,.97,1]:[1,.88,.76],teamColor:$?[.086,.545,.922]:[.906,.294,.314]})}for(let k of U)this.drawNativeShip(g,k);S&&I?.fortress&&g.drawDefenseField(I,this.metadata,this.rows,this.owner)}drawLabels(g,w){if(performance.now()-(this.labelsAt||0)<150)return;this.labelsAt=performance.now();let T=[];this.labels.innerHTML=w.sort((S,I)=>S.distance-I.distance).flatMap(S=>{let I=g.project(S.center),D=Math.floor(I.x/160)+":"+Math.floor(I.y/42);return!I.visible||I.x<30||I.x>g.width-160||I.y<110||I.y>g.height-60||T.some(U=>Math.abs(U.x-I.x)<155&&Math.abs(U.y-I.y)<32)?[]:(T.push(I),['<button data-group="'+S.key+'" style="left:'+I.x+"px;top:"+I.y+"px;color:"+(S.owner===this.owner?"#8edce9":"#ffa88b")+'">'+(S.owner===this.owner?"\u25C6 ":"\u25C7 ")+this.name(S.type)+" \xD7 "+S.count+"</button>"])}).slice(0,40).join("")}drawOverview(g,w,T){g.begin(T);let S=this.distance,I=this.overviewYaw,D=this.overviewPitch;g.eye=[Math.sin(I)*Math.cos(D)*S,Math.sin(D)*S,Math.cos(I)*Math.cos(D)*S].map((B,z)=>B+this.center[z]),g.fov=55*Math.PI/180;let U=u.perspective(g.fov,g.width/g.height,1,Math.max(22e3,this.distance+(this.snapshot?.boundary||4e3)*3));this.cinemaComposition&&(U[8]=.12,U[9]=-.22),g.vp=u.mul(U,u.lookAt(g.eye,this.center)),g.cameraForward=m.norm(m.sub(this.center,g.eye)),g.cameraUp=[0,1,0],g.projectionShiftX=U[8],g.projectionOffset=U[9],this.presentation.environment(g,T,this.snapshot?.environment||this.replay?.environment),this.drawFleet(g),g.drawCombatEffects(n.flight,T,f(n.flight,n.shipIndex)),this.fullDetail||this.presentation.draw(g,this,!1)}dispose(){C.disposed||(!this.replayId&&!this.replay&&(this.controlled!==null||this.releasing||this.claiming)&&fetch("/api/battles/"+this.id+"/control",{method:"POST",credentials:"same-origin",keepalive:!0,headers:{"X-Empire-Client":"galactic-command","Content-Type":"application/json"},body:JSON.stringify({type:"release",clientId:this.clientId})}).catch(()=>{}),this.controlled=null,this.stream?.close(),clearInterval(this.inputTimer),C.dispose(),this.presentation.clear(),this.contacts.clear(),this.vesselVisuals.clear(),this.projectileVisuals.clear(),this.meshGroups.clear(),this.labels?.remove(),a("#native-battle-bar")?.remove())}leave(){window.GalacticDemo?.dispose?window.GalacticDemo.dispose():this.dispose(),parent!==window?parent.postMessage({type:"battle-exit"},location.origin):location.assign(this.replayId?"/#reports":"/")}}return new R};var xs=n=>Math.max(0,Math.min(1,n));function Ng(n,t){let e=Math.max(1,n.end-n.start),i=Math.max(0,t-n.start),s=Math.min(8e3,e*.3),r=xs(i/e);if(!["outbound","return"].includes(n.phase))return{stage:"holding",progress:1,travel:1,model:1,warp:0};if(i<s){let a=i/s;return{stage:a<.65?"departing":"warp-in",progress:r,travel:0,model:1-xs((a-.85)/.15),warp:xs((a-.65)/.35),local:a}}if(i>e-s){let a=xs((i-e+s)/s);return{stage:"warp-out",progress:r,travel:1,model:xs(a*4),warp:1-a,local:a}}return{stage:"cruise",progress:r,travel:xs((i-s)/(e-2*s)),model:0,warp:0}}var Ug=n=>Math.max(0,Math.min(1,n)),wo=(n,t,e)=>{let i=Ug((e-n)/(t-n));return i*i*(3-2*i)},Eo=[.18,.65,1],Bu=[.48,.3,1],ku=[.7,.94,1],rr=class{constructor(t=262144){this.array=new Float32Array(t),this.length=0}reset(){return this.length=0,this}reserve(t){if(this.length+t<=this.array.length)return;let e=new Float32Array(2**Math.ceil(Math.log2(this.length+t)));e.set(this.array.subarray(0,this.length)),this.array=e}view(){return this.array.subarray(0,this.length)}};function rc(n){return n.stage==="cruise"&&n.observer?.55:n.stage==="warp-in"?wo(0,.2,n.warp)*(1-wo(.88,1,n.warp)):n.stage==="warp-out"?wo(0,.09,n.local)*(1-wo(.18,1,n.local)):0}function zu(n,t,e){for(let i=0;i<3;i++){let s=i*4,r=(t[0]*n[s]+t[1]*n[s+1]+t[2]*n[s+2])*(e-1);for(let a=0;a<3;a++)n[s+a]+=t[a]*r}return n}function Vu(n,{position:t,heading:e,eye:i,length:s,pose:r,slot:a,detailed:u=!0}){let m=rc(r);if(m<=.001)return;let x=1/(Math.sqrt(e[0]*e[0]+e[1]*e[1]+e[2]*e[2])||1),M=e[0]*x,y=e[1]*x,h=e[2]*x,o=Math.abs(y)>.9?0:-h,l=Math.abs(y)>.9?h:0,p=Math.abs(y)>.9?-y:M,c=1/(Math.sqrt(o*o+l*l+p*p)||1);o*=c,l*=c,p*=c;let f=l*h-p*y,E=p*M-o*h,_=o*y-l*M,v=r.stage==="warp-out",A=v?r.local:r.warp,P=Math.max(10,s*.95),C=A*3.5+a*.618,d=new Float64Array(3),b=new Float64Array(3),R=n instanceof rr;R&&n.reserve((r.stage==="cruise"?8:u?213:2)*54);let L=R?n.array:n,g=n.length;function w(X,$,Q,at){let pt=Math.cos(at)*Q,tt=Math.sin(at)*Q;X[0]=t[0]+M*$+o*pt+f*tt,X[1]=t[1]+y*$+l*pt+E*tt,X[2]=t[2]+h*$+p*pt+_*tt}function T(X,$,Q,at,pt,tt,yt){L[g++]=X,L[g++]=$,L[g++]=Q,L[g++]=at[0],L[g++]=at[1],L[g++]=at[2],L[g++]=pt,L[g++]=tt,L[g++]=yt}function S(X,$,Q,at=!1){let pt=b[0]-d[0],tt=b[1]-d[1],yt=b[2]-d[2],Et=i[0]-(d[0]+b[0])*.5,bt=i[1]-(d[1]+b[1])*.5,Ot=i[2]-(d[2]+b[2])*.5,St=tt*Ot-yt*bt,Yt=yt*Et-pt*Ot,Ut=pt*bt-tt*Et;St*St+Yt*Yt+Ut*Ut<1e-6*(pt*pt+tt*tt+yt*yt||1)*(Et*Et+bt*bt+Ot*Ot||1)&&(St=o,Yt=l,Ut=p);let $t=X/(Math.sqrt(St*St+Yt*Yt+Ut*Ut)||1);St*=$t,Yt*=$t,Ut*=$t;let V=d[0]-i[0],Vt=d[1]-i[1],Bt=d[2]-i[2],Jt=b[0]-i[0],mt=b[1]-i[1],Qt=b[2]-i[2],O=at?.5:0,F=at?.5:1;T(V-St,Vt-Yt,Bt-Ut,$,O,-1,Q),T(V+St,Vt+Yt,Bt+Ut,$,O,1,Q),T(Jt-St,mt-Yt,Qt-Ut,$,F,-1,Q),T(Jt-St,mt-Yt,Qt-Ut,$,F,-1,Q),T(V+St,Vt+Yt,Bt+Ut,$,O,1,Q),T(Jt+St,mt+Yt,Qt+Ut,$,F,1,Q)}if(r.stage==="cruise"){for(let X=0;X<8;X++){let $=(X*.61803398875+a*.137)%1,Q=(r.time*.65+$)%1,at=X*2.399963,pt=P*(.8+$*.7),tt=s*(2-Q*5);w(d,tt-s*.9,pt,at),w(b,tt,pt,at),S(P*.018,Eo,m*Math.sin(Q*Math.PI))}n.length=g;return}let I=s*(v?1+r.warp*7:1+A*A*9);if(w(d,-I,0,0),w(b,s*.55,0,0),S(P*.38,Eo,m*.55),S(P*.09,ku,m*.85),!u){n.length=g;return}for(let X=0;X<3;X++){let $=(A+X*.27)%1,Q=P*(v?.85+$*2.9:1.7-$*.75),at=s*(v?-.5+X*.45:-.8+$*1.8),pt=m*(v?(1-$)*.85:.7)*(X===0?1:.75);for(let tt=0;tt<64;tt++){let yt=tt/64*Math.PI*2+C*(X%2?1:-1),Et=yt+Math.PI*2/64,bt=.65+.35*Math.sin(yt*3+C*4);w(d,at,Q,yt),w(b,at,Q,Et),S(P*(X===0?.16:.09),X===2?Bu:Eo,pt*bt,!0)}}for(let X=0;X<18;X++){let $=(X*.61803398875+a*.137)%1,Q=(C+$)%1,at=X*2.399963+C*.35,pt=P*(.65+$*1.4),tt=s*(1-Q*5),yt=s*(.25+A*A*1.6);w(d,tt-yt,pt,at),w(b,tt,pt,at),S(P*(.018+$*.025),X%4===0?Bu:Eo,m*Math.sin(Q*Math.PI)*.65)}let D=Math.exp(v?-(((A-.14)/.1)**2):-(((A-.8)/.1)**2));w(d,s*.3,0,0);let U=i[0]-d[0],B=i[1]-d[1],z=i[2]-d[2],k=B*B>.81*(U*U+B*B+z*z),H=k?0:-z,Y=k?z:0,ht=k?-B:U,rt=P*3.5/(Math.sqrt(H*H+Y*Y+ht*ht)||1);H*=rt,Y*=rt,ht*=rt,b[0]=d[0]+H,b[1]=d[1]+Y,b[2]=d[2]+ht,d[0]-=H,d[1]-=Y,d[2]-=ht,S(P*.12,ku,D*m),n.length=g}var ac=Object.freeze({fov:42,pitch:Math.atan(.24),vanishingY:.5-.24/(2*Math.tan(42*Math.PI/360))});async function xM(n,{signal:t}={}){let{fleet:e,assets:i}=await iu({base:"../galactic-command/three-flight-assets/",signal:t}),s=Eu(e,i),{Renderer:r,M:a,V:u,LAYOUTS:m,shipMatrix:x,clamp:M,mix:y,seeded:h}=s,o=new r(n),l=new Map,p=new Map(e.ships.map((I,D)=>[I.id,D])),c=new ke(1,1,{depthBuffer:!1});try{if(o.three.setRenderTarget(c),o.begin(0),o.drawRibbons(new Float32Array(11502*16+10368)),await o.three.compileAsync(o.scene,o.camera),t?.aborted)throw new DOMException("\u8230\u961F\u52A0\u8F7D\u5DF2\u53D6\u6D88","AbortError");o.endFrame(),o.begin(0)}catch(I){throw o.dispose(),I}finally{o.three.setRenderTarget(null),c.dispose()}let f=new di,E=new Vi,_=new Rn(1,32,24),v=new Pe({colorWrite:!1,depthWrite:!0}),A=[],P=new rr,C,d=new Set,b=new Re(ac.fov,1,.1,1e5),R=new di,L=new Ge,g=new Ti(1,1,1),w=new Pe({color:6716550});for(let[I,D]of[[[0,-.6,0],[3,.16,2]],[[0,.6,0],[3,.16,2]],[[-1.4,0,0],[.16,1.2,2]],[[1.4,0,0],[.16,1.2,2]]]){let U=new ae(g,w);U.position.fromArray(I),U.scale.fromArray(D),L.add(U)}R.add(L);function T(I){if(l.has(I))return l.get(I);let D={shipIndex:0,flight:{pos:[0,0,0],profile:e.profiles[0],targets:[],joints:[],shieldHits:[],beams:[],particles:[],projectiles:[],weaponImpacts:[],specialBlasts:[],elapsed:0}},U=h(4982),B=(H,Y,ht,rt,X)=>{for(let $=0;$<Y;$++)D.flight.particles.push({pos:[...H],velocity:[(U()-.5)*X,(U()-.5)*X,(U()-.5)*X],age:0,life:rt*(.6+U()*.8),size:2+U()*6,color:ht})},z=Ou({state:D,renderer:o,SHIPS:e.ships,COMBAT:e.profiles,LAYOUTS:m,M:a,V:u,clamp:M,mix:y,shipMatrix:x,burst:B,shortAngle:H=>Math.atan2(Math.sin(H),Math.cos(H)),notice:()=>{},tone:()=>{},$:()=>null});z.indices=p,z.drawLabels=()=>{},z.renderNamespace=I+":";let k={battle:z,state:D,seq:0};return l.set(I,k),k}function S(I,D){o.eye=u.scale(u.sub(C.eye,I),1/D),o.vp=a.mul(C.vp,a.mul(a.translate(...u.sub(I,C.center)),a.scale(D))),o.fov=C.fov,o.cameraForward=C.forward,o.cameraUp=C.up}return{renderer:o,bridgeSeat(I){return m[p.get(I)]?.bridge},begin(I){C=I,d=new Set,(o.width!==I.width||o.height!==I.height||o.dpr!==I.dpr)&&o.resize(I.width,I.height,I.dpr),o.begin(I.time),o.cabinRequest=null,E.projectionMatrix.fromArray(I.vp),E.projectionMatrixInverse.copy(E.projectionMatrix).invert();for(let D of A)D.visible=!1;I.occluders.forEach((D,U)=>{let B=A[U];B||(B=new ae(_,v),A.push(B),f.add(B)),B.visible=!0,B.position.fromArray(u.sub(D.position,I.center)),B.scale.setScalar(D.radius)}),o.three.render(f,E)},port(I,D,U){L.position.fromArray(u.sub(I,C.center)),L.scale.setScalar(D),L.quaternion.setFromUnitVectors(new W(0,0,1),new W(...U)),o.three.render(R,E)},battle(I,D,U,B,{camera:z,dock:k}={}){d.add(I.id);let H=T(I.id),{battle:Y,state:ht}=H,rt=ht.flight;H.epoch!==I.epoch&&(Y.clearVisuals(),H.seq=0,H.tick=void 0,H.epoch=I.epoch),S(D,U);let X=I.replay?Math.max(0,Math.min(.4,((I.tick||0)-(H.tick??I.tick))*.05)):C.dt;H.tick=I.tick,rt.elapsed+=X,o.time=rt.elapsed;let $=Math.min(1,(I.tick||0)*.05/4),Q=$*$*(3-2*$),at=k?u.scale(u.sub(k,D),1/U):null,pt=tt=>!I.environment&&at&&$<1?tt.map(yt=>{let Et=I.metadata.find(St=>St.id===yt[0]);if(Et?.side!=="defender"||Et.profile.role==="station")return yt;let bt=yt.slice(),Ot=Math.max(0,Math.min(1,Q*1.3-yt[0]%7*.035));for(let St=1;St<=3;St++)bt[St]=y(at[St-1],yt[St],Ot);return bt}):tt;if(Y.presentationRow=I.pilotRow,Y.previous=pt(I.previous||I.ships),Y.rows=pt(I.ships),Y.metadata=I.metadata,Y.received=I.received,Y.sampleTime=C.sampleTime,Y.owner=B,Y.bridgeVessel=z?.id===I.id&&z.mode==="bridge"?z.shipId:null,Y.hiddenVessel=Y.bridgeVessel,Y.replay=!!I.replay,Y.replayAlpha=1,Y.fullDetail=I.metadata.length<=128,Y.center=u.scale(u.sub(C.center,D),1/U),Y.snapshot=I,Y.projectiles=I.projectiles||[],H.metadata!==I.metadata){for(let tt of I.metadata)tt.profile.renderType&&p.has(tt.profile.renderType)&&p.set(tt.type,p.get(tt.profile.renderType));Y.buildGroups(),H.metadata=I.metadata}Y.updateVisuals(X),Y.presentation.update(X);for(let tt of I.effects||[])tt.seq>H.seq&&(H.seq=tt.seq,tt.tick>=(I.tick||0)-(tt.type==="antimatter"?106:I.replay?10:6)&&Y.effect(tt));for(let tt of I.specialBlasts||[])!tt.harmless&&!rt.specialBlasts.some(yt=>yt.source===tt.source&&yt.tick===tt.tick)&&rt.specialBlasts.push({...tt,pos:[tt.x,tt.y,tt.z],age:0});if(rt.specialBlasts=rt.specialBlasts.filter(tt=>(tt.age=Math.max(0,((I.tick||0)-tt.tick)*.05),tt.age<5.3)),Y.bridgeVessel!=null){let tt=I.metadata.find(yt=>yt.id===Y.bridgeVessel);o.cabinRequest={kind:He(tt.profile),console:He(tt.profile)==="fighter"?I.fighterInstruments:I.bridgeInstruments,pose:z.pose,meta:tt,row:Y.row(tt.id),time:rt.elapsed,fov:C.fov,auto:!I.controls?.[B],counts:I.counts}}return Y.drawFleet(o),Y.bridgeVessel!=null&&Y.drawNativeShip(o,Y.bridgeVessel),o.drawCombatEffects(rt,rt.elapsed,a.identity(),0),Y.fullDetail||Y.presentation.draw(o,Y,!1),{renderer:"shared-battlefield",...Y.renderStats,defenderLaunch:!I.environment&&$<1,hiddenVessel:Y.hiddenVessel,bridgeVessel:Y.bridgeVessel,cabin:Y.bridgeVessel!=null?He(I.metadata.find(tt=>tt.id===Y.bridgeVessel).profile):null,effects:rt.beams.length+rt.projectiles.length+rt.weaponImpacts.length+rt.specialBlasts.length,ships:I.ships.filter(tt=>tt[6]>0).map(tt=>({id:tt[0],type:I.metadata[tt[0]]?.type,position:u.add(D,u.scale(Y.row(tt[0]).slice(1,4),U)),hp:tt[6],side:I.metadata[tt[0]]?.side,loaded:p.has(I.metadata[tt[0]]?.type)}))}},cruise(I,D){let U=Object.entries(I.ships||{}).filter(([Et,bt])=>p.has(Et)&&bt>0),B=U.reduce((Et,[,bt])=>Et+bt,0),z=C.width<600?9:18,k=U.reduce((Et,[,bt])=>Et+Math.min(bt,Math.max(1,Math.round(z*bt/Math.max(1,B)))),0),H=Math.max(8,...U.map(([Et])=>m[p.get(Et)].length)),Y=H*1.65,ht=new W(0,0,Math.floor(Math.max(0,k-1)/3)*Y*.5);b.aspect=C.width/C.height;let rt=new W(0,Math.tan(ac.pitch),1).normalize(),X=new W().crossVectors(new W(0,1,0),rt).normalize(),$=new W().crossVectors(rt,X),Q=[Math.max(0,Math.min(k,3)-1)*Y*.5+H*.45,Y*.22+H*.25,ht.z+H*.6],at=Math.tan(b.fov*Math.PI/360),pt=at*b.aspect,tt=0;for(let Et of[-1,1])for(let bt of[-1,1])for(let Ot of[-1,1]){let St=new W(Et*Q[0],bt*Q[1],Ot*Q[2]);tt=Math.max(tt,St.dot(rt)+Math.max(Math.abs(St.dot(X))/pt,Math.abs(St.dot($))/at))}b.position.copy(ht).addScaledVector(rt,tt*1.1),b.lookAt(ht),b.updateProjectionMatrix(),b.updateMatrixWorld();let yt=C;C={...C,eye:b.position.toArray(),center:[0,0,0],vp:new se().multiplyMatrices(b.projectionMatrix,b.matrixWorldInverse).toArray(),forward:b.getWorldDirection(new W).toArray(),up:[0,1,0]};try{return{...this.travel(I,{...D,model:1,warp:0,observer:!0,spacing:Y,budget:z,time:C.time},[0,0,0],1,[0,0,-1]),observer:!0,view:{forward:C.forward,vanishingY:ac.vanishingY}}}finally{C=yt}},travel(I,D,U,B,z){S(U,B),o.time=C.time;let k=D.battleApproach?[1,0,0]:D.docking?u.scale(D.dockNormal||z,-1):D.launch&&D.departureDirection||z,H=D.battleApproach?Math.PI/2:Math.atan2(k[0],-k[2]),Y=D.battleApproach?0:Math.atan2(k[1],Math.hypot(k[0],k[2])),ht=0,rt=0,X=Object.entries(I.ships||{}).filter(([bt,Ot])=>p.has(bt)&&Ot>0).sort(([bt],[Ot])=>bt.localeCompare(Ot)),$=new Map(i.ships.map(bt=>[bt.id,bt.profile])),Q=D.battleApproach?ec(X,bt=>$.get(bt)):null,at=X.reduce((bt,[,Ot])=>bt+Ot,0),pt=D.budget||96,tt=P.reset(),yt=[0,0,0],Et=[];for(let[bt,Ot]of X){let St=p.get(bt),Yt=Math.min(Ot,Math.max(1,Math.round(pt*Ot/Math.max(1,at))));for(let Ut=0;Ut<Yt;Ut++){let $t=ht++,V=D.spacing||Math.max(8,m[St].length*1.6),Vt=D.observer&&at<3?$t-(at-1)/2:$t%3-1,Bt=Math.floor($t/3),Jt=Q?.get(bt)?.[Ut],mt=$.get(bt),Qt=Jt?Cu(Jt,mt,D.environment,D.warp):[Vt*V,Math.sin($t*2.4)*V*.22,Bt*V],O=D.model;if(D.launch||D.docking){let ct=M((D.docking?1-(D.local||0):D.local||0)*1.8-$t/Math.max(30,at*3),0,1),ut=ct*ct*(3-2*ct),et=u.norm(u.cross(k,Math.abs(k[1])>.9?[1,0,0]:[0,1,0])),st=D.docking?u.scale(k,-1):k;Qt=u.add(u.scale(st,4+ut*(75+Bt*V)+D.warp*220),u.add(u.scale(et,Vt*V*ut),[0,Math.sin($t*2.4)*V*.1*ut,0])),O*=M(ct*12+.05,0,1)}let F=D.returnRows?.filter(ct=>D.returnMetadata.find(ut=>ut.id===ct[0])?.type===bt)[Ut],Z=H;if(F&&(Qt=u.add(F.slice(1,4),u.scale(k,(D.local||0)**2*80+D.warp*220)),Z=Math.PI-F[4]+Math.atan2(Math.sin(H-Math.PI+F[4]),Math.cos(H-Math.PI+F[4]))*Math.min(1,(D.local||0)*2),O=D.model),$t<16)for(let ct=0;ct<3;ct++)yt[ct]+=Qt[ct];O>.05&&Et.push({slot:$t,position:u.add(U,u.scale(Qt,B)),radius:m[St].length*B*.55});let it=x({pos:Qt,yaw:Z,pitch:Y,roll:0},St),ot=[Math.sin(Z)*Math.cos(Y),Math.sin(Y),-Math.cos(Z)*Math.cos(Y)];zu(it,ot,1+D.warp**3*3),o.drawVessel(St,it,{light:[-.5,.9,.75],exposure:1.3,opacity:O}),O>.05&&(o.drawExhaust(St,it,D.observer?100:65+D.warp*35,D.observer||D.warp>.2,C.time),rt+=m[St].engines.length),Vu(tt,{position:Qt,heading:ot,eye:o.eye,length:m[St].length,pose:D,slot:$t,detailed:$t<16})}}return tt.length&&(o.setBlend(!0,!1),o.drawRibbons(tt.view()),o.setBlend(!1,!0)),{models:ht,exhausts:rt,represented:at,ships:Et,renderer:"shared-battlefield",focus:u.add(U,u.scale(yt,B/Math.max(1,Math.min(ht,16)))),warpEnergy:rc(D),warpVertices:tt.length/9}},pickBridgeConsole:(I,D)=>o.cabinRequest&&o.cabinRequest.kind!=="fighter"?o.pickBridgeConsole(I,D):null,bridgeConsoleLayout:()=>o.cabinRequest&&o.cabinRequest.kind!=="fighter"?o.bridgeConsoleLayout():[],pickFighterConsole:(I,D)=>o.cabinRequest?.kind==="fighter"?o.pickFighterConsole(I,D):null,fighterConsoleLayout:()=>o.cabinRequest?.kind==="fighter"?o.fighterConsoleLayout():[],end(){o.endFrame();let I=!1;for(let[D,U]of l)d.has(D)||(U.battle.dispose(),l.delete(D),I=!0);I&&o.resetInstances()},dispose(){for(let I of l.values())I.battle.dispose();l.clear(),_.dispose(),v.dispose(),g.dispose(),w.dispose(),o.dispose()}}}export{xM as createMapFleetRenderer,ac as cruiseView,Ng as missionVisual};
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
