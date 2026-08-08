"use client";

import { useMemo, useState } from "react";

type Profile = {
  email?: string | null;
  full_name?: string | null;
  role?: string | null;
};

type SupportThread = {
  id: string;
  user_id: string;
  last_message_text: string | null;
  last_message_at: string | null;
  created_at: string;
  profiles?: Profile | null;
};

type SupportMessage = {
  id: string;
  thread_id: string;
  sender_id: string | null;
  content: string;
  is_support: boolean;
  is_read: boolean;
  created_at: string;
};

function formatDate(value: string | null) {
  if (!value) return "No messages yet";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function profileLabel(thread: SupportThread) {
  return thread.profiles?.full_name || thread.profiles?.email || thread.user_id;
}

export default function SupportInbox() {
  const [token, setToken] = useState("");
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedId) || null,
    [selectedId, threads],
  );

  async function loadThreads() {
    setLoadingThreads(true);
    setError("");
    try {
      const response = await fetch("/api/admin/support/threads", {
        headers: { "x-analytics-token": token },
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Could not load threads");
      setThreads(payload.threads);
      if (!selectedId && payload.threads[0]?.id) {
        await loadMessages(payload.threads[0].id);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unknown error");
    } finally {
      setLoadingThreads(false);
    }
  }

  async function loadMessages(threadId: string) {
    setSelectedId(threadId);
    setLoadingMessages(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/support/messages?threadId=${encodeURIComponent(threadId)}`, {
        headers: { "x-analytics-token": token },
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Could not load messages");
      setMessages(payload.messages);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unknown error");
    } finally {
      setLoadingMessages(false);
    }
  }

  async function sendReply() {
    const content = reply.trim();
    if (!selectedId || !content) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/support/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-analytics-token": token,
        },
        body: JSON.stringify({ threadId: selectedId, content }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Could not send reply");
      setReply("");
      await loadMessages(selectedId);
      await loadThreads();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unknown error");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-sand px-5 py-8">
      <div className="mx-auto max-w-[1320px]">
        <section className="mb-6 rounded-card border border-line bg-surface p-6 shadow-card-sm">
          <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-green">
            SwapSpot internal
          </p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-head text-[clamp(32px,4vw,48px)] font-bold leading-tight text-ink">
                Support Inbox
              </h1>
              <p className="mt-2 max-w-[760px] text-[16px] leading-[1.5] text-ink-soft">
                Read in-app support chats and reply directly to users.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Admin API secret"
                className="h-12 min-w-[280px] rounded-full border border-line bg-cream px-4 text-[15px] font-semibold text-ink outline-none focus:border-green"
              />
              <button
                type="button"
                onClick={loadThreads}
                disabled={loadingThreads || !token}
                className="h-12 rounded-full bg-green px-6 text-[15px] font-extrabold text-surface transition hover:bg-green-deep disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingThreads ? "Loading..." : "Load inbox"}
              </button>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mb-6 rounded-card-sm border border-[#F0B8B8] bg-[#FFF4F4] p-4 font-semibold text-[#9B1C1C]">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <section className="rounded-card border border-line bg-surface p-4 shadow-card-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-head text-[22px] font-bold text-ink">Threads</h2>
              <span className="rounded-full bg-green-soft px-3 py-1 text-[12px] font-bold text-green-deep">
                {threads.length}
              </span>
            </div>
            <div className="space-y-3">
              {threads.length ? (
                threads.map((thread) => (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => loadMessages(thread.id)}
                    className={`w-full rounded-card-sm border p-4 text-left transition ${
                      thread.id === selectedId
                        ? "border-green bg-green-soft"
                        : "border-line bg-cream hover:border-green"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-[15px] font-extrabold text-ink">
                          {profileLabel(thread)}
                        </div>
                        <div className="mt-1 truncate text-[13px] font-semibold text-ink-soft">
                          {thread.profiles?.email || thread.user_id}
                        </div>
                      </div>
                      <div className="shrink-0 text-[12px] font-bold text-green">
                        {thread.profiles?.role || "user"}
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 text-[14px] leading-[1.4] text-ink-soft">
                      {thread.last_message_text || "No messages yet."}
                    </p>
                    <div className="mt-3 text-[12px] font-bold text-ink-soft">
                      {formatDate(thread.last_message_at || thread.created_at)}
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-card-sm border border-line bg-cream p-4 text-[14px] font-semibold text-ink-soft">
                  Enter the admin secret and load the inbox.
                </div>
              )}
            </div>
          </section>

          <section className="flex min-h-[620px] flex-col rounded-card border border-line bg-surface shadow-card-sm">
            <div className="border-b border-line p-5">
              <h2 className="font-head text-[24px] font-bold text-ink">
                {selectedThread ? profileLabel(selectedThread) : "Select a thread"}
              </h2>
              <p className="mt-1 text-[14px] font-semibold text-ink-soft">
                {selectedThread?.profiles?.email || selectedThread?.user_id || "Support messages will appear here."}
              </p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-cream p-5">
              {loadingMessages ? (
                <div className="text-[15px] font-semibold text-ink-soft">Loading messages...</div>
              ) : messages.length ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_support ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[76%] rounded-[20px] px-4 py-3 ${
                        message.is_support
                          ? "bg-green text-white"
                          : "border border-line bg-surface text-ink"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-[15px] leading-[1.45]">
                        {message.content}
                      </div>
                      <div
                        className={`mt-2 text-[11px] font-bold ${
                          message.is_support ? "text-white/65" : "text-ink-soft"
                        }`}
                      >
                        {message.is_support ? "Support" : "User"} · {formatDate(message.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[15px] font-semibold text-ink-soft">
                  No messages in this thread yet.
                </div>
              )}
            </div>

            <div className="border-t border-line bg-surface p-4">
              <textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                disabled={!selectedId || sending}
                maxLength={2000}
                placeholder="Write a support reply..."
                className="min-h-[112px] w-full resize-none rounded-card-sm border border-line bg-cream p-4 text-[15px] font-semibold leading-[1.45] text-ink outline-none focus:border-green disabled:cursor-not-allowed disabled:opacity-60"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[12px] font-bold text-ink-soft">{reply.length}/2000</span>
                <button
                  type="button"
                  onClick={sendReply}
                  disabled={!selectedId || !reply.trim() || sending}
                  className="h-11 rounded-full bg-green px-6 text-[14px] font-extrabold text-surface transition hover:bg-green-deep disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send reply"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
