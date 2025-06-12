/**
 * Corporate Wellness Portal - Integration Hub Service
 * Orchestrates data flow between Dr. Alex AI and SentimentAsAService
 * Creates population health intelligence for enterprise clients
 */

import { logger } from '../utils/logger.js';
import { encryptionService } from './encryption.js';
import { claudeAIService } from './claude-ai.js';
import { database } from '../utils/database.js';
import { redisClient } from '../utils/redis.js';

class IntegrationHubService {
  constructor() {
    this.drAlexAIBaseURL = process.env.DRALEXAI_API_URL || 'https://dralexai.com/api';
    this.sentimentAPIBaseURL = process.env.SENTIMENT_API_URL || 'https://sentimentasaservice.com/api';
    this.drAlexAPIKey = process.env.DRALEXAI_API_KEY;
    this.sentimentAPIKey = process.env.SENTIMENT_API_KEY;
    
    // Integration rate limits
    this.rateLimits = {
      drAlexAI: { requests: 100, window: 60000 }, // 100 req/min
      sentiment: { requests: 500, window: 60000 }  // 500 req/min
    };
    
    this.syncIntervals = {
      realTime: 30000,    // 30 seconds for real-time updates
      hourly: 3600000,    // 1 hour for batch processing
      daily: 86400000     // 24 hours for deep analytics
    };
  }

  /**
   * Initialize integration hub with all ecosystem connections
   */
  async initialize() {
    try {
      logger.info('Initializing Integration Hub');
      
      // Test connectivity to all services
      const healthChecks = await Promise.allSettled([
        this.testDrAlexAIConnection(),
        this.testSentimentServiceConnection(),
        this.testClaudeAIConnection()
      ]);
      
      const results = {
        drAlexAI: healthChecks[0].status === 'fulfilled' ? healthChecks[0].value : { status: 'error', error: healthChecks[0].reason },
        sentimentService: healthChecks[1].status === 'fulfilled' ? healthChecks[1].value : { status: 'error', error: healthChecks[1].reason },
        claudeAI: healthChecks[2].status === 'fulfilled' ? healthChecks[2].value : { status: 'error', error: healthChecks[2].reason }
      };
      
      logger.info('Integration Hub health check completed', results);
      
      // Start background sync processes
      this.startBackgroundSync();
      
      return {
        status: 'initialized',
        services: results,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Integration Hub initialization failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate comprehensive population health insights for tenant
   */
  async generatePopulationHealthInsights(tenantId, options = {}) {
    const timer = logger.time('Population Health Insights Generation');
    
    try {
      logger.info('Starting population health insights generation', { tenantId });
      
      // Step 1: Gather anonymized employee data
      const populationData = await this.gatherAnonymizedPopulationData(tenantId);
      
      // Step 2: Send to SentimentAsAService for correlation analysis
      const sentimentAnalysis = await this.analyzePop一ationSentiment(tenantId, populationData);
      
      // Step 3: Generate clinical insights via Dr. Alex AI
      const clinicalInsights = await this.generateClinicalPopulationInsights(tenantId, {
        populationData,
        sentimentAnalysis
      });
      
      // Step 4: Use Claude AI for comprehensive synthesis
      const synthesizedInsights = await this.synthesizePopulationInsights(tenantId, {
        populationData,
        sentimentAnalysis,
        clinicalInsights
      });
      
      // Step 5: Store insights for dashboard display
      const insightRecord = await this.storePopulationInsights(tenantId, synthesizedInsights);
      
      timer.end({ tenantId, insightId: insightRecord.id });
      
      return {
        insightId: insightRecord.id,
        populationSize: populationData.totalEmployees,
        insights: synthesizedInsights,
        generatedAt: new Date().toISOString(),
        dataFreshness: populationData.dataFreshness
      };
      
    } catch (error) {
      logger.error('Population health insights generation failed', {
        tenantId,
        error: error.message
      });
      timer.end({ tenantId, error: error.message });
      throw error;
    }
  }

  /**
   * Real-time employee risk assessment using Dr. Alex AI
   */
  async assessEmployeeRisk(tenantId, employeeId, healthData) {
    try {
      logger.employee(tenantId, employeeId, 'Starting real-time risk assessment');
      
      // Encrypt health data for transmission
      const encryptedHealthData = await encryptionService.encryptPHI(
        healthData, tenantId, employeeId
      );
      
      // Send to Dr. Alex AI for clinical risk assessment
      const riskAssessment = await this.callDrAlexAI('/corporate/risk-assessment', {
        tenantId,
        employeeData: encryptedHealthData,
        assessmentType: 'individual_risk'
      });
      
      // Correlate with population data via SentimentAsAService
      const populationContext = await this.getPopulationRiskContext(tenantId, riskAssessment);
      
      // Generate actionable recommendations
      const recommendations = await this.generateRiskRecommendations(
        tenantId, employeeId, riskAssessment, populationContext
      );
      
      // Store assessment for tracking
      await this.storeRiskAssessment(tenantId, employeeId, {
        riskAssessment,
        recommendations,
        timestamp: new Date()
      });
      
      return {
        riskLevel: riskAssessment.riskLevel,
        riskFactors: riskAssessment.riskFactors,
        recommendations,
        populationPercentile: populationContext.percentile,
        nextAssessment: this.calculateNextAssessmentDate(riskAssessment.riskLevel)
      };
      
    } catch (error) {
      logger.error('Employee risk assessment failed', {
        tenantId,
        employeeId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Wellness program effectiveness analysis
   */
  async analyzeWellnessProgramEffectiveness(tenantId, programId, timeframe = '90d') {
    try {
      logger.business('Analyzing wellness program effectiveness', { tenantId, programId });
      
      // Gather program metrics from multiple sources
      const programMetrics = await this.gatherProgramMetrics(tenantId, programId, timeframe);
      
      // Send engagement data to SentimentAsAService for correlation analysis
      const engagementAnalysis = await this.analyzeEngagementCorrelations(tenantId, programMetrics);
      
      // Get clinical outcome analysis from Dr. Alex AI
      const clinicalOutcomes = await this.analyzeClinicalOutcomes(tenantId, programMetrics);
      
      // Synthesize ROI analysis with Claude AI
      const roiAnalysis = await this.calculateProgramROI(tenantId, {
        programMetrics,
        engagementAnalysis,
        clinicalOutcomes
      });
      
      // Generate optimization recommendations
      const optimizations = await this.generateProgramOptimizations(tenantId, {
        programMetrics,
        engagementAnalysis,
        clinicalOutcomes,
        roiAnalysis
      });
      
      return {
        programId,
        effectivenessScore: roiAnalysis.effectivenessScore,
        roi: roiAnalysis.roi,
        keyFindings: roiAnalysis.keyFindings,
        optimizations,
        benchmarkComparison: await this.getBenchmarkComparison(tenantId, roiAnalysis),
        reportGeneratedAt: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Wellness program analysis failed', {
        tenantId,
        programId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Predictive health analytics using ecosystem intelligence
   */
  async generatePredictiveHealthAnalytics(tenantId, predictionType = 'comprehensive') {
    try {
      logger.business('Generating predictive health analytics', { tenantId, predictionType });
      
      // Gather historical data for ML analysis
      const historicalData = await this.gatherHistoricalHealthData(tenantId);
      
      // Send to SentimentAsAService for trend analysis
      const trendAnalysis = await this.analyzeLongTermTrends(tenantId, historicalData);
      
      // Get clinical predictions from Dr. Alex AI
      const clinicalPredictions = await this.generateClinicalPredictions(tenantId, {
        historicalData,
        trendAnalysis
      });
      
      // Use Claude AI for comprehensive predictive modeling
      const predictiveModel = await this.buildPredictiveModel(tenantId, {
        historicalData,
        trendAnalysis,
        clinicalPredictions
      });
      
      return {
        predictions: predictiveModel.predictions,
        confidence: predictiveModel.confidence,
        timeframe: predictiveModel.timeframe,
        actionableInsights: predictiveModel.actionableInsights,
        earlyWarningIndicators: predictiveModel.earlyWarningIndicators,
        recommendedInterventions: predictiveModel.recommendedInterventions
      };
      
    } catch (error) {
      logger.error('Predictive health analytics failed', {
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Real-time wellness dashboard data sync
   */
  async syncDashboardData(tenantId) {
    try {
      const cacheKey = `dashboard:${tenantId}`;
      
      // Check if recent data exists
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const cachedData = JSON.parse(cached);
        if (Date.now() - cachedData.timestamp < 30000) { // 30 seconds freshness
          return cachedData.data;
        }
      }
      
      // Gather real-time metrics from all sources
      const [
        engagementMetrics,
        riskAlerts,
        programPerformance,
        populationHealth
      ] = await Promise.allSettled([
        this.getRealTimeEngagementMetrics(tenantId),
        this.getActiveRiskAlerts(tenantId),
        this.getCurrentProgramPerformance(tenantId),
        this.getCurrentPopulationHealth(tenantId)
      ]);
      
      const dashboardData = {
        engagement: engagementMetrics.status === 'fulfilled' ? engagementMetrics.value : null,
        riskAlerts: riskAlerts.status === 'fulfilled' ? riskAlerts.value : [],
        programs: programPerformance.status === 'fulfilled' ? programPerformance.value : null,
        population: populationHealth.status === 'fulfilled' ? populationHealth.value : null,
        lastUpdated: new Date().toISOString()
      };
      
      // Cache for 30 seconds
      await redisClient.setex(cacheKey, 30, JSON.stringify({
        data: dashboardData,
        timestamp: Date.now()
      }));
      
      return dashboardData;
      
    } catch (error) {
      logger.error('Dashboard data sync failed', {
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  // =============================================
  // Dr. Alex AI Integration Methods
  // =============================================

  async callDrAlexAI(endpoint, payload) {
    try {
      const response = await fetch(`${this.drAlexAIBaseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.drAlexAPIKey}`,
          'X-Integration-Source': 'corporate-wellness-portal',
          'X-Client-Version': '1.0.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Dr. Alex AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Log successful integration
      await this.logIntegrationEvent('dralexai', endpoint, 'success', {
        tenantId: payload.tenantId,
        responseTime: response.headers.get('x-response-time')
      });

      return data;

    } catch (error) {
      await this.logIntegrationEvent('dralexai', endpoint, 'error', {
        tenantId: payload.tenantId,
        error: error.message
      });
      throw error;
    }
  }

  async generateClinicalPopulationInsights(tenantId, data) {
    return await this.callDrAlexAI('/corporate/population-insights', {
      tenantId,
      populationData: data.populationData,
      sentimentAnalysis: data.sentimentAnalysis,
      analysisType: 'comprehensive_population_health'
    });
  }

  async analyzeClinicalOutcomes(tenantId, programMetrics) {
    return await this.callDrAlexAI('/corporate/clinical-outcomes', {
      tenantId,
      programMetrics,
      analysisType: 'wellness_program_clinical_impact'
    });
  }

  async generateClinicalPredictions(tenantId, data) {
    return await this.callDrAlexAI('/corporate/predictive-analytics', {
      tenantId,
      historicalData: data.historicalData,
      trendAnalysis: data.trendAnalysis,
      predictionType: 'clinical_risk_forecasting'
    });
  }

  // =============================================
  // SentimentAsAService Integration Methods
  // =============================================

  async callSentimentService(endpoint, payload) {
    try {
      const response = await fetch(`${this.sentimentAPIBaseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.sentimentAPIKey,
          'X-Integration-Source': 'corporate-wellness-portal',
          'X-Client-Version': '1.0.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Sentiment API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Log successful integration
      await this.logIntegrationEvent('sentiment', endpoint, 'success', {
        tenantId: payload.tenantId,
        dataPoints: payload.dataPoints?.length
      });

      return data;

    } catch (error) {
      await this.logIntegrationEvent('sentiment', endpoint, 'error', {
        tenantId: payload.tenantId,
        error: error.message
      });
      throw error;
    }
  }

  async analyzePopulationSentiment(tenantId, populationData) {
    return await this.callSentimentService('/enterprise/corporate-analytics', {
      tenantId,
      populationData,
      analysisTypes: ['engagement_correlation', 'wellness_sentiment', 'risk_prediction']
    });
  }

  async analyzeEngagementCorrelations(tenantId, programMetrics) {
    return await this.callSentimentService('/enterprise/engagement-analysis', {
      tenantId,
      programMetrics,
      analysisTypes: ['program_effectiveness', 'user_satisfaction', 'feature_adoption']
    });
  }

  async analyzeLongTermTrends(tenantId, historicalData) {
    return await this.callSentimentService('/enterprise/trend-analysis', {
      tenantId,
      historicalData,
      analysisTypes: ['health_trends', 'engagement_trends', 'outcome_trends']
    });
  }

  // =============================================
  // Claude AI Synthesis Methods
  // =============================================

  async synthesizePopulationInsights(tenantId, data) {
    const prompt = `
Synthesize comprehensive population health insights for corporate wellness program:

Population Data: ${JSON.stringify(data.populationData, null, 2)}
Sentiment Analysis: ${JSON.stringify(data.sentimentAnalysis, null, 2)}
Clinical Insights: ${JSON.stringify(data.clinicalInsights, null, 2)}

Provide executive-level insights including:
1. Key health risks and opportunities
2. Engagement patterns and drivers
3. ROI projections for interventions
4. Specific actionable recommendations
5. Early warning indicators to monitor

Format as comprehensive JSON report for C-suite presentation.`;

    return await claudeAIService.generatePopulationHealthInsights(tenantId, {
      prompt,
      dataContext: data
    });
  }

  async calculateProgramROI(tenantId, data) {
    const prompt = `
Calculate comprehensive ROI for corporate wellness program:

Program Metrics: ${JSON.stringify(data.programMetrics, null, 2)}
Engagement Analysis: ${JSON.stringify(data.engagementAnalysis, null, 2)}
Clinical Outcomes: ${JSON.stringify(data.clinicalOutcomes, null, 2)}

Calculate:
1. Financial ROI (healthcare cost savings, productivity gains)
2. Health outcome improvements
3. Employee satisfaction impact
4. Retention and recruitment benefits
5. Risk reduction value

Provide detailed ROI analysis with specific dollar amounts and percentages.`;

    return await claudeAIService.analyzeWellnessProgramEffectiveness(tenantId, {
      prompt,
      programData: data
    });
  }

  async buildPredictiveModel(tenantId, data) {
    const prompt = `
Build predictive health model for employee population:

Historical Data: ${JSON.stringify(data.historicalData, null, 2)}
Trend Analysis: ${JSON.stringify(data.trendAnalysis, null, 2)}
Clinical Predictions: ${JSON.stringify(data.clinicalPredictions, null, 2)}

Generate 12-month predictions for:
1. Health risk evolution
2. Program engagement trends
3. Intervention opportunities
4. Cost projections
5. Outcome probabilities

Include confidence intervals and recommended actions.`;

    return await claudeAIService.generateRiskAssessment(tenantId, {
      prompt,
      predictionData: data
    });
  }

  // =============================================
  // Data Collection Methods
  // =============================================

  async gatherAnonymizedPopulationData(tenantId) {
    const query = `
      SELECT 
        COUNT(*) as total_employees,
        AVG(EXTRACT(YEAR FROM NOW()) - birth_year) as average_age,
        
        -- Gender distribution
        COUNT(CASE WHEN gender = 'female' THEN 1 END) as female_count,
        COUNT(CASE WHEN gender = 'male' THEN 1 END) as male_count,
        COUNT(CASE WHEN gender IS NULL OR gender = 'other' THEN 1 END) as other_gender_count,
        
        -- Department breakdown
        COUNT(DISTINCT department) as departments_count,
        array_agg(DISTINCT department) as departments,
        
        -- Marital status
        COUNT(CASE WHEN marital_status = 'married' THEN 1 END) as married_count,
        COUNT(CASE WHEN marital_status = 'single' THEN 1 END) as single_count,
        
        -- Dependents
        COUNT(CASE WHEN has_dependents = true THEN 1 END) as with_dependents_count,
        
        -- Account status
        COUNT(CASE WHEN account_status = 'active' THEN 1 END) as active_employees,
        
        -- Onboarding stats
        COUNT(CASE WHEN onboarded_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_onboarding
        
      FROM tenant_main.employees 
      WHERE company_id = $1
    `;
    
    const result = await database.query(query, [tenantId]);
    const data = result.rows[0];
    
    return {
      totalEmployees: parseInt(data.total_employees),
      averageAge: Math.round(parseFloat(data.average_age)),
      genderDistribution: {
        female: parseInt(data.female_count),
        male: parseInt(data.male_count),
        other: parseInt(data.other_gender_count)
      },
      departmentBreakdown: {
        totalDepartments: parseInt(data.departments_count),
        departments: data.departments
      },
      maritalStatus: {
        married: parseInt(data.married_count),
        single: parseInt(data.single_count)
      },
      familyProfile: {
        withDependents: parseInt(data.with_dependents_count)
      },
      engagementMetrics: {
        activeEmployees: parseInt(data.active_employees),
        recentOnboarding: parseInt(data.recent_onboarding)
      },
      dataFreshness: new Date().toISOString()
    };
  }

  // =============================================
  // Connection Test Methods
  // =============================================

  async testDrAlexAIConnection() {
    try {
      const response = await fetch(`${this.drAlexAIBaseURL}/health`, {
        headers: {
          'Authorization': `Bearer ${this.drAlexAPIKey}`
        }
      });
      
      return {
        status: response.ok ? 'connected' : 'error',
        responseTime: response.headers.get('x-response-time'),
        version: response.headers.get('x-api-version')
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  async testSentimentServiceConnection() {
    try {
      const response = await fetch(`${this.sentimentAPIBaseURL}/health`, {
        headers: {
          'X-API-Key': this.sentimentAPIKey
        }
      });
      
      return {
        status: response.ok ? 'connected' : 'error',
        responseTime: response.headers.get('x-response-time'),
        version: response.headers.get('x-api-version')
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  async testClaudeAIConnection() {
    return await claudeAIService.testConnection();
  }

  // =============================================
  // Utility Methods
  // =============================================

  async logIntegrationEvent(service, endpoint, status, metadata) {
    try {
      const eventData = {
        service,
        endpoint,
        status,
        timestamp: new Date().toISOString(),
        ...metadata
      };

      // Store in database for analytics
      await database.query(`
        INSERT INTO tenant_integration.integration_events 
        (tenant_id, service_name, endpoint, status, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [
        metadata.tenantId,
        service,
        endpoint,
        status,
        JSON.stringify(eventData)
      ]);

      logger.integration(`${service} ${endpoint} ${status}`, eventData);

    } catch (error) {
      logger.error('Failed to log integration event', { error: error.message });
    }
  }

  startBackgroundSync() {
    // Real-time sync every 30 seconds
    setInterval(() => {
      this.performRealTimeSync();
    }, this.syncIntervals.realTime);

    // Hourly batch sync
    setInterval(() => {
      this.performHourlySync();
    }, this.syncIntervals.hourly);

    // Daily deep analytics
    setInterval(() => {
      this.performDailySync();
    }, this.syncIntervals.daily);

    logger.info('Background sync processes started');
  }

  async performRealTimeSync() {
    // Implementation for real-time data sync
    logger.debug('Performing real-time sync');
  }

  async performHourlySync() {
    // Implementation for hourly batch sync
    logger.info('Performing hourly sync');
  }

  async performDailySync() {
    // Implementation for daily deep analytics
    logger.info('Performing daily sync');
  }
}

// Export singleton instance
export const integrationHubService = new IntegrationHubService();

export default integrationHubService;