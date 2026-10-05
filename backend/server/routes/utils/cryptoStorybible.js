// backend/server/routes/utils/cryptoStorybible.js
// Utilitário de criptografia simétrica autenticada (AES-256-GCM) para exportação/importação de arquivos .stfg

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits / 12 bytes (padrão NIST recomendado para GCM)
const AUTH_TAG_LENGTH = 16; // 128 bits / 16 bytes

const SECRET_KEY = process.env.STFG_SECRET_KEY || process.env.STORYBIBLE_SECRET_KEY || 'storyforge_chave_secreta_mestra_32_bytes!';

if (process.env.NODE_ENV === 'production' && SECRET_KEY.includes('storyforge_chave_secreta_mestra')) {
  console.warn('[SECURITY WARNING] Usando chave secreta padrão em ambiente de produção! Configure a variável STFG_SECRET_KEY.');
}

// Deriva uma chave mestre determinística de exatamente 32 bytes (256 bits) usando SHA-256
const KEY = crypto.createHash('sha256').update(SECRET_KEY).digest();

/**
 * Criptografa qualquer objeto de dados usando AES-256-GCM.
 * @param {Object} dataObject - Dados sensíveis a serem criptografados
 * @returns {{ iv: string, authTag: string, encryptedData: string }} Payload cifrado em Base64 com IV e Auth Tag em Hex
 */
export function encryptStorybible(dataObject) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const jsonString = JSON.stringify(dataObject);
  const encrypted = Buffer.concat([cipher.update(jsonString, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encryptedData: encrypted.toString('base64'),
  };
}

/**
 * Descriptografa e valida a integridade de um pacote criptografado com AES-256-GCM.
 * @param {Object|string} encryptedPackage - Objeto ou String JSON contendo { iv, authTag, encryptedData }
 * @returns {Object} Dados originais descriptografados
 */
export function decryptStorybible(encryptedPackage) {
  try {
    let pkg = encryptedPackage;

    // Se receber o conteúdo cru como string JSON ou Buffer
    if (typeof pkg === 'string' || Buffer.isBuffer(pkg)) {
      pkg = JSON.parse(pkg.toString('utf8'));
    }

    const { iv, authTag, encryptedData } = pkg || {};

    if (!iv || !authTag || !encryptedData) {
      throw new Error('Arquivo corrompido, adulterado ou sem os metadados de autenticação obrigatórios.');
    }

    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');

    if (ivBuffer.length !== IV_LENGTH) {
      throw new Error('Vetor de Inicialização (IV) inválido.');
    }

    if (authTagBuffer.length !== AUTH_TAG_LENGTH) {
      throw new Error('Tag de Autenticação (Auth Tag) inválida.');
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    const decryptedBuffer = Buffer.concat([
      decipher.update(Buffer.from(encryptedData, 'base64')),
      decipher.final(),
    ]);

    return JSON.parse(decryptedBuffer.toString('utf8'));
  } catch (err) {
    throw new Error(`Falha ao descriptografar arquivo .stfg: ${err.message}`);
  }
}