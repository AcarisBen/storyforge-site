// backend/server/utils/emailTemplate.js

export function getConfirmationEmailHTML(userName, confirmationLink) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação StoryForge</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  
  <!-- CONTAINER PRINCIPAL -->
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #12121c; border: 1px solid #281a2e; border-radius: 18px; overflow: hidden; box-shadow: 0 0 35px rgba(245, 158, 11, 0.12), 0 10px 40px rgba(0, 0, 0, 0.8);">
    
    <!-- CABEÇALHO / LOGO -->
    <tr>
      <td align="center" style="padding: 40px 0 24px 0; border-bottom: 1px solid #1e1e2e; background: linear-gradient(180deg, rgba(245, 158, 11, 0.04) 0%, rgba(18, 18, 28, 0) 100%);">
        <table border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 35%, #7e22ce 70%, #4f46e5 100%); border-radius: 12px; width: 44px; height: 44px; color: #ffffff; font-size: 22px; font-weight: bold; line-height: 44px; box-shadow: 0 0 12px rgba(245, 158, 11, 0.3);">
              ✦
            </td>
            <td style="padding-left: 14px; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
              StoryForge
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

        <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin: 0;">
          Se o botão acima não funcionar, copie e cole o link a seguir no seu navegador:<br>
          <a href="${confirmationLink}" style="color: #c084fc; word-break: break-all; text-decoration: none;">${confirmationLink}</a>
        </p>

        <p style="font-size: 14px; color: #64748b; margin-top: 16px;">
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