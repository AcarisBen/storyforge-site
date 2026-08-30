import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';

const fields = [
  [
    'O que torna a história única?',
    'O que ninguém nunca fez que você está fazendo...',
    'A unicidade vem da combinação inesperada de elementos.',
    'Ex: Um mundo de fantasia onde a magia é alimentada por memórias esquecidas.',
  ],
  [
    'O que torna a história universal?',
    'Que emoção humana compartilhada torna a história reconhecível para todos...',
    'A universalidade vem da emoção humana que todo público reconhece.',
    'Ex: A dor de perder alguém que amamos e o medo do esquecimento.',
  ],
  [
    'Pergunta filosófica',
    'A pergunta que a história faz sobre a existência...',
    'A pergunta filosófica é o que dá profundidade à obra.',
    'Ex: Até que ponto nossas memórias nos definem? Sem elas, quem somos?',
  ],
  [
    'Premissa',
    'O “e se?” que dá origem a tudo...',
    'A premissa é a situação hipotética que inicia a história.',
    'Ex: E se um garoto descobrisse que é um bruxo e que um mundo mágico o espera?',
  ],
  [
    'Questão dramática',
    'A pergunta central que mantém o público até o fim...',
    'A questão dramática é o que o público quer ver respondido.',
    'Ex: O protagonista conseguirá superar seu trauma a tempo de salvar quem ama?',
  ],
  [
    'Promessa ao público',
    'O que você promete ao público — e como vai cumprir...',
    'A promessa é o contrato implícito entre autor e público.',
    'Ex: Uma jornada épica de autodescoberta, com batalhas emocionantes e um final emocionalmente satisfatório.',
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

export default function Essencia({ projectId }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(([label]) => [label, ''])));
  const [savingStatus, setSavingStatus] = useState('Salvo');
  const isFirstRender = useRef(true);

  // 1. Carrega dados salvos do PostgreSQL ao abrir
  useEffect(() => {
    if (!projectId) return;

    const fetchEssencia = async () => {
      try {
        const res = await apiClient.get(`/entities/projects/${projectId}/essencia`);
        if (res.data && Object.keys(res.data).length > 0) {
          setValues((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Erro ao buscar dados da Essência:', err);
      }
    };

    fetchEssencia();
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
        await apiClient.post(`/entities/projects/${projectId}/essencia`, values);
        setSavingStatus('Salvo no banco');
      } catch (err) {
        console.error('Erro no Auto-save da Essência:', err);
        setSavingStatus('Erro ao salvar');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [values, projectId]);

  const completedFields = fields.filter(([label]) => (values[label] || '').trim() !== '').length;
  const progress = Math.round((completedFields / fields.length) * 100);

  function handleChange(event) {
    const { id, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [id]: value }));
  }

  return (
    <main className="identity-page">
      <header className="progress-panel" aria-label="Progresso da essência da história">
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
            <label className="field-label" htmlFor={label}>{label}</label>
            <textarea
              id={label}
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
            <p className="field-example">
              <span className="example-icon" aria-hidden="true"><BookOpenIcon /></span>
              {example}
            </p>
          </section>
        ))}
      </form>
    </main>
  );
}