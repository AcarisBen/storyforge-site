import { tagPartsOfSpeech } from './posTagger.mjs';

/**
 * Runs the conservative tagger off the UI thread when Worker is available.
 * The fallback is deliberately synchronous and returns the same shape.
 */
export function createPosTaggerClient({ WorkerCtor, workerUrl, dictionary } = {}) {
  const Ctor = WorkerCtor || globalThis.Worker;
  let worker = null;
  let sequence = 0;
  const pending = new Map();
  if (Ctor && workerUrl) {
    try {
      worker = new Ctor(workerUrl, { type: 'module' });
      worker.onmessage = ({ data }) => {
        const resolve = pending.get(data.requestId);
        if (resolve) { pending.delete(data.requestId); resolve(data.tags); }
      };
    } catch { worker = null; }
  }
  return {
    analyze(text) {
      if (!worker) return Promise.resolve(tagPartsOfSpeech(text));
      return new Promise((resolve) => {
        const requestId = ++sequence;
        pending.set(requestId, resolve);
        worker.postMessage({ requestId, text: String(text || ''), dictionaryWords: dictionary?.words?.() || [] });
      });
    },
    terminate() {
      worker?.terminate();
      pending.clear();
    },
  };
}
