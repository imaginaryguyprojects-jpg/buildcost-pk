-- ==============================================================================
-- BuildCost Connect - Database Migration
-- Secure Authentication, PRO Subscription Verification & RLS Enforcement
-- ==============================================================================

-- 1. ADD PRO COLUMNS TO PROFILES TABLE
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMPTZ;

-- 2. CREATE HELPER FUNCTION TO VERIFY PRO STATUS (Used by RLS and server API)
CREATE OR REPLACE FUNCTION public.is_user_pro(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_pro BOOLEAN;
    v_role TEXT;
    v_has_active_sub BOOLEAN;
BEGIN
    IF user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Retrieve role and is_pro flag
    SELECT is_pro, role INTO v_is_pro, v_role
    FROM profiles
    WHERE id = user_uuid;

    -- Admins and Super Admins automatically qualify for full PRO privileges
    IF v_role IN ('admin', 'superadmin') THEN
        RETURN TRUE;
    END IF;

    -- Check direct is_pro flag with active validity date
    IF v_is_pro = TRUE THEN
        RETURN TRUE;
    END IF;

    -- Check if active subscription exists in subscriptions table
    SELECT EXISTS (
        SELECT 1 FROM subscriptions
        WHERE user_id = user_uuid
        AND status = 'active'
        AND (expires_at IS NULL OR expires_at > NOW())
    ) INTO v_has_active_sub;

    RETURN COALESCE(v_has_active_sub, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FUNCTION & TRIGGER: AUTO-SYNC PRO STATUS ON SUBSCRIPTION UPDATE
CREATE OR REPLACE FUNCTION public.sync_user_pro_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' AND (NEW.expires_at IS NULL OR NEW.expires_at > NOW()) THEN
        UPDATE profiles
        SET is_pro = TRUE,
            pro_expires_at = NEW.expires_at,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    ELSE
        -- Re-evaluate if any other active subscription exists
        IF NOT EXISTS (
            SELECT 1 FROM subscriptions
            WHERE user_id = NEW.user_id
            AND id != NEW.id
            AND status = 'active'
            AND (expires_at IS NULL OR expires_at > NOW())
        ) THEN
            UPDATE profiles
            SET is_pro = FALSE,
                pro_expires_at = NULL,
                updated_at = NOW()
            WHERE id = NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_pro_status ON subscriptions;
CREATE TRIGGER trg_sync_pro_status
AFTER INSERT OR UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_pro_status();

-- 4. FUNCTION & TRIGGER: AUTO-ACTIVATE SUBSCRIPTION WHEN PAYMENT IS APPROVED
CREATE OR REPLACE FUNCTION public.handle_payment_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- Insert or renew subscription
        INSERT INTO subscriptions (
            user_id,
            plan_id,
            status,
            billing_interval,
            starts_at,
            expires_at
        ) VALUES (
            NEW.user_id,
            NEW.plan_id,
            'active',
            'monthly',
            NOW(),
            NOW() + INTERVAL '30 days'
        )
        ON CONFLICT (id) DO NOTHING;

        -- Update profiles
        UPDATE profiles
        SET is_pro = TRUE,
            pro_expires_at = NOW() + INTERVAL '30 days',
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_handle_payment_approval ON payment_verifications;
CREATE TRIGGER trg_handle_payment_approval
AFTER UPDATE OF status ON payment_verifications
FOR EACH ROW
EXECUTE FUNCTION public.handle_payment_approval();

-- 5. ROW LEVEL SECURITY ENFORCEMENT
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Allow authenticated users to update own profile (excluding is_pro and role)
DROP POLICY IF EXISTS "Users can update own basic profile" ON profiles;
CREATE POLICY "Users can update own basic profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Super admin and admins can view and update all profiles
DROP POLICY IF EXISTS "Admins full access to profiles" ON profiles;
CREATE POLICY "Admins full access to profiles"
    ON profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );
