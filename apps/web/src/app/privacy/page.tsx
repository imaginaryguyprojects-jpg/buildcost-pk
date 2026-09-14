"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  WifiOff,
  EyeOff,
  Database,
  Camera,
  MapPin,
  Mic,
  FileText,
  Mail,
  HelpCircle,
  ArrowLeft,
  Building,
  CheckCircle2
} from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-slate-800 dark:text-slate-100">
      {/* Top Breadcrumb / Back Link */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Calculator</span>
        </Link>
      </div>

      {/* Main Header Banner */}
      <header className="rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 text-white p-6 sm:p-10 shadow-xl relative overflow-hidden mb-10 border border-emerald-500/20">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Official Google Play Store Policy Document</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl font-medium">
            Pak-Construction Calculator (<span className="text-white font-bold">BuildCost PK</span>)
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-200/80 pt-2 border-t border-emerald-600/30">
            <span>Effective Date: September 2026</span>
            <span>•</span>
            <span>Last Updated: September 14, 2026</span>
            <span>•</span>
            <span>Platform: Android &amp; Web</span>
          </div>
        </div>
      </header>

      {/* Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">100% Offline-First</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Calculations run locally on your device.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Zero Tracking</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">No ad-tracking or personal data harvesting.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Full User Control</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Delete or export your estimates anytime.</p>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8 text-sm sm:text-base leading-relaxed bg-white dark:bg-slate-900/60 p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        
        {/* 1. Introduction */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Building className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              1. Introduction &amp; Application Scope
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Welcome to <strong>Pak-Construction Calculator</strong> (internationally branded as <strong>BuildCost PK</strong>). This privacy policy explains our values, architectural choices, and commitments regarding your privacy when utilizing our Android mobile application (distributed via Google Play) and our web application.
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            We respect your fundamental right to privacy. The application is specifically designed to provide civil contractors, engineers, architects, and Pakistani homeowners with fast, reliable structural cost intelligence without encroaching on personal identity or device data.
          </p>
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* 2. Offline-First Architecture */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <WifiOff className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              2. Offline Architecture &amp; Local Calculation Execution
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Unlike traditional cloud-dependent applications, <strong>Pak-Construction Calculator executes 100% of mathematical formulas, structural algorithms, and quantity takeoffs locally on your phone or browser</strong>.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-2">
            <li>Plot dimension conversions (Marla, Kanal, Square Feet, Square Yards) are computed strictly on-device.</li>
            <li>RCC slab structural concrete, 60-grade steel bar quantities, brickwork mortar ratios, and plaster calculations never leave your phone.</li>
            <li>No constant internet connection is required to conduct construction estimates or generate Bill of Quantities (BOQ).</li>
          </ul>
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* 3. Non-Collection of Sensitive Personal Data */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <EyeOff className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              3. Information We Do NOT Collect
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            In strict compliance with Google Play Developer Policies:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300"><strong>No Contact Harvesting:</strong> We never access, copy, or read your phone address book or contacts.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300"><strong>No Background Location:</strong> We never track or log your location in the background when the app is closed.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300"><strong>No Media Snooping:</strong> We do not scan your private photos, gallery albums, or personal files.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300"><strong>No Data Selling:</strong> We never sell, rent, or trade user data to third-party ad networks or brokers.</span>
            </div>
          </div>
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* 4. Optional Permissions Explained */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Lock className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              4. Device Permissions Explained
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            To deliver specialized site management features, the app may request specific optional permissions upon explicit user interaction:
          </p>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
                <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Camera &amp; Photo Access (Site Photo Timeline)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <strong>Purpose:</strong> Allows you to document construction milestones (e.g. slab pouring, brickwork, excavation) and watermark progress photos for overseas clients. Photos are saved locally within your device and are never sent to external surveillance systems.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Location (Foreground GPS Stamp)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <strong>Purpose:</strong> Used only when taking a verified site inspection photo to print the latitude/longitude directly on the photo canvas to prevent contractor fraud. Location is never queried in the background.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
                <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Microphone (Voice Note Site Diary)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <strong>Purpose:</strong> Used exclusively when the user clicks the microphone button to dictate daily site notes in Urdu or English. Speech recognition is handled using native device speech APIs and raw audio is not stored or broadcasted.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* 5. Construction Material Rates Disclaimer */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              5. Construction Material Rates &amp; Estimation Disclaimer
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Pak-Construction Calculator displays benchmark retail prices for construction supplies across 28 Pakistani cities (including Islamabad, Rawalpindi, Lahore, Karachi, Peshawar, Quetta, Multan, and Faisalabad).
          </p>
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
            <strong>Important Estimation Notice:</strong> Rates for cement bags (Fauji, Lucky, Bestway, Maple Leaf), 60-grade deformed steel bars (Mughal, Amreli, Ittefaq, Model), Chenab sand, Margalla crush, and daily trade labour (Mistri, Mazdoor) are indicative regional estimates for budgeting and feasibility purposes. Actual supplier invoice charges may vary due to fuel surcharges, transportation, load distances, and market fluctuations.
          </div>
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* 6. Data Retention & User Rights */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Database className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              6. Data Retention, Export, and Deletion
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            You retain 100% ownership of all calculation histories, house plans, project estimates, and purchase records created in the app.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-2">
            <li><strong>Local Reset:</strong> You can wipe all stored data at any time through your Android Settings &gt; Apps &gt; Pak-Construction Calculator &gt; Clear Storage.</li>
            <li><strong>Project Management:</strong> Any saved project can be deleted, archived, or restored directly from the in-app Projects tab.</li>
            <li><strong>Account Deletion:</strong> If you created an optional cloud-sync account, you may request full account and data purge by emailing our data privacy desk.</li>
          </ul>
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* 7. Children's Privacy */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              7. Children's Privacy (COPPA &amp; Google Play Compliance)
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Our application is targeted at professional civil engineers, construction contractors, home builders, and adult property owners. We do not knowingly collect or solicit personal data from children under 13 years of age.
          </p>
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* 8. Policy Updates */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <HelpCircle className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              8. Changes to This Privacy Policy
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            We may periodically update this statement to reflect new regulatory obligations or platform capabilities. Any modifications will be posted with an updated revision date directly on this page and in our Google Play Console store listing.
          </p>
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* 9. Contact Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Mail className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              9. Contact Us &amp; Privacy Support
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            If you have any questions, suggestions, or data inquiries regarding this Privacy Policy or our offline-first data protection practices, please contact our team:
          </p>
          <div className="p-4 sm:p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
            <p className="font-bold text-emerald-900 dark:text-emerald-200 text-sm sm:text-base">
              Pak-Construction Calculator Support Desk
            </p>
            <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
              <strong>Official Support Email:</strong>{" "}
              <a href="mailto:support@buildcost.pk" className="underline hover:text-emerald-950 dark:hover:text-emerald-100">
                support@buildcost.pk
              </a>
            </p>
            <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
              <strong>Website:</strong>{" "}
              <a href="https://buildcost-pk.vercel.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-950 dark:hover:text-emerald-100">
                https://buildcost-pk.vercel.app
              </a>
            </p>
            <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
              <strong>Jurisdiction:</strong> Islamic Republic of Pakistan
            </p>
          </div>
        </section>
      </div>

      {/* Footer link */}
      <footer className="mt-10 text-center text-xs text-slate-400 dark:text-slate-500">
        &copy; {new Date().getFullYear()} Pak-Construction Calculator (BuildCost PK). All rights reserved.
      </footer>
    </div>
  );
}
