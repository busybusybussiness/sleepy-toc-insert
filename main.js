var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toCommonJS = (from) => {
  var entry = (__moduleCache ??= new WeakMap).get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function") {
    for (var key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(entry, key))
        __defProp(entry, key, {
          get: __accessProp.bind(from, key),
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  __moduleCache.set(from, entry);
  return entry;
};
var __moduleCache;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};

// src/main.js
var exports_main = {};
__export(exports_main, {
  default: () => TocInsertPlugin
});
module.exports = __toCommonJS(exports_main);
var import_obsidian = require("obsidian");

// src/toc.js
var START = "<!-- toc:start -->";
var END = "<!-- toc:end -->";
var FENCE = /^\s*(`{3,}|~{3,})/;
var HEADING = /^(#{1,6})\s+(.*?)(?:\s+#+)?\s*$/;
function bodyStart(lines) {
  if (lines[0] !== "---")
    return 0;
  for (let i = 1;i < lines.length; i++) {
    if (lines[i] === "---")
      return i + 1;
  }
  return 0;
}
function extractHeadings(markdown, { minLevel = 2, maxLevel = 4 } = {}) {
  const lines = markdown.split(`
`);
  const out = [];
  let fence = null;
  for (let i = bodyStart(lines);i < lines.length; i++) {
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
    if (fence)
      continue;
    const h = line.match(HEADING);
    if (!h)
      continue;
    const level = h[1].length;
    const text = h[2].trim();
    if (!text || level < minLevel || level > maxLevel)
      continue;
    out.push({ level, text });
  }
  return out;
}
function buildTocLines(headings) {
  if (headings.length === 0)
    return [];
  const base = Math.min(...headings.map((h) => h.level));
  return headings.map((h) => {
    const indent = "  ".repeat(h.level - base);
    const target = h.text.replace(/[\[\]|#^]/g, "").trim();
    const display = h.text.replace(/[\[\]|]/g, "").trim();
    return `${indent}- [[#${target}|${display}]]`;
  });
}
function applyToc(markdown, opts = {}) {
  const headings = extractHeadings(markdown, opts);
  const body = buildTocLines(headings);
  const block = [START, ...body.length ? body : ["<!-- no headings in range -->"], END];
  const lines = markdown.split(`
`);
  const s = lines.indexOf(START);
  if (s !== -1) {
    const e = lines.indexOf(END, s + 1);
    if (e !== -1) {
      return [...lines.slice(0, s), ...block, ...lines.slice(e + 1)].join(`
`);
    }
  }
  const at = bodyStart(lines);
  return [...lines.slice(0, at), ...block, "", ...lines.slice(at)].join(`
`);
}

// src/main.js
class TocInsertPlugin extends import_obsidian.Plugin {
  async onload() {
    this.addCommand({
      id: "insert-or-update-toc",
      name: "Insert or update table of contents",
      editorCallback: (editor) => {
        const before = editor.getValue();
        const after = applyToc(before, { minLevel: 2, maxLevel: 4 });
        if (after !== before) {
          editor.setValue(after);
        }
        new import_obsidian.Notice("Table of contents updated");
      }
    });
  }
}
