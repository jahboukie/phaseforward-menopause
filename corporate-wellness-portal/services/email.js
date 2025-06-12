/**
 * Corporate Wellness Portal - Enterprise Email Service
 * Handles welcome emails, notifications, and corporate communications
 */

import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';
import { database } from '../utils/database.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = new Map();
    this.initializeTransporter();
    this.loadEmailTemplates();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        pool: true,
        maxConnections: 10,
        maxMessages: 100
      });

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          logger.error('Email transporter verification failed', { error: error.message });
        } else {
          logger.info('Email service initialized successfully');
        }
      });

    } catch (error) {
      logger.error('Failed to initialize email transporter', { error: error.message });
    }
  }

  /**
   * Load email templates
   */
  loadEmailTemplates() {
    this.templates.set('welcome', {
      subject: 'Welcome to Your Corporate Wellness Journey!',
      html: this.getWelcomeEmailTemplate(),
      text: this.getWelcomeEmailTextTemplate()
    });

    this.templates.set('app_assignment', {
      subject: 'New Wellness Apps Available',
      html: this.getAppAssignmentTemplate(),
      text: this.getAppAssignmentTextTemplate()
    });

    this.templates.set('risk_alert', {
      subject: 'Health Risk Alert - Action Required',
      html: this.getRiskAlertTemplate(),
      text: this.getRiskAlertTextTemplate()
    });

    this.templates.set('program_update', {
      subject: 'Wellness Program Update',
      html: this.getProgramUpdateTemplate(),
      text: this.getProgramUpdateTextTemplate()
    });
  }

  /**
   * Send welcome email to new employee
   */
  async sendWelcomeEmail(tenantId, emailData) {
    try {
      const tenant = await this.getTenantConfig(tenantId);
      const template = this.templates.get('welcome');
      
      const emailContent = {
        from: `${tenant.name} Wellness Team <${process.env.SMTP_USER}>`,
        to: emailData.email,
        subject: template.subject,
        html: this.renderTemplate(template.html, {
          companyName: tenant.name,
          employeeEmail: emailData.email,
          appAssignments: emailData.appAssignments,
          loginUrl: emailData.loginUrl,
          supportEmail: tenant.primary_contact_email
        }),
        text: this.renderTemplate(template.text, {
          companyName: tenant.name,
          employeeEmail: emailData.email,
          loginUrl: emailData.loginUrl
        })
      };

      const result = await this.transporter.sendMail(emailContent);
      
      logger.info('Welcome email sent successfully', {
        tenantId,
        email: emailData.email,
        messageId: result.messageId
      });

      // Log email send event
      await this.logEmailEvent(tenantId, {
        type: 'welcome',
        recipient: emailData.email,
        status: 'sent',
        messageId: result.messageId
      });

      return result;

    } catch (error) {
      logger.error('Failed to send welcome email', {
        tenantId,
        email: emailData.email,
        error: error.message
      });

      await this.logEmailEvent(tenantId, {
        type: 'welcome',
        recipient: emailData.email,
        status: 'failed',
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Send app assignment notification
   */
  async sendAppAssignmentNotification(tenantId, emailData) {
    try {
      const tenant = await this.getTenantConfig(tenantId);
      const template = this.templates.get('app_assignment');
      
      const emailContent = {
        from: `${tenant.name} Wellness Team <${process.env.SMTP_USER}>`,
        to: emailData.email,
        subject: template.subject,
        html: this.renderTemplate(template.html, {
          companyName: tenant.name,
          employeeName: emailData.employeeName,
          newApps: emailData.newApps,
          loginUrl: emailData.loginUrl
        })
      };

      const result = await this.transporter.sendMail(emailContent);
      
      logger.info('App assignment notification sent', {
        tenantId,
        email: emailData.email,
        appCount: emailData.newApps.length
      });

      return result;

    } catch (error) {
      logger.error('Failed to send app assignment notification', {
        tenantId,
        email: emailData.email,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send risk alert email
   */
  async sendRiskAlert(tenantId, alertData) {
    try {
      const tenant = await this.getTenantConfig(tenantId);
      const template = this.templates.get('risk_alert');
      
      const emailContent = {
        from: `${tenant.name} Wellness Team <${process.env.SMTP_USER}>`,
        to: alertData.recipientEmail,
        subject: `[${alertData.riskLevel.toUpperCase()}] ${template.subject}`,
        html: this.renderTemplate(template.html, {
          companyName: tenant.name,
          riskLevel: alertData.riskLevel,
          riskDescription: alertData.description,
          recommendedActions: alertData.recommendations,
          contactInfo: tenant.primary_contact_email
        }),
        priority: alertData.riskLevel === 'high' ? 'high' : 'normal'
      };

      const result = await this.transporter.sendMail(emailContent);
      
      logger.security('Risk alert email sent', {
        tenantId,
        riskLevel: alertData.riskLevel,
        recipient: alertData.recipientEmail
      });

      return result;

    } catch (error) {
      logger.error('Failed to send risk alert email', {
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get tenant configuration for email customization
   */
  async getTenantConfig(tenantId) {
    const query = `
      SELECT name, primary_contact_email, white_label_config 
      FROM tenant_main.companies 
      WHERE id = $1
    `;
    
    const result = await database.query(query, [tenantId]);
    return result.rows[0];
  }

  /**
   * Render email template with data
   */
  renderTemplate(template, data) {
    let rendered = template;
    
    Object.keys(data).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = Array.isArray(data[key]) ? this.renderArray(data[key]) : data[key];
      rendered = rendered.replace(new RegExp(placeholder, 'g'), value || '');
    });
    
    return rendered;
  }

  /**
   * Render array data for templates
   */
  renderArray(array) {
    if (!Array.isArray(array)) return '';
    
    return array.map(item => {
      if (typeof item === 'object') {
        return `<li>${item.name || item.app_name || JSON.stringify(item)}</li>`;
      }
      return `<li>${item}</li>`;
    }).join('');
  }

  /**
   * Log email events for analytics
   */
  async logEmailEvent(tenantId, eventData) {
    try {
      await database.query(`
        INSERT INTO tenant_audit.email_events 
        (tenant_id, event_type, recipient, status, message_id, error_message, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [
        tenantId,
        eventData.type,
        eventData.recipient,
        eventData.status,
        eventData.messageId || null,
        eventData.error || null
      ]);
    } catch (error) {
      logger.error('Failed to log email event', { error: error.message });
    }
  }

  // =============================================
  // EMAIL TEMPLATES
  // =============================================

  getWelcomeEmailTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .app-list { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .button { 
            display: inline-block; 
            background: #2563eb; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 15px 0;
        }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to {{companyName}} Wellness Program!</h1>
        </div>
        
        <div class="content">
            <h2>Your Wellness Journey Starts Now</h2>
            
            <p>Dear Valued Employee,</p>
            
            <p>We're excited to welcome you to our comprehensive corporate wellness program powered by cutting-edge AI technology. Your personalized wellness apps have been carefully selected based on your profile to support your health and wellbeing journey.</p>
            
            <div class="app-list">
                <h3>Your Assigned Wellness Apps:</h3>
                <ul>{{appAssignments}}</ul>
            </div>
            
            <p>These apps provide:</p>
            <ul>
                <li>🤖 AI-powered health insights and recommendations</li>
                <li>📊 Personal health tracking and analytics</li>
                <li>💡 Evidence-based wellness guidance</li>
                <li>🏆 Engaging challenges and community support</li>
                <li>🔒 HIPAA-compliant data security</li>
            </ul>
            
            <div style="text-align: center;">
                <a href="{{loginUrl}}" class="button">Access Your Wellness Portal</a>
            </div>
            
            <p><strong>Getting Started:</strong></p>
            <ol>
                <li>Click the button above to access your wellness portal</li>
                <li>Log in with your work email: {{employeeEmail}}</li>
                <li>Complete your health profile for personalized recommendations</li>
                <li>Explore your assigned apps and start your wellness journey</li>
            </ol>
            
            <p>Questions? Our wellness support team is here to help at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
        </div>
        
        <div class="footer">
            <p>This email was sent by {{companyName}} Wellness Program</p>
            <p>Powered by Claude AI Healthcare Intelligence</p>
        </div>
    </div>
</body>
</html>`;
  }

  getWelcomeEmailTextTemplate() {
    return `
Welcome to {{companyName}} Wellness Program!

Dear Valued Employee,

We're excited to welcome you to our comprehensive corporate wellness program. Your personalized wellness apps have been carefully selected to support your health journey.

Access your wellness portal: {{loginUrl}}
Login with: {{employeeEmail}}

Questions? Contact us at {{supportEmail}}

Best regards,
{{companyName}} Wellness Team
`;
  }

  getAppAssignmentTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .app-list { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .button { 
            display: inline-block; 
            background: #059669; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Wellness Apps Available!</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{employeeName}},</h2>
            
            <p>Great news! Based on your wellness journey and health goals, we've added new personalized apps to your {{companyName}} wellness program.</p>
            
            <div class="app-list">
                <h3>New Apps Added to Your Account:</h3>
                <ul>{{newApps}}</ul>
            </div>
            
            <div style="text-align: center;">
                <a href="{{loginUrl}}" class="button">Explore Your New Apps</a>
            </div>
            
            <p>These apps are specifically chosen to complement your current wellness routine and help you achieve your health goals more effectively.</p>
        </div>
    </div>
</body>
</html>`;
  }

  getAppAssignmentTextTemplate() {
    return `
New Wellness Apps Available!

Hello,

You have new wellness apps available in your corporate wellness program.

Access your apps: {{loginUrl}}

Best regards,
Your Wellness Team
`;
  }

  getRiskAlertTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #fef2f2; border: 1px solid #fecaca; }
        .alert-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc2626; }
        .button { 
            display: inline-block; 
            background: #dc2626; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Health Risk Alert</h1>
        </div>
        
        <div class="content">
            <div class="alert-box">
                <h3>{{riskLevel}} Risk Level Detected</h3>
                <p>{{riskDescription}}</p>
            </div>
            
            <h3>Recommended Actions:</h3>
            <ul>{{recommendedActions}}</ul>
            
            <p><strong>What to do next:</strong></p>
            <ol>
                <li>Review the risk factors identified</li>
                <li>Consider speaking with your healthcare provider</li>
                <li>Access your wellness apps for targeted support</li>
                <li>Contact our wellness team if you need assistance</li>
            </ol>
            
            <p>For immediate support, contact us at <a href="mailto:{{contactInfo}}">{{contactInfo}}</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  getRiskAlertTextTemplate() {
    return `
HEALTH RISK ALERT

Risk Level: {{riskLevel}}
Description: {{riskDescription}}

Recommended Actions:
{{recommendedActions}}

Contact: {{contactInfo}}
`;
  }

  getProgramUpdateTemplate() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Wellness Program Update</h1>
        </div>
        
        <div class="content">
            <p>Your {{companyName}} wellness program has been updated with new features and improvements.</p>
            
            <p>Stay tuned for more updates to enhance your wellness journey!</p>
        </div>
    </div>
</body>
</html>`;
  }

  getProgramUpdateTextTemplate() {
    return `
Wellness Program Update

Your wellness program has been updated with new features.

Best regards,
Your Wellness Team
`;
  }
}

// Export singleton instance
export const emailService = new EmailService();

export default emailService;