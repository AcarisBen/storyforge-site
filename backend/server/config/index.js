// backend/server/config/index.js
// Este arquivo configura o servidor Express, incluindo rotas, middleware e validações de segurança.

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path'; // 1. Importação do módulo path necessária

import authRoutes from '../routes/auth.js';
import entityRoutes from '../routes/entities.js';
import grammarRoutes from '../routes/grammar.js';
import uploadRoutes from '../routes/upload.js';

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

// 2. Criação da instância do Express antes do uso dos middlewares
const app = express();

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

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api', entityRoutes);
app.use('/api/grammar', grammarRoutes);
app.use('/api', uploadRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});