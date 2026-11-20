// No network or AWS dependency: run the real reader with a read-only SDK double.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('./ledgerhound-read.cjs', import.meta.url), 'utf8');
const month = new Date().toISOString().slice(0, 7);
const list = [{address: '0xfictional', added: '2026-11-15T00:00:00Z'}];
const buffer = text => ({async *[Symbol.asyncIterator]() {yield Buffer.from(text);}});

async function run({ofac = list, counter, noBucket = false, noDate = false, etag = '"v1"', fail,
                    code = source, body, override = undefined} = {}) {
  const calls = [], output = [], options = [];
  let destroyed = false;
  class GetObjectCommand { constructor(input) {this.input = input;} }
  class S3Client {
    constructor(config) {options.push(config);}
    async send(command, opts) {
      assert.ok(command instanceof GetObjectCommand);
      calls.push(command.input);
      if (fail) throw fail;
      if (command.input.Key.startsWith('ofac-')) {
        return {Body: body || buffer(JSON.stringify(ofac)), ...(noDate ? {} : {LastModified: new Date('2026-11-16T06:00:03Z')})};
      }
      if (counter === undefined) throw Object.assign(Error('do-not-output-secret'), {name: 'NoSuchKey'});
      return {Body: buffer(typeof counter === 'string' ? counter : JSON.stringify(counter)), ETag: etag};
    }
    destroy() {destroyed = true;}
  }
  const context = {require(name) {
    assert.equal(name, '@aws-sdk/client-s3');
    return {S3Client, GetObjectCommand};
  }, process: {env: {AWS_S3_BUCKET: noBucket ? '' : 'secret-bucket', AWS_ACCESS_KEY_ID: 'secret-key',
     AWS_SECRET_ACCESS_KEY: 'secret-credential', ...(override !== undefined ? {OFAC_MAX_AGE_DAYS: override} : {})}},
     console: {log(line) {output.push(JSON.parse(line));}}, Date, Buffer, AbortController, setTimeout, clearTimeout};
  await vm.runInNewContext(code, context);
  assert.equal(output.length, 1);
  assert.equal(destroyed, true);
  assert.ok(!JSON.stringify(output).includes('secret'));
  return {out: output[0], calls, options};
}

test('only two GETs; absent monthly counter is normal; no secrets or addresses', async () => {
  const {out, calls, options} = await run();
  assert.deepEqual(calls.map(x => x.Key), ['ofac-sdn/crypto-addresses.json', `chainabuse-usage/${month}.json`]);
  assert.equal(out.ofac.state, 'list'); assert.equal(out.ofac.entries, 1); assert.equal(out.counter.state, 'absent');
  assert.equal(out.month, month); assert.equal(out.maxAgeDays, 16);
  assert.equal(options[0].maxAttempts, 1);
  assert.ok(!JSON.stringify(out).includes('0xfictional'));
});
test('current month and version are required for the counter', async () => {
  const valid = {month, calls_used: 8};
  assert.equal((await run({counter: valid})).out.counter.callsUsed, 8);
  for (const counter of [{month: '2000-01', calls_used: 0}, {month, calls_used: -1}, {month, calls_used: true},
                         {month, calls_used: '0'}, {month}, 'not JSON', null]) {
    assert.notEqual((await run({counter})).out.counter.state, 'counter');
  }
  assert.equal((await run({counter: valid, etag: ''})).out.counter.state, 'unreadable');
});
test('empty, non-array and malformed entries never look like an OFAC list', async () => {
  for (const ofac of [[], {}, [null], [{currency:'ETH'}], [{address:5}]]) {
    assert.equal((await run({ofac})).out.ofac.state, 'unreadable');
  }
});
test('unreadable JSON and interrupted streams are unavailable', async () => {
  assert.equal((await run({body: buffer('not JSON')})).out.ofac.state, 'error');
  const body = {async *[Symbol.asyncIterator]() {yield Buffer.from('[');throw Error('secret');}};
  assert.equal((await run({body})).out.ofac.state, 'error');
});
test('content is bounded to 2 MiB', async () => {
  assert.equal((await run({body: buffer('x'.repeat(2 * 1024 * 1024 + 1))})).out.ofac.state, 'error');
});
test('network, KMS, timeout and access errors never become healthy missing data', async () => {
  for (const name of ['AccessDenied', 'KMSAccessDeniedException', 'TimeoutError', 'InternalError']) {
    const {out} = await run({fail: Object.assign(Error('secret'), {name})});
    assert.equal(out.ofac.state, 'error'); assert.equal(out.counter.state, 'error');
  }
});
test('missing bucket never sends a request', async () => {
  const {out, calls} = await run({noBucket:true});
  assert.equal(calls.length, 0); assert.equal(out.counter.state,'error');
});
test('OFAC without LastModified uses newest added date just like the app loader', async () => {
  assert.equal((await run({noDate:true})).out.ofac.asOf, '2026-11-15T00:00:00.000Z');
  assert.equal((await run({noDate:true, ofac:[{address:'x'}]})).out.ofac.asOf, null);
});
test('configured OFAC age is reported; invalid overrides use the application default', async () => {
  assert.equal((await run({override:'2'})).out.maxAgeDays, 2);
  for (const override of ['NaN','0','-1']) assert.equal((await run({override})).out.maxAgeDays,16);
});
test('a hung stream has a whole-operation deadline', async () => {
  const body = {async *[Symbol.asyncIterator]() {await new Promise(() => {});}};
  const code = source.replace('const TIMEOUT_MS = 6000;', 'const TIMEOUT_MS = 5;');
  assert.equal((await run({body, code})).out.ofac.state, 'error');
});
