# Icon font

Build your icons as a web font, in five weights, each icon in line and tinted. It needs Python with `fonttools`:

```bash
python3 -m venv .venv && .venv/bin/pip install fonttools skia-pathops brotli
ICONS_PYTHON=.venv/bin/python npx ai-icon-studio build --font
```

Outputs `dist/font/` (woff2 per weight, `studio-icons.css`) and `dist/icons.scss`.

## Classes

```html
<i class="app-icon app-icon-star"></i>
<i class="app-icon app-icon-star-tinted app-icon-bold"></i>
```

The class is `app-icon-` plus the icon name. Weights: `app-icon-thin`, default, `-medium`, `-regular`, `-bold`. The icon follows the text colour and size.

## Check

Compare every glyph with its SVG (needs Chrome):

```bash
ICONS_DIST=dist .venv/bin/python engine/check-font.py '^(star|heart)'
```

A small difference (under about 7 %) is anti-aliasing; a large one means a missing or shifted part.
