"use client";
import React from "react";
import Link from "next/link";
import { usePace } from "@/lib/store";
import { useSpeechRecognition } from "@/lib/use-speech";
import { SvcOutcomePill, OutcomeKeypad, ServiceSelect } from "@/components/ui";
import { IconMic, IconPencil, IconClose, IconMicOff, IconSparkle, IconChevronRight, IconCheck, IconDown, IconTrash, IconPlus } from "@/components/icons";

const DEMO_EXTRACTION = {
  business: "Almond & Oat",
  area: "Marylebone",
  contact: "Bea Lindgren",
  role: "Owner",
  notes: "Wants partner to sign off on ECOM. Send written quote by Fri. Sister runs the Instagram so no SMM.",
  followUp: "Callback Monday \u2014 discuss ECOM quote",
  items: [
    { svc: "ECOM", out: "IMPQ" },
    { svc: "SMM",  out: "NI" },
  ],
};

const SAMPLE_TEXT =
  "Just left Almond & Oat in Marylebone. Spoke to owner Bea Lindgren \u2014 interested in ECOM, wants partner to weigh in. Send quote by Fri. Pitched SMM, no thanks (sister runs IG).";

interface Extraction {
  business: string;
  area: string;
  contact: string;
  role: string;
  notes: string;
  followUp: string;
  items: { svc: string; out: string }[];
}

function tryExtract(text: string, businesses: { name: string; area: string; contact: string; role: string }[], areas: string[], services: Record<string, { label: string }>, outcomes: Record<string, { label: string }>): Extraction | null {
  const lc = text.toLowerCase();
  // Try to match a business
  let matchedBiz: typeof businesses[0] | null = null;
  for (const b of businesses) {
    if (lc.includes(b.name.toLowerCase())) { matchedBiz = b; break; }
  }
  // Match area
  let area = matchedBiz?.area || "";
  for (const a of areas) {
    if (lc.includes(a.toLowerCase())) { area = a; break; }
  }
  // Match services
  const matchedSvcs: string[] = [];
  for (const [code, info] of Object.entries(services)) {
    if (lc.includes(code.toLowerCase()) || lc.includes(info.label.toLowerCase())) {
      matchedSvcs.push(code);
    }
  }
  // Match outcomes
  let matchedOut = "CB";
  for (const code of Object.keys(outcomes)) {
    if (lc.includes(code.toLowerCase())) { matchedOut = code; break; }
  }
  // Check for sale keywords
  if (lc.includes("sold") || lc.includes("sale") || lc.includes("deposit")) matchedOut = "IS";
  else if (lc.includes("not interested") || lc.includes("no thanks")) matchedOut = "NI";
  else if (lc.includes("booked") || lc.includes("meeting") || lc.includes("appointment")) matchedOut = "MA";
  else if (lc.includes("quote")) matchedOut = "IMPQ";
  else if (lc.includes("callback") || lc.includes("call back") || lc.includes("try again")) matchedOut = "CB";
  else if (lc.includes("referral") || lc.includes("referred")) matchedOut = "R";
  else if (lc.includes("closed")) matchedOut = "BC";
  else if (lc.includes("no decision maker") || lc.includes("ndm")) matchedOut = "NDM";

  const items = matchedSvcs.length > 0
    ? matchedSvcs.map((s) => ({ svc: s, out: matchedOut }))
    : [{ svc: Object.keys(services)[0] || "GBPO", out: matchedOut }];

  if (!matchedBiz && matchedSvcs.length === 0) return null;

  return {
    business: matchedBiz?.name || "",
    area,
    contact: matchedBiz?.contact || "",
    role: matchedBiz?.role || "Owner",
    notes: text.slice(0, 200),
    followUp: "",
    items,
  };
}

export function LogVisitScreen() {
  const { areas, services, outcomes, businessesById, addVisit, addBusiness } = usePace();
  const speech = useSpeechRecognition();

  const [mode, setMode] = React.useState(speech.isSupported ? "voice" : "text");
  const [state, setState] = React.useState("idle");
  const [recSec, setRecSec] = React.useState(0);
  const [textInput, setTextInput] = React.useState("");
  const [extraction, setExtraction] = React.useState<Extraction | null>(null);

  React.useEffect(() => {
    if (state !== "recording") return;
    setRecSec(0);
    const t = setInterval(() => setRecSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  React.useEffect(() => {
    if (state === "recording" && recSec >= 60) stopRecording();
  }, [recSec, state]);

  React.useEffect(() => {
    if (state !== "extracting") return;
    const sourceText = speech.transcript || textInput;
    const bizList = Object.values(businessesById).map((b) => ({
      name: b.name, area: b.area, contact: b.contact, role: b.role,
    }));
    const t = setTimeout(() => {
      const extracted = tryExtract(sourceText, bizList, areas, services, outcomes);
      setExtraction(extracted || { ...DEMO_EXTRACTION });
      setState("review");
    }, 1200);
    return () => clearTimeout(t);
  }, [state]);

  const startRecording = () => {
    speech.reset();
    speech.start();
    setState("recording");
  };

  const stopRecording = () => {
    speech.stop();
    setState("extracting");
  };

  const reset = () => {
    setState("idle");
    setRecSec(0);
    speech.reset();
    setExtraction(null);
    setTextInput("");
  };

  const extractFromText = () => {
    setState("extracting");
  };

  const useSample = () => setTextInput(SAMPLE_TEXT);

  const updateExtraction = (patch: Partial<Extraction>) => setExtraction((e) => e ? { ...e, ...patch } : e);
  const updateItem = (idx: number, patch: Partial<{ svc: string; out: string }>) => setExtraction((e) => e ? ({
    ...e,
    items: e.items.map((it, i) => i === idx ? { ...it, ...patch } : it),
  }) : e);
  const removeItem = (idx: number) => setExtraction((e) => e ? ({ ...e, items: e.items.filter((_, i) => i !== idx) }) : e);
  const addItem    = () => setExtraction((e) => e ? ({ ...e, items: [...e.items, { svc: Object.keys(services)[0] || "GBPO", out: "CB" }] }) : e);

  const save = () => {
    if (!extraction) return;
    // Find or create business
    let bizId = Object.values(businessesById).find((b) => b.name === extraction.business)?.id;
    if (!bizId) {
      bizId = `b-${Date.now()}`;
      addBusiness({
        id: bizId,
        name: extraction.business || "Unknown",
        type: "Business",
        area: extraction.area || areas[0] || "Unknown",
        contact: extraction.contact || "Unknown",
        role: extraction.role || "Owner",
      });
    }
    addVisit({
      id: `v-${Date.now()}`,
      bizId,
      date: new Date().toISOString(),
      via: mode,
      notes: extraction.notes,
      items: extraction.items,
    });
    setState("saved");
  };

  const timeStr = `${String(Math.floor(recSec / 60)).padStart(2, "0")}:${String(recSec % 60).padStart(2, "0")}`;
  const showWarn = state === "recording" && recSec >= 45;
  const sourceText = speech.transcript || textInput;

  return (
    <>
      <div className="view-h">
        <div>
          <h1 className="view-title">Log visit</h1>
          <p className="view-sub">
            {state === "saved"
              ? "Saved \u00B7 keep going."
              : !speech.isSupported && mode === "voice"
                ? "Voice not supported in this browser. Use text mode."
                : "Talk or type \u2014 AI structures it for you."}
          </p>
        </div>
        <div className="view-h-actions">
          {(state !== "idle" && state !== "saved") && (
            <button className="btn ghost sm" onClick={reset}>
              <IconClose size={13} /> Discard
            </button>
          )}
        </div>
      </div>

      {speech.error && (
        <div className="card" style={{ marginBottom: 12, padding: 12, background: "var(--danger-bg)", border: "1px solid var(--danger)", borderRadius: 8, fontSize: 13, color: "var(--danger)" }}>
          {speech.error}
        </div>
      )}

      {state === "idle" && (
        <div className="grid grid-2" style={{ gap: 12, marginBottom: 20 }}>
          <button className="mode-card" data-on={mode === "voice" ? "1" : "0"}
                  onClick={() => setMode("voice")}
                  disabled={!speech.isSupported}>
            <div className="ic">{speech.isSupported ? <IconMic size={16} /> : <IconMicOff size={16} />}</div>
            <div className="ttl">Voice memo{!speech.isSupported && " (unavailable)"}</div>
            <div className="desc">
              {speech.isSupported
                ? "Talk for 20\u201360 seconds after a visit. AI extracts the structure."
                : "Voice recognition is not supported in this browser."}
            </div>
          </button>
          <button className="mode-card" data-on={mode === "text" ? "1" : "0"} onClick={() => setMode("text")}>
            <div className="ic"><IconPencil size={16} /></div>
            <div className="ttl">Type or paste notes</div>
            <div className="desc">Tablet, phone, anywhere. Plain English works.</div>
          </button>
        </div>
      )}

      {mode === "voice" && speech.isSupported && (state === "idle" || state === "recording") && (
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <button className={"mic-btn" + (state === "recording" ? " recording" : "")}
                  onClick={state === "idle" ? startRecording : stopRecording}>
            {state === "recording" ? <IconMicOff size={32} /> : <IconMic size={36} />}
          </button>

          <div style={{ marginTop: 18, fontSize: 13.5, color: "var(--text-2)", minHeight: 24 }}>
            {state === "idle" && <>Tap to start · we&apos;ll auto-stop after 60s</>}
            {state === "recording" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 16, color: "var(--danger)", fontWeight: 500 }}>
                <span style={{ color: "var(--danger)" }}>
                  <span className="wave">
                    <i /><i /><i /><i /><i /><i /><i />
                  </span>
                </span>
                <span className="mono" style={{ fontVariantNumeric: "tabular-nums" }}>{timeStr}</span>
                {showWarn && <span style={{ color: "var(--warning)", fontSize: 12 }}>auto-stop in {60 - recSec}s</span>}
                <button className="btn secondary sm" onClick={stopRecording}>Stop</button>
              </span>
            )}
          </div>

          {/* Live transcript during recording */}
          {state === "recording" && (speech.transcript || speech.interimTranscript) && (
            <div style={{ marginTop: 18, textAlign: "left", maxWidth: 640, marginLeft: "auto", marginRight: "auto",
                          background: "var(--surface-2)", padding: 14, borderRadius: 8, fontSize: 14, lineHeight: 1.55, color: "var(--text)" }}>
              {speech.transcript}
              {speech.interimTranscript && (
                <span style={{ color: "var(--text-3)" }}>{speech.interimTranscript}</span>
              )}
              <span style={{ display: "inline-block", width: 8, height: 16, background: "var(--accent)", verticalAlign: "middle", marginLeft: 2, animation: "blink 0.7s infinite" }} />
            </div>
          )}
        </div>
      )}

      {mode === "text" && state === "idle" && (
        <div className="card">
          <div className="card-h">
            <div>
              <h3 className="card-title">Notes</h3>
              <p className="card-sub">Plain English \u2014 we&apos;ll do the structure.</p>
            </div>
            <button className="btn ghost sm" onClick={useSample}>Use sample</button>
          </div>
          <textarea className="textarea" rows={6}
                    placeholder="e.g. Stopped by Tony's Barbers in Hackney. Tony was in \u2014 sold him on GBP audit, MA booked Wed 10am\u2026"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button className="btn accent" onClick={extractFromText} disabled={!textInput.trim()}>
              <IconSparkle size={14} /> Extract with AI
            </button>
          </div>
        </div>
      )}

      {state === "extracting" && (
        <div className="card">
          <div className="muted" style={{ fontSize: 11.5, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
            {mode === "voice" ? "Transcript" : "Source text"}
          </div>
          <div style={{ background: "var(--surface-2)", padding: 14, borderRadius: 8, fontSize: 13.5, lineHeight: 1.55, fontStyle: "italic", color: "var(--text)" }}>
            &ldquo;{sourceText}&rdquo;
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, color: "var(--accent)", fontSize: 13 }}>
            <IconSparkle size={14} />
            <span>Extracting structured visit</span>
            <span className="dots"><i /><i /><i /></span>
          </div>
          <div className="grid grid-4" style={{ gap: 10, marginTop: 14 }}>
            {[0,1,2,3].map((i) => (
              <div key={i} style={{ height: 72, borderRadius: 8, background: "var(--surface-2)",
                                    animation: `skel 1.2s ${i*120}ms ease-in-out infinite alternate` }} />
            ))}
          </div>
        </div>
      )}

      {(state === "review" || state === "saved") && extraction && (
        <ExtractedCard
          extraction={extraction}
          onChange={updateExtraction}
          onItemChange={updateItem}
          onItemRemove={removeItem}
          onItemAdd={addItem}
          state={state}
          onDiscard={reset}
          onSave={save}
          onLogAnother={reset}
          transcript={sourceText}
          via={mode}
          areas={areas}
          outcomes={outcomes}
        />
      )}

      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes skel {
          from { background: var(--surface-2); }
          to   { background: var(--surface-3); }
        }
      `}</style>
    </>
  );
}

type OutcomeMap = Record<string, { label: string; dm: boolean; sale: boolean; tone: string }>;

function ExtractedCard({ extraction, onChange, onItemChange, onItemRemove, onItemAdd, state, onDiscard, onSave, onLogAnother, transcript, via, areas, outcomes }: {
  extraction: Extraction;
  onChange: (patch: Partial<Extraction>) => void;
  onItemChange: (idx: number, patch: Partial<{ svc: string; out: string }>) => void;
  onItemRemove: (idx: number) => void;
  onItemAdd: () => void;
  state: string;
  onDiscard: () => void;
  onSave: () => void;
  onLogAnother: () => void;
  transcript: string;
  via: string;
  areas: string[];
  outcomes: OutcomeMap;
}) {
  return (
    <div className="card" style={{ animation: "viewIn 240ms ease-out" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span className="pill accent" style={{ background: "var(--accent-bg)" }}>
          <IconSparkle size={12} /> AI-extracted
        </span>
        <span className="muted" style={{ fontSize: 12 }}>
          from {via === "voice" ? "voice memo" : "text note"} · edit anything before saving
        </span>
      </div>

      <details style={{ marginBottom: 18 }}>
        <summary style={{ fontSize: 12, color: "var(--text-2)", cursor: "pointer", listStyle: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
          <IconChevronRight size={11} /> Show source transcript
        </summary>
        <div style={{ marginTop: 8, padding: 12, background: "var(--surface-2)", borderRadius: 8, fontSize: 12.5, fontStyle: "italic", color: "var(--text-2)" }}>
          &ldquo;{transcript}&rdquo;
        </div>
      </details>

      <div className="field-grid">
        <div>
          <label className="label">Business</label>
          <input className="input" value={extraction.business}
                 onChange={(e) => onChange({ business: e.target.value })} />
        </div>
        <div>
          <label className="label">Area</label>
          <select className="select" value={extraction.area} onChange={(e) => onChange({ area: e.target.value })}>
            {areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Contact</label>
          <input className="input" value={extraction.contact}
                 onChange={(e) => onChange({ contact: e.target.value })} />
        </div>
        <div>
          <label className="label">Role</label>
          <input className="input" value={extraction.role}
                 onChange={(e) => onChange({ role: e.target.value })} />
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label className="label">Notes</label>
        <textarea className="textarea" rows={3} value={extraction.notes}
                  onChange={(e) => onChange({ notes: e.target.value })} />
      </div>

      <hr className="div" />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.005em" }}>Services pitched</div>
          <div className="muted" style={{ fontSize: 11.5 }}>One row per service · pick an outcome from the keypad</div>
        </div>
        <button className="btn secondary sm" onClick={onItemAdd}>
          <IconPlus size={12} /> Add service
        </button>
      </div>

      <div className="col" style={{ gap: 12 }}>
        {extraction.items.map((it, i) => (
          <ServiceRow key={i}
                      item={it}
                      onChange={(p) => onItemChange(i, p)}
                      onRemove={() => onItemRemove(i)}
                      outcomes={outcomes} />
        ))}
      </div>

      <hr className="div" />

      <div>
        <label className="label">Follow-up</label>
        <input className="input" value={extraction.followUp}
               onChange={(e) => onChange({ followUp: e.target.value })} />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 22 }}>
        {state === "saved" ? (
          <>
            <span style={{ marginRight: "auto", display: "inline-flex", alignItems: "center", gap: 8, color: "var(--success)", fontSize: 13, fontWeight: 500 }}>
              <span style={{ width: 18, height: 18, borderRadius: 999, background: "var(--success)", color: "#fff", display: "grid", placeItems: "center" }}>
                <IconCheck size={12} />
              </span>
              Synced to Master · visible across all devices
            </span>
            <Link href="/" className="btn secondary">Back to Today</Link>
            <button className="btn accent" onClick={onLogAnother}>
              <IconMic size={14} /> Log another
            </button>
          </>
        ) : (
          <>
            <button className="btn ghost" onClick={onDiscard}>Discard</button>
            <button className="btn accent" onClick={onSave}>
              <IconCheck size={14} /> Save & sync
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ServiceRow({ item, onChange, onRemove, outcomes }: {
  item: { svc: string; out: string };
  onChange: (patch: Partial<{ svc: string; out: string }>) => void;
  onRemove: () => void;
  outcomes: OutcomeMap;
}) {
  const [showKeypad, setShowKeypad] = React.useState(false);
  const o = outcomes[item.out];
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "var(--surface-2)" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 160px", minWidth: 140 }}>
          <ServiceSelect value={item.svc} onChange={(v) => onChange({ svc: v })} />
        </div>
        <button className="btn secondary" style={{ minWidth: 160, justifyContent: "space-between" }}
                onClick={() => setShowKeypad((s) => !s)}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span className="mono" style={{ fontWeight: 600, color: o ? `var(--${o.tone === "muted" ? "text-2" : o.tone})` : undefined }}>{item.out}</span>
            <span className="muted">{o?.label || item.out}</span>
          </span>
          <IconDown size={12} />
        </button>
        <SvcOutcomePill svc={item.svc} out={item.out} outcomes={outcomes} />
        <button className="icon-btn" onClick={onRemove} title="Remove">
          <IconTrash size={14} />
        </button>
      </div>
      {showKeypad && (
        <div style={{ marginTop: 12, padding: 12, background: "var(--surface)", borderRadius: 8, border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 500 }}>Pick outcome</span>
            <span className="muted" style={{ fontSize: 11 }}>{Object.keys(outcomes).length} options · tap to select</span>
          </div>
          <OutcomeKeypad value={item.out} onChange={(v) => { onChange({ out: v }); setShowKeypad(false); }} outcomes={outcomes} />
        </div>
      )}
    </div>
  );
}
