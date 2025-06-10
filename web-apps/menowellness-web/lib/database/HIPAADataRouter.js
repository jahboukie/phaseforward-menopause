// HIPAA Data Router - Routes data to appropriate database based on PHI classification
import { createClient } from '@supabase/supabase-js';
import AWS from 'aws-sdk';
import { HealthcareEncryption } from './HealthcareEncryption.js';

// Data Classification Schema
const DATA_CLASSIFICATION = {
  PHI: [
    'menopause_symptoms',
    'patient_assessments', 
    'chat_conversations',
    'medical_history',
    'personal_health_data',
    'symptom_tracking',
    'health_insights',
    'provider_communications'
  ],
  NON_PHI: [
    'demo_data',
    'analytics_aggregated',
    'session_tokens',
    'user_preferences',
    'subscription_data',
    'usage_tracking',
    'app_analytics',
    'provider_preferences'
  ]
};

// Initialize database connections
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// AWS RDS Configuration for HIPAA compliance
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const rds = new AWS.RDSDataService();

export class HIPAADataRouter {
  /**
   * Main data storage method - routes to appropriate database
   * @param {Object} data - Data to store
   * @param {string} tableName - Table/collection name
   * @param {string} operation - 'create', 'read', 'update', 'delete'
   * @returns {Promise} - Database operation result
   */
  static async storeData(data, tableName, operation = 'create') {
    const dataType = this.classifyData(tableName);
    
    // Log data access for HIPAA audit trail
    await this.logDataAccess(tableName, operation, dataType);
    
    if (dataType === 'PHI') {
      console.log(`🔒 Routing PHI data to AWS RDS: ${tableName}`);
      return await this.handleAWSOperation(data, tableName, operation);
    } else {
      console.log(`📊 Routing non-PHI data to Supabase: ${tableName}`);
      return await this.handleSupabaseOperation(data, tableName, operation);
    }
  }

  /**
   * Classify data as PHI or NON-PHI based on table name
   */
  static classifyData(tableName) {
    if (DATA_CLASSIFICATION.PHI.includes(tableName)) {
      return 'PHI';
    } else if (DATA_CLASSIFICATION.NON_PHI.includes(tableName)) {
      return 'NON_PHI';
    } else {
      // Default to PHI for safety - better to be overly cautious with healthcare data
      console.warn(`⚠️ Unknown table ${tableName} - defaulting to PHI classification`);
      return 'PHI';
    }
  }

  /**
   * Handle AWS RDS operations for PHI data
   */
  static async handleAWSOperation(data, tableName, operation) {
    try {
      switch (operation) {
        case 'create':
          return await this.createInAWS(data, tableName);
        case 'read':
          return await this.readFromAWS(data, tableName);
        case 'update':
          return await this.updateInAWS(data, tableName);
        case 'delete':
          return await this.deleteFromAWS(data, tableName);
        default:
          throw new Error(`Unsupported AWS operation: ${operation}`);
      }
    } catch (error) {
      console.error('AWS operation failed:', error);
      throw new Error(`HIPAA database operation failed: ${error.message}`);
    }
  }

  /**
   * Handle Supabase operations for non-PHI data
   */
  static async handleSupabaseOperation(data, tableName, operation) {
    try {
      switch (operation) {
        case 'create':
          const { data: result, error } = await supabase
            .from(tableName)
            .insert(data)
            .select();
          if (error) throw error;
          return result;

        case 'read':
          const { data: readResult, error: readError } = await supabase
            .from(tableName)
            .select(data.select || '*')
            .match(data.where || {});
          if (readError) throw readError;
          return readResult;

        case 'update':
          const { data: updateResult, error: updateError } = await supabase
            .from(tableName)
            .update(data.updates)
            .match(data.where)
            .select();
          if (updateError) throw updateError;
          return updateResult;

        case 'delete':
          const { data: deleteResult, error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .match(data.where);
          if (deleteError) throw deleteError;
          return deleteResult;

        default:
          throw new Error(`Unsupported Supabase operation: ${operation}`);
      }
    } catch (error) {
      console.error('Supabase operation failed:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  /**
   * Create encrypted PHI data in AWS RDS
   */
  static async createInAWS(data, tableName) {
    // Encrypt sensitive health data before storing
    const encryptedData = await HealthcareEncryption.encrypt(data);
    
    const params = {
      resourceArn: process.env.AWS_RDS_CLUSTER_ARN,
      secretArn: process.env.AWS_RDS_SECRET_ARN,
      database: process.env.AWS_RDS_DATABASE,
      sql: this.generateInsertSQL(tableName, encryptedData),
      parameters: this.generateSQLParameters(encryptedData)
    };

    const result = await rds.executeStatement(params).promise();
    return result;
  }

  /**
   * Read encrypted PHI data from AWS RDS
   */
  static async readFromAWS(query, tableName) {
    const params = {
      resourceArn: process.env.AWS_RDS_CLUSTER_ARN,
      secretArn: process.env.AWS_RDS_SECRET_ARN,
      database: process.env.AWS_RDS_DATABASE,
      sql: this.generateSelectSQL(tableName, query),
      parameters: query.parameters || []
    };

    const result = await rds.executeStatement(params).promise();
    
    // Decrypt data before returning
    if (result.records && result.records.length > 0) {
      const decryptedData = await Promise.all(
        result.records.map(record => HealthcareEncryption.decrypt(record))
      );
      return decryptedData;
    }
    
    return result.records;
  }

  /**
   * Update encrypted PHI data in AWS RDS
   */
  static async updateInAWS(data, tableName) {
    const encryptedUpdates = await HealthcareEncryption.encrypt(data.updates);
    
    const params = {
      resourceArn: process.env.AWS_RDS_CLUSTER_ARN,
      secretArn: process.env.AWS_RDS_SECRET_ARN,
      database: process.env.AWS_RDS_DATABASE,
      sql: this.generateUpdateSQL(tableName, encryptedUpdates, data.where),
      parameters: this.generateSQLParameters({ ...encryptedUpdates, ...data.where })
    };

    const result = await rds.executeStatement(params).promise();
    return result;
  }

  /**
   * Delete PHI data from AWS RDS (with audit trail)
   */
  static async deleteFromAWS(data, tableName) {
    // First, log what we're deleting for audit trail
    await this.logDataDeletion(tableName, data.where);
    
    const params = {
      resourceArn: process.env.AWS_RDS_CLUSTER_ARN,
      secretArn: process.env.AWS_RDS_SECRET_ARN,
      database: process.env.AWS_RDS_DATABASE,
      sql: this.generateDeleteSQL(tableName, data.where),
      parameters: this.generateSQLParameters(data.where)
    };

    const result = await rds.executeStatement(params).promise();
    return result;
  }

  /**
   * Log data access for HIPAA audit requirements
   */
  static async logDataAccess(tableName, operation, dataType) {
    const auditLog = {
      table_name: tableName,
      operation: operation,
      data_type: dataType,
      timestamp: new Date().toISOString(),
      user_id: this.getCurrentUserId(),
      ip_address: this.getCurrentIP(),
      user_agent: this.getCurrentUserAgent()
    };

    // Store audit logs in Supabase (non-PHI)
    await supabase.from('hipaa_audit_logs').insert(auditLog);
  }

  /**
   * Log data deletion for HIPAA compliance
   */
  static async logDataDeletion(tableName, whereClause) {
    const deletionLog = {
      table_name: tableName,
      operation: 'DELETE',
      where_clause: JSON.stringify(whereClause),
      timestamp: new Date().toISOString(),
      user_id: this.getCurrentUserId(),
      reason: 'User requested data deletion',
      retention_period_expired: false
    };

    await supabase.from('hipaa_deletion_logs').insert(deletionLog);
  }

  /**
   * Generate SQL statements for AWS RDS operations
   */
  static generateInsertSQL(tableName, data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map((_, index) => `:param${index + 1}`).join(', ');
    return `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
  }

  static generateSelectSQL(tableName, query) {
    let sql = `SELECT ${query.select || '*'} FROM ${tableName}`;
    if (query.where) {
      const whereClause = Object.keys(query.where)
        .map((key, index) => `${key} = :where_param${index + 1}`)
        .join(' AND ');
      sql += ` WHERE ${whereClause}`;
    }
    return sql;
  }

  static generateUpdateSQL(tableName, updates, where) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = :update_param${index + 1}`)
      .join(', ');
    const whereClause = Object.keys(where)
      .map((key, index) => `${key} = :where_param${index + 1}`)
      .join(' AND ');
    return `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
  }

  static generateDeleteSQL(tableName, where) {
    const whereClause = Object.keys(where)
      .map((key, index) => `${key} = :param${index + 1}`)
      .join(' AND ');
    return `DELETE FROM ${tableName} WHERE ${whereClause}`;
  }

  static generateSQLParameters(data) {
    return Object.entries(data).map(([key, value], index) => ({
      name: `param${index + 1}`,
      value: { stringValue: String(value) }
    }));
  }

  // Helper methods for audit logging
  static getCurrentUserId() {
    // This would be set from the request context
    return global.currentUserId || 'system';
  }

  static getCurrentIP() {
    return global.currentIP || '127.0.0.1';
  }

  static getCurrentUserAgent() {
    return global.currentUserAgent || 'Unknown';
  }
}

// Specific implementation for MenoWellness
export class MenoWellnessHIPAA {
  /**
   * Store menopause symptom data (PHI)
   */
  static async storeSymptomData(symptomData) {
    return await HIPAADataRouter.storeData(
      symptomData, 
      'menopause_symptoms', 
      'create'
    );
  }

  /**
   * Get symptom data for user (PHI)
   */
  static async getSymptomData(userId, filters = {}) {
    return await HIPAADataRouter.storeData(
      { 
        select: '*',
        where: { user_id: userId, ...filters }
      },
      'menopause_symptoms',
      'read'
    );
  }

  /**
   * Store usage analytics (Non-PHI)
   */
  static async storeAnalytics(analyticsData) {
    return await HIPAADataRouter.storeData(
      analyticsData,
      'usage_tracking',
      'create'
    );
  }

  /**
   * Get subscription data (Non-PHI)
   */
  static async getSubscriptionData(userId) {
    return await HIPAADataRouter.storeData(
      {
        select: '*',
        where: { user_id: userId }
      },
      'subscription_data',
      'read'
    );
  }
}

export default HIPAADataRouter;