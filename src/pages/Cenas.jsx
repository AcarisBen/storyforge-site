import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';

const guideTabs = {
  Objetivo: <p>Estruturar cada cena como uma unidade dramática que avança a história.</p>,
  Dicas: <ul><li>Toda cena precisa de um objetivo — se a cena não muda nada, corte-a.</li><li>O conflito da cena deve escalar ou transformar a situação.</li><li>O gancho para a próxima cena mantém o público engajado.</li></ul>,
  Exemplos: <ul><li>Objetivo: “Convencer o aliado a entrar na batalha.”</li><li>Gancho: “A porta se abre e revela o vilão.”</li></ul>,
  Perguntas: <ul><li>O que esta cena muda na história?</li><li>Qual é o conflito central da cena?</li><li>Como ela conecta com a próxima?</li></ul>,
};

const sceneFields = [
  ['objective', 'Objetivo', 'Descreva o objetivo da cena...'],
  ['conflict', 'Conflito', 'Descreva o conflito da cena...'],
  ['location', 'Local', 'Onde a cena acontece...'],
  ['time', 'Horário', 'Quando a cena acontece...'],
  ['emotion', 'Emoção predominante', 'Qual emoção domina a cena...'],
  ['mystery', 'Mistério', 'Que mistério está presente...'],
  ['suspense', 'Suspense', 'O que mantém a tensão...'],
  ['irony', 'Ironia dramática', 'O que o público sabe, mas os personagens não...'],
  ['plotTwist', 'Plot twist', 'Qual é a reviravolta da cena...'],
  ['consequence', 'Consequência', 'O que muda depois da cena...'],
  ['hook', 'Gancho para próxima cena', 'Como esta cena conecta com a próxima...'],
];

const blankScene = () => Object.fromEntries(sceneFields.map(([key]) => [key, '']));

function SceneGuide() {
  const [activeTab, setActiveTab] = useState('Objetivo');
  const [isOpen, setIsOpen] = useState(true);
  return (
    <section className="module-guide character-guide">
      <button className="guide-toggle cursor-pointer" type="button" aria-expanded={isOpen} onClick={() => setIsOpen((value) => !value)}>
        <span><b aria-hidden="true">!</b> Guia do Módulo</span>
        <span aria-hidden="true">{isOpen ? '⌃' : '⌄'}</span>
      </button>
      {isOpen && (
        <div className="guide-content">
          <nav className="guide-tabs" aria-label="Guia do módulo">
            {Object.keys(guideTabs).map((tab) => (
              <button
                className={activeTab === tab ? 'guide-tab active cursor-pointer' : 'guide-tab cursor-pointer'}
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
              >
                <span aria-hidden="true">{tab === 'Objetivo' ? '◎' : tab === 'Dicas' ? '♧' : tab === 'Exemplos' ? '▣' : '?'}</span>
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

// Formulário reutilizável sem botões de salvar/cancelar durante a edição inline
function SceneInlineForm({ scene, onChange }) {
  return (
    <div className="scene-form space-y-3">
      <label>
        <span>Título</span>
        <input
          value={scene.title || ''}
          placeholder="Título da cena..."
          onChange={(event) => onChange({ ...scene, title: event.target.value })}
        />
      </label>
      {sceneFields.map(([key, label, placeholder]) => (
        <label key={key}>
          <span>{label}</span>
          {key === 'location' || key === 'time' || key === 'emotion' ? (
            <input
              value={scene[key] || ''}
              placeholder={placeholder}
              onChange={(event) => onChange({ ...scene, [key]: event.target.value })}
            />
          ) : (
            <textarea
              value={scene[key] || ''}
              placeholder={placeholder}
              onChange={(event) => onChange({ ...scene, [key]: event.target.value })}
            />
          )}
        </label>
      ))}
    </div>
  );
}

export default function Cenas({ projectId }) {
  const [scenes, setScenes] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [expandedScene, setExpandedScene] = useState(null);
  const [draggedScene, setDraggedScene] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar cenas do PostgreSQL ao abrir a página
  useEffect(() => {
    if (!projectId) return;

    const fetchScenes = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/entities/projects/${projectId}/scenes`);
        setScenes(res.data || []);
      } catch (err) {
        console.error('Erro ao buscar cenas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScenes();
  }, [projectId]);

  // Cálculo da barra de progresso global
  const totalPossibleTopics = scenes.length * (sceneFields.length + 1); // +1 referente ao Título
  let filledTopicsCount = 0;

  scenes.forEach((s) => {
    if (s.title && s.title.trim()) filledTopicsCount += 1;
    sceneFields.forEach(([key]) => {
      if (s[key] && typeof s[key] === 'string' && s[key].trim()) {
        filledTopicsCount += 1;
      }
    });
  });

  const progressPercentage = totalPossibleTopics > 0 
    ? Math.round((filledTopicsCount / totalPossibleTopics) * 100) 
    : 0;

  // Criar nova cena no PostgreSQL
  async function handleCreateScene() {
    if (!newTitle.trim() || !projectId) return;

    try {
      const payload = { title: newTitle.trim(), ...blankScene() };
      const res = await apiClient.post(`/entities/projects/${projectId}/scenes`, payload);
      const created = res.data;

      setScenes((prev) => [...prev, created]);
      setExpandedScene(created.id);
      setIsCreating(false);
      setNewTitle('');
    } catch (err) {
      console.error('Erro ao criar cena:', err);
      alert('Não foi possível criar a cena.');
    }
  }

  // Atualizar campo em tempo real com debounce
  const updateTimeoutRef = useRef({});

  function updateScene(sceneId, changes) {
    setScenes((prev) =>
      prev.map((s) => (s.id === sceneId ? { ...s, ...changes } : s))
    );

    if (updateTimeoutRef.current[sceneId]) {
      clearTimeout(updateTimeoutRef.current[sceneId]);
    }

    updateTimeoutRef.current[sceneId] = setTimeout(async () => {
      try {
        const currentScene = scenes.find((s) => s.id === sceneId);
        const updatedData = { ...currentScene, ...changes };
        await apiClient.put(`/entities/scenes/${sceneId}`, updatedData);
      } catch (err) {
        console.error('Erro ao salvar cena automaticamente:', err);
      }
    }, 1000);
  }

  // Excluir cena
  async function deleteScene(id, title) {
    if (!window.confirm(`Tem certeza que deseja excluir a cena "${title || 'sem título'}"?`)) return;

    try {
      await apiClient.delete(`/entities/scenes/${id}`);
      setScenes((prev) => prev.filter((item) => item.id !== id));
      if (expandedScene === id) setExpandedScene(null);
    } catch (err) {
      console.error('Erro ao excluir cena:', err);
      alert('Erro ao excluir a cena.');
    }
  }

  // Drag and drop para reordenar
  function moveScene(targetId) {
    if (!draggedScene || draggedScene === targetId) return;
    setScenes((current) => {
      const from = current.findIndex((scene) => scene.id === draggedScene);
      const to = current.findIndex((scene) => scene.id === targetId);
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDraggedScene(null);
  }

  return (
    <main className="characters-page scenes-page">
      <header className="characters-header">
        <div>
          <h1>Cenas</h1>
          <p>Cada cena como unidade narrativa com objetivo, conflito e gancho.</p>
        </div>
      </header>

      {/* Barra de Progresso baseada nos tópicos preenchidos */}
      <section className="bg-[#181822] p-4 rounded-xl border border-gray-800 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Progresso Geral das Cenas
          </span>
          <span className="text-sm font-bold text-purple-400">
            {progressPercentage}% ({filledTopicsCount}/{totalPossibleTopics} tópicos)
          </span>
        </div>
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </section>

      <SceneGuide />

      <div className="scenes-toolbar flex justify-between items-center my-4">
        <span className="text-gray-400 text-sm font-medium">{scenes.length} cena(s)</span>
        
        {/* Botão arredondado conforme o estilo das outras telas */}
        <button
          className="new-character-button cursor-pointer rounded-full px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-all"
          type="button"
          onClick={() => setIsCreating(true)}
        >
          ＋ Nova Cena
        </button>
      </div>

      {/* Modal / Formulário inicial para Criar Nova Cena */}
      {isCreating && (
        <div className="character-create-form bg-[#1c1c28] p-4 rounded-xl border border-purple-900/50 mb-6 space-y-3">
          <input
            autoFocus
            type="text"
            placeholder="Título da nova cena..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              className="cursor-pointer bg-purple-600 px-4 py-2 rounded-lg text-white font-medium text-sm"
              type="button"
              onClick={handleCreateScene}
            >
              Criar Cena
            </button>
            <button
              className="cursor-pointer bg-gray-800 px-4 py-2 rounded-lg text-gray-300 font-medium text-sm"
              type="button"
              onClick={() => setIsCreating(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando cenas...</div>
      ) : scenes.length === 0 && !isCreating ? (
        <div className="empty-characters scenes-empty">
          <span aria-hidden="true">▦</span>
          <p>Nenhuma cena criada ainda.</p>
        </div>
      ) : (
        <div className="scenes-list space-y-4">
          {scenes.map((scene, index) => (
            <article
              className="scene-card bg-[#181822] border border-gray-800 rounded-xl overflow-hidden"
              key={scene.id}
              draggable
              onDragStart={() => setDraggedScene(scene.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => moveScene(scene.id)}
            >
              <header className="scene-card-header flex items-center gap-3 p-4 bg-[#1e1e2c]">
                <span className="drag-handle cursor-grab text-gray-500" aria-label="Arraste para reordenar">
                  ⁙
                </span>
                <span className="scene-number text-purple-400 font-bold">
                  #{index + 1}
                </span>
                <button
                  className="scene-expand flex-1 text-left font-semibold text-gray-200 cursor-pointer"
                  type="button"
                  onClick={() => setExpandedScene(expandedScene === scene.id ? null : scene.id)}
                >
                  {scene.title || 'Cena sem título'}
                </button>
                <button
                  className="scene-chevron text-gray-400 cursor-pointer px-2"
                  type="button"
                  aria-label="Expandir cena"
                  onClick={() => setExpandedScene(expandedScene === scene.id ? null : scene.id)}
                >
                  {expandedScene === scene.id ? '⌃' : '⌄'}
                </button>

                {/* Botão de Excluir Direto */}
                <button
                  className="scene-delete text-red-400 hover:text-red-300 cursor-pointer p-2 rounded-lg hover:bg-red-950/30 transition-all"
                  type="button"
                  aria-label={`Excluir ${scene.title}`}
                  onClick={() => deleteScene(scene.id, scene.title)}
                >
                  Excluir
                </button>
              </header>

              {/* Expansão e Edição Direta sem necessidade de botões de Salvar/Cancelar */}
              {expandedScene === scene.id && (
                <div className="scene-details p-4 bg-[#161622] border-t border-gray-800">
                  <SceneInlineForm
                    scene={scene}
                    onChange={(changes) => updateScene(scene.id, changes)}
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}