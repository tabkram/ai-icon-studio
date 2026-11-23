# Examples

All of these come from `examples/icons/`.

## Star, drawn with a helper

```js
import { star } from 'ai-icon-studio';

export default { name: 'star', els: [{ d: star(24, 25, 19, 8.5), role: 'shape', c: 'amber' }] };
```

| line | tinted | colour | reveal | pulse |
| :-: | :-: | :-: | :-: | :-: |
| ![](/gallery/svg/line/star.svg) | ![](/gallery/svg/tinted/star.svg) | ![](/gallery/svg/color/star.svg) | ![](/gallery/svg/anim-reveal/star.svg) | ![](/gallery/svg/anim-pulse/star.svg) |

## Heart, drawn with raw path data

```json
{ "name": "heart", "els": [{ "d": "M24 41C8 29 6 18 12 12c5-4 10-2 12 3 2-5 7-7 12-3 6 6 4 17-12 29Z", "role": "shape", "c": "coral" }] }
```

## Any hex colour

```js
{ d: ngon(24, 24, 18, 6), role: 'shape', c: '#8b5cf6' }
```

## The set

| icon | line | tinted | colour | animation |
| --- | :-: | :-: | :-: | :-: |
| heart | ![](/gallery/svg/line/heart.svg) | ![](/gallery/svg/tinted/heart.svg) | ![](/gallery/svg/color/heart.svg) | ![](/gallery/svg/anim-pulse/heart.svg) |
| check | ![](/gallery/svg/line/check.svg) | ![](/gallery/svg/tinted/check.svg) | ![](/gallery/svg/color/check.svg) | ![](/gallery/svg/anim-pop/check.svg) |
| search | ![](/gallery/svg/line/search.svg) | ![](/gallery/svg/tinted/search.svg) | ![](/gallery/svg/color/search.svg) | ![](/gallery/svg/anim-wobble/search.svg) |
| home | ![](/gallery/svg/line/home.svg) | ![](/gallery/svg/tinted/home.svg) | ![](/gallery/svg/color/home.svg) | ![](/gallery/svg/anim-float/home.svg) |
| bolt | ![](/gallery/svg/line/bolt.svg) | ![](/gallery/svg/tinted/bolt.svg) | ![](/gallery/svg/color/bolt.svg) | ![](/gallery/svg/anim-bounce/bolt.svg) |

Browse everything in the [generated catalogue](/gallery/catalogue/index.html).
