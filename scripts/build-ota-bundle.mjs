#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const rootDir = process.cwd();
const assetsWwwDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'www');
const outDir = path.join(rootDir, 'apps', 'web', 'out');
const sourceDir = fs.existsSync(outDir) ? outDir : assetsWwwDir;
const otaZip = path.join(rootDir, 'buildcost-ota-latest.zip');
const versionedZip = path.join(rootDir, 'buildcost-ota-v2.1.0.zip');

console.log('===============================================================');
console.log('⚡ BuildCost Connect — Over-The-Air (OTA) Hot-Patch Packager');
console.log('===============================================================\n');

console.log(`Packaging OTA assets from: ${sourceDir}`);

// 1. Stage assets in temp directory to avoid OneDrive file locks
const tempStaging = path.join(os.tmpdir(), 'buildcost-ota-staging-' + Date.now());
const tempZip = path.join(os.tmpdir(), 'buildcost-ota-' + Date.now() + '.zip');

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

try {
  console.log('\nSTEP 1: Staging assets into local OS temporary directory...');
  copyFolderRecursive(sourceDir, tempStaging);

  // 2. Package into zip archive using PowerShell Compress-Archive from tempStaging
  console.log('\nSTEP 2: Compressing web assets into OTA bundle archive...');
  if (fs.existsSync(otaZip)) fs.unlinkSync(otaZip);
  if (fs.existsSync(versionedZip)) fs.unlinkSync(versionedZip);
  if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);

  const psCommand = `Compress-Archive -Path '${tempStaging}\\*' -DestinationPath '${tempZip}' -Force`;
  execSync(`powershell.exe -NoProfile -Command "${psCommand}"`, {
    cwd: os.tmpdir(),
    stdio: 'inherit'
  });

  fs.copyFileSync(tempZip, otaZip);
  fs.copyFileSync(tempZip, versionedZip);

  const stats = fs.statSync(otaZip);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

  console.log('\n===============================================================');
  console.log('🎉 OTA LIVE HOT-PATCH BUNDLE CREATED SUCCESSFULLY!');
  console.log('===============================================================');
  console.log(`📁 Primary Bundle: ${otaZip}`);
  console.log(`📁 Versioned Bundle: ${versionedZip}`);
  console.log(`📊 Bundle Size: ${sizeMb} MB (${stats.size.toLocaleString()} bytes)`);
  console.log('\n📋 Next Steps to Publish Live OTA Patch:');
  console.log('1. Upload "buildcost-ota-latest.zip" to GitHub Releases or Supabase Storage bucket.');
  console.log('2. Update the "ota_bundle_url" column in Supabase table "app_releases" (platform = \'android\').');
  console.log('3. Set "ota_available = true" and increment "latest_version_code".');
  console.log('4. All installed APKs will automatically download and apply the hot-patch in the background!\n');
} finally {
  try {
    if (fs.existsSync(tempStaging)) fs.rmSync(tempStaging, { recursive: true, force: true });
    if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);
  } catch (_) {}
}
