// backend/server/config/index.js

import express from 'express';
import cors from 'cors';

import authRoutes from '../routes/auth.js';
import entityRoutes from '../routes/entities.js';

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});