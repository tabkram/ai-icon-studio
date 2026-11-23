# Proposals

You do not have to accept the first drawing. Options are drawn **before** the site is updated.

## Two ways to get options

| Who decides | When |
| --- | --- |
| **The agent** | an icon is unclear or ambiguous (several valid readings), so it offers 2 to 4 options instead of guessing |
| **You** | you think it will not find it on the first try: *"give me 3 proposals for the tow truck"* (or 5, or several) |

## How it works

1. The options are written as drafts: `drafts/tow-truck-a.mjs`, `-b`, `-c`.
2. Render them apart from your real site:
   ```bash
   npm run drafts            # → dist-drafts/catalogue/index.html
   ```
3. You choose (*"B"*), or ask for another round (*"B but with a hook"*).
4. The agent moves the chosen file to `icons/`, deletes the other drafts and rebuilds `dist/`.

`dist/` (your site) is only updated at step 4.

## Without the scaffold

```bash
npx ai-icon-studio build --icons drafts --out dist-drafts
```
