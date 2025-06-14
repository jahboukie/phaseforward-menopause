// User Subscription API Endpoint
// Fetches current user's subscription details

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from auth token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        user_profiles!user_subscriptions_user_id_fkey(subscription_tier, subscription_status)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      console.error('Subscription fetch error:', subError);
      return res.status(500).json({ error: 'Failed to fetch subscription' });
    }

    // If no subscription found, return null
    if (!subscription) {
      return res.status(200).json(null);
    }

    res.status(200).json(subscription);

  } catch (error) {
    console.error('User subscription API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user subscription',
      details: error.message 
    });
  }
};