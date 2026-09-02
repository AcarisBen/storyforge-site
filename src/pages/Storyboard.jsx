import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import apiClient from '../api/apiClient';

// -----------------------------------------------------------------
// HELPER PARA CONVERTER HEX + OPACIDADE (%) EM RGBA
// -----------------------------------------------------------------
function hexToRgba(hex = '#181824', opacity = 100) {
  if (hex === 'none') return 'transparent';
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const alpha = Math.max(0, Math.min(100, opacity)) / 100;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Map de Tamanhos de Fonte
const FONT_SIZE_MAP = {
  'muito-pequeno': '10px',
  pequeno: '12px',
  medio: '14px',
  grande: '18px',
  gigante: '24px',
};

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
// 1. CONECTORES EM FORMA DE SETA NAS BORDAS
// -----------------------------------------------------------------
function ArrowDirectionalHandles() {
  const arrowStyle = {
    width: '16px',
    height: '16px',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: '0px',
    zIndex: 50,
  };

  return (
    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <Handle type="target" position={Position.Top} id="top-t" style={{ ...arrowStyle, top: '-18px' }} className="pointer-events-auto hover:scale-125 transition-transform flex items-center justify-center text-sky-400 font-bold text-xs select-none">↑</Handle>
      <Handle type="source" position={Position.Top} id="top-s" style={{ ...arrowStyle, top: '-18px', opacity: 0 }} className="pointer-events-auto" />

      <Handle type="target" position={Position.Right} id="right-t" style={{ ...arrowStyle, right: '-18px' }} className="pointer-events-auto hover:scale-125 transition-transform flex items-center justify-center text-sky-400 font-bold text-xs select-none">→</Handle>
      <Handle type="source" position={Position.Right} id="right-s" style={{ ...arrowStyle, right: '-18px', opacity: 0 }} className="pointer-events-auto" />

      <Handle type="target" position={Position.Bottom} id="bottom-t" style={{ ...arrowStyle, bottom: '-18px' }} className="pointer-events-auto hover:scale-125 transition-transform flex items-center justify-center text-sky-400 font-bold text-xs select-none">↓</Handle>
      <Handle type="source" position={Position.Bottom} id="bottom-s" style={{ ...arrowStyle, bottom: '-18px', opacity: 0 }} className="pointer-events-auto" />

      <Handle type="target" position={Position.Left} id="left-t" style={{ ...arrowStyle, left: '-18px' }} className="pointer-events-auto hover:scale-125 transition-transform flex items-center justify-center text-sky-400 font-bold text-xs select-none">←</Handle>
      <Handle type="source" position={Position.Left} id="left-s" style={{ ...arrowStyle, left: '-18px', opacity: 0 }} className="pointer-events-auto" />
    </div>
  );
}

// -----------------------------------------------------------------
// 2. MANIPULADORES DE ROTAÇÃO E CANTOS
// -----------------------------------------------------------------
function BottomRightRotateHandle({ onRotate, selected }) {
  if (!selected) return null;

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    const nodeElem = e.currentTarget.closest('.react-flow__node');
    if (!nodeElem) return;

    const rect = nodeElem.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const onMouseMove = (moveEvent) => {
      const radians = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      let degrees = Math.round(radians * (180 / Math.PI)) - 45;
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
    <div onMouseDown={handleMouseDown} className="nodrag nopan absolute -right-5 -bottom-5 z-50 cursor-grab active:cursor-grabbing p-1 bg-white border border-sky-400 rounded-full text-sky-500 hover:scale-125 transition-all shadow-md flex items-center justify-center text-[10px] select-none font-bold" title="Arraste para rotacionar">↻</div>
  );
}

function YellowCornerRadiusHandle({ onUpdateRadius, selected, currentRadius = 8 }) {
  if (!selected) return null;

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const startX = e.clientX;
    const startRadius = currentRadius;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newRadius = Math.max(0, Math.min(50, Math.round(startRadius + deltaX / 2)));
      onUpdateRadius(newRadius);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div onMouseDown={handleMouseDown} className="nodrag nopan absolute bottom-3 right-3 z-50 cursor-ew-resize w-2.5 h-2.5 bg-amber-400 border border-amber-600 rotate-45 shadow hover:scale-125 transition-transform" title="Arraste para arredondar os cantos" />
  );
}

function TriangleVertexHandle({ onUpdateOffset, selected }) {
  if (!selected) return null;

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    const nodeElem = e.currentTarget.closest('.react-flow__node');
    if (!nodeElem) return;

    const rect = nodeElem.getBoundingClientRect();

    const onMouseMove = (moveEvent) => {
      const relativeX = moveEvent.clientX - rect.left;
      const percentage = (relativeX / rect.width) * 100;
      const clampedOffset = Math.max(4, Math.min(96, Math.round(percentage)));
      onUpdateOffset(clampedOffset);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div onMouseDown={handleMouseDown} className="nodrag nopan absolute bottom-3 right-3 z-50 cursor-ew-resize w-2.5 h-2.5 bg-amber-400 border border-amber-600 rotate-45 shadow hover:scale-125 transition-transform" title="Arraste para alterar o vértice" />
  );
}

// -----------------------------------------------------------------
// 3. CAMPO DE TEXTO EDITÁVEL FORMATÁVEL
// -----------------------------------------------------------------
function EditableNodeText({ id, data, onUpdateData }) {
  const {
    label = '',
    textColor = '#ffffff',
    textOpacity = 100,
    fontSize = 'medio',
    fontFamily = 'Arial',
    isBold = false,
    isItalic = false,
    isUnderline = false,
    isStrike = false,
    textAlign = 'center',
    textVAlign = 'middle',
    textDirection = 'horizontal',
  } = data;

  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current && document.activeElement !== textRef.current) {
      textRef.current.innerText = label || '';
    }
  }, [label]);

  const handleInput = (e) => {
    const val = e.currentTarget.innerText;
    if (onUpdateData) {
      onUpdateData(id, { label: val });
    }
  };

  const handleFocus = () => {
    if (textRef.current) {
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(textRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const vAlignClass = textVAlign === 'top' ? 'items-start' : textVAlign === 'bottom' ? 'items-end' : 'items-center';
  const hAlignStyle = textAlign === 'left' ? 'text-left' : textAlign === 'right' ? 'text-right' : 'text-center';
  const textDecorations = [isUnderline ? 'underline' : '', isStrike ? 'line-through' : ''].filter(Boolean).join(' ');
  const isVertical = textDirection === 'vertical-lr' || textDirection === 'vertical-rl';

  return (
    <div className={`w-full h-full flex ${vAlignClass} justify-center p-1.5 pointer-events-auto relative z-20`}>
      <div
        ref={textRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        onKeyDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className={`nodrag nopan w-full h-full bg-transparent outline-none focus:ring-1 focus:ring-purple-500 rounded p-0.5 font-medium flex items-center justify-center overflow-hidden leading-tight ${hAlignStyle}`}
        style={{
          color: hexToRgba(textColor, textOpacity),
          fontSize: FONT_SIZE_MAP[fontSize] || '14px',
          fontFamily: fontFamily || 'Arial',
          fontWeight: isBold ? 'bold' : 'normal',
          fontStyle: isItalic ? 'italic' : 'normal',
          textDecoration: textDecorations || 'none',
          writingMode: isVertical ? textDirection : 'horizontal-tb',
          cursor: 'text',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      >
        {label}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// 4. RENDERIZADOR DE NÓS VETORIAIS
// -----------------------------------------------------------------
function CustomShapeNode({ id, data, selected }) {
  const {
    shapeType,
    fillColor = '#181824',
    fillOpacity = 100,
    noFill = false,
    strokeColor = '#7C3AED',
    strokeOpacity = 100,
    strokeWidth = '2px',
    strokeStyle = 'solid',
    arrowStartHead = 'none',
    arrowEndHead = 'triangle',
    rotation = 0,
    cornerRadius = 8,
    vertexOffset = 50,
  } = data;

  const strokeDash = strokeStyle === 'dashed' ? '6 4' : strokeStyle === 'dotted' ? '2 2' : 'none';
  const widthNum = strokeWidth === '0px' ? 0 : parseInt(strokeWidth, 10) || 2;
  const fillVal = noFill ? 'none' : hexToRgba(fillColor, fillOpacity);
  const strokeVal = widthNum === 0 ? 'none' : hexToRgba(strokeColor, strokeOpacity);

  const handleRotate = useCallback((deg) => {
    if (data.onUpdateData) data.onUpdateData(id, { rotation: deg });
  }, [id, data]);

  const handleRadiusChange = useCallback((r) => {
    if (data.onUpdateData) data.onUpdateData(id, { cornerRadius: r });
  }, [id, data]);

  const handleVertexOffsetChange = useCallback((offset) => {
    if (data.onUpdateData) data.onUpdateData(id, { vertexOffset: offset });
  }, [id, data]);

  const handleUpdateData = useCallback((nodeId, updatedProps) => {
    if (data.onUpdateData) data.onUpdateData(nodeId, updatedProps);
  }, [data]);

  return (
    <div className="group relative w-full h-full min-w-[30px] min-h-[30px] flex items-center justify-center" style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center center' }}>
      <NodeResizer minWidth={30} minHeight={30} isVisible={selected} lineClassName="border-sky-400 border-dashed" handleClassName="h-2.5 w-2.5 bg-sky-400 border border-white rounded-full z-40" />

      <BottomRightRotateHandle onRotate={handleRotate} selected={selected} />
      <ArrowDirectionalHandles />

      {shapeType === 'rectangle' && (
        <YellowCornerRadiusHandle onUpdateRadius={handleRadiusChange} selected={selected} currentRadius={cornerRadius} />
      )}

      {shapeType === 'text' && (
        <EditableNodeText id={id} data={data} onUpdateData={handleUpdateData} />
      )}

      {shapeType === 'circle' && (
        <div className="w-full h-full flex items-center justify-center relative">
          <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <ellipse cx="50" cy="50" rx="46" ry="46" fill={fillVal} stroke={strokeVal} strokeWidth={widthNum} strokeDasharray={strokeDash} />
          </svg>
          <EditableNodeText id={id} data={data} onUpdateData={handleUpdateData} />
        </div>
      )}

      {shapeType === 'diamond' && (
        <div className="w-full h-full flex items-center justify-center relative">
          <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="50,2 98,50 50,98 2,50" fill={fillVal} stroke={strokeVal} strokeWidth={widthNum} strokeDasharray={strokeDash} />
          </svg>
          <EditableNodeText id={id} data={data} onUpdateData={handleUpdateData} />
        </div>
      )}

      {shapeType === 'triangle' && (
        <>
          <TriangleVertexHandle onUpdateOffset={handleVertexOffsetChange} selected={selected} />
          <div className="w-full h-full flex items-center justify-center relative">
            <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points={`${vertexOffset},4 96,96 4,96`} fill={fillVal} stroke={strokeVal} strokeWidth={widthNum} strokeDasharray={strokeDash} />
            </svg>
            <EditableNodeText id={id} data={data} onUpdateData={handleUpdateData} />
          </div>
        </>
      )}

      {shapeType === 'arrow' && (
        <div className="w-full h-full flex items-center justify-center relative">
          <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <marker id={`start-triangle-${id}`} markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto"><polygon points="8 0, 0 4, 8 8" fill={strokeVal} /></marker>
              <marker id={`end-triangle-${id}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill={strokeVal} /></marker>

              <marker id={`start-circle-${id}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><circle cx="4" cy="4" r="3" fill={strokeVal} /></marker>
              <marker id={`end-circle-${id}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><circle cx="4" cy="4" r="3" fill={strokeVal} /></marker>

              <marker id={`start-square-${id}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><rect x="1" y="1" width="6" height="6" fill={strokeVal} /></marker>
              <marker id={`end-square-${id}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><rect x="1" y="1" width="6" height="6" fill={strokeVal} /></marker>

              <marker id={`start-diamond-${id}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><polygon points="4 0, 8 4, 4 8, 0 4" fill={strokeVal} /></marker>
              <marker id={`end-diamond-${id}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><polygon points="4 0, 8 4, 4 8, 0 4" fill={strokeVal} /></marker>
            </defs>

            <line x1="8" y1="50" x2="92" y2="50" stroke={strokeVal} strokeWidth={widthNum || 2} strokeDasharray={strokeDash} markerStart={arrowStartHead !== 'none' ? `url(#start-${arrowStartHead}-${id})` : undefined} markerEnd={arrowEndHead !== 'none' ? `url(#end-${arrowEndHead}-${id})` : undefined} />
          </svg>
        </div>
      )}

      {shapeType === 'rectangle' && (
        <div className="w-full h-full flex items-center justify-center relative">
          <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect x="2" y="2" width="96" height="96" rx={cornerRadius} ry={cornerRadius} fill={fillVal} stroke={strokeVal} strokeWidth={widthNum} strokeDasharray={strokeDash} />
          </svg>
          <EditableNodeText id={id} data={data} onUpdateData={handleUpdateData} />
        </div>
      )}
    </div>
  );
}

function EntityCardNode({ id, data, selected }) {
  const { title, type, category, rotation = 0 } = data;

  const handleRotate = useCallback((deg) => {
    if (data.onUpdateData) data.onUpdateData(id, { rotation: deg });
  }, [id, data]);

  return (
    <div className={`group relative bg-[#14141f] border border-purple-500/60 rounded-xl p-3 shadow-2xl w-full h-full text-left space-y-1.5 transition-all ${selected ? 'ring-2 ring-sky-400' : ''}`} style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center center' }}>
      <NodeResizer minWidth={120} minHeight={50} isVisible={selected} lineClassName="border-sky-400 border-dashed" handleClassName="h-2.5 w-2.5 bg-sky-400 border border-white rounded-full z-40" />
      <BottomRightRotateHandle onRotate={handleRotate} selected={selected} />
      <ArrowDirectionalHandles />
      <strong className="block text-sm font-bold text-white select-none">{title}</strong>
      <span className={`inline-block border px-2 py-0.5 rounded text-[10px] font-medium ${getEntityBadgeTheme(type)}`}>{type || category}</span>
    </div>
  );
}

// -----------------------------------------------------------------
// COMPONENTE PRINCIPAL DO STORYBOARD
// -----------------------------------------------------------------
function StoryboardContent({ projectId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const [selectedTool, setSelectedTool] = useState('select');

  // ESTADOS DE FORMATAÇÃO PADRÃO
  const [fillColor, setFillColor] = useState('#1a1d24');
  const [fillOpacity, setFillOpacity] = useState(100);
  const [noFill, setNoFill] = useState(false);

  const [strokeColor, setStrokeColor] = useState('#7C3AED');
  const [strokeOpacity, setStrokeOpacity] = useState(100);
  const [strokeWidth, setStrokeWidth] = useState('2px');
  const [strokeStyle, setStrokeStyle] = useState('solid');

  const [arrowStartHead, setArrowStartHead] = useState('none');
  const [arrowEndHead, setArrowEndHead] = useState('triangle');

  // FORMATAÇÃO DE TEXTO
  const [textColor, setTextColor] = useState('#ffffff');
  const [textOpacity, setTextOpacity] = useState(100);
  const [fontSize, setFontSize] = useState('medio');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [textAlign, setTextAlign] = useState('center');
  const [textVAlign, setTextVAlign] = useState('middle');
  const [textDirection, setTextDirection] = useState('horizontal');

  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);

  const isDrawingRef = useRef(false);
  const drawStartRef = useRef(null);
  const activeDrawNodeIdRef = useRef(null);

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

  const onUpdateData = useCallback((nodeId, updatedProps) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...updatedProps,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const nodeTypes = useMemo(() => ({ customShape: CustomShapeNode, entityNode: EntityCardNode }), []);

  useOnSelectionChange({
    onChange: ({ nodes: selNodes }) => {
      setSelectedNodes(selNodes);
      const ids = selNodes.map((n) => n.id);
      setSelectedNodeIds(ids);

      if (selNodes.length === 1) {
        const data = selNodes[0].data || {};
        if (data.fillColor !== undefined) setFillColor(data.fillColor);
        if (data.fillOpacity !== undefined) setFillOpacity(data.fillOpacity);
        if (data.noFill !== undefined) setNoFill(data.noFill);

        if (data.strokeColor !== undefined) setStrokeColor(data.strokeColor);
        if (data.strokeOpacity !== undefined) setStrokeOpacity(data.strokeOpacity);
        if (data.strokeWidth !== undefined) setStrokeWidth(data.strokeWidth);
        if (data.strokeStyle !== undefined) setStrokeStyle(data.strokeStyle);

        if (data.arrowStartHead !== undefined) setArrowStartHead(data.arrowStartHead);
        if (data.arrowEndHead !== undefined) setArrowEndHead(data.arrowEndHead);

        if (data.textColor !== undefined) setTextColor(data.textColor);
        if (data.textOpacity !== undefined) setTextOpacity(data.textOpacity);
        if (data.fontSize !== undefined) setFontSize(data.fontSize);
        if (data.fontFamily !== undefined) setFontFamily(data.fontFamily);
        if (data.isBold !== undefined) setIsBold(data.isBold);
        if (data.isItalic !== undefined) setIsItalic(data.isItalic);
        if (data.isUnderline !== undefined) setIsUnderline(data.isUnderline);
        if (data.isStrike !== undefined) setIsStrike(data.isStrike);
        if (data.textAlign !== undefined) setTextAlign(data.textAlign);
        if (data.textVAlign !== undefined) setTextVAlign(data.textVAlign);
        if (data.textDirection !== undefined) setTextDirection(data.textDirection);
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

  // MANIPULAÇÃO DE CAMADAS
  function changeZIndex(type) {
    if (selectedNodeIds.length === 0) return;
    setNodes((nds) => {
      const allZ = nds.map((n) => n.zIndex || 1);
      const maxZ = Math.max(...allZ, 1);
      const minZ = Math.min(...allZ, 1);

      return nds.map((node) => {
        if (selectedNodeIds.includes(node.id)) {
          const currentZ = node.zIndex || 1;
          let newZ = currentZ;
          if (type === 'front-top') newZ = maxZ + 10;
          else if (type === 'front-step') newZ = currentZ + 2;
          else if (type === 'back-step') newZ = Math.max(1, currentZ - 2);
          else if (type === 'back-bottom') newZ = Math.max(0, minZ - 10);
          return { ...node, zIndex: newZ };
        }
        return node;
      });
    });
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

  const handleMouseDownCanvas = (event) => {
    if (event.button !== 0 || selectedTool === 'select') return;

    const startPos = screenToFlowPosition({ x: event.clientX, y: event.clientY });

    isDrawingRef.current = true;
    drawStartRef.current = startPos;
    const newNodeId = `shape-${Date.now()}`;
    activeDrawNodeIdRef.current = newNodeId;

    const newNode = {
      id: newNodeId,
      type: 'customShape',
      position: startPos,
      style: { width: 20, height: 20 },
      zIndex: 1,
      data: {
        shapeType: selectedTool,
        label: selectedTool === 'text' ? 'Texto Livre' : '',
        fillColor,
        fillOpacity,
        noFill: selectedTool === 'arrow' ? true : noFill,
        strokeColor,
        strokeOpacity,
        strokeWidth,
        strokeStyle,
        arrowStartHead,
        arrowEndHead,
        textColor,
        textOpacity,
        fontSize,
        fontFamily,
        isBold,
        isItalic,
        isUnderline,
        isStrike,
        textAlign,
        textVAlign,
        textDirection,
        rotation: 0,
        cornerRadius: 8,
        vertexOffset: 50,
        onUpdateData,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const handleMouseMoveCanvas = (event) => {
    if (!isDrawingRef.current || !drawStartRef.current || !activeDrawNodeIdRef.current) return;

    const currentPos = screenToFlowPosition({ x: event.clientX, y: event.clientY });

    const startX = drawStartRef.current.x;
    const startY = drawStartRef.current.y;

    const width = Math.max(20, Math.abs(currentPos.x - startX));
    const height = Math.max(20, Math.abs(currentPos.y - startY));

    const newX = currentPos.x < startX ? startX - width : startX;
    const newY = currentPos.y < startY ? startY - height : startY;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === activeDrawNodeIdRef.current) {
          return {
            ...node,
            position: { x: newX, y: newY },
            style: { width, height },
          };
        }
        return node;
      })
    );
  };

  const handleMouseUpCanvas = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      drawStartRef.current = null;
      activeDrawNodeIdRef.current = null;
      setSelectedTool('select');
    }
  };

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
        console.error('Erro ao buscar entidades:', err);
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
        onUpdateData,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }

  function toggleCategory(cat) {
    setOpenEntityCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  // Checa se o item selecionado suporta edição de texto
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;
  const isTextSupported = selectedTool === 'text' || (selectedNode && selectedNode.type === 'customShape');
  const isArrowSelected = selectedNode && selectedNode.data?.shapeType === 'arrow';

  return (
    <main className="storyboard-page relative w-full h-[calc(100vh-2rem)] overflow-hidden bg-[#0a0a0f] text-gray-200 flex">
      <style>{`
        .react-flow__panel.react-flow__attribution,
        .react-flow__attribution { display: none !important; }
        .react-flow__node { padding: 0 !important; border: none !important; background: transparent !important; }
      `}</style>

      {/* PAINEL ESQUERDO DE FERRAMENTAS E FORMATAÇÃO */}
      <aside className={`relative z-20 h-full bg-[#12121a]/95 backdrop-blur border-r border-gray-800/80 transition-all duration-300 flex flex-col shrink-0 ${isLeftPanelOpen ? 'w-80' : 'w-12'}`}>
        <button type="button" onClick={() => setIsLeftPanelOpen((prev) => !prev)} className="absolute -right-3 top-4 w-6 h-6 rounded-full bg-[#1c1c28] border border-gray-700 text-gray-300 flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-purple-900 shadow-md z-30">
          {isLeftPanelOpen ? '‹' : '›'}
        </button>

        {isLeftPanelOpen ? (
          <div className="p-4 space-y-5 overflow-y-auto h-full custom-scrollbar">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">FERRAMENTAS</h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'select', label: 'Selecionar', icon: '➾' },
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
                    className={`w-16 h-14 flex flex-col items-center justify-center rounded-xl border transition-all cursor-pointer ${
                      selectedTool === tool.id
                        ? 'bg-purple-950/80 border-purple-500 text-purple-200 ring-1 ring-purple-500'
                        : 'bg-[#181824] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                    }`}
                  >
                    <span className="text-lg mb-0.5">{tool.icon}</span>
                    <span className="text-[9px] font-medium tracking-tight leading-none">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FORMATAÇÃO DE PREENCHIMENTO E BORDA */}
            <div className="space-y-4 pt-3 border-t border-gray-800/60">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">PREENCHIMENTO E BORDA</h3>

              {!isArrowSelected && (
                <div className="space-y-2 bg-[#161622] p-2.5 rounded-xl border border-gray-800/80">
                  <label className="text-xs font-semibold text-gray-300 block">Preenchimento</label>
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-8 h-8 rounded-lg border border-gray-700 overflow-hidden shrink-0 bg-[#1a1d24]">
                      <input
                        type="color"
                        value={fillColor}
                        disabled={noFill}
                        onChange={(e) => {
                          setFillColor(e.target.value);
                          updateSelectedNodesStyle('fillColor', e.target.value);
                        }}
                        className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer bg-transparent border-none"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>Opacidade</span>
                        <span>{fillOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        disabled={noFill}
                        value={fillOpacity}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFillOpacity(val);
                          updateSelectedNodesStyle('fillOpacity', val);
                        }}
                        className="w-full accent-purple-500 h-1 bg-gray-700 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={noFill}
                      onChange={(e) => {
                        setNoFill(e.target.checked);
                        updateSelectedNodesStyle('noFill', e.target.checked);
                      }}
                      className="w-3.5 h-3.5 rounded accent-purple-600 bg-[#181824] border-gray-700"
                    />
                    Sem preenchimento
                  </label>
                </div>
              )}

              {/* BORDA / LINHA */}
              <div className="space-y-2 bg-[#161622] p-2.5 rounded-xl border border-gray-800/80">
                <label className="text-xs font-semibold text-gray-300 block">Cor da Linha / Borda</label>
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-lg border border-gray-700 overflow-hidden shrink-0 bg-[#7C3AED]">
                    <input
                      type="color"
                      value={strokeColor}
                      onChange={(e) => {
                        setStrokeColor(e.target.value);
                        updateSelectedNodesStyle('strokeColor', e.target.value);
                      }}
                      className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer bg-transparent border-none"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Opacidade</span>
                      <span>{strokeOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={strokeOpacity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setStrokeOpacity(val);
                        updateSelectedNodesStyle('strokeOpacity', val);
                      }}
                      className="w-full accent-purple-500 h-1 bg-gray-700 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div>
                    <label className="text-[10px] font-medium text-gray-400 block mb-1">Espessura</label>
                    <select
                      value={strokeWidth}
                      onChange={(e) => {
                        setStrokeWidth(e.target.value);
                        updateSelectedNodesStyle('strokeWidth', e.target.value);
                      }}
                      className="w-full bg-[#14141f] border border-gray-800 rounded-lg p-2 text-xs text-gray-200"
                    >
                      <option value="0px">Nenhuma (0px)</option>
                      <option value="1px">Fina (1px)</option>
                      <option value="2px">Média (2px)</option>
                      <option value="3px">Grossa (3px)</option>
                      <option value="4px">Muito grossa (4px)</option>
                      <option value="6px">Extra grossa (6px)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-medium text-gray-400 block mb-1">Estilo</label>
                    <select
                      value={strokeStyle}
                      onChange={(e) => {
                        setStrokeStyle(e.target.value);
                        updateSelectedNodesStyle('strokeStyle', e.target.value);
                      }}
                      className="w-full bg-[#14141f] border border-gray-800 rounded-lg p-2 text-xs text-gray-200"
                    >
                      <option value="solid">Sólida</option>
                      <option value="dashed">Tracejada</option>
                      <option value="dotted">Pontilhada</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* FORMATAÇÃO ESPECÍFICA DE SETAS */}
              {isArrowSelected && (
                <div className="space-y-2 bg-[#161622] p-2.5 rounded-xl border border-gray-800/80">
                  <label className="text-xs font-semibold text-gray-300 block">Estilo de Pontas da Seta</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Ponta Inicial</label>
                      <select
                        value={arrowStartHead}
                        onChange={(e) => {
                          setArrowStartHead(e.target.value);
                          updateSelectedNodesStyle('arrowStartHead', e.target.value);
                        }}
                        className="w-full bg-[#14141f] border border-gray-800 rounded-lg p-1.5 text-xs text-gray-200"
                      >
                        <option value="none">Sem ponta</option>
                        <option value="triangle">Triangular</option>
                        <option value="circle">Redonda</option>
                        <option value="square">Quadrada</option>
                        <option value="diamond">Losango</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Ponta Final</label>
                      <select
                        value={arrowEndHead}
                        onChange={(e) => {
                          setArrowEndHead(e.target.value);
                          updateSelectedNodesStyle('arrowEndHead', e.target.value);
                        }}
                        className="w-full bg-[#14141f] border border-gray-800 rounded-lg p-1.5 text-xs text-gray-200"
                      >
                        <option value="none">Sem ponta</option>
                        <option value="triangle">Triangular</option>
                        <option value="circle">Redonda</option>
                        <option value="square">Quadrada</option>
                        <option value="diamond">Losango</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FORMATAÇÃO DE TEXTO */}
            {isTextSupported && (
              <div className="space-y-3 pt-3 border-t border-gray-800/60 bg-[#161622] p-3 rounded-xl border border-gray-800/80">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">FORMATAÇÃO DE TEXTO</h3>

                {/* ESTILOS DE FONTE: NEGRITO, ITÁLICO, SUBLINHADO, TACHADO */}
                <div className="flex gap-1.5 bg-[#12121a] p-1 rounded-xl border border-gray-800">
                  {[
                    { id: 'bold', label: 'B', active: isBold, key: 'isBold' },
                    { id: 'italic', label: 'I', active: isItalic, key: 'isItalic' },
                    { id: 'underline', label: 'U', active: isUnderline, key: 'isUnderline' },
                    { id: 'strike', label: 'S', active: isStrike, key: 'isStrike' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => {
                        const val = !btn.active;
                        if (btn.key === 'isBold') setIsBold(val);
                        if (btn.key === 'isItalic') setIsItalic(val);
                        if (btn.key === 'isUnderline') setIsUnderline(val);
                        if (btn.key === 'isStrike') setIsStrike(val);
                        updateSelectedNodesStyle(btn.key, val);
                      }}
                      className={`flex-1 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        btn.active
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {btn.id === 'bold' ? <strong>{btn.label}</strong> : btn.id === 'italic' ? <em>{btn.label}</em> : btn.id === 'underline' ? <u>{btn.label}</u> : <s>{btn.label}</s>}
                    </button>
                  ))}
                </div>

                {/* TAMANHO E TIPO DE FONTE */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Tamanho</label>
                    <select
                      value={fontSize}
                      onChange={(e) => {
                        setFontSize(e.target.value);
                        updateSelectedNodesStyle('fontSize', e.target.value);
                      }}
                      className="w-full bg-[#14141f] border border-gray-800 rounded-lg p-1.5 text-xs text-gray-200"
                    >
                      <option value="muito-pequeno">Muito pequeno</option>
                      <option value="pequeno">Pequeno</option>
                      <option value="medio">Médio</option>
                      <option value="grande">Grande</option>
                      <option value="gigante">Gigante</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Fonte</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => {
                        setFontFamily(e.target.value);
                        updateSelectedNodesStyle('fontFamily', e.target.value);
                      }}
                      className="w-full bg-[#14141f] border border-gray-800 rounded-lg p-1.5 text-xs text-gray-200"
                    >
                      <option value="Aptos">Aptos</option>
                      <option value="Arial">Arial</option>
                      <option value="Century Gothic">Century Gothic</option>
                      <option value="Comic Sans MS">Comic Sans</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                  </div>
                </div>

                {/* ALINHAMENTOS HORIZONTAL E VERTICAL */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Alinhamento H.</label>
                    <div className="flex bg-[#12121a] p-1 rounded-lg border border-gray-800">
                      {[
                        { id: 'left', icon: '⯇' },
                        { id: 'center', icon: '⯎' },
                        { id: 'right', icon: '⯈' },
                      ].map((align) => (
                        <button
                          key={align.id}
                          type="button"
                          onClick={() => {
                            setTextAlign(align.id);
                            updateSelectedNodesStyle('textAlign', align.id);
                          }}
                          className={`flex-1 text-xs p-1 rounded transition-all cursor-pointer ${
                            textAlign === align.id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {align.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Alinhamento V.</label>
                    <div className="flex bg-[#12121a] p-1 rounded-lg border border-gray-800">
                      {[
                        { id: 'top', icon: '▲' },
                        { id: 'middle', icon: '⯎' },
                        { id: 'bottom', icon: '▼' },
                      ].map((align) => (
                        <button
                          key={align.id}
                          type="button"
                          onClick={() => {
                            setTextVAlign(align.id);
                            updateSelectedNodesStyle('textVAlign', align.id);
                          }}
                          className={`flex-1 text-xs p-1 rounded transition-all cursor-pointer ${
                            textVAlign === align.id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {align.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* DIREÇÃO DE ESCRITA E COR DO TEXTO */}
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Direção da Escrita</label>
                    <select
                      value={textDirection}
                      onChange={(e) => {
                        setTextDirection(e.target.value);
                        updateSelectedNodesStyle('textDirection', e.target.value);
                      }}
                      className="w-full bg-[#14141f] border border-gray-800 rounded-lg p-1.5 text-xs text-gray-200"
                    >
                      <option value="horizontal">Horizontal (padrão)</option>
                      <option value="vertical-lr">Vertical (esq. para dir.)</option>
                      <option value="vertical-rl">Vertical (dir. para esq.)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Cor e Opacidade do Texto</label>
                    <div className="flex items-center gap-2">
                      <div className="relative w-7 h-7 rounded border border-gray-700 overflow-hidden shrink-0 bg-white">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => {
                            setTextColor(e.target.value);
                            updateSelectedNodesStyle('textColor', e.target.value);
                          }}
                          className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer bg-transparent border-none"
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={textOpacity}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTextOpacity(val);
                          updateSelectedNodesStyle('textOpacity', val);
                        }}
                        className="flex-1 accent-purple-500 h-1 bg-gray-700 rounded cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-gray-400 w-8 text-right">{textOpacity}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GERENCIAMENTO DE CAMADAS */}
            <div className="space-y-2 pt-3 border-t border-gray-800/60">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">CAMADAS</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => changeZIndex('front-top')}
                  className="p-2 rounded-xl bg-[#181824] border border-gray-800 text-[11px] text-gray-300 hover:border-purple-600 transition-all cursor-pointer font-medium"
                >
                  ▲ Trazer para frente
                </button>
                <button
                  type="button"
                  onClick={() => changeZIndex('front-step')}
                  className="p-2 rounded-xl bg-[#181824] border border-gray-800 text-[11px] text-gray-300 hover:border-purple-600 transition-all cursor-pointer font-medium"
                >
                  ↑ Mover para frente
                </button>
                <button
                  type="button"
                  onClick={() => changeZIndex('back-step')}
                  className="p-2 rounded-xl bg-[#181824] border border-gray-800 text-[11px] text-gray-300 hover:border-purple-600 transition-all cursor-pointer font-medium"
                >
                  ↓ Mover para trás
                </button>
                <button
                  type="button"
                  onClick={() => changeZIndex('back-bottom')}
                  className="p-2 rounded-xl bg-[#181824] border border-gray-800 text-[11px] text-gray-300 hover:border-purple-600 transition-all cursor-pointer font-medium"
                >
                  ▼ Enviar para trás
                </button>
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
      <div
        className="flex-1 h-full relative"
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          selectionMode={SelectionMode.Partial}
          panOnScroll
          panOnDrag={[2]}
          selectionOnDrag={selectedTool === 'select'}
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