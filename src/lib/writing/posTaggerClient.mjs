import { tagPartsOfSpeech } from './posTagger.mjs';

/**
 * Runs the conservative tagger off the UI thread when Worker is available.
 * The fallback is deliberately synchronous and returns the same shape.
 */
export function createPosTaggerClient({ WorkerCtor, workerUrl, dictionary } = {}) {
  const Ctor = WorkerCtor || globalThis.Worker;
  const fallbackAnalyze = (text) => tagPartsOfSpeech(text, { dictionary });
  let worker = null;
  let sequence = 0;
  const pending = new Map();
  if (Ctor && workerUrl) {
    try {
      worker = new Ctor(workerUrl, { type: 'module' });
      worker.onmessage = ({ data }) => {
        const request = pending.get(data.requestId);
        if (request) { pending.delete(data.requestId); request.resolve(data.tags); }
      };
      worker.onerror = () => {
        const failedWorker = worker;
        worker = null;
        failedWorker?.terminate();
        for (const request of pending.values()) {
          request.resolve(fallbackAnalyze(request.text));
        }
        pending.clear();
      };
    } catch {
      worker = null;
    }
  }
  return {
    analyze(text) {
      const value = String(text || '');
      if (!worker) return Promise.resolve(fallbackAnalyze(value));
      return new Promise((resolve) => {
        const requestId = ++sequence;
        pending.set(requestId, { resolve, text: value });
        try {
          worker.postMessage({ requestId, text: value, dictionaryWords: dictionary?.words?.() || [] });
        } catch {
          pending.delete(requestId);
          worker = null;
          resolve(fallbackAnalyze(value));
        }
      });
    },
    terminate() {
      worker?.terminate();
      pending.clear();
    },
  };
}
