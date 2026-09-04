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
