// src/App.jsx
import React, { useState, useEffect } from 'react';
import { ToastProvider } from './hooks/useToast';
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

const MOCK_USER = {
  id: 'dev-user-123',
  name: 'Desenvolvedor',
  writerName: 'Autor Teste',
  email: 'dev@storyforge.com',
};

const MOCK_PROJECT = {
  id: 'projeto-teste-123',
  title: 'Projeto de Teste',
  format: 'Romance / Livro'
};

const NAVIGATION_ITEMS = [
  { title: 'VISÃO GERAL', items: [['Dashboard', 'dashboard', LayoutDashboard]] },
  { 
    title: 'FUNDAÇÃO', 
    items: [
      ['Identidade', 'identidade', Fingerprint], 
      ['Essência da História', 'essencia', Sparkles], 
      ['Engenharia Narrativa', 'engenharia', Cpu]
    ] 
  },
  { 
    title: 'ESTRUTURA', 
    items: [
      ['Estrutura Dramática', 'estrutura', GitBranch], 
      ['Ritmo & Timeline', 'ritmo', Activity]
    ] 
  },
  { 
    title: 'CONTEÚDO', 
    items: [
      ['Personagens', 'personagens', Users], 
      ['Mundo', 'mundo', Globe], 
      ['Cenas', 'cenas', Clapperboard], 
      ['Diálogos', 'dialogos', MessageSquare], 
      ['Relações', 'relacoes', Network]
    ] 
  },
  { 
    title: 'CAMADAS', 
    items: [
      ['Mistérios', 'misterios', Search], 
      ['Plot Twists', 'plot-twists', Zap], 
      ['Mapa Emocional', 'mapa-emocional', HeartHandshake]
    ] 
  },
  { 
    title: 'ESCRITA', 
    items: [
      ['Escrita', 'escrita', PenTool], 
      ['Storyboard', 'storyboard', LayoutGrid]
    ] 
  },
  { 
    title: 'VERIFICAÇÃO', 
    items: [
      ['Checklist', 'checklist', CheckSquare], 
      ['Story Bible', 'story-bible', BookOpen]
    ] 
  },
];

function Sidebar({ activePage, onNavigate, onBackToProjects, currentProject }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      style={{
        position: 'relative',
        width: isCollapsed ? '84px' : '280px',
        minWidth: isCollapsed ? '84px' : '280px',
        height: 'calc(100vh - 24px)',
        margin: '12px 0 12px 12px',
        borderRadius: '28px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(30, 22, 58, 0.45) 40%, rgba(12, 10, 26, 0.75) 100%)',
        backdropFilter: 'blur(35px) saturate(200%)',
        WebkitBackdropFilter: 'blur(35px) saturate(200%)',
        border: '1.5px solid rgba(255, 255, 255, 0.35)',
        boxShadow: `
          inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.65), 
          inset 0 -1.5px 1px 0 rgba(255, 255, 255, 0.2), 
          inset 1.5px 0 1px 0 rgba(255, 255, 255, 0.45),
          0 25px 60px rgba(0, 0, 0, 0.65), 
          0 0 35px rgba(168, 85, 247, 0.2)
        `,
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 40,
        padding: isCollapsed ? '16px 8px' : '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      <div 
        style={{
          position: 'absolute',
          right: '3px',
          top: '22%',
          height: '45%',
          width: '3.5px',
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.9), transparent)',
          borderRadius: '9999px',
          filter: 'blur(0.5px)',
          pointerEvents: 'none'
        }}
      />

      <div className="flex items-center justify-between px-2 pt-1">
        {!isCollapsed && (
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.4)]">
              Story<span className="text-amber-400">Forge</span>
            </span>
          </div>
        )}
        <button 
          type="button" 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 flex items-center justify-center text-white transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] cursor-pointer"
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          <Menu size={18} />
        </button>
      </div>

      <button 
        type="button" 
        onClick={onBackToProjects} 
        className={`flex items-center gap-2.5 px-2 py-1 text-purple-200/90 hover:text-white transition-colors cursor-pointer ${isCollapsed ? 'justify-center w-full px-0' : ''}`}
        title="Meus Projetos"
      >
        <FolderKanban size={18} className="text-purple-300 shrink-0" />
        {!isCollapsed && (
          <span className="text-sm font-medium">Meus Projetos</span>
        )}
      </button>

      {!isCollapsed && (
        <div className="px-2 py-1">
          <h2 className="text-xl font-bold text-white leading-tight drop-shadow-sm">
            {currentProject?.title || 'Projeto'}
          </h2>
          <span className="text-xs text-purple-200/70 font-medium block mt-0.5">
            {currentProject?.format || 'Romance / Livro'}
          </span>
        </div>
      )}

      <nav className="flex-1 space-y-4 overflow-y-auto pr-1">
        {NAVIGATION_ITEMS.map((section) => (
          <div key={section.title} className="space-y-1.5 pt-2 border-t border-white/10 first:border-0 first:pt-0">
            {!isCollapsed && (
              <p className="text-[10px] font-bold tracking-wider text-purple-200/60 uppercase px-2 mb-1">
                {section.title}
              </p>
            )}
            {section.items.map(([label, id, Icon]) => {
              const isActive = activePage === id;
              return (
                <button 
                  key={id}
                  type="button" 
                  onClick={() => onNavigate(id)}
                  title={isCollapsed ? label : ''}
                  className={`w-full flex items-center gap-3 p-2 rounded-2xl transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-500/40 to-indigo-500/35 border border-purple-300/60 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_4px_18px_rgba(168,85,247,0.3)] font-semibold' 
                      : 'hover:bg-white/10 border border-transparent text-gray-300 hover:text-white'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    isActive
                      ? 'bg-purple-500/50 border-purple-300/70 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]'
                      : 'bg-white/10 border-white/20 text-purple-200/80'
                  }`}>
                    <Icon size={16} />
                  </div>
                  {!isCollapsed && (
                    <span className="text-xs truncate">{label}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(MOCK_USER); 
  const [currentProject, setCurrentProject] = useState(MOCK_PROJECT);
  const [activePage, setActivePage] = useState('escrita');

  const [authScreen, setAuthScreen] = useState('login');
  
  const [confirmToken, setConfirmToken] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  const [deleteToken, setDeleteToken] = useState(null);

  const [loadingSession, setLoadingSession] = useState(true);

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

  return (
    <ToastProvider>
      {(() => {
        if (confirmToken) {
          return (
            <ConfirmEmail 
              token={confirmToken} 
              onNavigateToLogin={clearUrlTokens} 
            />
          );
        }

        if (resetToken) {
          return (
            <ResetPassword 
              token={resetToken} 
              onNavigateToLogin={clearUrlTokens} 
            />
          );
        }

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
          <div className="app-shell flex h-screen w-screen overflow-hidden bg-[#0a0814]">
            <Sidebar 
              activePage={activePage} 
              onNavigate={setActivePage} 
              onBackToProjects={handleBackToProjects}
              currentProject={currentProject}
            />
            <div className="page-content flex-1 overflow-y-auto">{renderPage()}</div>
          </div>
        );
      })()}
    </ToastProvider>
  );
}