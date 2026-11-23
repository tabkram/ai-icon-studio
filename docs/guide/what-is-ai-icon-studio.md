# What is AI Icon Studio?

A generic icon generator. You describe an icon (SVG paths, a role and a colour per path) and it produces every file a product needs:

- **line**: outline in `currentColor`, for the interface; follows the text colour.
- **tinted**: the same outline with a 30 % fill.
- **colour**: gradients and an ink outline, for large sizes.
- **animations**: the colour version moving (`pop`, `pulse`, `spin`…) or drawn then revealed (`reveal`).
- **font** *(optional)*: your line and tinted icons as a web font in five weights.
- **catalogue**: a page showing every icon in every variant.

It ships no icon set: the studio is the engine, the icons are yours. Everything is drawn on a 48 × 48 grid with a 4 px stroke, so icons of one set look like a family.

The generator is plain Node.js; only the optional font needs Python.
