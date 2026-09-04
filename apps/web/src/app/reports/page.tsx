"use client";

import React, { useState } from "react";
import { Download, FileText, CheckCircle2, ShieldAlert } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BRAND_CONFIG } from "@buildcost/config";
import { useProjectStore } from "@/stores/projectStore";
import { calculateCompleteHouseEstimate } from "@buildcost/calculations";
import { formatPKR, formatNumber } from "@/lib/formatters";

export default function ReportsPage() {
  const { getActiveProject } = useProjectStore();
  const project = getActiveProject();
  const [generating, setGenerating] = useState(false);

  const estimate = calculateCompleteHouseEstimate({
    plotAreaMarla: (project?.plotArea || 5) / (project?.plotUnit === "marla" ? 1 : 225),
    marlaSqft: 225,
    coveredAreaSqft: project?.coveredArea || 2200,
    numberOfFloors: project?.numberOfFloors || 2,
    quality: project?.constructionQuality || "standard",
    cityId: project?.cityId || "isb",
    cityName: "Islamabad"
  });

  const handleDownloadPDF = () => {
    setGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Header Branding
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 38, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("BUILDCOST CONNECT", 14, 18);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text("Pakistan Construction Cost Intelligence Platform", 14, 25);

      doc.setTextColor(203, 213, 225);
      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-PK")}`, 155, 18);
      doc.text("Official Estimate Report", 155, 25);

      // Project Context Box
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Project: ${project?.projectName || "Construction Project"}`, 14, 48);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`Location: ${project?.location || "Islamabad"}`, 14, 54);
      doc.text(`Covered Area: ${formatNumber(project?.coveredArea || 2200)} sqft (G+${(project?.numberOfFloors || 2) - 1})`, 14, 60);
      doc.text(`Specification Tier: ${(project?.constructionQuality || "standard").toUpperCase()}`, 14, 66);

      // Summary Metric Cards
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(120, 43, 76, 26, 2, 2, "F");
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text("TOTAL ESTIMATED COST", 125, 50);
      doc.setTextColor(5, 150, 105);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(formatPKR(estimate.grandTotal), 125, 59);
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Rate: Rs. ${formatNumber(estimate.costPerSqft)} / sqft`, 125, 65);

      // Table of Material Quantities
      const tableRows = estimate.materials.map((m, idx) => [
        idx + 1,
        m.materialName,
        `${formatNumber(m.finalQuantity)} ${m.unit}`,
        `Rs. ${formatNumber(m.unitRate)}`,
        formatPKR(m.cost)
      ]);

      autoTable(doc, {
        startY: 76,
        head: [["#", "Material & Trade Specification", "Estimated Quantity", "Unit Rate", "Subtotal"]],
        body: tableRows,
        theme: "striped",
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: "bold"
        },
        styles: {
          fontSize: 8,
          textColor: [30, 41, 59]
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 80 },
          2: { cellWidth: 35, halign: "right" },
          3: { cellWidth: 30, halign: "right" },
          4: { cellWidth: 35, halign: "right" }
        }
      });

      // Disclaimer Footer
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "italic");
      const splitText = doc.splitTextToSize(
        `Legal Notice: ${BRAND_CONFIG.disclaimer}`,
        182
      );
      doc.text(splitText, 14, finalY);

      doc.save(`${project?.projectName || "Construction"}_Estimate.pdf`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Report & Document Export</h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate printable construction cost estimates and Bill of Quantities PDFs
          </p>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/40 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{generating ? "Compiling PDF..." : "Download Official PDF"}</span>
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-slate-200">Active Document Ready for Export</div>
            <div className="text-slate-400">
              {project?.projectName} • {formatNumber(project?.coveredArea || 2200)} sqft • Grand Total: {formatPKR(estimate.grandTotal)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-200">Included PDF Sections:</h3>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
              <li>Official BuildCost Connect Letterhead</li>
              <li>Project location, covered area, and floor count</li>
              <li>Calculated civil material quantities (Cement, Steel, Bricks, Sand, Crush)</li>
              <li>Unit rates and total cost breakdown</li>
              <li>Total estimated cost per sqft</li>
              <li>Civil engineering planning & budgeting disclaimer</li>
            </ul>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-slate-400 leading-relaxed text-[11px]">
              <span className="font-bold text-slate-300 block mb-1">Standard Disclaimer</span>
              {BRAND_CONFIG.disclaimer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
