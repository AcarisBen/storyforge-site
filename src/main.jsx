// src/main.jsx
// Ponto de entrada principal da aplicação React

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { PostHogProvider } from '@posthog/react';
import { ToastProvider } from './context/ToastContext';

const options = {
  api_host: 'https://us.i.posthog.com',
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <PostHogProvider apiKey="phc_CmMaU3MhPZ97UzN6WCKj9GgKd8x6B3rRRFbZQRB3ExWz" options={options}>
        <App />
      </PostHogProvider>
    </ToastProvider>
  </React.StrictMode>
);