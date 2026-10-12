// backend/server/routes/support.js
// Este arquivo contém rotas para suporte e envio de relatórios de bugs, incluindo captura de screenshots e envio de e-mails para a equipe de suporte.

import express from 'express';
import nodemailer from 'nodemailer';
import multer from 'multer';
import prisma from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { supportLimiter } from '../middleware/rateLimiter.js';
import { getBugReportEmailHTML, getIdeaSuggestionEmailHTML } from './utils/emailTemplate.js';

const router = express.Router();

// Configura o multer em memória para capturar o anexo (screenshot) temporariamente
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 1, fieldSize: 64 * 1024, parts: 2 },
});

const getImageMimeFromSignature = (file) => {
  const bytes = file.buffer;
  const isPng = bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isWebp = bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (isPng) return 'image/png';
  if (isJpeg) return 'image/jpeg';
  if (isWebp) return 'image/webp';
  return null;
};

// Configura o transportador SMTP usando as variáveis do .env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ CORREÇÃO: Altere o caminho para '/support/report-bug'
router.post('/support/report-bug', requireAuth, supportLimiter, upload.single('screenshot'), async (req, res) => {
  try {
    let payload = {};
    if (req.body.data) {
      payload = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
    } else {
      payload = req.body;
    }

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return res.status(400).json({ message: 'Os dados do relatório são inválidos.' });
    }

    const { module, bugType, description } = payload;

    if (typeof description !== 'string' || !description.trim() || description.length > 12000) {
      return res.status(400).json({ message: 'A descrição do erro é obrigatória.' });
    }

    const imageMime = req.file ? getImageMimeFromSignature(req.file) : null;
    if (req.file && (!imageMime || req.file.mimetype !== imageMime)) {
      return res.status(400).json({ message: 'O anexo não corresponde a uma imagem PNG, JPEG ou WebP válida.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, fullName: true, writerName: true, name: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Sessão inválida ou não autorizada.' });
    }

    payload.userEmail = user.email;
    payload.userId = user.id;
    payload.userName = user.writerName || user.fullName || user.name || 'Autor';

    // Processa o anexo do print/screenshot caso enviado
    const attachments = [];
    if (req.file) {
      attachments.push({
        filename: imageMime === 'image/png' ? 'screenshot.png' : imageMime === 'image/webp' ? 'screenshot.webp' : 'screenshot.jpg',
        content: req.file.buffer,
        contentType: imageMime,
      });
    }

    // Configura o e-mail de destino
    const mailOptions = {
      from: `"StoryForge Support" <${process.env.EMAIL_USER}>`,
      to: 'app.storyforge@gmail.com',
      replyTo: user.email,
      subject: `[BUG REPORT] ${String(module || 'Geral').replace(/[\r\n]+/g, ' ').slice(0, 80)} - ${String(bugType || 'Erro registrado').replace(/[\r\n]+/g, ' ').slice(0, 80)}`,
      html: getBugReportEmailHTML(payload),
      attachments,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Diagnóstico enviado com sucesso. Nossa equipe analisará as informações.',
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail de report de bug:', error);
    return res.status(500).json({
      message: 'Falha ao processar o envio do diagnóstico. Tente novamente mais tarde.',
    });
  }
});

router.post('/support/suggest-idea', requireAuth, supportLimiter, async (req, res) => {
  try {
    const { category, title, description, benefit, currentUrl, userAgent } = req.body;

    if (typeof title !== 'string' || !title.trim() || title.length > 160) {
      return res.status(400).json({ message: 'Informe um título de até 160 caracteres.' });
    }
    if (typeof description !== 'string' || !description.trim() || description.length > 6000) {
      return res.status(400).json({ message: 'Descreva a ideia em até 6000 caracteres.' });
    }
    if (typeof benefit === 'string' && benefit.length > 2000) {
      return res.status(400).json({ message: 'O campo de benefício deve ter até 2000 caracteres.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, fullName: true, writerName: true, name: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Sessão inválida ou não autorizada.' });
    }

    const payload = {
      category: typeof category === 'string' ? category.slice(0, 80) : 'Outra melhoria',
      title: title.trim(),
      description: description.trim(),
      benefit: typeof benefit === 'string' ? benefit.trim() : '',
      currentUrl: typeof currentUrl === 'string' ? currentUrl.slice(0, 1000) : '',
      userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 500) : '',
      userEmail: user.email,
      userId: user.id,
      userName: user.writerName || user.fullName || user.name || 'Autor',
      timestamp: new Date().toISOString(),
    };

    await transporter.sendMail({
      from: `"StoryForge Ideas" <${process.env.EMAIL_USER}>`,
      to: 'app.storyforge@gmail.com',
      replyTo: user.email,
      subject: `[SUGESTÃO] ${payload.category} - ${payload.title.replace(/[\r\n]+/g, ' ').slice(0, 160)}`,
      html: getIdeaSuggestionEmailHTML(payload),
    });

    return res.status(200).json({
      success: true,
      message: 'Sugestão enviada com sucesso. Obrigado por ajudar a melhorar o StoryForge.',
    });
  } catch (error) {
    console.error('Erro ao enviar sugestão de ideia:', error);
    return res.status(500).json({
      message: 'Não foi possível enviar a sugestão agora. Tente novamente mais tarde.',
    });
  }
});

export default router;