import React, { useState, useEffect } from 'react';
import { Download, FileText, Code, FileCode, Printer, CheckCircle, RefreshCw, XCircle, AlertTriangle } from 'lucide-react';
import apiClient from '../api/apiClient';

const CURRENT_USER_NAME = 'Usuário StoryForge';

// Estilos dinâmicos para Tipos de Personagem
const CHARACTER_TYPES_CONFIG = {
  protagonista: { label: 'Protagonista', icon: '♛', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  antagonista: { label: 'Antagonista', icon: '☠', bg: 'bg-red-500/20 text-red-400 border-red-500/40' },
  secundario: { label: 'Secundário', icon: '♙', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
};

// Paleta Oficial de Relações
const RELATION_TYPES = {
  Amizade: { label: 'Amizade', color: '#10b981', bg: 'bg-emerald-950/80 text-emerald-200 border-emerald-700/60' },
  Família: { label: 'Família', color: '#eab308', bg: 'bg-amber-950/80 text-amber-200 border-amber-700/60' },
  Ódio: { label: 'Ódio / Raiva', color: '#ef4444', bg: 'bg-red-950/80 text-red-200 border-red-700/60' },
  Amor: { label: 'Amor', color: '#ec4899', bg: 'bg-pink-950/80 text-pink-200 border-pink-700/60' },
  Aliança: { label: 'Aliança', color: '#06b6d4', bg: 'bg-cyan-950/80 text-cyan-200 border-cyan-700/60' },
  Rivalidade: { label: 'Rivalidade', color: '#f97316', bg: 'bg-orange-950/80 text-orange-200 border-orange-700/60' },
  Vingança: { label: 'Vingança', color: '#a855f7', bg: 'bg-purple-950/80 text-purple-200 border-purple-700/60' },
  Opressão: { label: 'Opressão', color: '#6b7280', bg: 'bg-gray-800 text-gray-200 border-gray-600' },
  Mentor: { label: 'Mentor', color: '#d97706', bg: 'bg-yellow-950/80 text-yellow-200 border-yellow-700/60' },
};

// Lista Oficial de Emoções para o Mapa Emocional
const EMOTIONS_CONFIG = [
  { key: 'curiosidade', label: 'Curiosidade', color: '#a855f7' },
  { key: 'tensao', label: 'Tensão', color: '#ef4444' },
  { key: 'esperanca', label: 'Esperança', color: '#10b981' },
  { key: 'medo', label: 'Medo', color: '#6366f1' },
  { key: 'tristeza', label: 'Tristeza', color: '#3b82f6' },
  { key: 'choque', label: 'Choque', color: '#f97316' },
  { key: 'alegria', label: 'Alegria', color: '#eab308' },
  { key: 'alivio', label: 'Alívio', color: '#14b8a6' },
];

// Marcos Narrativos
const NARRATIVE_ORDER = [
  'Prólogo', 'Incidente Incitante', '1º Ponto de Virada', 'Midpoint',
  'Crise', 'Clímax', 'Resolução', 'Epílogo'
];

const MILESTONE_THEMES = {
  'Prólogo': { color: 'bg-indigo-600 shadow-indigo-600/80 ring-indigo-950 text-indigo-200', text: 'text-indigo-400' },
  'Incidente Incitante': { color: 'bg-purple-600 shadow-purple-600/80 ring-purple-950 text-purple-200', text: 'text-purple-400' },
  '1º Ponto de Virada': { color: 'bg-blue-600 shadow-blue-600/80 ring-blue-950 text-blue-200', text: 'text-blue-400' },
  'Midpoint': { color: 'bg-cyan-600 shadow-cyan-600/80 ring-cyan-950 text-cyan-200', text: 'text-cyan-400' },
  'Crise': { color: 'bg-amber-600 shadow-amber-600/80 ring-amber-950 text-amber-200', text: 'text-amber-400' },
  'Clímax': { color: 'bg-red-600 shadow-red-600/80 ring-red-950 text-red-200', text: 'text-red-400' },
  'Resolução': { color: 'bg-emerald-600 shadow-emerald-600/80 ring-emerald-950 text-emerald-200', text: 'text-emerald-400' },
  'Epílogo': { color: 'bg-pink-600 shadow-pink-600/80 ring-pink-950 text-pink-200', text: 'text-pink-400' }
};

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
      'O tom do final corresponde ao pacto established com leitor?',
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

export default function StoryBible({ projectId }) {
  const [loading, setLoading] = useState(true);

  // Estados de Controle de Exportação
  const [exportFormat, setExportFormat] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const [openSections, setOpenSections] = useState({
    fundacao: true,
    estrutura: true,
    universo: true,
    relacoes: true,
    cenas: true,
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

  // Garante que o cabeçalho nativo impresso contenha "StoryForge" ao centro e o Nome do Usuário na direita
  useEffect(() => {
  const originalTitle = document.title;
  
  // Pega o ano atual dinamicamente (2026)
  const currentYear = new Date().getFullYear();
  
  // Nome centralizado com o ano + 'Projeto executado por' e Nome do Usuário à direita
  const siteInfo = `StoryForge (${currentYear})`;
  const userInfo = `Projeto executado por: ${CURRENT_USER_NAME}`;

  // Usamos caracteres de espaço não-quebráveis (\u00A0) para forçar o alinhamento
  document.title = `${siteInfo} \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 ${userInfo}`;

  return () => {
    document.title = originalTitle;
  };
}, [data]);

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

  function getFieldValue(item, key) {
    if (!item) return 'Não informado.';
    if (item[key] !== undefined && item[key] !== null && String(item[key]).trim() !== '') {
      return item[key];
    }
    if (item.details && item.details[key] !== undefined && item.details[key] !== null && String(item.details[key]).trim() !== '') {
      return item.details[key];
    }
    return 'Não informado.';
  }

  function getCharacterName(charId) {
    if (!charId) return 'Desconhecido';
    const found = data.characters.find((c) => String(c.id) === String(charId));
    if (found) {
      return found.name || found.nome || found.title || (found.details && found.details.nome) || `Personagem #${charId}`;
    }
    return `Personagem #${charId}`;
  }

  function getSceneTitle(sceneOrId) {
    if (!sceneOrId) return 'Geral (Sem cena vinculada)';
    
    if (typeof sceneOrId === 'object') {
      if (sceneOrId.sceneTitle && !sceneOrId.sceneTitle.includes('#')) {
        return sceneOrId.sceneTitle;
      }
      sceneOrId = sceneOrId.sceneId;
    }

    const found = data.scenes.find((s) => String(s.id) === String(sceneOrId));
    if (found) {
      return found.title || found.titulo || found.name || 'Cena sem título';
    }

    const sceneIdStr = String(sceneOrId);
    if (sceneIdStr.includes('-')) {
      return 'Cena Vinculada';
    }

    return `Cena #${sceneIdStr}`;
  }

  // Métodos de Exportação
  const handleOpenExportModal = (fmt) => {
    setExportFormat(fmt);
    setConfirmModalOpen(true);
  };

  const handleStartExport = async () => {
    setConfirmModalOpen(false);

    const title = data.identity['Título'] || data.identity['title'] || 'StoryBible';
    const dateStr = new Date().toLocaleDateString('pt-BR');

    try {
      if (exportFormat === 'pdf') {
        // Expande todas as seções antes de chamar a janela de impressão
        setOpenSections({
          fundacao: true,
          estrutura: true,
          universo: true,
          relacoes: true,
          cenas: true,
          mapaEmocional: true,
          checklist: true,
          manuscrito: true,
        });

        // Delay para garantir que o DOM do React renderize todo o documento antes de capturar
        setTimeout(() => {
          window.print();
        }, 800);

      } else if (exportFormat === 'json') {
        const jsonContent = {
          exportMeta: {
            exportedBy: CURRENT_USER_NAME,
            exportedAt: new Date().toISOString(),
            appVersion: '1.0',
          },
          projectData: data,
        };
        downloadFile(`${title.replace(/\s+/g, '_')}_StoryBible.json`, JSON.stringify(jsonContent, null, 2), 'application/json');

      } else if (exportFormat === 'md') {
        let md = `# ${title}\n\n`;
        md += `> **Autor:** ${CURRENT_USER_NAME} | **Data:** ${dateStr}\n\n`;
        downloadFile(`${title.replace(/\s+/g, '_')}_StoryBible.md`, md, 'text/markdown');
      }
    } catch (err) {
      console.error('Erro na exportação:', err);
    }
  };

  const downloadFile = (filename, content, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

    return { name, label: displayLabel, active, events, activeColor: theme.color, textClass: theme.text };
  });

  const checklistDoneCount = Object.values(data.checklist).filter(Boolean).length;

  if (loading) {
    return <div className="text-center py-20 text-purple-400 font-medium">Gerando e compilando a StoryBible...</div>;
  }

  return (
    <main className="story-bible-page max-w-6xl mx-auto space-y-8 pb-32 text-gray-200 font-sans">
      {/* RESET TOTAL DE IMPRESSÃO */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1.2cm;
          }

          /* Oculta apenas os elementos interativos de tela */
          .print\\:hidden, .no-print, .print-hide, button, .sidebar, aside, nav, .fixed, [role="dialog"] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }

          body > *:not(#root) {
            display: none !important;
          }

          #root, main, [class*="app"], [class*="layout"] {
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            position: static !important;
          }

          /* Reset de Layout Global para fluxo contínuo */
          html, body, #root, main, section, article {
            background: #ffffff !important;
            color: #000000 !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 10pt !important;
            line-height: 1.4 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            position: static !important;
            transform: none !important;
            box-shadow: none !important;
          }

          div:not(.print\\:hidden):not(.no-print) {
            background: transparent !important;
            color: #000000 !important;
            box-shadow: none !important;
          }

          /* Cabeçalho do Relatório Impresso */
          header {
            border: none !important;
            border-bottom: 2px solid #000000 !important;
            padding-bottom: 10px !important;
            margin-bottom: 16px !important;
            background: transparent !important;
          }

          header h1 {
            font-size: 48pt !important;
            font-weight: bold !important;
            color: #000000 !important;
            margin: 0 !important;
          }

          header h2 {
            font-size: 16pt !important;
            color: #444444 !important;
            margin-top: 2px !important;
          }

          /* Seções como blocos de relatório */
          section {
            border: none !important;
            border-bottom: 1px solid #cccccc !important;
            padding: 8px 0 !important;
            margin-bottom: 16px !important;
            page-break-inside: auto !important;
            background: transparent !important;
          }

          section h2 {
            font-size: 12pt !important;
            font-weight: bold !important;
            color: #000000 !important;
            border-bottom: 1px solid #000000 !important;
            padding-bottom: 4px !important;
            margin-bottom: 10px !important;
            text-transform: uppercase;
          }

          section h3 {
            font-size: 10.5pt !important;
            font-weight: bold !important;
            color: #222222 !important;
            margin-top: 8px !important;
            margin-bottom: 4px !important;
          }

          /* Transforma Grid/Flex de tela em Lista Vertical Simples na Impressão */
          .grid, .flex {
            display: block !important;
            width: 100% !important;
          }

          .grid > div, .space-y-3 > div, .space-y-4 > div, .space-y-2 > div {
            background: transparent !important;
            border: none !important;
            border-left: 2px solid #444444 !important;
            padding-left: 10px !important;
            margin-bottom: 10px !important;
            page-break-inside: avoid !important;
          }

          p, span, strong, b {
            color: #000000 !important;
            background: transparent !important;
          }

          /* Oculta a linha do tempo gráfica na impressão */
          .timeline-interactive {
            display: none !important;
          }

          /* Exibe a linha do tempo textual na impressão */
          .timeline-printable {
            display: block !important;
          }
        }

        .timeline-printable {
          display: none;
        }
      `}</style>

      {/* BARRA DE FERRAMENTAS EXCLUSIVA PARA A TELA */}
      <div className="flex justify-between items-center bg-[#11111a] border border-purple-900/40 p-6 rounded-2xl shadow-2xl mb-8 print:hidden relative overflow-hidden no-print">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-amber-500" />
        <div>
          <span className="text-xs uppercase tracking-widest text-purple-400 font-bold">
            📖 DOCUMENTO MESTRE NARRATIVO
          </span>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mt-1">
            {data.identity['Título'] || data.identity['title'] || 'StoryBible'}
          </h1>
          {data.identity['Subtítulo'] && (
            <h2 className="text-lg text-purple-300 font-medium">{data.identity['Subtítulo']}</h2>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleOpenExportModal('pdf')}
            className="px-3.5 py-2 bg-[#181824] hover:bg-purple-950/60 border border-purple-800/50 text-purple-300 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={14} /> PDF / Imprimir
          </button>
          <button
            type="button"
            onClick={() => handleOpenExportModal('json')}
            className="px-3.5 py-2 bg-[#181824] hover:bg-amber-950/60 border border-amber-800/50 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <FileCode size={14} /> JSON
          </button>
        </div>
      </div>

      {/* CABEÇALHO EXCLUSIVO PARA O PDF / IMPRESSÃO */}
      <header className="hidden print:block mb-8 pb-4 mt-0">
        
        {/* 1. TERMO LEGAL (POSICIONADO BEM NO TOPO E SEPARADO POR UMA LINHA DISCRETA) */}
        <div className="border-b border-gray-300 pb-3 mb-5">
          <p className="text-[8pt] text-gray-600 italic leading-snug">
            Este projeto é de autoria de <strong>{CURRENT_USER_NAME}</strong>, exportado em <strong>{new Date().toLocaleDateString('pt-BR')}</strong>. O StoryForge atua exclusivamente como ferramenta de organização e estruturação narrativa, não constituindo nem substituindo o registro oficial de direitos autorais perante órgãos competentes.
          </p>
        </div>

        {/* 2. BLOCO DO TÍTULO E SUBTÍTULO (AMPLIADOS E COM SEPARAÇÃO VISUAL CLARA) */}
        <div className="space-y-3 pt-1">
          {/* Título Principal Ampliado */}
          <h1 className="text-4xl font-extrabold text-black uppercase tracking-tight leading-none">
            {data.identity['Título'] || data.identity['title'] || 'StoryBible'}
          </h1>

          {/* Subtítulo Separado com Borda Lateral e Recuo */}
          {data.identity['Subtítulo'] && (
            <h2 className="text-base font-semibold text-gray-600 italic border-l-2 border-gray-400 pl-3 mt-2">
              {data.identity['Subtítulo']}
            </h2>
          )}
        </div>

        {/* 3. LINHA DIVISÓRIA PRINCIPAL PARA O CONTEÚDO NARRATIVO */}
        <div className="w-full h-[2px] bg-black mt-5" />
      </header>

      {/* 1. FUNDAÇÃO */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button type="button" onClick={() => toggleSection('fundacao')} className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer print:p-0 print:bg-transparent">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>🏛</span> 1. Fundação</h2>
            <p className="text-xs text-gray-400 mt-0.5 print:hidden">Identidade, Essência e Engenharia Narrativa</p>
          </div>
          <span className="text-gray-400 font-bold text-lg print:hidden">{openSections.fundacao ? '⌃' : '⌄'}</span>
        </button>

        {openSections.fundacao && (
          <div className="p-6 space-y-8 print:p-0 print:space-y-4">
            <div>
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Identidade da Obra</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1">
                {Object.entries(data.identity).map(([key, val]) => (
                  <div key={key} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80">
                    <span className="text-xs font-semibold text-gray-400 block mb-1">{key}</span>
                    <p className="text-sm text-gray-200 leading-relaxed">{val || 'Não preenchido.'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/60 print:pt-2">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Essência da História</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1">
                {Object.entries(data.essencia).map(([key, val]) => (
                  <div key={key} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80">
                    <span className="text-xs font-semibold text-gray-400 block mb-1">{key}</span>
                    <p className="text-sm text-gray-200 leading-relaxed">{val || 'Não preenchido.'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/60 print:pt-2">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">Engenharia Narrativa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1">
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
        <button type="button" onClick={() => toggleSection('estrutura')} className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer print:p-0 print:bg-transparent">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>⏳</span> 2. Arquitetura Dramática & Ritmo</h2>
            <p className="text-xs text-gray-400 mt-0.5 print:hidden">Frameworks Selecionados e Linha do Tempo Ordenada</p>
          </div>
          <span className="text-gray-400 font-bold text-lg print:hidden">{openSections.estrutura ? '⌃' : '⌄'}</span>
        </button>

        {openSections.estrutura && (
          <div className="p-6 space-y-8 print:p-0 print:space-y-4">
            <div>
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-4">LINHA DO TEMPO (ESTRUTURA DE 3 ATOS)</h3>
              
              {/* VERSÃO TELA DA LINHA DO TEMPO (INTERATIVA) */}
              <div className="timeline-interactive p-6 bg-[#171724] border border-gray-800/80 rounded-2xl">
                <div className="relative flex justify-between items-center max-w-5xl mx-auto px-4">
                  <div className="absolute top-3 left-6 right-6 h-1 bg-[#181824] z-0" />
                  {milestonesList.map((m, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center group">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${m.active ? `${m.activeColor} shadow-lg ring-4 scale-110` : 'bg-[#181824] border-2 border-gray-700 text-gray-600'}`}>
                        <span className="text-[10px] font-extrabold">{m.active ? '✦' : '◇'}</span>
                      </div>
                      <span className={`text-[10px] font-bold mt-3 text-center max-w-[70px] leading-tight ${m.active ? 'text-purple-300 font-extrabold' : 'text-gray-500'}`}>
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* VERSÃO DE IMPRESSÃO DA LINHA DO TEMPO (TEXTUAL, ORDENADA E DETALHADA) */}
              <div className="timeline-printable space-y-3">
                {milestonesList.map((m, idx) => {
                  const eventCount = Array.isArray(m.events) ? m.events.length : 0;
                  return (
                    <div key={idx} className="border-l-2 border-gray-600 pl-3 py-1">
                      <strong className="text-sm font-bold block">{idx + 1}. {m.name}</strong>
                      {eventCount > 0 ? (
                        <div className="space-y-1 mt-1 text-xs">
                          {m.events.map((ev, evIdx) => (
                            <p key={evIdx} className="text-gray-800">
                              • {ev.title || ev.titulo || ev.name || ev.description || JSON.stringify(ev)}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">Nenhum evento registrado para este marco.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/60 print:pt-2">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">
                Frameworks Selecionados: {data.structureFrameworks.join(', ') || 'Nenhum selecionado'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1">
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
            </div>
          </div>
        )}
      </section>

      {/* 3. UNIVERSO & PERSONAGENS */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button type="button" onClick={() => toggleSection('universo')} className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer print:p-0 print:bg-transparent">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>🌍</span> 3. O Universo & Personagens</h2>
            <p className="text-xs text-gray-400 mt-0.5 print:hidden">Worldbuilding e Dossiês dos Personagens</p>
          </div>
          <span className="text-gray-400 font-bold text-lg print:hidden">{openSections.universo ? '⌃' : '⌄'}</span>
        </button>

        {openSections.universo && (
          <div className="p-6 space-y-8 print:p-0 print:space-y-4">
            <div>
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Elementos do Mundo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-1">
                {data.world.map((w) => (
                  <div key={w.id || Math.random()} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80 space-y-2">
                    <strong className="text-white font-bold text-sm block">{w.name || w.nome || w.title}</strong>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40 inline-block">
                      {w.type || w.tipo || 'Mundo'}
                    </span>
                    <p className="text-xs text-gray-400 leading-relaxed">{w.description || w.descricao || 'Sem descrição.'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/60 print:pt-2">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Personagens</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1">
                {data.characters.map((char) => {
                  const typeKey = String(char.type || char.papel || char.role || 'protagonista').toLowerCase();
                  const typeStyle = CHARACTER_TYPES_CONFIG[typeKey] || CHARACTER_TYPES_CONFIG.protagonista;
                  const charName = char.name || char.nome || char.title || (char.details && char.details.nome) || 'Novo Personagem';
                  const charDesc = char.description || char.descricao || char.role || (char.details && char.details.descricao);

                  return (
                    <div key={char.id || Math.random()} className="p-5 bg-[#171724] rounded-xl border border-gray-800/80 space-y-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="text-white font-bold text-base">{charName}</h4>
                          <span className={`inline-block border px-2 py-0.5 rounded text-[10px] font-bold ${typeStyle.bg}`}>
                            {typeStyle.label}
                          </span>
                        </div>
                      </div>
                      {charDesc && (
                        <p className="text-xs text-gray-300 leading-relaxed border-t border-gray-800/60 pt-2 print:border-none">
                          {charDesc}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. RELAÇÕES & DINÂMICA DE PERSONAGENS */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button type="button" onClick={() => toggleSection('relacoes')} className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer print:p-0 print:bg-transparent">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>🔀</span> 4. Relações & Dinâmica de Personagens</h2>
            <p className="text-xs text-gray-400 mt-0.5 print:hidden">Conexões, Alianças, Rivalidades e Nível de Intensidade</p>
          </div>
          <span className="text-gray-400 font-bold text-lg print:hidden">{openSections.relacoes ? '⌃' : '⌄'}</span>
        </button>

        {openSections.relacoes && (
          <div className="p-6 print:p-0">
            {data.relations.length === 0 ? (
              <p className="text-xs text-gray-500 italic">Nenhuma relação cadastrada.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-1">
                {data.relations.map((rel) => {
                  const relConfig = RELATION_TYPES[rel.type] || { bg: 'bg-purple-950/80 text-purple-200 border-purple-700/60' };
                  const nameA = getCharacterName(rel.charAId || rel.characterAId);
                  const nameB = getCharacterName(rel.charBId || rel.characterBId);
                  const sceneName = getSceneTitle(rel.sceneId);

                  return (
                    <div key={rel.id || Math.random()} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80 space-y-3">
                      <div className="flex items-center justify-between gap-2 text-xs font-bold text-white border-b border-gray-800 pb-2 print:border-none">
                        <span className="text-purple-300">{nameA}</span>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${relConfig.bg}`}>
                          {rel.type || 'Relação'} ({rel.intensity || 5}/10)
                        </span>
                        <span className="text-purple-300">{nameB}</span>
                      </div>

                      <div className="space-y-1 text-xs">
                        {sceneName && (
                          <div className="text-[11px] text-gray-400 flex items-center gap-1">
                            <span className="text-amber-400 font-bold">🎬 Cena:</span> {sceneName}
                          </div>
                        )}
                        {(rel.description || rel.descricao) && (
                          <p className="text-gray-300 italic pt-1 leading-relaxed">
                            "{rel.description || rel.descricao}"
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

      {/* 5. ARQUITETURA DAS CENAS, MISTÉRIOS & SUBTRAMAS */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button type="button" onClick={() => toggleSection('cenas')} className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer print:p-0 print:bg-transparent">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>🎬</span> 5. Arquitetura das Cenas, Mistérios & Subtramas</h2>
            <p className="text-xs text-gray-400 mt-0.5 print:hidden">Decupagem Completa de Cenas, Diálogos, Segredos e Plot Twists</p>
          </div>
          <span className="text-gray-400 font-bold text-lg print:hidden">{openSections.cenas ? '⌃' : '⌄'}</span>
        </button>

        {openSections.cenas && (
          <div className="p-6 space-y-8 print:p-0 print:space-y-4">
            {/* CENAS NARRATIVAS */}
            <div>
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Cenas Narrativas</h3>
              {data.scenes.length === 0 ? (
                <p className="text-xs text-gray-500 italic">Nenhuma cena cadastrada.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1">
                  {data.scenes.map((s) => {
                    const sceneTitle = s.title || s.titulo || s.name || `Cena #${s.id}`;
                    return (
                      <div key={s.id || Math.random()} className="p-5 bg-[#171724] rounded-xl border border-gray-800/80 space-y-3">
                        <div className="flex justify-between items-start border-b border-gray-800 pb-2 print:border-none">
                          <strong className="text-white text-base font-bold">{sceneTitle}</strong>
                          {(s.emotion || s.emocao) && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                              {s.emotion || s.emocao}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400 bg-[#12121a] p-2.5 rounded-lg border border-gray-800/50 print:bg-transparent print:p-0">
                          <div><strong className="text-gray-300">📍 Local:</strong> {s.location || s.local || 'Não informado'}</div>
                          <div><strong className="text-gray-300">⏰ Horário:</strong> {s.time || s.horario || 'Não informado'}</div>
                        </div>

                        {(s.objective || s.objetivo) && (
                          <div className="text-xs text-gray-300">
                            <strong className="text-amber-400">🎯 Objetivo:</strong> {s.objective || s.objetivo}
                          </div>
                        )}

                        {(s.conflict || s.conflito) && (
                          <div className="text-xs text-gray-300">
                            <strong className="text-red-400">⚔️ Conflito:</strong> {s.conflict || s.conflito}
                          </div>
                        )}

                        {(s.summary || s.resumo || s.description || s.descricao) && (
                          <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-800/60 pt-2 print:border-none">
                            {s.summary || s.resumo || s.description || s.descricao}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* DIÁLOGOS DESTACADOS */}
            <div className="pt-4 border-t border-gray-800/60 print:pt-2">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">Diálogos Destacados & Subtexto</h3>
              {data.dialogues.length === 0 ? (
                <p className="text-xs text-gray-500 italic">Nenhum diálogo registrado.</p>
              ) : (
                <div className="space-y-4">
                  {data.dialogues.map((d) => {
                    const sceneTitle = getSceneTitle(d);
                    const charA = d.charAName || getCharacterName(d.charAId);
                    const charB = d.charBName || getCharacterName(d.charBId);

                    return (
                      <div key={d.id || Math.random()} className="p-5 bg-[#171724] rounded-xl border border-gray-800/80 space-y-3">
                        <div className="flex justify-between items-center border-b border-gray-800 pb-2 print:border-none">
                          <strong className="text-white text-sm font-bold">{charA} & {charB}</strong>
                          <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-700/60 px-2.5 py-1 rounded-md">
                            🎬 {sceneTitle}
                          </span>
                        </div>

                        {d.lines && Array.isArray(d.lines) && (
                          <div className="space-y-2 bg-[#12121a] p-3 rounded-lg border border-gray-800/50 font-serif text-xs leading-relaxed text-gray-300 print:bg-transparent print:p-0">
                            {d.lines.map((line, lIdx) => (
                              <p key={lIdx}>
                                — {line.text}
                                {line.action && <span className="font-sans text-[11px] italic text-gray-400"> — {line.action}.</span>}
                              </p>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1 print:grid-cols-1">
                          {(d.subtext || d.subtexto) && (
                            <div className="p-2.5 bg-[#12121a] rounded-lg border border-gray-800/50 print:p-0">
                              <strong className="text-amber-400 block mb-0.5">👁️ Subtexto Oculto:</strong>
                              <span className="text-gray-300">{d.subtext || d.subtexto}</span>
                            </div>
                          )}
                          {(d.soundLayer || d.camadaSonora || d.atmosphere) && (
                            <div className="p-2.5 bg-[#12121a] rounded-lg border border-gray-800/50 print:p-0">
                              <strong className="text-cyan-400 block mb-0.5">🔊 Camada Sonora / Atmosfera:</strong>
                              <span className="text-gray-300">{d.soundLayer || d.camadaSonora || d.atmosphere}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* MISTÉRIOS & PLOT TWISTS */}
            <div className="pt-4 border-t border-gray-800/60 grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1 print:pt-2">
              <div>
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3">Mistérios & Pistas</h3>
                {data.mysteries.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">Nenhum mistério registrado.</p>
                ) : (
                  <div className="space-y-3">
                    {data.mysteries.map((m) => (
                      <div key={m.id || Math.random()} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80 space-y-2">
                        <strong className="text-white text-sm font-bold block">{getFieldValue(m, 'title')}</strong>
                        <div className="grid grid-cols-1 gap-2 text-xs text-gray-300 pt-1">
                          <div><b className="text-purple-400">Quem Sabe:</b> {getFieldValue(m, 'whoKnows')}</div>
                          <div><b className="text-purple-400">Pistas:</b> {getFieldValue(m, 'clues')}</div>
                          <div><b className="text-purple-400">Falsas Pistas:</b> {getFieldValue(m, 'falseClues')}</div>
                          <div><b className="text-purple-400">Revelação:</b> {getFieldValue(m, 'revelation')}</div>
                          <div><b className="text-purple-400">Impacto:</b> {getFieldValue(m, 'impact')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">Plot Twists & Viradas</h3>
                {data.twists.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">Nenhum plot twist registrado.</p>
                ) : (
                  <div className="space-y-3">
                    {data.twists.map((t) => (
                      <div key={t.id || Math.random()} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80 space-y-2">
                        <strong className="text-white text-sm font-bold block">{getFieldValue(t, 'title')}</strong>
                        <div className="grid grid-cols-1 gap-2 text-xs text-gray-300 pt-1">
                          <div><b className="text-red-400">Planejamento:</b> {getFieldValue(t, 'planning')}</div>
                          <div><b className="text-red-400">Foreshadowing:</b> {getFieldValue(t, 'foreshadowing')}</div>
                          <div><b className="text-red-400">Momento da Revelação:</b> {getFieldValue(t, 'revelationMoment')}</div>
                          <div><b className="text-red-400">Consequência:</b> {getFieldValue(t, 'consequence')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 6. MAPA EMOCIONAL & CURVA DE TENSÃO */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button type="button" onClick={() => toggleSection('mapaEmocional')} className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer print:p-0 print:bg-transparent">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>📈</span> 6. Mapa Emocional & Curva de Tensão</h2>
            <p className="text-xs text-gray-400 mt-0.5 print:hidden">Variação da Carga Emocional com Respectivas Cores e Picos Dramáticos</p>
          </div>
          <span className="text-gray-400 font-bold text-lg print:hidden">{openSections.mapaEmocional ? '⌃' : '⌄'}</span>
        </button>

        {openSections.mapaEmocional && (
          <div className="p-6 print:p-0">
            {data.emotionalPoints.length === 0 ? (
              <p className="text-xs text-gray-500 italic">Nenhum ponto registrado no mapa emocional.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-1">
                {data.emotionalPoints.map((pt, idx) => {
                  const ptTitle = pt.name || pt.title || pt.titulo || pt.nome || `Ponto #${idx + 1}`;

                  return (
                    <div key={pt.id || idx} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80 space-y-3">
                      <strong className="text-white text-sm font-bold block border-b border-gray-800 pb-2 print:border-none">{ptTitle}</strong>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {EMOTIONS_CONFIG.map((e) => {
                          const val = pt[e.key];
                          if (val === undefined || val === null || val === 0) return null;
                          return (
                            <span
                              key={e.key}
                              className="px-2 py-0.5 text-[11px] font-bold"
                            >
                              {e.label}: {val}/10
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 7. CHECKLIST COM CORES E ESTADOS VISUAIS MANTIDOS NA TELA */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button type="button" onClick={() => toggleSection('checklist')} className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer print:p-0 print:bg-transparent">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>✅</span> 7. Checklist de Qualidade Narrativa</h2>
            <p className="text-xs text-gray-400 mt-0.5 print:hidden">Organizado pelas 10 Categorias de Qualidade</p>
          </div>
          <span className="text-xs font-bold px-3.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40 print:hidden">
            {checklistDoneCount} Verificações Concluídas
          </span>
        </button>

        {openSections.checklist && (
          <div className="p-6 space-y-8 print:p-0 print:space-y-4">
            {CHECKLIST_CATEGORIES_ORDER.map((catGroup) => {
              const catDoneItems = catGroup.items.filter((itemText) => !!data.checklist[itemText]);
              if (catDoneItems.length === 0) return null;

              return (
                <div key={catGroup.title} className="space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2 px-1 print:border-none">
                    <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                      <span>•</span> {catGroup.title}
                    </h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${catGroup.badgeStyle} print:hidden`}>
                      {catDoneItems.length} / {catGroup.items.length} Concluídos
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-1">
                    {catDoneItems.map((itemText) => (
                      <div
                        key={itemText}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${catGroup.boxStyle} print:border-none print:p-0 print:bg-transparent`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${catGroup.checkColor} print:hidden`}>
                          ✓
                        </div>
                        <span className="text-xs font-medium leading-relaxed line-through opacity-80 print:no-underline print:opacity-100 print:text-black">
                          {itemText}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 8. ESCRITA & MANUSCRITO */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button type="button" onClick={() => toggleSection('manuscrito')} className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer print:p-0 print:bg-transparent">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>✍️</span> 8. Escrita & Manuscrito</h2>
            <p className="text-xs text-gray-400 mt-0.5 print:hidden">Capítulos Desenvolvidos e Texto Final da Obra</p>
          </div>
          <span className="text-gray-400 font-bold text-lg print:hidden">{openSections.manuscrito ? '⌃' : '⌄'}</span>
        </button>

        {openSections.manuscrito && (
          <div className="p-6 space-y-6 print:p-0 print:space-y-4">
            {data.chapters.length === 0 ? (
              <p className="text-xs text-gray-500 italic">Nenum capítulo escrito até o momento.</p>
            ) : (
              data.chapters.map((ch, index) => (
                <div key={ch.id || index} className="p-6 bg-[#171724] border border-gray-800/80 rounded-2xl space-y-3 print:p-0">
                  <div className="border-b border-gray-800 pb-2 print:border-none">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                      Capítulo {ch.number || ch.numero || index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-white">{ch.title || ch.titulo || 'Sem Título'}</h3>
                  </div>
                  <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-serif">
                    {ch.content || ch.texto || ch.text || 'Capítulo em branco.'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* MODAL CONFIRMAÇÃO DE EXPORTAÇÃO */}
      {confirmModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Confirmar Exportação</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Deseja exportar a StoryBible completa de <b>"{data.identity['Título'] || 'Sem Título'}"</b> no formato <b className="uppercase text-purple-400">{exportFormat}</b>?
            </p>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleStartExport} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer">
                OK (Iniciar Exportação)
              </button>
              <button type="button" onClick={() => setConfirmModalOpen(false)} className="px-4 py-2.5 bg-[#1c1c26] text-gray-400 hover:text-white font-bold text-xs rounded-xl cursor-pointer">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}