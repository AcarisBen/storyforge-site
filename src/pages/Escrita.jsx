// src/pages/Escrita.jsx
// Página de Escrita do Projeto

import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';
import { analyzeCustomGrammarRules } from '../lib/writing/customGrammarRules';

const chapterTypes = ['Prólogo', 'Capítulo', 'Cena', 'Ato', 'Parte', 'Epílogo'];

const guideTabs = {
  Objetivo: (
    <p>Produzir o texto final da obra, capítulo por capítulo, com apoio do programa.</p>
  ),
  Dicas: (
    <ul>
      <li>Use os elementos já criados (personagens, cenas, mundo) como base para a escrita.</li>
      <li>Abra os itens de Apoio Visual na seção inferior para consultar suas ideias com espaço de sobra.</li>
    </ul>
  ),
  Exemplos: (
    <ul>
      <li>Capítulo 1: Abertura que apresenta o protagonista e o mundo.</li>
      <li>Capítulo 2: Incidente incitante que inicia a jornada.</li>
    </ul>
  ),
  Perguntas: (
    <ul>
      <li>Qual é o foco deste capítulo?</li>
      <li>Quais elementos da pré-produção se encaixam aqui?</li>
      <li>O ritmo deste capítulo serve ao conjunto da obra?</li>
    </ul>
  ),
};

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

function EscritaGuide() {
  const [activeTab, setActiveTab] = useState('Objetivo');
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="module-guide character-guide mb-6">
      <button
        className="guide-toggle cursor-pointer"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>
          <b aria-hidden="true">💡</b> Guia do Módulo
        </span>
        <span aria-hidden="true">{isOpen ? '⌃' : '⌄'}</span>
      </button>

      {isOpen && (
        <div className="guide-content">
          <nav className="guide-tabs" aria-label="Guia do módulo">
            {Object.keys(guideTabs).map((tab) => (
              <button
                className={
                  activeTab === tab
                    ? 'guide-tab active cursor-pointer'
                    : 'guide-tab cursor-pointer'
                }
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
              >
                <span aria-hidden="true">
                  {tab === 'Objetivo'
                    ? '◎'
                    : tab === 'Dicas'
                    ? '💡'
                    : tab === 'Exemplos'
                    ? '📖'
                    : '?'}
                </span>
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

export default function Escrita({ projectId, onNavigate }) {
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

  // ESTADO DOS BOTÕES DA BARRA DE FERRAMENTAS
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

  // BUSCA DADOS DO PROJETO
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
        console.error('Erro ao carregar dados do manuscrito:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const selectedChapter = chapters.find((c) => c.id === selectedId);

  // SINCRONIZA O CONTEÚDO DO CAPÍTULO SELECIONADO NO EDITOR DE TEXTO
  useEffect(() => {
    if (editorRef.current && selectedChapter) {
      if (editorRef.current.innerHTML !== selectedChapter.content) {
        editorRef.current.innerHTML = selectedChapter.content || '';
      }
    }
  }, [selectedId]);

  // ANÁLISE GRAMATICAL EM SEGUNDO PLANO (COM FILTRO DE ESPAÇO EM BRANCO)
  useEffect(() => {
    const rawText = editorRef.current ? editorRef.current.innerText : (selectedChapter?.content || '');

    if (!rawText || rawText.trim().length < 3) {
      setTextSuggestions([]);
      return;
    }

    if (grammarTimeoutRef.current) {
      clearTimeout(grammarTimeoutRef.current);
    }

    grammarTimeoutRef.current = setTimeout(async () => {
      let ltSuggestions = [];

      try {
        const response = await apiClient.post('/entities/grammar-check', { text: rawText });
        const rawLt = response.data || [];

        // Filtra regras de espaço em branco para não dar falso positivo ao usar formatação
        ltSuggestions = rawLt.filter((s) => {
          const isWhitespaceRule =
            s.rule?.id === 'WHITESPACE_RULE' ||
            (s.message && s.message.toLowerCase().includes('espaço em branco'));
          return !isWhitespaceRule;
        });
      } catch (err) {
        console.warn('LanguageTool indisponível:', err.message);
      }

      const customSuggestions = analyzeCustomGrammarRules(rawText, ltSuggestions);
      const allSuggestions = [...ltSuggestions, ...customSuggestions];

      const now = Date.now();
      const validSuggestions = allSuggestions.filter((sug) => {
        const key = getSugKey(sug);
        const expireTime = ignoredSuggestionsRef.current.get(key);
        if (expireTime && now < expireTime) {
          return false;
        }
        return true;
      });

      setTextSuggestions(validSuggestions);
    }, 500);

    return () => {
      if (grammarTimeoutRef.current) clearTimeout(grammarTimeoutRef.current);
    };
  }, [selectedChapter?.content]);

  // VERIFICA E ATUALIZA ESTADO ATIVO DOS BOTÕES DE FORMATAÇÃO
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
      // Ignora exceções em seleções nulas
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

  // RECUO DE PRIMEIRA LINHA VIA CSS (SEM CARACTERES DE ESPAÇO)
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

  // ROLA APENAS A CAIXA DO EDITOR (SEM MOVER O SCROLL DA PÁGINA INTEIRA)
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
        const editorRect = editor.getBoundingClientRect();
        const markRect = mark.getBoundingClientRect();

        // Posição relativa da marca em relação ao topo visível do editor
        const offsetTop = markRect.top - editorRect.top;

        // Calcula a nova posição para centralizar o texto dentro da caixa do editor
        const targetScrollTop = editor.scrollTop + offsetTop - (editor.clientHeight / 2) + (markRect.height / 2);

        editor.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth',
        });
      }
    }, 50);
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      updateSelectedChapter('content', editorRef.current.innerHTML);
    }
    checkActiveFormats();
  };

  // DESTAQUE ROXO EM TEMPO REAL
  const highlightCorrectionInEditor = (sug) => {
    if (!editorRef.current || !sug || !sug.original) return;
    removeHighlightFromEditor();

    editorRef.current.normalize();

    const fullText = editorRef.current.textContent || editorRef.current.innerText || '';
    const targetText = sug.original;
    if (!targetText) return;

    const occurrences = [];
    let idx = fullText.indexOf(targetText);
    while (idx !== -1) {
      occurrences.push(idx);
      idx = fullText.indexOf(targetText, idx + 1);
    }

    if (occurrences.length === 0) return;

    let bestStartIndex = occurrences[0];
    if (typeof sug.offset === 'number' && sug.offset >= 0) {
      let minDiff = Infinity;
      for (const pos of occurrences) {
        const diff = Math.abs(pos - sug.offset);
        if (diff < minDiff) {
          minDiff = diff;
          bestStartIndex = pos;
        }
      }
    }

    const bestEndIndex = bestStartIndex + targetText.length;

    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null, false);
    let charCount = 0;
    let startNode = null;
    let startOffsetInNode = 0;
    let endNode = null;
    let endOffsetInNode = 0;

    let node;
    while ((node = walker.nextNode())) {
      const nodeLen = node.nodeValue.length;
      const nodeStart = charCount;
      const nodeEnd = charCount + nodeLen;

      if (!startNode && bestStartIndex >= nodeStart && bestStartIndex < nodeEnd) {
        startNode = node;
        startOffsetInNode = bestStartIndex - nodeStart;
      }

      if (bestEndIndex > nodeStart && bestEndIndex <= nodeEnd) {
        endNode = node;
        endOffsetInNode = bestEndIndex - nodeStart;
        break;
      }

      charCount += nodeLen;
    }

    if (startNode && endNode) {
      try {
        const range = document.createRange();
        range.setStart(startNode, startOffsetInNode);
        range.setEnd(endNode, endOffsetInNode);

        const mark = document.createElement('mark');
        mark.id = 'active-correction-mark';
        mark.style.cssText =
          'background-color: rgba(168, 85, 247, 0.45) !important; color: inherit !important; border: 1px solid #a855f7; border-radius: 4px; padding: 0 2px; box-shadow: 0 0 12px rgba(168, 85, 247, 0.6);';

        const extracted = range.extractContents();
        mark.appendChild(extracted);
        range.insertNode(mark);
      } catch (e) {
        console.error('Erro ao grifar elemento no DOM:', e);
      }
    }
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

  // APLICA CORREÇÃO NO LOCAL EXATO DO TEXTO
  function handleApplyCorrection(suggestion, chosenReplacement) {
    if (!selectedChapter || !editorRef.current) return;

    removeHighlightFromEditor();
    editorRef.current.normalize();

    const replacementToUse = chosenReplacement || suggestion.replacement;
    if (!replacementToUse || !suggestion.original) return;

    const fullText = editorRef.current.textContent || editorRef.current.innerText || '';
    const targetText = suggestion.original;

    const occurrences = [];
    let idx = fullText.indexOf(targetText);
    while (idx !== -1) {
      occurrences.push(idx);
      idx = fullText.indexOf(targetText, idx + 1);
    }

    if (occurrences.length === 0) return;

    let bestStartIndex = occurrences[0];
    if (typeof suggestion.offset === 'number' && suggestion.offset >= 0) {
      let minDiff = Infinity;
      for (const pos of occurrences) {
        const diff = Math.abs(pos - suggestion.offset);
        if (diff < minDiff) {
          minDiff = diff;
          bestStartIndex = pos;
        }
      }
    }

    const bestEndIndex = bestStartIndex + targetText.length;

    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null, false);
    let charCount = 0;
    let startNode = null;
    let startOffsetInNode = 0;
    let endNode = null;
    let endOffsetInNode = 0;

    let node;
    while ((node = walker.nextNode())) {
      const nodeLen = node.nodeValue.length;
      const nodeStart = charCount;
      const nodeEnd = charCount + nodeLen;

      if (!startNode && bestStartIndex >= nodeStart && bestStartIndex < nodeEnd) {
        startNode = node;
        startOffsetInNode = bestStartIndex - nodeStart;
      }

      if (bestEndIndex > nodeStart && bestEndIndex <= nodeEnd) {
        endNode = node;
        endOffsetInNode = bestEndIndex - nodeStart;
        break;
      }

      charCount += nodeLen;
    }

    if (startNode && endNode) {
      try {
        const range = document.createRange();
        range.setStart(startNode, startOffsetInNode);
        range.setEnd(endNode, endOffsetInNode);

        range.deleteContents();
        const newTextNode = document.createTextNode(replacementToUse);
        range.insertNode(newTextNode);
      } catch (e) {
        console.error('Erro na substituição do DOM:', e);
        if (startNode === endNode) {
          const val = startNode.nodeValue;
          startNode.nodeValue =
            val.substring(0, startOffsetInNode) +
            replacementToUse +
            val.substring(endOffsetInNode);
        }
      }
    } else {
      editorRef.current.innerHTML = editorRef.current.innerHTML.replace(
        targetText,
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
    const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutos de espera
    ignoredSuggestionsRef.current.set(key, Date.now() + COOLDOWN_MS);
    setTextSuggestions((prev) => prev.filter((s) => s.id !== sug.id));
  }

  // CÁLCULO DE PROGRESSO
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
  };

  async function handleAddChapter() {
    if (!newTitle.trim() || !projectId) return;

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
    } catch (err) {
      console.error('Erro ao criar capítulo:', err);
      alert('Não foi possível criar o capítulo.');
    }
  }

  // SALVAMENTO AUTOMÁTICO NO BACKEND SEM STALE CLOSURE
  function updateSelectedChapter(key, value) {
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
            .then(() => console.log('Capítulo salvo no backend com sucesso.'))
            .catch((err) => console.error('Erro ao salvar no backend:', err));
        }

        return latestChapters;
      });
    }, 800);
  }

  async function handleDeleteChapter(id, event) {
    event.stopPropagation();
    if (!window.confirm('Deseja excluir este capítulo?')) return;

    try {
      await apiClient.delete(`/entities/chapters/${id}`);
      setChapters((prev) => prev.filter((c) => c.id !== id));
      if (selectedId === id) {
        const remaining = chapters.filter((c) => c.id !== id);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error('Erro ao excluir capítulo:', err);
      alert('Erro ao excluir o capítulo.');
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
      <h1>Escrita & Manuscrito</h1>
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

      {/* GRID COM EXPANSÃO HORIZONTAL (3 COLUNAS CAPÍTULOS / 9 COLUNAS EDITOR) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Painel de Capítulos */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Capítulos</h2>
            <button
              className="new-character-button cursor-pointer text-xs px-3 py-1"
              type="button"
              onClick={() => setIsCreating((prev) => !prev)}
            >
              + Novo
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
            <div className="text-center py-6 text-gray-500 text-xs">Carregando manuscrito...</div>
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
                    <span className="text-gray-600 cursor-grab text-xs">░░</span>
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
                    🗑
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
                      <span>✨</span>
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
                      <span>{copied ? '✓' : '📋'}</span>
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

                {/* BARRA DE FERRAMENTAS COM OS TAMANHOS A PARTIR DE 10pt */}
                <div className="bg-[#191926] border border-gray-800 rounded-lg p-2 flex flex-wrap items-center gap-3 text-xs text-gray-300 select-none">
                  
                  {/* FONTE E TAMANHOS (10pt a 36pt) */}
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

                  {/* ALINHAMENTOS DE PARÁGRAFO */}
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

                    {/* BOTÃO: RECUO DE PRIMEIRA LINHA VIA CSS */}
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
                      <span>🧹</span>
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

              {/* ASSISTENTE DE REVISÃO (ROLAGEM DENTRO DO EDITOR SEM MOVER A PÁGINA) */}
              {showCorrectionsPanel && textSuggestions.length > 0 && (
                <div className="bg-[#161522] border border-purple-900/60 rounded-xl p-4 space-y-3 shadow-xl">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-800/80">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
                      🪄 Assistente de Revisão ({textSuggestions.length} Alertas)
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

                          {/* AÇÕES (ISOLADAS DE PROPAGAÇÃO DE CLIQUE) */}
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
                              className="ml-1 px-2 py-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer font-bold"
                              title="Ignorar esta correção por 30 minutos"
                            >
                              ✕
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
              <span className="text-4xl text-gray-600 block">📖</span>
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
            {[
              ['Personagens', 'personagens', '👤'],
              ['Mundo', 'mundo', '🌍'],
              ['Estrutura Dramática', 'estrutura', '🏛'],
              ['Ritmo & Timeline', 'ritmo', '⏳'],
              ['Cenas', 'cenas', '🎬'],
              ['Mistérios', 'misterios', '🔍'],
              ['Plot Twists', 'twists', '⚡'],
            ].map(([label, key, icon]) => (
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
                <span>{icon}</span>
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
                className="text-gray-400 hover:text-white text-xs font-semibold cursor-pointer px-3 py-1.5 rounded-md bg-gray-800/50 hover:bg-gray-800"
                onClick={() => setActiveDrawer(null)}
              >
                ✕ Ocultar Painel
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
                          👁
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
              
              {/* Cabeçalho do Modal */}
              <div className="flex justify-between items-start pb-3 border-b border-gray-800">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${activeModalSuggestion.badgeStyle}`}>
                  {activeModalSuggestion.label}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveModalSuggestion(null)}
                  className="text-gray-400 hover:text-white text-lg font-bold p-1 cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Trecho Original */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trecho do Texto:</h3>
                <span className="text-red-300 font-mono bg-red-950/50 border border-red-900/60 px-3 py-1 rounded-lg text-sm inline-block line-through">
                  "{activeModalSuggestion.original}"
                </span>
              </div>

              {/* Explicação Detalhada */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Explicação Detalhada:</h3>
                <div className="bg-[#11111a] border border-gray-800/90 p-4 rounded-xl text-gray-200 text-sm leading-relaxed max-h-48 overflow-y-auto">
                  {activeModalSuggestion.message}
                </div>
              </div>

              {/* Sugestões de Correção (4 Principais + Dropdown para Extras) */}
              {allReplacements.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-800">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Sugestões de Correção ({allReplacements.length}):
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {/* 4 Botões Principais */}
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

                    {/* Menu Suspenso (Dropdown) para Opções Extras */}
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

              {/* Rodapé */}
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