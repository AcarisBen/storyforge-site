import { useState } from 'react'

const guideTabs = {
  Objetivo: <p>Estruturar cada cena como uma unidade dramática que avança a história.</p>,
  Dicas: <ul><li>Toda cena precisa de um objetivo — se a cena não muda nada, corte-a.</li><li>O conflito da cena deve escalar ou transformar a situação.</li><li>O gancho para a próxima cena mantém o público engajado.</li></ul>,
  Exemplos: <ul><li>Objetivo: “Convencer o aliado a entrar na batalha.”</li><li>Gancho: “A porta se abre e revela o vilão.”</li></ul>,
  Perguntas: <ul><li>O que esta cena muda na história?</li><li>Qual é o conflito central da cena?</li><li>Como ela conecta com a próxima?</li></ul>,
}

const sceneFields = [
  ['objective', 'Objetivo', 'Descreva o objetivo da cena...'],
  ['conflict', 'Conflito', 'Descreva o conflito da cena...'],
  ['location', 'Local', 'Onde a cena acontece...'],
  ['time', 'Horário', 'Quando a cena acontece...'],
  ['emotion', 'Emoção predominante', 'Qual emoção domina a cena...'],
  ['mystery', 'Mistério', 'Que mistério está presente...'],
  ['suspense', 'Suspense', 'O que mantém a tensão...'],
  ['irony', 'Ironia dramática', 'O que o público sabe, mas os personagens não...'],
  ['plotTwist', 'Plot twist', 'Qual é a reviravolta da cena...'],
  ['consequence', 'Consequência', 'O que muda depois da cena...'],
  ['hook', 'Gancho para próxima cena', 'Como esta cena conecta com a próxima...'],
]

const blankScene = () => Object.fromEntries(sceneFields.map(([key]) => [key, '']))

function SceneGuide() {
  const [activeTab, setActiveTab] = useState('Objetivo')
  const [isOpen, setIsOpen] = useState(true)
  return <section className="module-guide character-guide">
    <button className="guide-toggle" type="button" aria-expanded={isOpen} onClick={() => setIsOpen((value) => !value)}><span><b aria-hidden="true">!</b> Guia do Módulo</span><span aria-hidden="true">{isOpen ? '⌃' : '⌄'}</span></button>
    {isOpen && <div className="guide-content"><nav className="guide-tabs" aria-label="Guia do módulo">{Object.keys(guideTabs).map((tab) => <button className={activeTab === tab ? 'guide-tab active' : 'guide-tab'} type="button" key={tab} onClick={() => setActiveTab(tab)}><span aria-hidden="true">{tab === 'Objetivo' ? '◎' : tab === 'Dicas' ? '♧' : tab === 'Exemplos' ? '▣' : '?'}</span>{tab}</button>)}</nav><div className="guide-description">{guideTabs[activeTab]}</div></div>}
  </section>
}

function SceneForm({ scene, onChange, onSave, onCancel, isEditing }) {
  return <div className="scene-form">
    <label><span>Título</span><input autoFocus value={scene.title} placeholder="Título da cena..." onChange={(event) => onChange({ ...scene, title: event.target.value })} /></label>
    {sceneFields.map(([key, label, placeholder]) => <label key={key}><span>{label}</span>{key === 'location' || key === 'time' || key === 'emotion' ? <input value={scene[key]} placeholder={placeholder} onChange={(event) => onChange({ ...scene, [key]: event.target.value })} /> : <textarea value={scene[key]} placeholder={placeholder} onChange={(event) => onChange({ ...scene, [key]: event.target.value })} />}</label>)}
    <div className="scene-form-actions"><button className="event-save" type="button" onClick={onSave}>{isEditing ? 'Salvar alterações' : 'Criar Cena'}</button><button className="event-cancel" type="button" onClick={onCancel}>Cancelar</button></div>
  </div>
}

function Cenas() {
  const [scenes, setScenes] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [draft, setDraft] = useState({ title: '', ...blankScene() })
  const [expandedScene, setExpandedScene] = useState(null)
  const [editingScene, setEditingScene] = useState(null)
  const [draggedScene, setDraggedScene] = useState(null)

  function saveScene() {
    if (!draft.title.trim()) return
    if (editingScene) setScenes((current) => current.map((scene) => scene.id === editingScene ? { ...scene, ...draft, title: draft.title.trim() } : scene))
    else setScenes((current) => [...current, { id: crypto.randomUUID(), ...draft, title: draft.title.trim() }])
    setIsCreating(false)
    setEditingScene(null)
    setDraft({ title: '', ...blankScene() })
  }
  function editScene(scene) { setEditingScene(scene.id); setDraft({ ...scene }); setIsCreating(false); setExpandedScene(scene.id) }
  function moveScene(targetId) {
    if (!draggedScene || draggedScene === targetId) return
    setScenes((current) => { const from = current.findIndex((scene) => scene.id === draggedScene); const to = current.findIndex((scene) => scene.id === targetId); const next = [...current]; const [moved] = next.splice(from, 1); next.splice(to, 0, moved); return next })
    setDraggedScene(null)
  }
  function updateScene(sceneId, changes) { setScenes((current) => current.map((scene) => scene.id === sceneId ? { ...scene, ...changes } : scene)) }

  return <main className="characters-page scenes-page">
    <header className="characters-header"><div><h1>Cenas</h1><p>Cada cena como unidade narrativa com objetivo, conflito e gancho.</p></div></header>
    <SceneGuide />
    <div className="scenes-toolbar"><span>{scenes.length} cena(s)</span><button className="new-character-button" type="button" onClick={() => { setIsCreating(true); setEditingScene(null); setDraft({ title: '', ...blankScene() }) }}>＋ Nova Cena</button></div>
    {isCreating && <SceneForm scene={draft} onChange={setDraft} onSave={saveScene} onCancel={() => setIsCreating(false)} isEditing={false} />}
    {scenes.length === 0 && !isCreating ? <div className="empty-characters scenes-empty"><span aria-hidden="true">▦</span><p>Nenhuma cena criada ainda.</p></div> : <div className="scenes-list">{scenes.map((scene, index) => <article className="scene-card" key={scene.id} draggable onDragStart={() => setDraggedScene(scene.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => moveScene(scene.id)}>
      {editingScene === scene.id ? <SceneForm scene={draft} onChange={setDraft} onSave={saveScene} onCancel={() => setEditingScene(null)} isEditing /> : <>
        <header className="scene-card-header"><span className="drag-handle" aria-label="Arraste para reordenar">⁙</span><span className="scene-number">{index + 1}</span><button className="scene-expand" type="button" onClick={() => setExpandedScene(expandedScene === scene.id ? null : scene.id)}><strong>{scene.title}</strong></button><button className="scene-chevron" type="button" aria-label="Expandir cena" onClick={() => setExpandedScene(expandedScene === scene.id ? null : scene.id)}>{expandedScene === scene.id ? '⌃' : '⌄'}</button><button className="scene-delete" type="button" aria-label={`Excluir ${scene.title}`} onClick={() => setScenes((current) => current.filter((item) => item.id !== scene.id))}>♜</button></header>
        {expandedScene === scene.id && <div className="scene-details"><SceneForm scene={scene} onChange={(changes) => updateScene(scene.id, changes)} onSave={() => setExpandedScene(null)} onCancel={() => setExpandedScene(null)} isEditing /><div className="scene-edit-actions"><button type="button" onClick={() => editScene(scene)}>Editar opções</button></div></div>}
      </>}
    </article>)}</div>}
  </main>
}

export default Cenas