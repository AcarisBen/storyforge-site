// src/pages/ResetPassword.jsx
// Página de Redefinição de Senha do StoryForge

import React, { useState } from 'react';
import apiClient from '../api/apiClient';

export default function ResetPassword({ token, onNavigateToLogin }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      alert('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem.');
      return;
    }

    setStatus('loading');
    try {
      const res = await apiClient.post('/auth/reset-password', { token, newPassword });
      setStatus('success');
      setMessage(res.data?.message || 'Senha alterada com sucesso!');
    } catch (err) {
      setStatus('error');
      setMessage(err.data?.message || err.message || 'Erro ao redefinir a senha.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
        
        {status !== 'success' ? (
          <>
            <div>
              <h2 className="text-2xl font-bold text-white">Criar Nova Senha</h2>
              <p className="text-xs text-gray-400 mt-1">Digite sua nova senha de acesso abaixo.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">Nova Senha</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#171724] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">Confirmar Nova Senha</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#171724] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  placeholder="Repita a senha"
                />
              </div>

              {status === 'error' && (
                <p className="text-xs text-red-400 font-medium">{message}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {status === 'loading' ? 'Redefinindo...' : 'Salvar Nova Senha'}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4">
            <div className="w-14 h-14 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-lg">
              ✓
            </div>
            <h2 className="text-xl font-bold text-white">Senha Atualizada!</h2>
            <p className="text-xs text-gray-300">{message}</p>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Ir para o Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}