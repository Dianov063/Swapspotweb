import test from 'node:test';
import assert from 'node:assert/strict';
import { compactDailyReportHtml, prepareDailyReportEmail, reportContentBytes, DAILY_REPORT_CONTENT_LIMIT } from './dailyReportEmail.ts';

const cell = (value) => `<td style="padding:8px;border-bottom:1px solid #e5e7eb;vertical-align:top">${value}</td>`;
const report = (html, text = 'Регистрации: 42\nУслуги: 7\nПоддержка: 3') => ({ subject: 'SwapSpot: отчёт', html, text });
const visible = (html) => html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, '');

test('large tabular report fits while preserving every value, subject and text', () => {
  const html = `<!doctype html><html><body><table>${Array.from({ length: 700 }, (_, i) => `<tr>${cell(`Строка ${i}: 123 ₽ &amp; 456 ₦`)}</tr>`).join('')}</table></body></html>`;
  const original = report(html);
  assert.ok(reportContentBytes(original) > 65536);
  const prepared = prepareDailyReportEmail(original);
  assert.equal(prepared.layout, 'tables');
  assert.ok(reportContentBytes(prepared) <= DAILY_REPORT_CONTENT_LIMIT);
  assert.equal(visible(prepared.html), visible(html));
  assert.equal(prepared.text, original.text);
  assert.equal(prepared.subject, original.subject);
  assert.equal(original.html, html);
  assert.equal(compactDailyReportHtml(prepared.html), prepared.html);
});

test('existing head and unrecognised styles/content survive compaction', () => {
  const html = `<html lang="ru"><head><meta charset="utf-8"></head><body>${cell('42')}<td style="color:red">alert &lt;td style=&quot;x&quot;&gt;</td></body></html>`;
  const result = compactDailyReportHtml(html);
  assert.equal((result.match(/<head>/g) || []).length, 1);
  assert.match(result, /<meta charset="utf-8">/);
  assert.match(result, /<td style="color:red">/);
  assert.equal(visible(result), visible(html));
});

test('oversized markup falls back to the complete escaped report text', () => {
  const original = report(`<html><body><!--${'layout'.repeat(15000)}--></body></html>`, 'Все 42 регистрации\n<script> & "данные"');
  const result = prepareDailyReportEmail(original);
  assert.equal(result.layout, 'text');
  assert.equal(result.text, original.text);
  assert.match(result.html, /Все 42 регистрации/);
  assert.match(result.html, /&lt;script&gt; &amp; &quot;данные&quot;/);
  assert.ok(reportContentBytes(result) < DAILY_REPORT_CONTENT_LIMIT);
});

test('UTF-8 byte budget rejects excessive content without silently truncating data', () => {
  const text = 'Я'.repeat(32000);
  assert.ok(text.length < DAILY_REPORT_CONTENT_LIMIT);
  assert.throws(() => prepareDailyReportEmail(report('<html><body></body></html>', text)), /safe email payload limit/);
});
