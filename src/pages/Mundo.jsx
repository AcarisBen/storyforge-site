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
        <nav className="world-filters">
          <button
            className={filter === 'Todos' ? 'character-filter active cursor-pointer' : 'character-filter cursor-pointer'}
            type="button"
            onClick={() => setFilter('Todos')}
          >
            Todos ({elements.length})
          </button>
          {allFilterTypes.map((type) => (
            <button
              className={filter === type ? 'character-filter active cursor-pointer' : 'character-filter cursor-pointer'}
              type="button"
              key={type}
              onClick={() => setFilter(type)}
            >
              {type}{counts[type] ? ` (${counts[type]})` : ''}
            </button>
          ))}
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