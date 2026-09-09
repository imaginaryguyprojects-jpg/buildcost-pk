# BuildCost Pakistan — Continuous Deployment & Vercel Architecture Guide

## 1. Overview & Source of Truth

**GitHub Repository**: [`imaginaryguyprojects-jpg/buildcost-pk`](https://github.com/imaginaryguyprojects-jpg/buildcost-pk.git)  
**Production Branch**: `main`  
**Hosting & Edge Network**: Vercel (Next.js 15 Monorepo Engine)  
**Database & Auth**: Supabase Cloud  

The GitHub repository is the **Single Source of Truth** for all application code. All production releases originate from code committed and merged into `main`.

---

## 2. Professional Deployment Lifecycle

```
Local Development / Antigravity
            ↓
  Feature Branch (`feature/<name>`)
            ↓
  Local Verification (`pnpm typecheck && pnpm lint && pnpm test && pnpm build`)
            ↓
  Git Commit & Push to GitHub
            ↓
  GitHub Actions CI Quality Gate (`.github/workflows/ci.yml`)
            ↓
  Vercel Preview Deployment (Ephemeral testing environment)
            ↓
  Peer / Owner Review & QA Approval
            ↓
  Pull Request Merged into `main`
            ↓
  Vercel Production Deployment (Instant Zero-Downtime Live Release)
            ↓
  Live Site: https://buildcost-pk.vercel.app
```

---

## 3. Step-by-Step Developer & Release Workflow

### Step 1: Create a Feature Branch
Never push experimental or unreviewed code directly to `main`.
```bash
git checkout main
git pull origin main
git checkout -b feature/dashboard-simplification
```

### Step 2: Implement Changes
Write clean, modular code conforming to TypeScript and project conventions.

### Step 3: Local Quality Gate (Must Pass 100%)
Run the 4 quality checks before committing:
```bash
# 1. Typecheck entire monorepo
pnpm typecheck

# 2. Run ESLint across workspace
pnpm lint

# 3. Run pure calculation and unit tests (Vitest)
pnpm test

# 4. Run Next.js production build
pnpm build
```

### Step 4: Commit with Conventional Commit Style
```bash
git add .
git commit -m "feat(calculator): add custom marla standard overrides"
```

### Step 5: Push Feature Branch to GitHub
```bash
git push -u origin feature/dashboard-simplification
```

### Step 6: Vercel Preview Deployment
Vercel Git Integration automatically detects the new branch and creates an isolated Preview Deployment with a unique URL (e.g. `https://buildcost-pk-git-feature-...vercel.app`).

### Step 7: Open a Pull Request (PR)
On GitHub, open a Pull Request from `feature/dashboard-simplification` into `main`.
GitHub Actions will automatically run the CI Quality Gate (`.github/workflows/ci.yml`).

### Step 8: Review & Merge to `main`
Once the CI checks pass and the preview deployment is verified, squash and merge the PR into `main`.

### Step 9: Automatic Vercel Production Deployment
Upon merge to `main`, Vercel immediately triggers a Production Deployment. The live production domain updates with zero downtime.

---

## 4. Environment Variables Specification

All environment variables must be configured in the **Vercel Project Dashboard** under **Settings → Environment Variables**:

| Variable Name | Environment | Description | Example / Note |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Dev | Supabase API endpoint | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Dev | Client-safe anonymous key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Production (Secret) | Server-side elevated key | **Never** expose to client |
| `NEXT_PUBLIC_APP_URL` | Production | Live production domain | `https://buildcost-pk.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | Production, Preview, Dev | Brand name string | `BuildCost Connect - Property Calculator 2.0` |
| `SUPER_ADMIN_EMAILS` | Production, Preview | Super Admin accounts | `admin@buildcost.pk,hayyat@gmail.com` |
| `NEXT_PUBLIC_SUPPORT_WHATSAPP` | Production, Preview | Business WhatsApp | `+92 300 0000000` |

> [!CAUTION]
> Never commit `.env.local` or any file containing real API keys or service role keys to GitHub. `.env.local` is strictly ignored by `.gitignore`.

---

## 5. Dependency & Build Configuration

### Deterministic pnpm Configuration
To ensure clean CI installs without `ERR_PNPM_IGNORED_BUILDS`:
- Root `.npmrc` contains:
  ```ini
  ignored-built-dependencies[]=unrs-resolver
  only-built-dependencies[]=core-js
  only-built-dependencies[]=esbuild
  ```
- Root `pnpm-workspace.yaml` mirrors these settings so pnpm 10 and 11 environments build deterministically.

### Vercel Project Settings (Dashboard)
- **Framework Preset**: Next.js
- **Root Directory**: `.` (Monorepo root)
- **Build Command**: `pnpm exec turbo run build --filter=web...` (configured in `vercel.json`)
- **Output Directory**: `apps/web/.next`
- **Install Command**: `pnpm install`
- **Node.js Version**: `20.x`

---

## 6. Troubleshooting Guide

### 1. Vercel Build Fails: `[ERR_PNPM_IGNORED_BUILDS]`
- **Cause**: pnpm requires build approval for dependencies with build scripts.
- **Fix**: The repository already includes `.npmrc` and `pnpm-workspace.yaml` declaring `ignored-built-dependencies[]=unrs-resolver` and `only-built-dependencies[]=core-js,esbuild`. Ensure these files are committed to git.

### 2. Vercel Build Fails: Missing Directory or 404 Output
- **Cause**: Vercel configured to root instead of `apps/web` or vice-versa.
- **Fix**: Both root `vercel.json` and `apps/web/vercel.json` are present in the repository, making it compatible whether Vercel Root Directory is set to `.` or `apps/web`.

### 3. Missing Environment Variables at Runtime
- **Symptom**: Supabase client shows connection error or authentication fails.
- **Fix**: Check Vercel Project Settings → Environment Variables. Ensure both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are checked for **Production** and **Preview**.

### 4. Git Push Fails
- **Symptom**: `Updates were rejected because the remote contains work that you do not have locally`.
- **Fix**: Run `git pull --rebase origin main` before pushing.

### 5. Rollback Procedure
If a production deployment causes unexpected regressions:
1. Open **Vercel Dashboard → Deployments**.
2. Locate the previous successful deployment.
3. Click the three dots `...` and select **Promote to Production**.
4. Vercel instantly routes 100% of live traffic back to the known-good release in seconds.
