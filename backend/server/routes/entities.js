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

// GET: Buscar Identidade
router.get('/projects/:projectId/identity', async (req, res) => {
  try {
    const { projectId } = req.params;
    const entity = await prisma.entity.findFirst({ where: { projectId, type: 'IDENTITY' } });
    res.json(entity ? entity.data : {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Salvar Identidade
router.post('/projects/:projectId/identity', async (req, res) => {
  try {
    const { projectId } = req.params;
    const existing = await prisma.entity.findFirst({ where: { projectId, type: 'IDENTITY' } });
    if (existing) {
      const updated = await prisma.entity.update({ where: { id: existing.id }, data: { data: req.body } });
      return res.json(updated.data);
    }
    const created = await prisma.entity.create({ data: { projectId, type: 'IDENTITY', title: 'Identidade', data: req.body } });
    res.status(201).json(created.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Buscar Essência
router.get('/projects/:projectId/essencia', async (req, res) => {
  try {
    const { projectId } = req.params;
    const entity = await prisma.entity.findFirst({ where: { projectId, type: 'ESSENCIA' } });
    res.json(entity ? entity.data : {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Salvar Essência
router.post('/projects/:projectId/essencia', async (req, res) => {
  try {
    const { projectId } = req.params;
    const existing = await prisma.entity.findFirst({ where: { projectId, type: 'ESSENCIA' } });
    if (existing) {
      const updated = await prisma.entity.update({ where: { id: existing.id }, data: { data: req.body } });
      return res.json(updated.data);
    }
    const created = await prisma.entity.create({ data: { projectId, type: 'ESSENCIA', title: 'Essência', data: req.body } });
    res.status(201).json(created.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Buscar Engenharia
router.get('/projects/:projectId/engenharia', async (req, res) => {
  try {
    const { projectId } = req.params;
    const entity = await prisma.entity.findFirst({ where: { projectId, type: 'ENGENHARIA' } });
    res.json(entity ? entity.data : {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Salvar Engenharia
router.post('/projects/:projectId/engenharia', async (req, res) => {
  try {
    const { projectId } = req.params;
    const existing = await prisma.entity.findFirst({ where: { projectId, type: 'ENGENHARIA' } });
    if (existing) {
      const updated = await prisma.entity.update({ where: { id: existing.id }, data: { data: req.body } });
      return res.json(updated.data);
    }
    const created = await prisma.entity.create({ data: { projectId, type: 'ENGENHARIA', title: 'Engenharia', data: req.body } });
    res.status(201).json(created.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Buscar Estrutura Dramática
router.get('/projects/:projectId/estrutura-dramatica', async (req, res) => {
  try {
    const { projectId } = req.params;
    const entity = await prisma.entity.findFirst({ where: { projectId, type: 'ESTRUTURA_DRAMATICA' } });
    res.json(entity ? entity.data : { selectedFrameworks: [], values: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Salvar Estrutura Dramática
router.post('/projects/:projectId/estrutura-dramatica', async (req, res) => {
  try {
    const { projectId } = req.params;
    const existing = await prisma.entity.findFirst({ where: { projectId, type: 'ESTRUTURA_DRAMATICA' } });
    if (existing) {
      const updated = await prisma.entity.update({ where: { id: existing.id }, data: { data: req.body } });
      return res.json(updated.data);
    }
    const created = await prisma.entity.create({ data: { projectId, type: 'ESTRUTURA_DRAMATICA', title: 'Estrutura Dramática', data: req.body } });
    res.status(201).json(created.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Buscar Ritmo & Timeline
router.get('/projects/:projectId/ritmo-timeline', async (req, res) => {
  try {
    const { projectId } = req.params;
    const entity = await prisma.entity.findFirst({ where: { projectId, type: 'RITMO_TIMELINE' } });
    res.json(entity ? entity.data : {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Salvar Ritmo & Timeline
router.post('/projects/:projectId/ritmo-timeline', async (req, res) => {
  try {
    const { projectId } = req.params;
    const existing = await prisma.entity.findFirst({ where: { projectId, type: 'RITMO_TIMELINE' } });
    if (existing) {
      const updated = await prisma.entity.update({ where: { id: existing.id }, data: { data: req.body } });
      return res.json(updated.data);
    }
    const created = await prisma.entity.create({ data: { projectId, type: 'RITMO_TIMELINE', title: 'Ritmo & Timeline', data: req.body } });
    res.status(201).json(created.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------- ROTAS DE PERSONAGENS -------------------

// GET: Buscar todos os personagens do projeto
router.get('/projects/:projectId/characters', async (req, res) => {
  try {
    const { projectId } = req.params;
    const characters = await prisma.character.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = characters.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.role || 'protagonista',
      details: c.details || {},
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar personagens:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST: Criar um novo personagem
router.post('/projects/:projectId/characters', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, type, details } = req.body;

    const newChar = await prisma.character.create({
      data: {
        name: name || 'Novo personagem',
        role: type || 'protagonista',
        details: details || {},
        projectId,
      },
    });

    res.status(201).json({
      id: newChar.id,
      name: newChar.name,
      type: newChar.role,
      details: newChar.details,
    });
  } catch (error) {
    console.error('Erro ao criar personagem no Prisma:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT: Atualizar personagem (Auto-save do Dossiê)
router.put('/characters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, details } = req.body;

    const updatedChar = await prisma.character.update({
      where: { id },
      data: {
        name: name || 'Personagem sem nome',
        role: type || 'protagonista',
        details: details || {},
      },
    });

    res.json({
      id: updatedChar.id,
      name: updatedChar.name,
      type: updatedChar.role,
      details: updatedChar.details,
    });
  } catch (error) {
    console.error('Erro ao atualizar personagem no Prisma:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Excluir personagem
router.delete('/characters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.character.delete({
      where: { id },
    });

    res.json({ message: 'Personagem excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar personagem no Prisma:', error);
    res.status(500).json({ error: error.message });
  }
});

// ------------------- ROTAS DE MUNDO -------------------

// GET: Buscar todos os elementos do mundo de um projeto
router.get('/projects/:projectId/world', async (req, res) => {
  try {
    const { projectId } = req.params;
    const elements = await prisma.entity.findMany({
      where: { projectId, type: 'WORLD_ELEMENT' },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = elements.map((e) => ({
      id: e.id,
      name: e.title,
      type: e.data?.elementType || 'País',
      customType: e.data?.customType || '',
      description: e.data?.description || '',
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar elementos do mundo:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST: Criar elemento do mundo
router.post('/projects/:projectId/world', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, type, customType, description } = req.body;

    // Se o tipo for "Outros" e houver um texto customizado, usa o customType
    const finalType = type === 'Outros' && customType.trim() ? customType.trim() : type;

    const newElement = await prisma.entity.create({
      data: {
        projectId,
        type: 'WORLD_ELEMENT',
        title: name || 'Sem nome',
        data: { 
          elementType: finalType, 
          customType: type === 'Outros' ? customType.trim() : '',
          description: description || '' 
        },
      },
    });

    res.status(201).json({
      id: newElement.id,
      name: newElement.title,
      type: newElement.data.elementType,
      customType: newElement.data.customType,
      description: newElement.data.description,
    });
  } catch (error) {
    console.error('Erro ao criar elemento do mundo:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT: Atualizar elemento do mundo
router.put('/world/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, customType, description } = req.body;

    const finalType = type === 'Outros' && customType.trim() ? customType.trim() : type;

    const updated = await prisma.entity.update({
      where: { id },
      data: {
        title: name || 'Sem nome',
        data: { 
          elementType: finalType, 
          customType: type === 'Outros' ? customType.trim() : '',
          description: description || '' 
        },
      },
    });

    res.json({
      id: updated.id,
      name: updated.title,
      type: updated.data.elementType,
      customType: updated.data.customType,
      description: updated.data.description,
    });
  } catch (error) {
    console.error('Erro ao atualizar elemento do mundo:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Excluir elemento do mundo
router.delete('/world/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.entity.delete({ where: { id } });
    res.json({ message: 'Elemento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar elemento do mundo:', error);
    res.status(500).json({ error: error.message });
  }
});

// ------------------- ROTAS DE CENAS -------------------

// GET: Buscar todas as cenas de um projeto
router.get('/projects/:projectId/scenes', async (req, res) => {
  try {
    const { projectId } = req.params;
    const scenes = await prisma.entity.findMany({
      where: { projectId, type: 'SCENE' },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = scenes.map((s) => ({
      id: s.id,
      title: s.title,
      ...(s.data || {}),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar cenas:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST: Criar uma nova cena
router.post('/projects/:projectId/scenes', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, ...restData } = req.body;

    const created = await prisma.entity.create({
      data: {
        projectId,
        type: 'SCENE',
        title: title || 'Cena sem título',
        data: restData || {},
      },
    });

    res.status(201).json({
      id: created.id,
      title: created.title,
      ...(created.data || {}),
    });
  } catch (error) {
    console.error('Erro ao criar cena:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT: Atualizar cena (Auto-save ao digitar)
router.put('/scenes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, ...restData } = req.body;

    const updated = await prisma.entity.update({
      where: { id },
      data: {
        title: title || 'Cena sem título',
        data: restData || {},
      },
    });

    res.json({
      id: updated.id,
      title: updated.title,
      ...(updated.data || {}),
    });
  } catch (error) {
    console.error('Erro ao atualizar cena:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Excluir cena
router.delete('/scenes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.entity.delete({ where: { id } });
    res.json({ message: 'Cena excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cena:', error);
    res.status(500).json({ error: error.message });
  }
});

// ------------------- ROTAS DE MISTÉRIOS -------------------

// GET: Buscar todos os mistérios do projeto
router.get('/projects/:projectId/mysteries', async (req, res) => {
  try {
    const { projectId } = req.params;
    const mysteries = await prisma.entity.findMany({
      where: { projectId, type: 'MYSTERY' },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = mysteries.map((m) => ({
      id: m.id,
      title: m.title,
      ...(m.data || {}),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar mistérios:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST: Criar um novo mistério
router.post('/projects/:projectId/mysteries', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, ...restData } = req.body;

    const created = await prisma.entity.create({
      data: {
        projectId,
        type: 'MYSTERY',
        title: title || 'Mistério sem nome',
        data: restData || {},
      },
    });

    res.status(201).json({
      id: created.id,
      title: created.title,
      ...(created.data || {}),
    });
  } catch (error) {
    console.error('Erro ao criar mistério:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT: Atualizar mistério (Auto-save)
router.put('/mysteries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, ...restData } = req.body;

    const updated = await prisma.entity.update({
      where: { id },
      data: {
        title: title || 'Mistério sem nome',
        data: restData || {},
      },
    });

    res.json({
      id: updated.id,
      title: updated.title,
      ...(updated.data || {}),
    });
  } catch (error) {
    console.error('Erro ao atualizar mistério:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Excluir mistério
router.delete('/mysteries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.entity.delete({ where: { id } });
    res.json({ message: 'Mistério excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar mistério:', error);
    res.status(500).json({ error: error.message });
  }
});

// ------------------- ROTAS DE PLOT TWISTS -------------------

// GET: Buscar todos os plot twists do projeto
router.get('/projects/:projectId/twists', async (req, res) => {
  try {
    const { projectId } = req.params;
    const twists = await prisma.entity.findMany({
      where: { projectId, type: 'PLOT_TWIST' },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = twists.map((t) => ({
      id: t.id,
      title: t.title,
      ...(t.data || {}),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar plot twists:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST: Criar um novo plot twist
router.post('/projects/:projectId/twists', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, ...restData } = req.body;

    const created = await prisma.entity.create({
      data: {
        projectId,
        type: 'PLOT_TWIST',
        title: title || 'Plot Twist sem título',
        data: restData || {},
      },
    });

    res.status(201).json({
      id: created.id,
      title: created.title,
      ...(created.data || {}),
    });
  } catch (error) {
    console.error('Erro ao criar plot twist:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT: Atualizar plot twist (Auto-save)
router.put('/twists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, ...restData } = req.body;

    const updated = await prisma.entity.update({
      where: { id },
      data: {
        title: title || 'Plot Twist sem título',
        data: restData || {},
      },
    });

    res.json({
      id: updated.id,
      title: updated.title,
      ...(updated.data || {}),
    });
  } catch (error) {
    console.error('Erro ao atualizar plot twist:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Excluir plot twist
router.delete('/twists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.entity.delete({ where: { id } });
    res.json({ message: 'Plot twist excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar plot twist:', error);
    res.status(500).json({ error: error.message });
  }
});

// ------------------- ROTAS DE ESCRITA / CAPÍTULOS -------------------

// GET: Buscar todos os capítulos de um projeto
router.get('/projects/:projectId/chapters', async (req, res) => {
  try {
    const { projectId } = req.params;
    const chapters = await prisma.entity.findMany({
      where: { projectId, type: 'CHAPTER' },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = chapters.map((c) => ({
      id: c.id,
      title: c.title,
      type: c.data?.chapterType || 'Capítulo',
      content: c.data?.content || '',
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar capítulos:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Estrutura Dramática do Projeto (busca DRAMATIC_STRUCTURE e STRUCTURE_POINT)
router.get('/projects/:projectId/structure', async (req, res) => {
  try {
    const { projectId } = req.params;
    const items = await prisma.entity.findMany({
      where: {
        projectId,
        type: { in: ['DRAMATIC_STRUCTURE', 'STRUCTURE_POINT'] },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = items.map((i) => ({
      id: i.id,
      title: i.title || i.data?.beat || i.data?.name || i.data?.act || 'Ponto Estrutural',
      type: i.data?.act || i.data?.stage || 'Estrutura',
      ...(i.data || {}),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar estrutura dramática:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Ritmo e Timeline do Projeto (busca PACING_TIMELINE, TIMELINE_EVENT e RHYTHM_SCENE)
router.get('/projects/:projectId/pacing', async (req, res) => {
  try {
    const { projectId } = req.params;
    const items = await prisma.entity.findMany({
      where: {
        projectId,
        type: { in: ['PACING_TIMELINE', 'TIMELINE_EVENT', 'RHYTHM_SCENE'] },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = items.map((i) => ({
      id: i.id,
      title: i.title || i.data?.sceneTitle || i.data?.name || 'Evento da Timeline',
      type: i.data?.intensity ? `Intensidade: ${i.data.intensity}` : i.data?.pace || 'Timeline',
      ...(i.data || {}),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar ritmo & timeline:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST: Criar novo capítulo
router.post('/projects/:projectId/chapters', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, type, content } = req.body;

    const created = await prisma.entity.create({
      data: {
        projectId,
        type: 'CHAPTER',
        title: title || 'Novo Capítulo',
        data: { chapterType: type || 'Capítulo', content: content || '' },
      },
    });

    res.status(201).json({
      id: created.id,
      title: created.title,
      type: created.data.chapterType,
      content: created.data.content,
    });
  } catch (error) {
    console.error('Erro ao criar capítulo:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT: Atualizar capítulo (Auto-save do Manuscrito)
router.put('/chapters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, content } = req.body;

    const updated = await prisma.entity.update({
      where: { id },
      data: {
        title: title || 'Novo Capítulo',
        data: { chapterType: type || 'Capítulo', content: content || '' },
      },
    });

    res.json({
      id: updated.id,
      title: updated.title,
      type: updated.data.chapterType,
      content: updated.data.content,
    });
  } catch (error) {
    console.error('Erro ao atualizar capítulo:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Excluir capítulo
router.delete('/chapters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.entity.delete({ where: { id } });
    res.json({ message: 'Capítulo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar capítulo:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;