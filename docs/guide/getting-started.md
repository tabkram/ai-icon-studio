# Getting started

Starting your own icon set? Follow [Step by step](/guide/workflow). This page covers the manual route.

Requires Node.js 18+.

```bash
npm install --save-dev ai-icon-studio
npx ai-icon-studio init        # copies six starter icons to ./icons
npx ai-icon-studio build       # renders them to ./dist
```

You get:

```text
dist/
  svg/line/*.svg
  svg/tinted/*.svg
  svg/color/*.svg
  svg/anim-reveal|pop|pulse|spin|bounce|float|shake|wobble|fade/*.svg
  manifest.json
  catalogue/index.html     # open it in a browser
```

Use an icon like any SVG:

```html
<img src="/icons/svg/color/star.svg" alt="Favourite" width="48" />
<img src="/icons/svg/anim-pulse/heart.svg" alt="Like" width="48" />
```

The line and tinted files use `currentColor`. Inside an `<img>` that is black; inline the SVG (or use it as a CSS mask) to follow the text colour.

Next: [draw your own icons](/guide/draw-icons).
