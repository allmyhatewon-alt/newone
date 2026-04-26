"use client";
import { useState, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignupPage() {
  const [form, setForm] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
  });
  const [uname, setUname] = useState<"idle" | "checking" | "ok" | "taken" | "invalid">("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Debounced username availability check
  const checkUsername = useCallback((val: string) => {
    if (val.length < 2) { setUname("idle"); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(val)) { setUname("invalid"); return; }
    setUname("checking");
    fetch(`/api/auth/register?username=${encodeURIComponent(val)}`)
      .then((r) => r.json())
      .then((d) => setUname(d.available ? "ok" : "taken"))
      .catch(() => setUname("idle"));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => checkUsername(form.username), 500);
    return () => clearTimeout(t);
  }, [form.username, checkUsername]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (uname === "taken" || uname === "invalid") return;
    setError("");
    setLoading(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error ?? "Something went wrong"); return; }
      setDone(true);
      // Auto sign-in after registration
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        callbackUrl: "/hub/",
      });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const unameHint = {
    idle: null,
    checking: <span className="text-xs opacity-40">checking…</span>,
    ok: <span className="text-xs text-green-400">available ✓</span>,
    taken: <span className="text-xs text-red-400">already taken</span>,
    invalid: <span className="text-xs text-yellow-400">letters, numbers, _ only</span>,
  }[uname];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm">
        <h1
          className="text-2xl font-black text-white mb-1 text-center"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          join peng hub
        </h1>
        <p
          className="text-xs text-center opacity-40 mb-8"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          create your identity
        </p>

        {done ? (
          <div className="peng-card text-center">
            <p className="text-green-400 mb-2">Account created.</p>
            <p className="text-xs opacity-50">Signing you in…</p>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            {/* Username */}
            <div>
              <label className="block text-xs opacity-50 mb-1" style={{ fontFamily: "var(--font-mono)" }}>
                username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase() }))}
                placeholder="your_handle"
                required
                className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-[var(--radius)] px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent)] transition-colors"
                style={{ fontFamily: "var(--font-mono)" }}
              />
              <div className="mt-1 h-4">{unameHint}</div>
            </div>

            {/* Display name */}
            <div>
              <label className="block text-xs opacity-50 mb-1" style={{ fontFamily: "var(--font-mono)" }}>
                display name
              </label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="Peng"
                required
                className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-[var(--radius)] px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs opacity-50 mb-1" style={{ fontFamily: "var(--font-mono)" }}>
                email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                required
                className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-[var(--radius)] px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs opacity-50 mb-1" style={{ fontFamily: "var(--font-mono)" }}>
                password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="min 8 characters"
                required
                minLength={8}
                className="w-full bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-[var(--radius)] px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400" style={{ fontFamily: "var(--font-mono)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || uname === "taken" || uname === "invalid" || uname === "checking"}
              className="peng-btn peng-btn-primary w-full py-3 mt-2 disabled:opacity-40"
            >
              {loading ? "creating…" : "Create Account"}
            </button>

            <p className="text-center text-xs opacity-40" style={{ fontFamily: "var(--font-mono)" }}>
              already have an account?{" "}
              <Link href="/auth/signin" className="underline hover:opacity-80">
                sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
