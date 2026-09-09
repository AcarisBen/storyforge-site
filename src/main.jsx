// src.main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'   // <-- aqui é onde entra o import do CSS

import { PostHogProvider } from '@posthog/react';

const options = {
  api_host: 'https://us.i.posthog.com',
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Substitua SUA_CHAVE_DO_POSTHOG pela API Key gerada no painel do PostHog */}
    <PostHogProvider apiKey="phc_CmMaU3MhPZ97UzN6WCKj9GgKd8x6B3rRRFbZQRB3ExWz" options={options}>
      <App />
    </PostHogProvider>
  </React.StrictMode>
);
