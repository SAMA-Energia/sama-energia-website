#!/usr/bin/env python3
"""SAMA Energia — standalone-esikatselu (v35, 02.11.2026).
Kokoaa generoidut sivut yhdeksi tiedostoksi per kieli: kaikki sivut, valikot ja linkit toimivat
hash-reitityksellä (#/slug), CSS, fontit, kuvat ja site.js upotettuina. Ei julkaista sivustolla.
Ajo: node scripts/build-pages.mjs && python3 scripts/build-standalone.py [versio] [alkukohta-fi,alkukohta-et]
Alkukohta (valinnainen): tiedosto avautuu suoraan tähän etusivun osioon, esim. verkko,vork → Yhteinen verkko / Ühine võrk."""
import base64, os, re, sys, glob, mimetypes
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VER=sys.argv[1] if len(sys.argv)>1 else 'v35'
START=dict(zip(('fi','et'),(sys.argv[2].split(',')+[''])[:2])) if len(sys.argv)>2 else {}
OUT=os.path.join(ROOT,'dist-preview'); os.makedirs(OUT,exist_ok=True)
MIME={'.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.woff2':'font/woff2','.js':'text/javascript'}
def datauri(path):
    p=os.path.join(ROOT,path.lstrip('/'))
    if not os.path.exists(p): return None
    ext=os.path.splitext(p)[1].lower()
    return f'data:{MIME.get(ext,"application/octet-stream")};base64,'+base64.b64encode(open(p,'rb').read()).decode()
def inline_urls(text):
    def rep(m):
        q,u=m.group(1),m.group(2); d=datauri(u if u.startswith('/') else '/assets/'+u)
        return f'url({q}{d}{q})' if d else m.group(0)
    return re.sub(r'url\((["\']?)(/assets/[^)"\']+|fonts/[^)"\']+)\1\)',rep,text)
def build(lang):
    pages=sorted(glob.glob(os.path.join(ROOT,'et/**/index.html' if lang=='et' else '**/index.html'),recursive=True))
    if lang=='fi': pages=[p for p in pages if not os.path.relpath(p,ROOT).startswith(('et/','dist-preview','node_modules'))]
    shell=None; divs=[]
    for p in pages:
        rel=os.path.relpath(os.path.dirname(p),os.path.join(ROOT,'et' if lang=='et' else '')).replace('\\','/')
        slug='' if rel=='.' else rel
        h=open(p,encoding='utf-8').read()
        if 'noindex' in h and slug in ('kiitos','aitah'): pass
        m=re.search(r'<main id="main">([\s\S]*?)</main>',h)
        if not m: continue
        body=m.group(1).strip()
        body=re.sub(r'^<div class="page"',f'<div class="page" data-route="{slug}"',body,count=1)
        divs.append((slug,body))
        if slug=='': shell=h
    css=inline_urls(open(os.path.join(ROOT,'assets/fonts.css')).read())+'\n'+inline_urls(open(os.path.join(ROOT,'assets/site.css')).read())
    css+='\n'+open(os.path.join(ROOT,'assets/kartta.css'),encoding='utf-8').read()   # /verkko/ ja /vork/ (sivukohtainen tyylitiedosto)
    css+='\n.page[data-route]{display:none}.page[data-route].on{display:block}'
    js=open(os.path.join(ROOT,'assets/site.js')).read()
    head=shell[:shell.find('<body')]
    head=re.sub(r'<link[^>]+(preload|stylesheet|canonical|alternate)[^>]*>\n?','',head)
    head=head.replace('</head>',f'<style>{css}</style>\n</head>')
    head=re.sub(r'<title>[^<]*</title>',f'<title>SAMA Energia — {lang.upper()} {VER} (esikatselu)</title>',head)
    body_open=shell[shell.find('<body'):shell.find('<main id="main">')]
    foot=shell[shell.find('</main>')+7:shell.find('</body>')]
    foot=re.sub(r'<script>\(function\(\)\{var m=[\s\S]*?</script>','',foot)
    foot=re.sub(r'<script src="/assets/site.js"></script>','',foot)
    html=head+body_open+'<main id="main">\n'+'\n'.join(b for _,b in divs)+'\n</main>'+foot
    def href(m):
        u=m.group(1)
        if u.startswith(('http','mailto:','tel:','#','data:')): return m.group(0)
        u=re.sub(r'^/et(?=/)','',u)
        path,_,anc=u.partition('#'); slug=path.strip('/')
        return f'href="#/{slug}'+(f'::{anc}' if anc else '')+'"'
    html=re.sub(r'href="(/[^"]*)"',href,html)
    kartta=open(os.path.join(ROOT,'assets/kartta.json'),encoding='utf-8').read()
    kd=open(os.path.join(ROOT,'assets/kartta-data.json'),encoding='utf-8').read()
    kv=open(os.path.join(ROOT,'assets/kartta-verkko.json'),encoding='utf-8').read()
    ke=open(os.path.join(ROOT,'assets/kartta-etusivu.json'),encoding='utf-8').read()   # etusivun 3D-kartan 110 kV ja rantaviivat (scripts/kaart/etusivu_110.py)
    bundle=['']
    def inl(m):
        if not bundle[0]: bundle[0]='<script>window.SAMA_KARTTA='+kartta+';window.SAMA_KD='+kd+';window.SAMA_KV='+kv+';window.SAMA_KE='+ke+';</script><script>'+open(os.path.join(ROOT,m.group(1).lstrip('/')),encoding='utf-8').read().replace('</script','<\\/script')+'</script>'
        return ''
    html=re.sub(r'<script src="(/assets/scene(?:-et)?\.js)" defer></script>',inl,html)
    # kartta.js tekstinä sivun loppuun kerran (ei data:-osoitteena: tiedostonäkymät estävät data:-skriptit CSP:llä,
    # jolloin kartta ei käynnisty — havaittu 3.11.2026); järjestys kuten tuotannossa: scene.js ensin, sitten kartta.js
    kartta_js=('<script>'+open(os.path.join(ROOT,'assets/kartta.js'),encoding='utf-8').read().replace('</script','<\\/script')+'</script>') if 'data-kartta' in html else ''
    html=re.sub(r'<script src="/assets/kartta\.js" defer></script>\n?','',html)
    # paikan kortti (assets/kartta-paikka.js) ladataan sivulla vasta tarvittaessa; esikatselussa se upotetaan valmiiksi
    if 'km-geo' in html or 'kk-geo' in html:
        kartta_js+='<script>'+open(os.path.join(ROOT,'assets/kartta-paikka.js'),encoding='utf-8').read().replace('</script','<\\/script')+'</script>'
    # etusivu.js (v46) tekstinä kuten kartta.js; prosessivideo upotetaan (puhelinversio, mp4) ja juliste data-osoitteena
    if '/assets/etusivu.js' in html:
        kartta_js+='<script>'+open(os.path.join(ROOT,'assets/etusivu.js'),encoding='utf-8').read().replace('</script','<\\/script')+'</script>'
        html=re.sub(r'<script src="/assets/etusivu\.js" defer></script>\n?','',html)
    vids=[(k,os.path.join(ROOT,f'assets/k-proc-m.{k}')) for k in ('webm','mp4')]
    if all(os.path.exists(f) for _,f in vids):
        html=html.replace('data-base="/assets/k-proc"',' '.join(f'data-inline-{k}="data:video/{k};base64,'+base64.b64encode(open(f,'rb').read()).decode()+'"' for k,f in vids))
    html=re.sub(r'poster="(/assets/[^"]+)"',lambda m:f'poster="{datauri(m.group(1)) or m.group(1)}"',html)
    # vaiheiden pysäytyskuvat (varatila, jos esikatselu estää videon)
    html=re.sub(r'data-stills="([^"]+)"',lambda m:'data-stills="'+' '.join(datauri(x) or x for x in m.group(1).split())+'"',html)
    html=re.sub(r'(src|href)="(/assets/[^"]+)"',lambda m:f'{m.group(1)}="{datauri(m.group(2)) or m.group(2)}"',html)
    # <picture><source srcset>: upotetaan ensimmäinen ehdokas (muuten esikatselu näyttäisi img-varakuvan)
    def src_set(m):
        first=m.group(2).split(',')[0].strip().split(' ')
        d=datauri(first[0]) if first[0].startswith('/assets/') else None
        return f'{m.group(1)}srcset="{d}"' if d else m.group(0)
    html=re.sub(r'(<source\b[^>]*?)srcset="([^"]*)"',src_set,html)
    html=re.sub(r'(<img\b[^>]*?)\ssrcset="[^"]*"',r'\1',html)
    start=START.get(lang,'')
    router=(f"<script>if(!location.hash)history.replaceState(null,'','#{start}');</script>" if start else '')+'''<script>(function(){var cur=null;function go(){var h=location.hash||'#/';var anchor=null;
if(h.indexOf('#/')!==0){anchor=h.slice(1);h='#/'+(cur||'');}
var s=h.slice(2),k=s.indexOf('::');if(k>=0){anchor=s.slice(k+2);s=s.slice(0,k);}
s=s.replace(/\\/$/,'');var ps=document.querySelectorAll('.page[data-route]'),hit=null;
ps.forEach(function(p){if(p.getAttribute('data-route')===s)hit=p;});if(!hit){hit=document.querySelector('.page[data-route=""]');s='';}
if(cur!==s){ps.forEach(function(p){p.classList.toggle('on',p===hit);});cur=s;window.scrollTo(0,0);
document.querySelectorAll('.reveal').forEach(function(e){e.classList.add('in');});}
if(anchor){var el=document.getElementById(anchor);if(el)setTimeout(function(){el.scrollIntoView();},30);}}
window.addEventListener('hashchange',go);go();})();</script>'''
    kartta_json=''
    if 'data-kartta' in html:   # /verkko/-sivun kartta: data sivun sisään, koska esikatselutiedosto ei voi hakea tiedostoja
        for jid,f in (('kartta-pohja-json','assets/kartta-pohja.json'),('kartta-data-json','assets/kartta-data.json'),('kartta-110-json','assets/kartta-110.json'),('kartta-solmut-json','assets/kartta-solmut.json')):
            kartta_json+=f'<script type="application/json" id="{jid}">'+open(os.path.join(ROOT,f),encoding='utf-8').read().replace('</','<\\/')+'</script>\n'
    html=html.replace('</body>','') + router + kartta_json + f'<script>{js}</script>\n' + bundle[0] + kartta_js + '\n</body>\n</html>'
    out=os.path.join(OUT,f'samaenergia-{lang}-{VER}.standalone.html'); open(out,'w',encoding='utf-8').write(html)
    print(out, len(divs),'sivua', round(len(html)/1e6,2),'MB')
for l in ('fi','et'): build(l)
