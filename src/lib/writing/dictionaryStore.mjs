const FILTER_KEY = 'storyforge.writing.literary-filter.v1';
const AUTHOR_KEY = 'storyforge.writing.author-dictionary.v1';

function storage(custom) {
  if (custom) return custom;
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage;
  return null;
}
function read(key, custom) {
  try { return JSON.parse(storage(custom)?.getItem(key) || '[]'); } catch { return []; }
}
function write(key, value, custom) {
  try { storage(custom)?.setItem(key, JSON.stringify([...new Set(value)])); } catch { /* private mode */ }
}
function word(value) { return String(value ?? '').trim().toLocaleLowerCase('pt-BR'); }

export function getLiteraryFilter(customStorage) { return read(FILTER_KEY, customStorage); }
export function addLiteraryWord(value, customStorage) {
  const next = [...getLiteraryFilter(customStorage), word(value)].filter(Boolean);
  write(FILTER_KEY, next, customStorage); return [...new Set(next)];
}
export function ignoreLiteraryWord(value, customStorage) { return addLiteraryWord(value, customStorage); }
export function removeLiteraryWord(value, customStorage) {
  const target = word(value); const next = getLiteraryFilter(customStorage).filter((item) => item !== target);
  write(FILTER_KEY, next, customStorage); return next;
}
export function isLiteraryWord(value, customStorage) { return getLiteraryFilter(customStorage).includes(word(value)); }

export function getAuthorDictionary(customStorage) { return read(AUTHOR_KEY, customStorage); }
export function addAuthorWord(value, customStorage) {
  const next = [...getAuthorDictionary(customStorage), word(value)].filter(Boolean);
  write(AUTHOR_KEY, next, customStorage); return [...new Set(next)];
}
export function removeAuthorWord(value, customStorage) {
  const target = word(value); const next = getAuthorDictionary(customStorage).filter((item) => item !== target);
  write(AUTHOR_KEY, next, customStorage); return next;
}
export function isAuthorWord(value, customStorage) { return getAuthorDictionary(customStorage).includes(word(value)); }

export const dictionaryStorageKeys = Object.freeze({ FILTER_KEY, AUTHOR_KEY });
