"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { calculateBrickwork } from "@buildcost/calculations";
import { formatPKR, formatNumber } from "@/lib/formatters";

export default function BrickworkCalculatorPage() {
  const [wallLengthFt, setWallLengthFt] = useState<number>(40);
  const [wallHeightFt, setWallHeightFt] = useState<number>(10);
  const [wallThicknessIn, setWallThicknessIn] = useState<number>(9);
  const [openingsSqft, setOpeningsSqft] = useState<number>(42); // e.g. 2 doors/windows
  const [mortarMix, setMortarMix] = useState<string>("1:5");

  const [brickPerThousand, setBrickPerThousand] = useState<number>(14000);
  const [cementPerBag, setCementPerBag] = useState<number>(1450);
  const [sandPerCft, setSandPerCft] = useState<number>(45);
  const [masonPerSqft, setMasonPerSqft] = useState<number>(40);

  const safeLength = Math.max(1, Math.abs(Number(wallLengthFt) || 1));
  const safeHeight = Math.max(1, Math.abs(Number(wallHeightFt) || 1));
  const grossArea = safeLength * safeHeight;
  const safeOpenings = Math.max(0, Math.min(grossArea - 1, Math.abs(Number(openingsSqft) || 0)));
  const safeThickness = Math.max(1, Math.abs(Number(wallThicknessIn) || 9));

  let result: ReturnType<typeof calculateBrickwork>;
  try {
    result = calculateBrickwork(
      safeLength,
      safeHeight,
      safeThickness,
      safeOpenings,
      mortarMix,
      5,
      {
        brickPerThousand: Math.max(0, brickPerThousand || 0),
        cementPerBag: Math.max(0, cementPerBag || 0),
        sandPerCft: Math.max(0, sandPerCft || 0),
        masonPerSqft: Math.max(0, masonPerSqft || 0)
      }
    );
  } catch {
    result = calculateBrickwork(40, 10, 9, 42, "1:5", 5);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/calculator"
          className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Brick Masonry Calculator</h1>
          <p className="text-xs text-slate-400">
            Standard 9x4.5x3 inch bricks, openings deduction, mortar mix ratios, and masonry labour
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>Wall Specifications</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Wall Length (ft)</label>
              <input
                type="number"
                min="1"
                value={wallLengthFt}
                onChange={(e) => setWallLengthFt(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Wall Height (ft)</label>
              <input
                type="number"
                min="1"
                value={wallHeightFt}
                onChange={(e) => setWallHeightFt(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Thickness</label>
              <select
                value={wallThicknessIn}
                onChange={(e) => setWallThicknessIn(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value={9}>9-inch (Standard Load Bearing)</option>
                <option value={4.5}>4.5-inch (Partition Wall)</option>
                <option value={13.5}>13.5-inch (Heavy Foundation)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Deductions (Openings sqft)</label>
              <input
                type="number"
                min="0"
                value={openingsSqft}
                onChange={(e) => setOpeningsSqft(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Mortar Mix Ratio</label>
            <select
              value={mortarMix}
              onChange={(e) => setMortarMix(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
            >
              <option value="1:4">1:4 (High Strength / 9-inch Walls)</option>
              <option value="1:5">1:5 (Standard Residential)</option>
              <option value="1:6">1:6 (Economy Partitions)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block mb-2 uppercase">Current Rates</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Bricks (Rs/1000)</label>
                <input
                  type="number"
                  value={brickPerThousand}
                  onChange={(e) => setBrickPerThousand(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Cement (Rs/Bag)</label>
                <input
                  type="number"
                  value={cementPerBag}
                  onChange={(e) => setCementPerBag(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Brickwork Masonry Cost
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-white my-2">
              {formatPKR(result.totalCost)}
            </div>
            <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Net Masonry: {formatNumber(result.netMasonryCft)} CFT</span>
              <span className="text-emerald-400 font-bold">
                Total Bricks: {formatNumber(result.bricksCount)} units
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-400 block mb-1">A-Grade Bricks</span>
              <span className="text-xl font-bold text-white">{formatNumber(result.bricksCount)}</span>
              <span className="text-[10px] text-emerald-400 block mt-1">{formatPKR(result.bricksCost)}</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-400 block mb-1">Mortar Cement</span>
              <span className="text-xl font-bold text-white">{result.cementBags} Bags</span>
              <span className="text-[10px] text-emerald-400 block mt-1">{formatPKR(result.cementCost)}</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-400 block mb-1">Mortar Sand</span>
              <span className="text-xl font-bold text-white">{formatNumber(result.sandCft)} CFT</span>
              <span className="text-[10px] text-emerald-400 block mt-1">{formatPKR(result.sandCost)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
