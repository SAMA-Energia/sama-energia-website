/* SAMA Energia — 3D-kuvitusmoottori (v37, 02.11.2026). Pohja: perustajien suunnittelukankaan 6A-konseptit (isometriset kohdekuvitukset,
   kerroksittain purettu kantaverkko–kenno-näkymä, pistematriisikartta Suomi–Viro). Värit logon kultaan. Ladataan vain etusivulla. */
(function(){'use strict';
if(!document.querySelector('canvas.cv-hero,canvas.cv-ex,canvas.cv-proc,canvas.cv-sld,canvas.cv-map'))return;
var SAMA_BG='#0A0A09',SAMA_BGRGB='10,10,9';
window.SAMA_MAP_SITE=[0.492,0.846];
class DCLogic{constructor(p){this.props=p||{};this.state={};}setState(p){if(typeof p==='function')p=p(this.state);Object.assign(this.state,p||{});try{document.dispatchEvent(new CustomEvent('sama3d',{detail:this.state}));}catch(e){}}forceUpdate(){}}
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this._defStyle = 'realistinen';
    this._defScheme = 'yö';
    this.state = { board: true, vh: 860, s3: 5, hs: 1, hp: 0, paused: false, tab: 'y', ex: 1, hx: 1, hhl: 0, wb: false, fk: 'y', sent: false };
    this._p3 = 1;
    this._ht = 0;
    this._hov = false;
    this._pvis = false;
    this._pvOff = 0;
    this._HB = [0, 7, 15, 22, 29];
    this._HEND = 36;
    this._HLOOP = 37.4;
    this._HKEY = [6.2, 14.6, 21.4, 28.6, 33];
  }
  componentDidMount() {
    this._alive = true;
    try { this._rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { this._rm = false; }
    this._sync = () => this._measure();
    window.addEventListener('scroll', this._sync, { passive: true });
    window.addEventListener('resize', this._sync);
    this._t0 = performance.now();
    this._p2 = 0;
    if (window.SAMA_KARTTA) { this._map = window.SAMA_KARTTA; this._prepMap(); }
    else if (document.querySelector('.cv-map')) fetch('/assets/kartta.json').then((r) => r.json()).then((d) => { this._map = d; this._prepMap(); }).catch((e) => console.error(e));
    const loop = (t) => { if (!this._alive) return; this._raf = requestAnimationFrame(loop); try { this._frame(t); } catch (e) { console.error(e); } };
    this._raf = requestAnimationFrame(loop);
    this._measure();
  }
  componentWillUnmount() {
    this._alive = false;
    cancelAnimationFrame(this._raf);
    clearTimeout(this._hT); clearTimeout(this._xT);
    window.removeEventListener('scroll', this._sync);
    window.removeEventListener('resize', this._sync);
  }
  _isBoard() { return document.documentElement.hasAttribute('data-dc-canvas') || window.innerHeight > 1300; }
  _measure() {
    const board = this._isBoard();
    const vh = board ? 860 : Math.max(620, Math.min(window.innerHeight, 1100));
    let p3 = 1;
    if (!board) {
      const el = document.querySelector('.sc-s3');
      if (el) { const r = el.getBoundingClientRect(), run = r.height - vh; p3 = run > 0 ? Math.min(1, Math.max(0, -r.top / run)) : 0; }
    }
    this._p3 = p3;
    let p2 = 0;
    if (!board) { const el2 = document.querySelector('.sc-s2'); if (el2) { const r = el2.getBoundingClientRect(), run = r.height - vh; p2 = run > 0 ? Math.min(1, Math.max(0, -r.top / run)) : 0; } }
    this._p2 = p2;
    const grp = (name) => { const el = document.querySelector('.lv-g[data-scene="' + name + '"]'); if (!el) return null; const r = el.getBoundingClientRect(); return Math.min(1, Math.max(0, (vh * 0.5 - r.top) / r.height)); };
    const g2 = grp('map'); if (g2 !== null) this._p2 = g2;
    const g3 = grp('sld'); if (g3 !== null) this._p3 = g3;
    if (this._p3Lock !== undefined) this._p3 = this._p3Lock;
    const s = this.state, patch = {};
    if (s.board !== board) patch.board = board;
    if (s.vh !== vh) patch.vh = vh;
    if (Object.keys(patch).length) this.setState(patch);
  }
  _cyc(time, n, period, off) {
    const c = ((time + off) / period) % 1, st = Math.floor(c * n), loc = c * n - st;
    if (st === n - 1 || loc < 0.72) return (st + 0.5) / n;
    return (st + 0.5 + (loc - 0.72) / 0.28) / n;
  }
  _onScreen(sel) {
    const el = document.querySelector(sel);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.bottom > 80 && r.top < window.innerHeight - 80;
  }
  _frame(t) {
    const s = this.state;
    if (t - (this._lm || 0) > 500) { this._lm = t; this._measure(); }
    if (s.board && t - (this._lf || 0) < 66) return;
    const dt = Math.min(0.08, Math.max(0.001, (t - (this._lf || t - 16)) / 1000));
    this._lf = t;
    const time = this._rm ? 6 : (t - this._t0) / 1000;
    if (!s.board) {
      const pv = this._onScreen('.cv-proc'), now = performance.now();
      if (pv && !this._pvis && now - this._pvOff > 8000 && !s.paused) this._ht = 0;
      if (!pv && this._pvis) this._pvOff = now;
      this._pvis = pv;
    }
    if (this._rm) this._ht = 33;
    else if (s.board || (this._pvis && !(s.paused || this._hov))) this._ht = (this._ht + dt) % this._HLOOP;
    const B = this._HB, ht = this._ht;
    const hs = ht >= B[4] ? 5 : ht >= B[3] ? 4 : ht >= B[2] ? 3 : ht >= B[1] ? 2 : 1;
    const end = hs === 5 ? this._HEND : B[hs], st0 = B[hs - 1];
    const hp = Math.round(Math.min(1, (ht - st0) / (end - st0)) * 50) * 2;
    if (s.board && !this._exUser) {
      const k = Math.floor(time / 6) % 11;
      if (k < 6) { if (s.tab !== 'y' || s.ex !== k + 1) this._setArea('y', k + 1, false); }
      else if (s.tab !== 'k' || s.hx !== k - 5) this._setArea('k', k - 5, false);
    }
    const p3 = (s.board || window.SAMA_AUTO_SLD) ? (this._rm ? 0.9 : this._cyc(time, 5, 30, 9)) : this._p3;
    const s3 = Math.min(5, Math.floor(p3 * 5) + 1);
    const patch = {};
    if (hs !== s.hs) patch.hs = hs;
    if (hp !== s.hp) patch.hp = hp;
    if (s3 !== s.s3) patch.s3 = s3;
    const p2 = this._p2 || 0, s2 = Math.min(5, Math.floor(p2 * 5) + 1);
    if (s2 !== s.s2) patch.s2 = s2;
    if (s.board && !this._wUser) { const wb = this._rm ? true : Math.floor(time / 5) % 2 === 1; if (wb !== !!s.wb) patch.wb = wb; }
    else if (!s.board && !this._wUser && !this._wAuto && !this._rm) {
      if (this._onScreen('.cv-why')) { if (!this._wOn) this._wOn = t; else if (t - this._wOn > 1800) { this._wAuto = true; patch.wb = true; } }
      else this._wOn = 0;
    }
    if (Object.keys(patch).length) this.setState(patch);
    let c = this._cv('why'); if (c) this._whyDraw(c, dt);
    c = this._cv('hero'); if (c) this._hsDraw(c, time);
    c = this._cv('ex'); if (c) this._exDraw(c, time);
    c = this._cv('proc'); if (c) this._procDraw(c, ht, time);
    c = this._cv('sld'); if (c) this._sldDraw(c, time, p3);
    document.querySelectorAll('.cv-map').forEach((el) => { const cm = this._cvEl(el); if (cm) this._mapDraw(cm, time); });
  }
  _cv(k) {
    let el = this['_el' + k];
    if (!el || !el.isConnected) { el = document.querySelector('.cv-' + k); this['_el' + k] = el; }
    return this._cvEl(el);
  }
  _cvEl(el) {
    if (!el) return null;
    if (el.dataset.off === '1') return null;
    if (!this.state.board) { const r = el.getBoundingClientRect(); if (r.bottom < -40 || r.top > window.innerHeight + 40) return null; }
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return null;
    const dpr = this.state.board ? 1 : Math.min(2, window.devicePixelRatio || 1);
    const W = Math.round(w * dpr), H = Math.round(h * dpr);
    if (el.width !== W || el.height !== H) { el.width = W; el.height = H; }
    const g = el.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { g, w, h, el };
  }
  _exKey() { const s = this.state; return s.tab === 'k' ? 'k' + (s.hx || 1) : 'y' + (s.ex || 1); }
  _setArea(tab, i, user) {
    if (user) this._exUser = true;
    const s = this.state, prev = this._exKey(), patch = {};
    if (s.tab !== tab) patch.tab = tab;
    if (i) { if (tab === 'k' && s.hx !== i) patch.hx = i; if (tab === 'y' && s.ex !== i) patch.ex = i; }
    if (Object.keys(patch).length) { this._exPrevKey = prev; this._exF = performance.now(); this.setState(patch); }
  }
  _sm(v) { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); }
  /* ---------- Miksi se kannattaa: one illustrative week ---------- */
  _wD() {
    if (this._wdat) return this._wdat;
    const r = this._rng(4242), N = 672, L = new Float32Array(N), P = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const d = Math.floor(i / 96), hr = (i % 96) / 4, we = d >= 5;
      const on = we ? 0 : this._sm((hr - 5.5) / 1.5) * (1 - this._sm((hr - 20.5) / 1.5));
      const wk = we ? 0.05 * this._sm((hr - 8) / 2) * (1 - this._sm((hr - 15) / 2)) : 0;
      L[i] = 0.25 + wk + on * (0.35 + 0.03 * Math.sin(hr * 0.8 + d * 1.7)) + (r() - 0.5) * 0.03;
      P[i] = 0.34 + 0.2 * Math.exp(-Math.pow((hr - 8.5) / 1.7, 2)) + 0.28 * Math.exp(-Math.pow((hr - 18.5) / 2.1, 2)) - 0.17 * Math.exp(-Math.pow((hr - 3) / 2.4, 2)) - (we ? 0.07 : 0) + 0.04 * Math.sin(d * 2.3) + (r() - 0.5) * 0.05;
    }
    [[0, 7.25, 0.2, 0.7], [1, 13.5, 0.27, 0.9], [2, 9.25, 0.15, 0.55], [3, 14.25, 0.34, 1.0], [4, 7.5, 0.22, 0.75], [1, 17.75, 0.12, 0.5]].forEach((k) => {
      const c = k[0] * 96 + k[1] * 4, sd = 3.2 * k[3];
      for (let i = Math.max(0, Math.floor(c - 4 * sd)); i < Math.min(N, Math.ceil(c + 4 * sd)); i++) L[i] += k[2] * Math.exp(-Math.pow((i - c) / sd, 2));
    });
    { const c = 2 * 96 + 18.5 * 4; for (let i = 0; i < N; i++) P[i] += 0.45 * Math.exp(-Math.pow((i - c) / 3, 2)); }
    let lm = 0, pn = 1e9, px = -1e9;
    for (let i = 0; i < N; i++) { lm = Math.max(lm, L[i]); pn = Math.min(pn, P[i]); px = Math.max(px, P[i]); }
    let peak = 0;
    for (let i = 0; i < N; i++) { L[i] /= lm; P[i] = (P[i] - pn) / (px - pn); if (L[i] > L[peak]) peak = i; }
    const T = 0.72, R = 0.075, dis = new Float32Array(N), ch = new Float32Array(N);
    for (let i = 0; i < N; i++) dis[i] = Math.max(0, L[i] - T);
    let chMid = 0, chBest = 0;
    for (let d = 0; d < 7; d++) {
      let need = 0;
      for (let i = d * 96; i < d * 96 + 96; i++) need += dis[i];
      if (need <= 0) continue;
      need /= 0.9;
      const K = Math.max(2, Math.ceil(need / R)), a0 = Math.max(0, d * 96 - 16), a1 = d * 96 + 24 - K;
      let best = a0, bm = 1e9;
      for (let st = a0; st <= a1; st++) { let m = 0; for (let i = st; i < st + K; i++) m += P[i]; if (m < bm) { bm = m; best = st; } }
      const v = need / K;
      for (let i = best; i < best + K; i++) ch[i] = Math.min(v, Math.max(0, T - 0.06 - L[i]));
      if (need > chBest) { chBest = need; chMid = best + Math.floor(K / 2); }
    }
    this._wdat = { N, L, P, dis, ch, peak, chMid };
    return this._wdat;
  }
  _wBand(g, a, X, yA, yB) {
    const N = a.length; let i = 0;
    while (i < N) {
      if (a[i] <= 0) { i++; continue; }
      let j = i; while (j + 1 < N && a[j + 1] > 0) j++;
      const s0 = Math.max(0, i - 1), s1 = Math.min(N - 1, j + 1);
      g.beginPath();
      for (let k = s0; k <= s1; k++) g.lineTo(X(k), yA(k));
      for (let k = s1; k >= s0; k--) g.lineTo(X(k), yB(k));
      g.closePath(); g.fill();
      i = j + 1;
    }
  }
  _wLine(g, N, X, Y) { g.beginPath(); for (let i = 0; i < N; i++) { const x = X(i), y = Y(i); if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); }
  _whyDraw(c, dt) {
    const { g, w, h } = c, s = this.state, D = this._wD(), N = D.N;
    const tg = s.wb ? 1 : 0;
    if (this._wt === undefined || this._rm) this._wt = tg;
    else if (this._wt !== tg) this._wt = tg > this._wt ? Math.min(tg, this._wt + dt * 1.25) : Math.max(tg, this._wt - dt * 1.25);
    const sig = c.el.width + 'x' + c.el.height + ':' + w + 'x' + h + ':' + this._wt.toFixed(4);
    if (sig === this._wSig && c.el === this._wEl) return;
    this._wSig = sig; this._wEl = c.el;
    const t = this._sm(this._wt), small = w < 520, fs = small ? 9.5 : 10.5;
    g.clearRect(0, 0, w, h);
    const x0 = 1, x1 = w - 1, y0 = small ? 30 : 38, y1 = Math.round(h * (small ? 0.62 : 0.64)), yPl = y1 + (small ? 22 : 26), y2 = yPl + (small ? 8 : 10), y3 = h - (small ? 22 : 26);
    const X = (i) => x0 + (i / (N - 1)) * (x1 - x0), Y = (v) => y1 - v * (y1 - y0), YP = (v) => y3 - v * (y3 - y2);
    g.font = fs + 'px "IBM Plex Sans", sans-serif'; g.lineWidth = 1;
    for (let d = 0; d <= 7; d++) { const x = Math.round(X(Math.min(N - 1, d * 96))) + 0.5; g.strokeStyle = 'rgba(243,238,225,0.07)'; g.beginPath(); g.moveTo(x, y0 - 4); g.lineTo(x, y3); g.stroke(); }
    g.strokeStyle = 'rgba(243,238,225,0.2)';
    g.beginPath(); g.moveTo(x0, y1 + 0.5); g.lineTo(x1, y1 + 0.5); g.stroke();
    g.beginPath(); g.moveTo(x0, y3 + 0.5); g.lineTo(x1, y3 + 0.5); g.stroke();
    const days = ['MA', 'TI', 'KE', 'TO', 'PE', 'LA', 'SU'];
    g.fillStyle = '#827C71'; g.textAlign = 'center';
    for (let d = 0; d < 7; d++) g.fillText(days[d], X(d * 96 + 48), y3 + (small ? 15 : 18));
    g.textAlign = 'left'; g.fillStyle = '#A39C8E';
    const yt = y0 - (small ? 14 : 18);
    g.fillText('TARBIMINE', x0, yt);
    g.fillText('BÖRSIHIND', x0, yPl);
    g.fillStyle = '#827C71'; g.fillText('· HAVAINNOLLISTUS', x0 + g.measureText('TARBIMINE').width + 8, yt);
    const G = new Float32Array(N); let gm = 0;
    for (let i = 0; i < N; i++) { G[i] = D.L[i] - t * D.dis[i] + t * D.ch[i]; if (G[i] > gm) gm = G[i]; }
    if (t > 0.01) {
      g.fillStyle = 'rgba(91,208,141,' + (0.24 * t).toFixed(3) + ')';
      const bw = X(1) - X(0);
      for (let i = 0; i < N; i++) if (D.ch[i] > 0) g.fillRect(X(i) - bw / 2, y2, bw + 0.5, y3 - y2);
    }
    g.strokeStyle = 'rgba(207,200,184,0.6)'; g.lineWidth = 1;
    this._wLine(g, N, X, (i) => YP(D.P[i]));
    g.beginPath(); g.moveTo(X(0), y1); for (let i = 0; i < N; i++) g.lineTo(X(i), Y(G[i])); g.lineTo(X(N - 1), y1); g.closePath();
    g.fillStyle = 'rgba(243,238,225,0.055)'; g.fill();
    if (t > 0.01) {
      g.fillStyle = 'rgba(91,208,141,' + (0.82 * t).toFixed(3) + ')';
      this._wBand(g, D.dis, X, (i) => Y(D.L[i]), (i) => Y(G[i]));
      g.fillStyle = 'rgba(91,208,141,' + (0.34 * t).toFixed(3) + ')';
      this._wBand(g, D.ch, X, (i) => Y(G[i]), (i) => Y(D.L[i]));
      g.save(); g.setLineDash([2, 3]); g.strokeStyle = 'rgba(243,238,225,' + (0.3 * t).toFixed(3) + ')'; g.lineWidth = 1;
      this._wLine(g, N, X, (i) => Y(D.L[i])); g.restore();
    }
    g.strokeStyle = 'rgba(243,238,225,0.9)'; g.lineWidth = 1.25;
    this._wLine(g, N, X, (i) => Y(G[i]));
    const yo = Math.round(Y(1)) + 0.5, yn = Math.round(Y(gm)) + 0.5;
    if (t > 0.01) { g.save(); g.setLineDash([4, 5]); g.strokeStyle = 'rgba(212,181,116,' + (0.38 * t).toFixed(3) + ')'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, yo); g.lineTo(x1, yo); g.stroke(); g.restore(); }
    g.save(); g.setLineDash([7, 5]); g.strokeStyle = '#D4B574'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x0, yn); g.lineTo(x1, yn); g.stroke(); g.restore();
    g.fillStyle = '#D4B574'; g.textAlign = 'right'; g.fillText('ARVELDUSVÕIMSUS', x1, yn - 7);
    if (t > 0.05 && yn - yo > 12) {
      const ax = Math.round(x1 - (small ? 92 : 112)) + 0.5;
      g.globalAlpha = t; g.strokeStyle = '#D4B574'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(ax, yo + 3); g.lineTo(ax, yn - 3); g.stroke();
      g.beginPath(); g.moveTo(ax - 4, yn - 8); g.lineTo(ax, yn - 3); g.lineTo(ax + 4, yn - 8); g.stroke();
      g.globalAlpha = 1;
    }
    if (t > 0.05) {
      const cl = (x) => Math.max(x0 + 48, Math.min(x1 - 48, x));
      g.globalAlpha = t; g.fillStyle = '#5BD08D'; g.textAlign = 'center';
      g.fillText('AKU TÜHJENEB', cl(X(D.peak)), Y(1) - 7);
      const ic = D.chMid;
      g.fillText('AKU LAEB', cl(X(ic)), Math.min(y1 - 8, Y(D.L[ic]) + (small ? 16 : 20)));
      g.globalAlpha = 1;
    }
  }
  _rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  /* ---------- Section 3: illustrated exploded stack ---------- */
  _S() {
    if (this._scn) return this._scn;
    this._scn = {
      R: [[0.82, -0.47], [-0.47, 0.82], [0.84, -0.28], [-0.44, 0.2]], Rz: [0, 0, 0, 0.7],
      s400: [-1.25, 0.55], t400: [[-0.9, 0.55], [-0.58, 0.55]], H400: 0.5,
      g1: [-0.22, 0.55, 0.3], brk: [[-0.12, 0.46], [-0.12, 0.55], [-0.12, 0.64]], tr1: [-0.02, 0.43, 0.2, 0.67, 0.15],
      g2: [0.12, 0.32, 0.22], t110: [[0.12, -0.05], [0.12, -0.45]], H110: 0.3, g3: [0.45, -0.45, 0.2],
      tr2: [0.53, -0.55, 0.66, -0.35, 0.11], b0: [0.72, -0.6, 0.92, -0.33, 0.13],
      H1: 0.24, lA: [[0.82, -0.47], [0.82, -0.08], [0.82, 0.3]], lB: [[0.45, 0.3], [0.08, 0.3], [-0.29, 0.3], [-0.47, 0.3]],
      ptr: [0.45, -0.3], houses: [[0.16, -0.72, 0.3, -0.6], [0.5, -0.8, 0.64, -0.68], [0.6, -0.5, 0.74, -0.38]],
      k2: [-0.36, -0.22, -0.22, -0.08, 0.12], biz: [-0.6, -0.66, -0.3, -0.42, 0.13],
      bd: [-0.25, -0.8, 0.72, 0.25, 0.3], ki: [-0.64, 0.1, -0.42, 0.3, 0.15], me: [-0.56, 0.57, -0.44, 0.67, 0.11], bnd: 0.62,
      pad: [-0.74, -0.52, 0.66, 0.6], pcs: [0.3, -0.42, 0.56, -0.12, 0.26], cabs: [[-0.56, 0.06, -0.32, 0.34], [-0.24, 0.06, 0.0, 0.34], [0.08, 0.06, 0.32, 0.34]], cabH: 0.36, ems: [0.52, 0.38],
      rack: [-0.62, 0.02, -0.26, 0.38, 0.7], mod: [-0.1, 0.04, 0.26, 0.36, 0.34, 0.4], cell: [0.44, -0.08, 0.56, 0.4, 0.5]
    };
    return this._scn;
  }
  _patt(u, v, H, arm, sz) { return [-0.2, 0, 0.2].map((o) => arm === 'v' ? [u, v + o * sz, H - 0.07 * sz] : [u + o * sz, v, H - 0.07 * sz]); }
  _gatt(u, v, H, arm, hf) { return [-0.62, 0, 0.62].map((o) => arm === 'v' ? [u, v + o * hf, H - 0.065] : [u + o * hf, v, H - 0.065]); }
  _poatt(u, v, H, arm) { return [-0.065, 0, 0.065].map((o) => arm === 'v' ? [u, v + o, H + 0.012] : [u + o, v, H + 0.012]); }
  _trB(t, sz) { const u0 = t[0], v0 = t[1], u1 = t[2], v1 = t[3], H = t[4]; return { hv: [0.25, 0.5, 0.75].map((f) => [u0 + 0.075 * sz, v0 + (v1 - v0) * f, H + 0.13 * sz]), lv: [0.45, 0.65, 0.85].map((f) => [u0 + (u1 - u0) * f, v0 + 0.045 * sz, H + 0.075 * sz]) }; }
  _paths() {
    if (this._pth) return this._pth;
    const S = this._S(), sg = (p, s) => [p[0], p[1], p[2], s];
    const pa = (t, H, arm, sz) => this._patt(t[0], t[1], H, arm, sz)[1];
    const ga = (gg, arm, hf) => this._gatt(gg[0], gg[1], gg[2], arm, hf)[1];
    const po = (t, arm) => this._poatt(t[0], t[1], S.H1, arm)[1];
    const t1 = this._trB(S.tr1, 1), t2 = this._trB(S.tr2, 0.75);
    this._pth = [
      [{ n: [pa(S.s400, S.H400, 'v', 1), sg(pa(S.t400[0], S.H400, 'v', 1), 0.05), sg(pa(S.t400[1], S.H400, 'v', 1), 0.05), sg(ga(S.g1, 'v', 0.15), 0.05), [S.brk[1][0], S.brk[1][1], 0.13], t1.hv[1], t1.lv[1], ga(S.g2, 'u', 0.1), sg(pa(S.t110[0], S.H110, 'u', 0.6), 0.05), sg(pa(S.t110[1], S.H110, 'u', 0.6), 0.05), sg(ga(S.g3, 'v', 0.1), 0.05), t2.hv[1], t2.lv[1], [0.72, -0.47, 0.08], [0.82, -0.47, 0.06], [0.82, -0.47, 0]], c: 0, d: 0, gi: 1 }],
      [{ n: [[0.832, -0.47, 0], [0.832, -0.47, S.H1 - 0.03], po(S.lA[0], 'u'), sg(po(S.lA[1], 'u'), 0.04), sg(po(S.lA[2], 'u'), 0.04), sg(po(S.lB[0], 'v'), 0.04), sg(po(S.lB[1], 'v'), 0.04), sg(po(S.lB[2], 'v'), 0.04), sg(po(S.lB[3], 'v'), 0.04), [-0.47, 0.312, S.H1 - 0.03], [-0.47, 0.312, 0], [-0.47, 0.82, 0]], c: 0, d: 0, gi: 1 },
        { n: [po(S.lB[0], 'v'), sg(po(S.ptr, 'u'), 0.04), [S.ptr[0] + 0.03, S.ptr[1], 0.15]], c: 0, d: 0, w: 0.5 },
        { n: [[-0.29, 0.3, 0], [-0.29, -0.08, 0], [-0.45, -0.42, 0]], c: 0, d: 0, w: 0.5 }],
      [{ n: [[-0.47, 0.82, 0], [-0.5, 0.67, 0], [-0.5, 0.62, 0.06], [-0.5, 0.5, 0], [-0.53, 0.3, 0.04], [-0.53, 0.2, 0.04], [-0.42, 0.2, 0.04], [-0.32, 0.12, 0], [-0.25, 0.02, 0], [-0.17, 0.0, 0.1]], c: 0, d: 0, gi: 1 },
        { n: [[-0.17, -0.2, 0.2], [-0.17, -0.2, 0.25], [0.09, -0.2, 0.25], [0.4, -0.2, 0.25], [0.4, -0.29, 0.16]], c: 0, d: 0, w: 0.8 },
        { n: [[0.09, -0.2, 0.25], [0.09, -0.26, 0.12]], c: 0, d: 0, w: 0.8 },
        { n: [[0.09, -0.2, 0.25], [0.09, 0.035, 0.25], [0.09, 0.035, 0.07]], c: 0, d: 0, w: 0.8 },
        { n: [[-0.17, -0.28, 0.03], [-0.17, -0.28, 0.005], [0.72, -0.28, 0.005], [0.84, -0.28, 0]], c: 0, d: 1 },
        { n: [[0.05, -0.66, 0.34], [-0.22, -0.66, 0.31], [-0.235, -0.44, 0.2], [-0.2, -0.34, 0.15]], c: 1, d: 0, w: 0.5 }],
      [{ n: [[0.84, -0.28, 0], [0.84, -0.28, 0.02], [0.56, -0.28, 0.05]], c: 0, d: 1 },
        { n: [[0.43, -0.12, 0.04], [0.43, 0.46, 0.02], [-0.44, 0.46, 0.02]], c: 1, d: 1 },
        { n: [[0.2, 0.46, 0.02], [0.2, 0.34, 0.06]], c: 1, d: 1, w: 0.7 },
        { n: [[-0.12, 0.46, 0.02], [-0.12, 0.34, 0.06]], c: 1, d: 1, w: 0.7 },
        { n: [[-0.44, 0.46, 0.02], [-0.44, 0.34, 0.06]], c: 1, d: 1, w: 0.7 },
        { n: [[0.52, 0.38, 0.17], [0.52, 0.06, 0.2], [0.52, -0.12, 0.2]], c: 2 },
        { n: [[0.5, 0.38, 0.17], [0.32, 0.25, 0.3]], c: 2 }],
      [{ n: [[-0.44, 0.2, 0.7], [-0.44, 0.2, 0.37], [-0.26, 0.2, 0.37], [-0.1, 0.2, 0.37], [0.14, 0.2, 0.41], [0.44, 0.04, 0.53], [0.5, 0.02, 0.53]], c: 1, d: 1 }]
    ];
    return this._pth;
  }
  _kit(g, a, T, SC) {
    const self = this, K = { g, a, T };
    const A8 = a * 0.866, A5 = a * 0.5;
    K.P = (ox, oy) => (u, v, z) => [ox + (u - v) * A8, oy + (u + v) * A5 - (z || 0) * a];
    const C0 = (c, f, al) => 'rgba(' + Math.min(255, Math.round(c[0] * (f === undefined ? 1 : f))) + ',' + Math.min(255, Math.round(c[1] * (f === undefined ? 1 : f))) + ',' + Math.min(255, Math.round(c[2] * (f === undefined ? 1 : f))) + ',' + (al === undefined ? 1 : al) + ')';
    const lum = (c) => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
    const MAPS = {
      'metsä': (c) => { const L = lum(c); return [c[0] * 0.28 + L * 0.42, c[1] * 0.28 + L * 0.82, c[2] * 0.28 + L * 0.58]; },
      'pronssi': (c) => { const L = lum(c); return [L * 1.34, L * 0.98, L * 0.58]; },
      'pienoismalli': (c) => { const l2 = 118 + lum(c) * 0.62; return [l2 * 1.02 + c[0] * 0.04, l2 * 0.99 + c[1] * 0.04, l2 * 0.92 + c[2] * 0.04]; }
    };
    const map = T ? null : (MAPS[SC] || null), light = !T && SC === 'pienoismalli';
    const C = (c, f, al) => C0(map ? map(c) : c, f, al);
    K.C = C; K.C0 = C0; K.light = light;
    K.edge = light ? 'rgba(40,36,30,0.26)' : 'rgba(0,0,0,0.42)';
    K.shc = light ? 'rgba(40,34,24,0.22)' : 'rgba(0,0,0,0.34)';
    K.wc = (al) => light ? 'rgba(74,70,62,' + al + ')' : C([205, 205, 198], 1, al);
    const EG = 'rgba(212,181,116,0.8)', EB = 'rgba(243,238,225,0.42)', EN = 'rgba(91,208,141,0.8)', EF = 'rgba(243,238,225,0.24)';
    K.EG = EG; K.EB = EB; K.EN = EN; K.EF = EF;
    const M = {
      steel: [[120, 126, 130], EB], trafo: [[76, 88, 94], EG], conc: [[86, 84, 80], EF], cab: [[60, 65, 68], EN], pcs: [[66, 70, 74], EG],
      wall: [[64, 68, 71], EB], roof: [[44, 47, 49], EB], wood: [[100, 78, 56], EB], tree: [[34, 60, 44], EF], house: [[92, 80, 68], EB],
      hroof: [[62, 46, 42], EB], mach: [[74, 79, 82], EB], cell: [[98, 108, 118], EN], mod: [[70, 76, 82], EN], pcb: [[38, 100, 68], EN],
      cu: [[206, 160, 92], EG], dark: [[34, 35, 36], EB], sw: [[96, 100, 104], EG], kiosk: [[82, 86, 84], EG], ins: [[150, 160, 152], EB], bol: [[190, 160, 62], EB]
    };
    K.M = M;
    const path = (pts) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); };
    K.fill = (pts, col, stroke, lw) => { path(pts); g.closePath(); if (col) { g.fillStyle = col; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 1; g.stroke(); } };
    K.ln = (pts, col, lw, dash) => { path(pts); g.strokeStyle = col; g.lineWidth = lw || 1; if (dash) g.setLineDash(dash); g.stroke(); if (dash) g.setLineDash([]); };
    K.dot = (p, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(p[0], p[1], r, 0, Math.PI * 2); g.fill(); };
    K.face = (pts, m, side) => {
      const mm = M[m] || M.dark;
      if (T) { K.fill(pts, side === 't' ? '#1C1B17' : (side === 'l' ? '#15140F' : '#0F0E0B'), mm[1], 1); return; }
      const f = side === 't' ? 1 : (side === 'l' ? 0.74 : 0.52), CC = (m === 'cu' || m === 'bol') ? C0 : C;
      let fs;
      if (side === 't') fs = CC(mm[0], f);
      else { let y0 = 1e9, y1 = -1e9; pts.forEach((q) => { if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; }); fs = g.createLinearGradient(0, y0, 0, y1 + 0.01); fs.addColorStop(0, CC(mm[0], f * 1.14)); fs.addColorStop(1, CC(mm[0], f * 0.72)); }
      K.fill(pts, fs, K.edge, 0.7);
      if (side === 't' && pts.length === 4) K.ln([pts[1], pts[2], pts[3]], 'rgba(255,255,255,0.08)', 1);
    };
    K.box = (P, u0, v0, u1, v1, z0, z1, m, noTop) => {
      const t = [P(u0, v0, z1), P(u1, v0, z1), P(u1, v1, z1), P(u0, v1, z1)];
      const b = [P(u0, v0, z0), P(u1, v0, z0), P(u1, v1, z0), P(u0, v1, z0)];
      K.face([b[1], b[2], t[2], t[1]], m, 'r');
      K.face([b[2], b[3], t[3], t[2]], m, 'l');
      if (!noTop) K.face(t, m, 't');
      return {
        fu: (s, q) => P(u1, v0 + s * (v1 - v0), z0 + q * (z1 - z0)),
        fv: (s, q) => P(u0 + s * (u1 - u0), v1, z0 + q * (z1 - z0)),
        ft: (s, q) => P(u0 + s * (u1 - u0), v0 + q * (v1 - v0), z1)
      };
    };
    K.quad = (F, s0, q0, s1, q1, fill, stroke, lw) => K.fill([F(s0, q0), F(s1, q0), F(s1, q1), F(s0, q1)], fill, stroke, lw);
    K.cyl = (P, u, v, r, z0, z1, m, edge) => {
      const b = P(u, v, z0), t = P(u, v, z1), rx = r * a * 1.2247, ry = r * a * 0.7071, mm = M[m] || M.dark, CC = (m === 'cu' || m === 'bol') ? C0 : C;
      g.beginPath(); g.moveTo(t[0] - rx, t[1]); g.lineTo(b[0] - rx, b[1]); g.ellipse(b[0], b[1], rx, ry, 0, Math.PI, 0, true); g.lineTo(t[0] + rx, t[1]); g.closePath();
      if (T) { g.fillStyle = '#12110E'; g.fill(); g.strokeStyle = edge || mm[1]; g.lineWidth = 1; g.stroke(); }
      else { const gr = g.createLinearGradient(t[0] - rx, 0, t[0] + rx, 0); gr.addColorStop(0, CC(mm[0], 0.6)); gr.addColorStop(0.35, CC(mm[0], 1.08)); gr.addColorStop(1, CC(mm[0], 0.4)); g.fillStyle = gr; g.fill(); g.strokeStyle = K.edge; g.lineWidth = 0.6; g.stroke(); }
      g.beginPath(); g.ellipse(t[0], t[1], rx, ry, 0, 0, Math.PI * 2);
      if (T) { g.fillStyle = '#1C1B17'; g.fill(); g.strokeStyle = edge || mm[1]; g.lineWidth = 1; g.stroke(); } else { g.fillStyle = CC(mm[0], 1.12); g.fill(); g.strokeStyle = K.edge; g.lineWidth = 0.6; g.stroke(); }
      return t;
    };
    K.lat = (A0, A1, B0, B1, n, col, lw) => {
      const L = (p, q, s) => [p[0] + (q[0] - p[0]) * s, p[1] + (q[1] - p[1]) * s];
      g.beginPath(); g.moveTo(A0[0], A0[1]); g.lineTo(A1[0], A1[1]); g.moveTo(B0[0], B0[1]); g.lineTo(B1[0], B1[1]);
      for (let i = 0; i < n; i++) { const p = L(A0, A1, i / n), q = L(B0, B1, (i + 0.5) / n), r = L(A0, A1, (i + 1) / n); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.lineTo(r[0], r[1]); }
      g.strokeStyle = col; g.lineWidth = lw || 1; g.stroke();
    };
    K.wireW = (P, A, B, sag, col, lw) => { const p1 = P(A[0], A[1], A[2]), p2 = P(B[0], B[1], B[2]), ch = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]); g.beginPath(); g.moveTo(p1[0], p1[1]); g.quadraticCurveTo((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2 + 2 * sag * ch, p2[0], p2[1]); g.strokeStyle = col; g.lineWidth = lw || 1; g.stroke(); };
    const hull = (pts) => {
      const p = pts.slice().sort((A, B) => A[0] - B[0] || A[1] - B[1]), cr = (O, A, B) => (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]), lo = [], up = [];
      for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
      for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
      up.pop(); lo.pop(); return lo.concat(up);
    };
    K.shadow = (P, u0, v0, u1, v1, z, zb) => {
      if (T) return;
      const sx = 0.55 * z, sy = -0.12 * z, b = zb || 0, pts = [];
      [[u0, v0], [u1, v0], [u1, v1], [u0, v1]].forEach((q) => { pts.push(P(q[0], q[1], b)); pts.push(P(q[0] + sx, q[1] + sy, b)); });
      K.fill(hull(pts), K.shc);
    };
    K.shadowF = (P, u0, v0, u1, v1, z) => {
      if (T) return;
      const sx = 0.55 * z, sy = -0.12 * z;
      K.fill([P(u0 + sx, v0 + sy, 0), P(u1 + sx, v0 + sy, 0), P(u1 + sx, v1 + sy, 0), P(u0 + sx, v1 + sy, 0)], K.shc);
    };
    K.patch = (P, u0, v0, u1, v1, rgb) => { const pts = [P(u0, v0, 0), P(u1, v0, 0), P(u1, v1, 0), P(u0, v1, 0)]; K.fill(pts, T ? 'rgba(243,238,225,0.025)' : C(rgb, 1)); };
    K.slab = (P, k) => {
      const c = [P(-1, -1, 0), P(1, -1, 0), P(1, 1, 0), P(-1, 1, 0)];
      if (T) {
        K.fill(c, 'rgba(243,238,225,0.035)', 'rgba(243,238,225,0.22)', 1);
        for (let q = -0.5; q <= 0.51; q += 0.5) { K.ln([P(q, -1, 0), P(q, 1, 0)], 'rgba(243,238,225,0.05)', 1); K.ln([P(-1, q, 0), P(1, q, 0)], 'rgba(243,238,225,0.05)', 1); }
        return;
      }
      const th = 0.07, gc = [[44, 50, 42], [40, 49, 40], [44, 45, 47], [62, 60, 56], [36, 38, 42]][k];
      K.fill([P(1, -1, 0), P(1, 1, 0), P(1, 1, -th), P(1, -1, -th)], C(gc, 0.45));
      K.fill([P(1, 1, 0), P(-1, 1, 0), P(-1, 1, -th), P(1, 1, -th)], C(gc, 0.64));
      K.fill(c, C(gc, 1));
      const rnd = self._rng(k * 31 + 7);
      for (let i = 0; i < 900; i++) { const uu = rnd() * 2 - 1, vv = rnd() * 2 - 1, s = P(uu, vv, 0); g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.14)'; g.fillRect(s[0], s[1], 1.4, 1.4); }
      if (k === 4) for (let q = -0.75; q <= 0.76; q += 0.25) { K.ln([P(q, -1, 0), P(q, 1, 0)], 'rgba(255,255,255,0.035)', 1); K.ln([P(-1, q, 0), P(1, q, 0)], 'rgba(255,255,255,0.035)', 1); }
      K.ln([P(-1, 1, 0), P(-1, -1, 0), P(1, -1, 0)], 'rgba(255,255,255,0.07)', 1);
    };
    K.stc = T ? 'rgba(243,238,225,0.6)' : (light ? 'rgba(96,92,84,0.9)' : C([158, 164, 168], 1, 0.95));
    K.insc = T ? 'rgba(243,238,225,0.55)' : (light ? 'rgba(124,118,108,0.95)' : C([176, 192, 186], 1, 0.95));
    K.portal = (P, u, v, H, arm, sz) => {
      const Q = arm === 'v' ? (s, z, d) => P(u + (d || 0), v + s, z) : (s, z, d) => P(u + s, v + (d || 0), z);
      const thin = T ? 'rgba(243,238,225,0.28)' : (light ? 'rgba(96,92,84,0.45)' : C([158, 164, 168], 1, 0.5)), sb = 0.06 * sz, stp = 0.1 * sz, arm2 = 0.25 * sz, dd = 0.016 * sz;
      if (!T) { const b = P(u, v, 0), e = P(u + 0.55 * H, v - 0.12 * H, 0); K.ln([b, e], K.shc, 3); }
      [-1, 1].forEach((sgn) => [-1, 1].forEach((dg) => K.ln([Q(sgn * stp, H * 0.92), Q(sgn * (stp + 0.1 * sz), 0, dg * 0.17 * sz)], thin, 0.6)));
      [-1, 1].forEach((sgn) => K.lat(Q(sgn * sb, 0, -dd), Q(sgn * stp, H, -dd), Q(sgn * sb, 0, dd), Q(sgn * stp, H, dd), 8, K.stc, 0.9));
      K.lat(Q(-arm2, H), Q(arm2, H), Q(-arm2 * 0.9, H + 0.036 * sz), Q(arm2 * 0.9, H + 0.036 * sz), 12, K.stc, 0.9);
      [-1, 1].forEach((sgn) => K.ln([Q(sgn * stp, H + 0.036 * sz), Q(sgn * 0.11 * sz, H + 0.075 * sz)], K.stc, 1));
      [-0.2, 0, 0.2].forEach((o) => K.ln([Q(o * sz, H), Q(o * sz, H - 0.07 * sz)], K.insc, 1.8));
    };
    K.gantry = (P, u, v, H, arm, hf) => {
      const Q = arm === 'v' ? (s, z, d) => P(u + (d || 0), v + s, z) : (s, z, d) => P(u + s, v + (d || 0), z), dd = 0.013;
      [-1, 1].forEach((sgn) => K.lat(Q(sgn * hf, 0, -dd), Q(sgn * hf, H, -dd), Q(sgn * hf, 0, dd), Q(sgn * hf, H, dd), 6, K.stc, 0.9));
      K.lat(Q(-hf, H), Q(hf, H), Q(-hf, H - 0.03), Q(hf, H - 0.03), 8, K.stc, 0.9);
      [-0.62, 0, 0.62].forEach((o) => K.ln([Q(o * hf, H - 0.03), Q(o * hf, H - 0.065)], K.insc, 1.6));
    };
    K.bush = (P, u, v, z0, len) => {
      K.cyl(P, u, v, 0.008, z0, z0 + len, 'ins');
      const n = Math.max(2, Math.round(len / 0.022)), rx = 0.016 * a * 1.2247, ry = 0.016 * a * 0.7071;
      g.strokeStyle = K.insc; g.lineWidth = 0.8;
      for (let i = 0; i < n; i++) { const c = P(u, v, z0 + (i + 0.6) * len / n); g.beginPath(); g.ellipse(c[0], c[1], rx, ry, 0, 0, Math.PI * 2); g.stroke(); }
      K.dot(P(u, v, z0 + len), 1.7, T ? '#D4B574' : '#C7A45C');
    };
    K.breaker = (P, u, v) => { K.box(P, u - 0.016, v - 0.016, u + 0.016, v + 0.016, 0, 0.05, 'steel'); K.cyl(P, u, v, 0.009, 0.05, 0.12, 'ins'); K.cyl(P, u, v, 0.014, 0.12, 0.13, 'steel'); };
    K.trafo = (P, t, sz) => {
      const u0 = t[0], v0 = t[1], u1 = t[2], v1 = t[3], H = t[4], B5 = self._trB(t, sz);
      K.shadow(P, u0, v0, u1 + 0.05 * sz, v1, H + 0.08 * sz);
      const B = K.box(P, u0, v0, u1, v1, 0, H, 'trafo');
      const rc = T ? 'rgba(212,181,116,0.3)' : 'rgba(0,0,0,0.3)';
      for (let i = 1; i < 6; i++) K.ln([B.fv(i / 6, 0.06), B.fv(i / 6, 0.94)], rc, 1);
      const R = K.box(P, u1, v0 + 0.04 * sz, u1 + 0.05 * sz, v1 - 0.04 * sz, 0.02 * sz, H - 0.025 * sz, 'trafo');
      for (let i = 1; i < 12; i++) K.ln([R.fu(i / 12, 0.04), R.fu(i / 12, 0.96)], rc, 1);
      const cz = H + 0.05 * sz;
      [0.2, 0.8].forEach((f) => K.ln([P(u0 + 0.03 * sz, v0 + (v1 - v0) * f, H), P(u0 + 0.03 * sz, v0 + (v1 - v0) * f, cz)], T ? EB : C([90, 100, 105]), 1.4));
      K.box(P, u0 + 0.006, v0 + 0.035 * sz, u0 + 0.055 * sz, v1 - 0.035 * sz, cz, cz + 0.045 * sz, 'trafo');
      B5.lv.forEach((l5) => K.bush(P, l5[0], l5[1], H, l5[2] - H));
      B5.hv.forEach((h5) => K.bush(P, h5[0], h5[1], H, h5[2] - H));
      return B5;
    };
    K.tree = (P, u, v, s) => {
      const b = P(u, v, 0), hgt = 0.2 * s * a, wid = 0.072 * s * a;
      if (!T) { g.fillStyle = K.shc; g.beginPath(); g.ellipse(b[0] + wid * 1.1, b[1] + 1, wid * 1.3, wid * 0.42, 0, 0, Math.PI * 2); g.fill(); }
      K.ln([b, [b[0], b[1] - hgt * 0.3]], T ? EF : C([84, 62, 46], 1, 0.95), 1.4);
      for (let i = 0; i < 3; i++) {
        const y0 = b[1] - hgt * (0.16 + i * 0.25), y1 = y0 - hgt * 0.44, ww = wid * (1 - i * 0.25);
        if (T) K.fill([[b[0] - ww, y0], [b[0] + ww, y0], [b[0], y1]], '#100F0C', EF, 1);
        else { K.fill([[b[0] - ww, y0], [b[0] + ww, y0], [b[0], y1]], C(M.tree[0], 0.7)); K.fill([[b[0] - ww, y0], [b[0] + ww * 0.05, y0 + ww * 0.1], [b[0], y1]], C(M.tree[0], 1.18)); }
      }
    };
    K.house = (P, u0, v0, u1, v1, H, rh) => {
      K.shadow(P, u0, v0, u1, v1, H + rh * 0.6);
      const B = K.box(P, u0, v0, u1, v1, 0, H, 'house', true), vm = (v0 + v1) / 2;
      K.face([P(u1, v0, H), P(u1, v1, H), P(u1, vm, H + rh)], 'house', 'r');
      K.face([P(u0, v0, H), P(u1, v0, H), P(u1, vm, H + rh), P(u0, vm, H + rh)], 'hroof', 'r');
      K.face([P(u0, v1, H), P(u1, v1, H), P(u1, vm, H + rh), P(u0, vm, H + rh)], 'hroof', 't');
      K.quad(B.fv, 0.2, 0.35, 0.42, 0.72, T ? 'rgba(212,181,116,0.16)' : 'rgba(232,209,147,0.5)', null);
      K.quad(B.fv, 0.58, 0.35, 0.8, 0.72, T ? 'rgba(212,181,116,0.16)' : 'rgba(232,209,147,0.42)', null);
      return B;
    };
    K.kiosk = (P, u0, v0, u1, v1, H) => {
      K.shadow(P, u0, v0, u1, v1, H);
      const B = K.box(P, u0, v0, u1, v1, 0, H, 'kiosk');
      K.box(P, u0 - 0.01, v0 - 0.01, u1 + 0.01, v1 + 0.01, H, H + 0.014, 'roof');
      const dc = T ? 'rgba(212,181,116,0.45)' : 'rgba(0,0,0,0.5)';
      K.quad(B.fv, 0.08, 0.05, 0.48, 0.9, null, dc); K.quad(B.fv, 0.52, 0.05, 0.92, 0.9, null, dc);
      const ws = B.fv(0.28, 0.66); K.fill([[ws[0] - 3.2, ws[1] + 2.6], [ws[0] + 3.2, ws[1] + 2.6], [ws[0], ws[1] - 3]], '#D4B574');
      for (let i = 0; i < 5; i++) K.ln([B.fu(0.2, 0.3 + i * 0.1), B.fu(0.8, 0.3 + i * 0.1)], dc, 0.8);
      return B;
    };
    K.pole = (P, u, v, H, arm, term) => {
      const Q = arm === 'v' ? (s, z) => P(u, v + s, z) : (s, z) => P(u + s, v, z);
      if (!T) K.ln([P(u, v, 0), P(u + 0.55 * H, v - 0.12 * H, 0)], 'rgba(0,0,0,0.32)', 2);
      K.cyl(P, u, v, 0.009, 0, H, 'wood');
      K.ln([Q(-0.085, H - 0.02), Q(0.085, H - 0.02)], T ? EB : C(M.wood[0], 0.85), 2.4);
      [-0.065, 0, 0.065].forEach((o) => K.ln([Q(o, H - 0.02), Q(o, H + 0.012)], K.insc, 2));
      if (term) { K.ln([Q(0.012, H - 0.03), Q(0.012, 0)], T ? EG : 'rgba(30,30,30,1)', 1.8); K.dot(Q(0.012, H - 0.03), 1.8, T ? '#D4B574' : '#999'); }
    };
    K.fence = (P, u0, v0, u1, v1, hh) => {
      const col = T ? 'rgba(243,238,225,0.2)' : 'rgba(160,160,152,0.3)';
      [[[u0, v0], [u1, v0]], [[u0, v0], [u0, v1]], [[u1, v0], [u1, v1]], [[u0, v1], [u1, v1]]].forEach((sd) => {
        const A = sd[0], B = sd[1];
        K.ln([P(A[0], A[1], hh), P(B[0], B[1], hh)], col, 0.8);
        const L = Math.hypot(B[0] - A[0], B[1] - A[1]), n = Math.max(2, Math.round(L / 0.06));
        for (let i = 0; i <= n; i++) { const uu = A[0] + (B[0] - A[0]) * i / n, vv = A[1] + (B[1] - A[1]) * i / n; K.ln([P(uu, vv, 0), P(uu, vv, hh)], col, 0.7); }
      });
    };
    K.pathW = (P, nodes) => {
      const pa = new Path2D(); let prev = null;
      nodes.forEach((n, i) => {
        const s = P(n[0], n[1], n[2]);
        if (i === 0) pa.moveTo(s[0], s[1]);
        else if (n[3]) pa.quadraticCurveTo((prev[0] + s[0]) / 2, (prev[1] + s[1]) / 2 + 2 * n[3] * Math.hypot(s[0] - prev[0], s[1] - prev[1]), s[0], s[1]);
        else pa.lineTo(s[0], s[1]);
        prev = s;
      });
      return pa;
    };
    K.flow = (pa, green, dir, time, inten, core, onDark) => {
      const rgb = green ? '91,208,141' : '212,181,116', lt = light && !onDark;
      g.save();
      g.globalCompositeOperation = lt ? 'source-over' : 'lighter';
      g.strokeStyle = 'rgba(' + rgb + ',' + ((lt ? 0.34 : 0.14) * inten).toFixed(3) + ')'; g.lineWidth = 7; g.stroke(pa);
      g.globalCompositeOperation = 'source-over';
      if (core) { g.strokeStyle = 'rgba(' + rgb + ',0.85)'; g.lineWidth = 1.4; g.stroke(pa); }
      g.setLineDash([2, 13]); g.lineDashOffset = -dir * time * 24;
      if (lt) g.strokeStyle = (green ? 'rgba(20,112,62,' : 'rgba(132,92,14,') + (0.45 + 0.55 * inten).toFixed(3) + ')';
      else g.strokeStyle = (green ? 'rgba(170,248,200,' : 'rgba(255,244,214,') + (0.35 + 0.6 * inten).toFixed(3) + ')';
      g.lineWidth = lt ? 2.7 : 2.4; g.stroke(pa);
      g.restore();
    };
    return K;
  }
  _plateCache(k, a, T, res, SC) {
    const key = k + '|' + a.toFixed(1) + '|' + (T ? 't' : 'r') + '|' + res.toFixed(2) + '|' + SC;
    this._pcache = this._pcache || {};
    const old = this._pcache[k];
    if (old && old.key === key) return old;
    const cw = 3.8 * a, ch = 3.05 * a, ox = 1.9 * a, oy = 1.85 * a;
    const cv = (old && old.cv) || document.createElement('canvas');
    cv.width = Math.ceil(cw * res); cv.height = Math.ceil(ch * res);
    const g2 = cv.getContext('2d');
    g2.setTransform(res, 0, 0, res, 0, 0);
    g2.clearRect(0, 0, cw, ch);
    g2.lineCap = 'round'; g2.lineJoin = 'round';
    const K2 = this._kit(g2, a, T, SC), P = K2.P(ox, oy), S = this._S();
    K2.slab(P, k);
    if (k === 0) this._pl0(K2, P, S); else if (k === 1) this._pl1(K2, P, S); else if (k === 2) this._pl2(K2, P, S); else if (k === 3) this._pl3(K2, P, S); else this._pl4(K2, P, S);
    const o = { key, cv, w: cw, h: ch, ox, oy };
    this._pcache[k] = o;
    return o;
  }
  _pl0(K, P, S) {
    const q = [], add = (d, f) => q.push([d, f]);
    K.patch(P, -0.3, 0.28, 0.3, 0.8, [76, 74, 68]);
    K.patch(P, 0.38, -0.68, 0.96, -0.26, [76, 74, 68]);
    K.fence(P, -0.3, 0.28, 0.3, 0.8, 0.045);
    K.fence(P, 0.38, -0.68, 0.96, -0.26, 0.045);
    [[-0.62, -0.42, 1], [-0.8, -0.14, 0.85], [-0.42, -0.72, 0.95], [-0.24, -0.36, 0.8], [-0.55, -0.1, 0.7], [0.04, -0.86, 0.85], [-0.12, -0.64, 0.75], [-0.88, -0.5, 0.8]].forEach((t) => add(t[0] + t[1], () => K.tree(P, t[0], t[1], t[2])));
    S.t400.forEach((t) => add(t[0] + t[1], () => K.portal(P, t[0], t[1], S.H400, 'v', 1)));
    S.t110.forEach((t) => add(t[0] + t[1], () => K.portal(P, t[0], t[1], S.H110, 'u', 0.6)));
    add(S.g3[0] + S.g3[1], () => K.gantry(P, S.g3[0], S.g3[1], S.g3[2], 'v', 0.1));
    add(0.145, () => K.trafo(P, S.tr2, 0.75));
    add(0.355, () => {
      const b = S.b0, u0 = b[0], v0 = b[1], u1 = b[2], v1 = b[3], H = b[4];
      K.shadow(P, u0, v0, u1, v1, H);
      const B = K.box(P, u0, v0, u1, v1, 0, H, 'wall');
      K.box(P, u0 - 0.012, v0 - 0.012, u1 + 0.012, v1 + 0.012, H, H + 0.014, 'roof');
      const dc = K.T ? 'rgba(243,238,225,0.35)' : 'rgba(0,0,0,0.5)';
      K.quad(B.fv, 0.3, 0.0, 0.48, 0.62, K.T ? null : 'rgba(20,20,20,0.6)', dc);
      for (let i = 0; i < 4; i++) K.ln([B.fu(0.15, 0.4 + i * 0.12), B.fu(0.55, 0.4 + i * 0.12)], dc, 0.8);
    });
    add(S.g1[0] + S.g1[1], () => K.gantry(P, S.g1[0], S.g1[1], S.g1[2], 'v', 0.15));
    S.brk.forEach((b) => add(b[0] + b[1], () => K.breaker(P, b[0], b[1])));
    add(S.g2[0] + S.g2[1], () => K.gantry(P, S.g2[0], S.g2[1], S.g2[2], 'u', 0.1));
    add(0.64, () => K.trafo(P, S.tr1, 1));
    q.sort((x, y) => x[0] - y[0]).forEach((e) => e[1]());
    const T = K.T, cw = T ? 'rgba(212,181,116,0.6)' : K.wc(0.6), cf = T ? 'rgba(212,181,116,0.2)' : K.wc(0.2), ew = T ? 'rgba(243,238,225,0.2)' : K.wc(0.3);
    const A = (t, H, arm, sz) => this._patt(t[0], t[1], H, arm, sz), Gt = (gg, arm, hf) => this._gatt(gg[0], gg[1], gg[2], arm, hf);
    const t1 = this._trB(S.tr1, 1), t2 = this._trB(S.tr2, 0.75);
    const c400 = [A(S.s400, S.H400, 'v', 1), A(S.t400[0], S.H400, 'v', 1), A(S.t400[1], S.H400, 'v', 1), Gt(S.g1, 'v', 0.15)];
    const g2a = Gt(S.g2, 'u', 0.1), c110 = [g2a, A(S.t110[0], S.H110, 'u', 0.6), A(S.t110[1], S.H110, 'u', 0.6), Gt(S.g3, 'v', 0.1)];
    for (let i = 0; i < 3; i++) {
      for (let j = 1; j < c400.length; j++) K.wireW(P, c400[j - 1][i], c400[j][i], 0.05, j === 1 ? cf : cw, 1);
      for (let j = 1; j < c110.length; j++) K.wireW(P, c110[j - 1][i], c110[j][i], 0.05, cw, 1);
      K.ln([P(c400[3][i][0], c400[3][i][1], c400[3][i][2]), P(S.brk[i][0], S.brk[i][1], 0.13), P(t1.hv[i][0], t1.hv[i][1], t1.hv[i][2])], cw, 1);
      K.ln([P(t1.lv[i][0], t1.lv[i][1], t1.lv[i][2]), P(g2a[i][0], g2a[i][1], g2a[i][2])], cw, 1);
      K.ln([P(c110[3][i][0], c110[3][i][1], c110[3][i][2]), P(t2.hv[i][0], t2.hv[i][1], t2.hv[i][2])], cw, 1);
      K.ln([P(t2.lv[i][0], t2.lv[i][1], t2.lv[i][2]), P(0.72, -0.47 + (i - 1) * 0.03, 0.08)], cw, 1);
    }
    const pk = (t, H, sz) => [-1, 1].map((sgn) => [t[0], t[1] + sgn * 0.11 * sz, H + 0.075 * sz]);
    const e4 = [pk(S.s400, S.H400, 1), pk(S.t400[0], S.H400, 1), pk(S.t400[1], S.H400, 1)];
    for (let i = 0; i < 2; i++) for (let j = 1; j < e4.length; j++) K.wireW(P, e4[j - 1][i], e4[j][i], 0.035, ew, 0.7);
  }
  _pl1(K, P, S) {
    const T = K.T, q = [], add = (d, f) => q.push([d, f]);
    K.patch(P, -1, 0.4, 1, 0.5, [62, 60, 56]);
    if (T) { K.ln([P(-1, 0.4, 0), P(1, 0.4, 0)], K.EF, 0.8); K.ln([P(-1, 0.5, 0), P(1, 0.5, 0)], K.EF, 0.8); }
    else K.ln([P(-1, 0.45, 0), P(1, 0.45, 0)], 'rgba(210,200,170,0.2)', 1, [6, 8]);
    const uc = T ? 'rgba(212,181,116,0.45)' : 'rgba(212,181,116,0.35)';
    K.ln([P(-0.47, 0.312, 0), P(-0.47, 0.82, 0)], uc, 1.2, [4, 4]);
    K.ln([P(-0.29, 0.3, 0), P(-0.29, -0.08, 0)], uc, 1, [4, 4]);
    K.ln([P(-0.29, -0.15, 0), P(-0.45, -0.42, 0)], uc, 1, [4, 4]);
    [[-0.47, 0.48], [-0.47, 0.64]].forEach((m) => K.cyl(P, m[0] + 0.03, m[1], 0.008, 0, 0.035, 'bol'));
    [[-0.78, -0.2, 0.9], [-0.66, -0.82, 0.85], [-0.9, 0.06, 0.8], [-0.02, -0.55, 0.75], [-0.12, -0.86, 0.9], [0.84, 0.72, 0.8], [0.62, 0.84, 0.75], [-0.72, 0.5, 0.85], [-0.2, 0.66, 0.7], [0.3, 0.72, 0.6], [-0.45, -0.85, 0.7]].forEach((t) => add(t[0] + t[1], () => K.tree(P, t[0], t[1], t[2])));
    S.houses.forEach((hh) => add((hh[0] + hh[2] + hh[1] + hh[3]) / 2, () => K.house(P, hh[0], hh[1], hh[2], hh[3], 0.09, 0.05)));
    add(-0.44, () => K.kiosk(P, S.k2[0], S.k2[1], S.k2[2], S.k2[3], S.k2[4]));
    add(-0.99, () => {
      const b = S.biz, u0 = b[0], v0 = b[1], u1 = b[2], v1 = b[3], H = b[4];
      K.shadow(P, u0, v0, u1, v1, H);
      const B = K.box(P, u0, v0, u1, v1, 0, H, 'wall');
      const wc = T ? 'rgba(212,181,116,0.18)' : 'rgba(232,209,147,0.42)';
      K.quad(B.fv, 0.06, 0.55, 0.94, 0.78, wc, null); K.quad(B.fu, 0.08, 0.55, 0.92, 0.78, wc, null);
      K.quad(B.fv, 0.42, 0.0, 0.56, 0.4, T ? null : 'rgba(15,15,15,0.7)', T ? K.EB : null);
    });
    S.lA.forEach((t, i) => add(t[0] + t[1], () => K.pole(P, t[0], t[1], S.H1, 'u', i === 0)));
    S.lB.forEach((t, i) => add(t[0] + t[1], () => K.pole(P, t[0], t[1], S.H1, 'v', i === 3)));
    add(S.ptr[0] + S.ptr[1], () => { K.pole(P, S.ptr[0], S.ptr[1], S.H1, 'u', false); K.box(P, S.ptr[0] + 0.012, S.ptr[1] - 0.03, S.ptr[0] + 0.05, S.ptr[1] + 0.03, 0.11, 0.17, 'trafo'); });
    q.sort((x, y) => x[0] - y[0]).forEach((e) => e[1]());
    const cw = T ? 'rgba(212,181,116,0.6)' : K.wc(0.6);
    const A = (t, arm) => this._poatt(t[0], t[1], S.H1, arm);
    const ch = [A(S.lA[0], 'u'), A(S.lA[1], 'u'), A(S.lA[2], 'u'), A(S.lB[0], 'v'), A(S.lB[1], 'v'), A(S.lB[2], 'v'), A(S.lB[3], 'v')];
    for (let i = 0; i < 3; i++) for (let j = 1; j < ch.length; j++) K.wireW(P, ch[j - 1][i], ch[j][i], 0.04, cw, 0.9);
    const br = [A(S.lB[0], 'v'), A(S.ptr, 'u')];
    for (let i = 0; i < 3; i++) K.wireW(P, br[0][i], br[1][i], 0.04, cw, 0.8);
    const lvc = T ? 'rgba(243,238,225,0.3)' : K.wc(0.42);
    S.houses.forEach((hh) => K.wireW(P, [S.ptr[0] + 0.03, S.ptr[1], 0.15], [(hh[0] + hh[2]) / 2, hh[3], 0.085], 0.05, lvc, 0.7));
  }
  _pl2(K, P, S) {
    const T = K.T, bv = S.bnd;
    K.patch(P, -1, bv, 1, 1, [40, 52, 40]);
    if (T) for (let x = -0.96; x < 1; x += 0.08) K.ln([P(x, bv, 0), P(x, 1, 0)], 'rgba(243,238,225,0.07)', 0.8);
    const pc = T ? 'rgba(243,238,225,0.12)' : 'rgba(220,215,200,0.24)';
    for (let i = 0; i < 6; i++) { const uu = 0.12 + i * 0.09; K.ln([P(uu, 0.36, 0), P(uu, 0.52, 0)], pc, 0.8); }
    const uc = T ? 'rgba(212,181,116,0.45)' : 'rgba(212,181,116,0.35)';
    K.ln([P(-0.47, 0.82, 0), P(-0.5, 0.67, 0)], uc, 1.2, [4, 4]);
    K.ln([P(-0.5, 0.57, 0), P(-0.5, 0.5, 0), P(-0.53, 0.3, 0)], uc, 1.2, [4, 4]);
    K.ln([P(-0.42, 0.2, 0), P(-0.32, 0.12, 0), P(-0.25, 0.02, 0)], uc, 1.2, [4, 4]);
    K.ln([P(0.72, -0.28, 0), P(0.84, -0.28, 0)], uc, 1.2, [4, 4]);
    K.kiosk(P, S.ki[0], S.ki[1], S.ki[2], S.ki[3], S.ki[4]);
    const me = S.me;
    K.shadow(P, me[0], me[1], me[2], me[3], me[4]);
    const MB = K.box(P, me[0], me[1], me[2], me[3], 0, me[4], 'sw');
    K.quad(MB.fv, 0.1, 0.06, 0.9, 0.94, null, T ? 'rgba(212,181,116,0.45)' : 'rgba(0,0,0,0.5)');
    this._bld2(K, P, S);
    K.tree(P, 0.22, 0.8, 0.65); K.tree(P, 0.56, 0.86, 0.75); K.tree(P, 0.84, 0.72, 0.6);
  }
  _bld2(K, P, S) {
    const T = K.T, b = S.bd, u0 = b[0], v0 = b[1], u1 = b[2], v1 = b[3], H = b[4], th = 0.025;
    K.fill([P(u0, v0, 0), P(u1, v0, 0), P(u1, v1, 0), P(u0, v1, 0)], T ? 'rgba(243,238,225,0.04)' : K.C([78, 78, 76], 1));
    const fl = T ? 'rgba(243,238,225,0.05)' : 'rgba(0,0,0,0.12)';
    for (let x = u0 + 0.1; x < u1; x += 0.1) K.ln([P(x, v0, 0), P(x, v1, 0)], fl, 0.7);
    for (let y = v0 + 0.1; y < v1; y += 0.1) K.ln([P(u0, y, 0), P(u1, y, 0)], fl, 0.7);
    const wv = (s, qz) => P(u0 + s * (u1 - u0), v0, qz * H), wu = (s, qz) => P(u0, v0 + s * (v1 - v0), qz * H);
    K.face([wv(0, 0), wv(1, 0), wv(1, 1), wv(0, 1)], 'wall', 'l');
    K.face([wu(0, 0), wu(1, 0), wu(1, 1), wu(0, 1)], 'wall', 'r');
    const rib = T ? 'rgba(243,238,225,0.06)' : 'rgba(0,0,0,0.16)';
    for (let i = 1; i < 24; i++) K.ln([wv(i / 24, 0.02), wv(i / 24, 0.98)], rib, 0.7);
    for (let i = 1; i < 26; i++) K.ln([wu(i / 26, 0.02), wu(i / 26, 0.98)], rib, 0.7);
    const gl = T ? 'rgba(243,238,225,0.06)' : (K.light ? 'rgba(70,74,78,0.85)' : K.C([40, 56, 70], 1, 0.9)), gs = T ? K.EB : 'rgba(0,0,0,0.5)';
    for (let i = 0; i < 6; i++) { const s0 = 0.06 + i * 0.155; K.quad(wv, s0, 0.62, s0 + 0.12, 0.82, gl, gs, 0.8); }
    for (let i = 0; i < 6; i++) { const s0 = 0.06 + i * 0.155; K.quad(wu, s0, 0.62, s0 + 0.12, 0.82, gl, gs, 0.8); }
    const cut = T ? 'rgba(212,181,116,0.28)' : K.C([110, 114, 116], 1);
    K.fill([P(u0 - th, v0 - th, H), P(u1, v0 - th, H), P(u1, v0, H), P(u0, v0, H)], cut);
    K.fill([P(u0 - th, v0 - th, H), P(u0, v0, H), P(u0, v1, H), P(u0 - th, v1, H)], cut);
    K.fill([P(u1, v0 - th, 0), P(u1, v0, 0), P(u1, v0, H), P(u1, v0 - th, H)], cut);
    K.fill([P(u0 - th, v1, 0), P(u0, v1, 0), P(u0, v1, H), P(u0 - th, v1, H)], cut);
    const rv1 = v0 + 0.32;
    K.box(P, u0 - th, v0 - th, u1, rv1, H, H + 0.02, 'roof');
    for (let r = 0; r < 3; r++) {
      const vr = v0 + 0.02 + r * 0.095, z = H + 0.022;
      const top = [P(u0 + 0.04, vr, z + 0.03), P(u0 + 0.52, vr, z + 0.03), P(u0 + 0.52, vr + 0.07, z + 0.006), P(u0 + 0.04, vr + 0.07, z + 0.006)];
      if (T) K.fill(top, '#111410', K.EN, 0.8);
      else { const gr = K.g.createLinearGradient(top[0][0], top[0][1], top[2][0], top[2][1]), pvc = K.light ? [[66, 68, 72], [44, 46, 50], [80, 82, 86]] : [[40, 58, 82], [24, 36, 54], [52, 72, 98]], pc2 = K.light ? K.C0 : K.C; gr.addColorStop(0, pc2(pvc[0])); gr.addColorStop(0.5, pc2(pvc[1])); gr.addColorStop(1, pc2(pvc[2])); K.fill(top, gr, 'rgba(160,180,200,0.35)', 0.6); }
      const pl = T ? 'rgba(91,208,141,0.3)' : 'rgba(160,180,200,0.22)';
      for (let i = 1; i < 10; i++) { const uu = u0 + 0.04 + i * 0.048; K.ln([P(uu, vr, z + 0.03), P(uu, vr + 0.07, z + 0.006)], pl, 0.6); }
      K.ln([P(u0 + 0.04, vr + 0.035, z + 0.018), P(u0 + 0.52, vr + 0.035, z + 0.018)], pl, 0.6);
    }
    K.box(P, 0.42, v0 + 0.04, 0.58, v0 + 0.2, H + 0.02, H + 0.08, 'mach');
    const fc = P(0.5, v0 + 0.12, H + 0.08); K.g.strokeStyle = T ? K.EB : 'rgba(0,0,0,0.5)'; K.g.lineWidth = 1; K.g.beginPath(); K.g.ellipse(fc[0], fc[1], 0.05 * K.a * 1.2247, 0.05 * K.a * 0.7071, 0, 0, Math.PI * 2); K.g.stroke();
    const q = [], add = (d, f) => q.push([d, f]);
    for (let i = 0; i < 5; i++) {
      const vi = -0.36 + i * 0.08;
      add(u0 + vi, () => {
        const B = K.box(P, u0 + 0.012, vi, u0 + 0.075, vi + 0.08, 0, 0.2, 'sw');
        const dc = T ? 'rgba(212,181,116,0.4)' : 'rgba(0,0,0,0.45)';
        K.ln([B.fu(0.5, 0.04), B.fu(0.5, 0.96)], dc, 0.8);
        K.dot(B.fu(0.3, 0.86), 1.4, i === 2 ? '#5BD08D' : '#D4B574'); K.dot(B.fu(0.7, 0.86), 1.4, '#D4B574');
        K.ln([B.fu(0.38, 0.45), B.fu(0.38, 0.6)], dc, 1.2);
      });
    }
    add(0.0 - 0.26, () => {
      const B = K.box(P, 0.0, -0.36, 0.18, -0.16, 0, 0.12, 'mach');
      K.box(P, 0.04, -0.32, 0.12, -0.22, 0.12, 0.17, 'mach');
      K.quad(B.fv, 0.6, 0.45, 0.9, 0.8, T ? 'rgba(212,181,116,0.15)' : 'rgba(30,40,46,1)', T ? K.EB : 'rgba(0,0,0,0.5)', 0.8);
      K.dot(B.fv(0.7, 0.62), 1.4, '#5BD08D');
    });
    add(0.4 - 0.29, () => {
      const B = K.box(P, 0.3, -0.4, 0.5, -0.18, 0, 0.16, 'mach');
      K.quad(B.fv, 0.12, 0.35, 0.55, 0.75, T ? 'rgba(212,181,116,0.2)' : 'rgba(226,170,90,0.45)', T ? K.EB : 'rgba(0,0,0,0.5)', 0.8);
      for (let i = 0; i < 5; i++) K.ln([B.fu(0.2, 0.3 + i * 0.1), B.fu(0.8, 0.3 + i * 0.1)], T ? 'rgba(243,238,225,0.25)' : 'rgba(0,0,0,0.35)', 0.8);
    });
    add(0.3 + 0.035, () => {
      const lc = T ? K.EB : 'rgba(150,154,158,0.9)';
      [-0.0, 0.2, 0.4, 0.58].forEach((uu) => { K.ln([P(uu, 0.01, 0), P(uu, 0.01, 0.05)], lc, 1); K.ln([P(uu, 0.06, 0), P(uu, 0.06, 0.05)], lc, 1); });
      K.box(P, -0.02, 0.0, 0.6, 0.07, 0.05, 0.066, 'dark');
      for (let uu = 0.0; uu < 0.6; uu += 0.035) K.ln([P(uu, 0.0, 0.066), P(uu, 0.07, 0.066)], T ? 'rgba(243,238,225,0.18)' : 'rgba(255,255,255,0.08)', 0.6);
      [0.08, 0.27, 0.46].forEach((uu) => K.box(P, uu, 0.012, uu + 0.045, 0.058, 0.066, 0.1, 'house'));
    });
    q.sort((x, y) => x[0] - y[0]).forEach((e) => e[1]());
    K.box(P, u0, -0.47, u0 + 0.025, -0.41, 0.13, 0.2, 'sw');
    const tr = T ? 'rgba(243,238,225,0.35)' : 'rgba(170,174,178,0.7)';
    K.ln([P(-0.17, -0.2, 0.25), P(0.4, -0.2, 0.25)], tr, 1.2); K.ln([P(0.09, -0.2, 0.25), P(0.09, 0.035, 0.25)], tr, 1.2);
    K.ln([P(u0 + 0.075, -0.28, 0.004), P(u1, -0.28, 0.004)], T ? 'rgba(212,181,116,0.4)' : 'rgba(212,181,116,0.3)', 1.2, [4, 4]);
    K.box(P, u1 - th, v0, u1, v1, 0, 0.05, 'wall');
    K.box(P, u0, v1 - th, u1, v1, 0, 0.05, 'wall');
    const gh = T ? 'rgba(243,238,225,0.22)' : 'rgba(200,205,210,0.18)';
    K.ln([P(u1, v1, 0.05), P(u1, v1, H)], gh, 0.8, [3, 4]);
    K.ln([P(u0, v1, H), P(u1, v1, H), P(u1, rv1, H)], gh, 0.8, [3, 4]);
  }
  _pl3(K, P, S) {
    const T = K.T, q = [], add = (d, f) => q.push([d, f]), pd = S.pad;
    K.box(P, pd[0], pd[1], pd[2], pd[3], 0, 0.018, 'conc');
    const tc = T ? 'rgba(243,238,225,0.06)' : K.C([40, 40, 40], 1), tl = T ? 'rgba(243,238,225,0.18)' : 'rgba(255,255,255,0.08)';
    const strip = (pts, w2, alongU) => { const a0 = pts[0], a1 = pts[1]; const d = w2 / 2; const qd = alongU ? [P(a0[0], a0[1] - d, 0.019), P(a1[0], a1[1] - d, 0.019), P(a1[0], a1[1] + d, 0.019), P(a0[0], a0[1] + d, 0.019)] : [P(a0[0] - d, a0[1], 0.019), P(a1[0] - d, a1[1], 0.019), P(a1[0] + d, a1[1], 0.019), P(a0[0] + d, a0[1], 0.019)]; K.fill(qd, tc, tl, 0.6); };
    strip([[0.56, -0.28], [0.86, -0.28]], 0.04, true);
    strip([[0.43, -0.12], [0.43, 0.48]], 0.05, false);
    strip([[0.455, 0.46], [-0.47, 0.46]], 0.05, true);
    add(-1.2, () => {
      const B = K.box(P, -0.4, -0.88, 0.86, -0.82, 0, 0.3, 'wall');
      const rib = T ? 'rgba(243,238,225,0.06)' : 'rgba(0,0,0,0.18)';
      for (let i = 1; i < 30; i++) K.ln([B.fv(i / 30, 0.02), B.fv(i / 30, 0.98)], rib, 0.7);
      K.quad(B.fv, 0.62, 0.0, 0.7, 0.5, T ? null : 'rgba(20,20,20,0.85)', T ? K.EB : 'rgba(0,0,0,0.5)', 0.8);
      K.box(P, -0.41, -0.89, 0.87, -0.81, 0.3, 0.315, 'roof');
    });
    /* 04.11.2026: ei erillistä invertteriä — samalla paikalla neljäs akkukaappi (kaapit rinnan); tehoelektroniikka piirretään avoimen kaapin sisään */
    add(0.22, () => this._cab(K, P, [0.32, -0.4, 0.56, -0.12], S.cabH, false));
    S.cabs.forEach((cb, i) => add(cb[0] + cb[1] + 0.3, () => this._cab(K, P, cb, S.cabH, i === 0)));
    /* 04.11.2026: ohjaus (EMS) on kaapin sisällä, ei erillistä tolppakoteloa */
    [[-0.2, 0.58], [0.15, 0.58], [0.45, 0.58]].forEach((bb) => add(bb[0] + bb[1], () => K.cyl(P, bb[0], bb[1], 0.012, 0.018, 0.075, 'bol')));
    q.sort((x, y) => x[0] - y[0]).forEach((e) => e[1]());
  }
  _cab(K, P, b, H, open) {
    const T = K.T, u0 = b[0], v0 = b[1], u1 = b[2], v1 = b[3], zb = 0.018, z0 = zb + 0.02;
    K.shadow(P, u0, v0, u1, v1, H, zb);
    K.box(P, u0 - 0.008, v0 - 0.008, u1 + 0.008, v1 + 0.008, zb, z0, 'conc');
    const dc = T ? 'rgba(91,208,141,0.4)' : 'rgba(0,0,0,0.45)';
    if (!open) {
      const B = K.box(P, u0, v0, u1, v1, z0, H, 'cab');
      K.quad(B.fv, 0.05, 0.03, 0.95, 0.97, null, dc);
      K.ln([B.fv(0.86, 0.45), B.fv(0.86, 0.58)], T ? K.EN : 'rgba(180,184,188,0.9)', 1.6);
      for (let i = 0; i < 6; i++) K.ln([B.fu(0.2, 0.62 + i * 0.05), B.fu(0.8, 0.62 + i * 0.05)], dc, 0.8);
      const HV = K.box(P, u0 + 0.05, v1, u1 - 0.07, v1 + 0.028, z0 + 0.06, z0 + 0.2, 'mach');
      for (let i = 0; i < 7; i++) K.ln([HV.fv(0.1, 0.15 + i * 0.12), HV.fv(0.9, 0.15 + i * 0.12)], T ? 'rgba(243,238,225,0.3)' : 'rgba(0,0,0,0.4)', 0.8);
      return;
    }
    K.fill([P(u0, v0, z0), P(u1, v0, z0), P(u1, v0, H), P(u0, v0, H)], T ? '#0B0B09' : K.C([30, 33, 35], 1));
    K.fill([P(u0, v0, z0), P(u0, v1, z0), P(u0, v1, H), P(u0, v0, H)], T ? '#100F0D' : K.C([40, 43, 46], 1));
    K.fill([P(u0, v0, z0), P(u1, v0, z0), P(u1, v1, z0), P(u0, v1, z0)], T ? '#0D0C0A' : K.C([26, 28, 30], 1));
    for (let i = 0; i < 6; i++) {
      const za = z0 + 0.015 + i * 0.036;
      const B = K.box(P, u0 + 0.02, v0 + 0.03, u1 - 0.02, v1 - 0.025, za, za + 0.028, 'cell');
      K.ln([B.fv(0.82, 0.3), B.fv(0.95, 0.3)], T ? K.EN : 'rgba(200,204,208,0.6)', 1);
    }
    /* tehoelektroniikka (PCS) kaapin sisällä, akkuhyllyjen yläpuolella */
    const pz = z0 + 0.015 + 6 * 0.036, PM = K.box(P, u0 + 0.02, v0 + 0.03, u1 - 0.02, v1 - 0.025, pz, pz + 0.064, 'pcs');
    for (let i = 0; i < 4; i++) K.ln([PM.fv(0.1, 0.18 + i * 0.2), PM.fv(0.52, 0.18 + i * 0.2)], T ? 'rgba(212,181,116,0.35)' : 'rgba(0,0,0,0.4)', 0.8);
    const bz = z0 + 0.015 + 8 * 0.036;
    const BM = K.box(P, u0 + 0.03, v0 + 0.05, u1 - 0.03, v1 - 0.03, bz, bz + 0.032, 'pcb');
    K.quad(BM.fv, 0.1, 0.3, 0.45, 0.75, T ? '#0B0B09' : 'rgba(14,24,18,1)', null);
    K.face([P(u1, v0, z0), P(u1, v1, z0), P(u1, v1, H), P(u1, v0, H)], 'cab', 'r');
    K.face([P(u0, v0, H), P(u1, v0, H), P(u1, v1, H), P(u0, v1, H)], 'cab', 't');
    K.ln([P(u0, v1, z0), P(u0, v1, H), P(u1, v1, H), P(u1, v1, z0)], T ? K.EN : 'rgba(0,0,0,0.6)', 1.2);
    const ang = 1.92, fu = u0 + 0.24 * Math.cos(ang), fv = v1 + 0.24 * Math.sin(ang);
    K.face([P(u0, v1, z0), P(fu, fv, z0), P(fu, fv, H), P(u0, v1, H)], 'cab', 'l');
    const dpt = (s, qz) => P(u0 + (fu - u0) * s, v1 + (fv - v1) * s, z0 + (H - z0) * qz);
    K.quad(dpt, 0.2, 0.55, 0.75, 0.85, T ? 'rgba(91,208,141,0.08)' : 'rgba(255,255,255,0.08)', dc, 0.7);
  }
  _pl4(K, P, S) {
    const T = K.T, r = S.rack, m = S.mod, c = S.cell, gc = T ? 'rgba(243,238,225,0.35)' : 'rgba(225,225,215,0.35)';
    this._rack(K, P, r);
    K.ln([P(r[2], m[1], m[4]), P(m[0], m[1], m[4])], gc, 0.8, [3, 4]);
    K.ln([P(r[2], m[3], m[4]), P(m[0], m[3], m[4])], gc, 0.8, [3, 4]);
    K.ln([P(r[2], m[3], m[5]), P(m[0], m[3], m[5])], gc, 0.8, [3, 4]);
    this._module(K, P, m);
    const lz = m[5] + 0.1;
    K.ln([P(m[0], m[1], lz), P(m[2], m[1], lz), P(m[2], m[3], lz), P(m[0], m[3], lz), P(m[0], m[1], lz)], gc, 0.8, [3, 3]);
    [[m[2], m[1]], [m[2], m[3]], [m[0], m[3]]].forEach((cc) => K.ln([P(cc[0], cc[1], m[5] + 0.01), P(cc[0], cc[1], lz)], gc, 0.6, [2, 4]));
    K.ln([P(0.17, 0.12, m[5] + 0.02), P(c[0], 0.12, m[5] + 0.02)], gc, 0.8, [3, 4]);
    this._bigcell(K, P, c);
  }
  _rack(K, P, r) {
    const T = K.T, u0 = r[0], v0 = r[1], u1 = r[2], v1 = r[3], H = r[4], pst = 0.016;
    K.shadow(P, u0, v0, u1, v1, H);
    const post = (uu, vv) => K.box(P, uu, vv, uu + pst, vv + pst, 0, H, 'steel');
    post(u0, v0); post(u1 - pst, v0); post(u0, v1 - pst);
    for (let i = 0; i < 8; i++) {
      const za = 0.04 + i * 0.075;
      if (i === 4) { K.ln([P(u0 + pst, v0 + 0.014, za), P(u1, v0 + 0.014, za)], K.stc, 1); K.ln([P(u0 + pst, v1 - 0.014, za), P(u1, v1 - 0.014, za)], K.stc, 1); continue; }
      const B = K.box(P, u0 + pst, v0 + 0.012, u1 - 0.004, v1 - 0.012, za, za + 0.06, 'mod');
      K.ln([B.fu(0.32, 0.5), B.fu(0.62, 0.5)], T ? K.EN : 'rgba(200,204,208,0.7)', 1.4);
    }
    const bz = 0.04 + 8 * 0.075;
    const BM = K.box(P, u0 + pst, v0 + 0.012, u1 - 0.004, v1 - 0.012, bz, bz + 0.05, 'mod');
    K.quad(BM.fu, 0.12, 0.25, 0.48, 0.78, T ? '#0B0B09' : 'rgba(12,30,20,1)', T ? K.EN : 'rgba(91,208,141,0.6)', 0.8);
    post(u1 - pst, v1 - pst);
    K.ln([P(u0, v0, H), P(u1, v0, H), P(u1, v1, H), P(u0, v1, H), P(u0, v0, H)], K.stc, 1);
  }
  _module(K, P, m) {
    const T = K.T, u0 = m[0], v0 = m[1], u1 = m[2], v1 = m[3], z0 = m[4], z1 = m[5];
    K.shadowF(P, u0, v0, u1, v1, z0);
    K.fill([P(u0, v0, z0), P(u1, v0, z0), P(u1, v0, z1), P(u0, v0, z1)], T ? '#0D0C0A' : K.C([44, 48, 52], 1));
    K.fill([P(u0, v0, z0), P(u0, v1, z0), P(u0, v1, z1), P(u0, v0, z1)], T ? '#100F0D' : K.C([52, 56, 60], 1));
    K.fill([P(u0, v0, z0), P(u1, v0, z0), P(u1, v1, z0), P(u0, v1, z0)], T ? '#0B0B09' : K.C([36, 38, 42], 1));
    const cz0 = z0 + 0.004, cz1 = z1 + 0.004, cells = [], pu = (u1 - u0 - 0.024) / 6, cw = pu * 0.86, rd = (v1 - v0 - 0.034) / 2;
    for (let rr = 0; rr < 2; rr++) for (let i = 0; i < 6; i++) {
      const cu0 = u0 + 0.012 + i * pu, cv0 = v0 + 0.012 + rr * (rd + 0.01);
      K.box(P, cu0, cv0, cu0 + cw, cv0 + rd, cz0, cz1, 'cell');
      cells.push([cu0, cv0]);
    }
    K.face([P(u1, v0, z0), P(u1, v1, z0), P(u1, v1, z1), P(u1, v0, z1)], 'mod', 'r');
    K.face([P(u1, v1, z0), P(u0, v1, z0), P(u0, v1, z1), P(u1, v1, z1)], 'mod', 'l');
    const tw = cw * 0.36, t0 = rd * 0.16, t1 = rd * 0.84 - tw;
    cells.forEach((cc) => {
      K.box(P, cc[0] + cw / 2 - tw / 2, cc[1] + t0, cc[0] + cw / 2 + tw / 2, cc[1] + t0 + tw, cz1, cz1 + 0.007, 'cu');
      K.box(P, cc[0] + cw / 2 - tw / 2, cc[1] + t1, cc[0] + cw / 2 + tw / 2, cc[1] + t1 + tw, cz1, cz1 + 0.007, 'steel');
    });
    const bb = T ? 'rgba(212,181,116,0.85)' : 'rgba(206,160,92,0.95)';
    for (let rr = 0; rr < 2; rr++) for (let i = 0; i < 5; i++) { const cc = cells[rr * 6 + i], ee = (i % 2 === 0) ? t0 + tw / 2 : t1 + tw / 2; K.ln([P(cc[0] + cw / 2, cc[1] + ee, cz1 + 0.008), P(cc[0] + pu + cw / 2, cc[1] + ee, cz1 + 0.008)], bb, 2.6); }
    const pv0 = v0 + 0.012 + rd - 0.004, PB = K.box(P, u0 + 0.014, pv0, u1 - 0.014, pv0 + 0.018, cz1 + 0.007, cz1 + 0.014, 'pcb');
    for (let i = 0; i < 5; i++) K.box(P, u0 + 0.05 + i * 0.055, pv0 + 0.003, u0 + 0.068 + i * 0.055, pv0 + 0.015, cz1 + 0.014, cz1 + 0.019, 'dark');
    const sw = T ? 'rgba(91,208,141,0.5)' : 'rgba(220,220,210,0.35)';
    for (let i = 0; i < 6; i++) { const cc = cells[i]; K.ln([P(cc[0] + cw / 2, pv0, cz1 + 0.011), P(cc[0] + cw / 2, cc[1] + t1 + tw / 2, cz1 + 0.008)], sw, 0.6); }
    return PB;
  }
  _bigcell(K, P, c) {
    const T = K.T, u0 = c[0], v0 = c[1], u1 = c[2], v1 = c[3], H = c[4];
    K.shadow(P, u0, v0, u1, v1, H);
    const B = K.box(P, u0, v0, u1, v1, 0, H, 'cell');
    K.quad(B.fu, 0.1, 0.1, 0.9, 0.78, T ? '#0B0B09' : K.C([24, 26, 28], 1), T ? K.EN : 'rgba(0,0,0,0.5)', 1);
    for (let i = 0; i < 24; i++) { const qq = 0.1 + 0.68 * (i + 0.5) / 24; K.ln([B.fu(0.12, qq), B.fu(0.88, qq)], i % 2 ? (T ? 'rgba(212,181,116,0.55)' : 'rgba(206,160,92,0.75)') : (T ? 'rgba(91,208,141,0.45)' : 'rgba(130,140,150,0.7)'), 0.8); }
    K.quad(B.fv, 0.0, 0.84, 1.0, 0.94, T ? null : 'rgba(255,255,255,0.07)', T ? K.EN : null, 0.8);
    const um = (u0 + u1) / 2;
    K.cyl(P, um, v0 + 0.1, 0.022, H, H + 0.03, 'cu');
    K.cyl(P, um, v1 - 0.1, 0.022, H, H + 0.03, 'steel');
    const vc = P(um, (v0 + v1) / 2, H); K.g.strokeStyle = T ? K.EN : 'rgba(0,0,0,0.5)'; K.g.lineWidth = 1; K.g.beginPath(); K.g.ellipse(vc[0], vc[1], 0.03 * K.a * 1.2247, 0.05 * K.a * 0.7071, 0.5, 0, Math.PI * 2); K.g.stroke();
    K.g.font = '600 11px "IBM Plex Sans", sans-serif'; K.g.textAlign = 'center'; K.g.fillStyle = T ? '#D4B574' : '#CFAF6E';
    const tp = P(um, v0 + 0.1, H + 0.075); K.g.fillText('+', tp[0], tp[1]);
    const tm = P(um, v1 - 0.1, H + 0.075); K.g.fillStyle = T ? '#A39C8E' : '#BFC3C6'; K.g.fillText('−', tm[0], tm[1]);
  }
  _plateLive(K, S, k, P, st, act0, labs) {
    const g = K.g, T = K.T, act = Math.sqrt(Math.max(0, (act0 - 0.6) / 0.4));
    this._paths()[k].forEach((pp) => {
      if (pp.c === 2) { g.save(); g.setLineDash([3, 5]); g.lineDashOffset = -st.time * 14; g.strokeStyle = K.light ? 'rgba(20,118,66,0.9)' : 'rgba(91,208,141,0.65)'; g.lineWidth = K.light ? 1.3 : 1; g.stroke(K.pathW(P, pp.n)); g.restore(); return; }
      K.flow(K.pathW(P, pp.n), pp.c === 1, pp.d ? st.chg : 1, st.time, (pp.gi ? st.gi : 1) * (pp.w || 1), false);
    });
    const blink = (ph) => 0.5 + 0.5 * Math.sin(st.time * 2.2 + ph);
    if (k === 2) {
      const a0 = P(-1, S.bnd, 0), a1 = P(1, S.bnd, 0);
      g.save(); g.globalCompositeOperation = K.light ? 'source-over' : 'lighter'; g.strokeStyle = 'rgba(212,181,116,' + ((K.light ? 0.3 : 0.14) + 0.08 * Math.sin(st.time * 1.6)).toFixed(3) + ')'; g.lineWidth = 9; g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(a1[0], a1[1]); g.stroke(); g.restore();
      K.ln([a0, a1], K.light ? 'rgba(150,108,24,0.95)' : 'rgba(212,181,116,0.9)', 1.4, [7, 5]);
      const me = S.me, fu = (s, qz) => P(me[2], me[1] + s * (me[3] - me[1]), qz * me[4]);
      K.quad(fu, 0.18, 0.5, 0.82, 0.78, SAMA_BG, 'rgba(212,181,116,0.6)', 0.8);
      const lv = st.gi * (0.82 + 0.12 * Math.sin(st.time * 3));
      K.quad(fu, 0.22, 0.56, 0.22 + 0.56 * lv, 0.72, 'rgba(212,181,116,0.85)', null);
      labs.push({ t: 'b', p: P(0.12, 0.88, 0), s: 'VÕRGUETTEVÕTJA POOL', al: act * act });
      labs.push({ t: 'b', p: P(0.54, 0.36, 0), s: 'TEIE POOL', al: act * act, gold: 1 });
    }
    if (k === 3) {
      const cb = S.cabs[0], u0 = cb[0], u1 = cb[2], vf = cb[3] - 0.025, z0 = 0.038;
      for (let i = 0; i < 6; i++) {
        const za = z0 + 0.015 + i * 0.036, uu = u0 + 0.02 + st.lvl * (u1 - u0 - 0.04);
        K.fill([P(u0 + 0.02, vf, za + 0.004), P(uu, vf, za + 0.004), P(uu, vf, za + 0.024), P(u0 + 0.02, vf, za + 0.024)], 'rgba(91,208,141,0.34)');
      }
      [S.cabs[1], S.cabs[2]].forEach((c2, i) => K.dot(P(c2[0] + 0.03, c2[3], S.cabH - 0.03), 1.8, 'rgba(91,208,141,' + (0.4 + 0.6 * blink(i * 2)).toFixed(2) + ')'));
      const pz = z0 + 0.015 + 6 * 0.036, wf = (s, dz) => P(u0 + 0.13 + s * (u1 - u0 - 0.16), vf, pz + 0.034 + dz);
      g.save(); g.beginPath(); const p0 = wf(0, 0); g.moveTo(p0[0], p0[1]);
      for (let i = 1; i <= 16; i++) { const pp = wf(i / 16, 0.011 * Math.sin(i * 0.9 + st.time * 3)); g.lineTo(pp[0], pp[1]); }
      g.strokeStyle = 'rgba(212,181,116,0.85)'; g.lineWidth = 1; g.stroke(); g.restore();
    }
    if (k === 4) {
      const r = S.rack, ce = S.cell;
      for (let i = 0; i < 8; i++) { if (i === 4) continue; const za = 0.04 + i * 0.075; K.dot(P(r[2] - 0.004, r[1] + 0.06, za + 0.04), 1.6, 'rgba(91,208,141,' + (0.35 + 0.65 * blink(i * 1.3)).toFixed(2) + ')'); }
      labs.push({ t: 'r', p: P(ce[2], ce[1], ce[4] * 0.7), al: act * act });
    }
    if (k === 1) labs.push({ t: 'tr', p: P(-0.47, 0.312, 0.3), al: act * act });
    const CL = [
      [['330 kV', [-0.58, 0.55, 0.58], 16, -26], ['TRAFO 330/110 kV', [0.1, 0.55, 0.3], 34, -46], ['110 kV', [0.12, -0.05, 0.34], 20, -26], ['110/10 kV', [0.6, -0.45, 0.25], 26, -34]],
      [['10 kV ÕHULIIN', [0.45, 0.3, 0.26], 26, 44], ['MAAKAABEL', [-0.47, 0.6, 0], 30, 30], ['ALAJAAM', [-0.29, -0.15, 0.14], -22, 28], ['TEISED KLIENDID', [0.57, -0.74, 0.16], 22, -26]],
      [['ARVESTI', [-0.5, 0.62, 0.12], 20, -30], ['OMA ALAJAAM 10/0,4 kV', [-0.53, 0.2, 0.17], 20, -40], ['PEAKILP', [-0.2, -0.16, 0.2], 26, -60], ['TARBIJAD', [0.4, -0.29, 0.16], 30, -40], ['PÄIKE · VALIKULINE', [0.0, -0.69, 0.35], 26, -30]],
      [['JÕUELEKTROONIKA · PCS', [-0.5, 0.315, 0.29], -34, -40], ['AKUPANGAD', [-0.12, 0.2, 0.36], 20, -42], ['AKUHALDUS · BMS', [-0.38, 0.315, 0.16], -46, 16], ['JUHTIMINE · EMS', [-0.44, 0.22, 0.37], 14, -64], ['JAHUTUS', [-0.12, 0.37, 0.16], -26, 46]],
      [['AKUPANK', [-0.44, 0.2, 0.75], 18, -26], ['MOODUL', [0.26, 0.36, 0.37], 30, 30], ['BMS-KAART', [0.08, 0.2, 0.42], 24, -50], ['ELEMENT', [0.5, 0.16, 0.56], 26, -30]]
    ][k];
    if (act > 0.05) CL.forEach((cl) => labs.push({ t: 'c', p: P(cl[1][0], cl[1][1], cl[1][2]), dx: cl[2], dy: cl[3], s: cl[0], al: act * act }));
  }
  _riser(K, S, j, PT, PB, st, al) {
    const pt = S.R[j], top = PT(pt[0], pt[1], K.T ? 0 : -0.07), bot = PB(pt[0], pt[1], S.Rz[j]);
    const g = K.g, pa = new Path2D(); pa.moveTo(top[0], top[1]); pa.lineTo(bot[0], bot[1]);
    g.globalAlpha = al;
    g.strokeStyle = j === 3 ? 'rgba(91,208,141,0.5)' : 'rgba(212,181,116,0.5)'; g.lineWidth = 1; g.stroke(pa);
    K.flow(pa, j === 3, j >= 2 ? st.chg : 1, st.time, j <= 1 ? st.gi : 1, false, true);
    K.dot(top, 2.2, j === 3 ? '#5BD08D' : '#D4B574'); K.dot(bot, 2.2, j === 3 ? '#5BD08D' : '#D4B574');
    g.globalAlpha = 1;
  }
  _labDraw(g, L, map, time) {
    const pt = (p) => map(p[0], p[1]);
    g.save();
    g.textBaseline = 'alphabetic';
    L.forEach((l) => {
      if (l.al < 0.03) return;
      g.globalAlpha = Math.min(1, l.al);
      const a = pt(l.p);
      if (l.t === 'c') {
        g.font = '600 11px \"IBM Plex Sans\", sans-serif';
        /* 04.11.2026: tarra kääntyy toiselle puolelle, jos teksti menisi kanvaasin reunan yli */
        const tw = g.measureText(l.s).width, tf = g.getTransform ? g.getTransform().a : 1, cw = g.canvas.clientWidth || g.canvas.width / (tf || 1);
        let dx = l.dx; if (dx < 0 && a[0] + dx - 18 - tw < 2) dx = -dx; else if (dx >= 0 && a[0] + dx + 18 + tw > cw - 2) dx = -dx;
        const ex = a[0] + dx, ey = a[1] + l.dy, sx = dx >= 0 ? 1 : -1;
        g.strokeStyle = 'rgba(243,238,225,0.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(ex, ey); g.lineTo(ex + 10 * sx, ey); g.stroke();
        g.fillStyle = '#F3EEE1'; g.beginPath(); g.arc(a[0], a[1], 2.2, 0, Math.PI * 2); g.fill();
        g.textAlign = sx > 0 ? 'left' : 'right';
        const tx = ex + 14 * sx;
        g.fillStyle = 'rgba('+SAMA_BGRGB+',0.78)'; g.fillRect(sx > 0 ? tx - 4 : tx - tw - 4, ey - 8, tw + 8, 16);
        g.fillStyle = '#F3EEE1'; g.fillText(l.s, tx, ey + 4);
      } else if (l.t === 'b') {
        g.font = '600 11px \"IBM Plex Sans\", sans-serif'; g.textAlign = 'center'; g.fillStyle = l.gold ? '#D4B574' : '#A39C8E'; g.fillText(l.s, a[0], a[1] + 4);
      } else if (l.t === 'p') {
        g.font = '600 13px "IBM Plex Sans", sans-serif'; g.textAlign = 'left'; g.fillStyle = '#F3EEE1'; g.fillText(l.s, l.x, l.y);
        g.font = '600 11px \"IBM Plex Sans\", sans-serif'; g.fillStyle = '#A39C8E'; g.fillText(l.s2, l.x, l.y + 17);
      } else if (l.t === 'tr') {
        const x0 = a[0] + 40, y0 = a[1] - 178, W = 150, H = 50;
        g.strokeStyle = 'rgba(243,238,225,0.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(x0, y0 + H + 6); g.stroke();
        g.strokeStyle = 'rgba(243,238,225,0.18)'; g.beginPath(); g.moveTo(x0, y0 + H); g.lineTo(x0 + W, y0 + H); g.stroke();
        const f = (t) => 0.3 + 0.16 * Math.sin(t * 18.8 + 1) + 0.08 * Math.sin(t * 44) + 0.42 * Math.exp(-Math.pow((t - 0.64) / 0.022, 2));
        g.beginPath(); for (let i = 0; i <= 80; i++) { const t = i / 80, x = x0 + t * W, y = y0 + H - f(t) * H; if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); }
        g.strokeStyle = 'rgba(212,181,116,0.9)'; g.lineWidth = 1.2; g.stroke();
        const mxp = x0 + 0.64 * W, myp = y0 + H - f(0.64) * H, ph = (time * 0.6) % 1;
        g.strokeStyle = 'rgba(212,181,116,' + (0.8 * (1 - ph)).toFixed(2) + ')'; g.beginPath(); g.arc(mxp, myp, 3 + ph * 10, 0, Math.PI * 2); g.stroke();
        g.fillStyle = '#D4B574'; g.beginPath(); g.arc(mxp, myp, 2.5, 0, Math.PI * 2); g.fill();
        g.font = '600 11px \"IBM Plex Sans\", sans-serif'; g.textAlign = 'left'; g.fillStyle = '#F3EEE1'; g.fillText('SUURIM VÕIMSUS', mxp + 10, myp + 4);
        g.font = '600 10px \"IBM Plex Sans\", sans-serif'; g.fillStyle = '#827C71'; g.fillText('ILLUSTRATSIOON', x0, y0 + H + 16);
      } else if (l.t === 'r') {
        const x0 = a[0] + 34, y0 = a[1] - 30, rows = [['U', 0.62 + 0.04 * Math.sin(time * 0.9)], ['T', 0.42 + 0.03 * Math.sin(time * 0.5 + 1)], ['SOC', l.lvl]];
        g.strokeStyle = 'rgba(243,238,225,0.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(x0 - 6, y0 + 18); g.stroke();
        rows.forEach((rw, i) => {
          const y = y0 + i * 18;
          g.font = '600 11px \"IBM Plex Sans\", sans-serif'; g.textAlign = 'left'; g.fillStyle = '#A39C8E'; g.fillText(rw[0], x0, y + 4);
          g.fillStyle = 'rgba(243,238,225,0.12)'; g.fillRect(x0 + 36, y - 2, 80, 4);
          g.fillStyle = '#5BD08D'; g.fillRect(x0 + 36, y - 2, 80 * rw[1], 4);
        });
      }
    });
    g.restore();
  }
  _sldDraw(c, time, p) {
    const { g, w, h } = c;
    const T = ((this.props && this.props.illustration) || this._defStyle) !== 'realistinen';
    const SC = (this.props && this.props.scheme) || this._defScheme;
    const res = (this.state.board ? 1 : Math.min(2, window.devicePixelRatio || 1)) * 1.15;
    g.fillStyle = SAMA_BG; g.fillRect(0, 0, w, h);
    if (T) { g.fillStyle = 'rgba(243,238,225,0.045)'; for (let y = 12; y < h; y += 24) for (let x = 12; x < w; x += 24) g.fillRect(x - 0.6, y - 0.6, 1.2, 1.2); }
    else { const gx = (w < 640 || window.innerWidth <= 900) ? w * 0.5 : w * 0.66, rg = g.createRadialGradient(gx, h * 0.5, 0, gx, h * 0.5, w * 0.55); rg.addColorStop(0, ({ 'metsä': 'rgba(34,84,56,0.34)', 'pronssi': 'rgba(112,80,34,0.32)', 'pienoismalli': 'rgba(120,114,100,0.24)' })[SC] || 'rgba(64,60,48,0.28)'); rg.addColorStop(1, 'rgba('+SAMA_BGRGB+',0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h); }
    const a = Math.max(110, Math.min(205, h * 0.235, (w * 0.34 - 30) / 1.732));
    const cx = w * ((w < 640 || window.innerWidth <= 900) ? 0.5 : 0.655), cy = h * 0.54, D = 1.8 * a; /* 04.11.2026: stacked layout (phone, tablet <= 900 px): centred */
    const uq = Math.max(0, Math.min(4, p * 5 - 0.5)), i0 = Math.floor(uq), f = this._sm(uq - i0), camK = i0 + f;
    const Z = this._rm ? 1.08 : 1.08 - 0.08 * Math.sin(Math.PI * f);
    const stepf = p * 5 - 0.5;
    const chg = Math.sin(time * 0.22) < 0 ? 1 : -1, lvl = 0.45 + 0.35 * Math.sin(time * 0.22 + 1.5);
    const K = this._kit(g, a, T, SC), S = this._S(), st = { time, chg, lvl, gi: chg > 0 ? 1 : 0.45 };
    const acts = [0, 1, 2, 3, 4].map((k) => Math.max(0, 1 - Math.abs(stepf - k) * 0.85));
    const labs = [];
    g.save(); g.translate(cx, cy); g.scale(Z, Z); g.translate(-cx, -cy);
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (let k = 4; k >= 0; k--) {
      const py = cy + (k - camK) * D;
      if (py > -2.4 * a && py < h + 1.9 * a) {
        const al = 0.2 + 0.8 * acts[k];
        const cc = this._plateCache(k, a, T, res, SC);
        g.globalAlpha = al;
        g.drawImage(cc.cv, cx - cc.ox, py - cc.oy, cc.w, cc.h);
        const P = K.P(cx, py);
        const before = labs.length;
        this._plateLive(K, S, k, P, st, acts[k], labs);
        for (let i = before; i < labs.length; i++) { if (labs[i].t === 'r') labs[i].lvl = lvl; }
        g.globalAlpha = 1;
        const tt = [['ALAJAAMAD', '330 → 110 → 10 kV'], ['JAOTUSVÕRK', '10 kV'], ['LIITUMINE', 'ARVESTI · ALAJAAM · PEAKILP'], ['ENERGIASALVESTI', 'PCS · AKUPANGAD · BMS · EMS'], ['MOODUL JA ELEMENT', 'U · T · SOC']][k];
        labs.push({ t: 'p', p: P(1, -1, 0), s: tt[0], s2: tt[1], al: al * (1 - acts[k]) });
      }
      if (k >= 1) {
        const pyT = py - D;
        if (pyT < h + 1.9 * a && py > -2.4 * a) this._riser(K, S, k - 1, K.P(cx, pyT), K.P(cx, py), st, 0.2 + 0.8 * Math.max(acts[k], acts[k - 1]));
      }
    }
    g.restore();
    const sh = g.createLinearGradient(0, 0, w * 0.5, 0);
    sh.addColorStop(0, 'rgba('+SAMA_BGRGB+',0.94)'); sh.addColorStop(0.7, 'rgba('+SAMA_BGRGB+',0.65)'); sh.addColorStop(1, 'rgba('+SAMA_BGRGB+',0)');
    if (w >= 640 && window.innerWidth > 900) { g.fillStyle = sh; g.fillRect(0, 0, w * 0.5, h); }   /* 04.11.2026: pinottuna (puhelin, tabletti) näkymä keskellä, ei vasenta varjoa */
    const map = (x, y) => [cx + (x - cx) * Z, cy + (y - cy) * Z];
    g.font = '600 11px \"IBM Plex Sans\", sans-serif';
    let labW = g.measureText('ARVESTI · ALAJAAM · PEAKILP').width;
    g.font = '600 13px "IBM Plex Sans", sans-serif'; labW = Math.max(labW, g.measureText('MOODUL JA ELEMENT').width);
    labs.forEach((l) => {
      if (l.t !== 'p') return;
      const m = map(l.p[0], l.p[1]), ldx = Math.max(0, m[0] + 18 + labW - (w - 24)), ldy = ldx > 0 ? ldx * 0.58 + 22 : 0;
      l.x = m[0] + 18 - ldx; l.y = m[1] + 4 - ldy;
    });
    if (w >= 480) this._labDraw(g, labs, map, time);   /* 04.11.2026: puhelimessa ei tarroja — vaiheen teksti on kuvan alla */
  }
  /* ---------- Hero and explorer: one industrial site on the 6A.3 iso kit ---------- */
  _xS() {
    if (this._xs) return this._xs;
    const s = {
      hall: [-0.86, -0.9, 0.22, 0.02, 0.24], hvac: [-0.26, -0.58, -0.1, -0.44],
      kiosk: [0.5, -0.84, 0.69, -0.66, 0.15], meter: [0.77, -0.78, 0.84, -0.7, 0.1], bnd: 0.9,
      pad: [0.39, -0.38, 0.77, 0.33], cabs: [[0.46, -0.32, 0.6, -0.19], [0.46, -0.15, 0.6, -0.02], [0.46, 0.02, 0.6, 0.15]], cabH: 0.15,
      pcs: [0.46, 0.19, 0.6, 0.32, 0.15], ems: [0.7, 0.25], inv: [-0.25, -0.15], sw: [-0.6, -0.46],
      park: [-0.8, 0.3, 0.24, 0.58], carport: [-0.74, 0.32, -0.08, 0.5, 0.1], sb: 0.07
    };
    const sb = s.sb, u0 = s.hall[0] + sb, u1 = s.hall[2] - sb, v0 = s.hall[1] + sb, v1 = s.hall[3] - sb, rows = [];
    for (let vr = v0; vr + 0.055 <= v1 + 0.001; vr += 0.094) {
      [[u0, -0.3], [-0.245, u1]].forEach((sg) => {
        const hv = s.hvac, cl = 0.035, a0 = sg[0], a1 = sg[1];
        if (vr + 0.055 > hv[1] - cl && vr < hv[3] + cl && a1 > hv[0] - cl && a0 < hv[2] + cl) {
          if (hv[0] - cl - a0 > 0.08) rows.push([a0, vr, hv[0] - cl]);
          if (a1 - (hv[2] + cl) > 0.08) rows.push([hv[2] + cl, vr, a1]);
        } else rows.push([a0, vr, a1]);
      });
    }
    s.rows = rows;
    return (this._xs = s);
  }
  _xGeo(w, h, k) { const a = Math.min(w / 2.62, h / 2.08) * (k || 1); return { a, ox: w * 0.5 - 0.37 * a, oy: h * 0.5 + 0.24 * a }; }
  _xStyle() { return { T: ((this.props && this.props.illustration) || this._defStyle) !== 'realistinen', SC: (this.props && this.props.scheme) || this._defScheme }; }
  _xLayer(key, w, h, res, geo, fn) {
    const st = this._xStyle(), id = [key, w, h, res, geo.a.toFixed(2), st.T ? 't' : 'r', st.SC].join('|');
    this._xc = this._xc || {};
    const old = this._xc[key];
    if (old && old.id === id) return old.cv;
    const cv = (old && old.cv) || document.createElement('canvas');
    cv.width = Math.round(w * res); cv.height = Math.round(h * res);
    const g = cv.getContext('2d');
    g.setTransform(res, 0, 0, res, 0, 0); g.clearRect(0, 0, w, h); g.lineCap = 'round'; g.lineJoin = 'round';
    const K = this._kit(g, geo.a, st.T, st.SC);
    fn(K, K.P(geo.ox, geo.oy), this._xS(), g);
    this._xc[key] = { id, cv };
    return cv;
  }
  _xBg(g, w, h) {
    g.fillStyle = SAMA_BG; g.fillRect(0, 0, w, h);
    const rg = g.createRadialGradient(w * 0.55, h * 0.55, 0, w * 0.55, h * 0.55, w * 0.6); rg.addColorStop(0, 'rgba(64,60,48,0.26)'); rg.addColorStop(1, 'rgba('+SAMA_BGRGB+',0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(243,238,225,0.04)'; for (let y = 13; y < h; y += 26) for (let x = 13; x < w; x += 26) g.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
  }
  _xVig(g, w, h) {
    const vg = g.createRadialGradient(w * 0.5, h * 0.48, Math.min(w, h) * 0.42, w * 0.5, h * 0.48, Math.max(w, h) * 0.66);
    vg.addColorStop(0, 'rgba('+SAMA_BGRGB+',0)'); vg.addColorStop(1, 'rgba('+SAMA_BGRGB+',0.88)'); g.fillStyle = vg; g.fillRect(0, 0, w, h);
    const e = Math.max(24, Math.min(64, Math.min(w, h) * 0.12)), ed = (x0, y0, x1, y1, rx, ry, rw, rh) => { const lg = g.createLinearGradient(x0, y0, x1, y1); lg.addColorStop(0, 'rgba('+SAMA_BGRGB+',1)'); lg.addColorStop(1, 'rgba('+SAMA_BGRGB+',0)'); g.fillStyle = lg; g.fillRect(rx, ry, rw, rh); };
    ed(0, 0, e, 0, 0, 0, e, h); ed(w, 0, w - e, 0, w - e, 0, e, h); ed(0, 0, 0, e, 0, 0, w, e); ed(0, h, 0, h - e, 0, h - e, w, e);
  }
  _xGbox(K, P, u0, v0, u1, v1, z0, z1, col) {
    const c = col || 'rgba(243,238,225,0.55)', d = [3, 3];
    K.ln([P(u0, v0, z1), P(u1, v0, z1), P(u1, v1, z1), P(u0, v1, z1), P(u0, v0, z1)], c, 0.9, d);
    K.ln([P(u1, v0, z0), P(u1, v1, z0), P(u0, v1, z0)], c, 0.9, d);
    [[u1, v0], [u1, v1], [u0, v1]].forEach((q) => K.ln([P(q[0], q[1], z0), P(q[0], q[1], z1)], c, 0.9, d));
  }
  _xPvTop(K, top) {
    if (K.T) { K.fill(top, '#111410', K.EN, 0.8); return; }
    const gr = K.g.createLinearGradient(top[0][0], top[0][1], top[2][0], top[2][1]);
    gr.addColorStop(0, K.C([40, 58, 82])); gr.addColorStop(0.5, K.C([24, 36, 54])); gr.addColorStop(1, K.C([52, 72, 98]));
    K.fill(top, gr, 'rgba(160,180,200,0.35)', 0.6);
  }
  _xPvRow(K, P, r, H, mode, dz) {
    const a0 = r[0], vr = r[1], a1 = r[2], z = H + 0.006 + (dz || 0), tz = 0.026, d = 0.055;
    const top = [P(a0, vr, z + tz), P(a1, vr, z + tz), P(a1, vr + d, z), P(a0, vr + d, z)];
    if (mode === 'ghost') { K.ln(top.concat([top[0]]), 'rgba(243,238,225,0.5)', 0.9, [3, 3]); return; }
    if (!K.T) K.fill([P(a1, vr, z + tz), P(a1, vr + d, z), P(a1, vr, z)], K.C([30, 34, 40], 1));
    this._xPvTop(K, top);
    const pl = K.T ? 'rgba(91,208,141,0.3)' : 'rgba(160,180,200,0.2)';
    for (let uu = a0 + 0.045; uu < a1 - 0.01; uu += 0.045) K.ln([P(uu, vr, z + tz), P(uu, vr + d, z)], pl, 0.5);
    K.ln([P(a0, vr + d / 2, z + tz / 2), P(a1, vr + d / 2, z + tz / 2)], pl, 0.5);
  }
  _xCabS(K, P, b, H, ghost, lift) {
    const u0 = b[0], v0 = b[1], u1 = b[2], v1 = b[3], zb = 0.012, dz = lift || 0;
    if (ghost) { this._xGbox(K, P, u0, v0, u1, v1, zb + 0.012, H); return; }
    if (!dz) { K.shadow(P, u0, v0, u1, v1, H, zb); K.box(P, u0 - 0.006, v0 - 0.006, u1 + 0.006, v1 + 0.006, zb, zb + 0.012, 'conc'); }
    const B = K.box(P, u0, v0, u1, v1, zb + 0.012 + dz, H + dz, 'cab'), dc = K.T ? 'rgba(91,208,141,0.4)' : 'rgba(0,0,0,0.45)';
    K.quad(B.fv, 0.08, 0.05, 0.92, 0.95, null, dc);
    for (let i = 0; i < 5; i++) K.ln([B.fu(0.2, 0.55 + i * 0.07), B.fu(0.8, 0.55 + i * 0.07)], dc, 0.8);
    K.ln([B.fv(0.84, 0.45), B.fv(0.84, 0.58)], K.T ? K.EN : 'rgba(180,184,188,0.9)', 1.3);
    K.dot(B.fv(0.2, 0.86), 1.4, '#5BD08D');
  }
  _xPcs(K, P, b, ghost, lift) {
    /* 03.11.2026: no separately drawn inverter (founder rule, brief 00 par. 3) - the slot is one more battery cabinet. */
    this._xCabS(K, P, b, b[4], ghost, lift);
  }
  _xEms(K, P, S, ghost, lift) {
    const e = S.ems, dz = lift || 0;
    if (ghost) { this._xGbox(K, P, e[0] - 0.025, e[1] - 0.015, e[0] + 0.025, e[1] + 0.015, 0.09, 0.14); K.ln([P(e[0], e[1], 0.012), P(e[0], e[1], 0.09)], 'rgba(243,238,225,0.5)', 0.9, [3, 3]); return; }
    K.cyl(P, e[0], e[1], 0.005, 0.012 + dz, 0.1 + dz, 'steel');
    const B = K.box(P, e[0] - 0.025, e[1] - 0.015, e[0] + 0.025, e[1] + 0.015, 0.09 + dz, 0.14 + dz, 'pcb');
    K.quad(B.fv, 0.15, 0.35, 0.6, 0.8, K.T ? '#0B0B09' : 'rgba(18,30,24,1)', null);
    K.dot(B.fv(0.8, 0.6), 1.3, '#5BD08D');
  }
  _xInv(K, P, S, ghost) {
    const u = S.hall[2], v0 = S.inv[0], v1 = S.inv[1];
    if (ghost) { this._xGbox(K, P, u, v0, u + 0.022, v1, 0.07, 0.14); return; }
    const B = K.box(P, u, v0, u + 0.022, v1, 0.07, 0.14, 'pcs');
    for (let i = 0; i < 4; i++) K.ln([B.fu(0.2, 0.25 + i * 0.15), B.fu(0.8, 0.25 + i * 0.15)], K.T ? 'rgba(212,181,116,0.35)' : 'rgba(0,0,0,0.4)', 0.7);
  }
  _xHall(K, P, S) {
    const h = S.hall, u0 = h[0], v0 = h[1], u1 = h[2], v1 = h[3], H = h[4], T = K.T;
    K.shadow(P, u0, v0, u1, v1, H);
    const B = K.box(P, u0, v0, u1, v1, 0, H, 'wall', true), rib = T ? 'rgba(243,238,225,0.06)' : 'rgba(0,0,0,0.16)', gs = T ? K.EB : 'rgba(0,0,0,0.5)';
    for (let i = 1; i < 36; i++) K.ln([B.fv(i / 36, 0.02), B.fv(i / 36, 0.98)], rib, 0.7);
    for (let i = 1; i < 30; i++) K.ln([B.fu(i / 30, 0.02), B.fu(i / 30, 0.98)], rib, 0.7);
    const gl = T ? 'rgba(243,238,225,0.06)' : K.C([40, 56, 70], 1, 0.9), lit = T ? 'rgba(212,181,116,0.16)' : 'rgba(232,209,147,0.38)';
    K.quad(B.fv, 0.03, 0.68, 0.97, 0.8, gl, gs, 0.8);
    K.quad(B.fu, 0.62, 0.68, 0.97, 0.8, gl, gs, 0.8);
    [[0.08, 0.2], [0.34, 0.44], [0.7, 0.78]].forEach((w) => K.quad(B.fv, w[0], 0.69, w[1], 0.79, lit, null));
    K.quad(B.fu, 0.8, 0.69, 0.9, 0.79, lit, null);
    [0.1, 0.27, 0.44].forEach((s) => { K.quad(B.fv, s, 0, s + 0.11, 0.5, T ? null : K.C([50, 54, 57], 1), gs, 0.8); for (let i = 1; i < 6; i++) K.ln([B.fv(s, i * 0.083), B.fv(s + 0.11, i * 0.083)], T ? 'rgba(243,238,225,0.1)' : 'rgba(0,0,0,0.25)', 0.6); });
    K.quad(B.fv, 0.62, 0, 0.66, 0.34, T ? null : K.C([60, 64, 66], 1), gs, 0.8);
    const s0 = (S.sw[0] - v0) / (v1 - v0), s1 = (S.sw[1] - v0) / (v1 - v0);
    K.quad(B.fu, s0, 0, s1, 0.5, T ? null : K.C([96, 100, 104], 0.85), T ? K.EG : gs, 0.8);
    K.ln([B.fu((s0 + s1) / 2, 0.02), B.fu((s0 + s1) / 2, 0.48)], gs, 0.7);
    const ws = B.fu(s0 + (s1 - s0) * 0.25, 0.36); K.fill([[ws[0] - 2.8, ws[1] + 2.4], [ws[0] + 2.8, ws[1] + 2.4], [ws[0], ws[1] - 2.6]], '#D4B574');
    K.face([P(u0, v0, H), P(u1, v0, H), P(u1, v1, H), P(u0, v1, H)], 'roof', 't');
    K.ln([P(u0 + 0.014, v1 - 0.014, H), P(u1 - 0.014, v1 - 0.014, H), P(u1 - 0.014, v0 + 0.014, H)], 'rgba(255,255,255,0.07)', 1);
    const hv = S.hvac;
    K.box(P, hv[0], hv[1], hv[2], hv[3], H, H + 0.05, 'mach');
    const fc = P((hv[0] + hv[2]) / 2, (hv[1] + hv[3]) / 2, H + 0.05); K.g.strokeStyle = T ? K.EB : 'rgba(0,0,0,0.5)'; K.g.lineWidth = 0.9; K.g.beginPath(); K.g.ellipse(fc[0], fc[1], 0.045 * K.a * 1.2247, 0.045 * K.a * 0.7071, 0, 0, Math.PI * 2); K.g.stroke();
    K.box(P, -0.62, -0.3, -0.54, -0.22, H, H + 0.025, 'mach');
  }
  _xGround(K, P, S) {
    K.slab(P, 2);
    K.patch(P, 0.34, -0.9, 0.98, 0.62, [58, 58, 56]);
    K.patch(P, S.bnd, -1, 1, 1, [40, 50, 40]);
    const pk = S.park; K.patch(P, pk[0], pk[1], pk[2], pk[3], [50, 50, 50]);
    for (let u = pk[0] + 0.12; u < pk[2]; u += 0.12) K.ln([P(u, pk[1] + 0.02, 0), P(u, pk[1] + 0.13, 0)], 'rgba(220,215,200,0.22)', 0.8);
    K.patch(P, -1, 0.66, 1, 0.8, [46, 46, 46]);
    K.ln([P(-1, 0.73, 0), P(1, 0.73, 0)], 'rgba(210,200,170,0.2)', 1, [6, 8]);
  }
  _xCables(K, P, S, al) {
    const uc = 'rgba(212,181,116,' + al + ')', mv = (S.meter[1] + S.meter[3]) / 2, hu = S.hall[2], swv = (S.sw[0] + S.sw[1]) / 2;
    K.ln([P(1, mv, 0), P(S.meter[2], mv, 0)], uc, 1.2, [4, 4]);
    K.ln([P(S.meter[0], mv, 0), P(S.kiosk[2], mv, 0)], uc, 1.2, [4, 4]);
    K.ln([P(S.kiosk[0], mv, 0), P(hu + 0.12, mv, 0), P(hu, swv, 0)], uc, 1.2, [4, 4]);
  }
  _xTrench(K, P, S, ghost, al) {
    const pv = (S.pcs[1] + S.pcs[3]) / 2, swv = (S.sw[0] + S.sw[1]) / 2, hu = S.hall[2];
    K.ln([P(S.pcs[0], pv, 0.013), P(S.pad[0] + 0.03, pv, 0.013), P(S.pad[0] + 0.03, swv + 0.04, 0), P(hu, swv + 0.04, 0)], ghost ? 'rgba(243,238,225,0.5)' : 'rgba(212,181,116,' + (al || 0.38) + ')', 1.2, [4, 4]);
  }
  _xBoundary(K, P, S, glow) {
    const g = K.g, a0 = P(S.bnd, -1, 0), a1 = P(S.bnd, 1, 0);
    g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(212,181,116,' + (0.07 + 0.15 * glow).toFixed(3) + ')'; g.lineWidth = 6 + 3 * glow;
    g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(a1[0], a1[1]); g.stroke(); g.restore();
    K.ln([a0, a1], 'rgba(212,181,116,' + (0.5 + 0.4 * glow).toFixed(3) + ')', 1 + 0.4 * glow, [7, 5]);
  }
  _xYard(K, P, S) {
    const q = [], add = (d, f) => q.push([d, f]);
    [[-0.92, 0.36, 0.8], [-0.9, 0.06, 0.7], [-0.62, 0.9, 0.75], [-0.3, 0.92, 0.65], [0.94, -0.9, 0.7], [0.94, -0.3, 0.6], [0.2, 0.92, 0.6]].forEach((t) => add(t[0] + t[1], () => K.tree(P, t[0], t[1], t[2])));
    [-0.68, -0.44, -0.08].forEach((cu) => add(cu + 0.43, () => {
      const u0 = cu - 0.034, u1 = cu + 0.034, v0 = 0.35, v1 = 0.46;
      K.box(P, u0, v0, u1, v1, 0.008, 0.032, 'dark'); K.box(P, u0 + 0.006, v0 + 0.03, u1 - 0.006, v1 - 0.03, 0.032, 0.052, 'dark');
    }));
    add(-0.1, () => K.kiosk(P, S.kiosk[0], S.kiosk[1], S.kiosk[2], S.kiosk[3], S.kiosk[4]));
    add(0.12, () => { const m = S.meter; K.shadow(P, m[0], m[1], m[2], m[3], m[4]); const B = K.box(P, m[0], m[1], m[2], m[3], 0, m[4], 'sw'); K.quad(B.fv, 0.2, 0.5, 0.8, 0.8, SAMA_BG, 'rgba(212,181,116,0.6)', 0.7); });
    q.sort((x, y) => x[0] - y[0]).forEach((e) => e[1]());
  }
  _xCarport(K, P, S) {
    const c = S.carport;
    [[c[0] + 0.02, c[3] - 0.02], [c[2] - 0.02, c[3] - 0.02], [c[0] + 0.02, c[1] + 0.02], [c[2] - 0.02, c[1] + 0.02]].forEach((p) => K.ln([P(p[0], p[1], 0), P(p[0], p[1], c[4])], K.T ? K.EB : 'rgba(170,174,178,0.8)', 1.2));
    this._xPvTop(K, [P(c[0], c[1], c[4] + 0.03), P(c[2], c[1], c[4] + 0.03), P(c[2], c[3], c[4]), P(c[0], c[3], c[4])]);
    for (let uu = c[0] + 0.05; uu < c[2]; uu += 0.05) K.ln([P(uu, c[1], c[4] + 0.03), P(uu, c[3], c[4])], 'rgba(160,180,200,0.2)', 0.5);
  }
  _xBollards(K, P, S) { [-0.34, -0.17, 0.0, 0.17, 0.31].forEach((v) => K.cyl(P, S.pad[2] - 0.015, v, 0.007, 0.012, 0.05, 'bol')); }
  _xPadBox(K, P, S) { const pd = S.pad; K.box(P, pd[0], pd[1], pd[2], pd[3], 0, 0.012, 'conc'); }
  _xPadZone(K, P, S, al) { const pd = S.pad, z = 0.002; K.ln([P(pd[0], pd[1], z), P(pd[2], pd[1], z), P(pd[2], pd[3], z), P(pd[0], pd[3], z), P(pd[0], pd[1], z)], 'rgba(91,208,141,' + (0.75 * (al === undefined ? 1 : al)).toFixed(3) + ')', 1.1, [5, 4]); }
  _xSetbacks(K, P, S) { const h = S.hall, sb = S.sb, z = h[4] + 0.003; K.ln([P(h[0] + sb, h[1] + sb, z), P(h[2] - sb, h[1] + sb, z), P(h[2] - sb, h[3] - sb, z), P(h[0] + sb, h[3] - sb, z), P(h[0] + sb, h[1] + sb, z)], 'rgba(243,238,225,0.55)', 0.9, [6, 4]); }
  _xGhosts(K, P, S) {
    S.rows.forEach((r) => this._xPvRow(K, P, r, S.hall[4], 'ghost'));
    this._xInv(K, P, S, true); this._xTrench(K, P, S, true);
    S.cabs.forEach((cb) => this._xCabS(K, P, cb, S.cabH, true));
    this._xPcs(K, P, S.pcs, true); this._xEms(K, P, S, true);
  }
  _xBase(K, P, S) { this._xGround(K, P, S); this._xCables(K, P, S, 0.38); this._xBoundary(K, P, S, 0); this._xHall(K, P, S); this._xYard(K, P, S); }
  _xEquip(K, P, S, carport) {
    S.rows.forEach((r) => this._xPvRow(K, P, r, S.hall[4], 'solid'));
    this._xInv(K, P, S, false);
    if (carport) this._xCarport(K, P, S);
    this._xPadBox(K, P, S); this._xTrench(K, P, S, false);
    S.cabs.forEach((cb) => this._xCabS(K, P, cb, S.cabH, false));
    this._xPcs(K, P, S.pcs); this._xEms(K, P, S); this._xBollards(K, P, S);
  }
  _xDrone(K, P, u, v, z, f) {
    const g = K.g, a = K.a, t = (performance.now() - (this._t0 || 0)) / 1000;
    K.box(P, u - 0.016, v - 0.016, u + 0.016, v + 0.016, 0, 0.06, 'dark');
    K.box(P, u - 0.01, v - 0.01, u + 0.01, v + 0.01, 0.06, 0.082, 'mach');
    const cu = u + 0.05, cv = v + 0.05;
    [[0.02, 0.02], [-0.02, 0.02], [0, -0.024]].forEach((o) => K.ln([P(cu, cv, 0.048), P(cu + o[0], cv + o[1], 0)], 'rgba(150,156,160,0.9)', 1.1));
    K.box(P, cu - 0.012, cv - 0.012, cu + 0.012, cv + 0.012, 0.048, 0.064, 'mach');
    const fl = Math.max(0, Math.sin(t * 2.4)); const c = P(cu, cv, 0.058);
    if (fl > 0.92) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(243,238,225,' + ((fl - 0.92) * 9).toFixed(3) + ')'; g.beginPath(); g.arc(c[0], c[1], 9 * a / 60, 0, Math.PI * 2); g.fill(); g.restore(); }
    K.dot(P(cu + 0.012, cv, 0.06), 1.4, '#5BD08D');
  }
  _xGate(g, c, sweep, al) {
    if (al < 0.02) return;
    const r = 15;
    g.save(); g.globalAlpha = al;
    g.fillStyle = 'rgba('+SAMA_BGRGB+',0.85)'; g.beginPath(); g.arc(c[0], c[1], r - 2, 0, Math.PI * 2); g.fill();
    if (sweep >= 1) {
      g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(212,181,116,0.22)'; g.lineWidth = 8; g.beginPath(); g.arc(c[0], c[1], r, 0, Math.PI * 2); g.stroke();
      g.globalCompositeOperation = 'source-over';
    }
    g.strokeStyle = 'rgba(212,181,116,0.7)'; g.lineWidth = 1.3; g.setLineDash([4, 4]); g.beginPath(); g.arc(c[0], c[1], r, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    if (sweep > 0) {
      g.strokeStyle = '#D4B574'; g.lineWidth = 1.6; g.beginPath(); g.arc(c[0], c[1], r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, sweep)); g.stroke();
    }
    if (sweep >= 1) { g.strokeStyle = '#D4B574'; g.lineWidth = 2; g.beginPath(); g.moveTo(c[0] - 6, c[1] + 0.5); g.lineTo(c[0] - 1.5, c[1] + 5); g.lineTo(c[0] + 6.5, c[1] - 4.5); g.stroke(); }
    g.restore();
  }
  _xTrace(g, anchor, x0, y0, W, H, pr, al) {
    if (al < 0.02) return;
    g.save(); g.globalAlpha = al;
    g.strokeStyle = 'rgba(243,238,225,0.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(anchor[0], anchor[1]); g.lineTo(x0 + W * 0.15, y0 + H + 6); g.stroke();
    g.strokeStyle = 'rgba(243,238,225,0.18)'; g.beginPath(); g.moveTo(x0, y0 + H); g.lineTo(x0 + W, y0 + H); g.stroke();
    const f = (t) => 0.3 + 0.16 * Math.sin(t * 18.8 + 1) + 0.08 * Math.sin(t * 44) + 0.42 * Math.exp(-Math.pow((t - 0.64) / 0.022, 2));
    const n = Math.round(120 * pr);
    if (n > 0) { g.beginPath(); for (let i = 0; i <= n; i++) { const t = i / 120, x = x0 + t * W, y = y0 + H - f(t) * H; if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); } g.strokeStyle = 'rgba(212,181,116,0.9)'; g.lineWidth = 1.2; g.stroke(); }
    if (pr > 0.66) {
      const mx = x0 + 0.64 * W, my = y0 + H - f(0.64) * H, pa = Math.min(1, (pr - 0.66) / 0.15);
      g.globalAlpha = al * pa;
      g.strokeStyle = 'rgba(212,181,116,0.5)'; g.beginPath(); g.arc(mx, my, 8, 0, Math.PI * 2); g.stroke();
      g.fillStyle = '#D4B574'; g.beginPath(); g.arc(mx, my, 2.5, 0, Math.PI * 2); g.fill();
      g.font = '600 11px \"IBM Plex Sans\", sans-serif'; g.textAlign = 'left'; g.fillStyle = '#F3EEE1'; g.fillText('SUURIM VÕIMSUS', mx + 12, my + 4);
    }
    g.globalAlpha = al;
    g.font = '600 10px \"IBM Plex Sans\", sans-serif'; g.textAlign = 'left'; g.fillStyle = '#827C71'; g.fillText('ILLUSTRATSIOON', x0, y0 + H + 15);
    g.restore();
  }
  _xCtrl(K, P, S, al) {
    if (al < 0.02) return;
    const c = 'rgba(91,208,141,' + al.toFixed(3) + ')', d = [3, 4], e = S.ems, cb = S.cabs, uc = 0.655, cf = cb[0][2], m = S.meter, hu = S.hall[2], pv = (S.pcs[1] + S.pcs[3]) / 2, iv = (S.inv[0] + S.inv[1]) / 2, mid = (b) => (b[1] + b[3]) / 2;
    K.ln([P(e[0], e[1], 0.1), P(e[0], e[1], 0.004), P(uc, e[1], 0.004), P(uc, mid(cb[0]), 0.004), P(cf, mid(cb[0]), 0.07)], c, 1, d);
    [cb[1], cb[2]].forEach((b) => K.ln([P(uc, mid(b), 0.004), P(cf, mid(b), 0.07)], c, 1, d));
    K.ln([P(uc, pv, 0.004), P(S.pcs[2], pv, 0.06)], c, 1, d);
    K.ln([P(uc, mid(cb[0]), 0.004), P(uc, -0.55, 0.004), P((m[0] + m[2]) / 2, -0.55, 0.004), P((m[0] + m[2]) / 2, m[3], 0.05)], c, 1, d);
    K.ln([P(S.pad[0] + 0.015, pv, 0.004), P(S.pad[0] + 0.015, iv, 0.004), P(hu + 0.022, iv, 0.1)], c, 1, d);
  }
  _xAgg(K, P, S, g, al) {
    if (al < 0.02) return;
    const e = S.ems, a0 = P(e[0], e[1], 0.15), a1 = P(1.3, -0.6, 0.9);
    g.save(); g.globalAlpha = al;
    K.ln([a0, a1], 'rgba(91,208,141,0.6)', 1, [2, 5]);
    g.font = '600 11px \"IBM Plex Sans\", sans-serif'; g.textAlign = 'right'; g.fillStyle = '#A39C8E'; g.fillText('AGREGAATOR', a1[0] - 4, a1[1] - 8);
    g.restore();
  }
  _xFlowPts(P, S) {
    const H = S.hall[4], hu = S.hall[2], iv = (S.inv[0] + S.inv[1]) / 2, pv = (S.pcs[1] + S.pcs[3]) / 2, swv = (S.sw[0] + S.sw[1]) / 2;
    return [
      { pts: [P(0.04, iv, H + 0.02), P(hu, iv, H + 0.01), P(hu + 0.012, iv, 0.14)], rgb: '91,208,141' },
      { pts: [P(S.pcs[0], pv, 0.04), P(S.pad[0] + 0.03, pv, 0.013), P(S.pad[0] + 0.03, swv + 0.04, 0.01), P(hu + 0.01, swv + 0.04, 0.05)], rgb: '212,181,116' }
    ];
  }
  _xPulse(g, pts, ph, rgb, al) {
    const seg = [], L = [0];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L.push(L[i - 1] + d); }
    const tot = L[L.length - 1], at = (s) => { s = Math.max(0, Math.min(tot, s)); let i = 1; while (i < L.length - 1 && L[i] < s) i++; const f = seg[i - 1] ? (s - L[i - 1]) / seg[i - 1] : 0; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]; };
    g.save(); g.globalAlpha = al;
    g.strokeStyle = 'rgba(' + rgb + ',0.28)'; g.lineWidth = 1.2; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
    const head = ph * (tot + 40) - 10, tail = head - 26;
    if (head > 0 && tail < tot) {
      const n = 10;
      for (let k = 0; k < n; k++) {
        const s0 = tail + (head - tail) * k / n, s1 = tail + (head - tail) * (k + 1) / n;
        if (s1 < 0 || s0 > tot) continue;
        const p0 = at(s0), p1 = at(s1), a = (k + 1) / n;
        g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(' + rgb + ',' + (0.28 * a).toFixed(3) + ')'; g.lineWidth = 6; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke();
        g.globalCompositeOperation = 'source-over'; g.strokeStyle = 'rgba(' + rgb + ',' + (0.9 * a).toFixed(3) + ')'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke();
      }
    }
    g.restore();
  }
  _procDraw(c, ht, time) {
    const { g, w, h } = c, S = this._xS(), res = this.state.board ? 1 : Math.min(2, window.devicePixelRatio || 1), geo = this._xGeo(w, h, 1);
    this._xBg(g, w, h);
    const base = this._xLayer('hb', w, h, res, geo, (K, P, S2) => this._xBase(K, P, S2));
    const full = this._xLayer('hf', w, h, res, geo, (K, P, S2) => { this._xBase(K, P, S2); this._xEquip(K, P, S2, false); });
    const st = this._xStyle(), K = this._kit(g, geo.a, st.T, st.SC), P = K.P(geo.ox, geo.oy);
    g.lineCap = 'round'; g.lineJoin = 'round';
    const sm = (v) => this._sm(v), cl = (v) => Math.max(0, Math.min(1, v)), B = this._HB;
    const b = ht >= this._HEND ? 5 : ht >= B[4] ? 4 : ht >= B[3] ? 3 : ht >= B[2] ? 2 : ht >= B[1] ? 1 : 0, lt = ht - (b === 5 ? this._HEND : B[b]);
    const labs = [], small = w < 480, lab = (s, p, dx, dy, al) => { if (!small && al > 0.02) labs.push({ t: 'c', p, dx, dy, s, al }); };
    const m = S.meter, gateC = P((m[0] + m[2]) / 2, (m[1] + m[3]) / 2, m[4] + 0.06);
    const H = S.hall[4], hv = S.hall, NP = 4, bw = (hv[3] - hv[1]) / NP, P0 = 0.6, PD = 1.5, zd = 0.52;
    const bands = (upTo, al) => {
      if (al < 0.02) return;
      g.save(); g.globalAlpha = al;
      for (let k = 0; k < NP; k++) {
        const q = cl((upTo - P0 - k * PD) / PD); if (q <= 0) continue;
        const qq = Math.min(1, q / 0.85), uA = k % 2 ? hv[0] : hv[2], uB = k % 2 ? hv[2] : hv[0], ucur = uA + (uB - uA) * qq;
        const v0 = hv[1] + k * bw, v1 = v0 + bw, a0 = Math.min(uA, ucur), a1 = Math.max(uA, ucur);
        K.fill([P(a0, v0, H + 0.002), P(a1, v0, H + 0.002), P(a1, v1, H + 0.002), P(a0, v1, H + 0.002)], 'rgba(212,181,116,0.07)');
        for (let v = v0 + 0.012; v < v1; v += 0.024) K.ln([P(a0, v, H + 0.002), P(a1, v, H + 0.002)], 'rgba(212,181,116,0.13)', 0.6);
      }
      g.restore();
    };
    let gateSweep = 0, gateAl = 0, trPr = 0, trAl = 0;
    if (b === 5) {
      const f = sm(lt / (this._HLOOP - this._HEND));
      g.drawImage(base, 0, 0, w, h);
      g.globalAlpha = 1 - f; g.drawImage(full, 0, 0, w, h); g.globalAlpha = 1;
      this._xCtrl(K, P, S, 0.75 * (1 - f));
      gateSweep = 1; gateAl = 1 - f;
    } else if (b === 0) {
      g.drawImage(base, 0, 0, w, h);
      this._xBoundary(K, P, S, 0.55 + 0.45 * Math.sin(time * 0.9));
      lab('ARVESTI', P(0.805, -0.74, 0.1), -14, 46, sm((lt - 0.3) / 0.8));
      lab('OMA ALAJAAM', P(0.6, -0.75, 0.16), -34, -30, sm((lt - 0.5) / 0.8));
      trPr = this._rm ? 1 : cl((lt - 0.8) / 3); trAl = 1;
    } else if (b === 1) {
      g.drawImage(base, 0, 0, w, h);
      trPr = 1; trAl = 1 - sm(lt / 0.8);
      const endP = P0 + NP * PD;
      const dAl = sm((lt - 0.1) / 0.5) * (1 - sm((lt - endP) / 0.6));
      if (dAl > 0.02) {
        const q = cl((lt - P0) / (endP - P0)), e = 0.07, cs = [[hv[2] + e, hv[1] - e], [hv[2] + e, hv[3] + e], [hv[0] - e, hv[3] + e]];
        const seg = Math.min(1, Math.floor(q * 2)), qq = q * 2 - seg, A0 = cs[seg], A1 = cs[seg + 1];
        const u = A0[0] + (A1[0] - A0[0]) * qq, v = A0[1] + (A1[1] - A0[1]) * qq;
        const trail = [cs[0]]; for (let k = 1; k <= seg; k++) trail.push(cs[k]); trail.push([u, v]);
        K.ln(trail.map((p) => P(p[0], p[1], 0.003)), 'rgba(212,181,116,0.45)', 1, [5, 7]);
        g.save(); g.globalAlpha = dAl; this._xDrone(K, P, u, v, 0, 0); g.restore();
      }
      const sAl = sm((lt - endP - 0.1) / 0.9);
      if (sAl > 0.02) { g.save(); g.globalAlpha = sAl; this._xSetbacks(K, P, S); this._xPadZone(K, P, S); g.restore(); }
      lab('SERVAKAUGUS', P(-0.6, -0.05, H + 0.002), -26, 30, sm((lt - endP - 0.4) / 0.7));
      lab('SALVESTI KOHT', P(S.pad[0], S.pad[3], 0), -28, 26, sm((lt - endP - 0.4) / 0.7));
    } else if (b === 2) {
      g.drawImage(base, 0, 0, w, h);
      this._xSetbacks(K, P, S); this._xPadZone(K, P, S);
      const ga = sm(lt / 1.4); g.save(); g.globalAlpha = ga; this._xGhosts(K, P, S); g.restore();
      gateAl = sm((lt - 0.6) / 0.6); gateSweep = this._rm ? 1 : cl((lt - 2) / 1);
      lab('SERVAKAUGUS', P(-0.6, -0.05, H + 0.002), -26, 30, 1 - sm((lt - 1.4) / 0.8));
      lab('SALVESTI KOHT', P(S.pad[0], S.pad[3], 0), -28, 26, 1 - sm((lt - 1.4) / 0.8));
      lab('VÕRGUETTEVÕTJA KINNITUS', P(0.805, -0.74, 0.22), -40, -46, sm((lt - 3.2) / 0.8));
    } else if (b === 3) {
      gateSweep = 1; gateAl = 1;
      if (lt > 5.6) g.drawImage(full, 0, 0, w, h);
      else {
        g.drawImage(base, 0, 0, w, h);
        const sbA = 1 - sm(lt / 1); if (sbA > 0.02) { g.save(); g.globalAlpha = sbA; this._xSetbacks(K, P, S); g.restore(); }
        const ePv = sm((lt - 0.3) / 1.2);
        if (ePv < 1) { g.save(); g.globalAlpha = 1 - ePv; S.rows.forEach((r) => this._xPvRow(K, P, r, H, 'ghost')); this._xInv(K, P, S, true); g.restore(); }
        if (ePv > 0) { g.save(); g.globalAlpha = ePv; S.rows.forEach((r) => this._xPvRow(K, P, r, H, 'solid', 0.08 * (1 - ePv))); this._xInv(K, P, S, false); g.restore(); }
        const ePad = sm((lt - 1.6) / 0.6);
        if (ePad < 1) this._xPadZone(K, P, S, 1 - ePad);
        if (ePad > 0) { g.save(); g.globalAlpha = ePad; this._xPadBox(K, P, S); this._xBollards(K, P, S); g.restore(); }
        const eTr = sm((lt - 4.0) / 0.8); this._xTrench(K, P, S, eTr < 0.5);
        S.cabs.forEach((cb, i) => {
          const e = sm((lt - (1.8 + 0.55 * i)) / 0.9);
          if (e < 1) { g.save(); g.globalAlpha = 1 - e; this._xCabS(K, P, cb, S.cabH, true); g.restore(); }
          if (e > 0) { g.save(); g.globalAlpha = e; this._xCabS(K, P, cb, S.cabH, false, 0.14 * (1 - e)); g.restore(); }
        });
        const eP = sm((lt - 4.0) / 0.8);
        if (eP < 1) { g.save(); g.globalAlpha = 1 - eP; this._xPcs(K, P, S.pcs, true); g.restore(); }
        if (eP > 0) { g.save(); g.globalAlpha = eP; this._xPcs(K, P, S.pcs, false, 0.12 * (1 - eP)); g.restore(); }
        const eE = sm((lt - 4.9) / 0.6);
        if (eE < 1) { g.save(); g.globalAlpha = 1 - eE; this._xEms(K, P, S, true); g.restore(); }
        if (eE > 0) { g.save(); g.globalAlpha = eE; this._xEms(K, P, S, false, 0.1 * (1 - eE)); g.restore(); }
      }
      this._xCtrl(K, P, S, 0.75 * sm((lt - 5.6) / 1));
    } else {
      gateSweep = 1; gateAl = 1;
      g.drawImage(full, 0, 0, w, h);
      this._xCtrl(K, P, S, 0.75);
      const fl = this._xFlowPts(P, S), fa = sm(lt / 0.8);
      fl.forEach((f, i) => this._xPulse(g, f.pts, ((time / 4) + i * 0.5) % 1, f.rgb, fa));
      const e = P(S.ems[0], S.ems[1], 0.115), br = 0.5 + 0.5 * Math.sin(time * 1.3);
      g.save(); g.globalAlpha = fa; [12, 20].forEach((r, i) => { g.strokeStyle = 'rgba(91,208,141,' + ((0.45 - i * 0.2) * (0.6 + 0.4 * br)).toFixed(3) + ')'; g.lineWidth = 1; g.beginPath(); g.arc(e[0], e[1], r, 0, Math.PI * 2); g.stroke(); }); g.restore();
      this._xAgg(K, P, S, g, sm((lt - 0.2) / 0.8));
      lab('JUHTIMINE · EMS', P(S.ems[0], S.ems[1], 0.14), 24, 30, sm((lt - 0.4) / 0.8));
    }
    this._xVig(g, w, h);
    this._xGate(g, gateC, gateSweep, gateAl);
    this._labDraw(g, labs, (x, y) => [x, y], time);
    if (trAl > 0.02) { const W = Math.min(160, w * 0.28), an = P((m[0] + m[2]) / 2, (m[1] + m[3]) / 2, m[4]); this._xTrace(g, an, w - W - (small ? 70 : 104), 24, W, small ? 40 : 50, trPr, trAl); }
  }
  _exLayer(k, w, h, res, geo) {
    return this._xLayer('xa' + k, w, h, res, geo, (K, P, S, g2) => {
      const labs = [], L = (s, p, dx, dy) => { if (w >= 480) labs.push({ t: 'c', p, dx, dy, s, al: 1 }); };
      this._xBase(K, P, S);
      if (k === 6) {
        this._xSetbacks(K, P, S); this._xPadZone(K, P, S); this._xGhosts(K, P, S);
        L('PROJEKT', P(S.pad[0], S.pad[3], 0), -28, 26);
      } else {
        this._xEquip(K, P, S, true);
        if (k !== 5) { g2.fillStyle = 'rgba('+SAMA_BGRGB+',0.6)'; g2.fillRect(0, 0, w, h); }
        if (k === 1) {
          S.rows.forEach((r) => this._xPvRow(K, P, r, S.hall[4], 'solid')); this._xInv(K, P, S, false); this._xCarport(K, P, S);
          L('PÄIKESEPANEELID', P(-0.36, -0.5, S.hall[4] + 0.03), 30, -58); L('PÄIKESEVARJUALUNE', P(-0.41, 0.41, 0.13), 34, 44);
        } else if (k === 2) {
          this._xPadBox(K, P, S); S.cabs.forEach((cb) => this._xCabS(K, P, cb, S.cabH, false)); this._xPcs(K, P, S.pcs); this._xBollards(K, P, S);
          L('AKUPANGAD', P(0.53, -0.08, 0.16), 34, -40);
        } else if (k === 3) {
          this._xEms(K, P, S); this._xCtrl(K, P, S, 0.95); this._xAgg(K, P, S, g2, 1);
          L('JUHTIMINE · EMS', P(S.ems[0], S.ems[1], 0.14), 24, 30);
        } else if (k === 4) {
          this._xBoundary(K, P, S, 1); this._xCables(K, P, S, 0.9); this._xTrench(K, P, S, false, 0.9); this._xSetbacks(K, P, S); this._xPadZone(K, P, S);
          const m = S.meter; this._xGate(g2, P((m[0] + m[2]) / 2, (m[1] + m[3]) / 2, m[4] + 0.06), 1, 1);
          L('ARVESTI', P(0.805, -0.74, 0.1), -14, 46); L('VÕRGUETTEVÕTJA KINNITUS', P(0.805, -0.74, 0.22), -40, -46);
        } else if (k === 5) {
          this._xCtrl(K, P, S, 0.45);
          const rings = [P(0.53, -0.255, 0.17), P(0.53, -0.085, 0.17), P(0.53, 0.085, 0.17), P(0.53, 0.24, 0.13), P(S.hall[2] + 0.011, -0.2, 0.15), P(-0.3, -0.45, S.hall[4] + 0.03)];
          rings.forEach((p) => { g2.strokeStyle = 'rgba(91,208,141,0.75)'; g2.lineWidth = 1; g2.beginPath(); g2.arc(p[0], p[1], 7, 0, Math.PI * 2); g2.stroke(); });
          L('JÄLGIMINE', P(S.ems[0], S.ems[1], 0.14), 24, 30);
        }
      }
      this._labDraw(g2, labs, (x, y) => [x, y], 0);
    });
  }
  /* ---------- 6A.5: homes, the two-site hero scene, the house scene ---------- */
  _rowsIn(h, hv, sb) {
    const u0 = h[0] + sb, u1 = h[2] - sb, v0 = h[1] + sb, v1 = h[3] - sb, rows = [];
    for (let vr = v0; vr + 0.055 <= v1 + 0.001; vr += 0.094) {
      const cl = 0.035;
      if (hv && vr + 0.055 > hv[1] - cl && vr < hv[3] + cl) {
        if (hv[0] - cl - u0 > 0.08) rows.push([u0, vr, hv[0] - cl]);
        if (u1 - (hv[2] + cl) > 0.08) rows.push([hv[2] + cl, vr, u1]);
      } else rows.push([u0, vr, u1]);
    }
    return rows;
  }
  _hRoofPt(P, h, s, t, dz) { const vm = (h[1] + h[3]) / 2; return P(h[0] + (h[2] - h[0]) * s, h[3] + (vm - h[3]) * t, h[4] + h[5] * t + (dz || 0)); }
  _hPanels(K, P, h, cols, rows) {
    const q = (s, t) => this._hRoofPt(P, h, s, t, 0.006), ms = 0.08, mt = 0.14, gs = 0.012, gt = 0.035;
    const cw = (1 - 2 * ms - gs * (cols - 1)) / cols, rh = (1 - 2 * mt - gt * (rows - 1)) / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const s0 = ms + c * (cw + gs), t0 = mt + r * (rh + gt);
      this._xPvTop(K, [q(s0, t0), q(s0 + cw, t0), q(s0 + cw, t0 + rh), q(s0, t0 + rh)]);
      K.ln([q(s0 + cw / 2, t0), q(s0 + cw / 2, t0 + rh)], K.T ? 'rgba(91,208,141,0.3)' : 'rgba(160,180,200,0.2)', 0.5);
    }
  }
  _hSolarRoof(K, P, h) {
    const q = (s, t) => this._hRoofPt(P, h, s, t, 0.004), top = [q(0.02, 0.04), q(0.98, 0.04), q(0.98, 0.97), q(0.02, 0.97)];
    if (K.T) K.fill(top, '#111410', K.EN, 0.8);
    else { const gr = K.g.createLinearGradient(top[0][0], top[0][1], top[2][0], top[2][1]); gr.addColorStop(0, K.C([30, 38, 52])); gr.addColorStop(0.5, K.C([16, 22, 32])); gr.addColorStop(1, K.C([40, 50, 66])); K.fill(top, gr, 'rgba(150,170,190,0.32)', 0.6); }
    const lc = K.T ? 'rgba(91,208,141,0.25)' : 'rgba(150,170,190,0.16)';
    for (let i = 1; i < 9; i++) K.ln([q(0.02, 0.04 + 0.93 * i / 9), q(0.98, 0.04 + 0.93 * i / 9)], lc, 0.5);
    for (let i = 1; i < 16; i++) { const s = 0.02 + 0.96 * i / 16; K.ln([q(s, 0.04), q(s, 0.97)], lc, 0.4); }
  }
  _hHouse(K, P, h, roof) {
    K.house(P, h[0], h[1], h[2], h[3], h[4], h[5]);
    if (roof === 'panels') this._hPanels(K, P, h, h[6] || 5, h[7] || 2);
    if (roof === 'solar') this._hSolarRoof(K, P, h);
  }
  _hDev(K, P, h, o) {
    const u = h[2], v0 = h[1], L = h[3] - h[1], at = (f) => v0 + L * f, sc = h[4] / 0.17, T = K.T;
    const r = {};
    if (o.meter) { const B = K.box(P, u, at(0.8), u + 0.02, at(0.9), 0.06 * sc, 0.13 * sc, 'sw'); K.dot(B.fu(0.5, 0.7), 1.4, '#D4B574'); r.meter = [u + 0.02, at(0.85), 0.1 * sc]; }
    if (o.inv) { const B = K.box(P, u, at(0.54), u + 0.022, at(0.68), 0.07 * sc, 0.15 * sc, 'pcs'); for (let i = 0; i < 3; i++) K.ln([B.fu(0.2, 0.3 + i * 0.18), B.fu(0.8, 0.3 + i * 0.18)], T ? 'rgba(212,181,116,0.35)' : 'rgba(0,0,0,0.4)', 0.7); r.inv = [u + 0.022, at(0.61), 0.11 * sc]; }
    if (o.bat) { const B = K.box(P, u, at(0.18), u + 0.045, at(0.44), 0.012, 0.16 * sc, 'cab'); K.quad(B.fu, 0.12, 0.08, 0.88, 0.92, null, T ? 'rgba(91,208,141,0.4)' : 'rgba(0,0,0,0.4)'); K.dot(B.fu(0.8, 0.86), 1.3, '#5BD08D'); r.bat = [u + 0.045, at(0.31), 0.09 * sc]; }
    if (o.ems) { const B = K.box(P, u, at(0.71), u + 0.016, at(0.77), 0.16 * sc, 0.2 * sc, 'pcb'); K.dot(B.fu(0.5, 0.5), 1.1, '#5BD08D'); r.ems = [u + 0.016, at(0.74), 0.18 * sc]; }
    return r;
  }
  _hsS() {
    if (this._hss) return this._hss;
    const s = {
      hall: [-0.24, -0.96, 0.56, -0.34, 0.2], sw: [-0.62, -0.52], hvac: [0.08, -0.78, 0.22, -0.66], inv: [-0.48, -0.4],
      pad: [0.64, -0.66, 0.93, -0.18], cabs: [[0.7, -0.6, 0.83, -0.49], [0.7, -0.46, 0.83, -0.35]], pcs: [0.7, -0.32, 0.83, -0.21, 0.13],
      kiosk: [0.64, -0.96, 0.8, -0.8, 0.13],
      hA: [-0.66, 0.26, -0.26, 0.58, 0.1, 0.09, 4, 2], hB: [0.06, 0.3, 0.44, 0.6, 0.1, 0.09],
      road: [-0.12, 0.06], poles: [-0.85, -0.35, 0.15, 0.65], pv: 0.1
    };
    s.rows = this._rowsIn(s.hall, s.hvac, 0.06);
    return (this._hss = s);
  }
  _hsGround(K, P, S) {
    K.slab(P, 1);
    K.patch(P, -0.82, 0.16, -0.08, 0.8, [44, 56, 44]); K.patch(P, -0.02, 0.16, 0.62, 0.8, [44, 56, 44]);
    K.patch(P, -0.22, 0.06, -0.1, 0.5, [64, 64, 62]); K.patch(P, 0.46, 0.06, 0.56, 0.44, [64, 64, 62]);
    K.patch(P, -0.3, -1, 1, -0.12, [58, 58, 56]);
    K.patch(P, -1, S.road[0], 1, S.road[1], [46, 46, 46]);
    K.ln([P(-1, (S.road[0] + S.road[1]) / 2, 0), P(1, (S.road[0] + S.road[1]) / 2, 0)], 'rgba(210,200,170,0.2)', 1, [6, 8]);
    K.ln([P(S.kiosk[0], -0.88, 0), P(S.hall[2] + 0.04, -0.88, 0), P(S.hall[2], (S.sw[0] + S.sw[1]) / 2, 0)], 'rgba(212,181,116,0.3)', 1.1, [4, 4]);
    K.box(P, S.pad[0], S.pad[1], S.pad[2], S.pad[3], 0, 0.01, 'conc');
  }
  _hsItems(K, P, S) {
    const it = [], add = (d, gr, f) => it.push([d, gr, f]);
    [[-0.92, -0.92, 0.85], [-0.72, -0.97, 0.75], [-0.86, -0.64, 0.8], [-0.56, -0.82, 0.7], [-0.95, -0.38, 0.75], [-0.62, -0.56, 0.65], [-0.92, 0.32, 0.7], [-0.93, 0.62, 0.65], [0.72, 0.36, 0.6], [0.8, 0.66, 0.7], [0.96, -0.94, 0.6]].forEach((t) => add(t[0] + t[1], 'n', () => K.tree(P, t[0], t[1], t[2])));
    add(S.hall[0] + S.hall[1] + 0.6, 'b', () => { this._xHall(K, P, S); S.rows.forEach((r) => this._xPvRow(K, P, r, S.hall[4], 'solid')); });
    add(-0.2, 'b', () => K.kiosk(P, S.kiosk[0], S.kiosk[1], S.kiosk[2], S.kiosk[3], S.kiosk[4]));
    S.cabs.forEach((cb) => add(cb[0] + cb[1] + 0.3, 'b', () => this._xCabS(K, P, cb, 0.13, false)));
    add(S.pcs[0] + S.pcs[1] + 0.3, 'b', () => this._xPcs(K, P, S.pcs));
    add(S.pad[2] + S.pad[3], 'b', () => [-0.6, -0.42, -0.24].forEach((v) => K.cyl(P, S.pad[2] - 0.012, v, 0.006, 0.01, 0.045, 'bol')));
    const hA = S.hA, hB = S.hB;
    add((hA[0] + hA[2] + hA[1] + hA[3]) / 2, 'h', () => { this._hHouse(K, P, hA, 'panels'); this._hDev(K, P, hA, { bat: true, meter: true }); });
    add((hB[0] + hB[2] + hB[1] + hB[3]) / 2, 'h', () => { this._hHouse(K, P, hB, 'solar'); this._hDev(K, P, hB, { meter: true }); });
    add(-0.16 + 0.24, 'n', () => { const u0 = -0.2, u1 = -0.12, v0 = 0.14, v1 = 0.25; K.box(P, u0, v0, u1, v1, 0.008, 0.03, 'dark'); K.box(P, u0 + 0.008, v0 + 0.025, u1 - 0.008, v1 - 0.025, 0.03, 0.048, 'dark'); });
    S.poles.forEach((u) => add(u + S.pv, 'n', () => K.pole(P, u, S.pv, 0.22, 'v', false)));
    return it.sort((x, y) => x[0] - y[0]);
  }
  _hsWires(K, P, S) {
    const cw = K.T ? 'rgba(212,181,116,0.5)' : K.wc(0.5), A = (u) => this._poatt(u, S.pv, 0.22, 'v');
    for (let j = 1; j < S.poles.length; j++) { const a = A(S.poles[j - 1]), b = A(S.poles[j]); for (let i = 0; i < 3; i++) K.wireW(P, a[i], b[i], 0.035, cw, 0.8); }
    const lv = K.T ? 'rgba(243,238,225,0.3)' : K.wc(0.38);
    K.wireW(P, [-0.35, S.pv, 0.2], [-0.3, S.hA[1], S.hA[4] - 0.01], 0.05, lv, 0.7);
    K.wireW(P, [0.15, S.pv, 0.2], [0.12, S.hB[1], S.hB[4] - 0.01], 0.05, lv, 0.7);
  }
  _hsGeo(w, h) { const a = Math.min(w / 2.72, h / 1.92); return { a, ox: w * 0.5 - 0.2 * a, oy: h * 0.5 + 0.12 * a }; }
  _hsLayer(k, w, h, res, geo) {
    return this._xLayer('hs' + k, w, h, res, geo, (K, P, _S, g2) => {
      const S = this._hsS(), it = this._hsItems(K, P, S), labs = [], L = (s, p, dx, dy) => { if (w >= 480) labs.push({ t: 'c', p, dx, dy, s, al: 1 }); };
      this._hsGround(K, P, S);
      it.forEach((e) => e[2]());
      this._hsWires(K, P, S);
      if (k) {
        g2.fillStyle = 'rgba('+SAMA_BGRGB+',0.55)'; g2.fillRect(0, 0, w, h);
        if (k === 1) K.box(P, S.pad[0], S.pad[1], S.pad[2], S.pad[3], 0, 0.01, 'conc');
        it.forEach((e) => { if (e[1] === (k === 1 ? 'b' : 'h')) e[2](); });
        if (k === 1) { L('PÄIKESEPANEELID', P(0.0, -0.62, S.hall[4] + 0.03), -36, -40); L('AKUPANK', P(0.77, -0.48, 0.13), 30, -34); }
        else { L('PÄIKESEPANEELID', P(-0.5, 0.5, 0.15), 24, -62); L('PÄIKESEKATUS', P(0.25, 0.52, 0.14), 34, 40); L('KODUAKU', P(-0.235, 0.34, 0.06), 26, 56); }
      } else {
        L('TÖÖSTUSKINNISTU', P(0.12, -0.9, S.hall[4]), -34, -34); L('ERAMU', P(-0.46, 0.42, 0.19), 26, -58);
      }
      this._labDraw(g2, labs, (x, y) => [x, y], 0);
    });
  }
  _hsDraw(c, time) {
    const { g, w, h } = c, res = this.state.board ? 1 : Math.min(2, window.devicePixelRatio || 1), geo = this._hsGeo(w, h), S = this._hsS();
    this._xBg(g, w, h);
    const k = this.state.hhl || 0;
    if (k !== this._hsK) { this._hsPrev = this._hsK || 0; this._hsK = k; this._hsF = performance.now(); }
    const f = (this._hsF && !this._rm) ? this._sm((performance.now() - this._hsF) / 450) : 1;
    const cur = this._hsLayer(k, w, h, res, geo);
    if (f < 1) { g.drawImage(this._hsLayer(this._hsPrev, w, h, res, geo), 0, 0, w, h); g.globalAlpha = f; g.drawImage(cur, 0, 0, w, h); g.globalAlpha = 1; }
    else g.drawImage(cur, 0, 0, w, h);
    if (!k && !this._rm) {
      const st = this._xStyle(), K = this._kit(g, geo.a, st.T, st.SC), P = K.P(geo.ox, geo.oy), ph = (time / 7) % 2, which = ph < 1 ? 1 : 2, loc = ph % 1;
      const al = 0.26 * Math.sin(Math.PI * Math.min(1, loc / 0.9)) ;
      g.save(); g.globalCompositeOperation = 'lighter'; g.lineWidth = 3; g.strokeStyle = 'rgba(91,208,141,' + Math.max(0, al).toFixed(3) + ')';
      const poly = (pts) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.stroke(); };
      if (which === 1) { const hl = S.hall, z = hl[4] + 0.03; poly([P(hl[0], hl[1], z), P(hl[2], hl[1], z), P(hl[2], hl[3], z), P(hl[0], hl[3], z)]); poly([P(S.pad[0], S.pad[1], 0), P(S.pad[2], S.pad[1], 0), P(S.pad[2], S.pad[3], 0), P(S.pad[0], S.pad[3], 0)]); }
      else [S.hA, S.hB].forEach((hh) => poly([this._hRoofPt(P, hh, 0, 0, 0.01), this._hRoofPt(P, hh, 1, 0, 0.01), this._hRoofPt(P, hh, 1, 1, 0.01), this._hRoofPt(P, hh, 0, 1, 0.01)]));
      g.restore();
    }
    this._xVig(g, w, h);
  }
  _hxS() {
    if (this._hxs) return this._hxs;
    return (this._hxs = { house: [-0.62, -0.52, 0.28, 0.18, 0.17, 0.15, 6, 2], street: [0.58, 0.76], drive: [0.36, 0.0, 0.62, 0.58], car: [0.43, 0.2, 0.55, 0.42], cab: [0.7, 0.44, 0.8, 0.54, 0.09] });
  }
  _hxBase(K, P, S, roof) {
    K.slab(P, 1);
    K.patch(P, -1, -1, 1, S.street[0], [44, 56, 44]);
    K.patch(P, S.drive[0], S.drive[1], S.drive[2], S.drive[3], [66, 66, 64]);
    K.patch(P, -1, S.street[0], 1, S.street[1], [46, 46, 46]);
    K.ln([P(-1, (S.street[0] + S.street[1]) / 2, 0), P(1, (S.street[0] + S.street[1]) / 2, 0)], 'rgba(210,200,170,0.2)', 1, [6, 8]);
    this._hxCable(K, P, S, 0.32);
    const it = [], add = (d, f) => it.push([d, f]), h = S.house;
    [[-0.9, -0.85, 0.85], [-0.5, -0.92, 0.75], [0.1, -0.92, 0.8], [0.6, -0.8, 0.7], [0.88, -0.42, 0.75], [-0.93, -0.2, 0.7], [-0.9, 0.32, 0.65], [0.9, 0.1, 0.6]].forEach((t) => add(t[0] + t[1], () => K.tree(P, t[0], t[1], t[2])));
    add(-0.95 + 0.52, () => K.box(P, -0.95, 0.5, 0.3, 0.54, 0, 0.035, 'tree'));
    add((h[0] + h[2] + h[1] + h[3]) / 2, () => { this._hHouse(K, P, h, roof); this._hDev(K, P, h, { bat: true, meter: true, ems: true }); });
    add(S.car[0] + S.car[1] + 0.3, () => { const c = S.car; K.box(P, c[0], c[1], c[2], c[3], 0.01, 0.045, 'dark'); K.box(P, c[0] + 0.012, c[1] + 0.05, c[2] - 0.012, c[3] - 0.05, 0.045, 0.075, 'dark'); });
    add(S.cab[0] + S.cab[1], () => { const c = S.cab; K.box(P, c[0], c[1], c[2], c[3], 0, c[4], 'kiosk'); });
    it.sort((x, y) => x[0] - y[0]).forEach((e) => e[1]());
  }
  _hxCable(K, P, S, al) {
    const h = S.house, mv = h[1] + (h[3] - h[1]) * 0.85;
    K.ln([P(S.cab[0], (S.cab[1] + S.cab[3]) / 2, 0), P(h[2] + 0.06, (S.cab[1] + S.cab[3]) / 2, 0), P(h[2] + 0.06, mv, 0), P(h[2] + 0.02, mv, 0.06 * h[4] / 0.17)], 'rgba(212,181,116,' + al + ')', 1.2, [4, 4]);
  }
  _hxCtrl(K, P, S, al) {
    const h = S.house, u = h[2] + 0.003, at = (f) => h[1] + (h[3] - h[1]) * f, sc = h[4] / 0.17, z = 0.215 * sc, c = 'rgba(91,208,141,' + al + ')', d = [3, 4];
    K.ln([P(u, at(0.31), z), P(u, at(0.85), z)], c, 1, d);
    [[0.31, 0.16], [0.61, 0.15], [0.85, 0.13], [0.74, 0.2]].forEach((q) => K.ln([P(u, at(q[0]), z), P(u, at(q[0]), q[1] * sc)], c, 1, d));
    K.ln([P(u, at(0.98), z), P(u, h[3], h[4])], c, 1, d);
    K.ln([P(u, at(0.85), z), P(u, at(0.98), z)], c, 1, d);
  }
  _hxGeo(w, h) { const a = Math.min(w / 2.9, h / 2.1); return { a, ox: w * 0.5 + 0.06 * a, oy: h * 0.5 + 0.14 * a }; }
  _hxLayer(k, w, h, res, geo) {
    return this._xLayer('hx' + k, w, h, res, geo, (K, P, _S, g2) => {
      const S = this._hxS(), hh = S.house, labs = [], L = (s, p, dx, dy) => { if (w >= 480) labs.push({ t: 'c', p, dx, dy, s, al: 1 }); };
      this._hxBase(K, P, S, k === 2 ? 'solar' : 'panels');
      g2.fillStyle = 'rgba('+SAMA_BGRGB+',0.5)'; g2.fillRect(0, 0, w, h);
      const sc = hh[4] / 0.17, at = (f) => hh[1] + (hh[3] - hh[1]) * f;
      if (k === 1) { this._hPanels(K, P, hh, hh[6], hh[7]); L('PÄIKESEPANEELID', this._hRoofPt(P, hh, 0.3, 0.6, 0.02), -40, -46); }
      else if (k === 2) { this._hSolarRoof(K, P, hh); L('PÄIKESEKATUS', this._hRoofPt(P, hh, 0.3, 0.6, 0.02), -40, -46); }
      else if (k === 3) { this._hDev(K, P, hh, { bat: true }); L('KODUAKU', P(hh[2] + 0.045, at(0.31), 0.1 * sc), 30, 40); }
      else if (k === 4) { this._hDev(K, P, hh, { ems: true }); this._hxCtrl(K, P, S, 0.9); L('JUHTIMINE', P(hh[2] + 0.016, at(0.74), 0.19 * sc), 34, -36); }
      else if (k === 5) {
        this._hDev(K, P, hh, { meter: true }); this._hxCable(K, P, S, 0.85);
        const pts = [P(hh[2] + 0.045, at(0.31), 0.1 * sc), P(hh[2] + 0.022, at(0.61), 0.12 * sc), P(hh[2] + 0.016, at(0.74), 0.19 * sc), this._hRoofPt(P, hh, 0.5, 0.5, 0.02)];
        pts.forEach((p) => { g2.strokeStyle = 'rgba(91,208,141,0.75)'; g2.lineWidth = 1; g2.beginPath(); g2.arc(p[0], p[1], 7, 0, Math.PI * 2); g2.stroke(); });
        L('ARVESTI', P(hh[2] + 0.02, at(0.85), 0.1 * sc), 34, 40); L('JÄLGIMINE', this._hRoofPt(P, hh, 0.5, 0.5, 0.02), -40, -46);
      }
      this._labDraw(g2, labs, (x, y) => [x, y], 0);
    });
  }
  _exGet(key, w, h, res) {
    const k = parseInt(key.slice(1), 10) || 1;
    return key[0] === 'k' ? this._hxLayer(k, w, h, res, this._hxGeo(w, h)) : this._exLayer(k, w, h, res, this._xGeo(w, h, 1.04));
  }
  _exDraw(c, time) {
    const { g, w, h } = c, res = this.state.board ? 1 : Math.min(2, window.devicePixelRatio || 1), key = this._exKey();
    this._xBg(g, w, h);
    const cur = this._exGet(key, w, h, res), f = (this._exF && !this._rm) ? this._sm((performance.now() - this._exF) / 400) : 1;
    if (f < 1 && this._exPrevKey && this._exPrevKey !== key) { g.drawImage(this._exGet(this._exPrevKey, w, h, res), 0, 0, w, h); g.globalAlpha = f; g.drawImage(cur, 0, 0, w, h); g.globalAlpha = 1; }
    else g.drawImage(cur, 0, 0, w, h);
    const k = parseInt(key.slice(1), 10) || 1, st = this._xStyle(), al = (0.12 + 0.14 * (0.5 + 0.5 * Math.sin(time * 1.1))) * f;
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineWidth = 3;
    const poly = (pts, rgb) => { g.strokeStyle = 'rgba(' + rgb + ',' + al.toFixed(3) + ')'; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.stroke(); };
    const ring = (p, r) => { g.strokeStyle = 'rgba(91,208,141,' + al.toFixed(3) + ')'; g.beginPath(); g.arc(p[0], p[1], r, 0, Math.PI * 2); g.stroke(); };
    if (key[0] === 'k') {
      const geo = this._hxGeo(w, h), K = this._kit(g, geo.a, st.T, st.SC), P = K.P(geo.ox, geo.oy), S = this._hxS(), hh = S.house, sc = hh[4] / 0.17, at = (f2) => hh[1] + (hh[3] - hh[1]) * f2;
      if (k === 1 || k === 2) poly([this._hRoofPt(P, hh, 0, 0, 0.01), this._hRoofPt(P, hh, 1, 0, 0.01), this._hRoofPt(P, hh, 1, 1, 0.01), this._hRoofPt(P, hh, 0, 1, 0.01)], '91,208,141');
      if (k === 3) ring(P(hh[2] + 0.045, at(0.31), 0.09 * sc), 20);
      if (k === 4) ring(P(hh[2] + 0.016, at(0.74), 0.18 * sc), 14);
      if (k === 5) ring(P(hh[2] + 0.02, at(0.85), 0.1 * sc), 14);
    } else {
      const geo = this._xGeo(w, h, 1.04), K = this._kit(g, geo.a, st.T, st.SC), P = K.P(geo.ox, geo.oy), S = this._xS(), hl = S.hall, sb = S.sb, pd = S.pad, e = P(S.ems[0], S.ems[1], 0.115);
      if (k === 1) poly([P(hl[0] + sb, hl[1] + sb, hl[4] + 0.04), P(hl[2] - sb, hl[1] + sb, hl[4] + 0.04), P(hl[2] - sb, hl[3] - sb, hl[4] + 0.04), P(hl[0] + sb, hl[3] - sb, hl[4] + 0.04)], '91,208,141');
      if (k === 2) poly([P(pd[0], pd[1], 0), P(pd[2], pd[1], 0), P(pd[2], pd[3], 0), P(pd[0], pd[3], 0)], '91,208,141');
      if (k === 3 || k === 5) ring(e, 16);
      if (k === 4) { const a0 = P(S.bnd, -1, 0), a1 = P(S.bnd, 1, 0); g.strokeStyle = 'rgba(212,181,116,' + al.toFixed(3) + ')'; g.lineWidth = 8; g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(a1[0], a1[1]); g.stroke(); }
    }
    g.restore();
    this._xVig(g, w, h);
  }
  _prepMap() {
    const m = this._map, A = m.aspect;
    const dots = [];
    const step = 0.0095;
    for (let y = 0.004; y < 1; y += step) {
      for (let x = 0.004; x < 1; x += step / A) {
        const fi = this._inLand(x, y, 'fi'), ee = !fi && this._inLand(x, y, 'ee');
        if (fi || ee) dots.push([x, y, ee ? 1 : 0]);
      }
    }
    this._dots = dots;
    if (!this._mapOn) this._mapOn = { vork: 1, tarbimine: 0, tootmine: 0, salvestid: 1, reservid: 0, tulevik: 0, site: 0 };
    this._mapA = this._mapA || {};
    this._kvxy = null;
  }
  _ll(q) { const b = this._map.bbox; return [(q[0] - b.x0) / (b.x1 - b.x0), (b.y1 - q[1]) / (b.y1 - b.y0)]; }
  _mapLang() { const l = (document.documentElement.lang || 'fi').slice(0, 2); return l === 'et' ? 'et' : 'fi'; }
  _mapHome() { return this._mapLang() === 'et' ? 'ee' : 'fi'; }
  setMapLayers(o) { if (!this._mapOn) this._mapOn = {}; Object.assign(this._mapOn, o || {}); }
  _inPoly(x, y, ring) { let ins = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const a = ring[i], b = ring[j]; if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) ins = !ins; } return ins; }
  _inLand(x, y, key) { const rings = this._map.countries[key]; for (const r of rings) if (this._inPoly(x, y, r)) return true; return false; }
  _mapDraw(c, time) {
    const { g, w, h } = c;
    g.fillStyle = SAMA_BG; g.fillRect(0, 0, w, h);
    if (!this._map || !this._dots) {
      g.fillStyle = '#827C71'; g.font = '600 12px "IBM Plex Sans", sans-serif'; g.textAlign = 'center'; g.fillText('…', w * 0.5, h * 0.5);
      return;
    }
    const lang = this._mapLang(), home = this._mapHome(), cmp = !!this._mapCmp;
    const on = this._mapOn || {}, A = this._mapA || (this._mapA = {});
    const dt = Math.min(0.1, time - (this._mapT === undefined ? time : this._mapT)); this._mapT = time;
    for (const k in on) { const tgt = on[k] ? 1 : 0; A[k] = A[k] === undefined ? tgt : A[k] + (tgt - A[k]) * Math.min(1, dt * 5); }
    const al = (k) => A[k] || 0;
    const N = this._map.nodes, Asp = this._map.aspect;
    const site = window.SAMA_MAP_SITE || [N.helsinki[0] + 0.012, N.helsinki[1] - 0.006];
    const inStage = !!(c.el && c.el.closest && c.el.closest('.lava-cv'));
    const live = !!(c.el && c.el.closest && c.el.closest('.k-live')) && !!(this._kd && this._kd.views && this._kd.views[home]);
    let z, sc, fx, fy, cx, cy;
    if (live) {
      /* 04.11.2026: K2-luku — rajaus kartta-data.json:sta (samat näkymät kuin /verkko/-sivulla): kotimaa, kerroksen oma rajaus (EE Salvestid),
         viimeinen luku (vmode: scroll) zoomaa kotimaasta kohteeseen vierityksen mukana (this._mapP 0–1, ohjain asettaa); siirtymät pehmeästi. */
      const HU = home === 'ee' ? 'EE' : 'FI';
      const toVW = (b) => { const p0 = this._ll([b[0], b[3]]), p1 = this._ll([b[2], b[1]]); return [p0[0], p1[0], p0[1], p1[1]]; };
      const homeVW = toVW(this._kd.views[home].bbox);
      const Ly = this._mapCur ? this._kd.layers.find((l) => l.id === this._mapCur) : null, lv = Ly && Ly.view && Ly.view[HU] ? toVW(Ly.view[HU]) : null;
      const scroll = !!(lv && Ly.vmode === 'scroll'), pz = scroll ? this._sm(Math.max(0, Math.min(1, this._mapP || 0))) : 0;
      const tgt = lv ? (scroll ? homeVW.map((v, i) => v + (lv[i] - v) * pz) : lv) : homeVW;
      if (!this._mapV) this._mapV = tgt.slice();
      const V = this._mapV, ke = Math.min(1, dt * (scroll ? 10 : 4.5));
      for (let i = 0; i < 4; i++) V[i] += (tgt[i] - V[i]) * ke;
      const vw = V[1] - V[0], wide = w > 700;
      z = Math.max(0, Math.min(1, ((homeVW[1] - homeVW[0]) / vw - 1) / 2.6));
      /* leveällä kanvaasilla vasen viidennes on tekstin varjon alla (.kk-maps:after): kartta sovitetaan oikealle puolelle */
      sc = Math.min((h * (wide ? 0.88 : 0.92)) / (V[3] - V[2]), (w * (wide ? 0.7 : 0.92)) / (Asp * vw));
      fx = (V[0] + V[1]) / 2; fy = (V[2] + V[3]) / 2; cx = w * (wide ? 0.59 : 0.5); cy = h * 0.5;
    } else {
      z = this._sm(al('site'));
      const VW = inStage ? (home === 'ee' ? [0.27, 0.75, 0.60, 1.0] : [0.15, 0.84, 0.42, 1.0]) : (home === 'ee' ? [0.20, 0.80, 0.40, 1.0] : [0.12, 0.88, 0.26, 1.0]);
      const cx0 = (VW[0] + VW[1]) / 2, cy0 = (VW[2] + VW[3]) / 2;
      let sc0 = (h * 0.96) / (VW[3] - VW[2]); if (sc0 * Asp * (VW[1] - VW[0]) > w * 0.96) sc0 = (w * 0.96) / (Asp * (VW[1] - VW[0]));
      sc = sc0 * (1 + z * 4.5);
      fx = cx0 + (site[0] - cx0) * z; fy = cy0 + (site[1] - cy0) * z;
      cx = w * 0.5; cy = h * 0.5;
    }
    const P = (q) => [cx + (q[0] - fx) * sc * Asp, cy + (q[1] - fy) * sc];
    this._mapInv = [cx, cy, fx, fy, sc, Asp];   /* 05.11.2026: käänteinen projektio kartan napautukselle (liittymän paikka) */
    const PL = (ll) => P(this._ll(ll));
    this._mapProj = P; this._mapProjLL = PL; this._mapZ = z;
    const cty = (ll) => (ll[1] < 59.75 && ll[0] > 21.5) ? 'ee' : 'fi';
    const ctyA = (ll) => (cty(ll) === home ? 1 : (cmp ? 0.9 : 0.42));
    const showLab = (ll) => cty(ll) === home || cmp;
    const pins = [];
    const FONT = '600 11px "IBM Plex Sans", sans-serif', FONTS = '500 10px "IBM Plex Sans", sans-serif';
    /* 04.11.2026: tunnisteet jonoon ja piirto lopuksi tärkeysjärjestyksessä (kohde > valittu kerros > pohjakerros);
       päällekkäinen alemman tärkeyden tunniste jätetään pois, kuten tasokuvissa (puhelimella Fenno-Skan vs. varastoalue). */
    const LQ = []; let LP = 0;
    const label = (x, y, txt, opt) => { LQ.push([x, y, txt, opt || {}, g.globalAlpha, LP]); };
    const drawLabel = (x, y, txt, opt) => {
      opt = opt || {};
      g.font = opt.font || FONT; g.textAlign = opt.align || 'left'; g.textBaseline = 'middle';
      const tw = g.measureText(txt).width, px = 5, bh = 16;
      let bx = x - px; if (g.textAlign === 'center') bx = x - tw / 2 - px; if (g.textAlign === 'right') bx = x - tw - px;
      g.fillStyle = 'rgba(' + SAMA_BGRGB + ',0.78)'; g.fillRect(bx, y - bh / 2, tw + px * 2, bh);
      g.fillStyle = opt.color || '#F3EEE1'; g.fillText(txt, x, y + 0.5);
      g.textBaseline = 'alphabetic';
    };
    // outside-country reference lines (SE/NO/RU/LV coast hints)
    g.lineWidth = 1; g.strokeStyle = 'rgba(243,238,225,0.09)';
    for (const key in this._map.lines) for (const ln of this._map.lines[key]) { g.beginPath(); let pen = false; ln.forEach((q) => { const edge = q[0] < 0.004 || q[0] > 0.996 || q[1] < 0.004 || q[1] > 0.996; const s = P(q); if (edge) { pen = false; return; } if (!pen) { g.moveTo(s[0], s[1]); pen = true; } else g.lineTo(s[0], s[1]); }); g.stroke(); }
    // rantaviivat ja saaret (Natural Earth 1:10m, assets/kartta-etusivu.json) — 04.11.2026: maan muoto ja saaret näkyvät myös lähellä
    const ke = this._ke;
    if (ke && ke.land) {
      if (!this._kland) { const q = ke.q || 1000; this._kland = {}; for (const cc in ke.land) this._kland[cc] = ke.land[cc].map((arr) => { let x = arr[0], y = arr[1]; const pts = [this._ll([x / q, y / q])]; for (let i = 2; i < arr.length; i += 2) { x += arr[i]; y += arr[i + 1]; pts.push(this._ll([x / q, y / q])); } return pts; }); }
      for (const cc in this._kland) {
        const hm = cc === home; g.beginPath();
        for (const pts of this._kland[cc]) { for (let i = 0; i < pts.length; i++) { const s = P(pts[i]); if (i === 0) g.moveTo(s[0], s[1]); else g.lineTo(s[0], s[1]); } g.closePath(); }
        g.fillStyle = hm ? 'rgba(212,181,116,0.035)' : 'rgba(243,238,225,0.018)'; g.fill();
        g.lineWidth = 1; g.strokeStyle = hm ? 'rgba(212,181,116,0.4)' : (cmp ? 'rgba(243,238,225,0.24)' : 'rgba(243,238,225,0.13)'); g.stroke();
      }
    }
    // land dots
    const dsz = Math.max(1.2, Math.min(3, sc / 520));
    for (const d of this._dots) {
      const s = P(d);
      if (s[0] < -4 || s[0] > w + 4 || s[1] < -4 || s[1] > h + 4) continue;
      const isHome = (d[2] ? 'ee' : 'fi') === home;
      g.fillStyle = isHome ? 'rgba(212,181,116,0.2)' : 'rgba(243,238,225,0.12)';
      g.fillRect(s[0] - dsz / 2, s[1] - dsz / 2, dsz, dsz);
    }
    // ---- layer: vork (real 400/330 kV lines, substations, DC links) ----
    const kv = this._kv;
    if (al('vork') > 0.01 && kv) {
      if (!this._kvxy) this._kvxy = kv.lines.map((wline) => ({ c: wline[0], k: wline[1], v: wline[2], n: wline[3], p: wline[4].map((ll) => this._ll(ll)) }));
      const a0 = al('vork') * (1 - 0.35 * z);
      // 110 kV (myös saarten johdot ja kaapelit) ohuena pääverkon alla — 04.11.2026, assets/kartta-etusivu.json (scripts/kaart/etusivu_110.py)
      const k110 = this._ke;
      if (k110) {
        if (!this._kexy) {
          const q = k110.q || 1000, G = { ha: [], oa: [], hc: [], oc: [] };
          for (const kind of ['ac', 'cable']) for (const cc in (k110[kind] || {})) for (const arr of k110[kind][cc]) {
            let x = arr[0], y = arr[1]; const pts = [this._ll([x / q, y / q])];
            for (let i = 2; i < arr.length; i += 2) { x += arr[i]; y += arr[i + 1]; pts.push(this._ll([x / q, y / q])); }
            const c0 = cc === 'sea' ? cty([arr[0] / q, arr[1] / q]) : cc;
            G[(c0 === home ? 'h' : 'o') + (kind === 'cable' ? 'c' : 'a')].push(pts);
          }
          this._kexy = G;
        }
        const G = this._kexy, a110 = al('vork') * (0.6 + 0.4 * Math.min(1, z * 1.6));
        const run = (list) => { g.beginPath(); for (const pts of list) { for (let i = 0; i < pts.length; i++) { const s = P(pts[i]); if (i === 0) g.moveTo(s[0], s[1]); else g.lineTo(s[0], s[1]); } } g.stroke(); };
        g.lineWidth = Math.max(0.6, Math.min(1.3, sc / 1600)); g.strokeStyle = '#D4B574';
        g.globalAlpha = a110 * 0.34; run(G.ha);
        g.globalAlpha = a110 * (cmp ? 0.28 : 0.13); run(G.oa);
        g.setLineDash([3, 3]); g.strokeStyle = '#F3EEE1';
        g.globalAlpha = a110 * 0.5; run(G.hc);
        g.globalAlpha = a110 * (cmp ? 0.4 : 0.2); run(G.oc);
        g.setLineDash([]); g.globalAlpha = 1;
      }
      for (const wl of this._kvxy) {
        const ca = (wl.c === home ? 1 : (cmp ? 0.85 : 0.4));
        if (wl.k === 'dc') continue;
        g.globalAlpha = a0 * ca * 0.75;
        g.strokeStyle = wl.v === '330' ? '#D9BC7E' : '#D4B574'; g.lineWidth = Math.max(0.8, Math.min(2.2, sc / 700));
        g.beginPath(); wl.p.forEach((q, i) => { const s = P(q); if (i === 0) g.moveTo(s[0], s[1]); else g.lineTo(s[0], s[1]); }); g.stroke();
      }
      // DC cables (EstLink, Fenno-Skan, Aurora) dashed, animated
      g.setLineDash([5, 5]); g.lineDashOffset = -time * 12;
      for (const wl of this._kvxy) {
        if (wl.k !== 'dc') continue;
        const ca = (wl.c === home ? 1 : (cmp ? 0.9 : 0.55));
        g.globalAlpha = a0 * ca; g.strokeStyle = '#F3EEE1'; g.lineWidth = 1.2;
        g.beginPath(); wl.p.forEach((q, i) => { const s = P(q); if (i === 0) g.moveTo(s[0], s[1]); else g.lineTo(s[0], s[1]); }); g.stroke();
      }
      g.setLineDash([]);
      // substations
      const ssz = Math.max(2, Math.min(4, sc / 300));
      for (const ss of kv.ss) {
        const s = PL([ss[3], ss[4]]); if (s[0] < -4 || s[0] > w + 4 || s[1] < -4 || s[1] > h + 4) continue;
        const ca = (ss[0] === home ? 1 : (cmp ? 0.85 : 0.4));
        g.globalAlpha = a0 * ca * (live && this._mapCur !== 'vork' && this._mapCur !== 'site' ? 0.35 : 1); g.fillStyle = ss[1] === 'conv' ? '#F3EEE1' : '#D4B574';
        g.fillRect(s[0] - ssz / 2, s[1] - ssz / 2, ssz, ssz);
        if (z > 0.4 && ss[2] && (!live || this._mapCur === 'site')) { g.globalAlpha = a0 * ca * z; label(s[0] + 8, s[1], ss[2], { font: FONTS, color: '#CFC8B8' }); }
      }
      g.globalAlpha = 1;
    }
    // ---- data layers from kartta-data.json ----
    const kd = this._kd;
    if (kd) {
      const layers = kd.layers;
      for (const Ly of layers) {
        LP = 1 + layers.indexOf(Ly);
        const a = al(Ly.id); if (a < 0.01 || Ly.id === 'site') continue;
        const aa = a * (1 - 0.45 * z) * (live && Ly.id === 'vork' && this._mapCur === 'site' ? Math.max(0, 1 - z * 1.6) : 1);   /* kohdeluvussa yhteysmerkinnät väistyvät zoomatessa */
        if (aa < 0.01) continue;
        for (const pin of Ly.pins) {
          const k = pin.k;
          if (k === 'zone') {
            const ca = ctyA(pin.poly[0]);
            if (!pin._xy) { pin._xy = pin.poly.map((ll) => this._ll(ll)); pin._dots = this._dots.filter((d) => this._inPoly(d[0], d[1], pin._xy)); }
            g.globalAlpha = aa * ca;
            const tw = 0.5 + 0.5 * Math.sin(time * 1.1);
            g.fillStyle = 'rgba(255,236,190,' + (0.35 + 0.25 * tw).toFixed(3) + ')';
            const r2 = Math.max(1.6, Math.min(3.2, sc / 420));
            for (const d of pin._dots) { const s = P(d); if (s[0] < -4 || s[0] > w + 4 || s[1] < -4 || s[1] > h + 4) continue; g.fillRect(s[0] - r2 / 2, s[1] - r2 / 2, r2, r2); }
            const edge = pin._xy.slice(0, Math.max(2, (pin.n || 5))).map((q) => P(q));
            g.setLineDash([3, 6]); g.strokeStyle = 'rgba(212,181,116,0.7)'; g.lineWidth = 1; g.beginPath(); edge.forEach((s, i) => { if (i === 0) g.moveTo(s[0], s[1]); else g.lineTo(s[0], s[1]); }); g.stroke(); g.setLineDash([]);
            if (showLab(pin.poly[0])) { const m = P(this._ll(pin.lp || pin.poly[2])); label(m[0], m[1] - 10, pin.t[lang], { align: 'center' }); pins.push({ p: m, t: pin.t[lang], s: pin.s }); }
            g.globalAlpha = 1;
          } else if (k === 'link') {
            const a1 = PL(pin.a), b1 = PL(pin.b);
            g.globalAlpha = aa;
            g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(212,181,116,0.16)'; g.lineWidth = 7; g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(b1[0], b1[1]); g.stroke(); g.globalCompositeOperation = 'source-over';
            const tt = pin.lt || 0.42, m = [a1[0] + (b1[0] - a1[0]) * tt, a1[1] + (b1[1] - a1[1]) * tt];
            label(m[0] + 10, m[1], pin.t[lang]); pins.push({ p: m, t: pin.t[lang], s: pin.s });
            g.globalAlpha = 1;
          } else if (k === 'label') {
            if (!showLab(pin.p)) continue;
            const s = PL(pin.p); g.globalAlpha = aa * ctyA(pin.p);
            label(s[0], s[1], pin.t[lang], { align: 'center', color: pin.green ? '#5BD08D' : (pin.dim ? '#A39C8E' : '#F3EEE1') });
            pins.push({ p: s, t: pin.t[lang], s: pin.s }); g.globalAlpha = 1;
          } else if (k === 'ring') {
            const s = PL(pin.p); const ca = ctyA(pin.p); g.globalAlpha = aa * ca;
            const kr = Math.max(0.9, sc / 900);
            const r0 = (6 + Math.sqrt(pin.r[0]) * 5.2) * kr, r1 = (6 + Math.sqrt(pin.r[1]) * 5.2) * kr;
            g.strokeStyle = '#D4B574'; g.lineWidth = 1.4; g.beginPath(); g.arc(s[0], s[1], r0, 0, Math.PI * 2); g.stroke();
            g.setLineDash([4, 5]); g.lineDashOffset = -time * 8; g.strokeStyle = 'rgba(212,181,116,0.7)'; g.lineWidth = 1; g.beginPath(); g.arc(s[0], s[1], r1, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
            g.fillStyle = 'rgba(212,181,116,0.07)'; g.beginPath(); g.arc(s[0], s[1], r1, 0, Math.PI * 2); g.fill();
            if (showLab(pin.p)) { label(s[0], s[1] + r1 + 12, pin.t[lang], { align: 'center' }); pins.push({ p: s, t: pin.t[lang], s: pin.s }); }
            g.globalAlpha = 1;
          } else if (k === 'node') {
            const s = PL(pin.p); const ca = ctyA(pin.p); g.globalAlpha = aa * ca;
            const r = 4 + 1.5 * Math.sin(time * 1.2 + s[0]);
            g.strokeStyle = '#D4B574'; g.lineWidth = 1.2; g.beginPath(); g.arc(s[0], s[1], r + 4, 0, Math.PI * 2); g.stroke();
            g.fillStyle = '#D4B574'; g.beginPath(); g.arc(s[0], s[1], 2.6, 0, Math.PI * 2); g.fill();
            if (showLab(pin.p)) { const left = s[0] > cx; label(s[0] + (left ? 12 : -12), s[1], pin.t[lang], { align: left ? 'left' : 'right', font: FONTS, color: '#CFC8B8' }); pins.push({ p: s, t: pin.t[lang], s: pin.s }); }
            g.globalAlpha = 1;
          } else if (k === 'point') {
            const s = PL(pin.p); const ca = ctyA(pin.p); g.globalAlpha = aa * ca;
            for (let q = 0; q < 2; q++) { const ph = (time * 0.4 + q / 2) % 1; g.strokeStyle = 'rgba(212,181,116,' + ((1 - ph) * 0.6).toFixed(3) + ')'; g.lineWidth = 1; g.beginPath(); g.arc(s[0], s[1], 4 + ph * 22, 0, Math.PI * 2); g.stroke(); }
            g.fillStyle = '#F3EEE1'; g.beginPath(); g.arc(s[0], s[1], 3.2, 0, Math.PI * 2); g.fill();
            if (showLab(pin.p)) { label(s[0] + 12, s[1] + (pin.p[1] > 59.3 ? -8 : 8), pin.t[lang], { font: FONTS }); pins.push({ p: s, t: pin.t[lang], s: pin.s }); }
            g.globalAlpha = 1;
          }
        }
      }
    }
    // ---- nimetyt solmut (assets/kartta-solmut.json, scripts/kaart/build_solmut.py) — 06.11.2026, Madis: "sõlmed esile" ----
    // datakeskus neliö, puisto ympyrä, koko tehon mukaan; ontto = luvitus, kaava tai selvitys; kantaverkon hankkeet viivoina vuosineen.
    const ks = this._ks;
    if (ks && kd) {
      const LK = { dc: 'tarbimine', wind: 'tootmine', solar: 'tootmine', bess: 'salvestid', line: 'tulevik', link: 'tulevik' };
      const LI = {}; kd.layers.forEach((l, i) => { LI[l.id] = i; });
      const kr = Math.max(0.75, Math.min(1.6, sc / 1100));
      const own = (o) => o ? o.replace(/\s*\(.*\)$/, '').replace(/\s+\d{3,}.*$/, '').replace(/[, ]+(Oyj?|AS|OÜ|AB|Inc\.?|Ltd|ltd|Holdings|Corp)\b.*$/, '').trim() : '';
      const num = (n) => String(n).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      const nm = (it) => typeof it.n === 'string' ? it.n : it.n[lang];
      const mwOf = (it) => it.mw != null ? it.mw : (it.mwit != null ? it.mwit : 0);
      const mwT = (it) => { let a = it.mw0 ? num(it.mw0) + '–' + num(it.mw) + ' MW' : (it.mw != null ? num(it.mw) + ' MW' : ''); if (it.mwit != null) a += (a ? ' · ' : '') + 'IT ' + num(it.mwit) + ' MW'; return a; };
      const srcT = (it) => [it.src, it.src2, it.src3].filter(Boolean).map((id) => { const q = ks.sources[id]; return q ? q.pub + ' ' + q.date : ''; }).join('; ');
      const info = (it) => {
        const st = ks.status[it.s][lang], kn = ks.kind[it.k][lang], yr = it.y ? ' · ' + (it.s === 'op' ? (lang === 'et' ? 'alates ' : 'vuodesta ') : (lang === 'et' ? 'valmib ' : 'valmis ')) + it.y : '';
        return { t: nm(it), d: kn + (it.o ? ' · ' + it.o : '') + (it.m ? ' · ' + it.m : '') + '\n' + st + yr + (mwT(it) ? ' · ' + mwT(it) : '') + (it.note ? '\n' + it.note[lang] : ''), s: srcT(it), u: it.u };
      };
      const labOk = (it) => { const mw = mwOf(it); if (it.k === 'line' || it.k === 'link' || it.k === 'bess') return true; if (it.k === 'dc') return mw >= 250 || /^Google/.test(it.o || '') || it.c === 'EE'; if (it.k === 'wind') return mw >= (it.c === 'EE' ? 90 : 190); return mw >= 50; };
      for (const it of ks.items) {
        const lid = LK[it.k], a = al(lid); if (a < 0.02 || LI[lid] == null) continue;
        const cc = it.c === 'EE' ? 'ee' : 'fi', vis = cc === home || cmp, ca = cc === home ? 1 : (cmp ? 0.85 : 0.3);
        const aa = a * ca * (1 - 0.45 * z), hollow = /^(per|plan|pre|cond)$/.test(it.s);
        LP = 1 + LI[lid] - 0.5 + Math.min(0.45, (it.k === 'link' ? 900 : mwOf(it)) / 2000);
        g.globalAlpha = aa;
        if (it.g) {
          const a1 = PL(it.g[0]), b1 = PL(it.g[1]);
          g.strokeStyle = '#D4B574'; g.lineWidth = (it.s === 'con' ? 2.4 : 1.7) * Math.min(1.2, kr);
          g.setLineDash(it.s === 'con' || it.s === 'op' ? [] : (it.s === 'cond' ? [1.5, 5] : [6, 5]));
          g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(b1[0], b1[1]); g.stroke(); g.setLineDash([]);
          const m = [(a1[0] + b1[0]) / 2, (a1[1] + b1[1]) / 2];
          if (vis) { label(m[0], m[1], nm(it).replace(/\s*\d{3}(\+110)? kV.*$/, '') + (it.y ? ' ' + it.y : ''), { align: 'center', font: FONTS, color: '#D4B574' }); const q = info(it); q.p = m; pins.push(q); }
        } else {
          const s = PL(it.p); if (s[0] < -20 || s[0] > w + 20 || s[1] < -20 || s[1] > h + 20) continue;
          const mw = mwOf(it), r = Math.max(2.2, Math.min(it.k === 'dc' ? 9 : 10, Math.sqrt(mw || 4) * (it.k === 'dc' ? 0.42 : 0.5))) * kr;
          if (it.to) { const q = PL(it.to); g.strokeStyle = '#F3EEE1'; g.lineWidth = 1.2; g.setLineDash([4, 4]); g.lineDashOffset = -time * 10; g.beginPath(); g.moveTo(s[0], s[1]); g.lineTo(q[0], q[1]); g.stroke(); g.setLineDash([]); }
          const col = it.k === 'dc' ? (it.s === 'con' ? '#B8975A' : '#D4B574') : (it.k === 'solar' ? '#E6C46E' : (it.k === 'bess' ? '#F3EEE1' : '#E9E2D2'));
          g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 1.4;
          if (it.k === 'dc') { if (hollow) g.strokeRect(s[0] - r, s[1] - r, 2 * r, 2 * r); else g.fillRect(s[0] - r, s[1] - r, 2 * r, 2 * r); }
          else { g.beginPath(); g.arc(s[0], s[1], r, 0, Math.PI * 2); if (hollow) g.stroke(); else g.fill(); }
          if (vis) {
            const q = info(it); q.p = s; pins.push(q);
            if (labOk(it)) { const left = s[0] > w - 150; const head = it.k === 'dc' && it.o ? own(it.o) + (it.m ? ' · ' + it.m : '') : nm(it); label(s[0] + (left ? -r - 7 : r + 7), s[1], head + (mwT(it) ? ' · ' + mwT(it).split(' · ')[0] : '') + (it.k === 'link' ? ' · ' + it.y : ''), { font: FONTS, align: left ? 'right' : 'left', color: '#E9E2D2' }); }
          }
        }
        g.globalAlpha = 1;
      }
    }
    // ---- site pulse ----
    if (al('site') > 0.01) {
      const s = P(site); g.globalAlpha = al('site');
      for (let k = 0; k < 3; k++) { const ph = (time * 0.35 + k / 3) % 1; g.strokeStyle = 'rgba(212,181,116,' + ((1 - ph) * 0.6).toFixed(3) + ')'; g.lineWidth = 1; g.beginPath(); g.arc(s[0], s[1], 8 + ph * 60, 0, Math.PI * 2); g.stroke(); }
      g.fillStyle = '#F3EEE1'; g.beginPath(); g.arc(s[0], s[1], 5, 0, Math.PI * 2); g.fill();
      LP = 100;
      const siteL = kd ? kd.layers[kd.layers.length - 1].name[lang] : '';
      const SF = '600 13px "IBM Plex Sans", sans-serif', sub = lang === 'et' ? 'SALVESTI · PÄIKE · JUHTIMINE' : 'SÄHKÖVARASTO · AURINKO · OHJAUS';
      g.font = SF; const sw1 = g.measureText(siteL).width; g.font = FONT; const sww = Math.max(sw1, g.measureText(sub).width) + 12;
      if (s[0] + 22 + sww < w - 4) { label(s[0] + 22, s[1] - 6, siteL, { font: SF }); label(s[0] + 22, s[1] + 12, sub, { color: '#A39C8E' }); }
      else if (s[0] - 22 - sww > 4) { label(s[0] - 22, s[1] - 6, siteL, { font: SF, align: 'right' }); label(s[0] - 22, s[1] + 12, sub, { color: '#A39C8E', align: 'right' }); }
      else { label(s[0], s[1] + 26, siteL, { font: SF, align: 'center' }); label(s[0], s[1] + 44, sub, { color: '#A39C8E', align: 'center' }); }
      g.globalAlpha = 1;
    }
    LQ.sort((a, b) => b[5] - a[5]);
    const LB = [];
    for (const q of LQ) {
      const opt = q[3]; g.font = opt.font || FONT;
      const tw = g.measureText(q[2]).width, al0 = opt.align || 'left';
      const bx = al0 === 'center' ? q[0] - tw / 2 - 5 : (al0 === 'right' ? q[0] - tw - 5 : q[0] - 5);
      const bb = [bx - 1, q[1] - 9, bx + tw + 11, q[1] + 9];
      if (q[4] > 0.05) { if (LB.some((o) => bb[0] < o[2] && bb[2] > o[0] && bb[1] < o[3] && bb[3] > o[1])) continue; LB.push(bb); }
      g.globalAlpha = q[4]; drawLabel(q[0], q[1], q[2], opt);
    }
    g.globalAlpha = 1;
    this._mapPins = pins;
    // OSM attribution (only on the full map, not in the stage)
    if (!inStage && kv) { g.font = FONTS; g.textAlign = 'right'; g.fillStyle = '#827C71'; g.fillText(w < 560 ? '© OpenStreetMap contributors' : '© OpenStreetMap contributors · Natural Earth', w - 8, h - 8); }
  }
  /* ---------- Section 3: illustrated exploded stack ---------- */
  renderVals() {
    const s = this.state, vh = s.vh, b = s.board;
    const bt = (cur, n) => ({ o: cur === n ? '1' : '0', y: cur === n ? '0' : (cur > n ? '-10' : '10') });
    const pr = (cur, n) => (cur === n ? 'color: #D4B574' : (cur > n ? 'color: #CFC8B8' : 'color: #827C71'));
    const s3 = s.s3 || 5, hs = s.hs || 1, ex = s.ex || 1, hx = s.hx || 1, tab = s.tab || 'y', hhl = s.hhl || 0;
    const stp = (n) => ({ op: hs === n ? '1' : '0.62', tc: hs === n ? '#D4B574' : '#F3EEE1', bar: hs === n ? '#D4B574' : '#CFC8B8', h: hs === n ? String(s.hp || 0) : (hs > n ? '100' : '0'), cur: hs === n ? 'step' : 'false' });
    const ar = (on) => ({ x: on ? 'true' : 'false', d: on ? 'block' : 'none', bg: on ? 'rgba(91,208,141,0.08)' : 'rgba(243,238,225,0.025)', col: on ? '#F3EEE1' : '#CFC8B8', dot: on ? '#5BD08D' : '#827C71', fill: on ? '#5BD08D' : 'transparent' });
    const tb = (on) => ({ p: on ? 'true' : 'false', bg: on ? '#D4B574' : 'transparent', col: on ? SAMA_BG : '#CFC8B8' });
    const pc = (on) => ({ bd: on ? 'rgba(212,181,116,0.6)' : 'rgba(243,238,225,0.14)', bg: on ? 'rgba(212,181,116,0.06)' : 'rgba(243,238,225,0.02)' });
    const idx = (ev) => { const el = ev && ev.currentTarget; return el ? parseInt(el.getAttribute('data-i'), 10) || 1 : 1; };
    const grp = (ev) => { const el = ev && ev.currentTarget; return el && el.getAttribute('data-g') === 'h' ? 'k' : 'y'; };
    const fv = (ev) => { const el = ev && ev.currentTarget; return !(el && el.matches && !el.matches(':focus-visible')); };
    const fk = s.fk === 'k' ? 'k' : 'y';
    const rc = (on) => ({ c: on, bd: on ? 'rgba(212,181,116,0.6)' : 'rgba(243,238,225,0.14)', bg: on ? 'rgba(212,181,116,0.06)' : 'rgba(243,238,225,0.02)' });
    return {
      vh,
      wn: tb(!s.wb), wy: tb(!!s.wb),
      whyAria: s.wb ? 'Havainnollistus yhden viikon kulutuksesta akun kanssa: akku purkaa kulutushuippujen aikana ja lataa edullisina tunteina, joten laskutusteho pienenee.' : 'Havainnollistus yhden viikon kulutuksesta ilman akkua: lyhyet kulutushuiput määräävät laskutustehon.',
      ky: rc(fk === 'y'), kk: rc(fk === 'k'), isY: fk === 'y', isK: fk === 'k',
      sent: !!s.sent, notSent: !s.sent,
      pickNoBat: () => { this._wUser = true; this.setState({ wb: false }); },
      pickBat: () => { this._wUser = true; this.setState({ wb: true }); },
      pickKind: (ev) => { const el = ev && (ev.currentTarget || ev.target); this.setState({ fk: el && el.value === 'k' ? 'k' : 'y' }); },
      submitForm: (ev) => { if (ev && ev.preventDefault) ev.preventDefault(); this.setState({ sent: true }); },
      resetForm: () => { this.setState({ sent: false }); },
      hs3: b ? vh : vh * 5,
      py: pc(hhl === 1), pk: pc(hhl === 2),
      ty: tb(tab === 'y'), tk: tb(tab === 'k'),
      ly: { cls: tab === 'y' ? 'on' : 'off' }, lk: { cls: tab === 'k' ? 'on' : 'off' },
      a1: ar(ex === 1), a2: ar(ex === 2), a3: ar(ex === 3), a4: ar(ex === 4), a5: ar(ex === 5), a6: ar(ex === 6),
      h1: ar(hx === 1), h2: ar(hx === 2), h3: ar(hx === 3), h4: ar(hx === 4), h5: ar(hx === 5),
      p1: stp(1), p2: stp(2), p3: stp(3), p4: stp(4), p5: stp(5),
      paused: !!s.paused, notPaused: !s.paused, pauseLabel: s.paused ? 'Jatka' : 'Pysäytä',
      u1: bt(s3, 1), u2: bt(s3, 2), u3: bt(s3, 3), u4: bt(s3, 4), u5: bt(s3, 5),
      k1: pr(s3, 1), k2: pr(s3, 2), k3: pr(s3, 3), k4: pr(s3, 4), k5: pr(s3, 5),
      pickPath: (ev) => { this._setArea(idx(ev) === 2 ? 'k' : 'y', 0, true); },
      hoverPath: (ev) => { if (ev && ev.type === 'focus' && !fv(ev)) return; this.setState({ hhl: idx(ev) }); },
      leavePath: () => { this.setState({ hhl: 0 }); },
      pickTabY: () => { this._setArea('y', 0, true); },
      pickTabK: () => { this._setArea('k', 0, true); },
      pickStage: (ev) => { const i = idx(ev); clearTimeout(this._hT); this._ht = this._HKEY[i - 1]; this.setState({ paused: true }); },
      hoverStage: (ev) => { const i = idx(ev); clearTimeout(this._hT); this._hT = setTimeout(() => { this._ht = this._HKEY[i - 1]; this._hov = true; }, 350); },
      leaveStage: () => { clearTimeout(this._hT); if (!this._focusStage) this._hov = false; },
      focusStage: (ev) => { if (!fv(ev)) return; this._ht = this._HKEY[idx(ev) - 1]; this._hov = true; this._focusStage = true; },
      blurStage: () => { this._focusStage = false; this._hov = false; },
      togglePause: () => { this._hov = false; this.setState({ paused: !this.state.paused }); },
      pickArea: (ev) => { clearTimeout(this._xT); this._setArea(grp(ev), idx(ev), true); },
      hoverArea: (ev) => { const i = idx(ev), t = grp(ev); clearTimeout(this._xT); this._xT = setTimeout(() => this._setArea(t, i, true), 350); },
      leaveArea: () => { clearTimeout(this._xT); },
      focusArea: (ev) => { if (!fv(ev)) return; this._setArea(grp(ev), idx(ev), true); },
      keyArea: (ev) => {
        const k = ev && ev.key, i = idx(ev), t = grp(ev), N = t === 'k' ? 5 : 6, pre = t === 'k' ? 'hb' : 'ab';
        let n = 0;
        if (k === 'ArrowDown' || k === 'ArrowRight') n = i % N + 1;
        else if (k === 'ArrowUp' || k === 'ArrowLeft') n = (i + N - 2) % N + 1;
        else if (k === 'Home') n = 1;
        else if (k === 'End') n = N;
        if (!n) return;
        ev.preventDefault();
        const el = document.getElementById(pre + n);
        if (el) el.focus();
        this._setArea(t, n, true);
      }
    };
  }
}
/* 04.11.2026: pages with live chapters (.k-live) start the engine only when a chapter approaches the viewport (controller below);
   prefers-reduced-motion -> no engine, the K2 stills stay. 03.11.2026: phones (<=750 px) on the front page without live chapters keep the static image. */
function bootEngine(){if(window.SAMA3D)return window.SAMA3D;var c=new Component({scheme:'yö'});c.state.board=false;window.SAMA3D=c;c.componentDidMount();return c;}
window.SAMA_BOOT=bootEngine;
var phoneStill=false;try{phoneStill=!!document.querySelector('.lava,.k-home')&&window.matchMedia('(max-width:750px)').matches;}catch(e){}
if(!document.querySelector('.k-live')&&!phoneStill)bootEngine();
})();
(function(){var c=window.SAMA3D,noEngine=!c;if(noEngine){if(!document.querySelector('[data-map]'))return;c={setMapLayers:function(){},_rm:true,_HB:[]};}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
var mob=false;try{mob=window.matchMedia('(max-width:1000px)').matches;}catch(e){}
var still=mob||c._rm;
/* ---- map data (shared by the stage map and the full map page) ---- */
function loadMap(){
 if(window.SAMA_KD){c._kd=window.SAMA_KD;}else fetch('/assets/kartta-data.json').then(function(r){return r.json();}).then(function(d){c._kd=d;}).catch(function(e){console.error(e);});
 if(window.SAMA_KV){c._kv=window.SAMA_KV;}else fetch('/assets/kartta-verkko.json').then(function(r){return r.json();}).then(function(d){c._kv=d;c._kvxy=null;}).catch(function(e){console.error(e);});
}
if(!noEngine&&document.querySelector('.cv-map'))loadMap();
/* layer buttons + compare toggle, in any [data-map] block */
$$('[data-map]').forEach(function(box){
 var init={};$$('.mp-l',box).forEach(function(b){init[b.getAttribute('data-l')]=b.getAttribute('aria-pressed')==='true'?1:0;});
 if(Object.keys(init).length)c.setMapLayers(init);
 $$('.mp-l',box).forEach(function(b){b.addEventListener('click',function(){var on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on?'true':'false');var o={};o[b.getAttribute('data-l')]=on?1:0;c.setMapLayers(o);
  var f=box.querySelector('.mp-f[data-l="'+b.getAttribute('data-l')+'"]');if(f)f.hidden=!on;});});
 var cb=box.querySelector('.mp-cmp');if(!cb)c._mapCmp=true;if(cb)cb.addEventListener('click',function(){var on=cb.getAttribute('aria-pressed')!=='true';cb.setAttribute('aria-pressed',on?'true':'false');c._mapCmp=on;$$('.mp-o',box).forEach(function(x){x.hidden=!on;});});
 var cv=box.querySelector('.cv-map'),tip=box.querySelector('.map-tip');
 if(cv&&tip){cv.addEventListener('pointermove',function(e){if(!c._mapPins)return;var cr=cv.getBoundingClientRect(),x=e.clientX-cr.left,y=e.clientY-cr.top,best=null,bd=18*18;
   c._mapPins.forEach(function(t){var d=(t.p[0]-x)*(t.p[0]-x)+(t.p[1]-y)*(t.p[1]-y);if(d<bd){bd=d;best=t;}});
   if(best){tip.innerHTML='<b></b><small></small>';tip.querySelector('b').textContent=best.t;if(best.s)tip.querySelector('small').textContent=best.s;else tip.querySelector('small').remove();tip.style.left=(best.p[0])+'px';tip.style.top=(best.p[1])+'px';tip.hidden=false;}else tip.hidden=true;});
  cv.addEventListener('pointerleave',function(){tip.hidden=true;});}
});
/* ---- stage ---- */
var lava=document.querySelector('.lava');
if(lava&&!noEngine){
 var stage=lava.querySelector('.lava-stage'),layers=$$('.lava-cv [data-scene]',lava),groups=$$('.lv-g[data-scene]',lava),tip=lava.querySelector('.lava-tip'),lab=lava.querySelector('.lava-l');
 var scene='hero',HB=c._HB;
 layers.forEach(function(k){var on=k.getAttribute('data-scene')==='hero';k.classList.toggle('on',on);k.dataset.off=on?'0':'1';});
 function setScene(s){if(s===scene)return;scene=s;
  layers.forEach(function(k){var on=k.getAttribute('data-scene')===s;k.classList.toggle('on',on);if(on)k.dataset.off='0';});
  setTimeout(function(){layers.forEach(function(k){if(k.getAttribute('data-scene')!==scene)k.dataset.off='1';});},700);
  if(lab)lab.hidden=s!=='proc';if(tip)tip.hidden=true;if(s!=='hero'&&c.state.hhl)c.setState({hhl:0});
  if(s==='day'&&!c._wUser){c._wAuto=true;if(!c.state.wb)c.setState({wb:true});}
  stage.setAttribute('data-scene',s);}
 function center(){var mid=innerHeight*0.5,best=null,bd=1e9;groups.forEach(function(g){var r=g.getBoundingClientRect();var d=r.top>mid?r.top-mid:(r.bottom<mid?mid-r.bottom:0);if(d<bd){bd=d;best=g;}});return best;}
 function onScroll(){var g=center();if(g)setScene(g.getAttribute('data-scene'));}
 if(!still){addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);onScroll();}
 /* mouse: parallax, hero highlight, map tooltips */
 if(!still){
 stage.addEventListener('pointermove',function(e){var r=stage.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width*2-1,ny=(e.clientY-r.top)/r.height*2-1;
  var cvb=lava.querySelector('.lava-cv');cvb.style.setProperty('--px',(-nx).toFixed(3));cvb.style.setProperty('--py',(-ny).toFixed(3));
  if(scene==='hero'){var k=nx<-0.1?2:(nx>0.1?1:0);if(c.state.hhl!==k)c.setState({hhl:k});}
  if(scene==='map'&&c._mapPins&&tip){var cv=lava.querySelector('.lava-cv .cv-map'),cr=cv.getBoundingClientRect(),x=e.clientX-cr.left,y=e.clientY-cr.top,best=null,bd=18*18;
   c._mapPins.forEach(function(t){var d=(t.p[0]-x)*(t.p[0]-x)+(t.p[1]-y)*(t.p[1]-y);if(d<bd){bd=d;best=t;}});
   if(best){tip.innerHTML='<b></b><small></small>';tip.querySelector('b').textContent=best.t;if(best.s)tip.querySelector('small').textContent=best.s;else tip.querySelector('small').remove();tip.style.left=(best.p[0]+cr.left-r.left)+'px';tip.style.top=(best.p[1]+cr.top-r.top)+'px';tip.hidden=false;}else tip.hidden=true;}});
 stage.addEventListener('pointerleave',function(){var cvb=lava.querySelector('.lava-cv');cvb.style.setProperty('--px','0');cvb.style.setProperty('--py','0');if(c.state.hhl)c.setState({hhl:0});if(tip)tip.hidden=true;c._hov=false;});
 stage.addEventListener('pointerenter',function(){c._hov=true;});
 }
 /* offer cards -> exploded-view area */
 var cards=$$('.of-c[data-ex]',lava);
 if(cards.length){var sel=function(i,user){c._setArea('y',i,user);cards.forEach(function(k){k.classList.toggle('on',+k.getAttribute('data-ex')===i);});};
  cards.forEach(function(k){k.addEventListener('pointerenter',function(){sel(+k.getAttribute('data-ex'),true);});k.addEventListener('focusin',function(){sel(+k.getAttribute('data-ex'),true);});});
  var ci=0;sel(+cards[0].getAttribute('data-ex'),false);
  if(!still)setInterval(function(){if(c._exUser||document.hidden||scene!=='ex')return;ci=(ci+1)%cards.length;sel(+cards[ci].getAttribute('data-ex'),false);},5200);}
 /* process steps: highlight follows the animation; click jumps it */
 var psteps=$$('.lv-s[data-p]',lava);
 if(psteps.length&&!still)setInterval(function(){if(scene!=='proc')return;var t=c._ht||0,i=0;for(var k=0;k<HB.length;k++)if(t>=HB[k])i=k;psteps.forEach(function(st,j){st.classList.toggle('on',j===i);});},250);
 /* process steps: click jumps the animation; otherwise it loops on its own */
 $$('.lv-s[data-p]',lava).forEach(function(st){st.addEventListener('click',function(){var i=+st.getAttribute('data-p')-1;c._ht=HB[i]||0;c._ht+=0.01;});});
 var pb=lava.querySelector('.lv-pause');if(pb)pb.addEventListener('click',function(){var p=!c.state.paused;c.setState({paused:p});pb.textContent=p?pb.getAttribute('data-r'):pb.getAttribute('data-p');pb.setAttribute('aria-pressed',p?'true':'false');});
 $$('.lv-t',lava).forEach(function(b){b.addEventListener('click',function(){c._wUser=true;var wb=b.getAttribute('data-wb')==='1';c.setState({wb:wb});$$('.lv-t',lava).forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});});});
 /* phones and reduced motion: one still frame of the hero, then stop drawing */
 if(still){stage.setAttribute('data-still','1');var hg=lava.querySelector('.lv-hero');if(hg&&mob)hg.appendChild(stage);setTimeout(function(){if(!document.querySelector('[data-map] .cv-map')){c._alive=false;cancelAnimationFrame(c._raf);}},1500);}
}
})();
/* 04.11.2026: K2 live chapters. Each .k-live[data-live] has [data-step] blocks; the step nearest the reading line drives the scene:
   map = grid + that question's layer (and the K2 radio), proc = project phase, sld = continuous progress through the five layers. */
(function(){
var secs=[].slice.call(document.querySelectorAll('.k-live'));
if(!secs.length||!window.SAMA_BOOT)return;
var RM=false;try{RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
if(RM)return;
secs.forEach(function(s){s.classList.add('is-live');});
var c=null,MAPK=['vork','tarbimine','tootmine','salvestid','reservid','tulevik','site'],last={},pend=false;
function loadMap(){
 if(window.SAMA_KD)c._kd=window.SAMA_KD;else fetch('/assets/kartta-data.json').then(function(r){return r.json();}).then(function(d){c._kd=d;}).catch(function(){});
 if(window.SAMA_KV)c._kv=window.SAMA_KV;else fetch('/assets/kartta-verkko.json').then(function(r){return r.json();}).then(function(d){c._kv=d;c._kvxy=null;}).catch(function(){});
 if(window.SAMA_KE)c._ke=window.SAMA_KE;else fetch('/assets/kartta-etusivu.json').then(function(r){return r.json();}).then(function(d){c._ke=d;c._kexy=null;}).catch(function(){});
 if(window.SAMA_KS)c._ks=window.SAMA_KS;else fetch('/assets/kartta-solmut.json').then(function(r){return r.json();}).then(function(d){c._ks=d;}).catch(function(){});
 ntip();
}
/* 06.11.2026: vihje hiirellä kartan solmuille ja tunnisteille (nimi, laji, omistaja, tila, teho, lähde); kosketuksessa napautus valitsee paikan */
function ntip(){var sec=document.querySelector('.k-live[data-live="map"]'),cv=sec&&sec.querySelector('.cv-map'),box=sec&&sec.querySelector('.kk-maps');if(!cv||!box||box.querySelector('.kk-ntip'))return;
 if(!document.getElementById('kk-ntip-css')){var st=document.createElement('style');st.id='kk-ntip-css';st.textContent='.kk-ntip{position:absolute;z-index:5;max-width:300px;padding:9px 11px;border-radius:8px;background:rgba(20,18,15,.94);border:1px solid rgba(212,181,116,.35);color:#F3EEE1;font:500 12.5px/1.45 var(--font-body,sans-serif);pointer-events:none;white-space:pre-line;transform:translate(14px,14px)}.kk-ntip b{display:block;font-weight:600;color:#D4B574}.kk-ntip small{display:block;margin-top:5px;opacity:.72;font-size:11px}.kk-ntip[hidden]{display:none}';document.head.appendChild(st);}
 var tip=document.createElement('div');tip.className='kk-ntip';tip.hidden=true;tip.setAttribute('role','tooltip');box.appendChild(tip);
 cv.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse'||!c||!c._mapPins){tip.hidden=true;return;}var cr=cv.getBoundingClientRect(),br=box.getBoundingClientRect(),x=e.clientX-cr.left,y=e.clientY-cr.top,best=null,bd=16*16;
  c._mapPins.forEach(function(t){var d=(t.p[0]-x)*(t.p[0]-x)+(t.p[1]-y)*(t.p[1]-y);if(d<bd){bd=d;best=t;}});
  if(!best){tip.hidden=true;cv.style.cursor='';return;}
  tip.textContent='';var b=document.createElement('b');b.textContent=best.t;tip.appendChild(b);if(best.d){tip.appendChild(document.createTextNode(best.d));}if(best.s){var sm=document.createElement('small');sm.textContent=best.s;tip.appendChild(sm);}
  var lx=e.clientX-br.left,ly=e.clientY-br.top;tip.hidden=false;var tw=tip.offsetWidth,th=tip.offsetHeight;if(lx+14+tw>br.width)lx=lx-tw-28;if(ly+14+th>br.height)ly=ly-th-28;tip.style.left=Math.max(0,lx)+'px';tip.style.top=Math.max(0,ly)+'px';cv.style.cursor='help';});
 cv.addEventListener('pointerleave',function(){tip.hidden=true;});}
/* leveällä näytöllä kartta tarttuu jo osion yläreunasta: --kk-lift = matka osion alusta kartan luonnolliseen paikkaan */
function lift(){var wide=false;try{wide=matchMedia('(min-width:1100px)').matches;}catch(e){}secs.forEach(function(s){if(s.getAttribute('data-live')!=='map')return;var m=s.querySelector('.kk-maps');if(!m)return;if(!wide){s.style.setProperty('--kk-lift','0px');return;}var cur=parseFloat(s.style.getPropertyValue('--kk-lift'))||0,v=Math.round(m.getBoundingClientRect().top-s.getBoundingClientRect().top+cur);if(v!==cur)s.style.setProperty('--kk-lift',v+'px');});}
lift();
function start(){if(c)return;c=window.SAMA_BOOT();if(document.querySelector('.k-live .cv-map')){loadMap();c._mapCmp=false;c._mapCur='vork';c.setMapLayers({vork:1});}tick();}
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){for(var i=0;i<es.length;i++)if(es[i].isIntersecting){io.disconnect();start();return;}},{rootMargin:'120% 0px 120% 0px'});secs.forEach(function(s){io.observe(s);});}else start();
function line(s){var v=s&&s.querySelector('.kk-maps,.k-fig,.ks-stage');if(v){var r=v.getBoundingClientRect();if(r.left<innerWidth*0.3&&r.top<=110&&r.bottom<innerHeight*0.8)return r.bottom+(innerHeight-r.bottom)*0.35;}return innerHeight*0.55;}
function nearest(st,s){var mid=line(s),b=-1,bd=1e9;for(var i=0;i<st.length;i++){var r=st[i].getBoundingClientRect(),d=r.top>mid?r.top-mid:(r.bottom<mid?mid-r.bottom:0);if(d<bd){bd=d;b=i;}}return b;}
function mark(st,i){for(var k=0;k<st.length;k++)st[k].classList.toggle('on',k===i);}
function step(s){var st=s.querySelectorAll('[data-step]');if(!st.length)return;var kind=s.getAttribute('data-live'),i;
 if(kind==='sld'){var f=st[0].getBoundingClientRect(),l=st[st.length-1].getBoundingClientRect(),p=(line(s)-f.top)/Math.max(1,l.bottom-f.top);p=Math.max(0,Math.min(0.999,p));c._p3Lock=p;c._p3=p;i=Math.min(st.length-1,Math.floor(p*st.length));if(last[s.id]!==i){last[s.id]=i;mark(st,i);}return;}
 i=nearest(st,s);
 if(kind==='map'){var lb=st[st.length-1].getBoundingClientRect(),ln=line(s),vm=s.querySelector('.kk-maps'),vr=vm&&vm.getBoundingClientRect(),stk=vr&&vr.left<innerWidth*0.3&&vr.top<=110&&vr.bottom<innerHeight*0.8,endY=stk?vr.bottom:innerHeight*0.12;c._mapP=Math.max(0,Math.min(1,(ln-lb.top)/Math.max(1,ln-endY)));}
 if(i<0||last[s.id]===i)return;last[s.id]=i;mark(st,i);
 if(kind==='map'){var r=s.querySelector('#kk'+i);if(r)r.checked=true;var o={};for(var j=0;j<MAPK.length;j++)o[MAPK[j]]=(j===0||j===i)?1:0;if(c._you)o.site=1;c._mapCur=MAPK[i];c.setMapLayers(o);}
 else if(kind==='proc'){var HB=c._HB;c._ht=HB[Math.min(i,HB.length-1)]+0.01;}}
function tick(){if(!c||pend)return;pend=true;requestAnimationFrame(function(){pend=false;secs.forEach(function(s){var r=s.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;if(s.getAttribute('data-live')==='map'&&!s.style.getPropertyValue('--kk-lift'))lift();step(s);});});}
addEventListener('scroll',tick,{passive:true});addEventListener('resize',function(){lift();tick();});addEventListener('load',lift);try{document.fonts.ready.then(lift);}catch(e){}
/* 05.11.2026: liittymä kartalle — selaimen sijainti vain painikkeesta tai kohdan valinta kartalta; sijaintia ei tallenneta eikä lähetetä */
/* 05.11.2026 (vestlus C): paikan kortti viimeiseen askeleeseen (Teidän liittymänne / Teie liitumine, CTA:n eteen) ja sama painike
   myös siellä; ylärivin tila linkittää sinne. Tilateksti tulee sen painikkeen viereen, jota käytettiin (napautus: viimeisessä
   askeleessa sen tilaan, muuten ylös). Tekstit ylärivin painikkeen data-*-attribuuteista. */
(function(){var sec=document.querySelector('.k-live[data-live="map"]');if(!sec)return;var cv=sec.querySelector('.cv-map'),gbs=sec.querySelectorAll('.kk-geo'),gb=gbs[0],ls=sec.querySelectorAll('[data-step]'),l6=ls[ls.length-1],act=null;
function stOf(el){var y=el&&el.closest('.kk-you');return y?y.querySelector('.kk-st'):null;}
function say(k){if(!gb)return;var st=act||stOf(gb);[].forEach.call(sec.querySelectorAll('.kk-st'),function(x){if(x!==st)x.textContent='';});if(!st)return;st.textContent=gb.getAttribute('data-'+k)||'';var g=gb.getAttribute('data-go');
 if(g&&l6&&!l6.contains(st)&&(k==='ok'||k==='tap')){var a=document.createElement('a');a.href='#';a.className='kk-go';a.textContent=g;a.addEventListener('click',function(e){e.preventDefault();go6();});st.appendChild(document.createTextNode(' '));st.appendChild(a);}}
function go6(){var y=l6.getBoundingClientRect().top+scrollY-line(sec)+Math.min(l6.offsetHeight,innerHeight*0.4)/2;scrollTo({top:Math.max(0,y),behavior:'smooth'});}
function put(lon,lat,k,n,lab){if(!c||!c._map||!c._kd){if((n||0)<25)setTimeout(function(){put(lon,lat,k,(n||0)+1,lab);},300);return;}var b=c._map.bbox;if(!(lon>b.x0&&lon<b.x1&&lat>b.y0&&lat<b.y1)){say('out');return;}
 window.SAMA_MAP_SITE=c._ll([lon,lat]);c._you=1;var L=c._kd.layers[c._kd.layers.length-1],HU=c._mapHome()==='ee'?'EE':'FI';
 if(L&&L.view&&L.view[HU]){if(!L._v0)L._v0=L.view[HU].slice();var w=(L._v0[2]-L._v0[0])/2,h=(L._v0[3]-L._v0[1])/2;L.view[HU]=[lon-w,lat-h,lon+w,lat+h];}
 c.setMapLayers({site:1});say(k);paikka(lon,lat,lab);}
/* valitun paikan kortti — mikä siinä paikassa on totta (assets/kartta-paikka.js, ladataan vasta nyt); askeleen oma CTA jää kortin alle */
var pk=null;function needP(){if(window.SAMA_PAIKKA)return Promise.resolve(window.SAMA_PAIKKA);if(!pk)pk=new Promise(function(ok,no){var s=document.createElement('script');s.src='/assets/kartta-paikka.js';s.onload=function(){window.SAMA_PAIKKA?ok(window.SAMA_PAIKKA):no();};s.onerror=function(){pk=null;no();};document.head.appendChild(s);});return pk;}
function paikka(lon,lat,lab){if(!l6)return;var o={before:l6.querySelector('.btn-primary'),label:lab||null};needP().then(function(P){P.show(l6,lon,lat,o);}).catch(function(){});}
/* 06.11.2026: osoitehaku (oma palvelin → Maa- ja Ruumiamet / Maanmittauslaitos); tila sen lomakkeen viereen, jota käytettiin */
[].forEach.call(sec.querySelectorAll('.kk-addr'),function(fm){var pend=false,go=function(){needP().then(function(P){P.search(fm,function(r){act=stOf(fm);start();put(r.lon,r.lat,'addr',0,r.t);});if(pend){pend=false;fm.dispatchEvent(new Event('submit',{cancelable:true}));}}).catch(function(){});};fm.addEventListener('focusin',go,{once:true});fm.addEventListener('pointerenter',go,{once:true});fm.addEventListener('submit',function(e){e.preventDefault();if(!fm._kp){pend=true;go();}});});
[].forEach.call(gbs,function(bt){if(!('geolocation' in navigator)){bt.hidden=true;return;}bt.addEventListener('click',function(){act=stOf(bt);start();say('wait');navigator.geolocation.getCurrentPosition(function(p){put(p.coords.longitude,p.coords.latitude,'ok');},function(){say('no');},{enableHighAccuracy:false,timeout:10000,maximumAge:600000});});});
if(cv)cv.addEventListener('click',function(e){if(!c||!c._mapInv||!c._map)return;var on=sec.querySelector('[data-step].on');act=stOf(on&&on===l6?l6.querySelector('.kk-geo'):gb);var r=cv.getBoundingClientRect(),M=c._mapInv,q0=M[2]+(e.clientX-r.left-M[0])/(M[4]*M[5]),q1=M[3]+(e.clientY-r.top-M[1])/M[4],b=c._map.bbox;put(b.x0+q0*(b.x1-b.x0),b.y1-q1*(b.y1-b.y0),'tap');});
})();
secs.forEach(function(s){[].forEach.call(s.querySelectorAll('[data-jump]'),function(el){el.addEventListener('click',function(e){var t=s.querySelector('[data-step="'+el.getAttribute('data-jump')+'"]');if(!t)return;e.preventDefault();var y=t.getBoundingClientRect().top+scrollY-line(s)+Math.min(t.offsetHeight,innerHeight*0.4)/2;scrollTo({top:Math.max(0,y),behavior:'smooth'});});});});
})();
/* 06.11.2026: kartan "Vie paikka arviopyyntöön" toiselta sivulta — täytä näkyvä paikkakenttä ja siisti osoite */
(function(){var h=location.hash,i=h.indexOf('&p=');if(i<0)return;var id=h.slice(1,i),v='';try{v=decodeURIComponent(h.slice(i+3));}catch(e){}var f=document.getElementById('f-place-a');if(f&&v)f.value=v.slice(0,200);try{history.replaceState(null,'','#'+id);}catch(e){}var t=document.getElementById(id);if(t)setTimeout(function(){t.scrollIntoView();},60);})();
