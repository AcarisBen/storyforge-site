const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. LISTAR TODAS AS RELAÇÕES DE UM PROJETO
router.get('/entities/projects/:projectId/relations', async (req, res) => {
  const { projectId } = req.params;
  try {
    const query = `
      SELECT 
        id, 
        project_id AS "projectId", 
        char_a_id AS "charAId", 
        char_b_id AS "charBId", 
        type, 
        intensity, 
        scene_id AS "sceneId", 
        description 
      FROM character_relations 
      WHERE project_id = $1 
      ORDER BY id ASC
    `;
    const { rows } = await pool.query(query, [projectId]);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar relações:', err);
    res.status(500).json({ error: 'Erro interno ao buscar relações' });
  }
});

// 2. CRIAR NOVA RELAÇÃO
router.post('/entities/relations', async (req, res) => {
  const { projectId, charAId, charBId, type, intensity, sceneId, description } = req.body;

  if (!charAId || !charBId || charAId === charBId) {
    return res.status(400).json({ error: 'Selecione dois personagens diferentes.' });
  }

  try {
    const query = `
      INSERT INTO character_relations 
        (project_id, char_a_id, char_b_id, type, intensity, scene_id, description) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING 
        id, 
        project_id AS "projectId", 
        char_a_id AS "charAId", 
        char_b_id AS "charBId", 
        type, 
        intensity, 
        scene_id AS "sceneId", 
        description;
    `;
    const values = [
      String(projectId || ''),
      String(charAId),
      String(charBId),
      type || 'Amizade',
      Number(intensity) || 6,
      sceneId ? String(sceneId) : null,
      description || ''
    ];
    
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('ERRO DETALHADO AO CRIAR RELAÇÃO:', err.message, err.stack);
    res.status(500).json({ error: 'Erro interno ao criar relação: ' + err.message });
  }
});

// 3. ATUALIZAR UMA RELAÇÃO EXISTENTE
router.put('/entities/relations/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { charAId, charBId, type, intensity, sceneId, description } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const query = `
      UPDATE character_relations 
      SET 
        char_a_id = $1, 
        char_b_id = $2, 
        type = $3, 
        intensity = $4, 
        scene_id = $5, 
        description = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 
      RETURNING 
        id, 
        project_id AS "projectId", 
        char_a_id AS "charAId", 
        char_b_id AS "charBId", 
        type, 
        intensity, 
        scene_id AS "sceneId", 
        description;
    `;
    const values = [
      String(charAId),
      String(charBId),
      type || 'Amizade',
      Number(intensity) || 6,
      sceneId ? String(sceneId) : null,
      description || '',
      id
    ];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Relação não encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('ERRO DETALHADO AO ATUALIZAR RELAÇÃO:', err.message, err.stack);
    res.status(500).json({ error: 'Erro interno ao atualizar relação: ' + err.message });
  }
});

// 4. DELETAR RELAÇÃO
router.delete('/entities/relations/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const result = await pool.query('DELETE FROM character_relations WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Relação não encontrada' });
    }
    res.json({ message: 'Relação removida com sucesso' });
  } catch (err) {
    console.error('ERRO DETALHADO AO EXCLUIR RELAÇÃO:', err.message, err.stack);
    res.status(500).json({ error: 'Erro interno ao excluir relação: ' + err.message });
  }
});

module.exports = router;