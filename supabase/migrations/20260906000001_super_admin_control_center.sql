-- ==============================================================================
-- BuildCost Connect - Database Migration 005
-- Super Admin / God-Mode Platform Control Center Schema
-- Tables: feature_flags, platform_content, platform_sections, platform_navigation,
--         platform_media, system_audit_logs, platform_emergency_status
-- ==============================================================================

-- 1. Ensure profiles.role includes the full RBAC hierarchy
DO $$
BEGIN
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('super_admin', 'superadmin', 'admin', 'editor', 'support', 'user'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. DYNAMIC FEATURE FLAGS TABLE
CREATE TABLE IF NOT EXISTS feature_flags (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    enabled BOOLEAN DEFAULT TRUE,
    plan_required TEXT NOT NULL DEFAULT 'free' CHECK (plan_required IN ('free', 'pro', 'business', 'disabled')),
    platform TEXT NOT NULL DEFAULT 'all' CHECK (platform IN ('all', 'web', 'android', 'extension')),
    rollout_percentage INT DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    updated_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Feature Flags
INSERT INTO feature_flags (id, key, name, description, category, enabled, plan_required, platform, rollout_percentage)
VALUES
('ff_1', 'grey_structure_calculator', 'Grey Structure Calculator', 'Core shell and structural estimator (bricks, cement, steel)', 'calculators', true, 'free', 'all', 100),
('ff_2', 'advanced_grey_structure', 'Advanced Structural RCC Engine', 'Deep foundation, retaining walls, clear ceiling heights', 'calculators', true, 'pro', 'all', 100),
('ff_3', 'finishing_calculator', 'Finishing & Fixtures Estimator', 'Tiles, marble, paints, sanitary, woodwork and electrical', 'calculators', true, 'free', 'all', 100),
('ff_4', 'advanced_finishing', '17-Stage High-End Finishing Specs', 'Custom imported woodwork, Italian tiles, double-glazed UPVC', 'calculators', true, 'pro', 'all', 100),
('ff_5', 'material_rates', 'Material Benchmark Rates Board', 'PBS & APCMA verified rates for 14 Pakistani cities', 'market', true, 'free', 'all', 100),
('ff_6', 'price_alerts', 'Material Price Alerts & Trend Charts', 'Real-time SMS & WhatsApp alerts for cement and steel spikes', 'market', true, 'pro', 'all', 100),
('ff_7', 'vendor_management', 'Vendor Directory & Khata Ledger', 'Supplier khata, outstanding balance, credit terms, receipts', 'site', true, 'pro', 'all', 100),
('ff_8', 'purchase_orders', 'Purchases & Order Slips', 'Weighbridge slips, delivery challans, procurement receipts', 'site', true, 'pro', 'all', 100),
('ff_9', 'transport_calculator', 'Transport & Logistics Freight', 'Tractor trolley, dumper truck, Mazda haulage capacity & fuel', 'logistics', true, 'pro', 'all', 100),
('ff_10', 'advanced_boq', 'BOQ Studio & Export', '35-item Contractor Schedule of Rates with Excel/PDF export', 'reports', true, 'pro', 'all', 100),
('ff_11', 'house_layout_library', 'House Layouts 2D CAD Plans', 'Reference floor plans for 3, 5, 7, 10 Marla and 1 Kanal', 'design', true, 'free', 'all', 100),
('ff_12', 'premium_layouts', 'Premium 3D Floor Layouts', 'High-fidelity architectural elevations and interior walkthroughs', 'design', true, 'pro', 'all', 100),
('ff_13', 'ai_construction_advisor', 'AI Site Advisor & What-If Simulator', 'Scenario price simulation and civil engineering chatbot', 'ai', true, 'pro', 'all', 100),
('ff_14', 'cash_flow_planner', 'Cash Flow & Bi-Weekly Disbursements', 'Predictive contractor milestone payments schedule', 'financials', true, 'pro', 'all', 100),
('ff_15', 'site_diary', 'Daily Site Diary & Logbook', 'Labour headcount, concrete pours, weather delays, and milestones', 'site', true, 'free', 'all', 100),
('ff_16', 'emergency_maintenance', 'Platform Maintenance Mode', 'Global emergency flag to pause public traffic during updates', 'system', false, 'free', 'all', 100)
ON CONFLICT (key) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category;

-- 3. PLATFORM CONTENT CMS TABLE
CREATE TABLE IF NOT EXISTS platform_content (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    section TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    meta JSONB DEFAULT '{}'::jsonb,
    is_published BOOLEAN DEFAULT TRUE,
    version INT DEFAULT 1,
    previous_versions JSONB DEFAULT '[]'::jsonb,
    updated_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Content Items
INSERT INTO platform_content (id, key, section, title, content, meta)
VALUES
('pc_1', 'homepage_hero_title', 'homepage', 'Hero Headline', 'Pakistan''s #1 Construction & Property Cost Intelligence Platform', '{"type": "text"}'::jsonb),
('pc_2', 'homepage_hero_subtitle', 'homepage', 'Hero Subtitle', 'Calculate precise structural grey structure, finishing materials, labour rates, and supplier expenses across 14 Pakistani cities with empirical civil accuracy.', '{"type": "textarea"}'::jsonb),
('pc_3', 'pro_promo_card_title', 'dashboard', 'Pro Promotional Card Title', 'Unlock More With PRO', '{"type": "text"}'::jsonb),
('pc_4', 'pro_promo_card_desc', 'dashboard', 'Pro Promotional Card Description', 'Get advanced construction estimation, vendor khata management, multi-city market comparison, and unlimited projects.', '{"type": "textarea"}'::jsonb),
('pc_5', 'pro_upgrade_button_text', 'marketing', 'Upgrade CTA Button Text', 'Upgrade to PRO — Save 20%', '{"type": "text"}'::jsonb),
('pc_6', 'disclaimer_estimation', 'legal', 'Civil Estimation Disclaimer', 'Notice: BuildCost Connect calculations are civil engineering reference estimates calibrated against prevailing Pakistani market rates. Actual site execution costs may vary depending on local soil conditions, steel brands, and contractor terms.', '{"type": "textarea"}'::jsonb),
('pc_7', 'disclaimer_layouts', 'legal', 'House Layouts Disclaimer', 'Planning Reference Only: All house layouts provided in this library are conceptual reference plans and do not substitute approved municipal or structural engineering drawings.', '{"type": "textarea"}'::jsonb),
('pc_8', 'support_whatsapp_number', 'contact', 'Admin WhatsApp Support Contact', '0300-5155604', '{"type": "contact"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content;

-- 4. PLATFORM SECTIONS TABLE
CREATE TABLE IF NOT EXISTS platform_sections (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    plan_required TEXT NOT NULL DEFAULT 'free' CHECK (plan_required IN ('free', 'pro', 'disabled')),
    display_order INT DEFAULT 0,
    nav_visibility BOOLEAN DEFAULT TRUE,
    updated_by TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO platform_sections (id, key, title, description, icon, is_enabled, plan_required, display_order, nav_visibility)
VALUES
('sec_1', 'dashboard', 'Dashboard', 'Central executive metrics and project health', 'LayoutGrid', true, 'free', 1, true),
('sec_2', 'projects', 'Projects Directory', 'Multi-project management and portfolio oversight', 'FolderArchive', true, 'pro', 2, true),
('sec_3', 'calculator', 'Calculation Hub', 'Progressive grey structure & finishing estimators', 'Calculator', true, 'free', 3, true),
('sec_4', 'materials', 'Material Catalog', 'Delivered unit prices and Pakistani brand specifications', 'Boxes', true, 'free', 4, true),
('sec_5', 'labour', 'Labour & Crews', 'Trade wage rates and productivity gang sizes', 'Hammer', true, 'free', 5, true),
('sec_6', 'layouts', 'House Layout Library', '2D architectural reference plans', 'Compass', true, 'free', 6, true),
('sec_7', 'budget', 'Cash Flow & Budget', 'Variance analysis and bi-weekly payment forecasts', 'Wallet', true, 'pro', 7, true),
('sec_8', 'progress', 'Construction Progress', '10-stage physical vs cost milestones', 'Activity', true, 'free', 8, true),
('sec_9', 'vendors', 'Vendors & Khata', 'Supplier ledgers and credit balance accounts', 'Building2', true, 'pro', 9, true),
('sec_10', 'purchases', 'Purchases & Orders', 'Site invoices, weighbridge slips, and delivery tracking', 'ShoppingCart', true, 'pro', 10, true),
('sec_11', 'transport', 'Transport & Haulage', 'Truck freight and Palledari loading calculator', 'ShoppingCart', true, 'pro', 11, true),
('sec_12', 'rates', 'Market Rates Intelligence', 'PBS & APCMA weekly rate trends across Pakistan', 'TrendingUp', true, 'free', 12, true),
('sec_13', 'boq', 'BOQ Studio', 'Contractor Bill of Quantities schedule of rates', 'FileSpreadsheet', true, 'pro', 13, true),
('sec_14', 'reports', 'PDF Reports', 'Client-ready branded cost estimation summaries', 'BarChart3', true, 'free', 14, true),
('sec_15', 'advisor', 'AI Construction Advisor', 'Site troubleshooting and cost engineering assistant', 'Bot', true, 'pro', 15, true),
('sec_16', 'pricing', 'Plans & Pricing', 'Free vs Pro tiers and subscription checkout', 'CreditCard', true, 'free', 16, true)
ON CONFLICT (key) DO UPDATE SET
    title = EXCLUDED.title,
    display_order = EXCLUDED.display_order;

-- 5. PLATFORM NAVIGATION ITEMS TABLE
CREATE TABLE IF NOT EXISTS platform_navigation (
    id TEXT PRIMARY KEY,
    location TEXT NOT NULL CHECK (location IN ('sidebar', 'topbar', 'mobile', 'footer')),
    label TEXT NOT NULL,
    href TEXT NOT NULL,
    icon TEXT,
    badge TEXT,
    plan_required TEXT NOT NULL DEFAULT 'none' CHECK (plan_required IN ('free', 'pro', 'admin', 'none')),
    is_enabled BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    updated_by TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PLATFORM MEDIA ASSETS TABLE
CREATE TABLE IF NOT EXISTS platform_media (
    id TEXT PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    storage_bucket TEXT NOT NULL DEFAULT 'platform-media',
    public_url TEXT NOT NULL,
    alt_text TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    size_bytes INT DEFAULT 0,
    mime_type TEXT DEFAULT 'image/jpeg',
    uploaded_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SYSTEM AUDIT LOGS (Immutable History)
CREATE TABLE IF NOT EXISTS system_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sys_audit_admin ON system_audit_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_sys_audit_created ON system_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sys_audit_entity ON system_audit_logs(entity_type, entity_id);

-- 8. EMERGENCY PLATFORM STATUS TABLE
CREATE TABLE IF NOT EXISTS platform_emergency_status (
    id TEXT PRIMARY KEY DEFAULT 'global_status',
    is_emergency_mode BOOLEAN DEFAULT FALSE,
    maintenance_message TEXT DEFAULT 'The system is undergoing scheduled maintenance. Please check back shortly.',
    registrations_enabled BOOLEAN DEFAULT TRUE,
    payments_enabled BOOLEAN DEFAULT TRUE,
    pdf_enabled BOOLEAN DEFAULT TRUE,
    ai_enabled BOOLEAN DEFAULT TRUE,
    rates_update_enabled BOOLEAN DEFAULT TRUE,
    updated_by TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO platform_emergency_status (id, is_emergency_mode, maintenance_message)
VALUES ('global_status', false, 'BuildCost Connect is operating normally with all civil calculation nodes active.')
ON CONFLICT (id) DO NOTHING;

-- 9. ENABLE ROW LEVEL SECURITY
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_emergency_status ENABLE ROW LEVEL SECURITY;

-- 10. RLS POLICIES: Everyone can read active configuration
CREATE POLICY Public read active feature flags ON feature_flags FOR SELECT USING (true);
CREATE POLICY Public read published content ON platform_content FOR SELECT USING (is_published = true);
CREATE POLICY Public read enabled sections ON platform_sections FOR SELECT USING (is_enabled = true);
CREATE POLICY Public read enabled navigation ON platform_navigation FOR SELECT USING (is_enabled = true);
CREATE POLICY Public read emergency status ON platform_emergency_status FOR SELECT USING (true);
CREATE POLICY Public read media assets ON platform_media FOR SELECT USING (true);

-- 11. RLS POLICIES: Admins have full read/write
CREATE POLICY Admins manage feature flags ON feature_flags FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'superadmin')));

CREATE POLICY Admins manage platform content ON platform_content FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'superadmin', 'editor')));

CREATE POLICY Admins manage platform sections ON platform_sections FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'superadmin')));

CREATE POLICY Admins manage platform navigation ON platform_navigation FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'superadmin')));

CREATE POLICY Admins manage platform media ON platform_media FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'superadmin', 'editor')));

CREATE POLICY Admins view system audit logs ON system_audit_logs FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'superadmin')));

CREATE POLICY Admins insert system audit logs ON system_audit_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY Admins manage emergency status ON platform_emergency_status FOR ALL
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'superadmin')));
