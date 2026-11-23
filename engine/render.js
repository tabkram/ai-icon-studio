// AI Icon Studio renderer. One drawing (layers of paths), rendered as line, tinted (opts.tint), colour or animated.
// Grid 48. One stroke (4), one gap (3), stroke edges inside 1..47.
(function (root) {
  const SW = 4;
  const GAP = 3;
  const f = (n) => Math.round(n * 100) / 100;
  const pt = (x, y) => `${f(x)} ${f(y)}`;
  const P = (p) => pt(p[0], p[1]);
  const polar = (cx, cy, r, deg) => {
    const a = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  /* ---------- primitives ---------- */
  const circle = (cx, cy, r) =>
    `M${pt(cx - r, cy)}A${f(r)} ${f(r)} 0 1 0 ${pt(cx + r, cy)}A${f(r)} ${f(r)} 0 1 0 ${pt(cx - r, cy)}Z`;
  const dot = (x, y) => `M${pt(x, y)}v.01`;
  const hexagon = (cx, cy, r) =>
    'M' + [0, 1, 2, 3, 4, 5].map((k) => P(polar(cx, cy, r, -90 + 60 * k))).join('L') + 'Z';
  /** Filled highlight, thin at both ends, like the reflection of the logo. */
  const crescent = (cx, cy, r, a0, a1, t) => {
    const N = 16, out = [], inn = [];
    for (let i = 0; i <= N; i++) {
      const a = a0 + ((a1 - a0) * i) / N, k = Math.sin((Math.PI * i) / N);
      out.push(polar(cx, cy, r, a));
      inn.push(polar(cx, cy, r - t * k, a));
    }
    return 'M' + out.map(P).join('L') + 'L' + inn.reverse().map(P).join('L') + 'Z';
  };
  const capsule = (p, q, h) => {
    const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy);
    const nx = (-dy / L) * h, ny = (dx / L) * h;
    return `M${pt(p[0] + nx, p[1] + ny)}L${pt(q[0] + nx, q[1] + ny)}A${f(h)} ${f(h)} 0 0 0 ${pt(q[0] - nx, q[1] - ny)}L${pt(p[0] - nx, p[1] - ny)}A${f(h)} ${f(h)} 0 0 0 ${pt(p[0] + nx, p[1] + ny)}Z`;
  };
  const sparkle = (x, y, s) =>
    `M${pt(x, y - s)}Q${pt(x, y)} ${pt(x + s, y)}Q${pt(x, y)} ${pt(x, y + s)}Q${pt(x, y)} ${pt(x - s, y)}Q${pt(x, y)} ${pt(x, y - s)}Z`;
  /** Question mark of height h centred on (cx, cy). */
  const qmark = (cx, cy, h) => {
    const s = h / 4, X = (x) => cx + x * s, Y = (y) => cy + y * s;
    return (
      `M${pt(X(-1), Y(-1.1))}A${f(s)} ${f(s)} 0 1 1 ${pt(X(0.766), Y(-0.457))}` +
      `Q${pt(X(0), Y(-0.05))} ${pt(X(0), Y(0.55))}V${f(Y(0.75))}` +
      dot(X(0), Y(1.9))
    );
  };

  const rect = (x, y, w, h, r = 0) => {
    r = Math.min(r, w / 2, h / 2);
    return `M${pt(x + r, y)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${pt(x + w, y + r)}V${f(y + h - r)}A${f(r)} ${f(r)} 0 0 1 ${pt(x + w - r, y + h)}H${f(x + r)}A${f(r)} ${f(r)} 0 0 1 ${pt(x, y + h - r)}V${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${pt(x + r, y)}Z`;
  };
  const polygon = (points, close = true) => 'M' + points.map(P).join('L') + (close ? 'Z' : '');
  /** Regular polygon with n sides, first vertex on top. */
  const ngon = (cx, cy, r, n, rot = -90) => polygon(Array.from({ length: n }, (_, k) => polar(cx, cy, r, rot + (360 / n) * k)));
  /** Star with n points, between the outer radius r and the inner radius ri. */
  const star = (cx, cy, r, ri, n = 5, rot = -90) =>
    polygon(Array.from({ length: n * 2 }, (_, k) => polar(cx, cy, k % 2 ? ri : r, rot + (180 / n) * k)));
  const line = (x1, y1, x2, y2) => `M${pt(x1, y1)}L${pt(x2, y2)}`;
  const arc = (cx, cy, r, a0, a1) => `M${P(polar(cx, cy, r, a0))}A${f(r)} ${f(r)} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${P(polar(cx, cy, r, a1))}`;

  /* ---------- palette: water, leaf and reflection come from the logo ---------- */
  const PAL = {
    water: { g: ['#20b9b0', '#096477'], ink: '#064f5f' },
    leaf: { g: ['#9ade83', '#13a779'], ink: '#0b6c4f' },
    amber: { g: ['#ffd56e', '#f39a1c'], ink: '#8f4c08' },
    blue: { g: ['#8fd1ff', '#2f7ee6'], ink: '#1a4b97' },
    violet: { g: ['#dcaeff', '#8c47cc'], ink: '#52207b' },
    glass: { g: ['#effcfb', '#c4ebef'], ink: '#064f5f' },
    paper: { g: ['#ffffff', '#e9f1ef'], ink: '#064f5f' },
    sun: { g: ['#fff3a6', '#ffc22e'], ink: '#8a6000' },
    coral: { g: ['#ffb3c6', '#ec5079'], ink: '#9e2148' },
    steel: { g: ['#f1f4f8', '#b4c0cf'], ink: '#46566b' },
    rm: { g: ['#fbf6cf', '#e8d670'], ink: '#655914' }, // the raw-material badge (#f8eeaa, dark #655914)
    cubeTop: { g: ['#fffbe0', '#ffe98a'], ink: '#7a5600' },
    cubeLeft: { g: ['#ffe46b', '#f6c21c'], ink: '#7a5600' },
    cubeRight: { g: ['#e9b10f', '#c58f00'], ink: '#7a5600' }
  };
  const SHINE = '#ffffff';
  /** A palette key, or any hex colour: the gradient goes from a light tone to the colour, the ink is a deeper tone. */
  const mix = (hex, t, to) => {
    const h = hex.replace('#', '').replace(/^(.)(.)(.)$/, '$1$1$2$2$3$3');
    const v = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    return '#' + v.map((x) => Math.round(x + (to - x) * t).toString(16).padStart(2, '0')).join('');
  };
  const pal = (c) => PAL[c] || (/^#[0-9a-f]{3,6}$/i.test(c || '') ? { g: [mix(c, 0.45, 255), c], ink: mix(c, 0.55, 0) } : PAL.glass);
  const cid = (c) => String(c).replace(/\W/g, '');
  const FX = [];

  /* ---------- rendering ---------- */
  let seq = 0;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  /** kind: 'line' | 'color' | 'anim'. opts: { size, fx, inkVar, title, uid, plain } */
  /** An SVG attribute, or nothing when the value is empty. */
  const attr = (name, v) => (v ? ` ${name}="${v}"` : '');
  function render(layers, kind, opts = {}) {
    const uid = opts.uid || 'mi' + ++seq;
    const sw = opts.sw || SW;
    const LEVEL = { thin: 0.6, medium: 0.8 };
    const levelW = (el) => (el.level && LEVEL[opts.level] ? ` stroke-width="${f(sw * LEVEL[opts.level])}"` : '');
    const shown = (el) => !(el.level && opts.level === 'none');
    const defs = [];
    const used = new Set();
    const clips = new Map();
    const maskOf = layers.map((layer, i) => {
      const front = layers.slice(i + 1).filter((l) => l.cut && l.cut.length);
      if (!front.length) {
        return null;
      }
      const id = `${uid}-m${i}`;
      defs.push(
        `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48"><rect width="48" height="48" fill="#fff"/>` +
          front.map((l) => `<path d="${l.cut.join('')}"${attr('transform', l.tf)} fill="#000" stroke="#000" stroke-width="${sw + 2 * GAP}" stroke-linejoin="round"/>`).join('') +
          '</mask>'
      );
      return id;
    });
    const clipOf = (d) => {
      if (!clips.has(d)) {
        const id = `${uid}-c${clips.size}`;
        clips.set(d, id);
        defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`);
      }
      return clips.get(d);
    };
    const gid = (c) => (used.add(c), `url(#${uid}-${cid(c)})`);
    const inkOf = (el) => el.ink || pal(el.c).ink;
    const stroke = (el) => {
      const ink = inkOf(el);
      return opts.inkVar && ink !== '#ffffff' ? ` style="stroke:var(--ico-ink, ${ink})"` : ` stroke="${ink}"`;
    };
    const clip = (el, s) => (el.clip ? `<g clip-path="url(#${clipOf(el.clip)})">${s}</g>` : s);
    const tfa = (el) => (el.tf ? ` transform="${el.tf}"` : '');
    const plain = opts.plain || kind !== 'anim';

    // Line: every outline in currentColor, nothing else.
    const lineEls = (els) => {
      let out = '', spin = '';
      for (const el of els) {
        if (!['shape', 'line'].includes(el.role) || !shown(el)) {
          continue;
        }
        const solid = el.solid
          ? ' fill="currentColor" fill-rule="evenodd"'
          : opts.tint && el.role === 'shape' && !el.nofill ? ` fill="currentColor" fill-opacity="${opts.tint}"` : '';
        const dash = el.dash ? ` stroke-dasharray="${el.dash}"` : '';
        const s = clip(el, `<path d="${el.d}"${tfa(el)}${solid}${dash}${levelW(el)}${attr('stroke-linecap', el.cap)}${plain || el.dash ? '' : ' pathLength="1"'}/>`);
        if (el.spin && !plain) {
          spin += s;
        } else {
          out += s;
        }
      }
      return out + (spin ? `<g class="spin">${spin}</g>` : '');
    };

    // Colour: gradient fills, outlines in the deep tone of each colour.
    let order = 0;
    const colorEl = (el) => {
      let s = '';
      if (!shown(el)) {
        return '';
      }
      if (el.role === 'fill') {
        s = `<path d="${el.d}"${tfa(el)} fill="${gid(el.c)}"/>`;
      } else if (el.role === 'shape') {
        s = `<path d="${el.d}"${tfa(el)}${el.solid ? ' fill-rule="evenodd"' : ''} fill="${el.nofill ? 'none' : gid(el.c)}"${attr('fill-opacity', el.op)}${stroke(el)}/>`;
      } else if (el.role === 'line') {
        s = `<path d="${el.d}"${tfa(el)} fill="none"${levelW(el)}${attr('stroke-dasharray', el.dash)}${attr('stroke-linecap', el.cap)}${el.grad ? attr('stroke', gid(el.c)) : stroke(el)}/>`;
      } else if (el.role === 'bub') {
        s = `<path d="${el.d}"${tfa(el)} fill="${SHINE}" fill-opacity=".85"/>`;
      } else if (el.role === 'shine') {
        s = `<path d="${el.d}" fill="${SHINE}" fill-opacity=".8"/>`;
      } else if (el.role === 'fx') {
        s = `<path d="${el.d}" fill="${gid(el.c)}"/>`;
      }
      s = clip(el, s);
      if (plain && !el.fizz && el.role !== 'fx') {
        return s;
      }
      const cls = ['el'];
      if (el.fizz) {
        cls.push('fizz', 'fz' + el.fizz);
      }
      if (el.role === 'fx') {
        cls.push('fx');
      }
      return `<g class="${cls.join(' ')}" style="--i:${order++}">${s}</g>`;
    };
    const colorEls = (els) => {
      let out = '', spin = '';
      for (const el of els) {
        const s = colorEl(el);
        if (el.spin && !plain) {
          spin += s;
        } else {
          out += s;
        }
      }
      return out + (spin ? `<g class="spin">${spin}</g>` : '');
    };

    const group = (fn) =>
      layers
        .map((l, i) => {
          let inner = fn(l.els);
          if (inner && l.tf) {
            inner = `<g transform="${l.tf}">${inner}</g>`;
          }
          return inner ? (maskOf[i] ? `<g mask="url(#${maskOf[i]})">${inner}</g>` : `<g>${inner}</g>`) : '';
        })
        .join('');
    const attrs = `stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
    const line = () => `<g class="l" fill="none" stroke="currentColor" ${attrs}>${group(lineEls)}</g>`;
    const color = () => {
      order = 0;
      const body = group(colorEls);
      const fx = opts.fx ? `<g class="fxs">${FX.map(colorEl).join('')}</g>` : '';
      const rise = kind === 'anim' ? ` mask="url(#${uid}-rise)"` : '';
      return `<g class="c"${rise} ${attrs}>${body}${fx}</g>`;
    };

    const content = kind === 'line' ? line() : kind === 'color' ? color() : line() + color();
    if (kind === 'anim') {
      defs.push(`<mask id="${uid}-rise" maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48"><rect class="riser" x="0" y="0" width="48" height="48" fill="#fff"/></mask>`);
    }
    const grads = [...used].map(
      (c) =>
        `<linearGradient id="${uid}-${cid(c)}" x1=".15" y1="0" x2=".85" y2="1"><stop offset="0" stop-color="${pal(c).g[0]}"/><stop offset="1" stop-color="${pal(c).g[1]}"/></linearGradient>`
    );
    const all = grads.concat(defs);
    const size = opts.size ? ` width="${opts.size}" height="${opts.size}"` : '';
    const cls = opts.plain ? '' : ` class="ico ${kind}"`;
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"${size}${cls}` +
      (opts.title ? ` role="img"><title>${esc(opts.title)}</title>` : ' aria-hidden="true">') +
      (all.length ? `<defs>${all.join('')}</defs>` : '') +
      content +
      '</svg>'
    );
  }

  const api = { SW, GAP, PAL, render, circle, dot, hexagon, ngon, star, polygon, rect, line, arc, capsule, crescent, sparkle, qmark, polar, pt };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.IconRender = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
