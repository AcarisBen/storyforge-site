import React, { useState } from 'react';
import { 
  User, Sparkles, Mail, Lock, UserPlus, 
  ShieldCheck, ArrowLeft, Check, X 
} from 'lucide-react';

export default function Register({ onRegisterSuccess, onNavigateToLogin }) {
  const [fullName, setFullName] = useState('');
  const [writerName, setWriterName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Regras de validação da senha
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password && password === confirmPassword;

  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasSpecialChar;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !writerName.trim() || !email.trim()) {
      setError('Por favor, preencha todos os campos.');
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

    // Exemplo de verificação de e-mail existente (substituir por chamada à API)
    const registeredEmails = ['autor@storyforge.com', 'teste@exemplo.com'];
    if (registeredEmails.includes(email.toLowerCase().trim())) {
      setError('Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.');
      return;
    }

    setLoading(true);

    // Simulação de criação de conta
    setTimeout(() => {
      setLoading(false);
      const newUser = {
        fullName,
        writerName,
        email,
      };

      if (onRegisterSuccess) {
        onRegisterSuccess(newUser);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-purple-500 selection:text-white">
      
      {/* CONTEÚDO PRINCIPAL (GRID 2 COLUNAS) */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center my-auto py-8">
        
        {/* COLUNA DA ESQUERDA: APRESENTAÇÃO */}
        <div className="space-y-8 pr-0 lg:pr-8">
          
          {/* BOTÃO VOLTAR */}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Voltar para o Login
          </button>

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-950/50">
              <span className="text-xl">✦</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">StoryForge</span>
          </div>

          {/* TÍTULO */}
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

          {/* CARD EXPLICATIVO */}
          <div className="p-4 bg-[#13131c]/80 border border-gray-800/80 rounded-2xl space-y-2 max-w-md">
            <span className="text-xs font-bold text-purple-300 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" /> Pseudônimo / Nome de Escritor
            </span>
            <p className="text-xs text-gray-400 leading-relaxed">
              O seu <b>Nome de Escritor</b> será usado publicamente no estúdio e nas capas geradas das suas Story Bibles, enquanto o seu <b>Nome Completo</b> fica reservado apenas para a sua conta.
            </p>
          </div>

        </div>

        {/* COLUNA DA DIREITA: FORMULÁRIO DE CADASTRO */}
        <div className="w-full max-w-md mx-auto space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#171724] border border-gray-800 rounded-2xl flex items-center justify-center mx-auto text-purple-400 shadow-xl">
              <UserPlus size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Criar uma conta</h2>
            <p className="text-xs text-gray-400">Preencha seus dados para ter acesso gratuito</p>
          </div>

          <div className="bg-[#12121a] border border-gray-800/90 rounded-2xl p-6 shadow-2xl space-y-5">
            
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

              {/* NOME DE ESCRITOR / PSEUDÔNIMO */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Nome de Escritor (Pseudônimo)</label>
                <div className="relative">
                  <Sparkles className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="Ex: J. R. R. Martin / Nome Artístico"
                    value={writerName}
                    onChange={(e) => setWriterName(e.target.value)}
                    className="w-full bg-[#171724] border border-gray-800/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                  />
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
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#171724] border border-gray-800/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* INDICADORES DE VALIDAÇÃO DA SENHA */}
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
                    type="password"
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

              {/* BOTÃO CADASTRAR */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 transition-all cursor-pointer disabled:opacity-50 mt-4"
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

      {/* RODAPÉ */}
      <div className="max-w-7xl mx-auto w-full pt-6 border-t border-gray-900/60 flex items-center gap-2 text-gray-500 text-[11px]">
        <ShieldCheck size={14} className="text-purple-400" />
        <span>Seus dados protegidos com criptografia e autenticação segura</span>
      </div>

    </div>
  );
}