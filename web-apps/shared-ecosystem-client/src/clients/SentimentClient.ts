import { BaseClient } from './BaseClient';
import { SentimentData, ApiResponse, PaginatedResponse } from '../types';

export interface SentimentAnalysisRequest {
  text: string;
  includeEmotions?: boolean;
  includeKeyTerms?: boolean;
  healthcareContext?: boolean;
  relationshipContext?: boolean;
}

export interface SentimentAnalysisResponse {
  sentiment: {
    score: number;
    category: 'positive' | 'negative' | 'neutral' | 'mixed';
    confidence: number;
  };
  emotions?: Record<string, number>;
  keyTerms?: {
    nouns: string[];
    adjectives: string[];
    verbs: string[];
  };
  processingTime: number;
}

export interface DataIngestionRequest {
  appName: string;
  userId: string;
  textContent: string;
  contextMetadata?: Record<string, any>;
  anonymize?: boolean;
}

export interface BatchIngestionRequest {
  appName: string;
  dataPoints: Array<{
    userId: string;
    textContent: string;
    contextMetadata?: Record<string, any>;
  }>;
  anonymize?: boolean;
}

export interface TrendAnalysisRequest {
  timeframe?: '1d' | '7d' | '30d' | '90d' | '1y';
  appNames?: string[];
  granularity?: 'hour' | 'day' | 'week' | 'month';
  includeBreakdown?: boolean;
}

export interface CorrelationAnalysisRequest {
  appCombinations: string[];
  timeframe?: '7d' | '30d' | '90d';
  minCorrelationStrength?: number;
  analysisType?: string;
}

export class SentimentClient extends BaseClient {
  constructor(baseURL: string) {
    super(baseURL);
  }

  // Public sentiment analysis (no auth required)
  async analyzeSentiment(request: SentimentAnalysisRequest): Promise<ApiResponse<SentimentAnalysisResponse>> {
    return this.post<SentimentAnalysisResponse>('/api/sentiment/analyze', request);
  }

  async analyzeBatch(requests: SentimentAnalysisRequest[]): Promise<ApiResponse<SentimentAnalysisResponse[]>> {
    return this.post<SentimentAnalysisResponse[]>('/api/sentiment/analyze/batch', {
      texts: requests.map(r => r.text),
      includeEmotions: requests[0]?.includeEmotions ?? true,
      includeKeyTerms: requests[0]?.includeKeyTerms ?? false
    });
  }

  async analyzeHealthcare(request: SentimentAnalysisRequest): Promise<ApiResponse<any>> {
    return this.post('/api/sentiment/analyze/healthcare', request);
  }

  async analyzeRelationship(request: SentimentAnalysisRequest): Promise<ApiResponse<any>> {
    return this.post('/api/sentiment/analyze/relationship', request);
  }

  // Data ingestion (requires authentication)
  async ingestData(request: DataIngestionRequest): Promise<ApiResponse<SentimentData>> {
    const headers = this.addApiKey({}, 'sentiment');
    return this.post<SentimentData>('/api/data/ingest', request, { headers });
  }

  async ingestBatch(request: BatchIngestionRequest): Promise<ApiResponse<any>> {
    const headers = this.addApiKey({}, 'sentiment');
    return this.post('/api/data/ingest/batch', request, { headers });
  }

  // Analytics
  async getTrends(request: TrendAnalysisRequest = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams(request as any).toString();
    return this.get(`/api/analytics/trends?${params}`);
  }

  async getCorrelations(request: CorrelationAnalysisRequest): Promise<ApiResponse<any>> {
    const headers = this.addApiKey({}, 'sentiment');
    return this.post('/api/enterprise/analytics/correlations', request, { headers });
  }

  async getOverview(timeframe: string = '30d'): Promise<ApiResponse<any>> {
    return this.get(`/api/analytics/overview?timeframe=${timeframe}`);
  }

  async getBenchmarks(industry: string = 'healthcare'): Promise<ApiResponse<any>> {
    return this.get(`/api/analytics/benchmarks?industry=${industry}`);
  }

  async getInsights(category: string = 'general'): Promise<ApiResponse<any>> {
    return this.get(`/api/analytics/insights?category=${category}`);
  }

  // User data (requires authentication)
  async getUserEvents(
    userId: string,
    options: {
      appName?: string;
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
      sentimentCategory?: string;
    } = {}
  ): Promise<ApiResponse<SentimentData[]>> {
    const params = new URLSearchParams(options as any).toString();
    return this.get<SentimentData[]>(`/api/data/events/user/${userId}?${params}`);
  }

  async getStats(appName?: string, timeframe: string = '7d'): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ appName, timeframe }).toString();
    return this.get(`/api/data/stats?${params}`);
  }

  // Enterprise features (requires enterprise API key)
  async trainModel(request: {
    modelName: string;
    modelType: string;
    trainingData: Record<string, any>;
  }): Promise<ApiResponse<any>> {
    const headers = this.addApiKey({}, 'sentiment');
    return this.post('/api/ml/models/train', request, { headers });
  }

  async getModels(): Promise<ApiResponse<any>> {
    const headers = this.addApiKey({}, 'sentiment');
    return this.get('/api/ml/models', { headers });
  }

  async predictWithModel(request: {
    modelId: string;
    input: string | object;
    includeConfidence?: boolean;
    includeExplanation?: boolean;
  }): Promise<ApiResponse<any>> {
    const headers = this.addApiKey({}, 'sentiment');
    return this.post('/api/ml/models/predict', request, { headers });
  }

  // Real-time monitoring
  async getRealtimeMonitoring(appNames?: string[], alertThreshold: number = 0.3): Promise<ApiResponse<any>> {
    const headers = this.addApiKey({}, 'sentiment');
    const params = new URLSearchParams({ 
      appNames: appNames?.join(','),
      alertThreshold: alertThreshold.toString()
    }).toString();
    return this.get(`/api/enterprise/monitoring/realtime?${params}`, { headers });
  }

  // Billing and usage
  async getUsage(period: string = '30d'): Promise<ApiResponse<any>> {
    const headers = this.addApiKey({}, 'sentiment');
    return this.get(`/api/billing/usage?period=${period}`, { headers });
  }

  async getBillingHistory(limit: number = 12): Promise<ApiResponse<any>> {
    const headers = this.addApiKey({}, 'sentiment');
    return this.get(`/api/billing/history?limit=${limit}`, { headers });
  }

  async getPricing(): Promise<ApiResponse<any>> {
    return this.get('/api/billing/pricing');
  }

  // Health check
  async getHealth(): Promise<ApiResponse<any>> {
    return this.get('/health');
  }

  async getDetailedHealth(): Promise<ApiResponse<any>> {
    return this.get('/health/detailed');
  }
}