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
