/* Tiny dependency-free chart + stats helpers. Every figure on this site is drawn from this file:
   data are computed in the page (models, seeded noise, real algorithms), never hand-drawn. */
const NP = {
  rng: s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; },
  gauss: r => () => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r()),
  mean: a => a.reduce((s, v) => s + v, 0) / a.length,
  sd: a => { const m = NP.mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); },
  fit(x, y) {
    const n = x.length, mx = NP.mean(x), my = NP.mean(y);
    let sxx = 0, sxy = 0, syy = 0;
    x.forEach((v, i) => { sxx += (v - mx) ** 2; sxy += (v - mx) * (y[i] - my); syy += (y[i] - my) ** 2; });
    const slope = sxy / sxx; return { slope, icpt: my - slope * mx, r2: sxy * sxy / (sxx * syy) };
  },
  ticks(a, b, log) {
    const r = [];
    if (log) { for (let k = Math.ceil(Math.log10(a) - 1e-9); k <= Math.floor(Math.log10(b) + 1e-9); k++) r.push(Math.pow(10, k)); return r; }
    const s = (b - a) / 5, p = Math.pow(10, Math.floor(Math.log10(s))), m = [1, 2, 5, 10].find(q => q * p >= s) * p;
    for (let v = Math.ceil(a / m) * m; v <= b + 1e-9; v += m) r.push(+v.toPrecision(10));
    return r;
  },
  fmt: v => (Math.abs(v) >= 1e4 || (v !== 0 && Math.abs(v) < 1e-2)) ? v.toExponential(0).replace('e+', 'e') : String(+v.toPrecision(3)),
  /* o: {title,xl,yl,xlim,ylim,logx,logy,series:[{n,x,y,c,d,pts,e,w}],bands:[{x0,x1,y0,y1,c,t}],hl:[{y,t}],vl:[{x,t}]} */
  plot(el, o) {
    const W = o.w || 640, H = o.h || 340, m = { l: 62, r: 20, t: 38, b: 52 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
    const pts = o.series.flatMap(s => s.x.map((x, i) => [x, s.y[i]]));
    const [x0, x1] = o.xlim || [Math.min(...pts.map(p => p[0])), Math.max(...pts.map(p => p[0]))];
    const [y0, y1] = o.ylim || [Math.min(...pts.map(p => p[1])), Math.max(...pts.map(p => p[1])) * 1.05];
    const L = (v, a, b, lg) => lg ? Math.log10(v / a) / Math.log10(b / a) : (v - a) / (b - a);
    const fx = v => m.l + L(v, x0, x1, o.logx) * pw, fy = v => m.t + ph - L(v, y0, y1, o.logy) * ph;
    const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.title || 'Chart'}" font-family="Courier New,monospace" font-size="10.5">`;
    (o.bands || []).forEach(b => {
      const bx0 = fx(b.x0 ?? x0), bx1 = fx(b.x1 ?? x1), by0 = fy(cl(b.y1 ?? y1, y0, y1)), by1 = fy(cl(b.y0 ?? y0, y0, y1));
      s += `<rect x="${bx0}" y="${by0}" width="${bx1 - bx0}" height="${by1 - by0}" fill="${b.c}"/>`;
      if (b.t) s += `<text x="${bx0 + 6}" y="${by0 + 13}" fill="#24211b" opacity=".8">${b.t}</text>`;
    });
    NP.ticks(x0, x1, o.logx).forEach(v => s += `<path d="M${fx(v)} ${m.t}V${m.t + ph}" stroke="rgba(60,50,30,.14)"/><text x="${fx(v)}" y="${m.t + ph + 16}" fill="#5f594a" text-anchor="middle">${NP.fmt(v)}</text>`);
    NP.ticks(y0, y1, o.logy).forEach(v => s += `<path d="M${m.l} ${fy(v)}H${m.l + pw}" stroke="rgba(60,50,30,.14)"/><text x="${m.l - 8}" y="${fy(v) + 3}" fill="#5f594a" text-anchor="end">${NP.fmt(v)}</text>`);
    s += `<path d="M${m.l} ${m.t}V${m.t + ph}H${m.l + pw}" fill="none" stroke="rgba(60,50,30,.7)"/>`;
    (o.hl || []).forEach(h => s += `<path d="M${m.l} ${fy(h.y)}H${m.l + pw}" stroke="#5f594a" stroke-dasharray="4 4"/><text x="${m.l + pw - 4}" y="${fy(h.y) - 5}" fill="#5f594a" text-anchor="end">${h.t || ''}</text>`);
    (o.vl || []).forEach(v => s += `<path d="M${fx(v.x)} ${m.t}V${m.t + ph}" stroke="#5f594a" stroke-dasharray="4 4"/><text x="${fx(v.x) + 4}" y="${m.t + 12}" fill="#5f594a">${v.t || ''}</text>`);
    let lx = m.l;
    o.series.forEach(se => {
      const c = se.c || '#1d4f7a';
      if (se.pts) se.x.forEach((x, i) => s += `<circle cx="${fx(x)}" cy="${fy(se.y[i])}" r="${se.r || 3.5}" fill="${c}"/>`);
      else s += `<polyline fill="none" stroke="${c}" stroke-width="${se.w || 2}" stroke-linejoin="round" ${se.d ? `stroke-dasharray="${se.d}"` : ''} points="${se.x.map((x, i) => fx(x).toFixed(1) + ',' + fy(se.y[i]).toFixed(1)).join(' ')}"/>`;
      if (se.e) se.x.forEach((x, i) => s += `<path d="M${fx(x)} ${fy(se.y[i] - se.e[i])}V${fy(se.y[i] + se.e[i])}" stroke="${c}"/>`);
      if (se.n) { s += `<rect x="${lx}" y="10" width="10" height="3" fill="${c}"/><text x="${lx + 15}" y="15" fill="#24211b">${se.n}</text>`; lx += 24 + se.n.length * 6.4; }
    });
    s += `<text x="${m.l + pw / 2}" y="${H - 10}" fill="#5f594a" text-anchor="middle">${o.xl || ''}</text><text transform="translate(14 ${m.t + ph / 2}) rotate(-90)" fill="#5f594a" text-anchor="middle">${o.yl || ''}</text></svg>`;
    el.innerHTML = s;
  }
};
