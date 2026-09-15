# Dicionários de escrita

O analisador usa apenas regras e palavras incorporadas ao código. Dicionários
pt-BR maiores são opt-in: importe um arquivo Hunspell (`.dic` + `.aff`) ou uma
lista VOLP por `importHunspell`/`createVOLPAdapter` e registre o resultado em
`createLexicalDictionary`.

O repositório não redistribui dados de terceiros para evitar ambiguidade de
licença. Um manifesto de importação deve documentar `language`, `source`,
`version`, `license`, `sha256` e a data de geração. O carregamento é local e
não faz chamadas externas em runtime.
