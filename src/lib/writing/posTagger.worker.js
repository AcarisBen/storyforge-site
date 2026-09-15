import { tagPartsOfSpeech } from './posTagger.mjs';
self.onmessage = ({ data }) => {
  self.postMessage({ requestId: data?.requestId, tags: tagPartsOfSpeech(data?.text || '') });
};
