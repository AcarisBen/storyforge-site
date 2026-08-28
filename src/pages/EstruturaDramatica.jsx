import { useState } from 'react'

const tabs = {
  Objetivo: {
    icon: '◎',
    content: <p>Selecionar e combinar frameworks estruturais para dar ritmo e forma à história.</p>,
  },
  Dicas: {
    icon: '♧',
    content: (
      <ul>
        <li>Você pode usar um framework ou combinar vários — não existe resposta única.</li>
        <li>Cada framework resolve um problema narrativo diferente.</li>
        <li>A estrutura serve à história — não o contrário.</li>
      </ul>
    ),
  },
  Exemplos: {
    icon: '▣',
    content: (
      <ul>
        <li>3 Atos: Setup, Confronto, Resolução.</li>
        <li>Jornada do Herói: 12 estágios de Joseph Campbell.</li>
        <li>Save the Cat: 15 beats de Blake Snyder.</li>
      </ul>
    ),
  },
  Perguntas: {
    icon: '?',
    content: (
      <ul>
        <li>Qual framework melhor serve o ritmo que você imagina?</li>
        <li>Você quer uma estrutura clássica ou experimental?</li>
        <li>Como os frameworks escolhidos se complementam?</li>
      </ul>
    ),
  },
}

const frameworks = [
  ['3 Atos', 'Setup, Confronto, Resolução', '3 beats', 'A estrutura clássica de três atos é a espinha dorsal da maioria das histórias ocidentais. Divide a narrativa em três grandes blocos: o Primeiro Ato apresenta o mundo e o personagem, o Segundo Ato desenvolve o conflito e a escalada, e o Terceiro Ato traz o clímax e a resolução.'],
  ['8 Sequências (Paul Gulino)', 'Oito blocos narrativos com pontos de virada', '8 beats', 'A estrutura de 8 Sequências divide cada ato da história clássica em blocos menores e autossustentáveis. Cada sequência é uma mini-história com começo, meio e fim, conectada por pontos de virada.'],
  ['Jornada do Herói', '12 estágios de Joseph Campbell', '12 beats', 'Baseada no monomito de Joseph Campbell, descreve doze estágios universais que muitos protagonistas atravessam, da separação do mundo comum ao retorno transformado.'],
  ['Story Circle (Dan Harmon)', '8 passos cíclicos', '8 beats', 'Simplificação circular da Jornada do Herói, com oito passos cíclicos. O protagonista sai de um estado e volta a ele transformado, funcionando bem em episódios ou histórias curtas.'],
  ['Save the Cat (Blake Snyder)', '15 beats estruturais', '15 beats', 'Blake Snyder desenvolveu quinze beats que mapeiam com precisão uma narrativa comercial eficiente. É uma estrutura detalhada e popular em roteiros de cinema comercial.'],
  ['Freytag (Pirâmide Dramática)', '5 atos clássicos', '5 beats', 'A pirâmide de Gustav Freytag apresenta cinco estágios: Exposição, Ação Ascendente, Clímax, Ação Descendente e Resolução.'],
]

const acts = [
  ['Ato I - Setup', 'Primeiros 25% da história. Estabelece o mundo comum, o protagonista, o tom, as regras e o equilíbrio. O incidente incitante perturba esse equilíbrio e impulsiona o protagonista em direção à história.'],
  ['Ato II - Confronto', 'Os próximos 50% da história. O protagonista atravessa o novo mundo e enfrenta obstáculos crescentes, encontra aliados e inimigos, e o conflito escala. Termina em uma crise profunda — tudo parece perdido.'],
  ['Ato III - Resolução', 'Os últimos 25% da história. O clímax culmina — a batalha final, escolha última ou revelação. Depois, a resolução mostra o novo equilíbrio e as consequências da transformação.'],
]

const sequences = [
  ['Sequência 1', 'Início do Ato I — apresenta o mundo, o protagonista, seu problema ou desejo inicial, e o tom da obra.'],
  ['Sequência 2', 'Fim do Ato I — o incidente incitante perturba o equilíbrio; o protagonista decide (ou é forçado) a entrar na história.'],
  ['Sequência 3', 'Início do Ato II — o protagonista entra no novo mundo, encontra aliados e inimigos, e explora o cenário da história.'],
  ['Sequência 4', 'Primeira metade do Ato II — obstáculos crescentes; finaliza com o primeiro midpoint que inverte ou escala o conflito.'],
  ['Sequência 5', 'Após o midpoint — a história ganha nova direção e a tensão aumenta; tudo parece estar progredindo.'],
  ['Sequência 6', 'Fim do Ato II — a pior derrota do protagonista; tudo parece perdido e a crise culmina.'],
  ['Sequência 7', 'Início do Ato III — o protagonista se ergue, recupera recursos e prepara o confronto final.'],
  ['Sequência 8', 'Fim do Ato III — o clímax, a resolução do conflito e o novo equilíbrio.'],
]

const heroStages = [
  ['Mundo Comum', 'Estabelece a vida normal do herói, suas faltas, o equilíbrio (ou desequilíbrio) e o que ele não quer largar.'],
  ['Chamado à Aventura', 'Evento ou mensagem que perturba o equilíbrio e convida o herói para a jornada.'],
  ['Recusa do Chamado', 'O herói hesita por medo, orgulho ou apego — uma resistência humana que torna o compromisso posterior mais poderoso.'],
  ['Encontro com o Mentor', 'O herói conhece alguém (ou algo) que fornece conselho, treinamento ou ferramenta simbólica.'],
  ['Travessia do Limiar', 'O herói finalmente se compromete com a jornada e cruza a fronteira para o mundo especial — ponto sem retorno.'],
  ['Aliados/Inimigos', 'No novo mundo, o herói descobre quem ajuda e quem dificulta. Estabelece regras, facções e associações.'],
  ['Aproximação', 'Preparação para o maior desafio. O herói organiza recursos e elabora um plano.'],
  ['Provação Difícil', 'A batalha central ou o teste que tudo decide. O herói sofre e descobre algo sobre si mesmo.'],
  ['Recompensa', 'Após vencer a provação, o herói obtém o objeto da jornada — físico, espiritual ou simbólico.'],
  ['Caminho de Volta', 'As consequências da provação surgem; o herói começa a voltar, mas ainda há obstáculos.'],
  ['Ressurreição', 'O confronto final e mais perigoso — o herói é testado no limite. Responde à pergunta “mudou mesmo?”.'],
  ['Retorno com o Elixir', 'O herói volta transformado e traz algo (concreto ou abstrato) que vai melhorar o mundo comum.'],
]

const storyCircleSteps = [
  ['Conforto', 'O protagonista em sua vida normal — conhecida, segura, estática.'],
  ['Desejo', 'O protagonista quer algo — conscientemente ou inconscientemente.'],
  ['Entrada', 'O protagonista entra em uma situação desconfortável, um novo mundo, um novo desafio.'],
  ['Adaptação', 'O protagonista se adapta ao novo ambiente, aprendendo suas regras e lidando com obstáculos.'],
  ['Conquista', 'O protagonista obtém o que queria.'],
  ['Preço', 'Mas cobra um preço — uma perda, uma revelação, uma dor, algo que muda a perspectiva.'],
  ['Retorno', 'O protagonista retorna ao mundo cotidiano (ou a algo que se parece com ele).'],
  ['Mudança', 'O protagonista voltou, mas está transformado — o mundo comum já não é mais o mesmo.'],
]

const saveTheCatBeats = [
  ['Imagem de Abertura', 'A primeira impressão do tom, gênero e/ou tema. Muitas vezes espelha a Imagem Final.'],
  ['Tema Declarado', 'O tema é explicitamente dito por um personagem, frequentemente um secundário ou mentor.'],
  ['Setup', 'Apresenta o protagonista, seu mundo e suas faltas — o que ele não sabe sobre si mesmo.'],
  ['Catalisador', 'O evento de mudança que dá início à história (o “incidente incitante”).'],
  ['Debate', 'O herói hesita, questionando se vai ou não aceitar a jornada.'],
  ['Entrando no Ato II', 'O herói cruza o ponto sem retorno para o mundo especial.'],
  ['Subtrama B', 'Início de uma ramificação secundária — frequentemente um romance ou amizade.'],
  ['Diversão e Jogos', 'O coração do Ato II — o “núcleo” da premissa; entregamos o que foi prometido.'],
  ['Ponto Médio', 'A história ganha nova direção, geralmente com um aparente triunfo ou derrota.'],
  ['Inimigos se Aproximam', 'A tensão sobe; forças contrárias se reorganizam para atacar.'],
  ['Tudo Está Perdido', 'O ponto mais baixo do herói; parece que tudo o que ele construiu foi destruído.'],
  ['Alma das Trevas', 'Momento íntimo de desespero; o herói confronta a verdade sobre si mesmo.'],
  ['Entrando no Ato III', 'O herói se decide — uma nova resolução ou revelação decisiva.'],
  ['Finale', 'O clímax — última batalha, último teste, a síntese do que o herói aprendeu.'],
  ['Imagem Final', 'O espelho da Imagem de Abertura — mostra o quanto tudo mudou desde o início.'],
]

const freytagStages = [
  ['Exposição', 'Apresenta o cenário, personagens e situação inicial — o equilíbrio que será perturbado.'],
  ['Ação Ascendente', 'A ação sobe; eventos escalam o conflito, o público vê o caminho da tensão crescente.'],
  ['Clímax', 'O ponto máximo — a virada decisiva, a batalha central, a escolha irrevogável.'],
  ['Ação Descendente', 'As consequências do clímax — o que acontece após o grande momento; a tensão agora cai.'],
  ['Resolução', 'O novo normal — o equilíbrio final, diferente do inicial.'],
]

function EstruturaDramatica() {
  const [activeTab, setActiveTab] = useState('Objetivo')
  const [isGuideOpen, setIsGuideOpen] = useState(true)
  const [selectedFrameworks, setSelectedFrameworks] = useState([])
  const [actValues, setActValues] = useState(() => Object.fromEntries(acts.map(([label]) => [label, ''])))
  const [sequenceValues, setSequenceValues] = useState(() => Object.fromEntries(sequences.map(([label]) => [label, ''])))
  const [heroValues, setHeroValues] = useState(() => Object.fromEntries(heroStages.map(([label]) => [label, ''])))
  const [storyCircleValues, setStoryCircleValues] = useState(() => Object.fromEntries(storyCircleSteps.map(([label]) => [label, ''])))
  const [saveTheCatValues, setSaveTheCatValues] = useState(() => Object.fromEntries(saveTheCatBeats.map(([label]) => [label, ''])))
  const [freytagValues, setFreytagValues] = useState(() => Object.fromEntries(freytagStages.map(([label]) => [label, ''])))
  const [areActsOpen, setAreActsOpen] = useState(true)
  const [areSequencesOpen, setAreSequencesOpen] = useState(true)
  const [isHeroOpen, setIsHeroOpen] = useState(true)
  const [isStoryCircleOpen, setIsStoryCircleOpen] = useState(true)
  const [isSaveTheCatOpen, setIsSaveTheCatOpen] = useState(true)
  const [isFreytagOpen, setIsFreytagOpen] = useState(true)
  const activeContent = tabs[activeTab]
  const completedActs = acts.filter(([label]) => actValues[label].trim() !== '').length
  const completedSequences = sequences.filter(([label]) => sequenceValues[label].trim() !== '').length
  const completedHeroStages = heroStages.filter(([label]) => heroValues[label].trim() !== '').length
  const completedStoryCircleSteps = storyCircleSteps.filter(([label]) => storyCircleValues[label].trim() !== '').length
  const completedSaveTheCatBeats = saveTheCatBeats.filter(([label]) => saveTheCatValues[label].trim() !== '').length
  const completedFreytagStages = freytagStages.filter(([label]) => freytagValues[label].trim() !== '').length
  const selectedFieldCount = (selectedFrameworks.includes('3 Atos') ? acts.length : 0)
    + (selectedFrameworks.includes('8 Sequências (Paul Gulino)') ? sequences.length : 0)
    + (selectedFrameworks.includes('Jornada do Herói') ? heroStages.length : 0)
    + (selectedFrameworks.includes('Story Circle (Dan Harmon)') ? storyCircleSteps.length : 0)
    + (selectedFrameworks.includes('Save the Cat (Blake Snyder)') ? saveTheCatBeats.length : 0)
    + (selectedFrameworks.includes('Freytag (Pirâmide Dramática)') ? freytagStages.length : 0)
  const completedFieldCount = (selectedFrameworks.includes('3 Atos') ? completedActs : 0)
    + (selectedFrameworks.includes('8 Sequências (Paul Gulino)') ? completedSequences : 0)
    + (selectedFrameworks.includes('Jornada do Herói') ? completedHeroStages : 0)
    + (selectedFrameworks.includes('Story Circle (Dan Harmon)') ? completedStoryCircleSteps : 0)
    + (selectedFrameworks.includes('Save the Cat (Blake Snyder)') ? completedSaveTheCatBeats : 0)
    + (selectedFrameworks.includes('Freytag (Pirâmide Dramática)') ? completedFreytagStages : 0)
  const progress = selectedFieldCount === 0 ? 0 : Math.round((completedFieldCount / selectedFieldCount) * 100)

  function toggleFramework(frameworkName) {
    setSelectedFrameworks((currentFrameworks) => currentFrameworks.includes(frameworkName)
      ? currentFrameworks.filter((name) => name !== frameworkName)
      : [...currentFrameworks, frameworkName])
  }

  function handleActChange(event) {
    const { name, value } = event.target
    setActValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  function handleSequenceChange(event) {
    const { name, value } = event.target
    setSequenceValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  function handleHeroChange(event) {
    const { name, value } = event.target
    setHeroValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  function handleStoryCircleChange(event) {
    const { name, value } = event.target
    setStoryCircleValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  function handleSaveTheCatChange(event) {
    const { name, value } = event.target
    setSaveTheCatValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  function handleFreytagChange(event) {
    const { name, value } = event.target
    setFreytagValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  return (
    <main className="module-page">
      <header className="module-header">
        <div>
          <h1>Estrutura Dramática</h1>
          <p>O esqueleto da sua história — escolha os frameworks que melhor servem sua narrativa.</p>
        </div>
        <div className="module-progress"><span aria-hidden="true" />{progress}%</div>
      </header>
      <div className="module-progress-track"><div style={{ width: `${progress}%` }} /></div>

      <section className="module-guide">
        <button
          className="guide-toggle"
          type="button"
          aria-expanded={isGuideOpen}
          aria-controls="module-guide-content"
          onClick={() => setIsGuideOpen((currentState) => !currentState)}
        >
          <span><b aria-hidden="true">!</b> Guia do Módulo</span>
          <span aria-hidden="true">{isGuideOpen ? '⌃' : '⌄'}</span>
        </button>
        {isGuideOpen && (
          <div className="guide-content" id="module-guide-content">
            <nav className="guide-tabs" aria-label="Guia do módulo">
              {Object.entries(tabs).map(([label, tab]) => (
                <button className={activeTab === label ? 'guide-tab active' : 'guide-tab'} type="button" key={label} onClick={() => setActiveTab(label)}>
                  <span aria-hidden="true">{tab.icon}</span>{label}
                </button>
              ))}
            </nav>
            <div className="guide-description">{activeContent.content}</div>
          </div>
        )}
      </section>

      <p className="framework-intro">Selecione um ou mais frameworks estruturais. Você pode usar apenas um ou combinar vários — não existe resposta única.</p>
      <section className="framework-grid" aria-label="Frameworks estruturais">
        {frameworks.map(([name, summary, beats, description]) => {
          const isSelected = selectedFrameworks.includes(name)
          return (
            <button className={isSelected ? 'framework-card selected' : 'framework-card'} type="button" key={name} aria-pressed={isSelected} onClick={() => toggleFramework(name)}>
              <span className="framework-copy">
                <strong>{name}</strong>
                <span>{summary}</span>
                <small>{beats}</small>
                <em>{description}</em>
              </span>
              <span className="framework-check" aria-hidden="true">{isSelected ? '✓' : ''}</span>
            </button>
          )
        })}
      </section>
      {selectedFrameworks.includes('3 Atos') && (
        <section className="three-acts-panel">
          <header className="three-acts-header">
            <div className="three-acts-title"><span>{completedActs}/3</span><strong>3 Atos</strong></div>
            <button type="button" onClick={() => setAreActsOpen((currentState) => !currentState)}>{areActsOpen ? 'Recolher' : 'Expandir'}</button>
          </header>
          {areActsOpen && <div className="acts-list">{acts.map(([label, description], index) => (
            <section className="act-item" key={label}>
              <h2>{index + 1}. {label}</h2>
              <p>{description}</p>
              <textarea name={label} placeholder={`Descreva o que acontece em "${label}"...`} value={actValues[label]} onChange={handleActChange} />
            </section>
          ))}</div>}
        </section>
      )}
      {selectedFrameworks.includes('8 Sequências (Paul Gulino)') && (
        <section className="three-acts-panel sequences-panel">
          <header className="three-acts-header">
            <div className="three-acts-title"><span>{completedSequences}/8</span><strong>8 Sequências (Paul Gulino)</strong></div>
            <button type="button" onClick={() => setAreSequencesOpen((currentState) => !currentState)}>{areSequencesOpen ? 'Recolher' : 'Expandir'}</button>
          </header>
          {areSequencesOpen && <div className="acts-list">{sequences.map(([label, description], index) => (
            <section className="act-item" key={label}>
              <h2>{index + 1}. {label}</h2>
              <p>{description}</p>
              <textarea name={label} placeholder={`Descreva o que acontece em "${label}"...`} value={sequenceValues[label]} onChange={handleSequenceChange} />
            </section>
          ))}</div>}
        </section>
      )}
      {selectedFrameworks.includes('Jornada do Herói') && (
        <section className="three-acts-panel hero-panel">
          <header className="three-acts-header">
            <div className="three-acts-title"><span>{completedHeroStages}/12</span><strong>Jornada do Herói</strong></div>
            <button type="button" onClick={() => setIsHeroOpen((currentState) => !currentState)}>{isHeroOpen ? 'Recolher' : 'Expandir'}</button>
          </header>
          {isHeroOpen && <div className="acts-list">{heroStages.map(([label, description], index) => (
            <section className="act-item" key={label}>
              <h2>{index + 1}. {label}</h2>
              <p>{description}</p>
              <textarea name={label} placeholder={`Descreva o que acontece em "${label}"...`} value={heroValues[label]} onChange={handleHeroChange} />
            </section>
          ))}</div>}
        </section>
      )}
      {selectedFrameworks.includes('Story Circle (Dan Harmon)') && (
        <section className="three-acts-panel story-circle-panel">
          <header className="three-acts-header">
            <div className="three-acts-title"><span>{completedStoryCircleSteps}/8</span><strong>Story Circle (Dan Harmon)</strong></div>
            <button type="button" onClick={() => setIsStoryCircleOpen((currentState) => !currentState)}>{isStoryCircleOpen ? 'Recolher' : 'Expandir'}</button>
          </header>
          {isStoryCircleOpen && <div className="acts-list">{storyCircleSteps.map(([label, description], index) => (
            <section className="act-item" key={label}>
              <h2>{index + 1}. {label}</h2>
              <p>{description}</p>
              <textarea name={label} placeholder={`Descreva o que acontece em "${index + 1}. ${label}"...`} value={storyCircleValues[label]} onChange={handleStoryCircleChange} />
            </section>
          ))}</div>}
        </section>
      )}
      {selectedFrameworks.includes('Save the Cat (Blake Snyder)') && (
        <section className="three-acts-panel save-the-cat-panel">
          <header className="three-acts-header">
            <div className="three-acts-title"><span>{completedSaveTheCatBeats}/15</span><strong>Save the Cat (Blake Snyder)</strong></div>
            <button type="button" onClick={() => setIsSaveTheCatOpen((currentState) => !currentState)}>{isSaveTheCatOpen ? 'Recolher' : 'Expandir'}</button>
          </header>
          {isSaveTheCatOpen && <div className="acts-list">{saveTheCatBeats.map(([label, description], index) => (
            <section className="act-item" key={label}>
              <h2>{index + 1}. {label}</h2>
              <p>{description}</p>
              <textarea name={label} placeholder={`Descreva o que acontece em "${label}"...`} value={saveTheCatValues[label]} onChange={handleSaveTheCatChange} />
            </section>
          ))}</div>}
        </section>
      )}
      {selectedFrameworks.includes('Freytag (Pirâmide Dramática)') && (
        <section className="three-acts-panel freytag-panel">
          <header className="three-acts-header">
            <div className="three-acts-title"><span>{completedFreytagStages}/5</span><strong>Freytag (Pirâmide Dramática)</strong></div>
            <button type="button" onClick={() => setIsFreytagOpen((currentState) => !currentState)}>{isFreytagOpen ? 'Recolher' : 'Expandir'}</button>
          </header>
          {isFreytagOpen && <div className="acts-list">{freytagStages.map(([label, description], index) => (
            <section className="act-item" key={label}>
              <h2>{index + 1}. {label}</h2>
              <p>{description}</p>
              <textarea name={label} placeholder={`Descreva o que acontece em "${label}"...`} value={freytagValues[label]} onChange={handleFreytagChange} />
            </section>
          ))}</div>}
        </section>
      )}
      {selectedFrameworks.length === 0 && (
        <div className="framework-empty">Selecione ao menos um framework acima para começar a estruturar sua história.</div>
      )}
    </main>
  )
}

export default EstruturaDramatica