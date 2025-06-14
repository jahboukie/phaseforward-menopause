// API endpoint for tracking and fetching user usage
import { createClient } from '@supabase/supabase-js';

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

    if (req.method === 'GET') {
      return await getUserUsage(req, res, user);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Usage API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUserUsage(req, res, user) {
  try {
    // Get current month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('usage_tracking')
      .select('feature_type, usage_count')
      .eq('user_id', user.id)
      .gte('usage_date', startOfMonth.toISOString().split('T')[0])
      .lte('usage_date', endOfMonth.toISOString().split('T')[0]);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch usage data' });
    }

    // Aggregate usage by feature type
    const usage = {};
    data.forEach(record => {
      if (!usage[record.feature_type]) {
        usage[record.feature_type] = 0;
      }
      usage[record.feature_type] += record.usage_count;
    });

    // Map to expected format
    const formattedUsage = {
      symptomEntries: usage.symptom_entries || 0,
      aiQueries: usage.ai_queries || 0,
      dataExports: usage.data_exports || 0,
      providerShares: usage.provider_shares || 0
    };

    res.status(200).json(formattedUsage);
  } catch (error) {
    console.error('Error fetching usage:', error);
    return res.status(500).json({ error: 'Failed to fetch usage data' });
  }
}