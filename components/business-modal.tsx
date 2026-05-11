"use client";
import React from "react";
import { usePace } from "@/lib/store";
import { formatAgo, shortDate, isSale } from "@/lib/data";
import { SvcOutcomePill, StageTag, Stat, STAGE_META } from "@/components/ui";
import { QuickAdd } from "@/components/quick-add";
import { ScheduleCall } from "@/components/schedule-call";
import { IconBuilding, IconClose, IconMic, IconPencil, IconCheck } from "@/components/icons";

export function BusinessModal({ bizId, onClose }: { bizId: string | null; onClose: () => void }) {
  const { businessesById, services, outcomes, areas, updateBusiness, updateBusinessStage } = usePace();
  const biz = bizId ? businessesById[bizId] : null;
  const show = !!bizId;

  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState({ name: "", type: "", area: "", contact: "", role: "" });

  // Reset editing when switching business
  React.useEffect(() => {
    setEditing(false);
    if (biz) {
      setDraft({ name: biz.name, type: biz.type, area: biz.area, contact: biz.contact, role: biz.role });
    }
  }, [bizId]);

  React.useEffect(() => {
    if (!show) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") { if (editing) setEditing(false); else onClose(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [show, onClose, editing]);

  if (!biz) {
    return <div className={"modal-bg" + (show ? " show" : "")} onClick={onClose} />;
  }

  const svcs = Object.entries(biz.svcLatest);

  const startEdit = () => {
    setDraft({ name: biz.name, type: biz.type, area: biz.area, contact: biz.contact, role: biz.role });
    setEditing(true);
  };

  const saveEdit = () => {
    if (!draft.name.trim() || !draft.contact.trim()) return;
    updateBusiness({
      id: biz.id,
      name: draft.name.trim(),
      type: draft.type.trim() || "Business",
      area: draft.area,
      contact: draft.contact.trim(),
      role: draft.role.trim() || "Owner",
    });
    setEditing(false);
  };

  const changeStage = (stage: string) => {
    if (stage !== biz.stage) {
      updateBusinessStage(biz.id, stage);
    }
  };

  return (
    <div className={"modal-bg" + (show ? " show" : "")} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div className="biz-icon"><IconBuilding size={22} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <input className="input" value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}
                autoFocus />
            ) : (
              <h2>{biz.name}</h2>
            )}
            {editing ? (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                <input className="input" value={draft.type} placeholder="Type"
                  onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
                  style={{ width: 100, fontSize: 12 }} />
                <select className="select" value={draft.area} style={{ width: 130, fontSize: 12 }}
                  onChange={(e) => setDraft((d) => ({ ...d, area: e.target.value }))}>
                  {areas.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <input className="input" value={draft.contact} placeholder="Contact name"
                  onChange={(e) => setDraft((d) => ({ ...d, contact: e.target.value }))}
                  style={{ width: 130, fontSize: 12 }} />
                <input className="input" value={draft.role} placeholder="Role"
                  onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
                  style={{ width: 90, fontSize: 12 }} />
              </div>
            ) : (
              <div className="sub">
                {biz.type} · {biz.area} · {biz.contact} ({biz.role})
              </div>
            )}
          </div>
          {editing ? (
            <>
              <button className="btn accent sm" onClick={saveEdit}><IconCheck size={13} /> Save</button>
              <button className="btn ghost sm" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <select
                className="select"
                value={biz.stage}
                onChange={(e) => changeStage(e.target.value)}
                style={{ width: 100, fontSize: 12 }}
              >
                {Object.entries(STAGE_META).map(([key, m]) => (
                  <option key={key} value={key}>{m.label}</option>
                ))}
              </select>
              <button className="btn ghost sm" onClick={startEdit} title="Edit business details">
                <IconPencil size={13} /> Edit
              </button>
            </>
          )}
          <QuickAdd bizId={biz.id} />
          <button className="modal-close" onClick={onClose}><IconClose size={16} /></button>
        </div>

        <div className="modal-body">
          <div className="grid grid-3" style={{ gap: 12, marginBottom: 18 }}>
            <Stat label="Contacts" value={biz.contactCount} sub={`across ${biz.visits.length} visit${biz.visits.length === 1 ? "" : "s"}`} />
            <Stat label="Services pitched" value={biz.serviceCount} sub={`of ${Object.keys(services).length} available`} />
            <Stat label="Last contact"
                  value={biz.lastVisit ? formatAgo(biz.lastVisit.date).replace(" ago", "") : "\u2014"}
                  sub={biz.lastVisit ? `via ${biz.lastVisit.via}` : ""} />
          </div>

          {/* Schedule call */}
          <div style={{ marginBottom: 18 }}>
            <ScheduleCall bizName={biz.name} contact={biz.contact} area={biz.area} />
          </div>

          <div style={{ marginBottom: 18 }}>
            <div className="muted" style={{ fontSize: 11.5, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
              Latest outcome per service
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {svcs.length === 0 && <span className="muted">No services pitched yet.</span>}
              {svcs.map(([svc, info]) => (
                <SvcOutcomePill key={svc} svc={svc} out={info.out} outcomes={outcomes} />
              ))}
            </div>
          </div>

          <hr className="div" />

          <div>
            <div className="muted" style={{ fontSize: 11.5, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
              Audit trail · {biz.visits.length} visit{biz.visits.length === 1 ? "" : "s"}
            </div>
            <div className="tl">
              {biz.visits.map((v) => {
                const dotTone = (() => {
                  const items = v.items;
                  if (items.some((it) => isSale(it.out))) return "success";
                  if (items.some((it) => ["MA","IM","MAPQ","IMPQ"].includes(it.out))) return "accent";
                  if (items.some((it) => it.out === "NI")) return "danger";
                  if (items.some((it) => it.out === "CB")) return "warning";
                  return "";
                })();
                return (
                  <div key={v.id} className="tl-item">
                    <div className={`tl-dot ${dotTone}`} />
                    <div style={{ paddingBottom: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-2)" }}>
                          {shortDate(v.date)}
                          <span style={{ color: "var(--text-3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                            · {v.via === "voice" ? <IconMic size={11} /> : <IconPencil size={11} />} {v.via}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: 13, fontStyle: v.notes ? "normal" : "italic", color: v.notes ? "var(--text)" : "var(--text-3)", margin: "4px 0 6px" }}>
                        {v.notes || "No notes"}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {v.items.map((it, j) => <SvcOutcomePill key={j} svc={it.svc} out={it.out} outcomes={outcomes} />)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
