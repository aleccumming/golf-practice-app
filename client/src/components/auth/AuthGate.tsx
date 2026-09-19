import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { useAuth } from "../../hooks/useAuth";
import { ApiError } from "../../api/http";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, string>) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export function AuthGate({
  auth,
  children,
}: {
  auth: ReturnType<typeof useAuth>;
  children: ReactNode;
}) {
  const { authenticated, loginWithGoogle } = auth;
  const [error, setError] = useState<string | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authenticated !== false || !buttonRef.current) return;
    if (!GOOGLE_CLIENT_ID) {
      setError("Google sign-in is not configured (missing VITE_GOOGLE_CLIENT_ID).");
      return;
    }

    let cancelled = false;
    function render() {
      if (cancelled || !window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID!,
        callback: async (response) => {
          try {
            const ok = await loginWithGoogle(response.credential);
            if (!ok) setError("Sign-in failed");
          } catch (err) {
            setError(err instanceof ApiError ? err.message : "Sign-in failed");
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        width: "280",
      });
    }

    if (window.google) {
      render();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          render();
        }
      }, 100);
      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }
  }, [authenticated, loginWithGoogle]);

  if (authenticated === null) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100svh", color: "var(--color-text-faint)", fontSize: 14 }}>
        Loading...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100svh",
          padding: 24,
          background: "var(--color-bg)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: "var(--color-accent-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="var(--color-accent)" strokeWidth="1.8" />
            <circle cx="9.5" cy="9" r="0.8" fill="var(--color-accent)" />
            <circle cx="13" cy="8" r="0.8" fill="var(--color-accent)" />
            <circle cx="12" cy="12" r="0.8" fill="var(--color-accent)" />
            <circle cx="9.5" cy="14" r="0.8" fill="var(--color-accent)" />
            <circle cx="14.5" cy="13" r="0.8" fill="var(--color-accent)" />
          </svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 6 }}>Golf Practice</h1>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 28, textAlign: "center" }}>
          Track your shots, spot your patterns, practice smarter.
        </p>
        <div ref={buttonRef} style={{ display: "flex", justifyContent: "center" }} />
        {error && <p style={{ color: "var(--color-danger)", fontSize: 14, marginTop: 16, textAlign: "center" }}>{error}</p>}
      </div>
    );
  }

  return <>{children}</>;
}
