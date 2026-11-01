// "Support" section of the daily report (lib/dailyReport.ts): new messages users wrote to
// SwapSpot Support in the report window and the threads still awaiting a reply.
// Server-only data through the trusted backend (PostgREST paths, both SWAPSPOT_BACKEND modes);
// the aggregation is pure and tested by scripts/supportReport.test.mjs.
//
// "Awaiting a reply": the thread's last message from its user is newer than the last support
// reply (notification_kind "support"). Welcome messages and announcements to everybody answer
// nobody. Threads are looked at over SUPPORT_LOOKBACK_DAYS, the same rule as the app's inbox
// (server patch 0008 support_thread_state).
import { siteUrl } from "@/lib/locales";

export const SUPPORT_LOOKBACK_DAYS = 30;
export const SUPPORT_INBOX_URL = `${siteUrl}/admin/support`;
const ID_CHUNK = 100;
const PREVIEW = 160;

export type SupportUserMessageRow = { id: string; thread_id: string; content: string | null; created_at: string };
export type SupportReplyRow = { thread_id: string; created_at: string };
export type SupportThreadRow = {
  id: string;
  user_id: string;
  profiles?: { email: string | null; full_name: string | null } | null;
};

export type SupportNewMessage = { threadId: string; createdAt: string; name: string; email: string; preview: string };
export type SupportAwaitingThread = {
  threadId: string;
  name: string;
  email: string;
  lastUserMessageAt: string;
  /** User messages after the last support reply. */
  unanswered: number;
  preview: string;
};
export type SupportSummary = {
  newMessages: SupportNewMessage[];
  newMessageThreads: number;
  awaiting: SupportAwaitingThread[];
  inboxUrl: string;
  lookbackDays: number;
};

type ReadJson = <T>(path: string) => Promise<T>;

function time(value: string | null | undefined) {
  const parsed = value ? Date.parse(value) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

function isTestEmail(email: string | null | undefined) {
  return Boolean(email && email.toLowerCase().endsWith("@example.com"));
}

export function previewText(content: string | null | undefined, max = PREVIEW) {
  const text = String(content ?? "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/**
 * Pure aggregation. `userMessages` are the users' messages (is_support = false) since the
 * lookback start; `replies` the support replies (is_support = true, kind "support") of those
 * threads since the same instant; `threads` carry the user's profile.
 */
export function summarizeSupport(input: {
  windowStart: Date;
  windowEnd: Date;
  userMessages: SupportUserMessageRow[];
  replies: SupportReplyRow[];
  threads: SupportThreadRow[];
  inboxUrl?: string;
  lookbackDays?: number;
}): SupportSummary {
  const start = input.windowStart.getTime();
  const end = input.windowEnd.getTime();
  const threadById = new Map(input.threads.map((thread) => [thread.id, thread]));
  const who = (threadId: string) => {
    const profile = threadById.get(threadId)?.profiles;
    return { name: profile?.full_name?.trim() || "—", email: profile?.email || "—", test: isTestEmail(profile?.email) };
  };

  const lastReply = new Map<string, number>();
  for (const reply of input.replies) {
    lastReply.set(reply.thread_id, Math.max(lastReply.get(reply.thread_id) ?? 0, time(reply.created_at)));
  }

  const byThread = new Map<string, SupportUserMessageRow[]>();
  for (const message of input.userMessages) {
    if (!message?.thread_id) continue;
    const list = byThread.get(message.thread_id) ?? [];
    list.push(message);
    byThread.set(message.thread_id, list);
  }

  const newMessages: SupportNewMessage[] = [];
  const awaiting: SupportAwaitingThread[] = [];
  for (const [threadId, messages] of byThread) {
    const person = who(threadId);
    if (person.test) continue;
    const sorted = [...messages].sort((a, b) => time(a.created_at) - time(b.created_at));
    for (const message of sorted) {
      const at = time(message.created_at);
      if (at >= start && at < end) {
        newMessages.push({ threadId, createdAt: message.created_at, name: person.name, email: person.email, preview: previewText(message.content) });
      }
    }
    const replyAt = lastReply.get(threadId) ?? 0;
    const unanswered = sorted.filter((message) => time(message.created_at) > replyAt);
    if (unanswered.length) {
      const last = unanswered[unanswered.length - 1];
      awaiting.push({
        threadId,
        name: person.name,
        email: person.email,
        lastUserMessageAt: last.created_at,
        unanswered: unanswered.length,
        preview: previewText(last.content),
      });
    }
  }
  newMessages.sort((a, b) => time(a.createdAt) - time(b.createdAt));
  // Longest wait first.
  awaiting.sort((a, b) => time(a.lastUserMessageAt) - time(b.lastUserMessageAt));
  return {
    newMessages,
    newMessageThreads: new Set(newMessages.map((message) => message.threadId)).size,
    awaiting,
    inboxUrl: input.inboxUrl ?? SUPPORT_INBOX_URL,
    lookbackDays: input.lookbackDays ?? SUPPORT_LOOKBACK_DAYS,
  };
}

function chunks<T>(items: T[], size = ID_CHUNK) {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Reads what the summary needs; `readJson` is the report's trusted PostgREST reader. */
export async function fetchSupportActivity(window: { start: Date; end: Date }, readJson: ReadJson): Promise<SupportSummary> {
  const lookbackStart = new Date(Math.min(window.start.getTime(), window.end.getTime() - SUPPORT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000));
  const from = encodeURIComponent(lookbackStart.toISOString());
  const to = encodeURIComponent(window.end.toISOString());
  const userMessages = await readJson<SupportUserMessageRow[]>(
    `support_messages?select=id,thread_id,content,created_at&is_support=eq.false&created_at=gte.${from}&created_at=lt.${to}&order=created_at.desc&limit=2000`,
  );
  const threadIds = [...new Set(userMessages.map((message) => message.thread_id).filter(Boolean))];
  const replies: SupportReplyRow[] = [];
  const threads: SupportThreadRow[] = [];
  for (const ids of chunks(threadIds)) {
    const filter = encodeURIComponent(`in.(${ids.join(",")})`);
    replies.push(...await readJson<SupportReplyRow[]>(
      `support_messages?select=thread_id,created_at&is_support=eq.true&notification_kind=eq.support&thread_id=${filter}&created_at=gte.${from}&order=created_at.desc&limit=5000`,
    ));
    threads.push(...await readJson<SupportThreadRow[]>(
      `support_threads?select=id,user_id,profiles:user_id(email,full_name)&id=${filter}&limit=${ids.length}`,
    ));
  }
  return summarizeSupport({ windowStart: window.start, windowEnd: window.end, userMessages, replies, threads });
}

export function emptySupportSummary(): SupportSummary {
  return { newMessages: [], newMessageThreads: 0, awaiting: [], inboxUrl: SUPPORT_INBOX_URL, lookbackDays: SUPPORT_LOOKBACK_DAYS };
}
