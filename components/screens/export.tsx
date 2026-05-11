"use client";
import React from "react";
import { usePace } from "@/lib/store";
import { isDM, isSale, shortDate } from "@/lib/data";
import { IconTrail, IconBuilding, IconChartBar, IconLocation, IconCalendar, IconSheet, IconCsv, IconCheck } from "@/components/icons";
import { buildSalesTrackerWorkbook } from "@/lib/export";
import * as XLSX from "xlsx";

export function ExportScreen() {
  const { visits, services, areas, businessesById, allVisitsSorted, outcomes } = usePace();

  const [opts, setOpts] = React.useState({
    audit: true,
    biz: true,
    perSvc: false,
    perArea: false,
    weekly: true,
    serviceMatrix: true,
  });
  const toggle = (k: keyof typeof opts) => setOpts((o) => ({ ...o, [k]: !o[k] }));

  const items = visits.flatMap((v) => v.items.map((it) => ({ ...it, date: v.date, bizId: v.bizId, visitId: v.id, via: v.via, notes: v.notes })));
  const visitCount = visits.length;
  const bizCount = new Set(items.map((it) => it.bizId)).size;

  // Build audit rows for CSV
  const auditRows = allVisitsSorted.flatMap((v) => {
    const biz = businessesById[v.bizId];
    if (!biz) return [];
    return v.items.map((it) => ({
      Date: new Date(v.date).toLocaleDateString("en-GB"),
      Business: biz.name,
      Area: biz.area,
      Contact: biz.contact,
      Service: it.svc,
      "Service Name": services[it.svc]?.label || it.svc,
      Outcome: it.out,
      "Outcome Name": outcomes[it.out]?.label || it.out,
      Via: v.via,
      Notes: v.notes,
    }));
  });

  const downloadXlsx = () => {
    const wb = buildSalesTrackerWorkbook({
      visits,
      services,
      areas,
      businessesById,
      allVisitsSorted,
      outcomes,
      opts,
    });
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `pace-export-${today}.xlsx`);
  };

  const downloadCsv = () => {
    const headers = ["Date", "Business", "Area", "Contact", "Service", "Outcome", "Via", "Notes"];
    const csvRows = auditRows.map((r) =>
      [r.Date, r.Business, r.Area, r.Contact, r.Service, r.Outcome, r.Via, r.Notes]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = "\uFEFF" + [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const today = new Date().toISOString().slice(0, 10);
    a.download = `pace-export-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cards = [
    { id: "audit" as const,          ic: <IconTrail size={14} />,     ttl: "Audit trail",          desc: "Every contact event with date, via, business, area, service, outcome, and notes." },
    { id: "biz" as const,            ic: <IconBuilding size={14} />,  ttl: "Businesses summary",   desc: "One row per business \u2014 stage, last contact, services pitched, sales." },
    { id: "weekly" as const,         ic: <IconCalendar size={14} />,  ttl: "Weekly breakdown",     desc: "Week 1, Week 2, etc. with per-service outcome columns + summary tables. Matches the sales tracker Excel format." },
    { id: "serviceMatrix" as const,  ic: <IconChartBar size={14} />,  ttl: "Service matrix",       desc: "One row per business showing latest outcome for every service in a grid." },
    { id: "perSvc" as const,         ic: <IconChartBar size={14} />,  ttl: "Per-service breakdown", desc: "Pitches, DMs spoken, sales and conversion rate by service code." },
    { id: "perArea" as const,        ic: <IconLocation size={14} />,  ttl: "Per-area breakdown",   desc: "Same shape as service breakdown \u2014 by neighbourhood." },
  ];

  const preview = allVisitsSorted.slice(0, 5).flatMap((v) => {
    const biz = businessesById[v.bizId];
    if (!biz) return [];
    return v.items.map((it) => ({
      ...it,
      date: v.date,
      biz: biz.name,
      area: biz.area,
      contact: biz.contact,
      notes: v.notes,
    }));
  });

  return (
    <>
      <div className="view-h">
        <div>
          <h1 className="view-title">Export</h1>
          <p className="view-sub">Hand your coach a clean Excel — no manual rebuilding</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-h">
          <div>
            <h3 className="card-title">What to include</h3>
            <p className="card-sub">Toggle the tabs that should appear in your workbook</p>
          </div>
        </div>
        <div className="grid grid-2" style={{ gap: 12 }}>
          {cards.map((c) => (
            <button key={c.id} type="button" className="exp-card" data-on={opts[c.id] ? "1" : "0"} onClick={() => toggle(c.id)}>
              <div className="cb"><IconCheck size={12} /></div>
              <div className="ic">{c.ic}</div>
              <div className="ttl">{c.ttl}</div>
              <div className="desc">{c.desc}</div>
            </button>
          ))}
        </div>

        <hr className="div" />

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button className="btn accent" onClick={downloadXlsx}>
            <IconSheet size={14} /> Download .xlsx
          </button>
          <button className="btn secondary" onClick={downloadCsv}>
            <IconCsv size={14} /> Download .csv (audit trail)
          </button>
          <div style={{ marginLeft: "auto", color: "var(--text-3)", fontSize: 12.5, fontVariantNumeric: "tabular-nums" }}>
            {visitCount} visits · {bizCount} businesses · {items.length} contact events
          </div>
        </div>
      </div>

      <div className="card flush">
        <div className="card-h" style={{ padding: "16px 18px 10px", marginBottom: 0, borderBottom: "1px solid var(--border)" }}>
          <div>
            <h3 className="card-title">Preview · first 5 audit rows</h3>
            <p className="card-sub">Same shape that will land in the .xlsx</p>
          </div>
          <span className="pill svc">audit_trail</span>
        </div>
        <div className="table-wrap">
          <table className="table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Business</th>
                <th>Area</th>
                <th>Contact</th>
                <th>Service</th>
                <th>Outcome</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((r, i) => (
                <tr key={i} style={{ cursor: "default" }}>
                  <td>{new Date(r.date).toLocaleDateString("en-GB")}</td>
                  <td><b style={{ fontWeight: 500 }}>{r.biz}</b></td>
                  <td className="muted">{r.area}</td>
                  <td className="muted">{r.contact}</td>
                  <td><span className="mono" style={{ fontSize: 11 }}>{r.svc}</span></td>
                  <td><span className="mono" style={{ fontSize: 11 }}>{r.out}</span></td>
                  <td className="muted" style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
