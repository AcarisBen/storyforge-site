import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

// Ordem dramática fixa para os Marcos Narrativos da Timeline
const NARRATIVE_ORDER = [
  'Prólogo',
  'Ato I',
  'Inciting Incident',
  'Gatilho',
  'Ato II',
  'Midpoint',
  'Ponto de Virada',
  'Clímax',
  'Ato III',
  'Resolução',
  'Epílogo'
];

function getCharacterBadgeStyle(type = '') {
  const norm = String(type).toLowerCase();
  if (norm.includes('protagonista')) return 'bg-purple-900/60 text-purple-300 border-purple-500/50';
  if (norm.includes('antagonista')) return 'bg-red-900/60 text-red-300 border-red-500/50';
  if (norm.includes('secundario') || norm.includes('secundário')) return 'bg-blue-900/60 text-blue-300 border-blue-500/50';
  return 'bg-gray-800 text-gray-300 border-gray-700';
}

function getWorldBadgeStyle(type = '') {
  const norm = String(type).toLowerCase();
  if (norm.includes('planeta') || norm.includes('país') || norm.includes('cidade')) return 'bg-blue-900/60 text-blue-300 border-blue-500/50';
  if (norm.includes('política') || norm.includes('economia') || norm.includes('tecnologia')) return 'bg-amber-900/60 text-amber-300 border-amber-500/50';
  if (norm.includes('fauna') || norm.includes('flora') || norm.includes('bioma')) return 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50';
  if (norm.includes('magia') || norm.includes('poderes') || norm.includes('combate')) return 'bg-red-900/60 text-red-300 border-red-500/50';
  return 'bg-purple-900/60 text-purple-300 border-purple-500/50';
}

export default function StoryBible({ projectId }) {
  const [loading, setLoading] = useState(true);

  const [openSections, setOpenSections] = useState({
    fundacao: true,
    estrutura: true,
    universo: true,
    jornada: true,
    mapaEmocional: true,
    checklist: true,
    manuscrito: true,
  });

  const [data, setData] = useState({
    identity: {},
    essencia: {},
    engenharia: {},
    structureFrameworks: [],
    structureCards: [],
    timelineEvents: {},
    world: [],
    characters: [],
    relations: [],
    scenes: [],
    mysteries: [],
    twists: [],
    emotionalPoints: [],
    checklist: {},
    chapters: [],
  });

  useEffect(() => {
    if (!projectId) return;

    const fetchFullBibleData = async () => {
      try {
        setLoading(true);

        const [
          resIdentity,
          resEssencia,
          resEngenharia,
          resStructure,
          resStructureCards,
          resTimeline,
          resWorld,
          resChars,
          resRelations,
          resScenes,
          resMysteries,
          resTwists,
          resEmotionalMap,
          resChecklist,
          resChapters,
        ] = await Promise.all([
          apiClient.get(`/entities/projects/${projectId}/identity`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/essencia`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/engenharia`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/estrutura-dramatica`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/estrutura-dramatica/cards`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/ritmo-timeline`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/world`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/characters`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/relations`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/scenes`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/mysteries`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/twists`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/mapa-emocional`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/checklist`).catch(() => ({ data: {} })),
          apiClient.get(`/entities/projects/${projectId}/chapters`).catch(() => ({ data: [] })),
        ]);

        setData({
          identity: resIdentity.data || {},
          essencia: resEssencia.data || {},
          engenharia: resEngenharia.data || {},
          structureFrameworks: resStructure.data?.selectedFrameworks || [],
          structureCards: resStructureCards.data || [],
          timelineEvents: resTimeline.data || {},
          world: resWorld.data || [],
          characters: resChars.data || [],
          relations: resRelations.data || [],
          scenes: resScenes.data || [],
          mysteries: resMysteries.data || [],
          twists: resTwists.data || [],
          emotionalPoints: resEmotionalMap.data || [],
          checklist: resChecklist.data || {},
          chapters: resChapters.data || [],
        });
      } catch (err) {
        console.error('Erro ao montar a Story Bible completa:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFullBibleData();
  }, [projectId]);

  function toggleSection(key) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // Helper para resolver ID do personagem em Nome Real
  function getCharacterName(charId) {
    const found = data.characters.find((c) => String(c.id) === String(charId));
    return found ? (found.name || found.nome) : `Personagem (${charId?.slice(0, 5)}...)`;
  }

  // Filtro: Apenas os cards que pertencem aos Frameworks selecionados
  const filteredStructureCards = data.structureCards.filter((card) =>
    data.structureFrameworks.includes(card.framework || card.type)
  );

  // Ordenação dos Marcos da Timeline baseada na ordem dramática clássica
  const sortedTimelineKeys = Object.keys(data.timelineEvents).sort((a, b) => {
    const indexA = NARRATIVE_ORDER.findIndex((item) => item.toLowerCase() === a.toLowerCase());
    const indexB = NARRATIVE_ORDER.findIndex((item) => item.toLowerCase() === b.toLowerCase());

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  const checklistDoneCount = Object.values(data.checklist).filter(Boolean).length;

  if (loading) {
    return <div className="text-center py-20 text-purple-400 font-medium">Gerando e compilando a Bíblia da História...</div>;
  }

  return (
    <main className="story-bible-page max-w-6xl mx-auto space-y-8 pb-32 text-gray-200 font-sans">
      <header className="text-center space-y-3 bg-[#11111a] border border-purple-900/40 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-amber-500" />
        <span className="text-xs uppercase tracking-widest text-purple-400 font-bold">
          📖 DOCUMENTO MESTRE NARRATIVO
        </span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          {data.identity['Título'] || 'Bíblia da História'}
        </h1>
        {data.identity['Subtítulo'] && (
          <h2 className="text-lg text-purple-300 font-medium">{data.identity['Subtítulo']}</h2>
        )}
      </header>

      {/* 1. FUNDAÇÃO */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('fundacao')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🏛</span> 1. Fundação
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Identidade, Essência e Engenharia Narrativa</p>
          </div>
          <span className="text-gray-400 font-bold text-lg">{openSections.fundacao ? '⌃' : '⌄'}</span>
        </button>

        {openSections.fundacao && (
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Identidade da Obra</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(data.identity).map(([key, val]) => (
                  <div key={key} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80">
                    <span className="text-xs font-semibold text-gray-400 block mb-1">{key}</span>
                    <p className="text-sm text-gray-200 leading-relaxed">{val || 'Não preenchido.'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/60">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Essência da História</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(data.essencia).map(([key, val]) => (
                  <div key={key} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80">
                    <span className="text-xs font-semibold text-gray-400 block mb-1">{key}</span>
                    <p className="text-sm text-gray-200 leading-relaxed">{val || 'Não preenchido.'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/60">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">Engenharia Narrativa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(data.engenharia).map(([key, val]) => (
                  <div key={key} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80">
                    <span className="text-xs font-semibold text-gray-400 block mb-1">{key}</span>
                    <p className="text-sm text-gray-200 leading-relaxed">{val || 'Não preenchido.'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. ARQUITETURA DRAMÁTICA & RITMO */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('estrutura')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>⏳</span> 2. Arquitetura Dramática & Ritmo
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Frameworks Selecionados e Linha do Tempo Ordenada
            </p>
          </div>
          <span className="text-gray-400 font-bold text-lg">{openSections.estrutura ? '⌃' : '⌄'}</span>
        </button>

        {openSections.estrutura && (
          <div className="p-6 space-y-8">
            {/* Apenas exibe elementos se pertencerem aos frameworks selecionados */}
            <div>
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">
                Frameworks Selecionados: {data.structureFrameworks.join(', ') || 'Nenhum selecionado'}
              </h3>
              {filteredStructureCards.length === 0 ? (
                <p className="text-xs text-gray-500 italic">Nenhum elemento associado aos frameworks selecionados.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredStructureCards.map((card) => (
                    <div key={card.id} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80 space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-white text-sm font-bold">{card.title}</strong>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                          {card.framework || card.type}
                        </span>
                      </div>
                      {card.descricao && <p className="text-xs text-gray-300 leading-relaxed">{card.descricao}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Linha do Tempo Ordenada Logicamente */}
            <div className="pt-4 border-t border-gray-800/60">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Linha do Tempo de Marcos Narrativos (Ordem Lógica)</h3>
              <div className="space-y-4">
                {sortedTimelineKeys.map((milestone) => {
                  const events = data.timelineEvents[milestone];
                  return (
                    <div key={milestone} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80 space-y-2">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        {milestone} ({Array.isArray(events) ? events.length : 0} eventos)
                      </h4>
                      {Array.isArray(events) && events.map((e) => (
                        <div key={e.id} className="pl-4 border-l-2 border-cyan-500/40 my-1">
                          <strong className="text-xs text-gray-200 block">{e.title}</strong>
                          <p className="text-xs text-gray-400">{e.description}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. UNIVERSO & PERSONAGENS */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('universo')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🌍</span> 3. O Universo & Personagens
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Worldbuilding, Dossiês e Teia de Relações
            </p>
          </div>
          <span className="text-gray-400 font-bold text-lg">{openSections.universo ? '⌃' : '⌄'}</span>
        </button>

        {openSections.universo && (
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Elementos do Mundo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.world.map((w) => (
                  <div key={w.id} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80 space-y-2">
                    <div className="flex justify-between items-start">
                      <strong className="text-white font-bold text-sm">{w.name}</strong>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getWorldBadgeStyle(w.type)}`}>
                        {w.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{w.description || 'Sem descrição.'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/60">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Personagens</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.characters.map((char) => (
                  <div key={char.id} className="p-5 bg-[#171724] rounded-xl border border-gray-800/80 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm ${getCharacterBadgeStyle(char.type)}`}>
                        {(char.name || char.nome || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-base">{char.name || char.nome}</h4>
                        <span className={`inline-block border px-2 py-0.5 rounded text-[10px] font-medium ${getCharacterBadgeStyle(char.type)}`}>
                          {char.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Relações com Nomes Resolvidos (Substitui UUIDs) */}
            <div className="pt-4 border-t border-gray-800/60">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">Relações entre Personagens</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.relations.map((rel) => (
                  <div key={rel.id} className="p-3 bg-[#171724] rounded-xl border border-gray-800/80 flex items-center justify-between text-xs gap-2">
                    <span className="font-bold text-white truncate max-w-[35%]">{getCharacterName(rel.charAId)}</span>
                    <span className="px-2 py-1 bg-purple-950/80 text-purple-300 border border-purple-800/50 rounded font-semibold text-[11px] text-center shrink-0">
                      {rel.type} (Intensidade {rel.intensity})
                    </span>
                    <span className="font-bold text-white truncate max-w-[35%] text-right">{getCharacterName(rel.charBId)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. SEQUÊNCIA LÓGICA DA HISTÓRIA */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('jornada')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🎬</span> 4. Sequência Lógica & Engenharia da Trama
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Cenas, Mistérios e Reviravoltas</p>
          </div>
          <span className="text-gray-400 font-bold text-lg">{openSections.jornada ? '⌃' : '⌄'}</span>
        </button>

        {openSections.jornada && (
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Sequência de Cenas</h3>
              <div className="space-y-3">
                {data.scenes.map((scene, idx) => (
                  <div key={scene.id || idx} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80 space-y-1">
                    <strong className="text-white text-sm block">#{idx + 1} - {scene.title}</strong>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-400 pt-2">
                      {scene.objective && <p><b className="text-gray-300">Objetivo:</b> {scene.objective}</p>}
                      {scene.conflict && <p><b className="text-gray-300">Conflito:</b> {scene.conflict}</p>}
                      {scene.hook && <p><b className="text-gray-300">Gancho:</b> {scene.hook}</p>}
                      {scene.plotTwist && <p><b className="text-purple-400">Plot Twist da Cena:</b> {scene.plotTwist}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 5. MAPA EMOCIONAL */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('mapaEmocional')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📈</span> 5. Mapa Emocional Esperado
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Níveis de Intensidade Emocional</p>
          </div>
          <span className="text-gray-400 font-bold text-lg">{openSections.mapaEmocional ? '⌃' : '⌄'}</span>
        </button>

        {openSections.mapaEmocional && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.emotionalPoints.map((pt) => (
                <div key={pt.id} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80 space-y-2">
                  <strong className="text-white text-sm block border-b border-gray-800 pb-1">{pt.name}</strong>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-300">
                    <span>Curiosidade: <b>{pt.curiosidade}</b></span>
                    <span>Tensão: <b>{pt.tensao}</b></span>
                    <span>Esperança: <b>{pt.esperanca}</b></span>
                    <span>Medo: <b>{pt.medo}</b></span>
                    <span>Choque: <b>{pt.choque}</b></span>
                    <span>Alívio: <b>{pt.alivio}</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 6. CHECKLIST */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('checklist')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>✅</span> 6. Checklist de Qualidade Narrativa
            </h2>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40">
            {checklistDoneCount} Concluídos
          </span>
        </button>

        {openSections.checklist && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(data.checklist).map(([itemText, isDone]) => (
                <div
                  key={itemText}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs leading-relaxed ${
                    isDone ? 'bg-[#151824] border-emerald-800/50 text-gray-200' : 'bg-[#14141d] border-gray-800/60 text-gray-500'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${
                    isDone ? 'bg-emerald-500 text-gray-950' : 'border border-gray-700 text-transparent'
                  }`}>
                    ✓
                  </span>
                  <span className={isDone ? 'line-through opacity-80' : ''}>{itemText}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 7. MANUSCRITO */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('manuscrito')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📝</span> 7. Escrita & Manuscrito Final
            </h2>
          </div>
          <span className="text-gray-400 font-bold text-lg">{openSections.manuscrito ? '⌃' : '⌄'}</span>
        </button>

        {openSections.manuscrito && (
          <div className="p-6 space-y-6">
            {data.chapters.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Nenhum capítulo redigido ainda.</p>
            ) : (
              data.chapters.map((chap, index) => (
                <article key={chap.id || index} className="p-6 bg-[#171724] rounded-xl border border-gray-800/80 space-y-3">
                  <div className="border-b border-gray-800 pb-2 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">{chap.title}</h3>
                    <span className="text-xs text-purple-400 font-medium">{chap.type}</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {chap.content || 'Sem conteúdo inserido neste capítulo.'}
                  </p>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}