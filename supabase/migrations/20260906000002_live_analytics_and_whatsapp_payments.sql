-- ==============================================================================
-- BuildCost Connect - Database Migration 006
-- Multi-Platform Live Analytics, Heartbeat Telemetry & WhatsApp Payment Queue
-- ==============================================================================

-- 1. EXTEND PAYMENT VERIFICATIONS STATUS AND FIELDS
DO $$
BEGIN
    -- Update status constraint to support all 6 required statuses
    ALTER TABLE payment_verifications DROP CONSTRAINT IF EXISTS payment_verifications_status_check;
    ALTER TABLE payment_verifications ADD CONSTRAINT payment_verifications_status_check
    CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'expired', 'refunded'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE payment_verifications
ADD COLUMN IF NOT EXISTS payment_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS user_note TEXT,
ADD COLUMN IF NOT EXISTS slip_storage_path TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_notified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS client_platform TEXT DEFAULT 'web' CHECK (client_platform IN ('web', 'android', 'extension'));

-- 2. ACTIVE USER SESSIONS (Heartbeat Tracking for "Active Now")
CREATE TABLE IF NOT EXISTS active_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    guest_id TEXT,
    platform TEXT NOT NULL DEFAULT 'web' CHECK (platform IN ('web', 'android', 'extension')),
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
    city TEXT DEFAULT 'Islamabad',
    ip_address TEXT,
    user_agent TEXT,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_active_sessions_last_active ON active_sessions(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_active_sessions_platform ON active_sessions(platform);
CREATE INDEX IF NOT EXISTS idx_active_sessions_user ON active_sessions(user_id);

-- 3. ANALYTICS TELEMETRY EVENTS (Privacy-Conscious Platform Event Log)
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'web' CHECK (platform IN ('web', 'android', 'extension')),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    guest_id TEXT,
    city TEXT DEFAULT 'Islamabad',
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_platform ON analytics_events(platform);

-- 4. PROMOTIONS & TEMPORARY CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS platform_promotions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    eligible_users TEXT NOT NULL DEFAULT 'all_free' CHECK (eligible_users IN ('all_free', 'new_users', 'contractors', 'all')),
    target_plan TEXT NOT NULL DEFAULT 'pro',
    discount_pct INT DEFAULT 0 CHECK (discount_pct >= 0 AND discount_pct <= 100),
    trial_days INT DEFAULT 0 CHECK (trial_days >= 0),
    features_unlocked JSONB DEFAULT '["advanced_grey_structure", "advanced_boq", "vendor_management"]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Promotions
INSERT INTO platform_promotions (id, name, code, description, start_date, end_date, eligible_users, target_plan, discount_pct, trial_days, is_active)
VALUES
('promo_ramadan', 'Ramadan Kareem Pro Special', 'RAMADAN2026', '25% discount on annual Pro subscription with priority support', NOW(), NOW() + INTERVAL '30 days', 'all_free', 'pro', 25, 0, true),
('promo_trial7', '7-Day Pro Contractor Trial', 'TRIAL7DAY', 'Complimentary 7-day access to BOQ Studio and Rate Intelligence', NOW(), NOW() + INTERVAL '14 days', 'all_free', 'pro', 0, 7, true)
ON CONFLICT (id) DO NOTHING;

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_promotions ENABLE ROW LEVEL SECURITY;

-- Public can ping active_sessions and log analytics_events
CREATE POLICY "Public insert active sessions" ON active_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update own active sessions" ON active_sessions FOR UPDATE USING (true);
CREATE POLICY "Public insert analytics events" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read active promotions" ON platform_promotions FOR SELECT USING (is_active = true AND end_date > NOW());

-- Admins full access to analytics and promotions
CREATE POLICY "Admins read active sessions" ON active_sessions FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'superadmin')));

CREATE POLICY "Admins read analytics events" ON analytics_events FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'superadmin')));

CREATE POLICY "Admins manage platform promotions" ON platform_promotions FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'superadmin')));
