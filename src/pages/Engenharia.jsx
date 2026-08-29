import { useState } from 'react'

const fields = [
  [
    'Personagens',
    'Como os personagens encarnam o tema...',
    'Os personagens são a expressão viva do tema.',
    '',
  ],
  [
    'Conflito',
    'O conflito central que gera a narrativa...',
    'Sem conflito, não há história.',
    '',
  ],
  [
    'Trama',
    'A sequência de eventos que a estrutura conta...',
    'A trama é o esqueleto visível da história.',
    '',
  ],
  [
    'Estilo',
    'A linguagem, o tom, a estética narrativa...',
    'O estilo é como a história é contada — não o que é contado.',
    '',
  ],
  [
    'Contexto',
    'O mundo, a época, o cenário onde tudo acontece...',
    'O contexto é o palco onde a história se desenrola.',
    '',
  ],
  [
    'Contraste',
    'Os opostos que geram interesse narrativo...',
    'Contraste é o que cria tensão visual e dramática.',
    '',
  ],
  [
    'Conclusão',
    'Como a história resolve e responde ao tema...',
    'A conclusão deve responder ao tema, não apenas resolver a trama.',
    '',
  ],
]

// Ícone de Lâmpada
const LightbulbIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
)

// Ícone de Livro Aberto
const BookOpenIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

function Engenharia() {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(([label]) => [label, ''])))
  const completedFields = fields.filter(([label]) => values[label].trim() !== '').length
  const progress = Math.round((completedFields / fields.length) * 100)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  return (
    <main className="identity-page">
      <header className="progress-panel" aria-label="Progresso da engenharia narrativa">
        <div className="progress-heading"><span>Progresso</span><strong>{progress}%</strong></div>
        <div className="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}>
          <div className="progress-value" style={{ width: `${progress}%` }} />
        </div>
        <p>{completedFields} de {fields.length} campos preenchidos</p>
      </header>
      <form className="identity-form">
        {fields.map(([label, placeholder, hint, example]) => (
          <section className="identity-card" key={label}>
            <label className="field-label" htmlFor={`engineering-${label}`}>{label}</label>
            <textarea id={`engineering-${label}`} name={label} placeholder={placeholder} value={values[label]} onChange={handleChange} />
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
  )
}

export default Engenharia