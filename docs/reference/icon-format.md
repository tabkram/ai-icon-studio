# Icon format

```ts
interface IconFile {
  name?: string;   // default: the file name
  label?: string;  // shown in the catalogue
  els: Element[];  // drawn in order
}
interface Element {
  d: string;                              // SVG path, grid 48
  role: 'shape' | 'line' | 'fx';
  c: string;                              // palette key or hex colour
  dash?: string; cap?: 'butt' | 'round'; nofill?: boolean; tf?: string;
}
```

## Palette

| key | use |
| --- | --- |
| `water` `leaf` | teal, green |
| `amber` `sun` | orange, yellow |
| `blue` `violet` `coral` | blue, purple, pink |
| `glass` `paper` `steel` | neutral light tones |

Definitions are in `PAL` in `engine/render.js`; a hex colour derives its own gradient and ink. You can add keys at runtime: `import { PAL } from 'ai-icon-studio'; PAL.mine = { g: ['#fff', '#f00'], ink: '#800' }`.

## Rendering defaults

Stroke 3 at medium level for the exported SVGs; 4 for the font’s regular weight. Grid 48 × 48.
