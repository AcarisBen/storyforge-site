import { useState } from 'react'

const guideTabs = {
  Objetivo: <p>Construir reviravoltas que surpreendem mas que parecem inevitáveis em retrospecto.</p>,
  Dicas: <ul><li>Um bom plot twist muda o significado de tudo que veio antes.</li><li>Foreshadowing deve ser sutil o suficiente para não ser óbvio, mas claro em retrospecto.</li><li>A consequência do twist deve ser mais importante que o próprio twist.</li></ul>,
  Exemplos: <ul><li>Twist: “O mentor é o vilão.” — Foreshadowing: “Ele sabia demais sobre o inimigo.”</li><li>Consequência: “O protagonista precisa encontrar uma nova fonte de sabedoria.”</li></ul>,
  Perguntas: <ul><li>O que o público acredita que é verdade e não é?</li><li>Onde você planta as sementes do twist?</li><li>Como a revelação muda a história daqui para frente?</li></ul>,
}

const fields = [
  ['title', 'Título', 'input', 'Nome do plot twist...'],
  ['planning', 'Planejamento', 'textarea', 'Descreva como a reviravolta será construída...'],
  ['foreshadowing', 'Foreshadowing', 'textarea', 'Quais pistas antecipam a revelação...'],
  ['revelationMoment', 'Momento da Revelação', 'textarea', 'Quando e como o público descobre a verdade...'],
  ['consequence', 'Consequência', 'textarea', 'Como a revelação muda a história...'],
]

const blankTwist = () => Object.fromEntries(fields.map(([key]) => [key, '']))

function TwistGuide() {
  const [activeTab, setActiveTab] = useState('Objetivo')
  const [isOpen, setIsOpen] = useState(false)
  return (
    <section className="module-guide character-guide">
      <button
        className="guide-toggle"
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
                className={activeTab === tab ? 'guide-tab active' : 'guide-tab'}
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
  )
}

// 👉 Export nomeado, não default
export function ForeshadowingGuide() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <section className="module-guide foreshadowing-guide">
      <button
        className="guide-toggle"
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
  )
}

function TwistForm({ twist, onChange, onSave, onCancel, editing }) {
  return (
    <div className="twist-form">
      {fields.map(([key, label, type, placeholder]) => (
        <label key={key}>
          <span>{label}</span>
          {type === 'textarea' ? (
            <textarea
              placeholder={placeholder}
              value={twist[key]}
              onChange={(event) => onChange({ ...twist, [key]: event.target.value })}
            />
          ) : (
            <input
              autoFocus
              placeholder={placeholder}
              value={twist[key]}
              onChange={(event) => onChange({ ...twist, [key]: event.target.value })}
            />
          )}
        </label>
      ))}
      <div className="twist-form-actions">
        <button className="event-save" type="button" onClick={onSave}>
          {editing ? 'Salvar alterações' : 'Concluir'}
        </button>
        <button className="event-cancel" type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  )
}

function PlotTwists() {
  const [twists, setTwists] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [draft, setDraft] = useState(blankTwist())
  const [editingId, setEditingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  function openCreate() { setDraft(blankTwist()); setEditingId(null); setIsCreating(true) }
  function saveTwist() {
    if (!draft.title.trim()) return
    if (editingId) {
      setTwists((current) =>
        current.map((twist) =>
          twist.id === editingId ? { ...twist, ...draft, title: draft.title.trim() } : twist
        )
      )
    } else {
      setTwists((current) => [...current, { id: crypto.randomUUID(), ...draft, title: draft.title.trim() }])
    }
    setDraft(blankTwist()); setEditingId(null); setIsCreating(false); setExpandedId(null)
  }
  function editTwist(twist) { setDraft({ ...twist }); setEditingId(twist.id); setIsCreating(false); setExpandedId(twist.id) }
  function deleteTwist(id) { setTwists((current) => current.filter((twist) => twist.id !== id)); if (expandedId === id) setExpandedId(null) }

  return (
    <main className="characters-page plot-twists-page">
      <header className="characters-header">
        <div>
          <h1>Plot Twists</h1>
          <p>Planejamento de reviravoltas com foreshadowing e consequências.</p>
        </div>
      </header>
      <TwistGuide />
      <ForeshadowingGuide />

      <div className="mystery-toolbar">
        <span>{twists.length} plot twist(s)</span>
        <button className="new-character-button" type="button" onClick={openCreate}>
          ＋ Novo Plot Twist
        </button>
      </div>

      {isCreating && (
        <TwistForm
          twist={draft}
          onChange={setDraft}
          onSave={saveTwist}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {twists.length === 0 && !isCreating ? (
        <div className="empty-characters plot-empty">
          <span aria-hidden="true">ϟ</span>
          <p>Nenhum plot twist planejado ainda.</p>
        </div>
      ) : (
        <div className="twists-list">
          {twists.map((twist) => (
            <article className="twist-card" key={twist.id}>
              <header className="twist-card-header">
                <h2>
                  <span aria-hidden="true">ϟ</span>
                  {twist.title}
                </h2>
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      expandedId === twist.id ? setExpandedId(null) : editTwist(twist)
                    }
                  >
                    {expandedId === twist.id ? 'Concluir' : 'Editar'}
                  </button>
                  <button
                    type="button"
                    aria-label={`Excluir ${twist.title}`}
                    onClick={() => deleteTwist(twist.id)}
                  >
                    ♜
                  </button>
                </div>
              </header>

              {expandedId === twist.id ? (
                <TwistForm
                  twist={draft}
                  onChange={setDraft}
                  onSave={saveTwist}
                  onCancel={() => setExpandedId(null)}
                  editing
                />
              ) : (
                <div className="twist-summary">
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
  )
}

export default PlotTwists
