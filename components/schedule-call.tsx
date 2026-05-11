"use client";
import React from "react";
import { IconCalendar } from "@/components/icons";

function buildGCalUrl(
  title: string,
  details: string,
  location: string,
  startISO: string,
  durationMin: number,
): string {
  const start = new Date(startISO);
  const end = new Date(start.getTime() + durationMin * 60000);

  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function getDefaultDatetime(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T10:00`;
}

/** Google Calendar logo as inline SVG — the 4-color calendar icon */
function GCalIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" fill="#fff" stroke="#4285F4" strokeWidth="1.5" />
      <path d="M8 3v4M16 3v4" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="3" y="10" width="18" height="1.5" fill="#4285F4" />
      <rect x="7" y="13" width="4" height="3" rx="0.5" fill="#EA4335" />
      <rect x="13" y="13" width="4" height="3" rx="0.5" fill="#34A853" />
      <rect x="7" y="17.5" width="4" height="2" rx="0.5" fill="#FBBC04" />
      <rect x="13" y="17.5" width="4" height="2" rx="0.5" fill="#4285F4" />
    </svg>
  );
}

export function ScheduleCall({
  bizName,
  contact,
  area,
}: {
  bizName: string;
  contact: string;
  area: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [datetime, setDatetime] = React.useState(getDefaultDatetime);
  const [duration, setDuration] = React.useState(30);
  const [notes, setNotes] = React.useState("");

  const handleSchedule = () => {
    const title = `Call with ${contact} — ${bizName}`;
    const details = [
      `Business: ${bizName}`,
      `Contact: ${contact}`,
      `Area: ${area}`,
      notes ? `\nNotes: ${notes}` : "",
      `\nScheduled from Pace CRM`,
    ]
      .filter(Boolean)
      .join("\n");

    const url = buildGCalUrl(title, details, area, datetime, duration);
    window.open(url, "_blank", "noopener");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        className="btn secondary sm"
        onClick={() => {
          setDatetime(getDefaultDatetime());
          setOpen(true);
        }}
        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        <GCalIcon size={14} /> Schedule on Google Calendar
      </button>
    );
  }

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 14,
        background: "var(--surface-2)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 12.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <GCalIcon size={15} /> Schedule call with {contact}
        </span>
        <button
          className="btn ghost sm"
          style={{ fontSize: 11 }}
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 180px" }}>
          <label className="label">Date & time</label>
          <input
            className="input"
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
          />
        </div>
        <div style={{ width: 100 }}>
          <label className="label">Duration</label>
          <select
            className="select"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Notes (optional)</label>
        <input
          className="input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Discuss ECOM quote"
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button className="btn accent sm" onClick={handleSchedule}
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <GCalIcon size={13} /> Open in Google Calendar
        </button>
      </div>
    </div>
  );
}

/** Compact inline button for lists — opens Google Calendar directly with defaults */
export function ScheduleCallButton({
  bizName,
  contact,
  area,
}: {
  bizName: string;
  contact: string;
  area: string;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const title = `Call with ${contact} — ${bizName}`;
    const details = `Business: ${bizName}\nContact: ${contact}\nArea: ${area}\n\nScheduled from Pace CRM`;
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    const url = buildGCalUrl(title, details, area, d.toISOString(), 30);
    window.open(url, "_blank", "noopener");
  };

  return (
    <button
      className="icon-btn"
      onClick={handleClick}
      title={`Schedule call with ${contact} on Google Calendar`}
      style={{ width: 24, height: 24, color: "#4285F4" }}
    >
      <GCalIcon size={14} />
    </button>
  );
}
