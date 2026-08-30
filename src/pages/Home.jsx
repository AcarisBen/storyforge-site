import React, { useState, useEffect } from 'react';
import { Search, Plus, Settings, BookOpen } from 'lucide-react';
import apiClient from '../api/apiClient';

export default function Home({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', format: 'Romance / Livro' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Busca os projetos REAIS do banco PostgreSQL
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/entities/projects');
      setProjects(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar projetos do banco de dados:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Envia o NOVO PROJETO para o backend PostgreSQL
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
      console.error('Erro ao salvar no PostgreSQL:', err);
      alert('Não foi possível conectar ao servidor para criar o projeto.');
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white p-8 font-sans">
      {/* Topo / Header */}
      <div className="flex justify-end mb-8">
        <button type="button" className="flex items-center gap-2 px-4 py-2 bg-[#181820] hover:bg-[#22222e] rounded-lg border border-gray-800 text-sm text-gray-300 transition-colors">
          <Settings size={16} />
          Configurações
        </button>
      </div>

      {/* Hero Centralizado */}
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

      {/* Barra de Busca e Ação */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold">Meus Projetos</h2>
        <div className="flex items-center gap-4 w-full md:w-auto">
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
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-purple-900/30 whitespace-nowrap cursor-pointer"
          >
            <Plus size={18} />
            Novo Projeto
          </button>
        </div>
      </div>

      {/* Lista de Projetos ou Estado Vazio */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20 text-gray-500">Carregando seus projetos do banco de dados...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-[#13131a] border border-gray-800 rounded-2xl p-12 text-center max-w-lg mx-auto my-12">
            <BookOpen className="mx-auto text-purple-400 mb-4" size={48} />
            <h3 className="text-xl font-bold mb-2">Nenhum projeto cadastrado</h3>
            <p className="text-gray-400 text-sm mb-6">
              Você ainda não possui projetos ativos. Clique no botão abaixo para criar seu primeiro projeto.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
            >
              <Plus size={18} />
              Novo Projeto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject && onSelectProject(project)}
                className="bg-[#13131a] border border-gray-800 hover:border-purple-600/50 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 group flex flex-col justify-between h-56"
              >
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1c1c26] text-gray-400 rounded-full text-xs font-medium mb-4">
                    <BookOpen size={12} />
                    {project.format || 'Romance / Livro'}
                  </span>
                  <h3 className="text-xl font-bold group-hover:text-purple-400 transition-colors mb-1">{project.title}</h3>
                  <p className="text-xs text-gray-500">{project.genre || 'Romance / Livro'}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 rounded-full font-medium">
                      {project.status || 'Desenvolvimento'}
                    </span>
                    <span className="text-gray-500 font-medium">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-[#1c1c26] h-1.5 rounded-full overflow-hidden mb-4">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${project.progress || 0}%` }} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{project.characterCount || 0} personagens</span>
                    <span>{project.sceneCount || 0} cenas</span>
                    <span>{project.mysteryCount || 0} mistérios</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Novo Projeto */}
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
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Formato
                </label>
                <select
                  value={newProject.format}
                  onChange={(e) => setNewProject({ ...newProject, format: e.target.value })}
                  className="w-full bg-[#1a1a24] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Romance / Livro">Romance / Livro</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 cursor-pointer"
              >
                <Plus size={18} />
                Criar Projeto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}