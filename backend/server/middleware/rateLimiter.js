// backend/server/middleware/rateLimiter.js
// Middlewares de limitação de taxa (Rate Limiting) contra ataques de força bruta, DoS e abuso de API

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

// ==========================================
// CONFIGURAÇÃO DO REDIS STORE (COM FALLBACK)
// ==========================================
let store;

if (process.env.REDIS_URL) {
  try {
    const redisClient = createClient({ url: process.env.REDIS_URL });
    
    redisClient.on('error', (err) => {
      console.error('[RATE LIMITER WARNING] Erro no cliente Redis:', err.message);
    });

    redisClient.connect().catch((err) => {
      console.error('[RATE LIMITER WARNING] Falha ao conectar ao Redis, usando MemoryStore em fallback:', err.message);
    });

    store = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    });
    console.log('[RATE LIMITER] Redis Store ativado com sucesso.');
  } catch (err) {
    console.warn('[RATE LIMITER WARNING] Erro na inicialização do Redis. Usando MemoryStore padrão.');
    store = undefined;
  }
}

// Helper para chave baseada em Usuário Autenticado ou IP
const userOrIpKeyGenerator = (req) => {
  return req.userId ? `user_${req.userId}` : req.ip;
};

// Desativa o aviso estrito de validação IPv6 do express-rate-limit v7+ para keyGenerators customizados
const customKeyGenValidation = { keyGeneratorIpFallback: false };

// ==========================================
// 1. LIMITER DE AUTENTICAÇÃO (LOGIN E CADASTRO)
// ==========================================
// Máximo de 5 tentativas por IP a cada 15 minutos
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 5,                  // Máximo de 5 tentativas
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store,
  message: {
    error: 'Muitas tentativas de acesso. Por razões de segurança, este IP foi temporariamente bloqueado. Tente novamente em 15 minutos.',
  },
});

// ==========================================
// 2. LIMITER DE RECUPERAÇÃO E REDEFINIÇÃO DE SENHA
// ==========================================
// Máximo de 3 solicitações a cada 1 hora
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  limit: 3,                 // Máximo de 3 solicitações
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store,
  keyGenerator: userOrIpKeyGenerator,
  validate: customKeyGenValidation,
  message: {
    error: 'Limite de solicitações de redefinição de senha atingido. Aguarde 1 hora antes de tentar novamente.',
  },
});

// ==========================================
// 3. LIMITER DE ANÁLISE GRAMATICAL (LANGUAGETOOL)
// ==========================================
// Máximo de 30 requisições por minuto por usuário autenticado (ou IP)
export const grammarLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  limit: 120,              // Permite revisão contínua durante a digitação
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store,
  keyGenerator: userOrIpKeyGenerator,
  validate: customKeyGenValidation,
  message: {
    error: 'Limite de checagens gramaticais atingido (máximo 120 por minuto). Aguarde um instante.',
  },
});

// ==========================================
// 4. LIMITER GERAL DA API (PROTEÇÃO CONTRA DOS)
// ==========================================
// Máximo de 300 requisições por IP a cada 15 minutos
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 300,                // Máximo de 300 requisições
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store,
  skip: (req) => req.originalUrl.startsWith('/api/entities/grammar-check') || req.originalUrl.startsWith('/api/grammar/'),
  message: {
    error: 'Muitas requisições enviadas. Por favor, aguarde alguns minutos antes de tentar novamente.',
  },
});