import { useState } from 'react'

const fields = [
  ['Título', 'input', 'O título da sua história...', 'O título deve capturar a essência da obra em poucas palavras.', 'Ex: O Senhor dos Anéis'],
  ['Subtítulo', 'input', 'Um subtítulo descritivo...', '', 'Ex: A Sociedade do Anel'],
  ['Pitch', 'textarea', 'A frase que vende a ideia em 10 segundos...', 'O pitch é mais curto que a logline — é o gancho comercial.', 'Ex: Um hobbit deve destruir um anel maligno antes que seu criador escravize o mundo.'],
  ['Logline', 'textarea', 'Protagonista + Conflito + Objetivo + Stakes...', 'Estrutura: Quem é o protagonista, o que ele quer, o que impede, o que está em jogo.', 'Ex: Um jovem fazendeiro deve aprender os caminhos da Força para salvar a galáxia do Império.'],
  ['Sinopse', 'textarea', 'Resumo completo da história em 1-3 parágrafos...', 'A sinopse é uma descrição detalhada da história, incluindo os personagens principais, o enredo e os conflitos, incluindo todos os spoilers.', 'Ex: Um hobbit chamado Frodo Bolseiro herda um anel mágico de seu tio Bilbo e parte para destruí-lo na Montanha da Perdição.'],
  ['Tema', 'textarea', 'O tema central da história...', 'O tema não é o assunto, é a mensagem ou lição que a história transmite. O que você diz sobre o assunto.', 'Ex: A luta entre o bem e o mal. O poder da amizade e da esperança contra a escuridão.'],
  ['Mensagem', 'textarea', 'A mensagem que você quer passar com a história. O que o público deve levar da história...', 'A mensagem é a moral ou lição que o autor quer transmitir ao público. É o que você quer que eles sintam ou aprendam.', 'Ex: A coragem e a determinação podem superar qualquer obstáculo.'],
  ['Público-alvo', 'textarea', 'Quem é o público-alvo da história...', 'O público-alvo é o grupo de pessoas que você deseja atingir com a história. Pode ser definido por idade, gênero, interesses, etc.', 'Ex: Jovens adultos, fãs de fantasia, leitores de ficção científica.'],
  ['Gênero', 'textarea', 'O gênero da história...', 'O gênero é a categoria narrativa à qual a história pertence. Pode ser combinado para criar subgêneros.', 'Ex: Romance, Ficção Científica, Fantasia.'],
]

function App() {
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
        {fields.map(([label, type, placeholder, hint, example]) => (
          <section className="identity-card" key={label}>
            <label className="field-label" htmlFor={label}>{label}</label>
            {type === 'textarea' ? (
              <textarea id={label} placeholder={placeholder} value={values[label]} onChange={handleChange} />
            ) : (
              <input id={label} type="text" placeholder={placeholder} value={values[label]} onChange={handleChange} />
            )}
            {hint && <p className="field-note"><span className="note-icon" aria-hidden="true">!</span>{hint}</p>}
            <p className="field-example"><span className="example-icon" aria-hidden="true">▣</span>{example}</p>
          </section>
        ))}
      </form>
    </main>
  )
}

export default App;
