-- ==============================================================================
-- BuildCost Connect - Database Migration 20260915000001
-- Auto-Create User Profile & Handle OAuth / Email User Synchronization
-- Pakistan Construction Cost Intelligence Platform
-- ==============================================================================

-- 1. Create or replace the handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name TEXT;
    v_phone TEXT;
    v_company TEXT;
    v_city_id TEXT;
    v_role TEXT := 'user';
    v_is_pro BOOLEAN := FALSE;
BEGIN
    -- Extract full name from raw_user_meta_data (Google OAuth or email signup)
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(COALESCE(NEW.email, 'User'), '@', 1)
    );

    -- Extract phone and company if provided
    v_phone := NEW.raw_user_meta_data->>'phone';
    v_company := NEW.raw_user_meta_data->>'company';
    v_city_id := COALESCE(NEW.raw_user_meta_data->>'city_id', 'isb');

    -- Auto-grant superadmin role and PRO access to whitelisted admin emails
    IF LOWER(TRIM(COALESCE(NEW.email, ''))) IN (
        'imaginary.guy.project@gmail.com',
        'umershahzad0@gmail.com'
    ) THEN
        v_role := 'superadmin';
        v_is_pro := TRUE;
    END IF;

    -- Insert into public.profiles
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        phone,
        company_name,
        city_id,
        role,
        is_pro,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        v_full_name,
        v_phone,
        v_company,
        v_city_id,
        v_role,
        v_is_pro,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(profiles.full_name, ''), EXCLUDED.full_name),
        updated_at = NOW();

    -- Also insert default user_settings if not exists
    INSERT INTO public.user_settings (
        user_id,
        theme,
        preferred_currency,
        preferred_area_unit,
        preferred_marla_standard_id,
        default_city_id,
        language,
        notify_on_rate_change,
        updated_at
    ) VALUES (
        NEW.id,
        'dark',
        'PKR',
        'marla',
        'marla_225',
        v_city_id,
        'en',
        TRUE,
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill any existing auth users who might be missing profiles
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    is_pro,
    created_at,
    updated_at
)
SELECT 
    u.id,
    COALESCE(u.email, ''),
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(COALESCE(u.email, 'User'), '@', 1)),
    CASE 
        WHEN LOWER(TRIM(COALESCE(u.email, ''))) IN ('imaginary.guy.project@gmail.com', 'umershahzad0@gmail.com') THEN 'superadmin'
        ELSE 'user'
    END,
    CASE 
        WHEN LOWER(TRIM(COALESCE(u.email, ''))) IN ('imaginary.guy.project@gmail.com', 'umershahzad0@gmail.com') THEN TRUE
        ELSE FALSE
    END,
    u.created_at,
    NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
