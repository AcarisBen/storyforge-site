// backend/server/routes/auth.js
// Rotas de Autenticação com Bcrypt, JWT Assinado, Cookies HttpOnly, Validação MX e Auditoria Legal

import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dns from 'dns';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { 
  getConfirmationEmailHTML, 
  getResetPasswordEmailHTML, 
  getDeleteAccountEmailHTML 
} from './utils/emailTemplate.js';

const router = express.Router();
const dnsPromises = dns.promises;

// Hash BCRYPT fictício pré-calculado para mitigar Timing Attacks no Login
const DUMMY_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

const hashOneTimeToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const isOneTimeToken = (token) => typeof token === 'string' && /^[a-f\d]{64}$/i.test(token);

// URL base e Chave Secreta JWT ancoradas em variáveis de ambiente
const configuredFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const frontendUrl = new URL(configuredFrontendUrl);
if (!['http:', 'https:'].includes(frontendUrl.protocol) || frontendUrl.pathname !== '/' || frontendUrl.search || frontendUrl.hash) {
  throw new Error('FRONTEND_URL deve ser uma origem HTTP(S) válida, sem caminho, query ou fragmento.');
}
const FRONTEND_URL = frontendUrl.origin;
const JWT_SECRET = process.env.JWT_SECRET;
const cookieSameSite = (process.env.COOKIE_SAME_SITE || (process.env.NODE_ENV === 'production' ? 'strict' : 'lax')).toLowerCase();

if (!['strict', 'lax', 'none'].includes(cookieSameSite)) {
  throw new Error('COOKIE_SAME_SITE deve ser strict, lax ou none.');
}
if (cookieSameSite === 'none' && process.env.NODE_ENV !== 'production') {
  throw new Error('COOKIE_SAME_SITE=none só pode ser usado em produção HTTPS.');
}
// Configuração de Segurança para Cookies HttpOnly
const COOKIE_OPTIONS = {
  httpOnly: true, // Proteção contra XSS
  secure: process.env.NODE_ENV === 'production',
  sameSite: cookieSameSite,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
};

// Helper: Extrair e verificar ID via JWT (Cookie HttpOnly ou Header Authorization)
const extractUserId = (req) => {
  let token = req.cookies?.token;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    }
  }
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    return typeof decoded.userId === 'string' && decoded.userId.length > 0 ? decoded.userId : null;
  } catch (err) {
    return null; // Token inválido, expirado ou adulterado
  }
};

// Transporter do Nodemailer (Gmail SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper: Validação de Senha Forte
function isStrongPassword(password) {
  if (typeof password !== 'string' || Buffer.byteLength(password, 'utf8') > 72) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const isLongEnough = password && password.length >= 8;

  return isLongEnough && hasUppercase && hasLowercase && hasSpecialChar;
}

// Helper: Validação de Domínio MX
async function validateEmailAddress(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, reason: 'Formato de e-mail inválido.' };
  }

  const domain = email.split('@')[1];
  try {
    const mxRecords = await dnsPromises.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, reason: `O domínio "${domain}" não possui servidor de e-mail ativo.` };
    }
  } catch (err) {
    return { valid: false, reason: `O domínio de e-mail "${domain}" é inválido ou inacessível.` };
  }

  return { valid: true };
}

// 1. POST /api/auth/register (Cadastro de Usuário com Log de IP do Marco Civil)
router.post('/register', async (req, res) => {
  try {
    const { fullName, writerName, email, password, acceptedTerms, acceptedAge } = req.body;

    if (typeof fullName !== 'string' || typeof writerName !== 'string' || typeof email !== 'string' || typeof password !== 'string' || !fullName.trim() || !writerName.trim() || !email.trim() || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    if (fullName.length > 160 || writerName.length > 160 || email.length > 254 || password.length > 128) {
      return res.status(400).json({ message: 'Um ou mais campos excedem o tamanho permitido.' });
    }

    if (!acceptedTerms || !acceptedAge) {
      return res.status(400).json({ 
        message: 'Você precisa aceitar os Termos de Uso e confirmar a idade mínima para criar a conta.' 
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: 'A senha deve conter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e pelo menos um caractere especial.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const emailValidation = await validateEmailAddress(cleanEmail);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: emailValidation.reason });
    }

    let user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (user && user.isVerified) {
      return res.status(400).json({ message: 'Este e-mail já está cadastrado e ativo. Faça login.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const confirmToken = crypto.randomBytes(32).toString('hex');
    const tokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Horas

    // Captura do IP do usuário para conformidade com o Art. 15 do Marco Civil da Internet
    const clientIp = req.ip || req.socket.remoteAddress || '';
    const currentTermsVersion = '1.0.0';

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          fullName,
          writerName,
          name: writerName,
          password: hashedPassword,
          isVerified: false,
          verificationToken: hashOneTimeToken(confirmToken),
          verificationTokenExp: tokenExp,
          acceptedTerms: true,
          termsVersion: currentTermsVersion,
          acceptedTermsAt: new Date(),
          signupIp: clientIp,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          fullName,
          writerName,
          name: writerName,
          password: hashedPassword,
          verificationToken: hashOneTimeToken(confirmToken),
          verificationTokenExp: tokenExp,
          acceptedTerms: true,
          termsVersion: currentTermsVersion,
          acceptedTermsAt: new Date(),
          signupIp: clientIp,
        },
      });
    }

    const confirmationLink = `${FRONTEND_URL}/#confirmToken=${encodeURIComponent(confirmToken)}`;

    const mailOptions = {
      from: `"StoryForge" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: '🔨 Confirme seu e-mail — StoryForge',
      html: getConfirmationEmailHTML(writerName || fullName, confirmationLink),
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error('Erro ao enviar e-mail de ativação:', mailError.message);
      return res.status(503).json({ message: 'Cadastro criado, mas o e-mail de ativação não pôde ser enviado. Tente novamente.' });
    }

    return res.status(201).json({
      message: 'Link de confirmação enviado! Verifique sua caixa de entrada para ativar a conta.',
    });
  } catch (err) {
    console.error('Erro no registro:', err);
    return res.status(500).json({ message: 'Erro interno ao cadastrar usuário.' });
  }
});

// 2. POST /api/auth/confirm-email (Ativação da Conta)
router.post('/confirm-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!isOneTimeToken(token)) {
      return res.status(400).json({ message: 'Token de verificação ausente.' });
    }

    const tokenCandidates = [hashOneTimeToken(token), token];
    const result = await prisma.user.updateMany({
      where: { verificationToken: { in: tokenCandidates }, verificationTokenExp: { gt: new Date() } },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExp: null,
      },
    });

    if (result.count !== 1) {
      return res.status(400).json({ message: 'Link de verificação inválido, expirado ou já utilizado.' });
    }

    return res.status(200).json({ message: 'E-mail verificado com sucesso! Sua conta está ativa.' });
  } catch (err) {
    console.error('Erro na verificação de e-mail:', err);
    return res.status(500).json({ message: 'Erro ao validar e-mail.' });
  }
});

// 3. POST /api/auth/login (Protegido contra Enumeração de Usuários e Timing Attacks)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email?.toLowerCase().trim();

    if (!cleanEmail || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    // Mitigação de Timing Attack: executa o bcrypt.compare mesmo se a conta não existir
    const targetHash = user ? user.password : DUMMY_HASH;
    const isPasswordValid = await bcrypt.compare(password, targetHash);

    if (!user || !isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Sua conta ainda não foi ativada. Verifique o link enviado para o seu e-mail.',
      });
    }

    // Emissão do Token JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d', algorithm: 'HS256' });

    // Envio via Cookie HttpOnly
    res.cookie('token', token, COOKIE_OPTIONS);

    const {
      password: _password,
      verificationToken: _verificationToken,
      verificationTokenExp: _verificationTokenExp,
      resetToken: _resetToken,
      resetTokenExp: _resetTokenExp,
      deleteToken: _deleteToken,
      deleteTokenExp: _deleteTokenExp,
      signupIp: _signupIp,
      ...userClean
    } = user;

    return res.status(200).json({ user: userClean });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ message: 'Erro interno no login.' });
  }
});

// 4. POST /api/auth/logout (Destruição da Sessão)
router.post('/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  return res.status(200).json({ message: 'Sessão encerrada com sucesso.' });
});

// 5. GET /api/auth/me (Obter Usuário Logado)
router.get('/me', async (req, res) => {
  try {
    const userId = extractUserId(req);
    if (!userId) return res.status(401).json({ message: 'Não autorizado' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ message: 'Sessão inválida' });

    const {
      password: _password,
      verificationToken: _verificationToken,
      verificationTokenExp: _verificationTokenExp,
      resetToken: _resetToken,
      resetTokenExp: _resetTokenExp,
      deleteToken: _deleteToken,
      deleteTokenExp: _deleteTokenExp,
      signupIp: _signupIp,
      ...userClean
    } = user;
    return res.status(200).json({ user: userClean });
  } catch (err) {
    return res.status(401).json({ message: 'Erro ao obter sessão' });
  }
});

// 6. POST /api/auth/forgot-password (Solicitação de Redefinição de Senha)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (typeof email !== 'string' || !email.trim() || email.length > 254) {
      return res.status(400).json({ message: 'Informe um e-mail válido.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    // Mensagem genérica para não revelar quais e-mails existem
    if (!user) {
      return res.status(200).json({ message: 'Se o e-mail estiver cadastrado, enviamos o link de redefinição.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExp = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: hashOneTimeToken(resetToken), resetTokenExp },
    });

    const resetLink = `${FRONTEND_URL}/#resetToken=${encodeURIComponent(resetToken)}`;

    const mailOptions = {
      from: `"StoryForge" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: '🔨 Redefinição de Senha — StoryForge',
      html: getResetPasswordEmailHTML(user.writerName || user.fullName || user.name, resetLink),
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Se o e-mail estiver cadastrado, enviamos o link de redefinição.' });
  } catch (err) {
    console.error('Erro no forgot-password:', err);
    return res.status(500).json({ message: 'Erro ao processar solicitação de redefinição.' });
  }
});

// 7. POST /api/auth/reset-password (Aplicação da Nova Senha)
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!isOneTimeToken(token) || typeof newPassword !== 'string' || !newPassword) {
      return res.status(400).json({ message: 'Token e nova senha são obrigatórios.' });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message: 'A senha deve conter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e pelo menos um caractere especial.',
      });
    }

    const tokenCandidates = [hashOneTimeToken(token), token];
    const user = await prisma.user.findFirst({
      where: { resetToken: { in: tokenCandidates }, resetTokenExp: { gt: new Date() } },
    });

    if (!user) {
      return res.status(400).json({ message: 'Link de redefinição inválido ou expirado.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await prisma.user.updateMany({
      where: { id: user.id, resetToken: { in: tokenCandidates }, resetTokenExp: { gt: new Date() } },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    if (result.count !== 1) {
      return res.status(400).json({ message: 'Link de redefinição inválido ou expirado.' });
    }

    return res.status(200).json({ message: 'Senha alterada com sucesso! Você já pode fazer login.' });
  } catch (err) {
    console.error('Erro no reset-password:', err);
    return res.status(500).json({ message: 'Erro ao atualizar a senha.' });
  }
});

// 8. PUT /api/auth/change-password (Alteração de Senha no Painel do Usuário)
router.put('/change-password', async (req, res) => {
  try {
    const userId = extractUserId(req);
    if (!userId) return res.status(401).json({ message: 'Não autorizado.' });

    const { currentPassword, newPassword } = req.body;

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || !currentPassword || !newPassword || newPassword.length > 128) {
      return res.status(400).json({ message: 'Informe a senha atual e a nova senha.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'A senha atual está incorreta.' });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message: 'A senha deve conter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e pelo menos um caractere especial.',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: 'Senha alterada com sucesso!' });
  } catch (err) {
    console.error('Erro no change-password:', err);
    return res.status(500).json({ message: 'Erro ao alterar a senha.' });
  }
});

// 9. POST /api/auth/request-delete (Solicitação de Exclusão de Conta)
router.post('/request-delete', async (req, res) => {
  try {
    const userId = extractUserId(req);
    if (!userId) return res.status(401).json({ message: 'Não autorizado.' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const deleteToken = crypto.randomBytes(32).toString('hex');
    const deleteTokenExp = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: { deleteToken: hashOneTimeToken(deleteToken), deleteTokenExp },
    });

    const deleteLink = `${FRONTEND_URL}/#deleteToken=${encodeURIComponent(deleteToken)}`;

    const mailOptions = {
      from: `"StoryForge" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔨 Confirmação de Exclusão de Conta — StoryForge',
      html: getDeleteAccountEmailHTML(user.writerName || user.fullName || user.name, deleteLink),
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'E-mail de confirmação de exclusão enviado com sucesso!' });
  } catch (err) {
    console.error('Erro no request-delete:', err);
    return res.status(500).json({ message: 'Erro ao solicitar exclusão de conta.' });
  }
});

// 10. POST /api/auth/confirm-delete (Exclusão Irrevogável da Conta e Projetos)
router.post('/confirm-delete', async (req, res) => {
  try {
    const { token } = req.body;
    if (!isOneTimeToken(token)) {
      return res.status(400).json({ message: 'Token de exclusão ausente.' });
    }

    const tokenCandidates = [hashOneTimeToken(token), token];
    const result = await prisma.user.deleteMany({
      where: { deleteToken: { in: tokenCandidates }, deleteTokenExp: { gt: new Date() } },
    });

    if (result.count !== 1) {
      return res.status(400).json({ message: 'Link de exclusão inválido, expirado ou já utilizado.' });
    }

    res.clearCookie('token', COOKIE_OPTIONS);

    return res.status(200).json({ message: 'Sua conta e todos os seus projetos foram excluídos permanentemente.' });
  } catch (err) {
    console.error('Erro no confirm-delete:', err);
    return res.status(500).json({ message: 'Erro ao excluir a conta.' });
  }
});

// 11. PUT /api/auth/profile (Atualização de Pseudônimo)
router.put('/profile', async (req, res) => {
  try {
    const userId = extractUserId(req);
    if (!userId) return res.status(401).json({ error: 'Não autorizado' });

    const { name } = req.body;

    if (typeof name !== 'string' || !name.trim() || name.length > 160) {
      return res.status(400).json({ error: 'O pseudônimo é obrigatório.' });
    }

    const cleanName = name.trim();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        writerName: cleanName,
        name: cleanName,
      },
    });

    const {
      password: _password,
      verificationToken: _verificationToken,
      verificationTokenExp: _verificationTokenExp,
      resetToken: _resetToken,
      resetTokenExp: _resetTokenExp,
      deleteToken: _deleteToken,
      deleteTokenExp: _deleteTokenExp,
      signupIp: _signupIp,
      ...userClean
    } = updatedUser;
    return res.json({ user: userClean });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    return res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

export default router;