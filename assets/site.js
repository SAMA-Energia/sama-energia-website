/* SAMA Energia — jaettu sivuskripti (FI + ET).
   Kielikohtaiset tekstit asuvat HTML:ssä (mm. data-cap-attribuutit), eivät tässä tiedostossa.
   Entinen hash-reititin on poistettu: jokainen sivu on oma URL-osoitteensa. */

document.getElementById('burger').addEventListener('click',function(){
  var m=document.getElementById('menu');
  var open=m.classList.toggle('open');
  this.setAttribute('aria-expanded',open?'true':'false');
});

/* Kielivalitsin esikatseluhostilla: langsw-linkit ovat kanonisia tuotanto-URL:eja
   (samaenergia.fi / samaenergia.ee) — oikein tuotannossa, kuolleita
   *.netlify.app-esikatselussa ennen mergeä. Ajossa — lähteitä ja julkaistuja
   hrefejä muuttamatta — kirjoitetaan VAIN .langsw-ankkurit hostin sisäisiksi:
   .fi/<slug>/ -> /<slug>/ ja .ee/<slug>/ -> /et/<slug>/ (/et/-polut ovat
   turvallisin sisäinen muoto tällä hostilla; paljaat ET-slugit toimisivat myös
   yleisten uudelleenkirjoitusten kautta). Tuotantohostit eivät koskaan osu
   ehtoon; ilman JS:ää esikatselun kielivalitsin vie tuotantoon kuten ennenkin.
   Lohko on ENNEN katselmustilaa, jotta ?review=1 säilyy myös näissä linkeissä. */
(function(){
  if(!/\.netlify\.app$/.test(location.hostname))return;
  document.querySelectorAll('.langsw a').forEach(function(a){
    var m=/^https:\/\/(?:www\.)?samaenergia\.(fi|ee)(\/.*)$/.exec(a.getAttribute('href')||'');
    if(!m)return;
    a.setAttribute('href',m[1]==='fi'?m[2]:(m[2]==='/'?'/et/':'/et'+m[2]));
  });
})();

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
    res:document.getElementById('opRes')};
  var fill=document.getElementById('opFill');
  var verkko=document.getElementById('opVerkko');
  /* bus: pystyväylän dynaaminen virtauskerros — jänne ja suunta tilakohtaisesti
     (res piirtyy 268→120, jolloin katkoviiva-animaatio kulkee ylöspäin = syöttö verkkoon) */
  var CFG={
    sun:{on:['sol','chg'],bus:'164,304',lvl:.75,grid:true},
    peak:{on:['grid','batt'],bus:'120,304',lvl:.45,grid:true},
    night:{on:['grid','chg'],bus:'120,268',lvl:.92,grid:true},
    res:{on:['batt','res'],bus:'268,120',lvl:.6,grid:true},
    out:{on:['batt'],bus:'268,304',lvl:.35,grid:false}};
  var btns=document.querySelectorAll('.ops button');
  function set(st){
    var c=CFG[st];
    Object.keys(F).forEach(function(k){if(F[k])F[k].classList.toggle('on',c.on.indexOf(k)>=0);});
    var bus=document.getElementById('opBus');
    if(bus){
      if(c.bus){
        var p=c.bus.split(',');
        bus.setAttribute('d','M255 '+p[0]+' V'+p[1]);
        bus.classList.add('on');
      }else bus.classList.remove('on');
    }
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

  /* ===== Puhtaat apufunktiot — DOM-vapaita, jotta sama logiikka on ajettavissa
     Node-simulaationa (scripts/simulate-review.mjs viipaloi nämä tiedostosta). ===== */

  /* Sama jäsennin molemmille puolille: sana = yhtenäinen ei-tyhjä merkkijono,
     välimerkit osana sanaansa. Palauttaa sanat + merkkivälit alkuperäistekstissä. */
  function tokenizeWithPos(text){
    var wds=[],pos=[],re=/[^\s\u00a0]+/g,m;
    while((m=re.exec(text||''))){wds.push(m[0]);pos.push([m.index,m.index+m[0].length]);}
    return {words:wds,pos:pos};
  }

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

  /* Diffistä DOM-riippumattomat annotaatio-operaatiot:
     addRanges = lisättyjen sanojen merkkivälit nykytekstissä (vierekkäiset lisäykset
     yhdistetään, kun väli on pelkkää tyhjää eikä väliin osu poistomerkkiä);
     markers   = poistomerkit ankkuroituina seuraavan nykysanan alkukohtaan
     (Infinity = poisto osion lopussa). */
  function computeOps(diff,tok,concat){
    var addRanges=[],markers=[],ci=0,pend=[];
    function flush(at){if(pend.length){markers.push({at:at,text:pend.join(' ')});pend=[];}}
    diff.forEach(function(t){
      if(t[0]==='-'){pend.push(t[1]);return;}
      var range=tok.pos[ci],hadPend=pend.length>0;
      flush(range[0]);
      if(t[0]==='+'){
        var last=addRanges[addRanges.length-1];
        if(!hadPend&&last&&/^[\s\u00a0]*$/.test(concat.slice(last[1],range[0])))last[1]=range[1];
        else addRanges.push([range[0],range[1]]);
      }
      ci++;
    });
    flush(Infinity);
    return {addRanges:addRanges,markers:markers};
  }

  /* ===== DOM-osuus ===== */

  /* Osion tekstisolmut dokumenttijärjestyksessä. Skriptit, tyylit ja omat
     katselmuselementit ohitetaan; piilotettu sisältö (esim. hunajapurkki) pidetään
     mukana, jotta sanavirta vastaa manifestin prev-tekstin laskentatapaa. */
  function collectNodes(el){
    var nodes=[],w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
      var p=n.parentElement;
      if(!p||p.closest('script,style,template,.rev-lab,.rev-add,.rev-del-mark,.rev-diff'))return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;}});
    while(w.nextNode())nodes.push(w.currentNode);
    return nodes;
  }
  /* SVG:n <text>-solmuun ei voi upottaa HTML-spania — sellainen solmu lasketaan
     sanavirtaan mutta jätetään koskematta (kaaviot eivät saa hajota). */
  function isLocked(n){
    var p=n.parentElement;return !!(p&&p.namespaceURI&&p.namespaceURI.indexOf('2000/svg')>=0);
  }
  function mkAdd(text){var s=document.createElement('span');s.className='rev-add';s.textContent=text;return s;}
  function mkDel(text){var s=document.createElement('span');s.className='rev-del-mark';s.setAttribute('aria-hidden','true');s.textContent=text;return s;}

  function undoRecords(records){
    records.forEach(function(r){
      if(r.type==='wrap'){
        r.parent.insertBefore(r.original,r.inserted[0]);
        r.inserted.forEach(function(n){if(n.parentNode===r.parent)r.parent.removeChild(n);});
      }else if(r.node.parentNode)r.node.parentNode.removeChild(r.node);
    });
  }

  /* Annotointi paikan päällä: osio renderöityy täsmälleen suunnitellusti; lisätyt
     sanat kääritään spaniin siellä missä ne ovat, poistot upotetaan pieninä
     yliviivattuina merkkeinä poistokohtaansa. Elementtirakennetta ei koskaan muuteta —
     vain tekstisolmuja korvataan, ja alkuperäiset solmuobjektit säilytetään talteen,
     joten purku palauttaa DOM:n tavulleen ennalleen.
     Paluuarvo: records-taulukko, 'overlay' (eheystarkistus petti) tai null (ohita). */
  function annotate(el,prev,lab){
    var nodes=collectNodes(el);
    var offs=[],concat='';
    nodes.forEach(function(n){offs.push(concat.length);concat+=n.nodeValue;});
    var tok=tokenizeWithPos(concat);
    if(tok.words.length<10)return null; /* olennaisesti ei-tekstiosio: ääriviiva riittää */
    /* eheystarkistus: kävelyn on katettava sama sanamäärä kuin textContentin (ilman nimiötä) */
    var expect=tokenizeWithPos(el.textContent).words.length-tokenizeWithPos(lab?lab.textContent:'').words.length;
    if(tok.words.length!==expect)return 'overlay';
    var ops=computeOps(wordDiff(tokenizeWithPos(prev).words,tok.words),tok,concat);
    if(!ops.addRanges.length&&!ops.markers.length)return null;
    var records=[];
    try{
      nodes.forEach(function(n,idx){
        if(isLocked(n))return;
        var ns=offs[idx],ne=ns+n.nodeValue.length,items=[];
        ops.markers.forEach(function(mk){if(mk.at>=ns&&mk.at<ne)items.push({p:mk.at-ns,type:'del',text:mk.text});});
        ops.addRanges.forEach(function(r){
          var s=Math.max(r[0],ns),e=Math.min(r[1],ne);
          /* solmurajan yli jatkuvasta lisäysjaksosta ei käärintää pelkälle tyhjälle */
          if(s<e&&!/^[\s\u00a0]*$/.test(n.nodeValue.slice(s-ns,e-ns)))items.push({p:s-ns,e:e-ns,type:'add'});
        });
        if(!items.length)return;
        items.sort(function(a,b){return a.p-b.p||(a.type==='del'?-1:1);});
        var frag=document.createDocumentFragment(),cur=0,txt=n.nodeValue,ins=[];
        function push(nd){frag.appendChild(nd);ins.push(nd);}
        items.forEach(function(it){
          if(it.p>cur){push(document.createTextNode(txt.slice(cur,it.p)));cur=it.p;}
          if(it.type==='del')push(mkDel(it.text));
          else if(it.e>cur){push(mkAdd(txt.slice(Math.max(it.p,cur),it.e)));cur=it.e;}
        });
        if(cur<txt.length)push(document.createTextNode(txt.slice(cur)));
        var parent=n.parentNode;
        parent.insertBefore(frag,n);
        parent.removeChild(n);
        records.push({type:'wrap',parent:parent,original:n,inserted:ins});
      });
      ops.markers.forEach(function(mk){
        if(mk.at!==Infinity)return;
        var sp=mkDel(mk.text);el.appendChild(sp);records.push({type:'ins',node:sp});
      });
    }catch(_){
      undoRecords(records);
      return 'overlay';
    }
    return records.length?records:null;
  }

  /* Varapolku: vanha peittokerros litistettynä tekstidiffina — käytössä vain,
     jos paikan päällä -annotointi ei läpäise eheystarkistusta. Hiljainen alennus. */
  function overlayDiff(el,prev){
    var concat='';collectNodes(el).forEach(function(n){concat+=n.nodeValue;});
    var d=document.createElement('div');
    d.className='rev-diff';
    wordDiff(tokenizeWithPos(prev).words,tokenizeWithPos(concat).words).forEach(function(t){
      var sp=document.createElement('span');
      if(t[0]==='-')sp.className='rev-del';
      else if(t[0]==='+')sp.className='rev-ins';
      sp.textContent=t[1]+' ';
      d.appendChild(sp);
    });
    el.appendChild(d);
    return d;
  }

  function toggleSection(mk){
    if(mk.kind==='new')return; /* uusi osio: pelkkä UUSI-ääriviiva, ei sanakohinaa */
    if(mk.state){
      if(mk.state.overlay)mk.state.overlay.remove();
      else undoRecords(mk.state.records);
      mk.state=null;
      return;
    }
    var r=annotate(mk.el,mk.prev,mk.lab);
    if(r==='overlay')mk.state={overlay:overlayDiff(mk.el,mk.prev)};
    else if(r)mk.state={records:r};
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
      el.classList.add('rev-mark');
      var lab=document.createElement('span');
      lab.className='rev-lab';
      lab.textContent=c.kind==='new'?'UUSI':'MUUTETTU · DIFF';
      el.appendChild(lab);
      var mk={el:el,prev:c.prev||'',kind:c.kind,lab:lab,state:null};
      marked.push(mk);
      el.addEventListener('click',function(e){
        if(e.target.closest('a,button,input,select,textarea'))return;
        toggleSection(mk);
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
      /* poistojen näyttö/piilotus — oletuksena päällä */
      var rd=document.createElement('button');
      rd.type='button';rd.className='rev-toggle';rd.setAttribute('aria-pressed','true');
      rd.textContent='NÄYTÄ POISTOT / SHOW REMOVALS';
      rd.addEventListener('click',function(){
        var hidden=document.body.classList.toggle('rev-hide-del');
        rd.setAttribute('aria-pressed',hidden?'false':'true');
      });
      b.appendChild(rd);
      var on=false;
      var tg=document.createElement('button');
      tg.type='button';tg.className='rev-toggle';
      tg.textContent='NÄYTÄ KAIKKI MUUTOKSET / SHOW ALL DIFFS';
      tg.addEventListener('click',function(){
        on=!on;
        tg.textContent=on?'PIILOTA MUUTOKSET / HIDE DIFFS':'NÄYTÄ KAIKKI MUUTOKSET / SHOW ALL DIFFS';
        marked.forEach(function(mk){
          if(on&&!mk.state&&mk.kind!=='new')toggleSection(mk);
          if(!on&&mk.state)toggleSection(mk);
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
