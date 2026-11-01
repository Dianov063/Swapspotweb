// Generates lib/languagesSnapshot.json (the website's fallback copy of the language registry) from
// `services/api/platform_app/swapspot_languages.json` of the App Platform repo (format 1,
// docs/swapspot-africa.md §3). The output has the shape of
// `GET /v1/apps/{slug}/swapspot/languages`: the registry fields the site uses, without notes.
//
//   node scripts/sync-languages-snapshot.mjs <swapspot_languages.json> [output.json]
//   node scripts/sync-languages-snapshot.mjs <swapspot_languages.json> --check   (exit 1 when stale)
import { readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const check = args.includes("--check");
const [registryPath, outputArg] = args.filter((arg) => arg !== "--check");
if (!registryPath) {
  console.error("Usage: node scripts/sync-languages-snapshot.mjs <swapspot_languages.json> [output.json] [--check]");
  process.exit(2);
}
const output = resolve(outputArg || fileURLToPath(new URL("../lib/languagesSnapshot.json", import.meta.url)));
const registry = JSON.parse(readFileSync(registryPath, "utf8"));
if (registry.format !== 1 || !Array.isArray(registry.languages)) {
  throw new Error(`Unsupported registry: expected format 1 with a languages array, got format ${registry.format}`);
}

const CODE = /^[a-z]{2,3}(-[A-Z][a-z]{3})?(-(?:[A-Z]{2}|\d{3}))?$/;
const STATUSES = ["production", "draft", "machine", "reviewed"];
const codes = new Set(registry.languages.map((language) => language.code));
const fail = (code, message) => {
  throw new Error(`Language ${code}: ${message}`);
};

const languages = registry.languages.map((language) => {
  const { code } = language;
  if (!CODE.test(code ?? "")) fail(code, "code must be a BCP 47 tag (language[-Script][-REGION])");
  if (!STATUSES.includes(language.status)) fail(code, `unknown status ${language.status}`);
  if (!["ltr", "rtl"].includes(language.dir)) fail(code, `dir must be ltr or rtl, got ${language.dir}`);
  if (typeof language.public !== "boolean") fail(code, "public must be a boolean");
  if (language.parent && !codes.has(language.parent)) fail(code, `parent ${language.parent} is not registered`);
  if (!language.native_name || !language.english_name) fail(code, "english_name and native_name are required");
  return {
    code,
    english_name: language.english_name,
    native_name: language.native_name,
    script: language.script,
    dir: language.dir,
    parent: language.parent ?? null,
    wave: language.wave ?? null,
    status: language.status,
    public: language.public,
  };
});
if (!codes.has("en")) throw new Error("The registry must contain en");

const snapshot = {
  format: 1,
  updated_at: null,
  generated_from: basename(registryPath),
  languages,
};
const text = `${JSON.stringify(snapshot, null, 2)}\n`;

if (check) {
  let current = "";
  try {
    current = readFileSync(output, "utf8").replace(/\r\n/g, "\n");
  } catch {}
  if (current !== text) {
    console.error(`${output} is out of date; run: node scripts/sync-languages-snapshot.mjs ${registryPath}`);
    process.exit(1);
  }
  console.log(JSON.stringify({ output, languages: languages.length, upToDate: true }));
} else {
  writeFileSync(output, text);
  console.log(
    JSON.stringify({
      output,
      languages: languages.length,
      public: languages.filter((language) => language.public).map((language) => language.code),
    }),
  );
}
