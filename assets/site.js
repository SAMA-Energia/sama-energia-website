/* SAMA Energia — jaettu sivuskripti (FI + ET), ulkoasu v5 — 03.09.2026. Tekstit asuvat HTML:ssä.
   Jokainen sivu on oma URL: hash-reititintä ei ole. Skripti lisää vain käytöstä, sisältö ei riipu siitä. */
(function(){
  var d=document,h=d.documentElement,b=d.body;
  h.classList.add('js');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- paljastus (.reveal) + .watch: piilotus vasta täällä (.pre), turvaverkko 1,4 s ---------- */
  var revs=[].slice.call(d.querySelectorAll('.reveal')),safety;
  function settle(){
    d.querySelectorAll('.reveal.pre').forEach(function(el){if(el.getBoundingClientRect().top<window.innerHeight*1.05)el.classList.remove('pre');});
    d.querySelectorAll('.watch:not(.in-view)').forEach(function(el){var r=el.getBoundingClientRect();if(r.top<window.innerHeight*1.05&&r.bottom>0)el.classList.add('in-view');});
  }
  if('IntersectionObserver' in window&&!reduce){
    revs.forEach(function(el){if(el.getBoundingClientRect().top>window.innerHeight*0.92)el.classList.add('pre');});
    var io=new IntersectionObserver(function(entries){entries.forEach(function(en){if(en.isIntersecting){en.target.classList.remove('pre');io.unobserve(en.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:0.08});
    revs.forEach(function(el){io.observe(el);});
    var io2=new IntersectionObserver(function(entries){entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in-view');io2.unobserve(en.target);}});},{threshold:0.2});
    d.querySelectorAll('.watch').forEach(function(el){io2.observe(el);});
    safety=setTimeout(settle,1400);
    window.addEventListener('scroll',function(){clearTimeout(safety);safety=setTimeout(settle,600);},{passive:true});
  }else{
    d.querySelectorAll('.watch').forEach(function(el){el.classList.add('in-view');});
  }

  /* ---------- otsakkeen varjo + kiinnitetty CTA (mobiili) ---------- */
  var header=d.querySelector('.header'),sticky=d.getElementById('sticky-cta');
  function onScroll(){
    var y=window.scrollY||h.scrollTop;
    if(header)header.classList.toggle('is-stuck',y>8);
    if(sticky){
      var hero=d.querySelector('.hero, .subhero'),closer=d.querySelector('.closer');
      var past=hero?y>(hero.offsetTop+hero.offsetHeight-120):y>300;
      var atForm=closer&&(closer.getBoundingClientRect().top<window.innerHeight*0.6);
      sticky.classList.toggle('show',past&&!atForm);
    }
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();

  /* ---------- pudotusvalikot (klikkaus/kosketus + näppäimistö; hover CSS:ssä) ---------- */
  d.querySelectorAll('.nav .dd').forEach(function(dd){
    var btn=dd.querySelector('button');
    btn.addEventListener('click',function(e){e.stopPropagation();var was=dd.classList.contains('open');closeDds();if(!was){dd.classList.add('open');btn.setAttribute('aria-expanded','true');}});
    dd.addEventListener('keydown',function(e){if(e.key==='Escape'){dd.classList.remove('open');btn.setAttribute('aria-expanded','false');btn.focus();}});
    dd.querySelectorAll('.menu a').forEach(function(a){a.addEventListener('click',function(){dd.classList.remove('open');btn.setAttribute('aria-expanded','false');});});
  });
  function closeDds(){d.querySelectorAll('.nav .dd.open').forEach(function(dd){dd.classList.remove('open');dd.querySelector('button').setAttribute('aria-expanded','false');});}
  d.addEventListener('click',closeDds);
  d.addEventListener('keydown',function(e){if(e.key==='Escape')closeDds();});

  /* ---------- mobiilivalikko ---------- */
  var mb=d.querySelector('.menu-btn'),mn=d.getElementById('mobile-nav');
  if(mb&&mn){
    mb.addEventListener('click',function(){var open=mn.classList.toggle('open');mb.setAttribute('aria-expanded',open?'true':'false');b.style.overflow=open?'hidden':'';});
    mn.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){mn.classList.remove('open');mb.setAttribute('aria-expanded','false');b.style.overflow='';});});
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&mn.classList.contains('open')){mn.classList.remove('open');mb.setAttribute('aria-expanded','false');b.style.overflow='';mb.focus();}});
  }

  /* ---------- kaavioiden vihjetekstit ---------- */
  d.querySelectorAll('.chart').forEach(function(ch){
    var tip=ch.querySelector('.tip');if(!tip)return;
    ch.querySelectorAll('.bar[data-v]').forEach(function(bar){
      bar.addEventListener('mouseenter',function(){var r=bar.getBoundingClientRect(),c=ch.getBoundingClientRect();tip.textContent=bar.getAttribute('data-v');tip.style.left=(r.left-c.left+r.width/2)+'px';tip.style.top=(r.top-c.top-30)+'px';tip.classList.add('show');});
      bar.addEventListener('mouseleave',function(){tip.classList.remove('show');});
    });
  });

  /* ---------- UKK: yksi auki kerrallaan ---------- */
  var dets=d.querySelectorAll('.faq details');
  dets.forEach(function(dt){dt.addEventListener('toggle',function(){if(dt.open){dets.forEach(function(o){if(o!==dt)o.open=false;});}});});

  /* ---------- kohdekartoituslomake — Netlify Forms: AJAX (.sent), varapolkuna natiivi lähetys
     action-kiitossivulle; ilman JS:ää selain lähettää suoraan actioniin. Molemmat lomakkeet. */
  d.querySelectorAll('form[data-netlify]').forEach(function(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var btn=form.querySelector('button[type="submit"]'),err=form.querySelector('.err');
      if(err)err.hidden=true;
      if(btn){btn.disabled=true;btn.style.opacity='.6';}
      function restore(){if(btn){btn.disabled=false;btn.style.opacity='';}}
      function fallback(){
        /* submit() ei laukaise submit-tapahtumaa uudelleen, joten silmukkaa ei synny. */
        try{form.submit();}
        catch(_){restore();if(err)err.hidden=false;}
      }
      fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:new URLSearchParams(new FormData(form)).toString()})
      .then(function(r){
        if(r.ok){restore();form.classList.add('sent');form.reset();var ok=form.querySelector('.ok');if(ok)ok.scrollIntoView({block:'center'});}
        else fallback();
      })
      .catch(fallback);
    });
  });

  /* ---------- kielivalitsin *.netlify.app-esikatselussa: kanoniset tuotanto-URL:t kirjoitetaan
     ajossa hostin sisäisiksi (.fi/<slug>/ -> /<slug>/, .ee/<slug>/ -> /et/<slug>/) ---------- */
  if(/\.netlify\.app$/.test(location.hostname)){
    d.querySelectorAll('.lang a').forEach(function(a){
      var m=/^https:\/\/(?:www\.)?samaenergia\.(fi|ee)(\/.*)$/.exec(a.getAttribute('href')||'');
      if(!m)return;
      a.setAttribute('href',m[1]==='fi'?m[2]:(m[2]==='/'?'/et/':'/et'+m[2]));
    });
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
    /* Alapalkki oletuksena kokoon taitettu (mobiilissa lista veisi puolet näytöstä); tila
       sessionStoragessa (sama-rev-banner = open | hidden), ilman tallennusta kiinni kaikilla leveyksillä. */
    var KEY='sama-rev-banner',stored=null;
    try{stored=sessionStorage.getItem(KEY);}catch(_){}
    if(stored==='hidden')return;
    var b=document.createElement('div');
    b.className='rev-banner';
    var row=document.createElement('div');
    row.className='rev-row';
    var hb=document.createElement('button');
    hb.type='button';hb.className='rev-head';hb.setAttribute('aria-controls','rev-body');
    var cl=document.createElement('button');
    cl.type='button';cl.className='rev-close';cl.setAttribute('aria-label','Piilota katselmuspalkki');cl.textContent='\u00d7';
    row.appendChild(hb);row.appendChild(cl);
    var body=document.createElement('div');
    body.className='rev-body';body.id='rev-body';
    var head=document.createElement('b');
    head.textContent='MUUTTUNEET SIVUT:';
    body.appendChild(head);
    pages.forEach(function(p){
      var a=document.createElement('a');
      a.href=p+'?review=1';
      a.textContent=p;
      body.appendChild(a);
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
      body.appendChild(rd);
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
      body.appendChild(tg);
    }
    function setOpen(open){
      body.hidden=!open;
      hb.setAttribute('aria-expanded',open?'true':'false');
      hb.textContent='KATSELMUS \u00b7 '+pages.length+' muuttunutta sivua '+(open?'\u25be':'\u25b8');
      try{if(open)sessionStorage.setItem(KEY,'open');else sessionStorage.removeItem(KEY);}catch(_){}
    }
    hb.addEventListener('click',function(){setOpen(body.hidden);});
    cl.addEventListener('click',function(){
      b.parentNode.removeChild(b);
      document.body.classList.remove('rev-has-banner');
      try{sessionStorage.setItem(KEY,'hidden');}catch(_){}
    });
    b.appendChild(row);b.appendChild(body);
    setOpen(stored==='open');
    document.body.appendChild(b);
    /* runko saa palkin korkeuden verran alapehmustetta (jalan viimeiset linkit eivät jää alle) */
    document.body.classList.add('rev-has-banner');
    /* review=1 säilyy sisäisissä linkeissä, jotta tila kestää navigoinnin */
    document.querySelectorAll('a[href^="/"]').forEach(function(a){
      var h=a.getAttribute('href');
      if(h.indexOf('review=1')<0)a.setAttribute('href',h+(h.indexOf('?')<0?'?review=1':'&review=1'));
    });
  })
  .catch(function(){});
})();
