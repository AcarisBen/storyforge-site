import { useState } from 'react'

const guideTabs = {
  Objetivo: <p>Estruturar mistérios que prendem o público sem trapacear.</p>,
  Dicas: <ul><li>O público deve ter todas as pistas antes da revelação — o mistério não pode trapacear.</li><li>Falsas pistas criam tensão, mas devem ser resolvidas de forma satisfatória.</li><li>O impacto da revelação deve mudar a história, não apenas informar.</li></ul>,
  Exemplos: <ul><li>Mistério: “Quem matou o rei?” — Revelação: “O próprio herdeiro, para impedir uma guerra.”</li><li>Falsa pista: “A adaga pertence ao embaixador — mas foi plantada.”</li></ul>,
  Perguntas: <ul><li>Quem sabe a verdade e quem não sabe?</li><li>Quais pistas o público recebe e quando?</li><li>Qual é o impacto da revelação na história?</li></ul>,
}

const mysteryFields = [
  ['title', 'Título', 'input', 'Nome do mistério...'],
  ['whoKnows', 'Quem sabe?', 'textarea', 'Quais personagens conhecem a verdade...'],
  ['whoDoesNotKnow', 'Quem não sabe?', 'textarea', 'Quais personagens estão no escuro...'],
  ['clues', 'Pistas', 'textarea', 'Quais pistas o público recebe...'],
  ['falseClues', 'Falsas pistas', 'textarea', 'Quais pistas levam a uma conclusão errada...'],
  ['revelation', 'Revelação', 'textarea', 'Qual é a verdade do mistério...'],
  ['impact', 'Impacto', 'textarea', 'Como a revelação muda a história...'],
]

const blankMystery = () => Object.fromEntries(mysteryFields.map(([key]) => [key, '']))

function MysteryGuide() {
  const [activeTab, setActiveTab] = useState('Objetivo')
  const [isOpen, setIsOpen] = useState(true)
  return <section className="module-guide character-guide">
    <button className="guide-toggle" type="button" aria-expanded={isOpen} onClick={() => setIsOpen((value) => !value)}><span><b aria-hidden="true">!</b> Guia do Módulo</span><span aria-hidden="true">{isOpen ? '⌃' : '⌄'}</span></button>
    {isOpen && <div className="guide-content"><nav className="guide-tabs" aria-label="Guia do módulo">{Object.keys(guideTabs).map((tab) => <button className={activeTab === tab ? 'guide-tab active' : 'guide-tab'} type="button" key={tab} onClick={() => setActiveTab(tab)}><span aria-hidden="true">{tab === 'Objetivo' ? '◎' : tab === 'Dicas' ? '♧' : tab === 'Exemplos' ? '▣' : '?'}</span>{tab}</button>)}</nav><div className="guide-description">{guideTabs[activeTab]}</div></div>}
  </section>
}

function MysteryForm({ mystery, onChange, onSave, onCancel, editing }) {
  return <div className="mystery-form">
    {mysteryFields.map(([key, label, type, placeholder]) => <label key={key}><span>{label}</span>{type === 'textarea' ? <textarea placeholder={placeholder} value={mystery[key]} onChange={(event) => onChange({ ...mystery, [key]: event.target.value })} /> : <input autoFocus placeholder={placeholder} value={mystery[key]} onChange={(event) => onChange({ ...mystery, [key]: event.target.value })} />}</label>)}
    <div className="mystery-form-actions"><button className="event-save" type="button" onClick={onSave}>{editing ? 'Salvar alterações' : 'Concluir'}</button><button className="event-cancel" type="button" onClick={onCancel}>Cancelar</button></div>
  </div>
}

function Misterios() {
  const [mysteries, setMysteries] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [draft, setDraft] = useState(blankMystery())
  const [editingId, setEditingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  function openCreate() { setDraft(blankMystery()); setEditingId(null); setIsCreating(true) }
  function saveMystery() {
    if (!draft.title.trim()) return
    if (editingId) setMysteries((current) => current.map((mystery) => mystery.id === editingId ? { ...mystery, ...draft, title: draft.title.trim() } : mystery))
    else setMysteries((current) => [...current, { id: crypto.randomUUID(), ...draft, title: draft.title.trim() }])
    setDraft(blankMystery()); setEditingId(null); setIsCreating(false)
  }
  function editMystery(mystery) { setDraft({ ...mystery }); setEditingId(mystery.id); setIsCreating(false); setExpandedId(mystery.id) }
  function deleteMystery(id) { setMysteries((current) => current.filter((mystery) => mystery.id !== id)); if (expandedId === id) setExpandedId(null) }

  return <main className="characters-page mysteries-page">
    <header className="characters-header"><div><h1>Mistérios</h1><p>Planejamento de cada mistério — quem sabe, pistas e revelações.</p></div></header>
    <MysteryGuide />
    <div className="mystery-toolbar"><span>{mysteries.length} mistério(s)</span><button className="new-character-button" type="button" onClick={openCreate}>＋ Novo Mistério</button></div>
    {isCreating && <MysteryForm mystery={draft} onChange={setDraft} onSave={saveMystery} onCancel={() => setIsCreating(false)} />}
    {mysteries.length === 0 && !isCreating ? <div className="empty-characters mystery-empty"><span aria-hidden="true">⌕</span><p>Nenhum mistério planejado ainda.</p></div> : <div className="mysteries-list">{mysteries.map((mystery) => <article className="mystery-card" key={mystery.id}>
      <header className="mystery-card-header"><h2>{mystery.title}</h2><div><button type="button" onClick={() => expandedId === mystery.id ? setExpandedId(null) : setExpandedId(mystery.id)}>{expandedId === mystery.id ? 'Concluir' : 'Editar'}</button><button type="button" aria-label={`Excluir ${mystery.title}`} onClick={() => deleteMystery(mystery.id)}>♜</button></div></header>
      {expandedId === mystery.id ? <MysteryForm mystery={draft} onChange={setDraft} onSave={saveMystery} onCancel={() => setExpandedId(null)} editing /> : <div className="mystery-summary">{mysteryFields.slice(1).map(([key, label]) => <div key={key}><span>{label}</span><p>{mystery[key] || 'Não informado.'}</p></div>)}</div>}
    </article>)}</div>}
  </main>
}

export default Misterios