// src/lib/writing/customGrammarRules.js

/**
 * BASE DE REGRAS GRAMATICAIS E ORTOGRÁFICAS COMPLEMENTARES (GENERALIZADAS)
 */
export const customRulesDatabase = [
  // ==========================================
  // 1. CORREÇÃO DE BUGS E FLEXÕES INADEQUADAS
  // ==========================================
  {
    id: 'rule-fix-vai-infinitive-a',
    category: 'Sintaxe / Flexão Incorreta',
    pattern: /\b(vai|vão|ia|iam)\s+([a-zA-Záàâãéèêíóòôõúç]+r)a\b/gi,
    replacementFn: (match, aux, verb) => `${aux} ${verb}`,
    message: 'Construção verbal incorreta. O verbo principal deve permanecer no infinitivo (ex: "vai limpar", "vai resolver").',
    badgeStyle: 'bg-red-950/80 text-red-300 border-red-700/60',
  },

  // ==========================================
  // 2. PONTUAÇÃO, CAPITALIZAÇÃO E PARÔNIMOS
  // ==========================================
  {
    id: 'rule-artigo-dia-semana',
    category: 'Concordância Nominal / Gênero',
    pattern: /\b(um|este|o|naquele)\s+(segunda|terça|quarta|quinta|sexta)-feira\b/gi,
    replacementFn: (match, art, dia) => {
      const map = { um: 'uma', este: 'esta', o: 'a', naquele: 'naquela' };
      const newArt = map[art.toLowerCase()] || art;
      return `${newArt} ${dia}-feira`;
    },
    message: 'Os dias da semana terminados em "-feira" são substantivos femininos ("uma terça-feira").',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },
  {
    id: 'rule-virgula-sujeito-verbo',
    category: 'Pontuação / Sintaxe',
    pattern: /\b(eu|você|ele|ela|nós|vocês|eles|elas)\s*,\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+)\b/gi,
    replacementFn: (match, pron, verbo) => `${pron} ${verbo}`,
    message: 'Não se deve usar vírgula separando o sujeito do seu verbo.',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
  {
    id: 'rule-paronimo-sessao',
    category: 'Parônimos / Ortografia',
    pattern: /\b(seção|secção)\s+(bem\s+)?(interessante|legal|chata|longa|curta|de\s+cinema|do\s+cinema|de\s+filme|de\s+teatro|de\s+fotos|de\s+terapia|de\s+palestra|de\s+reunião)\b/gi,
    replacementFn: (match, sec, bem, comp) => `sessão ${bem || ''}${comp}`,
    message: 'Para eventos, reuniões, exibições ou intervalos de tempo, utilize "sessão" (com SS).',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },

  // ==========================================
  // 3. REGÊNCIA VERBAL E PREPOSIÇÕES
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
    pattern: /\bchega(r|ndo|do|m|u|ram|mos)?\s+(em|na|no|nas|nos)\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+)\b/gi,
    replacementFn: (match, flex, prep, local) => {
      const prepFix = prep === 'na' ? 'à' : prep === 'no' ? 'ao' : prep === 'nas' ? 'às' : prep === 'nos' ? 'aos' : 'a';
      return `chega${flex || ''} ${prepFix} ${local}`;
    },
    message: 'Verbos de movimento como "chegar" exigem a preposição "a" ou "ao/à" na norma culta ("chegar ao escritório").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-regencia-ir-no-na',
    category: 'Regência Verbal',
    pattern: /\b(foi|fomos|ir|irão|vai|fui)\s+(no|na)\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+)\b/gi,
    replacementFn: (match, verbo, prep, local) => {
      const novaprep = prep.toLowerCase() === 'no' ? 'ao' : 'à';
      return `${verbo} ${novaprep} ${local}`;
    },
    message: 'Verbos de movimento pedem a preposição "a" na norma-padrão ("ir ao shopping", "ir à praia").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-regencia-assisti-um',
    category: 'Regência Verbal',
    pattern: /\b(assisti|assistimos|assistiram|assistiu)\s+(um|uma)\b/gi,
    replacementFn: (match, verbo, art) => `${verbo} a ${art}`,
    message: 'No sentido de ver/presenciar, o verbo "assistir" exige a preposição "a" ("assistir a um").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },

  // ==========================================
  // 4. CONCORDÂNCIA VERBAL, NOMINAL E NÚCLEO
  // ==========================================
  {
    id: 'rule-ter-sentido-haver',
    category: 'Impessoalidade Verbal / Uso de Ter',
    pattern: /\b(tinha|tinham)\s+(muit[oa]s?|vári[oa]s|algun[s]|algumas|pouc[oa]s?|[0-9]+)\b/gi,
    replacementFn: (match, verbo, quant) => `havia ${quant}`,
    message: 'Na norma-padrão, utilize o verbo "haver" (no singular) para indicar existência ou presença ("Havia pessoas").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-a-gente-infinitivo-flexionado',
    category: 'Concordância de Pessoa',
    pattern: /\ba\s+gente\b([^.!?]*?)\b([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+)mos\b/gi,
    replacementFn: (match, meio, verboFlex) => {
      const verboInfinitivo = verboFlex.toLowerCase().replace(/mos$/, '');
      return `a gente${meio}${verboInfinitivo}`;
    },
    message: 'A expressão "a gente" exige o verbo na 3ª pessoa do singular ("a gente foi para comprar", e não "comprarmos").',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },
  {
    id: 'rule-um-ou-outro-singular',
    category: 'Concordância Verbal',
    pattern: /\bum\s+ou\s+outro\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+)\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+)(am|em)\b/gi,
    replacementFn: (match, subst, verbo, suf) => {
      const verboSingular = suf.toLowerCase() === 'am' ? `${verbo}a` : `${verbo}e`;
      return `um ou outro ${subst} ${verboSingular}`;
    },
    message: 'A expressão "um ou outro" acompanhada de substantivo exige o verbo no singular ("um ou outro funcionário demonstrava").',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },
  {
    id: 'rule-concordancia-nucleo-singular-geral',
    category: 'Concordância Verbal',
    pattern: /\b(o|a)\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+)\s+(dos|das|de)\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+s)\s+(também\s+)?(ajudavam|faziam|causavam|eram|estavam|demonstravam|atrapalhavam|afetavam)\b/gi,
    replacementFn: (match, art, nucleo, prep, adj, tambem, verboPlural) => {
      const mapSingular = {
        ajudavam: 'ajudava',
        faziam: 'fazia',
        causavam: 'causava',
        eram: 'era',
        estavam: 'estava',
        demonstravam: 'demonstrava',
        atrapalhavam: 'atrapalhava',
        afetavam: 'afetava',
      };
      const verboSingular = mapSingular[verboPlural.toLowerCase()] || verboPlural.replace(/m$/, '');
      const tambemText = tambem ? tambem : '';
      return `${art} ${nucleo} ${prep} ${adj} ${tambemText}${verboSingular}`;
    },
    message: 'O núcleo do sujeito está no singular, portanto o verbo deve concordar no singular.',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },
  {
    id: 'rule-fazerem-anos-impessoal',
    category: 'Impessoalidade Verbal',
    pattern: /\bfazerem\s+(anos|meses|dias|horas|semanas|décadas|séculos)\b/gi,
    replacementFn: (match, tempo) => `fazer ${tempo}`,
    message: 'O verbo "fazer" indicando tempo decorrido é impessoal e não flexiona para o plural ("fazer anos").',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },
  {
    id: 'rule-concordancia-anexo-genero',
    category: 'Concordância Nominal',
    pattern: /\b(anexo|anexa)\s+a\s+(esta|esta|este)\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+)\b/gi,
    replacementFn: (match, palavra, demonstrativo, subst) => {
      const isFem = subst.endsWith('ão') || subst.endsWith('a') || subst.endsWith('ade');
      const correctAnexo = isFem ? 'Anexa' : 'Anexo';
      const correctDemo = isFem ? 'esta' : 'este';
      return `${correctAnexo} a ${correctDemo} ${subst}`;
    },
    message: 'A palavra "anexo" concorda em gênero com o substantivo a que se refere ("Anexa a esta mensagem" / "Anexo a este e-mail").',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },

  // ==========================================
  // 5. SINTAXE, REDUNDÂNCIA E RELATIVOS
  // ==========================================
  {
    id: 'rule-redundancia-iam-irem',
    category: 'Redundância Verbal / Pleonasmo',
    pattern: /\b(iam|vão|vai|ia)\s+(irem|ir)\b/gi,
    replacementFn: (match, aux) => {
      const auxLower = aux.toLowerCase();
      if (auxLower === 'iam' || auxLower === 'ia') return 'iriam';
      return 'irão';
    },
    message: 'Evite a redundância da locução "ir + ir". Dê preferência a "iriam" ou "irão".',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-relativo-redundante-preposicionado',
    category: 'Sintaxe / Regência do Relativo',
    pattern: /\bque\s+([^,.!?]+?)\s+(fala|falou|falara|falavam|falaram|falado)\s+(dele|dela|deles|delas)\b/gi,
    replacementFn: (match, meio, verbo) => `de que ${meio} ${verbo}`,
    message: 'Em orações relativas, a preposição deve anteceder o pronome "que" (ex: "de que meu amigo falou"), evitando "dele/dela" no final.',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-pleonasmo-relativo-ele-ela',
    category: 'Sintaxe / Pleonasmo',
    pattern: /\bque\s+([^,.!?]+?)\s+(deu|trouxe|entregou|mostrou|enviou|indicou)\s+(ele|ela|eles|elas)\b/gi,
    replacementFn: (match, meio, verbo) => `que ${meio} ${verbo}`,
    message: 'Evite o pronome redundante ao final da oração relativa ("que ele me deu" em vez de "que ele me deu ele").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-sintaxe-respondi-fazer-anos',
    category: 'Sintaxe / Conjunção',
    pattern: /\b(respondi|respondeu|disse|falou|repliquei)\s+fazer\s+(anos|meses|dias)\b/gi,
    replacementFn: (match, verb, tempo) => `${verb} que fazia ${tempo}`,
    message: 'Construção sintática incompleta. O correto na norma culta é "respondi que fazia anos".',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },

  // ==========================================
  // 6. CORRELAÇÃO VERBAL E GERUNDISMO
  // ==========================================
  {
    id: 'rule-quando-cheguemos',
    category: 'Inadequação Verbal',
    pattern: /\bquando\s+cheguemos\b/gi,
    replacementFn: () => 'quando chegamos',
    message: 'Inadequação verbal: Use "quando chegamos" (pretérito/presente) ou "quando chegarmos" (futuro do subjuntivo).',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-correlacao-subjuntivo-havia-participio',
    category: 'Correlação Verbal',
    pattern: /\bse\s+([^,.!?]+?)\s+([a-zA-Záàâãéèêíóòôõúç]+sse)\b([^,.!?]+?)\b(eu|ele|ela|nós|você|eles|elas)\s+(havia|tinha)\s+([a-zA-Záàâãéèêíóòôõúç]+[dt]o)\b/gi,
    replacementFn: (match, p1, vSubj, p2, pron, vAux, part) => {
      return `se ${p1} ${vSubj}${p2}${pron} teria ${part}`;
    },
    message: 'O pretérito imperfeito do subjuntivo ("se eu previsse") exige o futuro do pretérito ("teria ficado"), e não "havia ficado".',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-gerundismo-ia-estar',
    category: 'Vício de Linguagem / Gerundismo',
    pattern: /\b(ia|vai|vão|iam)\s+estar\s+([a-zA-Záàâãéèêíóòôõúç]+ndo)\b/gi,
    replacementFn: (match, aux, gerundio) => {
      const infinitivo = gerundio.replace(/ndo$/i, 'r');
      const auxLower = aux.toLowerCase();

      if (auxLower === 'ia' || auxLower === 'iam') {
        return [`${infinitivo}ia`, `${auxLower} ${infinitivo}`];
      }
      return [`vai ${infinitivo}`];
    },
    message: 'Evite o gerundismo. Dê preferência a formas mais diretas e elegantes (ex: "vai limpar" em vez de "vai estar limpando").',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
  {
    id: 'rule-confusao-absorveu-sujeira',
    category: 'Confusão Lexical / Impropriedade Vocabular',
    pattern: /\b(absorveu|absorveram|absorvia)\s+([^,.!?]+?)\s+com\s+(lama|poeira|areia|sujeira|graxa|tinta)\b/gi,
    replacementFn: (match, verbo, objeto, elemento) => {
      return `impregnou ${objeto} com ${elemento}`;
    },
    message: 'A palavra "absorver" significa aspirar/sorver. Para indicar contaminação ou sujeira, prefira "impregnou", "cobriu" ou "sujou".',
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
    pattern: /\b(exceção|exceções)\s+de\s+([a-zA-Záàâãéèêíóòôõúç]+)\b/gi,
    replacementFn: (match, exc, termo) => `excesso de ${termo}`,
    message: 'Para indicar grande quantidade ou demasia, utilize "excesso" (e não "exceção").',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
];

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

      const repResult = rule.replacementFn
        ? rule.replacementFn(match[0], match[1], match[2], match[3], match[4], match[5], match[6])
        : match[0];

      const replacements = Array.isArray(repResult) ? repResult : [repResult];
      const replacement = replacements[0];

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
        replacements: replacements,
        message: rule.message,
        badgeStyle: rule.badgeStyle,
      });
    }
  });

  return customSuggestions;
}