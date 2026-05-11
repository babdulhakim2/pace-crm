"use client";
import React from "react";
import { usePace } from "@/lib/store";
import { IconCheck } from "./icons";

export const STAGE_META: Record<string, { label: string; tone: string; dot: string }> = {
  cold:   { label: "Cold",   tone: "muted",   dot: "var(--text-3)" },
  active: { label: "Active", tone: "accent",  dot: "var(--accent)" },
  won:    { label: "Won",    tone: "success", dot: "var(--success)" },
  lost:   { label: "Lost",   tone: "danger",  dot: "var(--danger)" },
};

type OutcomeMap = Record<string, { label: string; dm: boolean; sale: boolean; tone: string }>;

export function OutcomePill({ code, outcomes, withLabel = true, size = "md" }: { code: string; outcomes: OutcomeMap; withLabel?: boolean; size?: string }) {
  const o = outcomes[code];
  if (!o) return null;
  const tone = o.tone;
  return (
    <span className={`pill ${tone}`} style={size === "sm" ? { fontSize: 10.5 } : undefined}>
      <span className="code">{code}</span>
      {withLabel && <span>{o.label}</span>}
    </span>
  );
}

export function SvcOutcomePill({ svc, out, outcomes }: { svc: string; out: string; outcomes: OutcomeMap }) {
  const o = outcomes[out];
  if (!o) return null;
  return (
    <span className={`svc-out ${o.tone}`}>
      <span className="s">{svc}</span>
      <span className="o">{out}</span>
    </span>
  );
}

export function SvcPill({ svc }: { svc: string }) {
  return <span className="pill svc">{svc}</span>;
}

export function StageTag({ stage }: { stage: string }) {
  const m = STAGE_META[stage] || STAGE_META.cold;
  return (
    <span className={`pill stage ${m.tone}`}>
      <span className="pill-dot" />
      {m.label}
    </span>
  );
}

export function Stat({ label, value, sub, subTone = "" }: { label: React.ReactNode; value: React.ReactNode; sub?: React.ReactNode; subTone?: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className={`stat-foot ${subTone}`}>{sub}</div>}
    </div>
  );
}

export function Toast({ show, children, icon }: { show: boolean; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className={"toast" + (show ? " show" : "")}>
      {icon}
      <span>{children}</span>
    </div>
  );
}

export function OutcomeKeypad({ value, onChange, outcomes }: { value: string; onChange: (code: string) => void; outcomes: OutcomeMap }) {
  const order = Object.keys(outcomes);
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 6,
    }}>
      {order.map((code) => {
        const o = outcomes[code];
        if (!o) return null;
        const isOn = value === code;
        return (
          <button key={code} type="button"
            onClick={() => onChange(code)}
            className="outcome-tile"
            data-on={isOn ? "1" : "0"}
            data-tone={o.tone}
            title={o.label}>
            <span className="ot-code">{code}</span>
            <span className="ot-label">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ServiceSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { services } = usePace();
  return (
    <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
      {Object.entries(services).map(([k, v]) => (
        <option key={k} value={k}>{k} — {v.label}</option>
      ))}
    </select>
  );
}
