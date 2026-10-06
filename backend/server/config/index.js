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
import { 
  apiLimiter, 
  authLimiter, 
  passwordResetLimiter
} from '../middleware/rateLimiter.js';

// ==========================================
// VALIDAÇÃO CRÍTICA DE SEGURANÇA (JWT_SECRET)
// ==========================================
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.trim() === '' || JWT_SECRET === 'secret123') {
  console.error('\x1b[31m%s\x1b[0m', '=======================================================');
  console.error('\x1b[31m%s\x1b[0m', '[ERRO FATAL DE SEGURANÇA] JWT_SECRET não está configurado!');
  console.error('\x1b[31m%s\x1b[0m', 'Defina uma chave secreta forte para JWT_SECRET no arquivo .env.');
  console.error('\x1b[31m%s\x1b[0m', 'A aplicação foi interrompida para evitar vulnerabilidades.');
  console.error('\x1b[31m%s\x1b[0m', '=======================================================');
  process.exit(1);
}

const app = express();

// Confia no primeiro proxy reverso (Nginx, Render, Heroku, Cloudflare) para extração do IP real
app.set('trust proxy', 1);

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

// Configuração de CORS para desenvolvimento e produção
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin || 
      origin.startsWith('http://localhost:') || 
      (FRONTEND_URL && origin === FRONTEND_URL)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado pelo CORS'));
    }
  },
  credentials: true // Permite envio/recebimento de cookies HttpOnly
}));

app.use(express.json());
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});