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
            <p className="field-note"><span className="note-icon" aria-hidden="true">!</span>{hint}</p>
            {example && <p className="field-example"><span className="example-icon" aria-hidden="true">▣</span>{example}</p>}
          </section>
        ))}
      </form>
    </main>
  )
}

export default Engenharia