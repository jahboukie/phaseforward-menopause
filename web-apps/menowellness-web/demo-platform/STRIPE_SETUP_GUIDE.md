# Stripe Integration Setup Guide for MenoWellness

## 🚀 Quick Setup Checklist

### Step 1: Create Stripe Products (5 minutes)

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/products
2. **Create 3 products** with these exact details:

#### Product 1: Basic Support
- Product Name: `MenoWellness Basic Support`
- Price: `$9.99 USD`
- Billing: `Monthly recurring`
- **Copy the Price ID** (starts with `price_`) - you'll need this!

#### Product 2: Complete Care
- Product Name: `MenoWellness Complete Care`  
- Price: `$19.99 USD`
- Billing: `Monthly recurring`
- **Copy the Price ID** (starts with `price_`) - you'll need this!

#### Product 3: Ultimate Wellness
- Product Name: `MenoWellness Ultimate Wellness`
- Price: `$29.99 USD` 
- Billing: `Monthly recurring`
- **Copy the Price ID** (starts with `price_`) - you'll need this!

### Step 2: Configure Webhooks (3 minutes)

1. **Go to**: https://dashboard.stripe.com/webhooks
2. **Click**: "Add endpoint"
3. **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
4. **Select these events**:
   - `customer.subscription.created`
   - `customer.subscription.updated` 
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **Copy the Webhook Secret** (starts with `whsec_`)

### Step 3: Update Environment Variables

Add these to your `.env.local` file:

```env
# Your Stripe keys (get these from Stripe Dashboard)
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Add these new ones:
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_from_step2
STRIPE_PRICE_BASIC=price_your_basic_price_id
STRIPE_PRICE_COMPLETE=price_your_complete_price_id
STRIPE_PRICE_ULTIMATE=price_your_ultimate_price_id

# Frontend URL
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### Step 4: Database Setup (2 minutes)

1. **Go to your Supabase dashboard**: https://app.supabase.com
2. **Open SQL Editor**
3. **Copy and paste** the entire contents of `supabase-schema.sql`
4. **Click Run** to create all the tables

### Step 5: Install Dependencies

```bash
npm install stripe @stripe/stripe-js
```

### Step 6: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Visit**: `http://localhost:3000/subscription`

3. **Test with Stripe test cards**:
   - Success: `4242 4242 4242 4242`
   - Declined: `4000 0000 0000 0002`
   - Use any future date for expiry, any 3-digit CVC

## 📋 Implementation Checklist

- [ ] Created 3 Stripe products
- [ ] Copied all 3 Price IDs  
- [ ] Set up webhook endpoint
- [ ] Copied webhook secret
- [ ] Updated environment variables
- [ ] Ran database schema in Supabase
- [ ] Installed npm dependencies
- [ ] Tested subscription flow

## 🔧 Files to Update

After getting your Price IDs from Stripe, update these files:

### 1. Update `stripe-config.js`
Replace the placeholder price IDs:
```javascript
PRICE_IDS: {
  BASIC: 'price_your_actual_basic_id',
  COMPLETE: 'price_your_actual_complete_id', 
  ULTIMATE: 'price_your_actual_ultimate_id'
}
```

### 2. Update `components/SubscriptionManager.jsx`
Replace the test price IDs:
```javascript
const SUBSCRIPTION_PLANS = {
  basic: {
    priceId: 'price_your_actual_basic_id',
    // ...
  },
  complete: {
    priceId: 'price_your_actual_complete_id',
    // ...
  },
  ultimate: {
    priceId: 'price_your_actual_ultimate_id',
    // ...
  }
};
```

## 🎉 Success!

Once completed, users will be able to:
- ✅ Subscribe to MenoWellness plans
- ✅ Pay securely with Stripe
- ✅ Manage billing and subscriptions
- ✅ Have features gated by subscription tier
- ✅ Receive subscription confirmations

## 🔒 Security Notes

- Test keys are safe for development
- Switch to live keys only when ready for production
- Never commit secret keys to git
- Use environment variables for all sensitive data

## 📞 Need Help?

If you run into issues:
1. Check Stripe Dashboard > Logs for payment errors
2. Check Supabase Dashboard > API Logs for database errors  
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly