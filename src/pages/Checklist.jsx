import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';

// Configuração das 8 categorias com 60 itens exatos
const checklistCategories = [
  {
    title: 'Personagens & Arcos',
    badgeStyle: 'bg-purple-950/40 text-purple-300 border-purple-800/40',
    checkColor: 'bg-purple-600 border-purple-400 text-white',
    items: [
      'O protagonista mudou ao longo da história?',
      'O protagonista tem um desejo consciente claro?',
      'O protagonista tem uma necessidade inconsciente?',
      'O protagonista tem um ponto-cego ou ferida interior?',
      'O antagonista acredita ser o herói da própria história?',
      'O antagonista representa a antítese do tema da obra?',
      'Cada personagem principal tem um arco dramático definido?',
      'Os personagens secundários têm função narrativa clara?',
      'Existe coerência psicológica nas atitudes e reações?',
      'Os personagens têm fraquezas e virtudes equilibradas?',
      'A voz e o vocabulário dos diálogos distinguem cada personagem?',
    ],
  },
  {
    title: 'Relações & Dinâmica entre Personagens',
    badgeStyle: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/40',
    checkColor: 'bg-indigo-600 border-indigo-400 text-white',
    items: [
      'As relações entre os personagens evoluem ou se desgastam conforme a história avança?',
      'Existem alianças, rivalidades ou segredos compartilhados que geram tensão secundária?',
      'As mudanças de relacionamento são motivadas por eventos e cenas específicas?',
      'O nível de intensidade da relação (amizade, ódio, amor, rivalidade) condiz com os atos dos personagens?',
      'A rede/grafo de relacionamentos evita personagens isolados sem função narrativa?',
      'Existem conflitos de interesse claros entre aliados na mesma cena?',
    ],
  },
  {
    title: 'Conflito & Dilemas',
    badgeStyle: 'bg-red-950/40 text-red-300 border-red-800/40',
    checkColor: 'bg-red-500 border-red-400 text-white',
    items: [
      'Existe um dilema moral central sem escolha óbvia?',
      'Existe conflito interno relevante no protagonista?',
      'Existe conflito externo claro que impele a trama?',
      'O conflito escala de forma progressiva ao longo da narrativa?',
      'O conflito se resolve de forma tematicamente coerente e sem Deus Ex Machina?',
      'A força opositora reage ativamente às ações do protagonista?',
    ],
  },
  {
    title: 'Estrutura, Pacing & Mapa Emocional',
    badgeStyle: 'bg-blue-950/40 text-blue-300 border-blue-800/40',
    checkColor: 'bg-blue-500 border-blue-400 text-white',
    items: [
      'O incidente incitante acontece nos primeiros 10% a 15% da história?',
      'O midpoint muda a dinâmica ou inverte as apostas da história?',
      'O clímax é o ponto mais alto de tensão e responde à Pergunta Dramática Central?',
      'A resolução mostra as consequências práticas da transformação?',
      'A estrutura escolhida serve ao ritmo e tom da história?',
      'As transições entre cenas e capítulos mantêm a fluidez narrativa?',
      'A curva do gráfico emocional alterna entre picos de tensão/medo e vales de alívio/esperança?',
      'Há variedade de sentimentos (curiosidade, choque, tristeza, alegria) ao longo dos pontos-chave?',
      'O tom emocional da cena final/resolução cumpre a promessa feita no início da narrativa?',
    ],
  },
  {
    title: 'Cenas & Construção Dramática',
    badgeStyle: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
    checkColor: 'bg-emerald-500 border-emerald-400 text-gray-950',
    items: [
      'Toda cena muda o estado emocional ou narrativo da história?',
      'Toda cena tem um objetivo claro para o personagem de POV?',
      'Toda cena contém um conflito ou oposição de intenções?',
      'Toda cena termina com um gancho/mola de tensão para a próxima?',
      'Nenhuma cena é redundante ou descartável?',
      'As informações essenciais são reveladas via ação e diálogo (Show, Don’t Tell)?',
      'Os cenários interagem fisicamente com os personagens durante as cenas?',
      'Cada ponto emocional marcante está devidamente vinculado a uma cena, mistério ou plot twist?',
    ],
  },
  {
    title: 'Mistério, Suspense & Subtramas',
    badgeStyle: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
    checkColor: 'bg-amber-500 border-amber-400 text-gray-950',
    items: [
      'Existe foreshadowing (pistas sutis) plantado com antecedência?',
      'Todo foreshadowing tem um payoff (recompensa) satisfatório?',
      'Os mistérios e pistas não trapaceiam com a atenção do leitor?',
      'As pistas essenciais estão disponíveis antes da grande revelação?',
      'Os plot twists parecem inevitáveis em retrospecto, embora surpreendentes?',
      'As consequências psicológicas e práticas dos twists são exploradas?',
      'As subtramas enriquecem ou espelham o tema da trama principal?',
    ],
  },
  {
    title: 'Mundo & Regras do Universo',
    badgeStyle: 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40',
    checkColor: 'bg-cyan-500 border-cyan-400 text-gray-950',
    items: [
      'O mundo e a ambientação refletem o tema central da história?',
      'Os sistemas (magia, tecnologia, economia, poder) têm regras e limitações consistentes?',
      'As facções e instituições têm motivações e ideologias claras?',
      'A história e o folclore do mundo afetam o presente da narrativa?',
      'O cenário ativa os cinco sentidos do leitor em momentos-chave?',
      'O cenário possui contrastes sociais, geográficos ou culturais visíveis?',
      'Os limites físicos, geográficos ou tecnológicos do mundo geram obstáculos na trama?',
    ],
  },
  {
    title: 'Tema, Mensagem & Promessa',
    badgeStyle: 'bg-pink-950/40 text-pink-300 border-pink-800/40',
    checkColor: 'bg-pink-500 border-pink-400 text-white',
    items: [
      'O tema permeia os dilemas da obra sem soar panfletário ou didático?',
      'A conclusão responde à pergunta filosófica central levantada no início?',
      'A promessa de gênero feita nos primeiros capítulos é cumprida no final?',
      'O título e a premissa encontram ressonância ao longo do texto?',
      'A história possui um dilema filosófico onde duas verdades entram em colisão?',
      'O desfecho deixa uma sensação de encerramento emocional satisfatório para o leitor?',
    ],
  },
  {
    title: 'Prosa, Ritmo & Emoção',
    badgeStyle: 'bg-[#28241e] text-[#e0d3bf] border-[#5a4f3e]',
    checkColor: 'bg-[#b39368] border-[#d8be99] text-gray-950',
    items: [
      'O ritmo varia adequadamente entre picos de tensão e momentos de alívio?',
      'A jornada emocional do leitor é variada ao longo dos atos?',
      'O tom do final corresponde ao pacto estabelecido com o leitor?',
      'O estilo de prosa e o ritmo de frases casam com o nível de ação da cena?',
      'A voz narrativa (1ª ou 3ª pessoa) é consistente em ponto de vista (POV)?',
      'Os diálogos soam naturais quando lidos em voz alta?',
      'Verbos de ação precisos foram preferidos a adjetivos e advérbios em excesso?',
      'Os parágrafos variam de tamanho conforme a velocidade/urgência do momento da cena?',
      'Evitou-se a repetição excessiva de palavras ou ecos sonoros próximos no mesmo parágrafo?',
      'A narrativa evita exposição de informações (info-dumping) em blocos longos de texto?',
    ],
  },
];

export default function Checklist({ projectId }) {
  const [checkedItems, setCheckedItems] = useState({});
  const [savingStatus, setSavingStatus] = useState('Salvo');
  const isFirstRender = useRef(true);

  const totalItems = checklistCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  // Parâmetros do SVG Donut
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  // 1. Carregar do Banco
  useEffect(() => {
    if (!projectId) return;

    const fetchChecklist = async () => {
      try {
        const res = await apiClient.get(`/entities/projects/${projectId}/checklist`);
        if (res.data && typeof res.data === 'object') {
          setCheckedItems(res.data);
        }
      } catch (err) {
        console.error('Erro ao buscar Checklist:', err);
      }
    };

    fetchChecklist();
  }, [projectId]);

  // 2. Auto-save
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!projectId) return;

    setSavingStatus('Salvando...');

    const timer = setTimeout(async () => {
      try {
        await apiClient.post(`/entities/projects/${projectId}/checklist`, checkedItems);
        setSavingStatus('Salvo no banco');
      } catch (err) {
        console.error('Erro ao salvar Checklist:', err);
        setSavingStatus('Erro ao salvar');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [checkedItems, projectId]);

  function toggleCheck(itemKey) {
    setCheckedItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  }

  return (
    <main className="module-page checklist-page space-y-10 max-w-5xl mx-auto pb-24">
      {/* Cabeçalho */}
      <header className="module-header flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Checklist de Desenvolvimento</h1>
          <p className="text-base text-gray-400 mt-1">
            Centenas de verificações automáticas para garantir a qualidade narrativa.
          </p>
        </div>
        <span className="text-sm text-gray-400 font-medium bg-[#1c1c26] px-4 py-1.5 rounded-full border border-gray-800">
          {savingStatus}
        </span>
      </header>

      {/* CARD DE RESUMO CENTRAL */}
      <div className="bg-[#111118] border border-gray-800/80 p-8 rounded-2xl flex items-center gap-8 shadow-2xl">
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 68 68">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <circle
              cx="34"
              cy="34"
              r={radius}
              className="text-gray-800/80"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="34"
              cy="34"
              r={radius}
              stroke="url(#progressGradient)"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <span className="absolute text-base font-bold text-white">
            {progressPercentage}%
          </span>
        </div>

        <div>
          <h3 className="text-white font-bold text-xl leading-snug">
            {completedCount} de {totalItems} verificações concluídas
          </h3>
          <p className="text-sm text-gray-400 mt-1.5 max-w-xl leading-relaxed">
            Use o checklist como guia de qualidade narrativa. Adapte às necessidades da sua história.
          </p>
        </div>
      </div>

      {/* CATEGORIAS DO CHECKLIST COM ESPAÇAMENTO EXPANDIDO */}
      <div className="space-y-12">
        {checklistCategories.map((category) => {
          const categoryCompleted = category.items.filter((item) => checkedItems[item]).length;

          return (
            <section key={category.title} className="space-y-5">
              {/* Título da Categoria */}
              <div className="flex justify-between items-center px-1">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  {category.title}
                </h2>
                <span className={`text-xs font-bold px-3.5 py-1 rounded-full border ${category.badgeStyle}`}>
                  {categoryCompleted}/{category.items.length}
                </span>
              </div>

              {/* LISTA COM ALTURA E ESPAÇAMENTO */}
              <div className="space-y-4">
                {category.items.map((item) => {
                  const isChecked = !!checkedItems[item];

                  return (
                    <label
                      key={item}
                      onClick={() => toggleCheck(item)}
                      className={`flex items-center gap-6 px-7 py-6 rounded-2xl border cursor-pointer transition-all duration-200 min-h-[72px] ${
                        isChecked
                          ? 'bg-[#12141d] border-gray-700/80 text-gray-200'
                          : 'bg-[#111118] border-gray-800/80 text-gray-300 hover:border-gray-700 hover:bg-[#151520]'
                      }`}
                    >
                      {/* CÍRCULO VERDE/COLORIDO MAIOR (32px / w-8 h-8) */}
                      <span
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-base font-bold shrink-0 transition-all ${
                          isChecked
                            ? category.checkColor
                            : 'border-gray-700 bg-transparent text-transparent hover:border-gray-500'
                        }`}
                      >
                        ✓
                      </span>

                      {/* TEXTO DO ITEM COM FONTE E LINE-HEIGHT AMPLIADOS */}
                      <span className={`text-lg font-medium leading-relaxed ${isChecked ? 'line-through opacity-60 text-gray-400' : ''}`}>
                        {item}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}