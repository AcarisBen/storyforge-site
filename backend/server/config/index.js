// backend/server/config/index.js
// Configuração central do servidor Express, rotas, middlewares e segurança

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import helmet from 'helmet';

import authRoutes from '../routes/auth.js';
import entityRoutes from '../routes/entities.js';
import grammarRoutes from '../routes/grammar.js';
import uploadRoutes from '../routes/upload.js';
import supportRoutes from '../routes/support.js';

import { 
  apiLimiter, 
  authLimiter, 
  passwordResetLimiter
} from '../middleware/rateLimiter.js';

// ==========================================
// VALIDAÇÃO CRÍTICA DE SEGURANÇA (JWT_SECRET)
// ==========================================
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.trim().length < 32 || JWT_SECRET === 'secret123') {
  console.error('\x1b[31m%s\x1b[0m', '=======================================================');
  console.error('\x1b[31m%s\x1b[0m', '[ERRO FATAL DE SEGURANÇA] JWT_SECRET precisa ter pelo menos 32 caracteres.');
  console.error('\x1b[31m%s\x1b[0m', 'Defina uma chave secreta forte para JWT_SECRET no ambiente do servidor.');
  console.error('\x1b[31m%s\x1b[0m', 'A aplicação foi interrompida para evitar vulnerabilidades.');
  console.error('\x1b[31m%s\x1b[0m', '=======================================================');
  process.exit(1);
}

const app = express();

const trustedProxyHops = Number.parseInt(process.env.TRUST_PROXY_HOPS || '0', 10);
if (!Number.isInteger(trustedProxyHops) || trustedProxyHops < 0) {
  throw new Error('TRUST_PROXY_HOPS deve ser um inteiro maior ou igual a zero.');
}
app.set('trust proxy', trustedProxyHops);

// ==========================================
// MIDDLEWARES DE SEGURANÇA (HELMET & CSP)
// ==========================================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

const FRONTEND_URL = process.env.FRONTEND_URL;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && (!FRONTEND_URL || !FRONTEND_URL.startsWith('https://'))) {
  throw new Error('FRONTEND_URL HTTPS é obrigatória em produção.');
}

// Configuração de CORS para desenvolvimento e produção
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin || 
      (!isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) ||
      (FRONTEND_URL && origin === FRONTEND_URL)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado pelo CORS'));
    }
  },
  credentials: true // Permite envio/recebimento de cookies HttpOnly
}));

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser()); // Middleware essencial para interpretar req.cookies

// Servir pasta de uploads publicamente
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// ==========================================
// CONFIGURAÇÃO DOS RATE LIMITERS (PROTEÇÃO DOS)
// ==========================================

// 1. Limite geral da API (máximo 300 requisições por IP a cada 15 min)
app.use('/api', apiLimiter);

// 2. Limite estrito de Login e Cadastro (máximo 5 tentativas a cada 15 min)
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 3. Limite estrito de Redefinição de Senha (máximo 3 solicitações por hora)
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth/reset-password', passwordResetLimiter);

// ==========================================
// MONTAGEM DAS ROTAS DA APLICAÇÃO
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api', entityRoutes);
app.use('/api/grammar', grammarRoutes);
app.use('/api', uploadRoutes);
app.use('/api', supportRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof multer.MulterError || error.message?.includes('Unexpected field')) {
    return res.status(400).json({ error: 'O arquivo enviado é inválido ou excede os limites permitidos.' });
  }
  if (error.message === 'Bloqueado pelo CORS') {
    return res.status(403).json({ error: 'Origem não autorizada.' });
  }
  console.error('Erro não tratado na API:', error.message);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});