export const FREELING_SOURCE = Object.freeze({
  repository: 'https://github.com/TALP-UPC/FreeLing',
  ref: '0bae6b7f6d1b405e67658895de54b59bfb3b6338',
  license: 'LGPL-3.0-or-later',
});

function normalize(value) {
  return String(value || '').trim().toLocaleLowerCase('pt-BR');
}

export function parseFreeLingTaggedOutput(output, metadata = {}) {
  const entries = [];
  for (const line of String(output || '').split(/\r?\n/)) {
    const fields = line.trim().split(/\s+/);
    if (fields.length < 3 || line.trim().startsWith('#')) continue;
    const word = normalize(fields[0]);
    const tag = fields[2];
    if (word && tag) entries.push({ word, tag, lemma: fields[1], metadata });
  }
  return entries;
}

export function createFreeLingPosAdapter(entries = [], metadata = {}) {
  const tags = new Map();
  for (const entry of entries) {
    const word = normalize(entry.word);
    if (word && entry.tag) tags.set(word, entry.tag);
  }
  return Object.freeze({
    metadata: { language: 'pt-BR', engine: 'freeling', ...FREELING_SOURCE, ...metadata },
    tagFor(word) { return tags.get(normalize(word)) || null; },
    has(word) { return tags.has(normalize(word)); },
    words() { return [...tags.keys()]; },
    size: tags.size,
  });
}

export function createFreeLingFallbackAdapter(metadata = {}) {
  return createFreeLingPosAdapter([], { ...metadata, fallback: 'deterministic-js' });
}
