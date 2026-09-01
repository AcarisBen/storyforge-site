import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useOnSelectionChange,
  Handle,
  Position,
  SelectionMode,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import apiClient from '../api/apiClient';

// Helper de cores para os Badges
function getEntityBadgeTheme(type = '') {
  const norm = String(type).toLowerCase();
  if (norm.includes('protagonista')) return 'bg-purple-900/60 text-purple-300 border-purple-500/50';
  if (norm.includes('antagonista')) return 'bg-red-900/60 text-red-300 border-red-500/50';
  if (norm.includes('planeta') || norm.includes('país') || norm.includes('cidade')) return 'bg-blue-900/60 text-blue-300 border-blue-500/50';
  if (norm.includes('política') || norm.includes('economia')) return 'bg-amber-900/60 text-amber-300 border-amber-500/50';
  if (norm.includes('fauna') || norm.includes('flora')) return 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50';
  return 'bg-purple-950/80 text-purple-300 border-purple-800/40';
}

// 1. Âncoras de Conexão nos 8 pontos (só aparecem no hover)
function ConnectionHandles({ strokeColor = '#a855f7' }) {
  const handleStyle = {
    width: '8px',
    height: '8px',
    backgroundColor: strokeColor,
    borderColor: '#ffffff',
    borderWidth: '1px',
  };

  return (
    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <Handle type="target" position={Position.Top} id="top" style={{ ...handleStyle, top: '-4px' }} className="pointer-events-auto" />
      <Handle type="source" position={Position.Right} id="right" style={{ ...handleStyle, right: '-4px' }} className="pointer-events-auto" />
      <Handle type="target" position={Position.Bottom} id="bottom" style={{ ...handleStyle, bottom: '-4px' }} className="pointer-events-auto" />
      <Handle type="source" position={Position.Left} id="left" style={{ ...handleStyle, left: '-4px' }} className="pointer-events-auto" />
      <Handle type="source" position={Position.Top} id="top-left" style={{ ...handleStyle, left: '-4px', top: '-4px' }} className="pointer-events-auto" />
      <Handle type="source" position={Position.Top} id="top-right" style={{ ...handleStyle, right: '-4px', top: '-4px' }} className="pointer-events-auto" />
      <Handle type="source" position={Position.Bottom} id="bottom-left" style={{ ...handleStyle, left: '-4px', bottom: '-4px' }} className="pointer-events-auto" />
      <Handle type="source" position={Position.Bottom} id="bottom-right" style={{ ...handleStyle, right: '-4px', bottom: '-4px' }} className="pointer-events-auto" />
    </div>
  );
}

// 2. Nó de Forma Geométrica (Sem Quadro Branco)
function CustomShapeNode({ data, selected }) {
  const { shapeType, label, fillColor, noFill, strokeColor, strokeWidth, strokeStyle } = data;
  const borderStyleCss = strokeStyle === 'dashed' ? 'dashed' : strokeStyle === 'dotted' ? 'dotted' : 'solid';

  const containerStyle = {
    backgroundColor: noFill ? 'transparent' : fillColor || '#181824',
    borderColor: strokeColor || '#7C3AED',
    borderWidth: strokeWidth || '2px',
    borderStyle: borderStyleCss,
  };

  const shapeClasses =
    shapeType === 'circle'
      ? 'rounded-full'
      : shapeType === 'diamond'
      ? 'rotate-45 scale-90'
      : 'rounded-xl';

  return (
    <div className={`group relative min-w-[120px] min-h-[80px] p-4 flex items-center justify-center transition-all ${shapeClasses} ${selected ? 'ring-2 ring-purple-500 shadow-2xl' : ''}`} style={containerStyle}>
      <ConnectionHandles strokeColor={strokeColor} />
      <span className={`text-sm font-semibold text-white ${shapeType === 'diamond' ? '-rotate-45' : ''}`}>
        {label || ''}
      </span>
    </div>
  );
}

// 3. Nó para Cards da História
function EntityCardNode({ data, selected }) {
  const { title, type, category } = data;

  return (
    <div className={`group relative bg-[#14141f] border border-purple-500/60 rounded-xl p-3 shadow-xl min-w-[180px] text-left space-y-1.5 transition-all ${selected ? 'ring-2 ring-purple-400' : ''}`}>
      <ConnectionHandles strokeColor="#a855f7" />
      <strong className="block text-sm font-bold text-white">{title}</strong>
      <span className={`inline-block border px-2 py-0.5 rounded text-[10px] font-medium ${getEntityBadgeTheme(type)}`}>
        {type || category}
      </span>
    </div>
  );
}

// Componente Interno do Storyboard
function StoryboardContent({ projectId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Painéis Retráteis
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Ferramentas & Estilos
  const [selectedTool, setSelectedTool] = useState('select');
  const [fillColor, setFillColor] = useState('#1a1d24');
  const [noFill, setNoFill] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#7C3AED');
  const [strokeWidth, setStrokeWidth] = useState('2px');
  const [strokeStyle, setStrokeStyle] = useState('solid');

  const [selectedNodeIds, setSelectedNodeIds] = useState([]);

  // Entidades
  const [entities, setEntities] = useState({
    personagens: [],
    mundo: [],
    estrutura: [],
    cenas: [],
    misterios: [],
    twists: [],
  });

  const [openEntityCategories, setOpenEntityCategories] = useState({
    personagens: true,
    mundo: false,
    estrutura: false,
    cenas: false,
  });

  const nodeTypes = useMemo(
    () => ({
      customShape: CustomShapeNode,
      entityNode: EntityCardNode,
    }),
    []
  );

  useOnSelectionChange({
    onChange: ({ nodes: selectedNodes }) => {
      const ids = selectedNodes.map((n) => n.id);
      setSelectedNodeIds(ids);

      if (selectedNodes.length === 1) {
        const data = selectedNodes[0].data;
        if (data.fillColor) setFillColor(data.fillColor);
        if (data.noFill !== undefined) setNoFill(data.noFill);
        if (data.strokeColor) setStrokeColor(data.strokeColor);
        if (data.strokeWidth) setStrokeWidth(data.strokeWidth);
        if (data.strokeStyle) setStrokeStyle(data.strokeStyle);
      }
    },
  });

  const updateSelectedNodesStyle = useCallback(
    (key, value) => {
      if (selectedNodeIds.length === 0) return;
      setNodes((nds) =>
        nds.map((node) => {
          if (selectedNodeIds.includes(node.id)) {
            return {
              ...node,
              data: {
                ...node.data,
                [key]: value,
              },
            };
          }
          return node;
        })
      );
    },
    [selectedNodeIds, setNodes]
  );

  function changeZIndex(direction) {
    if (selectedNodeIds.length === 0) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (selectedNodeIds.includes(node.id)) {
          const currentZ = node.zIndex || 1;
          const newZ = direction === 'front' ? currentZ + 10 : Math.max(0, currentZ - 10);
          return { ...node, zIndex: newZ };
        }
        return node;
      })
    );
  }

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: strokeStyle === 'dashed',
            style: { stroke: strokeColor, strokeWidth: parseInt(strokeWidth, 10) || 2 },
          },
          eds
        )
      ),
    [setEdges, strokeColor, strokeWidth, strokeStyle]
  );

  // Adicionar Forma ao clicar no Canvas
  const onPaneClick = useCallback(
    (event) => {
      if (selectedTool === 'select') return;

      const newNode = {
        id: `shape-${Date.now()}`,
        type: 'customShape',
        position: { x: event.clientX - 300, y: event.clientY - 100 },
        zIndex: 1,
        data: {
          shapeType: selectedTool,
          label: selectedTool === 'text' ? 'Texto Livre' : '',
          fillColor,
          noFill,
          strokeColor,
          strokeWidth,
          strokeStyle,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedTool('select');
    },
    [selectedTool, fillColor, noFill, strokeColor, strokeWidth, strokeStyle, setNodes]
  );

  // Carregar dados
  useEffect(() => {
    if (!projectId) return;

    const fetchProjectEntities = async () => {
      try {
        const [resChars, resWorld, resStruct, resScenes, resMysteries, resTwists] = await Promise.all([
          apiClient.get(`/entities/projects/${projectId}/characters`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/world`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/estrutura-dramatica/cards`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/scenes`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/mysteries`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/twists`).catch(() => ({ data: [] })),
        ]);

        setEntities({
          personagens: resChars.data || [],
          mundo: resWorld.data || [],
          estrutura: resStruct.data || [],
          cenas: resScenes.data || [],
          misterios: resMysteries.data || [],
          twists: resTwists.data || [],
        });
      } catch (err) {
        console.error('Erro ao buscar entidades para o Storyboard:', err);
      }
    };

    fetchProjectEntities();
  }, [projectId]);

  function addEntityToCanvas(entity, category) {
    const newNode = {
      id: `entity-${Date.now()}`,
      type: 'entityNode',
      position: { x: 300 + Math.random() * 100, y: 150 + Math.random() * 100 },
      zIndex: 2,
      data: {
        title: entity.name || entity.nome || entity.title,
        type: entity.type || category,
        category,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }

  function toggleCategory(cat) {
    setOpenEntityCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  return (
    <main className="storyboard-page relative w-full h-[calc(100vh-2rem)] overflow-hidden bg-[#0a0a0f] text-gray-200 flex">
      {/* PAINEL ESQUERDO */}
      <aside
        className={`relative z-20 h-full bg-[#12121a]/95 backdrop-blur border-r border-gray-800/80 transition-all duration-300 flex flex-col shrink-0 ${
          isLeftPanelOpen ? 'w-64' : 'w-12'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsLeftPanelOpen((prev) => !prev)}
          className="absolute -right-3 top-4 w-6 h-6 rounded-full bg-[#1c1c28] border border-gray-700 text-gray-300 flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-purple-900 shadow-md z-30"
        >
          {isLeftPanelOpen ? '‹' : '›'}
        </button>

        {isLeftPanelOpen ? (
          <div className="p-4 space-y-6 overflow-y-auto h-full custom-scrollbar">
            <div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Ferramentas</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'select', label: 'Selecionar', icon: '↖' },
                  { id: 'rectangle', label: 'Retângulo', icon: '▭' },
                  { id: 'circle', label: 'Círculo', icon: '◯' },
                  { id: 'diamond', label: 'Losango', icon: '◇' },
                  { id: 'text', label: 'Texto', icon: 'T' },
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

            {/* FORMATAÇÃO */}
            <div className="space-y-4 pt-4 border-t border-gray-800/60">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Formatação</h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 block">Preenchimento</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fillColor}
                    disabled={noFill}
                    onChange={(e) => {
                      setFillColor(e.target.value);
                      updateSelectedNodesStyle('fillColor', e.target.value);
                    }}
                    className="w-8 h-8 rounded border border-gray-700 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-gray-400">{noFill ? 'Nenhum' : fillColor}</span>
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={noFill}
                    onChange={(e) => {
                      setNoFill(e.target.checked);
                      updateSelectedNodesStyle('noFill', e.target.checked);
                    }}
                    className="rounded accent-purple-600"
                  />
                  Sem preenchimento
                </label>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-gray-300 block">Cor da Borda</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => {
                      setStrokeColor(e.target.value);
                      updateSelectedNodesStyle('strokeColor', e.target.value);
                    }}
                    className="w-8 h-8 rounded border border-gray-700 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-gray-400">{strokeColor}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-gray-300 block">Espessura da Borda</label>
                <select
                  value={strokeWidth}
                  onChange={(e) => {
                    setStrokeWidth(e.target.value);
                    updateSelectedNodesStyle('strokeWidth', e.target.value);
                  }}
                  className="w-full bg-[#181824] border border-gray-800 rounded-lg p-2 text-xs text-gray-300"
                >
                  <option value="1px">Fina (1px)</option>
                  <option value="2px">Média (2px)</option>
                  <option value="4px">Espessa (4px)</option>
                </select>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-gray-300 block">Estilo da Borda</label>
                <select
                  value={strokeStyle}
                  onChange={(e) => {
                    setStrokeStyle(e.target.value);
                    updateSelectedNodesStyle('strokeStyle', e.target.value);
                  }}
                  className="w-full bg-[#181824] border border-gray-800 rounded-lg p-2 text-xs text-gray-300"
                >
                  <option value="solid">Sólida</option>
                  <option value="dashed">Tracejada</option>
                  <option value="dotted">Pontilhada</option>
                </select>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-800/60">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Camadas</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => changeZIndex('front')}
                    className="p-2 rounded bg-[#181824] border border-gray-800 text-[11px] text-gray-300 hover:border-purple-600"
                  >
                    ▲ Frente
                  </button>
                  <button
                    type="button"
                    onClick={() => changeZIndex('back')}
                    className="p-2 rounded bg-[#181824] border border-gray-800 text-[11px] text-gray-300 hover:border-purple-600"
                  >
                    ▼ Trás
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center gap-4 text-gray-400 text-base">
            <span title="Ferramentas">🛠</span>
          </div>
        )}
      </aside>

      {/* CANVAS CENTRAL */}
      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={onPaneClick}
          selectionMode={SelectionMode.Partial}
          panOnScroll
          selectionOnDrag
          fitView
          className="bg-[#0a0a0f]"
        >
          <Background color="#222233" gap={20} size={1} />
          <Controls className="bg-[#14141f] border border-gray-800 text-white rounded-xl overflow-hidden shadow-2xl" />
        </ReactFlow>
      </div>

      {/* PAINEL DIREITO */}
      <aside
        className={`relative z-20 h-full bg-[#12121a]/95 backdrop-blur border-l border-gray-800/80 transition-all duration-300 flex flex-col shrink-0 ${
          isRightPanelOpen ? 'w-64' : 'w-12'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsRightPanelOpen((prev) => !prev)}
          className="absolute -left-3 top-4 w-6 h-6 rounded-full bg-[#1c1c28] border border-gray-700 text-gray-300 flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-purple-900 shadow-md z-30"
        >
          {isRightPanelOpen ? '›' : '‹'}
        </button>

        {isRightPanelOpen ? (
          <div className="p-4 space-y-4 overflow-y-auto h-full custom-scrollbar">
            <div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Itens da História</h3>
              <p className="text-[10px] text-gray-500">Clique no + para injetar no canvas</p>
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
          <div className="py-6 flex flex-col items-center gap-4 text-gray-400 text-base">
            <span title="Biblioteca da História">📚</span>
          </div>
        )}
      </aside>
    </main>
  );
}

// Wrapper OBRIGATÓRIO do Provider
export default function Storyboard({ projectId }) {
  return (
    <ReactFlowProvider>
      <StoryboardContent projectId={projectId} />
    </ReactFlowProvider>
  );
}