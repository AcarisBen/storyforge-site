export const WRITING_DATABASE_NAME = 'storyforge-writing';
export const WRITING_DATABASE_VERSION = 1;
export const WRITING_DATASET_STORE = 'datasets';

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
  });
}

export function openWritingDatabase(indexedDBFactory = globalThis.indexedDB) {
  if (!indexedDBFactory?.open) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const request = indexedDBFactory.open(WRITING_DATABASE_NAME, WRITING_DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(WRITING_DATASET_STORE)) {
        request.result.createObjectStore(WRITING_DATASET_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Unable to open writing dataset database'));
  });
}

export async function saveWritingDataset(dataset, { indexedDBFactory = globalThis.indexedDB } = {}) {
  const database = await openWritingDatabase(indexedDBFactory);
  if (!database) return false;
  const transaction = database.transaction(WRITING_DATASET_STORE, 'readwrite');
  await requestToPromise(transaction.objectStore(WRITING_DATASET_STORE).put({
    id: dataset.manifest.language,
    manifest: dataset.manifest,
    dictionary: dataset.dictionaryData,
    rules: dataset.rulesData,
  }));
  return true;
}

export async function loadWritingDatasetFromIndexedDB({
  language = 'pt-BR', indexedDBFactory = globalThis.indexedDB,
} = {}) {
  const database = await openWritingDatabase(indexedDBFactory);
  if (!database) return null;
  const record = await requestToPromise(
    database.transaction(WRITING_DATASET_STORE, 'readonly')
      .objectStore(WRITING_DATASET_STORE).get(language)
  );
  return record || null;
}
