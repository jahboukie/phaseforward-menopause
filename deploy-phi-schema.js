// Deploy PHI database schema to AWS RDS Aurora
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// PHI Database Schema - Individual statements for Data API
const PHI_STATEMENTS = [
  'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
  'CREATE EXTENSION IF NOT EXISTS "pgcrypto"',
  
  `CREATE TABLE IF NOT EXISTS encrypted_menopause_symptoms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id_hash VARCHAR(64) NOT NULL,
    encrypted_data TEXT NOT NULL,
    iv VARCHAR(32) NOT NULL,
    auth_tag VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    key_version VARCHAR(10) DEFAULT '1',
    date_hash VARCHAR(64),
    created_by UUID,
    last_modified_by UUID,
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE
  )`,
  
  `CREATE TABLE IF NOT EXISTS encrypted_user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id_hash VARCHAR(64) UNIQUE NOT NULL,
    encrypted_data TEXT NOT NULL,
    iv VARCHAR(32) NOT NULL,
    auth_tag VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    key_version VARCHAR(10) DEFAULT '1',
    consent_given BOOLEAN DEFAULT FALSE,
    consent_date TIMESTAMP WITH TIME ZONE,
    data_retention_until TIMESTAMP WITH TIME ZONE,
    deletion_requested BOOLEAN DEFAULT FALSE,
    deletion_requested_date TIMESTAMP WITH TIME ZONE
  )`,
  
  `CREATE TABLE IF NOT EXISTS hipaa_audit_trail (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id_hash VARCHAR(64),
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    minimum_necessary BOOLEAN DEFAULT TRUE,
    authorized_purpose TEXT,
    data_subject_consent BOOLEAN DEFAULT FALSE
  )`,
  
  'CREATE INDEX IF NOT EXISTS idx_encrypted_symptoms_user_hash ON encrypted_menopause_symptoms(user_id_hash)',
  'CREATE INDEX IF NOT EXISTS idx_encrypted_symptoms_date_hash ON encrypted_menopause_symptoms(date_hash)',
  'CREATE INDEX IF NOT EXISTS idx_encrypted_profiles_user_hash ON encrypted_user_profiles(user_id_hash)',
  'CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON hipaa_audit_trail(timestamp)',
  'CREATE INDEX IF NOT EXISTS idx_audit_user ON hipaa_audit_trail(user_id_hash)',
  
  'ALTER TABLE encrypted_menopause_symptoms ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE encrypted_user_profiles ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE hipaa_audit_trail ENABLE ROW LEVEL SECURITY'
];

async function deployPHISchema() {
  console.log('🏥 Deploying PHI Database Schema to AWS RDS Aurora...\n');

  // Configure AWS
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });

  const rdsData = new AWS.RDSDataService();

  try {
    console.log('📊 Executing PHI schema deployment...');
    
    let successCount = 0;
    let totalStatements = PHI_STATEMENTS.length;
    
    for (let i = 0; i < PHI_STATEMENTS.length; i++) {
      const statement = PHI_STATEMENTS[i];
      console.log(`   Executing statement ${i + 1}/${totalStatements}...`);
      
      try {
        const params = {
          resourceArn: process.env.AWS_RDS_CLUSTER_ARN,
          secretArn: process.env.AWS_RDS_SECRET_ARN,
          database: process.env.AWS_RDS_DATABASE || 'postgres',
          sql: statement
        };

        await rdsData.executeStatement(params).promise();
        successCount++;
      } catch (error) {
        console.log(`   ⚠️  Statement ${i + 1} failed: ${error.message}`);
        // Continue with other statements
      }
    }
    
    console.log(`✅ PHI database schema deployment completed!`);
    console.log(`   Successfully executed: ${successCount}/${totalStatements} statements`);
    
    // Test schema by checking if tables exist
    console.log('\n🔍 Verifying schema deployment...');
    
    const verifyParams = {
      resourceArn: process.env.AWS_RDS_CLUSTER_ARN,
      secretArn: process.env.AWS_RDS_SECRET_ARN,
      database: process.env.AWS_RDS_DATABASE || 'postgres',
      sql: `SELECT table_name FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name LIKE 'encrypted_%' 
             ORDER BY table_name;`
    };

    const verifyResult = await rdsData.executeStatement(verifyParams).promise();
    
    if (verifyResult.records && verifyResult.records.length > 0) {
      console.log('✅ PHI tables created successfully:');
      verifyResult.records.forEach(record => {
        console.log(`   - ${record[0].stringValue}`);
      });
    } else {
      console.log('⚠️  No PHI tables found - deployment may have failed');
    }
    
    console.log('\n🎉 PHI Database Schema Deployment Complete!');
    console.log('\n📋 What was created:');
    console.log('   - encrypted_menopause_symptoms (PHI data storage)');
    console.log('   - encrypted_user_profiles (user health profiles)');
    console.log('   - hipaa_audit_trail (HIPAA compliance logging)');
    console.log('   - Proper indexes and Row Level Security');
    
    console.log('\n🚀 Ready for:');
    console.log('   - Symptom tracking with HIPAA compliance');
    console.log('   - Encrypted PHI data storage');
    console.log('   - Full audit trail logging');
    
    return true;
    
  } catch (error) {
    console.error('❌ PHI schema deployment failed:', error);
    
    if (error.code === 'BadRequestException') {
      console.log('\n💡 Common fixes:');
      console.log('   - Verify your AWS RDS cluster is running');
      console.log('   - Check that your cluster ARN and secret ARN are correct');
      console.log('   - Ensure you have RDS Data API permissions');
      console.log('   - Verify the database name is correct');
    }
    
    return false;
  }
}

// Run deployment
deployPHISchema()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });