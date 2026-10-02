// backend/server/routes/upload.js
// Rota de upload de arquivos com proteção por autenticação JWT (HttpOnly Cookie) e middleware Multer

import express from 'express';
import { upload } from '../middleware/upload.js';
import { requireAuth } from '../middleware/auth.js'; // Importação do middleware de autenticação

const router = express.Router();

// Aplica requireAuth para garantir que apenas usuários autenticados realizem uploads
router.post('/upload', requireAuth, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      // Captura erros de validação do filtro, tamanho limite ou extensão
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
    }

    return res.status(200).json({
      message: 'Arquivo enviado com sucesso.',
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/${req.file.filename}`
    });
  });
});

export default router;