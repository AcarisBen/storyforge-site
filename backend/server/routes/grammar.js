// backend/server/routes/grammar.js
// Este arquivo contém rotas para análise gramatical e ortográfica de textos em português, utilizando o motor LanguageTool. Ele fornece endpoints para verificar a gramática, ortografia e estilo de escrita, retornando sugestões de correção e melhorias.

import express from 'express';
import axios from 'axios';
import { requireAuth } from '../middleware/auth.js';
import { grammarLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Endpoint isolado para revisão gramatical
router.post('/check', requireAuth, grammarLimiter, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ matches: [] });
    }

    // Requisição interna direta ao motor LanguageTool local
    const params = new URLSearchParams();
    params.append('text', text);
    params.append('language', 'pt-BR');

    const ltResponse = await axios.post('http://localhost:8010/v2/check', params);
    
    return res.json(ltResponse.data);
  } catch (error) {
    console.error('Erro na conexão privada com o LanguageTool:', error.message);
    return res.status(500).json({ error: 'Servidor de revisão gramatical indisponível.' });
  }
});

export default router;