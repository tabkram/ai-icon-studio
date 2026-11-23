# Draw your own icons

An icon is a file in `icons/`: `name.json`, or `name.mjs` exporting a default object. Use `.mjs` to draw with helpers.

```js
import { circle, line } from 'ai-icon-studio';

export default {
  name: 'search',
  label: 'Search',
  els: [
    { d: circle(20, 20, 13), role: 'shape', c: 'glass' },
    { d: line(30, 30, 42, 42), role: 'line', c: 'steel' }
  ]
};
```

The same icon in JSON, with raw path data:

```json
{ "name": "heart", "els": [{ "d": "M24 41C8 29 6 18 12 12c5-4 10-2 12 3 2-5 7-7 12-3 6 6 4 17-12 29Z", "role": "shape", "c": "coral" }] }
```

## Elements

| field | meaning |
| --- | --- |
| `d` | path data on the 48 × 48 grid |
| `role` | `shape` (closed, filled in colour, tinted in the tinted variant), `line` (outline only), `fx` (small filled decoration) |
| `c` | a palette key (`water`, `leaf`, `amber`, `blue`, `violet`, `glass`, `paper`, `sun`, `coral`, `steel`) **or any hex colour** such as `#e11d48` |

Optional: `dash`, `cap` (`butt`, `round`), `nofill`, `tf` (a transform).

## Helpers

`circle`, `rect(x, y, w, h, r)`, `ngon(cx, cy, r, sides)`, `star(cx, cy, r, ri, points)`, `polygon(points)`, `line`, `arc`, `sparkle`, `hexagon`, `dot`, `capsule`, `polar`. All return path data.

## Rules of thumb

- Keep strokes inside 1 … 47 so the outline never clips.
- Elements are drawn in order: the last one is on top.
- A dot is `dot(x, y)`: a zero-length round line.
- Check the result at 16 and 20 px; if details clog, simplify.

## One drawing, several versions

Shapes and lines are separate roles, so you never draw the tinted or colour version: the build derives them.

| line | tinted | colour |
| :-: | :-: | :-: |
| ![](/gallery/svg/line/search.svg) | ![](/gallery/svg/tinted/search.svg) | ![](/gallery/svg/color/search.svg) |
