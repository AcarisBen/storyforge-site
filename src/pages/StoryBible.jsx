import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

// Ordem dramática exata dos 8 Marcos Narrativos
const NARRATIVE_ORDER = [
  'Prólogo',
  'Incidente Incitante',
  '1º Ponto de Virada',
  'Midpoint',
  'Crise',
  'Clímax',
  'Resolução',
  'Epílogo'
];

const MILESTONE_THEMES = {
  'Prólogo': { color: 'bg-indigo-600 shadow-indigo-600/80 ring-indigo-950 text-indigo-200', border: 'border-indigo-500/40', text: 'text-indigo-400' },
  'Incidente Incitante': { color: 'bg-purple-600 shadow-purple-600/80 ring-purple-950 text-purple-200', border: 'border-purple-500/40', text: 'text-purple-400' },
  '1º Ponto de Virada': { color: 'bg-blue-600 shadow-blue-600/80 ring-blue-950 text-blue-200', border: 'border-blue-500/40', text: 'text-blue-400' },
  'Midpoint': { color: 'bg-cyan-600 shadow-cyan-600/80 ring-cyan-950 text-cyan-200', border: 'border-cyan-500/40', text: 'text-cyan-400' },
  'Crise': { color: 'bg-amber-600 shadow-amber-600/80 ring-amber-950 text-amber-200', border: 'border-amber-500/40', text: 'text-amber-400' },
  'Clímax': { color: 'bg-red-600 shadow-red-600/80 ring-red-950 text-red-200', border: 'border-red-500/40', text: 'text-red-400' },
  'Resolução': { color: 'bg-emerald-600 shadow-emerald-600/80 ring-emerald-950 text-emerald-200', border: 'border-emerald-500/40', text: 'text-emerald-400' },
  'Epílogo': { color: 'bg-pink-600 shadow-pink-600/80 ring-pink-950 text-pink-200', border: 'border-pink-500/40', text: 'text-pink-400' }
};

// Estrutura idêntica das 10 Categorias e cores na ordem exata da página Checklist
const CHECKLIST_CATEGORIES_ORDER = [
  {
    title: 'Personagens & Arcos',
    badgeStyle: 'bg-purple-950/60 text-purple-300 border-purple-800/40',
    checkColor: 'bg-purple-600 text-white',
    boxStyle: 'bg-[#151322] border-purple-800/40 text-purple-200',
    items: [
      'O protagonista mudou ao longo da história?',
      'O protagonista tem um desejo consciente claro?',
      'O protagonista tem uma necessidade inconsciente?',
      'O protagonista tem um ponto-cego ou ferida interior?',
      'O antagonista acredita ser o herói da própria história?',
      'O antagonista representa a antítese do tema da obra?',
      'Cada personagem principal tem um arco dramático definido?',
      'Os personagens secundários têm função narrativa clara?',
      'Existe coerência psicológica nas atitudes e reações?',
      'Os personagens têm fraquezas e virtudes equilibradas?',
      'A voz e o vocabulário dos diálogos distinguem cada personagem?',
    ],
  },
  {
    title: 'Diálogos & Subtexto',
    badgeStyle: 'bg-amber-950/60 text-amber-300 border-amber-800/40',
    checkColor: 'bg-amber-500 text-gray-950',
    boxStyle: 'bg-[#1c1813] border-amber-800/40 text-amber-200',
    items: [
      'Existe um conflito de intenções ou forças opostas no diálogo?',
      'As vozes permanecem distintas e reconhecíveis mesmo sem os nomes?',
      'Há informação e intenção transmitidas via subtexto sem exposição direta?',
      'Foram incluídos gestos, ações e linguagem corporal durante as falas?',
      'Evitou-se a repetição artificial do nome do interlocutor durante a conversa?',
      'As falas têm ritmo dinâmico e progridem a cena ao invés de estagnar?',
      'A camada sonora / atmosfera reflete a tensão do momento do diálogo?',
    ],
  },
  {
    title: 'Relações & Dinâmica entre Personagens',
    badgeStyle: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40',
    checkColor: 'bg-emerald-500 text-gray-950',
    boxStyle: 'bg-[#121c18] border-emerald-800/40 text-emerald-200',
    items: [
      'As relações entre os personagens evoluem ou se desgastam conforme a história avança?',
      'Existem alianças, rivalidades ou segredos compartilhados que geram tensão secundária?',
      'As mudanças de relacionamento são motivadas por eventos e cenas específicas?',
      'O nível de intensidade da relação (amizade, ódio, amor, rivalidade) condiz com os atos dos personagens?',
      'A rede/grafo de relacionamentos evita personagens isolados sem função narrativa?',
      'Existem conflitos de interesse claros entre aliados na mesma cena?',
    ],
  },
  {
    title: 'Conflito & Dilemas',
    badgeStyle: 'bg-red-950/60 text-red-300 border-red-800/40',
    checkColor: 'bg-red-500 text-white',
    boxStyle: 'bg-[#1c1315] border-red-800/40 text-red-200',
    items: [
      'Existe um dilema moral central sem escolha óbvia?',
      'Existe conflito interno relevante no protagonista?',
      'Existe conflito externo claro que impele a trama?',
      'O conflito escala de forma progressiva ao longo da narrativa?',
      'O conflito se resolve de forma tematicamente coerente e sem Deus Ex Machina?',
      'A força opositora reage ativamente às ações do protagonista?',
    ],
  },
  {
    title: 'Estrutura, Pacing & Mapa Emocional',
    badgeStyle: 'bg-blue-950/60 text-blue-300 border-blue-800/40',
    checkColor: 'bg-blue-500 text-white',
    boxStyle: 'bg-[#121824] border-blue-800/40 text-blue-200',
    items: [
      'O incidente incitante acontece nos primeiros 10% a 15% da história?',
      'O midpoint muda a dinâmica ou inverte as apostas da história?',
      'O clímax é o ponto mais alto de tensão e responde à Pergunta Dramática Central?',
      'A resolução mostra as consequências práticas da transformação?',
      'A estrutura escolhida serve ao ritmo e tom da história?',
      'As transições entre cenas e capítulos mantêm a fluidez narrativa?',
      'A curva do gráfico emocional alterna entre picos de tensão/medo e vales de alívio/esperança?',
      'Há variedade de sentimentos (curiosidade, choque, tristeza, alegria) ao longo dos pontos-chave?',
      'O tom emocional da cena final/resolução cumpre a promessa feita no início da narrativa?',
    ],
  },
  {
    title: 'Cenas & Construção Dramática',
    badgeStyle: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40',
    checkColor: 'bg-indigo-500 text-white',
    boxStyle: 'bg-[#151528] border-indigo-800/40 text-indigo-200',
    items: [
      'Toda cena muda o estado emocional ou narrativo da história?',
      'Toda cena tem um objetivo claro para o personagem de POV?',
      'Toda cena contém um conflito ou oposição de intenções?',
      'Toda cena termina com um gancho/mola de tensão para a próxima?',
      'Nenhuma cena é redundante ou descartável?',
      'As informações essenciais são reveladas via ação e diálogo (Show, Don’t Tell)?',
      'Os cenários interagem fisicamente com os personagens durante as cenas?',
      'Cada ponto emocional marcante está devidamente vinculado a uma cena, mistério ou plot twist?',
    ],
  },
  {
    title: 'Mistério, Suspense & Subtramas',
    badgeStyle: 'bg-orange-950/60 text-orange-300 border-orange-800/40',
    checkColor: 'bg-orange-500 text-gray-950',
    boxStyle: 'bg-[#1e1713] border-orange-800/40 text-orange-200',
    items: [
      'Existe foreshadowing (pistas sutis) plantado com antecedência?',
      'Todo foreshadowing tem um payoff (recompensa) satisfatório?',
      'Os mistérios e pistas não trapaceiam com a atenção do leitor?',
      'As pistas essenciais estão disponíveis antes da grande revelação?',
      'Os plot twists parecem inevitáveis em retrospecto, embora surpreendentes?',
      'As consequências psicológicas e práticas dos twists são exploradas?',
      'As subtramas enriquecem ou espelham o tema da trama principal?',
    ],
  },
  {
    title: 'Mundo & Regras do Universo',
    badgeStyle: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/40',
    checkColor: 'bg-cyan-500 text-gray-950',
    boxStyle: 'bg-[#121b20] border-cyan-800/40 text-cyan-200',
    items: [
      'O mundo e a ambientação refletem o tema central da história?',
      'Os sistemas (magia, tecnologia, economia, poder) têm regras e limitações consistentes?',
      'As facções e instituições têm motivações e ideologias claras?',
      'A história e o folclore do mundo afetam o presente da narrativa?',
      'O cenário ativa os cinco sentidos do leitor em momentos-chave?',
      'O cenário possui contrastes sociais, geográficos ou culturais visíveis?',
      'Os limites físicos, geográficos ou tecnológicos do mundo geram obstáculos na trama?',
    ],
  },
  {
    title: 'Tema, Mensagem & Promessa',
    badgeStyle: 'bg-pink-950/60 text-pink-300 border-pink-800/40',
    checkColor: 'bg-pink-500 text-white',
    boxStyle: 'bg-[#1e131b] border-pink-800/40 text-pink-200',
    items: [
      'O tema permeia os dilemas da obra sem soar panfletário ou didático?',
      'A conclusão responde à pergunta filosófica central levantada no início?',
      'A promessa de gênero feita nos primeiros capítulos é cumprida no final?',
      'O título e a premissa encontram ressonância ao longo do texto?',
      'A história possui um dilema filosófico onde duas verdades entram em colisão?',
      'O desfecho deixa uma sensação de encerramento emocional satisfatório para o leitor?',
    ],
  },
  {
    title: 'Prosa, Ritmo & Emoção',
    badgeStyle: 'bg-[#28241e] text-[#e0d3bf] border-[#5a4f3e]',
    checkColor: 'bg-[#b39368] text-gray-950',
    boxStyle: 'bg-[#1a1714] border-[#5a4f3e]/60 text-[#e0d3bf]',
    items: [
      'O ritmo varia adequadamente entre picos de tensão e momentos de alívio?',
      'A jornada emocional do leitor é variada ao longo dos atos?',
      'O tom do final corresponde ao pacto estabelecido com leitor?',
      'O estilo de prosa e o ritmo de frases casam com o nível de ação da cena?',
      'A voz narrativa (1ª ou 3ª pessoa) é consistente em ponto de vista (POV)?',
      'Os diálogos soam naturais quando lidos em voz alta?',
      'Verbos de ação precisos foram preferidos a adjetivos e advérbios em excesso?',
      'Os parágrafos variam de tamanho conforme a velocidade/urgência do momento da cena?',
      'Evitou-se a repetição excessiva de palavras ou ecos sonoros próximos no mesmo parágrafo?',
      'A narrativa evita exposição de informações (info-dumping) em blocos longos de texto?',
    ],
  },
];

function getCharacterBadgeStyle(type = '') {
  const norm = String(type).toLowerCase();
  if (norm.includes('protagonista')) return 'bg-purple-900/60 text-purple-300 border-purple-500/50';
  if (norm.includes('antagonista')) return 'bg-red-900/60 text-red-300 border-red-500/50';
  if (norm.includes('secundario') || norm.includes('secundário')) return 'bg-blue-900/60 text-blue-300 border-blue-500/50';
  return 'bg-gray-800 text-gray-300 border-gray-700';
}

function getWorldBadgeStyle(type = '') {
  const norm = String(type).toLowerCase();
  if (norm.includes('planeta') || norm.includes('país') || norm.includes('cidade')) return 'bg-blue-900/60 text-blue-300 border-blue-500/50';
  if (norm.includes('política') || norm.includes('economia') || norm.includes('tecnologia')) return 'bg-amber-900/60 text-amber-300 border-amber-500/50';
  if (norm.includes('fauna') || norm.includes('flora') || norm.includes('bioma')) return 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50';
  if (norm.includes('magia') || norm.includes('poderes') || norm.includes('combate')) return 'bg-red-900/60 text-red-300 border-red-500/50';
  return 'bg-purple-900/60 text-purple-300 border-purple-500/50';
}

export default function StoryBible({ projectId }) {
  const [loading, setLoading] = useState(true);

  const [openSections, setOpenSections] = useState({
    fundacao: true,
    estrutura: true,
    universo: true,
    jornada: true,
    dialogos: true,
    mapaEmocional: true,
    checklist: true,
    manuscrito: true,
  });

  const [data, setData] = useState({
    identity: {},
    essencia: {},
    engenharia: {},
    structureFrameworks: [],
    structureCards: [],
    timelineEvents: {},
    world: [],
    characters: [],
    relations: [],
    scenes: [],
    mysteries: [],
    twists: [],
    emotionalPoints: [],
    checklist: {},
    chapters: [],
    dialogues: [],
  });

  useEffect(() => {
    if (!projectId) return;

    const fetchFullBibleData = async () => {
      try {
        setLoading(true);

        const [
          resIdentity,
          resEssencia,
          resEngenharia,
          resStructure,
          resStructureCards,
          resTimeline,
          resWorld,
          resChars,
          resRelations,
          resScenes,
          resMysteries,
          resTwists,
          resEmotionalMap,
          resChecklist,
          resChapters,
          resDialogues,
        ] = await Promise.all([
          apiClient.get(`/entities/projects/${projectId}/identity`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/essencia`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/engenharia`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/estrutura-dramatica`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/estrutura-dramatica/cards`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/ritmo-timeline`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/world`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/characters`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/relations`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/scenes`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/mysteries`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/twists`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/mapa-emocional`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/checklist`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/chapters`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/dialogues`).catch(() => ({ data: [] })),
        ]);

        const unwrap = (r) => (r.data?.data ? r.data.data : r.data || {});

        const structureData = unwrap(resStructure);
        const selectedFrameworks = resStructure.data?.selectedFrameworks || structureData.selectedFrameworks || [];
        const rawValues = resStructure.data?.values || structureData.values || {};
        const backendCards = Array.isArray(resStructureCards.data) ? resStructureCards.data : [];

        const compiledCards = [];

        backendCards.forEach((card) => {
          if (card && (card.title || card.name)) {
            compiledCards.push({
              id: card.id || Math.random(),
              title: card.title || card.name,
              descricao: card.descricao || card.description || card.value || '',
              framework: card.framework || card.type || '3 Atos'
            });
          }
        });

        const frameworkKeysMap = [
          { key: 'acts', name: '3 Atos' },
          { key: 'sequences', name: '8 Sequências (Paul Gulino)' },
          { key: 'hero', name: 'Jornada do Herói' },
          { key: 'storyCircle', name: 'Story Circle (Dan Harmon)' },
          { key: 'saveTheCat', name: 'Save the Cat (Blake Snyder)' },
          { key: 'freytag', name: 'Freytag (Pirâmide Dramática)' }
        ];

        frameworkKeysMap.forEach(({ key, name }) => {
          if (rawValues[key]) {
            Object.entries(rawValues[key]).forEach(([beatTitle, textVal]) => {
              if (textVal && String(textVal).trim() !== '') {
                const alreadyExists = compiledCards.some(
                  (c) => c.title === beatTitle && c.descricao === textVal
                );
                if (!alreadyExists) {
                  compiledCards.push({
                    id: `${key}-${beatTitle}`,
                    title: beatTitle,
                    descricao: textVal,
                    framework: name
                  });
                }
              }
            });
          }
        });

        setData({
          identity: unwrap(resIdentity),
          essencia: unwrap(resEssencia),
          engenharia: unwrap(resEngenharia),
          structureFrameworks: selectedFrameworks,
          structureCards: compiledCards,
          timelineEvents: unwrap(resTimeline),
          world: Array.isArray(resWorld.data) ? resWorld.data : [],
          characters: Array.isArray(resChars.data) ? resChars.data : [],
          relations: Array.isArray(resRelations.data) ? resRelations.data : [],
          scenes: Array.isArray(resScenes.data) ? resScenes.data : [],
          mysteries: Array.isArray(resMysteries.data) ? resMysteries.data : [],
          twists: Array.isArray(resTwists.data) ? resTwists.data : [],
          emotionalPoints: Array.isArray(resEmotionalMap.data) ? resEmotionalMap.data : [],
          checklist: unwrap(resChecklist),
          chapters: Array.isArray(resChapters.data) ? resChapters.data : [],
          dialogues: Array.isArray(resDialogues.data) ? resDialogues.data : [],
        });
      } catch (err) {
        console.error('Erro ao montar a Story Bible completa:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFullBibleData();
  }, [projectId]);

  function toggleSection(key) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function getCharacterName(charId) {
    const found = data.characters.find((c) => String(c.id) === String(charId));
    return found ? (found.name || found.nome) : `Personagem (${charId?.slice(0, 5)}...)`;
  }

  const filteredStructureCards = data.structureCards.filter((card) => {
    if (!data.structureFrameworks || data.structureFrameworks.length === 0) return true;
    const cardFw = String(card.framework || card.type || '').toLowerCase();
    return data.structureFrameworks.some((selectedFw) => {
      const sel = String(selectedFw).toLowerCase();
      return cardFw.includes(sel) || sel.includes(cardFw);
    });
  });

  const milestonesList = NARRATIVE_ORDER.map((name) => {
    const events = data.timelineEvents[name] || [];
    const active = Array.isArray(events) && events.length > 0;
    const theme = MILESTONE_THEMES[name] || { color: 'bg-purple-600', text: 'text-purple-400' };
    
    let displayLabel = name;
    if (name === 'Incidente Incitante') displayLabel = 'I. Incitante';
    if (name === '1º Ponto de Virada') displayLabel = '1ª Virada';

    return {
      name,
      label: displayLabel,
      active,
      events,
      activeColor: theme.color,
      textClass: theme.text,
      borderClass: theme.border
    };
  });

  const checklistDoneCount = Object.values(data.checklist).filter(Boolean).length;

  if (loading) {
    return <div className="text-center py-20 text-purple-400 font-medium">Gerando e compilando a Bíblia da História...</div>;
  }

  return (
    <main className="story-bible-page max-w-6xl mx-auto space-y-8 pb-32 text-gray-200 font-sans">
      <header className="text-center space-y-3 bg-[#11111a] border border-purple-900/40 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-amber-500" />
        <span className="text-xs uppercase tracking-widest text-purple-400 font-bold">
          📖 DOCUMENTO MESTRE NARRATIVO
        </span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          {data.identity['Título'] || 'Bíblia da História'}
        </h1>
        {data.identity['Subtítulo'] && (
          <h2 className="text-lg text-purple-300 font-medium">{data.identity['Subtítulo']}</h2>
        )}
      </header>

      {/* 1. FUNDAÇÃO */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('fundacao')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🏛</span> 1. Fundação
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Identidade, Essência e Engenharia Narrativa</p>
          </div>
          <span className="text-gray-400 font-bold text-lg">{openSections.fundacao ? '⌃' : '⌄'}</span>
        </button>

        {openSections.fundacao && (
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Identidade da Obra</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(data.identity).map(([key, val]) => (
                  <div key={key} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80">
                    <span className="text-xs font-semibold text-gray-400 block mb-1">{key}</span>
                    <p className="text-sm text-gray-200 leading-relaxed">{val || 'Não preenchido.'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/60">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Essência da História</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(data.essencia).map(([key, val]) => (
                  <div key={key} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80">
                    <span className="text-xs font-semibold text-gray-400 block mb-1">{key}</span>
                    <p className="text-sm text-gray-200 leading-relaxed">{val || 'Não preenchido.'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/60">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">Engenharia Narrativa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(data.engenharia).map(([key, val]) => (
                  <div key={key} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80">
                    <span className="text-xs font-semibold text-gray-400 block mb-1">{key}</span>
                    <p className="text-sm text-gray-200 leading-relaxed">{val || 'Não preenchido.'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. ARQUITETURA DRAMÁTICA & RITMO */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('estrutura')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>⏳</span> 2. Arquitetura Dramática & Ritmo
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Frameworks Selecionados e Linha do Tempo Ordenada
            </p>
          </div>
          <span className="text-gray-400 font-bold text-lg">{openSections.estrutura ? '⌃' : '⌄'}</span>
        </button>

        {openSections.estrutura && (
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-4">
                LINHA DO TEMPO (ESTRUTURA DE 3 ATOS)
              </h3>

              <div className="p-6 bg-[#171724] border border-gray-800/80 rounded-2xl">
                <div className="relative flex justify-between items-center max-w-5xl mx-auto px-4">
                  <div className="absolute top-3 left-6 right-6 h-1 bg-[#181824] z-0" />

                  <div className="absolute top-3 left-6 right-6 h-1 z-0 flex pointer-events-none">
                    {milestonesList.slice(0, -1).map((m, idx) => {
                      const nextM = milestonesList[idx + 1];
                      const isSegmentActive = m.active && nextM.active;

                      const totalSegments = milestonesList.length - 1;
                      const startRatio = idx / totalSegments;
                      const endRatio = (idx + 1) / totalSegments;

                      const startR = Math.round(147 + (249 - 147) * startRatio);
                      const startG = Math.round(51 + (115 - 51) * startRatio);
                      const startB = Math.round(234 + (22 - 234) * startRatio);

                      const endR = Math.round(147 + (249 - 147) * endRatio);
                      const endG = Math.round(51 + (115 - 51) * endRatio);
                      const endB = Math.round(234 + (22 - 234) * endRatio);

                      return (
                        <div key={idx} className="flex-1 h-full relative">
                          {isSegmentActive && (
                            <div
                              className="w-full h-full transition-all duration-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]"
                              style={{
                                background: `linear-gradient(to right, 
                                  rgb(${startR}, ${startG}, ${startB}), 
                                  rgb(${endR}, ${endG}, ${endB})
                                )`
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {milestonesList.map((m, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center group">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                          m.active
                            ? `${m.activeColor} shadow-lg ring-4 scale-110`
                            : 'bg-[#181824] border-2 border-gray-700 text-gray-600'
                        }`}
                      >
                        <span className="text-[10px] font-extrabold">{m.active ? '✦' : '◇'}</span>
                      </div>

                      <span
                        className={`text-[10px] font-bold mt-3 text-center transition-colors max-w-[70px] leading-tight ${
                          m.active ? 'text-purple-300 font-extrabold' : 'text-gray-500'
                        }`}
                      >
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/60">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">
                Frameworks Selecionados: {data.structureFrameworks.join(', ') || 'Nenhum selecionado'}
              </h3>
              {filteredStructureCards.length === 0 ? (
                <p className="text-xs text-gray-500 italic">Nenhum elemento associado aos frameworks selecionados.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredStructureCards.map((card) => (
                    <div key={card.id} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80 space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-white text-sm font-bold">{card.title}</strong>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                          {card.framework || card.type}
                        </span>
                      </div>
                      {card.descricao && <p className="text-xs text-gray-300 leading-relaxed">{card.descricao}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-800/60">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
                Detalhamento dos Marcos e Eventos da Timeline
              </h3>
              <div className="space-y-4">
                {milestonesList.map((m) => (
                  <div key={m.name} className={`p-4 bg-[#171724] rounded-xl border ${m.borderClass} space-y-2`}>
                    <h4 className="text-sm font-bold text-white flex items-center justify-between">
                      <span className={`flex items-center gap-2 ${m.textClass}`}>
                        <span className="w-2 h-2 rounded-full bg-current" />
                        {m.name}
                      </span>
                      <span className="text-xs text-gray-400 font-normal">
                        {m.events.length} evento{m.events.length !== 1 ? 's' : ''}
                      </span>
                    </h4>

                    {m.events.length === 0 ? (
                      <p className="text-xs text-gray-600 italic pl-4">Nenhum evento registrado neste marco.</p>
                    ) : (
                      m.events.map((e) => (
                        <div key={e.id} className="pl-4 border-l-2 border-gray-700/80 my-1">
                          <strong className="text-xs text-gray-200 block">{e.title}</strong>
                          <p className="text-xs text-gray-400">{e.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </section>

      {/* 3. UNIVERSO & PERSONAGENS */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('universo')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🌍</span> 3. O Universo & Personagens
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Worldbuilding, Dossiês e Teia de Relações
            </p>
          </div>
          <span className="text-gray-400 font-bold text-lg">{openSections.universo ? '⌃' : '⌄'}</span>
        </button>

        {openSections.universo && (
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Elementos do Mundo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.world.map((w) => (
                  <div key={w.id} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80 space-y-2">
                    <div className="flex justify-between items-start">
                      <strong className="text-white font-bold text-sm">{w.name}</strong>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getWorldBadgeStyle(w.type)}`}>
                        {w.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{w.description || 'Sem descrição.'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/60">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Personagens</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.characters.map((char) => (
                  <div key={char.id} className="p-5 bg-[#171724] rounded-xl border border-gray-800/80 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm ${getCharacterBadgeStyle(char.type)}`}>
                        {(char.name || char.nome || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-base">{char.name || char.nome}</h4>
                        <span className={`inline-block border px-2 py-0.5 rounded text-[10px] font-medium ${getCharacterBadgeStyle(char.type)}`}>
                          {char.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/60">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">Relações entre Personagens</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.relations.map((rel) => (
                  <div key={rel.id} className="p-3 bg-[#171724] rounded-xl border border-gray-800/80 flex items-center justify-between text-xs gap-2">
                    <span className="font-bold text-white truncate max-w-[35%]">{getCharacterName(rel.charAId)}</span>
                    <span className="px-2 py-1 bg-purple-950/80 text-purple-300 border border-purple-800/50 rounded font-semibold text-[11px] text-center shrink-0">
                      {rel.type} (Intensidade {rel.intensity})
                    </span>
                    <span className="font-bold text-white truncate max-w-[35%] text-right">{getCharacterName(rel.charBId)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. SEQUÊNCIA LÓGICA DA HISTÓRIA */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('jornada')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🎬</span> 4. Sequência Lógica & Engenharia da Trama
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Cenas, Mistérios e Reviravoltas</p>
          </div>
          <span className="text-gray-400 font-bold text-lg">{openSections.jornada ? '⌃' : '⌄'}</span>
        </button>

        {openSections.jornada && (
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Sequência de Cenas</h3>
              <div className="space-y-3">
                {data.scenes.map((scene, idx) => (
                  <div key={scene.id || idx} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80 space-y-1">
                    <strong className="text-white text-sm block">#{idx + 1} - {scene.title}</strong>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-400 pt-2">
                      {scene.objective && <p><b className="text-gray-300">Objetivo:</b> {scene.objective}</p>}
                      {scene.conflict && <p><b className="text-gray-300">Conflito:</b> {scene.conflict}</p>}
                      {scene.hook && <p><b className="text-gray-300">Gancho:</b> {scene.hook}</p>}
                      {scene.plotTwist && <p><b className="text-purple-400">Plot Twist da Cena:</b> {scene.plotTwist}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 5. DIÁLOGOS CHAVE */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('dialogos')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>💬</span> 5. Diálogos Chave
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Falas e Interações Notáveis Registradas</p>
          </div>
          <span className="text-gray-400 font-bold text-lg">{openSections.dialogos ? '⌃' : '⌄'}</span>
        </button>

        {openSections.dialogos && (
          <div className="p-6 space-y-4">
            {data.dialogues.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Nenhum diálogo registrado até o momento.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {data.dialogues.map((card, index) => {
                  const checklistDone = Object.values(card.checklist || {}).filter(Boolean).length;
                  const charA = card.charAName || 'Interlocutor A';
                  const charB = card.charBName || 'Interlocutor B';

                  return (
                    <div key={card.id || index} className="bg-[#161622] border border-gray-800/80 rounded-xl overflow-hidden shadow-md">
                      <div className="p-3.5 bg-[#1a1a28] border-b border-gray-800/80 flex flex-wrap justify-between items-center gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                            CENA: {card.sceneTitle || 'SEM CENA VINCULADA'}
                          </span>
                          <h3 className="text-sm font-bold text-white">
                            {charA} & {charB}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          {card.atmosphere && (
                            <span className="text-[10px] px-2 py-0.5 bg-amber-950/60 text-amber-300 border border-amber-800/40 rounded-md">
                              {card.atmosphere}
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 bg-purple-950/60 text-purple-300 border border-purple-800/40 rounded-md font-bold">
                            Checklist: {checklistDone}/5
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-[#0d0d14] font-serif text-xs text-gray-300 space-y-2 leading-relaxed">
                        {Array.isArray(card.lines) && card.lines.length > 0 ? (
                          card.lines.map((line, i) => (
                            <p key={i}>
                              — {line.text || '...'}
                              {line.action && (
                                <span className="font-sans text-[11px] italic text-gray-400"> — {line.action}.</span>
                              )}
                            </p>
                          ))
                        ) : (
                          <p className="italic text-gray-500">"{card.content || card.dialogue || card.texto || card.description}"</p>
                        )}

                        {card.subtext && (
                          <p className="font-sans text-[11px] text-amber-400/90 pt-2 border-t border-gray-800/60 italic">
                            <b>Subtexto Oculto:</b> {card.subtext}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 6. MAPA EMOCIONAL */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('mapaEmocional')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📈</span> 6. Mapa Emocional Esperado
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Níveis de Intensidade Emocional</p>
          </div>
          <span className="text-gray-400 font-bold text-lg">{openSections.mapaEmocional ? '⌃' : '⌄'}</span>
        </button>

        {openSections.mapaEmocional && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.emotionalPoints.map((pt) => (
                <div key={pt.id} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80 space-y-2">
                  <strong className="text-white text-sm block border-b border-gray-800 pb-1">{pt.name}</strong>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-300">
                    <span>Curiosidade: <b>{pt.curiosidade}</b></span>
                    <span>Tensão: <b>{pt.tensao}</b></span>
                    <span>Esperança: <b>{pt.esperanca}</b></span>
                    <span>Medo: <b>{pt.medo}</b></span>
                    <span>Choque: <b>{pt.choque}</b></span>
                    <span>Alívio: <b>{pt.alivio}</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 7. CHECKLIST ORGANIZADO EM CATEGORIAS IDÊNTICAS AO MÓDULO CHECKLIST */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('checklist')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>✅</span> 7. Checklist de Qualidade Narrativa
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Organizado pelas 10 Categorias de Qualidade</p>
          </div>
          <span className="text-xs font-bold px-3.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40">
            {checklistDoneCount} Verificações Concluídas
          </span>
        </button>

        {openSections.checklist && (
          <div className="p-6 space-y-8">
            {CHECKLIST_CATEGORIES_ORDER.map((catGroup) => {
              // Filtra quais itens desta categoria foram concluídos ou registrados no banco
              const catDoneItems = catGroup.items.filter((itemText) => !!data.checklist[itemText]);

              if (catDoneItems.length === 0) return null;

              return (
                <div key={catGroup.title} className="space-y-3">
                  {/* Título e Badge da Categoria */}
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2 px-1">
                    <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                      <span>•</span> {catGroup.title}
                    </h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${catGroup.badgeStyle}`}>
                      {catDoneItems.length} / {catGroup.items.length} Concluídos
                    </span>
                  </div>

                  {/* Grid de itens concluídos da Categoria */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {catDoneItems.map((itemText) => (
                      <div
                        key={itemText}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${catGroup.boxStyle}`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${catGroup.checkColor}`}
                        >
                          ✓
                        </span>
                        <span className="line-through opacity-90 font-medium">
                          {itemText}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {checklistDoneCount === 0 && (
              <p className="text-xs text-gray-500 italic text-center py-4">
                Nenhum item do checklist foi marcado como concluído ainda.
              </p>
            )}
          </div>
        )}
      </section>

      {/* 8. MANUSCRITO */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('manuscrito')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📝</span> 8. Escrita & Manuscrito Final
            </h2>
          </div>
          <span className="text-gray-400 font-bold text-lg">{openSections.manuscrito ? '⌃' : '⌄'}</span>
        </button>

        {openSections.manuscrito && (
          <div className="p-6 space-y-6">
            {data.chapters.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Nenhum capítulo redigido ainda.</p>
            ) : (
              data.chapters.map((chap, index) => (
                <article key={chap.id || index} className="p-6 bg-[#171724] rounded-xl border border-gray-800/80 space-y-3">
                  <div className="border-b border-gray-800 pb-2 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">{chap.title}</h3>
                    <span className="text-xs text-purple-400 font-medium">{chap.type}</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {chap.content || 'Sem conteúdo inserido neste capítulo.'}
                  </p>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}