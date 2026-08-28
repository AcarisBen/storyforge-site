import { useState } from 'react'

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
]

function Essencia() {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(([label]) => [label, ''])))
  const completedFields = fields.filter(([label]) => values[label].trim() !== '').length
  const progress = Math.round((completedFields / fields.length) * 100)

  function handleChange(event) {
    const { id, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [id]: value }))
  }

  return (
    <main className="identity-page">
      <header className="progress-panel" aria-label="Progresso da essência da história">
        <div className="progress-heading">
          <span>Progresso</span>
          <strong>{progress}%</strong>
        </div>
        <div className="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}>
          <div className="progress-value" style={{ width: `${progress}%` }} />
        </div>
        <p>{completedFields} de {fields.length} campos preenchidos</p>
      </header>
      <form className="identity-form">
        {fields.map(([label, placeholder, hint, example]) => (
          <section className="identity-card" key={label}>
            <label className="field-label" htmlFor={label}>{label}</label>
            <textarea id={label} placeholder={placeholder} value={values[label]} onChange={handleChange} />
            <p className="field-note"><span className="note-icon" aria-hidden="true">!</span>{hint}</p>
            <p className="field-example"><span className="example-icon" aria-hidden="true">▣</span>{example}</p>
          </section>
        ))}
      </form>
    </main>
  )
}

export default Essencia