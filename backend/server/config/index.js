import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from '../routes/auth.js';
import entityRoutes from '../routes/entities.js';
import uploadRoutes from '../routes/upload.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Registro da rota de entidades (projetos, personagens, etc)
app.use('/api/entities', entityRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});