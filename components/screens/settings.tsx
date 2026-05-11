"use client";
import React from "react";
import { usePace } from "@/lib/store";
import { deleteAccountAction } from "@/app/actions/account";
import { IconUser, IconPlus, IconTrash, IconCheck, IconClose } from "@/components/icons";

const TONE_OPTIONS = ["muted", "accent", "success", "danger", "warning", "purple", "orange"];

export function SettingsScreen() {
  const {
    userName, setUserName, services, addService, updateService, removeService,
    areas, addArea, removeArea, outcomes, addOutcome, updateOutcome, removeOutcome,
    resetToDemo, clearAll,
  } = usePace();

  const [newSvcCode, setNewSvcCode] = React.useState("");
  const [newSvcLabel, setNewSvcLabel] = React.useState("");
  const [newArea, setNewArea] = React.useState("");
  const [editSvc, setEditSvc] = React.useState<string | null>(null);
  const [editLabel, setEditLabel] = React.useState("");
  const [showConfirmReset, setShowConfirmReset] = React.useState(false);
  const [showConfirmClear, setShowConfirmClear] = React.useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = React.useState(false);
  const [deletePassword, setDeletePassword] = React.useState("");
  const [deleteError, setDeleteError] = React.useState("");
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // Confirm-delete state
  const [confirmDeleteSvc, setConfirmDeleteSvc] = React.useState<string | null>(null);
  const [confirmDeleteArea, setConfirmDeleteArea] = React.useState<string | null>(null);
  const [confirmDeleteOutcome, setConfirmDeleteOutcome] = React.useState<string | null>(null);

  // Outcome editing state
  const [editOutcome, setEditOutcome] = React.useState<string | null>(null);
  const [editOutcomeData, setEditOutcomeData] = React.useState({ label: "", dm: false, sale: false, tone: "muted" });

  // New outcome form
  const [newOutCode, setNewOutCode] = React.useState("");
  const [newOutLabel, setNewOutLabel] = React.useState("");
  const [newOutDm, setNewOutDm] = React.useState(false);
  const [newOutSale, setNewOutSale] = React.useState(false);
  const [newOutTone, setNewOutTone] = React.useState("muted");

  const handleAddService = () => {
    const code = newSvcCode.trim().toUpperCase();
    const label = newSvcLabel.trim();
    if (!code || !label) return;
    if (services[code]) return;
    addService(code, label);
    setNewSvcCode("");
    setNewSvcLabel("");
  };

  const handleAddArea = () => {
    const name = newArea.trim();
    if (!name) return;
    addArea(name);
    setNewArea("");
  };

  const startEdit = (code: string) => {
    setEditSvc(code);
    setEditLabel(services[code].label);
  };

  const saveEdit = () => {
    if (editSvc && editLabel.trim()) {
      updateService(editSvc, editLabel.trim());
    }
    setEditSvc(null);
    setEditLabel("");
  };

  const startEditOutcome = (code: string) => {
    const o = outcomes[code];
    setEditOutcome(code);
    setEditOutcomeData({ label: o.label, dm: o.dm, sale: o.sale, tone: o.tone });
  };

  const saveOutcomeEdit = () => {
    if (editOutcome && editOutcomeData.label.trim()) {
      updateOutcome(editOutcome, {
        label: editOutcomeData.label.trim(),
        dm: editOutcomeData.dm,
        sale: editOutcomeData.sale,
        tone: editOutcomeData.tone,
      });
    }
    setEditOutcome(null);
  };

  const handleAddOutcome = () => {
    const code = newOutCode.trim().toUpperCase();
    const label = newOutLabel.trim();
    if (!code || !label) return;
    if (outcomes[code]) return;
    addOutcome(code, { label, dm: newOutDm, sale: newOutSale, tone: newOutTone });
    setNewOutCode("");
    setNewOutLabel("");
    setNewOutDm(false);
    setNewOutSale(false);
    setNewOutTone("muted");
  };

  return (
    <>
      <div className="view-h">
        <div>
          <h1 className="view-title">Settings</h1>
          <p className="view-sub">Configure services, areas, outcomes, and your profile</p>
        </div>
      </div>

      {/* Profile */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-h">
          <div>
            <h3 className="card-title">Profile</h3>
            <p className="card-sub">Your display name and initials</p>
          </div>
          <IconUser size={14} style={{ color: "var(--text-3)" }} />
        </div>
        <div className="field-grid">
          <div>
            <label className="label">Display name / initials</label>
            <input
              className="input"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. TM, Tom"
              maxLength={20}
            />
          </div>
          <div>
            <label className="label">Avatar preview</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="nav-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                {userName.slice(0, 2).toUpperCase() || "?"}
              </span>
              <span className="muted" style={{ fontSize: 12 }}>Shown in the navigation bar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-h">
          <div>
            <h3 className="card-title">Services</h3>
            <p className="card-sub">{Object.keys(services).length} services configured</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {Object.entries(services).map(([code, svc]) => (
            <div key={code} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", borderRadius: 6,
              background: "var(--surface-2)", border: "1px solid var(--border)",
            }}>
              <span className="pill svc" style={{ minWidth: 48, textAlign: "center", justifyContent: "center" }}>{code}</span>
              {confirmDeleteSvc === code ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--danger)" }}>Delete {code}?</span>
                  <button className="btn danger sm" style={{ fontSize: 11 }}
                    onClick={() => { removeService(code); setConfirmDeleteSvc(null); }}>
                    Yes, delete
                  </button>
                  <button className="btn ghost sm" style={{ fontSize: 11 }} onClick={() => setConfirmDeleteSvc(null)}>Cancel</button>
                </div>
              ) : editSvc === code ? (
                <>
                  <input className="input" style={{ flex: 1 }} value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()} />
                  <button className="icon-btn" onClick={saveEdit} title="Save"><IconCheck size={14} /></button>
                  <button className="icon-btn" onClick={() => setEditSvc(null)} title="Cancel"><IconClose size={14} /></button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontSize: 13 }}>{svc.label}</span>
                  <button className="btn ghost sm" onClick={() => startEdit(code)}>Edit</button>
                  <button className="icon-btn" onClick={() => setConfirmDeleteSvc(code)} title="Remove">
                    <IconTrash size={13} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <hr className="div" />

        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ width: 80 }}>
            <label className="label">Code</label>
            <input className="input" value={newSvcCode} placeholder="e.g. PPC"
              onChange={(e) => setNewSvcCode(e.target.value)}
              maxLength={6}
              onKeyDown={(e) => e.key === "Enter" && handleAddService()} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="label">Label</label>
            <input className="input" value={newSvcLabel} placeholder="e.g. Pay-per-click ads"
              onChange={(e) => setNewSvcLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddService()} />
          </div>
          <button className="btn accent sm" onClick={handleAddService}
            disabled={!newSvcCode.trim() || !newSvcLabel.trim()}>
            <IconPlus size={12} /> Add
          </button>
        </div>
      </div>

      {/* Areas */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-h">
          <div>
            <h3 className="card-title">Areas</h3>
            <p className="card-sub">{areas.length} areas configured</p>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {areas.map((a) => (
            confirmDeleteArea === a ? (
              <div key={a} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 6, background: "var(--surface-2)", border: "1px solid var(--danger)" }}>
                <span style={{ fontSize: 11, color: "var(--danger)" }}>Delete {a}?</span>
                <button className="btn danger sm" style={{ fontSize: 10, padding: "2px 6px" }}
                  onClick={() => { removeArea(a); setConfirmDeleteArea(null); }}>
                  Yes
                </button>
                <button className="btn ghost sm" style={{ fontSize: 10, padding: "2px 6px" }} onClick={() => setConfirmDeleteArea(null)}>No</button>
              </div>
            ) : (
              <span key={a} className="pill" style={{ gap: 6, padding: "4px 6px 4px 10px" }}>
                {a}
                <button
                  style={{
                    appearance: "none", border: 0, background: "transparent", cursor: "pointer",
                    color: "var(--text-3)", padding: 0, display: "grid", placeItems: "center",
                  }}
                  onClick={() => setConfirmDeleteArea(a)}
                  title={`Remove ${a}`}
                >
                  <IconClose size={11} />
                </button>
              </span>
            )
          ))}
        </div>

        <hr className="div" />

        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label className="label">New area name</label>
            <input className="input" value={newArea} placeholder="e.g. Brixton"
              onChange={(e) => setNewArea(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddArea()} />
          </div>
          <button className="btn accent sm" onClick={handleAddArea} disabled={!newArea.trim()}>
            <IconPlus size={12} /> Add
          </button>
        </div>
      </div>

      {/* Outcomes */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-h">
          <div>
            <h3 className="card-title">Outcomes</h3>
            <p className="card-sub">{Object.keys(outcomes).length} outcome codes</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {Object.entries(outcomes).map(([code, o]) => (
            <div key={code} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", borderRadius: 6,
              background: "var(--surface-2)", border: "1px solid var(--border)",
            }}>
              {confirmDeleteOutcome === code ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--danger)" }}>Delete {code}?</span>
                  <button className="btn danger sm" style={{ fontSize: 11 }}
                    onClick={() => { removeOutcome(code); setConfirmDeleteOutcome(null); }}>
                    Yes, delete
                  </button>
                  <button className="btn ghost sm" style={{ fontSize: 11 }} onClick={() => setConfirmDeleteOutcome(null)}>Cancel</button>
                </div>
              ) : editOutcome === code ? (
                <>
                  <span className={`pill ${editOutcomeData.tone}`} style={{ minWidth: 40, textAlign: "center", justifyContent: "center" }}>
                    <span className="code">{code}</span>
                  </span>
                  <input className="input" style={{ flex: 1 }} value={editOutcomeData.label}
                    onChange={(e) => setEditOutcomeData((d) => ({ ...d, label: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && saveOutcomeEdit()} />
                  <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, cursor: "pointer" }}>
                    <input type="checkbox" checked={editOutcomeData.dm}
                      onChange={(e) => setEditOutcomeData((d) => ({ ...d, dm: e.target.checked }))} />
                    DM
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, cursor: "pointer" }}>
                    <input type="checkbox" checked={editOutcomeData.sale}
                      onChange={(e) => setEditOutcomeData((d) => ({ ...d, sale: e.target.checked }))} />
                    Sale
                  </label>
                  <select className="select" style={{ width: 90, fontSize: 11 }} value={editOutcomeData.tone}
                    onChange={(e) => setEditOutcomeData((d) => ({ ...d, tone: e.target.value }))}>
                    {TONE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button className="icon-btn" onClick={saveOutcomeEdit} title="Save"><IconCheck size={14} /></button>
                  <button className="icon-btn" onClick={() => setEditOutcome(null)} title="Cancel"><IconClose size={14} /></button>
                </>
              ) : (
                <>
                  <span className={`pill ${o.tone}`} style={{ minWidth: 40, textAlign: "center", justifyContent: "center" }}>
                    <span className="code">{code}</span>
                  </span>
                  <span style={{ flex: 1, fontSize: 13 }}>{o.label}</span>
                  {o.dm && <span style={{ fontSize: 9, opacity: 0.7, background: "var(--surface-3)", padding: "2px 5px", borderRadius: 4 }}>DM</span>}
                  {o.sale && <span style={{ fontSize: 9, opacity: 0.7, background: "var(--surface-3)", padding: "2px 5px", borderRadius: 4 }}>SALE</span>}
                  <span className="muted" style={{ fontSize: 10 }}>{o.tone}</span>
                  <button className="btn ghost sm" onClick={() => startEditOutcome(code)}>Edit</button>
                  <button className="icon-btn" onClick={() => setConfirmDeleteOutcome(code)} title="Remove">
                    <IconTrash size={13} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <hr className="div" />

        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ width: 70 }}>
            <label className="label">Code</label>
            <input className="input" value={newOutCode} placeholder="e.g. FU"
              onChange={(e) => setNewOutCode(e.target.value)}
              maxLength={6}
              onKeyDown={(e) => e.key === "Enter" && handleAddOutcome()} />
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <label className="label">Label</label>
            <input className="input" value={newOutLabel} placeholder="e.g. Follow Up"
              onChange={(e) => setNewOutLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddOutcome()} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, cursor: "pointer", paddingBottom: 4 }}>
            <input type="checkbox" checked={newOutDm} onChange={(e) => setNewOutDm(e.target.checked)} />
            DM
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, cursor: "pointer", paddingBottom: 4 }}>
            <input type="checkbox" checked={newOutSale} onChange={(e) => setNewOutSale(e.target.checked)} />
            Sale
          </label>
          <div style={{ width: 90 }}>
            <label className="label">Tone</label>
            <select className="select" style={{ fontSize: 11 }} value={newOutTone} onChange={(e) => setNewOutTone(e.target.value)}>
              {TONE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button className="btn accent sm" onClick={handleAddOutcome}
            disabled={!newOutCode.trim() || !newOutLabel.trim()}>
            <IconPlus size={12} /> Add
          </button>
        </div>
      </div>

      {/* Data management */}
      <div className="card">
        <div className="card-h">
          <div>
            <h3 className="card-title">Data</h3>
            <p className="card-sub">Reset or clear all stored data</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {showConfirmReset ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--warning)" }}>Reset everything to demo data?</span>
              <button className="btn warning sm" style={{ background: "var(--warning)", color: "#fff" }}
                onClick={() => { resetToDemo(); setShowConfirmReset(false); }}>
                Yes, reset
              </button>
              <button className="btn ghost sm" onClick={() => setShowConfirmReset(false)}>Cancel</button>
            </div>
          ) : (
            <button className="btn secondary" onClick={() => setShowConfirmReset(true)}>
              Reset to demo data
            </button>
          )}
          {showConfirmClear ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--danger)" }}>Delete all data permanently?</span>
              <button className="btn danger sm"
                onClick={() => { clearAll(); setShowConfirmClear(false); }}>
                Yes, clear
              </button>
              <button className="btn ghost sm" onClick={() => setShowConfirmClear(false)}>Cancel</button>
            </div>
          ) : (
            <button className="btn secondary" onClick={() => setShowConfirmClear(true)}>
              Clear all data
            </button>
          )}
        </div>

        <hr className="div" />

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Delete account</div>
          <p className="muted" style={{ fontSize: 12, marginBottom: 10 }}>
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          {showDeleteAccount ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
              <input
                type="password"
                className="input"
                placeholder="Enter your password to confirm"
                value={deletePassword}
                onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(""); }}
              />
              {deleteError && (
                <p style={{ fontSize: 12, color: "var(--danger)" }}>{deleteError}</p>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn danger sm"
                  disabled={!deletePassword || deleteLoading}
                  onClick={async () => {
                    setDeleteLoading(true);
                    setDeleteError("");
                    try {
                      const result = await deleteAccountAction(deletePassword);
                      if (result?.error) {
                        setDeleteError(result.error);
                        setDeleteLoading(false);
                      }
                    } catch {
                      // redirect throws — this is expected on success
                    }
                  }}
                >
                  {deleteLoading ? "Deleting..." : "Delete my account"}
                </button>
                <button
                  className="btn ghost sm"
                  onClick={() => { setShowDeleteAccount(false); setDeletePassword(""); setDeleteError(""); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button className="btn danger" onClick={() => setShowDeleteAccount(true)}>
              Delete account
            </button>
          )}
        </div>
      </div>
    </>
  );
}
