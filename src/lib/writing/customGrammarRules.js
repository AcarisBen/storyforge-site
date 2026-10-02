// src/lib/writing/customGrammarRules.js
// Base unificada, avançada e categorizada por cores de alto contraste para tema escuro.

/**
 * PALETA DE CORES COM BADGE E HIGHLIGHT CORRESPONDENTES
 */
const COLOR_PALETTE = {
  RED: {
    badge: 'bg-red-500/20 text-red-300 border border-red-500/50',
    highlight: 'border-b-2 border-red-500 border-dashed bg-red-500/10 text-red-200 cursor-pointer',
  },
  ORANGE: {
    badge: 'bg-orange-500/20 text-orange-300 border border-orange-500/50',
    highlight: 'border-b-2 border-orange-500 border-dashed bg-orange-500/10 text-orange-200 cursor-pointer',
  },
  AMBER: {
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/50',
    highlight: 'border-b-2 border-amber-500 border-dashed bg-amber-500/10 text-amber-200 cursor-pointer',
  },
  GREEN: {
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50',
    highlight: 'border-b-2 border-emerald-500 border-dashed bg-emerald-500/10 text-emerald-200 cursor-pointer',
  },
  CYAN: {
    badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50',
    highlight: 'border-b-2 border-cyan-500 border-dashed bg-cyan-500/10 text-cyan-200 cursor-pointer',
  },
  SKY: {
    badge: 'bg-sky-500/20 text-sky-300 border border-sky-500/50',
    highlight: 'border-b-2 border-sky-500 border-dashed bg-sky-500/10 text-sky-200 cursor-pointer',
  },
  INDIGO: {
    badge: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50',
    highlight: 'border-b-2 border-indigo-500 border-dashed bg-indigo-500/10 text-indigo-200 cursor-pointer',
  },
  PURPLE: {
    badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/50',
    highlight: 'border-b-2 border-purple-500 border-dashed bg-purple-500/10 text-purple-200 cursor-pointer',
  },
  PINK: {
    badge: 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/50',
    highlight: 'border-b-2 border-fuchsia-500 border-dashed bg-fuchsia-500/10 text-fuchsia-200 cursor-pointer',
  },
  LIME: {
    badge: 'bg-lime-500/20 text-lime-300 border border-lime-500/50',
    highlight: 'border-b-2 border-lime-500 border-dashed bg-lime-500/10 text-lime-200 cursor-pointer',
  },
};

// Mapeia BADGE_STYLES para COLOR_PALETTE para manter compatibilidade com as regras existentes
const BADGE_STYLES = COLOR_PALETTE;

export const customRulesDatabase = [
  // ==========================================
  // 1. INFORMALIDADE, ESTILO E VÍCIOS (ROXO)
  // ==========================================
  {
    id: 'rule-fix-pro-pra-estrito',
    category: 'Linguagem Formal',
    pattern: /\b(pro|pros|pra|pras)\b/gi,
    replacementFn: (match) => {
      const lower = match.toLowerCase();
      const map = { pro: 'para o', pros: 'para os', pra: 'para a', pras: 'para as' };
      return map[lower] || match;
    },
    message: 'Em contextos formais ou narrativos, prefira utilizar a forma não contraída ("para o", "para a").',
    badgeStyle: BADGE_STYLES.PURPLE,
  },
  {
    id: 'rule-o-mesmo-substituindo-pronome',
    category: 'Estilo / Vício de Linguagem',
    pattern: /\b(e|onde|no\s+qual|na\s+qual)\s+o\s+mesmo\s+(foi|estava|tinha|disse|fez|ficou)\b/gi,
    replacementFn: (match, prep, verb) => `${prep} ele ${verb}`,
    message: 'Evite utilizar "o mesmo" para substituir pessoas ou objetos. Dê preferência a pronomes pessoais ("ele", "este").',
    badgeStyle: BADGE_STYLES.PURPLE,
  },
  {
    id: 'rule-gerundismo-ia-estar',
    category: 'Vício de Linguagem / Gerundismo',
    pattern: /\b(ia|vai|vão|iam)\s+estar\s+([a-zA-Záàâãéèêíóòôõúç]+ndo)\b/gi,
    replacementFn: (match, aux, gerundio) => {
      const infinitivo = gerundio.replace(/ndo$/i, 'r');
      const auxLower = aux.toLowerCase();
      return auxLower === 'ia' || auxLower === 'iam' ? [`${infinitivo}ia`, `${auxLower} ${infinitivo}`] : [`vai ${infinitivo}`];
    },
    message: 'Evite o gerundismo. Dê preferência a formas mais diretas e elegantes (ex: "vai limpar").',
    badgeStyle: BADGE_STYLES.PURPLE,
  },
  {
    id: 'rule-ao-meu-ver',
    category: 'Vício de Linguagem / Expressão Incorreta',
    pattern: /\bao\s+meu\s+ver\b/gi,
    replacementFn: () => 'a meu ver',
    message: 'A expressão consagrada na norma culta é "a meu ver" (sem a letra "o").',
    badgeStyle: BADGE_STYLES.PURPLE,
  },
  {
    id: 'rule-mais-grande',
    category: 'Gramática / Comparativo Incorreto',
    pattern: /\bmais\s+grande\b/gi,
    replacementFn: () => 'maior',
    message: 'Utilize a forma sintética "maior" para comparações gerais.',
    badgeStyle: BADGE_STYLES.PURPLE,
  },

  // ==========================================
  // 2. PLEONASMOS E REDUNDÂNCIAS (PINK / MAGENTA VIBRANTE)
  // ==========================================
  {
    id: 'rule-ha-anos-atras',
    category: 'Pleonasmo / Redundância',
    pattern: /\bhá\s+([^,.!?]+?)\s+atrás\b/gi,
    replacementFn: (match, tempo) => `há ${tempo}`,
    message: 'Redundância temporal. O verbo "há" já indica tempo decorrido, tornando o uso de "atrás" pleonástico (ex: "há três anos").',
    badgeStyle: BADGE_STYLES.PINK,
  },
  {
    id: 'rule-subir-para-cima-descer-baixo',
    category: 'Pleonasmo / Redundância',
    pattern: /\b(subir\s+para\s+cima|descer\s+para\s+baixo|entrar\s+para\s+dentro|sair\s+para\s+fora)\b/gi,
    replacementFn: (match) => match.split(' ')[0],
    message: 'Pleonasmo vicioso. Verbos de direção já trazem o sentido do movimento.',
    badgeStyle: BADGE_STYLES.PINK,
  },
  {
    id: 'rule-elo-de-ligacao',
    category: 'Pleonasmo / Redundância',
    pattern: /\belo\s+de\s+ligação\b/gi,
    replacementFn: () => 'elo',
    message: 'Redundância. Todo "elo" já é por definição uma ligação.',
    badgeStyle: BADGE_STYLES.PINK,
  },
  {
    id: 'rule-encarar-de-frente',
    category: 'Pleonasmo / Redundância',
    pattern: /\b(encarar|encarou|encarava)\s+de\s+frente\b/gi,
    replacementFn: (match, verb) => `${verb}`,
    message: 'Redundância. O verbo "encarar" já significa olhar/enfrentar de frente.',
    badgeStyle: BADGE_STYLES.PINK,
  },

  // ==========================================
  // 3. CACOFONIA E SONORIDADE (CIANO ELÉTRICO)
  // ==========================================
  {
    id: 'rule-cacofonia-vi-ela',
    category: 'Cacofonia / Fluidez Sonora',
    pattern: /\bvi\s+ela\b/gi,
    replacementFn: () => 'a vi',
    message: 'Cacofonia sonora ("viela"). Dê preferência ao pronome oblíquo: "a vi" ou "vi-a".',
    badgeStyle: BADGE_STYLES.CYAN,
  },
  {
    id: 'rule-cacofonia-por-cada',
    category: 'Cacofonia / Fluidez Sonora',
    pattern: /\bpor\s+cada\b/gi,
    replacementFn: () => 'para cada',
    message: 'Sonoridade truncada em textos formais/literários. Prefira utilizar "para cada" ou "por".',
    badgeStyle: BADGE_STYLES.CYAN,
  },
  {
    id: 'rule-cacofonia-uma-mao',
    category: 'Cacofonia / Fluidez Sonora',
    pattern: /\buma\s+mão\b/gi,
    replacementFn: () => 'uma das mãos',
    message: 'Atenção ao efeito sonoro de cacofonia ("mamão"). Considere reformular para "uma das mãos" ou "a mão".',
    badgeStyle: BADGE_STYLES.CYAN,
  },

  // ==========================================
  // 4. PREFIXOS, HÍFEN E CONJUNÇÕES (VERDE LIMA)
  // ==========================================
  {
    id: 'rule-senao-condicional-se-nao',
    category: 'Sintaxe / Se não vs Senão',
    pattern: /\bsenão\s+(chover|for|puder|quiser|fizer|tiver|houver|estiver)\b/gi,
    replacementFn: (match, verb) => `se não ${verb}`,
    message: 'Para exprimir condição ("caso não"), escreve-se separado: "se não". "Senão" significa "caso contrário" ou "a não ser".',
    badgeStyle: BADGE_STYLES.LIME,
  },
  {
    id: 'rule-prefixo-pos-pre-sem-hifen',
    category: 'Hifenização / Prefixos',
    pattern: /\b(pos|pre|pro)\s+(graduação|graduado|requisito|conceito|existente|ocupado|moderno)\b/gi,
    replacementFn: (match, pref, subst) => {
      const map = { pos: 'pós', pre: 'pré', pro: 'pró' };
      return `${map[pref.toLowerCase()] || pref}-${subst}`;
    },
    message: 'Prefixos tónicos com acento (pós, pré, pró) exigem hífen antes do segundo elemento (ex: "pós-graduação").',
    badgeStyle: BADGE_STYLES.LIME,
  },
  {
    id: 'rule-crase-proibida-antes-de-todos',
    category: 'Crase Proibida',
    pattern: /\bà\s+(todos|todas)\b/gi,
    replacementFn: (match, pr) => `a ${pr}`,
    message: 'Não se usa crase antes de pronomes indefinidos no masculino ou plural ("a todos").',
    badgeStyle: BADGE_STYLES.LIME,
  },

  // ==========================================
  // 5. REGÊNCIA VERBAL E SINTAXE (ANIL / ÍNDIGO)
  // ==========================================
  {
    id: 'rule-fix-vai-infinitive-a',
    category: 'Sintaxe / Flexão Incorreta',
    pattern: /\b(vai|vão|ia|iam)\s+([a-zA-Záàâãéèêíóòôõúç]+r)a\b/gi,
    replacementFn: (match, aux, verb) => `${aux} ${verb}`,
    message: 'Construção verbal incorreta. O verbo principal deve permanecer no infinitivo (ex: "vai limpar").',
    badgeStyle: BADGE_STYLES.INDIGO,
  },
  {
    id: 'rule-causativo-pronome-reto-infinitivo',
    category: 'Sintaxe / Verbo Causativo',
    pattern: /\b(fazer|fazendo|fez|faria|deixar|deixando|deixou|ver|vendo|viu|ouvir|ouvindo|ouviu|sentir|sentindo|sentiu)\s+(eu|tu|ele|ela|nós|eles|elas)\s+([a-zA-Záàâãéèêíóòôõúç]+r)\b/gi,
    replacementFn: (match, vCaus, pron, vInf) => {
      const pronMap = { eu: 'me', tu: 'te', ele: 'o', ela: 'a', nós: 'nos', eles: 'os', elas: 'as' };
      const obl = pronMap[pron.toLowerCase()] || pron;
      return `${vCaus}-${obl} ${vInf}`;
    },
    message: 'Com verbos causativos ou sensitivos regendo infinitivo, utilize o pronome oblíquo na norma-padrão (ex: "fazendo-me dar").',
    badgeStyle: BADGE_STYLES.INDIGO,
  },
  {
    id: 'rule-proclise-inicio-frase-dialogo',
    category: 'Sintaxe / Colocação Pronominal',
    pattern: /(?:^|[\.\!\?\:"“«\,]\s*|(?:^|\s+)e\s+)(me|te|se|nos|lhe|lhes)\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+)\b/gi,
    replacementFn: (match, pron, verbo) => {
      const matchTrimmed = match.trimStart();
      const prefix = match.substring(0, match.length - matchTrimmed.length);
      return `${prefix}${verbo}-${pron}`;
    },
    message: 'Pela gramática normativa, não se inicia frase ou oração sem palavra atrativa com pronome oblíquo (ex: "empresta-me").',
    badgeStyle: BADGE_STYLES.INDIGO,
  },
  {
    id: 'rule-nao-contracao-preposicao-sujeito-infinitivo',
    category: 'Sintaxe / Contração Indevida',
    pattern: /\b(antes|depois|apesar|em\s+vez|no\s+caso)\s+d(o|a|os|as)\s+([^,.!?]+?)\s+([a-zA-Záàâãéèêíóòôõúç]+r)\b/gi,
    replacementFn: (match, prep, art, sujeit, vInf) => `${prep} de ${art} ${sujeit} ${vInf}`,
    message: 'Quando o termo introduzido é sujeito de um verbo no infinitivo, a preposição "de" não deve ser contraída com o artigo na norma culta (ex: "antes de o horário... começar").',
    badgeStyle: BADGE_STYLES.INDIGO,
  },
  {
    id: 'rule-regencia-obedecer-desobedecer',
    category: 'Regência Verbal',
    pattern: /\b(obedece|obedecer|obedecia|obedeceram|obedeci|desobedece|desobedecer)\s+(o|os)\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+)\b/gi,
    replacementFn: (match, verb, art, subst) => `${verb} ${art.toLowerCase() === 'o' ? 'ao' : 'aos'} ${subst}`,
    message: 'Os verbos "obedecer" e "desobedecer" exigem complemento regido pela preposição "a" (ex: "obedecer ao regulamento").',
    badgeStyle: BADGE_STYLES.INDIGO,
  },
  {
    id: 'rule-regencia-visar-aspirar',
    category: 'Regência Verbal',
    pattern: /\b(visa|visar|visava|aspira|aspirar|aspirava)\s+(o|um)\s+(cargo|posto|vaga|emprego|sucesso|objetivo|topo|lugar)\b/gi,
    replacementFn: (match, verb, art, subst) => `${verb} ${art.toLowerCase() === 'o' ? 'ao' : 'a um'} ${subst}`,
    message: 'No sentido de almejar ou ter como objetivo, os verbos "visar" e "aspirar" exigem a preposição "a".',
    badgeStyle: BADGE_STYLES.INDIGO,
  },
  {
    id: 'rule-simpatizar-nao-pronominal',
    category: 'Regência Verbal',
    pattern: /\b(me|se|nos)\s+(simpatizei|simpatizou|simpatizam|antipatizei|antipatizou)\b/gi,
    replacementFn: (match, pron, verb) => `${verb}`,
    message: 'Os verbos "simpatizar" e "antipatizar" não são pronominais na norma culta (diga "simpatizei com ele", e não "me simpatizei").',
    badgeStyle: BADGE_STYLES.INDIGO,
  },
  {
    id: 'rule-para-mim-infinitivo',
    category: 'Sintaxe / Uso do Pronome Mim',
    pattern: /\bpara\s+mim\s+([a-zA-Záàâãéèêíóòôõúç]+r)\b/gi,
    replacementFn: (match, verbo) => `para eu ${verbo}`,
    message: 'O pronome "mim" não executa ação. Antes de verbo no infinitivo indicando a ação do sujeito, utilize "eu" ("para eu poder").',
    badgeStyle: BADGE_STYLES.INDIGO,
  },
  {
    id: 'rule-entre-eu-e-voce',
    category: 'Sintaxe / Regência de Pronome Regido por Preposição',
    pattern: /\bentre\s+eu\s+e\s+(você|ele|ela|eles|elas|mim)\b/gi,
    replacementFn: (match, outro) => `entre mim e ${outro}`,
    message: 'Após preposição (como "entre"), deve-se usar o pronome mim ("entre mim e você").',
    badgeStyle: BADGE_STYLES.INDIGO,
  },
  {
    id: 'rule-regencia-assisti-um',
    category: 'Regência Verbal',
    pattern: /\b(assisti|assistimos|assistiram|assistiu|assistir)\s+(o|os|a|as|um|uma|uns|umas)\b(?!\s+(?:um|uma|uns|umas|outro|outra|esta|este|ao|à))/gi,
    replacementFn: (match, verbo, art) => {
      const artLower = art.toLowerCase();
      const prepMap = { o: 'ao', os: 'aos', a: 'à', as: 'às', um: 'a um', uma: 'a uma', uns: 'a uns', umas: 'a umas' };
      return `${verbo} ${prepMap[artLower] || art}`;
    },
    message: 'No sentido de ver ou presenciar, o verbo "assistir" exige a preposição "a" (ex: "assistir a um filme", "assistir ao jogo").',
    badgeStyle: BADGE_STYLES.INDIGO,
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
    badgeStyle: BADGE_STYLES.INDIGO,
  },

  // ==========================================
  // 6. PONTUAÇÃO E ACENTUAÇÃO (LARANJA)
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
    message: 'Adjuntos adverbiais no início de frases devem vir seguidos de vírgula (ex: "Ontem, fui").',
    badgeStyle: BADGE_STYLES.ORANGE,
  },
  {
    id: 'rule-virgula-locucao-conectiva',
    category: 'Pontuação / Locução Conectiva',
    pattern: /\b(no\s+final\s+das\s+contas|por\s+outro\s+lado|no\s+entanto|além\s+disso|por\s+isso|portanto|em\s+resumo|por\s+exemplo)\s+([a-zA-Záàâãéèêíóòôõúç]+)\b/gi,
    replacementFn: (match, loc, prox) => `${loc}, ${prox}`,
    message: 'Locuções explicativas ou conjuntivas no meio do período devem ser seguidas de vírgula.',
    badgeStyle: BADGE_STYLES.ORANGE,
  },

  // ==========================================
  // 7. CONCORDÂNCIA VERBAL E NOMINAL (VERDE ESMERALDA)
  // ==========================================
  {
    id: 'rule-mais-de-um-singular',
    category: 'Concordância Verbal',
    pattern: /\bmais\s+de\s+um\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+)\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+)am\b/gi,
    replacementFn: (match) => `${match.replace(/am$/, 'ou')}`,
    message: 'A expressão "mais de um" exige o verbo no singular, salvo quando houver ideia de reciprocidade ou repetição.',
    badgeStyle: BADGE_STYLES.GREEN,
  },
  {
    id: 'rule-sujeito-singular-adv-verbo-plural',
    category: 'Concordância Verbal',
    pattern: /\b(o|a|um|uma)\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+[^s])\s+(?:já\s+|ainda\s+|também\s+)?(estavam|eram|foram|faziam|diziam|chegaram|saíram)\b/gi,
    replacementFn: (match, art, subst, verboPlural) => {
      const mapSingular = { estavam: 'estava', eram: 'era', foram: 'foi', faziam: 'fazia', diziam: 'dizia', chegaram: 'chegou', saíram: 'saiu' };
      const verbFix = mapSingular[verboPlural.toLowerCase()] || verboPlural;
      const meio = match.includes('já') ? 'já ' : match.includes('ainda') ? 'ainda ' : match.includes('também') ? 'também ' : '';
      return `${art} ${subst} ${meio}${verbFix}`;
    },
    message: 'O núcleo do sujeito está no singular, portanto o verbo deve concordar no singular (ex: "o professor já estava").',
    badgeStyle: BADGE_STYLES.GREEN,
  },
  {
    id: 'rule-pouco-muito-substantivo-plural',
    category: 'Concordância Nominal',
    pattern: /\b(de\s+)?(pouco|muito)\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+s)\b/gi,
    replacementFn: (match, prep, quant, subst) => {
      const isFem = subst.endsWith('as');
      const prepStr = prep ? prep : '';
      const fixQuant = quant.toLowerCase() === 'pouco' ? (isFem ? 'poucas' : 'poucos') : (isFem ? 'muitas' : 'muitos');
      return `${prepStr}${fixQuant} ${subst}`;
    },
    message: 'Quantificadores como "pouco" e "muito" devem concordar com o substantivo plural (ex: "poucos amigos").',
    badgeStyle: BADGE_STYLES.GREEN,
  },
  {
    id: 'rule-faltava-restava-numeral-plural',
    category: 'Concordância Verbal / Numerais',
    pattern: /\b(faltava|restava|sobrava)\s+([0-9]+|dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez|quinze|vinte|trinta)\s+(minutos|horas|dias|meses|anos|segundos|páginas|questões)\b/gi,
    replacementFn: (match, verbo, num, tempo) => {
      const mapPlural = { faltava: 'faltavam', restava: 'restavam', sobrava: 'sobravam' };
      return `${mapPlural[verbo.toLowerCase()] || verbo} ${num} ${tempo}`;
    },
    message: 'Verbos que indicam quantidade/tempo restante devem concordar no plural com o numeral (ex: "faltavam cinco minutos").',
    badgeStyle: BADGE_STYLES.GREEN,
  },

  // ==========================================
  // 8. ERROS ORTOGRÁFICOS E TEMPO INADEQUADO (VERMELHO VIVO)
  // ==========================================
  {
    id: 'rule-passou-mal-vs-mau',
    category: 'Parônimos / Mal vs Mau',
    pattern: /\b(passou|sentiu-se|ficou)\s+mau\b/gi,
    replacementFn: (match, verb) => `${verb} mal`,
    message: 'Como oposto de "bem", utilize o advérbio "mal" ("passou mal").',
    badgeStyle: BADGE_STYLES.RED,
  },
  {
    id: 'rule-mau-exemplo-elemento',
    category: 'Parônimos / Mal vs Mau',
    pattern: /\b(um|este|esse|aquele)\s+mal\s+(exemplo|elemento|caráter|aluno|homem|amigo|comportamento)\b/gi,
    replacementFn: (match, art, subst) => `${art} mau ${subst}`,
    message: 'Como adjetivo oposto de "bom", utilize "mau" ("um mau exemplo").',
    badgeStyle: BADGE_STYLES.RED,
  },
  {
    id: 'rule-mais-adversativo-em-vez-de-mas',
    category: 'Confusão Lexical / Mais vs Mas',
    pattern: /\b([a-zA-Záàâãéèêíóòôõúç]+)\s*,\s*mais\s+(eu|você|ele|ela|nós|eles|elas|não|infelizmente)\b/gi,
    replacementFn: (match, palavra, prox) => `${palavra}, mas ${prox}`,
    message: 'Para introduzir uma oposição ou oposição de ideias, utilize a conjunção "mas" (e não o quantificador "mais").',
    badgeStyle: BADGE_STYLES.RED,
  },
  {
    id: 'rule-fazer-temperatura-impessoal',
    category: 'Impessoalidade Verbal / Temperatura',
    pattern: /\bfazem\s+([0-9]+|muitos|trinta|quarenta)\s+graus\b/gi,
    replacementFn: (match, quant) => `faz ${quant} graus`,
    message: 'Indicando temperatura ou clima, o verbo "fazer" é impessoal e permanece no singular ("faz 30 graus").',
    badgeStyle: BADGE_STYLES.RED,
  },
  {
    id: 'rule-terceira-pessoa-verbo-primeira-pessoa',
    category: 'Erro de Escrita / Flexão Verbal',
    pattern: /\b(o|a|um|uma)\s+(?:[a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+\s+)*(despertador|folha|papel|pânico|caneta|janela|carro|relógio|professor|pneu|forno)\s+(?:não\s+|já\s+)?(toco|pego|rasgo|quebro|fecho|levanto|solto|desligo|ligo)\b/gi,
    replacementFn: (match, art, subst, verbo) => {
      const mapPreterito = { toco: 'tocou', pego: 'pegou', rasgo: 'rasgou', quebro: 'quebrou', fecho: 'fechou', levanto: 'levantou', solto: 'soltou', desligo: 'desligou', ligo: 'ligou' };
      const verboFix = mapPreterito[verbo.toLowerCase()] || verbo;
      const meio = match.includes('não') ? 'não ' : match.includes('já') ? 'já ' : '';
      return `${art} ${subst} ${meio}${verboFix}`;
    },
    message: 'O sujeito de 3ª pessoa exige o verbo no pretérito perfeito em narrativas no passado (ex: "tocou", "rasgou").',
    badgeStyle: BADGE_STYLES.RED,
  },
  {
    id: 'rule-me-pego-de-surpresa',
    category: 'Flexão Verbal / Regência',
    pattern: /\bme\s+pego\s+de\s+surpresa\b/gi,
    replacementFn: () => 'me pegou de surpresa',
    message: 'Em narrativas no passado, utilize o pretérito perfeito: "me pegou de surpresa".',
    badgeStyle: BADGE_STYLES.RED,
  },
  {
    id: 'rule-derrepente-junto',
    category: 'Erro de Escrita',
    pattern: /\bderrepente\b/gi,
    replacementFn: () => 'de repente',
    message: 'A locução adverbial escreve-se separada: "de repente".',
    badgeStyle: BADGE_STYLES.RED,
  },
  {
    id: 'rule-concerteza-junto',
    category: 'Erro de Escrita',
    pattern: /\bconcerteza\b/gi,
    replacementFn: () => 'com certeza',
    message: 'A expressão escreve-se separada: "com certeza".',
    badgeStyle: BADGE_STYLES.RED,
  },
  {
    id: 'rule-ha-tempo-decorrido-quantificadores',
    category: 'Confusão Lexical / Há vs A',
    pattern: /\ba\s+(poucos|alguns|vários|muitos|bastantes|[0-9]+)\s+(dias|meses|anos|semanas|horas|minutos|décadas|séculos)\b/gi,
    replacementFn: (match, quant, tempo) => `há ${quant} ${tempo}`,
    message: 'Para indicar tempo decorrido no passado (equivalente a "faz X tempo"), utilize o verbo haver ("há").',
    badgeStyle: BADGE_STYLES.RED,
  },
  {
    id: 'rule-houveram-problemas',
    category: 'Impessoalidade Verbal / Verbo Haver',
    pattern: /\bhouveram\s+([a-zA-Záàâãéèêíóòôõúç]+s)\b/gi,
    replacementFn: (match, substPlural) => `houve ${substPlural}`,
    message: 'No sentido de existir ou ocorrer, o verbo "haver" é impessoal e deve ser usado no singular ("houve problemas").',
    badgeStyle: BADGE_STYLES.RED,
  },
  {
    id: 'rule-fazem-anos-impessoal',
    category: 'Impessoalidade Verbal / Verbo Fazer',
    pattern: /\bfazem\s+([0-9]+|muitos|poucos|alguns|vários)\s+(anos|dias|meses|semanas)\b/gi,
    replacementFn: (match, quant, tempo) => `faz ${quant} ${tempo}`,
    message: 'Indicando tempo decorrido, o verbo "fazer" é impessoal e não vai para o plural ("faz três anos").',
    badgeStyle: BADGE_STYLES.RED,
  },

  // ==========================================
  // 9. CRASE E SEMÂNTICA (AZUL CÉU)
  // ==========================================
  {
    id: 'rule-onde-vs-aonde-movimento',
    category: 'Semântica / Onde vs Aonde',
    pattern: /\bonde\s+(você|ele|ela|eles|elas|a\s+gente)?\s*(vai|fui|foram|iremos|vai-se|chegou|pretende\s+ir)\b/gi,
    replacementFn: (match, pron, verb) => `aonde ${pron ? pron + ' ' : ''}${verb}`,
    message: 'Com verbos que indicam movimento ou destino (ir, chegar), utilize "aonde".',
    badgeStyle: BADGE_STYLES.SKY,
  },
  {
    id: 'rule-aonde-vs-onde-estatico',
    category: 'Semântica / Onde vs Aonde',
    pattern: /\baonde\s+(você|ele|ela|eles|elas|a\s+gente)?\s*(mora|está|fica|vive|reside|se\s+encontra)\b/gi,
    replacementFn: (match, pron, verb) => `onde ${pron ? pron + ' ' : ''}${verb}`,
    message: 'Com verbos que indicam permanência ou estado fixo (morar, estar, ficar), utilize "onde".',
    badgeStyle: BADGE_STYLES.SKY,
  },
  {
    id: 'rule-crase-locucao-a-toa-as-pressas',
    category: 'Crase / Locuções Adverbiais',
    pattern: /\b(ficar\s+a\s+vontade|a\s+toa|as\s+pressas|a\s+medida\s+que)\b/gi,
    replacementFn: (match) => {
      const map = { 'ficar a vontade': 'ficar à vontade', 'a toa': 'à toa', 'as pressas': 'às pressas', 'a medida que': 'à medida que' };
      return map[match.toLowerCase()] || match;
    },
    message: 'Locuções adverbiais e conjuntivas femininas exigem o uso do sinal indicativo de crase.',
    badgeStyle: BADGE_STYLES.SKY,
  },

  // ==========================================
  // 10. PARÔNIMOS, MAIÚSCULAS E LEXICAL (AMARELO DOURADO)
  // ==========================================
  {
    id: 'rule-afim-de-separado',
    category: 'Confusão Lexical / Afim vs A fim',
    pattern: /\bafim\s+de\b/gi,
    replacementFn: () => 'a fim de',
    message: 'Para indicar intenção, desejo ou finalidade, escreve-se separado: "a fim de".',
    badgeStyle: BADGE_STYLES.AMBER,
  },
  {
    id: 'rule-perigo-iminente',
    category: 'Parônimos / Iminente vs Eminente',
    pattern: /\b(perigo|risco|ameaça)\s+eminente\b/gi,
    replacementFn: (match, subst) => `${subst} iminente`,
    message: 'Para indicar algo que está prestes a acontecer, utilize "iminente". "Eminente" significa ilustre ou elevado.',
    badgeStyle: BADGE_STYLES.AMBER,
  },
  {
    id: 'rule-discrecao-vs-descricao',
    category: 'Parônimos / Discreção vs Descrição',
    pattern: /\b(com\s+toda\s+a|agir\s+com|manteve\s+a)\s+descrição\b/gi,
    replacementFn: (match, contexto) => `${contexto} discreção`,
    message: 'Para a qualidade de quem é discreto ou reservado, utilize "discreção". "Descrição" refere-se ao ato de descrever.',
    badgeStyle: BADGE_STYLES.AMBER,
  },
  {
    id: 'rule-esqueci-de-tras',
    category: 'Expressão Incorreta',
    pattern: /\b(esqueci|esqueceu|esqueceram|deixei|deixou|deixaram)\s+de\s+trás\b/gi,
    replacementFn: (match, verbo) => `${verbo} para trás`,
    message: 'A expressão consagrada na norma culta para indicar abandono é "para trás".',
    badgeStyle: BADGE_STYLES.AMBER,
  },
  {
    id: 'rule-historia-do-brasil-maiuscula',
    category: 'Uso de Maiúsculas',
    pattern: /\bhistórias?\s+do\s+[bB]rasil\b/g,
    replacementFn: () => 'História do Brasil',
    message: 'Ao se referir à disciplina ou período histórico, utilize maiúscula inicial ("História do Brasil").',
    badgeStyle: BADGE_STYLES.AMBER,
  },
  {
    id: 'rule-proclamacao-da-republica-maiuscula',
    category: 'Uso de Maiúsculas',
    pattern: /\bproclamação\s+da\s+república\b/gi,
    replacementFn: () => 'Proclamação da República',
    message: 'Nomes de fatos e eventos históricos marcantes devem ser grafados com maiúsculas formais.',
    badgeStyle: BADGE_STYLES.AMBER,
  },
  {
    id: 'rule-paronimo-sessao',
    category: 'Parônimos / Ortografia',
    pattern: /\b(seção|secção)\s+(bem\s+)?(interessante|legal|chata|longa|curta|de\s+cinema|do\s+cinema|de\s+filme|de\s+teatro|de\s+fotos|de\s+terapia|de\s+palestra|de\s+reunião)\b/gi,
    replacementFn: (match, sec, bem, comp) => `sessão ${bem || ''}${comp}`,
    message: 'Para eventos, reuniões, exibições ou intervalos de tempo, utilize "sessão" (com SS).',
    badgeStyle: BADGE_STYLES.AMBER,
  },
];

export function analyzeCustomGrammarRules(text, existingSuggestions = []) {
  if (!text || text.trim().length < 3) return [];

  const customSuggestions = [];
  const occupiedRanges = existingSuggestions.map((s) => ({
    start: s.offset,
    end: s.offset + (s.length || s.original?.length || 0),
  }));

  const isRangeOccupied = (start, end) =>
    occupiedRanges.some((range) => (start >= range.start && start < range.end) || (end > range.start && end <= range.end));

  customRulesDatabase.forEach((rule) => {
    let match;
    rule.pattern.lastIndex = 0;

    while ((match = rule.pattern.exec(text)) !== null) {
      const matchStart = match.index;
      const matchLength = match[0].length;
      const matchEnd = matchStart + matchLength;

      if (isRangeOccupied(matchStart, matchEnd)) continue;

      const repResult = rule.replacementFn
        ? rule.replacementFn(match[0], match[1], match[2], match[3], match[4], match[5], match[6])
        : match[0];

      const replacements = Array.isArray(repResult) ? repResult : [repResult];
      const replacement = replacements[0];

      if (replacement === match[0]) continue;

      // Suporte a objetos com { badge, highlight } ou string direta
      const badgeStyle = typeof rule.badgeStyle === 'object' ? rule.badgeStyle.badge : rule.badgeStyle;
      const highlightStyle = typeof rule.badgeStyle === 'object' ? rule.badgeStyle.highlight : 'border-b-2 border-purple-500 border-dashed';

      customSuggestions.push({
        id: `custom-${rule.id}-${matchStart}`,
        label: rule.category,
        original: match[0],
        offset: matchStart,
        length: matchLength,
        replacement: replacement,
        replacements: replacements,
        message: rule.message,
        badgeStyle: badgeStyle,
        highlightStyle: highlightStyle,
      });
    }
  });

  return customSuggestions;
}