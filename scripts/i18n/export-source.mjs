// Exports the English source pack of the website: i18n-source/web.json (docs/swapspot-africa.md §5).
// One entry per string of every site table (lib/stringTables.ts): key, English text, context
// (file / section), placeholders, max-length hint and a source hash for incremental runs.
// Translators write `lib/locales/<code>.json` = { "<key>": "<translation>", ... }.
//
//   npm run i18n:export            (writes i18n-source/web.json)
//   npm run i18n:export -- --check (exit 1 when web.json is out of date)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND_TERMS, maxLengthHint, placeholders, sourceHash } from "./locale-checks.mjs";

const { englishSource } = await import("../../lib/stringTables.ts");

const output = fileURLToPath(new URL("../../i18n-source/web.json", import.meta.url));
const check = process.argv.includes("--check");

const all = englishSource();
const pack = {
  format: 1,
  source_locale: "en",
  generated_by: "scripts/i18n/export-source.mjs (from lib/stringTables.ts)",
  target: "lib/locales/<code>.json: flat JSON object, key -> translated string; regional variants (ar-EG, pt-AO, sw-KE) contain only the keys that differ from their parent",
  rules: [
    "Keep every placeholder exactly as written: {name}, {count}, {price}, ... ({category} and {categoryLower} are the same variable; use the one that reads naturally).",
    `Brand and product names stay as written: ${BRAND_TERMS.join(", ")}.`,
    "Never return the English text unchanged (except strings made only of brand names); never leave a value empty.",
    "Write in the language's registry script (e.g. Ethiopic for am/ti, Tifinagh for zgh, Arabic for ar-EG/ary).",
    "max_length is a hint for short UI labels; longer translations only produce a warning.",
  ],
  brand_terms: BRAND_TERMS,
  untranslated: all.filter((item) => !item.translate).map((item) => item.key),
  strings: all
    .filter((item) => item.translate)
    .map((item) => ({
      key: item.key,
      text: item.text,
      context: `${item.context} > ${item.key.split(".").slice(1, -1).join(".") || item.key.split(".").at(-1)}`,
      placeholders: placeholders(item.text),
      max_length: maxLengthHint(item.text),
      hash: sourceHash(item.text),
    })),
};
const text = `${JSON.stringify(pack, null, 2)}\n`;

if (check) {
  let current = "";
  try {
    current = readFileSync(output, "utf8").replace(/\r\n/g, "\n");
  } catch {}
  if (current !== text) {
    console.error("i18n-source/web.json is out of date; run: npm run i18n:export");
    process.exit(1);
  }
  console.log(JSON.stringify({ output, strings: pack.strings.length, upToDate: true }));
} else {
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, text);
  console.log(JSON.stringify({ output, strings: pack.strings.length, untranslated: pack.untranslated.length }));
}
