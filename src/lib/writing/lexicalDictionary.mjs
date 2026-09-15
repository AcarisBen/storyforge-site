/**
 * Adapter boundary for generated/imported dictionaries. The repository ships
 * no third-party word list: applications can import a manifest and data loader
 * supplied under a compatible license.
 */
export function createLexicalDictionary({ words = [], affix = null, metadata = {} } = {}) {
  const entries = new Set(words.map((item) => String(item).trim().toLocaleLowerCase('pt-BR')).filter(Boolean));
  return Object.freeze({
    metadata: { language: 'pt-BR', format: 'word-list', ...metadata },
    affix,
    has(word) { return entries.has(String(word).toLocaleLowerCase('pt-BR')); },
    size: entries.size,
    words: () => [...entries],
  });
}
export function importHunspell({ dic = '', aff = '', metadata = {} } = {}) {
  const words = String(dic).split(/\r?\n/).slice(1).map((line) => line.trim().split('/')[0]).filter(Boolean);
  return createLexicalDictionary({ words, affix: aff, metadata: { format: 'hunspell', ...metadata } });
}
export function createVOLPAdapter(entries = [], metadata = {}) {
  return createLexicalDictionary({ words: entries, metadata: { source: 'VOLP-import', ...metadata } });
}
