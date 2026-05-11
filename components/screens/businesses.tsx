"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { usePace } from "@/lib/store";
import { isDM, isSale, formatAgo, shortDate } from "@/lib/data";
import { SvcOutcomePill, StageTag, STAGE_META } from "@/components/ui";
import { useUI } from "@/app/(app)/client-layout";
import { QuickAdd } from "@/components/quick-add";
import { IconSearch, IconClose, IconSheet, IconBuilding } from "@/components/icons";
import { buildSalesTrackerWorkbook } from "@/lib/export";
import * as XLSX from "xlsx";

export function BusinessListScreen() {
  const { visits, services, areas, businessesById, allVisitsSorted, outcomes } = usePace();
  const { openBiz } = useUI();
  const searchParams = useSearchParams();

  const filterParam = searchParams.get("filter");
  const stageParam = searchParams.get("stage");

  const [q, setQ] = React.useState("");
  const [stageFilter, setStageFilter] = React.useState(stageParam || "all");

  // Compute week items for filter logic
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const allBiz = React.useMemo(() => {
    let list = Object.values(businessesById);

    // Apply URL filter param
    if (filterParam === "contacted") {
      const contactedBizIds = new Set<string>();
      visits.forEach((v) => {
        if (new Date(v.date) >= weekAgo) contactedBizIds.add(v.bizId);
      });
      list = list.filter((b) => contactedBizIds.has(b.id));
    } else if (filterParam === "dm") {
      const dmBizIds = new Set<string>();
      visits.forEach((v) => {
        if (new Date(v.date) >= weekAgo) {
          v.items.forEach((it) => { if (isDM(it.out)) dmBizIds.add(v.bizId); });
        }
      });
      list = list.filter((b) => dmBizIds.has(b.id));
    } else if (filterParam === "sale") {
      const saleBizIds = new Set<string>();
      visits.forEach((v) => {
        if (new Date(v.date) >= weekAgo) {
          v.items.forEach((it) => { if (isSale(it.out)) saleBizIds.add(v.bizId); });
        }
      });
      list = list.filter((b) => saleBizIds.has(b.id));
    } else if (filterParam === "callback") {
      const cbBizIds = new Set<string>();
      visits.forEach((v) => {
        const age = now.getTime() - new Date(v.date).getTime();
        if (age < 14 * 86400000) {
          v.items.forEach((it) => { if (it.out === "CB") cbBizIds.add(v.bizId); });
        }
      });
      list = list.filter((b) => cbBizIds.has(b.id));
    }

    // Stage filter
    if (stageFilter !== "all") {
      list = list.filter((b) => b.stage === stageFilter);
    }

    // Text search
    const lc = q.trim().toLowerCase();
    if (lc) {
      list = list.filter((b) => {
        const hay = [b.name, b.area, b.contact, b.type, b.role].join(" ").toLowerCase();
        return hay.includes(lc);
      });
    }

    // Sort by last contact descending
    list.sort((a, b) => {
      const aDate = a.lastVisit ? new Date(a.lastVisit.date).getTime() : 0;
      const bDate = b.lastVisit ? new Date(b.lastVisit.date).getTime() : 0;
      return bDate - aDate;
    });

    return list;
  }, [businessesById, filterParam, stageFilter, q, visits]);

  const filterLabel = (() => {
    if (filterParam === "contacted") return "Contacted this week";
    if (filterParam === "dm") return "DMs spoken to (this week)";
    if (filterParam === "sale") return "Sales (this week)";
    if (filterParam === "callback") return "Callbacks due (14 days)";
    if (stageParam) return `Stage: ${STAGE_META[stageParam]?.label || stageParam}`;
    return "All businesses";
  })();

  const downloadXlsx = () => {
    const wb = buildSalesTrackerWorkbook({
      visits,
      services,
      areas,
      businessesById,
      allVisitsSorted,
      outcomes,
      opts: { audit: true, biz: true, weekly: true, serviceMatrix: true },
    });
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `pace-export-${today}.xlsx`);
  };

  const hasFilters = q || stageFilter !== "all" || filterParam;

  return (
    <>
      <div className="view-h">
        <div>
          <h1 className="view-title">Businesses</h1>
          <p className="view-sub">{filterLabel} · {allBiz.length} result{allBiz.length === 1 ? "" : "s"}</p>
        </div>
        <div className="view-h-actions">
          <button className="btn accent" onClick={downloadXlsx}>
            <IconSheet size={14} /> Export Excel
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 14, marginBottom: 14 }}>
        <div className="filter-bar">
          <div className="input-icon">
            <IconSearch size={14} />
            <input className="input" placeholder="Search by name, area, contact..."
                   value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="select" style={{ width: 140 }} value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
            <option value="all">All stages</option>
            {Object.entries(STAGE_META).map(([key, m]) => (
              <option key={key} value={key}>{m.label}</option>
            ))}
          </select>
          {hasFilters && (
            <button className="icon-btn" onClick={() => { setQ(""); setStageFilter("all"); }} title="Clear filters">
              <IconClose size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="card flush">
        {allBiz.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-3)" }}>
            <IconBuilding size={28} />
            <div style={{ marginTop: 8 }}>No businesses match your filters</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th style={{ width: 110 }}>Area</th>
                  <th style={{ width: 140 }}>Contact</th>
                  <th style={{ width: 80 }}>Stage</th>
                  <th style={{ width: 70 }} className="num">Contacts</th>
                  <th style={{ width: 100 }}>Last Visit</th>
                  <th>Services Pitched</th>
                  <th style={{ width: 28 }}></th>
                </tr>
              </thead>
              <tbody>
                {allBiz.map((b) => (
                  <tr key={b.id} onClick={() => openBiz(b.id)}>
                    <td>
                      <b style={{ fontWeight: 500 }}>{b.name}</b>
                      <div className="muted" style={{ fontSize: 11 }}>{b.type}</div>
                    </td>
                    <td className="muted">{b.area}</td>
                    <td>
                      <span style={{ fontSize: 12.5 }}>{b.contact}</span>
                      <div className="muted" style={{ fontSize: 10.5 }}>{b.role}</div>
                    </td>
                    <td><StageTag stage={b.stage} /></td>
                    <td className="num">{b.contactCount}</td>
                    <td className="muted" style={{ fontSize: 12 }}>
                      {b.lastVisit ? formatAgo(b.lastVisit.date) : "\u2014"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {Object.entries(b.svcLatest).slice(0, 4).map(([svc, info]) => (
                          <SvcOutcomePill key={svc} svc={svc} out={info.out} outcomes={outcomes} />
                        ))}
                        {Object.keys(b.svcLatest).length > 4 && (
                          <span className="pill" style={{ background: "var(--surface-2)", fontSize: 10 }}>
                            +{Object.keys(b.svcLatest).length - 4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td><QuickAdd bizId={b.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
