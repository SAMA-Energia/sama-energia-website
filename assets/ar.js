/* SAMA Energia — varastokaappi 3D:nä ja omalla pihalla oikeassa koossa (AR). Vain energiavarastosivulla (v49, 6.11.2026).
   Kuva näkyy ensin; model-viewer (Google, Apache-2.0, assets/vendor/) ladataan omalta palvelimelta vasta painikkeesta.
   AR: Android WebXR ja iPhone Quick Look; ei Scene Viewer -sovellusta eikä muita kolmansia osapuolia. Pakkausdekooderien
   osoitteet ohjataan omaan kansioon, jotta mikään ei hae ulkoa (malli ei niitä tarvitse). Malli: assets/3d/kaappi.glb. */
(function () {
  'use strict';
  var box = document.querySelector('[data-ar3d]');
  if (!box) return;
  var btn = box.querySelector('.ar3d-open'), fig = box.querySelector('.ar3d-fig'), img = fig && fig.querySelector('img');
  if (!btn || !fig || !img) return;
  var D = box.dataset;
  function load() {
    if (window.customElements && customElements.get('model-viewer')) return Promise.resolve();
    var own = '/assets/vendor/none/';
    window.ModelViewerElement = Object.assign(window.ModelViewerElement || {}, {
      dracoDecoderLocation: own, ktx2TranscoderLocation: own, lottieLoaderLocation: own + 'lottie.js'   // meshopt: ei asetusta (asetettuna se haetaan heti)
    });
    return new Promise(function (ok, no) {
      var s = document.createElement('script'); s.type = 'module'; s.src = D.mv;
      s.onload = function () { customElements.whenDefined('model-viewer').then(ok); }; s.onerror = no;
      document.head.appendChild(s);
    });
  }
  function glbUrl() {
    if (!D.glbInline) return D.glb;                         // esikatselutiedosto: malli upotettuna (blob)
    var b = atob(D.glbInline), u = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return URL.createObjectURL(new Blob([u], { type: 'model/gltf-binary' }));
  }
  btn.addEventListener('click', function () {
    btn.disabled = true; btn.setAttribute('aria-busy', 'true');
    load().then(function () {
      var mv = document.createElement('model-viewer'), a = {
        src: glbUrl(), alt: img.alt, poster: img.currentSrc || img.src, 'camera-controls': '', 'touch-action': 'pan-y',
        ar: '', 'ar-modes': 'webxr quick-look', 'ar-scale': 'fixed', 'ar-placement': 'floor',
        'camera-orbit': '-32deg 76deg auto', 'min-camera-orbit': 'auto 20deg auto', 'max-camera-orbit': 'auto 92deg auto',
        'interaction-prompt': 'none', 'shadow-intensity': '1', 'shadow-softness': '0.9', exposure: '0.88',
        'environment-image': 'neutral', 'tone-mapping': 'neutral'
      };
      for (var k in a) mv.setAttribute(k, a[k]);
      var arb = document.createElement('button');
      arb.slot = 'ar-button'; arb.type = 'button'; arb.className = 'btn btn-primary ar3d-arbtn'; arb.textContent = D.arLabel;
      mv.appendChild(arb);
      mv.addEventListener('load', function () { box.classList.add('is-ready'); }, { once: true });
      fig.replaceChild(mv, img);
      box.classList.add('is-3d');
      btn.hidden = true; btn.removeAttribute('aria-busy');
      var hint = box.querySelector('.ar3d-hint'); if (hint) hint.hidden = false;
    }).catch(function () { btn.disabled = false; btn.removeAttribute('aria-busy'); });
  });
})();
