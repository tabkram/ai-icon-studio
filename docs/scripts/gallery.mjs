// Renders the example icons into docs/public/gallery so the pages show real output.
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const out = join(root, 'docs/public/gallery');
rmSync(out, { recursive: true, force: true });
const r = spawnSync(process.execPath, [join(root, 'bin/ai-icon-studio.mjs'), 'build', '--icons', join(root, 'examples/icons'), '--out', out], { stdio: 'inherit' });
process.exit(r.status ?? 1);
