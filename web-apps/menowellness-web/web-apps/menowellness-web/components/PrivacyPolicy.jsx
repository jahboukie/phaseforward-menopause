// Privacy Policy and Terms of Service for MenoWellness
import React, { useState } from 'react';

export default function PrivacyPolicy() {
  const [activeTab, setActiveTab] = useState('privacy');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6">
            <h1 className="text-3xl font-bold">MenoWellness Legal Information</h1>
            <p className="mt-2 text-pink-100">
              Transparency and trust in our Human-Claude collaboration
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('privacy')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'privacy'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setActiveTab('terms')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'terms'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Terms of Service
              </button>
              <button
                onClick={() => setActiveTab('hipaa')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'hipaa'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                HIPAA Notice
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'privacy' && <PrivacyContent />}
            {activeTab === 'terms' && <TermsContent />}
            {activeTab === 'hipaa' && <HIPAAContent />}
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="prose prose-gray max-w-none">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
      <p className="text-sm text-gray-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Human-Claude Collaboration Notice</h3>
        <p className="text-blue-700 text-sm">
          MenoWellness was created through an innovative partnership between human healthcare vision 
          and Claude AI's technical capabilities. This collaboration ensures both cutting-edge technology 
          and genuine compassion for women's health needs.
        </p>
      </div>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Information We Collect</h3>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-green-800 mb-2">🔒 Protected Health Information (PHI)</h4>
          <p className="text-green-700 text-sm mb-2">
            Stored in HIPAA-compliant AWS infrastructure with military-grade encryption:
          </p>
          <ul className="list-disc list-inside text-green-700 text-sm space-y-1">
            <li>Menopause symptoms and severity ratings</li>
            <li>Health tracking data and notes</li>
            <li>Medical history related to menopause</li>
            <li>Personal health insights and patterns</li>
          </ul>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">📊 Non-Health Information</h4>
          <p className="text-gray-700 text-sm mb-2">
            Stored in Supabase with standard encryption:
          </p>
          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
            <li>Account information (email, subscription status)</li>
            <li>App usage analytics and preferences</li>
            <li>Session data and authentication tokens</li>
            <li>Communication preferences</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">How We Protect Your Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-2">🛡️ Technical Safeguards</h4>
            <ul className="text-purple-700 text-sm space-y-1">
              <li>• AES-256-GCM encryption for all PHI</li>
              <li>• HIPAA-compliant AWS infrastructure</li>
              <li>• Automatic data classification</li>
              <li>• Secure API endpoints with authentication</li>
            </ul>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 mb-2">📋 Administrative Safeguards</h4>
            <ul className="text-orange-700 text-sm space-y-1">
              <li>• Complete audit trail of all access</li>
              <li>• Staff training on HIPAA compliance</li>
              <li>• Regular security assessments</li>
              <li>• Data breach response procedures</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Your Rights</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <span className="text-green-500 mt-1">✓</span>
            <div>
              <h4 className="font-medium text-gray-800">Access Your Data</h4>
              <p className="text-gray-600 text-sm">Request a copy of all your health information at any time</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-green-500 mt-1">✓</span>
            <div>
              <h4 className="font-medium text-gray-800">Correct Your Data</h4>
              <p className="text-gray-600 text-sm">Update or modify any incorrect information</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-green-500 mt-1">✓</span>
            <div>
              <h4 className="font-medium text-gray-800">Delete Your Data</h4>
              <p className="text-gray-600 text-sm">Request complete deletion of your account and all associated data</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-green-500 mt-1">✓</span>
            <div>
              <h4 className="font-medium text-gray-800">Data Portability</h4>
              <p className="text-gray-600 text-sm">Export your data in standard formats</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Contact Information</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 mb-2">
            <strong>Privacy Officer:</strong> privacy@menowellness.com
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Data Protection Officer:</strong> dpo@menowellness.com
          </p>
          <p className="text-gray-700">
            <strong>General Support:</strong> support@menowellness.com
          </p>
        </div>
      </section>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="prose prose-gray max-w-none">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms of Service</h2>
      <p className="text-sm text-gray-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Acceptance of Terms</h3>
        <p className="text-gray-700 mb-4">
          By accessing and using MenoWellness, you accept and agree to be bound by the terms 
          and provision of this agreement. This service is a product of Human-Claude collaboration, 
          combining human healthcare expertise with AI technology capabilities.
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Service Description</h3>
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <p className="text-pink-800 text-sm">
            MenoWellness is a digital health platform designed to support women through their 
            menopause journey. Our services include symptom tracking, AI-powered insights, 
            educational content, and community support.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Medical Disclaimer</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notice</h4>
          <div className="text-yellow-700 text-sm space-y-2">
            <p>
              MenoWellness is for informational and tracking purposes only. It is not intended 
              to diagnose, treat, cure, or prevent any disease or medical condition.
            </p>
            <p>
              Always consult with qualified healthcare professionals for medical advice, 
              diagnosis, and treatment. Do not disregard professional medical advice or 
              delay seeking treatment based on information from this app.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Subscription Terms</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Billing</h4>
            <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
              <li>Subscriptions are billed monthly or annually based on your selected plan</li>
              <li>Payment is processed through Stripe, our secure payment processor</li>
              <li>All fees are non-refundable unless required by law</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Cancellation</h4>
            <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
              <li>You may cancel your subscription at any time through your account settings</li>
              <li>Cancellation takes effect at the end of your current billing period</li>
              <li>You retain access to premium features until your subscription expires</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">User Responsibilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Account Security</h4>
            <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
              <li>Maintain the confidentiality of your login credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Use strong, unique passwords</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Appropriate Use</h4>
            <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
              <li>Provide accurate and truthful information</li>
              <li>Use the service for personal, non-commercial purposes</li>
              <li>Respect the privacy of other users</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Limitation of Liability</h3>
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-gray-700 text-sm">
            MenoWellness and its creators (including both human and AI contributors) shall not be 
            liable for any indirect, incidental, special, consequential, or punitive damages, 
            including but not limited to loss of profits, data, or use, incurred by you or any 
            third party, whether in an action of contract or tort.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Changes to Terms</h3>
        <p className="text-gray-700">
          We reserve the right to modify these terms at any time. We will notify users of any 
          material changes via email or through the app. Your continued use of the service after 
          such modifications constitutes acceptance of the updated terms.
        </p>
      </section>
    </div>
  );
}

function HIPAAContent() {
  return (
    <div className="prose prose-gray max-w-none">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">HIPAA Notice of Privacy Practices</h2>
      <p className="text-sm text-gray-500 mb-6">Effective Date: {new Date().toLocaleDateString()}</p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">🏥 Your Health Information Rights</h3>
        <p className="text-blue-700 text-sm">
          This notice describes how medical information about you may be used and disclosed 
          and how you can get access to this information. Please review it carefully.
        </p>
      </div>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">How We Use Your Health Information</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-gray-800 mb-1">Treatment</h4>
            <p className="text-gray-700 text-sm">
              To provide you with symptom tracking, insights, and health information 
              to support your menopause journey.
            </p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-semibold text-gray-800 mb-1">Operations</h4>
            <p className="text-gray-700 text-sm">
              To improve our services, ensure quality care, and maintain the security 
              and functionality of our platform.
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-semibold text-gray-800 mb-1">Payment</h4>
            <p className="text-gray-700 text-sm">
              To process subscription payments and manage your account billing information.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Your Individual Rights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Access Rights</h4>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• View your health information</li>
              <li>• Request corrections to your data</li>
              <li>• Get a copy of your health record</li>
              <li>• Request restrictions on use</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Communication Rights</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Choose how we contact you</li>
              <li>• Request confidential communications</li>
              <li>• File a complaint about privacy practices</li>
              <li>• Get a paper copy of this notice</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Security Measures</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl mb-2">🔐</div>
              <h4 className="font-semibold text-gray-800 mb-1">Encryption</h4>
              <p className="text-gray-600 text-sm">Military-grade AES-256 encryption</p>
            </div>
            <div>
              <div className="text-3xl mb-2">☁️</div>
              <h4 className="font-semibold text-gray-800 mb-1">Infrastructure</h4>
              <p className="text-gray-600 text-sm">HIPAA-compliant AWS cloud</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📋</div>
              <h4 className="font-semibold text-gray-800 mb-1">Audit Trail</h4>
              <p className="text-gray-600 text-sm">Complete access logging</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Data Breaches</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm mb-2">
            <strong>We will notify you if a breach occurs that may have compromised the privacy 
            or security of your health information.</strong>
          </p>
          <ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
            <li>Notification within 60 days of discovery</li>
            <li>Description of what happened and information involved</li>
            <li>Steps we are taking to address the breach</li>
            <li>Actions you can take to protect yourself</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Contact Our Privacy Officer</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 mb-4">
            If you have questions about this notice or need to exercise your rights:
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Privacy Officer:</strong> privacy@menowellness.com</p>
            <p><strong>Phone:</strong> 1-800-MENO-HELP</p>
            <p><strong>Address:</strong> MenoWellness Privacy Office, [Address]</p>
          </div>
          <p className="text-gray-600 text-sm mt-4">
            You may also file a complaint with the U.S. Department of Health and Human Services 
            Office for Civil Rights.
          </p>
        </div>
      </section>
    </div>
  );
}