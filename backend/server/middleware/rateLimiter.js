// backend/server/middleware/rateLimiter.js
// Middlewares de limitação de taxa (Rate Limiting) otimizados para segurança e usabilidade fluida

import rateLimit, { ipKeyGenerator, MemoryStore } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import jwt from 'jsonwebtoken';

let redisClient;

if (process.env.REDIS_URL) {
  const client = createClient({
    url: process.env.REDIS_URL,
    socket: { connectTimeout: 5000, reconnectStrategy: false },
  });
  client.on('error', (err) => {
    console.error('[RATE LIMITER WARNING] Erro no cliente Redis:', err.message);
  });

  try {
    await client.connect();
    redisClient = client;
    console.log('[RATE LIMITER] Redis Store ativado.');
  } catch (err) {
    console.warn('[RATE LIMITER WARNING] Redis indisponível na inicialização; usando MemoryStore.', err.message);
    client.destroy();
  }
}

const createStore = (name) => redisClient
  ? (() => {
      const redisStore = new RedisStore({
        prefix: `storyforge:${name}:`,
        sendCommand: (...args) => redisClient.sendCommand(args),
      });
      const memoryStore = new MemoryStore();
      let redisEnabled = true;

      const useMemoryStore = (method) => async (...args) => {
        if (redisEnabled) {
          try {
            return await redisStore[method](...args);
          } catch (err) {
            redisEnabled = false;
            console.error(`[RATE LIMITER WARNING] Redis ${name} falhou; usando limite local até reiniciar:`, err.message);
          }
        }
        return memoryStore[method](...args);
      };

      return {
        prefix: `storyforge:${name}:`,
        localKeys: false,
        init(options) {
          memoryStore.init(options);
          return redisStore.init(options).catch((err) => {
            redisEnabled = false;
            console.warn(`[RATE LIMITER WARNING] Redis ${name} não inicializou; usando MemoryStore:`, err.message);
          });
        },
        get: useMemoryStore('get'),
        increment: useMemoryStore('increment'),
        decrement: useMemoryStore('decrement'),
        resetKey: useMemoryStore('resetKey'),
        shutdown() {
          memoryStore.shutdown();
        },
      };
    })()
  : undefined;

// Só associa limite a uma conta quando o token foi validado criptograficamente.
const extractUserIdQuietly = (req) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      return typeof decoded.userId === 'string' && decoded.userId.length > 0
        ? decoded.userId
        : null;
    }
  } catch {
    return null;
  }
  return null;
};

// Helper para gerenciar chave individualizada por usuário autenticado ou IP
const userOrIpKeyGenerator = (req) => {
  const userId = req.userId || extractUserIdQuietly(req);
  return userId ? `user_${userId}` : ipKeyGenerator(req.ip);
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
  store: createStore('auth'),
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
  store: createStore('password-reset'),
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
  store: createStore('grammar'),
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
  store: createStore('api'),
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

export const supportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: createStore('support'),
  keyGenerator: (req) => req.userId ? `user_${req.userId}` : ipKeyGenerator(req.ip),
  validate: customKeyGenValidation,
  message: { error: 'Limite de envios de suporte atingido. Tente novamente mais tarde.' },
});