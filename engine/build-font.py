"""Builds the Studio Icons font from the SVGs written by build-icons.mjs (font/<weight>/*.svg, font/font.json): one face per
weight, embedded as woff2 with one class per icon, like Font Awesome (Duotone for the tinted ones). Writes
the same stylesheet to dist/icons.scss and dist/font/studio-icons.css (the catalogue).

Each icon becomes filled outlines: strokes expanded (round caps and joins), knockout masks and clips applied.
The 30 % fill of a tinted icon becomes glyphs drawn on top at 30 %, one per depth, so overlapping fills darken as in the SVG.
Needs: pip install fonttools skia-pathops brotli
"""
import base64
import io
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path as FsPath

import pathops
from fontTools.fontBuilder import FontBuilder
from fontTools.misc.timeTools import timestampFromString
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.pens.transformPen import TransformPen
from fontTools.svgLib.path import parse_path

HERE = FsPath(__file__).parent
DIST = FsPath(sys.argv[1]) if len(sys.argv) > 1 else HERE / '../dist'
SRC = DIST / 'font'
OUT = DIST / 'icons.scss'
NS = '{http://www.w3.org/2000/svg}'

UPM = 1000
SCALE = 1250 / 48  # the 48 grid fills a 1.25em square
BASE = 325 + 24 * SCALE  # grid y = 24 sits 0.325em above the baseline (the old box: -0.3em to 0.95em)
STRIDE = 0x400  # tint depth k of icon i at U+E001 + i + STRIDE * (k + 1): room for 1023 icons and 5 depths in the private area
CAPS = {'round': pathops.LineCap.ROUND_CAP, 'butt': pathops.LineCap.BUTT_CAP, 'square': pathops.LineCap.SQUARE_CAP}


def tf_matrix(t):
    """SVG transform attribute (translate / rotate / scale / matrix) as an affine 6-tuple."""
    import math
    m = (1, 0, 0, 1, 0, 0)

    def mul(a, b):
        return (a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
                a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5])

    for name, args in re.findall(r'(\w+)\s*\(([^)]*)\)', t or ''):
        v = [float(x) for x in re.split(r'[\s,]+', args.strip()) if x]
        if name == 'translate':
            m = mul(m, (1, 0, 0, 1, v[0], v[1] if len(v) > 1 else 0))
        elif name == 'scale':
            m = mul(m, (v[0], 0, 0, v[1] if len(v) > 1 else v[0], 0, 0))
        elif name == 'rotate':
            a = math.radians(v[0])
            c, s = math.cos(a), math.sin(a)
            if len(v) == 3:
                m = mul(m, (1, 0, 0, 1, v[1], v[2]))
            m = mul(m, (c, s, -s, c, 0, 0))
            if len(v) == 3:
                m = mul(m, (1, 0, 0, 1, -v[1], -v[2]))
        elif name == 'matrix':
            m = mul(m, tuple(v))
    return m


def geometry(d, matrix, evenodd=False):
    p = pathops.Path()
    parse_path(d, TransformPen(p.getPen(), matrix))
    p.fillType = pathops.FillType.EVEN_ODD if evenodd else pathops.FillType.WINDING
    return p


def stroked(d, matrix, width, cap):
    p = geometry(d, matrix)
    p.stroke(width, CAPS.get(cap, pathops.LineCap.ROUND_CAP), pathops.LineJoin.ROUND_JOIN, 4)
    p.convertConicsToQuads(0.02)
    return p


def polylines(d, matrix):
    """The path as polylines (curves and arcs sampled), one per subpath: the dashes start again on each one, as in SVG."""
    rec = RecordingPen()
    parse_path(d, TransformPen(rec, matrix))
    lines, cur = [], []
    for op, args in rec.value:
        if op == 'moveTo':
            cur = [args[0]]
            lines.append(cur)
        elif op == 'lineTo':
            cur.append(args[0])
        elif op in ('curveTo', 'qCurveTo'):
            control = [cur[-1], *args]
            for k in range(1, 25):
                pts, t = control, k / 24
                while len(pts) > 1:  # de Casteljau
                    pts = [(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t) for a, b in zip(pts, pts[1:])]
                cur.append(pts[0])
        elif op == 'closePath' and cur:
            cur.append(cur[0])
    return [l for l in lines if len(l) > 1]


def dot(x, y, r):
    """A round dot (four cubic arcs)."""
    k = 0.5523 * r
    p = pathops.Path()
    pen = p.getPen()
    pen.moveTo((x + r, y))
    pen.curveTo((x + r, y + k), (x + k, y + r), (x, y + r))
    pen.curveTo((x - k, y + r), (x - r, y + k), (x - r, y))
    pen.curveTo((x - r, y - k), (x - k, y - r), (x, y - r))
    pen.curveTo((x + k, y - r), (x + r, y - k), (x + r, y))
    pen.closePath()
    return p


def dashed(d, matrix, width, cap, dash):
    """A dashed or dotted line: each dash stroked on its own; a dash of almost no length with round caps is a dot."""
    on, off = ([float(v) for v in re.split(r'[\s,]+', dash.strip()) if v] * 2)[:2]
    pieces = []
    for line in polylines(d, matrix):
        segs, total = [], 0
        for a, b in zip(line, line[1:]):
            n = ((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2) ** 0.5
            segs.append((a, b, total, n))
            total += n

        def at(pos):
            for a, b, start, n in segs:
                if pos <= start + n or (a, b, start, n) == segs[-1]:
                    t = 0 if n == 0 else min(1, max(0, (pos - start) / n))
                    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)

        pos = 0
        while pos <= total + 1e-6:
            if on < 0.1 and cap == 'round':
                x, y = at(pos)
                pieces.append(dot(x, y, width / 2))
            else:
                end = min(pos + on, total)
                pts = [at(pos)] + [b for a, b, start, n in segs if pos < start + n < end] + [at(end)]
                piece = pathops.Path()
                pen = piece.getPen()
                pen.moveTo(pts[0])
                for q in pts[1:]:
                    pen.lineTo(q)
                pen.endPath()
                piece.stroke(width, CAPS.get(cap, pathops.LineCap.ROUND_CAP), pathops.LineJoin.ROUND_JOIN, 4)
                piece.convertConicsToQuads(0.02)
                pieces.append(piece)
            pos += on + off
    return union(pieces)


def union(paths):
    paths = [p for p in paths if p is not None]
    if not paths:
        return pathops.Path()
    out = pathops.simplify(paths[0], fix_winding=True, keep_starting_points=False)
    for p in paths[1:]:
        out = pathops.op(out, p, pathops.PathOp.UNION, fix_winding=True, keep_starting_points=False)
    return out


def diff(a, b):
    return pathops.op(a, b, pathops.PathOp.DIFFERENCE, fix_winding=True, keep_starting_points=False)


def inter(a, b):
    return pathops.op(a, b, pathops.PathOp.INTERSECTION, fix_winding=True, keep_starting_points=False)


def empty(p):
    return p.bounds == (0, 0, 0, 0)


def depths(pieces):
    """Areas covered at least once, twice…: drawn on top of each other at 30 %, they stack like the SVG fills."""
    levels = []
    for p in pieces:
        for k in range(len(levels) - 1, -1, -1):
            both = inter(levels[k], p)
            if not empty(both):
                if k + 1 == len(levels):
                    levels.append(both)
                else:
                    levels[k + 1] = union([levels[k + 1], both])
        levels = [union([levels[0], p])] + levels[1:] if levels else [union([p])]
    return [lv for lv in levels if not empty(lv)]


def glyphs_of(svg_text):
    """Returns (outline, tint depths) as pathops paths in grid units."""
    root = ET.fromstring(svg_text)
    masks, clips = {}, {}
    for defs in root.iter(NS + 'defs'):
        for mk in defs.findall(NS + 'mask'):
            cut = []
            for el in mk.findall(NS + 'path'):
                m = tf_matrix(el.get('transform'))
                cut += [geometry(el.get('d'), m), stroked(el.get('d'), m, float(el.get('stroke-width', '0')), 'butt')]
            masks[mk.get('id')] = union(cut)
        for cp in defs.findall(NS + 'clipPath'):
            clips[cp.get('id')] = union([geometry(el.get('d'), tf_matrix(el.get('transform'))) for el in cp.findall(NS + 'path')])

    outline, tint = [], []

    def ref(v):
        return re.search(r'#([^)]+)\)', v).group(1) if v else None

    def walk(node, ctx):
        c = dict(ctx)
        for k in ('fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-dasharray', 'fill-opacity', 'fill-rule'):
            if node.get(k) is not None:
                c[k] = node.get(k)
        if node.get('transform'):
            a, b = c['matrix'], tf_matrix(node.get('transform'))
            c['matrix'] = (a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
                           a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5])
        if node.get('mask'):
            c['cuts'] = c['cuts'] + [masks[ref(node.get('mask'))]]
        if node.get('clip-path'):
            c['clips'] = c['clips'] + [clips[ref(node.get('clip-path'))]]
        tag = node.tag.replace(NS, '')
        if tag == 'path':
            pieces_o, pieces_t = [], []
            fill = c.get('fill', 'none')
            if fill not in ('none', None):
                area = geometry(node.get('d'), c['matrix'], c.get('fill-rule') == 'evenodd')
                (pieces_t if float(c.get('fill-opacity', '1')) < 1 else pieces_o).append(area)
            if c.get('stroke', 'none') not in ('none', None):
                width, cap = float(c.get('stroke-width', '3')), c.get('stroke-linecap', 'round')
                dash = node.get('stroke-dasharray') or c.get('stroke-dasharray')
                pieces_o.append(dashed(node.get('d'), c['matrix'], width, cap, dash) if dash else stroked(node.get('d'), c['matrix'], width, cap))
            for bucket, pieces in ((outline, pieces_o), (tint, pieces_t)):
                for p in pieces:
                    p = union([p])
                    for cl in c['clips']:
                        p = inter(p, cl)
                    for cut in c['cuts']:
                        p = diff(p, cut)
                    bucket.append(p)
        for child in node:
            if child.tag.replace(NS, '') in ('g', 'path'):
                walk(child, c)

    for child in root:
        if child.tag.replace(NS, '') in ('g', 'path'):
            walk(child, {'matrix': (1, 0, 0, 1, 0, 0), 'cuts': [], 'clips': [], 'fill': 'none', 'stroke': 'none'})
    return union(outline), depths(tint)


def charstring(path, width=1250):
    pen = T2CharStringPen(width, None)
    path.draw(TransformPen(pen, (SCALE, 0, 0, -SCALE, 0, BASE)))
    return pen.getCharString()


def face(shapes, depth, weight):
    """One weight as woff2: each icon's outline, then its tint depths; the code points are the same in every weight."""
    order, cmap = ['.notdef'], {}
    chars, metrics = {'.notdef': T2CharStringPen(1250, None).getCharString()}, {'.notdef': (1250, 0)}
    for i, (outline, tint) in enumerate(shapes):
        cp, name = 0xE001 + i, f"i{i + 1:03d}"
        order.append(name)
        cmap[cp] = name
        chars[name] = charstring(outline)
        metrics[name] = (1250, round(outline.bounds[0] * SCALE))
        for k in range(depth[i]):
            level = tint[k] if k < len(tint) else pathops.Path()  # a depth another weight has: empty here
            tname = f"{name}t{k + 1}"
            order.append(tname)
            cmap[cp + STRIDE * (k + 1)] = tname
            chars[tname] = charstring(level, 0)  # no advance: the depths draw at the same place
            metrics[tname] = (0, round(level.bounds[0] * SCALE))
    fb = FontBuilder(UPM, isTTF=False)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupCFF(f'StudioIcons-{weight}', {'FullName': f'Studio Icons {weight}'}, chars, {})
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=950, descent=-300)
    fb.setupNameTable({'familyName': 'Studio Icons', 'styleName': str(weight)})
    fb.setupOS2(sTypoAscender=950, sTypoDescender=-300, sTypoLineGap=0, usWinAscent=950, usWinDescent=300, usWeightClass=weight)
    fb.setupPost()
    fb.font['head'].created = fb.font['head'].modified = timestampFromString('Thu Jan  1 00:00:00 2026')  # same icons, same file
    fb.font.recalcTimestamp = False
    fb.font.flavor = 'woff2'
    buf = io.BytesIO()
    fb.font.save(buf)
    return buf.getvalue()


def main():
    spec = json.loads((SRC / 'font.json').read_text())
    icons, weights = spec['icons'], spec['weights']
    shapes = {w['weight']: [glyphs_of((SRC / w['dir'] / i['file']).read_text()) for i in icons] for w in weights}
    depth = [max(len(shapes[w['weight']][i][1]) for w in weights) for i in range(len(icons))]
    if len(icons) >= STRIDE - 1 or max(depth) > 5:
        raise ValueError(f'{len(icons)} icons, {max(depth)} tint depths: the code points would collide')
    woff2 = {w['weight']: face(shapes[w['weight']], depth, w['weight']) for w in weights}

    rules = ''
    for i, icon in enumerate(icons):
        cp = 0xE001 + i
        rules += f".app-icon-{icon['class']}::before {{\n  content: '\\{cp:x}' / '';\n}}\n"
        if depth[i]:
            codes = ''.join(f"\\{cp + STRIDE * (k + 1):x}" for k in range(depth[i]))
            rules += f".app-icon-{icon['class']}::after {{\n  content: '{codes}' / '';\n}}\n"

    def css(ws):
        faces = ''.join(
            f"@font-face {{\n  font-family: 'Studio Icons';\n  font-weight: {w['weight']};\n  font-display: block;\n"
            f"  src: url('data:font/woff2;base64,{base64.b64encode(woff2[w['weight']]).decode()}')\n    format('woff2');\n}}\n"
            for w in ws
        )
        weight_rules = ''.join(
            f".app-icon.app-icon-{w['cls']}::before,\n.app-icon.app-icon-{w['cls']}::after {{\n  font-weight: {w['weight']};\n}}\n"
            for w in ws if w['cls']
        )
        return (
            "/* Studio icons used like Font Awesome: a font drawn with the text, so they show with the page.\n"
            "   They take the colour and size of the text (fa-sm, fa-4x… work); the tinted ones add their 30 % fills on top.\n"
            "   Weights: Léger by default, app-icon-thin, -medium, -regular, -bold. */\n"
            + faces
            + ".app-icon {\n  display: inline-block;\n  position: relative;\n  width: 1.25em;\n  height: 1.25em;\n  vertical-align: -0.3em;\n  font-style: normal;\n}\n"
            ".app-icon::before,\n.app-icon::after {\n  position: absolute;\n  inset: 0;\n  font-family: 'Studio Icons', sans-serif;\n  font-style: normal;\n"
            "  font-weight: 400;\n  font-synthesis: none;\n  line-height: 1.25em;\n  white-space: nowrap;\n  text-align: left;\n  text-indent: 0;\n"
            "  letter-spacing: 0;\n  -webkit-font-smoothing: antialiased;\n}\n"
            ".app-icon::after {\n  color: color-mix(in srgb, currentColor 30%, transparent);\n}\n" + weight_rules + rules
        )

    full = css(weights)
    OUT.write_text(full)
    (SRC / 'studio-icons.css').write_text(full)
    sizes = ', '.join(f"{w['weight']}: {len(woff2[w['weight']]) / 1024:.1f} KB" for w in weights)
    print(f"{len(icons)} icons, {len(weights)} weights ({sizes}); stylesheet {len(full) / 1024:.0f} KB")


if __name__ == '__main__':
    sys.exit(main())
