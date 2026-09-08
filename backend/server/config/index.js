// backend/server/config/index.js


import express from 'express';
import cors from 'cors';

import authRoutes from '../routes/auth.js';
import entityRoutes from '../routes/entities.js';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', entityRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});