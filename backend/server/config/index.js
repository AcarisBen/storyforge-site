import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from '../routes/auth.js';
import entitiesRoutes from '../routes/entities.js';
import uploadRoutes from '../routes/upload.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Registro de Rotas da Aplicação
app.use('/api/auth', authRoutes);
app.use('/api/entities', entitiesRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send('Servidor StoryForge Operacional');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando com sucesso na porta ${PORT}`);
});