import { useState } from 'react'
import Engenharia from './pages/Engenharia'
import Essencia from './pages/Essencia'
import Identidade from './pages/Identidade'
import EstruturaDramatica from './pages/EstruturaDramatica'

const navigation = [
  { title: 'Visão geral', items: [['Dashboard', 'dashboard']] },
  { title: 'Fundação', items: [['Identidade', 'identidade'], ['Essência da História', 'essencia'], ['Engenharia Narrativa', 'engenharia']] },
  { title: 'Estrutura', items: [['Estrutura Dramática', 'estrutura'], ['Ritmo & Timeline', 'ritmo']] },
  { title: 'Conteúdo', items: [['Personagens', 'personagens'], ['Mundo', 'mundo'], ['Cenas', 'cenas'], ['Relações', 'relacoes']] },
  { title: 'Camadas', items: [['Mistérios', 'misterios'], ['Plot Twists', 'plot-twists'], ['Mapa Emocional', 'mapa-emocional']] },
  { title: 'Escrita', items: [['Escrita & Manuscrito', 'escrita'], ['Storyboard', 'storyboard']] },
  { title: 'Verificação', items: [['Checklist', 'checklist'], ['Story Bible', 'story-bible']] },
]

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">✦</span><strong>StoryForge</strong></div>
      <button className="projects-link" type="button">← <span>Meus Projetos</span></button>
      <div className="project-summary">
        <div className="project-icon">✧</div>
        <div><strong>Quokka</strong><span>Jogo Narrativo / RPG</span></div>
      </div>
      <div className="project-status"><span>Desenvolvimento</span><small>0% completo</small></div>
      <nav className="sidebar-nav" aria-label="Navegação do projeto">
        {navigation.map((section) => (
          <div className="nav-section" key={section.title}>
            <p>{section.title}</p>
            {section.items.map(([label, id]) => (
              <button className={activePage === id ? 'nav-item active' : 'nav-item'} type="button" key={id} onClick={() => onNavigate(id)}>
                <span className="nav-symbol" aria-hidden="true">{activePage === id ? '✧' : '◇'}</span>{label}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}

function App() {
  const [activePage, setActivePage] = useState('essencia')
  const page = activePage === 'identidade' ? <Identidade /> : activePage === 'essencia' ? <Essencia /> : activePage === 'engenharia' ? <Engenharia /> : activePage === 'estrutura' ? <EstruturaDramatica /> : <div className="coming-soon">Esta página será adicionada em breve.</div>

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="page-content">{page}</div>
    </div>
  )
}

export default App