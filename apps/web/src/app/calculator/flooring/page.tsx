"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Grid } from "lucide-react";
import { calculateFlooring } from "@buildcost/calculations";
import { formatPKR, formatNumber } from "@/lib/formatters";

export default function FlooringCalculatorPage() {
  const [roomAreaSqft, setRoomAreaSqft] = useState<number>(450);
  const [tileWidthIn, setTileWidthIn] = useState<number>(24);
  const [tileLengthIn, setTileLengthIn] = useState<number>(24);
  const [tilesPerBox, setTilesPerBox] = useState<number>(4);
  const [wastagePercent, setWastagePercent] = useState<number>(7);
  const [tileRatePerSqft, setTileRatePerSqft] = useState<number>(180);
  const [bondAdhesivePerBag, setBondAdhesivePerBag] = useState<number>(750);
  const [labourRatePerSqft, setLabourRatePerSqft] = useState<number>(45);

  const safeArea = Math.max(1, Math.abs(Number(roomAreaSqft) || 1));
  const safeTileW = Math.max(1, Math.abs(Number(tileWidthIn) || 12));
  const safeTileL = Math.max(1, Math.abs(Number(tileLengthIn) || 12));
  const safeTilesPerBox = Math.max(1, Math.abs(Number(tilesPerBox) || 4));
  const safeWastage = Math.max(0, Math.min(50, Number(wastagePercent) || 0));

  let result: ReturnType<typeof calculateFlooring>;
  try {
    result = calculateFlooring(
      safeArea,
      safeTileW,
      safeTileL,
      safeTilesPerBox,
      safeWastage,
      {
        tilePerSqft: Math.max(0, tileRatePerSqft || 0),
        bondAdhesivePerBag: Math.max(0, bondAdhesivePerBag || 0),
        labourPerSqft: Math.max(0, labourRatePerSqft || 0)
      }
    );
  } catch {
    result = calculateFlooring(200, 24, 24, 4, 7);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Flooring & Tiles Calculator</h1>
          <p className="text-xs text-slate-400">
            Tile counts, box packaging requirements, bond adhesive bags, and border cut allowances
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Grid className="w-4 h-4" />
            <span>Room & Tile Dimensions</span>
          </h2>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Room Floor Area (sqft)</label>
            <input
              type="number"
              min="1"
              value={roomAreaSqft}
              onChange={(e) => setRoomAreaSqft(parseFloat(e.target.value) || 1)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Tile Dimensions</label>
              <select
                value={`${tileWidthIn}x${tileLengthIn}`}
                onChange={(e) => {
                  const [w, l] = e.target.value.split("x").map(Number);
                  setTileWidthIn(w);
                  setTileLengthIn(l);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="24x24">24&quot; × 24&quot; (60×60 cm Standard)</option>
                <option value="32x32">32&quot; × 32&quot; (80×80 cm Large)</option>
                <option value="12x24">12&quot; × 24&quot; (30×60 cm Bathroom)</option>
                <option value="12x12">12&quot; × 12&quot; (30×30 cm Floor)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Tiles Per Box</label>
              <input
                type="number"
                min="1"
                value={tilesPerBox}
                onChange={(e) => setTilesPerBox(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block mb-2 uppercase">Rates</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Tile (Rs/Sqft)</label>
                <input
                  type="number"
                  value={tileRatePerSqft}
                  onChange={(e) => setTileRatePerSqft(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Bond (Rs/Bag)</label>
                <input
                  type="number"
                  value={bondAdhesivePerBag}
                  onChange={(e) => setBondAdhesivePerBag(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Labour (Rs/Sqft)</label>
                <input
                  type="number"
                  value={labourRatePerSqft}
                  onChange={(e) => setLabourRatePerSqft(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Flooring & Tile Installation Cost
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-white my-2">
              {formatPKR(result.totalCost)}
            </div>
            <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Total Boxes: {result.tileBoxCount} Boxes</span>
              <span className="text-emerald-400 font-bold">
                Rs. {formatNumber(result.costPerSqft)} / sqft
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-400 block mb-1">Tiles Needed</span>
              <span className="text-2xl font-extrabold text-emerald-400">{result.totalTilesCount} Pieces</span>
              <span className="text-[10px] text-slate-500 block mt-1">{formatPKR(result.tilesCost)}</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-400 block mb-1">Bond Adhesive</span>
              <span className="text-2xl font-extrabold text-slate-200">{result.adhesiveBags} Bags</span>
              <span className="text-[10px] text-slate-500 block mt-1">{formatPKR(result.adhesiveCost)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
