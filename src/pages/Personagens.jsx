// src/pages/Personagens.jsx
// Página de Personagens do StoryForge com Guia do Módulo Padronizado

import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';

import { 
  Target, 
  Lightbulb, 
  BookOpen, 
  HelpCircle, 
  AlertCircle,
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';

const characterTypes = {
  protagonista: { label: 'Protagonista', icon: '♛', className: 'type-protagonist' },
  antagonista: { label: 'Antagonista', icon: '☠', className: 'type-antagonist' },
  secundario: { label: 'Secundário', icon: '♙', className: 'type-secondary' },
};

const guideTabs = {
  Objetivo: (
    <p>Criar personagens tridimensionais com motivações, arcos e conflitos profundos.</p>
  ),
  Dicas: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>Todo personagem precisa de um desejo consciente e uma necessidade inconsciente.</li>
      <li>O ponto-cego é o que o personagem não vê sobre si mesmo — e o público vê.</li>
      <li>O antagonista deve acreditar que é o herói da própria história.</li>
    </ul>
  ),
  Exemplos: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>Desejo tangível: “Derrotar o Império.” Necessidade: “Acreditar em si mesmo.”</li>
      <li>Arco: “De egoísta a altruísta, de medroso a corajoso.”</li>
    </ul>
  ),
  Perguntas: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>O que o personagem quer vs. o que ele precisa?</li>
      <li>Qual trauma do passado define seu presente?</li>
      <li>Como ele muda do início ao fim da história?</li>
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

function CharacterGuide() {
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

function CharacterDetail({ character, onBack, onUpdate, onDelete }) {
  const [localCharacter, setLocalCharacter] = useState(character);
  const [savingStatus, setSavingStatus] = useState('Salvo');
  const [imageError, setImageError] = useState(false);
  const isFirstRender = useRef(true);

  const type = characterTypes[localCharacter.type] || characterTypes.protagonista;
  const details = localCharacter.details || {};
  const filledFields = Object.values(details).filter((v) => typeof v === 'string' && v.trim() !== '').length;
  const totalFields = Object.keys(emptyDetails()).length;
  const progress = Math.round((filledFields / totalFields) * 100);

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
        const res = await apiClient.put(`/entities/characters/${localCharacter.id}`, payload);
        setSavingStatus('Salvo');
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
    <main className="module-page w-full character-detail-page">
      {/* CABEÇALHO PADRONIZADO DO DOSSIÊ DO PERSONAGEM */}
      <header className="module-header flex justify-between items-center">
        <div>
          <button className="back-link cursor-pointer text-xs text-purple-400 hover:text-purple-300 font-bold mb-2 block" type="button" onClick={onBack}>
            ← Voltar para Personagens
          </button>
          <h1>Dossiê: {localCharacter.name || 'Novo personagem'}</h1>
          <p>Preencha as informações detalhadas para aprofundar a construção do personagem.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium bg-[#1c1c26] px-3 py-1 rounded-full border border-gray-800">
            {savingStatus}
          </span>
          <div className="module-progress">
            <span aria-hidden="true" />
            {progress}%
          </div>
        </div>
      </header>

      {/* BARRA DE PROGRESSO DO DOSSIÊ */}
      <div className="module-progress-track">
        <div style={{ width: `${progress}%` }} />
      </div>

      <header className="character-profile-header mt-6">
        <div className={`character-avatar large ${type.className}`}>
          {details.imageUrl && !imageError ? (
            <img
              src={details.imageUrl}
              alt=""
              onError={() => setImageError(true)}
            />
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
    if (!newCharacter.name.trim() || !projectId) return;

    try {
      const payload = {
        name: newCharacter.name.trim(),
        type: newCharacter.type,
        details: { ...emptyDetails(), nome: newCharacter.name.trim() },
      };

      const res = await apiClient.post(`/entities/projects/${projectId}/characters`, payload);
      const created = res.data;

      setCharacters((prev) => [...prev, created]);
      setSelectedCharacter(created);
      setIsCreating(false);
      setNewCharacter({ name: '', type: 'protagonista' });
    } catch (err) {
      console.error('Erro ao criar personagem no banco:', err);
      alert('Não foi possível criar o personagem.');
    }
  }

  // Atualiza no estado local
  function updateCharacterState(updated) {
    setCharacters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  // Excluir Personagem do PostgreSQL
  async function deleteCharacter(id) {
    if (!window.confirm('Tem certeza que deseja excluir este personagem?')) return;

    try {
      await apiClient.delete(`/characters/${id}`);
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
    <main className="module-page w-full characters-page">
      {/* CABEÇALHO PADRONIZADO DA LISTA (SEM BARRA/PORCENTAGEM DE PROGRESSO) */}
      <header className="module-header flex justify-between items-center">
        <div>
          <h1>Personagens</h1>
          <p>Dossiês completos de cada personagem — protagonista, antagonista e secundários.</p>
        </div>
      </header>

      <CharacterGuide />

      <div className="character-toolbar mt-6">
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