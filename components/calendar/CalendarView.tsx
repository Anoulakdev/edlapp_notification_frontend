"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Clock, Tag } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

import { Event } from "@/schemas/calendarEvent";

const EVENT_COLORS = [
  { label: "Blue", value: "brand", bg: "rgb(var(--brand))" },
  { label: "Green", value: "green", bg: "rgb(var(--success))" },
  { label: "Red", value: "red", bg: "rgb(var(--danger))" },
  { label: "Yellow", value: "yellow", bg: "rgb(var(--warning))" },
];

const INITIAL_EVENTS: Event[] = [
  { id: 1, date: "2026-03-17", title: "Team Standup", time: "09:00", color: "brand" },
  { id: 2, date: "2026-03-17", title: "Design Review", time: "14:00", color: "green" },
  { id: 3, date: "2026-03-20", title: "Sprint Planning", time: "10:00", color: "yellow" },
  { id: 4, date: "2026-03-25", title: "Product Demo", time: "15:30", color: "red" },
  { id: 5, date: "2026-03-28", title: "Quarterly Review", time: "11:00", color: "brand" },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function colorBg(color: string) {
  switch (color) {
    case "green": return "rgb(var(--success))";
    case "red": return "rgb(var(--danger))";
    case "yellow": return "rgb(var(--warning))";
    default: return "rgb(var(--brand))";
  }
}

export function CalendarView() {
  const [now, setNow] = useState(new Date());
  const today = now;
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [selectedDate, setSelectedDate] = useState<string>(
    toDateStr(today.getFullYear(), today.getMonth(), today.getDate())
  );
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("09:00");
  const [newColor, setNewColor] = useState("brand");
  const [nextId, setNextId] = useState(100);

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const eventsForDate = (dateStr: string) => events.filter(e => e.date === dateStr);
  const selectedEvents = eventsForDate(selectedDate);

  const handleAddEvent = () => {
    if (!newTitle.trim()) return;
    setEvents(prev => [...prev, { id: nextId, date: selectedDate, title: newTitle.trim(), time: newTime, color: newColor }]);
    setNextId(n => n + 1);
    setNewTitle("");
    setNewTime("09:00");
    setNewColor("brand");
    setShowModal(false);
  };

  const handleDelete = (id: number) => setEvents(prev => prev.filter(e => e.id !== id));

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
          >
            Calendar
          </h1>
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            Manage your schedule and upcoming events.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: "rgb(var(--brand))", boxShadow: "0 4px 12px rgba(var(--brand),0.3)" }}
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Calendar */}
        <div
          className="xl:col-span-3 rounded-2xl border overflow-hidden"
          style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}
        >
          {/* Month header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: "rgb(var(--border))" }}
          >
            <button
              onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
              style={{ background: "rgb(var(--bg))", border: "1px solid rgb(var(--border))", color: "rgb(var(--text-secondary))" }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2
              className="text-lg font-bold"
              style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
            >
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
              style={{ background: "rgb(var(--bg))", border: "1px solid rgb(var(--border))", color: "rgb(var(--text-secondary))" }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 border-b" style={{ borderColor: "rgb(var(--border))" }}>
            {WEEKDAYS.map(d => (
              <div
                key={d}
                className="py-3 text-center text-xs font-semibold uppercase tracking-wide"
                style={{ color: "rgb(var(--text-secondary))" }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              const dateStr = day ? toDateStr(year, month, day) : "";
              const dayEvents = day ? eventsForDate(dateStr) : [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (day) {
                      setSelectedDate(dateStr);
                      setShowModal(true);
                    }
                  }}
                  className="min-h-24 p-2 border-r border-b transition-all"
                  style={{
                    borderColor: "rgb(var(--border))",
                    background: isSelected && !isToday ? "rgba(var(--brand), 0.04)" : "transparent",
                    cursor: day ? "pointer" : "default",
                  }}
                  onMouseEnter={(e) => {
                    if (day && !isSelected) (e.currentTarget as HTMLDivElement).style.background = "rgb(var(--bg))";
                  }}
                  onMouseLeave={(e) => {
                    if (day && !isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    if (day && isSelected && !isToday) (e.currentTarget as HTMLDivElement).style.background = "rgba(var(--brand), 0.04)";
                  }}
                >
                  {day && (
                    <>
                      <div className="flex justify-end mb-1">
                        <span
                          className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium transition-all"
                          style={{
                            background: isToday ? "rgb(var(--brand))" : "transparent",
                            color: isToday ? "white" : isSelected ? "rgb(var(--brand))" : "rgb(var(--text-primary))",
                            fontWeight: isToday || isSelected ? "700" : "500",
                          }}
                        >
                          {day}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map(ev => (
                          <div
                            key={ev.id}
                            className="text-xs px-1.5 py-0.5 rounded-md truncate font-medium text-white"
                            style={{ background: colorBg(ev.color) }}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs px-1.5" style={{ color: "rgb(var(--text-secondary))" }}>
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected date events */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}
          >
            <div
              className="px-4 py-3 border-b flex items-center justify-between"
              style={{ borderColor: "rgb(var(--border))" }}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgb(var(--text-secondary))" }}>
                  Selected Day
                </p>
                <p className="text-sm font-bold mt-0.5" style={{ color: "rgb(var(--text-primary))" }}>
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                    weekday: "long", month: "long", day: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white transition-all"
                style={{ background: "rgb(var(--brand))" }}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4">
              {selectedEvents.length === 0 ? (
                <div className="text-center py-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: "rgb(var(--bg))" }}
                  >
                    <Clock className="w-5 h-5" style={{ color: "rgb(var(--text-secondary))" }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: "rgb(var(--text-secondary))" }}>
                    No events
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-secondary))" }}>
                    Click + to add one
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedEvents
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(ev => (
                      <div
                        key={ev.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl group"
                        style={{ background: "rgb(var(--bg))", border: "1px solid rgb(var(--border))" }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: colorBg(ev.color) }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "rgb(var(--text-primary))" }}>
                            {ev.title}
                          </p>
                          <p className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
                            {ev.time}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          style={{ background: "rgba(var(--danger), 0.1)", color: "rgb(var(--danger))" }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming events */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}
          >
            <div
              className="px-4 py-3 border-b"
              style={{ borderColor: "rgb(var(--border))" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgb(var(--text-secondary))" }}>
                Upcoming Events
              </p>
            </div>
            <div className="p-4 space-y-2">
              {events
                .filter(e => e.date >= todayStr)
                .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
                .slice(0, 6)
                .map(ev => (
                  <div key={ev.id} className="flex items-center gap-3">
                    <div
                      className="w-1.5 h-10 rounded-full shrink-0"
                      style={{ background: colorBg(ev.color) }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "rgb(var(--text-primary))" }}>
                        {ev.title}
                      </p>
                      <p className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
                        {new Date(ev.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {ev.time}
                      </p>
                    </div>
                  </div>
                ))}
              {events.filter(e => e.date >= todayStr).length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: "rgb(var(--text-secondary))" }}>
                  No upcoming events
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            className="w-full max-w-md rounded-2xl border shadow-2xl animate-modal-in"
            style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "rgb(var(--border))" }}
            >
              <h3 className="text-lg font-bold" style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>
                New Event
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-secondary))" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "rgb(var(--text-secondary))" }}>
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgb(var(--bg))",
                    border: "1px solid rgb(var(--border))",
                    color: "rgb(var(--text-primary))",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "rgb(var(--text-secondary))" }}>
                  Event Title <span style={{ color: "rgb(var(--danger))" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Team Meeting"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddEvent(); }}
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgb(var(--bg))",
                    border: "1px solid rgb(var(--border))",
                    color: "rgb(var(--text-primary))",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "rgb(var(--text-secondary))" }}>
                  Time
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgb(var(--bg))",
                    border: "1px solid rgb(var(--border))",
                    color: "rgb(var(--text-primary))",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "rgb(var(--text-secondary))" }}>
                  Color
                </label>
                <div className="flex gap-2">
                  {EVENT_COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setNewColor(c.value)}
                      className="w-8 h-8 rounded-full transition-all"
                      style={{
                        background: c.bg,
                        outline: newColor === c.value ? `3px solid ${c.bg}` : "none",
                        outlineOffset: "2px",
                        transform: newColor === c.value ? "scale(1.15)" : "scale(1)",
                      }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div
              className="flex gap-3 px-6 py-4 border-t"
              style={{ borderColor: "rgb(var(--border))" }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all"
                style={{
                  background: "transparent",
                  borderColor: "rgb(var(--border))",
                  color: "rgb(var(--text-secondary))",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                disabled={!newTitle.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{
                  background: newTitle.trim() ? "rgb(var(--brand))" : "rgb(var(--border))",
                  cursor: newTitle.trim() ? "pointer" : "not-allowed",
                }}
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
