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
