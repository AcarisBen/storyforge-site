import assert from 'node:assert/strict';
import test from 'node:test';
import { tokenize, getPointCorrection, applyPointCorrection } from '../src/lib/writing/tokenizer.mjs';
import { createGrammarAlert } from '../src/lib/writing/grammarSchema.mjs';
import { createLexicalDictionary, importHunspell } from '../src/lib/writing/lexicalDictionary.mjs';
import { parseLanguageToolXml } from '../src/lib/writing/languagetoolAdapter.mjs';
import { tagPartsOfSpeech } from '../src/lib/writing/posTagger.mjs';
import {
  addAuthorWord, addLiteraryWord, isAuthorWord, isLiteraryWord,
} from '../src/lib/writing/dictionaryStore.mjs';

test('tokenizer uses deterministic UTF-16 offsets and correction points', () => {
  const text = '😀 voce';
  const token = tokenize(text)[0];
  assert.equal(token.offset, 3);
  assert.equal(token.length, 4);
  const point = getPointCorrection(text, token.offset, token.length, 'você');
  assert.equal(applyPointCorrection(text, point), '😀 você');
});

test('grammar alerts are structured and bounded', () => {
  const alert = createGrammarAlert({ id: 'x', message: 'x', category: 'style', severity: 'low' }, 'a', 2, ['b', 'b']);
  assert.deepEqual(alert.suggestions, ['b']);
  assert.equal(alert.length, 1);
});

test('browser dictionaries expose add and ignore-compatible APIs', () => {
  const data = new Map();
  const storage = { getItem: (key) => data.get(key) || null, setItem: (key, value) => data.set(key, value) };
  addLiteraryWord('Névoa', storage);
  addAuthorWord('Auren', storage);
  assert.equal(isLiteraryWord('névoa', storage), true);
  assert.equal(isAuthorWord('AUREN', storage), true);
});

test('Hunspell and LanguageTool adapters are offline and importable', () => {
  const dictionary = importHunspell({ dic: '2\n casa\n livro/SM' });
  assert.equal(dictionary.has('casa'), true);
  const alerts = parseLanguageToolXml('<error from="2" ruleId="X" message="Troque"><replacement>um</replacement></error>');
  assert.equal(alerts[0].ruleId, 'X');
  assert.equal(alerts[0].suggestions[0], 'um');
});

test('POS tagger is conservative and local', () => {
  const tags = tagPartsOfSpeech('A menina chegou');
  assert.equal(tags.find((item) => item.normalized === 'a').tag, 'FUNCTION');
  assert.equal(tags.find((item) => item.normalized === 'chegou').tag, 'VERB');
  assert.equal(createLexicalDictionary({ words: ['casa'] }).has('casa'), true);
});
