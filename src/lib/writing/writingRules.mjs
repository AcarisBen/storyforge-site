import { defineGrammarRule } from './grammarSchema.mjs';

const rules = {
  repeatedWord: defineGrammarRule({
    id: 'repeated-word',
    category: 'Repetição',
    severity: 'medium',
    message: 'Esta palavra aparece repetida em sequência.',
  }),
  multipleSpaces: defineGrammarRule({
    id: 'multiple-spaces',
    category: 'Formatação',
    severity: 'low',
    message: 'Há mais de um espaço entre estas palavras.',
  }),
  accent: defineGrammarRule({
    id: 'missing-accent',
    category: 'Acentuação',
    severity: 'medium',
    message: 'Esta palavra costuma precisar de acento neste uso.',
  }),
  spelling: defineGrammarRule({
    id: 'spelling-confusion',
    category: 'Ortografia',
    severity: 'high',
    message: 'Esta grafia pode estar incorreta neste contexto.',
  }),
  agreement: defineGrammarRule({
    id: 'subject-noun-agreement',
    category: 'Concordância',
    severity: 'high',
    message: 'O artigo, o substantivo e o verbo parecem estar em desacordo.',
  }),
  porque: defineGrammarRule({
    id: 'punctuation-before-porque',
    category: 'Pontuação',
    severity: 'medium',
    message: 'Uma vírgula pode separar esta explicação da oração anterior.',
  }),
  crase: defineGrammarRule({
    id: 'crase',
    category: 'Crase',
    severity: 'medium',
    message: 'Este contexto pede crase antes do destino indicado.',
  }),
};

export const WRITING_RULES = Object.freeze(rules);

export const ACCENT_SUGGESTIONS = Object.freeze({
  voce: 'você',
  voces: 'vocês',
  tambem: 'também',
  alguem: 'alguém',
  ninguem: 'ninguém',
  dificil: 'difícil',
  historia: 'história',
  proximo: 'próximo',
  esta: 'está',
});

export const SPELLING_SUGGESTIONS = Object.freeze({
  veses: 'vezes',
  ves: 'vez',
});

export const DESTINATION_NOUNS = Object.freeze([
  'escola',
  'universidade',
  'igreja',
  'biblioteca',
  'cidade',
  'praia',
  'estação',
]);
