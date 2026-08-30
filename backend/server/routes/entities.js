import express from 'express';
import prisma from '../config/prisma.js';

const router = express.Router();

// GET: Buscar todos os projetos do banco
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

// POST: Criar um novo projeto atrelado ao Usuário Padrão
router.post('/projects', async (req, res) => {
  try {
    const { title, format } = req.body;

    // 1. Busca ou cria usuário padrão para atrelar a chave estrangeira (userId)
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

    // 2. Salva APENAS os campos exatos que existem na model Project do schema.prisma
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

export default router;