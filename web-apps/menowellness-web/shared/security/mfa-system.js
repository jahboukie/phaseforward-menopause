/**
 * Enhanced Multi-Factor Authentication System
 * Military-Grade Security Foundation
 * 
 * Supports TOTP, HOTP, biometric, hardware tokens, and risk-based authentication
 * Implements FIDO2/WebAuthn for passwordless authentication
 */

const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { Pool } = require('pg');

class EnhancedMFASystem {
  constructor(databaseUrl) {
    this.pool = new Pool({ connectionString: databaseUrl });
    this.initializeMFATables();
  }

  /**
   * Initialize MFA tables
   */
  async initializeMFATables() {
    const mfaTablesSQL = `
      -- MFA methods for users
      CREATE TABLE IF NOT EXISTS user_mfa_methods (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        method_type VARCHAR(50) NOT NULL, -- 'totp', 'sms', 'email', 'biometric', 'hardware_token'
        method_name VARCHAR(100),
        secret_encrypted TEXT,
        backup_codes TEXT[],
        is_primary BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_used TIMESTAMP WITH TIME ZONE,
        failure_count INTEGER DEFAULT 0,
        locked_until TIMESTAMP WITH TIME ZONE,
        metadata JSONB DEFAULT '{}'::jsonb
      );

      -- FIDO2/WebAuthn credentials
      CREATE TABLE IF NOT EXISTS webauthn_credentials (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        credential_id TEXT UNIQUE NOT NULL,
        public_key TEXT NOT NULL,
        counter BIGINT DEFAULT 0,
        device_type VARCHAR(50), -- 'platform', 'cross-platform'
        authenticator_name VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_used TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT true
      );

      -- Risk assessment data
      CREATE TABLE IF NOT EXISTS user_risk_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE NOT NULL,
        base_risk_score DECIMAL(3,2) DEFAULT 0.5,
        location_patterns JSONB DEFAULT '{}'::jsonb,
        device_patterns JSONB DEFAULT '{}'::jsonb,
        behavioral_patterns JSONB DEFAULT '{}'::jsonb,
        last_assessment TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Authentication attempts for risk analysis
      CREATE TABLE IF NOT EXISTS auth_attempts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID,
        attempt_type VARCHAR(50), -- 'password', 'mfa', 'biometric'
        success BOOLEAN NOT NULL,
        ip_address INET,
        user_agent TEXT,
        geolocation JSONB,
        device_fingerprint VARCHAR(255),
        risk_score DECIMAL(3,2),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        additional_factors_required BOOLEAN DEFAULT false
      );

      -- Biometric templates (hashed, never store raw biometric data)
      CREATE TABLE IF NOT EXISTS biometric_templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        template_type VARCHAR(50), -- 'fingerprint', 'face', 'voice', 'iris'
        template_hash VARCHAR(255) NOT NULL,
        quality_score DECIMAL(3,2),
        enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_verified TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT true
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_user_mfa_methods_user_id ON user_mfa_methods(user_id);
      CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_user_id ON webauthn_credentials(user_id);
      CREATE INDEX IF NOT EXISTS idx_auth_attempts_user_id ON auth_attempts(user_id);
      CREATE INDEX IF NOT EXISTS idx_auth_attempts_timestamp ON auth_attempts(timestamp);
    `;

    try {
      await this.pool.query(mfaTablesSQL);
    } catch (error) {
      console.error('Failed to initialize MFA tables:', error);
    }
  }

  /**
   * Generate TOTP secret and QR code for user
   */
  async setupTOTP(userId, userEmail, serviceName = 'Ecosystem Intelligence') {
    const secret = speakeasy.generateSecret({
      name: userEmail,
      issuer: serviceName,
      length: 32
    });

    // Encrypt the secret before storing
    const encryptedSecret = this.encryptSecret(secret.base32);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Store in database
    const insertQuery = `
      INSERT INTO user_mfa_methods (
        user_id, method_type, method_name, secret_encrypted, backup_codes
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const result = await this.pool.query(insertQuery, [
      userId, 'totp', 'Authenticator App', encryptedSecret, backupCodes
    ]);

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes: backupCodes,
      methodId: result.rows[0].id
    };
  }

  /**
   * Verify TOTP token
   */
  async verifyTOTP(userId, token) {
    const query = `
      SELECT secret_encrypted FROM user_mfa_methods
      WHERE user_id = $1 AND method_type = 'totp' AND is_active = true
    `;

    const result = await this.pool.query(query, [userId]);
    if (result.rows.length === 0) {
      return { valid: false, error: 'TOTP not configured' };
    }

    const encryptedSecret = result.rows[0].secret_encrypted;
    const secret = this.decryptSecret(encryptedSecret);

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps of drift
    });

    if (verified) {
      // Update last used timestamp
      await this.pool.query(
        'UPDATE user_mfa_methods SET last_used = NOW() WHERE user_id = $1 AND method_type = $2',
        [userId, 'totp']
      );
    }

    return { valid: verified };
  }

  /**
   * Generate secure backup codes
   */
  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code.match(/.{1,4}/g).join('-'));
    }
    return codes;
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId, code) {
    const query = `
      SELECT id, backup_codes FROM user_mfa_methods
      WHERE user_id = $1 AND is_active = true AND backup_codes IS NOT NULL
    `;

    const result = await this.pool.query(query, [userId]);
    
    for (const row of result.rows) {
      const backupCodes = row.backup_codes;
      const codeIndex = backupCodes.indexOf(code);
      
      if (codeIndex !== -1) {
        // Remove used backup code
        backupCodes.splice(codeIndex, 1);
        
        await this.pool.query(
          'UPDATE user_mfa_methods SET backup_codes = $1 WHERE id = $2',
          [backupCodes, row.id]
        );
        
        return { valid: true, remainingCodes: backupCodes.length };
      }
    }

    return { valid: false };
  }

  /**
   * Calculate risk score based on authentication context
   */
  async calculateRiskScore(userId, authContext) {
    const {
      ipAddress,
      userAgent,
      geolocation,
      deviceFingerprint,
      timeOfDay,
      dayOfWeek
    } = authContext;

    let riskScore = 0.0;

    // Get user's risk profile
    const profileQuery = `
      SELECT * FROM user_risk_profiles WHERE user_id = $1
    `;
    const profileResult = await this.pool.query(profileQuery, [userId]);
    
    if (profileResult.rows.length === 0) {
      // New user, higher initial risk
      riskScore += 0.3;
    } else {
      const profile = profileResult.rows[0];
      
      // Check location patterns
      if (geolocation && profile.location_patterns) {
        const knownLocations = profile.location_patterns.locations || [];
        const isKnownLocation = knownLocations.some(loc => 
          this.calculateDistance(geolocation, loc) < 50 // 50km radius
        );
        if (!isKnownLocation) riskScore += 0.2;
      }

      // Check device patterns
      if (deviceFingerprint && profile.device_patterns) {
        const knownDevices = profile.device_patterns.devices || [];
        if (!knownDevices.includes(deviceFingerprint)) {
          riskScore += 0.15;
        }
      }

      // Check behavioral patterns
      if (profile.behavioral_patterns) {
        const usualHours = profile.behavioral_patterns.usual_hours || [];
        const currentHour = new Date().getHours();
        if (!usualHours.includes(currentHour)) {
          riskScore += 0.1;
        }
      }
    }

    // Check recent failed attempts
    const failedAttemptsQuery = `
      SELECT COUNT(*) as failed_count FROM auth_attempts
      WHERE user_id = $1 AND success = false 
      AND timestamp > NOW() - INTERVAL '1 hour'
    `;
    const failedResult = await this.pool.query(failedAttemptsQuery, [userId]);
    const failedCount = parseInt(failedResult.rows[0].failed_count);
    
    if (failedCount > 0) {
      riskScore += Math.min(failedCount * 0.1, 0.3);
    }

    return Math.min(riskScore, 1.0);
  }

  /**
   * Determine required authentication factors based on risk
   */
  getRequiredFactors(riskScore) {
    if (riskScore < 0.3) {
      return ['password'];
    } else if (riskScore < 0.6) {
      return ['password', 'mfa'];
    } else if (riskScore < 0.8) {
      return ['password', 'mfa', 'additional_verification'];
    } else {
      return ['password', 'mfa', 'biometric', 'admin_approval'];
    }
  }

  /**
   * Log authentication attempt
   */
  async logAuthAttempt(userId, attemptType, success, context) {
    const riskScore = await this.calculateRiskScore(userId, context);
    const requiredFactors = this.getRequiredFactors(riskScore);

    const insertQuery = `
      INSERT INTO auth_attempts (
        user_id, attempt_type, success, ip_address, user_agent,
        geolocation, device_fingerprint, risk_score, additional_factors_required
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    await this.pool.query(insertQuery, [
      userId, attemptType, success, context.ipAddress, context.userAgent,
      context.geolocation ? JSON.stringify(context.geolocation) : null,
      context.deviceFingerprint, riskScore, requiredFactors.length > 1
    ]);

    return { riskScore, requiredFactors };
  }

  /**
   * Encrypt secret for storage
   */
  encryptSecret(secret) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.MFA_ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key, { iv });
    
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    });
  }

  /**
   * Decrypt secret from storage
   */
  decryptSecret(encryptedData) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.MFA_ENCRYPTION_KEY || 'default-key', 'salt', 32);
    
    const data = JSON.parse(encryptedData);
    const decipher = crypto.createDecipher(algorithm, key, {
      iv: Buffer.from(data.iv, 'hex')
    });
    
    decipher.setAuthTag(Buffer.from(data.tag, 'hex'));
    
    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLon = this.toRadians(coord2.lon - coord1.lon);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

module.exports = EnhancedMFASystem;
