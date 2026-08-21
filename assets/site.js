/* SAMA Energia — jaettu sivuskripti (FI + ET).
   Kielikohtaiset tekstit asuvat HTML:ssä (mm. data-cap-attribuutit), eivät tässä tiedostossa.
   Entinen hash-reititin on poistettu: jokainen sivu on oma URL-osoitteensa. */

document.getElementById('burger').addEventListener('click',function(){
  var m=document.getElementById('menu');
  var open=m.classList.toggle('open');
  this.setAttribute('aria-expanded',open?'true':'false');
});

/* Yhteydenottolomake — Netlify Forms.
   Ensisijaisesti AJAX (onnistumisviesti näytetään paikallaan). Jos AJAX epäonnistuu,
   varapolkuna natiivi lähetys lomakkeen action-kiitossivulle — ei umpikujaa.
   Ilman JS:ää selain lähettää suoraan actioniin, joten lomake toimii myös silloin. */
var cf=document.getElementById('ctForm');
if(cf)cf.addEventListener('submit',function(e){
  e.preventDefault();
  var ok=document.getElementById('ctOk'),err=document.getElementById('ctErr'),
      btn=document.getElementById('ctSend');
  err.hidden=true;btn.disabled=true;btn.style.opacity='.6';
  function fallback(){
    /* submit() ei laukaise submit-tapahtumaa uudelleen, joten silmukkaa ei synny.
       Jos natiivi lähetyskin kaatuu synkronisesti, näytetään virhe + suora sähköposti. */
    try{cf.submit();}
    catch(_){btn.disabled=false;btn.style.opacity='';err.hidden=false;}
  }
  fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams(new FormData(cf)).toString()})
  .then(function(r){
    if(r.ok){btn.disabled=false;btn.style.opacity='';ok.hidden=false;cf.reset();}
    else{fallback();}
  })
  .catch(fallback);
});

/* ---------- signature: frequency trace ----------
   Illustrative only. To make it live, poll Fingrid's open data API
   (real-time frequency) and Elering's live API, then feed values in.
   Time-based rAF scroll: renders at display refresh rate, pauses in
   background tabs, honours prefers-reduced-motion. */
(function(){
  var path=document.getElementById('wave');
  if(!path)return;
  var W=1200,H=130,MID=65,SEG=5,N=242,pts=[],t=0;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Siemen 453912 — deterministinen satunnaisuus: jokainen lataus toistaa saman käyrän. */
  var _s=453912>>>0;
  function rnd(){_s|=0;_s=_s+0x6D2B79F5|0;var r=Math.imul(_s^_s>>>15,1|_s);r=r+Math.imul(r^r>>>7,61|r)^r;return((r^r>>>14)>>>0)/4294967296;}
  function val(){
    t++;
    var base=Math.sin(t*0.07)*7+Math.sin(t*0.19)*4+Math.sin(t*0.031)*9;
    var noise=(rnd()-0.5)*3.4;
    var event=(rnd()<0.012)?(rnd()<0.5?-22:18):0;
    return Math.max(10,Math.min(H-10,MID+base+noise+event));
  }
  for(var i=0;i<N;i++)pts.push(val());
  function draw(off){
    var d='M'+(0-off).toFixed(1)+' '+pts[0].toFixed(1);
    for(var i=1;i<N;i++)d+=' L'+(i*SEG-off).toFixed(1)+' '+pts[i].toFixed(1);
    path.setAttribute('d',d);
  }
  draw(0);
  if(reduce)return;
  var last=null,off=0;
  function frame(now){
    if(last===null)last=now;
    var dt=Math.min(now-last,100);last=now;
    off+=dt*0.05;
    while(off>=SEG){off-=SEG;pts.shift();pts.push(val());}
    draw(off);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ===== KONSEPTI-B SIIRROT: kuormituskäyrä + käyttötilakaavio =====
   Tilojen kuvaustekstit tulevat nappien data-cap-attribuuteista (kielikohtaiset). */
(function(){
  var cap=document.getElementById('opsCap');
  if(!cap)return;
  var F={sol:document.getElementById('opSol'),batt:document.getElementById('opBatt'),
    chg:document.getElementById('opChg'),grid:document.getElementById('opGrid'),
    res:document.getElementById('opRes'),load:document.getElementById('opLoad')};
  var fill=document.getElementById('opFill');
  var verkko=document.getElementById('opVerkko');
  var CFG={
    sun:{on:['sol','load','chg'],lvl:.75,grid:true},
    peak:{on:['grid','load','batt'],lvl:.45,grid:true},
    night:{on:['grid','chg'],lvl:.92,grid:true},
    res:{on:['batt','res'],lvl:.6,grid:true},
    out:{on:['batt','load'],lvl:.35,grid:false}};
  var btns=document.querySelectorAll('.ops button');
  function set(st){
    var c=CFG[st];
    Object.keys(F).forEach(function(k){F[k].classList.toggle('on',c.on.indexOf(k)>=0);});
    var hh=Math.round(10*c.lvl)+2;
    fill.setAttribute('height',hh);fill.setAttribute('y',288-hh);
    verkko.classList.toggle('off',!c.grid);
    btns.forEach(function(b){
      var act=b.dataset.s===st;
      b.classList.toggle('act',act);
      if(act)cap.textContent=b.dataset.cap||'';
    });
  }
  btns.forEach(function(b){b.addEventListener('click',function(){set(b.dataset.s);});});
  set('sun');
})();

/* ===== KOE: MAGNEETTI-CTA · pari CSS-lohkolle tyylien lopussa · poista molemmat peruaksesi ===== */
(function(){
  if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var R=110,MAX=7,raf=null,mx=0,my=0;
  document.addEventListener('mousemove',function(e){
    mx=e.clientX;my=e.clientY;
    if(!raf)raf=requestAnimationFrame(update);
  });
  function update(){
    raf=null;
    var home=document.getElementById('p-home');
    if(!home||!home.classList.contains('active'))return;
    var btns=home.querySelectorAll('.btn');
    for(var i=0;i<btns.length;i++){
      var b=btns[i],r=b.getBoundingClientRect();
      var dx=mx-(r.left+r.width/2),dy=my-(r.top+r.height/2);
      var ox=Math.max(Math.abs(dx)-r.width/2,0),oy=Math.max(Math.abs(dy)-r.height/2,0);
      var d=Math.sqrt(ox*ox+oy*oy);
      if(d<R){
        var c=Math.sqrt(dx*dx+dy*dy)||1,p=1-d/R;p*=p;
        b.style.transition='transform .09s ease-out';
        b.style.transform='translate('+(dx/c*p*MAX).toFixed(1)+'px,'+(dy/c*p*MAX).toFixed(1)+'px) scale('+(1+p*.03).toFixed(3)+')';
      }else if(b.style.transform){
        b.style.transition='';b.style.transform='';
      }
    }
  }
})();

/* ---------- katselmustila (?review=1) ----------
   Korostaa luonnoksessa muuttuneet osiot assets/review.json-manifestin perusteella
   (manifestin kirjoittaa scripts/build-pages.mjs vertaamalla lähteitä origin/mainiin).
   Ilman review=1-parametria tai tyhjällä manifestilla tämä polku ei tee eikä lataa mitään —
   siksi tila on vaaraton myös mainissa, vaikka manifest kulkee mukana. */
(function(){
  if(!/[?&]review=1(?:&|$)/.test(location.search))return;

  /* Sanadiffi (LCS, ei riippuvuuksia): ['=',sana] / ['-',poistettu] / ['+',lisätty].
     Yhteinen alku ja loppu leikataan ensin pois; jos jäljelle jäävä DP-taulu olisi
     kohtuuttoman suuri, palataan karkeaan "vanha pois, uusi tilalle" -näkymään. */
  function wordDiff(a,b){
    var s=0;while(s<a.length&&s<b.length&&a[s]===b[s])s++;
    var e=0;while(e<a.length-s&&e<b.length-s&&a[a.length-1-e]===b[b.length-1-e])e++;
    var A=a.slice(s,a.length-e),B=b.slice(s,b.length-e);
    var n=A.length,m=B.length,out=[],i,j;
    for(i=0;i<s;i++)out.push(['=',a[i]]);
    if(n*m>4000000){
      for(i=0;i<n;i++)out.push(['-',A[i]]);
      for(j=0;j<m;j++)out.push(['+',B[j]]);
    }else{
      var W=m+1,dp=new Int32Array((n+1)*W);
      for(i=n-1;i>=0;i--)for(j=m-1;j>=0;j--){
        dp[i*W+j]=A[i]===B[j]?dp[(i+1)*W+j+1]+1:Math.max(dp[(i+1)*W+j],dp[i*W+j+1]);
      }
      i=0;j=0;
      while(i<n&&j<m){
        if(A[i]===B[j]){out.push(['=',A[i]]);i++;j++;}
        else if(dp[(i+1)*W+j]>=dp[i*W+j+1]){out.push(['-',A[i]]);i++;}
        else{out.push(['+',B[j]]);j++;}
      }
      while(i<n){out.push(['-',A[i]]);i++;}
      while(j<m){out.push(['+',B[j]]);j++;}
    }
    for(i=a.length-e;i<a.length;i++)out.push(['=',a[i]]);
    return out;
  }
  function words(t){t=(t||'').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();return t?t.split(' '):[];}

  /* Peittokerros: sivun oikeaa merkkausta ei muuteta — diffi elää omassa overlayssa */
  function toggleDiff(el,prev,cur){
    var ex=el.querySelector('.rev-diff');
    if(ex){ex.remove();return;}
    var d=document.createElement('div');
    d.className='rev-diff';
    wordDiff(words(prev),words(cur)).forEach(function(t){
      var sp=document.createElement('span');
      if(t[0]==='-')sp.className='rev-del';
      else if(t[0]==='+')sp.className='rev-ins';
      sp.textContent=t[1]+' ';
      d.appendChild(sp);
    });
    d.addEventListener('click',function(e){e.stopPropagation();d.remove();});
    el.appendChild(d);
  }

  fetch('/assets/review.json')
  .then(function(r){return r.json()})
  .then(function(man){
    var list=(man&&man.changes)||[];
    if(!list.length)return;
    var here=location.pathname;
    var marked=[];
    list.forEach(function(c){
      if(c.page!==here)return;
      var el=document.getElementById(c.sectionId);
      if(!el||el.classList.contains('rev-mark'))return;
      /* nykyteksti talteen ENNEN kuin overlay/nimiö lisätään elementtiin */
      var cur=(el.textContent||'');
      el.classList.add('rev-mark');
      var lab=document.createElement('span');
      lab.className='rev-lab';
      lab.textContent=(c.kind==='new'?'UUSI':'MUUTETTU')+' · DIFF';
      el.appendChild(lab);
      marked.push({el:el,prev:c.prev||'',cur:cur});
      el.addEventListener('click',function(e){
        if(e.target.closest('a,button,input,select,textarea,.rev-diff'))return;
        toggleDiff(el,c.prev||'',cur);
      });
    });
    var pages=[];
    list.forEach(function(c){if(pages.indexOf(c.page)<0)pages.push(c.page)});
    var b=document.createElement('div');
    b.className='rev-banner';
    var head=document.createElement('b');
    head.textContent='KATSELMUS · MUUTTUNEET SIVUT:';
    b.appendChild(head);
    pages.forEach(function(p){
      var a=document.createElement('a');
      a.href=p+'?review=1';
      a.textContent=p;
      b.appendChild(a);
    });
    if(marked.length){
      var on=false;
      var tg=document.createElement('button');
      tg.type='button';tg.className='rev-toggle';
      tg.textContent='NÄYTÄ KAIKKI MUUTOKSET / SHOW ALL DIFFS';
      tg.addEventListener('click',function(){
        on=!on;
        tg.textContent=on?'PIILOTA MUUTOKSET / HIDE DIFFS':'NÄYTÄ KAIKKI MUUTOKSET / SHOW ALL DIFFS';
        marked.forEach(function(mk){
          var ex=mk.el.querySelector('.rev-diff');
          if(on&&!ex)toggleDiff(mk.el,mk.prev,mk.cur);
          if(!on&&ex)ex.remove();
        });
      });
      b.appendChild(tg);
    }
    document.body.appendChild(b);
    /* review=1 säilyy sisäisissä linkeissä, jotta tila kestää navigoinnin */
    document.querySelectorAll('a[href^="/"]').forEach(function(a){
      var h=a.getAttribute('href');
      if(h.indexOf('review=1')<0)a.setAttribute('href',h+(h.indexOf('?')<0?'?review=1':'&review=1'));
    });
  })
  .catch(function(){});
})();
