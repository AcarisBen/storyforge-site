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
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import apiClient from '../api/apiClient';

// Helper para converter HEX + Opacidade (%) em RGBA (para Nós)
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

const FONT_SIZE_MAP = {
  'muito-pequeno': '10px',
  pequeno: '12px',
  medio: '14px',
  grande: '18px',
  gigante: '24px',
};

// EDGE/CONECTOR CUSTOMIZADO COM SUPORTE A OPACIDADE E BOTÃO DE EXCLUIR
function CustomDeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  markerStart,
  selected,
}) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{
          ...style,
          stroke: style.stroke || '#7C3AED',
          strokeOpacity: style.strokeOpacity !== undefined ? style.strokeOpacity : 1,
          strokeWidth: style.strokeWidth || 2,
          outline: selected ? '2px solid #38bdf8' : 'none',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {selected && (
            <button
              type="button"
              onClick={onEdgeClick}
              className="w-5 h-5 bg-red-600 hover:bg-red-500 border border-white text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md hover:scale-125 transition-transform cursor-pointer"
              title="Excluir Conexão"
            >
              ✕
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

// CORES E BADGES DE ENTIDADES
function getEntityBadgeTheme(category = '', type = '') {
  const sanitize = (str) =>
    String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const normCat = sanitize(category);
  const normType = sanitize(type);

  if (normCat.includes('personag') || normType.includes('personag')) {
    if (normType.includes('protagonista')) {
      return 'bg-orange-900/90 text-orange-200 border-orange-500 font-bold';
    }
    if (normType.includes('antagonista') || normType.includes('vilao')) {
      return 'bg-red-900/90 text-red-200 border-red-500 font-bold';
    }
    if (normType.includes('secundario') || normType.includes('coadjuvante')) {
      return 'bg-blue-900/90 text-blue-200 border-blue-400 font-bold';
    }
    return 'bg-purple-950/90 text-purple-300 border-purple-700/60 font-bold';
  }

  if (normCat.includes('mundo') || normType.includes('mundo')) {
    if (normType.includes('planeta')) return 'bg-blue-900/80 text-blue-200 border-blue-400 font-bold';
    if (normType.includes('pais')) return 'bg-emerald-900/80 text-emerald-200 border-emerald-400 font-bold';
    if (normType.includes('cidade')) return 'bg-cyan-900/80 text-cyan-200 border-cyan-400 font-bold';
    return 'bg-emerald-950/90 text-emerald-300 border-emerald-700/60 font-bold';
  }

  if (normCat.includes('cena')) return 'bg-amber-900/80 text-amber-200 border-amber-500 font-bold';
  if (normCat.includes('estrutura')) return 'bg-blue-900/80 text-blue-200 border-blue-500 font-bold';
  if (normCat.includes('misterio')) return 'bg-pink-900/80 text-pink-200 border-pink-500 font-bold';
  if (normCat.includes('twist') || normCat.includes('plot')) return 'bg-purple-900/80 text-purple-200 border-purple-500 font-bold';

  return 'bg-gray-800 text-gray-300 border-gray-600 font-bold';
}

// PONTOS DE CONEXÃO ESTÁVEIS
function ArrowDirectionalHandles() {
  const handleStyle = {
    width: '12px',
    height: '12px',
    backgroundColor: '#38bdf8',
    borderColor: '#ffffff',
    borderWidth: '1.5px',
    borderRadius: '50%',
    zIndex: 50,
  };

  return (
    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <Handle type="target" position={Position.Top} id="top-t" style={{ ...handleStyle, top: '-6px' }} className="pointer-events-auto hover:scale-125 transition-transform" />
      <Handle type="source" position={Position.Top} id="top-s" style={{ ...handleStyle, top: '-6px', opacity: 0 }} className="pointer-events-auto" />

      <Handle type="target" position={Position.Right} id="right-t" style={{ ...handleStyle, right: '-6px' }} className="pointer-events-auto hover:scale-125 transition-transform" />
      <Handle type="source" position={Position.Right} id="right-s" style={{ ...handleStyle, right: '-6px', opacity: 0 }} className="pointer-events-auto" />

      <Handle type="target" position={Position.Bottom} id="bottom-t" style={{ ...handleStyle, bottom: '-6px' }} className="pointer-events-auto hover:scale-125 transition-transform" />
      <Handle type="source" position={Position.Bottom} id="bottom-s" style={{ ...handleStyle, bottom: '-6px', opacity: 0 }} className="pointer-events-auto" />

      <Handle type="target" position={Position.Left} id="left-t" style={{ ...handleStyle, left: '-6px' }} className="pointer-events-auto hover:scale-125 transition-transform" />
      <Handle type="source" position={Position.Left} id="left-s" style={{ ...handleStyle, left: '-6px', opacity: 0 }} className="pointer-events-auto" />
    </div>
  );
}

// MANIPULADOR DE ROTAÇÃO
function BottomRightRotateHandle({ onRotate, selected, currentRotation = 0 }) {
  if (!selected) return null;

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    const nodeElem = e.currentTarget.closest('.react-flow__node');
    if (!nodeElem) return;

    const rect = nodeElem.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const initialMouseAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const initialNodeRotation = Number(currentRotation) || 0;

    const onMouseMove = (moveEvent) => {
      const currentMouseAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI);
      const angleDiff = currentMouseAngle - initialMouseAngle;
      
      let newAngle = initialNodeRotation + angleDiff;

      const step = moveEvent.shiftKey ? 45 : 15;
      newAngle = Math.round(newAngle / step) * step;

      const normalizedAngle = ((newAngle % 360) + 360) % 360;
      onRotate(normalizedAngle);
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
      className="nodrag nopan absolute -right-6 -bottom-6 z-50 cursor-grab active:cursor-grabbing p-1 bg-white border border-sky-400 rounded-full text-sky-500 hover:scale-125 transition-transform shadow-md flex items-center justify-center text-[11px] w-6 h-6 select-none font-bold"
      title="Arraste para rotacionar"
    >
      ↻
    </div>
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

function TopRightDeleteHandle({ onDelete, selected }) {
  if (!selected) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="nodrag nopan absolute -right-5 -top-5 z-50 p-1 bg-red-600 hover:bg-red-500 border border-white rounded-full text-white hover:scale-125 transition-all shadow-md flex items-center justify-center text-[10px] w-5 h-5 select-none font-bold cursor-pointer"
      title="Excluir forma"
    >
      ✕
    </button>
  );
}

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

  const vAlignClass =
    textVAlign === 'top'
      ? 'justify-start'
      : textVAlign === 'bottom'
      ? 'justify-end'
      : 'justify-center';

  const hAlignClass =
    textAlign === 'left'
      ? 'items-start text-left'
      : textAlign === 'right'
      ? 'items-end text-right'
      : 'items-center text-center';

  const textDecorations = [
    isUnderline ? 'underline' : '',
    isStrike ? 'line-through' : '',
  ].filter(Boolean).join(' ');

  const isVerticalRL = textDirection === 'vertical-rl';

  return (
    <div className={`w-full h-full flex flex-col ${vAlignClass} ${hAlignClass} p-1.5 pointer-events-auto relative z-20 overflow-hidden`}>
      <div
        ref={textRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="nodrag nopan max-w-full max-h-full bg-transparent outline-none focus:ring-1 focus:ring-purple-500 rounded p-0.5 font-medium leading-tight select-text"
        style={{
          color: hexToRgba(textColor, textOpacity),
          fontSize: FONT_SIZE_MAP[fontSize] || '14px',
          fontFamily: fontFamily || 'Arial',
          fontWeight: isBold ? 'bold' : 'normal',
          fontStyle: isItalic ? 'italic' : 'normal',
          textDecoration: textDecorations || 'none',
          writingMode: isVerticalRL ? 'vertical-rl' : 'horizontal-tb',
          direction: isVerticalRL ? 'rtl' : 'ltr',
          cursor: 'text',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      />
    </div>
  );
}

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

  const handleDeleteNode = useCallback(() => {
    if (data.onDeleteNode) data.onDeleteNode(id);
  }, [id, data]);

  return (
    <div className="group relative w-full h-full min-w-[30px] min-h-[30px] flex items-center justify-center">
      <NodeResizer minWidth={30} minHeight={30} isVisible={selected} lineClassName="border-sky-400 border-dashed" handleClassName="h-2.5 w-2.5 bg-sky-400 border border-white rounded-full z-40" />

      <TopRightDeleteHandle onDelete={handleDeleteNode} selected={selected} />
      <BottomRightRotateHandle onRotate={handleRotate} selected={selected} currentRotation={rotation} />
      <ArrowDirectionalHandles />

      <div className="w-full h-full flex items-center justify-center relative" style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center center' }}>
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
    </div>
  );
}

function EntityCardNode({ id, data, selected }) {
  const {
    title,
    type,
    category,
    rotation = 0,
    fillColor = '#14141f',
    fillOpacity = 100,
    noFill = false,
    strokeColor = '#7C3AED',
    strokeOpacity = 100,
    strokeWidth = '2px',
    strokeStyle = 'solid',
    textColor = '#ffffff',
    textOpacity = 100,
    fontSize = 'medio',
    fontFamily = 'Arial',
    isBold = false,
    isItalic = false,
    isUnderline = false,
    isStrike = false,
  } = data;

  const handleRotate = useCallback((deg) => {
    if (data.onUpdateData) data.onUpdateData(id, { rotation: deg });
  }, [id, data]);

  const handleDeleteNode = useCallback(() => {
    if (data.onDeleteNode) data.onDeleteNode(id);
  }, [id, data]);

  const bgStyle = noFill ? 'transparent' : hexToRgba(fillColor, fillOpacity);
  const borderStyleVal = strokeWidth === '0px' ? 'none' : strokeStyle;
  const borderColVal = strokeWidth === '0px' ? 'transparent' : hexToRgba(strokeColor, strokeOpacity);

  const textDecorations = [
    isUnderline ? 'underline' : '',
    isStrike ? 'line-through' : '',
  ].filter(Boolean).join(' ');

  const badgeTheme = getEntityBadgeTheme(category || '', type || title);

  return (
    <div className="group relative w-full h-full">
      <NodeResizer minWidth={140} minHeight={60} isVisible={selected} lineClassName="border-sky-400 border-dashed" handleClassName="h-2.5 w-2.5 bg-sky-400 border border-white rounded-full z-40" />
      <TopRightDeleteHandle onDelete={handleDeleteNode} selected={selected} />
      <BottomRightRotateHandle onRotate={handleRotate} selected={selected} currentRotation={rotation} />
      <ArrowDirectionalHandles />

      <div
        className={`rounded-xl p-3.5 shadow-2xl w-full h-full text-left flex flex-col justify-between ${
          selected ? 'ring-2 ring-sky-400' : ''
        }`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center center',
          backgroundColor: bgStyle,
          borderColor: borderColVal,
          borderWidth: strokeWidth,
          borderStyle: borderStyleVal,
        }}
      >
        <div className="pr-2 overflow-hidden">
          <strong
            className="block truncate select-none leading-tight"
            style={{
              color: hexToRgba(textColor, textOpacity),
              fontSize: FONT_SIZE_MAP[fontSize] || '14px',
              fontFamily: fontFamily || 'Arial',
              fontWeight: isBold ? 'bold' : 'normal',
              fontStyle: isItalic ? 'italic' : 'normal',
              textDecoration: textDecorations || 'none',
            }}
          >
            {title}
          </strong>
        </div>

        <div className="pt-2">
          <span className={`inline-block border px-2.5 py-0.5 rounded-md text-[10px] tracking-wide shadow-sm select-none ${badgeTheme}`}>
            {type || category}
          </span>
        </div>
      </div>
    </div>
  );
}

function StoryboardContent({ projectId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSaving, setIsSaving] = useState(false);
  const { screenToFlowPosition } = useReactFlow();

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const [selectedTool, setSelectedTool] = useState('select');

  const [fillColor, setFillColor] = useState('#1a1d24');
  const [fillOpacity, setFillOpacity] = useState(100);
  const [noFill, setNoFill] = useState(false);

  const [strokeColor, setStrokeColor] = useState('#7C3AED');
  const [strokeOpacity, setStrokeOpacity] = useState(100);
  const [strokeWidth, setStrokeWidth] = useState('2px');
  const [strokeStyle, setStrokeStyle] = useState('solid');

  const [arrowStartHead, setArrowStartHead] = useState('none');
  const [arrowEndHead, setArrowEndHead] = useState('triangle');

  const [textColor, setTextColor] = useState('#ffffff');
  const [textOpacity, setTextOpacity] = useState(100);
  const [fontSize, setFontSize] = useState('medio');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [textDirection, setTextDirection] = useState('horizontal');

  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState([]);

  const isDrawingRef = useRef(false);
  const drawStartRef = useRef(null);
  const activeDrawNodeIdRef = useRef(null);

  const onDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setSelectedNodeIds((prev) => prev.filter((id) => id !== nodeId));
  }, [setNodes]);

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

  const deleteSelectedItems = useCallback(() => {
    if (selectedNodeIds.length > 0) {
      setNodes((nds) => nds.filter((node) => !selectedNodeIds.includes(node.id)));
      setSelectedNodeIds([]);
    }
    if (selectedEdgeIds.length > 0) {
      setEdges((eds) => eds.filter((edge) => !selectedEdgeIds.includes(edge.id)));
      setSelectedEdgeIds([]);
    }
  }, [selectedNodeIds, selectedEdgeIds, setNodes, setEdges]);

  // ALINHAMENTO
  const alignNodes = useCallback((alignmentType) => {
    if (selectedNodeIds.length < 1) return;

    setNodes((prevNodes) => {
      const selected = prevNodes.filter((n) => selectedNodeIds.includes(n.id));
      if (selected.length === 0) return prevNodes;

      if (alignmentType === 'grid') {
        const GRID_SIZE = 20;
        return prevNodes.map((node) => {
          if (selectedNodeIds.includes(node.id)) {
            return {
              ...node,
              position: {
                x: Math.round(node.position.x / GRID_SIZE) * GRID_SIZE,
                y: Math.round(node.position.y / GRID_SIZE) * GRID_SIZE,
              },
            };
          }
          return node;
        });
      }

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

      selected.forEach((node) => {
        const w = node.measured?.width || parseInt(node.style?.width, 10) || 150;
        const h = node.measured?.height || parseInt(node.style?.height, 10) || 80;
        
        if (node.position.x < minX) minX = node.position.x;
        if (node.position.x + w > maxX) maxX = node.position.x + w;
        if (node.position.y < minY) minY = node.position.y;
        if (node.position.y + h > maxY) maxY = node.position.y + h;
      });

      const groupCenterX = minX + (maxX - minX) / 2;
      const groupCenterY = minY + (maxY - minY) / 2;

      if (alignmentType === 'distribute-h' && selected.length >= 3) {
        const sorted = [...selected].sort((a, b) => a.position.x - b.position.x);
        const totalWidth = sorted.reduce((sum, n) => sum + (n.measured?.width || parseInt(n.style?.width, 10) || 150), 0);
        const gap = (maxX - minX - totalWidth) / (sorted.length - 1);

        let currentX = minX;
        const posMap = new Map();
        sorted.forEach((n) => {
          posMap.set(n.id, currentX);
          const w = n.measured?.width || parseInt(n.style?.width, 10) || 150;
          currentX += w + gap;
        });

        return prevNodes.map((n) => posMap.has(n.id) ? { ...n, position: { ...n.position, x: posMap.get(n.id) } } : n);
      }

      if (alignmentType === 'distribute-v' && selected.length >= 3) {
        const sorted = [...selected].sort((a, b) => a.position.y - b.position.y);
        const totalHeight = sorted.reduce((sum, n) => sum + (n.measured?.height || parseInt(n.style?.height, 10) || 80), 0);
        const gap = (maxY - minY - totalHeight) / (sorted.length - 1);

        let currentY = minY;
        const posMap = new Map();
        sorted.forEach((n) => {
          posMap.set(n.id, currentY);
          const h = n.measured?.height || parseInt(n.style?.height, 10) || 80;
          currentY += h + gap;
        });

        return prevNodes.map((n) => posMap.has(n.id) ? { ...n, position: { ...n.position, y: posMap.get(n.id) } } : n);
      }

      return prevNodes.map((node) => {
        if (!selectedNodeIds.includes(node.id)) return node;

        const w = node.measured?.width || parseInt(node.style?.width, 10) || 150;
        const h = node.measured?.height || parseInt(node.style?.height, 10) || 80;

        let newX = node.position.x;
        let newY = node.position.y;

        switch (alignmentType) {
          case 'left': newX = minX; break;
          case 'right': newX = maxX - w; break;
          case 'center-h': newX = groupCenterX - w / 2; break;
          case 'top': newY = minY; break;
          case 'bottom': newY = maxY - h; break;
          case 'center-v': newY = groupCenterY - h / 2; break;
          default: break;
        }

        return { ...node, position: { x: newX, y: newY } };
      });
    });
  }, [selectedNodeIds, setNodes]);

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

  const nodeTypes = useMemo(() => ({ customShape: CustomShapeNode, entityNode: EntityCardNode }), []);
  const edgeTypes = useMemo(() => ({ customDeletable: CustomDeletableEdge }), []);

  useOnSelectionChange({
    onChange: ({ nodes: selNodes, edges: selEdges }) => {
      setSelectedNodes(selNodes);
      const nodeIds = selNodes.map((n) => n.id);
      const edgeIds = selEdges.map((e) => e.id);

      setSelectedNodeIds(nodeIds);
      setSelectedEdgeIds(edgeIds);

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
        if (data.textDirection !== undefined) setTextDirection(data.textDirection);
      } else if (selEdges.length === 1) {
        const edge = selEdges[0];
        if (edge.style?.stroke) setStrokeColor(edge.style.stroke);
        if (edge.style?.strokeOpacity !== undefined) setStrokeOpacity(Math.round(edge.style.strokeOpacity * 100));
        if (edge.style?.strokeWidth) setStrokeWidth(`${edge.style.strokeWidth}px`);
        setStrokeStyle(edge.animated ? 'dashed' : 'solid');
      }
    },
  });

  const updateSelectedStyle = useCallback(
    (key, value) => {
      // 1. Atualização para Nós
      if (selectedNodeIds.length > 0) {
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
      }

      // 2. Atualização para Conectores/Edges
      if (selectedEdgeIds.length > 0) {
        setEdges((eds) =>
          eds.map((edge) => {
            if (selectedEdgeIds.includes(edge.id)) {
              const updatedStyle = { ...edge.style };

              if (key === 'strokeColor') {
                updatedStyle.stroke = value;
              }

              if (key === 'strokeOpacity') {
                updatedStyle.strokeOpacity = Number(value) / 100;
              }

              if (key === 'strokeWidth') {
                updatedStyle.strokeWidth = parseInt(value, 10) || 2;
              }

              if (key === 'strokeStyle') {
                edge.animated = value === 'dashed';
              }

              return {
                ...edge,
                style: updatedStyle,
              };
            }
            return edge;
          })
        );
      }
    },
    [selectedNodeIds, selectedEdgeIds, setNodes, setEdges]
  );

  function changeZIndex(type) {
    if (selectedNodeIds.length === 0) return;

    setNodes((prevNodes) => {
      const selectedList = prevNodes.filter((n) => selectedNodeIds.includes(n.id));
      const unselectedList = prevNodes.filter((n) => !selectedNodeIds.includes(n.id));

      let updatedNodes = [];

      if (type === 'front-top') {
        const maxZ = Math.max(...prevNodes.map((n) => n.zIndex || 1), 1);
        updatedNodes = [
          ...unselectedList,
          ...selectedList.map((n) => ({
            ...n,
            zIndex: maxZ + 10,
            style: { ...n.style, zIndex: maxZ + 10 },
            data: { ...n.data },
          })),
        ];
      } else if (type === 'back-bottom') {
        updatedNodes = [
          ...selectedList.map((n) => ({
            ...n,
            zIndex: 0,
            style: { ...n.style, zIndex: 0 },
            data: { ...n.data },
          })),
          ...unselectedList,
        ];
      } else if (type === 'front-step') {
        updatedNodes = prevNodes.map((node) => {
          if (selectedNodeIds.includes(node.id)) {
            const currentZ = node.zIndex || 1;
            const newZ = currentZ + 5;
            return {
              ...node,
              zIndex: newZ,
              style: { ...node.style, zIndex: newZ },
              data: { ...node.data },
            };
          }
          return node;
        });
      } else if (type === 'back-step') {
        updatedNodes = prevNodes.map((node) => {
          if (selectedNodeIds.includes(node.id)) {
            const currentZ = node.zIndex || 1;
            const newZ = Math.max(0, currentZ - 5);
            return {
              ...node,
              zIndex: newZ,
              style: { ...node.style, zIndex: newZ },
              data: { ...node.data },
            };
          }
          return node;
        });
      }

      return [...updatedNodes];
    });
  }

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'customDeletable',
            animated: strokeStyle === 'dashed',
            style: {
              stroke: strokeColor,
              strokeOpacity: strokeOpacity / 100,
              strokeWidth: parseInt(strokeWidth, 10) || 2,
            },
          },
          eds
        )
      ),
    [setEdges, strokeColor, strokeOpacity, strokeWidth, strokeStyle]
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
        textDirection,
        rotation: 0,
        cornerRadius: 8,
        vertexOffset: 50,
        onUpdateData,
        onDeleteNode,
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

  // ==========================================
  // CARREGAR DADOS + STORYBOARD DO BACKEND
  // ==========================================
  useEffect(() => {
    if (!projectId) return;

    const fetchProjectEntities = async () => {
      try {
        const [resChars, resWorld, resStruct, resScenes, resMysteries, resTwists, resTimeline, resBoard] = await Promise.all([
          apiClient.get(`/entities/projects/${projectId}/characters`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/world`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/estrutura-dramatica/cards`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/scenes`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/mysteries`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/twists`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/ritmo-timeline/cards`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/storyboard`).catch(() => ({ data: { nodes: [], edges: [] } })),
        ]);

        setEntities({
          personagens: resChars.data || [],
          mundo: resWorld.data || [],
          cenas: resScenes.data || [],
          misterios: resMysteries.data || [],
          estrutura: resStruct.data || [],
          timeline: resTimeline.data || [],
          twists: resTwists.data || [],

        });

        // Restaura os Nós e Conexões salvos
        if (resBoard.data && Array.isArray(resBoard.data.nodes)) {
          const restoredNodes = resBoard.data.nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              onUpdateData,
              onDeleteNode,
            },
          }));
          setNodes(restoredNodes);
        }

        if (resBoard.data && Array.isArray(resBoard.data.edges)) {
          setEdges(resBoard.data.edges);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do Storyboard:', err);
      }
    };

    fetchProjectEntities();
  }, [projectId, onDeleteNode, onUpdateData, setNodes, setEdges]);

  // ==========================================
  // SALVAR STORYBOARD NO BACKEND
  // ==========================================
  const handleSaveStoryboard = useCallback(async () => {
    if (!projectId) return;
    setIsSaving(true);
    try {
      const cleanNodes = nodes.map(({ data, ...rest }) => {
        const { onUpdateData: _u, onDeleteNode: _d, ...cleanData } = data || {};
        return { ...rest, data: cleanData };
      });

      await apiClient.post(`/entities/projects/${projectId}/storyboard`, {
        nodes: cleanNodes,
        edges,
      });
    } catch (err) {
      console.error('Erro ao salvar Storyboard:', err);
    } finally {
      setIsSaving(false);
    }
  }, [projectId, nodes, edges]);

  // Auto-salvar no backend 1.5s após alterações
  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0) return;
    const timer = setTimeout(() => {
      handleSaveStoryboard();
    }, 1500);

    return () => clearTimeout(timer);
  }, [nodes, edges, handleSaveStoryboard]);

  function addEntityToCanvas(entity, category) {
    const entitySubtype =
      entity.type ||
      entity.role ||
      entity.papel ||
      entity.subType ||
      entity.archetype ||
      category;

    const newNode = {
      id: `entity-${Date.now()}`,
      type: 'entityNode',
      position: { x: 300 + Math.random() * 80, y: 150 + Math.random() * 80 },
      style: { width: 190, height: 80 },
      zIndex: 2,
      data: {
        title: entity.name || entity.nome || entity.title,
        type: entitySubtype,
        category,
        rotation: 0,
        fillColor: '#14141f',
        fillOpacity: 100,
        noFill: false,
        strokeColor: '#7C3AED',
        strokeOpacity: 100,
        strokeWidth: '2px',
        strokeStyle: 'solid',
        textColor: '#ffffff',
        textOpacity: 100,
        fontSize: 'medio',
        fontFamily: 'Arial',
        isBold: true,
        isItalic: false,
        isUnderline: false,
        isStrike: false,
        onUpdateData,
        onDeleteNode,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }

  function toggleCategory(cat) {
    setOpenEntityCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;
  const isTextSupported = selectedTool === 'text' || (selectedNode && (selectedNode.type === 'customShape' || selectedNode.type === 'entityNode'));
  const isArrowSelected = selectedNode && selectedNode.data?.shapeType === 'arrow';

  return (
    <main className="storyboard-page relative w-full h-[calc(100vh-2rem)] overflow-hidden bg-[#0a0a0f] text-gray-200 flex">
      <style>{`
        .react-flow__panel.react-flow__attribution,
        .react-flow__attribution { display: none !important; }
        .react-flow__node { padding: 0 !important; border: none !important; background: transparent !important; }
        
        .react-flow__controls {
          background-color: #14141f !important;
          border: 1px solid #1f2937 !important;
          border-radius: 12px !important;
          overflow: hidden !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
        }
        .react-flow__controls-button {
          background-color: #14141f !important;
          border-bottom: 1px solid #1f2937 !important;
          fill: #9ca3af !important;
          color: #9ca3af !important;
          width: 28px !important;
          height: 28px !important;
        }
        .react-flow__controls-button:hover {
          background-color: #1f1f2e !important;
          fill: #a855f7 !important;
          color: #a855f7 !important;
        }
        .react-flow__controls-button svg {
          fill: currentColor !important;
          width: 14px !important;
          height: 14px !important;
        }
      `}</style>

      {/* STATUS DE SALVAMENTO NO TOPO DO CANVAS */}
      <div className="absolute top-4 left-20 z-30 flex items-center gap-2 bg-[#12121a]/90 backdrop-blur border border-gray-800 px-3 py-1.5 rounded-xl shadow-lg text-xs font-semibold pointer-events-none">
        <span className={isSaving ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}>
          {isSaving ? '⏳ Salvando...' : '✓ Salvo no Banco'}
        </span>
      </div>

      {/* PAINEL ESQUERDO DE FERRAMENTAS E FORMATAÇÃO */}
      <aside className={`relative z-20 h-full bg-[#12121a]/95 backdrop-blur border-r border-gray-800/80 transition-all duration-300 flex flex-col shrink-0 ${isLeftPanelOpen ? 'w-80' : 'w-12'}`}>
        <button type="button" onClick={() => setIsLeftPanelOpen((prev) => !prev)} className="absolute -right-3 top-4 w-6 h-6 rounded-full bg-[#1c1c28] border border-gray-700 text-gray-300 flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-purple-900 shadow-md z-30">
          {isLeftPanelOpen ? '‹' : '›'}
        </button>

        {isLeftPanelOpen ? (
          <div className="p-4 space-y-5 overflow-y-auto h-full custom-scrollbar flex flex-col justify-between">
            <div className="space-y-5">
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

              {/* SEÇÃO DE ALINHAMENTO E GRADE */}
              <div className="space-y-3 pt-3 border-t border-gray-800/60">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">ALINHAMENTO E GRADE</h3>
                
                <div className="grid grid-cols-3 gap-1.5 bg-[#161622] p-2 rounded-xl border border-gray-800/80">
                  <button type="button" onClick={() => alignNodes('left')} disabled={selectedNodeIds.length < 1} title="Alinhar à Esquerda" className="p-2 rounded bg-[#12121a] hover:bg-purple-900/50 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center justify-center">⇤ Esq</button>
                  <button type="button" onClick={() => alignNodes('center-h')} disabled={selectedNodeIds.length < 1} title="Centralizar Horizontalmente" className="p-2 rounded bg-[#12121a] hover:bg-purple-900/50 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center justify-center">⇥ Hor ⇤</button>
                  <button type="button" onClick={() => alignNodes('right')} disabled={selectedNodeIds.length < 1} title="Alinhar à Direita" className="p-2 rounded bg-[#12121a] hover:bg-purple-900/50 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center justify-center">Dir ⇥</button>

                  <button type="button" onClick={() => alignNodes('top')} disabled={selectedNodeIds.length < 1} title="Alinhar ao Topo" className="p-2 rounded bg-[#12121a] hover:bg-purple-900/50 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center justify-center">⤒ Topo</button>
                  <button type="button" onClick={() => alignNodes('center-v')} disabled={selectedNodeIds.length < 1} title="Centralizar Verticalmente" className="p-2 rounded bg-[#12121a] hover:bg-purple-900/50 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center justify-center">⤓ Ver ⤒</button>
                  <button type="button" onClick={() => alignNodes('bottom')} disabled={selectedNodeIds.length < 1} title="Alinhar à Base" className="p-2 rounded bg-[#12121a] hover:bg-purple-900/50 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center justify-center">⤓ Base</button>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button type="button" onClick={() => alignNodes('distribute-h')} disabled={selectedNodeIds.length < 3} title="Espaçar Igualmente na Horizontal (Min. 3)" className="p-1.5 rounded bg-[#181824] border border-gray-800 hover:border-purple-600 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-semibold">Distr. Hor</button>
                  <button type="button" onClick={() => alignNodes('distribute-v')} disabled={selectedNodeIds.length < 3} title="Espaçar Igualmente na Vertical (Min. 3)" className="p-1.5 rounded bg-[#181824] border border-gray-800 hover:border-purple-600 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-semibold">Distr. Ver</button>
                  <button type="button" onClick={() => alignNodes('grid')} disabled={selectedNodeIds.length < 1} title="Ajustar posição à grade (20px)" className="p-1.5 rounded bg-purple-950/60 border border-purple-800/80 hover:bg-purple-900 text-purple-200 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-bold">Grade ⩤⩥</button>
                </div>
              </div>

             {/* FORMATAÇÃO DE PREENCHIMENTO E BORDA / LINHA */}
<div className="space-y-4 pt-3 border-t border-gray-800/60">
  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
    {selectedEdgeIds.length > 0 ? 'ESTILO DA CONEXÃO' : 'PREENCHIMENTO E BORDA'}
  </h3>

  {/* 1. QUADRADO E CONTROLES DE PREENCHIMENTO */}
  {selectedEdgeIds.length === 0 && !isArrowSelected && (
    <div className="space-y-2 bg-[#161622] p-2.5 rounded-xl border border-gray-800/80">
      <label className="text-xs font-semibold text-gray-300 block">Preenchimento</label>
      <div className="flex items-center gap-2.5">
        <div 
          className="relative w-8 h-8 rounded-lg border border-gray-700 overflow-hidden shrink-0 transition-colors"
          style={{ backgroundColor: noFill ? 'transparent' : fillColor }}
        >
          <input
            type="color"
            value={fillColor}
            disabled={noFill}
            onChange={(e) => {
              setFillColor(e.target.value);
              updateSelectedStyle('fillColor', e.target.value);
            }}
            className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0"
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
              updateSelectedStyle('fillOpacity', val);
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
            updateSelectedStyle('noFill', e.target.checked);
          }}
          className="w-3.5 h-3.5 rounded accent-purple-600 bg-[#181824] border-gray-700"
        />
        Sem preenchimento
      </label>
    </div>
  )}

  {/* 2. QUADRADO E CONTROLES DE COR DA BORDA / LINHA */}
  <div className="space-y-2 bg-[#161622] p-2.5 rounded-xl border border-gray-800/80">
    <label className="text-xs font-semibold text-gray-300 block">
      {selectedEdgeIds.length > 0 ? 'Cor da Linha' : 'Cor da Borda'}
    </label>
    <div className="flex items-center gap-2.5">
      {/* QUADRADINHO DA COR DA BORDA/LINHA CORRIGIDO */}
      <div 
        className="relative w-8 h-8 rounded-lg border border-gray-700 overflow-hidden shrink-0 transition-colors"
        style={{ backgroundColor: strokeColor }}
      >
        <input
          type="color"
          value={strokeColor}
          onChange={(e) => {
            setStrokeColor(e.target.value);
            updateSelectedStyle('strokeColor', e.target.value);
          }}
          className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0"
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
            updateSelectedStyle('strokeOpacity', val);
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
            updateSelectedStyle('strokeWidth', e.target.value);
          }}
          className="w-full bg-[#14141f] border border-gray-800 rounded-lg p-2 text-xs text-gray-200"
        >
          {selectedEdgeIds.length === 0 && <option value="0px">Nenhuma (0px)</option>}
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
            updateSelectedStyle('strokeStyle', e.target.value);
          }}
          className="w-full bg-[#14141f] border border-gray-800 rounded-lg p-2 text-xs text-gray-200"
        >
          <option value="solid">Sólida</option>
          <option value="dashed">Tracejada / Animada</option>
          {selectedEdgeIds.length === 0 && <option value="dotted">Pontilhada</option>}
        </select>
      </div>
    </div>
  </div>
</div>

              {/* FORMATAÇÃO DE TEXTO */}
              {isTextSupported && selectedEdgeIds.length === 0 && (
                <div className="space-y-3 pt-3 border-t border-gray-800/60 bg-[#161622] p-3 rounded-xl border border-gray-800/80">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">FORMATAÇÃO DE TEXTO</h3>

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
                          updateSelectedStyle(btn.key, val);
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

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Tamanho</label>
                      <select
                        value={fontSize}
                        onChange={(e) => {
                          setFontSize(e.target.value);
                          updateSelectedStyle('fontSize', e.target.value);
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
                          updateSelectedStyle('fontFamily', e.target.value);
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
                </div>
              )}

              {/* GERENCIAMENTO DE CAMADAS */}
              {selectedEdgeIds.length === 0 && (
                <div className="space-y-2 pt-3 border-t border-gray-800/60">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">CAMADAS</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => changeZIndex('front-top')} className="p-2 rounded-xl bg-[#181824] border border-gray-800 text-[11px] text-gray-300 hover:border-purple-600 transition-all cursor-pointer font-medium">▲ Trazer para frente</button>
                    <button type="button" onClick={() => changeZIndex('front-step')} className="p-2 rounded-xl bg-[#181824] border border-gray-800 text-[11px] text-gray-300 hover:border-purple-600 transition-all cursor-pointer font-medium">↑ Mover para frente</button>
                    <button type="button" onClick={() => changeZIndex('back-step')} className="p-2 rounded-xl bg-[#181824] border border-gray-800 text-[11px] text-gray-300 hover:border-purple-600 transition-all cursor-pointer font-medium">↓ Mover para trás</button>
                    <button type="button" onClick={() => changeZIndex('back-bottom')} className="p-2 rounded-xl bg-[#181824] border border-gray-800 text-[11px] text-gray-300 hover:border-purple-600 transition-all cursor-pointer font-medium">▼ Enviar para trás</button>
                  </div>
                </div>
              )}
            </div>

            {/* BOTÃO DE EXCLUIR */}
            <div className="pt-4 border-t border-gray-800/60 mt-auto">
              <button
                type="button"
                onClick={deleteSelectedItems}
                disabled={selectedNodeIds.length === 0 && selectedEdgeIds.length === 0}
                className={`w-full p-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  selectedNodeIds.length > 0 || selectedEdgeIds.length > 0
                    ? 'bg-red-900/40 border border-red-600/60 text-red-300 hover:bg-red-800/60 shadow-lg'
                    : 'bg-gray-800/30 border border-gray-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                <span>🗑</span> Excluir Selecionado(s)
              </button>
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
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          selectionMode={SelectionMode.Partial}
          snapToGrid={true}
          snapGrid={[20, 20]}
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
                { key: 'timeline', label: 'Ritmo & Timeline', color: 'bg-cyan-500' },
                { key: 'cenas', label: 'Cenas', color: 'bg-amber-500' },
                { key: 'misterios', label: 'Mistérios', color: 'bg-pink-500' },
                { key: 'twists', label: 'Plot Twists', color: 'bg-purple-500' },
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