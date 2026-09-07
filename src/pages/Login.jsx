import React, { useState } from 'react';
import { 
  Feather, BookOpen, Layers, Mail, Lock, 
  LogIn, ShieldCheck 
} from 'lucide-react';

export default function Login({ onLoginSuccess, onNavigateToRegister, onNavigateToForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Preencha todos os campos para entrar.');
      return;
    }

    setLoading(true);
    setError('');

    // Simulação de Login de Sucesso para carregar a interface
    setTimeout(() => {
      setLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess({ email, name: 'Autor StoryForge' });
      }
    }, 600);
  };

  const handleGoogleLogin = () => {
    alert('Autenticação do Google em desenvolvimento.');
  };

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-purple-500 selection:text-white">
      
      {/* CONTEÚDO PRINCIPAL (GRID 2 COLUNAS) */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center my-auto py-8">
        
        {/* COLUNA DA ESQUERDA: APRESENTAÇÃO */}
        <div className="space-y-10 pr-0 lg:pr-8">
          
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-950/50">
              <span className="text-xl">✦</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">StoryForge</span>
          </div>

          {/* TÍTULO & SUBTÍTULO */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Forje histórias que <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                merecem ser contadas
              </span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-md leading-relaxed">
              A plataforma completa de desenvolvimento narrativo para autores, roteiristas e criadores de mundos.
            </p>
          </div>

          {/* CARDS INFORMATIVOS */}
          <div className="space-y-3.5 max-w-md">
            <div className="p-4 bg-[#13131c]/80 border border-gray-800/80 rounded-2xl flex items-center gap-4 hover:border-purple-800/40 transition-all">
              <div className="p-2.5 bg-purple-950/60 border border-purple-800/50 rounded-xl text-purple-400">
                <Feather size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Escrita Estruturada</h3>
                <p className="text-xs text-gray-400">Capítulos, cenas e manuscritos organizados</p>
              </div>
            </div>

            <div className="p-4 bg-[#13131c]/80 border border-gray-800/80 rounded-2xl flex items-center gap-4 hover:border-purple-800/40 transition-all">
              <div className="p-2.5 bg-purple-950/60 border border-purple-800/50 rounded-xl text-purple-400">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Story Bible Completa</h3>
                <p className="text-xs text-gray-400">Toda a pré-produção em um só lugar</p>
              </div>
            </div>

            <div className="p-4 bg-[#13131c]/80 border border-gray-800/80 rounded-2xl flex items-center gap-4 hover:border-purple-800/40 transition-all">
              <div className="p-2.5 bg-purple-950/60 border border-purple-800/50 rounded-xl text-purple-400">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Mundos e Personagens</h3>
                <p className="text-xs text-gray-400">Construção narrativa profunda e coerente</p>
              </div>
            </div>
          </div>

        </div>

        {/* COLUNA DA DIREITA: CARD DE LOGIN */}
        <div className="w-full max-w-md mx-auto space-y-6">
          
          {/* ÍCONE DE TOPO */}
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-[#171724] border border-gray-800 rounded-2xl flex items-center justify-center mx-auto text-purple-400 shadow-xl">
              <LogIn size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Bem-vindo de volta</h2>
              <p className="text-xs text-gray-400 mt-1">Acesse sua conta para continuar criando</p>
            </div>
          </div>

          {/* CARD DE FORMULÁRIO */}
          <div className="bg-[#12121a] border border-gray-800/90 rounded-2xl p-6 shadow-2xl space-y-5">
            
            {/* BOTÃO GOOGLE */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-[#181824] hover:bg-[#202030] border border-gray-800 text-xs font-semibold text-gray-200 rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continuar com Google
            </button>

            {/* DIVISOR OU */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-800/80 w-full" />
              <span className="bg-[#12121a] px-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold absolute">
                OU
              </span>
            </div>

            {/* EXIBIÇÃO DE ERROS */}
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-xs text-red-300">
                {error}
              </div>
            )}

            {/* FORMULÁRIO */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
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
                    className="w-full bg-[#171724] border border-gray-800/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* SENHA */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-300">Senha</label>
                  <button
                    type="button"
                    onClick={() => onNavigateToForgotPassword && onNavigateToForgotPassword()}
                    className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#171724] border border-gray-800/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* BOTÃO ENTRAR */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

          </div>

          {/* RODAPÉ DO CARD: CRIAR CONTA */}
          <div className="text-center">
            <p className="text-xs text-gray-400">
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={() => onNavigateToRegister && onNavigateToRegister()}
                className="font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
              >
                Criar uma
              </button>
            </p>
          </div>

        </div>

      </div>

      {/* RODAPÉ DA PÁGINA */}
      <div className="max-w-7xl mx-auto w-full pt-6 border-t border-gray-900/60 flex items-center gap-2 text-gray-500 text-[11px]">
        <ShieldCheck size={14} className="text-purple-400" />
        <span>Seus dados protegidos com autenticação segura Base44</span>
      </div>

    </div>
  );
}