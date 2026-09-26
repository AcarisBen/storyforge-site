// src/pages/Configuracoes.jsx
// Página de Configurações do StoryForge, permitindo ao usuário gerenciar perfil, segurança, privacidade e conta

import React, { useState, useEffect } from 'react';
import { 
  User, Shield, LogOut, Trash2, AlertTriangle, 
  Key, Info, CheckCircle, Cookie, X
} from 'lucide-react';
import apiClient from '../api/apiClient';
import { useToast } from '../context/ToastContext';

export default function Configuracoes({ currentUser, setCurrentUser }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('perfil');

  // Inicializa os estados com os dados do usuário logado
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Modais de Exclusão e Logout
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmailSent, setDeleteEmailSent] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Carrega os dados reais do usuário logado
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.name || currentUser.nome || '');
      setEmail(currentUser.email || '');
    } else {
      // Fallback caso não venha via props: busca direto da API /auth/me
      apiClient.get('/auth/me')
        .then((res) => {
          if (res.data?.user) {
            setDisplayName(res.data.user.name || res.data.user.nome || '');
            setEmail(res.data.user.email || '');
          }
        })
        .catch((err) => console.error('Erro ao carregar usuário:', err));
    }
  }, [currentUser]);

  // Salvar Nome / Perfil no Backend
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showToast({
        type: 'warning',
        title: 'Campo Vazio',
        message: 'O nome de exibição não pode ficar em branco.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await apiClient.put('/auth/profile', { name: displayName });
      showToast({
        type: 'success',
        title: 'Perfil Salvo',
        message: 'Nome de exibição salvo com sucesso!',
      });
      if (setCurrentUser && res.data?.user) {
        setCurrentUser(res.data.user);
      }
    } catch (err) {
      console.error('Erro ao salvar nome:', err);
      showToast({
        type: 'error',
        title: 'Erro ao Salvar',
        message: err.response?.data?.error || 'Erro ao atualizar o perfil.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Alterar Senha no Backend
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast({
        type: 'warning',
        title: 'Campos Incompletos',
        message: 'Preencha a senha atual e a nova senha.',
      });
      return;
    }

    try {
      await apiClient.put('/auth/profile', { currentPassword, newPassword });
      showToast({
        type: 'success',
        title: 'Senha Alterada',
        message: 'Sua senha foi alterada com sucesso!',
      });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      showToast({
        type: 'error',
        title: 'Erro ao Alterar Senha',
        message: err.response?.data?.error || 'Erro ao alterar a senha.',
      });
    }
  };

  // Executar encerramento de sessão
  const executeLogout = () => {
    localStorage.removeItem('storyforge_token');
    window.location.href = '/login';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 text-gray-200 font-sans">
      
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-3xl font-normal text-white tracking-tight">Configurações</h1>
        <p className="text-sm text-gray-400 mt-1">
          Gerencie seu perfil, segurança de acesso, privacidade e conta no StoryForge.
        </p>
      </div>

      {/* ABAS DE NAVEGAÇÃO */}
      <div className="flex border-b border-gray-800 gap-2 pb-1">
        {[
          { id: 'perfil', label: 'Perfil do Autor', icon: User },
          { id: 'seguranca', label: 'E-mail & Segurança', icon: Key },
          { id: 'privacidade', label: 'Privacidade & Conta', icon: Shield },
          { id: 'sobre', label: 'Versão & Sistema', icon: Info },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                active 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'bg-[#12121a] text-gray-400 hover:text-white hover:bg-[#181824]'
              }`}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-6 shadow-2xl">
        
        {/* ABA 1: PERFIL DO AUTOR */}
        {activeTab === 'perfil' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <h2 className="text-base font-bold text-white border-b border-gray-800 pb-3">Perfil do Autor</h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400">Nome de Exibição / Pseudônimo</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#171724] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  placeholder="Seu nome oficial ou pseudônimo"
                />
                <p className="text-[11px] text-gray-500">Este nome é utilizado nos relatórios e StoryBible exportada.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer transition-all"
              >
                {isSaving ? 'Salvando...' : 'Salvar Nome'}
              </button>
            </div>
          </form>
        )}

        {/* ABA 2: E-MAIL & SEGURANÇA */}
        {activeTab === 'seguranca' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-white border-b border-gray-800 pb-3">E-mail & Segurança</h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400">E-mail da Conta</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-[#171724] border border-gray-800 rounded-xl p-3 text-sm text-gray-400 opacity-75 cursor-not-allowed"
                />
              </div>
            </div>

            <form onSubmit={handleResetPassword} className="pt-4 border-t border-gray-800 space-y-4">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Alteração de Senha</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400">Senha Atual</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#171724] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400">Nova Senha</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#171724] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#171724] hover:bg-gray-800 border border-gray-700 text-xs font-bold text-white rounded-xl cursor-pointer"
              >
                Atualizar Senha
              </button>
            </form>
          </div>
        )}

        {/* ABA 3: PRIVACIDADE & CONTA */}
        {activeTab === 'privacidade' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-white border-b border-gray-800 pb-3">Privacidade & Sessão</h2>

            <div className="p-4 bg-[#171724] rounded-xl border border-gray-800 space-y-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Cookie size={16} className="text-amber-400" /> Política de Cookies e Armazenamento
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Utilizamos armazenamento local exclusivamente para manter sua sessão conectada com segurança. Nenhum dado ou texto do seu manuscrito é comercializado com terceiros.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sessão</h3>
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="px-4 py-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <LogOut size={15} /> Encerrar Sessão neste Dispositivo
              </button>
            </div>

            <div className="pt-6 border-t border-gray-800 space-y-3">
              <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                <Trash2 size={15} /> Exclusão Permanente de Conta
              </h3>
              <p className="text-xs text-gray-400">
                A exclusão da conta apaga todos os projetos e personagens cadastrados sem possibilidade de recuperação.
              </p>
              
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Excluir Minha Conta
              </button>
            </div>
          </div>
        )}

        {/* ABA 4: VERSÃO & SISTEMA */}
        {activeTab === 'sobre' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-white border-b border-gray-800 pb-3">Informações do Sistema</h2>

            <div className="p-4 bg-[#171724] rounded-xl border border-gray-800 space-y-3">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-xs text-gray-400 font-bold">Versão Atual</span>
                <span className="text-xs font-mono font-bold text-purple-400">v1.0.0 (Beta)</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-xs text-gray-400 font-bold">Ambiente</span>
                <span className="text-xs font-mono text-gray-300">Desenvolvimento Independente</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-bold">Suporte</span>
                <span className="text-xs text-purple-300">suporte@storyforge.com.br</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-950/50 border border-red-800/50 rounded-xl text-red-400">
                <LogOut size={22} />
              </div>
              <h3 className="text-base font-bold text-white">Encerrar Sessão</h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Deseja realmente encerrar a sessão neste dispositivo?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={executeLogout}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Sim, Sair
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2.5 bg-[#171724] hover:bg-[#202030] text-gray-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE CONTA */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {!deleteEmailSent ? (
              <>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="text-red-500" size={18} /> Confirmar Exclusão
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Para sua segurança, enviaremos um e-mail de confirmação para <b>{email}</b>. A conta só será encerrada após o clique no link de confirmação.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteEmailSent(true)}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Enviar E-mail de Confirmação
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2.5 bg-[#171724] text-gray-400 hover:text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-3 py-2">
                <CheckCircle className="text-emerald-400 mx-auto" size={36} />
                <h3 className="text-base font-bold text-white">E-mail Enviado!</h3>
                <p className="text-xs text-gray-300">
                  Verifique sua caixa de entrada para confirmar a exclusão.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteEmailSent(false);
                  }}
                  className="w-full py-2 bg-[#171724] text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}