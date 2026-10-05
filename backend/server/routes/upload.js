// backend/server/routes/upload.js
// Rota de upload de arquivos com proteção por autenticação JWT e validação de Magic Bytes

import express from 'express';
import { upload, validateMagicBytes } from '../middleware/upload.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Aplica requireAuth + Multer + Validação de Magic Bytes encadeada
router.post('/upload', requireAuth, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
    }
    next();
  });
}, validateMagicBytes, (req, res) => {
  return res.status(200).json({
    message: 'Arquivo enviado e verificado com sucesso.',
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
    url: `/uploads/${req.file.filename}`
  });
});

export default router;