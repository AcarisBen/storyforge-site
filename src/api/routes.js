// src/api/routes.js (ou arquivo de rotas do backend)
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { exportProjectStfg, importProjectStfg } = require('../controllers/storybibleController');

// Rota de Exportação Segura .stfg
router.get('/projects/:projectId/export-stfg', exportProjectStfg);

// Rota de Importação Segura .stfg
router.post('/projects/import-stfg', upload.single('file'), importProjectStfg);

module.exports = router;