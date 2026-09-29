// src/pages/Relacoes.jsx
// Página de Relações entre Personagens do StoryForge com Guia do Módulo Padronizado

import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/apiClient';
import { useToast } from '../hooks/useToast';

import { 
  Target, 
  Lightbulb, 
  BookOpen, 
  HelpCircle, 
  AlertCircle,
  ChevronUp, 
  ChevronDown,
  Plus,
  Trash2,
  X
} from 'lucide-react';

const RELATION_TYPES = {
  Amizade: { label: 'Amizade', color: '#10b981', letter: 'A' },
  Família: { label: 'Família', color: '#eab308', letter: 'F' },
  Ódio: { label: 'Ódio / Raiva', color: '#ef4444', letter: 'Ó' },
  Amor: { label: 'Amor', color: '#ec4899', letter: 'A' },
  Aliança: { label: 'Aliança', color: '#06b6d4', letter: 'A' },
  Rivalidade: { label: 'Rivalidade', color: '#f97316', letter: 'R' },
  Vingança: { label: 'Vingança', color: '#a855f7', letter: 'V' },
  Opressão: { label: 'Opressão', color: '#6b7280', letter: 'O' },
  Mentor: { label: 'Mentor', color: '#d97706', letter: 'M' },
};

const INTENSITY_OPTIONS = [
  { value: 2, label: 'Muito Fina (1 - 2)' },
  { value: 4, label: 'Fina (3 - 4)' },
  { value: 6, label: 'Média (5 - 6)' },
  { value: 8, label: 'Grossa (7 - 8)' },
  { value: 10, label: 'Muito Grossa (9 - 10)' },
];

const guideTabs = {
  Objetivo: (
    <p>Visualizar e organizar a rede de relacionamentos entre todos os personagens.</p>
  ),
  Dicas: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>Relações complexas geram conflito — use-as deliberadamente.</li>
      <li>Alianças e rivalidades podem mudar ao longo da história.</li>
      <li>O grafo revela personagens isolados que precisam de conexão.</li>
      <li>Alterne as relações conforme as cenas mudam.</li>
      <li>Personagens abstratos podem fazer parte da história.</li>
    </ul>
  ),
  Exemplos: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li><strong>Amizade:</strong> “O mentor e o protagonista compartilham um passado comum.”</li>
      <li><strong>Rivalidade:</strong> “Dois generais que servem reinos opostos.”</li>
      <li><strong>Abstrato:</strong> “A fome encarava o menino como se zombasse dele.”</li>
    </ul>
  ),
  Perguntas: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>Quais personagens se conectam e por quê?</li>
      <li>Onde existem tensões não exploradas?</li>
      <li>Como as relações mudam ao longo da história?</li>
      <li>Algum personagem pode ser mais complexo?</li>
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

function RelacoesGuide() {
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

function getCharacterBorderColor(char = {}) {
  const sanitize = (str) =>
    String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const combinedProps = [
    char.role,
    char.papel,
    char.type,
    char.tipo,
    char.category,
    char.categoria,
    char.archetype,
  ]
    .map(sanitize)
    .join(' ');

  if (combinedProps.includes('protagonista')) return '#f97316';
  if (combinedProps.includes('antagonista') || combinedProps.includes('vilao')) return '#ef4444';
  return '#3b82f6';
}

function getStrokeWidthFromIntensity(val = 6) {
  const num = Number(val);
  if (num <= 2) return 1.5;
  if (num <= 4) return 2.5;
  if (num <= 6) return 3.5;
  if (num <= 8) return 4.5;
  return 5.5;
}

export default function Relacoes({ projectId }) {
  const { showToast } = useToast();

  const [characters, setCharacters] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [relations, setRelations] = useState([]);
  const [savingStatus, setSavingStatus] = useState('Salvo');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSceneFilter, setSelectedSceneFilter] = useState('todas');

  const [editingId, setEditingId] = useState(null);
  const [charA, setCharA] = useState('');
  const [charB, setCharB] = useState('');
  const [relType, setRelType] = useState('Amizade');
  const [intensity, setIntensity] = useState(6);
  const [relSceneId, setRelSceneId] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [resChars, resScenes, resRels] = await Promise.all([
          apiClient.get(`/entities/projects/${projectId}/characters`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/scenes`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/relations`).catch(() => ({ data: [] })),
        ]);

        if (!isMounted) return;

        setCharacters(Array.isArray(resChars?.data) ? resChars.data : []);
        setScenes(Array.isArray(resScenes?.data) ? resScenes.data : []);
        setRelations(Array.isArray(resRels?.data) ? resRels.data : []);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        showToast({
          type: 'error',
          title: 'Erro de Conexão',
          message: 'Não foi possível carregar as relações do projeto.'
        });
      }
    };

    if (projectId) {
      fetchData();
    }

    return () => { isMounted = false; };
  }, [projectId, showToast]);

  const nodePositions = useMemo(() => {
    if (!Array.isArray(characters) || characters.length === 0) return {};

    const total = characters.length;
    const center = 250;
    const radius = 175;
    const positions = {};

    characters.forEach((char, index) => {
      if (!char || !char.id) return;
      const angle = (2 * Math.PI * index) / total - Math.PI / 2;
      positions[char.id] = {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        name: char.name || char.nome || 'Sem Nome',
        color: getCharacterBorderColor(char),
      };
    });

    return positions;
  }, [characters]);

  const filteredRelations = useMemo(() => {
    if (!Array.isArray(relations)) return [];
    return relations.filter((r) => {
      if (!r) return false;
      return selectedSceneFilter === 'todas' || String(r.sceneId) === String(selectedSceneFilter);
    });
  }, [relations, selectedSceneFilter]);

  const pairedRelationGroups = useMemo(() => {
    const groups = {};

    filteredRelations.forEach((rel) => {
      if (!rel.charAId || !rel.charBId) return;
      const pairKey = [String(rel.charAId), String(rel.charBId)].sort().join('___');
      if (!groups[pairKey]) groups[pairKey] = [];
      groups[pairKey].push(rel);
    });

    return groups;
  }, [filteredRelations]);

  const handleOpenForm = (rel = null) => {
    if (rel) {
      setEditingId(rel.id);
      setCharA(rel.charAId || '');
      setCharB(rel.charBId || '');
      setRelType(rel.type || 'Amizade');
      setIntensity(rel.intensity || 6);
      setRelSceneId(rel.sceneId || '');
      setDescription(rel.description || '');
    } else {
      setEditingId(null);
      setCharA(characters[0]?.id || '');
      setCharB(characters[1]?.id || '');
      setRelType('Amizade');
      setIntensity(6);
      setRelSceneId(scenes[0]?.id || '');
      setDescription('');
    }
    setIsFormOpen(true);
  };

  const handleSaveRelation = async (e) => {
    e.preventDefault();
    if (!charA || !charB || charA === charB) {
      showToast({
        type: 'warning',
        title: 'Seleção Inválida',
        message: 'Selecione dois personagens diferentes.'
      });
      return;
    }

    setSavingStatus('Salvando...');

    const payload = {
      id: editingId,
      projectId,
      charAId: charA,
      charBId: charB,
      type: relType,
      intensity,
      sceneId: relSceneId || null,
      description,
    };

    try {
      const res = await apiClient.post(`/entities/relations`, payload);
      if (editingId) {
        setRelations((prev) => prev.map((r) => (r.id === editingId ? res.data : r)));
        showToast({
          type: 'success',
          title: 'Relação Atualizada',
          message: 'A relação foi atualizada com sucesso.'
        });
      } else {
        setRelations((prev) => [...prev, res.data]);
        showToast({
          type: 'success',
          title: 'Relação Criada',
          message: 'A relação foi criada com sucesso.'
        });
      }
      setIsFormOpen(false);
      setSavingStatus('Salvo');
    } catch (err) {
      console.error('Erro ao salvar relação:', err);
      setSavingStatus('Erro ao salvar');
      showToast({
        type: 'error',
        title: 'Erro de Salvamento',
        message: err.response?.data?.error || 'Não foi possível salvar a relação no banco de dados.'
      });
    }
  };

  const handleDeleteRelation = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja excluir esta relação?')) return;

    setSavingStatus('Salvando...');
    try {
      await apiClient.delete(`/entities/relations/${id}`);
      setRelations((prev) => prev.filter((r) => r.id !== id));
      setSavingStatus('Salvo');
      showToast({
        type: 'success',
        title: 'Relação Excluída',
        message: 'A relação foi removida com sucesso.'
      });
    } catch (err) {
      console.error('Erro ao deletar relação:', err);
      setSavingStatus('Erro ao salvar');
      showToast({
        type: 'error',
        title: 'Erro de Exclusão',
        message: err.response?.data?.error || 'Erro ao excluir a relação.'
      });
    }
  };

  return (
    <main className="module-page w-full space-y-6 pb-32 text-gray-200 font-sans">
      {/* CABEÇALHO PADRONIZADO DA PÁGINA RELAÇÕES */}
      <header className="module-header flex justify-between items-center">
        <div>
          <h1>Relações</h1>
          <p>Grafo interativo mostrando as conexões e dinâmicas entre personagens.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium bg-[#1c1c26] px-3 py-1 rounded-full border border-gray-800">
            {savingStatus}
          </span>
        </div>
      </header>

      {/* GUIA DO MÓDULO */}
      <RelacoesGuide />

      {/* CONTROLES E LEGENDA DE TIPOS DE RELAÇÃO */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 font-medium">
          {Object.entries(RELATION_TYPES).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
              <span>{key}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <select
            value={selectedSceneFilter}
            onChange={(e) => setSelectedSceneFilter(e.target.value)}
            className="bg-[#12131a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="todas">Todas as Cenas</option>
            {scenes.map((s) => (
              <option key={s.id} value={s.id}>{s.title || s.titulo || `Cena ${s.id}`}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => (isFormOpen ? setIsFormOpen(false) : handleOpenForm())}
            className="px-4 py-2 bg-purple-900/60 hover:bg-purple-800 border border-purple-500/80 text-purple-100 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isFormOpen ? (
              <>
                <X size={14} /> Cancelar
              </>
            ) : (
              <>
                <Plus size={14} /> Nova Relação
              </>
            )}
          </button>
        </div>
      </div>

      {/* FORMULÁRIO DE CRIAÇÃO / EDIÇÃO */}
      {isFormOpen && (
        <form onSubmit={handleSaveRelation} className="p-4 bg-[#12131a] border border-purple-900/50 rounded-2xl space-y-4 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Personagem A</label>
              <select
                value={charA}
                onChange={(e) => setCharA(e.target.value)}
                required
                className="w-full bg-[#181924] border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="">Selecione...</option>
                {characters.map((c) => (
                  <option key={c.id} value={c.id}>{c.name || c.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Personagem B</label>
              <select
                value={charB}
                onChange={(e) => setCharB(e.target.value)}
                required
                className="w-full bg-[#181924] border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="">Selecione...</option>
                {characters.map((c) => (
                  <option key={c.id} value={c.id}>{c.name || c.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tipo de Relação</label>
              <select
                value={relType}
                onChange={(e) => setRelType(e.target.value)}
                className="w-full bg-[#181924] border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {Object.keys(RELATION_TYPES).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cena Específica</label>
              <select
                value={relSceneId}
                onChange={(e) => setRelSceneId(e.target.value)}
                className="w-full bg-[#181924] border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="">Geral (Todas as Cenas)</option>
                {scenes.map((s) => (
                  <option key={s.id} value={s.id}>{s.title || s.titulo || `Cena ${s.id}`}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Intensidade da Linha</label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full bg-[#181924] border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {INTENSITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Descrição / Contexto</label>
            <input
              type="text"
              placeholder="Ex: Segredo compartilhado na infância..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#181924] border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            {editingId ? 'Atualizar Relação' : 'Criar Relação'}
          </button>
        </form>
      )}

      {/* GRAFO E LISTA DE RELAÇÕES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#12131a] border border-gray-800/80 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[500px] relative shadow-2xl">
          {characters.length === 0 ? (
            <p className="text-xs text-gray-500 italic">Cadastre personagens para visualizar o grafo.</p>
          ) : (
            <svg className="w-full h-[480px] max-w-[500px]" viewBox="0 0 500 500">
              {Object.values(pairedRelationGroups).map((relsGroup) => {
                const totalInPair = relsGroup.length;

                return relsGroup.map((rel, index) => {
                  const posA = nodePositions[rel.charAId];
                  const posB = nodePositions[rel.charBId];

                  if (!posA || !posB) return null;

                  const config = RELATION_TYPES[rel.type] || RELATION_TYPES.Amizade;
                  const strokeW = getStrokeWidthFromIntensity(rel.intensity);

                  const isCanonicalOrder = String(rel.charAId) < String(rel.charBId);
                  const startPos = isCanonicalOrder ? posA : posB;
                  const endPos = isCanonicalOrder ? posB : posA;

                  const dx = endPos.x - startPos.x;
                  const dy = endPos.y - startPos.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);

                  if (dist === 0) return null;

                  const midX = (startPos.x + endPos.x) / 2;
                  const midY = (startPos.y + endPos.y) / 2;

                  const nx = -dy / dist;
                  const ny = dx / dist;

                  let offset = 0;
                  if (totalInPair === 2) {
                    offset = index === 0 ? 40 : -40;
                  } else if (totalInPair > 2) {
                    const step = 40;
                    const centerIndex = (totalInPair - 1) / 2;
                    offset = (index - centerIndex) * step;
                  }

                  const ctrlX = midX + nx * offset;
                  const ctrlY = midY + ny * offset;

                  const labelX = 0.25 * startPos.x + 0.5 * ctrlX + 0.25 * endPos.x;
                  const labelY = 0.25 * startPos.y + 0.5 * ctrlY + 0.25 * endPos.y;

                  const pathD = `M ${startPos.x} ${startPos.y} Q ${ctrlX} ${ctrlY} ${endPos.x} ${endPos.y}`;

                  return (
                    <g key={rel.id || index}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={config.color}
                        strokeWidth={strokeW}
                        strokeOpacity="0.85"
                      />

                      <circle
                        cx={labelX}
                        cy={labelY}
                        r="10"
                        fill={config.color}
                        className="cursor-pointer"
                      />
                      <text
                        x={labelX}
                        y={labelY + 3.5}
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="select-none pointer-events-none"
                      >
                        {config.letter}
                      </text>
                    </g>
                  );
                });
              })}

              {Object.entries(nodePositions).map(([id, node]) => (
                <g key={id} className="cursor-pointer">
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="38"
                    fill="#101118"
                    stroke={node.color}
                    strokeWidth="3.5"
                    className="shadow-xl"
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="select-none pointer-events-none"
                  >
                    {node.name.length > 9 ? `${node.name.slice(0, 8)}...` : node.name}
                  </text>
                </g>
              ))}
            </svg>
          )}
        </div>

        <div className="space-y-3">
          {filteredRelations.length === 0 ? (
            <div className="p-8 bg-[#12131a] border border-gray-800/80 rounded-2xl text-center text-xs text-gray-500 shadow-lg">
              Nenhuma relação criada.
            </div>
          ) : (
            filteredRelations.map((rel) => {
              const nameA = nodePositions[rel.charAId]?.name || 'Desconhecido';
              const nameB = nodePositions[rel.charBId]?.name || 'Desconhecido';
              const config = RELATION_TYPES[rel.type] || RELATION_TYPES.Amizade;

              return (
                <div
                  key={rel.id}
                  onClick={() => handleOpenForm(rel)}
                  className="p-3.5 bg-[#12131a] hover:bg-[#181924] border border-gray-800/80 hover:border-purple-600/50 rounded-2xl transition-all shadow-md cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <span>{nameA}</span>
                      <span
                        className="px-2 py-0.5 rounded-md text-[9px] font-bold text-white"
                        style={{ backgroundColor: config.color }}
                      >
                        {rel.type}
                      </span>
                      <span>{nameB}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteRelation(rel.id, e)}
                      className="text-gray-500 hover:text-red-400 text-xs p-1 transition-colors cursor-pointer"
                      title="Excluir relação"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {rel.description && (
                    <p className="text-[11px] text-gray-400 italic leading-snug">
                      {rel.description}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}