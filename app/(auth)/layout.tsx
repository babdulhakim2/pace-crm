export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--surface)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--accent)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              P
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Pace
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-2)" }}>
            Door-to-door sales CRM
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
