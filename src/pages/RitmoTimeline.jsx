// src/pages/RitmoTimeline.jsx
// Página de Ritmo & Timeline do StoryForge — Régua Universal de Cadência

import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';

import { 
  Target, 
  Lightbulb, 
  BookOpen, 
  HelpCircle, 
  AlertCircle,
  ChevronUp, 
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  Sparkles,
  FileText
} from 'lucide-react';

const guideTabs = {
  Objetivo: (
    <p>Definir e visualizar os 8 marcos narrativos essenciais na ordem dramática e cadência corretas.</p>
  ),
  Dicas: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>Esta página serve como a régua universal de ritmo do seu livro.</li>
      <li>Se você escolheu frameworks na Estrutura Dramática, seus beats e ideias aparecerão indicados em cada marco.</li>
      <li>Você pode converter qualquer anotação da Estrutura Dramática em um evento de cena com um clique.</li>
    </ul>
  ),
  Exemplos: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>Incidente Incitante: “Luke descobre a mensagem da Princesa Leia na R2-D2.”</li>
      <li>Midpoint: “O protagonista descobre que a corporação onde trabalha é a vilã.”</li>
    </ul>
  ),
  Perguntas: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>O que dá início à jornada do protagonista?</li>
      <li>Qual é o ponto de virada central que inverte o objetivo?</li>
      <li>O clímax responde diretamente ao tema da história?</li>
    </ul>
  ),
};

const GUIDE_TAB_CONFIG = {
  Objetivo: { Icon: Target, color: 'text-red-400' },
  Dicas: { Icon: Lightbulb, color: 'text-amber-400' },
  Exemplos: { Icon: BookOpen, color: 'text-purple-400' },
  Perguntas: { Icon: HelpCircle, color: 'text-orange-400' },
};

function RitmoTimelineGuide() {
  const [activeTab, setActiveTab] = useState('Objetivo');
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="module-guide character-guide mb-6 rounded-2xl border border-white/10 bg-[#14141e]/80 backdrop-blur-md overflow-hidden">
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

// OS 8 MARCOS CANÔNICOS DE RITMO
const milestones = [
  ['Prólogo', 'O contexto inicial, a ambientação histórica ou um vislumbre do passado que antecede a trama.'],
  ['Incidente Incitante', 'O evento que rompe o equilíbrio inicial e coloca a história em movimento.'],
  ['1º Ponto de Virada', 'A decisão ou acontecimento que leva o protagonista a entrar no conflito principal.'],
  ['Midpoint', 'O ponto central que inverte ou escala o conflito de forma significativa.'],
  ['Crise', 'O momento de maior pressão antes do confronto final.'],
  ['Clímax', 'O ponto de maior tensão, em que o conflito central encontra sua resposta.'],
  ['Resolução', 'As consequências do clímax e o novo equilíbrio da história.'],
  ['Epílogo', 'O vislumbre final do mundo e dos personagens depois da resolução.'],
];

// DICIONÁRIO DE MAPEAMENTO DAS ESTRUTURAS PARA OS 8 MARCOS
const FRAMEWORK_MAPPINGS = {
  '3 Atos': {
    key: 'acts',
    color: 'bg-purple-950/60 border-purple-500/50 text-purple-300',
    map: {
      'Prólogo': ['Ato I - Setup'],
      'Incidente Incitante': ['Ato I - Setup'],
      '1º Ponto de Virada': ['Ato I - Setup', 'Ato II - Confronto'],
      'Midpoint': ['Ato II - Confronto'],
      'Crise': ['Ato II - Confronto'],
      'Clímax': ['Ato III - Resolução'],
      'Resolução': ['Ato III - Resolução'],
      'Epílogo': ['Ato III - Resolução'],
    }
  },
  '8 Sequências (Paul Gulino)': {
    key: 'sequences',
    color: 'bg-blue-950/60 border-blue-500/50 text-blue-300',
    map: {
      'Prólogo': ['Sequência 1'],
      'Incidente Incitante': ['Sequência 2'],
      '1º Ponto de Virada': ['Sequência 3'],
      'Midpoint': ['Sequência 4', 'Sequência 5'],
      'Crise': ['Sequência 6'],
      'Clímax': ['Sequência 7'],
      'Resolução': ['Sequência 8'],
      'Epílogo': ['Sequência 8'],
    }
  },
  'Jornada do Herói': {
    key: 'hero',
    color: 'bg-amber-950/60 border-amber-500/50 text-amber-300',
    map: {
      'Prólogo': ['Mundo Comum'],
      'Incidente Incitante': ['Chamado à Aventura', 'Recusa do Chamado'],
      '1º Ponto de Virada': ['Encontro com o Mentor', 'Travessia do Limiar'],
      'Midpoint': ['Aliados/Inimigos', 'Aproximação'],
      'Crise': ['Provação Difícil', 'Recompensa', 'Caminho de Volta'],
      'Clímax': ['Ressurreição'],
      'Resolução': ['Retorno com o Elixir'],
      'Epílogo': ['Retorno com o Elixir'],
    }
  },
  'Story Circle (Dan Harmon)': {
    key: 'storyCircle',
    color: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300',
    map: {
      'Prólogo': ['Conforto'],
      'Incidente Incitante': ['Desejo'],
      '1º Ponto de Virada': ['Entrada'],
      'Midpoint': ['Adaptação', 'Conquista'],
      'Crise': ['Preço'],
      'Clímax': ['Retorno'],
      'Resolução': ['Mudança'],
      'Epílogo': ['Mudança'],
    }
  },
  'Save the Cat (Blake Snyder)': {
    key: 'saveTheCat',
    color: 'bg-orange-950/60 border-orange-500/50 text-orange-300',
    map: {
      'Prólogo': ['Imagem de Abertura', 'Tema Declarado', 'Setup'],
      'Incidente Incitante': ['Catalisador', 'Debate'],
      '1º Ponto de Virada': ['Entrando no Ato II', 'Subtrama B'],
      'Midpoint': ['Diversão e Jogos', 'Ponto Médio'],
      'Crise': ['Inimigos se Aproximam', 'Tudo Está Perdido', 'Alma das Trevas'],
      'Clímax': ['Entrando no Ato III', 'Finale'],
      'Resolução': ['Imagem Final'],
      'Epílogo': ['Imagem Final'],
    }
  },
  'Freytag (Pirâmide Dramática)': {
    key: 'freytag',
    color: 'bg-red-950/60 border-red-500/50 text-red-300',
    map: {
      'Prólogo': ['Exposição'],
      'Incidente Incitante': ['Ação Ascendente'],
      '1º Ponto de Virada': ['Ação Ascendente'],
      'Midpoint': ['Clímax'],
      'Crise': ['Ação Descendente'],
      'Clímax': ['Clímax'],
      'Resolução': ['Resolução'],
      'Epílogo': ['Resolução'],
    }
  }
};

export default function RitmoTimeline({ projectId }) {
  const [events, setEvents] = useState(() => Object.fromEntries(milestones.map(([name]) => [name, []])));
  const [selectedFrameworks, setSelectedFrameworks] = useState([]);
  const [frameworkValues, setFrameworkValues] = useState({});
  const [openMilestone, setOpenMilestone] = useState(null);
  const [draft, setDraft] = useState({ title: '', description: '' });
  const [editingEvent, setEditingEvent] = useState(null);
  const [savingStatus, setSavingStatus] = useState('Salvo');
  const [openIdeasMap, setOpenIdeasMap] = useState({});
  const isFirstRender = useRef(true);

  // 1. Carrega tanto a Timeline quanto a Estrutura Dramática do backend
  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      try {
        const [resTimeline, resEstrutura] = await Promise.all([
          apiClient.get(`/entities/projects/${projectId}/ritmo-timeline`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/estrutura-dramatica`).catch(() => ({ data: {} }))
        ]);

        if (resTimeline.data) {
          const rawData = resTimeline.data.data || resTimeline.data;
          if (typeof rawData === 'object' && !Array.isArray(rawData)) {
            setEvents((prev) => ({ ...prev, ...rawData }));
          }
        }

        if (resEstrutura.data) {
          if (resEstrutura.data.selectedFrameworks) {
            setSelectedFrameworks(resEstrutura.data.selectedFrameworks);
          }
          if (resEstrutura.data.values) {
            setFrameworkValues(resEstrutura.data.values);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar dados do Ritmo & Timeline:', err);
      }
    };

    fetchData();
  }, [projectId]);

  // 2. Auto-save dos eventos da Timeline
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!projectId) return;

    setSavingStatus('Salvando...');

    const timer = setTimeout(async () => {
      try {
        await apiClient.post(`/entities/projects/${projectId}/ritmo-timeline`, events);
        setSavingStatus('Salvo');
      } catch (err) {
        console.error('Erro no Auto-save do Ritmo & Timeline:', err);
        setSavingStatus('Erro ao salvar');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [events, projectId]);

  const completedMilestones = milestones.filter(([name]) => (events[name] || []).length > 0).length;
  const progress = Math.round((completedMilestones / milestones.length) * 100);

  function openEventForm(milestoneName, prefill = { title: '', description: '' }) {
    setOpenMilestone(milestoneName);
    setEditingEvent(null);
    setDraft({ title: prefill.title, description: prefill.description });
  }

  function editEvent(milestoneName, event) {
    setOpenMilestone(milestoneName);
    setEditingEvent(event.id);
    setDraft({ title: event.title, description: event.description });
  }

  function cancelEvent() {
    setOpenMilestone(null);
    setEditingEvent(null);
    setDraft({ title: '', description: '' });
  }

  function saveEvent(milestoneName) {
    if (!draft.title.trim() || !draft.description.trim()) return;
    setEvents((currentEvents) => {
      const milestoneEvents = currentEvents[milestoneName] || [];
      const nextEvents = editingEvent
        ? milestoneEvents.map((e) => (e.id === editingEvent ? { ...e, ...draft } : e))
        : [...milestoneEvents, { id: crypto.randomUUID(), ...draft }];
      return { ...currentEvents, [milestoneName]: nextEvents };
    });
    cancelEvent();
  }

  function deleteEvent(milestoneName, eventId) {
    setEvents((currentEvents) => ({
      ...currentEvents,
      [milestoneName]: (currentEvents[milestoneName] || []).filter((e) => e.id !== eventId),
    }));
  }

  // Retorna os beats equivalentes dos frameworks selecionados para este marco
  function getEquivalencesForMilestone(milestoneName) {
    const list = [];
    selectedFrameworks.forEach((fwName) => {
      const config = FRAMEWORK_MAPPINGS[fwName];
      if (config && config.map[milestoneName]) {
        list.push({
          framework: fwName,
          beats: config.map[milestoneName],
          color: config.color,
          key: config.key
        });
      }
    });
    return list;
  }

  // Coleta textos que o usuário já tenha escrito na Estrutura Dramática para este marco
  function getWrittenIdeasForMilestone(milestoneName) {
    const ideas = [];
    const equivalences = getEquivalencesForMilestone(milestoneName);

    equivalences.forEach((eq) => {
      const fwValues = frameworkValues[eq.key] || {};
      eq.beats.forEach((beatName) => {
        const userText = (fwValues[beatName] || '').trim();
        if (userText) {
          ideas.push({
            framework: eq.framework,
            beat: beatName,
            text: userText,
            color: eq.color
          });
        }
      });
    });

    return ideas;
  }

  function getMilestoneTheme(name) {
    const norm = String(name).toLowerCase();
    if (norm.includes('prólogo') || norm.includes('prologo')) {
      return {
        cardBorder: 'border-indigo-900/50 hover:border-indigo-600/70',
        numberBg: 'bg-indigo-950 text-indigo-300 border-indigo-800/60',
        badge: 'bg-indigo-900/60 text-indigo-300 border-indigo-500/50',
        button: 'bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-200 border-indigo-700/50'
      };
    }
    if (norm.includes('incitante')) {
      return {
        cardBorder: 'border-purple-900/50 hover:border-purple-600/70',
        numberBg: 'bg-purple-950 text-purple-300 border-purple-800/60',
        badge: 'bg-purple-900/60 text-purple-300 border-purple-500/50',
        button: 'bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border-purple-700/50'
      };
    }
    if (norm.includes('1º ponto') || norm.includes('virada')) {
      return {
        cardBorder: 'border-blue-900/50 hover:border-blue-600/70',
        numberBg: 'bg-blue-950 text-blue-300 border-blue-800/60',
        badge: 'bg-blue-900/60 text-blue-300 border-blue-500/50',
        button: 'bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border-blue-700/50'
      };
    }
    if (norm.includes('midpoint')) {
      return {
        cardBorder: 'border-cyan-900/50 hover:border-cyan-600/70',
        numberBg: 'bg-cyan-950 text-cyan-300 border-cyan-800/60',
        badge: 'bg-cyan-900/60 text-cyan-300 border-cyan-500/50',
        button: 'bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-200 border-cyan-700/50'
      };
    }
    if (norm.includes('crise')) {
      return {
        cardBorder: 'border-amber-900/50 hover:border-amber-600/70',
        numberBg: 'bg-amber-950 text-amber-300 border-amber-800/60',
        badge: 'bg-amber-900/60 text-amber-300 border-amber-500/50',
        button: 'bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 border-amber-700/50'
      };
    }
    if (norm.includes('clímax') || norm.includes('climax')) {
      return {
        cardBorder: 'border-red-900/50 hover:border-red-600/70',
        numberBg: 'bg-red-950 text-red-300 border-red-800/60',
        badge: 'bg-red-900/60 text-red-300 border-red-500/50',
        button: 'bg-red-900/40 hover:bg-red-800/60 text-red-200 border-red-700/50'
      };
    }
    if (norm.includes('resolução') || norm.includes('resolucao')) {
      return {
        cardBorder: 'border-emerald-900/50 hover:border-emerald-600/70',
        numberBg: 'bg-emerald-950 text-emerald-300 border-emerald-800/60',
        badge: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50',
        button: 'bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 border-emerald-700/50'
      };
    }
    if (norm.includes('epílogo') || norm.includes('epilogo')) {
      return {
        cardBorder: 'border-pink-900/50 hover:border-pink-600/70',
        numberBg: 'bg-pink-950 text-pink-300 border-pink-800/60',
        badge: 'bg-pink-900/60 text-pink-300 border-pink-500/50',
        button: 'bg-pink-900/40 hover:bg-pink-800/60 text-pink-200 border-pink-700/50'
      };
    }
    return {
      cardBorder: 'border-gray-800',
      numberBg: 'bg-gray-800 text-gray-300',
      badge: 'bg-purple-900/60 text-purple-300 border-purple-500/50',
      button: 'bg-purple-900/40 text-purple-200'
    };
  }

  return (
    <main className="module-page timeline-page">
      <header className="module-header flex justify-between items-center">
        <div>
          <h1>Ritmo &amp; Timeline</h1>
          <p>A linha do tempo universal que padroniza o ritmo da sua história.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium bg-[#1c1c26] px-3 py-1 rounded-full border border-gray-800">
            {savingStatus}
          </span>
          <div className="module-progress"><span aria-hidden="true" />{progress}%</div>
        </div>
      </header>

      <div className="module-progress-track"><div style={{ width: `${progress}%` }} /></div>

      <RitmoTimelineGuide />

      <p className="timeline-intro mb-4 text-xs text-gray-400">
        Cada marco narrativo contém sua descrição e os eventos da linha do tempo vinculados. 
        {selectedFrameworks.length > 0 && (
          <span className="text-purple-300 font-semibold ml-1">
            (Frameworks ativos: {selectedFrameworks.join(', ')})
          </span>
        )}
      </p>

      <section className="timeline-list" aria-label="Marcos narrativos">
        {milestones.map(([name, description], index) => {
          const milestoneEvents = events[name] || [];
          const theme = getMilestoneTheme(name);
          const equivalences = getEquivalencesForMilestone(name);
          const writtenIdeas = getWrittenIdeasForMilestone(name);
          const isIdeasOpen = openIdeasMap[name] !== false;

          return (
            <article className={`timeline-milestone bg-[#14141e] border rounded-xl p-5 mb-4 transition-all ${theme.cardBorder}`} key={name}>
              <header className="milestone-header flex justify-between items-start mb-2">
                <div>
                  <div className="milestone-title flex items-center gap-2 mb-1">
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs ${theme.numberBg}`}>
                      {index + 1}
                    </span>
                    <strong className="text-white text-base font-bold">{name}</strong>
                    {milestoneEvents.length > 0 && (
                      <small className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${theme.badge}`}>
                        {milestoneEvents.length} evento{milestoneEvents.length > 1 ? 's' : ''}
                      </small>
                    )}
                  </div>
                </div>

                <button 
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${theme.button}`} 
                  type="button" 
                  onClick={() => openEventForm(name)}
                >
                  <Plus size={14} /> Evento
                </button>
              </header>

              {/* GUIA VISUAL DE EQUIVALÊNCIA DAS ESTRUTURAS */}
              {equivalences.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 my-2.5 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mr-1">
                    Equivalências da Estrutura:
                  </span>
                  {equivalences.map((item, i) => (
                    <span 
                      key={i} 
                      className={`px-2 py-0.5 rounded border text-[11px] font-medium flex items-center gap-1 ${item.color}`}
                    >
                      <strong className="font-bold">{item.framework.split(' ')[0]}:</strong>
                      <span>{item.beats.join(' / ')}</span>
                    </span>
                  ))}
                </div>
              )}

              <p className="milestone-description text-gray-400 text-xs mb-3">{description}</p>

              {/* BLOCO DE ANOTAÇÕES/IDEIAS DA ESTRUTURA DRAMÁTICA (SE HOUVER TEXTO PREENCHIDO) */}
              {writtenIdeas.length > 0 && (
                <div className="mb-4 bg-[#1a1a28] rounded-xl border border-purple-900/40 p-3.5 space-y-2">
                  <button
                    type="button"
                    onClick={() => setOpenIdeasMap((prev) => ({ ...prev, [name]: !isIdeasOpen }))}
                    className="w-full flex justify-between items-center text-xs font-bold text-purple-300 hover:text-purple-200 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-400 shrink-0" />
                      Ideias da Estrutura Dramática ({writtenIdeas.length})
                    </span>
                    <span>{isIdeasOpen ? 'Recolher' : 'Expandir'}</span>
                  </button>

                  {isIdeasOpen && (
                    <div className="space-y-2 pt-2 border-t border-purple-900/20">
                      {writtenIdeas.map((idea, idx) => (
                        <div key={idx} className="p-2.5 bg-[#12121a] rounded-lg border border-gray-800 text-xs flex justify-between items-start gap-3">
                          <div className="space-y-1">
                            <span className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-bold ${idea.color}`}>
                              {idea.framework.split(' ')[0]} • {idea.beat}
                            </span>
                            <p className="text-gray-300 leading-relaxed italic">{idea.text}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openEventForm(name, { title: `${idea.beat}`, description: idea.text })}
                            className="px-2.5 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 rounded text-[11px] font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                            title="Converter essa ideia em um evento da timeline"
                          >
                            ⚡ Converter em Evento
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* FORMULÁRIO DE ADIÇÃO OU EDIÇÃO DE EVENTO */}
              {openMilestone === name && (
                <div className="event-form space-y-2 mb-3 bg-[#1a1a26] p-4 rounded-lg border border-purple-900/50">
                  <span className="text-xs font-bold text-purple-300 block mb-1">
                    {editingEvent ? 'Editar Evento' : 'Novo Evento no Marco:'}
                  </span>
                  <input
                    type="text"
                    className="w-full bg-[#12121a] border border-gray-700 rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
                    placeholder="Título do evento..."
                    value={draft.title}
                    onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  />
                  <textarea
                    className="w-full bg-[#12121a] border border-gray-700 rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 h-20"
                    placeholder="Descrição detalhada do evento..."
                    value={draft.description}
                    onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                  />
                  <div className="event-form-actions flex gap-2 pt-1">
                    <button className="event-save px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded text-xs cursor-pointer transition-colors" type="button" onClick={() => saveEvent(name)}>
                      {editingEvent ? 'Salvar' : 'Adicionar Evento'}
                    </button>
                    <button className="event-cancel px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded text-xs cursor-pointer transition-colors" type="button" onClick={cancelEvent}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* LISTA DE EVENTOS DA TIMELINE DESTE MARCO */}
              {milestoneEvents.map((event) => (
                <div className="timeline-event bg-[#181824] p-3 rounded-lg border border-gray-800/80 mb-2 flex justify-between items-start" key={event.id}>
                  <div>
                    <strong className="text-white text-xs block mb-0.5">{event.title}</strong>
                    <p className="text-gray-400 text-[11px] leading-relaxed">{event.description}</p>
                  </div>
                  <div className="event-actions flex gap-2 text-xs text-gray-500 shrink-0 ml-2">
                    <button className="hover:text-purple-400 cursor-pointer p-1 transition-colors" type="button" aria-label={`Editar ${event.title}`} onClick={() => editEvent(name, event)}>
                      <Pencil size={14} />
                    </button>
                    <button className="hover:text-red-400 cursor-pointer p-1 transition-colors" type="button" aria-label={`Excluir ${event.title}`} onClick={() => deleteEvent(name, event.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </article>
          );
        })}
      </section>
    </main>
  );
}