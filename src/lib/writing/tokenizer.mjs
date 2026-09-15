/**
 * Deterministic, browser-compatible tokenizer. JavaScript string indexes are
 * UTF-16 code-unit offsets, which is also the offset convention used by the
 * textarea and LanguageTool. Never convert these offsets to code points.
 */
const TOKEN = /[\p{L}\p{M}\p{N}]+(?:['’‑-][\p{L}\p{M}\p{N}]+)*/gu;

export function tokenize(text = '') {
  const value = String(text);
  return [...value.matchAll(TOKEN)].map((match, index) => ({
    index,
    text: match[0],
    normalized: match[0].toLocaleLowerCase('pt-BR'),
    offset: match.index,
    length: match[0].length,
    end: match.index + match[0].length,
  }));
}

export function getPointCorrection(text, offset, length, replacement) {
  const value = String(text);
  const start = Math.max(0, Number(offset) || 0);
  const count = Math.max(0, Number(length) || 0);
  if (start > value.length || value.slice(start, start + count).length !== count) return null;
  return {
    offset: start,
    length: count,
    replacement: String(replacement ?? ''),
    before: value.slice(0, start),
    after: value.slice(start + count),
  };
}

export function applyPointCorrection(text, correction) {
  if (!correction) return String(text);
  const point = getPointCorrection(text, correction.offset, correction.length, correction.replacement);
  return point ? `${point.before}${point.replacement}${point.after}` : String(text);
}

export function comparePoints(a, b) {
  return a.offset - b.offset || a.length - b.length;
}
