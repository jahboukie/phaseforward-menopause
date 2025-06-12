/**
 * Corporate Wellness Portal - Redis Client & Caching Manager
 * High-performance caching and session management
 */

import { createClient } from 'redis';
import { logger } from './logger.js';

class RedisManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionRetries = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
    this.defaultTTL = parseInt(process.env.REDIS_TTL) || 86400; // 24 hours
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      const config = {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD || undefined,
        socket: {
          connectTimeout: 5000,
          lazyConnect: true,
          reconnectStrategy: (retries) => {
            if (retries > this.maxRetries) {
              logger.error('Redis max reconnection attempts exceeded');
              return new Error('Redis connection failed');
            }
            const delay = Math.min(retries * 100, 3000);
            logger.info(`Redis reconnecting in ${delay}ms (attempt ${retries})`);
            return delay;
          }
        }
      };

      this.client = createClient(config);

      // Setup event handlers
      this.setupEventHandlers();

      // Connect to Redis
      await this.client.connect();

      // Test connection
      await this.client.ping();

      this.isConnected = true;
      this.connectionRetries = 0;

      logger.info('Redis connected successfully', {
        url: this.sanitizeRedisUrl(config.url)
      });

      return true;

    } catch (error) {
      this.isConnected = false;
      this.connectionRetries++;

      logger.error('Redis connection failed', {
        error: error.message,
        attempt: this.connectionRetries,
        maxRetries: this.maxRetries
      });

      if (this.connectionRetries < this.maxRetries) {
        logger.info(`Retrying Redis connection in ${this.retryDelay / 1000} seconds...`);
        setTimeout(() => this.connect(), this.retryDelay);
      } else {
        throw new Error('Maximum Redis connection retries exceeded');
      }
    }
  }

  /**
   * Setup Redis event handlers
   */
  setupEventHandlers() {
    this.client.on('connect', () => {
      logger.debug('Redis client connected');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      logger.info('Redis client ready');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      logger.error('Redis client error', {
        error: error.message,
        code: error.code
      });
    });

    this.client.on('end', () => {
      this.isConnected = false;
      logger.info('Redis connection ended');
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });
  }

  /**
   * Get value from Redis with error handling
   */
  async get(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const startTime = Date.now();
      const value = await this.client.get(key);
      const duration = Date.now() - startTime;

      logger.debug('Redis GET operation', {
        key: this.sanitizeKey(key),
        found: value !== null,
        durationMs: duration
      });

      return value;

    } catch (error) {
      logger.error('Redis GET failed', {
        key: this.sanitizeKey(key),
        error: error.message
      });
      return null; // Return null on error to prevent app crashes
    }
  }

  /**
   * Set value in Redis with TTL
   */
  async set(key, value, ttl = this.defaultTTL) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const startTime = Date.now();
      await this.client.setEx(key, ttl, value);
      const duration = Date.now() - startTime;

      logger.debug('Redis SET operation', {
        key: this.sanitizeKey(key),
        ttl,
        valueSize: typeof value === 'string' ? value.length : JSON.stringify(value).length,
        durationMs: duration
      });

      return true;

    } catch (error) {
      logger.error('Redis SET failed', {
        key: this.sanitizeKey(key),
        error: error.message
      });
      return false;
    }
  }

  /**
   * Set value with expiration time
   */
  async setex(key, seconds, value) {
    return await this.set(key, value, seconds);
  }

  /**
   * Delete key from Redis
   */
  async del(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.del(key);
      
      logger.debug('Redis DEL operation', {
        key: this.sanitizeKey(key),
        deleted: result > 0
      });

      return result;

    } catch (error) {
      logger.error('Redis DEL failed', {
        key: this.sanitizeKey(key),
        error: error.message
      });
      return 0;
    }
  }

  /**
   * Increment key value
   */
  async incr(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.incr(key);
      
      logger.debug('Redis INCR operation', {
        key: this.sanitizeKey(key),
        newValue: result
      });

      return result;

    } catch (error) {
      logger.error('Redis INCR failed', {
        key: this.sanitizeKey(key),
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Set expiration for existing key
   */
  async expire(key, seconds) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.expire(key, seconds);
      
      logger.debug('Redis EXPIRE operation', {
        key: this.sanitizeKey(key),
        seconds,
        success: result === 1
      });

      return result === 1;

    } catch (error) {
      logger.error('Redis EXPIRE failed', {
        key: this.sanitizeKey(key),
        error: error.message
      });
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.exists(key);
      return result === 1;

    } catch (error) {
      logger.error('Redis EXISTS failed', {
        key: this.sanitizeKey(key),
        error: error.message
      });
      return false;
    }
  }

  /**
   * Get multiple keys at once
   */
  async mget(keys) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const startTime = Date.now();
      const values = await this.client.mGet(keys);
      const duration = Date.now() - startTime;

      logger.debug('Redis MGET operation', {
        keyCount: keys.length,
        foundCount: values.filter(v => v !== null).length,
        durationMs: duration
      });

      return values;

    } catch (error) {
      logger.error('Redis MGET failed', {
        keyCount: keys.length,
        error: error.message
      });
      return new Array(keys.length).fill(null);
    }
  }

  /**
   * Set multiple key-value pairs
   */
  async mset(keyValuePairs) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const startTime = Date.now();
      await this.client.mSet(keyValuePairs);
      const duration = Date.now() - startTime;

      logger.debug('Redis MSET operation', {
        pairCount: Object.keys(keyValuePairs).length,
        durationMs: duration
      });

      return true;

    } catch (error) {
      logger.error('Redis MSET failed', {
        pairCount: Object.keys(keyValuePairs).length,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Hash operations - set hash field
   */
  async hset(key, field, value) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.hSet(key, field, value);
      
      logger.debug('Redis HSET operation', {
        key: this.sanitizeKey(key),
        field,
        newField: result === 1
      });

      return result;

    } catch (error) {
      logger.error('Redis HSET failed', {
        key: this.sanitizeKey(key),
        field,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Hash operations - get hash field
   */
  async hget(key, field) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const value = await this.client.hGet(key, field);
      
      logger.debug('Redis HGET operation', {
        key: this.sanitizeKey(key),
        field,
        found: value !== null
      });

      return value;

    } catch (error) {
      logger.error('Redis HGET failed', {
        key: this.sanitizeKey(key),
        field,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Hash operations - get all hash fields
   */
  async hgetall(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const hash = await this.client.hGetAll(key);
      
      logger.debug('Redis HGETALL operation', {
        key: this.sanitizeKey(key),
        fieldCount: Object.keys(hash).length
      });

      return hash;

    } catch (error) {
      logger.error('Redis HGETALL failed', {
        key: this.sanitizeKey(key),
        error: error.message
      });
      return {};
    }
  }

  /**
   * List operations - push to list
   */
  async lpush(key, ...values) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.lPush(key, values);
      
      logger.debug('Redis LPUSH operation', {
        key: this.sanitizeKey(key),
        valueCount: values.length,
        newLength: result
      });

      return result;

    } catch (error) {
      logger.error('Redis LPUSH failed', {
        key: this.sanitizeKey(key),
        error: error.message
      });
      throw error;
    }
  }

  /**
   * List operations - pop from list
   */
  async lpop(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const value = await this.client.lPop(key);
      
      logger.debug('Redis LPOP operation', {
        key: this.sanitizeKey(key),
        found: value !== null
      });

      return value;

    } catch (error) {
      logger.error('Redis LPOP failed', {
        key: this.sanitizeKey(key),
        error: error.message
      });
      return null;
    }
  }

  /**
   * Cache management - cached function execution
   */
  async cached(key, asyncFunction, ttl = this.defaultTTL) {
    try {
      // Try to get from cache first
      const cached = await this.get(key);
      if (cached !== null) {
        logger.debug('Cache hit', { key: this.sanitizeKey(key) });
        return JSON.parse(cached);
      }

      // Execute function and cache result
      logger.debug('Cache miss, executing function', { key: this.sanitizeKey(key) });
      const startTime = Date.now();
      const result = await asyncFunction();
      const executionTime = Date.now() - startTime;

      // Cache the result
      await this.set(key, JSON.stringify(result), ttl);

      logger.debug('Function result cached', {
        key: this.sanitizeKey(key),
        executionTimeMs: executionTime,
        ttl
      });

      return result;

    } catch (error) {
      logger.error('Cached function execution failed', {
        key: this.sanitizeKey(key),
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Health check for Redis connectivity
   */
  async healthCheck() {
    try {
      const startTime = Date.now();
      const pong = await this.client.ping();
      const latency = Date.now() - startTime;

      return {
        status: 'healthy',
        connected: this.isConnected,
        latency,
        response: pong,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Redis health check failed', {
        error: error.message
      });

      return {
        status: 'unhealthy',
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get Redis server info
   */
  async getInfo() {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const info = await this.client.info();
      return this.parseRedisInfo(info);

    } catch (error) {
      logger.error('Failed to get Redis info', {
        error: error.message
      });
      return null;
    }
  }

  /**
   * Parse Redis INFO command response
   */
  parseRedisInfo(infoString) {
    const info = {};
    const sections = infoString.split('\r\n\r\n');

    sections.forEach(section => {
      const lines = section.split('\r\n');
      let sectionName = 'general';

      lines.forEach(line => {
        if (line.startsWith('# ')) {
          sectionName = line.substring(2).toLowerCase();
          info[sectionName] = {};
        } else if (line.includes(':')) {
          const [key, value] = line.split(':');
          if (info[sectionName]) {
            info[sectionName][key] = isNaN(value) ? value : Number(value);
          }
        }
      });
    });

    return info;
  }

  /**
   * Sanitize Redis URL for logging
   */
  sanitizeRedisUrl(url) {
    if (!url) return 'unknown';
    return url.replace(/:([^:@]*@)/, ':***@');
  }

  /**
   * Sanitize key for logging (prevent logging sensitive data)
   */
  sanitizeKey(key) {
    if (!key) return '';
    
    // Hide sensitive parts of keys
    return key
      .replace(/email:[^:]+/g, 'email:***')
      .replace(/user:[^:]+/g, 'user:***')
      .replace(/session:[^:]+/g, 'session:***');
  }

  /**
   * Close Redis connection
   */
  async quit() {
    try {
      if (this.client && this.isConnected) {
        await this.client.quit();
        this.isConnected = false;
        logger.info('Redis connection closed');
      }
    } catch (error) {
      logger.error('Error closing Redis connection', {
        error: error.message
      });
    }
  }

  /**
   * Force disconnect Redis connection
   */
  async disconnect() {
    try {
      if (this.client) {
        await this.client.disconnect();
        this.isConnected = false;
        logger.info('Redis forcefully disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting Redis', {
        error: error.message
      });
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isReady: this.client?.isReady || false,
      isOpen: this.client?.isOpen || false
    };
  }
}

// Export singleton instance
export const redisClient = new RedisManager();

export default redisClient;