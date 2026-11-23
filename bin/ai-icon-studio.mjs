#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..');
const [cmd = 'help', ...rest] = process.argv.slice(2);

const HELP = `ai-icon-studio <command>

  new <name>        scaffold a project (icons/, skill, scripts) for your own icon set, e.g. transport-icons
  init [dir]        copy starter icons into ./icons (or dir)
  build [options]   render every icon of ./icons as line, tinted, colour and animated SVG
      --icons <dir>   icons folder (default ./icons)
      --out <dir>     output folder (default ./dist)
      --anims <list>  reveal,pop,pulse,spin,bounce,float,shake,wobble,fade | none (default all)
      --only <regex>  only the icons whose name matches
      --font          also build the icon font (needs Python, see README)
`;

if (cmd === 'new') {
  const name = rest[0];
  if (!name) {
    console.error('Usage: ai-icon-studio new <name>');
    process.exit(1);
  }
  const dir = resolve(name);
  if (existsSync(dir)) {
    console.error(`${dir} already exists`);
    process.exit(1);
  }
  mkdirSync(join(dir, 'icons'), { recursive: true });
  mkdirSync(join(dir, 'drafts'), { recursive: true });
  const version = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8')).version;
  const local = `file:${pkg}`;
  const dep = process.env.AI_ICON_STUDIO_DEP || (existsSync(join(pkg, '.git')) ? local : `^${version}`);
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify(
      { name, version: '0.1.0', private: true, scripts: { build: 'ai-icon-studio build', drafts: 'ai-icon-studio build --icons drafts --out dist-drafts', 'build:font': 'ai-icon-studio build --font' }, devDependencies: { 'ai-icon-studio': dep } },
      null,
      2
    ) + '\n'
  );
  writeFileSync(join(dir, '.gitignore'), 'node_modules\ndist\ndist-drafts\n.venv\n');
  for (const root of ['.claude', '.agents']) {
    cpSync(join(pkg, '.claude', 'skills', 'ai-icon-studio'), join(dir, root, 'skills', 'ai-icon-studio'), { recursive: true });
  }
  writeFileSync(
    join(dir, 'README.md'),
    `# ${name}\n\nIcon set generated with [AI Icon Studio](https://github.com/tabkram/ai-icon-studio).\n\n1. \`npm install\`\n2. Ask your AI agent (it has the ai-icon-studio skill): "I work in <your domain>. Here is the context: ... Ask me questions, then draw the icons."\n3. \`npm run build\`, then open \`dist/catalogue/index.html\`.\n4. Ask for changes, rebuild, repeat.\n`
  );
  console.log(`Created ${dir}\n  cd ${name} && npm install\nThen open it in your AI agent and describe your context.`);
} else if (cmd === 'init') {
  const dir = resolve(rest[0] || 'icons');
  if (existsSync(dir)) {
    console.error(`${dir} already exists`);
    process.exit(1);
  }
  cpSync(join(pkg, 'examples', 'icons'), dir, { recursive: true });
  console.log(`Created ${dir}. Run: ai-icon-studio build`);
} else if (cmd === 'build') {
  const r = spawnSync(process.execPath, [join(pkg, 'engine', 'build.mjs'), ...rest], { stdio: 'inherit' });
  process.exit(r.status ?? 1);
} else {
  console.log(HELP);
  process.exit(cmd === 'help' || cmd === '--help' ? 0 : 1);
}
