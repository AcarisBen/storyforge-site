// src/controllers/storybibleController.js
const { encryptStorybible, decryptStorybible } = require('../../backend/server/routes/utils/cryptoStorybible');
const prisma = require('../config/prisma');

async function exportProjectStfg(req, res) {
  try {
    const { projectId } = req.params;
    const userId = req.userId || (req.user && req.user.id);

    if (!userId) {
      return res.status(401).json({ error: 'Sessão inválida ou não autorizada.' });
    }

    // Validação estrita de posse (BOLA/IDOR protection)
    const project = await prisma.project.findFirst({
      where: {
        id: String(projectId),
        userId: String(userId),
      },
      include: {
        user: { select: { writerName: true, fullName: true, name: true } },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });
    }

    const entities = await prisma.entity.findMany({ where: { projectId: project.id } });
    const characters = await prisma.character.findMany({ where: { projectId: project.id } });
    const relations = await prisma.characterRelation.findMany({ where: { projectId: project.id } });

    const authorName = project.user?.writerName || project.user?.fullName || project.user?.name || 'Autor StoryForge';

    const projectDataPayload = {
      projectId: project.id,
      title: project.title,
      description: project.description,
      exportedAt: new Date().toISOString(),
      exportedBy: authorName,
      entities,
      characters,
      relations,
    };

    const encryptedPackage = encryptStorybible(projectDataPayload);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="projeto-${project.id}.stfg"`);
    return res.status(200).send(JSON.stringify(encryptedPackage, null, 2));
  } catch (err) {
    console.error('Erro na exportação .stfg:', err);
    return res.status(500).json({ error: 'Erro interno ao gerar arquivo .stfg seguro.' });
  }
}

async function importProjectStfg(req, res) {
  try {
    const userId = req.userId || (req.user && req.user.id);

    if (!userId) {
      return res.status(401).json({ error: 'Sessão inválida ou não autorizada.' });
    }

    if (!req.file && !req.body.fileContent) {
      return res.status(400).json({ error: 'Nenhum arquivo .stfg enviado.' });
    }

    const fileString = req.file ? req.file.buffer.toString('utf8') : req.body.fileContent;
    const restoredData = decryptStorybible(fileString);

    return res.status(200).json({ 
      success: true, 
      message: 'Projeto importado e descriptografado com sucesso!',
      data: restoredData 
    });
  } catch (err) {
    console.error('Erro na importação .stfg:', err);
    return res.status(400).json({ error: err.message });
  }
}

module.exports = { exportProjectStfg, importProjectStfg };