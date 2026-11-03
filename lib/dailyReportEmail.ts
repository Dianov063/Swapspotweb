// MailHub /api/v1/events accepts 64 KiB. Reserve 4 KiB for its event envelope.
export const DAILY_REPORT_CONTENT_LIMIT = 60 * 1024;

type ReportContent = { subject: string; html: string; text: string };
const CELL_STYLE = 'padding:8px;border-bottom:1px solid #e5e7eb;vertical-align:top';
const HEADER_STYLE = 'text-align:left;padding:8px;border-bottom:2px solid #d1d5db';
const TABLE_STYLE = 'width:100%;border-collapse:collapse;font-size:13px';
const STYLE_MARKER = '<style id="swapspot-report-tables">';
const SHARED_STYLES = `${STYLE_MARKER}.rtd{${CELL_STYLE}}.rth{${HEADER_STYLE}}.rt{${TABLE_STYLE}}</style>`;

/** Move only the renderer's repeated table styles; keep all cells and values. */
export function compactDailyReportHtml(html: string): string {
  if (html.includes(STYLE_MARKER) || !/<html(?:\s[^>]*)?>/i.test(html)) return html;
  const compact = html
    .replaceAll(`<td style="${CELL_STYLE}">`, '<td class="rtd">')
    .replaceAll(`<th style="${HEADER_STYLE}">`, '<th class="rth">')
    .replaceAll(`<table style="${TABLE_STYLE}">`, '<table class="rt">');
  if (compact === html) return html;
  if (/<head(?:\s[^>]*)?>/i.test(compact)) {
    return compact.replace(/<head(?:\s[^>]*)?>/i, (head) => `${head}${SHARED_STYLES}`);
  }
  return compact.replace(/<html(?:\s[^>]*)?>/i, (tag) => `${tag}<head>${SHARED_STYLES}</head>`);
}

export function reportContentBytes(report: ReportContent): number {
  return new TextEncoder().encode(JSON.stringify({ subject: report.subject, html: report.html, text: report.text })).byteLength;
}

function escapeHtml(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

export function prepareDailyReportEmail(report: ReportContent): ReportContent & { layout: 'tables' | 'text' } {
  const compact = { subject: report.subject, html: compactDailyReportHtml(report.html), text: report.text };
  if (reportContentBytes(compact) <= DAILY_REPORT_CONTENT_LIMIT) return { ...compact, layout: 'tables' };

  // All report statistics also exist in its text version. Preserve that entire
  // version in both MIME parts if HTML tables still exceed the transport budget.
  const plain = { ...compact, html: `<!doctype html><html><body><pre style="white-space:pre-wrap;overflow-wrap:anywhere;font:14px Arial,sans-serif">${escapeHtml(report.text)}</pre></body></html>` };
  const bytes = reportContentBytes(plain);
  if (bytes > DAILY_REPORT_CONTENT_LIMIT) {
    throw new Error(`Daily report exceeds the safe email payload limit after lossless formatting (${bytes} bytes)`);
  }
  return { ...plain, layout: 'text' };
}
