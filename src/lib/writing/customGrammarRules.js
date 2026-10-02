// src/lib/writing/customGrammarRules.js
// Base unificada de regras gramaticais e ortográficas personalizadas para análise de texto no StoryForge.

/**
 * BASE DE REGRAS GRAMATICAIS E ORTOGRÁFICAS COMPLEMENTARES E GENERALIZADAS
 */
export const customRulesDatabase = [
  // ==========================================
  // 1. CORREÇÃO DE BUGS E INFORMALIDADES ESTRITAS
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
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },
  {
    id: 'rule-fix-vai-infinitive-a',
    category: 'Sintaxe / Flexão Incorreta',
    pattern: /\b(vai|vão|ia|iam)\s+([a-zA-Záàâãéèêíóòôõúç]+r)a\b/gi,
    replacementFn: (match, aux, verb) => `${aux} ${verb}`,
    message: 'Construção verbal incorreta. O verbo principal deve permanecer no infinitivo (ex: "vai limpar", "vai resolver").',
    badgeStyle: 'bg-red-950/80 text-red-300 border-red-700/60',
  },

  // ==========================================
  // 2. COLOCAÇÃO PRONOMINAL E REGÊNCIA SENSITIVA/CAUSATIVA
  // ==========================================
  {
    id: 'rule-causativo-pronome-reto-infinitivo',
    category: 'Sintaxe / Verbo Causativo',
    pattern: /\b(fazer|fazendo|fez|faria|deixar|deixando|deixou|ver|vendo|viu|ouvir|ouvindo|ouviu|sentir|sentindo|sentiu)\s+(eu|tu|ele|ela|nós|eles|elas)\s+([a-zA-Záàâãéèêíóòôõúç]+r)\b/gi,
    replacementFn: (match, vCaus, pron, vInf) => {
      const pronMap = {
        eu: 'me',
        tu: 'te',
        ele: 'o',
        ela: 'a',
        nós: 'nos',
        eles: 'os',
        elas: 'as',
      };
      const obl = pronMap[pron.toLowerCase()] || pron;
      return `${vCaus}-${obl} ${vInf}`;
    },
    message: 'Com verbos causativos ou sensitivos (fazer, deixar, ver, ouvir, sentir) regendo infinitivo, utilize o pronome oblíquo na norma-padrão (ex: "fazendo-me dar").',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
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
    message: 'Pela gramática normativa, não se inicia frase ou oração sem palavra atrativa com pronome oblíquo átono (ex: "empresta-me" ou "e empresta-me"). Em diálogos casuais a forma é comum, mas no padrão culto prefira a ênclise.',
    badgeStyle: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  },

  // ==========================================
  // 3. NÃO CONTRAÇÃO DE PREPOSIÇÃO COM SUJEITO NO INFINITIVO
  // ==========================================
  {
    id: 'rule-nao-contracao-preposicao-sujeito-infinitivo',
    category: 'Sintaxe / Contração Indevida',
    pattern: /\b(antes|depois|apesar|em\s+vez|no\s+caso)\s+d(o|a|os|as)\s+([^,.!?]+?)\s+([a-zA-Záàâãéèêíóòôõúç]+r)\b/gi,
    replacementFn: (match, prep, art, sujeit, vInf) => {
      return `${prep} de ${art} ${sujeit} ${vInf}`;
    },
    message: 'Quando o termo introduzido é sujeito de um verbo no infinitivo, a preposição "de" não deve ser contraída com o artigo na norma culta (ex: "antes de o horário... começar").',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },

  // ==========================================
  // 4. DESCOMPASSO VERBAL (SUJEITO DE 3ª PESSOA COM VERBO EM 1ª PESSOA)
  // ==========================================
  {
    id: 'rule-terceira-pessoa-verbo-primeira-pessoa',
    category: 'Flexão Verbal / Tempo Inadequado',
    pattern: /\b(o|a|um|uma)\s+(?:[a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+\s+)*(despertador|folha|papel|pânico|caneta|janela|carro|relógio|professor|pneu|forno)\s+(?:não\s+|já\s+)?(toco|pego|rasgo|quebro|fecho|levanto|solto|desligo|ligo)\b/gi,
    replacementFn: (match, art, subst, verbo) => {
      const mapPreterito = {
        toco: 'tocou',
        pego: 'pegou',
        rasgo: 'rasgou',
        quebro: 'quebrou',
        fecho: 'fechou',
        levanto: 'levantou',
        solto: 'soltou',
        desligo: 'desligou',
        ligo: 'ligou',
      };
      const verboFix = mapPreterito[verbo.toLowerCase()] || verbo;
      const meio = match.includes('não') ? 'não ' : match.includes('já') ? 'já ' : '';
      return `${art} ${subst} ${meio}${verboFix}`;
    },
    message: 'Inadequação de flexão verbal. O sujeito de 3ª pessoa exige o verbo no pretérito perfeito em narrativas no passado (ex: "tocou", "rasgou").',
    badgeStyle: 'bg-red-950/80 text-red-300 border-red-700/60',
  },
  {
    id: 'rule-me-pego-de-surpresa',
    category: 'Flexão Verbal / Regência',
    pattern: /\bme\s+pego\s+de\s+surpresa\b/gi,
    replacementFn: () => 'me pegou de surpresa',
    message: 'Em narrativas no passado, utilize o pretérito perfeito: "me pegou de surpresa".',
    badgeStyle: 'bg-red-950/80 text-red-300 border-red-700/60',
  },

  // ==========================================
  // 5. REGÊNCIA E EXPRESSÕES INCORRETAS
  // ==========================================
  {
    id: 'rule-esqueci-de-tras',
    category: 'Regência / Expressão Incorreta',
    pattern: /\b(esqueci|esqueceu|esqueceram|deixei|deixou|deixaram)\s+de\s+trás\b/gi,
    replacementFn: (match, verbo) => `${verbo} para trás`,
    message: 'A expressão consagrada na norma culta para indicar abandono ou esquecimento é "para trás" (ex: "esqueci para trás").',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },

  // ==========================================
  // 6. CONCORDÂNCIA VERBAL E NOMINAL
  // ==========================================
  {
    id: 'rule-sujeito-singular-adv-verbo-plural',
    category: 'Concordância Verbal',
    pattern: /\b(o|a|um|uma)\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+[^s])\s+(?:já\s+|ainda\s+|também\s+)?(estavam|eram|foram|faziam|diziam|chegaram|saíram)\b/gi,
    replacementFn: (match, art, subst, verboPlural) => {
      const mapSingular = {
        estavam: 'estava',
        eram: 'era',
        foram: 'foi',
        faziam: 'fazia',
        diziam: 'dizia',
        chegaram: 'chegou',
        saíram: 'saiu',
      };
      const verbFix = mapSingular[verboPlural.toLowerCase()] || verboPlural;
      const meio = match.includes('já') ? 'já ' : match.includes('ainda') ? 'ainda ' : match.includes('também') ? 'também ' : '';
      return `${art} ${subst} ${meio}${verbFix}`;
    },
    message: 'O núcleo do sujeito está no singular, portanto o verbo deve concordar no singular (ex: "o professor já estava").',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },
  {
    id: 'rule-pouco-muito-substantivo-plural',
    category: 'Concordância Nominal',
    pattern: /\b(de\s+)?(pouco|muito)\s+([a-zA-ZáàâãéèêíóòôõúçÁÀÂÃÉÈÊÍÓÒÔÕÚÇ]+s)\b/gi,
    replacementFn: (match, prep, quant, subst) => {
      const isFem = subst.endsWith('as');
      const prepStr = prep ? prep : '';
      if (quant.toLowerCase() === 'pouco') {
        const fixQuant = isFem ? 'poucas' : 'poucos';
        return `${prepStr}${fixQuant} ${subst}`;
      } else {
        const fixQuant = isFem ? 'muitas' : 'muitos';
        return `${prepStr}${fixQuant} ${subst}`;
      }
    },
    message: 'Quantificadores como "pouco" e "muito" devem concordar em gênero e número com o substantivo plural (ex: "poucos amigos").',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },
  {
    id: 'rule-faltava-restava-numeral-plural',
    category: 'Concordância Verbal / Numerais',
    pattern: /\b(faltava|restava|sobrava)\s+([0-9]+|dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez|quinze|vinte|trinta)\s+(minutos|horas|dias|meses|anos|segundos|páginas|questões)\b/gi,
    replacementFn: (match, verbo, num, tempo) => {
      const mapPlural = { faltava: 'faltavam', restava: 'restavam', sobrava: 'sobravam' };
      const verboFix = mapPlural[verbo.toLowerCase()] || verbo;
      return `${verboFix} ${num} ${tempo}`;
    },
    message: 'Verbos que indicam quantidade ou tempo restante devem concordar no plural com o numeral (ex: "faltavam cinco minutos").',
    badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
  },

  // ==========================================
  // 7. MAIÚSCULAS EM TERMOS HISTÓRICOS E DISCIPLINAS
  // ==========================================
  {
    id: 'rule-historia-do-brasil-maiuscula',
    category: 'Ortografia / Uso de Maiúsculas',
    pattern: /\bhistórias?\s+do\s+[bB]rasil\b/g,
    replacementFn: () => 'História do Brasil',
    message: 'Ao se referir à disciplina ou ao período histórico do país, utilize maiúscula inicial ("História do Brasil").',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
  {
    id: 'rule-proclamacao-da-republica-maiuscula',
    category: 'Ortografia / Uso de Maiúsculas',
    pattern: /\bproclamação\s+da\s+república\b/gi,
    replacementFn: () => 'Proclamação da República',
    message: 'Nomes de fatos e eventos históricos marcantes devem ser grafados com maiúsculas formais.',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },

  // ==========================================
  // 8. PONTUAÇÃO, CONECTIVOS E ADJUNTOS ADVERBIAIS
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
  // 9. GRAFIA INCORRETA E PARÔNIMOS
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

  // ==========================================
  // 10. HÁ vs A (TEMPO DECORRIDO)
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
  // 11. PRONOMES E REGÊNCIA DE PREPOSIÇÃO
  // ==========================================
  {
    id: 'rule-para-mim-infinitivo',
    category: 'Sintaxe / Uso do Pronome Mim',
    pattern: /\bpara\s+mim\s+([a-zA-Záàâãéèêíóòôõúç]+r)\b/gi,
    replacementFn: (match, verbo) => `para eu ${verbo}`,
    message: 'O pronome "mim" não executa ação. Antes de verbo no infinitivo indicando a ação do sujeito, utilize "eu" ("para eu poder").',
    badgeStyle: 'bg-red-950/80 text-red-300 border-red-700/60',
  },
  {
    id: 'rule-ver-eu-infinitivo',
    category: 'Sintaxe / Regência Sensitiva',
    pattern: /\b(ver|ouvir|sentir|deixar|fazer)\s+eu\s+([a-zA-Záàâãéèêíóòôõúç]+)\b/gi,
    replacementFn: (match, vSens, vPrinc) => `me ${vSens} ${vPrinc}`,
    message: 'Na norma-padrão, utilize o pronome oblíquo com verbos sensitivos ou causativos ("me ver passar").',
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
  // 12. CONCORDÂNCIA NOMINAL, NUMERAIS E HORAS
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

  // ==========================================
  // 13. CRASE (PROIBIDA E OBRIGATÓRIA)
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

  // ==========================================
  // 14. SUBJUNTIVO IRREGULAR E FLEXÃO VERBAL
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

  // ==========================================
  // 15. IMPESSOALIDADE VERBAL E CONCORDÂNCIA VERBAL
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

  // ==========================================
  // 16. REGÊNCIA VERBAL E PREPOSIÇÕES
  // ==========================================
  {
    id: 'rule-regencia-assisti-um',
    category: 'Regência Verbal',
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

  // ==========================================
  // 17. VÍCIOS DE LINGUAGEM, GERUNDISMO E PLEONASMO
  // ==========================================
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
    message: 'Evite o gerundismo. Dê preferência a formas mais diretas e elegantes (ex: "vai limpar").',
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
    id: 'rule-mais-grande',
    category: 'Gramática / Comparativo Incorreto',
    pattern: /\bmais\s+grande\b/gi,
    replacementFn: () => 'maior',
    message: 'Utilize a forma sintética "maior" para comparações gerais.',
    badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
  },
];

export function analyzeCustomGrammarRules(text, existingSuggestions = []) {
  if (!text || text.trim().length < 3) return [];

  const customSuggestions = [];

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