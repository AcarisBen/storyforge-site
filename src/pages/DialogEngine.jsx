import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export default function DialogEngine({ projectId }) {
  const [loading, setLoading] = useState(true);

  // Guia do Módulo
  const [guideOpen, setGuideOpen] = useState(true);
  const [guideTab, setGuideTab] = useState('objetivo');

  // Dados do projeto
  const [projectChars, setProjectChars] = useState([]);
  const [projectScenes, setProjectScenes] = useState([]);

  // Estado de Edição
  const [editingCardId, setEditingCardId] = useState(null);

  // Form de Construção / Edição do Diálogo
  const [selectedSceneId, setSelectedSceneId] = useState('');
  const [charAId, setCharAId] = useState('');
  const [charBId, setCharBId] = useState('none');
  
  // Atmosfera Sonora
  const [soundOptions, setSoundOptions] = useState([
    'Sem áudio de fundo',
    '🌧️ Chuva forte e trovões',
    '☕ Café movimentado / Ruído urbano',
    '🎵 Trilha: Suspense & Tensão',
    '🎵 Trilha: Dramática & Melancólica',
    '❄️ Vento gélido e tempestade'
  ]);
  const [selectedSound, setSelectedSound] = useState('Sem áudio de fundo');
  const [customSoundInput, setCustomSoundInput] = useState('');

  const [dialogueLines, setDialogueLines] = useState([
    { speaker: 'A', text: '', action: '' }
  ]);
  const [subtextNotes, setSubtextNotes] = useState('');

  // Checklist
  const [dialogueChecklist, setDialogueChecklist] = useState({
    conflict: false,
    distinctVoices: false,
    subtext: false,
    bodyLanguage: false,
    noNameSpam: false
  });

  // Diálogos Salvos
  const [savedDialogues, setSavedDialogues] = useState([]);
  const [openCards, setOpenCards] = useState({});
  const [copyStatus, setCopyStatus] = useState(null);

  // Carregar Personagens, Cenas e Diálogos
  useEffect(() => {
    if (!projectId) return;

    const fetchProjectData = async () => {
      try {
        setLoading(true);

        const [resChars, resScenes, resDialogues] = await Promise.all([
          apiClient.get(`/projects/${projectId}/characters`).catch(() => 
            apiClient.get(`/entities/projects/${projectId}/characters`).catch(() => ({ data: [] }))
          ),
          apiClient.get(`/projects/${projectId}/scenes`).catch(() => 
            apiClient.get(`/entities/projects/${projectId}/scenes`).catch(() => ({ data: [] }))
          ),
          apiClient.get(`/projects/${projectId}/dialogues`).catch(() => 
            apiClient.get(`/entities/projects/${projectId}/dialogues`).catch(() => ({ data: [] }))
          )
        ]);

        const chars = Array.isArray(resChars.data) ? resChars.data : [];
        const scenes = Array.isArray(resScenes.data) ? resScenes.data : [];
        const dialogues = Array.isArray(resDialogues.data) ? resDialogues.data : [];

        setProjectChars(chars);
        setProjectScenes(scenes);
        setSavedDialogues(dialogues);

        const initialOpenState = {};
        dialogues.forEach((d) => { initialOpenState[d.id] = true; });
        setOpenCards(initialOpenState);

        if (chars.length >= 1) setCharAId(String(chars[0].id));
        if (chars.length >= 2) setCharBId(String(chars[1].id));
        if (scenes.length >= 1) setSelectedSceneId(String(scenes[0].id));
      } catch (err) {
        console.error('Erro ao carregar dados do projeto:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Helpers
  const getCharObject = (id) => projectChars.find((c) => String(c.id) === String(id));
  const getSceneObject = (id) => projectScenes.find((s) => String(s.id) === String(id));

  const charA = getCharObject(charAId) || { name: 'Personagem A' };
  const charB = charBId === 'none' ? null : getCharObject(charBId);
  const currentScene = getSceneObject(selectedSceneId);

  const addDialogueLine = (speaker) => {
    setDialogueLines([...dialogueLines, { speaker, text: '', action: '' }]);
  };

  const updateLine = (index, field, value) => {
    const updated = [...dialogueLines];
    updated[index][field] = value;
    setDialogueLines(updated);
  };

  const removeLine = (index) => {
    setDialogueLines(dialogueLines.filter((_, i) => i !== index));
  };

  const toggleCard = (id) => {
    setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddCustomSound = () => {
    if (!customSoundInput.trim()) return;
    const newSound = `🎧 ${customSoundInput.trim()}`;
    setSoundOptions([...soundOptions, newSound]);
    setSelectedSound(newSound);
    setCustomSoundInput('');
  };

  const resetForm = () => {
    setEditingCardId(null);
    setDialogueLines([{ speaker: 'A', text: '', action: '' }]);
    setSubtextNotes('');
    setDialogueChecklist({
      conflict: false,
      distinctVoices: false,
      subtext: false,
      bodyLanguage: false,
      noNameSpam: false
    });
  };

  // Salvar / Editar Diálogo
  const handleSaveDialogue = async () => {
    const titleText = currentScene ? `Diálogo: ${currentScene.title || currentScene.nome}` : 'Diálogo sem cena';

    const payload = {
      title: titleText,
      sceneId: selectedSceneId,
      sceneTitle: currentScene ? (currentScene.title || currentScene.nome) : 'Sem cena vinculada',
      charAId,
      charBId,
      charAName: charA.name || charA.nome || 'Personagem A',
      charBName: charB ? (charB.name || charB.nome) : 'Solilóquio / Pensamento Interno',
      atmosphere: selectedSound,
      subtext: subtextNotes,
      lines: [...dialogueLines],
      checklist: { ...dialogueChecklist },
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      if (editingCardId) {
        let res;
        try {
          res = await apiClient.put(`/dialogues/${editingCardId}`, payload);
        } catch {
          res = await apiClient.put(`/entities/dialogues/${editingCardId}`, payload);
        }
        const updatedCard = res.data;
        setSavedDialogues(savedDialogues.map((d) => (d.id === editingCardId ? updatedCard : d)));
      } else {
        let res;
        try {
          res = await apiClient.post(`/projects/${projectId}/dialogues`, payload);
        } catch {
          res = await apiClient.post(`/entities/projects/${projectId}/dialogues`, payload);
        }
        const createdCard = res.data;
        setSavedDialogues([createdCard, ...savedDialogues]);
        setOpenCards((prev) => ({ ...prev, [createdCard.id]: true }));
      }

      resetForm();
    } catch (err) {
      console.error('Erro ao salvar diálogo:', err);
      alert('Erro ao salvar no servidor. Certifique-se de ter reiniciado o servidor após adicionar as rotas no backend.');
    }
  };

  const handleEditCard = (card) => {
    setEditingCardId(card.id);
    setSelectedSceneId(card.sceneId || '');
    setCharAId(card.charAId || '');
    setCharBId(card.charBId || 'none');
    setSelectedSound(card.atmosphere || 'Sem áudio de fundo');
    setDialogueLines(card.lines || [{ speaker: 'A', text: '', action: '' }]);
    setSubtextNotes(card.subtext || '');
    setDialogueChecklist(card.checklist || {
      conflict: false,
      distinctVoices: false,
      subtext: false,
      bodyLanguage: false,
      noNameSpam: false
    });

    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleMoveCard = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= savedDialogues.length) return;

    const newList = [...savedDialogues];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    setSavedDialogues(newList);
  };

  const handleCopyCard = (card) => {
    const textFormatted = card.lines.map((l) => {
      const speakerName = l.speaker === 'A' ? card.charAName : card.charBName;
      const actionText = l.action ? ` — ${l.action}.` : '';
      return `— ${l.text}${actionText}`;
    }).join('\n\n');

    const fullContent = `Cena: ${card.sceneTitle}\nParticipantes: ${card.charAName} & ${card.charBName}\nTrilha/Sons: ${card.atmosphere}\n\n${textFormatted}`;

    navigator.clipboard.writeText(fullContent);
    setCopyStatus(card.id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await apiClient.delete(`/dialogues/${cardId}`).catch(() => 
        apiClient.delete(`/entities/dialogues/${cardId}`)
      );
      setSavedDialogues(savedDialogues.filter((d) => d.id !== cardId));
      if (editingCardId === cardId) resetForm();
    } catch (err) {
      console.error('Erro ao deletar diálogo:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-purple-400 font-medium">Carregando dados do projeto...</div>;
  }

  return (
    <main className="dialog-engine-page max-w-6xl mx-auto space-y-8 pb-32 text-gray-200 font-sans">
      
      {/* 1. GUIA DO MÓDULO */}
      <section className="bg-[#11111a] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex justify-between items-center p-4 bg-[#161622] border-b border-gray-800/80">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">!</span>
            <h2 className="text-sm font-bold text-white tracking-wide">Guia do Módulo</h2>
          </div>
          <button
            type="button"
            onClick={() => setGuideOpen(!guideOpen)}
            className="text-gray-400 hover:text-white font-bold text-xs cursor-pointer"
          >
            {guideOpen ? '▲' : '▼'}
          </button>
        </div>

        {guideOpen && (
          <div className="p-5 space-y-4">
            <div className="flex gap-2 border-b border-gray-800 pb-3 text-xs">
              {['objetivo', 'dicas', 'exemplos', 'perguntas'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setGuideTab(tab)}
                  className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                    guideTab === tab ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab === 'objetivo' && '🎯 '}
                  {tab === 'dicas' && '♠ '}
                  {tab === 'exemplos' && '▣ '}
                  {tab === 'perguntas' && '? '}
                  {tab}
                </button>
              ))}
            </div>

            <div className="text-xs text-gray-300 leading-relaxed">
              {guideTab === 'objetivo' && (
                <p>
                  Construir conversas verossímeis e intensas que revelem características marcantes dos personagens, evitem a exposição artificial de dados e impulsionem a narrativa através do subtexto e do conflito direto.
                </p>
              )}

              {guideTab === 'dicas' && (
                <div className="space-y-2">
                  <p>• <b>Vozes Distintas:</b> Cada personagem deve ter um ritmo, vocabulário e extensão de frases únicos. Se esconder o nome, ainda deve ser possível identificar quem fala.</p>
                  <p>• <b>Solilóquios & Pensamentos:</b> Selecione "Nenhum" no Interlocutor B para criar monólogos internos do protagonista.</p>
                  <p>• <b>Camada Sonora Personalizada:</b> Adicione seu próprio áudio customizado no seletor para imersão sonora na plataforma Immerziva.</p>
                  <p>• <b>Edição & Reordenação:</b> Você pode recolher, reordenar ou editar qualquer card salvo para prolongar ou encurtar a conversa a qualquer momento.</p>
                </div>
              )}

              {guideTab === 'exemplos' && (
                <div className="p-3 bg-[#171724] rounded-xl border border-gray-800 space-y-1 font-serif text-gray-300">
                  <p>— Você tem certeza? — perguntou Ana, cruzando os braços.</p>
                  <p>— Absoluta. — Marcos guardou as chaves no bolso. — Precisamos ir agora.</p>
                </div>
              )}

              {guideTab === 'perguntas' && (
                <ul className="list-disc pl-4 space-y-1">
                  <li>O que cada personagem quer obter nesta conversa?</li>
                  <li>O que eles estão tentando esconder um do outro (Subtexto)?</li>
                  <li>Esta conversa altera o rumo da cena ou poderia ser eliminada?</li>
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 2. CONSTRUTOR DE DIÁLOGOS */}
      <section className="bg-[#12121a] border border-gray-800/80 rounded-2xl p-6 space-y-6 shadow-2xl">
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🗣️</span> {editingCardId ? 'Editando Diálogo' : 'Construtor de Diálogo'}
          </h2>
          {editingCardId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
            >
              Cancelando Edição (Criar Novo)
            </button>
          )}
        </div>

        {/* CENA & CAMADA SONORA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-2">
              1. Selecionar Cena Vinculada:
            </label>
            <select
              value={selectedSceneId}
              onChange={(e) => setSelectedSceneId(e.target.value)}
              className="w-full bg-[#181824] border border-gray-800 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-purple-500"
            >
              {projectScenes.length === 0 && <option value="">Nenhuma cena cadastrada no projeto</option>}
              {projectScenes.map((s, idx) => (
                <option key={s.id || idx} value={s.id}>
                  Cena #{idx + 1}: {s.title || s.nome || 'Sem título'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
              2. Camada Sonora Immerziva:
            </label>
            <select
              value={selectedSound}
              onChange={(e) => setSelectedSound(e.target.value)}
              className="w-full bg-[#181824] border border-gray-800 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-amber-500"
            >
              {soundOptions.map((sound, i) => (
                <option key={i} value={sound}>{sound}</option>
              ))}
            </select>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={customSoundInput}
                onChange={(e) => setCustomSoundInput(e.target.value)}
                placeholder="Criar camada sonora própria"
                className="w-full bg-[#181824] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddCustomSound}
                className="px-3 py-2 bg-amber-950 text-amber-300 border border-amber-800/60 rounded-lg text-xs font-bold shrink-0 hover:bg-amber-900 cursor-pointer"
              >
                + Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* SELEÇÃO DOS PERSONAGENS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-[#171724] border border-purple-900/40 rounded-xl space-y-2">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Interlocutor A</span>
            <select
              value={charAId}
              onChange={(e) => setCharAId(e.target.value)}
              className="w-full bg-[#181824] border border-gray-800 rounded-lg p-2.5 text-xs font-bold text-white outline-none focus:border-purple-500"
            >
              {projectChars.length === 0 && <option value="">Nenhum personagem cadastrado</option>}
              {projectChars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.nome || c.title} ({c.type || 'Personagem'})
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-[#171724] border border-indigo-900/40 rounded-xl space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Interlocutor B</span>
            <select
              value={charBId}
              onChange={(e) => setCharBId(e.target.value)}
              className="w-full bg-[#181824] border border-gray-800 rounded-lg p-2.5 text-xs font-bold text-white outline-none focus:border-indigo-500"
            >
              <option value="none">Nenhum (Solilóquio / Monólogo Interno)</option>
              {projectChars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.nome || c.title} ({c.type || 'Personagem'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CONSTRUTOR DE FALAS */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center border-b border-gray-800 pb-2">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Sequência das Falas</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => addDialogueLine('A')}
                className="px-3 py-1.5 bg-purple-900/50 hover:bg-purple-800 text-purple-300 border border-purple-700/50 rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                + Fala {charA.name || charA.nome || 'Personagem A'}
              </button>
              {charB && (
                <button
                  type="button"
                  onClick={() => addDialogueLine('B')}
                  className="px-3 py-1.5 bg-indigo-900/50 hover:bg-indigo-800 text-indigo-300 border border-indigo-700/50 rounded-lg text-xs font-bold cursor-pointer transition-all"
                >
                  + Fala {charB.name || charB.nome}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {dialogueLines.map((line, idx) => {
              const isCharA = line.speaker === 'A';
              const speakerName = isCharA 
                ? (charA.name || charA.nome || 'Personagem A') 
                : (charB?.name || charB?.nome || 'Solilóquio');

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border space-y-2 ${
                    isCharA ? 'bg-[#151422] border-purple-900/30' : 'bg-[#141624] border-indigo-900/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${isCharA ? 'text-purple-400' : 'text-indigo-400'}`}>
                      — {speakerName}
                    </span>
                    {dialogueLines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={line.text}
                      onChange={(e) => updateLine(idx, 'text', e.target.value)}
                      placeholder="Fala do personagem..."
                      className="md:col-span-2 bg-[#181824] border border-gray-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-purple-500"
                    />
                    <input
                      type="text"
                      value={line.action}
                      onChange={(e) => updateLine(idx, 'action', e.target.value)}
                      placeholder="Linguagem Corporal / Ação"
                      className="bg-[#181824] border border-gray-800 rounded-lg p-2.5 text-xs text-gray-400 outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Subtexto Oculto & Intenção:
            </label>
            <textarea
              value={subtextNotes}
              onChange={(e) => setSubtextNotes(e.target.value)}
              placeholder="Exemplo: Ele finge surpresa, mas já sabia da verdade."
              className="w-full h-16 bg-[#181824] border border-gray-800 rounded-xl p-3 text-xs text-gray-300 outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* VISUALIZAÇÃO FORMATADA + CHECKLIST */}
        <div className="p-6 bg-[#161622] border border-purple-900/30 rounded-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              📄 Pré-visualização Formatada
            </h3>
            <span className="text-[11px] px-2.5 py-1 bg-amber-950/60 text-amber-300 border border-amber-800/40 rounded-md font-medium">
              {selectedSound}
            </span>
          </div>

          <div className="p-6 bg-[#0d0d14] rounded-xl border border-gray-800 font-serif leading-relaxed text-gray-300 text-sm space-y-3">
            {dialogueLines.map((line, i) => (
              <p key={i}>
                — {line.text || '...'}
                {line.action && <span className="font-sans text-xs italic text-gray-400"> — {line.action}.</span>}
              </p>
            ))}
            {subtextNotes && (
              <div className="mt-4 pt-3 border-t border-gray-800/60 font-sans text-xs text-amber-400/80 italic">
                <b>Subtexto Oculto:</b> {subtextNotes}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Checklist de Autoavaliação
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {[
                { id: 'conflict', label: 'Existe um conflito ou intenção oposta nesta conversa?' },
                { id: 'distinctVoices', label: 'As vozes continuam distintas e reconhecíveis?' },
                { id: 'subtext', label: 'Há intenção transmitida via subtexto sem exposição direta?' },
                { id: 'bodyLanguage', label: 'Foram incluídos gestos e linguagem corporal?' },
                { id: 'noNameSpam', label: 'Evitou a repetição artificial do nome do interlocutor?' }
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-3 p-3 bg-[#12121a] rounded-xl border border-gray-800 cursor-pointer hover:border-purple-800/50 transition-all">
                  <input
                    type="checkbox"
                    checked={dialogueChecklist[item.id]}
                    onChange={(e) => setDialogueChecklist({ ...dialogueChecklist, [item.id]: e.target.checked })}
                    className="accent-purple-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-gray-300">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveDialogue}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
          >
            {editingCardId ? '🔄 Salvar Alterações no Diálogo' : '💾 Salvar Diálogo como Card'}
          </button>
        </div>
      </section>

      {/* 3. DIÁLOGOS SALVOS */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📚</span> Diálogos Salvos no Projeto ({savedDialogues.length})
        </h2>

        {savedDialogues.length === 0 ? (
          <div className="p-8 bg-[#12121a] border border-gray-800 rounded-2xl text-center text-xs text-gray-500 italic">
            Nenhum diálogo salvo ainda. Monte seu diálogo acima e clique em "Salvar Diálogo como Card".
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {savedDialogues.map((card, idx) => {
              const isOpen = openCards[card.id] !== false;
              const checklistDone = Object.values(card.checklist || {}).filter(Boolean).length;

              return (
                <div key={card.id} className="bg-[#12121a] border border-gray-800 rounded-2xl overflow-hidden shadow-xl transition-all">
                  <div className="p-4 bg-[#161622] border-b border-gray-800/80 flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleCard(card.id)}
                        className="text-gray-400 hover:text-white font-bold text-xs cursor-pointer"
                      >
                        {isOpen ? '▲' : '▼'}
                      </button>
                      <div>
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                          Cena: {card.sceneTitle}
                        </span>
                        <h3 className="text-sm font-bold text-white">
                          {card.charAName} & {card.charBName}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2.5 py-1 bg-amber-950/60 text-amber-300 border border-amber-800/40 rounded-md">
                        {card.atmosphere}
                      </span>
                      <span className="text-[10px] px-2.5 py-1 bg-purple-950/60 text-purple-300 border border-purple-800/40 rounded-md font-bold">
                        Checklist: {checklistDone}/5
                      </span>

                      <div className="flex gap-1 pl-2 border-l border-gray-800">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveCard(idx, -1)}
                          className="px-2 py-1 bg-[#181824] border border-gray-700 hover:border-purple-600 rounded text-[10px] text-gray-300 disabled:opacity-30 cursor-pointer"
                          title="Mover para Cima"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === savedDialogues.length - 1}
                          onClick={() => handleMoveCard(idx, 1)}
                          className="px-2 py-1 bg-[#181824] border border-gray-700 hover:border-purple-600 rounded text-[10px] text-gray-300 disabled:opacity-30 cursor-pointer"
                          title="Mover para Baixo"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="p-6 space-y-4">
                      <div className="p-4 bg-[#0d0d14] rounded-xl border border-gray-800/80 font-serif text-xs text-gray-300 space-y-2 leading-relaxed">
                        {card.lines?.map((line, i) => (
                          <p key={i}>
                            — {line.text}
                            {line.action && <span className="font-sans text-[11px] italic text-gray-400"> — {line.action}.</span>}
                          </p>
                        ))}
                        {card.subtext && (
                          <p className="font-sans text-[11px] text-amber-400/90 pt-2 border-t border-gray-800/60 italic">
                            <b>Subtexto Oculto:</b> {card.subtext}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[10px] text-gray-500">Última edição: {card.updatedAt || 'Recente'}</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditCard(card)}
                            className="px-3 py-1.5 bg-[#181824] hover:bg-amber-950/40 border border-gray-700 hover:border-amber-600 text-amber-300 text-xs font-bold rounded-lg transition-all cursor-pointer"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyCard(card)}
                            className="px-3 py-1.5 bg-[#181824] hover:bg-purple-900/40 border border-gray-700 hover:border-purple-600 text-gray-300 hover:text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                          >
                            {copyStatus === card.id ? '✅ Copiado!' : '📋 Copiar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCard(card.id)}
                            className="px-3 py-1.5 bg-[#181824] hover:bg-red-950/60 border border-gray-700 hover:border-red-600 text-red-400 hover:text-red-300 text-xs font-bold rounded-lg transition-all cursor-pointer"
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}