import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiConfig } from '../utils/apiConfig';
import { AuthManager } from '../utils/auth';
import { ApiResponse } from '../types';

export abstract class BaseClient {
  protected api: AxiosInstance;
  protected config: ApiConfig;
  protected auth: AuthManager;

  constructor(baseURL: string) {
    this.config = ApiConfig.getInstance();
    this.auth = AuthManager.getInstance();
    
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth headers
    this.api.interceptors.request.use(
      (config) => {
        const authHeaders = this.auth.getAuthHeaders();
        config.headers = { ...config.headers, ...authHeaders };
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, logout user
          this.auth.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  protected async get<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.get(endpoint, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  protected async post<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  protected async put<T>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  protected async delete<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.delete(endpoint, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError<T>(error: any): ApiResponse<T> {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        message: error.response?.data?.message || 'An error occurred',
      };
    }
    
    return {
      success: false,
      error: 'Unknown error',
      message: 'An unexpected error occurred',
    };
  }

  protected addApiKey(headers: Record<string, string>, service: string): Record<string, string> {
    const apiKey = this.config.getApiKey(service as any);
    if (apiKey) {
      return { ...headers, 'x-api-key': apiKey };
    }
    return headers;
  }
}