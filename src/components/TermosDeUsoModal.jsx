// src/components/TermosDeUsoModal.jsx
// Modal de Termos de Uso do StoryForge no formato de documento formal (fundo branco, texto em preto na íntegra).

import React from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, Check } from 'lucide-react';

export default function TermosDeUsoModal({ isOpen, onClose, onAccept }) {
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
              <h3 className="text-base font-bold text-white tracking-wide">Documento Legal e Termos de Uso</h3>
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
            
            {/* TÍTULO PRINCIPAL DO CONTRATO */}
            <div className="text-center pb-6 border-b-2 border-gray-900 space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                Termos de Uso e Serviço — StoryForge
              </h2>
              <p className="text-xs font-semibold text-gray-600 tracking-wider">
                ÚLTIMA ATUALIZAÇÃO: 09 DE OUTUBRO DE 2026 &nbsp;•&nbsp; VERSÃO: 1.0.0 (BETA)
              </p>
            </div>

            {/* INTRODUÇÃO */}
            <div className="space-y-3 text-gray-800">
              <p className="font-medium text-base leading-snug">
                Seja bem-vindo ao <b>StoryForge</b>! Este documento estabelece os Termos de Uso e Serviço que regem o acesso e a utilização da nossa plataforma de desenvolvimento narrativo, organização de universos e estruturação de manuscritos.
              </p>
              <p className="text-sm text-gray-700">
                Ao cadastrar uma conta, acessar ou utilizar o <b>StoryForge</b>, você declara que leu, compreendeu e concorda integralmente com estes Termos. Caso não concorde com qualquer uma das disposições aqui estabelecidas, orientamos que descontinue o uso do serviço.
              </p>
            </div>

            {/* 1. DEFINIÇÕES E ESCOPO */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                1. Definições e Escopo do Serviço
              </h3>
              <p>
                1.1. O <b>StoryForge</b> é uma plataforma digital independente voltada ao apoio de autores, roteiristas e criadores na estruturação, planejamento e escrita de obras literárias e narrativas.
              </p>
              <p>1.2. <b>As funcionalidades oferecidas incluem</b>, entre outras:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-gray-800 font-normal">
                <li>Editor de escrita com formatação literária e motor local de revisão ortográfica e gramatical;</li>
                <li>Gerenciamento de fichas de personagens, locais, regras do mundo <i>(worldbuilding)</i> e estrutura dramática;</li>
                <li>Ferramentas visuais de organização, como quadros de planejamento, mapas emocionais e linha do tempo <i>(timeline)</i>;</li>
                <li>Recursos de exportação de dados em formatos padronizados (PDF e JSON).</li>
              </ul>
            </section>

            {/* 2. CAPACIDADE CIVIL */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                2. Capacidade Civil e Idade Mínima
              </h3>
              <p>
                2.1. O uso dos serviços do <b>StoryForge</b> é destinado a pessoas físicas com plena capacidade civil nos termos da legislação brasileira.
              </p>
              <p>
                2.2. Ao realizar o cadastro na plataforma, o usuário declara ter no mínimo 18 (dezoito) anos de idade ou, caso seja menor de idade (entre 13 e 17 anos), declara estar devidamente autorizado e supervisionado por seus pais ou responsáveis legais, que assumem total responsabilidade civil pelos atos praticados pelo menor na plataforma.
              </p>
              <p>
                2.3. O cadastro de crianças menores de 13 (treze) anos é estritamente proibido sem o consentimento formal e verificável dos pais ou responsáveis legais, em estrita conformidade com a <b>Lei Geral de Proteção de Dados</b> (LGPD — Lei nº 13.709/2018).
              </p>
            </section>

            {/* 3. PROPRIEDADE INTELECTUAL DO USUÁRIO */}
            <section className="space-y-2.5 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                3. Propriedade Intelectual do Usuário e Direitos Autorais
              </h3>
              <p>
                3.1. <b>Titularidade Incondicional das Obras:</b> Todo e qualquer texto, enredo, personagem, nome fictício, mundo, diálogo, manuscrito ou arquivo criado, inserido ou armazenado no <b>StoryForge</b> pelo usuário é e permanecerá de sua propriedade exclusiva.
              </p>
              <p>
                3.2. O <b>StoryForge</b> não reivindica, em hipótese alguma, qualquer direito autoral, patrimonial ou moral sobre o conteúdo das histórias dos usuários.
              </p>
              <p>
                3.3. <b>Sigilo e Não Comercialização:</b> O <b>StoryForge</b> compromete-se a não vender, licenciar, transferir, compartilhar com terceiros ou utilizar os textos das histórias dos usuários para treinamento público de modelos de inteligência artificial ou quaisquer finalidades comerciais.
              </p>
              <p>
                3.4. <b>Caráter Informal do Pseudônimo e Ausência de Exclusividade:</b> O pseudônimo ou nome de exibição configurado no Perfil do Autor possui caráter estritamente estético, informatório e customizável para personalização da interface e das exportações do próprio usuário. O cadastramento ou alteração de um pseudônimo:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-gray-800">
                <li>NÃO constitui verificação de identidade civil nem prova formal de autoria jurídica;</li>
                <li>NÃO concede direito de exclusividade de uso do nome dentro ou fora da plataforma;</li>
                <li>NÃO implica qualquer cessão, licença, transferência de direitos autorais ou utilização comercial por parte do <b>StoryForge</b>.</li>
              </ul>
              <p>
                3.5. <b>Identificação Real da Conta e Disputas de Nomes:</b> A responsabilidade jurídica por qualquer atividade na plataforma vincula-se estritamente à conta cadastrada (identificada pelo e-mail, ID de usuário e registros de acesso) e não ao pseudônimo exibido no momento. O <b>StoryForge</b> não atua como mediador de disputas entre usuários por nomes artísticos, marcários ou pseudônimos similares.
              </p>
            </section>

            {/* 4. PROPRIEDADE INTELECTUAL DA PLATAFORMA */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                4. Propriedade Intelectual da Plataforma
              </h3>
              <p>
                4.1. A marca <b>StoryForge</b>, o código-fonte, a interface gráfica (<i>design system</i>), as estruturas de banco de dados e as tecnologias digitais desenvolvidas pertencem exclusivamente à plataforma.
              </p>
              <p>4.2. É expressamente proibido ao usuário:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-gray-800">
                <li>Realizar engenharia reversa, descompilação, desmontagem ou extração não autorizada do código-fonte;</li>
                <li>Utilizar <b><i>bots</i></b>, <b><i>scrapers</i></b>, <b><i>crawlers</i></b> ou rotinas automatizadas não autorizadas no sistema;</li>
                <li>Copiar, reproduzir ou redistribuir a marca registrada, logotipo ou elementos visuais do <b>StoryForge</b> sem autorização prévia por escrito.</li>
              </ul>
            </section>

            {/* 5. CADASTRO E PRIVACIDADE */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                5. Cadastro, Segurança da Conta e Privacidade
              </h3>
              <p>
                5.1. <b>Autenticação:</b> Para utilizar a plataforma, o usuário deve criar uma conta com um endereço de e-mail válido e definir uma senha que atenda aos requisitos de segurança do sistema.
              </p>
              <p>
                5.2. <b>Responsabilidade do Usuário:</b> A manutenção do sigilo da senha e a segurança do dispositivo utilizado para acesso são de responsabilidade exclusiva do usuário.
              </p>
              <p>
                5.3. <b>Tratamento de Dados (LGPD):</b> O tratamento de dados pessoais no <b>StoryForge</b> limita-se ao estritamente necessário para a prestação do serviço (autenticação, manutenção de sessão via cookies seguros e comunicações operacionais). O gerenciamento das preferências de privacidade pode ser realizado a qualquer tempo pelo painel de Configurações.
              </p>
              <p>
                5.4. <b>Guarda Obrigatória de Registros (Marco Civil da Internet):</b> Em cumprimento ao Artigo 15 da Lei nº 12.965/2014 (<b>Marco Civil da Internet</b>), o <b>StoryForge</b> manterá em ambiente seguro e sob sigilo os registros de acesso à aplicação (endereço IP, data, hora e duração da sessão) pelo prazo mínimo de 6 (seis) meses.
              </p>
              <p>
                5.5. <b>Política de Privacidade:</b> Este documento deve ser lido e interpretado em conjunto com a <b>Política de Privacidade</b> do <b>StoryForge</b>, disponível na plataforma.
              </p>
            </section>

            {/* 6. AUP */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                6. Política de Conteúdo Proibido e Uso Aceitável (AUP)
              </h3>
              <p>
                6.1. O usuário compromete-se a utilizar o <b>StoryForge</b> de maneira ética, respeitosa e em conformidade com o ordenamento jurídico vigente.
              </p>
              <p>
                6.2. É estritamente proibido utilizar a plataforma para armazenar, transmitir ou processar conteúdos que:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-gray-800">
                <li>Envolvam <b>pornografia infantil</b>, <b>exploração sexual de menores</b> ou <b>incitação a crimes graves</b>;</li>
                <li>Disseminem <b>vírus</b>, <b><i>malware</i></b>, <b><i>trojans</i></b> ou <b>códigos maliciosos</b> destinados a comprometer a segurança da infraestrutura ou de outros usuários;</li>
                <li>Promovam <b>tentativas de acesso não autorizado (<i>hacking</i>)</b>, <b>testes de vulnerabilidade sem autorização</b> ou <b>ataques de negação de serviço</b> (<b>DoS/DDoS</b>);</li>
                <li>Burlem as travas automáticas de limitação de taxa de requisições (<b><i>rate limiting</i></b>) da API da plataforma.</li>
              </ul>
              <p>
                6.3. <b>Denúncias de Violação e Plágio:</b> Caso qualquer pessoa ou titular de direitos autorais identifique que um conteúdo armazenado por usuário na plataforma viola seus direitos de propriedade intelectual ou legislação vigente, poderá enviar uma notificação fundamentada para o e-mail <b>app.storyforge@gmail.com</b>. O <b>StoryForge</b> analisará o pedido e poderá suspender preventivamente o acesso ao conteúdo ou à conta infratora, nos termos dos Arts. 19 e 21 do <b>Marco Civil da Internet</b>.
              </p>
            </section>

            {/* 7. REGISTRO OFICIAL */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                7. Isenção de Registro Oficial de Direitos Autorais
              </h3>
              <p>
                7.1. O <b>StoryForge</b> atua exclusivamente como ferramenta de organização, estruturação e escrita narrativa.
              </p>
              <p>
                7.2. O uso da plataforma ou a exportação de documentos (em PDF ou JSON) não substitui nem constitui registro formal de direitos autorais perante órgãos oficiais competentes, tais como a Fundação Biblioteca Nacional ou a Escola de Belas Artes. Cabe ao próprio autor providenciar a proteção jurídica formal da sua obra conforme a legislação aplicável.
              </p>
            </section>

            {/* 8. BЕТА, RESPONSA E BACKUPS */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                8. Status do Projeto, Limitação de Responsabilidade e Backups
              </h3>
              <p>
                8.1. <b>Fase de Desenvolvimento (Beta):</b> O <b>StoryForge</b> é um projeto mantido de forma independente. O usuário reconhece que o serviço é fornecido "no estado em que se encontra" (as is) e pode passar por atualizações, otimizações de código ou modificações de interface.
              </p>
              <p>
                8.2. <b>Responsabilidade por Backups:</b> Embora a plataforma adote rotinas de segurança e redundância em banco de dados, é dever do usuário realizar a exportação periódica de seus projetos (via arquivos JSON ou relatórios em PDF) para salvaguarda de seu acervo pessoal.
              </p>
              <p>
                8.3. <b>Limitação de Danos:</b> Em nenhuma hipótese o <b>StoryForge</b> ou seus desenvolvedores serão responsáveis por quaisquer danos indiretos, lucros cessantes, prejuízos comerciais ou perda de dados decorrentes do uso inadequado do sistema ou de falhas de conexão de responsabilidade do próprio usuário.
              </p>
              <p>
                8.4. <b>Caso Fortuito e Força Maior:</b> O <b>StoryForge</b> não será responsabilizado por falhas, indisponibilidades de sistema ou perdas de dados decorrentes de eventos imprevisíveis ou inevitáveis enquadrados como caso fortuito ou força maior (Art. 393 do <b>Código Civil</b>), tais como interrupções massivas na infraestrutura de telecomunicações, ataques cibernéticos em escala global ou falhas nos provedores de nuvem de terceiros.
              </p>
            </section>

            {/* 9. INDISPONIBILIDADE E SLA */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                9. Indisponibilidade do Serviço, Manutenção e SLA
              </h3>
              <p>
                9.1. O <b>StoryForge</b> empenha esforços contínuos para manter a plataforma acessível e estável. Contudo, não garante que o serviço estará disponível de forma ininterrupta ou isento de falhas técnicas temporárias.
              </p>
              <p>
                9.2. A plataforma reserva-se o direito de realizar manutenções programadas ou emergenciais na infraestrutura, bem como de aplicar atualizações técnicas de segurança.
              </p>
              <p>
                9.3. Oscilações, interrupções pontuais ou indisponibilidades temporárias decorrentes de manutenção ou de falhas na rede mundial de computadores não gerarão aos usuários qualquer direito a ressarcimento ou indenização.
              </p>
            </section>

            {/* 10. TERCEIROS */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                10. Serviços de Terceiros e Links Externos
              </h3>
              <p>
                10.1. O <b>StoryForge</b> utiliza provedores de infraestrutura, hospedagem em nuvem, servidores de banco de dados e serviços de análise técnica integrados (como <i>PostHog</i> e infraestrutura <i>Cloud</i>) para garantir o funcionamento do sistema.
              </p>
              <p>
                10.2. O <b>StoryForge</b> não se responsabiliza por eventuais instabilidades, falhas de conexão ou alterações de políticas originadas diretamente por esses provedores externos de infraestrutura tecnológica.
              </p>
            </section>

            {/* 11. SUSPENSÃO E ENCERRAMENTO */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                11. Suspensão e Encerramento de Conta por Violação
              </h3>
              <p>
                11.1. O <b>StoryForge</b> reserva-se o direito de advertir, suspender temporariamente ou encerrar definitivamente a conta de qualquer usuário que descumprir as regras estabelecidas nestes Termos de Uso.
              </p>
              <p>
                11.2. Em casos de infrações graves — como tentativas de invasão, inserção de código malicioso ou abuso sistemático da API —, a suspensão ou cancelamento da conta poderá ser efetuado de forma imediata e sem aviso prévio, sem prejuízo da adoção das medidas judiciais cabíveis.
              </p>
            </section>

            {/* 12. GRATUIDADE E DOAÇÕES */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                12. Gratuidade, Apoio Financeiro e Doações (Pix)
              </h3>
              <p>
                12.1. A proposta central do <b>StoryForge</b> é manter suas funcionalidades essenciais acessíveis para a prática da escrita.
              </p>
              <p>
                12.2. Contribuições voluntárias (como doações via Pix) são facultativas e visam auxiliar na manutenção dos custos operacionais de infraestrutura.
              </p>
              <p>
                12.3. O ato de doar não concede ao doador qualquer participação acionária, direito de propriedade sobre a plataforma ou privilégios contratuais.
              </p>
              <p>
                12.4. <b>Alterações Comerciais e Planos Pagos:</b> O <b>StoryForge</b> reserva-se o direito de, no futuro, implementar planos pagos, assinaturas ou cobranças por recursos avançados. Caso ocorra alteração no modelo de gratuidade do sistema, os usuários serão notificados com antecedência mínima de 30 (trinta) dias por e-mail ou aviso na plataforma, garantindo-se o direito à exportação gratuita de todos os seus projetos e dados salvos no sistema.
              </p>
            </section>

            {/* 13. CANCELAMENTO E EXCLUSÃO */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                13. Cancelamento e Exclusão Permanente da Conta pelo Usuário
              </h3>
              <p>
                13.1. O usuário tem o direito de solicitar a exclusão definitiva de sua conta e de todos os seus dados associados a qualquer momento por meio do painel de Configurações.
              </p>
              <p>
                13.2. Para garantia de segurança, a solicitação de exclusão é confirmada mediante o clique no link enviado para o e-mail cadastrado.
              </p>
              <p>
                13.3. <b>Irrevogabilidade:</b> A confirmação da exclusão apagará permanentemente todos os projetos, fichas, manuscritos e dados do usuário cadastrados no sistema, sem possibilidade de recuperação posterior.
              </p>
            </section>

            {/* 14. ALTERAÇÕES */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                14. Alterações destes Termos
              </h3>
              <p>
                14.1. O <b>StoryForge</b> reserva-se o direito de atualizar este documento periodicamente para refletir melhorias no sistema, novas funcionalidades ou adequações legislativas.
              </p>
              <p>
                14.2. Alterações relevantes serão informadas através da interface do aplicativo ou por e-mail. O uso continuado da plataforma após a publicação das alterações constitui aceitação tácita das novas disposições.
              </p>
            </section>

            {/* 15. DISPOSIÇÕES GERAIS */}
            <section className="space-y-2 pt-4 border-t border-gray-300">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                15. Disposições Gerais
              </h3>
              <p>
                15.1. <b>Tolerância:</b> O eventual não exercício ou a demora no exercício de qualquer direito ou faculdade prevista nestes Termos por parte do <b>StoryForge</b> não constituirá renúncia de direito, nem novação contratual.
              </p>
              <p>
                15.2. <b>Divisibilidade:</b> Caso qualquer disposição deste instrumento seja declarada nula, inválida ou inexequível por decisão judicial, as demais cláusulas permanecerão em pleno vigor e efeito.
              </p>
              <p>
                15.3. <b>Validade das Comunicações Eletrônicas:</b> As partes reconhecem o e-mail cadastrado pelo usuário no <b>StoryForge</b> como meio válido, eficaz e suficiente para envio de notificações operacionais, avisos sobre alterações de termos, comunicações de segurança e alertas do sistema.
              </p>
              <p>
                15.4. <b>Aceite Eletrônico:</b> A adesão a estes Termos efetiva-se no momento do clique no botão de cadastro/registro ou pelo uso continuado da aplicação, possuindo plena eficácia jurídica nos termos do Artigo 10, § 2º, da <b>Medida Provisória</b> nº 2.200-2/2001.
              </p>
            </section>

            {/* 16. CONTATO E FORO */}
            <section className="space-y-2 pt-4 border-t border-gray-300 pb-4">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                16. Contato e Foro
              </h3>
              <p>
                16.1. Para esclarecimento de dúvidas, requisições relativas à privacidade de dados ou suporte ao usuário, entre em contato pelo e-mail: <b>app.storyforge@gmail.com</b>.
              </p>
              <p>
                16.2. Estes Termos são regidos e interpretados estritamente conforme a legislação da República Federativa do Brasil, em especial a <b>Lei Geral de Proteção de Dados</b> (Lei nº 13.709/2018), o <b>Marco Civil da Internet</b> (Lei nº 12.965/2014) e o <b>Código Civil Brasileiro</b>.
              </p>
              <p>
                16.3. <b>Eleição de Foro:</b> Fica eleito o Foro da Comarca de São Paulo/SP, com renúncia expressa a qualquer outro, por mais privilegiado seja, para dirimir quaisquer dúvidas, litígios ou controvérsias oriundas destes Termos, ressalvadas as hipóteses em que a legislação aplicável determine obrigatoriamente foro diverso.
              </p>
            </section>

          </div>

        </div>

        {/* RODAPÉ DE AÇÃO COM OS BOTÕES */}
        <div className="p-4 border-t border-gray-800 bg-[#171724] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#222232] hover:bg-[#2c2c40] text-gray-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            Fechar
          </button>
          
          <button
            type="button"
            onClick={() => {
              if (onAccept) onAccept();
              onClose();
            }}
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