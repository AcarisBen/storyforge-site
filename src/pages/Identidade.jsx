import { useState } from 'react'

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
]

function Identidade() {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(([label]) => [label, ''])))
  const completedFields = fields.filter(([label]) => values[label].trim() !== '').length
  const progress = Math.round((completedFields / fields.length) * 100)

  function handleChange(event) {
    const { id, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [id]: value }))
  }

  return (
    <main className="identity-page">
      <header className="progress-panel" aria-label="Progresso da identidade">
        <div className="progress-heading"><span>Progresso</span><strong>{progress}%</strong></div>
        <div className="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}>
          <div className="progress-value" style={{ width: `${progress}%` }} />
        </div>
        <p>{completedFields} de {fields.length} campos preenchidos</p>
      </header>
      <form className="identity-form">
        {fields.map(([label, placeholder, hint, example]) => (
          <section className="identity-card" key={label}>
            <label className="field-label" htmlFor={`identity-${label}`}>{label}</label>
            <textarea id={`identity-${label}`} placeholder={placeholder} value={values[label]} onChange={handleChange} />
            {hint && <p className="field-note"><span className="note-icon" aria-hidden="true">!</span>{hint}</p>}
            <p className="field-example"><span className="example-icon" aria-hidden="true">▣</span>{example}</p>
          </section>
        ))}
      </form>
    </main>
  )
}

export default Identidade