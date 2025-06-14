const { Pool } = require('pg');
const logger = require('./logger');

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Handle pool errors
pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    logger.error('Error acquiring client', err.stack);
    return;
  }
  
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      logger.error('Error executing query', err.stack);
      return;
    }
    logger.info('Analytics Engine database connected successfully');
  });
});

// Query wrapper with error handling and logging
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (> 200ms for analytics)
    if (duration > 200) {
      logger.warn(`Slow analytics query detected: ${duration}ms`, { query: text, params });
    }
    
    return res;
  } catch (error) {
    logger.error('Analytics database query error:', { error: error.message, query: text, params });
    throw error;
  }
};

// Transaction wrapper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Batch insert for analytics events
const batchInsert = async (table, columns, values) => {
  if (!values.length) return { rowCount: 0 };

  const placeholders = values.map((_, i) => 
    `(${columns.map((_, j) => `$${i * columns.length + j + 1}`).join(', ')})`
  ).join(', ');

  const flatValues = values.flat();
  const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`;

  return await pool.query(query, flatValues);
};

// Aggregation query helper
const aggregateQuery = async (table, groupBy, aggregations, filters = {}, timeRange = null) => {
  let query = `SELECT ${groupBy.join(', ')}, ${aggregations.join(', ')} FROM ${table}`;
  const params = [];
  let paramIndex = 1;

  // Add filters
  const whereConditions = [];
  Object.entries(filters).forEach(([column, value]) => {
    whereConditions.push(`${column} = $${paramIndex}`);
    params.push(value);
    paramIndex++;
  });

  // Add time range filter
  if (timeRange) {
    whereConditions.push(`timestamp >= $${paramIndex} AND timestamp <= $${paramIndex + 1}`);
    params.push(timeRange.start, timeRange.end);
    paramIndex += 2;
  }

  if (whereConditions.length > 0) {
    query += ` WHERE ${whereConditions.join(' AND ')}`;
  }

  if (groupBy.length > 0) {
    query += ` GROUP BY ${groupBy.join(', ')}`;
  }

  return await pool.query(query, params);
};

// Health check
const healthCheck = async () => {
  try {
    const result = await query('SELECT 1 as health_check');
    return result.rows[0].health_check === 1;
  } catch (error) {
    logger.error('Analytics database health check failed:', error);
    return false;
  }
};

// Get database statistics
const getStats = async () => {
  try {
    const stats = await query(`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples
      FROM pg_stat_user_tables 
      WHERE schemaname = 'public'
      ORDER BY n_live_tup DESC
    `);

    return stats.rows;
  } catch (error) {
    logger.error('Failed to get database stats:', error);
    return [];
  }
};

// Graceful shutdown
const shutdown = async () => {
  try {
    await pool.end();
    logger.info('Analytics database pool closed');
  } catch (error) {
    logger.error('Error closing analytics database pool:', error);
  }
};

// Handle process termination
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = {
  query,
  transaction,
  batchInsert,
  aggregateQuery,
  healthCheck,
  getStats,
  pool
};
