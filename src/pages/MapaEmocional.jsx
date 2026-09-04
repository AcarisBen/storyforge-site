import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
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

// Tooltip com valores na cor de cada emoção
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#12121a]/95 backdrop-blur border border-gray-800 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[150px]">
        <strong className="block text-gray-200 border-b border-gray-800 pb-1 mb-1 font-bold">
          {label}
        </strong>
        {payload.map((entry) => {
          const emotion = EMOTIONS.find((e) => e.key === entry.dataKey);
          if (!emotion) return null;
          return (
            <div key={entry.dataKey} className="flex justify-between items-center gap-4">
              <span style={{ color: emotion.color }} className="font-semibold capitalize">
                {emotion.label}:
              </span>
              <span style={{ color: emotion.color }} className="font-bold">
                {entry.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function MapaEmocional({ projectId }) {
  const [points, setPoints] = useState([]);
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [activeGuideTab, setActiveGuideTab] = useState('objetivo');
  const [isSaving, setIsSaving] = useState(false);

  // Listas para vínculos
  const [characters, setCharacters] = useState([]);
  const [worldElements, setWorldElements] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [mysteries, setMysteries] = useState([]);
  const [twists, setTwists] = useState([]);

  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      try {
        const [resPoints, resChars, resWorld, resScenes, resMysteries, resTwists] = await Promise.all([
          apiClient.get(`/entities/projects/${projectId}/mapa-emocional`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/characters`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/world`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/scenes`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/mysteries`).catch(() => ({ data: [] })),
          apiClient.get(`/entities/projects/${projectId}/twists`).catch(() => ({ data: [] })),
        ]);

        setPoints(Array.isArray(resPoints.data) ? resPoints.data : []);
        setCharacters(resChars.data || []);
        setWorldElements(resWorld.data || []);
        setScenes(resScenes.data || []);
        setMysteries(resMysteries.data || []);
        setTwists(resTwists.data || []);
      } catch (err) {
        console.error('Erro ao carregar dados do Mapa Emocional:', err);
      }
    };

    fetchData();
  }, [projectId]);

  const savePoints = useCallback(async (updatedPoints) => {
    if (!projectId) return;
    setIsSaving(true);
    try {
      await apiClient.post(`/entities/projects/${projectId}/mapa-emocional`, updatedPoints);
    } catch (err) {
      console.error('Erro ao salvar Mapa Emocional:', err);
    } finally {
      setIsSaving(false);
    }
  }, [projectId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      savePoints(points);
    }, 1500);
    return () => clearTimeout(timer);
  }, [points, savePoints]);

  const handleAddPoint = () => {
    const defaultName = points.length === 0 ? 'Abertura' : points.length === 1 ? 'Midpoint' : 'Clímax';
    const newPoint = {
      id: `point-${Date.now()}`,
      name: defaultName,
      curiosidade: 5,
      tensao: 5,
      esperanca: 5,
      medo: 5,
      tristeza: 5,
      choque: 5,
      alegria: 5,
      alivio: 5,
      characterId: '',
      worldId: '',
      sceneId: '',
      mysteryId: '',
      twistId: '',
    };
    setPoints((prev) => [...prev, newPoint]);
  };

  const handleDeletePoint = (id) => {
    setPoints((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdatePoint = (id, field, value) => {
    setPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  return (
    <div className="p-6 space-y-6 bg-[#0a0a0f] text-gray-200 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Mapa Emocional</h1>
          <p className="text-xs text-gray-400">
            Gráfico das emoções que o público sente ao longo da história.
          </p>
        </div>
        <div className="text-xs font-semibold">
          <span className={isSaving ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}>
            {isSaving ? '⏳ Salvando...' : '✓ Salvo no Banco'}
          </span>
        </div>
      </div>

      {/* GUIA DO MÓDULO */}
      <div className="border border-gray-800/80 rounded-2xl bg-[#12121a] overflow-hidden">
        <button
          type="button"
          onClick={() => setIsGuideOpen((prev) => !prev)}
          className="w-full p-4 flex justify-between items-center text-xs font-bold text-gray-300 hover:bg-[#161622] transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-amber-400">💡</span>
            <span>Guia do Módulo</span>
          </div>
          <span>{isGuideOpen ? '⌃' : '⌄'}</span>
        </button>

        {isGuideOpen && (
          <div className="p-4 border-t border-gray-800/60 bg-[#161622] space-y-4">
            <div className="flex gap-2 border-b border-gray-800 pb-3">
              {[
                { id: 'objetivo', label: '🎯 Objetivo' },
                { id: 'dicas', label: '💡 Dicas' },
                { id: 'exemplos', label: '📖 Exemplos' },
                { id: 'perguntas', label: '❓ Perguntas' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveGuideTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeGuideTab === tab.id
                      ? 'bg-purple-950/80 border border-purple-500 text-purple-200'
                      : 'text-gray-400 hover:text-white hover:bg-[#12121a]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-gray-300 leading-relaxed">
              {activeGuideTab === 'objetivo' && (
                <p>Visualizar a jornada emocional da narrativa para garantir variação e ritmo.</p>
              )}
              {activeGuideTab === 'dicas' && (
                <ul className="list-disc pl-4 space-y-1">
                  <li>A variação emocional é o que mantém o público engajado.</li>
                  <li>Picos de tensão precisam de vales de alívio para terem impacto.</li>
                  <li>A emoção final deve corresponder ao tom da obra.</li>
                </ul>
              )}
              {activeGuideTab === 'exemplos' && (
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Abertura:</strong> Curiosidade média → <strong>Incidente Incitante:</strong> Tensão alta → <strong>Midpoint:</strong> Choque.</li>
                  <li><strong>Clímax:</strong> Medo + Tensão máximos → <strong>Resolução:</strong> Alívio + Alegria.</li>
                </ul>
              )}
              {activeGuideTab === 'perguntas' && (
                <ul className="list-disc pl-4 space-y-1">
                  <li>Qual é a jornada emocional que você quer que o público viva?</li>
                  <li>Onde estão os picos e vales emocionais?</li>
                  <li>A emoção final corresponde ao tom da obra?</li>
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-xs font-semibold text-gray-400">
          {points.length} ponto(s) na jornada emocional
        </span>
        <button
          type="button"
          onClick={handleAddPoint}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>+</span> Novo Ponto
        </button>
      </div>

      {/* GRÁFICO */}
      <div className="border border-gray-800/80 rounded-2xl bg-[#12121a] p-6 min-h-[350px] flex items-center justify-center">
        {points.length === 0 ? (
          <div className="text-center space-y-2 py-10">
            <p className="text-sm font-semibold text-gray-300">Nenhum ponto emocional mapeado ainda.</p>
            <p className="text-xs text-gray-500">
              Adicione pontos da história (ex: Abertura, Incidente Incitante, Midpoint, Clímax) e defina a intensidade de cada emoção.
            </p>
          </div>
        ) : (
          <div className="w-full space-y-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 10]} ticks={[0, 3, 6, 10]} stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  {EMOTIONS.map((emotion) => (
                    <Line
                      key={emotion.key}
                      type="monotone"
                      dataKey={emotion.key}
                      stroke={emotion.color}
                      strokeWidth={2}
                      dot={{ r: 4, fill: emotion.color }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-2 border-t border-gray-800/60">
              {EMOTIONS.map((e) => (
                <div key={e.key} className="flex items-center gap-1.5 text-[11px] font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                  <span style={{ color: e.color }}>{e.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CONTROLE DE SLIDERS COLORIDOS + LIXEIRA NO FIM */}
      {points.length > 0 && (
        <div className="border border-gray-800/80 rounded-2xl bg-[#12121a] p-5 space-y-4">
          <div className="grid grid-cols-11 gap-2 text-xs font-bold text-gray-400 border-b border-gray-800 pb-2 px-2 items-center">
            <span className="col-span-2">Ponto</span>
            {EMOTIONS.map((e) => (
              <span key={e.key} style={{ color: e.color }} className="text-center capitalize">
                {e.label}
              </span>
            ))}
            <span className="text-center">Ações</span>
          </div>

          <div className="space-y-3">
            {points.map((point) => (
              <div key={point.id} className="grid grid-cols-11 gap-2 items-center bg-[#161622] p-3 rounded-xl border border-gray-800/60">
                <input
                  type="text"
                  value={point.name}
                  onChange={(e) => handleUpdatePoint(point.id, 'name', e.target.value)}
                  className="col-span-2 bg-[#12121a] border border-gray-800 rounded-lg p-2 text-xs text-white focus:border-purple-500 outline-none font-semibold"
                />

                {EMOTIONS.map((e) => (
                  <div key={e.key} className="flex flex-col items-center gap-1">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={point[e.key] || 0}
                      onChange={(evt) => handleUpdatePoint(point.id, e.key, Number(evt.target.value))}
                      style={{ accentColor: e.color }}
                      className="w-full h-1.5 bg-gray-700 rounded cursor-pointer"
                    />
                    <span className="text-[10px] text-gray-400 font-mono">
                      {point[e.key] || 0}
                    </span>
                  </div>
                ))}

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleDeletePoint(point.id)}
                    className="text-red-500 hover:text-red-400 text-sm font-bold p-1 cursor-pointer transition-transform hover:scale-110"
                    title="Excluir Ponto"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEÇÃO DE VÍNCULOS EXPANDIDA */}
      {points.length > 0 && (
        <div className="border border-gray-800/80 rounded-2xl bg-[#12121a] p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Vínculos dos Pontos Emocionais</h3>
            <p className="text-xs text-gray-500">
              Vincule cada ponto a personagens, elementos do mundo, cenas, mistérios e plot twists que moldam a emoção da história.
            </p>
          </div>

          <div className="space-y-3">
            {points.map((point) => (
              <div key={point.id} className="grid grid-cols-6 gap-3 items-center bg-[#161622] p-3 rounded-xl border border-gray-800/60 text-xs">
                <span className="font-bold text-gray-200 truncate">{point.name}</span>

                <select
                  value={point.characterId || ''}
                  onChange={(e) => handleUpdatePoint(point.id, 'characterId', e.target.value)}
                  className="bg-[#12121a] border border-gray-800 rounded-lg p-2 text-gray-300 truncate outline-none focus:border-purple-500"
                >
                  <option value="">Sem personagem</option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.nome || c.title}
                    </option>
                  ))}
                </select>

                <select
                  value={point.worldId || ''}
                  onChange={(e) => handleUpdatePoint(point.id, 'worldId', e.target.value)}
                  className="bg-[#12121a] border border-gray-800 rounded-lg p-2 text-gray-300 truncate outline-none focus:border-purple-500"
                >
                  <option value="">Sem elemento do mundo</option>
                  {worldElements.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name || w.nome || w.title}
                    </option>
                  ))}
                </select>

                <select
                  value={point.sceneId || ''}
                  onChange={(e) => handleUpdatePoint(point.id, 'sceneId', e.target.value)}
                  className="bg-[#12121a] border border-gray-800 rounded-lg p-2 text-gray-300 truncate outline-none focus:border-purple-500"
                >
                  <option value="">Sem cena</option>
                  {scenes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title || s.name || s.nome}
                    </option>
                  ))}
                </select>

                <select
                  value={point.mysteryId || ''}
                  onChange={(e) => handleUpdatePoint(point.id, 'mysteryId', e.target.value)}
                  className="bg-[#12121a] border border-gray-800 rounded-lg p-2 text-gray-300 truncate outline-none focus:border-purple-500"
                >
                  <option value="">Sem mistério</option>
                  {mysteries.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title || m.name || m.nome}
                    </option>
                  ))}
                </select>

                <select
                  value={point.twistId || ''}
                  onChange={(e) => handleUpdatePoint(point.id, 'twistId', e.target.value)}
                  className="bg-[#12121a] border border-gray-800 rounded-lg p-2 text-gray-300 truncate outline-none focus:border-purple-500"
                >
                  <option value="">Sem plot twist</option>
                  {twists.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title || t.name || t.nome}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}