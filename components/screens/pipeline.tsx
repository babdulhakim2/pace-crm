"use client";
import React from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePace } from "@/lib/store";
import { formatAgo, type EnrichedBusiness } from "@/lib/data";
import { SvcOutcomePill, STAGE_META } from "@/components/ui";
import { QuickAdd } from "@/components/quick-add";
import { IconClock, IconArrowRight, IconCheck, IconClose } from "@/components/icons";
import { useDroppable } from "@dnd-kit/core";

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={"kan-col" + (isOver ? " drop-target" : "")}>
      {children}
    </div>
  );
}

type OutcomeMap = Record<string, { label: string; dm: boolean; sale: boolean; tone: string }>;

const STAGES = ["cold", "active", "won", "lost"] as const;

function StageMoveButtons({ bizId, currentStage, onMove }: {
  bizId: string;
  currentStage: string;
  onMove: (bizId: string, stage: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="btn ghost sm"
        style={{ fontSize: 10, padding: "2px 6px", whiteSpace: "nowrap" }}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      >
        Move to...
      </button>
      {open && (
        <div className="stage-menu" onClick={(e) => e.stopPropagation()}>
          {STAGES.filter((s) => s !== currentStage).map((s) => {
            const m = STAGE_META[s];
            return (
              <button
                key={s}
                className="stage-menu-item"
                onClick={() => { onMove(bizId, s); setOpen(false); }}
              >
                <span className="pill-dot" style={{ background: m.dot, width: 8, height: 8, flexShrink: 0 }} />
                {m.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SortableCard({ biz, openBiz, outcomes, onMove }: {
  biz: EnrichedBusiness;
  openBiz: (id: string) => void;
  outcomes: OutcomeMap;
  onMove: (bizId: string, stage: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: biz.id,
    data: { stage: biz.stage },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const lv = biz.lastVisit;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={"kan-card" + (isDragging ? " dragging" : "")}
    >
      {/* Drag handle area */}
      <div
        {...listeners}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "grab", touchAction: "none" }}
      >
        <div className="biz" onClick={() => openBiz(biz.id)} style={{ cursor: "pointer" }}>{biz.name}</div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <StageMoveButtons bizId={biz.id} currentStage={biz.stage} onMove={onMove} />
          <QuickAdd bizId={biz.id} />
        </div>
      </div>
      <div className="sub" onClick={() => openBiz(biz.id)} style={{ cursor: "pointer" }}>{biz.area} · {biz.contact}</div>
      <div className="pills" onClick={() => openBiz(biz.id)} style={{ marginTop: 2, cursor: "pointer" }}>
        {lv && lv.items.slice(0, 3).map((it, i) => (
          <SvcOutcomePill key={i} svc={it.svc} out={it.out} outcomes={outcomes} />
        ))}
        {lv && lv.items.length > 3 && (
          <span className="pill" style={{ background: "var(--surface-2)" }}>+{lv.items.length - 3}</span>
        )}
      </div>
      <div className="foot" onClick={() => openBiz(biz.id)} style={{ cursor: "pointer" }}>
        <span>{lv ? formatAgo(lv.date) : "\u2014"}</span>
        <span>{biz.contactCount} contact{biz.contactCount !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}

function OverlayCard({ biz, outcomes }: { biz: EnrichedBusiness; outcomes: OutcomeMap }) {
  const lv = biz.lastVisit;
  return (
    <div className="kan-card kan-card-drag-overlay">
      <div className="biz">{biz.name}</div>
      <div className="sub">{biz.area} · {biz.contact}</div>
      <div className="pills" style={{ marginTop: 2 }}>
        {lv && lv.items.slice(0, 3).map((it, i) => (
          <SvcOutcomePill key={i} svc={it.svc} out={it.out} outcomes={outcomes} />
        ))}
      </div>
      <div className="foot">
        <span>{lv ? formatAgo(lv.date) : "\u2014"}</span>
        <span>{biz.contactCount} contact{biz.contactCount !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}

export function PipelineScreen({ openBiz }: { openBiz: (id: string) => void }) {
  const { businessesById, updateBusinessStage, outcomes } = usePace();
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const stages = [
    { key: "cold",   label: "Cold",   desc: "No DM spoken yet",       icon: <IconClock size={14} /> },
    { key: "active", label: "Active", desc: "In progress with DM",    icon: <IconArrowRight size={14} /> },
    { key: "won",    label: "Won",    desc: "Sale closed",            icon: <IconCheck size={14} /> },
    { key: "lost",   label: "Lost",   desc: "Declined or shut",       icon: <IconClose size={14} /> },
  ];

  const grouped: Record<string, EnrichedBusiness[]> = { cold: [], active: [], won: [], lost: [] };
  Object.values(businessesById).forEach((b) => {
    if (grouped[b.stage]) grouped[b.stage].push(b);
    else grouped.cold.push(b);
  });
  Object.values(grouped).forEach((arr) =>
    arr.sort((a, b) =>
      new Date((b.lastVisit || { date: "1970-01-01" }).date).getTime() -
      new Date((a.lastVisit || { date: "1970-01-01" }).date).getTime()
    )
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const bizId = active.id as string;
    let targetStage: string | null = null;

    if (["cold", "active", "won", "lost"].includes(over.id as string)) {
      targetStage = over.id as string;
    } else {
      const overBiz = businessesById[over.id as string];
      if (overBiz) targetStage = overBiz.stage;
    }

    if (targetStage && businessesById[bizId]?.stage !== targetStage) {
      updateBusinessStage(bizId, targetStage);
    }
  };

  const handleMove = (bizId: string, stage: string) => {
    updateBusinessStage(bizId, stage);
  };

  const activeBiz = activeId ? businessesById[activeId] : null;

  return (
    <>
      <div className="view-h">
        <div>
          <h1 className="view-title">Pipeline</h1>
          <p className="view-sub">Drag cards or use &ldquo;Move to&rdquo; buttons to change stage</p>
        </div>
        <div className="view-h-actions">
          <span className="muted" style={{ fontSize: 12 }}>{Object.keys(businessesById).length} businesses</span>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban">
          {stages.map((s) => {
            const items = grouped[s.key];
            const m = STAGE_META[s.key];
            return (
              <DroppableColumn key={s.key} id={s.key}>
                <div className="kan-col-h">
                  <Link href={`/businesses?stage=${s.key}`} style={{ textDecoration: "none", color: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span className="name">
                      <span className="pill-dot" style={{ background: m.dot, width: 8, height: 8 }} />
                      {s.label}
                    </span>
                    <span className="count">{items.length}</span>
                  </Link>
                </div>
                <SortableContext items={items.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  {items.length === 0 ? (
                    <div className="kan-empty">{s.desc}</div>
                  ) : items.map((b) => (
                    <SortableCard key={b.id} biz={b} openBiz={openBiz} outcomes={outcomes} onMove={handleMove} />
                  ))}
                </SortableContext>
              </DroppableColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeBiz ? <OverlayCard biz={activeBiz} outcomes={outcomes} /> : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
