// src/pages/EstruturaDramatica.jsx
// Página de Estrutura Dramática do StoryForge

import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';

import { 
  Target, 
  Lightbulb, 
  BookOpen, 
  HelpCircle, 
  AlertCircle,
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';

const guideTabs = {
  Objetivo: (
    <p>Selecionar e combinar frameworks estruturais para dar ritmo e forma à história.</p>
  ),
  Dicas: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>Você pode usar um framework ou combinar vários — não existe resposta única.</li>
      <li>Cada framework resolve um problema narrativo diferente.</li>
      <li>A estrutura serve à história — não o contrário.</li>
    </ul>
  ),
  Exemplos: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>3 Atos: Matrix (1999)</li>
      <li>Jornada do Herói: Star Wars: Episódio IV – Uma Nova Esperança (1977)</li>
      <li>Save the Cat: De Volta para o Futuro (1985)</li>
      <li>8 Sequências: Toy Story (1995)</li>
      <li>Story Circle: O Senhor dos Anéis: A Sociedade do Anel (2001)</li>
      <li>Freytag: Romeu e Julieta (William Shakespeare)</li>
    
    </ul>
  ),
  Perguntas: (
    <ul className="space-y-1.5 list-disc pl-4">
      <li>Qual framework melhor serve o ritmo que você imagina?</li>
      <li>Você quer uma estrutura clássica ou experimental?</li>
      <li>Como os frameworks escolhidos se complementam?</li>
    </ul>
  ),
};

// Mapeamento centralizado de ícones e cores do Guia do Módulo
const GUIDE_TAB_CONFIG = {
  Objetivo: { Icon: Target, color: 'text-red-400' },
  Dicas: { Icon: Lightbulb, color: 'text-amber-400' },
  Exemplos: { Icon: BookOpen, color: 'text-purple-400' },
  Perguntas: { Icon: HelpCircle, color: 'text-orange-400' },
};

function EstruturaGuide() {
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

const frameworks = [
  ['3 Atos', '', 'Setup, Confronto, Resolução', 'A estrutura clássica de três atos é a espinha dorsal da maioria das histórias ocidentais'],
  ['8 Sequências (Paul Gulino)', '', 'Blocos narrativos com pontos de virada', 'A estrutura de 8 Sequências divide cada ato em blocos menores autossustentáveis'],
  ['Jornada do Herói', '', '12 estágios de Joseph Campbell', 'Baseada no monomito de Joseph Campbell com doze estágios universais'],
  ['Story Circle (Dan Harmon)', '', '8 passos cíclicos', 'Simplificação circular da Jornada do Herói com oito passos'],
  ['Save the Cat (Blake Snyder)', '', '15 beats estruturais', 'Mapeia com precisão uma narrativa comercial eficiente'],
  ['Freytag (Pirâmide Dramática)', '', '5 atos clássicos', 'Exposição, Ação Ascendente, Clímax, Ação Descendente e Resolução'],
];

const acts = [
  ['Ato I - Setup', 'Primeiros 25% da história. Estabelece o mundo comum, o protagonista e o tom.'],
  ['Ato II - Confronto', 'Os próximos 50% da história. O protagonista enfrenta obstáculos crescentes.'],
  ['Ato III - Resolução', 'Os últimos 25% da história. O clímax culmina na batalha final.'],
];

const sequences = [
  ['Sequência 1', 'Início do Ato I — apresenta o mundo, o protagonista e o tom.'],
  ['Sequência 2', 'Fim do Ato I — o incidente incitante perturba o equilíbrio.'],
  ['Sequência 3', 'Início do Ato II — o protagonista entra no novo mundo.'],
  ['Sequência 4', 'Primeira metade do Ato II — obstáculos crescentes até o midpoint.'],
  ['Sequência 5', 'Após o midpoint — a história ganha nova direção.'],
  ['Sequência 6', 'Fim do Ato II — a pior derrota do protagonista; tudo parece perdido.'],
  ['Sequência 7', 'Início do Ato III — o protagonista prepara o confronto final.'],
  ['Sequência 8', 'Fim do Ato III — o clímax, a resolução e o novo equilíbrio.'],
];

const heroStages = [
  ['Mundo Comum', 'Vida normal do herói antes do chamado.'],
  ['Chamado à Aventura', 'Evento que perturba o equilíbrio.'],
  ['Recusa do Chamado', 'Hesitação por medo ou dúvida.'],
  ['Encontro com o Mentor', 'Recebe conselhos, treinos ou ferramentas.'],
  ['Travessia do Limiar', 'Comprometimento total com a jornada.'],
  ['Aliados/Inimigos', 'Descobre quem ajuda e quem dificulta.'],
  ['Aproximação', 'Preparação para o maior desafio.'],
  ['Provação Difícil', 'A batalha central ou o teste decisivo.'],
  ['Recompensa', 'Obtenção do objeto ou aprendizado da jornada.'],
  ['Caminho de Volta', 'Consequências da provação e retorno.'],
  ['Ressurreição', 'O teste final no limite da transformação.'],
  ['Retorno com o Elixir', 'Volta transformado ao mundo comum.'],
];

const storyCircleSteps = [
  ['Conforto', 'Vida conhecida e segura.'],
  ['Desejo', 'Surgimento de um objetivo.'],
  ['Entrada', 'Entrada em uma nova situação.'],
  ['Adaptação', 'Aprendizado e superação de desafios.'],
  ['Conquista', 'Obtenção do objetivo.'],
  ['Preço', 'Pagamento de um custo pessoal ou perda.'],
  ['Retorno', 'Retorno ao mundo cotidiano.'],
  ['Mudança', 'Transformação concluída.'],
];

const saveTheCatBeats = [
  ['Imagem de Abertura', 'A primeira impressão do tom.'],
  ['Tema Declarado', 'Declaração explícita do tema.'],
  ['Setup', 'Apresentação do protagonista e suas faltas.'],
  ['Catalisador', 'O incidente incitante.'],
  ['Debate', 'Hesitação e dúvida do herói.'],
  ['Entrando no Ato II', 'Passagem para o mundo especial.'],
  ['Subtrama B', 'Ramificação secundária ou relacionamento.'],
  ['Diversão e Jogos', 'O núcleo da promessa da premissa.'],
  ['Ponto Médio', 'A virada central da narrativa.'],
  ['Inimigos se Aproximam', 'Aumento drástico da pressão.'],
  ['Tudo Está Perdido', 'O ponto mais baixo do protagonista.'],
  ['Alma das Trevas', 'Confronto com a verdade interior.'],
  ['Entrando no Ato III', 'Nova resolução e decisão.'],
  ['Finale', 'O clímax e teste final.'],
  ['Imagem Final', 'O espelho transformado da Imagem de Abertura.'],
];

const freytagStages = [
  ['Exposição', 'Apresentação da situação inicial.'],
  ['Ação Ascendente', 'Escalada do conflito e tensão.'],
  ['Clímax', 'Ponto máximo e virada decisiva.'],
  ['Ação Descendente', 'Consequências do clímax.'],
  ['Resolução', 'O novo normal e equilíbrio final.'],
];

function getFrameworkCardStyle(name, isSelected) {
  const norm = name.toLowerCase();
  if (norm.includes('3 atos')) {
    return isSelected
      ? 'border-purple-500 bg-purple-950/40 text-purple-200'
      : 'border-purple-900/30 bg-[#181824] hover:border-purple-600/60 text-gray-400';
  }
  if (norm.includes('8 sequências') || norm.includes('sequencias')) {
    return isSelected
      ? 'border-blue-500 bg-blue-950/40 text-blue-200'
      : 'border-blue-900/30 bg-[#181824] hover:border-blue-600/60 text-gray-400';
  }
  if (norm.includes('jornada')) {
    return isSelected
      ? 'border-amber-500 bg-amber-950/40 text-amber-200'
      : 'border-amber-900/30 bg-[#181824] hover:border-amber-600/60 text-gray-400';
  }
  if (norm.includes('story circle')) {
    return isSelected
      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
      : 'border-emerald-900/30 bg-[#181824] hover:border-emerald-600/60 text-gray-400';
  }
  if (norm.includes('save the cat')) {
    return isSelected
      ? 'border-orange-500 bg-orange-950/40 text-orange-200'
      : 'border-orange-900/30 bg-[#181824] hover:border-orange-600/60 text-gray-400';
  }
  if (norm.includes('freytag')) {
    return isSelected
      ? 'border-red-500 bg-red-950/40 text-red-200'
      : 'border-red-900/30 bg-[#181824] hover:border-red-600/60 text-gray-400';
  }
  return isSelected ? 'border-purple-500 bg-purple-950/40' : 'border-gray-800 bg-[#181824]';
}

function getCheckBadgeStyle(name) {
  const norm = name.toLowerCase();
  if (norm.includes('3 atos')) return 'bg-purple-600 border-purple-400 text-white';
  if (norm.includes('8 sequências') || norm.includes('sequencias')) return 'bg-blue-600 border-blue-400 text-white';
  if (norm.includes('jornada')) return 'bg-amber-600 border-amber-400 text-white';
  if (norm.includes('story circle')) return 'bg-emerald-600 border-emerald-400 text-white';
  if (norm.includes('save the cat')) return 'bg-orange-600 border-orange-400 text-white';
  if (norm.includes('freytag')) return 'bg-red-600 border-red-400 text-white';
  return 'bg-purple-600 border-purple-400 text-white';
}

export default function EstruturaDramatica({ projectId }) {
  const [selectedFrameworks, setSelectedFrameworks] = useState([]);
  const [savingStatus, setSavingStatus] = useState('Salvo');
  const isFirstRender = useRef(true);

  const [actValues, setActValues] = useState(() => Object.fromEntries(acts.map(([label]) => [label, ''])));
  const [sequenceValues, setSequenceValues] = useState(() => Object.fromEntries(sequences.map(([label]) => [label, ''])));
  const [heroValues, setHeroValues] = useState(() => Object.fromEntries(heroStages.map(([label]) => [label, ''])));
  const [storyCircleValues, setStoryCircleValues] = useState(() => Object.fromEntries(storyCircleSteps.map(([label]) => [label, ''])));
  const [saveTheCatValues, setSaveTheCatValues] = useState(() => Object.fromEntries(saveTheCatBeats.map(([label]) => [label, ''])));
  const [freytagValues, setFreytagValues] = useState(() => Object.fromEntries(freytagStages.map(([label]) => [label, ''])));

  const [areActsOpen, setAreActsOpen] = useState(true);
  const [areSequencesOpen, setAreSequencesOpen] = useState(true);
  const [isHeroOpen, setIsHeroOpen] = useState(true);
  const [isStoryCircleOpen, setIsStoryCircleOpen] = useState(true);
  const [isSaveTheCatOpen, setIsSaveTheCatOpen] = useState(true);
  const [isFreytagOpen, setIsFreytagOpen] = useState(true);

  // 1. Buscar dados ao abrir
  useEffect(() => {
    if (!projectId) return;

    const fetchEstrutura = async () => {
      try {
        const res = await apiClient.get(`/entities/projects/${projectId}/estrutura-dramatica`);
        if (res.data && Object.keys(res.data).length > 0) {
          if (res.data.selectedFrameworks) setSelectedFrameworks(res.data.selectedFrameworks);
          if (res.data.values) {
            const v = res.data.values;
            if (v.acts) setActValues((prev) => ({ ...prev, ...v.acts }));
            if (v.sequences) setSequenceValues((prev) => ({ ...prev, ...v.sequences }));
            if (v.hero) setHeroValues((prev) => ({ ...prev, ...v.hero }));
            if (v.storyCircle) setStoryCircleValues((prev) => ({ ...prev, ...v.storyCircle }));
            if (v.saveTheCat) setSaveTheCatValues((prev) => ({ ...prev, ...v.saveTheCat }));
            if (v.freytag) setFreytagValues((prev) => ({ ...prev, ...v.freytag }));
          }
        }
      } catch (err) {
        console.error('Erro ao buscar Estrutura Dramática:', err);
      }
    };

    fetchEstrutura();
  }, [projectId]);

  // 2. Auto-save para frameworks e valores de texto
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!projectId) return;

    setSavingStatus('Salvando...');

    const timer = setTimeout(async () => {
      try {
        const payload = {
          selectedFrameworks,
          values: {
            acts: actValues,
            sequences: sequenceValues,
            hero: heroValues,
            storyCircle: storyCircleValues,
            saveTheCat: saveTheCatValues,
            freytag: freytagValues,
          },
        };
        await apiClient.post(`/entities/projects/${projectId}/estrutura-dramatica`, payload);
        setSavingStatus('Salvo');
      } catch (err) {
        console.error('Erro no Auto-save da Estrutura:', err);
        setSavingStatus('Erro ao salvar');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [selectedFrameworks, actValues, sequenceValues, heroValues, storyCircleValues, saveTheCatValues, freytagValues, projectId]);

  const completedActs = acts.filter(([label]) => (actValues[label] || '').trim() !== '').length;
  const completedSequences = sequences.filter(([label]) => (sequenceValues[label] || '').trim() !== '').length;
  const completedHeroStages = heroStages.filter(([label]) => (heroValues[label] || '').trim() !== '').length;
  const completedStoryCircleSteps = storyCircleSteps.filter(([label]) => (storyCircleValues[label] || '').trim() !== '').length;
  const completedSaveTheCatBeats = saveTheCatBeats.filter(([label]) => (saveTheCatValues[label] || '').trim() !== '').length;
  const completedFreytagStages = freytagStages.filter(([label]) => (freytagValues[label] || '').trim() !== '').length;

  const selectedFieldCount =
    (selectedFrameworks.includes('3 Atos') ? acts.length : 0) +
    (selectedFrameworks.includes('8 Sequências (Paul Gulino)') ? sequences.length : 0) +
    (selectedFrameworks.includes('Jornada do Herói') ? heroStages.length : 0) +
    (selectedFrameworks.includes('Story Circle (Dan Harmon)') ? storyCircleSteps.length : 0) +
    (selectedFrameworks.includes('Save the Cat (Blake Snyder)') ? saveTheCatBeats.length : 0) +
    (selectedFrameworks.includes('Freytag (Pirâmide Dramática)') ? freytagStages.length : 0);

  const completedFieldCount =
    (selectedFrameworks.includes('3 Atos') ? completedActs : 0) +
    (selectedFrameworks.includes('8 Sequências (Paul Gulino)') ? completedSequences : 0) +
    (selectedFrameworks.includes('Jornada do Herói') ? completedHeroStages : 0) +
    (selectedFrameworks.includes('Story Circle (Dan Harmon)') ? completedStoryCircleSteps : 0) +
    (selectedFrameworks.includes('Save the Cat (Blake Snyder)') ? completedSaveTheCatBeats : 0) +
    (selectedFrameworks.includes('Freytag (Pirâmide Dramática)') ? completedFreytagStages : 0);

  const progress = selectedFieldCount === 0 ? 0 : Math.round((completedFieldCount / selectedFieldCount) * 100);

  function toggleFramework(frameworkName) {
    setSelectedFrameworks((current) =>
      current.includes(frameworkName) ? current.filter((name) => name !== frameworkName) : [...current, frameworkName]
    );
  }

  return (
    <main className="module-page">
      <header className="module-header flex justify-between items-center">
        <div>
          <h1>Estrutura Dramática</h1>
          <p>O esqueleto da sua história — escolha os frameworks que melhor servem sua narrativa.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium bg-[#1c1c26] px-3 py-1 rounded-full border border-gray-800">
            {savingStatus}
          </span>
          <div className="module-progress"><span aria-hidden="true" />{progress}%</div>
        </div>
      </header>

      <div className="module-progress-track"><div style={{ width: `${progress}%` }} /></div>

      <EstruturaGuide />

      <p className="framework-intro mb-4">Selecione um ou mais frameworks estruturais. Você pode usar apenas um ou combinar vários — não existe resposta única.</p>

      {/* CARDS DOS FRAMEWORKS COM AS CORES RESPECTIVAS */}
      <section className="framework-grid grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" aria-label="Frameworks estruturais">
        {frameworks.map(([name, summary, beats, description]) => {
          const isSelected = selectedFrameworks.includes(name);
          const cardStyle = getFrameworkCardStyle(name, isSelected);
          const checkStyle = getCheckBadgeStyle(name);

          return (
            <button
              className={`framework-card p-5 rounded-xl border-2 transition-all duration-200 text-left flex justify-between items-start cursor-pointer shadow-lg ${cardStyle}`}
              type="button"
              key={name}
              aria-pressed={isSelected}
              onClick={() => toggleFramework(name)}
            >
              <span className="framework-copy space-y-1 pr-4">
                <strong className="block text-base font-bold text-white">{name}</strong>
                <span className="block text-xs font-medium opacity-90">{summary}</span>
                <small className="block text-[11px] opacity-75 font-mono">{beats}</small>
                <em className="block text-xs not-italic text-gray-300 mt-2 leading-relaxed">{description}</em>
              </span>

              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold shrink-0 transition-all ${
                  isSelected ? checkStyle : 'border-gray-700 bg-gray-900/60 text-transparent'
                }`}
              >
                ✓
              </span>
            </button>
          );
        })}
      </section>

      {/* 3 ATOS */}
      {selectedFrameworks.includes('3 Atos') && (
        <section className="three-acts-panel">
          <header className="three-acts-header">
            <div className="three-acts-title"><span>{completedActs}/3</span><strong>3 Atos</strong></div>
            <button type="button" onClick={() => setAreActsOpen((c) => !c)}>{areActsOpen ? 'Recolher' : 'Expandir'}</button>
          </header>
          {areActsOpen && (
            <div className="acts-list">
              {acts.map(([label, description], index) => (
                <section className="act-item" key={label}>
                  <h2>{index + 1}. {label}</h2>
                  <p>{description}</p>
                  <textarea
                    name={label}
                    placeholder={`Descreva o que acontece em "${label}"...`}
                    value={actValues[label] || ''}
                    onChange={(e) => setActValues((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
                  />
                </section>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 8 SEQUÊNCIAS */}
      {selectedFrameworks.includes('8 Sequências (Paul Gulino)') && (
        <section className="three-acts-panel sequences-panel">
          <header className="three-acts-header">
            <div className="three-acts-title"><span>{completedSequences}/8</span><strong>8 Sequências (Paul Gulino)</strong></div>
            <button type="button" onClick={() => setAreSequencesOpen((c) => !c)}>{areSequencesOpen ? 'Recolher' : 'Expandir'}</button>
          </header>
          {areSequencesOpen && (
            <div className="acts-list">
              {sequences.map(([label, description], index) => (
                <section className="act-item" key={label}>
                  <h2>{index + 1}. {label}</h2>
                  <p>{description}</p>
                  <textarea
                    name={label}
                    placeholder={`Descreva o que acontece em "${label}"...`}
                    value={sequenceValues[label] || ''}
                    onChange={(e) => setSequenceValues((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
                  />
                </section>
              ))}
            </div>
          )}
        </section>
      )}

      {/* JORNADA DO HERÓI */}
      {selectedFrameworks.includes('Jornada do Herói') && (
        <section className="three-acts-panel hero-panel">
          <header className="three-acts-header">
            <div className="three-acts-title"><span>{completedHeroStages}/12</span><strong>Jornada do Herói</strong></div>
            <button type="button" onClick={() => setIsHeroOpen((c) => !c)}>{isHeroOpen ? 'Recolher' : 'Expandir'}</button>
          </header>
          {isHeroOpen && (
            <div className="acts-list">
              {heroStages.map(([label, description], index) => (
                <section className="act-item" key={label}>
                  <h2>{index + 1}. {label}</h2>
                  <p>{description}</p>
                  <textarea
                    name={label}
                    placeholder={`Descreva o que acontece em "${label}"...`}
                    value={heroValues[label] || ''}
                    onChange={(e) => setHeroValues((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
                  />
                </section>
              ))}
            </div>
          )}
        </section>
      )}

      {/* STORY CIRCLE */}
      {selectedFrameworks.includes('Story Circle (Dan Harmon)') && (
        <section className="three-acts-panel story-circle-panel">
          <header className="three-acts-header">
            <div className="three-acts-title"><span>{completedStoryCircleSteps}/8</span><strong>Story Circle (Dan Harmon)</strong></div>
            <button type="button" onClick={() => setIsStoryCircleOpen((c) => !c)}>{isStoryCircleOpen ? 'Recolher' : 'Expandir'}</button>
          </header>
          {isStoryCircleOpen && (
            <div className="acts-list">
              {storyCircleSteps.map(([label, description], index) => (
                <section className="act-item" key={label}>
                  <h2>{index + 1}. {label}</h2>
                  <p>{description}</p>
                  <textarea
                    name={label}
                    placeholder={`Descreva o que acontece em "${index + 1}. ${label}"...`}
                    value={storyCircleValues[label] || ''}
                    onChange={(e) => setStoryCircleValues((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
                  />
                </section>
              ))}
            </div>
          )}
        </section>
      )}

      {/* SAVE THE CAT */}
      {selectedFrameworks.includes('Save the Cat (Blake Snyder)') && (
        <section className="three-acts-panel save-the-cat-panel">
          <header className="three-acts-header">
            <div className="three-acts-title"><span>{completedSaveTheCatBeats}/15</span><strong>Save the Cat (Blake Snyder)</strong></div>
            <button type="button" onClick={() => setIsSaveTheCatOpen((c) => !c)}>{isSaveTheCatOpen ? 'Recolher' : 'Expandir'}</button>
          </header>
          {isSaveTheCatOpen && (
            <div className="acts-list">
              {saveTheCatBeats.map(([label, description], index) => (
                <section className="act-item" key={label}>
                  <h2>{index + 1}. {label}</h2>
                  <p>{description}</p>
                  <textarea
                    name={label}
                    placeholder={`Descreva o que acontece em "${label}"...`}
                    value={saveTheCatValues[label] || ''}
                    onChange={(e) => setSaveTheCatValues((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
                  />
                </section>
              ))}
            </div>
          )}
        </section>
      )}

      {/* FREYTAG */}
      {selectedFrameworks.includes('Freytag (Pirâmide Dramática)') && (
        <section className="three-acts-panel freytag-panel">
          <header className="three-acts-header">
            <div className="three-acts-title"><span>{completedFreytagStages}/5</span><strong>Freytag (Pirâmide Dramática)</strong></div>
            <button type="button" onClick={() => setIsFreytagOpen((c) => !c)}>{isFreytagOpen ? 'Recolher' : 'Expandir'}</button>
          </header>
          {isFreytagOpen && (
            <div className="acts-list">
              {freytagStages.map(([label, description], index) => (
                <section className="act-item" key={label}>
                  <h2>{index + 1}. {label}</h2>
                  <p>{description}</p>
                  <textarea
                    name={label}
                    placeholder={`Descreva o que acontece em "${label}"...`}
                    value={freytagValues[label] || ''}
                    onChange={(e) => setFreytagValues((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
                  />
                </section>
              ))}
            </div>
          )}
        </section>
      )}

      {selectedFrameworks.length === 0 && (
        <div className="framework-empty">Selecione ao menos um framework acima para começar a estruturar sua história.</div>
      )}
    </main>
  );
}