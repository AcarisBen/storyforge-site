import assert from 'node:assert/strict';
import test from 'node:test';
import { tokenize, getPointCorrection, applyPointCorrection } from '../src/lib/writing/tokenizer.mjs';
import { createGrammarAlert } from '../src/lib/writing/grammarSchema.mjs';
import { createLexicalDictionary, importHunspell } from '../src/lib/writing/lexicalDictionary.mjs';
import { parseLanguageToolRulesXml, parseLanguageToolXml } from '../src/lib/writing/languagetoolAdapter.mjs';
import { loadWritingDataset, validateWritingManifest } from '../src/lib/writing/writingDataset.mjs';
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

test('LanguageTool rules import into local detector descriptors', () => {
  const rules = parseLanguageToolRulesXml('<rule id="R"><pattern><token>foo</token></pattern><message>Use bar</message><suggestion>bar</suggestion></rule>');
  assert.equal(rules[0].id, 'R');
  assert.equal(rules[0].suggestions[0], 'bar');
  assert.match('foo'.replace(new RegExp(rules[0].pattern, rules[0].flags || 'giu'), 'x'), /x/);
});

test('generated manifest loading is local and optional', async () => {
  const files = {
    '/writing-datasets/manifest.json': { language: 'pt-BR', source: 'test', license: 'MIT', sha256: {}, assets: { dictionary: 'dictionary.json', rules: 'rules.json' } },
    '/writing-datasets/dictionary.json': { words: ['nuvem'] },
    '/writing-datasets/rules.json': [{ id: 'local-rule', message: 'Troque', pattern: '\\bfoo\\b', suggestions: ['bar'] }],
  };
  const fetcher = async (url) => ({ ok: Boolean(files[url]), json: async () => files[url] });
  const loaded = await loadWritingDataset({ baseUrl: '/writing-datasets/', fetcher });
  assert.equal(loaded.dictionary.has('nuvem'), true);
  assert.equal(loaded.rules[0].detector('foo')[0].suggestions[0], 'bar');
  assert.throws(() => validateWritingManifest({ language: 'pt-BR' }), /source/);
});
