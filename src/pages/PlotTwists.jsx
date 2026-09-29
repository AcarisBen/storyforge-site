// src/pages/PlotTwists.jsx
// Página de Planejamento de Plot Twists do StoryForge com Guia do Módulo e Guia de Foreshadowing Padronizados

import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';
import { useToast } from '../hooks/useToast';

import { 
  Target, 
  Lightbulb, 
  BookOpen, 
  HelpCircle, 
  AlertCircle,
  ChevronUp, 
  ChevronDown,
  Plus,
  Trash2,
  Zap,
  Sparkles,
  Eye,
  BookMarked
} from 'lucide-react';

const guideTabs = {
  Objetivo: (
    <p>Construir reviravoltas que surpreendem mas que parecem inevitáveis em retrospecto.</p>
  ),
  Dicas: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>Um bom plot twist muda o significado de tudo que veio antes.</li>
      <li>Foreshadowing deve ser sutil o suficiente para não ser óbvio, mas claro em retrospecto.</li>
      <li>A consequência do twist deve ser mais importante que o próprio twist.</li>
    </ul>
  ),
  Exemplos: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>Twist: “O mentor é o vilão.” — Foreshadowing: “Ele sabia demais sobre o inimigo.”</li>
      <li>Consequência: “O protagonista precisa encontrar uma nova fonte de sabedoria.”</li>
    </ul>
  ),
  Perguntas: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>O que o público acredita que é verdade e não é?</li>
      <li>Onde você planta as sementes do twist?</li>
      <li>Como a revelação muda a história daqui para frente?</li>
    </ul>
  ),
};

// Mapeamento centralizado de ícones e cores do Guia do Módulo
const GUIDE_TAB_CONFIG = {
  Objetivo: { Icon: Target, color: 'text-red-400' },
  Dicas: { Icon: Lightbulb, color: 'text-amber-400' },
  Exemplos: { Icon: BookOpen, color: 'text-purple-400' },
  Perguntas: { Icon: HelpCircle, color: 'text-orange-400' },
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
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="module-guide character-guide mb-4 rounded-2xl border border-white/10 bg-[#14141e]/80 backdrop-blur-md overflow-hidden">
      {/* Cabeçalho do Guia com ícone de Exclamação */}
      <button
        className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors text-left"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="flex items-center gap-2 font-bold text-white text-sm">
          <AlertCircle size={18} className="text-amber-400 shrink-0" />
          Guia do Módulo
        </span>
        {isOpen ? (
          <ChevronUp size={18} className="text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </button>

      {/* Conteúdo com Abas Padronizadas */}
      {isOpen && (
        <div className="p-4 pt-0 border-t border-white/5 space-y-4">
          <nav className="flex flex-wrap gap-2 pt-3" aria-label="Guia do módulo">
            {Object.keys(guideTabs).map((tab) => {
              const config = GUIDE_TAB_CONFIG[tab] || { Icon: HelpCircle, color: 'text-gray-400' };
              const { Icon, color } = config;
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-purple-600/30 border-purple-500/80 text-white shadow-[0_2px_10px_rgba(168,85,247,0.25)]'
                      : 'bg-[#1a1a26] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                  }`}
                >
                  <Icon size={16} className={`shrink-0 ${color}`} />
                  <span>{tab}</span>
                </button>
              );
            })}
          </nav>

          <div className="text-xs text-gray-300 leading-relaxed bg-[#11111a] p-4 rounded-xl border border-gray-800/80">
            {guideTabs[activeTab]}
          </div>
        </div>
      )}
    </section>
  );
}

export function ForeshadowingGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="module-guide foreshadowing-guide mb-6 rounded-2xl border border-purple-500/20 bg-[#14141e]/80 backdrop-blur-md overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors text-left"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="flex items-center gap-2 font-bold text-white text-sm">
          <Sparkles size={18} className="text-purple-400 shrink-0" />
          O que é Foreshadowing?
        </span>
        {isOpen ? (
          <ChevronUp size={18} className="text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 pt-0 border-t border-white/5 space-y-4 text-xs text-gray-300 leading-relaxed">
          <div className="bg-[#11111a] p-3.5 rounded-xl border border-gray-800/80 pt-3">
            <p className="text-gray-300">
              <strong className="text-purple-300">“Foreshadowing”</strong> significa <em className="text-amber-300 font-normal">“presságio”</em> ou <em className="text-amber-300 font-normal">“prenúncio”</em>, referindo-se a pistas ou sinais introduzidos estrategicamente pelo autor que antecipam eventos futuros sem estragar a surpresa.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-purple-400">
              <Eye size={14} /> Tipos de Foreshadowing
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-[#161622] p-2.5 rounded-xl border border-gray-800">
                <span className="font-bold text-purple-300 block mb-0.5">1. Direto (Explícito)</span>
                <p className="text-[#a0a0b8] text-[11px]">O narrador ou os personagens fornecem avisos e pistas declaradas claramente.</p>
              </div>
              <div className="bg-[#161622] p-2.5 rounded-xl border border-gray-800">
                <span className="font-bold text-purple-300 block mb-0.5">2. Indireto (Sutil)</span>
                <p className="text-[#a0a0b8] text-[11px]">Pistas discretas ocultas na ambientação, diálogos banais ou ações secundárias.</p>
              </div>
              <div className="bg-[#161622] p-2.5 rounded-xl border border-gray-800">
                <span className="font-bold text-purple-300 block mb-0.5">3. Simbolismo</span>
                <p className="text-[#a0a0b8] text-[11px]">Objetos, cores, clima ou eventos paralelos que simbolizam o desfecho por vir.</p>
              </div>
              <div className="bg-[#161622] p-2.5 rounded-xl border border-gray-800">
                <span className="font-bold text-purple-300 block mb-0.5">4. Profético</span>
                <p className="text-[#a0a0b8] text-[11px]">Sonhos, profecias ou lendas antigas que antecipam o destino dos personagens.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="bg-[#11111a] p-3.5 rounded-xl border border-gray-800/80 space-y-2">
              <h4 className="font-bold text-amber-400 text-xs flex items-center gap-1">
                <BookMarked size={14} /> Exemplos na Literatura
              </h4>
              <ul className="space-y-1.5 list-disc pl-4 text-gray-300 text-[11px]">
                <li>Em <em>Macbeth</em>, de Shakespeare, as profecias das bruxas prefiguram a ascensão e queda trágica do protagonista.</li>
                <li>Mudanças repentinas no clima ou nuvens carregadas logo no início prefiguram tragédias iminentes.</li>
              </ul>
            </div>

            <div className="bg-[#11111a] p-3.5 rounded-xl border border-gray-800/80 space-y-2">
              <h4 className="font-bold text-purple-400 text-xs flex items-center gap-1">
                <Zap size={14} /> Técnicas para Eficácia
              </h4>
              <ul className="space-y-1.5 list-disc pl-4 text-gray-300 text-[11px]">
                <li><strong>Plantio precoce:</strong> Introduza objetos, habilidades ou menções no início antes que virem peças do clímax.</li>
                <li><strong>Alinhamento com temas:</strong> Conecte o presságio diretamente aos conflitos e dilemas centrais da narrativa.</li>
                <li><strong>Equilíbrio sutil:</strong> Sugira possibilidades para atiçar a curiosidade sem entregar o desfecho.</li>
              </ul>
            </div>
          </div>
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
  const { showToast } = useToast();

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
        showToast({
          type: 'error',
          title: 'Erro de Conexão',
          message: 'Não foi possível carregar os plot twists do projeto.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTwists();
  }, [projectId, showToast]);

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
    if (!draft.title.trim()) {
      showToast({
        type: 'warning',
        title: 'Campo Obrigatório',
        message: 'Por favor, informe o título do plot twist.'
      });
      return;
    }

    if (!projectId) return;

    setSavingStatus('Salvando...');

    try {
      const res = await apiClient.post(`/entities/projects/${projectId}/twists`, draft);
      setTwists((prev) => [...prev, res.data]);
      setExpandedId(res.data.id);
      setIsCreating(false);
      setDraft(blankTwist());
      setSavingStatus('Salvo');

      showToast({
        type: 'success',
        title: 'Plot Twist Criado',
        message: `O plot twist "${res.data.title || draft.title}" foi criado com sucesso.`
      });
    } catch (err) {
      console.error('Erro ao criar plot twist:', err);
      setSavingStatus('Erro ao salvar');
      showToast({
        type: 'error',
        title: 'Erro de Criação',
        message: err.response?.data?.error || 'Não foi possível criar o plot twist.'
      });
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

      showToast({
        type: 'success',
        title: 'Plot Twist Excluído',
        message: 'O plot twist foi removido com sucesso.'
      });
    } catch (err) {
      console.error('Erro ao excluir plot twist:', err);
      setSavingStatus('Erro ao salvar');
      showToast({
        type: 'error',
        title: 'Erro de Exclusão',
        message: err.response?.data?.error || 'Erro ao excluir o plot twist.'
      });
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
          className="new-character-button cursor-pointer rounded-full px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-all flex items-center gap-1.5"
          type="button"
          onClick={openCreate}
        >
          <Plus size={16} /> Novo Plot Twist
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
        <div className="empty-characters plot-empty text-center py-12">
          <Zap size={32} className="text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Nenhum plot twist planejado ainda.</p>
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
                  <Zap size={16} className="text-purple-400 shrink-0" />
                  {twist.title || 'Plot Twist sem título'}
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white cursor-pointer px-2 transition-colors"
                    onClick={() => setExpandedId(expandedId === twist.id ? null : twist.id)}
                  >
                    {expandedId === twist.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <button
                    type="button"
                    className="text-red-400 hover:text-red-300 cursor-pointer p-1.5 rounded-lg hover:bg-red-950/30 transition-all text-xs font-bold flex items-center gap-1"
                    aria-label={`Excluir ${twist.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTwist(twist.id);
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Excluir</span>
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