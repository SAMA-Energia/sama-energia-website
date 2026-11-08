/* SAMA Energia — etusivu v46 (5.11.2026), v48 (6.11.2026), v51-fix2 (8.11.2026, canvas): päiväkaavio (.k-dg) ja prosessivideo (.k-pg).
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
/* 7.11.2026 (v51-fix2): tumma instrumenttipaneeli canvasille, Martinin hyväksymä demo "SAMA day chart redesign", versio A.
   Sama data ja vaiheet kuin SVG-versiossa (scripts/paiva/build_paiva.py). Tekstit: canvasin data-t ja .kdp-caps.
   Hiiri tai fokus pitää vaiheen, kosketus valitsee vaiheen (toinen napautus avaa linkin). Pysäytyspainike pysäyttää myös
   raitojen liikkeen (WCAG 2.2.2). prefers-reduced-motion: yhteenvetovaihe paikallaan, ei liikettä. */
(function(){
var box=d.querySelector('[data-dg]'),cv=box&&box.querySelector('canvas.kdp-cv');if(!cv||!cv.getContext)return;
var ctx=cv.getContext('2d'),items=[].slice.call(box.querySelectorAll('.k-line[data-i]')),list=box.querySelector('.k-lines'),btn=box.querySelector('.k-play');
var capEl=box.querySelector('.kdp-cap'),cntB=box.querySelector('.kdp-cnt b'),cntBox=box.querySelector('.kdp-cnt'),resEl=box.querySelector('.kdp-res');
var caps=[].slice.call(box.querySelectorAll('.kdp-caps li')).map(function(li){return li.textContent;});
var T={};try{T=JSON.parse(cv.getAttribute('data-t'))||{};}catch(e){}
var V=[30,29,28,28,29,33,45,74,95,72,66,64,60,62,64,62,58,55,52,48,42,37,34,32,30].map(function(x){return x/100;});
var P=[.25,.15,.05,0,.02,.13,.35,.73,.87,.65,.44,.3,.15,.07,.13,.27,.47,.8,1,.9,.62,.45,.35,.3];
var RES=[[0,1.92],[5,6.42],[9.54,11.96],[15.04,16.96],[20.04,24]],CH=[[2,4.92],[12,14.92]],PK=[[6.5,9.42]],DS=[[17,19.92]];
var F0=1,F1=.74,DUR=[8.5,7,7.5,7],SW=.72;
var TGT={cons:[.35,1,.45,.18],fuse:[0,1,.3,.15],price:[0,0,1,.18],res:[1,.22,.22,1],kor:[1,.2,.2,.35],peak:[0,1,.3,1],chg:[0,0,1,1],dis:[0,0,1,1]};
var A={},k;for(k in TGT)A[k]=RM?TGT[k][3]:0;
var st=0,t=0,held=-1,tHold=false,paused=false,vis=false,run=!RM,seen=false,last=0,clock=0,raf=0,lastCap=-1,lit={},parts=[],W=720,H=400,pat=null;
function g(j){return V[(j%24+24)%24];}
function vAt(h){var i=Math.min(23,Math.floor(h)),u=h-i,a=g(i),e=g(i+1),b=a+(e-g(i-1))/6,c=e-(g(i+2)-a)/6,m=1-u;return m*m*m*a+3*m*m*u*b+3*m*u*u*c+u*u*u*e;}
function ease(x){x=Math.max(0,Math.min(1,x));return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;}
function hx(c){return[parseInt(c.substr(1,2),16),parseInt(c.substr(3,2),16),parseInt(c.substr(5,2),16)];}
var C0=hx('#26231D'),C1=hx('#E8C985');
function mix(p){return 'rgb('+C0.map(function(x,i){return Math.round(x+(C1[i]-x)*p);}).join(',')+')';}
function rr(x,y,w,h,r){ctx.beginPath();if(w<=0||h<=0)return;r=Math.max(0,Math.min(r,w/2,h/2));ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function font(w,s){ctx.font=w+' '+s+'px "IBM Plex Sans", "Segoe UI", Arial, sans-serif';}
var hatch=d.createElement('canvas');hatch.width=hatch.height=12;
(function(){var h=hatch.getContext('2d');h.fillStyle='rgba(226,194,126,.10)';h.fillRect(0,0,12,12);h.strokeStyle='rgba(226,194,126,.85)';h.lineWidth=1.6;
 for(var i=-12;i<=24;i+=6){h.beginPath();h.moveTo(i,12);h.lineTo(i+12,0);h.stroke();}})();
function hatchFill(){if(!pat)pat=ctx.createPattern(hatch,'repeat');try{pat.setTransform(new DOMMatrix().translateSelf((clock*10)%12,0));}catch(e){}return pat;}
function phase(){var s=held>=0?held:(run?st:3),hh=(held>=0||!run||s===3)?24:Math.min(24,t/(DUR[s]*SW)*24);return{s:s,hh:hh,sweep:held<0&&run&&s<3&&hh<24};}
function rev(es,ph){return(ph.s===es&&ph.sweep)?ph.hh:24;}
function resHours(u){var s=0;RES.forEach(function(r){s+=Math.max(0,Math.min(r[1],u)-r[0]);});return s;}
function fuseLevel(ph){if(ph.s===0)return F0;if(ph.s===1&&ph.sweep)return F0+(F1-F0)*ease((ph.hh-6.4)/3);return F1;}
var SL=[];RES.forEach(function(r){var h=Math.floor(r[0]);while(h<r[1]){var a=Math.max(r[0],h),b=Math.min(r[1],h+1);if(b-a>.35)SL.push([a,b]);h++;}});
function paint(ph){
 var x0=W<520?14:24,x1=W-x0,U=(x1-x0)/24,X=function(h){return x0+h*U;},cy0=46,cb=168,Y=function(v){return cb-v*112;},cyB=292,hb=34,i,h;
 ctx.clearRect(0,0,W,H);
 ctx.fillStyle='rgba(243,238,225,.025)';ctx.fillRect(X(0),cy0-8,X(6)-X(0),338);ctx.fillRect(X(22),cy0-8,X(24)-X(22),338);
 ctx.strokeStyle='rgba(243,238,225,.06)';ctx.lineWidth=1;[6,12,18].forEach(function(h){ctx.beginPath();ctx.moveTo(X(h),cy0-8);ctx.lineTo(X(h),364);ctx.stroke();});
 font(500,11.5);ctx.fillStyle='rgba(156,148,131,.95)';ctx.textAlign='left';ctx.textBaseline='alphabetic';
 ctx.globalAlpha=Math.max(.35,A.cons);ctx.fillText(T.kul||'',x0,cy0-14);ctx.globalAlpha=Math.max(.35,A.price);ctx.fillText(T.hinta||'',x0,190);ctx.globalAlpha=1;ctx.fillText(T.bat||'',x0,236);ctx.globalAlpha=Math.max(.35,A.kor);ctx.fillText(T.korv||'',x0,347);ctx.globalAlpha=1;
 if(A.cons>.01){ctx.save();ctx.globalAlpha=A.cons;var gr=ctx.createLinearGradient(0,Y(1),0,cb);gr.addColorStop(0,'rgba(226,194,126,.26)');gr.addColorStop(1,'rgba(226,194,126,0)');
  ctx.beginPath();ctx.moveTo(X(0),cb);for(h=0;h<=24.001;h+=.1)ctx.lineTo(X(h),Y(vAt(h)));ctx.lineTo(X(24),cb);ctx.closePath();ctx.fillStyle=gr;ctx.fill();
  ctx.beginPath();for(h=0;h<=24.001;h+=.1){if(h)ctx.lineTo(X(h),Y(vAt(h)));else ctx.moveTo(X(h),Y(vAt(h)));}
  ctx.strokeStyle='#F3EEE1';ctx.lineWidth=2;ctx.lineJoin='round';ctx.shadowColor='rgba(243,238,225,.35)';ctx.shadowBlur=8;ctx.stroke();ctx.restore();
  ctx.save();ctx.globalAlpha=A.cons;ctx.strokeStyle='rgba(243,238,225,.12)';ctx.beginPath();ctx.moveTo(x0,cb+.5);ctx.lineTo(x1,cb+.5);ctx.stroke();ctx.restore();}
 if(A.peak>.01){var hi=Math.min(9.3,rev(1,ph));if(hi>6.6){ctx.save();ctx.globalAlpha=A.peak;ctx.beginPath();var fy=Y(F1),on=false;
  for(var hp=6.6;hp<=hi+.001;hp+=.05){var v=vAt(hp);if(v>F1){if(!on){ctx.moveTo(X(hp),fy);on=true;}ctx.lineTo(X(hp),Y(v));}}
  if(on){ctx.lineTo(X(Math.min(hi,9.2)),fy);ctx.closePath();ctx.fillStyle='rgba(226,194,126,.85)';ctx.shadowColor='rgba(226,194,126,.9)';ctx.shadowBlur=18;ctx.fill();}ctx.restore();}}
 if(A.fuse>.01){var fl=fuseLevel(ph);ctx.save();ctx.globalAlpha=A.fuse;ctx.setLineDash([3,5]);ctx.strokeStyle='rgba(243,238,225,.35)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x0,Y(F0));ctx.lineTo(x1,Y(F0));ctx.stroke();
  font(500,11.5);ctx.fillStyle='rgba(243,238,225,.6)';ctx.fillText(T.f0||'',x0+4,Y(F0)-6);
  if(fl<F0-.01){ctx.setLineDash([8,5]);ctx.strokeStyle='#E2C27E';ctx.lineWidth=1.8;ctx.shadowColor='rgba(226,194,126,.7)';ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(x0,Y(fl));ctx.lineTo(x1,Y(fl));ctx.stroke();ctx.shadowBlur=0;
   font(600,11.5);ctx.fillStyle='#E2C27E';ctx.textAlign='right';ctx.fillText(T.f1||'',x1-4,Y(fl)-6);ctx.textAlign='left';}
  ctx.restore();}
 var rp=rev(2,ph);for(i=0;i<24;i++){var lt=i<rp;ctx.globalAlpha=A.price*(lt?1:.35);rr(X(i)+(U>16?2:1),196,U-(U>16?4:2),16,U>16?4:2);ctx.fillStyle=lt?mix(P[i]):'rgba(243,238,225,.05)';ctx.fill();}
 if(A.price>.3&&U>20){ctx.globalAlpha=A.price;font(600,10.5);ctx.textAlign='center';if(rp>3){ctx.fillStyle='rgba(243,238,225,.75)';ctx.fillText(T.halpa||'',X(3.5),208.5);}if(rp>18.5){ctx.fillStyle='#1A1610';ctx.fillText(T.kallis||'',X(18.5),208.5);}ctx.textAlign='left';}
 ctx.globalAlpha=1;ctx.strokeStyle='rgba(243,238,225,.14)';ctx.beginPath();ctx.moveTo(x0,cyB+.5);ctx.lineTo(x1,cyB+.5);ctx.stroke();
 var r0=rev(0,ph);
 if(A.res>.01)RES.forEach(function(r){var e=Math.min(r[1],r0);if(e<=r[0])return;var w=X(e)-X(r[0]);ctx.save();ctx.globalAlpha=A.res;rr(X(r[0])+1,cyB-hb-4,w-2,2*hb+8,6);ctx.fillStyle=hatchFill();ctx.fill();ctx.strokeStyle='rgba(226,194,126,.9)';ctx.lineWidth=1.2;ctx.stroke();
  if(e>=r[1]){font(600,12);var lw=ctx.measureText(T.res||'').width+16;if(w>lw+6){ctx.textAlign='center';ctx.textBaseline='middle';var tx=X(r[0])+w/2;ctx.fillStyle='rgba(13,12,10,.85)';rr(tx-lw/2,cyB-10,lw,20,10);ctx.fill();ctx.fillStyle='#E2C27E';ctx.fillText(T.res||'',tx,cyB+.5);}}
  ctx.restore();});
 function cap(lst,es,up,lab,key){if(A[key]<=.01)return;var rv=rev(es,ph);lst.forEach(function(r){var e=Math.min(r[1],rv);if(e<=r[0])return;var w=X(e)-X(r[0]),y=up?cyB-hb:cyB;ctx.save();ctx.globalAlpha=A[key];rr(X(r[0])+2,y+(up?0:1),w-4,hb-1,6);
  if(up){var gd=ctx.createLinearGradient(0,y,0,y+hb);gd.addColorStop(0,'#F0D697');gd.addColorStop(1,'#B88E3E');ctx.fillStyle=gd;ctx.shadowColor='rgba(226,194,126,.55)';ctx.shadowBlur=16;}else ctx.fillStyle='#E9DFC6';
  ctx.fill();ctx.shadowBlur=0;font(600,12);if(w>ctx.measureText(lab).width+14){ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=up?'#2A2010':'#5B4618';ctx.fillText(lab,X(r[0])+w/2,y+hb/2);}ctx.restore();});}
 cap(CH,2,false,T.lat||'','chg');cap(PK,1,true,T.hui||'','peak');cap(DS,2,true,T.kay||'','dis');
 SL.forEach(function(s,ix){var on=s[0]<=r0,cx=X((s[0]+s[1])/2),key='b'+ix;if(on&&!lit[key]){lit[key]=clock;if(ph.sweep&&ph.s===0&&!RM)parts.push({x:cx,y0:cyB+hb,y1:359,t0:clock});}if(!on)delete lit[key];
  var age=on?clock-lit[key]:9,pop=on?1+Math.max(0,.9-age)*.9:1;ctx.save();ctx.globalAlpha=Math.max(.06,A.kor)*(on?1:.25);ctx.beginPath();ctx.arc(cx,359,3.6*pop,0,7);ctx.fillStyle=on?'#E2C27E':'rgba(243,238,225,.4)';if(on){ctx.shadowColor='rgba(226,194,126,.95)';ctx.shadowBlur=10;}ctx.fill();ctx.restore();});
 parts=parts.filter(function(p){var q=(clock-p.t0)/.55;if(q>1||q<0)return false;ctx.save();ctx.globalAlpha=(1-q)*A.kor;ctx.beginPath();ctx.arc(p.x,p.y0+(p.y1-p.y0)*ease(q),2.4,0,7);ctx.fillStyle='#F0D697';ctx.shadowColor='#E2C27E';ctx.shadowBlur=10;ctx.fill();ctx.restore();return true;});
 font(500,11.5);ctx.fillStyle='rgba(156,148,131,.95)';ctx.textBaseline='alphabetic';[[0,'00','left'],[6,'06','center'],[12,'12','center'],[18,'18','center'],[24,'24','right']].forEach(function(a){ctx.textAlign=a[2];ctx.fillText(a[1],X(a[0]),393);});
 ctx.font='italic 400 13px Newsreader, Georgia, serif';ctx.textAlign='center';ctx.fillText(T.yo||'',X(3),393);ctx.textAlign='left';
 if(ph.sweep){var px=X(ph.hh),bg=ctx.createLinearGradient(0,cy0-8,0,364);bg.addColorStop(0,'rgba(226,194,126,0)');bg.addColorStop(.15,'rgba(226,194,126,.55)');bg.addColorStop(1,'rgba(226,194,126,.1)');
  ctx.strokeStyle=bg;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(px,cy0-4);ctx.lineTo(px,364);ctx.stroke();
  ctx.beginPath();ctx.arc(px,Y(vAt(ph.hh)),4.5,0,7);ctx.fillStyle='#E2C27E';ctx.shadowColor='#E2C27E';ctx.shadowBlur=14;ctx.fill();ctx.shadowBlur=0;
  var hr=Math.floor(ph.hh),mn=Math.floor((ph.hh-hr)*4)*15,lab=(hr<10?'0':'')+hr+':'+(mn<10?'0':'')+mn;font(600,11.5);var tw=ctx.measureText(lab).width+14,tl=Math.max(x0,Math.min(x1-tw,px-tw/2));
  rr(tl,cy0-26,tw,18,9);ctx.fillStyle='#E2C27E';ctx.fill();ctx.fillStyle='#1A1610';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(lab,tl+tw/2,cy0-16.5);ctx.textAlign='left';ctx.textBaseline='alphabetic';}
}
function ui(ph){
 var show=held>=0||run;mark(items,show?ph.s:-1,held>=0||!run?1:Math.min(1,t/DUR[ph.s]));
 if(lastCap!==ph.s){lastCap=ph.s;var it=items[ph.s],bb=it&&it.querySelector('b');capEl.textContent='';var e=d.createElement('b');e.textContent=bb?bb.textContent:'';capEl.appendChild(e);capEl.appendChild(d.createTextNode(caps[ph.s]||''));
  if(resEl)resEl.classList.toggle('on',ph.s===3);}
 if(cntB)cntB.textContent=Math.round(resHours(rev(0,ph)))+' h';if(cntBox)cntBox.style.opacity=ph.s===0?1:.45;
}
function draw(){var ph=phase();try{paint(ph);ui(ph);}catch(e){}}
function tick(now){raf=0;if(!vis){last=0;return;}var dt=last?Math.min(.1,(now-last)/1000):0;last=now;
 if(run&&!paused&&held<0){t+=dt;if(t>=DUR[st]){t=0;st=(st+1)%4;if(st===0){lit={};parts=[];}}}
 if(!paused&&!RM)clock+=dt;
 var s=phase().s;for(k in TGT)A[k]+=(TGT[k][s]-A[k])*(RM?1:Math.min(1,dt*4));
 draw();if(!RM)raf=requestAnimationFrame(tick);}
function go(){if(!raf&&vis)raf=requestAnimationFrame(tick);}
function hold(i){held=i;lit={};parts=[];if(btn&&run)pbtn(btn,true);go();}
function free(){if(held<0)return;st=held;held=-1;tHold=false;t=DUR[st]*SW;if(btn&&run)pbtn(btn,paused);go();}
items.forEach(function(it,i){
 it.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')hold(i);});
 it.addEventListener('focus',function(){if(!byTouch())hold(i);});
 it.addEventListener('blur',function(){if(!tHold)free();});
 it.addEventListener('click',function(e){if(byTouch()&&!(tHold&&held===i)){e.preventDefault();tHold=true;hold(i);}});
});
if(list)list.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'&&!tHold)free();});
d.addEventListener('pointerdown',function(e){if(tHold&&!box.contains(e.target))free();});
if(run&&btn){btn.hidden=false;btn.addEventListener('click',function(){if(held>=0){paused=false;free();pbtn(btn,false);return;}paused=!paused;pbtn(btn,paused);go();});}
function size(){var w=Math.max(280,Math.round(cv.getBoundingClientRect().width||720)),dp=Math.min(2,window.devicePixelRatio||1);if(w===W&&cv.width===Math.round(w*dp))return;W=w;H=400;cv.width=Math.round(W*dp);cv.height=Math.round(H*dp);cv.style.height=H+'px';ctx.setTransform(dp,0,0,dp,0,0);pat=null;draw();}
if(window.ResizeObserver)new ResizeObserver(size).observe(cv.parentNode);else window.addEventListener('resize',size);
W=0;size();
if(d.fonts&&d.fonts.ready)d.fonts.ready.then(function(){draw();});
onView(cv,function(v){vis=v;if(v&&!seen){seen=true;if(run){st=0;t=0;lit={};parts=[];}}if(v)go();},.3);
})();

/* ---------- prosessivideo ----------
   Vaihe näkyy aina kolmella tavalla: rivin korostus, rivin taustasävy (--p) ja vaiheen nimi kuvan kulmassa.
   v48: .acc = aktiivisen vaiheen kuvaus näkyy vakiokorkuisessa paneelissa rivien alla (.k-pdx, aria-hidden; rivien omat
   kuvaukset jäävät ruudunlukijalle), joten rivit eivät liiku hiiren alla. Reduced-motion: kuvaukset riveillä.
   Rivit ovat näppäimistöllä kohdistettavia (fokus pitää vaiheen kuten hiiri).
   Jos video ei käynnisty (estetty automaattitoisto, esikatselun tietoturvasääntö, verkkovirhe, ei kuvaa 6 s:ssa),
   tilalle vaihtuvat vaiheiden pysäytyskuvat samalla aikataululla; reduced-motion/saveData: pysäytyskuvat ilman etenemistä. */
(function(){
var box=d.querySelector('[data-pv]'),v=box&&box.querySelector('video');if(!v)return;
var img=box.querySelector('.k-pvs'),lab=box.querySelector('.k-pvl'),btn=box.querySelector('.k-play'),list=box.querySelector('.k-ps'),items=[].slice.call(box.querySelectorAll('.k-ps li'));
var S=[0,5.5,11,17,22,30],KEY=[4.6,10.4,16.2,21.3,29.2],ST=(img&&img.getAttribute('data-stills')||'').split(' ');
var pds=[],held=-1,tHold=false,paused=false,vis=false,loaded=false,still=RM||SD,raf=0,want=-1,cur=-1,st=0,stT=0,stLast=0,wd=0,shown=-1;
function at(t){for(var i=4;i>0;i--)if(t>=S[i])return i;return 0;}
function setStage(i,p){mark(items,i,p);if(i!==cur){cur=i;pds.forEach(function(x,j){x.classList.toggle('on',j===i);});if(lab&&items[i]){var n=items[i].querySelector('.n'),h=items[i].querySelector('h3');lab.textContent=(n?n.textContent+' · ':'')+(h?h.textContent:'');}}}
/* video-tila */
function frame(){raf=0;if(still)return;var t=v.currentTime||0,i=held>=0?held:at(t);
 setStage(i,held>=0?1:Math.min(1,(t-S[i])/(S[i+1]-S[i])));if(!v.paused&&vis)raf=requestAnimationFrame(frame);}
function blobURL(du){try{var k=du.indexOf(','),bin=atob(du.slice(k+1)),a=new Uint8Array(bin.length);for(var j=0;j<bin.length;j++)a[j]=bin.charCodeAt(j);
 return URL.createObjectURL(new Blob([a],{type:du.slice(5,du.indexOf(';'))}));}catch(e){return du;}}
function load(){if(loaded||still)return;loaded=true;var b=v.getAttribute('data-base')+(matchMedia('(max-width:767px)').matches?'-m':'');
 /* esikatselutiedosto (build-standalone.py) upottaa videot: data-inline-webm / data-inline-mp4 → Blob-osoite (Safari ei toista data:-videota) */
 [['webm','video/webm; codecs=vp9'],['mp4','video/mp4']].forEach(function(x){var u=v.getAttribute('data-inline-'+x[0]);u=u?blobURL(u):(v.hasAttribute('data-base')?b+'.'+x[0]:'');
  if(u){var s=d.createElement('source');s.src=u;s.type=x[1];v.appendChild(s);}});
 v.load();}
/* pysäytyskuvatila */
function showStill(i){if(!img||!ST[i])return;if(shown!==i){shown=i;img.src=ST[i];img.classList.remove('sw');void img.offsetWidth;img.classList.add('sw');}img.hidden=false;}
function sTick(now){raf=0;if(!still||RM||paused||held>=0||!vis){stLast=0;return;}var dt=stLast?Math.min(.1,(now-stLast)/1000):0;stLast=now;stT+=dt;
 if(stT>=S[st+1]-S[st]){stT=0;st=(st+1)%5;}showStill(st);setStage(st,stT/(S[st+1]-S[st]));raf=requestAnimationFrame(sTick);}
function sGo(){if(!raf&&still&&!RM&&!paused&&held<0&&vis)raf=requestAnimationFrame(sTick);}
function toStill(){if(v.hidden)return;still=true;clearTimeout(wd);if(raf)cancelAnimationFrame(raf);raf=0;try{v.pause();}catch(e){}v.hidden=true;
 if(btn)btn.hidden=RM;st=held>=0?held:Math.max(0,cur);stT=0;showStill(st);setStage(st,held>=0||RM?1:0);sGo();}
function play(){if(paused||held>=0||!vis)return;if(still){sGo();return;}load();clearTimeout(wd);wd=setTimeout(function(){if(!still&&v.readyState<2)toStill();},6000);
 var p=v.play();if(p&&p.catch)p.catch(function(e){if(e&&e.name==='NotAllowedError')toStill();});}
function seek(x){if(v.readyState>=1){try{v.currentTime=x;}catch(e){}}else want=x;}
function hold(i){held=i;if(btn)pbtn(btn,true);if(still){st=i;stT=0;showStill(i);setStage(i,1);return;}load();v.pause();seek(KEY[i]);frame();}
function free(){if(held<0)return;held=-1;tHold=false;if(btn)pbtn(btn,paused);if(still){stT=0;sGo();return;}frame();play();}
v.addEventListener('loadedmetadata',function(){if(want>=0){seek(want);want=-1;}});
v.addEventListener('playing',function(){clearTimeout(wd);});
v.addEventListener('play',function(){if(!raf)raf=requestAnimationFrame(frame);});
v.addEventListener('seeked',function(){if(!raf)frame();});
v.addEventListener('error',function(){if(v.networkState===3)toStill();},true);
items.forEach(function(it,i){
 it.tabIndex=0;
 it.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')hold(i);});
 it.addEventListener('focus',function(){if(!byTouch())hold(i);});
 it.addEventListener('blur',function(){if(!tHold)free();});
 it.addEventListener('click',function(){if(!byTouch())return;if(tHold&&held===i)free();else{tHold=true;hold(i);}});
});
if(!RM&&list){var pdx=d.createElement('div');pdx.className='k-pdx';pdx.setAttribute('aria-hidden','true');
 items.forEach(function(it){var s=it.querySelector('.k-pd p'),x=d.createElement('p');x.textContent=s?s.textContent:'';pdx.appendChild(x);pds.push(x);});
 list.parentNode.appendChild(pdx);box.classList.add('acc');}
if(list)list.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'&&!tHold)free();});
d.addEventListener('pointerdown',function(e){if(tHold&&!box.contains(e.target))free();});
if(btn){btn.addEventListener('click',function(){if(held>=0){paused=false;free();return;}paused=!paused;pbtn(btn,paused);if(paused){if(!still)v.pause();}else play();});btn.hidden=RM;}
if(lab)lab.hidden=false;
if(still){v.hidden=true;showStill(0);setStage(0,RM?1:0);}
else{setStage(0,0);onView(box,function(x){if(x&&!v.poster){v.poster=v.getAttribute('data-poster');v.preload='auto';load();}},0,'400px 0px');}
onView(v.parentNode,function(x){vis=x;if(x)play();else if(!still&&!v.paused)v.pause();},.35);
})();
})();
