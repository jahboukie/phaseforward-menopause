const express = require('express');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

const router = express.Router();

// List all AI personas
router.get('/', async (req, res) => {
  try {
    const personas = [
      {
        appName: 'MyConfidant',
        persona: 'Clinical ALEX',
        description: 'Professional, medical-focused AI for ED treatment',
        specialization: 'Erectile dysfunction, medical guidance',
        tone: 'Professional, clinical, supportive',
        status: 'active'
      },
      {
        appName: 'DrAlexAI',
        persona: 'Experienced Husband ALEX',
        description: 'Relatable, experienced husband for menopause support',
        specialization: 'Partner support, relationship guidance',
        tone: 'Bro-to-bro, experienced, understanding',
        status: 'active'
      },
      {
        appName: 'SoberPal',
        persona: 'Recovery-focused AI',
        description: 'Motivational AI for addiction recovery',
        specialization: 'Addiction recovery, motivation',
        tone: 'Encouraging, understanding, firm',
        status: 'active'
      },
      {
        appName: 'Inner Architect',
        persona: 'Growth-oriented AI',
        description: 'Philosophical AI for personal development',
        specialization: 'Personal growth, self-improvement',
        tone: 'Philosophical, inspiring, thoughtful',
        status: 'active'
      },
      {
        appName: 'MenoTracker',
        persona: 'Empathetic Medical AI',
        description: 'Women-focused medical AI for menopause',
        specialization: 'Menopause symptoms, women\'s health',
        tone: 'Empathetic, medical, supportive',
        status: 'active'
      },
      {
        appName: 'MenoPartner',
        persona: 'Partner-supportive AI',
        description: 'Educational AI for menopause partners',
        specialization: 'Partner education, relationship support',
        tone: 'Educational, supportive, practical',
        status: 'active'
      },
      {
        appName: 'Meno Community',
        persona: 'Community AI',
        description: 'Facilitating AI for peer support',
        specialization: 'Community building, peer support',
        tone: 'Facilitating, inclusive, encouraging',
        status: 'active'
      }
    ];
    
    res.json({
      success: true,
      personas,
      count: personas.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to list personas:', error);
    res.status(500).json({
      error: 'Failed to list personas',
      message: error.message
    });
  }
});

// Configure persona for specific app
router.put('/:appName', [
  body('configuration').isObject(),
  body('configuration.tone').optional().isLength({ min: 1, max: 200 }),
  body('configuration.specialization').optional().isLength({ min: 1, max: 200 }),
  body('configuration.responseStyle').optional().isLength({ min: 1, max: 200 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { appName } = req.params;
    const { configuration } = req.body;
    
    logger.info(`Updating persona configuration for ${appName}`);
    
    res.json({
      success: true,
      message: `Persona configuration updated for ${appName}`,
      appName,
      configuration,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to configure persona:', error);
    res.status(500).json({
      error: 'Failed to configure persona',
      message: error.message
    });
  }
});

// Get persona status
router.get('/:appName/status', async (req, res) => {
  try {
    const { appName } = req.params;
    
    const status = {
      appName,
      status: 'active',
      lastActive: new Date().toISOString(),
      conversationsToday: Math.floor(Math.random() * 100),
      averageResponseTime: '1.2s',
      sentimentScore: 0.85,
      contextSharing: true
    };
    
    res.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get persona status:', error);
    res.status(500).json({
      error: 'Failed to get persona status',
      message: error.message
    });
  }
});

module.exports = router;
