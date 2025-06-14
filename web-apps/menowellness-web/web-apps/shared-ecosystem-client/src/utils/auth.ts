import { jwtDecode } from 'jose';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  appSubscriptions: string[];
  exp: number;
  iat: number;
}

export class AuthManager {
  private static instance: AuthManager;
  private tokens: AuthTokens | null = null;
  private refreshTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    this.loadTokensFromStorage();
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  public setTokens(tokens: AuthTokens): void {
    this.tokens = tokens;
    this.saveTokensToStorage();
    this.scheduleTokenRefresh();
  }

  public getAccessToken(): string | null {
    return this.tokens?.accessToken || null;
  }

  public getRefreshToken(): string | null {
    return this.tokens?.refreshToken || null;
  }

  public isAuthenticated(): boolean {
    if (!this.tokens?.accessToken) return false;
    
    try {
      const decoded = this.decodeToken(this.tokens.accessToken);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  public decodeToken(token: string): DecodedToken {
    try {
      return jwtDecode(token) as DecodedToken;
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  }

  public getUserInfo(): DecodedToken | null {
    if (!this.tokens?.accessToken) return null;
    
    try {
      return this.decodeToken(this.tokens.accessToken);
    } catch {
      return null;
    }
  }

  public logout(): void {
    this.tokens = null;
    this.clearTokensFromStorage();
    
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  public getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private saveTokensToStorage(): void {
    if (this.tokens) {
      localStorage.setItem('ecosystem_tokens', JSON.stringify(this.tokens));
    }
  }

  private loadTokensFromStorage(): void {
    try {
      const stored = localStorage.getItem('ecosystem_tokens');
      if (stored) {
        this.tokens = JSON.parse(stored);
        this.scheduleTokenRefresh();
      }
    } catch {
      // Ignore storage errors
    }
  }

  private clearTokensFromStorage(): void {
    localStorage.removeItem('ecosystem_tokens');
  }

  private scheduleTokenRefresh(): void {
    if (!this.tokens?.accessToken) return;

    try {
      const decoded = this.decodeToken(this.tokens.accessToken);
      const timeToRefresh = (decoded.exp - 300) * 1000 - Date.now(); // 5 minutes before expiry

      if (timeToRefresh > 0) {
        this.refreshTimeout = setTimeout(() => {
          this.refreshTokens();
        }, timeToRefresh);
      }
    } catch {
      // Token is invalid, clear it
      this.logout();
    }
  }

  private async refreshTokens(): Promise<void> {
    if (!this.tokens?.refreshToken) {
      this.logout();
      return;
    }

    try {
      // This would make an API call to refresh tokens
      // Implementation depends on SSO service endpoint
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.tokens.refreshToken }),
      });

      if (response.ok) {
        const newTokens = await response.json();
        this.setTokens(newTokens);
      } else {
        this.logout();
      }
    } catch {
      this.logout();
    }
  }
}