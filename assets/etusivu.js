/* SAMA Energia — etusivu v46 (5.11.2026): päiväkaavio (.k-dg) ja prosessivideo (.k-pg).
   Sama malli molemmissa: vasemmalla rivit, oikealla kuva. Eteneminen korostaa nykyisen rivin ja täyttää sen
   taustasävyn (--p). Hiiri rivin päällä tai näppäimistöfokus pitää kuvan siinä vaiheessa; kosketus valitsee
   vaiheen (linkissä toinen napautus avaa linkin). Pysäytyspainike (WCAG 2.2.2). Ei vieritykseen sidottua toimintaa.
   prefers-reduced-motion: ei etenemistä, kaavio näyttää kokonaisuuden ja video vaihtuu pysäytyskuviin.
   Videon vaiheajat = scripts/render-proc.mjs (STAGES, KEY). */
(function(){
var d=document,RM=false,SD=false;
try{RM=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
try{SD=!!(navigator.connection&&navigator.connection.saveData);}catch(e){}
var ptr={t:'',at:0};
d.addEventListener('pointerdown',function(e){ptr.t=e.pointerType;ptr.at=Date.now();},true);
function byTouch(){return ptr.t!==''&&ptr.t!=='mouse'&&Date.now()-ptr.at<900;}
function onView(el,cb,th,rm){if(!('IntersectionObserver' in window)){cb(true);return;}
 new IntersectionObserver(function(es){es.forEach(function(x){cb(x.isIntersecting);});},{threshold:th||0,rootMargin:rm||'0px'}).observe(el);}
function pbtn(b,p){b.setAttribute('aria-pressed',p?'true':'false');b.setAttribute('aria-label',b.getAttribute(p?'data-r':'data-p'));}
function mark(items,i,p){items.forEach(function(it,j){it.classList.toggle('on',j===i);if(j===i)it.style.setProperty('--p',p.toFixed(3));});}

/* ---------- periaatteellinen vuorokausi ---------- */
(function(){
var box=d.querySelector('[data-dg]'),svg=box&&box.querySelector('svg.kd');if(!svg)return;
var items=[].slice.call(box.querySelectorAll('.k-line[data-i]')),list=box.querySelector('.k-lines'),btn=box.querySelector('.k-play');
var els=[].slice.call(svg.querySelectorAll('[data-k]')).map(function(e){return{e:e,k:e.getAttribute('data-k'),h:+e.getAttribute('data-h')};});
var KS=['r','fp','hcd','rfphcdv'],DUR=[6.5,6,6.5,6.5],SW=.78,X0=12,U=616/24;
var V=svg.getAttribute('data-v').split(',').map(function(x){return x/100;});
var cur=svg.querySelector('.kd-cur'),dot=cur&&cur.querySelector('circle');
var st=0,t=0,held=-1,tHold=false,paused=false,vis=false,run=false,last=0,raf=0,seen=false;
function g(j){return V[(j%24+24)%24];}
/* sama jaksollinen Catmull–Rom kuin piirretty käyrä (scripts/paiva/build_paiva.py) */
function yAt(h){var i=Math.min(23,Math.floor(h)),u=h-i,a=g(i),e=g(i+1),b=a+(e-g(i-1))/6,c=e-(g(i+2)-a)/6,m=1-u;
 return 176-124*(m*m*m*a+3*m*m*u*b+3*m*u*u*c+u*u*u*e);}
function show(s,hh){var ks=KS[s];els.forEach(function(o){o.e.classList.toggle('lit',ks.indexOf(o.k)>=0&&o.h<=hh);});}
function cursor(hh){var on=hh>=0&&hh<24;svg.classList.toggle('run',on);
 if(on&&cur){cur.setAttribute('transform','translate('+(X0+hh*U).toFixed(1)+' 0)');dot.setAttribute('cy',yAt(hh).toFixed(1));}}
function draw(){if(held>=0){show(held,24);cursor(-1);mark(items,held,1);return;}
 if(!run){show(3,24);cursor(-1);mark(items,-1,0);return;}
 var hh=st===3?24:Math.min(24,t/(DUR[st]*SW)*24);show(st,hh);cursor(st===3?-1:hh);mark(items,st,Math.min(1,t/DUR[st]));}
function tick(now){raf=0;if(!run||paused||held>=0||!vis){last=0;return;}
 var dt=last?Math.min(.1,(now-last)/1000):0;last=now;t+=dt;if(t>=DUR[st]){t=0;st=(st+1)%4;}draw();raf=requestAnimationFrame(tick);}
function go(){if(!raf&&run&&vis&&!paused&&held<0)raf=requestAnimationFrame(tick);}
function hold(i){held=i;if(btn&&run)pbtn(btn,true);draw();}
function free(){if(held<0)return;st=held;held=-1;tHold=false;t=DUR[st]*SW;if(btn&&run)pbtn(btn,paused);draw();go();}
items.forEach(function(it,i){
 it.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')hold(i);});
 it.addEventListener('focus',function(){if(!byTouch())hold(i);});
 it.addEventListener('blur',function(){if(!tHold)free();});
 it.addEventListener('click',function(e){if(byTouch()&&!(tHold&&held===i)){e.preventDefault();tHold=true;hold(i);}});
});
if(list)list.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'&&!tHold)free();});
d.addEventListener('pointerdown',function(e){if(tHold&&!box.contains(e.target))free();});
if(!RM){run=true;
 if(btn){btn.hidden=false;btn.addEventListener('click',function(){if(held>=0){paused=false;free();return;}paused=!paused;pbtn(btn,paused);if(!paused){last=0;go();}});}
 onView(svg,function(v){vis=v;if(v&&!seen){seen=true;st=0;t=0;draw();}if(v)go();},.3);}
draw();
})();

/* ---------- prosessivideo ---------- */
(function(){
var box=d.querySelector('[data-pv]'),v=box&&box.querySelector('video');if(!v)return;
var img=box.querySelector('.k-pvs'),btn=box.querySelector('.k-play'),list=box.querySelector('.k-ps'),items=[].slice.call(box.querySelectorAll('.k-ps li'));
var S=[0,5.5,11,17,22,30],KEY=[4.6,10.4,16.2,21.3,29.2];
var held=-1,tHold=false,paused=false,vis=false,loaded=false,still=RM||SD,raf=0,want=-1;
function at(t){for(var i=4;i>0;i--)if(t>=S[i])return i;return 0;}
function frame(){raf=0;if(still)return;var t=v.currentTime||0,i=held>=0?held:at(t);
 mark(items,i,held>=0?1:Math.min(1,(t-S[i])/(S[i+1]-S[i])));if(!v.paused&&vis)raf=requestAnimationFrame(frame);}
function load(){if(loaded||still)return;loaded=true;var b=v.getAttribute('data-base')+(matchMedia('(max-width:767px)').matches?'-m':'');
 /* esikatselutiedosto (build-standalone.py) upottaa videot data-osoitteina: data-inline-webm / data-inline-mp4 */
 [['webm','video/webm; codecs=vp9'],['mp4','video/mp4']].forEach(function(x){var u=v.getAttribute('data-inline-'+x[0])||(v.hasAttribute('data-base')?b+'.'+x[0]:'');
  if(u){var s=d.createElement('source');s.src=u;s.type=x[1];v.appendChild(s);}});
 v.load();}
function showStill(i){if(!img)return;img.src=img.getAttribute('data-still')+(i+1)+'.webp';img.hidden=false;mark(items,i,1);}
function toStill(){still=true;if(raf)cancelAnimationFrame(raf);raf=0;try{v.pause();}catch(e){}v.hidden=true;if(btn)btn.hidden=true;showStill(held<0?0:held);}
function play(){if(still||paused||held>=0||!vis)return;load();var p=v.play();if(p&&p.catch)p.catch(function(e){if(e&&e.name==='NotAllowedError')toStill();});}
function seek(x){if(v.readyState>=1){try{v.currentTime=x;}catch(e){}}else want=x;}
function hold(i){held=i;if(still){showStill(i);return;}if(btn)pbtn(btn,true);load();v.pause();seek(KEY[i]);frame();}
function free(){if(held<0)return;held=-1;tHold=false;if(!still){if(btn)pbtn(btn,paused);frame();play();}}
v.addEventListener('loadedmetadata',function(){if(want>=0){seek(want);want=-1;}});
v.addEventListener('play',function(){if(!raf)raf=requestAnimationFrame(frame);});
v.addEventListener('seeked',function(){if(!raf)frame();});
v.addEventListener('error',function(){if(v.networkState===3)toStill();},true);
items.forEach(function(it,i){
 it.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')hold(i);});
 it.addEventListener('click',function(){if(!byTouch())return;if(tHold&&held===i)free();else{tHold=true;hold(i);}});
});
if(list)list.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'&&!tHold)free();});
d.addEventListener('pointerdown',function(e){if(tHold&&!box.contains(e.target))free();});
if(still){v.hidden=true;showStill(0);return;}
if(btn){btn.hidden=false;btn.addEventListener('click',function(){if(held>=0){paused=false;free();return;}paused=!paused;pbtn(btn,paused);if(paused)v.pause();else play();});}
onView(box,function(x){if(x&&!v.poster){v.poster=v.getAttribute('data-poster');v.preload='auto';load();}},0,'400px 0px');
onView(v,function(x){vis=x;if(x)play();else if(!v.paused)v.pause();},.35);
})();
})();
