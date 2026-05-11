"use client";
import React from "react";
import Link from "next/link";
import { usePace } from "@/lib/store";
import { isDM, isSale, formatAgo, todayLabel } from "@/lib/data";
import { SvcOutcomePill, Stat } from "@/components/ui";
import { QuickAdd } from "@/components/quick-add";
import { IconClipboard, IconUser, IconCheck, IconPhone, IconCalendar, IconLocation, IconMic, IconPencil, IconArrowRight } from "@/components/icons";
import { ScheduleCallButton } from "@/components/schedule-call";

export function TodayScreen({ openBiz, freshVisitIds }: {
  openBiz: (id: string) => void;
  freshVisitIds?: Set<string>;
}) {
  const { visits, businessesById, allVisitsSorted, outcomes } = usePace();

  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
  const items = visits.flatMap((v) => v.items.map((it) => ({ ...it, date: v.date, bizId: v.bizId, visitId: v.id })));
  const itemsWk = items.filter((it) => new Date(it.date) >= weekAgo);
  const totalContacts = itemsWk.length;
  const bizSet = new Set(itemsWk.map((it) => it.bizId));
  const dms = itemsWk.filter((it) => isDM(it.out)).length;
  const sales = itemsWk.filter((it) => isSale(it.out)).length;
  const callbacks14 = items.filter((it) => it.out === "CB" && (new Date().getTime() - new Date(it.date).getTime()) < 14 * 86400000).length;
  const hitRate = totalContacts ? Math.round((dms / totalContacts) * 100) : 0;
  const convRate = dms ? Math.round((sales / dms) * 100) : 0;

  const twoWeeks = new Date(now); twoWeeks.setDate(twoWeeks.getDate() - 14);
  const itemsLastWk = items.filter((it) => new Date(it.date) >= twoWeeks && new Date(it.date) < weekAgo);
  const lastDms = itemsLastWk.filter((it) => isDM(it.out)).length;
  const lastSales = itemsLastWk.filter((it) => isSale(it.out)).length;
  const lastConv = lastDms ? Math.round((lastSales / lastDms) * 100) : 0;
  const convDelta = convRate - lastConv;

  const recent = allVisitsSorted.slice(0, 8);

  const meetingOutcomes = new Set(["MA", "IM", "MAPQ", "IMPQ", "MAS"]);
  const meetingBusinesses = Object.values(businessesById)
    .filter((b) => b.lastVisit && b.lastVisit.items.some((it) => meetingOutcomes.has(it.out)))
    .sort((a, b) => new Date(b.lastVisit!.date).getTime() - new Date(a.lastVisit!.date).getTime())
    .slice(0, 4);

  const cbBusinesses = Object.values(businessesById)
    .filter((b) => b.lastVisit && b.lastVisit.items.some((it) => it.out === "CB"))
    .sort((a, b) => new Date(b.lastVisit!.date).getTime() - new Date(a.lastVisit!.date).getTime())
    .slice(0, 4);

  return (
    <>
      <div className="view-h">
        <div>
          <h1 className="view-title">{todayLabel()}</h1>
          <p className="view-sub">Good morning · {bizSet.size} doors hit so far this week</p>
        </div>
        <div className="view-h-actions">
          <Link href="/map" className="btn secondary">
            <IconLocation size={14} /> Where to next
          </Link>
          <Link href="/log" className="btn accent lg">
            <IconMic size={14} /> Log visit
          </Link>
        </div>
      </div>

      <div className="grid grid-4" style={{ gap: 16, marginBottom: 20 }}>
        <Link href="/businesses?filter=contacted" style={{ textDecoration: "none", color: "inherit" }}>
          <Stat label={<><IconClipboard size={13} /> Total contacts</>}
                value={totalContacts}
                sub={`across ${bizSet.size} businesses`} />
        </Link>
        <Link href="/businesses?filter=dm" style={{ textDecoration: "none", color: "inherit" }}>
          <Stat label={<><IconUser size={13} /> DMs spoken to</>}
                value={dms}
                sub={`${hitRate}% hit rate`} />
        </Link>
        <Link href="/businesses?filter=sale" style={{ textDecoration: "none", color: "inherit" }}>
          <Stat label={<><IconCheck size={13} /> Sales</>}
                value={sales}
                sub={convDelta >= 0 ? `${convRate}% conv. · +${convDelta}pp vs last wk` : `${convRate}% conv. · ${convDelta}pp vs last wk`}
                subTone={convDelta >= 0 ? "pos" : "neg"} />
        </Link>
        <Link href="/businesses?filter=callback" style={{ textDecoration: "none", color: "inherit" }}>
          <Stat label={<><IconPhone size={13} /> Callbacks due</>}
                value={callbacks14}
                sub="in last 14 days" />
        </Link>
      </div>

      <div className="grid grid-2-1" style={{ gap: 16 }}>
        <div className="card flush">
          <div className="card-h" style={{ padding: "16px 18px 10px", marginBottom: 0, borderBottom: "1px solid var(--border)" }}>
            <div>
              <h3 className="card-title">Recent activity</h3>
              <p className="card-sub">Every contact event across all devices</p>
            </div>
            <Link href="/trail" className="btn ghost sm">
              View all <IconArrowRight size={12} />
            </Link>
          </div>
          <div className="list" style={{ padding: "0 18px 12px" }}>
            {recent.map((v) => {
              const biz = businessesById[v.bizId];
              if (!biz) return null;
              const isFresh = freshVisitIds && freshVisitIds.has(v.id);
              return (
                <div key={v.id} className={"list-row" + (isFresh ? " fresh" : "")}
                     onClick={() => openBiz(biz.id)}>
                  <div className={"via" + (v.via === "voice" ? " voice" : "")}>
                    {v.via === "voice" ? <IconMic size={14} /> : <IconPencil size={14} />}
                  </div>
                  <div className="main-col">
                    <div className="biz" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {biz.name}
                      {isFresh && <span style={{ marginLeft: 8, fontSize: 10.5, color: "var(--success)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>· new</span>}
                    </div>
                    <div className="meta">{biz.area} · {biz.contact}</div>
                  </div>
                  <div className="pills">
                    {v.items.map((it, i) => <SvcOutcomePill key={i} svc={it.svc} out={it.out} outcomes={outcomes} />)}
                  </div>
                  <QuickAdd bizId={biz.id} />
                  <div className="right">{formatAgo(v.date)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="card-h">
              <div>
                <h3 className="card-title">Meetings booked</h3>
                <p className="card-sub">{meetingBusinesses.length} upcoming</p>
              </div>
              <span className="pill purple" style={{ background: "var(--purple-bg)" }}>
                <IconCalendar size={12} />
                {meetingBusinesses.length}
              </span>
            </div>
            <div className="col" style={{ gap: 2 }}>
              {meetingBusinesses.map((b) => (
                <div key={b.id} className="list-row" style={{ padding: "8px 0" }} onClick={() => openBiz(b.id)}>
                  <div className="main-col">
                    <div className="biz">{b.name}</div>
                    <div className="meta">{b.area}</div>
                  </div>
                  <ScheduleCallButton bizName={b.name} contact={b.contact} area={b.area} />
                  <div className="right">{formatAgo(b.lastVisit!.date)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <div>
                <h3 className="card-title">Callbacks due</h3>
                <p className="card-sub">Top {cbBusinesses.length}</p>
              </div>
              <span className="pill warning">
                <IconPhone size={12} />
                {callbacks14}
              </span>
            </div>
            <div className="col" style={{ gap: 2 }}>
              {cbBusinesses.map((b) => (
                <div key={b.id} className="list-row" style={{ padding: "8px 0" }} onClick={() => openBiz(b.id)}>
                  <div className="main-col">
                    <div className="biz">{b.name}</div>
                    <div className="meta">{b.area} · {b.contact}</div>
                  </div>
                  <ScheduleCallButton bizName={b.name} contact={b.contact} area={b.area} />
                  <div className="right">{formatAgo(b.lastVisit!.date)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
