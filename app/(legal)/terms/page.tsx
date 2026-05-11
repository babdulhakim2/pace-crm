export const metadata = {
  title: "Terms of Use — Pace",
};

export default function TermsPage() {
  return (
    <article style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text)" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Terms of Use</h1>
      <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 24 }}>
        Last updated: May 2025
      </p>

      <p>
        By creating an account or using Pace CRM (&ldquo;Pace&rdquo;), you agree to these terms.
        If you don&apos;t agree, don&apos;t use the service.
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 28, marginBottom: 8 }}>
        1. Service Description
      </h2>
      <p>
        Pace is an open-source door-to-door sales CRM that helps you log visits, track
        pipelines, and analyze sales activity. It optionally uses AI to extract structured
        data from free-form notes.
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 28, marginBottom: 8 }}>
        2. Account Responsibilities
      </h2>
      <p>
        You are responsible for keeping your login credentials secure. You must provide a
        valid email address and accurate information when signing up.
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 28, marginBottom: 8 }}>
        3. Acceptable Use
      </h2>
      <p>
        Don&apos;t use Pace to store illegal content, harass others, or attempt to compromise
        the service&apos;s security. Don&apos;t automate access in a way that degrades the
        service for other users.
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 28, marginBottom: 8 }}>
        4. Your Data
      </h2>
      <p>
        <strong>You own your data.</strong> Pace does not claim any rights over the content
        you create. You can export or delete your data at any time.
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 28, marginBottom: 8 }}>
        5. No Warranty
      </h2>
      <p>
        Pace is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied.
        We don&apos;t guarantee uptime, data preservation, or fitness for any particular purpose.
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 28, marginBottom: 8 }}>
        6. Termination
      </h2>
      <p>
        You can delete your account at any time from Settings. We may suspend or terminate
        accounts that violate these terms. On termination, your data is permanently deleted.
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 28, marginBottom: 8 }}>
        7. Open Source
      </h2>
      <p>
        Pace is released under the MIT License. You are free to self-host, modify, and
        distribute the software in accordance with the license terms.
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 28, marginBottom: 8 }}>
        8. Changes to These Terms
      </h2>
      <p>
        We may update these terms from time to time. The &ldquo;last updated&rdquo; date at the
        top will change when we do. Continued use constitutes acceptance.
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 28, marginBottom: 8 }}>
        9. Contact
      </h2>
      <p>
        Questions? Open an issue on the GitHub repository.
      </p>
    </article>
  );
}
