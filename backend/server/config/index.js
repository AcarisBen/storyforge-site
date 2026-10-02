// backend/server/config/index.js
// Este arquivo configura o servidor Express, incluindo rotas, middleware e validações de segurança. Ele garante que o JWT_SECRET esteja definido corretamente e inicializa as rotas de autenticação, entidades e gramática.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from '../routes/auth.js';
import entityRoutes from '../routes/entities.js';
import grammarRoutes from '../routes/grammar.js';

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

// Libera requisições de qualquer porta vinda do localhost
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado pelo CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', entityRoutes);
app.use('/api/grammar', grammarRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});