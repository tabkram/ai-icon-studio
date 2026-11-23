# User manual

Everything you do with AI Icon Studio, in the order you do it.

## 1. Before you start

| You need | For |
| --- | --- |
| Node.js 18+ | everything |
| An AI agent (Copilot, Claude Code…) | to describe icons in plain words (optional: you can write the files yourself) |
| Python 3 | only the icon font (optional) |

## 2. Create your icon project

```bash
npx ai-icon-studio new transport-icons
cd transport-icons
npm install
```

You get `icons/` (empty), the agent skill (`.claude`, `.agents`), a `package.json` with `build` and `build:font`, and a README.

## 3. Describe what you need

Open the folder in your agent and say it in your words, for example: *"I work in transport. I need cars, trucks, buses, bikes and trams."*

The agent then:

1. asks short questions: icon list, sizes, style, colours, renders, font;
2. proposes the icons **and their variants** (add, remove, delete, search, close, warning…): you accept or refuse each one;
3. draws one file per icon in `icons/`.

If an icon is unclear, it offers 2-4 options first; you can also ask *"give me 3 proposals"* yourself. Options live in `drafts/` and render apart with `npm run drafts`; your site only changes when you choose. See [Proposals](/guide/proposals).

## 4. Build

```bash
npm run build          # SVG + catalogue
npm run build:font     # same, plus the icon font
```

| Output | Content |
| --- | --- |
| `dist/svg/line` | black and white, follows light/dark |
| `dist/svg/tinted` | outline + 30 % fill, follows light/dark |
| `dist/svg/color` | full colour |
| `dist/svg/anim-*` | animated (reveal, pop, pulse, spin, bounce, float, shake, wobble, fade) |
| `dist/catalogue/index.html` | the site: every icon, every variant |
| `dist/manifest.json` | machine-readable list |
| `dist/font/` | with `--font` |

Useful options: `--only '^car'` (some icons), `--anims pop,pulse` or `none`, `--out public/icons`.

## 5. Review and iterate

Open `dist/catalogue/index.html`. Ask for changes in plain words (*"bigger wheels", "add a tram", "pulse on the bus"*) and rebuild. Check the small sizes (16–20 px).

## 6. Use the icons

```html
<img src="/icons/svg/color/car.svg" alt="Car" width="32">
<img src="/icons/svg/line/car-trash.svg" alt="Delete car" width="24">
<img src="/icons/svg/anim-pulse/bus.svg" alt="Bus" width="48">
<i class="app-icon app-icon-car"></i>   <!-- with the font -->
```

Line and tinted icons switch between light and dark by themselves.

## 7. Write an icon by hand

```js
// icons/car.mjs
import { rect, circle } from 'ai-icon-studio';

export default {
  name: 'car',
  label: 'Car',
  variants: ['plus', 'trash', 'search'],
  els: [
    { d: rect(5, 18, 38, 14, 5), role: 'shape', c: 'blue' },
    { d: circle(14, 33, 4), role: 'shape', c: 'steel' },
    { d: circle(34, 33, 4), role: 'shape', c: 'steel' }
  ]
};
```

See [Draw your own icons](/guide/draw-icons), [Icon format](/reference/icon-format) and [Badges](/guide/variants-badges).

## 8. Publish

Ship `dist/` as a static site (GitHub Pages, any host) and/or the SVG folders. See [Publishing](/guide/publishing).

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Unknown badge` | use a name from the [badge list](/guide/variants-badges) |
| Icon touches the edge | keep strokes inside 1 … 47 on the 48 grid |
| Details clog at 16 px | simplify the drawing |
| Font build fails | install `fonttools skia-pathops brotli` and set `ICONS_PYTHON` |
| Line icon stays black in dark mode | the SVG is used inline without the theme; use it in an `<img>` or a CSS mask |
