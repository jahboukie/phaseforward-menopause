const express = require('express');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { generateRecommendations } = require('../services/contextAnalyzer');

const router = express.Router();

// Generate recommendations
router.post('/generate', [
  body('userId').isUUID(),
  body('currentApp').isLength({ min: 1, max: 100 }),
  body('context').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { userId, currentApp, context } = req.body;
    
    const recommendations = await generateRecommendations(userId, currentApp);
    
    res.json({
      success: true,
      recommendations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Recommendation generation failed:', error);
    res.status(500).json({
      error: 'Failed to generate recommendations',
      message: error.message
    });
  }
});

// Get cross-app recommendations for user
router.get('/cross-app/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Demo implementation
    const recommendations = [
      {
        id: '1',
        targetApp: 'DrAlexAI',
        title: 'Partner Support Available',
        description: 'Your partner can get support through menopause journey',
        confidence: 0.85,
        type: 'cross_app'
      },
      {
        id: '2',
        targetApp: 'MenoTracker',
        title: 'Track Your Symptoms',
        description: 'Comprehensive symptom tracking for better insights',
        confidence: 0.78,
        type: 'feature'
      }
    ];
    
    res.json({
      success: true,
      userId,
      recommendations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get cross-app recommendations:', error);
    res.status(500).json({
      error: 'Failed to get recommendations',
      message: error.message
    });
  }
});

// Provide feedback on recommendation
router.post('/:recommendationId/feedback', [
  body('feedback').isIn(['helpful', 'not_helpful', 'irrelevant']),
  body('comment').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { recommendationId } = req.params;
    const { feedback, comment } = req.body;
    
    logger.info(`Received feedback for recommendation ${recommendationId}: ${feedback}`);
    
    res.json({
      success: true,
      message: 'Feedback recorded successfully',
      recommendationId,
      feedback
    });

  } catch (error) {
    logger.error('Failed to record feedback:', error);
    res.status(500).json({
      error: 'Failed to record feedback',
      message: error.message
    });
  }
});

module.exports = router;
