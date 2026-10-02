// src/main.jsx
// Ponto de entrada principal do React com suporte a AuthContext, PostHog e Estilos Globais.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { PostHogProvider } from '@posthog/react';
import { AuthProvider } from './lib/AuthContext';
import App from './App.jsx';
import './index.css';

const options = {
  api_host: 'https://us.i.posthog.com',
};

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || 'phc_CmMaU3MhPZ97UzN6WCKj9GgKd8x6B3rRRFbZQRB3ExWz';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PostHogProvider apiKey={POSTHOG_KEY} options={options}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </PostHogProvider>
  </React.StrictMode>
);