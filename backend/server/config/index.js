// backend/server/config/index.js
// Este arquivo configura o servidor Express, incluindo rotas, middleware, limites de taxa e validações de segurança.

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from '../routes/auth.js';
import entityRoutes from '../routes/entities.js';
import grammarRoutes from '../routes/grammar.js';
import uploadRoutes from '../routes/upload.js';
import { authLimiter, apiLimiter } from '../middleware/rateLimiter.js';

dotenv.config();

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

// Configuração recomendada caso o servidor rode atrás de um proxy reverso (Nginx, Cloudflare, Heroku, Render)
app.set('trust proxy', 1);

// Libera requisições de qualquer porta vinda do localhost
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado pelo CORS'));
    }
  },
  credentials: true // Permite o envio e recebimento de cookies HTTP-Only
}));

app.use(express.json());
app.use(cookieParser()); // Middleware essencial para interpretar req.cookies

// Servir pasta de uploads publicamente para acesso aos arquivos
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Aplicação do Rate Limiter Geral nas rotas genéricas da API
app.use('/api', apiLimiter);

// Aplicação do Rate Limiter Estrito nas rotas de autenticação
app.use('/api/auth', authLimiter, authRoutes);

// Demais rotas da API
app.use('/api', entityRoutes);
app.use('/api/grammar', grammarRoutes);
app.use('/api', uploadRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});