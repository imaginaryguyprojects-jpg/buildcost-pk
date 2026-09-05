"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { ProjectReminder, ReminderPriority, ReminderRepeat } from "@buildcost/types";
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Repeat,
  Trash2,
  Calendar,
  X,
  BellRing
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RemindersPage() {
  const { reminders, projects, addReminder, updateReminderStatus, deleteReminder } = useProjectStore();
  const { user, notify } = useAuthStore();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"pending" | "completed" | "all">("pending");

  // Form state
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [reminderDate, setReminderDate] = useState(new Date().toISOString().split("T")[0]);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [priority, setPriority] = useState<ReminderPriority>("medium");
  const [repeatFrequency, setRepeatFrequency] = useState<ReminderRepeat>("none");
  const [notes, setNotes] = useState("");

  const filteredReminders = reminders.filter((r) => {
    if (filterStatus === "pending" && r.status !== "pending") return false;
    if (filterStatus === "completed" && r.status !== "completed") return false;
    return true;
  });

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      notify("Please enter a reminder title.", "error");
      return;
    }

    addReminder({
      userId: user?.id || "guest",
      projectId: projectId || undefined,
      title: title.trim(),
      reminderDate,
      reminderTime,
      repeatFrequency,
      priority,
      status: "pending",
      notes: notes.trim() || undefined
    });

    notify("Site reminder set successfully.", "success");
    setAddModalOpen(false);
    setTitle("");
    setNotes("");
  };

  const handleToggle = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";
    updateReminderStatus(id, nextStatus);
    notify(nextStatus === "completed" ? "Reminder marked completed." : "Reminder reopened.", "info");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <CalendarClock className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
              Site Reminders &amp; Milestones
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500">
            Keep track of concrete curing watering times, supplier deliveries, inspection dates, and contractor wages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-950/20 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterStatus("pending")}
          className={cn(
            "px-4 py-1.5 rounded-xl text-xs font-bold transition-colors",
            filterStatus === "pending"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
          )}
        >
          Pending
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus("completed")}
          className={cn(
            "px-4 py-1.5 rounded-xl text-xs font-bold transition-colors",
            filterStatus === "completed"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
          )}
        >
          Completed
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus("all")}
          className={cn(
            "px-4 py-1.5 rounded-xl text-xs font-bold transition-colors",
            filterStatus === "all"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
          )}
        >
          All
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <BellRing className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No reminders in this view</div>
            <p className="text-xs text-slate-400 mt-1">Add reminders for concrete water curing, deliveries, and payroll.</p>
          </div>
        ) : (
          filteredReminders.map((rem) => {
            const project = projects.find((p) => p.id === rem.projectId);
            const isCompleted = rem.status === "completed";

            return (
              <div
                key={rem.id}
                className={cn(
                  "bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4 transition-all",
                  isCompleted
                    ? "opacity-60 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div className="flex items-start gap-3 flex-1">
                  {/* Checkbox button */}
                  <button
                    type="button"
                    onClick={() => handleToggle(rem.id, rem.status)}
                    className={cn(
                      "w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 transition-colors shrink-0",
                      isCompleted
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 dark:border-slate-700 hover:border-emerald-500"
                    )}
                  >
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  {/* Reminder Content */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className={cn(
                          "font-bold text-sm text-slate-900 dark:text-white",
                          isCompleted && "line-through text-slate-400"
                        )}
                      >
                        {rem.title}
                      </h3>

                      {/* Priority badge */}
                      <span
                        className={cn(
                          "px-2 py-0.2 rounded text-[9px] font-bold uppercase",
                          rem.priority === "urgent" && "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400",
                          rem.priority === "high" && "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
                          rem.priority === "medium" && "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
                          rem.priority === "low" && "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        {rem.priority}
                      </span>

                      {/* Repeat badge */}
                      {rem.repeatFrequency !== "none" && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center gap-0.5">
                          <Repeat className="w-2.5 h-2.5" />
                          {rem.repeatFrequency}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {rem.reminderDate} {rem.reminderTime ? `at ${rem.reminderTime}` : ""}
                      </span>
                      {project && (
                        <span>• Project: {project.projectName}</span>
                      )}
                      {rem.notes && (
                        <span className="italic text-slate-400">• {rem.notes}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => deleteReminder(rem.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Delete Reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add Reminder Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Add Site Task / Reminder
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reminder Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Curing roof slab morning/evening / Pay weekly labor"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ReminderPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Repeat
                  </label>
                  <select
                    value={repeatFrequency}
                    onChange={(e) => setRepeatFrequency(e.target.value as ReminderRepeat)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="none">Does not repeat</option>
                    <option value="daily">Daily (e.g. Curing)</option>
                    <option value="weekly">Weekly (e.g. Labor Pay)</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Associate with Project
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ensure curing bags are soaked properly twice daily"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-950/20"
                >
                  Set Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
