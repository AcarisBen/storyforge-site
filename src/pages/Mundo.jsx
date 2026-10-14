// src/pages/Mundo.jsx
// Página de Mundo do StoryForge. Permite criar e gerenciar elementos do universo da história, como planetas, cidades, biomas, sistemas de magia, facções e muito mais.

import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useToast } from '../hooks/useToast';

import { 
  Target, 
  Lightbulb, 
  BookOpen, 
  HelpCircle, 
  AlertCircle,
  AlertTriangle,
  ChevronUp, 
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Globe,
  X
} from 'lucide-react';

const baseElementTypes = [
  'Planeta', 'Mapa', 'País', 'Cidade', 'Bioma', 'Clima', 'Política', 'Economia',
  'Religião', 'Tecnologia', 'Fauna', 'Flora', 'Idioma', 'História', 'Cronologia',
  'Mitologia', 'Facção', 'Sistema de Magia', 'Sistema de Poderes', 'Sistema de Ciência', 'Sistema de Combate',
  'Outros'
];

const guideTabs = {
  Objetivo: (
    <p>Construir um mundo coerente, imersivo e funcional que sustenta a narrativa.</p>
  ),
  Dicas: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>O mundo deve refletir o tema — cada elemento tem propósito narrativo.</li>
      <li>Sistemas (magia, economia, combate) precisam de regras claras e consistentes.</li>
      <li>A história do mundo afeta o presente da narrativa.</li>
    </ul>
  ),
  Exemplos: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>Sistema de Magia: “A magia custa energia vital — quanto maior o feitiço, mais curta a vida.”</li>
      <li>Facção: “A Ordem dos Guardiões protege os segredos antigos a qualquer custo.”</li>
    </ul>
  ),
  Perguntas: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>Como o mundo reflete o tema da história?</li>
      <li>Quais regras governam os sistemas do mundo?</li>
      <li>Que conflitos existem entre as facções?</li>
    </ul>
  ),
};

// Mapeamento centralizado de ícones e cores do Guia do Módulo
const GUIDE_TAB_CONFIG = {
  Objetivo: { Icon: Target, color: 'text-red-400' },
  Dicas: { Icon: Lightbulb, color: 'text-amber-400' },
  Exemplos: { Icon: BookOpen, color: 'text-purple-400' },
  Perguntas: { Icon: HelpCircle, color: 'text-orange-400' },
};

function getWorldTheme(type = '') {
  const norm = String(type).toLowerCase().trim();

  switch (norm) {
    case 'planeta':
      return 'bg-blue-900/60 text-blue-300 border-blue-500/50';
    case 'mapa':
      return 'bg-sky-900/60 text-sky-300 border-sky-500/50';
    case 'país':
    case 'pais':
      return 'bg-indigo-900/60 text-indigo-300 border-indigo-500/50';
    case 'cidade':
      return 'bg-cyan-900/60 text-cyan-300 border-cyan-500/50';
    case 'bioma':
      return 'bg-teal-900/60 text-teal-300 border-teal-500/50';
    case 'clima':
      return 'bg-blue-950/80 text-blue-200 border-blue-400/40';

    case 'política':
    case 'politica':
      return 'bg-amber-900/60 text-amber-300 border-amber-500/50';
    case 'economia':
      return 'bg-yellow-900/60 text-yellow-300 border-yellow-500/50';
    case 'religião':
    case 'religiao':
      return 'bg-orange-900/60 text-orange-300 border-orange-500/50';
    case 'tecnologia':
      return 'bg-amber-950/80 text-amber-200 border-amber-400/40';

    case 'fauna':
      return 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50';
    case 'flora':
      return 'bg-green-900/60 text-green-300 border-green-500/50';
    case 'idioma':
      return 'bg-lime-900/60 text-lime-300 border-lime-500/50';

    case 'história':
    case 'historia':
      return 'bg-fuchsia-900/60 text-fuchsia-300 border-fuchsia-500/50';
    case 'cronologia':
      return 'bg-pink-900/60 text-pink-300 border-pink-500/50';
    case 'mitologia':
      return 'bg-rose-900/60 text-rose-300 border-rose-500/50';
    case 'facção':
    case 'faccao':
      return 'bg-fuchsia-950/80 text-fuchsia-200 border-fuchsia-400/40';

    case 'sistema de magia':
      return 'bg-violet-900/60 text-violet-300 border-violet-500/50';
    case 'sistema de poderes':
      return 'bg-red-900/60 text-red-300 border-red-500/50';
    case 'sistema de ciência':
    case 'sistema de ciencia':
      return 'bg-stone-800 text-stone-200 border-stone-500/50';
    case 'sistema de combate':
      return 'bg-red-950/80 text-red-200 border-red-400/40';

    case 'todos':
    default:
      return 'bg-purple-900/60 text-purple-300 border-purple-500/50';
  }
}

function WorldGuide() {
  const [activeTab, setActiveTab] = useState('Objetivo');
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="module-guide character-guide mb-6 rounded-2xl border border-white/10 bg-[#14141e]/80 backdrop-blur-md overflow-hidden">
      {/* Cabeçalho do Guia com ícone de Exclamação */}
      <button
        className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors text-left"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="flex items-center gap-2 font-bold text-white text-sm">
          <AlertCircle size={18} className="text-amber-400 shrink-0" />
          Guia do Módulo
        </span>
        {isOpen ? (
          <ChevronUp size={18} className="text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </button>

      {/* Conteúdo com Abas Padronizadas */}
      {isOpen && (
        <div className="p-4 pt-0 border-t border-white/5 space-y-4">
          <nav className="flex flex-wrap gap-2 pt-3" aria-label="Guia do módulo">
            {Object.keys(guideTabs).map((tab) => {
              const config = GUIDE_TAB_CONFIG[tab] || { Icon: HelpCircle, color: 'text-gray-400' };
              const { Icon, color } = config;
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-purple-600/30 border-purple-500/80 text-white shadow-[0_2px_10px_rgba(168,85,247,0.25)]'
                      : 'bg-[#1a1a26] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                  }`}
                >
                  <Icon size={16} className={`shrink-0 ${color}`} />
                  <span>{tab}</span>
                </button>
              );
            })}
          </nav>

          <div className="text-xs text-gray-300 leading-relaxed bg-[#11111a] p-4 rounded-xl border border-gray-800/80">
            {guideTabs[activeTab]}
          </div>
        </div>
      )}
    </section>
  );
}

export default function Mundo({ projectId }) {
  const { showToast } = useToast();

  const [elements, setElements] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: '', type: 'País', customType: '', description: '' });
  const [loading, setLoading] = useState(true);

  // Estado para controlar o elemento a ser excluído via Modal Customizado
  const [elementToDelete, setElementToDelete] = useState(null);

  // Carrega os elementos do banco de dados ao carregar a tela
  useEffect(() => {
    if (!projectId) return;

    const fetchWorldElements = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/entities/projects/${projectId}/world`);
        setElements(res.data || []);
      } catch (err) {
        console.error('Erro ao buscar elementos do mundo:', err);
        showToast({
          type: 'error',
          title: 'Erro de Conexão',
          message: 'Não foi possível carregar os elementos do mundo.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWorldElements();
  }, [projectId, showToast]);

  // Junta os tipos base com os tipos customizados criados pelos usuários
  const customTypesInUse = Array.from(new Set(elements.map((e) => e.type)))
    .filter((t) => !baseElementTypes.includes(t));
  
  const allFilterTypes = [...baseElementTypes.filter((t) => t !== 'Outros'), ...customTypesInUse];

  const counts = Object.fromEntries(
    allFilterTypes.map((type) => [type, elements.filter((element) => element.type === type).length])
  );

  const visibleElements = filter === 'Todos' ? elements : elements.filter((element) => element.type === filter);

  function openCreate() {
    setDraft({ name: '', type: 'País', customType: '', description: '' });
    setEditingId(null);
    setIsCreating(true);
  }

  function openEdit(element) {
    const isBaseType = baseElementTypes.includes(element.type);
    setDraft({
      name: element.name,
      type: isBaseType ? element.type : 'Outros',
      customType: isBaseType ? '' : element.type,
      description: element.description,
    });
    setEditingId(element.id);
    setIsCreating(true);
  }

  // Criar ou Editar Elemento no PostgreSQL
  async function saveElement() {
    if (!draft.name.trim()) {
      showToast({
        type: 'warning',
        title: 'Campo Obrigatório',
        message: 'Por favor, informe o nome do elemento.'
      });
      return;
    }

    if (!projectId) return;

    if ((draft.type === 'Outros' || draft.type === 'Outro') && !draft.customType.trim()) {
      showToast({
        type: 'warning',
        title: 'Campo Obrigatório',
        message: 'Por favor, digite o nome do novo tipo personalizado.'
      });
      return;
    }

    const finalType = (draft.type === 'Outros' || draft.type === 'Outro') && draft.customType.trim()
      ? draft.customType.trim()
      : draft.type;

    const payload = {
      name: draft.name.trim(),
      type: finalType,
      description: draft.description,
    };

    try {
      if (editingId) {
        const res = await apiClient.put(`/entities/world/${editingId}`, payload);
        setElements((prev) => prev.map((item) => (item.id === editingId ? res.data : item)));
        showToast({
          type: 'success',
          title: 'Elemento Atualizado',
          message: `O elemento "${payload.name}" foi atualizado com sucesso.`
        });
      } else {
        const res = await apiClient.post(`/entities/projects/${projectId}/world`, payload);
        setElements((prev) => [...prev, res.data]);
        showToast({
          type: 'success',
          title: 'Elemento Criado',
          message: `O elemento "${payload.name}" foi criado com sucesso.`
        });
      }

      setIsCreating(false);
      setEditingId(null);
    } catch (err) {
      console.error('Erro ao salvar elemento do mundo:', err);
      showToast({
        type: 'error',
        title: 'Erro de Salvamento',
        message: err.response?.data?.error || 'Não foi possível salvar o elemento.'
      });
    }
  }

  // Executa a exclusão do elemento após confirmação no modal
  const confirmDeleteElement = async () => {
    if (!elementToDelete) return;

    const { id, name } = elementToDelete;

    try {
      await apiClient.delete(`/entities/world/${id}`);
      setElements((prev) => prev.filter((item) => item.id !== id));
      showToast({
        type: 'success',
        title: 'Elemento Excluído',
        message: `O elemento "${name}" foi removido com sucesso.`
      });
    } catch (err) {
      console.error('Erro ao excluir elemento:', err);
      showToast({
        type: 'error',
        title: 'Erro de Exclusão',
        message: err.response?.data?.error || 'Erro ao excluir o elemento.'
      });
    } finally {
      setElementToDelete(null);
    }
  };

  return (
    <main className="module-page w-full world-page">
      {/* CABEÇALHO PADRONIZADO DA PÁGINA MUNDO */}
      <header className="module-header flex justify-between items-center">
        <div>
          <h1>Mundo</h1>
          <p>A construção completa do universo onde a história acontece.</p>
        </div>
      </header>

      <WorldGuide />

      <div className="world-toolbar mt-6 flex justify-between items-center gap-4 flex-wrap">
        <nav className="world-filters flex flex-wrap gap-2 flex-1">
          {/* Botão "Todos" */}
          <button
            className={`px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all ${
              filter === 'Todos'
                ? getWorldTheme('Todos')
                : 'bg-[#1a1a26] border-gray-800 text-gray-400 hover:border-gray-700'
            }`}
            type="button"
            onClick={() => setFilter('Todos')}
          >
            Todos ({elements.length})
          </button>

          {/* Botões das Categorias de Mundo */}
          {allFilterTypes.map((type) => {
            const isSelected = filter === type;
            const colorStyle = isSelected
              ? getWorldTheme(type)
              : 'bg-[#1a1a26] border-gray-800 text-gray-400 hover:border-gray-700';

            return (
              <button
                className={`px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all ${colorStyle}`}
                type="button"
                key={type}
                onClick={() => setFilter(type)}
              >
                {type}{counts[type] ? ` (${counts[type]})` : ''}
              </button>
            );
          })}
        </nav>
        <button 
          className="new-character-button cursor-pointer flex items-center gap-1 rounded-full px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-all shrink-0" 
          type="button" 
          onClick={openCreate}
        >
          <Plus size={16} /> Novo Elemento
        </button>
      </div>

      {isCreating && (
        <div className="world-create-form bg-[#1c1c28] p-5 rounded-2xl border border-purple-900/50 space-y-3 mt-4 shadow-xl">
          <input
            autoFocus
            type="text"
            placeholder="Nome do elemento..."
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            className="w-full bg-[#14141e] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 outline-none focus:border-purple-500"
          />
          <select 
            value={draft.type} 
            onChange={(event) => setDraft({ ...draft, type: event.target.value })}
            className="w-full bg-[#14141e] border border-gray-800 rounded-xl p-3 text-xs font-semibold text-white outline-none focus:border-purple-500 cursor-pointer"
          >
            {baseElementTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Campo Extra de Tipo Customizado */}
          {(draft.type === 'Outros' || draft.type === 'Outro') && (
            <input
              type="text"
              placeholder="Digite seu tipo personalizado (ex: Artefato, Guilda, Constelação)..."
              value={draft.customType}
              onChange={(event) => setDraft({ ...draft, customType: event.target.value })}
              className="w-full bg-[#14141e] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 outline-none focus:border-purple-500"
            />
          )}

          <textarea
            placeholder="Descrição..."
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            className="w-full h-24 bg-[#14141e] border border-gray-800 rounded-xl p-3 text-xs text-gray-300 placeholder-gray-500 outline-none focus:border-purple-500"
          />
          <div className="flex gap-2 pt-1">
            <button 
              className="cursor-pointer bg-purple-600 hover:bg-purple-500 px-5 py-2.5 rounded-xl text-white font-bold text-xs transition-colors" 
              type="button" 
              onClick={saveElement}
            >
              {editingId ? 'Salvar Alterações' : 'Criar Elemento'}
            </button>
            <button 
              className="cursor-pointer bg-gray-800 hover:bg-gray-700 px-5 py-2.5 rounded-xl text-gray-300 font-bold text-xs transition-colors" 
              type="button" 
              onClick={() => setIsCreating(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando universo...</div>
      ) : visibleElements.length === 0 ? (
        <div className="empty-characters world-empty text-center py-12">
          <Globe size={32} className="text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Nenhum elemento criado ainda.</p>
        </div>
      ) : (
        <div className="world-elements grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {visibleElements.map((element) => (
            <article className="world-card bg-[#181822] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg hover:border-purple-900/50 transition-all" key={element.id}>
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h2 className="text-base font-bold text-white">{element.name}</h2>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold shrink-0 ${getWorldTheme(element.type)}`}>
                    {element.type}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{element.description || 'Sem descrição.'}</p>
              </div>

              <div className="world-card-actions flex gap-2 pt-4 mt-4 border-t border-gray-800/80 justify-end">
                <button 
                  className="px-3 py-1.5 bg-[#14141e] hover:bg-amber-950/40 border border-gray-800 hover:border-amber-600/60 text-amber-300 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1" 
                  type="button" 
                  onClick={() => openEdit(element)}
                >
                  <Pencil size={13} /> Editar
                </button>
                <button 
                  className="px-3 py-1.5 bg-[#14141e] hover:bg-red-950/60 border border-gray-800 hover:border-red-600/60 text-red-400 hover:text-red-300 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1" 
                  type="button" 
                  onClick={() => setElementToDelete(element)}
                >
                  <Trash2 size={13} /> Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* MODAL PADRONIZADO DE CONFIRMAÇÃO DE EXCLUSÃO DE ELEMENTO */}
      {elementToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 relative text-center">
            <button
              type="button"
              onClick={() => setElementToDelete(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 bg-red-950/50 border border-red-800/50 rounded-2xl flex items-center justify-center mx-auto text-red-500 shadow-lg shadow-red-950/50">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">Excluir Elemento</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Tem certeza que deseja excluir o elemento <strong className="text-white">"{elementToDelete.name}"</strong>? Esta ação é irreversível e removerá todas as informações cadastradas nele.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setElementToDelete(null)}
                className="flex-1 py-2.5 bg-[#171724] hover:bg-[#202030] text-gray-300 font-bold text-xs rounded-xl border border-gray-800/80 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteElement}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-red-950/50"
              >
                <Trash2 size={15} /> Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}