// backend/server/middleware/upload.js
// Middleware para upload seguro focado EXCLUSIVAMENTE em arquivos JSON e .stfg

import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { promises as fsPromises } from 'fs';

// Garante que o diretório de uploads exista
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Extensões estritamente permitidas
const ALLOWED_EXTENSIONS = new Set(['.json', '.stfg']);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error('Apenas arquivos de projeto (.json ou .stfg) são permitidos.'), false);
  }
  cb(null, true);
};

// Configuração do armazenamento seguro em disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const rawExt = path.extname(file.originalname).toLowerCase();
    const sanitizedExt = rawExt.replace(/[^a-z0-9.]/g, '');

    if (!ALLOWED_EXTENSIONS.has(sanitizedExt)) {
      return cb(new Error('Extensão de arquivo não permitida.'), '');
    }

    // Gera nome 100% único e imprevisível via UUID v4
    const uuidName = crypto.randomUUID();
    cb(null, `${uuidName}${sanitizedExt}`);
  },
});

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite máximo de 5 MB
    files: 1,                  // Apenas 1 arquivo por requisição
  },
});

/**
 * Valida a integridade do arquivo de forma assíncrona (deve ser um JSON/STFG estruturalmente válido)
 */
export const validateMagicBytes = async (req, res, next) => {
  if (!req.file) return next();

  const filePath = req.file.path;

  try {
    // Leitura assíncrona (fs.promises) para não travar a thread principal do Node.js
    const fullContent = await fsPromises.readFile(filePath, 'utf8');
    JSON.parse(fullContent);

    next();
  } catch (err) {
    // Apaga imediatamente qualquer arquivo malformado ou corrompido
    try {
      await fsPromises.unlink(filePath);
    } catch (unlinkErr) {
      // Ignora erro caso o arquivo já tenha sido removido
    }

    return res.status(400).json({
      error: 'Conteúdo do arquivo é inválido ou está corrompido (deve ser um JSON estruturado).',
    });
  }
};

export default upload;