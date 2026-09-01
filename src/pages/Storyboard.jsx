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
  NodeResizer,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import apiClient from '../api/apiClient';

// Helper de cores para Badges de Entidades
function getEntityBadgeTheme(type = '') {
  const norm = String(type).toLowerCase();
  if (norm.includes('protagonista')) return 'bg-purple-900/60 text-purple-300 border-purple-500/50';
  if (norm.includes('antagonista')) return 'bg-red-900/60 text-red-300 border-red-500/50';
  if (norm.includes('planeta') || norm.includes('país') || norm.includes('cidade')) return 'bg-blue-900/60 text-blue-300 border-blue-500/50';
  if (norm.includes('política') || norm.includes('economia')) return 'bg-amber-900/60 text-amber-300 border-amber-500/50';
  if (norm.includes('fauna') || norm.includes('flora')) return 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50';
  return 'bg-purple-950/80 text-purple-300 border-purple-800/40';
}

// -----------------------------------------------------------------
// 1. CONECTORES ROXOS EM ÓRBITA EXTERNA (8 PONTOS COMPLETOS & FUNCIONAIS)
// Cada conector aceita tanto ser ORIGEM (source) quanto DESTINO (target)
// -----------------------------------------------------------------
function ExternalHandles({ strokeColor = '#a855f7' }) {
  const handleStyle = {
    width: '12px',
    height: '12px',
    backgroundColor: strokeColor,
    borderColor: '#ffffff',
    borderWidth: '2px',
    borderRadius: '50%',
    zIndex: 50,
  };

  return (
    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {/* Topo */}
      <Handle type="target" position={Position.Top} id="top-t" style={{ ...handleStyle, top: '-22px' }} className="pointer-events-auto hover:scale-125 transition-transform" />
      <Handle type="source" position={Position.Top} id="top-s" style={{ ...handleStyle, top: '-22px', opacity: 0 }} className="pointer-events-auto" />

      {/* Direita */}
      <Handle type="target" position={Position.Right} id="right-t" style={{ ...handleStyle, right: '-22px' }} className="pointer-events-auto hover:scale-125 transition-transform" />
      <Handle type="source" position={Position.Right} id="right-s" style={{ ...handleStyle, right: '-22px', opacity: 0 }} className="pointer-events-auto" />

      {/* Baixo */}
      <Handle type="target" position={Position.Bottom} id="bottom-t" style={{ ...handleStyle, bottom: '-22px' }} className="pointer-events-auto hover:scale-125 transition-transform" />
      <Handle type="source" position={Position.Bottom} id="bottom-s" style={{ ...handleStyle, bottom: '-22px', opacity: 0 }} className="pointer-events-auto" />

      {/* Esquerda */}
      <Handle type="target" position={Position.Left} id="left-t" style={{ ...handleStyle, left: '-22px' }} className="pointer-events-auto hover:scale-125 transition-transform" />
      <Handle type="source" position={Position.Left} id="left-s" style={{ ...handleStyle, left: '-22px', opacity: 0 }} className="pointer-events-auto" />

      {/* Canto Superior Esquerdo */}
      <Handle type="target" position={Position.Top} id="top-left-t" style={{ ...handleStyle, left: '-22px', top: '-22px' }} className="pointer-events-auto hover:scale-125 transition-transform" />
      <Handle type="source" position={Position.Top} id="top-left-s" style={{ ...handleStyle, left: '-22px', top: '-22px', opacity: 0 }} className="pointer-events-auto" />

      {/* Canto Superior Direito */}
      <Handle type="target" position={Position.Top} id="top-right-t" style={{ ...handleStyle, right: '-22px', top: '-22px' }} className="pointer-events-auto hover:scale-125 transition-transform" />
      <Handle type="source" position={Position.Top} id="top-right-s" style={{ ...handleStyle, right: '-22px', top: '-22px', opacity: 0 }} className="pointer-events-auto" />

      {/* Canto Inferior Esquerdo */}
      <Handle type="target" position={Position.Bottom} id="bottom-left-t" style={{ ...handleStyle, left: '-22px', bottom: '-22px' }} className="pointer-events-auto hover:scale-125 transition-transform" />
      <Handle type="source" position={Position.Bottom} id="bottom-left-s" style={{ ...handleStyle, left: '-22px', bottom: '-22px', opacity: 0 }} className="pointer-events-auto" />

      {/* Canto Inferior Direito */}
      <Handle type="target" position={Position.Bottom} id="bottom-right-t" style={{ ...handleStyle, right: '-22px', bottom: '-22px' }} className="pointer-events-auto hover:scale-125 transition-transform" />
      <Handle type="source" position={Position.Bottom} id="bottom-right-s" style={{ ...handleStyle, right: '-22px', bottom: '-22px', opacity: 0 }} className="pointer-events-auto" />
    </div>
  );
}

// -----------------------------------------------------------------
// 2. ÍCONE DE ROTAÇÃO NO CANTO INFERIOR ESQUERDO INTERNO
// -----------------------------------------------------------------
function BottomLeftRotateHandle({ onRotate, selected, strokeColor }) {
  if (!selected) return null;

  const handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const onMouseMove = (moveEvent) => {
      const nodeElem = e.target.closest('.react-flow__node');
      if (!nodeElem) return;

      const rect = nodeElem.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const radians = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      let degrees = Math.round(radians * (180 / Math.PI)) + 135;
      if (degrees < 0) degrees += 360;

      onRotate(degrees);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute left-2 bottom-2 z-40 cursor-grab active:cursor-grabbing p-1 bg-[#14141f]/90 rounded-full border border-purple-500/80 text-purple-300 hover:scale-125 hover:bg-purple-900 transition-all shadow-lg flex items-center justify-center text-xs select-none"
      title="Arraste para rotacionar"
      style={{ color: strokeColor }}
    >
      ↺
    </div>
  );
}

// -----------------------------------------------------------------
// 3. NÓ DE FORMAS CUSTOMIZADAS
// -----------------------------------------------------------------
function CustomShapeNode({ id, data, selected }) {
  const { shapeType, label, fillColor, noFill, strokeColor, strokeWidth, strokeStyle, rotation = 0 } = data;

  const strokeDash = strokeStyle === 'dashed' ? '6 4' : strokeStyle === 'dotted' ? '2 2' : 'none';
  const widthNum = parseInt(strokeWidth, 10) || 2;
  const fillVal = noFill ? 'none' : fillColor || '#181824';
  const strokeVal = strokeColor || '#7C3AED';

  const handleRotate = useCallback(
    (deg) => {
      if (data.onUpdateRotation) {
        data.onUpdateRotation(id, deg);
      }
    },
    [id, data]
  );

  return (
    <div
      className="group relative w-full h-full"
      style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center center' }}
    >
      {/* 1. Redimensionamento em cima da borda */}
      <NodeResizer
        minWidth={30}
        minHeight={30}
        isVisible={selected}
        lineClassName="border-blue-500"
        handleClassName="h-2.5 w-2.5 bg-white border border-blue-500 rounded-none z-40"
      />

      {/* 2. Rotação no canto inferior ESQUERDO */}
      <BottomLeftRotateHandle onRotate={handleRotate} selected={selected} strokeColor={strokeVal} />

      {/* 3. Conectores roxos afastados a 22px (8 Pontos) */}
      <ExternalHandles strokeColor={strokeVal} />

      {/* TEXTO LIVRE */}
      {shapeType === 'text' && (
        <div className="w-full h-full flex items-center justify-center p-1">
          <span className="text-base font-medium text-white block select-none text-center">
            {label || 'Texto Livre'}
          </span>
        </div>
      )}

      {/* CÍRCULO PERFEITO */}
      {shapeType === 'circle' && (
        <div className="w-full h-full flex items-center justify-center">
          <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <ellipse cx="50" cy="50" rx="46" ry="46" fill={fillVal} stroke={strokeVal} strokeWidth={widthNum} strokeDasharray={strokeDash} />
          </svg>
          <span className="relative z-10 text-xs font-semibold text-white px-2 text-center select-none pointer-events-none">
            {label}
          </span>
        </div>
      )}

      {/* LOSANGO */}
      {shapeType === 'diamond' && (
        <div className="w-full h-full flex items-center justify-center">
          <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="50,2 98,50 50,98 2,50" fill={fillVal} stroke={strokeVal} strokeWidth={widthNum} strokeDasharray={strokeDash} />
          </svg>
          <span className="relative z-10 text-xs font-semibold text-white px-4 text-center select-none pointer-events-none">
            {label}
          </span>
        </div>
      )}

      {/* RETÂNGULO PADRÃO */}
      {shapeType === 'rectangle' && (
        <div className="w-full h-full flex items-center justify-center">
          <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect x="2" y="2" width="96" height="96" rx="8" fill={fillVal} stroke={strokeVal} strokeWidth={widthNum} strokeDasharray={strokeDash} />
          </svg>
          <span className="relative z-10 text-xs font-semibold text-white px-3 text-center select-none pointer-events-none">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------
// 4. CARDS DE ENTIDADES DA HISTÓRIA
// -----------------------------------------------------------------
function EntityCardNode({ id, data, selected }) {
  const { title, type, category, rotation = 0 } = data;

  const handleRotate = useCallback(
    (deg) => {
      if (data.onUpdateRotation) {
        data.onUpdateRotation(id, deg);
      }
    },
    [id, data]
  );

  return (
    <div
      className={`group relative bg-[#14141f] border border-purple-500/60 rounded-xl p-3 shadow-2xl w-full h-full text-left space-y-1.5 transition-all ${
        selected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center center' }}
    >
      <NodeResizer minWidth={120} minHeight={50} isVisible={selected} lineClassName="border-blue-500" handleClassName="h-2.5 w-2.5 bg-white border border-blue-500 rounded-none z-40" />
      <BottomLeftRotateHandle onRotate={handleRotate} selected={selected} strokeColor="#a855f7" />
      <ExternalHandles strokeColor="#a855f7" />
      <strong className="block text-sm font-bold text-white select-none">{title}</strong>
      <span className={`inline-block border px-2 py-0.5 rounded text-[10px] font-medium ${getEntityBadgeTheme(type)}`}>
        {type || category}
      </span>
    </div>
  );
}

// -----------------------------------------------------------------
// COMPONENTE PRINCIPAL DO STORYBOARD
// -----------------------------------------------------------------
function StoryboardContent({ projectId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const [selectedTool, setSelectedTool] = useState('select');
  const [fillColor, setFillColor] = useState('#1a1d24');
  const [noFill, setNoFill] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#7C3AED');
  const [strokeWidth, setStrokeWidth] = useState('2px');
  const [strokeStyle, setStrokeStyle] = useState('solid');

  const [selectedNodeIds, setSelectedNodeIds] = useState([]);

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

  const onUpdateRotation = useCallback(
    (nodeId, deg) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                rotation: deg,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

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

  const onPaneClick = useCallback(
    (event) => {
      if (selectedTool === 'select') return;

      const newNode = {
        id: `shape-${Date.now()}`,
        type: 'customShape',
        position: { x: event.clientX - 320, y: event.clientY - 120 },
        style: { width: 120, height: 80 },
        zIndex: 1,
        data: {
          shapeType: selectedTool,
          label: selectedTool === 'text' ? 'Texto Livre' : '',
          fillColor,
          noFill,
          strokeColor,
          strokeWidth,
          strokeStyle,
          rotation: 0,
          onUpdateRotation,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedTool('select');
    },
    [selectedTool, fillColor, noFill, strokeColor, strokeWidth, strokeStyle, onUpdateRotation, setNodes]
  );

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
      style: { width: 180, height: 70 },
      zIndex: 2,
      data: {
        title: entity.name || entity.nome || entity.title,
        type: entity.type || category,
        category,
        rotation: 0,
        onUpdateRotation,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }

  function toggleCategory(cat) {
    setOpenEntityCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  return (
    <main className="storyboard-page relative w-full h-[calc(100vh-2rem)] overflow-hidden bg-[#0a0a0f] text-gray-200 flex">
      <style>{`
        .react-flow__panel.react-flow__attribution,
        .react-flow__attribution {
          display: none !important;
        }
        .react-flow__node {
          padding: 0 !important;
          border: none !important;
          background: transparent !important;
        }
      `}</style>

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
                    className="p-2 rounded bg-[#181824] border border-gray-800 text-[11px] text-gray-300 hover:border-purple-600 cursor-pointer"
                  >
                    ▲ Frente
                  </button>
                  <button
                    type="button"
                    onClick={() => changeZIndex('back')}
                    className="p-2 rounded bg-[#181824] border border-gray-800 text-[11px] text-gray-300 hover:border-purple-600 cursor-pointer"
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

export default function Storyboard({ projectId }) {
  return (
    <ReactFlowProvider>
      <StoryboardContent projectId={projectId} />
    </ReactFlowProvider>
  );
}