import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';

const chapterTypes = ['Prólogo', 'Capítulo', 'Cena', 'Ato', 'Parte', 'Epílogo'];

const guideTabs = {
  Objetivo: (
    <p>Produzir o texto final da obra, capítulo por capítulo, com apoio do programa.</p>
  ),
  Dicas: (
    <ul>
      <li>Use os elementos já criados (personagens, cenas, mundo) como base para a escrita.</li>
      <li>Abra os itens de Apoio Visual na seção inferior para consultar suas ideias com espaço de sobra.</li>
    </ul>
  ),
  Exemplos: (
    <ul>
      <li>Capítulo 1: Abertura que apresenta o protagonista e o mundo.</li>
      <li>Capítulo 2: Incidente incitante que inicia a jornada.</li>
    </ul>
  ),
  Perguntas: (
    <ul>
      <li>Qual é o foco deste capítulo?</li>
      <li>Quais elementos da pré-produção se encaixam aqui?</li>
      <li>O ritmo deste capítulo serve ao conjunto da obra?</li>
    </ul>
  ),
};

function EscritaGuide() {
  const [activeTab, setActiveTab] = useState('Objetivo');
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="module-guide character-guide mb-6">
      <button
        className="guide-toggle cursor-pointer"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>
          <b aria-hidden="true">💡</b> Guia do Módulo
        </span>
        <span aria-hidden="true">{isOpen ? '⌃' : '⌄'}</span>
      </button>

      {isOpen && (
        <div className="guide-content">
          <nav className="guide-tabs" aria-label="Guia do módulo">
            {Object.keys(guideTabs).map((tab) => (
              <button
                className={
                  activeTab === tab
                    ? 'guide-tab active cursor-pointer'
                    : 'guide-tab cursor-pointer'
                }
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
              >
                <span aria-hidden="true">
                  {tab === 'Objetivo'
                    ? '◎'
                    : tab === 'Dicas'
                    ? '💡'
                    : tab === 'Exemplos'
                    ? '📖'
                    : '?'}
                </span>
                {tab}
              </button>
            ))}
          </nav>
          <div className="guide-description">{guideTabs[activeTab]}</div>
        </div>
      )}
    </section>
  );
}

function getCharacterBadgeStyle(type = '') {
  const normalized = String(type).toLowerCase().trim();
  if (normalized.includes('protagonista')) {
    return 'bg-purple-900/60 text-purple-300 border-purple-500/50';
  }
  if (normalized.includes('antagonista')) {
    return 'bg-red-900/60 text-red-300 border-red-500/50';
  }
  if (normalized.includes('secundario') || normalized.includes('secundário')) {
    return 'bg-blue-900/60 text-blue-300 border-blue-500/50';
  }
  return 'bg-gray-800 text-gray-300 border-gray-700';
}

export default function Escrita({ projectId, onNavigate }) {
  const [chapters, setChapters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Capítulo');
  const [draggedId, setDraggedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Categoria ativa no Apoio Visual
  const [activeDrawer, setActiveDrawer] = useState('personagens');
  const [searchTerm, setSearchTerm] = useState('');
  const [referenceData, setReferenceData] = useState({
    personagens: [],
    mundo: [],
    estrutura: [],
    ritmo: [],
    cenas: [],
    misterios: [],
    twists: [],
  });

  // Carregar Capítulos e Dados de Apoio
  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          resChapters,
          resChars,
          resWorld,
          resStruct,
          resPacing,
          resScenes,
          resMysteries,
          resTwists,
        ] = await Promise.all([
          apiClient.get(`/entities/projects/${projectId}/chapters`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/characters`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/world`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/structure`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/pacing`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/scenes`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/mysteries`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/twists`).catch(() => ({ data: [] })),
        ]);

        const loadedChapters = resChapters.data || [];
        setChapters(loadedChapters);
        if (loadedChapters.length > 0) {
          setSelectedId(loadedChapters[0].id);
        }

        setReferenceData({
          personagens: (resChars.data || []).map((c) => ({
            id: c.id,
            nome: c.name || c.nome,
            type: c.type || c.archetype,
            imageUrl: c.imageUrl || c.avatarUrl || c.image || null,
            ...(c.details || {}),
            pageKey: 'personagens',
          })),
          mundo: (resWorld.data || []).map((w) => ({
            id: w.id,
            name: w.name,
            type: w.type,
            description: w.description,
            pageKey: 'mundo',
          })),
          estrutura: (resStruct.data || []).map((s) => ({
            id: s.id,
            title: s.title || s.beat || s.name || 'Ponto Estrutural',
            type: s.act || s.stage || s.type || 'Estrutura',
            ...s,
            pageKey: 'estrutura',
          })),
          ritmo: (resPacing.data || []).map((p) => ({
            id: p.id,
            title: p.title || p.sceneTitle || p.name || 'Evento da Timeline',
            type: p.intensity ? `Intensidade: ${p.intensity}` : p.pace || p.type || 'Timeline',
            ...p,
            pageKey: 'ritmo',
          })),
          cenas: (resScenes.data || []).map((s) => ({
            id: s.id,
            title: s.title,
            ...s,
            pageKey: 'cenas',
          })),
          misterios: (resMysteries.data || []).map((m) => ({
            id: m.id,
            title: m.title,
            ...m,
            pageKey: 'misterios',
          })),
          twists: (resTwists.data || []).map((t) => ({
            id: t.id,
            title: t.title,
            ...t,
            pageKey: 'plot-twists',
          })),
        });
      } catch (err) {
        console.error('Erro ao carregar dados do manuscrito:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Progresso
  const POINTS_PER_CHAPTER = 10;
  const totalPossiblePoints = chapters.length * POINTS_PER_CHAPTER;
  let currentPoints = 0;

  chapters.forEach((c) => {
    if (c.title && c.title.trim()) currentPoints += 1;
    if (c.type) currentPoints += 1;

    if (c.content && c.content.trim()) {
      const wordCount = c.content.trim().split(/\s+/).length;
      if (wordCount > 300) currentPoints += 8;
      else if (wordCount > 100) currentPoints += 5;
      else if (wordCount > 0) currentPoints += 2;
    }
  });

  const progressPercentage =
    totalPossiblePoints > 0
      ? Math.round((currentPoints / totalPossiblePoints) * 100)
      : 0;

  const selectedChapter = chapters.find((c) => c.id === selectedId);

  // Criar capítulo
  async function handleAddChapter() {
    if (!newTitle.trim() || !projectId) return;

    try {
      const payload = {
        title: newTitle.trim(),
        type: newType,
        content: '',
      };

      const res = await apiClient.post(`/entities/projects/${projectId}/chapters`, payload);
      const created = res.data;

      setChapters((prev) => [...prev, created]);
      setSelectedId(created.id);
      setNewTitle('');
      setNewType('Capítulo');
      setIsCreating(false);
    } catch (err) {
      console.error('Erro ao criar capítulo:', err);
      alert('Não foi possível criar o capítulo.');
    }
  }

  // Auto-save
  const updateTimeoutRef = useRef({});

  function updateSelectedChapter(key, value) {
    setChapters((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, [key]: value } : c))
    );

    if (!selectedId) return;

    if (updateTimeoutRef.current[selectedId]) {
      clearTimeout(updateTimeoutRef.current[selectedId]);
    }

    updateTimeoutRef.current[selectedId] = setTimeout(async () => {
      try {
        const targetChapter = chapters.find((c) => c.id === selectedId);
        if (!targetChapter) return;

        const updatedData = { ...targetChapter, [key]: value };
        await apiClient.put(`/entities/chapters/${selectedId}`, updatedData);
      } catch (err) {
        console.error('Erro ao salvar capítulo automaticamente:', err);
      }
    }, 1000);
  }

  // Excluir capítulo
  async function handleDeleteChapter(id, event) {
    event.stopPropagation();
    if (!window.confirm('Deseja excluir este capítulo?')) return;

    try {
      await apiClient.delete(`/entities/chapters/${id}`);
      setChapters((prev) => prev.filter((c) => c.id !== id));
      if (selectedId === id) {
        const remaining = chapters.filter((c) => c.id !== id);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error('Erro ao excluir capítulo:', err);
      alert('Erro ao excluir o capítulo.');
    }
  }

  function handleDrop(targetId) {
    if (!draggedId || draggedId === targetId) return;

    setChapters((prev) => {
      const fromIndex = prev.findIndex((c) => c.id === draggedId);
      const toIndex = prev.findIndex((c) => c.id === targetId);
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });

    setDraggedId(null);
  }

  // Renderiza ESTRITAMENTE campos preenchidos pelo usuário
  function renderFilledFields(item) {
    const ignoredKeys = [
      'id',
      'name',
      'nome',
      'title',
      'type',
      'pageKey',
      'projectId',
      'createdAt',
      'updatedAt',
      'imageUrl',
      'avatarUrl',
      'image',
      'beat',
      'sceneTitle',
    ];

    const entries = Object.entries(item).filter(
      ([key, val]) =>
        !ignoredKeys.includes(key) &&
        val !== null &&
        val !== undefined &&
        typeof val === 'string' &&
        val.trim() !== ''
    );

    if (entries.length === 0) return null;

    const fieldLabels = {
      // Personagens e Mundo
      idade: 'Idade',
      descricao: 'Descrição',
      description: 'Descrição',
      trauma: 'Trauma',
      motivacao: 'Motivação',
      objetivos: 'Objetivos',
      historia: 'História',
      passado: 'Passado',
      segredo: 'Segredo',
      detalhes: 'Detalhes',

      // Estrutura Dramática
      act: 'Ato',
      beat: 'Ponto (Beat)',
      stage: 'Estágio',
      objective: 'Objetivo',
      summary: 'Resumo',
      notes: 'Notas',

      // Ritmo e Timeline
      pacing: 'Ritmo',
      intensity: 'Intensidade',
      time: 'Momento/Tempo',
      duration: 'Duração',
      impact: 'Impacto Emocional',
      location: 'Local',
      conflict: 'Conflito',
      hook: 'Gancho',

      // Mistérios e Plot Twists
      whoKnows: 'Quem sabe',
      clues: 'Pistas',
      revelation: 'Revelação',
      planning: 'Planejamento',
      foreshadowing: 'Foreshadowing',
      consequence: 'Consequência',
    };

    return (
      <div className="space-y-1.5 mt-3 text-sm">
        {entries.map(([key, val]) => (
          <p key={key} className="text-gray-300 leading-relaxed break-words">
            <strong className="text-purple-400 font-medium">
              {fieldLabels[key] || key}:{' '}
            </strong>
            {val}
          </p>
        ))}
      </div>
    );
  }

  return (
    <main className="characters-page manuscript-page">
      {/* Cabeçalho */}
      <header className="characters-header flex justify-between items-start mb-2">
        <div>
          <h1>Escrita & Manuscrito</h1>
          <p>Escreva capítulos e consulte seus elementos criados em tempo real.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
          <span className="w-4 h-4 rounded-full border-2 border-purple-500 inline-block" />
          <span>{progressPercentage}%</span>
        </div>
      </header>

      {/* Barra de Progresso */}
      <div className="w-full h-1 bg-gray-800 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-amber-500 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <EscritaGuide />

      {/* Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Lista de Capítulos */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Capítulos</h2>
            <button
              className="new-character-button cursor-pointer text-xs px-3 py-1"
              type="button"
              onClick={() => setIsCreating((prev) => !prev)}
            >
              + Novo
            </button>
          </div>

          {isCreating && (
            <div className="bg-[#181824] p-4 rounded-xl border border-purple-900/40 space-y-3">
              <input
                autoFocus
                type="text"
                className="w-full bg-[#11111a] border border-gray-800 rounded-lg p-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
                placeholder="Título..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <select
                className="w-full bg-[#11111a] border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-600 cursor-pointer"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              >
                {chapterTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="w-full bg-[#252336] hover:bg-purple-700 text-purple-200 hover:text-white font-medium text-sm py-2 rounded-lg transition-all cursor-pointer"
                onClick={handleAddChapter}
              >
                Adicionar
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-6 text-gray-500 text-xs">Carregando manuscrito...</div>
          ) : chapters.length === 0 ? (
            <div className="bg-[#14141e] border border-gray-800/80 rounded-xl p-6 text-center text-gray-500 text-sm">
              Nenhum capítulo criado.
            </div>
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  draggable
                  onDragStart={() => setDraggedId(chapter.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(chapter.id)}
                  onClick={() => setSelectedId(chapter.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedId === chapter.id
                      ? 'bg-[#1e1c2e] border-purple-600/80 text-white'
                      : 'bg-[#14141e] border-gray-800/80 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 cursor-grab text-xs">░░</span>
                    <div>
                      <h3 className="font-semibold text-sm leading-tight">
                        {chapter.title}
                      </h3>
                      <span className="text-xs text-gray-500">{chapter.type}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                    title="Excluir capítulo"
                    onClick={(e) => handleDeleteChapter(chapter.id, e)}
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coluna Direita: Editor de Escrita */}
        <div className="md:col-span-8">
          {selectedChapter ? (
            <div className="bg-[#14141e] border border-gray-800/80 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-gray-800/60">
                <input
                  type="text"
                  className="bg-transparent font-bold text-lg text-white focus:outline-none focus:border-b border-purple-500 flex-1"
                  value={selectedChapter.title}
                  onChange={(e) => updateSelectedChapter('title', e.target.value)}
                />
                <select
                  className="bg-[#1c1c28] border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none cursor-pointer"
                  value={selectedChapter.type}
                  onChange={(e) => updateSelectedChapter('type', e.target.value)}
                >
                  {chapterTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Área do Manuscrito Livre */}
              <textarea
                className="w-full h-96 bg-transparent text-gray-200 placeholder-gray-600 text-sm leading-relaxed focus:outline-none resize-y"
                placeholder="Escreva livremente..."
                value={selectedChapter.content || ''}
                onChange={(e) => updateSelectedChapter('content', e.target.value)}
              />
            </div>
          ) : (
            <div className="bg-[#14141e] border border-gray-800/80 rounded-xl p-16 text-center space-y-3">
              <span className="text-4xl text-gray-600 block">📖</span>
              <p className="text-gray-400 text-sm">
                Selecione ou crie um capítulo para começar a escrever.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SEÇÃO INFERIOR: APOIO VISUAL */}
      <section className="mt-8 bg-[#14141e] border border-purple-900/50 rounded-xl p-6 space-y-5 shadow-2xl">
        <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-gray-400 font-bold mr-2 uppercase tracking-wider text-[11px]">
              Apoio Visual:
            </span>
            {[
              ['Personagens', 'personagens', '👤'],
              ['Mundo', 'mundo', '🌍'],
              ['Estrutura Dramática', 'estrutura', '🏛'],
              ['Ritmo & Timeline', 'ritmo', '⏳'],
              ['Cenas', 'cenas', '🎬'],
              ['Mistérios', 'misterios', '🔍'],
              ['Plot Twists', 'twists', '⚡'],
            ].map(([label, key, icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveDrawer(activeDrawer === key ? null : key)}
                className={`px-3.5 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeDrawer === key
                    ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                    : 'bg-[#1a1a26] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {activeDrawer && (
              <input
                type="text"
                placeholder="Filtrar elemento..."
                className="bg-[#1c1c28] border border-gray-800 rounded-lg px-3.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}
            {activeDrawer && (
              <button
                type="button"
                className="text-gray-400 hover:text-white text-xs font-semibold cursor-pointer px-3 py-1.5 rounded-md bg-gray-800/50 hover:bg-gray-800"
                onClick={() => setActiveDrawer(null)}
              >
                ✕ Ocultar Painel
              </button>
            )}
          </div>
        </div>

        {/* Renderização dos Cards */}
        {activeDrawer ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {referenceData[activeDrawer]
              ?.filter((item) =>
                (item.name || item.nome || item.title || '')
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .map((item) => {
                const displayName = item.name || item.nome || item.title || 'Sem título';
                const initial = displayName.charAt(0).toUpperCase();

                return (
                  <div
                    key={item.id}
                    className="bg-[#1a1a26] border border-gray-800/80 p-5 rounded-xl space-y-3 hover:border-purple-700/60 transition-all flex flex-col justify-between shadow-md relative group"
                  >
                    <div>
                      {item.pageKey && onNavigate && (
                        <button
                          type="button"
                          title="Visualizar no módulo completo"
                          onClick={() => onNavigate(item.pageKey)}
                          className="absolute top-4 right-4 text-gray-500 hover:text-purple-300 text-base cursor-pointer p-1 transition-colors"
                        >
                          👁
                        </button>
                      )}

                      <div className="flex items-start gap-3 pr-6 mb-2">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={displayName}
                            className="w-11 h-11 rounded-full object-cover border border-purple-500/50 shrink-0"
                          />
                        ) : activeDrawer === 'personagens' ? (
                          <div
                            className={`w-11 h-11 rounded-full border flex items-center justify-center font-bold text-base shrink-0 ${getCharacterBadgeStyle(
                              item.type
                            )}`}
                          >
                            {initial}
                          </div>
                        ) : null}

                        <div className="overflow-hidden">
                          <h4 className="text-purple-200 font-bold text-base leading-tight truncate">
                            {displayName}
                          </h4>
                          {item.type && (
                            <span
                              className={`inline-block border px-2 py-0.5 rounded text-[11px] font-medium mt-1 ${
                                activeDrawer === 'personagens'
                                  ? getCharacterBadgeStyle(item.type)
                                  : 'bg-purple-950/80 text-purple-300 border-purple-800/40'
                              }`}
                            >
                              {item.type}
                            </span>
                          )}
                        </div>
                      </div>

                      {renderFilledFields(item)}
                    </div>
                  </div>
                );
              })}

            {referenceData[activeDrawer]?.length === 0 && (
              <div className="col-span-full text-center text-gray-500 text-sm py-12">
                Nenhum elemento cadastrado nesta categoria ainda.
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-xs text-center py-2">
            Clique em um dos botões acima para exibir os cards de consulta enquanto escreve.
          </p>
        )}
      </section>
    </main>
  );
}