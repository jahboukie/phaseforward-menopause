// Healthcare-grade encryption for PHI data
import crypto from 'crypto';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

export class HealthcareEncryption {
  /**
   * Get encryption key from environment (should be 256-bit)
   */
  static getEncryptionKey() {
    const key = process.env.HIPAA_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('HIPAA_ENCRYPTION_KEY environment variable is required');
    }
    
    // Ensure key is exactly 32 bytes (256 bits)
    const keyBuffer = Buffer.from(key, 'hex');
    if (keyBuffer.length !== KEY_LENGTH) {
      throw new Error(`Encryption key must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters)`);
    }
    
    return keyBuffer;
  }

  /**
   * Encrypt PHI data before storing in AWS RDS
   * @param {Object} data - Data to encrypt
   * @returns {Object} - Encrypted data with metadata
   */
  static async encrypt(data) {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(IV_LENGTH);
      
      // Convert data to JSON string
      const plaintext = JSON.stringify(data);
      
      // Create cipher
      const cipher = crypto.createCipherGCM(ENCRYPTION_ALGORITHM, key, iv);
      
      // Encrypt the data
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get authentication tag
      const tag = cipher.getAuthTag();
      
      // Return encrypted data with metadata
      return {
        encrypted_data: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        algorithm: ENCRYPTION_ALGORITHM,
        encrypted_at: new Date().toISOString(),
        key_version: this.getKeyVersion()
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error(`Failed to encrypt PHI data: ${error.message}`);
    }
  }

  /**
   * Decrypt PHI data from AWS RDS
   * @param {Object} encryptedData - Encrypted data object
   * @returns {Object} - Decrypted original data
   */
  static async decrypt(encryptedData) {
    try {
      const key = this.getEncryptionKey();
      
      // Extract encryption components
      const {
        encrypted_data,
        iv: ivHex,
        tag: tagHex,
        algorithm
      } = encryptedData;
      
      // Validate algorithm
      if (algorithm !== ENCRYPTION_ALGORITHM) {
        throw new Error(`Unsupported encryption algorithm: ${algorithm}`);
      }
      
      // Convert hex strings back to buffers
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      
      // Create decipher
      const decipher = crypto.createDecipherGCM(ENCRYPTION_ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      
      // Decrypt the data
      let decrypted = decipher.update(encrypted_data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // Parse JSON back to object
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error(`Failed to decrypt PHI data: ${error.message}`);
    }
  }

  /**
   * Encrypt specific field values for database storage
   * @param {string} value - Value to encrypt
   * @returns {string} - Encrypted value as hex string
   */
  static async encryptField(value) {
    if (!value) return value;
    
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(IV_LENGTH);
      
      const cipher = crypto.createCipherGCM(ENCRYPTION_ALGORITHM, key, iv);
      
      let encrypted = cipher.update(String(value), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Combine iv, tag, and encrypted data
      const combined = iv.toString('hex') + tag.toString('hex') + encrypted;
      return combined;
    } catch (error) {
      console.error('Field encryption failed:', error);
      throw new Error(`Failed to encrypt field: ${error.message}`);
    }
  }

  /**
   * Decrypt specific field values from database
   * @param {string} encryptedValue - Encrypted hex string
   * @returns {string} - Decrypted original value
   */
  static async decryptField(encryptedValue) {
    if (!encryptedValue) return encryptedValue;
    
    try {
      const key = this.getEncryptionKey();
      
      // Extract components from combined string
      const ivHex = encryptedValue.substring(0, IV_LENGTH * 2);
      const tagHex = encryptedValue.substring(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2);
      const encrypted = encryptedValue.substring((IV_LENGTH + TAG_LENGTH) * 2);
      
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      
      const decipher = crypto.createDecipherGCM(ENCRYPTION_ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Field decryption failed:', error);
      throw new Error(`Failed to decrypt field: ${error.message}`);
    }
  }

  /**
   * Generate a new HIPAA-compliant encryption key
   * @returns {string} - 256-bit encryption key as hex string
   */
  static generateEncryptionKey() {
    const key = crypto.randomBytes(KEY_LENGTH);
    return key.toString('hex');
  }

  /**
   * Hash data for indexing (one-way, for searching encrypted data)
   * @param {string} value - Value to hash
   * @returns {string} - SHA-256 hash
   */
  static hashForIndex(value) {
    const key = this.getEncryptionKey();
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(String(value));
    return hmac.digest('hex');
  }

  /**
   * Get current encryption key version for key rotation
   */
  static getKeyVersion() {
    return process.env.HIPAA_KEY_VERSION || '1';
  }

  /**
   * Validate encryption key strength
   */
  static validateKeyStrength(key) {
    if (!key) return false;
    
    const keyBuffer = Buffer.from(key, 'hex');
    if (keyBuffer.length !== KEY_LENGTH) return false;
    
    // Check for weak keys (all zeros, repeating patterns, etc.)
    const keyHex = keyBuffer.toString('hex');
    
    // Check for all zeros
    if (keyHex === '0'.repeat(KEY_LENGTH * 2)) return false;
    
    // Check for repeating patterns
    const firstByte = keyHex.substring(0, 2);
    if (keyHex === firstByte.repeat(KEY_LENGTH)) return false;
    
    return true;
  }

  /**
   * Create encrypted backup of data for HIPAA retention
   */
  static async createEncryptedBackup(data, metadata = {}) {
    const encryptedData = await this.encrypt(data);
    
    return {
      ...encryptedData,
      backup_id: crypto.randomUUID(),
      backup_created_at: new Date().toISOString(),
      metadata,
      retention_until: this.calculateRetentionDate(),
      backup_type: 'hipaa_compliant'
    };
  }

  /**
   * Calculate HIPAA retention date (7 years from creation)
   */
  static calculateRetentionDate() {
    const retentionDate = new Date();
    retentionDate.setFullYear(retentionDate.getFullYear() + 7);
    return retentionDate.toISOString();
  }

  /**
   * Secure deletion of encryption keys from memory
   */
  static secureKeyCleanup(keyBuffer) {
    if (keyBuffer && keyBuffer.fill) {
      keyBuffer.fill(0);
    }
  }
}

// Export encryption utilities for field-level encryption
export class FieldEncryption {
  /**
   * Encrypt all PII/PHI fields in an object
   */
  static async encryptPHIFields(data, phiFields = []) {
    const encrypted = { ...data };
    
    for (const field of phiFields) {
      if (encrypted[field] !== undefined && encrypted[field] !== null) {
        encrypted[field] = await HealthcareEncryption.encryptField(encrypted[field]);
      }
    }
    
    return encrypted;
  }

  /**
   * Decrypt all PII/PHI fields in an object
   */
  static async decryptPHIFields(data, phiFields = []) {
    const decrypted = { ...data };
    
    for (const field of phiFields) {
      if (decrypted[field] !== undefined && decrypted[field] !== null) {
        try {
          decrypted[field] = await HealthcareEncryption.decryptField(decrypted[field]);
        } catch (error) {
          console.error(`Failed to decrypt field ${field}:`, error);
          // Don't fail the entire operation for one field
          decrypted[field] = '[DECRYPTION_FAILED]';
        }
      }
    }
    
    return decrypted;
  }
}

export default HealthcareEncryption;