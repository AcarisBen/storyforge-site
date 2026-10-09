// src/pages/Register.jsx
import React, { useState } from 'react';
import { 
  User, Sparkles, Mail, Lock, UserPlus, 
  ShieldCheck, ArrowLeft, Check, X, Eye, EyeOff, Info 
} from 'lucide-react';
import apiClient from '../api/apiClient';
import TermosDeUsoModal from '../components/TermosDeUsoModal';

export default function Register({ onNavigateToLogin, onNavigateToTerms }) {
  const [fullName, setFullName] = useState('');
  const [writerName, setWriterName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados dos Checkboxes Legais
  const [acceptedAge, setAcceptedAge] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Estado do Modal de Termos
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Estado do Tooltip do Pseudônimo
  const [showPseudonymTooltip, setShowPseudonymTooltip] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Validação de Senha
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password && password === confirmPassword;

  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasSpecialChar;

  const handleOpenTerms = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onNavigateToTerms) {
      onNavigateToTerms();
    } else {
      setShowTermsModal(true);
    }
  };

  const handleAcceptTerms = () => {
    setAcceptedTerms(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !writerName.trim() || !email.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!isPasswordValid) {
      setError('A senha não atende aos requisitos mínimos de segurança.');
      return;
    }

    if (!passwordsMatch) {
      setError('As senhas não coincidem.');
      return;
    }

    if (!acceptedAge) {
      setError('Você precisa confirmar ter no mínimo 18 anos de idade ou autorização dos responsáveis.');
      return;
    }

    if (!acceptedTerms) {
      setError('Você precisa aceitar os Termos de Uso e Serviço para prosseguir com o cadastro.');
      return;
    }

    try {
      setLoading(true);
      const cleanEmail = email.trim().toLowerCase();
      await apiClient.post('/auth/register', {
        fullName: fullName.trim(),
        writerName: writerName.trim(),
        email: cleanEmail,
        password,
        acceptedAge,
        acceptedTerms,
      });

      setRegisteredEmail(cleanEmail);
    } catch (err) {
      console.error('Erro ao cadastrar usuário:', err);
      setError(err.data?.message || err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (registeredEmail) {
    return (
      <div className="min-h-screen bg-[#0d0d12] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-[#12121a] border border-gray-800/90 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 bg-purple-950/60 border border-purple-800/50 text-purple-400 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-lg">
            📧
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Confirme seu e-mail</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Enviamos um link de confirmação para <b className="text-purple-300">{registeredEmail}</b>.
              Acesse sua caixa de entrada para ativá-lo.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            Ir para a Tela de Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-purple-500 selection:text-white">
      
      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center my-auto py-8">
        
        {/* COLUNA DA ESQUERDA */}
        <div className="space-y-8 pr-0 lg:pr-8">
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Voltar para o Login
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-950/50">
              <span className="text-xl">✦</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">StoryForge</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Crie sua conta e comece a <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                escrever o seu universo
              </span>
            </h1>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              Junte-se à comunidade de autores independentes e estruture seus livros de forma profissional.
            </p>
          </div>

          <div className="space-y-3 text-xs text-gray-400">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>Organização profissional de personagens, universos e enredo</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              <span>Geração de Story Bibles completas em PDF e JSON</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span>Ambiente 100% gratuito e seguro para autores</span>
            </div>
          </div>
        </div>

        {/* COLUNA DA DIREITA: FORMULÁRIO */}
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#171724] border border-gray-800 rounded-2xl flex items-center justify-center mx-auto text-purple-400 shadow-xl">
              <UserPlus size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Criar uma conta</h2>
            <p className="text-xs text-gray-400">Preencha seus dados para ter acesso gratuito</p>
          </div>

          <div className="bg-[#12121a] border border-gray-800/90 rounded-2xl p-6 shadow-2xl space-y-5 relative">
            
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-xs text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* NOME COMPLETO */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="Seu nome verdadeiro"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#171724] border border-gray-800/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* NOME DE ESCRITOR / PSEUDÔNIMO (CARD LATERAL) */}
              <div className="space-y-1.5 relative">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-gray-300">Nome de Escritor (Pseudônimo)</label>
                  <div 
                    className="relative inline-block cursor-pointer text-gray-400 hover:text-purple-300 transition-colors"
                    onMouseEnter={() => setShowPseudonymTooltip(true)}
                    onMouseLeave={() => setShowPseudonymTooltip(false)}
                  >
                    <Info size={14} />
                  </div>
                </div>

                <div 
                  className="relative"
                  onMouseEnter={() => setShowPseudonymTooltip(true)}
                  onMouseLeave={() => setShowPseudonymTooltip(false)}
                >
                  <Sparkles className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="Ex: J. R. R. Martin / Nome Artístico"
                    value={writerName}
                    onChange={(e) => setWriterName(e.target.value)}
                    className="w-full bg-[#171724] border border-gray-800/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                  />

                  {/* TOOLTIP POSICIONADO À DIREITA (NÃO ATRAPALHA OS CAMPOS) */}
                  {showPseudonymTooltip && (
                    <div className="hidden sm:block absolute left-full top-0 ml-3 w-60 z-40 p-3 bg-[#191928] border border-purple-500/60 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                      <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5 mb-1">
                        <Sparkles size={13} className="text-amber-400" /> Sobre o Pseudônimo:
                      </span>
                      <p className="text-[11px] text-gray-300 leading-snug">
                        Usado publicamente no estúdio e nas capas geradas das suas Story Bibles. Seu <b>Nome Completo</b> permanece privado.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* E-MAIL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                  <input
                    type="email"
                    required
                    placeholder="voce@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#171724] border border-gray-800/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* SENHA */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#171724] border border-gray-800/90 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="p-3 bg-[#171724] rounded-xl border border-gray-800/80 space-y-1.5 text-[11px] mt-2">
                    <span className="text-gray-400 font-bold block mb-1">A senha deve conter:</span>
                    <div className="grid grid-cols-2 gap-1">
                      <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {hasMinLength ? <Check size={12} /> : <X size={12} />} Mínimo 8 caracteres
                      </span>
                      <span className={`flex items-center gap-1 ${hasUpperCase ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {hasUpperCase ? <Check size={12} /> : <X size={12} />} Letra maiúscula
                      </span>
                      <span className={`flex items-center gap-1 ${hasLowerCase ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {hasLowerCase ? <Check size={12} /> : <X size={12} />} Letra minúscula
                      </span>
                      <span className={`flex items-center gap-1 ${hasSpecialChar ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {hasSpecialChar ? <Check size={12} /> : <X size={12} />} Caractere especial
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* CONFIRMAÇÃO DE SENHA */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#171724] border border-gray-800/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
                {confirmPassword && (
                  <p className={`text-[11px] font-semibold mt-1 ${passwordsMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                    {passwordsMatch ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'}
                  </p>
                )}
              </div>

              {/* CHECKBOXES LEGAIS */}
              <div className="space-y-3 pt-3 border-t border-gray-800/80">
                <label className="flex items-start gap-2.5 text-xs text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptedAge}
                    onChange={(e) => setAcceptedAge(e.target.checked)}
                    className="w-4 h-4 min-w-[16px] shrink-0 mt-0.5 rounded border-gray-700 bg-[#171724] text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                  />
                  <span className="leading-tight text-[11px] text-gray-400">
                    Declaro que possuo no mínimo <b>18 anos de idade</b> ou permissão dos meus pais/responsáveis.
                  </span>
                </label>

                <div className="flex items-start gap-2.5 text-xs text-gray-300 select-none">
                  <input
                    type="checkbox"
                    id="acceptTermsCheckbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 min-w-[16px] shrink-0 mt-0.5 rounded border-gray-700 bg-[#171724] text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                  />
                  <span className="leading-tight text-[11px] text-gray-400">
                    <label htmlFor="acceptTermsCheckbox" className="cursor-pointer">
                      Li e concordo com os{' '}
                    </label>
                    <button 
                      type="button" 
                      onClick={handleOpenTerms}
                      className="text-purple-400 underline hover:text-purple-300 font-semibold cursor-pointer inline"
                    >
                      Termos de Uso e Serviço
                    </button>.
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !acceptedAge || !acceptedTerms}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? 'Criando conta...' : 'Concluir Cadastro'}
              </button>

            </form>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              Já possui uma conta?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
              >
                Fazer Login
              </button>
            </p>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto w-full pt-6 border-t border-gray-900/60 flex items-center gap-2 text-gray-500 text-[11px]">
        <ShieldCheck size={14} className="text-purple-400" />
        <span>Seus dados protegidos com criptografia e autenticação segura</span>
      </div>

      {/* MODAL POPUP DE TERMOS */}
      <TermosDeUsoModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)}
        onAccept={handleAcceptTerms}
      />

    </div>
  );
}