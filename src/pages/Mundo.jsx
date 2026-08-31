import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const baseElementTypes = [
  'Planeta', 'Mapa', 'País', 'Cidade', 'Bioma', 'Clima', 'Política', 'Economia',
  'Religião', 'Tecnologia', 'Fauna', 'Flora', 'Idioma', 'História', 'Cronologia',
  'Mitologia', 'Facção', 'Sistema de Magia', 'Sistema de Poderes', 'Sistema de Ciência', 'Sistema de Combate',
  'Outros'
];

const guideTabs = {
  Objetivo: <p>Construir um mundo coerente, imersivo e funcional que sustenta a narrativa.</p>,
  Dicas: <ul><li>O mundo deve refletir o tema — cada elemento tem propósito narrativo.</li><li>Sistemas (magia, economia, combate) precisam de regras claras e consistentes.</li><li>A história do mundo afeta o presente da narrativa.</li></ul>,
  Exemplos: <ul><li>Sistema de Magia: “A magia custa energia vital — quanto maior o feitiço, mais curta a vida.”</li><li>Facção: “A Ordem dos Guardiões protege os segredos antigos a qualquer custo.”</li></ul>,
  Perguntas: <ul><li>Como o mundo reflete o tema da história?</li><li>Quais regras governam os sistemas do mundo?</li><li>Que conflitos existem entre as facções?</li></ul>,
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
    <section className="module-guide character-guide">
      <button className="guide-toggle cursor-pointer" type="button" aria-expanded={isOpen} onClick={() => setIsOpen((value) => !value)}>
        <span><b aria-hidden="true">!</b> Guia do Módulo</span>
        <span aria-hidden="true">{isOpen ? '⌃' : '⌄'}</span>
      </button>
      {isOpen && (
        <div className="guide-content">
          <nav className="guide-tabs" aria-label="Guia do módulo">
            {Object.keys(guideTabs).map((tab) => (
              <button
                className={activeTab === tab ? 'guide-tab active cursor-pointer' : 'guide-tab cursor-pointer'}
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
              >
                <span aria-hidden="true">{tab === 'Objetivo' ? '◎' : tab === 'Dicas' ? '♧' : tab === 'Exemplos' ? '▣' : '?'}</span>
                {tab}
              </button>
            ))}
          </nav>
          <div className="guide-description">{guideTabs[activeTab]}</div>
        </div>
      )}
    </section>
  );
}

export default function Mundo({ projectId }) {
  const [elements, setElements] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: '', type: 'País', customType: '', description: '' });
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchWorldElements();
  }, [projectId]);

  // Junta os tipos base com os tipos customizados criados pelos usuários (sem duplicar e excluindo 'Outros' dos filtros)
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
    if (!draft.name.trim() || !projectId) return;
    if (draft.type === 'Outros' && !draft.customType.trim()) {
      alert('Por favor, digite o nome do novo tipo.');
      return;
    }

    try {
      if (editingId) {
        const res = await apiClient.put(`/entities/world/${editingId}`, draft);
        setElements((prev) => prev.map((item) => (item.id === editingId ? res.data : item)));
      } else {
        const res = await apiClient.post(`/entities/projects/${projectId}/world`, draft);
        setElements((prev) => [...prev, res.data]);
      }

      setIsCreating(false);
      setEditingId(null);
    } catch (err) {
      console.error('Erro ao salvar elemento do mundo:', err);
      alert('Não foi possível salvar o elemento.');
    }
  }

  // Excluir Elemento do PostgreSQL
  async function deleteElement(id) {
    if (!window.confirm('Tem certeza que deseja excluir este elemento?')) return;

    try {
      await apiClient.delete(`/entities/world/${id}`);
      setElements((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Erro ao excluir elemento:', err);
      alert('Erro ao excluir o elemento.');
    }
  }

  return (
    <main className="characters-page world-page">
      <header className="characters-header">
        <div>
          <h1>Mundo</h1>
          <p>A construção completa do universo onde a história acontece.</p>
        </div>
      </header>

      <WorldGuide />

      <div className="world-toolbar">
        <nav className="world-filters flex flex-wrap gap-2">
          {/* Botão "Todos" (Mantém a cor Roxa quando ativo) */}
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

          {/* Botões das 21 Categorias de Mundo */}
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
        <button className="new-character-button cursor-pointer" type="button" onClick={openCreate}>
          ＋ Novo
        </button>
      </div>

      {isCreating && (
        <div className="world-create-form space-y-3">
          <input
            autoFocus
            type="text"
            placeholder="Nome do elemento..."
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
          <select 
            value={draft.type} 
            onChange={(event) => setDraft({ ...draft, type: event.target.value })}
          >
            {baseElementTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Campo Extra de Tipo Customizado (Visível apenas se o usuário escolher 'Outro') */}
          {draft.type === 'Outro' && (
            <input
              type="text"
              placeholder="Digite seu tipo personalizado (ex: Artefato, Guilda, Constelação)..."
              value={draft.customType}
              onChange={(event) => setDraft({ ...draft, customType: event.target.value })}
            />
          )}

          <textarea
            placeholder="Descrição..."
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          />
          <div>
            <button className="cursor-pointer" type="button" onClick={saveElement}>
              {editingId ? 'Salvar' : 'Criar'}
            </button>
            <button className="cursor-pointer" type="button" onClick={() => setIsCreating(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando universo...</div>
      ) : visibleElements.length === 0 ? (
        <div className="empty-characters world-empty">
          <span aria-hidden="true">◎</span>
          <p>Nenhum elemento criado ainda.</p>
        </div>
      ) : (
        <div className="world-elements">
          {visibleElements.map((element) => (
            <article className="world-card" key={element.id}>
              <div>
                <h2>{element.name}</h2>
                <small>{element.type}</small>
                <p>{element.description || 'Sem descrição.'}</p>
              </div>
              <div className="world-card-actions">
                <button className="cursor-pointer" type="button" onClick={() => openEdit(element)}>
                  Editar
                </button>
                <button className="cursor-pointer" type="button" onClick={() => deleteElement(element.id)}>
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}