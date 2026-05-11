"use client";
import React from "react";
import Link from "next/link";
import { usePace } from "@/lib/store";
import { shortDate } from "@/lib/data";
import { OutcomePill, SvcPill } from "@/components/ui";
import { QuickAdd } from "@/components/quick-add";
import { IconSearch, IconClose, IconExport, IconMic, IconPencil, IconChevronRight } from "@/components/icons";

export function AuditScreen({ openBiz, areaFilter }: {
  openBiz: (id: string) => void;
  areaFilter?: string | null;
}) {
  const { areas, services, outcomes, businessesById, allVisitsSorted } = usePace();
  const [q, setQ] = React.useState("");
  const [area, setArea] = React.useState(areaFilter || "all");
  const [svc, setSvc] = React.useState("all");
  const [out, setOut] = React.useState("all");

  const rows = React.useMemo(() => {
    const lc = q.trim().toLowerCase();
    const rs: {
      id: string; visitId: string; date: string; via: string; notes: string;
      bizId: string; biz: string; area: string; contact: string; svc: string; out: string;
    }[] = [];
    allVisitsSorted.forEach((v) => {
      const biz = businessesById[v.bizId];
      if (!biz) return;
      v.items.forEach((it) => {
        rs.push({
          id: `${v.id}-${it.svc}`,
          visitId: v.id,
          date: v.date,
          via: v.via,
          notes: v.notes,
          bizId: biz.id,
          biz: biz.name,
          area: biz.area,
          contact: biz.contact,
          svc: it.svc,
          out: it.out,
        });
      });
    });
    return rs.filter((r) => {
      if (area !== "all" && r.area !== area) return false;
      if (svc !== "all" && r.svc !== svc) return false;
      if (out !== "all" && r.out !== out) return false;
      if (lc) {
        const hay = [r.biz, r.area, r.contact, r.notes].join(" ").toLowerCase();
        if (!hay.includes(lc)) return false;
      }
      return true;
    });
  }, [q, area, svc, out, allVisitsSorted, businessesById]);

  const clearAll = () => { setQ(""); setArea("all"); setSvc("all"); setOut("all"); };
  const hasFilters = q || area !== "all" || svc !== "all" || out !== "all";

  return (
    <>
      <div className="view-h">
        <div>
          <h1 className="view-title">Audit trail</h1>
          <p className="view-sub">{rows.length} row{rows.length === 1 ? "" : "s"} shown · every contact event</p>
        </div>
        <div className="view-h-actions">
          <Link href="/export" className="btn secondary sm">
            <IconExport size={13} /> Export filtered
          </Link>
        </div>
      </div>

      <div className="card" style={{ padding: 14, marginBottom: 14 }}>
        <div className="filter-bar">
          <div className="input-icon">
            <IconSearch size={14} />
            <input className="input" placeholder="Search businesses, areas, contacts, notes\u2026"
                   value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="select" style={{ width: 140 }} value={area} onChange={(e) => setArea(e.target.value)}>
            <option value="all">All areas</option>
            {areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select className="select" style={{ width: 160 }} value={svc} onChange={(e) => setSvc(e.target.value)}>
            <option value="all">All services</option>
            {Object.keys(services).map((s) => <option key={s} value={s}>{s} — {services[s].label}</option>)}
          </select>
          <select className="select" style={{ width: 160 }} value={out} onChange={(e) => setOut(e.target.value)}>
            <option value="all">All outcomes</option>
            {Object.keys(outcomes).map((o) => <option key={o} value={o}>{o} — {outcomes[o].label}</option>)}
          </select>
          {hasFilters && (
            <button className="icon-btn" onClick={clearAll} title="Clear filters">
              <IconClose size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="card flush">
        {rows.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-3)" }}>
            <IconSearch size={28} /><div style={{ marginTop: 8 }}>No matching contact events</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>Date</th>
                  <th>Business</th>
                  <th style={{ width: 130 }}>Area</th>
                  <th style={{ width: 140 }}>Contact</th>
                  <th style={{ width: 110 }}>Service</th>
                  <th style={{ width: 130 }}>Outcome</th>
                  <th>Notes</th>
                  <th style={{ width: 28 }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 80).map((r) => (
                  <tr key={r.id} onClick={() => openBiz(r.bizId)}>
                    <td>
                      <div style={{ fontSize: 12.5 }}>{shortDate(r.date)}</div>
                      <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                        {r.via === "voice" ? <IconMic size={11} /> : <IconPencil size={11} />}
                        {r.via}
                      </div>
                    </td>
                    <td><b style={{ fontWeight: 500 }}>{r.biz}</b></td>
                    <td className="muted">{r.area}</td>
                    <td className="muted">{r.contact}</td>
                    <td><SvcPill svc={r.svc} /></td>
                    <td><OutcomePill code={r.out} outcomes={outcomes} /></td>
                    <td className="muted" style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.notes}</td>
                    <td><IconChevronRight size={14} style={{ color: "var(--text-3)" }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {rows.length > 80 && (
        <div style={{ textAlign: "center", color: "var(--text-3)", padding: 12, fontSize: 12 }}>
          Showing first 80 of {rows.length} rows
        </div>
      )}
    </>
  );
}
