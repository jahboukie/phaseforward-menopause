// Common types for all ecosystem apps

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'provider' | 'admin';
  subscriptions: AppSubscription[];
  createdAt: string;
  updatedAt: string;
}

export interface AppSubscription {
  appName: string;
  tier: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled';
  expiresAt?: string;
}

export interface HealthData {
  id: string;
  userId: string;
  appName: string;
  dataType: string;
  value: any;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface SentimentData {
  id: string;
  userId: string;
  appName: string;
  textContent: string;
  sentimentScore: number;
  sentimentCategory: 'positive' | 'negative' | 'neutral' | 'mixed';
  emotions: Record<string, number>;
  contextMetadata: Record<string, any>;
  timestamp: string;
}

export interface AnalyticsEvent {
  id: string;
  userId: string;
  appName: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  appName: string;
  messages: AIMessage[];
  context: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ProviderPatient {
  id: string;
  providerId: string;
  userId: string;
  apps: string[];
  healthMetrics: HealthData[];
  sentimentTrends: SentimentTrend[];
  lastActivity: string;
  riskFactors: RiskFactor[];
}

export interface SentimentTrend {
  date: string;
  avgSentiment: number;
  dataPoints: number;
  appBreakdown: Record<string, number>;
}

export interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendations: string[];
}

// App-specific types
export interface MenopauseSymptom {
  id: string;
  userId: string;
  symptomType: string;
  severity: number;
  frequency: string;
  triggers: string[];
  treatments: string[];
  notes: string;
  timestamp: string;
}

export interface FertilityCycle {
  id: string;
  userId: string;
  cycleStart: string;
  cycleLength: number;
  ovulationDate?: string;
  menstrualFlow: string;
  symptoms: string[];
  temperature: number[];
  cervicalMucus: string[];
  lh_tests: boolean[];
  notes: string;
}

export interface PregnancyWeek {
  id: string;
  userId: string;
  weekNumber: number;
  weight: number;
  bloodPressure: string;
  symptoms: string[];
  appointments: Appointment[];
  babyMovements: number;
  notes: string;
  timestamp: string;
}

export interface Appointment {
  id: string;
  date: string;
  type: string;
  provider: string;
  notes: string;
  results?: Record<string, any>;
}

export interface PostpartumData {
  id: string;
  userId: string;
  daysPostpartum: number;
  physicalRecovery: PhysicalRecovery;
  mentalHealth: MentalHealthAssessment;
  breastfeeding: BreastfeedingData;
  babyHealth: BabyHealthData;
  supportSystem: SupportSystemData;
  timestamp: string;
}

export interface PhysicalRecovery {
  painLevel: number;
  bleeding: string;
  incisionHealing?: string;
  energyLevel: number;
  sleepQuality: number;
}

export interface MentalHealthAssessment {
  moodRating: number;
  anxietyLevel: number;
  bondingConcerns: boolean;
  supportNeeded: string[];
  counselingInterest: boolean;
}

export interface BreastfeedingData {
  isBreastfeeding: boolean;
  frequency?: number;
  difficulties?: string[];
  supplementing?: boolean;
  pumpingSchedule?: string;
}

export interface BabyHealthData {
  weight: number;
  feedingPattern: string;
  sleepPattern: string;
  developmentalMilestones: string[];
  concerns: string[];
}

export interface SupportSystemData {
  partnerSupport: number;
  familySupport: number;
  friendSupport: number;
  professionalSupport: string[];
  communityGroups: string[];
}

export interface NLPTechnique {
  id: string;
  name: string;
  category: string;
  description: string;
  steps: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  applications: string[];
}

export interface NLPSession {
  id: string;
  userId: string;
  techniqueId: string;
  startTime: string;
  endTime?: string;
  effectiveness: number;
  notes: string;
  insights: string[];
  nextSteps: string[];
}

export interface PersonalityAssessment {
  id: string;
  userId: string;
  assessmentType: string;
  results: Record<string, any>;
  recommendations: string[];
  completedAt: string;
}

export interface SobrietyData {
  id: string;
  userId: string;
  sobrietyStartDate: string;
  currentStreak: number;
  substanceType: string[];
  triggers: Trigger[];
  copingStrategies: CopingStrategy[];
  supportNetwork: SupportContact[];
  dailyCheckins: DailyCheckin[];
  milestones: Milestone[];
}

export interface Trigger {
  id: string;
  name: string;
  category: string;
  severity: number;
  frequency: string;
  copingStrategies: string[];
}

export interface CopingStrategy {
  id: string;
  name: string;
  type: string;
  effectiveness: number;
  lastUsed: string;
  notes: string;
}

export interface SupportContact {
  id: string;
  name: string;
  relationship: string;
  contactInfo: string;
  availability: string;
  isEmergencyContact: boolean;
}

export interface DailyCheckin {
  id: string;
  userId: string;
  date: string;
  cravingLevel: number;
  moodRating: number;
  stressLevel: number;
  sleep: number;
  exercise: boolean;
  meditation: boolean;
  meetingAttended: boolean;
  notes: string;
  gratitude: string[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  daysRequired: number;
  achievedAt?: string;
  celebrated: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface EcosystemConfig {
  apiGatewayUrl: string;
  ssoServiceUrl: string;
  analyticsEngineUrl: string;
  aiOrchestrationUrl: string;
  providerDashboardUrl: string;
  sentimentServiceUrl: string;
  apiKeys: {
    sentiment?: string;
    analytics?: string;
  };
}