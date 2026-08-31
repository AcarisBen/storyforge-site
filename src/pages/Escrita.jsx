import React, { useState } from 'react';

const chapterTypes = ['Prólogo', 'Capítulo', 'Cena', 'Ato', 'Parte', 'Epílogo'];

const mockReferenceData = {
  personagens: [
    {
      id: '1',
      nome: 'Leticia',
      type: 'Protagonista',
      idade: '28 anos',
      descricao: 'Jovem investigadora em busca de respostas sobre seu passado.',
      trauma: 'Possui pavor de lugares fechados devido a um acidente na infância.',
      motivacao: 'Descobrir quem apagou as memórias de sua família.',
      pageKey: 'personagens',
    },
    {
      id: '2',
      nome: 'Arthur',
      type: 'Antagonista',
      descricao: 'Líder da Guarda Central.',
      objetivos: 'Manter a ordem na cidade a qualquer custo.',
      pageKey: 'personagens',
    },
  ],
  mundo: [
    {
      id: '1',
      name: 'Valen',
      type: 'Cidade',
      description: 'Cidade costeira fortificada protegida por cúpulas de energia antiga.',
      pageKey: 'mundo',
    },
    {
      id: '2',
      name: 'Magia de Sangue',
      type: 'Sistema de Magia',
      description: 'Consome energia vital em troca de manipulação direta da matéria.',
      pageKey: 'mundo',
    },
  ],
  estrutura: [
    {
      id: '1',
      title: 'Incidente Incitante',
      detalhes: 'A destruição do artefato no capítulo inicial força Leticia a fugir da capital.',
      pageKey: 'estrutura',
    },
    {
      id: '2',
      title: 'Ponto de Virada 1',
      detalhes: 'Leticia descobre a traição direta do conselho da cidade.',
      pageKey: 'estrutura',
    },
  ],
  cenas: [
    {
      id: '1',
      title: 'O Encontro na Taverna',
      location: 'Taverna do Dragão Caolho',
      objective: 'Obter o mapa antigo das ruínas.',
      conflict: 'O guarda reconhece a capa de Leticia.',
      hook: 'Alguém apaga as luzes e um tiro ecoa no recinto.',
      pageKey: 'cenas',
    },
  ],
  misterios: [
    {
      id: '1',
      title: 'Quem queimou o arquivo?',
      whoKnows: 'Apenas o arquivista e o assassino.',
      clues: 'Cheiro de enxofre e cinzas azuis no chão.',
      revelation: 'O próprio arquivista ateou fogo para proteger a verdade.',
      pageKey: 'misterios',
    },
  ],
  twists: [
    {
      id: '1',
      title: 'O mentor era o verdadeiro vilão',
      foreshadowing: 'Ele conhecia a linguagem proibida sem jamais ter viajado ao sul.',
      consequence: 'O protagonista perde sua única fonte de orientação.',
      pageKey: 'plot-twists',
    },
  ],
};

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

export default function Escrita({ onNavigate }) {
  const [chapters, setChapters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Capítulo');
  const [draggedId, setDraggedId] = useState(null);

  // Categoria ativa no painel de apoio inferior
  const [activeDrawer, setActiveDrawer] = useState('personagens');
  const [searchTerm, setSearchTerm] = useState('');

  // Novo Cálculo Ponderado da Barra de Progresso
  // Título: Peso 1 | Tipo: Peso 1 | Conteúdo Escrito: Peso 8 (Total de 10 pontos por capítulo)
  const POINTS_PER_CHAPTER = 10;
  const totalPossiblePoints = chapters.length * POINTS_PER_CHAPTER;
  let currentPoints = 0;

  chapters.forEach((c) => {
    if (c.title && c.title.trim()) currentPoints += 1;
    if (c.type) currentPoints += 1;
    
    // O progresso de escrita cresce de acordo com a quantidade de texto escrita
    if (c.content && c.content.trim()) {
      const wordCount = c.content.trim().split(/\s+/).length;
      if (wordCount > 300) {
        currentPoints += 8; // Texto longo/completo
      } else if (wordCount > 100) {
        currentPoints += 5; // Texto em progresso
      } else if (wordCount > 0) {
        currentPoints += 2; // Início de texto
      }
    }
  });

  const progressPercentage =
    totalPossiblePoints > 0
      ? Math.round((currentPoints / totalPossiblePoints) * 100)
      : 0;

  const selectedChapter = chapters.find((c) => c.id === selectedId);

  function handleAddChapter() {
    if (!newTitle.trim()) return;

    const newChapter = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      type: newType,
      content: '',
    };

    setChapters((prev) => [...prev, newChapter]);
    setSelectedId(newChapter.id);
    setNewTitle('');
    setNewType('Capítulo');
    setIsCreating(false);
  }

  function updateSelectedChapter(key, value) {
    setChapters((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, [key]: value } : c))
    );
  }

  function handleDeleteChapter(id, event) {
    event.stopPropagation();
    if (!window.confirm('Deseja excluir este capítulo?')) return;

    setChapters((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) {
      const remaining = chapters.filter((c) => c.id !== id);
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
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

  // Renderiza exclusivamente os tópicos com texto preenchido
  function renderFilledFields(item) {
    const ignoredKeys = ['id', 'name', 'nome', 'title', 'type', 'pageKey'];
    const entries = Object.entries(item).filter(
      ([key, val]) =>
        !ignoredKeys.includes(key) &&
        typeof val === 'string' &&
        val.trim() !== ''
    );

    if (entries.length === 0) return null;

    const fieldLabels = {
      idade: 'Idade',
      descricao: 'Descrição',
      description: 'Descrição',
      trauma: 'Trauma',
      motivacao: 'Motivação',
      objetivos: 'Objetivos',
      detalhes: 'Detalhes',
      location: 'Local',
      objective: 'Objetivo da Cena',
      conflict: 'Conflito',
      hook: 'Gancho',
      whoKnows: 'Quem sabe',
      clues: 'Pistas',
      revelation: 'Revelação',
      foreshadowing: 'Foreshadowing',
      consequence: 'Consequência',
    };

    return (
      <div className="space-y-1 mt-2">
        {entries.map(([key, val]) => (
          <p key={key} className="text-gray-300 text-xs leading-relaxed">
            <strong className="text-purple-400 font-semibold">
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

      {/* Barra de Progresso do Topo */}
      <div className="w-full h-1 bg-gray-800 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-amber-500 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <EscritaGuide />

      {/* Seção Principal: Lista de Capítulos e Quadro de Escrita */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Capítulos */}
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

          {chapters.length === 0 ? (
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

        {/* Coluna Direita: Editor de Escrita Limpo */}
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

      {/* SEÇÃO INFERIOR: APOIO VISUAL COM BOTÕES DE CATEGORIA E CARDS */}
      <section className="mt-8 bg-[#14141e] border border-purple-900/50 rounded-xl p-5 space-y-4 shadow-2xl">
        <div className="flex flex-wrap justify-between items-center gap-4 pb-3 border-b border-gray-800">
          {/* Botões de Categoria do Apoio Visual */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-gray-400 font-bold mr-2 uppercase tracking-wider text-[11px]">
              Apoio Visual:
            </span>
            {[
              ['Personagens', 'personagens', '👤'],
              ['Mundo', 'mundo', '🌍'],
              ['Estrutura', 'estrutura', '🏛'],
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
                className="bg-[#1c1c28] border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 w-44"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}
            {activeDrawer && (
              <button
                type="button"
                className="text-gray-400 hover:text-white text-xs font-semibold cursor-pointer px-2.5 py-1 rounded-md bg-gray-800/50"
                onClick={() => setActiveDrawer(null)}
              >
                ✕ Ocultar Painel
              </button>
            )}
          </div>
        </div>

        {/* Exibição em Grid dos Cards preenchidos na categoria ativa */}
        {activeDrawer ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-1">
            {mockReferenceData[activeDrawer]
              ?.filter((item) =>
                (item.name || item.nome || item.title || '')
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1a1a26] border border-gray-800 p-4 rounded-xl space-y-2 hover:border-purple-700/60 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-purple-200 font-bold text-sm">
                        {item.name || item.nome || item.title}
                      </h4>
                      {item.type && (
                        <span className="bg-purple-950/80 text-purple-300 border border-purple-800/40 px-2 py-0.5 rounded text-[10px] font-medium">
                          {item.type}
                        </span>
                      )}
                    </div>

                    {renderFilledFields(item)}
                  </div>

                  {/* Botão para ir diretamente para a página correspondente */}
                  {item.pageKey && onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate(item.pageKey)}
                      className="mt-3 w-full bg-[#222234] hover:bg-purple-800 text-purple-300 hover:text-white border border-purple-900/50 py-1 px-2 rounded text-[11px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Ir para módulo</span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              ))}

            {mockReferenceData[activeDrawer]?.length === 0 && (
              <div className="col-span-full text-center text-gray-500 text-xs py-8">
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