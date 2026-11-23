---
name: ai-icon-studio
description: Create icons or whole icon systems with the generic ai-icon-studio generator and render each as line (black and white), tinted, colour and animated SVG, plus an optional icon font and catalogue. Use when the user asks for an icon, a set of icons, variants, a specific render (B&W, tinted, colour, animations) or to fix an icon.
---

# AI Icon Studio

A generic generator: it ships no icon set. Each icon is a file in `icons/` (`name.json` or `name.mjs`), drawn once and rendered by `ai-icon-studio build` as `line` (currentColor, B&W), `tinted` (30 % fill), `color`, and animations (`anim-reveal`, `pop`, `pulse`, `spin`, `bounce`, `float`, `shake`, `wobble`, `fade`). Output: `dist/svg/<kind>/`, `dist/manifest.json`, `dist/catalogue/index.html`, and with `--font` `dist/font` + `dist/icons.scss`. Explicit user instructions take precedence.

## Method
1. **Interview first**: when the user gives a domain context (e.g. "I work in transport, I need cars…"), do not draw yet. Ask short questions, one at a time with choices: which icons (list), where they are used (UI size), style (outline weight, rounded/sharp), colours (palette or hex), which renders (B&W, tinted, colour, animations), font needed. Then propose the icon list, and **for each icon propose the variants** (badges: plus/add, minus/remove, cross/close, check/validated, trash/delete, search, edit, warning, lock, info; plus domain-specific ones you suggest). List them, with a recommendation per icon, and let the user accept or refuse each. Wait for approval before drawing.
2. **Draw** several options as `icons/<name>.mjs` (helpers: `circle rect ngon star polygon line arc sparkle hexagon dot capsule` from `ai-icon-studio`) or `.json`: `{ name, label, variants: ['plus','trash',…] | 'all', els: [{ d, role: shape|line|fx, c }] }`; each accepted variant becomes `<name>-<badge>` automatically (base icon shrunk, badge bottom-right; list in `engine/badges.js`). `c` is a palette key (`water leaf amber blue violet glass paper sun coral steel`) or any hex. Grid 48, strokes inside 1..47, elements drawn in order. Format: `docs/reference/icon-format.md`.
3. **Render**: `npx ai-icon-studio build [--only '<regex>'] [--anims pop,spin|none] [--font]` (repo: `npm run build`). Open `dist/catalogue/index.html` or view the SVGs; check at 16/20 px; fix what touches or clogs.
4. **Deliver what was asked**: B&W → `dist/svg/line`, tinted → `tinted`, colour → `color`, animations → `anim-*`; report the paths.
5. **Font** (`--font`, needs Python with fonttools, see README): check with `npm run check:font -- '^(name1|name2)'`.

## Proposals (options before the site is updated)
- **You decide to propose**: when an icon is unclear, ambiguous or has several valid readings, do not guess: draw 2-4 options and ask which one.
- **The user asks for options**: if they say "give me 3 proposals" (or x, or several) for an icon, do it, whatever your confidence.
- Write options as drafts, never in `icons/`: `drafts/<name>-a.mjs`, `-b`, `-c`. Render them with `npx ai-icon-studio build --icons drafts --out dist-drafts` (`npm run drafts` in a generated project) and show `dist-drafts/catalogue/index.html` or the SVGs. The real site (`dist/`) is untouched.
- Once the user picks, move the chosen file to `icons/<name>.mjs` (rename, fix `name`), delete the other drafts, rebuild `dist/`. If none fits, redraw a new round.

## Rules
- Fix a drawing in its file; keep its `name` stable (it is the file name and the font class).
- Add animation presets in `PRESETS` of `engine/build.mjs`; respect `prefers-reduced-motion`.
- Never publish or commit without the user's word.
