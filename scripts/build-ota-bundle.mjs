#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const assetsWwwDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'www');
const outDir = path.join(rootDir, 'apps', 'web', 'out');
const sourceDir = fs.existsSync(assetsWwwDir) ? assetsWwwDir : outDir;
const otaZip = path.join(rootDir, 'buildcost-ota-latest.zip');
const versionedZip = path.join(rootDir, 'buildcost-ota-v1.3.0.zip');

console.log('===============================================================');
console.log('⚡ BuildCost Connect — Over-The-Air (OTA) Hot-Patch Packager');
console.log('===============================================================\n');

console.log(`Packaging OTA assets from: ${sourceDir}`);

// 2. Package into zip archive using PowerShell Compress-Archive
console.log('\nSTEP 2: Compressing web assets into OTA bundle archive...');
if (fs.existsSync(otaZip)) fs.unlinkSync(otaZip);
if (fs.existsSync(versionedZip)) fs.unlinkSync(versionedZip);

const psCommand = `Compress-Archive -Path '${sourceDir}\\*' -DestinationPath '${otaZip}' -Force`;
execSync(`powershell.exe -NoProfile -Command "${psCommand}"`, {
  cwd: rootDir,
  stdio: 'inherit'
});

fs.copyFileSync(otaZip, versionedZip);

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
