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
