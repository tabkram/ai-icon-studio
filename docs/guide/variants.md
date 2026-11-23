# Render variants

`ai-icon-studio build` always writes the three static variants.

| folder | content | colour |
| --- | --- | --- |
| `svg/line` | outlines only | `currentColor` |
| `svg/tinted` | outlines + 30 % fill | `currentColor` |
| `svg/color` | gradient fill + ink outline | palette or hex |

## Examples

| | line | tinted | colour |
| --- | :-: | :-: | :-: |
| heart | ![](/gallery/svg/line/heart.svg) | ![](/gallery/svg/tinted/heart.svg) | ![](/gallery/svg/color/heart.svg) |
| check | ![](/gallery/svg/line/check.svg) | ![](/gallery/svg/tinted/check.svg) | ![](/gallery/svg/color/check.svg) |
| bolt | ![](/gallery/svg/line/bolt.svg) | ![](/gallery/svg/tinted/bolt.svg) | ![](/gallery/svg/color/bolt.svg) |

## Following the text colour

Line and tinted files follow the OS light/dark scheme when used in an `<img>`, and inherit the page text colour when inlined. To follow a site theme toggle instead, use a CSS mask:

```css
.icon {
  width: 1.5em; height: 1.5em;
  background: currentColor;
  mask: url(/icons/svg/line/heart.svg) center / contain no-repeat;
}
```
