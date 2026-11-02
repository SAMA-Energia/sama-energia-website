#!/usr/bin/env python3
"""SAMA Energia — standalone-esikatselu (v35, 02.11.2026).
Kokoaa generoidut sivut yhdeksi tiedostoksi per kieli: kaikki sivut, valikot ja linkit toimivat
hash-reitityksellä (#/slug), CSS, fontit, kuvat ja site.js upotettuina. Ei julkaista sivustolla.
Ajo: node scripts/build-pages.mjs && python3 scripts/build-standalone.py [versio]"""
import base64, os, re, sys, glob, mimetypes
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VER=sys.argv[1] if len(sys.argv)>1 else 'v35'
OUT=os.path.join(ROOT,'dist-preview'); os.makedirs(OUT,exist_ok=True)
MIME={'.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.woff2':'font/woff2'}
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
    html=re.sub(r'(src|href)="(/assets/[^"]+)"',lambda m:f'{m.group(1)}="{datauri(m.group(2)) or m.group(2)}"',html)
    html=re.sub(r'srcset="[^"]*"','',html)
    router='''<script>(function(){var cur=null;function go(){var h=location.hash||'#/';var anchor=null;
if(h.indexOf('#/')!==0){anchor=h.slice(1);h='#/'+(cur||'');}
var s=h.slice(2),k=s.indexOf('::');if(k>=0){anchor=s.slice(k+2);s=s.slice(0,k);}
s=s.replace(/\\/$/,'');var ps=document.querySelectorAll('.page[data-route]'),hit=null;
ps.forEach(function(p){if(p.getAttribute('data-route')===s)hit=p;});if(!hit){hit=document.querySelector('.page[data-route=""]');s='';}
if(cur!==s){ps.forEach(function(p){p.classList.toggle('on',p===hit);});cur=s;window.scrollTo(0,0);
document.querySelectorAll('.reveal').forEach(function(e){e.classList.add('in');});}
if(anchor){var el=document.getElementById(anchor);if(el)setTimeout(function(){el.scrollIntoView();},30);}}
window.addEventListener('hashchange',go);go();})();</script>'''
    html=html.replace('</body>','') + router + f'<script>{js}</script>\n</body>\n</html>'
    out=os.path.join(OUT,f'samaenergia-{lang}-{VER}.standalone.html'); open(out,'w',encoding='utf-8').write(html)
    print(out, len(divs),'sivua', round(len(html)/1e6,2),'MB')
for l in ('fi','et'): build(l)
