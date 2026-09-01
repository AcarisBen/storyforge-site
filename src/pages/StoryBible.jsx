import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

// Helper de cores para Personagens
function getCharacterBadgeStyle(type = '') {
  const norm = String(type).toLowerCase();
  if (norm.includes('protagonista')) return 'bg-purple-900/60 text-purple-300 border-purple-500/50';
  if (norm.includes('antagonista')) return 'bg-red-900/60 text-red-300 border-red-500/50';
  if (norm.includes('secundario') || norm.includes('secundário')) return 'bg-blue-900/60 text-blue-300 border-blue-500/50';
  return 'bg-gray-800 text-gray-300 border-gray-700';
}

// Helper de cores para o Mundo
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
  
  // Controle de expansão dos 4 blocos principais
  const [openSections, setOpenSections] = useState({
    fundacao: true,
    universo: true,
    jornada: true,
    validacao: true,
  });

  const [data, setData] = useState({
    project: null,
    structure: [],
    characters: [],
    world: [],
    timeline: [],
    scenes: [],
    mysteries: [],
    twists: [],
    relations: [],
    checklist: {},
  });

  useEffect(() => {
    if (!projectId) return;

    const fetchBible = async () => {
      try {
        setLoading(true);

        const [
          resProject,
          resStruct,
          resChars,
          resWorld,
          resPacing,
          resScenes,
          resMysteries,
          resTwists,
          resRelations,
          resChecklist,
        ] = await Promise.all([
          apiClient.get(`/projects/${projectId}`).catch(() => ({ data: null })),
          apiClient.get(`/entities/projects/${projectId}/estrutura-dramatica/cards`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/characters`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/world`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/ritmo-timeline/cards`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/scenes`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/mysteries`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/twists`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/relations`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/checklist`).catch(() => ({ data: {} })),
        ]);

        setData({
          project: resProject.data,
          structure: resStruct.data || [],
          characters: resChars.data || [],
          world: resWorld.data || [],
          timeline: resPacing.data || [],
          scenes: resScenes.data || [],
          mysteries: resMysteries.data || [],
          twists: resTwists.data || [],
          relations: resRelations.data || [],
          checklist: resChecklist.data || {},
        });
      } catch (err) {
        console.error('Erro ao montar Story Bible:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBible();
  }, [projectId]);

  function toggleSection(key) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const checklistCheckedCount = Object.values(data.checklist).filter(Boolean).length;

  if (loading) {
    return <div className="text-center py-20 text-gray-500 font-medium">Compilando a Bíblia da História...</div>;
  }

  return (
    <main className="story-bible-page max-w-5xl mx-auto space-y-8 pb-24 text-gray-200">
      {/* Cabeçalho de Título & Exportação */}
      <header className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-purple-400 font-bold">
          📖 STORY BIBLE
        </span>
        <h1 className="text-4xl font-extrabold text-white">
          {data.project?.name || 'Visão Geral da Obra'}
        </h1>
        <p className="text-sm text-gray-400 max-w-xl mx-auto">
          O documento mestre compilado com a arquitetura, personagens, mundo e narrativa completa.
        </p>

        {/* Botões de Exportação */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          {['Exportar PDF', 'Exportar Markdown', 'Exportar HTML', 'Exportar JSON'].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => alert(`A exportação para ${label} estará disponível em breve!`)}
              className="px-4 py-2 bg-[#14141e] border border-gray-800 hover:border-purple-600/60 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer shadow-lg"
            >
              📄 {label}
            </button>
          ))}
        </div>
      </header>

      {/* ==========================================
          BLOCO 1: PREMISSA & ESTRUTURA TÉCNICA
          ========================================== */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('fundacao')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🏛</span> 1. Fundação Técnica & Estrutura
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Premissa, premissa dramática e frameworks estruturais ativos.
            </p>
          </div>
          <span className="text-gray-400 font-bold text-lg">{openSections.fundacao ? '⌃' : '⌄'}</span>
        </button>

        {openSections.fundacao && (
          <div className="p-6 space-y-6">
            {/* Estrutura Dramática Dinâmica (Adaptável a qualquer framework preenchido) */}
            <div>
              <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-3">
                Pontos Estruturais / Frameworks Selecionados
              </h3>
              {data.structure.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Nenhum ponto estrutural cadastrado ainda.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.structure.map((item) => (
                    <div key={item.id} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80 space-y-2">
                      <div className="flex justify-between items-start">
                        <strong className="text-white text-base font-bold">{item.title}</strong>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded border bg-purple-950/60 text-purple-300 border-purple-800/40">
                          {item.type}
                        </span>
                      </div>
                      {item.descricao && (
                        <p className="text-xs text-gray-300 leading-relaxed">{item.descricao}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ==========================================
          BLOCO 2: O UNIVERSO & OS ATORES
          ========================================== */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('universo')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>👤</span> 2. Personagens, Mundo & Relações
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Fichas completas dos personagens, geografia/regras do mundo e conexões.
            </p>
          </div>
          <span className="text-gray-400 font-bold text-lg">{openSections.universo ? '⌃' : '⌄'}</span>
        </button>

        {openSections.universo && (
          <div className="p-6 space-y-8">
            {/* Personagens */}
            <div>
              <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-4">
                Elenco de Personagens
              </h3>
              {data.characters.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Nenhum personagem cadastrado.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.characters.map((char) => (
                    <div key={char.id} className="p-5 bg-[#171724] rounded-xl border border-gray-800/80 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm ${getCharacterBadgeStyle(char.type)}`}>
                          {(char.name || char.nome || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-base">{char.name || char.nome}</h4>
                          {char.type && (
                            <span className={`inline-block border px-2 py-0.5 rounded text-[11px] font-medium ${getCharacterBadgeStyle(char.type)}`}>
                              {char.type}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Exibe todos os detalhes preenchidos do personagem */}
                      {char.details && Object.keys(char.details).length > 0 && (
                        <div className="text-xs space-y-1 pt-2 border-t border-gray-800/60 text-gray-300">
                          {Object.entries(char.details).map(([k, v]) => (
                            v && <p key={k}><strong className="text-purple-400 capitalize">{k}:</strong> {v}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Elementos do Mundo */}
            <div>
              <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-4">
                Mundo & Regras da Ambientação
              </h3>
              {data.world.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Nenhum elemento de mundo cadastrado.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.world.map((w) => (
                    <div key={w.id} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80 space-y-2">
                      <div className="flex justify-between items-start">
                        <strong className="text-white font-bold text-sm">{w.name}</strong>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getWorldBadgeStyle(w.type)}`}>
                          {w.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-3">{w.description || 'Sem descrição.'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Relações */}
            {data.relations.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-3">
                  Teia de Relações
                </h3>
                <div className="p-4 bg-[#171724] rounded-xl border border-gray-800/80 space-y-2">
                  {data.relations.map((rel) => (
                    <p key={rel.id} className="text-sm text-gray-300">
                      <span className="font-semibold text-white">{rel.from}</span>
                      <span className="text-purple-400 font-bold mx-2">➔ {rel.type} ➔</span>
                      <span className="font-semibold text-white">{rel.to}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ==========================================
          BLOCO 3: A JORNADA NARRATIVA (ROTEIRO COMPLETO)
          ========================================== */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('jornada')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🎬</span> 3. A Jornada Narrativa (Roteiro & Eventos)
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Sequência dramática do início ao fim (Timeline, Cenas, Mistérios e Viradas).
            </p>
          </div>
          <span className="text-gray-400 font-bold text-lg">{openSections.jornada ? '⌃' : '⌄'}</span>
        </button>

        {openSections.jornada && (
          <div className="p-6 space-y-8">
            {/* Timeline / Eventos Narrativos */}
            {data.timeline.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-4">
                  Marcos Narrativos & Timeline
                </h3>
                <div className="space-y-3">
                  {data.timeline.map((evt) => (
                    <div key={evt.id} className="p-4 bg-[#171724] border-l-4 border-l-purple-500 rounded-r-xl border-gray-800/80 space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-white text-base font-bold">{evt.title}</strong>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                          {evt.type}
                        </span>
                      </div>
                      {evt.descricao && <p className="text-xs text-gray-300 leading-relaxed">{evt.descricao}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cenas Organizadas */}
            {data.scenes.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-4">
                  Sequência de Cenas
                </h3>
                <div className="space-y-3">
                  {data.scenes.map((scene, idx) => (
                    <div key={scene.id || idx} className="p-4 bg-[#171724] rounded-xl border border-gray-800/80 space-y-1">
                      <strong className="text-white text-sm block">Cena {idx + 1}: {scene.title}</strong>
                      {scene.description && <p className="text-xs text-gray-400">{scene.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mistérios & Plot Twists */}
            {(data.mysteries.length > 0 || data.twists.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.mysteries.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-3">
                      Mistérios & Pistas
                    </h3>
                    <div className="space-y-2">
                      {data.mysteries.map((m) => (
                        <div key={m.id} className="p-3 bg-[#171724] rounded-xl border border-gray-800/80">
                          <strong className="text-white text-xs block">{m.title}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.twists.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-3">
                      Plot Twists
                    </h3>
                    <div className="space-y-2">
                      {data.twists.map((t) => (
                        <div key={t.id} className="p-3 bg-[#171724] rounded-xl border border-gray-800/80">
                          <strong className="text-white text-xs block">{t.title}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ==========================================
          BLOCO 4: VALIDAÇÃO & CHECKLIST
          ========================================== */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => toggleSection('validacao')}
          className="w-full flex justify-between items-center p-6 bg-[#161622] border-b border-gray-800/60 text-left cursor-pointer"
        >
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>✅</span> 4. Validação Narrativa (Checklist)
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Status das 60 verificações técnicas de qualidade da história.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40">
              {checklistCheckedCount}/60 Concluídos
            </span>
            <span className="text-gray-400 font-bold text-lg">{openSections.validacao ? '⌃' : '⌄'}</span>
          </div>
        </button>

        {openSections.validacao && (
          <div className="p-6">
            {Object.keys(data.checklist).length === 0 ? (
              <p className="text-sm text-gray-500 italic">Checklist ainda não iniciado.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(data.checklist).map(([itemText, isDone]) => (
                  <div
                    key={itemText}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs leading-relaxed ${
                      isDone
                        ? 'bg-[#151824] border-emerald-800/50 text-gray-200'
                        : 'bg-[#14141d] border-gray-800/60 text-gray-500'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      isDone ? 'bg-emerald-500 text-gray-950' : 'border border-gray-700 text-transparent'
                    }`}>
                      ✓
                    </span>
                    <span className={isDone ? 'line-through opacity-80' : ''}>{itemText}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}