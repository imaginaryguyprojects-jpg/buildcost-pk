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
