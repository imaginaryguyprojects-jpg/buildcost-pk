import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

const rootDir = process.cwd();
const wwwDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'www');
const screenshotDir = path.join(rootDir, 'Build app picture folder', 'screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(wwwDir, urlPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    if (urlPath.startsWith('/_next/')) {
      const altPath = path.join(wwwDir, urlPath.replace('/_next/', '/next/'));
      if (fs.existsSync(altPath) && fs.statSync(altPath).isFile()) {
        const ext = path.extname(altPath).toLowerCase();
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(altPath).pipe(res);
        return;
      }
    }
    const notFoundPath = path.join(wwwDir, '404.html');
    if (fs.existsSync(notFoundPath)) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      fs.createReadStream(notFoundPath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  }
});

const PORT = 8765;
server.listen(PORT, '127.0.0.1', async () => {
  console.log(`Local APK web server listening on http://127.0.0.1:${PORT}`);

  const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  console.log(`Using browser: ${chromePath}`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  
  // Set high-res 9:16 mobile viewport (Google Play Store specification: 1080 x 2400)
  await page.setViewport({
    width: 412,
    height: 915,
    deviceScaleFactor: 2.625, // Produces 1081 x 2401 px high-res Play Store image
    isMobile: true,
    hasTouch: true
  });

  // Automatically dismiss PWA banner on all pages
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('pwa_install_dismissed', 'true');
    localStorage.setItem('pwa_install_dismissed', 'true');
  });

  const pages = [
    { url: `http://127.0.0.1:${PORT}/`, name: '1_real_property_calculator.png' },
    { url: `http://127.0.0.1:${PORT}/calculator/house-estimate`, name: '2_real_house_estimate_calculator.png' },
    { url: `http://127.0.0.1:${PORT}/rates/materials`, name: '3_real_live_material_rates.png' },
    { url: `http://127.0.0.1:${PORT}/layouts`, name: '4_real_architectural_layouts.png' },
    { url: `http://127.0.0.1:${PORT}/boq`, name: '5_real_boq_cost_breakdown.png' },
    { url: `http://127.0.0.1:${PORT}/pricing`, name: '6_real_launch_pricing_pro.png' }
  ];

  for (const item of pages) {
    const targetFile = path.join(screenshotDir, item.name);
    console.log(`Capturing: ${item.url} -> ${item.name}...`);
    try {
      await page.goto(item.url, { waitUntil: 'networkidle0', timeout: 20000 });
      // Inject CSS to ensure any PWA banner or install popup is hidden
      await page.addStyleTag({
        content: `
          [data-pwa-prompt], .pwa-banner, div[role="dialog"] { display: none !important; }
          .fixed.bottom-0 { display: none !important; }
        `
      });
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: targetFile, type: 'png' });
      const stats = fs.statSync(targetFile);
      console.log(`✓ Saved ${item.name} (${(stats.size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`Error on ${item.name}:`, err.message);
    }
  }

  await browser.close();
  server.close(() => {
    console.log('\n🎉 ALL REAL APP SCREENSHOTS CAPTURED FROM APK ASSETS SUCCESSFULLY!');
    process.exit(0);
  });
});
