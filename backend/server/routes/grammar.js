// backend/server/routes/grammar.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

// Endpoint isolado para revisão gramatical
router.post('/check', async (req, res) => {
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