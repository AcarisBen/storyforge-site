import express from 'express';
import prisma from '../config/prisma.js';

const router = express.Router();

// GET: Buscar todos os projetos
router.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST: Criar novo projeto
router.post('/projects', async (req, res) => {
  try {
    const { title, format } = req.body;

    let defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          email: 'autor@storyforge.com',
          name: 'Autor StoryForge',
          password: 'password_hash_teste',
        },
      });
    }

    const newProject = await prisma.project.create({
      data: {
        title: title || 'Sem título',
        description: format || 'Romance / Livro',
        userId: defaultUser.id,
      },
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Erro ao criar projeto no Prisma:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Buscar a Identidade de um Projeto específico
router.get('/projects/:projectId/identity', async (req, res) => {
  try {
    const { projectId } = req.params;

    const identityEntity = await prisma.entity.findFirst({
      where: {
        projectId,
        type: 'IDENTITY',
      },
    });

    res.json(identityEntity ? identityEntity.data : {});
  } catch (error) {
    console.error('Erro ao buscar Identidade:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT/POST: Salvar/Atualizar a Identidade de um Projeto (Auto-save)
router.post('/projects/:projectId/identity', async (req, res) => {
  try {
    const { projectId } = req.params;
    const identityData = req.body;

    // Procura se já existe uma entidade do tipo IDENTITY para o projeto
    const existingEntity = await prisma.entity.findFirst({
      where: {
        projectId,
        type: 'IDENTITY',
      },
    });

    if (existingEntity) {
      // Atualiza o registro existente no PostgreSQL
      const updated = await prisma.entity.update({
        where: { id: existingEntity.id },
        data: { data: identityData },
      });
      return res.json(updated.data);
    }

    // Cria um novo registro se for a primeira vez
    const created = await prisma.entity.create({
      data: {
        projectId,
        type: 'IDENTITY',
        title: 'Identidade do Projeto',
        data: identityData,
      },
    });

    res.status(201).json(created.data);
  } catch (error) {
    console.error('Erro ao salvar Identidade:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Buscar a Essência de um Projeto específico
router.get('/projects/:projectId/essencia', async (req, res) => {
  try {
    const { projectId } = req.params;

    const essenciaEntity = await prisma.entity.findFirst({
      where: {
        projectId,
        type: 'ESSENCIA',
      },
    });

    res.json(essenciaEntity ? essenciaEntity.data : {});
  } catch (error) {
    console.error('Erro ao buscar Essência:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST: Salvar/Atualizar a Essência de um Projeto (Auto-save)
router.post('/projects/:projectId/essencia', async (req, res) => {
  try {
    const { projectId } = req.params;
    const essenciaData = req.body;

    const existingEntity = await prisma.entity.findFirst({
      where: {
        projectId,
        type: 'ESSENCIA',
      },
    });

    if (existingEntity) {
      const updated = await prisma.entity.update({
        where: { id: existingEntity.id },
        data: { data: essenciaData },
      });
      return res.json(updated.data);
    }

    const created = await prisma.entity.create({
      data: {
        projectId,
        type: 'ESSENCIA',
        title: 'Essência do Projeto',
        data: essenciaData,
      },
    });

    res.status(201).json(created.data);
  } catch (error) {
    console.error('Erro ao salvar Essência:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Buscar a Engenharia Narrativa de um Projeto específico
router.get('/projects/:projectId/engenharia', async (req, res) => {
  try {
    const { projectId } = req.params;

    const engenhariaEntity = await prisma.entity.findFirst({
      where: {
        projectId,
        type: 'ENGENHARIA',
      },
    });

    res.json(engenhariaEntity ? engenhariaEntity.data : {});
  } catch (error) {
    console.error('Erro ao buscar Engenharia:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST: Salvar/Atualizar a Engenharia Narrativa de um Projeto (Auto-save)
router.post('/projects/:projectId/engenharia', async (req, res) => {
  try {
    const { projectId } = req.params;
    const engenhariaData = req.body;

    const existingEntity = await prisma.entity.findFirst({
      where: {
        projectId,
        type: 'ENGENHARIA',
      },
    });

    if (existingEntity) {
      const updated = await prisma.entity.update({
        where: { id: existingEntity.id },
        data: { data: engenhariaData },
      });
      return res.json(updated.data);
    }

    const created = await prisma.entity.create({
      data: {
        projectId,
        type: 'ENGENHARIA',
        title: 'Engenharia Narrativa do Projeto',
        data: engenhariaData,
      },
    });

    res.status(201).json(created.data);
  } catch (error) {
    console.error('Erro ao salvar Engenharia:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Buscar a Estrutura Dramática de um Projeto específico
router.get('/projects/:projectId/estrutura-dramatica', async (req, res) => {
  try {
    const { projectId } = req.params;

    const estruturaEntity = await prisma.entity.findFirst({
      where: {
        projectId,
        type: 'ESTRUTURA_DRAMATICA',
      },
    });

    res.json(estruturaEntity ? estruturaEntity.data : { selectedFrameworks: [], values: {} });
  } catch (error) {
    console.error('Erro ao buscar Estrutura Dramática:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST: Salvar/Atualizar a Estrutura Dramática de um Projeto (Auto-save)
router.post('/projects/:projectId/estrutura-dramatica', async (req, res) => {
  try {
    const { projectId } = req.params;
    const estruturaData = req.body;

    const existingEntity = await prisma.entity.findFirst({
      where: {
        projectId,
        type: 'ESTRUTURA_DRAMATICA',
      },
    });

    if (existingEntity) {
      const updated = await prisma.entity.update({
        where: { id: existingEntity.id },
        data: { data: estruturaData },
      });
      return res.json(updated.data);
    }

    const created = await prisma.entity.create({
      data: {
        projectId,
        type: 'ESTRUTURA_DRAMATICA',
        title: 'Estrutura Dramática do Projeto',
        data: estruturaData,
      },
    });

    res.status(201).json(created.data);
  } catch (error) {
    console.error('Erro ao salvar Estrutura Dramática:', error);
    res.status(500).json({ error: error.message });
  }
});












































































































































export default router;