import assert from "node:assert/strict";
import { test } from "node:test";
import { readDirectoryPage } from "../lib/readDirectoryPage.ts";

const dnsFailure = () => new TypeError("fetch failed", { cause: { code: "ENOTFOUND" } });

test("a transient DNS failure recovers on the single retry", async () => {
  let calls = 0;
  const rows = [{ market_slug: "brooklyn" }];
  assert.deepEqual(await readDirectoryPage(async () => {
    if (++calls === 1) throw dnsFailure();
    return Response.json(rows);
  }, async () => {}), rows);
  assert.equal(calls, 2);
});

test("persistent DNS failure rejects rather than replacing a successful snapshot", async () => {
  const rows = [{ market_slug: "brooklyn" }];
  let snapshot = rows;
  let calls = 0;
  const refresh = async () => {
    snapshot = await readDirectoryPage(async () => {
      if (++calls <= 2) throw dnsFailure();
      return Response.json([{ market_slug: "queens" }]);
    }, async () => {});
  };
  await assert.rejects(refresh(), /fetch failed/);
  assert.equal(calls, 2);
  assert.deepEqual(snapshot, rows);
  await refresh();
  assert.deepEqual(snapshot, [{ market_slug: "queens" }]);
});

test("503 retries, 403 does not, and an invalid payload is not a successful empty result", async () => {
  let calls = 0;
  assert.deepEqual(await readDirectoryPage(async () =>
    ++calls === 1 ? new Response(null, { status: 503 }) : Response.json([]), async () => {}), []);
  assert.equal(calls, 2);
  const noRetry = async () => assert.fail("unexpected retry");
  await assert.rejects(readDirectoryPage(async () => new Response(null, { status: 403 }), noRetry), /403/);
  await assert.rejects(readDirectoryPage(async () => Response.json({}), noRetry), /non-array/);
});
