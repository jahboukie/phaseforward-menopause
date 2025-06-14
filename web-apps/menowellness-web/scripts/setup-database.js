#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`)
};

async function setupDatabase() {
  let pool;
  
  try {
    logger.info('Starting database setup...');

    // Create connection pool
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Test connection
    logger.info('Testing database connection...');
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('Database connection successful');

    // Read and execute init script
    logger.info('Reading database initialization script...');
    const initScriptPath = path.join(__dirname, 'init-db.sql');
    
    if (!fs.existsSync(initScriptPath)) {
      throw new Error('Database initialization script not found');
    }

    const initScript = fs.readFileSync(initScriptPath, 'utf8');
    
    logger.info('Executing database initialization...');
    await pool.query(initScript);
    
    logger.info('Database setup completed successfully!');
    
    // Verify tables were created
    logger.info('Verifying table creation...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    logger.info(`Created tables: ${tables.join(', ')}`);
    
    // Check app registrations
    const appsResult = await pool.query('SELECT app_name FROM app_registrations');
    const apps = appsResult.rows.map(row => row.app_name);
    logger.info(`Registered apps: ${apps.join(', ')}`);
    
    logger.info('Database setup verification completed');

  } catch (error) {
    logger.error(`Database setup failed: ${error.message}`);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
