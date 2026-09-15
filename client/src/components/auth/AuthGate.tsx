import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ApiError } from "../../api/http";

export function AuthGate({ children }: { children: ReactNode }) {
  const { authenticated, signup, login } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (authenticated === null) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (!authenticated) {
    async function handleSubmit(e: FormEvent) {
      e.preventDefault();
      setSubmitting(true);
      setError(null);
      try {
        const ok =
          mode === "signup" ? await signup(email, password, displayName || undefined) : await login(email, password);
        if (!ok) setError(mode === "signup" ? "Sign up failed" : "Incorrect email or password");
      } catch (err) {
        setError(err instanceof ApiError ? err.message : mode === "signup" ? "Sign up failed" : "Login failed");
      } finally {
        setSubmitting(false);
      }
    }

    return (
      <div style={{ padding: 24, maxWidth: 320, margin: "80px auto", fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ fontSize: 20 }}>Golf Practice App</h1>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setMode("login")}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 8,
              border: "none",
              background: mode === "login" ? "#2f8f4e" : "#eee",
              color: mode === "login" ? "#fff" : "#333",
              fontWeight: 600,
            }}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 8,
              border: "none",
              background: mode === "signup" ? "#2f8f4e" : "#eee",
              color: mode === "signup" ? "#fff" : "#333",
              fontWeight: 600,
            }}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            autoFocus
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ fontSize: 16, padding: 12, borderRadius: 8, border: "1px solid #ccc" }}
          />
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Display name (optional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{ fontSize: 16, padding: 12, borderRadius: 8, border: "1px solid #ccc" }}
            />
          )}
          <input
            type="password"
            placeholder={mode === "signup" ? "Password (min 8 characters)" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ fontSize: 16, padding: 12, borderRadius: 8, border: "1px solid #ccc" }}
          />
          <button
            type="submit"
            disabled={submitting || !email || !password}
            style={{ fontSize: 16, padding: 12, borderRadius: 8, background: "#2f8f4e", color: "#fff", border: "none" }}
          >
            {submitting ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
          </button>
          {error && <p style={{ color: "#c0392b", fontSize: 14 }}>{error}</p>}
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
