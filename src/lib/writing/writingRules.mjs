export const WRITING_RULES = Object.freeze({
  repeatedWord: {
    id: 'repeated-word',
    category: 'Repetição',
    severity: 'medium',
    message: 'Esta palavra aparece repetida em sequência.',
  },
  multipleSpaces: {
    id: 'multiple-spaces',
    category: 'Formatação',
    severity: 'low',
    message: 'Há mais de um espaço entre estas palavras.',
  },
  accent: {
    id: 'missing-accent',
    category: 'Acentuação',
    severity: 'medium',
    message: 'Esta palavra costuma precisar de acento neste uso.',
  },
  spelling: {
    id: 'spelling-confusion',
    category: 'Ortografia',
    severity: 'high',
    message: 'Esta grafia pode estar incorreta neste contexto.',
  },
  agreement: {
    id: 'subject-noun-agreement',
    category: 'Concordância',
    severity: 'high',
    message: 'O artigo, o substantivo e o verbo parecem estar em desacordo.',
  },
  porque: {
    id: 'punctuation-before-porque',
    category: 'Pontuação',
    severity: 'medium',
    message: 'Uma vírgula pode separar esta explicação da oração anterior.',
  },
  crase: {
    id: 'crase',
    category: 'Crase',
    severity: 'medium',
    message: 'Este contexto pede crase antes do destino indicado.',
  },
});

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
