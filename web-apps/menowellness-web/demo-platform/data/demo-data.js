// Dr. Alex AI Demo Platform - Fictional Data
// All data is completely fictional for demonstration purposes

const { v4: uuidv4 } = require('uuid');

// Demo Provider Information
const DEMO_PROVIDER = {
  id: 'demo-provider-001',
  name: 'Dr. Sarah Johnson',
  email: 'demo@dralexai.com',
  title: 'Chief Medical Officer',
  hospital: 'Metropolitan Health System',
  specialty: 'Internal Medicine & Women\'s Health',
  license: 'MD123456789',
  tier: 'Enterprise',
  joinDate: '2023-01-15'
};

// Fictional Patient Data (HIPAA Safe - No Real Patients)
const DEMO_PATIENTS = [
  {
    id: 'demo-patient-001',
    name: 'Patient L.R.',
    age: 52,
    gender: 'Female',
    condition: 'Perimenopause',
    riskLevel: 'moderate',
    apps: ['MenoWellness', 'SupportivePartner'],
    insights: 'Responding well to integrated HRT + lifestyle interventions. Partner support improving outcomes.',
    lastActivity: '2024-01-09',
    adherence: 94,
    improvementScore: 78
  },
  {
    id: 'demo-patient-002', 
    name: 'Patient M.K.',
    age: 34,
    gender: 'Male',
    condition: 'Substance Use Recovery',
    riskLevel: 'high',
    apps: ['SoberPal', 'MyConfidant'],
    insights: 'Strong progress in recovery. Relationship counseling providing crucial support structure.',
    lastActivity: '2024-01-09',
    adherence: 87,
    improvementScore: 82
  },
  {
    id: 'demo-patient-003',
    name: 'Patient K.W.',
    age: 28,
    gender: 'Female', 
    condition: 'Fertility Planning',
    riskLevel: 'low',
    apps: ['FertilityTracker', 'MyConfidant'],
    insights: 'Optimal fertility tracking. Partner engagement excellent for conception planning.',
    lastActivity: '2024-01-09',
    adherence: 96,
    improvementScore: 91
  },
  {
    id: 'demo-patient-004',
    name: 'Patient J.D.',
    age: 45,
    gender: 'Male',
    condition: 'Mental Health Support',
    riskLevel: 'moderate',
    apps: ['InnerArchitect', 'SoberPal'],
    insights: 'Meditation and mindfulness practices reducing anxiety. Sobriety maintenance stable.',
    lastActivity: '2024-01-08',
    adherence: 89,
    improvementScore: 75
  }
];

// Pre-canned AI Responses for Consistency
const DEMO_AI_RESPONSES = {
  security: [
    "🔒 **ENTERPRISE SECURITY OVERVIEW**: Dr. Alex AI implements military-grade security with HIPAA, PIPEDA, and GDPR compliance. Our zero-knowledge proof encryption ensures your patient data is encrypted client-side before transmission - even our servers cannot decrypt your data without your private key. We're SOC 2 Type II certified with 99.99% uptime SLA.",
    
    "🛡️ **ZERO-KNOWLEDGE ENCRYPTION**: Your patient data is protected by cryptographic proofs that verify integrity without exposing content. We use homomorphic encryption for analytics on encrypted data, multi-party computation, and perfect forward secrecy. Even Dr. Alex AI processes only anonymized, encrypted insights - never raw patient data.",
    
    "📋 **COMPLIANCE CERTIFICATIONS**: ✅ HIPAA (US) - Full BAA coverage, audit trails, breach notification ✅ PIPEDA (Canada) - Consent management, data minimization ✅ GDPR (EU) - Right to erasure, data portability, DPIA assessments ✅ ISO 27001 & SOC 2 Type II certified infrastructure with penetration testing.",
    
    "🏥 **HEALTHCARE-FIRST DESIGN**: Built specifically for healthcare with role-based access controls, MFA mandatory, zero-trust architecture, and real-time threat detection. Geographic data residency options ensure compliance with local regulations. Our DPO oversees all privacy implementations."
  ],
  
  clinical: [
    "📊 **PATIENT CORRELATION ANALYSIS**: Based on cross-app data from 847 similar patients, integrated menopause management with partner support shows 67% better outcomes. Recommend combining MenoWellness tracking with SupportivePartner education for Patient L.R. Expected improvement: +23% symptom management within 30 days.",
    
    "🎯 **PERSONALIZED TREATMENT RECOMMENDATION**: Patient M.K.'s recovery data shows 89% adherence when combining SoberPal check-ins with relationship counseling. Cross-app analysis indicates morning meditation (Inner Architect) reduces evening cravings by 34%. Suggest integrated morning routine.",
    
    "⚡ **REAL-TIME INSIGHT**: Patient K.W.'s fertility window optimization shows 94% accuracy using AI-powered cycle prediction. Partner engagement score of 92% indicates strong support system. Conception probability: 78% within next 3 cycles with current protocol.",
    
    "🧠 **BEHAVIORAL PATTERN DETECTION**: Patient J.D.'s anxiety levels correlate inversely with meditation consistency (r=-0.73). When missing 2+ days of mindfulness practice, anxiety scores increase 45%. Recommend automated gentle reminders via Inner Architect integration."
  ],
  
  crisis: [
    "🚨 **CRITICAL ALERT DETECTED**: Patient M.K. showing elevated relapse risk indicators. SoberPal data shows: missed 3 check-ins, stress level >8/10, social isolation increasing. IMMEDIATE ACTIONS: 1) Trigger emergency support protocol 2) Notify crisis counselor 3) Activate partner support network via MyConfidant.",
    
    "⚠️ **MODERATE RISK ALERT**: Patient L.R. experiencing symptom cluster suggesting hormonal fluctuation. Pattern analysis indicates 78% probability of severe episode within 48-72 hours. RECOMMENDED: Adjust HRT timing, increase partner communication via SupportivePartner, schedule check-in.",
    
    "🔴 **SUICIDE RISK PROTOCOL**: NLP analysis of patient communications triggered highest-level alert. Immediate intervention required. Emergency contacts activated. Provider notification sent. Crisis counselor dispatched. All patient apps switched to crisis support mode.",
    
    "📈 **EARLY WARNING SYSTEM**: Predictive models indicate 3 patients showing early deterioration patterns. Proactive interventions recommended before clinical symptoms manifest. Average prevention success rate: 91% when early warnings are acted upon within 24 hours."
  ],
  
  roi: [
    "💰 **COST SAVINGS ANALYSIS**: Based on your patient population of 2,847 patients, Dr. Alex AI integration projects: $847,000 annual savings through reduced readmissions, $356,000 from administrative efficiency, $234,000 from early intervention prevention. Total ROI: 312% within first year.",
    
    "⏱️ **TIME EFFICIENCY GAINS**: Providers report average 47 minutes saved per patient encounter through AI-assisted documentation, pre-visit summaries, and automated treatment recommendations. For a practice seeing 150 patients/week, this equals 117 hours saved monthly = $23,400 value at $200/hour.",
    
    "📊 **OUTCOME IMPROVEMENTS**: Integrated care model shows: 23% reduction in hospital readmissions, 34% improvement in treatment adherence, 45% increase in patient satisfaction scores, 28% reduction in provider burnout metrics. These improvements translate to $1.2M annual value for 500-bed hospital.",
    
    "🎯 **RISK REDUCTION**: AI-powered early warning system prevents average 67 adverse events monthly. Each prevention saves estimated $15,000-45,000 in emergency interventions. Crisis detection alone provides 4.2x ROI, not including reduced liability and improved outcomes."
  ]
};

// Demo Metrics for Executive Dashboard
const DEMO_METRICS = {
  costSavings: {
    annual: 847000,
    monthly: 70583,
    perProvider: 12500,
    currency: 'USD'
  },
  timeEfficiency: {
    minutesSavedPerPatient: 47,
    hoursPerMonth: 117,
    adminReduction: 40,
    documentationSpeed: 65
  },
  patientOutcomes: {
    readmissionReduction: 23,
    adherenceImprovement: 34,
    satisfactionIncrease: 45,
    riskPrevention: 67
  },
  systemMetrics: {
    uptime: 99.99,
    responseTime: 0.3,
    accuracyRate: 94.7,
    complianceScore: 100
  }
};

// Demo Usage Statistics
const DEMO_USAGE = {
  totalQueries: 15847,
  queriesThisMonth: 2156,
  activeProviders: 47,
  connectedPatients: 2847,
  preventedCrises: 23,
  savedHours: 1247
};

// Demo Alert Feed
const DEMO_ALERTS = [
  {
    id: uuidv4(),
    type: 'crisis',
    severity: 'high',
    patient: 'Patient M.K.',
    message: 'Elevated relapse risk indicators detected',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
    actions: ['Notify crisis counselor', 'Activate support network', 'Schedule emergency check-in']
  },
  {
    id: uuidv4(),
    type: 'insight',
    severity: 'medium',
    patient: 'Patient L.R.',
    message: 'Partner support correlation with symptom improvement identified',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    actions: ['Increase partner engagement', 'Schedule couples session']
  },
  {
    id: uuidv4(),
    type: 'success',
    severity: 'low',
    patient: 'Patient K.W.',
    message: 'Fertility tracking accuracy exceeded 95% - conception window optimized',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    actions: ['Continue current protocol', 'Celebrate milestone']
  }
];

module.exports = {
  DEMO_PROVIDER,
  DEMO_PATIENTS,
  DEMO_AI_RESPONSES,
  DEMO_METRICS,
  DEMO_USAGE,
  DEMO_ALERTS
};