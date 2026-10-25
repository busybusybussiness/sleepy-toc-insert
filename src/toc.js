// Pure markdown logic for the TOC plugin (no Obsidian imports, so it is testable under Bun).
export const START = '<!-- toc:start -->';
export const END = '<!-- toc:end -->';

const FENCE = /^\s*(`{3,}|~{3,})/;
const HEADING = /^(#{1,6})\s+(.*?)(?:\s+#+)?\s*$/;

// Returns the index of the first line after a YAML frontmatter block, or 0 if none.
function bodyStart(lines) {
  if (lines[0] !== '---') return 0;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') return i + 1;
  }
  return 0;
}

// Headings outside fenced code blocks and frontmatter, filtered to [minLevel, maxLevel].
export function extractHeadings(markdown, { minLevel = 2, maxLevel = 4 } = {}) {
  const lines = markdown.split('\n');
  const out = [];
  let fence = null;
  for (let i = bodyStart(lines); i < lines.length; i++) {
    const line = lines[i];
    const f = line.match(FENCE);
    if (f) {
      const marker = f[1];
      if (!fence) {
        fence = { ch: marker[0], len: marker.length };
      } else if (marker[0] === fence.ch && marker.length >= fence.len && line.trim() === marker) {
        fence = null;
      }
      continue;
    }
    if (fence) continue;
    const h = line.match(HEADING);
    if (!h) continue;
    const level = h[1].length;
    const text = h[2].trim();
    if (!text || level < minLevel || level > maxLevel) continue;
    out.push({ level, text });
  }
  return out;
}

// One Obsidian heading link per entry, indented relative to the shallowest level shown.
export function buildTocLines(headings) {
  if (headings.length === 0) return [];
  const base = Math.min(...headings.map((h) => h.level));
  return headings.map((h) => {
    const indent = '  '.repeat(h.level - base);
    const target = h.text.replace(/[\[\]|#^]/g, '').trim();
    const display = h.text.replace(/[\[\]|]/g, '').trim();
    return `${indent}- [[#${target}|${display}]]`;
  });
}

// Inserts the TOC block after frontmatter, or replaces the existing block in place.
// Idempotent: applyToc(applyToc(x)) === applyToc(x).
export function applyToc(markdown, opts = {}) {
  const headings = extractHeadings(markdown, opts);
  const body = buildTocLines(headings);
  const block = [START, ...(body.length ? body : ['<!-- no headings in range -->']), END];

  const lines = markdown.split('\n');
  const s = lines.indexOf(START);
  if (s !== -1) {
    const e = lines.indexOf(END, s + 1);
    if (e !== -1) {
      return [...lines.slice(0, s), ...block, ...lines.slice(e + 1)].join('\n');
    }
  }
  const at = bodyStart(lines);
  return [...lines.slice(0, at), ...block, '', ...lines.slice(at)].join('\n');
}
