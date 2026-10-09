// backend/server/middleware/rateLimiter.js
// Middlewares de limitação de taxa (Rate Limiting) otimizados para segurança e usabilidade fluida

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import jwt from 'jsonwebtoken';

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

// Extrai o ID do Usuário do Cookie HttpOnly ou Header Authorization antes do tratamento das rotas
const extractUserIdQuietly = (req) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    }

    if (token) {
      const cleanToken = token.replace('token_seguro_', '').trim();
      const JWT_SECRET = process.env.JWT_SECRET || 'storyforge_jwt_secret_key_mestra_ultra_segura_2026';
      
      try {
        const decoded = jwt.verify(cleanToken, JWT_SECRET);
        return decoded.userId || cleanToken;
      } catch {
        return cleanToken; // Fallback caso não seja JWT assinado
      }
    }
  } catch {
    // Ignora erros silenciosamente para fallback no IP
  }
  return null;
};

// Helper para gerenciar chave individualizada por usuário autenticado ou IP
const userOrIpKeyGenerator = (req) => {
  const userId = req.userId || extractUserIdQuietly(req);
  return userId ? `user_${userId}` : req.ip;
};

// Desativa o aviso estrito de validação IPv6 do express-rate-limit v7+
const customKeyGenValidation = { keyGeneratorIpFallback: false };

// ==========================================
// 1. LIMITER DE AUTENTICAÇÃO (LOGIN E CADASTRO)
// ==========================================
// Máximo de 10 tentativas por IP a cada 15 minutos (Proteção contra força bruta)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 10,                 // 10 tentativas
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
// Máximo de 5 solicitações a cada 1 hora
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  limit: 5,                  // Máximo de 5 solicitações
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
// Máximo de 180 requisições por minuto por usuário (3 por segundo, ideal para escrita em tempo real)
export const grammarLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  limit: 180,              // Permite revisão contínua durante a digitação
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store,
  keyGenerator: userOrIpKeyGenerator,
  validate: customKeyGenValidation,
  message: {
    error: 'Limite de checagens gramaticais atingido. Aguarde alguns segundos antes de continuar digitando.',
  },
});

// ==========================================
// 4. LIMITER GERAL DA API (PROTEÇÃO DOS SEM DESLOGAR USUÁRIOS)
// ==========================================
// Máximo de 1500 requisições a cada 15 minutos (~100 req/minuto por usuário)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 1500,               // Cota ampla para navegação, salvamento automático e edição
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store,
  keyGenerator: userOrIpKeyGenerator,
  validate: customKeyGenValidation,
  // Isola rotas essenciais de sessão e gramática para NUNCA ejetar o usuário
  skip: (req) => {
    const url = req.originalUrl || req.url;
    return (
      url.includes('/auth/me') ||
      url.includes('/grammar-check') ||
      url.includes('/grammar')
    );
  },
  message: {
    error: 'Muitas requisições enviadas em curto período. Aguarde alguns segundos.',
  },
});