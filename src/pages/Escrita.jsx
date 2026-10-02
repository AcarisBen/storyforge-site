// src/pages/Escrita.jsx
// Página de Escrita do Projeto com Ícone de Exclamação no Guia do Módulo e Proteção de Offset de Correção

import React, { useState, useEffect, useRef } from 'react';

import apiClient from '../api/apiClient';
import { analyzeCustomGrammarRules } from '../lib/writing/customGrammarRules';
import { useToast } from '../hooks/useToast';

import { 
  Target, 
  Lightbulb, 
  BookOpen, 
  HelpCircle, 
  AlertCircle,
  ChevronUp, 
  ChevronDown,
  Sparkles,
  Copy,
  Check,
  Trash2,
  GripVertical,
  Eraser,
  User,
  Globe,
  GitBranch,
  Activity,
  Clapperboard,
  Search,
  Zap,
  Eye,
  X,
  Plus
} from 'lucide-react';

const chapterTypes = ['Prólogo', 'Capítulo', 'Cena', 'Ato', 'Parte', 'Epílogo'];

const guideTabs = {
  Objetivo: (
    <p>Produzir o texto final da obra, capítulo por capítulo, com apoio do programa.</p>
  ),
  Dicas: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>Use os elementos já criados (personagens, cenas, mundo) como base para a escrita.</li>
      <li>Abra os itens de Apoio Visual na seção inferior para consultar suas ideias com espaço de sobra.</li>
    </ul>
  ),
  Exemplos: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>Capítulo 1: Abertura que apresenta o protagonista e o mundo.</li>
      <li>Capítulo 2: Incidente incitante que inicia a jornada.</li>
    </ul>
  ),
  Perguntas: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>Qual é o foco deste capítulo?</li>
      <li>Quais elementos da pré-produção se encaixam aqui?</li>
      <li>O ritmo deste capítulo serve ao conjunto da obra?</li>
    </ul>
  ),
};

function getStyleForSuggestion(sug) {
  const existingBadge = sug.badgeStyle || '';
  const label = (sug.label || '').toLowerCase();
  const catId = (sug.rule?.category?.id || sug.rule?.category?.name || sug.category || '').toUpperCase();
  const ruleId = (sug.rule?.id || '').toUpperCase();
  const issueType = (sug.rule?.issueType || '').toLowerCase();

  let color = 'purple'; // Padrão para Gramática Geral, Wikipédia, Estilo, Sintaxe, etc.

  // 1. Se a sugestão já veio com cor explícita na badge (regras customizadas)
  if (existingBadge.includes('lime')) color = 'lime';
  else if (existingBadge.includes('amber') || existingBadge.includes('orange')) color = 'amber';
  else if (existingBadge.includes('emerald') || existingBadge.includes('green')) color = 'emerald';
  else if (existingBadge.includes('red')) color = 'red';
  else if (existingBadge.includes('purple')) color = 'purple';
  else {
    // 2. Mapeamento inteligente para categorias do LanguageTool
    if (
      label.includes('hifen') ||
      label.includes('prefix') ||
      catId.includes('HYPHEN') ||
      catId.includes('COMPOUNDING') ||
      ruleId.includes('PORTUGUESE_HIFEN')
    ) {
      color = 'lime';
    } else if (
      label.includes('pontua') ||
      label.includes('virgula') ||
      catId.includes('PUNCTUATION')
    ) {
      color = 'amber';
    } else if (
      label.includes('concord') ||
      catId.includes('AGREEMENT')
    ) {
      color = 'emerald';
    } else if (
      label.includes('ortograf') ||
      label.includes('escrita') ||
      catId.includes('TYPOS') ||
      catId.includes('SPELLING') ||
      ruleId.includes('HUNSPELL') ||
      issueType === 'misspelling'
    ) {
      color = 'red';
    } else {
      color = 'purple';
    }
  }

  const stylesMap = {
    lime: {
      defaultLabel: 'Hifenização / Prefixos',
      badgeStyle: 'bg-lime-900/60 text-lime-300 border-lime-500/50',
      highlightStyle: 'bg-lime-500/20 text-lime-200 border-b-2 border-lime-500 border-dashed rounded px-0.5 cursor-pointer',
    },
    amber: {
      defaultLabel: 'Pontuação',
      badgeStyle: 'bg-amber-900/60 text-amber-300 border-amber-500/50',
      highlightStyle: 'bg-amber-500/20 text-amber-200 border-b-2 border-amber-500 border-dashed rounded px-0.5 cursor-pointer',
    },
    emerald: {
      defaultLabel: 'Concordância',
      badgeStyle: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50',
      highlightStyle: 'bg-emerald-500/20 text-emerald-200 border-b-2 border-emerald-500 border-dashed rounded px-0.5 cursor-pointer',
    },
    red: {
      defaultLabel: 'Erro Ortográfico',
      badgeStyle: 'bg-red-900/60 text-red-300 border-red-500/50',
      highlightStyle: 'bg-red-500/20 text-red-200 border-b-2 border-red-500 border-dashed rounded px-0.5 cursor-pointer',
    },
    purple: {
      defaultLabel: 'Gramática Geral',
      badgeStyle: 'bg-purple-900/60 text-purple-300 border-purple-500/50',
      highlightStyle: 'bg-purple-500/20 text-purple-200 border-b-2 border-purple-500 border-dashed rounded px-0.5 cursor-pointer',
    },
  };

  const selectedStyle = stylesMap[color] || stylesMap.purple;

  return {
    label: sug.label || selectedStyle.defaultLabel,
    badgeStyle: selectedStyle.badgeStyle,
    highlightStyle: selectedStyle.highlightStyle,
  };
}


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

function getTimelineBadgeStyle(type = '') {
  const norm = String(type).toLowerCase();
  if (norm.includes('incitante')) return 'bg-purple-900/60 text-purple-300 border-purple-500/50';
  if (norm.includes('1º ponto') || norm.includes('virada')) return 'bg-blue-900/60 text-blue-300 border-blue-500/50';
  if (norm.includes('midpoint')) return 'bg-cyan-900/60 text-cyan-300 border-cyan-500/50';
  if (norm.includes('crise')) return 'bg-amber-900/60 text-amber-300 border-amber-500/50';
  if (norm.includes('clímax') || norm.includes('climax')) return 'bg-red-900/60 text-red-300 border-red-500/50';
  if (norm.includes('resolução') || norm.includes('resolucao')) return 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50';
  if (norm.includes('epílogo') || norm.includes('epilogo')) return 'bg-pink-900/60 text-pink-300 border-pink-500/50';
  return 'bg-purple-950/80 text-purple-300 border-purple-800/40';
}

function getFrameworkBadgeStyle(type = '') {
  const norm = String(type).toLowerCase().trim();
  if (norm.includes('3 atos')) return 'bg-purple-900/60 text-purple-300 border-purple-500/50';
  if (norm.includes('8 sequências') || norm.includes('sequencias')) return 'bg-blue-900/60 text-blue-300 border-blue-500/50';
  if (norm.includes('jornada')) return 'bg-amber-900/60 text-amber-300 border-amber-500/50';
  if (norm.includes('story circle')) return 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50';
  if (norm.includes('save the cat')) return 'bg-orange-900/60 text-orange-300 border-orange-500/50';
  if (norm.includes('freytag')) return 'bg-red-900/60 text-red-300 border-red-500/50';
  return 'bg-purple-950/80 text-purple-300 border-purple-800/40';
}

function getCharacterBadgeStyle(type = '') {
  const normalized = String(type).toLowerCase().trim();
  if (normalized.includes('protagonista')) {
    return 'bg-purple-900/60 text-purple-300 border-purple-500/50';
  }
  if (normalized.includes('antagonista')) {
    return 'bg-red-900/60 text-red-300 border-red-500/50';
  }
  if (normalized.includes('secundario') || normalized.includes('secundário')) {
    return 'bg-blue-900/60 text-blue-300 border-blue-500/50';
  }
  return 'bg-gray-800 text-gray-300 border-gray-700';
}

// Mapeamento centralizado de ícones e cores do Guia do Módulo
const GUIDE_TAB_CONFIG = {
  Objetivo: { Icon: Target, color: 'text-red-400' },
  Dicas: { Icon: Lightbulb, color: 'text-amber-400' },
  Exemplos: { Icon: BookOpen, color: 'text-purple-400' },
  Perguntas: { Icon: HelpCircle, color: 'text-orange-400' },
};

function EscritaGuide() {
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

/**
 * Função utilitária estrita para localizar a posição DOM exata baseada em OFFSET + LENGTH.
 * Mapeia quebras de parágrafos como espaços para manter sincronia 1:1 com o texto analisado.
 * Protege contra erros de marcação em palavras anteriores que possuam a mesma letra/subtermo.
 */
function getRangeForSuggestion(editorElem, sug) {
  if (!editorElem || !sug || !sug.original) return null;

  editorElem.normalize();

  const targetText = sug.original;
  const targetOffset = typeof sug.offset === 'number' ? sug.offset : -1;
  const targetLen = sug.length || targetText.length;

  const walker = document.createTreeWalker(
    editorElem,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let fullTextContent = '';
  const nodeRanges = [];
  let node;
  let lastParentBlock = null;

  const isBlock = (el) => el && /^(P|DIV|H[1-6]|LI|BLOCKQUOTE|BR)$/i.test(el.tagName);

  while ((node = walker.nextNode())) {
    let parentBlock = node.parentElement;
    while (parentBlock && parentBlock !== editorElem && !isBlock(parentBlock)) {
      parentBlock = parentBlock.parentElement;
    }

    if (lastParentBlock && parentBlock !== lastParentBlock) {
      if (fullTextContent.length > 0 && !/\s$/.test(fullTextContent)) {
        fullTextContent += ' ';
      }
    }
    lastParentBlock = parentBlock;

    const start = fullTextContent.length;
    fullTextContent += node.nodeValue;
    const end = fullTextContent.length;

    nodeRanges.push({ node, start, end });
  }

  if (nodeRanges.length === 0) return null;

  const createRangeFromIndices = (startIndex, endIndex) => {
    let startNode = null, startOff = 0;
    let endNode = null, endOff = 0;

    for (const nr of nodeRanges) {
      if (!startNode && startIndex >= nr.start && startIndex <= nr.end) {
        startNode = nr.node;
        startOff = Math.max(0, startIndex - nr.start);
      }
      if (endIndex >= nr.start && endIndex <= nr.end) {
        endNode = nr.node;
        endOff = Math.min(nr.node.nodeValue.length, endIndex - nr.start);
        break;
      }
    }

    if (startNode && endNode) {
      try {
        const range = document.createRange();
        range.setStart(startNode, Math.min(startOff, startNode.nodeValue.length));
        range.setEnd(endNode, Math.min(endOff, endNode.nodeValue.length));
        return range;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // 1. Checagem direta pelo offset exato
  if (targetOffset >= 0 && targetOffset + targetLen <= fullTextContent.length) {
    const sub = fullTextContent.substring(targetOffset, targetOffset + targetLen);
    if (sub === targetText) {
      const range = createRangeFromIndices(targetOffset, targetOffset + targetLen);
      if (range) return range;
    }
  }

  // 2. Busca pela ocorrência mais próxima do offset em caso de pequenas variações
  const occurrences = [];
  let idx = fullTextContent.indexOf(targetText);
  while (idx !== -1) {
    occurrences.push(idx);
    idx = fullTextContent.indexOf(targetText, idx + 1);
  }

  if (occurrences.length === 0) return null;

  let bestIdx = occurrences[0];
  if (targetOffset >= 0) {
    let minDiff = Infinity;
    for (const pos of occurrences) {
      const diff = Math.abs(pos - targetOffset);
      if (diff < minDiff) {
        minDiff = diff;
        bestIdx = pos;
      }
    }
  }

  return createRangeFromIndices(bestIdx, bestIdx + targetText.length);
}

function createGrammarDecorations(doc, suggestions) {
  const decorations = [];

  suggestions.forEach((suggestion) => {
    const from = suggestion.offset;
    const to = suggestion.offset + suggestion.length;

    decorations.push(
      Decoration.inline(from, to, {
        class: suggestion.highlightStyle || 'border-b-2 border-purple-500 border-dashed',
        'data-suggestion-id': suggestion.id,
      })
    );
  });

  return DecorationSet.create(doc, decorations);
}

export default function Escrita({ projectId, onNavigate }) {
  const { showToast } = useToast();

  const [chapters, setChapters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Capítulo');
  const [draggedId, setDraggedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showCorrectionsPanel, setShowCorrectionsPanel] = useState(true);
  const [activeModalSuggestion, setActiveModalSuggestion] = useState(null);
  
  const ignoredSuggestionsRef = useRef(new Map());
  const editorRef = useRef(null);
  const grammarTimeoutRef = useRef(null);
  const updateTimeoutRef = useRef({});

  const getSugKey = (sug) => `${sug.original}_${sug.offset}_${sug.label}`;

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    subscript: false,
    superscript: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  const [activeDrawer, setActiveDrawer] = useState('personagens');
  const [searchTerm, setSearchTerm] = useState('');
  const [referenceData, setReferenceData] = useState({
    personagens: [],
    mundo: [],
    estrutura: [],
    ritmo: [],
    cenas: [],
    misterios: [],
    twists: [],
  });

  const [textSuggestions, setTextSuggestions] = useState([]);
  const [savingStatus, setSavingStatus] = useState('Salvo');

  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          resChapters,
          resChars,
          resWorld,
          resStruct,
          resPacing,
          resScenes,
          resMysteries,
          resTwists,
        ] = await Promise.all([
          apiClient.get(`/entities/projects/${projectId}/chapters`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/characters`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/world`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/estrutura-dramatica/cards`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/ritmo-timeline/cards`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/scenes`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/mysteries`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/twists`).catch(() => ({ data: [] })),
        ]);

        const loadedChapters = resChapters.data || [];
        setChapters(loadedChapters);
        if (loadedChapters.length > 0) {
          setSelectedId(loadedChapters[0].id);
        }

        setReferenceData({
          personagens: (resChars.data || []).map((c) => ({
            id: c.id,
            nome: c.name || c.nome,
            type: c.type || c.archetype,
            imageUrl: c.imageUrl || c.avatarUrl || c.image || null,
            ...(c.details || {}),
            pageKey: 'personagens',
          })),
          mundo: (resWorld.data || []).map((w) => ({
            id: w.id,
            name: w.name,
            type: w.type,
            description: w.description,
            pageKey: 'mundo',
          })),
          estrutura: (resStruct.data || []).map((s) => ({
            id: s.id,
            title: s.title,
            type: s.type,
            descricao: s.descricao,
            pageKey: 'estrutura',
          })),
          ritmo: (resPacing.data || []).map((p) => ({
            id: p.id,
            title: p.title,
            type: p.type,
            descricao: p.descricao,
            pageKey: 'ritmo',
          })),
          cenas: (resScenes.data || []).map((s) => ({
            id: s.id,
            title: s.title,
            ...s,
            pageKey: 'cenas',
          })),
          misterios: (resMysteries.data || []).map((m) => ({
            id: m.id,
            title: m.title,
            ...m,
            pageKey: 'misterios',
          })),
          twists: (resTwists.data || []).map((t) => ({
            id: t.id,
            title: t.title,
            ...t,
            pageKey: 'plot-twists',
          })),
        });
      } catch (err) {
        console.error('Erro ao carregar dados da escrita:', err);
        showToast({
          type: 'error',
          title: 'Erro de Conexão',
          message: 'Não foi possível carregar os dados de escrita do projeto.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, showToast]);

  const selectedChapter = chapters.find((c) => c.id === selectedId);

  useEffect(() => {
    if (editorRef.current && selectedChapter) {
      if (editorRef.current.innerHTML !== selectedChapter.content) {
        editorRef.current.innerHTML = selectedChapter.content || '';
      }
    }
  }, [selectedId]);

  // Extração segura de texto para o corretor (garante espaço entre parágrafos)
useEffect(() => {
    if (!editorRef.current) return;

    const rawText = editorRef.current.innerText.replace(/[\r\n]+/g, ' ');

    if (!rawText || rawText.trim().length < 3) {
      setTextSuggestions([]);
      return;
    }

    if (grammarTimeoutRef.current) clearTimeout(grammarTimeoutRef.current);

    grammarTimeoutRef.current = setTimeout(async () => {
      let ltSuggestions = [];

      // 1. PRIMÁRIO: Executa primeiro o LanguageTool
      try {
        const response = await apiClient.post('/entities/grammar-check', { text: rawText });
        const rawLt = response.data || [];

        ltSuggestions = rawLt
          .filter((s) => {
            const isWhitespaceRule =
              s.rule?.id === 'WHITESPACE_RULE' ||
              (s.message && s.message.toLowerCase().includes('espaço em branco'));
            return !isWhitespaceRule;
          })
          .map((sug) => {
            const style = getStyleForSuggestion(sug);
            return {
              ...sug,
              label: style.label,
              badgeStyle: style.badgeStyle,
              highlightStyle: style.highlightStyle,
            };
          });
      } catch (err) {
        console.warn('LanguageTool indisponível (usando apenas regras de suporte):', err.message);
      }

      // Mapeia regiões no texto já marcadas pelo LanguageTool
      const ltOccupiedRanges = ltSuggestions.map((s) => ({
        start: s.offset,
        end: s.offset + (s.length || s.original?.length || 0),
      }));

      // 2. SUPORTE: Executa as regras customizadas APENAS para trechos NÃO cobertos pelo LanguageTool
      const customSuggestionsRaw = analyzeCustomGrammarRules(rawText, ltSuggestions);

      const supportCustomSuggestions = customSuggestionsRaw
        .filter((cSug) => {
          const cStart = cSug.offset;
          const cEnd = cSug.offset + (cSug.length || cSug.original?.length || 0);

          // Se o LanguageTool já apontou um erro nesse trecho, a regra customizada cede lugar ao LT
          const isOverlappedByLT = ltOccupiedRanges.some(
            (r) => Math.max(cStart, r.start) < Math.min(cEnd, r.end)
          );

          return !isOverlappedByLT;
        })
        .map((cSug) => {
          const style = getStyleForSuggestion(cSug);
          return {
            ...cSug,
            label: cSug.label,
            badgeStyle: style.badgeStyle,
            highlightStyle: style.highlightStyle,
          };
        });

      // Une os alertas: LanguageTool primeiro + Regras Customizadas de Suporte
      const allSuggestions = [...ltSuggestions, ...supportCustomSuggestions];

      const now = Date.now();
      const validSuggestions = allSuggestions.filter((sug) => {
        const key = getSugKey(sug);
        const expireTime = ignoredSuggestionsRef.current.get(key);
        return !(expireTime && now < expireTime);
      });

      setTextSuggestions(validSuggestions);
    }, 500);

    return () => {
      if (grammarTimeoutRef.current) clearTimeout(grammarTimeoutRef.current);
    };
  }, [selectedChapter?.content]);

  const checkActiveFormats = () => {
    if (!editorRef.current) return;
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        subscript: document.queryCommandState('subscript'),
        superscript: document.queryCommandState('superscript'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        justifyFull: document.queryCommandState('justifyFull'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      });
    } catch (e) {
      // Ignora exceções
    }
  };

  const executeCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      updateSelectedChapter('content', editorRef.current.innerHTML);
    }
    checkActiveFormats();
  };

  const toggleSubscript = () => {
    if (document.queryCommandState('superscript')) {
      document.execCommand('superscript', false, null);
    }
    document.execCommand('subscript', false, null);
    if (editorRef.current) {
      updateSelectedChapter('content', editorRef.current.innerHTML);
    }
    checkActiveFormats();
  };

  const toggleSuperscript = () => {
    if (document.queryCommandState('subscript')) {
      document.execCommand('subscript', false, null);
    }
    document.execCommand('superscript', false, null);
    if (editorRef.current) {
      updateSelectedChapter('content', editorRef.current.innerHTML);
    }
    checkActiveFormats();
  };

  const insertFirstLineIndent = () => {
    if (!editorRef.current) return;

    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    let node = sel.anchorNode;
    if (!node) return;

    let block = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;

    while (
      block &&
      block !== editorRef.current &&
      !['P', 'DIV', 'H1', 'H2', 'H3', 'BLOCKQUOTE', 'LI'].includes(block.tagName)
    ) {
      block = block.parentElement;
    }

    if (!block || block === editorRef.current) {
      document.execCommand('formatBlock', false, 'p');
      const newSel = window.getSelection();
      if (newSel && newSel.anchorNode) {
        block =
          newSel.anchorNode.nodeType === Node.ELEMENT_NODE
            ? newSel.anchorNode
            : newSel.anchorNode.parentElement;
        while (block && block !== editorRef.current && !['P', 'DIV'].includes(block.tagName)) {
          block = block.parentElement;
        }
      }
    }

    if (block && block !== editorRef.current) {
      const hasIndent = block.style.textIndent && block.style.textIndent !== '0px';
      block.style.textIndent = hasIndent ? '0px' : '2.5em';
      updateSelectedChapter('content', editorRef.current.innerHTML);
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      updateSelectedChapter('content', editorRef.current.innerHTML);
    }
    checkActiveFormats();
  };

  // Destaque de correção dinâmico baseado na cor da categoria
  const highlightCorrectionInEditor = (sug) => {
  if (!editorRef.current || !sug) return;
  removeHighlightFromEditor();

  const range = getRangeForSuggestion(editorRef.current, sug);

  if (range) {
    try {
      const mark = document.createElement('mark');
      mark.id = 'active-correction-mark';
      
      // Aplica dinamicamente a classe Tailwind correspondente à cor da regra (Lime, Red, Orange, etc.)
      mark.className = sug.highlightStyle || 'bg-purple-500/30 text-purple-200 border-b-2 border-purple-500 border-dashed rounded px-0.5';

      const extracted = range.extractContents();
      mark.appendChild(extracted);
      range.insertNode(mark);
    } catch (e) {
      console.error('Erro ao grifar trecho no editor:', e);
    }
  }
};

  // Clique no card com rolagem suave automática
  const handleCardClick = (e, sug) => {
  if (
    e.target.closest('button') ||
    e.target.closest('select') ||
    e.target.closest('option')
  ) {
    return;
  }

  highlightCorrectionInEditor(sug);

  setTimeout(() => {
    const mark = editorRef.current?.querySelector('#active-correction-mark');
    const editor = editorRef.current;

    if (mark && editor) {
      const markRect = mark.getBoundingClientRect();
      const editorRect = editor.getBoundingClientRect();

      // Cálculo de posição relativa real entre o grifo e a janela do editor
      const targetScrollTop =
        editor.scrollTop +
        (markRect.top - editorRect.top) -
        editorRect.height / 2 +
        markRect.height / 2;

      editor.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth',
      });
    }
  }, 50);
};

  const removeHighlightFromEditor = () => {
    if (!editorRef.current) return;
    const mark = editorRef.current.querySelector('#active-correction-mark');
    if (mark) {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
      parent.normalize();
    }
  };

  function handleApplyCorrection(suggestion, chosenReplacement) {
    if (!selectedChapter || !editorRef.current) return;

    removeHighlightFromEditor();

    const replacementToUse = chosenReplacement || suggestion.replacement;
    if (!replacementToUse || !suggestion.original) return;

    const range = getRangeForSuggestion(editorRef.current, suggestion);

    if (range) {
      try {
        range.deleteContents();
        const newTextNode = document.createTextNode(replacementToUse);
        range.insertNode(newTextNode);
      } catch (e) {
        console.error('Erro na substituição do DOM:', e);
        editorRef.current.innerHTML = editorRef.current.innerHTML.replace(
          suggestion.original,
          replacementToUse
        );
      }
    } else {
      editorRef.current.innerHTML = editorRef.current.innerHTML.replace(
        suggestion.original,
        replacementToUse
      );
    }

    editorRef.current.normalize();
    updateSelectedChapter('content', editorRef.current.innerHTML);
    setTextSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
  }

  function handleDismissSuggestion(sug) {
    removeHighlightFromEditor();
    const key = getSugKey(sug);
    const COOLDOWN_MS = 30 * 60 * 1000;
    ignoredSuggestionsRef.current.set(key, Date.now() + COOLDOWN_MS);
    setTextSuggestions((prev) => prev.filter((s) => s.id !== sug.id));
  }

  const POINTS_PER_CHAPTER = 10;
  const totalPossiblePoints = chapters.length * POINTS_PER_CHAPTER;
  let currentPoints = 0;

  chapters.forEach((c) => {
    if (c.title && c.title.trim()) currentPoints += 1;
    if (c.type) currentPoints += 1;

    if (c.content && c.content.trim()) {
      const textOnly = c.content.replace(/<[^>]*>/g, '').trim();
      const wordCount = textOnly ? textOnly.split(/\s+/).length : 0;
      if (wordCount > 300) currentPoints += 8;
      else if (wordCount > 100) currentPoints += 5;
      else if (wordCount > 0) currentPoints += 2;
    }
  });

  const progressPercentage =
    totalPossiblePoints > 0
      ? Math.round((currentPoints / totalPossiblePoints) * 100)
      : 0;

  const handleCopyChapter = () => {
    if (!selectedChapter) return;
    const plainText = editorRef.current ? editorRef.current.innerText : selectedChapter.content;
    const fullText = `${selectedChapter.title}\n\n${plainText || ''}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    showToast({
      type: 'success',
      title: 'Conteúdo Copiado',
      message: `O capítulo "${selectedChapter.title}" foi copiado para a área de transferência.`
    });
  };

  async function handleAddChapter() {
    if (!newTitle.trim()) {
      showToast({
        type: 'warning',
        title: 'Campo Obrigatório',
        message: 'Por favor, informe o título do capítulo.'
      });
      return;
    }

    if (!projectId) return;

    setSavingStatus('Salvando...');

    try {
      const payload = {
        title: newTitle.trim(),
        type: newType,
        content: '',
      };

      const res = await apiClient.post(`/entities/projects/${projectId}/chapters`, payload);
      const created = res?.data || res;

      if (!created || !created.id) {
        throw new Error('Resposta inválida do servidor ao criar capítulo.');
      }

      setChapters((prev) => [...(Array.isArray(prev) ? prev : []), created]);
      setSelectedId(created.id);
      setNewTitle('');
      setNewType('Capítulo');
      setIsCreating(false);
      setSavingStatus('Salvo');

      showToast({
        type: 'success',
        title: 'Capítulo Criado',
        message: `O capítulo "${created.title}" foi criado com sucesso.`
      });
    } catch (err) {
      console.error('Erro ao criar capítulo:', err);
      setSavingStatus('Erro ao salvar');
      showToast({
        type: 'error',
        title: 'Erro de Criação',
        message: err.response?.data?.error || 'Não foi possível criar o capítulo.'
      });
    }
  }

  function updateSelectedChapter(key, value) {
    setSavingStatus('Salvando...');
    setChapters((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, [key]: value } : c))
    );

    if (!selectedId) return;

    if (updateTimeoutRef.current[selectedId]) {
      clearTimeout(updateTimeoutRef.current[selectedId]);
    }

    updateTimeoutRef.current[selectedId] = setTimeout(() => {
      setChapters((latestChapters) => {
        const targetChapter = latestChapters.find((c) => c.id === selectedId);

        if (targetChapter) {
          const payload = {
            title: targetChapter.title,
            type: targetChapter.type,
            content: targetChapter.content,
          };

          apiClient
            .put(`/entities/chapters/${selectedId}`, payload)
            .then(() => {
              console.log('Capítulo salvo no backend com sucesso.');
              setSavingStatus('Salvo');
            })
            .catch((err) => {
              console.error('Erro ao salvar no backend:', err);
              setSavingStatus('Erro ao salvar');
            });
        }

        return latestChapters;
      });
    }, 800);
  }

  async function handleDeleteChapter(id, event) {
    event.stopPropagation();
    if (!window.confirm('Deseja excluir este capítulo?')) return;

    setSavingStatus('Salvando...');

    try {
      await apiClient.delete(`/entities/chapters/${id}`);
      setChapters((prev) => prev.filter((c) => c.id !== id));
      if (selectedId === id) {
        const remaining = chapters.filter((c) => c.id !== id);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
      setSavingStatus('Salvo');

      showToast({
        type: 'success',
        title: 'Capítulo Excluído',
        message: 'O capítulo foi removido com sucesso.'
      });
    } catch (err) {
      console.error('Erro ao excluir capítulo:', err);
      setSavingStatus('Erro ao salvar');
      showToast({
        type: 'error',
        title: 'Erro de Exclusão',
        message: err.response?.data?.error || 'Erro ao excluir o capítulo.'
      });
    }
  }

  function handleDrop(targetId) {
    if (!draggedId || draggedId === targetId) return;

    setChapters((prev) => {
      const fromIndex = prev.findIndex((c) => c.id === draggedId);
      const toIndex = prev.findIndex((c) => c.id === targetId);
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });

    setDraggedId(null);
  }

  function renderFilledFields(item) {
    const ignoredKeys = [
      'id', 'name', 'nome', 'title', 'type', 'pageKey', 'projectId',
      'createdAt', 'updatedAt', 'imageUrl', 'avatarUrl', 'image', 'beat', 'sceneTitle',
    ];

    const entries = Object.entries(item).filter(
      ([key, val]) =>
        !ignoredKeys.includes(key) &&
        val !== null &&
        val !== undefined &&
        typeof val === 'string' &&
        val.trim() !== ''
    );

    if (entries.length === 0) return null;

    const fieldLabels = {
      idade: 'Idade', descricao: 'Descrição', description: 'Descrição',
      trauma: 'Trauma', motivacao: 'Motivação', objetivos: 'Objetivos',
      historia: 'História', passado: 'Passado', segredo: 'Segredo',
      detalhes: 'Detalhes', act: 'Ato', beat: 'Ponto (Beat)',
      stage: 'Estágio', objective: 'Objetivo', summary: 'Resumo',
      notes: 'Notas', pacing: 'Ritmo', intensity: 'Intensidade',
      time: 'Momento/Tempo', duration: 'Duração', impact: 'Impacto Emocional',
      location: 'Local', conflict: 'Conflito', hook: 'Gancho',
      whoKnows: 'Quem sabe', clues: 'Pistas', revelation: 'Revelação',
      planning: 'Planejamento', foreshadowing: 'Foreshadowing', consequence: 'Consequência',
    };

    return (
      <div className="space-y-1.5 mt-3 text-sm">
        {entries.map(([key, val]) => (
          <p key={key} className="text-gray-300 leading-relaxed break-words">
            <strong className="text-purple-400 font-medium">
              {fieldLabels[key] || key}:{' '}
            </strong>
            {val}
          </p>
        ))}
      </div>
    );
  }

  const getBtnStyle = (isActive) =>
    `w-7 h-7 rounded flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
      isActive
        ? 'bg-purple-600 text-white border border-purple-400 shadow-sm'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  const drawerTabsConfig = [
    ['Personagens', 'personagens', User],
    ['Mundo', 'mundo', Globe],
    ['Estrutura Dramática', 'estrutura', GitBranch],
    ['Ritmo & Timeline', 'ritmo', Activity],
    ['Cenas', 'cenas', Clapperboard],
    ['Mistérios', 'misterios', Search],
    ['Plot Twists', 'twists', Zap],
  ];

  return (
    <main className="module-page w-full manuscript-page">
      <style>{`
        .rich-editor-content ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin: 0.5rem 0 !important; }
        .rich-editor-content ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin: 0.5rem 0 !important; }
        .rich-editor-content li { display: list-item !important; }
        .rich-editor-content sub { vertical-align: sub !important; font-size: 0.75em !important; }
        .rich-editor-content sup { vertical-align: super !important; font-size: 0.75em !important; }
      `}</style>

      <header className="module-header flex justify-between items-center">
        <div>
          <h1>Escrita</h1>
          <p>Escreva capítulos e consulte seus elementos criados em tempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium bg-[#1c1c26] px-3 py-1 rounded-full border border-gray-800">
            {savingStatus}
          </span>
          <div className="module-progress">
            <span aria-hidden="true" />
            {progressPercentage}%
          </div>
        </div>
      </header>

      <div className="module-progress-track">
        <div style={{ width: `${progressPercentage}%` }} />
      </div>

      <EscritaGuide />

      {/* GRID COM EXPANSÃO HORIZONTAL */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Painel de Capítulos */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Capítulos</h2>
            <button
              className="new-character-button cursor-pointer text-xs px-3 py-1 flex items-center gap-1"
              type="button"
              onClick={() => setIsCreating((prev) => !prev)}
            >
              <Plus size={14} /> Novo
            </button>
          </div>

          {isCreating && (
            <div className="bg-[#181824] p-4 rounded-xl border border-purple-900/40 space-y-3">
              <input
                autoFocus
                type="text"
                className="w-full bg-[#11111a] border border-gray-800 rounded-lg p-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
                placeholder="Título..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <select
                className="w-full bg-[#11111a] border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-600 cursor-pointer"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              >
                {chapterTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="w-full bg-[#252336] hover:bg-purple-700 text-purple-200 hover:text-white font-medium text-sm py-2 rounded-lg transition-all cursor-pointer"
                onClick={handleAddChapter}
              >
                Adicionar
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-6 text-gray-500 text-xs">Carregando escrita...</div>
          ) : chapters.length === 0 ? (
            <div className="bg-[#14141e] border border-gray-800/80 rounded-xl p-6 text-center text-gray-500 text-sm">
              Nenhum capítulo criado.
            </div>
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  draggable
                  onDragStart={() => setDraggedId(chapter.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(chapter.id)}
                  onClick={() => setSelectedId(chapter.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedId === chapter.id
                      ? 'bg-[#1e1c2e] border-purple-600/80 text-white'
                      : 'bg-[#14141e] border-gray-800/80 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical size={16} className="text-gray-600 cursor-grab shrink-0" />
                    <div>
                      <h3 className="font-semibold text-sm leading-tight">
                        {chapter.title}
                      </h3>
                      <span className="text-xs text-gray-500">{chapter.type}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                    title="Excluir capítulo"
                    onClick={(e) => handleDeleteChapter(chapter.id, e)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor de Escrita Ampliado */}
        <div className="md:col-span-9 space-y-4">
          {selectedChapter ? (
            <>
              <div className="bg-[#14141e] border border-gray-800/80 rounded-xl p-5 space-y-4 shadow-lg">
                <div className="flex items-center justify-between gap-4 pb-3 border-b border-gray-800/60">
                  <input
                    type="text"
                    className="bg-transparent font-bold text-lg text-white focus:outline-none focus:border-b border-purple-500 flex-1"
                    value={selectedChapter.title}
                    onChange={(e) => updateSelectedChapter('title', e.target.value)}
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCorrectionsPanel((prev) => !prev)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        textSuggestions.length > 0
                          ? 'bg-amber-950/60 border-amber-500/80 text-amber-300'
                          : 'bg-[#1c1c28] border-gray-800 text-gray-400'
                      }`}
                      title="Alternar Painel de Correção Ortográfica"
                    >
                      <Sparkles size={14} className="text-amber-400 shrink-0" />
                      <span>{textSuggestions.length} Alertas</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyChapter}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        copied
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                          : 'bg-[#1c1c28] border-gray-800 hover:border-purple-600 text-gray-300 hover:text-white'
                      }`}
                      title="Copiar Título e Conteúdo do Capítulo"
                    >
                      {copied ? (
                        <Check size={14} className="text-emerald-400 shrink-0" />
                      ) : (
                        <Copy size={14} className="shrink-0" />
                      )}
                      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                    </button>

                    <select
                      className="bg-[#1c1c28] border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none cursor-pointer"
                      value={selectedChapter.type}
                      onChange={(e) => updateSelectedChapter('type', e.target.value)}
                    >
                      {chapterTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* BARRA DE FERRAMENTAS DO EDITOR */}
                <div className="bg-[#191926] border border-gray-800 rounded-lg p-2 flex flex-wrap items-center gap-3 text-xs text-gray-300 select-none">
                  
                  {/* FONTE E TAMANHOS */}
                  <div className="flex items-center gap-1 pr-3 border-r border-gray-800">
                    <select
                      onChange={(e) => executeCmd('fontName', e.target.value)}
                      className="bg-[#11111a] border border-gray-800 rounded px-2 py-1 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="Calibri">Calibri</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Garamond">Garamond</option>
                      <option value="Inter">Inter</option>
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>

                    <select
                      onChange={(e) => executeCmd('fontSize', e.target.value)}
                      className="bg-[#11111a] border border-gray-800 rounded px-2 py-1 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="1">10pt</option>
                      <option value="2">11pt</option>
                      <option value="3">12pt</option>
                      <option value="4">14pt</option>
                      <option value="5">18pt</option>
                      <option value="6">24pt</option>
                      <option value="7">36pt</option>
                    </select>
                  </div>

                  {/* ESTILOS DE TEXTO */}
                  <div className="flex items-center gap-1 pr-3 border-r border-gray-800">
                    <button
                      type="button"
                      onClick={() => executeCmd('bold')}
                      className={getBtnStyle(activeFormats.bold)}
                      title="Negrito (Ctrl+B)"
                    >
                      N
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCmd('italic')}
                      className={getBtnStyle(activeFormats.italic)}
                      title="Itálico (Ctrl+I)"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCmd('underline')}
                      className={getBtnStyle(activeFormats.underline)}
                      title="Sublinhado (Ctrl+U)"
                    >
                      S
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCmd('strikeThrough')}
                      className={getBtnStyle(activeFormats.strikeThrough)}
                      title="Tachado"
                    >
                      abc
                    </button>
                    <button
                      type="button"
                      onClick={toggleSubscript}
                      className={getBtnStyle(activeFormats.subscript)}
                      title="Subscrito"
                    >
                      x₂
                    </button>
                    <button
                      type="button"
                      onClick={toggleSuperscript}
                      className={getBtnStyle(activeFormats.superscript)}
                      title="Sobrescrito"
                    >
                      x²
                    </button>
                  </div>

                  {/* CORES E REALCE */}
                  <div className="flex items-center gap-1.5 pr-3 border-r border-gray-800">
                    <label className="flex items-center gap-1 cursor-pointer bg-[#11111a] px-2 py-1 rounded border border-gray-800 hover:border-gray-700">
                      <span className="text-[10px] text-gray-400 font-semibold">Texto:</span>
                      <input
                        type="color"
                        onChange={(e) => executeCmd('foreColor', e.target.value)}
                        className="w-4 h-4 bg-transparent cursor-pointer border-none"
                        title="Cor da Fonte"
                      />
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer bg-[#11111a] px-2 py-1 rounded border border-gray-800 hover:border-gray-700">
                      <span className="text-[10px] text-gray-400 font-semibold">Realce:</span>
                      <input
                        type="color"
                        onChange={(e) => executeCmd('hiliteColor', e.target.value)}
                        className="w-4 h-4 bg-transparent cursor-pointer border-none"
                        title="Cor do Realce (Marca-Texto)"
                      />
                    </label>
                  </div>

                  {/* ALINHAMENTOS */}
                  <div className="flex items-center gap-1 pr-3 border-r border-gray-800">
                    <button
                      type="button"
                      onClick={() => executeCmd('justifyLeft')}
                      className={getBtnStyle(activeFormats.justifyLeft)}
                      title="Alinhar à Esquerda"
                    >
                      ≡
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCmd('justifyCenter')}
                      className={getBtnStyle(activeFormats.justifyCenter)}
                      title="Centralizar"
                    >
                      ≡
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCmd('justifyRight')}
                      className={getBtnStyle(activeFormats.justifyRight)}
                      title="Alinhar à Direita"
                    >
                      ≡
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCmd('justifyFull')}
                      className={getBtnStyle(activeFormats.justifyFull)}
                      title="Justificar"
                    >
                      ⵂ
                    </button>
                  </div>

                  {/* LISTAS E RECUOS */}
                  <div className="flex items-center gap-1 pr-3 border-r border-gray-800">
                    <button
                      type="button"
                      onClick={() => executeCmd('insertUnorderedList')}
                      className={getBtnStyle(activeFormats.insertUnorderedList)}
                      title="Lista com Marcadores"
                    >
                      •
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCmd('insertOrderedList')}
                      className={getBtnStyle(activeFormats.insertOrderedList)}
                      title="Lista Numerada"
                    >
                      1.
                    </button>

                    <button
                      type="button"
                      onClick={insertFirstLineIndent}
                      className="w-7 h-7 rounded hover:bg-gray-800 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer font-bold text-xs"
                      title="Recuo de Primeira Linha / Parágrafo (Tab)"
                    >
                      ⇥₁
                    </button>

                    <button
                      type="button"
                      onClick={() => executeCmd('outdent')}
                      className="w-7 h-7 rounded hover:bg-gray-800 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                      title="Diminuir Recuo"
                    >
                      ⇤
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCmd('indent')}
                      className="w-7 h-7 rounded hover:bg-gray-800 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                      title="Aumentar Recuo"
                    >
                      ⇥
                    </button>
                  </div>

                  {/* LIMPAR FORMATAÇÃO */}
                  <div>
                    <button
                      type="button"
                      onClick={() => executeCmd('removeFormat')}
                      className="px-2 py-1 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-xs flex items-center gap-1 transition-all cursor-pointer font-semibold"
                      title="Remover todas as formatações do texto selecionado"
                    >
                      <Eraser size={14} />
                      <span>Limpar Formatação</span>
                    </button>
                  </div>
                </div>

                {/* CONTAINER EDITÁVEL RICH TEXT */}
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorInput}
                  onKeyUp={checkActiveFormats}
                  onMouseUp={checkActiveFormats}
                  onSelect={checkActiveFormats}
                  className="rich-editor-content w-full h-96 p-4 bg-[#11111a] text-gray-200 text-sm leading-relaxed focus:outline-none resize-y overflow-y-auto font-sans border border-gray-800/80 rounded-lg text-justify focus:border-purple-600 transition-all"
                  style={{ minHeight: '384px' }}
                />
              </div>

              {/* ASSISTENTE DE REVISÃO */}
              {showCorrectionsPanel && textSuggestions.length > 0 && (
                <div className="bg-[#161522] border border-purple-900/60 rounded-xl p-4 space-y-3 shadow-xl">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-800/80">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles size={15} className="text-purple-400 shrink-0" /> Assistente de Revisão ({textSuggestions.length} Alertas)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {textSuggestions.map((sug) => {
                      const options =
                        sug.replacements && sug.replacements.length > 0
                          ? sug.replacements
                          : sug.replacement
                          ? [sug.replacement]
                          : [];

                      const visibleOptions = options.slice(0, 4);
                      const extraOptions = options.slice(4);

                      return (
                        <div
                          key={sug.id}
                          onMouseEnter={() => highlightCorrectionInEditor(sug)}
                          onMouseLeave={removeHighlightFromEditor}
                          onClick={(e) => handleCardClick(e, sug)}
                          className="p-3 rounded-xl flex items-center justify-between gap-3 text-xs transition-all border bg-[#1c1b2c] border-gray-800 hover:border-purple-500/80 cursor-pointer group"
                          title="Clique no card para ir até a localização no texto"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${sug.badgeStyle}`}>
                                {sug.label}
                              </span>
                              <span className="text-gray-400 line-through truncate font-mono">
                                "{sug.original}"
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <p
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveModalSuggestion(sug);
                                }}
                                className="text-gray-300 text-xs truncate cursor-pointer hover:text-purple-300 transition-colors"
                                title="Clique para ver a explicação completa"
                              >
                                {sug.message}
                              </p>

                              {sug.message && sug.message.length > 55 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveModalSuggestion(sug);
                                  }}
                                  className="text-purple-400 hover:text-purple-300 text-[11px] font-semibold underline shrink-0 cursor-pointer"
                                >
                                  [ver mais]
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {visibleOptions.map((option, oIdx) => (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplyCorrection(sug, option);
                                }}
                                className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-sm"
                              >
                                {option}
                              </button>
                            ))}

                            {extraOptions.length > 0 && (
                              <div className="relative">
                                <select
                                  defaultValue=""
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    if (e.target.value) {
                                      handleApplyCorrection(sug, e.target.value);
                                      e.target.value = '';
                                    }
                                  }}
                                  className="px-2.5 py-1.5 bg-[#272438] hover:bg-[#322e48] border border-purple-500/50 text-purple-200 font-semibold text-xs rounded-lg cursor-pointer transition-colors outline-none pr-6 appearance-none"
                                >
                                  <option value="" disabled hidden>
                                    +{extraOptions.length} mais ▾
                                  </option>
                                  {extraOptions.map((option, idx) => (
                                    <option key={idx} value={option} className="bg-[#1c1b2c] text-white py-1">
                                      {option}
                                    </option>
                                  ))}
                                </select>
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-purple-300 text-[9px]">
                                  ▼
                                </span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDismissSuggestion(sug);
                              }}
                              className="ml-1 p-1 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Ignorar esta correção por 30 minutos"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-[#14141e] border border-gray-800/80 rounded-xl p-16 text-center space-y-3">
              <BookOpen size={36} className="text-gray-600 mx-auto block" />
              <p className="text-gray-400 text-sm">
                Selecione ou crie um capítulo para começar a escrever.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Seção Inferior: Apoio Visual */}
      <section className="mt-8 bg-[#14141e] border border-purple-900/50 rounded-xl p-6 space-y-5 shadow-2xl">
        <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-gray-400 font-bold mr-2 uppercase tracking-wider text-[11px]">
              Apoio Visual:
            </span>
            {drawerTabsConfig.map(([label, key, IconComponent]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveDrawer(activeDrawer === key ? null : key)}
                className={`px-3.5 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeDrawer === key
                    ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                    : 'bg-[#1a1a26] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                }`}
              >
                <IconComponent size={14} className="shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {activeDrawer && (
              <input
                type="text"
                placeholder="Filtrar elemento..."
                className="bg-[#1c1c28] border border-gray-800 rounded-lg px-3.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}
            {activeDrawer && (
              <button
                type="button"
                className="text-gray-400 hover:text-white text-xs font-semibold cursor-pointer px-3 py-1.5 rounded-md bg-gray-800/50 hover:bg-gray-800 flex items-center gap-1"
                onClick={() => setActiveDrawer(null)}
              >
                <X size={13} /> Ocultar Painel
              </button>
            )}
          </div>
        </div>

        {activeDrawer ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {referenceData[activeDrawer]
              ?.filter((item) =>
                (item.name || item.nome || item.title || '')
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .map((item) => {
                const displayName = item.name || item.nome || item.title || 'Sem título';
                const initial = displayName.charAt(0).toUpperCase();

                return (
                  <div
                    key={item.id}
                    className="bg-[#1a1a26] border border-gray-800/80 p-5 rounded-xl space-y-3 hover:border-purple-700/60 transition-all flex flex-col justify-between shadow-md relative group"
                  >
                    <div>
                      {item.pageKey && onNavigate && (
                        <button
                          type="button"
                          title="Visualizar no módulo completo"
                          onClick={() => onNavigate(item.pageKey)}
                          className="absolute top-4 right-4 text-gray-500 hover:text-purple-300 text-base cursor-pointer p-1 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                      )}

                      <div className="flex items-start gap-3 pr-6 mb-2">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={displayName}
                            className="w-11 h-11 rounded-full object-cover border border-purple-500/50 shrink-0"
                          />
                        ) : activeDrawer === 'personagens' ? (
                          <div
                            className={`w-11 h-11 rounded-full border flex items-center justify-center font-bold text-base shrink-0 ${getCharacterBadgeStyle(
                              item.type
                            )}`}
                          >
                            {initial}
                          </div>
                        ) : null}

                        <div className="overflow-hidden">
                          <h4 className="text-purple-200 font-bold text-base leading-tight truncate">
                            {displayName}
                          </h4>
                          {item.type && (
                            <span
                              className={`inline-block border px-2 py-0.5 rounded text-[11px] font-medium mt-1 ${
                                activeDrawer === 'personagens'
                                  ? getCharacterBadgeStyle(item.type)
                                  : activeDrawer === 'estrutura'
                                  ? getFrameworkBadgeStyle(item.type)
                                  : activeDrawer === 'ritmo'
                                  ? getTimelineBadgeStyle(item.type)
                                  : activeDrawer === 'mundo'
                                  ? getWorldTheme(item.type)
                                  : 'bg-purple-950/80 text-purple-300 border-purple-800/40'
                              }`}
                            >
                              {item.type}
                            </span>
                          )}
                        </div>
                      </div>

                      {renderFilledFields(item)}
                    </div>
                  </div>
                );
              })}

            {referenceData[activeDrawer]?.length === 0 && (
              <div className="col-span-full text-center text-gray-500 text-sm py-12">
                Nenhum elemento cadastrado nesta categoria ainda.
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-xs text-center py-2">
            Clique em um dos botões acima para exibir os cards de consulta enquanto escreve.
          </p>
        )}
      </section>

      {/* POPUP DE EXPLICAÇÃO COMPLETA (MODAL) */}
      {activeModalSuggestion && (() => {
        const allReplacements = activeModalSuggestion.replacements || 
          (activeModalSuggestion.replacement ? [activeModalSuggestion.replacement] : []);
        
        const mainReplacements = allReplacements.slice(0, 4);
        const extraReplacements = allReplacements.slice(4);

        return (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#181726] border border-purple-600/60 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
              
              <div className="flex justify-between items-start pb-3 border-b border-gray-800">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${activeModalSuggestion.badgeStyle}`}>
                  {activeModalSuggestion.label}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveModalSuggestion(null)}
                  className="text-gray-400 hover:text-white p-1 cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trecho do Texto:</h3>
                <span className="text-red-300 font-mono bg-red-950/50 border border-red-900/60 px-3 py-1 rounded-lg text-sm inline-block line-through">
                  "{activeModalSuggestion.original}"
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Explicação Detalhada:</h3>
                <div className="bg-[#11111a] border border-gray-800/90 p-4 rounded-xl text-gray-200 text-sm leading-relaxed max-h-48 overflow-y-auto">
                  {activeModalSuggestion.message}
                </div>
              </div>

              {allReplacements.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-800">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Sugestões de Correção ({allReplacements.length}):
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {mainReplacements.map((rep, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          handleApplyCorrection(activeModalSuggestion, rep);
                          setActiveModalSuggestion(null);
                        }}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-xl transition-all cursor-pointer shadow-md"
                      >
                        "{rep}"
                      </button>
                    ))}

                    {extraReplacements.length > 0 && (
                      <div className="relative inline-block">
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleApplyCorrection(activeModalSuggestion, e.target.value);
                              setActiveModalSuggestion(null);
                            }
                          }}
                          className="px-3 py-1.5 bg-[#272438] hover:bg-[#322e48] border border-purple-500/50 text-purple-200 font-semibold text-xs rounded-xl cursor-pointer transition-colors outline-none pr-7 appearance-none"
                        >
                          <option value="" disabled hidden>
                            +{extraReplacements.length} outras opções ▾
                          </option>
                          {extraReplacements.map((rep, idx) => (
                            <option key={idx} value={rep} className="bg-[#1c1b2c] text-white py-1">
                              Substituir por: "{rep}"
                            </option>
                          ))}
                        </select>
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-purple-300 text-[9px]">
                          ▼
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalSuggestion(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </main>
  );
}