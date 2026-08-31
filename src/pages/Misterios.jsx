import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';

const guideTabs = {
  Objetivo: <p>Estruturar mistérios que prendem o público sem trapacear.</p>,
  Dicas: <ul><li>O público deve ter todas as pistas antes da revelação — o mistério não pode trapacear.</li><li>Falsas pistas criam tensão, mas devem ser resolvidas de forma satisfatória.</li><li>O impacto da revelação deve mudar a história, não apenas informar.</li></ul>,
  Exemplos: <ul><li>Mistério: “Quem matou o rei?” — Revelação: “O próprio herdeiro, para impedir uma guerra.”</li><li>Falsa pista: “A adaga pertence ao embaixador — mas foi plantada.”</li></ul>,
  Perguntas: <ul><li>Quem sabe a verdade e quem não sabe?</li><li>Quais pistas o público recebe e quando?</li><li>Qual é o impacto da revelação na história?</li></ul>,
};

const mysteryFields = [
  ['title', 'Título', 'input', 'Nome do mistério...'],
  ['whoKnows', 'Quem sabe?', 'textarea', 'Quais personagens conhecem a verdade...'],
  ['whoDoesNotKnow', 'Quem não sabe?', 'textarea', 'Quais personagens estão no escuro...'],
  ['clues', 'Pistas', 'textarea', 'Quais pistas o público recebe...'],
  ['falseClues', 'Falsas pistas', 'textarea', 'Quais pistas levam a uma conclusão errada...'],
  ['revelation', 'Revelação', 'textarea', 'Qual é a verdade do mistério...'],
  ['impact', 'Impacto', 'textarea', 'Como a revelação muda a história...'],
];

const blankMystery = () => Object.fromEntries(mysteryFields.map(([key]) => [key, '']));

function MysteryGuide() {
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

// Formulário simples apenas para a criação de um novo mistério
function MysteryCreateForm({ mystery, onChange, onSave, onCancel }) {
  return (
    <div className="mystery-form">
      {mysteryFields.map(([key, label, type, placeholder]) => (
        <label key={key}>
          <span>{label}</span>
          {type === 'textarea' ? (
            <textarea
              placeholder={placeholder}
              value={mystery[key] || ''}
              onChange={(event) => onChange({ ...mystery, [key]: event.target.value })}
            />
          ) : (
            <input
              autoFocus={key === 'title'}
              placeholder={placeholder}
              value={mystery[key] || ''}
              onChange={(event) => onChange({ ...mystery, [key]: event.target.value })}
            />
          )}
        </label>
      ))}
      <div className="mystery-form-actions">
        <button className="event-save cursor-pointer" type="button" onClick={onSave}>
          Criar Mistério
        </button>
        <button className="event-cancel cursor-pointer" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// Formulário de edição direta quando expandido (Auto-save)
function MysteryInlineForm({ mystery, onChange }) {
  return (
    <div className="mystery-form">
      {mysteryFields.map(([key, label, type, placeholder]) => (
        <label key={key}>
          <span>{label}</span>
          {type === 'textarea' ? (
            <textarea
              placeholder={placeholder}
              value={mystery[key] || ''}
              onChange={(event) => onChange({ ...mystery, [key]: event.target.value })}
            />
          ) : (
            <input
              placeholder={placeholder}
              value={mystery[key] || ''}
              onChange={(event) => onChange({ ...mystery, [key]: event.target.value })}
            />
          )}
        </label>
      ))}
    </div>
  );
}

export default function Misterios({ projectId }) {
  const [mysteries, setMysteries] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState(blankMystery());
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar mistérios do PostgreSQL
  useEffect(() => {
    if (!projectId) return;

    const fetchMysteries = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/entities/projects/${projectId}/mysteries`);
        setMysteries(res.data || []);
      } catch (err) {
        console.error('Erro ao buscar mistérios:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMysteries();
  }, [projectId]);

  // Cálculo da barra de progresso (7 tópicos por mistério)
  const totalPossibleTopics = mysteries.length * mysteryFields.length;
  let filledTopicsCount = 0;

  mysteries.forEach((m) => {
    mysteryFields.forEach(([key]) => {
      if (m[key] && typeof m[key] === 'string' && m[key].trim() !== '') {
        filledTopicsCount += 1;
      }
    });
  });

  const progressPercentage = totalPossibleTopics > 0
    ? Math.round((filledTopicsCount / totalPossibleTopics) * 100)
    : 0;

  function openCreate() {
    setDraft(blankMystery());
    setIsCreating(true);
  }

  // Criar mistério no banco
  async function saveMystery() {
    if (!draft.title.trim() || !projectId) return;

    try {
      const res = await apiClient.post(`/entities/projects/${projectId}/mysteries`, draft);
      setMysteries((prev) => [...prev, res.data]);
      setExpandedId(res.data.id);
      setIsCreating(false);
      setDraft(blankMystery());
    } catch (err) {
      console.error('Erro ao criar mistério:', err);
      alert('Não foi possível criar o mistério.');
    }
  }

  // Auto-save com debounce ao alterar campos de um mistério expandido
  const updateTimeoutRef = useRef({});

  function updateMystery(id, changes) {
    setMysteries((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...changes } : m))
    );

    if (updateTimeoutRef.current[id]) {
      clearTimeout(updateTimeoutRef.current[id]);
    }

    updateTimeoutRef.current[id] = setTimeout(async () => {
      try {
        const currentMystery = mysteries.find((m) => m.id === id);
        const updatedData = { ...currentMystery, ...changes };
        await apiClient.put(`/entities/mysteries/${id}`, updatedData);
      } catch (err) {
        console.error('Erro ao salvar mistério automaticamente:', err);
      }
    }, 1000);
  }

  // Excluir mistério no banco
  async function deleteMystery(id) {
    if (!window.confirm('Tem certeza que deseja excluir este mistério?')) return;

    try {
      await apiClient.delete(`/entities/mysteries/${id}`);
      setMysteries((prev) => prev.filter((m) => m.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error('Erro ao excluir mistério:', err);
      alert('Erro ao excluir o mistério.');
    }
  }

  return (
    <main className="characters-page mysteries-page">
      <header className="characters-header">
        <div>
          <h1>Mistérios</h1>
          <p>Planejamento de cada mistério — quem sabe, pistas e revelações.</p>
        </div>
      </header>

      {/* Barra de Progresso Dinâmica baseada nos 7 tópicos de cada mistério */}
      <section className="bg-[#181822] p-4 rounded-xl border border-gray-800 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Progresso Geral dos Mistérios
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

      <MysteryGuide />

      <div className="mystery-toolbar">
        <span>{mysteries.length} mistério(s)</span>
        <button className="new-character-button" type="button" onClick={openCreate}>
          ＋ Novo Mistério
        </button>
      </div>

      {isCreating && (
        <MysteryCreateForm
          mystery={draft}
          onChange={setDraft}
          onSave={saveMystery}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando mistérios...</div>
      ) : mysteries.length === 0 && !isCreating ? (
        <div className="empty-characters mystery-empty">
          <span aria-hidden="true">⌕</span>
          <p>Nenhum mistério planejado ainda.</p>
        </div>
      ) : (
        <div className="mysteries-list">
          {mysteries.map((mystery) => (
            <article className="mystery-card" key={mystery.id}>
              <header className="mystery-card-header">
                <h2>{mystery.title || 'Mistério sem título'}</h2>
                <div>
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === mystery.id ? null : mystery.id)}
                  >
                    {expandedId === mystery.id ? '⌃' : '⌄'}
                  </button>
                  <button
                    type="button"
                    aria-label={`Excluir ${mystery.title}`}
                    onClick={() => deleteMystery(mystery.id)}
                  >
                    ♜
                  </button>
                </div>
              </header>

              {expandedId === mystery.id ? (
                <MysteryInlineForm
                  mystery={mystery}
                  onChange={(changes) => updateMystery(mystery.id, changes)}
                />
              ) : (
                <div className="mystery-summary">
                  {mysteryFields.slice(1).map(([key, label]) => (
                    <div key={key}>
                      <span>{label}</span>
                      <p>{mystery[key] || 'Não informado.'}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}