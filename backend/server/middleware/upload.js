// backend/server/middleware/upload.js
// Middleware para upload seguro de arquivos com renomeação via UUID e sanitização de extensões/MIME types

import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

// Garante que o diretório de uploads exista
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Lista de MIME types e extensões expressamente permitidos
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/json',
  'text/plain',
  'application/octet-stream' // Necessário para arquivos de projeto (.stfg)
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.json', '.stfg']);

// Configuração do armazenamento seguro em disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // 1. Extrai a extensão e converte para minúsculo
    const rawExt = path.extname(file.originalname).toLowerCase();

    // 2. Sanitiza a extensão mantendo apenas caracteres alfanuméricos
    const sanitizedExt = rawExt.replace(/[^a-z0-9.]/g, '');

    // 3. Valida se a extensão é permitida
    if (!ALLOWED_EXTENSIONS.has(sanitizedExt)) {
      return cb(new Error('Extensão de arquivo não permitida.'), '');
    }

    // 4. Gera um nome 100% único e imprevisível via UUID v4
    const uuidName = crypto.randomUUID();
    const finalFilename = `${uuidName}${sanitizedExt}`;

    cb(null, finalFilename);
  },
});

// Filtro de segurança por MIME type
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo (MIME type) não permitido.'));
  }
};

// Exporta a instância do Multer configurada
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite máximo de 5 MB por arquivo
    files: 1,                  // Limite de 1 arquivo por requisição
  },
});

export default upload;