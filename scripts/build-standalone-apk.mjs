#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const rootDir = process.cwd();
const androidDir = path.join(rootDir, 'android');
const gradleBat = 'C:\\Users\\umers\\.gradle\\wrapper\\dists\\gradle-8.11.1-all\\2qik7nd48slq1ooc2496ixf4i\\gradle-8.11.1\\bin\\gradle.bat';
const javaHome = 'C:\\Program Files\\Android\\Android Studio\\jbr';
const androidHome = path.join(process.env.LOCALAPPDATA || 'C:\\Users\\umers\\AppData\\Local', 'Android', 'Sdk');

console.log('===============================================================');
console.log('📱 BuildCost Connect — Offline Standalone APK Generator');
console.log('===============================================================\n');

// Step 1: Build the static bundle and copy into Android assets
console.log('STEP 1: Compiling and bundling offline web assets...');
execSync('node scripts/build-mobile-bundle.mjs', {
  cwd: rootDir,
  stdio: 'inherit'
});

// Step 2: Build Android Release APK & AAB via Gradle
console.log('\nSTEP 2: Building native Android APK & AAB via Gradle...');
const tempApk = path.join(os.tmpdir(), 'buildcost-android', 'app', 'outputs', 'apk', 'release', 'app-release.apk');
const tempAab = path.join(os.tmpdir(), 'buildcost-android', 'app', 'outputs', 'bundle', 'release', 'app-release.aab');

execSync(`powershell.exe -Command "$env:JAVA_HOME = '${javaHome}'; $env:ANDROID_HOME = '${androidHome}'; & '${gradleBat}' assembleRelease bundleRelease --no-daemon"`, {
  cwd: androidDir,
  stdio: 'inherit'
});

if (!fs.existsSync(tempApk)) {
  throw new Error(`Compiled APK not found at expected location: ${tempApk}`);
}

// Step 3: Copy artifacts to project root
const versionedApkName = 'BuildCost-PK-v1.3.0-offline.apk';
const genericApkName = 'BuildCost-PK.apk';
const versionedAabName = 'BuildCost-PK-v1.3.0-release.aab';
const genericAabName = 'BuildCost-PK.aab';

const targetVersionedApk = path.join(rootDir, versionedApkName);
const targetGenericApk = path.join(rootDir, genericApkName);
const targetVersionedAab = path.join(rootDir, versionedAabName);
const targetGenericAab = path.join(rootDir, genericAabName);

fs.copyFileSync(tempApk, targetVersionedApk);
fs.copyFileSync(tempApk, targetGenericApk);

let aabSizeMb = 'N/A';
if (fs.existsSync(tempAab)) {
  fs.copyFileSync(tempAab, targetVersionedAab);
  fs.copyFileSync(tempAab, targetGenericAab);
  const aabStats = fs.statSync(targetVersionedAab);
  aabSizeMb = (aabStats.size / (1024 * 1024)).toFixed(2);
}

const apkStats = fs.statSync(targetVersionedApk);
const apkSizeMb = (apkStats.size / (1024 * 1024)).toFixed(2);

console.log('\n===============================================================');
console.log('🎉 STANDALONE OFFLINE APK & AAB BUILT SUCCESSFULLY!');
console.log('===============================================================');
console.log(`📁 Primary APK: ${targetVersionedApk}`);
console.log(`📁 Standard APK: ${targetGenericApk}`);
console.log(`📊 APK Size: ${apkSizeMb} MB (${apkStats.size.toLocaleString()} bytes)`);
if (fs.existsSync(targetVersionedAab)) {
  console.log(`📁 Play Store AAB: ${targetVersionedAab}`);
  console.log(`📊 AAB Size: ${aabSizeMb} MB`);
}
console.log(`📦 Architecture: 100% Self-Contained Local Assets (No Web URL dependency)`);
console.log(`🚀 Ready to transfer and install directly on any Android phone!\n`);

