"use client";

import React, { useState } from "react";
import { Bot, Send, Sparkles, Building2, ShieldAlert, CheckCircle2, Calculator } from "lucide-react";
import { formatPKR, formatLakhCrore, formatNumber } from "@/lib/formatters";
import { calculateCompleteHouseEstimate, calculateConcrete, calculateBrickwork, simulatePriceScenario } from "@buildcost/calculations";
import { canUseFeature } from "@buildcost/config";
import { useAuthStore } from "@/stores/authStore";
import { ProBadge } from "@/components/pro/ProBadge";
import { Sliders, TrendingUp, RefreshCw, Crown } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  dataCard?: {
    title: string;
    totalCost: number;
    details: { label: string; value: string }[];
  };
  timestamp: string;
}

const PRESET_PROMPTS = [
  "Thekedar bol raha hai 60 grade sariya lagaya hai, verify kaise karun?",
  "5 Marla slab ke liye kitne bags cement aur kitna steel lagega?",
  "Garmi mein concrete pouring ke waqt kya ehtiyat karein?",
  "Cement ki quality bina lab ke site par kaise test karein?",
  "Ret (Sand) mein silt test kaise karein taake plaster na jharay?",
  "Slab dhalai se pehle konsi cheezein check karna zaroori hain?",
  "Grey Structure vs Turnkey finishing cost difference in Islamabad?"
];


export default function AIAdvisorPage() {
  const { user, isSuperAdmin, openUpgradeModal } = useAuthStore();
  const isPro = Boolean(user?.is_pro || isSuperAdmin() || canUseFeature(user?.plan, "price_scenario_simulator"));

  const [showSimulator, setShowSimulator] = useState(false);
  const [steelDelta, setSteelDelta] = useState(10);
  const [cementDelta, setCementDelta] = useState(5);
  const [bricksDelta, setBricksDelta] = useState(-3);
  const [labourDelta, setLabourDelta] = useState(8);

  const baselineEstimate = calculateCompleteHouseEstimate({
    plotAreaMarla: 5,
    marlaSqft: 225,
    coveredAreaSqft: 2200,
    numberOfFloors: 2,
    quality: "standard",
    cityId: "isb",
    cityName: "Islamabad"
  });

  const scenarioResult = simulatePriceScenario(baselineEstimate, {
    steelPct: steelDelta,
    cementPct: cementDelta,
    bricksPct: bricksDelta,
    labourPct: labourDelta
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Assalam-o-Alaikum! I am your BuildCost AI Construction Advisor. I can calculate material requirements, compare grey structure vs turnkey finishing costs, evaluate concrete mix ratios, and optimize your construction budget across Pakistani housing authorities (CDA, LDA, DHA, Bahria).",
      timestamp: "Just now"
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userQueryCount = messages.filter((m) => m.sender === "user").length;
    if (!isPro && userQueryCount >= 3) {
      openUpgradeModal("AI Construction Advisor (Trial Limit Reached)");
      return;
    }

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery("");
    setIsTyping(true);

    setTimeout(() => {
      let aiResponse: Message;

      const lower = query.toLowerCase();

      if (lower.includes("60 grade") || lower.includes("sariya") || lower.includes("steel verify") || lower.includes("verify kaise")) {
        aiResponse = {
          id: `ai_${Date.now()}`,
          sender: "ai",
          text: `🛡️ **Thekedar 60-Grade Sariya Verification (Anti-Fraud Field Guide):**

Pakistan mein local thekedar aksar B-Grade re-rolled sariya (jo ship-breaking scrap ya kachay lohay se banta hai) 60-grade keh kar daal dete hain. Site par in 4 tareeqon se 100% verify karein:

1. **Mill Embossing Stamp Check:**
   • Primary Pakistani Mills (Mughal Supreme, Amreli, Ittefaq, Model, Agha) har 1 meter ke faslay par sariye ke upar apna naam aur **"G-60"** ya **"ASTM A615"** permanently emboss (ubhri hui likhai) karti hain.
   • Agar sariye par koi naam nahi ya sirf aam dhabay hain, to foran reject karein — wo local re-rolled sariya hai.

2. **180° Cold Bend Test (Site par khud karein):**
   • Mistri se kahein aik 4-sutri (12mm) sariye ka tukra le kar usay 180 degree par pura moray (bend kare).
   • **Pass:** Asli 60-grade sariya smoothly bend hoga, bahir wali satah par koi crack nahi aayega.
   • **Fail:** Do number (re-rolled) sariya brittle hota hai, morne par toot jayega ya uski satah phat jayegi.

3. **Deformed Rib Pattern (Dhaariyan):**
   • Genuine sariye ki ribs sharp, sharp-edged aur accurate angle par hoti hain jo concrete ko pakar kar rakhti hain. Re-rolled sariye ki dhariaan ghisi hui aur smooth hoti hain.

4. **Under-Weight Check (Gauge ki Chori):**
   • 1 foot ka tukra katwa kar digital scale par tolein:
     - 3 Sutri (10mm): ~0.170 kg per foot
     - 4 Sutri (12mm): ~0.302 kg per foot
     - 6 Sutri (20mm): ~0.680 kg per foot
   • Agar wazan 8-10% se zyada kam ho, to thekedar under-gauge sariya la raha hai!`,
          dataCard: {
            title: "Pakistani Standard Steel Verification Parameters",
            totalCost: 260000,
            details: [
              { label: "Standard Specification", value: "ASTM A615 / Grade 60 (60,000 PSI Yield)" },
              { label: "Approved Mills", value: "Mughal, Amreli, Ittefaq, Model, Agha" },
              { label: "Site Bend Test Requirement", value: "180° Cold Bend (No Cracks / Fracture)" },
              { label: "Standard Weight (#4 12mm)", value: "0.302 kg/ft (0.99 kg/meter)" }
            ]
          },
          timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })
        };
      } else if (lower.includes("5 marla slab") || lower.includes("slab ke liye kitne") || lower.includes("roof slab")) {
        aiResponse = {
          id: `ai_${Date.now()}`,
          sender: "ai",
          text: `📐 **5 Marla Roof Slab (Chhat Dhalai) Itemized Calculation:**

Standard 5 Marla ground floor roof slab (1,150 to 1,200 sqft covered area with 5.5 inch slab thickness + 9x12 beams) ke liye required materials:

• **Cement:** 100 se 110 Bags (1:2:4 Concrete Mix Ratio).
• **Steel Rebar (Grade 60):** 1,350 se 1,500 kg (~1.4 Metric Tons).
  - Main bars: 4 Sutri (1/2") @ 6 inch c/c
  - Distribution bars: 3 Sutri (3/8") @ 7 inch c/c
• **Sand (Ravi / Chenab):** 220 se 240 CFT (approx 1 Badi Trolley).
• **Crush (Margalla / Sargodha 1/2'' down):** 440 se 480 CFT (approx 1 Dumper / 2 Trolleys).
• **Waterproofing Chemical:** 1 can (Sika-1 ya Fosroc Conplast).
• **Dhalai Labour (Pouring Dehari):** Rs. 45,000 se Rs. 55,000.`,
          dataCard: {
            title: "5 Marla Slab Casting Cost Benchmark (Islamabad/Lahore)",
            totalCost: 650000,
            details: [
              { label: "Cement (105 Bags @ Rs. 1,380)", value: "Rs. 1,44,900" },
              { label: "Steel (1.4 Tons G-60 @ Rs. 260k)", value: "Rs. 3,64,000" },
              { label: "Sand & Crush Aggregates", value: "Rs. 82,000" },
              { label: "Casting Labour & Vibrator", value: "Rs. 50,000" },
              { label: "Estimated Slab Total Cost", value: "Rs. 6,40,900 (~Rs. 535/sqft)" }
            ]
          },
          timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })
        };
      } else if (lower.includes("garmi") || lower.includes("temperature") || lower.includes("hot weather")) {
        aiResponse = {
          id: `ai_${Date.now()}`,
          sender: "ai",
          text: `☀️ **Garmi Mein Concrete Pouring (Hot Weather Concreting Guide):**

Pakistan ke mausam mein garmi (>36°C) ke dauran dhalai mein concrete ka paani tezi se evaporate hota hai jisse shrinkage cracks (daraarein) par jati hain. In ehtiyati tadabeer par amal karein:

1. **Pouring Timing:**
   • Dhalai hamesha subah 5:00 AM se 9:30 AM ke darmiyan karein, ya sham 5:00 PM ke baad karein. Dopehar 12 se 4 baje shadeed dhoop mein hargiz dhalai na hone dein!
2. **Aggregates Par Pani Ka Chhirkao:**
   • Dhalai se 1 ghanta pehle Ret aur Bajri ke dher par thanda paani chhirkein taake aggregate ka temperature kam ho.
3. **Shuttering Ko Geela Karein:**
   • Dhalai shuru karne se pehle lakri ki shuttering par paani marein taake sookhi lakri concrete slurry ka paani na choosay.
4. **Extra Paani (Slump Dilution) Mat Dalne Dein:**
   • Thekedar aasani ke liye mixer mein extra paani daalne ki koshish karte hain. Is se concrete ki taqat 40% tak gir jati hai! Admixture (plasticizer) use karein agar flow barhana ho.
5. **Tarai (Curing) Ki Shuruat:**
   • Slab cast hone ke aglay din subah cement ki kiyarian (bunds) bana kar paani bhar dein (ponding). Garmi mein kam az kam **14 se 21 din** musalsal tarai lazmi hai!`,
          timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })
        };
      } else if (lower.includes("cement ki quality") || lower.includes("cement test") || lower.includes("cement check")) {
        aiResponse = {
          id: `ai_${Date.now()}`,
          sender: "ai",
          text: `🧪 **Cement Quality Check — Bina Lab Ke Site Par 4 Field Tests:**

1. **Manufacturing Date (Bori ki Seel):**
   • Bori ke kinaray par print date check karein. Cement jitna taaza ho utna behtar hai. Agar cement 90 din (3 maah) se purana ho, to uski taqat 20-30% kam ho chuki hoti hai.
2. **Hand Feel Test (Hath Ka Test):**
   • Bori ke andar hath daalein. Taaza cement hath ko **thanda (cool)** mehsoos hona chahiye aur powder ki tarah narm. Agar hath ko garam lage ya usme dhele (lumps/gathiyan) ban chuki hon, to cement kharab ho chuka hai.
3. **Float Test (Pani Ka Test):**
   • Aik glass saaf paani lein aur usme aik chutki cement phenkein.
   • **Pass:** Taaza cement paani ki satah par kuch second float (tairta) hai aur phir aahista aahista doobta hai.
   • **Fail:** Agar cement foran pathar ki tarah neechay baith jaye, to usme ret ya pathar ka powder (adulteration) milaya gaya hai.
4. **Glass Plate Patty Test:**
   • Thoda sa cement paani ke sath garha paste bana kar glass ki plate par 1 inch mota disc banayein. 24 ghante paani mein rakhne ke baad ye sakht ho jana chahiye aur koi crack nahi aana chahiye.`,
          timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })
        };
      } else if (lower.includes("silt test") || lower.includes("ret") || lower.includes("sand")) {
        aiResponse = {
          id: `ai_${Date.now()}`,
          sender: "ai",
          text: `🏖️ **Ret (Sand) Ka Silt Test — Plaster aur Chunai Ki Hifazat:**

Agar ret mein mitti (silt/clay) 6% se zyada ho to kuch mahinon baad plaster jhadna shuru ho jata hai aur deewaron par moisture/seelan aa jati hai. 5 minute mein test karein:

**Tareeqa-e-Kaar (Method):**
1. Aik 200ml ki transparent sheeshay ki bottle lein.
2. 100ml tak site se aayi hui ret bharein.
3. Bottle mein 150ml tak saaf paani daalein aur 1/2 chamach namak (salt) mix karein.
4. Bottle ka dhakkan band karke 1 minute tak achi tarah hilayein (shake karein).
5. Bottle ko bilkul sidha kisi jagah par 3 ghante ke liye chhor dein.

**Result Kaise Parhein:**
• Bhaari ret neechay baith jayegi, aur mitti/silt ki barari layer uske upar ban jayegi.
• **Formula:** (Silt Layer ki motai ÷ Ret ki motai) × 100
• Agar silt ki layer **6% se zyada** hai, to gaari wapas bhej dein ya ret ko dho kar (wash karke) use karein!`,
          timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })
        };
      } else if (lower.includes("slab dhalai") || lower.includes("pre-slab") || lower.includes("shuttering check")) {
        aiResponse = {
          id: `ai_${Date.now()}`,
          sender: "ai",
          text: `📋 **Slab Dhalai Se Pehle Ki Must-Do Civil Inspection Checklist:**

Concrete mixer chalne se pehle thekedar ki mojoodgi mein ye 6 baatein zaroor verify karein:

1. [ ] **Concrete Cover Blocks (Spacers):** Sariye ke neechay 1-inch (25mm) cement/concrete ke spacers lagay hone chahiye taake sariya shuttering plate ke sath na chipkay. Lakri ya eent ke tukray hargiz use na hone dein!
2. [ ] **Two Vibrators on Site:** Site par kam az kam **2 needle vibrators** mojood hone chahiye (1 chalne ke liye + 1 standby). Vibrator ke baghair dhalai mein concrete porous (honeycombing) reh jati hai.
3. [ ] **Shuttering Oil:** Shuttering plates par oil laga hona chahiye taake khulne ke waqt slab ka face smooth niklay.
4. [ ] **Electrical Conduits & Fan Boxes:** Har fan box aur light box mein geela akhbar/tape bhara ho taake concrete slurry andar ja kar pipe block na kare.
5. [ ] **Support Props (Balli/Pipes):** Shuttering ki balliyan bilkul vertical hon aur unke neechay lakri ke patte (sole plates) hon taake mitti dabne par chhat jhuk na jaye.
6. [ ] **Lap Length (Sariya Jod):** Jahan sariya overlap ho raha hai, wahan overlap ki lambai kam az kam 48D (e.g. 1/2" sariya = 24 inches overlap) honi chahiye.`,
          timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })
        };
      } else if (lower.includes("10 marla") || lower.includes("dha")) {
        const est = calculateCompleteHouseEstimate({
          plotAreaMarla: 10,
          marlaSqft: 225,
          coveredAreaSqft: 4200,
          numberOfFloors: 2,
          quality: "premium",
          cityId: "lhe",
          cityName: "Lahore"
        });

        aiResponse = {
          id: `ai_${Date.now()}`,
          sender: "ai",
          text: "For a typical 10 Marla double-story house (approx 4,200 sqft covered area in DHA Lahore):\n\n• Cement: ~2,000 bags (Ordinary Portland Cement Type 1 for Grey Structure + Plastering).\n• Deformed Steel Rebar (Grade 60): ~16 Metric Tons (~16,000 kg).\n• Red Clay Bricks (Awwal): ~84,000 pieces.\n• Chenab/Ravi Sand: ~7,500 CFT.\n• Margalla/Sargodha Crush (Bajri): ~5,800 CFT.\n\nHere is your full budgetary breakdown based on current Lahore wholesale rates:",
          dataCard: {
            title: "10 Marla (4,200 sqft) Turnkey Estimate - DHA Lahore",
            totalCost: est.grandTotal,
            details: [
              { label: "Civil & Structural Materials", value: formatLakhCrore(est.materialsCost) },
              { label: "Labour & Contractor Execution", value: formatLakhCrore(est.labourCost) },
              { label: "Rate per Covered Sqft", value: `Rs. ${formatNumber(est.costPerSqft)} / sqft` },
              { label: "Estimated Steel Consumption", value: "16 Metric Tons Grade 60" },
              { label: "Cement Consumption", value: "2,016 Bags (50kg)" }
            ]
          },
          timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })
        };
      } else if (lower.includes("grey structure") || lower.includes("turnkey")) {
        aiResponse = {
          id: `ai_${Date.now()}`,
          sender: "ai",
          text: "In Islamabad and Rawalpindi (Q3 2026):\n\n1. Grey Structure Only:\n• Costs approx Rs. 2,300 to Rs. 2,600 per sqft.\n• Includes: Excavation, PCC, RCC (Slabs, Beams, Columns), Brick Masonry, Rough Plaster, Underground & Overhead Water Tanks, and Conduit Piping.\n\n2. Turnkey (Complete with Finishes):\n• Economy: Rs. 3,000 to Rs. 3,300 / sqft\n• Standard A-Quality: Rs. 3,600 to Rs. 4,000 / sqft\n• Premium / Luxury: Rs. 4,500 to Rs. 5,800+ / sqft\n\nFinishing represents approximately 38% to 45% of your total project capital.",
          dataCard: {
            title: "Grey Structure vs Turnkey Comparison (Per 1,000 sqft)",
            totalCost: 3800000,
            details: [
              { label: "Grey Structure Baseline", value: "Rs. 24.5 Lakh (Rs. 2,450/sqft)" },
              { label: "Standard Finishes (Tiles, Paint, Fixtures)", value: "Rs. 13.5 Lakh (Rs. 1,350/sqft)" },
              { label: "Turnkey Grand Total", value: "Rs. 38.0 Lakh (Rs. 3,800/sqft)" }
            ]
          },
          timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })
        };
      } else if (lower.includes("mix") || lower.includes("column") || lower.includes("1:2:4")) {
        aiResponse = {
          id: `ai_${Date.now()}`,
          sender: "ai",
          text: "Civil Engineering Recommendation:\n\n• For RCC Slabs and Beams: Standard nominal mix 1:2:4 (1 Cement : 2 Sand : 4 Crush) is standard practice in Pakistan (~2,000 to 2,500 PSI characteristic strength).\n• For Columns and Foundation Footings: 1:1.5:3 (M20 grade, ~3,000 PSI) is strongly recommended, as columns carry concentrated axial compressive loads.\n• For Water Tanks and Basements: 1:1:2 or 1:1.5:3 with waterproofing water-tight admixture (e.g. Sika 1 or Fosroc) should be used to prevent capillary water seepage.",
          timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })
        };
      } else {
        const est = calculateCompleteHouseEstimate({
          plotAreaMarla: 5,
          marlaSqft: 225,
          coveredAreaSqft: 2200,
          numberOfFloors: 2,
          quality: "standard",
          cityId: "isb",
          cityName: "Islamabad"
        });

        aiResponse = {
          id: `ai_${Date.now()}`,
          sender: "ai",
          text: `Based on current verified Pakistan market rates, here is an optimized construction estimation for your query:\n\n• Standard 5 Marla 2-story house (2,200 sqft covered area):\n• Estimated Cement: ~1,050 bags\n• Estimated Steel: ~8,300 kg (8.3 tons)\n• Bricks: ~44,000 units\n• Sand: ~3,900 CFT\n• Crush: ~3,100 CFT\n\nTotal Estimated Turnkey Cost: ${formatPKR(est.grandTotal)} (≈ ${formatLakhCrore(est.grandTotal)}).`,
          dataCard: {
            title: "5 Marla Standard Residential Specification",
            totalCost: est.grandTotal,
            details: [
              { label: "Materials Cost", value: formatLakhCrore(est.materialsCost) },
              { label: "Labour Cost", value: formatLakhCrore(est.labourCost) },
              { label: "Cost Per Sqft", value: `Rs. ${formatNumber(est.costPerSqft)} / sqft` }
            ]
          },
          timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })
        };
      }


      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Construction Cost Advisor
            </h1>
            <ProBadge size="sm" variant="amber" showIcon />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Civil engineering heuristics, material sensitivity modeling, and cost estimation across Pakistani housing authorities
          </p>
        </div>

        <button
          onClick={() => {
            if (!isPro) {
              openUpgradeModal("What-If Price Simulator");
              return;
            }
            setShowSimulator(!showSimulator);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
            showSimulator
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500"
          }`}
        >
          <Sliders className="w-4 h-4 text-emerald-500" />
          <span>{showSimulator ? "Hide Price Simulator" : "Open Price Simulator"}</span>
          {!isPro && <ProBadge size="xs" variant="amber" />}
        </button>
      </div>

      {/* Section 79: Price Sensitivity & Inflation Simulator */}
      {showSimulator && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Commodity Price Sensitivity & Inflation Stress Test
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Simulate material and labour price fluctuations on a benchmark 5 Marla (2,200 sqft) double-story project
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSteelDelta(0);
                  setCementDelta(0);
                  setBricksDelta(0);
                  setLabourDelta(0);
                }}
                className="text-xs text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to 0%</span>
              </button>

              {!isPro && (
                <button
                  onClick={() => openUpgradeModal("Price Sensitivity & Inflation Simulator")}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pro Feature</span>
                </button>
              )}
            </div>
          </div>

          {!isPro && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  You are previewing the <strong className="text-emerald-600 dark:text-emerald-400">Price Sensitivity Simulator</strong>. Upgrade to Pro for unlimited multi-project scenarios, PDF export, and custom vendor rates.
                </span>
              </div>
              <button
                onClick={() => openUpgradeModal("Price Sensitivity & Inflation Simulator")}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shrink-0 shadow-sm transition-all"
              >
                Upgrade Now
              </button>
            </div>
          )}

          {/* Results Summary Pill Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Baseline Cost</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                {formatPKR(scenarioResult.baselineTotal)}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Adjusted Scenario</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {formatPKR(scenarioResult.scenarioTotal)}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Net Variance</span>
              <span className={`text-sm font-extrabold ${scenarioResult.deltaAmount >= 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {scenarioResult.deltaAmount >= 0 ? "+" : ""}{formatPKR(scenarioResult.deltaAmount)}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Budget Impact</span>
              <span className={`text-sm font-extrabold ${scenarioResult.deltaPercentage >= 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {scenarioResult.deltaPercentage >= 0 ? "+" : ""}{scenarioResult.deltaPercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Steel Slider */}
            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Deformed Steel Rebar (Grade 60)</span>
                <span className={`font-mono font-bold ${steelDelta > 0 ? "text-rose-500" : steelDelta < 0 ? "text-emerald-500" : "text-slate-500"}`}>
                  {steelDelta > 0 ? `+${steelDelta}%` : `${steelDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="50"
                step="5"
                value={steelDelta}
                onChange={(e) => setSteelDelta(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-30%</span>
                <span>0%</span>
                <span>+50%</span>
              </div>
            </div>

            {/* Cement Slider */}
            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">OPC Cement (50kg Bags)</span>
                <span className={`font-mono font-bold ${cementDelta > 0 ? "text-rose-500" : cementDelta < 0 ? "text-emerald-500" : "text-slate-500"}`}>
                  {cementDelta > 0 ? `+${cementDelta}%` : `${cementDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="50"
                step="5"
                value={cementDelta}
                onChange={(e) => setCementDelta(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-30%</span>
                <span>0%</span>
                <span>+50%</span>
              </div>
            </div>

            {/* Bricks Slider */}
            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Red Clay Bricks (Awwal)</span>
                <span className={`font-mono font-bold ${bricksDelta > 0 ? "text-rose-500" : bricksDelta < 0 ? "text-emerald-500" : "text-slate-500"}`}>
                  {bricksDelta > 0 ? `+${bricksDelta}%` : `${bricksDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="50"
                step="5"
                value={bricksDelta}
                onChange={(e) => setBricksDelta(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-30%</span>
                <span>0%</span>
                <span>+50%</span>
              </div>
            </div>

            {/* Labour Slider */}
            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Labour & Contractor Execution</span>
                <span className={`font-mono font-bold ${labourDelta > 0 ? "text-rose-500" : labourDelta < 0 ? "text-emerald-500" : "text-slate-500"}`}>
                  {labourDelta > 0 ? `+${labourDelta}%` : `${labourDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="50"
                step="5"
                value={labourDelta}
                onChange={(e) => setLabourDelta(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-30%</span>
                <span>0%</span>
                <span>+50%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preset Suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PRESET_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="text-left p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 text-xs text-slate-700 dark:text-slate-300 transition-all flex items-center justify-between group shadow-sm"
          >
            <span className="truncate">{prompt}</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-2 group-hover:scale-110 transition-transform" />
          </button>
        ))}
      </div>

      {/* Chat Messages Viewport */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 min-h-[420px] max-h-[600px] overflow-y-auto space-y-4 shadow-sm">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                m.sender === "user"
                  ? "bg-emerald-600 text-white font-bold text-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {m.sender === "user" ? "U" : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                  m.sender === "user"
                    ? "bg-emerald-600 text-white font-medium rounded-tr-none"
                    : "bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-none"
                }`}
              >
                {m.text}
              </div>

              {/* Attached Cost Calculation Card */}
              {m.dataCard && (
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {m.dataCard.title}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatPKR(m.dataCard.totalCost)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {m.dataCard.details.map((d, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px]">{d.label}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <span className="text-[10px] text-slate-400 block px-1">{m.timestamp}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Bot className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>AI Advisor is calculating engineering quantities...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-md"
      >
        <input
          type="text"
          placeholder="Ask anything about Pakistani construction costs, steel requirements, or bylaws..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="flex-1 bg-transparent px-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim()}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
