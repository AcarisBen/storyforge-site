// backend/server/utils/emailTemplate.js
// Templates de e-mail estilizados em HTML para o StoryForge

// 1. E-MAIL DE CONFIRMAÇÃO DE CADASTRO
export function getConfirmationEmailHTML(userName, confirmationLink) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação StoryForge</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #12121c; border: 1px solid #281a2e; border-radius: 18px; overflow: hidden; box-shadow: 0 0 35px rgba(245, 158, 11, 0.12), 0 10px 40px rgba(0, 0, 0, 0.8);">
    
    <!-- CABEÇALHO / LOGO STORYFORGE -->
    <tr>
      <td align="center" style="padding: 36px 0 24px 0; border-bottom: 1px solid #1e1e2e; background: linear-gradient(180deg, rgba(245, 158, 11, 0.04) 0%, rgba(18, 18, 28, 0) 100%);">
        <table border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-right: 12px;">
              <img src="https://storyforge.com.br/StoryForgeLOGO2.png" alt="StoryForge Logo" width="36" height="36" style="display: block; border: 0;" />
            </td>
            <td style="font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
              <span style="background: linear-gradient(135deg, #c084fc 0%, #a855f7 40%, #f97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #c084fc;">StoryForge</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CONTEÚDO PRINCIPAL -->
    <tr>
      <td style="padding: 40px 32px; text-align: left;">
        <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 16px;">
          Falta pouco para forjar suas histórias, ${userName || 'Autor'}! ✍️
        </h1>
        
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px;">
          Obrigado por se cadastrar no <b>StoryForge</b>. Para garantir a segurança da sua conta e liberar o acesso completo ao seu estúdio narrativo, confirme seu e-mail clicando no botão abaixo:
        </p>

        <!-- BOTÃO DE AÇÃO -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 36px auto;">
          <tr>
            <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 20%, #9333ea 60%, #6b21a8 100%); box-shadow: 0 0 20px rgba(245, 158, 11, 0.25), 0 4px 15px rgba(147, 51, 234, 0.4);">
              <a href="${confirmationLink}" target="_blank" style="display: inline-block; padding: 14px 34px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px;">
                Confirmar Meu E-mail
              </a>
            </td>
          </tr>
        </table>

        <!-- LINHA SEPARADORA -->
        <div style="height: 1px; background: linear-gradient(90deg, rgba(245, 158, 11, 0) 0%, rgba(245, 158, 11, 0.3) 50%, rgba(245, 158, 11, 0) 100%); margin-top: 36px; margin-bottom: 24px;"></div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">
          Se o botão acima não funcionar, copie e cole o link a seguir no seu navegador:<br>
          <a href="${confirmationLink}" style="color: #c084fc; word-break: break-all; text-decoration: none;">${confirmationLink}</a>
        </p>

        <p style="font-size: 13px; color: #64748b; margin-top: 16px;">
          Se você não criou uma conta no StoryForge, pode ignorar esta mensagem com segurança.
        </p>
      </td>
    </tr>

    <!-- RODAPÉ -->
    <tr>
      <td align="center" style="padding: 24px 32px; background-color: #0b0b10; border-top: 1px solid #1e1e2e; font-size: 12px; color: #475569;">
        <p style="margin: 0;">StoryForge — Estúdio Profissional de Desenvolvimento Narrativo</p>
        <p style="margin: 4px 0 0 0;">Um ambiente feito de escritor para escritores.</p>
      </td>
    </tr>

  </table>

</body>
</html>`;
}


// 2. E-MAIL DE REDEFINIÇÃO DE SENHA ("ESQUECEU A SENHA")
export function getResetPasswordEmailHTML(userName, resetLink) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinição de Senha — StoryForge</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #12121c; border: 1px solid #281a2e; border-radius: 18px; overflow: hidden; box-shadow: 0 0 35px rgba(168, 85, 247, 0.15), 0 10px 40px rgba(0, 0, 0, 0.8);">
    
    <!-- CABEÇALHO / LOGO STORYFORGE -->
    <tr>
      <td align="center" style="padding: 36px 0 24px 0; border-bottom: 1px solid #1e1e2e; background: linear-gradient(180deg, rgba(168, 85, 247, 0.05) 0%, rgba(18, 18, 28, 0) 100%);">
        <table border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-right: 12px;">
              <img src="https://storyforge.com.br/StoryForgeLOGO2.png" alt="StoryForge Logo" width="36" height="36" style="display: block; border: 0;" />
            </td>
            <td style="font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
              <span style="background: linear-gradient(135deg, #c084fc 0%, #a855f7 40%, #f97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #c084fc;">StoryForge</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CONTEÚDO PRINCIPAL -->
    <tr>
      <td style="padding: 40px 32px; text-align: left;">
        <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 16px;">
          Redefinição de Senha 🔑
        </h1>
        
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px;">
          Olá, <b>${userName || 'Autor'}</b>! Recebemos uma solicitação para redefinir a senha de acesso da sua conta no <b>StoryForge</b>.
        </p>

        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px;">
          Para cadastrar uma nova senha e recuperar seu acesso, clique no botão abaixo:
        </p>

        <!-- BOTÃO DE AÇÃO -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 36px auto;">
          <tr>
            <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #6b21a8 100%); box-shadow: 0 0 20px rgba(168, 85, 247, 0.3), 0 4px 15px rgba(107, 33, 168, 0.5);">
              <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 34px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px;">
                Redefinir Minha Senha
              </a>
            </td>
          </tr>
        </table>

        <!-- ALERTA DE SEGURANÇA -->
        <div style="background-color: #171524; border: 1px solid #3b2054; border-radius: 12px; padding: 16px; margin-top: 28px;">
          <p style="font-size: 13px; color: #c084fc; margin: 0; line-height: 1.5;">
            <b>⏳ Atenção:</b> Este link possui validade temporária. Se você não solicitou a redefinição, nenhuma alteração foi feita e você pode ignorar este e-mail com segurança.
          </p>
        </div>

        <!-- LINHA SEPARADORA -->
        <div style="height: 1px; background: linear-gradient(90deg, rgba(168, 85, 247, 0) 0%, rgba(168, 85, 247, 0.3) 50%, rgba(168, 85, 247, 0) 100%); margin-top: 36px; margin-bottom: 24px;"></div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">
          Se o botão não funcionar, copie e cole este link no navegador:<br>
          <a href="${resetLink}" style="color: #c084fc; word-break: break-all; text-decoration: none;">${resetLink}</a>
        </p>
      </td>
    </tr>

    <!-- RODAPÉ -->
    <tr>
      <td align="center" style="padding: 24px 32px; background-color: #0b0b10; border-top: 1px solid #1e1e2e; font-size: 12px; color: #475569;">
        <p style="margin: 0;">StoryForge — Estúdio Profissional de Desenvolvimento Narrativo</p>
        <p style="margin: 4px 0 0 0;">Um ambiente feito de escritor para escritores.</p>
      </td>
    </tr>

  </table>

</body>
</html>`;
}


// 3. E-MAIL DE CONFIRMAÇÃO DE EXCLUSÃO DE CONTA
export function getDeleteAccountEmailHTML(userName, deleteLink) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Exclusão de Conta — StoryForge</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #12121c; border: 1px solid #3f1717; border-radius: 18px; overflow: hidden; box-shadow: 0 0 35px rgba(239, 68, 68, 0.15), 0 10px 40px rgba(0, 0, 0, 0.8);">
    
    <!-- CABEÇALHO / LOGO STORYFORGE -->
    <tr>
      <td align="center" style="padding: 36px 0 24px 0; border-bottom: 1px solid #2a1515; background: linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, rgba(18, 18, 28, 0) 100%);">
        <table border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-right: 12px;">
              <img src="https://storyforge.com.br/StoryForgeLOGO2.png" alt="StoryForge Logo" width="36" height="36" style="display: block; border: 0;" />
            </td>
            <td style="font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
              <span style="background: linear-gradient(135deg, #c084fc 0%, #a855f7 40%, #f97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #c084fc;">StoryForge</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CONTEÚDO PRINCIPAL -->
    <tr>
      <td style="padding: 40px 32px; text-align: left;">
        <h1 style="font-size: 22px; font-weight: 700; color: #f87171; margin-top: 0; margin-bottom: 16px;">
          Confirmação de Exclusão de Conta ⚠️
        </h1>
        
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px;">
          Olá, <b>${userName || 'Autor'}</b>. Recebemos uma solicitação no painel do <b>StoryForge</b> para <b>excluir permanentemente</b> a sua conta.
        </p>

        <!-- CAIXA DE ALERTA CRÍTICO -->
        <div style="background-color: #1f1213; border: 1px solid #7f1d1d; border-radius: 12px; padding: 18px; margin-bottom: 28px;">
          <p style="font-size: 13px; color: #fca5a5; margin: 0; line-height: 1.6;">
            <b>⛔ ATENÇÃO:</b> Ao confirmar, todos os seus projetos e dados cadastrais serão <b>deletados imediatamente sem possibilidade de recuperação</b>.
          </p>
        </div>

        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px;">
          Se você tem certeza de que deseja encerrar permanentemente sua jornada no StoryForge, clique no botão abaixo:
        </p>

        <!-- BOTÃO DE EXCLUSÃO CRÍTICO -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 36px auto;">
          <tr>
            <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #991b1b 100%); box-shadow: 0 0 20px rgba(239, 68, 68, 0.35);">
              <a href="${deleteLink}" target="_blank" style="display: inline-block; padding: 14px 34px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px;">
                Excluir Minha Conta Definitivamente
              </a>
            </td>
          </tr>
        </table>

        <!-- LINHA SEPARADORA -->
        <div style="height: 1px; background: linear-gradient(90deg, rgba(239, 68, 68, 0) 0%, rgba(239, 68, 68, 0.3) 50%, rgba(239, 68, 68, 0) 100%); margin-top: 36px; margin-bottom: 24px;"></div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">
          <b>Não foi você?</b> Se você não solicitou a exclusão, ignore este e-mail imediatamente. Recomenda-se também alterar sua senha de acesso por precaução.
        </p>

        <p style="font-size: 13px; color: #64748b; margin-top: 16px;">
          Link direto para confirmação:<br>
          <a href="${deleteLink}" style="color: #f87171; word-break: break-all; text-decoration: none;">${deleteLink}</a>
        </p>
      </td>
    </tr>

    <!-- RODAPÉ -->
    <tr>
      <td align="center" style="padding: 24px 32px; background-color: #0b0b10; border-top: 1px solid #1e1e2e; font-size: 12px; color: #475569;">
        <p style="margin: 0;">StoryForge — Estúdio Profissional de Desenvolvimento Narrativo</p>
        <p style="margin: 4px 0 0 0;">Um ambiente feito de escritor para escritores.</p>
      </td>
    </tr>

  </table>

</body>
</html>`;
}