# Icon variants (badges)

Most icon systems need the same icon with a modifier: *car*, *car + add*, *car + delete*, *car + search*. You do not draw them: list them in the icon and the studio composes them.

```json
{ "name": "car", "variants": ["plus", "minus", "trash", "search", "cross"], "els": [] }
```

`"variants": "all"` generates every badge. Each one becomes its own icon, `car-plus`, `car-trash`…, in every render (line, tinted, colour, animations, font).

| badge | meaning | badge | meaning |
| --- | --- | --- | --- |
| `plus` | add | `trash` | delete |
| `minus` | remove | `search` | search |
| `cross` | close | `edit` | edit |
| `check` | validated | `warning` | warning |
| `lock` | locked | `info` | information |

| base | plus | minus | trash | search | cross | check |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| ![](/gallery/svg/color/bolt.svg) | ![](/gallery/svg/color/bolt-plus.svg) | ![](/gallery/svg/color/bolt-minus.svg) | ![](/gallery/svg/color/bolt-trash.svg) | ![](/gallery/svg/color/bolt-search.svg) | ![](/gallery/svg/color/bolt-cross.svg) | ![](/gallery/svg/color/bolt-check.svg) |

## With the AI agent

You do not need to know the list. After your context, the agent proposes, for each icon, the variants that make sense in your domain (for a transport app: *car + add*, *car + trash*, *car + search*, *car + warning*…). You accept or refuse each one, then it draws.

## In code

```js
import { BADGES, withBadge } from 'ai-icon-studio';
```

`withBadge(els, 'plus')` returns the layers of the icon with its badge; the base is shrunk to 78 % and a gap is cut around the badge.
