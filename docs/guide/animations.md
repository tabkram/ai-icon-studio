# Animations

Each icon is also written once per preset in `svg/anim-<preset>/`. The CSS is embedded in the SVG, so it runs inside an `<img>` tag, and `prefers-reduced-motion` turns it off.

| preset | effect | heart | star |
| --- | --- | :-: | :-: |
| `reveal` | outline is drawn, then colour rises | ![](/gallery/svg/anim-reveal/heart.svg) | ![](/gallery/svg/anim-reveal/star.svg) |
| `pop` | scales in once | ![](/gallery/svg/anim-pop/heart.svg) | ![](/gallery/svg/anim-pop/star.svg) |
| `pulse` | breathes | ![](/gallery/svg/anim-pulse/heart.svg) | ![](/gallery/svg/anim-pulse/star.svg) |
| `spin` | turns | ![](/gallery/svg/anim-spin/heart.svg) | ![](/gallery/svg/anim-spin/star.svg) |
| `bounce` | jumps and squashes | ![](/gallery/svg/anim-bounce/heart.svg) | ![](/gallery/svg/anim-bounce/star.svg) |
| `float` | hovers | ![](/gallery/svg/anim-float/heart.svg) | ![](/gallery/svg/anim-float/star.svg) |
| `shake` | quick rattle | ![](/gallery/svg/anim-shake/heart.svg) | ![](/gallery/svg/anim-shake/star.svg) |
| `wobble` | swings | ![](/gallery/svg/anim-wobble/heart.svg) | ![](/gallery/svg/anim-wobble/star.svg) |
| `fade` | blinks | ![](/gallery/svg/anim-fade/heart.svg) | ![](/gallery/svg/anim-fade/star.svg) |

Only some presets:

```bash
npx ai-icon-studio build --anims pop,pulse
npx ai-icon-studio build --anims none
```

## Add a preset

Presets live in `PRESETS` in `engine/build.mjs`: CSS applied to a `.a` group that wraps the whole icon.

```js
tilt: `.a{${BOX}animation:p-tilt 1s ease-in-out infinite}@keyframes p-tilt{50%{transform:rotate(12deg)}}`
```

Nothing else to edit: the list, the folders and the catalogue follow.
