#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const rootDir = process.cwd();
const webDir = path.join(rootDir, 'apps', 'web');
const apiDir = path.join(webDir, 'src', 'app', 'api');
const tempApiStash = path.join(os.tmpdir(), 'buildcost-api-stash-' + Date.now());
const outDir = path.join(webDir, 'out');
const androidAssetsWwwDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'www');

console.log('====================================================');
console.log('📦 BuildCost Connect — Offline Mobile Bundle Builder');
console.log('====================================================\n');

function copyFolderRecursive(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyFolderRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function safeRemove(targetPath) {
  for (let i = 0; i < 5; i++) {
    try {
      if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      }
      return;
    } catch (e) {
      execSync('powershell -Command "Start-Sleep -Milliseconds 500"');
    }
  }
  // Fallback to powershell forced remove
  try {
    execSync(`powershell -Command "Remove-Item -LiteralPath '${targetPath}' -Recurse -Force -ErrorAction SilentlyContinue"`);
  } catch (_) {}
}

let stashed = false;

try {
  // 1. Back up api/ to temp directory outside OneDrive
  if (fs.existsSync(apiDir)) {
    console.log('1. Stashing server Route Handlers to temp directory...');
    copyFolderRecursive(apiDir, tempApiStash);
    safeRemove(apiDir);
    stashed = true;
    console.log('✓ Stashed server routes for static compilation.');
  }

  // Clean stale build cache
  const nextCache = path.join(webDir, '.next');
  console.log('Cleaning prior build caches...');
  safeRemove(nextCache);
  safeRemove(outDir);

  // 2. Execute Next.js static export with BUILD_TARGET=mobile
  console.log('\n2. Compiling Next.js client bundle with static export (BUILD_TARGET=mobile)...');
  execSync('cmd.exe /c "pnpm.cmd --filter web build"', {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      BUILD_TARGET: 'mobile',
      NEXT_PUBLIC_IS_MOBILE: 'true'
    }
  });

  if (!fs.existsSync(outDir)) {
    throw new Error(`Export directory ${outDir} was not generated!`);
  }

  console.log('\n✓ Static export successfully compiled to apps/web/out/');

  // 3. Post-process HTML files: ensure relative CSS and JS paths
  console.log('Normalizing asset links to relative paths in HTML...');
  function normalizeHtmlPaths(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        normalizeHtmlPaths(fullPath);
      } else if (entry.name.endsWith('.html')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        const relativeToRoot = path.relative(dir, outDir);
        const prefix = relativeToRoot ? relativeToRoot.replace(/\\/g, '/') + '/' : './';
        // Convert any root-relative /_next/ to relative prefix
        content = content.replace(/(href|src)=["']\/_next\//g, `$1="${prefix}_next/`);
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
  normalizeHtmlPaths(outDir);

  // 4. Duplicate _next as next to bypass any Android AAPT underscore stripping
  const nextUnderscore = path.join(outDir, '_next');
  const nextPlain = path.join(outDir, 'next');
  if (fs.existsSync(nextUnderscore) && !fs.existsSync(nextPlain)) {
    console.log('Mirroring _next/ to next/ for robust AAPT packaging compatibility...');
    copyFolderRecursive(nextUnderscore, nextPlain);
  }

  // 5. Synchronize to both android assets/www and assets/public
  const androidAssetsPublicDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'public');
  console.log(`\nSynchronizing bundled assets to Android assets (${androidAssetsWwwDir} & ${androidAssetsPublicDir})...`);
  
  safeRemove(androidAssetsWwwDir);
  fs.mkdirSync(androidAssetsWwwDir, { recursive: true });
  copyFolderRecursive(outDir, androidAssetsWwwDir);

  safeRemove(androidAssetsPublicDir);
  fs.mkdirSync(androidAssetsPublicDir, { recursive: true });
  copyFolderRecursive(outDir, androidAssetsPublicDir);

  const copiedFilesCount = fs.readdirSync(androidAssetsWwwDir).length;
  console.log(`✓ Synchronized ${copiedFilesCount} asset directories/files into Android APK assets (www & public).\n`);

} catch (err) {
  console.error('\n❌ Mobile bundle build failed:', err.message);
  process.exitCode = 1;
} finally {
  // Always restore API routes from temp stash
  if (stashed && fs.existsSync(tempApiStash)) {
    console.log('Restoring server Route Handlers from temp stash...');
    safeRemove(apiDir);
    copyFolderRecursive(tempApiStash, apiDir);
    safeRemove(tempApiStash);
    console.log('✓ apps/web/src/app/api restored to original state.');
  }
}
