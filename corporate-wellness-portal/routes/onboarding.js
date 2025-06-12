/**
 * Corporate Wellness Portal - Bulk Onboarding Routes
 * Handles enterprise-scale employee onboarding with 10,000+ capacity
 */

import express from 'express';
import multer from 'multer';
import { bulkOnboardingService } from '../services/bulk-onboarding.js';
import { logger } from '../utils/logger.js';
import { fileUploadSecurity } from '../middleware/security.js';

const router = express.Router();

// Configure multer for CSV uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Accept CSV and Excel files
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload CSV or Excel files only.'));
    }
  }
});

/**
 * POST /api/onboarding/upload
 * Upload CSV file and start bulk onboarding process
 */
router.post('/upload', upload.single('csvFile'), fileUploadSecurity, async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        error: 'No file uploaded',
        requestId: req.id
      });
    }
    
    logger.info('CSV upload initiated', {
      tenantId,
      filename: file.originalname,
      fileSize: file.size,
      requestId: req.id
    });
    
    // Parse options from request body
    const options = {
      sendWelcomeEmails: req.body.sendWelcomeEmails !== 'false',
      autoActivate: req.body.autoActivate !== 'false',
      dryRun: req.body.dryRun === 'true',
      notificationSettings: req.body.notificationSettings ? 
        JSON.parse(req.body.notificationSettings) : {}
    };
    
    // Start bulk onboarding process
    const result = await bulkOnboardingService.processCSVUpload(tenantId, file, options);
    
    res.status(202).json({
      message: 'Bulk onboarding process started',
      onboardingId: result.onboardingId,
      status: result.status,
      totalEmployees: result.totalEmployees,
      totalBatches: result.totalBatches,
      invalidRecords: result.invalidRecords,
      estimatedCompletionTime: result.estimatedCompletionTime,
      processingTimeMs: result.processingTimeMs,
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Bulk onboarding upload failed', {
      tenantId: req.tenant?.id,
      error: error.message,
      requestId: req.id
    });
    
    res.status(400).json({
      error: error.message,
      requestId: req.id
    });
  }
});

/**
 * GET /api/onboarding/status/:onboardingId
 * Get status of bulk onboarding process
 */
router.get('/status/:onboardingId', async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { onboardingId } = req.params;
    
    const status = await bulkOnboardingService.getOnboardingStatus(tenantId, onboardingId);
    
    // Calculate progress percentage
    const progressPercentage = status.totalBatches > 0 ? 
      Math.round((status.completedBatches / status.totalBatches) * 100) : 0;
    
    // Determine overall status
    let overallStatus = status.status;
    if (status.completedBatches === status.totalBatches && status.totalBatches > 0) {
      overallStatus = 'completed';
    }
    
    res.json({
      onboardingId,
      status: overallStatus,
      progress: {
        percentage: progressPercentage,
        completedBatches: status.completedBatches,
        totalBatches: status.totalBatches,
        totalEmployees: status.totalEmployees,
        totalProcessed: status.totalProcessed,
        totalSuccessful: status.totalSuccessful,
        totalFailed: status.totalProcessed - status.totalSuccessful
      },
      timing: {
        startTime: status.startTime,
        lastUpdate: status.lastUpdate,
        estimatedCompletion: status.estimatedCompletionTime
      },
      batchDetails: status.batchStatuses,
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Failed to get onboarding status', {
      tenantId: req.tenant?.id,
      onboardingId: req.params.onboardingId,
      error: error.message,
      requestId: req.id
    });
    
    res.status(404).json({
      error: error.message,
      requestId: req.id
    });
  }
});

/**
 * GET /api/onboarding/template
 * Download CSV template for bulk employee upload
 */
router.get('/template', (req, res) => {
  const csvTemplate = `email,first_name,last_name,employee_id,department,role,manager_id,location,birth_year,gender,marital_status,has_dependents,include_spouse,spouse_email,health_conditions,stress_level
john.doe@company.com,John,Doe,EMP001,Engineering,Software Engineer,MGR001,San Francisco,1985,male,married,true,true,jane.doe@email.com,none,medium
jane.smith@company.com,Jane,Smith,EMP002,Marketing,Marketing Manager,MGR002,New York,1990,female,single,false,false,,anxiety,high
bob.johnson@company.com,Bob,Johnson,EMP003,Sales,Sales Representative,MGR003,Chicago,1982,male,married,true,false,,diabetes,low
alice.brown@company.com,Alice,Brown,EMP004,HR,HR Specialist,MGR004,Austin,1988,female,married,false,true,spouse@email.com,none,medium`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="employee_bulk_upload_template.csv"');
  res.send(csvTemplate);
});

/**
 * GET /api/onboarding/history
 * Get onboarding history for tenant
 */
router.get('/history', async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { page = 1, limit = 10 } = req.query;
    
    // This would typically query a database table for onboarding history
    // For now, we'll return a placeholder response
    
    const history = {
      onboardingSessions: [
        {
          id: 'onboarding_123456789',
          startTime: '2024-01-15T10:00:00Z',
          status: 'completed',
          totalEmployees: 250,
          successfulEmployees: 248,
          failedEmployees: 2,
          processingTimeMs: 45000,
          initiatedBy: req.user?.id
        }
      ],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 1,
        pages: 1
      }
    };
    
    res.json(history);
    
  } catch (error) {
    logger.error('Failed to get onboarding history', {
      tenantId: req.tenant?.id,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      error: 'Failed to retrieve onboarding history',
      requestId: req.id
    });
  }
});

/**
 * POST /api/onboarding/validate
 * Validate CSV file without processing (dry run)
 */
router.post('/validate', upload.single('csvFile'), fileUploadSecurity, async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        error: 'No file uploaded',
        requestId: req.id
      });
    }
    
    // Run validation only (dry run)
    const options = { dryRun: true };
    const result = await bulkOnboardingService.processCSVUpload(tenantId, file, options);
    
    res.json({
      message: 'CSV validation completed',
      valid: result.invalidRecords === 0,
      totalRecords: result.totalEmployees,
      validRecords: result.totalEmployees - result.invalidRecords,
      invalidRecords: result.invalidRecords,
      estimatedProcessingTime: result.estimatedCompletionTime,
      warnings: result.warnings || [],
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('CSV validation failed', {
      tenantId: req.tenant?.id,
      error: error.message,
      requestId: req.id
    });
    
    res.status(400).json({
      error: error.message,
      requestId: req.id
    });
  }
});

/**
 * DELETE /api/onboarding/:onboardingId
 * Cancel ongoing onboarding process
 */
router.delete('/:onboardingId', async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { onboardingId } = req.params;
    
    // Cancel the onboarding process
    // This would involve stopping queue jobs and updating status
    
    logger.info('Onboarding process cancelled', {
      tenantId,
      onboardingId,
      cancelledBy: req.user?.id,
      requestId: req.id
    });
    
    res.json({
      message: 'Onboarding process cancelled',
      onboardingId,
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Failed to cancel onboarding', {
      tenantId: req.tenant?.id,
      onboardingId: req.params.onboardingId,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      error: 'Failed to cancel onboarding process',
      requestId: req.id
    });
  }
});

/**
 * GET /api/onboarding/apps/recommendations/:employeeId
 * Get app recommendations for specific employee
 */
router.get('/apps/recommendations/:employeeId', async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { employeeId } = req.params;
    
    // Get employee profile
    const employeeQuery = `
      SELECT e.*, c.name as company_name 
      FROM tenant_main.employees e
      JOIN tenant_main.companies c ON e.company_id = c.id
      WHERE e.id = $1 AND e.company_id = $2
    `;
    
    // This would be implemented with actual database query
    // For now, return a placeholder response
    
    const recommendations = [
      {
        app: 'innerarchitect',
        reason: 'High-stress role in engineering department',
        priority: 'high',
        includeSpouse: false,
        features: ['stress_management', 'mindfulness', 'productivity']
      },
      {
        app: 'fertilitytracker',
        reason: 'Married employee under 35',
        priority: 'medium',
        includeSpouse: true,
        features: ['cycle_tracking', 'fertility_insights', 'partner_support']
      }
    ];
    
    res.json({
      employeeId,
      recommendations,
      generatedAt: new Date().toISOString(),
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Failed to get app recommendations', {
      tenantId: req.tenant?.id,
      employeeId: req.params.employeeId,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      error: 'Failed to get app recommendations',
      requestId: req.id
    });
  }
});

/**
 * POST /api/onboarding/ldap/sync
 * Sync employees from LDAP/Active Directory
 */
router.post('/ldap/sync', async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { ldapConfig, syncOptions = {} } = req.body;
    
    // Validate LDAP configuration
    if (!ldapConfig || !ldapConfig.url || !ldapConfig.searchBase) {
      return res.status(400).json({
        error: 'Invalid LDAP configuration',
        requestId: req.id
      });
    }
    
    // Start LDAP sync process
    // This would be implemented with actual LDAP integration
    
    logger.info('LDAP sync initiated', {
      tenantId,
      ldapUrl: ldapConfig.url,
      searchBase: ldapConfig.searchBase,
      requestId: req.id
    });
    
    res.status(202).json({
      message: 'LDAP sync process started',
      syncId: `ldap_sync_${Date.now()}`,
      status: 'processing',
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('LDAP sync failed', {
      tenantId: req.tenant?.id,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      error: 'LDAP sync failed',
      requestId: req.id
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum size is 100MB.',
        requestId: req.id
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files. Please upload one file at a time.',
        requestId: req.id
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: error.message,
      requestId: req.id
    });
  }
  
  next(error);
});

export default router;