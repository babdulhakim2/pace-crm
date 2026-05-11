"use client";
import React from "react";
import { usePace } from "@/lib/store";
import { OutcomeKeypad, ServiceSelect } from "@/components/ui";
import { IconPlus, IconCheck, IconClose } from "@/components/icons";

export function QuickAdd({ bizId, onDone }: { bizId: string; onDone?: () => void }) {
  const { addVisit, services, outcomes } = usePace();
  const [open, setOpen] = React.useState(false);
  const [svc, setSvc] = React.useState(Object.keys(services)[0] || "GBPO");
  const [out, setOut] = React.useState("CB");
  const [notes, setNotes] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const save = () => {
    const id = `v-qa-${Date.now()}`;
    addVisit({
      id,
      bizId,
      date: new Date().toISOString(),
      via: "text",
      notes: notes.trim() || "Quick add",
      items: [{ svc, out }],
    });
    setOpen(false);
    setNotes("");
    setSvc(Object.keys(services)[0] || "GBPO");
    setOut("CB");
    onDone?.();
  };

  return (
    <div style={{ position: "relative", display: "inline-flex" }} ref={ref}>
      <button
        className="icon-btn"
        style={{ width: 24, height: 24, borderRadius: 999, fontSize: 10 }}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        title="Quick add visit"
      >
        <IconPlus size={12} />
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 6,
            width: 300,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 14,
            boxShadow: "var(--shadow-2)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Quick add visit</span>
            <button
              style={{ appearance: "none", border: 0, background: "transparent", cursor: "pointer", color: "var(--text-3)" }}
              onClick={() => setOpen(false)}
            >
              <IconClose size={14} />
            </button>
          </div>
          <div>
            <label className="label">Service</label>
            <ServiceSelect value={svc} onChange={setSvc} />
          </div>
          <div>
            <label className="label">Outcome</label>
            <OutcomeKeypad value={out} onChange={setOut} outcomes={outcomes} />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Quick note..." onKeyDown={(e) => e.key === "Enter" && save()} />
          </div>
          <button className="btn accent sm" onClick={save} style={{ alignSelf: "flex-end" }}>
            <IconCheck size={12} /> Save
          </button>
        </div>
      )}
    </div>
  );
}
