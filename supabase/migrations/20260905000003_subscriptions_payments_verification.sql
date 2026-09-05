-- ==============================================================================
-- BuildCost Connect - Database Migration 004
-- Subscriptions, Feature Gating, Pakistan Payment Verifications & Admin Audit
-- ==============================================================================

-- 1. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'business')),
    price_monthly_pkr NUMERIC NOT NULL DEFAULT 0,
    price_annual_pkr NUMERIC NOT NULL DEFAULT 0,
    max_projects INT NOT NULL DEFAULT 3,
    max_saved_estimates INT NOT NULL DEFAULT 5,
    max_vendors INT NOT NULL DEFAULT 5,
    max_storage_mb INT NOT NULL DEFAULT 25,
    features JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Plans (Free and Pro)
INSERT INTO subscription_plans (id, name, tier, price_monthly_pkr, price_annual_pkr, max_projects, max_saved_estimates, max_vendors, max_storage_mb, features)
VALUES 
(
    'plan_free',
    'BuildCost Free',
    'free',
    0,
    0,
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
    }'::JSONB
),
(
    'plan_pro',
    'BuildCost Pro',
    'pro',
    1999,
    19990,
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
    }'::JSONB
)
ON CONFLICT (id) DO NOTHING;

-- 2. PAKISTAN PAYMENT GATEWAYS CONFIGURATION (Easypaisa, JazzCash, Bank Transfer)
CREATE TABLE IF NOT EXISTS payment_methods_config (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL CHECK (provider IN ('easypaisa', 'jazzcash', 'bank_transfer')),
    title TEXT NOT NULL,
    account_title TEXT NOT NULL,
    account_number TEXT NOT NULL,
    bank_name TEXT,
    iban TEXT,
    instructions TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO payment_methods_config (id, provider, title, account_title, account_number, bank_name, iban, instructions)
VALUES
(
    'pm_easypaisa',
    'easypaisa',
    'Easypaisa Mobile Account',
    'BuildCost Connect Pvt Ltd',
    '0300-1234567',
    NULL,
    NULL,
    'Send Rs. 1,999 to Easypaisa account 0300-1234567 (BuildCost Connect). Copy the 11-digit TRX ID and upload payment screenshot below.'
),
(
    'pm_jazzcash',
    'jazzcash',
    'JazzCash Till / Mobile Account',
    'BuildCost Connect Pvt Ltd',
    '0301-9876543',
    NULL,
    NULL,
    'Send Rs. 1,999 to JazzCash account 0301-9876543 (BuildCost Connect). Enter TID reference and upload screenshot receipt.'
),
(
    'pm_bank_transfer',
    'bank_transfer',
    'Meezan Bank Raast / IBAN Transfer',
    'BuildCost Technologies (Pvt) Ltd',
    '02010108928371',
    'Meezan Bank Limited (I-8 Markaz Islamabad)',
    'PK72MEZN0002010108928371',
    'Transfer via online banking or Raast instant pay to Meezan Bank. Provide transaction reference number and screenshot.'
)
ON CONFLICT (id) DO NOTHING;

-- 3. CUSTOMER USER SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'pending_approval')) DEFAULT 'active',
    billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'annual')) DEFAULT 'monthly',
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PAYMENT VERIFICATIONS (Manual approval workflow for Pakistan banking)
CREATE TABLE IF NOT EXISTS payment_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
    provider TEXT NOT NULL CHECK (provider IN ('easypaisa', 'jazzcash', 'bank_transfer')),
    amount_pkr NUMERIC NOT NULL,
    transaction_reference TEXT NOT NULL,
    sender_name TEXT,
    sender_mobile TEXT,
    receipt_screenshot_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    admin_notes TEXT,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ADMIN AUDIT LOGS (God Mode accountability)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL REFERENCES profiles(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Plans & payment configs are readable by everyone
CREATE POLICY "Public can view active subscription plans"
    ON subscription_plans FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Public can view active payment methods"
    ON payment_methods_config FOR SELECT
    USING (is_active = TRUE);

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscription"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can view and submit own payment verifications
CREATE POLICY "Users can view own payment verifications"
    ON payment_verifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payment verifications"
    ON payment_verifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins full access
CREATE POLICY "Admins full access to subscriptions"
    ON subscriptions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins full access to payment verifications"
    ON payment_verifications FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins full access to audit logs"
    ON admin_audit_logs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );
