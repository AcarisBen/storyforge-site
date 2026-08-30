import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';

const characterTypes = {
  protagonista: { label: 'Protagonista', icon: '♛', className: 'type-protagonist' },
  antagonista: { label: 'Antagonista', icon: '☠', className: 'type-antagonist' },
  secundario: { label: 'Secundário', icon: '♙', className: 'type-secondary' },
};

const guideTabs = {
  Objetivo: <p>Criar personagens tridimensionais com motivações, arcos e conflitos profundos.</p>,
  Dicas: <ul><li>Todo personagem precisa de um desejo consciente e uma necessidade inconsciente.</li><li>O ponto-cego é o que o personagem não vê sobre si mesmo — e o público vê.</li><li>O antagonista deve acreditar que é o herói da própria história.</li></ul>,
  Exemplos: <ul><li>Desejo tangível: “Derrotar o Império.” Necessidade: “Acreditar em si mesmo.”</li><li>Arco: “De egoísta a altruísta, de medroso a corajoso.”</li></ul>,
  Perguntas: <ul><li>O que o personagem quer vs. o que ele precisa?</li><li>Qual trauma do passado define seu presente?</li><li>Como ele muda do início ao fim da história?</li></ul>,
};

const sections = [
  ['Informações Básicas', [['nome', 'Nome', 'input', 'Digite...'], ['idade', 'Idade', 'input', 'Digite...'], ['descricao', 'Descrição', 'textarea', 'Descreva...'], ['imageUrl', 'URL da imagem', 'input', 'Digite uma URL de imagem...']]],
  ['História', [['historia', 'História do personagem', 'textarea', 'Descreva...'], ['passado', 'Passado', 'textarea', 'Descreva...'], ['trauma', 'Trauma', 'textarea', 'Descreva...'], ['segredo', 'Segredo', 'textarea', 'Descreva...']]],
  ['Personalidade', [['personalidade', 'Personalidade', 'textarea', 'Descreva...'], ['arquetipo', 'Arquétipo', 'input', 'Digite...'], ['virtudes', 'Virtudes', 'textarea', 'Descreva...'], ['falhas', 'Falhas', 'textarea', 'Descreva...'], ['medos', 'Medos', 'textarea', 'Descreva...'], ['valores', 'Valores', 'textarea', 'Descreva...']]],
  ['Motivação e Desejos', [['motivacao', 'Motivação', 'textarea', 'Descreva...'], ['desejoTangivel', 'Desejo tangível', 'textarea', 'Descreva...'], ['desejoAbstrato', 'Desejo abstrato', 'textarea', 'Descreva...'], ['necessidade', 'Necessidade', 'textarea', 'Descreva...'], ['pontoCego', 'Ponto-cego', 'textarea', 'Descreva...'], ['objetivos', 'Objetivos', 'textarea', 'Descreva...']]],
  ['Psicologia e Riscos', [['idEgoSuperego', 'Id / Ego / Superego', 'textarea', 'Descreva...'], ['empatia', 'Empatia', 'textarea', 'Descreva...'], ['riscoEmocional', 'Risco emocional', 'textarea', 'Descreva...'], ['riscoMoral', 'Risco moral', 'textarea', 'Descreva...'], ['riscoFisico', 'Risco físico', 'textarea', 'Descreva...']]],
  ['Arco e Mudança', [['arco', 'Arco do personagem', 'textarea', 'Descreva...'], ['mudanca', 'Mudança', 'textarea', 'Descreva...'], ['conflitos', 'Conflitos', 'textarea', 'Descreva...']]],
  ['Relações e Itens', [['relacionamentos', 'Relacionamentos', 'textarea', 'Descreva...'], ['itens', 'Itens', 'textarea', 'Descreva...'], ['frasesMarcantes', 'Frases marcantes', 'textarea', 'Descreva...'], ['curiosidades', 'Curiosidades', 'textarea', 'Descreva...']]],
];

function emptyDetails() {
  return Object.fromEntries(sections.flatMap(([, fields]) => fields.map(([key]) => [key, ''])));
}

function CharacterGuide() {
  const [activeTab, setActiveTab] = useState('Objetivo');
  const [isOpen, setIsOpen] = useState(true);
  return (
    <section className="module-guide character-guide">
      <button className="guide-toggle cursor-pointer" type="button" aria-expanded={isOpen} onClick={() => setIsOpen((v) => !v)}>
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

function CharacterDetail({ character, onBack, onUpdate, onDelete }) {
  const [localCharacter, setLocalCharacter] = useState(character);
  const [savingStatus, setSavingStatus] = useState('Salvo');
  const [imageError, setImageError] = useState(false);
  const isFirstRender = useRef(true);

  const type = characterTypes[localCharacter.type] || characterTypes.protagonista;
  const details = localCharacter.details || {};
  const filledFields = Object.values(details).filter((v) => typeof v === 'string' && v.trim() !== '').length;
  const totalFields = Object.keys(emptyDetails()).length;

  // Auto-save do dossiê no PostgreSQL
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSavingStatus('Salvando...');

    const timer = setTimeout(async () => {
      try {
        const payload = {
          name: localCharacter.name,
          type: localCharacter.type,
          details: localCharacter.details,
        };
        // URL Corrigida com /entities
        const res = await apiClient.put(`/entities/characters/${localCharacter.id}`, payload);
        setSavingStatus('Salvo no banco');
        if (onUpdate) onUpdate(res.data);
      } catch (err) {
        console.error('Erro ao salvar personagem:', err);
        setSavingStatus('Erro ao salvar');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [localCharacter]);

  function updateField(key, value) {
    if (key === 'imageUrl') setImageError(false);

    setLocalCharacter((prev) => {
      const updatedDetails = { ...prev.details, [key]: value };
      return {
        ...prev,
        name: key === 'nome' ? value || prev.name : prev.name,
        details: updatedDetails,
      };
    });
  }

  return (
    <main className="characters-page character-detail-page">
      <div className="flex justify-between items-center mb-4">
        <button className="back-link cursor-pointer" type="button" onClick={onBack}>
          ← Voltar para Personagens
        </button>
        <span className="text-xs text-gray-400 font-medium bg-[#1c1c26] px-3 py-1 rounded-full border border-gray-800">
          {savingStatus}
        </span>
      </div>

      <header className="character-profile-header">
        <div className={`character-avatar large ${type.className}`}>
          {details.imageUrl && !imageError ? (
            <img src={details.imageUrl} alt="" onError={() => setImageError(true)} />
          ) : (
            type.icon
          )}
        </div>
        <div className="character-profile-info">
          <div>
            <h1>{localCharacter.name || 'Novo personagem'}</h1>
            <span className={`character-type ${type.className}`}>{type.label}</span>
          </div>
          <p>{filledFields}/{totalFields} campos preenchidos</p>
          <div className="character-detail-progress">
            <div style={{ width: `${Math.round((filledFields / totalFields) * 100)}%` }} />
          </div>
        </div>
        <button className="delete-character cursor-pointer" type="button" onClick={onDelete}>
          Excluir
        </button>
      </header>

      {sections.map(([title, fields], index) => (
        <section className="character-section" key={title}>
          <header>
            <span>{index + 1}/{sections.length}</span>
            <strong>{title}</strong>
          </header>
          <div className="character-fields">
            {fields.map(([key, label, inputType, placeholder]) => (
              <label key={key}>
                <span>{label}</span>
                {inputType === 'textarea' ? (
                  <textarea
                    placeholder={placeholder}
                    value={details[key] || ''}
                    onChange={(e) => updateField(key, e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={details[key] || ''}
                    onChange={(e) => updateField(key, e.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

export default function Personagens({ projectId }) {
  const [characters, setCharacters] = useState([]);
  const [filter, setFilter] = useState('todos');
  const [isCreating, setIsCreating] = useState(false);
  const [newCharacter, setNewCharacter] = useState({ name: '', type: 'protagonista' });
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega os personagens do banco PostgreSQL ao abrir a página
  useEffect(() => {
    if (!projectId) return;

    const fetchCharacters = async () => {
      try {
        setLoading(true);
        // URL Corrigida com /entities
        const res = await apiClient.get(`/entities/projects/${projectId}/characters`);
        setCharacters(res.data || []);
      } catch (err) {
        console.error('Erro ao buscar personagens:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [projectId]);

  const counts = Object.fromEntries(
    Object.keys(characterTypes).map((type) => [type, characters.filter((c) => c.type === type).length])
  );
  const visibleCharacters = filter === 'todos' ? characters : characters.filter((c) => c.type === filter);

  // Criar Personagem no PostgreSQL
  async function createCharacter() {
    if (!newCharacter.name.trim() || !projectId) {
      alert('Selecione um projeto válido antes de criar o personagem.');
      return;
    }

    try {
      const payload = {
        name: newCharacter.name.trim(),
        type: newCharacter.type,
        details: { ...emptyDetails(), nome: newCharacter.name.trim() },
      };

      // URL Corrigida com /entities
      const res = await apiClient.post(`/entities/projects/${projectId}/characters`, payload);
      const created = res.data;

      setCharacters((prev) => [...prev, created]);
      setSelectedCharacter(created);
      setIsCreating(false);
      setNewCharacter({ name: '', type: 'protagonista' });
    } catch (err) {
      console.error('Erro detalhado ao criar personagem:', err.response?.data || err.message);
      alert(`Não foi possível criar o personagem: ${err.response?.data?.error || err.message}`);
    }
  }

  function updateCharacterState(updated) {
    setCharacters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  // Excluir Personagem do PostgreSQL
  async function deleteCharacter(id) {
    if (!window.confirm('Tem certeza que deseja excluir este personagem?')) return;

    try {
      // URL Corrigida com /entities
      await apiClient.delete(`/entities/characters/${id}`);
      setCharacters((prev) => prev.filter((c) => c.id !== id));
      if (selectedCharacter?.id === id) setSelectedCharacter(null);
    } catch (err) {
      console.error('Erro ao excluir personagem:', err);
      alert('Erro ao excluir o personagem.');
    }
  }

  if (selectedCharacter) {
    return (
      <CharacterDetail
        character={selectedCharacter}
        onBack={() => setSelectedCharacter(null)}
        onUpdate={updateCharacterState}
        onDelete={() => deleteCharacter(selectedCharacter.id)}
      />
    );
  }

  return (
    <main className="characters-page">
      <header className="characters-header">
        <div>
          <h1>Personagens</h1>
          <p>Dossiês completos de cada personagem — protagonista, antagonista e secundários.</p>
        </div>
      </header>

      <CharacterGuide />

      <div className="character-toolbar">
        <nav className="character-filters">
          {[
            ['todos', 'Todos'],
            ['protagonista', 'Protagonista'],
            ['antagonista', 'Antagonista'],
            ['secundario', 'Secundário'],
          ].map(([key, label]) => (
            <button
              className={filter === key ? 'character-filter active cursor-pointer' : 'character-filter cursor-pointer'}
              type="button"
              key={key}
              onClick={() => setFilter(key)}
            >
              {label} ({key === 'todos' ? characters.length : counts[key]})
            </button>
          ))}
        </nav>
        <button className="new-character-button cursor-pointer" type="button" onClick={() => setIsCreating(true)}>
          ＋ Novo Personagem
        </button>
      </div>

      {isCreating && (
        <div className="character-create-form">
          <input
            autoFocus
            type="text"
            placeholder="Nome do personagem..."
            value={newCharacter.name}
            onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
          />
          <select
            value={newCharacter.type}
            onChange={(e) => setNewCharacter({ ...newCharacter, type: e.target.value })}
          >
            {Object.entries(characterTypes).map(([key, type]) => (
              <option key={key} value={key}>{type.label}</option>
            ))}
          </select>
          <button type="button" onClick={createCharacter} className="cursor-pointer">
            Criar Personagem
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando personagens...</div>
      ) : visibleCharacters.length === 0 ? (
        <div className="empty-characters">
          <span aria-hidden="true">♙</span>
          <p>Nenhum personagem criado ainda. Crie seu primeiro personagem para começar.</p>
        </div>
      ) : (
        <div className="characters-grid">
          {visibleCharacters.map((character) => {
            const type = characterTypes[character.type] || characterTypes.protagonista;
            const details = character.details || {};
            return (
              <article
                className={`character-card ${type.className} cursor-pointer`}
                key={character.id}
                onClick={() => setSelectedCharacter(character)}
              >
                <div className="character-card-image">
                  {details.imageUrl ? (
                    <img src={details.imageUrl} alt={`Retrato de ${character.name}`} />
                  ) : (
                    <span>{type.icon}</span>
                  )}
                </div>
                <div className="character-card-body">
                  <div className="character-card-heading">
                    <h2>{character.name}</h2>
                    <small className={`character-card-type ${type.className}`}>{type.label}</small>
                  </div>
                  <button
                    type="button"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCharacter(character.id);
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}