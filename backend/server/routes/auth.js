// backend/server/routes/auth.js

import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { getConfirmationEmailHTML } from './utils/emailTemplate.js';

const router = express.Router();

const users = [];
const verificationTokens = new Map();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'seuemail@gmail.com',
    pass: process.env.EMAIL_PASS || 'suasenhadeaplicativo',
  },
});

// POST /api/auth/register (Cadastro / Reenvio de Ativação)
router.post('/register', async (req, res) => {
  try {
    const { fullName, writerName, email, password } = req.body;

    if (!fullName || !writerName || !email || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = users.find((u) => u.email === cleanEmail);

    // 1. SE O USUÁRIO JÁ EXISTE E JÁ FOI VERIFICADO
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'Este e-mail já está cadastrado e ativo. Faça login.' });
    }

    // 2. SE O USUÁRIO JÁ EXISTE MAS NÃO FOI VERIFICADO (OU É NOVO)
    let userToProcess = existingUser;

    if (!userToProcess) {
      userToProcess = {
        id: Date.now().toString(),
        fullName,
        writerName,
        email: cleanEmail,
        password,
        isVerified: false,
        createdAt: new Date(),
      };
      users.push(userToProcess);
    } else {
      // Atualiza os dados/senha caso o usuário tente se cadastrar novamente
      userToProcess.fullName = fullName;
      userToProcess.writerName = writerName;
      userToProcess.password = password;
    }

    // 3. GERA UM NOVO TOKEN E VINCULA AO E-MAIL
    const confirmToken = crypto.randomBytes(32).toString('hex');
    verificationTokens.set(confirmToken, cleanEmail);

    const confirmationLink = `http://localhost:5173/?confirmToken=${confirmToken}`;

    const mailOptions = {
      from: `"StoryForge" <${process.env.EMAIL_USER || 'suporte@storyforge.com.br'}>`,
      to: cleanEmail,
      subject: '🔮 Confirme seu e-mail — StoryForge',
      html: getConfirmationEmailHTML(writerName || fullName, confirmationLink),
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.log(`\n📧 [FALLBACK DEV] Novo link de ativação: ${confirmationLink}\n`);
    }

    return res.status(200).json({
      message: 'Link de confirmação gerado! Verifique seu e-mail ou o terminal para ativar.',
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro interno ao cadastrar.' });
  }
});

// POST /api/auth/confirm-email (Ativa a conta 1 única vez)
router.post('/confirm-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || !verificationTokens.has(token)) {
      return res.status(400).json({ message: 'Link de verificação inválido ou expirado.' });
    }

    const email = verificationTokens.get(token);
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    user.isVerified = true;
    verificationTokens.delete(token);

    return res.status(200).json({
      message: 'E-mail verificado com sucesso! Sua conta está ativa.',
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao validar e-mail.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email?.toLowerCase().trim();

    const user = users.find((u) => u.email === cleanEmail);

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Sua conta ainda não foi ativada. Verifique o link enviado para o seu e-mail.',
      });
    }

    const token = `token_seguro_${user.id}`;
    const { password: _, ...userClean } = user;

    return res.status(200).json({ token, user: userClean });
  } catch (err) {
    return res.status(500).json({ message: 'Erro interno no login.' });
  }
});

// GET /api/auth/me (Restaura a sessão automaticamente ao atualizar a página)
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Não autorizado' });

  const token = authHeader.split(' ')[1];
  const userId = token?.replace('token_seguro_', '');
  const user = users.find((u) => u.id === userId);

  if (!user) return res.status(401).json({ message: 'Sessão inválida' });

  const { password: _, ...userClean } = user;
  return res.status(200).json({ user: userClean });
});

export default router;