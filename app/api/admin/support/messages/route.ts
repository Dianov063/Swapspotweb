import { NextResponse } from "next/server";
import { requireAnalyticsAccess } from "@/lib/googleServerApis";
import { supabaseAdminFetch } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function getThreadId(request: Request) {
  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId")?.trim();
  if (!threadId) throw new Error("Missing threadId");
  return threadId;
}

export async function GET(request: Request) {
  try {
    requireAnalyticsAccess(request);
    const threadId = getThreadId(request);
    const params = new URLSearchParams({
      select: "id,thread_id,sender_id,content,is_support,is_read,created_at",
      thread_id: `eq.${threadId}`,
      order: "created_at.asc",
    });

    const response = await supabaseAdminFetch(`support_messages?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Could not load support messages");
    }

    await supabaseAdminFetch(
      `support_messages?thread_id=eq.${encodeURIComponent(threadId)}&is_support=eq.false&is_read=eq.false`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ is_read: true }),
      },
    );

    return NextResponse.json({ ok: true, messages: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Missing threadId" ? 400 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    requireAnalyticsAccess(request);
    const body = await request.json().catch(() => ({}));
    const threadId = String(body.threadId || "").trim();
    const content = String(body.content || "").trim();

    if (!threadId) throw new Error("Missing threadId");
    if (!content) throw new Error("Missing content");
    if (content.length > 2000) throw new Error("Message is too long");

    const response = await supabaseAdminFetch("support_messages", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        thread_id: threadId,
        sender_id: null,
        content,
        is_support: true,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Could not send support reply");
    }

    return NextResponse.json({ ok: true, message: Array.isArray(data) ? data[0] : data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      message === "Unauthorized"
        ? 401
        : ["Missing threadId", "Missing content", "Message is too long"].includes(message)
          ? 400
          : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
