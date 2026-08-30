import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';

const fields = [
  ['Título', 'O título da sua história...', 'O título deve capturar a essência da obra em poucas palavras.', 'Ex: O Senhor dos Anéis'],
  ['Subtítulo', 'Um subtítulo descritivo...', '', 'Ex: A Sociedade do Anel'],
  ['Pitch', 'A frase que vende a ideia em 10 segundos...', 'O pitch é mais curto que a logline — é o gancho comercial.', 'Ex: Um hobbit deve destruir um anel maligno antes que seu criador escravize o mundo.'],
  ['Logline', 'Protagonista + Conflito + Objetivo + Stakes...', 'Estrutura: Quem é o protagonista, o que ele quer, o que impede, o que está em jogo.', 'Ex: Um jovem fazendeiro deve aprender os caminhos da Força para salvar a galáxia do Império.'],
  ['Sinopse', 'Resumo completo da história em 1-3 parágrafos...', 'A sinopse é uma descrição detalhada da história, incluindo personagens, enredo e conflitos.', 'Ex: Um hobbit herda um anel mágico e parte para destruí-lo antes que o Senhor do Escuro domine a Terra-média.'],
  ['Tema', 'O tema central da história...', 'O tema é a mensagem ou lição que a história transmite.', 'Ex: A luta entre o bem e o mal.'],
  ['Mensagem', 'A mensagem que você quer passar com a história...', 'A mensagem é a moral ou lição que o autor quer transmitir ao público.', 'Ex: A coragem e a determinação podem superar qualquer obstáculo.'],
  ['Público-alvo', 'Quem é o público-alvo da história...', 'Defina o grupo de pessoas que você deseja atingir com a história.', 'Ex: Jovens adultos, fãs de fantasia.'],
  ['Gênero', 'O gênero da história...', 'A categoria narrativa à qual a história pertence.', 'Ex: Romance, Ficção Científica, Fantasia.'],
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

export default function Identidade({ projectId }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(([label]) => [label, ''])));
  const [savingStatus, setSavingStatus] = useState('Salvo'); // Status: 'Salvo', 'Salvando...', 'Erro'
  const isFirstRender = useRef(true);

  // 1. Carrega as informações do banco PostgreSQL ao abrir a tela
  useEffect(() => {
    if (!projectId) return;

    const fetchIdentity = async () => {
      try {
        const res = await apiClient.get(`/entities/projects/${projectId}/identity`);
        if (res.data && Object.keys(res.data).length > 0) {
          setValues((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Erro ao buscar dados da Identidade:', err);
      }
    };

    fetchIdentity();
  }, [projectId]);

  // 2. Auto-save com Debounce (Salva automaticamente 1.5 segundo após parar de digitar)
  useEffect(() => {
    // Evita disparar o salvamento na primeira renderização ao carregar a página
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!projectId) return;

    setSavingStatus('Salvando...');

    const timer = setTimeout(async () => {
      try {
        await apiClient.post(`/entities/projects/${projectId}/identity`, values);
        setSavingStatus('Salvo no banco');
      } catch (err) {
        console.error('Erro no Auto-save da Identidade:', err);
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
      <header className="progress-panel" aria-label="Progresso da identidade">
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
            <label className="field-label" htmlFor={`identity-${label}`}>{label}</label>
            <textarea
              id={`identity-${label}`}
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