// src/lib/writing/customGrammarRules.js

/**
 * BASE DE REGRAS GRAMATICAIS E ORTOGRÁFICAS COMPLEMENTARES
 * Utilizada como fallback/complemento quando o LanguageTool não identifica o problema.
 */
export const customRulesDatabase = [
  // ==========================================
  // 1. REGÊNCIA VERBAL E PREPOSIÇÕES
  // ==========================================
  {
    id: 'rule-regencia-ir-no',
    category: 'Regência Verbal',
    pattern: /\b(foi|fomos|ir|irão|vai|fui)\s+no\s+(shopping|cinema|teatro|mercado|parque|estádio)\b/gi,
    replacementFn: (match) => match.replace(/\bno\b/i, 'ao'),
    message: 'Verbos de movimento pedem a preposição "a" na norma-padrão ("ir ao shopping").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-regencia-ir-na',
    category: 'Regência Verbal',
    pattern: /\b(foi|fomos|ir|irão|vai|fui)\s+na\s+(loja|escola|praia|farmácia|padaria|cidade|feira|estação)\b/gi,
    replacementFn: (match) => match.replace(/\bna\b/i, 'à'),
    message: 'Verbos de movimento pedem a preposição "a" na norma-padrão ("fui à loja").',
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

  // ==========================================
  // 2. PARÔNIMOS, CONFUSÃO LEXICAL E HÍFEN
  // ==========================================
  {
    id: 'rule-secao-sessao',
    category: 'Parônimos / Ortografia',
    pattern: /\b(seção|secao)\b/gi,
    replacementFn: () => 'sessão',
    message: 'Para filmes, espetáculos ou reuniões com duração, a grafia correta é "sessão".',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
  {
    id: 'rule-de-mau-a-pior',
    category: 'Parônimos / Ortografia',
    pattern: /\bde\s+mau\s+a\s+pior\b/gi,
    replacementFn: () => 'de mal a pior',
    message: 'A expressão correta é "de mal a pior" (oposto de "de bem a melhor").',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
  {
    id: 'rule-excecoes-excesso',
    category: 'Confusão Lexical',
    pattern: /\b(exceção|exceções)\s+de\s+(problemas|falhas|erros|atrasos|gastos|confusões)\b/gi,
    replacementFn: (match, p1, p2) => `excesso de ${p2}`,
    message: 'Para indicar grande quantidade ou demasia, utilize "excesso" (e não "exceção").',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
  {
    id: 'rule-misto-quente-hifen',
    category: 'Novo Acordo / Hífen',
    pattern: /\bmisto-quente\b/gi,
    replacementFn: () => 'misto quente',
    message: 'Segundo o Novo Acordo Ortográfico, a composição "misto quente" não possui hífen.',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },

  // ==========================================
  // 3. CONCORDÂNCIA VERBAL E IMPESSOALIDADE
  // ==========================================
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
  {
    id: 'rule-chegaram-a-vez',
    category: 'Concordância Verbal',
    pattern: /\bchegaram\s+(a|o)\s+(minha|sua|nossa|tua)\s+(vez|hora)\b/gi,
    replacementFn: (match, art, poss, subst) => `chegou ${art} ${poss} ${subst}`,
    message: 'O sujeito ("a minha vez") está no singular, logo o verbo "chegar" deve concordar no singular ("chegou").',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },
  {
    id: 'rule-fazer-impessoal-faziam',
    category: 'Impessoalidade Verbal',
    pattern: /\bfaziam\s+(anos|meses|dias|horas|semanas|décadas|séculos)\b/gi,
    replacementFn: (match, tempo) => `fazia ${tempo}`,
    message: 'O verbo "fazer" indicando tempo decorrido é impessoal e permanece no singular ("fazia anos").',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },
  {
    id: 'rule-ter-impessoal-tinham',
    category: 'Impessoalidade / Norma Culta',
    pattern: /\btinham\s+(muitos|muitas|vários|várias|alguns|algumas|poucos|poucas|bastantes)\b/gi,
    replacementFn: (match, g1) => `havia ${g1}`,
    message: 'No sentido de existir ou haver, prefira "havia" ou "existiam" em vez de "tinham".',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },
  {
    id: 'rule-um-ou-outro-plural',
    category: 'Concordância Verbal',
    pattern: /\bum\s+ou\s+outro\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+)\s+(demonstravam|queriam|faziam|diziam|estavam|chegaram|tinham)\b/gi,
    replacementFn: (match, subst, verbo) => {
      const vSing = verbo
        .replace(/vam$/, 'va')
        .replace(/iam$/, 'ia')
        .replace(/aram$/, 'ou')
        .replace(/nham$/, 'nha');
      return `um ou outro ${subst} ${vSing}`;
    },
    message: 'Com a expressão "um ou outro + substantivo singular", o verbo fica obrigatoriamente no singular.',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },
  {
    id: 'rule-dupla-flexao-infinitivo',
    category: 'Locução Verbal',
    pattern: /\b(iam|vão|podiam|podem|deviam|devem)\s+(irem|fazerem|serem|terem|verem|dizerem|virarem)\b/gi,
    replacementFn: (match, aux, inf) => {
      const baseInf = inf.replace(/em$/, '');
      return `${aux} ${baseInf}`;
    },
    message: 'Em locuções verbais, apenas o verbo auxiliar flexiona ("iam ir").',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },
  {
    id: 'rule-a-gente-comprarmos',
    category: 'Concordância de Pessoa',
    pattern: /\ba\s+gente\s+([a-zA-Záàâãéèêíóòôõúç]+)\s+para\s+([a-zA-Záàâãéèêíóòôõúç]+)mos\b/gi,
    replacementFn: (match, v1, v2) => `a gente ${v1} para ${v2}`,
    message: 'A expressão "a gente" exige a 3ª pessoa do singular ("a gente foi para comprar").',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },

  // ==========================================
  // 4. CONCORDÂNCIA NOMINAL
  // ==========================================
  {
    id: 'rule-bastante-plural',
    category: 'Concordância Nominal',
    pattern: /\bbastante\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+s)\b/gi,
    replacementFn: (match, group1) => `bastantes ${group1}`,
    message: 'Quando acompanha um substantivo no plural, "bastante" flexiona para "bastantes".',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },

  // ==========================================
  // 5. PRONOMES, ONDE/AONDE E ESTILO
  // ==========================================
  {
    id: 'rule-aonde-estatico',
    category: 'Uso de Onde / Aonde',
    pattern: /\baonde\s+(deixei|moro|mora|estava|estou|fica|ficava|encontrei|deixou)\b/gi,
    replacementFn: (match, verbo) => `onde ${verbo}`,
    message: 'Para indicar permanência ou localização fixa, utilize "onde" em vez de "aonde".',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-me-deu-ele',
    category: 'Colocação Pronominal',
    pattern: /\bme\s+deu\s+ele\b/gi,
    replacementFn: () => 'ele me deu',
    message: 'Ajuste a ordem dos pronomes para a norma-padrão ("ele me deu").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-ontem-de-noite',
    category: 'Estilo / Locução Adverbial',
    pattern: /\bontem\s+de\s+noite\b/gi,
    replacementFn: () => 'ontem à noite',
    message: 'Na norma-padrão, prefira a locução adverbial "à noite" com crase ("ontem à noite").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-relativo-cortado-dela',
    category: 'Sintaxe / Relativa Cortada',
    pattern: /\b(loja|casa|pessoa|coisa|música|história)\s+que\s+([a-zA-Záàâãéèêíóòôõúç\s]+)\s+falado\s+(dela|dele)\b/gi,
    replacementFn: (match, subs, meio, pron) => {
      const prep = pron === 'dela' ? 'da qual' : 'do qual';
      return `${subs} ${prep} ${meio} falado`;
    },
    message: 'Evite a oração relativa cortada ("que... dela"). Utilize "da qual havia falado".',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },

  // ==========================================
  // 6. ACENTUAÇÃO ORTOGRÁFICA
  // ==========================================
  {
    id: 'rule-sai-sem-acento',
    category: 'Acentuação Ortográfica',
    pattern: /\b(eu\s+)?sai\s+(correndo|de\s+casa|daqui|rápido|cedo|tarde)\b/gi,
    replacementFn: (match, eu, comp) => `${eu || ''}saí ${comp}`,
    message: 'No pretérito perfeito do indicativo (1ª pessoa do singular), a grafia correta é "saí" (com acento).',
    badgeStyle: 'bg-red-950/80 text-red-300 border-red-700/60',
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
    rule.pattern.lastIndex = 0; // Reseta o cursor do regex

    while ((match = rule.pattern.exec(text)) !== null) {
      const matchStart = match.index;
      const matchLength = match[0].length;
      const matchEnd = matchStart + matchLength;

      // Se o LanguageTool já identificou este trecho, a regra local cede a prioridade
      if (isRangeOccupied(matchStart, matchEnd)) {
        continue;
      }

      const replacement = rule.replacementFn
        ? rule.replacementFn(match[0], match[1], match[2], match[3])
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