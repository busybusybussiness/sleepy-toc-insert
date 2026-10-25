import { test, expect } from 'bun:test';
import { extractHeadings, buildTocLines, applyToc, START, END } from '../src/toc.js';

test('ignores frontmatter and code fences, respects level range', () => {
  const md = [
    '---', 'title: x', '## not a heading', '---',
    '# Title', '## Alpha', '```', '## inside code', '```',
    '### Beta', '#### Gamma', '##### Too deep', '## Delta',
  ].join('\n');
  expect(extractHeadings(md).map((h) => h.text)).toEqual(['Alpha', 'Beta', 'Gamma', 'Delta']);
});

test('keeps C# and strips only closing hashes', () => {
  const h = extractHeadings('## C#\n## Title ##\n');
  expect(h.map((x) => x.text)).toEqual(['C#', 'Title']);
});

test('indents relative to shallowest level and sanitises link targets', () => {
  const lines = buildTocLines([
    { level: 2, text: 'Setup' },
    { level: 3, text: 'Config [v2] | beta' },
    { level: 2, text: 'Usage' },
  ]);
  expect(lines).toEqual([
    '- [[#Setup|Setup]]',
    '  - [[#Config v2  beta|Config v2  beta]]',
    '- [[#Usage|Usage]]',
  ]);
});

test('inserts block after frontmatter on first run', () => {
  const md = '---\ntags: a\n---\n## One\ntext\n## Two\n';
  const out = applyToc(md);
  const lines = out.split('\n');
  expect(lines[0]).toBe('---');
  expect(lines[3]).toBe(START);
  expect(out).toContain('- [[#One|One]]');
  expect(out).toContain('- [[#Two|Two]]');
  expect(out.endsWith('## One\ntext\n## Two\n')).toBe(true);
});

test('update is idempotent and replaces only the marked block', () => {
  const md = '## One\n## Two\n';
  const once = applyToc(md);
  const twice = applyToc(once);
  expect(twice).toBe(once);
  const edited = once.replace('## Two', '## Two renamed').replace('## Two renamed\n', '## Two renamed\n## Three\n');
  const updated = applyToc(edited);
  expect(updated).toContain('- [[#Three|Three]]');
  expect(updated.split(START).length).toBe(2);
  expect(updated.split(END).length).toBe(2);
});

test('note with no headings gets a placeholder block', () => {
  const out = applyToc('just text\n');
  expect(out).toContain('<!-- no headings in range -->');
});
