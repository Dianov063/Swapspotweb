// Every translated string table must be complete in all 16 site locales: no missing or empty key,
// same placeholders as English, same list lengths. Run with `npm run test:intl`.
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { test } from "node:test";

import { locales } from "../lib/locales.ts";
import { clientPricingCopy, passPriceCopy } from "../lib/pricingCopy.ts";
import { storeBadgeCopy } from "../lib/storeBadges.ts";
import { PRICE_WORDS } from "../lib/priceFormat.ts";

const directoryDir = new URL("../lib/directoryStrings/", import.meta.url);
const directory = {};
for (const locale of locales) {
  const module = await import(new URL(`${locale}.ts`, directoryDir));
  directory[locale] = module[locale];
}

const placeholders = (value) => [...new Set(String(value).match(/\{\w+\}/g) ?? [])].sort();
// {category} and {categoryLower} are the same variable in two spellings (case is per language).
const normalized = (value) => placeholders(value).map((item) => (item === "{categoryLower}" ? "{category}" : item));

/** Walks `reference` and checks that `actual` has the same shape with non-empty strings. */
function assertSameShape(actual, reference, path, { checkPlaceholders = false } = {}) {
  if (typeof reference === "string") {
    assert.equal(typeof actual, "string", `${path} is missing`);
    assert.ok(actual.trim().length > 0, `${path} is empty`);
    if (checkPlaceholders) assert.deepEqual(normalized(actual), normalized(reference), `${path} placeholders`);
    return;
  }
  if (Array.isArray(reference)) {
    assert.ok(Array.isArray(actual), `${path} is missing`);
    assert.equal(actual.length, reference.length, `${path} length`);
    reference.forEach((item, index) => assertSameShape(actual[index], item, `${path}[${index}]`, { checkPlaceholders }));
    return;
  }
  assert.equal(typeof actual, "object", `${path} is missing`);
  assert.ok(actual, `${path} is missing`);
  assert.deepEqual(Object.keys(actual).sort(), Object.keys(reference).sort(), `${path} keys`);
  for (const key of Object.keys(reference)) {
    assertSameShape(actual[key], reference[key], `${path}.${key}`, { checkPlaceholders });
  }
}

test("one directory string file per site locale and nothing else", () => {
  const files = readdirSync(directoryDir).filter((file) => file !== "index.ts").sort();
  assert.deepEqual(files, locales.map((locale) => `${locale}.ts`).sort());
});

for (const [name, table, options] of [
  ["directoryStrings", directory, { checkPlaceholders: true }],
  ["clientPricingCopy", clientPricingCopy, {}],
  ["passPriceCopy", passPriceCopy, {}],
  ["storeBadgeCopy", storeBadgeCopy, {}],
  ["PRICE_WORDS", PRICE_WORDS, { checkPlaceholders: true }],
]) {
  test(`${name} is complete in all ${locales.length} locales`, () => {
    assert.deepEqual(Object.keys(table).sort(), [...locales].sort(), `${name} locales`);
    for (const locale of locales) assertSameShape(table[locale], table.en, `${name}.${locale}`, options);
  });
}

test("pricing and store button copy is translated, not an English fallback", () => {
  // Product and store names stay as written; everything else must differ from English.
  const keepAsIs = new Set(["Client Pro"]);
  const strings = (value) =>
    typeof value === "string" ? [value] : Object.values(value ?? {}).flatMap((item) => strings(item));
  for (const [name, table] of [
    ["clientPricingCopy", clientPricingCopy],
    ["passPriceCopy", passPriceCopy],
    ["storeBadgeCopy", storeBadgeCopy],
  ]) {
    const english = new Set(strings(table.en).filter((value) => !keepAsIs.has(value)));
    for (const locale of locales.filter((item) => item !== "en")) {
      const leaked = strings(table[locale]).filter((value) => english.has(value));
      assert.deepEqual(leaked, [], `${name}.${locale} still has English text`);
    }
  }
});
