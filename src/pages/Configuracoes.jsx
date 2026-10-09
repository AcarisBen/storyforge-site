// src/pages/Configuracoes.jsx
// Painel de Configurações do Usuário sem scrolls internos, campos padronizados e cores nacionais no Quem Somos Nós.

import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Trash2, AlertTriangle, 
  Key, Info, CheckCircle, Cookie, FileText, Lock, 
  Sparkles, Bug, MessageSquare, Eye, Sun, 
  Target, Compass, Heart, Type, Clock
} from 'lucide-react';
import apiClient from '../api/apiClient';
import { useToast } from '../hooks/useToast';
import TermosDeUsoModal from '../components/TermosDeUsoModal';
import PoliticaPrivacidadeModal from '../components/PoliticaPrivacidadeModal';

export default function Configuracoes({ currentUser, setCurrentUser }) {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('perfil');

  // Estados do Perfil do Autor
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [primaryGenre, setPrimaryGenre] = useState('Fantasia');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');

  // Estados de Acessibilidade & Preferências Visuais
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('storyforge_high_contrast') === 'true';
  });
  const [largeText, setLargeText] = useState(() => {
    return localStorage.getItem('storyforge_large_text') === 'true';
  });

  // Estados de Segurança
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Estados de Exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmailSent, setDeleteEmailSent] = useState(false);

  // Modais Legais
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Preferências de Cookies
  const getInitialCookiePreferences = () => {
    try {
      const savedPref = localStorage.getItem('storyforge_cookie_pref');
      if (savedPref) return JSON.parse(savedPref);
      
      const consent = localStorage.getItem('cookie_consent');
      if (consent === 'granted') {
        return { essential: true, preferences: true, analytics: true };
      }
    } catch (err) {
      console.error('Erro ao ler preferências de cookies:', err);
    }
    return { essential: true, preferences: true, analytics: true };
  };

  const [cookiePreferences, setCookiePreferences] = useState(getInitialCookiePreferences);

  useEffect(() => {
    const handleSyncCookies = () => {
      setCookiePreferences(getInitialCookiePreferences());
    };

    window.addEventListener('cookie_pref_updated', handleSyncCookies);
    window.addEventListener('storage', handleSyncCookies);

    return () => {
      window.removeEventListener('cookie_pref_updated', handleSyncCookies);
      window.removeEventListener('storage', handleSyncCookies);
    };
  }, []);

  // Carrega dados do usuário
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.writerName || currentUser.fullName || currentUser.name || '');
      setEmail(currentUser.email || '');
      setBio(currentUser.bio || '');
      setPrimaryGenre(currentUser.primaryGenre || 'Fantasia');
      setWebsite(currentUser.website || '');
    } else {
      apiClient.get('/auth/me')
        .then((res) => {
          if (res.data?.user) {
            const u = res.data.user;
            setDisplayName(u.writerName || u.fullName || u.name || '');
            setEmail(u.email || '');
            setBio(u.bio || '');
            setPrimaryGenre(u.primaryGenre || 'Fantasia');
            setWebsite(u.website || '');
          }
        })
        .catch((err) => console.error('Erro ao carregar usuário:', err));
    }
  }, [currentUser]);

  // Alternadores de Acessibilidade (Com Toast de aviso de implementação)
  const handleToggleHighContrast = () => {
    const nextVal = !highContrast;
    setHighContrast(nextVal);
    localStorage.setItem('storyforge_high_contrast', nextVal.toString());
    
    if (nextVal) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    showToast({
      type: 'info',
      title: 'Em Implementação',
      message: 'O suporte completo ao Alto Contraste está sendo aprimorado para as próximas versões!'
    });
  };

  const handleToggleLargeText = () => {
    const nextVal = !largeText;
    setLargeText(nextVal);
    localStorage.setItem('storyforge_large_text', nextVal.toString());

    if (nextVal) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }

    showToast({
      type: 'info',
      title: 'Em Implementação',
      message: 'O dimensionamento de fontes integradas está em desenvolvimento para as próximas versões.'
    });
  };

  // Salvar Perfil do Autor
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const cleanName = displayName.trim();

    if (!cleanName) {
      showToast({
        type: 'warning',
        title: 'Atenção',
        message: 'O pseudônimo não pode ficar em branco.'
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await apiClient.put('/auth/profile', { 
        name: cleanName, 
        writerName: cleanName,
        bio: bio.trim(),
        primaryGenre,
        website: website.trim()
      });
      const updatedUser = res.data?.user || {};

      if (setCurrentUser) {
        setCurrentUser((prev) => ({
          ...prev,
          ...updatedUser,
          name: cleanName,
          writerName: cleanName,
          fullName: cleanName,
          bio: bio.trim(),
          primaryGenre,
          website: website.trim()
        }));
      }

      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ 
          ...storedUser, 
          name: cleanName, 
          writerName: cleanName,
          bio: bio.trim(),
          primaryGenre,
          website: website.trim()
        }));
      } catch (storageErr) {
        console.error('Aviso no localStorage:', storageErr);
      }

      showToast({
        type: 'success',
        title: 'Perfil Atualizado',
        message: 'Seu perfil de autor foi salvo com sucesso!'
      });
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      showToast({
        type: 'error',
        title: 'Erro de Atualização',
        message: err.response?.data?.error || err.data?.error || 'Erro ao atualizar o perfil.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Alteração de Senha
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      showToast({
        type: 'warning',
        title: 'Atenção',
        message: 'Preencha a senha atual e a nova senha.'
      });
      return;
    }

    if (newPassword.length < 8) {
      showToast({
        type: 'warning',
        title: 'Senha Fraca',
        message: 'A nova senha deve ter no mínimo 8 caracteres.'
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiClient.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      showToast({
        type: 'success',
        title: 'Sucesso',
        message: response.data?.message || 'Senha alterada com sucesso!'
      });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      showToast({
        type: 'error',
        title: 'Erro de Segurança',
        message: err.response?.data?.message || err.response?.data?.error || 'Erro ao alterar a senha.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Exclusão de Conta
  const handleRequestAccountDelete = async () => {
    setIsSaving(true);
    try {
      await apiClient.post('/auth/request-delete');
      setDeleteEmailSent(true);
      showToast({
        type: 'info',
        title: 'E-mail Enviado',
        message: 'Instruções de exclusão enviadas para o seu e-mail.'
      });
    } catch (err) {
      console.error('Erro ao solicitar exclusão:', err);
      showToast({
        type: 'error',
        title: 'Erro de Exclusão',
        message: err.response?.data?.message || err.response?.data?.error || 'Erro ao solicitar e-mail de exclusão.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Alternância de Cookies
  const handleToggleCookie = (key) => {
    if (key === 'essential') return;

    const updated = { ...cookiePreferences, [key]: !cookiePreferences[key] };
    setCookiePreferences(updated);

    try {
      localStorage.setItem('storyforge_cookie_pref', JSON.stringify(updated));
      const consentStatus = (updated.preferences || updated.analytics) ? 'granted' : 'essential';
      localStorage.setItem('cookie_consent', consentStatus);
      window.dispatchEvent(new Event('cookie_pref_updated'));

      showToast({
        type: 'success',
        title: 'Preferências Atualizadas',
        message: 'Suas preferências foram salvas.'
      });
    } catch (err) {
      console.error('Erro ao salvar preferências de cookies:', err);
    }
  };

  // Limpeza de Cache Local
  const handleClearCache = () => {
    try {
      const token = localStorage.getItem('storyforge_token');
      const user = localStorage.getItem('user');

      localStorage.clear();

      if (token) localStorage.setItem('storyforge_token', token);
      if (user) localStorage.setItem('user', user);

      const defaultPref = { essential: true, preferences: true, analytics: true };
      localStorage.setItem('storyforge_cookie_pref', JSON.stringify(defaultPref));
      localStorage.setItem('cookie_consent', 'granted');
      
      setCookiePreferences(defaultPref);
      window.dispatchEvent(new Event('cookie_pref_updated'));

      showToast({
        type: 'info',
        title: 'Cache Limpo',
        message: 'Os dados temporários de cache local foram limpos.'
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Erro',
        message: 'Falha ao limpar o cache local.'
      });
    }
  };

  // Iniciais do Avatar
  const getAvatarInitials = () => {
    if (!displayName) return 'SF';
    const parts = displayName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-gray-200 font-sans pb-8">
      
      {/* CABEÇALHO DA PÁGINA */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Configurações</h1>
        <p className="text-xs text-gray-400 mt-1">
          Gerencie seu perfil, segurança de acesso, preferências e conta no StoryForge.
        </p>
      </div>

      {/* ABAS DE NAVEGAÇÃO */}
      <div className="flex border-b border-gray-800 gap-2 pb-2 overflow-x-auto">
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                active 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/40' 
                  : 'bg-[#12121a] text-gray-400 hover:text-white hover:bg-[#181824]'
              }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* CONTÊINER PRINCIPAL SEM SCROLL (EXPANDE NATURALMENTE) */}
      <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-6 shadow-2xl w-full">
        
        {/* ========================================================================= */}
        {/* ABA 1: PERFIL DO AUTOR */}
        {/* ========================================================================= */}
        {activeTab === 'perfil' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* AVATAR DO AUTOR */}
            <div className="flex items-center gap-4 p-4 bg-[#171724] border border-gray-800/80 rounded-xl">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white text-base font-black shadow-lg shadow-purple-950/50 shrink-0">
                {getAvatarInitials()}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  {displayName || 'Autor sem nome'} 
                  <span className="text-[10px] font-semibold bg-purple-950/80 text-purple-300 px-2 py-0.5 rounded-full border border-purple-800/50">
                    Perfil Ativo
                  </span>
                </h3>
                <p className="text-[11px] text-gray-400">
                  {email || 'Carregando e-mail...'}
                </p>
              </div>
            </div>

            {/* DADOS DE IDENTIFICAÇÃO DO AUTOR - PADRONIZADOS COM h-10 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 block">
                  Nome de Exibição / Pseudônimo <span className="text-purple-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full h-10 bg-[#171724] border border-gray-800 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-purple-500"
                  placeholder="Ex: Benetti dos Santos"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 block">
                  Gênero Literário Principal
                </label>
                <select
                  value={primaryGenre}
                  onChange={(e) => setPrimaryGenre(e.target.value)}
                  className="w-full h-10 bg-[#171724] border border-gray-800 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="Fantasia">Fantasia & Alta Fantasia</option>
                  <option value="Ficção Científica">Ficção Científica / Sci-Fi</option>
                  <option value="Romance">Romance & Drama</option>
                  <option value="Terror/Horror">Terror / Horror / Thriller</option>
                  <option value="Suspense/Policial">Suspense / Policial</option>
                  <option value="Ficção Histórica">Ficção Histórica</option>
                  <option value="Não-Ficção">Não-Ficção / Ensaio</option>
                </select>
              </div>

            </div>

            {/* MINI-BIO */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 block">
                Mini-Biografia do Autor
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Apresentação curta sobre você como autor (incluída opcionalmente no PDF da Story Bible)..."
                className="w-full bg-[#171724] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            {/* BOTÃO SALVAR */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-950/40 cursor-pointer transition-all flex items-center gap-2"
              >
                <Sparkles size={14} /> {isSaving ? 'Salvando...' : 'Salvar Perfil do Autor'}
              </button>
            </div>

          </form>
        )}

        {/* ========================================================================= */}
        {/* ABA 2: E-MAIL & SEGURANÇA + ACESSIBILIDADE */}
        {/* ========================================================================= */}
        {activeTab === 'seguranca' && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-white border-b border-gray-800 pb-3">E-mail & Segurança</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400">E-mail Cadastrado na Conta</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-[#171724] border border-gray-800 rounded-xl p-3 text-xs text-gray-400 opacity-75 cursor-not-allowed"
              />
            </div>

            {/* ALTERAÇÃO DE SENHA */}
            <form onSubmit={handleChangePassword} className="pt-3 border-t border-gray-800/80 space-y-3">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Alteração de Senha</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400">Senha Atual</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#171724] border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400">Nova Senha</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#171724] border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#171724] hover:bg-gray-800 border border-gray-700 text-xs font-bold text-white rounded-xl cursor-pointer disabled:bg-gray-800"
                >
                  {isSaving ? 'Atualizando...' : 'Atualizar Senha'}
                </button>
              </div>
            </form>

            {/* SEÇÃO DE ACESSIBILIDADE E VISÃO (AGORA NESTA ABA) */}
            <div className="pt-4 border-t border-gray-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Acessibilidade & Visão
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-purple-950/80 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-800/50 flex items-center gap-1">
                  <Clock size={11} /> Em Implementação
                </span>
              </div>
              
              <p className="text-[11px] text-gray-400">
                Ajustes de interface para redução do cansaço visual e suporte a leitores com necessidades de acessibilidade (disponíveis para testes).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                
                {/* ALTO CONTRASTE */}
                <div className="flex items-center justify-between p-3 bg-[#171724] rounded-xl border border-gray-800">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sun size={13} className="text-amber-400" /> Alto Contraste
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      Versões futuras v1.1
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleHighContrast}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      highContrast ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {highContrast ? 'Ativado' : 'Testar'}
                  </button>
                </div>

                {/* FONTE AMPLIADA */}
                <div className="flex items-center justify-between p-3 bg-[#171724] rounded-xl border border-gray-800">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Type size={13} className="text-indigo-400" /> Fonte Ampliada
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      Versões futuras v1.1
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleLargeText}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      largeText ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {largeText ? 'Ativado' : 'Testar'}
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: PRIVACIDADE & CONTA */}
        {/* ========================================================================= */}
        {activeTab === 'privacidade' && (
          <div className="space-y-5">
            
            {/* POLITICA DE COOKIES E ARMAZENAMENTO */}
            <div className="p-4 bg-[#171724] rounded-xl border border-gray-800 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-2">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Cookie size={15} className="text-amber-400" /> Política de Cookies e Armazenamento
                </h3>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="px-3 py-1 bg-[#12121a] hover:bg-gray-800 border border-gray-700 text-[11px] text-gray-300 font-bold rounded-lg transition-all cursor-pointer"
                >
                  Limpar Cache Local
                </button>
              </div>

              <p className="text-[11px] text-gray-300 leading-relaxed">
                Utilizamos armazenamento local exclusivamente para manter sua sessão conectada com segurança. Nenhum dado ou texto da sua escrita é comercializado com terceiros.
              </p>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between bg-[#12121a] p-2.5 rounded-lg border border-gray-800/60">
                  <div>
                    <span className="text-xs font-bold text-white block">Cookies Essenciais e Autenticação</span>
                    <span className="text-[10px] text-gray-400">Necessários para login e manutenção do token de segurança.</span>
                  </div>
                  <span className="text-[10px] font-bold bg-purple-950/80 text-purple-300 px-2 py-0.5 rounded border border-purple-800/50">Obrigatório</span>
                </div>

                <div className="flex items-center justify-between bg-[#12121a] p-2.5 rounded-lg border border-gray-800/60">
                  <div>
                    <span className="text-xs font-bold text-white block">Preferências de Interface</span>
                    <span className="text-[10px] text-gray-400">Armazena abas ativas, tema e estado de navegação local.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleCookie('preferences')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      cookiePreferences.preferences 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {cookiePreferences.preferences ? 'Ativado' : 'Desativado'}
                  </button>
                </div>

                <div className="flex items-center justify-between bg-[#12121a] p-2.5 rounded-lg border border-gray-800/60">
                  <div>
                    <span className="text-xs font-bold text-white block">Métricas de Desempenho Local</span>
                    <span className="text-[10px] text-gray-400">Registra logs de erros locais para diagnóstico técnico.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleCookie('analytics')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      cookiePreferences.analytics 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {cookiePreferences.analytics ? 'Ativado' : 'Desativado'}
                  </button>
                </div>
              </div>
            </div>

            {/* DOCUMENTOS LEGAIS & PRIVACIDADE */}
            <div className="p-4 bg-[#171724] rounded-xl border border-gray-800 space-y-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <FileText size={15} className="text-purple-400" /> Documentação Legal
              </h3>
              <p className="text-[11px] text-gray-400">
                Consulte as diretrizes contratuais, termos de serviço e política de privacidade do StoryForge.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="px-3.5 py-2 bg-[#12121a] hover:bg-[#1c1c28] text-purple-300 hover:text-white text-xs font-bold rounded-xl border border-purple-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileText size={13} /> Termos de Uso e Serviço
                </button>

                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="px-3.5 py-2 bg-[#12121a] hover:bg-[#1c1c28] text-purple-300 hover:text-white text-xs font-bold rounded-xl border border-purple-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Lock size={13} /> Política de Privacidade
                </button>
              </div>
            </div>

            {/* EXCLUSÃO PERMANENTE DA CONTA */}
            <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                  <Trash2 size={14} /> Exclusão Permanente de Conta
                </h3>
                <p className="text-[11px] text-gray-400">
                  Apaga todos os projetos e dados cadastrados sem recuperação.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl cursor-pointer shrink-0"
              >
                Excluir Minha Conta
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 4: VERSÃO & SISTEMA (COM CORAÇÃO VERDE E AMARELO BRASILEIRO 🇧🇷) */}
        {/* ========================================================================= */}
        {activeTab === 'sobre' && (
          <div className="space-y-6">
            
            {/* CABEÇALHO DA INSTITUIÇÃO */}
            <div className="text-center pb-3 border-b border-gray-800 space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-950/60 border border-purple-800/50 rounded-full text-purple-300 text-[11px] font-bold mb-1">
                ✦ Sobre o StoryForge
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Um estúdio de engenharia narrativa feito para autores
              </h2>
              <p className="text-xs text-gray-400 max-w-lg mx-auto">
                Conheça os pilares e o propósito por trás do ambiente onde você constrói seus universos.
              </p>
            </div>

            {/* BLOCOS INSTITUCIONAIS: VISÃO, MISSÃO E QUEM SOMOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* 1. VISÃO */}
              <div className="p-4 bg-[#171724] border border-gray-800/90 rounded-2xl space-y-2 text-center flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/50 text-purple-400 flex items-center justify-center mx-auto shadow-md">
                    <Compass size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-white">Visão</h3>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Transformar ideias complexas em histórias vivas, oferecendo a autores independentes as mesmas ferramentas de estruturação usadas por grandes estúdios literários.
                  </p>
                </div>
              </div>

              {/* 2. MISSÃO */}
              <div className="p-4 bg-[#171724] border border-gray-800/90 rounded-2xl space-y-2 text-center flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800/50 text-indigo-400 flex items-center justify-center mx-auto shadow-md">
                    <Target size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-white">Missão</h3>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Garantir um ambiente intuitivo, seguro e 100% focado no autor, preservando a soberania total sobre seus direitos autorais e manuscritos sem distrações.
                  </p>
                </div>
              </div>

              {/* 3. QUEM SOMOS NÓS? (ÍCONE DO CORAÇÃO VERDE E AMARELO 🇧🇷) */}
              <div className="p-4 bg-[#171724] border border-gray-800/90 rounded-2xl space-y-2 text-center flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/90 border border-emerald-600/60 text-amber-400 flex items-center justify-center mx-auto shadow-md shadow-emerald-950/50">
                    <Heart size={20} className="fill-emerald-900/40 text-amber-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Quem Somos Nós?</h3>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    O StoryForge nasceu da paixão pela literatura e do desejo de criar uma plataforma independente, moderna e acessível para a comunidade de autores no Brasil.
                  </p>
                </div>
              </div>

            </div>

            {/* STATUS DA VERSÃO E SUPORTE */}
            <div className="p-4 bg-[#171724] rounded-xl border border-gray-800 space-y-3">
              <div className="flex justify-between items-center border-b border-gray-800/80 pb-2 text-xs">
                <span className="text-gray-400 font-bold">Versão da Aplicação</span>
                <span className="font-mono font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/50">
                  v1.0.0 (Beta)
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-bold">Suporte Direto</span>
                <a href="mailto:app.storyforge@gmail.com" className="text-purple-300 hover:underline font-semibold">
                  app.storyforge@gmail.com
                </a>
              </div>
            </div>

            {/* CANAL DE DÚVIDAS E FEEDBACK (COM BADGE DE SUPORTE ATIVO) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="mailto:app.storyforge@gmail.com?subject=Reportar%20Bug%20-%20StoryForge"
                className="p-3 bg-[#171724] hover:bg-[#1f1f2e] border border-gray-800 rounded-xl flex items-center gap-2.5 text-xs text-gray-200 transition-all"
              >
                <Bug size={16} className="text-red-400 shrink-0" />
                <div>
                  <span className="font-bold block text-white">Reportar um Bug</span>
                  <span className="text-[10px] text-gray-400">Envie um diagnóstico à equipe</span>
                </div>
              </a>

              <a
                href="mailto:app.storyforge@gmail.com?subject=Sugest%C3%A3o%20-%20StoryForge"
                className="p-3 bg-[#171724] hover:bg-[#1f1f2e] border border-gray-800 rounded-xl flex items-center gap-2.5 text-xs text-gray-200 transition-all"
              >
                <MessageSquare size={16} className="text-purple-400 shrink-0" />
                <div>
                  <span className="font-bold block text-white">Sugerir Ideia</span>
                  <span className="text-[10px] text-gray-400">Ajude a evoluir a plataforma</span>
                </div>
              </a>
            </div>

          </div>
        )}

      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE CONTA */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            {!deleteEmailSent ? (
              <>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="text-red-500" size={18} /> Confirmar Exclusão
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Para sua segurança, enviaremos um e-mail de confirmação para <b>{email}</b>. A conta só será encerrada após o clique no link.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleRequestAccountDelete}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    {isSaving ? 'Enviando E-mail...' : 'Enviar E-mail de Confirmação'}
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

      {/* MODAIS POPUP DE TERMOS E PRIVACIDADE */}
      <TermosDeUsoModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)}
      />

      <PoliticaPrivacidadeModal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)}
      />

    </div>
  );
}