// Checks site locale packs lib/locales/<code>.json against the English source pack
// (i18n-source/web.json) and the language registry snapshot (docs/swapspot-africa.md §5):
// JSON validity (flat key -> string), completeness (regional variants: overrides only), no unknown
// keys, no empty strings, identical placeholders, no copies of the English text (brand names
// allowed), script sanity (Ethi, Tfng, Arab, Latn) and length hints (warnings).
//
//   npm run i18n:check -- sw am      (named codes; a missing file is an error)
//   npm run i18n:check               (every lib/locales/*.json; none is fine)
//   options: --source <web.json> --registry <languagesSnapshot.json> --dir <locales dir>
// Exit code 1 when any error is found. Optional sidecar i18n-source/hashes/<code>.json
// ({key: hash}) reports keys translated from an older English text.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkLocalePack } from "./locale-checks.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  if (index < 0) return fallback;
  const value = args[index + 1];
  args.splice(index, 2);
  return value;
};
const sourcePath = option("--source", join(root, "i18n-source/web.json"));
const registryPath = option("--registry", join(root, "lib/languagesSnapshot.json"));
const dir = option("--dir", join(root, "lib/locales"));
const hashDir = option("--hashes", join(root, "i18n-source/hashes"));

const source = JSON.parse(readFileSync(sourcePath, "utf8"));
const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const languages = new Map(registry.languages.map((language) => [language.code, language]));

const files = existsSync(dir) ? readdirSync(dir).filter((file) => file.endsWith(".json")) : [];
const codes = args.length ? args : files.map((file) => file.replace(/\.json$/, ""));

let errorCount = 0;
const summary = [];
for (const code of codes) {
  const file = join(dir, `${code}.json`);
  const errors = [];
  const warnings = [];
  if (!files.includes(`${code}.json`)) {
    // Exact file name (case matters on the Linux build: ar-EG.json, not ar-eg.json).
    errors.push(`${code}: ${file} does not exist`);
  } else {
    const language = languages.get(code);
    if (language && ["en", "es", "ru", "zh-Hans", "ar", "pt", "fr", "ht", "de", "fil", "hi", "bn", "te", "ta", "vi", "th"].includes(code)) {
      errors.push(`${code}: shipped languages keep their TypeScript tables; no locale pack`);
    }
    const hashFile = join(hashDir, `${code}.json`);
    const hashes = existsSync(hashFile) ? JSON.parse(readFileSync(hashFile, "utf8")) : null;
    // Keys whose correct value is identical to English (loanwords, names, abbreviations):
    // i18n-source/allow-identical/<code>.json, a JSON array of keys.
    const allowFile = join(hashDir, "..", "allow-identical", `${code}.json`);
    const allowIdentical = new Set(existsSync(allowFile) ? JSON.parse(readFileSync(allowFile, "utf8")) : []);
    const result = checkLocalePack({ code, text: readFileSync(file, "utf8"), source, language, hashes, allowIdentical });
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    if (language?.parent && !languages.get(language.parent)) errors.push(`${code}: parent ${language.parent} is not registered`);
  }
  for (const message of errors) console.error(`error   ${message}`);
  for (const message of warnings) console.warn(`warning ${message}`);
  errorCount += errors.length;
  summary.push({ code, errors: errors.length, warnings: warnings.length });
}

console.log(JSON.stringify({ checked: summary.length, keys: source.strings.length, summary }));
if (!codes.length) console.log("No locale packs in lib/locales yet.");
process.exit(errorCount ? 1 : 0);
