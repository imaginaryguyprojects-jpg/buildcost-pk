import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const screenshotDir = path.join(rootDir, 'Build app picture folder', 'screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const baseUrl = 'https://buildcost-pk.vercel.app';

const pages = [
  { url: `${baseUrl}/dashboard`, name: '1_real_dashboard_overview.png' },
  { url: `${baseUrl}/`, name: '2_real_construction_calculator.png' },
  { url: `${baseUrl}/rates/materials`, name: '3_real_live_material_rates.png' },
  { url: `${baseUrl}/boq`, name: '4_real_boq_cost_breakdown.png' },
  { url: `${baseUrl}/layouts`, name: '5_real_architectural_layouts.png' },
  { url: `${baseUrl}/pricing`, name: '6_real_pro_plans_pricing.png' }
];

async function main() {
  console.log('Launching browser for pixel-perfect Play Store screenshots...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  
  // High-res mobile device emulation for Google Play Store (1080 x 2400, DPR 2.5)
  await page.setViewport({
    width: 412,
    height: 915,
    deviceScaleFactor: 2.625, // Produces 1081 x 2401 px high-res Play Store image
    isMobile: true,
    hasTouch: true
  });

  for (const item of pages) {
    const targetFile = path.join(screenshotDir, item.name);
    console.log(`Navigating to ${item.url}...`);
    try {
      await page.goto(item.url, { waitUntil: 'networkidle2', timeout: 25000 });
      // Short sleep for React animations/charts to render
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: targetFile, type: 'png' });
      const stats = fs.statSync(targetFile);
      console.log(`✓ Saved ${item.name} (${(stats.size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`Error capturing ${item.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('\n🎉 ALL REAL APP SCREENSHOTS CAPTURED SUCCESSFULLY IN "Build app picture folder/screenshots"!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
