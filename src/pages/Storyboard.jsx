import React, { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useOnSelectionChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import apiClient from '../api/apiClient';

// Helper de cores temáticas para os cards de entidades da história no canvas
function getEntityBadgeTheme(type = '') {
  const norm = String(type).toLowerCase();
  if (norm.includes('protagonista')) return 'bg-purple-900/60 text-purple-300 border-purple-500/50';
  if (norm.includes('antagonista')) return 'bg-red-900/60 text-red-300 border-red-500/50';
  if (norm.includes('planeta') || norm.includes('país') || norm.includes('cidade')) return 'bg-blue-900/60 text-blue-300 border-blue-500/50';
  if (norm.includes('política') || norm.includes('economia')) return 'bg-amber-900/60 text-amber-300 border-amber-500/50';
  if (norm.includes('fauna') || norm.includes('flora')) return 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50';
  return 'bg-purple-950/80 text-purple-300 border-purple-800/40';
}

export default function Storyboard({ projectId }) {
  // Estado dos Nós (Nodes) e Conexões (Edges) do React Flow
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Estados de Controle de Layout Retrátil
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Estados das Ferramentas e Formatação
  const [selectedTool, setSelectedTool] = useState('select'); // 'select', 'rectangle', 'circle', 'diamond', 'triangle', 'text', 'arrow'
  const [fillColor, setFillColor] = useState('#1a1d24');
  const [noFill, setNoFill] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#7C3AED');
  const [strokeWidth, setStrokeWidth] = useState('2px');
  const [strokeStyle, setStrokeStyle] = useState('solid');

  // Estados dos Itens do Projeto (Painel Direito)
  const [entities, setEntities] = useState({
    engenharia: [],
    estrutura: [],
    ritmo: [],
    personagens: [],
    cenas: [],
    mundo: [],
    misterios: [],
    twists: [],
    eventos: [],
  });

  const [openEntityCategories, setOpenEntityCategories] = useState({
    personagens: true,
    mundo: false,
    estrutura: false,
    cenas: false,
  });

  // 1. Conectar/Criar Arestas entre Formas
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: strokeColor, strokeWidth: 2 } }, eds)),
    [setEdges, strokeColor]
  );

  // 2. Carregar Entidades do Projeto para o Painel Direito
  useEffect(() => {
    if (!projectId) return;

    const fetchProjectEntities = async () => {
      try {
        const [
          resChars,
          resWorld,
          resStruct,
          resScenes,
          resMysteries,
          resTwists,
        ] = await Promise.all([
          apiClient.get(`/entities/projects/${projectId}/characters`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/world`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/estrutura-dramatica/cards`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/scenes`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/mysteries`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/twists`).catch(() => ({ data: [] })),
        ]);

        setEntities((prev) => ({
          ...prev,
          personagens: resChars.data || [],
          mundo: resWorld.data || [],
          estrutura: resStruct.data || [],
          cenas: resScenes.data || [],
          misterios: resMysteries.data || [],
          twists: resTwists.data || [],
        }));
      } catch (err) {
        console.error('Erro ao buscar entidades para o Storyboard:', err);
      }
    };

    fetchProjectEntities();
  }, [projectId]);

  // Função para adicionar um item da história direto no Canvas Central
  function addEntityToCanvas(entity, category) {
    const newNode = {
      id: `entity-${Date.now()}`,
      type: 'default',
      position: { x: 300 + Math.random() * 100, y: 200 + Math.random() * 100 },
      data: {
        label: (
          <div className="p-3 bg-[#14141f] border border-purple-500/50 rounded-xl text-left space-y-1 shadow-lg min-w-[160px]">
            <strong className="block text-xs font-bold text-white">{entity.name || entity.nome || entity.title}</strong>
            <span className={`inline-block border px-2 py-0.5 rounded text-[10px] font-medium ${getEntityBadgeTheme(entity.type)}`}>
              {entity.type || category}
            </span>
          </div>
        ),
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }

  function toggleCategory(cat) {
    setOpenEntityCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  return (
    <main className="storyboard-page relative w-full h-[calc(100vh-2rem)] overflow-hidden bg-[#0a0a0f] text-gray-200 flex">
      {/* ==========================================
          PAINEL ESQUERDO: FERRAMENTAS & FORMATAÇÃO
          ========================================== */}
      <aside
        className={`relative z-20 h-full bg-[#12121a]/95 backdrop-blur border-r border-gray-800/80 transition-all duration-300 flex flex-col shrink-0 ${
          isLeftPanelOpen ? 'w-64' : 'w-12'
        }`}
      >
        {/* Botão de Toggle do Painel Esquerdo */}
        <button
          type="button"
          onClick={() => setIsLeftPanelOpen((prev) => !prev)}
          className="absolute -right-3 top-4 w-6 h-6 rounded-full bg-[#1c1c28] border border-gray-700 text-gray-300 flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-purple-900 shadow-md z-30"
          title={isLeftPanelOpen ? 'Recolher Painel' : 'Expandir Painel'}
        >
          {isLeftPanelOpen ? '‹' : '›'}
        </button>

        {isLeftPanelOpen ? (
          <div className="p-4 space-y-6 overflow-y-auto h-full custom-scrollbar">
            {/* Seção de Seleção de Ferramentas */}
            <div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Ferramentas</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'select', label: 'Selecionar', icon: '↖' },
                  { id: 'rectangle', label: 'Retângulo', icon: '▭' },
                  { id: 'circle', label: 'Círculo', icon: '◯' },
                  { id: 'diamond', label: 'Losango', icon: '◇' },
                  { id: 'triangle', label: 'Triângulo', icon: '△' },
                  { id: 'text', label: 'Texto', icon: 'T' },
                  { id: 'arrow', label: 'Seta', icon: '➔' },
                ].map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setSelectedTool(tool.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                      selectedTool === tool.id
                        ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                        : 'bg-[#181824] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-300'
                    }`}
                  >
                    <span className="text-base mb-0.5">{tool.icon}</span>
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Seção de Formatação de Estilos */}
            <div className="space-y-4 pt-4 border-t border-gray-800/60">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Formatação</h3>

              {/* Preenchimento */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 block">Preenchimento</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fillColor}
                    disabled={noFill}
                    onChange={(e) => setFillColor(e.target.value)}
                    className="w-8 h-8 rounded border border-gray-700 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-gray-400">{noFill ? 'Nenhum' : fillColor}</span>
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={noFill}
                    onChange={(e) => setNoFill(e.target.checked)}
                    className="rounded accent-purple-600"
                  />
                  Sem preenchimento
                </label>
              </div>

              {/* Cor da Borda */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-gray-300 block">Cor da Borda</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-8 h-8 rounded border border-gray-700 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-gray-400">{strokeColor}</span>
                </div>
              </div>

              {/* Espessura da Borda */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-gray-300 block">Espessura da Borda</label>
                <select
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(e.target.value)}
                  className="w-full bg-[#181824] border border-gray-800 rounded-lg p-2 text-xs text-gray-300"
                >
                  <option value="1px">Fina (1px)</option>
                  <option value="2px">Média (2px)</option>
                  <option value="4px">Espessa (4px)</option>
                </select>
              </div>

              {/* Estilo da Borda */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-gray-300 block">Estilo da Borda</label>
                <select
                  value={strokeStyle}
                  onChange={(e) => setStrokeStyle(e.target.value)}
                  className="w-full bg-[#181824] border border-gray-800 rounded-lg p-2 text-xs text-gray-300"
                >
                  <option value="solid">Sólida</option>
                  <option value="dashed">Tracejada</option>
                  <option value="dotted">Pontilhada</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          /* Estado Recolhido (Ícones minimalistas) */
          <div className="py-6 flex flex-col items-center gap-4 text-gray-400 text-base">
            <span title="Ferramentas">🛠</span>
            <span title="Estilos">🎨</span>
          </div>
        )}
      </aside>

      {/* ==========================================
          CANVAS CENTRAL (REAÇÃO DE ZOOM E ARRASTE)
          ========================================== */}
      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          className="bg-[#0a0a0f]"
        >
          <Background color="#222233" gap={20} size={1} />
          <Controls className="bg-[#14141f] border border-gray-800 text-white rounded-xl overflow-hidden shadow-2xl" />
        </ReactFlow>
      </div>

      {/* ==========================================
          PAINEL DIREITO: ITENS DA HISTÓRIA
          ========================================== */}
      <aside
        className={`relative z-20 h-full bg-[#12121a]/95 backdrop-blur border-l border-gray-800/80 transition-all duration-300 flex flex-col shrink-0 ${
          isRightPanelOpen ? 'w-64' : 'w-12'
        }`}
      >
        {/* Botão de Toggle do Painel Direito */}
        <button
          type="button"
          onClick={() => setIsRightPanelOpen((prev) => !prev)}
          className="absolute -left-3 top-4 w-6 h-6 rounded-full bg-[#1c1c28] border border-gray-700 text-gray-300 flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-purple-900 shadow-md z-30"
          title={isRightPanelOpen ? 'Recolher Painel' : 'Expandir Painel'}
        >
          {isRightPanelOpen ? '›' : '‹'}
        </button>

        {isRightPanelOpen ? (
          <div className="p-4 space-y-4 overflow-y-auto h-full custom-scrollbar">
            <div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Itens da História</h3>
              <p className="text-[10px] text-gray-500">Clique em + para adicionar ao canvas</p>
            </div>

            <div className="space-y-3">
              {[
                { key: 'personagens', label: 'Personagens', color: 'bg-purple-500' },
                { key: 'mundo', label: 'Mundo', color: 'bg-emerald-500' },
                { key: 'estrutura', label: 'Estrutura', color: 'bg-blue-500' },
                { key: 'cenas', label: 'Cenas', color: 'bg-amber-500' },
                { key: 'misterios', label: 'Mistérios', color: 'bg-pink-500' },
                { key: 'twists', label: 'Plot Twists', color: 'bg-red-500' },
              ].map((group) => {
                const list = entities[group.key] || [];
                const isOpen = openEntityCategories[group.key];

                return (
                  <div key={group.key} className="border border-gray-800/80 rounded-xl overflow-hidden bg-[#161622]">
                    <button
                      type="button"
                      onClick={() => toggleCategory(group.key)}
                      className="w-full px-3 py-2 flex justify-between items-center text-xs font-bold text-gray-200 cursor-pointer hover:bg-[#1a1a28]"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${group.color}`} />
                        <span>{group.label}</span>
                      </div>
                      <span className="text-gray-500 text-[10px] font-mono">
                        {list.length} {isOpen ? '⌃' : '⌄'}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="p-2 space-y-1 bg-[#11111a] border-t border-gray-800/60">
                        {list.length === 0 ? (
                          <p className="text-[11px] text-gray-500 italic p-1">Nenhum item criado.</p>
                        ) : (
                          list.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-center p-1.5 rounded bg-[#171724] border border-gray-800/60 text-xs text-gray-300 hover:border-purple-600/60"
                            >
                              <span className="truncate pr-2 font-medium">{item.name || item.nome || item.title}</span>
                              <button
                                type="button"
                                onClick={() => addEntityToCanvas(item, group.label)}
                                className="px-2 py-0.5 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-bold text-xs cursor-pointer"
                                title="Injetar no Canvas"
                              >
                                +
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Estado Recolhido */
          <div className="py-6 flex flex-col items-center gap-4 text-gray-400 text-base">
            <span title="Biblioteca da História">📚</span>
          </div>
        )}
      </aside>
    </main>
  );
}