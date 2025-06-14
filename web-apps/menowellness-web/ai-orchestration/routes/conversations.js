const express = require('express');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const db = require('../utils/database');

const router = express.Router();

// Get conversation history for user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { appName, limit = 50 } = req.query;
    
    let query = `
      SELECT 
        ac.id,
        ac.conversation_id,
        ac.ai_persona,
        ac.message_type,
        ac.message_content,
        ac.message_metadata,
        ac.timestamp,
        ac.sentiment_score,
        ac.emotion_tags,
        ar.app_name
      FROM ai_conversations ac
      JOIN app_registrations ar ON ac.app_id = ar.id
      WHERE ac.user_id = $1
    `;
    
    const params = [userId];
    
    if (appName) {
      query += ` AND ar.app_name = $2`;
      params.push(appName);
    }
    
    query += ` ORDER BY ac.timestamp DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      userId,
      conversations: result.rows,
      count: result.rows.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get conversation history:', error);
    res.status(500).json({
      error: 'Failed to get conversation history',
      message: error.message
    });
  }
});

// Analyze conversation patterns
router.post('/analyze', [
  body('userId').isUUID(),
  body('timeframe').optional().isIn(['day', 'week', 'month']),
  body('appName').optional().isLength({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { userId, timeframe = 'week', appName } = req.body;
    
    // Demo analysis - in production this would use AI/ML
    const analysis = {
      userId,
      timeframe,
      appName,
      totalConversations: Math.floor(Math.random() * 50) + 10,
      averageSentiment: 0.7 + Math.random() * 0.3,
      topEmotions: ['hopeful', 'concerned', 'curious'],
      engagementScore: 0.8 + Math.random() * 0.2,
      patterns: [
        'User tends to be more active in evenings',
        'Positive sentiment trend over time',
        'Frequently asks about partner support'
      ],
      recommendations: [
        'Continue current engagement level',
        'Consider introducing partner resources',
        'Monitor for any concerning patterns'
      ]
    };
    
    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to analyze conversations:', error);
    res.status(500).json({
      error: 'Failed to analyze conversations',
      message: error.message
    });
  }
});

// Analyze sentiment of conversation
router.post('/sentiment', [
  body('text').isLength({ min: 1, max: 5000 }),
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

    const { text, context } = req.body;
    
    // Demo sentiment analysis - in production this would use AI/ML
    const sentimentScore = 0.5 + (Math.random() - 0.5) * 0.8; // -0.4 to 0.9
    const emotions = ['neutral', 'hopeful', 'concerned', 'excited', 'worried'];
    const detectedEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    const analysis = {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      sentimentScore,
      sentiment: sentimentScore > 0.6 ? 'positive' : sentimentScore < 0.4 ? 'negative' : 'neutral',
      emotions: [detectedEmotion],
      confidence: 0.7 + Math.random() * 0.3,
      keywords: ['health', 'support', 'journey'],
      urgency: sentimentScore < 0.3 ? 'high' : sentimentScore < 0.5 ? 'medium' : 'low'
    };
    
    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to analyze sentiment:', error);
    res.status(500).json({
      error: 'Failed to analyze sentiment',
      message: error.message
    });
  }
});

module.exports = router;
