export const metadata = {
  title: "Privacy Policy — Pace",
};

export default function PrivacyPage() {
  return (
    <article style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text)" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Privacy Policy</h1>
      <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 24 }}>
        Last updated: May 2025
      </p>

      <p>
        Pace CRM (&ldquo;Pace&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is an open-source
        door-to-door sales CRM. This policy explains what data we collect, how we use it, and
        your rights.
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 28, marginBottom: 8 }}>
        1. Data We Collect
      </h2>
      <ul style={{ paddingLeft: 20 }}>
        <li><strong>Account info</strong> — name, email address, and a hashed password (we never store your plain-text password).</li>
        <li><strong>Business & visit data</strong> — business names, contacts, areas, services pitched, outcomes, and notes you enter.</li>
        <li><strong>Usage metadata</strong> — timestamps on records you create. We do not collect IP addresses, device fingerprints, or analytics.</li>
      </ul>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 28, marginBottom: 8 }}>
        2. How We Store Your Data
      </h2>
      <p>
        Data is stored in a PostgreSQL database. If you use the hosted version, the database is
        managed by Neon with encryption at rest. If you self-host Pace, your data stays entirely
        on your own infrastructure.
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 28, marginBottom: 8 }}>
        3. Third-Party Services
      </h2>
      <p>
        We do <strong>not</strong> use third-party analytics, tracking pixels, or advertising SDKs.
        If AI extraction is enabled, visit text is sent to OpenRouter (which routes to Google
        Gemini) for processing. No other third parties receive your data.
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 28, marginBottom: 8 }}>
        4. Data Deletion
      </h2>
      <p>
        You can delete your account at any time from <strong>Settings &rarr; Delete account</strong>.
        This permanently removes your user record and all associated data (businesses, visits,
        configuration) from the database. This action is irreversible.
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 28, marginBottom: 8 }}>
        5. Self-Hosting
      </h2>
      <p>
        Pace is open source. You can run your own instance and retain full control over where
        your data is stored. No data is sent to us when you self-host (unless you configure
        an OpenRouter API key, in which case visit text is sent to OpenRouter for AI extraction).
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 28, marginBottom: 8 }}>
        6. Changes to This Policy
      </h2>
      <p>
        If we make material changes, we&apos;ll update the &ldquo;last updated&rdquo; date at the top.
        Continued use of Pace after changes constitutes acceptance.
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 28, marginBottom: 8 }}>
        7. Contact
      </h2>
      <p>
        Questions? Open an issue on the GitHub repository.
      </p>
    </article>
  );
}
