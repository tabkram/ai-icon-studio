// AI Icon Studio build: your icons (icons/*.json|mjs) -> dist/ (SVG sets, manifest, catalogue, optional font).
//
//   ai-icon-studio build [--icons <dir>] [--out <dir>] [--anims reveal,pop,...|none] [--only <regex on name>] [--font]
//
// dist/svg/line     outline in currentColor
// dist/svg/tinted   outline with a 30 % fill in currentColor
// dist/svg/color    full colour
// dist/svg/anim-*   animated colour, one folder per preset (see PRESETS)
// dist/font         with --font: icon font, 5 weights (needs Python, see README)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const M = require('./render.js');
const { BADGES, withBadge } = require('./badges.js');
const LOOK = { sw: 3, level: 'medium' };

const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i < 0 ? undefined : (argv[i + 1] ?? true);
};
const DIST = resolve(opt('out') || 'dist');
const SITE = join(DIST, 'catalogue');
const ICONS_DIR = resolve(typeof opt('icons') === 'string' ? opt('icons') : 'icons');
const only = opt('only') ? new RegExp(opt('only')) : null;
const animArg = opt('anims');
const FONT_ON = argv.includes('--font');

/* ---------- animations ---------- */
const DRAW_STYLE = (d) =>
  `.l{color:#20b9b0;animation:mi-out .45s ease ${d + 1.15}s forwards}.l path{stroke-dasharray:1 1;animation:mi-draw .75s cubic-bezier(.25,.6,.3,1) ${d}s both}` +
  `.c{animation:mi-rise .9s cubic-bezier(.5,0,.25,1) ${d + 0.4}s both}` +
  `.c .el.fx{transform-box:fill-box;transform-origin:center;animation:mi-pop .55s cubic-bezier(.3,1.7,.5,1) both;animation-delay:calc(${d + 1}s + var(--i) * 50ms)}` +
  `.c .el.fizz{animation:mi-fizz 2.2s ease-in ${d + 1.1}s 3 both}` +
  `.c .spin{transform-box:fill-box;transform-origin:center;animation:mi-spin 1.2s cubic-bezier(.2,.7,.3,1) ${d + 0.5}s both}` +
  '@keyframes mi-spin{from{transform:rotate(-120deg)}to{transform:none}}@keyframes mi-draw{0%{stroke-dashoffset:1;opacity:0}2%{opacity:1}100%{stroke-dashoffset:0;opacity:1}}' +
  '@keyframes mi-rise{from{clip-path:inset(100% 0 0 0)}to{clip-path:inset(0 0 0 0)}}@keyframes mi-out{to{opacity:0}}@keyframes mi-pop{from{transform:scale(0);opacity:0}to{transform:none;opacity:1}}' +
  '@keyframes mi-fizz{0%{transform:none;opacity:0}20%{opacity:.9}75%{opacity:.9}100%{transform:translateY(-6px);opacity:0}}' +
  '@media (prefers-reduced-motion:reduce){*{animation:none!important}.l{opacity:0}}';
const PARTICLES = [
  [6, 9, 1.2, '#9ade83'],
  [43, 30, 1, '#20b9b0'],
  [9, 24, 0.8, '#ffc22e'],
  [40, 41, 0.9, '#9ade83']
];

/** Whole-icon motions on the colour version: the CSS applies to a group wrapping the drawing. */
const BOX = 'transform-box:fill-box;transform-origin:center;';
const PRESETS = {
  pop: `.a{${BOX}animation:p-pop .6s cubic-bezier(.3,1.7,.5,1) both}@keyframes p-pop{from{transform:scale(0);opacity:0}to{transform:none;opacity:1}}`,
  pulse: `.a{${BOX}animation:p-pulse 1.4s ease-in-out infinite}@keyframes p-pulse{50%{transform:scale(1.12)}}`,
  spin: `.a{${BOX}animation:p-spin 2.4s linear infinite}@keyframes p-spin{to{transform:rotate(360deg)}}`,
  bounce: `.a{${BOX}animation:p-bounce 1s cubic-bezier(.3,0,.4,1) infinite}@keyframes p-bounce{0%,100%{transform:none}40%{transform:translateY(-5px)}60%{transform:translateY(-5px)}80%{transform:translateY(0) scale(1.04,.94)}}`,
  float: `.a{${BOX}animation:p-float 3s ease-in-out infinite}@keyframes p-float{50%{transform:translateY(-3px)}}`,
  shake: `.a{${BOX}animation:p-shake .6s ease-in-out infinite}@keyframes p-shake{0%,100%{transform:none}20%{transform:translateX(-2px) rotate(-3deg)}40%{transform:translateX(2px) rotate(3deg)}60%{transform:translateX(-1.5px) rotate(-2deg)}80%{transform:translateX(1.5px) rotate(2deg)}}`,
  wobble: `.a{${BOX}animation:p-wobble 1.6s ease-in-out infinite}@keyframes p-wobble{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}`,
  fade: `.a{animation:p-fade 1.8s ease-in-out infinite}@keyframes p-fade{50%{opacity:.25}}`
};
const REDUCED = '@media (prefers-reduced-motion:reduce){*{animation:none!important}}';
const ALL_ANIMS = ['reveal', ...Object.keys(PRESETS)];
const anims = animArg === 'none' ? [] : typeof animArg === 'string' ? animArg.split(',') : ALL_ANIMS;
for (const a of anims) if (!ALL_ANIMS.includes(a)) throw new Error(`Unknown animation "${a}". Available: ${ALL_ANIMS.join(', ')}`);

const motion = (svg, preset) =>
  svg
    .replace(/^<svg [^>]*>/, (open) => `${open}<style>${PRESETS[preset]}${REDUCED}</style><g class="a">`)
    .replace(/<\/svg>\s*$/, '</g></svg>');

/** Outline drawn, then colour revealed; the large icons get a glow, a ground shadow and particles. */
const reveal = (layers, uid, stage) => {
  const svg = M.render(layers, 'anim', { ...LOOK, uid, fx: !!stage }).replace(
    /^<svg [^>]*>/,
    (open) => `${open}<style>${DRAW_STYLE(0)}</style>`
  );
  if (!stage || !M.STAGE[stage]) return svg;
  const [cx, cy, rx] = M.STAGE[stage];
  const deco =
    `<defs><radialGradient id="${stage}-glow"><stop offset="0" stop-color="#20b9b0" stop-opacity=".2"/><stop offset="1" stop-color="#20b9b0" stop-opacity="0"/></radialGradient></defs>` +
    `<circle cx="24" cy="25" r="23" fill="url(#${stage}-glow)"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="1.6" fill="#0b3b38" fill-opacity=".14"/>` +
    PARTICLES.map(([x, y, r, c], i) => `<circle class="el fx" style="--i:${i}" cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join('');
  return svg.replace(/<g class="c"[^>]*>/, (open) => open + deco);
};

/* ---------- 1. your icons ---------- */
const loadCustom = async () => {
  if (!existsSync(ICONS_DIR)) return [];
  const out = [];
  for (const f of readdirSync(ICONS_DIR).sort()) {
    const ext = extname(f);
    if (!['.json', '.mjs', '.js'].includes(ext)) continue;
    const path = join(ICONS_DIR, f);
    const def = ext === '.json' ? JSON.parse(readFileSync(path, 'utf8')) : (await import(pathToFileURL(path).href)).default;
    const name = def.name || basename(f, ext);
    if (!Array.isArray(def.els)) throw new Error(`${f}: "els" must be an array of { d, role, c }`);
    const label = def.label || name;
    out.push({ name, label, file: `${name}.svg`, layers: () => [{ els: def.els }], uid: 'c-' + name.replace(/\W/g, '') });
    const wanted = def.variants === 'all' ? Object.keys(BADGES) : def.variants || [];
    for (const b of wanted) {
      out.push({ name: `${name}-${b}`, label: `${label} (${BADGES[b]?.label || b})`, file: `${name}-${b}.svg`, layers: () => withBadge(def.els, b), uid: 'c-' + `${name}-${b}`.replace(/\W/g, '') });
    }
  }
  return out;
};
const custom = (await loadCustom()).filter((c) => !only || only.test(c.name));
const rendered = [];

/* ---------- 3. SVG sets ---------- */
rmSync(join(DIST, 'svg'), { recursive: true, force: true });
const kinds = ['line', 'tinted', 'color', ...anims.map((a) => `anim-${a}`)];
for (const k of kinds) mkdirSync(join(DIST, 'svg', k), { recursive: true });
// svg:root only matches when the file is the document (an <img>): it then follows the OS scheme; inlined, it inherits the page colour.
const THEME = '<style>svg:root{color:#1f2328}@media (prefers-color-scheme:dark){svg:root{color:#f0f3f6}}</style>';
const themed = (svg) => svg.replace(/^<svg [^>]*>/, (open) => open + THEME);
const emit = (file, layers, uid, title, stage) => {
  const o = { ...LOOK, plain: true, uid, title };
  const out = (kind, svg) => writeFileSync(join(DIST, 'svg', kind, file), svg + '\n');
  out('line', themed(M.render(layers(), 'line', o)));
  out('tinted', themed(M.render(layers(), 'line', { ...o, tint: 0.3 })));
  const color = M.render(layers(), 'color', o);
  out('color', color);
  for (const a of anims) out(`anim-${a}`, a === 'reveal' ? reveal(layers(), uid, stage) : motion(color, a));
};
for (const c of custom) {
  emit(c.file, c.layers, c.uid, c.label, null);
  rendered.push({ name: c.name, label: c.label, file: c.file });
}
writeFileSync(join(DIST, 'manifest.json'), JSON.stringify({ look: LOOK, kinds, icons: rendered }, null, 1) + '\n');

/* ---------- 4. catalogue: your icons ---------- */
mkdirSync(SITE, { recursive: true });
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const galleryCss =
  ':root{color-scheme:light dark;--bg:#f3f7f5;--s:#fff;--l:#d9e3df;--t:#1d2b27;--m:#5b6d66;color:var(--t)}@media(prefers-color-scheme:dark){:root{--bg:#141917;--s:#1c2320;--l:#2e3a35;--t:#e2eee3;--m:#9fb1a8}}' +
  'body{margin:0;background:var(--bg);color:var(--t);font:15px/1.5 system-ui,sans-serif}main{max-width:1100px;margin:auto;padding:32px 16px}h1{margin:0 0 4px}p{color:var(--m)}' +
  '.card{background:var(--s);border:1px solid var(--l);border-radius:12px;padding:14px;margin:14px 0}.card h2{margin:0 0 10px;font-size:1rem}.card code{color:var(--m);font-weight:400}' +
  '.row{display:flex;flex-wrap:wrap;gap:12px}.v{display:grid;justify-items:center;gap:4px;font-size:.72rem;color:var(--m);width:84px}.v img{width:64px;height:64px}';
const tile = (kind, file, label) =>
  `<div class="v"><img src="../svg/${kind}/${esc(file)}" alt="${esc(label)} ${kind}">${kind}</div>`;
writeFileSync(
  join(SITE, 'index.html'),
  `<!doctype html><meta charset="utf-8"><title>AI Icon Studio</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>${galleryCss}</style><main><h1>Icons</h1>` +
    `<p>${rendered.length} icon${rendered.length === 1 ? '' : 's'}, each as line, tinted, colour and ${anims.length} animation${anims.length === 1 ? '' : 's'}.</p>` +
    rendered
      .map(
        (c) =>
          `<section class="card"><h2>${esc(c.label)} <code>${esc(c.file)}</code></h2><div class="row">${['line', 'tinted', 'color', ...anims.map((a) => 'anim-' + a)]
            .map((k) => tile(k, c.file, c.label))
            .join('')}</div></section>`
      )
      .join('') +
    '</main>'
);

/* ---------- 5. font (optional) ---------- */
if (FONT_ON) {
  const WEIGHTS = [
    { cls: 'thin', weight: 200, d: -0.5 },
    { cls: '', weight: 400, d: 0 },
    { cls: 'medium', weight: 500, d: 0.5 },
    { cls: 'regular', weight: 600, d: 1 },
    { cls: 'bold', weight: 700, d: 1.5 }
  ];
  const FONT = join(DIST, 'font');
  rmSync(FONT, { recursive: true, force: true });
  const fontIcons = [];
  for (const c of custom) {
    const at = (d, tint) => M.render(c.layers(), 'line', { ...LOOK, sw: LOOK.sw + d, tint, plain: true, uid: c.uid + (tint ? 't' : '') });
    fontIcons.push({ class: c.name, file: `${c.name}.svg`, svg: (d) => at(d, 0) }, { class: `${c.name}-tinted`, file: `${c.name}-tinted.svg`, svg: (d) => at(d, 0.3) });
  }
  for (const w of WEIGHTS) {
    mkdirSync(join(FONT, String(w.weight)), { recursive: true });
    for (const i of fontIcons) writeFileSync(join(FONT, String(w.weight), i.file), i.svg(w.d));
  }
  writeFileSync(
    join(FONT, 'font.json'),
    JSON.stringify({ weights: WEIGHTS.map(({ cls, weight }) => ({ cls, weight, dir: String(weight) })), icons: fontIcons.map((i) => ({ class: i.class, file: i.file })) }, null, 1)
  );
  execFileSync(process.env.ICONS_PYTHON || 'python3', [join(here, 'build-font.py'), DIST], { stdio: 'inherit' });
}

console.log(`${rendered.length} icons, animations: ${anims.join(', ') || 'none'}${FONT_ON ? ', font' : ''} -> ${DIST}`);
