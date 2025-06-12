/**
 * Corporate Wellness Portal - Dr. Alex AI-Grade Encryption Service
 * Military-grade encryption with tenant isolation
 */

import crypto from 'crypto';
import { logger } from '../utils/logger.js';

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyDerivationAlgorithm = 'pbkdf2';
    this.keyDerivationIterations = 100000;
    this.saltLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
    
    // Master encryption key (should be loaded from secure key management)
    this.masterKey = process.env.ENCRYPTION_KEY || this.generateSecureKey();
    this.tenantSalt = process.env.TENANT_ENCRYPTION_SALT || this.generateSecureKey();
  }

  /**
   * Initialize encryption service
   */
  async initialize() {
    try {
      // Validate encryption configuration
      if (!this.masterKey || this.masterKey.length < 32) {
        throw new Error('Master encryption key must be at least 32 characters');
      }
      
      // Test encryption/decryption cycle
      const testData = 'encryption_test_data';
      const encrypted = await this.encryptData(testData, 'test-tenant-id');
      const decrypted = await this.decryptData(encrypted, 'test-tenant-id');
      
      if (decrypted !== testData) {
        throw new Error('Encryption service self-test failed');
      }
      
      logger.info('Encryption service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize encryption service', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate a secure random key
   */
  generateSecureKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Derive tenant-specific encryption key
   */
  deriveTenantKey(tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required for key derivation');
    }
    
    return crypto.pbkdf2Sync(
      this.masterKey,
      this.tenantSalt + tenantId,
      this.keyDerivationIterations,
      32,
      'sha512'
    );
  }

  /**
   * Encrypt data with tenant-specific key
   */
  async encryptData(data, tenantId, additionalData = null) {
    try {
      if (!data) return null;
      
      const tenantKey = this.deriveTenantKey(tenantId);
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipher(this.algorithm, tenantKey);
      cipher.setAAD(Buffer.from(additionalData || tenantId));
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8');
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      
      const tag = cipher.getAuthTag();
      
      // Combine IV, tag, and encrypted data
      const result = Buffer.concat([iv, tag, encrypted]);
      
      return {
        data: result.toString('base64'),
        algorithm: this.algorithm,
        tenantId: tenantId,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Encryption failed', {
        tenantId,
        error: error.message
      });
      throw new Error('Data encryption failed');
    }
  }

  /**
   * Decrypt data with tenant-specific key
   */
  async decryptData(encryptedPayload, tenantId, additionalData = null) {
    try {
      if (!encryptedPayload || !encryptedPayload.data) return null;
      
      // Validate tenant context
      if (encryptedPayload.tenantId !== tenantId) {
        throw new Error('Tenant ID mismatch - unauthorized decryption attempt');
      }
      
      const tenantKey = this.deriveTenantKey(tenantId);
      const buffer = Buffer.from(encryptedPayload.data, 'base64');
      
      // Extract IV, tag, and encrypted data
      const iv = buffer.subarray(0, this.ivLength);
      const tag = buffer.subarray(this.ivLength, this.ivLength + this.tagLength);
      const encrypted = buffer.subarray(this.ivLength + this.tagLength);
      
      const decipher = crypto.createDecipher(this.algorithm, tenantKey);
      decipher.setAuthTag(tag);
      decipher.setAAD(Buffer.from(additionalData || tenantId));
      
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return JSON.parse(decrypted.toString('utf8'));
      
    } catch (error) {
      logger.error('Decryption failed', {
        tenantId,
        error: error.message
      });
      throw new Error('Data decryption failed');
    }
  }

  /**
   * Encrypt PHI (Protected Health Information) with enhanced security
   */
  async encryptPHI(data, tenantId, employeeId) {
    try {
      // Enhanced key derivation for PHI
      const phiKey = crypto.pbkdf2Sync(
        this.masterKey,
        this.tenantSalt + tenantId + employeeId,
        this.keyDerivationIterations * 2, // Double iterations for PHI
        32,
        'sha512'
      );
      
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, phiKey);
      
      // Additional authenticated data for PHI
      const aad = `PHI:${tenantId}:${employeeId}:${new Date().toISOString()}`;
      cipher.setAAD(Buffer.from(aad));
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8');
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      
      const tag = cipher.getAuthTag();
      const result = Buffer.concat([iv, tag, encrypted]);
      
      // Log PHI encryption for audit
      logger.info('PHI encrypted', {
        tenantId,
        employeeId,
        dataType: typeof data,
        timestamp: new Date().toISOString()
      });
      
      return {
        data: result.toString('base64'),
        algorithm: this.algorithm,
        tenantId,
        employeeId,
        type: 'PHI',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('PHI encryption failed', {
        tenantId,
        employeeId,
        error: error.message
      });
      throw new Error('PHI encryption failed');
    }
  }

  /**
   * Decrypt PHI with enhanced validation
   */
  async decryptPHI(encryptedPayload, tenantId, employeeId) {
    try {
      if (!encryptedPayload || encryptedPayload.type !== 'PHI') {
        throw new Error('Invalid PHI payload');
      }
      
      // Validate context
      if (encryptedPayload.tenantId !== tenantId || encryptedPayload.employeeId !== employeeId) {
        logger.warn('PHI unauthorized access attempt', {
          requestedTenant: tenantId,
          requestedEmployee: employeeId,
          payloadTenant: encryptedPayload.tenantId,
          payloadEmployee: encryptedPayload.employeeId
        });
        throw new Error('Unauthorized PHI access');
      }
      
      // Enhanced key derivation (same as encryption)
      const phiKey = crypto.pbkdf2Sync(
        this.masterKey,
        this.tenantSalt + tenantId + employeeId,
        this.keyDerivationIterations * 2,
        32,
        'sha512'
      );
      
      const buffer = Buffer.from(encryptedPayload.data, 'base64');
      const iv = buffer.subarray(0, this.ivLength);
      const tag = buffer.subarray(this.ivLength, this.ivLength + this.tagLength);
      const encrypted = buffer.subarray(this.ivLength + this.tagLength);
      
      const decipher = crypto.createDecipher(this.algorithm, phiKey);
      decipher.setAuthTag(tag);
      
      // Reconstruct AAD
      const aad = `PHI:${tenantId}:${employeeId}:${encryptedPayload.timestamp}`;
      decipher.setAAD(Buffer.from(aad));
      
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      // Log PHI access for audit
      logger.info('PHI decrypted', {
        tenantId,
        employeeId,
        timestamp: new Date().toISOString()
      });
      
      return JSON.parse(decrypted.toString('utf8'));
      
    } catch (error) {
      logger.error('PHI decryption failed', {
        tenantId,
        employeeId,
        error: error.message
      });
      throw new Error('PHI decryption failed');
    }
  }

  /**
   * Generate secure token for API access
   */
  generateSecureToken(tenantId, userId, expiresIn = '24h') {
    const payload = {
      tenantId,
      userId,
      type: 'api_access',
      timestamp: Date.now()
    };
    
    // Convert expiresIn to milliseconds
    let expirationMs;
    if (typeof expiresIn === 'string') {
      const unit = expiresIn.slice(-1);
      const value = parseInt(expiresIn.slice(0, -1));
      
      switch (unit) {
        case 'h': expirationMs = value * 60 * 60 * 1000; break;
        case 'd': expirationMs = value * 24 * 60 * 60 * 1000; break;
        case 'm': expirationMs = value * 60 * 1000; break;
        default: expirationMs = 24 * 60 * 60 * 1000; // Default 24h
      }
    } else {
      expirationMs = expiresIn;
    }
    
    payload.expiresAt = Date.now() + expirationMs;
    
    // Encrypt the payload
    const tenantKey = this.deriveTenantKey(tenantId);
    const iv = crypto.randomBytes(this.ivLength);
    
    const cipher = crypto.createCipher(this.algorithm, tenantKey);
    cipher.setAAD(Buffer.from('API_TOKEN'));
    
    let encrypted = cipher.update(JSON.stringify(payload), 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    const tag = cipher.getAuthTag();
    const result = Buffer.concat([iv, tag, encrypted]);
    
    return result.toString('base64url');
  }

  /**
   * Verify and decode secure token
   */
  verifySecureToken(token, tenantId) {
    try {
      const tenantKey = this.deriveTenantKey(tenantId);
      const buffer = Buffer.from(token, 'base64url');
      
      const iv = buffer.subarray(0, this.ivLength);
      const tag = buffer.subarray(this.ivLength, this.ivLength + this.tagLength);
      const encrypted = buffer.subarray(this.ivLength + this.tagLength);
      
      const decipher = crypto.createDecipher(this.algorithm, tenantKey);
      decipher.setAuthTag(tag);
      decipher.setAAD(Buffer.from('API_TOKEN'));
      
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      const payload = JSON.parse(decrypted.toString('utf8'));
      
      // Check expiration
      if (Date.now() > payload.expiresAt) {
        throw new Error('Token expired');
      }
      
      // Validate tenant
      if (payload.tenantId !== tenantId) {
        throw new Error('Token tenant mismatch');
      }
      
      return payload;
      
    } catch (error) {
      logger.warn('Token verification failed', {
        tenantId,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Hash password with tenant-specific salt
   */
  async hashPassword(password, tenantId) {
    const salt = crypto.pbkdf2Sync(
      this.tenantSalt,
      tenantId,
      1000,
      16,
      'sha512'
    ).toString('hex');
    
    const hash = crypto.pbkdf2Sync(
      password,
      salt,
      100000,
      64,
      'sha512'
    ).toString('hex');
    
    return `${salt}:${hash}`;
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password, hashedPassword, tenantId) {
    try {
      const [salt, hash] = hashedPassword.split(':');
      const computedHash = crypto.pbkdf2Sync(
        password,
        salt,
        100000,
        64,
        'sha512'
      ).toString('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(hash, 'hex'),
        Buffer.from(computedHash, 'hex')
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate encryption key for new tenant
   */
  generateTenantEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Rotate encryption keys (for security compliance)
   */
  async rotateKeys(tenantId) {
    // This would implement key rotation logic
    // 1. Generate new key
    // 2. Re-encrypt all data with new key
    // 3. Update tenant configuration
    // 4. Secure disposal of old key
    
    logger.info('Key rotation initiated', { tenantId });
    // Implementation would go here for production
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();

export default encryptionService;