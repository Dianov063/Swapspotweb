import { NextResponse } from "next/server";
import { buildDailyReport, getDailyReportWindow, isElevenInNewYork, sendDailyReport } from "@/lib/dailyReport";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1";
  const dryRun = url.searchParams.get("dryRun") === "1";
  const now = new Date();
  if (!force && !isElevenInNewYork(now)) {
    return NextResponse.json({ ok: true, skipped: true, reason: "Not 11:00 in America/New_York" });
  }

  try {
    const window = getDailyReportWindow(now);
    const report = await buildDailyReport(window);
    if (dryRun) return NextResponse.json({ ok: true, dryRun: true, summary: report.summary });
    const delivery = await sendDailyReport(report, window.reportDate);
    return NextResponse.json({ ok: true, summary: report.summary, delivery });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Daily report failed";
    console.error("Daily report failed", error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
