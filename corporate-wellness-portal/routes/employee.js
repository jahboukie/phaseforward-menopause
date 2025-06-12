/**
 * Corporate Wellness Portal - Employee Management Routes
 * Employee data and analytics management
 */

import express from 'express';
// Use global mock logger for demo
const logger = global.mockLogger || console;

// Mock tenant validation middleware for demo
const validateTenantResource = (resource) => (req, res, next) => next();

const router = express.Router();

/**
 * GET /api/employee
 * Get all employees for tenant with pagination
 */
router.get('/', async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { page = 1, limit = 50, search, department, status } = req.query;
    
    const employees = await this.getEmployees(tenantId, {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      department,
      status
    });
    
    res.json({
      success: true,
      employees: employees.data,
      pagination: employees.pagination,
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Failed to get employees', {
      tenantId: req.tenant?.id,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      error: 'Failed to retrieve employees',
      requestId: req.id
    });
  }
});

/**
 * GET /api/employee/:employeeId
 * Get specific employee details
 */
router.get('/:employeeId', validateTenantResource('employee'), async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { employeeId } = req.params;
    
    const employee = await this.getEmployeeById(tenantId, employeeId);
    
    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found',
        requestId: req.id
      });
    }
    
    res.json({
      success: true,
      employee,
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Failed to get employee', {
      tenantId: req.tenant?.id,
      employeeId: req.params.employeeId,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      error: 'Failed to retrieve employee',
      requestId: req.id
    });
  }
});

/**
 * PUT /api/employee/:employeeId
 * Update employee information
 */
router.put('/:employeeId', validateTenantResource('employee'), async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { employeeId } = req.params;
    const updateData = req.body;
    
    const updatedEmployee = await this.updateEmployee(tenantId, employeeId, updateData);
    
    logger.info('Employee updated', {
      tenantId,
      employeeId,
      updatedBy: req.user?.id,
      requestId: req.id
    });
    
    res.json({
      success: true,
      employee: updatedEmployee,
      message: 'Employee updated successfully',
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Failed to update employee', {
      tenantId: req.tenant?.id,
      employeeId: req.params.employeeId,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      error: 'Failed to update employee',
      requestId: req.id
    });
  }
});

/**
 * GET /api/employee/:employeeId/health-summary
 * Get employee health summary
 */
router.get('/:employeeId/health-summary', validateTenantResource('employee'), async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { employeeId } = req.params;
    
    const healthSummary = await this.getEmployeeHealthSummary(tenantId, employeeId);
    
    res.json({
      success: true,
      healthSummary,
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Failed to get employee health summary', {
      tenantId: req.tenant?.id,
      employeeId: req.params.employeeId,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      error: 'Failed to retrieve health summary',
      requestId: req.id
    });
  }
});

/**
 * GET /api/employee/:employeeId/app-usage
 * Get employee app usage statistics
 */
router.get('/:employeeId/app-usage', validateTenantResource('employee'), async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { employeeId } = req.params;
    const { timeframe = '30d' } = req.query;
    
    const appUsage = await this.getEmployeeAppUsage(tenantId, employeeId, timeframe);
    
    res.json({
      success: true,
      appUsage,
      timeframe,
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Failed to get employee app usage', {
      tenantId: req.tenant?.id,
      employeeId: req.params.employeeId,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      error: 'Failed to retrieve app usage',
      requestId: req.id
    });
  }
});

/**
 * POST /api/employee/:employeeId/assign-apps
 * Assign apps to employee
 */
router.post('/:employeeId/assign-apps', validateTenantResource('employee'), async (req, res) => {
  try {
    const { tenantId } = req.tenant;
    const { employeeId } = req.params;
    const { apps, includeSpouse = false } = req.body;
    
    if (!apps || !Array.isArray(apps)) {
      return res.status(400).json({
        error: 'Apps array is required',
        requestId: req.id
      });
    }
    
    const assignments = await this.assignAppsToEmployee(tenantId, employeeId, apps, {
      includeSpouse,
      assignedBy: req.user?.id
    });
    
    logger.info('Apps assigned to employee', {
      tenantId,
      employeeId,
      apps: apps.map(a => a.appName),
      assignedBy: req.user?.id,
      requestId: req.id
    });
    
    res.json({
      success: true,
      assignments,
      message: 'Apps assigned successfully',
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Failed to assign apps to employee', {
      tenantId: req.tenant?.id,
      employeeId: req.params.employeeId,
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      error: 'Failed to assign apps',
      requestId: req.id
    });
  }
});

/**
 * GET /api/employee/bulk-actions/template
 * Download template for bulk employee actions
 */
router.get('/bulk-actions/template', (req, res) => {
  const csvTemplate = `employee_id,email,action,app_name,access_level,notes
EMP001,john.doe@company.com,assign,innerarchitect,premium,High stress role
EMP002,jane.smith@company.com,assign,menowellness,basic,Age appropriate
EMP003,bob.johnson@company.com,update,status,active,Return from leave
EMP004,alice.brown@company.com,remove,soberpal,,Completed program`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="employee_bulk_actions_template.csv"');
  res.send(csvTemplate);
});

// Helper methods
router.getEmployees = async function(tenantId, options) {
  // Mock data for demo
  const mockEmployees = [
    {
      id: 'emp-001',
      email: 'john.doe@company.com',
      firstName: 'John',
      lastName: 'Doe',
      department: 'Engineering',
      role: 'Senior Software Engineer',
      status: 'active',
      healthScore: 8.2,
      engagementLevel: 'high',
      appsAssigned: ['innerarchitect', 'fertilitytracker'],
      lastActive: '2024-01-15T10:30:00Z'
    },
    {
      id: 'emp-002',
      email: 'jane.smith@company.com',
      firstName: 'Jane',
      lastName: 'Smith',
      department: 'Marketing',
      role: 'Marketing Manager',
      status: 'active',
      healthScore: 9.1,
      engagementLevel: 'high',
      appsAssigned: ['menowellness', 'innerarchitect'],
      lastActive: '2024-01-15T14:20:00Z'
    },
    {
      id: 'emp-003',
      email: 'bob.johnson@company.com',
      firstName: 'Bob',
      lastName: 'Johnson',
      department: 'Sales',
      role: 'Sales Representative',
      status: 'active',
      healthScore: 7.8,
      engagementLevel: 'medium',
      appsAssigned: ['soberpal', 'innerarchitect'],
      lastActive: '2024-01-14T16:45:00Z'
    }
  ];
  
  return {
    data: mockEmployees,
    pagination: {
      page: options.page,
      limit: options.limit,
      total: mockEmployees.length,
      pages: Math.ceil(mockEmployees.length / options.limit)
    }
  };
};

router.getEmployeeById = async function(tenantId, employeeId) {
  // Mock employee data
  return {
    id: employeeId,
    email: 'john.doe@company.com',
    firstName: 'John',
    lastName: 'Doe',
    department: 'Engineering',
    role: 'Senior Software Engineer',
    status: 'active',
    healthScore: 8.2,
    engagementLevel: 'high',
    demographics: {
      age: 32,
      gender: 'male',
      maritalStatus: 'married',
      hasDependents: true
    },
    appsAssigned: [
      {
        appName: 'innerarchitect',
        accessLevel: 'premium',
        assignedAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-15T10:30:00Z',
        usageStats: {
          sessionsThisMonth: 15,
          totalTimeMinutes: 340
        }
      },
      {
        appName: 'fertilitytracker',
        accessLevel: 'basic',
        assignedAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-14T20:15:00Z',
        includeSpouse: true,
        usageStats: {
          sessionsThisMonth: 8,
          totalTimeMinutes: 120
        }
      }
    ],
    healthMetrics: {
      overallScore: 8.2,
      stressLevel: 'medium',
      sleepQuality: 7.8,
      physicalActivity: 8.5,
      mentalWellbeing: 8.0
    },
    riskFactors: [
      {
        factor: 'Work stress',
        level: 'medium',
        recommendation: 'Increase use of stress management tools'
      }
    ]
  };
};

router.updateEmployee = async function(tenantId, employeeId, updateData) {
  // Mock update
  logger.info('Employee updated', { tenantId, employeeId, updateData });
  return { ...this.getEmployeeById(tenantId, employeeId), ...updateData };
};

router.getEmployeeHealthSummary = async function(tenantId, employeeId) {
  return {
    overallHealthScore: 8.2,
    trend: 'improving',
    lastAssessment: '2024-01-15T00:00:00Z',
    riskLevel: 'low',
    recommendations: [
      'Continue current wellness routine',
      'Consider adding more cardiovascular exercise',
      'Maintain good sleep hygiene'
    ],
    metrics: {
      bmi: 24.1,
      bloodPressure: '120/80',
      heartRate: 68,
      stressLevel: 6.2,
      sleepQuality: 7.8,
      energyLevel: 8.1
    },
    goals: [
      {
        type: 'weight_management',
        target: '175 lbs',
        current: '180 lbs',
        progress: 50
      },
      {
        type: 'stress_reduction',
        target: 'Below 5.0',
        current: '6.2',
        progress: 30
      }
    ]
  };
};

router.getEmployeeAppUsage = async function(tenantId, employeeId, timeframe) {
  return {
    totalSessions: 23,
    totalTimeMinutes: 460,
    averageSessionMinutes: 20,
    appsUsed: [
      {
        appName: 'innerarchitect',
        sessions: 15,
        timeMinutes: 340,
        lastUsed: '2024-01-15T10:30:00Z',
        engagementScore: 8.7
      },
      {
        appName: 'fertilitytracker',
        sessions: 8,
        timeMinutes: 120,
        lastUsed: '2024-01-14T20:15:00Z',
        engagementScore: 7.4
      }
    ],
    usagePattern: {
      peakHours: ['8:00 AM', '12:00 PM', '7:00 PM'],
      preferredDevice: 'mobile',
      weeklyTrend: 'stable'
    }
  };
};

router.assignAppsToEmployee = async function(tenantId, employeeId, apps, options) {
  // Mock assignment
  return apps.map(app => ({
    id: `assignment-${Date.now()}-${Math.random()}`,
    employeeId,
    appName: app.appName,
    accessLevel: app.accessLevel || 'basic',
    assignedAt: new Date().toISOString(),
    assignedBy: options.assignedBy,
    includeSpouse: options.includeSpouse && app.includeSpouse,
    status: 'active'
  }));
};

export default router;