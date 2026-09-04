import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export default function Dashboard({ projectId, onNavigate, currentProject }) {
  const [loading, setLoading] = useState(true);

  // Estados de métricas do projeto
  const [counts, setCounts] = useState({
    personagens: 0,
    mundo: 0,
    cenas: 0,
    misterios: 0,
    twists: 0,
    checklistDone: 0,
    checklistTotal: 43
  });

  // Estados de progresso por módulo
  const [moduleProgress, setModuleProgress] = useState({
    identidade: 0,
    essencia: 0,
    engenharia: 0,
    estrutura: 0,
    ritmo: 0
  });

  // Estado dos marcos da Linha do Tempo
  const [timelineMilestones, setTimelineMilestones] = useState({
    incitingIncident: false,
    firstPlotPoint: false,
    midpoint: false,
    crisis: false,
    climax: false,
    resolution: false
  });

  // Carregar todos os dados do projeto
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
          resEntities,
          resChecklist
        ] = await Promise.all([
          apiClient.get(`/projects/${projectId}/characters`).catch(() => apiClient.get(`/entities?projectId=${projectId}&entityType=character`).catch(() => ({ data: [] }))),
          apiClient.get(`/projects/${projectId}/world`).catch(() => apiClient.get(`/entities?projectId=${projectId}&entityType=world`).catch(() => ({ data: [] }))),
          apiClient.get(`/projects/${projectId}/scenes`).catch(() => apiClient.get(`/entities?projectId=${projectId}&entityType=scene`).catch(() => ({ data: [] }))),
          apiClient.get(`/projects/${projectId}/mysteries`).catch(() => apiClient.get(`/entities?projectId=${projectId}&entityType=mystery`).catch(() => ({ data: [] }))),
          apiClient.get(`/projects/${projectId}/twists`).catch(() => apiClient.get(`/entities?projectId=${projectId}&entityType=twist`).catch(() => ({ data: [] }))),
          apiClient.get(`/entities?projectId=${projectId}`).catch(() => ({ data: [] })),
          apiClient.get(`/projects/${projectId}/checklist`).catch(() => apiClient.get(`/entities?projectId=${projectId}&entityType=checklist`).catch(() => ({ data: {} })))
        ]);

        const chars = Array.isArray(resChars.data) ? resChars.data : [];
        const world = Array.isArray(resWorld.data) ? resWorld.data : [];
        const scenes = Array.isArray(resScenes.data) ? resScenes.data : [];
        const mysteries = Array.isArray(resMysteries.data) ? resMysteries.data : [];
        const twists = Array.isArray(resTwists.data) ? resTwists.data : [];
        const allEntities = Array.isArray(resEntities.data) ? resEntities.data : [];

        // 1. Checklist
        const chkData = resChecklist.data?.data || resChecklist.data || {};
        const completedChecklist = Object.values(chkData).filter(Boolean).length;

        setCounts({
          personagens: chars.length,
          mundo: world.length,
          cenas: scenes.length,
          misterios: mysteries.length,
          twists: twists.length,
          checklistDone: completedChecklist,
          checklistTotal: 43
        });

        // 2. Auxiliar para calcular % de campos preenchidos nos Módulos
        const calcPercent = (dataObj) => {
          if (!dataObj || typeof dataObj !== 'object') return 0;
          const target = dataObj.data || dataObj;
          const keys = Object.keys(target);
          if (keys.length === 0) return 0;
          const filled = keys.filter((k) => {
            const v = target[k];
            if (typeof v === 'string') return v.trim().length > 0;
            if (typeof v === 'boolean') return v;
            if (Array.isArray(v)) return v.length > 0;
            return Boolean(v);
          });
          return Math.round((filled.length / keys.length) * 100);
        };

        const findEntity = (type) => allEntities.find((e) => e.entityType === type || e.type === type) || {};

        const identityData = findEntity('identity');
        const essenceData = findEntity('essencia');
        const engData = findEntity('engenharia');
        const dramaData = findEntity('estrutura-dramatica');
        const timelineData = findEntity('ritmo-timeline');

        setModuleProgress({
          identidade: calcPercent(identityData),
          essencia: calcPercent(essenceData),
          engenharia: calcPercent(engData),
          estrutura: calcPercent(dramaData),
          ritmo: calcPercent(timelineData)
        });

        // 3. Linha do Tempo
        const tData = timelineData.data || timelineData;
        setTimelineMilestones({
          incitingIncident: Boolean(tData.incitingIncident && String(tData.incitingIncident).trim().length > 0),
          firstPlotPoint: Boolean(tData.firstPlotPoint && String(tData.firstPlotPoint).trim().length > 0),
          midpoint: Boolean(tData.midpoint && String(tData.midpoint).trim().length > 0),
          crisis: Boolean(tData.crisis && String(tData.crisis).trim().length > 0),
          climax: Boolean(tData.climax && String(tData.climax).trim().length > 0),
          resolution: Boolean(tData.resolution && String(tData.resolution).trim().length > 0)
        });

      } catch (err) {
        console.error('Erro ao carregar Dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [projectId]);

  // Cálculo do Progresso Geral
  const overallProgress = Math.round(
    (moduleProgress.identidade +
      moduleProgress.essencia +
      moduleProgress.engenharia +
      moduleProgress.estrutura +
      moduleProgress.ritmo +
      (counts.checklistDone / counts.checklistTotal) * 100) / 6
  );

  if (loading) {
    return <div className="text-center py-20 text-purple-400 font-medium">Carregando Dashboard do Projeto...</div>;
  }

  const milestonesList = [
    { key: 'incitingIncident', label: 'Incidente Incitante', active: timelineMilestones.incitingIncident },
    { key: 'firstPlotPoint', label: '1ª Virada', active: timelineMilestones.firstPlotPoint },
    { key: 'midpoint', label: 'Midpoint', active: timelineMilestones.midpoint },
    { key: 'crisis', label: 'Crise', active: timelineMilestones.crisis },
    { key: 'climax', label: 'Clímax', active: timelineMilestones.climax },
    { key: 'resolution', label: 'Resolução', active: timelineMilestones.resolution }
  ];

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
          {[
            { title: 'Personagens', count: counts.personagens, icon: '👥', page: 'personagens' },
            { title: 'Elementos do Mundo', count: counts.mundo, icon: '🌍', page: 'mundo' },
            { title: 'Cenas', count: counts.cenas, icon: '🎬', page: 'cenas' },
            { title: 'Mistérios', count: counts.misterios, icon: '🔍', page: 'misterios' },
            { title: 'Plot Twists', count: counts.twists, icon: '⚡', page: 'plot-twists' },
            { title: 'Checklist', count: `${counts.checklistDone}/${counts.checklistTotal}`, icon: '✅', page: 'checklist' }
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate && onNavigate(item.page)}
              className="p-6 bg-[#12121a] hover:bg-[#181826] border border-gray-800/80 hover:border-purple-600/50 rounded-2xl transition-all cursor-pointer group flex justify-between items-start shadow-lg"
            >
              <div className="space-y-3">
                <span className="text-2xl block">{item.icon}</span>
                <div>
                  <span className="text-3xl font-extrabold text-white group-hover:text-purple-300 transition-colors">
                    {item.count}
                  </span>
                  <p className="text-xs text-gray-400 font-medium">{item.title}</p>
                </div>
              </div>
              <span className="text-gray-600 group-hover:text-purple-400 text-sm transition-colors">
                →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PROGRESSO DOS MÓDULOS */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            PROGRESSO DOS MÓDULOS
          </h2>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('escrita')}
            className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            Continuar →
          </button>
        </div>

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

      {/* 4. LINHA DO TEMPO */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          LINHA DO TEMPO
        </h2>

        <div className="p-8 bg-[#12121a] border border-gray-800/80 rounded-2xl shadow-xl">
          <div className="relative flex justify-between items-center max-w-4xl mx-auto">
            <div className="absolute top-3 left-0 w-full h-1 bg-[#181824] z-0" />
            <div
              className="absolute top-3 left-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-amber-500 z-0 transition-all duration-500 shadow-lg shadow-purple-900/50"
              style={{
                width: `${
                  (milestonesList.filter((m) => m.active).length / milestonesList.length) * 100
                }%`
              }}
            />

            {milestonesList.map((m, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate && onNavigate('ritmo')}
                className="relative z-10 flex flex-col items-center cursor-pointer group"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    m.active
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/80 ring-4 ring-purple-950 scale-110'
                      : 'bg-[#181824] border-2 border-gray-700 text-gray-600 group-hover:border-purple-500'
                  }`}
                >
                  <span className="text-[10px] font-extrabold">{m.active ? '✦' : '◇'}</span>
                </div>

                <span
                  className={`text-[11px] font-bold mt-3 text-center transition-colors ${
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