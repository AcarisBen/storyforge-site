import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Settings, BookOpen, Upload, RefreshCw, AlertTriangle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import apiClient from '../api/apiClient';

export default function Home({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', format: 'Romance / Livro' });
  const [loading, setLoading] = useState(true);

  // Estados de Importação
  const fileInputRef = useRef(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // 'success' | 'partial' | 'error'
  const [importDetails, setImportDetails] = useState([]);
  const [pendingFile, setPendingFile] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/entities/projects');
      setProjects(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar projetos:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
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
        // =================================================================
        // PARTE 1: CRIAÇÃO DO PROJETO (0% -> 30%)
        // =================================================================
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

        // =================================================================
        // PARTE 2: MAPEAMENTO DE MAPAS DE IDs (PERSONAGENS E CENAS)
        // =================================================================
        const characterIdMap = {};
        const sceneIdMap = {};

        // 1. Importar Personagens e guardar mapa de IDs (antigo -> novo)
        if (Array.isArray(pData.characters)) {
          for (const char of pData.characters) {
            const oldId = char.id;
            const charPayload = { ...char, projectId: newProjId };
            delete charPayload.id; // Remove ID antigo para criar novo no DB

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

        // 2. Importar Cenas e guardar mapa de IDs (antigo -> novo)
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

        // =================================================================
        // PARTE 3: PREPARAR ESTRUTURA DRAMÁTICA
        // =================================================================
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

        // =================================================================
        // PARTE 4: DEMAIS MÓDULOS E RELAÇÕES
        // =================================================================
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
          
          // ✅ RELAÇÕES COM MAPA DE IDs REMAPEADO
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
                  delete itemPayload.id; // Garante geração de novo ID
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

  const filteredProjects = projects.filter((p) =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white p-8 font-sans">
      <div className="flex justify-end mb-8">
        <button type="button" className="flex items-center gap-2 px-4 py-2 bg-[#181820] hover:bg-[#22222e] rounded-lg border border-gray-800 text-sm text-gray-300 transition-colors cursor-pointer">
          <Settings size={16} /> Configurações
        </button>
      </div>

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
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-purple-900/30 whitespace-nowrap cursor-pointer"
          >
            <Plus size={18} /> Novo Projeto
          </button>
        </div>
      </div>

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
              const isImported = project.isImported || project.title?.includes('(Importado)');

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
                          onClick={(e) => handleDeleteProject(e, project.id, project.title)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-purple-400 transition-colors mb-1">{project.title}</h3>
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