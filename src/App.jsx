// src/App.jsx
// Componente principal da aplicação StoryForge com Roteamento de Segurança por E-mail
import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import ConfirmEmail from './pages/ConfirmEmail';
import ResetPassword from './pages/ResetPassword';
import ConfirmDelete from './pages/ConfirmDelete';
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
import ForgotPassword from './pages/ForgotPassword';

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
      <div className="brand">
        <div className="brand-left">
          {!isCollapsed && <strong>StoryForge</strong>}
        </div>
        <button 
          type="button" 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="toggle-sidebar-btn"
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          <Menu size={20} />
        </button>
      </div>
      
      <button 
        className={`projects-link flex items-center gap-2 ${isCollapsed ? 'justify-center w-full mx-0 px-0' : ''}`}
        type="button" 
        onClick={onBackToProjects} 
        title="Meus Projetos"
      >
        <FolderKanban size={20} className="text-purple-400 shrink-0" />
        {!isCollapsed && <span>Meus Projetos</span>}
      </button>

      <div className="project-summary">
        {!isCollapsed && (
          <div>
            <strong style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', display: 'block', marginBottom: '2px' }}>
              {currentProject?.title || 'Projeto'}
            </strong>
            <span className="text-xs text-gray-400">
              {currentProject?.format || 'Romance / Livro'}
            </span>
          </div>
        )}
      </div>

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
  
  // Captura de Tokens de E-mail via URL Query Params
  const [confirmToken, setConfirmToken] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  const [deleteToken, setDeleteToken] = useState(null);

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
    const cToken = params.get('confirmToken');
    const rToken = params.get('resetToken');
    const dToken = params.get('deleteToken');

    if (cToken) setConfirmToken(cToken);
    if (rToken) setResetToken(rToken);
    if (dToken) setDeleteToken(dToken);
  }, []);

  const clearUrlTokens = () => {
    setConfirmToken(null);
    setResetToken(null);
    setDeleteToken(null);
    window.history.replaceState({}, document.title, window.location.pathname);
    setAuthScreen('login');
  };

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

  // ROTA DE ATIVAÇÃO DE E-MAIL
  if (confirmToken) {
    return (
      <ConfirmEmail 
        token={confirmToken} 
        onNavigateToLogin={clearUrlTokens} 
      />
    );
  }

  // ROTA DE REDEFINIÇÃO DE SENHA
  if (resetToken) {
    return (
      <ResetPassword 
        token={resetToken} 
        onNavigateToLogin={clearUrlTokens} 
      />
    );
  }

  // ROTA DE CONFIRMAÇÃO DE EXCLUSÃO DE CONTA
  if (deleteToken) {
    return (
      <ConfirmDelete 
        token={deleteToken} 
        onNavigateToLogin={() => {
          setCurrentUser(null);
          clearUrlTokens();
        }} 
      />
    );
  }

  // FLUXO DE AUTENTICAÇÃO (DESLOGADO)
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
        <ForgotPassword 
          onNavigateToLogin={() => setAuthScreen('login')}
        />
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

  // USUÁRIO LOGADO - SELEÇÃO DE PROJETO
  if (!currentProject) {
    return (
      <Home 
        onSelectProject={handleSelectProject} 
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />
    );
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
        return <Identidade projectId={currentProject.id} currentUser={currentUser} />;
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
        return (
          <StoryBible 
            projectId={currentProject.id} 
            project={currentProject} 
            currentUser={currentUser} 
          />
        );
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