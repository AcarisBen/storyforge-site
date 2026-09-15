/**
 * Adapter boundary for generated/imported dictionaries. The repository ships
 * no third-party word list: applications can import a manifest and data loader
 * supplied under a compatible license.
 */
export function createLexicalDictionary({ words = [], affix = null, metadata = {} } = {}) {
  const entries = new Map();
  for (const item of words) {
    const value = typeof item === 'object' ? item.word : item;
    const normalized = String(value ?? '').trim().toLocaleLowerCase('pt-BR');
    if (normalized) entries.set(normalized, typeof item === 'object' ? item : null);
  }
  return Object.freeze({
    metadata: { language: 'pt-BR', format: 'word-list', ...metadata },
    affix,
    has(word) { return entries.has(String(word).toLocaleLowerCase('pt-BR')); },
    entry(word) { return entries.get(String(word).toLocaleLowerCase('pt-BR')) || null; },
    tagFor(word) { return entries.get(String(word).toLocaleLowerCase('pt-BR'))?.tag || null; },
    size: entries.size,
    words: () => [...entries.keys()],
  });
}
export function importHunspell({ dic = '', aff = '', metadata = {} } = {}) {
  const lines = String(dic).replace(/^\uFEFF/, '').split(/\r?\n/);
  const first = lines.findIndex((line) => line.trim() && !line.trim().startsWith('#'));
  const words = lines.slice(first >= 0 ? first + 1 : 0)
    .map((line) => line.trim().split(/\s+#/)[0].split('/')[0])
    .filter((line) => line && !line.startsWith('#'));
  return createLexicalDictionary({ words, affix: aff, metadata: { format: 'hunspell', ...metadata } });
}
export function createVOLPAdapter(entries = [], metadata = {}) {
  return createLexicalDictionary({ words: entries, metadata: { source: 'VOLP-import', ...metadata } });
}
