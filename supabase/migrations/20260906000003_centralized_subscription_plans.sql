-- ==============================================================================
-- BuildCost Connect - Database Migration 005
-- Centralized Subscription Plans Schema Augmentation
-- Adds slug, description, currency, billing_period, and price for universal consistency
-- ==============================================================================

-- 1. Augment subscription_plans with standard slug and currency columns
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'PKR',
ADD COLUMN IF NOT EXISTS billing_period TEXT DEFAULT 'monthly';

-- 2. Backfill existing records
UPDATE subscription_plans SET 
  slug = tier,
  price = price_monthly_pkr,
  currency = 'PKR',
  billing_period = 'monthly',
  description = CASE 
    WHEN tier = 'free' THEN 'Essential cost calculators and standard estimates for Pakistani homeowners'
    WHEN tier = 'pro' THEN 'Full engineering suite, unlimited projects, contractor BOQs, and live market rates'
    ELSE 'Enterprise contractor and team operations suite'
  END
WHERE slug IS NULL;

-- 3. Ensure 'plan_free' and 'plan_pro' exist with default values
INSERT INTO subscription_plans (
    id, name, slug, tier, description, price, price_monthly_pkr, price_annual_pkr, 
    currency, billing_period, max_projects, max_saved_estimates, max_vendors, max_storage_mb, 
    features, is_active, updated_at
)
VALUES 
(
    'plan_free',
    'BuildCost Free',
    'free',
    'free',
    'Essential cost calculators and standard estimates for Pakistani homeowners',
    0,
    0,
    0,
    'PKR',
    'monthly',
    3,
    5,
    5,
    25,
    '{
        "advanced_calculators": false,
        "custom_material_rates": false,
        "vendor_management": false,
        "purchase_orders": false,
        "bill_upload": false,
        "inventory_tracking": false,
        "site_diary": false,
        "budget_variance": false,
        "price_scenario_simulator": false,
        "secure_share_links": false,
        "unlimited_projects": false,
        "priority_support": false
    }'::JSONB,
    TRUE,
    NOW()
),
(
    'plan_pro',
    'BuildCost Pro',
    'pro',
    'pro',
    'Full engineering suite, unlimited projects, contractor BOQs, and live market rates',
    200,
    200,
    500,
    'PKR',
    'monthly',
    100,
    500,
    200,
    2000,
    '{
        "advanced_calculators": true,
        "custom_material_rates": true,
        "vendor_management": true,
        "purchase_orders": true,
        "bill_upload": true,
        "inventory_tracking": true,
        "site_diary": true,
        "budget_variance": true,
        "price_scenario_simulator": true,
        "secure_share_links": true,
        "unlimited_projects": true,
        "priority_support": true
    }'::JSONB,
    TRUE,
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    price_monthly_pkr = EXCLUDED.price_monthly_pkr,
    currency = EXCLUDED.currency,
    billing_period = EXCLUDED.billing_period,
    description = EXCLUDED.description,
    slug = EXCLUDED.slug,
    updated_at = NOW();

-- 4. Enable RLS and Grant Permissions
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active subscription plans
DROP POLICY IF EXISTS "Public can view active subscription plans" ON subscription_plans;
CREATE POLICY "Public can view active subscription plans" 
ON subscription_plans FOR SELECT 
USING (is_active = TRUE);

-- Restrict write/update permissions to admin roles
DROP POLICY IF EXISTS "Admins can update subscription plans" ON subscription_plans;
CREATE POLICY "Admins can update subscription plans" 
ON subscription_plans FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('super_admin', 'admin')
    )
);
