# Datasets de escrita (opt-in)

O repositório não inclui listas de palavras nem regras de terceiros. Para gerar
assets locais, revise as licenças e execute explicitamente:

```sh
npm run import:writing-datasets -- --output public/writing-datasets
```

O script baixa o dicionário pt_BR do repositório
[LibreOffice dictionaries](https://github.com/LibreOffice/dictionaries/tree/32b006a2c22a4ac7e8ed3f03346f7b3d85a970a4/pt_BR)
(MPL-1.1/GPL-2.0-or-later/LGPL-2.1-or-later) e as regras portuguesas do
[LanguageTool](https://github.com/languagetool-org/languagetool/tree/cef1be771c44605c4203bddf5137b3ae2961080e) (LGPL-2.1-or-later).
`--accept-licenses` é obrigatório; URLs são fixadas no script para evitar
fontes arbitrárias. Use `--sha256-dic`, `--sha256-aff` e `--sha256-rules` para
verificar hashes publicados antes de gravar os arquivos.

Quando o LanguageTool 6.6 estiver instalado localmente, passe
`--language-tool-dir C:\ProStoryForge\LanguageTool-6.6` para importar
`org\languagetool\rules\pt\grammar.xml` sem depender de rede. Sem essa opção,
o XML é baixado do commit fixado acima. O importador registra repositório,
commit, versão e licença no manifesto e em cada regra importada.

O resultado contém `manifest.json`, `dictionary.json` e `rules.json`. O
manifesto registra idioma, fontes, licenças, data, contagens e SHA-256 dos
downloads. Assets gerados não devem ser commitados sem uma revisão de licença.
Em produção, `loadWritingDataset()` só procura o manifesto em
`/writing-datasets/`; se ele não existir, o analisador retorna ao conjunto
determinístico embutido. Não há chamadas ao LanguageTool nem a serviços
externos durante a análise, e não há paridade completa com o LanguageTool sem
assets importados. Um dataset carregado é cacheado no IndexedDB
`storyforge-writing` (versão 1); o worker de POS recebe o léxico importado,
mas a execução nativa do FreeLing não é empacotada no navegador. O adaptador
`freelingAdapter.mjs` aceita saída offline gerada pelo FreeLing
[TALP-UPC/FreeLing](https://github.com/TALP-UPC/FreeLing/tree/0bae6b7f6d1b405e67658895de54b59bfb3b6338)
(LGPL-3.0-or-later), e o tagger JS determinístico continua sendo o fallback.
