import { useState } from 'react'

const checklistItems = [
  ['Tema definido', 'O tema central da história está claro?'],
  ['Personagens desenvolvidos', 'Todos os personagens principais têm arcos completos?'],
  ['Estrutura narrativa', 'A história segue uma estrutura coerente (3 atos, hero\'s journey, etc.)?'],
  ['Clímax impactante', 'O clímax da história é satisfatório e resolve o conflito central?'],
  ['Desenrolamento adequado', 'Os eventos intermediários avançam a história de forma lógica?'],
  ['Resolução completa', 'A resolução responde às perguntas levantadas ao longo da história?'],
  ['Consistência de mundo', 'Os elementos do mundo (magia, regras, física) são consistentes?'],
  ['Preparação para publicação', 'A história está pronta para revisão e publicação?'],
]

function Checklist() {
  const [activeItem, setActiveItem] = useState(null)

  return (
    <main className="characters-page">
      <header className="characters-header">
        <div>
          <h1>Checklist de StoryForge</h1>
          <p>Verificação final antes de publicar sua história</p>
        </div>
      </header>

      <section className="framework-grid" aria-label="Checklist de verificação">
        {checklistItems.map(([label, question], index) => (
          <div
            key={index}
            style={{
              marginBottom: '12px',
              padding: '12px',
              background: '#1e2127',
              border: '1px solid #30333b',
              borderRadius: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#c1c7d0' }}>{label}</span>
              <span
                style={{
                  padding: '4px 8px',
                  background: '#2a2d34',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#858892',
                }}
              >
                {index + 1}/7
              </span>
            </div>
            <p style={{ color: '#858892', margin: '8px 0 0' }}>{question}</p>
          </div>
        ))}
      </section>
    </main>
  )
}

export default Checklist