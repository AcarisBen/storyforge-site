// src/pages/PlotTwists.jsx
// Página de Planejamento de Plot Twists do StoryForge.

import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';

const guideTabs = {
  Objetivo: <p>Construir reviravoltas que surpreendem mas que parecem inevitáveis em retrospecto.</p>,
  Dicas: <ul><li>Um bom plot twist muda o significado de tudo que veio antes.</li><li>Foreshadowing deve ser sutil o suficiente para não ser óbvio, mas claro em retrospecto.</li><li>A consequência do twist deve ser mais importante que o próprio twist.</li></ul>,
  Exemplos: <ul><li>Twist: “O mentor é o vilão.” — Foreshadowing: “Ele sabia demais sobre o inimigo.”</li><li>Consequência: “O protagonista precisa encontrar uma nova fonte de sabedoria.”</li></ul>,
  Perguntas: <ul><li>O que o público acredita que é verdade e não é?</li><li>Onde você planta as sementes do twist?</li><li>Como a revelação muda a história daqui para frente?</li></ul>,
};

const fields = [
  ['title', 'Título', 'input', 'Nome do plot twist...'],
  ['planning', 'Planejamento', 'textarea', 'Descreva como a reviravolta será construída...'],
  ['foreshadowing', 'Foreshadowing', 'textarea', 'Quais pistas antecipam a revelação...'],
  ['revelationMoment', 'Momento da Revelação', 'textarea', 'Quando e como o público descobre a verdade...'],
  ['consequence', 'Consequência', 'textarea', 'Como a revelação muda a história...'],
];

const blankTwist = () => Object.fromEntries(fields.map(([key]) => [key, '']));

function TwistGuide() {
  const [activeTab, setActiveTab] = useState('Objetivo');
  const [isOpen, setIsOpen] = useState(false);
  return (
    <section className="module-guide character-guide">
      <button
        className="guide-toggle cursor-pointer"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
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
                <span aria-hidden="true">
                  {tab === 'Objetivo' ? '◎' : tab === 'Dicas' ? '♧' : tab === 'Exemplos' ? '▣' : '?'}
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

export function ForeshadowingGuide() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <section className="module-guide foreshadowing-guide mt-3">
      <button
        className="guide-toggle cursor-pointer"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>O que é foreshadowing?</span>
        <span aria-hidden="true">{isOpen ? '⌃' : '⌄'}</span>
      </button>
      {isOpen && (
        <div className="guide-content">
          <p>“Foreshadowing” significa “presságio” ou “prenúncio”, referindo-se a pistas ou sinais introduzidos pelo autor que antecipam eventos futuros na narrativa.</p>
          <h3>Tipos de Foreshadowing</h3>
          <ol>
            <li><strong>Direto (Explícito):</strong> O narrador ou personagens fornecem pistas claras.</li>
            <li><strong>Indireto (Sutil):</strong> Pistas discretas, como símbolos ou ambientação.</li>
            <li><strong>Simbolismo:</strong> Objetos ou eventos simbolizam o que está por vir.</li>
            <li><strong>Profético:</strong> Sonhos ou visões dão pistas sobre possíveis desfechos.</li>
          </ol>
          <h3>Exemplo em Literatura</h3>
          <ul>
            <li>Em <em>Macbeth</em>, de Shakespeare, as profecias das bruxas prefiguram a ascensão e queda de Macbeth.</li>
            <li>Nuvens negras no início de uma história podem prenunciar tragédia.</li>
          </ul>
          <h3>Técnicas para um foreshadowing eficaz</h3>
          <ul>
            <li><strong>Detalhes plantados cedo:</strong> Introduzir objetos ou diálogos logo no início.</li>
            <li><strong>Alinhamento com temas:</strong> Conectar o presságio aos temas centrais da obra.</li>
            <li><strong>Equilíbrio:</strong> Sugerir possibilidades sem revelar demais.</li>
          </ul>
        </div>
      )}
    </section>
  );
}

// Formulário simples para criação de um novo Plot Twist
function TwistCreateForm({ twist, onChange, onSave, onCancel }) {
  return (
    <div className="twist-form bg-[#1c1c28] p-4 rounded-xl border border-purple-900/50 mb-6 space-y-3">
      {fields.map(([key, label, type, placeholder]) => (
        <label key={key} className="block text-xs font-semibold text-gray-300">
          <span className="mb-1 block">{label}</span>
          {type === 'textarea' ? (
            <textarea
              placeholder={placeholder}
              value={twist[key] || ''}
              onChange={(event) => onChange({ ...twist, [key]: event.target.value })}
              className="w-full bg-[#12121a] border border-gray-800 rounded-lg p-2 text-xs text-gray-200 outline-none focus:border-purple-500"
            />
          ) : (
            <input
              autoFocus={key === 'title'}
              placeholder={placeholder}
              value={twist[key] || ''}
              onChange={(event) => onChange({ ...twist, [key]: event.target.value })}
              className="w-full bg-[#12121a] border border-gray-800 rounded-lg p-2 text-xs text-gray-200 outline-none focus:border-purple-500"
            />
          )}
        </label>
      ))}
      <div className="twist-form-actions flex gap-2 pt-2">
        <button className="event-save cursor-pointer bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white font-medium text-xs transition-all" type="button" onClick={onSave}>
          Criar Plot Twist
        </button>
        <button className="event-cancel cursor-pointer bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-gray-300 font-medium text-xs transition-all" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// Formulário Inline para edição direta (Auto-save) ao expandir
function TwistInlineForm({ twist, onChange }) {
  return (
    <div className="twist-form space-y-3 p-4 bg-[#161622] border-t border-gray-800">
      {fields.map(([key, label, type, placeholder]) => (
        <label key={key} className="block text-xs font-semibold text-gray-300">
          <span className="mb-1 block">{label}</span>
          {type === 'textarea' ? (
            <textarea
              placeholder={placeholder}
              value={twist[key] || ''}
              onChange={(event) => onChange({ ...twist, [key]: event.target.value })}
              className="w-full bg-[#12121a] border border-gray-800 rounded-lg p-2 text-xs text-gray-200 outline-none focus:border-purple-500"
            />
          ) : (
            <input
              placeholder={placeholder}
              value={twist[key] || ''}
              onChange={(event) => onChange({ ...twist, [key]: event.target.value })}
              className="w-full bg-[#12121a] border border-gray-800 rounded-lg p-2 text-xs text-gray-200 outline-none focus:border-purple-500"
            />
          )}
        </label>
      ))}
    </div>
  );
}

export default function PlotTwists({ projectId }) {
  const [twists, setTwists] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState(blankTwist());
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState('Salvo');

  // Carregar Plot Twists do banco
  useEffect(() => {
    if (!projectId) return;

    const fetchTwists = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/entities/projects/${projectId}/twists`);
        setTwists(res.data || []);
      } catch (err) {
        console.error('Erro ao buscar plot twists:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTwists();
  }, [projectId]);

  // Barra de Progresso baseada nos 5 tópicos por item
  const totalPossibleTopics = twists.length * fields.length;
  let filledTopicsCount = 0;

  twists.forEach((t) => {
    fields.forEach(([key]) => {
      if (t[key] && typeof t[key] === 'string' && t[key].trim() !== '') {
        filledTopicsCount += 1;
      }
    });
  });

  const progressPercentage = totalPossibleTopics > 0
    ? Math.round((filledTopicsCount / totalPossibleTopics) * 100)
    : 0;

  function openCreate() {
    setDraft(blankTwist());
    setIsCreating(true);
  }

  // Salvar novo Plot Twist no PostgreSQL
  async function saveTwist() {
    if (!draft.title.trim() || !projectId) return;
    setSavingStatus('Salvando...');

    try {
      const res = await apiClient.post(`/entities/projects/${projectId}/twists`, draft);
      setTwists((prev) => [...prev, res.data]);
      setExpandedId(res.data.id);
      setIsCreating(false);
      setDraft(blankTwist());
      setSavingStatus('Salvo');
    } catch (err) {
      console.error('Erro ao criar plot twist:', err);
      setSavingStatus('Erro ao salvar');
      alert('Não foi possível criar o plot twist.');
    }
  }

  // Auto-save com debounce ao alterar campos de um item expandido
  const updateTimeoutRef = useRef({});

  function updateTwist(id, changes) {
    setSavingStatus('Salvando...');
    setTwists((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...changes } : t))
    );

    if (updateTimeoutRef.current[id]) {
      clearTimeout(updateTimeoutRef.current[id]);
    }

    updateTimeoutRef.current[id] = setTimeout(async () => {
      try {
        const currentTwist = twists.find((t) => t.id === id);
        const updatedData = { ...currentTwist, ...changes };
        await apiClient.put(`/entities/twists/${id}`, updatedData);
        setSavingStatus('Salvo');
      } catch (err) {
        console.error('Erro ao salvar plot twist automaticamente:', err);
        setSavingStatus('Erro ao salvar');
      }
    }, 1000);
  }

  // Deletar Plot Twist no banco
  async function deleteTwist(id) {
    if (!window.confirm('Tem certeza que deseja excluir este plot twist?')) return;
    setSavingStatus('Salvando...');

    try {
      await apiClient.delete(`/entities/twists/${id}`);
      setTwists((prev) => prev.filter((t) => t.id !== id));
      if (expandedId === id) setExpandedId(null);
      setSavingStatus('Salvo');
    } catch (err) {
      console.error('Erro ao excluir plot twist:', err);
      setSavingStatus('Erro ao salvar');
      alert('Erro ao excluir o plot twist.');
    }
  }

  return (
    <main className="module-page w-full plot-twists-page">
      {/* CABEÇALHO PADRONIZADO DA PÁGINA PLOT TWISTS */}
      <header className="module-header flex justify-between items-center">
        <div>
          <h1>Plot Twists</h1>
          <p>Planejamento de reviravoltas com foreshadowing e consequências.</p>
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

      <TwistGuide />
      <ForeshadowingGuide />

      <div className="mystery-toolbar flex justify-between items-center my-6">
        <span className="text-gray-400 text-sm font-medium">{twists.length} plot twist(s)</span>
        <button
          className="new-character-button cursor-pointer rounded-full px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-all"
          type="button"
          onClick={openCreate}
        >
          ＋ Novo Plot Twist
        </button>
      </div>

      {isCreating && (
        <TwistCreateForm
          twist={draft}
          onChange={setDraft}
          onSave={saveTwist}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando plot twists...</div>
      ) : twists.length === 0 && !isCreating ? (
        <div className="empty-characters plot-empty">
          <span aria-hidden="true">ϟ</span>
          <p>Nenhum plot twist planejado ainda.</p>
        </div>
      ) : (
        <div className="twists-list space-y-4">
          {twists.map((twist) => (
            <article className="twist-card bg-[#181822] border border-gray-800 rounded-xl overflow-hidden" key={twist.id}>
              <header className="twist-card-header flex items-center justify-between p-4 bg-[#1e1e2c]">
                <h2
                  className="cursor-pointer flex-1 flex items-center gap-2 select-none font-semibold text-gray-200 text-sm"
                  onClick={() => setExpandedId(expandedId === twist.id ? null : twist.id)}
                >
                  <span aria-hidden="true" className="text-purple-400">ϟ</span>
                  {twist.title || 'Plot Twist sem título'}
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white cursor-pointer px-2 text-sm"
                    onClick={() => setExpandedId(expandedId === twist.id ? null : twist.id)}
                  >
                    {expandedId === twist.id ? '⌃' : '⌄'}
                  </button>
                  <button
                    type="button"
                    className="text-red-400 hover:text-red-300 cursor-pointer p-1 rounded hover:bg-red-950/30 text-xs font-bold transition-all"
                    aria-label={`Excluir ${twist.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTwist(twist.id);
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </header>

              {expandedId === twist.id ? (
                <TwistInlineForm
                  twist={twist}
                  onChange={(changes) => updateTwist(twist.id, changes)}
                />
              ) : (
                <div
                  className="twist-summary p-4 bg-[#14141f] space-y-2 text-xs cursor-pointer"
                  onClick={() => setExpandedId(twist.id)}
                >
                  <div className="border-b border-gray-800/60 pb-1">
                    <span className="font-bold text-purple-400 block mb-0.5">Planejamento</span>
                    <p className="text-gray-300">{twist.planning || 'Não informado.'}</p>
                  </div>
                  <div className="border-b border-gray-800/60 pb-1">
                    <span className="font-bold text-purple-400 block mb-0.5">Foreshadowing</span>
                    <p className="text-gray-300">{twist.foreshadowing || 'Não informado.'}</p>
                  </div>
                  <div className="border-b border-gray-800/60 pb-1">
                    <span className="font-bold text-purple-400 block mb-0.5">Momento da Revelação</span>
                    <p className="text-gray-300">{twist.revelationMoment || 'Não informado.'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-purple-400 block mb-0.5">Consequência</span>
                    <p className="text-gray-300">{twist.consequence || 'Não informado.'}</p>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}