/**
 * Corporate Wellness Portal - Enterprise-Scale Bulk Onboarding Service
 * Handles 10,000+ employees with Claude AI-powered app recommendations
 */

import fs from 'fs/promises';
import csv from 'csv-parser';
import { Readable } from 'stream';
import Bull from 'bull';
import { database } from '../utils/database.js';
import { logger } from '../utils/logger.js';
import { encryptionService } from './encryption.js';
import { claudeAIService } from './claude-ai.js';
import { emailService } from './email.js';
import { redisClient } from '../utils/redis.js';

class BulkOnboardingService {
  constructor() {
    // Redis queues for background processing
    this.employeeQueue = new Bull('employee processing', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      }
    });
    
    this.notificationQueue = new Bull('notifications', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      }
    });
    
    this.batchSize = 1000; // Process 1000 employees at a time
    this.maxConcurrentJobs = 10;
    
    this.setupQueueProcessors();
  }

  /**
   * Setup queue processors for background jobs
   */
  setupQueueProcessors() {
    // Employee processing queue
    this.employeeQueue.process('process-employee-batch', this.maxConcurrentJobs, async (job) => {
      return await this.processEmployeeBatch(job.data);
    });
    
    // Notification queue
    this.notificationQueue.process('send-welcome-email', this.maxConcurrentJobs, async (job) => {
      return await this.sendWelcomeEmail(job.data);
    });
    
    // Error handling
    this.employeeQueue.on('failed', (job, err) => {
      logger.error('Employee processing job failed', {
        jobId: job.id,
        tenantId: job.data.tenantId,
        error: err.message
      });
    });
  }

  /**
   * Main entry point for bulk onboarding
   * Handles CSV upload and initiates processing
   */
  async processCSVUpload(tenantId, csvFile, options = {}) {
    const startTime = Date.now();
    const onboardingId = `onboarding_${tenantId}_${Date.now()}`;
    
    try {
      logger.info('Starting bulk onboarding process', {
        tenantId,
        onboardingId,
        filename: csvFile.originalname,
        fileSize: csvFile.size
      });
      
      // Create onboarding session record
      await this.createOnboardingSession(tenantId, onboardingId, {
        filename: csvFile.originalname,
        fileSize: csvFile.size,
        options
      });
      
      // Parse CSV and validate structure
      const employees = await this.parseCSV(csvFile.buffer);
      const validationResult = await this.validateEmployeeData(employees, tenantId);
      
      if (validationResult.errors.length > 0) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }
      
      // Split into batches for processing
      const batches = this.createBatches(validationResult.validEmployees, this.batchSize);
      
      logger.info('Employee data validated, starting batch processing', {
        tenantId,
        onboardingId,
        totalEmployees: validationResult.validEmployees.length,
        totalBatches: batches.length,
        invalidRecords: validationResult.invalidEmployees.length
      });
      
      // Queue batches for processing
      const batchPromises = batches.map((batch, index) => {
        return this.employeeQueue.add('process-employee-batch', {
          tenantId,
          onboardingId,
          batchIndex: index,
          employees: batch,
          options
        }, {
          delay: index * 1000, // Stagger batches by 1 second
          attempts: 3,
          backoff: 'exponential'
        });
      });
      
      // Update session with batch information
      await this.updateOnboardingSession(tenantId, onboardingId, {
        status: 'processing',
        totalEmployees: validationResult.validEmployees.length,
        totalBatches: batches.length,
        batchIds: batchPromises.map(p => p.id)
      });
      
      const processingTime = Date.now() - startTime;
      
      return {
        onboardingId,
        status: 'processing',
        totalEmployees: validationResult.validEmployees.length,
        totalBatches: batches.length,
        invalidRecords: validationResult.invalidEmployees.length,
        processingTimeMs: processingTime,
        estimatedCompletionTime: this.estimateCompletionTime(validationResult.validEmployees.length)
      };
      
    } catch (error) {
      logger.error('Bulk onboarding failed', {
        tenantId,
        onboardingId,
        error: error.message
      });
      
      // Update session with error
      await this.updateOnboardingSession(tenantId, onboardingId, {
        status: 'failed',
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Parse CSV file and extract employee data
   */
  async parseCSV(csvBuffer) {
    return new Promise((resolve, reject) => {
      const employees = [];
      const stream = Readable.from(csvBuffer);
      
      stream
        .pipe(csv({
          mapHeaders: ({ header }) => header.toLowerCase().trim()
        }))
        .on('data', (row) => {
          employees.push(this.normalizeEmployeeData(row));
        })
        .on('end', () => {
          resolve(employees);
        })
        .on('error', (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        });
    });
  }

  /**
   * Normalize employee data from CSV
   */
  normalizeEmployeeData(row) {
    return {
      email: row.email?.toLowerCase().trim(),
      employeeId: row.employee_id || row.id,
      firstName: row.first_name || row.firstname,
      lastName: row.last_name || row.lastname,
      department: row.department,
      role: row.role || row.position || row.job_title,
      managerId: row.manager_id || row.manager_employee_id,
      location: row.location || row.office,
      
      // Demographics for app recommendations
      birthYear: row.birth_year ? parseInt(row.birth_year) : null,
      age: row.age ? parseInt(row.age) : null,
      gender: row.gender?.toLowerCase(),
      maritalStatus: row.marital_status?.toLowerCase(),
      hasDependents: this.parseBoolean(row.has_dependents || row.dependents),
      
      // Spouse/partner information
      includeSpouse: this.parseBoolean(row.include_spouse || row.spouse_access),
      spouseEmail: row.spouse_email?.toLowerCase().trim(),
      
      // Health-related information (optional)
      healthConditions: row.health_conditions?.split(',').map(c => c.trim()),
      stressLevel: row.stress_level,
      
      // Custom fields
      customFields: this.extractCustomFields(row)
    };
  }

  /**
   * Parse boolean values from CSV
   */
  parseBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      return ['true', 'yes', '1', 'y'].includes(lower);
    }
    return false;
  }

  /**
   * Extract custom fields from CSV row
   */
  extractCustomFields(row) {
    const standardFields = [
      'email', 'employee_id', 'id', 'first_name', 'firstname', 'last_name', 'lastname',
      'department', 'role', 'position', 'job_title', 'manager_id', 'manager_employee_id',
      'location', 'office', 'birth_year', 'age', 'gender', 'marital_status',
      'has_dependents', 'dependents', 'include_spouse', 'spouse_access', 'spouse_email',
      'health_conditions', 'stress_level'
    ];
    
    const customFields = {};
    Object.keys(row).forEach(key => {
      if (!standardFields.includes(key.toLowerCase()) && row[key]) {
        customFields[key] = row[key];
      }
    });
    
    return customFields;
  }

  /**
   * Validate employee data
   */
  async validateEmployeeData(employees, tenantId) {
    const validEmployees = [];
    const invalidEmployees = [];
    const errors = [];
    const emailSet = new Set();
    
    // Get tenant configuration for validation rules
    const tenant = await this.getTenantConfig(tenantId);
    
    for (const [index, employee] of employees.entries()) {
      const rowErrors = [];
      
      // Required field validation
      if (!employee.email) {
        rowErrors.push('Email is required');
      } else if (!this.isValidEmail(employee.email)) {
        rowErrors.push('Invalid email format');
      } else if (emailSet.has(employee.email)) {
        rowErrors.push('Duplicate email address');
      } else {
        emailSet.add(employee.email);
      }
      
      if (!employee.firstName) rowErrors.push('First name is required');
      if (!employee.lastName) rowErrors.push('Last name is required');
      
      // Check if employee already exists
      if (employee.email) {
        const existingEmployee = await this.checkExistingEmployee(tenantId, employee.email);
        if (existingEmployee) {
          rowErrors.push('Employee already exists');
        }
      }
      
      // Tenant-specific validation
      if (tenant.maxEmployees && validEmployees.length >= tenant.maxEmployees) {
        rowErrors.push('Exceeds tenant employee limit');
      }
      
      if (rowErrors.length === 0) {
        validEmployees.push({ ...employee, rowIndex: index + 2 }); // +2 for CSV header
      } else {
        invalidEmployees.push({
          rowIndex: index + 2,
          employee,
          errors: rowErrors
        });
        errors.push(`Row ${index + 2}: ${rowErrors.join(', ')}`);
      }
    }
    
    return { validEmployees, invalidEmployees, errors };
  }

  /**
   * Process a batch of employees
   */
  async processEmployeeBatch({ tenantId, onboardingId, batchIndex, employees, options }) {
    const startTime = Date.now();
    
    try {
      logger.info('Processing employee batch', {
        tenantId,
        onboardingId,
        batchIndex,
        employeeCount: employees.length
      });
      
      const results = [];
      
      for (const employee of employees) {
        try {
          // Create employee record
          const employeeRecord = await this.createEmployeeRecord(tenantId, employee);
          
          // Get Claude AI app recommendations
          const appRecommendations = await this.getAppRecommendations(employee, tenantId);
          
          // Provision app access
          const appAssignments = await this.provisionAppAccess(
            tenantId,
            employeeRecord.id,
            appRecommendations,
            employee
          );
          
          // Queue welcome email
          await this.notificationQueue.add('send-welcome-email', {
            tenantId,
            employeeId: employeeRecord.id,
            email: employee.email,
            appAssignments,
            onboardingId
          });
          
          results.push({
            email: employee.email,
            employeeId: employeeRecord.id,
            status: 'success',
            appsAssigned: appAssignments.length
          });
          
        } catch (error) {
          logger.error('Failed to process individual employee', {
            tenantId,
            email: employee.email,
            error: error.message
          });
          
          results.push({
            email: employee.email,
            status: 'failed',
            error: error.message
          });
        }
      }
      
      const processingTime = Date.now() - startTime;
      const successCount = results.filter(r => r.status === 'success').length;
      
      // Update batch status
      await this.updateBatchStatus(tenantId, onboardingId, batchIndex, {
        status: 'completed',
        processedCount: results.length,
        successCount,
        processingTimeMs: processingTime
      });
      
      logger.info('Employee batch completed', {
        tenantId,
        onboardingId,
        batchIndex,
        successCount,
        failureCount: results.length - successCount,
        processingTimeMs: processingTime
      });
      
      return results;
      
    } catch (error) {
      await this.updateBatchStatus(tenantId, onboardingId, batchIndex, {
        status: 'failed',
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Get Claude AI-powered app recommendations
   */
  async getAppRecommendations(employee, tenantId) {
    try {
      const prompt = this.buildRecommendationPrompt(employee);
      const recommendations = await claudeAIService.getAppRecommendations(prompt, {
        tenantId,
        employeeProfile: {
          age: employee.age,
          gender: employee.gender,
          maritalStatus: employee.maritalStatus,
          department: employee.department,
          hasDependents: employee.hasDependents,
          healthConditions: employee.healthConditions,
          stressLevel: employee.stressLevel
        }
      });
      
      return this.validateRecommendations(recommendations);
      
    } catch (error) {
      logger.warn('Failed to get Claude AI recommendations, using fallback', {
        email: employee.email,
        error: error.message
      });
      
      // Fallback to rule-based recommendations
      return this.getFallbackRecommendations(employee);
    }
  }

  /**
   * Build prompt for Claude AI app recommendations
   */
  buildRecommendationPrompt(employee) {
    return `
Based on the following employee profile, recommend the most appropriate wellness apps from our ecosystem:

Available Apps:
- fertilitytracker: Conception monitoring & fertility optimization
- pregnancycompanion: Comprehensive pregnancy journey support  
- postpartumsupport: Postpartum depression & new parent wellness
- menowellness: Menopause symptoms & hormone health
- supportpartner: Partner support during health transitions
- myconfidant: Erectile dysfunction & relationship support
- soberpal: Addiction recovery & sobriety support
- innerarchitect: Personal development with 50+ NLP techniques

Employee Profile:
- Age: ${employee.age || 'Not provided'}
- Gender: ${employee.gender || 'Not provided'}
- Marital Status: ${employee.maritalStatus || 'Not provided'}
- Department: ${employee.department || 'Not provided'}
- Has Dependents: ${employee.hasDependents ? 'Yes' : 'No'}
- Include Spouse: ${employee.includeSpouse ? 'Yes' : 'No'}
- Health Conditions: ${employee.healthConditions?.join(', ') || 'None specified'}
- Stress Level: ${employee.stressLevel || 'Not provided'}

Please recommend 1-3 most relevant apps with brief reasoning. Consider:
1. Life stage and demographics
2. Relationship status and spouse inclusion
3. Department stress levels
4. Specific health conditions mentioned

Respond in JSON format:
{
  "recommendations": [
    {
      "app": "app_name",
      "reason": "brief explanation",
      "priority": "high|medium|low",
      "includeSpouse": true/false
    }
  ]
}`;
  }

  /**
   * Validate Claude AI recommendations
   */
  validateRecommendations(recommendations) {
    const validApps = [
      'fertilitytracker', 'pregnancycompanion', 'postpartumsupport',
      'menowellness', 'supportpartner', 'myconfidant', 
      'soberpal', 'innerarchitect'
    ];
    
    if (!recommendations?.recommendations || !Array.isArray(recommendations.recommendations)) {
      throw new Error('Invalid recommendation format');
    }
    
    return recommendations.recommendations
      .filter(rec => validApps.includes(rec.app))
      .slice(0, 3); // Max 3 apps per employee
  }

  /**
   * Fallback rule-based recommendations
   */
  getFallbackRecommendations(employee) {
    const recommendations = [];
    
    // Age and gender-based recommendations
    if (employee.age && employee.age < 35 && employee.maritalStatus === 'married') {
      recommendations.push({
        app: 'fertilitytracker',
        reason: 'Young married couple - fertility planning',
        priority: 'high',
        includeSpouse: true
      });
    }
    
    if (employee.age && employee.age > 45 && employee.gender === 'female') {
      recommendations.push({
        app: 'menowellness',
        reason: 'Perimenopausal/menopausal age range',
        priority: 'high',
        includeSpouse: false
      });
      
      if (employee.includeSpouse) {
        recommendations.push({
          app: 'supportpartner',
          reason: 'Partner support during menopause transition',
          priority: 'medium',
          includeSpouse: true
        });
      }
    }
    
    // Department-based recommendations
    if (employee.department && ['sales', 'executive', 'finance'].includes(employee.department.toLowerCase())) {
      recommendations.push({
        app: 'innerarchitect',
        reason: 'High-stress department - personal development',
        priority: 'medium',
        includeSpouse: false
      });
    }
    
    // Health condition-based recommendations
    if (employee.healthConditions?.some(condition => 
      condition.toLowerCase().includes('addiction') || 
      condition.toLowerCase().includes('alcohol')
    )) {
      recommendations.push({
        app: 'soberpal',
        reason: 'Addiction recovery support',
        priority: 'high',
        includeSpouse: false
      });
    }
    
    return recommendations.slice(0, 3);
  }

  /**
   * Create employee record in database
   */
  async createEmployeeRecord(tenantId, employee) {
    // Encrypt PII
    const encryptedFirstName = await encryptionService.encryptPHI(
      employee.firstName, tenantId, employee.email
    );
    const encryptedLastName = await encryptionService.encryptPHI(
      employee.lastName, tenantId, employee.email
    );
    
    const query = `
      INSERT INTO tenant_main.employees (
        company_id, email, employee_id, first_name_encrypted, last_name_encrypted,
        department, role, birth_year, gender, marital_status, has_dependents,
        account_status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', NOW())
      RETURNING id, email, created_at
    `;
    
    const values = [
      tenantId,
      employee.email,
      employee.employeeId,
      JSON.stringify(encryptedFirstName),
      JSON.stringify(encryptedLastName),
      employee.department,
      employee.role,
      employee.birthYear,
      employee.gender,
      employee.maritalStatus,
      employee.hasDependents
    ];
    
    const result = await database.query(query, values);
    return result.rows[0];
  }

  /**
   * Provision app access for employee
   */
  async provisionAppAccess(tenantId, employeeId, recommendations, employee) {
    const assignments = [];
    
    for (const rec of recommendations) {
      try {
        // Create app assignment
        const assignment = await this.createAppAssignment(tenantId, employeeId, rec);
        assignments.push(assignment);
        
        // If spouse access is recommended and spouse email provided
        if (rec.includeSpouse && employee.spouseEmail) {
          const spouseAssignment = await this.createSpouseAppAssignment(
            tenantId, employeeId, rec, employee.spouseEmail
          );
          assignments.push(spouseAssignment);
        }
        
      } catch (error) {
        logger.error('Failed to provision app access', {
          tenantId,
          employeeId,
          app: rec.app,
          error: error.message
        });
      }
    }
    
    return assignments;
  }

  /**
   * Create app assignment record
   */
  async createAppAssignment(tenantId, employeeId, recommendation) {
    const query = `
      INSERT INTO tenant_main.app_assignments (
        employee_id, app_name, access_level, app_config, 
        status, provisioned_at
      ) VALUES ($1, $2, $3, $4, 'active', NOW())
      RETURNING id, app_name, access_level
    `;
    
    const appConfig = {
      priority: recommendation.priority,
      reason: recommendation.reason,
      autoProvisioned: true
    };
    
    const values = [
      employeeId,
      recommendation.app,
      'basic', // Start with basic access
      JSON.stringify(appConfig)
    ];
    
    const result = await database.query(query, values);
    return result.rows[0];
  }

  /**
   * Helper methods
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  createBatches(array, batchSize) {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  estimateCompletionTime(employeeCount) {
    // Estimate 5 seconds per employee on average
    const estimatedSeconds = Math.ceil(employeeCount * 5);
    return new Date(Date.now() + estimatedSeconds * 1000).toISOString();
  }

  async getTenantConfig(tenantId) {
    const query = 'SELECT * FROM tenant_main.companies WHERE id = $1';
    const result = await database.query(query, [tenantId]);
    return result.rows[0];
  }

  async checkExistingEmployee(tenantId, email) {
    const query = 'SELECT id FROM tenant_main.employees WHERE company_id = $1 AND email = $2';
    const result = await database.query(query, [tenantId, email]);
    return result.rows[0];
  }

  async createOnboardingSession(tenantId, onboardingId, data) {
    // Implementation for tracking onboarding sessions
    await redisClient.setex(`onboarding:${onboardingId}`, 86400, JSON.stringify({
      tenantId,
      status: 'started',
      startTime: new Date().toISOString(),
      ...data
    }));
  }

  async updateOnboardingSession(tenantId, onboardingId, updates) {
    const existing = await redisClient.get(`onboarding:${onboardingId}`);
    if (existing) {
      const session = JSON.parse(existing);
      await redisClient.setex(`onboarding:${onboardingId}`, 86400, JSON.stringify({
        ...session,
        ...updates,
        lastUpdate: new Date().toISOString()
      }));
    }
  }

  async updateBatchStatus(tenantId, onboardingId, batchIndex, status) {
    await redisClient.setex(
      `batch:${onboardingId}:${batchIndex}`, 
      86400, 
      JSON.stringify(status)
    );
  }

  async sendWelcomeEmail({ tenantId, employeeId, email, appAssignments, onboardingId }) {
    try {
      await emailService.sendWelcomeEmail(tenantId, {
        email,
        appAssignments,
        loginUrl: `${process.env.DOMAIN}/employee/login`
      });
      
      logger.info('Welcome email sent', { tenantId, employeeId, email });
    } catch (error) {
      logger.error('Failed to send welcome email', {
        tenantId, employeeId, email, error: error.message
      });
    }
  }

  /**
   * Get onboarding status
   */
  async getOnboardingStatus(tenantId, onboardingId) {
    const session = await redisClient.get(`onboarding:${onboardingId}`);
    if (!session) {
      throw new Error('Onboarding session not found');
    }
    
    const sessionData = JSON.parse(session);
    
    // Get batch statuses
    const batchStatuses = [];
    if (sessionData.totalBatches) {
      for (let i = 0; i < sessionData.totalBatches; i++) {
        const batchStatus = await redisClient.get(`batch:${onboardingId}:${i}`);
        if (batchStatus) {
          batchStatuses.push(JSON.parse(batchStatus));
        }
      }
    }
    
    return {
      ...sessionData,
      batchStatuses,
      completedBatches: batchStatuses.filter(b => b.status === 'completed').length,
      totalProcessed: batchStatuses.reduce((sum, b) => sum + (b.processedCount || 0), 0),
      totalSuccessful: batchStatuses.reduce((sum, b) => sum + (b.successCount || 0), 0)
    };
  }
}

// Export singleton instance
export const bulkOnboardingService = new BulkOnboardingService();

export default bulkOnboardingService;