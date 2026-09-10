-- Migration: 20260910000001_v2_1_release_and_ota.sql
-- Description: Update app_releases table to v2.1.0 (Build 6) with Remote Photo Timeline, WhatsApp Order Slips, AI Fraud Prevention & Voice Diary

INSERT INTO public.app_releases (
    platform,
    latest_version,
    latest_version_code,
    minimum_version_code,
    mandatory_update,
    ota_available,
    ota_bundle_url,
    ota_channel,
    apk_download_url,
    release_notes,
    updated_at
) VALUES (
    'android',
    '2.1.0',
    6,
    5,
    false,
    true,
    'https://github.com/imaginaryguyprojects-jpg/buildcost-pk/releases/download/v2.1.0/buildcost-ota-latest.zip',
    'production',
    'https://github.com/imaginaryguyprojects-jpg/buildcost-pk/releases/download/v2.1.0/BuildCost-PK-v2.1.0-offline.apk',
    '⚡ BuildCost Connect v2.1.0 Major Update:
• Remote Site Photo Timeline with Live GPS Coordinates & Timestamp Watermark for Overseas Pakistanis
• 1-Click WhatsApp Material Order Slips with Pakistani Vendor Presets (Cement, 60-Grade Sariya, Sand, Bajri, Bricks)
• AI Construction Advisor & Fraud Prevention Chatbot (60-Grade Sariya verification, Cement fresh checks, Pre-slab checklists)
• Voice Note Site Diary with Urdu / Roman Urdu mic dictation & auto-parsing
• Background OTA live auto-update.',
    NOW()
)
ON CONFLICT (platform) DO UPDATE SET 
    latest_version = EXCLUDED.latest_version,
    latest_version_code = EXCLUDED.latest_version_code,
    minimum_version_code = EXCLUDED.minimum_version_code,
    mandatory_update = EXCLUDED.mandatory_update,
    ota_available = EXCLUDED.ota_available,
    ota_bundle_url = EXCLUDED.ota_bundle_url,
    apk_download_url = EXCLUDED.apk_download_url,
    release_notes = EXCLUDED.release_notes,
    updated_at = NOW();
