// backend/server/routes/auth.js
// Rotas de Autenticação com Hashing Bcrypt, JWT Assinado, Cookies HttpOnly e Validação MX

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

// URL base e Chave Secreta JWT
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'storyforge_jwt_secret_key_mestra_ultra_segura_2026';

// ==========================================
// CONFIGURAÇÕES DE SEGURANÇA DE COOKIE
// ==========================================
const COOKIE_OPTIONS = {
  httpOnly: true, // Proteção contra XSS
  secure: process.env.NODE_ENV === 'production', // Requer HTTPS em produção
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
};

// Helper: Extrair e verificar JWT assinado (Cookie HttpOnly ou Header Authorization)
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
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (err) {
    return null; // Token inválido, adulterado ou expirado
  }
};

// Transporter do Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'app.storyforge@gmail.com',
    pass: process.env.EMAIL_PASS || 'suasenhadeaplicativo',
  },
});

// Helper: Validação de Senha Forte
function isStrongPassword(password) {
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

// 1. POST /api/auth/register (Cadastro & Envio de Confirmação com Hash de Senha)
router.post('/register', async (req, res) => {
  try {
    const { fullName, writerName, email, password } = req.body;

    if (!fullName || !writerName || !email || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
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

    // Gera hash BCRYPT da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    const confirmToken = crypto.randomBytes(32).toString('hex');
    const tokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          fullName,
          writerName,
          name: writerName,
          password: hashedPassword,
          isVerified: false,
          verificationToken: confirmToken,
          verificationTokenExp: tokenExp,
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
          verificationToken: confirmToken,
          verificationTokenExp: tokenExp,
        },
      });
    }

    const confirmationLink = `${FRONTEND_URL}/?confirmToken=${confirmToken}`;

    const mailOptions = {
      from: `"StoryForge" <${process.env.EMAIL_USER || 'app.storyforge@gmail.com'}>`,
      to: cleanEmail,
      subject: '🔨 Confirme seu e-mail — StoryForge',
      html: getConfirmationEmailHTML(writerName || fullName, confirmationLink),
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: 'Link de confirmação enviado! Verifique sua caixa de entrada para ativar a conta.',
    });
  } catch (err) {
    console.error('Erro no registro:', err);
    return res.status(500).json({ message: 'Erro interno ao cadastrar usuário.' });
  }
});

// 2. POST /api/auth/confirm-email
router.post('/confirm-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token de verificação ausente.' });

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return res.status(400).json({ message: 'Link de verificação inválido ou já utilizado.' });
    }

    if (user.verificationTokenExp && user.verificationTokenExp < new Date()) {
      return res.status(400).json({ message: 'O link de verificação expirou. Faça o cadastro novamente.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExp: null,
      },
    });

    return res.status(200).json({ message: 'E-mail verificado com sucesso! Sua conta está ativa.' });
  } catch (err) {
    console.error('Erro na verificação de e-mail:', err);
    return res.status(500).json({ message: 'Erro ao validar e-mail.' });
  }
});

// 3. POST /api/auth/login (Autenticação Bcrypt e Emissão de JWT)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email?.toLowerCase().trim();

    if (!cleanEmail || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    // Verificação de senha com Bcrypt
    const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isPasswordValid) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Sua conta ainda não foi ativada. Verifique o link enviado para o seu e-mail.',
      });
    }

    // Geração de JWT assinado
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, COOKIE_OPTIONS);

    const { password: _, verificationToken: __, resetToken: ___, deleteToken: ____, ...userClean } = user;

    return res.status(200).json({ token, user: userClean });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ message: 'Erro interno no login.' });
  }
});

// 4. POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  return res.status(200).json({ message: 'Sessão encerrada com sucesso.' });
});

// 5. GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const userId = extractUserId(req);
    if (!userId) return res.status(401).json({ message: 'Não autorizado' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ message: 'Sessão inválida' });

    const { password: _, verificationToken: __, resetToken: ___, deleteToken: ____, ...userClean } = user;
    return res.status(200).json({ user: userClean });
  } catch (err) {
    return res.status(401).json({ message: 'Erro ao obter sessão' });
  }
});

// 6. POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Informe o seu e-mail.' });

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      return res.status(200).json({ message: 'Se o e-mail estiver cadastrado, enviamos o link de redefinição.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExp = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    });

    const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"StoryForge" <${process.env.EMAIL_USER || 'app.storyforge@gmail.com'}>`,
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

// 7. POST /api/auth/reset-password (Com Bcrypt)
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token e nova senha são obrigatórios.' });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message: 'A senha deve conter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e pelo menos um caractere especial.',
      });
    }

    const user = await prisma.user.findFirst({
      where: { resetToken: token },
    });

    if (!user) {
      return res.status(400).json({ message: 'Link de redefinição inválido ou expirado.' });
    }

    if (user.resetTokenExp && user.resetTokenExp < new Date()) {
      return res.status(400).json({ message: 'Este link de redefinição expirou. Solicite um novo.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    return res.status(200).json({ message: 'Senha alterada com sucesso! Você já pode fazer login.' });
  } catch (err) {
    console.error('Erro no reset-password:', err);
    return res.status(500).json({ message: 'Erro ao atualizar a senha.' });
  }
});

// 8. PUT /api/auth/change-password (Com Bcrypt)
router.put('/change-password', async (req, res) => {
  try {
    const userId = extractUserId(req);
    if (!userId) return res.status(401).json({ message: 'Não autorizado.' });

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
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

// 9. POST /api/auth/request-delete
router.post('/request-delete', async (req, res) => {
  try {
    const userId = extractUserId(req);
    if (!userId) return res.status(401).json({ message: 'Não autorizado.' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const deleteToken = crypto.randomBytes(32).toString('hex');
    const deleteTokenExp = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { deleteToken, deleteTokenExp },
    });

    const deleteLink = `${FRONTEND_URL}/?deleteToken=${deleteToken}`;

    const mailOptions = {
      from: `"StoryForge" <${process.env.EMAIL_USER || 'app.storyforge@gmail.com'}>`,
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

// 10. POST /api/auth/confirm-delete
router.post('/confirm-delete', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token de exclusão ausente.' });

    const user = await prisma.user.findFirst({
      where: { deleteToken: token },
    });

    if (!user) {
      return res.status(400).json({ message: 'Link de exclusão inválido ou já utilizado.' });
    }

    if (user.deleteTokenExp && user.deleteTokenExp < new Date()) {
      return res.status(400).json({ message: 'Este link de exclusão expirou.' });
    }

    await prisma.user.delete({ where: { id: user.id } });

    res.clearCookie('token', COOKIE_OPTIONS);

    return res.status(200).json({ message: 'Sua conta e todos os seus projetos foram excluídos permanentemente.' });
  } catch (err) {
    console.error('Erro no confirm-delete:', err);
    return res.status(500).json({ message: 'Erro ao excluir a conta.' });
  }
});

// 11. PUT /api/auth/profile
router.put('/profile', async (req, res) => {
  try {
    const userId = extractUserId(req);
    if (!userId) return res.status(401).json({ error: 'Não autorizado' });

    const { name } = req.body;

    if (!name || !name.trim()) {
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

    const { password: _, verificationToken: __, resetToken: ___, deleteToken: ____, ...userClean } = updatedUser;
    return res.json({ user: userClean });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    return res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

export default router;