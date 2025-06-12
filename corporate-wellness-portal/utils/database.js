/**
 * Corporate Wellness Portal - Database Connection & Query Manager
 * Multi-tenant PostgreSQL with connection pooling and security
 */

import pg from 'pg';
import { logger } from './logger.js';

const { Pool } = pg;

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.isConnected = false;
    this.connectionRetries = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
  }

  /**
   * Initialize database connection pool
   */
  async connect() {
    try {
      const config = {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
        max: parseInt(process.env.DATABASE_POOL_SIZE) || 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        statement_timeout: 30000,
        query_timeout: 30000
      };

      this.pool = new Pool(config);

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      this.isConnected = true;
      this.connectionRetries = 0;

      logger.info('Database connected successfully', {
        maxConnections: config.max,
        database: this.extractDatabaseName(process.env.DATABASE_URL)
      });

      // Setup connection event handlers
      this.setupEventHandlers();

      return true;

    } catch (error) {
      this.isConnected = false;
      this.connectionRetries++;

      logger.error('Database connection failed', {
        error: error.message,
        attempt: this.connectionRetries,
        maxRetries: this.maxRetries
      });

      if (this.connectionRetries < this.maxRetries) {
        logger.info(`Retrying database connection in ${this.retryDelay / 1000} seconds...`);
        setTimeout(() => this.connect(), this.retryDelay);
      } else {
        throw new Error('Maximum database connection retries exceeded');
      }
    }
  }

  /**
   * Setup database event handlers
   */
  setupEventHandlers() {
    this.pool.on('connect', (client) => {
      logger.debug('New database client connected', {
        totalConnections: this.pool.totalCount,
        idleConnections: this.pool.idleCount,
        waitingConnections: this.pool.waitingCount
      });
    });

    this.pool.on('acquire', (client) => {
      logger.debug('Database client acquired from pool');
    });

    this.pool.on('remove', (client) => {
      logger.debug('Database client removed from pool');
    });

    this.pool.on('error', (error, client) => {
      logger.error('Database pool error', {
        error: error.message,
        stack: error.stack
      });
    });
  }

  /**
   * Execute database query with error handling and logging
   */
  async query(text, params = [], options = {}) {
    const startTime = process.hrtime.bigint();
    let client = null;

    try {
      if (!this.isConnected) {
        throw new Error('Database not connected');
      }

      client = await this.pool.connect();
      
      // Log query for debugging (sanitized)
      logger.debug('Executing database query', {
        query: this.sanitizeQuery(text),
        paramCount: params.length,
        options
      });

      const result = await client.query(text, params);
      
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

      logger.debug('Query completed successfully', {
        duration: Math.round(duration * 100) / 100,
        rowCount: result.rowCount
      });

      return result;

    } catch (error) {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;

      logger.error('Database query failed', {
        error: error.message,
        query: this.sanitizeQuery(text),
        duration: Math.round(duration * 100) / 100,
        code: error.code,
        constraint: error.constraint
      });

      throw error;

    } finally {
      if (client) {
        client.release();
      }
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  async transaction(queries) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const results = [];
      for (const { text, params } of queries) {
        const result = await client.query(text, params);
        results.push(result);
      }
      
      await client.query('COMMIT');
      
      logger.info('Transaction completed successfully', {
        queryCount: queries.length
      });
      
      return results;
      
    } catch (error) {
      await client.query('ROLLBACK');
      
      logger.error('Transaction failed and rolled back', {
        error: error.message,
        queryCount: queries.length
      });
      
      throw error;
      
    } finally {
      client.release();
    }
  }

  /**
   * Get database statistics
   */
  async getStatistics() {
    try {
      const stats = {
        pool: {
          totalConnections: this.pool.totalCount,
          idleConnections: this.pool.idleCount,
          waitingConnections: this.pool.waitingCount
        },
        database: {},
        tenants: {}
      };

      // Get database size and connection info
      const dbStatsQuery = `
        SELECT 
          pg_database_size(current_database()) as database_size,
          (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()) as active_connections,
          current_database() as database_name
      `;
      
      const dbResult = await this.query(dbStatsQuery);
      stats.database = dbResult.rows[0];

      // Get tenant statistics
      const tenantStatsQuery = `
        SELECT 
          COUNT(*) as total_tenants,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tenants,
          COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as subscribed_tenants
        FROM tenant_main.companies
      `;
      
      const tenantResult = await this.query(tenantStatsQuery);
      stats.tenants = tenantResult.rows[0];

      return stats;

    } catch (error) {
      logger.error('Failed to get database statistics', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Health check for database connectivity
   */
  async healthCheck() {
    try {
      const result = await this.query('SELECT 1 as health_check, NOW() as timestamp');
      
      return {
        status: 'healthy',
        timestamp: result.rows[0].timestamp,
        connectionPool: {
          total: this.pool.totalCount,
          idle: this.pool.idleCount,
          waiting: this.pool.waitingCount
        }
      };

    } catch (error) {
      logger.error('Database health check failed', {
        error: error.message
      });

      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Execute raw SQL with tenant context validation
   */
  async queryWithTenantContext(text, params, tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID required for tenant context queries');
    }

    // Add tenant context to query logging
    logger.debug('Executing tenant-scoped query', {
      tenantId,
      query: this.sanitizeQuery(text)
    });

    return await this.query(text, params);
  }

  /**
   * Bulk insert with efficient batching
   */
  async bulkInsert(tableName, columns, data, batchSize = 1000) {
    if (!data || data.length === 0) {
      return { insertedCount: 0, batches: 0 };
    }

    const startTime = Date.now();
    let totalInserted = 0;
    let batchCount = 0;

    try {
      // Process data in batches
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        batchCount++;

        // Generate parameterized query
        const valueStrings = batch.map((_, index) => {
          const paramStart = index * columns.length + 1;
          const params = Array.from(
            { length: columns.length }, 
            (_, i) => `$${paramStart + i}`
          );
          return `(${params.join(', ')})`;
        });

        const query = `
          INSERT INTO ${tableName} (${columns.join(', ')})
          VALUES ${valueStrings.join(', ')}
        `;

        const flatParams = batch.flat();
        const result = await this.query(query, flatParams);
        totalInserted += result.rowCount;

        logger.debug('Bulk insert batch completed', {
          tableName,
          batchNumber: batchCount,
          batchSize: batch.length,
          totalInserted
        });
      }

      const duration = Date.now() - startTime;
      
      logger.info('Bulk insert completed', {
        tableName,
        totalRecords: data.length,
        insertedCount: totalInserted,
        batches: batchCount,
        durationMs: duration,
        recordsPerSecond: Math.round(totalInserted / (duration / 1000))
      });

      return {
        insertedCount: totalInserted,
        batches: batchCount,
        durationMs: duration
      };

    } catch (error) {
      logger.error('Bulk insert failed', {
        tableName,
        error: error.message,
        totalRecords: data.length,
        batchCount
      });
      throw error;
    }
  }

  /**
   * Sanitize query for logging (remove sensitive data)
   */
  sanitizeQuery(query) {
    if (!query) return '';
    
    // Remove potential sensitive values
    return query
      .replace(/('\w*@\w+\.\w+')/g, "'***EMAIL***'")
      .replace(/('\d{3}-\d{2}-\d{4}')/g, "'***SSN***'")
      .replace(/(password\s*=\s*')[^']*'/gi, "password='***'")
      .replace(/(token\s*=\s*')[^']*'/gi, "token='***'")
      .substring(0, 500); // Limit length
  }

  /**
   * Extract database name from connection string
   */
  extractDatabaseName(connectionString) {
    try {
      const url = new URL(connectionString);
      return url.pathname.substring(1); // Remove leading slash
    } catch {
      return 'unknown';
    }
  }

  /**
   * Close database connection pool
   */
  async end() {
    try {
      if (this.pool) {
        await this.pool.end();
        this.isConnected = false;
        logger.info('Database connection pool closed');
      }
    } catch (error) {
      logger.error('Error closing database connection pool', {
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
      totalConnections: this.pool?.totalCount || 0,
      idleConnections: this.pool?.idleCount || 0,
      waitingConnections: this.pool?.waitingCount || 0
    };
  }

  /**
   * Execute query with retry logic
   */
  async queryWithRetry(text, params = [], maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.query(text, params);
      } catch (error) {
        lastError = error;
        
        // Check if error is retryable
        if (this.isRetryableError(error) && attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
          
          logger.warn('Query failed, retrying', {
            attempt,
            maxRetries,
            delayMs: delay,
            error: error.message
          });
          
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  }

  /**
   * Check if database error is retryable
   */
  isRetryableError(error) {
    const retryableCodes = [
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED',
      'ETIMEDOUT',
      '53300', // PostgreSQL too many connections
      '57P01', // PostgreSQL admin shutdown
      '53200'  // PostgreSQL out of memory
    ];
    
    return retryableCodes.includes(error.code);
  }
}

// Export singleton instance
export const database = new DatabaseManager();

export default database;