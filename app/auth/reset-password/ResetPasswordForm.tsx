"use client";

import { useEffect, useState } from "react";

// Two kinds of e-mailed reset links land here, both with their secret in the URL
// fragment (browsers never send it to servers or put it in referrers/logs):
// - App Platform: #token=<one-time token>                 -> POST /v1/auth/reset-password
// - Supabase Auth recovery (also used by a rollback):     -> PUT /auth/v1/user with the
//   #access_token=…&type=recovery                            recovery session token
const PLATFORM_URL = (process.env.NEXT_PUBLIC_APP_PLATFORM_URL || "").replace(/\/$/, "");
const APP_SLUG = process.env.NEXT_PUBLIC_APP_PLATFORM_APP_SLUG || "swapspot";
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hoohhuqgyaifjglfzanx.supabase.co").replace(/\/$/, "");
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

type Link = { kind: "platform"; token: string } | { kind: "supabase"; accessToken: string } | { kind: "expired" } | { kind: "none" };

export function parseResetFragment(hash: string): Link {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  if (params.get("token")) return { kind: "platform", token: params.get("token") as string };
  if (params.get("access_token") && params.get("type") === "recovery") {
    return { kind: "supabase", accessToken: params.get("access_token") as string };
  }
  if (params.get("error") || params.get("error_code")) return { kind: "expired" };
  return { kind: "none" };
}

async function savePassword(link: Link, password: string) {
  if (link.kind === "platform") {
    return fetch(`${PLATFORM_URL}/v1/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-App-Slug": APP_SLUG },
      body: JSON.stringify({ app_slug: APP_SLUG, token: link.token, new_password: password }),
    });
  }
  if (link.kind === "supabase") {
    return fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${link.accessToken}` },
      body: JSON.stringify({ password }),
    });
  }
  throw new Error("no reset link");
}

export default function ResetPasswordForm() {
  const [link, setLink] = useState<Link>({ kind: "none" });
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLink(parseResetFragment(window.location.hash));
    // Drop the secret from the address bar once read.
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
      const response = await savePassword(link, password);
      if (!response.ok) throw new Error(String(response.status));
      setState("done");
      setMessage("Your password has been changed. Open the SwapSpot app and sign in.");
    } catch {
      setState("error");
      setMessage("This reset link is invalid or has expired. Request a new one from the app.");
    }
  }

  if (state === "done") {
    return <p className="mt-8 rounded-[8px] bg-white p-5 text-[16px] font-bold text-green shadow-sm">{message}</p>;
  }
  if (link.kind === "expired") {
    return <p className="mt-8 text-[16px] text-ink/72">This reset link is invalid or has expired. Request a new one from the app.</p>;
  }
  if (link.kind === "none") {
    return <p className="mt-8 text-[16px] text-ink/72">Open the reset link from your e-mail to continue.</p>;
  }
  if ((link.kind === "platform" && !PLATFORM_URL) || (link.kind === "supabase" && !SUPABASE_ANON_KEY)) {
    return <p className="mt-8 text-[16px] text-ink/72">Password reset is not available on this site yet.</p>;
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
