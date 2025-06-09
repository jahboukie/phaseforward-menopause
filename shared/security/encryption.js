/**
 * Zero-Knowledge Encryption System
 * Military-Grade Security Foundation
 * 
 * Implements AES-256-GCM + RSA-4096 encryption with client-side key derivation
 * Server never has access to unencrypted user data or encryption keys
 */

const crypto = require('crypto');
const argon2 = require('argon2');

class ZeroKnowledgeEncryption {
  constructor() {
    this.AES_ALGORITHM = 'aes-256-gcm';
    this.RSA_KEY_SIZE = 4096;
    this.AES_KEY_SIZE = 32; // 256 bits
    this.IV_SIZE = 16; // 128 bits
    this.TAG_SIZE = 16; // 128 bits
    this.SALT_SIZE = 32; // 256 bits
    
    // Argon2 parameters for key derivation
    this.ARGON2_CONFIG = {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
      hashLength: 32
    };
  }

  /**
   * Generate RSA key pair for asymmetric encryption
   * Used for secure key exchange and digital signatures
   */
  generateRSAKeyPair() {
    return crypto.generateKeyPairSync('rsa', {
      modulusLength: this.RSA_KEY_SIZE,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });
  }

  /**
   * Derive encryption key from user password using Argon2
   * This ensures the server never sees the actual encryption key
   */
  async deriveKeyFromPassword(password, salt) {
    if (!salt) {
      salt = crypto.randomBytes(this.SALT_SIZE);
    }
    
    const derivedKey = await argon2.hash(password, {
      ...this.ARGON2_CONFIG,
      salt: salt,
      raw: true
    });
    
    return {
      key: derivedKey,
      salt: salt
    };
  }

  /**
   * Generate secure random AES key
   */
  generateAESKey() {
    return crypto.randomBytes(this.AES_KEY_SIZE);
  }

  /**
   * Encrypt data using AES-256-GCM
   * Returns encrypted data with IV and authentication tag
   */
  encryptAES(data, key) {
    const iv = crypto.randomBytes(this.IV_SIZE);
    const cipher = crypto.createCipher(this.AES_ALGORITHM, key, { iv });
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   * Verifies authentication tag for integrity
   */
  decryptAES(encryptedData, key) {
    const { encrypted, iv, tag } = encryptedData;
    
    const decipher = crypto.createDecipher(this.AES_ALGORITHM, key, {
      iv: Buffer.from(iv, 'hex')
    });
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Encrypt data using RSA public key
   * Used for secure key exchange
   */
  encryptRSA(data, publicKey) {
    return crypto.publicEncrypt({
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, Buffer.from(data)).toString('base64');
  }

  /**
   * Decrypt data using RSA private key
   */
  decryptRSA(encryptedData, privateKey) {
    return crypto.privateDecrypt({
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, Buffer.from(encryptedData, 'base64')).toString('utf8');
  }

  /**
   * Create digital signature using RSA private key
   */
  signRSA(data, privateKey) {
    return crypto.sign('sha256', Buffer.from(data), {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
    }).toString('base64');
  }

  /**
   * Verify digital signature using RSA public key
   */
  verifyRSA(data, signature, publicKey) {
    return crypto.verify('sha256', Buffer.from(data), {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
    }, Buffer.from(signature, 'base64'));
  }

  /**
   * Hybrid encryption: RSA + AES
   * Encrypts data with AES, then encrypts AES key with RSA
   */
  hybridEncrypt(data, publicKey) {
    // Generate random AES key
    const aesKey = this.generateAESKey();
    
    // Encrypt data with AES
    const encryptedData = this.encryptAES(data, aesKey);
    
    // Encrypt AES key with RSA
    const encryptedKey = this.encryptRSA(aesKey.toString('hex'), publicKey);
    
    return {
      encryptedData,
      encryptedKey
    };
  }

  /**
   * Hybrid decryption: RSA + AES
   */
  hybridDecrypt(encryptedPayload, privateKey) {
    const { encryptedData, encryptedKey } = encryptedPayload;
    
    // Decrypt AES key with RSA
    const aesKeyHex = this.decryptRSA(encryptedKey, privateKey);
    const aesKey = Buffer.from(aesKeyHex, 'hex');
    
    // Decrypt data with AES
    return this.decryptAES(encryptedData, aesKey);
  }

  /**
   * Generate secure hash using SHA-256
   */
  hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate HMAC for message authentication
   */
  generateHMAC(data, key) {
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  }

  /**
   * Verify HMAC
   */
  verifyHMAC(data, key, expectedHmac) {
    const computedHmac = this.generateHMAC(data, key);
    return crypto.timingSafeEqual(
      Buffer.from(computedHmac, 'hex'),
      Buffer.from(expectedHmac, 'hex')
    );
  }

  /**
   * Secure random token generation
   */
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  constantTimeCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(
      Buffer.from(a, 'utf8'),
      Buffer.from(b, 'utf8')
    );
  }
}

module.exports = ZeroKnowledgeEncryption;
