import { useState } from 'react'

const elementTypes = [
	'Planeta', 'Mapa', 'País', 'Cidade', 'Bioma', 'Clima', 'Política', 'Economia',
	'Religião', 'Tecnologia', 'Fauna', 'Flora', 'Idioma', 'História', 'Cronologia',
	'Mitologia', 'Facção', 'Sistema de Magia', 'Sistema de Poderes', 'Sistema de Ciência', 'Sistema de Combate',
]

const guideTabs = {
	Objetivo: <p>Construir um mundo coerente, imersivo e funcional que sustenta a narrativa.</p>,
	Dicas: <ul><li>O mundo deve refletir o tema — cada elemento tem propósito narrativo.</li><li>Sistemas (magia, economia, combate) precisam de regras claras e consistentes.</li><li>A história do mundo afeta o presente da narrativa.</li></ul>,
	Exemplos: <ul><li>Sistema de Magia: “A magia custa energia vital — quanto maior o feitiço, mais curta a vida.”</li><li>Facção: “A Ordem dos Guardiões protege os segredos antigos a qualquer custo.”</li></ul>,
	Perguntas: <ul><li>Como o mundo reflete o tema da história?</li><li>Quais regras governam os sistemas do mundo?</li><li>Que conflitos existem entre as facções?</li></ul>,
}

function WorldGuide() {
	const [activeTab, setActiveTab] = useState('Objetivo')
	const [isOpen, setIsOpen] = useState(true)
	return <section className="module-guide character-guide">
		<button className="guide-toggle" type="button" aria-expanded={isOpen} onClick={() => setIsOpen((value) => !value)}><span><b aria-hidden="true">!</b> Guia do Módulo</span><span aria-hidden="true">{isOpen ? '⌃' : '⌄'}</span></button>
		{isOpen && <div className="guide-content"><nav className="guide-tabs" aria-label="Guia do módulo">{Object.keys(guideTabs).map((tab) => <button className={activeTab === tab ? 'guide-tab active' : 'guide-tab'} type="button" key={tab} onClick={() => setActiveTab(tab)}><span aria-hidden="true">{tab === 'Objetivo' ? '◎' : tab === 'Dicas' ? '♧' : tab === 'Exemplos' ? '▣' : '?'}</span>{tab}</button>)}</nav><div className="guide-description">{guideTabs[activeTab]}</div></div>}
	</section>
}

function Mundo() {
	const [elements, setElements] = useState([])
	const [filter, setFilter] = useState('Todos')
	const [isCreating, setIsCreating] = useState(false)
	const [editingId, setEditingId] = useState(null)
	const [draft, setDraft] = useState({ name: '', type: 'País', description: '' })
	const counts = Object.fromEntries(elementTypes.map((type) => [type, elements.filter((element) => element.type === type).length]))
	const visibleElements = filter === 'Todos' ? elements : elements.filter((element) => element.type === filter)

	function openCreate() {
		setDraft({ name: '', type: 'País', description: '' })
		setEditingId(null)
		setIsCreating(true)
	}
	function openEdit(element) {
		setDraft({ name: element.name, type: element.type, description: element.description })
		setEditingId(element.id)
		setIsCreating(true)
	}
	function saveElement() {
		if (!draft.name.trim()) return
		if (editingId) setElements((current) => current.map((element) => element.id === editingId ? { ...element, ...draft, name: draft.name.trim() } : element))
		else setElements((current) => [...current, { id: crypto.randomUUID(), ...draft, name: draft.name.trim() }])
		setIsCreating(false)
		setEditingId(null)
	}

	return <main className="characters-page world-page">
		<header className="characters-header"><div><h1>Mundo</h1><p>A construção completa do universo onde a história acontece.</p></div></header>
		<WorldGuide />
		<div className="world-toolbar"><nav className="world-filters"><button className={filter === 'Todos' ? 'character-filter active' : 'character-filter'} type="button" onClick={() => setFilter('Todos')}>Todos ({elements.length})</button>{elementTypes.map((type) => <button className={filter === type ? 'character-filter active' : 'character-filter'} type="button" key={type} onClick={() => setFilter(type)}>{type}{counts[type] ? ` (${counts[type]})` : ''}</button>)}</nav><button className="new-character-button" type="button" onClick={openCreate}>＋ Novo</button></div>
		{isCreating && <div className="world-create-form"><input autoFocus type="text" placeholder="Nome do elemento..." value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /><select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })}>{elementTypes.map((type) => <option key={type}>{type}</option>)}</select><textarea placeholder="Descrição..." value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /><div><button type="button" onClick={saveElement}>{editingId ? 'Salvar' : 'Criar'}</button><button type="button" onClick={() => setIsCreating(false)}>Cancelar</button></div></div>}
		{visibleElements.length === 0 ? <div className="empty-characters world-empty"><span aria-hidden="true">◎</span><p>Nenhum elemento criado ainda.</p></div> : <div className="world-elements">{visibleElements.map((element) => <article className="world-card" key={element.id}><div><h2>{element.name}</h2><small>{element.type}</small><p>{element.description || 'Sem descrição.'}</p></div><div className="world-card-actions"><button type="button" onClick={() => openEdit(element)}>Editar</button><button type="button" onClick={() => setElements((current) => current.filter((item) => item.id !== element.id))}>Excluir</button></div></article>)}</div>}
	</main>
}

export default Mundo
