"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  Eye,
  EyeOff,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Info,
  Ruler,
  Compass,
  Grid
} from "lucide-react";
import { ProBathroomItem } from "@buildcost/types";

interface BlueprintLayout2DProps {
  plotWidthFt?: number;
  plotLengthFt?: number;
  coveredAreaSqft: number;
  floors: number;
  columnCount: number;
  columnWidthInches?: number;
  columnDepthInches?: number;
  beamLengthFt: number;
  bathrooms: ProBathroomItem[];
  wallHeightFt: number;
  foundationType?: string;
  isPro: boolean;
  onLockClick?: () => void;
}

export function BlueprintLayout2D({
  plotWidthFt = 30,
  plotLengthFt = 60,
  coveredAreaSqft,
  floors,
  columnCount = 16,
  columnWidthInches = 12,
  columnDepthInches = 12,
  beamLengthFt = 300,
  bathrooms = [],
  wallHeightFt = 10,
  foundationType = "strip",
  isPro,
  onLockClick
}: BlueprintLayout2DProps) {
  // Layer toggles
  const [showColumns, setShowColumns] = useState(true);
  const [showBeams, setShowBeams] = useState(true);
  const [showBathrooms, setShowBathrooms] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // SVG Canvas dimensions and coordinate scaling
  const svgWidth = 600;
  const svgHeight = 440;
  const padding = 50;

  // Derive aspect ratio of plot
  const safeW = Math.max(15, plotWidthFt);
  const safeL = Math.max(25, plotLengthFt);

  const drawAreaW = svgWidth - padding * 2;
  const drawAreaH = svgHeight - padding * 2;

  const scale = Math.min(drawAreaW / safeW, drawAreaH / safeL);

  const plotPixelW = safeW * scale;
  const plotPixelH = safeL * scale;

  const plotX = (svgWidth - plotPixelW) / 2;
  const plotY = (svgHeight - plotPixelH) / 2;

  // Setback / Covered footprint inside plot (~10% setback)
  const setbackX = plotPixelW * 0.08;
  const setbackY = plotPixelH * 0.08;
  const bldgX = plotX + setbackX;
  const bldgY = plotY + setbackY;
  const bldgW = plotPixelW - setbackX * 2;
  const bldgH = plotPixelH - setbackY * 2;

  // Grid of columns
  const columns = useMemo(() => {
    const cols: Array<{ x: number; y: number; id: string; label: string }> = [];
    const count = Math.max(4, Math.min(48, columnCount));
    
    // Determine grid rows & cols
    const gridCols = Math.max(2, Math.round(Math.sqrt(count * (safeW / safeL))));
    const gridRows = Math.max(2, Math.ceil(count / gridCols));

    const stepX = bldgW / (gridCols - 1);
    const stepY = bldgH / (gridRows - 1);

    let created = 0;
    for (let r = 0; r < gridRows && created < count; r++) {
      for (let c = 0; c < gridCols && created < count; c++) {
        const colLabel = `${String.fromCharCode(65 + c)}${r + 1}`;
        cols.push({
          x: bldgX + c * stepX,
          y: bldgY + r * stepY,
          id: `c_${r}_${c}`,
          label: colLabel
        });
        created++;
      }
    }
    return cols;
  }, [columnCount, safeW, safeL, bldgW, bldgH, bldgX, bldgY]);

  // Primary Beam Lines connecting columns
  const beamLines = useMemo(() => {
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number; id: string }> = [];
    if (!showBeams) return lines;

    // Horizontal grid beams
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      // Connect to adjacent on right
      const rightCol = columns.find(
        (c) => Math.abs(c.y - col.y) < 2 && c.x > col.x
      );
      if (rightCol) {
        lines.push({
          x1: col.x,
          y1: col.y,
          x2: rightCol.x,
          y2: rightCol.y,
          id: `b_h_${col.id}_${rightCol.id}`
        });
      }

      // Connect to adjacent down
      const downCol = columns.find(
        (c) => Math.abs(c.x - col.x) < 2 && c.y > col.y
      );
      if (downCol) {
        lines.push({
          x1: col.x,
          y1: col.y,
          x2: downCol.x,
          y2: downCol.y,
          id: `b_v_${col.id}_${downCol.id}`
        });
      }
    }
    return lines;
  }, [columns, showBeams]);

  // Position bathrooms in logical positions (e.g. rear corners or perimeter)
  const bathroomBoxes = useMemo(() => {
    if (!bathrooms || bathrooms.length === 0) return [];
    
    return bathrooms.map((b, idx) => {
      const lFt = Math.max(4, Number(b.lengthFt) || 8);
      const wFt = Math.max(4, Number(b.widthFt) || 6);

      const bPixelW = Math.min(bldgW * 0.45, wFt * scale);
      const bPixelH = Math.min(bldgH * 0.35, lFt * scale);

      // Distribute bathrooms nicely around corners
      let bx = bldgX + 8;
      let by = bldgY + 8;

      if (idx === 0) {
        // Rear left
        bx = bldgX + 6;
        by = bldgY + 6;
      } else if (idx === 1) {
        // Rear right
        bx = bldgX + bldgW - bPixelW - 6;
        by = bldgY + 6;
      } else if (idx === 2) {
        // Mid right
        bx = bldgX + bldgW - bPixelW - 6;
        by = bldgY + bldgH * 0.5 - bPixelH / 2;
      } else {
        // Mid left
        bx = bldgX + 6;
        by = bldgY + bldgH * 0.5 - bPixelH / 2 + (idx - 3) * (bPixelH + 6);
      }

      return {
        id: b.id || `bath_${idx}`,
        name: b.name || `Bath ${idx + 1}`,
        x: bx,
        y: by,
        w: bPixelW,
        h: bPixelH,
        lFt,
        wFt
      };
    });
  }, [bathrooms, bldgX, bldgY, bldgW, bldgH, scale]);

  return (
    <div className="w-full bg-[#0a1120] text-slate-200 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Blueprint Header */}
      <div className="bg-[#0f172a] px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Architectural 2D Blueprint Layout
              </h3>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PRO CAD PREVIEW
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Auto-generated structural grid based on {safeW}×{safeL} ft plot • {floors} {floors === 1 ? "Floor" : "Floors"} • {wallHeightFt} ft Wall Height
            </p>
          </div>
        </div>

        {/* Floor Selection & Zoom Controls */}
        <div className="flex items-center gap-2">
          {floors > 1 && (
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-0.5 text-xs font-semibold">
              {Array.from({ length: floors }).map((_, fIdx) => (
                <button
                  key={fIdx}
                  onClick={() => setActiveFloor(fIdx + 1)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeFloor === fIdx + 1
                      ? "bg-cyan-500 text-slate-950 font-bold shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Floor {fIdx + 1}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, Number((z - 0.1).toFixed(1))))}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[10px] font-mono text-slate-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, Number((z + 0.1).toFixed(1))))}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Layer Toggles Toolbar */}
      <div className="bg-[#0c1424] px-5 py-2.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Layers className="w-3.5 h-3.5" /> Layers:
          </span>

          <button
            onClick={() => setShowColumns(!showColumns)}
            className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 text-[11px] font-medium ${
              showColumns
                ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                : "bg-slate-900/60 border-slate-800 text-slate-500 line-through"
            }`}
          >
            <span className="w-2 h-2 rounded-xs bg-cyan-400" />
            Columns ({columnCount})
          </button>

          <button
            onClick={() => setShowBeams(!showBeams)}
            className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 text-[11px] font-medium ${
              showBeams
                ? "bg-blue-500/15 border-blue-500/40 text-blue-300"
                : "bg-slate-900/60 border-slate-800 text-slate-500 line-through"
            }`}
          >
            <span className="w-2 h-0.5 bg-blue-400" />
            Beams ({beamLengthFt} ft)
          </button>

          <button
            onClick={() => setShowBathrooms(!showBathrooms)}
            className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 text-[11px] font-medium ${
              showBathrooms
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                : "bg-slate-900/60 border-slate-800 text-slate-500 line-through"
            }`}
          >
            <span className="w-2 h-2 rounded-xs bg-emerald-400" />
            Bathrooms ({bathrooms.length})
          </button>

          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 text-[11px] font-medium ${
              showDimensions
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                : "bg-slate-900/60 border-slate-800 text-slate-500 line-through"
            }`}
          >
            <Ruler className="w-3 h-3 text-amber-400" />
            Dimensions
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span>Scale: 1:100</span>
          <span>Footprint: {Math.round(coveredAreaSqft / floors)} sqft/floor</span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative p-4 sm:p-6 flex items-center justify-center overflow-x-auto min-h-[380px] bg-[#070d18]">
        {/* CAD Blueprint Grid Pattern */}
        <div
          className="w-full flex items-center justify-center transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full max-w-[620px] h-auto drop-shadow-2xl select-none"
            style={{ fontFamily: "monospace" }}
          >
            <defs>
              {/* Architectural Grid pattern */}
              <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.6" />
              </pattern>
              <pattern id="cadGridSub" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#334155" strokeWidth="1.0" />
              </pattern>
              {/* Hatching for bathrooms */}
              <pattern id="bathHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#059669" strokeWidth="1" strokeOpacity="0.4" />
              </pattern>
            </defs>

            {/* Background Canvas */}
            <rect width={svgWidth} height={svgHeight} fill="#0a1222" />
            {showGrid && (
              <>
                <rect width={svgWidth} height={svgHeight} fill="url(#cadGrid)" />
                <rect width={svgWidth} height={svgHeight} fill="url(#cadGridSub)" />
              </>
            )}

            {/* Outer Plot Boundary (Dashed Gold / Slate) */}
            <rect
              x={plotX}
              y={plotY}
              width={plotPixelW}
              height={plotPixelH}
              fill="none"
              stroke="#ca8a04"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              opacity="0.8"
            />
            <text
              x={plotX + 6}
              y={plotY + 14}
              fill="#eab308"
              fontSize="9"
              fontWeight="bold"
            >
              PLOT BOUNDARY ({safeW}&apos; × {safeL}&apos;)
            </text>

            {/* Building Covered Footprint (Solid Cyan Line) */}
            <rect
              x={bldgX}
              y={bldgY}
              width={bldgW}
              height={bldgH}
              fill="#0f1f38"
              fillOpacity="0.6"
              stroke="#38bdf8"
              strokeWidth="2.5"
              rx="2"
            />

            {/* Room / Living Zone Labels */}
            <text
              x={bldgX + bldgW / 2}
              y={bldgY + bldgH * 0.45}
              fill="#64748b"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              opacity="0.5"
              letterSpacing="2"
            >
              MAIN RESIDENTIAL LIVING ZONE
            </text>
            <text
              x={bldgX + bldgW / 2}
              y={bldgY + bldgH * 0.45 + 16}
              fill="#475569"
              fontSize="9"
              textAnchor="middle"
              opacity="0.6"
            >
              Clear Height: {wallHeightFt} ft • Foundation: {foundationType.toUpperCase()}
            </text>

            {/* Beams (Spanning Lines) */}
            {showBeams &&
              beamLines.map((beam) => (
                <line
                  key={beam.id}
                  x1={beam.x1}
                  y1={beam.y1}
                  x2={beam.x2}
                  y2={beam.y2}
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeDasharray="6,3"
                  opacity="0.85"
                />
              ))}

            {/* Bathrooms Footprints */}
            {showBathrooms &&
              bathroomBoxes.map((bath) => (
                <g key={bath.id}>
                  <rect
                    x={bath.x}
                    y={bath.y}
                    width={bath.w}
                    height={bath.h}
                    fill="url(#bathHatch)"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    rx="1"
                  />
                  {/* Door Swing Arc */}
                  <path
                    d={`M ${bath.x + 4} ${bath.y + bath.h} A ${bath.w * 0.35} ${bath.w * 0.35} 0 0 1 ${bath.x + bath.w * 0.35 + 4} ${bath.y + bath.h}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.7"
                  />
                  {/* Bathroom Label */}
                  <text
                    x={bath.x + bath.w / 2}
                    y={bath.y + bath.h / 2 - 2}
                    fill="#34d399"
                    fontSize="8.5"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {bath.name}
                  </text>
                  <text
                    x={bath.x + bath.w / 2}
                    y={bath.y + bath.h / 2 + 9}
                    fill="#a7f3d0"
                    fontSize="7"
                    textAnchor="middle"
                  >
                    {bath.lFt}&apos; × {bath.wFt}&apos;
                  </text>
                </g>
              ))}

            {/* Columns (Structural Nodes) */}
            {showColumns &&
              columns.map((col) => (
                <g key={col.id} transform={`translate(${col.x}, ${col.y})`}>
                  {/* Concrete Column Square */}
                  <rect
                    x="-6"
                    y="-6"
                    width="12"
                    height="12"
                    fill="#0284c7"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                  />
                  {/* Rebar Center Cross */}
                  <line x1="-4" y1="-4" x2="4" y2="4" stroke="#ffffff" strokeWidth="1" />
                  <line x1="4" y1="-4" x2="-4" y2="4" stroke="#ffffff" strokeWidth="1" />
                  {/* Column Label */}
                  <text
                    x="8"
                    y="10"
                    fill="#7dd3fc"
                    fontSize="7"
                    fontWeight="bold"
                  >
                    {col.label}
                  </text>
                </g>
              ))}

            {/* Dimension Lines (Outer Annotations) */}
            {showDimensions && (
              <g>
                {/* Horizontal Top Width Dimension */}
                <line
                  x1={plotX}
                  y1={plotY - 18}
                  x2={plotX + plotPixelW}
                  y2={plotY - 18}
                  stroke="#fbbf24"
                  strokeWidth="1"
                />
                <line x1={plotX} y1={plotY - 24} x2={plotX} y2={plotY - 12} stroke="#fbbf24" strokeWidth="1" />
                <line
                  x1={plotX + plotPixelW}
                  y1={plotY - 24}
                  x2={plotX + plotPixelW}
                  y2={plotY - 12}
                  stroke="#fbbf24"
                  strokeWidth="1"
                />
                <text
                  x={plotX + plotPixelW / 2}
                  y={plotY - 22}
                  fill="#fde047"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  WIDTH: {safeW}&apos;-0&quot;
                </text>

                {/* Vertical Right Length Dimension */}
                <line
                  x1={plotX + plotPixelW + 18}
                  y1={plotY}
                  x2={plotX + plotPixelW + 18}
                  y2={plotY + plotPixelH}
                  stroke="#fbbf24"
                  strokeWidth="1"
                />
                <line
                  x1={plotX + plotPixelW + 12}
                  y1={plotY}
                  x2={plotX + plotPixelW + 24}
                  y2={plotY}
                  stroke="#fbbf24"
                  strokeWidth="1"
                />
                <line
                  x1={plotX + plotPixelW + 12}
                  y1={plotY + plotPixelH}
                  x2={plotX + plotPixelW + 24}
                  y2={plotY + plotPixelH}
                  stroke="#fbbf24"
                  strokeWidth="1"
                />
                <text
                  x={plotX + plotPixelW + 26}
                  y={plotY + plotPixelH / 2}
                  fill="#fde047"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                  transform={`rotate(90 ${plotX + plotPixelW + 26} ${plotY + plotPixelH / 2})`}
                >
                  LENGTH: {safeL}&apos;-0&quot;
                </text>
              </g>
            )}

            {/* North Compass Symbol */}
            <g transform={`translate(${svgWidth - 45}, 45)`}>
              <circle cx="0" cy="0" r="16" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              <polygon points="0,-13 4,0 0,-3" fill="#ef4444" />
              <polygon points="0,13 4,0 0,3" fill="#64748b" />
              <polygon points="0,-13 -4,0 0,-3" fill="#dc2626" />
              <polygon points="0,13 -4,0 0,3" fill="#475569" />
              <text x="0" y="-16" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">
                N
              </text>
            </g>

            {/* CAD Stamp Bottom Right */}
            <g transform={`translate(${svgWidth - 190}, ${svgHeight - 42})`}>
              <rect width="175" height="34" fill="#090d16" stroke="#334155" strokeWidth="0.8" rx="2" />
              <text x="8" y="13" fill="#94a3b8" fontSize="7.5" fontWeight="bold">
                BUILDCOST PK • STRUCTURAL 2D
              </text>
              <text x="8" y="24" fill="#64748b" fontSize="7">
                Auto-calculated layout v3.0 • Verified
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Blueprint Legend & Summary Bar */}
      <div className="bg-[#0f172a] px-5 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-[#0284c7] border border-[#38bdf8]" />
            <span>RCC Columns ({columnWidthInches}&quot;×{columnDepthInches}&quot;)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-blue-500" />
            <span>RCC Plinth & Tie Beams</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-emerald-600/40 border border-emerald-500" />
            <span>Bathrooms (4.5&quot; Partition)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 border border-dashed border-amber-500" />
            <span>Plot Perimeter</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 italic">
          * Blueprint is an architectural visualization for estimation. Consult a registered structural engineer before construction.
        </div>
      </div>
    </div>
  );
}
