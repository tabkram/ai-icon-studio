---
layout: home

hero:
  name: AI Icon Studio
  text: A generic icon generator.<br>Describe it, get every version.
  tagline: Line, tinted, colour and animated SVG, an icon font and a catalogue, from one drawing in code.
  image:
    src: /logo.svg
    alt: AI Icon Studio
  actions:
    - theme: brand
      text: Step by step
      link: /guide/workflow
    - theme: alt
      text: Manual
      link: /manual
    - theme: alt
      text: See examples
      link: /examples
    - theme: alt
      text: GitHub
      link: https://github.com/tabkram/ai-icon-studio

features:
  - icon: ✏️
    title: Your icons, from scratch
    details: A few SVG paths, a role and a colour each. Helpers for circles, stars, polygons and rounded rectangles.
  - icon: 🎨
    title: Every variant
    details: Black and white (currentColor), tinted, full colour, from the same drawing. Any hex colour works.
  - icon: ✨
    title: Animations
    details: Nine self-contained SVG animations that work inside an img tag and respect reduced motion.
  - icon: 🔤
    title: Font and catalogue
    details: An optional icon font in five weights, and a catalogue page of everything you drew.
  - icon: 🤖
    title: Made for AI agents
    details: Ask an agent for an icon or a whole system, and get every render back.
  - icon: 📦
    title: A package
    details: A CLI, a JS API and a plain folder of icons. Nothing to configure.
---

## One file in, everything out

```js
// icons/star.mjs
import { star } from 'ai-icon-studio';

export default { name: 'star', els: [{ d: star(24, 25, 19, 8.5), role: 'shape', c: 'amber' }] };
```

```bash
npx ai-icon-studio build
```

| line | tinted | colour | pop | pulse | spin | wobble |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ![](/gallery/svg/line/star.svg) | ![](/gallery/svg/tinted/star.svg) | ![](/gallery/svg/color/star.svg) | ![](/gallery/svg/anim-pop/star.svg) | ![](/gallery/svg/anim-pulse/star.svg) | ![](/gallery/svg/anim-spin/star.svg) | ![](/gallery/svg/anim-wobble/star.svg) |
