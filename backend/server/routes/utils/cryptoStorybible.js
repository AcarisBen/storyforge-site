// backend/server/routes/utils/cryptoStorybible.js
// Este arquivo contém funções para criptografar e descriptografar dados sensíveis usando AES-256-GCM. Ele é usado para proteger informações confidenciais, como senhas e dados de usuários, garantindo que apenas partes autorizadas possam acessá-las.

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.STFG_SECRET_KEY || process.env.STORYBIBLE_SECRET_KEY || 'storyforge_chave_secreta_mestra_32_bytes!';

// Garante uma chave de exatamente 32 bytes (256 bits) usando SHA-256
const KEY = crypto.createHash('sha256').update(SECRET_KEY).digest();

/**
 * Criptografa qualquer objeto de dados usando AES-256-GCM
 * @param {Object} dataObject - Dados sensíveis a serem criptografados
 * @returns {Object} Objeto contendo iv, authTag e o payload cifrado em base64
 */
export function encryptStorybible(dataObject) {
  const iv = crypto.randomBytes(12); // 12 bytes é o padrão recomendado para GCM
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
 * Descriptografa um pacote criptografado com AES-256-GCM
 * @param {Object} encryptedPackage - Objeto contendo { iv, authTag, encryptedData }
 * @returns {Object} Dados originais descriptografados
 */
export function decryptStorybible(encryptedPackage) {
  try {
    const { iv, authTag, encryptedData } = encryptedPackage;

    if (!iv || !authTag || !encryptedData) {
      throw new Error('Arquivo corrompido ou sem metadados de criptografia.');
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    const decryptedBuffer = Buffer.concat([
      decipher.update(Buffer.from(encryptedData, 'base64')),
      decipher.final(),
    ]);

    return JSON.parse(decryptedBuffer.toString('utf8'));
  } catch (err) {
    throw new Error(`Falha ao descriptografar arquivo .stfg: ${err.message}`);
  }
}