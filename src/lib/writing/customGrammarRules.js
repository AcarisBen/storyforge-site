// src.lib.writing/customGrammarRules.js

// This file contains custom grammar rules for the writing module.
// These rules can be used to enhance the grammar checking capabilities of the application.

/**
 * BASE DE REGRAS GRAMATICAIS E ORTOGRÁFICAS COMPLEMENTARES
 * Utilizada como fallback/complemento quando o LanguageTool não identifica o problema.
 */
export const customRulesDatabase = [
  // 1. REGÊNCIA VERBAL E PREPOSIÇÕES
  {
    id: 'rule-regencia-ir-no',
    category: 'Regência Verbal',
    pattern: /\b(foi|fomos|ir|irão|vai|fui)\s+no\s+(shopping|cinema|teatro|mercado|parque|estádio)\b/gi,
    replacementFn: (match) => match.replace(/\bno\b/i, 'ao'),
    message: 'Verbos de movimento pedem a preposição "a" na norma-padrão ("ir ao shopping").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-regencia-assisti-um',
    category: 'Regência Verbal',
    pattern: /\b(assisti|assistimos|assistiram|assistiu)\s+um\b/gi,
    replacementFn: (match) => match.replace(/\bum\b/i, 'a um'),
    message: 'No sentido de ver/presenciar, o verbo "assistir" exige a preposição "a" ("assistir a um").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },

  // 2. PARÔNIMOS E CONFUSÃO LEXICAL
  {
    id: 'rule-secao-sessao',
    category: 'Parônimos / Ortografia',
    pattern: /\b(seção|secao)\b/gi,
    replacementFn: () => 'sessão',
    message: 'Para filmes, espetáculos ou reuniões com duração, a grafia correta é "sessão".',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },

  // 3. CONCORDÂNCIA VERBAL
  {
    id: 'rule-pessoas-nao-tinha',
    category: 'Concordância Verbal',
    pattern: /\b(os|as|eles|elas|pessoas)\s+(não\s+)?tinha\b/gi,
    replacementFn: (match) => match.replace(/tinha/i, 'tinham'),
    message: 'O sujeito no plural exige o verbo flexionado no plural ("tinham").',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },
  {
    id: 'rule-cheguemos-lag',
    category: 'Conjugação Verbal',
    pattern: /\bcheguemos\b/gi,
    replacementFn: () => 'chegamos',
    message: 'Para o passado (pretérito perfeito do indicativo), utilize "chegamos".',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },

  // 4. CONCORDÂNCIA NOMINAL
  {
    id: 'rule-bastante-plural',
    category: 'Concordância Nominal',
    pattern: /\bbastante\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+s)\b/gi,
    replacementFn: (match, group1) => `bastantes ${group1}`,
    message: 'Quando acompanha um substantivo no plural, "bastante" deve flexionar para "bastantes".',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },

  // 5. COLOCAÇÃO PRONOMINAL E REDUNDÂNCIA
  {
    id: 'rule-me-deu-ele',
    category: 'Colocação Pronominal',
    pattern: /\bme\s+deu\s+ele\b/gi,
    replacementFn: () => 'ele me deu',
    message: 'Ajuste a ordem dos pronomes para a norma-padrão ("ele me deu").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
];

/**
 * Executa a análise das regras locais apenas nos trechos que NÃO possuem
 * sobreposição com erros já encontrados pelo LanguageTool.
 */
export function analyzeCustomGrammarRules(text, existingSuggestions = []) {
  if (!text || text.trim().length < 3) return [];

  const customSuggestions = [];

  // Mapeia os intervalos de caracteres que já possuem erros do LanguageTool
  const occupiedRanges = existingSuggestions.map((s) => ({
    start: s.offset,
    end: s.offset + (s.length || s.original.length),
  }));

  // Função auxiliar para checar se uma nova posição colide com um erro do LanguageTool
  const isRangeOccupied = (start, end) => {
    return occupiedRanges.some(
      (range) => (start >= range.start && start < range.end) || (end > range.start && end <= range.end)
    );
  };

  customRulesDatabase.forEach((rule) => {
    let match;
    // Reseta o index da expressão regular
    rule.pattern.lastIndex = 0;

    while ((match = rule.pattern.exec(text)) !== null) {
      const matchStart = match.index;
      const matchLength = match[0].length;
      const matchEnd = matchStart + matchLength;

      // SE O LANGUAGETOOL JÁ ACHOU ALGO NESTE TRECHO, IGNORA A REGRA LOCAL
      if (isRangeOccupied(matchStart, matchEnd)) {
        continue;
      }

      const replacement = rule.replacementFn
        ? rule.replacementFn(match[0], match[1])
        : match[0];

      customSuggestions.push({
        id: `custom-${rule.id}-${matchStart}`,
        label: rule.category,
        original: match[0],
        offset: matchStart,
        length: matchLength,
        replacement: replacement,
        replacements: [replacement],
        message: rule.message,
        badgeStyle: rule.badgeStyle,
      });
    }
  });

  return customSuggestions;
}