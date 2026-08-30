import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';

const fields = [
  [
    'Personagens',
    'Como os personagens encarnam o tema...',
    'Os personagens são a expressão viva do tema.',
    'Ex: O protagonista busca controle absoluto enquanto o antagonista aceita o caos.',
  ],
  [
    'Conflito',
    'O conflito central que gera a narrativa...',
    'Sem conflito, não há história.',
    'Ex: A luta entre manter a ordem tradicional e abraçar a mudança inevitável.',
  ],
  [
    'Trama',
    'A sequência de eventos que a estrutura conta...',
    'A trama é o esqueleto visível da história.',
    'Ex: Uma investigação que começa local e revela uma conspiração de grande escala.',
  ],
  [
    'Estilo',
    'A linguagem, o tom, a estética narrativa...',
    'O estilo é como a história é contada — não o que é contado.',
    'Ex: Tom sombrio e intimista, focado em descrições sensoriais e ritmo ágil.',
  ],
  [
    'Contexto',
    'O mundo, a época, o cenário onde tudo acontece...',
    'O contexto é o palco onde a história se desenrola.',
    'Ex: Uma metrópole decadente em um futuro próximo afetado pela crise climática.',
  ],
  [
    'Contraste',
    'Os opostos que geram interesse narrativo...',
    'Contraste é o que cria tensão visual e dramática.',
    'Ex: Riqueza extrema das elites em contraste direto com a escassez das periferias.',
  ],
  [
    'Mundo Interior',
    'A jornada interna e o arco emocional...',
    'A transformação psicológica que o protagonista precisa atravessar.',
    'Ex: Da negação da responsabilidade para a aceitação das consequências de suas escolhas.',
  ],
  [
    'Conclusão',
    'Como a história resolve e responde ao tema...',
    'A conclusão deve responder ao tema, não apenas resolver a trama.',
    'Ex: A vitória exige um sacrifício pessoal que valida a mensagem central da obra.',
  ],
];

const LightbulbIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

const BookOpenIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export default function Engenharia({ projectId }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(([label]) => [label, ''])));
  const [savingStatus, setSavingStatus] = useState('Salvo');
  const isFirstRender = useRef(true);

  // 1. Carrega os dados salvos do PostgreSQL ao abrir
  useEffect(() => {
    if (!projectId) return;

    const fetchEngenharia = async () => {
      try {
        const res = await apiClient.get(`/entities/projects/${projectId}/engenharia`);
        if (res.data && Object.keys(res.data).length > 0) {
          setValues((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Erro ao buscar dados da Engenharia:', err);
      }
    };

    fetchEngenharia();
  }, [projectId]);

  // 2. Auto-save com Debounce de 1.5s
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!projectId) return;

    setSavingStatus('Salvando...');

    const timer = setTimeout(async () => {
      try {
        await apiClient.post(`/entities/projects/${projectId}/engenharia`, values);
        setSavingStatus('Salvo no banco');
      } catch (err) {
        console.error('Erro no Auto-save da Engenharia:', err);
        setSavingStatus('Erro ao salvar');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [values, projectId]);

  const completedFields = fields.filter(([label]) => (values[label] || '').trim() !== '').length;
  const progress = Math.round((completedFields / fields.length) * 100);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  return (
    <main className="identity-page">
      <header className="progress-panel" aria-label="Progresso da engenharia narrativa">
        <div className="flex justify-between items-center mb-2">
          <div className="progress-heading">
            <span>Progresso</span>
            <strong className="ml-2">{progress}%</strong>
          </div>
          <span className="text-xs text-gray-400 font-medium bg-[#1c1c26] px-3 py-1 rounded-full border border-gray-800">
            {savingStatus}
          </span>
        </div>
        <div className="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}>
          <div className="progress-value" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-gray-400">{completedFields} de {fields.length} campos preenchidos</p>
      </header>

      <form className="identity-form" onSubmit={(e) => e.preventDefault()}>
        {fields.map(([label, placeholder, hint, example]) => (
          <section className="identity-card" key={label}>
            <label className="field-label" htmlFor={`engineering-${label}`}>{label}</label>
            <textarea
              id={`engineering-${label}`}
              name={label}
              placeholder={placeholder}
              value={values[label] || ''}
              onChange={handleChange}
            />
            {hint && (
              <p className="field-note">
                <span className="note-icon" aria-hidden="true"><LightbulbIcon /></span>
                {hint}
              </p>
            )}
            {example && (
              <p className="field-example">
                <span className="example-icon" aria-hidden="true"><BookOpenIcon /></span>
                {example}
              </p>
            )}
          </section>
        ))}
      </form>
    </main>
  );
}