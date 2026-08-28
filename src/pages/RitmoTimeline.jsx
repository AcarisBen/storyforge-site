import { useState } from 'react'

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
}

const milestones = [
  ['Incidente Incitante', 'O evento que rompe o equilíbrio inicial e coloca a história em movimento.'],
  ['1º Ponto de Virada', 'A decisão ou acontecimento que leva o protagonista a entrar no conflito principal.'],
  ['Midpoint', 'O ponto central que inverte ou escala o conflito de forma significativa.'],
  ['Crise', 'O momento de maior pressão antes do confronto final.'],
  ['Clímax', 'O ponto de maior tensão, em que o conflito central encontra sua resposta.'],
  ['Resolução', 'As consequências do clímax e o novo equilíbrio da história.'],
  ['Epílogo', 'O vislumbre final do mundo e dos personagens depois da resolução.'],
]

function RitmoTimeline() {
  const [activeTab, setActiveTab] = useState('Objetivo')
  const [isGuideOpen, setIsGuideOpen] = useState(true)
  const [events, setEvents] = useState(() => Object.fromEntries(milestones.map(([name]) => [name, []])))
  const [openMilestone, setOpenMilestone] = useState(null)
  const [draft, setDraft] = useState({ title: '', description: '' })
  const [editingEvent, setEditingEvent] = useState(null)
  const activeContent = tabs[activeTab]
  const completedMilestones = milestones.filter(([name]) => events[name].length > 0).length
  const progress = Math.round((completedMilestones / milestones.length) * 100)

  function openEventForm(milestoneName) {
    setOpenMilestone(milestoneName)
    setEditingEvent(null)
    setDraft({ title: '', description: '' })
  }

  function editEvent(milestoneName, event) {
    setOpenMilestone(milestoneName)
    setEditingEvent(event.id)
    setDraft({ title: event.title, description: event.description })
  }

  function cancelEvent() {
    setOpenMilestone(null)
    setEditingEvent(null)
    setDraft({ title: '', description: '' })
  }

  function saveEvent(milestoneName) {
    if (!draft.title.trim() || !draft.description.trim()) return
    setEvents((currentEvents) => {
      const milestoneEvents = currentEvents[milestoneName]
      const nextEvents = editingEvent
        ? milestoneEvents.map((event) => event.id === editingEvent ? { ...event, ...draft } : event)
        : [...milestoneEvents, { id: crypto.randomUUID(), ...draft }]
      return { ...currentEvents, [milestoneName]: nextEvents }
    })
    cancelEvent()
  }

  function deleteEvent(milestoneName, eventId) {
    setEvents((currentEvents) => ({
      ...currentEvents,
      [milestoneName]: currentEvents[milestoneName].filter((event) => event.id !== eventId),
    }))
  }

  return (
    <main className="module-page timeline-page">
      <header className="module-header">
        <div>
          <h1>Ritmo &amp; Timeline</h1>
          <p>Os marcos narrativos dispostos em uma linha do tempo visual interativa.</p>
        </div>
        <div className="module-progress"><span aria-hidden="true" />{progress}%</div>
      </header>
      <div className="module-progress-track"><div style={{ width: `${progress}%` }} /></div>

      <section className="module-guide">
        <button className="guide-toggle" type="button" aria-expanded={isGuideOpen} aria-controls="timeline-guide-content" onClick={() => setIsGuideOpen((currentState) => !currentState)}>
          <span><b aria-hidden="true">!</b> Guia do Módulo</span>
          <span aria-hidden="true">{isGuideOpen ? '⌃' : '⌄'}</span>
        </button>
        {isGuideOpen && <div className="guide-content" id="timeline-guide-content">
          <nav className="guide-tabs" aria-label="Guia do módulo">
            {Object.entries(tabs).map(([label, tab]) => <button className={activeTab === label ? 'guide-tab active' : 'guide-tab'} type="button" key={label} onClick={() => setActiveTab(label)}><span aria-hidden="true">{tab.icon}</span>{label}</button>)}
          </nav>
          <div className="guide-description">{activeContent.content}</div>
        </div>}
      </section>

      <p className="timeline-intro">Cada marco narrativo contém sua descrição e os eventos da timeline vinculados a ele. Adicione eventos diretamente sob cada marco.</p>
      <section className="timeline-list" aria-label="Marcos narrativos">
        {milestones.map(([name, description], index) => (
          <article className="timeline-milestone" key={name}>
            <header className="milestone-header">
              <div className="milestone-title"><span className="milestone-number">{index + 1}</span><strong>{name}</strong>{events[name].length > 0 && <small>{events[name].length} evento{events[name].length > 1 ? 's' : ''}</small>}</div>
              <button className="add-event-button" type="button" onClick={() => openEventForm(name)}>+ Evento</button>
            </header>
            <p className="milestone-description">{description}</p>
            {openMilestone === name && <div className="event-form">
              <input type="text" placeholder="Título do evento..." value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
              <textarea placeholder="Descrição do evento..." value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
              <div className="event-form-actions"><button className="event-save" type="button" onClick={() => saveEvent(name)}>{editingEvent ? 'Salvar' : 'Adicionar'}</button><button className="event-cancel" type="button" onClick={cancelEvent}>Cancelar</button></div>
            </div>}
            {events[name].map((event) => <div className="timeline-event" key={event.id}><div><strong>{event.title}</strong><p>{event.description}</p></div><div className="event-actions"><button type="button" aria-label={`Editar ${event.title}`} onClick={() => editEvent(name, event)}>✎</button><button type="button" aria-label={`Excluir ${event.title}`} onClick={() => deleteEvent(name, event.id)}>♜</button></div></div>)}
          </article>
        ))}
      </section>
    </main>
  )
}

export default RitmoTimeline