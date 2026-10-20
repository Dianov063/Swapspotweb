// Daily report "Support" section (lib/supportReport.ts): new user messages in the report window
// and threads awaiting a reply. Run with `npm run test:report`.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  SUPPORT_INBOX_URL,
  SUPPORT_LOOKBACK_DAYS,
  fetchSupportActivity,
  previewText,
  summarizeSupport,
} from "../lib/supportReport.ts";

const windowEnd = new Date("2026-10-20T15:00:00Z");
const windowStart = new Date("2026-10-19T15:00:00Z");
const threads = [
  { id: "t-ana", user_id: "u1", profiles: { email: "ana@mail.test", full_name: "Ana" } },
  { id: "t-bo", user_id: "u2", profiles: { email: "bo@mail.test", full_name: "Bo" } },
  { id: "t-old", user_id: "u3", profiles: { email: "old@mail.test", full_name: "Old" } },
  { id: "t-test", user_id: "u4", profiles: { email: "qa@example.com", full_name: "QA" } },
  { id: "t-noprofile", user_id: "u5", profiles: null },
];

function fixture() {
  return {
    windowStart,
    windowEnd,
    threads,
    userMessages: [
      // Ana: two new messages, no reply yet.
      { id: "m1", thread_id: "t-ana", content: "Hello", created_at: "2026-10-20T09:00:00Z" },
      { id: "m2", thread_id: "t-ana", content: "Are you there?", created_at: "2026-10-20T10:00:00Z" },
      // Bo: new message already answered.
      { id: "m3", thread_id: "t-bo", content: "Payment question", created_at: "2026-10-20T08:00:00Z" },
      // Old: wrote 5 days ago, never answered (outside the window, still awaiting).
      { id: "m4", thread_id: "t-old", content: "Old question", created_at: "2026-10-15T08:00:00Z" },
      // Test account: ignored like the rest of the report.
      { id: "m5", thread_id: "t-test", content: "QA", created_at: "2026-10-20T11:00:00Z" },
      // No profile row: still counted.
      { id: "m6", thread_id: "t-noprofile", content: "  multi\n line   text ", created_at: "2026-10-20T12:00:00Z" },
    ],
    replies: [
      { thread_id: "t-bo", created_at: "2026-10-20T08:30:00Z" },
      // A reply older than Ana's messages does not answer them.
      { thread_id: "t-ana", created_at: "2026-10-18T08:00:00Z" },
    ],
  };
}

test("new messages are the users' messages inside the window; test accounts are left out", () => {
  const summary = summarizeSupport(fixture());
  assert.deepEqual(summary.newMessages.map((m) => m.preview), ["Payment question", "Hello", "Are you there?", "multi line text"]);
  assert.equal(summary.newMessageThreads, 3);
  assert.equal(summary.newMessages[1].name, "Ana");
  assert.equal(summary.newMessages[1].email, "ana@mail.test");
  assert.equal(summary.newMessages[3].name, "—");
  assert.equal(summary.inboxUrl, SUPPORT_INBOX_URL);
  assert.equal(SUPPORT_INBOX_URL, "https://www.swapspot.org/admin/support");
  assert.equal(summary.lookbackDays, SUPPORT_LOOKBACK_DAYS);
});

test("awaiting a reply: the last user message is newer than the last support reply; longest wait first", () => {
  const summary = summarizeSupport(fixture());
  assert.deepEqual(summary.awaiting.map((t) => t.threadId), ["t-old", "t-ana", "t-noprofile"]);
  const ana = summary.awaiting.find((t) => t.threadId === "t-ana");
  assert.equal(ana.unanswered, 2);
  assert.equal(ana.lastUserMessageAt, "2026-10-20T10:00:00Z");
  assert.equal(ana.preview, "Are you there?");
  // Bo was answered after writing.
  assert.ok(!summary.awaiting.some((t) => t.threadId === "t-bo"));
  // A later user message reopens Bo's thread.
  const data = fixture();
  data.userMessages.push({ id: "m7", thread_id: "t-bo", content: "One more thing", created_at: "2026-10-20T13:00:00Z" });
  const reopened = summarizeSupport(data).awaiting.find((t) => t.threadId === "t-bo");
  assert.equal(reopened.unanswered, 1);
});

test("empty data and long texts", () => {
  const empty = summarizeSupport({ windowStart, windowEnd, threads: [], userMessages: [], replies: [] });
  assert.deepEqual([empty.newMessages, empty.awaiting, empty.newMessageThreads], [[], [], 0]);
  const long = previewText("x".repeat(400));
  assert.equal(long.length, 160);
  assert.ok(long.endsWith("…"));
  assert.equal(previewText(null), "");
});

test("fetch: the report reads only users' messages, support replies (kind support) and the threads' profiles", async () => {
  const paths = [];
  const data = fixture();
  const readJson = async (path) => {
    paths.push(path);
    if (path.startsWith("support_messages?") && path.includes("is_support=eq.false")) return data.userMessages;
    if (path.startsWith("support_messages?") && path.includes("is_support=eq.true")) return data.replies;
    if (path.startsWith("support_threads?")) return data.threads;
    throw new Error("unexpected path " + path);
  };
  const summary = await fetchSupportActivity({ start: windowStart, end: windowEnd }, readJson);
  assert.equal(summary.awaiting.length, 3);
  assert.equal(paths.length, 3);
  const lookback = new Date(windowEnd.getTime() - SUPPORT_LOOKBACK_DAYS * 86400000).toISOString();
  assert.ok(paths[0].includes(`created_at=gte.${encodeURIComponent(lookback)}`), paths[0]);
  assert.ok(paths[0].includes(`created_at=lt.${encodeURIComponent(windowEnd.toISOString())}`));
  assert.ok(paths[1].includes("notification_kind=eq.support"));
  assert.ok(decodeURIComponent(paths[2]).includes("profiles:user_id(email,full_name)"));
  // Many threads are read in chunks (URL length).
  const many = Array.from({ length: 250 }, (_, i) => ({ id: `m${i}`, thread_id: `t${i}`, content: "x", created_at: "2026-10-20T09:00:00Z" }));
  const chunked = [];
  await fetchSupportActivity({ start: windowStart, end: windowEnd }, async (path) => {
    chunked.push(path);
    return path.includes("is_support=eq.false") ? many : [];
  });
  assert.equal(chunked.length, 1 + 3 * 2);
});

test("the daily report includes the Support section with the inbox link", () => {
  const source = readFileSync(new URL("../lib/dailyReport.ts", import.meta.url), "utf8");
  assert.match(source, /fetchSupportActivity\(window, readJson\)/);
  assert.match(source, /<h2>Поддержка<\/h2>/);
  assert.match(source, /support\.inboxUrl/);
  assert.match(source, /supportAwaiting: support\.awaiting\.length/);
  assert.match(source, /Поддержка: новые сообщения/);
});
