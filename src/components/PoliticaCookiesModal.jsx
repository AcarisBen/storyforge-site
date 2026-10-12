// src/components/PoliticaCookiesModal.jsx
// Documentação Formal de Política de Cookies e Armazenamento Local — StoryForge

import React from 'react';
import { X, ShieldCheck, Cookie } from 'lucide-react';

export default function PoliticaCookiesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-[#11111a] border border-gray-800 rounded-2xl p-6 md:p-8 w-full max-w-4xl shadow-2xl space-y-6 relative max-h-[88vh] flex flex-col text-gray-200">
        
        {/* CABEÇALHO DO MODAL */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-950/80 border border-purple-800/50 rounded-xl flex items-center justify-center text-amber-400 shadow-md">
              <Cookie size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Política de Cookies e Armazenamento Local</h3>
              <p className="text-xs text-gray-400">StoryForge — Versão 1.0.0 (Beta) • Atualizado em 09/10/2026</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-[#1c1c28]"
            title="Fechar documentação"
          >
            <X size={20} />
          </button>
        </div>

        {/* CORPO DO TEXTO COM ROLAGEM INTERNA */}
        <div className="overflow-y-auto pr-2 space-y-4 flex-1 [scrollbar-width:thin]">
          
          {/* FOLHA IMPRESSA FORMAL (FUNDO BRANCO, TEXTO PRETO E TIPOGRAFIA AMPLIADA) */}
          <div className="bg-white text-black rounded-xl p-6 md:p-10 shadow-2xl border border-gray-300 font-sans leading-relaxed text-sm md:text-base">
            
            {/* CABEÇALHO FORMAL DO DOCUMENTO */}
            <header className="border-b-2 border-black pb-6 mb-8 text-center space-y-3">
              <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight uppercase">
                POLÍTICA DE COOKIES E ARMAZENAMENTO LOCAL — STORYFORGE
              </h2>
              <div className="flex flex-wrap justify-center gap-4 text-xs md:text-sm font-semibold text-gray-800 uppercase tracking-wider">
                <span>Última atualização: <b>09 de outubro de 2026</b></span>
                <span>•</span>
                <span>Versão: <b>1.0.0 (Beta)</b></span>
              </div>
            </header>

            {/* PREÂMBULO / INTRODUÇÃO */}
            <div className="space-y-4 text-gray-900 mb-8 leading-relaxed">
              <p>
                Esta <b>Política de Cookies e Armazenamento Local</b> descreve como o <b>StoryForge</b> utiliza tecnologias de armazenamento temporário e permanente no seu navegador para garantir a segurança da sessão, personalizar sua experiência de escrita e coletar métricas anônimas de desempenho técnico.
              </p>
              <p className="bg-gray-100 p-4 rounded-lg border-l-4 border-black italic text-gray-800">
                Este documento é parte integrante da nossa <b>Política de Privacidade</b> e dos <b>Termos de Uso e Serviço</b>, sendo elaborado em estrita observância à Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018) e ao Marco Civil da Internet (Lei nº 12.965/2014).
              </p>
            </div>

            {/* SEÇÕES JURÍDICAS COMPLETAS */}
            <div className="space-y-8 text-gray-900">
              
              {/* SEÇÃO 1 */}
              <section className="space-y-3">
                <h3 className="text-base md:text-lg font-extrabold text-black uppercase tracking-wide border-b border-gray-300 pb-1">
                  1. O que são <i>Cookies</i> e Tecnologias de Armazenamento Local?
                </h3>
                <p>
                  <b>1.1. <i>Cookies</i>:</b> São pequenos arquivos de texto salvos pelo navegador no seu dispositivo quando você visita uma plataforma web. Eles permitem reconhecer sua sessão e armazenar pequenas informações operacionais.
                </p>
                <p>
                  <b>1.2. Armazenamento Local (<i>Local Storage</i> e <i>Session Storage</i>):</b> Recursos do HTML5 que permitem que o <b>StoryForge</b> guarde dados diretamente no seu navegador com maior capacidade técnica. O <i>Local Storage</i> mantém as preferências salvas entre sessões, enquanto o <i>Session Storage</i> expira automaticamente ao fechar a aba do navegador.
                </p>
              </section>

              {/* SEÇÃO 2 */}
              <section className="space-y-3">
                <h3 className="text-base md:text-lg font-extrabold text-black uppercase tracking-wide border-b border-gray-300 pb-1">
                  2. Categorização e Discriminação do Armazenamento no StoryForge
                </h3>
                <p>
                  O <b>StoryForge</b> categoriza o armazenamento local e os cookies em três modalidades bem definidas:
                </p>

                <div className="space-y-4 pl-2 pt-1">
                  
                  {/* CATEGORIA A */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1.5">
                    <h4 className="font-extrabold text-black text-sm md:text-base flex items-center justify-between">
                      <span>A. Armazenamento Estritamente Necessário (Essencial)</span>
                      <span className="text-xs bg-black text-white px-2.5 py-0.5 rounded-full font-sans font-bold">Obrigatório</span>
                    </h4>
                    <p className="text-gray-800">
                      <b>Finalidade:</b> Manutenção da autenticação segura, gestão de tokens de acesso JWT e prevenção contra ataques cibernéticos.
                    </p>
                    <p className="text-gray-800">
                      <b>Base Legal (LGPD):</b> <i>Execução de Contrato (Art. 7º, V da LGPD)</i>. Não exige consentimento prévio (<i>opt-in</i>), pois sem esses registros a aplicação não pode funcionar nem autenticar o usuário.
                    </p>
                    <p className="text-xs text-gray-600 font-mono pt-1">
                      Chaves utilizadas: <code>storyforge_token</code>, <code>user</code>, <i>cookies</i> seguros de sessão.
                    </p>
                  </div>

                  {/* CATEGORIA B */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1.5">
                    <h4 className="font-extrabold text-black text-sm md:text-base flex items-center justify-between">
                      <span>B. Preferências de Interface e Acessibilidade</span>
                      <span className="text-xs bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 rounded-full font-sans font-bold">Opcional</span>
                    </h4>
                    <p className="text-gray-800">
                      <b>Finalidade:</b> Memorizar suas escolhas estéticas e visuais, como abas ativas nos painéis, estado do menu lateral, modo de Alto Contraste e escala do tamanho de fonte da interface.
                    </p>
                    <p className="text-gray-800">
                      <b>Base Legal (LGPD):</b> <i>Consentimento do Titular (Art. 7º, I da LGPD)</i>. Podem ser desativados no painel de Configurações a qualquer momento.
                    </p>
                    <p className="text-xs text-gray-600 font-mono pt-1">
                      Chaves utilizadas: <code>storyforge_cookie_pref</code>, <code>storyforge_high_contrast</code>, <code>storyforge_font_scale</code>.
                    </p>
                  </div>

                  {/* CATEGORIA C */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1.5">
                    <h4 className="font-extrabold text-black text-sm md:text-base flex items-center justify-between">
                      <span>C. Métricas de Desempenho e <i>Analytics</i> Técnico</span>
                      <span className="text-xs bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 rounded-full font-sans font-bold">Opcional</span>
                    </h4>
                    <p className="text-gray-800">
                      <b>Finalidade:</b> Registrar logs de erros locais, tempo de resposta do servidor e métricas técnicas de utilização (via <i>PostHog</i> / <i>Microsoft Clarity</i>) para identificação de falhas de código.
                    </p>
                    <p className="text-gray-800">
                      <b>Base Legal (LGPD):</b> <i>Consentimento do Titular (Art. 7º, I da LGPD)</i>. Exige autorização prévia pelo banner de consentimento ou painel de preferências.
                    </p>
                    <p className="text-xs text-gray-600 font-mono pt-1">
                      Provedores: <i>PostHog</i> e <i>Microsoft Clarity</i> (executados sob estrito isolamento).
                    </p>
                  </div>

                </div>
              </section>

              {/* SEÇÃO 3 */}
              <section className="space-y-3">
                <h3 className="text-base md:text-lg font-extrabold text-black uppercase tracking-wide border-b border-gray-300 pb-1">
                  3. Garantia de Sigilo do Manuscrito e Mascaramento de Texto
                </h3>
                <p>
                  <b>3.1. Proteção Absoluta da Propriedade Intelectual:</b> Nenhuma ferramenta de análise, <i>script</i> técnico ou tecnologia de cookies utilizada no <b>StoryForge</b> possui autorização ou capacidade técnica de ler, capturar, registrar ou transmitir o texto literário dos seus livros, manuscritos, capítulos ou fichas de <i>worldbuilding</i>.
                </p>
                <p>
                  <b>3.2. Mascaramento Automático:</b> Os editores de texto e campos de criação da plataforma contam com travas estritas de mascaramento automático de dados (atributos de proteção contra gravação), garantindo que <i>Replays</i> de Sessão de ferramentas analíticas registrem apenas a estrutura técnica da tela, sem jamais coletar o conteúdo escrito pelo autor.
                </p>
              </section>

              {/* SEÇÃO 4 */}
              <section className="space-y-3">
                <h3 className="text-base md:text-lg font-extrabold text-black uppercase tracking-wide border-b border-gray-300 pb-1">
                  4. Como Gerenciar ou Alterar Suas Preferências
                </h3>
                <p>
                  O usuário possui controle total sobre o armazenamento de dados não essenciais no <b>StoryForge</b>:
                </p>
                <ul className="list-disc pl-8 space-y-2 text-gray-800">
                  <li><b>Painel de Configurações da Conta:</b> Na aba <i>Privacidade & Conta</i> do aplicativo, você pode ativar ou desativar individualmente as chaves de <i>Preferências de Interface</i> e <i>Métricas de Desempenho Local</i> a qualquer tempo.</li>
                  <li><b>Banner de Consentimento:</b> Exibido no primeiro acesso ou a cada nova sessão, permitindo selecionar <i>"Aceitar Todos"</i> ou <i>"Apenas Essenciais"</i> de forma instantânea.</li>
                  <li><b>Botão "Limpar Cache Local":</b> Disponível nas Configurações do usuário, permite redefinir todas as preferências salvas no navegador mantendo sua sessão segura.</li>
                  <li><b>Configurações do Navegador:</b> Você também pode bloquear ou excluir <i>cookies</i> diretamente nas configurações de privacidade do seu navegador (<i>Chrome</i>, <i>Firefox</i>, <i>Edge</i>, <i>Safari</i>), ciente de que o bloqueio de dados essenciais impedirá o login na plataforma.</li>
                </ul>
              </section>

              {/* SEÇÃO 5 */}
              <section className="space-y-3">
                <h3 className="text-base md:text-lg font-extrabold text-black uppercase tracking-wide border-b border-gray-300 pb-1">
                  5. Ausência de Cookies de Publicidade e Marketing de Terceiros
                </h3>
                <p>
                  <b>5.1. Não Comercialização:</b> O <b>StoryForge NÃO</b> utiliza <i>cookies</i> de <i>remarketing</i>, pixels de rastreamento de anúncios (como <i>Meta Pixel</i> ou <i>Google Ads</i>) e jamais comercializa dados de perfil de navegação com corretores de dados (<i>data brokers</i>) ou anunciantes.
                </p>
                <p>
                  <b>5.2. Notificação em Caso de Alteração:</b> Caso o <b>StoryForge</b> venha a integrar novas ferramentas técnicas ou serviços opcionais no futuro, esta política será atualizada e um novo aviso de consentimento será exibido ao usuário para concessão ou negação de autorização.
                </p>
              </section>

              {/* SEÇÃO 6 */}
              <section className="space-y-3">
                <h3 className="text-base md:text-lg font-extrabold text-black uppercase tracking-wide border-b border-gray-300 pb-1">
                  6. Contato e Dúvidas sobre Privacidade
                </h3>
                <p>
                  Para esclarecer dúvidas sobre esta Política de <i>Cookies</i>, exercer seus direitos previstos na <b>LGPD</b> ou enviar solicitações relativas ao tratamento de dados, entre em contato com nosso suporte técnico:
                </p>
                <p className="font-bold text-black pt-1">
                  E-mail oficial de suporte e privacidade: <a href="mailto:app.storyforge@gmail.com" className="underline text-purple-900">app.storyforge@gmail.com</a>
                </p>
              </section>

            </div>

            {/* ASSINATURA FINAL DO DOCUMENTO */}
            <footer className="mt-12 pt-6 border-t-2 border-black text-center text-xs md:text-sm text-gray-700 space-y-1">
              <p className="font-bold">StoryForge — Estúdio Profissional de Desenvolvimento Narrativo</p>
              <p>Documento de gestão de armazenamento local registrado sob as diretrizes da LGPD.</p>
            </footer>

          </div>
        </div>

        {/* RODAPÉ DO MODAL */}
        <div className="flex items-center justify-between shrink-0 pt-2 border-t border-gray-800">
          <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-purple-950/40"
          >
            Entendido e Ciente
          </button>
        </div>

      </div>
    </div>
  );
}