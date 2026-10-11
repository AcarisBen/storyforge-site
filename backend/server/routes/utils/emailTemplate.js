// backend/server/routes/utils/emailTemplate.js
// Templates de e-mail simplificados
function getHeaderHTML() {
  return `
    <tr>
      <td align="center" style="padding: 28px 0 20px 0; border-bottom: 1px solid #1e1e2e; background-color: #12121c;">
        <span style="font-size: 26px; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; letter-spacing: -0.5px;">
          <span style="color: #a855f7;">Story</span><span style="color: #f97316;">Forge</span>
        </span>
      </td>
    </tr>
  `;
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

// 1. E-MAIL DE CONFIRMAÇÃO DE CADASTRO
export function getConfirmationEmailHTML(userName, confirmationLink) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme seu e-mail — StoryForge</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #12121c; border: 1px solid #281a2e; border-radius: 16px; overflow: hidden;">
    
    ${getHeaderHTML()}

    <tr>
      <td style="padding: 36px 32px; text-align: left;">
        <h1 style="font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 16px;">
          Falta pouco para forjar suas histórias, ${userName || 'Autor'}!
        </h1>
        
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px;">
          Origado por se cadastrar no <b>StoryForge</b>. Para garantir a segurança da sua conta e liberar o acesso completo ao seu estúdio narrativo, confirme seu e-mail clicando no botão abaixo:
        </p>

        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 30px auto;">
          <tr>
            <td align="center" style="border-radius: 12px; background-color: #8b5cf6;">
              <a href="${confirmationLink}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px;">
                Confirmar Meu E-mail
              </a>
            </td>
          </tr>
        </table>

        <div style="height: 1px; background-color: #1e1e2e; margin: 32px 0 20px 0;"></div>

        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0; word-break: break-all;">
          Se o botão não funcionar, copie e cole este link no navegador:<br>
          <a href="${confirmationLink}" style="color: #c084fc; text-decoration: none;">${confirmationLink}</a>
        </p>
      </td>
    </tr>

    <tr>
      <td align="center" style="padding: 20px 32px; background-color: #0b0b10; border-top: 1px solid #1e1e2e; font-size: 12px; color: #475569;">
        <p style="margin: 0;">StoryForge — Estúdio Profissional de Desenvolvimento Narrativo</p>
      </td>
    </tr>

  </table>

</body>
</html>`;
}

// 2. E-MAIL DE REDEFINIÇÃO DE SENHA
export function getResetPasswordEmailHTML(userName, resetLink) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinição de Senha — StoryForge</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #12121c; border: 1px solid #281a2e; border-radius: 16px; overflow: hidden;">
    
    ${getHeaderHTML()}

    <tr>
      <td style="padding: 36px 32px; text-align: left;">
        <h1 style="font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 16px;">
          Redefinição de Senha
        </h1>
        
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px;">
          Olá, <b>${userName || 'Autor'}</b>! Recebemos uma solicitação para redefinir a senha de acesso da sua conta no <b>StoryForge</b>.
        </p>

        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 30px auto;">
          <tr>
            <td align="center" style="border-radius: 12px; background-color: #8b5cf6;">
              <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px;">
                Redefinir Minha Senha
              </a>
            </td>
          </tr>
        </table>

        <div style="background-color: #171524; border: 1px solid #3b2054; border-radius: 10px; padding: 14px; margin-top: 24px;">
          <p style="font-size: 12px; color: #c084fc; margin: 0; line-height: 1.5;">
            <b>Atenção:</b> Este link é temporário. Se você não solicitou a alteração, nenhuma ação é necessária.
          </p>
        </div>

        <div style="height: 1px; background-color: #1e1e2e; margin: 32px 0 20px 0;"></div>

        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0; word-break: break-all;">
          Se o botão não funcionar, copie e cole este link no navegador:<br>
          <a href="${resetLink}" style="color: #c084fc; text-decoration: none;">${resetLink}</a>
        </p>
      </td>
    </tr>

    <tr>
      <td align="center" style="padding: 20px 32px; background-color: #0b0b10; border-top: 1px solid #1e1e2e; font-size: 12px; color: #475569;">
        <p style="margin: 0;">StoryForge — Estúdio Profissional de Desenvolvimento Narrativo</p>
      </td>
    </tr>

  </table>

</body>
</html>`;
}

// 3. E-MAIL DE EXCLUSÃO DE CONTA
export function getDeleteAccountEmailHTML(userName, deleteLink) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Exclusão — StoryForge</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #12121c; border: 1px solid #3f1717; border-radius: 16px; overflow: hidden;">
    
    ${getHeaderHTML()}

    <tr>
      <td style="padding: 36px 32px; text-align: left;">
        <h1 style="font-size: 20px; font-weight: 700; color: #f87171; margin-top: 0; margin-bottom: 16px;">
          Confirmação de Exclusão de Conta
        </h1>
        
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px;">
          Olá, <b>${userName || 'Autor'}</b>. Recebemos uma solicitação no painel do <b>StoryForge</b> para excluir permanentemente a sua conta.
        </p>

        <div style="background-color: #1f1213; border: 1px solid #7f1d1d; border-radius: 10px; padding: 14px; margin-bottom: 24px;">
          <p style="font-size: 12px; color: #fca5a5; margin: 0; line-height: 1.5;">
            <b>ATENÇÃO:</b> Ao confirmar, todos os seus projetos e dados serão deletados permanentemente.
          </p>
        </div>

        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 30px auto;">
          <tr>
            <td align="center" style="border-radius: 12px; background-color: #ef4444;">
              <a href="${deleteLink}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px;">
                Excluir Minha Conta Definitivamente
              </a>
            </td>
          </tr>
        </table>

        <div style="height: 1px; background-color: #1e1e2e; margin: 32px 0 20px 0;"></div>

        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0; word-break: break-all;">
          Se o botão não funcionar, copie e cole este link no navegador:<br>
          <a href="${deleteLink}" style="color: #f87171; text-decoration: none;">${deleteLink}</a>
        </p>
      </td>
    </tr>

    <tr>
      <td align="center" style="padding: 20px 32px; background-color: #0b0b10; border-top: 1px solid #1e1e2e; font-size: 12px; color: #475569;">
        <p style="margin: 0;">StoryForge — Estúdio Profissional de Desenvolvimento Narrativo</p>
      </td>
    </tr>

  </table>

</body>
</html>`;
}

// 4. TEMPLATE DE E-MAIL DE REPORT DE BUG (Enviado para a equipe)
export function getBugReportEmailHTML(data) {
  const env = data.environment || {};
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Novo Bug Report — StoryForge</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 30px auto; background-color: #12121c; border: 1px solid #281a2e; border-radius: 16px; overflow: hidden;">
    
    ${getHeaderHTML()}

    <tr>
      <td style="padding: 28px; text-align: left;">
        <h1 style="font-size: 18px; font-weight: 700; color: #ef4444; margin-top: 0; margin-bottom: 12px;">
          🐛 Novo Diagnóstico de Bug Recebido
        </h1>

        <div style="background-color: #171724; border: 1px solid #28283a; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #cbd5e1;"><b>Autor:</b> ${data.userName || 'N/A'} (&lt;${data.userEmail}&gt;)</p>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #cbd5e1;"><b>User ID:</b> ${data.userId || 'N/A'}</p>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #c084fc;"><b>Módulo:</b> ${data.module}</p>
          <p style="margin: 0; font-size: 13px; color: #f87171;"><b>Tipo do Problema:</b> ${data.bugType}</p>
        </div>

        <h3 style="font-size: 14px; color: #ffffff; margin-bottom: 8px;">Descrição detalhada:</h3>
        <div style="background-color: #0d0d14; border-left: 3px solid #a855f7; border-radius: 6px; padding: 14px; font-size: 13px; color: #e2e8f0; white-space: pre-wrap; line-height: 1.5; margin-bottom: 20px;">
${data.description}
        </div>

        <h3 style="font-size: 14px; color: #ffffff; margin-bottom: 8px;">Diagnóstico do Ambiente:</h3>
        <div style="background-color: #0d0d14; border: 1px solid #1e1e2e; border-radius: 8px; padding: 12px; font-size: 11px; color: #94a3b8; font-mono: monospace; line-height: 1.6;">
          • <b>URL:</b> ${env.currentUrl || 'N/A'}<br>
          • <b>Path:</b> ${env.path || 'N/A'}<br>
          • <b>Navegador/SO:</b> ${env.userAgent || 'N/A'}<br>
          • <b>Resolução:</b> ${env.screenResolution || 'N/A'}<br>
          • <b>Versão do App:</b> ${env.appVersion || 'N/A'}<br>
          • <b>Data/Hora:</b> ${env.timestamp || new Date().toISOString()}
        </div>
      </td>
    </tr>

    <tr>
      <td align="center" style="padding: 16px; background-color: #0b0b10; border-top: 1px solid #1e1e2e; font-size: 11px; color: #475569;">
        StoryForge Support System
      </td>
    </tr>

  </table>

</body>
</html>`;
}