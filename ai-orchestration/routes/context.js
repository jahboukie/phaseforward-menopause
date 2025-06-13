const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const db = require('../utils/database');
const logger = require('../utils/logger');
const { analyzeContextRelevance, generateContextSummary } = require('../services/contextAnalyzer');

const router = express.Router();

// Share context between AI personas
router.post('/share', [
  body('userId').isUUID().withMessage('Valid user ID required'),
  body('sourceApp').isLength({ min: 1 }).withMessage('Source app required'),
  body('targetApp').isLength({ min: 1 }).withMessage('Target app required'),
  body('contextType').isIn(['health_status', 'mood_state', 'treatment_progress', 'relationship_dynamics', 'crisis_alert']).withMessage('Invalid context type'),
  body('contextData').isObject().withMessage('Context data must be an object'),
  body('relevanceScore').optional().isFloat({ min: 0, max: 1 }).withMessage('Relevance score must be between 0 and 1'),
  body('expiresIn').optional().isInt({ min: 1 }).withMessage('Expiration must be positive integer (hours)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      userId,
      sourceApp,
      targetApp,
      contextType,
      contextData,
      relevanceScore,
      expiresIn = 24 // Default 24 hours
    } = req.body;

    // Get app IDs
    const sourceAppResult = await db.query(
      'SELECT id FROM app_registrations WHERE app_name = $1 AND is_active = true',
      [sourceApp]
    );

    const targetAppResult = await db.query(
      'SELECT id FROM app_registrations WHERE app_name = $1 AND is_active = true',
      [targetApp]
    );

    if (sourceAppResult.rows.length === 0 || targetAppResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Invalid app names',
        message: 'One or both apps not found or inactive'
      });
    }

    const sourceAppId = sourceAppResult.rows[0].id;
    const targetAppId = targetAppResult.rows[0].id;

    // Analyze context relevance if not provided
    const finalRelevanceScore = relevanceScore || await analyzeContextRelevance(
      contextType, 
      contextData, 
      sourceApp, 
      targetApp
    );

    // Create context sharing record
    const contextId = uuidv4();
    const expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000);

    await db.query(`
      INSERT INTO ai_context_sharing (
        id, user_id, source_app_id, target_app_id, context_type, 
        context_data, relevance_score, expires_at, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
    `, [
      contextId,
      userId,
      sourceAppId,
      targetAppId,
      contextType,
      JSON.stringify(contextData),
      finalRelevanceScore,
      expiresAt
    ]);

    // Generate context summary for the target app
    const contextSummary = await generateContextSummary(contextType, contextData, targetApp);

    logger.info(`Context shared: ${sourceApp} → ${targetApp} for user ${userId} (${contextType})`);

    res.status(201).json({
      message: 'Context shared successfully',
      contextId,
      relevanceScore: finalRelevanceScore,
      expiresAt,
      summary: contextSummary
    });

  } catch (error) {
    logger.error('Context sharing error:', error);
    res.status(500).json({
      error: 'Context sharing failed',
      message: 'An error occurred while sharing context'
    });
  }
});

// Get shared context for a user
router.get('/:userId', [
  query('targetApp').optional().isLength({ min: 1 }).withMessage('Invalid target app'),
  query('contextType').optional().isLength({ min: 1 }).withMessage('Invalid context type'),
  query('activeOnly').optional().isBoolean().withMessage('Active only must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { userId } = req.params;
    const { targetApp, contextType, activeOnly = true } = req.query;

    let query = `
      SELECT 
        acs.*,
        source_app.app_name as source_app_name,
        target_app.app_name as target_app_name
      FROM ai_context_sharing acs
      JOIN app_registrations source_app ON acs.source_app_id = source_app.id
      JOIN app_registrations target_app ON acs.target_app_id = target_app.id
      WHERE acs.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    // Add filters
    if (targetApp) {
      query += ` AND target_app.app_name = $${paramIndex}`;
      params.push(targetApp);
      paramIndex++;
    }

    if (contextType) {
      query += ` AND acs.context_type = $${paramIndex}`;
      params.push(contextType);
      paramIndex++;
    }

    if (activeOnly) {
      query += ` AND acs.is_active = true AND acs.expires_at > NOW()`;
    }

    query += ` ORDER BY acs.created_at DESC`;

    const result = await db.query(query, params);

    const contexts = result.rows.map(row => ({
      contextId: row.id,
      sourceApp: row.source_app_name,
      targetApp: row.target_app_name,
      contextType: row.context_type,
      contextData: row.context_data,
      relevanceScore: parseFloat(row.relevance_score),
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      isActive: row.is_active && new Date(row.expires_at) > new Date()
    }));

    res.json({
      userId,
      contexts,
      total: contexts.length,
      filters: { targetApp, contextType, activeOnly }
    });

  } catch (error) {
    logger.error('Get context error:', error);
    res.status(500).json({
      error: 'Failed to retrieve context',
      message: 'An error occurred while fetching shared context'
    });
  }
});

// Update context sharing record
router.put('/:contextId', [
  body('relevanceScore').optional().isFloat({ min: 0, max: 1 }).withMessage('Relevance score must be between 0 and 1'),
  body('isActive').optional().isBoolean().withMessage('Is active must be boolean'),
  body('contextData').optional().isObject().withMessage('Context data must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { contextId } = req.params;
    const updates = req.body;

    // Check if context exists
    const existingContext = await db.query(
      'SELECT * FROM ai_context_sharing WHERE id = $1',
      [contextId]
    );

    if (existingContext.rows.length === 0) {
      return res.status(404).json({
        error: 'Context not found',
        message: 'The specified context ID was not found'
      });
    }

    // Build update query
    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'contextData') {
        updateFields.push(`context_data = $${paramIndex}`);
        params.push(JSON.stringify(value));
      } else if (key === 'relevanceScore') {
        updateFields.push(`relevance_score = $${paramIndex}`);
        params.push(value);
      } else if (key === 'isActive') {
        updateFields.push(`is_active = $${paramIndex}`);
        params.push(value);
      }
      paramIndex++;
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'No valid updates provided'
      });
    }

    updateFields.push(`updated_at = NOW()`);
    params.push(contextId);

    const updateQuery = `
      UPDATE ai_context_sharing 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(updateQuery, params);
    const updatedContext = result.rows[0];

    logger.info(`Context updated: ${contextId}`);

    res.json({
      message: 'Context updated successfully',
      context: {
        contextId: updatedContext.id,
        contextType: updatedContext.context_type,
        relevanceScore: parseFloat(updatedContext.relevance_score),
        isActive: updatedContext.is_active,
        updatedAt: updatedContext.updated_at
      }
    });

  } catch (error) {
    logger.error('Update context error:', error);
    res.status(500).json({
      error: 'Context update failed',
      message: 'An error occurred while updating context'
    });
  }
});

// Delete/deactivate context sharing
router.delete('/:contextId', async (req, res) => {
  try {
    const { contextId } = req.params;

    const result = await db.query(`
      UPDATE ai_context_sharing 
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `, [contextId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Context not found',
        message: 'The specified context ID was not found'
      });
    }

    logger.info(`Context deactivated: ${contextId}`);

    res.json({
      message: 'Context sharing deactivated successfully',
      contextId
    });

  } catch (error) {
    logger.error('Delete context error:', error);
    res.status(500).json({
      error: 'Context deletion failed',
      message: 'An error occurred while deactivating context'
    });
  }
});

module.exports = router;
