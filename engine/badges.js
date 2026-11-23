// Generic modifiers: a small badge in the bottom-right corner of any icon (add, remove, delete, search…).
const C = [36, 36, 10];
const ring = `M${C[0] - C[2]} ${C[1]}a${C[2]} ${C[2]} 0 1 0 ${2 * C[2]} 0a${C[2]} ${C[2]} 0 1 0 ${-2 * C[2]} 0Z`;
const glyph = (d) => ({ d, role: 'line', c: 'paper' });

const BADGES = {
  plus: { label: 'add', c: 'leaf', d: 'M36 31V41M31 36H41' },
  minus: { label: 'remove', c: 'amber', d: 'M31 36H41' },
  cross: { label: 'close', c: 'coral', d: 'M32.5 32.5L39.5 39.5M39.5 32.5L32.5 39.5' },
  check: { label: 'validated', c: 'leaf', d: 'M31.5 36.5L34.5 39.5L40.5 32.5' },
  trash: { label: 'delete', c: 'coral', d: 'M32 33H40M34.5 33V31.5H37.5V33M33 33V41H39V33M35 35.5V38.5M37 35.5V38.5' },
  search: { label: 'search', c: 'blue', d: 'M35 31a4 4 0 1 0 0.01 0M38 34L41 37' },
  edit: { label: 'edit', c: 'violet', d: 'M40.5 31.5L41.5 32.5L35 39L32 40L33 37Z' },
  warning: { label: 'warning', c: 'amber', d: 'M36 31.5V37M36 40v.01' },
  lock: { label: 'locked', c: 'steel', d: 'M33 36H39V41H33ZM34.5 36V34.5a1.5 1.5 0 0 1 3 0V36' },
  info: { label: 'info', c: 'blue', d: 'M36 36V41M36 31.5v.01' }
};

/** Layers of an icon definition with a badge on it. */
function withBadge(els, badge) {
  const b = BADGES[badge];
  if (!b) throw new Error(`Unknown badge "${badge}". Available: ${Object.keys(BADGES).join(', ')}`);
  return [
    { els, tf: 'translate(1.5 1.5) scale(.78)' },
    { els: [{ d: ring, role: 'shape', c: b.c }, glyph(b.d)], cut: [ring] }
  ];
}

module.exports = { BADGES, withBadge };
