// src/lib/writing/customGrammarRules.js
// Este arquivo contém a base unificada de regras gramaticais e ortográficas personalizadas para análise de texto no StoryForge.

/**
 * BASE DE REGRAS GRAMATICAIS E ORTOGRÁFICAS COMPLEMENTARES E GENERALIZADAS
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
  // 2. PONTUAÇÃO, CONECTIVOS E ADJUNTOS ADVERBIAIS
  // ==========================================
  {
    id: 'rule-virgula-adjunto-adverbial-inicio',
    category: 'Pontuação / Adjunto Adverbial Deslocado',
    pattern: /(?:^|[\.!\?]\s+)(Ontem|Anteontem|Hoje|Amanhã|Atualmente|Antigamente|De\s+repente|Por\s+fim|Finalmente|Em\s+seguida|Pouco\s+depois|Certa\s+vez|Certo\s+dia|Na\s+semana\s+passada|No\s+mês\s+passado|No\s+ano\s+passado)\s+([a-zA-Záàâãéèêíóòôõúç]+)\b/gi,
    replacementFn: (match, adv, prox) => {
      const matchTrimmed = match.trimStart();
      const prefix = match.substring(0, match.length - matchTrimmed.length);
      return `${prefix}${adv}, ${prox}`;
    },
    message: 'Adjuntos adverbiais no início de frases devem vir seguidos de vírgula para isolar o tempo/espaço deslocado (ex: "Ontem, fui").',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
  {
    id: 'rule-virgula-locucao-conectiva',
    category: 'Pontuação / Locução Conectiva',
    pattern: /\b(no\s+final\s+das\s+contas|por\s+outro\s+lado|no\s+entanto|além\s+disso|por\s+isso|portanto|em\s+resumo|por\s+exemplo)\s+([a-zA-Záàâãéèêíóòôõúç]+)\b/gi,
    replacementFn: (match, loc, prox) => `${loc}, ${prox}`,
    message: 'Locuções explicativas ou conjuntivas no meio do período devem ser seguidas de vírgula.',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
  {
    id: 'rule-virgula-sujeito-verbo',
    category: 'Pontuação / Sintaxe',
    pattern: /\b(eu|você|ele|ela|nós|vocês|eles|elas)\s*,\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+)\b/gi,
    replacementFn: (match, pron, verbo) => `${pron} ${verbo}`,
    message: 'Não se deve usar vírgula separando o sujeito do seu verbo.',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },

  // ==========================================
  // 3. GRAFIA INCORRETA, PARÔNIMOS E EXPRESSÕES
  // ==========================================
  {
    id: 'rule-derrepente-junto',
    category: 'Ortografia / Grafia Incorreta',
    pattern: /\bderrepente\b/gi,
    replacementFn: () => 'de repente',
    message: 'A locução adverbial escreve-se separada: "de repente".',
    badgeStyle: 'bg-red-950/80 text-red-300 border-red-700/60',
  },
  {
    id: 'rule-concerteza-junto',
    category: 'Ortografia / Grafia Incorreta',
    pattern: /\bconcerteza\b/gi,
    replacementFn: () => 'com certeza',
    message: 'A expressão escreve-se separada: "com certeza".',
    badgeStyle: 'bg-red-950/80 text-red-300 border-red-700/60',
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
    id: 'rule-paronimo-sessao',
    category: 'Parônimos / Ortografia',
    pattern: /\b(seção|secção)\s+(bem\s+)?(interessante|legal|chata|longa|curta|de\s+cinema|do\s+cinema|de\s+filme|de\s+teatro|de\s+fotos|de\s+terapia|de\s+palestra|de\s+reunião)\b/gi,
    replacementFn: (match, sec, bem, comp) => `sessão ${bem || ''}${comp}`,
    message: 'Para eventos, reuniões, exibições ou intervalos de tempo, utilize "sessão" (com SS).',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
  {
    id: 'rule-vocabulario-chef-cozinha',
    category: 'Impropriedade Vocabular / Contexto',
    pattern: /\b(grande|excelente|bom|renomado|famoso|mestre)\s+chefe\b/gi,
    replacementFn: (match, adj) => `${adj} chef`,
    message: 'No contexto de gastronomia e culinária, utiliza-se a palavra "chef" (ou "cozinheiro"), reservando "chefe" para liderança hierárquica.',
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

  // ==========================================
  // 4. CONFUSÃO LEXICAL: HÁ vs A (TEMPO DECORRIDO)
  // ==========================================
  {
    id: 'rule-ha-tempo-decorrido-quantificadores',
    category: 'Confusão Lexical / Há vs A',
    pattern: /\ba\s+(poucos|alguns|vários|muitos|bastantes|[0-9]+)\s+(dias|meses|anos|semanas|horas|minutos|décadas|séculos)\b/gi,
    replacementFn: (match, quant, tempo) => `há ${quant} ${tempo}`,
    message: 'Para indicar tempo decorrido no passado (equivalente a "faz X tempo"), utilize o verbo haver ("há").',
    badgeStyle: 'bg-red-950/80 text-red-300 border-red-700/60',
  },
  {
    id: 'rule-ha-muito-tempo',
    category: 'Confusão Lexical / Há vs A',
    pattern: /\ba\s+muito\s+tempo\b/gi,
    replacementFn: () => 'há muito tempo',
    message: 'Na indicação de tempo passado decorrido, utiliza-se "há muito tempo".',
    badgeStyle: 'bg-red-950/80 text-red-300 border-red-700/60',
  },

  // ==========================================
  // 5. PRONOMES, SUJEITO E REGÊNCIA SENSITIVA
  // ==========================================
  {
    id: 'rule-para-mim-infinitivo',
    category: 'Sintaxe / Uso do Pronome Mim',
    pattern: /\bpara\s+mim\s+([a-zA-Záàâãéèêíóòôõúç]+r)\b/gi,
    replacementFn: (match, verbo) => `para eu ${verbo}`,
    message: 'O pronome "mim" não executa ação. Antes de verbo no infinitivo indicando a ação do sujeito, utilize "eu" ("para eu poder", "para eu fazer").',
    badgeStyle: 'bg-red-950/80 text-red-300 border-red-700/60',
  },
  {
    id: 'rule-ver-eu-infinitivo',
    category: 'Sintaxe / Regência Sensitiva',
    pattern: /\b(ver|ouvir|sentir|deixar|fazer)\s+eu\s+([a-zA-Záàâãéèêíóòôõúç]+)\b/gi,
    replacementFn: (match, vSens, vPrinc) => `me ${vSens} ${vPrinc}`,
    message: 'Na norma-padrão, utilize o pronome oblíquo com verbos sensitivos ou causativos ("me ver passar" ou "ver-me passar").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-entre-eu-e-voce',
    category: 'Sintaxe / Regência de Pronome Regido por Preposição',
    pattern: /\bentre\s+eu\s+e\s+(você|ele|ela|eles|elas|mim)\b/gi,
    replacementFn: (match, outro) => `entre mim e ${outro}`,
    message: 'Após preposição (como "entre"), deve-se usar o pronome mim ("entre mim e você").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },

  // ==========================================
  // 6. CONCORDÂNCIA NOMINAL, NUMERAIS E HORAS
  // ==========================================
  {
    id: 'rule-meia-noite-e-meia',
    category: 'Concordância Nominal / Numerais',
    pattern: /\bmeia-noite\s+e\s+meio\b/gi,
    replacementFn: () => 'meia-noite e meia',
    message: 'A palavra "meia" concorda no feminino com a palavra subentendida "hora" ("meia-noite e meia hora").',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },
  {
    id: 'rule-meio-dia-e-meia',
    category: 'Concordância Nominal / Numerais',
    pattern: /\bmeio-dia\s+e\s+meio\b/gi,
    replacementFn: () => 'meio-dia e meia',
    message: 'Para indicar doze horas e trinta minutos, utilize "meio-dia e meia" (meia hora).',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },
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
    id: 'rule-concordancia-anexo-genero',
    category: 'Concordância Nominal',
    pattern: /\b(anexo|anexa)\s+a\s+(esta|este)\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+)\b/gi,
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
  // 7. CRASE (PROIBIDA E OBRIGATÓRIA)
  // ==========================================
  {
    id: 'rule-crase-antes-de-artigo-indefinido',
    category: 'Regência Verbal / Crase Proibida',
    pattern: /\b(assistir|assistiram|assistia|assistindo|ir|fui|foi|fomos|ver)\s+à\s+(um|uma|uns|umas)\b/gi,
    replacementFn: (match, verbo, art) => `${verbo} a ${art}`,
    message: 'Não ocorre crase antes de artigos indefinidos ("assistir a um filme").',
    badgeStyle: 'bg-red-950/80 text-red-300 border-red-700/60',
  },
  {
    id: 'rule-crase-antes-de-verbo',
    category: 'Crase Proibida / Antes de Verbo',
    pattern: /\bà\s+([a-zA-Záàâãéèêíóòôõúç]+r)\b/gi,
    replacementFn: (match, verboInfinitive) => `a ${verboInfinitive}`,
    message: 'Não se usa crase antes de verbos no infinitivo ("a partir de", "a começar").',
    badgeStyle: 'bg-red-950/80 text-red-300 border-red-700/60',
  },
  {
    id: 'rule-crase-antes-de-palavra-masculina',
    category: 'Crase Proibida / Antes de Masculino',
    pattern: /\bà\s+(passo|caminho|prazo|pé|cavalo|respeito|favor|lado|fim|modo|gosto)\b/gi,
    replacementFn: (match, substMasculino) => `a ${substMasculino}`,
    message: 'Não ocorre crase antes de palavras masculinas ("a caminho", "a prazo", "a pé").',
    badgeStyle: 'bg-red-950/80 text-red-300 border-red-700/60',
  },
  {
    id: 'rule-a-ponto-de-crase',
    category: 'Crase Proibida',
    pattern: /\bà\s+ponto\s+de\b/gi,
    replacementFn: () => 'a ponto de',
    message: 'A locução "a ponto de" não leva crase.',
    badgeStyle: 'bg-red-950/80 text-red-300 border-red-700/60',
  },

  // ==========================================
  // 8. SUBJUNTIVO IRREGULAR E FLEXÃO VERBAL
  // ==========================================
  {
    id: 'rule-se-eu-ver-subjuntivo',
    category: 'Flexão Verbal / Subjuntivo Irregular',
    pattern: /\bse\s+(eu|você|ele|ela|nós|eles|elas)\s+ver\b/gi,
    replacementFn: (match, pron) => `se ${pron} vir`,
    message: 'O futuro do subjuntivo do verbo "ver" é "vir" ("se eu vir você amanhã").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-se-eu-ter-subjuntivo',
    category: 'Flexão Verbal / Subjuntivo Irregular',
    pattern: /\bse\s+(eu|você|ele|ela|nós|eles|elas)\s+ter\b/gi,
    replacementFn: (match, pron) => `se ${pron} tiver`,
    message: 'O futuro do subjuntivo do verbo "ter" é "tiver" ("se eu tiver tempo").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-se-eu-propor-subjuntivo',
    category: 'Flexão Verbal / Subjuntivo Irregular',
    pattern: /\bse\s+(eu|você|ele|ela|nós|eles|elas)\s+propor\b/gi,
    replacementFn: (match, pron) => `se ${pron} propuser`,
    message: 'O futuro do subjuntivo do verbo "propor" é "propuser" ("se ele propuser algo").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-se-eu-manter-subjuntivo',
    category: 'Flexão Verbal / Subjuntivo Irregular',
    pattern: /\bse\s+(eu|você|ele|ela|nós|eles|elas)\s+manter\b/gi,
    replacementFn: (match, pron) => `se ${pron} mantiver`,
    message: 'O futuro do subjuntivo do verbo "manter" é "mantiver" ("se ela mantiver a palavra").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-quando-cheguemos',
    category: 'Inadequação Verbal',
    pattern: /\bquando\s+cheguemos\b/gi,
    replacementFn: () => 'quando chegamos',
    message: 'Inadequação verbal: Use "quando chegamos" (pretérito/presente) ou "quando chegarmos" (futuro do subjuntivo).',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },

  // ==========================================
  // 9. IMPESSOALIDADE VERBAL E CONCORDÂNCIA VERBAL
  // ==========================================
  {
    id: 'rule-houveram-problemas',
    category: 'Impessoalidade Verbal / Verbo Haver',
    pattern: /\bhouveram\s+([a-zA-Záàâãéèêíóòôõúç]+s)\b/gi,
    replacementFn: (match, substPlural) => `houve ${substPlural}`,
    message: 'No sentido de existir ou ocorrer, o verbo "haver" é impessoal e deve ser usado no singular ("houve problemas").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-fazem-anos-impessoal',
    category: 'Impessoalidade Verbal / Verbo Fazer',
    pattern: /\bfazem\s+([0-9]+|muitos|poucos|alguns|vários)\s+(anos|dias|meses|semanas)\b/gi,
    replacementFn: (match, quant, tempo) => `faz ${quant} ${tempo}`,
    message: 'Indicando tempo decorrido, o verbo "fazer" é impessoal e não vai para o plural ("faz três anos").',
    badgeStyle: 'bg-red-950/80 text-red-300 border-red-700/60',
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
    id: 'rule-ter-sentido-haver',
    category: 'Impessoalidade Verbal / Uso de Ter',
    pattern: /\b(tinha|tinham)\s+(muit[oa]s?|vári[oa]s|algun[s]|algumas|pouc[oa]s?|[0-9]+)\b/gi,
    replacementFn: (match, verbo, quant) => `havia ${quant}`,
    message: 'Na norma-padrão, utilize o verbo "haver" para indicar existência ou presença ("Havia pessoas").',
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

  // ==========================================
  // 10. REGÊNCIA VERBAL E PREPOSIÇÕES
  // ==========================================
  {
    id: 'rule-regencia-assisti-um',
    category: 'Regência Verbal',
    // Não sinaliza se o verbo já estiver seguido por preposição/artigo correto ("assistir a um", "assistir ao")
    pattern: /\b(assisti|assistimos|assistiram|assistiu|assistir)\s+(o|os|a|as|um|uma|uns|umas)\b(?!\s+(?:um|uma|uns|umas|outro|outra|esta|este|ao|à))/gi,
    replacementFn: (match, verbo, art) => {
      const artLower = art.toLowerCase();
      const prepMap = {
        o: 'ao',
        os: 'aos',
        a: 'à',
        as: 'às',
        um: 'a um',
        uma: 'a uma',
        uns: 'a uns',
        umas: 'a umas',
      };
      return `${verbo} ${prepMap[artLower] || art}`;
    },
    message: 'No sentido de ver ou presenciar, o verbo "assistir" exige a preposição "a" (ex: "assistir a um filme", "assistir ao jogo").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-implicar-em',
    category: 'Regência Verbal',
    pattern: /\bimplica(r|u|am|va|m)?\s+em\b/gi,
    replacementFn: (match, suf) => `implica${suf || ''}`,
    message: 'No sentido de acarretar/causar, o verbo "implicar" é transitivo direto e não exige a preposição "em".',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-namorar-com',
    category: 'Regência Verbal',
    pattern: /\bnamora(r|ndo|u|am|va|m)?\s+com\b/gi,
    replacementFn: (match, suf) => `namora${suf || ''}`,
    message: 'O verbo "namorar" é transitivo direto e não exige a preposição "com" ("namorar alguém").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
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

  // ==========================================
  // 11. VÍCIOS DE LINGUAGEM, GERUNDISMO E PLEONASMO
  // ==========================================
  {
    id: 'rule-expressao-fazendo-de-conta',
    category: 'Sintaxe / Incoerência Verbal',
    pattern: /\b(estava|estavam|estávamos|fiquei|ficou|ficavam)\s+(?:[a-zA-Záàâãéèêíóòôõúç]+\s+)*(faça|faz)\s+de\s+conta\b/gi,
    replacementFn: (match) => match.replace(/\b(faça|faz)\s+de\s+conta\b/i, 'fazendo de conta'),
    message: 'Incoerência no tempo verbal da oração. O correto em narrativas no passado é utilizar "fazendo de conta".',
    badgeStyle: 'bg-red-950/80 text-red-300 border-red-700/60',
  },
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
    id: 'rule-ao-meu-ver',
    category: 'Vício de Linguagem / Expressão Incorreta',
    pattern: /\bao\s+meu\s+ver\b/gi,
    replacementFn: () => 'a meu ver',
    message: 'A expressão consagrada na norma culta é "a meu ver" (sem a letra "o").',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
  {
    id: 'rule-a-nivel-de',
    category: 'Vício de Linguagem',
    pattern: /\ba\s+nível\s+de\b/gi,
    replacementFn: () => 'em nível de',
    message: 'Evite "a nível de". Utilize "em nível de" ou "no âmbito de".',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
  {
    id: 'rule-mais-grande',
    category: 'Gramática / Comparativo Incorreto',
    pattern: /\bmais\s+grande\b/gi,
    replacementFn: () => 'maior',
    message: 'Utilize a forma sintética "maior" para comparações gerais.',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
  {
    id: 'rule-mais-pequeno',
    category: 'Gramática / Comparativo Incorreto',
    pattern: /\bmais\s+pequeno\b/gi,
    replacementFn: () => 'menor',
    message: 'Utilize a forma sintética "menor" para comparações gerais.',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
];

export function analyzeCustomGrammarRules(text, existingSuggestions = []) {
  if (!text || text.trim().length < 3) return [];

  const customSuggestions = [];

  // Mapeia regiões ocupadas por sugestões para evitar sobreposição de alertas
  const occupiedRanges = existingSuggestions.map((s) => ({
    start: s.offset,
    end: s.offset + (s.length || s.original?.length || 0),
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