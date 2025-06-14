const redis = require('redis');
const logger = require('./logger');

// Create Redis client
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      logger.error('Redis server connection refused');
      return new Error('Redis server connection refused');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      logger.error('Redis retry time exhausted');
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      logger.error('Redis connection attempts exhausted');
      return undefined;
    }
    // Reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
});

// Handle Redis events
client.on('connect', () => {
  logger.info('Redis client connected');
});

client.on('ready', () => {
  logger.info('Redis client ready');
});

client.on('error', (err) => {
  logger.error('Redis client error:', err);
});

client.on('end', () => {
  logger.info('Redis client disconnected');
});

// Connect to Redis
(async () => {
  try {
    await client.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
  }
})();

// Wrapper functions with error handling
const get = async (key) => {
  try {
    return await client.get(key);
  } catch (error) {
    logger.error(`Redis GET error for key ${key}:`, error);
    return null;
  }
};

const set = async (key, value, options = {}) => {
  try {
    if (options.ex) {
      return await client.setEx(key, options.ex, value);
    }
    return await client.set(key, value);
  } catch (error) {
    logger.error(`Redis SET error for key ${key}:`, error);
    return null;
  }
};

const setex = async (key, seconds, value) => {
  try {
    return await client.setEx(key, seconds, value);
  } catch (error) {
    logger.error(`Redis SETEX error for key ${key}:`, error);
    return null;
  }
};

const del = async (key) => {
  try {
    return await client.del(key);
  } catch (error) {
    logger.error(`Redis DEL error for key ${key}:`, error);
    return null;
  }
};

const exists = async (key) => {
  try {
    return await client.exists(key);
  } catch (error) {
    logger.error(`Redis EXISTS error for key ${key}:`, error);
    return false;
  }
};

const expire = async (key, seconds) => {
  try {
    return await client.expire(key, seconds);
  } catch (error) {
    logger.error(`Redis EXPIRE error for key ${key}:`, error);
    return false;
  }
};

const hget = async (key, field) => {
  try {
    return await client.hGet(key, field);
  } catch (error) {
    logger.error(`Redis HGET error for key ${key}, field ${field}:`, error);
    return null;
  }
};

const hset = async (key, field, value) => {
  try {
    return await client.hSet(key, field, value);
  } catch (error) {
    logger.error(`Redis HSET error for key ${key}, field ${field}:`, error);
    return null;
  }
};

const hgetall = async (key) => {
  try {
    return await client.hGetAll(key);
  } catch (error) {
    logger.error(`Redis HGETALL error for key ${key}:`, error);
    return {};
  }
};

// Health check
const healthCheck = async () => {
  try {
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
};

// Graceful shutdown
const shutdown = async () => {
  try {
    await client.quit();
    logger.info('Redis client disconnected gracefully');
  } catch (error) {
    logger.error('Error disconnecting Redis client:', error);
  }
};

// Handle process termination
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = {
  client,
  get,
  set,
  setex,
  del,
  exists,
  expire,
  hget,
  hset,
  hgetall,
  healthCheck
};
