// backend/server/routes/entities.js
// Rotas para gerenciar entidades do projeto com proteção contra IDOR e autenticação via Cookie HttpOnly / Token

import express from 'express';
import prisma from '../config/prisma.js';
import { promises as fsPromises } from 'fs';
import { upload, validateMagicBytes } from '../middleware/upload.js';
import { requireAuth } from '../middleware/auth.js';
import { grammarLimiter } from '../middleware/rateLimiter.js';
import { encryptStorybible, decryptStorybible } from './utils/cryptoStorybible.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

let APP_VERSION = '1.0.0';
try {
  const packagePath = path.resolve(process.cwd(), 'package.json');
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  APP_VERSION = packageData.version || '1.0.0';
} catch (e) {
  console.warn('Aviso: Não foi possível ler a versão do package.json, usando versão padrão:', e.message);
}

// ==========================================
// MIDDLEWARE DE REESCRITA DE ROTA (PREVENÇÃO DE 404)
// ==========================================
router.use((req, res, next) => {
  if (req.url.startsWith('/entities/')) {
    req.url = req.url.replace('/entities', '');
  }
  next();
});

// Função auxiliar para gerar variações fonéticas universais caso o LT entregue poucas opções
function generatePhoneticVariants(word) {
  const variants = new Set();
  const lower = word.toLowerCase();

  if (lower.includes('çe')) variants.add(lower.replace(/çe/g, 'se')).add(lower.replace(/çe/g, 'she'));
  if (lower.includes('ço')) {
    variants.add(lower.replace(/ço/g, 'so'));
    variants.add(lower.replace(/ço/g, 'sso'));
    variants.add(lower.replace(/ço/g, 'lho'));
    variants.add(lower.replace(/ço/g, 'co'));
  }
  if (lower.includes('se')) variants.add(lower.replace(/se/g, 'çe'));
  if (lower.includes('so')) variants.add(lower.replace(/so/g, 'ço'));

  return Array.from(variants);
}

// ==========================================
// EXTRAIR E VALIDAR USUÁRIO LOGADO VIA COOKIE HTTPONLY OU HEADER
// ==========================================
// Middleware para validar propriedade do projeto em rotas com :projectId
const verifyProjectOwner = async (projectId, userId) => {
  if (!projectId || !userId) return null;
  return await prisma.project.findFirst({
    where: { id: String(projectId), userId: String(userId) }
  });
};

// ==========================================
// PROXY DE VERIFICAÇÃO GRAMATICAL (LANGUAGETOOL)
// ==========================================
router.post('/grammar-check', requireAuth, grammarLimiter, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 3) return res.json([]);

    const params = new URLSearchParams({
      text,
      language: 'pt-BR',
      level: 'picky',
      enableHiddenRules: 'true',
    });

    const response = await fetch('http://localhost:8010/v2/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) throw new Error('Servidor LanguageTool offline');

    const data = await response.json();

    const suggestions = (data.matches || []).map((match, idx) => {
      const original = text.substring(match.offset, match.offset + match.length);
      
      let replacements = (match.replacements || [])
        .map((r) => r.value)
        .filter(Boolean);

      if (replacements.length === 1) {
        const extraOptions = generatePhoneticVariants(original);
        replacements = Array.from(new Set([...replacements, ...extraOptions])).slice(0, 4);
      }

      return {
        id: `lt-${idx}-${match.offset}`,
        label: match.rule?.category?.name || 'Ortografia/Gramática',
        original,
        replacements,
        replacement: replacements[0] || '',
        message: match.message,
        badgeStyle: match.rule?.issueType === 'misspelling' 
          ? 'bg-red-950/80 text-red-300 border-red-700/60' 
          : 'bg-purple-950/80 text-purple-300 border-purple-700/60',
      };
    });

    return res.json(suggestions);
  } catch (err) {
    console.error('Erro na checagem gramatical:', err.message);
    return res.json([]);
  }
});

// ==========================================
// PROJETO(S) - ISOLAMENTO SEGURO POR USUÁRIO
// ==========================================
const getProjectsHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Sessão inválida ou não autorizada.' });
    }

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const formattedProjects = projects.map((p) => ({
      ...p,
      isImported: Boolean(p.isImported),
      exportedAt: p.exportedAt || null,
      exportedBy: p.exportedBy || null,
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar projetos.' });
  }
};

const createProjectHandler = async (req, res) => {
  try {
    const { title, format, status, progress, writerName, isImported, exportedAt, exportedBy } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Sessão inválida ou não autorizada.' });
    }

    const cleanTitle = (title || 'Novo Projeto').replace(/\s*\(Importado\)\s*/gi, '').trim();
    const isImportProcess = Boolean(isImported);
    const authorName = exportedBy || writerName || 'Autor StoryForge';
    const importDate = exportedAt || new Date().toLocaleDateString('pt-BR');

    const newProject = await prisma.project.create({
      data: {
        title: cleanTitle,
        description: isImportProcess 
          ? `Projeto importado em ${importDate} por ${authorName}` 
          : `Criado em ${new Date().toLocaleDateString('pt-BR')}`,
        userId: userId,
        isImported: isImportProcess,
        exportedAt: isImportProcess ? importDate : null,
        exportedBy: isImportProcess ? authorName : null,
      },
    });

    return res.status(201).json({
      ...newProject,
      format: format || 'Romance / Livro',
      progress: Number(progress) || 0,
    });
  } catch (error) {
    console.error('Erro ao criar/importar projeto no Prisma:', error);
    return res.status(500).json({ error: 'Erro interno ao criar projeto.' });
  }
};

const deleteProjectHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Sessão inválida ou não autorizada.' });
    }

    const { id } = req.params;

    const deleted = await prisma.project.deleteMany({
      where: {
        id: String(id),
        userId: userId,
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Operação não permitida ou projeto não encontrado.' });
    }

    res.json({ success: true, message: 'Projeto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    res.status(500).json({ error: 'Erro ao excluir o projeto do banco de dados.' });
  }
};

router.get('/projects', requireAuth, getProjectsHandler);
router.post('/projects', requireAuth, createProjectHandler);
router.delete('/projects/:id', requireAuth, deleteProjectHandler);

// ==========================================
// RELAÇÕES DE PERSONAGENS
// ==========================================
router.get('/projects/:projectId/relations', requireAuth, async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const relations = await prisma.characterRelation.findMany({
      where: { projectId: String(projectId) },
      orderBy: { id: 'asc' },
    });
    res.json(relations);
  } catch (err) {
    console.error('Erro ao buscar relações:', err);
    res.status(500).json({ error: 'Erro ao carregar relações' });
  }
});

router.post('/relations', requireAuth, async (req, res) => {
  const { id, projectId, charAId, charBId, type, intensity, sceneId, description } = req.body;

  if (!projectId || !charAId || !charBId) {
    return res.status(400).json({ error: 'Projeto e Personagens são obrigatórios.' });
  }

  try {
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const validChars = await prisma.character.count({
      where: {
        id: { in: [String(charAId), String(charBId)] },
        projectId: String(projectId),
      },
    });

    if (validChars < (charAId === charBId ? 1 : 2)) {
      return res.status(400).json({ error: 'Um ou ambos os personagens não pertencem a este projeto.' });
    }

    if (sceneId) {
      const validScene = await prisma.entity.findFirst({
        where: {
          id: String(sceneId),
          projectId: String(projectId),
          type: 'SCENE',
        },
      });

      if (!validScene) {
        return res.status(400).json({ error: 'A cena informada é inválida ou não pertence a este projeto.' });
      }
    }

    let savedRelation;
    if (id && !isNaN(Number(id))) {
      const existing = await prisma.characterRelation.findFirst({
        where: { 
          id: Number(id), 
          projectId: String(projectId),
          project: { userId: req.userId } 
        }
      });
      if (!existing) return res.status(404).json({ error: 'Relação não encontrada ou acesso negado.' });

      savedRelation = await prisma.characterRelation.update({
        where: { id: Number(id) },
        data: {
          charAId: String(charAId),
          charBId: String(charBId),
          type: type || 'Amizade',
          intensity: Number(intensity) || 6,
          sceneId: sceneId ? String(sceneId) : null,
          description: description || '',
        },
      });
    } else {
      savedRelation = await prisma.characterRelation.create({
        data: {
          projectId: String(projectId),
          charAId: String(charAId),
          charBId: String(charBId),
          type: type || 'Amizade',
          intensity: Number(intensity) || 6,
          sceneId: sceneId ? String(sceneId) : null,
          description: description || '',
        },
      });
    }
    res.status(200).json(savedRelation);
  } catch (err) {
    console.error('Erro ao salvar relação:', err);
    res.status(500).json({ error: 'Erro ao salvar a relação no banco de dados.' });
  }
});

router.delete('/relations/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await prisma.characterRelation.deleteMany({
      where: { 
        id: Number(id), 
        project: { userId: req.userId } 
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Relação não encontrada ou acesso negado.' });
    }

    res.json({ success: true, message: 'Relação removida com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar relação:', err);
    res.status(500).json({ error: 'Erro ao excluir relação' });
  }
});

// ==========================================
// CONFIGURAÇÕES DO PROJETO (Identity, Essência, Engenharia)
// ==========================================
router.get('/projects/:projectId/identity', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const entity = await prisma.entity.findFirst({ where: { projectId: String(projectId), type: 'IDENTITY' } });
    res.json(entity ? entity.data : {});
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao buscar dados de identidade.' });
  }
});

router.post('/projects/:projectId/identity', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const existing = await prisma.entity.findFirst({ where: { projectId: String(projectId), type: 'IDENTITY' } });
    if (existing) {
      const updated = await prisma.entity.update({ where: { id: existing.id }, data: { data: req.body } });
      return res.json(updated.data);
    }
    const created = await prisma.entity.create({ data: { projectId: String(projectId), type: 'IDENTITY', title: 'Identidade', data: req.body } });
    res.status(201).json(created.data);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao salvar dados de identidade.' });
  }
});

router.get('/projects/:projectId/essencia', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const entity = await prisma.entity.findFirst({ where: { projectId: String(projectId), type: 'ESSENCIA' } });
    res.json(entity ? entity.data : {});
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao buscar dados de essência.' });
  }
});

router.post('/projects/:projectId/essencia', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const existing = await prisma.entity.findFirst({ where: { projectId: String(projectId), type: 'ESSENCIA' } });
    if (existing) {
      const updated = await prisma.entity.update({ where: { id: existing.id }, data: { data: req.body } });
      return res.json(updated.data);
    }
    const created = await prisma.entity.create({ data: { projectId: String(projectId), type: 'ESSENCIA', title: 'Essência', data: req.body } });
    res.status(201).json(created.data);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao salvar dados de essência.' });
  }
});

router.get('/projects/:projectId/engenharia', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const entity = await prisma.entity.findFirst({ where: { projectId: String(projectId), type: 'ENGENHARIA' } });
    res.json(entity ? entity.data : {});
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao buscar dados de engenharia.' });
  }
});

router.post('/projects/:projectId/engenharia', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const existing = await prisma.entity.findFirst({ where: { projectId: String(projectId), type: 'ENGENHARIA' } });
    if (existing) {
      const updated = await prisma.entity.update({ where: { id: existing.id }, data: { data: req.body } });
      return res.json(updated.data);
    }
    const created = await prisma.entity.create({ data: { projectId: String(projectId), type: 'ENGENHARIA', title: 'Engenharia', data: req.body } });
    res.status(201).json(created.data);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao salvar dados de engenharia.' });
  }
});

// ==========================================
// ESTRUTURA DRAMÁTICA
// ==========================================
router.get('/projects/:projectId/estrutura-dramatica', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const entity = await prisma.entity.findFirst({ where: { projectId: String(projectId), type: 'ESTRUTURA_DRAMATICA' } });
    res.json(entity ? entity.data : { selectedFrameworks: [], values: {} });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao buscar estrutura dramática.' });
  }
});

router.get('/projects/:projectId/estrutura-dramatica/cards', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const entity = await prisma.entity.findFirst({ where: { projectId: String(projectId), type: 'ESTRUTURA_DRAMATICA' } });
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
    res.status(500).json({ error: 'Erro interno ao buscar cards da estrutura.' });
  }
});

router.post('/projects/:projectId/estrutura-dramatica', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const existing = await prisma.entity.findFirst({ where: { projectId: String(projectId), type: 'ESTRUTURA_DRAMATICA' } });
    if (existing) {
      const updated = await prisma.entity.update({ where: { id: existing.id }, data: { data: req.body } });
      return res.json(updated.data);
    }
    const created = await prisma.entity.create({ data: { projectId: String(projectId), type: 'ESTRUTURA_DRAMATICA', title: 'Estrutura Dramática', data: req.body } });
    res.status(201).json(created.data);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao salvar estrutura dramática.' });
  }
});

// ==========================================
// RITMO & TIMELINE
// ==========================================
router.get('/projects/:projectId/ritmo-timeline', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const entity = await prisma.entity.findFirst({ where: { projectId: String(projectId), type: 'RITMO_TIMELINE' } });
    res.json(entity ? entity.data : {});
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao buscar dados de ritmo e timeline.' });
  }
});

router.get('/projects/:projectId/ritmo-timeline/cards', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const entity = await prisma.entity.findFirst({ where: { projectId: String(projectId), type: 'RITMO_TIMELINE' } });
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
    res.status(500).json({ error: 'Erro interno ao buscar eventos da timeline.' });
  }
});

router.post('/projects/:projectId/ritmo-timeline', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const existing = await prisma.entity.findFirst({ where: { projectId: String(projectId), type: 'RITMO_TIMELINE' } });
    if (existing) {
      const updated = await prisma.entity.update({ where: { id: existing.id }, data: { data: req.body } });
      return res.json(updated.data);
    }
    const created = await prisma.entity.create({ data: { projectId: String(projectId), type: 'RITMO_TIMELINE', title: 'Ritmo & Timeline', data: req.body } });
    res.status(201).json(created.data);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao salvar ritmo e timeline.' });
  }
});

// ==========================================
// PERSONAGENS
// ==========================================
router.get('/projects/:projectId/characters', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const characters = await prisma.character.findMany({
      where: { projectId: String(projectId) },
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
    res.status(500).json({ error: 'Erro interno ao carregar personagens.' });
  }
});

router.post('/projects/:projectId/characters', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, type, details } = req.body;

    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const newChar = await prisma.character.create({
      data: {
        name: name || 'Novo personagem',
        role: type || 'protagonista',
        details: details || {},
        projectId: String(projectId),
      },
    });

    res.status(201).json({
      id: newChar.id,
      name: newChar.name,
      type: newChar.role,
      details: newChar.details,
    });
  } catch (error) {
    console.error('Erro ao criar personagem:', error);
    res.status(500).json({ error: 'Erro interno ao criar personagem.' });
  }
});

router.put('/characters/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, details } = req.body;

    const updated = await prisma.character.updateMany({
      where: {
        id: String(id),
        project: { userId: req.userId },
      },
      data: {
        name: name || 'Personagem sem nome',
        role: type || 'protagonista',
        details: details || {},
      },
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: 'Personagem não encontrado ou acesso negado.' });
    }

    res.json({
      id: String(id),
      name: name || 'Personagem sem nome',
      type: type || 'protagonista',
      details: details || {},
    });
  } catch (error) {
    console.error('Erro ao atualizar personagem:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar personagem.' });
  }
});

router.delete('/characters/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.character.deleteMany({
      where: {
        id: String(id),
        project: { userId: req.userId },
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Personagem não encontrado ou acesso negado.' });
    }

    res.json({ message: 'Personagem excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar personagem:', error);
    res.status(500).json({ error: 'Erro interno ao excluir personagem.' });
  }
});

// ==========================================
// MUNDO
// ==========================================
router.get('/projects/:projectId/world', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const elements = await prisma.entity.findMany({
      where: { projectId: String(projectId), type: 'WORLD_ELEMENT' },
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
    res.status(500).json({ error: 'Erro interno ao buscar elementos do mundo.' });
  }
});

router.post('/projects/:projectId/world', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, type, customType, description } = req.body;

    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const finalType = type === 'Outros' && customType?.trim() ? customType.trim() : type;

    const newElement = await prisma.entity.create({
      data: {
        projectId: String(projectId),
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
    res.status(500).json({ error: 'Erro interno ao criar elemento do mundo.' });
  }
});

router.put('/world/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, customType, description } = req.body;

    const finalType = type === 'Outros' && customType?.trim() ? customType.trim() : type;

    const updated = await prisma.entity.updateMany({
      where: {
        id: String(id),
        type: 'WORLD_ELEMENT',
        project: { userId: req.userId },
      },
      data: {
        title: name || 'Sem nome',
        data: { 
          elementType: finalType, 
          customType: type === 'Outros' ? customType.trim() : '',
          description: description || '' 
        },
      },
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: 'Elemento do mundo não encontrado ou acesso negado.' });
    }

    res.json({
      id: String(id),
      name: name || 'Sem nome',
      type: finalType,
      customType: type === 'Outros' ? customType.trim() : '',
      description: description || '',
    });
  } catch (error) {
    console.error('Erro ao atualizar elemento do mundo:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar elemento do mundo.' });
  }
});

router.delete('/world/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.entity.deleteMany({
      where: {
        id: String(id),
        type: 'WORLD_ELEMENT',
        project: { userId: req.userId },
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Elemento do mundo não encontrado ou acesso negado.' });
    }

    res.json({ message: 'Elemento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar elemento do mundo:', error);
    res.status(500).json({ error: 'Erro interno ao excluir elemento do mundo.' });
  }
});

// ==========================================
// CENAS
// ==========================================
router.get('/projects/:projectId/scenes', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const scenes = await prisma.entity.findMany({
      where: { projectId: String(projectId), type: 'SCENE' },
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
    res.status(500).json({ error: 'Erro interno ao buscar cenas.' });
  }
});

router.post('/projects/:projectId/scenes', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, ...restData } = req.body;

    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const created = await prisma.entity.create({
      data: {
        projectId: String(projectId),
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
    res.status(500).json({ error: 'Erro interno ao criar cena.' });
  }
});

router.put('/scenes/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, ...restData } = req.body;

    const updated = await prisma.entity.updateMany({
      where: {
        id: String(id),
        type: 'SCENE',
        project: { userId: req.userId },
      },
      data: {
        title: title || 'Cena sem título',
        data: restData || {},
      },
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: 'Cena não encontrada ou acesso negado.' });
    }

    res.json({
      id: String(id),
      title: title || 'Cena sem título',
      ...(restData || {}),
    });
  } catch (error) {
    console.error('Erro ao atualizar cena:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar cena.' });
  }
});

router.delete('/scenes/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.entity.deleteMany({
      where: {
        id: String(id),
        type: 'SCENE',
        project: { userId: req.userId },
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Cena não encontrada ou acesso negado.' });
    }

    res.json({ message: 'Cena excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cena:', error);
    res.status(500).json({ error: 'Erro interno ao excluir cena.' });
  }
});

// ==========================================
// MISTÉRIOS
// ==========================================
router.get('/projects/:projectId/mysteries', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const mysteries = await prisma.entity.findMany({
      where: { projectId: String(projectId), type: 'MYSTERY' },
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
    res.status(500).json({ error: 'Erro interno ao buscar mistérios.' });
  }
});

router.post('/projects/:projectId/mysteries', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, ...restData } = req.body;

    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const created = await prisma.entity.create({
      data: {
        projectId: String(projectId),
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
    res.status(500).json({ error: 'Erro interno ao criar mistério.' });
  }
});

router.put('/mysteries/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, ...restData } = req.body;

    const updated = await prisma.entity.updateMany({
      where: {
        id: String(id),
        type: 'MYSTERY',
        project: { userId: req.userId },
      },
      data: {
        title: title || 'Mistério sem nome',
        data: restData || {},
      },
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: 'Mistério não encontrado ou acesso negado.' });
    }

    res.json({
      id: String(id),
      title: title || 'Mistério sem nome',
      ...(restData || {}),
    });
  } catch (error) {
    console.error('Erro ao atualizar mistério:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar mistério.' });
  }
});

router.delete('/mysteries/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.entity.deleteMany({
      where: {
        id: String(id),
        type: 'MYSTERY',
        project: { userId: req.userId },
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Mistério não encontrado ou acesso negado.' });
    }

    res.json({ message: 'Mistério excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar mistério:', error);
    res.status(500).json({ error: 'Erro interno ao excluir mistério.' });
  }
});

// ==========================================
// PLOT TWISTS
// ==========================================
router.get('/projects/:projectId/twists', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const twists = await prisma.entity.findMany({
      where: { projectId: String(projectId), type: 'PLOT_TWIST' },
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
    res.status(500).json({ error: 'Erro interno ao buscar plot twists.' });
  }
});

router.post('/projects/:projectId/twists', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, ...restData } = req.body;

    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const created = await prisma.entity.create({
      data: {
        projectId: String(projectId),
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
    res.status(500).json({ error: 'Erro interno ao criar plot twist.' });
  }
});

router.put('/twists/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, ...restData } = req.body;

    const updated = await prisma.entity.updateMany({
      where: {
        id: String(id),
        type: 'PLOT_TWIST',
        project: { userId: req.userId },
      },
      data: {
        title: title || 'Plot Twist sem título',
        data: restData || {},
      },
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: 'Plot twist não encontrado ou acesso negado.' });
    }

    res.json({
      id: String(id),
      title: title || 'Plot Twist sem título',
      ...(restData || {}),
    });
  } catch (error) {
    console.error('Erro ao atualizar plot twist:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar plot twist.' });
  }
});

router.delete('/twists/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.entity.deleteMany({
      where: {
        id: String(id),
        type: 'PLOT_TWIST',
        project: { userId: req.userId },
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Plot twist não encontrado ou acesso negado.' });
    }

    res.json({ message: 'Plot twist excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar plot twist:', error);
    res.status(500).json({ error: 'Erro interno ao excluir plot twist.' });
  }
});

// ==========================================
// ESCRITA / CAPÍTULOS
// ==========================================
router.get('/projects/:projectId/chapters', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const chapters = await prisma.entity.findMany({
      where: { projectId: String(projectId), type: 'CHAPTER' },
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
    res.status(500).json({ error: 'Erro interno ao buscar capítulos.' });
  }
});

router.post('/projects/:projectId/chapters', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, type, content } = req.body;

    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const created = await prisma.entity.create({
      data: {
        projectId: String(projectId),
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
    res.status(500).json({ error: 'Erro interno ao criar capítulo.' });
  }
});

router.put('/chapters/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, content } = req.body;

    const updated = await prisma.entity.updateMany({
      where: {
        id: String(id),
        type: 'CHAPTER',
        project: { userId: req.userId },
      },
      data: {
        title: title || 'Novo Capítulo',
        data: { chapterType: type || 'Capítulo', content: content || '' },
      },
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: 'Capítulo não encontrado ou acesso negado.' });
    }

    res.json({
      id: String(id),
      title: title || 'Novo Capítulo',
      type: type || 'Capítulo',
      content: content || '',
    });
  } catch (error) {
    console.error('Erro ao atualizar capítulo:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar capítulo.' });
  }
});

router.delete('/chapters/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.entity.deleteMany({
      where: {
        id: String(id),
        type: 'CHAPTER',
        project: { userId: req.userId },
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Capítulo não encontrado ou acesso negado.' });
    }

    res.json({ message: 'Capítulo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar capítulo:', error);
    res.status(500).json({ error: 'Erro interno ao excluir capítulo.' });
  }
});

// ==========================================
// CHECKLIST
// ==========================================
router.get('/projects/:projectId/checklist', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const entity = await prisma.entity.findFirst({
      where: { projectId: String(projectId), type: 'CHECKLIST' },
    });
    res.json(entity ? entity.data : {});
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao buscar checklist.' });
  }
});

router.post('/projects/:projectId/checklist', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const existing = await prisma.entity.findFirst({
      where: { projectId: String(projectId), type: 'CHECKLIST' },
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
        projectId: String(projectId),
        type: 'CHECKLIST',
        title: 'Checklist de Desenvolvimento',
        data: req.body,
      },
    });
    res.status(201).json(created.data);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao salvar checklist.' });
  }
});

// ==========================================
// STORYBOARD (PERSISTÊNCIA DE DIAGRAMA)
// ==========================================
router.get('/projects/:projectId/storyboard', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const entity = await prisma.entity.findFirst({
      where: { projectId: String(projectId), type: 'STORYBOARD' },
    });
    res.json(entity ? entity.data : { nodes: [], edges: [] });
  } catch (error) {
    console.error('Erro ao buscar Storyboard:', error);
    res.status(500).json({ error: 'Erro interno ao carregar storyboard.' });
  }
});

router.post('/projects/:projectId/storyboard', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { nodes = [], edges = [] } = req.body;

    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const existing = await prisma.entity.findFirst({
      where: { projectId: String(projectId), type: 'STORYBOARD' },
    });

    if (existing) {
      const updated = await prisma.entity.update({
        where: { id: existing.id },
        data: { data: { nodes, edges } },
      });
      return res.json(updated.data);
    }

    const created = await prisma.entity.create({
      data: {
        projectId: String(projectId),
        type: 'STORYBOARD',
        title: 'Storyboard Diagram',
        data: { nodes, edges },
      },
    });

    res.status(201).json(created.data);
  } catch (error) {
    console.error('Erro ao salvar Storyboard:', error);
    res.status(500).json({ error: 'Erro interno ao salvar storyboard.' });
  }
});

// ==========================================
// MAPA EMOCIONAL (PERSISTÊNCIA DE PONTOS)
// ==========================================
router.get('/projects/:projectId/mapa-emocional', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const entity = await prisma.entity.findFirst({
      where: { projectId: String(projectId), type: 'MAPA_EMOCIONAL' },
    });
    res.json(entity ? entity.data : []);
  } catch (error) {
    console.error('Erro ao buscar Mapa Emocional:', error);
    res.status(500).json({ error: 'Erro interno ao carregar mapa emocional.' });
  }
});

router.post('/projects/:projectId/mapa-emocional', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const points = req.body;

    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const existing = await prisma.entity.findFirst({
      where: { projectId: String(projectId), type: 'MAPA_EMOCIONAL' },
    });

    if (existing) {
      const updated = await prisma.entity.update({
        where: { id: existing.id },
        data: { data: points },
      });
      return res.json(updated.data);
    }

    const created = await prisma.entity.create({
      data: {
        projectId: String(projectId),
        type: 'MAPA_EMOCIONAL',
        title: 'Mapa Emocional',
        data: points,
      },
    });

    res.status(201).json(created.data);
  } catch (error) {
    console.error('Erro ao salvar Mapa Emocional:', error);
    res.status(500).json({ error: 'Erro interno ao salvar mapa emocional.' });
  }
});

// ==========================================
// DIÁLOGOS
// ==========================================
router.get('/projects/:projectId/dialogues', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const dialogues = await prisma.entity.findMany({
      where: { projectId: String(projectId), type: 'DIALOGUE' },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = dialogues.map((d) => ({
      id: d.id,
      title: d.title,
      ...(d.data || {}),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar diálogos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar diálogos.' });
  }
});

router.post('/projects/:projectId/dialogues', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, ...restData } = req.body;

    const project = await verifyProjectOwner(projectId, req.userId);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });

    const created = await prisma.entity.create({
      data: {
        projectId: String(projectId),
        type: 'DIALOGUE',
        title: title || 'Diálogo sem título',
        data: restData || {},
      },
    });

    res.status(201).json({
      id: created.id,
      title: created.title,
      ...(created.data || {}),
    });
  } catch (error) {
    console.error('Erro ao criar diálogo:', error);
    res.status(500).json({ error: 'Erro interno ao criar diálogo.' });
  }
});

router.put('/dialogues/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, ...restData } = req.body;

    const updated = await prisma.entity.updateMany({
      where: {
        id: String(id),
        type: 'DIALOGUE',
        project: { userId: req.userId },
      },
      data: {
        title: title || 'Diálogo sem título',
        data: restData || {},
      },
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: 'Diálogo não encontrado ou acesso negado.' });
    }

    res.json({
      id: String(id),
      title: title || 'Diálogo sem título',
      ...(restData || {}),
    });
  } catch (error) {
    console.error('Erro ao atualizar diálogo:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar diálogo.' });
  }
});

router.delete('/dialogues/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.entity.deleteMany({
      where: {
        id: String(id),
        type: 'DIALOGUE',
        project: { userId: req.userId },
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Diálogo não encontrado ou acesso negado.' });
    }

    res.json({ message: 'Diálogo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir diálogo:', error);
    res.status(500).json({ error: 'Erro interno ao excluir diálogo.' });
  }
});

// ==========================================
// EXPORTAÇÃO SEGURA DO PROJETO (.STFG)
// ==========================================
router.get('/projects/:projectId/export-stfg', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findFirst({
      where: { id: String(projectId), userId: req.userId },
      include: {
        user: {
          select: { writerName: true, fullName: true, name: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado ou acesso negado.' });
    }

    const entities = await prisma.entity.findMany({ where: { projectId: project.id } });
    const characters = await prisma.character.findMany({ where: { projectId: project.id } });
    const relations = await prisma.characterRelation.findMany({ where: { projectId: project.id } });

    const authorName = project.user?.writerName || project.user?.fullName || project.user?.name || 'Autor StoryForge';

    const payloadToEncrypt = {
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      exportedBy: authorName,
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        createdAt: project.createdAt,
      },
      entities,
      characters,
      relations,
    };

    // CORREÇÃO: Adicionado o await pois encryptStorybible é assíncrono
    const cryptoResult = await encryptStorybible(payloadToEncrypt);

    const exportPackage = {
      salt: cryptoResult.salt,
      iv: cryptoResult.iv,
      authTag: cryptoResult.authTag,
      encryptedData: cryptoResult.encryptedData,
    };

    const fileName = `${project.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.stfg`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.status(200).send(JSON.stringify(exportPackage, null, 2));
  } catch (error) {
    console.error('Erro ao exportar projeto .stfg:', error);
    return res.status(500).json({ error: 'Erro ao gerar arquivo de exportação criptografado.' });
  }
});

// ==========================================
// IMPORTAÇÃO SEGURA DE PROJETO (.STFG)
// ==========================================
router.post('/projects/import-stfg', requireAuth, upload.single('file'), validateMagicBytes, async (req, res) => {
  try {
    let envelope;

    if (req.file && req.file.path) {
      const fileContent = await fsPromises.readFile(req.file.path, 'utf8');
      envelope = JSON.parse(fileContent);
    } else if (req.body && Object.keys(req.body).length > 0) {
      envelope = req.body;
    } else {
      return res.status(400).json({ error: 'Nenhum arquivo ou conteúdo enviado para importação.' });
    }

    let payload;
    if (envelope.encryptedData && envelope.iv && envelope.authTag) {
      payload = await decryptStorybible(envelope);
    } else if (envelope.projectData) {
      payload = envelope.projectData;
    } else {
      payload = envelope;
    }

    const project = payload.project || payload;
    const entities = payload.entities || [];
    const characters = payload.characters || [];
    const relations = payload.relations || [];

    const rawTitle = project.title || project.name || 'Projeto Importado';
    const cleanTitle = rawTitle.replace(/\s*\(Importado\)\s*/gi, '').trim();

    const exportAuthor = payload.exportedBy || envelope.exportedBy || project.writerName || 'Autor Desconhecido';
    const rawDate = payload.exportedAt || envelope.exportedAt;
    const exportDate = rawDate ? new Date(rawDate).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');

    const newProject = await prisma.project.create({
      data: {
        title: cleanTitle,
        description: `Projeto importado em ${exportDate} por ${exportAuthor}`,
        isImported: true,
        exportedBy: exportAuthor,
        exportedAt: String(exportDate),
        userId: req.userId,
      }
    });

    const characterIdMap = {};
    const sceneIdMap = {};

    for (const char of characters) {
      const oldId = char.id;
      const createdChar = await prisma.character.create({
        data: {
          name: char.name || char.nome || 'Personagem sem nome',
          role: char.role || char.type || char.papel || 'protagonista',
          details: char.details || {},
          projectId: newProject.id
        }
      });
      if (oldId) characterIdMap[oldId] = createdChar.id;
    }

    for (const ent of entities) {
      const oldId = ent.id;
      const createdEnt = await prisma.entity.create({
        data: {
          type: ent.type || 'IDENTITY',
          title: ent.title || '',
          data: ent.data || {},
          projectId: newProject.id
        }
      });
      if (oldId && ent.type === 'SCENE') {
        sceneIdMap[oldId] = createdEnt.id;
      }
    }

    for (const rel of relations) {
      const mappedCharA = characterIdMap[rel.charAId];
      const mappedCharB = characterIdMap[rel.charBId];
      const mappedScene = sceneIdMap[rel.sceneId] || null;

      if (mappedCharA && mappedCharB) {
        await prisma.characterRelation.create({
          data: {
            projectId: newProject.id,
            charAId: String(mappedCharA),
            charBId: String(mappedCharB),
            type: rel.type || 'Amizade',
            intensity: Number(rel.intensity) || 6,
            sceneId: mappedScene ? String(mappedScene) : null,
            description: rel.description || rel.descricao || ''
          }
        });
      }
    }

    return res.status(201).json({
      ...newProject,
      format: project.format || 'Romance / Livro',
      progress: 0,
    });
  } catch (error) {
    console.error('Erro na importação .stfg:', error);
    return res.status(500).json({ error: 'Erro ao processar ficheiro de importação.' });
  } finally {
    if (req.file && req.file.path) {
      await fsPromises.unlink(req.file.path).catch(() => {});
    }
  }
});

export default router;