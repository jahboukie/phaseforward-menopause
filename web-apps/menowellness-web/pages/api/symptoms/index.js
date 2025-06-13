// API endpoint for managing menopause symptoms - HIPAA Compliant
import { createClient } from '@supabase/supabase-js';
import { MenoWellnessHIPAA } from '../../lib/database/HIPAADataRouter.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Get user from auth token
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (req.method === 'POST') {
      return await createOrUpdateSymptoms(req, res, user);
    } else if (req.method === 'GET') {
      return await getSymptoms(req, res, user);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Symptoms API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createOrUpdateSymptoms(req, res, user) {
  const {
    date,
    hot_flashes_count,
    hot_flashes_severity,
    night_sweats,
    irregular_periods,
    vaginal_dryness,
    weight_changes,
    joint_pain,
    headaches,
    breast_tenderness,
    mood_rating,
    anxiety_level,
    depression_symptoms,
    irritability,
    brain_fog,
    memory_issues,
    sleep_quality,
    sleep_hours,
    energy_level,
    fatigue_level,
    exercise_minutes,
    stress_level,
    medication_taken,
    supplements_taken,
    notes
  } = req.body;

  // Validate required fields
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }

  // Check if user has access to symptom tracking
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  if (!profile || profile.subscription_tier === 'free') {
    return res.status(403).json({ error: 'Subscription required for symptom tracking' });
  }

  try {
    // Prepare symptom data
    const symptomData = {
      user_id: user.id,
      date,
      hot_flashes_count: hot_flashes_count || 0,
      hot_flashes_severity,
      night_sweats: night_sweats || false,
      irregular_periods: irregular_periods || false,
      vaginal_dryness: vaginal_dryness || false,
      weight_changes: weight_changes || false,
      joint_pain: joint_pain || false,
      headaches: headaches || false,
      breast_tenderness: breast_tenderness || false,
      mood_rating,
      anxiety_level,
      depression_symptoms: depression_symptoms || false,
      irritability: irritability || false,
      brain_fog: brain_fog || false,
      memory_issues: memory_issues || false,
      sleep_quality,
      sleep_hours,
      energy_level,
      fatigue_level,
      exercise_minutes: exercise_minutes || 0,
      stress_level,
      medication_taken: medication_taken || [],
      supplements_taken: supplements_taken || [],
      notes: notes || '',
      updated_at: new Date().toISOString()
    };

    // Store PHI data using HIPAA-compliant router
    const result = await MenoWellnessHIPAA.storeSymptomData(symptomData);

    // Track usage for subscription limits (non-PHI data)
    await trackUsage(user.id, 'symptom_entries');

    res.status(200).json({ 
      success: true, 
      message: 'Symptoms saved securely',
      date: symptomData.date 
    });
  } catch (error) {
    console.error('Error saving symptoms:', error);
    return res.status(500).json({ error: 'Failed to save symptoms' });
  }
}

async function getSymptoms(req, res, user) {
  const { date, limit = 30 } = req.query;

  try {
    const filters = { limit: parseInt(limit) };
    if (date) {
      filters.date = date;
    }

    // Get PHI data using HIPAA-compliant router
    const data = await MenoWellnessHIPAA.getSymptomData(user.id, filters);
    
    if (date && (!data || data.length === 0)) {
      return res.status(200).json(null);
    }
    
    return res.status(200).json(date ? (data[0] || null) : data);
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    return res.status(500).json({ error: 'Failed to fetch symptoms' });
  }
}

// Helper function to track usage (non-PHI data)
async function trackUsage(userId, featureType) {
  const today = new Date().toISOString().split('T')[0];
  
  // Track usage analytics in Supabase (non-PHI)
  await MenoWellnessHIPAA.storeAnalytics({
    user_id: userId,
    feature_type: featureType,
    usage_date: today,
    usage_count: 1
  });
}