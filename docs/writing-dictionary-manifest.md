# Datasets de escrita (opt-in)

O repositório não inclui listas de palavras nem regras de terceiros. Para gerar
assets locais, revise as licenças e execute explicitamente:

```sh
npm run import:writing-datasets -- --output public/writing-datasets
```

O script baixa o dicionário pt_BR do repositório
[LibreOffice dictionaries](https://github.com/LibreOffice/dictionaries/tree/master/pt_BR)
(MPL-1.1/GPL-2.0-or-later/LGPL-2.1-or-later) e as regras portuguesas do
[LanguageTool](https://github.com/languagetool-org/languagetool) (LGPL-2.1-or-later).
`--accept-licenses` é obrigatório; URLs são fixadas no script para evitar
fontes arbitrárias. Use `--sha256-dic`, `--sha256-aff` e `--sha256-rules` para
verificar hashes publicados antes de gravar os arquivos.

O resultado contém `manifest.json`, `dictionary.json` e `rules.json`. O
manifesto registra idioma, fontes, licenças, data, contagens e SHA-256 dos
downloads. Assets gerados não devem ser commitados sem uma revisão de licença.
Em produção, `loadWritingDataset()` só procura o manifesto em
`/writing-datasets/`; se ele não existir, o analisador retorna ao conjunto
determinístico embutido. Não há chamadas ao LanguageTool nem a serviços
externos durante a análise, e não há paridade completa com o LanguageTool sem
assets importados.
