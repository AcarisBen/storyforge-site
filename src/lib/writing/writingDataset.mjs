import { createLexicalDictionary, importHunspell } from './lexicalDictionary.mjs';
import { loadWritingDatasetFromIndexedDB, saveWritingDataset } from './writingDatasetStore.mjs';

const REQUIRED_METADATA = ['language', 'source', 'license'];

export function validateWritingManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') throw new TypeError('Writing dataset manifest must be an object');
  for (const key of REQUIRED_METADATA) {
    if (typeof manifest[key] !== 'string' || !manifest[key].trim()) {
      throw new TypeError(`Writing dataset manifest requires ${key}`);
    }
  }
  if (manifest.language !== 'pt-BR') throw new Error('Only pt-BR writing datasets are supported');
  if (!manifest.sha256 || typeof manifest.sha256 !== 'object') {
    throw new TypeError('Writing dataset manifest requires sha256 checksums');
  }
  return manifest;
}

function relativeUrl(base, file) {
  const root = base.endsWith('/') ? base : base.slice(0, base.lastIndexOf('/') + 1);
  try {
    return new URL(file, root).toString();
  } catch {
    return `${root}${file}`.replace(/([^:]\/)\/+/g, '$1');
  }
}

function createRuleDetector(rule) {
  if (!rule.pattern) return null;
  const pattern = new RegExp(rule.pattern, rule.flags || 'giu');
  return (text) => [...String(text).matchAll(pattern)].map((match) => ({
    original: match[0],
    offset: match.index,
    suggestions: rule.suggestions || [],
  }));
}

export function importedRulesToRegistryRules(rules = []) {
  return rules.map((rule) => ({ ...rule, detector: createRuleDetector(rule) }))
    .filter((rule) => rule.detector);
}

export async function loadWritingDataset({
  baseUrl = '/writing-datasets/',
  manifestUrl,
  fetcher = globalThis.fetch,
  indexedDBFactory = globalThis.indexedDB,
} = {}) {
  if (typeof fetcher !== 'function') {
    const cached = await loadWritingDatasetFromIndexedDB({ indexedDBFactory });
    return cached ? materializeDataset(cached) : null;
  }
  const root = manifestUrl || relativeUrl(baseUrl, 'manifest.json');
  let response;
  try {
    response = await fetcher(root);
  } catch (error) {
    const cached = await loadWritingDatasetFromIndexedDB({ indexedDBFactory });
    if (cached) return materializeDataset(cached);
    if (error?.name === 'TypeError') return null;
    throw error;
  }
  if (!response?.ok) {
    const cached = await loadWritingDatasetFromIndexedDB({ indexedDBFactory });
    return cached ? materializeDataset(cached) : null;
  }
  const manifest = validateWritingManifest(await response.json());
  const readJson = async (file) => {
    const result = await fetcher(relativeUrl(root, file));
    if (!result?.ok) throw new Error(`Unable to load writing dataset asset: ${file}`);
    return result.json();
  };
  const dictionaryData = manifest.assets?.dictionary ? await readJson(manifest.assets.dictionary) : null;
  const rules = manifest.assets?.rules ? await readJson(manifest.assets.rules) : [];
  const dictionary = dictionaryData?.dic
    ? importHunspell({ ...dictionaryData, metadata: manifest })
    : createLexicalDictionary({ words: dictionaryData?.words || [], metadata: manifest });
  const dataset = Object.freeze({
    manifest, dictionary, rules: importedRulesToRegistryRules(rules),
    dictionaryData, rulesData: rules,
  });
  await saveWritingDataset(dataset, { indexedDBFactory });
  return dataset;
}

function materializeDataset(record) {
  const dictionaryData = record.dictionary || {};
  const rules = record.rules || [];
  const dictionary = dictionaryData.dic
    ? importHunspell({ ...dictionaryData, metadata: record.manifest })
    : createLexicalDictionary({ words: dictionaryData.words || [], metadata: record.manifest });
  return Object.freeze({
    manifest: validateWritingManifest(record.manifest),
    dictionary,
    rules: importedRulesToRegistryRules(rules),
    dictionaryData,
    rulesData: rules,
  });
}
