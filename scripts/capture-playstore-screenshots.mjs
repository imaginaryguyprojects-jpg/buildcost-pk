import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

const rootDir = process.cwd();
const targetDir = path.join(rootDir, 'Build app picture folder');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function captureScreenshots() {
  console.log('================================================================');
  console.log('📸 Automated Play Store Screenshot Capturer (1080 x 1920 px)');
  console.log('================================================================\n');

  const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  console.log(`Using Chrome binary: ${chromePath}`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=1080,1920'
    ]
  });

  const page = await browser.newPage();

  // Exactly 1080 x 1920 px viewport (540 x 960 with deviceScaleFactor: 2)
  await page.setViewport({
    width: 540,
    height: 960,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  // Automatically dismiss PWA banner on document creation
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('pwa_install_dismissed', 'true');
    localStorage.setItem('pwa_install_dismissed', 'true');
  });

  const targetUrl = 'https://buildcost-pk-web.vercel.app';
  console.log(`Navigating to live app: ${targetUrl}...`);

  await page.goto(targetUrl, {
    waitUntil: 'networkidle2',
    timeout: 45000
  });

  // Inject CSS to dismiss any floating PWA prompt or modal dialog
  await page.addStyleTag({
    content: `
      [data-pwa-prompt], .pwa-banner, div[role="dialog"] { display: none !important; }
      .fixed.bottom-0 { display: none !important; }
    `
  });

  await new Promise((r) => setTimeout(r, 2000));

  // Configure Rawalpindi (rwp) and 10 Marla
  console.log('Setting City to Rawalpindi (rwp) and Plot to 10 Marla...');
  await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select'));
    // Select City -> rwp
    for (const sel of selects) {
      const hasRwp = Array.from(sel.options).some((o) => o.value === 'rwp');
      if (hasRwp) {
        sel.value = 'rwp';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
      // Select Plot Size -> 10
      const has10 = Array.from(sel.options).some((o) => o.value === '10');
      if (has10) {
        sel.value = '10';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });

  await new Promise((r) => setTimeout(r, 1500));

  const screenshots = [
    {
      name: 'screenshot_5_dashboard.png',
      description: '5. Dashboard overview & Property Calculator banner',
      scroll: async () => {
        await page.evaluate(() => window.scrollTo(0, 0));
        await new Promise((r) => setTimeout(r, 600));
      }
    },
    {
      name: 'screenshot_1_calculator.png',
      description: '1. Basic Calculator (10 Marla, Rawalpindi, Total Estimate Rs. 9,571,746)',
      scroll: async () => {
        await page.evaluate(() => window.scrollTo(0, 1120));
        await new Promise((r) => setTimeout(r, 600));
      }
    },
    {
      name: 'screenshot_2_breakdown.png',
      description: '2. Material Breakdown (Donut chart & cost percentages for Cement, Steel, Bricks, Labour)',
      scroll: async () => {
        await page.evaluate(() => window.scrollTo(0, 1600));
        await new Promise((r) => setTimeout(r, 600));
      }
    },
    {
      name: 'screenshot_4_pro_features.png',
      description: '4. Exact Construction Calculation / PRO Features (Wall Height, Foundation Depth)',
      scroll: async () => {
        await page.evaluate(() => window.scrollTo(0, 220));
        await new Promise((r) => setTimeout(r, 600));
      }
    },
    {
      name: 'screenshot_3_structure.png',
      description: '3. Grey Structure Cost Breakdown (Brick Masonry, Plastering, RCC, Foundations)',
      scroll: async () => {
        await page.evaluate(() => window.scrollTo(0, 6180));
        await new Promise((r) => setTimeout(r, 600));
      }
    }
  ];

  for (const item of screenshots) {
    console.log(`\nCapturing ${item.description}...`);
    await item.scroll();
    const filePath = path.join(targetDir, item.name);
    await page.screenshot({
      path: filePath,
      type: 'png'
    });

    // Verify PNG dimensions
    const buf = fs.readFileSync(filePath);
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    const stats = fs.statSync(filePath);
    const sizeKb = (stats.size / 1024).toFixed(1);

    console.log(`✓ Saved: ${item.name}`);
    console.log(`  Path: ${filePath}`);
    console.log(`  Dimensions: ${width} x ${height} px`);
    console.log(`  Size: ${sizeKb} KB`);

    if (width !== 1080 || height !== 1920) {
      throw new Error(`Unexpected image dimensions: ${width}x${height} (expected 1080x1920)`);
    }
  }

  await browser.close();
  console.log('\n================================================================');
  console.log('🎉 ALL 5 SCREENSHOTS CAPTURED & VERIFIED AT EXACTLY 1080x1920 PX!');
  console.log('================================================================\n');
}

captureScreenshots().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
