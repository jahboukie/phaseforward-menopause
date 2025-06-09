import { EcosystemConfig } from '../types';

export const defaultConfig: EcosystemConfig = {
  apiGatewayUrl: process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:3000',
  ssoServiceUrl: process.env.REACT_APP_SSO_SERVICE_URL || 'http://localhost:3001',
  analyticsEngineUrl: process.env.REACT_APP_ANALYTICS_ENGINE_URL || 'http://localhost:3002',
  aiOrchestrationUrl: process.env.REACT_APP_AI_ORCHESTRATION_URL || 'http://localhost:3003',
  providerDashboardUrl: process.env.REACT_APP_PROVIDER_DASHBOARD_URL || 'http://localhost:3004',
  sentimentServiceUrl: process.env.REACT_APP_SENTIMENT_SERVICE_URL || 'http://localhost:3005',
  apiKeys: {
    sentiment: process.env.REACT_APP_SENTIMENT_API_KEY,
    analytics: process.env.REACT_APP_ANALYTICS_API_KEY,
  }
};

export class ApiConfig {
  private static instance: ApiConfig;
  private config: EcosystemConfig;

  private constructor(config: Partial<EcosystemConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  public static getInstance(config?: Partial<EcosystemConfig>): ApiConfig {
    if (!ApiConfig.instance) {
      ApiConfig.instance = new ApiConfig(config);
    }
    return ApiConfig.instance;
  }

  public getConfig(): EcosystemConfig {
    return this.config;
  }

  public updateConfig(updates: Partial<EcosystemConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  public getServiceUrl(service: keyof Omit<EcosystemConfig, 'apiKeys'>): string {
    return this.config[service] as string;
  }

  public getApiKey(service: keyof EcosystemConfig['apiKeys']): string | undefined {
    return this.config.apiKeys[service];
  }
}