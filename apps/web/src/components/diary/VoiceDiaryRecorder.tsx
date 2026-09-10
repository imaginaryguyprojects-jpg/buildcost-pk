"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Sparkles, Volume2, CheckCircle2, RotateCcw, Play, AlertCircle, ArrowRight } from "lucide-react";
import { SiteDiaryEntry } from "@buildcost/types";
import { cn } from "@/lib/utils";

export interface ParsedDiaryData {
  workersPresent?: number;
  workCompleted?: string;
  materialsReceived?: string;
  issues?: string;
  weather?: SiteDiaryEntry["weather"];
  rawTranscript: string;
}

interface VoiceDiaryRecorderProps {
  onParsedData: (data: ParsedDiaryData) => void;
}

export function VoiceDiaryRecorder({ onParsedData }: VoiceDiaryRecorderProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lang, setLang] = useState<"ur-PK" | "en-US">("ur-PK");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [parsedPreview, setParsedPreview] = useState<ParsedDiaryData | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      let current = "";
      for (let i = 0; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setTranscript(current);
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (_) {}
    };
  }, [lang]);

  const toggleListening = () => {
    if (!speechSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setParsedPreview(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  // Smart Parser for Roman Urdu / Urdu / English site logs
  const parseSiteSpeech = (text: string): ParsedDiaryData => {
    const lower = text.toLowerCase();
    const result: ParsedDiaryData = {
      rawTranscript: text
    };

    // 1. Detect Worker Count
    // Look for: "4 mistri aur 6 mazdoor", "8 workers", "10 labour", "5 dehari"
    let workers = 0;
    const mistriMatch = lower.match(/(\d+)\s*(mistri|mason|karigar)/i);
    const mazdoorMatch = lower.match(/(\d+)\s*(mazdoor|helper|labour|labor)/i);
    const generalWorkersMatch = lower.match(/(\d+)\s*(worker|workers|banday|afraad|aadmi|log)/i);

    if (mistriMatch || mazdoorMatch) {
      const mistri = mistriMatch ? parseInt(mistriMatch[1], 10) : 0;
      const mazdoor = mazdoorMatch ? parseInt(mazdoorMatch[1], 10) : 0;
      workers = mistri + mazdoor;
    } else if (generalWorkersMatch) {
      workers = parseInt(generalWorkersMatch[1], 10);
    }

    if (workers > 0) {
      result.workersPresent = workers;
    }

    // 2. Detect Weather
    if (lower.includes("dhoop") || lower.includes("sunny") || lower.includes("saf mausam")) {
      result.weather = "sunny";
    } else if (lower.includes("barish") || lower.includes("rain") || lower.includes("barsat")) {
      result.weather = "rainy";
    } else if (lower.includes("garmi") || lower.includes("hot") || lower.includes("shadeed dhoop")) {
      result.weather = "hot";
    } else if (lower.includes("sardi") || lower.includes("cold") || lower.includes("thand")) {
      result.weather = "cold";
    } else if (lower.includes("badal") || lower.includes("cloudy") || lower.includes("abr alood")) {
      result.weather = "cloudy";
    }

    // 3. Detect Materials Received
    // e.g. "2 gaari Ravi sand aayi 18,000 ki", "100 bags cement receive kiye", "sariya deliver hua"
    const matPhrases: string[] = [];
    const matRegexes = [
      /(\d+[\w\s]*(bags?|bori|boriyan|gari|gaari|trolley|trolleys?|tons?|cft)[\w\s]*(cement|sand|raiti|crush|bajri|sariya|steel|bricks?|eent|eentein)[^.,]*)/gi,
      /(cement|sand|raiti|crush|bajri|sariya|steel|bricks?|eent)[^.,]*(aayi|aaya|receive|delivered|deliver|pohanchi)[^.,]*/gi
    ];

    for (const rx of matRegexes) {
      const m = text.match(rx);
      if (m) {
        matPhrases.push(...m);
      }
    }

    if (matPhrases.length > 0) {
      result.materialsReceived = Array.from(new Set(matPhrases)).join(", ").trim();
    }

    // 4. Detect Delays / Issues
    if (
      lower.includes("wajah se ruk") ||
      lower.includes("delay") ||
      lower.includes("late") ||
      lower.includes("bijli chali") ||
      lower.includes("feeder trip") ||
      lower.includes("pani nahi") ||
      lower.includes("masla") ||
      lower.includes("obstacle")
    ) {
      result.issues = text;
    }

    // 5. Work Completed
    // If not categorized, or general progress phrases
    result.workCompleted = text;

    return result;
  };

  const handleProcessTranscript = (textToProcess?: string) => {
    const text = textToProcess || transcript;
    if (!text.trim()) return;

    const parsed = parseSiteSpeech(text);
    setParsedPreview(parsed);
  };

  const handleApplyToForm = () => {
    if (parsedPreview) {
      onParsedData(parsedPreview);
    }
  };

  const samplePrompts = [
    "Aaj 4 mistri aur 6 mazdoor thay, 2 gaari Ravi sand aayi 18,000 ki, slab ki shuttering complete ho gayi.",
    "Barish ki wajah se 3 ghante kaam ruka raha, 5 workers thay, boundary wall ki chunai mukammal ki.",
    "150 bags Bestway cement receive kiye, 8 mazdoor present thay, first floor columns ki concrete pouring mukammal."
  ];

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-50 to-emerald-500/10 dark:from-amber-950/20 dark:via-slate-900 dark:to-emerald-950/20 border border-amber-500/30 dark:border-amber-500/20 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Voice Note Site Diary (Urdu / Roman Urdu)</span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                AI Powered
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Speak naturally into your mic — AI auto-fills labor attendance, materials, and work progress.
            </p>
          </div>
        </div>

        {/* Language selector */}
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as any)}
          className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
        >
          <option value="ur-PK">اردو (Urdu)</option>
          <option value="en-US">English</option>
        </select>
      </div>

      {/* Mic Action Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={toggleListening}
          className={cn(
            "w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md",
            isListening
              ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-950/30 ring-4 ring-rose-500/20"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/20"
          )}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Listening... (Click to Stop)</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Start Speaking (بولنا شروع کریں)</span>
            </>
          )}
        </button>

        {transcript && (
          <button
            type="button"
            onClick={() => handleProcessTranscript()}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Parse Speech</span>
          </button>
        )}
      </div>

      {/* Spoken Text Preview */}
      {transcript && (
        <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Live Voice Transcript:
          </span>
          "{transcript}"
        </div>
      )}

      {/* Parsed Attributes Preview */}
      {parsedPreview && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Extracted Diary Data:</span>
            </span>
            <button
              type="button"
              onClick={handleApplyToForm}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1"
            >
              <span>Auto-Fill Form</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {parsedPreview.workersPresent && (
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-semibold">Workers (حاضری):</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {parsedPreview.workersPresent} Workers
                </span>
              </div>
            )}
            {parsedPreview.weather && (
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-semibold">Weather (موسم):</span>
                <span className="font-bold text-slate-800 dark:text-white capitalize">
                  {parsedPreview.weather}
                </span>
              </div>
            )}
          </div>

          {parsedPreview.materialsReceived && (
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]">
              <span className="text-slate-400 block font-semibold">Materials Received:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                {parsedPreview.materialsReceived}
              </span>
            </div>
          )}

          {parsedPreview.workCompleted && (
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]">
              <span className="text-slate-400 block font-semibold">Work Completed:</span>
              <span className="text-slate-700 dark:text-slate-300">
                {parsedPreview.workCompleted}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quick Test Chips */}
      <div className="pt-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Or try a sample Pakistani site voice note:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTranscript(p);
                handleProcessTranscript(p);
              }}
              className="text-[10px] text-left px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              💬 "{p.substring(0, 48)}..."
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
