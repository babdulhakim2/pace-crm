"use client";
import React from "react";
import { useActionState } from "react";
import { signup } from "@/app/actions/auth";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="card" style={{ padding: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Create account</h2>
      <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 20 }}>
        Sign up to start tracking your sales pipeline
      </p>

      <form action={action}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="input"
              placeholder="Your name"
              required
            />
            {state?.errors?.name && (
              <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>
                {state.errors.name[0]}
              </p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              required
            />
            {state?.errors?.email && (
              <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>
                {state.errors.email[0]}
              </p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="Min 8 characters"
              required
            />
            {state?.errors?.password && (
              <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {state?.error && (
            <p style={{ fontSize: 13, color: "var(--danger)", padding: "8px 12px", background: "var(--danger-bg)", borderRadius: 6 }}>
              {state.error}
            </p>
          )}

          <button
            className="btn accent"
            type="submit"
            disabled={pending}
            style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
          >
            {pending ? "Creating account..." : "Create account"}
          </button>
        </div>
      </form>

      <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 16, textAlign: "center" }}>
        Already have an account?{" "}
        <a href="/login" style={{ color: "var(--accent)", fontWeight: 500 }}>
          Sign in
        </a>
      </p>
    </div>
  );
}
