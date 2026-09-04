"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Grid, Plus, Trash2, ArrowLeft, Layers, Palette, Zap } from "lucide-react";
import { formatPKR, formatNumber } from "@/lib/formatters";

interface RoomConfig {
  id: string;
  name: string;
  type: "bedroom" | "living" | "kitchen" | "bath" | "porch" | "other";
  lengthFt: number;
  widthFt: number;
  heightFt: number;
  flooringType: "porcelain" | "marble" | "ceramic" | "concrete";
  tileRateSqft: number;
}

const INITIAL_ROOMS: RoomConfig[] = [
  { id: "1", name: "Master Bedroom", type: "bedroom", lengthFt: 16, widthFt: 14, heightFt: 10, flooringType: "porcelain", tileRateSqft: 190 },
  { id: "2", name: "Guest Bedroom", type: "bedroom", lengthFt: 14, widthFt: 12, heightFt: 10, flooringType: "porcelain", tileRateSqft: 180 },
  { id: "3", name: "Drawing & Dining", type: "living", lengthFt: 22, widthFt: 15, heightFt: 10, flooringType: "marble", tileRateSqft: 240 },
  { id: "4", name: "Modern Kitchen", type: "kitchen", lengthFt: 14, widthFt: 10, heightFt: 10, flooringType: "ceramic", tileRateSqft: 175 },
  { id: "5", name: "Attached Master Bath", type: "bath", lengthFt: 9, widthFt: 7, heightFt: 10, flooringType: "ceramic", tileRateSqft: 185 },
  { id: "6", name: "Car Porch", type: "porch", lengthFt: 18, widthFt: 12, heightFt: 11, flooringType: "concrete", tileRateSqft: 120 }
];

export default function RoomEstimatorPage() {
  const [rooms, setRooms] = useState<RoomConfig[]>(INITIAL_ROOMS);

  const handleAddRoom = () => {
    const newRoom: RoomConfig = {
      id: String(Date.now()),
      name: "New Room / Space",
      type: "bedroom",
      lengthFt: 12,
      widthFt: 12,
      heightFt: 10,
      flooringType: "porcelain",
      tileRateSqft: 180
    };
    setRooms([...rooms, newRoom]);
  };

  const handleRemoveRoom = (id: string) => {
    setRooms(rooms.filter((r) => r.id !== id));
  };

  // Calculations across all rooms
  let totalFloorArea = 0;
  let totalWallArea = 0;
  let totalFlooringCost = 0;
  let totalPaintCost = 0;

  const roomCalculations = rooms.map((room) => {
    const floorArea = room.lengthFt * room.widthFt;
    const perimeter = 2 * (room.lengthFt + room.widthFt);
    // Wall area minus 45 sqft standard door/window allowance
    const wallArea = Math.max(0, perimeter * room.heightFt - 45);
    const ceilingArea = floorArea;

    const flooringCost = Math.round(floorArea * room.tileRateSqft * 1.07); // 7% tile cutting
    // Paint & Putty: approx Rs. 55 per sqft for paint + putty + labour
    const paintCost = Math.round((wallArea + ceilingArea) * 55);

    totalFloorArea += floorArea;
    totalWallArea += wallArea;
    totalFlooringCost += flooringCost;
    totalPaintCost += paintCost;

    return {
      ...room,
      floorArea,
      wallArea,
      ceilingArea,
      flooringCost,
      paintCost,
      roomSubtotal: flooringCost + paintCost
    };
  });

  const grandRoomsTotal = totalFlooringCost + totalPaintCost;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Room-by-Room Architectural Estimator
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              Advanced Feature
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Calculate precise flooring tiles, wall plaster, paint surface, and finishing costs room-by-room
          </p>
        </div>

        <button
          onClick={handleAddRoom}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room / Space</span>
        </button>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Total Usable Floor Space</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white block">
            {formatNumber(totalFloorArea)} sqft
          </span>
          <span className="text-[11px] text-slate-400">{rooms.length} Configured Rooms</span>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Total Wall & Ceiling Area</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white block">
            {formatNumber(totalWallArea + totalFloorArea)} sqft
          </span>
          <span className="text-[11px] text-slate-400">Plaster & Paint Surface</span>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Total Tile & Flooring</span>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
            {formatPKR(totalFlooringCost)}
          </span>
          <span className="text-[11px] text-slate-400">Includes tiles, bond & labour</span>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Total Finishing Cost</span>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
            {formatPKR(grandRoomsTotal)}
          </span>
          <span className="text-[11px] text-slate-400">Flooring + Paints</span>
        </div>
      </div>

      {/* Room Cards Table */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <th className="py-3.5 px-4">Room Name & Type</th>
                <th className="py-3.5 px-4 text-center">Dimensions (L × W × H)</th>
                <th className="py-3.5 px-4 text-right">Floor Area</th>
                <th className="py-3.5 px-4 text-right">Wall Area</th>
                <th className="py-3.5 px-4 text-right">Flooring Cost</th>
                <th className="py-3.5 px-4 text-right">Paint Cost</th>
                <th className="py-3.5 px-4 text-right font-bold">Room Total</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {roomCalculations.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{room.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                      {room.flooringType} Flooring
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                    {room.lengthFt}′ × {room.widthFt}′ × {room.heightFt}′
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {room.floorArea} sqft
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {room.wallArea} sqft
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {formatPKR(room.flooringCost)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {formatPKR(room.paintCost)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatPKR(room.roomSubtotal)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleRemoveRoom(room.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
