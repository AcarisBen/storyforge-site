#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseLanguageToolRulesXml } from '../src/lib/writing/languagetoolAdapter.mjs';
import { importHunspell } from '../src/lib/writing/lexicalDictionary.mjs';

export const SOURCES = Object.freeze({
  dictionary: {
    dic: 'https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_BR/pt_BR.dic',
    aff: 'https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_BR/pt_BR.aff',
    license: 'MPL-1.1 OR GPL-2.0-or-later OR LGPL-2.1-or-later',
  },
  rules: {
    url: 'https://raw.githubusercontent.com/languagetool-org/languagetool/master/languagetool-language-modules/portuguese/src/main/resources/org/languagetool/rules/pt/grammar.xml',
    license: 'LGPL-2.1-or-later',
  },
});

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function parseImportArgs(argv) {
  const options = { output: 'public/writing-datasets', acceptLicenses: false, checksums: {} };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--accept-licenses') options.acceptLicenses = true;
    else if (arg === '--output') options.output = argv[++index];
    else if (arg.startsWith('--sha256-')) options.checksums[arg.slice(9)] = argv[++index];
    else throw new Error(`Unknown option: ${arg}`);
  }
  return options;
}

async function download(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

export async function importDatasets({ output = 'public/writing-datasets', acceptLicenses, checksums = {} }) {
  if (!acceptLicenses) throw new Error('Pass --accept-licenses after reviewing the documented upstream licenses.');
  const [dic, aff, rulesXml] = await Promise.all([
    download(SOURCES.dictionary.dic), download(SOURCES.dictionary.aff), download(SOURCES.rules.url),
  ]);
  const assets = {
    dictionary: { dic: dic.toString('utf8'), aff: aff.toString('utf8'), metadata: { source: SOURCES.dictionary.dic } },
    rules: parseLanguageToolRulesXml(rulesXml.toString('utf8')),
  };
  for (const [name, content] of Object.entries({ dic, aff, rules: rulesXml })) {
    const expected = checksums[name];
    if (expected && sha256(content) !== expected.toLowerCase()) throw new Error(`Checksum mismatch: ${name}`);
  }
  const dictionary = importHunspell(assets.dictionary);
  const manifest = {
    version: 1, language: 'pt-BR', generatedAt: new Date().toISOString(),
    source: 'LibreOffice dictionaries + LanguageTool Portuguese rules',
    license: `${SOURCES.dictionary.license}; ${SOURCES.rules.license}`,
    assets: { dictionary: 'dictionary.json', rules: 'rules.json' },
    sha256: { dic: sha256(dic), aff: sha256(aff), rules: sha256(rulesXml) },
    counts: { words: dictionary.size, rules: assets.rules.length },
  };
  await mkdir(output, { recursive: true });
  await Promise.all([
    writeFile(join(output, 'dictionary.json'), JSON.stringify(assets.dictionary)),
    writeFile(join(output, 'rules.json'), JSON.stringify(assets.rules)),
    writeFile(join(output, 'manifest.json'), JSON.stringify(manifest, null, 2)),
  ]);
  return manifest;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  importDatasets(parseImportArgs(process.argv.slice(2))).then((manifest) => {
    console.log(`Imported ${manifest.counts.words} words and ${manifest.counts.rules} rules.`);
  }).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
