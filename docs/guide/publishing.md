# Publishing

The package ships `bin/`, `engine/`, `examples/` and the README (see `files` in `package.json`).

```bash
npm pack --dry-run   # check the content
npm publish
```

Documentation:

```bash
npm install && npm --prefix docs install
npm run docs:dev      # renders the gallery, then serves the site
npm run docs:build    # static site in docs/.vitepress/dist
```

Deploy `docs/.vitepress/dist` to GitHub Pages; `base` is `/ai-icon-studio/` in `docs/.vitepress/config.mts`.
