# Your icon project, step by step

You give the context, the agent asks questions and draws, the studio renders everything and generates the catalogue site.

1. **Create your project**
   ```bash
   npx ai-icon-studio new transport-icons
   cd transport-icons && npm install
   ```
2. **Open it in your AI agent** (Copilot, Claude Code…). The skill is already in the project.
3. **Give your context**, in your words: *"I work in transport. I need cars, trucks, buses, bikes…"*
4. **Answer the agent's questions**: which icons, the sizes, the style, the colours, the renders you want. It then proposes the icon list **and, for each icon, its variants** (add, remove, delete, search, close, warning…, see [badges](/guide/variants-badges)). You accept or refuse each one.
5. **Ask for options when unsure**: the agent proposes 2-4 drafts when an icon is unclear, or you ask *"give me 3 proposals"*; nothing touches your site until you choose ([Proposals](/guide/proposals)).
6. **Approve**: the agent draws one file per icon in `icons/`.
7. **Build**
   ```bash
   npm run build          # SVG: line, tinted, colour, animations + catalogue
   npm run build:font     # optional icon font (needs Python)
   ```
8. **Look**: open `dist/catalogue/index.html` (light and dark follow your system).
9. **Iterate**: *"make the truck bigger, add a tram, pulse animation on the bus"* → rebuild.
10. **Publish**: ship `dist/` (see [Publishing](/guide/publishing)); it is a plain static site.

## What you do and what the agent does

| You | The agent |
| --- | --- |
| Describe your domain | Asks the questions |
| Answer, approve the list | Draws the icons in `icons/` |
| Run `npm run build` | Fixes what you point out |
| Look at the catalogue | Adds animations, variants, font |
