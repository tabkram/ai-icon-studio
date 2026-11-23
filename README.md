<div align="center">

<img src="docs/public/logo.svg" alt="AI Icon Studio" width="84" height="84" />

# AI Icon Studio

**A generic icon generator. Describe an icon, get every version of it.**

Line (black and white), tinted, colour and animated SVG, an icon font and a catalogue, from one drawing in code.

[Manual](docs/manual.md) · [Documentation](docs/index.md) · [Examples](docs/examples.md) · [CLI](docs/reference/cli.md)

</div>

---

AI Icon Studio ships no icon set: the studio is the engine, the icons are yours. Ask for one icon, a whole system, only the black-and-white version, or every animation.

## Step by step

1. **Create your project**
   ```bash
   npx ai-icon-studio new transport-icons
   cd transport-icons && npm install
   ```
2. **Open it in your AI agent** (Copilot, Claude Code…). The skill is already in the project.
3. **Give your context**, in your words: *"I work in transport. I need cars, trucks, buses, bikes…"*
4. **Answer the agent's questions**: which icons, the sizes, the style, the colours, the renders you want. It then proposes the icon list **and, for each icon, its variants** (add, remove, delete, search, close, warning…). You accept or refuse each one.
5. **Approve**: the agent draws one file per icon in `icons/`.
6. **Build**
   ```bash
   npm run build          # SVG: line, tinted, colour, animations + catalogue
   npm run build:font     # optional icon font (needs Python)
   ```
7. **Look**: open `dist/catalogue/index.html` (light and dark follow your system).
8. **Iterate**: *"make the truck bigger, add a tram, pulse animation on the bus"* → rebuild.
9. **Publish**: ship `dist/` (see [Publishing](docs/guide/publishing.md)); it is a plain static site.

## Manual install

```bash
npm install --save-dev ai-icon-studio     # Node.js 18+
npx ai-icon-studio init                   # starter icons in ./icons
npx ai-icon-studio build                  # render to ./dist
```

## Define an icon

One file per icon in `icons/`: JSON, or `.mjs` to draw with helpers. Paths on a 48 × 48 grid; each element has a role (`shape`, `line`, `fx`) and a colour (palette key or any hex).

```js
// icons/star.mjs
import { star } from 'ai-icon-studio';

export default {
  name: 'star',
  els: [{ d: star(24, 25, 19, 8.5), role: 'shape', c: 'amber' }]
};
```

Helpers: `circle`, `rect`, `ngon`, `star`, `polygon`, `line`, `arc`, `sparkle`, `hexagon`, `dot`, `capsule`.

## Proposals

Unsure about an icon, the agent offers 2-4 options; or you ask *"give me 3 proposals"*. Options go to `drafts/` and render apart (`npm run drafts`); your site is updated only when you choose. See `docs/guide/proposals.md`.

## Variants

Add `"variants": ["plus", "trash", "search"]` (or `"all"`) to an icon and the studio generates `name-plus`, `name-trash`… with a badge, in every render. Badges: plus, minus, cross, check, trash, search, edit, warning, lock, info. See `docs/guide/variants-badges.md`.

## What you get

| Output | Content |
| --- | --- |
| `dist/svg/line` | black and white, `currentColor` |
| `dist/svg/tinted` | outline + 30 % fill |
| `dist/svg/color` | full colour |
| `dist/svg/anim-<preset>` | `reveal` `pop` `pulse` `spin` `bounce` `float` `shake` `wobble` `fade` |
| `dist/manifest.json` | icons and files |
| `dist/catalogue/index.html` | every variant on one page |
| `dist/font` | with `--font`: icon font, 5 weights |

```bash
npx ai-icon-studio build --anims pop,pulse   # only some animations
npx ai-icon-studio build --only '^(star|heart)$'
npx ai-icon-studio build --out public/icons
```

## Icon font (optional)

Needs Python:

```bash
python3 -m venv .venv && .venv/bin/pip install fonttools skia-pathops brotli
ICONS_PYTHON=.venv/bin/python npx ai-icon-studio build --font
```

```html
<i class="app-icon app-icon-star"></i> <i class="app-icon app-icon-star-tinted app-icon-bold"></i>
```

## With an AI agent

The skill in `.claude/skills/ai-icon-studio` (mirrored in `.agents/skills`) lets an agent draw icons, run the build and hand back the renders. Ask for “a calendar icon: line, tinted, colour and a pulse animation”.

## Documentation site

```bash
npm install && npm --prefix docs install
npm run docs:dev        # live site with real renders
npm run docs:build      # static site in docs/.vitepress/dist
```

## Layout

```text
bin/ai-icon-studio.mjs   CLI
engine/                  render.js (renderer + helpers), build.mjs, font tools
examples/icons/          starter icons
docs/                    VitePress site
.claude/skills/          agent skill
```

## License

MIT
