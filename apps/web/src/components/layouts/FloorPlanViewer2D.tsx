"use client";

import React, { useState, useRef } from "react";
import { HouseLayout, RoomPlanElement } from "@buildcost/types";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  Compass,
  Download,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloorPlanViewer2DProps {
  layout: HouseLayout;
  onUseInEstimate?: () => void;
  className?: string;
}

const CATEGORY_COLORS: Record<
  RoomPlanElement["category"],
  { fill: string; stroke: string; text: string; bg: string; badge: string }
> = {
  bedroom: {
    fill: "rgba(59, 130, 246, 0.08)",
    stroke: "#3b82f6",
    text: "#1d4ed8",
    bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
    badge: "Bed"
  },
  bathroom: {
    fill: "rgba(6, 182, 212, 0.08)",
    stroke: "#06b6d4",
    text: "#0e7490",
    bg: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300",
    badge: "Bath"
  },
  kitchen: {
    fill: "rgba(245, 158, 11, 0.08)",
    stroke: "#f59e0b",
    text: "#b45309",
    bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
    badge: "Kitchen"
  },
  living: {
    fill: "rgba(139, 92, 246, 0.08)",
    stroke: "#8b5cf6",
    text: "#6d28d9",
    bg: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300",
    badge: "Lounge"
  },
  drawing: {
    fill: "rgba(168, 85, 247, 0.08)",
    stroke: "#a855f7",
    text: "#7e22ce",
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-700 dark:text-fuchsia-300",
    badge: "Drawing"
  },
  porch: {
    fill: "rgba(100, 116, 139, 0.08)",
    stroke: "#64748b",
    text: "#334155",
    bg: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    badge: "Porch"
  },
  stairs: {
    fill: "rgba(234, 88, 12, 0.08)",
    stroke: "#ea580c",
    text: "#9a3412",
    bg: "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300",
    badge: "Stairs"
  },
  lawn: {
    fill: "rgba(16, 185, 129, 0.08)",
    stroke: "#10b981",
    text: "#047857",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
    badge: "Lawn / Open"
  },
  terrace: {
    fill: "rgba(14, 165, 233, 0.08)",
    stroke: "#0ea5e9",
    text: "#0369a1",
    bg: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300",
    badge: "Terrace"
  },
  store: {
    fill: "rgba(120, 113, 108, 0.08)",
    stroke: "#78716c",
    text: "#44403c",
    bg: "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300",
    badge: "Store"
  }
};

export function FloorPlanViewer2D({ layout, onUseInEstimate, className }: FloorPlanViewer2DProps) {
  const [activeFloor, setActiveFloor] = useState<"groundFloor" | "firstFloor">("groundFloor");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<RoomPlanElement | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<RoomPlanElement | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const rooms = layout.planData[activeFloor] || layout.planData.groundFloor || [];
  const hasFirstFloor = !!layout.planData.firstFloor && layout.planData.firstFloor.length > 0;

  // Compute viewbox scale in pixels (approx 14px per foot)
  const scale = 14;
  const paddingFt = 4;
  const widthPx = (layout.plotWidthFt + paddingFt * 2) * scale;
  const heightPx = (layout.plotDepthFt + paddingFt * 2) * scale;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `${layout.title.toLowerCase().replace(/\\s+/g, "_")}_${activeFloor}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className={cn("bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col", className)}>
      {/* Header Controls Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {layout.title}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              {layout.plotWidthFt}&apos; × {layout.plotDepthFt}&apos; ({layout.plotAreaSqft} sqft)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Covered: ~{layout.coveredAreaSqft} sqft • {layout.bedrooms} Beds • {layout.bathrooms} Baths • {layout.floors} Storey
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Floor Switcher */}
          {hasFirstFloor && (
            <div className="flex items-center bg-slate-200 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveFloor("groundFloor");
                  setSelectedRoom(null);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-md transition-colors",
                  activeFloor === "groundFloor"
                    ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Ground Floor
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveFloor("firstFloor");
                  setSelectedRoom(null);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-md transition-colors",
                  activeFloor === "firstFloor"
                    ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                First Floor
              </button>
            </div>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.7, Number((z - 0.15).toFixed(2))))}
              title="Zoom Out"
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 text-slate-600 dark:text-slate-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))))}
              title="Zoom In"
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              title="Reset Zoom"
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download & Print */}
          <button
            type="button"
            onClick={handleDownloadSVG}
            title="Download SVG Blueprint"
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handlePrint}
            title="Print Blueprint"
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main SVG Blueprint Canvas */}
      <div className="relative flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center min-h-[460px] bg-slate-50 dark:bg-[#0b1320] select-none">
        {/* Architectural Grid Background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#334155 1px, transparent 1px)",
            backgroundSize: "16px 16px"
          }}
        />

        {/* Compass North Arrow */}
        <div className="absolute top-5 right-5 flex flex-col items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 shadow-sm pointer-events-none">
          <Compass className="w-5 h-5 text-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">NORTH</span>
        </div>

        {/* Blueprint SVG */}
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "center center",
            transition: "transform 0.15s ease-out"
          }}
          className="shadow-2xl shadow-slate-900/20 dark:shadow-black/60 rounded-xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
        >
          <svg
            ref={svgRef}
            width={widthPx}
            height={heightPx}
            viewBox={`0 0 ${widthPx} ${heightPx}`}
            className="block"
          >
            <defs>
              <pattern
                id="stairsPattern"
                width="8"
                height="8"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line x1="0" y1="0" x2="0" y2="8" stroke="#ea580c" strokeWidth="1.5" strokeOpacity="0.4" />
              </pattern>
            </defs>

            {/* Plot Boundary Border */}
            <g transform={`translate(${paddingFt * scale}, ${paddingFt * scale})`}>
              {/* Outer boundary line */}
              <rect
                x={0}
                y={0}
                width={layout.plotWidthFt * scale}
                height={layout.plotDepthFt * scale}
                fill="#f8fafc"
                className="dark:fill-[#0d1525]"
                stroke="#64748b"
                strokeWidth={2.5}
                strokeDasharray="6 3"
              />

              {/* Plot Dimension Labels */}
              <text
                x={(layout.plotWidthFt * scale) / 2}
                y={-12}
                textAnchor="middle"
                fontSize={11}
                fontWeight="bold"
                fill="#64748b"
              >
                ← {layout.plotWidthFt}&apos;-0&quot; Frontage →
              </text>
              <text
                x={-12}
                y={(layout.plotDepthFt * scale) / 2}
                textAnchor="middle"
                fontSize={11}
                fontWeight="bold"
                fill="#64748b"
                transform={`rotate(-90 -12 ${(layout.plotDepthFt * scale) / 2})`}
              >
                ← {layout.plotDepthFt}&apos;-0&quot; Depth →
              </text>

              {/* Street Road Indicator */}
              <rect
                x={0}
                y={layout.plotDepthFt * scale + 6}
                width={layout.plotWidthFt * scale}
                height={20}
                fill="none"
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="4 2"
              />
              <text
                x={(layout.plotWidthFt * scale) / 2}
                y={layout.plotDepthFt * scale + 19}
                textAnchor="middle"
                fontSize={10}
                fontWeight="600"
                fill="#64748b"
                letterSpacing={1.5}
              >
                ROAD / STREET (راستہ)
              </text>

              {/* Rooms Render */}
              {rooms.map((room) => {
                const rx = room.x * scale;
                const ry = room.y * scale;
                const rw = room.widthFt * scale;
                const rh = room.depthFt * scale;
                const isSelected = selectedRoom?.id === room.id;
                const isHovered = hoveredRoom?.id === room.id;
                const colors = CATEGORY_COLORS[room.category] || CATEGORY_COLORS.bedroom;
                const roomSqft = Math.round(room.widthFt * room.depthFt);

                return (
                  <g
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    onMouseEnter={() => setHoveredRoom(room)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    className="cursor-pointer transition-all duration-150"
                  >
                    {/* Room Base Floor */}
                    <rect
                      x={rx}
                      y={ry}
                      width={rw}
                      height={rh}
                      fill={room.category === "stairs" ? "url(#stairsPattern)" : colors.fill}
                      stroke={isSelected ? "#059669" : colors.stroke}
                      strokeWidth={isSelected ? 3 : 2}
                      rx={2}
                      className={cn(
                        "transition-all",
                        isSelected && "stroke-emerald-600 dark:stroke-emerald-400 stroke-[3px]",
                        isHovered && !isSelected && "opacity-90 stroke-[2.5px]"
                      )}
                    />

                    {/* Room Walls Thickness */}
                    <rect
                      x={rx + 2}
                      y={ry + 2}
                      width={rw - 4}
                      height={rh - 4}
                      fill="none"
                      stroke={colors.stroke}
                      strokeWidth={0.7}
                      strokeOpacity={0.3}
                    />

                    {/* Room Text Labels */}
                    <text
                      x={rx + rw / 2}
                      y={ry + rh / 2 - 8}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight="bold"
                      fill={colors.text}
                      className="select-none pointer-events-none"
                    >
                      {room.name}
                    </text>

                    {/* Urdu Name */}
                    {room.urduName && (
                      <text
                        x={rx + rw / 2}
                        y={ry + rh / 2 + 5}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight="500"
                        fill="#64748b"
                        className="select-none pointer-events-none font-arabic"
                      >
                        {room.urduName}
                      </text>
                    )}

                    {/* Dimension Feet & Inches */}
                    <text
                      x={rx + rw / 2}
                      y={ry + rh / 2 + 19}
                      textAnchor="middle"
                      fontSize={9.5}
                      fontWeight="600"
                      fill="#64748b"
                      className="select-none pointer-events-none font-mono"
                    >
                      {room.widthFt}&apos; × {room.depthFt}&apos; ({roomSqft} sqft)
                    </text>

                    {/* Attached Bath Indicator */}
                    {room.hasAttachedBath && (
                      <circle
                        cx={rx + rw - 10}
                        cy={ry + 10}
                        r={4}
                        fill="#06b6d4"
                      >
                        <title>Attached Bath</title>
                      </circle>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* Selected Room Details Bar */}
      {selectedRoom && (
        <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border-t border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-xs px-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedRoom.name}
              </span>
              {selectedRoom.urduName && (
                <span className="ml-1.5 text-slate-500 font-arabic">
                  ({selectedRoom.urduName})
                </span>
              )}
              <span className="ml-2 text-slate-600 dark:text-slate-300">
                • {selectedRoom.widthFt}&apos;-0&quot; × {selectedRoom.depthFt}&apos;-0&quot;
              </span>
              <span className="ml-2 font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                = {Math.round(selectedRoom.widthFt * selectedRoom.depthFt)} sq.ft
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedRoom(null)}
            className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
          >
            Clear
          </button>
        </div>
      )}

      {/* Footer Info & Legal Engineering Disclaimer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400 max-w-2xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Engineering Disclaimer:</span> This 2D layout is a conceptual planning diagram based on standard Pakistani residential norms. For official CDA / LDA / RDA / KDA sanctioning, soil testing, foundation depth, and structural RCC details, please consult a PEC-registered civil engineer or registered architect.
          </p>
        </div>

        {onUseInEstimate && (
          <button
            type="button"
            onClick={onUseInEstimate}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Use In Estimate →</span>
          </button>
        )}
      </div>
    </div>
  );
}
