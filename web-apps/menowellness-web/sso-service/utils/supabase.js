const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  logger.warn('Supabase configuration missing - some features may not work');
}

// Create Supabase client for public operations
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Create Supabase admin client for service operations
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * Sync user with Supabase
 * @param {object} userData - User data to sync
 * @returns {object|null} - Supabase user or null
 */
const syncUserWithSupabase = async (userData) => {
  if (!supabaseAdmin) {
    logger.warn('Supabase admin client not available');
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        ecosystem_user_id: userData.id
      }
    });

    if (error) {
      logger.error('Supabase user creation error:', error);
      return null;
    }

    logger.info(`User synced with Supabase: ${userData.email}`);
    return data.user;

  } catch (error) {
    logger.error('Supabase sync error:', error);
    return null;
  }
};

/**
 * Update user in Supabase
 * @param {string} userId - Supabase user ID
 * @param {object} updates - User updates
 * @returns {object|null} - Updated user or null
 */
const updateSupabaseUser = async (userId, updates) => {
  if (!supabaseAdmin) {
    logger.warn('Supabase admin client not available');
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, updates);

    if (error) {
      logger.error('Supabase user update error:', error);
      return null;
    }

    return data.user;

  } catch (error) {
    logger.error('Supabase update error:', error);
    return null;
  }
};

/**
 * Delete user from Supabase
 * @param {string} userId - Supabase user ID
 * @returns {boolean} - Success status
 */
const deleteSupabaseUser = async (userId) => {
  if (!supabaseAdmin) {
    logger.warn('Supabase admin client not available');
    return false;
  }

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      logger.error('Supabase user deletion error:', error);
      return false;
    }

    logger.info(`User deleted from Supabase: ${userId}`);
    return true;

  } catch (error) {
    logger.error('Supabase deletion error:', error);
    return false;
  }
};

/**
 * Verify Supabase token
 * @param {string} token - Supabase JWT token
 * @returns {object|null} - User data or null
 */
const verifySupabaseToken = async (token) => {
  if (!supabase) {
    logger.warn('Supabase client not available');
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      logger.error('Supabase token verification error:', error);
      return null;
    }

    return data.user;

  } catch (error) {
    logger.error('Supabase verification error:', error);
    return null;
  }
};

/**
 * Health check for Supabase connection
 * @returns {boolean} - Connection status
 */
const healthCheck = async () => {
  if (!supabase) {
    return false;
  }

  try {
    // Try to get the current session (will fail gracefully if no session)
    const { data, error } = await supabase.auth.getSession();
    
    // If we get a response (even if no session), Supabase is reachable
    return !error || error.message !== 'Network error';

  } catch (error) {
    logger.error('Supabase health check error:', error);
    return false;
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  syncUserWithSupabase,
  updateSupabaseUser,
  deleteSupabaseUser,
  verifySupabaseToken,
  healthCheck
};
