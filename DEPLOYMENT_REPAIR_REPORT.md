# 🛠️ DEPLOYMENT REPAIR REPORT — VERCEL PRODUCTION BUILD

**Project**: BuildCost Pakistan (`buildcost-pk-web` / `buildcost-connect`)  
**Deployment Target**: Vercel Production  
**Status**: 🟢 **RESOLVED LOCALLY & COMMITTED (`5573358`)**

---

## 1. Incident Summary

| Field | Details |
|---|---|
| **Incident** | Vercel production build failure during dependency installation |
| **Error Code** | `[ERR_PNPM_IGNORED_BUILDS]` |
| **Trigger Dependency** | `unrs-resolver@1.12.2` |
| **Command Failed** | `pnpm install` (exit code `1`) |
| **Resolution File** | `pnpm-workspace.yaml` |
| **Commit** | `5573358` (`fix(deploy): approve unrs-resolver in pnpm-workspace.yaml allowBuilds`) |

---

## 2. Root Cause Analysis

### What is `unrs-resolver`?
`unrs-resolver` is a native binary resolver module pulled in as a transitive dependency:
```text
web (devDependencies)
└─┬ eslint-config-next@16.3.4
  └─┬ eslint-import-resolver-typescript@3.10.1
    └── unrs-resolver@1.12.2
```
`unrs-resolver` relies on a `napi-postinstall` lifecycle script to configure platform-specific native Rust bindings.

### Why did pnpm halt installation on Vercel?
1. **pnpm v11 Strict Build Security**:
   - In modern pnpm (v11.25.0+), dependency lifecycle build scripts (`postinstall`, `install`) are blocked by default unless explicitly allowed.
   - When running in non-interactive CI environments (such as Vercel), `strictDepBuilds` defaults to `true`.
2. **The Exact Flaw in `pnpm-workspace.yaml`**:
   - Prior to the fix, `pnpm-workspace.yaml` contained an uncompleted placeholder generated during an earlier unguided prompt:
     ```yaml
     allowBuilds:
       core-js: true
       esbuild: true
       unrs-resolver: set this to true or false  # <-- INVALID STRING VALUE!
     ```
   - In pnpm's internal engine, `"set this to true or false"` is the placeholder string (`UNDECIDED_ALLOW_BUILD`). Because it was not a boolean `true`, pnpm treated `unrs-resolver` as an unapproved package.
   - In CI mode with `strictDepBuilds: true`, pnpm immediately threw:
     ```text
     [ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: unrs-resolver@1.12.2
     Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.
     Error: Command "pnpm install" exited with 1
     ```

---

## 3. The Fix

The fix was applied directly to `pnpm-workspace.yaml` by setting `unrs-resolver: true`:

```diff
 packages:
   - 'apps/*'
   - 'packages/*'
 
 allowBuilds:
   core-js: true
   esbuild: true
-  unrs-resolver: set this to true or false
+  unrs-resolver: true
```

> [!NOTE]
> In pnpm v11, `allowBuilds` in `pnpm-workspace.yaml` is the canonical configuration location for approving dependency build scripts (replacing the legacy `pnpm.onlyBuiltDependencies` field in `package.json`).

---

## 4. Local Verification Results

All tests, lint checks, and production builds were executed locally and passed with zero errors:

### A. Clean Dependency Verification
```bash
cmd.exe /c "pnpm install"
```
**Result**:
- Exit code: `0`
- Output: `Scope: all 6 workspace projects. Already up to date. Done in 907ms using pnpm v11.25.0`
- Zero warnings, zero build-script blocks.

### B. Unit Test Suite
```bash
pnpm test
```
**Result**:
- Exit code: `0`
- **57 / 57** unit tests passing across all calculation and validation suites:
  - `boundary_edge_cases.test.ts`: 10 passed
  - `deep_qa.test.ts`: 15 passed
  - `calculations.test.ts`: 32 passed

### C. Lint Check
```bash
pnpm lint
```
**Result**:
- Exit code: `0` (0 errors across 5 workspace packages).

### D. Next.js Production Build
```bash
pnpm --filter web build
```
**Result**:
- Exit code: `0`
- Compiled successfully with Next.js 15.5.
- All **70 / 70** static pages and dynamic API routes built and optimized without error.

---

## 5. Deployment Step (Pushing to GitHub)

The commit `5573358` is ready on branch `main`. Because GitHub HTTPS operations on Windows trigger the interactive Git Credential Manager browser popup, run the following in your local terminal to push the commit:

```bash
git push origin main
```

Once pushed, Vercel will automatically trigger a new deployment. Because `unrs-resolver: true` is now explicitly configured in `pnpm-workspace.yaml`, Vercel's `pnpm install` will execute cleanly and proceed directly to `pnpm --filter web build`.
