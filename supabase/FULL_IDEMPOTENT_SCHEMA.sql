-- ==============================================================================
-- BUILDCOST CONNECT 2.0 — COMPLETE IDEMPOTENT PRODUCTION SCHEMA
-- Fully re-runnable: Safely creates tables, drops existing policies before recreating,
-- creates storage buckets, and seeds initial Pakistani construction data.
-- ==============================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Linked to Supabase Auth)
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

-- 5. MATERIAL CATEGORIES & MATERIALS
CREATE TABLE IF NOT EXISTS material_categories (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- 6. MATERIAL RATES & RATE HISTORY
CREATE TABLE IF NOT EXISTS material_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id TEXT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    rate NUMERIC NOT NULL CHECK (rate >= 0),
    currency TEXT DEFAULT 'PKR',
    source_id TEXT DEFAULT 'admin_verified',
    source_name TEXT DEFAULT 'Market Survey',
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    verified_by UUID REFERENCES profiles(id),
    notes TEXT,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (material_id, city_id)
);

CREATE TABLE IF NOT EXISTS rate_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id TEXT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    rate NUMERIC NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LABOUR RATES
CREATE TABLE IF NOT EXISTS labour_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    trade_key TEXT NOT NULL,
    trade_name TEXT NOT NULL,
    rate_per_day NUMERIC,
    rate_per_sqft NUMERIC,
    unit TEXT NOT NULL,
    is_current BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (city_id, trade_key)
);

-- 8. PROJECTS & ESTIMATES
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    city_id TEXT NOT NULL REFERENCES cities(id),
    plot_size NUMERIC NOT NULL,
    plot_unit TEXT NOT NULL DEFAULT 'marla',
    marla_standard_sqft NUMERIC NOT NULL DEFAULT 225,
    covered_area_sqft NUMERIC NOT NULL,
    floors_count INT DEFAULT 1,
    quality_tier TEXT DEFAULT 'standard',
    status TEXT DEFAULT 'planning',
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    calculator_type TEXT NOT NULL,
    inputs JSONB NOT NULL,
    breakdown JSONB NOT NULL,
    total_cost NUMERIC NOT NULL,
    cost_per_sqft NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS boqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    total_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS boq_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boq_id UUID NOT NULL REFERENCES boqs(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    item_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    rate NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'units',
    unit_price NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    purchase_date DATE DEFAULT CURRENT_DATE,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PAYMENT VERIFICATIONS (JAZZCASH / EASYPAISA SLIPS)
CREATE TABLE IF NOT EXISTS payment_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    plan_tier TEXT NOT NULL DEFAULT 'pro',
    amount_pkr NUMERIC NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('easypaisa', 'jazzcash', 'bank_transfer', 'whatsapp')),
    sender_account_number TEXT,
    sender_account_name TEXT,
    transaction_reference TEXT,
    slip_storage_path TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. STORAGE BUCKETS (FOR RECEIPTS, SLIPS & BLUEPRINTS)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('payment-slips', 'payment-slips', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
    ('project-documents', 'project-documents', false, 26214400, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
    ('platform-media', 'platform-media', true, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- 11. ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE labour_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_verifications ENABLE ROW LEVEL SECURITY;

-- Idempotent Policies: Drop if exists then create

-- Cities
DROP POLICY IF EXISTS "Public read cities" ON cities;
CREATE POLICY "Public read cities" ON cities FOR SELECT USING (true);

-- Materials
DROP POLICY IF EXISTS "Public read materials" ON materials;
CREATE POLICY "Public read materials" ON materials FOR SELECT USING (true);

-- Material Rates
DROP POLICY IF EXISTS "Public read material_rates" ON material_rates;
CREATE POLICY "Public read material_rates" ON material_rates FOR SELECT USING (true);

-- Labour Rates
DROP POLICY IF EXISTS "Public read labour_rates" ON labour_rates;
CREATE POLICY "Public read labour_rates" ON labour_rates FOR SELECT USING (true);

-- Profiles
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Projects
DROP POLICY IF EXISTS "Users manage own projects" ON projects;
CREATE POLICY "Users manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);

-- Calculations
DROP POLICY IF EXISTS "Users manage own calculations" ON calculations;
CREATE POLICY "Users manage own calculations" ON calculations FOR ALL USING (auth.uid() = user_id);

-- Purchases
DROP POLICY IF EXISTS "Users manage own purchases" ON purchases;
CREATE POLICY "Users manage own purchases" ON purchases FOR ALL USING (auth.uid() = user_id);

-- Expenses
DROP POLICY IF EXISTS "Users manage own expenses" ON expenses;
CREATE POLICY "Users manage own expenses" ON expenses FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = expenses.project_id AND projects.user_id = auth.uid())
);

-- Payments
DROP POLICY IF EXISTS "Users view own payments" ON payment_verifications;
CREATE POLICY "Users view own payments" ON payment_verifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own payments" ON payment_verifications;
CREATE POLICY "Users insert own payments" ON payment_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage Policies
DROP POLICY IF EXISTS "Users upload payment slips" ON storage.objects;
CREATE POLICY "Users upload payment slips" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-slips');

DROP POLICY IF EXISTS "Users view payment slips" ON storage.objects;
CREATE POLICY "Users view payment slips" ON storage.objects FOR SELECT USING (bucket_id = 'payment-slips');

DROP POLICY IF EXISTS "Public read platform media" ON storage.objects;
CREATE POLICY "Public read platform media" ON storage.objects FOR SELECT USING (bucket_id = 'platform-media');

-- 12. INITIAL SEED DATA (PAKISTANI CITIES & STANDARDS)
INSERT INTO cities (id, name, urdu_name, province, default_marla_sqft) VALUES
    ('isb', 'Islamabad', 'اسلام آباد', 'Federal Capital', 225),
    ('rwp', 'Rawalpindi', 'راولپنڈی', 'Punjab', 225),
    ('lhr', 'Lahore', 'لاہور', 'Punjab', 225),
    ('khi', 'Karachi', 'کراچی', 'Sindh', 240),
    ('pew', 'Peshawar', 'پشاور', 'KPK', 225),
    ('qta', 'Quetta', 'کوئٹہ', 'Balochistan', 225),
    ('mux', 'Multan', 'ملتان', 'Punjab', 225),
    ('fsd', 'Faisalabad', 'فیصل آباد', 'Punjab', 225),
    ('gwl', 'Gujranwala', 'گوجرانوالہ', 'Punjab', 225)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, default_marla_sqft = EXCLUDED.default_marla_sqft;

INSERT INTO marla_standards (id, name, sqft, description, is_default) VALUES
    ('marla_225', 'LDA Standard (225 sqft)', 225, 'Standard used in Lahore, Islamabad, Rawalpindi, and Punjab societies', true),
    ('marla_250', '250 sqft Standard', 250, 'Standard used in traditional rural registries and parts of KP', false),
    ('marla_240', 'Sindh/Karachi Standard (240 sqft)', 240, 'Equivalent to ~26.6 sq yards, standard in parts of Sindh', false),
    ('marla_272', 'Revenue / Patwari Standard (272.25 sqft)', 272.25, 'Official revenue land measurement standard (Karam-based)', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO material_categories (id, key, name, description, sort_order) VALUES
    ('cat_civil', 'civil', 'Civil & Structural Materials', 'Foundation, RCC, Cement, Sand, Crush, and Steel', 1),
    ('cat_masonry', 'masonry', 'Masonry & Bricks', 'Bricks, Blocks, and Mortar', 2),
    ('cat_finishing', 'finishing', 'Finishing & Surfaces', 'Tiles, Plaster, Paint, and Flooring', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO materials (id, category_id, name, code, specification, brand, unit, default_wastage_percent) VALUES
    ('mat_cement', 'cat_civil', 'Ordinary Portland Cement (50kg Bag)', 'CEM-OPC', 'Grade 43/53 Portland Cement', 'Fauji / Bestway / Maple Leaf / Lucky', 'bag', 5),
    ('mat_steel_grade60', 'cat_civil', 'Deformed Steel Rebar Grade 60', 'STL-G60', 'ASTM A615 Grade 60 Rebar', 'Mughal / Amreli / Ittefaq / Agha', 'kg', 4),
    ('mat_bricks_first_class', 'cat_masonry', 'Clay Bricks (Awwal Quality)', 'BRK-AWW', '9" x 4.5" x 3" Kiln Burned First Class', 'Local Kiln (Bhatta)', 'piece', 5),
    ('mat_sand_chenab', 'cat_civil', 'Chenab River Coarse Sand (Reti)', 'SND-CHB', 'Screened river sand for RCC & plaster', 'Chenab Riverbed', 'cft', 5),
    ('mat_crush_margalla', 'cat_civil', 'Margalla / Sargodha Crush (Bajri)', 'CRS-MAR', '1/2" to 3/4" graded crushed stone', 'Margalla / Sargodha Quarries', 'cft', 5)
ON CONFLICT (id) DO NOTHING;

-- Initial Benchmark Rates (Islamabad)
INSERT INTO material_rates (material_id, city_id, rate, currency, source_name) VALUES
    ('mat_cement', 'isb', 1450, 'PKR', 'Rawalpindi/Islamabad Market Survey'),
    ('mat_steel_grade60', 'isb', 260, 'PKR', 'Steel Mills Association Benchmark'),
    ('mat_bricks_first_class', 'isb', 14, 'PKR', 'Islamabad Bhatta Association'),
    ('mat_sand_chenab', 'isb', 45, 'PKR', 'Quarry Freight Benchmark'),
    ('mat_crush_margalla', 'isb', 65, 'PKR', 'Margalla Quarry Association')
ON CONFLICT (material_id, city_id) DO UPDATE SET rate = EXCLUDED.rate;
