-- ============================================================
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
