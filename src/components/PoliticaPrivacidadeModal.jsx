// src/components/PoliticaPrivacidadeModal.jsx
// Modal formal de Política de Privacidade do StoryForge via React Portal.

import React from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, Check } from 'lucide-react';

export default function PoliticaPrivacidadeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#12121a] border border-gray-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* CABEÇALHO DO MODAL */}
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#171724]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/90 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Política de Privacidade</h3>
              <p className="text-xs text-gray-400">Versão 1.0.0 (Beta) • Atualizado em 09 de Outubro de 2026</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
            title="Fechar Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTAINER DA FOLHA DE PAPEL BRANCA */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-gray-200 flex-1 custom-scrollbar">
          
          <div className="bg-white text-gray-900 p-6 sm:p-10 rounded-xl shadow-lg border border-gray-300 max-w-3xl mx-auto space-y-6 text-sm leading-relaxed font-sans selection:bg-purple-200 selection:text-purple-900">
            
            {/* TÍTULO PRINCIPAL */}
            <div className="text-center pb-6 border-b-2 border-gray-900 space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                Política de Privacidade — StoryForge
              </h2>
              <p className="text-xs font-semibold text-gray-600 tracking-wider">
                ÚLTIMA ATUALIZAÇÃO: 09 DE OUTUBRO DE 2026 &nbsp;•&nbsp; VERSÃO: 1.0.0 (BETA)
              </p>
            </div>

            {/* INTRODUÇÃO */}
            <div className="space-y-3 text-gray-800">
              <p className="font-medium text-base leading-snug">
                Esta Política de Privacidade descreve como o StoryForge coleta, utiliza, armazena e protege os seus dados pessoais ao utilizar nossa plataforma.
              </p>
              <p className="text-sm text-gray-700">
                Nosso compromisso é com a transparência total, a segurança da sua conta e a proteção irrestrita da sua propriedade intelectual e acervo literário.
              </p>
            </div>

            {/* 1. COLETA DE DADOS */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                1. Dados Coletados e Finalidade
              </h3>
              <p>
                1.1. <b>Dados de Autenticação:</b> Coletamos seu nome completo, e-mail e senha criptografada para criação de conta, recuperação de acesso e autenticação segura.
              </p>
              <p>
                1.2. <b>Nome de Escritor (Pseudônimo):</b> Utilizado para personalização da interface e capas geradas nas exportações da Story Bible.
              </p>
              <p>
                1.3. <b>Registros de Acesso (Marco Civil da Internet):</b> Conforme exigência do Artigo 15 da Lei nº 12.965/2014, mantemos registros de endereço IP, data e hora de conexões pelo período legal mínimo de 6 meses.
              </p>
            </section>

            {/* 2. PROTEÇÃO DE MANUSCRITOS */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                2. Sigilo Total e Proteção do Seu Manuscrito
              </h3>
              <p>
                2.1. <b>Não Comercialização:</b> Suas histórias, personagens, mundos e textos pertencem 100% a você. O StoryForge JAMAIS vende, compartilha ou transfere seus textos para terceiros.
              </p>
              <p>
                2.2. <b>Inteligência Artificial:</b> Seus manuscritos NÃO são utilizados para treinamento de modelos públicos de Inteligência Artificial.
              </p>
            </section>

            {/* 3. COOKIES E ARMAZENAMENTO */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                3. Cookies e Armazenamento Local
              </h3>
              <p>
                3.1. Utilizamos o armazenamento local do seu navegador exclusivamente para manter sua sessão ativa de forma segura e armazenar preferências de navegação da interface.
              </p>
            </section>

            {/* 4. DIREITOS DO TITULAR (LGPD) */}
            <section className="space-y-2 pt-4 border-t border-gray-300 pb-4">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                4. Seus Direitos e Contato
              </h3>
              <p>
                4.1. Nos termos da Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), você possui o direito de consultar, alterar ou excluir permanentemente seus dados a qualquer momento pelo painel de Configurações.
              </p>
              <p>
                4.2. Dúvidas ou solicitações podem ser encaminhadas diretamente ao nosso canal oficial de suporte: <b>app.storyforge@gmail.com</b>.
              </p>
            </section>

          </div>

        </div>

        {/* RODAPÉ DE AÇÃO */}
        <div className="p-4 border-t border-gray-800 bg-[#171724] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Check size={16} /> Entendido
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}