import express from 'express';
import prisma from '../config/prisma.js';


const router = express.Router();

// ==========================================
// PROJETOS
// ==========================================

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

// ==========================================
// CONFIGURAÇÕES DO PROJETO (Identidade, Essência, Engenharia)
// ==========================================

// GET/POST Identidade
router.get('/projects/:projectId/identity', async (req, res) => {
  try {
    const { projectId } = req.params;
    const entity = await prisma.entity.findFirst({ where: { projectId, type: 'IDENTITY' } });
    res.json(entity ? entity.data : {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// GET/POST Essência
router.get('/projects/:projectId/essencia', async (req, res) => {
  try {
    const { projectId } = req.params;
    const entity = await prisma.entity.findFirst({ where: { projectId, type: 'ESSENCIA' } });
    res.json(entity ? entity.data : {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// GET/POST Engenharia
router.get('/projects/:projectId/engenharia', async (req, res) => {
  try {
    const { projectId } = req.params;
    const entity = await prisma.entity.findFirst({ where: { projectId, type: 'ENGENHARIA' } });
    res.json(entity ? entity.data : {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// ==========================================
// ESTRUTURA DRAMÁTICA
// ==========================================

// GET: Para o Módulo "Estrutura Dramática" (Retorna o objeto completo para edição)
router.get('/projects/:projectId/estrutura-dramatica', async (req, res) => {
  try {
    const { projectId } = req.params;
    const entity = await prisma.entity.findFirst({ where: { projectId, type: 'ESTRUTURA_DRAMATICA' } });
    res.json(entity ? entity.data : { selectedFrameworks: [], values: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Para o Apoio Visual da "Escrita" (Converte o objeto gravado em lista de Cards)
router.get('/projects/:projectId/estrutura-dramatica/cards', async (req, res) => {
  try {
    const { projectId } = req.params;
    const entity = await prisma.entity.findFirst({ where: { projectId, type: 'ESTRUTURA_DRAMATICA' } });
    if (!entity || !entity.data) return res.json([]);

    const { values = {} } = entity.data;
    const cards = [];

    const frameworkCategories = [
      { key: 'acts', name: '3 Atos' },
      { key: 'sequences', name: '8 Sequências' },
      { key: 'hero', name: 'Jornada do Herói' },
      { key: 'storyCircle', name: 'Story Circle' },
      { key: 'saveTheCat', name: 'Save the Cat' },
      { key: 'freytag', name: 'Freytag' },
    ];

    frameworkCategories.forEach(({ key, name }) => {
      const categoryValues = values[key] || {};
      Object.entries(categoryValues).forEach(([stepName, textContent]) => {
        if (textContent && textContent.trim() !== '') {
          cards.push({
            id: `${entity.id}-${key}-${stepName}`,
            title: stepName,
            type: name,
            descricao: textContent.trim(),
          });
        }
      });
    });

    res.json(cards);
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


// ==========================================
// RITMO & TIMELINE
// ==========================================

// GET: Para o Módulo "Ritmo & Timeline" (Retorna o objeto completo para edição)
router.get('/projects/:projectId/ritmo-timeline', async (req, res) => {
  try {
    const { projectId } = req.params;
    const entity = await prisma.entity.findFirst({ where: { projectId, type: 'RITMO_TIMELINE' } });
    res.json(entity ? entity.data : {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Para o Apoio Visual da "Escrita" (Converte os eventos salvos em Cards)
router.get('/projects/:projectId/ritmo-timeline/cards', async (req, res) => {
  try {
    const { projectId } = req.params;
    const entity = await prisma.entity.findFirst({ where: { projectId, type: 'RITMO_TIMELINE' } });
    if (!entity || !entity.data) return res.json([]);

    const timelineData = entity.data;
    const cards = [];

    Object.entries(timelineData).forEach(([milestoneName, eventList]) => {
      if (Array.isArray(eventList)) {
        eventList.forEach((evt) => {
          if (evt.title || evt.description) {
            cards.push({
              id: evt.id || `${entity.id}-${milestoneName}-${Math.random()}`,
              title: evt.title || 'Evento sem título',
              type: milestoneName,
              descricao: evt.description || '',
            });
          }
        });
      }
    });

    res.json(cards);
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


// ==========================================
// PERSONAGENS
// ==========================================

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

router.delete('/characters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.character.delete({ where: { id } });
    res.json({ message: 'Personagem excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar personagem no Prisma:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// MUNDO
// ==========================================

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

router.post('/projects/:projectId/world', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, type, customType, description } = req.body;
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

// ==========================================
// CENAS
// ==========================================

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

// ==========================================
// MISTÉRIOS
// ==========================================

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

// ==========================================
// PLOT TWISTS
// ==========================================

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

// ==========================================
// ESCRITA / CAPÍTULOS
// ==========================================

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

// ==========================================
// CHECKLIST DE DESENVOLVIMENTO
// ==========================================

// GET: Buscar estado do Checklist
router.get('/projects/:projectId/checklist', async (req, res) => {
  try {
    const { projectId } = req.params;
    const entity = await prisma.entity.findFirst({
      where: { projectId, type: 'CHECKLIST' },
    });
    res.json(entity ? entity.data : {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Salvar estado do Checklist
router.post('/projects/:projectId/checklist', async (req, res) => {
  try {
    const { projectId } = req.params;
    const existing = await prisma.entity.findFirst({
      where: { projectId, type: 'CHECKLIST' },
    });

    if (existing) {
      const updated = await prisma.entity.update({
        where: { id: existing.id },
        data: { data: req.body },
      });
      return res.json(updated.data);
    }

    const created = await prisma.entity.create({
      data: {
        projectId,
        type: 'CHECKLIST',
        title: 'Checklist de Desenvolvimento',
        data: req.body,
      },
    });
    res.status(201).json(created.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// CENAS, MISTÉRIOS, PLOT TWISTS E RELAÇÕES
// ==========================================

// GET: Buscar Cenas do Projeto
router.get('/projects/:projectId/scenes', async (req, res) => {
  try {
    const { projectId } = req.params;
    const entity = await prisma.entity.findFirst({ where: { projectId, type: 'SCENES' } });
    res.json(entity && Array.isArray(entity.data) ? entity.data : []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Buscar Mistérios do Projeto
router.get('/projects/:projectId/mysteries', async (req, res) => {
  try {
    const { projectId } = req.params;
    const entity = await prisma.entity.findFirst({ where: { projectId, type: 'MYSTERIES' } });
    res.json(entity && Array.isArray(entity.data) ? entity.data : []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Buscar Plot Twists do Projeto
router.get('/projects/:projectId/twists', async (req, res) => {
  try {
    const { projectId } = req.params;
    const entity = await prisma.entity.findFirst({ where: { projectId, type: 'TWISTS' } });
    res.json(entity && Array.isArray(entity.data) ? entity.data : []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Buscar Relações do Projeto
router.get('/projects/:projectId/relations', async (req, res) => {
  try {
    const { projectId } = req.params;
    const entity = await prisma.entity.findFirst({ where: { projectId, type: 'RELATIONS' } });
    res.json(entity && Array.isArray(entity.data) ? entity.data : []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;