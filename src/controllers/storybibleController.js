// src/controllers/storybibleController.js
const { encryptStorybible, decryptStorybible } = require('../../backend/server/routes/utils/cryptoStorybible');
// Importe aqui os seus models do banco de dados (Sequelize, Mongoose, Prisma, etc.)

async function exportProjectStfg(req, res) {
  try {
    const { projectId } = req.params;
    
    // TODO: Busque todos os dados do projeto no banco de dados do seu backend
    // Exemplo:
    // const project = await Project.findByPk(projectId, { include: [...] });
    
    const projectDataMock = {
      projectId,
      title: "Meu Projeto StoryForge",
      exportedAt: new Date().toISOString(),
      // ... adicione aqui todas as tabelas (personagens, capítulos, mundo, etc.)
    };

    const stfgContent = encryptStorybible(projectDataMock);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="projeto-${projectId}.stfg"`);
    return res.send(stfgContent);
  } catch (err) {
    console.error('Erro na exportação .stfg:', err);
    return res.status(500).json({ error: 'Erro interno ao gerar arquivo .stfg seguro.' });
  }
}

async function importProjectStfg(req, res) {
  try {
    if (!req.file && !req.body.fileContent) {
      return res.status(400).json({ error: 'Nenhum arquivo .stfg enviado.' });
    }

    const fileString = req.file ? req.file.buffer.toString('utf8') : req.body.fileContent;
    const restoredData = decryptStorybible(fileString);

    // TODO: Insira/atualize os dados descriptografados de volta no banco de dados do backend

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