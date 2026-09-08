-- ==============================================================================
-- BUILDCOST CONNECT — COMPLETE PRODUCTION DATABASE SCHEMA & INITIAL DATA
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wxcgpunqnxbezysulkdp/sql/new
-- ==============================================================================


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- FILE: supabase/migrations/20260904000001_initial_schema.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- ==============================================================================
-- BuildCost Connect - Database Migration 001
-- PostgreSQL Schema & Row Level Security (RLS) Policies
-- Pakistan Construction Cost Intelligence Platform
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    company_name TEXT,
    city_id TEXT DEFAULT 'isb',
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER SETTINGS
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
    preferred_currency TEXT DEFAULT 'PKR',
    preferred_area_unit TEXT DEFAULT 'marla',
    preferred_marla_standard_id TEXT DEFAULT 'marla_225',
    default_city_id TEXT DEFAULT 'isb',
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ur')),
    notify_on_rate_change BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CITIES
CREATE TABLE IF NOT EXISTS cities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    urdu_name TEXT,
    province TEXT NOT NULL,
    default_marla_sqft NUMERIC NOT NULL DEFAULT 225,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MARLA STANDARDS
CREATE TABLE IF NOT EXISTS marla_standards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sqft NUMERIC NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MATERIAL CATEGORIES
CREATE TABLE IF NOT EXISTS material_categories (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MATERIALS
CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES material_categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    specification TEXT,
    brand TEXT,
    unit TEXT NOT NULL,
    default_wastage_percent NUMERIC DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. RATE SOURCES
CREATE TABLE IF NOT EXISTS rate_sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('official', 'supplier', 'market_survey', 'public_source', 'admin_verified', 'demo_sample')),
    website_url TEXT,
    reliability_score INT DEFAULT 4 CHECK (reliability_score BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MATERIAL RATES
CREATE TABLE IF NOT EXISTS material_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id TEXT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    brand TEXT,
    grade TEXT,
    unit TEXT NOT NULL,
    base_rate NUMERIC NOT NULL CHECK (base_rate >= 0),
    transport_rate NUMERIC DEFAULT 0,
    loading_rate NUMERIC DEFAULT 0,
    unloading_rate NUMERIC DEFAULT 0,
    delivered_rate NUMERIC NOT NULL CHECK (delivered_rate >= 0),
    currency TEXT DEFAULT 'PKR',
    source_id TEXT REFERENCES rate_sources(id),
    source_name TEXT NOT NULL,
    source_type TEXT NOT NULL,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    confidence_score TEXT NOT NULL CHECK (confidence_score IN ('HIGH', 'MEDIUM', 'LOW', 'ESTIMATED')),
    status TEXT NOT NULL DEFAULT 'verified' CHECK (status IN ('collected', 'imported', 'reviewed', 'verified', 'published', 'expired')),
    trend_percentage NUMERIC DEFAULT 0,
    is_demo_sample BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_material_city UNIQUE (material_id, city_id)
);

-- 9. RATE HISTORY
CREATE TABLE IF NOT EXISTS rate_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id TEXT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    rate NUMERIC NOT NULL,
    change_percentage NUMERIC DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. LABOUR RATES
CREATE TABLE IF NOT EXISTS labour_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL,
    role_urdu TEXT,
    city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    skill_level TEXT NOT NULL CHECK (skill_level IN ('skilled', 'semi_skilled', 'helper', 'supervisor')),
    pricing_type TEXT NOT NULL CHECK (pricing_type IN ('per_day', 'per_sqft', 'per_job', 'per_cft')),
    rate NUMERIC NOT NULL CHECK (rate >= 0),
    currency TEXT DEFAULT 'PKR',
    source_name TEXT NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city_id TEXT REFERENCES cities(id),
    contact_person TEXT,
    phone TEXT,
    address TEXT,
    rating NUMERIC DEFAULT 4.5,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. SOCIETY RULES
CREATE TABLE IF NOT EXISTS society_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    authority_name TEXT NOT NULL, -- e.g. "CDA", "RDA", "LDA", "DHA"
    society_name TEXT NOT NULL,
    city_id TEXT REFERENCES cities(id),
    plot_size_category TEXT NOT NULL, -- e.g. "5 Marla", "10 Marla", "1 Kanal"
    max_ground_coverage_percent NUMERIC NOT NULL,
    max_far NUMERIC NOT NULL,
    front_setback_ft NUMERIC,
    rear_setback_ft NUMERIC,
    side_setback_ft NUMERIC,
    max_height_ft NUMERIC,
    max_floors INT,
    notes TEXT,
    effective_date DATE,
    verification_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    client_name TEXT,
    project_type TEXT NOT NULL CHECK (project_type IN ('residential', 'commercial', 'industrial', 'renovation', 'addition', 'other')),
    city_id TEXT NOT NULL REFERENCES cities(id),
    location TEXT NOT NULL,
    plot_area NUMERIC NOT NULL CHECK (plot_area > 0),
    plot_unit TEXT NOT NULL,
    marla_standard_id TEXT NOT NULL REFERENCES marla_standards(id),
    covered_area NUMERIC NOT NULL CHECK (covered_area > 0),
    covered_area_unit TEXT NOT NULL,
    number_of_floors INT NOT NULL DEFAULT 1 CHECK (number_of_floors >= 1),
    has_basement BOOLEAN DEFAULT FALSE,
    has_ground_floor BOOLEAN DEFAULT TRUE,
    has_roof BOOLEAN DEFAULT TRUE,
    construction_quality TEXT NOT NULL DEFAULT 'standard' CHECK (construction_quality IN ('economy', 'standard', 'premium', 'luxury', 'custom')),
    total_budget NUMERIC DEFAULT 0,
    start_date DATE,
    expected_completion DATE,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'estimating', 'quotation', 'approved', 'under_construction', 'completed', 'on_hold')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. PROJECT RATE OVERRIDES (Custom project-specific supplier rates)
CREATE TABLE IF NOT EXISTS project_rate_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    material_id TEXT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    custom_rate NUMERIC NOT NULL CHECK (custom_rate > 0),
    supplier_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_project_material_override UNIQUE (project_id, material_id)
);

-- 15. CALCULATIONS (Snapshots preserving exact historical calculation rates)
CREATE TABLE IF NOT EXISTS calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    calculator_type TEXT NOT NULL,
    inputs JSONB NOT NULL,
    result JSONB NOT NULL,
    rates_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. BOQS & BOQ ITEMS
CREATE TABLE IF NOT EXISTS boqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    version INT DEFAULT 1,
    subtotal NUMERIC DEFAULT 0,
    discount_percent NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    contingency_percent NUMERIC DEFAULT 5,
    contingency_amount NUMERIC DEFAULT 0,
    tax_percent NUMERIC DEFAULT 0,
    tax_amount NUMERIC DEFAULT 0,
    grand_total NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS boq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boq_id UUID NOT NULL REFERENCES boqs(id) ON DELETE CASCADE,
    item_number TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    specification TEXT,
    unit TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    rate NUMERIC NOT NULL,
    amount NUMERIC NOT NULL,
    wastage_percent NUMERIC DEFAULT 0,
    labour_rate NUMERIC DEFAULT 0,
    labour_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    notes TEXT,
    sort_order INT DEFAULT 0
);

-- 17. QUOTATIONS
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    quotation_number TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    client_address TEXT,
    date DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    subtotal NUMERIC NOT NULL,
    markup_percent NUMERIC DEFAULT 10,
    markup_amount NUMERIC DEFAULT 0,
    tax_percent NUMERIC DEFAULT 0,
    tax_amount NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    grand_total NUMERIC NOT NULL,
    payment_terms JSONB,
    terms_and_conditions TEXT[],
    notes TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. EXPENSES (Site spending tracking vs budget)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    supplier_name TEXT,
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank_transfer', 'cheque', 'other')),
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. AUDIT LOGS (Administrative tracking of all rate updates)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES profiles(id),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_city_id ON projects(city_id);
CREATE INDEX IF NOT EXISTS idx_material_rates_city_id ON material_rates(city_id);
CREATE INDEX IF NOT EXISTS idx_material_rates_material_id ON material_rates(material_id);
CREATE INDEX IF NOT EXISTS idx_rate_history_material_city ON rate_history(material_id, city_id);
CREATE INDEX IF NOT EXISTS idx_labour_rates_city_id ON labour_rates(city_id);
CREATE INDEX IF NOT EXISTS idx_calculations_project_id ON calculations(project_id);
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_boqs_project_id ON boqs(project_id);
CREATE INDEX IF NOT EXISTS idx_boq_items_boq_id ON boq_items(boq_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_quotations_project_id ON quotations(project_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE marla_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE labour_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE society_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_rate_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE boqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE boq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users see/update only their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Settings: Users see/update only their own settings
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- Projects: Users manage only their own projects
CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);

-- Calculations, BOQs, Expenses, Quotations: Isolated by user/project
CREATE POLICY "Users can manage own calculations" ON calculations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own project overrides" ON project_rate_overrides FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_rate_overrides.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can manage own boqs" ON boqs FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = boqs.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can manage own boq items" ON boq_items FOR ALL USING (
    EXISTS (SELECT 1 FROM boqs JOIN projects ON projects.id = boqs.project_id WHERE boqs.id = boq_items.boq_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can manage own quotations" ON quotations FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = quotations.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can manage own expenses" ON expenses FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = expenses.project_id AND projects.user_id = auth.uid())
);

-- Public Market Catalogs: Anyone can read, only Admin can write
CREATE POLICY "Public read cities" ON cities FOR SELECT USING (true);
CREATE POLICY "Public read marla_standards" ON marla_standards FOR SELECT USING (true);
CREATE POLICY "Public read material_categories" ON material_categories FOR SELECT USING (true);
CREATE POLICY "Public read materials" ON materials FOR SELECT USING (true);
CREATE POLICY "Public read rate_sources" ON rate_sources FOR SELECT USING (true);
CREATE POLICY "Public read material_rates" ON material_rates FOR SELECT USING (true);
CREATE POLICY "Public read rate_history" ON rate_history FOR SELECT USING (true);
CREATE POLICY "Public read labour_rates" ON labour_rates FOR SELECT USING (true);
CREATE POLICY "Public read suppliers" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Public read society_rules" ON society_rules FOR SELECT USING (true);

-- Admin writes on market rates and configuration
CREATE POLICY "Admin manage materials" ON materials FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin'))
);
CREATE POLICY "Admin manage material rates" ON material_rates FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin'))
);
CREATE POLICY "Admin manage labour rates" ON labour_rates FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin'))
);
CREATE POLICY "Admin manage society rules" ON society_rules FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin'))
);
CREATE POLICY "Admin read audit logs" ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin'))
);
CREATE POLICY "Admin insert audit logs" ON audit_logs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin'))
);



-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- FILE: supabase/migrations/20260905000001_customer_account_and_sharing.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- ==============================================================================
-- BuildCost Connect - Database Migration 002
-- Customer Account System, Sharing Links, Templates, Watchlist & Checklist
-- PostgreSQL Schema & Row Level Security (RLS) Policies
-- ==============================================================================

-- 1. SECURE PUBLIC SHARE LINKS (Non-guessable random tokens)
CREATE TABLE IF NOT EXISTS share_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('estimate', 'calculation', 'boq', 'quotation', 'cost_report')),
    document_id TEXT NOT NULL,
    document_data JSONB NOT NULL,
    token TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    allow_download BOOLEAN DEFAULT TRUE,
    view_only BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    
    -- Privacy controls
    include_client_name BOOLEAN DEFAULT FALSE,
    include_phone BOOLEAN DEFAULT FALSE,
    include_company BOOLEAN DEFAULT FALSE,
    include_project_address BOOLEAN DEFAULT FALSE,
    
    -- Analytics
    view_count INT DEFAULT 0,
    download_count INT DEFAULT 0,
    last_viewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SAVED CALCULATOR TEMPLATES
CREATE TABLE IF NOT EXISTS calculator_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    calculator_type TEXT NOT NULL,
    plot_size NUMERIC,
    plot_unit TEXT DEFAULT 'marla',
    covered_area NUMERIC,
    floors INT DEFAULT 1,
    construction_quality TEXT DEFAULT 'standard',
    city_id TEXT DEFAULT 'isb',
    inputs JSONB NOT NULL,
    is_system_preset BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PERSONAL MATERIAL WATCHLIST & ALERTS
CREATE TABLE IF NOT EXISTS material_watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    material_id TEXT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    target_alert_rate NUMERIC,
    alert_on_increase BOOLEAN DEFAULT TRUE,
    alert_on_decrease BOOLEAN DEFAULT TRUE,
    notify_email BOOLEAN DEFAULT TRUE,
    notify_in_app BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_material_city UNIQUE (user_id, material_id, city_id)
);

-- 4. CONSTRUCTION CHECKLIST (12 construction phases)
CREATE TABLE IF NOT EXISTS project_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage TEXT NOT NULL CHECK (stage IN (
        'planning', 'site_preparation', 'foundation', 'structure', 
        'masonry', 'plaster', 'electrical', 'plumbing', 
        'flooring', 'paint', 'doors_windows', 'final_inspection'
    )),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    due_date DATE,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PROJECT NOTES
CREATE TABLE IF NOT EXISTS project_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'site', 'procurement', 'contractor', 'payment', 'quality')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ESTIMATE VERSIONS (Historical preservation)
CREATE TABLE IF NOT EXISTS estimate_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    version_name TEXT NOT NULL,
    rate_snapshot_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    summary_data JSONB NOT NULL,
    rates_snapshot JSONB NOT NULL,
    delta_amount NUMERIC DEFAULT 0,
    delta_percentage NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_project_version UNIQUE (project_id, version_number)
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token);
CREATE INDEX IF NOT EXISTS idx_share_links_user_id ON share_links(user_id);
CREATE INDEX IF NOT EXISTS idx_calculator_templates_user_id ON calculator_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_material_watchlists_user_id ON material_watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_project_checklists_project_id ON project_checklists(project_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_estimate_versions_project_id ON estimate_versions(project_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_versions ENABLE ROW LEVEL SECURITY;

-- Share links: Users manage own share links
CREATE POLICY "Users can manage own share links" ON share_links 
    FOR ALL USING (auth.uid() = user_id);

-- CRITICAL: Public read policy for share links by token
CREATE POLICY "Public read active share link" ON share_links 
    FOR SELECT USING (
        is_active = TRUE 
        AND revoked_at IS NULL 
        AND (expires_at IS NULL OR expires_at > NOW())
    );

-- Templates: Users manage own templates; system presets visible to all
CREATE POLICY "Users can manage own templates" ON calculator_templates 
    FOR ALL USING (auth.uid() = user_id OR is_system_preset = TRUE);

-- Watchlist: Isolated to user
CREATE POLICY "Users can manage own watchlist" ON material_watchlists 
    FOR ALL USING (auth.uid() = user_id);

-- Checklists: Isolated by project ownership
CREATE POLICY "Users can manage own project checklists" ON project_checklists 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = project_checklists.project_id AND projects.user_id = auth.uid())
    );

-- Notes: Isolated by project ownership
CREATE POLICY "Users can manage own project notes" ON project_notes 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = project_notes.project_id AND projects.user_id = auth.uid())
    );

-- Versions: Isolated by project ownership
CREATE POLICY "Users can manage own estimate versions" ON estimate_versions 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM projects WHERE projects.id = estimate_versions.project_id AND projects.user_id = auth.uid())
    );



-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- FILE: supabase/migrations/20260905000002_layouts_vendors_purchases.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- ==============================================================================
-- BuildCost Connect - Database Migration 003
-- House Layouts, Vendors, Purchases, Inventory, Reminders & Site Diaries
-- PostgreSQL Schema & Row Level Security (RLS) Policies
-- ==============================================================================

-- 1. HOUSE LAYOUTS / CONCEPTUAL 2D PLANS
CREATE TABLE IF NOT EXISTS house_layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    plot_category TEXT NOT NULL CHECK (plot_category IN ('3_marla', '5_marla', '7_marla', '10_marla', '1_kanal')),
    plot_area_sqft NUMERIC NOT NULL,
    plot_width_ft NUMERIC NOT NULL,
    plot_depth_ft NUMERIC NOT NULL,
    covered_area_sqft NUMERIC NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    floors INT NOT NULL DEFAULT 2,
    has_car_porch BOOLEAN DEFAULT TRUE,
    has_drawing_room BOOLEAN DEFAULT TRUE,
    has_tv_lounge BOOLEAN DEFAULT TRUE,
    has_servant_room BOOLEAN DEFAULT FALSE,
    has_dirty_kitchen BOOLEAN DEFAULT FALSE,
    is_corner_plot BOOLEAN DEFAULT FALSE,
    description TEXT,
    plan_data JSONB NOT NULL,
    is_system_preset BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VENDORS / SUPPLIERS
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    whatsapp_number TEXT,
    alternative_number TEXT,
    email TEXT,
    address TEXT,
    city_id TEXT NOT NULL DEFAULT 'isb',
    category TEXT NOT NULL,
    notes TEXT,
    rating NUMERIC DEFAULT 5.0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'preferred')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PURCHASES / ORDERS
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    material_id TEXT NOT NULL,
    material_name TEXT NOT NULL,
    brand TEXT,
    specification TEXT,
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    rate NUMERIC NOT NULL CHECK (rate >= 0),
    subtotal NUMERIC NOT NULL,
    discount NUMERIC DEFAULT 0,
    transport_charges NUMERIC DEFAULT 0,
    loading_charges NUMERIC DEFAULT 0,
    unloading_charges NUMERIC DEFAULT 0,
    other_charges NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'ordered' CHECK (status IN ('draft', 'ordered', 'partially_delivered', 'delivered', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid')),
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    delivered_at TIMESTAMPTZ,
    bill_url TEXT,
    material_photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. VENDOR PAYMENTS
CREATE TABLE IF NOT EXISTS vendor_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank_transfer', 'cheque', 'other')),
    reference_number TEXT,
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MATERIAL INVENTORY
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    material_id TEXT NOT NULL,
    material_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    opening_quantity NUMERIC DEFAULT 0,
    purchased_quantity NUMERIC DEFAULT 0,
    used_quantity NUMERIC DEFAULT 0,
    min_stock_threshold NUMERIC DEFAULT 10,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_project_material_inventory UNIQUE (project_id, material_id)
);

-- 6. MATERIAL USAGES
CREATE TABLE IF NOT EXISTS material_usages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    material_id TEXT NOT NULL,
    quantity_used NUMERIC NOT NULL CHECK (quantity_used > 0),
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    construction_stage TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROJECT REMINDERS
CREATE TABLE IF NOT EXISTS project_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    reminder_date DATE NOT NULL,
    reminder_time TIME,
    repeat_frequency TEXT DEFAULT 'none' CHECK (repeat_frequency IN ('none', 'daily', 'weekly', 'monthly')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SITE DIARIES / DAILY LOGS
CREATE TABLE IF NOT EXISTS site_diaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weather TEXT DEFAULT 'sunny' CHECK (weather IN ('sunny', 'cloudy', 'rainy', 'hot', 'cold')),
    workers_present INT DEFAULT 0,
    work_completed TEXT NOT NULL,
    materials_received TEXT,
    issues TEXT,
    photo_urls TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_project_id ON purchases(project_id);
CREATE INDEX IF NOT EXISTS idx_purchases_vendor_id ON purchases(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_vendor_id ON vendor_payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_inventory_project_id ON inventory_items(project_id);
CREATE INDEX IF NOT EXISTS idx_usages_project_id ON material_usages(project_id);
CREATE INDEX IF NOT EXISTS idx_reminders_project_id ON project_reminders(project_id);
CREATE INDEX IF NOT EXISTS idx_diaries_project_id ON site_diaries(project_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE house_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_diaries ENABLE ROW LEVEL SECURITY;

-- Layouts: public read
CREATE POLICY "Public read house layouts" ON house_layouts FOR SELECT USING (true);

-- Vendors: user isolation
CREATE POLICY "Users can manage own vendors" ON vendors FOR ALL USING (auth.uid() = user_id);

-- Purchases & Payments: user & project isolation
CREATE POLICY "Users can manage own purchases" ON purchases FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own vendor payments" ON vendor_payments FOR ALL USING (auth.uid() = user_id);

-- Inventory & Usages: project owner isolation
CREATE POLICY "Users can manage own inventory" ON inventory_items FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = inventory_items.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can manage own usages" ON material_usages FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = material_usages.project_id AND projects.user_id = auth.uid())
);

-- Reminders & Site Diaries: user & project isolation
CREATE POLICY "Users can manage own reminders" ON project_reminders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own site diaries" ON site_diaries FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = site_diaries.project_id AND projects.user_id = auth.uid())
);



-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- FILE: supabase/migrations/20260905000003_subscriptions_payments_verification.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

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



-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- FILE: supabase/migrations/20260905000004_project_management_crud.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

﻿-- ============================================================
-- Migration: 20260905000004_project_management_crud.sql
-- Description: PRO Project CRUD Schema, Audit Logs, and RLS
-- ============================================================

-- 1. Extend projects table with structural & client fields
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS client_contact TEXT,
ADD COLUMN IF NOT EXISTS client_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS reference_number TEXT,
ADD COLUMN IF NOT EXISTS society TEXT,
ADD COLUMN IF NOT EXISTS plot_front NUMERIC,
ADD COLUMN IF NOT EXISTS plot_depth NUMERIC,
ADD COLUMN IF NOT EXISTS building_height NUMERIC,
ADD COLUMN IF NOT EXISTS plinth_height NUMERIC,
ADD COLUMN IF NOT EXISTS floor_to_floor_height NUMERIC,
ADD COLUMN IF NOT EXISTS clear_ceiling_height NUMERIC,
ADD COLUMN IF NOT EXISTS wall_height NUMERIC,
ADD COLUMN IF NOT EXISTS foundation_depth NUMERIC,
ADD COLUMN IF NOT EXISTS slab_thickness NUMERIC,
ADD COLUMN IF NOT EXISTS project_image_url TEXT,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Ensure status supports 'archived'
DO \$\$
BEGIN
    ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
    ALTER TABLE projects ADD CONSTRAINT projects_status_check 
    CHECK (status IN ('planning', 'active', 'estimating', 'quotation', 'approved', 'under_construction', 'completed', 'on_hold', 'archived'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END \$\$;

-- 2. Project Audit History (Section 19)
CREATE TABLE IF NOT EXISTS project_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN (
        'project_created',
        'project_edited',
        'budget_changed',
        'project_archived',
        'project_restored',
        'project_duplicated',
        'project_deleted'
    )),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_project ON project_audit_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON project_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON project_audit_logs(created_at DESC);

-- 3. Project Estimate Versions & Rate Snapshots (Section 21 & 22)
CREATE TABLE IF NOT EXISTS project_estimate_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version_number INT NOT NULL DEFAULT 1,
    version_name TEXT NOT NULL,
    rate_snapshot_date TIMESTAMPTZ DEFAULT NOW(),
    rates_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    quantities JSONB DEFAULT '{}'::jsonb,
    assumptions JSONB DEFAULT '{}'::jsonb,
    total_cost NUMERIC NOT NULL DEFAULT 0,
    cost_per_sqft NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_estimate_versions_project ON project_estimate_versions(project_id);

-- 4. Enable RLS on newly created tables
ALTER TABLE project_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_estimate_versions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Project Audit Logs
CREATE POLICY Users view audit logs of their projects 
ON project_audit_logs FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_audit_logs.project_id AND projects.user_id = auth.uid())
    OR auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY Users can insert audit logs for own projects 
ON project_audit_logs FOR INSERT 
WITH CHECK (
    auth.uid() = user_id
);

-- 6. RLS Policies: Estimate Versions
CREATE POLICY Users manage estimate versions for own projects 
ON project_estimate_versions FOR ALL 
USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_estimate_versions.project_id AND projects.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 7. Ensure projects RLS covers all operations with user ownership
DROP POLICY IF EXISTS Users can manage own projects ON projects;

CREATE POLICY Users can manage own projects 
ON projects FOR ALL 
USING (
    auth.uid() = user_id 
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
)
WITH CHECK (
    auth.uid() = user_id
);



-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- FILE: supabase/migrations/20260906000001_super_admin_control_center.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

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



-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- FILE: supabase/migrations/20260906000002_live_analytics_and_whatsapp_payments.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

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



-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- FILE: supabase/migrations/20260906000003_centralized_subscription_plans.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

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



-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- FILE: supabase/migrations/20260906000004_app_releases_and_remote_config.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- Migration: 20260906000004_app_releases_and_remote_config.sql
-- Description: Dynamic App Releases, Mobile OTA metadata, and Remote Configuration

CREATE TABLE IF NOT EXISTS public.app_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL DEFAULT 'android',
    latest_version TEXT NOT NULL DEFAULT '1.2.0',
    latest_version_code INTEGER NOT NULL DEFAULT 12,
    minimum_version_code INTEGER NOT NULL DEFAULT 10,
    mandatory_update BOOLEAN NOT NULL DEFAULT FALSE,
    ota_available BOOLEAN NOT NULL DEFAULT TRUE,
    ota_bundle_url TEXT DEFAULT 'https://u.expo.dev/buildcost-connect/updates/latest',
    ota_channel TEXT NOT NULL DEFAULT 'production',
    apk_download_url TEXT DEFAULT 'https://buildcostconnect.pk/releases/buildcost-v1.2.0.apk',
    release_notes TEXT DEFAULT 'BuildCost Connect 2.0: Instant civil engineering estimators, real-time live PBS material rates, BOQ generator, and vendor Khata.',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT app_releases_platform_key UNIQUE (platform)
);

-- Enable Row Level Security
ALTER TABLE public.app_releases ENABLE ROW LEVEL SECURITY;

-- Public read access for version checking on app launch
CREATE POLICY "Allow public read on app_releases"
    ON public.app_releases
    FOR SELECT
    USING (true);

-- Super admin only modifications
CREATE POLICY "Allow super admins full access on app_releases"
    ON public.app_releases
    FOR ALL
    USING (
        auth.jwt() ->> 'email' IN ('admin@buildcostconnect.pk', 'superadmin@buildcostconnect.pk', 'hayyat@buildcostconnect.pk')
        OR auth.role() = 'service_role'
    );

-- Seed initial records for Android and Web
INSERT INTO public.app_releases (platform, latest_version, latest_version_code, minimum_version_code, mandatory_update, ota_available, ota_channel, apk_download_url, release_notes)
VALUES 
    ('android', '1.2.0', 12, 10, false, true, 'production', 'https://buildcostconnect.pk/releases/buildcost-v1.2.0.apk', 'BuildCost Connect 2.0: Instant civil engineering estimators, real-time live PBS material rates, BOQ generator, and vendor Khata.'),
    ('web', '2.0.0', 20, 20, false, false, 'production', 'https://buildcostconnect.pk', 'Property Calculator 2.0 live production release')
ON CONFLICT (platform) DO UPDATE 
SET 
    latest_version = EXCLUDED.latest_version,
    latest_version_code = EXCLUDED.latest_version_code,
    minimum_version_code = EXCLUDED.minimum_version_code,
    mandatory_update = EXCLUDED.mandatory_update,
    ota_available = EXCLUDED.ota_available,
    apk_download_url = EXCLUDED.apk_download_url,
    release_notes = EXCLUDED.release_notes,
    updated_at = NOW();



-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- FILE: supabase/migrations/20260907000001_storage_buckets_and_policies.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- ==============================================================================
-- SUPABASE STORAGE BUCKETS & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. Create Storage Buckets (if not already created)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    (
        'payment-slips', 
        'payment-slips', 
        false, 
        10485760, -- 10MB limit
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    ),
    (
        'project-documents', 
        'project-documents', 
        false, 
        26214400, -- 25MB limit
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv']
    ),
    (
        'platform-media', 
        'platform-media', 
        true, -- Publicly readable platform assets
        15728640, -- 15MB limit
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    )
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage RLS Policies: payment-slips
-- Authenticated users and upload API can upload slips
CREATE POLICY "Users can upload own payment slips"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'payment-slips' AND (
        auth.role() = 'authenticated' OR auth.role() = 'anon'
    )
);

-- Users can view their own slips, Admins can view all slips
CREATE POLICY "Users and admins view payment slips"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'payment-slips' AND (
        auth.role() = 'service_role' OR
        (storage.foldername(name))[1] = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
        )
    )
);

-- 3. Storage RLS Policies: project-documents
-- Users have full CRUD only within their own folder: project-documents/<user_id>/...
CREATE POLICY "Users manage own project documents"
ON storage.objects FOR ALL
USING (
    bucket_id = 'project-documents' AND (
        auth.role() = 'service_role' OR
        (storage.foldername(name))[1] = auth.uid()::text
    )
)
WITH CHECK (
    bucket_id = 'project-documents' AND (
        auth.role() = 'service_role' OR
        (storage.foldername(name))[1] = auth.uid()::text
    )
);

-- 4. Storage RLS Policies: platform-media
-- Public can view platform media
CREATE POLICY "Public read platform media"
ON storage.objects FOR SELECT
USING (bucket_id = 'platform-media');

-- Only Super Admins can insert/update/delete platform media
CREATE POLICY "Admins manage platform media"
ON storage.objects FOR ALL
USING (
    bucket_id = 'platform-media' AND (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
        )
    )
)
WITH CHECK (
    bucket_id = 'platform-media' AND (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
        )
    )
);



-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- INITIAL DATA SEED: supabase/seed.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- ==============================================================================
-- BuildCost Connect - Development Seed Data
-- Pakistan Construction Cost Intelligence Platform
-- NOTE: Sample rates are marked as is_demo_sample = true
-- ==============================================================================

-- 1. CITIES
INSERT INTO cities (id, name, urdu_name, province, default_marla_sqft, is_active) VALUES
('isb', 'Islamabad', 'اسلام آباد', 'Federal', 225, true),
('rwp', 'Rawalpindi', 'راولپنڈی', 'Punjab', 225, true),
('lhe', 'Lahore', 'لاہور', 'Punjab', 225, true),
('khi', 'Karachi', 'کراچی', 'Sindh', 225, true),
('pew', 'Peshawar', 'پشاور', 'KPK', 225, true),
('fsd', 'Faisalabad', 'فیصل آباد', 'Punjab', 272.25, true),
('mux', 'Multan', 'ملتان', 'Punjab', 272.25, true),
('grw', 'Gujranwala', 'گوجرانوالہ', 'Punjab', 225, true),
('skt', 'Sialkot', 'سیالکوٹ', 'Punjab', 225, true),
('qta', 'Quetta', 'کوئٹہ', 'Balochistan', 225, true),
('hyd', 'Hyderabad', 'حیدرآباد', 'Sindh', 225, true),
('atd', 'Abbottabad', 'ایبٹ آباد', 'KPK', 225, true),
('mre', 'Murree', 'مری', 'Punjab', 225, true)
ON CONFLICT (id) DO NOTHING;

-- 2. MARLA STANDARDS
INSERT INTO marla_standards (id, name, sqft, description, is_default) VALUES
('marla_225', '225 Sq Ft (Modern Urban / CDA / LDA / DHA)', 225, 'Standard adopted by modern urban housing authorities including CDA, LDA, DHA, and Bahria Town.', true),
('marla_250', '250 Sq Ft (Commercial / Selected Societies)', 250, 'Used in selected commercial developments and designated modern housing projects in Punjab.', false),
('marla_272_25', '272.25 Sq Ft (Traditional Revenue / Punjab Standard)', 272.25, 'Traditional revenue standard (1 Karam = 5.5 ft, 1 Sarsahi = 30.25 sqft, 9 Sarsahi = 272.25 sqft). Common in Multan, Faisalabad, and rural land records.', false)
ON CONFLICT (id) DO NOTHING;

-- 3. MATERIAL CATEGORIES
INSERT INTO material_categories (id, key, name, description, sort_order) VALUES
('cat_civil', 'civil', 'Civil & Foundation', 'Cement, Sand, Aggregates, and Concrete compounds', 1),
('cat_structural', 'structural', 'Structural Steel', 'Deformed rebar, wire mesh, and structural sections', 2),
('cat_masonry', 'masonry', 'Bricks & Masonry', 'Red clay bricks, solid concrete blocks, and AAC blocks', 3),
('cat_plaster', 'plaster', 'Plaster & Screed', 'Plastering sands, adhesives, and finishing plasters', 4),
('cat_flooring', 'flooring', 'Flooring & Tiles', 'Porcelain tiles, ceramic tiles, and bond adhesives', 5),
('cat_paint', 'paint', 'Paints & Finishes', 'Primers, wall putty, emulsions, and exterior weather-coat', 6)
ON CONFLICT (id) DO NOTHING;

-- 4. MATERIALS
INSERT INTO materials (id, category_id, name, code, specification, brand, unit, default_wastage_percent, is_active) VALUES
('mat_cement', 'cat_civil', 'Portland Cement (50kg Bag)', 'CEMENT_OPC', 'Ordinary Portland Cement (ASTM C150 Type 1)', 'Bestway / Fauji / Lucky', 'bag', 5, true),
('mat_steel_g60', 'cat_structural', 'Deformed Steel Bar Grade 60', 'STEEL_G60', 'ASTM A615 Grade 60 Deformed Billet Rebar', 'Mughal / Amreli / Ittehad', 'kg', 4, true),
('mat_brick_awwal', 'cat_masonry', 'Red Clay Bricks (Awwal / A-Grade)', 'BRICK_A', 'Kiln fired standard 9x4.5x3 inch red bricks', 'Local Kiln Verified', 'piece', 5, true),
('mat_sand_chenab', 'cat_civil', 'Chenab / Ravi River Sand', 'SAND_RIVER', 'Medium-coarse washed river sand for masonry and concrete', 'River Bed Excavation', 'cft', 5, true),
('mat_crush_margalla', 'cat_civil', 'Margalla / Sargodha Crush (Bajri)', 'CRUSH_BAJRI', 'Graded angular limestone crushed aggregate 1/2" to 3/4"', 'Margalla Quarry', 'cft', 5, true),
('mat_tiles_porcelain', 'cat_flooring', 'Porcelain Floor Tiles 60x60 cm', 'TILE_PORCELAIN', 'Full body porcelain polished tiles (24x24 in)', 'Master / Shabbir / RAK', 'sqft', 7, true),
('mat_paint_matt', 'cat_paint', 'Interior Matt Enamel / Emulsion', 'PAINT_EMULSION', 'Washable acrylic interior emulsion', 'Dulux / Berger / Brighto', 'litre', 5, true)
ON CONFLICT (id) DO NOTHING;

-- 5. RATE SOURCES
INSERT INTO rate_sources (id, name, source_type, website_url, reliability_score, notes) VALUES
('src_market_isb', 'Islamabad I-9 & Rawalpindi Mandi Survey', 'market_survey', NULL, 4, 'Direct dealer quotes collected from I-9 Industrial Area and Rawalpindi Gunj Mandi.'),
('src_market_lhe', 'Lahore Badami Bagh & Daroghwala Steel Market', 'market_survey', NULL, 4, 'Verified market surveys from Lahore wholesale distributors.'),
('src_market_khi', 'Karachi Shershah & Lyari Construction Market', 'market_survey', NULL, 4, 'Aggregated wholesale distributor prices.'),
('src_demo_default', 'BuildCost Verified Baseline (Demo / Sample)', 'demo_sample', NULL, 5, 'Baseline demo reference data for test calculations.')
ON CONFLICT (id) DO NOTHING;

-- 6. MATERIAL RATES (Sample rates with explicit demo flag)
INSERT INTO material_rates (material_id, city_id, brand, grade, unit, base_rate, transport_rate, loading_rate, unloading_rate, delivered_rate, currency, source_id, source_name, source_type, verified_at, confidence_score, status, trend_percentage, is_demo_sample) VALUES
('mat_cement', 'isb', 'Bestway Cement', 'OPC 50kg', 'bag', 1420, 20, 5, 5, 1450, 'PKR', 'src_market_isb', 'Islamabad Market Survey', 'market_survey', NOW(), 'HIGH', 'verified', 2.5, true),
('mat_cement', 'lhe', 'Lucky Cement', 'OPC 50kg', 'bag', 1390, 20, 5, 5, 1420, 'PKR', 'src_market_lhe', 'Lahore Wholesale Distributors', 'market_survey', NOW(), 'HIGH', 'verified', 1.8, true),
('mat_cement', 'khi', 'Falcon Cement', 'OPC 50kg', 'bag', 1370, 20, 5, 5, 1400, 'PKR', 'src_market_khi', 'Karachi Shershah Market', 'market_survey', NOW(), 'HIGH', 'verified', 0.5, true),

('mat_steel_g60', 'isb', 'Mughal Steel', 'Grade 60 Billet', 'kg', 255, 3, 1, 1, 260, 'PKR', 'src_market_isb', 'Islamabad Market Survey', 'market_survey', NOW(), 'HIGH', 'verified', -1.1, true),
('mat_steel_g60', 'lhe', 'Ittehad Steel', 'Grade 60 Billet', 'kg', 252, 3, 1, 1, 257, 'PKR', 'src_market_lhe', 'Lahore Wholesale Distributors', 'market_survey', NOW(), 'HIGH', 'verified', -0.8, true),
('mat_steel_g60', 'khi', 'Amreli Steels', 'Grade 60 Billet', 'kg', 256, 2, 1, 1, 260, 'PKR', 'src_market_khi', 'Karachi Shershah Market', 'market_survey', NOW(), 'HIGH', 'verified', 0.0, true),

('mat_brick_awwal', 'isb', 'Rawat Bhatta', 'A-Grade', 'piece', 13.5, 0.4, 0.05, 0.05, 14.0, 'PKR', 'src_market_isb', 'Islamabad Market Survey', 'market_survey', NOW(), 'HIGH', 'verified', 1.8, true),
('mat_brick_awwal', 'lhe', 'Multan Road Bhatta', 'A-Grade', 'piece', 12.8, 0.4, 0.05, 0.05, 13.3, 'PKR', 'src_market_lhe', 'Lahore Wholesale Distributors', 'market_survey', NOW(), 'HIGH', 'verified', 1.5, true),

('mat_sand_chenab', 'isb', 'Chenab River Sand', 'Medium Graded', 'cft', 42, 2, 0.5, 0.5, 45, 'PKR', 'src_market_isb', 'Islamabad Market Survey', 'market_survey', NOW(), 'MEDIUM', 'verified', 0.5, true),
('mat_sand_chenab', 'lhe', 'Ravi River Sand', 'Washed', 'cft', 38, 2, 0.5, 0.5, 41, 'PKR', 'src_market_lhe', 'Lahore Wholesale Distributors', 'market_survey', NOW(), 'MEDIUM', 'verified', 0.0, true),

('mat_crush_margalla', 'isb', 'Margalla Crush', '1/2" Graded', 'cft', 62, 2, 0.5, 0.5, 65, 'PKR', 'src_market_isb', 'Islamabad Market Survey', 'market_survey', NOW(), 'HIGH', 'verified', 0.0, true),
('mat_crush_margalla', 'lhe', 'Sargodha Crush', '1/2" Graded', 'cft', 60, 3, 0.5, 0.5, 64, 'PKR', 'src_market_lhe', 'Lahore Wholesale Distributors', 'market_survey', NOW(), 'HIGH', 'verified', -0.5, true),

('mat_tiles_porcelain', 'isb', 'Master Ceramics', '60x60cm Polished', 'sqft', 175, 3, 1, 1, 180, 'PKR', 'src_market_isb', 'Islamabad Tile Market', 'supplier', NOW(), 'HIGH', 'verified', 1.2, true),
('mat_paint_matt', 'isb', 'Dulux Velvet Touch', 'Interior Emulsion', 'litre', 830, 10, 5, 5, 850, 'PKR', 'src_market_isb', 'Islamabad Paint Dealers', 'supplier', NOW(), 'HIGH', 'verified', 2.0, true)
ON CONFLICT (material_id, city_id) DO UPDATE SET delivered_rate = EXCLUDED.delivered_rate, updated_at = NOW();

-- 7. LABOUR RATES
INSERT INTO labour_rates (role, role_urdu, city_id, skill_level, pricing_type, rate, currency, source_name, verified_at, notes) VALUES
('Head Mason (Raj Mistry)', 'راج مستری', 'isb', 'supervisor', 'per_day', 2800, 'PKR', 'Local Labour Chowk Survey', NOW(), 'Experienced residential supervisor'),
('Mason (Raj Mazdoor)', 'مستری', 'isb', 'skilled', 'per_day', 2400, 'PKR', 'Local Labour Chowk Survey', NOW(), 'Standard brickwork and plastering craftsman'),
('Labourer / Helper (Mazdoor)', 'مزدور', 'isb', 'helper', 'per_day', 1500, 'PKR', 'Local Labour Chowk Survey', NOW(), 'General material handling and concrete mixing'),
('Steel Fixer (Bar Bender)', 'سریا باندھنے والا', 'isb', 'skilled', 'per_day', 2500, 'PKR', 'Local Labour Chowk Survey', NOW(), 'Rebar bending and tying'),
('Plumber', 'پلمبر', 'isb', 'skilled', 'per_day', 2400, 'PKR', 'Local Labour Chowk Survey', NOW(), 'PPRC and PVC sanitary piping'),
('Electrician', 'الیکٹریشن', 'isb', 'skilled', 'per_day', 2400, 'PKR', 'Local Labour Chowk Survey', NOW(), 'Wiring and conduit layout'),
('Tile Worker (Mistri)', 'ٹائل مستری', 'isb', 'skilled', 'per_sqft', 45, 'PKR', 'Local Labour Chowk Survey', NOW(), 'Floor and bathroom tile fixing'),
('Painter', 'پینٹر', 'isb', 'skilled', 'per_sqft', 20, 'PKR', 'Local Labour Chowk Survey', NOW(), 'Two coats paint + primer + putty')
ON CONFLICT DO NOTHING;

-- 8. SOCIETY RULES
INSERT INTO society_rules (authority_name, society_name, city_id, plot_size_category, max_ground_coverage_percent, max_far, front_setback_ft, rear_setback_ft, side_setback_ft, max_height_ft, max_floors, notes, effective_date, verification_date) VALUES
('CDA', 'Capital Development Authority (Sectors)', 'isb', '5 Marla (25x45)', 70, 1.4, 5, 5, 0, 35, 3, 'Basement allowed subject to structural stability certificate.', '2024-01-01', '2026-01-01'),
('CDA', 'Capital Development Authority (Sectors)', 'isb', '10 Marla (35x70)', 65, 1.3, 10, 7, 5, 35, 3, 'Dual side setbacks required for corner plots.', '2024-01-01', '2026-01-01'),
('LDA', 'Lahore Development Authority', 'lhe', '5 Marla (25x45)', 75, 1.5, 5, 4, 0, 38, 3, 'LDA residential building regulations 2023.', '2023-06-01', '2026-01-01'),
('DHA', 'Defence Housing Authority (Phase 5/6)', 'isb', '10 Marla (35x70)', 65, 1.3, 10, 8, 5, 35, 3, 'Strict architectural guidelines and elevation approval mandatory.', '2024-01-01', '2026-01-01')
ON CONFLICT DO NOTHING;


