"use client";
import React from "react";
import { usePace } from "@/lib/store";
import { isDM, isSale, isQuoted } from "@/lib/data";
import { Stat } from "@/components/ui";
import { IconFunnel, IconLocation } from "@/components/icons";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area,
  BarChart, Bar, Legend,
} from "recharts";

const CHART_COLORS = {
  accent: "#2D5BFF",
  success: "#1B7A3D",
  warning: "#B8651E",
  danger: "#B23A3A",
  purple: "#6940B7",
  muted: "#9A9A9A",
  orange: "#C8651A",
};

const OUTCOME_COLORS: Record<string, string> = {
  CB: CHART_COLORS.warning,
  IM: CHART_COLORS.accent,
  IMPQ: CHART_COLORS.accent,
  MA: CHART_COLORS.purple,
  MAPQ: CHART_COLORS.purple,
  MAS: CHART_COLORS.success,
  IS: CHART_COLORS.success,
  NI: CHART_COLORS.danger,
  BC: CHART_COLORS.muted,
  BCD: CHART_COLORS.muted,
  NDM: CHART_COLORS.muted,
  R: CHART_COLORS.orange,
};

export function StatsScreen() {
  const { visits, services, areas, businessesById, outcomes } = usePace();
  const [tab, setTab] = React.useState("overview");

  const items = visits.flatMap((v) => v.items.map((it) => ({ ...it, date: v.date, bizId: v.bizId })));
  const totalContacts = items.length;
  const totalDms = items.filter((it) => isDM(it.out)).length;
  const totalQuotes = items.filter((it) => isQuoted(it.out)).length;
  const totalSales = items.filter((it) => isSale(it.out)).length;
  const referrals = items.filter((it) => it.out === "R").length;

  const dmHitRate = totalContacts ? Math.round((totalDms / totalContacts) * 100) : 0;
  const convRate = totalDms ? Math.round((totalSales / totalDms) * 100) : 0;
  const pitchToSale = totalContacts ? ((totalSales / totalContacts) * 100).toFixed(1) : "0";

  // By area
  const byArea: Record<string, { name: string; total: number; dm: number; sales: number }> = {};
  areas.forEach((a) => byArea[a] = { name: a, total: 0, dm: 0, sales: 0 });
  items.forEach((it) => {
    const biz = businessesById[it.bizId];
    if (!biz || !byArea[biz.area]) return;
    byArea[biz.area].total++;
    if (isDM(it.out)) byArea[biz.area].dm++;
    if (isSale(it.out)) byArea[biz.area].sales++;
  });
  const areasSorted = Object.values(byArea).sort((a, b) => b.dm - a.dm);
  const maxArea = Math.max(...areasSorted.map((a) => a.total), 1);

  // Weekly data
  const now = new Date();
  const weeks: { start: Date; end: Date; label: string; contacts: number; dm: number; sales: number; conv: number }[] = [];
  for (let w = 7; w >= 0; w--) {
    const end = new Date(now); end.setDate(end.getDate() - w * 7);
    const start = new Date(end); start.setDate(start.getDate() - 7);
    weeks.push({ start, end, label: `W${(8 - w)}`, contacts: 0, dm: 0, sales: 0, conv: 0 });
  }
  items.forEach((it) => {
    const d = new Date(it.date);
    const w = weeks.find((wk) => d >= wk.start && d < wk.end);
    if (!w) return;
    w.contacts++;
    if (isDM(it.out)) w.dm++;
    if (isSale(it.out)) w.sales++;
  });
  weeks.forEach((w) => { w.conv = w.dm ? Math.round((w.sales / w.dm) * 100) : 0; });
  const maxWeek = Math.max(...weeks.map((w) => w.dm + w.sales), 1);

  // By service
  const bySvc: Record<string, { svc: string; label: string; pitches: number; dm: number; sales: number }> = {};
  Object.entries(services).forEach(([s, info]) => bySvc[s] = { svc: s, label: info.label, pitches: 0, dm: 0, sales: 0 });
  items.forEach((it) => {
    if (!bySvc[it.svc]) bySvc[it.svc] = { svc: it.svc, label: it.svc, pitches: 0, dm: 0, sales: 0 };
    bySvc[it.svc].pitches++;
    if (isDM(it.out)) bySvc[it.svc].dm++;
    if (isSale(it.out)) bySvc[it.svc].sales++;
  });
  const svcSorted = Object.values(bySvc).sort((a, b) => b.pitches - a.pitches);
  const maxSvc = Math.max(...svcSorted.map((s) => s.pitches), 1);

  // Outcome distribution for donut
  const outDist: Record<string, number> = {};
  items.forEach((it) => { outDist[it.out] = (outDist[it.out] || 0) + 1; });
  const donutData = Object.entries(outDist)
    .map(([code, count]) => ({ name: outcomes[code]?.label || code, code, value: count }))
    .sort((a, b) => b.value - a.value);

  // Activity heatmap (past 30 days)
  const activityData: { day: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
    const count = visits.filter((v) => {
      const vd = new Date(v.date);
      return vd >= dayStart && vd <= dayEnd;
    }).length;
    activityData.push({ day: label, count });
  }

  // Average deal cycle
  const wonBizzes = Object.values(businessesById).filter((b) => b.stage === "won");
  const avgCycle = wonBizzes.length > 0
    ? Math.round(wonBizzes.reduce((sum, b) => {
        if (b.visits.length < 2) return sum;
        const first = new Date(b.visits[b.visits.length - 1].date).getTime();
        const last = new Date(b.visits[0].date).getTime();
        return sum + (last - first) / 86400000;
      }, 0) / wonBizzes.length)
    : 0;

  // Win/loss by area
  const winLossData = areas.map((a) => {
    const bizzes = Object.values(businessesById).filter((b) => b.area === a);
    return {
      name: a,
      won: bizzes.filter((b) => b.stage === "won").length,
      lost: bizzes.filter((b) => b.stage === "lost").length,
    };
  }).filter((d) => d.won > 0 || d.lost > 0);

  const funnel = [
    { label: "Contacts",     value: totalContacts, tone: "muted" },
    { label: "DMs spoken",   value: totalDms,      tone: "accent" },
    { label: "Quotes given", value: totalQuotes,   tone: "warning" },
    { label: "Sales closed", value: totalSales,    tone: "success" },
  ];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "conversion", label: "Conversion" },
    { id: "areas", label: "Areas" },
    { id: "services", label: "Services" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <>
      <div className="view-h">
        <div>
          <h1 className="view-title">Stats</h1>
          <p className="view-sub">Last 8 weeks · {totalContacts} contacts · {totalSales} sales · {convRate}% conversion</p>
        </div>
      </div>

      <div className="stats-tabs">
        {tabs.map((t) => (
          <button key={t.id} className={"stats-tab" + (tab === t.id ? " active" : "")}
                  onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <>
          <div className="grid grid-4" style={{ gap: 16, marginBottom: 16 }}>
            <Stat label="Total contacts" value={totalContacts} sub={`${Object.keys(businessesById).length} businesses`} />
            <Stat label="DMs spoken" value={totalDms} sub={`${dmHitRate}% hit rate`} />
            <Stat label="Sales closed" value={totalSales} sub={`${convRate}% conversion`} subTone="pos" />
            <Stat label="Avg deal cycle" value={`${avgCycle}d`} sub={`${wonBizzes.length} won businesses`} />
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="grid grid-2" style={{ gap: 24 }}>
              <div>
                <div className="card-h" style={{ marginBottom: 18 }}>
                  <div>
                    <h3 className="card-title">Conversion funnel</h3>
                    <p className="card-sub">From every door to every sale</p>
                  </div>
                  <IconFunnel size={14} style={{ color: "var(--text-3)" }} />
                </div>
                <div className="col" style={{ gap: 10 }}>
                  {funnel.map((f) => (
                    <div className="funnel-row" key={f.label}>
                      <div className="lbl">{f.label}</div>
                      <div className="bar-track" style={{ height: 18 }}>
                        <div className={`bar-fill ${f.tone}`} style={{ width: `${totalContacts ? (f.value / totalContacts) * 100 : 0}%` }} />
                      </div>
                      <div className="num">{f.value}</div>
                    </div>
                  ))}
                </div>
                <hr className="div" />
                <div className="grid grid-3" style={{ gap: 12 }}>
                  <div>
                    <div className="muted" style={{ fontSize: 11.5, fontWeight: 500 }}>DM hit rate</div>
                    <div style={{ fontSize: 18, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{dmHitRate}%</div>
                  </div>
                  <div>
                    <div className="muted" style={{ fontSize: 11.5, fontWeight: 500 }}>Pitch → conv.</div>
                    <div style={{ fontSize: 18, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{pitchToSale}%</div>
                  </div>
                  <div>
                    <div className="muted" style={{ fontSize: 11.5, fontWeight: 500 }}>Referrals</div>
                    <div style={{ fontSize: 18, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--orange)" }}>{referrals}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="card-h" style={{ marginBottom: 18 }}>
                  <div>
                    <h3 className="card-title">Outcome distribution</h3>
                    <p className="card-sub">All outcomes by count</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={donutData} dataKey="value" nameKey="name"
                         cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                         paddingAngle={2} stroke="none">
                      {donutData.map((entry) => (
                        <Cell key={entry.code} fill={OUTCOME_COLORS[entry.code] || CHART_COLORS.muted} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8 }}>
                  {donutData.slice(0, 6).map((d) => (
                    <span key={d.code} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                      <i style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: OUTCOME_COLORS[d.code] || CHART_COLORS.muted }} />
                      {d.code} ({d.value})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Conversion tab */}
      {tab === "conversion" && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-h">
              <div>
                <h3 className="card-title">Conversion trend</h3>
                <p className="card-sub">Weekly conversion rate (sales / DMs) over time</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={weeks}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip />
                <Line type="monotone" dataKey="conv" name="Conversion %" stroke={CHART_COLORS.accent} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-h">
              <div>
                <h3 className="card-title">Data summary by week</h3>
                <p className="card-sub">DMs spoken vs sales — last 8 weeks</p>
              </div>
              <span className="muted" style={{ fontSize: 11 }}>Conversion = sales ÷ DMs</span>
            </div>
            <div className="table-wrap">
              <table className="table numeric">
                <thead>
                  <tr>
                    <th>Week</th>
                    <th className="num">Total contacts</th>
                    <th className="num">DMs spoken to</th>
                    <th className="num">Sales</th>
                    <th className="num">Conversion rate</th>
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((w) => (
                    <tr key={w.label} style={{ cursor: "default" }}>
                      <td>{w.label} · {w.end.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                      <td className="num">{w.contacts}</td>
                      <td className="num">{w.dm}</td>
                      <td className="num">{w.sales}</td>
                      <td className="num">{w.conv}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td className="num">{weeks.reduce((a, w) => a + w.contacts, 0)}</td>
                    <td className="num">{weeks.reduce((a, w) => a + w.dm, 0)}</td>
                    <td className="num">{weeks.reduce((a, w) => a + w.sales, 0)}</td>
                    <td className="num">{convRate}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style={{ marginTop: 18 }}>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weeks}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="dm" name="DMs" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sales" name="Sales" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Areas tab */}
      {tab === "areas" && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-h">
              <div>
                <h3 className="card-title">Top areas</h3>
                <p className="card-sub">By DM-spoken volume</p>
              </div>
              <IconLocation size={14} style={{ color: "var(--text-3)" }} />
            </div>
            <div className="col" style={{ gap: 10 }}>
              {areasSorted.map((a) => (
                <div key={a.name} style={{ display: "grid", gridTemplateColumns: "120px 1fr 80px", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 12.5 }}>{a.name}</div>
                  <div className="bar-track" style={{ height: 14 }}>
                    <div className="bar-fill accent" style={{ width: `${(a.total / maxArea) * 100}%` }} />
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-3)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {a.dm}/{a.total} DM
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-h">
              <div>
                <h3 className="card-title">Win / Loss by area</h3>
                <p className="card-sub">Businesses won vs lost per area</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={winLossData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                <Tooltip />
                <Bar dataKey="won" name="Won" fill={CHART_COLORS.success} radius={[0, 4, 4, 0]} />
                <Bar dataKey="lost" name="Lost" fill={CHART_COLORS.danger} radius={[0, 4, 4, 0]} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Services tab */}
      {tab === "services" && (
        <div className="card">
          <div className="card-h">
            <div>
              <h3 className="card-title">Performance per service</h3>
              <p className="card-sub">{Object.keys(services).length} services pitched</p>
            </div>
          </div>
          <div className="table-wrap">
            <table className="table numeric">
              <thead>
                <tr>
                  <th>Service</th>
                  <th className="num">Pitches</th>
                  <th className="num">DMs spoken</th>
                  <th className="num">Sales</th>
                  <th className="num">Conv. rate</th>
                </tr>
              </thead>
              <tbody>
                {svcSorted.map((s) => (
                  <tr key={s.svc} style={{ cursor: "default" }}>
                    <td>
                      <span className="pill svc" style={{ marginRight: 8 }}>{s.svc}</span>
                      <span className="muted">{s.label}</span>
                    </td>
                    <td className="num">{s.pitches}</td>
                    <td className="num">{s.dm}</td>
                    <td className="num">{s.sales}</td>
                    <td className="num">{s.dm ? Math.round((s.sales / s.dm) * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 18 }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={svcSorted}>
                <XAxis dataKey="svc" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="pitches" name="Pitches" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} />
                <Bar dataKey="sales" name="Sales" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Activity tab */}
      {tab === "activity" && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-h">
              <div>
                <h3 className="card-title">Activity heatmap</h3>
                <p className="card-sub">Daily visit count, past 30 days</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={activityData}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" name="Visits" stroke={CHART_COLORS.accent} fill={CHART_COLORS.accent} fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-3" style={{ gap: 16 }}>
            <Stat label="Most active day"
                  value={activityData.reduce((best, d) => d.count > best.count ? d : best, activityData[0])?.day || "-"}
                  sub={`${activityData.reduce((best, d) => d.count > best.count ? d : best, activityData[0])?.count || 0} visits`} />
            <Stat label="Total visits (30d)"
                  value={activityData.reduce((s, d) => s + d.count, 0)}
                  sub={`avg ${(activityData.reduce((s, d) => s + d.count, 0) / 30).toFixed(1)} / day`} />
            <Stat label="Active days"
                  value={activityData.filter((d) => d.count > 0).length}
                  sub={`of 30 days`} />
          </div>
        </>
      )}
    </>
  );
}
