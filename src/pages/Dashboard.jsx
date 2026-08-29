import { useState } from 'react'

import Personagens from './Personagens'
import Mundo from './Mundo'
import Cenas from './Cenas'
import Misterios from './Misterios'
import PlotTwists from './PlotTwists'
import Checklist from './Checklist'

// Ícones em SVG nativo
const Icons = {
  Users: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Globe: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Clapperboard: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18" />
      <path d="M3 7.5h4" />
      <path d="M3 12h18" />
      <path d="M3 16.5h4" />
      <path d="M17 3v18" />
      <path d="M17 7.5h4" />
      <path d="M17 16.5h4" />
    </svg>
  ),
  Search: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Zap: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  CheckSquare: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 11 3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

const pages = [
  { name: 'Personagens', path: 'personagens', component: Personagens, count: '4', icon: Icons.Users },
  { name: 'Elementos do Mundo', path: 'mundo', component: Mundo, count: '1', icon: Icons.Globe },
  { name: 'Cenas', path: 'cenas', component: Cenas, count: '3', icon: Icons.Clapperboard },
  { name: 'Mistérios', path: 'misterios', component: Misterios, count: '1', icon: Icons.Search },
  { name: 'Plot Twists', path: 'plot-twists', component: PlotTwists, count: '1', icon: Icons.Zap },
  { name: 'Checklist', path: 'checklist', component: Checklist, count: '0/43', icon: Icons.CheckSquare },
]

function Dashboard() {
  const [activePage, setActivePage] = useState(null)

  const activeModule = pages.find((p) => p.path === activePage)
  const ActiveComponent = activeModule?.component

  return (
    <main style={{ padding: '24px', backgroundColor: '#0d0f12', minHeight: '100vh', color: '#fff' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Dashboard</h1>
        <p style={{ color: '#858892', fontSize: '14px' }}>
          Selecione um módulo para começar a planejar sua história
        </p>
      </header>

      <span style={{ 
        display: 'block', 
        fontSize: '12px', 
        fontWeight: '600', 
        color: '#6b7280', 
        letterSpacing: '0.05em', 
        marginBottom: '16px' 
      }}>
        VISÃO GERAL
      </span>

      <section 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '16px' 
        }} 
        aria-label="Módulos de planejamento"
      >
        {pages.map((page) => {
          const IconComponent = page.icon
          const ArrowIcon = Icons.ArrowRight
          return (
            <button
              key={page.path}
              type="button"
              onClick={() => setActivePage(page.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
                borderRadius: '12px',
                background: '#16181d',
                border: '1px solid #232730',
                color: '#fff',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '16px' }}>
                <IconComponent />
                <ArrowIcon />
              </div>

              <div>
                <span style={{ fontSize: '28px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                  {page.count}
                </span>
                <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                  {page.name}
                </span>
              </div>
            </button>
          )
        })}
      </section>

      {ActiveComponent && (
        <div
          className="module-page"
          style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #232730',
          }}
        >
          <ActiveComponent />
        </div>
      )}
    </main>
  )
}

export default Dashboard