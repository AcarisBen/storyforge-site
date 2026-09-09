//Home.jsx

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Plus, Settings, BookOpen, Upload, RefreshCw, 
  AlertTriangle, CheckCircle, XCircle, Trash2, Heart, 
  Coffee, Copy, Check, X, Sparkles, User, Shield, Key, Info, Cookie, LogOut
} from 'lucide-react';
import apiClient from '../api/apiClient';

export default function Home({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', format: 'Romance / Livro' });
  const [loading, setLoading] = useState(true);

  // Estados dos Modais
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('perfil');

  // Estados das Configurações
  const [displayName, setDisplayName] = useState('Usuário StoryForge');
  const [email, setEmail] = useState('autor@storyforge.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmailSent, setDeleteEmailSent] = useState(false);

  // Apoio
  const [copiedPix, setCopiedPix] = useState(false);
  const PIX_KEY = 'suporte@storyforge.com.br';

  // Importação
  const fileInputRef = useRef(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [importDetails, setImportDetails] = useState([]);
  const [pendingFile, setPendingFile] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/entities/projects');
      const data = res.data || [];
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar projetos:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;

    try {
      const res = await apiClient.post('/entities/projects', {
        title: newProject.title,
        format: newProject.format,
        status: 'Desenvolvimento',
        progress: 0,
      });

      const created = res.data;
      setProjects((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setNewProject({ title: '', format: 'Romance / Livro' });

      if (onSelectProject) onSelectProject(created);
    } catch (err) {
      console.error('Erro ao criar projeto:', err);
      alert('Não foi possível conectar ao servidor para criar o projeto.');
    }
  };

// Função para encerrar a sessão
const handleLogout = () => {
  localStorage.removeItem('storyforge_token'); // Limpa o token salvo
  window.location.reload(); // Recarrega a aplicação voltando para a tela de Login
};

  const handleDeleteProject = async (e, projectId, projectTitle) => {
    e.stopPropagation();

    if (!window.confirm(`Tem certeza que deseja excluir o projeto "${projectTitle}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await apiClient.delete(`/entities/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error('Erro ao excluir projeto:', err);
      alert('Não foi possível excluir o projeto. Tente novamente.');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFile(file);
    processImport(file);
  };

  const processImport = async (file) => {
    setIsImporting(true);
    setImportProgress(10);
    setImportStatus(null);
    setImportDetails([]);

    const reader = new FileReader();

    reader.onload = async (event) => {
      let currentStageProgress = 10;

      try {
        currentStageProgress = 20;
        setImportProgress(currentStageProgress);

        const importedJson = JSON.parse(event.target.result);
        if (!importedJson.projectData) {
          throw new Error('O arquivo JSON não possui a estrutura "projectData" válida.');
        }

        const meta = importedJson.exportMeta || {};
        const pData = importedJson.projectData;

        const projectPayload = {
          title: `${pData.identity?.['Título'] || pData.title || 'Projeto Importado'} (Importado)`,
          format: pData.format || 'Romance / Livro',
          status: 'Importado',
          progress: pData.progress || 0,
          isImported: true,
          exportedBy: meta.exportedBy || 'Autor Desconhecido',
          exportedAt: meta.exportedAt ? new Date(meta.exportedAt).toLocaleDateString('pt-BR') : 'Data desconhecida',
        };

        const resProj = await apiClient.post('/entities/projects', projectPayload);
        const newProjId = resProj.data?.id;

        if (!newProjId) {
          throw new Error('Servidor não retornou um ID válido para o projeto.');
        }

        const characterIdMap = {};
        const sceneIdMap = {};

        if (Array.isArray(pData.characters)) {
          for (const char of pData.characters) {
            const oldId = char.id;
            const charPayload = { ...char, projectId: newProjId };
            delete charPayload.id;

            try {
              const res = await apiClient.post(`/entities/projects/${newProjId}/characters`, charPayload);
              if (oldId && res.data?.id) {
                characterIdMap[oldId] = res.data.id;
              }
            } catch (err) {
              console.warn('Aviso: Falha ao importar um personagem:', err);
            }
          }
        }

        if (Array.isArray(pData.scenes)) {
          for (const scene of pData.scenes) {
            const oldId = scene.id;
            const scenePayload = { ...scene, projectId: newProjId };
            delete scenePayload.id;

            try {
              const res = await apiClient.post(`/entities/projects/${newProjId}/scenes`, scenePayload);
              if (oldId && res.data?.id) {
                sceneIdMap[oldId] = res.data.id;
              }
            } catch (err) {
              console.warn('Aviso: Falha ao importar uma cena:', err);
            }
          }
        }

        const rawCards = pData.structureCards || [];
        const structureValues = {
          acts: {},
          sequences: {},
          hero: {},
          storyCircle: {},
          saveTheCat: {},
          freytag: {}
        };

        rawCards.forEach((card) => {
          if (!card.framework || !card.title) return;
          const fw = card.framework.toLowerCase();
          const desc = card.descricao || card.description || '';

          if (fw.includes('3 atos')) structureValues.acts[card.title] = desc;
          else if (fw.includes('8 sequências') || fw.includes('sequencias')) structureValues.sequences[card.title] = desc;
          else if (fw.includes('jornada')) structureValues.hero[card.title] = desc;
          else if (fw.includes('story circle')) structureValues.storyCircle[card.title] = desc;
          else if (fw.includes('save the cat')) structureValues.saveTheCat[card.title] = desc;
          else if (fw.includes('freytag')) structureValues.freytag[card.title] = desc;
        });

        const allPages = [
          { name: 'Identidade', endpoint: `/entities/projects/${newProjId}/identity`, data: pData.identity, type: 'object' },
          { name: 'Essência', endpoint: `/entities/projects/${newProjId}/essencia`, data: pData.essencia, type: 'object' },
          { name: 'Engenharia', endpoint: `/entities/projects/${newProjId}/engenharia`, data: pData.engenharia, type: 'object' },
          { 
            name: 'Estrutura Dramática', 
            endpoint: `/entities/projects/${newProjId}/estrutura-dramatica`, 
            data: { selectedFrameworks: pData.structureFrameworks || [], values: structureValues }, 
            type: 'object' 
          },
          { 
            name: 'Ritmo & Timeline', 
            endpoint: `/entities/projects/${newProjId}/ritmo-timeline`, 
            data: pData.timelineEvents || {}, 
            type: 'object' 
          },
          { name: 'Mundo', endpoint: `/entities/projects/${newProjId}/world`, data: pData.world, type: 'array_items' },
          { name: 'Diálogos', endpoint: `/entities/projects/${newProjId}/dialogues`, data: pData.dialogues, type: 'array_items' },
          { 
            name: 'Relações', 
            endpoint: `/entities/relations`, 
            data: pData.relations, 
            type: 'relations_remapped' 
          },
          { name: 'Mistérios', endpoint: `/entities/projects/${newProjId}/mysteries`, data: pData.mysteries, type: 'array_items' },
          { name: 'Plot Twists', endpoint: `/entities/projects/${newProjId}/twists`, data: pData.twists, type: 'array_items' },
          { name: 'Escrita & Capítulo', endpoint: `/entities/projects/${newProjId}/chapters`, data: pData.chapters, type: 'array_items' },
          { 
            name: 'Mapa Emocional', 
            endpoint: `/entities/projects/${newProjId}/mapa-emocional`, 
            data: pData.emotionalPoints || [], 
            type: 'object' 
          },
          { name: 'Checklist de Desenvolvimento', endpoint: `/entities/projects/${newProjId}/checklist`, data: pData.checklist, type: 'object' }
        ];

        const totalPages = allPages.length;

        for (let i = 0; i < totalPages; i++) {
          const page = allPages[i];
          currentStageProgress = Math.round(50 + ((i + 1) / totalPages) * 50);

          if (page.data && (Object.keys(page.data).length > 0 || (Array.isArray(page.data) && page.data.length > 0))) {
            try {
              if (page.type === 'object') {
                await apiClient.post(page.endpoint, page.data);
              } else if (page.type === 'array_items') {
                for (const item of page.data) {
                  const itemPayload = { ...item };
                  delete itemPayload.id;
                  await apiClient.post(page.endpoint, itemPayload);
                }
              } else if (page.type === 'relations_remapped') {
                for (const rel of page.data) {
                  const mappedCharA = characterIdMap[rel.charAId] || rel.charAId;
                  const mappedCharB = characterIdMap[rel.charBId] || rel.charBId;
                  const mappedScene = sceneIdMap[rel.sceneId] || rel.sceneId || null;

                  if (mappedCharA && mappedCharB) {
                    await apiClient.post(`/entities/relations`, {
                      projectId: newProjId,
                      charAId: mappedCharA,
                      charBId: mappedCharB,
                      type: rel.type || 'Amizade',
                      intensity: rel.intensity || 6,
                      sceneId: mappedScene,
                      description: rel.description || ''
                    });
                  }
                }
              }
            } catch (pageErr) {
              console.error(`Erro ao importar ${page.name}:`, pageErr);
              const failedField = pageErr.response?.data?.error || pageErr.message || 'Erro de resposta na API';
              throw new Error(`Falha na página "${page.name}": ${failedField}`);
            }
          }

          setImportProgress(currentStageProgress);
        }

        setImportProgress(100);
        await fetchProjects();
        setImportStatus('success');
        setImportDetails(['Todas as páginas e seus campos foram sincronizados com sucesso!']);

      } catch (err) {
        console.error('Erro crítico na importação:', err);
        setImportStatus('error');
        const errorMsg = err.response?.status === 404 
          ? `Rota não encontrada no servidor (Erro 404). Ocorreu em ${currentStageProgress}% do processo.`
          : err.message || 'Erro de conexão com o servidor.';
        
        setImportDetails([`Travado em ${currentStageProgress}%: ${errorMsg}`]);
      }
    };

    reader.onerror = () => {
      setImportStatus('error');
      setImportDetails(['Falha ao ler o arquivo local.']);
    };

    reader.readAsText(file);
  };

  const handleRetryImport = () => {
    if (pendingFile) {
      processImport(pendingFile);
    }
  };

  const safeProjects = Array.isArray(projects) ? projects : [];
  const filteredProjects = safeProjects.filter((p) =>
    (p.title || p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white p-8 font-sans">
      
      {/* BARRA SUPERIOR (BOTÃO APOIE À ESQUERDA | CONFIGURAÇÕES À DIREITA) */}
      <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <button 
          type="button" 
          onClick={() => setShowSupportModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-xl font-bold text-xs text-white shadow-lg shadow-purple-950/40 transition-all cursor-pointer"
        >
          <Heart size={15} className="fill-white" /> Apoie o Projeto
        </button>

        <button 
          type="button" 
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#181820] hover:bg-[#22222e] rounded-xl border border-gray-800 text-xs font-bold text-gray-300 transition-colors cursor-pointer"
        >
          <Settings size={15} /> Configurações
        </button>
      </div>

      {/* APRESENTAÇÃO / HERO */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-950/50">
            <span className="text-2xl">🔮</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">StoryForge</h1>
        </div>
        <p className="text-gray-400 text-base leading-relaxed">
          Seu estúdio profissional de desenvolvimento narrativo. Da primeira ideia à Story Bible completa.
        </p>
      </div>

      {/* BARRA DE BUSCA E AÇÕES DE PROJETO */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold">Meus Projetos</h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#13131a] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".json" className="hidden" />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#181824] hover:bg-[#222232] border border-purple-800/50 hover:border-purple-600 text-purple-300 text-sm font-medium rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          >
            <Upload size={18} /> Importar Projeto (.json)
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <LogOut size={15} /> Sair da Conta
          </button>


          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-purple-900/30 whitespace-nowrap cursor-pointer"
          >
            <Plus size={18} /> Novo Projeto
          </button>
        </div>
      </div>

      {/* GRADE DE PROJETOS */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20 text-gray-500">Carregando seus projetos do banco de dados...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-[#13131a] border border-gray-800 rounded-2xl p-12 text-center max-w-lg mx-auto my-12">
            <BookOpen className="mx-auto text-purple-400 mb-4" size={48} />
            <h3 className="text-xl font-bold mb-2">Nenhum projeto cadastrado</h3>
            <p className="text-gray-400 text-sm mb-6">
              Você ainda não possui projetos ativos.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
            >
              <Plus size={18} /> Novo Projeto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const projTitle = project.title || project.name || 'Sem Título';
              const isImported = project.isImported || projTitle.includes('(Importado)');

              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject && onSelectProject(project)}
                  className={`bg-[#13131a] border ${
                    isImported ? 'border-amber-800/40 hover:border-amber-500/60' : 'border-gray-800 hover:border-purple-600/50'
                  } rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 group flex flex-col justify-between h-60 relative overflow-hidden`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1c1c26] text-gray-400 rounded-full text-xs font-medium">
                        <BookOpen size={12} /> {project.format || 'Romance / Livro'}
                      </span>
                      <div className="flex items-center gap-2">
                        {isImported && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-950/60 text-amber-300 border border-amber-800/40 rounded-md">
                            📥 Importado
                          </span>
                        )}

                        <button
                          type="button"
                          title="Excluir projeto"
                          onClick={(e) => handleDeleteProject(e, project.id, projTitle)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-purple-400 transition-colors mb-1">{projTitle}</h3>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 rounded-full font-medium">
                        {project.status || 'Desenvolvimento'}
                      </span>
                      <span className="text-gray-500 font-medium">{project.progress || 0}%</span>
                    </div>

                    <div className="w-full bg-[#1c1c26] h-1.5 rounded-full overflow-hidden mb-3">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${project.progress || 0}%` }} />
                    </div>

                    {isImported && (
                      <p className="text-[11px] text-amber-300/80 italic font-medium pt-1 border-t border-gray-800/60 truncate">
                        📥 Projeto Importado para a StoryBible
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POP-UP / MODAL DE CONFIGURAÇÕES */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 md:p-8 w-full max-w-3xl shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto text-gray-200">
            
            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="border-b border-gray-800 pb-4">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Settings size={22} className="text-purple-400" /> Configurações
              </h3>
              <p className="text-xs text-gray-400 mt-1">Gerencie seu perfil, segurança e preferências</p>
            </div>

            {/* ABAS */}
            <div className="flex border-b border-gray-800 gap-2 pb-1 overflow-x-auto">
              {[
                { id: 'perfil', label: 'Perfil do Autor', icon: User },
                { id: 'seguranca', label: 'E-mail & Segurança', icon: Key },
                { id: 'privacidade', label: 'Privacidade & Conta', icon: Shield },
                { id: 'sobre', label: 'Versão & Sistema', icon: Info },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeSettingsTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSettingsTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                      active ? 'bg-purple-600 text-white shadow-lg' : 'bg-[#171724] text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon size={14} /> {tab.label}
                  </button>
                );
              })}
            </div>

            {/* CONTEÚDO DAS ABAS */}
            <div className="space-y-4">
              {activeSettingsTab === 'perfil' && (
                <form onSubmit={(e) => { e.preventDefault(); alert('Salvo com sucesso!'); }} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400">Nome de Exibição / Pseudônimo</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#171724] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-[11px] text-gray-500">Exibido nos relatórios e StoryBible exportada.</p>
                  </div>
                  <button type="submit" className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer">
                    Salvar
                  </button>
                </form>
              )}

              {activeSettingsTab === 'seguranca' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400">E-mail Cadastrado</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#171724] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="pt-2 border-t border-gray-800 space-y-3">
                    <span className="text-xs font-bold text-purple-300 block">Alterar Senha</span>
                    <input
                      type="password"
                      placeholder="Senha Atual"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[#171724] border border-gray-800 rounded-xl p-2.5 text-xs text-white"
                    />
                    <input
                      type="password"
                      placeholder="Nova Senha"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#171724] border border-gray-800 rounded-xl p-2.5 text-xs text-white"
                    />
                    <button 
                      type="button" 
                      onClick={() => alert('Senha alterada!')} 
                      className="px-4 py-2 bg-[#171724] border border-gray-700 text-xs font-bold text-white rounded-xl cursor-pointer"
                    >
                      Atualizar Senha
                    </button>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'privacidade' && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#171724] rounded-xl border border-gray-800 space-y-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Cookie size={14} className="text-amber-400" /> Cookies & Armazenamento
                    </span>
                    <p className="text-[11px] text-gray-300">
                      Utilizamos cookies locais estritamente para segurança da sua sessão.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-800 space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Excluir Minha Conta
                    </button>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'sobre' && (
                <div className="p-4 bg-[#171724] rounded-xl border border-gray-800 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-gray-800 pb-1.5">
                    <span className="text-gray-400">Versão</span>
                    <span className="font-mono text-purple-400 font-bold">v1.0.0 (Beta)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Suporte</span>
                    <span className="text-purple-300">suporte@storyforge.com.br</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            {!deleteEmailSent ? (
              <>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="text-red-500" size={18} /> Confirmar Exclusão
                </h3>
                <p className="text-xs text-gray-300">
                  Enviaremos um e-mail de confirmação para <b>{email}</b>.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteEmailSent(true)}
                    className="flex-1 py-2 bg-red-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Enviar E-mail
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-[#171724] text-gray-400 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-3 py-2">
                <CheckCircle className="text-emerald-400 mx-auto" size={36} />
                <h3 className="text-base font-bold text-white">E-mail Enviado!</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteEmailSent(false);
                  }}
                  className="w-full py-2 bg-[#171724] text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POP-UP / MODAL DE APOIO */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#11111a] border border-purple-900/50 rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <button
              type="button"
              onClick={() => setShowSupportModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
              <div className="p-3 bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-purple-950/50">
                <Coffee size={26} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Apoie o StoryForge ✍️</h3>
                <p className="text-xs text-purple-300 font-medium mt-0.5">
                  Um estúdio feito de escritor para escritores
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
              <p className="text-sm font-semibold text-purple-200">
                Olá, escritores! Antes de tudo, muito obrigado por estar aqui.
              </p>
              
              <p>
                Esse site foi criado com muito carinho, de forma totalmente independente, para ajudar futuros autores a desenvolverem suas próprias histórias. Ele é fruto de muita dedicação e pesquisa para te apoiar ao máximo nessa jornada!
              </p>

              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 flex items-start gap-3">
                <AlertTriangle size={18} className="shrink-0 text-amber-400 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Como é um projeto mantido por uma pessoa só, você pode encontrar algo fora do lugar. Peço um pouquinho de paciência e, se puder me avisar quando vir um erro, ajuda demais a melhorar o site para todo mundo!
                </p>
              </div>

              <p className="font-semibold text-gray-200">
                A ideia é manter o StoryForge <span className="text-emerald-400 font-bold">gratuito para sempre</span>. Como você pode ajudar a manter esse sonho vivo?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 bg-[#171724] border border-purple-800/40 rounded-xl space-y-1.5">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Heart size={14} className="fill-purple-400 text-purple-400" /> Contribuição Financeira
                  </span>
                  <p className="text-[11px] text-gray-400 leading-normal">
                    Qualquer quantia ajuda diretamente a cobrir os custos de servidor, banco de dados e manutenção.
                  </p>
                </div>

                <div className="p-3.5 bg-[#171724] border border-indigo-800/40 rounded-xl space-y-1.5">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-400" /> Divulgação & Comunidade
                  </span>
                  <p className="text-[11px] text-gray-400 leading-normal">
                    Compartilhe com amigos, grupos de escrita ou faculdade. Cada recomendação faz uma diferença enorme!
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#171724] border border-gray-800 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-purple-300 block">
                Chave Pix para contribuição rápida:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={PIX_KEY}
                  className="w-full bg-[#11111a] border border-gray-800 rounded-xl p-3 text-xs text-gray-200 font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg cursor-pointer shrink-0"
                >
                  {copiedPix ? <Check size={16} /> : <Copy size={16} />}
                  {copiedPix ? 'Copiado!' : 'Copiar Pix'}
                </button>
              </div>
            </div>

            <div className="text-center pt-1 border-t border-gray-800/80">
              <p className="text-xs font-bold text-purple-300 italic">
                Muito obrigado por fazer parte disso. Bora escrever juntos! ✍️
              </p>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE STATUS DA IMPORTAÇÃO */}
      {isImporting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl text-center space-y-6">
            <h3 className="text-lg font-bold text-white">Importando Projeto...</h3>

            <div className="space-y-2">
              <div className="w-full bg-[#1c1c26] h-3 rounded-full overflow-hidden border border-gray-800">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${importProgress}%`,
                    background: importStatus === 'error' 
                      ? '#ef4444' 
                      : 'linear-gradient(to right, #a855f7, #f97316)',
                  }}
                />
              </div>
              <span className={`text-xs font-medium ${importStatus === 'error' ? 'text-red-400' : 'text-gray-400'}`}>
                {importProgress}% {importStatus === 'error' ? 'Erro na Etapa' : 'Concluído'}
              </span>
            </div>

            {importStatus === 'success' && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-xl space-y-3">
                <CheckCircle className="mx-auto text-emerald-400" size={32} />
                <h4 className="text-sm font-bold text-emerald-300">Importação Concluída com Sucesso!</h4>
                <button
                  type="button"
                  onClick={() => setIsImporting(false)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                >
                  OK
                </button>
              </div>
            )}

            {importStatus === 'error' && (
              <div className="p-4 bg-red-950/40 border border-red-800/50 rounded-xl space-y-3 text-left">
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle size={24} />
                  <h4 className="text-sm font-bold">Falha no Processo</h4>
                </div>
                <p className="text-xs text-red-200/80 font-mono leading-relaxed">{importDetails[0]}</p>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleRetryImport}
                    className="flex-1 py-2 bg-red-700 hover:bg-red-600 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={14} /> Tentar Novamente
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsImporting(false)}
                    className="px-4 py-2 bg-[#1c1c26] hover:bg-[#282836] text-gray-300 font-bold text-xs rounded-lg transition-all cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: NOVO PROJETO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#13131a] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-white cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-6">Novo Projeto</h3>
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  placeholder="O título da sua história..."
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full bg-[#1a1a24] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 cursor-pointer"
              >
                <Plus size={18} /> Criar Projeto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}