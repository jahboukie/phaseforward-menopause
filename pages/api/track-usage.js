// API endpoint for tracking usage - HIPAA Compliant
import { createClient } from '@supabase/supabase-js';
import { MenoWellnessHIPAA } from '../lib/database/HIPAADataRouter.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    const { featureType } = req.body;

    if (!featureType) {
      return res.status(400).json({ error: 'Feature type is required' });
    }

    // Track usage (non-PHI data)
    const today = new Date().toISOString().split('T')[0];
    
    const result = await MenoWellnessHIPAA.storeAnalytics({
      user_id: user.id,
      feature_type: featureType,
      usage_date: today,
      usage_count: 1,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({ success: true, tracked: true });
  } catch (error) {
    console.error('Error tracking usage:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}