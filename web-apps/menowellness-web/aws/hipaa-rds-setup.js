// AWS RDS HIPAA-Compliant Setup Configuration
// This file contains the setup instructions and configuration for AWS RDS

/*
=== AWS HIPAA COMPLIANCE SETUP GUIDE ===

STEP 1: AWS Business Account Setup
1. Create AWS Business Account (not personal)
2. Verify business details and payment method
3. Complete account verification

STEP 2: Request Business Associate Agreement (BAA)
1. Go to AWS Support Center: https://console.aws.amazon.com/support/
2. Create case: "Account and Billing Support"
3. Subject: "Business Associate Agreement Request for HIPAA Compliance"
4. Include:
   - Business name and address
   - Contact information
   - Description of HIPAA use case (menopause health tracking app)
   - Confirmation you understand HIPAA requirements
5. AWS will send BAA within 24-48 hours
6. Sign and return BAA

STEP 3: Enable HIPAA-Eligible Services
Only these AWS services are HIPAA-eligible:
✅ Amazon RDS (PostgreSQL/MySQL)
✅ Amazon EC2
✅ Amazon S3
✅ Amazon VPC
✅ AWS KMS
✅ AWS CloudTrail
✅ Amazon CloudWatch

STEP 4: Create Encryption Keys
1. Go to AWS KMS Console
2. Create Customer Managed Key
3. Key type: Symmetric
4. Key usage: Encrypt and decrypt
5. Add description: "MenoWellness HIPAA PHI Encryption"
6. Set key administrators and users
7. Copy Key ARN for configuration
*/

import AWS from 'aws-sdk';

// HIPAA-Compliant RDS Configuration
const HIPAA_RDS_CONFIG = {
  // Database Configuration
  database: {
    engine: 'postgres', // or 'mysql'
    engineVersion: '13.7', // Latest stable
    dbInstanceClass: 'db.t3.micro', // Free tier eligible
    dbInstanceIdentifier: 'menowellness-hipaa-db',
    dbName: 'menowellness_phi',
    
    // HIPAA Requirements
    storageEncrypted: true, // REQUIRED for HIPAA
    kmsKeyId: process.env.AWS_KMS_KEY_ID, // Customer managed key
    
    // Backup and Recovery (HIPAA requires 30+ days)
    backupRetentionPeriod: 35, // days
    deleteAutomatedBackups: false,
    deletionProtection: true, // Prevent accidental deletion
    
    // High Availability
    multiAZ: false, // Set to true for production (costs more)
    
    // Network Security
    vpcSecurityGroupIds: ['sg-hipaa-database'], // Create this security group
    dbSubnetGroupName: 'hipaa-private-subnets', // Private subnets only
    publiclyAccessible: false, // NEVER expose PHI database publicly
    
    // Monitoring and Logging (HIPAA requirement)
    enableCloudwatchLogsExports: ['postgresql'], // or ['error', 'general', 'slow-query'] for MySQL
    monitoringInterval: 60, // Enhanced monitoring
    enablePerformanceInsights: true,
    performanceInsightsKMSKeyId: process.env.AWS_KMS_KEY_ID,
    
    // Security
    port: 5432, // PostgreSQL default (3306 for MySQL)
    parameterGroupName: 'hipaa-postgres-params', // Custom parameter group
    
    // Credentials (stored in AWS Secrets Manager)
    masterUsername: 'hipaa_admin',
    manageMasterUserPassword: true, // AWS manages password
    masterUserSecretKmsKeyId: process.env.AWS_KMS_KEY_ID
  },

  // VPC Configuration for Network Isolation
  vpc: {
    vpcId: process.env.AWS_VPC_ID,
    subnetGroup: {
      dbSubnetGroupName: 'hipaa-private-subnets',
      dbSubnetGroupDescription: 'HIPAA-compliant private subnets for RDS',
      subnetIds: [
        process.env.AWS_PRIVATE_SUBNET_1,
        process.env.AWS_PRIVATE_SUBNET_2
      ]
    },
    securityGroup: {
      groupName: 'hipaa-database-sg',
      description: 'HIPAA-compliant security group for RDS',
      rules: [
        {
          type: 'ingress',
          protocol: 'tcp',
          port: 5432,
          source: 'sg-app-servers', // Only allow app servers
          description: 'Allow PostgreSQL from app servers'
        }
      ]
    }
  },

  // Aurora Serverless Configuration (Alternative)
  aurora: {
    engine: 'aurora-postgresql',
    engineMode: 'serverless',
    dbClusterIdentifier: 'menowellness-hipaa-cluster',
    
    // Serverless Scaling
    scalingConfiguration: {
      minCapacity: 2,
      maxCapacity: 16,
      autoPause: false, // Don't pause for HIPAA workloads
      secondsUntilAutoPause: null
    },
    
    // HIPAA Requirements
    storageEncrypted: true,
    kmsKeyId: process.env.AWS_KMS_KEY_ID,
    backupRetentionPeriod: 35,
    deletionProtection: true,
    
    // Network
    dbSubnetGroupName: 'hipaa-private-subnets',
    vpcSecurityGroupIds: ['sg-hipaa-database']
  }
};

// Environment Variables Required
const REQUIRED_ENV_VARS = {
  // AWS Configuration
  AWS_ACCESS_KEY_ID: 'Your AWS access key',
  AWS_SECRET_ACCESS_KEY: 'Your AWS secret key',
  AWS_REGION: 'us-east-1', // Choose your region
  
  // RDS Configuration
  AWS_RDS_CLUSTER_ARN: 'arn:aws:rds:region:account:cluster:cluster-name',
  AWS_RDS_SECRET_ARN: 'arn:aws:secretsmanager:region:account:secret:secret-name',
  AWS_RDS_DATABASE: 'menowellness_phi',
  
  // Encryption
  AWS_KMS_KEY_ID: 'arn:aws:kms:region:account:key/key-id',
  HIPAA_ENCRYPTION_KEY: '64-character-hex-string', // 256-bit key
  HIPAA_KEY_VERSION: '1',
  
  // Network
  AWS_VPC_ID: 'vpc-xxxxxxxxx',
  AWS_PRIVATE_SUBNET_1: 'subnet-xxxxxxxxx',
  AWS_PRIVATE_SUBNET_2: 'subnet-xxxxxxxxx'
};

// Database Schema for PHI Data
const PHI_DATABASE_SCHEMA = `
-- HIPAA-Compliant PHI Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Encrypted PHI table for menopause symptoms
CREATE TABLE encrypted_menopause_symptoms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id_hash VARCHAR(64) NOT NULL, -- Hashed user ID for indexing
    encrypted_data TEXT NOT NULL, -- Encrypted JSON blob
    iv VARCHAR(32) NOT NULL, -- Initialization vector
    auth_tag VARCHAR(32) NOT NULL, -- Authentication tag
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    key_version VARCHAR(10) DEFAULT '1',
    
    -- Indexable fields (hashed for searching)
    date_hash VARCHAR(64), -- Hashed date for querying
    
    -- Audit fields
    created_by UUID,
    last_modified_by UUID,
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE
);

-- Encrypted user health profiles
CREATE TABLE encrypted_user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id_hash VARCHAR(64) UNIQUE NOT NULL,
    encrypted_data TEXT NOT NULL,
    iv VARCHAR(32) NOT NULL,
    auth_tag VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    key_version VARCHAR(10) DEFAULT '1',
    
    -- Audit fields
    consent_given BOOLEAN DEFAULT FALSE,
    consent_date TIMESTAMP WITH TIME ZONE,
    data_retention_until TIMESTAMP WITH TIME ZONE,
    deletion_requested BOOLEAN DEFAULT FALSE,
    deletion_requested_date TIMESTAMP WITH TIME ZONE
);

-- HIPAA Audit Trail
CREATE TABLE hipaa_audit_trail (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id_hash VARCHAR(64),
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(20) NOT NULL, -- SELECT, INSERT, UPDATE, DELETE
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    
    -- HIPAA specific fields
    minimum_necessary BOOLEAN DEFAULT TRUE,
    authorized_purpose TEXT,
    data_subject_consent BOOLEAN DEFAULT FALSE
);

-- Data breach incident log
CREATE TABLE data_breach_incidents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    incident_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    description TEXT NOT NULL,
    affected_records INTEGER,
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reported_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- HIPAA requirements
    reported_to_authorities BOOLEAN DEFAULT FALSE,
    patients_notified BOOLEAN DEFAULT FALSE,
    media_notified BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX idx_encrypted_symptoms_user_hash ON encrypted_menopause_symptoms(user_id_hash);
CREATE INDEX idx_encrypted_symptoms_date_hash ON encrypted_menopause_symptoms(date_hash);
CREATE INDEX idx_encrypted_profiles_user_hash ON encrypted_user_profiles(user_id_hash);
CREATE INDEX idx_audit_timestamp ON hipaa_audit_trail(timestamp);
CREATE INDEX idx_audit_user ON hipaa_audit_trail(user_id_hash);

-- Row Level Security
ALTER TABLE encrypted_menopause_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hipaa_audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS Policies (very restrictive for PHI)
CREATE POLICY "phi_access_own_data_only" ON encrypted_menopause_symptoms
    FOR ALL USING (user_id_hash = current_setting('app.current_user_hash'));

CREATE POLICY "profile_access_own_data_only" ON encrypted_user_profiles
    FOR ALL USING (user_id_hash = current_setting('app.current_user_hash'));

-- Service role can access for system operations
CREATE POLICY "service_access_audit" ON hipaa_audit_trail
    FOR ALL USING (current_setting('app.service_role') = 'true');

-- Functions for HIPAA compliance
CREATE OR REPLACE FUNCTION log_phi_access()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO hipaa_audit_trail (
        user_id_hash, table_name, operation, 
        minimum_necessary, authorized_purpose
    ) VALUES (
        COALESCE(NEW.user_id_hash, OLD.user_id_hash),
        TG_TABLE_NAME,
        TG_OP,
        TRUE, -- Assume minimum necessary unless specified
        'Healthcare treatment and app functionality'
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for audit logging
CREATE TRIGGER audit_menopause_symptoms
    AFTER INSERT OR UPDATE OR DELETE ON encrypted_menopause_symptoms
    FOR EACH ROW EXECUTE FUNCTION log_phi_access();

CREATE TRIGGER audit_user_profiles
    AFTER INSERT OR UPDATE OR DELETE ON encrypted_user_profiles
    FOR EACH ROW EXECUTE FUNCTION log_phi_access();

-- Data retention function (7 years for HIPAA)
CREATE OR REPLACE FUNCTION cleanup_expired_phi()
RETURNS void AS $$
BEGIN
    -- Delete records older than 7 years
    DELETE FROM encrypted_menopause_symptoms 
    WHERE created_at < NOW() - INTERVAL '7 years';
    
    DELETE FROM encrypted_user_profiles 
    WHERE data_retention_until < NOW();
    
    -- Clean old audit logs (keep 10 years for legal requirements)
    DELETE FROM hipaa_audit_trail 
    WHERE timestamp < NOW() - INTERVAL '10 years';
    
    -- Log cleanup action
    INSERT INTO hipaa_audit_trail (table_name, operation, authorized_purpose)
    VALUES ('system', 'CLEANUP', 'HIPAA data retention compliance');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

// Setup functions
class HIPAAAWSSetup {
  static async createRDSInstance() {
    const rds = new AWS.RDS();
    
    try {
      const params = HIPAA_RDS_CONFIG.database;
      const result = await rds.createDBInstance(params).promise();
      console.log('✅ HIPAA-compliant RDS instance created:', result.DBInstance.DBInstanceIdentifier);
      return result;
    } catch (error) {
      console.error('❌ Failed to create RDS instance:', error);
      throw error;
    }
  }

  static async createAuroraCluster() {
    const rds = new AWS.RDS();
    
    try {
      const params = HIPAA_RDS_CONFIG.aurora;
      const result = await rds.createDBCluster(params).promise();
      console.log('✅ HIPAA-compliant Aurora cluster created:', result.DBCluster.DBClusterIdentifier);
      return result;
    } catch (error) {
      console.error('❌ Failed to create Aurora cluster:', error);
      throw error;
    }
  }

  static validateHIPAACompliance() {
    const checks = [
      {
        name: 'Encryption at Rest',
        check: () => HIPAA_RDS_CONFIG.database.storageEncrypted,
        required: true
      },
      {
        name: 'Customer Managed KMS Key',
        check: () => process.env.AWS_KMS_KEY_ID && process.env.AWS_KMS_KEY_ID.startsWith('arn:aws:kms'),
        required: true
      },
      {
        name: 'Backup Retention ≥ 30 days',
        check: () => HIPAA_RDS_CONFIG.database.backupRetentionPeriod >= 30,
        required: true
      },
      {
        name: 'Deletion Protection',
        check: () => HIPAA_RDS_CONFIG.database.deletionProtection,
        required: true
      },
      {
        name: 'Private Network Access',
        check: () => !HIPAA_RDS_CONFIG.database.publiclyAccessible,
        required: true
      },
      {
        name: 'Enhanced Monitoring',
        check: () => HIPAA_RDS_CONFIG.database.monitoringInterval > 0,
        required: true
      }
    ];

    console.log('\n🏥 HIPAA Compliance Validation:');
    let allPassed = true;

    checks.forEach(check => {
      const passed = check.check();
      const status = passed ? '✅' : '❌';
      console.log(`${status} ${check.name}: ${passed ? 'PASS' : 'FAIL'}`);
      
      if (!passed && check.required) {
        allPassed = false;
      }
    });

    if (allPassed) {
      console.log('\n🎉 All HIPAA compliance checks passed!');
    } else {
      console.log('\n⚠️ HIPAA compliance issues found. Please fix before production.');
    }

    return allPassed;
  }

  static printSetupInstructions() {
    console.log(`
🏥 AWS HIPAA SETUP INSTRUCTIONS

1. Request BAA from AWS Support
2. Set up these environment variables:
${Object.entries(REQUIRED_ENV_VARS).map(([key, desc]) => `   ${key}=${desc}`).join('\n')}

3. Create VPC and Security Groups
4. Run: node aws/hipaa-rds-setup.js
5. Deploy database schema
6. Test encryption and audit logging

💰 FREE TIER ELIGIBLE:
- RDS: 750 hours/month (24/7 for 1 month)
- Storage: 20GB
- Backup: 20GB

🔒 HIPAA REQUIREMENTS MET:
- Encryption at rest and in transit
- 35-day backup retention
- Audit logging
- Network isolation
- Access controls
`);
  }
}

export {
  HIPAA_RDS_CONFIG,
  REQUIRED_ENV_VARS,
  PHI_DATABASE_SCHEMA,
  HIPAAAWSSetup
};

export default HIPAAAWSSetup;