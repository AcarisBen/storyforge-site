import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const EMOTIONS = [
  { key: 'curiosidade', label: 'Curiosidade', color: '#a855f7' },
  { key: 'tensao', label: 'Tensão', color: '#ef4444' },
  { key: 'esperanca', label: 'Esperança', color: '#10b981' },
  { key: 'medo', label: 'Medo', color: '#6366f1' },
  { key: 'tristeza', label: 'Tristeza', color: '#3b82f6' },
  { key: 'choque', label: 'Choque', color: '#f97316' },
  { key: 'alegria', label: 'Alegria', color: '#eab308' },
  { key: 'alivio', label: 'Alívio', color: '#14b8a6' },
];

const RELATION_TYPE_COLORS = {
  Amizade: '#10b981',
  Romance: '#f97316',
  Romântica: '#f97316',
  Rivalidade: '#ef4444',
  Inimizade: '#ef4444',
  Familiar: '#3b82f6',
  Familia: '#3b82f6',
  Profissional: '#a855f7',
  Mentor: '#eab308',
  Outro: '#6b7280'
};

const ESSENCIA_FIELDS = [
  'O que torna a história única?',
  'O que torna a história universal?',
  'Pergunta filosófica',
  'Premissa',
  'Questão dramática',
  'Promessa ao público'
];

export default function Dashboard({ projectId, onNavigate, currentProject }) {
  const [loading, setLoading] = useState(true);

  const [counts, setCounts] = useState({
    personagens: 0,
    mundo: 0,
    cenas: 0,
    misteriosList: [],
    twistsList: [],
    checklistDone: 0,
    checklistTotal: 77,
    mapaEmocionalPoints: [],
    relationsList: [],
    allCharacters: []
  });

  const [moduleProgress, setModuleProgress] = useState({
    identidade: 0,
    essencia: 0,
    engenharia: 0,
    estrutura: 0,
    ritmo: 0
  });

  const [timelineEvents, setTimelineEvents] = useState({});

  useEffect(() => {
    if (!projectId) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [
          resChars,
          resWorld,
          resScenes,
          resMysteries,
          resTwists,
          resIdentity,
          resEssence,
          resEng,
          resDrama,
          resTimeline,
          resChecklist,
          resEmotional,
          resRelations
        ] = await Promise.all([
          apiClient.get(`/entities/projects/${projectId}/characters`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/world`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/scenes`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/mysteries`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/twists`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/identity`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/essencia`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/engenharia`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/estrutura-dramatica`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/ritmo-timeline`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/checklist`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/mapa-emocional`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/relations`).catch(() => ({ data: [] }))
        ]);

        const extractArray = (res) => {
          if (!res || !res.data) return [];
          if (Array.isArray(res.data)) return res.data;
          if (Array.isArray(res.data.data)) return res.data.data;
          return [];
        };

        const chars = extractArray(resChars);
        const world = extractArray(resWorld);
        const scenes = extractArray(resScenes);
        const mysteries = extractArray(resMysteries);
        const twists = extractArray(resTwists);
        const emotionalPoints = extractArray(resEmotional);
        const relations = extractArray(resRelations);

        const chkData = resChecklist.data?.data || resChecklist.data || {};
        const completedChecklist = typeof chkData === 'object' && chkData !== null
          ? Object.values(chkData).filter(Boolean).length
          : 0;

        setCounts({
          personagens: chars.length,
          mundo: world.length,
          cenas: scenes.length,
          misteriosList: mysteries.map((m) => m.title || m.name || 'Mistério sem título'),
          twistsList: twists.map((t) => t.title || t.name || 'Plot Twist sem título'),
          checklistDone: completedChecklist,
          checklistTotal: 77,
          mapaEmocionalPoints: emotionalPoints,
          relationsList: relations,
          allCharacters: chars
        });

        const unwrapObject = (resObj) => {
          if (!resObj) return {};
          if (resObj.data && typeof resObj.data === 'object') {
            return resObj.data.data || resObj.data;
          }
          return resObj;
        };

        const calcEssenciaPercent = (rawRes) => {
          const dataObj = unwrapObject(rawRes);
          if (typeof dataObj !== 'object' || dataObj === null) return 0;

          let filled = 0;
          ESSENCIA_FIELDS.forEach((fieldKey) => {
            const val = dataObj[fieldKey];
            if (typeof val === 'string' && val.trim().length > 0) {
              filled += 1;
            }
          });

          return Math.round((filled / ESSENCIA_FIELDS.length) * 100);
        };

        const calcEstruturaPercent = (rawRes) => {
          const dataObj = unwrapObject(rawRes);
          if (typeof dataObj !== 'object' || dataObj === null) return 0;

          const selectedFrameworks = Array.isArray(dataObj.selectedFrameworks) ? dataObj.selectedFrameworks : [];
          if (selectedFrameworks.length === 0) return 0;

          const values = dataObj.values || {};
          const countFilled = (obj) => Object.values(obj).filter((val) => typeof val === 'string' && val.trim() !== '').length;

          let selectedFieldCount = 0;
          let completedFieldCount = 0;

          if (selectedFrameworks.includes('3 Atos')) {
            selectedFieldCount += 3;
            completedFieldCount += countFilled(values.acts || {});
          }
          if (selectedFrameworks.includes('8 Sequências (Paul Gulino)')) {
            selectedFieldCount += 8;
            completedFieldCount += countFilled(values.sequences || {});
          }
          if (selectedFrameworks.includes('Jornada do Herói')) {
            selectedFieldCount += 12;
            completedFieldCount += countFilled(values.hero || {});
          }
          if (selectedFrameworks.includes('Story Circle (Dan Harmon)')) {
            selectedFieldCount += 8;
            completedFieldCount += countFilled(values.storyCircle || {});
          }
          if (selectedFrameworks.includes('Save the Cat (Blake Snyder)')) {
            selectedFieldCount += 15;
            completedFieldCount += countFilled(values.saveTheCat || {});
          }
          if (selectedFrameworks.includes('Freytag (Pirâmide Dramática)')) {
            selectedFieldCount += 5;
            completedFieldCount += countFilled(values.freytag || {});
          }

          if (selectedFieldCount === 0) return 0;
          return Math.round((completedFieldCount / selectedFieldCount) * 100);
        };

        const calcPercent = (rawRes) => {
          const dataObj = unwrapObject(rawRes);
          if (typeof dataObj !== 'object' || dataObj === null) return 0;
          
          const keys = Object.keys(dataObj).filter(k => k !== 'id' && k !== 'projectId' && k !== 'createdAt' && k !== 'updatedAt');
          if (keys.length === 0) return 0;

          const filled = keys.filter((k) => {
            const v = dataObj[k];
            if (typeof v === 'string') return v.trim().length > 0;
            if (typeof v === 'boolean') return v;
            if (Array.isArray(v)) return v.length > 0;
            if (typeof v === 'number') return true;
            if (v && typeof v === 'object') return Object.keys(v).length > 0;
            return Boolean(v);
          });

          return Math.round((filled.length / keys.length) * 100);
        };

        const tObj = unwrapObject(resTimeline);
        setTimelineEvents(tObj);

        const timelineKeys = [
          'Prólogo',
          'Incidente Incitante',
          '1º Ponto de Virada',
          'Midpoint',
          'Crise',
          'Clímax',
          'Resolução',
          'Epílogo'
        ];
        const activeTimelineCount = timelineKeys.filter(key => Array.isArray(tObj[key]) && tObj[key].length > 0).length;
        const ritmoPercent = Math.round((activeTimelineCount / 8) * 100);

        setModuleProgress({
          identidade: calcPercent(resIdentity),
          essencia: calcEssenciaPercent(resEssence),
          engenharia: calcPercent(resEng),
          estrutura: calcEstruturaPercent(resDrama),
          ritmo: ritmoPercent
        });

      } catch (err) {
        console.error('Erro ao carregar Dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [projectId]);

  const overallProgress = Math.round(
    (moduleProgress.identidade +
      moduleProgress.essencia +
      moduleProgress.engenharia +
      moduleProgress.estrutura +
      moduleProgress.ritmo +
      (counts.checklistTotal > 0 ? (counts.checklistDone / counts.checklistTotal) * 100 : 0)) / 6
  );

  if (loading) {
    return <div className="text-center py-20 text-purple-400 font-medium">Carregando Dashboard do Projeto...</div>;
  }

  // Mapeamento dos 8 marcos com cores específicas do módulo Ritmo & Timeline
  const milestonesList = [
    { label: 'Prólogo', active: Array.isArray(timelineEvents['Prólogo']) && timelineEvents['Prólogo'].length > 0, activeColor: 'bg-indigo-600 shadow-indigo-600/80 ring-indigo-950 text-indigo-200' },
    { label: 'I. Incitante', active: Array.isArray(timelineEvents['Incidente Incitante']) && timelineEvents['Incidente Incitante'].length > 0, activeColor: 'bg-purple-600 shadow-purple-600/80 ring-purple-950 text-purple-200' },
    { label: '1ª Virada', active: Array.isArray(timelineEvents['1º Ponto de Virada']) && timelineEvents['1º Ponto de Virada'].length > 0, activeColor: 'bg-blue-600 shadow-blue-600/80 ring-blue-950 text-blue-200' },
    { label: 'Midpoint', active: Array.isArray(timelineEvents['Midpoint']) && timelineEvents['Midpoint'].length > 0, activeColor: 'bg-cyan-600 shadow-cyan-600/80 ring-cyan-950 text-cyan-200' },
    { label: 'Crise', active: Array.isArray(timelineEvents['Crise']) && timelineEvents['Crise'].length > 0, activeColor: 'bg-amber-600 shadow-amber-600/80 ring-amber-950 text-amber-200' },
    { label: 'Clímax', active: Array.isArray(timelineEvents['Clímax']) && timelineEvents['Clímax'].length > 0, activeColor: 'bg-red-600 shadow-red-600/80 ring-red-950 text-red-200' },
    { label: 'Resolução', active: Array.isArray(timelineEvents['Resolução']) && timelineEvents['Resolução'].length > 0, activeColor: 'bg-emerald-600 shadow-emerald-600/80 ring-emerald-950 text-emerald-200' },
    { label: 'Epílogo', active: Array.isArray(timelineEvents['Epílogo']) && timelineEvents['Epílogo'].length > 0, activeColor: 'bg-pink-600 shadow-pink-600/80 ring-pink-950 text-pink-200' }
  ];

  const getRelationGraphData = () => {
    const chars = counts.allCharacters;
    if (!chars || chars.length === 0) return { nodes: [], edges: [] };

    const radius = 34;
    const centerX = 100;
    const centerY = 50;

    const nodes = chars.map((c, index) => {
      const angle = (index / chars.length) * 2 * Math.PI - Math.PI / 2;
      return {
        id: c.id,
        name: c.name || c.nome || 'Personagem',
        x: chars.length === 1 ? centerX : centerX + radius * Math.cos(angle),
        y: chars.length === 1 ? centerY : centerY + radius * Math.sin(angle)
      };
    });

    const edges = counts.relationsList.map((rel) => {
      const typeStr = rel.type || 'Amizade';
      const color = RELATION_TYPE_COLORS[typeStr] || '#ea580c';
      const intensityNum = Number(rel.intensity ?? 5);
      const strokeWidth = Math.max(1.5, Math.min(4, (intensityNum / 10) * 4));

      return {
        fromId: rel.charAId,
        toId: rel.charBId,
        type: typeStr,
        color,
        strokeWidth,
        initial: typeStr[0].toUpperCase()
      };
    });

    return { nodes, edges };
  };

  const { nodes: relationNodes, edges: relationEdges } = getRelationGraphData();

  return (
    <main className="dashboard-page max-w-6xl mx-auto space-y-10 pb-32 text-gray-200 font-sans">
      
      {/* 1. CABEÇALHO DO PROJETO & PROGRESSO GERAL */}
      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#181824] text-xs text-gray-400 border border-gray-800 rounded-full font-medium">
            {currentProject?.format || 'Romance / Livro'}
          </span>
          <span className="px-3 py-1 bg-amber-950/40 text-xs text-amber-400 border border-amber-800/50 rounded-full font-bold">
            {currentProject?.status || 'Desenvolvimento'}
          </span>
          <span className="px-3 py-1 bg-[#181824] text-xs text-gray-400 border border-gray-800 rounded-full font-medium">
            {currentProject?.genre || 'Fantasia'}
          </span>
        </div>

        <h1 className="text-5xl font-black text-white tracking-tight">
          {currentProject?.title || 'Projeto sem Título'}
        </h1>

        <div className="space-y-2 pt-2 max-w-md">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-gray-400">Progresso Geral</span>
            <span className="text-white">{overallProgress}%</span>
          </div>
          <div className="w-full bg-[#181824] h-2 rounded-full overflow-hidden border border-gray-800">
            <div
              className="bg-gradient-to-r from-purple-600 via-indigo-500 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </header>

      {/* 2. VISÃO GERAL */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          VISÃO GERAL
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div
            onClick={() => onNavigate && onNavigate('personagens')}
            className="p-6 bg-[#12121a] hover:bg-[#181826] border border-gray-800/80 hover:border-purple-600/50 rounded-2xl transition-all cursor-pointer group flex justify-between items-start shadow-lg"
          >
            <div className="space-y-3">
              <span className="text-2xl block">👥</span>
              <div>
                <span className="text-3xl font-extrabold text-white group-hover:text-purple-300 transition-colors">
                  {counts.personagens}
                </span>
                <p className="text-xs text-gray-400 font-medium">Personagens Cadastrados</p>
              </div>
            </div>
            {/* <span className="text-gray-600 group-hover:text-purple-400 text-sm transition-colors">→</span> */}
          </div>

          <div
            onClick={() => onNavigate && onNavigate('mundo')}
            className="p-6 bg-[#12121a] hover:bg-[#181826] border border-gray-800/80 hover:border-purple-600/50 rounded-2xl transition-all cursor-pointer group flex justify-between items-start shadow-lg"
          >
            <div className="space-y-3">
              <span className="text-2xl block">🌍</span>
              <div>
                <span className="text-3xl font-extrabold text-white group-hover:text-purple-300 transition-colors">
                  {counts.mundo}
                </span>
                <p className="text-xs text-gray-400 font-medium">Elementos do Mundo</p>
              </div>
            </div>
            {/* <span className="text-gray-600 group-hover:text-purple-400 text-sm transition-colors">→</span> */}
          </div>

          <div
            onClick={() => onNavigate && onNavigate('cenas')}
            className="p-6 bg-[#12121a] hover:bg-[#181826] border border-gray-800/80 hover:border-purple-600/50 rounded-2xl transition-all cursor-pointer group flex justify-between items-start shadow-lg"
          >
            <div className="space-y-3">
              <span className="text-2xl block">🎬</span>
              <div>
                <span className="text-3xl font-extrabold text-white group-hover:text-purple-300 transition-colors">
                  {counts.cenas}
                </span>
                <p className="text-xs text-gray-400 font-medium">Cenas Mapeadas</p>
              </div>
            </div>
            {/* <span className="text-gray-600 group-hover:text-purple-400 text-sm transition-colors">→</span> */}
          </div>

          <div
            onClick={() => onNavigate && onNavigate('misterios')}
            className="p-6 bg-[#12121a] hover:bg-[#181826] border border-gray-800/80 hover:border-purple-600/50 rounded-2xl transition-all cursor-pointer group flex flex-col justify-between shadow-lg min-h-[140px]"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl">🔍</span>
                {/* <span className="text-gray-600 group-hover:text-purple-400 text-sm transition-colors">→</span> */}
              </div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Mistérios</p>
              {counts.misteriosList.length > 0 ? (
                <ul className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {counts.misteriosList.slice(0, 3).map((title, idx) => (
                    <li key={idx} className="text-xs text-gray-200 truncate font-medium flex items-center gap-1.5">
                      <span className="text-purple-400 text-[10px]">✦</span> {title}
                    </li>
                  ))}
                  {counts.misteriosList.length > 3 && (
                    <li className="text-[10px] text-gray-500 italic">
                      + {counts.misteriosList.length - 3} outro(s)...
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-xs text-gray-600 italic">Nenhum mistério adicionado</p>
              )}
            </div>
          </div>

          <div
            onClick={() => onNavigate && onNavigate('plot-twists')}
            className="p-6 bg-[#12121a] hover:bg-[#181826] border border-gray-800/80 hover:border-purple-600/50 rounded-2xl transition-all cursor-pointer group flex flex-col justify-between shadow-lg min-h-[140px]"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl">⚡</span>
                {/* <span className="text-gray-600 group-hover:text-purple-400 text-sm transition-colors">→</span> */}
              </div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Plot Twists</p>
              {counts.twistsList.length > 0 ? (
                <ul className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {counts.twistsList.slice(0, 3).map((title, idx) => (
                    <li key={idx} className="text-xs text-gray-200 truncate font-medium flex items-center gap-1.5">
                      <span className="text-amber-400 text-[10px]">⚡</span> {title}
                    </li>
                  ))}
                  {counts.twistsList.length > 3 && (
                    <li className="text-[10px] text-gray-500 italic">
                      + {counts.twistsList.length - 3} outro(s)...
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-xs text-gray-600 italic">Nenhum plot twist adicionado</p>
              )}
            </div>
          </div>

          <div
            onClick={() => onNavigate && onNavigate('checklist')}
            className="p-6 bg-[#12121a] hover:bg-[#181826] border border-gray-800/80 hover:border-purple-600/50 rounded-2xl transition-all cursor-pointer group flex justify-between items-start shadow-lg"
          >
            <div className="space-y-3">
              <span className="text-2xl block">✅</span>
              <div>
                <span className="text-3xl font-extrabold text-white group-hover:text-purple-300 transition-colors">
                  {counts.checklistDone}/{counts.checklistTotal}
                </span>
                <p className="text-xs text-gray-400 font-medium">Itens da Checklist</p>
              </div>
            </div>
            {/* <span className="text-gray-600 group-hover:text-purple-400 text-sm transition-colors">→</span> */}
          </div>

        </div>

        {/* PAINEL DUPLO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          
          {/* MAPA EMOCIONAL */}
          <div
            onClick={() => onNavigate && onNavigate('mapa-emocional')}
            className="p-6 bg-[#12121a] hover:bg-[#181826] border border-gray-800/80 hover:border-purple-600/50 rounded-2xl transition-all cursor-pointer group space-y-4 shadow-lg flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">📈</span>
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">MAPA EMOCIONAL</span>
              </div>
              {/* <span className="text-gray-600 group-hover:text-purple-400 text-sm transition-colors">→</span> */}
            </div>

            <div className="w-full h-44 bg-[#181824] rounded-xl p-4 border border-gray-800 flex flex-col justify-between relative overflow-hidden">
              {counts.mapaEmocionalPoints.length > 0 ? (
                <div className="w-full h-full flex flex-col justify-between">
                  <svg className="w-full h-32 overflow-visible" viewBox="0 0 200 80" preserveAspectRatio="none">
                    <line x1="0" y1="10" x2="200" y2="10" stroke="#262636" strokeDasharray="2 2" />
                    <line x1="0" y1="38" x2="200" y2="38" stroke="#262636" strokeDasharray="2 2" />
                    <line x1="0" y1="58" x2="200" y2="58" stroke="#262636" strokeDasharray="2 2" />
                    <line x1="0" y1="78" x2="200" y2="78" stroke="#262636" strokeDasharray="2 2" />

                    {EMOTIONS.map((emotion) => {
                      const pts = counts.mapaEmocionalPoints.map((point, index) => {
                        const total = counts.mapaEmocionalPoints.length;
                        const x = total > 1 ? (index / (total - 1)) * 200 : 100;
                        const val = Number(point[emotion.key] ?? 0);
                        const y = 78 - (val / 10) * 68;
                        return { x, y, val };
                      });

                      let pathD = '';
                      pts.forEach((pt, i) => {
                        if (i === 0) {
                          pathD += `M ${pt.x} ${pt.y}`;
                        } else {
                          const prev = pts[i - 1];
                          const cX = prev.x + (pt.x - prev.x) / 2;
                          pathD += ` C ${cX} ${prev.y}, ${cX} ${pt.y}, ${pt.x} ${pt.y}`;
                        }
                      });

                      return (
                        <g key={emotion.key}>
                          <path
                            d={pathD}
                            fill="none"
                            stroke={emotion.color}
                            strokeWidth="1.8"
                            opacity="0.85"
                          />
                          {pts.map((pt, pIdx) => (
                            <circle
                              key={pIdx}
                              cx={pt.x}
                              cy={pt.y}
                              r="3"
                              fill={emotion.color}
                              stroke="#12121a"
                              strokeWidth="1"
                            />
                          ))}
                        </g>
                      );
                    })}
                  </svg>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-800/80 px-1 text-[9px] text-gray-400 font-semibold truncate">
                    {counts.mapaEmocionalPoints.map((pt, idx) => (
                      <span key={idx} className="truncate max-w-[50px] text-center" title={pt.name}>
                        {pt.name || `Ponto ${idx + 1}`}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic text-center my-auto">
                  Nenhum ponto emocional mapeado ainda.<br />Clique para cadastrar no Mapa Emocional.
                </p>
              )}
            </div>
          </div>

          {/* RELAÇÕES DE PERSONAGENS */}
          <div
            onClick={() => onNavigate && onNavigate('relacoes')}
            className="p-6 bg-[#12121a] hover:bg-[#181826] border border-gray-800/80 hover:border-purple-600/50 rounded-2xl transition-all cursor-pointer group space-y-4 shadow-lg flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">🕸️</span>
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">RELAÇÕES DE PERSONAGENS</span>
              </div>
              {/* <span className="text-gray-600 group-hover:text-purple-400 text-sm transition-colors">→</span> */}
            </div>

            <div className="w-full h-44 bg-[#181824] rounded-xl p-4 border border-gray-800 flex items-center justify-center relative overflow-hidden">
              {relationNodes.length > 0 ? (
                <div className="relative w-full h-full">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
                    {relationEdges.map((edge, idx) => {
                      const sourceNode = relationNodes.find((n) => String(n.id) === String(edge.fromId));
                      const targetNode = relationNodes.find((n) => String(n.id) === String(edge.toId));

                      if (!sourceNode || !targetNode) return null;

                      const midX = (sourceNode.x + targetNode.x) / 2;
                      const midY = (sourceNode.y + targetNode.y) / 2;

                      return (
                        <g key={idx}>
                          <line
                            x1={sourceNode.x}
                            y1={sourceNode.y}
                            x2={targetNode.x}
                            y2={targetNode.y}
                            stroke={edge.color}
                            strokeWidth={edge.strokeWidth}
                            strokeLinecap="round"
                          />
                          <circle cx={midX} cy={midY} r="5" fill={edge.color} stroke="#12121a" strokeWidth="1" />
                          <text
                            x={midX}
                            y={midY + 2.5}
                            fill="#ffffff"
                            fontSize="6"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {edge.initial}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {relationNodes.map((node, idx) => (
                    <div
                      key={idx}
                      style={{
                        left: `${(node.x / 200) * 100}%`,
                        top: `${(node.y / 100) * 100}%`
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-[#12121a] border-2 border-orange-500 text-[10px] font-bold text-white shadow-xl truncate max-w-[85px] text-center"
                    >
                      {node.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic text-center">
                  Nenhum personagem cadastrado para o grafo de relações.
                </p>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 3. PROGRESSO DOS MÓDULOS */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          PROGRESSO DOS MÓDULOS
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: 'Identidade', percent: moduleProgress.identidade, page: 'identidade' },
            { name: 'Essência', percent: moduleProgress.essencia, page: 'essencia' },
            { name: 'Engenharia', percent: moduleProgress.engenharia, page: 'engenharia' },
            { name: 'Estrutura', percent: moduleProgress.estrutura, page: 'estrutura' },
            { name: 'Ritmo', percent: moduleProgress.ritmo, page: 'ritmo' }
          ].map((m, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate && onNavigate(m.page)}
              className="p-5 bg-[#12121a] hover:bg-[#181826] border border-gray-800/80 hover:border-purple-600/50 rounded-2xl transition-all cursor-pointer group space-y-4 shadow-lg"
            >
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">{m.name}</p>
                <span className="text-2xl font-black text-white group-hover:text-purple-300 transition-colors">
                  {m.percent}%
                </span>
              </div>
              <div className="w-full bg-[#181824] h-1.5 rounded-full overflow-hidden border border-gray-800">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${m.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. LINHA DO TEMPO (ROXO AO LARANJA + CORES INDIVIDUAIS NOS NÓS + ESPESSURA H-1) */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          LINHA DO TEMPO (ESTRUTURA DE 3 ATOS)
        </h2>

        <div className="p-8 bg-[#12121a] border border-gray-800/80 rounded-2xl shadow-xl">
          <div className="relative flex justify-between items-center max-w-5xl mx-auto px-4">
            
            {/* Linha base cinza no fundo com espessura h-1 */}
            <div className="absolute top-3 left-6 right-6 h-1 bg-[#181824] z-0" />

            {/* Linhas conectoras com gradiente contínuo Roxo (#9333ea) -> Laranja (#f97316) */}
            <div className="absolute top-3 left-6 right-6 h-1 z-0 flex pointer-events-none">
              {milestonesList.slice(0, -1).map((m, idx) => {
                const nextM = milestonesList[idx + 1];
                const isSegmentActive = m.active && nextM.active;

                const totalSegments = milestonesList.length - 1;
                const startRatio = idx / totalSegments;
                const endRatio = (idx + 1) / totalSegments;

                // Interpolação Hex pura de Roxo (9333ea) para Laranja (f97316)
                const startR = Math.round(147 + (249 - 147) * startRatio);
                const startG = Math.round(51 + (115 - 51) * startRatio);
                const startB = Math.round(234 + (22 - 234) * startRatio);

                const endR = Math.round(147 + (249 - 147) * endRatio);
                const endG = Math.round(51 + (115 - 51) * endRatio);
                const endB = Math.round(234 + (22 - 234) * endRatio);

                return (
                  <div key={idx} className="flex-1 h-full relative">
                    {isSegmentActive && (
                      <div
                        className="w-full h-full transition-all duration-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]"
                        style={{
                          background: `linear-gradient(to right, 
                            rgb(${startR}, ${startG}, ${startB}), 
                            rgb(${endR}, ${endG}, ${endB})
                          )`
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Renderização dos nós dos 8 marcos com a cor do módulo individual */}
            {milestonesList.map((m, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate && onNavigate('ritmo')}
                className="relative z-10 flex flex-col items-center cursor-pointer group"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    m.active
                      ? `${m.activeColor} shadow-lg ring-4 scale-110`
                      : 'bg-[#181824] border-2 border-gray-700 text-gray-600 group-hover:border-purple-500'
                  }`}
                >
                  <span className="text-[10px] font-extrabold">{m.active ? '✦' : '◇'}</span>
                </div>

                <span
                  className={`text-[10px] font-bold mt-3 text-center transition-colors max-w-[70px] leading-tight ${
                    m.active ? 'text-purple-300 font-extrabold' : 'text-gray-500 group-hover:text-gray-300'
                  }`}
                >
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}