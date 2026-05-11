"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { usePace } from "@/lib/store";
import { isDM, isSale, formatAgo } from "@/lib/data";
import { SvcOutcomePill, StageTag, STAGE_META } from "@/components/ui";
import { useUI } from "@/app/(app)/client-layout";
import { QuickAdd } from "@/components/quick-add";
import { IconSearch, IconClose, IconSheet, IconBuilding, IconPlus, IconTrash } from "@/components/icons";
import { buildSalesTrackerWorkbook } from "@/lib/export";
import * as XLSX from "xlsx";

function AddBusinessForm({ onClose }: { onClose: () => void }) {
  const { areas, addBusiness } = usePace();
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("Business");
  const [area, setArea] = React.useState(areas[0] || "");
  const [contact, setContact] = React.useState("");
  const [role, setRole] = React.useState("Owner");

  const canSave = name.trim() && contact.trim() && area;

  const handleSave = () => {
    if (!canSave) return;
    addBusiness({
      id: `b-${Date.now()}`,
      name: name.trim(),
      type: type.trim() || "Business",
      area,
      contact: contact.trim(),
      role: role.trim() || "Owner",
    });
    onClose();
  };

  return (
    <div className="card" style={{ padding: 16, marginBottom: 14, border: "1px solid var(--accent)", background: "var(--accent-bg)" }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Add new business</div>
      <div className="field-grid">
        <div>
          <label className="label">Name *</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)}
                 placeholder="e.g. Tony's Barbers" autoFocus />
        </div>
        <div>
          <label className="label">Type</label>
          <input className="input" value={type} onChange={(e) => setType(e.target.value)}
                 placeholder="e.g. Restaurant, Salon" />
        </div>
        <div>
          <label className="label">Area *</label>
          <select className="select" value={area} onChange={(e) => setArea(e.target.value)}>
            {areas.length === 0 && <option value="">No areas configured</option>}
            {areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Contact *</label>
          <input className="input" value={contact} onChange={(e) => setContact(e.target.value)}
                 placeholder="e.g. Tony Smith" />
        </div>
        <div>
          <label className="label">Role</label>
          <input className="input" value={role} onChange={(e) => setRole(e.target.value)}
                 placeholder="e.g. Owner, Manager" />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
        <button className="btn ghost sm" onClick={onClose}>Cancel</button>
        <button className="btn accent sm" onClick={handleSave} disabled={!canSave}>Add business</button>
      </div>
    </div>
  );
}

export function BusinessListScreen() {
  const { visits, services, areas, businessesById, allVisitsSorted, outcomes, deleteBusiness } = usePace();
  const { openBiz } = useUI();
  const searchParams = useSearchParams();

  const filterParam = searchParams.get("filter");
  const stageParam = searchParams.get("stage");

  const [q, setQ] = React.useState("");
  const [stageFilter, setStageFilter] = React.useState(stageParam || "all");
  const [showAdd, setShowAdd] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);

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
          v.items.forEach((it) => { if (isDM(it.out, outcomes)) dmBizIds.add(v.bizId); });
        }
      });
      list = list.filter((b) => dmBizIds.has(b.id));
    } else if (filterParam === "sale") {
      const saleBizIds = new Set<string>();
      visits.forEach((v) => {
        if (new Date(v.date) >= weekAgo) {
          v.items.forEach((it) => { if (isSale(it.out, outcomes)) saleBizIds.add(v.bizId); });
        }
      });
      list = list.filter((b) => saleBizIds.has(b.id));
    } else if (filterParam === "callback") {
      const cbBizIds = new Set<string>();
      visits.forEach((v) => {
        const age = now.getTime() - new Date(v.date).getTime();
        if (age < 14 * 86400000) {
          v.items.forEach((it) => { if (outcomes[it.out]?.tone === "warning") cbBizIds.add(v.bizId); });
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

  const handleDelete = (bizId: string) => {
    deleteBusiness(bizId);
    setDeleteConfirm(null);
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
          <button className="btn secondary sm" onClick={() => setShowAdd((v) => !v)}>
            <IconPlus size={13} /> Add business
          </button>
          <button className="btn accent" onClick={downloadXlsx}>
            <IconSheet size={14} /> Export Excel
          </button>
        </div>
      </div>

      {showAdd && <AddBusinessForm onClose={() => setShowAdd(false)} />}

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
                  <th style={{ width: 60 }}></th>
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
                    <td>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
                        <QuickAdd bizId={b.id} />
                        {deleteConfirm === b.id ? (
                          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            <button className="btn danger sm" style={{ fontSize: 10, padding: "2px 6px", whiteSpace: "nowrap" }}
                              onClick={() => handleDelete(b.id)}>
                              Delete
                            </button>
                            <button className="btn ghost sm" style={{ fontSize: 10, padding: "2px 6px" }}
                              onClick={() => setDeleteConfirm(null)}>
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            className="icon-btn"
                            title="Delete business"
                            onClick={() => setDeleteConfirm(b.id)}
                            style={{ color: "var(--text-3)" }}
                          >
                            <IconTrash size={13} />
                          </button>
                        )}
                      </div>
                    </td>
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
