import { useState } from 'react'
import Home from './pages/Home'
import Engenharia from './pages/Engenharia'
import Escrita from './pages/Escrita';
import Essencia from './pages/Essencia'
import Identidade from './pages/Identidade'
import EstruturaDramatica from './pages/EstruturaDramatica'
import RitmoTimeline from './pages/RitmoTimeline'
import Personagens from './pages/Personagens'
import Mundo from './pages/Mundo'
import Cenas from './pages/Cenas'
import Misterios from './pages/Misterios'
import PlotTwists from './pages/PlotTwists'
import Dashboard from './pages/Dashboard'
import Checklist from './pages/Checklist';
import StoryBible from './pages/StoryBible';

const navigation = [
  { title: 'Visão geral', items: [['Dashboard', 'dashboard']] },
  { title: 'Fundação', items: [['Identidade', 'identidade'], ['Essência da História', 'essencia'], ['Engenharia Narrativa', 'engenharia']] },
  { title: 'Estrutura', items: [['Estrutura Dramática', 'estrutura'], ['Ritmo & Timeline', 'ritmo']] },
  { title: 'Conteúdo', items: [['Personagens', 'personagens'], ['Mundo', 'mundo'], ['Cenas', 'cenas'], ['Relações', 'relacoes']] },
  { title: 'Camadas', items: [['Mistérios', 'misterios'], ['Plot Twists', 'plot-twists'], ['Mapa Emocional', 'mapa-emocional']] },
  { title: 'Escrita', items: [['Escrita & Manuscrito', 'escrita'], ['Storyboard', 'storyboard']] },
  { title: 'Verificação', items: [['Checklist', 'checklist'], ['Story Bible', 'story-bible']] },
]

function Sidebar({ activePage, onNavigate, onBackToProjects, currentProject }) {
  return (
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">✦</span><strong>StoryForge</strong></div>
      
      <button className="projects-link" type="button" onClick={onBackToProjects}>
        ← <span>Meus Projetos</span>
      </button>
      
      <div className="project-summary">
        <div className="project-icon">✧</div>
        <div>
          <strong>{currentProject?.title || 'Projeto'}</strong>
          <span>{currentProject?.format || 'Romance / Livro'}</span>
        </div>
      </div>
      <div className="project-status">
        <span>{currentProject?.status || 'Desenvolvimento'}</span>
        <small>{currentProject?.progress || 0}% completo</small>
      </div>
      
      <nav className="sidebar-nav" aria-label="Navegação do projeto">
        {navigation.map((section) => (
          <div className="nav-section" key={section.title}>
            <p>{section.title}</p>
            {section.items.map(([label, id]) => (
              <button 
                className={activePage === id ? 'nav-item active' : 'nav-item'} 
                type="button" 
                key={id} 
                onClick={() => onNavigate(id)}
              >
                <span className="nav-symbol" aria-hidden="true">{activePage === id ? '✧' : '◇'}</span>
                {label}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}

function App() {
  const [currentProject, setCurrentProject] = useState(null)
  const [activePage, setActivePage] = useState('dashboard')

  const handleSelectProject = (project) => {
    setCurrentProject(project)
    setActivePage('dashboard')
  }

  const handleBackToProjects = () => {
    setCurrentProject(null)
  }

  // Se nenhum projeto foi selecionado, mostra a tela "Meus Projetos"
  if (!currentProject) {
    return <Home onSelectProject={handleSelectProject} />
  }

  // Quando um projeto é selecionado, mostra a dashboard e o menu do projeto
  const page = 
    activePage === 'identidade' ? <Identidade projectId={currentProject.id} /> :
    activePage === 'essencia' ? <Essencia projectId={currentProject.id} /> :
    activePage === 'engenharia' ? <Engenharia projectId={currentProject.id} /> :
    activePage === 'estrutura' ? <EstruturaDramatica projectId={currentProject.id} /> :
    activePage === 'ritmo' ? <RitmoTimeline projectId={currentProject.id} /> :
    activePage === 'personagens' ? <Personagens projectId={currentProject.id} /> :
    activePage === 'mundo' ? <Mundo projectId={currentProject.id} /> :
    activePage === 'cenas' ? <Cenas projectId={currentProject.id} /> :
    activePage === 'misterios' ? <Misterios projectId={currentProject.id} /> : 
    activePage === 'plot-twists' ? <PlotTwists projectId={currentProject.id} /> : 
    activePage === 'checklist' ? <Checklist projectId={currentProject.id} /> : 
    activePage === 'story-bible' ? <StoryBible projectId={currentProject.id} /> :
    activePage === 'dashboard' ? <Dashboard /> : 
    activePage === 'escrita' ? (
      <Escrita projectId={currentProject.id} onNavigate={setActivePage} />
    ) :
    <div className="coming-soon">Esta página será adicionada em breve.</div>;

  return (
    <div className="app-shell">
      <Sidebar 
        activePage={activePage} 
        onNavigate={setActivePage} 
        onBackToProjects={handleBackToProjects}
        currentProject={currentProject}
      />
      <div className="page-content">{page}</div>
    </div>
  )
}

export default App