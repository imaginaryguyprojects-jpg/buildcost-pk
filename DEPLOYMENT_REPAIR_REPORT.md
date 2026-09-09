# 🛠️ DEPLOYMENT REPAIR REPORT — VERCEL PRODUCTION BUILD

**Project**: BuildCost Pakistan (`buildcost-pk-web` / `buildcost-connect`)  
**Deployment Target**: Vercel Production  
**Final Status**: 🟡 **LOCAL BUILD FIXED BUT VERCEL NOT YET VERIFIED**

---

## 1. Original Error

During Vercel CI deployment:
```text
[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: unrs-resolver@1.12.2
Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.
Error: Command "pnpm install" exited with 1
```

---

## 2. Exact Dependency Chain for `unrs-resolver`

```text
buildcost-pk-web (apps/web)
└─┬ devDependencies
  └─┬ eslint-config-next@16.3.4
    └─┬ eslint-import-resolver-typescript@3.10.1
      └── unrs-resolver@1.12.2
```

- **Module Nature**: Rust-based TypeScript path resolver for ESLint.
- **Why it triggered an error**: Its `package.json` specifies `"scripts": { "postinstall": "node postinstall.js" }` utilizing `napi-postinstall`.
- **Runtime Requirement**: None. It is strictly a linting tool sub-dependency; neither Next.js runtime nor the production compilation requires running its postinstall script (prebuilt platform binaries are already provided as optional dependencies).

---

## 3. Package Manager & Node Versions

- **pnpm Version**: `11.25.0` (pinned via `"packageManager": "pnpm@11.25.0"` in root `package.json`).
- **Node.js Requirement**: `>=20.18.0` (enforced via `"engines": { "node": ">=20.18.0" }`). Tested locally on Node.js `24.19.0`.
- **Next.js Version**: `15.5.25` (specifier `^15.1.7`).
- **React Version**: `19.2.8` (specifier `^19.0.0`).

---

## 4. Root Cause

1. **pnpm Strict Build Security**:
   - Starting in pnpm v10 and v11, lifecycle scripts (`postinstall`, `install`) are blocked by default. In non-interactive CI environments (such as Vercel), `strictDepBuilds` defaults to `true`.
2. **The Version Support Mismatch on Vercel**:
   - Vercel's build image automatically detects pnpm from `pnpm-lock.yaml` (v9 lockfile) and may run pnpm v10 by default unless Corepack is explicitly enabled.
   - pnpm v10 uses `onlyBuiltDependencies` and `ignoredBuiltDependencies`. It does not recognize pnpm v11's `allowBuilds` property.
   - When only `allowBuilds: unrs-resolver: true` was present in `pnpm-workspace.yaml`, pnpm v10 ignored it and still failed with `[ERR_PNPM_IGNORED_BUILDS]`.
3. **Unnecessary Build Script Execution**:
   - `unrs-resolver` does not need to execute its postinstall script because platform-specific binaries are bundled as optional dependencies.

---

## 5. Configuration Changed

To guarantee full cross-version compatibility whether Vercel runs pnpm 10 or pnpm 11:

### A. `pnpm-workspace.yaml`
```yaml
packages:
  - 'apps/*'
  - 'packages/*'

onlyBuiltDependencies:
  - core-js
  - esbuild

ignoredBuiltDependencies:
  - unrs-resolver

allowBuilds:
  core-js: true
  esbuild: true
  unrs-resolver: false
```

### B. `.npmrc` (Root Level)
```ini
ignored-built-dependencies[]=unrs-resolver
only-built-dependencies[]=core-js
only-built-dependencies[]=esbuild
```

### C. `package.json` (Root Level)
```json
  "packageManager": "pnpm@11.25.0",
  "engines": {
    "node": ">=20.18.0"
  },
  "pnpm": {
    "onlyBuiltDependencies": [
      "core-js",
      "esbuild"
    ],
    "ignoredBuiltDependencies": [
      "unrs-resolver"
    ]
  }
```

---

## 6. Why `ignoredBuiltDependencies` Was Selected

- **Security & Integrity**: We do not disable lifecycle security globally (`ignore-scripts=false` is maintained).
- **Execution Necessity**: `unrs-resolver` has zero role in the Next.js runtime or production build. Executing arbitrary third-party native postinstall scripts in CI is unnecessary and undesirable.
- **Deterministic CI**: Adding `unrs-resolver` to `ignoredBuiltDependencies` explicitly instructs pnpm that skipping this script is deliberate and expected, avoiding `ERR_PNPM_IGNORED_BUILDS` without interactive approval.

---

## 7. Verification Results

| Step | Command | Result |
|---|---|---|
| **Clean Install** | `pnpm install --frozen-lockfile` | 🟢 Exit code 0, 0 errors, no build script block |
| **Forced Reinstall** | `pnpm install --force` | 🟢 Exit code 0, all workspace packages up to date |
| **TypeScript Typecheck** | `pnpm -r exec tsc --noEmit` | 🟢 Exit code 0, 0 type errors across all packages |
| **Linter** | `pnpm lint` | 🟢 Exit code 0, 0 ESLint errors |
| **Test Suite** | `pnpm test` | 🟢 Exit code 0, 57/57 tests passing |
| **Production Build** | `pnpm build` (`next build`) | 🟢 Exit code 0, 70/70 static pages + dynamic API routes optimized |

---

## 8. Git Commit & Deployment Instructions

All changes are staged and committed to branch `main`.

Run the following command in your terminal to push the latest commit:
```bash
git push origin main
```

### Vercel Verification Checklist:
1. Verify that Vercel begins building the latest commit.
2. Ensure the build log shows `pnpm install` completing with code 0 (no `ERR_PNPM_IGNORED_BUILDS`).
3. Verify that Next.js completes static generation and deploys successfully.
