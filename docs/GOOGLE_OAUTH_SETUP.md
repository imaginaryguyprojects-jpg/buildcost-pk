# Google OAuth 2.0 Setup Guide for BuildCost PK

To enable "Continue with Google" sign-in for BuildCost PK on both Web and Android, follow these simple steps to configure Google OAuth in your Supabase Dashboard and Google Cloud Console.

---

## Step 1: Google Cloud Console Configuration

1. Visit [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select your existing project (e.g. `BuildCost PK`).
3. Navigate to **APIs & Services** → **OAuth consent screen**:
   - User Type: **External**
   - App name: **BuildCost PK**
   - User support email: `umershahzad0@gmail.com`
   - Developer contact email: `umershahzad0@gmail.com`
   - Authorized domains: Add `supabase.co` and `vercel.app`
   - Save and continue.
4. Navigate to **APIs & Services** → **Credentials**:
   - Click **Create Credentials** → **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `BuildCost PK Web & Mobile Auth`.
   - **Authorized JavaScript origins**:
     - `https://wxcgpunqnxbezysulkdp.supabase.co`
     - `https://buildcost-pk.vercel.app`
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `https://wxcgpunqnxbezysulkdp.supabase.co/auth/v1/callback`
5. Click **Create**.
6. Copy the **Client ID** and **Client Secret**.

---

## Step 2: Supabase Dashboard Configuration

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/wxcgpunqnxbezysulkdp).
2. In the left navigation, click **Authentication** → **Providers**.
3. Locate **Google** in the providers list and expand it:
   - Toggle **Enable Google provider** to **ON**.
   - **Client ID**: Paste your Client ID from Step 1.
   - **Client Secret**: Paste your Client Secret from Step 1.
   - Click **Save**.
4. In the left navigation, click **Authentication** → **URL Configuration**:
   - **Site URL**: `https://buildcost-pk.vercel.app`
   - **Redirect URLs**: Add the following URLs:
     - `https://buildcost-pk.vercel.app/auth/callback`
     - `https://buildcost-pk.vercel.app/**`
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/**`
     - `capacitor://localhost/auth/callback`
     - `https://localhost/auth/callback`
   - Click **Save**.

---

## Step 3: Run the Database Trigger Migration

In Supabase Dashboard → **SQL Editor**, paste and run the contents of:
`supabase/migrations/20260915000001_auto_create_profile.sql`

This ensures that whenever any user signs up with Google or Email, their profile and default Pakistan construction preferences are automatically created in the database.

---

## Step 4: Verification

1. Open `https://buildcost-pk.vercel.app/login` (or localhost).
2. Click **Continue with Google**.
3. Select your Google account.
4. Google will redirect to `/auth/callback`, which establishes the session and redirects you to `/dashboard`.
