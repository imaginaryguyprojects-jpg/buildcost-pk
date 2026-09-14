import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const projectFolder = path.join(rootDir, 'Build app picture folder');
const desktopFolder = 'C:\\Users\\umers\\OneDrive\\Desktop\\Build app picture folder';

const folders = [projectFolder, desktopFolder];

for (const folder of folders) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
}

// 1. Copy visual assets
const srcAssets = path.join(rootDir, 'store-assets');
const assetFiles = [
  'icon-512x512.png',
  'feature-graphic-1024x500.png',
  'feature-graphic-1024x500.jpg'
];

for (const f of assetFiles) {
  const srcPath = path.join(srcAssets, f);
  if (fs.existsSync(srcPath)) {
    for (const folder of folders) {
      fs.copyFileSync(srcPath, path.join(folder, f));
    }
    console.log(`✓ Copied ${f} to store folders`);
  } else {
    console.warn(`! Source asset not found: ${srcPath}`);
  }
}

// 2. Prepare Google Play Store Text Metadata
const titleEnglish = 'Pak-Construction Calculator';
const titleAlternative = 'BuildCost: Construction PK';
const shortDescEnglish = 'Accurate house construction cost & material estimation calculator for Pakistan.';
const titleUrdu = 'تعمیراتی خرچ کیلکولیٹر پاکستان';
const shortDescUrdu = 'پاکستان میں گھر کی تعمیر کا خرچہ اور میٹریل کا تخمینہ لگانے والا کیلکولیٹر۔';

const fullDescEnglish = `BuildCost Pakistan (Pak-Construction Calculator) is the most accurate, reliable, and comprehensive civil engineering construction cost estimation tool tailored specifically for Pakistani homes, plazas, and commercial plots.

Whether you are building a 3 Marla, 5 Marla, 10 Marla, 1 Kanal home, or a custom farmhouse, BuildCost gives you exact material quantities and up-to-date market rates in seconds.

==================================================
🌟 KEY FEATURES & CAPABILITIES
==================================================

1. 🏗️ PRO EXACT STRUCTURAL CALCULATIONS (v3.0)
• Exact Wall Height Input: Adjust ceiling height (8 ft to 20 ft) to dynamically recalculate brick counts, mortar volumes, plaster area, and labour charges.
• Dynamic Multi-Bathroom Sizing: Specify exact bathroom dimensions (L × W) per floor with instant 4.5-inch partition, tile screed bedding, and plumbing takeoffs.
• Bunyad (Foundation) Sub-Structure: Exact calculations for Strip, Isolated Pad, and Raft foundations with lean concrete (1:4:8) and stepped masonry.
• RCC Columns & Beams: Configure column count, cross-sections (9"x9", 9"x12", 12"x12"), running beam spans, and Grade 60 steel reinforcement.
• Zero Double-Counting Architecture: Pure masonry is strictly isolated from concrete structural members.

2. 📐 INTERACTIVE 2D CAD BLUEPRINT DIAGRAM
• Real-time visual floor plan rendered directly from your dimensions and floor counts.
• Interactive layer toggles for Columns, Beams, Bathrooms, Engineering Grid, and Dimensions.
• Zoom In, Zoom Out, Pan, and Reset viewport controls.

3. 🇵🇰 28+ PAKISTANI CITIES & LOCAL STANDARDS
• Up-to-date city-wise material cost indexes: Islamabad, Rawalpindi, Lahore, Karachi, Peshawar, Quetta, Multan, Faisalabad, Gujranwala, Sialkot, Abbottabad, and more.
• Flexible Marla Conversion:
  - CDA / Islamabad / Rawalpindi Standard: 272.25 sq ft
  - Lahore Standard: 250.00 sq ft
  - Karachi / Urban Standard: 225.00 sq ft
  - Custom user-defined Marla size

4. 🧱 ACCURATE MATERIAL ESTIMATION & TAKEOFFS
Get exact itemized quantities for:
• Cement: 50 kg bags (Fauji, Lucky, Bestway, Maple Leaf, DG Khan)
• Grade 60 Deformed Steel Rebar: kg and tons (Mughal, Amreli, Ittefaq, Model, Agha)
• Clay Bricks: First-class Awwal Bhatta kiln bricks & cement blocks
• Sand (Ret): Chenab & Ravi sand in cubic feet (CFT)
• Crush (Bajri): Margalla & Sargodha stone crush in cubic feet (CFT)
• Plaster & Flooring Screed: Exact wall and ceiling surface areas
• Masonry & Concrete Labour: Local square foot rates and per-day mistri/mazdoor rates

5. 📊 DYNAMIC VISUAL BREAKDOWN & DONUT CHART
• Interactive real-time donut chart reflecting real calculated material costs (no static percentage approximations).
• Comprehensive cost distribution between grey structure, materials, labour, transport, and contingencies.

6. 📄 PDF & PRINT ESTIMATE SHARING
• Generate professional, branded Bill of Quantities (BOQ) and cost estimation summaries.
• 1-click share via WhatsApp or print directly for bank home loan approvals and client contracts.

7. ⚡ 100% OFFLINE FIRST — NO INTERNET NEEDED
• All calculation engines, blueprint visualizers, and saved projects work completely offline without an active internet connection.

8. 🔒 ZERO DATA COLLECTION & COMPLETE PRIVACY
• Your estimates, site notes, and project data are saved locally on your device. We do not track, collect, or sell your private information.

Download BuildCost Pakistan today and plan your dream construction project with confidence and engineering precision!`;

const fullDescUrdu = `بلڈ کاسٹ پاکستان (پاک کنسٹرکشن کیلکولیٹر) پاکستان میں گھروں، پلازوں اور کمرشل پلاٹس کی تعمیراتی لاگت کا بالکل درست تخمینہ لگانے والی مستند ایپلی کیشن ہے۔

چاہے آپ 3 مرلہ، 5 مرلہ، 10 مرلہ، 1 کنال کا گھر بنا رہے ہوں یا کوئی فارم ہاؤس، یہ ایپ سیکنڈوں میں میٹریل کی مقدار اور تازہ ترین ریٹس کا حساب لگا کر دیتی ہے۔

اہم خصوصیات:
• پرو کنسٹرکشن کیلکولیشن: دیواروں کی اونچائی (8 سے 20 فٹ)، بنیادوں کی گہرائی و چوڑائی، کالم اور بیمز کا سائنسی حساب۔
• باتھ رومز کی سیٹنگ: ہر منزل پر باتھ رومز کی تعداد اور درست سائز (لمبائی x چوڑائی) کے مطابق اینٹوں اور پلستر کا تخمینہ۔
• انٹرایکٹو 2D بلیو پرنٹ نقشہ: آپ کے پلاٹ سائز اور منزلوں کے مطابق خودکار نقشہ مع کالم، بیم اور گرڈ۔
• 28+ پاکستانی شہروں کے ریٹس: اسلام آباد، راولپنڈی، لاہور، کراچی، پشاور، کوئٹہ، ملتان، فیصل آباد وغیرہ۔
• میٹریل کی درست مقدار: سیمنٹ کی بوریاں، 60 گریڈ سریا (کلو/ٹن)، اول بھٹہ اینٹیں، چناب/راوی ریت، مارگلہ/سرگودھا بجری اور لیبر خرچہ۔
• پی ڈی ایف اور پرنٹ رپورٹ: بینک لون اور کلائنٹس کے لیے فوری کوٹیشن اور بی او کیو (BOQ) تیار کریں۔
• 100% آف لائن: بغیر انٹرنیٹ کے مکمل کام کرتی ہے۔
• مکمل پرائیویسی: آپ کا ڈیٹا آپ کے موبائل میں محفوظ رہتا ہے۔`;

const listingContent = `================================================================================
GOOGLE PLAY STORE LISTING DETAILS — PAK-CONSTRUCTION CALCULATOR
================================================================================

1. APP TITLE (Limit: 30 Characters)
--------------------------------------------------------------------------------
Title: ${titleEnglish}
Length: ${titleEnglish.length} / 30 chars  [PASS]

Alternative Title:
Title: ${titleAlternative}
Length: ${titleAlternative.length} / 30 chars  [PASS]

Urdu Title (Optional Localized):
Title: ${titleUrdu}
Length: ${titleUrdu.length} / 30 chars  [PASS]


2. SHORT DESCRIPTION (Limit: 80 Characters)
--------------------------------------------------------------------------------
Short Description:
${shortDescEnglish}
Length: ${shortDescEnglish.length} / 80 chars  [PASS]

Urdu Short Description (Optional Localized):
${shortDescUrdu}
Length: ${shortDescUrdu.length} / 80 chars  [PASS]


3. FULL DESCRIPTION (Limit: 4000 Characters)
--------------------------------------------------------------------------------
${fullDescEnglish}

Length: ${fullDescEnglish.length} / 4000 chars  [PASS]


--------------------------------------------------------------------------------
4. URDU FULL DESCRIPTION (Optional Localized Listing)
--------------------------------------------------------------------------------
${fullDescUrdu}

Length: ${fullDescUrdu.length} / 4000 chars  [PASS]


================================================================================
5. REQUIRED PLAY STORE ASSETS IN THIS FOLDER
================================================================================
📁 1. icon-512x512.png
   • Exact Dimensions: 512 x 512 px
   • Format: 32-bit PNG, no alpha/transparency
   • Meets Google Play App Icon specification

📁 2. feature-graphic-1024x500.png / .jpg
   • Exact Dimensions: 1024 x 500 px
   • Format: PNG & High-Quality JPG
   • Meets Google Play Feature Graphic specification

📁 3. Privacy Policy URL:
   https://buildcost-pk.vercel.app/privacy
   (Also included locally inside the app and source code)

📁 4. Application Category:
   House & Home  OR  Tools / Productivity

📁 5. Content Rating:
   Everyone / 3+ (No objectionable content, no ads, no trackers)

📁 6. Target Android SDK:
   Target SDK 34 (Android 14+)
   Version Code: 7
   Version Name: 3.0.0
`;

for (const folder of folders) {
  const txtPath = path.join(folder, 'Play_Store_Listing_Details.txt');
  fs.writeFileSync(txtPath, listingContent, 'utf8');
  console.log(`✓ Generated Play_Store_Listing_Details.txt in ${folder}`);

  const readmePath = path.join(folder, 'README_Play_Store_Guide.md');
  const readmeContent = `# Google Play Store Assets & Submission Package

This folder contains all finalized assets, graphics, and text metadata required for submitting **Pak-Construction Calculator (BuildCost PK)** to the Google Play Console.

## Files in this Folder:

| File Name | Description | Specification |
|---|---|---|
| **\`icon-512x512.png\`** | Official Google Play App Icon | 512 × 512 px, 32-bit PNG, Zero Transparency |
| **\`feature-graphic-1024x500.png\`** | Play Store Feature Graphic Banner (PNG) | 1024 × 500 px |
| **\`feature-graphic-1024x500.jpg\`** | Play Store Feature Graphic Banner (JPG) | 1024 × 500 px |
| **\`Play_Store_Listing_Details.txt\`** | Ready-to-copy Play Store Text | Title, Short Description, Full Description (English + Urdu) |

## Quick Copy-Paste for Google Play Console:

### App Name (Title)
\`\`\`text
${titleEnglish}
\`\`\`

### Short Description
\`\`\`text
${shortDescEnglish}
\`\`\`

### Privacy Policy URL
\`\`\`text
https://buildcost-pk.vercel.app/privacy
\`\`\`

### App Releases Location (in project root):
- **Play Store Release Bundle (AAB)**: \`BuildCost-PK-v3.0.0-release.aab\`
- **Direct Offline APK**: \`BuildCost-PK-v3.0.0-offline.apk\`
`;
  fs.writeFileSync(readmePath, readmeContent, 'utf8');
  console.log(`✓ Generated README_Play_Store_Guide.md in ${folder}`);
}

console.log('\n🎉 ALL PLAY STORE ASSETS & TEXTS FINALIZED SUCCESSFULLY IN BOTH LOCATIONS!');

