import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import ConfirmEmail from './pages/ConfirmEmail';
import Home from './pages/Home';
import apiClient from './api/apiClient';
import Engenharia from './pages/Engenharia';
import Escrita from './pages/Escrita';
import Essencia from './pages/Essencia';
import Identidade from './pages/Identidade';
import EstruturaDramatica from './pages/EstruturaDramatica';
import RitmoTimeline from './pages/RitmoTimeline';
import Personagens from './pages/Personagens';
import Mundo from './pages/Mundo';
import Cenas from './pages/Cenas';
import Misterios from './pages/Misterios';
import PlotTwists from './pages/PlotTwists';
import Dashboard from './pages/Dashboard';
import Checklist from './pages/Checklist';
import StoryBible from './pages/StoryBible';
import Storyboard from './pages/Storyboard';
import Relacoes from './pages/Relacoes';
import MapaEmocional from './pages/MapaEmocional';
import DialogEngine from './pages/DialogEngine';

import { 
  LayoutDashboard, Fingerprint, Sparkles, Cpu, GitBranch, 
  Activity, Users, Globe, Clapperboard, MessageSquare, 
  Network, Search, Zap, HeartHandshake, PenTool, LayoutGrid, 
  CheckSquare, BookOpen, Menu, FolderKanban 
} from 'lucide-react';

const navigation = [
  { title: 'Visão geral', items: [['Dashboard', 'dashboard', LayoutDashboard]] },
  { 
    title: 'Fundação', 
    items: [
      ['Identidade', 'identidade', Fingerprint], 
      ['Essência da História', 'essencia', Sparkles], 
      ['Engenharia Narrativa', 'engenharia', Cpu]
    ] 
  },
  { 
    title: 'Estrutura', 
    items: [
      ['Estrutura Dramática', 'estrutura', GitBranch], 
      ['Ritmo & Timeline', 'ritmo', Activity]
    ] 
  },
  { 
    title: 'Conteúdo', 
    items: [
      ['Personagens', 'personagens', Users], 
      ['Mundo', 'mundo', Globe], 
      ['Cenas', 'cenas', Clapperboard], 
      ['Diálogos', 'dialogos', MessageSquare], 
      ['Relações', 'relacoes', Network]
    ] 
  },
  { 
    title: 'Camadas', 
    items: [
      ['Mistérios', 'misterios', Search], 
      ['Plot Twists', 'plot-twists', Zap], 
      ['Mapa Emocional', 'mapa-emocional', HeartHandshake]
    ] 
  },
  { 
    title: 'Escrita', 
    items: [
      ['Escrita & Manuscrito', 'escrita', PenTool], 
      ['Storyboard', 'storyboard', LayoutGrid]
    ] 
  },
  { 
    title: 'Verificação', 
    items: [
      ['Checklist', 'checklist', CheckSquare], 
      ['Story Bible', 'story-bible', BookOpen]
    ] 
  },
];

function Sidebar({ activePage, onNavigate, onBackToProjects, currentProject }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* CABEÇALHO COM LOGO E BOTÃO DE MENU */}
      <div className="brand">
        <div className="brand-left">
          <span className="brand-mark">✦</span>
          {!isCollapsed && <strong>StoryForge</strong>}
        </div>
        <button 
          type="button" 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="toggle-sidebar-btn"
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          <Menu size={18} />
        </button>
      </div>
      
      {/* BOTÃO MEUS PROJETOS COM O ÍCONE AO LADO DO TEXTO */}
      <button 
        className="projects-link flex items-center gap-2" 
        type="button" 
        onClick={onBackToProjects} 
        title="Meus Projetos"
      >
        <FolderKanban size={20} className="text-purple-400 shrink-0" />
        {!isCollapsed && <span>Meus Projetos</span>}
      </button>

      {/* RESUMO DO PROJETO */}
      <div className="project-summary">
        <div className="project-icon">✧</div>
        {!isCollapsed && (
          <div>
            <strong>{currentProject?.title || 'Projeto'}</strong>
            <span>{currentProject?.format || 'Romance / Livro'}</span>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="project-status">
          <span>{currentProject?.status || 'Desenvolvimento'}</span>
          <small>{currentProject?.progress || 0}% completo</small>
        </div>
      )}

      {/* NAVEGAÇÃO DOS MÓDULOS */}
      <nav className="sidebar-nav" aria-label="Navegação do projeto">
        {navigation.map((section) => (
          <div className="nav-section" key={section.title}>
            {!isCollapsed && <p>{section.title}</p>}
            {section.items.map(([label, id, Icon]) => (
              <button 
                className={activePage === id ? 'nav-item active' : 'nav-item'} 
                type="button" 
                key={id} 
                onClick={() => onNavigate(id)}
                title={isCollapsed ? label : ''}
              >
                <Icon size={18} className="nav-symbol" />
                {!isCollapsed && <span>{label}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); 
  const [authScreen, setAuthScreen] = useState('login');
  const [confirmToken, setConfirmToken] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [currentProject, setCurrentProject] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    const checkSession = async () => {
      const savedToken = localStorage.getItem('storyforge_token');
      if (savedToken) {
        try {
          const res = await apiClient.get('/auth/me');
          if (res.data?.user) {
            setCurrentUser(res.data.user);
          }
        } catch {
          localStorage.removeItem('storyforge_token');
        }
      }
      setLoadingSession(false);
    };

    checkSession();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('confirmToken');
    if (token) {
      setConfirmToken(token);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleSelectProject = (project) => {
    setCurrentProject(project);
    setActivePage('dashboard');
  };

  const handleBackToProjects = () => {
    setCurrentProject(null);
  };

  if (loadingSession) {
    return <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center text-gray-400">Carregando StoryForge...</div>;
  }

  if (confirmToken) {
    return (
      <ConfirmEmail 
        token={confirmToken} 
        onNavigateToLogin={() => {
          setConfirmToken(null);
          window.history.replaceState({}, document.title, window.location.pathname);
          setAuthScreen('login');
        }} 
      />
    );
  }

  if (!currentUser) {
    if (authScreen === 'register') {
      return (
        <Register 
          onNavigateToLogin={() => setAuthScreen('login')}
        />
      );
    }

    if (authScreen === 'forgot-password') {
      return (
        <div className="min-h-screen bg-[#0d0d12] text-white flex flex-col items-center justify-center p-6 font-sans">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
            <h2 className="text-2xl font-bold">Recuperar Senha</h2>
            <p className="text-xs text-gray-400">Instruções enviadas para o seu e-mail.</p>
            <button
              type="button"
              onClick={() => setAuthScreen('login')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Voltar para o Login
            </button>
          </div>
        </div>
      );
    }

    return (
      <Login 
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setAuthScreen('register')}
        onNavigateToForgotPassword={() => setAuthScreen('forgot-password')}
      />
    );
  }

  if (!currentProject) {
    return <Home onSelectProject={handleSelectProject} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard 
            projectId={currentProject.id} 
            onNavigate={setActivePage}
            currentProject={currentProject}
          />
        );
      case 'identidade':
        return <Identidade projectId={currentProject.id} />;
      case 'essencia':
        return <Essencia projectId={currentProject.id} />;
      case 'engenharia':
        return <Engenharia projectId={currentProject.id} />;
      case 'estrutura':
        return <EstruturaDramatica projectId={currentProject.id} />;
      case 'ritmo':
        return <RitmoTimeline projectId={currentProject.id} />;
      case 'personagens':
        return <Personagens projectId={currentProject.id} />;
      case 'mundo':
        return <Mundo projectId={currentProject.id} />;
      case 'cenas':
        return <Cenas projectId={currentProject.id} />;
      case 'dialogos':
        return <DialogEngine projectId={currentProject.id} />;
      case 'relacoes':
        return <Relacoes projectId={currentProject.id} />;
      case 'misterios':
        return <Misterios projectId={currentProject.id} />;
      case 'plot-twists':
        return <PlotTwists projectId={currentProject.id} />;
      case 'mapa-emocional': 
        return <MapaEmocional projectId={currentProject.id} />;
      case 'storyboard':
        return <Storyboard projectId={currentProject.id} />;
      case 'checklist':
        return <Checklist projectId={currentProject.id} />;
      case 'story-bible':
        return <StoryBible projectId={currentProject.id} />;
      case 'escrita':
        return <Escrita projectId={currentProject.id} onNavigate={setActivePage} />;
      default:
        return <div className="coming-soon">Esta página será adicionada em breve.</div>;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar 
        activePage={activePage} 
        onNavigate={setActivePage} 
        onBackToProjects={handleBackToProjects}
        currentProject={currentProject}
      />
      <div className="page-content">{renderPage()}</div>
    </div>
  );
}