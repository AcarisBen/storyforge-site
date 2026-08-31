import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';

const tabs = {
  Objetivo: {
    icon: '◎',
    content: <p>Definir e visualizar os marcos narrativos essenciais na ordem dramática correta.</p>,
  },
  Dicas: {
    icon: '♧',
    content: (
      <ul>
        <li>O incidente incitante deve acontecer nos primeiros 10-15% da história.</li>
        <li>O midpoint deve inverter ou escalar o conflito de forma significativa.</li>
        <li>O clímax deve ser o ponto de maior tensão e deve responder ao tema.</li>
      </ul>
    ),
  },
  Exemplos: {
    icon: '▣',
    content: (
      <ul>
        <li>Incidente Incitante: “Luke descobre a mensagem da Princesa Leia.”</li>
        <li>Midpoint: “O protagonista descobre que o mentor é o vilão.”</li>
      </ul>
    ),
  },
  Perguntas: {
    icon: '?',
    content: (
      <ul>
        <li>O que dá início à jornada do protagonista?</li>
        <li>Qual é o ponto de virada que muda tudo?</li>
        <li>O clímax responde à pergunta dramática central?</li>
      </ul>
    ),
  },
};

const milestones = [
  ['Incidente Incitante', 'O evento que rompe o equilíbrio inicial e coloca a história em movimento.'],
  ['1º Ponto de Virada', 'A decisão ou acontecimento que leva o protagonista a entrar no conflito principal.'],
  ['Midpoint', 'O ponto central que inverte ou escala o conflito de forma significativa.'],
  ['Crise', 'O momento de maior pressão antes do confronto final.'],
  ['Clímax', 'O ponto de maior tensão, em que o conflito central encontra sua resposta.'],
  ['Resolução', 'As consequências do clímax e o novo equilíbrio da história.'],
  ['Epílogo', 'O vislumbre final do mundo e dos personagens depois da resolução.'],
];

export default function RitmoTimeline({ projectId }) {
  const [activeTab, setActiveTab] = useState('Objetivo');
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [events, setEvents] = useState(() => Object.fromEntries(milestones.map(([name]) => [name, []])));
  const [openMilestone, setOpenMilestone] = useState(null);
  const [draft, setDraft] = useState({ title: '', description: '' });
  const [editingEvent, setEditingEvent] = useState(null);
  const [savingStatus, setSavingStatus] = useState('Salvo');
  const isFirstRender = useRef(true);

  // 1. Carrega do banco de dados PostgreSQL ao abrir
  useEffect(() => {
    if (!projectId) return;

    const fetchTimeline = async () => {
      try {
        const res = await apiClient.get(`/entities/projects/${projectId}/ritmo-timeline`);
        if (res.data && Object.keys(res.data).length > 0) {
          setEvents((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Erro ao buscar dados do Ritmo & Timeline:', err);
      }
    };

    fetchTimeline();
  }, [projectId]);

  // 2. Auto-save com Debounce de 1.5s ao alterar a lista de eventos
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
        setSavingStatus('Salvo no banco');
      } catch (err) {
        console.error('Erro no Auto-save do Ritmo & Timeline:', err);
        setSavingStatus('Erro ao salvar');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [events, projectId]);

  const activeContent = tabs[activeTab];
  const completedMilestones = milestones.filter(([name]) => (events[name] || []).length > 0).length;
  const progress = Math.round((completedMilestones / milestones.length) * 100);

  function openEventForm(milestoneName) {
    setOpenMilestone(milestoneName);
    setEditingEvent(null);
    setDraft({ title: '', description: '' });
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

// Função auxiliar para definir as cores dos 7 marcos narrativos
function getMilestoneTheme(name) {
  const norm = String(name).toLowerCase();
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
          <p>Os marcos narrativos dispostos em uma linha do tempo visual interativa.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium bg-[#1c1c26] px-3 py-1 rounded-full border border-gray-800">
            {savingStatus}
          </span>
          <div className="module-progress"><span aria-hidden="true" />{progress}%</div>
        </div>
      </header>
      <div className="module-progress-track"><div style={{ width: `${progress}%` }} /></div>

      <section className="module-guide">
        <button className="guide-toggle" type="button" aria-expanded={isGuideOpen} aria-controls="timeline-guide-content" onClick={() => setIsGuideOpen((c) => !c)}>
          <span><b aria-hidden="true">!</b> Guia do Módulo</span>
          <span aria-hidden="true">{isGuideOpen ? '⌃' : '⌄'}</span>
        </button>
        {isGuideOpen && (
          <div className="guide-content" id="timeline-guide-content">
            <nav className="guide-tabs" aria-label="Guia do módulo">
              {Object.entries(tabs).map(([label, tab]) => (
                <button className={activeTab === label ? 'guide-tab active' : 'guide-tab'} type="button" key={label} onClick={() => setActiveTab(label)}>
                  <span aria-hidden="true">{tab.icon}</span>{label}
                </button>
              ))}
            </nav>
            <div className="guide-description">{activeContent.content}</div>
          </div>
        )}
      </section>

      <p className="timeline-intro">Cada marco narrativo contém sua descrição e os eventos da timeline vinculados a ele. Adicione eventos diretamente sob cada marco.</p>
      
      <section className="timeline-list" aria-label="Marcos narrativos">
        {milestones.map(([name, description], index) => {
  const milestoneEvents = events[name] || [];
  const theme = getMilestoneTheme(name);

  return (
    <article className={`timeline-milestone bg-[#14141e] border rounded-xl p-5 mb-4 transition-all ${theme.cardBorder}`} key={name}>
      <header className="milestone-header flex justify-between items-center mb-2">
        <div className="milestone-title flex items-center gap-2">
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
        <button 
          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${theme.button}`} 
          type="button" 
          onClick={() => openEventForm(name)}
        >
          + Evento
        </button>
      </header>

      <p className="milestone-description text-gray-400 text-xs mb-3">{description}</p>
              
              {openMilestone === name && (
                <div className="event-form">
                  <input
                    type="text"
                    placeholder="Título do evento..."
                    value={draft.title}
                    onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  />
                  <textarea
                    placeholder="Descrição do evento..."
                    value={draft.description}
                    onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                  />
                  <div className="event-form-actions">
                    <button className="event-save cursor-pointer" type="button" onClick={() => saveEvent(name)}>
                      {editingEvent ? 'Salvar' : 'Adicionar'}
                    </button>
                    <button className="event-cancel cursor-pointer" type="button" onClick={cancelEvent}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {milestoneEvents.map((event) => (
                <div className="timeline-event" key={event.id}>
                  <div>
                    <strong>{event.title}</strong>
                    <p>{event.description}</p>
                  </div>
                  <div className="event-actions">
                    <button type="button" aria-label={`Editar ${event.title}`} onClick={() => editEvent(name, event)}>✎</button>
                    <button type="button" aria-label={`Excluir ${event.title}`} onClick={() => deleteEvent(name, event.id)}>🗑</button>
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