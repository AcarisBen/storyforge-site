// src/main.jsx
// Ponto de entrada principal do React com suporte a AuthContext, PostHog e Estilos Globais.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { PostHogProvider } from '@posthog/react';
import { AuthProvider } from './lib/AuthContext';
import App from './App.jsx';
import CookieConsentBanner from './components/CookieConsentBanner.jsx';
import './index.css';

// Verifica se o usuário já deu o consentimento prévio
const hasConsent = localStorage.getItem('cookie_consent') === 'granted';

const options = {
  api_host: 'https://us.i.posthog.com',
  // Desativa a captura por padrão se o usuário ainda não autorizou
  opt_out_capturing_by_default: !hasConsent,
  persistence: hasConsent ? 'localStorage+cookie' : 'memory',
  // Proteção LGPD: Mascara todo o texto e inputs para proteger o manuscrito dos autores
  mask_all_text: true,
  mask_all_element_attributes: true,
};

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || 'phc_CmMaU3MhPZ97UzN6WCKj9GgKd8x6B3rRRFbZQRB3ExWz';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PostHogProvider apiKey={POSTHOG_KEY} options={options}>
      <AuthProvider>
        <App />
        <CookieConsentBanner />
      </AuthProvider>
    </PostHogProvider>
  </React.StrictMode>
);