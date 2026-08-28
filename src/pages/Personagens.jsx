import { useState } from 'react'

const characterTypes = {
  protagonista: { label: 'Protagonista', icon: '♛', className: 'type-protagonist' },
  antagonista: { label: 'Antagonista', icon: '☠', className: 'type-antagonist' },
  secundario: { label: 'Secundário', icon: '♙', className: 'type-secondary' },
}

const guideTabs = {
  Objetivo: <p>Criar personagens tridimensionais com motivações, arcos e conflitos profundos.</p>,
  Dicas: <ul><li>Todo personagem precisa de um desejo consciente e uma necessidade inconsciente.</li><li>O ponto-cego é o que o personagem não vê sobre si mesmo — e o público vê.</li><li>O antagonista deve acreditar que é o herói da própria história.</li></ul>,
  Exemplos: <ul><li>Desejo tangível: “Derrotar o Império.” Necessidade: “Acreditar em si mesmo.”</li><li>Arco: “De egoísta a altruísta, de medroso a corajoso.”</li></ul>,
  Perguntas: <ul><li>O que o personagem quer vs. o que ele precisa?</li><li>Qual trauma do passado define seu presente?</li><li>Como ele muda do início ao fim da história?</li></ul>,
}

const sections = [
  ['Informações Básicas', [['nome', 'Nome', 'input', 'Digite...'], ['idade', 'Idade', 'input', 'Digite...'], ['descricao', 'Descrição', 'textarea', 'Descreva...'], ['imageUrl', 'URL da imagem', 'input', 'Digite uma URL de imagem...']]],
  ['História', [['historia', 'História do personagem', 'textarea', 'Descreva...'], ['passado', 'Passado', 'textarea', 'Descreva...'], ['trauma', 'Trauma', 'textarea', 'Descreva...'], ['segredo', 'Segredo', 'textarea', 'Descreva...']]],
  ['Personalidade', [['personalidade', 'Personalidade', 'textarea', 'Descreva...'], ['arquetipo', 'Arquétipo', 'input', 'Digite...'], ['virtudes', 'Virtudes', 'textarea', 'Descreva...'], ['falhas', 'Falhas', 'textarea', 'Descreva...'], ['medos', 'Medos', 'textarea', 'Descreva...'], ['valores', 'Valores', 'textarea', 'Descreva...']]],
  ['Motivação e Desejos', [['motivacao', 'Motivação', 'textarea', 'Descreva...'], ['desejoTangivel', 'Desejo tangível', 'textarea', 'Descreva...'], ['desejoAbstrato', 'Desejo abstrato', 'textarea', 'Descreva...'], ['necessidade', 'Necessidade', 'textarea', 'Descreva...'], ['pontoCego', 'Ponto-cego', 'textarea', 'Descreva...'], ['objetivos', 'Objetivos', 'textarea', 'Descreva...']]],
  ['Psicologia e Riscos', [['idEgoSuperego', 'Id / Ego / Superego', 'textarea', 'Descreva...'], ['empatia', 'Empatia', 'textarea', 'Descreva...'], ['riscoEmocional', 'Risco emocional', 'textarea', 'Descreva...'], ['riscoMoral', 'Risco moral', 'textarea', 'Descreva...'], ['riscoFisico', 'Risco físico', 'textarea', 'Descreva...']]],
  ['Arco e Mudança', [['arco', 'Arco do personagem', 'textarea', 'Descreva...'], ['mudanca', 'Mudança', 'textarea', 'Descreva...'], ['conflitos', 'Conflitos', 'textarea', 'Descreva...']]],
  ['Relações e Itens', [['relacionamentos', 'Relacionamentos', 'textarea', 'Descreva...'], ['itens', 'Itens', 'textarea', 'Descreva...'], ['frasesMarcantes', 'Frases marcantes', 'textarea', 'Descreva...'], ['curiosidades', 'Curiosidades', 'textarea', 'Descreva...']]],
]

function emptyDetails() {
  return Object.fromEntries(sections.flatMap(([, fields]) => fields.map(([key]) => [key, ''])))
}

function CharacterGuide() {
  const [activeTab, setActiveTab] = useState('Objetivo')
  const [isOpen, setIsOpen] = useState(true)
  return <section className="module-guide character-guide">
    <button className="guide-toggle" type="button" aria-expanded={isOpen} onClick={() => setIsOpen((value) => !value)}><span><b aria-hidden="true">!</b> Guia do Módulo</span><span aria-hidden="true">{isOpen ? '⌃' : '⌄'}</span></button>
    {isOpen && <div className="guide-content"><nav className="guide-tabs" aria-label="Guia do módulo">{Object.keys(guideTabs).map((tab) => <button className={activeTab === tab ? 'guide-tab active' : 'guide-tab'} type="button" key={tab} onClick={() => setActiveTab(tab)}><span aria-hidden="true">{tab === 'Objetivo' ? '◎' : tab === 'Dicas' ? '♧' : tab === 'Exemplos' ? '▣' : '?'}</span>{tab}</button>)}</nav><div className="guide-description">{guideTabs[activeTab]}</div></div>}
  </section>
}

function CharacterDetail({ character, onBack, onUpdate, onDelete }) {
  const type = characterTypes[character.type]
  const filledFields = Object.values(character.details).filter(Boolean).length
  const totalFields = Object.keys(character.details).length
  function updateField(key, value) { onUpdate({ ...character, details: { ...character.details, [key]: value }, name: key === 'nome' ? value : character.name }) }
  return <main className="characters-page character-detail-page">
    <button className="back-link" type="button" onClick={onBack}>← Voltar para Personagens</button>
    <header className="character-profile-header">
      <div className={`character-avatar large ${type.className}`}>{character.details.imageUrl ? <img src={character.details.imageUrl} alt="" /> : type.icon}</div>
      <div className="character-profile-info"><div><h1>{character.name || 'Novo personagem'}</h1><span className={`character-type ${type.className}`}>{type.label}</span></div><p>{filledFields}/{totalFields} campos preenchidos</p><div className="character-detail-progress"><div style={{ width: `${Math.round((filledFields / totalFields) * 100)}%` }} /></div></div>
      <button className="delete-character" type="button" onClick={onDelete}>Excluir</button>
    </header>
    {sections.map(([title, fields], index) => <section className="character-section" key={title}><header><span>{index + 1}/{sections.length}</span><strong>{title}</strong><button type="button">⌃</button></header><div className="character-fields">{fields.map(([key, label, inputType, placeholder]) => <label key={key}><span>{label}</span>{inputType === 'textarea' ? <textarea placeholder={placeholder} value={character.details[key]} onChange={(event) => updateField(key, event.target.value)} /> : <input type="text" placeholder={placeholder} value={character.details[key]} onChange={(event) => updateField(key, event.target.value)} />}</label>)}</div></section>)}
  </main>
}

function Personagens() {
  const [characters, setCharacters] = useState([])
  const [filter, setFilter] = useState('todos')
  const [isCreating, setIsCreating] = useState(false)
  const [newCharacter, setNewCharacter] = useState({ name: '', type: 'protagonista' })
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const counts = Object.fromEntries(Object.keys(characterTypes).map((type) => [type, characters.filter((character) => character.type === type).length]))
  const visibleCharacters = filter === 'todos' ? characters : characters.filter((character) => character.type === filter)

  function createCharacter() {
    if (!newCharacter.name.trim()) return
    const character = { id: crypto.randomUUID(), name: newCharacter.name.trim(), type: newCharacter.type, details: { ...emptyDetails(), nome: newCharacter.name.trim() } }
    setCharacters((current) => [...current, character])
    setSelectedCharacter(character)
    setIsCreating(false)
    setNewCharacter({ name: '', type: 'protagonista' })
  }
  function updateCharacter(character) { setCharacters((current) => current.map((item) => item.id === character.id ? character : item)); setSelectedCharacter(character) }
  function deleteCharacter() { setCharacters((current) => current.filter((item) => item.id !== selectedCharacter.id)); setSelectedCharacter(null) }

  if (selectedCharacter) return <CharacterDetail character={selectedCharacter} onBack={() => setSelectedCharacter(null)} onUpdate={updateCharacter} onDelete={deleteCharacter} />
  return <main className="characters-page">
    <header className="characters-header"><div><h1>Personagens</h1><p>Dossiês completos de cada personagem — protagonista, antagonista e secundários.</p></div></header>
    <CharacterGuide />
    <div className="character-toolbar"><nav className="character-filters">{[['todos', 'Todos'], ['protagonista', 'Protagonista'], ['antagonista', 'Antagonista'], ['secundario', 'Secundário']].map(([key, label]) => <button className={filter === key ? 'character-filter active' : 'character-filter'} type="button" key={key} onClick={() => setFilter(key)}>{label} ({key === 'todos' ? characters.length : counts[key]})</button>)}</nav><button className="new-character-button" type="button" onClick={() => setIsCreating(true)}>＋ Novo Personagem</button></div>
    {isCreating && <div className="character-create-form"><input autoFocus type="text" placeholder="Nome do personagem..." value={newCharacter.name} onChange={(event) => setNewCharacter({ ...newCharacter, name: event.target.value })} /><select value={newCharacter.type} onChange={(event) => setNewCharacter({ ...newCharacter, type: event.target.value })}>{Object.entries(characterTypes).map(([key, type]) => <option key={key} value={key}>{type.label}</option>)}</select><button type="button" onClick={createCharacter}>Criar Personagem</button></div>}
    {visibleCharacters.length === 0 ? <div className="empty-characters"><span aria-hidden="true">♙</span><p>Nenhum personagem criado ainda. Crie seu primeiro personagem para começar.</p></div> : <div className="characters-grid">{visibleCharacters.map((character) => { const type = characterTypes[character.type]; return <article className={`character-card ${type.className}`} key={character.id} onClick={() => setSelectedCharacter(character)}><div className="character-card-image">{character.details.imageUrl ? <img src={character.details.imageUrl} alt={`Retrato de ${character.name}`} /> : <span>{type.icon}</span>}</div><div className="character-card-body"><div className="character-card-heading"><h2>{character.name}</h2><small className={`character-card-type ${type.className}`}>{type.label}</small></div><button type="button" onClick={(event) => { event.stopPropagation(); setCharacters((current) => current.filter((item) => item.id !== character.id)) }}>Excluir</button></div></article> })}</div>}
  </main>
}

export default Personagens