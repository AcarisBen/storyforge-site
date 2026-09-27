// src/pages/Misterios.jsx
// Página de Mistérios do StoryForge. Molda as regras do mistério, quem sabe, pistas e revelações.

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
    <div className="mystery-form bg-[#1c1c28] p-4 rounded-xl border border-purple-900/50 mb-6 space-y-3">
      {mysteryFields.map(([key, label, type, placeholder]) => (
        <label key={key} className="block text-xs font-semibold text-gray-300">
          <span className="mb-1 block">{label}</span>
          {type === 'textarea' ? (
            <textarea
              placeholder={placeholder}
              value={mystery[key] || ''}
              onChange={(event) => onChange({ ...mystery, [key]: event.target.value })}
              className="w-full bg-[#12121a] border border-gray-800 rounded-lg p-2 text-xs text-gray-200 outline-none focus:border-purple-500"
            />
          ) : (
            <input
              autoFocus={key === 'title'}
              placeholder={placeholder}
              value={mystery[key] || ''}
              onChange={(event) => onChange({ ...mystery, [key]: event.target.value })}
              className="w-full bg-[#12121a] border border-gray-800 rounded-lg p-2 text-xs text-gray-200 outline-none focus:border-purple-500"
            />
          )}
        </label>
      ))}
      <div className="mystery-form-actions flex gap-2 pt-2">
        <button className="event-save cursor-pointer bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white font-medium text-xs transition-all" type="button" onClick={onSave}>
          Criar Mistério
        </button>
        <button className="event-cancel cursor-pointer bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-gray-300 font-medium text-xs transition-all" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// Formulário de edição direta quando expandido (Auto-save)
function MysteryInlineForm({ mystery, onChange }) {
  return (
    <div className="mystery-form space-y-3 p-4 bg-[#161622] border-t border-gray-800">
      {mysteryFields.map(([key, label, type, placeholder]) => (
        <label key={key} className="block text-xs font-semibold text-gray-300">
          <span className="mb-1 block">{label}</span>
          {type === 'textarea' ? (
            <textarea
              placeholder={placeholder}
              value={mystery[key] || ''}
              onChange={(event) => onChange({ ...mystery, [key]: event.target.value })}
              className="w-full bg-[#12121a] border border-gray-800 rounded-lg p-2 text-xs text-gray-200 outline-none focus:border-purple-500"
            />
          ) : (
            <input
              placeholder={placeholder}
              value={mystery[key] || ''}
              onChange={(event) => onChange({ ...mystery, [key]: event.target.value })}
              className="w-full bg-[#12121a] border border-gray-800 rounded-lg p-2 text-xs text-gray-200 outline-none focus:border-purple-500"
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
  const [savingStatus, setSavingStatus] = useState('Salvo');

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
    setSavingStatus('Salvando...');

    try {
      const res = await apiClient.post(`/entities/projects/${projectId}/mysteries`, draft);
      setMysteries((prev) => [...prev, res.data]);
      setExpandedId(res.data.id);
      setIsCreating(false);
      setDraft(blankMystery());
      setSavingStatus('Salvo');
    } catch (err) {
      console.error('Erro ao criar mistério:', err);
      setSavingStatus('Erro ao salvar');
      alert('Não foi possível criar o mistério.');
    }
  }

  // Auto-save com debounce ao alterar campos de um mistério expandido
  const updateTimeoutRef = useRef({});

  function updateMystery(id, changes) {
    setSavingStatus('Salvando...');
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
        setSavingStatus('Salvo');
      } catch (err) {
        console.error('Erro ao salvar mistério automaticamente:', err);
        setSavingStatus('Erro ao salvar');
      }
    }, 1000);
  }

  // Excluir mistério no banco
  async function deleteMystery(id) {
    if (!window.confirm('Tem certeza que deseja excluir este mistério?')) return;
    setSavingStatus('Salvando...');

    try {
      await apiClient.delete(`/entities/mysteries/${id}`);
      setMysteries((prev) => prev.filter((m) => m.id !== id));
      if (expandedId === id) setExpandedId(null);
      setSavingStatus('Salvo');
    } catch (err) {
      console.error('Erro ao excluir mistério:', err);
      setSavingStatus('Erro ao salvar');
      alert('Erro ao excluir o mistério.');
    }
  }

  return (
    <main className="module-page w-full mysteries-page">
      {/* CABEÇALHO PADRONIZADO DA PÁGINA MISTÉRIOS */}
      <header className="module-header flex justify-between items-center">
        <div>
          <h1>Mistérios</h1>
          <p>Planejamento de cada mistério — quem sabe, pistas e revelações.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium bg-[#1c1c26] px-3 py-1 rounded-full border border-gray-800">
            {savingStatus}
          </span>
          <div className="module-progress">
            <span aria-hidden="true" />
            {progressPercentage}%
          </div>
        </div>
      </header>

      {/* BARRA DE PROGRESSO PADRÃO */}
      <div className="module-progress-track">
        <div style={{ width: `${progressPercentage}%` }} />
      </div>

      <MysteryGuide />

      <div className="mystery-toolbar flex justify-between items-center my-6">
        <span className="text-gray-400 text-sm font-medium">{mysteries.length} mistério(s)</span>
        <button
          className="new-character-button cursor-pointer rounded-full px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-all"
          type="button"
          onClick={openCreate}
        >
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
        <div className="mysteries-list space-y-4">
          {mysteries.map((mystery) => (
            <article className="mystery-card bg-[#181822] border border-gray-800 rounded-xl overflow-hidden" key={mystery.id}>
              <header className="mystery-card-header flex items-center justify-between p-4 bg-[#1e1e2c]">
                <h2 className="font-semibold text-gray-200 text-sm">{mystery.title || 'Mistério sem título'}</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white cursor-pointer px-2 text-sm"
                    onClick={() => setExpandedId(expandedId === mystery.id ? null : mystery.id)}
                  >
                    {expandedId === mystery.id ? '⌃' : '⌄'}
                  </button>
                  <button
                    type="button"
                    className="text-red-400 hover:text-red-300 cursor-pointer p-1 rounded hover:bg-red-950/30 text-xs font-bold transition-all"
                    aria-label={`Excluir ${mystery.title}`}
                    onClick={() => deleteMystery(mystery.id)}
                  >
                    Excluir
                  </button>
                </div>
              </header>

              {expandedId === mystery.id ? (
                <MysteryInlineForm
                  mystery={mystery}
                  onChange={(changes) => updateMystery(mystery.id, changes)}
                />
              ) : (
                <div className="mystery-summary p-4 bg-[#14141f] space-y-2 text-xs">
                  {mysteryFields.slice(1).map(([key, label]) => (
                    <div key={key} className="border-b border-gray-800/60 pb-1 last:border-0">
                      <span className="font-bold text-purple-400 block mb-0.5">{label}</span>
                      <p className="text-gray-300">{mystery[key] || 'Não informado.'}</p>
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