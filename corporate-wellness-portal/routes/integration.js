/**
 * Corporate Wellness Portal - Integration Hub Routes
 * API endpoints for Dr. Alex AI and SentimentAsAService integration
 */

import express from 'express';
import { integrationHubService } from '../services/integration-hub.js';
import { logger } from '../utils/logger.js';
import { validateTenantResource } from '../middleware/tenant.js';

const router = express.Router();

/**
 * GET /api/integration/health
 * Check health status of all integrated services
 */
router.get('/health', async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    
    const healthStatus = await integrationHubService.initialize();
    
    logger.integration('Integration health check completed', {
      tenantId,
      services: Object.keys(healthStatus.services),
      requestId: req.id
    });
    
    res.json({
      status: 'healthy',
      services: healthStatus.services,
      lastChecked: healthStatus.timestamp,
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Integration health check failed', {
      tenantId: req.tenant?.id,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      requestId: req.id
    });
  }
});

/**
 * POST /api/integration/population-insights
 * Generate comprehensive population health insights
 */
router.post('/population-insights', async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { options = {} } = req.body;
    
    logger.business('Population insights request initiated', {
      tenantId,
      options,
      requestId: req.id
    });
    
    const insights = await integrationHubService.generatePopulationHealthInsights(
      tenantId, 
      options
    );
    
    res.json({
      success: true,
      insights,
      metadata: {
        generatedAt: insights.generatedAt,
        populationSize: insights.populationSize,
        dataFreshness: insights.dataFreshness
      },
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Population insights generation failed', {
      tenantId: req.tenant?.id,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      requestId: req.id
    });
  }
});

/**
 * POST /api/integration/risk-assessment/:employeeId
 * Real-time employee risk assessment
 */
router.post('/risk-assessment/:employeeId', validateTenantResource('employee'), async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { employeeId } = req.params;
    const { healthData } = req.body;
    
    if (!healthData) {
      return res.status(400).json({
        error: 'Health data is required for risk assessment',
        requestId: req.id
      });
    }
    
    logger.employee(tenantId, employeeId, 'Risk assessment requested', {
      dataTypes: Object.keys(healthData),
      requestId: req.id
    });
    
    const riskAssessment = await integrationHubService.assessEmployeeRisk(
      tenantId, 
      employeeId, 
      healthData
    );
    
    res.json({
      success: true,
      employeeId,
      riskAssessment,
      assessedAt: new Date().toISOString(),
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Employee risk assessment failed', {
      tenantId: req.tenant?.id,
      employeeId: req.params.employeeId,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      requestId: req.id
    });
  }
});

/**
 * POST /api/integration/program-analysis/:programId
 * Analyze wellness program effectiveness
 */
router.post('/program-analysis/:programId', async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { programId } = req.params;
    const { timeframe = '90d' } = req.body;
    
    logger.business('Program effectiveness analysis requested', {
      tenantId,
      programId,
      timeframe,
      requestId: req.id
    });
    
    const analysis = await integrationHubService.analyzeWellnessProgramEffectiveness(
      tenantId, 
      programId, 
      timeframe
    );
    
    res.json({
      success: true,
      programId,
      analysis,
      timeframe,
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Program effectiveness analysis failed', {
      tenantId: req.tenant?.id,
      programId: req.params.programId,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      requestId: req.id
    });
  }
});

/**
 * GET /api/integration/predictive-analytics
 * Generate predictive health analytics
 */
router.get('/predictive-analytics', async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { predictionType = 'comprehensive' } = req.query;
    
    logger.business('Predictive analytics requested', {
      tenantId,
      predictionType,
      requestId: req.id
    });
    
    const predictions = await integrationHubService.generatePredictiveHealthAnalytics(
      tenantId, 
      predictionType
    );
    
    res.json({
      success: true,
      predictions,
      predictionType,
      generatedAt: new Date().toISOString(),
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Predictive analytics generation failed', {
      tenantId: req.tenant?.id,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      requestId: req.id
    });
  }
});

/**
 * GET /api/integration/dashboard-data
 * Real-time dashboard data sync
 */
router.get('/dashboard-data', async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    
    const dashboardData = await integrationHubService.syncDashboardData(tenantId);
    
    res.json({
      success: true,
      data: dashboardData,
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Dashboard data sync failed', {
      tenantId: req.tenant?.id,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      requestId: req.id
    });
  }
});

/**
 * POST /api/integration/dralexai/clinical-insights
 * Direct Dr. Alex AI clinical insights integration
 */
router.post('/dralexai/clinical-insights', async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { populationData, analysisType = 'comprehensive_population_health' } = req.body;
    
    if (!populationData) {
      return res.status(400).json({
        error: 'Population data is required',
        requestId: req.id
      });
    }
    
    logger.integration('Dr. Alex AI clinical insights requested', {
      tenantId,
      analysisType,
      populationSize: populationData.totalEmployees,
      requestId: req.id
    });
    
    const insights = await integrationHubService.generateClinicalPopulationInsights(
      tenantId, 
      { populationData }
    );
    
    res.json({
      success: true,
      clinicalInsights: insights,
      analysisType,
      generatedAt: new Date().toISOString(),
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Dr. Alex AI clinical insights failed', {
      tenantId: req.tenant?.id,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      requestId: req.id
    });
  }
});

/**
 * POST /api/integration/sentiment/correlation-analysis
 * Direct SentimentAsAService correlation analysis
 */
router.post('/sentiment/correlation-analysis', async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { dataSet, analysisTypes = ['engagement_correlation', 'wellness_sentiment'] } = req.body;
    
    if (!dataSet) {
      return res.status(400).json({
        error: 'Data set is required for correlation analysis',
        requestId: req.id
      });
    }
    
    logger.integration('SentimentAsAService correlation analysis requested', {
      tenantId,
      analysisTypes,
      dataPoints: Array.isArray(dataSet) ? dataSet.length : 'object',
      requestId: req.id
    });
    
    const correlationResults = await integrationHubService.analyzePopulationSentiment(
      tenantId, 
      dataSet
    );
    
    res.json({
      success: true,
      correlationResults,
      analysisTypes,
      processedAt: new Date().toISOString(),
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('SentimentAsAService correlation analysis failed', {
      tenantId: req.tenant?.id,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      requestId: req.id
    });
  }
});

/**
 * GET /api/integration/real-time-metrics
 * Real-time engagement and health metrics
 */
router.get('/real-time-metrics', async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { metrics = 'all' } = req.query;
    
    // This would gather real-time metrics from integrated services
    const realTimeData = {
      engagement: {
        activeUsers: 1250,
        dailyActiveRate: 67.3,
        averageSessionTime: 12.5,
        topApps: ['innerarchitect', 'menowellness', 'supportpartner']
      },
      health: {
        riskAlertsCount: 3,
        populationHealthScore: 8.2,
        improvementTrend: 'positive',
        interventionsActive: 15
      },
      programs: {
        activePrograms: 8,
        participationRate: 78.5,
        completionRate: 65.2,
        satisfactionScore: 8.7
      },
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      metrics: realTimeData,
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Real-time metrics fetch failed', {
      tenantId: req.tenant?.id,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      requestId: req.id
    });
  }
});

/**
 * POST /api/integration/claude-ai/synthesize
 * Direct Claude AI synthesis for complex analysis
 */
router.post('/claude-ai/synthesize', async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { analysisType, dataInputs, customPrompt } = req.body;
    
    if (!dataInputs || !analysisType) {
      return res.status(400).json({
        error: 'Analysis type and data inputs are required',
        requestId: req.id
      });
    }
    
    logger.integration('Claude AI synthesis requested', {
      tenantId,
      analysisType,
      dataInputCount: Object.keys(dataInputs).length,
      requestId: req.id
    });
    
    let synthesisResult;
    
    switch (analysisType) {
      case 'population_health':
        synthesisResult = await integrationHubService.synthesizePopulationInsights(tenantId, dataInputs);
        break;
      case 'program_roi':
        synthesisResult = await integrationHubService.calculateProgramROI(tenantId, dataInputs);
        break;
      case 'predictive_model':
        synthesisResult = await integrationHubService.buildPredictiveModel(tenantId, dataInputs);
        break;
      default:
        return res.status(400).json({
          error: `Unknown analysis type: ${analysisType}`,
          supportedTypes: ['population_health', 'program_roi', 'predictive_model'],
          requestId: req.id
        });
    }
    
    res.json({
      success: true,
      analysisType,
      synthesis: synthesisResult,
      generatedAt: new Date().toISOString(),
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Claude AI synthesis failed', {
      tenantId: req.tenant?.id,
      analysisType: req.body.analysisType,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      requestId: req.id
    });
  }
});

/**
 * GET /api/integration/ecosystem-status
 * Complete ecosystem health and integration status
 */
router.get('/ecosystem-status', async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    
    const [healthStatus, integrationStats] = await Promise.allSettled([
      integrationHubService.initialize(),
      getIntegrationStatistics(tenantId)
    ]);
    
    const ecosystemStatus = {
      overall: 'healthy',
      services: healthStatus.status === 'fulfilled' ? healthStatus.value.services : {},
      statistics: integrationStats.status === 'fulfilled' ? integrationStats.value : {},
      lastChecked: new Date().toISOString()
    };
    
    // Determine overall health
    const services = ecosystemStatus.services;
    const serviceStatuses = Object.values(services).map(s => s.status);
    
    if (serviceStatuses.includes('error')) {
      ecosystemStatus.overall = serviceStatuses.filter(s => s === 'connected').length > 0 ? 'degraded' : 'unhealthy';
    }
    
    res.json({
      success: true,
      ecosystem: ecosystemStatus,
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Ecosystem status check failed', {
      tenantId: req.tenant?.id,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      requestId: req.id
    });
  }
});

// Helper function to get integration statistics
async function getIntegrationStatistics(tenantId) {
  // This would query integration event logs and return statistics
  return {
    totalRequests24h: 1250,
    successRate: 99.2,
    averageResponseTime: 245,
    popularEndpoints: [
      '/population-insights',
      '/dashboard-data',
      '/risk-assessment'
    ],
    errorRate: 0.8,
    lastError: null
  };
}

export default router;