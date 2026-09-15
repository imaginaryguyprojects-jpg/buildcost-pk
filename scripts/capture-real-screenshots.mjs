import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const outDir = path.join(rootDir, 'apps', 'web', 'out');
const screenshotDir = path.join(rootDir, 'Build app picture folder', 'screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  
  let filePath = path.join(outDir, reqPath);
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
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const indexPath = path.join(outDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexPath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  }
});

const PORT = 4321;
server.listen(PORT, async () => {
  console.log(`Local web server running at http://localhost:${PORT}`);

  const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  console.log(`Using browser: ${chromePath}`);

  const pagesToCapture = [
    { url: `http://localhost:${PORT}/dashboard`, name: '1_real_dashboard_overview.png' },
    { url: `http://localhost:${PORT}/calculator/house-estimate`, name: '2_real_construction_calculator.png' },
    { url: `http://localhost:${PORT}/rates/materials`, name: '3_real_live_material_rates.png' },
    { url: `http://localhost:${PORT}/boq`, name: '4_real_boq_cost_breakdown.png' },
    { url: `http://localhost:${PORT}/layouts`, name: '5_real_architectural_layouts.png' },
    { url: `http://localhost:${PORT}/pricing`, name: '6_real_pro_plans_pricing.png' },
  ];

  for (const page of pagesToCapture) {
    const outputPath = path.join(screenshotDir, page.name);
    console.log(`Capturing: ${page.url} -> ${page.name}...`);
    try {
      const cmd = `"${chromePath}" --headless=new --disable-gpu --hide-scrollbars --window-size=1080,2400 --virtual-time-budget=6000 --screenshot="${outputPath}" "${page.url}"`;
      execSync(cmd, { stdio: 'ignore' });
      console.log(`✓ Saved ${page.name} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
    } catch (e) {
      console.error(`Failed to capture ${page.name}:`, e.message);
    }
  }

  server.close(() => {
    console.log('\nAll real screenshots captured successfully in "Build app picture folder/screenshots"!');
    process.exit(0);
  });
});
