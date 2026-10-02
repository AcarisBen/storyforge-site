// backend/server/middleware/rateLimiter.js
// Middleware para mitigação de ataques de força bruta utilizando express-rate-limit

import rateLimit from 'express-rate-limit';

// Limite estrito para rotas sensíveis de autenticação (login, registro, recuperação de senha)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Janela de 15 minutos
  limit: 10,                 // Máximo de 10 tentativas por IP a cada 15 minutos
  standardHeaders: 'draft-7', // Cabeçalhos padrão 'RateLimit-*'
  legacyHeaders: false,      // Desativa cabeçalhos legados 'X-RateLimit-*'
  message: {
    error: 'Muitas tentativas de acesso. Por razões de segurança, este IP foi temporariamente bloqueado. Tente novamente em 15 minutos.'
  }
});

// Limite geral para mitigação de DoS nas demais rotas da API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Janela de 15 minutos
  limit: 300,                // Máximo de 300 requisições por IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Muitas requisições enviadas. Por favor, aguarde alguns minutos antes de tentar novamente.'
  }
});