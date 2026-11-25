// Read-only inside ledgerhound-web, using its installed SDK and credentials.
// Two GETs, no provider API, no writes, no addresses/keys/bucket names in output.
'use strict';
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const MAX_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 6000;
const now = new Date();
const month = now.toISOString().slice(0, 7);
const configured = Number(process.env.OFAC_MAX_AGE_DAYS);
const maxAgeDays = Number.isFinite(configured) && configured > 0 ? configured : 16;
const s3 = new S3Client({region: process.env.AWS_REGION || 'eu-central-1', maxAttempts: 1,
  credentials: {accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY}});

async function read(key, parse) {
  if (!process.env.AWS_S3_BUCKET) return {state: 'error'};
  const abort = new AbortController();
  let timer;
  const operation = (async () => {
    const response = await s3.send(new GetObjectCommand({Bucket: process.env.AWS_S3_BUCKET, Key: key}), {abortSignal: abort.signal});
    const chunks = [];
    let length = 0;
    for await (const chunk of response.Body) {
      const bytes = Buffer.from(chunk);
      length += bytes.length;
      if (length > MAX_BYTES) { abort.abort(); throw Error('Body too large'); }
      chunks.push(bytes);
    }
    return parse(JSON.parse(Buffer.concat(chunks).toString('utf8')), response);
  })();
  try {
    return await Promise.race([operation, new Promise((_, reject) => {
      timer = setTimeout(() => { abort.abort(); reject(Error('Timed out')); }, TIMEOUT_MS);
    })]);
  } catch (e) {
    return e?.name === 'NoSuchKey' || e?.$metadata?.httpStatusCode === 404 ? {state: 'absent'} : {state: 'error'};
  } finally { clearTimeout(timer); }
}

(async () => {
  const [ofac, counter] = await Promise.all([
    read('ofac-sdn/crypto-addresses.json', (rows, r) => {
      if (!Array.isArray(rows) || !rows.length || !rows.every(e => e != null && typeof e.address === 'string')) return {state: 'unreadable'};
      const modified = r.LastModified instanceof Date ? r.LastModified.getTime() : NaN;
      const newestAdded = rows.reduce((max, e) => Math.max(max, Date.parse(e.added) || 0), 0);
      const asOf = Number.isFinite(modified) ? modified : newestAdded;
      return {state: 'list', entries: rows.length, asOf: asOf > 0 ? new Date(asOf).toISOString() : null};
    }),
    read(`chainabuse-usage/${month}.json`, (row, r) => {
      const ok = row != null && row.month === month && Number.isInteger(row.calls_used) && row.calls_used >= 0
        && typeof r.ETag === 'string' && r.ETag.length > 0;
      return ok ? {state: 'counter', callsUsed: row.calls_used} : {state: 'unreadable'};
    })
  ]);
  console.log(JSON.stringify({checkedAt: now.toISOString(), month, maxAgeDays, ofac, counter}));
})().catch(() => { console.log(JSON.stringify({checkedAt: now.toISOString(), month, ofac: null, counter: null})); process.exitCode = 1; })
  .finally(() => s3.destroy());
