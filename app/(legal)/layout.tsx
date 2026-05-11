export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--surface)",
        padding: "24px 24px 64px",
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 32,
          }}
        >
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: "var(--accent)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              P
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Pace
            </span>
          </a>
          <span style={{ color: "var(--text-3)", fontSize: 13 }}>|</span>
          <a
            href="/"
            style={{
              fontSize: 13,
              color: "var(--text-2)",
              textDecoration: "none",
            }}
          >
            Back to app
          </a>
        </div>
        {children}
      </div>
    </div>
  );
}
