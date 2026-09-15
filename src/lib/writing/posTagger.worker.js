import { tagPartsOfSpeech } from './posTagger.mjs';
import { createLexicalDictionary } from './lexicalDictionary.mjs';
self.onmessage = ({ data }) => {
  const dictionary = data?.dictionaryWords
    ? createLexicalDictionary({ words: data.dictionaryWords })
    : undefined;
  self.postMessage({ requestId: data?.requestId, tags: tagPartsOfSpeech(data?.text || '', { dictionary }) });
};
