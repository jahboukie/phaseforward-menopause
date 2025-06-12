/**
 * Corporate Wellness Portal - Claude AI Service
 * Intelligent app recommendations and population health insights
 */

import { logger } from '../utils/logger.js';

class ClaudeAIService {
  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    this.model = process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229';
    this.baseURL = 'https://api.anthropic.com/v1/messages';
    
    if (!this.apiKey) {
      logger.warn('ANTHROPIC_API_KEY not configured - Claude AI features will use fallback logic');
    }
  }

  /**
   * Get app recommendations for employee
   */
  async getAppRecommendations(prompt, context = {}) {
    if (!this.apiKey) {
      throw new Error('Claude AI not configured');
    }

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1000,
          temperature: 0.3,
          system: `You are a healthcare wellness expert specializing in employee wellness program optimization. You have deep knowledge of health conditions, life stages, and workplace wellness needs. 

Your role is to recommend the most appropriate wellness apps from a comprehensive healthcare ecosystem based on employee profiles. Consider medical accuracy, life stage appropriateness, and evidence-based wellness interventions.

Always respond in valid JSON format with app recommendations that are medically sound and personalized to the individual's profile.`,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.content[0]?.text;
      
      if (!content) {
        throw new Error('No content in Claude AI response');
      }

      // Parse JSON response
      const recommendations = JSON.parse(content);
      
      // Log successful recommendation
      logger.info('Claude AI app recommendations generated', {
        tenantId: context.tenantId,
        employeeProfile: context.employeeProfile,
        recommendationCount: recommendations.recommendations?.length || 0
      });

      return recommendations;

    } catch (error) {
      logger.error('Claude AI recommendation failed', {
        error: error.message,
        tenantId: context.tenantId
      });
      throw error;
    }
  }

  /**
   * Generate population health insights
   */
  async generatePopulationHealthInsights(tenantId, populationData) {
    if (!this.apiKey) {
      throw new Error('Claude AI not configured');
    }

    const prompt = `
Analyze the following corporate population health data and provide actionable insights for HR leadership:

Population Data:
- Total Employees: ${populationData.totalEmployees}
- Average Age: ${populationData.averageAge}
- Gender Distribution: ${JSON.stringify(populationData.genderDistribution)}
- Department Breakdown: ${JSON.stringify(populationData.departmentBreakdown)}
- Health Risk Factors: ${JSON.stringify(populationData.riskFactors)}
- Current Wellness Program Engagement: ${populationData.engagementRate}%
- Healthcare Costs (last year): $${populationData.healthcareCosts}
- Absenteeism Rate: ${populationData.absenteeismRate}%

Please provide:
1. Key health risks identified in this population
2. Targeted wellness program recommendations
3. Predicted ROI for recommended interventions
4. Early warning indicators to monitor
5. Benchmarking against industry standards

Respond in JSON format with structured insights.`;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 2000,
          temperature: 0.2,
          system: `You are a population health expert and healthcare analytics specialist. You analyze corporate health data to identify trends, risks, and opportunities for intervention.

Your insights should be:
- Evidence-based and clinically sound
- Actionable for HR and executive leadership
- Focused on measurable health outcomes and ROI
- Compliant with healthcare privacy standards

Always provide specific, quantifiable recommendations with expected outcomes.`,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude AI API error: ${response.status}`);
      }

      const data = await response.json();
      const insights = JSON.parse(data.content[0]?.text);

      logger.info('Population health insights generated', {
        tenantId,
        employeeCount: populationData.totalEmployees,
        insightCategories: Object.keys(insights).length
      });

      return insights;

    } catch (error) {
      logger.error('Population health insights generation failed', {
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Analyze wellness program effectiveness
   */
  async analyzeWellnessProgramEffectiveness(tenantId, programData) {
    if (!this.apiKey) {
      throw new Error('Claude AI not configured');
    }

    const prompt = `
Analyze the effectiveness of our corporate wellness program based on the following data:

Program Metrics:
- Program Duration: ${programData.durationMonths} months
- Participation Rate: ${programData.participationRate}%
- App Usage Data: ${JSON.stringify(programData.appUsage)}
- Health Outcomes: ${JSON.stringify(programData.healthOutcomes)}
- Employee Satisfaction: ${programData.satisfactionScore}/10
- Cost Data: ${JSON.stringify(programData.costs)}
- Productivity Metrics: ${JSON.stringify(programData.productivity)}

Please analyze:
1. Program effectiveness across different demographics
2. Which interventions are driving the best outcomes
3. Areas for improvement
4. ROI analysis and cost-effectiveness
5. Recommendations for program optimization
6. Predicted outcomes for next 12 months

Provide detailed analysis in JSON format with specific metrics and recommendations.`;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 2500,
          temperature: 0.1,
          system: `You are a healthcare ROI analyst and wellness program evaluation expert. You specialize in measuring the effectiveness of corporate wellness interventions and optimizing program design for maximum health and financial outcomes.

Your analysis should include:
- Statistical significance of observed changes
- Confounding factor analysis
- Benchmarking against industry standards
- Specific actionable recommendations
- Quantified expected outcomes`,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      const data = await response.json();
      const analysis = JSON.parse(data.content[0]?.text);

      logger.info('Wellness program effectiveness analysis completed', {
        tenantId,
        programDuration: programData.durationMonths,
        participationRate: programData.participationRate
      });

      return analysis;

    } catch (error) {
      logger.error('Wellness program analysis failed', {
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate risk assessment for employee population
   */
  async generateRiskAssessment(tenantId, riskData) {
    if (!this.apiKey) {
      throw new Error('Claude AI not configured');
    }

    const prompt = `
Perform a comprehensive health risk assessment for this employee population:

Risk Data:
- Demographics: ${JSON.stringify(riskData.demographics)}
- Health Conditions: ${JSON.stringify(riskData.healthConditions)}
- Lifestyle Factors: ${JSON.stringify(riskData.lifestyleFactors)}
- Work Environment: ${JSON.stringify(riskData.workEnvironment)}
- Historical Claims Data: ${JSON.stringify(riskData.claimsData)}
- Biometric Screening Results: ${JSON.stringify(riskData.biometrics)}

Analyze and identify:
1. High-risk individuals requiring immediate intervention
2. Emerging health trends in the population
3. Preventable conditions and intervention opportunities
4. Cost projections for identified risks
5. Recommended screening and prevention strategies
6. Early warning indicators for population health monitoring

Provide risk stratification and specific intervention recommendations in JSON format.`;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 2000,
          temperature: 0.2,
          system: `You are a clinical risk assessment specialist with expertise in population health management and preventive medicine. You analyze health data to identify risk patterns and recommend evidence-based interventions.

Your risk assessments should be:
- Clinically accurate and evidence-based
- Actionable with specific intervention recommendations
- Prioritized by risk level and potential impact
- Compliant with healthcare privacy regulations
- Cost-effective and implementable in corporate settings`,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      const data = await response.json();
      const riskAssessment = JSON.parse(data.content[0]?.text);

      logger.info('Risk assessment completed', {
        tenantId,
        populationSize: riskData.demographics?.totalEmployees,
        riskCategories: Object.keys(riskAssessment).length
      });

      return riskAssessment;

    } catch (error) {
      logger.error('Risk assessment failed', {
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate personalized wellness journey
   */
  async generatePersonalizedWellnessJourney(tenantId, employeeProfile) {
    if (!this.apiKey) {
      throw new Error('Claude AI not configured');
    }

    const prompt = `
Create a personalized 12-month wellness journey for this employee:

Employee Profile:
- Age: ${employeeProfile.age}
- Gender: ${employeeProfile.gender}
- Health Conditions: ${JSON.stringify(employeeProfile.healthConditions)}
- Lifestyle Factors: ${JSON.stringify(employeeProfile.lifestyle)}
- Work Role: ${employeeProfile.workRole}
- Stress Level: ${employeeProfile.stressLevel}
- Fitness Level: ${employeeProfile.fitnessLevel}
- Health Goals: ${JSON.stringify(employeeProfile.goals)}
- Available Time: ${employeeProfile.availableTime} hours/week

Design a comprehensive wellness journey including:
1. Phase-based goals (quarterly milestones)
2. Recommended apps and features to use
3. Specific activities and interventions
4. Progress tracking metrics
5. Potential challenges and solutions
6. Expected outcomes and timelines

Provide a detailed, actionable wellness plan in JSON format.`;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 2500,
          temperature: 0.3,
          system: `You are a personalized wellness coach and health behavior specialist. You create individualized wellness plans that are realistic, evidence-based, and achievable within corporate wellness program constraints.

Your wellness journeys should be:
- Scientifically grounded in behavior change theory
- Tailored to individual circumstances and constraints
- Progressive with achievable milestones
- Integrated with available technology platforms
- Measurable with clear success metrics`,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      const data = await response.json();
      const wellnessJourney = JSON.parse(data.content[0]?.text);

      logger.info('Personalized wellness journey created', {
        tenantId,
        employeeAge: employeeProfile.age,
        journeyDuration: '12 months',
        goalCount: wellnessJourney.phases?.length || 0
      });

      return wellnessJourney;

    } catch (error) {
      logger.error('Wellness journey generation failed', {
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Test Claude AI connectivity
   */
  async testConnection() {
    if (!this.apiKey) {
      return { status: 'not_configured', message: 'API key not provided' };
    }

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 50,
          messages: [
            {
              role: 'user',
              content: 'Respond with "Claude AI connection successful" if you can read this message.'
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          status: 'connected', 
          message: 'Claude AI connection successful',
          model: this.model
        };
      } else {
        return { 
          status: 'error', 
          message: `API error: ${response.status} ${response.statusText}` 
        };
      }

    } catch (error) {
      return { 
        status: 'error', 
        message: error.message 
      };
    }
  }
}

// Export singleton instance
export const claudeAIService = new ClaudeAIService();

export default claudeAIService;