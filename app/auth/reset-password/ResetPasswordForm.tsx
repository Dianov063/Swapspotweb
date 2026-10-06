"use client";

import { useEffect, useState } from "react";

// App Platform reset: the e-mailed link carries the one-time token in the URL
// fragment, which browsers never send to servers or put in referrers/logs.
const PLATFORM_URL = (process.env.NEXT_PUBLIC_APP_PLATFORM_URL || "").replace(/\/$/, "");
const APP_SLUG = process.env.NEXT_PUBLIC_APP_PLATFORM_APP_SLUG || "swapspot";

export default function ResetPasswordForm() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    setToken(params.get("token") || "");
    // Drop the token from the address bar once read.
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname);
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setState("error");
      setMessage("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setState("error");
      setMessage("The passwords do not match.");
      return;
    }
    setState("saving");
    try {
      const response = await fetch(`${PLATFORM_URL}/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-App-Slug": APP_SLUG },
        body: JSON.stringify({ app_slug: APP_SLUG, token, new_password: password }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setState("done");
      setMessage("Your password has been changed. Open the SwapSpot app and sign in.");
    } catch {
      setState("error");
      setMessage("This reset link is invalid or has expired. Request a new one from the app.");
    }
  }

  if (!PLATFORM_URL) {
    return <p className="mt-8 text-[16px] text-ink/72">Password reset is not available on this site yet.</p>;
  }
  if (!token && state !== "done") {
    return <p className="mt-8 text-[16px] text-ink/72">Open the reset link from your e-mail to continue.</p>;
  }
  if (state === "done") {
    return <p className="mt-8 rounded-[8px] bg-white p-5 text-[16px] font-bold text-green shadow-sm">{message}</p>;
  }
  return (
    <form onSubmit={submit} className="mt-8 grid gap-4 rounded-[8px] border border-ink/10 bg-white p-6 shadow-sm">
      <label className="grid gap-2 text-[15px] font-bold">
        New password
        <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="rounded-[8px] border border-ink/20 px-4 py-3 font-normal" required minLength={8} />
      </label>
      <label className="grid gap-2 text-[15px] font-bold">
        Repeat the new password
        <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
          className="rounded-[8px] border border-ink/20 px-4 py-3 font-normal" required minLength={8} />
      </label>
      {state === "error" && <p className="text-[15px] font-bold text-red-700">{message}</p>}
      <button type="submit" disabled={state === "saving"}
        className="rounded-[8px] bg-green px-5 py-3 text-[16px] font-black text-white disabled:opacity-60">
        {state === "saving" ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
