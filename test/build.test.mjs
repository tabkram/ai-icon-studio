import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { circle, BADGES, withBadge } from '../engine/index.mjs';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const cli = join(root, 'bin', 'ai-icon-studio.mjs');
const examples = join(root, 'examples', 'icons');

test('build renders every variant and the catalogue', () => {
  const out = mkdtempSync(join(tmpdir(), 'ais-'));
  const r = spawnSync(process.execPath, [cli, 'build', '--icons', examples, '--out', out, '--anims', 'pop'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  for (const k of ['line', 'tinted', 'color', 'anim-pop']) assert.ok(existsSync(join(out, 'svg', k, 'star.svg')), k);
  assert.ok(existsSync(join(out, 'catalogue', 'index.html')));
  assert.match(readFileSync(join(out, 'svg', 'line', 'star.svg'), 'utf8'), /prefers-color-scheme:dark/);
});

test('badge variants become their own icons', () => {
  const out = mkdtempSync(join(tmpdir(), 'ais-'));
  spawnSync(process.execPath, [cli, 'build', '--icons', examples, '--out', out, '--anims', 'none']);
  assert.ok(readdirSync(join(out, 'svg', 'color')).includes('bolt-trash.svg'));
});

test('helpers and badges', () => {
  assert.match(circle(24, 24, 10), /^M/);
  assert.equal(withBadge([], 'plus').length, 2);
  assert.throws(() => withBadge([], 'nope'), /Unknown badge/);
  assert.ok(Object.keys(BADGES).length >= 10);
});

test('new scaffolds a project', () => {
  const dir = join(mkdtempSync(join(tmpdir(), 'ais-')), 'demo-icons');
  const r = spawnSync(process.execPath, [cli, 'new', dir], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  for (const f of ['icons', 'drafts', 'package.json', '.claude/skills/ai-icon-studio/SKILL.md']) assert.ok(existsSync(join(dir, f)), f);
});
