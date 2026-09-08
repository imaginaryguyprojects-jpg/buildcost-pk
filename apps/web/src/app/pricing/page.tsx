"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Phone,
  HelpCircle,
  CreditCard,
  Building2,
  Lock,
  ChevronDown,
  MessageSquare
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useSystemSettingsStore } from "@/stores/systemSettingsStore";
import { formatPKR, formatNumber, formatCurrency } from "@/lib/formatters";
import { ProBadge } from "@/components/pro/ProBadge";

export default function PricingComparisonPage() {
  const { openCheckoutModal } = useAuthStore();
  const {
    proMonthlyRate,
    proAnnualRate,
    pricingCurrency,
    freeProjectLimit,
    freePdfLimit,
    paymentAccounts,
    easypaisa,
    jazzcash,
    bankTransfer,
    adminWhatsApp,
    promotionalDiscountPct,
    launchPriceConfig,
    fetchSubscriptionPlans
  } = useSystemSettingsStore();

  React.useEffect(() => {
    fetchSubscriptionPlans();
  }, [fetchSubscriptionPlans]);

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const effectiveMonthlyRate =
    billingCycle === "annual"
      ? Math.round(proAnnualRate / 12)
      : proMonthlyRate;

  const comparisonFeatures = [
    { name: "Plot Dimensions & Marla Standards (225 / 250 / 272.25 sqft)", free: true, pro: true },
    { name: "Basic Civil Estimator (Cement, Sand, Crush, Bricks)", free: true, pro: true },
    { name: "Active Saved Projects", free: `Up to ${freeProjectLimit} Projects`, pro: "Unlimited Projects" },
    { name: "Advanced Grey Structure Engine (Plinth, Slabs, Beams, Lintel)", free: false, pro: true },
    { name: "17-Category Finishing Works Estimator", free: false, pro: true },
    { name: "City Material Rate Engine (PBS & APCMA Verified)", free: "Read-only Default", pro: "Live Rates + Custom Overrides" },
    { name: "Advanced Material Rate Comparison (Multi-City & Suppliers)", free: false, pro: true },
    { name: "Material Price Alerts & Notifications", free: false, pro: true },
    { name: "Vendor Management & WhatsApp Khata Ledger", free: false, pro: true },
    { name: "Purchase Management & Weighbridge Bill Slips", free: false, pro: true },
    { name: "Transport & Logistics Freight Calculator", free: false, pro: true },
    { name: "Truck / Trolley Capacity & Palledari Unloading", free: false, pro: true },
    { name: "Advanced Wastage & Scrap Calculator", free: false, pro: true },
    { name: "Estimate vs Actual Cost Variance Tracker", free: false, pro: true },
    { name: "Cash Flow Planner & Milestone Progress", free: false, pro: true },
    { name: "Workforce Productivity Simulator (Mistri / Mazdoor)", free: false, pro: true },
    { name: "Contractor Quote Comparison Studio", free: false, pro: true },
    { name: "Pakistani Society Bylaws (LDA, CDA, DHA, Bahria)", free: false, pro: true },
    { name: "Floor Plan 2D CAD Analysis", free: false, pro: true },
    { name: "AI Construction Advisor & What-If Simulator", free: false, pro: true },
    { name: "Official PDF Reports & Takeoffs", free: `Basic (${freePdfLimit} / mo)`, pro: "Unlimited Detailed Multi-Page PDF" },
    { name: "WhatsApp Summary Sharing", free: true, pro: true },
    { name: "Priority WhatsApp & Phone Engineering Support", free: false, pro: true }
  ];

  const faqs = [
    {
      q: "How does the manual payment verification work in Pakistan?",
      a: "You can transfer via Easypaisa, JazzCash, or Bank Raast to our verified account. Simply take a screenshot of your payment receipt and submit the Transaction ID (TRX). Our admin team verifies and activates your Pro subscription within 15 to 30 minutes."
    },
    {
      q: "Can I use the Free plan without a credit card or debit card?",
      a: "Yes, 100%! The Free plan does not require any credit card or payment information. You can use all basic calculators, standard house estimates, and local market rate checks completely free forever."
    },
    {
      q: "What happens if I reach the Free saved project limit?",
      a: "On the Free plan, you can save up to " + freeProjectLimit + " active projects. Once you reach this limit, you can either archive an older project or upgrade to Pro for unlimited project tracking."
    },
    {
      q: "Can I upgrade from Monthly to Annual later?",
      a: "Yes. You can switch to the Annual plan at any time to save " + promotionalDiscountPct + "% on your yearly subscription."
    },
    {
      q: "Are the material rates verified for Pakistani cities?",
      a: "Yes. Rates are indexed with Pakistan Bureau of Statistics (PBS), APCMA cement data, and verified daily by local civil engineers across Islamabad, Rawalpindi, Lahore, Karachi, Peshawar, Faisalabad, and Multan."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transparent Construction SaaS Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Choose the Right Plan for Your Construction Needs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
          From individual homeowners planning their dream home to builders managing commercial developments, BuildCost Connect scales with your projects.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="pt-3 flex items-center justify-center gap-3">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-lg transition-all ${
                billingCycle === "monthly"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                Save {promotionalDiscountPct}%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* LAUNCH PRICING CELEBRATION BANNER (Section 13) */}
      {launchPriceConfig?.enabled && (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-teal-950/70 border-2 border-emerald-500/50 text-slate-100 shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">🎉</span>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Introducing Launch Price Special
                </h3>
                <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                  Limited Time Launching Celebration
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                Monthly: {formatCurrency(launchPriceConfig.monthlyPrice, pricingCurrency)}/mo
              </span>
              <span className="text-xs px-3.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/25">
                Yearly: {formatCurrency(launchPriceConfig.annualPrice, pricingCurrency)}/yr (Best Value)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
            {/* Urdu Version */}
            <div dir="rtl" className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/25 space-y-2 text-right">
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                <span>خصوصی تعارفی قیمت 🎉</span>
              </div>
              <p className="text-slate-200 leading-relaxed whitespace-pre-line font-medium text-xs sm:text-sm">
                {launchPriceConfig.messageUrdu || "یہ خصوصی قیمت ہماری launching کی خوشی میں رکھی گئی ہے۔\n\nPro subscription ابھی صرف:\nPKR 200/month\nPKR 500/year\nپر دستیاب ہے۔\n\nیہ Introducing / Launching Price ہے۔\nمستقبل میں subscription price بڑھ سکتی ہے۔"}
              </p>
            </div>

            {/* English Version */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/25 space-y-2">
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                <span>Introductory Launch Celebration 🎉</span>
              </div>
              <p className="text-slate-200 leading-relaxed whitespace-pre-line font-medium text-xs sm:text-sm">
                {launchPriceConfig.messageEnglish || "These special prices are being offered as part of our launch celebration.\n\nPro is currently available for:\nPKR 200/month\nPKR 500/year\n\nThis is an introductory launch price.\nThe Pro subscription price may increase in the future."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* FREE PLAN */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Basic Access
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                Free Plan
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ideal for individual homeowners starting preliminary planning and quick estimates.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black font-mono text-slate-900 dark:text-white">
                Rs. 0
              </span>
              <span className="text-xs text-slate-400">/ forever</span>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Basic Civil &amp; Brickwork Calculators</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Standard Grey Structure Estimator</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Default City Material Rates</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Up to {freeProjectLimit} Saved Projects</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Basic PDF Export &amp; WhatsApp Sharing</span>
              </div>
            </div>
          </div>

          <Link
            href="/calculator"
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs text-center transition-colors block"
          >
            Continue with Free Plan
          </Link>
        </div>

        {/* PRO PLAN */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 text-white border-2 border-emerald-500 shadow-2xl relative flex flex-col justify-between space-y-6 overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-bl-xl shadow-xs">
            Recommended for Contractors &amp; Builders
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Enterprise Intelligence
              </span>
              <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                <span>BuildCost Pro</span>
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Full site execution, contractor procurement, transport logistics, and precision BOQs.
              </p>
            </div>

            <div>
              {launchPriceConfig?.enabled && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 shadow-xs">
                    Launch Price 🎉
                  </span>
                  <span className="text-xs text-slate-400 line-through font-mono">
                    {billingCycle === "annual"
                      ? formatCurrency(launchPriceConfig.regularAnnualPrice, pricingCurrency) + " / yr"
                      : formatCurrency(launchPriceConfig.regularMonthlyPrice, pricingCurrency) + " / mo"}
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black font-mono text-emerald-400">
                  {billingCycle === "annual"
                    ? formatCurrency(proAnnualRate, pricingCurrency)
                    : formatCurrency(proMonthlyRate, pricingCurrency)}
                </span>
                <span className="text-xs text-slate-400">
                  {billingCycle === "annual" ? "/ year" : "/ month"}
                </span>
              </div>
              <span className="text-[11px] text-emerald-300 font-semibold block mt-1">
                {billingCycle === "annual"
                  ? `Launch Special: ${formatCurrency(proAnnualRate, pricingCurrency)} / year (Less than ${formatCurrency(Math.round(proAnnualRate / 12), pricingCurrency)} / mo)`
                  : `Or ${formatCurrency(proAnnualRate, pricingCurrency)} / year (Save 79% with Yearly Launch Price)`}
              </span>
              <p className="text-[10px] text-slate-400 mt-1 italic">
                Price may increase after the introductory launch period.
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unlimited Active Construction Projects</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dedicated Grey Structure + 17 Finishing Works</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Transport &amp; Freight Haulage Logistics</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Vendor Ledger, WhatsApp Khata &amp; Bill Slips</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AI Construction Advisor &amp; What-If Simulator</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Estimate vs. Actual Cost Tracking</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openCheckoutModal}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Upgrade to Pro via Easypaisa / JazzCash / Bank</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Official Payment Methods Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Verified Pakistani Payment Channels</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant slip verification through automated WhatsApp dispatch
            </p>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            Manual Verification
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {paymentAccounts.filter(a => a.isActive).map((acc) => {
            const isEp = acc.type === "easypaisa";
            const isJc = acc.type === "jazzcash";
            return (
              <div
                key={acc.id}
                className={`p-4 rounded-2xl border space-y-1.5 ${
                  isEp
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
                    : isJc
                    ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60"
                    : "bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800/60"
                }`}
              >
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isEp ? "bg-emerald-500" : isJc ? "bg-rose-500" : "bg-cyan-500"}`} />
                    <span>{acc.title}</span>
                  </div>
                  {acc.isDefault && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">Default</span>
                  )}
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  Title: <strong className="text-slate-900 dark:text-white">{acc.accountTitle}</strong>
                  {acc.bankName && <span className="block text-[11px] text-slate-500">{acc.bankName}</span>}
                </div>
                <div className={`font-mono font-black text-sm ${isEp ? "text-emerald-700 dark:text-emerald-400" : isJc ? "text-rose-700 dark:text-rose-400" : "text-cyan-700 dark:text-cyan-400"}`}>
                  {acc.iban || acc.accountNumber}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complete Free vs Pro Feature Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs space-y-4">
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Full Feature Comparison: Free vs. Pro
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent side-by-side comparison of every tool and calculation engine
            </p>
          </div>
          <ProBadge size="sm" variant="solid" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                <th className="py-3.5 px-5">Feature / Capability</th>
                <th className="py-3.5 px-5 text-center w-36">Free Plan</th>
                <th className="py-3.5 px-5 text-center w-44 text-emerald-600 dark:text-emerald-400 font-black">
                  BuildCost Pro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {comparisonFeatures.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-5 font-semibold text-slate-800 dark:text-slate-200">
                    {item.name}
                  </td>
                  <td className="py-3 px-5 text-center">
                    {typeof item.free === "boolean" ? (
                      item.free ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                      )
                    ) : (
                      <span className="text-slate-500 text-[11px]">{item.free}</span>
                    )}
                  </td>
                  <td className="py-3 px-5 text-center bg-emerald-50/30 dark:bg-emerald-950/10">
                    {typeof item.pro === "boolean" ? (
                      item.pro ? (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto font-black" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )
                    ) : (
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">
                        {item.pro}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="space-y-3 text-xs">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 cursor-pointer transition-all"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </div>
              {openFaq === i && (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Final Bottom Upgrade CTA */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-950 text-white shadow-xl text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
          Ready to Take Complete Control of Your Construction Budget?
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl mx-auto">
          Join hundreds of Pakistani builders, contractors, and homeowners optimizing site expenses and avoiding overruns.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={openCheckoutModal}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Upgrade to PRO Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href={`https://wa.me/923455074541?text=Hello%20BuildCost%20Connect,%20I%20want%20to%20inquire%20about%20Pro%20Upgrade.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm border border-emerald-500/40 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
