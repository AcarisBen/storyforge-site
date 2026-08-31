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
    <section className="module-guide foreshadowing-guide">
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
    <div className="twist-form">
      {fields.map(([key, label, type, placeholder]) => (
        <label key={key}>
          <span>{label}</span>
          {type === 'textarea' ? (
            <textarea
              placeholder={placeholder}
              value={twist[key] || ''}
              onChange={(event) => onChange({ ...twist, [key]: event.target.value })}
            />
          ) : (
            <input
              autoFocus={key === 'title'}
              placeholder={placeholder}
              value={twist[key] || ''}
              onChange={(event) => onChange({ ...twist, [key]: event.target.value })}
            />
          )}
        </label>
      ))}
      <div className="twist-form-actions">
        <button className="event-save cursor-pointer" type="button" onClick={onSave}>
          Criar Plot Twist
        </button>
        <button className="event-cancel cursor-pointer" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// Formulário Inline para edição direta (Auto-save) ao expandir
function TwistInlineForm({ twist, onChange }) {
  return (
    <div className="twist-form">
      {fields.map(([key, label, type, placeholder]) => (
        <label key={key}>
          <span>{label}</span>
          {type === 'textarea' ? (
            <textarea
              placeholder={placeholder}
              value={twist[key] || ''}
              onChange={(event) => onChange({ ...twist, [key]: event.target.value })}
            />
          ) : (
            <input
              placeholder={placeholder}
              value={twist[key] || ''}
              onChange={(event) => onChange({ ...twist, [key]: event.target.value })}
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

    try {
      const res = await apiClient.post(`/entities/projects/${projectId}/twists`, draft);
      setTwists((prev) => [...prev, res.data]);
      setExpandedId(res.data.id);
      setIsCreating(false);
      setDraft(blankTwist());
    } catch (err) {
      console.error('Erro ao criar plot twist:', err);
      alert('Não foi possível criar o plot twist.');
    }
  }

  // Auto-save com debounce ao alterar campos de um item expandido
  const updateTimeoutRef = useRef({});

  function updateTwist(id, changes) {
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
      } catch (err) {
        console.error('Erro ao salvar plot twist automaticamente:', err);
      }
    }, 1000);
  }

  // Deletar Plot Twist no banco
  async function deleteTwist(id) {
    if (!window.confirm('Tem certeza que deseja excluir este plot twist?')) return;

    try {
      await apiClient.delete(`/entities/twists/${id}`);
      setTwists((prev) => prev.filter((t) => t.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error('Erro ao excluir plot twist:', err);
      alert('Erro ao excluir o plot twist.');
    }
  }

  return (
    <main className="characters-page plot-twists-page">
      <header className="characters-header">
        <div>
          <h1>Plot Twists</h1>
          <p>Planejamento de reviravoltas com foreshadowing e consequências.</p>
        </div>
      </header>

      {/* Barra de Progresso Dinâmica no topo */}
      <section className="bg-[#181822] p-4 rounded-xl border border-gray-800 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Progresso Geral dos Plot Twists
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

      <TwistGuide />
      <ForeshadowingGuide />

      <div className="mystery-toolbar">
        <span>{twists.length} plot twist(s)</span>
        <button className="new-character-button" type="button" onClick={openCreate}>
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
        <div className="twists-list">
          {twists.map((twist) => (
            <article className="twist-card" key={twist.id}>
              <header className="twist-card-header flex items-center justify-between">
                {/* O título agora funciona como botão estendido para expansão */}
                <h2
                  className="cursor-pointer flex-1 flex items-center gap-2 select-none"
                  onClick={() => setExpandedId(expandedId === twist.id ? null : twist.id)}
                >
                  <span aria-hidden="true">ϟ</span>
                  {twist.title || 'Plot Twist sem título'}
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="cursor-pointer"
                    onClick={() => setExpandedId(expandedId === twist.id ? null : twist.id)}
                  >
                    {expandedId === twist.id ? '⌃' : '⌄'}
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer"
                    aria-label={`Excluir ${twist.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTwist(twist.id);
                    }}
                  >
                    ♜
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
                  className="twist-summary cursor-pointer"
                  onClick={() => setExpandedId(twist.id)}
                >
                  <div>
                    <span>Planejamento</span>
                    <p>{twist.planning || 'Não informado.'}</p>
                  </div>
                  <div>
                    <span>Foreshadowing</span>
                    <p>{twist.foreshadowing || 'Não informado.'}</p>
                  </div>
                  <div>
                    <span>Momento da Revelação</span>
                    <p>{twist.revelationMoment || 'Não informado.'}</p>
                  </div>
                  <div>
                    <span>Consequência</span>
                    <p>{twist.consequence || 'Não informado.'}</p>
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