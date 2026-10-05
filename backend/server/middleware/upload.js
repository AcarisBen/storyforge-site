// backend/server/middleware/upload.js
// Middleware para upload seguro de arquivos com renomeação via UUID e verificação de Magic Bytes

import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

// Garante que o diretório de uploads exista
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Extensões expressamente permitidas
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.json', '.stfg']);

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
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite máximo de 5 MB por arquivo
    files: 1,                  // Limite de 1 arquivo por requisição
  },
});

/**
 * Valida a assinatura binária (Magic Bytes) real do arquivo no disco
 */
export const validateMagicBytes = async (req, res, next) => {
  if (!req.file) return next();

  const filePath = req.file.path;
  const ext = path.extname(req.file.filename).toLowerCase();

  try {
    const buffer = Buffer.alloc(260);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 260, 0);
    fs.closeSync(fd);

    let isValid = false;

    // Tabela de assinaturas binárias (Magic Bytes)
    if (ext === '.jpg' || ext === '.jpeg') {
      isValid = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    } else if (ext === '.png') {
      isValid = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    } else if (ext === '.gif') {
      isValid = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
    } else if (ext === '.webp') {
      isValid = buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
    } else if (ext === '.json' || ext === '.stfg') {
      // Para arquivos texto/JSON/.stfg, checa se o conteúdo é JSON válido
      try {
        const fullContent = fs.readFileSync(filePath, 'utf8');
        JSON.parse(fullContent);
        isValid = true;
      } catch (e) {
        isValid = false;
      }
    }

    if (!isValid) {
      // Remove arquivo adulterado imediatamente
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Conteúdo do arquivo não corresponde à extensão declarada (Magic Bytes inválidos).' });
    }

    next();
  } catch (err) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return res.status(500).json({ error: 'Erro interno ao validar integridade do arquivo.' });
  }
};

export default upload;