"""Checks the Studio Icons font against the SVGs it was built from: each class, in each weight, is drawn twice in headless
Chrome (the font glyph with its tint depths, the SVG) at four times the size, averaged back, and compared pixel by pixel.

Run after `npm run generate:icons`:  python3 scripts/icons/check-font.py [class regex] [max %]
Prints the largest differences and exits with 1 when one goes over the limit (default 8 %; edge smoothing alone stays
under 7 %, a wrong or shifted fill goes far above). Chrome: $CHROME, else the usual install paths.
"""
import base64
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).parent
FONT = Path(os.environ.get('ICONS_DIST', HERE / '../dist')) / 'font'
CHROMES = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'google-chrome', 'chromium', 'chromium-browser']

PAGE = r'''<!doctype html><meta charset="utf-8"><style>/*FACES*/</style><pre id="out">running</pre><script>
const ITEMS = /*ITEMS*/[], W = /*WEIGHTS*/[], F = 384, S = 480, K = 4, T = S / K;
const cv = Object.assign(document.createElement('canvas'), { width: S, height: S });
const ctx = cv.getContext('2d', { willReadFrequently: true });
const alpha = () => { const d = ctx.getImageData(0, 0, S, S).data, a = new Float32Array(S * S); for (let i = 0; i < S * S; i++) a[i] = d[i * 4 + 3]; return a; };
const down = (a) => { const o = new Float32Array(T * T); for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) { let s = 0; for (let j = 0; j < K; j++) for (let i = 0; i < K; i++) s += a[(y * K + j) * S + x * K + i]; o[y * T + x] = s / (K * K); } return o; };
const img = (src) => new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });
(async () => {
  for (const w of W) await document.fonts.load(w + ' 384px "Studio Icons"', '');
  const res = [];
  for (const it of ITEMS) for (const w of W) {
    ctx.clearRect(0, 0, S, S); ctx.font = w + ' ' + F + 'px "Studio Icons"'; ctx.fillStyle = '#000';
    ctx.fillText(String.fromCodePoint(it.b), 0, 0.95 * F);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; for (const c of it.a) ctx.fillText(String.fromCodePoint(c), 0, 0.95 * F);
    const A = down(alpha());
    ctx.clearRect(0, 0, S, S); ctx.drawImage(await img(it.svg[w]), 0, 0, S, S); const B = down(alpha());
    let diff = 0, ink = 0; for (let i = 0; i < T * T; i++) { if (Math.max(A[i], B[i]) > 20) ink++; if (Math.abs(A[i] - B[i]) > 40) diff++; }
    res.push([it.cls, w, ink ? +(100 * diff / ink).toFixed(2) : 0]);
  }
  document.getElementById('out').textContent = JSON.stringify(res);
})().catch((e) => { document.getElementById('out').textContent = 'ERR ' + e; });
</script>'''


def main():
    pattern = re.compile(sys.argv[1]) if len(sys.argv) > 1 else None
    limit = float(sys.argv[2]) if len(sys.argv) > 2 else 8
    spec = json.loads((FONT / 'font.json').read_text())
    css = (FONT / 'studio-icons.css').read_text()
    before = dict(re.findall(r"\.app-icon-([\w-]+)::before \{\n  content: '([^']*)'", css))
    after = dict(re.findall(r"\.app-icon-([\w-]+)::after \{\n  content: '([^']*)'", css))
    codes = lambda s: [int(h, 16) for h in re.findall(r'\\([0-9a-f]+)', s)]
    items = []
    for icon in spec['icons']:
        if pattern and not pattern.search(icon['class']):
            continue
        svg = {w['weight']: 'data:image/svg+xml;base64,' + base64.b64encode((FONT / w['dir'] / icon['file']).read_bytes()).decode() for w in spec['weights']}
        items.append({'cls': icon['class'], 'b': codes(before[icon['class']])[0], 'a': codes(after.get(icon['class'], '')), 'svg': svg})
    page = (PAGE.replace('/*FACES*/', ''.join(re.findall(r'@font-face \{[^}]*\}', css)))
            .replace('/*ITEMS*/[]', json.dumps(items)).replace('/*WEIGHTS*/[]', json.dumps([w['weight'] for w in spec['weights']])))
    chrome = os.environ.get('CHROME') or next((c for c in CHROMES if Path(c).exists() or shutil.which(c)), None)
    if not chrome:
        sys.exit('Chrome not found: set $CHROME')
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / 'check.html'
        path.write_text(page)
        dom = subprocess.run([chrome, '--headless=new', '--disable-gpu', f'--virtual-time-budget={max(60000, len(items) * 2000)}', '--dump-dom', path.as_uri()],
                             capture_output=True, text=True).stdout
    out = re.search(r'<pre id="out">(.*?)</pre>', dom, re.S)
    if not out or not out.group(1).startswith('['):
        sys.exit('check failed: ' + (out.group(1)[:200] if out else 'no result'))
    res = sorted(json.loads(out.group(1)), key=lambda r: -r[2])
    over = [r for r in res if r[2] > limit]
    print(f"{len(res)} comparisons ({len(items)} classes x {len(spec['weights'])} weights); largest: " + ', '.join(f'{c} {w} {p} %' for c, w, p in res[:5]))
    if over:
        print('over the limit: ' + ', '.join(f'{c} {w} {p} %' for c, w, p in over))
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
