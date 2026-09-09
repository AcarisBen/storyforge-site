import React, { useEffect, useState, useRef } from 'react';
import apiClient from '../api/apiClient';

export default function ConfirmEmail({ token, onNavigateToLogin }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  
  // TRAVA DE SEGURANÇA CONTRA DUPLA EXECUÇÃO
  const hasRequested = useRef(false);

  useEffect(() => {
    // Se a requisição já foi enviada uma vez, ignora as chamadas seguintes
    if (!token || hasRequested.current) return;
    hasRequested.current = true;

    const verifyToken = async () => {
      try {
        const res = await apiClient.post('/auth/confirm-email', { token });
        setStatus('success');
        setMessage(res.data?.message || 'E-mail verificado com sucesso!');
      } catch (err) {
        setStatus('error');
        setMessage(err.data?.message || err.message || 'Link de verificação inválido ou expirado.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
        
        {status === 'loading' && (
          <div className="space-y-3">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400">Ativando sua conta...</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-lg">
              ✓
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Conta Ativada!</h2>
              <p className="text-xs text-gray-300 leading-relaxed">{message}</p>
            </div>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Ir para o Login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 bg-red-950/60 border border-red-800/50 text-red-400 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-lg">
              ✕
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Falha na Ativação</h2>
              <p className="text-xs text-red-400 leading-relaxed">{message}</p>
            </div>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Voltar ao Login
            </button>
          </>
        )}

      </div>
    </div>
  );
}