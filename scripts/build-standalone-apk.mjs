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

// Step 2: Build Android Release APK with Gradle
console.log('\nSTEP 2: Building native Android APK via Gradle assembleRelease...');
const tempBuildDir = path.join(os.tmpdir(), 'buildcost-android', 'app', 'outputs', 'apk', 'release', 'app-release.apk');

execSync(`powershell.exe -Command "$env:JAVA_HOME = '${javaHome}'; $env:ANDROID_HOME = '${androidHome}'; & '${gradleBat}' assembleRelease --no-daemon"`, {
  cwd: androidDir,
  stdio: 'inherit'
});

if (!fs.existsSync(tempBuildDir)) {
  throw new Error(`Compiled APK not found at expected location: ${tempBuildDir}`);
}

// Step 3: Copy to project root
const versionedApkName = 'BuildCost-PK-v1.3.0-offline.apk';
const genericApkName = 'BuildCost-PK.apk';
const targetVersionedApk = path.join(rootDir, versionedApkName);
const targetGenericApk = path.join(rootDir, genericApkName);

fs.copyFileSync(tempBuildDir, targetVersionedApk);
fs.copyFileSync(tempBuildDir, targetGenericApk);

const stats = fs.statSync(targetVersionedApk);
const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

console.log('\n===============================================================');
console.log('🎉 STANDALONE OFFLINE APK BUILT SUCCESSFULLY!');
console.log('===============================================================');
console.log(`📁 Primary File: ${targetVersionedApk}`);
console.log(`📁 Standard File: ${targetGenericApk}`);
console.log(`📊 Size: ${sizeMb} MB (${stats.size.toLocaleString()} bytes)`);
console.log(`📦 Architecture: 100% Self-Contained Local Assets (No Web URL dependency)`);
console.log(`🚀 Ready to transfer and install directly on any Android phone!\n`);
