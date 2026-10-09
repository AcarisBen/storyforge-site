// src/components/PoliticaPrivacidadeModal.jsx
// Modal formal de Política de Privacidade do StoryForge no formato de folha de papel (fundo branco, texto em preto na íntegra).

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
              <h3 className="text-base font-bold text-white tracking-wide">Documento Legal — Política de Privacidade</h3>
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
                Política de Privacidade e Proteção de Dados — StoryForge
              </h2>
              <p className="text-xs font-semibold text-gray-600 tracking-wider">
                ÚLTIMA ATUALIZAÇÃO: 09 DE OUTUBRO DE 2026 &nbsp;•&nbsp; VERSÃO: 1.0.0 (BETA)
              </p>
            </div>

            {/* 1. COMPROMISSO DE PRIVACIDADE E SOBERANIA */}
            <section className="space-y-2 pt-2">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                1. Compromisso de Privacidade e Soberania do Autor
              </h3>
              <p>
                O <b>StoryForge</b> assume o compromisso irrestrito de atuar com transparência, sigilo e respeito à privacidade do autor, operando em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018) e o Marco Civil da Internet (Lei nº 12.965/2014).
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-gray-800">
                <li>
                  <b>Soberania Total do Conteúdo:</b> Todas as histórias, enredos, personagens, fichas de universo, manuscritos, mapas e notas criados ou inseridos no StoryForge pertencem exclusivamente ao seu criador.
                </li>
                <li>
                  <b>Proibição de Comercialização:</b> O StoryForge garante que os seus textos e dados pessoais jamais serão vendidos, alugados, trocados ou comercializados com terceiros.
                </li>
                <li>
                  <b>Proteção contra Treinamento de IA:</b> O conteúdo das suas obras literárias não é utilizado sob nenhuma hipótese para alimentar, treinar ou aprimorar modelos públicos ou privados de inteligência artificial ou motores de linguagem comercial.
                </li>
              </ul>
            </section>

            {/* 2. BASES LEGAIS */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                2. Bases Legais do Tratamento de Dados (Art. 7º da LGPD)
              </h3>
              <p>
                Em conformidade com a legislação vigente, todo tratamento de dados pessoais realizado pelo StoryForge é fundamentado em bases legais específicas:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-gray-800">
                <li>
                  <b>Execução de Contrato e Termos de Serviço (Art. 7º, V):</b> Para a criação de conta, manutenção do seu acesso e entrega das funcionalidades do estúdio de escrita.
                </li>
                <li>
                  <b>Cumprimento de Obrigação Legal ou Regulatória (Art. 7º, II):</b> Para a guarda obrigatória dos registros de acesso à aplicação, conforme exigido pelo Marco Civil da Internet.
                </li>
                <li>
                  <b>Consentimento do Titular (Art. 7º, I):</b> Para o armazenamento de preferências locais de navegação, cookies não essenciais e recursos opcionais de personalização de perfil.
                </li>
                <li>
                  <b>Legítimo Interesse (Art. 7º, IX):</b> Para fins de suporte técnico, prevenção contra fraudes, diagnóstico de bugs e garantia da segurança da plataforma.
                </li>
              </ul>
            </section>

            {/* 3. DADOS COLETADOS E FINALIDADES */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                3. Dados Pessoais Coletados e Finalidades
              </h3>
              <p>
                Coletamos apenas as informações estritamente necessárias para o funcionamento seguro e eficiente do ambiente de escrita:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-800">
                <li>
                  <b>Dados de Cadastro e Autenticação:</b> Nome completo, endereço de e-mail e senha criptografada.
                  <br />
                  <span className="text-gray-700"><b>Finalidade:</b> Criação de conta, login seguro, prevenção de acessos indevidos e redefinição de senha.</span>
                </li>
                <li>
                  <b>Perfil do Autor:</b> Pseudônimo/Nome de exibição, gênero literário principal, mini-biografia e links opcionais (website ou redes sociais).
                  <br />
                  <span className="text-gray-700"><b>Finalidade:</b> Personalização do ambiente e inclusão opcional da identificação do autor nos relatórios e Story Bibles exportadas em PDF ou JSON.</span>
                </li>
                <li>
                  <b>Dados de Suporte e Comunicação:</b> Registros de e-mails enviados para ativação de conta, relatórios de erro e atendimento ao usuário.
                </li>
              </ul>
              <p className="text-gray-700 italic pt-1">
                Caso ocorra alteração na finalidade do uso dos dados, os usuários serão notificados com antecedência para ciência ou consentimento.
              </p>
            </section>

            {/* 4. COMPARTILHAMENTO E SUBPROCESSADORES */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                4. Compartilhamento de Dados e Subprocessadores
              </h3>
              <p>
                O StoryForge não vende nem compartilha seus dados pessoais para fins publicitários. Contudo, para manter a aplicação online e funcional, utilizamos serviços de infraestrutura de tecnologia de terceiros estritamente qualificados (Subprocessadores):
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-gray-800">
                <li>
                  <b>Provedores de Hospedagem e Banco de Dados (ex: Render, Vercel, PostgreSQL Cloud):</b> Para armazenamento seguro dos dados criptografados da aplicação.
                </li>
                <li>
                  <b>Serviços de E-mail Transacional:</b> Para o envio de e-mails do sistema (confirmação de cadastro, redefinição de senha e solicitações de exclusão).
                </li>
              </ul>
              <p className="font-semibold text-gray-800 pt-1">
                Garantia de Sigilo: Todos os subprocessadores contratados cumprem padrões rigorosos de segurança da informação e estão vinculados a deveres contratuais de confidencialidade.
              </p>
            </section>

            {/* 5. TRANSFERÊNCIA INTERNACIONAL */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                5. Transferência Internacional de Dados
              </h3>
              <p>
                Alguns dos nossos servidores de hospedagem e banco de dados podem estar localizados em data centers fora do território brasileiro (como nos Estados Unidos ou na União Europeia).
              </p>
              <p>
                Todas as transferências internacionais cumprem integralmente as exigências do Art. 33 da LGPD, garantindo que os dados mantidos no exterior recebam nível de proteção e criptografia equivalente ou superior ao exigido pela legislação brasileira.
              </p>
            </section>

            {/* 6. COOKIES E ARMAZENAMENTO LOCAL */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                6. Armazenamento Local, Cookies e Sessão
              </h3>
              <ul className="list-disc pl-6 space-y-1.5 text-gray-800">
                <li>
                  <b>Armazenamento Local (Local Storage):</b> Utilizado diretamente no navegador do usuário para guardar preferências visuais (abas ativas, tema e ajustes visuais) e manter o token de autenticação ativo de forma segura.
                </li>
                <li>
                  <b>Cookies Essenciais:</b> Restringem-se estritamente ao gerenciamento de sessão e proteção contra acessos maliciosos. Não utilizamos cookies de rastreamento para anúncios direcionados.
                </li>
              </ul>
              <p className="text-gray-700 italic pt-1">
                Caso o StoryForge passe a utilizar cookies de análise técnica ou marketing de terceiros no futuro, os usuários serão notificados para gerenciamento de preferências através do banner de consentimento.
              </p>
            </section>

            {/* 7. MARCO CIVIL DA INTERNET */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                7. Guarda de Registros (Marco Civil da Internet)
              </h3>
              <p>
                Em cumprimento ao Artigo 15 da Lei nº 12.965/2014 (Marco Civil da Internet), o StoryForge guarda em ambiente seguro e sob sigilo os registros de acesso à aplicação (endereço IP, data, hora e duração das sessões) pelo prazo mínimo legal de 6 (seis) meses.
              </p>
              <p>
                Estes dados não são utilizados para cruzamento de perfis comportamentais e só serão fornecidos mediante ordem judicial expressa das autoridades competentes.
              </p>
            </section>

            {/* 8. SEGURANÇA E NOTIFICAÇÃO DE INCIDENTES */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                8. Segurança da Informação e Notificação de Incidentes
              </h3>
              <ul className="list-disc pl-6 space-y-1.5 text-gray-800">
                <li>
                  <b>Criptografia e Protocolos Seguros:</b> Toda a comunicação entre o navegador e nossos servidores ocorre via protocolo seguro HTTPS/TLS. As senhas de acesso são armazenadas sob algoritmos de hash criptográfico de alta resistência.
                </li>
                <li>
                  <b>Notificação de Incidentes:</b> Caso ocorra qualquer evento fortuito, ataque cibernético ou incidente de segurança que possa acarretar risco ou dano relevante aos seus dados pessoais, o StoryForge compromete-se a notificar a Autoridade Nacional de Proteção de Dados (ANPD) e os usuários afetados em prazo razoável, indicando as medidas corretivas adotadas.
                </li>
              </ul>
            </section>

            {/* 9. MENORES DE IDADE */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                9. Tratamento de Dados de Menores de Idade
              </h3>
              <p>
                O StoryForge é uma plataforma desenvolvida para escritores e autores.
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-gray-800">
                <li>
                  O cadastro e uso por menores de 18 (dezoito) anos deve ser acompanhado ou previamente autorizado por um pai, mãe ou responsável legal.
                </li>
                <li>
                  Não coletamos intencionalmente dados pessoais de crianças sem o consentimento dos pais. Caso identificarmos o cadastro de uma criança sem autorização, a conta e seus dados serão prontamente excluídos.
                </li>
              </ul>
            </section>

            {/* 10. LINKS DE TERCEIROS */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                10. Links para Sites e Plataformas de Terceiros
              </h3>
              <p>
                A aplicação ou os perfis de usuários podem conter links para sites externos (como Amazon, Wattpad, redes sociais ou websites pessoais de autores).
              </p>
              <p>
                O StoryForge não controla e não se responsabiliza pelas práticas de privacidade, termos de uso ou conteúdos de sites de terceiros. Recomendamos que o usuário leia a política de privacidade de qualquer plataforma externa que visitar.
              </p>
            </section>

            {/* 11. DIREITOS DO TITULAR (LGPD) */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                11. Direitos do Titular dos Dados (LGPD)
              </h3>
              <p>
                Conforme estabelecido pelo Artigo 18 da LGPD, você pode exercer a qualquer momento os seguintes direitos:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-gray-800">
                <li>Confirmar a existência do tratamento e acessar seus dados pessoais.</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados no painel de Configurações.</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.</li>
                <li>Revogar o consentimento e gerenciar suas preferências de armazenamento.</li>
                <li>Solicitar a exclusão definitiva de sua conta e de todos os manuscritos e registros associados.</li>
              </ul>
            </section>

            {/* 12. EXCLUSÃO E RETENÇÃO */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                12. Exclusão Permanente e Retenção de Dados
              </h3>
              <p>
                A exclusão da conta pode ser solicitada no painel de <b>Configurações &gt; Privacidade &amp; Conta</b>.
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-gray-800">
                <li>Por motivos de segurança, a solicitação exige confirmação prévia por e-mail.</li>
                <li>Após a confirmação, todos os dados do perfil, projetos, fichas de personagens, manuscritos e preferências serão apagados de forma irreversível.</li>
                <li>Apenas os logs de acesso exigidos pelo Marco Civil da Internet serão retidos até o encerramento do prazo legal obrigatório de 6 meses.</li>
              </ul>
            </section>

            {/* 13. ALTERAÇÕES E CONTATO */}
            <section className="space-y-2 pt-4 border-t border-gray-300 pb-4">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                13. Alterações nesta Política e Contato (DPO)
              </h3>
              <p>
                Esta Política de Privacidade poderá ser atualizada periodicamente para refletir evoluções técnicas, novas funcionalidades ou adequações legislativas. Alterações significativas serão notificadas diretamente na plataforma.
              </p>
              <p>
                Para exercer seus direitos de privacidade, esclarecer dúvidas ou contatar o nosso Encarregado de Proteção de Dados (DPO), envie uma mensagem para: <b>app.storyforge@gmail.com</b>.
              </p>
            </section>

          </div>

        </div>

        {/* RODAPÉ DE AÇÃO COM O BOTÃO */}
        <div className="p-4 border-t border-gray-800 bg-[#171724] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Check size={16} /> Estou Ciente e Aceito
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}