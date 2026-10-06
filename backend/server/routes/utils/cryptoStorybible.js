// backend/server/routes/utils/cryptoStorybible.js
// Utilitário de criptografia simétrica autenticada (AES-256-GCM) com KDF (PBKDF2 Assíncrono) e Salt individual por arquivo .stfg

import crypto from 'crypto';
import { promisify } from 'util';

const pbkdf2Async = promisify(crypto.pbkdf2);

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits / 12 bytes (padrão NIST para GCM)
const AUTH_TAG_LENGTH = 16; // 128 bits / 16 bytes
const SALT_LENGTH = 16; // 128 bits para derivação de chave por arquivo
const PBKDF2_ITERATIONS = 210000; // Padrão OWASP (PBKDF2-HMAC-SHA256)
const KEY_LENGTH = 32; // 256 bits
const MAX_PAYLOAD_SIZE_BYTES = 50 * 1024 * 1024; // Limite de 50MB para prevenção de DoS

const HEX_REGEX = /^[0-9a-fA-F]+$/;

// Obtém a chave secreta mestra a partir das variáveis de ambiente
const SECRET_KEY = process.env.STFG_SECRET_KEY || process.env.STORYBIBLE_SECRET_KEY;

// Bloqueio estrito (Fail-Fast) em produção se a chave mestra não estiver configurada
if (!SECRET_KEY) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[SECURITY FATAL] A variável de ambiente STFG_SECRET_KEY é obrigatória em produção.');
  } else {
    console.warn('[SECURITY WARNING] Variável STFG_SECRET_KEY não definida em ambiente de desenvolvimento.');
  }
}

const SAFE_SECRET = SECRET_KEY || 'storyforge_dev_secret_key_minimum_32_bytes_length!';

if (SAFE_SECRET.length < 32) {
  throw new Error('[SECURITY FATAL] A chave secreta mestra (STFG_SECRET_KEY) deve ter no mínimo 32 caracteres.');
}

/**
 * Deriva uma chave criptográfica forte de 256 bits usando PBKDF2-SHA256 de forma assíncrona.
 * @param {Buffer} saltBuffer
 * @returns {Promise<Buffer>} Chave derivada de 32 bytes
 */
async function deriveKey(saltBuffer) {
  return await pbkdf2Async(
    SAFE_SECRET,
    saltBuffer,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );
}

/**
 * Valida estritamente se uma string é um hexadecimal válido de determinado tamanho de bytes.
 * @param {string} str
 * @param {number} expectedBytes
 * @returns {boolean}
 */
function isValidHex(str, expectedBytes) {
  return (
    typeof str === 'string' &&
    str.length === expectedBytes * 2 &&
    HEX_REGEX.test(str)
  );
}

/**
 * Criptografa qualquer objeto de dados usando AES-256-GCM com Salt e PBKDF2 Assíncrono.
 * @param {Object} dataObject - Dados sensíveis a serem criptografados
 * @returns {Promise<{ salt: string, iv: string, authTag: string, encryptedData: string }>} Payload cifrado
 */
export async function encryptStorybible(dataObject) {
  let key;
  try {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    key = await deriveKey(salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const jsonString = JSON.stringify(dataObject);
    const encrypted = Buffer.concat([cipher.update(jsonString, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      encryptedData: encrypted.toString('base64'),
    };
  } finally {
    if (key && Buffer.isBuffer(key)) {
      key.fill(0); // CORREÇÃO: Limpeza de memória do Buffer da chave derivada
    }
  }
}

/**
 * Descriptografa e valida a integridade de um pacote criptografado com AES-256-GCM.
 * @param {Object|string|Buffer} encryptedPackage
 * @returns {Promise<Object>} Dados originais descriptografados
 */
export async function decryptStorybible(encryptedPackage) {
  let key;
  try {
    let pkg = encryptedPackage;

    // CORREÇÃO: Validação de tamanho no payload cru ANTES de executar JSON.parse()
    if (typeof pkg === 'string' || Buffer.isBuffer(pkg)) {
      const rawLength = Buffer.isBuffer(pkg) ? pkg.length : Buffer.byteLength(pkg, 'utf8');
      if (rawLength > MAX_PAYLOAD_SIZE_BYTES) {
        throw new Error('Tamanho do arquivo excede o limite máximo permitido.');
      }
      pkg = JSON.parse(pkg.toString('utf8'));
    }

    const { salt, iv, authTag, encryptedData } = pkg || {};

    if (
      typeof salt !== 'string' ||
      typeof iv !== 'string' ||
      typeof authTag !== 'string' ||
      typeof encryptedData !== 'string'
    ) {
      throw new Error('Metadados de criptografia ausentes ou em formato inválido.');
    }

    // CORREÇÃO: Validação rigorosa do formato Hexadecimal
    if (!isValidHex(salt, SALT_LENGTH)) {
      throw new Error('Parâmetro Salt em formato incorreto.');
    }
    if (!isValidHex(iv, IV_LENGTH)) {
      throw new Error('Parâmetro IV em formato incorreto.');
    }
    if (!isValidHex(authTag, AUTH_TAG_LENGTH)) {
      throw new Error('Parâmetro AuthTag em formato incorreto.');
    }

    const encryptedBuffer = Buffer.from(encryptedData, 'base64');
    if (encryptedBuffer.length > MAX_PAYLOAD_SIZE_BYTES) {
      throw new Error('Tamanho dos dados criptografados excede o limite.');
    }

    const saltBuffer = Buffer.from(salt, 'hex');
    key = await deriveKey(saltBuffer);

    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    const decryptedBuffer = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final(),
    ]);

    return JSON.parse(decryptedBuffer.toString('utf8'));
  } catch (err) {
    throw new Error('Falha na autenticação ou arquivo .stfg corrompido/inválido.');
  } finally {
    if (key && Buffer.isBuffer(key)) {
      key.fill(0); // CORREÇÃO: Limpeza de memória do Buffer da chave derivada
    }
  }
}