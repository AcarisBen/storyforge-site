// src/lib/writing/customGrammarRules.js

/**
 * BASE DE REGRAS GRAMATICAIS E ORTOGRÁFICAS COMPLEMENTARES
 * Utilizada como fallback/complemento quando o LanguageTool não identifica o problema.
 */
export const customRulesDatabase = [
  // ==========================================
  // 1. PONTUAÇÃO E MAIÚSCULAS INDEVIDAS
  // ==========================================
  {
    id: 'rule-virgula-sujeito-verbo',
    category: 'Pontuação / Sintaxe',
    pattern: /\b(eu|você|ele|ela|nós|vocês|eles|elas)\s*,\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+)\b/gi,
    replacementFn: (match, pron, verbo) => `${pron} ${verbo}`,
    message: 'Não se deve usar vírgula separando o sujeito do seu verbo.',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
  {
    id: 'rule-virgula-preposicao-substantivo',
    category: 'Pontuação / Sintaxe',
    pattern: /\b(a\s+um|a\s+uma|de\s+um|de\s+uma|em\s+um|em\s+uma)\s*,\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+)\b/gi,
    replacementFn: (match, prep, subst) => `${prep} ${subst}`,
    message: 'Não use vírgula separando a preposição/artigo do substantivo.',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
  {
    id: 'rule-maiuscula-indevida-meio-frase',
    category: 'Ortografia / Capitalização',
    pattern: /\b([a-zà-úç]{2,})\s+(Saía|Saí|Havia|Fazia|Ia|Estava|Comprei)\b/g,
    replacementFn: (match, p1, p2) => `${p1} ${p2.toLowerCase()}`,
    message: 'Palavra grafada com inicial maiúscula inadequada no meio da frase.',
    badgeStyle: 'bg-red-950/80 text-red-300 border-red-700/60',
  },

  // ==========================================
  // 2. REGÊNCIA VERBAL E PREPOSIÇÕES
  // ==========================================
  {
    id: 'rule-regencia-preferir-do-que',
    category: 'Regência Verbal',
    pattern: /\bpreferi(r|o|e|em|ia|iam|ndo)?\s+([^,]+?)\s+do\s+que\b/gi,
    replacementFn: (match) => match.replace(/\bdo\s+que\b/gi, 'a'),
    message: 'O verbo "preferir" exige a preposição "a" (ex: "preferir X a Y"), e não "do que".',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-regencia-chegar-em',
    category: 'Regência Verbal',
    pattern: /\bchega(r|ndo|do|m|u|ram)?\s+em\s+(casa|escola|praia|cidade|trabalho|loja)\b/gi,
    replacementFn: (match, flex, local) => match.replace(/\bem\b/i, 'a'),
    message: 'Verbos de movimento como "chegar" exigem a preposição "a" na norma culta ("chegar a casa").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
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
  // 3. CONCORDÂNCIA VERBAL, NOMINAL E NÚCLEO
  // ==========================================
  {
    id: 'rule-concordancia-nucleo-singular',
    category: 'Concordância Verbal',
    pattern: /\b(o|a)\s+(barulho|som|causa|motivo|origem|grupo|lista)\s+do(s)?|da(s)?\s+([a-zA-Záàâãéèêíóòôõúç]+s)\s+(também\s+)?(ajudavam|faziam|causavam|eram|estavam)\b/gi,
    replacementFn: (match) => {
      return match
        .replace(/\bajudavam\b/i, 'ajudava')
        .replace(/\bfaziam\b/i, 'fazia')
        .replace(/\bcausavam\b/i, 'causava')
        .replace(/\beram\b/i, 'era')
        .replace(/\bestavam\b/i, 'estava');
    },
    message: 'O núcleo do sujeito está no singular, o verbo deve concordar no singular.',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },
  {
    id: 'rule-concordancia-anexo-mensagem',
    category: 'Concordância Nominal',
    pattern: /\banexo\s+a\s+esta\s+(mensagem|carta|encomenda|pasta|folha)\b/gi,
    replacementFn: (match, subst) => `Anexa a esta ${subst}`,
    message: 'A palavra "anexo" funciona como adjetivo e deve concordar em gênero com o substantivo ("Anexa a esta mensagem").',
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
    id: 'rule-pessoas-nao-tinha',
    category: 'Concordância Verbal',
    pattern: /\b(os|as|eles|elas|pessoas)\s+(não\s+)?tinha\b/gi,
    replacementFn: (match) => match.replace(/tinha/i, 'tinham'),
    message: 'O sujeito no plural exige o verbo flexionado no plural ("tinham").',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },
  {
    id: 'rule-chegaram-a-vez',
    category: 'Concordância Verbal',
    pattern: /\bchegaram\s+(a|o)\s+(minha|sua|nossa|tua)\s+(vez|hora)\b/gi,
    replacementFn: (match, art, poss, subst) => `chegou ${art} ${poss} ${subst}`,
    message: 'O sujeito ("a minha vez") está no singular, logo o verbo deve concordar no singular ("chegou").',
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
  {
    id: 'rule-bastante-plural',
    category: 'Concordância Nominal',
    pattern: /\bbastante\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+s)\b/gi,
    replacementFn: (match, group1) => `bastantes ${group1}`,
    message: 'Quando acompanha um substantivo no plural, "bastante" flexiona para "bastantes".',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },

  // ==========================================
  // 4. SINTAXE, CORRELAÇÃO VERBAL E GERUNDISMO
  // ==========================================
  {
    id: 'rule-correlacao-subjuntivo-indicativo',
    category: 'Correlação Verbal',
    pattern: /\bse\s+eu\s+(previsse|soubesse|visse|pudesse)\b([^,.!?]+?)\beu\s+(fiquei|fui|fiz|comprei)\b/gi,
    replacementFn: (match, vSubj, meio, vInd) => {
      const fix = vInd === 'fiquei' ? 'teria ficado' : vInd === 'fui' ? 'teria ido' : 'teria feito';
      return `se eu ${vSubj}${meio}eu ${fix}`;
    },
    message: 'Incorrelação verbal: O pretérito imperfeito do subjuntivo ("se eu previsse") exige futuro do pretérito ("eu teria ficado").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-sintaxe-respondi-fazer-anos',
    category: 'Sintaxe / Conjunção',
    pattern: /\b(respondi|respondeu|disse|falou)\s+fazer\s+(anos|meses|dias)\b/gi,
    replacementFn: (match, verb, tempo) => `${verb} que fazia ${tempo}`,
    message: 'Construção sintática incompleta. O correto na norma culta é "respondi que fazia anos".',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-gerundismo-ia-estar',
    category: 'Vício de Linguagem / Gerundismo',
    pattern: /\b(ia|vai|vão|iam)\s+estar\s+([a-zA-Záàâãéèêíóòôõúç]+ndo)\b/gi,
    replacementFn: (match, aux, gerundio) => {
      const verboBase = gerundio.replace(/ndo$/, 'ra');
      return `vai ${verboBase}`;
    },
    message: 'Evite o gerundismo ("ia estar limpando"). Dê preferência a formas mais diretas ("limparia" ou "vai limpar").',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
  {
    id: 'rule-sujeito-pronome-redundante',
    category: 'Sintaxe / Pleonasmo',
    pattern: /\b(meu|minha|seu|sua|nosso|nossa)\s+([a-zA-Záàâãéèêíóòôõúç]+)\s+(ele|ela)\b/gi,
    replacementFn: (match, poss, subst) => `${poss} ${subst}`,
    message: 'Evite o uso do pronome redundante ("ele/ela") imediatamente após o sujeito.',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-proclise-apos-virgula',
    category: 'Colocação Pronominal',
    pattern: /(,\s+)(me|te|se|nos|lhe|lhes)\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+)/gi,
    replacementFn: (match, virg, pron, palavra) => {
      // Palavras que indicam que "se" é conjunção ou que não são verbos
      const naoVerbos = [
        'eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas',
        'você', 'vocês', 'o', 'a', 'os', 'as', 'alguém', 'ninguém',
        'tudo', 'nada', 'isso', 'isto', 'aquilo', 'este', 'esta', 'um', 'uma'
      ];

      // Se for a conjunção "se" seguida de pronome/substantivo, mantém o original (não altera)
      if (naoVerbos.includes(palavra.toLowerCase())) {
        return match;
      }

      return `${virg}${palavra}-${pron}`;
    },
    message: 'Evite o uso de pronome oblíquo átono (próclise) imediatamente após vírgula.',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },

  // ==========================================
  // 5. PARÔNIMOS, ESTILO E ACENTUAÇÃO
  // ==========================================
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
  {
    id: 'rule-aonde-estatico',
    category: 'Uso de Onde / Aonde',
    pattern: /\baonde\s+(deixei|moro|mora|estava|estou|fica|ficava|encontrei|deixou)\b/gi,
    replacementFn: (match, verbo) => `onde ${verbo}`,
    message: 'Para indicar permanência ou localização fixa, utilize "onde" em vez de "aonde".',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
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

  const occupiedRanges = existingSuggestions.map((s) => ({
    start: s.offset,
    end: s.offset + (s.length || s.original.length),
  }));

  const isRangeOccupied = (start, end) => {
    return occupiedRanges.some(
      (range) => (start >= range.start && start < range.end) || (end > range.start && end <= range.end)
    );
  };

  customRulesDatabase.forEach((rule) => {
    let match;
    rule.pattern.lastIndex = 0;

    while ((match = rule.pattern.exec(text)) !== null) {
      const matchStart = match.index;
      const matchLength = match[0].length;
      const matchEnd = matchStart + matchLength;

      if (isRangeOccupied(matchStart, matchEnd)) {
        continue;
      }

      const replacement = rule.replacementFn
        ? rule.replacementFn(match[0], match[1], match[2], match[3])
        : match[0];

      // TRAVA DE SEGURANÇA: Se a substituição for idêntica ao original, ignora (evita falso positivo)
      if (replacement === match[0]) {
        continue;
      }

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
