import React, { useState } from 'react';

const chapterTypes = ['Prólogo', 'Capítulo', 'Cena', 'Ato', 'Parte', 'Epílogo'];

const guideTabs = {
  Objetivo: (
    <p>Produzir o texto final da obra, capítulo por capítulo, com apoio do programa.</p>
  ),
  Dicas: (
    <ul>
      <li>Use os elementos já criados (personagens, cenas, mundo) como base para a escrita.</li>
      <li>Vincule cenas e personagens a cada capítulo para manter coerência.</li>
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

export default function Escrita() {
  const [chapters, setChapters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Capítulo');
  const [draggedId, setDraggedId] = useState(null);

  // Cálculo da Barra de Progresso Dinâmica
  const totalPossiblePoints = chapters.length * 3;
  let currentPoints = 0;

  chapters.forEach((c) => {
    if (c.title && c.title.trim()) currentPoints += 1;
    if (c.type) currentPoints += 1;
    if (c.content && c.content.trim()) currentPoints += 1;
  });

  const progressPercentage =
    totalPossiblePoints > 0
      ? Math.round((currentPoints / totalPossiblePoints) * 100)
      : 0;

  const selectedChapter = chapters.find((c) => c.id === selectedId);

  // Criar novo capítulo no estado local
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

  // Atualização em tempo real do capítulo ativo
  function updateSelectedChapter(key, value) {
    setChapters((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, [key]: value } : c))
    );
  }

  // Excluir capítulo
  function handleDeleteChapter(id, event) {
    event.stopPropagation();
    if (!window.confirm('Deseja excluir este capítulo?')) return;

    setChapters((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) {
      const remaining = chapters.filter((c) => c.id !== id);
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    }
  }

  // Reordenação por Drag & Drop
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

  return (
    <main className="characters-page manuscript-page">
      {/* Cabeçalho da Página */}
      <header className="characters-header flex justify-between items-start mb-2">
        <div>
          <h1>Escrita & Manuscrito</h1>
          <p>Escreva capítulos, cenas e o projeto completo, com sugestões inteligentes de encaixe.</p>
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

      {/* Grid Principal: Menu Lateral e Editor */}
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

          {/* Form de Criação do Capítulo */}
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

          {/* Lista de Capítulos */}
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

        {/* Coluna Direita: Editor de Manuscrito */}
        <div className="md:col-span-8">
          {selectedChapter ? (
            <div className="bg-[#14141e] border border-gray-800/80 rounded-xl p-5 space-y-4">
              {/* Barra de Edição do Capítulo Selecionado */}
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

              {/* Área do Editor */}
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
    </main>
  );
}