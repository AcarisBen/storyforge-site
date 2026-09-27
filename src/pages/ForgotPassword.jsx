// src/pages/ForgotPassword.jsx
// Página de recuperação de senha do StoryForge

import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword({ onNavigateToLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError('');
    setLoading(true);

    try {
      const res = await apiClient.post('/auth/forgot-password', { email: email.trim() });
      setSubmitted(true);
      setMessage(res.data?.message || 'E-mail enviado com sucesso!');
    } catch (err) {
      setError(err.data?.message || err.message || 'Erro ao enviar e-mail.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-[#12121a] border border-gray-800/90 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
        
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Voltar ao Login
        </button>

        {!submitted ? (
          <>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Recuperar Senha</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Digite o e-mail cadastrado na sua conta do StoryForge. Enviaremos um link de redefinição seguro.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Seu E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                  <input
                    type="email"
                    required
                    placeholder="voce@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#171724] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {loading ? 'Enviando e-mail...' : 'Enviar Link de Redefinição'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 size={48} className="text-purple-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Verifique seu E-mail</h3>
            <p className="text-xs text-gray-300 leading-relaxed">{message}</p>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Ir para a tela de Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}